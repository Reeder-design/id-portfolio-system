# id-portfolio-system

Public instructional design portfolio and reusable development system for Haley Reeder.

## Live Portfolio

https://reeder-design.github.io/id-portfolio-system/

## Repository Structure

- `portfolio/` — public GitHub Pages website
- `portfolio/css/styles.css` — shared site styles and design system
- `portfolio/projects/` — portfolio project pages and demos
- `portfolio-data/` — structured project content, taxonomy, schemas, and portfolio version source data
- `templates/` — reusable HTML templates for generated portfolio pages
- `design-system/` — reusable design-system resources
- `scripts/` — project creation, rendering, documentation, maintenance, and validation scripts
- `docs/` — maintenance docs, generated inventory/map/changelog, and version snapshots
- `.github/workflows/` — automated validation and deployment

## Publishing Workflow

The `main` branch is the approved source for the live portfolio.

When portfolio changes are merged into `main`:

1. GitHub Actions checks out the repository.
2. Portfolio HTML, structured content, generated documentation, project creation rules, and template rendering are validated.
3. If validation passes, the contents of `portfolio/` are uploaded.
4. GitHub Pages deploys the latest approved version.

For substantial changes, work on a separate branch and open a pull request before merging into `main`.

## Create a New Project

Run the guided generator from the repository root:

```bash
python3 scripts/new-project.py
```

It collects the project information, creates the structured JSON record, calculates the canonical project path, renders the standard case-study page, validates the result, and refreshes generated portfolio documentation.

Preview without writing files:

```bash
python3 scripts/new-project.py --dry-run
```

See `docs/new-project-guide.md` for the full workflow and confidentiality safeguards.

## Structured Project Pages

Standard case-study pages are generated from project records in `portfolio-data/projects/` using the shared template in `templates/project-page/`.

Preview generated HTML for an existing project:

```bash
python3 scripts/render-project.py portfolio-data/projects/pursuit-positioning.json --stdout
```

The renderer does not overwrite an existing page unless `--force` is explicitly supplied.

See `docs/template-system.md` for the rendering workflow.

## Documentation and Versioning

Refresh the generated content inventory, portfolio map, and changelog:

```bash
python3 scripts/update-docs.py
```

Check that generated documentation is current without changing files:

```bash
python3 scripts/update-docs.py --check
```

Create an intentional semantic version release:

```bash
python3 scripts/update-docs.py --bump minor --message "Add a new interactive learning project"
```

Version source data lives in `portfolio-data/version.json`. Release snapshots are stored under `docs/versions/`.

See `docs/versioning-guide.md` for patch/minor/major rules and the release workflow.

## Local Validation

Run:

```bash
python3 scripts/check-site.py
python3 scripts/check-content.py
python3 scripts/check-renderer.py
python3 scripts/check-new-project.py
python3 scripts/update-docs.py --check
```

These checks cover public site links and assets, structured content rules, generated project-page navigation/template completeness, project-generator behavior, and generated documentation freshness.

## Agent Guidance

- `AGENTS.md` contains repository-wide rules for autonomous or assisted development.
- `.github/copilot-instructions.md` contains persistent repository guidance for compatible GitHub AI tooling.

The guiding principle for this system is:

> Build it once, understand how it works, and make it reusable.
