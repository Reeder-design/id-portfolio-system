# Agent Instructions

This repository contains Haley Reeder's public instructional design portfolio and supporting development system.

## Primary Goal
Maintain a professional, reliable, reusable portfolio system that is easy to update without introducing broken links, inconsistent design, or unnecessary duplication.

## Repository Structure
- `portfolio/` — public website deployed to GitHub Pages
- `portfolio/css/styles.css` — shared site design system and component styles
- `portfolio/projects/` — public portfolio project pages
- `portfolio-data/` — structured portfolio content, taxonomy, and schemas
- `templates/` — reusable HTML templates for standard generated pages
- `design-system/` — supporting design-system materials and reusable development resources
- `.github/workflows/` — repository automation and GitHub Pages deployment
- `docs/` — repository and maintenance documentation
- `scripts/` — maintenance, rendering, and validation scripts

## Public Portfolio Categories
The portfolio is organized around three primary areas:
1. Instructional Design
2. AI Training and Evaluation
3. Workflows

Instructional Design includes interactive learning, multimedia training content, and complete learning pathways.

## Structured Content and Templates
Standard project case-study pages should use structured records in `portfolio-data/projects/` and the reusable template in `templates/project-page/` when the shared layout fits the project.

Use `python scripts/render-project.py <project-json>` to generate a standard project page. The renderer refuses to overwrite an existing page unless `--force` is explicitly supplied.

Bespoke interactive demos may remain custom HTML/CSS/JavaScript when their learning interaction requires a custom experience. Do not flatten custom interactions into the standard case-study template.

When a generated page is being maintained through structured data, update the structured record and re-render rather than manually duplicating edits across the JSON and HTML.

## Development Rules
When modifying the public portfolio:
1. Preserve the existing visual system unless a redesign is explicitly requested.
2. Use shared CSS variables and existing components before creating new styles.
3. Keep HTML semantic, responsive, and accessible.
4. Use relative internal links.
5. Preserve working navigation and footer paths.
6. Avoid escaped HTML such as `\<!DOCTYPE html>` or `\<div>`.
7. Never place Markdown-formatted links such as `[https://example.com](https://example.com)` inside HTML attributes.
8. Use `target="_blank"`, not escaped variants.
9. Keep JavaScript understandable and maintainable.
10. Prefer reusable components, templates, data objects, and interaction patterns over duplicating code.

## Content and Confidentiality
Public portfolio content must not expose confidential or proprietary employer, customer, partner, or product information.

When real work cannot be shown publicly, use fictionalized, sanitized, or generalized scenarios while preserving the instructional-design problem and solution pattern.

Do not invent accomplishments, metrics, tools, credentials, clients, or project outcomes.

Reference/source files are not public assets by default. Only explicitly approved public assets should be committed and rendered onto public pages.

## Workflow Rules for Agents
For substantial changes:
1. Work on a separate branch.
2. Keep the change focused on one goal.
3. Update relevant documentation when structure or workflow changes.
4. Run `python scripts/check-site.py`.
5. Run `python scripts/check-content.py` when structured content changes.
6. Run `python scripts/check-renderer.py` when templates, structured project data, or the renderer changes.
7. Check links, paths, navigation, responsive behavior, and obvious accessibility issues.
8. Open a pull request describing what changed and what the user should review.
9. Do not merge into `main` unless the user explicitly approves it.

For deterministic maintenance tasks, use existing scripts and automation instead of manually reproducing the work.

## Design Principle
Build it once, understand how it works, and make it reusable.
