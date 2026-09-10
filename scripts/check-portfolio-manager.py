from __future__ import annotations

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "portfolio-manager" / "app.py"
ASSET_ROUTES = ROOT / "portfolio-manager" / "asset_routes.py"
GITIGNORE = ROOT / ".gitignore"
TEMPLATES = ROOT / "portfolio-manager" / "templates"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    app_text = APP.read_text(encoding="utf-8")
    asset_text = ASSET_ROUTES.read_text(encoding="utf-8") if ASSET_ROUTES.exists() else ""
    ignore_text = GITIGNORE.read_text(encoding="utf-8")

    require('host="127.0.0.1"' in app_text, "Portfolio Manager must bind explicitly to 127.0.0.1", errors)
    require("debug=False" in app_text, "Portfolio Manager normal startup must keep debug mode disabled", errors)
    require("portfolio-manager-local-dev-key" not in app_text, "Hard-coded Flask development secret must not return", errors)
    require("require_security_settings()" in app_text, "Portfolio Manager must require local security settings", errors)
    require("validate_csrf()" in app_text, "Portfolio Manager must validate CSRF for POST actions", errors)
    require("scripts/check-portfolio-manager.py" in app_text, "Run Full Validation must include Portfolio Manager security checks", errors)
    require("scripts/check-portfolio-manager-runtime.py" in app_text, "Run Full Validation must include Portfolio Manager runtime checks", errors)
    require(".env" in ignore_text, ".env must be ignored by Git", errors)
    require(".portfolio-manager/" in ignore_text, ".portfolio-manager/ must be ignored by Git", errors)
    require("portfolio-data/dashboard-uploads" not in app_text, "Uploads must not return to the Git-tracked portfolio-data workspace", errors)

    require(ASSET_ROUTES.exists(), "Asset manager routes are missing", errors)
    if asset_text:
        require("PUBLIC_ASSET_ROOT" in asset_text, "Public assets must use an explicit managed root", errors)
        require('PORTFOLIO_ROOT = REPO_ROOT / "portfolio"' in asset_text, "Portfolio root must resolve to the public portfolio directory", errors)
        require('PUBLIC_ASSET_ROOT = PORTFOLIO_ROOT / "assets" / "project-assets"' in asset_text, "Managed project assets must live under portfolio/assets/project-assets", errors)
        require("secure_filename" in asset_text, "Public asset filenames must be sanitized", errors)
        require("require_public_safe_confirmation" in asset_text, "Public asset uploads must require an explicit public-safe confirmation", errors)
        require("root not in path.parents" in asset_text, "Managed asset paths must be constrained to the public asset root", errors)
        require("find_asset_references" in asset_text, "Asset removal must scan public HTML/CSS/JS references before deletion", errors)
        require("REFERENCE_SCAN_EXTENSIONS" in asset_text, "Asset reference scanning must define explicit public source types", errors)
        require("scripts/check-site.py" in asset_text, "Destructive/replacement asset actions must validate the public site", errors)
        for blocked_extension in (".html", ".htm", ".js", ".css", ".svg", ".exe", ".sh", ".zip"):
            require(
                f'"{blocked_extension}":' not in asset_text,
                f"Unsafe/general-code asset extension must remain blocked: {blocked_extension}",
                errors,
            )

    for path in TEMPLATES.glob("*.html"):
        text = path.read_text(encoding="utf-8")
        for match in re.finditer(r'<form\b[^>]*method=["\']post["\'][^>]*>(.*?)</form>', text, flags=re.I | re.S):
            form_text = match.group(0)
            require(
                'name="csrf_token"' in form_text,
                f"POST form missing csrf_token in {path.relative_to(ROOT)}",
                errors,
            )

    assets_template = TEMPLATES / "assets.html"
    require(assets_template.exists(), "Asset Library template is missing", errors)
    if assets_template.exists():
        template_text = assets_template.read_text(encoding="utf-8")
        require('name="public_safe"' in template_text, "Asset upload UI must require public-safe confirmation", errors)
        require("data-confirm-action=\"remove-asset\"" in template_text, "Asset removal must require confirmation", errors)

    if errors:
        print("Portfolio Manager validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Portfolio Manager security and asset-safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
