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
SERVICE = MANAGER / "reference_library_service.py"
ROUTES = MANAGER / "reference_library_routes.py"
WORKSPACE = MANAGER / "templates" / "reference-library.html"
ITEM = MANAGER / "templates" / "reference-item.html"
CREATE_WORKSPACE = MANAGER / "templates" / "create-content.html"
APP = MANAGER / "app.py"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    for path in (SERVICE, ROUTES, WORKSPACE, ITEM, CREATE_WORKSPACE, APP):
        require(path.exists(), f"Missing Reference Library file: {path.relative_to(ROOT)}", errors)
    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    service = SERVICE.read_text(encoding="utf-8")
    routes = ROUTES.read_text(encoding="utf-8")
    workspace = WORKSPACE.read_text(encoding="utf-8")
    item = ITEM.read_text(encoding="utf-8")
    create_workspace = CREATE_WORKSPACE.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")

    for path, text in ((SERVICE, service), (ROUTES, routes)):
        try:
            ast.parse(text, filename=str(path), feature_version=(3, 9))
        except SyntaxError as exc:
            errors.append(f"Python 3.9 compatibility failed for {path.relative_to(ROOT)}: {exc}")

    require('REFERENCE_ROOT = PRIVATE_ROOT / "reference-library"' in service, "Reference Library must live under the private Git-ignored workspace.", errors)
    require('"status": "private-source"' in service, "New references must begin as Private Source.", errors)
    require('"sanitized_derivative": None' in service, "Original sources and sanitized derivatives must be separate records.", errors)
    require('kind not in {"original", "sanitized"}' in service, "Reference files must use explicit original/sanitized storage boundaries.", errors)
    require("sha256" in service and "_sha256" in service, "Stored reference files must keep audit hashes.", errors)
    require("MAX_UPLOAD_BYTES = 25 * 1024 * 1024" in service, "Reference uploads must retain the v1 size limit.", errors)
    require("ALLOWED_EXTENSIONS" in service, "Reference uploads must use an allowlisted set of professional source formats.", errors)
    require("Only a sanitized derivative can be approved for portfolio use" in service, "The original private source must never be directly approvable for public use.", errors)
    require("save_sanitized_derivative" in service and "delete_sanitized_derivative" in service, "Reference Library must maintain a separate sanitized derivative lifecycle.", errors)

    for forbidden in ("git add", "git commit", "git push", "portfolio/index.html", "render-project.py", "render-site-content.py"):
        require(forbidden not in service + routes, f"Reference Library must remain private and non-publishing: found {forbidden}", errors)

    require("send_file(path, as_attachment=True" in routes, "Reference source files must download as private attachments rather than render as public pages.", errors)
    require("app.register_blueprint(reference_library_bp)" in app, "Reference Library blueprint must be registered.", errors)
    require("Private-source boundary" in workspace and "Store first. Review before reuse." in workspace, "Reference Library must explain the private-source boundary.", errors)
    require("Add Private Source" in workspace, "Reference Library must provide a private upload action.", errors)
    require("Approved for Portfolio Use" in workspace, "Reference Library must expose the approved-source status filter.", errors)
    require("Preserved unchanged" in item and "Download Original" in item, "Reference item must clearly preserve the original source.", errors)
    require("Upload Sanitized Draft" in item or "Replace Sanitized Draft" in item, "Reference item must support a separate sanitized derivative.", errors)
    require("Ask AI About This Resource" in item and "Review for Sanitization" in item, "Reference item must reserve the next AI/sanitization actions.", errors)
    require("Open Reference Library" in create_workspace and "View Approved Sources" in create_workspace, "Create Content must expose the active Reference Library and approved-source view.", errors)

    sys.path.insert(0, str(MANAGER))
    try:
        import reference_library_service as library  # noqa: E402

        original_reference_root = library.REFERENCE_ROOT
        original_items_root = library.ITEMS_ROOT
        original_files_root = library.FILES_ROOT

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir) / "reference-library"
            library.REFERENCE_ROOT = temp_root
            library.ITEMS_ROOT = temp_root / "items"
            library.FILES_ROOT = temp_root / "files"

            original_upload = FileStorage(
                stream=BytesIO(b"private original source"),
                filename="source.txt",
                content_type="text/plain",
            )
            record = library.create_reference_item("Source Test", "private notes", "one, two", original_upload)
            item_id = record["id"]
            original_path = library.reference_file_path(item_id, "original")
            original_hash = record["original_file"]["sha256"]
            require(original_path.read_bytes() == b"private original source", "Original private source must be stored unchanged.", errors)

            try:
                library.update_reference_item(item_id, "Source Test", "private notes", "one, two", "approved-for-portfolio-use", "approved")
            except library.ReferenceLibraryError:
                pass
            else:
                errors.append("Original source must not be directly approvable without a sanitized derivative.")

            library.update_reference_item(item_id, "Source Test", "private notes", "one, two", "needs-review", "")
            sanitized_upload = FileStorage(
                stream=BytesIO(b"sanitized public-safe draft"),
                filename="source-sanitized.txt",
                content_type="text/plain",
            )
            library.save_sanitized_derivative(item_id, sanitized_upload)
            approved = library.update_reference_item(
                item_id,
                "Source Test",
                "private notes",
                "one, two",
                "approved-for-portfolio-use",
                "Reviewed derivative and approved for portfolio use.",
            )
            require(approved["status"] == "approved-for-portfolio-use", "Sanitized derivative should be explicitly approvable after review.", errors)
            require(library.reference_file_path(item_id, "sanitized").read_bytes() == b"sanitized public-safe draft", "Sanitized derivative must be stored separately.", errors)
            require(library.load_reference_item(item_id)["original_file"]["sha256"] == original_hash, "Sanitized workflow must not mutate the original source hash.", errors)
            require(original_path.read_bytes() == b"private original source", "Sanitized workflow must not overwrite the original source file.", errors)

            library.delete_sanitized_derivative(item_id)
            after_delete = library.load_reference_item(item_id)
            require(after_delete["sanitized_derivative"] is None, "Removing a sanitized draft must not leave derivative metadata behind.", errors)
            require(after_delete["status"] == "needs-review", "Removing the sanitized draft must return the item to Needs Review.", errors)
            require(original_path.exists(), "Removing a sanitized draft must preserve the original source.", errors)

            library.delete_reference_item(item_id)
            require(not library.ITEMS_ROOT.joinpath(f"{item_id}.json").exists(), "Deleting a reference item must remove its private metadata record.", errors)
            require(not library.FILES_ROOT.joinpath(item_id).exists(), "Deleting a reference item must remove its private stored files.", errors)

        library.REFERENCE_ROOT = original_reference_root
        library.ITEMS_ROOT = original_items_root
        library.FILES_ROOT = original_files_root

        os.environ["PORTFOLIO_MANAGER_SECRET_KEY"] = "ci-reference-library-key"
        os.environ["PORTFOLIO_MANAGER_PASSWORD_HASH"] = "ci-reference-library-placeholder"
        os.environ.pop("OPENAI_API_KEY", None)
        os.environ.pop("PORTFOLIO_MANAGER_AI_MODEL", None)

        import security as manager_security  # noqa: E402
        import ai_settings_service as manager_ai_settings  # noqa: E402

        manager_security.load_local_env = lambda *args, **kwargs: None
        manager_ai_settings.ENV_PATH = ROOT / ".portfolio-manager" / "__reference-library-test-no-ai.env"

        import app as manager_app  # noqa: E402

        client = manager_app.app.test_client()
        unauthenticated = client.get("/create/references/", follow_redirects=False)
        require(unauthenticated.status_code in {301, 302, 303, 307, 308}, "Unauthenticated Reference Library must redirect to login.", errors)

        with client.session_transaction() as session:
            session["portfolio_manager_authenticated"] = True

        library_page = client.get("/create/references/")
        require(library_page.status_code == 200, "Authenticated Reference Library workspace must render.", errors)
        require(b"Add Private Source" in library_page.data, "Reference Library runtime page must expose private source upload.", errors)
        require(b"Approved for Portfolio Use" in library_page.data, "Reference Library runtime page must expose the approval-status filter.", errors)

        create_page = client.get("/create/")
        require(create_page.status_code == 200, "Create Content workspace must continue to render with Reference Library enabled.", errors)
        require(b"Open Reference Library" in create_page.data, "Create Content runtime page must link into the Reference Library.", errors)
    except Exception as exc:
        errors.append(f"Reference Library runtime safety test failed: {exc}")

    if errors:
        print("Reference Library validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Reference Library safety validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
