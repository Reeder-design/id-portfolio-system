from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, url_for

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
from page_ai_service import (
    MAX_REQUEST_CHARS,
    generate_page_edit_proposal,
    load_page_edit_proposal,
    save_page_edit_proposal,
)


ai_bp = Blueprint("ai_assistant", __name__, url_prefix="/ai")


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
    return render_template(
        "ai-assistant.html",
        settings=get_ai_settings(),
        tasks=TASKS,
        recent_proposals=list_recent_proposals(),
        max_source_chars=MAX_SOURCE_CHARS,
        max_goal_chars=MAX_GOAL_CHARS,
        source_text="",
        user_goal="",
        selected_task="polish",
        preflight=None,
    )


@ai_bp.post("/generate")
def generate():
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
            settings=get_ai_settings(),
            tasks=TASKS,
            recent_proposals=list_recent_proposals(),
            max_source_chars=MAX_SOURCE_CHARS,
            max_goal_chars=MAX_GOAL_CHARS,
            source_text=source_text,
            user_goal=user_goal,
            selected_task=task if task in TASKS else "polish",
            preflight=preflight,
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
