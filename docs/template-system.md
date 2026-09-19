# Project Page Template System

The standard project-page system converts structured project records in `portfolio-data/projects/` into polished public case-study pages.

## Purpose

The template separates project content from page layout. Project-specific information lives in JSON; shared page structure lives in `templates/project-page/index.html`; `scripts/render-project.py` combines them.

The standard template is a strong default, not a requirement that every project look identical. Bespoke interactive demos can remain custom pages when the interaction itself is meaningful portfolio evidence.

## Source of Truth

Use these files for their specific responsibilities:

- `portfolio-data/taxonomy.json` — canonical category IDs, labels, subcategories, and public paths
- `portfolio-data/component-registry.json` — canonical reusable component IDs, ownership, support level, and intended use
- `portfolio-data/schema/project.schema.json` — structured project requirements
- `portfolio-data/projects/*.json` — project-specific structured content
- `templates/project-page/index.html` — standard generated case-study markup
- `scripts/render-project.py` — deterministic rendering behavior
- bespoke files under `portfolio/` — authoritative interaction/presentation for intentionally custom experiences

Documentation should describe this system, not duplicate its taxonomy or override its behavior.

## Files

- `templates/project-page/index.html` — standard generated case-study layout
- `scripts/render-project.py` — renders one structured project record into HTML
- `scripts/check-renderer.py` — renders all project records in memory and checks links, shared styling, required architecture, and conditional Evidence behavior
- `portfolio-data/schema/project.schema.json` — validates structured project records
- `portfolio-data/taxonomy.json` — category labels and canonical portfolio paths
- `portfolio-data/projects/*.json` — project-specific content

## Standard Page Architecture

Generated projects use the established public case-study pattern:

```text
short visual hero
    ↓
project snapshot
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
Keep Exploring
```

The design intentionally avoids the older long-sidebar / repetitive-section pattern.

### Hero

The hero keeps the public project summary short and scan-friendly. It includes:

- category
- project title
- short summary
- up to six skill/tool tags
- optional live-project action
- back navigation
- category-aware iconography

### Project Snapshot

A compact snapshot surfaces:

- role
- audience
- project type
- status

### Need

Uses the structured business need, audience, and learning objectives to establish why the project exists and what the audience needs to be able to do.

### Design Decisions

Uses the structured design approach and skill metadata to show how the solution was shaped.

### Build

Uses the development process, tools, and role fields to explain how the solution was built and validated.

### Evidence

Evidence is conditional. If the structured record contains assets with `"publish": true`, the renderer adds an Evidence nav item and an Evidence section. If there are no public assets, the page does not create an empty evidence block.

Supported public asset treatments include:

- images
- video
- PDFs/documents/downloads
- embeds/code/other public references as linked artifacts

The template does not invent an interaction or artifact when a project does not have one.

### Outcome

Uses the structured outcomes field and a compact project/capability snapshot so the page closes on relevance and evidence rather than metadata.

### Keep Exploring

Generated pages end with routes to the parent portfolio area, Projects, and the portfolio overview.

The canonical presentation uses the same shared component pattern as the broader portfolio. Do not create a competing category-specific closing component unless the public design system is intentionally being changed.

`portfolio/js/portfolio-motion.js` still normalizes some older hand-built page structures at runtime. Treat that as compatibility behavior, not permission to add another parallel markup pattern.

### Related Work and Related References

Structured project-to-project connections use the optional `related_work` field on project records. The standard renderer turns those relationships into the conditional Related Work section.

Portfolio Manager **Related References** has two responsibilities:

- manage the structured relationship graph: outgoing connections, incoming references, and deterministic suggestions based on existing category/subcategory, skills, tools, and graph metadata
- preserve rename/reference integrity when a managed title changes by reviewing visible linked labels/cards that may need updating

Suggestions never auto-add a project connection. Relationship metadata on a bespoke project does not inject a public Related Work block into that custom page. Generated pages surface approved `related_work` changes only after the normal regenerate step.

### Reusable Component Registry

`portfolio-data/component-registry.json` is the canonical registry for reusable interaction and presentation patterns.

Each registry entry documents:

- component ID and label
- category and support status
- intended use and when to avoid the pattern
- implementation-owner files
- stable DOM/architecture markers where useful

The registry distinguishes **template-supported** components from **custom-pattern** components. Template-supported patterns are already owned by the standard renderer/template system. Custom patterns document an established reusable approach without implying that Portfolio Manager can inject that implementation into a bespoke page.

