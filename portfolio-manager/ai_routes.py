from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, send_file, url_for

from ai_service import (
    AIServiceError,
    MAX_GOAL_CHARS,
    MAX_SOURCE_CHARS,
    TASKS,
    delete_proposal,
    generate_proposal,
    get_ai_settings,
    list_recent_proposals,
    load_proposal,
    preflight_source,
    save_proposal,
)
from ai_settings_service import (
    AISettingsError,
    MODEL_OPTIONS,
    disable_local_ai,
    get_local_ai_settings,
    save_local_ai_settings,
    test_ai_connection,
)
from ai_upload_generation_service import (
    generate_prepared_upload_proposal,
    save_prepared_upload_proposal,
)
from ai_upload_service import (
    AIUploadError,
    MAX_FILE_BYTES,
    MAX_TOTAL_BYTES,
    MAX_UPLOAD_FILES,
    allowed_upload_summary,
    attachment_path,
    delete_upload_session,
    load_upload_session,
    prepare_upload_session,
)
from page_ai_service import (
    MAX_REQUEST_CHARS,
    generate_page_edit_proposal,
    load_page_edit_proposal,
    save_page_edit_proposal,
)


ai_bp = Blueprint("ai_assistant", __name__, url_prefix="/ai")


def _workspace_template_context(
    *,
    source_text: str = "",
    user_goal: str = "",
    selected_task: str = "polish",
    preflight=None,
    prepared_session=None,
):
    return {
        "settings": get_ai_settings(),
        "tasks": TASKS,
        "recent_proposals": list_recent_proposals(),
        "max_source_chars": MAX_SOURCE_CHARS,
        "max_goal_chars": MAX_GOAL_CHARS,
        "source_text": source_text,
        "user_goal": user_goal,
        "selected_task": selected_task,
        "preflight": preflight,
        "prepared_session": prepared_session,
        "max_upload_files": MAX_UPLOAD_FILES,
        "max_file_mb": MAX_FILE_BYTES // (1024 * 1024),
        "max_total_mb": MAX_TOTAL_BYTES // (1024 * 1024),
        "allowed_upload_summary": allowed_upload_summary(),
    }


@ai_bp.get("/settings")
def settings():
    return render_template(
        "ai-settings.html",
        settings=get_local_ai_settings(),
        model_options=MODEL_OPTIONS,
    )


@ai_bp.post("/settings/save")
def save_settings():
    current = get_local_ai_settings()
    try:
        save_local_ai_settings(
            request.form.get("api_key", ""),
            request.form.get("model", ""),
            keep_existing_key=current["configured"],
        )
    except AISettingsError as exc:
        flash(str(exc), "error")
    else:
        flash(
            "AI settings saved locally. The API key remains in the Git-ignored .env file and is not shown in Portfolio Manager.",
            "success",
        )
    return redirect(url_for("ai_assistant.settings"))


@ai_bp.post("/settings/test")
def test_settings():
    try:
        message = test_ai_connection()
    except AISettingsError as exc:
        flash(str(exc), "error")
    else:
        flash(message, "success")
    return redirect(url_for("ai_assistant.settings"))


@ai_bp.post("/settings/disable")
def disable_settings():
    try:
        disable_local_ai()
    except AISettingsError as exc:
        flash(str(exc), "error")
    else:
        flash("AI assistance disabled locally. Portfolio Manager login settings were preserved.", "success")
    return redirect(url_for("ai_assistant.settings"))


@ai_bp.get("/")
def workspace():
    prepared_session = None
    session_id = request.args.get("session", "").strip()
    if session_id:
        try:
            prepared_session = load_upload_session(session_id)
        except AIUploadError as exc:
            flash(str(exc), "error")

    selected_task = "polish"
    user_goal = ""
    if prepared_session:
        selected_task = str(prepared_session.get("task", "polish"))
        user_goal = str(prepared_session.get("user_goal", ""))

    return render_template(
        "ai-assistant.html",
        **_workspace_template_context(
            selected_task=selected_task,
            user_goal=user_goal,
            prepared_session=prepared_session,
            preflight=prepared_session.get("preflight") if prepared_session else None,
        ),
    )


