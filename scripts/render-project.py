from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "portfolio-data"
TAXONOMY_PATH = DATA_ROOT / "taxonomy.json"
TEMPLATE_PATH = ROOT / "templates" / "project-page" / "index.html"

TOKEN_PATTERN = re.compile(r"\{\{([A-Z0-9_]+)\}\}")
EXTERNAL_SCHEMES = ("http://", "https://", "mailto:", "tel:")
CATEGORY_ICONS = {
    "instructional-design": "icon-learning-design",
    "ai-training-and-evaluation": "icon-ai-evaluation",
    "workflows": "icon-workflow",
    "lms-administration": "icon-lms",
}


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


def render_list(items: list[str]) -> str:
    if not items:
        return "<li>Not specified</li>"
    return "\n".join(f"<li>{esc(item)}</li>" for item in items)


def unique_values(values: list[str], limit: int | None = None) -> list[str]:
    result: list[str] = []
    for value in values:
        if value and value not in result:
            result.append(value)
        if limit and len(result) >= limit:
            break
    return result


def render_tag_spans(values: list[str], *, fallback: str = "Not specified") -> str:
    cleaned = unique_values(values)
    if not cleaned:
        return f'<span class="tag">{esc(fallback)}</span>'
    return "\n".join(f'<span class="tag">{esc(value)}</span>' for value in cleaned)


def render_tags(project: dict) -> str:
    values = unique_values(project.get("skills", []) + project.get("tools", []), limit=6)
    return render_tag_spans(values)


def asset_href(output_path: Path, value: str) -> str:
    if value.startswith(EXTERNAL_SCHEMES):
        return value
    return relative_href(output_path, value)


def render_detail_layout(section: dict) -> str:
    layout = section.get("layout")

    if layout == "cards":
        cards: list[str] = []
        for item in section.get("items", []):
            tag = item.get("tag", "").strip()
            body = item.get("body", "").strip()
            tag_html = f'<span class="project-detail-tag">{esc(tag)}</span>' if tag else ""
            body_html = f"<p>{esc(body)}</p>" if body else ""
            cards.append(
                '<article class="project-detail-card">'
                f"{tag_html}<h3>{esc(item.get('title', ''))}</h3>{body_html}"
                "</article>"
            )
        return f'<div class="project-detail-card-grid">{"".join(cards)}</div>'

    if layout == "flow":
        groups: list[str] = []
        for group in section.get("groups", []):
            description = group.get("description", "").strip()
            description_html = f"<p>{esc(description)}</p>" if description else ""
            steps = "".join(
                f'<span class="project-flow-step">{esc(item)}</span>'
                for item in group.get("items", [])
            )
            groups.append(
                '<article class="project-flow-group">'
                f"<h3>{esc(group.get('title', ''))}</h3>{description_html}"
                f'<div class="project-flow-steps">{steps}</div>'
                "</article>"
            )
        return f'<div class="project-detail-flow-groups">{"".join(groups)}</div>'

    if layout == "table":
        columns = section.get("columns", [])
        rows = section.get("rows", [])
        header_html = "".join(f"<th scope=\"col\">{esc(column)}</th>" for column in columns)
        row_html = "".join(
            "<tr>" + "".join(f"<td>{esc(cell)}</td>" for cell in row) + "</tr>"
            for row in rows
        )
        return (
            '<div class="project-detail-table-wrap"><table class="project-detail-table">'
            f"<thead><tr>{header_html}</tr></thead><tbody>{row_html}</tbody>"
            "</table></div>"
        )

    raise ValueError(f"Unknown detail section layout: {layout}")


def render_detail_sections(project: dict, start_number: int) -> tuple[str, str, int]:
    sections = project.get("detail_sections", [])
    if not sections:
        return "", "", start_number

    html_parts: list[str] = []
    nav_parts: list[str] = []
    number = start_number

    for section in sections:
        section_id = section.get("id", "").strip()
        if not section_id:
            raise ValueError(f"Project '{project.get('id')}' has a detail section without an id.")

        nav_parts.append(f'<a href="#{esc(section_id)}">{esc(section.get("eyebrow", section.get("title", "Details")))}</a>')
        summary = section.get("summary", "").strip()
        note = section.get("note", "").strip()
        summary_html = f"<p>{esc(summary)}</p>" if summary else ""
        note_html = f'<p class="project-detail-note">{esc(note)}</p>' if note else ""
        layout_html = render_detail_layout(section)

        html_parts.append(
            f'<section class="section flagship-section scaffold-section project-detail-section" id="{esc(section_id)}">'
            '<div class="container scaffold-copy">'
            f'<div class="scaffold-kicker"><span class="project-detail-number" aria-hidden="true">{number:02d}</span>'
            f'<p class="eyebrow">{esc(section.get("eyebrow", "Project Detail"))}</p></div>'
            f'<h2>{esc(section.get("title", ""))}</h2>'
            f"{summary_html}{layout_html}{note_html}</div></section>"
        )
        number += 1

    return "".join(html_parts), "".join(nav_parts), number


