from __future__ import annotations

from io import BytesIO
from pathlib import Path
import importlib.util
import json
import sys
import tempfile

from werkzeug.datastructures import FileStorage


ROOT = Path(__file__).resolve().parents[1]
SERVICE_PATH = ROOT / "portfolio-manager" / "hiring_guide_service.py"
ROUTES_PATH = ROOT / "portfolio-manager" / "hiring_guide_routes.py"
APP_PATH = ROOT / "portfolio-manager" / "app.py"
DASHBOARD = ROOT / "portfolio-manager" / "templates" / "dashboard.html"
WORKSPACE = ROOT / "portfolio-manager" / "templates" / "hiring-guide-library.html"
EDITOR = ROOT / "portfolio-manager" / "templates" / "hiring-guide-editor.html"
EVIDENCE_EDITOR = ROOT / "portfolio-manager" / "templates" / "hiring-guide-evidence.html"
CSS = ROOT / "portfolio-manager" / "static" / "hiring-guide-manager.css"
GITIGNORE = ROOT / ".gitignore"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def load_service():
    sys.path.insert(0, str(ROOT / "portfolio-manager"))
    spec = importlib.util.spec_from_file_location("hiring_guide_service_test", SERVICE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load Hiring Guide service.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sample_library() -> dict:
    return {
        "version": "1.0",
        "purpose": "Hiring Guide / hiring-manager assistant content library",
        "voice_rules": [
            "Write in first person.",
            "Do not make unsupported claims.",
        ],
        "evidence": [
            {
                "id": "EV-01",
                "title": "Demonstrated project",
                "status": "demonstrated",
                "proves": ["instructional design ownership"],
            },
            {
                "id": "EV-15",
                "title": "Emerging AI work",
                "status": "emerging",
                "proves": ["AI interaction design"],
            },
        ],
        "qa": [
            {
                "id": "HG-ABOUT-01",
                "category": "Professional identity",
                "question": "Tell me about yourself.",
                "answer": "I design learning experiences.",
                "evidence_ids": ["EV-01"],
                "tags": ["career-story"],
                "source": "voice interview",
                "confidence": "high",
                "variants": ["Walk me through your background."],
                "followups": [],
                "notes": "",
            }
        ],
        "conversation_rules": {
            "default_answer_shape": ["Answer directly."],
            "claim_rules": ["Do not invent metrics."],
        },
    }


def main() -> int:
    errors: list[str] = []

    for path in [SERVICE_PATH, ROUTES_PATH, APP_PATH, DASHBOARD, WORKSPACE, EDITOR, EVIDENCE_EDITOR, CSS, GITIGNORE]:
        require(path.exists(), f"Missing Hiring Guide Manager file: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    service_text = SERVICE_PATH.read_text(encoding="utf-8")
    routes_text = ROUTES_PATH.read_text(encoding="utf-8")
    app_text = APP_PATH.read_text(encoding="utf-8")
    dashboard_text = DASHBOARD.read_text(encoding="utf-8")
    workspace_text = WORKSPACE.read_text(encoding="utf-8")
    editor_text = EDITOR.read_text(encoding="utf-8")
    evidence_text = EVIDENCE_EDITOR.read_text(encoding="utf-8")
    gitignore_text = GITIGNORE.read_text(encoding="utf-8")

    for marker in [
        'PRIVATE_ROOT / "hiring-guide"',
        'LIBRARY_PATH = HIRING_ROOT / "library.json"',
        'BACKUP_ROOT = HIRING_ROOT / "backups"',
        "validate_library",
        "import_library",
        "create_qa",
        "update_qa",
        "delete_qa",
        "update_evidence",
    ]:
        require(marker in service_text, f"Hiring Guide service missing marker {marker!r}.", errors)

    for forbidden in ['REPO_ROOT / "portfolio"', 'REPO_ROOT / "portfolio-data"', "git push", "subprocess"]:
        require(forbidden not in service_text, f"Hiring Guide service must not own public/Git writes: {forbidden!r}.", errors)

    for marker in [
        'url_prefix="/hiring-guide-library"',
        "@hiring_guide_bp.post(\"/import\")",
        '@hiring_guide_bp.get("/qa/new")',
        '@hiring_guide_bp.post("/qa/<qa_id>")',
        '@hiring_guide_bp.get("/evidence/<evidence_id>")',
        "send_file",
    ]:
        require(marker in routes_text, f"Hiring Guide routes missing {marker!r}.", errors)

    require("hiring_guide_bp" in app_text and "register_blueprint(hiring_guide_bp)" in app_text, "Portfolio Manager app must register Hiring Guide blueprint.", errors)
    require("Open Hiring Guide Library" in dashboard_text, "Dashboard must link to Hiring Guide Library.", errors)

    for marker in [
        "Private Manager workspace",
        "Import Private Library",
        "Find the answer you want to work on",
        "Evidence index",
        "Voice + conversation rules",
        "Nothing was written to the public portfolio",
    ]:
        require(marker in workspace_text or marker in routes_text, f"Hiring Guide workspace missing {marker!r}.", errors)

    for marker in ["Canonical answer", "Evidence IDs", "Question variants", "Suggested follow-ups", "Editorial / implementation notes"]:
        require(marker in editor_text, f"Hiring Guide editor missing {marker!r}.", errors)

    for marker in ["What this evidence supports", "Capabilities / claims supported", "Used by"]:
        require(marker in evidence_text, f"Hiring Guide evidence editor missing {marker!r}.", errors)

    require(".portfolio-manager/" in gitignore_text, ".portfolio-manager/ must remain Git-ignored.", errors)

    if errors:
        print("Hiring Guide Manager static contract failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    service = load_service()

    with tempfile.TemporaryDirectory() as tmp:
        private_root = Path(tmp) / ".portfolio-manager"
        service.HIRING_ROOT = private_root / "hiring-guide"
        service.LIBRARY_PATH = service.HIRING_ROOT / "library.json"
        service.SOURCE_MARKDOWN_PATH = service.HIRING_ROOT / "source-library.md"
        service.BACKUP_ROOT = service.HIRING_ROOT / "backups"

        payload = sample_library()
        normalized = service.validate_library(payload)
        require(len(normalized["qa"]) == 1, "Sample library should preserve Q&A.", errors)
        require(len(normalized["evidence"]) == 2, "Sample library should preserve evidence.", errors)

        upload = FileStorage(
            stream=BytesIO(json.dumps(payload).encode("utf-8")),
            filename="hiring-guide.json",
            content_type="application/json",
        )
        markdown = FileStorage(
            stream=BytesIO(b"# Hiring Guide\n"),
            filename="hiring-guide.md",
            content_type="text/markdown",
        )
        imported = service.import_library(upload, markdown)
        require(service.LIBRARY_PATH.exists(), "Import must store canonical JSON in private Hiring Guide root.", errors)
        require(service.SOURCE_MARKDOWN_PATH.exists(), "Import should preserve optional Markdown source privately.", errors)
        require(imported["qa"][0]["id"] == "HG-ABOUT-01", "Imported Q&A ID changed unexpectedly.", errors)

        service.update_qa("HG-ABOUT-01", {
            "category": "Professional identity",
            "question": "Tell me about yourself.",
            "answer": "I design learning experiences and systems.",
            "evidence_ids": "EV-01",
            "tags": "career-story, instructional-design",
            "source": "voice interview",
            "confidence": "high",
            "variants": "Walk me through your background.",
            "followups": "What kind of work do you enjoy most?",
            "notes": "",
            "review_status": "canonical",
        })
        require(service.backup_count() >= 1, "Editing a Q&A must create a private backup.", errors)
        reloaded = service.load_library()
        require("systems" in reloaded["qa"][0]["answer"], "Edited answer was not persisted.", errors)

        service.update_evidence("EV-15", {
            "title": "Emerging AI work",
            "status": "emerging",
            "proves": "AI interaction design\nknowledge architecture",
        })
        reloaded = service.load_library()
        require(service.get_evidence(reloaded, "EV-15")["status"] == "emerging", "Evidence status update failed.", errors)

        try:
            broken = sample_library()
            broken["qa"][0]["evidence_ids"] = ["EV-DOES-NOT-EXIST"]
            service.validate_library(broken)
        except service.HiringGuideLibraryError:
            pass
        else:
            errors.append("Validation must reject Q&A records that reference unknown evidence IDs.")

        created = service.create_qa({
            "category": "Ways of working",
            "question": "How do you work?",
            "answer": "I start with the problem.",
            "evidence_ids": "EV-01",
            "tags": "working-style",
            "source": "voice interview",
            "confidence": "high",
            "variants": "",
            "followups": "",
            "notes": "",
            "review_status": "draft",
        })
        require(created["id"].startswith("HG-CUSTOM-"), "New Q&A should receive a stable generated ID.", errors)

        service.delete_qa(created["id"])
        require(all(item["id"] != created["id"] for item in service.load_library()["qa"]), "Deleted Q&A still exists.", errors)

    if errors:
        print("Hiring Guide Manager validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Hiring Guide Manager validation passed: private import/storage, Q&A/evidence editing, evidence-link validation, backups, and public-write boundaries are intact.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
