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
PROJECT_ROOT = DATA_ROOT / "projects"
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

CATEGORY_PIXEL_ASSETS = {
    "instructional-design": "portfolio/assets/icons/pixel/portfolio-general/learning.webp",
    "ai-training-and-evaluation": "portfolio/assets/icons/pixel/ai-training-evaluation/training-hero.webp",
    "workflows": "portfolio/assets/icons/pixel/hiring-guide/workflow-tree.webp",
    "lms-administration": "portfolio/assets/icons/pixel/lms/goal-mountain.webp",
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
            f'<section class="project-story-section project-detail-section" id="{esc(section_id)}">'
            f'<div class="project-story-heading"><span class="project-story-number">{number:02d}</span>'
            f'<div><p class="eyebrow">{esc(section.get("eyebrow", "Project Detail"))}</p>'
            f'<h2>{esc(section.get("title", ""))}</h2></div></div>'
            f"{summary_html}{layout_html}{note_html}</section>"
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
        '<section class="project-story-section project-assets" id="evidence">'
        f'<div class="project-story-heading"><span class="project-story-number">{number:02d}</span>'
        '<div><p class="eyebrow">Evidence</p><h2>Explore the work</h2></div></div>'
        '<p>Public-safe artifacts and project outputs from this case study.</p>'
        f'<div class="project-asset-grid">{"".join(cards)}</div>'
        '</section>'
    )
    return section, True


def render_related_work(project: dict, output_path: Path, taxonomy: dict, number: int) -> tuple[str, str]:
    references = project.get("related_work", [])
    if not references:
        return "", ""

    cards: list[str] = []
    for reference in references:
        project_id = reference.get("project_id", "").strip()
        if not project_id or project_id == project.get("id"):
            continue

        target_path = PROJECT_ROOT / f"{project_id}.json"
        if not target_path.exists():
            raise ValueError(
                f"Project '{project.get('id')}' references missing related project '{project_id}'."
            )

        target = load_json(target_path)
        target_category, _ = find_taxonomy_item(taxonomy, target)
        href = relative_href(output_path, target["page_path"])
        relationship = reference.get("relationship", "").strip()
        pixel_asset = CATEGORY_PIXEL_ASSETS.get(
            target.get("category"),
            "portfolio/assets/icons/pixel/portfolio-general/portfolio.webp",
        )
        pixel_href = relative_href(output_path, pixel_asset)

        cards.append(
            '<a class="refresh-link-card portfolio-explore-card" href="' + esc(href) + '">'
            '<div class="refresh-link-card-header">'
            f'<img class="portfolio-explore-pixel" src="{esc(pixel_href)}" alt="" aria-hidden="true" loading="lazy">'
            f'<span class="portfolio-explore-category">{esc(target_category["label"])}</span>'
            f'<h3>{esc(target["title"])}</h3>'
            '</div>'
            '<div class="refresh-link-card-body">'
            + (f'<p><strong>{esc(relationship)}</strong></p>' if relationship else "")
            + f'<p>{esc(target["summary"])}</p>'
            '<span class="project-family-link">Explore related work →</span>'
            '</div>'
            '</a>'
        )

    if not cards:
        return "", ""

    section = (
        '<section class="project-story-section related-work-section" id="related-work">'
        f'<div class="project-story-heading"><span class="project-story-number">{number:02d}</span>'
        '<div><p class="eyebrow">Related Work</p><h2>See how this work connects across the portfolio.</h2></div></div>'
        '<p>These projects show adjacent parts of the same learning ecosystem without duplicating the full story here.</p>'
        f'<div class="portfolio-explore-grid">{"".join(cards)}</div>'
        '</section>'
    )
    return section, '<a href="#related-work">Related Work</a>'



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


