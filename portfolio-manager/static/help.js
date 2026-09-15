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

    // Page-level help: every authenticated Portfolio Manager surface gets a contextual
    // entry point. Specific routes come before broad route families. The dashboard uses
    // button-safety at page level so it does not duplicate the Manage/Create workflow
    // helper already shown in the first homepage card.
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
        { match: /^\/ai\/proposals\//, key: 'ai-proposal', label: 'AI Proposal' },
        { match: /^\/manage\/ai-review(?:\/.*)?$/, key: 'portfolio-review', label: 'AI Portfolio Review' },
        { match: /related-references/, key: 'related-references', label: 'Related References' },
        { match: /^\/assets(?:\/.*)?$/, key: 'assets', label: 'Project Asset Safety' },
        { match: /^\/git(?:\/.*)?$/, key: 'git-workflow', label: 'Save & Publish Safety' },
        { match: /^\/ai(?:\/.*)?$/, key: 'ai-assistance', label: 'AI Assistance' },
        { match: /^\/$/, key: 'button-safety', label: 'Portfolio Manager Controls' },
    ];

    function currentPageHelpRule() {
        return contextualHelpRules.find((item) => item.match.test(window.location.pathname)) || null;
    }

    function addContextualPageHelp() {
        if (!drawer) return;
        const host = document.querySelector('.subpage-header .header-actions, .manager-header .manager-top-actions');
        if (!host) return;

        const rule = currentPageHelpRule() || { key: 'maintenance', label: 'Portfolio Manager Help' };
        if (host.querySelector(`[data-help-key="${rule.key}"]`)) return;

        const button = makeHelpButton(rule.key, rule.label, 'contextual-page-help');
        if (button) host.prepend(button);
    }

    // Major section help: add one relevant bubble to each major workflow card/action
    // boundary. Repeated child rows and individual fields stay uncluttered.
    const sectionHelpRules = [
        { match: /(full validation|validation|health check|release end-to-end|security\/misuse|state-safety)/i, key: 'validation', label: 'Full Validation' },
        { match: /(review and publish approved changes|ready to publish|publishing boundary|what actually gets published)/i, key: 'publishing', label: 'Publishing Boundary' },
        { match: /(refresh documentation|documentation and versioning|generated documentation)/i, key: 'refresh-docs', label: 'Documentation Maintenance' },
        { match: /(version release|intentional release)/i, key: 'versioning', label: 'Version Releases' },
        { match: /(review changed files|select files|changed file)/i, key: 'git-stage', label: 'Review and Select Files' },
        { match: /(what actually changed|diff review|selected for the next commit)/i, key: 'git-diff', label: 'Diff Review' },
        { match: /(validate & commit|commit changes|local checkpoint)/i, key: 'git-commit', label: 'Validate and Commit' },
        { match: /(publish to github|push.*github)/i, key: 'git-push', label: 'Publish to GitHub' },
        { match: /(repository state|working on main|save & publish)/i, key: 'git-workflow', label: 'Save & Publish Safety' },
        { match: /(public-file safety|associated assets|project assets|asset library)/i, key: 'assets', label: 'Project Asset Safety' },
        { match: /(add asset|add public asset)/i, key: 'asset-upload', label: 'Add Public Asset' },
        { match: /(replace file|replace asset)/i, key: 'asset-replace', label: 'Replace Asset' },
        { match: /(ai portfolio review)/i, key: 'portfolio-review', label: 'AI Portfolio Review' },
        { match: /(proposal history|exact proposed operations|approval boundary|proposal summary)/i, key: 'page-ai', label: 'Page-aware AI Proposal' },
        { match: /(related references)/i, key: 'related-references', label: 'Related References' },
        { match: /(ai-assisted edit|ask for a larger change|page-aware ai)/i, key: 'page-ai', label: 'Page-aware AI' },
        { match: /(visible page content|edit page copy|current visible content|live local preview|current page)/i, key: 'general-content', label: 'Visible Page Editing' },
        { match: /(project content|edit project|current project)/i, key: 'save-project', label: 'Project Editing' },
        { match: /(private page notes|private project notes|private workspace)/i, key: 'privacy', label: 'Private vs. Public Storage' },
        { match: /(original private source|notes and status|resource actions|reference item)/i, key: 'reference-library', label: 'Reference Library' },
        { match: /(sanitized derivative|sanitized draft|sanitization review)/i, key: 'sanitization', label: 'Sanitization Review' },
        { match: /(ask ai about this resource|ai resource analysis|resource analysis)/i, key: 'reference-ai', label: 'AI Resource Analysis' },
        { match: /(approved source context|content brief|ai planning boundary|ai plan proposal|proposed structure|experience design|controlled build|current content plan|build proposal|human review|create locally|local build review)/i, key: 'create-content', label: 'Create Content Lab' },
        { match: /(advanced ai drafting|prepared request|file review|attachments)/i, key: 'ai-file-review', label: 'AI File Review Safety' },
        { match: /(ai settings|model|provider|ai assistance)/i, key: 'ai-assistance', label: 'AI Assistance' },
        { match: /(manage tools|review and maintain existing content|choose a page to edit|what do you want to do)/i, key: 'maintenance', label: 'Portfolio Manager Workflow' },
    ];

    function majorSectionOwnsHelp(section) {
        return Array.from(section.querySelectorAll('[data-help-key]')).some((node) => {
            const owner = node.closest('.dashboard-card, .git-safety-banner, .release-box');
            return owner === section;
        });
    }

    function sectionHelpRule(section, pageRule) {
        const headingParts = Array.from(section.querySelectorAll('h2, h3, .eyebrow, summary strong'))
            .slice(0, 8)
            .map((node) => node.textContent.trim())
            .filter(Boolean);
        const text = headingParts.join(' · ');
        const matched = sectionHelpRules.find((item) => item.match.test(text));
        if (matched) return matched;
        if (pageRule) return pageRule;
        return { key: 'maintenance', label: 'Portfolio Manager Workflow' };
    }

    function addContextualSectionHelp() {
        if (!drawer) return;
        const pageRule = currentPageHelpRule();
        const sections = document.querySelectorAll('main .dashboard-card, .git-safety-banner, .release-box');

        sections.forEach((section) => {
            if (section.classList.contains('v2-small-card') || majorSectionOwnsHelp(section)) return;

            const rule = sectionHelpRule(section, pageRule);
            const button = makeHelpButton(rule.key, rule.label, 'contextual-section-help');
            if (!button) return;

            const directActionRow = Array.from(section.children).find((child) => child.classList && child.classList.contains('action-title-row'));
            if (directActionRow) {
                directActionRow.append(button);
                return;
            }

            const anchor = document.createElement('div');
            anchor.className = 'contextual-section-help-anchor';
            anchor.style.display = 'flex';
            anchor.style.justifyContent = 'flex-end';
            anchor.style.marginBottom = '4px';
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
