(() => {
  const panel = document.querySelector('[data-ai-scenario-panel]');
  const tabs = [...document.querySelectorAll('[data-ai-scenario]')];
  if (panel && tabs.length) {
    const stages = ['signal', 'probe', 'coach'];
    const stageLabels = ['Customer cue', 'Learner question', 'Interpret + reflect'];
    const setScenario = (key) => {
      const step = stages.indexOf(key);
      if (step < 0) return;
      panel.dataset.transitioning = 'true';
      panel.dataset.step = key;
      panel.innerHTML = `<div class="ai-customer-header"><div class="ai-customer-avatar">AC</div><div><p>Fictional customer · scripted example</p><h3>Jordan · Operations lead</h3></div><span class="ai-customer-live">Practice concept</span></div><div class="ai-customer-chat"><div class="ai-customer-message"><p>“We have tried to reduce handoffs, but the team still loses time every day.”</p></div>${step >= 1 ? '<div class="ai-learner-message"><span>Where does work wait, and what does that delay change for the customer?</span></div><div class="ai-customer-message ai-customer-reply"><p>“An exception needs two approvals. By the time we respond, the customer has often escalated.”</p></div>' : '<div class="ai-scenario-prompt">What would you ask to understand the delay?</div>'}</div>${step === 2 ? '<div class="ai-scenario-reflection"><strong>Learner reflection</strong><span>Two approvals are the bottleneck. I would ask how often escalation happens and what it costs the customer before suggesting a solution.</span></div>' : ''}<div class="ai-discovery-map">${stageLabels.map((label, index) => `<div class="${index === step ? 'current' : index < step ? 'complete' : 'upcoming'}"><i></i><strong>${label}</strong><span>${index === 0 ? 'Notice the handoff signal' : index === 1 ? 'Probe the customer impact' : 'Explain the next move'}</span></div>`).join('')}</div>`;
      panel.setAttribute('aria-labelledby', tabs[step].id);
      window.setTimeout(() => { panel.dataset.transitioning = 'false'; }, 300);
      tabs.forEach((tab) => {
        const active = tab.dataset.aiScenario === key;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
    };
    tabs.forEach((tab) => tab.addEventListener('click', () => setScenario(tab.dataset.aiScenario)));
    tabs.forEach((tab, index) => tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      setScenario(tabs[next].dataset.aiScenario);
    }));
    setScenario('signal');
  }

  const sourceTabs = [...document.querySelectorAll('[data-ai-source]')];
  const sourceStage = document.querySelector('[data-ai-source-stage]');
  if (sourceStage && sourceTabs.length) {
    const sourceStates = {
      grounded: {
        question: 'Learner asks: “How do I uncover the handoff delay?”',
        status: 'Within scope',
        title: 'Grounded answer',
        answer: 'Ask where the handoff waits, then what that delay changes for the customer.',
        excerpt: '“Ask where the handoff waits and what the delay changes for the customer.”',
        citation: 'Supported by the illustrated guide excerpt'
      },
      outside: {
        question: 'Learner asks: “Which product will solve this customer’s problem?”',
        status: 'Outside scope',
        title: 'No supported answer',
        answer: 'This guide does not establish product fit. Review current product material or ask an SME before making a recommendation.',
        excerpt: 'No passage in this guide establishes product fit.',
        citation: 'No supporting passage in the illustrated guide'
      }
    };
    const setSource = (mode) => {
      const state = sourceStates[mode];
      if (!state) return;
      sourceStage.dataset.mode = mode;
      sourceStage.querySelector('.ai-source-question').textContent = state.question;
      sourceStage.querySelector('.ai-source-status').textContent = state.status;
      sourceStage.querySelector('.ai-source-answer strong').textContent = state.title;
      sourceStage.querySelector('.ai-source-answer p').textContent = state.answer;
      sourceStage.querySelector('.ai-source-highlight').textContent = state.excerpt;
      sourceStage.querySelector('.ai-source-citation').textContent = state.citation;
      sourceTabs.forEach((tab) => {
        const active = tab.dataset.aiSource === mode;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active) sourceStage.setAttribute('aria-labelledby', tab.id);
      });
    };
    sourceTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => setSource(tab.dataset.aiSource));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? sourceTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + sourceTabs.length) % sourceTabs.length;
        sourceTabs[next].focus();
        setSource(sourceTabs[next].dataset.aiSource);
      });
    });
    setSource('grounded');
  }

  const demoChoices = [...document.querySelectorAll('[data-ai-demo-choice]')];
  const demoResult = document.querySelector('[data-ai-demo-result]');
  const demoFeedback = {
    features: ['This starts with the product, not the customer need. A better next move makes room for the customer to explain what has changed.', false],
    need: ['Strong choice. This follow-up invites context and gives the learner a useful starting point for discovery before introducing a solution.', true],
    pricing: ['Pricing may matter later, but it does not uncover the problem driving the conversation. Start by understanding the current process.', false]
  };
  if (demoChoices.length && demoResult) {
    const selectChoice = (choice) => {
      const [message, correct] = demoFeedback[choice.dataset.aiDemoChoice];
      demoChoices.forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('selected', selected);
        item.classList.toggle('correct', selected && correct);
        item.classList.toggle('incorrect', selected && !correct);
        item.setAttribute('aria-checked', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      demoResult.textContent = message;
      demoResult.className = `ai-demo-result ${correct ? 'positive' : 'negative'}`;
    };
    demoChoices.forEach((choice, index) => {
      choice.addEventListener('click', () => selectChoice(choice));
      choice.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? demoChoices.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + demoChoices.length) % demoChoices.length;
        demoChoices[next].focus();
        selectChoice(demoChoices[next]);
      });
    });
  }
})();
