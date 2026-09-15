# Portfolio Maintenance Guide

## Two Different Workflows

The repository has two intentionally different Git workflows. Do not mix them up.

### Routine portfolio content publishing

Use Portfolio Manager **Save & Publish** for approved portfolio-content changes that are already being maintained locally on `main`.

```text
edit locally
  → review changed files/diff
  → stage exact approved files
  → Full Validation
  → commit locally to main
  → explicit Publish to GitHub
  → origin/main
  → GitHub Pages deploys public portfolio changes
```

Key boundaries:

- Save, Apply Locally, Keep, and Approved for Portfolio Use are not publishing actions.
- Commit creates a local checkpoint only.
- Publish to GitHub is the action that can make approved portfolio changes live.
- Publish refreshes `origin/main`, blocks stale/behind state, scans outgoing paths, and reruns Full Validation before push.
- Private/unsafe paths are blocked.
- Force-push is not implemented.

### Developing Portfolio Manager or repository infrastructure

Use a feature branch and pull request for code/system work such as Manager features, validation changes, architecture changes, shared templates, interactions, or broad styling work.

```text
main → feature branch → implementation → CI → UAT → explicit “merge PR#” approval → merge
```

Agents should never merge a development PR without explicit user approval.

## Full Validation

Portfolio Manager **Run Full Validation** and pull-request CI are intentionally kept aligned.

The suite covers:

- public-site links, assets, metadata, mobile/readiness rules, and GitHub Pages assumptions
- structured project and general-page content
- renderer and new-project generator
- generated documentation/versioning
- Git publishing guardrails
- AI privacy/proposal/apply boundaries
- asset management and Related References
- Create Content and Reference Library workflows
- adversarial security/misuse regression
- workflow state-safety/chaos regression
- authenticated end-to-end release smoke testing
- Portfolio Manager security/runtime
- system documentation/architecture freshness

A failed validation blocks controlled commits/publishing and should be treated as a release blocker until understood.

## Publishing

`.github/workflows/deploy-pages.yml` deploys only the contents of `portfolio/`.

GitHub Pages validates the public site before uploading it. A validation failure stops deployment rather than publishing a known-broken version.

The public site remains hosted by GitHub Pages even when the local Mac, VS Code, Portfolio Manager, and local preview server are closed.

## Local Services

Portfolio Manager:

```bash
python portfolio-manager/app.py
```

Public-site preview when needed:

```bash
cd portfolio
python3 -m http.server 8000
```

If the static preview server is already running after a Git pull, refreshing the browser is normally enough. Restart Portfolio Manager after Python, Jinja template, or Manager static-file changes.

## Private vs. Public Storage

Treat these as different trust zones:

- `.env` — private local secrets; Git-ignored
- `.portfolio-manager/` — private local working state; Git-ignored
- `portfolio-data/` — tracked public-candidate structured content
- `portfolio/` — deployed public website

The repository is public, so anything committed outside `portfolio/` is still visible through GitHub even if Pages does not render it.

## Commit Identity Privacy

Git author email is part of public commit metadata in a public repository. If the user wants future commits to avoid a personal email, configure this repository to use their GitHub-provided noreply address:

```bash
git config user.name "Reeder-design"
git config user.email "YOUR_GITHUB_NOREPLY_ADDRESS"
```

Verify with:

```bash
git config user.name
git config user.email
```

This affects future local commits only; it does not rewrite existing history.

## Documentation Maintenance

`README.md`, `AGENTS.md`, `docs/maintenance-guide.md`, and `docs/ai-assistance.md` describe live architecture and must be updated when the workflow/privacy model changes.

Generated documentation is maintained by `scripts/update-docs.py` and should be checked with:

```bash
python scripts/update-docs.py --check
```

## Agent Workflow

Agents should read `AGENTS.md` before substantial repository work.

For code/system development, the preferred pattern is:

```text
request → feature branch → focused edits → full CI → UAT → explicit merge approval → merge → deployment when applicable
```

For routine portfolio content, use the in-app Manage/Create/Reference/Save & Publish workflow instead of creating unnecessary development PRs.