def render_confidentiality_note(project: dict, output_path: Path) -> str:
    confidentiality = project.get("confidentiality")
    if confidentiality == "needs-sanitization":
        raise ValueError(
            f"Project '{project.get('id')}' still needs sanitization and cannot be rendered for publishing."
        )
    if confidentiality != "sanitized":
        return ""

    pixel_href = relative_href(
        output_path,
        "portfolio/assets/icons/pixel/portfolio-general/case-studies.webp",
    )
    return (
        '<section class="project-template-note">'
        '<div class="portfolio-safety-note is-scope-note">'
        f'<img class="portfolio-safety-pixel" src="{esc(pixel_href)}" alt="" aria-hidden="true">'
        '<p><strong>Portfolio-safe reconstruction.</strong> '
        'The work and responsibilities are real. Customer details, solution language, learner data, '
        'internal identifiers, and proprietary implementation details are sanitized or omitted where needed.</p>'
        '</div>'
        '</section>'
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
    skills = project.get("skills", [])
    tool_summary = ", ".join(unique_values(tools, limit=4)) or "Tool-agnostic workflow"
    icon_id = CATEGORY_ICONS.get(project.get("category"), "icon-learning-design")
    icon_sprite = relative_href(final_output, "portfolio/assets/icons/portfolio-icons.svg")

    next_number = 4
    detail_sections, detail_nav, next_number = render_detail_sections(project, next_number)
    assets_section, has_assets = render_assets(project, final_output, next_number)
    if has_assets:
        next_number += 1
    outcome_number = next_number
    next_number += 1
    related_work_section, related_work_nav = render_related_work(
        project,
        final_output,
        taxonomy,
        next_number,
    )

    tokens = {
        "META_DESCRIPTION": esc(project["summary"]),
        "PAGE_TITLE": esc(f"{project['title']} | Haley Reeder"),
        "FAVICON_PATH": esc(relative_href(final_output, "portfolio/assets/site/favicon.svg")),
        "CSS_PATH": esc(relative_href(final_output, "portfolio/css/styles.css")),
        "REFRESH_CSS_PATH": esc(relative_href(final_output, "portfolio/css/portfolio-refresh.css")),
        "THEME_CSS_PATH": esc(relative_href(final_output, "portfolio/css/phase1-theme.css")),
        "FRAME_CSS_PATH": esc(relative_href(final_output, "portfolio/css/phase1-frame.css")),
        "FINAL_STRETCH_CSS_PATH": esc(relative_href(final_output, "portfolio/css/final-stretch-system.css")),
        "MOTION_JS_PATH": esc(relative_href(final_output, "portfolio/js/portfolio-motion.js")),
        "HOME_PATH": esc(relative_href(final_output, "portfolio/index.html")),
        "ABOUT_PATH": esc(relative_href(final_output, "portfolio/about/index.html")),
        "PROJECTS_PATH": esc(relative_href(final_output, "portfolio/projects/index.html")),
        "CONTACT_PATH": esc(relative_href(final_output, "portfolio/contact/index.html")),
        "HIRING_GUIDE_PATH": esc(relative_href(final_output, "portfolio/hiring-manager/index.html")),
        "EXPERTISE_PATH": esc(relative_href(final_output, "portfolio/expertise/index.html")),
        "RESUME_PATH": esc(relative_href(final_output, "portfolio/assets/documents/Haley-Reeder-Resume.pdf")),
        "LEARNING_PIXEL_PATH": esc(relative_href(final_output, "portfolio/assets/icons/pixel/portfolio-general/learning.webp")),
        "CASE_STUDIES_PIXEL_PATH": esc(relative_href(final_output, "portfolio/assets/icons/pixel/portfolio-general/case-studies.webp")),
        "PORTFOLIO_PIXEL_PATH": esc(relative_href(final_output, "portfolio/assets/icons/pixel/portfolio-general/portfolio.webp")),
        "BREADCRUMBS": render_breadcrumbs(final_output, project, category, subcategory),
        "CATEGORY_LABEL": esc(category["label"]),
        "CATEGORY_ICON_HREF": esc(f"{icon_sprite}#{icon_id}"),
        "TITLE": esc(project["title"]),
        "SUMMARY": esc(project["summary"]),
        "TAGS": render_tags(project),
        "PRIMARY_ACTION": render_primary_action(project, final_output),
        "PRIMARY_ACTION_CTA": render_primary_action(project, final_output, cta=True),
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
        "OUTCOME_NUMBER": f"{outcome_number:02d}",
        "OUTCOMES": render_list(content.get("outcomes", [])),
        "RELATED_WORK_SECTION": related_work_section,
        "RELATED_WORK_NAV": related_work_nav,
        "CONFIDENTIALITY_NOTE": render_confidentiality_note(project, final_output),
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
