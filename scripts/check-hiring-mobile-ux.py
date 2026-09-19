from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "portfolio" / "hiring-manager" / "index.html"
HOME = ROOT / "portfolio" / "index.html"
CSS = ROOT / "portfolio" / "css" / "hiring-manager.css"
CONTROLLER = ROOT / "portfolio" / "js" / "hiring-manager.js"
MOTION = ROOT / "portfolio" / "js" / "portfolio-motion.js"
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

    for path in [PAGE, HOME, CSS, CONTROLLER, MOTION, SHARED_CSS, SEO_BUILDER]:
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
    motion = MOTION.read_text(encoding="utf-8")
    home = HOME.read_text(encoding="utf-8")
    shared_css = SHARED_CSS.read_text(encoding="utf-8")
    seo_builder = SEO_BUILDER.read_text(encoding="utf-8")

    require('href="../css/hiring-manager.css"' in page, "Hiring Manager page must load the single canonical Hiring Manager stylesheet.", errors)
    require('src="../js/hiring-manager.js"' in page, "Hiring Manager page must load the single canonical Hiring Manager controller.", errors)
    require("hiring-manager-v" not in page, "Hiring Manager page must not load version-stacked CSS or JavaScript.", errors)
    require("\\`" not in controller and "\\${" not in controller, "Hiring Manager controller contains escaped template-literal syntax that will break in the browser.", errors)

    page_markers = [
        "Interactive portfolio chat",
        "Ask me what you would ask in the interview.",
        '<span aria-current="page">Ask Haley</span>',
        "hm-transfer-scene",
        "hm-transfer-track",
        "hm-transfer-return",
        "Answer + proof",
        "person-man.webp",
        "person-woman.webp",
        "Question → curated answer → portfolio evidence.",
        "What this chat helps you evaluate",
        "This is a chatbot demo, but there is no AI model behind it.",
        'id="ask-haley"',
        "Ask your own question, use a quick starter, or browse the Question Library.",
        "Not AI, just pre-built me",
        "data-hm-library",
        "data-hm-topic-list",
        "data-hm-prompt-panel",
        "I wrote and reviewed the answer library myself.",
        'id="quick-scan"',
        "Hiring manager quick scan",
        "What I bring",
        "data-hm-capability-tabs",
        "data-hm-tool-tabs",
        "Want the work behind the answers?",
        "handshake.webp",
    ]
    for marker in page_markers:
        require(marker in page, f"Hiring Manager page is missing required marker {marker!r}.", errors)

    obsolete_page_markers = [
        "Hiring manager guide",
        "Start with the conversation, not the navigation.",
        "What the guide is designed to show",
        "hm-signal-board",
        "hm-helper",
        "hm-mobile-chat-dock",
        "hm-specialist-drawer",
        "Portfolio Haley",
        "Interview mode",
        "conversation-man-laptop.webp",
        "conversation-woman-laptop.webp",
        "dual-chat.webp",
    ]
    for marker in obsolete_page_markers:
        require(marker not in page, f"Hiring Manager page still contains retired marker {marker!r}.", errors)

    css_markers = [
        ".hm-hero .breadcrumbs",
        "line-height: 1.01;",
        ".hm-transfer-scene",
        ".hm-transfer-line::after",
        "hm-packet-route",
        ".hm-evaluate-track",
        ".hm-chat-explainer",
        ".hm-not-ai",
        ".hm-library-workspace",
        "height: min(48vh, 390px);",
        "min-height: 0;",
        "overflow-y: auto;",
        "-webkit-overflow-scrolling: touch;",
        ".hm-tab-icon-bubble",
        ".hm-scan-flow",
        ".hm-next-grid",
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
        "visibleSkills",
        "hm-tab-icon-bubble",
        "hm-scan-flow",
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

    require("['hiring-manager', 'Ask Haley']" in motion, "Canonical breadcrumbs must label the Hiring Manager route as Ask Haley.", errors)

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
        "Hiring Manager UX validation passed: Ask Haley uses a short canonical breadcrumb, compact spacing, "
        "animated question-to-evidence visual routing, a pre-chat evaluation section, explicit curated-not-live-AI framing, "
        "a scrollable integrated Question Library, compact hiring-manager-focused Quick Scan, white icon bubbles, "
        "and one CSS owner plus one JavaScript owner."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
