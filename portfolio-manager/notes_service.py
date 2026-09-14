from __future__ import annotations

from pathlib import Path
import re


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
NOTES_ROOT = REPO_ROOT / ".portfolio-manager" / "notes"
NOTES_ROOT.mkdir(parents=True, exist_ok=True)

SAFE_KEY = re.compile(r"^[a-z0-9][a-z0-9._-]{0,119}$")


def _note_path(scope: str, item_id: str) -> Path:
    scope = scope.strip().lower()
    item_id = item_id.strip().lower()
    if scope not in {"page", "project"}:
        raise ValueError("Unknown note scope.")
    if not SAFE_KEY.fullmatch(item_id):
        raise ValueError("Invalid note id.")
    return NOTES_ROOT / f"{scope}--{item_id}.txt"


def load_note(scope: str, item_id: str) -> str:
    path = _note_path(scope, item_id)
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def save_note(scope: str, item_id: str, value: str) -> None:
    path = _note_path(scope, item_id)
    cleaned = value.strip()
    if cleaned:
        path.write_text(cleaned + "\n", encoding="utf-8")
    elif path.exists():
        path.unlink()
