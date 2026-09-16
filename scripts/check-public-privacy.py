from __future__ import annotations

from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO = ROOT / "portfolio"
TEXT_SUFFIXES = {".html", ".css", ".js", ".json", ".md", ".txt", ".csv", ".svg"}
BLOCKED_TRACKED_SUFFIXES = (".pem", ".key", ".p12", ".pfx", ".DS_Store")
PUBLIC_SECRET_MARKERS = (
    "OPENAI_API_KEY",
    "PORTFOLIO_MANAGER_SECRET_KEY",
    "PORTFOLIO_MANAGER_PASSWORD_HASH",
    ".portfolio-manager/",
    "portfolio_manager_session",
    "localhost:5055",
    "127.0.0.1:5055",
    "/Users/",
    "C:\\Users\\",
)
SECRET_PATTERNS = (
    re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
)
EMAIL_PATTERN = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
TEMP_SUFFIXES = ("~", ".bak", ".tmp", ".swp", ".orig")


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def git_tracked_files() -> list[str]:
    result = subprocess.run(
        ["git", "ls-files"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return []
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def is_private_tracked_path(path_value: str) -> bool:
    normalized = path_value.replace("\\", "/")
    parts = Path(normalized).parts
    if ".portfolio-manager" in parts or ".venv" in parts:
        return True
    for part in parts:
        if part == ".env" or (part.startswith(".env.") and part != ".env.example"):
            return True
    return normalized.lower().endswith(tuple(value.lower() for value in BLOCKED_TRACKED_SUFFIXES))


def main() -> int:
    errors: list[str] = []
    tracked = git_tracked_files()
    require(bool(tracked), "Could not inspect Git-tracked files.", errors)

    for path in tracked:
        if is_private_tracked_path(path):
            errors.append(f"Private, sensitive, or junk path must not be Git-tracked: {path}")

    public_files = [path for path in PORTFOLIO.rglob("*") if path.is_file()]
    require(bool(public_files), "Public portfolio tree is empty.", errors)

    for path in public_files:
        relative = path.relative_to(ROOT).as_posix()
        lowered_name = path.name.lower()
        require(
            not lowered_name.endswith(TEMP_SUFFIXES),
            f"Temporary/backup file must not be public: {relative}",
            errors,
        )

        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue

        text = path.read_text(encoding="utf-8", errors="replace")
        for marker in PUBLIC_SECRET_MARKERS:
            require(marker not in text, f"Public file contains private/local marker {marker!r}: {relative}", errors)
        for pattern in SECRET_PATTERNS:
            require(not pattern.search(text), f"Public file resembles a secret/private key: {relative}", errors)

        if path.suffix.lower() == ".html":
            require("mailto:" not in text.lower(), f"Public HTML unexpectedly exposes a mailto link: {relative}", errors)
            visible_email_matches = EMAIL_PATTERN.findall(text)
            require(
                not visible_email_matches,
                f"Public HTML contains an email-address literal that needs explicit review: {relative}",
                errors,
            )

    if errors:
        print("Public privacy/leakage validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print(
        f"Public privacy/leakage validation passed across {len(public_files)} public file(s) "
        f"and {len(tracked)} tracked path(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
