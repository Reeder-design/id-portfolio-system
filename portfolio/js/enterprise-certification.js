(() => {
  const architectureData = {
    core: {
      label: 'Core Path',
      title: 'Required learning stayed focused on the decisions most sellers shared.',
      text: 'I sequenced market context, solution comparison, use cases, positioning, ordering readiness, and assessment so the required path moved from understanding to application.',
      flow: ['Orientation', 'Market Context', 'Solution Categories', 'Use Cases', 'Positioning Practice', 'Ordering Readiness', 'Assessment']
    },
    regional: {
      label: 'Regional Extension',
      title: 'Market-specific requirements became a separate route.',
      text: 'When content applied only to certain regions, I moved it into a separate extension and assessment instead of adding irrelevant requirements to every learner path.',
      flow: ['Core Path', 'Regional Context', 'Regional Assessment', 'Completion Check']
    },
    optional: {
      label: 'Optional Foundations',
      title: 'Deeper technical content stayed outside the required sales path.',
      text: 'I kept technical detail only when it supported discovery, positioning, risk, ordering, or specialist handoff. Implementation depth moved to optional or technical-role learning.',
      flow: ['Technical Foundations', 'Role-Specific Deep Dives', 'Specialist Handoff']
    }
  };

  const audienceData = {
    new: {
      title: 'Newer sellers received more context before application.',
      text: 'I used plain-language explanations, predictable sequencing, and short takeaways so learners could build a basic mental model before comparing solutions or entering scenarios.',
      cards: [
        ['Start', 'Build context first', 'Introduce only the background needed before solution comparison or scenario practice.'],
        ['Sequence', 'Move in a clear order', 'Establish context and use cases before asking for positioning or recommendations.']
      ]
    },
    experienced: {
      title: 'Experienced sellers could move quickly through familiar material.',
      text: 'Expandable detail, comparisons, and quick-reference elements let experienced learners find what they needed without repeating every explanation.',
      cards: [
        ['Layer', 'Keep depth optional', 'Place extra detail behind expandable or supporting content instead of making it required.'],
        ['Reference', 'Make comparison fast', 'Use concise references for information sellers may need again during the work.']
      ]
    },
    boundary: {
      title: 'The certification stayed focused on sales work.',
      text: 'I removed installation and engineering detail unless it directly supported a customer question, seller decision, risk discussion, ordering step, or specialist handoff.',
      cards: [
        ['Keep', 'Seller decisions', 'Customer needs, discovery questions, value, constraints, risk, and next steps.'],
        ['Move out', 'Technical execution', 'Installation, deployment, and deep implementation detail belong in technical training.']
      ]
    }
  };

  const alignmentData = {
    fit: ['Identify when an opportunity fits', 'Qualification scenario', 'Select the best-fit solution path', 'Return to use-case guidance'],
    compare: ['Distinguish related solution options', 'Side-by-side comparison', 'Match need and constraint to solution type', 'Review solution comparison'],
    handoff: ['Choose the next sales step', 'Guided discovery scenario', 'Recommend, continue discovery, or involve a specialist', 'Return to positioning and handoff guidance']
  };

  const opsData = {
    qa: {
      title: 'QA and SME review happened in stages.',
      text: 'I checked editorial quality, visuals, interactions, accessibility, and learner flow before broader review. Then I coordinated SME, messaging, and assessment feedback, resolved comments, and verified revisions.'
    },
    lms: {
      title: 'I tested the certification from the learner side of the LMS.',
      text: 'I checked pathway visibility, descriptions, catalogs, enrollment rules, launch behavior, assessment links, first-time and renewal journeys, imported completion history, regional routing, duplicate content, and mapping issues.'
    },
    reporting: {
      title: 'I created a workaround for a reporting gap.',
      text: 'When LMS reporting did not fully match the learning design, I used a separate regional assessment and a lightweight spreadsheet workflow to combine core completion, regional assessment, renewal status, and learner route into a clearer completion decision.'
    },
    maintenance: {
      title: 'I maintained the certification as approved source information changed.',
      text: 'I tracked source owners and affected course sections, updated approved changes, held back premature information, and used modular course boundaries so one change did not require rebuilding the full pathway.'
    }
  };

  const evidenceData = {
    supported: [
      ['Delivered', 'A multi-course sales certification with role-based content, scenario practice, formative checks, final assessment, review documentation, and LMS implementation support.'],
      ['Restructured', 'Broad and regional requirements were split into distinct learner routes so sellers did not have to complete irrelevant content.'],
      ['Reporting support', 'A supplemental assessment and spreadsheet workflow provided a practical way to review regional completion states.']
    ],
    learned: [
      ['Design beyond the course', 'Pathway rules, assessment, LMS behavior, reporting, review, and maintenance all shape the learner experience.'],
      ['Protect the role boundary', 'Sales training is stronger when technical depth appears only where it supports a seller decision.'],
      ['Next iteration', 'I would define routing, reporting rules, source ownership, and certification logic earlier and use more performance-based scenarios in the final assessment.']
    ]
  };

  const swapPanel = (panel, update) => {
    panel.classList.add('is-switching');
    window.setTimeout(() => {
      update();
      panel.classList.remove('is-switching');
    }, 120);
  };

  const setupTabs = (selector, dataKey, handler) => {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach((button, index) => {
      const activate = () => {
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        handler(button.dataset[dataKey]);
      };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else next = (index - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
      });
    });
  };

  const architecturePanel = document.getElementById('architecturePanel');
  const renderArchitecture = (key) => {
    const data = architectureData[key];
    swapPanel(architecturePanel, () => {
      document.getElementById('architectureLabel').textContent = data.label;
      document.getElementById('architectureTitle').textContent = data.title;
      document.getElementById('architectureText').textContent = data.text;
      document.getElementById('architectureFlow').innerHTML = data.flow.map((item) => `<span class="flow-step">${item}</span>`).join('');
    });
  };
  setupTabs('[data-arch]', 'arch', renderArchitecture);
  renderArchitecture('core');

  const audiencePanel = document.getElementById('audiencePanel');
  const renderAudience = (key) => {
    const data = audienceData[key];
    swapPanel(audiencePanel, () => {
      document.getElementById('audienceTitle').textContent = data.title;
      document.getElementById('audienceText').textContent = data.text;
      document.getElementById('audienceCards').innerHTML = data.cards.map(([label, title, body]) => `<article class="panel-card"><span>${label}</span><strong>${title}</strong><p>${body}</p></article>`).join('');
    });
  };
  setupTabs('[data-audience]', 'audience', renderAudience);
  renderAudience('new');

  const renderAlignment = (key) => {
    const values = alignmentData[key];
    document.getElementById('alignmentRoute').innerHTML = ['Seller Task', 'Practice I Built', 'What the Assessment Checked', 'Where Remediation Sent Them'].map((label, index) => `<div class="alignment-node"><span>${label}</span><strong>${values[index]}</strong></div>`).join('');
  };
  setupTabs('[data-align]', 'align', renderAlignment);
  renderAlignment('fit');

  const renderOps = (key) => {
    const data = opsData[key];
    document.getElementById('opsTitle').textContent = data.title;
    document.getElementById('opsText').textContent = data.text;
  };
  setupTabs('[data-ops]', 'ops', renderOps);
  renderOps('qa');

  const renderEvidence = (key) => {
    document.getElementById('evidencePanel').innerHTML = evidenceData[key].map(([title, body]) => `<article class="evidence-card"><strong>${title}</strong><p>${body}</p></article>`).join('');
  };
  setupTabs('[data-evidence]', 'evidence', renderEvidence);
  renderEvidence('supported');

  const resultsSection = document.getElementById('evidence');
  if (resultsSection && !document.getElementById('design-blueprint')) {
    const blueprintSection = document.createElement('section');
    blueprintSection.className = 'section section-soft flagship-section';
    blueprintSection.id = 'design-blueprint';
    blueprintSection.innerHTML = `
      <div class="container">
        <div class="section-kicker"><span class="icon-badge" aria-hidden="true"><svg class="portfolio-icon"><use href="../../../../assets/icons/portfolio-icons.svg#icon-assessment"></use></svg></span><p class="eyebrow">Evidence Artifact</p></div>
        <h2>Inspect the curriculum and assessment blueprint behind the case.</h2>
        <p class="body-large short-copy">This public-safe reconstruction turns the planning logic into something you can explore: learner routes, objective-to-practice alignment, assessment evidence, and remediation.</p>
        <div class="challenge-grid">
          <article class="challenge-card"><h3>Pathway architecture</h3><p>Compare the core seller path, regional extension, and optional foundations without exposing internal course names.</p></article>
          <article class="challenge-card"><h3>Objective map</h3><p>Trace seller decisions through module placement, practice, assessment evidence, and remediation.</p></article>
          <article class="challenge-card"><h3>Assessment blueprint</h3><p>Review reconstructed scenario patterns and the rules I used to assess judgment rather than isolated recall.</p></article>
        </div>
        <div class="button-row" style="margin-top:24px"><a class="btn btn-primary" href="./evidence/certification-design-blueprint/index.html">Open Certification Design Blueprint</a></div>
      </div>`;
    resultsSection.before(blueprintSection);

    const caseNav = document.querySelector('.case-nav');
    const resultsLink = caseNav?.querySelector('a[href="#evidence"]');
    if (caseNav && resultsLink && !caseNav.querySelector('a[href="#design-blueprint"]')) {
      const blueprintLink = document.createElement('a');
      blueprintLink.href = '#design-blueprint';
      blueprintLink.textContent = 'Design Blueprint';
      caseNav.insertBefore(blueprintLink, resultsLink);
    }
  }

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