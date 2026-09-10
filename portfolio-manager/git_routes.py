from __future__ import annotations

from pathlib import Path, PurePosixPath
from urllib.parse import quote
import re
import shutil
import subprocess
import sys

from flask import Blueprint, flash, redirect, render_template, request, url_for


REPO_ROOT = Path(__file__).resolve().parent.parent
BASE_BRANCH = "main"
ALLOWED_BRANCH_PREFIXES = {"feature", "fix", "content", "chore"}
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
        item = {
            "code": code,
            "path": path,
            "display_path": display_path,
            "staged": code[0] not in {" ", "?"},
            "unstaged": code[1] != " " or code == "??",
            "untracked": code == "??",
            "conflict": code in {"DD", "AU", "UD", "UA", "DU", "AA", "UU"},
            "safe": is_safe_repo_path(path),
        }
        items.append(item)
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
    lowered = path_value.lower()
    if lowered.endswith(BLOCKED_FILE_SUFFIXES):
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


def remote_repo_slug() -> str:
    result = run_git(["remote", "get-url", "origin"])
    if result.returncode != 0:
        return ""
    remote = result.stdout.strip()
    patterns = [
        r"github\.com[:/]([^/]+)/([^/]+?)(?:\.git)?$",
        r"https?://github\.com/([^/]+)/([^/]+?)(?:\.git)?$",
    ]
    for pattern in patterns:
        match = re.search(pattern, remote)
        if match:
            return f"{match.group(1)}/{match.group(2)}"
    return ""


def compare_url(branch: str) -> str:
    slug = remote_repo_slug()
    if not slug or not branch or branch == BASE_BRANCH:
        return ""
    safe_branch = quote(branch, safe="/-")
    return f"https://github.com/{slug}/compare/{BASE_BRANCH}...{safe_branch}?expand=1"


def gh_status() -> dict:
    executable = shutil.which("gh")
    if not executable:
        return {"installed": False, "authenticated": False, "existing_pr_url": ""}
    auth = run_command([executable, "auth", "status", "-h", "github.com"])
    authenticated = auth.returncode == 0
    existing_pr_url = ""
    branch = current_branch()
    if authenticated and branch and branch != BASE_BRANCH:
        existing = run_command([executable, "pr", "view", branch, "--json", "url", "--jq", ".url"])
        if existing.returncode == 0:
            existing_pr_url = existing.stdout.strip()
    return {
        "installed": True,
        "authenticated": authenticated,
        "existing_pr_url": existing_pr_url,
    }


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


def require_feature_branch() -> tuple[bool, str]:
    branch = current_branch()
    if not branch:
        return False, "Git could not determine the current branch."
    if branch == BASE_BRANCH:
        return False, "This action is blocked on main. Create or switch to a feature branch first."
    return True, branch


def staged_paths() -> list[str]:
    result = run_git(["diff", "--cached", "--name-only", "--diff-filter=ACDMRTUXB"])
    if result.returncode != 0:
        return []
    return [path for path in result.stdout.splitlines() if path.strip()]


def commit_count_from_main() -> int:
    result = run_git(["rev-list", "--count", f"{BASE_BRANCH}..HEAD"])
    if result.returncode != 0:
        return 0
    try:
        return int(result.stdout.strip())
    except ValueError:
        return 0


@git_bp.route("/")
def git_workflow():
    branch = current_branch()
    files = parse_status()
    tracking = branch_tracking()
    gh = gh_status()
    return render_template(
        "git-workflow.html",
        branch=branch,
        base_branch=BASE_BRANCH,
        files=files,
        clean=not files,
        tracking=tracking,
        gh=gh,
        compare_url=compare_url(branch),
        staged_diff=diff_preview(cached=True),
        unstaged_diff=diff_preview(cached=False),
        commit_count=commit_count_from_main() if branch and branch != BASE_BRANCH else 0,
        branch_prefixes=sorted(ALLOWED_BRANCH_PREFIXES),
    )


