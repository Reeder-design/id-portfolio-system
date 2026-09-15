from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "README.md"
AGENTS = ROOT / "AGENTS.md"
MAINTENANCE = ROOT / "docs" / "maintenance-guide.md"
AI_DOCS = ROOT / "docs" / "ai-assistance.md"
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
        (MAINTENANCE, "maintenance guide"),
        (AI_DOCS, "AI assistance guide"),
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
    maintenance = MAINTENANCE.read_text(encoding="utf-8")
    ai_docs = AI_DOCS.read_text(encoding="utf-8")
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
    ]:
        require(phrase in agents, f"AGENTS.md is missing current operating guidance: {phrase!r}.", errors)

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

    stale_phrases = [
        "The v1 dashboard is intentionally narrow",
        "There is intentionally no Apply-to-site route",
        "There is intentionally no Apply-to-site action",
        "Approved AI wording should be copied into the existing deterministic General Page Content or Project Content editors",
        "AI Assistance is intentionally **proposal-only**",
        "commits on `main` are blocked",
        "pushes to `main` are blocked",
        "Planned improvements may include",
    ]
    combined_docs = "\n".join([readme, agents, maintenance, ai_docs])
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

    require(
        '"System docs/architecture freshness"' in validation and "scripts/check-system-docs.py" in validation,
        "Portfolio Manager Full Validation must include the system documentation freshness regression.",
        errors,
    )
    require(
        "python scripts/check-system-docs.py" in workflow,
        "Pull-request CI must run the system documentation freshness regression.",
        errors,
    )
    require(
        '- "README.md"' in workflow and '- "AGENTS.md"' in workflow,
        "Pull-request CI path filters must trigger for README.md and AGENTS.md changes.",
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
