from __future__ import annotations

import hmac
import os
import secrets
from pathlib import Path
from urllib.parse import urlsplit

from flask import abort, request, session


REPO_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = REPO_ROOT / ".env"


def load_local_env(path: Path = ENV_PATH) -> None:
    """Load simple KEY=VALUE settings from the local, git-ignored .env file."""
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        os.environ.setdefault(key, value)


def require_security_settings() -> tuple[str, str]:
    secret_key = os.environ.get("PORTFOLIO_MANAGER_SECRET_KEY", "").strip()
    password_hash = os.environ.get("PORTFOLIO_MANAGER_PASSWORD_HASH", "").strip()

    missing = []
    if not secret_key:
        missing.append("PORTFOLIO_MANAGER_SECRET_KEY")
    if not password_hash:
        missing.append("PORTFOLIO_MANAGER_PASSWORD_HASH")

    if missing:
        names = ", ".join(missing)
        raise RuntimeError(
            f"Portfolio Manager security is not configured ({names}). "
            "Run: python portfolio-manager/setup.py"
        )

    return secret_key, password_hash


def csrf_token() -> str:
    token = session.get("_csrf_token")
    if not token:
        token = secrets.token_urlsafe(32)
        session["_csrf_token"] = token
    return token


def validate_csrf() -> None:
    supplied = request.form.get("csrf_token", "") or request.headers.get("X-CSRF-Token", "")
    expected = session.get("_csrf_token", "")
    if not supplied or not expected or not hmac.compare_digest(supplied, expected):
        abort(400, description="This form expired or could not be verified. Go back, refresh the page, and try again.")


def is_safe_next_url(target: str | None) -> bool:
    if not target:
        return False
    parsed = urlsplit(target)
    return not parsed.scheme and not parsed.netloc and target.startswith("/") and not target.startswith("//")
