(() => {
  const overviewData = {
    problem: {
      label: 'Problem',
      title: 'Translate technical source material into seller decisions.',
      text: 'The curriculum needed enough technical context to support credible discovery and solution-fit conversations without turning the pathway into engineering training.',
      motion: `
        <span><img src="../../../../assets/icons/pixel/lms/mini-document.webp" alt=""><small>Source</small></span>
        <i></i>
        <span><img src="../../../../assets/icons/pixel/lms/mini-report-search.webp" alt=""><small>Scope</small></span>
        <i></i>
        <span><img src="../../../../assets/icons/pixel/portfolio-general/learning.webp" alt=""><small>Seller decision</small></span>`
    },
    ownership: {
      label: 'What I owned',
      title: 'Connect curriculum, practice, assessment, delivery, and maintenance.',
      text: 'I carried the work from objectives and content architecture through development, SME review, learner-path validation, LMS testing, reporting support, and future updates.',
      motion: `
        <span><img src="../../../../assets/icons/pixel/lms/mini-hierarchy.webp" alt=""><small>Architecture</small></span>
        <i></i>
        <span><img src="../../../../assets/icons/pixel/lms/mini-edit.webp" alt=""><small>Build</small></span>
        <i></i>
        <span><img src="../../../../assets/icons/pixel/lms/mini-cloud-upload.webp" alt=""><small>LMS</small></span>
        <i></i>
        <span><img src="../../../../assets/icons/pixel/lms/mini-sync.webp" alt=""><small>Maintain</small></span>`
    },
    boundary: {
      label: 'Public boundary',
      title: 'Show the design logic without reproducing proprietary material.',
      text: 'The public case study keeps the real instructional decisions and workflow while replacing customer details, internal naming, product language, and source content.',
      motion: `
        <span><img src="../../../../assets/icons/pixel/lms/mini-document-list.webp" alt=""><small>Internal source</small></span>
        <i></i>
        <span><img src="../../../../assets/icons/pixel/lms/mini-shield.webp" alt=""><small>Sanitize</small></span>
        <i></i>
        <span><img src="../../../../assets/icons/pixel/portfolio-general/learning.webp" alt=""><small>Public example</small></span>`
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
    overviewButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
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
  overviewButtons.forEach((button) => button.addEventListener('click', () => selectOverview(button)));

  const blueprintData = {
    pathway: {
      title: 'Sequence the seller journey from context to application.',
      text: 'The core path keeps shared seller decisions together while deeper or market-specific content branches only when it is useful.',
      html: `
        <div class="blueprint-motion curriculum-motion" aria-label="Animated curriculum path">
          <div class="curriculum-track" aria-hidden="true"><i></i></div>
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/portfolio-general/learning.webp" alt=""><small>Context</small><strong>Recognize the need</strong></span>
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/lms/mini-audience.webp" alt=""><small>Fit</small><strong>Connect customer + solution</strong></span>
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/microlearning-performance-support/pointer-interaction.webp" alt=""><small>Practice</small><strong>Make the decision</strong></span>
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/lms/mini-certificate.webp" alt=""><small>Evidence</small><strong>Certify the judgment</strong></span>
        </div>
        <div class="blueprint-caption-grid">
          <span><strong>Core path</strong> Shared seller decisions stay required.</span>
          <span><strong>Optional depth</strong> Extra technical context stays available without inflating the main experience.</span>
        </div>`
    },
    alignment: {
      title: 'Make the relationship between objective, content, practice, and assessment visible.',
      text: 'Choose an objective and walk through the alignment decision process I used for it.',
      html: '<div class="alignment-reveal" id="alignmentReveal"></div>'
    },
    launch: {
      title: 'Design the release system before the learning is finished.',
      text: 'QA, review, LMS behavior, reporting, and maintenance are part of the learning system, not cleanup after authoring.',
      html: `
        <div class="blueprint-motion launch-motion" aria-label="Animated launch pipeline">
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/lms/mini-edit.webp" alt=""><small>QA</small><strong>Check learning + interactions</strong></span>
          <i class="launch-link"></i>
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/lms/mini-chat.webp" alt=""><small>Review</small><strong>Resolve SME feedback</strong></span>
          <i class="launch-link"></i>
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/lms/mini-cloud-upload.webp" alt=""><small>LMS + UAT</small><strong>Validate the learner path</strong></span>
          <i class="launch-link"></i>
          <span class="blueprint-motion-node"><img src="../../../../assets/icons/pixel/lms/mini-sync.webp" alt=""><small>Maintain</small><strong>Update + report</strong></span>
        </div>
        <div class="launch-note"><img src="../../../../assets/icons/pixel/lms/mini-verified.webp" alt="" aria-hidden="true"><span>Launch is complete when the learning, platform behavior, and ownership model work together.</span></div>`
    }
  };

  const alignmentExamples = [
    {
      label:'01',
      objective:'Recognize opportunity fit',
      content:'Customer signals, use cases, and qualification cues',
      practice:'Classify a customer situation and choose the next discovery move',
      assessment:'Select the strongest evidence-based discovery path'
    },
    {
      label:'02',
      objective:'Distinguish solution approaches',
      content:'Needs, constraints, and the boundaries between solution categories',
      practice:'Compare two customer situations and map each to the right direction',
      assessment:'Match the situation to the appropriate solution category'
    },
    {
      label:'03',
      objective:'Prepare the next sales step',
      content:'Role boundaries, handoff triggers, and success criteria',
      practice:'Work through a guided customer conversation',
      assessment:'Choose and justify the next seller action'
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
    });

    const stages = [
      ['Objective', example.objective, 'lms/mini-document-list.webp'],
      ['Content', example.content, 'portfolio-general/learning.webp'],
      ['Practice', example.practice, 'microlearning-performance-support/pointer-interaction.webp'],
      ['Assessment', example.assessment, 'lms/mini-certificate.webp']
    ];

    const track = reveal.querySelector('.alignment-progressive-track');
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
        ${alignmentExamples.map((item,index)=>`<button type="button" role="tab" aria-selected="${index===0}" class="alignment-objective-choice${index===0?' active':''}" data-alignment-objective="${index}"><span>${item.label}</span><strong>${item.objective}</strong></button>`).join('')}
      </div>
      <div class="alignment-progressive-track" aria-live="polite"></div>
      <div class="alignment-replay-row"><span>One objective, one evidence chain.</span><button type="button" class="alignment-replay">Replay alignment ↻</button></div>`;
    reveal.querySelectorAll('[data-alignment-objective]').forEach((button) => button.addEventListener('click', () => playAlignment(Number(button.dataset.alignmentObjective))));
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
      icon: 'icon-elearning',
      title: 'Turn the architecture into usable seller learning.',
      action: 'I built the course flow, practice, knowledge checks, and certification assessment around the seller decisions defined in the blueprint.',
      resultLabel: 'Delivered',
      result: 'A connected multi-course certification with scenario practice, assessment, and LMS support.'
    },
    review: {
      label: 'Review',
      icon: 'icon-feedback',
      title: 'Protect accuracy without letting the course drift back into source-document language.',
      action: 'I coordinated QA, accessibility checks, SME review, assessment review, and revision tracking.',
      resultLabel: 'Protected',
      result: 'Accuracy stayed reviewable without letting the pathway drift back into source-document training.'
    },
    lms: {
      label: 'LMS + UAT',
      icon: 'icon-lms',
      title: 'Validate the learner journey, not just the course files.',
      action: 'I tested visibility, enrollment, launch behavior, learner routes, completion logic, and regional requirements in the LMS.',
      resultLabel: 'Improved',
      result: 'Learners could follow the requirements relevant to their role and market without unnecessary content.'
    },
    maintain: {
      label: 'Maintain',
      icon: 'icon-automation',
      title: 'Keep the certification usable after launch.',
      action: 'I tracked affected content as sources changed and supported reporting when platform status logic did not fully match the certification design.',
      resultLabel: 'Learned',
      result: 'Routing, assessment, reporting, governance, and platform behavior work best when designed as one system.'
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
  const renderCurriculum=(key)=>{
    const data=curriculumData[key]; if(!data||!curriculumImage)return;
    const index=curriculumButtons.findIndex(button=>button.dataset.curriculum===key);
    curriculumButtons.forEach((button,buttonIndex)=>{const active=buttonIndex===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    document.getElementById('curriculumProgress').textContent=(index+1)+' / '+curriculumButtons.length;
    document.getElementById('curriculumLabel').textContent=data.label;
    document.getElementById('curriculumTitle').textContent=data.title;
    document.getElementById('curriculumSummary').textContent=data.summary;
    document.getElementById('curriculumBehavior').textContent=data.behavior;
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