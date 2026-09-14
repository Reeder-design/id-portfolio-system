from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Optional
import hashlib
import json
import mimetypes
import re
import shutil
import uuid

from ai_service import PRIVATE_ROOT


REFERENCE_ROOT = PRIVATE_ROOT / "reference-library"
ITEMS_ROOT = REFERENCE_ROOT / "items"
FILES_ROOT = REFERENCE_ROOT / "files"
ALLOWED_STATUSES = (
    "private-source",
    "needs-review",
    "sanitization-in-progress",
    "sanitized-draft",
    "approved-for-portfolio-use",
)
MAX_TITLE_CHARS = 240
MAX_NOTES_CHARS = 12000
MAX_TAGS = 20
MAX_UPLOAD_BYTES = 25 * 1024 * 1024


class ReferenceLibraryError(RuntimeError):
    pass


def _item_path(item_id: str) -> Path:
    if not re.fullmatch(r"ref-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}", item_id):
        raise ReferenceLibraryError("Invalid reference item id.")
    path = (ITEMS_ROOT / f"{item_id}.json").resolve()
    if ITEMS_ROOT.resolve() not in path.parents:
        raise ReferenceLibraryError("Invalid reference item path.")
    return path


def _file_dir(item_id: str) -> Path:
    _item_path(item_id)
    path = (FILES_ROOT / item_id).resolve()
    if FILES_ROOT.resolve() not in path.parents:
        raise ReferenceLibraryError("Invalid reference file path.")
    return path


def _safe_filename(filename: str) -> str:
    name = Path(filename).name.strip()
    name = re.sub(r"[^A-Za-z0-9._ -]+", "_", name)
    return name[:180] or "reference-file"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _normalize_tags(raw: str) -> list[str]:
    values: list[str] = []
    for piece in raw.split(","):
        tag = re.sub(r"\s+", " ", piece).strip()
        if tag and tag not in values:
            values.append(tag[:80])
        if len(values) >= MAX_TAGS:
            break
    return values


def create_reference_item(title: str, notes: str, tags: str, uploaded_file) -> dict[str, Any]:
    title = re.sub(r"\s+", " ", title).strip()
    notes = notes.strip()
    if not title:
        raise ReferenceLibraryError("Add a title for this reference item.")
    if len(title) > MAX_TITLE_CHARS:
        raise ReferenceLibraryError("Reference title is too long.")
    if len(notes) > MAX_NOTES_CHARS:
        raise ReferenceLibraryError("Reference notes are too long.")
    if not uploaded_file or not uploaded_file.filename:
        raise ReferenceLibraryError("Choose a source file to add to the Reference Library.")

    item_id = f"ref-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    file_dir = _file_dir(item_id)
    file_dir.mkdir(parents=True, exist_ok=False)
    filename = _safe_filename(uploaded_file.filename)
    destination = file_dir / filename
    uploaded_file.save(destination)

    size = destination.stat().st_size
    if size <= 0:
        shutil.rmtree(file_dir, ignore_errors=True)
        raise ReferenceLibraryError("The uploaded source file is empty.")
    if size > MAX_UPLOAD_BYTES:
        shutil.rmtree(file_dir, ignore_errors=True)
        raise ReferenceLibraryError("Reference files must be 25 MB or smaller in this first version.")

    now = datetime.now().isoformat(timespec="seconds")
    record = {
        "id": item_id,
        "type": "reference-item",
        "title": title,
        "created_at": now,
        "updated_at": now,
        "status": "private-source",
        "notes": notes,
        "tags": _normalize_tags(tags),
        "original_file": {
            "filename": filename,
            "size_bytes": size,
            "mime_type": mimetypes.guess_type(filename)[0] or "application/octet-stream",
            "sha256": _sha256(destination),
        },
        "sanitized_derivative": None,
        "approval": {
            "approved_at": None,
            "approval_note": "",
        },
    }
    ITEMS_ROOT.mkdir(parents=True, exist_ok=True)
    _item_path(item_id).write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    return record


def load_reference_item(item_id: str) -> dict[str, Any]:
    path = _item_path(item_id)
    if not path.exists():
        raise ReferenceLibraryError("Reference item not found.")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ReferenceLibraryError("Reference item could not be read.") from exc
    if not isinstance(value, dict) or value.get("type") != "reference-item":
        raise ReferenceLibraryError("Invalid reference item record.")
    return value


def list_reference_items(status: Optional[str] = None) -> list[dict[str, Any]]:
    if status and status not in ALLOWED_STATUSES:
        raise ReferenceLibraryError("Unknown reference status filter.")
    if not ITEMS_ROOT.exists():
        return []
    records: list[dict[str, Any]] = []
    for path in ITEMS_ROOT.glob("ref-*.json"):
        try:
            value = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(value, dict) or value.get("type") != "reference-item":
            continue
        if status and value.get("status") != status:
            continue
        records.append(value)
    records.sort(key=lambda item: str(item.get("updated_at") or item.get("created_at") or ""), reverse=True)
    return records


def update_reference_item(item_id: str, title: str, notes: str, tags: str, status: str, approval_note: str) -> dict[str, Any]:
    record = load_reference_item(item_id)
    title = re.sub(r"\s+", " ", title).strip()
    notes = notes.strip()
    approval_note = approval_note.strip()
    if not title:
        raise ReferenceLibraryError("Reference title cannot be blank.")
    if len(title) > MAX_TITLE_CHARS:
        raise ReferenceLibraryError("Reference title is too long.")
    if len(notes) > MAX_NOTES_CHARS:
        raise ReferenceLibraryError("Reference notes are too long.")
    if status not in ALLOWED_STATUSES:
        raise ReferenceLibraryError("Choose a valid reference status.")
    if status == "approved-for-portfolio-use" and not approval_note:
        raise ReferenceLibraryError("Add an approval note before marking a source approved for portfolio use.")
    if status == "approved-for-portfolio-use" and not record.get("sanitized_derivative"):
        raise ReferenceLibraryError("Only a sanitized derivative can be approved for portfolio use. The original private source cannot be approved directly.")

    record["title"] = title
    record["notes"] = notes
    record["tags"] = _normalize_tags(tags)
    record["status"] = status
    record["updated_at"] = datetime.now().isoformat(timespec="seconds")
    if status == "approved-for-portfolio-use":
        record["approval"] = {
            "approved_at": datetime.now().isoformat(timespec="seconds"),
            "approval_note": approval_note,
        }
    else:
        record["approval"] = {"approved_at": None, "approval_note": approval_note}

    _item_path(item_id).write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    return record


def delete_reference_item(item_id: str) -> None:
    path = _item_path(item_id)
    if path.exists():
        path.unlink()
    shutil.rmtree(_file_dir(item_id), ignore_errors=True)


def reference_file_path(item_id: str) -> Path:
    record = load_reference_item(item_id)
    filename = str(record.get("original_file", {}).get("filename", ""))
    if not filename:
        raise ReferenceLibraryError("Reference source file is missing from its record.")
    file_dir = _file_dir(item_id)
    path = (file_dir / filename).resolve()
    if file_dir not in path.parents or not path.exists():
        raise ReferenceLibraryError("Reference source file is missing.")
    return path
