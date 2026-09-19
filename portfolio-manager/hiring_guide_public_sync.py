from __future__ import annotations

from copy import deepcopy
from datetime import datetime
from pathlib import Path
from typing import Any
import hashlib
import json
import re
import shutil

from ai_service import REPO_ROOT
from hiring_guide_service import (
    HIRING_ROOT,
    HiringGuideLibraryError,
    load_library,
)
from validation_service import run_full_validation


PUBLIC_FAQ_PATH = REPO_ROOT / "portfolio" / "data" / "hiring-faq.json"
PUBLIC_EXPANDED_PATH = REPO_ROOT / "portfolio" / "data" / "hiring-faq-expanded.json"
PUBLIC_SPECIALIST_PATH = REPO_ROOT / "portfolio" / "data" / "hiring-faq-specialist.json"
PUBLIC_SEARCH_PATH = REPO_ROOT / "portfolio" / "data" / "hiring-search.json"

SYNC_ROOT = HIRING_ROOT / "public-sync"
PROPOSAL_PATH = SYNC_ROOT / "proposal.json"
BACKUP_ROOT = SYNC_ROOT / "backups"

APPLY_CONFIRMATION = "APPLY PUBLIC HIRING GUIDE"

STOP_WORDS = {
    "a", "an", "and", "are", "about", "can", "do", "does", "did", "for", "from",
    "have", "has", "how", "i", "in", "is", "me", "my", "of", "on", "or", "show",
    "tell", "the", "to", "what", "where", "with", "you", "your",
}

DEFAULT_EVIDENCE_PATHS = {
    "EV-01": "projects/instructional-design/complete-learning-paths/enterprise-sales-certification/index.html",
    "EV-02": "projects/instructional-design/interactive-learning/meddpicc-practice/index.html",
    "EV-03": "projects/instructional-design/interactive-learning/pursuit-positioning/index.html",
    "EV-04": "projects/instructional-design/microlearning-performance-support/vertical-positioning-microlearning/index.html",
    "EV-05": "projects/instructional-design/microlearning-performance-support/product-launch-microlearning/index.html",
    "EV-06": "projects/instructional-design/live-training/virtual-sales-workshop-facilitation/index.html",
    "EV-07": "projects/instructional-design/multimedia/index.html",
    "EV-08": "projects/lms-administration/index.html",
    "EV-09": "projects/lms-administration/learning-platform-operations-migration-readiness/index.html",
    "EV-10": "projects/workflows/data-reporting/certification-reporting-automation/index.html",
    "EV-11": "projects/workflows/index.html",
    "EV-12": "projects/ai-training-and-evaluation/ai-training-and-evaluation-demo/index.html",
    "EV-13": "projects/ai-training-and-evaluation/rubric-demo/index.html",
    "EV-14": "projects/ai-training-and-evaluation/workflow-demo/index.html",
    "EV-15": "hiring-manager/index.html",
    "EV-16": "about/index.html",
    "EV-17": "projects/instructional-design/complete-learning-paths/enterprise-sales-certification/index.html",
    "EV-18": "about/index.html",
}


class HiringGuidePublicSyncError(RuntimeError):
    pass


