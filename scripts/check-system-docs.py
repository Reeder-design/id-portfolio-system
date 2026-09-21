from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
AGENTS = ROOT / "AGENTS.md"
COPILOT = ROOT / ".github" / "copilot-instructions.md"
MAINTENANCE = ROOT / "docs" / "maintenance-guide.md"
AI_DOCS = ROOT / "docs" / "ai-assistance.md"
CONTENT_MODEL = ROOT / "docs" / "content-model.md"
TEMPLATE_SYSTEM = ROOT / "docs" / "template-system.md"
NEW_PROJECT_GUIDE = ROOT / "docs" / "new-project-guide.md"
VISUAL_QA = ROOT / "docs" / "portfolio-uat-guardrails.md"
CONSISTENCY_AUDIT = ROOT / "docs" / "portfolio-consistency-audit.md"
TAXONOMY = ROOT / "portfolio-data" / "taxonomy.json"
COMPONENT_REGISTRY = ROOT / "portfolio-data" / "component-registry.json"
APP = ROOT / "portfolio-manager" / "app.py"
VALIDATION = ROOT / "portfolio-manager" / "validation_service.py"
WORKFLOW = ROOT / ".github" / "workflows" / "validate-site.yml"
RENDERER = ROOT / "scripts" / "render-project.py"
CONTENT_ROUTES = ROOT / "portfolio-manager" / "content_routes.py"
PROJECT_EDITOR = ROOT / "portfolio-manager" / "templates" / "project-editor.html"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    for path, label in [
        (README, "README"),
        (AGENTS, "agent guidance"),
        (COPILOT, "Copilot guidance"),
        (MAINTENANCE, "maintenance guide"),
        (AI_DOCS, "AI assistance guide"),
        (CONTENT_MODEL, "content model guide"),
        (TEMPLATE_SYSTEM, "template system guide"),
        (NEW_PROJECT_GUIDE, "new project guide"),
        (VISUAL_QA, "portfolio visual QA standard"),
        (CONSISTENCY_AUDIT, "portfolio consistency audit"),
        (TAXONOMY, "portfolio taxonomy"),
        (COMPONENT_REGISTRY, "reusable component registry"),
        (APP, "Portfolio Manager app"),
        (VALIDATION, "Full Validation service"),
        (WORKFLOW, "pull-request validation workflow"),
        (RENDERER, "new-page renderer"),
        (CONTENT_ROUTES, "content routes"),
        (PROJECT_EDITOR, "project editor"),
    ]:
        require(path.exists(), f"Missing {label}: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    readme = README.read_text(encoding="utf-8")
    agents = AGENTS.read_text(encoding="utf-8")
    copilot = COPILOT.read_text(encoding="utf-8")
    maintenance = MAINTENANCE.read_text(encoding="utf-8")
    ai_docs = AI_DOCS.read_text(encoding="utf-8")
    content_model = CONTENT_MODEL.read_text(encoding="utf-8")
    template_system = TEMPLATE_SYSTEM.read_text(encoding="utf-8")
    new_project_guide = NEW_PROJECT_GUIDE.read_text(encoding="utf-8")
    visual_qa = VISUAL_QA.read_text(encoding="utf-8")
    consistency_audit = CONSISTENCY_AUDIT.read_text(encoding="utf-8")
    taxonomy = json.loads(TAXONOMY.read_text(encoding="utf-8"))
    app = APP.read_text(encoding="utf-8")
    validation = VALIDATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")
    renderer = RENDERER.read_text(encoding="utf-8")
    content_routes = CONTENT_ROUTES.read_text(encoding="utf-8")
    project_editor = PROJECT_EDITOR.read_text(encoding="utf-8")

    for phrase in [
        "Manage Content",
        "Create Content",
        "Reference Library",
        "Hiring Guide Library",
        "Preview Public Sync",
        "Save & Publish",
        "Approve & Apply Locally",
        "Publish to GitHub",
        "Full Validation",
        ".portfolio-manager/",
        "Commit Identity Privacy",
        "feature branch → PR → UAT",
        "Reusable Component Registry",
        "Related References project graph",
    ]:
        require(phrase in readme, f"README is missing current architecture/workflow language: {phrase!r}.", errors)

    for phrase in [
        "Manage Content",
        "Reference Library",
        "Hiring Guide Library",
        "Hiring Guide public sync",
        "Create Content",
        "Save & Publish",
        "Generic AI Drafting Helper",
        "Page-aware AI",
        "Approve & Apply Locally",
        "explicit user approval",
        "system documentation/architecture freshness",
        "Source-of-Truth Order",
        "portfolio-data/taxonomy.json",
        "portfolio-data/component-registry.json",
        "Do not revive retired experiments",
    ]:
        require(phrase in agents, f"AGENTS.md is missing current operating guidance: {phrase!r}.", errors)

    for phrase in [
        "Read `AGENTS.md`",
        "Source of Truth",
        "portfolio-data/taxonomy.json",
        "Workflows",
        "LMS Administration",
        "Hiring Guide editorial source",
        "Do not resurrect retired experiments",
    ]:
        require(phrase in copilot, f"Copilot instructions are missing current operating guidance: {phrase!r}.", errors)

    for phrase in [
        "Routine portfolio content publishing",
        "Developing Portfolio Manager or repository infrastructure",
        "Publish to GitHub",
        "adversarial security/misuse regression",
        "workflow state-safety/chaos regression",
        "Hiring Guide Library Maintenance",
        "Preview Public Sync",
        "Commit Identity Privacy",
    ]:
        require(phrase in maintenance, f"Maintenance guide is missing current workflow guidance: {phrase!r}.", errors)

    for phrase in [
        "Advanced AI Drafting Helper",
        "Page-aware AI",
        "AI Portfolio Review",
        "Reference AI Analysis",
        "Create Content AI Planning",
        "Approve & Apply Locally",
        "deterministic local code",
        "No AI generation request can publish the portfolio",
    ]:
        require(phrase in ai_docs, f"AI guide is missing current AI boundary language: {phrase!r}.", errors)

    category_labels = [category.get("label", "") for category in taxonomy.get("categories", [])]
    expected_categories = [
        "Instructional Design",
        "AI Training and Evaluation",
        "LMS Administration",
        "Workflows",
    ]
    require(category_labels == expected_categories, "taxonomy top-level category labels do not match the expected current IA", errors)

    for phrase in expected_categories:
        require(phrase in agents, f"AGENTS.md is missing current taxonomy label {phrase!r}.", errors)
        require(phrase in copilot, f"Copilot guidance is missing current taxonomy label {phrase!r}.", errors)
        require(phrase in content_model, f"Content model guide is missing current taxonomy label {phrase!r}.", errors)

    for phrase in [
        "Structured data is not a future placeholder",
        "Portfolio Manager Relationship",
        "templates/project-page/index.html",
    ]:
        require(phrase in content_model, f"Content model guide is missing current ownership language: {phrase!r}.", errors)

    for phrase in [
        "Source of Truth",
        "Preservation Contract",
        "Portfolio Manager **Create Content**",
        "new-page scaffold",
        "Reusable Component Registry",
        "Related Work and Related References",
        "There is no supported force-overwrite workflow",
    ]:
        require(phrase in template_system, f"Template system guide is missing current preservation language: {phrase!r}.", errors)

    for phrase in [
        "Portfolio Manager **Create Content** is the normal human-facing workflow",
        "Reference Library",
        "current public HTML/CSS/JavaScript is authoritative",
        "There is no supported force-overwrite path",
        "portfolio-data/taxonomy.json",
    ]:
        require(phrase.lower() in new_project_guide.lower(), f"New project guide is missing current workflow language: {phrase!r}.", errors)

    for phrase in [
        "Preservation rule",
        "Stable tabs and state changes",
        "Interaction title and copy width",
        "Pixel icons",
        "Motion graphics and stacking",
        "UAT checklist",
    ]:
        require(phrase in visual_qa, f"Visual QA standard is missing recurring UAT guidance: {phrase!r}.", errors)

    for phrase in [
        "Repeated issue patterns from project UAT",
        "Current repository observations",
        "Interactive-state height risk",
        "Existing public page first",
    ]:
        require(phrase in consistency_audit, f"Consistency audit is missing current audit language: {phrase!r}.", errors)

    stale_phrases = [
        "The v1 dashboard is intentionally narrow",
        "There is intentionally no Apply-to-site route",
        "There is intentionally no Apply-to-site action",
        "Approved AI wording should be copied into the existing deterministic General Page Content or Project Content editors",
        "AI Assistance is intentionally **proposal-only**",
        "commits on `main` are blocked",
        "pushes to `main` are blocked",
        "Planned improvements may include",
        "future Portfolio Manager dashboard",
        "Future phases will:",
        "Primary public project categories:\n- Instructional Design\n- AI Training and Evaluation\n- Workflows",
    ]
    combined_docs = "\n".join([
        readme,
        agents,
        copilot,
        maintenance,
        ai_docs,
        content_model,
        template_system,
        new_project_guide,
        visual_qa,
        consistency_audit,
    ])
    for phrase in stale_phrases:
        require(phrase not in combined_docs, f"Current documentation still contains retired workflow language: {phrase!r}.", errors)

    for marker in [
        '@app.route("/submit-edit-request"',
        '@app.route("/submit-new-content"',
        "REQUESTS_ROOT",
        "save_uploaded_files",
        "get_recent_requests",
    ]:
        require(marker not in app, f"Retired v1 request-intake code must stay removed: {marker!r}.", errors)

    for label, script in [
        ("System docs/architecture freshness", "scripts/check-system-docs.py"),
        ("Hiring Manager UX", "scripts/check-hiring-mobile-ux.py"),
        ("Hiring Guide Manager", "scripts/check-hiring-guide-manager.py"),
        ("Hiring Guide public sync", "scripts/check-hiring-guide-public-sync.py"),
        ("Relationship graph", "scripts/check-relationship-graph.py"),
        ("Component Registry", "scripts/check-component-registry.py"),
    ]:
        require(
            f'("{label}", [sys.executable, "{script}"]' in validation,
            f"Portfolio Manager Full Validation must include {label}: {script}.",
            errors,
        )

    for script in [
        "python scripts/check-system-docs.py",
        "python scripts/check-hiring-mobile-ux.py",
        "python scripts/check-hiring-guide-manager.py",
        "python scripts/check-hiring-guide-public-sync.py",
        "python scripts/check-relationship-graph.py",
        "python scripts/check-component-registry.py",
    ]:
        require(script in workflow, f"Pull-request CI must run {script}.", errors)


    require("--force" not in renderer, "New-page renderer must not expose a force-overwrite option.", errors)
    require("/regenerate" not in content_routes, "Portfolio Manager must not expose the retired project regeneration route.", errors)
    require("Regenerate Page" not in project_editor, "Project editor must not expose the retired Regenerate Page action.", errors)
    require("check-breadcrumb-consistency.py" not in validation, "Breadcrumb checks should remain consolidated in final-polish validation.", errors)
    require("check-breadcrumb-consistency.py" not in workflow, "CI should not run the retired standalone breadcrumb checker.", errors)

    require(
        workflow.count("python scripts/check-final-polish.py") == 1,
        "Pull-request CI should run check-final-polish.py exactly once.",
        errors,
    )
    require(
        '- "README.md"' in workflow and '- "AGENTS.md"' in workflow and '- ".github/copilot-instructions.md"' in workflow,
        "Pull-request CI path filters must trigger for README, AGENTS, and Copilot instruction changes.",
        errors,
    )

    if errors:
        print("System documentation/architecture freshness validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("System documentation/architecture freshness validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
