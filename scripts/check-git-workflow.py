from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROUTES = ROOT / "portfolio-manager" / "git_routes.py"
TEMPLATE = ROOT / "portfolio-manager" / "templates" / "git-workflow.html"
HELP_JS = ROOT / "portfolio-manager" / "static" / "help.js"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    require(ROUTES.exists(), "Git workflow routes are missing", errors)
    require(TEMPLATE.exists(), "Git workflow template is missing", errors)

    routes = ROUTES.read_text(encoding="utf-8") if ROUTES.exists() else ""
    template = TEMPLATE.read_text(encoding="utf-8") if TEMPLATE.exists() else ""
    help_js = HELP_JS.read_text(encoding="utf-8") if HELP_JS.exists() else ""

    if routes:
        require('BASE_BRANCH = "main"' in routes, "Git workflow must explicitly use main as the routine publishing branch", errors)
        require("require_main_branch" in routes, "Routine Git mutations must guard for main", errors)
        require('run_git(["pull", "--ff-only", "origin", BASE_BRANCH])' in routes, "Main sync must be fast-forward only", errors)
        require('run_git(["add", "--", *selected])' in routes, "Staging must use explicit selected paths", errors)
        require('run_git(["restore", "--staged", "--", *selected])' in routes, "Unstage must preserve local edits", errors)
        require("from validation_service import run_full_validation" in routes, "Commit and publish must use the one authoritative Full Validation suite", errors)
        require(routes.count("passed, output = run_full_validation()") >= 2, "Both commit and publish must run current Full Validation", errors)
        require('run_git(["commit", "-m", commit_message])' in routes, "Commit must use argument-list invocation", errors)
        require('run_git(["fetch", "origin", BASE_BRANCH])' in routes, "Publish must refresh remote main status before pushing", errors)
        require('run_git(["push", "origin", BASE_BRANCH])' in routes, "Publish must push explicit main without force", errors)
        require("working_tree_clean()" in routes, "Publish must require a clean working tree", errors)
        require("status_by_path" in routes, "Staging must be limited to paths Git currently reports as changed", errors)
        require("is_safe_repo_path" in routes, "Git workflow must validate paths before staging", errors)
        require("outgoing_paths()" in routes, "Publish must inspect the files contained in outgoing commits", errors)
        require("unsafe = [path for path in outgoing if not is_safe_repo_path(path)]" in routes, "Publish must block outgoing private/unsafe paths", errors)
        for blocked in ('.git', '.env', '.portfolio-manager', '.venv'):
            require(blocked in routes, f"Git workflow must explicitly block private path: {blocked}", errors)
        require('for part in posix.parts:' in routes, "Git workflow must inspect nested path components, not only the repository root.", errors)
        require('part.startswith(".env.")' in routes and 'part != ".env.example"' in routes, "Git workflow must block environment-file variants while allowing .env.example", errors)
        require(".pem" in routes and ".key" in routes, "Git workflow must block common credential/key files", errors)
        require("shell=True" not in routes, "Git workflow must not invoke a shell for user-controlled values", errors)
        require('"--force"' not in routes and '"-f"' not in routes, "Git workflow must not expose force-push", errors)
        require('run_git(["merge"' not in routes, "Portfolio Manager must not implement git merge", errors)
        require('run_git(["rebase"' not in routes, "Portfolio Manager must not silently rebase local history", errors)

        validation_index = routes.find("passed, output = run_full_validation()")
        commit_index = routes.find('run_git(["commit", "-m", commit_message])')
        require(
            validation_index != -1 and commit_index != -1 and validation_index < commit_index,
            "Full validation must occur before commit creation",
            errors,
        )

        fetch_index = routes.find('run_git(["fetch", "origin", BASE_BRANCH])')
        unsafe_index = routes.find("unsafe = [path for path in outgoing if not is_safe_repo_path(path)]")
        push_validation_index = routes.rfind("passed, output = run_full_validation()")
        push_index = routes.find('run_git(["push", "origin", BASE_BRANCH])')
        require(
            fetch_index != -1 and unsafe_index != -1 and push_validation_index != -1 and push_index != -1
            and fetch_index < unsafe_index < push_validation_index < push_index,
            "Publish must fetch, inspect outgoing paths, run Full Validation, then push",
            errors,
        )

    if template:
        require("Commit and publish are separate actions" in template, "Git UI must explain the commit/publish boundary", errors)
        require("Validate &amp; Commit Changes" in template, "Git UI must expose validation-gated commit control", errors)
        require("Publish to GitHub" in template, "Git UI must expose explicit publishing control", errors)
        require("Create & Switch Branch" not in template, "Routine Git UI must not require branch creation", errors)
        require("Open Pull Request" not in template, "Routine Git UI must not require pull requests", errors)
        require("data-confirm-action=\"git-commit\"" in template, "Commit must require a confirmation dialog", errors)
        require("data-confirm-action=\"git-push\"" in template, "Publish must require a confirmation dialog", errors)
        require("name=\"csrf_token\"" in template, "Git workflow modifying forms must contain CSRF tokens", errors)
        require("url_for('git_workflow" in template, "Git workflow UI must use named guarded routes", errors)

    if help_js:
        for confirmation in ("git-sync-main", "git-stage", "git-commit", "git-push"):
            require(confirmation in help_js, f"Missing confirmation copy for {confirmation}", errors)

    if errors:
        print("Portfolio Manager Git workflow validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Portfolio Manager Git workflow safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
