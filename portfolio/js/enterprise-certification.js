(() => {
  const blueprintData = {
    pathway: {
      title: 'Sequence the seller journey from context to application.',
      text: 'The required path stayed focused on the decisions most sellers shared. Market-specific requirements and deeper technical foundations were separated so they did not inflate the core certification.',
      html: `
        <div class="blueprint-flow" aria-label="Core certification sequence">
          ${['Cellular context','Customer use cases','Solution fit','Discovery + value','Scenario practice','Ordering readiness','Certification'].map((item) => `<span class="blueprint-step">${item}</span>`).join('')}
        </div>
        <div class="blueprint-mini-grid" style="margin-top:10px">
          <article class="blueprint-mini-card"><strong>Core seller path</strong><p>Required concepts and decisions shared across the main audience.</p></article>
          <article class="blueprint-mini-card"><strong>Regional extension</strong><p>Market-specific requirements stayed in a separate route and assessment.</p></article>
          <article class="blueprint-mini-card"><strong>Optional foundations</strong><p>Deeper technical background remained available without becoming required sales training.</p></article>
          <article class="blueprint-mini-card"><strong>Role boundary</strong><p>Engineering detail stayed out unless it supported discovery, risk, ordering, or specialist handoff.</p></article>
        </div>`
    },
    alignment: {
      title: 'Map each objective to a seller task and observable evidence.',
      text: 'I used backward design so practice and assessment checked the decisions the certification was meant to support, rather than isolated product recall.',
      html: `
        <div class="blueprint-table" aria-label="Objective alignment examples">
          ${[
            ['Recognize opportunity fit','Identify a customer need worth pursuing','Qualification scenario','Select the strongest next discovery path'],
            ['Distinguish solution approaches','Compare needs and constraints','Side-by-side decision practice','Match the situation to the appropriate solution category'],
            ['Prepare the next sales step','Decide whether to continue discovery or involve a specialist','Guided customer conversation','Choose and justify the next action']
          ].map(([objective, task, practice, evidence]) => `
            <div class="blueprint-row">
              <div class="blueprint-cell"><strong>Objective</strong>${objective}</div>
              <div class="blueprint-cell"><strong>Seller task</strong>${task}</div>
              <div class="blueprint-cell"><strong>Practice</strong>${practice}</div>
              <div class="blueprint-cell"><strong>Assessment evidence</strong>${evidence}</div>
            </div>`).join('')}
        </div>`
    },
    release: {
      title: 'Treat release, platform behavior, and maintenance as part of the learning design.',
      text: 'The certification had to work after authoring was finished. I planned review, LMS testing, reporting logic, and source updates as part of the same system.',
      html: `
        <div class="blueprint-mini-grid">
          <article class="blueprint-mini-card"><strong>1. Design QA</strong><p>Editorial, visual, interaction, accessibility, and learner-flow checks before broader review.</p></article>
          <article class="blueprint-mini-card"><strong>2. SME + assessment review</strong><p>Resolve accuracy and messaging feedback while protecting the seller-focused scope.</p></article>
          <article class="blueprint-mini-card"><strong>3. LMS UAT</strong><p>Validate visibility, launch, routes, renewal behavior, imported history, and regional requirements.</p></article>
          <article class="blueprint-mini-card"><strong>4. Maintain + report</strong><p>Track source changes and support workarounds when platform reporting does not match the certification logic.</p></article>
        </div>`
    }
  };

  const blueprintPanel = document.getElementById('blueprintPanel');
  const blueprintButtons = [...document.querySelectorAll('[data-blueprint]')];

  const renderBlueprint = (key) => {
    const data = blueprintData[key];
    if (!data || !blueprintPanel) return;
    blueprintPanel.innerHTML = `<h3>${data.title}</h3><p>${data.text}</p>${data.html}`;
  };

  blueprintButtons.forEach((button, index) => {
    const activate = () => {
      blueprintButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      renderBlueprint(button.dataset.blueprint);
    };
    button.addEventListener('click', activate);
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = blueprintButtons.length - 1;
      else if (event.key === 'ArrowRight') next = (index + 1) % blueprintButtons.length;
      else next = (index - 1 + blueprintButtons.length) % blueprintButtons.length;
      blueprintButtons[next].focus();
      blueprintButtons[next].click();
    });
  });
  renderBlueprint('pathway');

  const scenarioSteps = [
    {
      prompt: 'What is the strongest first discovery question?',
      guidance: 'Start with the workflow and business impact before jumping to a solution.',
      options: [
        {
          text: 'What budget has already been approved for the project?',
          feedback: 'Budget matters later, but this skips the operational problem. You still do not know which workflows are failing or what the failure costs the customer.'
        },
        {
          text: 'Which devices and workflows are losing service, where does it happen, and what happens operationally when connectivity drops?',
          feedback: 'Strong choice. It connects the technical symptom to a business workflow and gives the seller evidence for the next discovery step.'
        },
        {
          text: 'Would you like us to walk through a complete technical architecture now?',
          feedback: 'Too early. The seller has not established requirements yet, and the conversation would drift into engineering before the problem is qualified.'
        }
      ]
    },
    {
      prompt: 'What should the seller clarify before recommending a direction?',
      guidance: 'A cellular networking conversation can include different needs. The seller should separate them before mapping a solution approach.',
      options: [
        {
          text: 'Whether the primary need is reliable connectivity for on-site operational devices, improved public mobile coverage for people, or a combination of both.',
          feedback: 'Exactly. Distinguishing the use case keeps the recommendation tied to the customer requirement instead of a memorized product pitch.'
        },
        {
          text: 'Which solution has the largest feature set so the customer has room to grow.',
          feedback: 'Feature breadth is not the decision criterion. The right direction depends on the workflows, users, constraints, and desired operating model.'
        },
        {
          text: 'Which implementation model engineering prefers to deploy.',
          feedback: 'That may matter later, but it is not the seller’s first decision. Discovery should establish the business and connectivity requirement before implementation design.'
        }
      ]
    },
    {
      prompt: 'What is the strongest next step after the need is qualified?',
      guidance: 'The seller should advance the opportunity without pretending to be the deployment engineer.',
      options: [
        {
          text: 'Summarize the customer requirement, confirm success criteria, and involve the appropriate technical specialist when architecture or validation becomes necessary.',
          feedback: 'Strong choice. The seller owns the customer conversation and next-step clarity while bringing in technical depth at the right point.'
        },
        {
          text: 'Provide a detailed implementation recommendation immediately so the customer sees expertise.',
          feedback: 'That crosses the role boundary. The seller needs enough technical fluency to guide the conversation, not to replace solution engineering.'
        },
        {
          text: 'Send generic product materials and wait for the customer to select what looks relevant.',
          feedback: 'That gives up the consultative part of the sales role. The stronger move is to connect the qualified need to a clear next action.'
        }
      ]
    }
  ];

  const stage = document.getElementById('scenarioStage');
  const progress = document.getElementById('scenarioProgress');
  const reset = document.getElementById('scenarioReset');
  let scenarioIndex = 0;
  let selectedOption = null;

  const renderScenario = () => {
    if (!stage || !progress) return;
    selectedOption = null;
    const step = scenarioSteps[scenarioIndex];
    progress.textContent = `Step ${scenarioIndex + 1} of ${scenarioSteps.length}`;
    stage.innerHTML = `
      <h3>${step.prompt}</h3>
      <p>${step.guidance}</p>
      <div class="scenario-options">
        ${step.options.map((option, optionIndex) => `<button class="scenario-option" type="button" data-scenario-option="${optionIndex}">${option.text}</button>`).join('')}
      </div>
      <div id="scenarioFeedback" aria-live="polite"></div>`;

    stage.querySelectorAll('[data-scenario-option]').forEach((button) => {
      button.addEventListener('click', () => {
        const optionIndex = Number(button.dataset.scenarioOption);
        selectedOption = optionIndex;
        stage.querySelectorAll('[data-scenario-option]').forEach((item) => item.classList.toggle('is-selected', item === button));
        const feedback = document.getElementById('scenarioFeedback');
        const isLast = scenarioIndex === scenarioSteps.length - 1;
        feedback.innerHTML = `
          <div class="scenario-feedback"><strong>Coaching feedback</strong><p>${step.options[optionIndex].feedback}</p></div>
          <button class="scenario-next" type="button">${isLast ? 'Finish scenario' : 'Continue'}</button>`;
        feedback.querySelector('.scenario-next').addEventListener('click', () => {
          if (isLast) renderScenarioSummary();
          else {
            scenarioIndex += 1;
            renderScenario();
          }
        });
      });
    });
  };

  const renderScenarioSummary = () => {
    if (!stage || !progress) return;
    progress.textContent = 'Scenario complete';
    stage.innerHTML = `
      <h3>The learning goal is judgment, not memorized product language.</h3>
      <p>This pattern lets sellers practice the sequence used in real customer conversations while feedback explains why a decision is stronger or weaker.</p>
      <div class="scenario-summary">
        <div><span>1. Discover</span><strong>Connect the technical symptom to the business workflow.</strong></div>
        <div><span>2. Distinguish</span><strong>Clarify the type of connectivity need before mapping a solution direction.</strong></div>
        <div><span>3. Advance</span><strong>Choose the next sales step and bring in technical depth at the right time.</strong></div>
      </div>
      <button class="scenario-next" type="button" id="scenarioReplay">Try again</button>`;
    document.getElementById('scenarioReplay').addEventListener('click', () => {
      scenarioIndex = 0;
      renderScenario();
    });
  };

  reset?.addEventListener('click', () => {
    scenarioIndex = 0;
    renderScenario();
  });
  renderScenario();

  const navLinks = [...document.querySelectorAll('.case-nav a')];
  const navSections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0.1, 0.35, 0.6] });
    navSections.forEach((section) => observer.observe(section));
  }
})();
