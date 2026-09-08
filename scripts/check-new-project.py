from __future__ import annotations

import importlib.util
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = ROOT / "scripts" / "new-project.py"
TAXONOMY_PATH = ROOT / "portfolio-data" / "taxonomy.json"


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
        design_approach="Use the standard project model and renderer.",
        development_process="Generate structured data, render HTML, and validate the output.",
        outcomes=["The generated record renders without unresolved template tokens."],
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

    try:
        renderer = generator.load_renderer()
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir) / "generator-test-project.json"
            temp_path.write_text(json.dumps(record, indent=2), encoding="utf-8")
            rendered, output_path = renderer.render_project_text(temp_path)
            require("{{" not in rendered, "generated project should not contain unresolved template tokens", errors)
            require("Generator Test Project" in rendered, "rendered project title is missing", errors)
            require(output_path.name == "index.html", "renderer output should be an index.html page", errors)
    except Exception as exc:
        errors.append(f"generated record failed renderer test: {exc}")

    if errors:
        print("New-project generator validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("New-project generator validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
