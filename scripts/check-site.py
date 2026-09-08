from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE_ROOT = ROOT / "portfolio"

SKIP_SCHEMES = ("http://", "https://", "mailto:", "tel:", "javascript:", "data:")
FORBIDDEN_PATH_PARTS = {"mutimedia"}


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
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


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    if not SITE_ROOT.exists():
        print("ERROR: portfolio/ directory does not exist.")
        return 1

    for forbidden_part in FORBIDDEN_PATH_PARTS:
        matches = [path for path in SITE_ROOT.rglob("*") if forbidden_part in path.parts]
        for match in matches:
            errors.append(
                f"{match.relative_to(ROOT)}: forbidden legacy path segment '{forbidden_part}'"
            )

    html_files = sorted(SITE_ROOT.rglob("*.html"))
    if not html_files:
        print("ERROR: No HTML files found under portfolio/.")
        return 1

    for html_file in html_files:
        relative = html_file.relative_to(ROOT)
        text = html_file.read_text(encoding="utf-8", errors="replace")

        if re.search(r"\\\s*<!DOCTYPE\s+html", text, flags=re.IGNORECASE):
            errors.append(f"{relative}: escaped DOCTYPE detected")

        if re.search(r"\\<\/?[A-Za-z]", text):
            errors.append(f"{relative}: escaped HTML tag detected")

        if re.search(r'href=["\']\[[^\]]+\]\([^\)]+\)["\']', text):
            errors.append(f"{relative}: Markdown-formatted URL found inside href")

        if 'target="\\_blank"' in text or "target='\\_blank'" in text:
            errors.append(f"{relative}: escaped target=_blank detected")

        if "mutimedia" in text:
            errors.append(f"{relative}: legacy 'mutimedia' reference detected")

        if not re.search(r"<title>.*?</title>", text, flags=re.IGNORECASE | re.DOTALL):
            warnings.append(f"{relative}: missing <title>")

        if not re.search(r'<meta\s+[^>]*name=["\']description["\']', text, flags=re.IGNORECASE):
            warnings.append(f"{relative}: missing meta description")

        parser = ReferenceParser()
        try:
            parser.feed(text)
        except Exception as exc:
            errors.append(f"{relative}: HTML parser error: {exc}")
            continue

        for attribute, raw_value in parser.references:
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

    print(f"Checked {len(html_files)} HTML file(s).")

    if warnings:
        print("\nWarnings:")
        for warning in warnings:
            print(f"  - {warning}")

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
