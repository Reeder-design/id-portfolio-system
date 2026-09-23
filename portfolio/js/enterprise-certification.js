(() => {
  const linkTabPanel = (buttons, panel, prefix) => {
    if (!panel) return;
    if (!panel.id) panel.id = `${prefix}-panel`;
    buttons.forEach((button, index) => {
      button.id = `${prefix}-tab-${index}`;
      button.setAttribute('aria-controls', panel.id);
    });
    const selected = buttons.find((button) => button.getAttribute('aria-selected') === 'true') || buttons[0];
    if (selected) panel.setAttribute('aria-labelledby', selected.id);
  };
  const overviewData = {
    inherit: {
      label: '01 / Origin',
      title: 'Two historic lines and a new third line needed one pathway.',
      text: 'The original lines came from separate business operations that were merging. The new line had to join the broader portfolio without erasing meaningful distinctions for sellers.',
      motion: `<div class="cert-origin-visual" aria-hidden="true"><div class="cert-origin-routes"><span class="cert-origin-route"><i></i><b>Line A</b></span><span class="cert-origin-route"><i></i><b>Line B</b></span><span class="cert-origin-route"><i></i><b>Line C</b></span></div><div class="cert-origin-hub"><span class="cert-motion-icon"><img src="../../../../assets/icons/pixel/lms/mini-hierarchy.webp" alt=""></span><b>One customizable learning path</b></div><div class="cert-origin-hierarchy"><span>Different audiences</span><span>Geographical regions</span><span>Product-information needs</span></div></div>`
    },
    change: {
      label: '02 / Research',
      title: 'I researched and sifted the source material before building the pathway.',
      text: 'Product guides, documents, decks, recordings, and review conversations held different pieces of the story. I scanned for learner-relevant facts, flagged uncertainty, and brought source-owner questions into review.',
      motion: `<div class="cert-research-visual" aria-hidden="true"><div class="cert-research-sources"><span data-type="PDF">PDF<mark>use case</mark></span><span data-type="DOC">Word<mark>terms</mark></span><span data-type="PPT">Slides<mark>position</mark></span><span data-type="▶">Video<mark>demo</mark></span><span data-type="GUIDE">Guide<mark>limits</mark></span></div><div class="cert-research-scanner"><span class="cert-motion-icon"><img src="../../../../assets/icons/pixel/lms/mini-report-search.webp" alt=""></span><b>Scan · select · verify</b></div><div class="cert-research-findings"><i></i><i></i><i></i><strong>Key learning evidence</strong></div></div>`
    },
    sources: {
      label: '03 / Sources',
      title: 'Decision continuity mattered as much as collecting comments.',
      text: 'The source teams still reflected historic business lines. I organized questions and decisions from multiple channels into reviewed action plans, concrete edits, and traceable deliverables.',
      motion: `<div class="cert-communications-visual" aria-hidden="true"><div class="cert-comms-inputs"><span><img src="../../../../assets/icons/pixel/lms/mini-email.webp" alt="">Email</span><span><img src="../../../../assets/icons/pixel/lms/mini-chat.webp" alt="">SME chat</span><span><img src="../../../../assets/icons/pixel/lms/mini-document-list.webp" alt="">Review notes</span></div><div class="cert-comms-funnel"><i></i><b>Review + decide</b></div><div class="cert-comms-output"><span>Action plan</span><span>Owner + date</span><span>Deliverable</span></div></div>`
    },
    timeline: {
      label: '04 / Delivery',
      title: 'The target moved from about ten months to about four.',
      text: 'I reprioritized, used reusable structures, planned parallel development and review, and protected essential learning and validation gates rather than treating the shorter window as permission to strip out the system.',
      motion: `<div class="cert-timeline-shift" aria-hidden="true"><div class="cert-timeline-header"><span>Original plan</span><b>≈ 10 months</b></div><div class="cert-timeline-axis"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="cert-timeline-compress"><span>Reprioritize</span><span>Parallel build + review</span><span>Protect UAT</span></div><div class="cert-timeline-header revised"><span>Replanned release</span><b>≈ 4 months</b></div><div class="cert-timeline-axis revised"><i></i><i></i><i></i><i></i></div><div class="cert-timeline-phases"><span>Design</span><span>Build + review</span><span>UAT</span><span>Release</span></div></div>`
    }
  };
  const overviewButtons = [...document.querySelectorAll('[data-overview]')];
  const overviewLabel = document.getElementById('overviewDetailLabel');
  const overviewTitle = document.getElementById('overviewDetailTitle');
  const overviewText = document.getElementById('overviewDetailText');
  const overviewMotion = document.getElementById('overviewMotion');
  let overviewSwitchTimer = 0;
  const selectOverview = (button) => {
    const data = overviewData[button.dataset.overview];
    const detail = document.getElementById('overviewDetail');
    if (!data || !detail) return;
    detail.setAttribute('aria-labelledby', button.id);
    overviewButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    detail.classList.add('is-switching');
    if (overviewSwitchTimer) window.clearTimeout(overviewSwitchTimer);
    overviewSwitchTimer = window.setTimeout(() => {
      overviewLabel.textContent = data.label;
      overviewTitle.textContent = data.title;
      overviewText.textContent = data.text;
      if (overviewMotion) {
        overviewMotion.className = `overview-motion overview-motion-${button.dataset.overview}`;
        overviewMotion.innerHTML = data.motion;
      }
      detail.classList.remove('is-switching');
      overviewSwitchTimer = 0;
    }, 110);
  };
  overviewButtons.forEach((button, index) => {
    button.tabIndex = index === 0 ? 0 : -1;
    button.addEventListener('click', () => selectOverview(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? overviewButtons.length - 1 : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + overviewButtons.length) % overviewButtons.length;
      overviewButtons[next].focus(); selectOverview(overviewButtons[next]);
    });
  });
  if (overviewMotion) overviewMotion.innerHTML = overviewData.inherit.motion;

  const ownershipInteraction = document.querySelector('.cert-ownership-interaction');
  const ownershipPanel = document.getElementById('ownershipPanel');
  const ownershipButtons = [...document.querySelectorAll('[data-ownership-view]')];
  const ownershipViews = {
    source: ['Keep product truth with its owners', 'Source teams and SMEs validated features, terminology, technical boundaries, portfolio distinctions, and business direction. I tracked who could confirm each decision as the organizations consolidated.'],
    design: ['From facts to learner decisions', 'I designed objectives, structure, practice, assessment, visuals, LMS behavior, support, and a revision strategy. I documented decisions so a changing portfolio would not fragment the learner experience.']
  };
  ownershipButtons.forEach((button, index) => {
    button.tabIndex = index === 1 ? 0 : -1;
    const activate = () => {
      const key = button.dataset.ownershipView;
      ownershipButtons.forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
      ownershipInteraction.dataset.ownership = key;
      ownershipPanel.setAttribute('aria-labelledby', button.id);
      ownershipPanel.querySelector('strong').textContent = ownershipViews[key][0];
      ownershipPanel.querySelector('p').textContent = ownershipViews[key][1];
    };
    button.addEventListener('click', activate);
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? ownershipButtons.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + ownershipButtons.length) % ownershipButtons.length;
      ownershipButtons[next].focus(); ownershipButtons[next].click();
    });
  });

  const blueprintData = {
    pathway: {
      title: 'Connect the full certification around decisions sellers make.',
      text: 'Multiple courses formed a shared core. Resources, practice, knowledge checks, a cumulative assessment, formal completion, learner feedback, reporting, and support made it an operating pathway.',
      html: `
        <div class="cert-architecture" aria-label="A certification map moves from four course topics through practice, checks, assessment, and completion, supported by LMS delivery and a feedback return loop.">
          <div class="cert-map-rail"><span><b>01</b>Context</span><span><b>02</b>Use cases</span><span><b>03</b>Positioning</span><span><b>04</b>Handoff</span></div>
          <div class="cert-map-transfer"><span>Learn</span><i></i><span>Apply</span><i></i><span>Prove</span></div>
          <div class="cert-map-gates"><span>Practice</span><span>Checks</span><span>Assessment</span><span>Credential</span></div>
          <div class="cert-map-foundation"><span>LMS + support</span><span>Reporting + feedback</span></div>
        </div>
        <p class="cert-panel-takeaway">The seller job defined the scope: recognize a situation, ask useful discovery questions, distinguish approaches, explain value, and know the next step—not become an implementation engineer.</p>`
    },
    audience: {
      title: 'Route one shared core to learners with different starting points.',
      text: 'Internal sellers, external partners, new populations, and different roles did not have equal product knowledge or LMS familiarity. I adjusted pacing, terminology, resources, assessment preparation, access, and support around that reality.',
      html: `<div class="cert-audience-map" aria-label="Three learner entrances feed a shared seller core, with regional and optional technical branches after the core."><div class="cert-audience-entry"><span>Internal</span><span>Partner</span><span>New</span></div><div class="cert-audience-core"><span class="cert-motion-icon"><img src="../../../../assets/icons/pixel/lms/mini-audience.webp" alt=""></span><strong>Shared seller core</strong><small>Discovery · fit · value</small></div><div class="cert-audience-routes"><span>Common route</span><span>Regional context</span><span>Optional depth</span></div></div><p class="cert-panel-takeaway">Specialized material branched only when it changed the learner's decision or requirement. Optional technical foundations stayed available without inflating the required core.</p>`
    },
    alignment: {
      title: 'Make the relationship between objective, content, practice, and assessment visible.',
      text: 'Choose an objective and walk through the alignment decision process I used for it.',
      html: '<div class="alignment-reveal" id="alignmentReveal"></div>'
    },
    launch: {
      title: 'Design the operating layer alongside the learning.',
      text: 'Access, learner routes, assessments, completion validity, certification status, support, reporting, and updates had to work after a course file was published.',
      html: `
        <div class="cert-operating-visual" aria-label="Learner and administrator screens share a central valid certification record. Learner activity and administrator access, completion, and support must both resolve.">
          <div class="cert-operating-learner"><b>Learner view</b><div class="cert-operating-window"><span>Course path</span><span>Practice</span><span>Assessment</span></div></div>
          <div class="cert-operating-record"><span class="cert-motion-icon"><img src="../../../../assets/icons/pixel/lms/mini-certificate.webp" alt=""></span><strong>Valid record</strong></div>
          <div class="cert-operating-admin"><b>Admin view</b><div class="cert-operating-window"><span>Access</span><span>Completion</span><span>Support</span></div></div>
        </div>
        <p class="cert-panel-takeaway">A polished module was not enough if the assigned learner could not enter it, finish it, receive a valid record, or get help when a system rule blocked progress.</p>`
    }
  };

  const alignmentExamples = [
    {
      label:'01',
      objective:'Recognize opportunity fit',
      content:'Customer signals, use cases, and qualification cues',
      practice:'Classify a customer situation and choose the next discovery move',
      assessment:'Select the strongest evidence-based discovery path',
      visual:['Opportunity fit','Customer signals','Classify a situation','Choose discovery path'],
      summary:'Customer signals and use cases lead into a classification scenario, then an evidence-based discovery decision.'
    },
    {
      label:'02',
      objective:'Distinguish solution approaches',
      content:'Needs, constraints, and the boundaries between solution categories',
      practice:'Compare two customer situations and map each to the right direction',
      assessment:'Match the situation to the appropriate solution category',
      visual:['Solution approach','Needs + constraints','Compare situations','Match the approach'],
      summary:'Needs and constraints become a comparison task before the assessment asks the learner to map the situation to an approach.'
    },
    {
      label:'03',
      objective:'Prepare the next sales step',
      content:'Role boundaries, handoff triggers, and success criteria',
      practice:'Work through a guided customer conversation',
      assessment:'Choose and justify the next seller action',
      visual:['Next sales step','Handoff triggers','Guide a conversation','Justify the action'],
      summary:'Role boundaries and handoff triggers inform a guided conversation, then an assessment of the next seller action.'
    }
  ];
  let alignmentTimers = [];

  const clearAlignmentTimers = () => {
    alignmentTimers.forEach((timer) => window.clearTimeout(timer));
    alignmentTimers = [];
  };

  const playAlignment = (index = 0) => {
    clearAlignmentTimers();
    const example = alignmentExamples[index];
    const reveal = document.getElementById('alignmentReveal');
    if (!reveal || !example) return;

    reveal.querySelectorAll('[data-alignment-objective]').forEach((button) => {
      const active = Number(button.dataset.alignmentObjective) === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    reveal.querySelector('.alignment-progressive-track').setAttribute('aria-labelledby', `alignment-objective-${index}`);

    const stages = [
      ['Objective', example.visual[0], 'lms/mini-document-list.webp'],
      ['Content', example.visual[1], 'portfolio-general/learning.webp'],
      ['Practice', example.visual[2], 'microlearning-performance-support/pointer-interaction.webp'],
      ['Assessment', example.visual[3], 'lms/mini-certificate.webp']
    ];

    const track = reveal.querySelector('.alignment-progressive-track');
    reveal.querySelector('.alignment-case-summary').textContent = example.summary;
    track.replaceChildren(...stages.map(([label, text, icon], stageIndex) => {
      const node = document.createElement('div');
      node.className = 'alignment-progressive-node';
      node.innerHTML = `
        <span class="alignment-progressive-icon" aria-hidden="true"><img src="../../../../assets/icons/pixel/${icon}" alt=""></span>
        <small>${label}</small>
        <strong>${text}</strong>
        ${stageIndex < stages.length - 1 ? '<i class="alignment-progressive-link" aria-hidden="true"></i>' : ''}`;
      return node;
    }));

    const nodes = [...track.querySelectorAll('.alignment-progressive-node')];
    nodes.forEach((node, stageIndex) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        node.classList.add('is-visible');
        if (stageIndex > 0) nodes[stageIndex - 1].classList.add('is-linked');
        return;
      }
      alignmentTimers.push(window.setTimeout(() => {
        node.classList.add('is-visible');
        if (stageIndex > 0) nodes[stageIndex - 1].classList.add('is-linked');
      }, stageIndex * 430));
    });
  };

  const initAlignmentReveal = () => {
    const reveal = document.getElementById('alignmentReveal');
    if (!reveal) return;
    reveal.innerHTML = `
      <div class="alignment-objective-picker" role="tablist" aria-label="Objective alignment examples">
        ${alignmentExamples.map((item,index)=>`<button type="button" id="alignment-objective-${index}" role="tab" aria-controls="alignmentProgressiveRegion" aria-selected="${index===0}" class="alignment-objective-choice${index===0?' active':''}" data-alignment-objective="${index}" tabindex="${index===0?'0':'-1'}"><span>${item.label}</span><strong>${item.objective}</strong></button>`).join('')}
      </div>
      <div class="alignment-progressive-track" id="alignmentProgressiveRegion" role="tabpanel" aria-labelledby="alignment-objective-0" aria-live="polite"></div>
      <p class="alignment-case-summary" aria-live="polite"></p>
      <div class="alignment-replay-row"><span>One objective, one evidence chain.</span><button type="button" class="alignment-replay">Replay alignment ↻</button></div>`;
    const choices = [...reveal.querySelectorAll('[data-alignment-objective]')];
    choices.forEach((button, index) => {
      button.addEventListener('click', () => playAlignment(index));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + choices.length) % choices.length;
        choices[next].focus(); playAlignment(next);
      });
    });
    reveal.querySelector('.alignment-replay').addEventListener('click', () => {
      const active = reveal.querySelector('[data-alignment-objective].active');
      playAlignment(active ? Number(active.dataset.alignmentObjective) : 0);
    });
    playAlignment(0);
  };

  const blueprintPanel = document.getElementById('blueprintPanel');
  const blueprintButtons = [...document.querySelectorAll('[data-blueprint]')];
  linkTabPanel(blueprintButtons, blueprintPanel, 'cert-blueprint');

  const renderBlueprint = (key, animate = false) => {
    const data = blueprintData[key];
    if (!data || !blueprintPanel) return;
    const update = () => {
      const selected = blueprintButtons.find((button) => button.dataset.blueprint === key);
      if (selected) blueprintPanel.setAttribute('aria-labelledby', selected.id);
      blueprintPanel.dataset.mode = key;
      blueprintPanel.innerHTML = `<h3>${data.title}</h3><p>${data.text}</p>${data.html}`;
      if (key === 'alignment') initAlignmentReveal();
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
      title: 'Build one seller journey from multiple courses.',
      action: 'I structured objectives, course flow, resources, practice, checks, and the certification assessment around observable sales decisions.',
      view: `<div class="cert-admin-screen cert-build-screen"><div class="cert-admin-top"><b>Course builder</b><small>Learning architecture</small></div><div class="cert-build-columns"><div><span>01 Portfolio context</span><span>02 Customer use cases</span><span>03 Value + positioning</span><span>04 Next-step decisions</span></div><div><b>Selected objective</b><strong>Recognize a customer need</strong><small data-demo-target data-complete="Content → Practice → Check aligned">Mapping learning evidence…</small><div class="cert-build-progress"><i></i><i></i><i></i></div></div></div></div>`
    },
    review: {
      label: 'Review',
      title: 'Resolve source truth and learning clarity together.',
      action: 'I packaged source questions, tracked decisions, coordinated SME and assessment review, and retested the learner experience after revisions.',
      view: `<div class="cert-admin-screen cert-review-screen"><div class="cert-admin-top"><b>Review package</b><small>Decision ledger</small></div><div class="cert-review-claim"><span>Proposed learning statement</span><strong>Does this wording match the current portfolio?</strong></div><div class="cert-review-status"><span>Source owner <b data-demo-target data-complete="Confirmed">Checking</b></span><span>Learning edit <b>Queued</b></span><span>QA retest <b>Next</b></span></div></div>`
    },
    lms: {
      label: 'LMS + UAT',
      title: 'Test the route as a learner and as an administrator.',
      action: 'I checked access, enrollment, regional route, launch, assessment, completion logic, and certification status in the LMS.',
      view: `<div class="cert-admin-screen cert-lms-screen"><div class="cert-admin-top"><b>Learning platform / Learner route</b><small>UAT view</small></div><div class="cert-lms-route"><span>Assigned</span><span>Launchable</span><span>Assessment</span><span>Recorded</span></div><div class="cert-lms-persona"><b>Test persona: partner / U.S.</b><small>Common core ✓ &nbsp; Regional requirement ✓ &nbsp; <strong data-demo-target data-complete="Certificate rule verified ✓">Validating certificate rule…</strong></small></div></div>`
    },
    support: {
      label: 'Support + Reporting',
      title: 'Treat a blocked completion as a learning problem.',
      action: 'I supported access, navigation, assessment questions, completion records, and certification status while checking reporting for exceptions and patterns.',
      view: `<div class="cert-admin-screen cert-support-screen"><div class="cert-admin-top"><b>Certification status</b><small>Administrator view</small></div><div class="cert-support-metrics"><span><b>Learning complete</b><strong>Yes</strong></span><span><b>Record received</b><strong data-demo-target data-complete="Verified">Review</strong></span><span><b>Next action</b><strong data-demo-followup data-complete="Document pattern">Check sync</strong></span></div><div class="cert-support-resolution">Case note → Verify platform rule → Resolve record → Document pattern</div></div>`
    },
    maintain: {
      label: 'Maintain + Improve',
      title: 'Revise the system without losing its decision history.',
      action: 'I mapped product, terminology, message, brand, and organizational changes to affected content; used feedback and records to prioritize fixes; and kept source rationale available for the next cycle.',
      view: `<div class="cert-admin-screen cert-maintain-screen"><div class="cert-admin-top"><b>Change impact</b><small>Maintenance view</small></div><div class="cert-maintain-compare"><div><span>New source decision</span><strong>Terminology updated</strong></div><div><span>Affected learning</span><strong>2 modules · 1 check</strong></div><div><span>Release note</span><strong data-demo-target data-complete="QA ready">Impact review</strong></div></div></div>`
    }
  };

  const deliveryPanel = document.getElementById('deliveryPanel');
  const deliveryButtons = [...document.querySelectorAll('[data-delivery]')];
  linkTabPanel(deliveryButtons, deliveryPanel, 'cert-delivery');
  const adminActionLabels = {
    build: ['Align objective', 'Objective aligned'],
    review: ['Confirm source', 'Source confirmed'],
    lms: ['Validate rule', 'Rule validated'],
    support: ['Verify record', 'Record verified'],
    maintain: ['Complete impact review', 'Impact review complete']
  };

  const renderDelivery = (key, animate = false) => {
    const data = deliveryData[key];
    if (!data || !deliveryPanel) return;
    const update = () => {
      const selected = deliveryButtons.find((button) => button.dataset.delivery === key);
      const visibleStage = document.getElementById(`cert-launch-stage-${key}`);
      if (visibleStage || selected) deliveryPanel.setAttribute('aria-labelledby', visibleStage?.id || selected.id);
      const flight = document.getElementById('certLaunchFlight');
      if (flight) flight.dataset.stage = key;
      document.querySelectorAll('.cert-launch-stop-button').forEach((stop, stopIndex) => {
        const active = deliveryButtons[stopIndex]?.dataset.delivery === key;
        stop.classList.toggle('active', active);
        stop.setAttribute('aria-current', active ? 'step' : 'false');
        stop.setAttribute('aria-selected', String(active));
        stop.tabIndex = active ? 0 : -1;
      });
      const stageLabel = document.getElementById('launchStageLabel');
      if (stageLabel) stageLabel.textContent = data.label;
      const stageSummary = flight?.querySelector('.cert-launch-caption span');
      if (stageSummary) stageSummary.textContent = data.title;
      deliveryPanel.innerHTML = `
        <div class="cert-ops-copy"><p class="delivery-panel-label">${data.label}</p><h3>${data.title}</h3><p>${data.action}</p></div>
        <div class="cert-ops-device" aria-label="Public-safe administrator interface reconstruction for ${data.label}"><div class="cert-ops-device-bar"><i></i><i></i><i></i><span>portfolio-safe interface example</span></div>${data.view}</div>`;
      const target = deliveryPanel.querySelector('[data-demo-target]');
      deliveryPanel.classList.remove('is-resolved');
      const screen = deliveryPanel.querySelector('.cert-admin-screen');
      const actionButton = document.createElement('button');
      actionButton.type = 'button';
      actionButton.className = 'cert-admin-action';
      actionButton.textContent = adminActionLabels[key][0];
      actionButton.setAttribute('aria-pressed', 'false');
      actionButton.addEventListener('click', () => {
        if (!target?.isConnected || actionButton.getAttribute('aria-pressed') === 'true') return;
        target.setAttribute('aria-live', 'polite');
        target.textContent = target.dataset.complete;
        const followup = screen.querySelector('[data-demo-followup]');
        if (followup) followup.textContent = followup.dataset.complete;
        actionButton.textContent = adminActionLabels[key][1];
        actionButton.setAttribute('aria-pressed', 'true');
        deliveryPanel.classList.add('is-resolved');
      });
      screen.append(actionButton);
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
  const launchTrack = document.querySelector('.cert-launch-track');
  const launchStops = [...document.querySelectorAll('.cert-launch-stop')];
  const launchFlight = document.getElementById('certLaunchFlight');
  const deliveryWorkspace = document.querySelector('.delivery-workspace');
  if (launchFlight && deliveryWorkspace) launchFlight.append(deliveryWorkspace);
  if (launchTrack) { launchTrack.removeAttribute('aria-hidden'); launchTrack.setAttribute('role','tablist'); launchTrack.setAttribute('aria-label','Launch and operations stages'); }
  const duplicateDeliveryTabs = document.querySelector('.delivery-tabs');
  if (duplicateDeliveryTabs) { duplicateDeliveryTabs.hidden = true; duplicateDeliveryTabs.setAttribute('aria-hidden','true'); }
  launchStops.forEach((stop, index) => {
    const trigger = document.createElement('button');
    trigger.className = 'cert-launch-stop-button';
    trigger.type = 'button';
    trigger.id = `cert-launch-stage-${deliveryButtons[index]?.dataset.delivery}`;
    trigger.setAttribute('role','tab');
    trigger.setAttribute('aria-controls','deliveryPanel');
    trigger.setAttribute('aria-selected',String(index === 0));
    trigger.tabIndex = index === 0 ? 0 : -1;
    trigger.innerHTML = `<span class="cert-launch-dot" aria-hidden="true"></span><span>${stop.textContent}</span><small>Explore</small>`;
    trigger.setAttribute('aria-label', `Explore ${deliveryButtons[index]?.textContent.trim()} launch stage`);
    trigger.addEventListener('click', () => deliveryButtons[index]?.click());
    trigger.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? launchStops.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + launchStops.length) % launchStops.length;
      const nextStop = launchTrack.querySelectorAll('.cert-launch-stop-button')[next];
      nextStop?.focus(); nextStop?.click();
    });
    stop.replaceWith(trigger);
  });
  renderDelivery('build');

  const historicalSignals = [
    {
      label: 'Assessment integrity',
      signal: 'Two partners raised separate assessment concerns: contradictory questions and a final-exam answer marked incorrect.',
      revealed: 'Confidence in the credential depends on defensible answer keys and unambiguous wording.',
      context: 'Source facts and terminology were changing while assessment items were being reviewed.',
      plan: 'Trace each reported item to its objective and approved source, compare the intended answer with the learner-facing wording, and involve the right source reviewer.',
      response: 'I treated the report as an assessment-integrity issue: trace the item to its source, check the intended objective and answer key with reviewers, revise where validated, and retest the learner path.',
      change: 'Assessment review became more explicit about ambiguity, answer-key integrity, and a decision trail for future updates.'
    },
    {
      label: 'Cognitive load',
      signal: 'A partner found parts of the earlier material text-heavy or repetitive and asked for more audio or video.',
      revealed: 'The experience needed more selective explanation and practice, not simply more source content.',
      context: 'Several evolving product lines and a compressed schedule put pressure on how much information the core path carried.',
      plan: 'Separate required seller decisions from optional depth; choose visuals, interaction, or multimedia only when it clarifies the task.',
      response: 'I reviewed the information hierarchy, separated required decisions from optional depth, and considered visuals, interactions, or multimedia where they would clarify the task.',
      change: 'The maintenance approach put more weight on applied seller decisions and controlled content depth rather than adding a new modality by default.'
    },
    {
      label: 'Entry knowledge',
      signal: 'A partner without a technical background found IT acronyms hard to follow.',
      revealed: 'A shared certification needed to support learners with different starting knowledge.',
      context: 'The original audience mix and approved scope did not always allow a full foundational enablement layer inside the required training.',
      plan: 'Define essential terms in the required route and keep deeper technical foundations available without making every learner take the same path.',
      response: 'I reviewed terminology in the core, added context and resources within scope, and differentiated optional technical foundations from required seller decisions.',
      change: 'The design approach recognized distinct entry points without requiring every learner to take the same technical depth.'
    },
    {
      label: 'Time expectations',
      signal: 'A partner said earlier course-time estimates felt too low.',
      revealed: 'The published time should reflect the work learners actually do, including reading, practice, and assessment.',
      context: 'Different levels of prior knowledge made one estimate especially easy to understate.',
      plan: 'Review the estimate against reading, interaction, practice, assessment, and the range of learner starting knowledge.',
      response: 'I reviewed pacing and learner effort against the intended pathway, then flagged estimates or content scope for recalibration where warranted.',
      change: 'Time guidance became an explicit maintenance check, accounting for reading, practice, assessment, and different starting knowledge.'
    }
  ];
  const positiveReactions = [
    {
      type: 'Verbatim excerpt',
      words: '“Exceptionally prepared, presented and structured”',
      insight: 'The partner also called out reference tools, case studies, whitepapers, and support materials as useful for customer conversations.'
    },
    {
      type: 'Verbatim excerpt',
      words: '“Very good overview with many opportunities to dive in deeper.”',
      insight: 'A shared overview and optional depth can work together without making every learner take the same technical route.'
    },
    {
      type: 'Feedback summary · not a quotation',
      words: 'Partners described the material as relevant and easy to follow, with practical use cases.',
      insight: 'That signal supports keeping customer situations and seller decisions close to the explanation.'
    },
    {
      type: 'Feedback summary · not a quotation',
      words: 'Partners responded positively to the learning experience, course flow, system capabilities, and overall training quality.',
      insight: 'The response reflects several parts of the pathway working together, not a single screen or asset.'
    }
  ];
  const voiceStage = document.getElementById('certVoiceStage');
  const voiceCount = document.getElementById('certVoiceCount');
  const voiceTabs = [...document.querySelectorAll('[data-positive]')];
  let activeVoice = 0;
  const renderVoice = (index) => {
    if (!voiceStage) return;
    activeVoice = index;
    const reaction = positiveReactions[index];
    voiceTabs.forEach((button, buttonIndex) => {
      const active = buttonIndex === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    voiceStage.setAttribute('aria-labelledby', voiceTabs[index].id);
    voiceCount.textContent = `${String(index + 1).padStart(2, '0')} / 04`;
    const message = reaction.type === 'Verbatim excerpt'
      ? `<blockquote>${reaction.words}</blockquote>`
      : `<p class="cert-voice-summary">${reaction.words}</p>`;
    voiceStage.innerHTML = `<div class="cert-voice-person"><span class="cert-voice-avatar"><img src="../../../../assets/icons/pixel/lms/mini-user.webp" alt=""></span><span><strong>Partner voice</strong><small>Anonymous qualitative feedback</small></span></div><div class="cert-voice-message"><span class="cert-voice-kind">${reaction.type}</span>${message}</div><p class="cert-voice-insight"><strong>What I heard:</strong> ${reaction.insight}</p>`;
    voiceStage.classList.remove('is-entering');
    void voiceStage.offsetWidth;
    voiceStage.classList.add('is-entering');
  };
  voiceTabs.forEach((button, index) => {
    button.addEventListener('click', () => renderVoice(index));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? voiceTabs.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + voiceTabs.length) % voiceTabs.length;
      voiceTabs[next].focus();
      renderVoice(next);
    });
  });
  renderVoice(0);

  const historicalStages = ['receive', 'diagnose', 'plan', 'execute', 'observe'];
  const historicalHeadings = {
    receive: 'Listen before choosing a fix.',
    diagnose: 'Find the issue beneath the comment.',
    plan: 'Choose a bounded, testable change.',
    execute: 'Make and verify the edit.',
    observe: 'Bring the next signal back into review.'
  };
  const historyThemeTabs = [...document.querySelectorAll('[data-history-theme]')];
  const historyStageTabs = [...document.querySelectorAll('[data-history-stage]')];
  const historyDetail = document.getElementById('certHistoryDetail');
  let activeHistoryTheme = 0;
  let activeHistoryStage = 'receive';
  const renderHistory = () => {
    if (!historyDetail) return;
    const signal = historicalSignals[activeHistoryTheme];
    const step = historicalStages.indexOf(activeHistoryStage);
    historyThemeTabs.forEach((button, index) => {
      const active = index === activeHistoryTheme;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    historyStageTabs.forEach((button) => {
      const active = button.dataset.historyStage === activeHistoryStage;
      button.classList.toggle('active', active);
      button.classList.toggle('is-past', historicalStages.indexOf(button.dataset.historyStage) < step);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    const themeLabel = document.getElementById('certHistoryThemeLabel');
    if (themeLabel) themeLabel.textContent = `Reviewing: ${signal.label}`;
    document.querySelector('.cert-history-route')?.style.setProperty('--history-progress', `${((step + 0.5) / historicalStages.length) * 100}%`);
    const copy = {
      receive: signal.signal,
      diagnose: `${signal.revealed} ${signal.context}`,
      plan: signal.plan,
      execute: signal.response,
      observe: signal.change
    };
    const note = activeHistoryStage === 'receive' ? 'Historical partner signal, paraphrased.'
      : activeHistoryStage === 'observe' ? 'A maintenance-practice change—not a claim of improved scores or satisfaction.'
      : 'The approved scope and source authority shaped the response.';
    historyDetail.setAttribute('aria-labelledby', `cert-history-theme-${activeHistoryTheme} cert-history-stage-${activeHistoryStage}`);
    document.getElementById('certHistoryKicker').textContent = `${String(step + 1).padStart(2, '0')} / 05 · ${signal.label}`;
    document.getElementById('certHistoryTitle').textContent = historicalHeadings[activeHistoryStage];
    document.getElementById('certHistoryCopy').textContent = copy[activeHistoryStage];
    document.getElementById('certHistoryNote').textContent = note;
    historyDetail.classList.remove('is-entering');
    void historyDetail.offsetWidth;
    historyDetail.classList.add('is-entering');
  };
  const bindHistoryTabs = (buttons, property) => buttons.forEach((button, index) => {
    button.addEventListener('click', () => { if (property === 'theme') { activeHistoryTheme = index; activeHistoryStage = 'receive'; } else activeHistoryStage = button.dataset.historyStage; renderHistory(); });
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + buttons.length) % buttons.length;
      buttons[next].focus();
      if (property === 'theme') { activeHistoryTheme = next; activeHistoryStage = 'receive'; } else activeHistoryStage = buttons[next].dataset.historyStage;
      renderHistory();
    });
  });
  bindHistoryTabs(historyThemeTabs, 'theme');
  bindHistoryTabs(historyStageTabs, 'stage');
  renderHistory();

  const changeData = {
    terminology: { source:'Portfolio term revised', affected:'Module labels + one knowledge check', stable:'Objectives, route, assessment gate', action:'Revise wording → review → QA', visual:'<div class="redesign-window-head"><b>CONTENT EDITOR / VERSION 02</b><span>Terminology update</span></div><div class="redesign-term-change"><small>APPROVED SOURCE</small><div><del>Legacy product term</del><i>→</i><strong>Approved portfolio term</strong></div></div><div class="redesign-term-links"><span><b>01</b> Lesson label <em>Updated</em></span><span><b>02</b> Scenario prompt <em>Updated</em></span><span><b>03</b> Knowledge check <em>Updated</em></span></div><div class="redesign-window-foot"><span>Source trace ✓</span><span>SME review ✓</span><span>Language QA ✓</span></div>' },
    audience: { source:'New learner population', affected:'Entry support + LMS route', stable:'Shared seller core', action:'Add route → UAT → support', visual:'<div class="redesign-window-head"><b>LMS / AUDIENCE ROUTES</b><span>Rule test</span></div><div class="redesign-audience-entry"><small>LEARNER PROFILE</small><strong>Role + organization</strong><i>↓</i></div><div class="redesign-audience-branches"><div><b>Seller</b><span>Entry guidance A</span></div><div><b>Partner</b><span>Entry guidance B</span></div></div><div class="redesign-shared-core"><span>Shared certification core</span><strong>One curriculum · two routes</strong></div><div class="redesign-window-foot"><span>Visibility ✓</span><span>Enrollment ✓</span><span>Support route ✓</span></div>' },
    product: { source:'Product information updated', affected:'Feature explanation + scenario cue', stable:'Decision sequence and course map', action:'Trace source → revise → retest', visual:'<div class="redesign-window-head"><b>REVIEW WORKSPACE / VERSION 03</b><span>Product change</span></div><div class="redesign-product-source"><small>SOURCE UPDATE</small><strong>Capability detail changed</strong><span>Owner confirmed · revision noted</span></div><div class="redesign-product-path"><span><b>1</b> Explain</span><i>→</i><span><b>2</b> Scenario cue</span><i>→</i><span><b>3</b> Check</span></div><div class="redesign-product-preview"><b>Scenario preview</b><span>Customer signal → revised response cue</span><em>Retest passed ✓</em></div><div class="redesign-window-foot"><span>Source ✓</span><span>Interaction ✓</span><span>Assessment stable ✓</span></div>' }
  };
  const changeButtons = [...document.querySelectorAll('[data-change]')];
  const changeDisplay = document.getElementById('certChangeDisplay');
  linkTabPanel(changeButtons, changeDisplay, 'cert-change');
  const renderChange = (key) => {
    const data = changeData[key]; if (!data || !changeDisplay) return;
    changeButtons.forEach((button) => { const active = button.dataset.change === key; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
    const selected = changeButtons.find((button) => button.dataset.change === key);
    if (selected) changeDisplay.setAttribute('aria-labelledby', selected.id);
    changeDisplay.dataset.change = key;
    changeDisplay.innerHTML = `<div class="cert-redesign-scene" data-scene="${key}" role="img" aria-label="${key === 'terminology' ? 'Approved terminology is traced into two lessons and a knowledge check, then reviewed' : key === 'audience' ? 'Seller and partner profiles take separate entry routes into one shared certification core' : 'A product source update moves through the explanation and scenario cue before a retest'}">${data.visual}</div><div class="cert-cycle-explain"><small>Change detected</small><strong>${data.source}</strong><small>Targeted revision</small><strong>${data.affected}</strong><small>Still stable</small><strong>${data.stable}</strong><span>${data.action}</span></div>`;
  };
  changeButtons.forEach((button, index) => {
    button.tabIndex = index === 0 ? 0 : -1;
    button.addEventListener('click', () => renderChange(button.dataset.change));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? changeButtons.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + changeButtons.length) % changeButtons.length;
      changeButtons[next].focus(); renderChange(changeButtons[next].dataset.change);
    });
  });
  renderChange('terminology');

  const curriculumData = {
    intro:{label:'Introduction',title:"Start with the seller's job, not a technical data dump.",summary:'The opening establishes what the seller should be able to recognize and discuss before moving into product or solution detail.',behavior:'Explain the business context and recognize when the topic belongs in a customer conversation.',image:'../../../../assets/project-images/cellular-certification/cert-introduction.webp',alt:'Sanitized certification introduction screen.',hotspots:[['Role context','The first screen orients the seller to the job and learning goal.'],['Path cue','The learner can see where this module leads next.']]},
    market:{label:'Market Opportunity',title:'Teach the market signal before asking for product recall.',summary:'This section gives sellers enough context to spot the business conditions, customer pressures, and opportunity signals that make cellular networking relevant.',behavior:'Recognize customer conditions that justify deeper discovery rather than pitching a product too early.',image:'../../../../assets/project-images/cellular-certification/cert-market-opportunity.webp',alt:'Sanitized cellular networking market opportunity screen.',hotspots:[['Opportunity cue','A market signal becomes a prompt for discovery, not product recall.'],['Customer context','The example translates conditions into a conversation trigger.']]},
    value:{label:'Need → Value',title:'Translate the customer problem into a credible value conversation.',summary:'The curriculum connects operational challenges to outcomes and value so the seller can move from symptoms to business relevance without overstepping into engineering detail.',behavior:'Connect a customer need to an outcome and explain why the capability matters in business terms.',image:'../../../../assets/project-images/cellular-certification/cert-need-to-value.webp',alt:'Sanitized need-to-value learning screen.',hotspots:[['Customer need','Start with the operational problem the customer experiences.'],['Value bridge','Link the need to a credible business outcome.']]},
    scenario:{label:'Customer Scenario',title:'Make the learner use the decision logic in context.',summary:'A fictionalized customer situation asks the learner to interpret the evidence, choose the stronger direction, and use feedback before the formal assessment.',behavior:'Apply discovery and solution-fit reasoning to a realistic seller situation.',image:'../../../../assets/project-images/cellular-certification/cert-customer-scenario.webp',alt:'Sanitized customer scenario interaction.',hotspots:[['Situation','The learner interprets a customer situation before choosing.'],['Feedback','Coaching connects the choice back to evidence.']]},
    check:{label:'Knowledge Check',title:'Use retrieval to verify the distinction before the final assessment.',summary:'Short checks reinforce the concepts that are easy to confuse and surface misconceptions while feedback can still correct the reasoning.',behavior:'Distinguish between similar options and explain which evidence makes one choice stronger.',image:'../../../../assets/project-images/cellular-certification/cert-knowledge-check.webp',alt:'Sanitized cellular networking knowledge check.',hotspots:[['Retrieval','A concise question asks the learner to make a distinction.'],['Correction','Feedback can correct reasoning before the credential gate.']]},
    complete:{label:'Completion',title:'Close the module with the next seller action visible.',summary:'The learner leaves with a completed module state and a clear next step in the pathway instead of treating completion as the end of the experience.',behavior:'Carry the decision framework into the next module, customer conversation, or assessment requirement.',image:'../../../../assets/project-images/cellular-certification/cert-module-complete.webp',alt:'Sanitized module completion screen.',hotspots:[['Progress','The module closes with a visible completion state.'],['Next action','Completion connects to the next requirement or seller use.']]}
  };
  const curriculumButtons=[...document.querySelectorAll('[data-curriculum]')];
  const curriculumPlayer=document.querySelector('.curriculum-player');
  linkTabPanel(curriculumButtons, curriculumPlayer, 'cert-curriculum');
  const curriculumImage=document.getElementById('curriculumImage');
  const curriculumHotspots=document.getElementById('curriculumHotspots');
  const curriculumHotspotCaption=document.getElementById('curriculumHotspotCaption');
  const curriculumBack=document.getElementById('curriculumBack');
  const curriculumNext=document.getElementById('curriculumNext');
  const curriculumDisplay = document.querySelector('.curriculum-computer-display');
  let checkedAnswer = false;
  let selectedAnswer = -1;
  let completedFromQuiz = false;
  let quizAdvanceTimer = 0;
  let lastCurriculumKey = '';
  const continueInScreen = () => {
    const index = curriculumButtons.findIndex((button) => button.classList.contains('active'));
    if (index < curriculumButtons.length - 1) renderCurriculum(curriculumButtons[index + 1].dataset.curriculum);
    else { checkedAnswer = false; selectedAnswer = -1; renderCurriculum('intro'); }
    curriculumHotspots?.querySelector('.curriculum-vertical-hotspot,.curriculum-outcome-cover:not(:disabled),.curriculum-quiz-answer,.curriculum-screen-continue')?.focus();
  };
  const screenButton = (label, className, action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
  };
  const renderCurriculum=(key)=>{
    const data=curriculumData[key]; if(!data||!curriculumImage)return;
    if (quizAdvanceTimer) { window.clearTimeout(quizAdvanceTimer); quizAdvanceTimer = 0; }
    if (key === 'check' && lastCurriculumKey !== 'check') { selectedAnswer = -1; checkedAnswer = false; }
    lastCurriculumKey = key;
    const index=curriculumButtons.findIndex(button=>button.dataset.curriculum===key);
    curriculumButtons.forEach((button,buttonIndex)=>{const active=buttonIndex===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    const completionTab = curriculumButtons.find((button) => button.dataset.curriculum === 'complete');
    if (completionTab) { completionTab.disabled = !checkedAnswer; completionTab.setAttribute('aria-disabled', String(!checkedAnswer)); }
    curriculumPlayer?.setAttribute('aria-labelledby',curriculumButtons[index].id);
    const currentProgress=(index+1)+' / '+curriculumButtons.length;
    document.getElementById('curriculumProgress').textContent=currentProgress;
    document.getElementById('curriculumScreenProgress').textContent=currentProgress;
    document.getElementById('curriculumScreenProgressFill').style.width=((index+1)/curriculumButtons.length*100)+'%';
    document.getElementById('curriculumLabel').textContent=data.label;
    document.getElementById('curriculumTitle').textContent=data.title;
    document.getElementById('curriculumSummary').textContent=data.summary;
    document.getElementById('curriculumBehavior').textContent=data.behavior;
    document.getElementById('curriculumStepText').textContent=`${data.label} · ${index+1} of ${curriculumButtons.length}`;
    curriculumBack.disabled=index===0;
    curriculumNext.textContent=index===curriculumButtons.length-1?'Restart ↺':'Next →';
    curriculumNext.setAttribute('aria-label',index===curriculumButtons.length-1?'Restart learner walkthrough':'Next learner view');
    curriculumNext.disabled = key === 'check' && !checkedAnswer;
    curriculumDisplay.dataset.view = key;
    if (curriculumHotspots && curriculumHotspotCaption) {
      curriculumHotspots.replaceChildren();
      if (key === 'market') {
        const verticals = [
          ['Manufacturing', 'Fictional use case: connect mobile workstations across a busy production floor.'],
          ['Transportation', 'Fictional use case: keep dispatch and yard teams connected as vehicles move.'],
          ['Healthcare', 'Fictional use case: support secure connectivity for mobile clinical workflows.'],
          ['Education', 'Fictional use case: connect campus operations across buildings and outdoor areas.'],
          ['Energy & Utilities', 'Fictional use case: reach field crews and connected assets in remote areas.'],
          ['Public Sector', 'Fictional use case: support reliable communications for distributed service teams.']
        ];
        const grid = document.createElement('div');
        grid.className = 'curriculum-vertical-grid';
        verticals.forEach(([label, description], tileIndex) => {
          const tile = screenButton(label, 'curriculum-vertical-hotspot', () => {
            grid.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === tile));
            curriculumHotspotCaption.textContent = description;
          });
          tile.setAttribute('aria-label', `Explore ${label} cellular use case`);
          tile.style.setProperty('--tile-index', tileIndex);
          grid.append(tile);
        });
        curriculumHotspots.append(grid);
        curriculumHotspotCaption.textContent = 'Select an industry tile to see a fictional cellular use case.';
      } else if (key === 'value') {
        const outcomes = ['Supports growth and new use cases', 'Helps protect people, devices, and data', 'Reduces complexity and IT workload'];
        const covers = document.createElement('div');
        covers.className = 'curriculum-outcome-covers';
        outcomes.forEach((outcome) => {
          const cover = screenButton('Click me', 'curriculum-outcome-cover', () => {
            cover.classList.add('revealed');
            cover.disabled = true;
            curriculumHotspotCaption.textContent = outcome;
            const nextCover = covers.querySelector('.curriculum-outcome-cover:not(:disabled)');
            if (nextCover) nextCover.focus();
            else curriculumHotspots.querySelector('.curriculum-screen-continue')?.focus();
          });
          cover.setAttribute('aria-label', `Reveal outcome: ${outcome}`);
          covers.append(cover);
        });
        curriculumHotspots.append(covers);
        curriculumHotspotCaption.textContent = 'Reveal the three value outcomes, then continue.';
      } else if (key === 'check') {
        const quiz = document.createElement('div');
        quiz.className = 'curriculum-live-quiz';
        quiz.innerHTML = '<div class="curriculum-quiz-header"><small>KNOWLEDGE CHECK · 05 / 06</small><strong>What’s the Biggest Benefit?</strong><p>Choose the strongest outcome for a customer who needs dependable cellular connectivity.</p></div><div class="curriculum-quiz-answers" role="radiogroup" aria-label="Biggest benefit options"></div><p class="curriculum-quiz-feedback" aria-live="polite">Choose an answer, then check it.</p>';
        const answers = ['Improved reliability and uptime', 'Lower hardware costs', 'More devices on the network', 'Faster initial setup'];
        const answerBox = quiz.querySelector('.curriculum-quiz-answers');
        const feedback = quiz.querySelector('.curriculum-quiz-feedback');
        answers.forEach((answer, answerIndex) => {
          const choice = screenButton(answer, 'curriculum-quiz-answer', () => {
            selectedAnswer = answerIndex;
            checkedAnswer = false;
            curriculumNext.disabled = true;
            if (completionTab) { completionTab.disabled = true; completionTab.setAttribute('aria-disabled','true'); }
            answerBox.querySelectorAll('button').forEach((item, itemIndex) => {
              item.classList.toggle('selected', itemIndex === answerIndex);
              item.classList.remove('incorrect');
              item.setAttribute('aria-checked', String(itemIndex === answerIndex));
            });
            feedback.textContent = 'Ready to check your answer.';
            feedback.classList.remove('incorrect');
          });
          choice.setAttribute('role', 'radio');
          choice.setAttribute('aria-checked', String(selectedAnswer === answerIndex));
          if (selectedAnswer === answerIndex) choice.classList.add('selected');
          answerBox.append(choice);
        });
        answerBox.addEventListener('keydown', (event) => {
          if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
          event.preventDefault();
          const options = [...answerBox.querySelectorAll('button')];
          const current = options.indexOf(document.activeElement);
          const target = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1) + options.length) % options.length;
          options[target].focus(); options[target].click();
        });
        const check = screenButton('Check Answer', 'curriculum-screen-continue curriculum-quiz-check', () => {
          if (selectedAnswer < 0) { feedback.textContent = 'Select an answer first.'; return; }
          if (selectedAnswer !== 0) {
            answerBox.querySelectorAll('button').forEach((item, itemIndex) => item.classList.toggle('incorrect', itemIndex === selectedAnswer));
            feedback.textContent = 'Try again. Think about the customer’s core need.';
            feedback.classList.add('incorrect');
            return;
          }
          checkedAnswer = true;
          completedFromQuiz = true;
          feedback.textContent = 'Correct! Reliable service is the central benefit in this example.';
          quiz.classList.add('correct');
          quizAdvanceTimer = window.setTimeout(() => { quizAdvanceTimer = 0; renderCurriculum('complete'); curriculumHotspots.querySelector('.curriculum-screen-continue')?.focus(); }, 520);
        });
        quiz.append(check);
        curriculumHotspots.append(quiz);
        curriculumHotspotCaption.textContent = 'Answer the question to unlock completion.';
      } else {
        curriculumHotspotCaption.textContent = key === 'scenario' ? 'Notice the three key needs, then continue.' : key === 'complete' ? 'Module complete. Continue to the next module when ready.' : 'Select Continue in the learner screen.';
      }
      if (key !== 'check') {
        const label = key === 'complete' ? 'Continue to Next Module →' : 'Continue →';
        curriculumHotspots.append(screenButton(label, 'curriculum-screen-continue', continueInScreen));
      }
      if (key === 'complete' && completedFromQuiz) {
        const celebration = document.createElement('div');
        celebration.className = 'curriculum-celebration';
        celebration.setAttribute('aria-hidden', 'true');
        celebration.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>';
        curriculumHotspots.prepend(celebration);
        completedFromQuiz = false;
      }
    }
    if (key !== 'check') { curriculumImage.src=data.image; curriculumImage.alt=data.alt; }
  };
  curriculumButtons.forEach((button,index)=>{
    button.addEventListener('click',()=>renderCurriculum(button.dataset.curriculum));
    button.addEventListener('keydown',(event)=>{
      if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      let next=index;
      if(event.key==='Home')next=0; else if(event.key==='End')next=curriculumButtons.length-1;
      else if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%curriculumButtons.length;
      else next=(index-1+curriculumButtons.length)%curriculumButtons.length;
      if (curriculumButtons[next].disabled) { curriculumHotspotCaption.textContent = 'Complete the knowledge check to unlock this screen.'; return; }
      curriculumButtons[next].focus();renderCurriculum(curriculumButtons[next].dataset.curriculum);
    });
  });
  curriculumBack?.addEventListener('click',()=>{
    const index=curriculumButtons.findIndex((button)=>button.classList.contains('active'));
    if(index>0){
      renderCurriculum(curriculumButtons[index-1].dataset.curriculum);
      if(index===1) curriculumNext.focus();
    }
  });
  curriculumNext?.addEventListener('click',()=>{
    const index=curriculumButtons.findIndex((button)=>button.classList.contains('active'));
    if (index === 4 && !checkedAnswer) return;
    const next=(index+1)%curriculumButtons.length;
    if (next === 0) { checkedAnswer = false; selectedAnswer = -1; }
    renderCurriculum(curriculumButtons[next].dataset.curriculum);
  });
  curriculumButtons.forEach((button,index)=>button.tabIndex=index===0?0:-1);
  renderCurriculum('intro');

  const growthData = {
    history:['Preserve decision history','When source owners or terminology change, documented rationale protects consistency.'],
    business:['Understand the business','Portfolio and market context improve learner decisions and future flexibility.'],
    authority:['Separate authority from design','SMEs validate product truth; I design how learners understand, practice, and demonstrate it.'],
    feedback:['Interpret feedback in context','A learner signal may point to content, assessment, operations, organizational scope, or a combination.'],
    lms:['Treat the LMS as design','Access, routing, completion, reporting, and support shape the actual pathway.'],
    change:['Plan for change','Reusable structure reduces the cost of product, message, and audience revisions.']
  };
  const growthWorkbench = document.querySelector('.cert-growth-workbench');
  const growthButtons = [...document.querySelectorAll('.cert-growth-skills button[data-growth]')];
  const growthInsight = document.getElementById('certGrowthInsight');
  linkTabPanel(growthButtons, growthInsight, 'cert-growth');
  const growthIcons = ['mini-document-list.webp','mini-analytics.webp','mini-shield.webp','mini-chat.webp','mini-database.webp','mini-sync.webp'];
  growthButtons.forEach((button, index) => {
    const bubble = document.createElement('span');
    bubble.className = 'cert-growth-icon';
    bubble.setAttribute('aria-hidden','true');
    bubble.innerHTML = `<img src="../../../../assets/icons/pixel/lms/${growthIcons[index]}" alt="">`;
    button.prepend(bubble);
  });
  const growthClose = document.createElement('button');
  growthClose.type = 'button';
  growthClose.className = 'cert-growth-close';
  growthClose.setAttribute('aria-label', 'Close project insight');
  growthClose.textContent = '×';
  growthClose.addEventListener('click', () => {
    const previouslyActive = growthButtons.find((item) => item.classList.contains('active'));
    growthInsight.hidden = true;
    growthWorkbench.dataset.growth = '';
    growthButtons.forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected','false'); item.tabIndex = 0; });
    previouslyActive?.focus();
  });
  growthInsight.prepend(growthClose);
  growthInsight.hidden = true;
  growthWorkbench.dataset.growth = '';
  growthButtons.forEach((button) => { button.classList.remove('active'); button.setAttribute('aria-selected','false'); });
  growthButtons.forEach((button, index) => {
    button.tabIndex = 0;
    const activate = () => {
      const key = button.dataset.growth;
      growthWorkbench.dataset.growth = key;
      growthInsight.hidden = false;
      growthButtons.forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
      growthInsight.setAttribute('aria-labelledby', button.id);
      growthInsight.querySelector('strong').textContent = growthData[key][0];
      growthInsight.querySelector('p').textContent = growthData[key][1];
    };
    button.addEventListener('click', activate);
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? growthButtons.length - 1 : (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + growthButtons.length) % growthButtons.length;
      growthButtons[next].focus(); growthButtons[next].click();
    });
  });

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
