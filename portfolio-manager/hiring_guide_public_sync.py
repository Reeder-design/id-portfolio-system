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
PUBLIC_ROUTING_POLICY_PATH = REPO_ROOT / "portfolio" / "data" / "hiring-routing-policy.json"

SYNC_ROOT = HIRING_ROOT / "public-sync"
PROPOSAL_PATH = SYNC_ROOT / "proposal.json"
BACKUP_ROOT = SYNC_ROOT / "backups"
MAPPING_OVERRIDES_PATH = SYNC_ROOT / "mapping-overrides.json"

APPLY_CONFIRMATION = "APPLY PUBLIC HIRING GUIDE"

DEFAULT_ROUTING_POLICY = {
    "stop_words": {
        "a", "an", "and", "are", "about", "can", "could", "did", "do", "does", "for", "from",
        "have", "has", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "please",
        "show", "tell", "the", "to", "what", "where", "which", "who", "why", "with", "would", "you", "your",
        "thing", "things", "really", "just", "some", "something", "stuff", "kind", "sort", "one",
    },
    "min_answer_score": 8,
    "min_answer_margin": 3,
    "typo_aliases": {
        "automtion": "automation", "certfication": "certification", "certifcation": "certification",
        "evaluaton": "evaluation", "evalution": "evaluation", "experiance": "experience",
        "experince": "experience", "expreince": "experience", "faciliatation": "facilitation",
        "instrucional": "instructional", "interative": "interactive", "migraton": "migration",
        "mirgation": "migration", "multmedia": "multimedia", "performace": "performance",
        "perfromance": "performance", "suport": "support",
    },
}

