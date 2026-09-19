from __future__ import annotations

from copy import deepcopy
from datetime import date, datetime
from pathlib import Path
from typing import Any
import json
import re
import shutil
import sys
import uuid

from validation_service import run_command


REPO_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = REPO_ROOT / "portfolio-data" / "projects"
TAXONOMY_PATH = REPO_ROOT / "portfolio-data" / "taxonomy.json"
PRIVATE_ROOT = REPO_ROOT / ".portfolio-manager"
BACKUP_ROOT = PRIVATE_ROOT / "relationship-backups"
GENERATED_PAGE_MARKER = "<!-- PORTFOLIO-MANAGER:GENERATED-PROJECT-PAGE -->"


class RelationshipGraphError(RuntimeError):
    pass


def _load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RelationshipGraphError(f"Could not read {path.relative_to(REPO_ROOT)}.") from exc
    if not isinstance(value, dict):
        raise RelationshipGraphError(f"{path.relative_to(REPO_ROOT)} must contain a JSON object.")
    return value


def _write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _project_path(project_id: str) -> Path:
    project_id = str(project_id or "").strip()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", project_id):
        raise RelationshipGraphError("Invalid project id.")
    path = PROJECT_ROOT / f"{project_id}.json"
    if not path.exists():
        raise RelationshipGraphError(f"Project not found: {project_id}")
    return path


def load_projects() -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for path in sorted(PROJECT_ROOT.glob("*.json")):
        try:
            project = _load_json(path)
        except RelationshipGraphError:
            continue
        project_id = str(project.get("id") or "").strip()
        if project_id:
            project["_record_path"] = str(path.relative_to(REPO_ROOT)).replace("\\", "/")
            result[project_id] = project
    return result


def _taxonomy_labels() -> tuple[dict[str, str], dict[str, str]]:
    taxonomy = _load_json(TAXONOMY_PATH)
    categories: dict[str, str] = {}
    subcategories: dict[str, str] = {}
    for category in taxonomy.get("categories", []):
        if not isinstance(category, dict):
            continue
        category_id = str(category.get("id") or "")
        categories[category_id] = str(category.get("label") or category_id)
        for subcategory in category.get("subcategories", []):
            if isinstance(subcategory, dict):
                subcategory_id = str(subcategory.get("id") or "")
                subcategories[subcategory_id] = str(subcategory.get("label") or subcategory_id)
    return categories, subcategories


def _preview_url(project: dict[str, Any]) -> str:
    path = str(project.get("page_path") or "").strip()
    if path.startswith("portfolio/"):
        path = path[len("portfolio/"):]
    if path.endswith("index.html"):
        path = path[:-len("index.html")]
    return "http://127.0.0.1:8000/" + path


def _generated(project: dict[str, Any]) -> bool:
    raw = str(project.get("page_path") or "").strip()
    if not raw:
        return False
    try:
        return GENERATED_PAGE_MARKER in (REPO_ROOT / raw).read_text(encoding="utf-8")
    except OSError:
        return False


def _normalized_values(values: Any) -> dict[str, str]:
    result: dict[str, str] = {}
    if not isinstance(values, list):
        return result
    for value in values:
        cleaned = str(value or "").strip()
        if cleaned:
            result.setdefault(cleaned.casefold(), cleaned)
    return result


def _suggested_relationship(
    source: dict[str, Any],
    target: dict[str, Any],
    shared_skills: list[str],
    shared_tools: list[str],
    categories: dict[str, str],
    subcategories: dict[str, str],
) -> str:
    source_sub = str(source.get("subcategory") or "")
    target_sub = str(target.get("subcategory") or "")
    if source_sub and source_sub == target_sub:
        label = subcategories.get(source_sub, source_sub.replace("-", " ").title())
        if shared_skills:
            return f"Companion {label} work showing shared {shared_skills[0]} capability"
        return f"Companion work in {label}"

    source_cat = str(source.get("category") or "")
    target_cat = str(target.get("category") or "")
    if source_cat and source_cat == target_cat:
        label = categories.get(source_cat, source_cat.replace("-", " ").title())
        if shared_skills:
            return f"Adjacent {label} work with shared {shared_skills[0]} capability"
        return f"Adjacent work in {label}"

    shared = [*shared_skills[:2], *shared_tools[:1]]
    if shared:
        return "Related work demonstrating " + ", ".join(shared)
    return "Related portfolio work"