def render_assets(project: dict, output_path: Path, number: int) -> tuple[str, bool]:
    published = [asset for asset in project.get("assets", []) if asset.get("publish")]
    if not published:
        return "", False

    cards: list[str] = []
    for asset in published:
        asset_type = asset.get("type", "other")
        path = asset_href(output_path, asset.get("path", ""))
        alt = esc(asset.get("alt", project.get("title", "Project asset")))
        caption = esc(asset.get("caption", ""))

        if asset_type == "image":
            cards.append(
                '<figure class="project-asset-card">'
                f'<img src="{esc(path)}" alt="{alt}">'
                + (f'<figcaption class="project-asset-caption">{caption}</figcaption>' if caption else "")
                + "</figure>"
            )
        elif asset_type == "video":
            cards.append(
                '<figure class="project-asset-card">'
                f'<video controls preload="metadata"><source src="{esc(path)}">'
                "Your browser does not support this video.</video>"
                + (f'<figcaption class="project-asset-caption">{caption}</figcaption>' if caption else "")
                + "</figure>"
            )
        else:
            label = caption or f"Open {asset_type.replace('-', ' ').title()}"
            cards.append(
                '<div class="project-asset-card">'
                f'<a class="project-asset-link" href="{esc(path)}" target="_blank" rel="noopener noreferrer">'
                f'<strong>{label}</strong><span>Open asset →</span></a></div>'
            )

    section = (
        '<section class="section section-soft flagship-section scaffold-section project-assets" id="evidence">'
        '<div class="container scaffold-copy">'
        f'<div class="scaffold-kicker"><span class="project-detail-number" aria-hidden="true">{number:02d}</span>'
        '<p class="eyebrow">Evidence</p></div>'
        '<h2>Explore the work.</h2>'
        '<p>Public-safe artifacts and project outputs from this case study.</p>'
        f'<div class="project-asset-grid">{"".join(cards)}</div>'
        '</div></section>'
    )
    return section, True


def render_primary_action(project: dict, output_path: Path) -> str:
    live_project = project.get("links", {}).get("live_project")
    if not live_project:
        return ""

    href = asset_href(output_path, live_project)
    css_class = "btn btn-primary"
    label = "View Live Project"
    return (
        f'<a class="{css_class}" href="{esc(href)}" target="_blank" '
        f'rel="noopener noreferrer">{label}</a>'
    )


def render_confidentiality_note(project: dict) -> str:
    confidentiality = project.get("confidentiality")
    if confidentiality == "needs-sanitization":
        raise ValueError(
            f"Project '{project.get('id')}' still needs sanitization and cannot be previewed as a public scaffold."
        )
    if confidentiality != "sanitized":
        return ""

    return (
        '<section class="project-template-note"><div class="feature-callout">'
        '<p class="eyebrow">Portfolio Note</p>'
        '<h2>Public-safe project example.</h2>'
        '<p>This example uses sanitized, fictionalized, or generalized content to demonstrate the '
        'design approach without exposing proprietary information.</p>'
        '</div></section>'
    )


