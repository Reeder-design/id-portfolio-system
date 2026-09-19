from __future__ import annotations

from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import Any
import json
import re
import shutil

from ai_service import PRIVATE_ROOT


HIRING_ROOT = PRIVATE_ROOT / "hiring-guide"
LIBRARY_PATH = HIRING_ROOT / "library.json"
SOURCE_MARKDOWN_PATH = HIRING_ROOT / "source-library.md"
BACKUP_ROOT = HIRING_ROOT / "backups"

MAX_LIBRARY_BYTES = 3 * 1024 * 1024
MAX_MARKDOWN_BYTES = 3 * 1024 * 1024
MAX_TEXT = 30000
MAX_LIST_ITEMS = 100
ALLOWED_EVIDENCE_STATUSES = {"demonstrated", "emerging", "inferred", "audited", "unknown"}


class HiringGuideLibraryError(RuntimeError):
    pass


def _now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _ensure_private_root() -> None:
    HIRING_ROOT.mkdir(parents=True, exist_ok=True)
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True)


def _safe_text(value: Any, limit: int = MAX_TEXT) -> str:
    return str(value or "").strip()[:limit]


def _string_list(value: Any, *, limit: int = MAX_LIST_ITEMS) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list):
        raise HiringGuideLibraryError("Expected a list in the Hiring Guide library.")
    output: list[str] = []
    for item in value[:limit]:
        cleaned = _safe_text(item, 4000)
        if cleaned and cleaned not in output:
            output.append(cleaned)
    return output


def _split_lines(value: str, *, limit: int = MAX_LIST_ITEMS) -> list[str]:
    output: list[str] = []
    for raw in str(value or "").splitlines():
        cleaned = raw.strip()
        if cleaned and cleaned not in output:
            output.append(cleaned[:4000])
        if len(output) >= limit:
            break
    return output


def _split_csv(value: str, *, limit: int = MAX_LIST_ITEMS) -> list[str]:
    output: list[str] = []
    for raw in str(value or "").split(","):
        cleaned = raw.strip()
        if cleaned and cleaned not in output:
            output.append(cleaned[:240])
        if len(output) >= limit:
            break
    return output


def _backup_current(reason: str) -> None:
    if not LIBRARY_PATH.exists():
        return
    _ensure_private_root()
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    target = BACKUP_ROOT / f"library-{stamp}-{re.sub(r'[^a-z0-9]+', '-', reason.lower()).strip('-')[:40] or 'backup'}.json"
    shutil.copy2(LIBRARY_PATH, target)


def _normalize_evidence(record: dict[str, Any]) -> dict[str, Any]:
    item = deepcopy(record)
    evidence_id = _safe_text(item.get("id"), 120)
    if not re.fullmatch(r"EV-[A-Z0-9-]+", evidence_id):
        raise HiringGuideLibraryError(f"Invalid evidence ID: {evidence_id or '(blank)'}")
    item["id"] = evidence_id
    item["title"] = _safe_text(item.get("title"), 500)
    if not item["title"]:
        raise HiringGuideLibraryError(f"{evidence_id} needs a title.")
    status = _safe_text(item.get("status"), 80).lower() or "unknown"
    if status not in ALLOWED_EVIDENCE_STATUSES:
        raise HiringGuideLibraryError(f"{evidence_id} uses unsupported evidence status {status!r}.")
    item["status"] = status
    item["proves"] = _string_list(item.get("proves"))
    return item


