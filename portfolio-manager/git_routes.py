from __future__ import annotations

from pathlib import Path, PurePosixPath
import subprocess
import sys

from flask import Blueprint, flash, redirect, render_template, request, url_for


REPO_ROOT = Path(__file__).resolve().parent.parent
BASE_BRANCH = "main"
BLOCKED_PATH_PREFIXES = (
    ".git",
    ".env",
    ".portfolio-manager",
    ".venv",
)
BLOCKED_FILE_SUFFIXES = (".pem", ".key", ".p12", ".pfx")
MAX_DIFF_CHARS = 30000


git_bp = Blueprint("git_workflow", __name__, url_prefix="/git")


def run_command(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )


def run_git(args: list[str]) -> subprocess.CompletedProcess[str]:
    return run_command(["git", *args])


def current_branch() -> str:
    result = run_git(["branch", "--show-current"])
    return result.stdout.strip() if result.returncode == 0 else ""


def repo_status_lines() -> list[str]:
    result = run_git(["status", "--porcelain=v1", "--untracked-files=all"])
    if result.returncode != 0:
        return []
    return [line for line in result.stdout.splitlines() if line.strip()]


def parse_status() -> list[dict]:
    items: list[dict] = []
    for line in repo_status_lines():
        if len(line) < 4:
            continue
        code = line[:2]
        raw_path = line[3:]
        display_path = raw_path
        path = raw_path.split(" -> ")[-1]
        items.append(
            {
                "code": code,
                "path": path,
                "display_path": display_path,
                "staged": code[0] not in {" ", "?"},
                "unstaged": code[1] != " " or code == "??",
                "untracked": code == "??",
                "conflict": code in {"DD", "AU", "UD", "UA", "DU", "AA", "UU"},
                "safe": is_safe_repo_path(path),
            }
        )
    return items


def is_safe_repo_path(path_value: str) -> bool:
    if not path_value or "\x00" in path_value:
        return False
    posix = PurePosixPath(path_value)
    if posix.is_absolute() or ".." in posix.parts:
        return False
    first = posix.parts[0] if posix.parts else ""
    if first in BLOCKED_PATH_PREFIXES or path_value == ".env":
        return False
    if path_value.lower().endswith(BLOCKED_FILE_SUFFIXES):
        return False
    return True


def working_tree_clean() -> bool:
    return not repo_status_lines()


def branch_tracking() -> dict:
    upstream_result = run_git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"])
    upstream = upstream_result.stdout.strip() if upstream_result.returncode == 0 else ""
    ahead = behind = None
    if upstream:
        count_result = run_git(["rev-list", "--left-right", "--count", f"{upstream}...HEAD"])
        if count_result.returncode == 0:
            parts = count_result.stdout.strip().split()
            if len(parts) == 2:
                behind, ahead = int(parts[0]), int(parts[1])
    return {"upstream": upstream, "ahead": ahead, "behind": behind}


def diff_preview(cached: bool = False) -> str:
    args = ["diff", "--no-ext-diff", "--unified=3"]
    if cached:
        args.append("--cached")
    result = run_git(args)
    text = result.stdout if result.returncode == 0 else ""
    if len(text) > MAX_DIFF_CHARS:
        return text[:MAX_DIFF_CHARS] + "\n\n… diff truncated in Portfolio Manager …"
    return text


def validation_suite() -> tuple[bool, str]:
    commands = [
        ("Public site", [sys.executable, "scripts/check-site.py"]),
        ("Structured content", [sys.executable, "scripts/check-content.py"]),
        ("General site content", [sys.executable, "scripts/check-site-content.py"]),
        ("Project renderer", [sys.executable, "scripts/check-renderer.py"]),
        ("Project generator", [sys.executable, "scripts/check-new-project.py"]),
        ("Documentation versioning", [sys.executable, "scripts/check-docs.py"]),
        ("Generated documentation", [sys.executable, "scripts/update-docs.py", "--check"]),
        ("Git workflow safety", [sys.executable, "scripts/check-git-workflow.py"]),
        ("AI assistance safety", [sys.executable, "scripts/check-ai-assistance.py"]),
        ("Portfolio Manager security", [sys.executable, "scripts/check-portfolio-manager.py"]),
        ("Portfolio Manager runtime", [sys.executable, "scripts/check-portfolio-manager-runtime.py"]),
    ]
    output: list[str] = []
    for label, command in commands:
        result = run_command(command)
        output.append(f"{label}: {'PASS' if result.returncode == 0 else 'FAIL'}")
        if result.returncode != 0:
            details = (result.stderr or result.stdout).strip()
            if details:
                output.append(details[-1800:])
            return False, "\n".join(output)
    return True, "\n".join(output)


