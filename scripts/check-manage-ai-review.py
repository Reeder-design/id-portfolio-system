from __future__ import annotations

from pathlib import Path
import ast


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "portfolio_review_service.py"
ROUTES = MANAGER / "portfolio_review_routes.py"
WORKSPACE = MANAGER / "templates" / "portfolio-ai-review.html"
RESULT = MANAGER / "templates" / "portfolio-ai-review-result.html"
CONTENT_MANAGER = MANAGER / "templates" / "content-manager.html"
DASHBOARD = MANAGER / "templates" / "dashboard.html"
APP = MANAGER / "app.py"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    files = [SERVICE, ROUTES, WORKSPACE, RESULT, CONTENT_MANAGER, DASHBOARD, APP]
    for path in files:
        require(path.exists(), f"Missing Manage AI Review file: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    workspace = WORKSPACE.read_text(encoding="utf-8")
    result = RESULT.read_text(encoding="utf-8")
    manager = CONTENT_MANAGER.read_text(encoding="utf-8")
    dashboard = DASHBOARD.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")

    for path, text in [(SERVICE, service), (ROUTES, routes)]:
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require('PORTFOLIO_ROOT = REPO_ROOT / "portfolio"' in service, "Portfolio review must use the public portfolio root.", errors)
    require('PORTFOLIO_ROOT.rglob("index.html")' in service, "Portfolio review must gather only public index pages.", errors)
    require('REVIEWS_ROOT = PRIVATE_ROOT / "ai-reviews"' in service, "Portfolio reviews must be stored in the private manager workspace.", errors)
    require("AI_REVIEW_INSTRUCTIONS" in service, "Portfolio review must use an explicit review-only instruction contract.", errors)
    require("no permission to edit files" in service, "Portfolio review instructions must deny file editing.", errors)
    require("Do not return code patches" in service, "Portfolio review instructions must prohibit code patches.", errors)
    require("portfolio_fingerprint" in service and 'value["stale"]' in service, "Saved reviews must detect when the portfolio has changed.", errors)
    require("page_path not in allowed_paths" in service, "AI page references must be constrained to reviewed public pages.", errors)

    forbidden = ("git add", "git commit", "git push", "subprocess", "render-project.py", "render-site-content.py")
    for target in forbidden:
        require(target not in service + routes, f"Portfolio review must remain advisory-only: found {target}", errors)

    require('request.form.get("provider_ack") != "on"' in routes, "Portfolio review must require explicit provider acknowledgement.", errors)
    require("generate_portfolio_review" in routes and "save_portfolio_review" in routes, "Portfolio review generation and private storage must remain separate.", errors)
    require('code=303' in routes, "Portfolio review POST actions must use POST/redirect/GET navigation.", errors)
    require("app.register_blueprint(portfolio_review_bp)" in app, "Portfolio review blueprint must be registered.", errors)

    require("Open AI Portfolio Review" in manager, "Manage Content must expose AI Portfolio Review.", errors)
    require("Open Proposal History" in manager, "Manage Content must expose page AI proposal history.", errors)
    require("Theme Editor · later" in manager, "Manage Content must retain the deferred Theme Editor placeholder.", errors)
    require("Run Full Validation" not in manager and "Save &amp; Publish" not in manager, "Validation and publishing must remain on the homepage, not move into Manage Content.", errors)

    require("AI Settings" in dashboard, "Global AI Settings must remain on the homepage.", errors)
    require("Run Full Validation" in dashboard, "Full validation must remain on the homepage.", errors)
    require("Save &amp; Publish" in dashboard, "Save & Publish must remain on the homepage.", errors)
    require("Advanced Maintenance" in dashboard, "Advanced Maintenance must remain on the homepage.", errors)
    require("Open AI Assistance" not in dashboard, "Generic AI Assistance must not remain a third homepage workflow.", errors)
    require("Manage Content" in dashboard and "Create Content" in dashboard, "Homepage primary workflow must stay Manage Content / Create Content.", errors)

    require("Run Portfolio Review" in workspace and 'name="provider_ack"' in workspace, "Review workspace must expose explicit human-triggered review controls.", errors)
    require("Prioritized findings" in result and "Quick wins" in result, "Review result must surface prioritized actionable findings.", errors)
    require("Delete Review" in result, "Review history must support explicit private-record deletion.", errors)

    if errors:
        print("Manage Content AI review validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Manage Content AI review safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
