from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "portfolio-data"
PROJECT_ROOT = DATA_ROOT / "projects"
TAXONOMY_PATH = DATA_ROOT / "taxonomy.json"
COMPONENT_REGISTRY_PATH = DATA_ROOT / "component-registry.json"

REQUIRED_FIELDS = {
    "schema_version",
    "id",
    "title",
    "slug",
    "category",
    "status",
    "summary",
    "page_path",
    "confidentiality",
    "featured",
    "content",
    "skills",
    "tools",
    "assets",
    "dates",
}

REQUIRED_CONTENT_FIELDS = {
    "business_need",
    "audience",
    "learning_objectives",
    "role",
    "design_approach",
    "development_process",
    "outcomes",
}

DETAIL_LAYOUTS = {"cards", "flow", "table"}


def load_json(path: Path, errors: list[str]) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"Missing file: {path.relative_to(ROOT)}")
    except json.JSONDecodeError as exc:
        errors.append(
            f"{path.relative_to(ROOT)}: invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}"
        )
    return None


def validate_detail_sections(project: dict, label: Path, errors: list[str]) -> None:
    sections = project.get("detail_sections", [])
    if not isinstance(sections, list):
        errors.append(f"{label}: detail_sections must be a list")
        return

    seen_ids: set[str] = set()
    for index, section in enumerate(sections, start=1):
        if not isinstance(section, dict):
            errors.append(f"{label}: detail section {index} must be an object")
            continue

        section_id = str(section.get("id", "")).strip()
        if not section_id:
            errors.append(f"{label}: detail section {index} requires an id")
        elif section_id in seen_ids:
            errors.append(f"{label}: duplicate detail section id '{section_id}'")
        else:
            seen_ids.add(section_id)

        layout = section.get("layout")
        if layout not in DETAIL_LAYOUTS:
            errors.append(f"{label}: detail section '{section_id or index}' has unknown layout '{layout}'")
            continue

        if layout == "cards":
            items = section.get("items")
            if not isinstance(items, list) or not items:
                errors.append(f"{label}: cards section '{section_id}' requires at least one item")
        elif layout == "flow":
            groups = section.get("groups")
            if not isinstance(groups, list) or not groups:
                errors.append(f"{label}: flow section '{section_id}' requires at least one group")
            else:
                for group_index, group in enumerate(groups, start=1):
                    if not isinstance(group, dict) or not isinstance(group.get("items"), list) or not group.get("items"):
                        errors.append(
                            f"{label}: flow section '{section_id}' group {group_index} requires items"
                        )
        elif layout == "table":
            columns = section.get("columns")
            rows = section.get("rows")
            if not isinstance(columns, list) or not columns:
                errors.append(f"{label}: table section '{section_id}' requires columns")
            if not isinstance(rows, list) or not rows:
                errors.append(f"{label}: table section '{section_id}' requires rows")
            elif isinstance(columns, list) and columns:
                for row_index, row in enumerate(rows, start=1):
                    if not isinstance(row, list) or len(row) != len(columns):
                        errors.append(
                            f"{label}: table section '{section_id}' row {row_index} must match the column count"
                        )


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    taxonomy = load_json(TAXONOMY_PATH, errors)
    component_registry = load_json(COMPONENT_REGISTRY_PATH, errors)
    if taxonomy is None or component_registry is None:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    components = component_registry.get("components", [])
    if not isinstance(components, list):
        errors.append("portfolio-data/component-registry.json: components must be a list")
        component_ids: set[str] = set()
    else:
        component_ids = set()
        for index, component in enumerate(components, start=1):
            if not isinstance(component, dict):
                errors.append(f"portfolio-data/component-registry.json: component {index} must be an object")
                continue
            component_id = str(component.get("id", "")).strip()
            if not component_id:
                errors.append(f"portfolio-data/component-registry.json: component {index} requires an id")
            elif component_id in component_ids:
                errors.append(f"portfolio-data/component-registry.json: duplicate component id '{component_id}'")
            else:
                component_ids.add(component_id)

    categories = {item["id"]: item for item in taxonomy.get("categories", [])}
    statuses = {item["id"] for item in taxonomy.get("statuses", [])}
    confidentiality_values = {item["id"] for item in taxonomy.get("confidentiality", [])}
    asset_types = set(taxonomy.get("asset_types", []))

    project_files = sorted(PROJECT_ROOT.glob("*.json"))
    if not project_files:
        errors.append("No project records found under portfolio-data/projects/.")

    seen_ids: set[str] = set()
    seen_page_paths: set[str] = set()
    related_references: list[tuple[Path, str, str]] = []

    for project_file in project_files:
        project = load_json(project_file, errors)
        if project is None:
            continue

        label = project_file.relative_to(ROOT)
        missing = REQUIRED_FIELDS - set(project)
        if missing:
            errors.append(f"{label}: missing required field(s): {', '.join(sorted(missing))}")
            continue

        project_id = project["id"]
        if project_id in seen_ids:
            errors.append(f"{label}: duplicate project id '{project_id}'")
        seen_ids.add(project_id)

        if project_file.stem != project_id:
            errors.append(
                f"{label}: filename must match project id '{project_id}.json'"
            )

        category = project["category"]
        if category not in categories:
            errors.append(f"{label}: unknown category '{category}'")
        else:
            allowed_subcategories = {
                item["id"] for item in categories[category].get("subcategories", [])
            }
            subcategory = project.get("subcategory")
            if subcategory is not None and subcategory not in allowed_subcategories:
                errors.append(
                    f"{label}: subcategory '{subcategory}' is not valid for '{category}'"
                )

        if project["status"] not in statuses:
            errors.append(f"{label}: unknown status '{project['status']}'")

        confidentiality = project["confidentiality"]
        if confidentiality not in confidentiality_values:
            errors.append(f"{label}: unknown confidentiality value '{confidentiality}'")

        if confidentiality == "needs-sanitization" and project["status"] == "live":
            errors.append(
                f"{label}: a project needing sanitization cannot have status 'live'"
            )

        page_path = project["page_path"]
        if page_path in seen_page_paths:
            errors.append(f"{label}: duplicate page_path '{page_path}'")
        seen_page_paths.add(page_path)

        page_file = ROOT / page_path
        if project["status"] == "live" and not page_file.exists():
            errors.append(f"{label}: live page does not exist: {page_path}")

        content = project["content"]
        if not isinstance(content, dict):
            errors.append(f"{label}: content must be an object")
        else:
            missing_content = REQUIRED_CONTENT_FIELDS - set(content)
            if missing_content:
                errors.append(
                    f"{label}: content missing field(s): {', '.join(sorted(missing_content))}"
                )

        for list_field in ("skills", "tools", "assets"):
            if not isinstance(project[list_field], list):
                errors.append(f"{label}: {list_field} must be a list")

        if isinstance(project["assets"], list):
            for index, asset in enumerate(project["assets"], start=1):
                if not isinstance(asset, dict):
                    errors.append(f"{label}: asset {index} must be an object")
                    continue
                asset_type = asset.get("type")
                if asset_type not in asset_types:
                    errors.append(f"{label}: asset {index} has unknown type '{asset_type}'")
                if "publish" not in asset or not isinstance(asset["publish"], bool):
                    errors.append(f"{label}: asset {index} must include boolean 'publish'")
                if asset.get("publish") and not asset.get("path"):
                    errors.append(f"{label}: published asset {index} requires a path")

        validate_detail_sections(project, label, errors)

        component_refs = project.get("component_refs", [])
        if not isinstance(component_refs, list):
            errors.append(f"{label}: component_refs must be a list")
        else:
            seen_components: set[str] = set()
            for component_id in component_refs:
                component_id = str(component_id).strip()
                if not component_id:
                    errors.append(f"{label}: component_refs cannot contain blank ids")
                    continue
                if component_id in seen_components:
                    errors.append(f"{label}: duplicate component reference '{component_id}'")
                seen_components.add(component_id)
                if component_id not in component_ids:
                    errors.append(f"{label}: unknown component reference '{component_id}'")

        related_work = project.get("related_work", [])
        if not isinstance(related_work, list):
            errors.append(f"{label}: related_work must be a list")
        else:
            seen_related: set[str] = set()
            for index, reference in enumerate(related_work, start=1):
                if not isinstance(reference, dict):
                    errors.append(f"{label}: related work item {index} must be an object")
                    continue
                target_id = str(reference.get("project_id", "")).strip()
                relationship = str(reference.get("relationship", "")).strip()
                if not target_id:
                    errors.append(f"{label}: related work item {index} requires project_id")
                    continue
                if target_id == project_id:
                    errors.append(f"{label}: project cannot reference itself as related work")
                if target_id in seen_related:
                    errors.append(f"{label}: duplicate related work reference '{target_id}'")
                seen_related.add(target_id)
                if not relationship:
                    errors.append(f"{label}: related work reference '{target_id}' requires relationship text")
                related_references.append((label, project_id, target_id))

        if not project["summary"].strip():
            warnings.append(f"{label}: summary is empty")

    for label, source_id, target_id in related_references:
        if target_id not in seen_ids:
            errors.append(
                f"{label}: project '{source_id}' references missing related project '{target_id}'"
            )

    print(f"Checked {len(project_files)} structured project record(s).")

    if warnings:
        print("\nWarnings:")
        for warning in warnings:
            print(f"  - {warning}")

    if errors:
        print("\nErrors:")
        for error in errors:
            print(f"  - {error}")
        print(f"\nContent validation failed with {len(errors)} error(s).")
        return 1

    print("\nContent validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
