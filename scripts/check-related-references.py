from __future__ import annotations

from pathlib import Path
import ast
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "related_references_service.py"
ROUTES = MANAGER / "related_references_routes.py"
TEMPLATE = MANAGER / "templates" / "related-references.html"
APP = MANAGER / "app.py"
VALIDATION = MANAGER / "validation_service.py"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path, label in [
        (SERVICE, "Related References service"),
        (ROUTES, "Related References routes"),
        (TEMPLATE, "Related References template"),
        (APP, "Portfolio Manager app"),
        (VALIDATION, "validation service"),
    ]:
        require(path.exists(), f"{label} is missing: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    template = TEMPLATE.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")
    validation = VALIDATION.read_text(encoding="utf-8")

    for path, text in [(SERVICE, service), (ROUTES, routes)]:
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Related References must remain Python 3.9-compatible: {path.relative_to(ROOT)} ({exc})")

    require('REVIEWS_ROOT = PRIVATE_ROOT / "related-references"' in service, "Reference reviews must stay in the private manager workspace.", errors)
    require('BACKUPS_ROOT = PRIVATE_ROOT / "related-reference-backups"' in service, "Reference update backups must stay private.", errors)
    require('PORTFOLIO_ROOT.rglob("*.html")' in service, "Reference detection must be limited to public portfolio HTML.", errors)
    require("_resolved_href" in service, "Reference detection must resolve actual internal link targets.", errors)
    require("exact-title" in service and "linked-card-heading" in service and "linked-label" in service, "Reference detection must cover titles, linked card headings, and linked labels.", errors)
    require("html_text.count(fragment) != 1" in service, "Reference candidates must require unique deterministic anchors.", errors)
    require("file_sha256" in service, "Reference reviews must preserve source hashes for stale-file protection.", errors)
    require("prepared_updates" in service, "Reference edits must be simulated before any related page is written.", errors)
    require("run_full_validation()" in service, "Reference updates must run the full validation suite.", errors)
    require("scripts/update-docs.py" in service, "Reference completion must refresh generated documentation.", errors)
    require("AI" not in service or "AI" in "", "Related References must not depend on AI for deterministic detection.", errors)
    for forbidden in ("git add", "git commit", "git push", "git merge"):
        require(forbidden not in service + routes, f"Related References must not publish directly: found {forbidden}", errors)

    require("save_project_with_references" in routes, "Project saves must hand title changes to Related References.", errors)
    require("save_page_with_references" in routes, "Page saves must hand H1 changes to Related References.", errors)
    require('state.app.view_functions["content.save_project"]' in routes, "Existing project Save Edits endpoint must be adapted without changing the editor URL.", errors)
    require('state.app.view_functions["site_content.v2_save_page"]' in routes, "Existing page Save Edits endpoint must be adapted without changing the editor URL.", errors)
    require("app.register_blueprint(related_references_bp)" in app, "Related References blueprint must be registered.", errors)

    require("Update Reference" in template, "Reference review must expose Update Reference.", errors)
    require("Edit Suggested Text" in template, "Reference review must expose Edit Suggested Text.", errors)
    require("Leave Unchanged" in template, "Reference review must expose Leave Unchanged.", errors)
    require("record.source_preview_url" in template and "Preview" in template, "Reference review must expose real-page preview for both edit and new-project modes.", errors)
    require("Continue to Save &amp; Publish" in template, "Completed reference review must hand off to the existing publishing workflow.", errors)
    require("AI is not used" in template, "The UI must explain that reference detection is deterministic.", errors)

    require("scripts/check-related-references.py" in validation, "Full Validation must include the Related References safety contract.", errors)

    if not errors:
        sys.path.insert(0, str(MANAGER))
        try:
            from related_references_service import scan_related_references  # noqa: E402

            refs = scan_related_references(
                target_path="portfolio/projects/instructional-design/interactive-learning/pursuit-positioning/index.html",
                old_title="Pursuit determination Lab",
                new_title="Related References Test Title",
            )
            require(bool(refs), "Runtime reference scan should find at least one deterministic reference to the Pursuit project.", errors)
            require(any(item.get("kind") == "linked-card-heading" for item in refs), "Runtime scan should detect the linked landing-page card heading even when its current text differs from project data.", errors)
        except Exception as exc:
            errors.append(f"Related References runtime scan failed: {exc}")

    if errors:
        print("Related References validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Related References safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
