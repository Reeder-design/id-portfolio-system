from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path
import json
import re
import subprocess
import sys

from flask import Flask, flash, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from asset_routes import asset_bp
from content_routes import content_bp
from git_routes import git_bp
from site_content_routes import site_content_bp
from security import csrf_token, is_safe_next_url, load_local_env, require_security_settings, validate_csrf


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
PORTFOLIO_ROOT = REPO_ROOT / "portfolio"
PROJECTS_ROOT = PORTFOLIO_ROOT / "projects"
DATA_ROOT = REPO_ROOT / "portfolio-data"
VERSION_FILE = DATA_ROOT / "version.json"

PRIVATE_ROOT = REPO_ROOT / ".portfolio-manager"
REQUESTS_ROOT = PRIVATE_ROOT / "requests"
UPLOADS_ROOT = PRIVATE_ROOT / "uploads"
TEMP_ROOT = PRIVATE_ROOT / "temp"
BACKUPS_ROOT = PRIVATE_ROOT / "backups"

for directory in (REQUESTS_ROOT, UPLOADS_ROOT, TEMP_ROOT, BACKUPS_ROOT):
    directory.mkdir(parents=True, exist_ok=True)

load_local_env()
SECRET_KEY, PASSWORD_HASH = require_security_settings()

app = Flask(__name__)
app.secret_key = SECRET_KEY
app.config.update(
    MAX_CONTENT_LENGTH=25 * 1024 * 1024,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_NAME="portfolio_manager_session",
    SESSION_COOKIE_SAMESITE="Strict",
    SESSION_COOKIE_SECURE=False,  # localhost uses HTTP
    TRUSTED_HOSTS=["127.0.0.1", "localhost"],
)
app.register_blueprint(content_bp)
app.register_blueprint(asset_bp)
app.register_blueprint(site_content_bp)
app.register_blueprint(git_bp)
app.jinja_env.globals["csrf_token"] = csrf_token

PUBLIC_ENDPOINTS = {"login", "static"}


@app.before_request
def protect_manager():
    if request.method == "POST":
        validate_csrf()

    endpoint = request.endpoint or ""
    if endpoint in PUBLIC_ENDPOINTS:
        return None

    if not session.get("portfolio_manager_authenticated"):
        return redirect(url_for("login", next=request.full_path if request.query_string else request.path))

    return None


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "untitled"


