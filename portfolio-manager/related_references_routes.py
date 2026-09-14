from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, url_for

from related_references_service import (
    RelatedReferenceError,
    apply_related_reference_decisions,
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
