# New Project Generator

`scripts/new-project.py` is the lower-level guided generator for standard portfolio case-study pages.

Portfolio Manager **Create Content** is the normal human-facing workflow for new portfolio work. The script remains useful for deterministic development, maintenance, testing, and direct structured-page generation.

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

Category labels and output locations come from `portfolio-data/taxonomy.json`. Do not hard-code an alternate category list in documentation or helper code.

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

## Generated Visual Contract

A newly generated standard project should already use the approved public system without manual restyling.

The generated page includes:

- the current case-study hero family
- breadcrumb directly above the H1
- dark snapshot bridge with light metadata items
- flush-top dark sticky project navigation
- explicit `final-stretch-system.css` loading
- current shared Related Work and Keep Exploring components
- portfolio-safe callout treatment for sanitized work
- Hiring Guide in the main navigation
- GitHub, LinkedIn, Résumé, and Expertise in the shared footer

`portfolio-motion.js` may still normalize older hand-built pages for compatibility. New generated pages should not depend on that runtime repair for their basic architecture.

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

Private/reference originals belong in the local-only Portfolio Manager **Reference Library** / `.portfolio-manager/` workflow. Approved sanitized derivatives can later be attached to Create Content or managed project work without exposing the original source file.

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

Review the generated JSON and HTML before treating the output as complete.

For substantial code, shared-layout, renderer, validation, or repository-infrastructure changes, use the normal development workflow:

```text
feature branch → PR → CI → UAT → explicit merge approval
```

For routine approved portfolio-content maintenance, use Portfolio Manager Save & Publish on local `main` as documented in `AGENTS.md` and `docs/maintenance-guide.md`. Do not create a development PR solely because a content record was generated if no infrastructure change is involved.

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

For substantial work, use the repository's complete validation suite rather than stopping after these generator-specific checks.
