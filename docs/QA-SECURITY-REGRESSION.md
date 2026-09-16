# Portfolio System QA, Security, and Human-Error Test Plan

This document describes the current regression model for the public portfolio and the local Portfolio Manager.

## System boundary

The repository has two different surfaces:

- **Public portfolio:** static files under `portfolio/`, published through GitHub Pages.
- **Portfolio Manager:** private Flask application bound to `127.0.0.1:5055`, intended to run only on the local Mac when portfolio work is being managed.

The local Manager is not a remote admin panel and should not be exposed to the LAN or internet in the current architecture.

## Threat model

The security goal is to reduce the chance that normal use, malformed input, hostile browser requests, unsafe files, or publishing mistakes expose private material or corrupt the portfolio.

Current protections cover:

- authentication for private Manager routes;
- CSRF protection for state-changing POST requests;
- localhost-only binding and hostile Host rejection;
- safe redirect handling;
- path traversal protection for private and public-managed paths;
- Git staging/publishing path restrictions;
- browser headers that suppress caching/referrer leakage, framing, cross-origin opener sharing, and camera/microphone/geolocation access;
- public asset extension allowlisting plus lightweight file-signature/container validation;
- AI secret/sensitivity preflight and prompt-injection authority boundaries;
- XSS escaping in managed rendering paths;
- public privacy/leakage scans for secrets, local paths, private workspace markers, junk files, backup files, and accidental email exposure;
- state-safety and recovery tests around AI, references, content creation, assets, and publishing.

### Important limitation

Portfolio Manager runs with the permissions of the signed-in macOS user. Its password and browser protections defend the local web application; they do **not** protect repository files from malware or another local process already running with the same OS permissions. macOS account security, disk encryption, updates, backups, and GitHub account security remain separate controls.

## Automated regression layers

### Public portfolio

The validation suite covers:

- HTML/link/site structure;
- structured project and general-page data;
- renderer and new-project behavior;
- mobile/responsive and visual-polish contracts;
- generated documentation consistency;
- public privacy/leakage through `scripts/check-public-privacy.py`.

### Portfolio Manager

The validation suite covers:

- authentication and CSRF;
- safe redirects and Host handling;
- local-only response headers;
- Git workflow safety;
- managed asset paths and reference protection;
- public asset signature/container validation;
- AI proposal/apply/file-review boundaries;
- Reference Library privacy and sanitization gates;
- Create Content source/build/publish gates;
- contextual help/privacy freshness;
- workflow state safety and recovery.

### Adversarial tests

`scripts/check-adversarial-security.py` uses synthetic hostile inputs to test redirect abuse, Host headers, CSRF forgery, path traversal, Git path safety, synthetic credentials, prompt injection, Office archive expansion, XSS escaping, private response headers, and tracked-private-path checks.

`scripts/check-security-recovery.py` preserves the still-relevant security contracts recovered from historical PR #34: restrictive browser headers and public asset byte/signature validation.

No real credentials or personal files should ever be used in these tests.

## Human-error regression checks

Before a major Portfolio Manager release, manually verify these normal mistake cases:

1. Try routine publishing while not on `main`; it should be blocked.
2. Try publishing with uncommitted changes; it should be blocked.
3. Try publishing when remote `main` is newer; sync should be required first.
4. Submit a stale form after session/CSRF state changes; the action should fail safely.
5. Use browser Back/Refresh around AI proposals, Related References, Keep/Revert, and Reference Library flows; actions should not silently repeat.
6. Upload the same asset filename twice; a unique managed filename should be used.
7. Upload HTML/text renamed as an image/PDF or a generic ZIP renamed as DOCX; it should be rejected.
8. Replace an asset with mismatched bytes; the original file should be restored.
9. Remove an asset still referenced by public HTML/CSS/JS; deletion should be blocked.
10. Modify an approved sanitized source after it is attached to a Content Brief; stale state should become visible.
11. Modify a Content Brief after an AI plan is generated; the plan should become stale.
12. Run an AI action without configured AI credentials; the workflow should route safely rather than partially execute.
13. Trigger sensitivity/secret preflight; blocked material should not be sent onward.
14. Use malformed IDs or filters; the Manager should show a safe error/recovery state rather than exposing a traceback or local path.
15. Stop the local Manager/preview servers; the deployed GitHub Pages portfolio should remain unaffected.

## Manual public-site QA

A green CI run does not replace visual review. Before final release, check the deployed site on desktop and phone for navigation, mobile layout, overflow, keyboard focus, touch targets, interactive demos, Keep Exploring links, résumé/GitHub/LinkedIn links, and any newly changed case-study interactions.

## Manual Portfolio Manager QA

Run the Manager locally:

```bash
python portfolio-manager/app.py
```

For public-page previews, run a separate static server from the `portfolio/` directory:

```bash
python3 -m http.server 8000
```

Test at least one complete example of each major workflow: structured content editing, custom-page copy, asset add/replace/remove, AI proposal/apply, AI Portfolio Review, Related References, Reference Library, sanitization/approval, Content Brief build, Keep/Revert, Full Validation, and the Git commit/publish workflow.

## PR #34 recovery note

Historical PR #34 contained useful security work but was built against an obsolete repository state. The modern recovery approach is intentionally selective:

- **Already present on modern main:** hostile Host rejection, CSRF/open-redirect protections, authoritative Full Validation, adversarial security testing, tracked-private-path checks, state-safety testing, and most private-response headers.
- **Recovered here:** public asset byte/signature validation, a dedicated public privacy/leakage scan, `Cross-Origin-Opener-Policy`, restrictive `Permissions-Policy`, and updated regression documentation.
- **Not ported as duplicates:** the old standalone `check-adversarial-qa.py`, `check-security-hardening.py`, and separate security-header module, because current architecture already has consolidated equivalents.

## Final sign-off rule

Green CI means the deterministic security and regression contracts passed. It does not replace human review of visual quality, writing quality, confidentiality decisions, mobile feel, or the substantive correctness of AI-assisted recommendations.
