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
  let topicBrowser = null;
  let topicPopover = null;
  let topicAnchor = null;
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

  const smoothScroll = (target, block = 'start') => {
    target?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block });
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

  const closeTopicPopover = () => {
    if (!topicPopover) return;
    topicPopover.hidden = true;
    topicPopover.removeAttribute('data-placement');
    topicPopover.style.removeProperty('left');
    topicPopover.style.removeProperty('top');
    topicPopover.style.removeProperty('width');
    topicPopover.style.removeProperty('--hm-topic-arrow-x');
    topicAnchor = null;
    topicBrowser?.querySelectorAll('.hm-topic-bubble').forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const positionTopicPopover = () => {
    if (!topicPopover || topicPopover.hidden || !topicAnchor?.isConnected) return;

    const viewportPad = 12;
    const gap = 10;
    const anchorRect = topicAnchor.getBoundingClientRect();
    const width = Math.min(430, window.innerWidth - (viewportPad * 2));

    topicPopover.style.width = `${width}px`;
    topicPopover.style.left = `${viewportPad}px`;
    topicPopover.style.top = `${viewportPad}px`;

    const measuredHeight = Math.min(topicPopover.offsetHeight, window.innerHeight - (viewportPad * 2));
    const anchorCenter = anchorRect.left + (anchorRect.width / 2);
    let left = anchorCenter - (width / 2);
    left = Math.max(viewportPad, Math.min(left, window.innerWidth - width - viewportPad));

    const roomBelow = window.innerHeight - anchorRect.bottom - viewportPad;
    const roomAbove = anchorRect.top - viewportPad;
    let top;
    let placement;

    if (roomBelow >= measuredHeight + gap) {
      top = anchorRect.bottom + gap;
      placement = 'below';
    } else if (roomAbove >= measuredHeight + gap) {
      top = anchorRect.top - measuredHeight - gap;
      placement = 'above';
    } else {
      top = Math.max(viewportPad, Math.min(anchorRect.bottom + gap, window.innerHeight - measuredHeight - viewportPad));
      placement = 'viewport';
    }

    const arrowX = Math.max(18, Math.min(width - 18, anchorCenter - left));
    topicPopover.style.left = `${left}px`;
    topicPopover.style.top = `${top}px`;
    topicPopover.style.setProperty('--hm-topic-arrow-x', `${arrowX}px`);
    topicPopover.dataset.placement = placement;
  };

  const openTopic = (category, records, anchor) => {
    if (!topicPopover || !topicBrowser || !anchor) return;
    topicAnchor = anchor;
    topicPopover.innerHTML = `
      <div class="hm-topic-popover-head">
        <div>
          <strong>${escapeHtml(category)}</strong>
          <p>Choose a question to send it directly to Ask Haley.</p>
        </div>
        <button class="hm-topic-close" type="button" aria-label="Close ${escapeHtml(category)} questions">×</button>
      </div>
      <div class="hm-topic-prompts">
        ${records.map((record) => `<button class="hm-topic-prompt" type="button" data-hm-topic-question="${escapeHtml(record.id)}" data-hm-topic-type="${escapeHtml(record.type)}">${escapeHtml(record.label)}</button>`).join('')}
      </div>`;
    topicPopover.hidden = false;

    topicBrowser.querySelectorAll('.hm-topic-bubble').forEach((button) => {
      const active = button === anchor;
      button.classList.toggle('active', active);
      button.setAttribute('aria-expanded', String(active));
    });

    requestAnimationFrame(positionTopicPopover);

    topicPopover.querySelector('.hm-topic-close')?.addEventListener('click', closeTopicPopover);
    topicPopover.querySelectorAll('[data-hm-topic-question]').forEach((button) => {
      button.addEventListener('click', () => {
        clickOriginalQuestion({
          id: button.dataset.hmTopicQuestion,
          type: button.dataset.hmTopicType || 'standard'
        });
        closeTopicPopover();
        if (chatPanel) window.setTimeout(() => smoothScroll(chatPanel), reducedMotion ? 0 : 70);
      });
    });
  };

  const buildTopicBrowser = () => {
    if (!library || !questionList) return;
    const standard = questionRecords();
    if (!standard.length) return;

    const grouped = new Map();
    standard.forEach((record) => {
      if (!grouped.has(record.category)) grouped.set(record.category, []);
      grouped.get(record.category).push(record);
    });

    const specialist = specialistRecords();
    const topics = [...grouped.entries()].map(([category, records]) => ({ category, records }));
    if (specialist.length) topics.push({ category: 'Deep Dive', records: specialist });

    if (!topicBrowser) {
      topicBrowser = document.createElement('div');
      topicBrowser.className = 'hm-topic-browser';
      topicBrowser.setAttribute('aria-label', 'Interview topic browser');
      library.appendChild(topicBrowser);
    }

    if (!topicPopover) {
      topicPopover = document.createElement('div');
      topicPopover.className = 'hm-topic-popover';
      topicPopover.dataset.hmTopicPopover = '';
      topicPopover.hidden = true;
      document.body.appendChild(topicPopover);
    }

    closeTopicPopover();
    topicBrowser.innerHTML = `
      <div class="hm-topic-browser-intro">
        <span>Pick a topic bubble for focused prompts, or skip these and type directly into Ask Haley.</span>
        <strong>${standard.length + specialist.length} prompts</strong>
      </div>
      <div class="hm-topic-cloud">
        ${topics.map(({ category, records }) => `<button class="hm-topic-bubble" type="button" data-hm-topic="${escapeHtml(category)}" aria-expanded="false"><span>${escapeHtml(category)}</span><small>${records.length}</small></button>`).join('')}
      </div>`;

    topicBrowser.querySelectorAll('[data-hm-topic]').forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.hmTopic;
        if (!category) return;
        if (!topicPopover.hidden && topicAnchor === button) {
          closeTopicPopover();
          return;
        }
        const topic = topics.find((item) => item.category === category);
        if (topic) openTopic(topic.category, topic.records, button);
      });
    });
  };

  const scheduleTopicBuild = () => {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(buildTopicBrowser, 40);
  };

  [questionList, specialistList].filter(Boolean).forEach((node) => {
    new MutationObserver(scheduleTopicBuild).observe(node, { childList: true, subtree: true });
  });

  document.addEventListener('click', (event) => {
    if (!topicPopover || topicPopover.hidden || !topicBrowser) return;
    if (!topicBrowser.contains(event.target) && !topicPopover.contains(event.target)) closeTopicPopover();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    helpers.forEach((helper) => { helper.open = false; });
    closeTopicPopover();
  });

  window.addEventListener('resize', positionTopicPopover);
  window.addEventListener('scroll', positionTopicPopover, true);

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
        closeTopicPopover();
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
      if (href === '#deep-dive') {
        event.preventDefault();
        const deepDive = topicBrowser?.querySelector('[data-hm-topic="Deep Dive"]');
        if (deepDive) {
          smoothScroll(library);
          window.setTimeout(() => deepDive.click(), reducedMotion ? 0 : 120);
          history.replaceState(null, '', href);
          return;
        }
      }

      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      closeTopicPopover();
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
  buildTopicBrowser();
  window.addEventListener('load', scheduleTopicBuild, { once: true });
  compactQuery.addEventListener?.('change', () => {
    closeTopicPopover();
    scheduleTopicBuild();
    if (!compactQuery.matches && starterWrap) starterWrap.classList.remove('is-open');
  });

  showView('capabilities');
})();
