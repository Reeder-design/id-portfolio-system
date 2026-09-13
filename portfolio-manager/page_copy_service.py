from __future__ import annotations

from html import escape, unescape
from pathlib import Path
import re


APP_ROOT = Path(__file__).resolve().parent
REPO_ROOT = APP_ROOT.parent
PORTFOLIO_ROOT = (REPO_ROOT / "portfolio").resolve()

PAGE_REGISTRY: dict[str, dict[str, str]] = {
    "home": {"label": "Home", "path": "portfolio/index.html"},
    "about": {"label": "About Me", "path": "portfolio/about/index.html"},
    "projects": {"label": "Projects", "path": "portfolio/projects/index.html"},
    "instructional-design": {"label": "Instructional Design", "path": "portfolio/projects/instructional-design/index.html"},
    "interactive-learning": {"label": "Interactive Learning", "path": "portfolio/projects/instructional-design/interactive-learning/index.html"},
    "multimedia": {"label": "Multimedia Training Content", "path": "portfolio/projects/instructional-design/multimedia/index.html"},
    "complete-learning-paths": {"label": "Complete Learning Pathways", "path": "portfolio/projects/instructional-design/complete-learning-paths/index.html"},
    "ai-training-and-evaluation": {"label": "AI Training and Evaluation", "path": "portfolio/projects/ai-training-and-evaluation/index.html"},
    "ai-evaluation-demo": {"label": "AI Evaluation Demo", "path": "portfolio/projects/ai-training-and-evaluation/ai-training-and-evaluation-demo/index.html"},
    "rubric-demo": {"label": "Rubric Demo", "path": "portfolio/projects/ai-training-and-evaluation/rubric-demo/index.html"},
    "workflow-demo": {"label": "Workflow Demo", "path": "portfolio/projects/ai-training-and-evaluation/workflow-demo/index.html"},
    "workflows": {"label": "Systems and Workflows", "path": "portfolio/projects/workflows/index.html"},
    "contact": {"label": "Contact", "path": "portfolio/contact/index.html"},
}

MAIN_PATTERN = re.compile(r"(?is)<main\b[^>]*>(?P<body>.*?)</main>")
LEAF_PATTERN = re.compile(
    r"(?is)<(?P<tag>h1|h2|h3|p|li|a|button|span|strong)\b(?P<attrs>[^>]*)>"
    r"(?P<content>[^<>]*)</(?P=tag)>"
)

TAG_LABELS = {
    "h1": "Page heading",
    "h2": "Section heading",
    "h3": "Block heading",
    "p": "Paragraph",
    "li": "List item",
    "a": "Link / button text",
    "button": "Interactive button",
    "span": "Label",
    "strong": "Emphasized label",
}

SCRIPT_CONFIG = {
    "about": {
        "object": "workData",
        "quote": '"',
        "properties": ["eyebrow", "title", "summary", "lens", "decisions", "evidence"],
        "states": [
            "Complete Learning Paths",
            "Standalone Interactions",
            "Microlearning",
            "Training Resources",
            "AI Evaluation",
            "System Integrations & Workflows",
        ],
    },
    "workflow-demo": {
        "object": "workflowData",
        "quote": "'",
        "properties": ["label", "title", "text", "question", "record", "standard", "signal", "risk"],
        "states": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5", "Step 6"],
    },
    "ai-evaluation-demo": {
        "object": "scenarios",
        "quote": "'",
        "properties": ["type", "title", "intro", "severity", "reasoning", "feedback", "preserve", "impact"],
        "states": ["Scenario 1", "Scenario 2", "Scenario 3"],
    },
}


def page_info(page_id: str) -> tuple[dict[str, str], Path]:
    page = PAGE_REGISTRY.get(page_id)
    if page is None:
        raise FileNotFoundError(f"Managed portfolio page not found: {page_id}")
    path = (REPO_ROOT / page["path"]).resolve()
    try:
        path.relative_to(PORTFOLIO_ROOT)
    except ValueError as exc:
        raise ValueError("Managed page must stay under portfolio/.") from exc
    if not path.exists() or not path.is_file() or path.name != "index.html":
        raise FileNotFoundError(f"Managed portfolio page is missing: {page['path']}")
    return page, path


def preview_url(page: dict[str, str]) -> str:
    relative = page["path"].removeprefix("portfolio/")
    if relative == "index.html":
        return "http://127.0.0.1:8000/"
    return "http://127.0.0.1:8000/" + relative.removesuffix("index.html")


def _normalized(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value)).strip()


