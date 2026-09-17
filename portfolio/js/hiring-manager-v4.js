(() => {
  const viewButtons = [...document.querySelectorAll('[data-hm-expertise-view]')];
  const panels = [...document.querySelectorAll('[data-hm-expertise-panel]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactQuery = window.matchMedia('(max-width: 980px)');
  const shell = document.querySelector('.hm-shell');
  const library = document.querySelector('.hm-library');
  const chatPanel = document.querySelector('.hm-chat-panel');
  const chatLog = document.querySelector('[data-hm-chat-log]');
  const starterWrap = document.querySelector('.hm-starter-wrap');
  const libraryHelper = library?.querySelector('.hm-helper') || null;
  const helpers = [...document.querySelectorAll('.hm-helper')].filter((helper) => helper !== libraryHelper);
  let mobileDock = null;

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

  const closeQuestionOverlays = () => {
    document.dispatchEvent(new CustomEvent('hm:close-question-overlays'));
  };

  const smoothScroll = (target, block = 'start') => {
    target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block });
  };

  const setupMobileDock = () => {
    if (!shell || !library || !chatPanel || mobileDock) return;
    mobileDock = document.createElement('nav');
    mobileDock.className = 'hm-mobile-chat-dock';
    mobileDock.setAttribute('aria-label', 'Hiring guide section navigation');
    mobileDock.innerHTML = `
      <button type="button" data-hm-mobile-jump="questions">Browse questions</button>
      <button type="button" data-hm-mobile-jump="chat">Ask Haley</button>`;
    shell.parentElement?.insertBefore(mobileDock, shell);

    const buttons = [...mobileDock.querySelectorAll('[data-hm-mobile-jump]')];
    const setActive = (name) => {
      buttons.forEach((button) => button.classList.toggle('active', button.dataset.hmMobileJump === name));
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const isChat = button.dataset.hmMobileJump === 'chat';
        setActive(isChat ? 'chat' : 'questions');
        closeQuestionOverlays();
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
      if (!href) return;

      if (href === '#deep-dive') {
        event.preventDefault();
        closeQuestionOverlays();
        smoothScroll(library);
        window.setTimeout(() => {
          const deepDive = document.querySelector('[data-hm-v5-topic="Deep Dive"]');
          deepDive?.click();
        }, reducedMotion ? 0 : 120);
        history.replaceState(null, '', href);
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      closeQuestionOverlays();
      smoothScroll(target);
      history.replaceState(null, '', href);
    });
  });

  if (chatLog) {
    new MutationObserver(() => {
      requestAnimationFrame(() => {
        chatLog.scrollTop = chatLog.scrollHeight;
      });
    }).observe(chatLog, { childList: true, subtree: true });
  }

  setupMobileDock();
  setupSuggestionToggle();
  showView('capabilities');

  compactQuery.addEventListener?.('change', () => {
    closeQuestionOverlays();
    if (!compactQuery.matches && starterWrap) starterWrap.classList.remove('is-open');
  });
})();
