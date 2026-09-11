from __future__ import annotations

from copy import deepcopy
from html import escape, unescape
import json
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "portfolio-data" / "site-content.json"
PORTFOLIO_ROOT = ROOT / "portfolio"


def section_field(section: str, element_pattern: str) -> str:
    """Build a locator anchored to a named HTML section comment."""
    return (
        rf"(?P<prefix><!--[^>]*{re.escape(section)}[^>]*-->.*?{element_pattern})"
        rf"(?P<content>.*?)"
        rf"(?P<suffix>\s*</(?:h1|h2|p|span)>)"
    )


def class_element(tag: str, class_name: str) -> str:
    """Match an element that contains an approved class token plus optional presentation classes."""
    return rf"<{tag} class=\"[^\"]*\b{re.escape(class_name)}\b[^\"]*\">"


LOCATORS: dict[str, dict[str, str]] = {
    "home": {
        "hero_title_lead": (
            rf"(?P<prefix><!--[^>]*HERO[^>]*-->.*?{class_element('section', 'hero')}.*?<h1>\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*<span class=\"hero-accent\">)"
        ),
        "hero_title_accent": (
            rf"(?P<prefix><!--[^>]*HERO[^>]*-->.*?{class_element('section', 'hero')}.*?<span class=\"hero-accent\">\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*</span>)"
        ),
        "hero_copy": section_field(
            "HERO",
            rf".*?{class_element('p', 'hero-copy')}\s*",
        ),
        "featured_heading": section_field(
            "INTERACTIVE FEATURED WORK GALLERY",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>\s*",
        ),
        "featured_intro": section_field(
            "INTERACTIVE FEATURED WORK GALLERY",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>.*?</h2>.*?{class_element('p', 'body-large')}\s*",
        ),
    },
    "about": {
        "hero_title": section_field(
            "PROFESSIONAL INTRO",
            rf".*?{class_element('section', 'page-hero')}.*?<h1>\s*",
        ),
        "hero_intro_primary": section_field(
            "PROFESSIONAL INTRO",
            rf".*?{class_element('p', 'body-large')}\s*",
        ),
        "hero_intro_secondary": section_field(
            "PROFESSIONAL INTRO",
            rf".*?{class_element('p', 'body-large')}.*?</p>.*?<p>\s*",
        ),
        "approach_heading": section_field(
            "L&D APPROACH",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>\s*",
        ),
        "approach_intro": section_field(
            "L&D APPROACH",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>.*?</h2>.*?{class_element('p', 'body-large')}\s*",
        ),
        "thread_heading": section_field(
            "COMMON THREAD",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>\s*",
        ),
        "thread_intro": section_field(
            "COMMON THREAD",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>.*?</h2>.*?{class_element('p', 'body-large')}\s*",
        ),
    },
    "projects": {
        "hero_title": section_field(
            "PAGE HERO",
            rf".*?{class_element('div', 'projects-intro')}.*?<h1>\s*",
        ),
        "hero_intro": section_field(
            "PAGE HERO",
            rf".*?{class_element('div', 'projects-intro')}.*?{class_element('p', 'body-large')}\s*",
        ),
        "family_heading": section_field(
            "PROJECT FAMILIES",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>\s*",
        ),
        "family_intro": section_field(
            "PROJECT FAMILIES",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>.*?</h2>.*?{class_element('p', 'body-large')}\s*",
        ),
    },
    "instructional-design": {
        "hero_title": section_field(
            "HERO",
            rf".*?{class_element('div', 'parent-page-hero-content')}.*?<h1>\s*",
        ),
        "hero_intro": section_field(
            "HERO",
            rf".*?{class_element('div', 'parent-page-hero-content')}.*?{class_element('p', 'body-large')}\s*",
        ),
        "overview_heading": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>\s*",
        ),
        "overview_body_one": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>\s*",
        ),
        "overview_body_two": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>.*?</p>.*?<p>\s*",
        ),
        "examples_heading": section_field(
            "INSTRUCTIONAL DESIGN AREAS",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>\s*",
        ),
        "examples_intro": section_field(
            "INSTRUCTIONAL DESIGN AREAS",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>.*?</h2>.*?{class_element('p', 'body-large')}\s*",
        ),
    },
    "ai-training-and-evaluation": {
        "hero_title": section_field(
            "HERO",
            rf".*?{class_element('div', 'parent-page-hero-content')}.*?<h1>\s*",
        ),
        "hero_intro_primary": section_field(
            "HERO",
            rf".*?{class_element('div', 'parent-page-hero-content')}.*?{class_element('p', 'body-large')}\s*",
        ),
        "hero_intro_secondary": section_field(
            "HERO",
            rf".*?{class_element('div', 'parent-page-hero-content')}.*?{class_element('p', 'body-large')}.*?</p>.*?<p>\s*",
        ),
        "overview_heading": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>\s*",
        ),
        "overview_body_one": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>\s*",
        ),
        "overview_body_two": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>.*?</p>.*?<p>\s*",
        ),
        "overview_body_three": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>.*?</p>.*?<p>.*?</p>.*?<p>\s*",
        ),
    },
    "workflows": {
        "hero_title": section_field(
            "HERO",
            rf".*?{class_element('div', 'parent-page-hero-content')}.*?<h1>\s*",
        ),
        "hero_intro": section_field(
            "HERO",
            rf".*?{class_element('div', 'parent-page-hero-content')}.*?{class_element('p', 'body-large')}\s*",
        ),
        "overview_heading": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>\s*",
        ),
        "overview_body_one": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>\s*",
        ),
        "overview_body_two": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>.*?</p>.*?<p>\s*",
        ),
        "overview_body_three": section_field(
            "OVERVIEW",
            rf".*?{class_element('div', 'parent-overview-copy')}.*?<h2>.*?</h2>.*?<p>.*?</p>.*?<p>.*?</p>.*?<p>\s*",
        ),
        "areas_heading": section_field(
            "WORKFLOW AREAS",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>\s*",
        ),
        "areas_intro": section_field(
            "WORKFLOW AREAS",
            rf".*?{class_element('div', 'section-heading')}.*?<h2>.*?</h2>.*?{class_element('p', 'body-large')}\s*",
        ),
    },
    "contact": {
        "hero_title": (
            rf"(?P<prefix>{class_element('section', 'page-hero')}.*?<h1>\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*</h1>)"
        ),
        "hero_intro": (
            rf"(?P<prefix>{class_element('section', 'page-hero')}.*?{class_element('p', 'body-large')}\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*</p>)"
        ),
        "connect_heading": (
            rf"(?P<prefix>{class_element('div', 'contact-card')}.*?<h2>\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*</h2>)"
        ),
        "connect_intro": (
            rf"(?P<prefix>{class_element('div', 'contact-card')}.*?<h2>.*?</h2>.*?<p>\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*</p>)"
        ),
        "form_heading": (
            rf"(?P<prefix>{class_element('div', 'contact-form')}.*?<h2>\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*</h2>)"
        ),
        "form_intro": (
            rf"(?P<prefix>{class_element('div', 'contact-form')}.*?{class_element('p', 'text-muted')}\s*)"
            r"(?P<content>.*?)"
            r"(?P<suffix>\s*</p>)"
        ),
    },
}