Projects may record optional `component_refs` metadata for intentional component use. Portfolio Manager also infers some usage directly from structured project data and generated-page architecture. Inferred usage is not duplicated into project records automatically.

Create Content AI planning receives this registry as an approved design-system menu. It should prefer an existing component when it fits and return only a valid registry ID; when no registered component fits, the plan may recommend a custom pattern without inventing an ID. Approved registry IDs flow into controlled local builds as metadata only.

## Breadcrumb and Page Path Standard

Breadcrumbs are a shared navigation component rather than a page-by-page styling choice.

Expected behavior:

- `Home` is clickable
- every real parent page in the hierarchy is clickable
- the current page is the only non-clickable breadcrumb
- labels and separators use the shared treatment
- the hierarchy links only to real public landing pages

Generated project pages write linked parent breadcrumbs through `render-project.py`. The shared portfolio behavior may normalize legacy/custom markup, but new generated markup should be correct without relying on runtime repair.

## Shared Portfolio Behavior

Generated pages load the shared public styling/behavior stack used by the rest of the portfolio, including the core theme/frame and portfolio motion behavior.

Sitewide features that are injected or normalized by shared build/runtime code should have one clear owner. Before adding another shared layer, inspect the current generator, static build, and `portfolio-motion.js` responsibilities.

Contextual demo help remains opt-in for selected demo experiences.

## Supported Categories

Structured categories and paths come from `portfolio-data/taxonomy.json`. The current top-level public areas are:

- Instructional Design
- AI Training and Evaluation
- LMS Administration & System Operations
- System Integrations and Workflows

Instructional Design subcategories and workflow groupings should also be read from the taxonomy rather than duplicated in renderer logic when avoidable.

## Rendering a Project

Preview generated HTML without writing a file:

```bash
python scripts/render-project.py portfolio-data/projects/pursuit-positioning.json --stdout
```

Render a new project to the `page_path` declared in its JSON record:

```bash
python scripts/render-project.py portfolio-data/projects/my-project.json
```

The renderer refuses to overwrite an existing file by default. To intentionally replace an existing generated page:

```bash
python scripts/render-project.py portfolio-data/projects/my-project.json --force
```

Use `--force` only when the structured record and template are intended to remain the source of truth for that page.

## Bespoke Interactive Projects

Custom demos remain custom HTML/CSS/JavaScript experiences when the interaction, simulation, evaluator, scoring model, or other bespoke behavior is itself important evidence.

Use the standard template when the main portfolio story is the project process and outcome. Use a bespoke page when the custom experience itself is part of what should be evaluated.

A standard case study can link to a separate interactive demo through `links.live_project`.

Do not copy a standard generated page into a hand-maintained variant merely to make small visual changes. Extend the shared template/component when the change should apply broadly.

## Project Links

Structured records may optionally include:

```json
"links": {
  "live_project": "https://example.com/demo",
  "repository": null,
  "download": null
}
```

When supported links are present, the renderer exposes the corresponding actions.

## Asset and Confidentiality Safety

Only assets intentionally approved for public use should be rendered or linked publicly.

Reference/source files used to create or edit a project belong in the local-only Reference Library workflow unless they are explicitly safe to publish. Projects marked `needs-sanitization` cannot be treated as public-ready work.

Projects marked `sanitized` may use public-safe notes explaining that details are sanitized, fictionalized, or generalized when appropriate.

## Validation

Relevant lower-level checks include:

```bash
python scripts/check-site.py
python scripts/check-content.py
python scripts/check-renderer.py
python scripts/check-new-project.py
python scripts/check-final-polish.py
```

Pull requests run the complete validation suite automatically. For substantial work, use the full suite rather than treating this list as a substitute for release validation.

`check-renderer.py` protects generated-page architecture and unresolved template/link problems. `check-final-polish.py` protects broader shared presentation expectations.

## Portfolio Manager Relationship

Portfolio Manager **Create Content** is the normal human-facing workflow for new projects. Manage Content is the normal supported workflow for editing existing structured projects.

For standard generated project pages, the intended relationship is:

```text
Portfolio Manager / project JSON
    ↓
project-page template
    ↓
render-project.py
    ↓
generated index.html
```

For bespoke pages, custom public files remain authoritative for custom interaction behavior while supported structured metadata/content can still participate in Manager workflows.
