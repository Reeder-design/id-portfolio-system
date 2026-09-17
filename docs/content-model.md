# Portfolio Content Model

The portfolio uses structured JSON data alongside purpose-built public HTML/CSS/JavaScript. The structured layer supports Portfolio Manager editing, deterministic rendering, documentation, validation, and automation without forcing every public experience into one template.

## Purpose

The content model separates information that should be reusable and machine-readable from presentation code that may vary by experience.

Structured data is not a future placeholder. It is part of the current system and is used by Portfolio Manager, renderers, generators, validation, and documentation tooling.

## Source-of-Truth Boundaries

Use the narrowest authoritative source for the thing being changed:

- `portfolio-data/taxonomy.json` — canonical category IDs, labels, subcategories, and public paths
- `portfolio-data/projects/*.json` — structured project records
- `portfolio-data/site-content.json` — supported structured general-page content
- `portfolio-data/schema/` — structured-record requirements
- `templates/project-page/index.html` + `scripts/render-project.py` — standard generated case-study presentation
- bespoke files under `portfolio/` — authoritative presentation/interaction for intentionally custom experiences

Documentation describes these sources; it does not replace them.

## Structure

```text
portfolio-data/
├── taxonomy.json
├── site-content.json
├── version.json
├── schema/
│   └── project.schema.json
└── projects/
    └── *.json
```

## Core Project Fields

Structured project records include fields for:

- identity: `id`, `title`, `slug`
- placement: `category`, `subcategory`, `page_path`
- lifecycle: `status`, `featured`, dates
- public framing: `summary`, `skills`, `tools`
- case-study content: business need, audience, objectives, role, design approach, development process, outcomes
- confidentiality state
- assets
- source/sanitization notes
- supported links

The schema and validation scripts are authoritative for exact required/optional fields.

## Canonical Public Taxonomy

`portfolio-data/taxonomy.json` is the source of truth. The current top-level areas are:

### Instructional Design

- Interactive Learning
- Microlearning & Performance Support
- Multimedia Training Content
- Live Training
- Complete eLearning Pathways

### AI Training and Evaluation

No required subcategory currently.

### LMS Administration & System Operations

No required subcategory currently.

### System Integrations and Workflows

Structured groupings currently include:

- Design + Development
- AI + Automation
- Data + Reporting

Do not copy this list into new code as a parallel taxonomy. Read `taxonomy.json` when behavior depends on category values or paths.

## Status Values

- `live`
- `building`
- `planned`
- `archived`

## Confidentiality Values

- `public` — safe to publish as provided
- `sanitized` — intentionally fictionalized or generalized for public use
- `needs-sanitization` — must not be published until reviewed and sanitized

## Asset Rules

The system distinguishes between private/reference source material and public portfolio assets.

1. **Reference/source material** belongs in the local-only Reference Library / `.portfolio-manager/` workflow and must not be committed merely because it informed a portfolio project.
2. **Public assets** may be referenced by structured project records only when they are intentionally approved for public use.

Only publishable assets should live under public/tracked portfolio paths. Structured asset records use publication state so rendering and validation can enforce the boundary.

## Editing and Rendering Rules

Portfolio Manager is the normal human-facing editing layer for supported structured content. Lower-level scripts remain available for deterministic development and maintenance.

For a standard generated project:

```text
project JSON
    ↓
project-page template
    ↓
render-project.py
    ↓
public index.html
```

For intentionally bespoke interactive pages, custom HTML/CSS/JavaScript may remain the presentation source of truth while structured records provide metadata or case-study content where supported.

Do not assume every existing HTML page is generated, and do not assume every structured record may be edited independently of its rendered output. Inspect the page type and current ownership before changing it.

## Portfolio Manager Relationship

Portfolio Manager reads and updates the current structured/public sources rather than maintaining a separate public-content database.

Current workflows include:

- Manage Content for existing pages/projects
- Create Content for new portfolio work
- Reference Library for private originals and sanitized derivatives
- deterministic rendering/build steps
- validation, preview, recovery, and publishing handoff

Private proposals, uploads, backups, notes, and reference originals remain outside tracked public content under `.portfolio-manager/`.

## Design Principle

Structured data should hold information that benefits from consistent editing, validation, reuse, or automation. Templates and shared code should hold behavior/presentation that should stay consistent. Bespoke public experiences should remain custom only when the custom interaction itself is valuable evidence.