def _suggestions(
    source: dict[str, Any],
    projects: dict[str, dict[str, Any]],
    current_targets: set[str],
    categories: dict[str, str],
    subcategories: dict[str, str],
) -> list[dict[str, Any]]:
    source_skills = _normalized_values(source.get("skills"))
    source_tools = _normalized_values(source.get("tools"))
    source_id = str(source.get("id") or "")
    rows: list[dict[str, Any]] = []

    for target_id, target in projects.items():
        if target_id == source_id or target_id in current_targets:
            continue

        score = 0
        reasons: list[str] = []
        source_sub = str(source.get("subcategory") or "")
        target_sub = str(target.get("subcategory") or "")
        source_cat = str(source.get("category") or "")
        target_cat = str(target.get("category") or "")

        if source_sub and source_sub == target_sub:
            score += 45
            reasons.append("same portfolio section")
        elif source_cat and source_cat == target_cat:
            score += 25
            reasons.append("same portfolio area")

        target_skills = _normalized_values(target.get("skills"))
        target_tools = _normalized_values(target.get("tools"))
        shared_skill_keys = sorted(set(source_skills) & set(target_skills))
        shared_tool_keys = sorted(set(source_tools) & set(target_tools))
        shared_skills = [source_skills[key] for key in shared_skill_keys]
        shared_tools = [source_tools[key] for key in shared_tool_keys]

        if shared_skills:
            score += min(24, len(shared_skills) * 6)
            reasons.append(f"{len(shared_skills)} shared skill" + ("s" if len(shared_skills) != 1 else ""))
        if shared_tools:
            score += min(15, len(shared_tools) * 3)
            reasons.append(f"{len(shared_tools)} shared tool" + ("s" if len(shared_tools) != 1 else ""))

        if any(
            isinstance(item, dict) and str(item.get("project_id") or "") == source_id
            for item in target.get("related_work", [])
        ):
            score += 18
            reasons.append("already links back to this project")

        if score < 18:
            continue

        rows.append({
            "project_id": target_id,
            "title": str(target.get("title") or target_id),
            "summary": str(target.get("summary") or ""),
            "score": min(score, 99),
            "reasons": reasons,
            "shared_skills": shared_skills[:4],
            "shared_tools": shared_tools[:4],
            "suggested_relationship": _suggested_relationship(
                source, target, shared_skills, shared_tools, categories, subcategories
            ),
            "preview_url": _preview_url(target),
        })

    rows.sort(key=lambda item: (-item["score"], item["title"].casefold()))
    return rows[:8]


def project_relationship_workspace(project_id: str) -> dict[str, Any]:
    projects = load_projects()
    project = projects.get(project_id)
    if project is None:
        raise RelationshipGraphError(f"Project not found: {project_id}")

    categories, subcategories = _taxonomy_labels()
    outgoing: list[dict[str, Any]] = []
    current_targets: set[str] = set()

    for reference in project.get("related_work", []):
        if not isinstance(reference, dict):
            continue
        target_id = str(reference.get("project_id") or "").strip()
        if not target_id:
            continue
        current_targets.add(target_id)
        target = projects.get(target_id)
        outgoing.append({
            "project_id": target_id,
            "title": str((target or {}).get("title") or target_id),
            "summary": str((target or {}).get("summary") or ""),
            "relationship": str(reference.get("relationship") or ""),
            "missing": target is None,
            "preview_url": _preview_url(target) if target else "",
        })

    incoming: list[dict[str, Any]] = []
    for other_id, other in projects.items():
        if other_id == project_id:
            continue
        for reference in other.get("related_work", []):
            if isinstance(reference, dict) and str(reference.get("project_id") or "") == project_id:
                incoming.append({
                    "project_id": other_id,
                    "title": str(other.get("title") or other_id),
                    "relationship": str(reference.get("relationship") or ""),
                    "preview_url": _preview_url(other),
                })

    suggestions = _suggestions(
        project,
        projects,
        current_targets,
        categories,
        subcategories,
    )

    return {
        "project": deepcopy(project),
        "generated": _generated(project),
        "preview_url": _preview_url(project),
        "outgoing": sorted(outgoing, key=lambda item: item["title"].casefold()),
        "incoming": sorted(incoming, key=lambda item: item["title"].casefold()),
        "suggestions": suggestions,
        "available_projects": sorted(
            [
                {"id": other_id, "title": str(other.get("title") or other_id)}
                for other_id, other in projects.items()
                if other_id != project_id and other_id not in current_targets
            ],
            key=lambda item: item["title"].casefold(),
        ),
    }


