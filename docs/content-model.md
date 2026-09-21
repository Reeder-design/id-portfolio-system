# Portfolio Content Model

The portfolio uses structured JSON data alongside purpose-built public HTML/CSS/JavaScript. The structured layer supports Portfolio Manager editing, deterministic rendering, documentation, validation, and automation without forcing every public experience into one template.

## Purpose

The content model separates information that should be reusable and machine-readable from presentation code that may vary by experience.

Structured data is not a future placeholder. It is part of the current system and is used by Portfolio Manager, record generators, scaffold preview, validation, and documentation tooling.

## Source-of-Truth Boundaries

Use the narrowest authoritative source for the thing being changed:

- `portfolio-data/taxonomy.json` — canonical category IDs, labels, subcategories, and public paths
- `portfolio-data/component-registry.json` — canonical reusable component IDs and implementation ownership
- `portfolio-data/projects/*.json` — structured project records
- `portfolio-data/site-content.json` — supported structured general-page content
- `portfolio-data/schema/` — structured-record requirements
- existing files under `portfolio/` — authoritative presentation/interaction for every existing public page
- `templates/project-page/index.html` + `scripts/render-project.py` — preview-only reference scaffold; they do not write public HTML

Documentation describes these sources; it does not replace them.

## Structure

```text
portfolio-data/
├── taxonomy.json
├── component-registry.json
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
- optional project relationships in `related_work`
- optional reusable-design metadata in `component_refs`

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

### LMS Administration

Structured subcategories currently include:

- System Integrations

### Workflows

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

Portfolio Manager is the normal human-facing editing layer for supported structured content. Lower-level scripts remain available for deterministic new-page development and maintenance testing.

For a **new** project:

```text
project JSON
    ↓
optional reference-scaffold preview
    ↓
inspect closest current live page family
    ↓
intentional public-page build
    ↓
human UAT
```

The scaffold preview never writes the public page. Once a page is built, its HTML/CSS/JavaScript is the presentation source of truth.

For existing pages, edit the current public implementation directly. Structured records may continue to provide metadata/content fields, but they are not a replacement copy of the full page.

Do not use a stale template, generated documentation, old Git history, or a structured record to overwrite a current public page.

### Project Relationships

`related_work` is the structured source for meaningful project-to-project connections. Portfolio Manager Related References exposes outgoing connections, incoming references, and deterministic suggestions based only on existing structured metadata. Suggestions require human approval and never auto-add links.

`related_work` supports the internal project relationship graph and Related References workflow. It does not automatically create or inject a public Related Work section.

### Reusable Components

`component_refs` records intentional association with entries in `portfolio-data/component-registry.json`. The registry is documentation and ownership metadata first: it identifies established patterns, their implementation files, and whether the standard template supports them.

Some component usage is inferred directly from structured data or generated-page architecture and therefore does not need to be redundantly stored. A component reference never grants Portfolio Manager permission to inject code into a custom experience.

## Portfolio Manager Relationship

Portfolio Manager reads and updates the current structured/public sources rather than maintaining a separate public-content database.

Current workflows include:

- Manage Content for existing pages/projects
- Create Content for new portfolio work
- Reference Library for private originals and sanitized derivatives
- deterministic rendering/build steps
- validation, preview, recovery, and publishing handoff

Private proposals, uploads, backups, notes, and reference originals remain outside tracked public content under `.portfolio-manager/`.

## Future public-page builds

Structured records do not define a finished page layout. For new public work, use `docs/current-page-patterns.md` to choose the closest current live page family, then apply the recurring checks in `docs/portfolio-uat-guardrails.md`.

The reference scaffold is useful for content architecture only. Current live pages remain the visual and interaction standard.

## Design Principle

Structured data should hold information that benefits from consistent editing, validation, reuse, or automation. Existing public pages own their presentation. Shared code should own genuinely shared behavior, and templates should remain preview/reference material rather than an overwrite mechanism.
