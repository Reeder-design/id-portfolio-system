from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, url_for

from content_routes import (
    REPO_ROOT,
    is_generated_page,
    load_project,
    regenerate_project as regenerate_project_view,
    save_project as save_project_view,
)
from page_copy_service import extract_visible_fields, page_info
from site_content_routes import v2_save_page as save_page_view
from related_references_service import (
    RelatedReferenceError,
    apply_related_reference_decisions,
    create_related_reference_review,
    delete_related_reference_review,
    load_related_reference_review,
)


related_references_bp = Blueprint(
    "related_references",
    __name__,
    url_prefix="/related-references",
)


def _source_editor_url(record: dict) -> str:
    if record.get("source_kind") == "project":
        return url_for("content.project_editor", project_id=record.get("source_id"))
    return url_for("site_content.v2_page_editor", page_id=record.get("source_id"))


def _posted_h1_change(page_id: str):
    page, page_path = page_info(page_id)
    html_text = page_path.read_text(encoding="utf-8")
    for field in extract_visible_fields(html_text):
        if field.get("tag") != "h1":
            continue
        key = str(field.get("key", ""))
        posted_name = f"visible__{key}"
        if posted_name not in request.form:
            continue
        old_title = str(field.get("value", "")).strip()
        new_title = request.form.get(posted_name, "").strip()
        if old_title and new_title and old_title != new_title:
            return page, page_path, old_title, new_title
    return None


def save_project_with_references(project_id: str):
    try:
        before, _ = load_project(project_id)
    except FileNotFoundError:
        return save_project_view(project_id)

    old_title = str(before.get("title", "")).strip()
    target_path = str(before.get("page_path", "")).strip()
    generated = is_generated_page(before)

    response = save_project_view(project_id)

    try:
        after, _ = load_project(project_id)
    except FileNotFoundError:
        return response

    new_title = str(after.get("title", "")).strip()
    if not old_title or not new_title or old_title == new_title:
        return response
    if new_title != request.form.get("title", "").strip():
        return response

    automatic_updates = ["Project record", "Generated documentation"]
    if generated:
        regenerate_project_view(project_id)
        try:
            generated_html = (REPO_ROOT / target_path).read_text(encoding="utf-8")
        except OSError:
            generated_html = ""
        if new_title in generated_html:
            automatic_updates.append("Current generated project page")
    else:
        automatic_updates.append("Current custom project page title")

    try:
        review_record = create_related_reference_review(
            source_kind="project",
            source_id=project_id,
            source_label=new_title,
            target_path=target_path,
            old_title=old_title,
            new_title=new_title,
            automatic_updates=automatic_updates,
        )
    except RelatedReferenceError as exc:
        flash(f"Project saved, but Related References could not start: {exc}", "error")
        return response

    flash(
        f"Project saved. Portfolio Manager found {len(review_record.get('references', []))} related reference(s) to review before publishing.",
        "success",
    )
    return redirect(
        url_for("related_references.review", review_id=review_record["id"]),
        code=303,
    )


def save_page_with_references(page_id: str):
    try:
        title_change = _posted_h1_change(page_id)
    except Exception:
        title_change = None

    response = save_page_view(page_id)
    if title_change is None:
        return response

    page, page_path, old_title, new_title = title_change
    try:
        current_html = page_path.read_text(encoding="utf-8")
        current_h1_values = [
            str(field.get("value", "")).strip()
            for field in extract_visible_fields(current_html)
            if field.get("tag") == "h1"
        ]
    except Exception:
        return response

    if new_title not in current_h1_values:
        return response

    try:
        review_record = create_related_reference_review(
            source_kind="page",
            source_id=page_id,
            source_label=str(page.get("label", page_id)),
            target_path=str(page.get("path", "")),
            old_title=old_title,
            new_title=new_title,
            automatic_updates=["Edited page heading"],
        )
    except RelatedReferenceError as exc:
        flash(f"Page saved, but Related References could not start: {exc}", "error")
        return response

    flash(
        f"Page saved. Portfolio Manager found {len(review_record.get('references', []))} related reference(s) to review before publishing.",
        "success",
    )
    return redirect(
        url_for("related_references.review", review_id=review_record["id"]),
        code=303,
    )


@related_references_bp.record_once
def install_related_reference_save_adapters(state):
    state.app.view_functions["content.save_project"] = save_project_with_references
    state.app.view_functions["site_content.v2_save_page"] = save_page_with_references


@related_references_bp.get("/<review_id>")
def review(review_id: str):
    try:
        record = load_related_reference_review(review_id)
    except RelatedReferenceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("content.content_manager"))

    preview_urls = []
    seen = set()
    for candidate in record.get("references", []):
        preview = str(candidate.get("preview_url", ""))
        if preview and preview not in seen:
            seen.add(preview)
            preview_urls.append({"path": candidate.get("path", ""), "url": preview})

    return render_template(
        "related-references.html",
        record=record,
        source_editor_url=_source_editor_url(record),
        preview_urls=preview_urls,
    )


@related_references_bp.post("/<review_id>/apply")
def apply(review_id: str):
    try:
        record = apply_related_reference_decisions(review_id, request.form)
    except RelatedReferenceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("related_references.review", review_id=review_id), code=303)

    updated_count = len(record.get("updated_paths", []))
    if updated_count:
        flash(
            f"Related References review completed. Updated {updated_count} related page(s) and full validation passed.",
            "success",
        )
    else:
        flash(
            "Related References review completed with no additional page updates. Full validation passed.",
            "success",
        )
    return redirect(url_for("related_references.review", review_id=review_id), code=303)


@related_references_bp.post("/<review_id>/delete")
def delete(review_id: str):
    try:
        delete_related_reference_review(review_id)
    except RelatedReferenceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("related_references.review", review_id=review_id), code=303)

    flash("Private Related References review deleted. No public portfolio files were changed.", "success")
    return redirect(url_for("content.content_manager"), code=303)
