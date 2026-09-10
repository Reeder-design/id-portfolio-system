from __future__ import annotations

from pathlib import Path
import sys

from flask import Blueprint, flash, redirect, render_template, request, send_file, url_for
from werkzeug.utils import secure_filename

from content_routes import load_project, list_projects, refresh_docs, run_command, write_json


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
PUBLIC_ASSET_ROOT = REPO_ROOT / "portfolio" / "assets" / "project-assets"

ALLOWED_EXTENSIONS = {
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".webp": "image",
    ".gif": "image",
    ".mp4": "video",
    ".webm": "video",
    ".pdf": "pdf",
    ".docx": "document",
    ".pptx": "document",
    ".xlsx": "document",
}

asset_bp = Blueprint("assets", __name__)


def allowed_asset(filename: str) -> tuple[str, str]:
    cleaned = secure_filename(filename or "")
    if not cleaned:
        raise ValueError("Choose a file first.")

    extension = Path(cleaned).suffix.lower()
    asset_type = ALLOWED_EXTENSIONS.get(extension)
    if asset_type is None:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise ValueError(
            f"Unsupported file type {extension or '(none)'}. Allowed: {allowed}."
        )

    return cleaned, asset_type


def project_asset_directory(project_id: str) -> Path:
    directory = (PUBLIC_ASSET_ROOT / project_id).resolve()
    root = PUBLIC_ASSET_ROOT.resolve()
    if directory.parent != root:
        raise ValueError("Invalid project asset directory.")
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def unique_destination(directory: Path, filename: str) -> Path:
    candidate = directory / filename
    if not candidate.exists():
        return candidate

    stem = candidate.stem
    suffix = candidate.suffix
    counter = 2
    while True:
        candidate = directory / f"{stem}-{counter}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def resolve_asset_path(asset: dict) -> Path:
    stored = str(asset.get("path", "")).strip()
    if not stored:
        raise ValueError("Asset path is missing.")

    relative = Path(stored)
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError("Asset path is not safe.")

    path = (REPO_ROOT / relative).resolve()
    root = PUBLIC_ASSET_ROOT.resolve()
    if root not in path.parents:
        raise ValueError("Asset is outside the managed public asset library.")
    return path


def load_asset(project_id: str, asset_index: int) -> tuple[dict, Path, dict]:
    project, project_path = load_project(project_id)
    assets = project.get("assets", [])
    if asset_index < 0 or asset_index >= len(assets):
        raise IndexError("Asset not found.")
    return project, project_path, assets[asset_index]


def validate_project_change(project_path: Path, original_text: str) -> tuple[bool, str]:
    valid, output = run_command([sys.executable, "scripts/check-content.py"])
    if not valid:
        project_path.write_text(original_text, encoding="utf-8")
        return False, (
            "Structured-content validation failed and the asset change was rolled back."
            + (f"\n\n{output}" if output else "")
        )

    docs_ok, docs_output = refresh_docs()
    if not docs_ok:
        project_path.write_text(original_text, encoding="utf-8")
        refresh_docs()
        return False, (
            "Documentation refresh failed and the asset change was rolled back."
            + (f"\n\n{docs_output}" if docs_output else "")
        )

    return True, ""


def require_public_safe_confirmation() -> None:
    if request.form.get("public_safe") != "on":
        raise ValueError(
            "Confirm that the file is public-safe before copying it into portfolio/."
        )


@asset_bp.route("/assets")
def asset_library():
    projects = list_projects()
    selected_id = request.args.get("project", "").strip()
    selected_project = None

    if selected_id:
        try:
            selected_project, _ = load_project(selected_id)
        except FileNotFoundError:
            flash("That project could not be found.", "error")
    elif projects:
        selected_project, _ = load_project(projects[0]["id"])

    return render_template(
        "assets.html",
        projects=projects,
        selected_project=selected_project,
        allowed_extensions=sorted(ALLOWED_EXTENSIONS),
    )


@asset_bp.route("/assets/projects/<project_id>/upload", methods=["POST"])
def upload_asset(project_id: str):
    destination = None
    project_path = None
    original_text = None

    try:
        require_public_safe_confirmation()
        project, project_path = load_project(project_id)
        original_text = project_path.read_text(encoding="utf-8")

        upload = request.files.get("asset_file")
        if upload is None:
            raise ValueError("Choose a file first.")

        filename, asset_type = allowed_asset(upload.filename or "")
        alt = request.form.get("alt", "").strip()
        caption = request.form.get("caption", "").strip()

        if asset_type == "image" and not alt:
            raise ValueError("Image assets require alt text for accessibility.")

        directory = project_asset_directory(project_id)
        destination = unique_destination(directory, filename)
        upload.save(destination)

        asset = {
            "type": asset_type,
            "path": destination.relative_to(REPO_ROOT).as_posix(),
            "publish": True,
        }
        if alt:
            asset["alt"] = alt
        if caption:
            asset["caption"] = caption

        project.setdefault("assets", []).append(asset)
        write_json(project_path, project)

        ok, message = validate_project_change(project_path, original_text)
        if not ok:
            if destination.exists():
                destination.unlink()
            raise RuntimeError(message)

        flash(
            "Public asset added and associated with the project. It is local only until you commit, push, review, and merge the branch.",
            "success",
        )
    except Exception as exc:
        if destination is not None and destination.exists() and original_text is not None and project_path is not None:
            try:
                if project_path.read_text(encoding="utf-8") == original_text:
                    destination.unlink()
            except OSError:
                pass
        flash(f"Could not add asset: {exc}", "error")

    return redirect(url_for("assets.asset_library", project=project_id))


