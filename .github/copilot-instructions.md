# Repository Instructions

This repository powers Haley Reeder's public instructional design portfolio and reusable development system.

## Public Site
The deployed website lives in `portfolio/` and is published through GitHub Pages.

Do not move the public site outside `portfolio/` unless explicitly requested.

## Design System
Use the existing design language in `portfolio/css/styles.css`.

Primary palette:
- Taupe `#4A4238`
- Charcoal `#4D5359`
- Pine Blue `#508484`
- Mint Leaf `#79C99E`
- Yellow Green `#97DB4F`

Typography:
- Headings: Montserrat
- Body/UI: Open Sans

Prefer existing shared classes and CSS variables over page-specific styling when practical.

## Portfolio Architecture
Primary public project categories:
- Instructional Design
- AI Training and Evaluation
- Workflows

Instructional Design contains:
- Interactive Learning
- Multimedia Training Content
- Complete Learning Pathways

## Coding Rules
- Use semantic HTML.
- Keep internal links relative.
- Preserve responsive behavior and keyboard accessibility.
- Do not output escaped HTML with backslashes before tags.
- Do not place Markdown-formatted URLs inside HTML attributes.
- Use `target="_blank"` for external links that should open in a new tab.
- Keep JavaScript readable and data-driven when possible.
- Prefer reusable patterns over one-off duplication.

## Content Rules
Never expose confidential employer, customer, partner, or unreleased product information.
Use fictionalized or sanitized examples when needed.
Do not invent professional claims, metrics, clients, or results.

## Before Completing Changes
- Run `python scripts/check-site.py` when available.
- Check navigation and relative links.
- Update documentation if the repository structure or maintenance workflow changes.
- For substantial work, use a branch and pull request rather than changing `main` directly.
