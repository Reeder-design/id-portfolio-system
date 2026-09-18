(() => {
  const blueprintData = {
    pathway: {
      title: 'Sequence the seller journey from context to application.',
      text: 'The required path stayed focused on the decisions most sellers shared. Market-specific requirements and deeper technical foundations were separated so they did not inflate the core certification.',
      html: `
        <div class="blueprint-flow" aria-label="Core certification sequence">
          ${['Cellular context','Customer use cases','Solution fit','Discovery + value','Scenario practice','Ordering readiness','Certification'].map((item) => `<span class="blueprint-step">${item}</span>`).join('')}
        </div>
        <div class="blueprint-mini-grid" style="margin-top:12px">
          <article class="blueprint-mini-card"><strong>Core seller path</strong><p>Required concepts and decisions shared across the main audience.</p></article>
          <article class="blueprint-mini-card"><strong>Regional extension</strong><p>Market-specific requirements stayed in a separate route and assessment.</p></article>
          <article class="blueprint-mini-card"><strong>Optional foundations</strong><p>Deeper technical background remained available without becoming required sales training.</p></article>
          <article class="blueprint-mini-card"><strong>Role boundary</strong><p>Engineering detail stayed out unless it supported discovery, risk, ordering, or specialist handoff.</p></article>
        </div>`
    },
    alignment: {
      title: 'Trace each objective through the exact evidence used to assess it.',
      text: 'Each lane below follows one objective from the seller behavior I wanted to support through practice and into the evidence used to judge performance.',
      html: `
        <div class="alignment-lanes" aria-label="Objective alignment examples">
          ${[
            ['01','Recognize opportunity fit','Identify a customer need worth pursuing','Qualification scenario','Select the strongest next discovery path'],
            ['02','Distinguish solution approaches','Compare needs and constraints','Side-by-side decision practice','Match the situation to the appropriate solution category'],
            ['03','Prepare the next sales step','Decide whether to continue discovery or involve a specialist','Guided customer conversation','Choose and justify the next action']
          ].map(([number, objective, task, practice, evidence]) => `
            <article class="alignment-lane">
              <div class="alignment-objective">
                <span class="alignment-number">${number}</span>
                <small>Objective</small>
                <strong>${objective}</strong>
              </div>
              <div class="alignment-route">
                <div class="alignment-stage">
                  <span>Seller task</span>
                  <strong>${task}</strong>
                </div>
                <span class="alignment-arrow" aria-hidden="true">→</span>
                <div class="alignment-stage">
                  <span>Practice</span>
                  <strong>${practice}</strong>
                </div>
                <span class="alignment-arrow" aria-hidden="true">→</span>
                <div class="alignment-stage alignment-stage-evidence">
                  <span>Assessment evidence</span>
                  <strong>${evidence}</strong>
                </div>
              </div>
            </article>`).join('')}
        </div>`
    },
    launch: {
      title: 'Plan launch, platform behavior, and maintenance as part of the learning design.',
      text: 'The certification had to work after authoring was finished. I treated review, LMS testing, reporting logic, and source updates as part of the same launch system.',
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

  const renderBlueprint = (key, animate = false) => {
    const data = blueprintData[key];
    if (!data || !blueprintPanel) return;
    const update = () => {
      blueprintPanel.innerHTML = `<h3>${data.title}</h3><p>${data.text}</p>${data.html}`;
      blueprintPanel.classList.remove('is-switching');
    };
    if (!animate) {
      update();
      return;
    }
    blueprintPanel.classList.add('is-switching');
    window.setTimeout(update, 120);
  };

  blueprintButtons.forEach((button, index) => {
    const activate = () => {
      blueprintButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      renderBlueprint(button.dataset.blueprint, true);
    };

    button.addEventListener('click', activate);
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = blueprintButtons.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % blueprintButtons.length;
      else next = (index - 1 + blueprintButtons.length) % blueprintButtons.length;
      blueprintButtons[next].focus();
      blueprintButtons[next].click();
    });
  });
  blueprintButtons.forEach((button, index) => { button.tabIndex = index === 0 ? 0 : -1; });
  renderBlueprint('pathway');

  const scenarioSteps = [
    {
      prompt: 'What is the strongest first discovery question?',
      guidance: 'Start with the workflow and business impact before jumping to a solution.',
      correct: 1,
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
      correct: 0,
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
      correct: 0,
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
  const progressBar = document.getElementById('scenarioProgressBar');
  const reset = document.getElementById('scenarioReset');
  let scenarioIndex = 0;

  const animateStage = () => {
    if (!stage) return;
    stage.classList.remove('is-entering');
    void stage.offsetWidth;
    stage.classList.add('is-entering');
  };

  const updateProgress = (complete = false) => {
    if (!progressBar) return;
    const percent = complete ? 100 : ((scenarioIndex + 1) / scenarioSteps.length) * 100;
    progressBar.style.width = `${percent}%`;
  };

  const renderScenario = () => {
    if (!stage || !progress) return;
    const step = scenarioSteps[scenarioIndex];
    progress.textContent = `Step ${scenarioIndex + 1} of ${scenarioSteps.length}`;
    updateProgress();
    stage.innerHTML = `
      <h3>${step.prompt}</h3>
      <p>${step.guidance}</p>
      <div class="scenario-options">
        ${step.options.map((option, optionIndex) =>
          `<button class="scenario-option" type="button" data-scenario-option="${optionIndex}" data-option-label="${String.fromCharCode(65 + optionIndex)}">${option.text}</button>`
        ).join('')}
      </div>
      <div id="scenarioFeedback" aria-live="polite"></div>`;
    animateStage();

    stage.querySelectorAll('[data-scenario-option]').forEach((button) => {
      button.addEventListener('click', () => {
        const optionIndex = Number(button.dataset.scenarioOption);
        const strong = optionIndex === step.correct;
        stage.querySelectorAll('[data-scenario-option]').forEach((item) => {
          const selected = item === button;
          item.classList.toggle('is-selected', selected);
          item.classList.toggle('is-strong', selected && strong);
          item.setAttribute('aria-pressed', String(selected));
        });

        const feedback = document.getElementById('scenarioFeedback');
        const isLast = scenarioIndex === scenarioSteps.length - 1;
        feedback.innerHTML = `
          <div class="scenario-feedback" data-tone="${strong ? 'strong' : 'coach'}">
            <strong>${strong ? 'Strong seller move' : 'Coaching feedback'}</strong>
            <p>${step.options[optionIndex].feedback}</p>
          </div>
          <button class="scenario-next" type="button">${isLast ? 'Finish scenario' : 'Continue →'}</button>`;
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
    updateProgress(true);
    stage.innerHTML = `
      <h3>The learning goal is judgment, not memorized product language.</h3>
      <p>This pattern lets sellers practice the sequence used in real customer conversations while feedback explains why a decision is stronger or weaker.</p>
      <div class="scenario-summary">
        <div><span>1. Discover</span><strong>Connect the technical symptom to the business workflow.</strong></div>
        <div><span>2. Distinguish</span><strong>Clarify the type of connectivity need before mapping a solution direction.</strong></div>
        <div><span>3. Advance</span><strong>Choose the next sales step and bring in technical depth at the right time.</strong></div>
      </div>
      <button class="scenario-next" type="button" id="scenarioReplay">Replay sample ↻</button>`;
    animateStage();
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

  const deliveryData = {
    build: {
      label: 'Build',
      icon: 'icon-elearning',
      title: 'Turn the architecture into usable seller learning.',
      action: 'I built Rise lessons, Storyline practice, diagrams, comparisons, knowledge checks, and the certification assessment around the seller decisions defined in the blueprint.',
      resultLabel: 'Delivered',
      result: 'A multi-course cellular networking sales certification with role-focused learning, scenario practice, assessment, and LMS implementation support.'
    },
    review: {
      label: 'Review',
      icon: 'icon-feedback',
      title: 'Protect accuracy without letting the course drift back into source-document language.',
      action: 'I coordinated editorial QA, interaction and accessibility checks, SME review, assessment review, and revision tracking across the certification.',
      resultLabel: 'Protected',
      result: 'A seller-focused scope where accuracy and approved messaging could be reviewed without turning the experience into engineering or product-document training.'
    },
    lms: {
      label: 'LMS + UAT',
      icon: 'icon-lms',
      title: 'Validate the learner journey, not just the course files.',
      action: 'I tested visibility, enrollment, launch behavior, learner routes, renewal behavior, imported history, and regional requirements in the LMS.',
      resultLabel: 'Improved',
      result: 'Core and regional routes stayed separate so sellers could complete the requirements relevant to their role and market instead of taking unnecessary content.'
    },
    maintain: {
      label: 'Maintain',
      icon: 'icon-automation',
      title: 'Keep the certification usable after launch.',
      action: 'I tracked affected content as approved sources changed and supported a reporting workaround when LMS status logic did not fully match the certification design.',
      resultLabel: 'Learned',
      result: 'Routing, assessment, reporting, governance, and platform behavior need to be designed as one system before the learning screens are finished.'
    }
  };

  const deliveryPanel = document.getElementById('deliveryPanel');
  const deliveryButtons = [...document.querySelectorAll('[data-delivery]')];

  const renderDelivery = (key, animate = false) => {
    const data = deliveryData[key];
    if (!data || !deliveryPanel) return;
    const update = () => {
      deliveryPanel.innerHTML = `
        <div class="delivery-panel-main">
          <span class="delivery-panel-icon" aria-hidden="true">
            <svg class="portfolio-icon"><use href="../../../../assets/icons/portfolio-icons.svg#${data.icon}"></use></svg>
          </span>
          <div>
            <p class="delivery-panel-label">${data.label}</p>
            <h3>${data.title}</h3>
            <p>${data.action}</p>
          </div>
        </div>
        <aside class="delivery-result">
          <span>${data.resultLabel}</span>
          <strong>${data.result}</strong>
        </aside>`;
      deliveryPanel.classList.remove('is-switching');
    };
    if (!animate) {
      update();
      return;
    }
    deliveryPanel.classList.add('is-switching');
    window.setTimeout(update, 120);
  };

  deliveryButtons.forEach((button, index) => {
    const activate = () => {
      deliveryButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      renderDelivery(button.dataset.delivery, true);
    };
    button.addEventListener('click', activate);
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = deliveryButtons.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % deliveryButtons.length;
      else next = (index - 1 + deliveryButtons.length) % deliveryButtons.length;
      deliveryButtons[next].focus();
      deliveryButtons[next].click();
    });
  });
  deliveryButtons.forEach((button, index) => { button.tabIndex = index === 0 ? 0 : -1; });
  renderDelivery('build');

  const authoringData = {
    rise: {
      label: 'Rise 360 / Reinforcement',
      title: 'Keep reinforcement inside the course flow.',
      summary: 'I used lightweight checks to reinforce customer fit and solution context without breaking the learner out of the main experience.',
      focus: ['Structured content','Quick reinforcement','Responsive delivery'],
      image: '../../../../assets/project-images/enterprise-certification/cert-rise-knowledge-check.webp',
      alt: 'Public-safe Rise-style cellular sales knowledge check.'
    },
    storyline: {
      label: 'Storyline 360 / Applied Practice',
      title: 'Use richer interaction when the seller needs to explore or decide.',
      summary: 'Storyline supported comparison, exploration, and scenario practice when a static content block would not give the learner enough room to test judgment.',
      focus: ['Interactive exploration','Scenario decisions','Coaching feedback']
    }
  };

  const storylineData = {
    explorer: {
      image: '../../../../assets/project-images/enterprise-certification/cert-storyline-product-explorer.webp',
      alt: 'Public-safe Storyline-style interactive cellular solution explorer.'
    },
    scenario: {
      image: '../../../../assets/project-images/enterprise-certification/cert-storyline-scenario.webp',
      alt: 'Public-safe Storyline-style customer recommendation scenario.'
    }
  };

  const authoringButtons = [...document.querySelectorAll('[data-authoring]')];
  const storylineButtons = [...document.querySelectorAll('[data-storyline-example]')];
  const authoringImage = document.getElementById('authoringImage');
  const authoringLabel = document.getElementById('authoringLabel');
  const authoringTitle = document.getElementById('authoringTitle');
  const authoringSummary = document.getElementById('authoringSummary');
  const authoringFocus = document.getElementById('authoringFocus');
  const storylineExampleTabs = document.getElementById('storylineExampleTabs');

  const renderStorylineExample = (key) => {
    const data = storylineData[key];
    if (!data || !authoringImage) return;
    authoringImage.src = data.image;
    authoringImage.alt = data.alt;
    storylineButtons.forEach((button) => {
      const active = button.dataset.storylineExample === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  };

  const renderAuthoring = (key) => {
    const data = authoringData[key];
    if (!data || !authoringImage) return;
    authoringLabel.textContent = data.label;
    authoringTitle.textContent = data.title;
    authoringSummary.textContent = data.summary;
    authoringFocus.replaceChildren(...data.focus.map((item) => {
      const chip = document.createElement('span');
      chip.textContent = item;
      return chip;
    }));
    const isStoryline = key === 'storyline';
    storylineExampleTabs.hidden = !isStoryline;
    if (isStoryline) renderStorylineExample('explorer');
    else {
      authoringImage.src = data.image;
      authoringImage.alt = data.alt;
    }
    authoringButtons.forEach((button) => {
      const active = button.dataset.authoring === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  };

  authoringButtons.forEach((button, index) => {
    button.addEventListener('click', () => renderAuthoring(button.dataset.authoring));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = authoringButtons.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % authoringButtons.length;
      else next = (index - 1 + authoringButtons.length) % authoringButtons.length;
      authoringButtons[next].focus();
      renderAuthoring(authoringButtons[next].dataset.authoring);
    });
  });

  storylineButtons.forEach((button, index) => {
    button.addEventListener('click', () => renderStorylineExample(button.dataset.storylineExample));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = storylineButtons.length - 1;
      else if (event.key === 'ArrowRight') next = (index + 1) % storylineButtons.length;
      else next = (index - 1 + storylineButtons.length) % storylineButtons.length;
      storylineButtons[next].focus();
      renderStorylineExample(storylineButtons[next].dataset.storylineExample);
    });
  });

  renderAuthoring('rise');

  const revealSections = [...document.querySelectorAll('.flagship-section')];
  revealSections.forEach((section) => section.setAttribute('data-cert-reveal', ''));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealSections.forEach((section) => revealObserver.observe(section));
  } else {
    revealSections.forEach((section) => section.classList.add('is-visible'));
  }

  const navLinks = [...document.querySelectorAll('.case-nav a')];
  const navSections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0.1, 0.35, 0.6] });
    navSections.forEach((section) => observer.observe(section));
  }
})();