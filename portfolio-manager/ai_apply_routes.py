from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, url_for

from ai_service import AIServiceError
from page_ai_service import (
    apply_page_edit_proposal,
    delete_page_edit_proposal,
    list_page_edit_proposals,
    revert_page_edit_proposal,
)


ai_apply_bp = Blueprint("ai_apply", __name__, url_prefix="/ai/page-edit/proposals")


def _proposal_redirect(proposal_id: str):
    return redirect(
        url_for("ai_assistant.page_edit_proposal", proposal_id=proposal_id),
        code=303,
    )


@ai_apply_bp.get("/")
def history():
    status = request.args.get("status", "").strip() or None
    try:
        proposals = list_page_edit_proposals(status)
    except AIServiceError as exc:
        flash(str(exc), "error")
        proposals = list_page_edit_proposals()
        status = None

    return render_template(
        "page-ai-history.html",
        proposals=proposals,
        selected_status=status or "all",
    )


@ai_apply_bp.post("/<proposal_id>/apply")
def apply_page_edit(proposal_id: str):
    if request.form.get("public_safe") != "on":
        flash(
            "Confirm that the reviewed AI edit is safe for the public portfolio before applying it locally.",
            "error",
        )
        return _proposal_redirect(proposal_id)

    try:
        apply_page_edit_proposal(proposal_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
    else:
        flash(
            "AI proposal applied locally. Full validation passed. Review the local page preview before deciding whether to keep or publish the change.",
            "success",
        )
    return _proposal_redirect(proposal_id)


@ai_apply_bp.post("/<proposal_id>/revert")
def revert_page_edit(proposal_id: str):
    try:
        revert_page_edit_proposal(proposal_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
    else:
        flash(
            "AI page edit reverted locally. Full validation passed and the pre-apply page state was restored.",
            "success",
        )

    # Revert always returns to the proposal so the user can explicitly choose
    # whether to delete or keep the now-reverted record.
    return _proposal_redirect(proposal_id)


@ai_apply_bp.post("/<proposal_id>/delete")
def remove_page_edit_proposal(proposal_id: str):
    return_to = request.form.get("return_to", "history").strip()
    try:
        delete_page_edit_proposal(proposal_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
        return _proposal_redirect(proposal_id)

    flash("Private AI page-edit proposal and its recovery backup were deleted.", "success")
    if return_to == "proposal-history":
        return redirect(url_for("ai_apply.history"), code=303)
    return redirect(url_for("ai_apply.history"), code=303)
