from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = ROOT / "portfolio"
DATA_ROOT = ROOT / "portfolio-data"
TAXONOMY_PATH = DATA_ROOT / "taxonomy.json"
TEMPLATE_PATH = ROOT / "templates" / "project-page" / "index.html"

TOKEN_PATTERN = re.compile(r"\{\{([A-Z0-9_]+)\}\}")
EXTERNAL_SCHEMES = ("http://", "https://", "mailto:", "tel:")


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError(f"Missing file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Invalid JSON in {path}: line {exc.lineno}, column {exc.colno}: {exc.msg}"
        ) from exc


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def as_repo_path(value: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return ROOT / path


def relative_href(output_path: Path, target: str | Path) -> str:
    target_text = str(target)
    if target_text.startswith(EXTERNAL_SCHEMES) or target_text.startswith("#"):
        return target_text

    target_path = as_repo_path(target_text).resolve()
    return os.path.relpath(target_path, output_path.parent.resolve()).replace(os.sep, "/")


def find_taxonomy_item(taxonomy: dict, project: dict) -> tuple[dict, dict | None]:
    category = next(
        (item for item in taxonomy.get("categories", []) if item.get("id") == project.get("category")),
        None,
    )
    if category is None:
        raise ValueError(f"Unknown project category: {project.get('category')}")

    subcategory = None
    subcategory_id = project.get("subcategory")
    if subcategory_id:
        subcategory = next(
            (item for item in category.get("subcategories", []) if item.get("id") == subcategory_id),
            None,
        )
        if subcategory is None:
            raise ValueError(
                f"Unknown subcategory '{subcategory_id}' for category '{category['id']}'"
            )

    return category, subcategory


def render_list(items: list[str]) -> str:
    if not items:
        return "<li>Not specified</li>"
    return "\n".join(f"<li>{esc(item)}</li>" for item in items)


def render_tags(project: dict) -> str:
    tags: list[str] = []
    for value in project.get("skills", []) + project.get("tools", []):
        if value and value not in tags:
            tags.append(value)
        if len(tags) == 6:
            break
    return "\n".join(f'<span class="tag">{esc(tag)}</span>' for tag in tags)


def asset_href(output_path: Path, value: str) -> str:
    if value.startswith(EXTERNAL_SCHEMES):
        return value
    return relative_href(output_path, value)


def render_assets(project: dict, output_path: Path) -> str:
    published = [asset for asset in project.get("assets", []) if asset.get("publish")]
    if not published:
        return ""

    parts = [
        "<section>",
        '    <p class="eyebrow">Project Assets</p>',
        "    <h2>Explore the work.</h2>",
    ]

    for asset in published:
        asset_type = asset.get("type", "other")
        path = asset_href(output_path, asset.get("path", ""))
        alt = esc(asset.get("alt", project.get("title", "Project asset")))
        caption = esc(asset.get("caption", ""))

        if asset_type == "image":
            parts.append(
                f'    <figure><img src="{esc(path)}" alt="{alt}">'
                + (f"<figcaption>{caption}</figcaption>" if caption else "")
                + "</figure>"
            )
        elif asset_type == "video":
            parts.append(
                f'    <video controls preload="metadata"><source src="{esc(path)}">'
                "Your browser does not support this video.</video>"
            )
            if caption:
                parts.append(f"    <p>{caption}</p>")
        else:
            label = caption or f"Open {asset_type}"
            parts.append(
                f'    <p><a class="btn btn-secondary" href="{esc(path)}" target="_blank" '
                f'rel="noopener noreferrer">{label}</a></p>'
            )

    parts.append("</section>")
    return "\n".join(parts)


def render_breadcrumbs(
    output_path: Path,
    project: dict,
    category: dict,
    subcategory: dict | None,
) -> str:
    crumbs = [
        ("Home", "portfolio/index.html"),
        ("Projects", "portfolio/projects/index.html"),
        (category["label"], category.get("path")),
    ]

    if subcategory:
        crumbs.append((subcategory["label"], subcategory.get("path")))

    html_parts: list[str] = []
    for label, path in crumbs:
        if path:
            html_parts.append(f'<a href="{esc(relative_href(output_path, path))}">{esc(label)}</a>')
        else:
            html_parts.append(f"<span>{esc(label)}</span>")
        html_parts.append('<span class="breadcrumb-separator">/</span>')

    html_parts.append(f"<span>{esc(project['title'])}</span>")
    return "\n".join(html_parts)


def render_primary_action(project: dict, output_path: Path, *, cta: bool = False) -> str:
    live_project = project.get("links", {}).get("live_project")
    if not live_project:
        return ""

    href = asset_href(output_path, live_project)
    css_class = "btn btn-highlight" if cta else "btn btn-primary"
    label = "Launch Project" if cta else "View Live Project"
    return (
        f'<a class="{css_class}" href="{esc(href)}" target="_blank" '
        f'rel="noopener noreferrer">{label}</a>'
    )


def render_confidentiality_note(project: dict) -> str:
    confidentiality = project.get("confidentiality")
    if confidentiality == "needs-sanitization":
        raise ValueError(
            f"Project '{project.get('id')}' still needs sanitization and cannot be rendered for publishing."
        )
    if confidentiality != "sanitized":
        return ""

    return (
        '<section><div class="feature-callout">'
        '<p class="eyebrow">Portfolio Note</p>'
        '<h2>Public-safe project example.</h2>'
        '<p>This example uses sanitized, fictionalized, or generalized content to demonstrate the '
        'design approach without exposing proprietary information.</p>'
        '</div></section>'
    )


def render_project_text(project_path: Path, output_path: Path | None = None) -> tuple[str, Path]:
    project_path = project_path.resolve()
    project = load_json(project_path)
    taxonomy = load_json(TAXONOMY_PATH)
    category, subcategory = find_taxonomy_item(taxonomy, project)

    final_output = output_path.resolve() if output_path else (ROOT / project["page_path"]).resolve()

    try:
        final_output.relative_to(ROOT)
    except ValueError as exc:
        raise ValueError("Output path must remain inside the repository.") from exc

    content = project.get("content", {})
    statuses = {item["id"]: item["label"] for item in taxonomy.get("statuses", [])}
    status = project.get("status", "planned")

    back_item = subcategory if subcategory and subcategory.get("path") else category
    back_path = back_item.get("path", "portfolio/projects/index.html")
    back_label = f"Back to {back_item['label']}"
    project_type = subcategory["label"] if subcategory else category["label"]

    tools = project.get("tools", [])
    tokens = {
        "META_DESCRIPTION": esc(project["summary"]),
        "PAGE_TITLE": esc(f"{project['title']} | Haley Reeder"),
        "CSS_PATH": esc(relative_href(final_output, "portfolio/css/styles.css")),
        "REFRESH_CSS_PATH": esc(relative_href(final_output, "portfolio/css/portfolio-refresh.css")),
        "HOME_PATH": esc(relative_href(final_output, "portfolio/index.html")),
        "ABOUT_PATH": esc(relative_href(final_output, "portfolio/about/index.html")),
        "PROJECTS_PATH": esc(relative_href(final_output, "portfolio/projects/index.html")),
        "CONTACT_PATH": esc(relative_href(final_output, "portfolio/contact/index.html")),
        "RESUME_PATH": esc(relative_href(final_output, "portfolio/assets/documents/Haley-Reeder-Resume.pdf")),
        "BREADCRUMBS": render_breadcrumbs(final_output, project, category, subcategory),
        "CATEGORY_LABEL": esc(category["label"]),
        "TITLE": esc(project["title"]),
        "SUMMARY": esc(project["summary"]),
        "TAGS": render_tags(project),
        "PRIMARY_ACTION": render_primary_action(project, final_output),
        "PRIMARY_ACTION_CTA": render_primary_action(project, final_output, cta=True),
        "BACK_PATH": esc(relative_href(final_output, back_path)),
        "BACK_LABEL": esc(back_label),
        "ROLE": esc(content.get("role", "")),
        "AUDIENCE": esc(content.get("audience", "")),
        "TOOLS_SUMMARY": esc(", ".join(tools[:3]) if tools else "Not specified"),
        "PROJECT_TYPE": esc(project_type),
        "BUSINESS_NEED": esc(content.get("business_need", "")),
        "LEARNING_OBJECTIVES": render_list(content.get("learning_objectives", [])),
        "DESIGN_APPROACH": esc(content.get("design_approach", "")),
        "DEVELOPMENT_PROCESS": esc(content.get("development_process", "")),
        "ASSETS_SECTION": render_assets(project, final_output),
        "OUTCOMES": render_list(content.get("outcomes", [])),
        "CONFIDENTIALITY_NOTE": render_confidentiality_note(project),
        "TOOLS_LIST": render_list(tools),
        "SKILLS_LIST": render_list(project.get("skills", [])),
        "STATUS_CLASS": esc(status),
        "STATUS_LABEL": esc(statuses.get(status, status.title())),
        "CTA_HEADING": esc("Explore the finished project." if project.get("links", {}).get("live_project") else "Explore more of my work."),
    }

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    rendered = template
    for key, value in tokens.items():
        rendered = rendered.replace("{{" + key + "}}", value)

    unresolved = sorted(set(TOKEN_PATTERN.findall(rendered)))
    if unresolved:
        raise ValueError(f"Unresolved template token(s): {', '.join(unresolved)}")

    return rendered, final_output


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render a structured portfolio project JSON record into the standard project-page template."
    )
    parser.add_argument("project", help="Project JSON path, for example portfolio-data/projects/example.json")
    parser.add_argument("--output", help="Optional output path. Defaults to the record's page_path.")
    parser.add_argument("--force", action="store_true", help="Allow overwriting an existing output file.")
    parser.add_argument("--stdout", action="store_true", help="Print rendered HTML instead of writing it.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    project_path = as_repo_path(args.project)
    output_path = as_repo_path(args.output) if args.output else None

    try:
        rendered, final_output = render_project_text(project_path, output_path)
    except (ValueError, KeyError) as exc:
        print(f"ERROR: {exc}")
        return 1

    if args.stdout:
        print(rendered)
        return 0

    if final_output.exists() and not args.force:
        print(
            f"ERROR: {final_output.relative_to(ROOT)} already exists. "
            "Use --force only when you intentionally want to replace that page."
        )
        return 1

    final_output.parent.mkdir(parents=True, exist_ok=True)
    final_output.write_text(rendered, encoding="utf-8")
    print(f"Rendered {project_path.relative_to(ROOT)} -> {final_output.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
