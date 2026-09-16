(() => {
  const validationData = {
    visibility: {
      label: 'Audience Visibility',
      title: 'I checked whether the right learners could see the right content.',
      text: 'I participated in UAT for employee, partner, and customer experiences and validated audience-facing catalogs, training, and learning structures before launch.',
      checks: [
        ['What I checked', 'Audience visibility, catalogs, and learner-facing content.'],
        ['What I looked for', 'Missing courses, hidden content, or content visible to the wrong audience.']
      ]
    },
    plans: {
      label: 'Learning Plans',
      title: 'I reviewed how learning plans were structured and behaved.',
      text: 'I validated learning-plan relationships and learner-facing behavior so migrated content still connected to the intended learning journey.',
      checks: [
        ['What I checked', 'Learning-plan structure, content relationships, and learner experience.'],
        ['What I looked for', 'Mapping issues, broken relationships, and duplicate content.']
      ]
    },
    certifications: {
      label: 'Certifications + Renewals',
      title: 'I tested certification and renewal workflows.',
      text: 'I reviewed certification behavior and renewal paths so returning learners followed the intended experience instead of getting a confusing duplicate or broken path.',
      checks: [
        ['What I checked', 'Certification workflows, renewal paths, and learning-plan configuration.'],
        ['What I looked for', 'Unexpected renewal behavior, duplicate records, and completion-path issues.']
      ]
    },
    experience: {
      label: 'Content + Navigation',
      title: 'I validated the learner-facing details around the migration.',
      text: 'I checked learner-facing content, thumbnails, navigation, onboarding guidance, and support resources because a technically correct migration still has to be understandable to use.',
      checks: [
        ['What I checked', 'Content, thumbnails, navigation, catalogs, and learner guidance.'],
        ['What I looked for', 'Confusing placement, outdated assets, navigation friction, and support gaps.']
      ]
    },
    launch: {
      label: 'Launch Support',
      title: 'I supported issue triage and launch readiness.',
      text: 'As testing surfaced problems, I documented issues, helped validate fixes, and supported launch-readiness and post-launch troubleshooting work with the broader team.',
      checks: [
        ['What I checked', 'Known issues, retest status, and learner-facing impact.'],
        ['What I looked for', 'Problems that still needed resolution, documentation, or support guidance.']
      ]
    }
  };

  const migrationData = {
    review: {
      title: 'Review the migrated structures.',
      text: 'I checked how content, learning plans, certifications, catalogs, and learner-facing assets appeared in the new LMS.'
    },
    test: {
      title: 'Test the learner journeys.',
      text: 'I participated in UAT across employee, partner, and customer experiences and tested the platform from the learner point of view.'
    },
    resolve: {
      title: 'Document and retest issues.',
      text: 'I helped surface content mapping, duplicate-content, visibility, and workflow problems, then supported retesting as fixes moved through the migration effort.'
    },
    launch: {
      title: 'Support launch readiness and triage.',
      text: 'I contributed learner guidance, support feedback, issue triage, and post-launch troubleshooting as part of the broader migration team.'
    }
  };

  const evidenceData = {
    supported: [
      ['UAT + testing', 'Participated in migration testing for employee, partner, and customer learner experiences.'],
      ['Content + workflow validation', 'Reviewed learning plans, certifications, renewals, catalogs, visibility, navigation, and learner-facing content.'],
      ['Launch support', 'Helped document issues, validate fixes, and support migration readiness and post-launch triage.']
    ],
    learned: [
      ['Test by audience', 'Employee, partner, and customer experiences need to be validated as different learner journeys.'],
      ['Catch structure problems early', 'UAT makes mapping, visibility, renewal, and relationship issues easier to find before they spread.'],
      ['Support is part of the migration', 'Learner guidance and support resources matter because a technically correct platform change can still be confusing.']
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
        document.getElementById(button.getAttribute("aria-controls")).setAttribute("aria-labelledby", button.id);
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

  const renderValidation = (key) => {
    const data = validationData[key];
    // Synchronous updates keep rapid keyboard navigation and panel content aligned.
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
