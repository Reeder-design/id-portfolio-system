from __future__ import annotations

from pathlib import Path
import ast
import os
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
ASSET_ROUTES = MANAGER / "asset_routes.py"
SITE_ROUTES = MANAGER / "site_content_routes.py"
PROJECT_TEMPLATE = MANAGER / "templates" / "project-editor.html"
PAGE_TEMPLATE = MANAGER / "templates" / "page-editor-v2.html"
INLINE_TEMPLATE = MANAGER / "templates" / "_project-assets-inline.html"
ASSET_CSS = MANAGER / "static" / "asset-manager.css"
VALIDATION = MANAGER / "validation_service.py"
WORKFLOW = ROOT / ".github" / "workflows" / "validate-site.yml"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    paths = [
        ASSET_ROUTES,
        SITE_ROUTES,
        PROJECT_TEMPLATE,
        PAGE_TEMPLATE,
        INLINE_TEMPLATE,
        ASSET_CSS,
        VALIDATION,
        WORKFLOW,
    ]
    for path in paths:
        require(path.exists(), f"Missing Manage asset integration file: {path.relative_to(ROOT)}", errors)
    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    asset_routes = ASSET_ROUTES.read_text(encoding="utf-8")
    site_routes = SITE_ROUTES.read_text(encoding="utf-8")
    project_template = PROJECT_TEMPLATE.read_text(encoding="utf-8")
    page_template = PAGE_TEMPLATE.read_text(encoding="utf-8")
    inline_template = INLINE_TEMPLATE.read_text(encoding="utf-8")
    asset_css = ASSET_CSS.read_text(encoding="utf-8")
    validation = VALIDATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")

    for path, text in ((ASSET_ROUTES, asset_routes), (SITE_ROUTES, site_routes)):
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require("asset_return_url" in asset_routes, "Asset actions must return to their originating editor through a dedicated allowlisted helper.", errors)
    require('return_to == "project"' in asset_routes, "Asset return routing must explicitly allow the structured project editor.", errors)
    require('return_to.startswith("page:")' in asset_routes and "CUSTOM_PROJECT_PAGES.get(project_id) == page_id" in asset_routes, "Custom page returns must be constrained to the known project/page mapping.", errors)
    require("redirect(asset_return_url(project_id), code=303)" in asset_routes, "Inline upload/update/replace/remove actions must use POST/redirect/GET back to the editor.", errors)
    require("require_public_safe_confirmation()" in asset_routes, "Public asset upload/replacement must retain the explicit public-safe confirmation.", errors)
    require("find_asset_references(path)" in asset_routes, "Asset removal must retain the reference scan before deleting a public file.", errors)

    require("_project-assets-inline.html" in project_template, "Structured project editor must render the inline asset workspace.", errors)
    require("asset_return_to = 'project'" in project_template, "Structured project editor must identify itself as the trusted asset return destination.", errors)
    require("asset_project" in page_template and "_project-assets-inline.html" in page_template, "Custom page editor must render connected project assets when available.", errors)
    require("CUSTOM_PAGE_PROJECTS" in site_routes and '"meddpicc-demo": "meddpicc-practice"' in site_routes, "Custom page editor must use an explicit page-to-project asset mapping.", errors)
    require('asset_return_to=f"page:{page_id}" if asset_project else ""' in site_routes, "Custom page asset actions must return to the same page editor.", errors)

    require("Add Public Asset" in inline_template, "Inline editor must expose a human-facing asset upload action.", errors)
    require('name="public_safe"' in inline_template, "Inline upload/replacement controls must expose public-safe confirmation.", errors)
    require('name="return_to"' in inline_template, "Inline asset forms must preserve their trusted editor return context.", errors)
    require("Save Asset Details" in inline_template and "Replace File" in inline_template and "Remove Asset" in inline_template, "Inline editor must support metadata, replacement, and removal without leaving Manage.", errors)
    require("Open Full Asset Library" in inline_template, "The existing full Asset Library must remain available as an advanced view.", errors)
    require("v2-inline-asset-grid" in asset_css and "object-fit: contain" in asset_css, "Inline asset previews must use the bounded existing preview treatment.", errors)

    for forbidden in ("git add", "git commit", "git push"):
        require(forbidden not in inline_template + site_routes, f"Manage asset integration must not add Git publishing authority: found {forbidden}", errors)

    require("scripts/check-manage-assets.py" in validation, "Portfolio Manager Full Validation must include Manage asset integration safety.", errors)
    require("python scripts/check-manage-assets.py" in workflow, "GitHub Actions must run Manage asset integration safety.", errors)

    if not errors:
        sys.path.insert(0, str(MANAGER))
        try:
            os.environ["PORTFOLIO_MANAGER_SECRET_KEY"] = "ci-manage-assets-key"
            os.environ["PORTFOLIO_MANAGER_PASSWORD_HASH"] = "ci-manage-assets-placeholder"
            os.environ.pop("OPENAI_API_KEY", None)

            import security as manager_security  # noqa: E402
            import ai_settings_service as manager_ai_settings  # noqa: E402

            manager_security.load_local_env = lambda *args, **kwargs: None
            manager_ai_settings.ENV_PATH = ROOT / ".portfolio-manager" / "__manage-assets-test-no-ai.env"

            import app as manager_app  # noqa: E402

            client = manager_app.app.test_client()
            with client.session_transaction() as session:
                session["portfolio_manager_authenticated"] = True

            project_page = client.get("/content/projects/meddpicc-practice")
            require(project_page.status_code == 200, "Structured project editor must render with inline asset integration.", errors)
            require(b"Project assets" in project_page.data and b"Add Public Asset" in project_page.data, "Structured project editor must expose inline project assets at runtime.", errors)

            custom_page = client.get("/manage/pages/meddpicc-demo")
            require(custom_page.status_code == 200, "Custom project page editor must render with connected assets.", errors)
            require(b"Project assets" in custom_page.data and b"Add Public Asset" in custom_page.data, "Custom project page editor must expose the same inline asset workspace.", errors)

            general_page = client.get("/manage/pages/home")
            require(general_page.status_code == 200, "General page editor must continue to render.", errors)
            require(b"Add Public Asset" not in general_page.data, "General pages without project asset records must not receive irrelevant asset controls.", errors)
        except Exception as exc:
            errors.append(f"Manage asset integration runtime safety test failed: {exc}")

    if errors:
        print("Manage asset integration validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Manage asset integration safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
