(() => {
  const architectureData = {
    core: {
      label: 'Core Path',
      title: 'Move from context to applied seller decisions.',
      text: 'The required route builds a shared foundation, then moves into use cases, positioning, ordering readiness, and assessment.',
      flow: ['Orientation', 'Market Context', 'Solution Categories', 'Use Cases', 'Positioning Practice', 'Ordering Readiness', 'Assessment']
    },
    regional: {
      label: 'Regional Extension',
      title: 'Keep market-specific requirements out of the universal path.',
      text: 'Regional context and assessment sit beside the core route so learners only complete what applies to their market.',
      flow: ['Core Path Complete', 'Regional Context', 'Regional Assessment', 'Completion Check']
    },
    optional: {
      label: 'Optional Foundations',
      title: 'Offer technical depth without turning sellers into implementers.',
      text: 'Optional foundations support learners who need more context while deeper execution content stays in separate technical learning.',
      flow: ['Technical Foundations', 'Role-Specific Deep Dives', 'Specialist Handoff']
    }
  };

  const audienceData = {
    new: {
      title: 'Give newer sellers enough structure to build a mental model.',
      text: 'Plain-language scaffolds, predictable sequencing, and concise takeaways establish context before application.',
      cards: [
        ['Scaffold', 'Shared context', 'Start with the concepts needed to understand later seller decisions.'],
        ['Sequence', 'Predictable flow', 'Move from context to use cases before asking learners to position a solution.']
      ]
    },
    experienced: {
      title: 'Let experienced sellers move faster without losing depth.',
      text: 'Expandable detail and quick-reference content reduce unnecessary repetition while keeping useful context available.',
      cards: [
        ['Layer', 'Optional depth', 'Keep deeper context available without forcing everyone through it.'],
        ['Reference', 'Fast retrieval', 'Use concise comparison and reference elements for experienced learners.']
      ]
    },
    boundary: {
      title: 'Keep technical content tied to a seller decision.',
      text: 'Technical detail stays only when it supports discovery, positioning, risk discussion, ordering, or a specialist handoff.',
      cards: [
        ['Include', 'Decision support', 'Customer questions, constraints, value, risk, and next steps.'],
        ['Route out', 'Implementation depth', 'Execution details move to technical or specialist learning.']
      ]
    }
  };

  const alignmentData = {
    fit: ['Opportunity Fit', 'Scenario qualification', 'Choose the best-fit solution path', 'Return to use-case guidance'],
    compare: ['Compare Paths', 'Side-by-side comparison', 'Match need + constraint to solution type', 'Review solution comparison'],
    handoff: ['Choose Next Step', 'Guided discovery scenario', 'Recommend or escalate appropriately', 'Return to positioning + handoff guidance']
  };

  const opsData = {
    qa: {
      title: 'QA + staged review',
      text: 'Separate design QA, accessibility checks, SME review, messaging review, assessment review, and final validation so feedback stays traceable.'
    },
    lms: {
      title: 'LMS + migration validation',
      text: 'Test visibility, enrollment, launch behavior, renewal paths, imported history, and regional routing from the learner perspective.'
    },
    reporting: {
      title: 'Supplement platform reporting',
      text: 'Use a separate regional assessment and lightweight reporting logic when the LMS cannot cleanly represent every requirement.'
    },
    maintenance: {
      title: 'Design for change',
      text: 'Keep content modular, track sources, and separate released, temporary, and proposed work so updates do not become full rebuilds.'
    }
  };

  const evidenceData = {
    supported: [
      ['Deliverable', 'Multi-course sales certification with role-based content, practice, assessment, review documentation, and LMS support.'],
      ['Observed', 'The pathway was released and later restructured into broadly applicable and regional routes.'],
      ['Process improvement', 'A supplemental assessment and reporting workflow made regional completion states easier to review.']
    ],
    learned: [
      ['System thinking', 'Curriculum, assessment, reporting, governance, and LMS behavior have to be designed as one learner experience.'],
      ['Role clarity', 'Sales training improves when technical depth is tied to seller decisions and deeper execution moves elsewhere.'],
      ['Next iteration', 'I would define routing, reporting, source ownership, and certification logic earlier in the design cycle.']
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
    document.getElementById('alignmentRoute').innerHTML = ['Seller Task', 'Practice', 'Assessment Evidence', 'Remediation'].map((label, index) => `<div class="alignment-node"><span>${label}</span><strong>${values[index]}</strong></div>`).join('');
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
