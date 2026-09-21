# Reference Scaffold and Existing Page Preservation

The portfolio no longer treats the standard project template as an authority over finished public pages.

The current public files under `portfolio/` are the presentation source of truth for existing work. The scaffold in `templates/project-page/` is a **preview/reference only** for brand-new work. Repository automation does not write it into `portfolio/`.

## Source of Truth

Use this order for current work:

1. Existing public HTML/CSS/JavaScript under `portfolio/` for the presentation and interaction behavior of an existing page.
2. Shared current portfolio styles and JavaScript loaded by that page.
3. `portfolio-data/taxonomy.json` for canonical labels, IDs, and paths.
4. Structured project records for the metadata/content fields they explicitly own.
5. `portfolio-data/component-registry.json` for reusable-pattern documentation.
6. The reference scaffold and preview renderer only for planning a brand-new page; they never write public HTML.
7. Documentation describes the current system; it must never override the live public implementation.

When these disagree, do not rebuild the public page from an older source. Inspect the current page and reconcile metadata/documentation around it.

## Preservation Contract

Existing public pages must never be regenerated from the standard scaffold.

The old overwrite path is retired:

- Portfolio Manager does not offer **Regenerate Page** for structured projects.
- `scripts/render-project.py` is preview-only and has no output-file or force-overwrite mode.
- `scripts/new-project.py` creates structured records only.
- A structured record is not permission to replace a bespoke or UAT-refined public page.
- Old PRs, old screenshots, Git history, generated docs, and template markup are not valid reasons to revive a superseded page version.

This protects the accumulated UAT work in the current portfolio.

## What the Scaffold Is For

The scaffold supports a new standard case-study page when:

- the page path does not already exist
- a bespoke interaction is not the main portfolio evidence
- a simple case-study structure is appropriate
- the new page will be reviewed against the current portfolio before publication

The flow is:

```text
new structured project record
        ↓
optional reference-scaffold preview
        ↓
inspect closest current live page family
        ↓
build new public page intentionally
        ↓
human review / UAT
        ↓
page becomes a maintained public experience
```

The scaffold is reference material, not a page generator.

## Current Scaffold Rules

Future scaffold output follows the recurring UAT rules captured in `docs/portfolio-uat-guardrails.md`.

Important defaults:

- source breadcrumb markup in the hero
- current shared theme/frame files
- compact project snapshot
- no default tab interaction; interactions are added intentionally from a current live pattern
- interaction copy allowed to use the available width
- no generic Keep Exploring footer
- no public Related Work footer generated from metadata
- compact parent-page back path at the end
- responsive/reduced-motion behavior

The scaffold should remain intentionally conservative. It does not attempt to reproduce every bespoke current page.

## Related Work and Related References

Structured `related_work` remains useful for the internal relationship graph and Portfolio Manager **Related References** workflow.

It is metadata, not a public-layout instruction.

Do not inject a Related Work section into an existing page because a relationship exists in JSON. Future scaffold output also does not automatically render a public Related Work block.

## Reusable Component Registry

`portfolio-data/component-registry.json` is the canonical Reusable Component Registry.

It documents:

- established component IDs
- intended use
- implementation owners
- support status
- when a pattern should or should not be reused

Recording a component reference does not grant the Manager or renderer authority to rewrite bespoke page markup.

## Breadcrumbs

Breadcrumbs are a shared navigation pattern, but current page markup remains authoritative.

For a new page:

- include breadcrumb markup in the hero copy
- link Home and real parent pages
- keep the current page non-clickable
- use the nearest current page-family hierarchy
- test contrast on the actual hero surface

The existing shared runtime contains compatibility normalization for older/custom pages. New pages should not rely on that compatibility layer to invent basic structure.

## Interaction Standards

The default scaffold is intentionally non-interactive. Tabs, scenarios, motion graphics, and other richer behaviors must be added deliberately from a current live pattern and tested as bespoke work.

For interactions added to a new page:

- keep state changes from resizing the whole section
- let titles and explanatory text use the interaction width
- check active/inactive text contrast
- isolate pixel icons and use clean bubbles where needed
- keep motion tracks/dots behind readable icons and labels

See `docs/portfolio-uat-guardrails.md`.

## Previewing the Reference Scaffold

Preview a proposed scaffold:

```bash
python scripts/render-project.py portfolio-data/projects/new-project.json
```

The command prints HTML for review and never writes a public file. There is no output-file switch and no force-overwrite workflow. Build the real page deliberately from the closest current live page family.

## Bespoke Projects

A bespoke public page remains appropriate when the interaction itself is portfolio evidence.

Do not copy an old generic template over a bespoke page to make maintenance appear simpler. Reuse current shared assets/components where practical, but preserve the interaction that was actually reviewed.

## Portfolio Manager Relationship

Portfolio Manager **Create Content** creates the structured project record only. It does not render the scaffold or create public HTML.

Portfolio Manager **Manage Content** may continue to manage structured fields, assets, references, and project metadata, but it does not regenerate the finished public page from the template.

The public page and structured record can coexist without pretending they are interchangeable.

## Validation

The relevant checks are:

```bash
python scripts/check-content.py
python scripts/check-renderer.py
python scripts/check-new-project.py
python scripts/check-final-polish.py
python scripts/check-site.py
```

The scaffold preview and structured-record checks validate future-build inputs. They are not a license to rewrite current public pages.

Pull-request CI remains the authoritative automated gate for infrastructure changes.

## Supporting References

- `docs/current-page-patterns.md` — current live page families to use as future-build references
- `docs/portfolio-uat-guardrails.md` — recurring visual/UAT rules
- `docs/portfolio-consistency-audit.md` — current code/history audit
- `docs/maintenance-guide.md` — repository maintenance workflow
- `AGENTS.md` — repository-wide assisted-development rules
