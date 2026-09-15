from __future__ import annotations

from pathlib import Path
import os
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER_ROOT = ROOT / "portfolio-manager"
PORTFOLIO_ROOT = ROOT / "portfolio"
DEPLOY_WORKFLOW = ROOT / ".github" / "workflows" / "deploy-pages.yml"
SOURCE_TEMPLATE = ROOT / "templates" / "project-page" / "index.html"
PUBLIC_TEMPLATE = PORTFOLIO_ROOT / "projects" / "project-template" / "index.html"
RESUME = PORTFOLIO_ROOT / "assets" / "documents" / "Haley-Reeder-Resume.pdf"

sys.path.insert(0, str(MANAGER_ROOT))

# Synthetic local-only settings for Flask test-client release smoke testing.
os.environ["PORTFOLIO_MANAGER_SECRET_KEY"] = "release-e2e-ci-key"
os.environ["PORTFOLIO_MANAGER_PASSWORD_HASH"] = "release-e2e-ci-placeholder"
os.environ.pop("OPENAI_API_KEY", None)
os.environ.pop("PORTFOLIO_MANAGER_AI_MODEL", None)

import security as manager_security  # noqa: E402
import ai_settings_service as manager_ai_settings  # noqa: E402

manager_security.load_local_env = lambda *args, **kwargs: None
manager_ai_settings.ENV_PATH = ROOT / ".portfolio-manager" / "__release-e2e-no-ai.env"

import app as manager_app  # noqa: E402


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    # Public deployment boundary.
    require(SOURCE_TEMPLATE.exists(), "Reusable project source template is missing.", errors)
    require(not PUBLIC_TEMPLATE.exists(), "Unfinished project template must not exist inside deployed portfolio/.", errors)
    require(RESUME.exists(), "Public résumé PDF is missing.", errors)
    if RESUME.exists():
        require(RESUME.stat().st_size > 1024, "Public résumé PDF looks unexpectedly empty.", errors)
        try:
            require(RESUME.read_bytes()[:4] == b"%PDF", "Public résumé asset is not a valid PDF file.", errors)
        except OSError as exc:
            errors.append(f"Could not read public résumé PDF: {exc}")

    require(DEPLOY_WORKFLOW.exists(), "GitHub Pages deployment workflow is missing.", errors)
    if DEPLOY_WORKFLOW.exists():
        deploy = DEPLOY_WORKFLOW.read_text(encoding="utf-8")
        require('path: "./portfolio"' in deploy, "GitHub Pages must upload only the public portfolio directory.", errors)
        require('- main' in deploy, "GitHub Pages deployment must be limited to main.", errors)
        require('"portfolio/**"' in deploy, "Public portfolio changes must trigger deployment.", errors)
        require("actions/configure-pages@" in deploy and "actions/deploy-pages@" in deploy, "GitHub Pages deployment actions are incomplete.", errors)
        for private_marker in (".portfolio-manager", ".env", "portfolio-data"):
            require(private_marker not in deploy, f"Deployment workflow must not upload private/non-site path marker {private_marker!r}.", errors)

    # Core public routes expected in the release candidate.
    for public_path in (
        "index.html",
        "about/index.html",
        "contact/index.html",
        "projects/index.html",
        "projects/instructional-design/index.html",
        "projects/instructional-design/interactive-learning/index.html",
        "projects/instructional-design/interactive-learning/meddpicc-practice/index.html",
        "projects/instructional-design/interactive-learning/pursuit-positioning/index.html",
        "projects/ai-training-and-evaluation/index.html",
        "projects/ai-training-and-evaluation/ai-training-and-evaluation-demo/index.html",
        "projects/ai-training-and-evaluation/rubric-demo/index.html",
        "projects/ai-training-and-evaluation/workflow-demo/index.html",
        "projects/workflows/index.html",
    ):
        require((PORTFOLIO_ROOT / public_path).exists(), f"Expected public release page is missing: portfolio/{public_path}", errors)

    # Local Manager release smoke test.
    client = manager_app.app.test_client()
    with client.session_transaction() as session:
        session["portfolio_manager_authenticated"] = True

    surfaces = {
        "/": "Dashboard",
        "/help": "User Guide",
        "/content": "Manage Content",
        "/create/": "Create Content",
        "/create/new": "New Content Brief",
        "/create/references/": "Reference Library",
        "/assets": "Asset Library",
        "/site-content": "General Page Content",
        "/git/": "Save & Publish",
        "/ai/": "Advanced AI Drafting Helper",
        "/ai/settings": "AI Settings",
        "/manage/ai-review/": "AI Portfolio Review",
        "/ai/page-edit/proposals/": "Page Edit Proposal History",
    }
    rendered: dict[str, bytes] = {}
    for route, label in surfaces.items():
        response = client.get(route, follow_redirects=False)
        require(response.status_code == 200, f"{label} release surface must render at {route}; got HTTP {response.status_code}.", errors)
        rendered[route] = response.data

    dashboard = rendered.get("/", b"")
    for href, label in (
        (b'href="/content"', "Manage Content"),
        (b'href="/create/"', "Create Content"),
        (b'href="/git/"', "Save & Publish"),
        (b'href="/help"', "User Guide"),
    ):
        require(href in dashboard, f"Dashboard must link to {label}.", errors)

    create = rendered.get("/create/", b"")
    require(b'href="/create/references/"' in create, "Create Content must link to the Reference Library.", errors)
    require(b'href="/ai/"' in create, "Create Content must link to the Advanced AI Drafting Helper.", errors)

    manage = rendered.get("/content", b"")
    require(b'href="/manage/pages/home"' in manage, "Manage Content must link to the Home page editor.", errors)
    require(b"Open AI Portfolio Review" in manage, "Manage Content must expose AI Portfolio Review.", errors)
    require(b"Open Proposal History" in manage, "Manage Content must expose Proposal History.", errors)

    references = rendered.get("/create/references/", b"")
    require(b"Reference Library" in references, "Reference Library must identify the private-source workspace.", errors)
    require(b"Add Private Source" in references, "Reference Library must expose its private-source upload flow.", errors)

    help_page = rendered.get("/help", b"")
    require(b"Start here" in help_page, "User Guide must retain the task-first Start here section.", errors)
    require(b"Save &amp; Publish" in help_page, "User Guide must explain the publishing workflow.", errors)

    # The release build must still be localhost-only.
    app_text = (MANAGER_ROOT / "app.py").read_text(encoding="utf-8")
    require('app.run(host="127.0.0.1", port=5055, debug=False)' in app_text, "Portfolio Manager must remain bound to 127.0.0.1:5055.", errors)
    require('host="0.0.0.0"' not in app_text, "Portfolio Manager must not expose a network-wide bind.", errors)

    if errors:
        print("Release end-to-end regression failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Release end-to-end regression passed.")
    print("Verified public deploy boundary, key public pages/assets, localhost-only Manager, and Dashboard → Manage/Create/Reference/AI/Help/Publish navigation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
