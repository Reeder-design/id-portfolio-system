from __future__ import annotations

import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = ROOT / "portfolio"

SKIP_SCHEMES = ("http://", "https://", "mailto:", "tel:", "javascript:", "data:")
FORBIDDEN_PATH_PARTS = {"mutimedia", "learning-pathways"}
FORBIDDEN_EXACT_PATHS = {
    SITE_ROOT / "projects" / "ai",
    SITE_ROOT / "projects" / "project-template",
}
FORBIDDEN_REFERENCE_PARTS = {"mutimedia", "learning-pathways", "ai"}
PUBLIC_PRIVATE_MARKERS = (".portfolio-manager", "file://", "localhost", "127.0.0.1")
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str]] = []
        self.ids: list[str] = []
        self.new_tab_links: list[tuple[str, str]] = []
        self.images_without_alt: list[str] = []
        self.main_count = 0
        self.h1_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)

        element_id = (attrs_dict.get("id") or "").strip()
        if element_id:
            self.ids.append(element_id)

        if tag == "main":
            self.main_count += 1
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "img" and "alt" not in attrs_dict:
            self.images_without_alt.append(attrs_dict.get("src") or "<unknown image>")

        if tag == "a" and (attrs_dict.get("target") or "").lower() == "_blank":
            self.new_tab_links.append((attrs_dict.get("href") or "", attrs_dict.get("rel") or ""))

        for attribute in ("href", "src"):
            value = attrs_dict.get(attribute)
            if value:
                self.references.append((attribute, value.strip()))


def resolve_local_reference(html_file: Path, raw_value: str) -> Path | None:
    if not raw_value or raw_value.startswith("#") or raw_value.startswith(SKIP_SCHEMES):
        return None

    parsed = urlsplit(raw_value)
    path_value = parsed.path
    if not path_value:
        return None

    if path_value.startswith("/"):
        candidate = SITE_ROOT / path_value.lstrip("/")
    else:
        candidate = html_file.parent / path_value

    candidate = candidate.resolve()

    if candidate.is_dir():
        candidate = candidate / "index.html"

    return candidate


def reference_uses_legacy_path(raw_value: str) -> str | None:
    if not raw_value or raw_value.startswith("#") or raw_value.startswith(SKIP_SCHEMES):
        return None

    path_value = urlsplit(raw_value).path
    parts = set(PurePosixPath(path_value).parts)
    matches = sorted(parts & FORBIDDEN_REFERENCE_PARTS)
    return matches[0] if matches else None