@ai_bp.post("/prepare")
def prepare():
    task = request.form.get("task", "").strip()
    source_text = request.form.get("source_text", "")
    user_goal = request.form.get("user_goal", "")
    uploaded_files = request.files.getlist("source_files")

    try:
        record = prepare_upload_session(task, user_goal, source_text, uploaded_files)
    except AIUploadError as exc:
        flash(str(exc), "error")
        return render_template(
            "ai-assistant.html",
            **_workspace_template_context(
                source_text=source_text,
                user_goal=user_goal,
                selected_task=task if task in TASKS else "polish",
            ),
        )

    flash(
        "Request prepared locally. Review the exact extracted text and attachment list below before allowing anything to be sent to AI.",
        "success",
    )
    return redirect(url_for("ai_assistant.workspace", session=record["id"]), code=303)


def _generate_prepared(session_id: str):
    try:
        session = load_upload_session(session_id)
    except AIUploadError as exc:
        flash(str(exc), "error")
        return redirect(url_for("ai_assistant.workspace"), code=303)

    provider_ack = request.form.get("provider_ack") == "on"
    authority_ack = request.form.get("authority_ack") == "on"
    sensitive_ack = request.form.get("sensitive_ack") == "on"
    visual_ack = request.form.get("visual_ack") == "on"
    preflight = session.get("preflight", {})

    if not provider_ack:
        flash("Confirm that the prepared text, any attached images, and public portfolio taxonomy may be sent to the configured AI provider.", "error")
        return redirect(url_for("ai_assistant.workspace", session=session_id), code=303)
    if not authority_ack:
        flash("Confirm that you are authorized to send this prepared request and that secrets or credentials have been removed.", "error")
        return redirect(url_for("ai_assistant.workspace", session=session_id), code=303)
    if session.get("has_images") and not visual_ack:
        flash("Review the attached images and confirm that their full visual contents may be sent to the AI provider.", "error")
        return redirect(url_for("ai_assistant.workspace", session=session_id), code=303)
    if preflight.get("blocked"):
        labels = ", ".join(preflight.get("blocked", []))
        flash(
            f"Local safety preflight blocked this request because the prepared text appears to contain {labels}. Discard this prepared request and remove that material before trying again.",
            "error",
        )
        return redirect(url_for("ai_assistant.workspace", session=session_id), code=303)
    if preflight.get("warnings") and not sensitive_ack:
        labels = ", ".join(preflight.get("warnings", []))
        flash(
            f"Local preflight noticed potentially sensitive markers ({labels}). Review the exact prepared content and confirm the additional acknowledgement before sending.",
            "error",
        )
        return redirect(url_for("ai_assistant.workspace", session=session_id), code=303)
    if not get_ai_settings()["configured"]:
        flash("AI is not configured yet. Open AI Settings first.", "error")
        return redirect(url_for("ai_assistant.settings"), code=303)

    try:
        result = generate_prepared_upload_proposal(session)
        record = save_prepared_upload_proposal(session, result)
    except (AIServiceError, AIUploadError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("ai_assistant.workspace", session=session_id), code=303)

    delete_upload_session(session_id)
    flash(
        "AI proposal created in the private local workspace. Temporary uploaded files were deleted after the request. No portfolio or Git files were changed.",
        "success",
    )
    return redirect(url_for("ai_assistant.proposal", proposal_id=record["id"]), code=303)


@ai_bp.post("/generate")
def generate():
    upload_session_id = request.form.get("upload_session_id", "").strip()
    if upload_session_id:
        return _generate_prepared(upload_session_id)

    task = request.form.get("task", "").strip()
    source_text = request.form.get("source_text", "")
    user_goal = request.form.get("user_goal", "")
    provider_ack = request.form.get("provider_ack") == "on"
    authority_ack = request.form.get("authority_ack") == "on"
    sensitive_ack = request.form.get("sensitive_ack") == "on"

    def render_with_error(message: str, preflight=None):
        flash(message, "error")
        return render_template(
            "ai-assistant.html",
            **_workspace_template_context(
                source_text=source_text,
                user_goal=user_goal,
                selected_task=task if task in TASKS else "polish",
                preflight=preflight,
            ),
        )

    if task not in TASKS:
        return render_with_error("Choose a valid AI task.")
    if not source_text.strip():
        return render_with_error("Add source text or a draft before generating an AI proposal.")
    if len(source_text) > MAX_SOURCE_CHARS:
        return render_with_error(f"Source text is too long. Keep it under {MAX_SOURCE_CHARS:,} characters.")
    if len(user_goal) > MAX_GOAL_CHARS:
        return render_with_error(f"Goal/context is too long. Keep it under {MAX_GOAL_CHARS:,} characters.")
    if not provider_ack:
        return render_with_error("Confirm that you understand the entered text/context will be sent to the configured AI provider.")
    if not authority_ack:
        return render_with_error("Confirm that you are authorized to send this text and have removed secrets or credentials.")

    preflight = preflight_source(source_text)
    if preflight["blocked"]:
        labels = ", ".join(preflight["blocked"])
        return render_with_error(
            f"Local safety preflight blocked this request because it appears to contain {labels}. Remove that secret/credential first.",
            preflight=preflight,
        )

    if preflight["warnings"] and not sensitive_ack:
        labels = ", ".join(preflight["warnings"])
        return render_with_error(
            f"Local preflight noticed potentially sensitive markers ({labels}). Review the source below. If you are still authorized to send it, check the additional acknowledgement and submit again.",
            preflight=preflight,
        )

    if not get_ai_settings()["configured"]:
        return render_with_error("AI is not configured yet. Open AI Settings first.", preflight=preflight)

    try:
        result = generate_proposal(task, source_text, user_goal)
        record = save_proposal(task, source_text, user_goal, result)
    except AIServiceError as exc:
        return render_with_error(str(exc), preflight=preflight)

    flash("AI proposal created in the private local workspace. No portfolio or Git files were changed.", "success")
    return redirect(url_for("ai_assistant.proposal", proposal_id=record["id"]))


