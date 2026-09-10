from __future__ import annotations

import json
from pathlib import Path
import sys

from flask import Blueprint, flash, redirect, render_template, request, url_for

from content_routes import run_command


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
SITE_CONTENT_PATH = REPO_ROOT / "portfolio-data" / "site-content.json"

site_content_bp = Blueprint("site_content", __name__)


def load_site_content() -> dict:
    return json.loads(SITE_CONTENT_PATH.read_text(encoding="utf-8"))


def write_site_content(data: dict) -> None:
    SITE_CONTENT_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def load_page(page_id: str) -> tuple[dict, dict]:
    data = load_site_content()
    page = data.get("pages", {}).get(page_id)
    if page is None:
        raise FileNotFoundError(f"Managed general page not found: {page_id}")
    return data, page


def rollback(page_path: Path, original_json: str, original_html: str) -> None:
    SITE_CONTENT_PATH.write_text(original_json, encoding="utf-8")
    page_path.write_text(original_html, encoding="utf-8")


@site_content_bp.route("/site-content")
def page_library():
    data = load_site_content()
    pages = []
    for page_id, page in data.get("pages", {}).items():
        pages.append({
            "id": page_id,
            "label": page.get("label", page_id),
            "page_path": page.get("page_path", ""),
            "field_count": len(page.get("fields", {})),
        })
    return render_template("general-content.html", pages=pages)


@site_content_bp.route("/site-content/<page_id>")
def page_editor(page_id: str):
    try:
        _, page = load_page(page_id)
    except FileNotFoundError as exc:
        flash(str(exc), "error")
        return redirect(url_for("site_content.page_library"))

    return render_template(
        "general-page-editor.html",
        page_id=page_id,
        page=page,
    )


@site_content_bp.route("/site-content/<page_id>/save", methods=["POST"])
def save_page(page_id: str):
    try:
        if request.form.get("public_safe") != "on":
            raise ValueError(
                "Confirm that the edited copy is safe for the public portfolio before saving."
            )

        data, page = load_page(page_id)
        page_path = (REPO_ROOT / page["page_path"]).resolve()
        portfolio_root = (REPO_ROOT / "portfolio").resolve()
        try:
            page_path.relative_to(portfolio_root)
        except ValueError as exc:
            raise ValueError("Managed general page must stay under portfolio/.") from exc

        original_json = SITE_CONTENT_PATH.read_text(encoding="utf-8")
        original_html = page_path.read_text(encoding="utf-8")

        for field_id, field in page.get("fields", {}).items():
            value = request.form.get(f"field__{field_id}", "").strip()
            if not value:
                raise ValueError(f"{field.get('label', field_id)} cannot be blank.")
            field["value"] = value

        write_site_content(data)

        render_ok, render_output = run_command([
            sys.executable,
            "scripts/render-site-content.py",
            "--page",
            page_id,
        ])
        if not render_ok:
            rollback(page_path, original_json, original_html)
            raise RuntimeError(
                "The page renderer could not safely locate every editable field, so the edit was rolled back."
                + (f"\n\n{render_output}" if render_output else "")
            )

        content_ok, content_output = run_command([
            sys.executable,
            "scripts/check-site-content.py",
        ])
        site_ok, site_output = run_command([
            sys.executable,
            "scripts/check-site.py",
        ])

        if not content_ok or not site_ok:
            rollback(page_path, original_json, original_html)
            details = "\n\n".join(
                value for value in [content_output, site_output] if value
            )
            raise RuntimeError(
                "Validation failed after the edit, so both the structured content and public HTML were restored."
                + (f"\n\n{details}" if details else "")
            )

        flash(
            "General page content saved to structured site data and public HTML locally. Nothing was committed, pushed, merged, or published.",
            "success",
        )
    except Exception as exc:
        flash(f"Could not save general page content: {exc}", "error")

    return redirect(url_for("site_content.page_editor", page_id=page_id))
