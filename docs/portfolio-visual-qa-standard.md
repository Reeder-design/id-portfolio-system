# Portfolio Visual QA Standard

This is the maintenance standard for future portfolio work. It is based on the current public portfolio and the recurring issues found during repeated UAT passes.

## Preservation rule

The current public files under `portfolio/` are the presentation source of truth for existing pages.

Do not regenerate, replace, normalize, or restyle an existing public page from an older template or structured record. Future work must start by inspecting the current page family and preserving its working design.

Templates and structured project data may scaffold **new** pages only. Once a new public page is created and reviewed, the public HTML/CSS/JavaScript becomes authoritative for its presentation.

## Breadcrumbs

Future pages under `portfolio/projects/` should include breadcrumb markup in the source HTML and follow the closest current page-family pattern.

- Put breadcrumbs inside the hero copy area before the page title.
- Link Home and real parent pages.
- Keep the current page as the only non-link.
- Keep breadcrumb text readable on both light and dark hero surfaces.
- Do not create an extra breadcrumb band or excessive vertical padding.
- The shared runtime may normalize legacy pages, but new pages should not depend on runtime repair for basic breadcrumb structure.

## Project endings, Other Work, and cross-links

Repeated UAT established a clear distinction:

- **Project examples / spotlight pages:** end compactly, normally with a single back path to the parent area.
- **Major landing pages:** may use an intentional **Other Work** section when cross-area discovery is useful.
- Do not add a generic `Keep Exploring` or public `Related Work` footer to a new project example.
- Do not add a runtime process that discovers footer labels and rebuilds a section after load.
- Structured relationship metadata can support Portfolio Manager / Related References without forcing a public footer block.

## Stable tabs and state changes

Interactive tabs, toggles, and selectors should not make the surrounding section jump in height.

- Reserve enough panel space for the largest normal state.
- Prefer stacked panels in one grid cell with active/inactive visibility when multiple panels exist.
- If one persistent panel is rewritten dynamically, give the shell a stable minimum height when the content length varies.
- Keep spacing consistent between states.
- Check both desktop and mobile before considering the interaction complete.
- Never hide a state in a way that causes the whole section to collapse and expand noticeably on every click.

## Interaction title and copy width

A recurring issue has been interaction copy inheriting a narrow reading measure even when the interaction shell is wide.

- Interaction headings and explanatory copy should use the available width unless there is a deliberate reason not to.
- Avoid unnecessary line wrapping that turns a short title into three or four lines.
- Do not apply long-form article reading-width constraints to compact interactive headings.
- Check the longest tab/state title, not only the default state.

## Pixel icons

Pixel icons must remain fully visible, centered, and isolated.

- Never crop the actual icon outline.
- Never allow neighboring sprite-sheet art, labels, or partial icons into the frame.
- Use `object-fit: contain` for raster icon art.
- Give icons enough internal padding to keep outlines clear.
- Do not shrink icons until they become unreadable just to fit a container.
- When an icon sits on a dark, textured, or visually busy surface, use a clean light/white bubble behind it.
- Keep icon labels outside the image frame unless the asset was intentionally designed with embedded text.

## Motion graphics and stacking

Motion should clarify a process, not compete with it.

- Tracks, dots, traces, and decorative motion belong behind readable nodes and icons.
- Animated dots should travel behind icons rather than across the icon face.
- Motion must not cover labels or create the impression of a clickable control.
- Keep motion graphics large enough that labels are readable, but do not let them dominate the section.
- Preserve reduced-motion behavior.

## Light/dark section rhythm

The portfolio uses alternating light and dark surfaces, but readability wins over pattern.

Check every interaction state for:

- heading contrast
- body-copy contrast
- eyebrow contrast
- active and inactive tab contrast
- chip and button labels
- icon-bubble readability
- hover/focus readability

Do not assume the default state proves the whole interaction is readable.

## Spacing

Recurring UAT feedback favors tighter, consistent rhythm.

- Avoid large empty bands above or below compact interactions.
- Keep sibling tabs/states at the same padding.
- Avoid one state becoming much taller solely because its copy is unnecessarily constrained.
- Keep hero text inside its container at common laptop widths.
- Keep section padding consistent with the nearest current page family.

## Interaction and chart labels

For matrices, charts, flows, and custom graphics:

- Keep axis titles outside the data area when possible.
- Do not place labels where animated elements cross them.
- Use enough label width to prevent awkward wrapping.
- Keep text readable without requiring hover.
- Make sure labels remain attached to the correct visual element on mobile.

## Icon bubbles

A light icon bubble is the preferred cleanup treatment when an icon needs separation from a dark or complex background.

The bubble should:

- be large enough that the icon is not clipped
- center the icon optically, not only mathematically
- use consistent internal padding
- avoid cutting off pixel outlines
- stay behind the icon and in front of decorative motion

## UAT checklist

Before a new or materially edited page is approved, check:

1. Breadcrumb placement and contrast.
2. Hero title overflow/wrapping.
3. Alternating section contrast.
4. Tab text contrast in every state.
5. Section height while switching tabs/states.
6. Interaction title/copy width.
7. Icon crop, centering, and bubble treatment.
8. Motion-layer stacking.
9. Axis/diagram label placement.
10. Excessive padding.
11. Mobile wrapping and overflow.
12. Project ending / back-path behavior.
13. Landing-page Other Work treatment.
14. No stale template footer or runtime-generated replacement section.
