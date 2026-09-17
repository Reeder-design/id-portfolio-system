from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORTFOLIO = ROOT / "portfolio"
HOME = PORTFOLIO / "index.html"
FRAME_CSS = PORTFOLIO / "css" / "phase1-frame.css"
POLISH_CSS = PORTFOLIO / "css" / "phase21-visual-consistency.css"


def main() -> int:
    errors: list[str] = []
    html_files = sorted(PORTFOLIO.rglob("*.html"))

    if not html_files:
        print("Breadcrumb consistency validation failed: no public HTML files found.")
        return 1

    for path in html_files:
        html = path.read_text(encoding="utf-8")
        relative = path.relative_to(ROOT)

        if "phase1-frame.css" not in html:
            errors.append(f"{relative}: missing shared phase1-frame.css visual layer.")

        if path != HOME:
            if "portfolio-motion.js" not in html:
                errors.append(f"{relative}: missing portfolio-motion.js breadcrumb injector.")
            if not re.search(r"<main\b.*?<h1\b", html, flags=re.IGNORECASE | re.DOTALL):
                errors.append(f"{relative}: no H1 found inside main content for breadcrumb labeling.")
            if not re.search(r"<main\b.*?<section\b", html, flags=re.IGNORECASE | re.DOTALL):
                errors.append(f"{relative}: breadcrumb-bearing page has no section-based hero/content region.")

        # Breadcrumb layout must be centralized rather than repaired per page.
        if re.search(r"\.refresh-hero-grid\s*>?\s*\.breadcrumbs", html):
            errors.append(f"{relative}: page-specific breadcrumb spacing override found; use the shared visual-consistency layer.")
        if re.search(r"\.breadcrumbs\s*\{", html):
            errors.append(f"{relative}: inline breadcrumb CSS found; use the shared visual-consistency layer.")

    if not FRAME_CSS.exists():
        errors.append("portfolio/css/phase1-frame.css is missing.")
    else:
        frame = FRAME_CSS.read_text(encoding="utf-8")
        if '@import url("./phase21-visual-consistency.css");' not in frame:
            errors.append("phase1-frame.css must import phase21-visual-consistency.css.")

    if not POLISH_CSS.exists():
        errors.append("portfolio/css/phase21-visual-consistency.css is missing.")
    else:
        css = POLISH_CSS.read_text(encoding="utf-8")
        required = [
            "main > section:first-child .container:has(> .breadcrumbs)",
            "grid-column: 1 / -1 !important;",
            "row-gap: 12px !important;",
            ".about-experience-hero + .section .section-heading",
            ".adapt-lab::before",
            ".adapt-tab.active",
            ".adapt-step:hover",
            "prefers-reduced-motion",
        ]
        for marker in required:
            if marker not in css:
                errors.append(f"Shared visual-consistency CSS is missing {marker!r}.")

    if errors:
        print("Breadcrumb consistency validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    breadcrumb_pages = len(html_files) - 1
    print(
        f"Breadcrumb consistency validation passed across {breadcrumb_pages} breadcrumb-bearing pages "
        f"and {len(html_files)} total public HTML pages."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
