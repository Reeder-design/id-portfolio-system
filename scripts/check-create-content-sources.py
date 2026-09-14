from __future__ import annotations

from io import BytesIO
from pathlib import Path
import sys
import tempfile

from werkzeug.datastructures import FileStorage


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
sys.path.insert(0, str(MANAGER))


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    try:
        import create_content_service as content
        import create_content_sources as sources
        import reference_library_service as library

        old_library_roots = (library.REFERENCE_ROOT, library.ITEMS_ROOT, library.FILES_ROOT)
        old_content_root = content.BRIEFS_ROOT
        old_sources_root = sources.BRIEFS_ROOT

        with tempfile.TemporaryDirectory() as temp_dir:
            private_root = Path(temp_dir)
            ref_root = private_root / "reference-library"
            brief_root = private_root / "create-content" / "briefs"
            library.REFERENCE_ROOT = ref_root
            library.ITEMS_ROOT = ref_root / "items"
            library.FILES_ROOT = ref_root / "files"
            content.BRIEFS_ROOT = brief_root
            sources.BRIEFS_ROOT = brief_root

            original = FileStorage(
                stream=BytesIO(b"PRIVATE ORIGINAL ONLY: Acme Internal Project"),
                filename="private-source.txt",
                content_type="text/plain",
            )
            reference = library.create_reference_item("Approved Evidence", "private notes", "test", original)
            source_id = reference["id"]

            sanitized = FileStorage(
                stream=BytesIO(b"Public-safe evidence: designed scenario-based sales practice."),
                filename="approved-evidence.txt",
                content_type="text/plain",
            )
            library.save_sanitized_derivative(source_id, sanitized)
            approved = library.update_reference_item(
                source_id,
                "Approved Evidence",
                "private notes",
                "test",
                "approved-for-portfolio-use",
                "Reviewed and approved sanitized derivative.",
            )
            approved_hash = approved["sanitized_derivative"]["sha256"]

            brief = content.create_brief({
                "working_title": "Source Handoff Test",
                "project_type": "Portfolio case study",
                "purpose": "Demonstrate design decisions",
                "audience": "Hiring managers",
                "story_problem": "A sales practice need",
            })
            attached = sources.save_brief_sources(brief["id"], [source_id])
            require(len(attached.get("approved_sources", [])) == 1, "Approved source must attach to the Content Brief.", errors)
            require(attached["approved_sources"][0]["sanitized_sha256"] == approved_hash, "Content Brief must snapshot the approved sanitized derivative hash.", errors)

            context = sources.approved_source_context(attached, strict=True)
            require("Public-safe evidence" in context["text"], "AI source context must include approved sanitized derivative text.", errors)
            require("PRIVATE ORIGINAL ONLY" not in context["text"], "AI source context must never include the private original text.", errors)
            require(context["resolved"][0]["ai_text_included"] is True, "Text-extractable approved source must report that it is included in AI context.", errors)

            brief_path = brief_root / f"{brief['id']}.json"
            current = content.load_brief(brief["id"])
            current["plan"] = {"concept_summary": "existing plan"}
            current["status"] = "plan-proposed"
            current["plan_stale"] = False
            import json
            brief_path.write_text(json.dumps(current, indent=2), encoding="utf-8")

            replacement = FileStorage(
                stream=BytesIO(b"Updated public-safe evidence: redesigned practice workflow."),
                filename="approved-evidence-v2.txt",
                content_type="text/plain",
            )
            library.save_sanitized_derivative(source_id, replacement)
            stale_record = content.load_brief(brief["id"])
            stale_context = sources.approved_source_context(stale_record, strict=False)
            require(stale_context["issues"], "Replacing an attached derivative must make the saved source snapshot stale.", errors)

            library.update_reference_item(
                source_id,
                "Approved Evidence",
                "private notes",
                "test",
                "approved-for-portfolio-use",
                "Reviewed replacement derivative.",
            )
            refreshed = sources.save_brief_sources(brief["id"], [source_id])
            require(refreshed.get("plan_stale") is True, "Refreshing an attached approved source after a plan exists must mark that plan stale.", errors)
            refreshed_context = sources.approved_source_context(refreshed, strict=True)
            require("Updated public-safe evidence" in refreshed_context["text"], "Re-saving the brief must attach the current approved derivative version.", errors)
            require("PRIVATE ORIGINAL ONLY" not in refreshed_context["text"], "Refreshing source context must still exclude the private original.", errors)

        library.REFERENCE_ROOT, library.ITEMS_ROOT, library.FILES_ROOT = old_library_roots
        content.BRIEFS_ROOT = old_content_root
        sources.BRIEFS_ROOT = old_sources_root
    except Exception as exc:
        errors.append(f"Approved-source handoff runtime test failed: {exc}")

    if errors:
        print("Create Content approved-source validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Create Content approved-source validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
