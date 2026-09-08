# id-portfolio-system

Public instructional design portfolio and reusable development system for Haley Reeder.

## Live Portfolio

https://reeder-design.github.io/id-portfolio-system/

## Repository Structure

- `portfolio/` — public GitHub Pages website
- `portfolio/css/styles.css` — shared site styles and design system
- `portfolio/projects/` — portfolio project pages and demos
- `portfolio-data/` — structured project content, taxonomy, and schemas
- `templates/` — reusable HTML templates for generated portfolio pages
- `design-system/` — reusable design-system resources
- `scripts/` — rendering, maintenance, and validation scripts
- `docs/` — maintenance and development documentation
- `.github/workflows/` — automated validation and deployment

## Publishing Workflow

The `main` branch is the approved source for the live portfolio.

When portfolio changes are merged into `main`:

1. GitHub Actions checks out the repository.
2. Portfolio HTML, structured content, and template rendering are validated.
3. If validation passes, the contents of `portfolio/` are uploaded.
4. GitHub Pages deploys the latest approved version.

For substantial changes, work on a separate branch and open a pull request before merging into `main`.

## Structured Project Pages

Standard case-study pages can be generated from project records in `portfolio-data/projects/` using the shared template in `templates/project-page/`.

Preview generated HTML:

```bash
python scripts/render-project.py portfolio-data/projects/pursuit-positioning.json --stdout
```

The renderer does not overwrite an existing page unless `--force` is explicitly supplied.

See `docs/template-system.md` for the full workflow.

## Local Validation

Run:

```bash
python scripts/check-site.py
python scripts/check-content.py
python scripts/check-renderer.py
```

These checks cover public site links and assets, structured content rules, and generated project-page navigation/template completeness.

## Agent Guidance

- `AGENTS.md` contains repository-wide rules for autonomous or assisted development.
- `.github/copilot-instructions.md` contains persistent repository guidance for compatible GitHub AI tooling.

The guiding principle for this system is:

> Build it once, understand how it works, and make it reusable.
