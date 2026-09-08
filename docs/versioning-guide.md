# Portfolio Documentation and Versioning

This repository keeps current portfolio documentation generated from structured data and records intentional portfolio releases using semantic versioning.

## Source of Truth

`portfolio-data/version.json` stores:

- the current portfolio version
- release dates
- bump type
- release summaries

Do not maintain the changelog separately by hand.

## Generated Documentation

Run:

```bash
python3 scripts/update-docs.py
```

This regenerates:

- `docs/content-inventory.md`
- `docs/portfolio-map.md`
- `docs/changelog.md`

These files contain an auto-generated notice and should not be edited manually.

The content inventory summarizes structured projects, statuses, featured projects, confidentiality state, and canonical page paths.

The portfolio map shows core pages, taxonomy areas, structured projects, and public HTML pages that are not yet represented by structured project records.

The changelog is generated from `portfolio-data/version.json`.

## Check Documentation Without Changing It

Run:

```bash
python3 scripts/update-docs.py --check
```

The command exits with an error if the generated files do not match the current portfolio data. GitHub Actions runs this check on pull requests.

## Version Numbers

The portfolio uses semantic versioning:

`major.minor.patch`

Example:

`1.4.2`

Use the levels this way:

### Patch

Use a patch bump for:

- copy edits
- typo corrections
- small visual fixes
- link/path corrections
- minor maintenance changes

Example:

`1.4.1` → `1.4.2`

### Minor

Use a minor bump for:

- a new portfolio project
- a new interaction or demo
- a new portfolio capability
- a meaningful new content section
- a substantial workflow improvement visible in the portfolio system

Example:

`1.4.2` → `1.5.0`

### Major

Use a major bump for:

- a major portfolio redesign
- a significant information-architecture change
- a major platform or content-model migration
- a substantial change to how the portfolio is organized or maintained

Example:

`1.9.0` → `2.0.0`

## Create a Release

Use an explicit version bump and release summary:

```bash
python3 scripts/update-docs.py --bump minor --message "Add Sales Discovery Simulation"
```

This will:

1. increment the version in `portfolio-data/version.json`
2. add the release to the release history
3. regenerate the content inventory
4. regenerate the portfolio map
5. regenerate the changelog
6. create a version snapshot such as `docs/versions/v1.1.0.md`

A custom release date can be supplied when needed:

```bash
python3 scripts/update-docs.py --bump patch --message "Refine About page copy" --date 2026-09-08
```

## Preview a Version Change

Use:

```bash
python3 scripts/update-docs.py --bump minor --message "Add new project" --dry-run
```

This reports the next version and files that would change without writing them.

## When Not to Bump

Do not bump the portfolio version for:

- experiments
- abandoned drafts
- temporary debugging
- validation-only changes
- work that has not been approved for the portfolio

You can still run `python3 scripts/update-docs.py` to keep the working inventory and map current without creating a new release.

## Version Snapshots

Each intentional release creates a file under:

`docs/versions/`

Snapshots record the project inventory and status counts at the time the version is created. Older snapshots should be treated as historical records and should not be regenerated to match current content.

## Dashboard Integration

The future Portfolio Manager dashboard should call the same deterministic workflow:

1. create or edit structured content
2. render affected pages
3. run validation
4. run `scripts/update-docs.py`
5. suggest an appropriate version level
6. create a release only after the user approves the version bump
7. commit/push the branch and open a pull request

The dashboard should never silently merge changes into `main`.