GENERIC_MATCH_TOKENS = {
    "answer", "answers", "career", "experience", "help", "information", "job", "project",
    "projects", "question", "questions", "role", "team", "work",
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


def _routing_policy() -> dict[str, Any]:
    try:
        raw = _json(PUBLIC_ROUTING_POLICY_PATH)
    except HiringGuidePublicSyncError:
        raw = {}
    stop_words = raw.get("stop_words", DEFAULT_ROUTING_POLICY["stop_words"])
    if not isinstance(stop_words, list):
        stop_words = DEFAULT_ROUTING_POLICY["stop_words"]
    typo_aliases = raw.get("typo_aliases", DEFAULT_ROUTING_POLICY["typo_aliases"])
    if not isinstance(typo_aliases, dict):
        typo_aliases = DEFAULT_ROUTING_POLICY["typo_aliases"]
    return {
        "stop_words": {str(word).lower() for word in stop_words if str(word).strip()},
        "typo_aliases": {
            _normalize(source): _normalize(target)
            for source, target in typo_aliases.items()
            if _normalize(source) and _normalize(target)
        },
        "min_answer_score": int(raw.get("min_answer_score", DEFAULT_ROUTING_POLICY["min_answer_score"])),
        "min_answer_margin": int(raw.get("min_answer_margin", DEFAULT_ROUTING_POLICY["min_answer_margin"])),
    }


def _canonical_token(token: str) -> str:
    return _routing_policy()["typo_aliases"].get(token, token)


def _tokens(value: Any) -> list[str]:
    policy = _routing_policy()
    return [
        canonical
        for token in _normalize(value).split()
        if len(canonical := _canonical_token(token)) > 1
        and canonical not in policy["stop_words"]
        and canonical not in GENERIC_MATCH_TOKENS
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


def _token_overlap(left: Any, right: Any) -> float:
    left_tokens = set(_tokens(left))
    right_tokens = set(_tokens(right))
    if not left_tokens or not right_tokens:
        return 0.0
    overlap = len(left_tokens & right_tokens)
    return overlap / min(len(left_tokens), len(right_tokens))


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
            if len(left) >= 16 and len(right) >= 16 and (left in right or right in left):
                return 92

    phrase_score = 0.0
    for left in private_phrases:
        for right in public_phrases:
            phrase_score = max(phrase_score, _token_overlap(left, right))

    private_tags = " ".join(str(item) for item in private_qa.get("tags", []))
    public_keywords = " ".join(str(item) for item in public_question.get("keywords", []))
    tag_score = _token_overlap(private_tags, public_keywords)

    category_score = _token_overlap(
        private_qa.get("category", ""),
        public_question.get("category", ""),
    )
    answer_score = _token_overlap(
        private_qa.get("answer", ""),
        public_question.get("answer", ""),
    )

    # Question/variant wording remains the primary signal. Tags, category, and
    # existing answer language help find likely conceptual duplicates without
    # being strong enough to auto-match on their own.
    score = (
        phrase_score * 62
        + tag_score * 14
        + category_score * 8
        + min(answer_score, 0.65) * 16
    )
    return min(99, round(score))


def _rank_matches(private_qa: dict[str, Any], candidates: list[dict[str, Any]]) -> list[tuple[dict[str, Any], int]]:
    return sorted(
        ((item, _match_score(private_qa, item)) for item in candidates),
        key=lambda pair: pair[1],
        reverse=True,
    )


def _best_match(private_qa: dict[str, Any], candidates: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, int]:
    ranked = _rank_matches(private_qa, candidates)
    if not ranked or ranked[0][1] < 78:
        return None, ranked[0][1] if ranked else 0
    if len(ranked) > 1 and ranked[0][1] - ranked[1][1] < 10 and ranked[0][1] < 96:
        return None, ranked[0][1]
    return ranked[0]


def load_mapping_overrides() -> dict[str, dict[str, str]]:
    if not MAPPING_OVERRIDES_PATH.exists():
        return {}
    try:
        payload = json.loads(MAPPING_OVERRIDES_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    if not isinstance(payload, dict):
        return {}
    overrides: dict[str, dict[str, str]] = {}
    for private_id, value in payload.items():
        if not isinstance(value, dict):
            continue
        mode = str(value.get("mode") or "")
        public_id = str(value.get("public_id") or "")
        if mode in {"match", "new"}:
            overrides[str(private_id)] = {"mode": mode, "public_id": public_id}
    return overrides


def save_mapping_override(private_id: str, mode: str, public_id: str = "") -> dict[str, dict[str, str]]:
    private_id = str(private_id or "").strip()
    mode = str(mode or "").strip()
    public_id = str(public_id or "").strip()
    if not private_id:
        raise HiringGuidePublicSyncError("Choose a private Hiring Guide record first.")
    if mode not in {"auto", "match", "new"}:
        raise HiringGuidePublicSyncError("Unsupported mapping choice.")

    library = load_library()
    canonical_ids = {
        str(item.get("id"))
        for item in library.get("qa", [])
        if str(item.get("review_status") or "canonical") == "canonical"
    }
    if private_id not in canonical_ids:
        raise HiringGuidePublicSyncError("That private Q&A is not a canonical Hiring Guide record.")

    overrides = load_mapping_overrides()
    if mode == "auto":
        overrides.pop(private_id, None)
    elif mode == "new":
        overrides[private_id] = {"mode": "new", "public_id": ""}
    else:
        current_core, current_expanded = _load_public_questions()
        public_ids = {
            str(item.get("id"))
            for item in [*current_core, *current_expanded]
            if item.get("id")
        }
        if public_id not in public_ids:
            raise HiringGuidePublicSyncError("Choose a valid existing public question.")
        for other_private_id, value in overrides.items():
            if (
                other_private_id != private_id
                and value.get("mode") == "match"
                and value.get("public_id") == public_id
            ):
                raise HiringGuidePublicSyncError(
                    f"{public_id} is already manually mapped to {other_private_id}."
                )
        overrides[private_id] = {"mode": "match", "public_id": public_id}

    SYNC_ROOT.mkdir(parents=True, exist_ok=True)
    MAPPING_OVERRIDES_PATH.write_text(
        json.dumps(overrides, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return overrides


def _candidate_rows(
    private_qa: dict[str, Any],
    candidates: list[dict[str, Any]],
    current_by_id: dict[str, tuple[str, dict[str, Any]]],
    limit: int = 4,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for item, score in _rank_matches(private_qa, candidates)[:limit]:
        public_id = str(item.get("id") or "")
        rows.append({
            "public_id": public_id,
            "label": str(item.get("short_label") or item.get("prompt") or public_id),
            "prompt": str(item.get("prompt") or ""),
            "category": str(item.get("category") or ""),
            "tier": current_by_id.get(public_id, ("expanded", {}))[0],
            "score": score,
        })
    return rows


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


def _warning_groups(warnings: list[str]) -> list[dict[str, Any]]:
    groups = {
        "emerging": {"label": "Non-demonstrated evidence", "items": []},
        "notes": {"label": "Editorial notes", "items": []},
        "mapping": {"label": "Missing public evidence mapping", "items": []},
        "confidence": {"label": "Confidence review", "items": []},
        "other": {"label": "Other review items", "items": []},
    }
    for warning in dict.fromkeys(warnings):
        lowered = warning.lower()
        if " emerging evidence" in lowered or " inferred evidence" in lowered or " audited evidence" in lowered:
            groups["emerging"]["items"].append(warning)
        elif "editorial notes" in lowered:
            groups["notes"]["items"].append(warning)
        elif "no public evidence mapping" in lowered:
            groups["mapping"]["items"].append(warning)
        elif " confidence" in lowered:
            groups["confidence"]["items"].append(warning)
        else:
            groups["other"]["items"].append(warning)
    return [
        {"key": key, "label": value["label"], "count": len(value["items"]), "items": value["items"]}
        for key, value in groups.items()
        if value["items"]
    ]


def _group_added(added: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for item in added:
        grouped.setdefault(str(item.get("category") or "Other"), []).append(item)
    return [
        {"category": category, "count": len(items), "items": items}
        for category, items in sorted(grouped.items())
    ]


def build_proposal() -> dict[str, Any]:
    library = load_library()
    current_core, current_expanded = _load_public_questions()
    current_questions = [*current_core, *current_expanded]
    current_by_id = _question_map(current_core, current_expanded)
    overrides = load_mapping_overrides()

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

    matches: dict[str, tuple[dict[str, Any] | None, str, int, str, list[dict[str, Any]]]] = {}
    used_public_ids: set[str] = set()

    # Manual matches always win and reserve their public record before automatic matching.
    for private_qa in canonical_private:
        private_id = str(private_qa.get("id"))
        override = overrides.get(private_id, {})
        if override.get("mode") != "match":
            continue
        public_id = str(override.get("public_id") or "")
        if public_id in used_public_ids:
            raise HiringGuidePublicSyncError(f"More than one private Q&A maps to {public_id}.")
        current = current_by_id.get(public_id)
        if not current:
            raise HiringGuidePublicSyncError(
                f"Saved mapping for {private_id} points to missing public question {public_id}."
            )
        tier, public_question = current
        candidates = _candidate_rows(private_qa, current_questions, current_by_id)
        matches[private_id] = (public_question, tier, 100, "manual-match", candidates)
        used_public_ids.add(public_id)

    for private_qa in canonical_private:
        private_id = str(private_qa.get("id"))
        if private_id in matches:
            continue
        override = overrides.get(private_id, {})
        available = [
            item
            for item in current_questions
            if str(item.get("id") or "") not in used_public_ids
        ]
        candidates = _candidate_rows(private_qa, available, current_by_id)
        if override.get("mode") == "new":
            top_score = candidates[0]["score"] if candidates else 0
            matches[private_id] = (None, "expanded", top_score, "manual-new", candidates)
            continue

        match, score = _best_match(private_qa, available)
        if match:
            public_id = str(match.get("id"))
            used_public_ids.add(public_id)
            tier = current_by_id.get(public_id, ("expanded", {}))[0]
            matches[private_id] = (match, tier, score, "auto-match", candidates)
        else:
            review_required = score >= 32
            decision = "review" if review_required else "auto-new"
            matches[private_id] = (None, "expanded", score, decision, candidates)

    private_to_public_id = {
        private_id: str(match.get("id")) if match else _slug(private_id)
        for private_id, (match, _tier, _score, _decision, _candidates) in matches.items()
    }
    private_lookup = _private_lookup(canonical_private)

    compiled_by_id: dict[str, dict[str, Any]] = {}
    warnings: list[str] = []
    match_log: list[dict[str, Any]] = []

    for private_qa in canonical_private:
        private_id = str(private_qa.get("id"))
        existing, tier, score, decision, candidates = matches[private_id]
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
            "category": str(private_qa.get("category") or ""),
            "question": str(private_qa.get("question") or ""),
            "public_id": str(compiled["id"]),
            "matched_existing": bool(existing),
            "match_score": score,
            "tier": tier,
            "decision": decision,
            "requires_review": decision == "review",
            "manual": decision.startswith("manual-"),
            "candidates": candidates,
        })

    proposed_core: list[dict[str, Any]] = []
    proposed_expanded: list[dict[str, Any]] = []

    for tier, items in [("core", current_core), ("expanded", current_expanded)]:
        for existing in items:
            public_id = str(existing.get("id") or "")
            replacement = compiled_by_id.pop(public_id, None)
            output = _strip_internal(replacement) if replacement else deepcopy(existing)
            (proposed_core if tier == "core" else proposed_expanded).append(output)

    for compiled in sorted(
        compiled_by_id.values(),
        key=lambda item: (str(item.get("category")), str(item.get("prompt"))),
    ):
        proposed_expanded.append(_strip_internal(compiled))

    current_map = {
        str(item.get("id")): item
        for item in current_questions
        if item.get("id")
    }
    proposed_map = {
        str(item.get("id")): item
        for item in [*proposed_core, *proposed_expanded]
        if item.get("id")
    }

    added: list[dict[str, Any]] = []
    changed: list[dict[str, Any]] = []
    preserved: list[str] = []
    for public_id, after in proposed_map.items():
        before = current_map.get(public_id)
        if before is None:
            added.append({
                "id": public_id,
                "question": after.get("prompt"),
                "category": after.get("category"),
            })
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
    unresolved = [item for item in match_log if item["requires_review"]]
    manual_count = sum(1 for item in match_log if item["manual"])
    confirmed_matches = sum(1 for item in match_log if item["matched_existing"])
    safe_new = sum(
        1
        for item in match_log
        if item["decision"] in {"auto-new", "manual-new"}
    )

    source_hashes = {
        PUBLIC_FAQ_PATH.name: _hash(PUBLIC_FAQ_PATH),
        PUBLIC_EXPANDED_PATH.name: _hash(PUBLIC_EXPANDED_PATH),
    }
    unique_warnings = list(dict.fromkeys(warnings))
    apply_ready = not unresolved and not removed

    proposal = {
        "schema_version": "1.1",
        "created_at": _now(),
        "source_hashes": source_hashes,
        "summary": {
            "private_canonical": len(canonical_private),
            "matched_existing": confirmed_matches,
            "new_public_questions": len(added),
            "changed_public_questions": len(changed),
            "preserved_legacy_questions": len(preserved),
            "removed_public_questions": len(removed),
            "warnings": len(unique_warnings),
            "mapping_review_required": len(unresolved),
            "manual_decisions": manual_count,
            "safe_new": safe_new,
            "apply_ready": apply_ready,
        },
        "warnings": unique_warnings,
        "warning_groups": _warning_groups(unique_warnings),
        "matches": match_log,
        "public_questions": [
            {
                "id": str(item.get("id") or ""),
                "label": str(item.get("short_label") or item.get("prompt") or item.get("id") or ""),
                "prompt": str(item.get("prompt") or ""),
                "category": str(item.get("category") or ""),
                "tier": current_by_id.get(str(item.get("id") or ""), ("expanded", {}))[0],
            }
            for item in current_questions
            if item.get("id")
        ],
        "diff": {
            "added": added,
            "added_by_category": _group_added(added),
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
    PROPOSAL_PATH.write_text(
        json.dumps(proposal, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return proposal

def _proposal_is_renderable(payload: Any) -> bool:
    if not isinstance(payload, dict) or str(payload.get("schema_version") or "") != "1.1":
        return False
    summary = payload.get("summary")
    diff = payload.get("diff")
    if not isinstance(summary, dict) or not isinstance(diff, dict):
        return False
    required_summary = {
        "private_canonical",
        "matched_existing",
        "new_public_questions",
        "changed_public_questions",
        "preserved_legacy_questions",
        "removed_public_questions",
        "warnings",
        "mapping_review_required",
        "manual_decisions",
        "safe_new",
        "apply_ready",
    }
    required_diff = {"added", "added_by_category", "changed", "removed"}
    if not required_summary.issubset(summary):
        return False
    if not required_diff.issubset(diff):
        return False
    if not isinstance(payload.get("matches"), list):
        return False
    if not isinstance(payload.get("public_questions"), list):
        return False
    if not isinstance(payload.get("warning_groups"), list):
        return False
    if not isinstance(payload.get("outputs"), dict):
        return False
    return True


def load_proposal() -> dict[str, Any] | None:
    if not PROPOSAL_PATH.exists():
        return None
    try:
        payload = json.loads(PROPOSAL_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    # Preview files are disposable private state. Older/incomplete proposals
    # should never be allowed to crash a newer review UI; simply require a
    # fresh preview while leaving the source Hiring Guide untouched.
    return payload if _proposal_is_renderable(payload) else None


def _proposal_is_fresh(proposal: dict[str, Any]) -> bool:
    expected = proposal.get("source_hashes", {})
    for path in [PUBLIC_FAQ_PATH, PUBLIC_EXPANDED_PATH]:
        if expected.get(path.name) != _hash(path):
            return False
    return True


def score_question(query: str, question: dict[str, Any]) -> int:
    return _score_question_match(query, question)["score"]


def _phrase_match(query: str, field: Any) -> bool:
    query_tokens = _tokens(query)
    field_tokens = _tokens(field)
    if len(query_tokens) < 2 or len(field_tokens) < 2:
        return False
    clean = " ".join(query_tokens)
    candidate = " ".join(field_tokens)
    return candidate in clean or clean in candidate


def _field_has_token(field: Any, token: str) -> bool:
    return token in _normalize(field).split()


def _score_question_match(query: str, question: dict[str, Any]) -> dict[str, Any]:
    clean = _normalize(query)
    if not clean:
        return {"score": 0, "matched_tokens": [], "exact_phrase": False}
    prompt = _normalize(question.get("prompt"))
    label = _normalize(question.get("short_label"))
    category = _normalize(question.get("category"))
    keyword_values = question.get("keywords", []) if isinstance(question.get("keywords", []), list) else []
    variant_values = question.get("variants", []) if isinstance(question.get("variants", []), list) else []
    keywords = _normalize(" ".join(str(item) for item in keyword_values))
    variants = _normalize(" ".join(str(item) for item in variant_values))
    query_tokens = _tokens(query)
    score = 0
    exact_phrase = False
    for field, points in [(prompt, 16), (label, 12)]:
        if _phrase_match(clean, field):
            score += points
            exact_phrase = True
    if any(_phrase_match(clean, item) for item in keyword_values):
        score += 10
        exact_phrase = True
    if any(_phrase_match(clean, item) for item in variant_values):
        score += 10
        exact_phrase = True
    matched_tokens: set[str] = set()
    for token in query_tokens:
        matched = False
        if _field_has_token(label, token):
            score += 5
            matched = True
        if _field_has_token(prompt, token):
            score += 4
            matched = True
        if _field_has_token(keywords, token):
            score += 4
            matched = True
        if _field_has_token(variants, token):
            score += 3
            matched = True
        if _field_has_token(category, token):
            score += 2
            matched = True
        if matched:
            matched_tokens.add(token)
    return {"score": score, "matched_tokens": sorted(matched_tokens), "exact_phrase": exact_phrase}


def _has_supported_question_match(match: dict[str, Any]) -> bool:
    policy = _routing_policy()
    return bool(
        match["score"] >= policy["min_answer_score"]
        and (match["exact_phrase"] or match["matched_tokens"])
    )


def test_routing(query: str, proposal: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    proposal = proposal or load_proposal()
    if not proposal:
        raise HiringGuidePublicSyncError("Generate a public sync preview first.")
    questions = [
        *proposal.get("outputs", {}).get("hiring-faq.json", {}).get("questions", []),
        *proposal.get("outputs", {}).get("hiring-faq-expanded.json", {}).get("questions", []),
    ]
    ranked = []
    for question in questions:
        match = _score_question_match(query, question)
        ranked.append({
            "id": str(question.get("id") or ""),
            "category": str(question.get("category") or ""),
            "label": str(question.get("short_label") or ""),
            "prompt": str(question.get("prompt") or ""),
            "answer": str(question.get("answer") or ""),
            "score": match["score"],
            "supported": _has_supported_question_match(match),
        })
    ranked.sort(key=lambda item: item["score"], reverse=True)
    return [item for item in ranked if item["supported"]][:5]


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
    if proposal.get("summary", {}).get("mapping_review_required"):
        raise HiringGuidePublicSyncError(
            "Resolve the remaining likely-duplicate mapping reviews before applying."
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
    proposal["backup_path"] = str(Path("public-sync") / "backups" / backup.name)
    PROPOSAL_PATH.write_text(json.dumps(proposal, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return True, "Public Hiring Guide sync applied locally and Full Validation passed. Nothing has been committed or published.", proposal
