from __future__ import annotations

from datetime import datetime
from html import escape, unescape
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlsplit
import hashlib
import json
import re
import shutil
import sys
import uuid

from validation_service import run_command, run_full_validation


REPO_ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO_ROOT = (REPO_ROOT / "portfolio").resolve()
PRIVATE_ROOT = REPO_ROOT / ".portfolio-manager"
REVIEWS_ROOT = PRIVATE_ROOT / "related-references"
BACKUPS_ROOT = PRIVATE_ROOT / "related-reference-backups"

ELEMENT_PATTERN = re.compile(
    r"(?is)<(?P<tag>h1|h2|h3|h4|a|button|span|strong|p)\b(?P<attrs>[^>]*)>"
    r"(?P<text>[^<>]*)</(?P=tag)>"
)
ANCHOR_PATTERN = re.compile(
    r"(?is)<a\b(?P<attrs>[^>]*)\bhref=(?P<quote>[\"'])(?P<href>[^\"']+)(?P=quote)(?P<rest>[^>]*)>"
    r"(?P<text>[^<>]*)</a>"
)
HEADING_PATTERN = re.compile(
    r"(?is)<(?P<tag>h2|h3|h4)\b(?P<attrs>[^>]*)>(?P<text>[^<>]*)</(?P=tag)>"
)


class RelatedReferenceError(RuntimeError):
    pass


