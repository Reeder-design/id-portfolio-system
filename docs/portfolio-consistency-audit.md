# Portfolio Consistency Audit

Audit scope: current repository structure plus recurring UAT issues documented across this project's development history.

This report is **observational only**. The maintenance work that accompanies it does not change the current public files under `portfolio/`.

## Repeated issue patterns from project UAT

The following issues have appeared more than once across different page families:

| Pattern | Repeated symptom | Future-build rule |
| --- | --- | --- |
| Breadcrumbs | Missing, overly dark/light, or placed as a separate band | Keep breadcrumbs inside the hero copy, preserve shared hierarchy, and check contrast |
| Project endings | Old Keep Exploring / Related Work blocks returning after edits | New project examples use a compact parent back path; landing pages may use intentional Other Work |
| Tab height | Section/card changes size when a different tab is selected | Reserve stable panel height or stack panels in a shared grid cell |
| Interaction copy width | Titles/body text wrap into too many lines inside a wide interaction | Let interaction headings/copy use the interaction width |
| Tab contrast | Inactive/active tab text becomes too light to read | Check every state on its actual light/dark surface |
| Pixel icons | Icon itself clipped, off-center, or neighboring art/text visible | Use isolated assets, contain sizing, internal padding, and visual centering |
| Icon readability | Icon disappears into dark/complex surfaces | Add a clean light/white bubble behind the icon |
| Motion layering | Dot/trace passes over icons or labels | Motion layer stays behind readable nodes |
| Motion graphic scale | Text/icons inside motion graphic are too small to read | Enlarge the meaningful nodes/text rather than decorative elements |
| Padding | Sections become too tall after interaction revisions | Match the nearest current page-family rhythm |
| Hero overflow | Hero copy/image text overflows or wraps badly | Test common laptop widths and longest text state |
| Chart/matrix labels | Axis title sits inside graph or overlaps content | Keep axis labels outside the data area |
| Theme rhythm | Light/dark sequence or text contrast breaks after a local edit | Review neighboring sections, not only the edited block |
| Stale page versions | Older template/page version reappears and removes later UAT fixes | Existing public page is authoritative; never regenerate it from the old template |

## Current repository observations

These are code-level observations, not automatic requests to change the live portfolio.

### Breadcrumb compatibility

The shared `portfolio-motion.js` currently owns canonical breadcrumb normalization for legacy/custom pages. Some existing pages rely more heavily on that compatibility behavior than others. That is part of the current portfolio and is intentionally left unchanged in this maintenance round.

For future pages, source breadcrumb markup should follow the nearest current page-family pattern instead of relying on runtime insertion.

### Legacy exploration compatibility

The shared runtime still contains compatibility logic for older `Keep Exploring`, `Related Work`, and `Other Work` sections. A few current pages also retain older exploration markup.

Those current pages are left untouched. The important maintenance change is that the **new-page scaffold and documentation no longer instruct future builds to recreate those patterns on project examples**.

### Interactive-state height risk

Several bespoke interactions update one persistent content panel or switch panel visibility in JavaScript. This is not automatically a defect, but these pages deserve height-change UAT whenever their content is edited.

Examples of code paths to watch include:

- `portfolio/js/enterprise-certification.js`
- `portfolio/js/hiring-manager.js`
- `portfolio/js/lms-administration-refresh.js`
- `portfolio/js/microlearning-overview.js`
- `portfolio/js/performance-support.js`
- `portfolio/js/system-workflows-refresh.js`

The recurring QA question is simple: **does the section visibly jump when the longest and shortest states are toggled?**

### Asset/icon QA

Recent asset extraction work reinforces the same rule seen in page UAT: icon frames need clean separation from neighboring art, enough padding to preserve the full outline, and consistent centering.

Future extracted sprite-sheet assets should be checked before they are used in a page. A technically valid crop is not sufficient if part of the next icon or its label is still visible.

## Project-history themes that should remain part of future UAT

Across the portfolio work, the most consistent preferences have been:

- lighter/readable breadcrumbs
- reduced vertical padding
- alternating light/dark sections with readable text
- larger, clearer icons
- clean icon bubbles on complex surfaces
- back button only on project examples where a large footer is unnecessary
- no stale Keep Exploring / Related Work section returning after later edits
- tabs that do not resize the section
- readable active and inactive tab states
- motion paths behind icons
- larger readable text areas inside motion graphics
- custom motion graphics that explain the actual topic rather than generic decoration
- interaction headings that use the available width
- constrained images that do not dominate the page
- no old template/regeneration process overwriting finished bespoke work

## Maintenance conclusion

The largest structural risk is not a single visual bug. It is an old generation/regeneration path treating a structured record or generic template as more authoritative than the finished public page.

The maintenance standard therefore uses this ownership rule:

**Existing public page first. Current shared styles/behavior second. Structured metadata for content management. Templates only as preview/reference material for brand-new work. Never use an old template to rebuild a finished page.**
