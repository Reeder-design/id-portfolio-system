from __future__ import annotations

import argparse
import sys

from site_content_model import LOCATORS, load_site_content, render_page, validate_structure


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render approved general-page copy from portfolio-data/site-content.json."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--page", choices=sorted(LOCATORS), help="Render one managed page.")
    group.add_argument("--all", action="store_true", help="Render all managed general pages.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    data = load_site_content()
    errors = validate_structure(data)
    if errors:
        print("Cannot render invalid site-content.json:")
        for error in errors:
            print(f"  - {error}")
        return 1

    page_ids = sorted(LOCATORS) if args.all else [args.page]
    try:
        for page_id in page_ids:
            path = render_page(page_id, data=data)
            print(f"Rendered {page_id}: {path.relative_to(path.parents[1]) if len(path.parents) > 1 else path}")
    except Exception as exc:
        print(f"General page rendering failed: {exc}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
