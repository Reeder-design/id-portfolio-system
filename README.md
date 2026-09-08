# id-portfolio-system

Public instructional design portfolio and reusable development system for Haley Reeder.

## Live Portfolio

https://reeder-design.github.io/id-portfolio-system/

## Repository Structure

- `portfolio/` — public GitHub Pages website
- `portfolio/css/styles.css` — shared site styles and design system
- `portfolio/projects/` — portfolio project pages and demos
- `design-system/` — reusable design-system resources
- `scripts/` — repository maintenance and validation scripts
- `docs/` — maintenance and development documentation
- `.github/workflows/` — automated validation and deployment

## Publishing Workflow

The `main` branch is the approved source for the live portfolio.

When portfolio changes are merged into `main`:

1. GitHub Actions checks out the repository.
2. `scripts/check-site.py` validates the portfolio.
3. If validation passes, the contents of `portfolio/` are uploaded.
4. GitHub Pages deploys the latest approved version.

For substantial changes, work on a separate branch and open a pull request before merging into `main`.

## Local Validation

Run:

```bash
python scripts/check-site.py
```

The checker looks for broken local links and assets, escaped HTML, Markdown-formatted URLs inside HTML attributes, escaped `_blank` targets, and missing basic page metadata.

## Agent Guidance

- `AGENTS.md` contains repository-wide rules for autonomous or assisted development.
- `.github/copilot-instructions.md` contains persistent repository guidance for compatible GitHub AI tooling.

The guiding principle for this system is:

> Build it once, understand how it works, and make it reusable.