@asset_bp.route("/assets/projects/<project_id>/<int:asset_index>/metadata", methods=["POST"])
def update_asset_metadata(project_id: str, asset_index: int):
    try:
        project, project_path, asset = load_asset(project_id, asset_index)
        original_text = project_path.read_text(encoding="utf-8")

        alt = request.form.get("alt", "").strip()
        caption = request.form.get("caption", "").strip()
        if asset.get("type") == "image" and not alt:
            raise ValueError("Image assets require alt text for accessibility.")

        if alt:
            asset["alt"] = alt
        else:
            asset.pop("alt", None)

        if caption:
            asset["caption"] = caption
        else:
            asset.pop("caption", None)

        write_json(project_path, project)
        ok, message = validate_project_change(project_path, original_text)
        if not ok:
            raise RuntimeError(message)

        flash("Asset metadata saved and documentation refreshed.", "success")
    except Exception as exc:
        flash(f"Could not update asset metadata: {exc}", "error")

    return redirect(url_for("assets.asset_library", project=project_id))


@asset_bp.route("/assets/projects/<project_id>/<int:asset_index>/replace", methods=["POST"])
def replace_asset(project_id: str, asset_index: int):
    try:
        require_public_safe_confirmation()
        _, _, asset = load_asset(project_id, asset_index)
        path = resolve_asset_path(asset)
        if not path.exists():
            raise FileNotFoundError("The existing asset file is missing.")

        upload = request.files.get("replacement_file")
        if upload is None:
            raise ValueError("Choose a replacement file first.")

        filename, _ = allowed_asset(upload.filename or "")
        if Path(filename).suffix.lower() != path.suffix.lower():
            raise ValueError(
                f"Replacement must use the same {path.suffix.lower()} extension so existing page references keep working."
            )

        original_bytes = path.read_bytes()
        upload.save(path)

        site_ok, site_output = run_command([
            sys.executable,
            "scripts/check-site.py",
        ])
        if not site_ok:
            path.write_bytes(original_bytes)
            raise RuntimeError(
                "Site validation failed, so the original asset file was restored."
                + (f"\n\n{site_output}" if site_output else "")
            )

        flash(
            "Asset file replaced in place. Its public path stayed the same. Nothing was committed or published.",
            "success",
        )
    except Exception as exc:
        flash(f"Could not replace asset: {exc}", "error")

    return redirect(url_for("assets.asset_library", project=project_id))


@asset_bp.route("/assets/projects/<project_id>/<int:asset_index>/remove", methods=["POST"])
def remove_asset(project_id: str, asset_index: int):
    try:
        project, project_path, asset = load_asset(project_id, asset_index)
        original_text = project_path.read_text(encoding="utf-8")
        path = resolve_asset_path(asset)
        original_bytes = path.read_bytes() if path.exists() else None

        project["assets"].pop(asset_index)
        write_json(project_path, project)
        if path.exists():
            path.unlink()

        content_ok, content_output = run_command([sys.executable, "scripts/check-content.py"])
        site_ok, site_output = run_command([sys.executable, "scripts/check-site.py"])
        if not content_ok or not site_ok:
            project_path.write_text(original_text, encoding="utf-8")
            if original_bytes is not None:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(original_bytes)
            details = "\n\n".join(value for value in [content_output, site_output] if value)
            raise RuntimeError(
                "Validation found that removing this asset would leave the portfolio in an invalid state, so the removal was rolled back."
                + (f"\n\n{details}" if details else "")
            )

        docs_ok, docs_output = refresh_docs()
        if not docs_ok:
            project_path.write_text(original_text, encoding="utf-8")
            if original_bytes is not None:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(original_bytes)
            refresh_docs()
            raise RuntimeError(
                "Documentation refresh failed, so the removal was rolled back."
                + (f"\n\n{docs_output}" if docs_output else "")
            )

        try:
            if path.parent.exists() and not any(path.parent.iterdir()):
                path.parent.rmdir()
        except OSError:
            pass

        flash("Asset removed from the project and public asset library.", "success")
    except Exception as exc:
        flash(f"Could not remove asset: {exc}", "error")

    return redirect(url_for("assets.asset_library", project=project_id))


@asset_bp.route("/assets/projects/<project_id>/<int:asset_index>/preview")
def preview_asset(project_id: str, asset_index: int):
    try:
        _, _, asset = load_asset(project_id, asset_index)
        path = resolve_asset_path(asset)
        if not path.exists() or not path.is_file():
            raise FileNotFoundError("Asset file is missing.")
        return send_file(path, as_attachment=False, conditional=True)
    except Exception as exc:
        flash(f"Could not preview asset: {exc}", "error")
        return redirect(url_for("assets.asset_library", project=project_id))
