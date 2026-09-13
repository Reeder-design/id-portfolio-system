from __future__ import annotations

import html
import re

TITLE_SUFFIX_SEPARATOR = " | "
FICTIONAL_FOOTER_SUFFIX = " • Fictional portfolio exercise"


def _single_plain_element(html_text: str, tag: str) -> tuple[re.Match[str], str]:
    pattern = re.compile(rf"(<{tag}\\b[^>]*>)(.*?)(</{tag}>)", flags=re.I | re.S)
    matches = list(pattern.finditer(html_text))
    if len(matches) != 1:
        raise ValueError(f"Custom title sync expected exactly one <{tag}> element; found {len(matches)}.")
    match = matches[0]
    inner = match.group(2)
    if "<" in inner or ">" in inner:
        raise ValueError(f"Custom title sync will not rewrite a <{tag}> element that contains nested markup.")
    return match, html.unescape(inner).strip()


def _replace_element_inner(html_text: str, tag: str, replacement: str) -> str:
    pattern = re.compile(rf"(<{tag}\\b[^>]*>)(.*?)(</{tag}>)", flags=re.I | re.S)
    matches = list(pattern.finditer(html_text))
    if len(matches) != 1:
        raise ValueError(f"Custom title sync expected exactly one <{tag}> element; found {len(matches)}.")
    match = matches[0]
    inner = match.group(2)
    leading = inner[: len(inner) - len(inner.lstrip())]
    trailing = inner[len(inner.rstrip()) :]
    new_element = f"{match.group(1)}{leading}{replacement}{trailing}{match.group(3)}"
    return html_text[: match.start()] + new_element + html_text[match.end() :]


def sync_custom_page_title(html_text: str, new_title: str) -> str:
    _, browser_title = _single_plain_element(html_text, "title")
    _, visible_title = _single_plain_element(html_text, "h1")
    browser_base = browser_title
    browser_suffix = ""
    if TITLE_SUFFIX_SEPARATOR in browser_title:
        browser_base, suffix = browser_title.split(TITLE_SUFFIX_SEPARATOR, 1)
        browser_base = browser_base.strip()
        browser_suffix = TITLE_SUFFIX_SEPARATOR + suffix.strip()
    if browser_base.strip() != visible_title.strip():
        raise ValueError("Custom title sync stopped because the browser title and primary heading do not match.")
    clean_title = new_title.strip()
    if not clean_title:
        raise ValueError("Project title cannot be blank.")
    if browser_base.strip() == clean_title:
        return html_text
    escaped_new = html.escape(clean_title, quote=False)
    escaped_old = html.escape(browser_base.strip(), quote=False)
    updated = _replace_element_inner(html_text, "title", escaped_new + html.escape(browser_suffix, quote=False))
    updated = _replace_element_inner(updated, "h1", escaped_new)
    footer_pattern = re.compile(r"(<footer\\b[^>]*>.*?</footer>)", flags=re.I | re.S)
    footer_matches = list(footer_pattern.finditer(updated))
    if len(footer_matches) == 1:
        footer_match = footer_matches[0]
        footer_html = footer_match.group(1)
        old_label = escaped_old + FICTIONAL_FOOTER_SUFFIX
        if footer_html.count(old_label) == 1:
            footer_html = footer_html.replace(old_label, escaped_new + FICTIONAL_FOOTER_SUFFIX, 1)
            updated = updated[: footer_match.start()] + footer_html + updated[footer_match.end() :]
    return updated
