from __future__ import annotations

import sys

from site_content_model import (
    LOCATORS,
    extract_page_fields,
    load_site_content,
    normalize_text,
    validate_structure,
)


def main() -> int:
    data = load_site_content()
    errors = validate_structure(data)

    if not errors:
        for page_id, page in data["pages"].items():
            try:
                extracted = extract_page_fields(page_id, data=data)
            except Exception as exc:
                errors.append(str(exc))
                continue

            for field_id in LOCATORS[page_id]:
                expected = normalize_text(page["fields"][field_id]["value"])
                actual = extracted[field_id]
                if actual != expected:
                    errors.append(
                        f"{page_id}.{field_id}: structured value and public HTML are out of sync"
                    )

    if errors:
        print("General site content validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    field_count = sum(len(fields) for fields in LOCATORS.values())
    print(
        f"General site content validation passed for {len(LOCATORS)} page(s) "
        f"and {field_count} editable field(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
