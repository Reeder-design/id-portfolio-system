# id-portfolio-system

Public instructional design portfolio and reusable development system for Haley Reeder.

## Live Portfolio

https://reeder-design.github.io/id-portfolio-system/

## Repository Structure

- `portfolio/` — public GitHub Pages website
- `portfolio/css/styles.css` — shared site styles and design system
- `portfolio/projects/` — portfolio project pages and demos
- `portfolio-data/` — structured project content, general-page content, taxonomy, schemas, and portfolio version source data
- `portfolio-manager/` — local-only Flask dashboard for portfolio maintenance, AI proposals, and guarded Git workflow
- `templates/` — reusable HTML templates for generated portfolio pages
- `design-system/` — reusable design-system resources
- `scripts/` — project creation, rendering, documentation, maintenance, and validation scripts
- `docs/` — maintenance docs, generated inventory/map/changelog, version snapshots, and AI-assistance documentation
- `.github/workflows/` — automated validation and deployment

Local-only Portfolio Manager credentials and runtime data are intentionally excluded from Git:

- `.env` — local Flask secret, password hash, and optional AI API key/model setting
- `.portfolio-manager/` — private requests, uploads, temporary files, backups, and AI proposal history

## Portfolio Manager

Portfolio Manager runs against the same local repository used by VS Code. It is intentionally bound to `127.0.0.1`, requires a local password, and protects modifying forms with CSRF.

Content-editing and asset actions change local files only. AI Assistance creates private reviewable proposals only. The dedicated Git Workflow can intentionally stage approved files, validate and commit on a feature branch, push that feature branch, and help open a pull request. It cannot commit or push `main`, force-push, stage blocked private paths, or merge a pull request.

From the repository root, activate the project virtual environment and install the dashboard dependency:

```bash
source .venv/bin/activate
python -m pip install -r portfolio-manager/requirements.txt
```

Configure local-only credentials once:

```bash
python portfolio-manager/setup.py
```

The setup script asks for a password locally, stores only its hash plus a generated Flask secret in the Git-ignored `.env` file, and creates the Git-ignored `.portfolio-manager/` private workspace.

Start the dashboard:

```bash
python portfolio-manager/app.py
```

Then open:

```text
http://127.0.0.1:5055
```

Port `5055` is used by default to avoid a common macOS conflict with AirPlay Receiver on port `5000`.

The in-app User Guide is available at `/help`, and contextual `?` controls explain individual actions.

### General Page Content

Portfolio Manager includes a safe editor for routine copy on Home, About, Projects, the three main project-category pages, and Contact.

The structured source of truth is:

```text
portfolio-data/site-content.json
```

Each editable field maps to one explicit approved locator in `scripts/site_content_model.py`. The manager exposes only predefined plain-text headings and paragraphs; navigation, links, buttons, tags, CSS, JavaScript, layout, and custom interactions remain developer-controlled.

When general-page copy is saved:

1. the structured value is updated in `portfolio-data/site-content.json`
2. `scripts/render-site-content.py` updates only the approved public HTML text location
3. managed copy is HTML-escaped before rendering
4. `scripts/check-site-content.py` verifies structured/public copy synchronization
5. `scripts/check-site.py` verifies the public site
6. both the JSON and edited HTML are restored automatically if rendering or validation fails

Every save requires an explicit public-safe confirmation. If a page redesign makes a locator missing or ambiguous, the renderer fails closed instead of guessing where content belongs.

### Public Asset Library

Portfolio Manager includes a project-based Asset Library for files intentionally approved for the public portfolio. Managed files are stored under `portfolio/assets/project-assets/<project-id>/` and associated with the project's structured `assets` array.

The Asset Library can:

- add approved image, video, PDF, and Office-document assets
- require alt text for images
- store captions and asset metadata in project JSON
- preview managed assets through authenticated local routes
- replace an asset in place while preserving its public path
- remove an asset with validation rollback if another public page still depends on it

Every upload or replacement requires an explicit public-safe confirmation. General web-code/executable formats such as HTML, JavaScript, CSS, SVG, shell scripts, executables, and archives are intentionally blocked from this uploader.

Private/reference source files belong in the Git-ignored `.portfolio-manager/` request workspace instead. A file under `portfolio/` may become publicly reachable after a future merge even when no page visibly links to it.

### AI Assistance

The authenticated `/ai/` workspace adds an optional proposal-only AI layer for:

- rewrite and polish
- portfolio sanitization drafts
- source-content analysis
- category/subcategory/tag suggestions
- project-summary drafting

