# Portfolio Template System

The public portfolio uses a structured content model plus reusable HTML/CSS/JavaScript patterns so new projects can be added without rebuilding page architecture from scratch.

## Structured project pages

Structured project records live in `portfolio-data/projects/` and are validated against `portfolio-data/schema/project.schema.json`.

The renderer in `scripts/render-project.py` combines a structured project record with `templates/project-page/index.html` to produce the public project page defined by each record's `page_path`.

The generated project template supports:

- project metadata and public-safe summaries
- breadcrumbs and project hierarchy
- project snapshot information
- Need, Design Decisions, Build, Outcome, and optional detail sections
- optional public assets
- optional related work
- public-safe confidentiality notes
- shared interaction and motion behavior

## Canonical breadcrumbs

Breadcrumbs are a sitewide navigation component, not a page-by-page visual choice.

`portfolio/js/portfolio-motion.js` rebuilds the public breadcrumb trail from the current portfolio route so that:

- `Home` and every parent level are clickable
- the current page is the only non-clickable breadcrumb
- labels, separators, hierarchy, and spacing remain consistent across hand-authored and generated pages
- a missing breadcrumb element can be inserted into the page hero automatically

The generated project renderer also writes linked parent breadcrumbs directly into new project pages. The shared JavaScript remains the compatibility and consistency layer for existing public pages.

## Canonical Keep Exploring component

There is one public **Keep Exploring** presentation standard: the component used by the Interactive Learning page.

Its structure is:

- `section section-soft`
- `section-heading refresh-section-intro`
- `refresh-card-grid`
- `refresh-link-card`
- `refresh-link-card-header`
- `refresh-link-card-body`
- `project-family-link`

Each card uses the same icon placement, heading hierarchy, body spacing, and aligned link position.

The generated project template now writes this component natively. `portfolio/js/portfolio-motion.js` also normalizes older public closing sections into the same structure at runtime so legacy pages cannot display a competing Keep Exploring design while they are being migrated.

Do not create a new closing CTA, explore strip, special project CTA, or category-specific Keep Exploring component. Extend the canonical component instead.

## Interaction system

Project-specific interactions can be layered on top of the shared template when the project benefits from deeper evidence exploration. Examples include:

- tabbed decision views
- workflow or lifecycle explorers
- scenario interactions
- evidence toggles
- related-work navigation

The interaction should clarify the work rather than repeat static copy already visible on the page.

## Public-safe design

Structured content must remain suitable for a public portfolio. Internal configurations, private learner data, proprietary screenshots, unreleased product information, credentials, reviewer comments, and other restricted source material stay out of the public site.

The project record should describe the work at the level needed to demonstrate capability without exposing confidential implementation detail.

## Validation

The CI validation suite checks the structured content model, rendered pages, public privacy boundaries, responsive behavior, template requirements, Portfolio Manager behavior, and shared component standards.

The final-polish validator specifically protects the canonical breadcrumb and Keep Exploring behavior so later edits cannot silently reintroduce inconsistent navigation patterns.
