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
        require('BASE_BRANCH = "main"' in routes, "Git workflow must explicitly protect main", errors)
        require("require_feature_branch" in routes, "Git mutations must use a feature-branch guard", errors)
        require('run_git(["pull", "--ff-only", "origin", BASE_BRANCH])' in routes, "Main sync must be fast-forward only", errors)
        require('run_git(["switch", "-c", branch])' in routes, "Branch creation must use explicit git switch -c", errors)
        require('run_git(["add", "--", *selected])' in routes, "Staging must use explicit selected paths", errors)
        require('run_git(["restore", "--staged", "--", *selected])' in routes, "Unstage must preserve local edits", errors)
        require("validation_suite()" in routes, "Commit path must run the full validation suite", errors)
        require('run_git(["commit", "-m", commit_message])' in routes, "Commit must use argument-list invocation", errors)
        require('run_git(["push", "-u", "origin", branch])' in routes, "Push must target the explicit feature branch", errors)
        require("working_tree_clean()" in routes, "Push/PR workflow must inspect working-tree cleanliness", errors)
        require("status_by_path" in routes, "Staging must be limited to paths Git currently reports as changed", errors)
        require("is_safe_repo_path" in routes, "Git workflow must validate paths before staging", errors)
        for blocked in ('.git', '.env', '.portfolio-manager', '.venv'):
            require(blocked in routes, f"Git workflow must explicitly block private path: {blocked}", errors)
        require(".pem" in routes and ".key" in routes, "Git workflow must block common credential/key files", errors)
        require("shell=True" not in routes, "Git workflow must not invoke a shell for user-controlled values", errors)
        require('"--force"' not in routes and '"-f"' not in routes, "Git workflow must not expose force-push", errors)
        require('run_git(["merge"' not in routes, "Portfolio Manager must not implement git merge", errors)
        require('"merge_pull_request"' not in routes, "Portfolio Manager must not implement GitHub PR merge", errors)
        require("gh_status" in routes and "compare_url" in routes, "PR workflow must support authenticated CLI plus safe browser fallback", errors)

        validation_index = routes.find("passed, output = validation_suite()")
        commit_index = routes.find('run_git(["commit", "-m", commit_message])')
        require(
            validation_index != -1 and commit_index != -1 and validation_index < commit_index,
            "Full validation must occur before commit creation",
            errors,
        )

    if template:
        require("Merge is intentionally outside Portfolio Manager" in template, "Git UI must state the no-merge safety boundary", errors)
        require("Open Pre-filled GitHub PR Page" in template, "Git UI must provide a token-free PR fallback", errors)
        require("data-confirm-action=\"git-commit\"" in template, "Commit must require a confirmation dialog", errors)
        require("data-confirm-action=\"git-push\"" in template, "Push must require a confirmation dialog", errors)
        require("data-confirm-action=\"git-create-pr\"" in template, "PR creation must require a confirmation dialog", errors)
        require("name=\"csrf_token\"" in template, "Git workflow modifying forms must contain CSRF tokens", errors)
        require("url_for('git_workflow" in template, "Git workflow UI must use named guarded routes", errors)
        require("merge_pull_request" not in template, "Git workflow UI must not expose a merge action", errors)

    if help_js:
        for confirmation in ("git-sync-main", "git-create-branch", "git-stage", "git-commit", "git-push", "git-create-pr"):
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
