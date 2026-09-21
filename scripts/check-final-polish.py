from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO = ROOT / "portfolio"
REFRESH_CSS = PORTFOLIO / "css" / "portfolio-refresh.css"
CONSISTENCY_CSS = PORTFOLIO / "css" / "consistency-polish.css"
HIRING_SUPPORT_CSS = PORTFOLIO / "css" / "hiring-support.css"
MOTION_JS = PORTFOLIO / "js" / "portfolio-motion.js"
FRAME_CSS = PORTFOLIO / "css" / "phase1-frame.css"
VISUAL_CONSISTENCY_CSS = PORTFOLIO / "css" / "phase21-visual-consistency.css"
ABOUT = PORTFOLIO / "about" / "index.html"
HOME = PORTFOLIO / "index.html"
PROJECT_TEMPLATE = ROOT / "templates" / "project-page" / "index.html"
APP = ROOT / "portfolio-manager" / "app.py"
HELP_CSS = ROOT / "portfolio-manager" / "static" / "help.css"
CREATE_TEMPLATE = ROOT / "portfolio-manager" / "templates" / "create-content.html"
REFERENCE_TEMPLATE = ROOT / "portfolio-manager" / "templates" / "reference-library.html"

AI_PAGES = [
    PORTFOLIO / "projects" / "ai-training-and-evaluation" / "index.html",
    PORTFOLIO / "projects" / "ai-training-and-evaluation" / "ai-training-and-evaluation-demo" / "index.html",
    PORTFOLIO / "projects" / "ai-training-and-evaluation" / "rubric-demo" / "index.html",
    PORTFOLIO / "projects" / "ai-training-and-evaluation" / "workflow-demo" / "index.html",
]

STALE_SLOGANS = [
    "Learning principles I use",
    "Learning first, systems aware.",
    "See the evaluation system from three angles",
    "Three artifacts, one evidence-based evaluation approach",
    "One workflow, one rubric",
    "Workflow first, score second",
]

VIEWPORT_RE = re.compile(
    r'<meta\s+name=["\']viewport["\']\s+content=["\']width=device-width,\s*initial-scale=1\.0["\']\s*/?>',
    re.IGNORECASE | re.DOTALL,
)


