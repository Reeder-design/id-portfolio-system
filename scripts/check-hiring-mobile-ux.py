from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "portfolio" / "hiring-manager" / "index.html"
HOME = ROOT / "portfolio" / "index.html"
BASE_CSS = ROOT / "portfolio" / "css" / "hiring-manager-v4.css"
MOBILE_CSS = ROOT / "portfolio" / "css" / "hiring-manager-mobile.css"
FINAL_CSS = ROOT / "portfolio" / "css" / "hiring-manager-v5.css"
CONTROLLER = ROOT / "portfolio" / "js" / "hiring-manager-v4.js"
FINAL_CONTROLLER = ROOT / "portfolio" / "js" / "hiring-manager-v5.js"
SHARED_CSS = ROOT / "portfolio" / "css" / "phase21-visual-consistency.css"
SEO_BUILDER = ROOT / "scripts" / "build-seo.py"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    for path in [PAGE, HOME, BASE_CSS, MOBILE_CSS, FINAL_CSS, CONTROLLER, FINAL_CONTROLLER, SHARED_CSS, SEO_BUILDER]:
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
    final_controller = FINAL_CONTROLLER.read_text(encoding="utf-8")
    shared_css = SHARED_CSS.read_text(encoding="utf-8")
    seo_builder = SEO_BUILDER.read_text(encoding="utf-8")

    require("hiring-manager-v4.css" in page, "Hiring Manager page must load the V4 presentation layer.", errors)
    require("hiring-manager-v5.css" in page, "Hiring Manager page must load the final top-layer presentation layer.", errors)
    require("hiring-manager-v4.js" in page, "Hiring Manager page must load the V4 layout controller.", errors)
    require("hiring-manager-v5.js" in page, "Hiring Manager page must load the V5 Question Library controller.", errors)
    require(
        page.find("hiring-manager-v4.js") < page.find("hiring-manager-v5.js"),
        "V5 Question Library controller must load after V4 layout controller.",
        errors,
    )
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
        ".hm-topic-browser-v5",
        ".hm-top-layer-popover",
        ".hm-library-helper-popover",
        "--hm-topic-arrow-x",
        '.hm-topic-popover[data-placement="above"]',
        ".hm-library .hm-helper > .hm-helper-card",
    ]
    for marker in final_css_markers:
        require(marker in final_css, f"Hiring Manager top-layer CSS is missing {marker!r}.", errors)

    hero_markers = [
        ".hm-signal-board::before",
        "hm-signal-route",
        ".hm-signal-board::after",
        "overflow: hidden !important;",
    ]
    for marker in hero_markers:
        require(marker in base_css, f"Hiring Manager hero motion is missing {marker!r}.", errors)

    retained_v4_markers = [
        "const setupMobileDock = () =>",
        "const setupSuggestionToggle = () =>",
        "chatLog.scrollTop = chatLog.scrollHeight",
        "hm:close-question-overlays",
        'data-hm-v5-topic="Deep Dive"',
    ]
    for marker in retained_v4_markers:
        require(marker in controller, f"Hiring Manager V4 controller is missing retained layout behavior {marker!r}.", errors)

    forbidden_v4_markers = [
        "const buildTopicBrowser = () =>",
        "const openTopic = (category, records, anchor) =>",
        "data-hm-topic-question",
        "document.body.appendChild(topicPopover)",
    ]
    for marker in forbidden_v4_markers:
        require(marker not in controller, f"V4 must not own Question Library behavior; found legacy marker {marker!r}.", errors)

    final_js_markers = [
        "const supportsTopLayer = 'showPopover' in HTMLElement.prototype",
        "popover.showPopover()",
        "popover.hidePopover()",
        "hm-topic-browser-v5",
        "data-hm-v5-topic",
        "closeHelperPopover",
        "libraryHelperSummary.addEventListener",
        "event.stopImmediatePropagation()",
        "document.addEventListener('hm:close-question-overlays', closeAllOverlays)",
        "new MutationObserver(scheduleRender)",
        "Loading interview topics",
    ]
    for marker in final_js_markers:
        require(marker in final_controller, f"Hiring Manager V5 controller is missing single-owner/top-layer marker {marker!r}.", errors)

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
        "Hiring Manager UX validation passed: V4 owns layout only, V5 exclusively owns visible Question Library interactions, "
        "native top-layer prompt/helper overlays are loaded, and the existing chat/homepage/sitewide behaviors remain present."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