def _normalize_qa(record: dict[str, Any], valid_evidence_ids: set[str]) -> dict[str, Any]:
    item = deepcopy(record)
    qa_id = _safe_text(item.get("id"), 160)
    if not re.fullmatch(r"HG-[A-Z0-9-]+", qa_id):
        raise HiringGuideLibraryError(f"Invalid Q&A ID: {qa_id or '(blank)'}")
    item["id"] = qa_id
    item["category"] = _safe_text(item.get("category"), 240)
    item["question"] = _safe_text(item.get("question"), 2000)
    item["answer"] = _safe_text(item.get("answer"), 30000)
    if not item["category"] or not item["question"] or not item["answer"]:
        raise HiringGuideLibraryError(f"{qa_id} requires category, question, and answer.")
    item["confidence"] = _safe_text(item.get("confidence"), 80) or "unrated"
    item["source"] = _safe_text(item.get("source"), 500)
    item["tags"] = _string_list(item.get("tags"))
    item["variants"] = _string_list(item.get("variants"))
    item["followups"] = _string_list(item.get("followups"))
    item["notes"] = _safe_text(item.get("notes"), 12000)
    evidence_ids = _string_list(item.get("evidence_ids"))
    unknown = [value for value in evidence_ids if value not in valid_evidence_ids]
    if unknown:
        raise HiringGuideLibraryError(f"{qa_id} references unknown evidence IDs: {', '.join(unknown)}")
    item["evidence_ids"] = evidence_ids
    item.setdefault("review_status", "canonical")
    return item


