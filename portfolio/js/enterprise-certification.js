(() => {
  const architectureData = {
    core: {
      label: 'Core Path',
      title: 'I grouped the required sales content into a clear sequence.',
      text: 'I moved from market context and solution comparison into use cases, positioning, ordering readiness, and assessment so each course had a clear purpose.',
      flow: ['Orientation', 'Market Context', 'Solution Categories', 'Use Cases', 'Positioning Practice', 'Ordering Readiness', 'Assessment']
    },
    regional: {
      label: 'Regional Extension',
      title: 'I pulled market-specific requirements out of the main path.',
      text: 'When some content only applied to certain regions, I created a separate extension and regional assessment instead of making every learner complete the same material.',
      flow: ['Core Path', 'Regional Context', 'Regional Assessment', 'Completion Check']
    },
    optional: {
      label: 'Optional Foundations',
      title: 'I moved deeper technical background out of required sales learning.',
      text: 'I kept technical detail only when it helped with discovery, positioning, risk, ordering, or handoff. Deeper implementation content stayed optional or moved to technical learning.',
      flow: ['Technical Foundations', 'Role-Specific Deep Dives', 'Specialist Handoff']
    }
  };

  const audienceData = {
    new: {
      title: 'For newer sellers, I added more context before asking for application.',
      text: 'I used plain-language explanations, predictable sequencing, and short takeaways so learners could build a basic mental model first.',
      cards: [
        ['Start', 'Build context first', 'Introduce the minimum background needed before solution comparison or scenarios.'],
        ['Sequence', 'Move in a clear order', 'Teach context and use cases before asking learners to position or recommend.']
      ]
    },
    experienced: {
      title: 'For experienced sellers, I made basic content easier to move through.',
      text: 'I used expandable detail, comparisons, and quick-reference elements so experienced learners could get what they needed without repeating every explanation.',
      cards: [
        ['Layer', 'Keep depth optional', 'Put extra detail behind expandable or supporting content instead of making it required.'],
        ['Reference', 'Make comparison fast', 'Use short reference elements for information sellers may need again later.']
      ]
    },
    boundary: {
      title: 'I kept the certification focused on sales work.',
      text: 'I removed installation and engineering detail unless it directly supported a customer question, seller decision, risk discussion, ordering step, or specialist handoff.',
      cards: [
        ['Keep', 'Seller decisions', 'Customer needs, discovery questions, value, constraints, risk, and next steps.'],
        ['Move out', 'Technical execution', 'Installation, deployment, and deep implementation detail belong in technical training.']
      ]
    }
  };

  const alignmentData = {
    fit: ['Identify when an opportunity fits', 'Scenario qualification check', 'Select the best-fit solution path', 'Return to use-case guidance'],
    compare: ['Distinguish related solution options', 'Side-by-side comparison', 'Match need and constraint to solution type', 'Review solution comparison'],
    handoff: ['Choose the next sales step', 'Guided discovery scenario', 'Recommend, continue discovery, or involve a specialist', 'Return to positioning and handoff guidance']
  };

  const opsData = {
    qa: {
      title: 'I staged QA and SME review instead of sending one giant review request.',
      text: 'I checked editorial quality, visuals, interactions, accessibility, and learner experience first. Then I coordinated SME, messaging, and assessment review, tracked feedback, fixed issues, and verified the changes.'
    },
    lms: {
      title: 'I tested the certification from the learner side of the LMS.',
      text: 'I checked pathway visibility, descriptions, catalogs, enrollment rules, launch behavior, assessment links, first-time and renewal journeys, imported completion history, regional routing, duplicate content, and mapping issues.'
    },
    reporting: {
      title: 'I built a workaround when LMS reporting did not match the learning design.',
      text: 'I created a separate regional assessment and a lightweight spreadsheet workflow that combined core completion, regional assessment, renewal status, and learner route into a clearer completion decision.'
    },
    maintenance: {
      title: 'I maintained the certification as source information changed.',
      text: 'I tracked source owners and affected course sections, updated approved changes, held back premature information, and used modular course boundaries so one change did not require rebuilding the full pathway.'
    }
  };

  const evidenceData = {
    supported: [
      ['Delivered', 'A multi-course sales certification with role-based content, interactions, multimedia, formative checks, final assessment, review documentation, and LMS implementation support.'],
      ['Changed the structure', 'The pathway was later split into broadly applicable and regional routes so learners did not have to complete irrelevant requirements.'],
      ['Solved a reporting gap', 'A supplemental assessment and spreadsheet workflow provided a practical way to review regional completion states.']
    ],
    learned: [
      ['Curriculum is only one part', 'The learning path, assessment, LMS rules, reporting, review process, and maintenance plan all affect the learner experience.'],
      ['Scope matters', 'Sales training is stronger when technical detail is included only when it supports a seller decision.'],
      ['What I would change', 'I would define routing, reporting rules, source ownership, and certification logic earlier, then use more performance-based scenarios in the assessment.']
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