@git_bp.route("/sync-main", methods=["POST"])
def sync_main():
    if current_branch() != BASE_BRANCH:
        flash("Sync Main is available only while you are on main.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if not working_tree_clean():
        flash("Main has local changes. Sync is blocked until the working tree is clean.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["pull", "--ff-only", "origin", BASE_BRANCH])
    if result.returncode == 0:
        flash("Main synced with origin using fast-forward-only pull.", "success")
    else:
        flash(f"Main sync failed safely: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/create-branch", methods=["POST"])
def create_branch():
    if current_branch() != BASE_BRANCH:
        flash("Create Branch starts from main. Switch to main first.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if not working_tree_clean():
        flash("Create Branch is blocked until main has a clean working tree.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    prefix = request.form.get("prefix", "feature").strip().lower()
    slug = request.form.get("branch_slug", "").strip().lower()
    if prefix not in ALLOWED_BRANCH_PREFIXES:
        flash("Unsupported branch type.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    slug = re.sub(r"[^a-z0-9-]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,60}", slug or ""):
        flash("Use a short branch name with letters, numbers, and hyphens.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    branch = f"{prefix}/{slug}"
    exists = run_git(["show-ref", "--verify", "--quiet", f"refs/heads/{branch}"])
    if exists.returncode == 0:
        flash(f"Local branch already exists: {branch}", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["switch", "-c", branch])
    if result.returncode == 0:
        flash(f"Created and switched to {branch}. Nothing has been pushed yet.", "success")
    else:
        flash(f"Branch creation failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/stage", methods=["POST"])
def stage_files():
    ok, message = require_feature_branch()
    if not ok:
        flash(message, "error")
        return redirect(url_for("git_workflow.git_workflow"))

    status_by_path = {item["path"]: item for item in parse_status()}
    selected = request.form.getlist("paths")
    if not selected:
        flash("Select at least one changed file to stage.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    for path in selected:
        item = status_by_path.get(path)
        if not item or not item["safe"]:
            flash(f"Staging blocked for unapproved path: {path}", "error")
            return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["add", "--", *selected])
    if result.returncode == 0:
        flash(f"Staged {len(selected)} file(s). Review the staged diff before committing.", "success")
    else:
        flash(f"Staging failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/unstage", methods=["POST"])
def unstage_files():
    ok, message = require_feature_branch()
    if not ok:
        flash(message, "error")
        return redirect(url_for("git_workflow.git_workflow"))

    selected = request.form.getlist("paths")
    currently_staged = set(staged_paths())
    if not selected or any(path not in currently_staged or not is_safe_repo_path(path) for path in selected):
        flash("Select only currently staged, approved files to unstage.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["restore", "--staged", "--", *selected])
    if result.returncode == 0:
        flash(f"Unstaged {len(selected)} file(s). Their local edits were not deleted.", "success")
    else:
        flash(f"Unstage failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/commit", methods=["POST"])
def commit_changes():
    ok, branch_or_error = require_feature_branch()
    if not ok:
        flash(branch_or_error, "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if any(item["conflict"] for item in parse_status()):
        flash("Commit blocked because Git reports a merge conflict.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if not staged_paths():
        flash("Nothing is staged. Stage the exact files you want in this commit first.", "error")
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
        flash("Commit created locally after full validation. It has not been pushed yet.", "success")
    else:
        flash(f"Commit failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/push", methods=["POST"])
def push_branch():
    ok, branch_or_error = require_feature_branch()
    if not ok:
        flash(branch_or_error, "error")
        return redirect(url_for("git_workflow.git_workflow"))
    branch = branch_or_error
    if not working_tree_clean():
        flash("Push is blocked while local changes remain. Stage and commit or intentionally leave the workflow first.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if commit_count_from_main() < 1:
        flash("Push is blocked because this branch has no commits beyond main.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    result = run_git(["push", "-u", "origin", branch])
    if result.returncode == 0:
        flash(f"Pushed {branch} to origin. Main was not touched.", "success")
    else:
        flash(f"Push failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))


@git_bp.route("/create-pr", methods=["POST"])
def create_pr():
    ok, branch_or_error = require_feature_branch()
    if not ok:
        flash(branch_or_error, "error")
        return redirect(url_for("git_workflow.git_workflow"))
    branch = branch_or_error
    if not working_tree_clean():
        flash("PR creation is blocked while local changes remain.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    tracking = branch_tracking()
    if not tracking["upstream"]:
        flash("Push the branch before creating a pull request.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    gh = gh_status()
    if gh["existing_pr_url"]:
        flash(f"A pull request already exists: {gh['existing_pr_url']}", "success")
        return redirect(url_for("git_workflow.git_workflow"))
    if not gh["installed"] or not gh["authenticated"]:
        flash("GitHub CLI is not authenticated. Use the pre-filled GitHub PR link shown on this page instead.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    title = request.form.get("pr_title", "").strip()
    body = request.form.get("pr_body", "").strip()
    if not title or len(title) > 160:
        flash("Pull-request title must be 1–160 characters.", "error")
        return redirect(url_for("git_workflow.git_workflow"))
    if len(body) > 6000:
        flash("Pull-request description is too long for this interface.", "error")
        return redirect(url_for("git_workflow.git_workflow"))

    executable = shutil.which("gh")
    result = run_command([
        executable,
        "pr",
        "create",
        "--base", BASE_BRANCH,
        "--head", branch,
        "--title", title,
        "--body", body,
    ])
    if result.returncode == 0:
        url = result.stdout.strip()
        flash(f"Pull request created: {url}. Portfolio Manager still has no merge action.", "success")
    else:
        flash(f"Pull request creation failed: {(result.stderr or result.stdout).strip()}", "error")
    return redirect(url_for("git_workflow.git_workflow"))