@ai_bp.get("/uploads/<session_id>/images/<attachment_id>")
def preview_upload_image(session_id: str, attachment_id: str):
    try:
        session = load_upload_session(session_id)
        path = attachment_path(session_id, attachment_id, image_only=True)
        attachment = next(
            item for item in session.get("attachments", [])
            if isinstance(item, dict) and item.get("id") == attachment_id
        )
    except (AIUploadError, StopIteration) as exc:
        flash(str(exc) if isinstance(exc, AIUploadError) else "Prepared image attachment not found.", "error")
        return redirect(url_for("ai_assistant.workspace", session=session_id), code=303)
    return send_file(
        path,
        mimetype=str(attachment.get("mime_type", "application/octet-stream")),
        as_attachment=False,
        download_name=str(attachment.get("filename", "image")),
        max_age=0,
        conditional=True,
    )


@ai_bp.post("/uploads/<session_id>/delete")
def discard_upload_session(session_id: str):
    try:
        delete_upload_session(session_id)
    except AIUploadError as exc:
        flash(str(exc), "error")
    else:
        flash("Prepared AI request discarded. Its temporary uploaded files were deleted locally.", "success")
    return redirect(url_for("ai_assistant.workspace"), code=303)


@ai_bp.post("/page-edit/<page_id>/generate")
def generate_page_edit(page_id: str):
    user_request = request.form.get("ai_request", "").strip()
    if len(user_request) > MAX_REQUEST_CHARS:
        flash(f"Keep the AI edit request under {MAX_REQUEST_CHARS:,} characters.", "error")
        return redirect(url_for("site_content.v2_page_editor", page_id=page_id))
    if not get_local_ai_settings()["configured"]:
        flash("Connect AI in Settings before requesting a page-aware edit.", "error")
        return redirect(url_for("ai_assistant.settings"))

    try:
        generated = generate_page_edit_proposal(page_id, user_request)
        generated["page_id"] = page_id
        record = save_page_edit_proposal(generated)
    except (AIServiceError, AISettingsError, FileNotFoundError, ValueError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("site_content.v2_page_editor", page_id=page_id))

    flash(
        "AI created a private page-edit proposal. No portfolio files were changed. Review the exact proposed operations before deciding what to do next.",
        "success",
    )
    return redirect(url_for("ai_assistant.page_edit_proposal", proposal_id=record["id"]))


@ai_bp.get("/page-edit/proposals/<proposal_id>")
def page_edit_proposal(proposal_id: str):
    try:
        record = load_page_edit_proposal(proposal_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("content.content_manager"))
    return render_template("page-ai-proposal.html", record=record)


@ai_bp.get("/proposals/<proposal_id>")
def proposal(proposal_id: str):
    try:
        record = load_proposal(proposal_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("ai_assistant.workspace"))
    return render_template("ai-proposal.html", record=record)


@ai_bp.post("/proposals/<proposal_id>/delete")
def remove_proposal(proposal_id: str):
    try:
        delete_proposal(proposal_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("ai_assistant.workspace"))
    flash("Private AI proposal deleted. Portfolio files were not changed.", "success")
    return redirect(url_for("ai_assistant.workspace"))
