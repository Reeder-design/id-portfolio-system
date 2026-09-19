(() => {
  const scenarios = {
    signal: {
      message: '“We have tried to reduce handoffs, but the team still loses time every day.”',
      learner: 'What is the biggest source of delay?',
      signals: [['Customer cue', 'Repeated handoffs'], ['What to uncover', 'Where work slows'], ['Why it matters', 'Impact on the team']]
    },
    probe: {
      message: '“Each exception needs two approvals, so work sits between teams.”',
      learner: 'When an exception sits, what does that delay for the customer?',
      signals: [['Customer cue', 'Two approvals'], ['What to uncover', 'Cost of waiting'], ['Why it matters', 'Customer impact']]
    },
    coach: {
      message: '“By the time we respond, the customer has already escalated.”',
      learner: 'That sounds costly. How often does that happen?',
      signals: [['Customer cue', 'Customer escalation'], ['What to uncover', 'Frequency + severity'], ['Why it matters', 'Priority to solve']]
    }
  };

  const panel = document.querySelector('[data-ai-scenario-panel]');
  const tabs = [...document.querySelectorAll('[data-ai-scenario]')];
  if (panel && tabs.length) {
    const setScenario = (key) => {
      const scenario = scenarios[key];
      if (!scenario) return;
      panel.dataset.transitioning = 'true';
      panel.innerHTML = `<div class="ai-customer-header"><div class="ai-customer-avatar">AC</div><div><p>AI customer</p><h3>Jordan · Operations lead</h3></div><span class="ai-customer-live">In conversation</span></div><div class="ai-customer-chat"><div class="ai-customer-message"><p>${scenario.message}</p></div><div class="ai-learner-message"><span>${scenario.learner}</span></div></div><div class="ai-discovery-map">${scenario.signals.map(([heading, detail]) => `<div><i></i><strong>${heading}</strong><span>${detail}</span></div>`).join('')}</div>`;
      window.setTimeout(() => { panel.dataset.transitioning = 'false'; }, 300);
      tabs.forEach((tab) => {
        const active = tab.dataset.aiScenario === key;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
    };
    tabs.forEach((tab) => tab.addEventListener('click', () => setScenario(tab.dataset.aiScenario)));
  }

  const demoChoices = [...document.querySelectorAll('[data-ai-demo-choice]')];
  const demoResult = document.querySelector('[data-ai-demo-result]');
  const demoFeedback = {
    features: ['This starts with the product, not the customer need. A better next move makes room for the customer to explain what has changed.', false],
    need: ['Strong choice. This follow-up invites context and gives the learner a useful starting point for discovery before introducing a solution.', true],
    pricing: ['Pricing may matter later, but it does not uncover the problem driving the conversation. Start by understanding the current process.', false]
  };
  if (demoChoices.length && demoResult) {
    demoChoices.forEach((choice) => choice.addEventListener('click', () => {
      const [message, correct] = demoFeedback[choice.dataset.aiDemoChoice];
      demoChoices.forEach((item) => {
        const selected = item === choice;
        item.classList.toggle('selected', selected);
        item.classList.toggle('correct', selected && correct);
        item.classList.toggle('incorrect', selected && !correct);
        item.setAttribute('aria-checked', String(selected));
      });
      demoResult.textContent = message;
      demoResult.className = `ai-demo-result ${correct ? 'positive' : 'negative'}`;
    }));
  }
})();
