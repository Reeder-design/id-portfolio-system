from __future__ import annotations

from pathlib import Path
from urllib import error, request
import json
import os


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
ENV_PATH = REPO_ROOT / ".env"

DEFAULT_MODEL = "gpt-5.6-terra"
MODEL_OPTIONS = [
    {
        "value": "gpt-5.6-terra",
        "label": "Balanced · GPT-5.6 Terra",
        "help": "Good default for frequent portfolio editing with a balance of quality and cost.",
    },
    {
        "value": "gpt-6-astra",
        "label": "Higher quality · GPT-6 Astra",
        "help": "Use when you want stronger reasoning for larger structural or code-heavy edits.",
    },
    {
        "value": "gpt-5.6-luna",
        "label": "Lower cost · GPT-5.6 Luna",
        "help": "Useful for lighter rewriting and straightforward drafting tasks.",
    },
]

OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"


class AISettingsError(RuntimeError):
    pass


def _parse_env(text: str) -> tuple[list[str], dict[str, str]]:
    lines = text.splitlines()
    values: dict[str, str] = {}
    for raw in lines:
        stripped = raw.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip().strip('"\'')
    return lines, values


def _replace_setting(lines: list[str], key: str, value: str | None) -> list[str]:
    prefix = f"{key}="
    output: list[str] = []
    replaced = False
    for line in lines:
        if line.strip().startswith(prefix):
            if value is not None and not replaced:
                output.append(f"{key}={value}")
                replaced = True
            continue
        output.append(line)
    if value is not None and not replaced:
        if output and output[-1].strip():
            output.append("")
        output.append(f"{key}={value}")
    return output


def _read_env() -> tuple[list[str], dict[str, str]]:
    if not ENV_PATH.exists():
        raise AISettingsError("Portfolio Manager is not configured yet. Run the normal setup first.")
    return _parse_env(ENV_PATH.read_text(encoding="utf-8"))


def _write_env(lines: list[str]) -> None:
    ENV_PATH.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    try:
        ENV_PATH.chmod(0o600)
    except OSError:
        pass


def get_local_ai_settings() -> dict:
    try:
        _, values = _read_env()
    except AISettingsError:
        values = {}
    api_key = os.environ.get("OPENAI_API_KEY", "").strip() or values.get("OPENAI_API_KEY", "").strip()
    model = (
        os.environ.get("PORTFOLIO_MANAGER_AI_MODEL", "").strip()
        or values.get("PORTFOLIO_MANAGER_AI_MODEL", "").strip()
        or DEFAULT_MODEL
    )
    return {
        "configured": bool(api_key),
        "model": model,
        "provider": "OpenAI Responses API",
        "key_hint": f"••••{api_key[-4:]}" if len(api_key) >= 4 else "Not configured",
    }


def save_local_ai_settings(api_key: str, model: str, *, keep_existing_key: bool = False) -> dict:
    lines, values = _read_env()
    existing_key = os.environ.get("OPENAI_API_KEY", "").strip() or values.get("OPENAI_API_KEY", "").strip()

    supplied_key = api_key.strip()
    if keep_existing_key and not supplied_key:
        supplied_key = existing_key
    if not supplied_key:
        raise AISettingsError("Enter an OpenAI API key or keep the currently configured key.")
    if "\n" in supplied_key or "\r" in supplied_key or len(supplied_key) > 500:
        raise AISettingsError("The API key format is not valid for local storage.")

    model = model.strip() or DEFAULT_MODEL
    allowed = {item["value"] for item in MODEL_OPTIONS}
    if model not in allowed:
        raise AISettingsError("Choose one of the supported Portfolio Manager AI models.")

    lines = _replace_setting(lines, "OPENAI_API_KEY", supplied_key)
    lines = _replace_setting(lines, "PORTFOLIO_MANAGER_AI_MODEL", model)
    _write_env(lines)

    os.environ["OPENAI_API_KEY"] = supplied_key
    os.environ["PORTFOLIO_MANAGER_AI_MODEL"] = model
    return get_local_ai_settings()


def disable_local_ai() -> None:
    lines, _ = _read_env()
    lines = _replace_setting(lines, "OPENAI_API_KEY", None)
    lines = _replace_setting(lines, "PORTFOLIO_MANAGER_AI_MODEL", None)
    _write_env(lines)
    os.environ.pop("OPENAI_API_KEY", None)
    os.environ.pop("PORTFOLIO_MANAGER_AI_MODEL", None)


def test_ai_connection() -> str:
    settings = get_local_ai_settings()
    if not settings["configured"]:
        raise AISettingsError("Add an API key before testing the connection.")

    body = {
        "model": settings["model"],
        "input": "Reply with exactly: Portfolio Manager AI connected",
        "max_output_tokens": 32,
    }
    data = json.dumps(body).encode("utf-8")
    req = request.Request(
        OPENAI_RESPONSES_URL,
        data=data,
        method="POST",
        headers={
            "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY', '').strip()}",
            "Content-Type": "application/json",
            "User-Agent": "Haley-Portfolio-Manager/AI-Settings",
        },
    )
    try:
        with request.urlopen(req, timeout=45) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except error.HTTPError as exc:
        detail = ""
        try:
            provider_payload = json.loads(exc.read().decode("utf-8"))
            detail = str(provider_payload.get("error", {}).get("message", ""))[:500]
        except Exception:
            pass
        raise AISettingsError(f"OpenAI connection test failed{': ' + detail if detail else '.'}") from exc
    except (error.URLError, TimeoutError) as exc:
        raise AISettingsError("Could not reach OpenAI. Check your internet connection and try again.") from exc
    except json.JSONDecodeError as exc:
        raise AISettingsError("OpenAI returned an unreadable connection-test response.") from exc

    if not payload.get("id"):
        raise AISettingsError("OpenAI responded, but the connection test did not return a normal response object.")
    return f"Connected successfully using {settings['model']}."
