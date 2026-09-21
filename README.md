# id-portfolio-system

Public instructional design portfolio plus a local-only management system for maintaining, creating, reviewing, validating, and publishing portfolio work.

## Live Portfolio

https://reeder-design.github.io/id-portfolio-system/

## System at a Glance

```text
PRIVATE / LOCAL
.env
.portfolio-manager/
        │
        ▼
Portfolio Manager
Manage / Reference Library / Create / Hiring Guide / AI
        │
        ▼
PUBLIC-CANDIDATE WORK
portfolio-data/ + portfolio/
        │
        ▼
Preview → Full Validation → Commit
        │
        ▼
Explicit Publish to GitHub
        │
        ▼
main → GitHub Pages → LIVE PORTFOLIO
```

The public website and the local Manager are intentionally separate:

- `portfolio/` is the static website GitHub Pages deploys.
- `portfolio-data/` is structured, Git-tracked source data for public portfolio content.
- `portfolio-manager/` is the local Flask application used to work with the portfolio safely.
- `.portfolio-manager/` is private, Git-ignored local state for proposals, references, Hiring Guide editorial libraries, backups, temporary uploads, and other working data.
- `.env` stores local secrets such as the Manager password hash, Flask secret, and optional AI API key. It is Git-ignored.

The repository itself is public. Anything committed to it should be treated as publicly visible even if GitHub Pages does not render it.

## Portfolio Manager

Portfolio Manager is a private local workbench. It binds only to `127.0.0.1:5055`, requires local authentication, validates CSRF on modifying requests, rejects non-local Host headers, and sends no-cache/no-referrer/framing-protection headers.

Start it from the repository root:

```bash
python portfolio-manager/app.py
```

Then open:

```text
http://127.0.0.1:5055
```

The Manager has three primary work areas:

### Manage Content

Use this for work that already exists in the portfolio. It supports:

- visible page editing
- structured project editing
- project asset management
- private page/project notes
- page-aware AI edit proposals
- deterministic **Approve & Apply Locally** with validation and recovery backup
- proposal history
- Related References project graph and rename/reference integrity review
- Reusable Component Registry
- AI Portfolio Review

Saving or applying locally does **not** publish anything.

### Create Content

Use this for new portfolio work. The guided flow is:

```text
Idea / Approved Sources
        ↓
Content Brief
        ↓
Optional AI Plan Proposal
        ↓
Human Review / Refinement
        ↓
Structured Record Build
        ↓
Validation
        ↓
Keep or Revert
        ↓
Build/review the public page from the current live pattern
        ↓
Save & Publish
```

The **Reference Library** sits inside this workflow for private professional source material. Originals remain unchanged and private. A separate sanitized derivative can move through review and become **Approved for Portfolio Use** before it is attached to a Content Brief.

### Hiring Guide Library

Use this private editorial workspace to maintain the source-of-truth Q&A library behind the public Ask Haley experience.

- import the canonical JSON library and optional Markdown editorial copy
- search/filter canonical answers
- edit answers, categories, confidence, source basis, tags, variants, follow-ups, and implementation notes
- maintain evidence records and demonstrated/emerging/inferred/audited status
- create private backups automatically before edits
- export the updated private JSON/Markdown

The rich Hiring Guide library lives only under `.portfolio-manager/hiring-guide/`. **Preview Public Sync** compiles that private source into a stripped public proposal without exposing confidence/source/editorial-note fields. The proposal preserves unmatched legacy public questions, audits matched/new records, flags non-demonstrated evidence, and includes a routing simulator. **Apply Public Sync Locally + Validate** writes only the local `portfolio/data/hiring-faq.json` and `hiring-faq-expanded.json` files after an exact confirmation, creates a private recovery backup, verifies the proposal is not stale, runs Full Validation, and automatically restores the old files if validation fails. It never commits or publishes.

## AI Assistance

AI is optional and never receives blanket repository access.

There are several distinct AI workflows:

- **Advanced AI Drafting Helper** — proposal-only rewriting, analysis, placement suggestions, and drafting support.
- **Page-aware AI** — creates a private edit proposal for one managed page. The user can explicitly approve a deterministic local application; the AI itself does not write or publish files.
- **AI Portfolio Review** — advisory review of the public portfolio.
- **Reference AI Analysis** — analyzes a selected private reference only after the user approves exactly what may be sent.
- **Create Content AI planning** — proposes a project plan from the Content Brief plus approved source context.

External-AI requests use explicit provider/authorization acknowledgements and local secret preflight. Private originals, unrelated Reference Library resources, private notes, and arbitrary repository files are not silently sent.

See `docs/ai-assistance.md` for the current AI/privacy contract.

## Save & Publish

Routine portfolio-content publishing is intentionally different from developing Portfolio Manager itself.

### Routine portfolio content

The local **Save & Publish** workflow operates on `main`:

```text
local edit
  → review diff
  → select exact files
  → Full Validation
  → commit locally to main
  → explicit Publish to GitHub
  → origin/main
  → GitHub Pages deploy
```

