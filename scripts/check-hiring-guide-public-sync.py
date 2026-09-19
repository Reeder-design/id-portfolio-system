from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import importlib
import json
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
SYNC_PATH = ROOT / "portfolio-manager" / "hiring_guide_public_sync.py"
ROUTES_PATH = ROOT / "portfolio-manager" / "hiring_guide_routes.py"
TEMPLATE_PATH = ROOT / "portfolio-manager" / "templates" / "hiring-guide-public-sync.html"
LIBRARY_TEMPLATE = ROOT / "portfolio-manager" / "templates" / "hiring-guide-library.html"
CSS_PATH = ROOT / "portfolio-manager" / "static" / "hiring-guide-manager.css"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def sample_private_library() -> dict:
    return {
        "version": "1.0",
        "purpose": "Hiring Guide / hiring-manager assistant content library",
        "voice_rules": ["Use evidence."],
        "evidence": [
            {
                "id": "EV-01",
                "title": "Cellular Networking Sales Certification",
                "status": "demonstrated",
                "proves": ["end-to-end instructional design ownership"],
            },
            {
                "id": "EV-15",
                "title": "AI-Integrated Portfolio / Hiring Guide Development",
                "status": "emerging",
                "proves": ["grounded assistant behavior"],
            },
        ],
        "qa": [
            {
                "id": "HG-ABOUT-01",
                "category": "Professional identity",
                "question": "Tell me about yourself.",
                "answer": "New private canonical answer.",
                "evidence_ids": ["EV-01"],
                "tags": ["career-story"],
                "source": "voice interview",
                "confidence": "high",
                "variants": ["Walk me through your background."],
                "followups": ["Are you building AI into learning experiences?"],
                "notes": "",
                "review_status": "canonical",
            },
            {
                "id": "HG-AI-03",
                "category": "AI",
                "question": "Are you building AI into learning experiences?",
                "answer": "I am actively developing that capability.",
                "evidence_ids": ["EV-15"],
                "tags": ["ai-learning-integration"],
                "source": "current development",
                "confidence": "high",
                "variants": [],
                "followups": [],
                "notes": "Always frame as emerging/current development.",
                "review_status": "canonical",
            },
            {
                "id": "HG-DRAFT-01",
                "category": "Draft",
                "question": "Do not publish this.",
                "answer": "Draft answer.",
                "evidence_ids": [],
                "tags": [],
                "source": "draft",
                "confidence": "low",
                "variants": [],
                "followups": [],
                "notes": "",
                "review_status": "draft",
            },
        ],
        "conversation_rules": {"claim_rules": ["Do not invent metrics."]},
    }


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    errors: list[str] = []

    for path in [SYNC_PATH, ROUTES_PATH, TEMPLATE_PATH, LIBRARY_TEMPLATE, CSS_PATH]:
        require(path.exists(), f"Missing public-sync file: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    sync_text = SYNC_PATH.read_text(encoding="utf-8")
    routes_text = ROUTES_PATH.read_text(encoding="utf-8")
    template_text = TEMPLATE_PATH.read_text(encoding="utf-8")
    library_template_text = LIBRARY_TEMPLATE.read_text(encoding="utf-8")

    for marker in [
        "build_proposal",
        "test_routing",
        "apply_proposal",
        "preserved_legacy_questions",
        "removed_public_questions",
        "run_full_validation",
        "APPLY PUBLIC HIRING GUIDE",
        "MAPPING_OVERRIDES_PATH",
        "save_mapping_override",
        "_proposal_is_renderable",
        "mapping_review_required",
        "_restore_backup",
        "_proposal_is_fresh",
    ]:
        require(marker in sync_text, f"Public sync service missing {marker!r}.", errors)

    for forbidden in [
        "git push",
        "git commit",
        "portfolio-data/",
        "OPENAI_API_KEY",
        "requests.post",
        "urllib.request",
    ]:
        require(forbidden not in sync_text, f"Public sync must remain deterministic/local-only: {forbidden!r}.", errors)

    for marker in [
        '@hiring_guide_bp.get("/public-sync")',
        '@hiring_guide_bp.post("/public-sync/preview")',
        '@hiring_guide_bp.post("/public-sync/mapping")',
        '@hiring_guide_bp.post("/public-sync/test-routing")',
        '@hiring_guide_bp.post("/public-sync/apply")',
    ]:
        require(marker in routes_text, f"Public sync routes missing {marker!r}.", errors)

    for marker in [
        "Public Sync Preview",
        "Generate Public Sync Preview",
        "Mapping health",
        "Resolve likely duplicates",
        "Keep as Separate New Question",
        "New public questions by category",
        "Routing simulator",
        "Apply Public Sync Locally + Validate",
        "This still does not publish",
    ]:
        require(marker in template_text, f"Public sync UI missing {marker!r}.", errors)

    require("Preview Public Sync" in library_template_text, "Private library must link to Public Sync Preview.", errors)
    require('group.items' not in template_text, "Jinja grouped sync data must use bracket access; group.items resolves to dict.items and breaks rendering.", errors)
    require('group["items"]' in template_text, "Grouped sync template must render list values with bracket access.", errors)

    if errors:
        print("Hiring Guide public sync static contract failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    sys.path.insert(0, str(ROOT / "portfolio-manager"))
    sync = importlib.import_module("hiring_guide_public_sync")

    with tempfile.TemporaryDirectory() as tmp:
        temp = Path(tmp)
        faq = temp / "portfolio" / "data" / "hiring-faq.json"
        expanded = temp / "portfolio" / "data" / "hiring-faq-expanded.json"
        specialist = temp / "portfolio" / "data" / "hiring-faq-specialist.json"
        search = temp / "portfolio" / "data" / "hiring-search.json"
        sync_root = temp / ".portfolio-manager" / "hiring-guide" / "public-sync"

        write_json(faq, {
            "version": "1.0.0",
            "questions": [
                {
                    "id": "about-me",
                    "category": "Background",
                    "short_label": "Tell me about yourself",
                    "prompt": "Tell me about yourself and your background in instructional design.",
                    "featured": True,
                    "keywords": ["about", "background", "career"],
                    "answer": "Old public answer.",
                    "evidence": [
                        {
                            "title": "Enterprise Sales Certification Pathway",
                            "path": "projects/instructional-design/complete-learning-paths/enterprise-sales-certification/index.html",
                            "note": "Public certification evidence.",
                        }
                    ],
                    "followups": [],
                },
                {
                    "id": "legacy-only",
                    "category": "Legacy",
                    "short_label": "Legacy question",
                    "prompt": "A legacy public question with no private equivalent?",
                    "featured": False,
                    "keywords": ["legacy"],
                    "answer": "Keep me.",
                    "evidence": [],
                    "followups": [],
                },
                {
                    "id": "ai-learning-old",
                    "category": "AI",
                    "short_label": "AI in learning design",
                    "prompt": "Are you using AI in learning design?",
                    "featured": False,
                    "keywords": ["AI", "learning design"],
                    "answer": "Older public AI answer.",
                    "evidence": [],
                    "followups": [],
                },
            ],
        })
        write_json(expanded, {"version": "1.0.0", "questions": []})
        write_json(specialist, {"version": "1.0.0", "questions": []})
        write_json(search, {
            "version": "1.0.0",
            "entries": [
                {
                    "title": "Enterprise Sales Certification Pathway",
                    "path": "projects/instructional-design/complete-learning-paths/enterprise-sales-certification/index.html",
                    "summary": "Public certification evidence.",
                    "keywords": ["certification"],
                },
                {
                    "title": "Hiring Manager",
                    "path": "hiring-manager/index.html",
                    "summary": "Public hiring guide.",
                    "keywords": ["hiring"],
                },
            ],
        })

        sync.PUBLIC_FAQ_PATH = faq
        sync.PUBLIC_EXPANDED_PATH = expanded
        sync.PUBLIC_SPECIALIST_PATH = specialist
        sync.PUBLIC_SEARCH_PATH = search
        sync.SYNC_ROOT = sync_root
        sync.PROPOSAL_PATH = sync_root / "proposal.json"
        sync.BACKUP_ROOT = sync_root / "backups"
        sync.MAPPING_OVERRIDES_PATH = sync_root / "mapping-overrides.json"
        sync.load_library = lambda: deepcopy(sample_private_library())

        # Older preview schemas are disposable and must never crash the newer review UI.
        sync.SYNC_ROOT.mkdir(parents=True, exist_ok=True)
        sync.PROPOSAL_PATH.write_text(json.dumps({
            "schema_version": "1.0",
            "summary": {"matched_existing": 1},
            "matches": [],
            "diff": {"added": [], "changed": [], "removed": []},
            "outputs": {},
        }), encoding="utf-8")
        require(sync.load_proposal() is None, "Old public-sync proposal schema must be ignored instead of rendered.", errors)

        proposal = sync.build_proposal()
        summary = proposal["summary"]
        require(summary["private_canonical"] == 2, "Draft private Q&A must be excluded from public sync.", errors)
        require(summary["matched_existing"] == 1, "About Q&A should confidently match the legacy public record.", errors)
        require(summary["mapping_review_required"] == 1, "Likely conceptual overlap should require mapping review.", errors)
        require(summary["new_public_questions"] == 1, "Unresolved overlap should remain staged as new until reviewed.", errors)
        require(summary["removed_public_questions"] == 0, "Public sync must preserve unmatched legacy records.", errors)
        require(not summary["apply_ready"], "Unresolved mapping review must block apply readiness.", errors)

        try:
            sync.apply_proposal(sync.APPLY_CONFIRMATION)
        except sync.HiringGuidePublicSyncError as exc:
            require("mapping" in str(exc).lower(), "Blocked apply should explain unresolved mapping review.", errors)
        else:
            errors.append("Unresolved mapping review must block applying the proposal.")

        # Manual mapping resolves the likely duplicate and persists privately.
        sync.save_mapping_override("HG-AI-03", "match", "ai-learning-old")
        require(sync.MAPPING_OVERRIDES_PATH.exists(), "Manual mapping should persist in private sync state.", errors)
        proposal = sync.build_proposal()
        summary = proposal["summary"]
        require(summary["mapping_review_required"] == 0, "Manual mapping should resolve mapping review.", errors)
        require(summary["matched_existing"] == 2, "Manual mapping should count as an existing public match.", errors)
        require(summary["manual_decisions"] == 1, "Manual mapping decision should be reported.", errors)
        require(summary["new_public_questions"] == 0, "Manual mapping should prevent duplicate new public question.", errors)
        require(summary["apply_ready"], "Resolved non-destructive proposal should be ready for routing/apply.", errors)

        core_questions = proposal["outputs"]["hiring-faq.json"]["questions"]
        expanded_questions = proposal["outputs"]["hiring-faq-expanded.json"]["questions"]
        all_questions = [*core_questions, *expanded_questions]
        by_id = {item["id"]: item for item in all_questions}

        require(by_id["about-me"]["answer"] == "New private canonical answer.", "Matched public answer was not updated.", errors)
        require(by_id["legacy-only"]["answer"] == "Keep me.", "Unmatched legacy public question was not preserved.", errors)
        require(by_id["ai-learning-old"]["answer"] == "I am actively developing that capability.", "Manual mapping did not update selected public record.", errors)
        require(by_id["about-me"]["followups"] == ["ai-learning-old"], "Natural-language private follow-up was not resolved to the manually mapped public ID.", errors)

        serialized = json.dumps(proposal["outputs"])
        for private_field in ["source", "confidence", "variants", "notes", "review_status", "evidence_ids", "_private_id"]:
            require(f'"{private_field}"' not in serialized, f"Editorial field leaked into proposed public output: {private_field}.", errors)

        require(any("emerging evidence" in warning for warning in proposal["warnings"]), "Emerging evidence must produce a human-review warning.", errors)
        require(any("editorial notes" in warning for warning in proposal["warnings"]), "Private editorial notes must produce a review warning.", errors)

        routing = sync.test_routing("tell me about your background", proposal)
        require(bool(routing) and routing[0]["id"] == "about-me", "Routing simulator did not rank the expected public question first.", errors)

        # A manual "new" choice is also remembered and can return to automatic mode.
        sync.save_mapping_override("HG-AI-03", "new")
        proposal_new = sync.build_proposal()
        require(proposal_new["summary"]["mapping_review_required"] == 0, "Confirmed separate/new should resolve review.", errors)
        require(proposal_new["summary"]["new_public_questions"] == 1, "Confirmed separate/new should stage a new public record.", errors)
        sync.save_mapping_override("HG-AI-03", "match", "ai-learning-old")
        proposal = sync.build_proposal()

        # Successful local apply writes only the two FAQ files and marks the proposal applied.
        sync.run_full_validation = lambda: (True, "PASS")
        success, message, applied = sync.apply_proposal(sync.APPLY_CONFIRMATION)
        require(success, f"Expected successful local apply, got: {message}", errors)
        require(applied["status"] == "applied-local", "Successful apply should mark private proposal applied-local.", errors)
        require(json.loads(faq.read_text(encoding="utf-8"))["questions"][0]["answer"] == "New private canonical answer.", "Successful apply did not write proposed core FAQ.", errors)

        # A changed public source invalidates the old proposal.
        stale = json.loads(faq.read_text(encoding="utf-8"))
        stale["questions"][0]["answer"] = "Changed after preview."
        write_json(faq, stale)
        try:
            sync.apply_proposal(sync.APPLY_CONFIRMATION)
        except sync.HiringGuidePublicSyncError as exc:
            require("changed after this preview" in str(exc), "Stale proposal error should explain source drift.", errors)
        else:
            errors.append("Stale public source must block applying an old proposal.")

        # Fresh preview + failed validation must restore prior files.
        proposal = sync.build_proposal()
        prior_faq = faq.read_text(encoding="utf-8")
        prior_expanded = expanded.read_text(encoding="utf-8")
        sync.run_full_validation = lambda: (False, "Forced validation failure")
        success, message, _ = sync.apply_proposal(sync.APPLY_CONFIRMATION)
        require(not success, "Validation failure must report unsuccessful apply.", errors)
        require("automatically restored" in message, "Validation failure should explicitly report automatic restore.", errors)
        require(faq.read_text(encoding="utf-8") == prior_faq, "Failed validation did not restore core FAQ.", errors)
        require(expanded.read_text(encoding="utf-8") == prior_expanded, "Failed validation did not restore expanded FAQ.", errors)

    if errors:
        print("Hiring Guide public sync validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Hiring Guide public sync validation passed: canonical compilation, legacy preservation, editorial stripping, evidence warnings, routing parity, stale protection, validated apply, and rollback are intact.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