def graph_overview() -> dict[str, Any]:
    projects = load_projects()
    incoming_counts = {project_id: 0 for project_id in projects}
    rows: list[dict[str, Any]] = []
    edge_count = 0

    for project_id, project in projects.items():
        outgoing_ids = [
            str(item.get("project_id") or "")
            for item in project.get("related_work", [])
            if isinstance(item, dict) and str(item.get("project_id") or "")
        ]
        edge_count += len(outgoing_ids)
        for target_id in outgoing_ids:
            if target_id in incoming_counts:
                incoming_counts[target_id] += 1

    for project_id, project in projects.items():
        outgoing_count = sum(
            1 for item in project.get("related_work", [])
            if isinstance(item, dict) and str(item.get("project_id") or "")
        )
        incoming_count = incoming_counts.get(project_id, 0)
        rows.append({
            "id": project_id,
            "title": str(project.get("title") or project_id),
            "category": str(project.get("category") or ""),
            "subcategory": str(project.get("subcategory") or ""),
            "outgoing_count": outgoing_count,
            "incoming_count": incoming_count,
            "connected": bool(outgoing_count or incoming_count),
            "generated": _generated(project),
            "preview_url": _preview_url(project),
        })

    connected = sum(1 for row in rows if row["connected"])
    return {
        "projects": sorted(rows, key=lambda item: item["title"].casefold()),
        "summary": {
            "projects": len(rows),
            "connections": edge_count,
            "connected_projects": connected,
            "unconnected_projects": len(rows) - connected,
        },
    }


def _backup(path: Path, original_text: str) -> Path:
    project_id = path.stem
    folder = BACKUP_ROOT / project_id
    folder.mkdir(parents=True, exist_ok=True)
    backup = folder / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}.json"
    backup.write_text(original_text, encoding="utf-8")
    return backup


def _mutate_project(project_id: str, mutate) -> dict[str, Any]:
    path = _project_path(project_id)
    original_text = path.read_text(encoding="utf-8")
    project = _load_json(path)
    updated = mutate(deepcopy(project))
    if not isinstance(updated, dict):
        raise RelationshipGraphError("Relationship update produced an invalid project record.")

    updated.setdefault("dates", {})["updated"] = date.today().isoformat()
    backup = _backup(path, original_text)
    _write_json(path, updated)

    content_check = run_command([sys.executable, "scripts/check-content.py"])
    if not content_check["success"]:
        path.write_text(original_text, encoding="utf-8")
        backup.unlink(missing_ok=True)
        raise RelationshipGraphError(
            "Relationship update failed structured-content validation and was rolled back. "
            + (content_check["stderr"] or content_check["stdout"])[:1200]
        )

    docs = run_command([sys.executable, "scripts/update-docs.py"])
    if not docs["success"]:
        path.write_text(original_text, encoding="utf-8")
        run_command([sys.executable, "scripts/update-docs.py"])
        backup.unlink(missing_ok=True)
        raise RelationshipGraphError(
            "Relationship update could not refresh generated documentation and was rolled back. "
            + (docs["stderr"] or docs["stdout"])[:1200]
        )

    return updated


def add_relationship(project_id: str, target_id: str, relationship: str) -> dict[str, Any]:
    target_id = str(target_id or "").strip()
    relationship = str(relationship or "").strip()
    if not relationship:
        raise RelationshipGraphError("Relationship text cannot be blank.")
    if len(relationship) > 500:
        raise RelationshipGraphError("Keep relationship text under 500 characters.")

    projects = load_projects()
    if project_id not in projects or target_id not in projects:
        raise RelationshipGraphError("Choose two existing structured projects.")
    if project_id == target_id:
        raise RelationshipGraphError("A project cannot relate to itself.")

    def mutate(project: dict[str, Any]) -> dict[str, Any]:
        references = project.setdefault("related_work", [])
        if any(isinstance(item, dict) and str(item.get("project_id") or "") == target_id for item in references):
            raise RelationshipGraphError("That related project is already connected.")
        references.append({"project_id": target_id, "relationship": relationship})
        return project

    return _mutate_project(project_id, mutate)


def update_relationship(project_id: str, target_id: str, relationship: str) -> dict[str, Any]:
    relationship = str(relationship or "").strip()
    if not relationship:
        raise RelationshipGraphError("Relationship text cannot be blank.")

    def mutate(project: dict[str, Any]) -> dict[str, Any]:
        found = False
        for item in project.get("related_work", []):
            if isinstance(item, dict) and str(item.get("project_id") or "") == target_id:
                item["relationship"] = relationship[:500]
                found = True
                break
        if not found:
            raise RelationshipGraphError("That related project is not currently connected.")
        return project

    return _mutate_project(project_id, mutate)


def remove_relationship(project_id: str, target_id: str) -> dict[str, Any]:
    def mutate(project: dict[str, Any]) -> dict[str, Any]:
        before = project.get("related_work", [])
        after = [
            item for item in before
            if not (isinstance(item, dict) and str(item.get("project_id") or "") == target_id)
        ]
        if len(after) == len(before):
            raise RelationshipGraphError("That related project is not currently connected.")
        if after:
            project["related_work"] = after
        else:
            project.pop("related_work", None)
        return project

    return _mutate_project(project_id, mutate)
