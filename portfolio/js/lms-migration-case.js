(() => {
  const transitionData = {
    absorb: {
      label: 'Legacy Platform / Absorb LMS',
      title: 'I used the existing Absorb environment as the migration baseline.',
      text: 'I already knew the courses, learning plans, certifications, catalogs, learner expectations, and support patterns, which made it easier to identify what needed to be rebuilt or validated in Docebo.',
      cards: [
        ['Known structures', 'Courses, learning paths, certifications, catalogs, audiences, and support workflows.'],
        ['Migration question', 'What needed to be recreated, reconfigured, or communicated differently in Docebo?'],
        ['My baseline', 'The existing learner journey gave me a concrete comparison point for the new platform.']
      ]
    },
    docebo: {
      label: 'Target Platform / Docebo LMS',
      title: 'I helped set up and validate the new learning environment.',
      text: 'My work included configuring learning structures, plans, content, catalogs, certifications, visibility, and learner-facing assets, then testing how those pieces behaved for different audiences.',
      cards: [
        ['Setup', 'Learning structures, learning plans, content relationships, catalogs, certifications, and audience visibility.'],
        ['Validation', 'Employee, partner, and customer journeys, renewals, navigation, completion behavior, and migrated content.'],
        ['Launch operations', 'Issue documentation, retesting, learner support, documentation workflows, and post-launch reporting.']
      ]
    },
    role: {
      label: 'My Migration Role',
      title: 'My role covered setup, UAT, learner support, and post-launch operations.',
      text: 'I worked at the learning-content, learner-experience, and LMS-operations layer of the migration rather than owning the entire platform program.',
      cards: [
        ['Configure', 'Set up learning structures, plans, content, catalogs, certifications, and learner-facing relationships.'],
        ['Test', 'Validate learner journeys, document issues, and retest fixes across employee, partner, and customer experiences.'],
        ['Support', 'Help with inbox support, documentation, reusable customer-support email templates, reporting, and immediate action planning.']
      ]
    }
  };

  const validationData = {
    visibility: {
      label: 'Audience Visibility',
      title: 'I checked whether the right learners could see the right content in Docebo.',
      text: 'I tested employee, partner, and customer experiences because audience rules and catalogs could behave differently after migration.',
      checks: [
        ['What I checked', 'Audience visibility, catalogs, groups, and learner-facing content.'],
        ['What I looked for', 'Missing content, wrong visibility, duplicate assignments, or broken learner paths.']
      ]
    },
    plans: {
      label: 'Learning Plans',
      title: 'I configured and validated learning-plan structures.',
      text: 'I worked with learning plans and content relationships in Docebo, then checked whether the resulting learner path matched the intended experience.',
      checks: [
        ['What I checked', 'Plan structure, content relationships, sequencing, prerequisites, and audience access.'],
        ['What I looked for', 'Missing content, wrong relationships, duplicate assignments, or confusing sequencing.']
      ]
    },
    certifications: {
      label: 'Certifications + Renewals',
      title: 'I tested certification and renewal behavior after migration.',
      text: 'I reviewed how new and returning learners moved through certification requirements and renewal paths in Docebo.',
      checks: [
        ['What I checked', 'Certification workflows, renewal paths, completion behavior, and learner-plan configuration.'],
        ['What I looked for', 'Unexpected renewal behavior, duplicate records, incorrect credit, or completion-path issues.']
      ]
    },
    experience: {
      label: 'Content + Navigation',
      title: 'I validated the learner-facing content and navigation around the platform change.',
      text: 'I checked course assets, thumbnails, navigation, guidance, and support resources so the migrated environment made sense to learners.',
      checks: [
        ['What I checked', 'Content, thumbnails, navigation, catalogs, links, and learner guidance.'],
        ['What I looked for', 'Outdated assets, confusing placement, navigation friction, broken links, and support gaps.']
      ]
    },
    launch: {
      label: 'Support + Launch',
      title: 'I supported issue resolution and the processes learners needed after launch.',
      text: 'I documented issues, retested fixes, helped with learner inbox support, contributed reusable support responses, and supported post-launch reporting and action planning.',
      checks: [
        ['What I checked', 'Known issues, retest status, recurring support questions, and learner-facing impact.'],
        ['What I looked for', 'Problems that still needed resolution, documentation, communication, reporting, or follow-up ownership.']
      ]
    }
  };

  const migrationData = {
    review: {
      title: 'Use Absorb as the baseline.',
      text: 'I reviewed the existing courses, learning plans, certifications, catalogs, and support patterns before building and validating the corresponding Docebo experience.'
    },
    test: {
      title: 'Configure the Docebo learning structures.',
      text: 'I helped set up learning plans, content relationships, catalogs, certifications, visibility, and learner-facing assets needed for the migrated experience.'
    },
    resolve: {
      title: 'Validate the learner journeys and fix issues.',
      text: 'I tested employee, partner, and customer experiences, documented problems, supported triage, and retested fixes as migration issues were resolved.'
    },
    launch: {
      title: 'Support launch and stabilize operations.',
      text: 'I helped with learner inbox support, documentation workflows, reusable customer-support email templates, post-launch reporting, and immediate action planning.'
    }
  };

  const evidenceData = {
    supported: [
      ['Configuration + migration support', 'I helped set up learning structures, learning plans, content, catalogs, and learner-facing relationships in Docebo.'],
      ['UAT + issue validation', 'I tested employee, partner, and customer experiences, documented migration problems, and retested fixes.'],
      ['Support + reporting', 'I supported the learner inbox, documentation and email-template workflows, and immediate post-launch reporting and action planning.']
    ],
    learned: [
      ['Configure and test together', 'A migrated structure needs both correct setup and learner-path validation; one does not replace the other.'],
      ['Support data is operational data', 'Recurring inbox questions can reveal missing guidance, broken paths, or unclear ownership that needs a system or process fix.'],
      ['Post-launch needs a plan', 'Immediate reporting and action tracking help separate launch noise from issues that need sustained follow-up.']
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