# Portfolio Maintenance Guide

## Standard Change Process

For substantial portfolio updates:

1. Create a branch from `main`.
2. Make the requested changes.
3. Run `python scripts/check-site.py`.
4. Open a pull request into `main`.
5. Review the changed files and automated validation result.
6. Merge only after the change is approved.
7. GitHub Pages deploys automatically from `main` after validation passes.

## Small vs. Substantial Changes

Use a pull request for changes that affect page structure, navigation, interactions, shared styles, project architecture, automation, or multiple files.

Very small low-risk edits can be handled more directly when explicitly requested, but the default maintenance pattern is branch → pull request → review → merge.

## Automated Checks

`python scripts/check-site.py` scans the public `portfolio/` directory for:

- broken relative `href` links
- broken local `src` assets
- escaped HTML tags
- Markdown-formatted URLs accidentally inserted into HTML attributes
- escaped `target="_blank"` values
- missing `<title>` elements
- missing meta descriptions

Errors fail validation. Metadata findings are currently warnings so older pages can be improved gradually without blocking every change.

## Publishing

`.github/workflows/deploy-pages.yml` publishes the contents of `portfolio/` to GitHub Pages.

The deployment workflow validates the site before uploading it. A validation failure stops deployment instead of publishing a known broken version.

## Agent Workflow

Agents should read `AGENTS.md` before substantial repository work.

The preferred pattern is:

request → branch → edits → validation → pull request → human review → merge → deployment

Agents should not merge substantial changes into `main` without explicit user approval.

## Future Automation

Planned improvements may include:

- reusable page/project generators
- automatic content inventory documentation
- sitemap generation
- additional accessibility checks
- reusable interaction templates
- structured project metadata for easier page creation and updates
