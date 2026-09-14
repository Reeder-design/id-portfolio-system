from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace
import ast
import json
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "create_content_build_service.py"
ROUTES = MANAGER / "create_content_routes.py"
BUILD_TEMPLATE = MANAGER / "templates" / "create-content-build.html"
BRIEF_TEMPLATE = MANAGER / "templates" / "create-content-brief.html"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path in (SERVICE, ROUTES, BUILD_TEMPLATE, BRIEF_TEMPLATE):
        require(path.exists(), f"Missing controlled-build file: {path.relative_to(ROOT)}", errors)
    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    service_text = SERVICE.read_text(encoding="utf-8")
    routes_text = ROUTES.read_text(encoding="utf-8")
    template_text = BUILD_TEMPLATE.read_text(encoding="utf-8")
    brief_text = BRIEF_TEMPLATE.read_text(encoding="utf-8")

    for path, text in ((SERVICE, service_text), (ROUTES, routes_text)):
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require("current_build_fingerprint" in service_text, "Build approval must be anchored to a deterministic brief/plan/source fingerprint.", errors)
    require("plan_is_approved" in service_text, "Controlled build must require explicit plan approval.", errors)
    require("BUILD_PROPOSAL_INSTRUCTIONS" in service_text, "Controlled build must use a dedicated proposal-only AI contract.", errors)
    require("Do not create HTML, code, Git commands, files, commits, or publishing instructions" in service_text, "AI build proposal must be denied direct write/publish authority.", errors)
    require("new_project.create_project" in service_text, "Local build must reuse the existing structured project generator.", errors)
    require("run_full_validation()" in service_text, "Local build must run the repository validation suite before review.", errors)
    require("refresh_documentation" in service_text, "Controlled build must keep generated documentation synchronized.", errors)
    require("record_sha256" in service_text and "page_sha256" in service_text, "Local build must hash created files for safe revert.", errors)
    require("Automatic revert stopped because" in service_text, "Revert must refuse to delete files edited after generation.", errors)
    require('"decision": "pending"' in service_text, "New local builds must remain pending human review.", errors)
    require('build["decision"] = "kept"' in service_text, "Keep must be a separate explicit human action.", errors)

    for forbidden in ("git add", "git commit", "git push", "gh pr", "merge_pull_request", "Publish to GitHub"):
        require(forbidden not in service_text + routes_text, f"Controlled build must not commit or publish: found {forbidden}", errors)

    require("/build/approve-plan" in routes_text, "Controlled build must expose explicit plan approval.", errors)
    require("local_write_ack" in routes_text and "public_safe_ack" in routes_text, "Local file creation must require explicit write and public-safety acknowledgements.", errors)
    require("Review &amp; Build Project" in brief_text, "A current Content Plan must visibly connect to the Build workspace.", errors)
    for label in (
        "Approve Plan for Build",
        "Generate Build Proposal",
        "Save Build Proposal",
        "Create Local Project &amp; Validate",
        "Open Real Local Preview",
        "Keep Local Build",
        "Revert Local Build",
    ):
        require(label in template_text, f"Controlled build UI must include {label}.", errors)
    require("does not commit, push, publish, or merge" in template_text, "Build UI must clearly explain its non-publishing boundary.", errors)

    sys.path.insert(0, str(MANAGER))
    try:
        import create_content_service as content  # noqa: E402
        import create_content_build_service as build  # noqa: E402

        old_briefs_root = content.BRIEFS_ROOT
        old_build_root = build.ROOT
        old_load_new_project = build._load_new_project_module
        old_validation = build.run_full_validation

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            temp_briefs = temp_root / ".portfolio-manager" / "create-content" / "briefs"
            content.BRIEFS_ROOT = temp_briefs
            build.ROOT = temp_root

            form = {
                "working_title": "Controlled Build Test",
                "project_type": "Standard case study",
                "purpose": "Demonstrate a safe controlled build.",
                "skills_to_demonstrate": "Instructional design",
                "audience": "Hiring managers",
                "story_problem": "A workflow needed a portfolio-safe case study.",
                "story_approach": "Use a structured renderer.",
                "story_process": "Plan, review, validate.",
                "story_result": "A reviewable local project.",
                "evidence": "Test-only evidence.",
                "interaction": "Read the case study.",
                "visual_direction": "Use the portfolio design system.",
                "public_safety": "No confidential data.",
                "personal_direction": "Concise and first-person.",
            }
            record = content.create_brief(form)
            record["plan"] = {
                "concept_summary": "Structured case study",
                "recommended_format": "case study",
                "placement": {"category": "workflows", "subcategory": None, "rationale": "Workflow project"},
                "sections": [],
                "interactions": [],
                "asset_needs": [],
                "evidence_gaps": [],
                "safety_notes": [],
                "build_tasks": [],
                "writing_direction": [],
            }
            record["plan_generated_at"] = "2026-09-14T12:00:00"
            record["plan_stale"] = False
            brief_path = temp_briefs / f"{record['id']}.json"
            brief_path.write_text(json.dumps(record, indent=2), encoding="utf-8")

            approved = build.approve_plan(record["id"])
            require(build.plan_is_approved(approved), "Plan approval must bind to the current build fingerprint.", errors)

            proposal_form = {
                "title": "Controlled Build Test",
                "slug": "controlled-build-test",
                "category": "workflows",
                "subcategory": "",
                "confidentiality": "public",
                "summary": "A safe local case-study build.",
                "business_need": "Demonstrate controlled portfolio generation.",
                "audience": "Hiring managers",
                "learning_objectives": "Show a validated local build\nPreserve human approval boundaries",
                "role": "I designed and validated the workflow.",
                "design_approach": "I used the existing structured project system.",
                "development_process": "I reviewed the proposal before local generation.",
                "outcomes": "Created a reviewable local project",
                "skills": "Instructional design, workflow design",
                "tools": "Python, HTML",
                "source_material_notes": "Test content only.",
            }
            build.save_build_proposal(record["id"], proposal_form)

            class FakeNewProject:
                @staticmethod
                def build_project_record(**kwargs):
                    return {
                        "id": kwargs["slug"],
                        "title": kwargs["title"],
                        "category": kwargs["category"]["id"],
                        "subcategory": kwargs["subcategory"]["id"] if kwargs.get("subcategory") else None,
                        "status": kwargs["status"],
                        "confidentiality": kwargs["confidentiality"],
                        "page_path": f"portfolio/projects/workflows/{kwargs['slug']}/index.html",
                        "content": {"business_need": kwargs["business_need"]},
                    }

                @staticmethod
                def create_project(project_record, render=True):
                    record_path = temp_root / "portfolio-data" / "projects" / f"{project_record['id']}.json"
                    page_path = temp_root / project_record["page_path"]
                    record_path.parent.mkdir(parents=True, exist_ok=True)
                    page_path.parent.mkdir(parents=True, exist_ok=True)
                    record_path.write_text(json.dumps(project_record, indent=2), encoding="utf-8")
                    page_path.write_text("<html><body>Controlled Build Test</body></html>", encoding="utf-8")
                    return record_path, page_path

                @staticmethod
                def refresh_documentation():
                    return "docs refreshed"

                @staticmethod
                def cleanup_empty_parents(path, stop):
                    current = path.parent
                    while current != stop and current.is_relative_to(stop):
                        try:
                            current.rmdir()
                        except OSError:
                            break
                        current = current.parent

            build._load_new_project_module = lambda: FakeNewProject
            build.run_full_validation = lambda: (True, "validation passed")

            built = build.apply_local_build(record["id"])
            local = built["local_build"]
            record_file = temp_root / local["record_path"]
            page_file = temp_root / local["page_path"]
            require(record_file.exists() and page_file.exists(), "Controlled build must create both structured record and rendered page locally.", errors)
            require(local["decision"] == "pending", "Created local build must wait for human Keep/Revert decision.", errors)

            build.revert_local_build(record["id"])
            require(not record_file.exists() and not page_file.exists(), "Revert must remove unchanged files created by the controlled build.", errors)

            build.apply_local_build(record["id"])
            rebuilt = content.load_brief(record["id"])["local_build"]
            changed_page = temp_root / rebuilt["page_path"]
            changed_page.write_text("<html><body>User edited this after generation.</body></html>", encoding="utf-8")
            try:
                build.revert_local_build(record["id"])
                errors.append("Revert must refuse to delete a generated file that changed after creation.")
            except build.CreateBuildError as exc:
                require("changed after the local build" in str(exc), "Edited-file revert failure should explain the hash protection.", errors)
            require(changed_page.exists(), "Hash-protected revert must preserve an edited generated page.", errors)

        content.BRIEFS_ROOT = old_briefs_root
        build.ROOT = old_build_root
        build._load_new_project_module = old_load_new_project
        build.run_full_validation = old_validation
    except Exception as exc:
        errors.append(f"Controlled build runtime test failed: {exc}")

    if errors:
        print("Create Content controlled-build validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Create Content controlled-build safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
