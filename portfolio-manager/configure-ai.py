from __future__ import annotations

from getpass import getpass
from pathlib import Path
import argparse


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
ENV_PATH = REPO_ROOT / ".env"
DEFAULT_MODEL = "gpt-5.6-terra"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Configure optional local AI settings for Portfolio Manager without changing authentication credentials."
    )
    parser.add_argument(
        "--disable",
        action="store_true",
        help="Remove the local OpenAI API key and AI model settings from .env.",
    )
    return parser.parse_args()


def parse_env_lines(text: str) -> tuple[list[str], dict[str, str]]:
    lines = text.splitlines()
    values: dict[str, str] = {}
    for raw in lines:
        stripped = raw.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip()
    return lines, values


def replace_setting(lines: list[str], key: str, value: str | None) -> list[str]:
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


def write_env(lines: list[str]) -> None:
    ENV_PATH.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    try:
        ENV_PATH.chmod(0o600)
    except OSError:
        pass


def main() -> int:
    args = parse_args()
    if not ENV_PATH.exists():
        print("Portfolio Manager authentication is not configured yet.")
        print("Run: python portfolio-manager/setup.py")
        return 1

    lines, values = parse_env_lines(ENV_PATH.read_text(encoding="utf-8"))

    if args.disable:
        lines = replace_setting(lines, "OPENAI_API_KEY", None)
        lines = replace_setting(lines, "PORTFOLIO_MANAGER_AI_MODEL", None)
        write_env(lines)
        print("AI assistance disabled locally. Portfolio Manager authentication was preserved.")
        return 0

    existing_key = values.get("OPENAI_API_KEY", "").strip()
    print("Configure optional AI Assistance for Portfolio Manager.")
    print("The API key is stored only in the Git-ignored local .env file and is never printed.")
    print("OpenAI API billing is separate from a ChatGPT subscription.")
    if existing_key:
        print("An API key is already configured. Leave the prompt blank to keep it.")

    api_key = getpass("OpenAI API key: ").strip()
    if not api_key:
        api_key = existing_key
    if not api_key:
        print("No API key supplied. Nothing was changed.")
        return 1

    existing_model = values.get("PORTFOLIO_MANAGER_AI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    model = input(f"AI model [{existing_model}]: ").strip() or existing_model

    lines = replace_setting(lines, "OPENAI_API_KEY", api_key)
    lines = replace_setting(lines, "PORTFOLIO_MANAGER_AI_MODEL", model)
    write_env(lines)

    print("\nAI assistance configured locally.")
    print(f"  Settings file: {ENV_PATH.relative_to(REPO_ROOT)} (Git-ignored)")
    print(f"  Model: {model}")
    print("  API key: stored locally and hidden")
    print("\nRestart Portfolio Manager so the new environment settings are loaded.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
