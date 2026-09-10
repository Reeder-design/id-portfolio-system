from __future__ import annotations

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "portfolio-manager" / "app.py"
GITIGNORE = ROOT / ".gitignore"
TEMPLATES = ROOT / "portfolio-manager" / "templates"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    app_text = APP.read_text(encoding="utf-8")
    ignore_text = GITIGNORE.read_text(encoding="utf-8")

    require('host="127.0.0.1"' in app_text, "Portfolio Manager must bind explicitly to 127.0.0.1", errors)
    require("debug=False" in app_text, "Portfolio Manager normal startup must keep debug mode disabled", errors)
    require("portfolio-manager-local-dev-key" not in app_text, "Hard-coded Flask development secret must not return", errors)
    require("require_security_settings()" in app_text, "Portfolio Manager must require local security settings", errors)
    require("validate_csrf()" in app_text, "Portfolio Manager must validate CSRF for POST actions", errors)
    require(".env" in ignore_text, ".env must be ignored by Git", errors)
    require(".portfolio-manager/" in ignore_text, ".portfolio-manager/ must be ignored by Git", errors)
    require("portfolio-data/dashboard-uploads" not in app_text, "Uploads must not return to the Git-tracked portfolio-data workspace", errors)

    for path in TEMPLATES.glob("*.html"):
        text = path.read_text(encoding="utf-8")
        for match in re.finditer(r'<form\b[^>]*method=["\']post["\'][^>]*>(.*?)</form>', text, flags=re.I | re.S):
            form_text = match.group(0)
            require(
                'name="csrf_token"' in form_text,
                f"POST form missing csrf_token in {path.relative_to(ROOT)}",
                errors,
            )

    if errors:
        print("Portfolio Manager validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Portfolio Manager security validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
