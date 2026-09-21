# Repository Instructions

This repository powers Haley Reeder's public instructional design portfolio and reusable development system.

Read `AGENTS.md` for the full repository operating rules. This file is the concise coding-assistant summary and should stay aligned with it.

## Public Site
The deployed website lives in `portfolio/` and is published through GitHub Pages.

Do not move the public site outside `portfolio/` unless explicitly requested.

The repository itself is public. Never commit confidential employer/customer material, credentials, private references, or proprietary source content.

## Source of Truth
Do not infer architecture from old filenames, Git history, comments, or PR descriptions.

Use this order:
1. Existing HTML/CSS/JS under `portfolio/` for the presentation and interaction behavior of an existing page.
2. Shared current portfolio styles/JavaScript loaded by that page.
3. `portfolio-data/taxonomy.json` for canonical public category labels and paths.
4. Structured records under `portfolio-data/` for fields they explicitly own.
5. `templates/` plus deterministic renderers only for creating a new page whose target path does not already exist.
6. Portfolio Manager code for Manager behavior. The private Hiring Guide editorial source lives at runtime under Git-ignored `.portfolio-manager/hiring-guide/`.
7. Documentation describes the current implementation and must not override the current public page.

Before adding a new shared stylesheet, script, helper, controller, renderer, or template variation, inspect the existing implementation and extend the current owner when practical. Never regenerate or replace an existing public page from the generic template or a stale structured copy.

## Current Public Taxonomy
Top-level portfolio areas:
- Instructional Design
- AI Training and Evaluation
- LMS Administration
- Workflows

Instructional Design currently includes:
- Interactive Learning
- Microlearning & Performance Support
- Multimedia Training Content
- Live Training
- Complete eLearning Pathways

Do not use retired category labels from older portfolio iterations. Read the current labels and paths from `portfolio-data/taxonomy.json`.

## Design System
Use the existing design language and shared CSS variables before introducing page-specific patterns.

Primary palette:
- Taupe `#4A4238`
- Charcoal `#4D5359`
- Pine Blue `#508484`
- Mint Leaf `#79C99E`
- Yellow Green `#97DB4F`

Typography:
- Headings: Montserrat
- Body/UI: Open Sans

Prefer one clear implementation over layered competing fixes. For sitewide behavior, inspect and test multiple page families rather than validating only one page. Use `docs/portfolio-uat-guardrails.md` for the recurring UAT checks.

## Coding Rules
- Use semantic HTML.
- Keep internal links relative and GitHub Pages compatible.
- Preserve responsive behavior and keyboard accessibility.
- Do not output escaped HTML with backslashes before tags.
- Do not place Markdown-formatted URLs inside HTML attributes.
- Use `target="_blank"` with `rel="noopener noreferrer"` for external links that open in a new tab.
- Keep JavaScript readable, data-driven, and single-owner where practical.
- Prefer existing reusable patterns over one-off duplication.
- Do not resurrect retired experiments or temporary workarounds without verifying they are still part of the live architecture.

## Content Rules
Never expose confidential employer, customer, partner, or unreleased product information.
The rich Hiring Guide Library is private editorial state. Do not commit its confidence/source/implementation-note layer into public Git history. The public Ask Haley data is a separate public-safe representation produced only through the controlled Hiring Guide public-sync compiler: private proposal first, editorial stripping, human diff/routing review, exact local-apply confirmation, stale-source check, backup, Full Validation, and rollback on failure. Public sync must never commit or publish.
Use fictionalized, sanitized, or generalized examples when needed.
Do not invent professional claims, metrics, clients, tools, credentials, responsibilities, or results.

## Git Workflow
Routine approved content publishing may use Portfolio Manager Save & Publish on local `main` as documented in `AGENTS.md` and `docs/maintenance-guide.md`.

Substantial code, shared styling, validation, architecture, or Portfolio Manager changes use:

```text
feature branch → PR → CI → UAT → explicit user approval → merge
```

Never merge a development PR without explicit user approval.

### Concurrent branches
Assume other chats/agents may be working in parallel. Before editing, inspect current `main`, the active PR's ahead/behind state, and all other open PRs for changed-file overlap. If the active branch is behind `main`, sync it before continuing.

Before a merge, require: 0 commits behind current `main`, mergeable status, green CI on the exact current head SHA, and a fresh overlap review against every other open PR. After any merge to `main`, immediately re-check all remaining open PRs and sync/revalidate any that became stale. Never rely on remembered Git state from an earlier chat.


## Before Completing Changes
- Run the full validation suite for substantial work; do not rely on one convenient check.
- Check navigation, relative links, responsive behavior, and privacy boundaries.
- Update manual documentation when ownership, workflow, or architecture changes.
- Refresh generated docs through `scripts/update-docs.py` rather than editing generated outputs by hand.
