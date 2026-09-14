from __future__ import annotations

from io import BytesIO
from pathlib import Path
import ast
import os
import sys
import tempfile

from werkzeug.datastructures import FileStorage


ROOT = Path(__file__).resolve().parents[1]
MANAGER = ROOT / "portfolio-manager"
SERVICE = MANAGER / "reference_ai_analysis_service.py"
ROUTES = MANAGER / "reference_library_routes.py"
TEMPLATE = MANAGER / "templates" / "reference-ai-analysis.html"
ITEM_TEMPLATE = MANAGER / "templates" / "reference-item.html"
UPLOAD_CSS = MANAGER / "static" / "ai-uploads.css"
VALIDATION = MANAGER / "validation_service.py"
WORKFLOW = ROOT / ".github" / "workflows" / "validate-site.yml"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path, label in [
        (SERVICE, "resource AI analysis service"),
        (ROUTES, "Reference Library routes"),
        (TEMPLATE, "resource AI analysis template"),
        (ITEM_TEMPLATE, "Reference Item template"),
        (UPLOAD_CSS, "AI upload/preview stylesheet"),
        (VALIDATION, "validation service"),
        (WORKFLOW, "GitHub validation workflow"),
    ]:
        require(path.exists(), f"Missing {label}: {path.relative_to(ROOT)}", errors)
    if errors:
        for item in errors:
            print(f"  - {item}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    template = TEMPLATE.read_text(encoding="utf-8")
    item_template = ITEM_TEMPLATE.read_text(encoding="utf-8")
    upload_css = UPLOAD_CSS.read_text(encoding="utf-8")
    validation = VALIDATION.read_text(encoding="utf-8")
    workflow = WORKFLOW.read_text(encoding="utf-8")

    for path, text in ((SERVICE, service), (ROUTES, routes)):
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require("Ask AI About This Resource" in item_template, "Reference Item must expose the active AI resource analysis action.", errors)
    require("Open AI Resource Analysis" in item_template, "Reference Item must link to the AI analysis workspace.", errors)
    require("AI analyzes. It does not approve, sanitize, or publish." in template, "AI analysis workspace must explain its advisory-only boundary.", errors)
    require("exact extracted text" in template.lower(), "Text resources must show the exact extracted text before send.", errors)
    require("not</strong> been OCR'd or content-preflighted locally" in template, "Image resources must disclose the visual preflight limitation.", errors)
    require('name="provider_ack"' in template and 'name="authority_ack"' in template, "AI resource analysis must require provider and authorization acknowledgements.", errors)
    require('name="visual_ack"' in template, "Image resource analysis must require a separate visual-content acknowledgement.", errors)
    require('name="sensitive_ack"' in template, "Text sensitivity warnings must require an additional acknowledgement.", errors)
    require('name="reviewed_sha256"' in template, "AI analysis must bind send approval to the source hash reviewed by the user.", errors)
    require("private Reference Library notes, tags, approval note, and other resources are not sent" in template, "AI analysis must clearly exclude unrelated private metadata.", errors)
    require("ai-upload-image-card" in template, "Image analysis must use the bounded preview viewport.", errors)
    require(".ai-upload-image-card" in upload_css and "height: 420px" in upload_css, "Image preview must use a predictable desktop viewport size.", errors)
    require("object-fit: contain" in upload_css, "Image preview must preserve aspect ratio without cropping.", errors)
    require("height: 280px" in upload_css, "Image preview must use a smaller responsive viewport on narrow screens.", errors)

    require("extract_reference_text" in service, "AI resource analysis must reuse local Reference Library text extraction.", errors)
    require("preflight_source" in service, "Extracted source text must pass the existing local secret/sensitivity preflight.", errors)
    require("reviewed_sha256 != context.get(\"source_sha256\")" in service, "AI analysis must reject a source that changed after review.", errors)
    require('record["ai_analysis"] = analysis' in service, "AI analysis result must stay attached to the private reference record.", errors)
    require('"source_kind": "original"' in service, "AI resource analysis must record which private source was analyzed.", errors)
    require("MAX_IMAGE_BYTES = 10 * 1024 * 1024" in service, "Visual AI analysis must keep an explicit image-send size limit.", errors)
    require('"type": "input_image"' in service, "Supported image resources must use an explicit visual AI input.", errors)
    require("load_taxonomy()" in service, "Resource analysis may use only the public portfolio taxonomy for placement suggestions.", errors)
    require("Never invent employers" in service, "Resource analysis instructions must prohibit invented professional claims.", errors)
    require("Do not claim that the resource is sanitized" in service, "Resource analysis must not blur analysis with sanitization/approval.", errors)
    require("skills_demonstrated" in service and "evidence_present" in service and "evidence_gaps" in service, "Resource analysis must cover skills plus evidence and gaps.", errors)
    require("portfolio_opportunities" in service and "reusable_elements" in service and "suggested_placement" in service, "Resource analysis must cover portfolio possibilities, reusable elements, and placement.", errors)

    require('request.form.get("provider_ack") != "on"' in routes, "AI analysis route must enforce provider acknowledgement server-side.", errors)
    require('request.form.get("authority_ack") != "on"' in routes, "AI analysis route must enforce authorization acknowledgement server-side.", errors)
    require('request.form.get("visual_ack") != "on"' in routes, "AI analysis route must enforce image acknowledgement server-side.", errors)
    require('request.form.get("sensitive_ack") != "on"' in routes, "AI analysis route must enforce sensitivity acknowledgement server-side.", errors)
    require("run_resource_analysis" in routes, "Reference Library route must delegate analysis to the isolated service.", errors)
    require("as_attachment=False" in routes, "Private images must be previewable locally before visual AI send.", errors)

    for forbidden in ("git add", "git commit", "git push", "render-project.py", "render-site-content.py", "portfolio/index.html"):
        require(forbidden not in service + routes, f"AI resource analysis must not gain public-write or publishing authority: found {forbidden}", errors)

    require("scripts/check-reference-ai-analysis.py" in validation, "Portfolio Manager Full Validation must include resource AI analysis safety.", errors)
    require("python scripts/check-reference-ai-analysis.py" in workflow, "GitHub Actions must run the resource AI analysis safety regression.", errors)

    sys.path.insert(0, str(MANAGER))
    try:
        import reference_library_service as library  # noqa: E402
        import reference_ai_analysis_service as analysis_service  # noqa: E402

        normalized = analysis_service.normalize_analysis({
            "resource_summary": "Useful evidence",
            "skills_demonstrated": [{"skill": "Analysis", "evidence": "The source compares outputs."}],
            "evidence_present": [{"evidence": "A rubric", "portfolio_value": "Shows evaluation criteria."}],
            "portfolio_opportunities": [{"title": "Case Study", "format": "case study", "angle": "Show decisions", "evidence_to_use": ["rubric"], "evidence_needed": ["outcomes"]}],
            "suggested_placement": {"category": "instructional-design", "subcategory": "interactive-learning", "rationale": "Fits the work."},
        })
        require(normalized["skills_demonstrated"][0]["skill"] == "Analysis", "Resource AI structured-result normalization failed.", errors)
        require(normalized["portfolio_opportunities"][0]["title"] == "Case Study", "Resource AI opportunity normalization failed.", errors)

        original_reference_root = library.REFERENCE_ROOT
        original_items_root = library.ITEMS_ROOT
        original_files_root = library.FILES_ROOT
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir) / "reference-library"
            library.REFERENCE_ROOT = temp_root
            library.ITEMS_ROOT = temp_root / "items"
            library.FILES_ROOT = temp_root / "files"

            upload = FileStorage(
                stream=BytesIO(b"Public-safe sample demonstrating workflow analysis and instructional design."),
                filename="analysis-source.txt",
                content_type="text/plain",
            )
            record = library.create_reference_item("Analysis Source", "private note excluded", "test", upload)
            context = analysis_service.resource_analysis_context(record["id"])
            require(context["supported"] is True and context["mode"] == "text", "Text Reference Library source must be locally reviewable for AI analysis.", errors)
            require("workflow analysis" in context["text"], "Resource analysis context must expose the exact extracted text.", errors)
            require(context["source_sha256"] == record["original_file"]["sha256"], "Resource analysis context must preserve the original source hash.", errors)
            require(not context["blocked"], "Ordinary safe test text must not be blocked by local preflight.", errors)

        library.REFERENCE_ROOT = original_reference_root
        library.ITEMS_ROOT = original_items_root
        library.FILES_ROOT = original_files_root
    except Exception as exc:
        errors.append(f"Resource AI analysis runtime safety checks could not run: {exc}")

    if errors:
        print("Reference Library AI analysis validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print("Reference Library AI analysis safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
