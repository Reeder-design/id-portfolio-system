from __future__ import annotations

import json
from pathlib import Path
import sys

from flask import Blueprint, flash, redirect, render_template, request, url_for

from ai_settings_service import get_local_ai_settings
from page_ai_service import find_active_page_edit_proposal
from content_routes import run_command
from notes_service import load_note, save_note
from page_copy_service import (
    apply_page_edits,
    extract_script_fields,
    extract_visible_fields,
    page_info,
    preview_url,
)


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
SITE_CONTENT_PATH = REPO_ROOT / "portfolio-data" / "site-content.json"
SCRIPTS_ROOT = REPO_ROOT / "scripts"
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

from site_content_model import extract_page_fields  # noqa: E402


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


@site_content_bp.route("/manage/pages/<page_id>")
def v2_page_editor(page_id: str):
    try:
        page, page_path = page_info(page_id)
        html_text = page_path.read_text(encoding="utf-8")
        visible_fields = extract_visible_fields(html_text)
        script_fields = extract_script_fields(page_id, html_text)
    except Exception as exc:
        flash(f"Could not open page editor: {exc}", "error")
        return redirect(url_for("content.content_manager"))

    preview = preview_url(page)
    separator = "&" if "?" in preview else "?"
    versioned_preview = f"{preview}{separator}v={page_path.stat().st_mtime_ns}"

    return render_template(
        "page-editor-v2.html",
        page_id=page_id,
        page=page,
        visible_fields=visible_fields,
        script_fields=script_fields,
        page_note=load_note("page", page_id),
        preview_url=versioned_preview,
        ai_settings=get_local_ai_settings(),
        active_ai_proposal=find_active_page_edit_proposal(page_id),
    )


@site_content_bp.route("/manage/pages/<page_id>/save", methods=["POST"])
def v2_save_page(page_id: str):
    try:
        page, page_path = page_info(page_id)
        original_html = page_path.read_text(encoding="utf-8")
        original_json = SITE_CONTENT_PATH.read_text(encoding="utf-8")
        updated_html, change_count = apply_page_edits(page_id, original_html, request.form)

        if change_count and request.form.get("public_safe") != "on":
            raise ValueError(
                "Confirm that the public-page edits are safe for your portfolio before saving."
            )

        if change_count:
            page_path.write_text(updated_html, encoding="utf-8")
            data = load_site_content()
            if page_id in data.get("pages", {}):
                try:
                    extracted = extract_page_fields(page_id, data=data)
                    for field_id, value in extracted.items():
                        data["pages"][page_id]["fields"][field_id]["value"] = value
                    write_site_content(data)
                except Exception:
                    page_path.write_text(original_html, encoding="utf-8")
                    SITE_CONTENT_PATH.write_text(original_json, encoding="utf-8")
                    raise

            content_ok, content_output = run_command([
                sys.executable,
                "scripts/check-site-content.py",
            ])
            site_ok, site_output = run_command([
                sys.executable,
                "scripts/check-site.py",
            ])
            if not content_ok or not site_ok:
                page_path.write_text(original_html, encoding="utf-8")
                SITE_CONTENT_PATH.write_text(original_json, encoding="utf-8")
                details = "\n\n".join(
                    value for value in [content_output, site_output] if value
                )
                raise RuntimeError(
                    "The page did not pass validation, so the public edit was rolled back."
                    + (f"\n\n{details}" if details else "")
                )

        save_note("page", page_id, request.form.get("private_note", ""))

        if change_count:
            flash(
                f"Saved {change_count} visible content edit(s) locally. Your private page note was also saved. Nothing has been published.",
                "success",
            )
        else:
            flash("Private page note saved. No public page copy changed.", "success")
    except Exception as exc:
        flash(f"Could not save page edits: {exc}", "error")

    return redirect(url_for("site_content.v2_page_editor", page_id=page_id))
