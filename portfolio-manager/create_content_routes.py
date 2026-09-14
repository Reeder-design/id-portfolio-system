from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, url_for

from ai_settings_service import get_local_ai_settings
from create_content_service import (
    CreateContentError,
    brief_preflight,
    create_brief,
    delete_brief,
    generate_plan,
    list_briefs,
    load_brief,
    save_brief_fields,
)


create_content_bp = Blueprint("create_content", __name__, url_prefix="/create")


@create_content_bp.get("/")
def workspace():
    return render_template(
        "create-content.html",
        briefs=list_briefs(),
        ai_settings=get_local_ai_settings(),
    )


@create_content_bp.get("/new")
def new_brief():
    return render_template(
        "create-content-brief.html",
        record=None,
        fields={},
        preflight={"blocked": [], "warnings": []},
        ai_settings=get_local_ai_settings(),
    )


@create_content_bp.post("/new")
def create_new_brief():
    try:
        record = create_brief(request.form)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return render_template(
            "create-content-brief.html",
            record=None,
            fields=request.form,
            preflight={"blocked": [], "warnings": []},
            ai_settings=get_local_ai_settings(),
        )

    flash("Content Brief saved privately. Nothing was sent to AI or written to the public portfolio.", "success")
    return redirect(url_for("create_content.brief", brief_id=record["id"]), code=303)


@create_content_bp.get("/briefs/<brief_id>")
def brief(brief_id: str):
    try:
        record = load_brief(brief_id)
        preflight = brief_preflight(record)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.workspace"))

    return render_template(
        "create-content-brief.html",
        record=record,
        fields=record.get("fields", {}),
        preflight=preflight,
        ai_settings=get_local_ai_settings(),
    )


@create_content_bp.post("/briefs/<brief_id>/save")
def save_brief(brief_id: str):
    action = request.form.get("action", "save").strip()
    try:
        record = save_brief_fields(brief_id, request.form)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    if action != "generate-plan":
        flash("Content Brief saved privately. Nothing was sent to AI or written to the public portfolio.", "success")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    if not get_local_ai_settings()["configured"]:
        flash("Content Brief saved. Connect AI in Settings before generating a Content Plan.", "error")
        return redirect(url_for("ai_assistant.settings"), code=303)

    if request.form.get("provider_ack") != "on":
        flash("Content Brief saved. Confirm that the brief may be sent to the configured AI provider before generating a plan.", "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)
    if request.form.get("authority_ack") != "on":
        flash("Content Brief saved. Confirm that you are authorized to send the brief and that secrets have been removed.", "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    preflight = brief_preflight(record)
    if preflight["warnings"] and request.form.get("sensitive_ack") != "on":
        labels = ", ".join(preflight["warnings"])
        flash(
            f"Content Brief saved. Local preflight noticed potentially sensitive markers ({labels}). Review the brief and confirm the additional acknowledgement before generating a plan.",
            "error",
        )
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    try:
        generate_plan(brief_id)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    flash("AI Content Plan created privately from the approved brief. No public portfolio files were created or changed.", "success")
    return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)


@create_content_bp.post("/briefs/<brief_id>/delete")
def remove_brief(brief_id: str):
    try:
        delete_brief(brief_id)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.workspace"), code=303)

    flash("Private Content Brief deleted. No public portfolio files were changed.", "success")
    return redirect(url_for("create_content.workspace"), code=303)
