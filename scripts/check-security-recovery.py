from __future__ import annotations

from pathlib import Path
import os
import sys
import zipfile

from werkzeug.security import generate_password_hash


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
PRIVATE_TEST_ROOT = ROOT / ".portfolio-manager" / "security-recovery-tests"

os.environ["PORTFOLIO_MANAGER_SECRET_KEY"] = "synthetic-security-recovery-secret-only"
os.environ["PORTFOLIO_MANAGER_PASSWORD_HASH"] = generate_password_hash(
    "synthetic-security-recovery-password-only",
    method="pbkdf2:sha256:600000",
)
os.environ["OPENAI_API_KEY"] = ""

sys.path.insert(0, str(MANAGER))

from asset_security import validate_public_asset_file  # noqa: E402
import app as manager_app  # noqa: E402


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def expect_rejected(path: Path, extension: str, errors: list[str]) -> None:
    try:
        validate_public_asset_file(path, extension)
    except Exception:
        return
    errors.append(f"Spoofed asset was accepted as {extension}: {path.name}")


def test_response_headers(errors: list[str]) -> None:
    app = manager_app.app
    client = app.test_client()
    with client.session_transaction() as session:
        session["portfolio_manager_authenticated"] = True
        session["_csrf_token"] = "synthetic-security-recovery-csrf"

    response = client.get("/", base_url="http://localhost")
    require(response.status_code == 200, "Authenticated dashboard did not load for header test.", errors)
    require("no-store" in response.headers.get("Cache-Control", ""), "Private Manager response lost no-store caching.", errors)
    require(response.headers.get("Referrer-Policy") == "no-referrer", "Referrer-Policy hardening is missing.", errors)
    require(response.headers.get("X-Content-Type-Options") == "nosniff", "X-Content-Type-Options hardening is missing.", errors)
    require(response.headers.get("X-Frame-Options") == "DENY", "X-Frame-Options hardening is missing.", errors)
    require(response.headers.get("Cross-Origin-Opener-Policy") == "same-origin", "Cross-Origin-Opener-Policy hardening is missing.", errors)
    permissions = response.headers.get("Permissions-Policy", "")
    for directive in ("camera=()", "microphone=()", "geolocation=()"):
        require(directive in permissions, f"Permissions-Policy is missing {directive}.", errors)


def test_asset_signatures(errors: list[str]) -> None:
    PRIVATE_TEST_ROOT.mkdir(parents=True, exist_ok=True)
    valid_png = PRIVATE_TEST_ROOT / "valid.png"
    fake_png = PRIVATE_TEST_ROOT / "fake.png"
    fake_pdf = PRIVATE_TEST_ROOT / "fake.pdf"
    valid_docx = PRIVATE_TEST_ROOT / "valid.docx"
    fake_docx = PRIVATE_TEST_ROOT / "fake.docx"

    try:
        # Signature validation is intentionally lightweight; the synthetic PNG only
        # needs the correct file signature for this contract test.
        valid_png.write_bytes(b"\x89PNG\r\n\x1a\n" + b"synthetic-png-test")
        fake_png.write_text("<html>not an image</html>", encoding="utf-8")
        fake_pdf.write_text("not a pdf", encoding="utf-8")

        with zipfile.ZipFile(valid_docx, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("[Content_Types].xml", "<Types></Types>")
            archive.writestr("word/document.xml", "<document></document>")
        with zipfile.ZipFile(fake_docx, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr("payload.txt", "generic zip only")

        try:
            validate_public_asset_file(valid_png, ".png")
        except Exception as exc:
            errors.append(f"Valid synthetic PNG signature was rejected: {exc}")

        try:
            validate_public_asset_file(valid_docx, ".docx")
        except Exception as exc:
            errors.append(f"Valid synthetic DOCX container was rejected: {exc}")

        expect_rejected(fake_png, ".png", errors)
        expect_rejected(fake_pdf, ".pdf", errors)
        expect_rejected(fake_docx, ".docx", errors)
    finally:
        for path in (valid_png, fake_png, fake_pdf, valid_docx, fake_docx):
            path.unlink(missing_ok=True)
        try:
            PRIVATE_TEST_ROOT.rmdir()
        except OSError:
            pass


def main() -> int:
    errors: list[str] = []
    test_response_headers(errors)
    test_asset_signatures(errors)

    if errors:
        print("Recovered security regression validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Recovered security regression validation passed (response headers + public asset signatures).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
