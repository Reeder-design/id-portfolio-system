(() => {
  const root = new URL('../', window.location.href);
  const faqUrl = new URL('data/hiring-faq.json', root);
  const expandedFaqUrl = new URL('data/hiring-faq-expanded.json', root);
  const toolsUrl = new URL('data/hiring-tools.json', root);
  const searchUrl = new URL('data/hiring-search.json', root);
  const iconSprite = new URL('assets/icons/portfolio-icons.svg', root).href;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    questions: [],
    searchEntries: [],
    tools: [],
    learningStatement: '',
    activeCategory: 'All',
    activeTool: null,
    lastQuestionId: null,
    isReplying: false
  };

  const STOP_WORDS = new Set([
    'a','an','and','are','about','can','do','does','did','for','from','have','has','how','i','in','is','me','my','of','on','or','show','tell','the','to','what','where','with','you','your'
  ]);

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
    const answer = normalize(question.answer);
    const queryTokens = tokensFor(query);
    let score = 0;

    if (prompt.includes(clean) || clean.includes(prompt)) score += 14;
    if (label.includes(clean) || clean.includes(label)) score += 10;
    if (keywords.includes(clean)) score += 8;

    queryTokens.forEach((token) => {
      if (label.includes(token)) score += 5;
      if (prompt.includes(token)) score += 4;
      if (keywords.includes(token)) score += 3;
      if (category.includes(token)) score += 2;
      if (answer.includes(token)) score += 1;
    });

    return score;
  };

  const scoreSearchEntry = (query, entry) => {
    const clean = normalize(query);
    const tokens = tokensFor(query);
    if (!clean) return 0;
    const title = normalize(entry.title);
    const summary = normalize(entry.summary);
    const keywords = normalize((entry.keywords || []).join(' '));
    let score = 0;
    if (title.includes(clean) || clean.includes(title)) score += 12;
    if (keywords.includes(clean)) score += 7;
    tokens.forEach((token) => {
      if (title.includes(token)) score += 5;
      if (keywords.includes(token)) score += 3;
      if (summary.includes(token)) score += 1;
    });
    return score;
  };

  const chatLog = document.querySelector('[data-hm-chat-log]');
  const form = document.querySelector('[data-hm-form]');
  const input = document.querySelector('[data-hm-input]');
  const questionList = document.querySelector('[data-hm-question-list]');
  const categoryList = document.querySelector('[data-hm-categories]');
  const starterList = document.querySelector('[data-hm-starters]');
  const clearButton = document.querySelector('[data-hm-clear]');
  const toolTabs = document.querySelector('[data-hm-tool-tabs]');
  const toolPanel = document.querySelector('[data-hm-tool-panel]');
  const learningStatement = document.querySelector('[data-hm-learning-statement] p');

  if (!chatLog || !form || !input || !questionList || !categoryList || !starterList) return;

  const animateMessage = (article) => {
    article.classList.add('is-entering');
  };

  const scrollChat = () => {
    requestAnimationFrame(() => {
      chatLog.scrollTop = chatLog.scrollHeight;
    });
  };

  const appendUserMessage = (text) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-user';
    article.innerHTML = `
      <div class="hm-message-label">Hiring manager</div>
      <div class="hm-message-bubble">${escapeHtml(text)}</div>`;
    chatLog.appendChild(article);
    animateMessage(article);
    scrollChat();
  };

  const evidenceMarkup = (evidence = []) => {
    if (!evidence.length) return '';
    return `
      <div class="hm-evidence">
        <p class="hm-evidence-label">Portfolio evidence</p>
        <div class="hm-evidence-grid">
          ${evidence.map((item) => `
            <a class="hm-evidence-card" href="${new URL(item.path, root).href}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.note)}</span>
              <em>Open evidence →</em>
            </a>`).join('')}
        </div>
      </div>`;
  };

  const followupMarkup = (ids = []) => {
    const related = ids
      .map((id) => state.questions.find((question) => question.id === id))
      .filter(Boolean)
      .slice(0, 3);
    if (!related.length) return '';
    return `
      <div class="hm-followups">
        <span>Go one level deeper</span>
        <div>
          ${related.map((question) => `<button type="button" data-question-id="${escapeHtml(question.id)}">${escapeHtml(question.short_label)}</button>`).join('')}
        </div>
      </div>`;
  };

  const createTypingMessage = () => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley is-entering hm-typing-message';
    article.innerHTML = `
      <div class="hm-message-label">Portfolio Haley</div>
      <div class="hm-message-bubble"><span class="hm-typing" aria-label="Preparing answer"><span></span><span></span><span></span></span></div>`;
    chatLog.appendChild(article);
    scrollChat();
    return article;
  };

  const appendHaleyAnswerNow = (question, typingNode = null) => {
    state.lastQuestionId = question.id;
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Portfolio Haley · ${escapeHtml(question.category)}</div>
      <div class="hm-message-bubble">
        <p>${escapeHtml(question.answer)}</p>
        ${evidenceMarkup(question.evidence)}
        ${followupMarkup(question.followups)}
      </div>`;
    if (typingNode) typingNode.replaceWith(article);
    else chatLog.appendChild(article);
    article.querySelectorAll('[data-question-id]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.questionId));
    });
    animateMessage(article);
    state.isReplying = false;
    scrollChat();
  };

  const appendHaleyAnswer = (question) => {
    if (state.isReplying) return;
    state.isReplying = true;
    const typingNode = createTypingMessage();
    const delay = reducedMotion ? 0 : 360;
    window.setTimeout(() => appendHaleyAnswerNow(question, typingNode), delay);
  };

  const appendFallbackNow = (query, matches, typingNode = null) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Portfolio Haley · Evidence check</div>
      <div class="hm-message-bubble">
        <p>I do not have a supported interview answer for that exact question, so I would rather point you to the closest published work than make something up.</p>
        ${matches.length ? `
          <div class="hm-evidence">
            <p class="hm-evidence-label">Closest portfolio matches</p>
            <div class="hm-evidence-grid">
              ${matches.map((entry) => `
                <a class="hm-evidence-card" href="${new URL(entry.path, root).href}">
                  <strong>${escapeHtml(entry.title)}</strong>
                  <span>${escapeHtml(entry.summary)}</span>
                  <em>Open evidence →</em>
                </a>`).join('')}
            </div>
          </div>` : '<p class="hm-chat-note">Try asking about instructional design, technical sales training, tools, LMS work, AI evaluation, facilitation, reporting, collaboration, or automation.</p>'}
      </div>`;
    if (typingNode) typingNode.replaceWith(article);
    else chatLog.appendChild(article);
    animateMessage(article);
    state.isReplying = false;
    scrollChat();
  };

  const appendFallback = (query) => {
    if (state.isReplying) return;
    state.isReplying = true;
    const matches = state.searchEntries
      .map((entry) => ({ entry, score: scoreSearchEntry(query, entry) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.entry);
    const typingNode = createTypingMessage();
    const delay = reducedMotion ? 0 : 280;
    window.setTimeout(() => appendFallbackNow(query, matches, typingNode), delay);
  };

  const askQuestion = (query, options = {}) => {
    const clean = String(query || '').trim();
    if (!clean || state.isReplying) return;
    if (!options.skipUserMessage) appendUserMessage(clean);

    const ranked = state.questions
      .map((question) => ({ question, score: scoreQuestion(clean, question) }))
      .sort((a, b) => b.score - a.score);

    if (ranked[0] && ranked[0].score >= 6) appendHaleyAnswer(ranked[0].question);
    else appendFallback(clean);
  };

  const askById = (id) => {
    if (state.isReplying) return;
    const question = state.questions.find((item) => item.id === id);
    if (!question) return;
    appendUserMessage(question.prompt);
    appendHaleyAnswer(question);
  };

  const renderQuestionLibrary = () => {
    const visible = state.questions.filter((question) => state.activeCategory === 'All' || question.category === state.activeCategory);
    questionList.innerHTML = visible.map((question) => `
      <button class="hm-question-card" type="button" data-question-id="${escapeHtml(question.id)}">
        <span>${escapeHtml(question.category)}</span>
        <strong>${escapeHtml(question.short_label)}</strong>
      </button>`).join('');
    questionList.querySelectorAll('[data-question-id]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.questionId));
    });
  };

  const renderCategories = () => {
    const categories = ['All', ...new Set(state.questions.map((question) => question.category))];
    categoryList.innerHTML = categories.map((category) => `
      <button type="button" class="${category === state.activeCategory ? 'active' : ''}" data-category="${escapeHtml(category)}" aria-pressed="${String(category === state.activeCategory)}">${escapeHtml(category)}</button>`).join('');
    categoryList.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeCategory = button.dataset.category;
        renderCategories();
        renderQuestionLibrary();
      });
    });
  };

  const renderStarters = () => {
    const priorityIds = ['why-hire-me','end-to-end-project','technical-training','tool-choice','sme-pushback','learn-new-tools','self-critique','coding-automation'];
    const starters = priorityIds
      .map((id) => state.questions.find((question) => question.id === id))
      .filter(Boolean);
    starterList.innerHTML = starters.map((question) => `
      <button type="button" data-question-id="${escapeHtml(question.id)}">${escapeHtml(question.short_label)}</button>`).join('');
    starterList.querySelectorAll('[data-question-id]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.questionId));
    });
  };

  const renderToolPanel = (group) => {
    if (!toolPanel || !group) return;
    state.activeTool = group.id;
    const familiarity = Array.isArray(group.familiarity) && group.familiarity.length
      ? `<div class="hm-tool-familiarity"><strong>Additional platform familiarity:</strong> ${group.familiarity.map(escapeHtml).join(' · ')}</div>`
      : '';
    toolPanel.innerHTML = `
      <div class="hm-tool-panel-head">
        <span class="hm-tool-icon" aria-hidden="true"><svg class="portfolio-icon"><use href="${iconSprite}#${escapeHtml(group.icon)}"></use></svg></span>
        <div><p class="eyebrow">Capability Area</p><h3>${escapeHtml(group.label)}</h3><p>${escapeHtml(group.summary)}</p></div>
      </div>
      <div class="hm-tool-columns">
        <div class="hm-tool-column"><h4>Hands-on tools</h4><div class="hm-tool-chip-row">${(group.hands_on || []).map((item) => `<span class="hm-tool-chip">${escapeHtml(item)}</span>`).join('')}</div></div>
        <div class="hm-tool-column"><h4>What transfers across tools</h4><div class="hm-tool-chip-row">${(group.capabilities || []).map((item) => `<span class="hm-tool-chip capability">${escapeHtml(item)}</span>`).join('')}</div></div>
      </div>
      ${familiarity}`;
    toolTabs?.querySelectorAll('[data-tool-id]').forEach((button) => {
      const active = button.dataset.toolId === group.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  };

  const renderTools = () => {
    if (!toolTabs || !toolPanel || !state.tools.length) return;
    toolTabs.innerHTML = state.tools.map((group, index) => `
      <button class="hm-tool-tab ${index === 0 ? 'active' : ''}" type="button" role="tab" aria-selected="${String(index === 0)}" data-tool-id="${escapeHtml(group.id)}">
        <svg class="portfolio-icon" aria-hidden="true"><use href="${iconSprite}#${escapeHtml(group.icon)}"></use></svg>
        <span>${escapeHtml(group.label)}</span>
      </button>`).join('');
    toolTabs.querySelectorAll('[data-tool-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const group = state.tools.find((item) => item.id === button.dataset.toolId);
        renderToolPanel(group);
      });
    });
    renderToolPanel(state.tools[0]);
    if (learningStatement) learningStatement.textContent = state.learningStatement;
  };

  const resetConversation = () => {
    state.lastQuestionId = null;
    state.isReplying = false;
    chatLog.innerHTML = `
      <article class="hm-message hm-message-haley is-entering">
        <div class="hm-message-label">Portfolio Haley</div>
        <div class="hm-message-bubble">
          <p>Hi — use this like the part of an interview where you get past the résumé bullets. Ask what I actually owned, how I make tradeoffs, how I work with technical content and SMEs, what tools I use, what I would improve, or where I add value beyond building the course.</p>
          <p class="hm-chat-note"><strong>Try a stronger first question:</strong> “Why would I hire you?” or “What do you do when an SME wants everything in the course?”</p>
        </div>
      </article>`;
    scrollChat();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value || state.isReplying) return;
    askQuestion(value);
    input.value = '';
    input.focus();
  });

  clearButton?.addEventListener('click', resetConversation);

  Promise.all([
    fetch(faqUrl).then((response) => {
      if (!response.ok) throw new Error('Hiring FAQ unavailable');
      return response.json();
    }),
    fetch(expandedFaqUrl).then((response) => {
      if (!response.ok) throw new Error('Advanced hiring FAQ unavailable');
      return response.json();
    }),
    fetch(searchUrl).then((response) => {
      if (!response.ok) throw new Error('Portfolio search unavailable');
      return response.json();
    }),
    fetch(toolsUrl).then((response) => {
      if (!response.ok) throw new Error('Hiring tools unavailable');
      return response.json();
    })
  ])
    .then(([faqData, expandedData, searchData, toolsData]) => {
      const baseQuestions = Array.isArray(faqData.questions) ? faqData.questions : [];
      const advancedQuestions = Array.isArray(expandedData.questions) ? expandedData.questions : [];
      state.questions = [...baseQuestions, ...advancedQuestions];
      state.searchEntries = Array.isArray(searchData.entries) ? searchData.entries : [];
      state.tools = Array.isArray(toolsData.groups) ? toolsData.groups : [];
      state.learningStatement = toolsData.learning_statement || '';
      renderCategories();
      renderQuestionLibrary();
      renderStarters();
      renderTools();
      resetConversation();
    })
    .catch(() => {
      chatLog.innerHTML = `
        <article class="hm-message hm-message-haley is-entering">
          <div class="hm-message-label">Portfolio guide</div>
          <div class="hm-message-bubble"><p>The interview guide could not load its public data. You can still browse the Projects page or open the résumé.</p></div>
        </article>`;
      form.querySelector('button[type="submit"]').disabled = true;
      input.disabled = true;
    });
})();