def load_version_data() -> dict:
    if VERSION_FILE.exists():
        try:
            return json.loads(VERSION_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {"current_version": "unknown", "history": []}
    return {"current_version": "not-set", "history": []}


def get_recent_requests(limit: int = 8) -> list[dict]:
    files = sorted(
        REQUESTS_ROOT.glob("*.json"),
        key=lambda path: path.stat().st_mtime,
        reverse=True,
    )
    items: list[dict] = []
    for file_path in files[:limit]:
        try:
            items.append(json.loads(file_path.read_text(encoding="utf-8")))
        except Exception:
            continue
    return items


def scan_project_categories() -> list[dict]:
    categories: list[dict] = []
    if not PROJECTS_ROOT.exists():
        return categories

    for category_dir in sorted(path for path in PROJECTS_ROOT.iterdir() if path.is_dir()):
        child_pages = []
        for child in sorted(path for path in category_dir.iterdir() if path.is_dir()):
            index_file = child / "index.html"
            if index_file.exists():
                child_pages.append({
                    "name": child.name.replace("-", " ").title(),
                    "slug": child.name,
                    "path": str(index_file.relative_to(REPO_ROOT)),
                })

        category_index = category_dir / "index.html"
        categories.append({
            "name": category_dir.name.replace("-", " ").title(),
            "slug": category_dir.name,
            "index_exists": category_index.exists(),
            "index_path": str(category_index.relative_to(REPO_ROOT)) if category_index.exists() else "Missing index.html",
            "count": len(child_pages),
            "children": child_pages,
        })
    return categories


def count_portfolio_pages() -> int:
    return len(list(PORTFOLIO_ROOT.rglob("index.html"))) if PORTFOLIO_ROOT.exists() else 0


def run_command(command_list: list[str]) -> dict:
    try:
        result = subprocess.run(
            command_list,
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "code": result.returncode,
        }
    except Exception as exc:
        return {"success": False, "stdout": "", "stderr": str(exc), "code": 1}


def run_full_validation() -> tuple[bool, str]:
    commands = [
        ("Public site", [sys.executable, "scripts/check-site.py"]),
        ("Structured content", [sys.executable, "scripts/check-content.py"]),
        ("General site content", [sys.executable, "scripts/check-site-content.py"]),
        ("Project renderer", [sys.executable, "scripts/check-renderer.py"]),
        ("Project generator", [sys.executable, "scripts/check-new-project.py"]),
        ("Documentation versioning", [sys.executable, "scripts/check-docs.py"]),
        ("Generated documentation", [sys.executable, "scripts/update-docs.py", "--check"]),
        ("Git workflow safety", [sys.executable, "scripts/check-git-workflow.py"]),
        ("Portfolio Manager security", [sys.executable, "scripts/check-portfolio-manager.py"]),
        ("Portfolio Manager runtime", [sys.executable, "scripts/check-portfolio-manager-runtime.py"]),
    ]
    results = []
    for label, command in commands:
        result = run_command(command)
        results.append(f"{label}: {'PASS' if result['success'] else 'FAIL'}")
        if not result["success"]:
            details = result["stderr"] or result["stdout"]
            if details:
                results.append(details[-1800:])
            return False, "\n".join(results)
    return True, "\n".join(results)


def save_uploaded_files(files, request_id: str) -> list[str]:
    upload_paths: list[str] = []
    request_upload_dir = UPLOADS_ROOT / request_id
    request_upload_dir.mkdir(parents=True, exist_ok=True)

    for uploaded in files:
        if not uploaded or not uploaded.filename:
            continue
        safe_name = secure_filename(Path(uploaded.filename).name)
        if not safe_name:
            continue
        destination = request_upload_dir / safe_name
        uploaded.save(destination)
        upload_paths.append(str(destination.relative_to(REPO_ROOT)))
    return upload_paths


@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("portfolio_manager_authenticated"):
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        password = request.form.get("password", "")
        if check_password_hash(PASSWORD_HASH, password):
            session.clear()
            session["portfolio_manager_authenticated"] = True
            session.permanent = True
            csrf_token()
            target = request.form.get("next", "")
            flash("Signed in to Portfolio Manager.", "success")
            return redirect(target if is_safe_next_url(target) else url_for("dashboard"))
        flash("Incorrect password.", "error")

    return render_template("login.html", next=request.args.get("next", ""))


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    flash("Signed out.", "success")
    return redirect(url_for("login"))


@app.route("/help")
def help_page():
    return render_template("help.html")


@app.route("/")
def dashboard():
    version_data = load_version_data()
    return render_template(
        "dashboard.html",
        repo_name=REPO_ROOT.name,
        version=version_data.get("current_version", "unknown"),
        history=version_data.get("history", [])[:5],
        categories=scan_project_categories(),
        recent_requests=get_recent_requests(),
        page_count=count_portfolio_pages(),
        private_workspace=str(PRIVATE_ROOT.relative_to(REPO_ROOT)),
    )


@app.route("/submit-edit-request", methods=["POST"])
def submit_edit_request():
    request_title = request.form.get("request_title", "").strip()
    instructions = request.form.get("instructions", "").strip()
    if not request_title or not instructions:
        flash("Please add a request title and instructions.", "error")
        return redirect(url_for("dashboard"))

    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    request_id = f"edit-{timestamp}-{slugify(request_title)}"
    upload_paths = save_uploaded_files(request.files.getlist("support_files"), request_id)

    payload = {
        "id": request_id,
        "type": "edit-request",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "page_area": request.form.get("page_area", "").strip(),
        "edit_type": request.form.get("edit_type", "").strip(),
        "request_title": request_title,
        "instructions": instructions,
        "priority": request.form.get("priority", "normal").strip(),
        "uploads": upload_paths,
        "status": "new",
    }
    (REQUESTS_ROOT / f"{request_id}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    flash("Edit request saved in the private local Portfolio Manager workspace.", "success")
    return redirect(url_for("dashboard"))


@app.route("/submit-new-content", methods=["POST"])
def submit_new_content():
    title = request.form.get("title", "").strip()
    if not title:
        flash("Please enter a title for the new content request.", "error")
        return redirect(url_for("dashboard"))

    slug = slugify(request.form.get("slug", "").strip() or title)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    request_id = f"new-{timestamp}-{slug}"
    upload_paths = save_uploaded_files(request.files.getlist("content_files"), request_id)

    payload = {
        "id": request_id,
        "type": "new-content-request",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "content_type": request.form.get("content_type", "").strip(),
        "parent_section": request.form.get("parent_section", "").strip(),
        "title": title,
        "slug": slug,
        "summary": request.form.get("summary", "").strip(),
        "goals": request.form.get("goals", "").strip(),
        "notes": request.form.get("notes", "").strip(),
        "uploads": upload_paths,
        "status": "new",
    }
    (REQUESTS_ROOT / f"{request_id}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
    flash("New content request saved in the private local Portfolio Manager workspace.", "success")
    return redirect(url_for("dashboard"))


@app.route("/run-action", methods=["POST"])
def run_action():
    action = request.form.get("action", "").strip()

    if action == "validate":
        success, output = run_full_validation()
        flash("Full validation passed." if success else f"Validation failed:\n{output}", "success" if success else "error")

    elif action == "refresh_docs":
        result = run_command([sys.executable, "scripts/update-docs.py"])
        if result["success"]:
            flash("Generated portfolio documentation refreshed. Public HTML was not regenerated.", "success")
        else:
            flash(f"Documentation refresh failed: {result['stderr'] or result['stdout']}", "error")

    elif action in {"patch", "minor", "major"}:
        release_message = request.form.get("release_message", "").strip()
        if not release_message:
            flash("Please enter a release message before bumping the version.", "error")
            return redirect(url_for("dashboard"))
        result = run_command([
            sys.executable,
            "scripts/update-docs.py",
            "--bump", action,
            "--message", release_message,
        ])
        if result["success"]:
            flash(f"{action.title()} version release recorded locally. Nothing was committed or published.", "success")
        else:
            flash(f"Version bump failed: {result['stderr'] or result['stdout']}", "error")

    else:
        flash("Unknown action.", "error")

    return redirect(url_for("dashboard"))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5055, debug=False)