def _normalized(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _safe_repo_path(raw_path: str) -> Path:
    path = (REPO_ROOT / raw_path).resolve()
    if path != PORTFOLIO_ROOT and PORTFOLIO_ROOT not in path.parents:
        raise RelatedReferenceError("Related reference must stay inside the public portfolio.")
    if not path.exists() or not path.is_file():
        raise RelatedReferenceError("A related-reference file is missing.")
    return path


def _review_path(review_id: str) -> Path:
    if not re.fullmatch(r"refs-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}", review_id):
        raise RelatedReferenceError("Invalid Related References review id.")
    REVIEWS_ROOT.mkdir(parents=True, exist_ok=True)
    path = (REVIEWS_ROOT / f"{review_id}.json").resolve()
    if REVIEWS_ROOT.resolve() not in path.parents:
        raise RelatedReferenceError("Invalid Related References review path.")
    return path


def _preview_url(path: Path) -> str:
    relative = str(path.relative_to(PORTFOLIO_ROOT)).replace("\\", "/")
    if relative == "index.html":
        return "http://127.0.0.1:8000/"
    if relative.endswith("index.html"):
        relative = relative[: -len("index.html")]
    return "http://127.0.0.1:8000/" + relative


def _resolved_href(source_file: Path, href: str) -> Optional[Path]:
    parsed = urlsplit(href.strip())
    if parsed.scheme or parsed.netloc or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    raw = parsed.path.strip()
    if not raw:
        return None
    if raw.startswith("/"):
        target = (PORTFOLIO_ROOT / raw.lstrip("/")).resolve()
    else:
        target = (source_file.parent / raw).resolve()
    if raw.endswith("/") or target.is_dir():
        target = target / "index.html"
    try:
        target.relative_to(PORTFOLIO_ROOT)
    except ValueError:
        return None
    return target


def _replacement_fragment(match: re.Match, new_text: str) -> str:
    full = match.group(0)
    start = match.start("text") - match.start(0)
    end = match.end("text") - match.start(0)
    return full[:start] + escape(new_text, quote=False) + full[end:]


def _candidate(
    *,
    candidate_id: str,
    path: Path,
    html_text: str,
    match: re.Match,
    current_text: str,
    suggested_text: str,
    kind: str,
    reason: str,
) -> dict[str, Any]:
    return {
        "id": candidate_id,
        "path": str(path.relative_to(REPO_ROOT)).replace("\\", "/"),
        "file_sha256": _sha256(html_text),
        "kind": kind,
        "current_text": current_text,
        "suggested_text": suggested_text,
        "reason": reason,
        "find": match.group(0),
        "replace": _replacement_fragment(match, suggested_text),
        "preview_url": _preview_url(path),
    }


def _suggest_link_label(current_text: str, old_title: str, new_title: str) -> Optional[str]:
    current = _normalized(current_text)
    if not current:
        return None
    if current == old_title:
        return new_title
    if old_title and old_title in current:
        return current.replace(old_title, new_title)

    action_match = re.match(r"^(Open|Explore|View|See|Read|Launch)\s+(.+)$", current, flags=re.I)
    if action_match:
        remainder = action_match.group(2).strip().lower()
        if remainder not in {"project", "case study", "demo", "example", "work"}:
            return f"{action_match.group(1)} {new_title}"
    return None


def _article_bounds(html_text: str, position: int) -> Optional[tuple[int, int]]:
    start = html_text.rfind("<article", 0, position)
    if start < 0:
        return None
    open_end = html_text.find(">", start)
    close = html_text.find("</article>", position)
    if open_end < 0 or close < 0 or open_end > position:
        return None
    return start, close + len("</article>")


def scan_related_references(
    *,
    target_path: str,
    old_title: str,
    new_title: str,
) -> list[dict[str, Any]]:
    target = _safe_repo_path(target_path)
    candidates: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    counter = 0

    def add_candidate(path: Path, html_text: str, match: re.Match, current: str, suggested: str, kind: str, reason: str) -> None:
        nonlocal counter
        fragment = match.group(0)
        if not suggested or _normalized(current) == _normalized(suggested):
            return
        if html_text.count(fragment) != 1:
            return
        key = (str(path), fragment)
        if key in seen:
            return
        seen.add(key)
        counter += 1
        candidates.append(
            _candidate(
                candidate_id=f"ref-{counter:03d}",
                path=path,
                html_text=html_text,
                match=match,
                current_text=_normalized(current),
                suggested_text=_normalized(suggested),
                kind=kind,
                reason=reason,
            )
        )

    for path in sorted(PORTFOLIO_ROOT.rglob("*.html")):
        if not path.is_file():
            continue
        html_text = path.read_text(encoding="utf-8")

        if old_title:
            for match in ELEMENT_PATTERN.finditer(html_text):
                current = _normalized(match.group("text"))
                if current == old_title:
                    add_candidate(
                        path,
                        html_text,
                        match,
                        current,
                        new_title,
                        "exact-title",
                        "This visible label exactly matches the previous title.",
                    )

        for anchor in ANCHOR_PATTERN.finditer(html_text):
            resolved = _resolved_href(path, anchor.group("href"))
            if resolved != target:
                continue

            current_link = _normalized(anchor.group("text"))
            suggested_link = _suggest_link_label(current_link, old_title, new_title)
            if suggested_link:
                add_candidate(
                    path,
                    html_text,
                    anchor,
                    current_link,
                    suggested_link,
                    "linked-label",
                    "This link points directly to the edited page and uses a page/project-specific label.",
                )

            bounds = _article_bounds(html_text, anchor.start())
            if not bounds:
                continue
            article_start, article_end = bounds
            article_html = html_text[article_start:article_end]
            heading_matches = list(HEADING_PATTERN.finditer(article_html))
            if not heading_matches:
                continue
            heading = heading_matches[-1]
            absolute_start = article_start + heading.start()
            absolute_end = article_start + heading.end()
            absolute_match = ELEMENT_PATTERN.search(html_text, absolute_start, absolute_end)
            if absolute_match is None:
                continue
            current_heading = _normalized(absolute_match.group("text"))
            if current_heading:
                add_candidate(
                    path,
                    html_text,
                    absolute_match,
                    current_heading,
                    new_title,
                    "linked-card-heading",
                    "This card contains a link to the edited page, so its heading is a deterministic related reference.",
                )

    candidates.sort(key=lambda item: (item["path"], item["id"]))
    return candidates


def create_related_reference_review(
    *,
    source_kind: str,
    source_id: str,
    source_label: str,
    target_path: str,
    old_title: str,
    new_title: str,
    automatic_updates: Optional[list[str]] = None,
) -> dict[str, Any]:
    candidates = scan_related_references(
        target_path=target_path,
        old_title=old_title,
        new_title=new_title,
    )
    review_id = f"refs-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:8]}"
    record = {
        "id": review_id,
        "type": "related-references",
        "status": "pending",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "source_kind": source_kind,
        "source_id": source_id,
        "source_label": source_label,
        "target_path": target_path,
        "source_preview_url": _preview_url(_safe_repo_path(target_path)),
        "change": {
            "old_title": old_title,
            "new_title": new_title,
        },
        "automatic_updates": list(automatic_updates or []),
        "references": candidates,
    }
    _review_path(review_id).write_text(
        json.dumps(record, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return record


def load_related_reference_review(review_id: str) -> dict[str, Any]:
    path = _review_path(review_id)
    if not path.exists():
        raise RelatedReferenceError("Related References review not found.")
    try:
        record = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RelatedReferenceError("Related References review could not be read.") from exc
    if not isinstance(record, dict) or record.get("type") != "related-references":
        raise RelatedReferenceError("This record is not a Related References review.")
    return record


def _write_review(record: dict[str, Any]) -> None:
    _review_path(str(record["id"])).write_text(
        json.dumps(record, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def _custom_replacement(candidate: dict[str, Any], replacement_text: str) -> str:
    find = str(candidate["find"])
    match = ELEMENT_PATTERN.fullmatch(find)
    if match is None:
        raise RelatedReferenceError("A related reference no longer has a safe editable text shape.")
    return _replacement_fragment(match, replacement_text)


def apply_related_reference_decisions(review_id: str, form) -> dict[str, Any]:
    record = load_related_reference_review(review_id)
    if record.get("status") != "pending":
        raise RelatedReferenceError("This Related References review has already been completed.")

    references = record.get("references", [])
    decisions: list[dict[str, Any]] = []
    grouped: dict[str, list[tuple[dict[str, Any], str]]] = {}

    for candidate in references:
        candidate_id = str(candidate.get("id", ""))
        decision = str(form.get(f"decision__{candidate_id}", "")).strip()
        if decision not in {"update", "edit", "leave"}:
            raise RelatedReferenceError("Choose Update, Edit Suggested Text, or Leave Unchanged for every related reference.")

        replacement_text = str(candidate.get("suggested_text", ""))
        if decision == "edit":
            replacement_text = str(form.get(f"custom__{candidate_id}", "")).strip()
            if not replacement_text:
                raise RelatedReferenceError("Custom related-reference text cannot be blank.")

        decisions.append({
            "id": candidate_id,
            "decision": decision,
            "replacement_text": replacement_text if decision in {"update", "edit"} else None,
        })
        if decision in {"update", "edit"}:
            grouped.setdefault(str(candidate["path"]), []).append((candidate, replacement_text))

    originals: dict[str, str] = {}
    prepared_updates: dict[str, str] = {}
    applied_hashes: dict[str, str] = {}

    for raw_path, edits in grouped.items():
        path = _safe_repo_path(raw_path)
        current = path.read_text(encoding="utf-8")
        expected_hashes = {str(candidate.get("file_sha256", "")) for candidate, _ in edits}
        if len(expected_hashes) != 1 or _sha256(current) not in expected_hashes:
            raise RelatedReferenceError(
                f"{raw_path} changed after this review was created. Reload the source edit and run Related References again."
            )

        updated = current
        for candidate, replacement_text in edits:
            find = str(candidate.get("find", ""))
            if not find or updated.count(find) != 1:
                raise RelatedReferenceError(
                    f"A reference in {raw_path} no longer has exactly one safe match. No reference updates were applied."
                )
            replace = _custom_replacement(candidate, replacement_text)
            updated = updated.replace(find, replace, 1)

        originals[raw_path] = current
        prepared_updates[raw_path] = updated
        applied_hashes[raw_path] = _sha256(updated)

    backup_dir = (BACKUPS_ROOT / review_id).resolve()
    BACKUPS_ROOT.mkdir(parents=True, exist_ok=True)
    if BACKUPS_ROOT.resolve() not in backup_dir.parents:
        raise RelatedReferenceError("Invalid Related References backup path.")
    if backup_dir.exists():
        shutil.rmtree(backup_dir)
    backup_dir.mkdir(parents=True, exist_ok=False)
    (backup_dir / "files.json").write_text(
        json.dumps(originals, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    validation_output = ""
    try:
        for raw_path, updated in prepared_updates.items():
            _safe_repo_path(raw_path).write_text(updated, encoding="utf-8")

        docs_result = run_command([sys.executable, "scripts/update-docs.py"])
        if not docs_result["success"]:
            raise RuntimeError(docs_result["stderr"] or docs_result["stdout"] or "Documentation refresh failed.")
        validation_ok, validation_output = run_full_validation()
        if not validation_ok:
            raise RuntimeError(validation_output)
    except Exception as exc:
        for raw_path, original in originals.items():
            _safe_repo_path(raw_path).write_text(original, encoding="utf-8")
        run_command([sys.executable, "scripts/update-docs.py"])
        shutil.rmtree(backup_dir, ignore_errors=True)
        raise RelatedReferenceError(
            "The selected reference updates did not pass validation, so Portfolio Manager restored those related pages. "
            f"Details: {str(exc)[:1400]}"
        ) from exc

    record.update({
        "status": "reviewed",
        "reviewed_at": datetime.now().isoformat(timespec="seconds"),
        "decisions": decisions,
        "updated_paths": sorted(grouped.keys()),
        "applied_hashes": applied_hashes,
        "validation_output": validation_output,
    })
    _write_review(record)
    return record


def delete_related_reference_review(review_id: str) -> None:
    record = load_related_reference_review(review_id)
    if record.get("status") == "reviewed" and record.get("updated_paths"):
        raise RelatedReferenceError(
            "This review changed related pages. Keep the review record until those local changes are published or reverted through Git."
        )
    path = _review_path(review_id)
    if path.exists():
        path.unlink()
    backup_dir = BACKUPS_ROOT / review_id
    shutil.rmtree(backup_dir, ignore_errors=True)
