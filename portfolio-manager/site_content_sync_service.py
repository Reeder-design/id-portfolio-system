from __future__ import annotations

from pathlib import Path
import json
import re
import sys


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
SITE_CONTENT_PATH = REPO_ROOT / "portfolio-data" / "site-content.json"
SCRIPTS_ROOT = REPO_ROOT / "scripts"
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

from site_content_model import LOCATORS, normalize_text  # noqa: E402


def sync_structured_page_after_html_change(page_id: str) -> dict:
    """Keep legacy structured page copy aligned after a reviewed HTML change.

    Existing managed fields are updated when their safe locator still exists.
    If an approved structural edit removes a managed element entirely, its
    legacy field is retired from site-content.json instead of leaving stale data.
    New fields are never invented automatically.
    """
    if not SITE_CONTENT_PATH.exists():
        return {"managed": False, "updated_fields": [], "retired_fields": []}

    data = json.loads(SITE_CONTENT_PATH.read_text(encoding="utf-8"))
    page = data.get("pages", {}).get(page_id)
    if page is None:
        return {"managed": False, "updated_fields": [], "retired_fields": []}

    locator_map = LOCATORS.get(page_id)
    if locator_map is None:
        raise ValueError(f"No approved structured-content locator set exists for {page_id}.")

    page_path = (REPO_ROOT / str(page.get("page_path", ""))).resolve()
    portfolio_root = (REPO_ROOT / "portfolio").resolve()
    try:
        page_path.relative_to(portfolio_root)
    except ValueError as exc:
        raise ValueError("Structured page path must stay under portfolio/.") from exc
    if not page_path.exists() or page_path.name != "index.html":
        raise FileNotFoundError(f"Managed structured page is missing: {page_path}")

    html_text = page_path.read_text(encoding="utf-8")
    fields = page.get("fields")
    if not isinstance(fields, dict):
        raise ValueError(f"Structured page fields are invalid for {page_id}.")

    updated_fields: list[str] = []
    retired_fields: list[str] = []

    for field_id in list(fields):
        pattern = locator_map.get(field_id)
        if pattern is None:
            raise ValueError(f"Structured field {page_id}.{field_id} has no approved locator.")

        matches = list(re.finditer(pattern, html_text, flags=re.I | re.S))
        if len(matches) > 1:
            raise ValueError(
                f"{page_id}.{field_id}: expected at most one safe locator match after the edit, found {len(matches)}"
            )
        if not matches:
            del fields[field_id]
            retired_fields.append(field_id)
            continue

        value = normalize_text(matches[0].group("content"))
        if not value:
            raise ValueError(f"{page_id}.{field_id}: the approved edit left a managed field blank.")
        if fields[field_id].get("value") != value:
            fields[field_id]["value"] = value
            updated_fields.append(field_id)

    SITE_CONTENT_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return {
        "managed": True,
        "updated_fields": updated_fields,
        "retired_fields": retired_fields,
    }
