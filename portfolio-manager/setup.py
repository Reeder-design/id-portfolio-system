from __future__ import annotations

import argparse
from getpass import getpass
from pathlib import Path
import secrets

from werkzeug.security import generate_password_hash


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
ENV_PATH = REPO_ROOT / ".env"
PRIVATE_ROOT = REPO_ROOT / ".portfolio-manager"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Configure local-only Portfolio Manager authentication."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace an existing .env file after confirming you intend to reset local credentials.",
    )
    return parser.parse_args()


def collect_password() -> str:
    while True:
        password = getpass("Create Portfolio Manager password (12+ characters): ")
        if len(password) < 12:
            print("Use at least 12 characters.")
            continue
        confirmation = getpass("Confirm password: ")
        if password != confirmation:
            print("Passwords did not match. Try again.")
            continue
        return password


def main() -> int:
    args = parse_args()

    if ENV_PATH.exists() and not args.force:
        print("Local security is already configured in .env.")
        print("Nothing was changed. Use --force only if you intentionally want to reset it.")
        return 0

    password = collect_password()
    secret_key = secrets.token_urlsafe(48)
    password_hash = generate_password_hash(password)

    env_text = (
        "# Local Portfolio Manager security. NEVER commit this file.\n"
        f"PORTFOLIO_MANAGER_SECRET_KEY={secret_key}\n"
        f"PORTFOLIO_MANAGER_PASSWORD_HASH={password_hash}\n"
    )
    ENV_PATH.write_text(env_text, encoding="utf-8")
    try:
        ENV_PATH.chmod(0o600)
    except OSError:
        pass

    for name in ("requests", "uploads", "temp", "backups"):
        (PRIVATE_ROOT / name).mkdir(parents=True, exist_ok=True)

    print("\nPortfolio Manager security configured locally.")
    print(f"  Credentials: {ENV_PATH.relative_to(REPO_ROOT)} (Git-ignored)")
    print(f"  Private data: {PRIVATE_ROOT.relative_to(REPO_ROOT)}/ (Git-ignored)")
    print("\nStart the app with:")
    print("  python portfolio-manager/app.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