AI remains separated from deterministic editing. It does not directly write `portfolio/`, `portfolio-data/`, generated docs, or Git state.

Before sending a request:

- only source/context deliberately entered in the AI workspace is used
- the repo's public portfolio taxonomy is included as context for placement suggestions
- private requests, uploads, project pages, and arbitrary repository files are not automatically sent
- local preflight blocks several obvious secret/credential formats
- the user must confirm external-provider awareness and authorization to send the text

AI proposals are stored only under:

```text
.portfolio-manager/ai-proposals/
```

The review page separates generated copy, analysis, placement/tags, source-supported claims, missing/unsupported claims, and warnings. There is intentionally no Apply-to-site route. Approved wording is copied into General Page Content or Project Content and saved through those existing deterministic editors.

AI is optional. Configure it locally with:

```bash
python portfolio-manager/configure-ai.py
```

The helper adds the API key/model only to the Git-ignored `.env` and preserves existing Portfolio Manager login settings. Restart Flask afterward.

Disable AI locally with:

```bash
python portfolio-manager/configure-ai.py --disable
```

The default model is currently `gpt-5.6-terra`. The implementation uses the OpenAI Responses API over the fixed HTTPS endpoint with Python's standard-library HTTP client, avoiding a new SDK dependency and preserving compatibility with the existing local Python environment.

See `docs/ai-assistance.md` for the full provider, privacy, source-fidelity, and validation design.

### Guarded Git Workflow

The authenticated `/git/` interface provides a review-driven Git workflow without exposing arbitrary terminal commands.

It can:

- show the current branch, upstream, ahead/behind state, and changed files
- display staged and unstaged line-level diffs
- safely sync clean `main` using `git pull --ff-only`
- create and switch to a new `feature/`, `fix/`, `content/`, or `chore/` branch
- stage exact files selected from Git's current changed-file list
- unstage files without deleting their local edits
- run the full portfolio validation suite before every commit
- create a local commit only on a non-`main` branch
- push a clean feature branch using a normal upstream push
- create a pull request through authenticated GitHub CLI when available
- otherwise open GitHub's pre-filled compare/PR page without storing an API token

Safety boundaries are enforced in code:

- commits on `main` are blocked
- pushes to `main` are blocked
- force-push is not implemented
- Git merge is not implemented
- pull-request merge is not implemented
- arbitrary shell execution is not used for user-controlled values
- `.git`, `.env`, `.portfolio-manager/`, `.venv/`, and common key/certificate file types are blocked from staging through the dashboard
- pushes are blocked while uncommitted local changes remain

The intended flow is:

```text
local edit → review diff → stage exact files → full validation + commit → push feature branch → PR → explicit human review/merge → GitHub Pages
```

## Publishing Workflow

The `main` branch is the approved source for the live portfolio.

When portfolio changes are merged into `main`:

1. GitHub Actions checks out the repository.
2. Portfolio HTML, structured project/general-page content, generated documentation, project creation rules, template rendering, Git workflow guardrails, AI-assistance guardrails, and Portfolio Manager safety rules are validated.
3. If validation passes, the contents of `portfolio/` are uploaded.
4. GitHub Pages deploys the latest approved version.

For substantial changes, work on a separate branch and open a pull request before merging into `main`.

Portfolio Manager may help perform the feature-branch Git steps, but the approval boundary remains:

```text
local change → commit → push branch → pull request → explicit review → merge → GitHub Pages
```

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

The Portfolio Manager **Run Full Validation** button runs the same core suite used by the pull-request workflow.

From the terminal, run:

```bash
python3 scripts/check-site.py
python3 scripts/check-content.py
python3 scripts/check-site-content.py
python3 scripts/check-renderer.py
python3 scripts/check-new-project.py
python3 scripts/check-docs.py
python3 scripts/update-docs.py --check
python3 scripts/check-git-workflow.py
python3 scripts/check-ai-assistance.py
python3 scripts/check-portfolio-manager.py
python3 scripts/check-portfolio-manager-runtime.py
```

These checks cover public site links/assets, structured project rules, structured general-page copy synchronization, generated project-page navigation/template completeness, project-generator behavior, versioning/documentation freshness, Git workflow safety boundaries, AI-assistance safety boundaries, Portfolio Manager security requirements, and authenticated dashboard/Asset Library/general-page/Git-workflow/AI-workspace rendering.

## Agent Guidance

- `AGENTS.md` contains repository-wide rules for autonomous or assisted development.
- `.github/copilot-instructions.md` contains persistent repository guidance for compatible GitHub AI tooling.

The guiding principle for this system is:

> Build it once, understand how it works, and make it reusable.