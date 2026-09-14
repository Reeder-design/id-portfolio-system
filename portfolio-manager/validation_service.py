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
        ("Structured content", [sys.executable, "scripts/check-content.py"]),
        ("General site content", [sys.executable, "scripts/check-site-content.py"]),
        ("Project renderer", [sys.executable, "scripts/check-renderer.py"]),
        ("Project generator", [sys.executable, "scripts/check-new-project.py"]),
        ("Documentation versioning", [sys.executable, "scripts/check-docs.py"]),
        ("Generated documentation", [sys.executable, "scripts/update-docs.py", "--check"]),
        ("Git workflow safety", [sys.executable, "scripts/check-git-workflow.py"]),
        ("AI assistance safety", [sys.executable, "scripts/check-ai-assistance.py"]),
        ("Manage AI review safety", [sys.executable, "scripts/check-manage-ai-review.py"]),
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