def validate_library(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise HiringGuideLibraryError("Hiring Guide JSON must contain one top-level object.")

    evidence_raw = payload.get("evidence")
    qa_raw = payload.get("qa")
    voice_rules = payload.get("voice_rules")
    conversation_rules = payload.get("conversation_rules")

    if not isinstance(evidence_raw, list):
        raise HiringGuideLibraryError("Hiring Guide JSON is missing the evidence list.")
    if not isinstance(qa_raw, list):
        raise HiringGuideLibraryError("Hiring Guide JSON is missing the qa list.")
    if not isinstance(voice_rules, list):
        raise HiringGuideLibraryError("Hiring Guide JSON is missing voice_rules.")
    if not isinstance(conversation_rules, dict):
        raise HiringGuideLibraryError("Hiring Guide JSON is missing conversation_rules.")

    evidence = [_normalize_evidence(item) for item in evidence_raw if isinstance(item, dict)]
    evidence_ids = [item["id"] for item in evidence]
    if len(evidence_ids) != len(set(evidence_ids)):
        raise HiringGuideLibraryError("Evidence IDs must be unique.")

    valid_evidence_ids = set(evidence_ids)
    qa = [_normalize_qa(item, valid_evidence_ids) for item in qa_raw if isinstance(item, dict)]
    qa_ids = [item["id"] for item in qa]
    if len(qa_ids) != len(set(qa_ids)):
        raise HiringGuideLibraryError("Q&A IDs must be unique.")

    normalized = deepcopy(payload)
    normalized["version"] = _safe_text(payload.get("version"), 80) or "1.0"
    normalized["purpose"] = _safe_text(payload.get("purpose"), 1000) or "Hiring Guide / hiring-manager assistant content library"
    normalized["voice_rules"] = _string_list(voice_rules)
    normalized["evidence"] = evidence
    normalized["qa"] = qa
    normalized["conversation_rules"] = deepcopy(conversation_rules)
    normalized.setdefault("_manager", {})
    normalized["_manager"]["updated_at"] = _now()
    normalized["_manager"]["storage"] = "private-local"
    return normalized


def library_exists() -> bool:
    return LIBRARY_PATH.exists()


def load_library() -> dict[str, Any]:
    if not LIBRARY_PATH.exists():
        raise HiringGuideLibraryError("No private Hiring Guide library has been imported yet.")
    try:
        payload = json.loads(LIBRARY_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HiringGuideLibraryError("The private Hiring Guide library could not be read.") from exc
    return validate_library(payload)


def _write_library(payload: dict[str, Any], reason: str) -> dict[str, Any]:
    normalized = validate_library(payload)
    _ensure_private_root()
    _backup_current(reason)
    LIBRARY_PATH.write_text(json.dumps(normalized, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return normalized


def import_library(json_upload, markdown_upload=None) -> dict[str, Any]:
    if not json_upload or not getattr(json_upload, "filename", ""):
        raise HiringGuideLibraryError("Choose the Hiring Guide JSON library first.")
    if Path(json_upload.filename).suffix.lower() != ".json":
        raise HiringGuideLibraryError("The canonical Hiring Guide library must be a .json file.")

    raw = json_upload.read(MAX_LIBRARY_BYTES + 1)
    if len(raw) > MAX_LIBRARY_BYTES:
        raise HiringGuideLibraryError("Hiring Guide JSON must be 3 MB or smaller.")
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HiringGuideLibraryError("The uploaded Hiring Guide JSON is not valid UTF-8 JSON.") from exc

    normalized = validate_library(payload)
    _ensure_private_root()
    _backup_current("import")
    LIBRARY_PATH.write_text(json.dumps(normalized, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    if markdown_upload and getattr(markdown_upload, "filename", ""):
        if Path(markdown_upload.filename).suffix.lower() not in {".md", ".markdown"}:
            raise HiringGuideLibraryError("The optional editorial source must be a Markdown file.")
        markdown = markdown_upload.read(MAX_MARKDOWN_BYTES + 1)
        if len(markdown) > MAX_MARKDOWN_BYTES:
            raise HiringGuideLibraryError("Hiring Guide Markdown must be 3 MB or smaller.")
        try:
            text = markdown.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise HiringGuideLibraryError("Hiring Guide Markdown must use UTF-8 text.") from exc
        SOURCE_MARKDOWN_PATH.write_text(text, encoding="utf-8")

    return normalized


def source_markdown_exists() -> bool:
    return SOURCE_MARKDOWN_PATH.exists()


def library_summary(payload: dict[str, Any]) -> dict[str, Any]:
    qa = payload.get("qa", [])
    evidence = payload.get("evidence", [])
    return {
        "qa_count": len(qa),
        "evidence_count": len(evidence),
        "categories": sorted({str(item.get("category", "")) for item in qa if item.get("category")}),
        "confidences": sorted({str(item.get("confidence", "")) for item in qa if item.get("confidence")}),
        "sources": sorted({str(item.get("source", "")) for item in qa if item.get("source")}),
        "evidence_statuses": sorted({str(item.get("status", "")) for item in evidence if item.get("status")}),
        "updated_at": str(payload.get("_manager", {}).get("updated_at") or ""),
    }


def _evidence_map(payload: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {str(item.get("id")): item for item in payload.get("evidence", [])}


def qa_evidence_records(payload: dict[str, Any], qa: dict[str, Any]) -> list[dict[str, Any]]:
    by_id = _evidence_map(payload)
    return [by_id[item_id] for item_id in qa.get("evidence_ids", []) if item_id in by_id]


def list_qa(
    payload: dict[str, Any],
    *,
    query: str = "",
    category: str = "",
    confidence: str = "",
    evidence_status: str = "",
) -> list[dict[str, Any]]:
    query_clean = query.casefold().strip()
    results: list[dict[str, Any]] = []
    for item in payload.get("qa", []):
        if category and item.get("category") != category:
            continue
        if confidence and item.get("confidence") != confidence:
            continue
        evidence_records = qa_evidence_records(payload, item)
        if evidence_status and not any(record.get("status") == evidence_status for record in evidence_records):
            continue
        if query_clean:
            haystack = " ".join([
                str(item.get("id", "")),
                str(item.get("category", "")),
                str(item.get("question", "")),
                str(item.get("answer", "")),
                " ".join(item.get("tags", [])),
                " ".join(item.get("variants", [])),
                str(item.get("source", "")),
            ]).casefold()
            if query_clean not in haystack:
                continue
        display = deepcopy(item)
        display["_evidence"] = evidence_records
        results.append(display)
    return results


def get_qa(payload: dict[str, Any], qa_id: str) -> dict[str, Any]:
    for item in payload.get("qa", []):
        if item.get("id") == qa_id:
            return deepcopy(item)
    raise HiringGuideLibraryError("Hiring Guide Q&A record not found.")


def _next_custom_id(payload: dict[str, Any]) -> str:
    existing = {str(item.get("id")) for item in payload.get("qa", [])}
    number = 1
    while True:
        candidate = f"HG-CUSTOM-{number:03d}"
        if candidate not in existing:
            return candidate
        number += 1


def create_qa(fields: dict[str, str]) -> dict[str, Any]:
    payload = load_library()
    qa_id = _next_custom_id(payload)
    record = {
        "id": qa_id,
        "category": _safe_text(fields.get("category"), 240),
        "question": _safe_text(fields.get("question"), 2000),
        "answer": _safe_text(fields.get("answer"), 30000),
        "evidence_ids": _split_csv(fields.get("evidence_ids", "")),
        "tags": _split_csv(fields.get("tags", "")),
        "source": _safe_text(fields.get("source"), 500),
        "confidence": _safe_text(fields.get("confidence"), 80) or "unrated",
        "variants": _split_lines(fields.get("variants", "")),
        "followups": _split_lines(fields.get("followups", "")),
        "notes": _safe_text(fields.get("notes"), 12000),
        "review_status": _safe_text(fields.get("review_status"), 80) or "draft",
    }
    valid_ids = {item["id"] for item in payload.get("evidence", [])}
    record = _normalize_qa(record, valid_ids)
    payload["qa"].append(record)
    _write_library(payload, "create-qa")
    return record


def update_qa(qa_id: str, fields: dict[str, str]) -> dict[str, Any]:
    payload = load_library()
    current = get_qa(payload, qa_id)
    updated = deepcopy(current)
    for key, limit in [
        ("category", 240),
        ("question", 2000),
        ("answer", 30000),
        ("source", 500),
        ("confidence", 80),
        ("notes", 12000),
        ("review_status", 80),
    ]:
        updated[key] = _safe_text(fields.get(key), limit)
    updated["evidence_ids"] = _split_csv(fields.get("evidence_ids", ""))
    updated["tags"] = _split_csv(fields.get("tags", ""))
    updated["variants"] = _split_lines(fields.get("variants", ""))
    updated["followups"] = _split_lines(fields.get("followups", ""))

    valid_ids = {item["id"] for item in payload.get("evidence", [])}
    updated = _normalize_qa(updated, valid_ids)
    payload["qa"] = [updated if item.get("id") == qa_id else item for item in payload.get("qa", [])]
    _write_library(payload, "update-qa")
    return updated


def delete_qa(qa_id: str) -> None:
    payload = load_library()
    before = len(payload.get("qa", []))
    payload["qa"] = [item for item in payload.get("qa", []) if item.get("id") != qa_id]
    if len(payload["qa"]) == before:
        raise HiringGuideLibraryError("Hiring Guide Q&A record not found.")
    _write_library(payload, "delete-qa")


def get_evidence(payload: dict[str, Any], evidence_id: str) -> dict[str, Any]:
    for item in payload.get("evidence", []):
        if item.get("id") == evidence_id:
            return deepcopy(item)
    raise HiringGuideLibraryError("Hiring Guide evidence record not found.")


def update_evidence(evidence_id: str, fields: dict[str, str]) -> dict[str, Any]:
    payload = load_library()
    current = get_evidence(payload, evidence_id)
    updated = deepcopy(current)
    updated["title"] = _safe_text(fields.get("title"), 500)
    updated["status"] = _safe_text(fields.get("status"), 80).lower()
    updated["proves"] = _split_lines(fields.get("proves", ""))
    updated = _normalize_evidence(updated)
    payload["evidence"] = [updated if item.get("id") == evidence_id else item for item in payload.get("evidence", [])]
    _write_library(payload, "update-evidence")
    return updated


def export_path() -> Path:
    if not LIBRARY_PATH.exists():
        raise HiringGuideLibraryError("No private Hiring Guide library has been imported yet.")
    return LIBRARY_PATH


def markdown_path() -> Path:
    if not SOURCE_MARKDOWN_PATH.exists():
        raise HiringGuideLibraryError("No Hiring Guide Markdown source was imported.")
    return SOURCE_MARKDOWN_PATH


def backup_count() -> int:
    return len(list(BACKUP_ROOT.glob("library-*.json"))) if BACKUP_ROOT.exists() else 0
