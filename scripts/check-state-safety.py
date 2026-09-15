from __future__ import annotations

from pathlib import Path
import hashlib
import json
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
ROUTES = MANAGER / "create_content_routes.py"
STATE_SERVICE = MANAGER / "state_safety_service.py"

sys.path.insert(0, str(MANAGER))

import create_content_build_service as build  # noqa: E402
import create_content_service as content  # noqa: E402
import create_publish_bridge_service as bridge  # noqa: E402
import state_safety_service as safety  # noqa: E402


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def expect_error(callable_obj, error_type, contains: str, message: str, errors: list[str]) -> None:
    try:
        callable_obj()
    except error_type as exc:
        require(contains.lower() in str(exc).lower(), message + f" (message was: {exc})", errors)
        return
    except Exception as exc:
        errors.append(message + f" (wrong exception: {type(exc).__name__}: {exc})")
        return
    errors.append(message + " (no error raised)")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def base_form(title: str) -> dict[str, str]:
    return {
        "working_title": title,
        "project_type": "Standard case study",
        "purpose": "Exercise workflow state safety.",
        "skills_to_demonstrate": "Workflow design",
        "audience": "Hiring managers",
        "story_problem": "A state transition needs protection.",
        "story_approach": "Use deterministic safety guards.",
        "story_process": "Create, validate, review, decide.",
        "story_result": "A recoverable workflow.",
        "evidence": "Synthetic test evidence.",
        "interaction": "Read the case study.",
        "visual_direction": "Portfolio design system.",
        "public_safety": "Synthetic test content only.",
        "personal_direction": "Concise.",
    }


def attach_build(record: dict, temp_root: Path, project_id: str = "state-safety-test") -> tuple[Path, Path]:
    record_path = temp_root / "portfolio-data" / "projects" / f"{project_id}.json"
    page_path = temp_root / "portfolio" / "projects" / "workflows" / project_id / "index.html"
    record_path.parent.mkdir(parents=True, exist_ok=True)
    page_path.parent.mkdir(parents=True, exist_ok=True)
    record_path.write_text('{"title":"State Safety Test"}\n', encoding="utf-8")
    page_path.write_text("<html><body>State Safety Test</body></html>\n", encoding="utf-8")
    record["local_build"] = {
        "active": True,
        "decision": "pending",
        "project_id": project_id,
        "record_path": record_path.relative_to(temp_root).as_posix(),
        "page_path": page_path.relative_to(temp_root).as_posix(),
        "record_sha256": sha(record_path),
        "page_sha256": sha(page_path),
        "created_at": "2026-09-14T18:00:00",
        "validation": "passed",
    }
    record["status"] = "local-build-review"
    (content.BRIEFS_ROOT / f"{record['id']}.json").write_text(
        json.dumps(record, indent=2), encoding="utf-8"
    )
    return record_path, page_path


