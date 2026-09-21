(() => {
  const overviewData = {
    inherit: {
      label: '01 / Origin',
      title: 'Two historic lines and a new third line needed one pathway.',
      text: 'The original lines came from separate business operations that were merging. The new line had to join the broader portfolio without erasing meaningful distinctions for sellers.',
      motion: `<div class="cert-origin-visual" aria-hidden="true"><div class="cert-origin-sources"><span><b>Historic operation A</b><small>Product line 1</small></span><span><b>Historic operation B</b><small>Product line 2</small></span><span><b>New portfolio line</b><small>Product line 3</small></span></div><div class="cert-origin-merge"><i></i><strong>One certification architecture</strong></div></div>`
    },
    change: {
      label: '02 / Change',
      title: 'The underlying information changed on several fronts at once.',
      text: 'I reconciled names, features, terminology, messaging, target verticals, positioning, go-to-market routes, brand, assessment, and delivery so a learner still encountered one coherent journey.',
      motion: `<div class="cert-change-visual" aria-hidden="true"><div class="cert-change-before"><span>Names + features</span><span>Markets + messaging</span><span>Brand + ownership</span></div><div class="cert-change-transform">Reconcile<br>and structure</div><div class="cert-change-after"><b>Seller pathway</b><small>Consistent learning decisions</small></div></div>`
    },
    sources: {
      label: '03 / Sources',
      title: 'Decision continuity mattered as much as collecting comments.',
      text: 'Source teams were still partly separated by historic business lines. I tracked who owned each fact, recorded changes and rationale, and kept review packages aligned as authority and scope evolved.',
      motion: `<div class="cert-source-visual" aria-hidden="true"><div class="cert-source-files"><span>SME input</span><span>Product source</span><span>Business decision</span></div><div class="cert-source-ledger"><b>Decision record</b><span>Owner <i>confirmed</i></span><span>Terminology <i>current</i></span><span>Revision <i>tracked</i></span></div></div>`
    },
    timeline: {
      label: '04 / Delivery',
      title: 'The target moved from about ten months to about four.',
      text: 'I reprioritized, used reusable structures, planned parallel development and review, and protected essential learning and validation gates rather than treating the shorter window as permission to strip out the system.',
      motion: `<div class="cert-timeline-visual" aria-hidden="true"><small class="cert-timeline-key">Same scale: each segment represents about one month</small><div class="cert-timeline-row"><b>Original plan</b><span class="cert-timeline-track long"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><strong>~10 months</strong></div><div class="cert-timeline-row"><b>Replanned</b><span class="cert-timeline-track short"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><strong>~4 months</strong></div><div class="cert-timeline-phases">Design · parallel build + review · UAT · release</div></div>`
    }
  };
  const overviewButtons = [...document.querySelectorAll('[data-overview]')];
  const overviewLabel = document.getElementById('overviewDetailLabel');
  const overviewTitle = document.getElementById('overviewDetailTitle');
  const overviewText = document.getElementById('overviewDetailText');
  const overviewMotion = document.getElementById('overviewMotion');
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
    window.setTimeout(() => {
      overviewLabel.textContent = data.label;
      overviewTitle.textContent = data.title;
      overviewText.textContent = data.text;
      if (overviewMotion) {
        overviewMotion.className = `overview-motion overview-motion-${button.dataset.overview}`;
        overviewMotion.innerHTML = data.motion;
      }
      detail.classList.remove('is-switching');
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

  const blueprintData = {
    pathway: {
      title: 'Connect the full certification around decisions sellers make.',
      text: 'Multiple courses formed a shared core. Resources, practice, knowledge checks, a cumulative assessment, formal completion, learner feedback, reporting, and support made it an operating pathway.',
      html: `
        <div class="cert-architecture" aria-label="Certification architecture">
          <div class="cert-architecture-row cert-course-row"><span>Portfolio context</span><span>Customer use cases</span><span>Solution positioning</span><span>Handoff + resources</span></div>
          <div class="cert-architecture-row cert-practice-row"><span>Practice</span><span>Knowledge checks</span><span>Cumulative assessment</span><span>Learner evaluation</span><span>Completion</span></div>
          <div class="cert-architecture-base"><span>LMS + support</span><span>Reporting</span><span>Feedback</span></div>
          <div class="cert-architecture-loop"><span>Feedback + reporting</span><i aria-hidden="true"></i><strong>Revise the course map ↑</strong></div>
        </div>
        <p class="cert-panel-takeaway">The seller job defined the scope: recognize a situation, ask useful discovery questions, distinguish approaches, explain value, and know the next step—not become an implementation engineer.</p>`
    },
    audience: {
      title: 'Route one shared core to learners with different starting points.',
      text: 'Internal sellers, external partners, new populations, and different roles did not have equal product knowledge or LMS familiarity. I adjusted pacing, terminology, resources, assessment preparation, access, and support around that reality.',
      html: `<div class="cert-audience-map" aria-label="Audience routing"><div class="cert-audience-entry"><span>Internal sellers</span><span>Channel partners</span><span>New learners</span></div><div class="cert-audience-core">Shared seller core<br><small>Discovery · fit · value · next step</small></div><div class="cert-audience-routes"><span>Global common path</span><span>U.S. neutral-host context</span><span>Optional technical foundations</span></div></div><p class="cert-panel-takeaway">Specialized material branched only when it changed the learner's decision or requirement. Optional technical foundations stayed available without inflating the required core.</p>`
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
        <div class="cert-operating-visual" aria-label="Operational certification layers">
          <div class="cert-operating-learner"><b>Learner-facing</b><span>Course path</span><span>Practice + checks</span><span>Assessment</span></div>
          <div class="cert-operating-admin"><b>Administrator-facing</b><span>Access + routes</span><span>Completion record</span><span>Support + reporting</span></div>
          <div class="cert-operating-link">One valid certification journey</div>
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

  const renderBlueprint = (key, animate = false) => {
    const data = blueprintData[key];
    if (!data || !blueprintPanel) return;
    const update = () => {
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
  renderDelivery('build');

  const historicalSignals = [
    {
      label: 'Assessment integrity',
      signal: 'A partner reported contradictory questions or an answer marked incorrect on the final assessment.',
      revealed: 'Confidence in the credential depends on defensible answer keys and unambiguous wording.',
      context: 'Source facts and terminology were changing while assessment items were being reviewed.',
      response: 'I treated the report as an assessment-integrity issue: trace the item to its source, check the intended objective and answer key with reviewers, revise where validated, and retest the learner path.',
      change: 'Assessment review became more explicit about ambiguity, answer-key integrity, and a decision trail for future updates.'
    },
    {
      label: 'Cognitive load',
      signal: 'A partner found parts of the earlier material text-heavy or repetitive and asked for more audio or video.',
      revealed: 'The experience needed more selective explanation and practice, not simply more source content.',
      context: 'Several evolving product lines and a compressed schedule put pressure on how much information the core path carried.',
      response: 'I reviewed the information hierarchy, separated required decisions from optional depth, and considered visuals, interactions, or multimedia where they would clarify the task.',
      change: 'The maintenance approach put more weight on applied seller decisions and controlled content depth rather than adding a new modality by default.'
    },
    {
      label: 'Entry knowledge',
      signal: 'A partner without a technical background found IT acronyms hard to follow.',
      revealed: 'A shared certification needed to support learners with different starting knowledge.',
      context: 'The original audience mix and approved scope did not always allow a full foundational enablement layer inside the required training.',
      response: 'I reviewed terminology in the core, added context and resources within scope, and differentiated optional technical foundations from required seller decisions.',
      change: 'The design approach recognized distinct entry points without requiring every learner to take the same technical depth.'
    },
    {
      label: 'Time expectations',
      signal: 'A partner said earlier course-time estimates felt too low.',
      revealed: 'The published time should reflect the work learners actually do, including reading, practice, and assessment.',
      context: 'Different levels of prior knowledge made one estimate especially easy to understate.',
      response: 'I reviewed pacing and learner effort against the intended pathway, then flagged estimates or content scope for recalibration where warranted.',
      change: 'Time guidance became an explicit maintenance check, accounting for reading, practice, assessment, and different starting knowledge.'
    }
  ];
  const feedbackPanel = document.getElementById('certFeedbackPanel');
  const feedbackTabs = [...document.querySelectorAll('[data-feedback-view]')];
  let activeHistorical = 0;
  const renderHistorical = () => {
    const signal = historicalSignals[activeHistorical];
    if (!feedbackPanel) return;
    feedbackPanel.innerHTML = `<div class="cert-signal-picker" role="tablist" aria-label="Historical feedback themes">${historicalSignals.map((item, index) => `<button type="button" role="tab" aria-selected="${index === activeHistorical}" class="${index === activeHistorical ? 'active' : ''}" data-signal="${index}">${item.label}</button>`).join('')}</div><div class="cert-signal-case"><h3>${signal.label}</h3><div class="cert-signal-stages"><div><small>Partner signal</small><p>${signal.signal}</p></div><div><small>What it revealed</small><p>${signal.revealed}</p></div><div><small>Context</small><p>${signal.context}</p></div><div><small>My response</small><p>${signal.response}</p></div><div><small>What changed</small><p>${signal.change}</p></div></div></div>`;
    const choices = [...feedbackPanel.querySelectorAll('[data-signal]')];
    choices.forEach((button, index) => {
      button.tabIndex = index === activeHistorical ? 0 : -1;
      button.addEventListener('click', () => { activeHistorical = index; renderHistorical(); });
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        activeHistorical = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + choices.length) % choices.length;
        renderHistorical(); feedbackPanel.querySelector(`[data-signal="${activeHistorical}"]`)?.focus();
      });
    });
  };
  const renderFeedback = (view) => {
    if (!feedbackPanel) return;
    feedbackTabs.forEach((tab) => { const active = tab.dataset.feedbackView === view; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    if (view === 'historical') { renderHistorical(); return; }
    feedbackPanel.innerHTML = `<div class="cert-positive-stage"><div class="cert-positive-main"><span>Partner feedback</span><blockquote>“Exceptionally prepared, presented and structured”</blockquote><p>Partners also valued the reference tools, case studies, whitepapers, and supporting material they could return to in customer conversations.</p></div><div class="cert-positive-secondary"><span>Partner feedback</span><blockquote>“Very good overview with many opportunities to dive in deeper.”</blockquote><p>Other responses described practical use cases, a relevant and easy-to-follow flow, and a positive overall learning experience.</p></div></div><p class="cert-feedback-caveat">Anonymous partner comments; qualitative signals, not representative satisfaction or outcome metrics.</p>`;
  };
  feedbackTabs.forEach((tab, index) => {
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.addEventListener('click', () => renderFeedback(tab.dataset.feedbackView));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? feedbackTabs.length - 1 : (index + (event.key === 'ArrowLeft' ? -1 : 1) + feedbackTabs.length) % feedbackTabs.length;
      feedbackTabs[next].focus(); renderFeedback(feedbackTabs[next].dataset.feedbackView);
    });
  });
  renderFeedback('positive');

  const changeData = {
    terminology: { source:'Portfolio term revised', affected:'Module labels + one knowledge check', stable:'Objectives, route, assessment gate', action:'Revise wording → review → QA' },
    audience: { source:'New learner population', affected:'Entry support + LMS route', stable:'Shared seller core', action:'Add route → UAT → support' },
    product: { source:'Product information updated', affected:'Feature explanation + scenario cue', stable:'Decision sequence and course map', action:'Trace source → revise → retest' }
  };
  const changeButtons = [...document.querySelectorAll('[data-change]')];
  const changeDisplay = document.getElementById('certChangeDisplay');
  const renderChange = (key) => {
    const data = changeData[key]; if (!data || !changeDisplay) return;
    changeButtons.forEach((button) => { const active = button.dataset.change === key; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
    changeDisplay.innerHTML = `<div class="cert-change-input"><small>Change arrives</small><strong>${data.source}</strong></div><div class="cert-change-impact"><small>Bounded update</small><strong>${data.affected}</strong><span>${data.action}</span></div><div class="cert-change-stable"><small>Structure retained</small><strong>${data.stable}</strong></div>`;
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
    intro:{label:'Introduction',title:"Start with the seller's job, not a technical data dump.",summary:'The opening establishes what the seller should be able to recognize and discuss before moving into product or solution detail.',behavior:'Explain the business context and recognize when the topic belongs in a customer conversation.',image:'../../../../assets/project-images/cellular-certification/cert-introduction.webp',alt:'Sanitized certification introduction screen.'},
    market:{label:'Market Opportunity',title:'Teach the market signal before asking for product recall.',summary:'This section gives sellers enough context to spot the business conditions, customer pressures, and opportunity signals that make cellular networking relevant.',behavior:'Recognize customer conditions that justify deeper discovery rather than pitching a product too early.',image:'../../../../assets/project-images/cellular-certification/cert-market-opportunity.webp',alt:'Sanitized cellular networking market opportunity screen.'},
    value:{label:'Need → Value',title:'Translate the customer problem into a credible value conversation.',summary:'The curriculum connects operational challenges to outcomes and value so the seller can move from symptoms to business relevance without overstepping into engineering detail.',behavior:'Connect a customer need to an outcome and explain why the capability matters in business terms.',image:'../../../../assets/project-images/cellular-certification/cert-need-to-value.webp',alt:'Sanitized need-to-value learning screen.'},
    scenario:{label:'Customer Scenario',title:'Make the learner use the decision logic in context.',summary:'A fictionalized customer situation asks the learner to interpret the evidence, choose the stronger direction, and use feedback before the formal assessment.',behavior:'Apply discovery and solution-fit reasoning to a realistic seller situation.',image:'../../../../assets/project-images/cellular-certification/cert-customer-scenario.webp',alt:'Sanitized customer scenario interaction.'},
    check:{label:'Knowledge Check',title:'Use retrieval to verify the distinction before the final assessment.',summary:'Short checks reinforce the concepts that are easy to confuse and surface misconceptions while feedback can still correct the reasoning.',behavior:'Distinguish between similar options and explain which evidence makes one choice stronger.',image:'../../../../assets/project-images/cellular-certification/cert-knowledge-check.webp',alt:'Sanitized cellular networking knowledge check.'},
    complete:{label:'Completion',title:'Close the module with the next seller action visible.',summary:'The learner leaves with a completed module state and a clear next step in the pathway instead of treating completion as the end of the experience.',behavior:'Carry the decision framework into the next module, customer conversation, or assessment requirement.',image:'../../../../assets/project-images/cellular-certification/cert-module-complete.webp',alt:'Sanitized module completion screen.'}
  };
  const curriculumButtons=[...document.querySelectorAll('[data-curriculum]')];
  const curriculumImage=document.getElementById('curriculumImage');
  const curriculumBack=document.getElementById('curriculumBack');
  const curriculumNext=document.getElementById('curriculumNext');
  const renderCurriculum=(key)=>{
    const data=curriculumData[key]; if(!data||!curriculumImage)return;
    const index=curriculumButtons.findIndex(button=>button.dataset.curriculum===key);
    curriculumButtons.forEach((button,buttonIndex)=>{const active=buttonIndex===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    document.getElementById('curriculumProgress').textContent=(index+1)+' / '+curriculumButtons.length;
    document.getElementById('curriculumLabel').textContent=data.label;
    document.getElementById('curriculumTitle').textContent=data.title;
    document.getElementById('curriculumSummary').textContent=data.summary;
    document.getElementById('curriculumBehavior').textContent=data.behavior;
    document.getElementById('curriculumStepText').textContent=`${data.label} · ${index+1} of ${curriculumButtons.length}`;
    curriculumBack.disabled=index===0;
    curriculumNext.textContent=index===curriculumButtons.length-1?'Restart ↺':'Next →';
    curriculumNext.setAttribute('aria-label',index===curriculumButtons.length-1?'Restart learner walkthrough':'Next learner view');
    curriculumImage.classList.add('is-switching');
    window.setTimeout(()=>{curriculumImage.src=data.image;curriculumImage.alt=data.alt;curriculumImage.classList.remove('is-switching');},100);
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
    const next=(index+1)%curriculumButtons.length;
    renderCurriculum(curriculumButtons[next].dataset.curriculum);
  });
  curriculumButtons.forEach((button,index)=>button.tabIndex=index===0?0:-1);
  renderCurriculum('intro');

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
