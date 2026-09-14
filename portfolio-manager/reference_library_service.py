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
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".csv",
    ".txt", ".md", ".html", ".htm", ".json", ".png", ".jpg", ".jpeg",
    ".webp", ".gif", ".zip", ".mp4", ".mov",
}
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


def _file_root(item_id: str) -> Path:
    _item_path(item_id)
    path = (FILES_ROOT / item_id).resolve()
    if FILES_ROOT.resolve() not in path.parents:
        raise ReferenceLibraryError("Invalid reference file path.")
    return path


def _kind_dir(item_id: str, kind: str) -> Path:
    if kind not in {"original", "sanitized"}:
        raise ReferenceLibraryError("Invalid reference file kind.")
    root = _file_root(item_id)
    path = (root / kind).resolve()
    if root not in path.parents:
        raise ReferenceLibraryError("Invalid reference file directory.")
    return path


def _safe_filename(filename: str) -> str:
    name = Path(filename).name.strip()
    name = re.sub(r"[^A-Za-z0-9._ -]+", "_", name)
    return name[:180] or "reference-file"


def _validate_extension(filename: str) -> None:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise ReferenceLibraryError(f"Unsupported reference file type. Allowed types: {allowed}")


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


def _write_record(record: dict[str, Any]) -> dict[str, Any]:
    item_id = str(record.get("id", ""))
    if record.get("type") != "reference-item":
        raise ReferenceLibraryError("Invalid reference item record.")
    record["updated_at"] = datetime.now().isoformat(timespec="seconds")
    ITEMS_ROOT.mkdir(parents=True, exist_ok=True)
    _item_path(item_id).write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    return record


def save_reference_record(record: dict[str, Any]) -> dict[str, Any]:
    return _write_record(record)


def _save_uploaded_file(item_id: str, kind: str, uploaded_file) -> dict[str, Any]:
    if not uploaded_file or not uploaded_file.filename:
        raise ReferenceLibraryError("Choose a file first.")
    filename = _safe_filename(uploaded_file.filename)
    _validate_extension(filename)

    directory = _kind_dir(item_id, kind)
    shutil.rmtree(directory, ignore_errors=True)
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / filename
    uploaded_file.save(destination)

    size = destination.stat().st_size
    if size <= 0:
        shutil.rmtree(directory, ignore_errors=True)
        raise ReferenceLibraryError("The uploaded file is empty.")
    if size > MAX_UPLOAD_BYTES:
        shutil.rmtree(directory, ignore_errors=True)
        raise ReferenceLibraryError("Reference files must be 25 MB or smaller in this first version.")

    return {
        "filename": filename,
        "size_bytes": size,
        "mime_type": mimetypes.guess_type(filename)[0] or "application/octet-stream",
        "sha256": _sha256(destination),
        "stored_at": datetime.now().isoformat(timespec="seconds"),
    }


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
    try:
        original_file = _save_uploaded_file(item_id, "original", uploaded_file)
    except Exception:
        shutil.rmtree(_file_root(item_id), ignore_errors=True)
        raise

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
        "original_file": original_file,
        "sanitization_review": None,
        "sanitized_derivative": None,
        "approval": {
            "approved_at": None,
            "approval_note": "",
        },
    }
    return _write_record(record)


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
    value.setdefault("sanitization_review", None)
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
        raise ReferenceLibraryError("Add an approval note before marking a derivative approved for portfolio use.")
    if status == "approved-for-portfolio-use" and not record.get("sanitized_derivative"):
        raise ReferenceLibraryError("Only a sanitized derivative can be approved for portfolio use. The original private source cannot be approved directly.")
    if status in {"sanitized-draft", "approved-for-portfolio-use"} and not record.get("sanitized_derivative"):
        raise ReferenceLibraryError("Add a sanitized derivative before using this status.")

    record["title"] = title
    record["notes"] = notes
    record["tags"] = _normalize_tags(tags)
    record["status"] = status
    if status == "approved-for-portfolio-use":
        record["approval"] = {
            "approved_at": datetime.now().isoformat(timespec="seconds"),
            "approval_note": approval_note,
        }
    else:
        record["approval"] = {"approved_at": None, "approval_note": approval_note}

    return _write_record(record)


def save_sanitized_derivative(item_id: str, uploaded_file) -> dict[str, Any]:
    record = load_reference_item(item_id)
    derivative = _save_uploaded_file(item_id, "sanitized", uploaded_file)
    record["sanitized_derivative"] = derivative
    record["status"] = "sanitized-draft"
    record["approval"] = {"approved_at": None, "approval_note": ""}
    return _write_record(record)


def save_generated_sanitized_text(item_id: str, text: str, filename: str) -> dict[str, Any]:
    record = load_reference_item(item_id)
    cleaned = text.strip()
    if not cleaned:
        raise ReferenceLibraryError("Generated sanitized draft is empty.")
    safe_name = _safe_filename(filename)
    if not safe_name.lower().endswith(".txt"):
        safe_name = f"{Path(safe_name).stem or 'sanitized-source'}-sanitized.txt"

    directory = _kind_dir(item_id, "sanitized")
    shutil.rmtree(directory, ignore_errors=True)
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / safe_name
    destination.write_text(cleaned + "\n", encoding="utf-8")
    size = destination.stat().st_size
    if size > MAX_UPLOAD_BYTES:
        shutil.rmtree(directory, ignore_errors=True)
        raise ReferenceLibraryError("Generated sanitized draft exceeds the Reference Library size limit.")

    record["sanitized_derivative"] = {
        "filename": safe_name,
        "size_bytes": size,
        "mime_type": "text/plain",
        "sha256": _sha256(destination),
        "stored_at": datetime.now().isoformat(timespec="seconds"),
        "generated_from_review": True,
    }
    record["status"] = "sanitized-draft"
    record["approval"] = {"approved_at": None, "approval_note": ""}
    return _write_record(record)


def delete_sanitized_derivative(item_id: str) -> dict[str, Any]:
    record = load_reference_item(item_id)
    shutil.rmtree(_kind_dir(item_id, "sanitized"), ignore_errors=True)
    record["sanitized_derivative"] = None
    record["status"] = "needs-review"
    record["approval"] = {"approved_at": None, "approval_note": ""}
    return _write_record(record)


def delete_reference_item(item_id: str) -> None:
    path = _item_path(item_id)
    if path.exists():
        path.unlink()
    shutil.rmtree(_file_root(item_id), ignore_errors=True)


def reference_file_path(item_id: str, kind: str = "original") -> Path:
    record = load_reference_item(item_id)
    file_record = record.get("original_file") if kind == "original" else record.get("sanitized_derivative")
    if not isinstance(file_record, dict):
        raise ReferenceLibraryError("Requested reference file is not available.")
    filename = str(file_record.get("filename", ""))
    if not filename:
        raise ReferenceLibraryError("Requested reference file is missing from its record.")
    directory = _kind_dir(item_id, kind)
    path = (directory / filename).resolve()
    if directory not in path.parents or not path.exists():
        raise ReferenceLibraryError("Requested reference file is missing.")
    return path
