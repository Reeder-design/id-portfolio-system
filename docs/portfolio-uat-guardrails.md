# Portfolio Preservation and UAT Guardrails

## Purpose

This document records the recurring visual and interaction regressions found during repeated portfolio UAT so future maintenance does not reintroduce them.

The current public portfolio under `portfolio/` is the approved visual baseline. This document is an audit/reference guide only. It does **not** authorize automatic restyling, normalization, or portfolio-wide rewrites.

## Preservation Rule

For an existing public page:

- the current HTML/CSS/JavaScript is authoritative for visible presentation and interaction behavior
- do not regenerate the page from `portfolio-data/`, a template, an old branch, a recovery copy, a prior PR, or remembered earlier code
- do not apply a generic sitewide normalizer merely because multiple pages use similar labels or interaction types
- do not replace a bespoke interaction with a standard scaffold unless the user explicitly requests that redesign
- when documentation disagrees with the current approved page, update the documentation rather than forcing the page back to the documentation

Structured project records remain useful for metadata, search, relationships, Portfolio Manager workflows, and source content. They do not silently own the finished page layout.

## Recurring UAT Regression Classes

### 1. Breadcrumbs and hero structure

Repeated failures:
- breadcrumbs missing on project/category pages
- breadcrumbs too dark or too light for the hero surface
- parent pathways not clickable
- extra spacing or duplicate header-like content between breadcrumb and title
- runtime breadcrumb injection moving the title or visual into the wrong hero grid column
- breadcrumb insertion contributing to hero overflow

Guardrail:
- preserve source breadcrumb markup when the current page already has it
- keep breadcrumb hierarchy clickable through real parent pages, with only the current page non-clickable
- treat breadcrumb color as part of the hero design
- never restructure a hero merely to insert breadcrumbs
- verify desktop and mobile hero layout after breadcrumb edits

### 2. Stale exploration footers

Repeated labels/components:
- Keep Exploring
- Related Work
- Other Work

These sections repeatedly returned from older templates, runtime normalizers, recovery branches, or stale page versions after they had already been redesigned or removed.

Guardrail:
- do not auto-create or normalize exploration/footer sections
- use the closing pattern already approved on that page
- if the page currently ends with a compact back action or no exploration block, preserve that behavior
- relationship metadata such as `related_work` does not automatically imply a visible Related Work section

### 3. Tabbed interactions changing section height

Repeated failure:
- selecting a tab causes the overall interaction or section to jump, grow, or shrink
- the page below shifts vertically
- the interaction no longer reads as one contained component

Guardrail:
- design tab/switcher shells around the tallest expected state when practical
- keep the interaction frame stable while content changes
- avoid toggling layout structures that collapse the parent height unexpectedly
- verify every tab state, not only the default state
- on a normal laptop viewport, the user should be able to understand the interaction without excessive scrolling

### 4. Interaction headings and copy constrained too narrowly

Repeated failure:
- title and explanatory text wrap into many short lines while unused horizontal space remains
- headings inherit a generic reading-width rule that is inappropriate inside a wide interaction

Guardrail:
- interaction titles and instructional copy should normally use the usable width of the interaction
- reserve narrow reading widths for long-form prose, not control labels, interaction headings, or concise explanations
- check long titles at common desktop widths before adding more padding

### 5. Pixel icon clipping, centering, and neighboring-image bleed

Repeated failures:
- icons cut off at the edge of their frame
- icons visually off-center
- text or artwork from the neighboring sprite/image cell appears in the frame
- icon sizing differs unpredictably within the same component

Guardrail:
- use isolated asset files rather than visually cropping a multi-icon sheet in CSS
- preserve containment with `object-fit: contain`
- leave visible breathing room around pixel art
- center the actual artwork, not merely its source canvas
- inspect at rendered size, not only at full source resolution

### 6. White/light icon bubbles on dark or visually busy surfaces

Repeated failure:
- transparent pixel icons become muddy or disappear against dark cards, gradients, or motion graphics

Guardrail:
- use the page's approved light/white icon bubble treatment when an icon needs separation from the background
- keep the bubble large enough that the icon is not clipped
- use consistent padding, border radius, and centering within one interaction
- do not add bubbles where the current approved design intentionally uses unframed icons

### 7. Motion paths, dots, and decorative animation crossing content

Repeated failures:
- animated dots pass over icons
- path lines obscure labels
- decorative motion competes with the information being explained
- motion is visually interesting but semantically confusing

