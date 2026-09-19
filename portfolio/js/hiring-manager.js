(() => {
  const root = new URL('../', window.location.href);
  const urls = {
    faq: new URL('data/hiring-faq.json', root),
    expanded: new URL('data/hiring-faq-expanded.json', root),
    specialist: new URL('data/hiring-faq-specialist.json', root),
    capabilities: new URL('data/hiring-capabilities.json', root),
    tools: new URL('data/hiring-tools.json', root),
    search: new URL('data/hiring-search.json', root)
  };

  const pixelRoot = new URL('assets/icons/pixel/hiring-guide/', root);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SESSION_KEY = 'ask-haley-session-v1';

  const state = {
    questions: [],
    searchEntries: [],
    capabilities: [],
    tools: [],
    learningStatement: '',
    activeTopic: 'Featured',
    activeCapability: null,
    activeTool: null,
    activeScanView: 'capabilities',
    replying: false,
    chatStarted: false,
    expandedChips: {},
    lastEvidence: null
  };

  const STOP_WORDS = new Set([
    'a','an','and','are','about','can','do','does','did','for','from','have','has','how','i','in','is','me','my','of','on','or','show','tell','the','to','what','where','with','you','your'
  ]);

  const STARTER_IDS = [
    'why-hire-me',
    'end-to-end-project',
    'sales-enablement',
    'ai-evaluation',
    'lms-migration'
  ];

  const CAPABILITY_ICONS = {
    'learning-architecture': 'target.webp',
    'enterprise-tech': 'workflow-tree.webp',
    'accessible-ux': 'checklist-document.webp',
    'ai-automation': 'idea-bulb.webp',
    'performance-consulting': 'goal-mountain.webp',
    'delivery-leadership': 'team.webp'
  };

  const TOOL_ICONS = [
    'browser-conversation.webp',
    'document-star.webp',
    'checklist-clipboard.webp',
    'workflow-tree.webp',
    'analytics-growth.webp',
    'chat-bubbles.webp',
    'reference-search.webp',
    'idea-bulb.webp',
    'team.webp'
  ];


  const CAPABILITY_VISUALS = {
    'learning-architecture': { caption: 'Need → practice → evidence', nodes: [['target.webp','Need'],['checklist-document.webp','Practice'],['document-star.webp','Evidence']] },
    'enterprise-tech': { caption: 'Platform → workflow → learner', nodes: [['browser-conversation.webp','Platform'],['workflow-tree.webp','Workflow'],['person-woman.webp','Learner']] },
    'accessible-ux': { caption: 'Navigate → access → use', nodes: [['checklist-document.webp','Navigate'],['person-man.webp','Access'],['target.webp','Use']] },
    'ai-automation': { caption: 'Constrain → automate → QA', nodes: [['idea-bulb.webp','Constrain'],['workflow-tree.webp','Automate'],['checklist-clipboard.webp','QA']] },
    'performance-consulting': { caption: 'Diagnose → support → improve', nodes: [['goal-mountain.webp','Diagnose'],['reference-search.webp','Support'],['analytics-growth.webp','Improve']] },
    'delivery-leadership': { caption: 'Align → review → launch', nodes: [['team.webp','Align'],['checklist-clipboard.webp','Review'],['calendar.webp','Launch']] }
  };

  const TOOL_VISUALS = {
    authoring: { caption: 'Design → build → test', nodes: [['idea-bulb.webp','Design'],['browser-conversation.webp','Build'],['checklist-document.webp','Test']] },
    multimedia: { caption: 'Concept → media → polish', nodes: [['idea-bulb.webp','Concept'],['video-call.webp','Media'],['star.webp','Polish']] },
    lms: { caption: 'Configure → validate → support', nodes: [['workflow-tree.webp','Configure'],['checklist-clipboard.webp','Validate'],['person-woman.webp','Support']] },
    integrations: { caption: 'System → handoff → QA', nodes: [['browser-conversation.webp','System'],['workflow-tree.webp','Handoff'],['checklist-document.webp','QA']] },
    systems: { caption: 'Collect → automate → report', nodes: [['folder-cursor.webp','Collect'],['workflow-tree.webp','Automate'],['analytics-growth.webp','Report']] },
    web: { caption: 'Prototype → interact → refine', nodes: [['browser-conversation.webp','Prototype'],['chat-bubbles.webp','Interact'],['star.webp','Refine']] },
    'learning-data': { caption: 'Track → structure → analyze', nodes: [['checklist-document.webp','Track'],['workflow-tree.webp','Structure'],['analytics-growth.webp','Analyze']] },
    accessibility: { caption: 'Navigate → perceive → use', nodes: [['person-man.webp','Navigate'],['checklist-document.webp','Perceive'],['target.webp','Use']] },
    ai: { caption: 'Prompt → evaluate → verify', nodes: [['idea-bulb.webp','Prompt'],['checklist-clipboard.webp','Evaluate'],['reference-search.webp','Verify']] },
    collaboration: { caption: 'Align → review → deliver', nodes: [['team.webp','Align'],['chat-bubbles.webp','Review'],['calendar.webp','Deliver']] }
  };

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const normalize = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokensFor = (value) => normalize(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

  const scoreQuestion = (query, question) => {
    const clean = normalize(query);
    if (!clean) return 0;
    const prompt = normalize(question.prompt);
    const label = normalize(question.short_label);
    const category = normalize(question.category);
    const keywords = normalize((question.keywords || []).join(' '));
    const variants = normalize((question.variants || []).join(' '));
    const answer = normalize(question.answer);
    let score = 0;

    if (prompt.includes(clean) || clean.includes(prompt)) score += 16;
    if (label.includes(clean) || clean.includes(label)) score += 12;
    if (keywords.includes(clean)) score += 9;
    if (variants.includes(clean)) score += 8;

    tokensFor(query).forEach((token) => {
      if (label.includes(token)) score += 5;
      if (prompt.includes(token)) score += 4;
      if (keywords.includes(token)) score += 4;
      if (variants.includes(token)) score += 3;
      if (category.includes(token)) score += 2;
      if (answer.includes(token)) score += 1;
    });

    return score;
  };

  const scoreSearchEntry = (query, entry) => {
    const clean = normalize(query);
    const title = normalize(entry.title);
    const summary = normalize(entry.summary);
    const keywords = normalize((entry.keywords || []).join(' '));
    let score = 0;
    if (!clean) return score;
    if (title.includes(clean) || clean.includes(title)) score += 12;
    if (keywords.includes(clean)) score += 7;
    tokensFor(query).forEach((token) => {
      if (title.includes(token)) score += 5;
      if (keywords.includes(token)) score += 3;
      if (summary.includes(token)) score += 1;
    });
    return score;
  };

  const elements = {
    count: document.querySelector('[data-hm-question-count]'),
    libraryToggle: document.querySelector('[data-hm-library-toggle]'),
    library: document.querySelector('[data-hm-library]'),
    libraryClose: document.querySelector('[data-hm-library-close]'),
    librarySummary: document.querySelector('[data-hm-library-summary]'),
    topicList: document.querySelector('[data-hm-topic-list]'),
    promptPanel: document.querySelector('[data-hm-prompt-panel]'),
    starters: document.querySelector('[data-hm-starters]'),
    chatLog: document.querySelector('[data-hm-chat-log]'),
    form: document.querySelector('[data-hm-form]'),
    input: document.querySelector('[data-hm-input]'),
    clear: document.querySelector('[data-hm-clear]'),
    scanButtons: [...document.querySelectorAll('[data-hm-scan-view]')],
    scanPanels: [...document.querySelectorAll('[data-hm-scan-panel]')],
    capabilityTabs: document.querySelector('[data-hm-capability-tabs]'),
    capabilityDetail: document.querySelector('[data-hm-capability-detail]'),
    toolTabs: document.querySelector('[data-hm-tool-tabs]'),
    toolDetail: document.querySelector('[data-hm-tool-detail]'),
    learningStatement: document.querySelector('[data-hm-learning-statement] p'),
    evidenceDrawer: document.querySelector('[data-hm-evidence-drawer]'),
    evidenceOverlay: document.querySelector('[data-hm-evidence-overlay]'),
    evidenceClose: document.querySelector('[data-hm-evidence-close]'),
    evidenceTitle: document.querySelector('[data-hm-evidence-title]'),
    evidenceType: document.querySelector('[data-hm-evidence-type]'),
    evidenceSummary: document.querySelector('[data-hm-evidence-summary]'),
    evidenceNote: document.querySelector('[data-hm-evidence-note]'),
    evidenceVisual: document.querySelector('[data-hm-evidence-visual]'),
    evidenceOpen: document.querySelector('[data-hm-evidence-open]'),
    evidenceChat: document.querySelector('[data-hm-evidence-chat]')
  };

  if (!elements.chatLog || !elements.form || !elements.input || !elements.starters) return;

  const pixelUrl = (name) => new URL(name, pixelRoot).href;

  const safeSessionRead = () => {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  };

  const saveSession = () => {
    try {
      const payload = {
        chatStarted: state.chatStarted,
        chatHtml: elements.chatLog.innerHTML,
        chatScrollTop: elements.chatLog.scrollTop,
        activeCapability: state.activeCapability,
        activeTool: state.activeTool,
        activeScanView: state.activeScanView,
        expandedChips: state.expandedChips,
        lastEvidence: state.lastEvidence,
        updatedAt: Date.now()
      };
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (error) {
      // sessionStorage is a progressive enhancement; the chat still works without it.
    }
  };

  const clearSession = () => {
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch (error) {}
  };

  const categoryFromPath = (path) => {
    const value = String(path || '').toLowerCase();
    if (value.includes('ai-training')) return 'AI Training + Evaluation';
    if (value.includes('lms-administration')) return 'LMS + Learning Operations';
    if (value.includes('workflows')) return 'Systems + Workflow';
    if (value.includes('live-training')) return 'Live Training';
    if (value.includes('microlearning')) return 'Microlearning';
    if (value.includes('instructional-design')) return 'Instructional Design';
    return 'Portfolio project';
  };

  const visualMarkup = (visual) => {
    if (!visual) return '';
    return `
      <div class="hm-scan-visual" aria-label="${escapeHtml(visual.caption)}">
        <span class="hm-scan-visual-caption">${escapeHtml(visual.caption)}</span>
        <div class="hm-scan-visual-route">
          ${visual.nodes.map(([icon,label]) => `
            <span class="hm-scan-node"><i><img src="${pixelUrl(icon)}" alt=""></i><small>${escapeHtml(label)}</small></span>
          `).join('')}
        </div>
      </div>`;
  };

  const chipGroupMarkup = (values, visibleCount, key) => {
    const list = Array.isArray(values) ? values : [];
    const expanded = Boolean(state.expandedChips[key]);
    const shown = expanded ? list : list.slice(0, visibleCount);
    const remaining = Math.max(0, list.length - visibleCount);
    return `
      <div class="hm-chip-group">
        ${shown.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}
        ${remaining ? `<button type="button" class="hm-more-toggle" data-hm-expand-key="${escapeHtml(key)}">${expanded ? 'Show less' : `+${remaining} more`}</button>` : ''}
      </div>`;
  };

  const bindExpandButtons = (rootNode) => {
    rootNode.querySelectorAll('[data-hm-expand-key]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.hmExpandKey;
        state.expandedChips[key] = !state.expandedChips[key];
        saveSession();
        if (key.startsWith('cap:')) renderCapability(state.activeCapability);
        else renderTool(state.activeTool);
      });
    });
  };

  const closeEvidencePreview = ({ returnToChat = false } = {}) => {
    if (!elements.evidenceDrawer || !elements.evidenceOverlay) return;
    elements.evidenceDrawer.classList.remove('open');
    elements.evidenceDrawer.setAttribute('aria-hidden', 'true');
    elements.evidenceOverlay.hidden = true;
    document.body.classList.remove('hm-preview-open');
    if (returnToChat) {
      document.querySelector('#ask-haley')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => elements.input?.focus(), reducedMotion ? 0 : 280);
    }
  };

  const hydrateEvidencePreview = async (item) => {
    const target = new URL(item.path, root);
    elements.evidenceTitle.textContent = item.title || 'Portfolio project';
    elements.evidenceType.textContent = categoryFromPath(item.path);
    elements.evidenceNote.textContent = item.note || 'This public project supports the answer you were reviewing.';
    elements.evidenceSummary.textContent = 'Loading the public project summary…';
    elements.evidenceVisual.innerHTML = `<div class="hm-evidence-preview-placeholder"><span class="hm-icon-bubble"><img src="${pixelUrl('reference-search.webp')}" alt=""></span><span>Loading project preview…</span></div>`;
    const fullUrl = new URL(target.href);
    fullUrl.searchParams.set('from', 'ask-haley');
    elements.evidenceOpen.href = fullUrl.href;
    elements.evidenceChat.textContent = state.chatStarted ? 'Back to chat' : 'Start chat';

    try {
      const response = await fetch(target.href);
      if (!response.ok) throw new Error('Preview fetch failed');
      const markup = await response.text();
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      const description = doc.querySelector('meta[name="description"]')?.content || doc.querySelector('main p')?.textContent?.trim();
      const metaImage = doc.querySelector('meta[property="og:image"]')?.content;
      const imageNode = doc.querySelector('main img[src*="project-images"], .page-hero img[src], .flagship-hero img[src], main img[src]');
      const imageSrc = metaImage || imageNode?.getAttribute('src');
      if (description) elements.evidenceSummary.textContent = description;
      else elements.evidenceSummary.textContent = 'Open the full project for the complete public case study and interaction details.';
      if (imageSrc) {
        const resolved = new URL(imageSrc, target.href).href;
        elements.evidenceVisual.innerHTML = `<img src="${escapeHtml(resolved)}" alt="Preview of ${escapeHtml(item.title || 'portfolio project')}">`;
      } else {
        elements.evidenceVisual.innerHTML = `<div class="hm-evidence-preview-placeholder"><span class="hm-icon-bubble"><img src="${pixelUrl('document-star.webp')}" alt=""></span><span>Public case study preview</span></div>`;
      }
    } catch (error) {
      elements.evidenceSummary.textContent = 'Open the full project for the complete public case study and interaction details.';
      elements.evidenceVisual.innerHTML = `<div class="hm-evidence-preview-placeholder"><span class="hm-icon-bubble"><img src="${pixelUrl('document-star.webp')}" alt=""></span><span>Public case study preview</span></div>`;
    }
  };

  const openEvidencePreview = (item) => {
    if (!elements.evidenceDrawer || !elements.evidenceOverlay) return;
    state.lastEvidence = item;
    saveSession();
    elements.evidenceOverlay.hidden = false;
    elements.evidenceDrawer.classList.add('open');
    elements.evidenceDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hm-preview-open');
    hydrateEvidencePreview(item);
    window.setTimeout(() => elements.evidenceClose?.focus(), 20);
  };

  const bindEvidenceCards = (rootNode) => {
    rootNode.querySelectorAll('[data-hm-evidence-card]').forEach((card) => {
      card.addEventListener('click', () => openEvidencePreview({
        title: card.dataset.evidenceTitle,
        path: card.dataset.evidencePath,
        note: card.dataset.evidenceNote
      }));
    });
  };

  const scrollChat = () => {
    requestAnimationFrame(() => {
      elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
    });
  };

  const setLibraryOpen = (open) => {
    const isOpen = Boolean(open);
    if (elements.library) elements.library.hidden = !isOpen;
    if (elements.libraryToggle) elements.libraryToggle.setAttribute('aria-expanded', String(isOpen));
  };

  const appendUser = (text) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-user';
    article.innerHTML = `
      <div class="hm-message-label">Hiring manager</div>
      <div class="hm-message-bubble">${escapeHtml(text)}</div>`;
    elements.chatLog.appendChild(article);
    state.chatStarted = true;
    scrollChat();
    saveSession();
  };

  const evidenceMarkup = (items = []) => {
    if (!items.length) return '';
    return `
      <div class="hm-evidence">
        <p class="hm-evidence-label">Portfolio evidence</p>
        <div class="hm-evidence-grid">
          ${items.map((item) => `
            <button type="button" class="hm-evidence-card" data-hm-evidence-card data-evidence-path="${escapeHtml(item.path)}" data-evidence-title="${escapeHtml(item.title)}" data-evidence-note="${escapeHtml(item.note || '')}">
              <img src="${pixelUrl('document-star.webp')}" alt="">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.note)}</span>
              <em>Preview evidence →</em>
            </button>`).join('')}
        </div>
      </div>`;
  };
  const followupMarkup = (question) => {
    let related = (question.followups || [])
      .map((id) => state.questions.find((item) => item.id === id))
      .filter(Boolean);

    if (!related.length) {
      related = state.questions
        .filter((item) => item.id !== question.id && item.category === question.category)
        .slice(0, 3);
    } else {
      related = related.slice(0, 3);
    }

    if (!related.length) return '';
    return `
      <div class="hm-followups">
        <span>Keep the interview going</span>
        <div>
          ${related.map((item) => `<button type="button" data-hm-question-id="${escapeHtml(item.id)}">${escapeHtml(item.short_label)}</button>`).join('')}
        </div>
      </div>`;
  };

  const typingMessage = () => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley hm-typing-message';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble"><span class="hm-typing" aria-label="Preparing answer"><i></i><i></i><i></i></span></div>`;
    elements.chatLog.appendChild(article);
    scrollChat();
    return article;
  };

  const bindQuestionButtons = (rootNode) => {
    rootNode.querySelectorAll('[data-hm-question-id]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.hmQuestionId));
    });
  };

  const answerNow = (question, typing) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    const tag = question.specialist ? 'Deep Dive' : question.category;
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">${escapeHtml(tag)}</span>
        <p>${escapeHtml(question.answer)}</p>
        ${evidenceMarkup(question.evidence)}
        ${followupMarkup(question)}
      </div>`;
    typing.replaceWith(article);
    bindQuestionButtons(article);
    bindEvidenceCards(article);
    state.replying = false;
    scrollChat();
    saveSession();
  };

  const fallbackNow = (query, typing) => {
    const matches = state.searchEntries
      .map((entry) => ({ entry, score: scoreSearchEntry(query, entry) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.entry);

    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">Evidence check</span>
        <p>I do not have a supported interview answer for that exact question, so I would rather point you toward the closest published work than make something up.</p>
        ${matches.length ? `
          <div class="hm-evidence">
            <p class="hm-evidence-label">Closest portfolio matches</p>
            <div class="hm-evidence-grid">
              ${matches.map((entry) => `
                <button type="button" class="hm-evidence-card" data-hm-evidence-card data-evidence-path="${escapeHtml(entry.path)}" data-evidence-title="${escapeHtml(entry.title)}" data-evidence-note="${escapeHtml(entry.summary)}">
                  <img src="${pixelUrl('reference-search.webp')}" alt="">
                  <strong>${escapeHtml(entry.title)}</strong>
                  <span>${escapeHtml(entry.summary)}</span>
                  <em>Preview evidence →</em>
                </button>`).join('')}
            </div>
          </div>` : '<p>Try asking about instructional design, sales enablement, LMS work, AI evaluation, facilitation, reporting, collaboration, tools, or automation.</p>'}
      </div>`;
    typing.replaceWith(article);
    bindEvidenceCards(article);
    state.replying = false;
    scrollChat();
    saveSession();
  };
  const ask = (query, options = {}) => {
    const clean = String(query || '').trim();
    if (!clean || state.replying) return;
    setLibraryOpen(false);
    if (!options.skipUser) appendUser(clean);

    const ranked = state.questions
      .map((question) => ({ question, score: scoreQuestion(clean, question) }))
      .sort((a, b) => b.score - a.score);

    state.replying = true;
    const typing = typingMessage();
    const delay = reducedMotion ? 0 : 300;
    window.setTimeout(() => {
      if (ranked[0] && ranked[0].score >= 6) answerNow(ranked[0].question, typing);
      else fallbackNow(clean, typing);
    }, delay);
  };

  const askById = (id) => {
    if (state.replying) return;
    const question = state.questions.find((item) => item.id === id);
    if (!question) return;
    appendUser(question.prompt);
    state.replying = true;
    setLibraryOpen(false);
    const typing = typingMessage();
    window.setTimeout(() => answerNow(question, typing), reducedMotion ? 0 : 260);
  };

  const resetChat = ({ clearStoredSession = true } = {}) => {
    state.replying = false;
    state.chatStarted = false;
    state.lastEvidence = null;
    elements.chatLog.innerHTML = '';
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">Start anywhere</span>
        <p>Ask me the question you would normally save for the interview. I can answer from the curated library and link you to the portfolio work behind the answer.</p>
      </div>`;
    elements.chatLog.appendChild(article);
    if (clearStoredSession) clearSession();
  };
  const topicGroups = () => {
    const groups = new Map();
    const featured = state.questions.filter((question) => question.featured && !question.specialist);
    if (featured.length) groups.set('Featured', featured);

    state.questions.filter((question) => !question.specialist).forEach((question) => {
      if (!groups.has(question.category)) groups.set(question.category, []);
      groups.get(question.category).push(question);
    });

    const deepDive = state.questions.filter((question) => question.specialist);
    if (deepDive.length) groups.set('Deep Dive', deepDive);
    return [...groups.entries()].map(([label, questions]) => ({ label, questions }));
  };

  const renderPromptPanel = () => {
    if (!elements.promptPanel) return;
    const groups = topicGroups();
    const group = groups.find((item) => item.label === state.activeTopic) || groups[0];
    if (!group) return;

    elements.promptPanel.innerHTML = `
      <div class="hm-prompt-heading">
        <p class="eyebrow">${escapeHtml(group.label)}</p>
        <h4>${group.label === 'Featured' ? 'Good questions to start with' : `${escapeHtml(group.label)} questions`}</h4>
      </div>
      <div class="hm-prompt-list">
        ${group.questions.map((question) => `
          <button type="button" class="hm-library-prompt" data-hm-library-question="${escapeHtml(question.id)}">${escapeHtml(question.prompt)}</button>
        `).join('')}
      </div>`;

    elements.promptPanel.querySelectorAll('[data-hm-library-question]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.hmLibraryQuestion));
    });
  };

  const renderLibrary = () => {
    const groups = topicGroups();
    if (!groups.length || !elements.topicList) return;
    if (!groups.some((item) => item.label === state.activeTopic)) state.activeTopic = groups[0].label;

    elements.topicList.innerHTML = groups.map((group) => `
      <button type="button" class="hm-topic-button ${group.label === state.activeTopic ? 'active' : ''}" data-hm-topic="${escapeHtml(group.label)}">
        <span>${escapeHtml(group.label)}</span><span>${group.questions.length}</span>
      </button>
    `).join('');

    elements.topicList.querySelectorAll('[data-hm-topic]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeTopic = button.dataset.hmTopic;
        renderLibrary();
      });
    });

    renderPromptPanel();
    if (elements.librarySummary) {
      const totalTopics = groups.length;
      elements.librarySummary.textContent = `${state.questions.length} curated prompts across ${totalTopics} topics`;
    }
  };

  const renderStarters = () => {
    const preferred = STARTER_IDS
      .map((id) => state.questions.find((item) => item.id === id))
      .filter(Boolean);

    const fill = state.questions
      .filter((item) => item.featured && !preferred.some((chosen) => chosen.id === item.id))
      .slice(0, Math.max(0, 5 - preferred.length));

    const starters = [...preferred, ...fill].slice(0, 5);
    elements.starters.innerHTML = starters.map((question) => `
      <button type="button" class="hm-starter" data-hm-question-id="${escapeHtml(question.id)}">${escapeHtml(question.short_label)}</button>
    `).join('');
    bindQuestionButtons(elements.starters);
  };

  const renderCapability = (id) => {
    const item = state.capabilities.find((capability) => capability.id === id) || state.capabilities[0];
    if (!item || !elements.capabilityDetail) return;
    state.activeCapability = item.id;
    const icon = CAPABILITY_ICONS[item.id] || 'target.webp';
    const visual = CAPABILITY_VISUALS[item.id] || CAPABILITY_VISUALS['learning-architecture'];
    elements.capabilityDetail.innerHTML = `
      <div class="hm-scan-detail-head">
        <span class="hm-icon-bubble hm-scan-detail-icon"><img src="${pixelUrl(icon)}" alt=""></span>
        <div>
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <h3>${escapeHtml(item.headline)}</h3>
        </div>
      </div>
      <div class="hm-scan-detail-body">
        <div class="hm-scan-copy">
          <span class="hm-scan-label">How this shows up in my work</span>
          <p>${escapeHtml(item.proof)}</p>
          ${chipGroupMarkup(item.skills, 5, `cap:${item.id}`)}
        </div>
        ${visualMarkup(visual)}
      </div>`;
    bindExpandButtons(elements.capabilityDetail);
    elements.capabilityTabs?.querySelectorAll('[data-hm-capability]').forEach((button) => {
      const active = button.dataset.hmCapability === item.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    saveSession();
  };

  const renderCapabilities = () => {
    if (!elements.capabilityTabs || !state.capabilities.length) return;
    elements.capabilityTabs.innerHTML = state.capabilities.map((item) => {
      const icon = CAPABILITY_ICONS[item.id] || 'target.webp';
      return `
        <button type="button" role="tab" aria-selected="false" class="hm-capability-tab" data-hm-capability="${escapeHtml(item.id)}">
          <span class="hm-tab-icon-bubble"><img src="${pixelUrl(icon)}" alt=""></span><span>${escapeHtml(item.label)}</span>
        </button>`;
    }).join('');
    elements.capabilityTabs.querySelectorAll('[data-hm-capability]').forEach((button) => {
      button.addEventListener('click', () => renderCapability(button.dataset.hmCapability));
    });
    renderCapability(state.activeCapability || state.capabilities[0].id);
  };
  const renderTool = (id) => {
    const item = state.tools.find((tool) => tool.id === id) || state.tools[0];
    if (!item || !elements.toolDetail) return;
    state.activeTool = item.id;
    const index = Math.max(0, state.tools.findIndex((tool) => tool.id === item.id));
    const icon = TOOL_ICONS[index % TOOL_ICONS.length];
    const visual = TOOL_VISUALS[item.id] || TOOL_VISUALS.authoring;
    elements.toolDetail.innerHTML = `
      <div class="hm-scan-detail-head">
        <span class="hm-icon-bubble hm-scan-detail-icon"><img src="${pixelUrl(icon)}" alt=""></span>
        <div>
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <h3>${escapeHtml(item.summary)}</h3>
        </div>
      </div>
      <div class="hm-scan-detail-body">
        <div class="hm-scan-copy">
          ${item.hands_on?.length ? `<span class="hm-scan-label">Hands-on</span>${chipGroupMarkup(item.hands_on, 6, `tool:${item.id}:hands`)}` : ''}
          ${item.capabilities?.length ? `<span class="hm-scan-label hm-scan-label-spaced">What I use it for</span>${chipGroupMarkup(item.capabilities, 5, `tool:${item.id}:caps`)}` : ''}
        </div>
        ${visualMarkup(visual)}
      </div>`;
    bindExpandButtons(elements.toolDetail);
    elements.toolTabs?.querySelectorAll('[data-hm-tool]').forEach((button) => {
      const active = button.dataset.hmTool === item.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    saveSession();
  };

  const renderTools = () => {
    if (!elements.toolTabs || !state.tools.length) return;
    elements.toolTabs.innerHTML = state.tools.map((item, index) => `
      <button type="button" role="tab" aria-selected="false" class="hm-tool-tab" data-hm-tool="${escapeHtml(item.id)}">
        <span class="hm-tab-icon-bubble"><img src="${pixelUrl(TOOL_ICONS[index % TOOL_ICONS.length])}" alt=""></span><span>${escapeHtml(item.label)}</span>
      </button>
    `).join('');
    elements.toolTabs.querySelectorAll('[data-hm-tool]').forEach((button) => {
      button.addEventListener('click', () => renderTool(button.dataset.hmTool));
    });
    renderTool(state.activeTool || state.tools[0].id);
    if (elements.learningStatement) elements.learningStatement.textContent = state.learningStatement;
  };
  const setScanView = (view) => {
    state.activeScanView = view;
    elements.scanButtons.forEach((button) => {
      const active = button.dataset.hmScanView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    elements.scanPanels.forEach((panel) => {
      const active = panel.dataset.hmScanPanel === view;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    saveSession();
  };

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = elements.input.value.trim();
    if (!value) return;
    elements.input.value = '';
    ask(value);
  });

  elements.clear?.addEventListener('click', () => resetChat({ clearStoredSession: true }));
  elements.evidenceClose?.addEventListener('click', () => closeEvidencePreview());
  elements.evidenceOverlay?.addEventListener('click', () => closeEvidencePreview());
  elements.evidenceChat?.addEventListener('click', () => closeEvidencePreview({ returnToChat: true }));
  elements.evidenceOpen?.addEventListener('click', () => saveSession());
  elements.libraryToggle?.addEventListener('click', () => {
    const open = elements.library?.hidden !== false;
    setLibraryOpen(open);
  });
  elements.libraryClose?.addEventListener('click', () => setLibraryOpen(false));
  elements.scanButtons.forEach((button) => {
    button.addEventListener('click', () => setScanView(button.dataset.hmScanView));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elements.evidenceDrawer?.classList.contains('open')) closeEvidencePreview();
    else if (event.key === 'Escape' && elements.library?.hidden === false) setLibraryOpen(false);
  });

  let chatScrollTimer = null;
  elements.chatLog.addEventListener('scroll', () => {
    window.clearTimeout(chatScrollTimer);
    chatScrollTimer = window.setTimeout(saveSession, 120);
  });
  window.addEventListener('beforeunload', saveSession);

  const load = async () => {
    try {
      const [faq, expanded, specialist, capabilities, tools, search] = await Promise.all(
        Object.values(urls).map((url) => fetch(url).then((response) => {
          if (!response.ok) throw new Error(`Could not load ${url.pathname}`);
          return response.json();
        }))
      );

      state.questions = [
        ...(faq.questions || []).map((item) => ({ ...item, specialist: false })),
        ...(expanded.questions || []).map((item) => ({ ...item, specialist: false })),
        ...(specialist.questions || []).map((item) => ({ ...item, specialist: true }))
      ];
      state.searchEntries = search.entries || [];
      state.capabilities = capabilities.pillars || [];
      state.tools = tools.groups || [];
      state.learningStatement = tools.learning_statement || '';

      if (elements.count) elements.count.textContent = state.questions.length;
      const saved = safeSessionRead();
      if (saved) {
        state.chatStarted = Boolean(saved.chatStarted);
        state.activeCapability = saved.activeCapability || null;
        state.activeTool = saved.activeTool || null;
        state.activeScanView = saved.activeScanView || 'capabilities';
        state.expandedChips = saved.expandedChips || {};
        state.lastEvidence = saved.lastEvidence || null;
      }
      renderLibrary();
      renderStarters();
      renderCapabilities();
      renderTools();
      setScanView(state.activeScanView || 'capabilities');
      if (saved?.chatStarted && saved.chatHtml) {
        elements.chatLog.innerHTML = saved.chatHtml;
        bindQuestionButtons(elements.chatLog);
        bindEvidenceCards(elements.chatLog);
        requestAnimationFrame(() => { elements.chatLog.scrollTop = Number(saved.chatScrollTop || 0); });
      } else {
        resetChat({ clearStoredSession: false });
      }
      const params = new URL(window.location.href).searchParams;
      if (params.get('resume') === '1') {
        window.setTimeout(() => document.querySelector('#ask-haley')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), reducedMotion ? 0 : 180);
      }
    } catch (error) {
      console.error(error);
      elements.chatLog.innerHTML = '<article class="hm-message hm-message-haley"><div class="hm-message-label">Guide unavailable</div><div class="hm-message-bubble"><p>The interview library could not load. Please use the project pages or résumé links instead.</p></div></article>';
    }
  };

  load();
})();
