(() => {
  const transitionData = {
    absorb: {
      label: 'Existing Absorb Environment',
      title: 'I started with the courses, paths, and support patterns learners already used.',
      text: 'Knowing the existing Absorb setup helped me identify what had to be recreated, what could change, and what learner behavior needed to stay intact in Docebo.',
      cards: [
        ['Learning setup', 'Courses, learning plans, certifications, catalogs, audiences, and learner history.'],
        ['Support setup', 'Common learner questions, navigation patterns, existing guidance, and admin processes.'],
        ['What I compared', 'What learners needed to see and do before and after the move.']
      ]
    },
    docebo: {
      label: 'Docebo Setup',
      title: 'I configured the learning structures learners would use in the new platform.',
      text: 'My work included learning plans, content relationships, catalogs, certifications, audience visibility, and learner-facing assets, followed by testing for each audience type.',
      cards: [
        ['Learning plans', 'Plan structure, sequencing, content relationships, and audience access.'],
        ['Content + catalogs', 'Migrated content, learner-facing assets, catalogs, navigation, and visibility.'],
        ['Certifications', 'Certification paths, renewal behavior, and completion logic.']
      ]
    },
    role: {
      label: 'My Role',
      title: 'I handled the learning-content and learner-experience side of the move.',
      text: 'I worked across setup, UAT, issue retesting, learner support, documentation, and reporting as part of the broader migration team.',
      cards: [
        ['Configure', 'Set up learning plans, content, catalogs, certifications, and learner-facing relationships.'],
        ['Test', 'Check learner journeys, document issues, and retest fixes across employee, partner, and customer experiences.'],
        ['Support', 'Help with the inbox, support documentation, reusable email templates, reporting, and follow-up actions.']
      ]
    }
  };

  const validationData = {
    visibility: {
      label: 'Audience Visibility',
      title: 'I checked whether the right learners could see the right content.',
      text: 'Employee, partner, and customer audiences did not all use the same catalogs or assignments, so I tested each learner type separately.',
      checks: [
        ['What I checked', 'Audience visibility, catalogs, groups, and learner-facing content.'],
        ['What I looked for', 'Missing content, wrong visibility, duplicate assignments, or broken learner paths.']
      ]
    },
    plans: {
      label: 'Learning Plans',
      title: 'I checked the plan structure from assignment through completion.',
      text: 'I configured and tested learning plans so the content order, relationships, prerequisites, and audience access matched the intended path.',
      checks: [
        ['What I checked', 'Plan structure, content relationships, sequencing, prerequisites, and audience access.'],
        ['What I looked for', 'Missing content, wrong relationships, duplicate assignments, or confusing sequencing.']
      ]
    },
    certifications: {
      label: 'Certifications + Renewals',
      title: 'I tested new certification paths and returning-learner renewals.',
      text: 'I checked how first-time and returning learners moved through certification requirements and renewal paths in Docebo.',
      checks: [
        ['What I checked', 'Certification workflows, renewal paths, completion behavior, and learning-plan configuration.'],
        ['What I looked for', 'Unexpected renewal behavior, duplicate records, incorrect credit, or completion-path issues.']
      ]
    },
    experience: {
      label: 'Content + Navigation',
      title: 'I checked the learner-facing content around the migration.',
      text: 'I reviewed migrated course assets, thumbnails, links, catalogs, navigation, and guidance so the new environment made sense to learners.',
      checks: [
        ['What I checked', 'Content, thumbnails, navigation, catalogs, links, and learner guidance.'],
        ['What I looked for', 'Outdated assets, confusing placement, navigation friction, broken links, and support gaps.']
      ]
    },
    launch: {
      label: 'Support + Launch',
      title: 'I tracked what still needed attention once learners entered the new platform.',
      text: 'I documented issues, retested fixes, helped with learner inbox support, contributed reusable support responses, and supported post-launch reporting.',
      checks: [
        ['What I checked', 'Known issues, retest status, recurring support questions, and learner-facing impact.'],
        ['What I looked for', 'Problems that still needed a fix, documentation, communication, reporting, or clear ownership.']
      ]
    }
  };

  const migrationData = {
    review: {
      title: 'Map what learners and admins already relied on.',
      text: 'I reviewed courses, learning plans, certifications, catalogs, and support patterns in Absorb before configuring and testing their Docebo counterparts.'
    },
    test: {
      title: 'Configure the Docebo learning setup.',
      text: 'I helped set up learning plans, content relationships, catalogs, certifications, audience visibility, and learner-facing assets.'
    },
    resolve: {
      title: 'Test the learner paths and retest fixes.',
      text: 'I tested employee, partner, and customer experiences, documented problems, supported triage, and checked the fixes once they were ready.'
    },
    launch: {
      title: 'Support learners and track what still needed work.',
      text: 'I helped with inbox support, documentation, reusable customer-support email templates, post-launch reporting, and immediate follow-up actions.'
    }
  };

  const supportOpsData = {
    inbox: {
      label: 'Learner + Customer Inbox',
      title: 'I helped troubleshoot the questions that appeared after launch.',
      text: 'I responded to learner and customer issues, tracked recurring questions, and used those patterns to identify where guidance or processes needed to improve.',
      cards: [
        ['Inputs', 'Learner questions, customer issues, access problems, and navigation confusion.'],
        ['My work', 'Troubleshoot, document, route, and identify repeated patterns.'],
        ['Output', 'Clearer responses and a better picture of what needed follow-up.']
      ]
    },
    docs: {
      label: 'Documentation + Templates',
      title: 'I helped turn common support questions into reusable responses.',
      text: 'I documented support processes and helped build customer-support email templates so repeat questions did not require starting from scratch every time.',
      cards: [
        ['Inputs', 'Recurring questions, known fixes, escalation paths, and common account issues.'],
        ['My work', 'Document the response process and draft reusable customer email templates.'],
        ['Output', 'More consistent support responses and clearer handoff guidance.']
      ]
    },
    reporting: {
      label: 'Post-Launch Reporting',
      title: 'I helped make unresolved issues and follow-up work visible.',
      text: 'I supported immediate post-launch reporting and action planning so open issues, exceptions, and next steps were easier to track.',
      cards: [
        ['Inputs', 'Support trends, known issues, exceptions, retest status, and follow-up needs.'],
        ['My work', 'Organize reporting and surface items that still needed an owner or action.'],
        ['Output', 'A clearer immediate plan of action after launch.']
      ]
    }
  };

  const evidenceData = {
    supported: [
      ['Configuration', 'I helped set up learning structures, learning plans, content, catalogs, and learner-facing relationships in Docebo.'],
      ['UAT + retesting', 'I tested employee, partner, and customer experiences, documented migration problems, and retested fixes.'],
      ['Support + reporting', 'I supported the learner inbox, documentation and email-template workflows, and immediate post-launch reporting and action planning.']
    ],
    learned: [
      ['Setup and testing belong together', 'A learning plan can be configured correctly on paper and still fail when a real learner moves through it.'],
      ['Support questions reveal system problems', 'Repeated inbox questions often pointed to missing guidance, access issues, or a process that needed to change.'],
      ['Launch is not the finish line', 'Reporting and follow-up made it easier to separate one-off questions from problems that needed continued work.']
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

  const renderSupportOps = (key) => {
    const data = supportOpsData[key];
    document.getElementById('supportOpsLabel').textContent = data.label;
    document.getElementById('supportOpsTitle').textContent = data.title;
    document.getElementById('supportOpsText').textContent = data.text;
    document.getElementById('supportOpsCards').innerHTML = data.cards.map(([label, body]) => `<article class="transition-lens-card"><span>${label}</span><p>${body}</p></article>`).join('');
  };
  setupTabs('[data-supportops]', 'supportops', renderSupportOps);
  renderSupportOps('inbox');

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
