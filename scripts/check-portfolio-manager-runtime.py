from __future__ import annotations

from pathlib import Path
import os
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER_ROOT = ROOT / "portfolio-manager"
sys.path.insert(0, str(MANAGER_ROOT))

# Smoke-test values exist only in this process. The test injects an authenticated
# session directly and never performs a password login.
os.environ["PORTFOLIO_MANAGER_SECRET_KEY"] = "ci-smoke-test-key"
os.environ["PORTFOLIO_MANAGER_PASSWORD_HASH"] = "ci-smoke-test-placeholder"
os.environ.pop("OPENAI_API_KEY", None)
os.environ.pop("PORTFOLIO_MANAGER_AI_MODEL", None)

import app as manager_app  # noqa: E402


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    client = manager_app.app.test_client()

    for protected_path, label in [
        ("/assets", "Asset Library"),
        ("/site-content", "General Page Content"),
        ("/git/", "Git Workflow"),
        ("/ai/", "AI Assistance"),
    ]:
        unauthenticated = client.get(protected_path, follow_redirects=False)
        require(
            unauthenticated.status_code in {301, 302, 303, 307, 308},
            f"Unauthenticated {label} request must redirect to login.",
            errors,
        )
        require(
            "/login" in unauthenticated.headers.get("Location", ""),
            f"Unauthenticated {label} redirect must target login.",
            errors,
        )

    with client.session_transaction() as session:
        session["portfolio_manager_authenticated"] = True

    dashboard = client.get("/")
    require(dashboard.status_code == 200, "Authenticated dashboard must render.", errors)
    require(b"Open Asset Library" in dashboard.data, "Dashboard must expose the Asset Library.", errors)
    require(b"Open General Page Content" in dashboard.data, "Dashboard must expose general page content management.", errors)
    require(b"Open Git Workflow" in dashboard.data, "Dashboard must expose the guarded Git workflow.", errors)
    require(b"Open AI Assistance" in dashboard.data, "Dashboard must expose proposal-only AI assistance.", errors)

    asset_library = client.get("/assets")
    require(asset_library.status_code == 200, "Authenticated Asset Library must render.", errors)
    require(b"Public-file safety" in asset_library.data, "Asset Library must show the public-file safety warning.", errors)
    require(b"public_safe" in asset_library.data, "Asset Library must render public-safe confirmation control.", errors)

    content_manager = client.get("/content")
    require(content_manager.status_code == 200, "Content Manager must still render.", errors)
    require(b"Manage Assets" in content_manager.data, "Content Manager must link projects to asset management.", errors)
    require(b"General Page Content" in content_manager.data, "Content Manager must link to general page editing.", errors)

    general_library = client.get("/site-content")
    require(general_library.status_code == 200, "General Page Content library must render.", errors)
    require(b"Copy fields only" in general_library.data, "General Page Content must explain its safe editing boundary.", errors)

    home_editor = client.get("/site-content/home")
    require(home_editor.status_code == 200, "Home general-page editor must render.", errors)
    require(b"public_safe" in home_editor.data, "General page editor must render public-safe confirmation.", errors)
    require(b"field__hero_copy" in home_editor.data, "General page editor must render approved structured fields.", errors)

    git_workflow = client.get("/git/")
    require(git_workflow.status_code == 200, "Authenticated Git Workflow must render.", errors)
    require(b"Merge is intentionally outside Portfolio Manager" in git_workflow.data, "Git Workflow must show the no-merge safety boundary.", errors)
    require(b"Review Changed Files" in git_workflow.data, "Git Workflow must expose explicit file review before staging.", errors)
    require(b"Run Validation & Commit" in git_workflow.data, "Git Workflow must expose validation-gated commit control.", errors)

    ai_workspace = client.get("/ai/")
    require(ai_workspace.status_code == 200, "Authenticated AI Assistance workspace must render without an API key.", errors)
    require(b"AI Not Configured" in ai_workspace.data, "AI workspace must fail open safely when optional AI is not configured.", errors)
    require(b"AI proposes. You decide what gets used." in ai_workspace.data, "AI workspace must show the proposal-only approval boundary.", errors)
    require(b"provider_ack" in ai_workspace.data and b"authority_ack" in ai_workspace.data, "AI workspace must render explicit provider and authorization acknowledgements.", errors)

    if errors:
        print("Portfolio Manager runtime validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Portfolio Manager runtime smoke test passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
