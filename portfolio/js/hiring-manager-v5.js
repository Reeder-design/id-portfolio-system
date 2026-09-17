(() => {
  const library = document.querySelector('.hm-library');
  const questionList = document.querySelector('[data-hm-question-list]');
  const specialistList = document.querySelector('[data-hm-specialist-list]');
  const chatPanel = document.querySelector('.hm-chat-panel');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!library || !questionList) return;

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  let topicBrowser = null;
  let topicPopover = null;
  let topicAnchor = null;
  let helperPopover = null;
  let helperAnchor = null;
  let renderTimer = null;

  const supportsTopLayer = 'showPopover' in HTMLElement.prototype;

  const isPopoverOpen = (popover) => {
    if (!popover) return false;
    if (supportsTopLayer) {
      try { return popover.matches(':popover-open'); } catch { return false; }
    }
    return popover.classList.contains('is-open');
  };

  const showTopLayer = (popover) => {
    if (!popover) return;
    if (supportsTopLayer) {
      if (!isPopoverOpen(popover)) popover.showPopover();
    } else {
      popover.classList.add('is-open');
    }
  };

  const hideTopLayer = (popover) => {
    if (!popover) return;
    if (supportsTopLayer) {
      if (isPopoverOpen(popover)) popover.hidePopover();
    } else {
      popover.classList.remove('is-open');
    }
  };

  const positionFromAnchor = (popover, anchor, preferredWidth = 430) => {
    if (!popover || !anchor?.isConnected || !isPopoverOpen(popover)) return;
    const pad = 12;
    const gap = 10;
    const rect = anchor.getBoundingClientRect();
    const width = Math.min(preferredWidth, window.innerWidth - pad * 2);

    popover.style.width = `${width}px`;
    popover.style.left = `${pad}px`;
    popover.style.top = `${pad}px`;

    const height = Math.min(popover.offsetHeight, window.innerHeight - pad * 2);
    const center = rect.left + rect.width / 2;
    const left = Math.max(pad, Math.min(center - width / 2, window.innerWidth - width - pad));
    const roomBelow = window.innerHeight - rect.bottom - pad;
    const roomAbove = rect.top - pad;
    let top = rect.bottom + gap;
    let placement = 'below';

    if (roomBelow < height + gap && roomAbove >= height + gap) {
      top = rect.top - height - gap;
      placement = 'above';
    } else if (roomBelow < height + gap && roomAbove < height + gap) {
      top = Math.max(pad, Math.min(rect.bottom + gap, window.innerHeight - height - pad));
      placement = 'viewport';
    }

    const arrowX = Math.max(18, Math.min(width - 18, center - left));
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
    popover.style.setProperty('--hm-topic-arrow-x', `${arrowX}px`);
    popover.dataset.placement = placement;
  };

  const clearPopoverPosition = (popover) => {
    if (!popover) return;
    popover.removeAttribute('data-placement');
    popover.style.removeProperty('left');
    popover.style.removeProperty('top');
    popover.style.removeProperty('width');
    popover.style.removeProperty('--hm-topic-arrow-x');
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

  const clickOriginalQuestion = (record) => {
    const selector = record.type === 'specialist'
      ? `[data-hm-specialist-id="${CSS.escape(record.id)}"]`
      : `[data-question-id="${CSS.escape(record.id)}"]`;
    (record.type === 'specialist' ? specialistList : questionList)?.querySelector(selector)?.click();
  };

  const ensureTopicPopover = () => {
    document.querySelectorAll('body > .hm-topic-popover').forEach((node) => {
      if (node !== topicPopover) node.remove();
    });
    if (topicPopover?.isConnected) return;
    topicPopover = document.createElement('div');
    topicPopover.className = 'hm-topic-popover hm-top-layer-popover';
    topicPopover.id = 'hmTopicPromptPopover';
    topicPopover.setAttribute('popover', 'manual');
    topicPopover.setAttribute('role', 'dialog');
    topicPopover.setAttribute('aria-label', 'Interview question prompts');
    document.body.appendChild(topicPopover);
  };

  const closeTopicPopover = () => {
    hideTopLayer(topicPopover);
    clearPopoverPosition(topicPopover);
    topicAnchor = null;
    topicBrowser?.querySelectorAll('.hm-topic-bubble').forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    });
  };

  const openTopic = (topic, anchor) => {
    ensureTopicPopover();
    if (isPopoverOpen(topicPopover) && topicAnchor === anchor) {
      closeTopicPopover();
      return;
    }

    closeHelperPopover();
    topicAnchor = anchor;
    topicPopover.innerHTML = `
      <div class="hm-topic-popover-head">
        <div>
          <strong>${escapeHtml(topic.category)}</strong>
          <p>Choose a question to send it directly to Ask Haley.</p>
        </div>
        <button class="hm-topic-close" type="button" aria-label="Close ${escapeHtml(topic.category)} questions">×</button>
      </div>
      <div class="hm-topic-prompts">
        ${topic.records.map((record) => `<button class="hm-topic-prompt" type="button" data-hm-topic-question="${escapeHtml(record.id)}" data-hm-topic-type="${escapeHtml(record.type)}">${escapeHtml(record.label)}</button>`).join('')}
      </div>`;

    topicBrowser.querySelectorAll('.hm-topic-bubble').forEach((button) => {
      const active = button === anchor;
      button.classList.toggle('active', active);
      button.setAttribute('aria-expanded', String(active));
    });

    showTopLayer(topicPopover);
    requestAnimationFrame(() => positionFromAnchor(topicPopover, anchor));

    topicPopover.querySelector('.hm-topic-close')?.addEventListener('click', closeTopicPopover);
    topicPopover.querySelectorAll('[data-hm-topic-question]').forEach((button) => {
      button.addEventListener('click', () => {
        clickOriginalQuestion({
          id: button.dataset.hmTopicQuestion,
          type: button.dataset.hmTopicType || 'standard'
        });
        closeTopicPopover();
        if (chatPanel) {
          window.setTimeout(() => chatPanel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), reducedMotion ? 0 : 70);
        }
      });
    });
  };

  const renderTopicBrowser = () => {
    /* V4 can finish its async render after this controller initializes. Remove any
       older browser/popover every time V5 renders so there is only one visible owner. */
    document.querySelectorAll('.hm-topic-browser').forEach((node) => {
      if (node !== topicBrowser) node.remove();
    });
    document.querySelectorAll('body > .hm-topic-popover').forEach((node) => {
      if (node !== topicPopover) node.remove();
    });
    ensureTopicPopover();

    const standard = questionRecords();
    const specialist = specialistRecords();

    if (!topicBrowser?.isConnected) {
      topicBrowser = document.createElement('div');
      topicBrowser.className = 'hm-topic-browser hm-topic-browser-v5';
      topicBrowser.setAttribute('aria-label', 'Interview topic browser');
      library.appendChild(topicBrowser);
    }

    if (!standard.length) {
      topicBrowser.innerHTML = `
        <div class="hm-topic-browser-intro">
          <span>Loading interview topics…</span>
          <strong>Question library</strong>
        </div>`;
      return;
    }

    const grouped = new Map();
    standard.forEach((record) => {
      if (!grouped.has(record.category)) grouped.set(record.category, []);
      grouped.get(record.category).push(record);
    });

    const topics = [...grouped.entries()].map(([category, records]) => ({ category, records }));
    if (specialist.length) topics.push({ category: 'Deep Dive', records: specialist });

    topicBrowser.innerHTML = `
      <div class="hm-topic-browser-intro">
        <span>Pick a topic bubble for focused prompts, or skip these and type directly into Ask Haley.</span>
        <strong>${standard.length + specialist.length} prompts</strong>
      </div>
      <div class="hm-topic-cloud">
        ${topics.map((topic) => `<button class="hm-topic-bubble" type="button" data-hm-v5-topic="${escapeHtml(topic.category)}" aria-expanded="false" aria-controls="hmTopicPromptPopover"><span>${escapeHtml(topic.category)}</span><small>${topic.records.length}</small></button>`).join('')}
      </div>`;

    topicBrowser.querySelectorAll('[data-hm-v5-topic]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const topic = topics.find((item) => item.category === button.dataset.hmV5Topic);
        if (topic) openTopic(topic, button);
      });
    });
  };

  const scheduleRender = () => {
    window.clearTimeout(renderTimer);
    /* V4 schedules its async library rebuild at 40ms. V5 deliberately renders later
       and removes that legacy instance, eliminating the two-controller race. */
    renderTimer = window.setTimeout(renderTopicBrowser, 180);
  };

  const libraryHelper = library.querySelector('.hm-helper');
  const libraryHelperSummary = libraryHelper?.querySelector('summary');
  const libraryHelperCard = libraryHelper?.querySelector('.hm-helper-card');

  const ensureHelperPopover = () => {
    if (helperPopover?.isConnected) return;
    helperPopover = document.createElement('div');
    helperPopover.className = 'hm-library-helper-popover hm-top-layer-popover';
    helperPopover.setAttribute('popover', 'manual');
    helperPopover.setAttribute('role', 'dialog');
    helperPopover.setAttribute('aria-label', 'About the question library');
    helperPopover.innerHTML = libraryHelperCard?.innerHTML || '<strong>Question Library</strong><p>Choose a topic bubble to browse curated interview prompts.</p>';
    document.body.appendChild(helperPopover);
  };

  function closeHelperPopover() {
    hideTopLayer(helperPopover);
    clearPopoverPosition(helperPopover);
    helperAnchor = null;
    libraryHelperSummary?.setAttribute('aria-expanded', 'false');
  }

  const toggleLibraryHelper = () => {
    ensureHelperPopover();
    if (isPopoverOpen(helperPopover) && helperAnchor === libraryHelperSummary) {
      closeHelperPopover();
      return;
    }
    closeTopicPopover();
    helperAnchor = libraryHelperSummary;
    libraryHelperSummary?.setAttribute('aria-expanded', 'true');
    showTopLayer(helperPopover);
    requestAnimationFrame(() => positionFromAnchor(helperPopover, libraryHelperSummary, 330));
  };

  if (libraryHelperSummary) {
    libraryHelperSummary.setAttribute('aria-expanded', 'false');
    libraryHelperSummary.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      libraryHelper.open = false;
      toggleLibraryHelper();
    }, true);
  }

  document.addEventListener('click', (event) => {
    if (isPopoverOpen(topicPopover) && !topicPopover.contains(event.target) && !topicAnchor?.contains(event.target)) closeTopicPopover();
    if (isPopoverOpen(helperPopover) && !helperPopover.contains(event.target) && !libraryHelperSummary?.contains(event.target)) closeHelperPopover();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeTopicPopover();
    closeHelperPopover();
  });

  const repositionOpenOverlays = () => {
    if (isPopoverOpen(topicPopover)) positionFromAnchor(topicPopover, topicAnchor);
    if (isPopoverOpen(helperPopover)) positionFromAnchor(helperPopover, helperAnchor, 330);
  };

  window.addEventListener('resize', repositionOpenOverlays);
  window.addEventListener('scroll', repositionOpenOverlays, true);

  new MutationObserver(scheduleRender).observe(questionList, { childList: true, subtree: true });
  if (specialistList) new MutationObserver(scheduleRender).observe(specialistList, { childList: true, subtree: true });

  ensureTopicPopover();
  renderTopicBrowser();
  window.addEventListener('load', scheduleRender, { once: true });
})();
