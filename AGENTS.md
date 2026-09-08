# Agent Instructions

This repository contains Haley Reeder's public instructional design portfolio and supporting development system.

## Primary Goal
Maintain a professional, reliable, reusable portfolio system that is easy to update without introducing broken links, inconsistent design, or unnecessary duplication.

## Repository Structure
- `portfolio/` — public website deployed to GitHub Pages
- `portfolio/css/styles.css` — shared site design system and component styles
- `portfolio/projects/` — public portfolio project pages
- `design-system/` — supporting design-system materials and reusable development resources
- `.github/workflows/` — repository automation and GitHub Pages deployment
- `docs/` — repository and maintenance documentation
- `scripts/` — maintenance and validation scripts

## Public Portfolio Categories
The portfolio is organized around three primary areas:
1. Instructional Design
2. AI Training and Evaluation
3. Workflows

Instructional Design includes interactive learning, multimedia training content, and complete learning pathways.

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

## Workflow Rules for Agents
For substantial changes:
1. Work on a separate branch.
2. Keep the change focused on one goal.
3. Update relevant documentation when structure or workflow changes.
4. Run `python scripts/check-site.py` before proposing the change.
5. Check links, paths, navigation, responsive behavior, and obvious accessibility issues.
6. Open a pull request describing what changed and what the user should review.
7. Do not merge into `main` unless the user explicitly approves it.

For deterministic maintenance tasks, use existing scripts and automation instead of manually reproducing the work.

## Design Principle
Build it once, understand how it works, and make it reusable.
