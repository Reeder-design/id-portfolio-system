from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, send_file, url_for

from ai_settings_service import get_local_ai_settings
from reference_ai_analysis_service import (
    ReferenceAIAnalysisError,
    analysis_image_path,
    resource_analysis_context,
    run_resource_analysis,
)
from reference_library_service import (
    ALLOWED_STATUSES,
    ReferenceLibraryError,
    create_reference_item,
    list_reference_items,
    load_reference_item,
    reference_file_path,
    save_sanitized_derivative,
    update_reference_item,
)
from reference_sanitization_service import (
    ALLOWED_DECISIONS,
    DECISION_LABELS,
    SanitizationError,
    generate_sanitized_text_draft,
    review_preflight,
    run_sanitization_review,
    save_finding_decisions,
)
from state_safety_service import (
    safe_delete_reference_item,
    safe_delete_sanitized_derivative,
)


reference_library_bp = Blueprint(
    "reference_library",
    __name__,
    url_prefix="/create/references",
)


@reference_library_bp.get("/")
def workspace():
    selected_status = request.args.get("status", "").strip()
    try:
        items = list_reference_items(selected_status or None)
    except ReferenceLibraryError:
        selected_status = ""
        items = list_reference_items()
        flash("Unknown Reference Library filter. Showing all private sources.", "error")
    return render_template(
        "reference-library.html",
        items=items,
        selected_status=selected_status or "all",
        statuses=ALLOWED_STATUSES,
    )


@reference_library_bp.post("/add")
def add_item():
    try:
        record = create_reference_item(
            request.form.get("title", ""),
            request.form.get("notes", ""),
            request.form.get("tags", ""),
            request.files.get("source_file"),
        )
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.workspace"), code=303)

    flash("Private source added to the Reference Library. Nothing was published or sent to AI.", "success")
    return redirect(url_for("reference_library.item", item_id=record["id"]), code=303)


@reference_library_bp.get("/<item_id>")
def item(item_id: str):
    try:
        record = load_reference_item(item_id)
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.workspace"))
    return render_template(
        "reference-item.html",
        record=record,
        statuses=ALLOWED_STATUSES,
    )


@reference_library_bp.post("/<item_id>/save")
def save_item(item_id: str):
    try:
        update_reference_item(
            item_id,
            request.form.get("title", ""),
            request.form.get("notes", ""),
            request.form.get("tags", ""),
            request.form.get("status", "private-source"),
            request.form.get("approval_note", ""),
        )
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
    else:
        flash("Reference item updated privately. No public portfolio files were changed.", "success")
    return redirect(url_for("reference_library.item", item_id=item_id), code=303)


