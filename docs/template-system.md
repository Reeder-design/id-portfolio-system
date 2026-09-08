# Project Page Template System

The standard project-page system converts structured project records in `portfolio-data/projects/` into consistent portfolio HTML.

## Purpose

The template system separates project content from page layout. Project-specific information lives in JSON; shared page structure lives in `templates/project-page/index.html`; `scripts/render-project.py` combines them.

This is the foundation for the future Portfolio Manager dashboard and project generator.

## Files

- `templates/project-page/index.html` — standard project case-study layout
- `scripts/render-project.py` — renders one structured project record into HTML
- `scripts/check-renderer.py` — renders all project records in memory and checks generated navigation and template completeness
- `portfolio-data/taxonomy.json` — category labels and canonical portfolio paths
- `portfolio-data/projects/*.json` — project-specific content

## What the Renderer Generates

The renderer automatically builds:

- page title and meta description
- shared stylesheet path
- main navigation
- breadcrumbs
- category and subcategory labels
- hero summary and tags
- project at-a-glance details
- challenge, audience, learning goals, design approach, development, and outcomes sections
- public project assets
- tools and skills sidebar
- status badge
- confidentiality note for sanitized examples
- footer and resume path

Relative links are calculated from the project's final output location, so project pages can be nested at different folder depths without manually counting `../` segments.

## Rendering a Project

Preview the generated HTML without writing a file:

```bash
python scripts/render-project.py portfolio-data/projects/pursuit-positioning.json --stdout
```

Render a new project to the `page_path` declared in its JSON record:

```bash
python scripts/render-project.py portfolio-data/projects/my-project.json
```

The renderer will refuse to overwrite an existing file by default.

To intentionally replace an existing generated page:

```bash
python scripts/render-project.py portfolio-data/projects/my-project.json --force
```

Use `--force` only when the structured record and template are intended to be the source for that page.

## Existing Bespoke Projects

The current interactive demos remain custom HTML/JavaScript experiences. This step does not replace them.

The standard template is intended for new case-study pages and future projects that fit the shared layout. A project may still contain a custom interaction or demo linked from its structured record.

## Project Links

Structured records may optionally include:

```json
"links": {
  "live_project": "https://example.com/demo",
  "repository": null,
  "download": null
}
```

When `live_project` is present, the standard template displays launch buttons automatically.

## Asset Safety

Only assets with `"publish": true` are rendered onto the public page.

Reference/source files used to create or edit a project should not be placed in the public repository unless they are explicitly safe to publish. Projects marked `needs-sanitization` cannot be rendered for publishing.

## Validation

Run all three checks locally:

```bash
python scripts/check-site.py
python scripts/check-content.py
python scripts/check-renderer.py
```

Pull requests run these checks automatically.

## Current Source-of-Truth Rule

For existing bespoke pages, the HTML remains authoritative for presentation and interaction behavior.

For future standard case-study pages, the intended workflow is:

```text
project JSON
    ↓
project-page template
    ↓
render-project.py
    ↓
generated index.html
```

The future Portfolio Manager dashboard will edit the structured project record and invoke this renderer rather than asking the user to manually edit repetitive HTML.
