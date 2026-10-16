# Developer Space maintenance

## Page and project ownership

| Public page | Manager page ID | Structured project ID | Manager location |
| --- | --- | --- | --- |
| Developer Space | `developer-space` | Category landing page | Developer Space → Edit Developer Space |
| Portfolio Creation and Management | `github-workflow` | `portfolio-creation-and-management` | Developer Space → Portfolio Creation and Management |
| Code Block Composer | `code-block-composer` | `code-block-composer` | Developer Space → Code Block Composer |

Portfolio Creation and Management retains `portfolio/projects/github-workflow/index.html` so existing links continue to work. Its current name and category do not depend on that historical directory name. The registry maps project records to page-copy editors by `page_path`, so the project ID and page ID may differ.

Code Block Composer lives at `portfolio/projects/developer-space/code-block-composer/index.html`. The Developer Space card links to that page. Its detailed feature tabs and authoring editor must not be duplicated on the landing page.

## Presentation and interaction owners

| Experience | HTML owner | CSS / JavaScript owners |
| --- | --- | --- |
| Software walkthroughs, spotlight cards | Developer Space landing page | `portfolio/css/developer-space.css`, `portfolio/js/developer-space.js` |
| Restored wizard scene, toolbox, build-process illustrations | Developer Space landing page | `portfolio/css/github-workflow-refresh.css` |
| CBC feature tabs and editable authoring preview | CBC project page | `portfolio/css/developer-space.css`, `portfolio/js/developer-space.js` |
| Connected systems map and four interface previews | Portfolio Creation and Management | `portfolio/css/github-workflow-refresh.css`, `portfolio/js/github-workflow-refresh.js` |
| Canonical breadcrumbs | Each page's identity and parent route | `portfolio/js/portfolio-motion.js` |

`developer-space.js` serves both Developer Space and CBC. Landing-page walkthroughs initialize independently; the editor initialization exits when the CBC editor is absent. Preserve this boundary when moving or changing sections.

## What to edit in Portfolio Manager

- **Project record:** project identity, summary, structured context, related work, and recorded component usage. Saving a record does not rebuild the public HTML.
- **Page copy:** safely located descriptive text and labels. Each current page editor has a “How this page is maintained” note explaining its scope.
- **Project assets:** CBC's approved logo, scenario artwork, LayerLift graphic, and Blueprint Builder graphic are explicitly recorded. Shared-file checks still apply when replacing an asset used on both the card and project page.
- **Related References:** CBC and Portfolio Creation and Management are related products within Developer Space, not a claim that one automatically publishes to the other.
- **Component Registry:** software walkthrough, live authoring preview, connected system map, and human evaluation walkthrough document current implementations as custom patterns. They do not inject markup or create a second interaction controller.

The CBC example's heading defaults, content/feedback model, reset behavior, and preview controls are JavaScript state. The six-stage Human Evaluation + Training example also uses scripted response annotations and review content. Changing descriptive HTML alone does not update those values. Use a reviewed source change for behavior or script-owned content; page-aware AI can propose HTML changes only.

## Adding or moving a spotlight

1. Preserve the current approved HTML, CSS, JavaScript, and public path unless a move is explicitly requested.
2. Maintain the structured project record with the correct category and `page_path`.
3. Register the page in `portfolio-manager/page_copy_service.py` and update relevant canonical breadcrumbs.
4. Use taxonomy/project records for Manager placement; `EXTRA_PAGE_PLACEMENTS` is only the fallback for pages without a structured record.
5. Record approved assets, meaningful related work, and actual component ownership.
6. Run `python3 scripts/update-docs.py` to refresh the inventory and map.
7. Run Full Validation and focused checks of navigation, record-to-page links, assets, and affected interactions.

## Content Library boundary

The Content Library is maintained in `Reeder-design/id-content-library` with its own Library Manager. A portfolio project record or asset registration does not publish a library item. Reusable items need their own title, usage guidance, preview/source files or supporting links, thumbnail, and library validation. Do not copy private Manager data, credentials, company source files, or product internals into a public item.
