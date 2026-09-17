from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "portfolio" / "hiring-manager" / "index.html"
HOME = ROOT / "portfolio" / "index.html"
BASE_CSS = ROOT / "portfolio" / "css" / "hiring-manager-v4.css"
MOBILE_CSS = ROOT / "portfolio" / "css" / "hiring-manager-mobile.css"
FINAL_CSS = ROOT / "portfolio" / "css" / "hiring-manager-v5.css"
CONTROLLER = ROOT / "portfolio" / "js" / "hiring-manager-v4.js"
SHARED_CSS = ROOT / "portfolio" / "css" / "phase21-visual-consistency.css"
SEO_BUILDER = ROOT / "scripts" / "build-seo.py"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    for path in [PAGE, HOME, BASE_CSS, MOBILE_CSS, FINAL_CSS, CONTROLLER, SHARED_CSS, SEO_BUILDER]:
        require(path.exists(), f"Missing required Hiring Manager UX file: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    page = PAGE.read_text(encoding="utf-8")
    home = HOME.read_text(encoding="utf-8")
    base_css = BASE_CSS.read_text(encoding="utf-8")
    mobile_css = MOBILE_CSS.read_text(encoding="utf-8")
    final_css = FINAL_CSS.read_text(encoding="utf-8")
    controller = CONTROLLER.read_text(encoding="utf-8")
    shared_css = SHARED_CSS.read_text(encoding="utf-8")
    seo_builder = SEO_BUILDER.read_text(encoding="utf-8")

    require("hiring-manager-v4.css" in page, "Hiring Manager page must load the V4 presentation layer.", errors)
    require("hiring-manager-v5.css" in page, "Hiring Manager page must load the final anchored-popover layer.", errors)
    require('@import url("./hiring-manager-mobile.css");' in base_css, "V4 CSS must import the compact Hiring Manager UX layer.", errors)

    page_markers = [
        "Interactive hiring guide",
        "Curated answers, not live AI generation.",
        "I wrote and reviewed the answers in this portfolio library myself.",
        "Ask Haley matches your question to those stored responses",
    ]
    for marker in page_markers:
        require(marker in page, f"Hiring Manager page is missing disclosure/content marker {marker!r}.", errors)

    require("Human-centered learning" not in page, "Hiring Manager hero should not include the removed Human-centered learning label.", errors)
    require("Systems + workflow" not in page, "Hiring Manager hero should not include the removed Systems + workflow label.", errors)

    css_markers = [
        ".hm-topic-browser",
        ".hm-topic-bubble",
        ".hm-topic-popover",
        ".hm-mobile-chat-dock",
        ".hm-mobile-suggestions-toggle",
        "height: min(78svh, 680px);",
        "overflow-y: auto !important;",
        "overscroll-behavior: contain;",
        "@media (max-width: 680px)",
        "@media (prefers-reduced-motion: reduce)",
    ]
    for marker in css_markers:
        require(marker in mobile_css, f"Hiring Manager compact CSS is missing {marker!r}.", errors)

    final_css_markers = [
        "z-index: 2600 !important;",
        "position: fixed !important;",
        "--hm-topic-arrow-x",
        '.hm-topic-popover[data-placement="above"]',
        ".hm-topic-popover::before",
    ]
    for marker in final_css_markers:
        require(marker in final_css, f"Hiring Manager anchored-popover CSS is missing {marker!r}.", errors)

    hero_markers = [
        ".hm-signal-board::before",
        "hm-signal-route",
        ".hm-signal-board::after",
        "overflow: hidden !important;",
    ]
    for marker in hero_markers:
        require(marker in base_css, f"Hiring Manager hero motion is missing {marker!r}.", errors)

    js_markers = [
        "const buildTopicBrowser = () =>",
        "data-hm-topic",
        "data-hm-topic-question",
        "const openTopic = (category, records, anchor) =>",
        "document.body.appendChild(topicPopover)",
        "const positionTopicPopover = () =>",
        "topicAnchor === button",
        "window.addEventListener('scroll', positionTopicPopover, true)",
        "const setupMobileDock = () =>",
        "const setupSuggestionToggle = () =>",
        "new MutationObserver(scheduleTopicBuild)",
        "chatLog.scrollTop = chatLog.scrollHeight",
        "escapeHtml(record.label)",
    ]
    for marker in js_markers:
        require(marker in controller, f"Hiring Manager controller is missing {marker!r}.", errors)

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
        "Hiring Manager UX validation passed: anchored topic bubbles, curated-answer disclosure, purposeful bounded hero motion, "
        "bounded mobile chat, homepage spotlight, and generated sitewide Hiring Guide navigation are present."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
