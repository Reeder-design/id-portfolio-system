(() => {
  const signalFlows = {
    unsupported: {
      steps: [['Model output', '99.9%'], ['Issue noticed', 'Source?'], ['Evidence check', 'No match'], ['Classification', 'Major']]
    },
    instruction: {
      steps: [['Model output', '2 of 4'], ['Issue noticed', 'Missing'], ['Evidence check', 'Requirements'], ['Classification', 'Miss']]
    },
    slop: {
      steps: [['Model output', 'Generic'], ['Issue noticed', 'Filler'], ['Evidence check', 'Purpose'], ['Classification', 'Style']]
    },
    wordy: {
      steps: [['Model output', '24 lines'], ['Issue noticed', 'Repeated'], ['Evidence check', 'Trim test'], ['Classification', 'Wordy']]
    },
    slogan: {
      steps: [['Model output', '“#1”'], ['Issue noticed', 'Proof?'], ['Evidence check', 'Limited fit'], ['Classification', 'Overclaim']]
    },
    logic: {
      steps: [['Model output', 'A → C'], ['Issue noticed', 'B missing'], ['Evidence check', 'Trace'], ['Classification', 'Logic gap']]
    }
  };

  const signalDetail = document.querySelector('.ai-suite-landing .signal-detail');
  if (signalDetail) {
    const icon = signalDetail.querySelector('.signal-icon');
    const content = signalDetail.querySelector(':scope > div');
    const motion = document.createElement('div');
    motion.className = 'signal-motion';
    motion.setAttribute('aria-live', 'polite');
    content.appendChild(motion);
    icon.hidden = true;

    const renderFlow = (key) => {
      const data = signalFlows[key];
      if (!data) return;
      motion.className = 'signal-motion';
      motion.innerHTML = data.steps.map((step, index) => `<div class="signal-motion-step signal-motion-step-${index + 1}"><span>${step[0]}</span><strong>${step[1]}</strong><i aria-hidden="true"></i></div>`).join('');
      requestAnimationFrame(() => motion.classList.add('is-running'));
      signalDetail.dataset.signal = key;
    };
    document.querySelectorAll('[data-signal]').forEach((button) => button.addEventListener('click', () => renderFlow(button.dataset.signal)));
    renderFlow('unsupported');

    const spotlightGrid = document.querySelector('.ai-demo-grid');
    const spotlightHeading = spotlightGrid?.previousElementSibling;
    if (spotlightHeading) {
      spotlightHeading.querySelector('.eyebrow').textContent = 'Spotlight Projects';
      spotlightHeading.querySelector('h2').textContent = 'Three evaluation workspaces, each built around a different judgment.';
      spotlightHeading.querySelector('p:last-child').textContent = 'Practice issue detection, apply a criterion-based rubric, or follow the full evidence-to-feedback workflow.';
    }

  }

  const stageShell = document.querySelector('.ai-suite-workflow .stage-shell');
  document.querySelectorAll('.ai-suite-workflow .stage-button').forEach((button) => {
    button.addEventListener('click', () => {
      if (!stageShell) return;
      stageShell.classList.remove('is-transitioning');
      requestAnimationFrame(() => stageShell.classList.add('is-transitioning'));
      window.setTimeout(() => stageShell.classList.remove('is-transitioning'), 360);
    });
  });
})();
