(() => {
  const transitionData = {
    absorb: {
      label: 'Legacy Platform / Absorb LMS',
      title: 'I started from the learning ecosystem we were already operating in Absorb.',
      text: 'My migration work depended on understanding the existing courses, learning plans, certifications, catalogs, learner expectations, and support patterns before checking how those experiences translated into Docebo.',
      cards: [
        ['What I brought forward', 'Knowledge of existing content, learner journeys, certifications, and support workflows.'],
        ['What could not be assumed', 'That relationships, visibility, renewals, or learner navigation would behave the same way in the new LMS.'],
        ['Why it mattered', 'The legacy experience gave me a baseline for identifying what changed, broke, duplicated, or became confusing.']
      ]
    },
    docebo: {
      label: 'Target Platform / Docebo LMS',
      title: 'I tested how the migrated learning actually behaved in Docebo.',
      text: 'I participated in UAT across employee, partner, and customer experiences and checked migrated content, learning plans, certifications, visibility, navigation, renewal paths, and learner-facing support.',
      cards: [
        ['What I tested', 'Catalogs, content relationships, learning plans, certifications, renewals, navigation, and learner-facing assets.'],
        ['What I surfaced', 'Mapping issues, duplicate content, visibility problems, broken relationships, and confusing learner paths.'],
        ['What I supported', 'Issue documentation, retesting, learner guidance, launch readiness, and post-launch triage.']
      ]
    },
    role: {
      label: 'My Migration Role',
      title: 'I worked at the intersection of learning content, learner experience, and LMS operations.',
      text: 'I was not the sole owner of the platform migration. My contribution was the learning-content and learner-experience layer: testing what moved from Absorb into Docebo, documenting what did not translate cleanly, and helping validate fixes before and after launch.',
      cards: [
        ['Instructional design', 'Checked whether migrated structures still supported the intended learning journey.'],
        ['LMS content administration', 'Reviewed content, relationships, visibility, certifications, renewals, and learner-facing assets.'],
        ['Launch support', 'Documented issues, helped validate fixes, and supported learner guidance and troubleshooting.']
      ]
    }
  };

  const validationData = {
    visibility: {
      label: 'Audience Visibility',
      title: 'I checked whether the right learners could see the right content in Docebo.',
      text: 'I tested employee, partner, and customer experiences because the same migration could behave differently for different audiences.',
      checks: [
        ['What I checked', 'Audience visibility, catalogs, and learner-facing content.'],
        ['What I looked for', 'Missing courses, hidden content, or content visible to the wrong audience.']
      ]
    },
    plans: {
      label: 'Learning Plans',
      title: 'I reviewed how migrated learning plans were structured and behaved.',
      text: 'I checked whether courses that belonged together in Absorb were still connected to the intended learner journey in Docebo.',
      checks: [
        ['What I checked', 'Learning-plan structure, content relationships, and learner experience.'],
        ['What I looked for', 'Mapping issues, broken relationships, and duplicate content.']
      ]
    },
    certifications: {
      label: 'Certifications + Renewals',
      title: 'I tested certification and renewal workflows after migration.',
      text: 'I reviewed how certification behavior translated into Docebo so new and returning learners followed the intended completion and renewal paths.',
      checks: [
        ['What I checked', 'Certification workflows, renewal paths, and learning-plan configuration.'],
        ['What I looked for', 'Unexpected renewal behavior, duplicate records, and completion-path issues.']
      ]
    },
    experience: {
      label: 'Content + Navigation',
      title: 'I validated the learner-facing details around the platform change.',
      text: 'I checked content, thumbnails, navigation, onboarding guidance, and support resources because a technically successful migration could still create a confusing learner experience.',
      checks: [
        ['What I checked', 'Content, thumbnails, navigation, catalogs, and learner guidance.'],
        ['What I looked for', 'Confusing placement, outdated assets, navigation friction, and support gaps.']
      ]
    },
    launch: {
      label: 'Launch Support',
      title: 'I stayed involved as testing moved into launch readiness and troubleshooting.',
      text: 'As issues surfaced, I documented what I found, supported retesting, contributed learner guidance, and helped the broader team triage problems before and after launch.',
      checks: [
        ['What I checked', 'Known issues, retest status, and learner-facing impact.'],
        ['What I looked for', 'Problems that still needed resolution, documentation, or support guidance.']
      ]
    }
  };

  const migrationData = {
    review: {
      title: 'Review what moved from Absorb into Docebo.',
      text: 'I compared migrated content, learning plans, certifications, catalogs, and learner-facing assets against the learning structures and expectations we already knew from Absorb.'
    },
    test: {
      title: 'Test the learner journeys in Docebo.',
      text: 'I participated in UAT across employee, partner, and customer experiences and tested the new platform from the learner point of view.'
    },
    resolve: {
      title: 'Document issues and retest the fixes.',
      text: 'I surfaced mapping, duplicate-content, visibility, relationship, and navigation problems, then supported retesting as fixes moved through the migration effort.'
    },
    launch: {
      title: 'Support launch readiness and post-launch triage.',
      text: 'I contributed learner guidance, issue triage, retesting, and troubleshooting as the Docebo environment moved from migration work into active use.'
    }
  };

  const evidenceData = {
    supported: [
      ['Absorb to Docebo migration support', 'I used my knowledge of the existing Absorb learning ecosystem while validating how content and learner journeys translated into Docebo.'],
      ['UAT + content validation', 'I tested employee, partner, and customer experiences and reviewed learning plans, certifications, renewals, visibility, navigation, and learner-facing content.'],
      ['Launch support', 'I documented issues, helped validate fixes, and supported migration readiness and post-launch triage.']
    ],
    learned: [
      ['Test by audience', 'Employee, partner, and customer experiences need to be validated as different learner journeys rather than assumed to behave the same way.'],
      ['Compare behavior, not just content', 'A migration is not complete because a course exists in the new LMS; relationships, visibility, renewals, and navigation still need to behave correctly.'],
      ['Support is part of launch', 'Learner guidance and troubleshooting matter because a technically correct platform change can still be confusing to use.']
    ]
  };

  const setupTabs = (selector, dataKey, handler) => {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach((button, index) => {
      const activate = () => {
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        const panelId = button.getAttribute('aria-controls');
        if (panelId) document.getElementById(panelId)?.setAttribute('aria-labelledby', button.id);
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

  const renderTransition = (key) => {
    const data = transitionData[key];
    document.getElementById('transitionLabel').textContent = data.label;
    document.getElementById('transitionTitle').textContent = data.title;
    document.getElementById('transitionText').textContent = data.text;
    document.getElementById('transitionCards').innerHTML = data.cards.map(([label, body]) => `<article class="transition-lens-card"><span>${label}</span><p>${body}</p></article>`).join('');
  };
  setupTabs('[data-transition]', 'transition', renderTransition);
  renderTransition('absorb');

  const renderValidation = (key) => {
    const data = validationData[key];
    document.getElementById('validationLabel').textContent = data.label;
    document.getElementById('validationTitle').textContent = data.title;
    document.getElementById('validationText').textContent = data.text;
    document.getElementById('validationChecks').innerHTML = data.checks.map(([label, body]) => `<div class="validation-check"><span>${label}</span><strong>${body}</strong></div>`).join('');
  };
  setupTabs('[data-validation]', 'validation', renderValidation);
  renderValidation('visibility');

  const renderMigration = (key) => {
    const data = migrationData[key];
    document.getElementById('migrationTitle').textContent = data.title;
    document.getElementById('migrationText').textContent = data.text;
  };
  setupTabs('[data-migration]', 'migration', renderMigration);
  renderMigration('review');

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