Important boundaries:

- Save is local.
- Apply Locally is local.
- Keep is local.
- Approved for Portfolio Use does not publish a file.
- Commit is a local checkpoint.
- **Publish to GitHub** is the step that can make approved public portfolio changes live.
- Publish rechecks outgoing paths and reruns Full Validation immediately before push.
- `.git`, `.portfolio-manager/`, `.venv/`, private `.env*` files, and common key/certificate formats are blocked.
- Force-push is not implemented.

### Developing Portfolio Manager or repository infrastructure

Code/system changes use the developer workflow:

```text
feature branch → PR → UAT → explicit “merge PR#” approval → main
```

Do not confuse this with routine Save & Publish. The Manager does not merge its own development pull requests.

## Full Validation

Portfolio Manager **Run Full Validation** and pull-request CI exercise the same release-critical system checks, including:

- public-site integrity and GitHub Pages readiness
- structured project/general-page content
- responsive/final public polish
- scaffold previewer and structured project generator
- generated documentation/versioning
- Git publishing safety
- AI privacy and proposal/apply boundaries
- assets, Related References relationship graph/reference integrity, and Component Registry
- Create Content and Reference Library workflows
- private Hiring Guide Library import/edit/evidence/backups
- deterministic Hiring Guide public-sync proposal, routing, stale-state, rollback, and local-apply boundaries
- adversarial security/misuse regression
- workflow state-safety/chaos regression
- end-to-end release smoke tests
- Portfolio Manager security/runtime checks
- system documentation/architecture freshness

Successful Manager validation explicitly confirms the release E2E, security, chaos/state-safety, and documentation/architecture checks.

## GitHub Pages

`.github/workflows/deploy-pages.yml` deploys only `portfolio/`.

A deployment runs after relevant public-site changes reach `main`. The site is validated before upload; a failed validation stops deployment.

The public portfolio remains online when your Mac, VS Code, Portfolio Manager, and local preview server are all closed.

## Local Public Preview

When you want to preview the static site locally:

```bash
cd portfolio
python3 -m http.server 8000
```

If that terminal is already running after a Git pull, you can normally just refresh the browser. Portfolio Manager itself should be restarted after Python/template/static changes.

## Repository Structure

- `portfolio/` — deployed public website
- `portfolio-data/` — structured public-content source data, including the canonical reusable `component-registry.json`
- `portfolio-manager/` — local-only Flask management application
- `templates/` — preview/reference scaffolds for brand-new work; never a page-generation or overwrite source
- `design-system/` — design-system/development resources
- `scripts/` — creation, rendering, maintenance, validation, and regression scripts
- `docs/` — maintenance/reference docs plus generated inventory/map/changelog/version snapshots
- `.github/workflows/` — CI and GitHub Pages deployment
- `.portfolio-manager/` — private local runtime state; never commit
- `.env` — private local secrets; never commit

## Project Creation and Page Preservation

The current public files under `portfolio/` are the presentation source of truth for existing pages. Do not rebuild an existing page from the generic project template or a structured record.

The guided Create Content workflow is the normal user path for **new** work. Lower-level deterministic scripts remain available for new-page development and maintenance testing.

Create a new structured project record:

```bash
python3 scripts/new-project.py
```

Preview the record without writing:

```bash
python3 scripts/new-project.py --dry-run
```

To preview the locked reference scaffold without writing a public file:

```bash
python3 scripts/render-project.py portfolio-data/projects/new-project.json
```

The scaffold preview is a planning/reference artifact only. Automation does not write it into `portfolio/`. Build the actual page intentionally from the closest current live page family. Existing public pages are never regenerated from the scaffold.

Use `docs/current-page-patterns.md` to choose the closest current live reference, `docs/portfolio-uat-guardrails.md` for recurring UAT rules, and `docs/portfolio-consistency-audit.md` for the maintenance audit.

## Documentation and Versioning

Generated documentation is refreshed with:

```bash
python3 scripts/update-docs.py
```

Check freshness without writing:

```bash
python3 scripts/update-docs.py --check
```

Intentional semantic releases use:

```bash
python3 scripts/update-docs.py --bump patch --message "Describe the release"
```

Use `minor` or `major` only when the scope warrants it. Version data lives in `portfolio-data/version.json`; immutable snapshots live under `docs/versions/`.

## Commit Identity Privacy

This repository is public, so Git commit metadata is public too. Configure this repository to use your GitHub-provided noreply address for future local commits if you do not want your personal email attached to new commit history.

From the repository root:

```bash
git config user.name "Reeder-design"
git config user.email "YOUR_GITHUB_NOREPLY_ADDRESS"
```

Verify before committing:

```bash
git config user.name
git config user.email
```

This changes future commit metadata only. It does not rewrite existing history.

## Agent Guidance

`AGENTS.md` contains repository-wide rules for assisted development. The in-app User Guide is the canonical human workflow reference for Portfolio Manager buttons, privacy boundaries, state handling, and publishing decisions.

The guiding principle is:

> Build it once, understand how it works, and make it reusable.
