from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "portfolio" / "hiring-manager" / "index.html"
BASE_CSS = ROOT / "portfolio" / "css" / "hiring-manager-v4.css"
MOBILE_CSS = ROOT / "portfolio" / "css" / "hiring-manager-mobile.css"
CONTROLLER = ROOT / "portfolio" / "js" / "hiring-manager-v4.js"


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []

    for path in [PAGE, BASE_CSS, MOBILE_CSS, CONTROLLER]:
        require(path.exists(), f"Missing required Hiring Manager UX file: {path.relative_to(ROOT)}", errors)

    if errors:
        for error in errors:
            print(f"  - {error}")
        return 1

    page = PAGE.read_text(encoding="utf-8")
    base_css = BASE_CSS.read_text(encoding="utf-8")
    mobile_css = MOBILE_CSS.read_text(encoding="utf-8")
    controller = CONTROLLER.read_text(encoding="utf-8")

    require("hiring-manager-v4.css" in page, "Hiring Manager page must load the V4 presentation layer.", errors)
    require('@import url("./hiring-manager-mobile.css");' in base_css, "V4 CSS must import the compact mobile UX layer.", errors)

    css_markers = [
        ".hm-mobile-question-group",
        ".hm-mobile-chat-dock",
        ".hm-mobile-suggestions-toggle",
        "grid-template-rows: auto auto minmax(0,1fr) auto;",
        "height: min(78svh, 680px);",
        "overflow-y: auto !important;",
        "overscroll-behavior: contain;",
        "@media (max-width: 680px)",
        "@media (prefers-reduced-motion: reduce)",
    ]
    for marker in css_markers:
        require(marker in mobile_css, f"Hiring Manager mobile CSS is missing {marker!r}.", errors)

    js_markers = [
        "const buildMobileLibrary = () =>",
        "closeOtherMobileGroups",
        "data-hm-mobile-question",
        "data-hm-mobile-specialist",
        "const setupMobileDock = () =>",
        "const setupSuggestionToggle = () =>",
        "new MutationObserver(scheduleMobileLibraryBuild)",
        "chatLog.scrollTop = chatLog.scrollHeight",
        "escapeHtml(record.label)",
    ]
    for marker in js_markers:
        require(marker in controller, f"Hiring Manager mobile controller is missing {marker!r}.", errors)

    if errors:
        print("Hiring Manager mobile UX validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Hiring Manager mobile UX validation passed: accordion library, sticky navigator, bounded chat history, compact suggestions, and latest-message scrolling are present.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
