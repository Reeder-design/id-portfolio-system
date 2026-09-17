(() => {
  const library = document.querySelector('.hm-library');
  const questionList = document.querySelector('[data-hm-question-list]');
  const specialistList = document.querySelector('[data-hm-specialist-list]');
  const chatPanel = document.querySelector('.hm-chat-panel');
  const categoryList = document.querySelector('[data-hm-categories]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!library || !questionList) return;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  let workspace = null;
  let renderTimer = null;
  const state = {
    open: false,
    activeTopic: null
  };

  const questionRecords = () => [...questionList.querySelectorAll('.hm-question-card')].map((button) => ({
    id: button.dataset.questionId,
    category: button.querySelector('span')?.textContent.trim() || 'Interview Questions',
    label: button.querySelector('strong')?.textContent.trim() || button.textContent.trim(),
    type: 'standard'
  })).filter((record) => record.id);

  const specialistRecords = () => [...(specialistList?.querySelectorAll('.hm-specialist-question') || [])].map((button) => ({
    id: button.dataset.hmSpecialistId,
    category: 'Deep Dive',
    label: button.querySelector('span')?.textContent.trim() || button.textContent.trim(),
    type: 'specialist'
  })).filter((record) => record.id);

  const groupedTopics = () => {
    const grouped = new Map();
    questionRecords().forEach((record) => {
      if (!grouped.has(record.category)) grouped.set(record.category, []);
      grouped.get(record.category).push(record);
    });

    const topics = [...grouped.entries()].map(([category, records]) => ({ category, records }));
    const specialist = specialistRecords();
    if (specialist.length) topics.push({ category: 'Deep Dive', records: specialist });
    return topics;
  };

  const clickOriginalQuestion = (record) => {
    const selector = record.type === 'specialist'
      ? `[data-hm-specialist-id="${CSS.escape(record.id)}"]`
      : `[data-question-id="${CSS.escape(record.id)}"]`;
    const source = record.type === 'specialist' ? specialistList : questionList;
    source?.querySelector(selector)?.click();
  };

  const ensureWorkspace = () => {
    if (workspace?.isConnected) return;
    workspace = document.createElement('div');
    workspace.className = 'hm-library-accordion';
    workspace.dataset.hmLibraryAccordion = '';

    if (categoryList?.parentElement === library) library.insertBefore(workspace, categoryList);
    else library.appendChild(workspace);
  };

  const closeDetail = () => {
    state.activeTopic = null;
    const detail = workspace?.querySelector('[data-hm-library-detail]');
    const selection = workspace?.querySelector('[data-hm-library-selection]');
    if (detail) detail.hidden = true;
    if (selection) selection.hidden = false;
  };

  const setOpen = (open) => {
    state.open = Boolean(open);
    const toggle = workspace?.querySelector('[data-hm-library-toggle]');
    const windowPanel = workspace?.querySelector('[data-hm-library-window]');
    if (toggle) toggle.setAttribute('aria-expanded', String(state.open));
    if (windowPanel) windowPanel.hidden = !state.open;
    if (!state.open) closeDetail();
  };

  const showTopic = (category) => {
    const topics = groupedTopics();
    const topic = topics.find((item) => item.category === category);
    if (!topic || !workspace) return;

    state.activeTopic = category;
    const selection = workspace.querySelector('[data-hm-library-selection]');
    const detail = workspace.querySelector('[data-hm-library-detail]');
    if (!selection || !detail) return;

    detail.innerHTML = `
      <div class="hm-library-detail-head">
        <div>
          <p class="eyebrow">${escapeHtml(topic.category)}</p>
          <h3>${escapeHtml(topic.category)} questions</h3>
          <p>${topic.records.length} curated prompt${topic.records.length === 1 ? '' : 's'} in this topic. Choose one to send it directly to Ask Haley.</p>
        </div>
        <button class="hm-library-detail-close" type="button" aria-label="Close ${escapeHtml(topic.category)} questions">×</button>
      </div>
      <div class="hm-library-prompt-list">
        ${topic.records.map((record) => `<button type="button" class="hm-library-prompt" data-hm-library-question="${escapeHtml(record.id)}" data-hm-library-question-type="${escapeHtml(record.type)}">${escapeHtml(record.label)}</button>`).join('')}
      </div>`;

    selection.hidden = true;
    detail.hidden = false;
    detail.scrollTop = 0;

    detail.querySelector('.hm-library-detail-close')?.addEventListener('click', closeDetail);
    detail.querySelectorAll('[data-hm-library-question]').forEach((button) => {
      button.addEventListener('click', () => {
        clickOriginalQuestion({
          id: button.dataset.hmLibraryQuestion,
          type: button.dataset.hmLibraryQuestionType || 'standard'
        });
        setOpen(false);
        if (chatPanel) {
          window.setTimeout(() => {
            chatPanel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
          }, reducedMotion ? 0 : 80);
        }
      });
    });
  };

  const renderWorkspace = () => {
    ensureWorkspace();
    const topics = groupedTopics();
    const promptCount = topics.reduce((total, topic) => total + topic.records.length, 0);

    if (!topics.length) {
      workspace.innerHTML = `
        <button class="hm-library-toggle" type="button" disabled aria-expanded="false">
          <span><strong>Browse question topics</strong><small>Loading curated interview prompts…</small></span>
          <span class="hm-library-toggle-icon" aria-hidden="true">⌄</span>
        </button>`;
      return;
    }

    workspace.innerHTML = `
      <button class="hm-library-toggle" type="button" data-hm-library-toggle aria-expanded="${String(state.open)}" aria-controls="hmLibraryWindow">
        <span><strong>Browse question topics</strong><small>${promptCount} curated prompts across ${topics.length} topics</small></span>
        <span class="hm-library-toggle-icon" aria-hidden="true">⌄</span>
      </button>
      <div class="hm-library-window" id="hmLibraryWindow" data-hm-library-window ${state.open ? '' : 'hidden'}>
        <div class="hm-library-selection" data-hm-library-selection>
          <div class="hm-library-window-intro">
            <strong>Choose a topic</strong>
            <span>Scroll through the library, then open a topic to see its suggested interview questions.</span>
          </div>
          <div class="hm-library-topic-list">
            ${topics.map((topic) => `
              <button class="hm-library-topic" type="button" data-hm-library-topic="${escapeHtml(topic.category)}">
                <span><strong>${escapeHtml(topic.category)}</strong><small>${topic.records.length} prompt${topic.records.length === 1 ? '' : 's'}</small></span>
                <span aria-hidden="true">→</span>
              </button>`).join('')}
          </div>
        </div>
        <article class="hm-library-detail" data-hm-library-detail hidden></article>
      </div>`;

    workspace.querySelector('[data-hm-library-toggle]')?.addEventListener('click', () => setOpen(!state.open));
    workspace.querySelectorAll('[data-hm-library-topic]').forEach((button) => {
      button.addEventListener('click', () => showTopic(button.dataset.hmLibraryTopic));
    });

    if (state.activeTopic) showTopic(state.activeTopic);
  };

  const scheduleRender = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderWorkspace, 80);
  };

  new MutationObserver(scheduleRender).observe(questionList, { childList: true, subtree: true });
  if (specialistList) new MutationObserver(scheduleRender).observe(specialistList, { childList: true, subtree: true });

  document.addEventListener('hm:close-question-workspace', () => setOpen(false));
  document.addEventListener('hm:open-question-topic', (event) => {
    const topic = event.detail?.topic;
    if (!topic) return;
    state.open = true;
    renderWorkspace();
    window.setTimeout(() => showTopic(topic), 0);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.activeTopic) closeDetail();
    else if (state.open) setOpen(false);
  });

  ensureWorkspace();
  renderWorkspace();
  window.addEventListener('load', scheduleRender, { once: true });
})();
