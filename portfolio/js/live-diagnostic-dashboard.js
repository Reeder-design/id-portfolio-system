(() => {
  const dashboard = document.querySelector('[data-room-dashboard]');
  if (!dashboard) return;

  const iconBase = '../../../../assets/icons/pixel/';
  const signalReadings = {
    poll: {
      status: 'intervene', statusLabel: 'Intervention needed', icon: 'hiring-guide/analytics-growth.webp',
      bridgeTitle: 'The poll suggests the distinction is not secure.',
      bridgeCopy: 'Low confidence is a cue to pause and clarify before advancing. The status shifts to intervention because learners need another way into the concept.',
      focusTitle: 'What I examine in the poll',
      focus: [
        ['hiring-guide/analytics-growth.webp', 'Response variation', 'How varied are the choices?', 'variation'],
        ['hiring-guide/reference-search.webp', 'Confidence gap', 'Which distinction is unclear?', 'gap'],
        ['hiring-guide/team.webp', 'Poll engagement', 'Who responds and explains why?', 'participation']
      ],
      signal: 'Low poll confidence', meaning: 'The MEDDPICC distinction is not stable yet.',
      adjust: 'Slow down, reframe with a seller example, and test again.',
      next: 'Ask another evidence-based check question.'
    },
    question: {
      status: 'intervene', statusLabel: 'Intervention needed', icon: 'hiring-guide/qa-bubbles.webp',
      bridgeTitle: 'The same question keeps returning.',
      bridgeCopy: 'The current explanation has not settled the point. Intervention means finding a new frame, not simply repeating the same wording.',
      focusTitle: 'What I examine in the repeated question',
      focus: [
        ['hiring-guide/qa-bubbles.webp', 'Repeat point', 'Which part keeps returning?', 'repeat'],
        ['hiring-guide/reference-search.webp', 'Explanation fit', 'What has not landed yet?', 'gap'],
        ['microlearning-performance-support/real-world-application.webp', 'Application cue', 'Can they use it in a seller case?', 'progress']
      ],
      signal: 'A question keeps returning', meaning: 'The current explanation has not resolved the friction.',
      adjust: 'Change the explanation; anchor it in a concrete seller situation.',
      next: 'Ask learners to explain the distinction in their own words.'
    },
    examples: {
      status: 'productive', statusLabel: 'Productive', icon: 'hiring-guide/team.webp',
      bridgeTitle: 'Relevant seller examples give the group useful context.',
      bridgeCopy: 'This is a productive signal: peers can learn from the example, and I can move toward deeper application instead of spending more time on background.',
      focusTitle: 'What I examine in the seller examples',
      focus: [
        ['hiring-guide/team.webp', 'Relevance', 'Does the example fit the task?', 'aligned'],
        ['hiring-guide/chat-bubbles.webp', 'Peer reach', 'Can others add another angle?', 'participation'],
        ['hiring-guide/idea-bulb.webp', 'Next challenge', 'Ready for deeper application?', 'progress']
      ],
      signal: 'Relevant seller examples', meaning: 'The group has experience the session can build on.',
      adjust: 'Use a peer example and move into deeper application.',
      next: 'Ask what discovery question follows from that evidence.'
    },
    time: {
      status: 'watch', statusLabel: 'Watch', icon: 'portfolio-general/schedule.webp',
      bridgeTitle: 'Time pressure calls for an agenda decision.',
      bridgeCopy: 'This is a pacing watch, not a learner deficit. I can shorten lower-value narration while protecting the application and debrief.',
      focusTitle: 'What I examine when time tightens',
      focus: [
        ['portfolio-general/schedule.webp', 'Essential practice', 'What must stay?', 'aligned'],
        ['hiring-guide/workflow-tree.webp', 'Background', 'What can be shortened?', 'compress'],
        ['hiring-guide/qa-bubbles.webp', 'Debrief', 'What reasoning must be heard?', 'participation']
      ],
      signal: 'Time is tightening', meaning: 'The agenda requires a deliberate tradeoff.',
      adjust: 'Compress lower-value narration; protect application and debrief.',
      next: 'Ask for one applied response before closing.'
    }
  };

  const setText = (selector, value) => {
    const element = dashboard.querySelector(selector);
    if (element) element.textContent = value;
  };
  const setIcon = (selector, file) => {
    const image = dashboard.querySelector(selector);
    if (image) image.src = iconBase + file;
  };
  const buttons = [...dashboard.querySelectorAll('[data-room-preset]')];
  const focusCards = [...dashboard.querySelectorAll('.room-focus')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const showReading = (key, animate = true) => {
    const reading = signalReadings[key];
    if (!reading) return;
    dashboard.dataset.status = reading.status;
    setText('[data-room-status]', reading.statusLabel);
    setText('[data-room-bridge-title]', reading.bridgeTitle);
    setText('[data-room-bridge-copy]', reading.bridgeCopy);
    setText('[data-room-focus-title]', reading.focusTitle);
    setText('[data-room-signal]', reading.signal);
    setText('[data-room-meaning]', reading.meaning);
    setText('[data-room-adjust]', reading.adjust);
    setText('[data-room-next]', reading.next);
    setIcon('[data-room-bridge-icon]', reading.icon);
    setIcon('[data-room-signal-icon]', reading.icon);
    focusCards.forEach((card, index) => {
      const [icon, label, detail, cue] = reading.focus[index];
      const image = card.querySelector('[data-room-focus-icon]');
      if (image) image.src = iconBase + icon;
      const labelElement = card.querySelector('[data-room-focus-label]');
      if (labelElement) labelElement.textContent = label;
      const detailElement = card.querySelector('[data-room-focus-detail]');
      if (detailElement) detailElement.textContent = detail;
      const cueElement = card.querySelector('[data-room-focus-cue]');
      if (cueElement) cueElement.dataset.roomFocusCue = cue;
    });
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.roomPreset === key)));
    setText('[data-room-announcement]', `${reading.statusLabel}. ${reading.bridgeTitle} ${reading.meaning} ${reading.adjust} Next: ${reading.next}`);
    if (animate && !reducedMotion.matches) {
      dashboard.classList.remove('is-updating');
      void dashboard.offsetWidth;
      dashboard.classList.add('is-updating');
    }
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => showReading(button.dataset.roomPreset));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
        event.key === 'ArrowRight' ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      showReading(buttons[nextIndex].dataset.roomPreset);
    });
  });
  showReading('poll', false);
})();
