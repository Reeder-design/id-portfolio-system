from __future__ import annotations

from pathlib import Path
import ast


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "create_content_service.py"
SOURCES = MANAGER / "create_content_sources.py"
ROUTES = MANAGER / "create_content_routes.py"
WORKSPACE = MANAGER / "templates" / "create-content.html"
BRIEF = MANAGER / "templates" / "create-content-brief.html"
REFERENCE_ITEM = MANAGER / "templates" / "reference-item.html"
AI_WORKSPACE = MANAGER / "templates" / "ai-assistant.html"
DASHBOARD = MANAGER / "templates" / "dashboard.html"
APP = MANAGER / "app.py"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    files = [SERVICE, SOURCES, ROUTES, WORKSPACE, BRIEF, REFERENCE_ITEM, AI_WORKSPACE, DASHBOARD, APP]
    for path in files:
        require(path.exists(), f"Missing Create Content file: {path.relative_to(ROOT)}", errors)

    if errors:
        print("Create Content Lab validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    sources = SOURCES.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    workspace = WORKSPACE.read_text(encoding="utf-8")
    brief = BRIEF.read_text(encoding="utf-8")
    reference_item = REFERENCE_ITEM.read_text(encoding="utf-8")
    ai_workspace = AI_WORKSPACE.read_text(encoding="utf-8")
    dashboard = DASHBOARD.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")

    for path, text in [(SERVICE, service), (SOURCES, sources), (ROUTES, routes)]:
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require('BRIEFS_ROOT = PRIVATE_ROOT / "create-content" / "briefs"' in service, "Content Briefs must stay in the private Portfolio Manager workspace.", errors)
    require('"status": "brief-draft"' in service, "New Content Briefs must begin as private drafts.", errors)
    require('"approved_sources": []' in service, "New Content Briefs must support approved-source attachments.", errors)
    require("brief_as_text" in service and "brief_preflight" in service, "Create Content must assemble and locally preflight the human-authored brief before AI use.", errors)
    require("approved_source_context" in service, "AI planning must explicitly incorporate approved sanitized source context.", errors)
    require("CREATE_PLAN_INSTRUCTIONS" in service, "Create Content must use a dedicated planning-only AI contract.", errors)
    require("Do not write files, code, Git commands, or publishing instructions" in service, "AI planning instructions must explicitly deny build/publish actions.", errors)
    require('record["status"] = "plan-proposed"' in service, "AI output must remain a proposal-stage plan.", errors)
    require('record["plan_stale"] = True' in service + sources, "Editing the brief or its attached sources after planning must mark the AI plan stale.", errors)
    require("load_taxonomy()" in service, "AI planning should use the real public portfolio taxonomy.", errors)

    require("sanitized_sha256" in sources, "Attached approved sources must snapshot the sanitized derivative hash.", errors)
    require('reference_file_path(item_id, "sanitized")' in sources, "Create Content must read only the sanitized derivative for attached source context.", errors)
    require('reference_file_path(item_id, "original")' not in sources, "Create Content source bridge must never read private originals into AI planning context.", errors)
    require("approved-for-portfolio-use" in sources, "Only sources approved for portfolio use may attach to a Content Brief.", errors)
    require("The sanitized derivative changed after it was attached" in sources, "Attached source hashes must detect stale/replaced derivatives.", errors)

    forbidden = (
        "git add",
        "git commit",
        "git push",
        "render-project.py",
        "render-site-content.py",
        "portfolio/index.html",
    )
    for target in forbidden:
        require(target not in service + sources + routes, f"Create Content planning must remain non-publishing: found {target}", errors)

    require('request.form.get("provider_ack") != "on"' in routes, "Generate AI Plan must require explicit provider acknowledgement.", errors)
    require('request.form.get("authority_ack") != "on"' in routes, "Generate AI Plan must require explicit authorization acknowledgement.", errors)
    require("save_brief_sources" in routes and "source_ids_from_form" in routes, "Content Brief saves must persist selected approved sources.", errors)
    require('request.args.get("source"' in routes, "Create Content must support starting a brief from an approved Reference Library item.", errors)
    require("brief_preflight(record)" in routes, "Create Content routes must run local preflight before AI planning.", errors)
    require("app.register_blueprint(create_content_bp)" in app, "Create Content blueprint must be registered.", errors)

    required_brief_labels = (
        "What am I making?",
        "Why am I making it?",
        "Audience",
        "Story",
        "Evidence",
        "Approved source context",
        "Interaction",
        "Visual direction",
        "Public-safety constraints",
        "Personal direction",
        "Generate AI Plan",
    )
    for label in required_brief_labels:
        require(label in brief, f"Content Brief must include: {label}", errors)

    require("Idea → Brief + Approved Sources → AI Plan" in brief, "Content Brief must expose the approved-source planning workflow.", errors)
    require("private original" in brief.lower(), "Content Brief must explain that private originals are excluded from source handoff.", errors)
    require('name="source_ids"' in brief, "Content Brief must render selectable approved-source attachments.", errors)
    require("Start New Content Brief" in workspace, "Create Content workspace must start with a guided Content Brief.", errors)
    require("Advanced AI Drafting Helper" in workspace, "Existing generic AI assistance must be available as a secondary Create Content tool.", errors)
    require("Content Workspace &amp; Reference Library" in workspace, "Create Content must expose the private Reference Library workflow.", errors)
    require("Open Reference Library" in workspace, "Reference Library must be active from Create Content.", errors)
    require("trusted source context" in workspace, "Approved Sources card must describe the active Content Brief connection.", errors)
    require("Use in Content Brief" in reference_item, "Approved Reference Library items must activate Create Content handoff.", errors)
    require("Approval Required" in reference_item, "Unapproved Reference Library items must keep Create Content handoff blocked.", errors)

    require("href=\"{{ url_for('create_content.workspace') }}\"" in dashboard, "Dashboard Create Content card must open the Create Content workspace.", errors)
    require("Create Content · upcoming" not in dashboard, "Dashboard must no longer label Create Content as upcoming.", errors)
    require("Advanced AI Drafting Helper" in ai_workspace, "Generic AI workspace must be reframed as the advanced Create Content helper.", errors)
    require("Back to Create Content" in ai_workspace, "Advanced AI helper must return to Create Content.", errors)

    if errors:
        print("Create Content Lab validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Create Content Lab safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