@reference_library_bp.get("/<item_id>/analysis")
def analysis(item_id: str):
    try:
        record = load_reference_item(item_id)
        context = resource_analysis_context(item_id)
    except (ReferenceLibraryError, ReferenceAIAnalysisError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.item", item_id=item_id))
    return render_template(
        "reference-ai-analysis.html",
        record=record,
        context=context,
        analysis=record.get("ai_analysis"),
        ai_settings=get_local_ai_settings(),
    )


@reference_library_bp.get("/<item_id>/analysis/image")
def analysis_image(item_id: str):
    try:
        path = analysis_image_path(item_id)
        record = load_reference_item(item_id)
    except (ReferenceLibraryError, ReferenceAIAnalysisError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.analysis", item_id=item_id))
    return send_file(
        path,
        mimetype=str(record.get("original_file", {}).get("mime_type") or "application/octet-stream"),
        as_attachment=False,
        download_name=path.name,
        max_age=0,
        conditional=True,
    )


@reference_library_bp.post("/<item_id>/analysis/run")
def run_analysis(item_id: str):
    if not get_local_ai_settings()["configured"]:
        flash("Connect AI in Settings before analyzing a Reference Library resource.", "error")
        return redirect(url_for("ai_assistant.settings"), code=303)
    try:
        context = resource_analysis_context(item_id)
    except (ReferenceLibraryError, ReferenceAIAnalysisError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.item", item_id=item_id), code=303)

    if not context.get("supported"):
        flash(str(context.get("reason") or "This resource is not currently supported for AI analysis."), "error")
        return redirect(url_for("reference_library.analysis", item_id=item_id), code=303)
    if request.form.get("provider_ack") != "on":
        flash("Confirm exactly what source material and public taxonomy will be sent to the configured AI provider.", "error")
        return redirect(url_for("reference_library.analysis", item_id=item_id), code=303)
    if request.form.get("authority_ack") != "on":
        flash("Confirm that you are authorized to send this private source material to the configured AI provider.", "error")
        return redirect(url_for("reference_library.analysis", item_id=item_id), code=303)
    if context.get("mode") == "image" and request.form.get("visual_ack") != "on":
        flash("Review the full image and confirm that its visual contents may be sent to the AI provider.", "error")
        return redirect(url_for("reference_library.analysis", item_id=item_id), code=303)
    if context.get("blocked"):
        flash("Local preflight found credential or secret material. Create a safer private working copy before using AI resource analysis.", "error")
        return redirect(url_for("reference_library.analysis", item_id=item_id), code=303)
    if context.get("warnings") and request.form.get("sensitive_ack") != "on":
        flash("Review the local sensitivity warnings and confirm the additional acknowledgement before sending this source to AI.", "error")
        return redirect(url_for("reference_library.analysis", item_id=item_id), code=303)

    try:
        run_resource_analysis(
            item_id,
            request.form.get("focus", ""),
            request.form.get("reviewed_sha256", ""),
        )
    except (ReferenceLibraryError, ReferenceAIAnalysisError) as exc:
        flash(str(exc), "error")
    else:
        flash("Private AI resource analysis created. The original source, sanitization status, approval status, portfolio files, and Git state were not changed.", "success")
    return redirect(url_for("reference_library.analysis", item_id=item_id), code=303)


@reference_library_bp.post("/<item_id>/sanitized")
def upload_sanitized(item_id: str):
    try:
        save_sanitized_derivative(item_id, request.files.get("sanitized_file"))
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
    else:
        flash("Sanitized Draft stored separately from the original private source. Review it before approval.", "success")
    return redirect(url_for("reference_library.item", item_id=item_id), code=303)


@reference_library_bp.post("/<item_id>/sanitized/delete")
def remove_sanitized(item_id: str):
    try:
        safe_delete_sanitized_derivative(item_id)
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
    else:
        flash("Sanitized Draft removed. The original private source was preserved unchanged.", "success")
    return redirect(url_for("reference_library.item", item_id=item_id), code=303)


@reference_library_bp.get("/<item_id>/sanitization")
def sanitization(item_id: str):
    try:
        record = load_reference_item(item_id)
        preflight = review_preflight(item_id)
    except (ReferenceLibraryError, SanitizationError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.item", item_id=item_id))
    return render_template(
        "reference-sanitization.html",
        record=record,
        preflight=preflight,
        ai_settings=get_local_ai_settings(),
        decisions=ALLOWED_DECISIONS,
        decision_labels=DECISION_LABELS,
    )


@reference_library_bp.post("/<item_id>/sanitization/run")
def run_sanitization(item_id: str):
    if not get_local_ai_settings()["configured"]:
        flash("Connect AI in Settings before running a sanitization review.", "error")
        return redirect(url_for("ai_assistant.settings"), code=303)
    if request.form.get("provider_ack") != "on":
        flash("Confirm that the extracted source text may be sent to the configured AI provider for sanitization review.", "error")
        return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)
    if request.form.get("authority_ack") != "on":
        flash("Confirm that you are authorized to send this source material for AI review.", "error")
        return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)

    try:
        preflight = review_preflight(item_id)
        if preflight["blocked"]:
            flash("Local preflight found credential or secret material. Remove it from a working copy before using AI sanitization review.", "error")
            return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)
        if preflight["warnings"] and request.form.get("sensitive_ack") != "on":
            flash("Review the local sensitivity warnings and confirm the additional acknowledgement before sending this source to AI.", "error")
            return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)
        run_sanitization_review(item_id)
    except (ReferenceLibraryError, SanitizationError) as exc:
        flash(str(exc), "error")
    else:
        flash("Sanitization findings created privately. AI did not modify the source or approve it for publication.", "success")
    return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)


@reference_library_bp.post("/<item_id>/sanitization/decisions")
def save_sanitization_decisions(item_id: str):
    try:
        record = save_finding_decisions(item_id, request.form)
    except (ReferenceLibraryError, SanitizationError) as exc:
        flash(str(exc), "error")
    else:
        review = record.get("sanitization_review") or {}
        if review.get("decisions_complete"):
            flash("All sanitization findings have a human decision. You can now generate a sanitized text working draft or continue manually.", "success")
        else:
            flash("Sanitization decisions saved privately. Resolve the remaining findings before generating a text draft.", "success")
    return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)


@reference_library_bp.post("/<item_id>/sanitization/generate-draft")
def generate_sanitized_draft(item_id: str):
    if not get_local_ai_settings()["configured"]:
        flash("Connect AI in Settings before generating a sanitized text draft.", "error")
        return redirect(url_for("ai_assistant.settings"), code=303)
    if request.form.get("provider_ack") != "on" or request.form.get("authority_ack") != "on":
        flash("Confirm both the provider boundary and your authorization before generating a sanitized text draft.", "error")
        return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)
    try:
        preflight = review_preflight(item_id)
        if preflight["blocked"]:
            flash("Local preflight found credential or secret material. Draft generation is blocked.", "error")
            return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)
        if preflight["warnings"] and request.form.get("sensitive_ack") != "on":
            flash("Review the local sensitivity warnings and confirm the additional acknowledgement before generating a draft.", "error")
            return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)
        generate_sanitized_text_draft(item_id)
    except (ReferenceLibraryError, SanitizationError) as exc:
        flash(str(exc), "error")
    else:
        flash("Sanitized text draft created as a separate private derivative. It still requires your review before approval for portfolio use.", "success")
    return redirect(url_for("reference_library.sanitization", item_id=item_id), code=303)


@reference_library_bp.get("/<item_id>/files/<kind>")
def download_file(item_id: str, kind: str):
    if kind not in {"original", "sanitized"}:
        flash("Unknown reference file type.", "error")
        return redirect(url_for("reference_library.item", item_id=item_id))
    try:
        path = reference_file_path(item_id, kind)
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.item", item_id=item_id))
    return send_file(path, as_attachment=True, download_name=path.name)


@reference_library_bp.post("/<item_id>/delete")
def remove_item(item_id: str):
    try:
        safe_delete_reference_item(item_id)
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.item", item_id=item_id), code=303)

    flash("Private reference item and its stored files were deleted.", "success")
    return redirect(url_for("reference_library.workspace"), code=303)