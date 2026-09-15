from __future__ import annotations

from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
TEMPLATES = MANAGER / "templates"
GUIDE = TEMPLATES / "help.html"
DRAWER = TEMPLATES / "_help_drawer.html"
DASHBOARD = TEMPLATES / "dashboard.html"
HELP_JS = MANAGER / "static" / "help.js"
HELP_CSS = MANAGER / "static" / "help.css"
VALIDATION = MANAGER / "validation_service.py"
WORKFLOW = ROOT / ".github" / "workflows" / "validate-site.yml"

HELP_KEY_RE = re.compile(r'data-help-key="([^"]+)"')
HELP_TEMPLATE_RE = re.compile(r'data-help-template="([^"]+)"')


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path, label in [
        (GUIDE, "User Guide"),
        (DRAWER, "help drawer"),
        (DASHBOARD, "dashboard"),
        (HELP_JS, "help JavaScript"),
        (HELP_CSS, "help styles"),
        (VALIDATION, "Portfolio Manager validation service"),
        (WORKFLOW, "GitHub validation workflow"),
    ]:
        require(path.exists(), f"Missing {label}: {path.relative_to(ROOT)}", errors)

    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    guide = GUIDE.read_text(encoding="utf-8")
    drawer = DRAWER.read_text(encoding="utf-8")
    dashboard = DASHBOARD.read_text(encoding="utf-8")
    help_js = HELP_JS.read_text(encoding="utf-8")
    help_css = HELP_CSS.read_text(encoding="utf-8")
    validation = VALIDATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")
    guide_lower = guide.lower()

    # The guide should answer decisions/tasks rather than only describe architecture.
    for phrase in [
        "Start here: what are you trying to do?",
        "The button dictionary",
        "Two Git workflows that should not be confused",
        "Where information lives: private vs. public",
        "Manage existing portfolio work",
        "Which AI tool should I use?",
        "Reference Library: when the source is private or not ready",
        "Create Content Lab: build the idea before the page",
        "Advanced AI Drafting Helper",
        "Publishing: the part that actually makes changes live",
        "Git/GitHub without developer-brain",
        "AI privacy: “what exactly leaves my Mac?”",
        "When something goes wrong: diagnose before fixing",
        "Approve &amp; Apply Locally",
        "Related References",
        "AI Portfolio Review",
        "Approved for Portfolio Use does not publish a file",
        "Publish to GitHub",
    ]:
        require(phrase in guide, f"User Guide must document the current decision/workflow model: missing {phrase!r}.", errors)

    for path_label in [".env", ".portfolio-manager/", "portfolio-data/", "portfolio/"]:
        require(path_label in guide, f"User Guide privacy model must explain {path_label}.", errors)
        require(path_label in drawer, f"Privacy drawer must explain {path_label}.", errors)

    for phrase in [
        "image pixels are not locally ocr/preflighted",
        "private notes, tags, approval notes, unrelated reference library resources",
        "private originals stay outside the brief/build ai context",
    ]:
        require(phrase in guide_lower, f"User Guide must preserve the AI/privacy boundary: missing {phrase!r}.", errors)

    # Haley's recurring management boundary: developing the tool is not normal content publishing.
    for phrase in [
        "feature branch",
        "UAT",
        "merge PR#",
        "branch/PR = we are developing the tool",
        "Save &amp; Publish = you are using the tool to publish portfolio content",
    ]:
        require(phrase in guide, f"User Guide must explain the development-vs-publishing distinction: missing {phrase!r}.", errors)
    require('data-help-template="dev-workflow"' in drawer, "Help drawer must include the feature branch / PR testing topic.", errors)
    require('data-help-template="button-safety"' in drawer, "Help drawer must include the button-safety topic.", errors)

    # Search should use explicit aliases/tags and provide visible feedback.
    require("data-guide-tags" in guide, "Guide sections must expose searchable topic aliases/tags.", errors)
    require("data-guide-search-chip" in guide, "Guide must expose common-task search chips.", errors)
    require("data-help-search-status" in guide and "data-help-no-results" in guide, "Guide search must report results and no-results state.", errors)
    for marker in ["dataset.guideTags", "terms.every", "visibleCount", "data-guide-search-chip"]:
        require(marker in help_js, f"Help search must support robust tagged search: missing {marker!r}.", errors)
    require("guide-search-chips" in help_css and "guide-no-results" in help_css, "Help styles must support search chips and no-results feedback.", errors)

    # The drawer must never trap the user inside one selected topic.
    require("data-help-nav" in drawer and "data-help-back" in drawer and "data-help-home" in drawer, "Help drawer must expose Back and All Topics navigation.", errors)
    for marker in ["goBackInHelp", "showHelpHome", "history", "data-help-back", "data-help-home"]:
        require(marker in help_js, f"Help JavaScript must support returning from a selected topic: missing {marker!r}.", errors)

    # Newer feature pages should receive contextual help automatically so adding a route
    # does not depend on remembering to hand-place a question-mark button in every template.
    for marker in [
        "contextualHelpRules",
        "addContextualPageHelp",
        "reference-ai",
        "sanitization",
        "reference-library",
        "create-content",
        "general-content",
        "save-project",
        "page-ai",
        "portfolio-review",
        "related-references",
        "assets",
        "git-workflow",
        "ai-assistance",
    ]:
        require(marker in help_js, f"Contextual help auto-routing is missing {marker!r}.", errors)

    # Current safety behavior must be reflected in helper copy, not an older workflow model.
    for phrase in [
        "Release end-to-end",
        "Keep Local Build",
        "checks every generated-file hash",
        "destructive deletion is blocked",
        "checks every outgoing path",
        "127.0.0.1:5055",
        "GitHub Pages deploys only",
    ]:
        require(phrase in drawer, f"Help drawer must explain current safety behavior: missing {phrase!r}.", errors)

    # Shared confirmation copy should cover newer destructive/stateful actions too.
    for marker in [
        "revert-created-project",
        "delete-reference-item",
        "delete-sanitized-derivative",
        "checks every generated file hash",
        "reruns Full Validation immediately before push",
    ]:
        require(marker in help_js, f"Help confirmations must cover current state-safety behavior: missing {marker!r}.", errors)

    for stale in [
        "What the three main workspaces mean",
        "planned Create Content Lab",
        "planned private area",
        "The next safety step will add",
        "Asset controls will eventually move",
        "future Content Workspace",
        "What is still coming",
        "AI cannot apply changes or publish",
        "There is intentionally no Apply-to-site action",
        "real preview → Keep or Revert",
    ]:
        require(stale not in guide + drawer, f"Stale help copy must be removed: found {stale!r}.", errors)

    require("Privacy &amp; Security" in dashboard, "Dashboard privacy action must use the current Privacy & Security label.", errors)
    require('data-help-key="privacy"' in dashboard, "Dashboard privacy action must keep the contextual privacy drawer.", errors)

    # Every hand-placed contextual help button in Portfolio Manager should have a matching topic.
    drawer_topics = set(HELP_TEMPLATE_RE.findall(drawer))
    referenced_keys: set[str] = set()
    for template_path in TEMPLATES.glob("*.html"):
        text = template_path.read_text(encoding="utf-8")
        referenced_keys.update(HELP_KEY_RE.findall(text))

    missing_topics = sorted(referenced_keys - drawer_topics)
    require(
        not missing_topics,
        "Every data-help-key must have a matching drawer template. Missing: " + ", ".join(missing_topics),
        errors,
    )

    require("scripts/check-help-privacy.py" in validation, "Full Validation must include User Guide/privacy freshness.", errors)
    require("python scripts/check-help-privacy.py" in workflow, "GitHub Actions must validate User Guide/privacy freshness.", errors)

    if errors:
        print("User Guide and privacy validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print(f"User Guide/privacy validation passed with {len(referenced_keys)} hand-placed help key(s) plus contextual route coverage.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
