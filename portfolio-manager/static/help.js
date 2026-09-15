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

    function openDrawer(key = null, label = null) {
        if (!drawer || !body) return;
        if (key) {
            drawer.dataset.helpCurrent = '';
            history.length = 0;
            showTopic(key, label, { pushHistory: false });
        } else {
            drawer.dataset.helpCurrent = '';
            showHelpHome();
        }
        drawer.setAttribute('aria-hidden', 'false');
        drawer.classList.add('is-open');
        if (backdrop) {
            backdrop.hidden = false;
            backdrop.classList.add('is-open');
        }
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
        drawer.dataset.helpCurrent = '';
        showHelpHome();
    }

    // New Portfolio Manager surfaces automatically receive one page-level contextual
    // helper in the header. Section-level helpers can still be hand-placed where a
    // workflow needs more specific guidance. Specific routes must come before broad ones.
    const contextualHelpRules = [
        { match: /^\/create\/references\/[^/]+\/analysis\/?$/, key: 'reference-ai', label: 'AI Resource Analysis' },
        { match: /^\/create\/references\/[^/]+\/sanitization\/?$/, key: 'sanitization', label: 'Sanitization Review' },
        { match: /^\/create\/references(?:\/.*)?$/, key: 'reference-library', label: 'Reference Library' },
        { match: /^\/create\/[^/]+\/build\/?$/, key: 'create-content', label: 'Controlled Build' },
        { match: /^\/create(?:\/.*)?$/, key: 'create-content', label: 'Create Content' },
        { match: /^\/manage\/pages\//, key: 'general-content', label: 'Visible Page Editing' },
        { match: /^\/content\/projects\//, key: 'save-project', label: 'Project Editing' },
        { match: /^\/content\/?$/, key: 'maintenance', label: 'Manage Content' },
        { match: /^\/site-content(?:\/.*)?$/, key: 'general-content', label: 'Page Content' },
        { match: /^\/ai\/page-edit\//, key: 'page-ai', label: 'Page-aware AI' },
        { match: /^\/manage\/ai-review(?:\/.*)?$/, key: 'portfolio-review', label: 'AI Portfolio Review' },
        { match: /related-references/, key: 'related-references', label: 'Related References' },
        { match: /^\/assets(?:\/.*)?$/, key: 'assets', label: 'Project Asset Safety' },
        { match: /^\/git(?:\/.*)?$/, key: 'git-workflow', label: 'Save & Publish Safety' },
        { match: /^\/ai(?:\/.*)?$/, key: 'ai-assistance', label: 'AI Assistance' },
        { match: /^\/$/, key: 'maintenance', label: 'Portfolio Manager Workflow' },
    ];

    function addContextualPageHelp() {
        if (!drawer) return;
        const rule = contextualHelpRules.find((item) => item.match.test(window.location.pathname));
        if (!rule) return;

        const host = document.querySelector('.subpage-header .header-actions, .manager-header .manager-top-actions');
        if (!host || host.querySelector(`[data-help-key="${rule.key}"]`)) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'inline-help contextual-page-help';
        button.dataset.helpKey = rule.key;
        button.dataset.helpLabel = rule.label;
        button.setAttribute('aria-label', `Open ${rule.label} help`);
        button.title = `${rule.label} help`;
        button.textContent = '?';
        host.prepend(button);
    }

    addContextualPageHelp();

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
            if (drawer) drawer.dataset.helpCurrent = '';
            showHelpHome();
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