Guardrail:
- motion tracks belong behind readable content unless the design explicitly requires otherwise
- icons, labels, and controls stay on the foreground layer
- motion should explain sequence, relationship, state, or flow rather than decorate empty space
- verify the full animation cycle, not only the initial frame

### 8. Dark/light alternation and contrast

Repeated failures:
- two adjacent sections accidentally use the same surface when the page rhythm expects alternation
- a dark section inherits dark text
- a light section inherits washed-out tab/eyebrow text
- the final section creates an awkward transition into the footer

Guardrail:
- follow the current page's established light/dark rhythm rather than imposing a global alternation algorithm
- verify headings, body copy, tabs, chips, icons, and motion graphics on every surface
- do not rely on inherited color when a component moves between light and dark sections

### 9. Tab and control readability

Repeated failures:
- inactive tabs are too light to read
- selected/unselected states have insufficient contrast
- long tab labels clip, overflow, or create mismatched heights

Guardrail:
- test active, inactive, hover, and focus states
- allow long labels to wrap cleanly when needed
- keep label alignment and button height consistent
- do not solve long labels by shrinking text until it becomes difficult to read

### 10. Excessive padding, dead space, and scrolling

Repeated failures:
- oversized vertical gaps between related elements
- interactions requiring unnecessary scrolling to understand one concept
- large decorative areas pushing the useful content below the fold

Guardrail:
- prefer compact, intentional spacing
- evaluate the component at a typical laptop viewport
- keep one interaction understandable as a single visual unit when possible
- do not remove necessary breathing room simply to minimize page length

### 11. Hero overflow and constrained media

Repeated failures:
- hero text or visual escapes its grid
- image/illustration extends outside the intended card or viewport
- long titles force the visual into an unusable width

Guardrail:
- use `min-width: 0` for grid/flex children that contain wrapping text
- contain hero media deliberately
- test long titles and tags at common desktop and mobile widths
- avoid runtime DOM movement inside established hero grids

### 12. Completed-work voice vs. hypothetical voice

Repeated failure:
- a real project page starts sounding like a generic recommendation, sample methodology, or hypothetical thing Haley would do

Guardrail:
- for completed projects, write in first person and describe actual decisions, development work, facilitation, administration, testing, or delivery
- keep public-safe fictionalization focused on confidential details, not on erasing ownership of the work
- clearly distinguish real completed work from emerging skills, planned work, and fictional practice demos

### 13. Stale recovery/template versions replacing newer edits

Repeated failure:
- an older generated/template/recovery version reappears after a newer bespoke UAT-approved page was already merged

Guardrail:
- GitHub `main` and the current public page are the starting state for maintenance
- compare a recovery branch to current `main` before restoring anything
- restore the smallest missing change rather than replacing the whole page
- never use a template or old branch as a blanket "repair" source for an existing page

## Page Families Requiring Extra Care

Recurring regressions have appeared across:
- Instructional Design landing and project examples
- Interactive Learning
- Complete eLearning Pathways
- Microlearning and Performance Support
- Live Training / Virtual Sales Workshop
- Multimedia
- AI Training and Evaluation and its three demos
- LMS Administration / migration work
- System Integrations and Workflows
- reporting and automation case studies
- About and other high-visibility landing pages

A successful check on one page family does not prove the shared change is safe everywhere.

## UAT Workflow for Future Visual Changes

Before editing:
1. start from current `main`
2. inspect the exact live page source and its page-specific CSS/JS
3. review open PR overlap
4. identify whether the behavior is page-specific or truly shared
5. check this guardrail list for recurring failure modes

During development:
1. make the smallest scoped change
2. preserve current page hierarchy and interaction ownership
3. avoid new runtime normalizers unless there is no safer owner
4. keep motion, icon, and tab behavior explicit
5. do not regenerate existing pages

Before UAT:
1. check desktop and mobile
2. click every tab/control/state
3. inspect long labels and titles
4. inspect icon boundaries and centering
5. watch full motion cycles
6. confirm breadcrumbs and hero layout
7. confirm dark/light contrast
8. confirm the page still sounds like completed work where applicable
9. compare against the current approved page, not an old template

## What Automation Should and Should Not Do

Automation may:
- validate links, assets, viewport metadata, privacy boundaries, and required files
- report likely recurring UAT risks
- protect against overwriting an existing public page
- verify that deprecated regeneration actions stay disabled

Automation should not:
- rewrite breadcrumbs at runtime because a page looks different
- add or replace Keep Exploring / Related Work / Other Work sections
- impose one tab layout on every bespoke interaction
- restyle existing public pages simply to make them look more uniform
- regenerate current pages from structured data or templates
