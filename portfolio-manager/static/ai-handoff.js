(() => {
    const params = new URLSearchParams(window.location.search);
    const proposalId = params.get('ai_proposal');
    if (!proposalId) return;

    const endpoint = `/ai/proposals/${encodeURIComponent(proposalId)}/draft.json`;

    function element(tag, className = '', text = '') {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function fieldLabel(control) {
        if (control.id) {
            const label = document.querySelector(`label[for="${CSS.escape(control.id)}"]`);
            if (label) return label.textContent.trim();
        }
        return control.name.replace(/^visible__|^script__/, '').replaceAll('_', ' ');
    }

    function showError(message) {
        const host = document.querySelector('main') || document.querySelector('.manager-shell');
        if (!host) return;
        const note = element('section', 'flash-stack');
        const item = element('div', 'flash-message error', message);
        note.appendChild(item);
        host.prepend(note);
    }

    function buildStagePanel(payload, controls) {
        const panel = element('section', 'dashboard-card v2-ai-edit-panel');
        panel.dataset.aiHandoffPanel = 'true';

        const eyebrow = element('p', 'eyebrow', 'AI proposal · staged draft');
        const heading = element('h2', '', payload.headline || 'AI Proposal');
        const intro = element(
            'p',
            'section-copy',
            'Choose a field and insert the draft. This changes only the unsaved editor form. Review the field normally, then use Save when you are ready.'
        );
        panel.append(eyebrow, heading, intro);

        const preview = document.createElement('textarea');
        preview.rows = 7;
        preview.readOnly = true;
        preview.value = payload.draft_text || '';
        preview.setAttribute('aria-label', 'Staged AI draft');
        panel.appendChild(preview);

        const label = document.createElement('label');
        label.textContent = 'Insert into';
        const select = document.createElement('select');
        select.dataset.aiHandoffTarget = 'true';
        controls.forEach((control) => {
            const option = document.createElement('option');
            option.value = control.name;
            option.textContent = fieldLabel(control);
            select.appendChild(option);
        });
        label.appendChild(select);
        panel.appendChild(label);

        const actions = element('div', 'button-row');
        const insertButton = element('button', 'btn btn-primary', 'Insert Draft into Field');
        insertButton.type = 'button';
        const undoButton = element('button', 'btn btn-secondary', 'Undo Insert');
        undoButton.type = 'button';
        undoButton.hidden = true;
        const backLink = element('a', 'btn btn-secondary', 'Back to AI Proposal');
        backLink.href = `/ai/proposals/${encodeURIComponent(proposalId)}`;
        actions.append(insertButton, undoButton, backLink);
        panel.appendChild(actions);

        const status = element('p', 'field-help', 'Nothing has been inserted or saved yet.');
        panel.appendChild(status);

        let lastControl = null;
        let previousValue = '';

        insertButton.addEventListener('click', () => {
            const target = controls.find((control) => control.name === select.value);
            if (!target) return;
            lastControl = target;
            previousValue = target.value;
            target.value = payload.draft_text || '';
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.focus({ preventScroll: true });
            undoButton.hidden = false;
            status.textContent = 'Draft inserted into the editor but NOT saved. Review or edit the field, then use the normal Save flow when ready.';
        });

        undoButton.addEventListener('click', () => {
            if (!lastControl) return;
            lastControl.value = previousValue;
            lastControl.dispatchEvent(new Event('input', { bubbles: true }));
            lastControl.dispatchEvent(new Event('change', { bubbles: true }));
            lastControl.focus();
            status.textContent = 'The staged insertion was undone. Nothing was saved.';
            undoButton.hidden = true;
            lastControl = null;
        });

        return panel;
    }

    function stageInEditor(payload) {
        const pageForm = document.querySelector('form.v2-copy-form');
        const projectForm = Array.from(document.querySelectorAll('form.form-grid')).find((form) =>
            form.action.includes('/content/projects/') && form.action.endsWith('/save')
        );
        const form = pageForm || projectForm;
        if (!form) return false;

        let controls = [];
        if (pageForm) {
            controls = Array.from(form.querySelectorAll('input[type="text"][name], textarea[name]')).filter((control) =>
                control.name.startsWith('visible__') || control.name.startsWith('script__')
            );
        } else {
            const allowed = new Set([
                'summary',
                'business_need',
                'audience',
                'role',
                'learning_objectives',
                'design_approach',
                'development_process',
                'outcomes',
                'skills',
                'tools',
            ]);
            controls = Array.from(form.querySelectorAll('input[type="text"][name], textarea[name]')).filter((control) =>
                allowed.has(control.name) && !control.hidden
            );
        }

        if (!controls.length) {
            showError('This editor does not currently expose a compatible text field for the staged AI draft.');
            return true;
        }

        const panel = buildStagePanel(payload, controls);
        form.parentNode.insertBefore(panel, form);
        return true;
    }

    function prefillContentBrief(payload) {
        const form = document.querySelector('form[action$="/create/new"]');
        if (!form) return false;
        const fields = payload.brief_prefill || {};
        Object.entries(fields).forEach(([name, value]) => {
            const control = form.elements.namedItem(name);
            if (!control || typeof value !== 'string') return;
            if (!String(control.value || '').trim()) control.value = value;
        });

        const panel = element('section', 'dashboard-card full-width v2-warning-card');
        panel.dataset.aiHandoffPanel = 'true';
        panel.append(
            element('p', 'eyebrow', 'AI proposal · private draft context'),
            element('h2', '', 'Content Brief prefilled for review'),
            element(
                'p',
                'section-copy',
                'Proposal-supported details were placed into this unsaved brief to save you retyping. Review every field, change anything you want, and use Create Content Brief only when the direction is accurate.'
            )
        );
        const back = element('a', 'btn btn-secondary', 'Back to AI Proposal');
        back.href = `/ai/proposals/${encodeURIComponent(proposalId)}`;
        panel.appendChild(back);
        const card = form.closest('section.dashboard-card');
        if (card && card.parentNode) card.parentNode.insertBefore(panel, card);
        return true;
    }

    fetch(endpoint, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then((response) => {
            if (!response.ok) throw new Error('The staged AI proposal could not be loaded.');
            return response.json();
        })
        .then((payload) => {
            if (prefillContentBrief(payload)) return;
            if (stageInEditor(payload)) return;
            showError('This screen cannot accept the staged AI proposal. Return to the proposal and choose another destination.');
        })
        .catch((error) => showError(error.message || 'The staged AI proposal could not be loaded.'));
})();
