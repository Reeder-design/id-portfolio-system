(() => {
  const viewButtons = [...document.querySelectorAll('[data-hm-expertise-view]')];
  const panels = [...document.querySelectorAll('[data-hm-expertise-panel]')];
  const helpers = [...document.querySelectorAll('.hm-helper')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactQuery = window.matchMedia('(max-width: 980px)');
  const shell = document.querySelector('.hm-shell');
  const library = document.querySelector('.hm-library');
  const questionList = document.querySelector('[data-hm-question-list]');
  const specialistList = document.querySelector('[data-hm-specialist-list]');
  const chatPanel = document.querySelector('.hm-chat-panel');
  const chatLog = document.querySelector('[data-hm-chat-log]');
  const starterWrap = document.querySelector('.hm-starter-wrap');
  let mobileLibrary = null;
  let mobileDock = null;
  let rebuildTimer = null;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const showView = (view) => {
    viewButtons.forEach((button) => {
      const active = button.dataset.hmExpertiseView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.hmExpertisePanel === view;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
  };

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.hmExpertiseView));
  });

  helpers.forEach((helper) => {
    helper.addEventListener('toggle', () => {
      if (!helper.open) return;
      helpers.forEach((other) => {
        if (other !== helper) other.open = false;
      });
    });
  });

  document.addEventListener('click', (event) => {
    helpers.forEach((helper) => {
      if (helper.open && !helper.contains(event.target)) helper.open = false;
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    helpers.forEach((helper) => { helper.open = false; });
  });

  const smoothScroll = (target, block = 'start') => {
    target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block });
  };

  const closeOtherMobileGroups = (opened) => {
    mobileLibrary?.querySelectorAll('.hm-mobile-question-group').forEach((group) => {
      if (group !== opened) group.open = false;
    });
  };

  const questionRecords = () => [...(questionList?.querySelectorAll('.hm-question-card') || [])].map((button) => ({
    id: button.dataset.questionId,
    category: button.querySelector('span')?.textContent.trim() || 'Interview Questions',
    label: button.querySelector('strong')?.textContent.trim() || button.textContent.trim(),
    type: 'standard'
  })).filter((item) => item.id);

  const specialistRecords = () => [...(specialistList?.querySelectorAll('.hm-specialist-question') || [])].map((button) => ({
    id: button.dataset.hmSpecialistId,
    category: 'Deep Dive',
    label: button.querySelector('span')?.textContent.trim() || button.textContent.trim(),
    type: 'specialist'
  })).filter((item) => item.id);

  const clickOriginalQuestion = (record) => {
    const collection = record.type === 'specialist'
      ? [...(specialistList?.querySelectorAll('[data-hm-specialist-id]') || [])]
      : [...(questionList?.querySelectorAll('[data-question-id]') || [])];
    const original = collection.find((button) => {
      return record.type === 'specialist'
        ? button.dataset.hmSpecialistId === record.id
        : button.dataset.questionId === record.id;
    });
    original?.click();
  };

  const mobileGroupMarkup = (category, records, specialist = false) => `
    <details class="hm-mobile-question-group" ${specialist ? 'data-hm-mobile-specialist' : ''}>
      <summary>
        <strong>${escapeHtml(category)}</strong>
        <span class="hm-mobile-question-count">${records.length}</span>
        <span class="hm-mobile-question-chevron" aria-hidden="true">+</span>
      </summary>
      <div class="hm-mobile-question-items">
        ${records.map((record) => `<button type="button" data-hm-mobile-question="${escapeHtml(record.id)}" data-hm-mobile-type="${escapeHtml(record.type)}">${escapeHtml(record.label)}</button>`).join('')}
      </div>
    </details>`;

  const buildMobileLibrary = () => {
    if (!library || !questionList) return;
    const standard = questionRecords();
    if (!standard.length) return;

    if (!mobileLibrary) {
      mobileLibrary = document.createElement('div');
      mobileLibrary.className = 'hm-mobile-library';
      mobileLibrary.setAttribute('aria-label', 'Collapsible interview question library');
      library.appendChild(mobileLibrary);
    }

    const grouped = new Map();
    standard.forEach((record) => {
      if (!grouped.has(record.category)) grouped.set(record.category, []);
      grouped.get(record.category).push(record);
    });

    const specialist = specialistRecords();
    mobileLibrary.innerHTML = `
      <div class="hm-mobile-library-intro">
        <span>Open one topic at a time, then tap a question to send it to Ask Haley.</span>
        <strong>${standard.length + specialist.length} prompts</strong>
      </div>
      ${[...grouped.entries()].map(([category, records]) => mobileGroupMarkup(category, records)).join('')}
      ${specialist.length ? mobileGroupMarkup('Deep Dive', specialist, true) : ''}`;

    mobileLibrary.querySelectorAll('.hm-mobile-question-group').forEach((group) => {
      group.addEventListener('toggle', () => {
        if (group.open) closeOtherMobileGroups(group);
      });
    });

    mobileLibrary.querySelectorAll('[data-hm-mobile-question]').forEach((button) => {
      button.addEventListener('click', () => {
        const record = {
          id: button.dataset.hmMobileQuestion,
          type: button.dataset.hmMobileType || 'standard'
        };
        clickOriginalQuestion(record);
        button.closest('details')?.removeAttribute('open');
        if (compactQuery.matches && chatPanel) {
          window.setTimeout(() => smoothScroll(chatPanel), reducedMotion ? 0 : 80);
        }
      });
    });
  };

  const scheduleMobileLibraryBuild = () => {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(buildMobileLibrary, 40);
  };

  [questionList, specialistList].filter(Boolean).forEach((node) => {
    new MutationObserver(scheduleMobileLibraryBuild).observe(node, { childList: true, subtree: true });
  });

  const setupMobileDock = () => {
    if (!shell || !library || !chatPanel || mobileDock) return;
    mobileDock = document.createElement('nav');
    mobileDock.className = 'hm-mobile-chat-dock';
    mobileDock.setAttribute('aria-label', 'Hiring guide section navigation');
    mobileDock.innerHTML = `
      <button type="button" data-hm-mobile-jump="questions">Browse questions</button>
      <button type="button" data-hm-mobile-jump="chat">Ask Haley</button>`;
    shell.parentElement.insertBefore(mobileDock, shell);

    const buttons = [...mobileDock.querySelectorAll('[data-hm-mobile-jump]')];
    const setActive = (name) => {
      buttons.forEach((button) => button.classList.toggle('active', button.dataset.hmMobileJump === name));
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const isChat = button.dataset.hmMobileJump === 'chat';
        setActive(isChat ? 'chat' : 'questions');
        smoothScroll(isChat ? chatPanel : library);
      });
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (!compactQuery.matches) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(visible.target === chatPanel ? 'chat' : 'questions');
      }, { threshold: [0.15, 0.35, 0.6], rootMargin: '-8% 0px -55% 0px' });
      observer.observe(library);
      observer.observe(chatPanel);
    }

    setActive('questions');
  };

  const setupSuggestionToggle = () => {
    if (!starterWrap || starterWrap.querySelector('.hm-mobile-suggestions-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hm-mobile-suggestions-toggle';
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Suggested questions';
    starterWrap.prepend(button);
    button.addEventListener('click', () => {
      const open = starterWrap.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(open));
    });
  };

  document.querySelectorAll('.hm-explore-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (compactQuery.matches && href === '#deep-dive') {
        const specialistGroup = mobileLibrary?.querySelector('[data-hm-mobile-specialist]');
        if (specialistGroup) {
          event.preventDefault();
          specialistGroup.open = true;
          closeOtherMobileGroups(specialistGroup);
          smoothScroll(specialistGroup);
          history.replaceState(null, '', href);
          return;
        }
      }

      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      smoothScroll(target);
      history.replaceState(null, '', href);
    });
  });

  // Keep the bounded message viewport pinned to the newest exchange even when
  // evidence cards finish laying out after an answer is inserted.
  if (chatLog) {
    new MutationObserver(() => {
      requestAnimationFrame(() => {
        chatLog.scrollTop = chatLog.scrollHeight;
      });
    }).observe(chatLog, { childList: true, subtree: true });
  }

  setupMobileDock();
  setupSuggestionToggle();
  buildMobileLibrary();
  window.addEventListener('load', scheduleMobileLibraryBuild, { once: true });
  compactQuery.addEventListener?.('change', () => {
    scheduleMobileLibraryBuild();
    if (!compactQuery.matches && starterWrap) starterWrap.classList.remove('is-open');
  });

  showView('capabilities');
})();
