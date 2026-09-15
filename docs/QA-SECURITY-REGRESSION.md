# Portfolio System QA, Security, and Human-Error Test Plan

This document is the final regression plan for the public portfolio and the local Portfolio Manager.

## System boundary

The system has two very different surfaces:

- **Public portfolio:** static files under `portfolio/`, published through GitHub Pages.
- **Portfolio Manager:** private Flask application bound to `127.0.0.1:5055`, intended to run only on Haley's Mac when she chooses to manage the portfolio.

The local Manager is not a remote admin panel and should not be made reachable from the LAN, internet, or phone in the current architecture.

## Threat model

The security goal is to prevent:

- unauthenticated browser access to private Manager routes/files;
- CSRF and unsafe cross-site actions;
- Host-header abuse and accidental network exposure;
- open redirects;
- path traversal into `.env`, `.portfolio-manager/`, or files outside approved roots;
- accidental Git tracking/publishing of private workspace material;
- obvious secret/API-key leakage into the public portfolio;
- XSS from managed text/private metadata;
- renamed/spoofed public asset file types;
- AI prompt injection from source material changing the tool's authority;
- AI workflows silently receiving private notes, unrelated resources, or blocked credential material;
- unsafe Git staging/publishing paths;
- user mistakes silently becoming public changes.

### Important limitation

Portfolio Manager runs with the permissions of the logged-in macOS user. If the Mac account itself is compromised by malware, a malicious local process, a malicious browser extension with broad local/file access, or stolen OS credentials, that attacker may be able to read local files directly without going through Portfolio Manager. The Manager password is an application-level guard, not a replacement for macOS account security, disk encryption, device updates, secure backups, or GitHub account security.

## Automated regression layers

### Public site

- HTML/link/site structure
- structured project data
- structured general-page copy sync
- renderer/generator behavior
- responsive/mobile contracts
- public copy/polish contracts
- public privacy/secret leakage scan
- generated documentation consistency

### Portfolio Manager

- authentication requirement
- CSRF on POST actions
- strict localhost binding and trusted hosts
- session-cookie safety
- browser-side private response headers and no-store caching
- Git path/publish guardrails
- asset-path containment and reference checks
- public asset signature/container validation
- general-page escaping and deterministic locators
- AI proposal/apply boundaries
- AI file-upload review boundaries
- Reference Library privacy and sanitization gates
- Create Content source/build/publish gates
- contextual help coverage

### Adversarial inputs

`scripts/check-adversarial-qa.py` intentionally submits synthetic hostile input, including:

- external and protocol-relative redirect targets;
- forged Host headers;
- missing/incorrect CSRF tokens;
- traversal IDs such as `../../.env`;
- blocked Git paths such as `.env`, `.portfolio-manager/`, and key files;
- `<script>` and event-handler XSS payloads;
- filenames containing traversal and HTML characters;
- HTML/text renamed as PNG/PDF;
- generic ZIP files renamed as DOCX;
- prompt-injection text asking AI to ignore instructions and read `.env`;
- synthetic API-key material;
- malicious `return_to` values;
- malformed Reference Library IDs and unknown filters.

No real secrets or personal files are used by these automated tests.

## Human-error / "stupidity" tests

These are intentionally mundane because real breakage often comes from normal mistakes rather than sophisticated attacks.

1. Open Portfolio Manager while on a feature branch and try Save & Publish. It should refuse routine publishing until `main` is active.
2. Try to publish while local changes remain. Publishing should be blocked.
3. Try to publish when GitHub is ahead. Publishing should require a safe sync first.
4. Submit a form from an old browser tab after the session/CSRF state changed. It should fail with a recoverable message rather than applying the action.
5. Use Back/Refresh around AI proposals, Related References, Keep/Revert, and Reference Library screens. State should remain understandable and no action should repeat automatically.
6. Upload the same public asset filename twice. A unique managed filename should be used rather than silently overwriting the first asset.
7. Upload a file with the wrong extension or fake content. It should be rejected before entering `portfolio/`.
8. Try to remove an asset that public HTML/CSS/JS still references. Removal should be blocked.
9. Try to mark an original Reference Library source Approved for Portfolio Use without a sanitized derivative. Approval should be blocked.
10. Change an approved sanitized derivative after attaching it to a Content Brief. The source snapshot should become stale and require review/refresh.
11. Change a Content Brief after generating an AI plan. The plan should become stale.
12. Try AI without a configured key. The workflow should route to Settings instead of partially running.
13. Trigger sensitivity/secret preflight. AI generation should stop until the source is made safe or the appropriate warning acknowledgement is reviewed.
14. Use an unknown/malformed filter or ID. The UI should recover to a safe workspace or clear error rather than exposing a traceback/path.
15. Close both local terminals. The GitHub Pages site should remain live; only local Manager/preview functionality should stop.

## Manual public-site QA before final sign-off

Test the deployed GitHub Pages site, not only localhost.

### Desktop

- Safari
- Chrome
- navigation and all public links
- Home, About, Projects, Contact
- all category pages
- all interactive demos
- project end blocks / Keep Exploring paths
- resume/GitHub/LinkedIn links
- no console-visible broken interactions during normal use

### Phone

Test on an actual phone after deployment, ideally Safari on iPhone plus Chrome/another browser when available.

Check:

- no horizontal page scrolling;
- readable type without pinch-zoom;
- navigation remains usable;
- touch targets are comfortable;
- cards/grids collapse cleanly;
- long words/URLs do not overflow;
- interactive sliders/buttons/forms fit the viewport;
- sticky/fixed elements do not cover content;
- diagrams/matrices remain understandable;
- all demos can be completed without hover-only behavior.

### Tablet / narrow desktop

Check around 768px and landscape phone widths for awkward in-between layouts.

## Manual Portfolio Manager QA

Run:

```bash
python portfolio-manager/app.py
```

When real local page previews are needed, run separately from `portfolio/`:

```bash
python3 -m http.server 8000
```

Test one complete example of each workflow:

- Manage existing structured project
- Manage custom page copy
- Project asset add/edit/replace/remove
- Page-aware AI proposal -> Apply Locally -> Preview -> Keep/Revert
- AI Portfolio Review
- Related References
- Reference Library add/edit/download
- Ask AI About This Resource
- Sanitization Review -> derivative -> approval
- Approved Source -> Content Brief
- Content Brief -> AI plan -> approved build -> local project -> Keep
- Create publish bridge -> Related References -> publishing workflow
- Advanced AI Helper file review -> proposal -> existing-content staging
- Advanced AI Helper -> new Content Brief prefill
- Save for Later / proposal history
- Full Validation
- Save & Publish file review -> diff -> commit -> publish

## Final sign-off rule

A green CI run means the deterministic and adversarial automated contracts passed. It does **not** replace human review of visual quality, writing quality, confidentiality decisions, mobile feel, or whether an AI-generated recommendation is substantively correct.