def _now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _json(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise HiringGuidePublicSyncError(f"Could not read {path.relative_to(REPO_ROOT)}.") from exc
    if not isinstance(payload, dict):
        raise HiringGuidePublicSyncError(f"{path.relative_to(REPO_ROOT)} must contain a JSON object.")
    return payload


def _hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _normalize(value: Any) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9+#.\-\s]", " ", str(value or "").lower())).strip()


def _tokens(value: Any) -> list[str]:
    return [
        token
        for token in _normalize(value).split()
        if len(token) > 1 and token not in STOP_WORDS
    ]


def _slug(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", str(value or "").lower()).strip("-")
    return cleaned[:80] or "hiring-question"


def _safe_short_label(question: str) -> str:
    value = re.sub(r"[?.!]+$", "", str(question or "").strip())
    if len(value) <= 58:
        return value
    return value[:55].rstrip() + "…"


def _load_public_questions() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    faq = _json(PUBLIC_FAQ_PATH)
    expanded = _json(PUBLIC_EXPANDED_PATH)
    base = [deepcopy(item) for item in faq.get("questions", []) if isinstance(item, dict)]
    extra = [deepcopy(item) for item in expanded.get("questions", []) if isinstance(item, dict)]
    return base, extra


def _search_entries() -> list[dict[str, Any]]:
    data = _json(PUBLIC_SEARCH_PATH)
    return [item for item in data.get("entries", []) if isinstance(item, dict)]


def _evidence_catalog() -> dict[str, dict[str, str]]:
    catalog: dict[str, dict[str, str]] = {}
    for path in [PUBLIC_FAQ_PATH, PUBLIC_EXPANDED_PATH, PUBLIC_SPECIALIST_PATH]:
        if not path.exists():
            continue
        payload = _json(path)
        for question in payload.get("questions", []):
            if not isinstance(question, dict):
                continue
            for item in question.get("evidence", []):
                if not isinstance(item, dict):
                    continue
                title = str(item.get("title") or "").strip()
                public_path = str(item.get("path") or "").strip()
                if title and public_path:
                    catalog.setdefault(_normalize(title), {
                        "title": title,
                        "path": public_path,
                        "note": str(item.get("note") or "").strip(),
                    })
    for entry in _search_entries():
        title = str(entry.get("title") or "").strip()
        public_path = str(entry.get("path") or "").strip()
        if title and public_path:
            catalog.setdefault(_normalize(title), {
                "title": title,
                "path": public_path,
                "note": str(entry.get("summary") or "").strip(),
            })
    return catalog


def _catalog_by_path() -> dict[str, dict[str, str]]:
    result: dict[str, dict[str, str]] = {}
    for item in _evidence_catalog().values():
        if item.get("path"):
            result.setdefault(item["path"], item)
    return result


def _public_evidence(private_record: dict[str, Any]) -> tuple[dict[str, str] | None, str | None]:
    evidence_id = str(private_record.get("id") or "")
    title = str(private_record.get("title") or "").strip()
    explicit_path = str(private_record.get("public_path") or "").strip()
    path = explicit_path or DEFAULT_EVIDENCE_PATHS.get(evidence_id, "")

    catalog = _evidence_catalog()
    title_match = catalog.get(_normalize(title))
    if not path and title_match:
        return deepcopy(title_match), None

    if path:
        by_path = _catalog_by_path().get(path)
        note = str(private_record.get("public_note") or "").strip()
        if not note and by_path:
            note = by_path.get("note", "")
        if not note:
            proves = [str(item).strip() for item in private_record.get("proves", []) if str(item).strip()]
            note = "Portfolio evidence for " + ", ".join(proves[:3]) + "." if proves else "Public portfolio evidence."
        public_title = str(private_record.get("public_title") or "").strip()
        if not public_title:
            public_title = by_path.get("title", "") if by_path else title
        return {"title": public_title or title, "path": path, "note": note}, None

    return None, f"{evidence_id} · {title} has no public evidence mapping."


def _match_score(private_qa: dict[str, Any], public_question: dict[str, Any]) -> int:
    private_phrases = [
        private_qa.get("question", ""),
        *private_qa.get("variants", []),
    ]
    public_phrases = [
        public_question.get("prompt", ""),
        public_question.get("short_label", ""),
    ]
    normalized_private = [_normalize(item) for item in private_phrases if _normalize(item)]
    normalized_public = [_normalize(item) for item in public_phrases if _normalize(item)]

    for left in normalized_private:
        for right in normalized_public:
            if left == right:
                return 100
            if len(left) >= 18 and len(right) >= 18 and (left in right or right in left):
                return 88

    private_tokens = set(_tokens(" ".join(str(item) for item in private_phrases)))
    public_tokens = set(_tokens(" ".join(str(item) for item in public_phrases)))
    if not private_tokens or not public_tokens:
        return 0
    overlap = len(private_tokens & public_tokens)
    union = len(private_tokens | public_tokens)
    jaccard = overlap / union if union else 0

    private_tags = {_normalize(item) for item in private_qa.get("tags", []) if _normalize(item)}
    public_keywords = {_normalize(item) for item in public_question.get("keywords", []) if _normalize(item)}
    tag_overlap = len(private_tags & public_keywords)

    return round(jaccard * 80 + min(tag_overlap * 6, 18))


def _best_match(private_qa: dict[str, Any], candidates: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, int]:
    ranked = sorted(
        ((item, _match_score(private_qa, item)) for item in candidates),
        key=lambda pair: pair[1],
        reverse=True,
    )
    if not ranked or ranked[0][1] < 70:
        return None, ranked[0][1] if ranked else 0
    if len(ranked) > 1 and ranked[0][1] - ranked[1][1] < 8 and ranked[0][1] < 95:
        return None, ranked[0][1]
    return ranked[0]


def _keyword_list(private_qa: dict[str, Any], existing: dict[str, Any] | None) -> list[str]:
    values: list[str] = []
    for source in [
        existing.get("keywords", []) if existing else [],
        private_qa.get("tags", []),
        private_qa.get("variants", []),
    ]:
        for item in source:
            cleaned = str(item or "").strip()
            if cleaned and cleaned not in values:
                values.append(cleaned)
    for token in _tokens(private_qa.get("question", "")):
        if token not in values:
            values.append(token)
    return values[:36]


def _private_lookup(private_questions: list[dict[str, Any]]) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for item in private_questions:
        for phrase in [item.get("question", ""), *item.get("variants", [])]:
            normalized = _normalize(phrase)
            if normalized:
                lookup.setdefault(normalized, str(item.get("id") or ""))
    return lookup


def _compile_question(
    private_qa: dict[str, Any],
    *,
    existing: dict[str, Any] | None,
    existing_tier: str,
    private_to_public_id: dict[str, str],
    private_lookup: dict[str, str],
    evidence_by_id: dict[str, dict[str, Any]],
) -> tuple[dict[str, Any], list[str]]:
    warnings: list[str] = []
    public_id = str(existing.get("id")) if existing else _slug(str(private_qa.get("id") or ""))
    record = {
        "id": public_id,
        "category": str(private_qa.get("category") or (existing or {}).get("category") or "Interview Questions"),
        "short_label": str((existing or {}).get("short_label") or _safe_short_label(str(private_qa.get("question") or ""))),
        "prompt": str(private_qa.get("question") or ""),
        "featured": bool((existing or {}).get("featured", False)),
        "keywords": _keyword_list(private_qa, existing),
        "answer": str(private_qa.get("answer") or ""),
        "evidence": [],
        "followups": [],
    }

    for evidence_id in private_qa.get("evidence_ids", []):
        evidence = evidence_by_id.get(str(evidence_id))
        if not evidence:
            warnings.append(f"{private_qa.get('id')} references missing private evidence {evidence_id}.")
            continue
        mapped, mapping_warning = _public_evidence(evidence)
        if mapping_warning:
            warnings.append(mapping_warning)
        if mapped:
            record["evidence"].append(mapped)
        status = str(evidence.get("status") or "unknown")
        if status != "demonstrated":
            warnings.append(
                f"{private_qa.get('id')} uses {evidence_id} with {status} evidence. Review wording before apply."
            )

    for followup in private_qa.get("followups", []):
        target_private_id = private_lookup.get(_normalize(followup))
        if target_private_id and target_private_id in private_to_public_id:
            target = private_to_public_id[target_private_id]
            if target not in record["followups"]:
                record["followups"].append(target)

    if not record["followups"] and existing:
        record["followups"] = [
            str(item)
            for item in existing.get("followups", [])
            if str(item).strip()
        ][:3]

    if str(private_qa.get("confidence") or "").lower() not in {"high", "medium-high"}:
        warnings.append(
            f"{private_qa.get('id')} has {private_qa.get('confidence') or 'unrated'} confidence."
        )
    if str(private_qa.get("review_status") or "canonical") != "canonical":
        warnings.append(
            f"{private_qa.get('id')} is marked {private_qa.get('review_status')}; it should not normally be public."
        )
    if str(private_qa.get("notes") or "").strip():
        warnings.append(f"{private_qa.get('id')} has editorial notes that should be reviewed.")

    record["_tier"] = existing_tier or "expanded"
    record["_private_id"] = str(private_qa.get("id") or "")
    return record, warnings


def _strip_internal(question: dict[str, Any]) -> dict[str, Any]:
    return {key: deepcopy(value) for key, value in question.items() if not key.startswith("_")}


def _question_map(base: list[dict[str, Any]], expanded: list[dict[str, Any]]) -> dict[str, tuple[str, dict[str, Any]]]:
    result: dict[str, tuple[str, dict[str, Any]]] = {}
    for tier, items in [("core", base), ("expanded", expanded)]:
        for item in items:
            item_id = str(item.get("id") or "")
            if item_id:
                result[item_id] = (tier, item)
    return result


def _changed_fields(before: dict[str, Any], after: dict[str, Any]) -> list[str]:
    fields = []
    for key in ["category", "short_label", "prompt", "featured", "keywords", "answer", "evidence", "followups"]:
        if before.get(key) != after.get(key):
            fields.append(key)
    return fields


def build_proposal() -> dict[str, Any]:
    library = load_library()
    current_core, current_expanded = _load_public_questions()
    current_questions = [*current_core, *current_expanded]

    canonical_private = [
        deepcopy(item)
        for item in library.get("qa", [])
        if str(item.get("review_status") or "canonical") == "canonical"
    ]
    evidence_by_id = {
        str(item.get("id")): item
        for item in library.get("evidence", [])
        if isinstance(item, dict) and item.get("id")
    }

    matches: dict[str, tuple[dict[str, Any] | None, str, int]] = {}
    used_public_ids: set[str] = set()
    current_by_id = _question_map(current_core, current_expanded)

    for private_qa in canonical_private:
        available = [item for item in current_questions if str(item.get("id") or "") not in used_public_ids]
        match, score = _best_match(private_qa, available)
        if match:
            public_id = str(match.get("id"))
            used_public_ids.add(public_id)
            tier = current_by_id.get(public_id, ("expanded", {}))[0]
            matches[str(private_qa.get("id"))] = (match, tier, score)
        else:
            matches[str(private_qa.get("id"))] = (None, "expanded", score)

    private_to_public_id = {
        private_id: str(match.get("id")) if match else _slug(private_id)
        for private_id, (match, _tier, _score) in matches.items()
    }
    private_lookup = _private_lookup(canonical_private)

    compiled_by_id: dict[str, dict[str, Any]] = {}
    warnings: list[str] = []
    match_log: list[dict[str, Any]] = []

    for private_qa in canonical_private:
        private_id = str(private_qa.get("id"))
        existing, tier, score = matches[private_id]
        compiled, question_warnings = _compile_question(
            private_qa,
            existing=existing,
            existing_tier=tier,
            private_to_public_id=private_to_public_id,
            private_lookup=private_lookup,
            evidence_by_id=evidence_by_id,
        )
        compiled_by_id[str(compiled["id"])] = compiled
        warnings.extend(question_warnings)
        match_log.append({
            "private_id": private_id,
            "question": str(private_qa.get("question") or ""),
            "public_id": str(compiled["id"]),
            "matched_existing": bool(existing),
            "match_score": score,
            "tier": tier,
        })

    proposed_core: list[dict[str, Any]] = []
    proposed_expanded: list[dict[str, Any]] = []

    for tier, items in [("core", current_core), ("expanded", current_expanded)]:
        for existing in items:
            public_id = str(existing.get("id") or "")
            replacement = compiled_by_id.pop(public_id, None)
            output = _strip_internal(replacement) if replacement else deepcopy(existing)
            (proposed_core if tier == "core" else proposed_expanded).append(output)

    for compiled in sorted(compiled_by_id.values(), key=lambda item: (str(item.get("category")), str(item.get("prompt")))):
        proposed_expanded.append(_strip_internal(compiled))

    current_map = {str(item.get("id")): item for item in current_questions if item.get("id")}
    proposed_map = {
        str(item.get("id")): item
        for item in [*proposed_core, *proposed_expanded]
        if item.get("id")
    }

    added = []
    changed = []
    preserved = []
    for public_id, after in proposed_map.items():
        before = current_map.get(public_id)
        if before is None:
            added.append({"id": public_id, "question": after.get("prompt"), "category": after.get("category")})
        else:
            fields = _changed_fields(before, after)
            if fields:
                changed.append({
                    "id": public_id,
                    "question": after.get("prompt"),
                    "category": after.get("category"),
                    "fields": fields,
                    "before": before,
                    "after": after,
                })
            else:
                preserved.append(public_id)

    removed = [public_id for public_id in current_map if public_id not in proposed_map]

    source_hashes = {
        str(PUBLIC_FAQ_PATH.relative_to(REPO_ROOT)): _hash(PUBLIC_FAQ_PATH),
        str(PUBLIC_EXPANDED_PATH.relative_to(REPO_ROOT)): _hash(PUBLIC_EXPANDED_PATH),
    }

    proposal = {
        "schema_version": "1.0",
        "created_at": _now(),
        "source_hashes": source_hashes,
        "summary": {
            "private_canonical": len(canonical_private),
            "matched_existing": sum(1 for item in match_log if item["matched_existing"]),
            "new_public_questions": len(added),
            "changed_public_questions": len(changed),
            "preserved_legacy_questions": len(preserved),
            "removed_public_questions": len(removed),
            "warnings": len(dict.fromkeys(warnings)),
        },
        "warnings": list(dict.fromkeys(warnings)),
        "matches": match_log,
        "diff": {
            "added": added,
            "changed": changed,
            "removed": removed,
        },
        "outputs": {
            "hiring-faq.json": {"version": "1.0.0", "questions": proposed_core},
            "hiring-faq-expanded.json": {"version": "1.0.0", "questions": proposed_expanded},
        },
        "status": "preview",
    }

    SYNC_ROOT.mkdir(parents=True, exist_ok=True)
    PROPOSAL_PATH.write_text(json.dumps(proposal, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return proposal


def load_proposal() -> dict[str, Any] | None:
    if not PROPOSAL_PATH.exists():
        return None
    try:
        payload = json.loads(PROPOSAL_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    return payload if isinstance(payload, dict) else None


def _proposal_is_fresh(proposal: dict[str, Any]) -> bool:
    expected = proposal.get("source_hashes", {})
    for path in [PUBLIC_FAQ_PATH, PUBLIC_EXPANDED_PATH]:
        relative = str(path.relative_to(REPO_ROOT))
        if expected.get(relative) != _hash(path):
            return False
    return True


def score_question(query: str, question: dict[str, Any]) -> int:
    clean = _normalize(query)
    if not clean:
        return 0
    prompt = _normalize(question.get("prompt"))
    label = _normalize(question.get("short_label"))
    category = _normalize(question.get("category"))
    keywords = _normalize(" ".join(str(item) for item in question.get("keywords", [])))
    answer = _normalize(question.get("answer"))
    query_tokens = _tokens(query)
    score = 0
    if prompt and (prompt in clean or clean in prompt):
        score += 14
    if label and (label in clean or clean in label):
        score += 10
    if keywords and clean in keywords:
        score += 8
    for token in query_tokens:
        if token in label:
            score += 5
        if token in prompt:
            score += 4
        if token in keywords:
            score += 3
        if token in category:
            score += 2
        if token in answer:
            score += 1
    return score


def test_routing(query: str, proposal: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    proposal = proposal or load_proposal()
    if not proposal:
        raise HiringGuidePublicSyncError("Generate a public sync preview first.")
    questions = [
        *proposal.get("outputs", {}).get("hiring-faq.json", {}).get("questions", []),
        *proposal.get("outputs", {}).get("hiring-faq-expanded.json", {}).get("questions", []),
    ]
    ranked = sorted(
        [
            {
                "id": str(question.get("id") or ""),
                "category": str(question.get("category") or ""),
                "label": str(question.get("short_label") or ""),
                "prompt": str(question.get("prompt") or ""),
                "answer": str(question.get("answer") or ""),
                "score": score_question(query, question),
            }
            for question in questions
        ],
        key=lambda item: item["score"],
        reverse=True,
    )
    return [item for item in ranked if item["score"] > 0][:5]


def _backup_public_files() -> Path:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
    root = BACKUP_ROOT / stamp
    root.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PUBLIC_FAQ_PATH, root / PUBLIC_FAQ_PATH.name)
    shutil.copy2(PUBLIC_EXPANDED_PATH, root / PUBLIC_EXPANDED_PATH.name)
    return root


def _restore_backup(root: Path) -> None:
    shutil.copy2(root / PUBLIC_FAQ_PATH.name, PUBLIC_FAQ_PATH)
    shutil.copy2(root / PUBLIC_EXPANDED_PATH.name, PUBLIC_EXPANDED_PATH)


def apply_proposal(confirm_text: str) -> tuple[bool, str, dict[str, Any]]:
    if str(confirm_text or "").strip() != APPLY_CONFIRMATION:
        raise HiringGuidePublicSyncError(f"Type {APPLY_CONFIRMATION!r} exactly to apply the public sync.")

    proposal = load_proposal()
    if not proposal:
        raise HiringGuidePublicSyncError("Generate a public sync preview first.")
    if not _proposal_is_fresh(proposal):
        raise HiringGuidePublicSyncError(
            "The public Hiring Guide changed after this preview was generated. Generate a fresh preview before applying."
        )
    if proposal.get("diff", {}).get("removed"):
        raise HiringGuidePublicSyncError("This proposal would remove public questions. Regenerate or review before applying.")

    backup = _backup_public_files()
    try:
        PUBLIC_FAQ_PATH.write_text(
            json.dumps(proposal["outputs"]["hiring-faq.json"], indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        PUBLIC_EXPANDED_PATH.write_text(
            json.dumps(proposal["outputs"]["hiring-faq-expanded.json"], indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        success, validation_output = run_full_validation()
        if not success:
            _restore_backup(backup)
            return False, "Full Validation failed. Public Hiring Guide files were automatically restored.\n\n" + validation_output, proposal
    except Exception:
        _restore_backup(backup)
        raise

    proposal["status"] = "applied-local"
    proposal["applied_at"] = _now()
    proposal["backup_path"] = str(backup.relative_to(REPO_ROOT))
    PROPOSAL_PATH.write_text(json.dumps(proposal, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return True, "Public Hiring Guide sync applied locally and Full Validation passed. Nothing has been committed or published.", proposal
