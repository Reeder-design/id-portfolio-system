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
from create_content_sources import (
    ContentSourceError,
    approved_source_context,
    list_approved_sources,
    save_brief_sources,
    source_ids_from_form,
)
from create_content_build_service import (
    CreateBuildError,
    apply_local_build,
    approve_plan,
    build_workspace_context,
    generate_build_proposal,
    keep_local_build,
    revert_local_build,
    revoke_plan_approval,
    save_build_proposal,
)
from create_publish_bridge_service import (
    CreatePublishBridgeError,
    publish_bridge_context,
    start_or_resume_publish_bridge,
)


create_content_bp = Blueprint("create_content", __name__, url_prefix="/create")


def _approved_options() -> list[dict]:
    try:
        return list_approved_sources()
    except ContentSourceError:
        return []


def _attached_ids(record: dict | None) -> list[str]:
    if not record:
        return []
    return [
        str(item.get("reference_id"))
        for item in record.get("approved_sources", [])
        if isinstance(item, dict) and item.get("reference_id")
    ]


@create_content_bp.get("/")
def workspace():
    return render_template(
        "create-content.html",
        briefs=list_briefs(),
        ai_settings=get_local_ai_settings(),
    )


@create_content_bp.get("/new")
def new_brief():
    options = _approved_options()
    requested_source = request.args.get("source", "").strip()
    approved_ids = {str(item.get("id")) for item in options}
    selected = [requested_source] if requested_source and requested_source in approved_ids else []
    if requested_source and not selected:
        flash("That Reference Library source is not currently approved for portfolio use.", "error")
    return render_template(
        "create-content-brief.html",
        record=None,
        fields={},
        preflight={"blocked": [], "warnings": [], "source_issues": []},
        ai_settings=get_local_ai_settings(),
        approved_sources=options,
        attached_source_ids=selected,
        source_context={"resolved": [], "issues": []},
    )


@create_content_bp.post("/new")
def create_new_brief():
    record = None
    try:
        record = create_brief(request.form)
        record = save_brief_sources(record["id"], source_ids_from_form(request.form))
    except (CreateContentError, ContentSourceError) as exc:
        if record:
            delete_brief(record["id"])
        flash(str(exc), "error")
        return render_template(
            "create-content-brief.html",
            record=None,
            fields=request.form,
            preflight={"blocked": [], "warnings": [], "source_issues": []},
            ai_settings=get_local_ai_settings(),
            approved_sources=_approved_options(),
            attached_source_ids=source_ids_from_form(request.form),
            source_context={"resolved": [], "issues": []},
        )

    flash("Content Brief saved privately with its approved source selections. Nothing was sent to AI or written to the public portfolio.", "success")
    return redirect(url_for("create_content.brief", brief_id=record["id"]), code=303)


