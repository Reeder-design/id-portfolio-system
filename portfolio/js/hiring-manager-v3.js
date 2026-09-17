(() => {
  const root = new URL('../', window.location.href);
  const specialistUrl = new URL('data/hiring-faq-specialist.json', root);
  const capabilitiesUrl = new URL('data/hiring-capabilities.json', root);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const chatLog = document.querySelector('[data-hm-chat-log]');
  const form = document.querySelector('[data-hm-form]');
  const input = document.querySelector('[data-hm-input]');
  const specialistList = document.querySelector('[data-hm-specialist-list]');
  const capabilityTabs = document.querySelector('[data-hm-capability-tabs]');
  const capabilityPanel = document.querySelector('[data-hm-capability-panel]');
  const modeButtons = [...document.querySelectorAll('[data-hm-v3-prompt]')];

  if (!chatLog || !form || !input) return;

  const state = {
    specialistQuestions: [],
    pillars: [],
    specialistReplying: false
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
    let score = 0;

    if (prompt.includes(clean) || clean.includes(prompt)) score += 16;
    if (label.includes(clean) || clean.includes(label)) score += 12;
    if (keywords.includes(clean)) score += 9;

    tokensFor(query).forEach((token) => {
      if (label.includes(token)) score += 5;
      if (prompt.includes(token)) score += 4;
      if (keywords.includes(token)) score += 4;
      if (category.includes(token)) score += 2;
      if (answer.includes(token)) score += 1;
    });

    return score;
  };

  const scrollChat = () => {
    requestAnimationFrame(() => {
      chatLog.scrollTop = chatLog.scrollHeight;
    });
  };

  const appendUser = (text) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-user is-entering';
    article.innerHTML = `
      <div class="hm-message-label">Hiring manager</div>
      <div class="hm-message-bubble">${escapeHtml(text)}</div>`;
    chatLog.appendChild(article);
    scrollChat();
  };

  const evidenceMarkup = (items = []) => {
    if (!items.length) return '';
    return `
      <div class="hm-evidence">
        <p class="hm-evidence-label">Portfolio evidence</p>
        <div class="hm-evidence-grid">
          ${items.map((item) => `
            <a class="hm-evidence-card" href="${new URL(item.path, root).href}">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.note)}</span>
              <em>Open evidence →</em>
            </a>`).join('')}
        </div>
      </div>`;
  };

  const relatedMarkup = (question) => {
    const related = state.specialistQuestions
      .filter((item) => item.id !== question.id)
      .filter((item) => item.category === question.category)
      .slice(0, 2);
    if (!related.length) return '';
    return `
      <div class="hm-followups">
        <span>Stay in this topic</span>
        <div>${related.map((item) => `<button type="button" data-hm-specialist-id="${escapeHtml(item.id)}">${escapeHtml(item.short_label)}</button>`).join('')}</div>
      </div>`;
  };

  const answerSpecialistNow = (question, typingNode) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Portfolio Haley · ${escapeHtml(question.category)}</div>
      <div class="hm-message-bubble">
        <span class="hm-specialist-answer-badge">Specialist answer</span>
        <p>${escapeHtml(question.answer)}</p>
        ${evidenceMarkup(question.evidence)}
        ${relatedMarkup(question)}
      </div>`;
    typingNode.replaceWith(article);
    requestAnimationFrame(() => article.classList.add('is-entering'));
    article.querySelectorAll('[data-hm-specialist-id]').forEach((button) => {
      button.addEventListener('click', () => askSpecialistById(button.dataset.hmSpecialistId));
    });
    state.specialistReplying = false;
    scrollChat();
  };

  const answerSpecialist = (question) => {
    if (state.specialistReplying || document.querySelector('.hm-typing-message')) return;
    state.specialistReplying = true;
    const typing = document.createElement('article');
    typing.className = 'hm-message hm-message-haley is-entering hm-typing-message';
    typing.innerHTML = `
      <div class="hm-message-label">Portfolio Haley · ${escapeHtml(question.category)}</div>
      <div class="hm-message-bubble"><span class="hm-typing" aria-label="Preparing answer"><span></span><span></span><span></span></span></div>`;
    chatLog.appendChild(typing);
    scrollChat();
    window.setTimeout(() => answerSpecialistNow(question, typing), reducedMotion ? 0 : 340);
  };

  const askSpecialist = (question, userText = question.prompt) => {
    if (!question || state.specialistReplying || document.querySelector('.hm-typing-message')) return;
    appendUser(userText);
    answerSpecialist(question);
  };

  const askSpecialistById = (id) => {
    const question = state.specialistQuestions.find((item) => item.id === id);
    askSpecialist(question);
  };

  const bestSpecialistMatch = (query) => {
    return state.specialistQuestions
      .map((question) => ({ question, score: scoreQuestion(query, question) }))
      .sort((a, b) => b.score - a.score)[0] || null;
  };

  const renderSpecialistList = () => {
    if (!specialistList) return;
    specialistList.innerHTML = state.specialistQuestions.map((question) => `
      <button class="hm-specialist-question" type="button" data-hm-specialist-id="${escapeHtml(question.id)}">
        <span>${escapeHtml(question.short_label)}</span><i aria-hidden="true">→</i>
      </button>`).join('');
    specialistList.querySelectorAll('[data-hm-specialist-id]').forEach((button) => {
      button.addEventListener('click', () => askSpecialistById(button.dataset.hmSpecialistId));
    });
  };

  const renderCapability = (pillar, index) => {
    if (!capabilityPanel || !pillar) return;
    capabilityPanel.classList.remove('is-entering');
    capabilityPanel.innerHTML = `
      <span class="hm-capability-index">${String(index + 1).padStart(2, '0')}</span>
      <p class="eyebrow">${escapeHtml(pillar.label)}</p>
      <h3>${escapeHtml(pillar.headline)}</h3>
      <p class="hm-capability-proof">${escapeHtml(pillar.proof)}</p>
      <div class="hm-capability-skills" aria-label="${escapeHtml(pillar.label)} skills">
        ${(pillar.skills || []).map((skill) => `<span class="hm-capability-skill">${escapeHtml(skill)}</span>`).join('')}
      </div>`;
    requestAnimationFrame(() => capabilityPanel.classList.add('is-entering'));
    capabilityTabs?.querySelectorAll('[data-hm-capability-id]').forEach((button) => {
      const active = button.dataset.hmCapabilityId === pillar.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  };

  const renderCapabilities = () => {
    if (!capabilityTabs || !capabilityPanel || !state.pillars.length) return;
    capabilityTabs.innerHTML = state.pillars.map((pillar, index) => `
      <button class="hm-capability-tab ${index === 0 ? 'active' : ''}" type="button" role="tab" aria-selected="${String(index === 0)}" data-hm-capability-id="${escapeHtml(pillar.id)}">${escapeHtml(pillar.label)}</button>`).join('');
    capabilityTabs.querySelectorAll('[data-hm-capability-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = state.pillars.findIndex((item) => item.id === button.dataset.hmCapabilityId);
        if (index >= 0) renderCapability(state.pillars[index], index);
      });
    });
    renderCapability(state.pillars[0], 0);
  };

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const prompt = button.dataset.hmV3Prompt || '';
      if (!prompt) return;
      input.value = prompt;
      form.requestSubmit();
    });
  });

  form.addEventListener('submit', (event) => {
    const query = input.value.trim();
    if (!query || !state.specialistQuestions.length) return;
    const match = bestSpecialistMatch(query);
    if (!match || match.score < 8) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.specialistReplying || document.querySelector('.hm-typing-message')) return;
    input.value = '';
    askSpecialist(match.question, query);
    input.focus();
  }, true);

  Promise.all([
    fetch(specialistUrl).then((response) => {
      if (!response.ok) throw new Error('Specialist interview content unavailable');
      return response.json();
    }),
    fetch(capabilitiesUrl).then((response) => {
      if (!response.ok) throw new Error('Capability data unavailable');
      return response.json();
    })
  ])
    .then(([specialistData, capabilityData]) => {
      state.specialistQuestions = Array.isArray(specialistData.questions) ? specialistData.questions : [];
      state.pillars = Array.isArray(capabilityData.pillars) ? capabilityData.pillars : [];
      renderSpecialistList();
      renderCapabilities();
    })
    .catch(() => {
      if (specialistList) specialistList.innerHTML = '<p class="hm-chat-note">Deep-dive prompts are temporarily unavailable.</p>';
      if (capabilityPanel) capabilityPanel.innerHTML = '<p class="hm-chat-note">Capability details are temporarily unavailable.</p>';
    });
})();
