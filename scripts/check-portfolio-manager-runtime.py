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

import app as manager_app  # noqa: E402


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    client = manager_app.app.test_client()

    unauthenticated = client.get("/assets", follow_redirects=False)
    require(
        unauthenticated.status_code in {301, 302, 303, 307, 308},
        "Unauthenticated Asset Library request must redirect to login.",
        errors,
    )
    require(
        "/login" in unauthenticated.headers.get("Location", ""),
        "Unauthenticated Asset Library redirect must target login.",
        errors,
    )

    with client.session_transaction() as session:
        session["portfolio_manager_authenticated"] = True

    dashboard = client.get("/")
    require(dashboard.status_code == 200, "Authenticated dashboard must render.", errors)
    require(b"Open Asset Library" in dashboard.data, "Dashboard must expose the Asset Library.", errors)

    asset_library = client.get("/assets")
    require(asset_library.status_code == 200, "Authenticated Asset Library must render.", errors)
    require(b"Public-file safety" in asset_library.data, "Asset Library must show the public-file safety warning.", errors)
    require(b"public_safe" in asset_library.data, "Asset Library must render the public-safe confirmation control.", errors)

    content_manager = client.get("/content")
    require(content_manager.status_code == 200, "Content Manager must still render.", errors)
    require(b"Manage Assets" in content_manager.data, "Content Manager must link projects to asset management.", errors)

    if errors:
        print("Portfolio Manager runtime validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Portfolio Manager runtime smoke test passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
