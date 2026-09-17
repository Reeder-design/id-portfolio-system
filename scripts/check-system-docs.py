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
TAXONOMY = ROOT / "portfolio-data" / "taxonomy.json"
APP = ROOT / "portfolio-manager" / "app.py"
VALIDATION = ROOT / "portfolio-manager" / "validation_service.py"
WORKFLOW = ROOT / ".github" / "workflows" / "validate-site.yml"


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
        (TAXONOMY, "portfolio taxonomy"),
        (APP, "Portfolio Manager app"),
        (VALIDATION, "Full Validation service"),
        (WORKFLOW, "pull-request validation workflow"),
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
    taxonomy = json.loads(TAXONOMY.read_text(encoding="utf-8"))
    app = APP.read_text(encoding="utf-8")
    validation = VALIDATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")

    for phrase in [
        "Manage Content",
        "Create Content",
        "Reference Library",
        "Save & Publish",
        "Approve & Apply Locally",
        "Publish to GitHub",
        "Full Validation",
        ".portfolio-manager/",
        "Commit Identity Privacy",
        "feature branch → PR → UAT",
    ]:
        require(phrase in readme, f"README is missing current architecture/workflow language: {phrase!r}.", errors)

    for phrase in [
        "Manage Content",
        "Reference Library",
        "Create Content",
        "Save & Publish",
        "Generic AI Drafting Helper",
        "Page-aware AI",
        "Approve & Apply Locally",
        "explicit user approval",
        "system documentation/architecture freshness",
        "Source-of-Truth Order",
        "portfolio-data/taxonomy.json",
        "Do not revive retired experiments",
    ]:
        require(phrase in agents, f"AGENTS.md is missing current operating guidance: {phrase!r}.", errors)

    for phrase in [
        "Read `AGENTS.md`",
        "Source of Truth",
        "portfolio-data/taxonomy.json",
        "System Integrations and Workflows",
        "LMS Administration & System Operations",
        "Do not resurrect retired experiments",
    ]:
        require(phrase in copilot, f"Copilot instructions are missing current operating guidance: {phrase!r}.", errors)

    for phrase in [
        "Routine portfolio content publishing",
        "Developing Portfolio Manager or repository infrastructure",
        "Publish to GitHub",
        "adversarial security/misuse regression",
        "workflow state-safety/chaos regression",
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
        "LMS Administration & System Operations",
        "System Integrations and Workflows",
    ]
    require(category_labels == expected_categories, "taxonomy top-level category labels do not match the expected current IA", errors)

    for phrase in expected_categories:
        require(phrase in agents, f"AGENTS.md is missing current taxonomy label {phrase!r}.", errors)
        require(phrase in copilot, f"Copilot guidance is missing current taxonomy label {phrase!r}.", errors)
        require(phrase in content_model, f"Content model guide is missing current taxonomy label {phrase!r}.", errors)
        require(phrase in template_system, f"Template system guide is missing current taxonomy label {phrase!r}.", errors)

    for phrase in [
        "Structured data is not a future placeholder",
        "Portfolio Manager Relationship",
        "templates/project-page/index.html",
    ]:
        require(phrase in content_model, f"Content model guide is missing current ownership language: {phrase!r}.", errors)

    for phrase in [
        "Source of Truth",
        "Portfolio Manager **Create Content**",
        "System Integrations and Workflows",
        "compatibility behavior",
    ]:
        require(phrase in template_system, f"Template system guide is missing current architecture language: {phrase!r}.", errors)

    for phrase in [
        "Portfolio Manager **Create Content** is the normal human-facing workflow",
        "Reference Library",
        "routine approved portfolio-content maintenance",
        "portfolio-data/taxonomy.json",
    ]:
        require(phrase.lower() in new_project_guide.lower(), f"New project guide is missing current workflow language: {phrase!r}.", errors)

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
        ("Breadcrumb consistency", "scripts/check-breadcrumb-consistency.py"),
        ("Hiring Manager UX", "scripts/check-hiring-mobile-ux.py"),
    ]:
        require(
            f'("{label}", [sys.executable, "{script}"]' in validation,
            f"Portfolio Manager Full Validation must include {label}: {script}.",
            errors,
        )

    for script in [
        "python scripts/check-system-docs.py",
        "python scripts/check-breadcrumb-consistency.py",
        "python scripts/check-hiring-mobile-ux.py",
    ]:
        require(script in workflow, f"Pull-request CI must run {script}.", errors)

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
