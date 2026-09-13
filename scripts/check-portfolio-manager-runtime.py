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
        ("/git/", "Save & Publish"),
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
    require(b"Manage Portfolio Content" in dashboard.data, "Dashboard must expose the v2 manage-content workflow.", errors)
    require(b"Create Portfolio Content" in dashboard.data, "Dashboard must reserve the Create Content Lab workflow.", errors)
    require(b"Content Workspace &amp; Reference Library" in dashboard.data, "Dashboard must reserve the private reference workspace.", errors)
    require(b"Run Full Validation" in dashboard.data, "Dashboard must expose validation during the v2 transition.", errors)
    require(b"Save &amp; Publish" in dashboard.data, "Dashboard must keep the safe publishing workflow available during the v2 transition.", errors)
    require(b"Advanced Maintenance" in dashboard.data, "Dashboard must keep low-frequency maintenance clearly separated.", errors)
    require(b"Save New Content Request" not in dashboard.data, "Dashboard must not reintroduce the retired new-content request form.", errors)
    require(b"Save Edit Request" not in dashboard.data, "Dashboard must not reintroduce the retired edit-request form.", errors)

    asset_library = client.get("/assets")
    require(asset_library.status_code == 200, "Authenticated Asset Library must render.", errors)
    require(b"Public-file safety" in asset_library.data, "Asset Library must show the public-file safety warning.", errors)
    require(b"public_safe" in asset_library.data, "Asset Library must render public-safe confirmation control.", errors)

    content_manager = client.get("/content")
    require(content_manager.status_code == 200, "Manage Portfolio Content must render.", errors)
    require(b"Choose a page to edit" in content_manager.data, "Manage Portfolio Content must present human-facing page navigation.", errors)
    require(b"Interactive Learning" in content_manager.data, "Manage Portfolio Content must mirror the instructional-design hierarchy.", errors)
    require(b"AI Training and Evaluation" in content_manager.data, "Manage Portfolio Content must mirror the AI portfolio hierarchy.", errors)
    require(b"Systems and Workflows" in content_manager.data, "Manage Portfolio Content must mirror the workflows hierarchy.", errors)
    require(b"Edit Demo Copy" not in content_manager.data, "Manage Portfolio Content must not expose duplicate edit entry points for AI Evaluation.", errors)

    meddpicc_editor = client.get("/content/projects/meddpicc-practice")
    require(meddpicc_editor.status_code == 200, "Project editor must render.", errors)
    require(b"Manage Current Assets" in meddpicc_editor.data, "Project editor must retain a safe path to asset management.", errors)
    require(b"Live local preview" in meddpicc_editor.data, "Project editor must provide the real local preview surface.", errors)
    require(b"Edit Visible Page Copy" in meddpicc_editor.data, "MEDDPICC project editor must connect to full visible-page copy editing.", errors)

    custom_editor = client.get("/content/projects/pursuit-positioning")
    require(custom_editor.status_code == 200, "Custom project editor must render.", errors)
    require(b"Project identity" in custom_editor.data, "Custom project editor must explain the project-title/reference boundary.", errors)
    require(b"Edit Visible Page Copy" in custom_editor.data, "Custom project editor must connect to full visible-page copy editing.", errors)

    ai_project_editor = client.get("/content/projects/ai-training-and-evaluation-demo")
    require(ai_project_editor.status_code == 200, "AI Evaluation project editor must render.", errors)
    require(b"Edit Visible Page Copy" in ai_project_editor.data, "AI Evaluation project editor must expose one route into demo copy editing.", errors)

    general_library = client.get("/site-content")
    require(general_library.status_code == 200, "General Page Content library must remain available during transition.", errors)

    home_editor = client.get("/manage/pages/home")
    require(home_editor.status_code == 200, "Home v2 page editor must render.", errors)
    require(b"Current visible content" in home_editor.data, "General page editor must use the v2 visible-content model.", errors)
    require(b"Live local preview" in home_editor.data, "General page editor must provide the real local preview surface.", errors)
    require(b"private_note" in home_editor.data, "General page editor must provide private page notes.", errors)
    require(b"AI-assisted edit" in home_editor.data, "General page editor must reserve the page-aware AI helper surface.", errors)

    for page_id, label in [
        ("about", "About Me"),
        ("interactive-learning", "Interactive Learning"),
        ("multimedia", "Multimedia"),
        ("complete-learning-paths", "Complete Learning Pathways"),
        ("ai-evaluation-demo", "AI Evaluation Demo"),
        ("rubric-demo", "Rubric Demo"),
        ("workflow-demo", "Workflow Demo"),
    ]:
        editor = client.get(f"/manage/pages/{page_id}")
        require(editor.status_code == 200, f"{label} v2 page editor must render.", errors)
        require(b"Current visible content" in editor.data, f"{label} must expose visible page copy.", errors)

    git_workflow = client.get("/git/")
    require(git_workflow.status_code == 200, "Authenticated Save & Publish workflow must render.", errors)
    require(b"Commit and publish are separate actions" in git_workflow.data, "Save & Publish must explain its safety boundary.", errors)
    require(b"Review Changed Files" in git_workflow.data, "Save & Publish must expose explicit file review before commit.", errors)
    require(b"Validate &amp; Commit Changes" in git_workflow.data, "Save & Publish must expose validation-gated commit control.", errors)
    require(b"Publish to GitHub" in git_workflow.data, "Save & Publish must expose explicit publishing control.", errors)
    require(b"Open Pull Request" not in git_workflow.data, "Routine Save & Publish must not require pull requests.", errors)

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
