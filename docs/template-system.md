# Project Page Template System

The standard project-page system converts structured project records in `portfolio-data/projects/` into public case-study pages that inherit the approved portfolio component system.

## Purpose

Project-specific information lives in JSON. Shared case-study structure lives in `templates/project-page/index.html`. `scripts/render-project.py` combines them.

The standard template is the default for projects whose portfolio value is the case-study story. Bespoke demos remain custom when the interaction itself is important evidence.

## Source of Truth

Use these files for their specific responsibilities:

- `portfolio-data/taxonomy.json` - canonical category IDs, labels, subcategories, and public paths
- `portfolio-data/schema/project.schema.json` - structured project requirements
- `portfolio-data/projects/*.json` - project-specific structured content
- `templates/project-page/index.html` - standard generated case-study markup
- `scripts/render-project.py` - deterministic rendering behavior
- `portfolio/css/final-stretch-system.css` - approved shared public component and surface rules
- `portfolio/js/portfolio-motion.js` - shared motion plus compatibility normalization for older hand-built pages
- bespoke files under `portfolio/` - authoritative interaction/presentation for intentionally custom experiences

Documentation describes the system. It does not override these sources.

## Standard Page Architecture

Generated projects use this pattern:

```text
case-study hero
    ↓
dark project snapshot bridge
    ↓
flush-top sticky project navigation
    ↓
Need
    ↓
Design Decisions
    ↓
Build
    ↓
Evidence (only when public assets exist)
    ↓
Outcome
    ↓
Related Work (when structured relationships exist)
    ↓
Portfolio-safe note (when needed)
    ↓
Keep Exploring
```

### Hero

The generated hero uses the approved case-study family.

It includes:

- breadcrumb directly above the project title
- project title and short summary
- category context chip
- up to six skill/tool tags
- optional meaningful live-project action
- a compact visual process panel

Generated heroes do not add a redundant back button or a button whose only purpose is jumping to a section already available in the sticky project navigation.

### Project Snapshot

The snapshot is the visual bridge between the hero and project navigation.

The shared source markup uses:

- `.snapshot-band`
- `.snapshot-grid`
- `.snapshot-item`

The band is dark. Individual metadata items stay light for contrast.

The standard metadata fields are:

- My Role
- Audience
- Project Type
- Built With

Do not recreate the retired white `.project-snapshot-grid` treatment.

### Project Navigation

Generated case studies use:

- `.case-nav-shell`
- `.case-nav`

The navigation is dark and sticky at `top: 0` after the user scrolls past it. It must not leave a browser-top gap that covers content.

Navigation items are generated only for sections that exist.

### Story Sections

Need, Design Decisions, Build, optional detail sections, Evidence, Outcome, and Related Work use the structured content record.

The page may use tabs, cards, flows, and evidence layouts when they improve comprehension, but shared components should be extended rather than copied into project-specific variants.

### Evidence

Evidence is conditional. When a structured project includes assets with `"publish": true`, the renderer adds an Evidence nav item and Evidence section.

Supported public asset treatments include:

- images
- video
- PDFs/documents/downloads
- embeds/code/other approved public references

The renderer does not invent evidence when a project has none.

### Related Work

Structured `related_work` relationships render with the shared asset-led portfolio explore card family. The section carries its own light surface state so card contrast does not depend on surrounding page markup.

### Portfolio-Safe Notes

Projects marked `sanitized` render the shared portfolio-safe component rather than a generic warning box.

The component includes:

- a public-safe explanation
- the approved case-study pixel asset
- no proprietary identifiers, learner data, credentials, screenshots, or internal implementation details

### Keep Exploring

Generated pages end with the approved shared Keep Exploring component.

The standard destinations are:

- the parent project area
- all Projects
- the portfolio overview

The component uses the approved pixel assets and light ending surface before the dark shared footer.

## Shared Frame

Generated pages write the current frame directly into source HTML:

- current nav links
- Hiring Guide CTA
- shared dark nav/footer visual language
- left-aligned footer links
- GitHub, LinkedIn, Résumé, and Expertise footer destinations

