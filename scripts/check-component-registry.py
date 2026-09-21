from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
REGISTRY = ROOT / "portfolio-data" / "component-registry.json"
SERVICE = MANAGER / "component_registry_service.py"
ROUTES = MANAGER / "component_registry_routes.py"
TEMPLATE = MANAGER / "templates" / "component-registry.html"
EDITOR = MANAGER / "templates" / "project-editor.html"
SCHEMA = ROOT / "portfolio-data" / "schema" / "project.schema.json"
CONTENT_CHECK = ROOT / "scripts" / "check-content.py"
CREATE_SERVICE = MANAGER / "create_content_service.py"
CREATE_BUILD = MANAGER / "create_content_build_service.py"
CREATE_BRIEF = MANAGER / "templates" / "create-content-brief.html"
CREATE_BUILD_TEMPLATE = MANAGER / "templates" / "create-content-build.html"


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
    for path in [REGISTRY, SERVICE, ROUTES, TEMPLATE, EDITOR, SCHEMA, CONTENT_CHECK, CREATE_SERVICE, CREATE_BUILD, CREATE_BRIEF, CREATE_BUILD_TEMPLATE]:
        require(path.exists(), f"Missing component-registry file: {path.relative_to(ROOT)}", errors)
    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    components = registry.get("components", [])
    ids = [item.get("id") for item in components if isinstance(item, dict)]
    require(len(components) >= 8, "Component registry should include the established reusable pattern set.", errors)
    require(len(ids) == len(set(ids)), "Component registry ids must be unique.", errors)
    for component_id in [
        "project-snapshot",
        "tabs-switcher",
        "detail-cards",
        "process-flow",
        "comparison-table",
        "evidence-grid",
        "related-work-cards",
        "decision-scenario",
    ]:
        require(component_id in ids, f"Component registry is missing {component_id}.", errors)

    for item in components:
        if not isinstance(item, dict):
            continue
        for key in ["id", "label", "category", "status", "support", "summary", "best_for", "avoid_when", "implementation_files"]:
            require(bool(item.get(key)), f"Component {item.get('id')} is missing {key}.", errors)
        require(item.get("support") in {"template-supported", "custom-pattern"}, f"Component {item.get('id')} has invalid support type.", errors)

    service_text = SERVICE.read_text(encoding="utf-8")
    routes_text = ROUTES.read_text(encoding="utf-8")
    template_text = TEMPLATE.read_text(encoding="utf-8")
    editor_text = EDITOR.read_text(encoding="utf-8")
    schema_text = SCHEMA.read_text(encoding="utf-8")
    content_text = CONTENT_CHECK.read_text(encoding="utf-8")
    create_service_text = CREATE_SERVICE.read_text(encoding="utf-8")
    create_build_text = CREATE_BUILD.read_text(encoding="utf-8")
    create_brief_text = CREATE_BRIEF.read_text(encoding="utf-8")
    create_build_template_text = CREATE_BUILD_TEMPLATE.read_text(encoding="utf-8")

    require("inferred_component_ids" in service_text, "Registry service must infer components from structured/template data.", errors)
    require("explicit_component_ids" in service_text, "Registry service must distinguish recorded component refs.", errors)
    require("registry_with_usage" in service_text, "Registry workspace must expose portfolio usage.", errors)
    require('url_prefix="/component-registry"' in routes_text, "Component Registry must have a dedicated Manager route.", errors)
    require("Reuse the pattern, not a copied page" in template_text, "Registry UI must explain the reuse boundary.", errors)
    require("does not inject markup" in template_text, "Registry UI must not imply metadata auto-injects custom-page markup.", errors)
    require("component_refs_present" in editor_text, "Project editor must support intentionally clearing recorded component refs.", errors)
    require("Detected automatically" in editor_text, "Project editor must distinguish safe structured-data inference from explicitly recorded visual patterns.", errors)
    require('{% if component.selected %}<input type="hidden" name="component_refs" value="{{ component.id }}">{% endif %}' in editor_text, "Explicit refs must survive when the same component is also inferred.", errors)
    require('"component_refs"' in schema_text, "Project schema must allow component_refs.", errors)
    require("COMPONENT_REGISTRY_PATH" in content_text and "unknown component reference" in content_text, "Structured-content validation must reject unknown component refs.", errors)
    require("REUSABLE COMPONENT REGISTRY" in create_service_text, "Create Content planning prompt must include the reusable component registry.", errors)
    require('"component_id": "existing component registry id or null"' in create_service_text, "Create Content plans must request registry-backed component IDs.", errors)
    require("_approved_plan_component_refs" in create_build_text, "Controlled builds must derive component refs from the approved plan.", errors)
    require('project_record["component_refs"]' in create_build_text, "Approved component refs must flow into new structured project metadata.", errors)
    require("Reuse:" in create_brief_text, "Content Plan UI must identify reusable-component recommendations.", errors)
    require("Approved reusable components" in create_build_template_text, "Controlled Build UI must show approved component metadata.", errors)

    try:
        module = load_module(SERVICE, "component_registry_check")
        usage = module.registry_with_usage()
        require(len(usage) == len(components), "Registry service should return every registered component.", errors)
        project_map = {project["id"]: project for project in module.list_projects()}
        certification = project_map.get("enterprise-sales-certification")
        require(certification is not None, "Expected structured project missing during registry test.", errors)
        if certification:
            inferred = set(module.inferred_component_ids(certification))
            require("related-work-cards" not in inferred, "related_work metadata must not imply a visible Related Work component.", errors)
            require("tabs-switcher" not in inferred, "Legacy generation metadata must not infer tab interactions.", errors)
            require("project-snapshot" not in inferred, "Structured metadata must not infer presentation components on an existing public page.", errors)
        try:
            module.validate_component_refs({}, ["not-a-real-component"])
        except module.ComponentRegistryError:
            pass
        else:
            errors.append("Unknown component references must be rejected.")
    except Exception as exc:
        errors.append(f"Component Registry service smoke test failed: {exc}")

    if errors:
        print("Component Registry validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(f"Component Registry validation passed ({len(components)} registered patterns).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
