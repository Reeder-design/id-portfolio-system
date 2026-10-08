from __future__ import annotations

import json
import re
from pathlib import Path

from flask import Blueprint, render_template


REPO_ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_PATH = REPO_ROOT / ".portfolio-manager" / "removed-content" / "archive.json"

archive_bp = Blueprint("archive", __name__)


def archived_sections() -> list[dict[str, str]]:
    if not ARCHIVE_PATH.is_file():
        return []
    data = json.loads(ARCHIVE_PATH.read_text(encoding="utf-8"))
    if data.get("schema_version") != "1.0.0" or not isinstance(data.get("blocks"), list):
        raise ValueError("The private removed-content archive has an unsupported format.")

    sections: list[dict[str, str]] = []
    current: dict[str, str] | None = None
    part = "notes"
    for block in data["blocks"]:
        if not isinstance(block, str):
            continue
        if block.startswith("## "):
            current = {"title": block[3:].strip(), "notes": "", "visible": "", "original": "", "source_url": ""}
            sections.append(current)
            part = "notes"
            continue
        if current is None:
            continue
        if block.startswith("### Visible text"):
            part = "visible"
            continue
        if block.startswith("### Original HTML") or block.startswith("### Original JS"):
            part = "original"
            continue
        if part == "notes":
            match = re.search(r"https://github\.com/Reeder-design/id-portfolio-system/[^)\s]+", block)
            if match:
                current["source_url"] = match.group(0)
        if block.lstrip().startswith("```"):
            part = "original"
        value = block.strip()
        if part == "original" and value.startswith("```"):
            value = re.sub(r"^```[^\n]*\n", "", value)
            value = re.sub(r"\n```$", "", value)
        current[part] += ("\n\n" if current[part] else "") + value
    return sections


@archive_bp.route("/archive")
def archive_library():
    return render_template("archive.html", sections=archived_sections())
