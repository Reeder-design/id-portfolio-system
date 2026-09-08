from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "portfolio-data"
PROJECT_ROOT = DATA_ROOT / "projects"
TAXONOMY_PATH = DATA_ROOT / "taxonomy.json"
RENDERER_PATH = ROOT / "scripts" / "render-project.py"


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError(f"Missing file: {path.relative_to(ROOT)}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Invalid JSON in {path.relative_to(ROOT)}: "
            f"line {exc.lineno}, column {exc.colno}: {exc.msg}"
        ) from exc


def load_renderer():
    spec = importlib.util.spec_from_file_location("portfolio_render_project", RENDERER_PATH)
    if spec is None or spec.loader is None:
        raise ValueError("Could not load scripts/render-project.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    if not value:
        raise ValueError("A project slug could not be generated from that title.")
    return value


def prompt_required(label: str, default: str | None = None) -> str:
    while True:
        suffix = f" [{default}]" if default else ""
        value = input(f"{label}{suffix}: ").strip()
        if value:
            return value
        if default:
            return default
        print("Please enter a value.")


def prompt_optional(label: str) -> str:
    return input(f"{label} (optional): ").strip()


def prompt_bool(label: str, default: bool = False) -> bool:
    default_hint = "Y/n" if default else "y/N"
    while True:
        value = input(f"{label} [{default_hint}]: ").strip().lower()
        if not value:
            return default
        if value in {"y", "yes"}:
            return True
        if value in {"n", "no"}:
            return False
        print("Enter y or n.")


def prompt_choice(
    label: str,
    items: list[dict],
    *,
    default_id: str | None = None,
    allow_none: bool = False,
) -> dict | None:
    print(f"\n{label}")
    start = 1
    if allow_none:
        print("  0. None")
    for index, item in enumerate(items, start=start):
        marker = " (default)" if item.get("id") == default_id else ""
        print(f"  {index}. {item.get('label', item.get('id'))}{marker}")

    by_id = {item.get("id"): item for item in items}
    default_item = by_id.get(default_id) if default_id else None

    while True:
        raw = input("Choose a number: ").strip()
        if not raw and default_item is not None:
            return default_item
        if allow_none and raw == "0":
            return None
        try:
            index = int(raw)
        except ValueError:
            print("Enter one of the listed numbers.")
            continue
        if 1 <= index <= len(items):
            return items[index - 1]
        print("Enter one of the listed numbers.")


def prompt_lines(label: str) -> list[str]:
    print(f"\n{label}")
    print("Enter one item per line. Press Enter on a blank line when finished.")
    values: list[str] = []
    while True:
        value = input(f"  {len(values) + 1}. ").strip()
        if not value:
            if values:
                return values
            print("Add at least one item.")
            continue
        values.append(value)


def prompt_csv(label: str) -> list[str]:
    value = input(f"{label} (comma-separated, optional): ").strip()
    if not value:
        return []
    seen: list[str] = []
    for item in value.split(","):
        cleaned = item.strip()
        if cleaned and cleaned not in seen:
            seen.append(cleaned)
    return seen


def build_page_path(category: dict, subcategory: dict | None, slug: str) -> str:
    if subcategory and subcategory.get("path"):
        base = Path(subcategory["path"]).parent
    elif subcategory:
        base = Path(category["path"]).parent / subcategory["id"]
    else:
        base = Path(category["path"]).parent
    return (base / slug / "index.html").as_posix()


def build_project_record(
    *,
    title: str,
    slug: str,
    category: dict,
    subcategory: dict | None,
    status: str,
    summary: str,
    confidentiality: str,
    featured: bool,
    business_need: str,
    audience: str,
    learning_objectives: list[str],
    role: str,
    design_approach: str,
    development_process: str,
    outcomes: list[str],
    skills: list[str],
    tools: list[str],
    assets: list[dict] | None = None,
    live_project: str | None = None,
    source_material_notes: str = "",
    today: str | None = None,
) -> dict:
    if confidentiality == "needs-sanitization" and status == "live":
        raise ValueError("A project needing sanitization cannot be marked live.")

    record = {
        "schema_version": "1.0.0",
        "id": slug,
        "title": title,
        "slug": slug,
        "category": category["id"],
        "subcategory": subcategory["id"] if subcategory else None,
        "status": status,
        "summary": summary,
        "page_path": build_page_path(category, subcategory, slug),
        "featured": featured,
        "confidentiality": confidentiality,
        "content": {
            "business_need": business_need,
            "audience": audience,
            "learning_objectives": learning_objectives,
            "role": role,
            "design_approach": design_approach,
            "development_process": development_process,
            "outcomes": outcomes,
        },
        "skills": skills,
        "tools": tools,
        "assets": assets or [],
        "source_material_notes": source_material_notes,
        "dates": {
            "created": today or date.today().isoformat(),
            "updated": today or date.today().isoformat(),
        },
    }
    if live_project:
        record["links"] = {"live_project": live_project}
    return record


def record_paths(record: dict) -> tuple[Path, Path]:
    record_path = PROJECT_ROOT / f"{record['id']}.json"
    page_path = ROOT / record["page_path"]
    return record_path, page_path


def preflight(record: dict) -> tuple[Path, Path]:
    record_path, page_path = record_paths(record)
    errors: list[str] = []

    if record_path.exists():
        errors.append(f"Structured record already exists: {record_path.relative_to(ROOT)}")
    if page_path.exists():
        errors.append(f"Portfolio page already exists: {page_path.relative_to(ROOT)}")

    for existing_path in PROJECT_ROOT.glob("*.json"):
        try:
            existing = load_json(existing_path)
        except ValueError:
            continue
        if existing.get("id") == record["id"]:
            errors.append(f"Project id already exists in {existing_path.relative_to(ROOT)}")
        if existing.get("page_path") == record["page_path"]:
            errors.append(f"Project page path already exists in {existing_path.relative_to(ROOT)}")

    if errors:
        raise ValueError("\n".join(dict.fromkeys(errors)))
    return record_path, page_path


def run_validation(include_site: bool) -> tuple[bool, str]:
    commands = [
        [sys.executable, str(ROOT / "scripts" / "check-content.py")],
    ]
    if include_site:
        commands.append([sys.executable, str(ROOT / "scripts" / "check-site.py")])

    output: list[str] = []
    for command in commands:
        result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
        output.append(result.stdout)
        if result.stderr:
            output.append(result.stderr)
        if result.returncode != 0:
            return False, "\n".join(output).strip()
    return True, "\n".join(output).strip()


def cleanup_empty_parents(path: Path, stop: Path) -> None:
    current = path.parent
    while current != stop and current.is_relative_to(stop):
        try:
            current.rmdir()
        except OSError:
            break
        current = current.parent


def create_project(record: dict, *, render: bool = True) -> tuple[Path, Path | None]:
    record_path, page_path = preflight(record)
    should_render = render and record["confidentiality"] != "needs-sanitization"
    created_page: Path | None = None

    record_path.parent.mkdir(parents=True, exist_ok=True)
    record_path.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    try:
        if should_render:
            renderer = load_renderer()
            rendered, final_output = renderer.render_project_text(record_path)
            final_output.parent.mkdir(parents=True, exist_ok=True)
            final_output.write_text(rendered, encoding="utf-8")
            created_page = final_output

        valid, validation_output = run_validation(include_site=should_render)
        if not valid:
            raise ValueError("Validation failed after creating the project:\n" + validation_output)
    except Exception:
        if created_page and created_page.exists():
            created_page.unlink()
            cleanup_empty_parents(created_page, ROOT / "portfolio" / "projects")
        if record_path.exists():
            record_path.unlink()
        raise

    return record_path, created_page


def prompt_assets(taxonomy: dict) -> list[dict]:
    assets: list[dict] = []
    if not prompt_bool("Add a public asset reference now?", default=False):
        return assets

    asset_types = [{"id": value, "label": value.title()} for value in taxonomy.get("asset_types", [])]
    while True:
        asset_type = prompt_choice("Asset type", asset_types)
        assert asset_type is not None
        path = prompt_required("Repository path or public URL")
        alt = prompt_optional("Alt text")
        caption = prompt_optional("Caption")
        asset = {
            "type": asset_type["id"],
            "path": path,
            "publish": True,
        }
        if alt:
            asset["alt"] = alt
        if caption:
            asset["caption"] = caption
        assets.append(asset)
        if not prompt_bool("Add another public asset?", default=False):
            return assets


def collect_project(taxonomy: dict) -> dict:
    print("\n=== New Portfolio Project ===")
    print("This creates a structured project record and a standard case-study page.")
    print("Private/reference source files should NOT be added to this public repository.\n")

    title = prompt_required("Project title")
    suggested_slug = slugify(title)
    slug = slugify(prompt_required("URL slug", suggested_slug))

    category = prompt_choice("Portfolio category", taxonomy.get("categories", []))
    assert category is not None
    subcategories = category.get("subcategories", [])
    subcategory = None
    if subcategories:
        subcategory = prompt_choice("Subcategory", subcategories, allow_none=True)

    status_item = prompt_choice("Project status", taxonomy.get("statuses", []), default_id="building")
    assert status_item is not None
    confidentiality_item = prompt_choice(
        "Confidentiality",
        taxonomy.get("confidentiality", []),
        default_id="public",
    )
    assert confidentiality_item is not None

    status = status_item["id"]
    confidentiality = confidentiality_item["id"]
    if confidentiality == "needs-sanitization" and status == "live":
        print("A project needing sanitization cannot be live. Status changed to Building.")
        status = "building"

    summary = prompt_required("Short project summary")
    business_need = prompt_required("Business / learning need")
    audience = prompt_required("Audience")
    role = prompt_required("My role")
    learning_objectives = prompt_lines("Learning objectives")
    design_approach = prompt_required("Design approach")
    development_process = prompt_required("Development process")
    outcomes = prompt_lines("Results / outcomes")
    skills = prompt_csv("Skills demonstrated")
    tools = prompt_csv("Tools used")
    featured = prompt_bool("Feature this project?", default=False)
    live_project = prompt_optional("Live project URL or repository-relative path")
    source_material_notes = prompt_optional("Public-safe source/sanitization notes")
    assets = prompt_assets(taxonomy)

    return build_project_record(
        title=title,
        slug=slug,
        category=category,
        subcategory=subcategory,
        status=status,
        summary=summary,
        confidentiality=confidentiality,
        featured=featured,
        business_need=business_need,
        audience=audience,
        learning_objectives=learning_objectives,
        role=role,
        design_approach=design_approach,
        development_process=development_process,
        outcomes=outcomes,
        skills=skills,
        tools=tools,
        assets=assets,
        live_project=live_project or None,
        source_material_notes=source_material_notes,
    )


def print_summary(record: dict) -> None:
    print("\n=== Project Preview ===")
    print(f"Title:           {record['title']}")
    print(f"ID / slug:       {record['id']}")
    print(f"Category:        {record['category']}")
    print(f"Subcategory:     {record.get('subcategory') or 'None'}")
    print(f"Status:          {record['status']}")
    print(f"Confidentiality: {record['confidentiality']}")
    print(f"Data record:     portfolio-data/projects/{record['id']}.json")
    print(f"Page:            {record['page_path']}")
    if record["confidentiality"] == "needs-sanitization":
        print("Public page:     NOT generated until content is sanitized")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a new structured portfolio project and standard case-study page.")
    parser.add_argument("--dry-run", action="store_true", help="Collect and preview the project without writing files.")
    parser.add_argument("--no-render", action="store_true", help="Create the JSON record without generating the HTML page.")
    parser.add_argument("--yes", action="store_true", help="Skip the final confirmation prompt.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        taxonomy = load_json(TAXONOMY_PATH)
        record = collect_project(taxonomy)
        preflight(record)
        print_summary(record)

        if args.dry_run:
            print("\nDry run only. No files were created.")
            print(json.dumps(record, indent=2, ensure_ascii=False))
            return 0

        if not args.yes and not prompt_bool("Create this project?", default=True):
            print("Cancelled. No files were created.")
            return 0

        record_path, page_path = create_project(record, render=not args.no_render)
    except (ValueError, KeyError) as exc:
        print(f"\nERROR: {exc}")
        return 1

    print("\nProject created successfully.")
    print(f"  Data: {record_path.relative_to(ROOT)}")
    if page_path:
        print(f"  Page: {page_path.relative_to(ROOT)}")
    elif record["confidentiality"] == "needs-sanitization":
        print("  Page: not generated because the project still needs sanitization")
    else:
        print("  Page: not generated (--no-render)")
    print("\nNext: review the files in VS Code, then commit them on a feature/content branch.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
