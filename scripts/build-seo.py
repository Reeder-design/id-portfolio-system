from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = ROOT / "portfolio"
BASE_URL = "https://reeder-design.github.io/id-portfolio-system/"
SITE_NAME = "Haley Reeder | Instructional Design Portfolio"
PERSON_ID = BASE_URL + "#haley-reeder"
WEBSITE_ID = BASE_URL + "#website"
SEO_START = "<!-- SEO:AUTO START -->"
SEO_END = "<!-- SEO:AUTO END -->"
EXPERTISE_LINK_MARKER = "<!-- SEO:EXPERTISE LINK -->"
HIRING_NAV_MARKER = "<!-- SEO:HIRING GUIDE NAV -->"

KNOWS_ABOUT = [
    "Instructional Design",
    "Learning Experience Design",
    "Sales Enablement",
    "Partner Enablement",
    "Technical Product Training",
    "eLearning Development",
    "Curriculum Mapping",
    "Assessment Design",
    "Microlearning",
    "Performance Support",
    "LMS Administration",
    "Learning Operations",
    "Accessibility",
    "WCAG 2.2",
    "Section 508",
    "xAPI",
    "cmi5",
    "SCORM",
    "AI Evaluation",
    "Workflow Automation",
    "Enterprise 5G",
    "Private 5G",
    "Neutral Host Networks",
    "Wireless WAN",
]


def text_content(raw: str) -> str:
    without_tags = re.sub(r"<[^>]+>", " ", raw)
    return re.sub(r"\s+", " ", html.unescape(without_tags)).strip()


def extract_required(pattern: str, text: str, label: str, path: Path) -> str:
    match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        raise ValueError(f"{path.relative_to(ROOT)}: missing {label}")
    value = text_content(match.group(1))
    if not value:
        raise ValueError(f"{path.relative_to(ROOT)}: empty {label}")
    return value


def canonical_url(path: Path) -> str:
    rel = path.relative_to(SITE_ROOT).as_posix()
    if rel == "index.html":
        return BASE_URL
    if rel.endswith("/index.html"):
        return BASE_URL + rel[: -len("index.html")]
    return BASE_URL + rel


def build_schema(path: Path, title: str, description: str, h1: str, canonical: str) -> dict:
    rel = path.relative_to(SITE_ROOT).as_posix()
    page_type = "ProfilePage" if rel in {"about/index.html", "expertise/index.html"} else "WebPage"

    person = {
        "@type": "Person",
        "@id": PERSON_ID,
        "name": "Haley Reeder",
        "url": BASE_URL,
        "jobTitle": "Instructional Designer",
        "sameAs": [
            "https://github.com/reeder-design",
            "https://www.linkedin.com/in/haley-reeder",
        ],
    }
    if rel in {"index.html", "about/index.html", "expertise/index.html", "hiring-manager/index.html"}:
        person["knowsAbout"] = KNOWS_ABOUT

    website = {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        "url": BASE_URL,
        "name": SITE_NAME,
        "description": "Portfolio of instructional designer Haley Reeder across learning design, sales enablement, LMS operations, AI evaluation, multimedia, accessibility, reporting, and workflow automation.",
        "inLanguage": "en-US",
        "author": {"@id": PERSON_ID},
    }

    page = {
        "@type": page_type,
        "@id": canonical + "#webpage",
        "url": canonical,
        "name": title,
        "headline": h1,
        "description": description,
        "inLanguage": "en-US",
        "isPartOf": {"@id": WEBSITE_ID},
        "about": {"@id": PERSON_ID},
        "author": {"@id": PERSON_ID},
    }
    if page_type == "ProfilePage":
        page["mainEntity"] = {"@id": PERSON_ID}

    return {
        "@context": "https://schema.org",
        "@graph": [website, person, page],
    }


def build_seo_block(path: Path, text: str) -> str:
    title = extract_required(r"<title>(.*?)</title>", text, "title", path)
    description = extract_required(
        r'<meta\s+[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']',
        text,
        "meta description",
        path,
    )
    h1 = extract_required(r"<h1\b[^>]*>(.*?)</h1>", text, "h1", path)
    canonical = canonical_url(path)
    schema = build_schema(path, title, description, h1, canonical)

    title_attr = html.escape(title, quote=True)
    description_attr = html.escape(description, quote=True)
    canonical_attr = html.escape(canonical, quote=True)

    return "\n".join(
        [
            SEO_START,
            '  <meta name="author" content="Haley Reeder">',
            '  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">',
            f'  <link rel="canonical" href="{canonical_attr}">',
            '  <meta property="og:type" content="website">',
            f'  <meta property="og:title" content="{title_attr}">',
            f'  <meta property="og:description" content="{description_attr}">',
            f'  <meta property="og:url" content="{canonical_attr}">',
            f'  <meta property="og:site_name" content="{html.escape(SITE_NAME, quote=True)}">',
            '  <meta name="twitter:card" content="summary">',
            f'  <meta name="twitter:title" content="{title_attr}">',
            f'  <meta name="twitter:description" content="{description_attr}">',
            '  <script type="application/ld+json">',
            json.dumps(schema, ensure_ascii=False, indent=2),
            "  </script>",
            SEO_END,
        ]
    )


