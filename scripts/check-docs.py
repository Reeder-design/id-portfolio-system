from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "update-docs.py"
TAXONOMY_PATH = ROOT / "portfolio-data" / "taxonomy.json"
VERSION_PATH = ROOT / "portfolio-data" / "version.json"


def load_updater():
    spec = importlib.util.spec_from_file_location("portfolio_update_docs", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load scripts/update-docs.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    updater = load_updater()

    require(updater.bump_version("1.2.3", "patch") == "1.2.4", "patch bump is incorrect", errors)
    require(updater.bump_version("1.2.3", "minor") == "1.3.0", "minor bump is incorrect", errors)
    require(updater.bump_version("1.2.3", "major") == "2.0.0", "major bump is incorrect", errors)

    original = {
        "schema_version": "1.0.0",
        "current_version": "1.2.3",
        "releases": [],
    }
    updated = updater.apply_bump(original, "minor", "Add a new project", "2026-09-08")
    require(original["current_version"] == "1.2.3", "apply_bump should not mutate its input", errors)
    require(updated["current_version"] == "1.3.0", "apply_bump should set the next version", errors)
    require(updated["releases"][0]["summary"] == "Add a new project", "release summary was not preserved", errors)

    taxonomy = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    version_data = json.loads(VERSION_PATH.read_text(encoding="utf-8"))
    projects = updater.load_projects()
    outputs = updater.build_outputs(projects, taxonomy, version_data)

    inventory = outputs[updater.INVENTORY_PATH]
    portfolio_map = outputs[updater.MAP_PATH]
    changelog = outputs[updater.CHANGELOG_PATH]

    require("AI Training and Evaluation Demo" in inventory, "inventory is missing a structured project", errors)
    require("Pursuit Positioning Lab" in portfolio_map, "portfolio map is missing a structured project", errors)
    require(version_data["current_version"] in changelog, "changelog is missing the current version", errors)

    snapshot = ROOT / "docs" / "versions" / f"v{version_data['current_version']}.md"
    require(snapshot.exists(), "current version snapshot is missing", errors)

    stale = updater.check_outputs(outputs, version_data)
    require(not stale, f"generated documentation is stale: {', '.join(stale)}", errors)

    if errors:
        print("Documentation/versioning validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Documentation/versioning validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
