from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any
import json
import re

from ai_service import PRIVATE_ROOT, load_proposal
from page_copy_service import PAGE_REGISTRY


REPO_ROOT = Path(__file__).resolve().parents[1]
PROJECTS_ROOT = REPO_ROOT / "portfolio-data" / "projects"
USAGE_ROOT = PRIVATE_ROOT / "ai-proposal-usage"
CUSTOM_PROJECT_PAGE_IDS = {
    "meddpicc-practice": "meddpicc-demo",
    "pursuit-positioning": "pursuit-determination-demo",
    "ai-training-and-evaluation-demo": "ai-evaluation-demo",
}
HIDDEN_PAGE_DESTINATIONS = set(CUSTOM_PROJECT_PAGE_IDS.values())
ALLOWED_ACTIONS = {
    "saved-for-later",
    "staged-existing-content",
    "started-content-brief",
}


class AIHandoffError(RuntimeError):
    pass


def _usage_path(proposal_id: str) -> Path:
    if not re.fullmatch(r"ai-[0-9]{8}-[0-9]{6}-[a-f0-9]{8}", proposal_id):
        raise AIHandoffError("Invalid AI proposal id.")
    USAGE_ROOT.mkdir(parents=True, exist_ok=True)
    path = (USAGE_ROOT / f"{proposal_id}.json").resolve()
    if USAGE_ROOT.resolve() not in path.parents:
        raise AIHandoffError("Invalid AI proposal usage path.")
    return path


def load_usage(proposal_id: str) -> dict[str, Any]:
    path = _usage_path(proposal_id)
    if not path.exists():
        return {
            "proposal_id": proposal_id,
            "status": "ready-to-use",
            "updated_at": None,
            "history": [],
        }
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AIHandoffError("AI proposal usage history could not be read.") from exc
    if not isinstance(value, dict) or value.get("proposal_id") != proposal_id:
        raise AIHandoffError("AI proposal usage history is invalid.")
    value.setdefault("status", "ready-to-use")
    value.setdefault("history", [])
    return value


def record_usage(
    proposal_id: str,
    action: str,
    *,
    destination_kind: str = "",
    destination_id: str = "",
) -> dict[str, Any]:
    if action not in ALLOWED_ACTIONS:
        raise AIHandoffError("Unknown AI proposal handoff action.")
    load_proposal(proposal_id)
    record = load_usage(proposal_id)
    now = datetime.now().isoformat(timespec="seconds")
    event = {
        "action": action,
        "at": now,
        "destination_kind": destination_kind,
        "destination_id": destination_id,
    }
    history = list(record.get("history", []))
    history.append(event)
    record.update({
        "proposal_id": proposal_id,
        "status": action,
        "updated_at": now,
        "history": history[-30:],
    })
    _usage_path(proposal_id).write_text(
        json.dumps(record, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    return record


def delete_usage(proposal_id: str) -> None:
    path = _usage_path(proposal_id)
    if path.exists():
        path.unlink()


def proposal_draft_text(record: dict[str, Any]) -> str:
    result = record.get("result", {}) if isinstance(record.get("result"), dict) else {}
    proposal = str(result.get("proposal", "")).strip()
    if proposal:
        return proposal
    analysis = str(result.get("analysis", "")).strip()
    claims = [
        str(item).strip()
        for item in result.get("supported_claims", [])
        if str(item).strip()
    ]
    parts: list[str] = []
    if analysis:
        parts.append(analysis)
    if claims:
        parts.append("Source-supported points:\n" + "\n".join(f"- {item}" for item in claims))
    return "\n\n".join(parts).strip() or str(result.get("headline", "AI Proposal")).strip()


def proposal_brief_prefill(record: dict[str, Any]) -> dict[str, str]:
    result = record.get("result", {}) if isinstance(record.get("result"), dict) else {}
    claims = [str(item).strip() for item in result.get("supported_claims", []) if str(item).strip()]
    warnings = [str(item).strip() for item in result.get("warnings", []) if str(item).strip()]
    warnings += [str(item).strip() for item in result.get("local_preflight_warnings", []) if str(item).strip()]
    tags = [str(item).strip() for item in result.get("suggested_tags", []) if str(item).strip()]
    proposal = str(result.get("proposal", "")).strip()
    analysis = str(result.get("analysis", "")).strip()
    headline = str(result.get("headline", "New Portfolio Project")).strip() or "New Portfolio Project"
    user_goal = str(record.get("user_goal", "")).strip()

    return {
        "working_title": headline[:6000],
        "project_type": "Portfolio case study or project artifact based on this reviewed AI proposal.",
        "purpose": "Turn the reviewed proposal into a portfolio-ready artifact while keeping every public claim grounded in source-supported evidence.",
        "skills_to_demonstrate": ", ".join(tags)[:6000],
        "audience": "Portfolio visitors",
        "story_problem": (analysis or proposal or "Define the problem or challenge this portfolio artifact should communicate.")[:6000],
        "story_approach": proposal[:6000],
        "story_process": "",
        "story_result": "",
        "evidence": "\n".join(f"- {item}" for item in claims)[:6000],
        "interaction": "",
        "visual_direction": "",
        "public_safety": "\n".join(f"- {item}" for item in warnings)[:6000],
        "personal_direction": user_goal[:6000],
    }


def proposal_payload(proposal_id: str) -> dict[str, Any]:
    record = load_proposal(proposal_id)
    return {
        "id": proposal_id,
        "headline": str(record.get("result", {}).get("headline", "AI Proposal")),
        "task_label": str(record.get("task_label", "AI Proposal")),
        "draft_text": proposal_draft_text(record),
        "brief_prefill": proposal_brief_prefill(record),
        "usage": load_usage(proposal_id),
    }


def list_destinations() -> dict[str, list[dict[str, str]]]:
    projects: list[dict[str, str]] = []
    if PROJECTS_ROOT.exists():
        for path in PROJECTS_ROOT.glob("*.json"):
            try:
                value = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            project_id = str(value.get("id", "")).strip()
            title = str(value.get("title", project_id)).strip()
            if not project_id:
                continue
            projects.append({
                "id": project_id,
                "label": title,
                "destination_kind": "project",
                "editor_kind": "visible-page" if project_id in CUSTOM_PROJECT_PAGE_IDS else "project-fields",
            })
    projects.sort(key=lambda item: item["label"].lower())

    pages = [
        {
            "id": page_id,
            "label": str(page.get("label", page_id)),
            "destination_kind": "page",
            "editor_kind": "visible-page",
        }
        for page_id, page in PAGE_REGISTRY.items()
        if page_id not in HIDDEN_PAGE_DESTINATIONS
    ]
    pages.sort(key=lambda item: item["label"].lower())
    return {"projects": projects, "pages": pages}


def resolve_destination(kind: str, destination_id: str) -> tuple[str, str]:
    if kind == "project":
        path = PROJECTS_ROOT / f"{destination_id}.json"
        if not path.exists() or not path.is_file():
            raise AIHandoffError("Selected project could not be found.")
        custom_page = CUSTOM_PROJECT_PAGE_IDS.get(destination_id)
        if custom_page:
            return "page", custom_page
        return "project", destination_id
    if kind == "page" and destination_id in PAGE_REGISTRY:
        return "page", destination_id
    raise AIHandoffError("Choose a valid portfolio destination.")
