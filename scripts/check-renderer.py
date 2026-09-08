from __future__ import annotations

import json
import os
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = ROOT / "portfolio-data" / "projects"
RENDERER = ROOT / "scripts" / "render-project.py"
SKIP_SCHEMES = ("http://", "https://", "mailto:", "tel:", "javascript:", "data:")


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


def resolve_reference(output_path: Path, value: str) -> Path | None:
    if not value or value.startswith("#") or value.startswith(SKIP_SCHEMES):
        return None

    parsed = urlsplit(value)
    if not parsed.path:
        return None

    candidate = (output_path.parent / parsed.path).resolve()
    if candidate.is_dir():
        candidate = candidate / "index.html"
    return candidate


def main() -> int:
    errors: list[str] = []
    project_files = sorted(PROJECT_ROOT.glob("*.json"))

    if not project_files:
        print("ERROR: No structured projects found to render.")
        return 1

    for project_file in project_files:
        project = json.loads(project_file.read_text(encoding="utf-8"))
        intended_output = (ROOT / project["page_path"]).resolve()

        result = subprocess.run(
            [sys.executable, str(RENDERER), str(project_file), "--stdout"],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

        label = project_file.relative_to(ROOT)
        if result.returncode != 0:
            errors.append(f"{label}: renderer failed: {result.stdout.strip() or result.stderr.strip()}")
            continue

        rendered = result.stdout
        if not rendered.lstrip().lower().startswith("<!doctype html>"):
            errors.append(f"{label}: rendered output is missing a valid DOCTYPE")

        if project["title"] not in rendered:
            errors.append(f"{label}: rendered output is missing project title")

        if "{{" in rendered or "}}" in rendered:
            errors.append(f"{label}: unresolved template token detected")

        parser = ReferenceParser()
        try:
            parser.feed(rendered)
        except Exception as exc:
            errors.append(f"{label}: rendered HTML parser error: {exc}")
            continue

        for attribute, value in parser.references:
            candidate = resolve_reference(intended_output, value)
            if candidate is None:
                continue

            try:
                candidate.relative_to(ROOT)
            except ValueError:
                errors.append(
                    f"{label}: generated {attribute}='{value}' resolves outside repository"
                )
                continue

            if not candidate.exists():
                errors.append(
                    f"{label}: generated broken {attribute}='{value}' -> "
                    f"{candidate.relative_to(ROOT)}"
                )

    print(f"Rendered and checked {len(project_files)} structured project record(s).")

    if errors:
        print("\nErrors:")
        for error in errors:
            print(f"  - {error}")
        print(f"\nRenderer validation failed with {len(errors)} error(s).")
        return 1

    print("\nRenderer validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