class VisibleBodyText(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_body = False
        self.skip_depth = 0
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag == "body":
            self.in_body = True
        if self.in_body and tag in {"script", "style"}:
            self.skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if self.in_body and tag in {"script", "style"} and self.skip_depth:
            self.skip_depth -= 1
        if tag == "body":
            self.in_body = False

    def handle_data(self, data: str) -> None:
        if self.in_body and not self.skip_depth:
            text = re.sub(r"\s+", " ", data).strip()
            if text:
                self.parts.append(text)

    def text(self) -> str:
        return " ".join(self.parts)


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def visible_text(path: Path) -> str:
    parser = VisibleBodyText()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser.text()


def main() -> int:
    errors: list[str] = []
    html_files = sorted(PORTFOLIO.rglob("*.html"))

    require(bool(html_files), "No public portfolio HTML files found.", errors)

    for path in html_files:
        html = path.read_text(encoding="utf-8")
        relative = path.relative_to(ROOT)
        require(
            VIEWPORT_RE.search(html) is not None,
            f"{relative}: missing mobile viewport metadata.",
            errors,
        )
        require(
            "phase1-frame.css" in html,
            f"{relative}: missing shared phase1-frame.css visual layer.",
            errors,
        )
        prose = visible_text(path)
        require("—" not in prose, f"{relative}: visible prose contains an em dash; review final public copy.", errors)
        require(" | " not in prose, f"{relative}: visible prose contains a spaced vertical bar; review final public copy.", errors)

        if path != HOME:
            require(
                "portfolio-motion.js" in html,
                f"{relative}: public pages must load the shared navigation/component normalizer.",
                errors,
            )
        if "Keep Exploring" in html:
            require(
                "portfolio-motion.js" in html,
                f"{relative}: Keep Exploring must be normalized by the shared Interactive Learning standard.",
                errors,
            )

    combined_public = "\n".join(path.read_text(encoding="utf-8") for path in html_files)
    for phrase in STALE_SLOGANS:
        require(phrase not in combined_public, f"Public copy still contains stale/slogan-like phrase: {phrase!r}.", errors)

    about = ABOUT.read_text(encoding="utf-8")
    require("L&D APPROACH" not in about, "About page must not contain the removed L&D APPROACH section.", errors)
    require("principle-grid" not in about, "About page must not retain unused learning-principles layout.", errors)

    home = HOME.read_text(encoding="utf-8")
    require("focused on sales and partner enablement for complex products" in home, "Homepage should keep the tightened concrete introduction.", errors)

    css = REFRESH_CSS.read_text(encoding="utf-8")
    for marker in [
        "body {\n    overflow-x: hidden;",
        ".eyebrow {\n    font-size: .68rem;",
        ".btn-highlight {\n    background: var(--pine-blue) !important;",
        "@media (max-width: 700px)",
        ".site-nav {\n        display: grid;",
        "@media (max-width: 620px)",
        "grid-template-columns: 1fr;",
    ]:
        require(marker in css, f"Shared portfolio responsive/polish CSS is missing {marker!r}.", errors)
    require(".btn-highlight {\n    background: var(--yellow-green)" not in css, "Highlight buttons must not use the lime yellow-green background.", errors)

    require(CONSISTENCY_CSS.exists(), "Portfolio compact-UI consistency stylesheet is missing.", errors)
    if CONSISTENCY_CSS.exists():
        compact_css = CONSISTENCY_CSS.read_text(encoding="utf-8")
        for marker in [
            ".refresh-chip,",
            ".id-focus-chip,",
            ".lms-priority,",
            ".stack-chip,",
            ".progress-chip,",
            ".benchmark-signal,",
            ".watch-chip,",
            ".portfolio-assistant-prompts button",
            "justify-content: center;",
            "text-align: center;",
            "white-space: normal;",
            "overflow-wrap: anywhere;",
            "min-width: 0;",
        ]:
            require(marker in compact_css, f"Compact-UI safeguards are missing {marker!r}.", errors)

    require(HIRING_SUPPORT_CSS.exists(), "Hiring-support stylesheet is missing.", errors)
    if HIRING_SUPPORT_CSS.exists():
        hiring_css = HIRING_SUPPORT_CSS.read_text(encoding="utf-8")
        require('@import url("./consistency-polish.css");' in hiring_css, "Hiring support must load the shared compact-UI consistency layer.", errors)
        require(".portfolio-assistant-launcher {" in hiring_css and "text-align: center;" in hiring_css, "Hiring launcher text should remain centered.", errors)
        require("overflow-wrap: anywhere;" in hiring_css, "Hiring prompt/result text needs wrapping safeguards.", errors)

    motion_js = MOTION_JS.read_text(encoding="utf-8")
    require("css/hiring-support.css" in motion_js, "Shared portfolio JS must continue loading hiring-support styles sitewide.", errors)
    for marker in [
        "const initCanonicalBreadcrumbs = () =>",
        "BREADCRUMB_ROUTES",
        "initCanonicalBreadcrumbs();",
        "const initExploreFooters = () =>",
        "section.className = 'section section-soft';",
        "refresh-card-grid",
        "refresh-link-card-header",
        "refresh-link-card-body",
        "project-family-link",
    ]:
        require(marker in motion_js, f"Shared portfolio navigation/component logic is missing {marker!r}.", errors)

    require(FRAME_CSS.exists(), "portfolio/css/phase1-frame.css is missing.", errors)
    if FRAME_CSS.exists():
        frame_css = FRAME_CSS.read_text(encoding="utf-8")
        require(
            '@import url("./phase21-visual-consistency.css");' in frame_css,
            "phase1-frame.css must import phase21-visual-consistency.css.",
            errors,
        )

    require(VISUAL_CONSISTENCY_CSS.exists(), "portfolio/css/phase21-visual-consistency.css is missing.", errors)
    if VISUAL_CONSISTENCY_CSS.exists():
        visual_css = VISUAL_CONSISTENCY_CSS.read_text(encoding="utf-8")
        for marker in [
            "main > section:first-child .container:has(> .breadcrumbs)",
            "grid-column: 1 / -1 !important;",
            "row-gap: 12px !important;",
            ".about-experience-hero + .section .section-heading",
            ".adapt-lab::before",
            ".adapt-tab.active",
            ".adapt-step:hover",
            "prefers-reduced-motion",
        ]:
            require(marker in visual_css, f"Shared visual-consistency CSS is missing {marker!r}.", errors)

    project_template = PROJECT_TEMPLATE.read_text(encoding="utf-8")
    require("project-template-cta" not in project_template, "New-page scaffold must not use the retired project-template-cta variant.", errors)
    require("Keep Exploring" not in project_template, "New-page scaffold must not recreate the retired Keep Exploring footer.", errors)
    require("RELATED_WORK_SECTION" not in project_template and "RELATED_WORK_NAV" not in project_template, "New-page scaffold must not recreate a public Related Work section.", errors)
    for marker in [
        'class="section portfolio-back-row"',
        'class="generic-switch-panels"',
        'aria-hidden="true"',
    ]:
        require(marker in project_template, f"New-page scaffold is missing current hardening marker {marker!r}.", errors)

    for path in AI_PAGES:
        html = path.read_text(encoding="utf-8")
        has_exploration_path = "Keep Exploring" in html or "Other Work" in html
        has_back_path = "ai-back-section" in html and "Back to AI Training and Evaluation" in html
        require(
            has_exploration_path or has_back_path,
            f"{path.relative_to(ROOT)}: AI page must end with an exploration or parent-page back path.",
            errors,
        )

    app_text = APP.read_text(encoding="utf-8")
    require('app.run(host="127.0.0.1", port=5055, debug=False)' in app_text, "Portfolio Manager must remain bound to localhost (127.0.0.1:5055).", errors)
    require('host="0.0.0.0"' not in app_text, "Portfolio Manager must not bind to all network interfaces.", errors)

    help_css = HELP_CSS.read_text(encoding="utf-8")
    require("gap: 12px;" in help_css and ".button-row form" in help_css, "Portfolio Manager action spacing polish is missing.", errors)

    create_template = CREATE_TEMPLATE.read_text(encoding="utf-8")
    reference_template = REFERENCE_TEMPLATE.read_text(encoding="utf-8")
    require('data-help-key="create-content"' in create_template, "Create Content should expose contextual workflow help.", errors)
    require('data-help-key="ai-assistance"' in create_template, "Create Content supporting tools should expose AI workflow help.", errors)
    require('data-help-key="reference-library"' in reference_template, "Reference Library should expose private-source help.", errors)
    require('data-help-key="privacy"' in reference_template, "Reference Library upload area should expose privacy/storage help.", errors)

    if errors:
        print("Final polish/responsive validation failed:")
        for item in errors:
            print(f"  - {item}")
        return 1

    print(f"Final polish/responsive validation passed across {len(html_files)} public HTML file(s).")
    print("Editorial note: list rhythm and subjective AI-sounding prose still require human review during final QA.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
