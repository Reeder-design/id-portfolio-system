# Portfolio Content Model

The portfolio uses structured JSON data as the source layer for future dashboard editing, project generation, documentation, and automation.

## Purpose

The content model separates project information from presentation code.

Instead of treating each HTML file as the only source of truth, future tools can read and write structured project records under `portfolio-data/` and then generate or update the public site safely.

## Structure

```text
portfolio-data/
├── taxonomy.json
├── schema/
│   └── project.schema.json
└── projects/
    ├── pursuit-positioning.json
    ├── meddpicc-practice.json
    └── ai-training-and-evaluation-demo.json
```

## Core Fields

Each project record includes:

- identity: `id`, `title`, `slug`
- placement: `category`, `subcategory`, `page_path`
- lifecycle: `status`, `featured`, dates
- public framing: `summary`, `skills`, `tools`
- case-study content: business need, audience, objectives, role, design approach, development process, outcomes
- confidentiality state
- assets
- notes about source material

## Canonical Categories

### Instructional Design

- Interactive Learning
- Multimedia Training Content
- Complete Learning Pathways

### AI Training and Evaluation

No required subcategory yet.

### Workflows

- Design + Development
- AI + Automation
- Data + Reporting

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

A future dashboard may accept two different classes of files:

1. **Reference/source material** used to draft or revise content.
2. **Public assets** intentionally included in the portfolio.

Reference/source material must not be automatically committed to this public repository.

Public assets belong inside the relevant public project folder and must be explicitly marked for publishing.

Each structured asset record includes a `publish` boolean so future tooling can enforce this distinction.

## Editing Rules

For now, existing HTML remains the live site and these JSON records are an additional structured source layer.

Future phases will:

1. validate project records automatically;
2. generate project pages from templates;
3. update project indexes from structured data;
4. power the Portfolio Manager dashboard;
5. update documentation and version history automatically.

## Design Principle

Structured data should hold the information that changes from project to project. Templates and shared code should hold the presentation and behavior that should remain consistent.
