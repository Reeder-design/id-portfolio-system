from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any
import hashlib

import create_content_build_service as build_service
import create_content_service as content_service
from create_publish_bridge_service import CreatePublishBridgeError, load_publish_bridge
from validation_service import run_full_validation


class StateSafetyError(RuntimeError):
    pass


def _file_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _active_build(record: dict[str, Any]) -> dict[str, Any] | None:
    build = record.get("local_build")
    if isinstance(build, dict) and build.get("active"):
        return build
    return None


def _resolve_build_paths(build: dict[str, Any]) -> tuple[Path, Path | None]:
    root = build_service.ROOT.resolve()
    record_raw = str(build.get("record_path", "")).strip()
    if not record_raw:
        raise StateSafetyError("The active local build is missing its structured-record path.")
    record_path = (root / record_raw).resolve()
    if root not in record_path.parents:
        raise StateSafetyError("The active local build has an invalid structured-record path.")

    page_raw = str(build.get("page_path", "")).strip()
    page_path = (root / page_raw).resolve() if page_raw else None
    if page_path and root not in page_path.parents:
        raise StateSafetyError("The active local build has an invalid rendered-page path.")
    return record_path, page_path


def _expected_files(build: dict[str, Any]) -> list[tuple[Path, str | None, str]]:
    record_path, page_path = _resolve_build_paths(build)
    files: list[tuple[Path, str | None, str]] = [
        (record_path, build.get("record_sha256"), "structured record"),
    ]
    if page_path is not None:
        files.append((page_path, build.get("page_sha256"), "rendered page"))
    return files


def ensure_brief_editable(brief_id: str) -> dict[str, Any]:
    record = content_service.load_brief(brief_id)
    build = _active_build(record)
    if build:
        decision = str(build.get("decision", "pending"))
        if decision == "kept":
            raise content_service.CreateContentError(
                "This Content Brief already has a kept local project. Continue changes in Manage Content instead of changing the source brief."
            )
        raise content_service.CreateContentError(
            "This Content Brief has an active local build awaiting Keep or Revert. Finish that decision before changing the brief or its source selections."
        )
    return record


def safe_delete_brief(brief_id: str) -> None:
    record = content_service.load_brief(brief_id)
    build = _active_build(record)
    if build:
        decision = str(build.get("decision", "pending"))
        if decision == "kept":
            raise content_service.CreateContentError(
                "This Content Brief cannot be deleted because its local project was kept. Manage or remove the project through the normal portfolio workflow first."
            )
        raise content_service.CreateContentError(
            "This Content Brief cannot be deleted while a local build is active. Choose Keep or Revert first so no generated project is orphaned."
        )

    try:
        bridge = load_publish_bridge(brief_id)
    except CreatePublishBridgeError as exc:
        raise content_service.CreateContentError(str(exc)) from exc
    if bridge:
        raise content_service.CreateContentError(
            "This Content Brief has an active publishing handoff and cannot be deleted from Create Content. Finish or resolve that workflow first."
        )

    content_service.delete_brief(brief_id)


def safe_keep_local_build(brief_id: str) -> dict[str, Any]:
    record = content_service.load_brief(brief_id)
    build = _active_build(record)
    if not build:
        raise build_service.CreateBuildError("There is no active local build to keep.")

    # Repeat clicks after a successful Keep are harmless and resume the next workflow step.
    if build.get("decision") == "kept":
        return record

    files = _expected_files(build)
    missing = [label for path, _expected, label in files if not path.exists() or not path.is_file()]
    if missing:
        raise build_service.CreateBuildError(
            "Keep stopped because the active local build is incomplete: missing " + ", ".join(missing) + ". Review the local project before continuing."
        )

    passed, output = run_full_validation()
    if not passed:
        raise build_service.CreateBuildError(
            "Keep stopped because the current local project no longer passes Full Validation:\n" + output
        )

    # Bind Keep to the exact files that just passed validation, including intentional edits
    # made after initial generation but before the human Keep decision.
    record_path, page_path = _resolve_build_paths(build)
    build["record_sha256"] = _file_sha(record_path)
    build["page_sha256"] = _file_sha(page_path) if page_path else None
    build["decision"] = "kept"
    build["validation"] = "passed"
    build["keep_validated_at"] = datetime.now().isoformat(timespec="seconds")
    build["kept_at"] = build["keep_validated_at"]
    record["local_build"] = build
    record["status"] = "local-build-kept"
    return build_service._save(record)


def safe_revert_local_build(brief_id: str) -> dict[str, Any]:
    record = content_service.load_brief(brief_id)
    build = _active_build(record)
    if not build:
        raise build_service.CreateBuildError("There is no active local build to revert.")
    if build.get("decision") == "kept":
        raise build_service.CreateBuildError(
            "This local build was already kept and moved into the publishing workflow. Revert is no longer available from Create Content."
        )

    files = _expected_files(build)

    # Preflight every file before deleting anything. This prevents a partial revert where
    # one generated file is removed before another is discovered to have changed.
    problems: list[str] = []
    for path, expected_sha, label in files:
        if not path.exists() or not path.is_file():
            problems.append(f"{label} is missing ({path.relative_to(build_service.ROOT)})")
            continue
        if expected_sha and _file_sha(path) != expected_sha:
            problems.append(f"{label} changed after creation ({path.relative_to(build_service.ROOT)})")
    if problems:
        raise build_service.CreateBuildError(
            "Automatic revert stopped before deleting anything because the build state changed: "
            + "; ".join(problems)
            + ". Review those files manually."
        )

    record_path, page_path = _resolve_build_paths(build)
    if page_path:
        page_path.unlink()
    record_path.unlink()

    new_project = build_service._load_new_project_module()
    if page_path:
        new_project.cleanup_empty_parents(page_path, build_service.ROOT / "portfolio" / "projects")
    try:
        new_project.refresh_documentation()
    except Exception as exc:
        raise build_service.CreateBuildError(
            "Project files were reverted, but generated documentation could not be refreshed. Run Refresh Documentation before continuing."
        ) from exc

    history = record.setdefault("build_history", [])
    history.append({
        "project_id": build.get("project_id"),
        "created_at": build.get("created_at"),
        "reverted_at": datetime.now().isoformat(timespec="seconds"),
    })
    record["local_build"] = None
    record["status"] = "build-proposed"
    return build_service._save(record)
