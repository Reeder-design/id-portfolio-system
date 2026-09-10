from __future__ import annotations

from datetime import date
from pathlib import Path
import importlib.util
import json
import subprocess
import sys

from flask import Blueprint, flash, redirect, render_template, request, url_for


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
DATA_ROOT = REPO_ROOT / "portfolio-data"
PROJECT_DATA_ROOT = DATA_ROOT / "projects"
TAXONOMY_PATH = DATA_ROOT / "taxonomy.json"

NEW_PROJECT_SCRIPT = REPO_ROOT / "scripts" / "new-project.py"
RENDER_PROJECT_SCRIPT = REPO_ROOT / "scripts" / "render-project.py"
UPDATE_DOCS_SCRIPT = REPO_ROOT / "scripts" / "update-docs.py"

GENERATED_PAGE_MARKER = "<!-- PORTFOLIO-MANAGER:GENERATED-PROJECT-PAGE -->"

content_bp = Blueprint("content", __name__)


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict) -> None:
    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def load_script_module(path: Path, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load {path.relative_to(REPO_ROOT)}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_command(command: list[str]) -> tuple[bool, str]:
    result = subprocess.run(
        command,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    output = "\n".join(
        value for value in [result.stdout.strip(), result.stderr.strip()] if value
    )
    return result.returncode == 0, output


def split_lines(value: str) -> list[str]:
    return [line.strip() for line in value.splitlines() if line.strip()]


def split_csv(value: str) -> list[str]:
    values: list[str] = []
    for item in value.split(","):
        cleaned = item.strip()
        if cleaned and cleaned not in values:
            values.append(cleaned)
    return values


def taxonomy_maps(taxonomy: dict) -> tuple[dict[str, str], dict[str, str]]:
    category_labels: dict[str, str] = {}
    subcategory_labels: dict[str, str] = {}

    for category in taxonomy.get("categories", []):
        category_labels[category["id"]] = category["label"]
        for subcategory in category.get("subcategories", []):
            subcategory_labels[subcategory["id"]] = subcategory["label"]

    return category_labels, subcategory_labels


def placement_options(taxonomy: dict) -> list[dict]:
    options: list[dict] = []

    for category in taxonomy.get("categories", []):
        subcategories = category.get("subcategories", [])

        if not subcategories:
            options.append({
                "value": f"{category['id']}::",
                "label": category["label"],
            })
            continue

        for subcategory in subcategories:
            options.append({
                "value": f"{category['id']}::{subcategory['id']}",
                "label": f"{category['label']} — {subcategory['label']}",
            })

    return options


def resolve_placement(taxonomy: dict, placement: str) -> tuple[dict, dict | None]:
    try:
        category_id, subcategory_id = placement.split("::", 1)
    except ValueError as exc:
        raise ValueError("Invalid portfolio placement.") from exc

    category = next(
        (
            item
            for item in taxonomy.get("categories", [])
            if item.get("id") == category_id
        ),
        None,
    )
    if category is None:
        raise ValueError("Unknown portfolio category.")

    if not subcategory_id:
        return category, None

    subcategory = next(
        (
            item
            for item in category.get("subcategories", [])
            if item.get("id") == subcategory_id
        ),
        None,
    )
    if subcategory is None:
        raise ValueError("Unknown portfolio subcategory.")

    return category, subcategory


def load_project(project_id: str) -> tuple[dict, Path]:
    if not project_id or "/" in project_id or "\\" in project_id or ".." in project_id:
        raise FileNotFoundError("Invalid project id.")

    path = PROJECT_DATA_ROOT / f"{project_id}.json"
    if not path.exists():
        raise FileNotFoundError(f"Project not found: {project_id}")

    return load_json(path), path


def is_generated_page(project: dict) -> bool:
    page_path = REPO_ROOT / project.get("page_path", "")
    if not page_path.exists() or not page_path.is_file():
        return False

    try:
        html = page_path.read_text(encoding="utf-8")
    except Exception:
        return False

    return GENERATED_PAGE_MARKER in html


def list_projects() -> list[dict]:
    taxonomy = load_json(TAXONOMY_PATH)
    category_labels, subcategory_labels = taxonomy_maps(taxonomy)

    projects: list[dict] = []

    for path in PROJECT_DATA_ROOT.glob("*.json"):
        try:
            project = load_json(path)
        except Exception:
            continue

        project["_category_label"] = category_labels.get(
            project.get("category"),
            project.get("category", "Unknown"),
        )
        project["_subcategory_label"] = subcategory_labels.get(
            project.get("subcategory"),
            project.get("subcategory") or "",
        )
        project["_generated_page"] = is_generated_page(project)
        projects.append(project)

    return sorted(projects, key=lambda item: item.get("title", "").lower())


def refresh_docs() -> tuple[bool, str]:
    return run_command([sys.executable, str(UPDATE_DOCS_SCRIPT)])


def save_project_record(project_id: str, form) -> tuple[bool, str]:
    project, project_path = load_project(project_id)
    original_text = project_path.read_text(encoding="utf-8")

    status = form.get("status", project.get("status", "building"))
    confidentiality = form.get(
        "confidentiality",
        project.get("confidentiality", "public"),
    )

    if confidentiality == "needs-sanitization" and status == "live":
        return False, "A project that needs sanitization cannot be marked Live."

    project["title"] = form.get("title", project.get("title", "")).strip()
    project["summary"] = form.get("summary", project.get("summary", "")).strip()
    project["status"] = status
    project["confidentiality"] = confidentiality
    project["featured"] = form.get("featured") == "on"

    content = project.setdefault("content", {})
    content["business_need"] = form.get("business_need", "").strip()
    content["audience"] = form.get("audience", "").strip()
    content["role"] = form.get("role", "").strip()
    content["learning_objectives"] = split_lines(
        form.get("learning_objectives", "")
    )
    content["design_approach"] = form.get("design_approach", "").strip()
    content["development_process"] = form.get(
        "development_process",
        "",
    ).strip()
    content["outcomes"] = split_lines(form.get("outcomes", ""))

    project["skills"] = split_csv(form.get("skills", ""))
    project["tools"] = split_csv(form.get("tools", ""))

    links = dict(project.get("links", {}))
    live_project = form.get("live_project", "").strip()

    if live_project:
        links["live_project"] = live_project
    else:
        links.pop("live_project", None)

    if links:
        project["links"] = links
    else:
        project.pop("links", None)

    project["source_material_notes"] = form.get(
        "source_material_notes",
        project.get("source_material_notes", ""),
    ).strip()

    dates = project.setdefault("dates", {})
    dates["updated"] = date.today().isoformat()

    write_json(project_path, project)

    valid, output = run_command([sys.executable, "scripts/check-content.py"])
    if not valid:
        project_path.write_text(original_text, encoding="utf-8")
        return False, (
            "The edit failed structured-content validation and was rolled back."
            + (f"\n\n{output}" if output else "")
        )

    docs_ok, docs_output = refresh_docs()
    if not docs_ok:
        project_path.write_text(original_text, encoding="utf-8")
        refresh_docs()
        return False, (
            "The documentation refresh failed, so the edit was rolled back."
            + (f"\n\n{docs_output}" if docs_output else "")
        )

    return True, "Project data saved and documentation refreshed."


@content_bp.route("/content")
def content_manager():
    taxonomy = load_json(TAXONOMY_PATH)
    return render_template(
        "content-manager.html",
        projects=list_projects(),
        placements=placement_options(taxonomy),
    )


@content_bp.route("/content/create", methods=["POST"])
def create_project():
    try:
        taxonomy = load_json(TAXONOMY_PATH)
        category, subcategory = resolve_placement(
            taxonomy,
            request.form.get("placement", ""),
        )

        title = request.form.get("title", "").strip()
        summary = request.form.get("summary", "").strip()
        business_need = request.form.get("business_need", "").strip()
        audience = request.form.get("audience", "").strip()
        role = request.form.get("role", "").strip()

        if not all([title, summary, business_need, audience, role]):
            raise ValueError(
                "Title, summary, business need, audience, and role are required."
            )

        generator = load_script_module(
            NEW_PROJECT_SCRIPT,
            "portfolio_manager_new_project",
        )

        slug = generator.slugify(
            request.form.get("slug", "").strip() or title
        )

        record = generator.build_project_record(
            title=title,
            slug=slug,
            category=category,
            subcategory=subcategory,
            status=request.form.get("status", "building"),
            summary=summary,
            confidentiality=request.form.get("confidentiality", "public"),
            featured=False,
            business_need=business_need,
            audience=audience,
            learning_objectives=[],
            role=role,
            design_approach="",
            development_process="",
            outcomes=[],
            skills=[],
            tools=[],
            source_material_notes="",
        )

        generator.create_project(record, render=True)

        docs_ok, docs_output = refresh_docs()
        if not docs_ok:
            flash(
                "Project created, but documentation refresh failed. "
                f"Run Refresh Docs before committing. {docs_output}",
                "error",
            )
        else:
            flash(
                f"Created {record['title']}. Finish its details in the editor.",
                "success",
            )

        return redirect(
            url_for("content.project_editor", project_id=record["id"])
        )

    except Exception as exc:
        flash(f"Could not create project: {exc}", "error")
        return redirect(url_for("content.content_manager"))


@content_bp.route("/content/projects/<project_id>")
def project_editor(project_id: str):
    try:
        project, _ = load_project(project_id)
    except FileNotFoundError as exc:
        flash(str(exc), "error")
        return redirect(url_for("content.content_manager"))

    project["_generated_page"] = is_generated_page(project)
    content = project.get("content", {})

    return render_template(
        "project-editor.html",
        project=project,
        learning_objectives="\n".join(
            content.get("learning_objectives", [])
        ),
        outcomes="\n".join(content.get("outcomes", [])),
        skills=", ".join(project.get("skills", [])),
        tools=", ".join(project.get("tools", [])),
    )


@content_bp.route("/content/projects/<project_id>/save", methods=["POST"])
def save_project(project_id: str):
    try:
        success, message = save_project_record(project_id, request.form)
    except Exception as exc:
        success = False
        message = str(exc)

    flash(message, "success" if success else "error")
    return redirect(
        url_for("content.project_editor", project_id=project_id)
    )


@content_bp.route(
    "/content/projects/<project_id>/regenerate",
    methods=["POST"],
)
def regenerate_project(project_id: str):
    try:
        project, project_path = load_project(project_id)
    except FileNotFoundError as exc:
        flash(str(exc), "error")
        return redirect(url_for("content.content_manager"))

    if not is_generated_page(project):
        flash(
            "Regeneration is disabled because this is a custom page, "
            "not a standard template-generated page.",
            "error",
        )
        return redirect(
            url_for("content.project_editor", project_id=project_id)
        )

    success, output = run_command([
        sys.executable,
        str(RENDER_PROJECT_SCRIPT),
        str(project_path.relative_to(REPO_ROOT)),
        "--force",
    ])

    if not success:
        flash(
            "Page regeneration failed."
            + (f"\n\n{output}" if output else ""),
            "error",
        )
        return redirect(
            url_for("content.project_editor", project_id=project_id)
        )

    site_ok, site_output = run_command(
        [sys.executable, "scripts/check-site.py"]
    )

    if site_ok:
        flash("Standard project page regenerated successfully.", "success")
    else:
        flash(
            "The page regenerated, but site validation failed."
            + (f"\n\n{site_output}" if site_output else ""),
            "error",
        )

    return redirect(
        url_for("content.project_editor", project_id=project_id)
    )
