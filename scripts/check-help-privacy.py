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
    validation = VALIDATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")

    # Current human-facing workflow model.
    for phrase in [
        "The three kinds of work",
        "Where information lives",
        "Manage Content",
        "Reference Library: private source preparation",
        "Ask AI About This Resource",
        "Sanitization review",
        "Create Content Lab",
        "Advanced AI Drafting Helper",
        "Approve &amp; Apply Locally",
        "Related References",
        "AI Portfolio Review",
        "Approved for Portfolio Use does not publish a file",
        "Privacy &amp; security",
        "Publish to GitHub",
    ]:
        require(phrase in guide, f"User Guide must document the current workflow: missing {phrase!r}.", errors)

    for path_label in [".env", ".portfolio-manager/", "portfolio-data/", "portfolio/"]:
        require(path_label in guide, f"User Guide privacy model must explain {path_label}.", errors)
        require(path_label in drawer, f"Privacy drawer must explain {path_label}.", errors)

    for phrase in [
        "image pixels are not locally OCR/preflighted",
        "Private notes, tags, approval notes, unrelated Reference Library resources",
        "private originals stay outside the brief/build AI context",
    ]:
        require(phrase in guide, f"User Guide must preserve the AI/privacy boundary: missing {phrase!r}.", errors)

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
    ]:
        require(stale not in guide + drawer, f"Stale help copy must be removed: found {stale!r}.", errors)

    require("Privacy &amp; Security" in dashboard, "Dashboard privacy action must use the current Privacy & Security label.", errors)
    require('data-help-key="privacy"' in dashboard, "Dashboard privacy action must keep the contextual privacy drawer.", errors)

    # Every contextual help button in Portfolio Manager should have a matching topic.
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

    print(f"User Guide/privacy validation passed with {len(referenced_keys)} contextual help key(s) covered.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
