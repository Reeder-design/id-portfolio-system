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

# Keep this smoke test independent from the developer's real local .env.
import security as manager_security  # noqa: E402
import ai_settings_service as manager_ai_settings  # noqa: E402

manager_security.load_local_env = lambda *args, **kwargs: None
manager_ai_settings.ENV_PATH = ROOT / ".portfolio-manager" / "__runtime-test-no-ai.env"

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
        ("/ai/settings", "AI Settings"),
        ("/manage/ai-review/", "AI Portfolio Review"),
        ("/create/", "Create Content"),
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
    require(b"AI Settings" in dashboard.data, "Dashboard must keep global AI Settings available.", errors)
    require(b"Manage Content" in dashboard.data, "Dashboard must expose the Manage Content workflow.", errors)
    require(b"Create Content" in dashboard.data, "Dashboard must expose the Create Content workflow.", errors)
    require(b'href="/create/"' in dashboard.data, "Dashboard Create Content card must open the Create Content workspace.", errors)
    require(b"Create Content \xc2\xb7 upcoming" not in dashboard.data, "Create Content must no longer be marked upcoming.", errors)
    require(b"Open AI Assistance" not in dashboard.data, "Dashboard must not expose generic AI Assistance as a third primary workflow.", errors)
    require(b"Content Workspace &amp; Reference Library" not in dashboard.data, "Dashboard must keep Create Content sub-tools inside the Create workspace.", errors)
    require(b"Run Full Validation" in dashboard.data, "Dashboard must keep full validation available.", errors)
    require(b"Save &amp; Publish" in dashboard.data, "Dashboard must keep the safe publishing workflow available.", errors)
    require(b"Advanced Maintenance" in dashboard.data, "Dashboard must keep low-frequency maintenance clearly separated.", errors)
    require(b"Save New Content Request" not in dashboard.data, "Dashboard must not reintroduce the retired new-content request form.", errors)
    require(b"Save Edit Request" not in dashboard.data, "Dashboard must not reintroduce the retired edit-request form.", errors)

    create_workspace = client.get("/create/")
    require(create_workspace.status_code == 200, "Create Content workspace must render.", errors)
    require(b"Start New Content Brief" in create_workspace.data, "Create Content must start with a guided Content Brief.", errors)
    require(b"Advanced AI Drafting Helper" in create_workspace.data, "Create Content must contain the generic AI helper as a secondary tool.", errors)
    require(b"Content Workspace &amp; Reference Library" in create_workspace.data, "Create Content must expose the private Reference Library workflow.", errors)
    require(b"Open Reference Library" in create_workspace.data, "Create Content must link into the active Reference Library.", errors)
    require(b"Reference Library \xc2\xb7 upcoming" not in create_workspace.data, "Reference Library must not be marked upcoming after activation.", errors)
    require(b"trusted source context" in create_workspace.data, "Create Content must describe Approved Sources as active brief context.", errors)

    new_brief = client.get("/create/new")
    require(new_brief.status_code == 200, "New Content Brief editor must render.", errors)
    require(b"What am I making?" in new_brief.data, "Content Brief must ask what the user is making.", errors)
    require(b"Why am I making it?" in new_brief.data, "Content Brief must ask why the artifact is being created.", errors)
    require(b"Approved source context" in new_brief.data, "Content Brief must expose approved Reference Library source selection.", errors)
    require(b"Public-safety constraints" in new_brief.data, "Content Brief must expose public-safety constraints.", errors)
    require(b"Personal direction" in new_brief.data, "Content Brief must expose personal direction and tone constraints.", errors)
    require(b"Create Content Brief" in new_brief.data, "New brief must save privately before AI planning.", errors)
    require(b"Generate AI Plan" not in new_brief.data, "AI planning must not be available until a Content Brief has first been saved.", errors)

    asset_library = client.get("/assets")
    require(asset_library.status_code == 200, "Authenticated Asset Library must render.", errors)
    require(b"Public-file safety" in asset_library.data, "Asset Library must show the public-file safety warning.", errors)
    require(b"public_safe" in asset_library.data, "Asset Library must render public-safe confirmation control.", errors)

    content_manager = client.get("/content")
    require(content_manager.status_code == 200, "Manage Content must render.", errors)
    require(b"Choose a page to edit" in content_manager.data, "Manage Content must present human-facing page navigation.", errors)
    require(b"Open AI Portfolio Review" in content_manager.data, "Manage Content must expose portfolio-wide AI Review.", errors)
    require(b"Open Proposal History" in content_manager.data, "Manage Content must expose page-edit AI proposal history.", errors)
    require(b"Theme Editor" in content_manager.data, "Manage Content must retain the deferred Theme Editor placeholder.", errors)
    require(b"Interactive Learning" in content_manager.data, "Manage Content must mirror the instructional-design hierarchy.", errors)
    require(b"AI Training and Evaluation" in content_manager.data, "Manage Content must mirror the AI portfolio hierarchy.", errors)
    require(b"Systems and Workflows" in content_manager.data, "Manage Content must mirror the workflows hierarchy.", errors)
    require(b"Edit Demo Copy" not in content_manager.data, "Manage Content must not expose duplicate edit entry points for AI Evaluation.", errors)

    review_workspace = client.get("/manage/ai-review/")
    require(review_workspace.status_code == 200, "AI Portfolio Review workspace must render.", errors)
    require(b"Portfolio Review" in review_workspace.data, "AI Portfolio Review workspace must identify its review purpose.", errors)
    require(b"Set Up AI" in review_workspace.data, "AI Portfolio Review without a configured key must provide the global AI Settings path.", errors)
    require(b"Run Portfolio Review" not in review_workspace.data, "AI Portfolio Review must remain disabled when AI is not configured.", errors)

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
    require(b"AI-assisted edit" in home_editor.data, "General page editor must expose the page-aware AI helper surface.", errors)
    require(b"Set Up AI" in home_editor.data, "Without an API key, page-aware AI must show a setup path instead of an active generation control.", errors)
    require(b"Generate AI Proposal" not in home_editor.data, "Without an API key, page-aware AI generation must remain disabled.", errors)

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

    ai_settings = client.get("/ai/settings")
    require(ai_settings.status_code == 200, "AI Settings must render without an API key.", errors)
    require(b"AI not configured" in ai_settings.data, "AI Settings must clearly report the unconfigured state.", errors)
    require(b"OPENAI_API_KEY" not in ai_settings.data, "AI Settings must not expose an environment-variable dump.", errors)
    require(b"What gets sent" in ai_settings.data, "AI Settings must explain the page-aware privacy boundary.", errors)
    require(b"private page notes" in ai_settings.data, "AI Settings must state that private page notes are excluded from page-aware requests.", errors)

    with client.session_transaction() as session:
        csrf = manager_app.csrf_token.__wrapped__() if hasattr(manager_app.csrf_token, "__wrapped__") else None
        csrf = session.get("_csrf_token") or "ci-page-ai-csrf"
        session["_csrf_token"] = csrf

    no_key_generate = client.post(
        "/ai/page-edit/home/generate",
        data={"csrf_token": csrf, "ai_request": "Make the hero spacing more consistent."},
        follow_redirects=False,
    )
    require(
        no_key_generate.status_code in {301, 302, 303, 307, 308},
        "Page-aware AI without a configured key must redirect safely instead of attempting generation.",
        errors,
    )
    require(
        "/ai/settings" in no_key_generate.headers.get("Location", ""),
        "Page-aware AI without a configured key must send the user to AI Settings.",
        errors,
    )

    no_key_review = client.post(
        "/manage/ai-review/run",
        data={"csrf_token": csrf, "provider_ack": "on", "focus": "Review clarity."},
        follow_redirects=False,
    )
    require(
        no_key_review.status_code in {301, 302, 303, 307, 308},
        "Portfolio review without configured AI must redirect safely.",
        errors,
    )
    require(
        "/ai/settings" in no_key_review.headers.get("Location", ""),
        "Portfolio review without configured AI must use the global AI Settings path.",
        errors,
    )

    git_workflow = client.get("/git/")
    require(git_workflow.status_code == 200, "Authenticated Save & Publish workflow must render.", errors)
    require(b"Commit and publish are separate actions" in git_workflow.data, "Save & Publish must explain its safety boundary.", errors)
    require(b"Review Changed Files" in git_workflow.data, "Save & Publish must expose explicit file review before commit.", errors)
    require(b"Validate &amp; Commit Changes" in git_workflow.data, "Save & Publish must expose validation-gated commit control.", errors)
    require(b"Publish to GitHub" in git_workflow.data, "Save & Publish must expose explicit publishing control.", errors)
    require(b"Open Pull Request" not in git_workflow.data, "Routine Save & Publish must not require pull requests.", errors)

    ai_workspace = client.get("/ai/")
    require(ai_workspace.status_code == 200, "Advanced AI Drafting Helper must render.", errors)
    require(b"Advanced AI Drafting Helper" in ai_workspace.data, "Generic AI Assistance must be reframed as a Create Content supporting tool.", errors)
    require(b"Back to Create Content" in ai_workspace.data, "Advanced AI helper must return to Create Content.", errors)
    require(b"Page Edit Proposal History" not in ai_workspace.data, "Manage-only proposal history must not appear in the Create Content AI helper.", errors)
    require(b"AI Not Configured" in ai_workspace.data, "AI helper must fail open safely when optional AI is not configured.", errors)
    require(b"AI proposes. You decide what gets used." in ai_workspace.data, "AI helper must show the proposal-only approval boundary.", errors)
    require(b"provider_ack" in ai_workspace.data and b"authority_ack" in ai_workspace.data, "AI helper must render explicit provider and authorization acknowledgements.", errors)

    page_history = client.get("/ai/page-edit/proposals/")
    require(page_history.status_code == 200, "Authenticated page-edit proposal history must render.", errors)
    require(b"Page Edit Proposal History" in page_history.data, "Page-edit proposal history must expose its private-history purpose.", errors)
    require(b"Back to Manage Content" in page_history.data, "Page-edit proposal history must return to Manage Content rather than generic AI Assistance.", errors)
    require(b"Proposal Only" in page_history.data and b"Applied Locally" in page_history.data and b"Reverted" in page_history.data, "Page-edit proposal history must expose lifecycle filters.", errors)

    if errors:
        print("Portfolio Manager runtime validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Portfolio Manager runtime smoke test passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
