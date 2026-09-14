from __future__ import annotations

from pathlib import Path
import ast
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "ai_handoff_service.py"
ROUTES = MANAGER / "ai_routes.py"
PROPOSAL = MANAGER / "templates" / "ai-proposal.html"
CHOOSER = MANAGER / "templates" / "ai-proposal-use.html"
HANDOFF_JS = MANAGER / "static" / "ai-handoff.js"
HELP_JS = MANAGER / "static" / "help.js"
VALIDATION = MANAGER / "validation_service.py"
WORKFLOW = ROOT / ".github" / "workflows" / "validate-site.yml"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path, label in [
        (SERVICE, "AI handoff service"),
        (ROUTES, "AI routes"),
        (PROPOSAL, "AI proposal template"),
        (CHOOSER, "AI proposal destination template"),
        (HANDOFF_JS, "AI staged-draft browser helper"),
        (HELP_JS, "shared UI loader"),
    ]:
        require(path.exists(), f"{label} is missing: {path.relative_to(ROOT)}", errors)

    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    proposal = PROPOSAL.read_text(encoding="utf-8")
    chooser = CHOOSER.read_text(encoding="utf-8")
    handoff_js = HANDOFF_JS.read_text(encoding="utf-8")
    help_js = HELP_JS.read_text(encoding="utf-8")
    validation = VALIDATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")

    for path, text in [(SERVICE, service), (ROUTES, routes)]:
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"AI handoff Python must remain Python 3.9-compatible: {path.relative_to(ROOT)} ({exc})")

    require('USAGE_ROOT = PRIVATE_ROOT / "ai-proposal-usage"' in service, "Proposal usage history must stay under the private Git-ignored workspace.", errors)
    require("record_usage" in service and "delete_usage" in service, "Proposal usage lifecycle must be recorded privately and cleaned up with proposal deletion.", errors)
    require('"saved-for-later"' in service and '"staged-existing-content"' in service and '"started-content-brief"' in service, "Proposal usage lifecycle must cover the three user-facing choices.", errors)
    require("proposal_draft_text" in service and "proposal_brief_prefill" in service, "Handoff service must build editor draft and Content Brief context without public writes.", errors)
    require('"source_text"' not in service, "Handoff payload service must not expose raw private source text through the editor-transfer endpoint.", errors)

    require('@ai_bp.get("/proposals/<proposal_id>/use")' in routes, "AI proposals must expose a guided destination picker.", errors)
    require('@ai_bp.post("/proposals/<proposal_id>/stage")' in routes, "Existing-content handoff must require an explicit POST stage action.", errors)
    require('@ai_bp.post("/proposals/<proposal_id>/create-content")' in routes, "New-content handoff must require an explicit POST action.", errors)
    require('@ai_bp.post("/proposals/<proposal_id>/save-later")' in routes, "Save-for-later must be an explicit user action.", errors)
    require('@ai_bp.get("/proposals/<proposal_id>/draft.json")' in routes, "Editors must retrieve staged proposal data from the authenticated local app by proposal id.", errors)
    require("url_for(\"content.project_editor\"" in routes and "url_for(\"site_content.v2_page_editor\"" in routes, "Staged handoff must reuse the existing deterministic editors.", errors)

    forbidden = ("git add", "git commit", "git push", "render-project.py", "render-site-content.py")
    for marker in forbidden:
        require(marker not in service, f"AI handoff service must not gain write/publish authority: found {marker}", errors)

    require("Choose Existing Content" in proposal and "Start Content Brief" in proposal and "Save for Later" in proposal, "Proposal UI must expose the three simplified next-step choices.", errors)
    require("Copy the approved wording into General Page Content or Project Content" not in proposal, "Proposal UI must remove the manual copy-paste instruction.", errors)
    require("Nothing is inserted or saved" in chooser, "Destination picker must explain that choosing an editor does not write content.", errors)
    require('name="destination_kind"' in chooser and 'name="destination_id"' in chooser, "Destination picker must submit explicit destination identifiers.", errors)

    require("Insert Draft into Field" in handoff_js, "Editor handoff must require an explicit in-browser insert action.", errors)
    require("Undo Insert" in handoff_js, "Editor handoff must provide an undo before save.", errors)
    require("NOT saved" in handoff_js, "Editor handoff must clearly distinguish staging from saving.", errors)
    require("form.submit(" not in handoff_js and ".submit()" not in handoff_js, "Staged draft helper must never auto-submit an editor form.", errors)
    require("/ai/proposals/" in handoff_js and "/draft.json" in handoff_js, "Staged draft helper must fetch proposal data only from the local authenticated handoff endpoint.", errors)
    require("ai-handoff.js" in help_js and "ai_proposal" in help_js, "Shared UI must load staged-draft support only when a proposal handoff is present.", errors)

    require("scripts/check-ai-proposal-handoff.py" in validation, "Full Validation must include AI proposal handoff safety.", errors)
    require("python scripts/check-ai-proposal-handoff.py" in workflow, "GitHub Actions must run AI proposal handoff safety regression.", errors)

    if not errors:
        sys.path.insert(0, str(MANAGER))
        try:
            from ai_handoff_service import proposal_brief_prefill, proposal_draft_text  # noqa: E402

            sample = {
                "result": {
                    "headline": "Sample Proposal",
                    "proposal": "Source-supported draft copy.",
                    "analysis": "Analysis text.",
                    "supported_claims": ["Claim one"],
                    "warnings": ["Review public safety"],
                    "suggested_tags": ["Automation"],
                },
                "user_goal": "Keep it concise.",
            }
            require(proposal_draft_text(sample) == "Source-supported draft copy.", "Handoff should prefer the reviewed proposal copy when available.", errors)
            brief = proposal_brief_prefill(sample)
            require(brief.get("working_title") == "Sample Proposal", "Content Brief handoff must preserve the proposal headline as a draft title.", errors)
            require("Claim one" in brief.get("evidence", ""), "Content Brief handoff must preserve source-supported evidence.", errors)
            require("Review public safety" in brief.get("public_safety", ""), "Content Brief handoff must carry forward AI/public-safety warnings for review.", errors)
        except Exception as exc:
            errors.append(f"AI proposal handoff runtime checks could not run: {exc}")

    if errors:
        print("AI proposal handoff safety validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("AI proposal handoff safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