def normalize_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", unescape(value)).strip()


def load_site_content() -> dict:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def validate_structure(data: dict) -> list[str]:
    errors: list[str] = []
    if data.get("schema_version") != "1.0.0":
        errors.append("site-content.json schema_version must be 1.0.0")

    pages = data.get("pages")
    if not isinstance(pages, dict) or not pages:
        return errors + ["site-content.json must contain pages"]

    if set(pages) != set(LOCATORS):
        errors.append("site-content.json page ids must match the approved general-page locator set")

    for page_id, page in pages.items():
        if page_id not in LOCATORS:
            continue
        path_value = str(page.get("page_path", ""))
        page_path = (ROOT / path_value).resolve()
        try:
            page_path.relative_to(PORTFOLIO_ROOT.resolve())
        except ValueError:
            errors.append(f"{page_id}: page_path must stay under portfolio/")
            continue
        if page_path.name != "index.html" or not page_path.exists():
            errors.append(f"{page_id}: page_path must point to an existing index.html")

        fields = page.get("fields")
        if not isinstance(fields, dict) or set(fields) != set(LOCATORS[page_id]):
            errors.append(f"{page_id}: fields must match the approved editable field set")
            continue

        for field_id, field in fields.items():
            if field.get("type") not in {"short", "long"}:
                errors.append(f"{page_id}.{field_id}: type must be short or long")
            if not isinstance(field.get("label"), str) or not field.get("label", "").strip():
                errors.append(f"{page_id}.{field_id}: label is required")
            if not isinstance(field.get("value"), str) or not field.get("value", "").strip():
                errors.append(f"{page_id}.{field_id}: value is required")

    return errors


def extract_page_fields(page_id: str, data: dict | None = None) -> dict[str, str]:
    data = data or load_site_content()
    page = data["pages"][page_id]
    page_path = ROOT / page["page_path"]
    html_text = page_path.read_text(encoding="utf-8")
    extracted: dict[str, str] = {}

    for field_id, pattern in LOCATORS[page_id].items():
        matches = list(re.finditer(pattern, html_text, flags=re.I | re.S))
        if len(matches) != 1:
            raise ValueError(
                f"{page_id}.{field_id}: expected exactly one safe locator match, found {len(matches)}"
            )
        extracted[field_id] = normalize_text(matches[0].group("content"))

    return extracted


def render_page_text(page_id: str, data: dict | None = None) -> tuple[Path, str]:
    data = data or load_site_content()
    page = data["pages"][page_id]
    page_path = ROOT / page["page_path"]
    html_text = page_path.read_text(encoding="utf-8")

    for field_id, pattern in LOCATORS[page_id].items():
        matches = list(re.finditer(pattern, html_text, flags=re.I | re.S))
        if len(matches) != 1:
            raise ValueError(
                f"{page_id}.{field_id}: page structure changed; expected one locator match, found {len(matches)}"
            )
        replacement_value = escape(page["fields"][field_id]["value"].strip(), quote=False)

        def replace(match: re.Match[str], value: str = replacement_value) -> str:
            return f"{match.group('prefix')}{value}{match.group('suffix')}"

        html_text, count = re.subn(pattern, replace, html_text, count=1, flags=re.I | re.S)
        if count != 1:
            raise ValueError(f"{page_id}.{field_id}: renderer did not replace exactly one field")

    return page_path, html_text


def render_page(page_id: str, data: dict | None = None) -> Path:
    page_path, html_text = render_page_text(page_id, data=data)
    page_path.write_text(html_text, encoding="utf-8")
    return page_path


def clone_data(data: dict) -> dict:
    return deepcopy(data)