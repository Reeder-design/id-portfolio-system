from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any
import json
import re

from create_content_service import CreateContentError, load_brief
from related_references_service import (
    RelatedReferenceError,
    create_related_reference_review,
    load_related_reference_review,
)


ROOT = Path(__file__).resolve().parents[1]
BRIDGES_ROOT = ROOT / ".portfolio-manager" / "create-content" / "publish-bridges"


class CreatePublishBridgeError(RuntimeError):
    pass


def _bridge_path(brief_id: str) -> Path:
    if not re.fullmatch(r"brief-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}", brief_id):
        raise CreatePublishBridgeError("Invalid Content Brief id.")
    BRIDGES_ROOT.mkdir(parents=True, exist_ok=True)
    path = (BRIDGES_ROOT / f"{brief_id}.json").resolve()
    if BRIDGES_ROOT.resolve() not in path.parents:
        raise CreatePublishBridgeError("Invalid Create Content publish-bridge path.")
    return path


def load_publish_bridge(brief_id: str) -> dict[str, Any] | None:
    path = _bridge_path(brief_id)
    if not path.exists():
        return None
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise CreatePublishBridgeError("Create Content publish bridge could not be read.") from exc
    if not isinstance(value, dict) or value.get("type") != "create-content-publish-bridge":
        raise CreatePublishBridgeError("This private record is not a Create Content publish bridge.")
    return value


def _save_bridge(record: dict[str, Any]) -> dict[str, Any]:
    path = _bridge_path(str(record.get("brief_id", "")))
    record["updated_at"] = datetime.now().isoformat(timespec="seconds")
    path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return record


def _require_kept_build(brief_id: str) -> tuple[dict[str, Any], dict[str, Any]]:
    try:
        brief = load_brief(brief_id)
    except CreateContentError as exc:
        raise CreatePublishBridgeError(str(exc)) from exc
    build = brief.get("local_build")
    if not isinstance(build, dict) or not build.get("active"):
        raise CreatePublishBridgeError("Create and validate a local project before starting Related References.")
    if build.get("decision") != "kept":
        raise CreatePublishBridgeError("Choose Keep Local Build before starting Related References.")
    if not build.get("project_id") or not build.get("page_path"):
        raise CreatePublishBridgeError("The kept local build is missing its project identity or page path.")
    return brief, build


def start_or_resume_publish_bridge(brief_id: str) -> dict[str, Any]:
    brief, build = _require_kept_build(brief_id)
    existing = load_publish_bridge(brief_id)
    if existing:
        review_id = str(existing.get("related_references_review_id", ""))
        if review_id:
            try:
                review = load_related_reference_review(review_id)
            except RelatedReferenceError:
                review = None
            if review is not None:
                existing["related_references_status"] = review.get("status", "pending")
                return _save_bridge(existing)

    proposal = brief.get("build_proposal") if isinstance(brief.get("build_proposal"), dict) else {}
    title = str(proposal.get("title") or brief.get("fields", {}).get("working_title") or build.get("project_id")).strip()
    try:
        review = create_related_reference_review(
            source_kind="create-build",
            source_id=str(build["project_id"]),
            source_label=title,
            target_path=str(build["page_path"]),
            old_title="",
            new_title=title,
            automatic_updates=[
                "Structured project record",
                "Rendered project page",
                "Generated documentation",
                "Full validation before Keep",
            ],
        )
    except RelatedReferenceError as exc:
        raise CreatePublishBridgeError(f"Related References could not start: {exc}") from exc

    now = datetime.now().isoformat(timespec="seconds")
    bridge = {
        "type": "create-content-publish-bridge",
        "brief_id": brief_id,
        "project_id": str(build["project_id"]),
        "page_path": str(build["page_path"]),
        "related_references_review_id": str(review["id"]),
        "related_references_status": str(review.get("status", "pending")),
        "created_at": now,
        "updated_at": now,
    }
    return _save_bridge(bridge)


def publish_bridge_context(brief_id: str) -> dict[str, Any] | None:
    bridge = load_publish_bridge(brief_id)
    if not bridge:
        return None
    review_id = str(bridge.get("related_references_review_id", ""))
    if review_id:
        try:
            review = load_related_reference_review(review_id)
        except RelatedReferenceError:
            review = None
        if review is not None:
            bridge["related_references_status"] = str(review.get("status", "pending"))
    return bridge
