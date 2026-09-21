# Current Portfolio Page Patterns

## Purpose

This is the starting-reference map for future portfolio development.

It does **not** define templates that can regenerate existing pages. The current public files under `portfolio/` remain the presentation source of truth. Use these pages to understand the current design language, interaction density, spacing, motion, and project-story patterns before building anything new.

When a future page does not fit one family cleanly, combine patterns deliberately rather than forcing the work into a generic layout.

## How to use this map

For a new page:

1. choose the closest current page family
2. inspect that page's HTML, page-specific CSS, and JavaScript
3. reuse only the structural/interaction patterns that fit the new work
4. preserve current shared navigation, theme, typography, and responsive behavior
5. add custom interactions only when they strengthen the portfolio evidence
6. run the recurring UAT checks in `docs/portfolio-uat-guardrails.md`

Do not copy an old branch, recovery page, historical template, or prior PR as the starting point when a current live page exists.

## Landing and category pages

Good references:

- `portfolio/projects/instructional-design/index.html`
- `portfolio/projects/ai-training-and-evaluation/index.html`
- `portfolio/projects/lms-administration/index.html`
- `portfolio/projects/workflows/index.html`

Use these for:
- category introductions
- capability/project-area navigation
- featured examples
- intentional cross-area discovery
- hero motion/illustration that explains the area rather than decorating it

Current expectations:
- breadcrumb hierarchy remains readable and compact
- hero title/copy has enough width to avoid unnecessary wrapping
- icons are large and visually clean
- light/dark section rhythm is intentional
- cards do not create excessive vertical padding
- **Other Work** is a deliberate landing-page choice, not an automatic footer

## Flagship project case studies

Strong references:

- `portfolio/projects/instructional-design/complete-learning-paths/enterprise-sales-certification/index.html`
- `portfolio/projects/instructional-design/live-training/virtual-sales-workshop-facilitation/index.html`
- `portfolio/projects/lms-administration/learning-platform-operations-migration-readiness/index.html`

Use these for:
- substantial completed projects
- clear first-person ownership
- project snapshot bands
- compact sticky section navigation
- evidence-rich sections
- custom interactions that demonstrate the work itself

Common current structure:
- breadcrumb + project-specific hero
- project snapshot
- compact section navigation
- project story organized around decisions/work/evidence rather than a generic essay
- interaction or evidence blocks designed specifically for the project
- concise project ending rather than a generic recommendation footer

Do not assume every flagship page needs the same number of sections or interactions.

## Interactive learning demos

Strong references:

- `portfolio/projects/instructional-design/interactive-learning/meddpicc-practice/index.html`
- `portfolio/projects/instructional-design/interactive-learning/pursuit-positioning/index.html`

Use these for:
- decision practice
- choose-your-path demonstrations
- simulated learner tasks
- feedback/coaching states
- visible scoring, qualification, or decision logic

Current expectations:
- the interaction is the evidence
- controls are readable in every state
- changing state does not make the section jump unnecessarily
- matrices/axes keep labels outside the data area
- icons use clean backgrounds when needed
- text areas are wide enough to stay readable
- the visitor can understand what to do without instructions becoming the largest part of the page

## Microlearning spotlights

Strong references:

- `portfolio/projects/instructional-design/microlearning-performance-support/product-launch-microlearning/index.html`
- `portfolio/projects/instructional-design/microlearning-performance-support/vertical-positioning-microlearning/index.html`

Use these for:
- compact learning experiences
- product/change orientation
- positioning content
- small scenario or knowledge-check examples

Current expectations:
- explain the instructional strategy, not simply the authoring tool
- constrain screenshots so they support rather than dominate the page
- use tabs only when they materially improve comparison
- keep project endings compact
- avoid stale generic **Keep Exploring** / **Related Work** sections

## Systems, integrations, automation, and reporting

Strong references:

- `portfolio/projects/lms-administration/system-integrations/index.html`
- `portfolio/projects/workflows/ai-automation/salesforce-lms-account-automation/index.html`
- `portfolio/projects/workflows/data-reporting/certification-reporting-automation/index.html`

Use these for:
- system/data flows
- automation case studies
- integration architecture
- reporting workflows
- operational L&D examples

Current expectations:
- make the system/workflow nature obvious in the hero and project framing
- motion graphics communicate sequence, ownership, or data movement
- lines/dots remain behind icons and labels
- use larger readable nodes instead of tiny process text
- differentiate automation from human-review checkpoints
- keep system labels and tool icons visually clean

## AI training and evaluation

Strong references:

- `portfolio/projects/ai-training-and-evaluation/index.html`
- `portfolio/projects/ai-training-and-evaluation/ai-training-and-evaluation-demo/index.html`
- `portfolio/projects/ai-training-and-evaluation/rubric-demo/index.html`
- `portfolio/projects/ai-training-and-evaluation/workflow-demo/index.html`

Use these for:
- AI evaluation examples
- quality/rubric demonstrations
- workflow/calibration examples
- evidence of analytical review

Current expectations:
- each quality signal or workflow concept gets a relevant visual rather than a repeated generic decoration
- demo pages stay visually connected to the parent AI area
- old demo versions are not restored from stale templates/recovery branches
- parent/back navigation stays compact and clear

## Multimedia and production

Strong reference:

- `portfolio/projects/instructional-design/multimedia/index.html`

Use this for:
- video/audio/motion-production examples
- workflow demonstrations
- learning-integration examples

Current expectations:
- motion demonstrates what the production step accomplishes
- separate tabs/states have distinct relevant visuals
- avoid large empty production-toolkit blocks that duplicate About/toolbox content
- keep padding compact enough that multiple examples can be compared comfortably

## About and hiring-facing pages

Strong references:

- `portfolio/about/index.html`
- `portfolio/hiring-manager/index.html`

Use these for:
- professional story
- role progression
- toolbox/skills
- hiring-manager evidence and Q&A

Current expectations:
- professional voice stays personal and evidence-grounded
- role-change/tab text remains readable
- repeated content is consolidated rather than duplicated across pages
- interaction controls remain mobile-friendly

## Default reference scaffold

`templates/project-page/index.html` is intentionally much simpler than the live pages above.

It provides only:
- current navigation/frame files
- breadcrumbs
- a wide project hero
- a light icon bubble
- project snapshot
- compact section navigation
- static overview/design/build/outcome sections
- optional structured detail/evidence sections
- one compact parent back path

It intentionally does **not** include:
- default tabs
- generic motion graphics
- Keep Exploring
- automatically rendered Related Work
- automatic Other Work
- page-generation/overwrite behavior

Preview it with:

```bash
python scripts/render-project.py portfolio-data/projects/example.json
```

The command prints reference HTML only. It never writes into `portfolio/`.

## Selection rule

When deciding between the reference scaffold and a current live family, prefer the current live family.

The scaffold is useful for content architecture. The live portfolio is the visual and interaction standard.


## General page copy ownership

General-page copy edits are source-first. The current public page is edited through the active page-copy workflow or directly in source, then structured values are synchronized from that HTML. The retired structured-to-HTML editor and renderer are not valid future-build references.
