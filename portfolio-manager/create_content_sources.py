from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any
import json
import re

from ai_service import PRIVATE_ROOT
from reference_library_service import ReferenceLibraryError, list_reference_items, load_reference_item
from reference_sanitization_service import SanitizationError, extract_reference_text


BRIEFS_ROOT = PRIVATE_ROOT / "create-content" / "briefs"
MAX_ATTACHED_SOURCES = 12
MAX_SOURCE_CONTEXT_CHARS = 60000


class ContentSourceError(RuntimeError):
    pass


def _brief_path(brief_id: str) -> Path:
    if not re.fullmatch(r"brief-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}", brief_id):
        raise ContentSourceError("Invalid Content Brief id.")
    BRIEFS_ROOT.mkdir(parents=True, exist_ok=True)
    path = (BRIEFS_ROOT / f"{brief_id}.json").resolve()
    if BRIEFS_ROOT.resolve() not in path.parents:
        raise ContentSourceError("Invalid Content Brief path.")
    return path


def _source_ids(values: Any) -> list[str]:
    result: list[str] = []
    for raw in values or []:
        source_id = str(raw).strip()
        if source_id and source_id not in result:
            result.append(source_id)
        if len(result) >= MAX_ATTACHED_SOURCES:
            break
    return result


def source_ids_from_form(form: Any) -> list[str]:
    if hasattr(form, "getlist"):
        return _source_ids(form.getlist("source_ids"))
    value = form.get("source_ids", []) if hasattr(form, "get") else []
    if isinstance(value, (list, tuple)):
        return _source_ids(value)
    return _source_ids([value] if value else [])


def list_approved_sources() -> list[dict[str, Any]]:
    try:
        records = list_reference_items("approved-for-portfolio-use")
    except ReferenceLibraryError as exc:
        raise ContentSourceError(str(exc)) from exc
    result: list[dict[str, Any]] = []
    for record in records:
        derivative = record.get("sanitized_derivative")
        approval = record.get("approval") or {}
        if not isinstance(derivative, dict) or not derivative.get("sha256"):
            continue
        result.append({
            "id": record.get("id"),
            "title": record.get("title") or "Approved source",
            "filename": derivative.get("filename") or "sanitized derivative",
            "sha256": derivative.get("sha256"),
            "approval_note": approval.get("approval_note") or "",
            "approved_at": approval.get("approved_at"),
        })
    return result


def _snapshot_source(source_id: str) -> dict[str, Any]:
    try:
        record = load_reference_item(source_id)
    except ReferenceLibraryError as exc:
        raise ContentSourceError(f"Approved source could not be loaded: {source_id}.") from exc
    derivative = record.get("sanitized_derivative")
    approval = record.get("approval") or {}
    if record.get("status") != "approved-for-portfolio-use" or not isinstance(derivative, dict):
        raise ContentSourceError(f"{record.get('title') or source_id} is not currently approved for portfolio use.")
    if not derivative.get("sha256"):
        raise ContentSourceError(f"{record.get('title') or source_id} does not have a valid approved sanitized derivative.")
    return {
        "reference_id": source_id,
        "title": record.get("title") or "Approved source",
        "filename": derivative.get("filename") or "sanitized derivative",
        "sanitized_sha256": derivative.get("sha256"),
        "approved_at": approval.get("approved_at"),
        "attached_at": datetime.now().isoformat(timespec="seconds"),
    }


def save_brief_sources(brief_id: str, source_ids: list[str]) -> dict[str, Any]:
    path = _brief_path(brief_id)
    if not path.exists():
        raise ContentSourceError("Content Brief not found.")
    try:
        record = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ContentSourceError("Content Brief could not be read.") from exc
    if not isinstance(record, dict) or record.get("type") != "create-content-brief":
        raise ContentSourceError("This private record is not a Content Brief.")

    snapshots = [_snapshot_source(source_id) for source_id in _source_ids(source_ids)]
    old_identity = [
        (item.get("reference_id"), item.get("sanitized_sha256"))
        for item in record.get("approved_sources", [])
        if isinstance(item, dict)
    ]
    new_identity = [(item["reference_id"], item["sanitized_sha256"]) for item in snapshots]
    changed = old_identity != new_identity
    record["approved_sources"] = snapshots
    record["updated_at"] = datetime.now().isoformat(timespec="seconds")
    if changed and record.get("plan") is not None:
        record["status"] = "brief-draft"
        record["plan_stale"] = True
    path.write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    return record


def resolve_brief_sources(record: dict[str, Any]) -> list[dict[str, Any]]:
    resolved: list[dict[str, Any]] = []
    for snapshot in record.get("approved_sources", []):
        if not isinstance(snapshot, dict):
            continue
        source_id = str(snapshot.get("reference_id", ""))
        item = dict(snapshot)
        item["current"] = False
        item["issue"] = ""
        try:
            source = load_reference_item(source_id)
        except ReferenceLibraryError:
            item["issue"] = "The Reference Library item no longer exists."
            resolved.append(item)
            continue
        derivative = source.get("sanitized_derivative")
        if source.get("status") != "approved-for-portfolio-use":
            item["issue"] = "This source is no longer approved for portfolio use."
        elif not isinstance(derivative, dict):
            item["issue"] = "The approved sanitized derivative is no longer available."
        elif derivative.get("sha256") != snapshot.get("sanitized_sha256"):
            item["issue"] = "The sanitized derivative changed after it was attached. Re-save the brief to attach the current approved version."
        else:
            item["current"] = True
            item["title"] = source.get("title") or item.get("title")
            item["filename"] = derivative.get("filename") or item.get("filename")
        resolved.append(item)
    return resolved


def approved_source_context(record: dict[str, Any], strict: bool = False) -> dict[str, Any]:
    blocks: list[str] = []
    issues: list[str] = []
    included: list[dict[str, Any]] = []
    remaining = MAX_SOURCE_CONTEXT_CHARS

    for source in resolve_brief_sources(record):
        if not source.get("current"):
            issues.append(f"{source.get('title') or source.get('reference_id')}: {source.get('issue')}")
            continue
        source_id = str(source.get("reference_id", ""))
        try:
            extracted = extract_reference_text(source_id, kind="sanitized")
        except (SanitizationError, ReferenceLibraryError) as exc:
            issues.append(f"{source.get('title')}: {exc}")
            continue
        if not extracted.get("supported"):
            included.append({**source, "ai_text_included": False, "ai_note": extracted.get("reason", "This source is attached but not text-extractable.")})
            continue
        text = str(extracted.get("text", "")).strip()
        if not text:
            included.append({**source, "ai_text_included": False, "ai_note": "No reviewable text was extracted from the sanitized derivative."})
            continue
        if remaining <= 0:
            issues.append("Approved source context exceeded the current AI context limit. Detach a source or shorten the sanitized derivatives before generating the plan.")
            break
        chunk = text[:remaining]
        remaining -= len(chunk)
        blocks.append(
            f"APPROVED SOURCE: {source.get('title')}\n"
            f"SANITIZED FILE: {source.get('filename')}\n"
            f"{chunk}"
        )
        included.append({**source, "ai_text_included": True, "ai_note": "Approved sanitized text will be included when you generate the AI plan."})
        if len(chunk) < len(text):
            issues.append(f"{source.get('title')}: approved source text was truncated by the Create Content context limit.")

    if strict and issues:
        raise ContentSourceError("Approved source context needs attention before AI planning: " + " ".join(issues))
    return {
        "text": "\n\n".join(blocks),
        "issues": issues,
        "resolved": included,
    }
