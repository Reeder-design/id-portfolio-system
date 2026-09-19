from __future__ import annotations

from pathlib import Path
import subprocess
import sys


REPO_ROOT = Path(__file__).resolve().parents[1]


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
        return {
            "success": False,
            "stdout": "",
            "stderr": str(exc),
            "code": 1,
        }


def run_full_validation() -> tuple[bool, str]:
    commands = [
        ("Public site", [sys.executable, "scripts/check-site.py"]),
        ("Release end-to-end regression", [sys.executable, "scripts/check-release-e2e.py"]),
        ("Structured content", [sys.executable, "scripts/check-content.py"]),
        ("General site content", [sys.executable, "scripts/check-site-content.py"]),
        ("Final public polish/mobile", [sys.executable, "scripts/check-final-polish.py"]),
        ("Breadcrumb consistency", [sys.executable, "scripts/check-breadcrumb-consistency.py"]),
        ("Hiring Manager UX", [sys.executable, "scripts/check-hiring-mobile-ux.py"]),
        ("Hiring Guide Manager", [sys.executable, "scripts/check-hiring-guide-manager.py"]),
        ("Public privacy/leakage", [sys.executable, "scripts/check-public-privacy.py"]),
        ("Project renderer", [sys.executable, "scripts/check-renderer.py"]),
        ("Project generator", [sys.executable, "scripts/check-new-project.py"]),
        ("Documentation versioning", [sys.executable, "scripts/check-docs.py"]),
        ("Generated documentation", [sys.executable, "scripts/update-docs.py", "--check"]),
        ("System docs/architecture freshness", [sys.executable, "scripts/check-system-docs.py"]),
        ("Git workflow safety", [sys.executable, "scripts/check-git-workflow.py"]),
        ("AI assistance safety", [sys.executable, "scripts/check-ai-assistance.py"]),
        ("AI helper file-upload safety", [sys.executable, "scripts/check-ai-file-uploads.py"]),
        ("AI proposal handoff safety", [sys.executable, "scripts/check-ai-proposal-handoff.py"]),
        ("Manage AI review safety", [sys.executable, "scripts/check-manage-ai-review.py"]),
        ("Manage asset integration safety", [sys.executable, "scripts/check-manage-assets.py"]),
        ("Related References safety", [sys.executable, "scripts/check-related-references.py"]),
        ("Create Content Lab safety", [sys.executable, "scripts/check-create-content.py"]),
        ("Create Content approved-source safety", [sys.executable, "scripts/check-create-content-sources.py"]),
        ("Create Content controlled-build safety", [sys.executable, "scripts/check-create-content-build.py"]),
        ("Create Content publish-bridge safety", [sys.executable, "scripts/check-create-publish-bridge.py"]),
        ("Workflow state-safety/chaos", [sys.executable, "scripts/check-state-safety.py"]),
        ("Reference Library safety", [sys.executable, "scripts/check-reference-library.py"]),
        ("Reference AI analysis safety", [sys.executable, "scripts/check-reference-ai-analysis.py"]),
        ("Reference sanitization safety", [sys.executable, "scripts/check-reference-sanitization.py"]),
        ("User Guide and privacy freshness", [sys.executable, "scripts/check-help-privacy.py"]),
        ("Adversarial security/misuse", [sys.executable, "scripts/check-adversarial-security.py"]),
        ("Recovered security regression", [sys.executable, "scripts/check-security-recovery.py"]),
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