@create_content_bp.get("/briefs/<brief_id>")
def brief(brief_id: str):
    try:
        record = load_brief(brief_id)
        preflight = brief_preflight(record)
        source_context = approved_source_context(record, strict=False)
    except (CreateContentError, ContentSourceError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.workspace"))

    return render_template(
        "create-content-brief.html",
        record=record,
        fields=record.get("fields", {}),
        preflight=preflight,
        ai_settings=get_local_ai_settings(),
        approved_sources=_approved_options(),
        attached_source_ids=_attached_ids(record),
        source_context=source_context,
    )


@create_content_bp.post("/briefs/<brief_id>/save")
def save_brief(brief_id: str):
    action = request.form.get("action", "save").strip()
    try:
        save_brief_fields(brief_id, request.form)
        record = save_brief_sources(brief_id, source_ids_from_form(request.form))
    except (CreateContentError, ContentSourceError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    if action != "generate-plan":
        flash("Content Brief and approved source selections saved privately. Nothing was sent to AI or written to the public portfolio.", "success")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    if not get_local_ai_settings()["configured"]:
        flash("Content Brief saved. Connect AI in Settings before generating a Content Plan.", "error")
        return redirect(url_for("ai_assistant.settings"), code=303)

    if request.form.get("provider_ack") != "on":
        flash("Content Brief saved. Confirm that the brief and attached approved sanitized source text may be sent to the configured AI provider before generating a plan.", "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)
    if request.form.get("authority_ack") != "on":
        flash("Content Brief saved. Confirm that you are authorized to send the brief and attached approved source context and that secrets have been removed.", "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    preflight = brief_preflight(record)
    if preflight.get("source_issues"):
        flash("Content Brief saved, but attached source context needs attention before AI planning: " + " ".join(preflight["source_issues"]), "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)
    if preflight["warnings"] and request.form.get("sensitive_ack") != "on":
        labels = ", ".join(preflight["warnings"])
        flash(
            f"Content Brief saved. Local preflight noticed potentially sensitive markers ({labels}). Review the brief and approved source context, then confirm the additional acknowledgement before generating a plan.",
            "error",
        )
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    try:
        generate_plan(brief_id)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)

    flash("AI Content Plan created privately from the approved brief and current approved source context. No public portfolio files were created or changed.", "success")
    return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)


@create_content_bp.get("/briefs/<brief_id>/build")
def build(brief_id: str):
    try:
        record = load_brief(brief_id)
        context = build_workspace_context(record)
        bridge = publish_bridge_context(brief_id)
    except (CreateContentError, CreateBuildError, CreatePublishBridgeError) as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)
    return render_template(
        "create-content-build.html",
        ai_settings=get_local_ai_settings(),
        publish_bridge=bridge,
        **context,
    )


@create_content_bp.post("/briefs/<brief_id>/build/approve-plan")
def approve_build_plan(brief_id: str):
    if request.form.get("plan_ack") != "on":
        flash("Confirm that you reviewed and approve the current Content Plan before moving into build generation.", "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)
    try:
        approve_plan(brief_id)
    except CreateBuildError as exc:
        flash(str(exc), "error")
    else:
        flash("Content Plan approved for build. No public portfolio files were created.", "success")
    return redirect(url_for("create_content.build", brief_id=brief_id), code=303)


@create_content_bp.post("/briefs/<brief_id>/build/revoke-plan")
def revoke_build_plan(brief_id: str):
    try:
        revoke_plan_approval(brief_id)
    except CreateBuildError as exc:
        flash(str(exc), "error")
    else:
        flash("Build approval removed. The Content Plan itself was not deleted.", "success")
    return redirect(url_for("create_content.build", brief_id=brief_id), code=303)


@create_content_bp.post("/briefs/<brief_id>/build/generate")
def generate_build(brief_id: str):
    if not get_local_ai_settings()["configured"]:
        flash("Connect AI in Settings before generating a build proposal.", "error")
        return redirect(url_for("ai_assistant.settings"), code=303)
    if request.form.get("provider_ack") != "on":
        flash("Confirm that the approved brief, plan, and approved sanitized source context may be sent to the configured AI provider.", "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)
    if request.form.get("authority_ack") != "on":
        flash("Confirm that you are authorized to send the approved build context to the configured AI provider.", "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)

    try:
        record = load_brief(brief_id)
        preflight = brief_preflight(record)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.brief", brief_id=brief_id), code=303)
    if preflight.get("warnings") and request.form.get("sensitive_ack") != "on":
        flash("Review the local sensitivity warnings and confirm the additional acknowledgement before generating a build proposal.", "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)

    try:
        generate_build_proposal(brief_id)
    except CreateBuildError as exc:
        flash(str(exc), "error")
    else:
        flash("AI build proposal created privately. Review and edit it before any portfolio files are created.", "success")
    return redirect(url_for("create_content.build", brief_id=brief_id), code=303)


@create_content_bp.post("/briefs/<brief_id>/build/save-proposal")
def save_build(brief_id: str):
    try:
        save_build_proposal(brief_id, request.form)
    except CreateBuildError as exc:
        flash(str(exc), "error")
    else:
        flash("Build proposal saved privately. No portfolio files were created.", "success")
    return redirect(url_for("create_content.build", brief_id=brief_id), code=303)


@create_content_bp.post("/briefs/<brief_id>/build/apply")
def apply_build(brief_id: str):
    if request.form.get("local_write_ack") != "on":
        flash("Confirm that you want Portfolio Manager to create the proposed project files locally.", "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)
    if request.form.get("public_safe_ack") != "on":
        flash("Confirm that you reviewed the build proposal for public-safety before creating local portfolio files.", "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)
    try:
        apply_local_build(brief_id)
    except CreateBuildError as exc:
        flash(str(exc), "error")
    else:
        flash("Local project created and full validation passed. Review the real local page before choosing Keep or Revert.", "success")
    return redirect(url_for("create_content.build", brief_id=brief_id), code=303)


def _continue_to_related_references(brief_id: str):
    try:
        bridge = start_or_resume_publish_bridge(brief_id)
    except CreatePublishBridgeError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)
    flash("Local build kept. Review Related References next; nothing has been committed or published.", "success")
    return redirect(
        url_for("related_references.review", review_id=bridge["related_references_review_id"]),
        code=303,
    )


@create_content_bp.post("/briefs/<brief_id>/build/keep")
def keep_build(brief_id: str):
    try:
        keep_local_build(brief_id)
    except CreateBuildError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.build", brief_id=brief_id), code=303)
    return _continue_to_related_references(brief_id)


@create_content_bp.post("/briefs/<brief_id>/build/related-references")
def continue_related_references(brief_id: str):
    return _continue_to_related_references(brief_id)


@create_content_bp.post("/briefs/<brief_id>/build/revert")
def revert_build(brief_id: str):
    try:
        revert_local_build(brief_id)
    except CreateBuildError as exc:
        flash(str(exc), "error")
    else:
        flash("Local build reverted. The private Content Brief and build proposal were preserved.", "success")
    return redirect(url_for("create_content.build", brief_id=brief_id), code=303)


@create_content_bp.post("/briefs/<brief_id>/delete")
def remove_brief(brief_id: str):
    try:
        delete_brief(brief_id)
    except CreateContentError as exc:
        flash(str(exc), "error")
        return redirect(url_for("create_content.workspace"), code=303)

    flash("Private Content Brief deleted. No public portfolio files were changed.", "success")
    return redirect(url_for("create_content.workspace"), code=303)
