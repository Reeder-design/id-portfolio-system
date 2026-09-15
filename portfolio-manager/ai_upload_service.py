from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Optional
import base64
import hashlib
import json
import mimetypes
import re
import shutil
import uuid
import zipfile
import xml.etree.ElementTree as ET

from ai_service import MAX_GOAL_CHARS, MAX_SOURCE_CHARS, PRIVATE_ROOT, TASKS, preflight_source
from office_archive_safety import OfficeArchiveSafetyError, validate_office_archive


UPLOAD_ROOT = PRIVATE_ROOT / "ai-helper-uploads"
MAX_UPLOAD_FILES = 6
MAX_FILE_BYTES = 10 * 1024 * 1024
MAX_TOTAL_BYTES = 20 * 1024 * 1024

TEXT_EXTENSIONS = {
    ".txt", ".md", ".html", ".htm", ".json", ".csv", ".xml",
    ".py", ".js", ".ts", ".jsx", ".tsx", ".css", ".scss", ".sql",
    ".sh", ".bash", ".zsh", ".yaml", ".yml", ".toml", ".ini", ".cfg",
}
DOCUMENT_EXTENSIONS = {".pdf", ".docx", ".pptx", ".xlsx"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_EXTENSIONS = TEXT_EXTENSIONS | DOCUMENT_EXTENSIONS | IMAGE_EXTENSIONS


class AIUploadError(RuntimeError):
    pass


def _session_path(session_id: str) -> Path:
    if not re.fullmatch(r"upload-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}", session_id):
        raise AIUploadError("Invalid AI upload session id.")
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    path = (UPLOAD_ROOT / session_id).resolve()
    if UPLOAD_ROOT.resolve() not in path.parents:
        raise AIUploadError("Invalid AI upload session path.")
    return path


def _safe_filename(filename: str) -> str:
    name = Path(filename).name.strip()
    name = re.sub(r"[^A-Za-z0-9._ -]+", "_", name)
    return name[:180] or "attachment"


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _xml_text(xml_bytes: bytes) -> str:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return ""
    values: list[str] = []
    for node in root.iter():
        local = node.tag.rsplit("}", 1)[-1]
        if local in {"t", "v"} and node.text:
            cleaned = re.sub(r"\s+", " ", node.text).strip()
            if cleaned:
                values.append(cleaned)
    return "\n".join(values)


def _numeric_sort_key(name: str) -> tuple[int, str]:
    match = re.search(r"(\d+)", Path(name).stem)
    return (int(match.group(1)) if match else 0, name)


def _extract_docx(path: Path) -> str:
    with zipfile.ZipFile(path) as archive:
        try:
            return _xml_text(archive.read("word/document.xml"))
        except KeyError as exc:
            raise AIUploadError("Word document text could not be extracted.") from exc


def _extract_pptx(path: Path) -> str:
    parts: list[str] = []
    with zipfile.ZipFile(path) as archive:
        slide_names = sorted(
            [name for name in archive.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)],
            key=_numeric_sort_key,
        )
        for index, name in enumerate(slide_names, start=1):
            text = _xml_text(archive.read(name))
            if text:
                parts.append(f"[Slide {index}]\n{text}")
    return "\n\n".join(parts)


def _extract_xlsx(path: Path) -> str:
    parts: list[str] = []
    with zipfile.ZipFile(path) as archive:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            try:
                root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
                for si in root.iter():
                    if si.tag.rsplit("}", 1)[-1] != "si":
                        continue
                    text_parts = [
                        node.text or ""
                        for node in si.iter()
                        if node.tag.rsplit("}", 1)[-1] == "t"
                    ]
                    shared.append("".join(text_parts))
            except ET.ParseError:
                shared = []

        sheet_names = sorted(
            [name for name in archive.namelist() if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", name)],
            key=_numeric_sort_key,
        )
        for index, name in enumerate(sheet_names, start=1):
            try:
                root = ET.fromstring(archive.read(name))
            except ET.ParseError:
                continue
            cells: list[str] = []
            for cell in root.iter():
                if cell.tag.rsplit("}", 1)[-1] != "c":
                    continue
                ref = cell.attrib.get("r", "cell")
                cell_type = cell.attrib.get("t", "")
                value = ""
                if cell_type == "inlineStr":
                    value = "".join(
                        node.text or ""
                        for node in cell.iter()
                        if node.tag.rsplit("}", 1)[-1] == "t"
                    )
                else:
                    node_value = next(
                        (
                            node.text
                            for node in cell.iter()
                            if node.tag.rsplit("}", 1)[-1] == "v" and node.text is not None
                        ),
                        None,
                    )
                    if node_value is not None:
                        if cell_type == "s":
                            try:
                                value = shared[int(node_value)]
                            except (ValueError, IndexError):
                                value = node_value
                        else:
                            value = node_value
                value = re.sub(r"\s+", " ", value).strip()
                if value:
                    cells.append(f"{ref}: {value}")
            if cells:
                parts.append(f"[Worksheet {index}]\n" + "\n".join(cells))
    return "\n\n".join(parts)


def _extract_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise AIUploadError("PDF extraction requires the Portfolio Manager PDF dependency.") from exc
    try:
        reader = PdfReader(str(path))
        parts: list[str] = []
        for index, page in enumerate(reader.pages, start=1):
            text = (page.extract_text() or "").strip()
            if text:
                parts.append(f"[Page {index}]\n{text}")
        return "\n\n".join(parts)
    except Exception as exc:
        raise AIUploadError("PDF text could not be extracted safely.") from exc


def _extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".docx", ".pptx", ".xlsx"}:
        try:
            validate_office_archive(path)
        except OfficeArchiveSafetyError as exc:
            raise AIUploadError(str(exc)) from exc
    if suffix in TEXT_EXTENSIONS:
        return path.read_text(encoding="utf-8", errors="replace")
    if suffix == ".docx":
        return _extract_docx(path)
    if suffix == ".pptx":
        return _extract_pptx(path)
    if suffix == ".xlsx":
        return _extract_xlsx(path)
    if suffix == ".pdf":
        return _extract_pdf(path)
    raise AIUploadError("This attachment type does not support local text extraction.")


