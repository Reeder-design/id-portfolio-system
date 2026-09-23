(() => {
  const sequence = [...document.querySelectorAll('.workshop-step')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.workshop-room-visual');
  const readout = document.querySelector('.workshop-readout');
  const readoutStates = [
    { key: 'ask', status: 'Ask', signal: 'Awaiting response', interpretation: 'No read yet', move: 'Ask + poll' },
    { key: 'watch', status: 'Watch', signal: 'Mixed answers', interpretation: 'Compare reasons', move: 'Pause + listen' },
    { key: 'interpret', status: 'Interpret', signal: 'Mixed answers', interpretation: 'Distinction unclear', move: 'Clarify the gap' },
    { key: 'reframe', status: 'Reframe', signal: 'Mixed answers', interpretation: 'Needs seller context', move: 'Use an example' },
    { key: 'recheck', status: 'Recheck', signal: 'Response pending', interpretation: 'Awaiting evidence', move: 'Listen again' }
  ];
  let sequenceTimer;
  let activeStep = 0;

  function showStep(index) {
    activeStep = index;
    sequence.forEach((step, stepIndex) => {
      step.classList.toggle('is-active', stepIndex === index);
      step.classList.toggle('is-complete', stepIndex < index);
    });
    const state = readoutStates[index];
    if (!state) return;
    if (hero) hero.dataset.heroStep = state.key;
    const values = {
      workshopReadoutStatus: state.status,
      workshopReadoutSignal: state.signal,
      workshopReadoutInterpretation: state.interpretation,
      workshopReadoutMove: state.move
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
    if (readout && !reducedMotion.matches) {
      readout.classList.remove('is-updating');
      void readout.offsetWidth;
      readout.classList.add('is-updating');
    }
  }

  function syncSequence() {
    window.clearInterval(sequenceTimer);
    showStep(0);
    if (reducedMotion.matches || document.hidden || sequence.length < 2) return;
    sequenceTimer = window.setInterval(() => showStep((activeStep + 1) % sequence.length), 1700);
  }

  if (sequence.length) {
    syncSequence();
    reducedMotion.addEventListener('change', syncSequence);
    document.addEventListener('visibilitychange', syncSequence);
  }

  const stages = {
    prepare: {
      label: 'Prepare',
      title: 'Plan the route through the assigned module.',
      summary: 'The objective and existing materials set the destination. I prepared how to move between explanation, participation, application, and debrief.',
      action: 'Map the timing, transitions, prompts, and a realistic way to ask for evidence.',
      signal: 'Where learners may need more context, and where a question or example can expose their reasoning.',
      next: 'Open with the seller task, then invite an interpretation before adding more detail.'
    },
    facilitate: {
      label: 'Facilitate',
      title: 'Connect framework language to a seller decision.',
      summary: 'Live time let participants name evidence, compare interpretations, and connect a category to a next discovery action.',
      action: 'Explain briefly, ask for reasoning, and invite public-safe seller examples into the discussion.',
      signal: 'The examples and questions reveal which parts of the framework already feel usable.',
      next: 'Use a focused poll or question to test the distinction before moving into application.'
    },
    check: {
      label: 'Check',
      title: 'Use the response as evidence about understanding.',
      summary: 'Polls and questions were formative checks. The useful information was the reasoning behind a choice, not just the selected answer.',
      action: 'Ask learners to identify the strongest evidence and explain why they chose it.',
      signal: 'Mixed confidence, repeated questions, or weak examples suggest a distinction needs more work.',
      next: 'Decide whether to reframe, use a different example, or continue to practice.'
    },
    adapt: {
      label: 'Adapt',
      title: 'Change the route while protecting the objective.',
      summary: 'I adjusted explanation, examples, and pace to the audience response across U.S. and international sessions.',
      action: 'Reframe a shaky distinction, use a strong peer example, or shorten background when time tightens.',
      signal: 'A follow-up question or example lets me check whether the revised explanation is usable.',
      next: 'Keep enough time for learners to apply the concept and debrief their reasoning.'
    },
    debrief: {
      label: 'Debrief',
      title: 'Bring the discussion back to a next seller action.',
      summary: 'Application gave the group a chance to compare evidence, identify gaps, and explain a credible next discovery question.',
      action: 'Debrief the reasoning and note questions or timing friction that kept returning.',
      signal: 'The explanation of a choice shows what transferred and where additional support may help.',
      next: 'Use those patterns to inform clearer future content, scenarios, and facilitator guidance.'
    }
  };

  const buttons = [...document.querySelectorAll('[data-control-key]')];
  const panel = document.getElementById('control-panel');
  const scenes = [...document.querySelectorAll('[data-stage-scene]')];
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  function activate(button) {
    const stage = stages[button.dataset.controlKey];
    if (!stage) return;
    buttons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    if (panel) panel.setAttribute('aria-labelledby', button.id);
    setText('controlLabel', stage.label);
    setText('controlTitle', stage.title);
    setText('controlSummary', stage.summary);
    setText('controlAction', stage.action);
    setText('controlSignal', stage.signal);
    setText('controlNext', stage.next);
    scenes.forEach((scene) => scene.classList.toggle('is-active', scene.dataset.stageScene === button.dataset.controlKey));
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activate(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = buttons.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
      else nextIndex = (index - 1 + buttons.length) % buttons.length;
      buttons[nextIndex].focus();
      activate(buttons[nextIndex]);
    });
  });

  const feedback = {
    questions: {
      title: 'Clarify the explanation and reference support.',
      description: 'A question that keeps returning suggests the next version needs a clearer explanation, a concrete seller example, or a quick reference learners can revisit.'
    },
    misconceptions: {
      title: 'Practice the distinction in a scenario.',
      description: 'When responses suggest a category distinction is unclear, future scenario choices and feedback could show which evidence fits best and why another interpretation is weaker.'
    },
    examples: {
      title: 'Build practice from credible seller situations.',
      description: 'Useful examples can inform fictionalized cases that feel relevant across audiences while keeping real customer and opportunity details private.'
    },
    timing: {
      title: 'Simplify background and protect application.',
      description: 'Timing friction points to lower-value narration that could be shortened in the next facilitator guide, leaving room for practice and debrief.'
    }
  };
  const feedbackButtons = [...document.querySelectorAll('[data-feedback-key]')];
  const feedbackScenes = [...document.querySelectorAll('[data-feedback-scene]')];
  const feedbackOutput = document.getElementById('feedbackOutput');
  function activateFeedback(button) {
    const state = feedback[button.dataset.feedbackKey];
    if (!state) return;
    feedbackButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    feedbackScenes.forEach((scene) => scene.classList.toggle('is-active', scene.dataset.feedbackScene === button.dataset.feedbackKey));
    setText('feedbackTitle', state.title);
    setText('feedbackDescription', state.description);
    if (feedbackOutput && !reducedMotion.matches) {
      feedbackOutput.classList.remove('is-updating');
      void feedbackOutput.offsetWidth;
      feedbackOutput.classList.add('is-updating');
    }
  }
  feedbackButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateFeedback(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = feedbackButtons.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % feedbackButtons.length;
      else nextIndex = (index - 1 + feedbackButtons.length) % feedbackButtons.length;
      feedbackButtons[nextIndex].focus();
      activateFeedback(feedbackButtons[nextIndex]);
    });
  });
})();
