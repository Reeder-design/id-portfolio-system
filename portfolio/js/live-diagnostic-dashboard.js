(() => {
  const dashboard = document.querySelector('[data-room-dashboard]');
  if (!dashboard) return;

  const conditions = { poll: 'mixed', questions: 'none', examples: 'not-yet', time: 'open' };
  const presets = {
    poll: { poll: 'mixed', questions: 'none', examples: 'not-yet', time: 'open' },
    question: { poll: 'clear', questions: 'repeated', examples: 'not-yet', time: 'open' },
    examples: { poll: 'clear', questions: 'none', examples: 'strong', time: 'open' },
    time: { poll: 'clear', questions: 'none', examples: 'not-yet', time: 'tight' }
  };
  const metrics = {
    poll: { clear: ['Clear', 88], mixed: ['Split', 54], low: ['Low', 23] },
    questions: { none: ['Not repeating', 23], repeated: ['Recurring', 88] },
    examples: { 'not-yet': ['Not yet', 28], strong: ['Relevant', 86] },
    time: { open: ['Available', 82], tight: ['Tight', 25] }
  };

  const diagnose = () => {
    const { poll, questions, examples, time } = conditions;
    if (time === 'tight' && (poll === 'low' || questions === 'repeated')) return {
      status: 'intervene', label: 'Intervention needed',
      signal: 'Confusion + time pressure',
      meaning: 'The distinction is unsettled, and the agenda needs a tradeoff.',
      adjust: 'Use one seller example; trim narration, not practice.',
      next: 'Check the distinction again before moving forward.'
    };
    if (poll === 'low') return {
      status: 'intervene', label: 'Intervention needed',
      signal: 'Low poll confidence',
      meaning: 'The MEDDPICC distinction is not stable yet.',
      adjust: 'Slow down, reframe with a seller example, and test again.',
      next: 'Ask another evidence-based check question.'
    };
    if (questions === 'repeated') return {
      status: 'intervene', label: 'Intervention needed',
      signal: 'A question keeps returning',
      meaning: 'The current explanation has not resolved the friction.',
      adjust: 'Change the explanation; anchor it in a concrete seller situation.',
      next: 'Ask learners to explain the distinction in their own words.'
    };
    if (poll === 'mixed' && time === 'tight') return {
      status: 'watch', label: 'Watch',
      signal: 'Split poll + time pressure',
      meaning: 'Learners need a clearer distinction, but the agenda must narrow.',
      adjust: 'Use one seller example; shorten narration while protecting practice.',
      next: 'Ask for one applied interpretation before the debrief.'
    };
    if (poll === 'mixed') return {
      status: 'watch', label: 'Watch',
      signal: examples === 'strong' ? 'Split poll + useful examples' : 'Poll responses split',
      meaning: 'The group is interpreting the evidence in different ways.',
      adjust: examples === 'strong' ? 'Compare reasoning using a peer example.' : 'Compare rationales, then clarify the category.',
      next: 'Check the interpretation with one more seller example.'
    };
    if (time === 'tight') return {
      status: 'watch', label: 'Watch',
      signal: 'Time is tightening',
      meaning: 'The agenda requires a deliberate tradeoff.',
      adjust: 'Compress lower-value narration; protect application and debrief.',
      next: 'Ask for one applied response before closing.'
    };
    if (examples === 'strong') return {
      status: 'productive', label: 'Productive',
      signal: 'Relevant seller examples',
      meaning: 'The group has experience the session can build on.',
      adjust: 'Use a peer example and move into deeper application.',
      next: 'Ask what discovery question follows from that evidence.'
    };
    return {
      status: 'productive', label: 'Productive',
      signal: 'Interpretation appears clear',
      meaning: 'No immediate friction is visible in this illustrative state.',
      adjust: 'Continue into the seller scenario and invite examples.',
      next: 'Listen for evidence-based reasoning during practice.'
    };
  };

  const setText = (selector, value) => {
    const element = dashboard.querySelector(selector);
    if (element) element.textContent = value;
  };
  let activePreset = 'poll';
  const render = (animate = true) => {
    const reading = diagnose();
    dashboard.dataset.status = reading.status;
    setText('[data-room-status]', reading.label);
    setText('[data-room-signal]', reading.signal);
    setText('[data-room-meaning]', reading.meaning);
    setText('[data-room-adjust]', reading.adjust);
    setText('[data-room-next]', reading.next);
    setText('[data-room-announcement]', `${reading.label}. ${reading.signal}. ${reading.meaning} ${reading.adjust} Next: ${reading.next}`);

    dashboard.querySelectorAll('[data-room-metric]').forEach((metric) => {
      const key = metric.dataset.roomMetric;
      const [label, fill] = metrics[key][conditions[key]];
      const labelElement = metric.querySelector('[data-room-metric-value]');
      if (labelElement) labelElement.textContent = label;
      metric.style.setProperty('--room-fill', `${fill}%`);
    });
    dashboard.querySelectorAll('[data-room-control]').forEach((button) => {
      button.setAttribute('aria-pressed', String(conditions[button.dataset.roomControl] === button.dataset.value));
    });
    dashboard.querySelectorAll('[data-room-preset]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.roomPreset === activePreset));
    });
    if (animate) {
      dashboard.classList.remove('is-updating');
      void dashboard.offsetWidth;
      dashboard.classList.add('is-updating');
    }
  };

  dashboard.querySelectorAll('[data-room-control]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.roomControl;
      if (conditions[key] === button.dataset.value) return;
      conditions[key] = button.dataset.value;
      activePreset = null;
      render();
    });
  });
  dashboard.querySelectorAll('[data-room-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      Object.assign(conditions, presets[button.dataset.roomPreset]);
      activePreset = button.dataset.roomPreset;
      render();
    });
  });
  render(false);
})();