def render_project_text(project_path: Path) -> tuple[str, Path]:
    project_path = project_path.resolve()
    project = load_json(project_path)
    taxonomy = load_json(TAXONOMY_PATH)
    category, subcategory = find_taxonomy_item(taxonomy, project)

    final_output = (ROOT / project["page_path"]).resolve()

    try:
        final_output.relative_to(ROOT)
    except ValueError as exc:
        raise ValueError("Output path must remain inside the repository.") from exc

    content = project.get("content", {})
    back_item = subcategory if subcategory and subcategory.get("path") else category
    back_path = back_item.get("path", "portfolio/projects/index.html")
    back_label = f"Back to {back_item['label']}"
    project_type = subcategory["label"] if subcategory else category["label"]

    tools = project.get("tools", [])
    skills = project.get("skills", [])
    tool_summary = ", ".join(unique_values(tools, limit=4)) or "Tool-agnostic workflow"
    icon_id = CATEGORY_ICONS.get(project.get("category"), "icon-learning-design")
    icon_sprite = relative_href(final_output, "portfolio/assets/icons/portfolio-icons.svg")

    next_number = 4
    detail_sections, detail_nav, next_number = render_detail_sections(project, next_number)
    assets_section, has_assets = render_assets(project, final_output, next_number)

    tokens = {
        "META_DESCRIPTION": esc(project["summary"]),
        "PAGE_TITLE": esc(f"{project['title']} | Haley Reeder"),
        "FAVICON_PATH": esc(relative_href(final_output, "portfolio/assets/site/favicon.svg")),
        "CSS_PATH": esc(relative_href(final_output, "portfolio/css/styles.css")),
        "REFRESH_CSS_PATH": esc(relative_href(final_output, "portfolio/css/portfolio-refresh.css")),
        "THEME_CSS_PATH": esc(relative_href(final_output, "portfolio/css/phase1-theme.css")),
        "FRAME_CSS_PATH": esc(relative_href(final_output, "portfolio/css/phase1-frame.css")),
        "MOTION_JS_PATH": esc(relative_href(final_output, "portfolio/js/portfolio-motion.js")),
        "HOME_PATH": esc(relative_href(final_output, "portfolio/index.html")),
        "ABOUT_PATH": esc(relative_href(final_output, "portfolio/about/index.html")),
        "PROJECTS_PATH": esc(relative_href(final_output, "portfolio/projects/index.html")),
        "CONTACT_PATH": esc(relative_href(final_output, "portfolio/contact/index.html")),
        "RESUME_PATH": esc(relative_href(final_output, "portfolio/assets/documents/Haley-Reeder-Resume.pdf")),
        "BREADCRUMBS": render_breadcrumbs(final_output, project, category, subcategory),
        "CATEGORY_LABEL": esc(category["label"]),
        "CATEGORY_ICON_HREF": esc(f"{icon_sprite}#{icon_id}"),
        "TITLE": esc(project["title"]),
        "SUMMARY": esc(project["summary"]),
        "TAGS": render_tags(project),
        "PRIMARY_ACTION": render_primary_action(project, final_output),
        "BACK_PATH": esc(relative_href(final_output, back_path)),
        "BACK_LABEL": esc(back_label),
        "ROLE": esc(content.get("role", "")),
        "AUDIENCE": esc(content.get("audience", "")),
        "PROJECT_TYPE": esc(project_type),
        "TOOL_SUMMARY": esc(tool_summary),
        "BUSINESS_NEED": esc(content.get("business_need", "")),
        "LEARNING_OBJECTIVES": render_list(content.get("learning_objectives", [])),
        "DESIGN_APPROACH": esc(content.get("design_approach", "")),
        "DEVELOPMENT_PROCESS": esc(content.get("development_process", "")),
        "SKILL_TAGS": render_tag_spans(skills, fallback="Project-specific skills"),
        "TOOL_TAGS": render_tag_spans(tools, fallback="Tool-agnostic workflow"),
        "DETAIL_NAV": detail_nav,
        "DETAIL_SECTIONS": detail_sections,
        "ASSETS_SECTION": assets_section,
        "EVIDENCE_NAV": '<a href="#evidence">Evidence</a>' if has_assets else "",
        "OUTCOMES": render_list(content.get("outcomes", [])),
        "CONFIDENTIALITY_NOTE": render_confidentiality_note(project),
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
        description="Preview the locked new-page reference scaffold for a structured project. This command never writes public portfolio files."
    )
    parser.add_argument("project", help="Project JSON path, for example portfolio-data/projects/example.json")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    project_path = as_repo_path(args.project)

    try:
        rendered, final_output = render_project_text(project_path)
    except (ValueError, KeyError) as exc:
        print(f"ERROR: {exc}")
        return 1

    print(rendered)
    print(
        f"\n<!-- Preview only. Target path: {final_output.relative_to(ROOT)}. "
        "Build the real page intentionally from the current live portfolio pattern. -->"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
