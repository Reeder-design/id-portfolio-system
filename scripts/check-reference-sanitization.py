from __future__ import annotations

from io import BytesIO
from pathlib import Path
import ast
import sys
import tempfile

from werkzeug.datastructures import FileStorage


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "reference_sanitization_service.py"
LIBRARY = MANAGER / "reference_library_service.py"
ROUTES = MANAGER / "reference_library_routes.py"
ITEM = MANAGER / "templates" / "reference-item.html"
REVIEW = MANAGER / "templates" / "reference-sanitization.html"
REQUIREMENTS = MANAGER / "requirements.txt"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path in (SERVICE, LIBRARY, ROUTES, ITEM, REVIEW, REQUIREMENTS):
        require(path.exists(), f"Missing sanitization file: {path.relative_to(ROOT)}", errors)
    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    library_text = LIBRARY.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    item_template = ITEM.read_text(encoding="utf-8")
    review_template = REVIEW.read_text(encoding="utf-8")
    requirements = REQUIREMENTS.read_text(encoding="utf-8")

    for path, text in ((SERVICE, service), (LIBRARY, library_text), (ROUTES, routes)):
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require('AI_REVIEW_EXTENSIONS = TEXT_EXTENSIONS | OFFICE_EXTENSIONS | {".pdf"}' in service, "Sanitization review must explicitly constrain supported text-extractable file types.", errors)
    require("pypdf==6.18.1" in requirements, "PDF sanitization review must install the pinned text-extraction dependency.", errors)
    require("REVIEW_INSTRUCTIONS" in service and "advisory" in service, "AI sanitization review must be advisory-only.", errors)
    require("Never claim the source is safe" in service, "AI review must never certify publication safety.", errors)
    require("ALLOWED_DECISIONS" in service and "public-safe" in service, "Sanitization decisions must use the explicit human decision model.", errors)
    require('finding["decision"] = decision' in service, "Human finding decisions must be stored in the private review record.", errors)
    require('review["decisions_complete"] = complete' in service, "The system must track whether every finding has a human decision.", errors)
    require("Resolve every sanitization finding before generating" in service, "Sanitized draft generation must require completed human decisions.", errors)
    require("save_generated_sanitized_text" in service, "AI-generated sanitization must create a separate derivative rather than changing the source.", errors)
    require('record["status"] = "sanitized-draft"' in service, "Generated sanitization output must remain a draft rather than auto-approval.", errors)
    require('"sanitization_review": None' in library_text, "Reference items must carry their private sanitization review state.", errors)
    require("generated_from_review" in library_text, "AI-generated derivatives must be marked as review-generated private drafts.", errors)

    for forbidden in ("git add", "git commit", "git push", "render-project.py", "render-site-content.py"):
        require(forbidden not in service + routes, f"Sanitization pipeline must not publish or render public content: found {forbidden}", errors)

    require('request.form.get("provider_ack") != "on"' in routes, "AI sanitization review must require external-provider acknowledgement.", errors)
    require('request.form.get("authority_ack") != "on"' in routes, "AI sanitization review must require user authorization acknowledgement.", errors)
    require("review_preflight(item_id)" in routes, "AI sanitization actions must run local preflight first.", errors)
    require("Open Sanitization Review" in item_template, "Reference Item must activate the guided sanitization workflow.", errors)
    require("AI flags. You decide." in review_template, "Sanitization UI must clearly state the human approval boundary.", errors)
    for label in ("Keep", "Remove", "Generalize", "Rewrite", "Replace text", "Replace asset", "Crop / redact", "Mark as intentionally public-safe"):
        require(label in service, f"Sanitization decision model must include {label}.", errors)
    require("Save Finding Decisions" in review_template, "Sanitization UI must save item-by-item human decisions.", errors)
    require("Generate Sanitized Text Draft" in review_template, "Completed decisions must optionally produce a separate private text derivative.", errors)
    require("Review &amp; Approve on Reference Item" in review_template, "Sanitized output must return to a separate human approval step.", errors)

    sys.path.insert(0, str(MANAGER))
    try:
        import reference_library_service as library  # noqa: E402
        import reference_sanitization_service as sanitization  # noqa: E402

        old_reference_root = library.REFERENCE_ROOT
        old_items_root = library.ITEMS_ROOT
        old_files_root = library.FILES_ROOT
        old_request_json = sanitization._request_json
        old_settings = sanitization.get_ai_settings

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir) / "reference-library"
            library.REFERENCE_ROOT = temp_root
            library.ITEMS_ROOT = temp_root / "items"
            library.FILES_ROOT = temp_root / "files"

            upload = FileStorage(
                stream=BytesIO(b"CONFIDENTIAL\nCustomer: Acme Corp\nInternal launch metric: 87%\nOwner: Jane Example"),
                filename="internal-source.txt",
                content_type="text/plain",
            )
            record = library.create_reference_item("Sanitization Test", "private", "test", upload)
            item_id = record["id"]
            original_path = library.reference_file_path(item_id, "original")
            original_bytes = original_path.read_bytes()
            original_hash = record["original_file"]["sha256"]

            extracted = sanitization.extract_reference_text(item_id)
            require(extracted["supported"], "TXT source must support sanitization extraction.", errors)
            require("Acme Corp" in extracted["text"], "Sanitization extraction must read the private source text locally.", errors)

            sanitization.get_ai_settings = lambda: {"configured": True, "model": "ci-sanitization-model", "provider": "test"}
            sanitization._request_json = lambda instructions, prompt, max_output_tokens: {
                "summary": "Customer identity and internal metric require review.",
                "findings": [
                    {
                        "severity": "high",
                        "category": "Customer identity",
                        "detected_content": "Acme Corp",
                        "location": "Customer line",
                        "reason": "Identifies a customer.",
                        "suggested_actions": ["Generalize", "Remove"],
                        "suggested_replacement": "a customer",
                    },
                    {
                        "severity": "high",
                        "category": "Confidential metric",
                        "detected_content": "87%",
                        "location": "Internal launch metric",
                        "reason": "May be an internal performance metric.",
                        "suggested_actions": ["Remove", "Generalize"],
                        "suggested_replacement": "an internal performance measure",
                    },
                ],
                "limitations": [],
            }
            reviewed = sanitization.run_sanitization_review(item_id)
            require(reviewed["status"] == "sanitization-in-progress", "AI findings must move the source into Sanitization In Progress, not approval.", errors)
            require(len(reviewed["sanitization_review"]["findings"]) == 2, "Mock sanitization findings must be stored privately.", errors)
            require(not reviewed["sanitization_review"]["decisions_complete"], "AI findings must wait for human decisions.", errors)

            decisions = {
                "decision_finding-01": "generalize",
                "replacement_finding-01": "a customer",
                "note_finding-01": "Keep the scenario, remove identity.",
                "decision_finding-02": "remove",
                "replacement_finding-02": "",
                "note_finding-02": "Metric is not needed publicly.",
            }
            decided = sanitization.save_finding_decisions(item_id, decisions)
            require(decided["sanitization_review"]["decisions_complete"], "All mock findings must become complete only after human decisions.", errors)
            require(not decided.get("sanitized_derivative"), "Saving decisions must not create a derivative automatically.", errors)

            sanitization._request_json = lambda instructions, prompt, max_output_tokens: {
                "sanitized_text": "Customer: a customer\nOwner: project lead",
                "draft_notes": ["Generalized customer identity and removed internal metric."],
                "unresolved_items": ["Inspect any original screenshots or logos manually."],
            }
            drafted = sanitization.generate_sanitized_text_draft(item_id)
            require(drafted["status"] == "sanitized-draft", "AI sanitization output must remain Sanitized Draft.", errors)
            require(drafted["approval"]["approved_at"] is None, "AI-generated derivative must never be auto-approved.", errors)
            require(drafted["sanitized_derivative"]["generated_from_review"] is True, "Generated derivative must record its sanitization-review origin.", errors)
            require(library.reference_file_path(item_id, "sanitized").read_text(encoding="utf-8").startswith("Customer: a customer"), "Generated sanitized derivative must be stored separately.", errors)
            require(original_path.read_bytes() == original_bytes, "Sanitization pipeline must never overwrite the original private source.", errors)
            require(library.load_reference_item(item_id)["original_file"]["sha256"] == original_hash, "Original source hash must remain unchanged through sanitization.", errors)

        library.REFERENCE_ROOT = old_reference_root
        library.ITEMS_ROOT = old_items_root
        library.FILES_ROOT = old_files_root
        sanitization._request_json = old_request_json
        sanitization.get_ai_settings = old_settings
    except Exception as exc:
        errors.append(f"Guided sanitization runtime test failed: {exc}")

    if errors:
        print("Reference sanitization validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Reference sanitization safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
