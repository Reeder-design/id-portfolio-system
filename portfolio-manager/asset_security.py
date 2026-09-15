from __future__ import annotations

from pathlib import Path
import zipfile


class AssetSecurityError(ValueError):
    pass


def _starts_with(path: Path, prefixes: tuple[bytes, ...]) -> bool:
    with path.open("rb") as handle:
        head = handle.read(max(len(prefix) for prefix in prefixes))
    return any(head.startswith(prefix) for prefix in prefixes)


def _validate_ooxml(path: Path, expected_prefix: str) -> bool:
    try:
        with zipfile.ZipFile(path) as archive:
            names = archive.namelist()
    except (OSError, zipfile.BadZipFile):
        return False
    return "[Content_Types].xml" in names and any(name.startswith(expected_prefix) for name in names)


def validate_public_asset_file(path: Path, extension: str) -> None:
    """Reject files whose bytes do not match their public filename type.

    This is intentionally lightweight validation rather than antivirus scanning.
    The goal is to stop obvious extension spoofing before a file is copied into
    the GitHub Pages tree.
    """

    extension = extension.lower()
    if not path.exists() or not path.is_file() or path.stat().st_size <= 0:
        raise AssetSecurityError("The uploaded asset is empty or missing.")

    with path.open("rb") as handle:
        head = handle.read(16)

    valid = False
    if extension == ".png":
        valid = head.startswith(b"\x89PNG\r\n\x1a\n")
    elif extension in {".jpg", ".jpeg"}:
        valid = head.startswith(b"\xff\xd8\xff")
    elif extension == ".gif":
        valid = head.startswith((b"GIF87a", b"GIF89a"))
    elif extension == ".webp":
        valid = len(head) >= 12 and head[:4] == b"RIFF" and head[8:12] == b"WEBP"
    elif extension == ".pdf":
        valid = head.startswith(b"%PDF-")
    elif extension == ".mp4":
        valid = len(head) >= 8 and head[4:8] == b"ftyp"
    elif extension == ".webm":
        valid = head.startswith(b"\x1a\x45\xdf\xa3")
    elif extension == ".docx":
        valid = _validate_ooxml(path, "word/")
    elif extension == ".pptx":
        valid = _validate_ooxml(path, "ppt/")
    elif extension == ".xlsx":
        valid = _validate_ooxml(path, "xl/")

    if not valid:
        raise AssetSecurityError(
            f"The uploaded file contents do not match the {extension or 'selected'} file type. "
            "Rename-only file-type changes are blocked before anything enters portfolio/."
        )
