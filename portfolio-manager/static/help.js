(() => {
    const drawer = document.querySelector('[data-help-drawer]');
    const backdrop = document.querySelector('[data-help-backdrop]');
    const body = document.querySelector('[data-help-body]');
    const title = document.querySelector('[data-help-title]');
    const nav = document.querySelector('[data-help-nav]');
    const homeBody = body ? body.innerHTML : '';
    const history = [];

    function showHelpHome() {
        if (!drawer || !body) return;
        body.innerHTML = homeBody;
        drawer.dataset.helpCurrent = '';
        if (title) title.textContent = 'Portfolio Manager Help';
        if (nav) nav.hidden = true;
        history.length = 0;
    }

    function showTopic(key, label = null, { pushHistory = true } = {}) {
        if (!drawer || !body || !key) return false;
        const template = document.querySelector(`[data-help-template="${key}"]`);
        if (!template) return false;

        const currentKey = drawer.dataset.helpCurrent || '';
        if (pushHistory && currentKey && currentKey !== key) history.push(currentKey);
        body.innerHTML = template.innerHTML;
        drawer.dataset.helpCurrent = key;
        if (title) title.textContent = label || template.dataset.helpLabel || 'Portfolio Manager Help';
        if (nav) nav.hidden = false;
        return true;
    }

    function revealDrawer() {
        if (!drawer) return;
        drawer.setAttribute('aria-hidden', 'false');
        drawer.classList.add('is-open');
        if (backdrop) {
            backdrop.hidden = false;
            backdrop.classList.add('is-open');
        }
    }

    function openDrawer(key = null, label = null) {
        if (!drawer || !body) return;
        if (key) {
            drawer.dataset.helpCurrent = '';
            history.length = 0;
            showTopic(key, label, { pushHistory: false });
        } else {
            showHelpHome();
        }
        revealDrawer();
    }

    function closeDrawer() {
        if (!drawer) return;
        drawer.setAttribute('aria-hidden', 'true');
        drawer.classList.remove('is-open');
        if (backdrop) {
            backdrop.classList.remove('is-open');
            backdrop.hidden = true;
        }
    }

    function goBackInHelp() {
        if (!drawer || !body) return;
        const previous = history.pop();
        if (previous) {
            showTopic(previous, null, { pushHistory: false });
            return;
        }
        showHelpHome();
    }

    function cleanText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function topicExists(key) {
        return Boolean(document.querySelector(`[data-help-template="${key}"]`));
    }

    function makeHelpButton(key, label, extraClass = '') {
        if (!topicExists(key)) return null;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `inline-help ${extraClass}`.trim();
        button.dataset.helpKey = key;
        button.dataset.helpLabel = label;
        button.setAttribute('aria-label', `Open ${label} help`);
        button.title = `${label} help`;
        button.textContent = '?';
        return button;
    }

    function makeLocalHelpButton(label, extraClass = '') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `inline-help ${extraClass}`.trim();
        button.dataset.localHelp = 'true';
        button.dataset.helpLabel = label;
        button.setAttribute('aria-label', `Explain ${label}`);
        button.title = `Explain ${label}`;
        button.textContent = '?';
        return button;
    }

    function closestMajorHelpSection(node) {
        return node ? node.closest('.release-box, .git-safety-banner, .dashboard-card') : null;
    }

    function closestHelpRegion(node) {
        const major = closestMajorHelpSection(node);
        if (major) return major;
        return node ? node.closest('.subpage-header, .manager-header') : null;
    }

    function belongsToRegion(node, region) {
        return Boolean(node && region && closestHelpRegion(node) === region);
    }

    function regionName(region) {
        const headings = Array.from(region.querySelectorAll('h1, h2, h3, summary strong'));
        const heading = headings.find((node) => belongsToRegion(node, region));
        if (heading && cleanText(heading.textContent)) return cleanText(heading.textContent);

        const eyebrow = Array.from(region.querySelectorAll('.eyebrow'))
            .find((node) => belongsToRegion(node, region));
        return eyebrow ? cleanText(eyebrow.textContent) : 'This section';
    }

    function regionIntro(region) {
        const candidates = Array.from(region.querySelectorAll('.hero-copy, .section-copy, p'));
        const paragraph = candidates.find((node) => {
            if (!belongsToRegion(node, region)) return false;
            if (node.classList.contains('eyebrow') || node.classList.contains('field-help')) return false;
            if (node.closest('.v2-small-card, .v2-workspace-card, .v2-tree-page, .v2-project-row')) return false;
            return Boolean(cleanText(node.textContent));
        });
        return paragraph ? cleanText(paragraph.textContent) : '';
    }

    function actionContext(control, region) {
        const card = control.closest('.v2-small-card, .v2-workspace-card');
        if (card && belongsToRegion(card, region)) {
            const heading = card.querySelector('h3, h4, strong');
            const paragraph = card.querySelector('p');
            return {
                heading: heading ? cleanText(heading.textContent) : '',
                description: paragraph ? cleanText(paragraph.textContent) : '',
            };
        }

        const row = control.closest('.v2-tree-page, .v2-project-row');
        if (row && belongsToRegion(row, region)) {
            const heading = row.querySelector('h3, h4, strong');
            return {
                heading: heading ? cleanText(heading.textContent) : '',
                description: '',
            };
        }

        return { heading: '', description: '' };
    }

    function describeAction(control, label, context = '') {
        const text = cleanText(label);
        const lower = text.toLowerCase();
        const href = control.tagName === 'A' ? String(control.getAttribute('href') || '') : '';
        const disabled = control.disabled || control.getAttribute('aria-disabled') === 'true';
        const prefix = context ? `${context} ` : '';

        if (disabled) return `${prefix}This option is shown here but is not currently available.`;
        if (lower === 'run full validation') return `${prefix}Runs the complete local safety and quality check suite. It checks the portfolio and Portfolio Manager but does not commit or publish anything.`;
        if (lower === 'save & publish') return `${prefix}Opens the controlled Git workflow where you review changes, select files, validate, commit locally, and explicitly publish to GitHub.`;
        if (lower === 'refresh documentation') return `${prefix}Regenerates the repository documentation from the current project data. It does not publish by itself.`;
        if (lower === 'view documentation') return `${prefix}Opens the generated repository documentation in GitHub for reference.`;
        if (lower === 'patch') return `${prefix}Records a patch release for small fixes or refinements. It updates local release records but does not publish by itself.`;
        if (lower === 'minor') return `${prefix}Records a minor release for meaningful new functionality that remains backward compatible. It does not publish by itself.`;
        if (lower === 'major') return `${prefix}Records a major release for a substantial system change. It does not publish by itself.`;
        if (lower === 'manage content') return `${prefix}Opens the workspace for editing, reviewing, and maintaining portfolio content that already exists.`;
        if (lower === 'create content') return `${prefix}Opens the guided workflow for planning and building a new portfolio project.`;
        if (lower === 'start new content brief') return `${prefix}Creates a new private Content Brief so you can define the project before building public files.`;
        if (lower === 'open reference library') return `${prefix}Opens the private Reference Library where original sources can be stored, reviewed, sanitized, and prepared for later portfolio use.`;
        if (lower === 'view approved sources') return `${prefix}Filters the Reference Library to sources whose sanitized derivatives have already been approved for portfolio use.`;
        if (lower === 'open ai drafting helper') return `${prefix}Opens the proposal-only AI helper for isolated drafting, rewriting, analysis, or placement support outside the guided Content Brief workflow.`;
        if (lower === 'add private source') return `${prefix}Stores the selected source and its private metadata in the Git-ignored Reference Library. It does not make the source public.`;
        if (['all', 'private source', 'needs review', 'sanitized draft', 'approved for portfolio use'].includes(lower) && (href.includes('status=') || lower === 'all')) {
            return lower === 'all'
                ? `${prefix}Shows every Reference Library item regardless of review status.`
                : `${prefix}Filters the Reference Library to items with the “${text}” status.`;
        }
        if (lower === 'preview') return `${prefix}Opens the local portfolio preview so you can inspect the current local version before publishing.`;
        if (lower === 'dashboard') return `${prefix}Returns to the Portfolio Manager dashboard.`;
        if (lower === 'ai settings') return `${prefix}Opens the local AI provider/model settings. API secrets remain in the Git-ignored local environment file.`;
        if (lower === 'user guide') return `${prefix}Opens the complete Portfolio Manager guide and workflow reference.`;
        if (lower === 'version history') return `${prefix}Opens the repository changelog/version history in GitHub.`;
        if (lower === 'privacy & security') return `${prefix}Opens the privacy and security explanation for private files, public files, AI boundaries, and publishing.`;
        if (lower === 'sign out') return `${prefix}Ends the current Portfolio Manager session on this Mac.`;
        if (lower.startsWith('back to ')) return `${prefix}Returns to ${text.slice(8)}.`;
        if (lower.startsWith('edit ')) return `${prefix}Opens ${text.slice(5)} for editing in Portfolio Manager.`;
        if (lower.startsWith('open ')) return `${prefix}Opens ${text.slice(5)}.`;
        if (lower.startsWith('view ')) return `${prefix}Opens ${text.slice(5)} for review.`;
        if (lower.startsWith('save')) return `${prefix}Saves the current changes locally. Saving does not make the changes live unless the control explicitly says Publish.`;
        if (lower.startsWith('approve')) return `${prefix}Marks the reviewed item as approved for the next stated workflow stage; approval alone does not publish it.`;
        if (lower.startsWith('generate') || lower.startsWith('create proposal')) return `${prefix}Creates the requested local draft/proposal for review. It does not publish automatically.`;
        if (lower.startsWith('delete') || lower.startsWith('remove')) return `${prefix}Removes the named local item after the workflow's safety checks and confirmation. It does not rewrite published Git history.`;
        if (lower.startsWith('revert')) return `${prefix}Attempts to undo the named local change using the Manager's safety checks.`;
        if (lower.startsWith('keep')) return `${prefix}Keeps the reviewed local result so you can continue the workflow. Keeping it does not publish it.`;
        if (lower.startsWith('publish')) return `${prefix}Performs the explicit publishing action described by this control after its required safety checks.`;
        if (lower.startsWith('use ')) return `${prefix}Uses the selected item in the next named workflow step without making it public by itself.`;
        if (lower.startsWith('add ')) return `${prefix}Adds the named item to this local workflow section.`;
        if (lower.startsWith('start ')) return `${prefix}Starts the named workflow.`;
        if (lower.startsWith('test ')) return `${prefix}Runs a local connection or configuration test without publishing portfolio content.`;
        if (lower.startsWith('disable')) return `${prefix}Turns off the named local feature or connection until you enable/configure it again.`;
        if (control.tagName === 'A') return `${prefix}Opens the destination named by this link.`;
        return `${prefix}Runs the action named by this button within this section.`;
    }

    function describeField(field, labelText) {
        const type = String(field.getAttribute('type') || field.tagName).toLowerCase();
        const wrapper = field.closest('.full-span, .form-field, .field-group, label') || field.parentElement;
        const helper = wrapper ? wrapper.querySelector('.field-help, .form-help, small') : null;
        const helperText = helper ? cleanText(helper.textContent) : '';
        const placeholder = cleanText(field.getAttribute('placeholder') || '');

        if (helperText) return helperText;
        if (field.tagName === 'SELECT') {
            const choices = Array.from(field.options || [])
                .map((option) => cleanText(option.textContent))
                .filter(Boolean);
            if (choices.length && choices.length <= 12) return `Choose one value from this dropdown: ${choices.join(', ')}.`;
            return 'Choose one of the available values in this dropdown.';
        }
        if (type === 'file') return 'Choose the local file to provide for this field. The section’s surrounding workflow determines whether it stays private or is prepared for public use.';
        if (type === 'checkbox') return `Use this checkbox to confirm or enable “${labelText}”.`;
        if (type === 'radio') return `Choose this option when “${labelText}” is the value you want.`;
        if (field.tagName === 'TEXTAREA') return placeholder ? `Enter the longer-form information requested here. The field suggests: “${placeholder}”.` : 'Enter the longer-form information requested by this field.';
        if (placeholder) return `Enter the requested value. Example/guidance shown in the field: “${placeholder}”.`;
        return 'Enter the value requested by this field.';
    }

    function addOption(options, seen, name, description) {
        const cleanName = cleanText(name);
        const cleanDescription = cleanText(description);
        if (!cleanName || !cleanDescription) return;
        const key = `${cleanName.toLowerCase()}|${cleanDescription.toLowerCase()}`;
        if (seen.has(key)) return;
        seen.add(key);
        options.push({ name: cleanName, description: cleanDescription });
    }

    function collectRegionOptions(region) {
        const options = [];
        const seen = new Set();
        const consumedControls = new Set();

        Array.from(region.querySelectorAll('.v2-small-card, .v2-workspace-card')).forEach((card) => {
            if (!belongsToRegion(card, region)) return;
            const heading = card.querySelector('h3, h4, strong');
            const paragraph = card.querySelector('p');
            const contextHeading = heading ? cleanText(heading.textContent) : '';
            const contextDescription = paragraph ? cleanText(paragraph.textContent) : '';
            const controls = Array.from(card.querySelectorAll('a.btn, button.btn'))
                .filter((control) => !control.classList.contains('inline-help'));

            if (!controls.length) {
                addOption(options, seen, contextHeading || 'Information', contextDescription || 'This card is informational and has no action available here.');
                return;
            }

            controls.forEach((control) => {
                consumedControls.add(control);
                const label = cleanText(control.textContent) || cleanText(control.getAttribute('aria-label'));
                const description = describeAction(control, label, contextDescription);
                addOption(options, seen, contextHeading ? `${contextHeading}: ${label}` : label, description);
            });
        });

        Array.from(region.querySelectorAll('label[for]')).forEach((label) => {
            if (!belongsToRegion(label, region)) return;
            const fieldId = label.getAttribute('for');
            if (!fieldId) return;
            const field = document.getElementById(fieldId);
            if (!field || !belongsToRegion(field, region) || field.type === 'hidden') return;
            addOption(options, seen, cleanText(label.textContent), describeField(field, cleanText(label.textContent)));
        });

        Array.from(region.querySelectorAll('details > summary')).forEach((summary) => {
            if (!belongsToRegion(summary, region)) return;
            const label = cleanText(summary.textContent);
            if (label) addOption(options, seen, label, 'Expands or collapses the additional controls and information in this section.');
        });

        Array.from(region.querySelectorAll('a.btn, button.btn')).forEach((control) => {
            if (!belongsToRegion(control, region) || consumedControls.has(control) || control.classList.contains('inline-help')) return;
            const label = cleanText(control.textContent) || cleanText(control.getAttribute('aria-label'));
            if (!label) return;
            const context = actionContext(control, region);
            const displayName = context.heading ? `${context.heading}: ${label}` : label;
            addOption(options, seen, displayName, describeAction(control, label, context.description));
        });

        const repeatedLinks = Array.from(region.querySelectorAll('.ai-proposal-list .ai-proposal-link'))
            .filter((link) => belongsToRegion(link, region));
        if (repeatedLinks.length) {
            const name = regionName(region).toLowerCase();
            let label = 'Open a listed item';
            let description = 'Select any listed item to open its details and continue its local workflow.';
            if (name.includes('content brief')) {
                label = 'Open a Content Brief';
                description = 'Select any listed Content Brief to review or continue its private planning/build workflow.';
            } else if (name.includes('library') || name.includes('reference')) {
                label = 'Open a Reference Library item';
                description = 'Select any listed reference item to review its private source, notes, status, sanitization work, and approved derivative when available.';
            } else if (name.includes('proposal')) {
                label = 'Open a proposal';
                description = 'Select any listed proposal to review its details and current local status.';
            }
            addOption(options, seen, label, description);
        }

        return options;
    }

    function renderLocalHelp(region, label = null) {
        if (!drawer || !body || !region) return false;
        const name = regionName(region);
        const intro = regionIntro(region);
        const options = collectRegionOptions(region);

        body.innerHTML = '';
        drawer.dataset.helpCurrent = '';
        history.length = 0;
        if (title) title.textContent = label || `${name} help`;
        if (nav) nav.hidden = false;

        if (intro) {
            const introNode = document.createElement('p');
            introNode.className = 'section-help-intro';
            introNode.textContent = intro;
            body.appendChild(introNode);
        }

        const heading = document.createElement('h3');
        heading.className = 'section-help-heading';
        heading.textContent = options.length ? 'Options in this section' : 'About this section';
        body.appendChild(heading);

        if (!options.length) {
            const empty = document.createElement('p');
            empty.className = 'section-help-empty';
            empty.textContent = 'This area is informational. There are no separate actions or form controls in this section.';
            body.appendChild(empty);
            return true;
        }

        const list = document.createElement('div');
        list.className = 'section-help-options';
        options.forEach((option) => {
            const item = document.createElement('div');
            item.className = 'section-help-option';
            const strong = document.createElement('strong');
            strong.textContent = option.name;
            const description = document.createElement('p');
            description.textContent = option.description;
            item.append(strong, description);
            list.appendChild(item);
        });
        body.appendChild(list);
        return true;
    }

    function openLocalHelp(button) {
        const region = closestHelpRegion(button);
        if (!region || !renderLocalHelp(region, button.dataset.helpLabel || null)) return;
        revealDrawer();
    }

    // Page-header help is intentionally local: it explains only the page heading/purpose
    // and the controls beside the bubble, rather than opening a broad workflow article.
    function addContextualPageHelp() {
        if (!drawer) return;
        const host = document.querySelector('.subpage-header .header-actions, .manager-header .manager-top-actions');
        if (!host || host.querySelector('.contextual-page-help')) return;
        const header = host.closest('.subpage-header, .manager-header');
        if (!header) return;
        const button = makeLocalHelpButton(`${regionName(header)} help`, 'contextual-page-help');
        host.prepend(button);
    }

    function sectionOwnHelpButton(section) {
        return Array.from(section.querySelectorAll('.inline-help')).find((node) => closestMajorHelpSection(node) === section) || null;
    }

    // Every major workflow section gets one local helper. Existing hand-placed ? buttons
    // are converted to section-local behavior; new ones are added only when needed.
    function addContextualSectionHelp() {
        if (!drawer) return;
        const sections = document.querySelectorAll('.dashboard-card, .git-safety-banner, .release-box');

        sections.forEach((section) => {
            if (section.classList.contains('v2-small-card')) return;

            const existing = sectionOwnHelpButton(section);
            if (existing) {
                existing.dataset.localHelp = 'true';
                existing.dataset.helpLabel = `${regionName(section)} help`;
                existing.classList.add('contextual-section-help');
                existing.setAttribute('aria-label', `Explain ${regionName(section)}`);
                existing.title = `Explain ${regionName(section)}`;
                return;
            }

            const button = makeLocalHelpButton(`${regionName(section)} help`, 'contextual-section-help');
            const directActionRow = Array.from(section.children)
                .find((child) => child.classList && child.classList.contains('action-title-row'));
            if (directActionRow) {
                directActionRow.append(button);
                return;
            }

            const anchor = document.createElement('div');
            anchor.className = 'contextual-section-help-anchor';
            anchor.append(button);
            section.prepend(anchor);
        });
    }

    addContextualPageHelp();
    addContextualSectionHelp();

    // Some destructive actions predate the shared confirmation helper. Normalize them
    // here so the safety explanation stays consistent even when a template has not yet
    // been given an explicit data-confirm-action attribute.
    document.querySelectorAll('form').forEach((form) => {
        const action = form.getAttribute('action') || '';
        if (!form.dataset.confirmAction && action.includes('/sanitized/delete')) {
            form.dataset.confirmAction = 'delete-sanitized-derivative';
        }
    });

    document.addEventListener('click', (event) => {
        const opener = event.target.closest('[data-help-open]');
        if (opener) {
            openDrawer();
            return;
        }

        if (event.target.closest('[data-help-back]')) {
            goBackInHelp();
            return;
        }

        if (event.target.closest('[data-help-home]')) {
            showHelpHome();
            return;
        }

        const localHelp = event.target.closest('[data-local-help="true"]');
        if (localHelp) {
            openLocalHelp(localHelp);
            return;
        }

        const topic = event.target.closest('[data-help-key]');
        if (topic) {
            if (drawer && drawer.classList.contains('is-open')) {
                showTopic(topic.dataset.helpKey, topic.dataset.helpLabel || null);
            } else {
                openDrawer(topic.dataset.helpKey, topic.dataset.helpLabel || null);
            }
            return;
        }

        if (event.target.closest('[data-help-close]') || event.target === backdrop) {
            closeDrawer();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeDrawer();
    });

    document.querySelectorAll('form[data-confirm-action]').forEach((form) => {
        form.addEventListener('submit', (event) => {
            const kind = form.dataset.confirmAction;
            const submitter = event.submitter;
            let message = '';

            if (kind === 'regenerate') {
                message = 'Regenerate this standard page?\n\nThis replaces its generated public HTML using the latest structured project data. It will NOT commit or publish anything.';
            } else if (kind === 'version') {
                const level = submitter ? submitter.value : 'selected';
                message = `Create a ${level} version release?\n\nThis updates local version history, changelog, and a version snapshot. It will NOT commit or publish anything.`;
            } else if (kind === 'remove-asset') {
                message = 'Remove this public asset?\n\nPortfolio Manager will remove its structured project association and local file, then run validation. If another public page still depends on the file, the removal is rolled back. This does NOT commit or publish anything.';
            } else if (kind === 'general-save') {
                message = 'Save these general page copy edits?\n\nThis updates the structured general-page source and approved text locations in public HTML locally. Validation runs immediately and rolls back both files if it fails. This does NOT commit or publish anything.';
            } else if (kind === 'git-sync-main') {
                message = 'Sync local main with GitHub?\n\nPortfolio Manager uses fast-forward-only pull. If Git would need a merge commit, the sync fails instead. No local edits are discarded.';
            } else if (kind === 'git-stage') {
                message = 'Select these files for the next commit?\n\nThis chooses what will be included in your local commit. It does not commit or publish anything yet.';
            } else if (kind === 'git-commit') {
                message = 'Run full validation and commit these changes to local main?\n\nThe commit is blocked if validation fails. A successful commit stays on your Mac until you explicitly choose Publish to GitHub.';
            } else if (kind === 'git-push') {
                message = 'Publish committed main changes to GitHub?\n\nPortfolio Manager rechecks outgoing paths and reruns Full Validation immediately before push. If those checks pass, local main is pushed to origin/main and GitHub Pages can deploy public portfolio changes. No force-push is used.';
            } else if (kind === 'ai-delete-proposal') {
                message = 'Delete this private AI proposal?\n\nThis removes only the Git-ignored local proposal record and its private usage history. It does not change portfolio files, Git history, or content already saved elsewhere.';
            } else if (kind === 'revert-created-project') {
                message = 'Revert this local build?\n\nPortfolio Manager checks every generated file hash before deleting anything. If either generated file changed after creation, the revert stops and nothing is deleted. This does not change published Git history.';
            } else if (kind === 'delete-reference-item') {
                message = 'Delete this private Reference Library item?\n\nDeletion is blocked while any Content Brief still depends on this resource. If it is unattached, this removes the private local item and its stored files; it does not change Git or the public portfolio.';
            } else if (kind === 'delete-sanitized-derivative') {
                message = 'Remove this Sanitized Draft?\n\nDeletion is blocked while a Content Brief still depends on the approved derivative. The original private source stays preserved. This does not change Git or publish anything.';
            }

            if (message && !window.confirm(message)) {
                event.preventDefault();
            }
        });
    });

    const helpSearch = document.querySelector('[data-help-search]');
    if (helpSearch) {
        const sections = Array.from(document.querySelectorAll('[data-guide-section]'));
        const searchStatus = document.querySelector('[data-help-search-status]');
        const noResults = document.querySelector('[data-help-no-results]');
        const clearButton = document.querySelector('[data-help-search-clear]');
        const chips = Array.from(document.querySelectorAll('[data-guide-search-chip]'));

        const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9+#./-]+/g, ' ').trim();

        function runSearch(rawQuery) {
            const query = normalize(rawQuery);
            const terms = query.split(/\s+/).filter(Boolean);
            let visibleCount = 0;

            sections.forEach((section) => {
                const haystack = normalize(`${section.textContent} ${section.dataset.guideTags || ''}`);
                const match = terms.length === 0 || terms.every((term) => haystack.includes(term));
                section.hidden = !match;
                if (match) visibleCount += 1;
            });

            if (searchStatus) {
                searchStatus.textContent = terms.length
                    ? `${visibleCount} guide section${visibleCount === 1 ? '' : 's'} found for “${rawQuery.trim()}”.`
                    : `Showing all ${sections.length} guide sections.`;
            }
            if (noResults) noResults.hidden = visibleCount !== 0;
            if (clearButton) clearButton.hidden = terms.length === 0;
        }

        helpSearch.addEventListener('input', () => runSearch(helpSearch.value));

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                helpSearch.value = '';
                runSearch('');
                helpSearch.focus();
            });
        }

        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                helpSearch.value = chip.dataset.guideSearchChip || chip.textContent.trim();
                runSearch(helpSearch.value);
                helpSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });

        runSearch('');
    }

    if (new URLSearchParams(window.location.search).has('ai_proposal')) {
        const script = document.createElement('script');
        script.src = '/static/ai-handoff.js';
        script.defer = true;
        document.body.appendChild(script);
    }
})();