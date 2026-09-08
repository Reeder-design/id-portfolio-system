# New Project Generator

`scripts/new-project.py` is the guided creation workflow for standard portfolio case-study pages.

It sits on top of the structured content model and project renderer:

```text
Guided prompts
    ↓
portfolio-data/projects/<slug>.json
    ↓
templates/project-page/index.html
    ↓
portfolio/projects/.../<slug>/index.html
```

## Run It

From the repository root:

```bash
python scripts/new-project.py
```

On systems where `python` is not mapped to Python 3, use:

```bash
python3 scripts/new-project.py
```

## What It Collects

The guided flow asks for:

- project title
- URL slug (automatically suggested from the title)
- portfolio category
- optional subcategory
- project status
- confidentiality state
- summary
- business / learning need
- audience
- role
- learning objectives
- design approach
- development process
- outcomes
- skills
- tools
- featured-project status
- optional live-project link
- optional public-safe source/sanitization notes
- optional public asset references

New projects default to `building` rather than `live`.

## What It Creates

For a standard public-safe project, the generator creates both:

1. a structured record under `portfolio-data/projects/`
2. a rendered case-study page under the correct `portfolio/projects/` location

The output path is calculated from the taxonomy, category, subcategory, and slug. You do not manually count relative folders or build navigation paths.

Example:

```text
Project title: Sales Discovery Lab
Category: Instructional Design
Subcategory: Interactive Learning
Slug: sales-discovery-lab
```

creates:

```text
portfolio-data/projects/sales-discovery-lab.json
portfolio/projects/instructional-design/interactive-learning/sales-discovery-lab/index.html
```

## Safety Behavior

The generator refuses to continue if:

- the project ID already exists
- the structured JSON filename already exists
- the calculated page path already exists
- another record already uses the same page path
- a project is both `live` and `needs-sanitization`

After files are created, the generator runs structured-content validation and site validation. If the new project causes validation to fail, the newly created files are rolled back.

### Projects Needing Sanitization

If confidentiality is set to `needs-sanitization`, the structured record can be created, but the public HTML page is not generated.

This creates a safe holding state for work that needs to be generalized, fictionalized, or reviewed before publication.

## Source Files vs Public Assets

Do not place proprietary, confidential, customer, employer, or private reference material in this public repository merely because it was used to create a portfolio project.

The generator only records assets that are explicitly intended to be public.

Private/reference uploads will be handled separately by the future Portfolio Manager dashboard and should not automatically become committed portfolio assets.

## Useful Options

Preview everything without writing files:

```bash
python scripts/new-project.py --dry-run
```

Create only the structured JSON record:

```bash
python scripts/new-project.py --no-render
```

Skip the final confirmation prompt:

```bash
python scripts/new-project.py --yes
```

The prompts themselves still run; `--yes` only skips the final confirmation.

## After Creating a Project

Review the generated JSON and HTML in VS Code.

For substantial work, create or remain on a content/feature branch, then commit and push that branch for pull-request review. The generator intentionally does not merge or publish directly to `main`.

## Validation

Generator-specific checks run with:

```bash
python scripts/check-new-project.py
```

The normal validation suite also includes:

```bash
python scripts/check-content.py
python scripts/check-renderer.py
python scripts/check-site.py
```
