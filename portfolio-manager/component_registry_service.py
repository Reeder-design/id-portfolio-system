from __future__ import annotations

from copy import deepcopy
from pathlib import Path
from typing import Any
import json


REPO_ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = REPO_ROOT / "portfolio-data" / "component-registry.json"
PROJECT_ROOT = REPO_ROOT / "portfolio-data" / "projects"
GENERATED_PAGE_MARKER = "<!-- PORTFOLIO-MANAGER:GENERATED-PROJECT-PAGE -->"


class ComponentRegistryError(RuntimeError):
    pass


def _load_json(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ComponentRegistryError(f"Could not read {path.relative_to(REPO_ROOT)}.") from exc
    if not isinstance(payload, dict):
        raise ComponentRegistryError(f"{path.relative_to(REPO_ROOT)} must contain a JSON object.")
    return payload


def load_registry() -> dict[str, Any]:
    payload = _load_json(REGISTRY_PATH)
    components = payload.get("components", [])
    if not isinstance(components, list):
        raise ComponentRegistryError("Component registry must contain a components list.")

    seen: set[str] = set()
    cleaned: list[dict[str, Any]] = []
    for raw in components:
        if not isinstance(raw, dict):
            continue
        component_id = str(raw.get("id") or "").strip()
        if not component_id or component_id in seen:
            raise ComponentRegistryError("Component registry contains a missing or duplicate component id.")
        seen.add(component_id)
        cleaned.append(deepcopy(raw))

    return {
        "schema_version": str(payload.get("schema_version") or ""),
        "components": cleaned,
    }


def component_map() -> dict[str, dict[str, Any]]:
    return {
        str(item["id"]): item
        for item in load_registry().get("components", [])
    }


def list_projects() -> list[dict[str, Any]]:
    projects: list[dict[str, Any]] = []
    for path in sorted(PROJECT_ROOT.glob("*.json")):
        try:
            project = _load_json(path)
        except ComponentRegistryError:
            continue
        project["_record_path"] = str(path.relative_to(REPO_ROOT)).replace("\\", "/")
        projects.append(project)
    return projects


def _is_generated(project: dict[str, Any]) -> bool:
    raw_path = str(project.get("page_path") or "").strip()
    if not raw_path:
        return False
    page_path = REPO_ROOT / raw_path
    try:
        return GENERATED_PAGE_MARKER in page_path.read_text(encoding="utf-8")
    except OSError:
        return False


def inferred_component_ids(project: dict[str, Any]) -> list[str]:
    result: list[str] = []

    def add(component_id: str) -> None:
        if component_id not in result:
            result.append(component_id)

    if _is_generated(project):
        add("project-snapshot")
        add("tabs-switcher")

    for section in project.get("detail_sections", []):
        if not isinstance(section, dict):
            continue
        layout = str(section.get("layout") or "")
        if layout == "cards":
            add("detail-cards")
        elif layout == "flow":
            add("process-flow")
        elif layout == "table":
            add("comparison-table")

    if any(
        isinstance(asset, dict) and asset.get("publish")
        for asset in project.get("assets", [])
    ):
        add("evidence-grid")

    if project.get("related_work"):
        add("related-work-cards")

    return result


def explicit_component_ids(project: dict[str, Any]) -> list[str]:
    known = component_map()
    result: list[str] = []
    for value in project.get("component_refs", []):
        component_id = str(value or "").strip()
        if component_id and component_id in known and component_id not in result:
            result.append(component_id)
    return result


def effective_component_ids(project: dict[str, Any]) -> list[str]:
    result: list[str] = []
    for component_id in [
        *explicit_component_ids(project),
        *inferred_component_ids(project),
    ]:
        if component_id not in result:
            result.append(component_id)
    return result


def registry_with_usage() -> list[dict[str, Any]]:
    registry = load_registry()
    projects = list_projects()
    result: list[dict[str, Any]] = []

    for component in registry.get("components", []):
        component_id = str(component["id"])
        used_by: list[dict[str, str]] = []
        explicit_count = 0
        inferred_count = 0

        for project in projects:
            explicit = component_id in explicit_component_ids(project)
            inferred = component_id in inferred_component_ids(project)
            if not explicit and not inferred:
                continue
            if explicit:
                explicit_count += 1
            if inferred:
                inferred_count += 1
            used_by.append({
                "id": str(project.get("id") or ""),
                "title": str(project.get("title") or project.get("id") or ""),
                "page_path": str(project.get("page_path") or ""),
                "basis": "recorded" if explicit else "inferred",
            })

        item = deepcopy(component)
        item["used_by"] = sorted(used_by, key=lambda value: value["title"].lower())
        item["usage_count"] = len(used_by)
        item["explicit_count"] = explicit_count
        item["inferred_count"] = inferred_count
        result.append(item)

    return result


def project_component_context(project: dict[str, Any]) -> dict[str, Any]:
    registry = load_registry()
    explicit = set(explicit_component_ids(project))
    inferred = set(inferred_component_ids(project))
    components: list[dict[str, Any]] = []

    for component in registry.get("components", []):
        item = deepcopy(component)
        component_id = str(item["id"])
        item["selected"] = component_id in explicit
        item["inferred"] = component_id in inferred
        item["active"] = item["selected"] or item["inferred"]
        components.append(item)

    return {
        "components": components,
        "explicit_ids": sorted(explicit),
        "inferred_ids": sorted(inferred),
        "active_ids": sorted(explicit | inferred),
    }


def validate_component_refs(project: dict[str, Any], refs: list[str]) -> list[str]:
    known = component_map()
    result: list[str] = []
    for raw in refs:
        component_id = str(raw or "").strip()
        if not component_id:
            continue
        if component_id not in known:
            raise ComponentRegistryError(f"Unknown reusable component: {component_id}")
        if component_id not in result:
            result.append(component_id)
    return result
