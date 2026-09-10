from flask import Flask, render_template, request, redirect, url_for, flash
from content_routes import content_bp
from pathlib import Path
from datetime import datetime
import subprocess
import json
import os
import re
import shutil


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent

PORTFOLIO_ROOT = REPO_ROOT / "portfolio"
PROJECTS_ROOT = PORTFOLIO_ROOT / "projects"

DATA_ROOT = REPO_ROOT / "portfolio-data"
REQUESTS_ROOT = DATA_ROOT / "dashboard-requests"
UPLOADS_ROOT = DATA_ROOT / "dashboard-uploads"
VERSION_FILE = DATA_ROOT / "version.json"

REQUESTS_ROOT.mkdir(parents=True, exist_ok=True)
UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.secret_key = "portfolio-manager-local-dev-key"

app.register_blueprint(content_bp)

def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "untitled"


def load_version_data():
    if VERSION_FILE.exists():
        try:
            return json.loads(VERSION_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {
                "current_version": "unknown",
                "history": []
            }
    return {
        "current_version": "not-set",
        "history": []
    }


def get_recent_requests(limit=8):
    files = sorted(REQUESTS_ROOT.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    requests_list = []

    for file_path in files[:limit]:
        try:
            payload = json.loads(file_path.read_text(encoding="utf-8"))
            requests_list.append(payload)
        except Exception:
            continue

    return requests_list


def scan_project_categories():
    categories = []
    if not PROJECTS_ROOT.exists():
        return categories

    for category_dir in sorted([p for p in PROJECTS_ROOT.iterdir() if p.is_dir()]):
        child_pages = []

        for child in sorted([p for p in category_dir.iterdir() if p.is_dir()]):
            index_file = child / "index.html"
            if index_file.exists():
                child_pages.append({
                    "name": child.name.replace("-", " ").title(),
                    "slug": child.name,
                    "path": str(index_file.relative_to(REPO_ROOT))
                })

        category_index = category_dir / "index.html"

        categories.append({
            "name": category_dir.name.replace("-", " ").title(),
            "slug": category_dir.name,
            "index_exists": category_index.exists(),
            "index_path": str(category_index.relative_to(REPO_ROOT)) if category_index.exists() else "Missing index.html",
            "count": len(child_pages),
            "children": child_pages
        })

    return categories


def count_portfolio_pages():
    return len(list(PORTFOLIO_ROOT.rglob("index.html"))) if PORTFOLIO_ROOT.exists() else 0


def run_command(command_list):
    try:
        result = subprocess.run(
            command_list,
            cwd=REPO_ROOT,
            capture_output=True,
            text=True
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "code": result.returncode
        }
    except Exception as exc:
        return {
            "success": False,
            "stdout": "",
            "stderr": str(exc),
            "code": 1
        }


@app.route("/")
def dashboard():
    version_data = load_version_data()
    categories = scan_project_categories()
    recent_requests = get_recent_requests()

    context = {
        "repo_name": REPO_ROOT.name,
        "version": version_data.get("current_version", "unknown"),
        "history": version_data.get("history", [])[:5],
        "categories": categories,
        "recent_requests": recent_requests,
        "page_count": count_portfolio_pages()
    }
    return render_template("dashboard.html", **context)


@app.route("/submit-edit-request", methods=["POST"])
def submit_edit_request():
    page_area = request.form.get("page_area", "").strip()
    edit_type = request.form.get("edit_type", "").strip()
    request_title = request.form.get("request_title", "").strip()
    instructions = request.form.get("instructions", "").strip()
    priority = request.form.get("priority", "normal").strip()

    if not request_title or not instructions:
        flash("Please add a request title and instructions.", "error")
        return redirect(url_for("dashboard"))

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    request_id = f"edit-{timestamp}-{slugify(request_title)}"

    upload_paths = []
    uploaded_files = request.files.getlist("support_files")

    request_upload_dir = UPLOADS_ROOT / request_id
    request_upload_dir.mkdir(parents=True, exist_ok=True)

    for file in uploaded_files:
        if file and file.filename:
            safe_name = Path(file.filename).name
            destination = request_upload_dir / safe_name
            file.save(destination)
            upload_paths.append(str(destination.relative_to(REPO_ROOT)))

    payload = {
        "id": request_id,
        "type": "edit-request",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "page_area": page_area,
        "edit_type": edit_type,
        "request_title": request_title,
        "instructions": instructions,
        "priority": priority,
        "uploads": upload_paths,
        "status": "new"
    }

    output_file = REQUESTS_ROOT / f"{request_id}.json"
    output_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    flash("Edit request saved to portfolio-data/dashboard-requests.", "success")
    return redirect(url_for("dashboard"))


@app.route("/submit-new-content", methods=["POST"])
def submit_new_content():
    content_type = request.form.get("content_type", "").strip()
    parent_section = request.form.get("parent_section", "").strip()
    title = request.form.get("title", "").strip()
    slug = request.form.get("slug", "").strip()
    summary = request.form.get("summary", "").strip()
    goals = request.form.get("goals", "").strip()
    notes = request.form.get("notes", "").strip()

    if not title:
        flash("Please enter a title for the new content request.", "error")
        return redirect(url_for("dashboard"))

    if not slug:
        slug = slugify(title)
    else:
        slug = slugify(slug)

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    request_id = f"new-{timestamp}-{slug}"

    upload_paths = []
    uploaded_files = request.files.getlist("content_files")

    request_upload_dir = UPLOADS_ROOT / request_id
    request_upload_dir.mkdir(parents=True, exist_ok=True)

    for file in uploaded_files:
        if file and file.filename:
            safe_name = Path(file.filename).name
            destination = request_upload_dir / safe_name
            file.save(destination)
            upload_paths.append(str(destination.relative_to(REPO_ROOT)))

    payload = {
        "id": request_id,
        "type": "new-content-request",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "content_type": content_type,
        "parent_section": parent_section,
        "title": title,
        "slug": slug,
        "summary": summary,
        "goals": goals,
        "notes": notes,
        "uploads": upload_paths,
        "status": "new"
    }

    output_file = REQUESTS_ROOT / f"{request_id}.json"
    output_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    flash("New content request saved successfully.", "success")
    return redirect(url_for("dashboard"))


@app.route("/run-action", methods=["POST"])
def run_action():
    action = request.form.get("action", "").strip()

    if action == "validate":
        result = run_command(["python3", "scripts/check-site.py"])
        if result["success"]:
            flash("Portfolio validation passed.", "success")
        else:
            flash(f"Validation failed: {result['stderr'] or result['stdout']}", "error")

    elif action == "refresh_docs":
        result = run_command(["python3", "scripts/update-docs.py"])
        if result["success"]:
            flash("Documentation refreshed.", "success")
        else:
            flash(f"Documentation refresh failed: {result['stderr'] or result['stdout']}", "error")

    elif action in {"patch", "minor", "major"}:
        release_message = request.form.get("release_message", "").strip()
        if not release_message:
            flash("Please enter a release message before bumping the version.", "error")
            return redirect(url_for("dashboard"))

        result = run_command([
            "python3",
            "scripts/update-docs.py",
            "--bump", action,
            "--message", release_message
        ])

        if result["success"]:
            flash(f"{action.title()} version bump completed.", "success")
        else:
            flash(f"Version bump failed: {result['stderr'] or result['stdout']}", "error")

    else:
        flash("Unknown action.", "error")

    return redirect(url_for("dashboard"))


if __name__ == "__main__":
    app.run(debug=True)