def extract_visible_fields(html_text: str, *, skip_h1: bool = False) -> list[dict]:
    main = MAIN_PATTERN.search(html_text)
    if main is None:
        raise ValueError("Could not safely locate the page's main content area.")

    fields: list[dict] = []
    index = 0
    body = main.group("body")
    base = main.start("body")

    for match in LEAF_PATTERN.finditer(body):
        tag = match.group("tag").lower()
        attrs = match.group("attrs")
        text = _normalized(match.group("content"))
        if not text:
            continue
        if skip_h1 and tag == "h1":
            continue
        if re.fullmatch(r"[\d\s./:+-]+", text):
            continue
        if "aria-hidden=\"true\"" in attrs or "aria-hidden='true'" in attrs:
            continue
        index += 1
        key = f"leaf-{index:04d}"
        css_hint = ""
        class_match = re.search(r"class=[\"']([^\"']+)[\"']", attrs, flags=re.I)
        if class_match:
            css_hint = class_match.group(1).split()[0]
        label = TAG_LABELS.get(tag, "Visible text")
        if css_hint:
            label += f" · {css_hint}"
        fields.append({
            "key": key,
            "label": label,
            "tag": tag,
            "value": text,
            "long": len(text) > 95 or tag in {"p", "li"},
            "start": base + match.start("content"),
            "end": base + match.end("content"),
        })
    return fields


def _script_block(html_text: str, object_name: str) -> tuple[int, int, str] | None:
    pattern = re.compile(
        rf"(?is)const\s+{re.escape(object_name)}\s*=\s*\{{(?P<body>.*?)\n\s*\}};"
    )
    match = pattern.search(html_text)
    if not match:
        return None
    return match.start("body"), match.end("body"), match.group("body")


def _decode_js(value: str, quote: str) -> str:
    value = value.replace("\\n", "\n").replace("\\r", "\r")
    value = value.replace("\\\\", "\\")
    value = value.replace("\\" + quote, quote)
    value = value.replace("\\x3C", "<").replace("\\x3E", ">")
    return value


def _encode_js(value: str, quote: str) -> str:
    value = value.replace("\\", "\\\\")
    value = value.replace(quote, "\\" + quote)
    value = value.replace("\r", "\\r").replace("\n", "\\n")
    value = value.replace("<", "\\x3C").replace(">", "\\x3E")
    return value


def extract_script_fields(page_id: str, html_text: str) -> list[dict]:
    config = SCRIPT_CONFIG.get(page_id)
    if not config:
        return []
    block = _script_block(html_text, config["object"])
    if block is None:
        return []
    block_start, _, body = block
    quote = config["quote"]
    prop_group = "|".join(re.escape(prop) for prop in config["properties"])
    if quote == '"':
        value_pattern = r'(?P<value>(?:\\.|[^"\\])*)'
    else:
        value_pattern = r"(?P<value>(?:\\.|[^'\\])*)"
    pattern = re.compile(
        rf"(?P<prefix>\b(?P<prop>{prop_group})\s*:\s*{re.escape(quote)})"
        + value_pattern
        + rf"(?P<suffix>{re.escape(quote)})"
    )

    property_counts = {prop: 0 for prop in config["properties"]}
    fields: list[dict] = []
    for match in pattern.finditer(body):
        prop = match.group("prop")
        state_index = property_counts[prop]
        property_counts[prop] += 1
        states = config["states"]
        state_label = states[state_index] if state_index < len(states) else f"State {state_index + 1}"
        value = _decode_js(match.group("value"), quote)
        fields.append({
            "key": f"script-{prop}-{state_index + 1}",
            "label": f"{state_label} · {prop.replace('_', ' ').title()}",
            "value": value,
            "long": len(value) > 95 or prop in {"summary", "text", "question", "record", "signal", "risk", "reasoning", "feedback", "preserve", "impact"},
            "start": block_start + match.start("value"),
            "end": block_start + match.end("value"),
            "quote": quote,
        })
    return fields


def _changed_fields(fields: list[dict], form, prefix: str) -> list[tuple[dict, str]]:
    changed: list[tuple[dict, str]] = []
    for field in fields:
        key = field["key"]
        posted_name = f"{prefix}{key}"
        if posted_name not in form:
            continue
        current = field["value"]
        original = form.get(f"original__{key}", current)
        if current != original:
            raise ValueError(
                "This page changed after the editor was opened. Reload the page before saving so Portfolio Manager does not overwrite newer work."
            )
        new_value = form.get(posted_name, "").strip()
        if not new_value:
            raise ValueError(f"{field['label']} cannot be blank.")
        if new_value != current:
            changed.append((field, new_value))
    return changed


def apply_page_edits(page_id: str, html_text: str, form, *, skip_h1: bool = False) -> tuple[str, int]:
    visible = extract_visible_fields(html_text, skip_h1=skip_h1)
    script = extract_script_fields(page_id, html_text)
    changes: list[tuple[int, int, str]] = []

    for field, new_value in _changed_fields(visible, form, "visible__"):
        changes.append((field["start"], field["end"], escape(new_value, quote=False)))

    for field, new_value in _changed_fields(script, form, "script__"):
        changes.append((field["start"], field["end"], _encode_js(new_value, field["quote"])))

    updated = html_text
    for start, end, replacement in sorted(changes, key=lambda item: item[0], reverse=True):
        updated = updated[:start] + replacement + updated[end:]
    return updated, len(changes)
