(() => {
  const root = new URL('../', window.location.href);
  const faqUrl = new URL('data/hiring-faq.json', root);
  const searchUrl = new URL('data/hiring-search.json', root);

  const state = {
    questions: [],
    searchEntries: [],
    activeCategory: 'All',
    lastQuestionId: null
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

  if (!chatLog || !form || !input || !questionList || !categoryList || !starterList) return;

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
        <span>Good follow-up questions</span>
        <div>
          ${related.map((question) => `<button type="button" data-question-id="${escapeHtml(question.id)}">${escapeHtml(question.short_label)}</button>`).join('')}
        </div>
      </div>`;
  };

  const appendHaleyAnswer = (question) => {
    state.lastQuestionId = question.id;
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Portfolio Haley</div>
      <div class="hm-message-bubble">
        <p>${escapeHtml(question.answer)}</p>
        ${evidenceMarkup(question.evidence)}
        ${followupMarkup(question.followups)}
      </div>`;
    chatLog.appendChild(article);
    article.querySelectorAll('[data-question-id]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.questionId));
    });
    scrollChat();
  };

  const appendFallback = (query) => {
    const matches = state.searchEntries
      .map((entry) => ({ entry, score: scoreSearchEntry(query, entry) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.entry);

    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Portfolio Haley</div>
      <div class="hm-message-bubble">
        <p>I do not have a prewritten interview answer for that exact question, so I would rather point you to the closest published work than invent an answer.</p>
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
          </div>` : '<p class="hm-chat-note">Try asking about instructional design, technical sales training, LMS work, AI evaluation, facilitation, reporting, or automation.</p>'}
      </div>`;
    chatLog.appendChild(article);
    scrollChat();
  };

  const askQuestion = (query, options = {}) => {
    const clean = String(query || '').trim();
    if (!clean) return;
    if (!options.skipUserMessage) appendUserMessage(clean);

    const ranked = state.questions
      .map((question) => ({ question, score: scoreQuestion(clean, question) }))
      .sort((a, b) => b.score - a.score);

    if (ranked[0] && ranked[0].score >= 6) appendHaleyAnswer(ranked[0].question);
    else appendFallback(clean);
  };

  const askById = (id) => {
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
    const starters = state.questions.filter((question) => question.featured).slice(0, 8);
    starterList.innerHTML = starters.map((question) => `
      <button type="button" data-question-id="${escapeHtml(question.id)}">${escapeHtml(question.short_label)}</button>`).join('');
    starterList.querySelectorAll('[data-question-id]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.questionId));
    });
  };

  const resetConversation = () => {
    state.lastQuestionId = null;
    chatLog.innerHTML = `
      <article class="hm-message hm-message-haley">
        <div class="hm-message-label">Portfolio Haley</div>
        <div class="hm-message-bubble">
          <p>Hi — I’m a curated portfolio version of Haley. Ask me the kinds of questions you would ask in a first-round instructional design interview. My answers come from published portfolio content, and I will link you to the evidence behind them.</p>
          <p class="hm-chat-note"><strong>Good place to start:</strong> ask about an end-to-end project, technical training, sales enablement, LMS work, AI evaluation, or automation.</p>
        </div>
      </article>`;
    scrollChat();
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
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
    fetch(searchUrl).then((response) => {
      if (!response.ok) throw new Error('Portfolio search unavailable');
      return response.json();
    })
  ])
    .then(([faqData, searchData]) => {
      state.questions = Array.isArray(faqData.questions) ? faqData.questions : [];
      state.searchEntries = Array.isArray(searchData.entries) ? searchData.entries : [];
      renderCategories();
      renderQuestionLibrary();
      renderStarters();
      resetConversation();
    })
    .catch(() => {
      chatLog.innerHTML = `
        <article class="hm-message hm-message-haley">
          <div class="hm-message-label">Portfolio guide</div>
          <div class="hm-message-bubble"><p>The interview guide could not load its public data. You can still browse the Projects page or open the résumé.</p></div>
        </article>`;
      form.querySelector('button[type="submit"]').disabled = true;
      input.disabled = true;
    });
})();
