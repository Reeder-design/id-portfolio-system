from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, request, send_file, url_for

from reference_library_service import (
    ALLOWED_STATUSES,
    ReferenceLibraryError,
    create_reference_item,
    delete_reference_item,
    delete_sanitized_derivative,
    list_reference_items,
    load_reference_item,
    reference_file_path,
    save_sanitized_derivative,
    update_reference_item,
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
        delete_sanitized_derivative(item_id)
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
    else:
        flash("Sanitized Draft removed. The original private source was preserved unchanged.", "success")
    return redirect(url_for("reference_library.item", item_id=item_id), code=303)


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
        delete_reference_item(item_id)
    except ReferenceLibraryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("reference_library.item", item_id=item_id), code=303)

    flash("Private reference item and its stored files were deleted.", "success")
    return redirect(url_for("reference_library.workspace"), code=303)
