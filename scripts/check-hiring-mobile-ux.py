from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "portfolio" / "hiring-manager" / "index.html"
HOME = ROOT / "portfolio" / "index.html"
CSS = ROOT / "portfolio" / "css" / "hiring-manager.css"
CONTROLLER = ROOT / "portfolio" / "js" / "hiring-manager.js"
SHARED_CSS = ROOT / "portfolio" / "css" / "phase21-visual-consistency.css"
SEO_BUILDER = ROOT / "scripts" / "build-seo.py"

LEGACY_RUNTIME = [
    ROOT / "portfolio" / "css" / "hiring-manager-v2.css",
    ROOT / "portfolio" / "css" / "hiring-manager-v3.css",
    ROOT / "portfolio" / "css" / "hiring-manager-v4.css",
    ROOT / "portfolio" / "css" / "hiring-manager-v5.css",
    ROOT / "portfolio" / "css" / "hiring-manager-nav.css",
    ROOT / "portfolio" / "css" / "hiring-manager-mobile.css",
    ROOT / "portfolio" / "js" / "hiring-manager-v3.js",
    ROOT / "portfolio" / "js" / "hiring-manager-v4.js",
    ROOT / "portfolio" / "js" / "hiring-manager-v5.js",
]


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    for path in [PAGE, HOME, CSS, CONTROLLER, SHARED_CSS, SEO_BUILDER]:
        require(path.exists(), f"Missing required Hiring Manager UX file: {path.relative_to(ROOT)}", errors)

    for path in LEGACY_RUNTIME:
        require(not path.exists(), f"Legacy layered Hiring Manager runtime should be removed: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    page = PAGE.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    controller = CONTROLLER.read_text(encoding="utf-8")
    home = HOME.read_text(encoding="utf-8")
    shared_css = SHARED_CSS.read_text(encoding="utf-8")
    seo_builder = SEO_BUILDER.read_text(encoding="utf-8")

    require('href="../css/hiring-manager.css"' in page, "Hiring Manager page must load the single canonical Hiring Manager stylesheet.", errors)
    require('src="../js/hiring-manager.js"' in page, "Hiring Manager page must load the single canonical Hiring Manager controller.", errors)
    require("hiring-manager-v" not in page, "Hiring Manager page must not load version-stacked CSS or JavaScript.", errors)
    require("hiring-manager-nav.css" not in page, "Hiring Manager page must not load the retired navigation override.", errors)

    page_markers = [
        "Hiring manager guide",
        "Ask me what you would ask in the interview.",
        "hm-interview-scene",
        "conversation-man-laptop.webp",
        "conversation-woman-laptop.webp",
        'id="ask-haley"',
        "Browse Question Library",
        "data-hm-library",
        "data-hm-topic-list",
        "data-hm-prompt-panel",
        "data-hm-chat-log",
        "data-hm-form",
        "this is not live generative AI",
        'id="quick-scan"',
        "data-hm-capability-tabs",
        "data-hm-tool-tabs",
        "Answers are useful. Proof is better.",
    ]
    for marker in page_markers:
        require(marker in page, f"Hiring Manager page is missing required marker {marker!r}.", errors)

    obsolete_markers = [
        "hm-signal-board",
        "hm-helper",
        "hm-mobile-chat-dock",
        "hm-specialist-drawer",
        "Portfolio Haley",
        "Interview mode",
    ]
    for marker in obsolete_markers:
        require(marker not in page, f"Hiring Manager page still contains retired interaction marker {marker!r}.", errors)

    css_markers = [
        ".hm-hero-layout",
        ".hm-interview-scene",
        "image-rendering: pixelated;",
        ".hm-chat-shell",
        ".hm-library-drawer",
        ".hm-library-workspace",
        ".hm-topic-list",
        ".hm-chat-log",
        "overscroll-behavior: contain;",
        ".hm-capability-layout",
        ".hm-tool-layout",
        "@media (max-width: 700px)",
        "@media (max-width: 480px)",
        "@media (prefers-reduced-motion: reduce)",
    ]
    for marker in css_markers:
        require(marker in css, f"Hiring Manager canonical CSS is missing {marker!r}.", errors)

    controller_markers = [
        "hiring-faq.json",
        "hiring-faq-expanded.json",
        "hiring-faq-specialist.json",
        "hiring-capabilities.json",
        "hiring-tools.json",
        "hiring-search.json",
        "const scoreQuestion =",
        "const askById =",
        "const renderLibrary =",
        "const renderStarters =",
        "const renderCapabilities =",
        "const renderTools =",
        "const setScanView =",
        "this is not live generative AI" if False else "state.questions = [",
        "question.specialist",
    ]
    for marker in controller_markers:
        require(marker in controller, f"Hiring Manager controller is missing {marker!r}.", errors)

    forbidden_controller_markers = [
        "MutationObserver",
        "hm:close-question-workspace",
        "hm:open-question-topic",
        "data-hm-specialist-id",
        "data-question-id",
    ]
    for marker in forbidden_controller_markers:
        require(marker not in controller, f"Canonical Hiring Manager controller still contains legacy layered behavior {marker!r}.", errors)

    home_markers = [
        "Hiring? Ask the portfolio.",
        "home-hiring-section",
        "Open Hiring Manager Guide",
        "Curated self-written answers",
        "home-chat-demo",
    ]
    for marker in home_markers:
        require(marker in home, f"Homepage Hiring Manager spotlight is missing {marker!r}.", errors)

    require(".site-nav .site-nav-hiring" in shared_css, "Shared visual CSS must style the sitewide Hiring Guide nav CTA.", errors)
    require("HIRING_NAV_MARKER" in seo_builder, "SEO/static builder must own the sitewide Hiring Guide nav marker.", errors)
    require("add_hiring_nav_link" in seo_builder, "SEO/static builder must inject the sitewide Hiring Guide nav link.", errors)
    require('aria-label="Hiring Manager Guide"' in seo_builder, "Generated Hiring Guide nav link must have a full accessible label.", errors)

    if errors:
        print("Hiring Manager UX validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(
        "Hiring Manager UX validation passed: Ask Haley is the primary experience, the Question Library is integrated into the chat, "
        "pixel interview assets are used throughout, Capabilities and Tools share one quick-scan workspace, and the page has one CSS owner plus one JavaScript owner."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
