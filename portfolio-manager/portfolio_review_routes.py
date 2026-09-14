from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, url_for

from ai_service import AIServiceError
from ai_settings_service import get_local_ai_settings
from portfolio_review_service import (
    delete_portfolio_review,
    generate_portfolio_review,
    list_portfolio_reviews,
    load_portfolio_review,
    save_portfolio_review,
)


portfolio_review_bp = Blueprint("portfolio_review", __name__, url_prefix="/manage/ai-review")


@portfolio_review_bp.get("/")
def workspace():
    return render_template(
        "portfolio-ai-review.html",
        settings=get_local_ai_settings(),
        reviews=list_portfolio_reviews(),
    )


@portfolio_review_bp.post("/run")
def run_review():
    if request.form.get("provider_ack") != "on":
        flash("Confirm that the public portfolio content may be sent to the configured AI provider for review.", "error")
        return redirect(url_for("portfolio_review.workspace"))

    if not get_local_ai_settings()["configured"]:
        flash("Connect AI in Settings before running a portfolio review.", "error")
        return redirect(url_for("ai_assistant.settings"))

    focus = request.form.get("focus", "").strip()
    if len(focus) > 1200:
        flash("Keep the optional review focus under 1,200 characters.", "error")
        return redirect(url_for("portfolio_review.workspace"))

    try:
        result, snapshot = generate_portfolio_review(focus)
        record = save_portfolio_review(result, snapshot, focus)
    except AIServiceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("portfolio_review.workspace"))

    flash("AI portfolio review completed and saved privately. No portfolio or Git files were changed.", "success")
    return redirect(url_for("portfolio_review.review", review_id=record["id"]), code=303)


@portfolio_review_bp.get("/reviews/<review_id>")
def review(review_id: str):
    try:
        record = load_portfolio_review(review_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
        return redirect(url_for("portfolio_review.workspace"))
    return render_template("portfolio-ai-review-result.html", record=record)


@portfolio_review_bp.post("/reviews/<review_id>/delete")
def delete_review(review_id: str):
    try:
        delete_portfolio_review(review_id)
    except AIServiceError as exc:
        flash(str(exc), "error")
    else:
        flash("Private AI portfolio review deleted. Portfolio files were not changed.", "success")
    return redirect(url_for("portfolio_review.workspace"), code=303)
