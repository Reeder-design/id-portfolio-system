from __future__ import annotations

import importlib.util
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "relationship_graph_service.py"
ROUTES = MANAGER / "related_references_routes.py"
OVERVIEW = MANAGER / "templates" / "related-reference-workspace.html"
DETAIL = MANAGER / "templates" / "project-related-references.html"
MANAGE = MANAGER / "templates" / "content-manager.html"
EDITOR = MANAGER / "templates" / "project-editor.html"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def load_module(path: Path, name: str):
    sys.path.insert(0, str(MANAGER))
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not import {path.relative_to(ROOT)}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    errors: list[str] = []
    for path in [SERVICE, ROUTES, OVERVIEW, DETAIL, MANAGE, EDITOR]:
        require(path.exists(), f"Missing relationship-graph file: {path.relative_to(ROOT)}", errors)
    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    overview = OVERVIEW.read_text(encoding="utf-8")
    detail = DETAIL.read_text(encoding="utf-8")
    manage = MANAGE.read_text(encoding="utf-8")
    editor = EDITOR.read_text(encoding="utf-8")

    for marker in [
        "graph_overview",
        "project_relationship_workspace",
        "_suggestions",
        "same portfolio section",
        "shared skill",
        "shared tool",
        "already links back to this project",
    ]:
        require(marker in service, f"Relationship graph service is missing {marker}.", errors)

    require('BACKUP_ROOT = PRIVATE_ROOT / "relationship-backups"' in service, "Relationship edits must keep recovery backups private.", errors)
    require('scripts/check-content.py' in service, "Relationship edits must validate structured content.", errors)
    require('scripts/update-docs.py' in service, "Relationship edits must refresh generated docs.", errors)
    require("portfolio/" not in service.split("def _mutate_project", 1)[-1], "Relationship mutation logic must not directly write public HTML.", errors)
    for forbidden in ["git add", "git commit", "git push", "git merge"]:
        require(forbidden not in service + routes, f"Relationship workspace must not publish directly: {forbidden}", errors)

    for marker in [
        '@related_references_bp.get("/")',
        '@related_references_bp.get("/projects/<project_id>")',
        "add_project_relationship",
        "update_project_relationship",
        "remove_project_relationship",
    ]:
        require(marker in routes, f"Related References routes are missing {marker}.", errors)

    require("Portfolio relationship map" in overview, "Related References overview must expose the project graph.", errors)
    require("deterministic suggestions" in detail.lower(), "Project relationship UI must label suggestions as deterministic.", errors)
    require("Nothing is added automatically" in detail, "Project relationship UI must preserve human approval.", errors)
    require("Custom project pages stay custom" in detail, "Relationship UI must protect bespoke public pages.", errors)
    require("Open Related References" in manage, "Manage Content must link to Related References.", errors)
    require("Related References" in editor, "Project editor must link to project relationships.", errors)

    try:
        module = load_module(SERVICE, "relationship_graph_check")
        graph = module.graph_overview()
        require(graph["summary"]["projects"] >= 10, "Relationship graph should include current structured projects.", errors)
        require(graph["summary"]["connections"] >= 1, "Existing structured related_work connections should be detected.", errors)

        workspace = module.project_relationship_workspace("meddpicc-practice")
        require(workspace["project"]["id"] == "meddpicc-practice", "Project relationship workspace returned the wrong project.", errors)
        require(isinstance(workspace["incoming"], list), "Incoming relationship list is missing.", errors)
        require(isinstance(workspace["suggestions"], list), "Relationship suggestions list is missing.", errors)
        require(all(item.get("score", 0) >= 18 for item in workspace["suggestions"]), "Suggestions below the deterministic threshold should not render.", errors)

        certification = module.project_relationship_workspace("enterprise-sales-certification")
        targets = {item["project_id"] for item in certification["outgoing"]}
        require("certification-reporting-automation" in targets, "Existing related_work connection should appear as outgoing.", errors)
        require("learning-platform-operations-migration-readiness" in targets, "Existing LMS relationship should appear as outgoing.", errors)
    except Exception as exc:
        errors.append(f"Relationship graph service smoke test failed: {exc}")

    if errors:
        print("Relationship graph validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Relationship graph validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
