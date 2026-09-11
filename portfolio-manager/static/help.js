(() => {
    const drawer = document.querySelector('[data-help-drawer]');
    const backdrop = document.querySelector('[data-help-backdrop]');
    const body = document.querySelector('[data-help-body]');
    const title = document.querySelector('[data-help-title]');

    function openDrawer(key = null, label = null) {
        if (!drawer || !body) return;
        if (key) {
            const template = document.querySelector(`[data-help-template="${key}"]`);
            if (template) body.innerHTML = template.innerHTML;
        }
        if (title) title.textContent = label || 'Portfolio Manager Help';
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

    document.addEventListener('click', (event) => {
        const opener = event.target.closest('[data-help-open]');
        if (opener) {
            openDrawer();
            return;
        }

        const topic = event.target.closest('[data-help-key]');
        if (topic) {
            openDrawer(topic.dataset.helpKey, topic.dataset.helpLabel || null);
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
                message = 'Regenerate this standard page?\n\nThis replaces its generated public HTML using the latest structured project data. It will NOT commit, push, merge, or publish anything.';
            } else if (kind === 'version') {
                const level = submitter ? submitter.value : 'selected';
                message = `Create a ${level} version release?\n\nThis updates local version history, changelog, and a version snapshot. It will NOT commit, push, merge, or publish anything.`;
            } else if (kind === 'remove-asset') {
                message = 'Remove this public asset?\n\nPortfolio Manager will remove its structured project association and local file, then run validation. If another public page still depends on the file, the removal is rolled back. This does NOT commit, push, merge, or publish anything.';
            } else if (kind === 'general-save') {
                message = 'Save these general page copy edits?\n\nThis updates the structured general-page source and approved text locations in public HTML on your local branch. Validation runs immediately and rolls back both files if it fails. This does NOT commit, push, merge, or publish anything.';
            } else if (kind === 'git-sync-main') {
                message = 'Sync local main with origin/main?\n\nPortfolio Manager uses fast-forward-only pull. If Git would need a merge commit, the sync fails instead. No local edits are discarded.';
            } else if (kind === 'git-create-branch') {
                message = 'Create and switch to this feature branch?\n\nThis changes only your local Git branch. Nothing is pushed or published.';
            } else if (kind === 'git-stage') {
                message = 'Stage the selected files?\n\nStaging chooses what will be included in the next commit. It does not commit, push, merge, or publish anything.';
            } else if (kind === 'git-commit') {
                message = 'Run full validation and create this commit?\n\nThe commit is blocked if validation fails. A successful commit remains local until you explicitly push the feature branch.';
            } else if (kind === 'git-push') {
                message = 'Push this feature branch to GitHub?\n\nThis sends committed branch changes to origin. Portfolio Manager blocks pushes to main and never force-pushes.';
            } else if (kind === 'git-create-pr') {
                message = 'Create this pull request on GitHub?\n\nThis opens a review request from your feature branch into main. Portfolio Manager still cannot merge it.';
            } else if (kind === 'ai-delete-proposal') {
                message = 'Delete this private AI proposal?\n\nThis removes only the Git-ignored local proposal record. It does not change portfolio files, Git history, or anything already copied elsewhere.';
            }

            if (message && !window.confirm(message)) {
                event.preventDefault();
            }
        });
    });

    const helpSearch = document.querySelector('[data-help-search]');
    if (helpSearch) {
        const sections = Array.from(document.querySelectorAll('[data-guide-section]'));
        helpSearch.addEventListener('input', () => {
            const query = helpSearch.value.trim().toLowerCase();
            sections.forEach((section) => {
                section.hidden = Boolean(query) && !section.textContent.toLowerCase().includes(query);
            });
        });
    }
})();