def main() -> int:
    errors: list[str] = []

    for path in (STATE_SERVICE, ROUTES):
        require(path.exists(), f"Missing state-safety file: {path.relative_to(ROOT)}", errors)
    if errors:
        for item in errors:
            print(item)
        return 1

    service_text = STATE_SERVICE.read_text(encoding="utf-8")
    routes_text = ROUTES.read_text(encoding="utf-8")
    require("safe_keep_local_build" in routes_text, "Create routes must use validated Keep guard.", errors)
    require("safe_revert_local_build" in routes_text, "Create routes must use atomic Revert guard.", errors)
    require("safe_delete_brief" in routes_text, "Create routes must use guarded brief deletion.", errors)
    require("ensure_brief_editable" in routes_text, "Create routes must block brief edits during an active build.", errors)
    require("run_full_validation()" in service_text, "Keep must rerun Full Validation at the human approval boundary.", errors)
    require("before deleting anything" in service_text, "Revert must preflight all generated files before deletion.", errors)

    old_briefs_root = content.BRIEFS_ROOT
    old_build_root = build.ROOT
    old_bridge_root = bridge.BRIDGES_ROOT
    old_validation = safety.run_full_validation
    old_loader = build._load_new_project_module

    class FakeNewProject:
        @staticmethod
        def cleanup_empty_parents(path, stop):
            current = path.parent
            while current != stop and current.is_relative_to(stop):
                try:
                    current.rmdir()
                except OSError:
                    break
                current = current.parent

        @staticmethod
        def refresh_documentation():
            return "refreshed"

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir).resolve()
            content.BRIEFS_ROOT = temp_root / ".portfolio-manager" / "create-content" / "briefs"
            build.ROOT = temp_root
            bridge.BRIDGES_ROOT = temp_root / ".portfolio-manager" / "create-content" / "publish-bridges"
            build._load_new_project_module = lambda: FakeNewProject
            content.BRIEFS_ROOT.mkdir(parents=True, exist_ok=True)

            # 1) Revert must be atomic: if any generated file changed, delete nothing.
            record = content.create_brief(base_form("Atomic Revert"))
            record_path, page_path = attach_build(record, temp_root, "atomic-revert")
            record_path.write_text('{"title":"User edited this"}\n', encoding="utf-8")
            expect_error(
                lambda: safety.safe_revert_local_build(record["id"]),
                build.CreateBuildError,
                "before deleting anything",
                "Revert should stop before deletion when one generated file changed.",
                errors,
            )
            require(page_path.exists(), "Atomic Revert deleted the unchanged page before detecting the changed record.", errors)
            require(record_path.exists(), "Atomic Revert deleted the changed structured record.", errors)

            # Restore the original hash-bound content and verify a clean Revert removes both.
            record_path.write_text('{"title":"State Safety Test"}\n', encoding="utf-8")
            safety.safe_revert_local_build(record["id"])
            require(not page_path.exists() and not record_path.exists(), "Clean Revert did not remove both generated files.", errors)
            require(content.load_brief(record["id"]).get("local_build") is None, "Clean Revert did not clear local-build state.", errors)

            # 2) Keep must validate the current state, not trust generation-time validation.
            keep_record = content.create_brief(base_form("Validated Keep"))
            keep_record_path, keep_page_path = attach_build(keep_record, temp_root, "validated-keep")
            safety.run_full_validation = lambda: (False, "synthetic validation failure")
            expect_error(
                lambda: safety.safe_keep_local_build(keep_record["id"]),
                build.CreateBuildError,
                "no longer passes full validation",
                "Keep should stop when current Full Validation fails.",
                errors,
            )
            require(content.load_brief(keep_record["id"])["local_build"]["decision"] == "pending", "Failed Keep changed the build decision.", errors)

            # Intentional edit can be kept only after it passes the fresh validation.
            keep_page_path.write_text("<html><body>Reviewed local edit</body></html>\n", encoding="utf-8")
            safety.run_full_validation = lambda: (True, "all checks pass")
            kept = safety.safe_keep_local_build(keep_record["id"])
            kept_build = kept["local_build"]
            require(kept_build["decision"] == "kept", "Successful Keep did not mark the build kept.", errors)
            require(kept_build["page_sha256"] == sha(keep_page_path), "Keep did not bind approval to the exact validated page state.", errors)
            first_kept_at = kept_build["kept_at"]
            kept_again = safety.safe_keep_local_build(keep_record["id"])
            require(kept_again["local_build"]["kept_at"] == first_kept_at, "Repeated Keep should be idempotent rather than creating a new approval event.", errors)

            # Once kept, the build has moved forward and Create Content must not roll it backward.
            expect_error(
                lambda: safety.safe_revert_local_build(keep_record["id"]),
                build.CreateBuildError,
                "already kept",
                "A kept build should not be revertible from Create Content.",
                errors,
            )
            require(keep_record_path.exists() and keep_page_path.exists(), "Blocked Revert after Keep removed project files.", errors)

            # 3) Active builds protect their source brief from edits or deletion.
            expect_error(
                lambda: safety.ensure_brief_editable(keep_record["id"]),
                content.CreateContentError,
                "manage content",
                "A kept build should redirect future editing away from the source brief.",
                errors,
            )
            expect_error(
                lambda: safety.safe_delete_brief(keep_record["id"]),
                content.CreateContentError,
                "cannot be deleted",
                "Deleting a brief with a kept/active project should be blocked.",
                errors,
            )
            require((content.BRIEFS_ROOT / f"{keep_record['id']}.json").exists(), "Blocked brief deletion removed the private brief anyway.", errors)

            pending_record = content.create_brief(base_form("Pending Build"))
            attach_build(pending_record, temp_root, "pending-build")
            expect_error(
                lambda: safety.ensure_brief_editable(pending_record["id"]),
                content.CreateContentError,
                "keep or revert",
                "A pending local build should block source-brief edits.",
                errors,
            )
            expect_error(
                lambda: safety.safe_delete_brief(pending_record["id"]),
                content.CreateContentError,
                "keep or revert",
                "A pending local build should block brief deletion.",
                errors,
            )

            # 4) A publishing bridge also protects its originating private record.
            bridge_record = content.create_brief(base_form("Bridge Protected"))
            bridge.BRIDGES_ROOT.mkdir(parents=True, exist_ok=True)
            (bridge.BRIDGES_ROOT / f"{bridge_record['id']}.json").write_text(
                json.dumps({
                    "type": "create-content-publish-bridge",
                    "brief_id": bridge_record["id"],
                    "related_references_review_id": "synthetic-review",
                }),
                encoding="utf-8",
            )
            expect_error(
                lambda: safety.safe_delete_brief(bridge_record["id"]),
                content.CreateContentError,
                "publishing handoff",
                "A brief with an active publishing handoff should not be deletable.",
                errors,
            )

            # 5) Plain drafts with no active state still delete normally.
            plain = content.create_brief(base_form("Plain Draft"))
            plain_path = content.BRIEFS_ROOT / f"{plain['id']}.json"
            safety.safe_delete_brief(plain["id"])
            require(not plain_path.exists(), "A plain inactive Content Brief should still be deletable.", errors)

    except Exception as exc:
        errors.append(f"State-safety runtime regression crashed: {type(exc).__name__}: {exc}")
    finally:
        content.BRIEFS_ROOT = old_briefs_root
        build.ROOT = old_build_root
        bridge.BRIDGES_ROOT = old_bridge_root
        safety.run_full_validation = old_validation
        build._load_new_project_module = old_loader

    if errors:
        print("Workflow state-safety/chaos validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Workflow state-safety/chaos validation passed.")
    print("Covered atomic Revert, fresh-validation Keep, repeat Keep, kept-state rollback blocking, active-build edit/delete protection, publishing-handoff deletion protection, and normal inactive deletion.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
