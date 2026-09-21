# New Project Creation

Portfolio Manager **Create Content** is the normal human-facing workflow for new portfolio work.

The lower-level `scripts/new-project.py` command remains available for deterministic development, maintenance, and testing. It creates a **structured project record by default**. Optional legacy scaffold rendering is explicit and is only for a brand-new public path. It is never a regeneration tool for existing portfolio pages.

## Core rule

If a public page already exists, do not recreate it from a template or structured record.

The current public HTML/CSS/JavaScript is authoritative for that existing page.

## Creation flow

For a new standard project:

```text
approved project idea / approved sources
        ↓
structured project record
        ↓
inspect the closest current live page family
        ↓
build the public page intentionally
        ↓
validation + local preview
        ↓
human UAT
        ↓
normal maintenance as a public page
```

A reference scaffold can be previewed for planning, but automation does not write it into `portfolio/`. The real public page is built intentionally from the closest current live page family.

## Running the lower-level creator

From the repository root:

```bash
python scripts/new-project.py
```

or:

```bash
python3 scripts/new-project.py
```

Preview without writing:

```bash
python scripts/new-project.py --dry-run
```

The normal command creates only the structured JSON record. There is no page-generation flag.

To preview the locked reference scaffold without writing a public file:

```bash
python scripts/render-project.py portfolio-data/projects/new-project.json
```

`--yes` skips the final record-creation confirmation but does not bypass path/safety checks.

## What it collects

The guided flow asks for:

- title
- slug
- category / optional subcategory
- status
- confidentiality state
- summary
- business or learning need
- audience
- role
- learning objectives
- design approach
- development process
- outcomes
- skills
- tools
- featured status
- optional live-project link
- optional public-safe source notes
- optional public assets

Canonical placements come from `portfolio-data/taxonomy.json`.

## Safety behavior

The creator stops when:

- the project ID already exists
- the structured record already exists
- the target public page already exists
- another record already claims the target page
- a project is both `live` and `needs-sanitization`

There is no supported force-overwrite path.

Record creation validates the structured data and rolls the record back if validation fails. It never touches the public page.

## Existing pages

Do not use `new-project.py`, `render-project.py`, or the standard scaffold to repair, modernize, or refresh an existing public page.

For an existing page:

1. inspect the current public HTML/CSS/JavaScript
2. identify the current shared/page-specific owners
3. make the smallest direct change
4. validate
5. UAT the actual current page

This protects later UAT fixes from stale template output.

## Visual baseline for a new page

Before approving a new page, build from or compare against the nearest current page family and use:

- `docs/current-page-patterns.md`
- `docs/portfolio-uat-guardrails.md`
- `docs/portfolio-consistency-audit.md`

Pay particular attention to recurring issues: breadcrumbs, light/dark contrast, tab height changes, interaction copy width, icon clipping/centering, icon bubbles, motion layering, padding, and project-ending behavior.

## Source files vs public assets

Private originals do not belong in the public repository.

Use the Portfolio Manager **Reference Library** for private professional source material. Only deliberate public-safe derivatives/assets belong in tracked public paths.

## After creation

A created page is not automatically finished because validation passes.

Review the real local page for:

- visual hierarchy
- current theme consistency
- interaction behavior
- responsive layout
- copy accuracy
- asset quality
- accessibility
- page-family consistency

Then use the normal workflow for the type of change:

- routine approved content: Portfolio Manager Save & Publish on local `main`
- code/system/template infrastructure: feature branch → PR → CI → UAT → explicit merge approval

## Validation

Relevant checks include:

```bash
python scripts/check-new-project.py
python scripts/check-renderer.py
python scripts/check-content.py
python scripts/check-final-polish.py
python scripts/check-site.py
```

These validate creation and repository integrity. They do not replace human visual UAT.
