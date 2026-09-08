from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "portfolio-data"
PROJECT_ROOT = DATA_ROOT / "projects"
TAXONOMY_PATH = DATA_ROOT / "taxonomy.json"

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


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    taxonomy = load_json(TAXONOMY_PATH, errors)
    if taxonomy is None:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    categories = {item["id"]: item for item in taxonomy.get("categories", [])}
    statuses = {item["id"] for item in taxonomy.get("statuses", [])}
    confidentiality_values = {item["id"] for item in taxonomy.get("confidentiality", [])}
    asset_types = set(taxonomy.get("asset_types", []))

    project_files = sorted(PROJECT_ROOT.glob("*.json"))
    if not project_files:
        errors.append("No project records found under portfolio-data/projects/.")

    seen_ids: set[str] = set()
    seen_page_paths: set[str] = set()

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

        if not project["summary"].strip():
            warnings.append(f"{label}: summary is empty")

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
