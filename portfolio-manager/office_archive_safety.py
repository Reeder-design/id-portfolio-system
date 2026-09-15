from __future__ import annotations

from pathlib import Path
import zipfile


MAX_ARCHIVE_MEMBERS = 5000
MAX_REVIEW_XML_MEMBER_BYTES = 8 * 1024 * 1024
MAX_REVIEW_XML_TOTAL_BYTES = 32 * 1024 * 1024
OFFICE_EXTENSIONS = {".docx", ".pptx", ".xlsx"}


class OfficeArchiveSafetyError(RuntimeError):
    pass


def _is_review_xml(name: str) -> bool:
    normalized = name.replace("\\", "/").lower()
    return normalized.endswith(".xml") or normalized.endswith(".rels")


def validate_office_archive(path: Path) -> None:
    """Reject Office ZIP containers with unreasonable reviewable expansion before extraction."""
    if path.suffix.lower() not in OFFICE_EXTENSIONS:
        return

    try:
        with zipfile.ZipFile(path) as archive:
            infos = archive.infolist()
            if len(infos) > MAX_ARCHIVE_MEMBERS:
                raise OfficeArchiveSafetyError(
                    f"Office file contains too many archive entries ({len(infos):,})."
                )

            review_total = 0
            for info in infos:
                if info.is_dir() or not _is_review_xml(info.filename):
                    continue
                if info.flag_bits & 0x1:
                    raise OfficeArchiveSafetyError("Encrypted Office archive content cannot be reviewed safely.")
                if info.file_size < 0 or info.compress_size < 0:
                    raise OfficeArchiveSafetyError("Office archive contains invalid size metadata.")
                if info.file_size > MAX_REVIEW_XML_MEMBER_BYTES:
                    raise OfficeArchiveSafetyError(
                        "Office file contains an XML component that expands beyond the local review limit."
                    )
                review_total += info.file_size
                if review_total > MAX_REVIEW_XML_TOTAL_BYTES:
                    raise OfficeArchiveSafetyError(
                        "Office file expands beyond the total XML review limit."
                    )
    except zipfile.BadZipFile as exc:
        raise OfficeArchiveSafetyError("Office file is not a valid ZIP-based document.") from exc