Generated pages explicitly load:

- `styles.css`
- `portfolio-refresh.css`
- `phase1-theme.css`
- `phase1-frame.css`
- `final-stretch-system.css`
- `portfolio-motion.js`

New generated pages should already be correct before JavaScript compatibility normalization runs.

## Breadcrumb Standard

Expected behavior:

- Home is clickable
- every real parent page is clickable
- the current page is the only non-clickable breadcrumb
- the breadcrumb sits inside hero copy directly above the H1
- labels and separators use the shared treatment

Do not place breadcrumbs as an independent grid item above the hero content.

## Light and Dark Rhythm

The approved portfolio uses intentional light and dark section contrast.

Rules:

- dark surfaces use the teal/mint/gold visual language rather than near-black slabs
- light surfaces use paper/mint accents
- sections should alternate when it improves separation
- the final content section resolves light before the dark footer
- project metadata remains a dark bridge between hero and project navigation

Do not convert entire pages into a dark theme.

## Component Ownership

When a visual or behavior should apply to many pages, change the shared source instead of copying page-specific CSS.

Ownership is:

- shared visuals and component states: `portfolio/css/final-stretch-system.css`
- standard generated case-study markup: `templates/project-page/index.html`
- deterministic dynamic markup: `scripts/render-project.py`
- shared motion and legacy normalization: `portfolio/js/portfolio-motion.js`
- intentionally bespoke demo behavior: the demo's own files

Runtime compatibility behavior is not permission to create another parallel markup pattern.

## Supported Categories

Category IDs, labels, subcategories, and public paths come from `portfolio-data/taxonomy.json`.

The current top-level portfolio areas are:

- Instructional Design
- AI Training and Evaluation
- LMS Administration & System Operations
- System Integrations and Workflows

Renderer behavior should read taxonomy data rather than creating a second hard-coded category system. The labels above are documented here for architecture clarity, not as an alternate source of truth.

## Rendering a Project

Preview generated HTML:

```bash
python scripts/render-project.py portfolio-data/projects/pursuit-positioning.json --stdout
```

Render a new project:

```bash
python scripts/render-project.py portfolio-data/projects/my-project.json
```

Intentionally replace an existing generated page:

```bash
python scripts/render-project.py portfolio-data/projects/my-project.json --force
```

Use `--force` only when the structured record and template are intended to remain the source of truth for that page.

## Bespoke Interactive Projects

Use the standard template when the main portfolio story is the project process and outcome.

Use a bespoke page when the custom interaction, simulator, evaluator, scoring model, or other experience is itself important evidence.

A standard case study may link to a separate bespoke demo through `links.live_project`.

Do not clone a standard generated page merely to make small visual changes. Extend the shared component when the change should apply broadly.

## Asset and Confidentiality Safety

Only assets explicitly approved for public use may be rendered or linked publicly.

Private/reference originals belong in the local-only Reference Library workflow unless they are explicitly safe to publish.

Projects marked `needs-sanitization` cannot be rendered as public-ready work. Projects marked `sanitized` may render the shared portfolio-safe note.

## Validation

Relevant checks include:

```bash
python scripts/check-site.py
python scripts/check-content.py
python scripts/check-renderer.py
python scripts/check-new-project.py
python scripts/check-final-polish.py
python scripts/check-system-docs.py
```

`check-renderer.py` protects the current generated architecture, including the final shared CSS, dark snapshot band, flush-top case nav, shared Keep Exploring family, Hiring Guide CTA, and absence of retired template architecture.

Pull requests run the complete validation suite.

## Portfolio Manager Relationship

Portfolio Manager **Create Content** is the normal human-facing workflow for new projects. Manage Content is the normal supported workflow for editing existing structured projects.

For standard generated projects:

```text
Portfolio Manager / project JSON
    ↓
project-page template
    ↓
render-project.py
    ↓
generated public page
```

For bespoke pages, custom public files remain authoritative for interaction behavior while supported structured metadata can still participate in Portfolio Manager workflows.