def require_main_branch() -> tuple[bool, str]:
    branch = current_branch()
    if not branch:
        return False, "Git could not determine the current branch."
    if branch != BASE_BRANCH:
        return False, "Routine Portfolio Manager publishing uses main. Switch back to main before using this workflow."
    return True, branch


def staged_paths() -> list[str]:
    result = run_git(["diff", "--cached", "--name-only", "--diff-filter=ACDMRTUXB"])
    if result.returncode != 0:
        return []
    return [path for path in result.stdout.splitlines() if path.strip()]


def refresh_remote_tracking() -> tuple[bool, str]:
    result = run_git(["fetch", "origin", BASE_BRANCH])
    if result.returncode != 0:
        return False, (result.stderr or result.stdout).strip()
    return True, ""


@git_bp.route("/")
def git_workflow():
    branch = current_branch()
    files = parse_status()
    tracking = branch_tracking()
    return render_template(
        "git-workflow.html",
        branch=branch,
        base_branch=BASE_BRANCH,
        files=files,
        clean=not files,
        tracking=tracking,
        staged_diff=diff_preview(cached=True),
        unstaged_diff=diff_preview(cached=False),
        staged_count=len(staged_paths()),
    )


@git_bp.route("/sync-main", methods=["POST"])
def sync_main():
    ok, message = require_main_branch()
    if not ok:
        flash(message, "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if not working_tree_clean():
        flash("Main has local changes. Sync is blocked so none of your edits are overwritten.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["pull", "--ff-only", "origin", BASE_BRANCH])
    if result.returncode == 0:
        flash("Main is synced with GitHub. You can edit normally.", "success")
    else:
        flash(f"Main sync failed safely: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/stage", methods=["POST"])
def stage_files():
    ok, message = require_main_branch()
    if not ok:
        flash(message, "error")
        return redirect(url_for("git_workflow.git_workflow"))

    status_by_path = {item["path"]: item for item in parse_status()}
    selected = request.form.getlist("paths")
    if not selected:
        flash("Select at least one changed file to include in the next commit.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    for path in selected:
        item = status_by_path.get(path)
        if not item or not item["safe"]:
            flash(f"Staging blocked for unapproved path: {path}", "error")
            return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["add", "--", *selected])
    if result.returncode == 0:
        flash(f"Selected {len(selected)} file(s) for the next commit.", "success")
    else:
        flash(f"Staging failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/unstage", methods=["POST"])
def unstage_files():
    ok, message = require_main_branch()
    if not ok:
        flash(message, "error")
        return redirect(url_for("git_workflow.git_workflow"))

    selected = request.form.getlist("paths")
    currently_staged = set(staged_paths())
    if not selected or any(path not in currently_staged or not is_safe_repo_path(path) for path in selected):
        flash("Select only currently staged, approved files to remove from the next commit.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["restore", "--staged", "--", *selected])
    if result.returncode == 0:
        flash(f"Removed {len(selected)} file(s) from the next commit. Your local edits were kept.", "success")
    else:
        flash(f"Unstage failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/commit", methods=["POST"])
def commit_changes():
    ok, message = require_main_branch()
    if not ok:
        flash(message, "error")
        return redirect(url_for("git_workflow.git_workflow"))

    status = parse_status()
    if any(item["conflict"] for item in status):
        flash("Commit blocked because Git reports a merge conflict.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if not staged_paths():
        flash("Nothing is selected for commit. Choose the files you want first.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    commit_message = request.form.get("commit_message", "").strip()
    if not commit_message or len(commit_message) > 120 or "\n" in commit_message:
        flash("Commit message must be one line and 1–120 characters.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    passed, output = validation_suite()
    if not passed:
        flash(f"Commit blocked because validation failed:\n{output}", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["commit", "-m", commit_message])
    if result.returncode == 0:
        flash("Changes committed locally to main after full validation. They are not live until you publish to GitHub.", "success")
    else:
        flash(f"Commit failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/publish", methods=["POST"])
def publish_main():
    ok, message = require_main_branch()
    if not ok:
        flash(message, "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if not working_tree_clean():
        flash("Publish is blocked while uncommitted local changes remain. Commit or intentionally leave them local first.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    fetched, fetch_error = refresh_remote_tracking()
    if not fetched:
        flash(f"Could not refresh GitHub status: {fetch_error}", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    tracking = branch_tracking()
    if tracking["behind"] not in {0, None}:
        flash("Publish is blocked because GitHub has newer commits. Sync main before publishing.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if not tracking["ahead"]:
        flash("There are no local commits waiting to publish.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["push", "origin", BASE_BRANCH])
    if result.returncode == 0:
        flash("Published committed main changes to GitHub. GitHub Pages can now deploy the approved update.", "success")
    else:
        flash(f"Publish failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))