def main() -> int:
    errors: list[str] = []

    if not SITE_ROOT.exists():
        print("ERROR: portfolio/ directory does not exist.")
        return 1

    for forbidden_part in FORBIDDEN_PATH_PARTS:
        matches = [path for path in SITE_ROOT.rglob("*") if forbidden_part in path.parts]
        for match in matches:
            errors.append(
                f"{match.relative_to(ROOT)}: forbidden legacy path segment '{forbidden_part}'"
            )

    for forbidden_path in FORBIDDEN_EXACT_PATHS:
        if forbidden_path.exists():
            errors.append(
                f"{forbidden_path.relative_to(ROOT)}: forbidden public placeholder/legacy project path"
            )

    html_files = sorted(SITE_ROOT.rglob("*.html"))
    if not html_files:
        print("ERROR: No HTML files found under portfolio/.")
        return 1

    inbound_links: dict[Path, set[Path]] = defaultdict(set)
    redirect_pages: set[Path] = set()

    for html_file in html_files:
        relative = html_file.relative_to(ROOT)
        text = html_file.read_text(encoding="utf-8", errors="replace")

        if not text.lstrip().lower().startswith("<!doctype html"):
            errors.append(f"{relative}: missing HTML5 DOCTYPE")
        if not re.search(r"<html\b[^>]*\blang=[\"']en[\"']", text, flags=re.IGNORECASE):
            errors.append(f"{relative}: <html> must declare lang=\"en\"")

        if re.search(r"\\\s*<!DOCTYPE\s+html", text, flags=re.IGNORECASE):
            errors.append(f"{relative}: escaped DOCTYPE detected")
        if re.search(r"\\<\/?[A-Za-z]", text):
            errors.append(f"{relative}: escaped HTML tag detected")
        if re.search(r'href=["\']\[[^\]]+\]\([^\)]+\)["\']', text):
            errors.append(f"{relative}: Markdown-formatted URL found inside href")
        if 'target="\\_blank"' in text or "target='\\_blank'" in text:
            errors.append(f"{relative}: escaped target=_blank detected")

        title_match = re.search(r"<title>(.*?)</title>", text, flags=re.IGNORECASE | re.DOTALL)
        if not title_match or not re.sub(r"\s+", " ", title_match.group(1)).strip():
            errors.append(f"{relative}: missing or empty <title>")
        description_match = re.search(
            r'<meta\s+[^>]*name=["\']description["\'][^>]*content=["\']([^"\']+)["\']',
            text,
            flags=re.IGNORECASE | re.DOTALL,
        )
        if not description_match or not re.sub(r"\s+", " ", description_match.group(1)).strip():
            errors.append(f"{relative}: missing or empty meta description")
        if not re.search(
            r'<meta\s+[^>]*name=["\']viewport["\'][^>]*content=["\'][^"\']*width=device-width',
            text,
            flags=re.IGNORECASE | re.DOTALL,
        ):
            errors.append(f"{relative}: missing mobile viewport metadata")

        for marker in PUBLIC_PRIVATE_MARKERS:
            if marker in text:
                errors.append(f"{relative}: public HTML contains private/local-only marker {marker!r}")
        email_match = EMAIL_RE.search(text)
        if email_match:
            errors.append(f"{relative}: public HTML exposes an email address ({email_match.group(0)})")

        parser = ReferenceParser()
        try:
            parser.feed(text)
        except Exception as exc:
            errors.append(f"{relative}: HTML parser error: {exc}")
            continue

        # Retired routes can remain as accessible redirects for existing bookmarks.
        refresh_match = re.search(
            r'<meta\s+[^>]*http-equiv=["\']refresh["\'][^>]*content=["\']0;\s*url=([^"\']+)["\']',
            text,
            flags=re.IGNORECASE,
        )
        if refresh_match and re.search(r'<meta\s+[^>]*name=["\']robots["\'][^>]*content=["\']noindex["\']', text, re.IGNORECASE):
            target = resolve_local_reference(html_file, refresh_match.group(1))
            if target and target.is_relative_to(SITE_ROOT.resolve()) and target.exists() and target != html_file.resolve():
                redirect_pages.add(html_file.resolve())
            else:
                errors.append(f"{relative}: redirect target is missing or points to itself")

        if parser.main_count != 1:
            errors.append(f"{relative}: expected exactly one <main>, found {parser.main_count}")
        if parser.h1_count != 1:
            errors.append(f"{relative}: expected exactly one <h1>, found {parser.h1_count}")

        main_nav = re.search(
            r'<nav\b[^>]*class=["\'][^"\']*\bsite-nav\b[^"\']*["\'][^>]*>(.*?)</nav>',
            text,
            flags=re.IGNORECASE | re.DOTALL,
        )
        if main_nav:
            hiring_items = re.findall(
                r'<(?:a|span)\b[^>]*class=["\'][^"\']*\bsite-nav-hiring\b[^"\']*["\']',
                main_nav.group(1),
                flags=re.IGNORECASE,
            )
            if len(hiring_items) > 1:
                errors.append(f"{relative}: main navigation contains duplicate Hiring Guide items")

        duplicate_ids = sorted({value for value in parser.ids if parser.ids.count(value) > 1})
        for duplicate_id in duplicate_ids:
            errors.append(f"{relative}: duplicate id={duplicate_id!r}")
        for image_src in parser.images_without_alt:
            errors.append(f"{relative}: image is missing an alt attribute: {image_src}")
        for href, rel in parser.new_tab_links:
            rel_tokens = {token.lower() for token in rel.split()}
            if not {"noopener", "noreferrer"}.issubset(rel_tokens):
                errors.append(
                    f"{relative}: target=_blank link must include rel=\"noopener noreferrer\": {href or '<empty href>'}"
                )

        for attribute, raw_value in parser.references:
            legacy_part = reference_uses_legacy_path(raw_value)
            if legacy_part:
                errors.append(
                    f"{relative}: legacy path reference '{legacy_part}' in {attribute}='{raw_value}'"
                )

            if raw_value == "#":
                errors.append(f"{relative}: placeholder {attribute}='#' is not allowed in the deployed portfolio")

            parsed_value = urlsplit(raw_value)
            if raw_value.startswith("/") and not raw_value.startswith("//"):
                errors.append(
                    f"{relative}: root-relative {attribute}='{raw_value}' can break on the GitHub Pages project-site subpath; use a page-relative link"
                )

            candidate = resolve_local_reference(html_file, raw_value)
            if candidate is None:
                continue

            try:
                candidate.relative_to(SITE_ROOT.resolve())
            except ValueError:
                errors.append(
                    f"{relative}: {attribute}='{raw_value}' resolves outside portfolio/"
                )
                continue

            if not candidate.exists():
                errors.append(
                    f"{relative}: broken {attribute}='{raw_value}' -> "
                    f"{candidate.relative_to(ROOT) if candidate.is_relative_to(ROOT) else candidate}"
                )
                continue

            if attribute == "href" and candidate.suffix.lower() == ".html" and candidate != html_file.resolve():
                inbound_links[candidate].add(html_file.resolve())

    home = (SITE_ROOT / "index.html").resolve()
    for html_file in html_files:
        resolved = html_file.resolve()
        if resolved == home or resolved in redirect_pages:
            continue
        if not inbound_links.get(resolved):
            errors.append(
                f"{html_file.relative_to(ROOT)}: public HTML page is orphaned (no inbound link from another public page)"
            )

    print(f"Checked {len(html_files)} HTML file(s).")

    if errors:
        print("\nErrors:")
        for error in errors:
            print(f"  - {error}")
        print(f"\nSite validation failed with {len(errors)} error(s).")
        return 1

    print("\nSite validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
