from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "new-project.py"
TAXONOMY_PATH = ROOT / "portfolio-data" / "taxonomy.json"
SCHEMA_PATH = ROOT / "portfolio-data" / "schema" / "project.schema.json"


def load_generator():
    spec = importlib.util.spec_from_file_location("portfolio_new_project", SCRIPT_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Could not load scripts/new-project.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    generator = load_generator()
    taxonomy = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    categories = {item["id"]: item for item in taxonomy["categories"]}

    require(
        generator.slugify("Sales Discovery Lab!") == "sales-discovery-lab",
        "slugify should normalize punctuation and spaces",
        errors,
    )
    require(
        generator.slugify("  AI + QA Workflow  ") == "ai-qa-workflow",
        "slugify should collapse symbols and surrounding spaces",
        errors,
    )

    instructional = categories["instructional-design"]
    interactive = next(item for item in instructional["subcategories"] if item["id"] == "interactive-learning")
    require(
        generator.build_page_path(instructional, interactive, "sales-discovery-lab")
        == "portfolio/projects/instructional-design/interactive-learning/sales-discovery-lab/index.html",
        "instructional-design subcategory path is incorrect",
        errors,
    )

    ai_category = categories["ai-training-and-evaluation"]
    require(
        generator.build_page_path(ai_category, None, "evaluation-calibration")
        == "portfolio/projects/ai-training-and-evaluation/evaluation-calibration/index.html",
        "AI project path is incorrect",
        errors,
    )

    lms_category = categories["lms-administration"]
    require(
        generator.build_page_path(lms_category, None, "migration-case-study")
        == "portfolio/projects/lms-administration/migration-case-study/index.html",
        "LMS project path is incorrect",
        errors,
    )
    schema_categories = schema["properties"]["category"]["enum"]
    require(
        "lms-administration" in schema_categories,
        "structured project schema must allow LMS Administration projects",
        errors,
    )

    workflows = categories["workflows"]
    ai_automation = next(item for item in workflows["subcategories"] if item["id"] == "ai-automation")
    require(
        generator.build_page_path(workflows, ai_automation, "content-review-loop")
        == "portfolio/projects/workflows/ai-automation/content-review-loop/index.html",
        "workflow subcategory path is incorrect",
        errors,
    )

    record = generator.build_project_record(
        title="Generator Test Project",
        slug="generator-test-project",
        category=instructional,
        subcategory=interactive,
        status="building",
        summary="A generated test project used to validate the portfolio creation workflow.",
        confidentiality="public",
        featured=False,
        business_need="Validate that structured project creation works end to end.",
        audience="Portfolio maintainers.",
        learning_objectives=["Create valid structured project data."],
        role="Instructional Designer",
        design_approach="Use the structured project model without generating public HTML.",
        development_process="Generate structured data and validate the record without touching the live portfolio.",
        outcomes=["The structured record is valid and does not alter the public page."],
        skills=["Instructional Design"],
        tools=["Python"],
        today="2026-09-08",
    )

    require(record["id"] == "generator-test-project", "record id should match slug", errors)
    require(record["status"] == "building", "new record status should be preserved", errors)
    require(record["dates"]["created"] == "2026-09-08", "record date should be deterministic in test", errors)

    try:
        generator.build_project_record(
            title="Unsafe Live Project",
            slug="unsafe-live-project",
            category=ai_category,
            subcategory=None,
            status="live",
            summary="Should fail.",
            confidentiality="needs-sanitization",
            featured=False,
            business_need="Test safety.",
            audience="Test.",
            learning_objectives=["Fail safely."],
            role="Test.",
            design_approach="Test.",
            development_process="Test.",
            outcomes=["Test."],
            skills=[],
            tools=[],
            today="2026-09-08",
        )
        errors.append("needs-sanitization + live should be rejected")
    except ValueError:
        pass

    try:
        existing = json.loads((ROOT / "portfolio-data" / "projects" / "pursuit-positioning.json").read_text(encoding="utf-8"))
        generator.preflight(existing)
        errors.append("preflight should reject an existing project record/page")
    except ValueError:
        pass


    if errors:
        print("New-project generator validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    require(generator.create_project.__kwdefaults__.get("render") is False, "new project creation must default to record-only mode", errors)

    print("New-project record generator validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
