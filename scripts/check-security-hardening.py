from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
APP = MANAGER / "app.py"
SECURITY = MANAGER / "security.py"
HEADERS = MANAGER / "security_headers.py"
ASSET_ROUTES = MANAGER / "asset_routes.py"
ASSET_SECURITY = MANAGER / "asset_security.py"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path in [APP, SECURITY, HEADERS, ASSET_ROUTES, ASSET_SECURITY]:
        require(path.exists(), f"Missing security-critical file: {path.relative_to(ROOT)}", errors)

    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    app = APP.read_text(encoding="utf-8")
    security = SECURITY.read_text(encoding="utf-8")
    headers = HEADERS.read_text(encoding="utf-8")
    assets = ASSET_ROUTES.read_text(encoding="utf-8")
    asset_security = ASSET_SECURITY.read_text(encoding="utf-8")

    require('host="127.0.0.1"' in app and 'host="0.0.0.0"' not in app, "Portfolio Manager must stay loopback-only.", errors)
    require('TRUSTED_HOSTS=["127.0.0.1", "localhost"]' in app, "Portfolio Manager must restrict Host headers.", errors)
    require("SESSION_COOKIE_HTTPONLY=True" in app, "Session cookie must remain HttpOnly.", errors)
    require('SESSION_COOKIE_SAMESITE="Strict"' in app, "Session cookie must remain SameSite=Strict.", errors)
    require("validate_csrf()" in app, "Global POST CSRF validation must remain enabled.", errors)
    require("register_security_headers(app)" in app, "Portfolio Manager must register hardened browser response headers.", errors)

    for marker in [
        '"X-Content-Type-Options": "nosniff"',
        '"X-Frame-Options": "DENY"',
        '"Referrer-Policy": "no-referrer"',
        '"Cross-Origin-Opener-Policy": "same-origin"',
        '"Permissions-Policy": "camera=(), microphone=(), geolocation=()"',
        'response.headers["Cache-Control"] = "no-store, max-age=0"',
    ]:
        require(marker in headers, f"Security header contract missing: {marker}", errors)

    require("hmac.compare_digest" in security, "CSRF token comparison must remain constant-time.", errors)
    require("urlsplit" in security and "not parsed.scheme" in security and "not parsed.netloc" in security, "Redirect allowlist must reject external schemes/hosts.", errors)

    require("from asset_security import validate_public_asset_file" in assets, "Asset routes must use content-signature validation.", errors)
    require(assets.count("validate_public_asset_file(") >= 2, "Both public asset upload and replacement must validate file contents.", errors)
    for signature_marker in [
        'extension == ".png"',
        'extension in {".jpg", ".jpeg"}',
        'extension == ".gif"',
        'extension == ".webp"',
        'extension == ".pdf"',
        'extension == ".mp4"',
        'extension == ".webm"',
        'extension == ".docx"',
        'extension == ".pptx"',
        'extension == ".xlsx"',
        '"[Content_Types].xml"',
    ]:
        require(signature_marker in asset_security, f"Public asset signature validation missing {signature_marker}.", errors)

    combined_python = "\n".join(path.read_text(encoding="utf-8", errors="replace") for path in MANAGER.glob("*.py"))
    for dangerous in ["shell=True", "os.system(", "subprocess.Popen("]:
        require(dangerous not in combined_python, f"Avoid shell-style command execution in Portfolio Manager: {dangerous}", errors)

    if errors:
        print("Security hardening validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Security hardening contracts passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