def strip_existing_block(text: str) -> str:
    pattern = re.compile(
        r"(?:\r?\n)?" + re.escape(SEO_START) + r".*?" + re.escape(SEO_END),
        flags=re.DOTALL,
    )
    return pattern.sub("", text)


def add_expertise_footer_link(path: Path, text: str) -> str:
    clean = re.sub(
        re.escape(EXPERTISE_LINK_MARKER) + r'<a\s+href=["\'][^"\']+["\']>Expertise</a>',
        "",
        text,
        flags=re.IGNORECASE,
    )
    if path.relative_to(SITE_ROOT).as_posix() == "expertise/index.html":
        return clean

    target = SITE_ROOT / "expertise" / "index.html"
    href = Path(os.path.relpath(target, path.parent)).as_posix()
    link = f'{EXPERTISE_LINK_MARKER}<a href="{href}">Expertise</a>'
    resume_pattern = re.compile(
        r'(<a\b[^>]*href=["\'][^"\']*Haley-Reeder-Resume\.pdf[^"\']*["\'][^>]*>(?:Résumé|Resume)</a>)',
        flags=re.IGNORECASE,
    )
    match = resume_pattern.search(clean)
    if not match:
        return clean
    return clean[: match.end()] + link + clean[match.end():]


def add_hiring_nav_link(path: Path, text: str) -> str:
    clean = re.sub(
        re.escape(HIRING_NAV_MARKER) + r'<a\b[^>]*class=["\'][^"\']*site-nav-hiring[^"\']*["\'][^>]*>.*?</a>',
        "",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )

    nav_match = re.search(
        r'(<nav\b[^>]*class=["\'][^"\']*site-nav[^"\']*["\'][^>]*>)(.*?)(</nav>)',
        clean,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not nav_match:
        return clean

    target = SITE_ROOT / "hiring-manager" / "index.html"
    href = Path(os.path.relpath(target, path.parent)).as_posix()
    rel = path.relative_to(SITE_ROOT).as_posix()
    active = " active" if rel == "hiring-manager/index.html" else ""
    link = (
        f'{HIRING_NAV_MARKER}<a class="site-nav-hiring{active}" href="{href}" '
        'aria-label="Hiring Manager Guide">Hiring Guide</a>'
    )

    body = nav_match.group(2)
    if re.search(r'<a\b[^>]*class=["\'][^"\']*\bsite-nav-hiring\b', body, flags=re.IGNORECASE):
        return clean
    return clean[: nav_match.start(2)] + body.rstrip() + "\n        " + link + "\n      " + clean[nav_match.end(2):]


def rendered_html(path: Path) -> str:
    source = path.read_text(encoding="utf-8")
    clean = strip_existing_block(source)
    clean = add_expertise_footer_link(path, clean)
    clean = add_hiring_nav_link(path, clean)
    block = build_seo_block(path, clean)
    match = re.search(r"</title>", clean, flags=re.IGNORECASE)
    if not match:
        raise ValueError(f"{path.relative_to(ROOT)}: cannot inject SEO block without </title>")
    return clean[: match.end()] + "\n" + block + clean[match.end():]


def sitemap_text(html_files: list[Path]) -> str:
    urls = [canonical_url(path) for path in html_files]
    rows = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        rows.append("  <url>")
        rows.append(f"    <loc>{xml_escape(url)}</loc>")
        rows.append("  </url>")
    rows.append("</urlset>")
    return "\n".join(rows) + "\n"


def robots_text() -> str:
    return "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "",
            f"Sitemap: {BASE_URL}sitemap.xml",
            "",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Build static SEO metadata for the deployed portfolio.")
    parser.add_argument("--check", action="store_true", help="Check that the current working tree already matches generated SEO output.")
    args = parser.parse_args()

    html_files = sorted(SITE_ROOT.rglob("*.html"))
    if not html_files:
        print("ERROR: no public HTML files found")
        return 1

    mismatches: list[str] = []
    try:
        for path in html_files:
            expected = rendered_html(path)
            current = path.read_text(encoding="utf-8")
            if args.check:
                if current != expected:
                    mismatches.append(str(path.relative_to(ROOT)))
            else:
                path.write_text(expected, encoding="utf-8")

        sitemap_path = SITE_ROOT / "sitemap.xml"
        robots_path = SITE_ROOT / "robots.txt"
        expected_sitemap = sitemap_text(html_files)
        expected_robots = robots_text()

        if args.check:
            if not sitemap_path.exists() or sitemap_path.read_text(encoding="utf-8") != expected_sitemap:
                mismatches.append(str(sitemap_path.relative_to(ROOT)))
            if not robots_path.exists() or robots_path.read_text(encoding="utf-8") != expected_robots:
                mismatches.append(str(robots_path.relative_to(ROOT)))
        else:
            sitemap_path.write_text(expected_sitemap, encoding="utf-8")
            robots_path.write_text(expected_robots, encoding="utf-8")
    except ValueError as exc:
        print(f"ERROR: {exc}")
        return 1

    if mismatches:
        print("SEO output is stale:")
        for mismatch in mismatches:
            print(f"  - {mismatch}")
        return 1

    action = "Validated" if args.check else "Built"
    print(f"{action} SEO metadata for {len(html_files)} public HTML page(s).")
    print(f"Canonical origin: {BASE_URL}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
