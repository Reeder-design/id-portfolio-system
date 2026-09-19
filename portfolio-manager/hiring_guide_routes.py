from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, send_file, url_for

from hiring_guide_service import (
    ALLOWED_EVIDENCE_STATUSES,
    HiringGuideLibraryError,
    backup_count,
    create_qa,
    delete_qa,
    export_path,
    get_evidence,
    get_qa,
    import_library,
    library_exists,
    library_summary,
    list_qa,
    load_library,
    markdown_path,
    qa_evidence_records,
    source_markdown_exists,
    update_evidence,
    update_qa,
)


hiring_guide_bp = Blueprint("hiring_guide", __name__, url_prefix="/hiring-guide-library")


@hiring_guide_bp.get("/")
def workspace():
    if not library_exists():
        return render_template(
            "hiring-guide-library.html",
            library=None,
            summary=None,
            records=[],
            source_markdown=False,
            backups=0,
            filters={},
        )

    try:
        library = load_library()
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return render_template(
            "hiring-guide-library.html",
            library=None,
            summary=None,
            records=[],
            source_markdown=source_markdown_exists(),
            backups=backup_count(),
            filters={},
        )

    filters = {
        "q": request.args.get("q", "").strip(),
        "category": request.args.get("category", "").strip(),
        "confidence": request.args.get("confidence", "").strip(),
        "evidence_status": request.args.get("evidence_status", "").strip(),
    }
    records = list_qa(
        library,
        query=filters["q"],
        category=filters["category"],
        confidence=filters["confidence"],
        evidence_status=filters["evidence_status"],
    )
    return render_template(
        "hiring-guide-library.html",
        library=library,
        summary=library_summary(library),
        records=records,
        source_markdown=source_markdown_exists(),
        backups=backup_count(),
        filters=filters,
        evidence_statuses=sorted(ALLOWED_EVIDENCE_STATUSES),
    )


@hiring_guide_bp.post("/import")
def import_source():
    try:
        library = import_library(
            request.files.get("json_file"),
            request.files.get("markdown_file"),
        )
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
    else:
        summary = library_summary(library)
        flash(
            f"Private Hiring Guide library imported: {summary['qa_count']} Q&A records and {summary['evidence_count']} evidence records. Nothing was written to the public portfolio.",
            "success",
        )
    return redirect(url_for("hiring_guide.workspace"), code=303)


@hiring_guide_bp.get("/export")
def export_json():
    try:
        path = export_path()
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("hiring_guide.workspace"))
    return send_file(
        path,
        as_attachment=True,
        download_name="haley_hiring_guide_qa_library.json",
        mimetype="application/json",
        max_age=0,
        conditional=True,
    )


@hiring_guide_bp.get("/source-markdown")
def export_markdown():
    try:
        path = markdown_path()
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("hiring_guide.workspace"))
    return send_file(
        path,
        as_attachment=True,
        download_name="haley_hiring_guide_qa_library.md",
        mimetype="text/markdown",
        max_age=0,
        conditional=True,
    )


@hiring_guide_bp.get("/qa/new")
def new_qa():
    try:
        library = load_library()
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("hiring_guide.workspace"))
    return render_template(
        "hiring-guide-editor.html",
        mode="new",
        record=None,
        evidence=library.get("evidence", []),
        linked_evidence=[],
    )


@hiring_guide_bp.post("/qa/new")
def create_qa_record():
    try:
        record = create_qa(request.form)
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("hiring_guide.new_qa"), code=303)
    flash(f"Created {record['id']} in the private Hiring Guide library.", "success")
    return redirect(url_for("hiring_guide.edit_qa", qa_id=record["id"]), code=303)


@hiring_guide_bp.get("/qa/<qa_id>")
def edit_qa(qa_id: str):
    try:
        library = load_library()
        record = get_qa(library, qa_id)
        linked = qa_evidence_records(library, record)
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("hiring_guide.workspace"))
    return render_template(
        "hiring-guide-editor.html",
        mode="edit",
        record=record,
        evidence=library.get("evidence", []),
        linked_evidence=linked,
    )


@hiring_guide_bp.post("/qa/<qa_id>")
def save_qa(qa_id: str):
    try:
        update_qa(qa_id, request.form)
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
    else:
        flash(f"Saved {qa_id}. A private backup of the previous library version was created.", "success")
    return redirect(url_for("hiring_guide.edit_qa", qa_id=qa_id), code=303)


@hiring_guide_bp.post("/qa/<qa_id>/delete")
def remove_qa(qa_id: str):
    if request.form.get("confirm_id", "").strip() != qa_id:
        flash("Type the exact Q&A ID to confirm deletion.", "error")
        return redirect(url_for("hiring_guide.edit_qa", qa_id=qa_id), code=303)
    try:
        delete_qa(qa_id)
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("hiring_guide.edit_qa", qa_id=qa_id), code=303)
    flash(f"Deleted {qa_id}. The previous library version remains in private backups.", "success")
    return redirect(url_for("hiring_guide.workspace"), code=303)


@hiring_guide_bp.get("/evidence/<evidence_id>")
def edit_evidence(evidence_id: str):
    try:
        library = load_library()
        record = get_evidence(library, evidence_id)
        used_by = [
            item
            for item in library.get("qa", [])
            if evidence_id in item.get("evidence_ids", [])
        ]
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("hiring_guide.workspace"))
    return render_template(
        "hiring-guide-evidence.html",
        record=record,
        used_by=used_by,
        statuses=sorted(ALLOWED_EVIDENCE_STATUSES),
    )


@hiring_guide_bp.post("/evidence/<evidence_id>")
def save_evidence(evidence_id: str):
    try:
        update_evidence(evidence_id, request.form)
    except HiringGuideLibraryError as exc:
        flash(str(exc), "error")
    else:
        flash(f"Saved evidence record {evidence_id}.", "success")
    return redirect(url_for("hiring_guide.edit_evidence", evidence_id=evidence_id), code=303)
