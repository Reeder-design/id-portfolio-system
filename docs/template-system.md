# Project Page Template System

The standard project-page system converts structured project records in `portfolio-data/projects/` into polished public case-study pages.

## Purpose

The template separates project content from page layout. Project-specific information lives in JSON; shared page structure lives in `templates/project-page/index.html`; `scripts/render-project.py` combines them.

The standard template is intentionally a strong default, not a rule that every project must look identical. Bespoke interactive demos can remain custom pages when the interaction itself is part of the portfolio evidence.

## Files

- `templates/project-page/index.html` — standard generated case-study layout
- `scripts/render-project.py` — renders one structured project record into HTML
- `scripts/check-renderer.py` — renders all project records in memory and checks links, shared styling, required architecture, and conditional Evidence behavior
- `portfolio-data/schema/project.schema.json` — validates structured project records
- `portfolio-data/taxonomy.json` — category labels and canonical portfolio paths
- `portfolio-data/projects/*.json` — project-specific content

## Final Standard Page Architecture

Generated projects now follow the strongest patterns established across the live portfolio:

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

The design intentionally avoids the older long sidebar + six repetitive case-study sections pattern.

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

A compact snapshot replaces the old metadata sidebar. It surfaces:

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

Uses the structured outcomes field and repeats a compact project/capability snapshot so the page closes on evidence and relevance rather than metadata.

### Keep Exploring

Every generated page ends with clear routes to the parent portfolio area, the full Projects page, and the portfolio overview.

There is now one public Keep Exploring presentation standard: the component used by the Interactive Learning page. Generated project pages use the same structure natively:

- `section section-soft`
- `section-heading refresh-section-intro`
- `refresh-card-grid`
- `refresh-link-card`
- `refresh-link-card-header`
- `refresh-link-card-body`
- `project-family-link`

Do not create a new closing CTA, explore strip, category-specific card grid, or project-only Keep Exploring treatment. Extend the canonical component instead.

For legacy hand-built pages, `portfolio/js/portfolio-motion.js` normalizes existing Keep Exploring sections into the same structure at runtime so older markup cannot display a competing design while those pages are gradually migrated.

## Breadcrumb and Page Path Standard

Breadcrumbs are a shared navigation component rather than a page-by-page styling choice.

The expected behavior is:

- `Home` is clickable
- every parent page in the hierarchy is clickable
- the current page is the only non-clickable breadcrumb, following standard breadcrumb behavior
- labels and separators use the same visual treatment throughout the portfolio
- the breadcrumb hierarchy reflects only real public landing pages, avoiding links to folders that do not have a public index page

Generated project pages write linked parent breadcrumbs directly through `render-project.py`.

`portfolio/js/portfolio-motion.js` also normalizes breadcrumbs across hand-built and generated pages. It can rebuild inconsistent breadcrumb markup and insert the standard breadcrumb into a page hero when a public page does not already include one.

## Shared Portfolio Behavior

Generated pages now load the same public styling and behavior stack as the hand-built portfolio pages:

- `portfolio/css/styles.css`
- `portfolio/css/portfolio-refresh.css`
- `portfolio/css/phase1-theme.css`
- `portfolio/css/phase1-frame.css`
- `portfolio/js/portfolio-motion.js`

Because the shared motion layer loads the hiring-support styles, generated pages also inherit the sitewide recruiter guide and the compact-UI spacing/overflow safeguards.

Contextual Demo Help remains opt-in and is only enabled for selected demo URLs in `portfolio-motion.js`.

## Supported Categories

Structured projects may be created under:

- Instructional Design
- AI Training and Evaluation
- LMS Administration & System Operations
- Systems and Workflows

The renderer uses category-aware portfolio icons automatically.

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

Current custom demos remain custom HTML/JavaScript experiences. They are not forced back into the standard template.

Use the standard template when the main portfolio story is the project process and outcome. Use a bespoke page when the interaction, simulation, evaluator, scoring model, or other custom experience is itself important evidence of the work.

A standard case study can also link to a separate interactive demo through `links.live_project`.

## Project Links

Structured records may optionally include:

```json
"links": {
  "live_project": "https://example.com/demo",
  "repository": null,
  "download": null
}
```

When `live_project` is present, launch buttons are displayed automatically.

## Asset and Confidentiality Safety

Only assets with `"publish": true` are rendered onto the public page.

Reference/source files used to create or edit a project should not be placed in the public repository unless they are explicitly safe to publish. Projects marked `needs-sanitization` cannot be rendered for publishing.

Projects marked `sanitized` automatically receive a public-safe portfolio note explaining that the example uses sanitized, fictionalized, or generalized content.

## Validation

Run:

```bash
python scripts/check-site.py
python scripts/check-content.py
python scripts/check-renderer.py
python scripts/check-new-project.py
python scripts/check-final-polish.py
```

Pull requests run the complete validation suite automatically.

`check-renderer.py` specifically protects the final generated-page architecture by checking for the shared theme/motion stack, snapshot/story structure, conditional Evidence section, Keep Exploring path, valid links, and unresolved template tokens.

`check-final-polish.py` also protects the sitewide breadcrumb and Keep Exploring standards by verifying the shared normalizer and canonical generated-page component.

## Source-of-Truth Rule

For bespoke interactive pages, the custom HTML/JavaScript remains authoritative for presentation and interaction behavior.

For standard generated project pages:

```text
project JSON
    ↓
project-page template
    ↓
render-project.py
    ↓
generated index.html
```

Portfolio Manager should edit the structured project record and invoke the renderer instead of requiring manual edits to repetitive HTML.
