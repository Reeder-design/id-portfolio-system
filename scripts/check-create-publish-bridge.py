from __future__ import annotations

from pathlib import Path
import ast
import json
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "create_publish_bridge_service.py"
CREATE_ROUTES = MANAGER / "create_content_routes.py"
RELATED_ROUTES = MANAGER / "related_references_routes.py"
RELATED_TEMPLATE = MANAGER / "templates" / "related-references.html"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path in (SERVICE, CREATE_ROUTES, RELATED_ROUTES, RELATED_TEMPLATE):
        require(path.exists(), f"Missing Create Content publish-bridge file: {path.relative_to(ROOT)}", errors)
    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    service_text = SERVICE.read_text(encoding="utf-8")
    create_routes_text = CREATE_ROUTES.read_text(encoding="utf-8")
    related_routes_text = RELATED_ROUTES.read_text(encoding="utf-8")
    template_text = RELATED_TEMPLATE.read_text(encoding="utf-8")

    for path, text in ((SERVICE, service_text), (CREATE_ROUTES, create_routes_text), (RELATED_ROUTES, related_routes_text)):
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require("start_or_resume_publish_bridge" in service_text, "Kept builds must have a resumable Related References bridge.", errors)
    require('build.get("decision") != "kept"' in service_text, "Publish bridge must require an explicit Keep Local Build decision.", errors)
    require('source_kind="create-build"' in service_text, "Kept builds must create Related References reviews in new-project mode.", errors)
    require('old_title=""' in service_text, "New-project Related References reviews must not pretend a title rename occurred.", errors)
    require("Structured project record" in service_text and "Rendered project page" in service_text, "Bridge review must identify already-created project outputs.", errors)
    require("start_or_resume_publish_bridge" in create_routes_text, "Create Content Keep route must start the publish bridge.", errors)
    require("related_references.review" in create_routes_text, "Create Content Keep route must redirect into Related References.", errors)
    require('{"project", "create-build"}' in related_routes_text, "Related References must route a Create Content project back to its project editor.", errors)
    require("record.source_kind == 'create-build'" in template_text, "Related References UI must distinguish new-project reviews from title-change reviews.", errors)
    require("Continue to Save &amp; Publish" in template_text, "Completed Related References must retain the Save & Publish handoff.", errors)

    forbidden = ("git add", "git commit", "git push", "Publish to GitHub", "merge_pull_request")
    for token in forbidden:
        require(token not in service_text, f"Private Create Content bridge must not gain Git/publish authority: found {token}", errors)

    sys.path.insert(0, str(MANAGER))
    try:
        import create_publish_bridge_service as bridge  # noqa: E402

        old_root = bridge.BRIDGES_ROOT
        old_load_brief = bridge.load_brief
        old_create_review = bridge.create_related_reference_review
        old_load_review = bridge.load_related_reference_review

        with tempfile.TemporaryDirectory() as temp_dir:
            bridge.BRIDGES_ROOT = Path(temp_dir).resolve() / "publish-bridges"
            fake_brief = {
                "id": "brief-20260914-140000-1234abcd",
                "fields": {"working_title": "Bridge Test Project"},
                "build_proposal": {"title": "Bridge Test Project"},
                "local_build": {
                    "active": True,
                    "decision": "kept",
                    "project_id": "bridge-test-project",
                    "page_path": "portfolio/projects/workflows/bridge-test-project/index.html",
                },
            }
            bridge.load_brief = lambda brief_id: fake_brief
            created: list[dict] = []

            def fake_create_review(**kwargs):
                created.append(kwargs)
                return {"id": "refs-20260914-140100-abcdef12", "status": "pending"}

            bridge.create_related_reference_review = fake_create_review
            bridge.load_related_reference_review = lambda review_id: {"id": review_id, "type": "related-references", "status": "pending"}

            first = bridge.start_or_resume_publish_bridge(fake_brief["id"])
            require(first["project_id"] == "bridge-test-project", "Bridge must store the kept project's id.", errors)
            require(first["related_references_review_id"] == "refs-20260914-140100-abcdef12", "Bridge must store the Related References review id.", errors)
            require(len(created) == 1, "Starting a bridge must create one Related References review.", errors)
            require(created[0].get("source_kind") == "create-build", "Created review must use new-project source mode.", errors)
            require(created[0].get("old_title") == "", "Created review must not fabricate an old title.", errors)

            second = bridge.start_or_resume_publish_bridge(fake_brief["id"])
            require(second["related_references_review_id"] == first["related_references_review_id"], "Resuming must preserve the existing review id.", errors)
            require(len(created) == 1, "Resuming a valid bridge must not create a duplicate Related References review.", errors)

            saved_path = bridge.BRIDGES_ROOT / f"{fake_brief['id']}.json"
            require(saved_path.exists(), "Publish bridge state must stay in the private .portfolio-manager workflow area.", errors)
            saved = json.loads(saved_path.read_text(encoding="utf-8"))
            require(saved.get("type") == "create-content-publish-bridge", "Saved bridge record must use the expected private record type.", errors)

            unkept = dict(fake_brief)
            unkept["local_build"] = dict(fake_brief["local_build"], decision="pending")
            bridge.load_brief = lambda brief_id: unkept
            other_id = "brief-20260914-140200-5678abcd"
            unkept["id"] = other_id
            try:
                bridge.start_or_resume_publish_bridge(other_id)
                errors.append("Publish bridge must refuse a local build that has not been explicitly kept.")
            except bridge.CreatePublishBridgeError as exc:
                require("Keep Local Build" in str(exc), "Unkept-build refusal should explain the required human decision.", errors)

        bridge.BRIDGES_ROOT = old_root
        bridge.load_brief = old_load_brief
        bridge.create_related_reference_review = old_create_review
        bridge.load_related_reference_review = old_load_review
    except Exception as exc:
        errors.append(f"Create Content publish-bridge runtime test failed: {exc}")

    if errors:
        print("Create Content publish-bridge validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Create Content publish-bridge safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