def _validate_image_signature(path: Path, suffix: str) -> None:
    prefix = path.read_bytes()[:16]
    valid = False
    if suffix == ".png":
        valid = prefix.startswith(b"\x89PNG\r\n\x1a\n")
    elif suffix in {".jpg", ".jpeg"}:
        valid = prefix.startswith(b"\xff\xd8\xff")
    elif suffix == ".webp":
        valid = len(prefix) >= 12 and prefix[:4] == b"RIFF" and prefix[8:12] == b"WEBP"
    if not valid:
        raise AIUploadError("An image attachment does not match its file extension. Use a valid PNG, JPEG, or WEBP file.")


def _write_session(record: dict[str, Any]) -> dict[str, Any]:
    session_dir = _session_path(str(record.get("id", "")))
    session_dir.mkdir(parents=True, exist_ok=True)
    (session_dir / "session.json").write_text(
        json.dumps(record, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return record


def prepare_upload_session(task: str, user_goal: str, pasted_source: str, uploaded_files) -> dict[str, Any]:
    if task not in TASKS:
        raise AIUploadError("Choose a valid AI task.")
    if len(user_goal) > MAX_GOAL_CHARS:
        raise AIUploadError(f"Goal/context is too long. Keep it under {MAX_GOAL_CHARS:,} characters.")
    if len(pasted_source) > MAX_SOURCE_CHARS:
        raise AIUploadError(f"Pasted source text is too long. Keep it under {MAX_SOURCE_CHARS:,} characters.")

    files = [item for item in uploaded_files if item and getattr(item, "filename", "")]
    if len(files) > MAX_UPLOAD_FILES:
        raise AIUploadError(f"Attach no more than {MAX_UPLOAD_FILES} files to one AI request.")
    if not pasted_source.strip() and not files:
        raise AIUploadError("Paste source text, attach at least one supported file, or do both.")

    session_id = f"upload-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    session_dir = _session_path(session_id)
    files_dir = session_dir / "files"
    files_dir.mkdir(parents=True, exist_ok=False)

    attachments: list[dict[str, Any]] = []
    total_bytes = 0
    sections: list[str] = []
    if pasted_source.strip():
        sections.append("[Pasted source text]\n" + pasted_source.strip())

    try:
        for index, uploaded in enumerate(files, start=1):
            original_name = _safe_filename(str(uploaded.filename))
            suffix = Path(original_name).suffix.lower()
            if suffix not in ALLOWED_EXTENSIONS:
                allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
                raise AIUploadError(f"Unsupported attachment type for {original_name}. Supported types: {allowed}")

            attachment_id = f"attachment-{index:02d}"
            stored_name = f"{attachment_id}{suffix}"
            destination = files_dir / stored_name
            uploaded.save(destination)
            size = destination.stat().st_size
            if size <= 0:
                raise AIUploadError(f"{original_name} is empty.")
            if size > MAX_FILE_BYTES:
                raise AIUploadError(f"{original_name} is larger than the {MAX_FILE_BYTES // (1024 * 1024)} MB per-file limit.")
            total_bytes += size
            if total_bytes > MAX_TOTAL_BYTES:
                raise AIUploadError(f"Total attachment size exceeds the {MAX_TOTAL_BYTES // (1024 * 1024)} MB request limit.")

            mime_type = mimetypes.guess_type(original_name)[0] or "application/octet-stream"
            kind = "image" if suffix in IMAGE_EXTENSIONS else "text"
            attachment: dict[str, Any] = {
                "id": attachment_id,
                "filename": original_name,
                "stored_filename": stored_name,
                "extension": suffix,
                "mime_type": mime_type,
                "kind": kind,
                "size_bytes": size,
                "sha256": _sha256(destination),
                "extracted_chars": 0,
                "truncated": False,
            }

            if kind == "image":
                _validate_image_signature(destination, suffix)
                sections.append(
                    f"[Image attachment: {original_name}]\n"
                    "The exact image file is attached separately for visual analysis."
                )
            else:
                try:
                    extracted = _extract_text(destination).strip()
                except (OSError, zipfile.BadZipFile) as exc:
                    raise AIUploadError(f"Could not extract reviewable text from {original_name}.") from exc
                if not extracted:
                    raise AIUploadError(
                        f"No reviewable text could be extracted from {original_name}. "
                        "For scanned or visual-only material, attach an image instead."
                    )
                remaining = MAX_SOURCE_CHARS - sum(len(section) + 2 for section in sections)
                header = f"[Extracted from {original_name}]\n"
                remaining -= len(header)
                if remaining <= 0:
                    raise AIUploadError(
                        "The pasted text and earlier attachments already fill the AI source limit. "
                        "Use fewer files or less pasted text."
                    )
                if len(extracted) > remaining:
                    extracted = extracted[:remaining].rstrip() + "\n[Extraction truncated locally before AI send]"
                    attachment["truncated"] = True
                attachment["extracted_chars"] = len(extracted)
                sections.append(header + extracted)

            attachments.append(attachment)

        combined_source = "\n\n".join(sections).strip()
        if len(combined_source) > MAX_SOURCE_CHARS:
            combined_source = combined_source[:MAX_SOURCE_CHARS].rstrip()
        if not combined_source:
            raise AIUploadError("The prepared AI request is empty.")

        checks = preflight_source(combined_source)
        record = {
            "id": session_id,
            "type": "ai-helper-upload-session",
            "created_at": datetime.now().isoformat(timespec="seconds"),
            "task": task,
            "user_goal": user_goal.strip(),
            "source_text": combined_source,
            "attachments": attachments,
            "preflight": checks,
            "has_images": any(item.get("kind") == "image" for item in attachments),
            "total_bytes": total_bytes,
        }
        return _write_session(record)
    except Exception:
        shutil.rmtree(session_dir, ignore_errors=True)
        raise


def load_upload_session(session_id: str) -> dict[str, Any]:
    session_dir = _session_path(session_id)
    path = session_dir / "session.json"
    if not path.exists():
        raise AIUploadError("Prepared AI request not found. Prepare the request again.")
    try:
        record = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AIUploadError("Prepared AI request could not be read.") from exc
    if not isinstance(record, dict) or record.get("type") != "ai-helper-upload-session":
        raise AIUploadError("Prepared AI request has an invalid format.")
    return record


def _attachment_record(session: dict[str, Any], attachment_id: str) -> dict[str, Any]:
    for item in session.get("attachments", []):
        if isinstance(item, dict) and item.get("id") == attachment_id:
            return item
    raise AIUploadError("Attachment not found in this prepared request.")


def attachment_path(session_id: str, attachment_id: str, image_only: bool = False) -> Path:
    session = load_upload_session(session_id)
    attachment = _attachment_record(session, attachment_id)
    if image_only and attachment.get("kind") != "image":
        raise AIUploadError("Only prepared image attachments can be previewed here.")
    files_dir = (_session_path(session_id) / "files").resolve()
    path = (files_dir / str(attachment.get("stored_filename", ""))).resolve()
    if files_dir not in path.parents or not path.exists() or not path.is_file():
        raise AIUploadError("Prepared attachment file is missing.")
    if _sha256(path) != attachment.get("sha256"):
        raise AIUploadError("Prepared attachment changed after review. Prepare the request again.")
    return path


def image_inputs_for_session(session: dict[str, Any]) -> list[dict[str, str]]:
    session_id = str(session.get("id", ""))
    values: list[dict[str, str]] = []
    for attachment in session.get("attachments", []):
        if not isinstance(attachment, dict) or attachment.get("kind") != "image":
            continue
        path = attachment_path(session_id, str(attachment.get("id", "")), image_only=True)
        mime_type = str(attachment.get("mime_type", "image/png"))
        encoded = base64.b64encode(path.read_bytes()).decode("ascii")
        values.append({
            "filename": str(attachment.get("filename", "image")),
            "mime_type": mime_type,
            "image_url": f"data:{mime_type};base64,{encoded}",
        })
    return values


def proposal_attachment_metadata(session: dict[str, Any]) -> list[dict[str, Any]]:
    metadata: list[dict[str, Any]] = []
    for attachment in session.get("attachments", []):
        if not isinstance(attachment, dict):
            continue
        metadata.append({
            "filename": str(attachment.get("filename", "")),
            "extension": str(attachment.get("extension", "")),
            "mime_type": str(attachment.get("mime_type", "")),
            "kind": str(attachment.get("kind", "")),
            "size_bytes": int(attachment.get("size_bytes", 0) or 0),
            "sha256": str(attachment.get("sha256", "")),
            "extracted_chars": int(attachment.get("extracted_chars", 0) or 0),
            "truncated": bool(attachment.get("truncated")),
        })
    return metadata


def delete_upload_session(session_id: str) -> None:
    session_dir = _session_path(session_id)
    shutil.rmtree(session_dir, ignore_errors=True)


def allowed_upload_summary() -> str:
    return "PDF, DOCX, PPTX, XLSX, CSV, text/Markdown, HTML, common code/config files, PNG, JPEG, and WEBP"
