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
                message = 'Publish committed main changes to GitHub?\n\nThis pushes local main to origin/main. GitHub Pages can deploy the committed public portfolio changes after this step. No force-push is used.';
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
