(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const resetInitialScroll = () => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  };

  window.addEventListener('pageshow', resetInitialScroll, { once: true });

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
    inventory: {
      phase: 'Inventory · before', title: 'Find what the existing experience depends on.',
      text: 'I reviewed owned courses, learning plans, certifications, catalogs, and audience relationships in Absorb before the move.',
      evidence: 'Document the source course and its learner-facing purpose before assigning a destination.'
    },
    crosswalk: {
      phase: 'Crosswalk · decisions', title: 'Make every source-to-destination decision traceable.',
      text: 'I helped map Absorb courses and enrollments to Docebo codes and relationships. Duplicate materials, ghost courses, orphaned links, and missing mappings needed explicit review rather than a silent import.',
      evidence: 'Keep the course crosswalk, exception, decision, and owner together for review.'
    },
    configure: {
      phase: 'Configure · new structure', title: 'Rebuild the route, not just the content library.',
      text: 'I helped set up content and learning plans in Docebo, including audience visibility, prerequisites, certification settings, progress, completion, and exam access.',
      evidence: 'Confirm a configured item has the intended relationship to its plan, audience, and completion rule.'
    },
    validate: {
      phase: 'Validate · learner UAT', title: 'Test real learner states and the edge cases.',
      text: 'I tested employee, partner, and customer routes, documented issues, and retested fixes. The review included inactive profiles, duplicates, partial completions, renewals, and unusual audiences.',
      evidence: 'Compare expected and observed behavior, then record exception disposition and retest status.'
    },
    release: {
      phase: 'Release · guidance', title: 'Prepare people for the new environment.',
      text: 'I created learner navigation and support guidance, including videos and reusable responses, so people could find their way through the new platform.',
      evidence: 'Check the published route, support instructions, and known-issue owner before launch.'
    },
    sustain: {
      phase: 'Sustain · after launch', title: 'Treat support signals as system feedback.',
      text: 'I continue to help troubleshoot issues, train administrators, refine guidance and practices, and build reports that show where follow-up is needed.',
      evidence: 'Connect recurring tickets and report exceptions to a fix, owner, and next validation cycle.'
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
      label: 'Admin Training + Guidance',
      title: 'I help administrators support the platform after launch.',
      text: 'I create navigation videos, user guides, reporting guidance, and train-the-trainer resources. I also help administrators work through post-launch questions and establish practices they can maintain.',
      cards: [
        ['Inputs', 'Recurring questions, known fixes, reporting steps, and changes to the platform.'],
        ['My work', 'Train administrators and create videos, guides, templates, and reporting instructions.'],
        ['Output', 'Guidance administrators can reuse and update when the platform changes.']
      ]
    },
    reporting: {
      label: 'Reporting + Analytics',
      title: 'I build reporting that helps teams see what needs attention.',
      text: 'I create Power BI dashboards for learning review and work with reporting data connected to Snowflake. I check LMS records, exceptions, and support patterns before sharing a conclusion.',
      cards: [
        ['Inputs', 'LMS records, reporting data, support trends, and known exceptions.'],
        ['My work', 'Build Power BI views and check source records and reporting connections.'],
        ['Output', 'Dashboards and follow-up reports that show what needs an owner or a fix.']
      ]
    }
  };

  const evidenceData = {
    supported: [
      ['Configuration', 'I helped set up learning structures, learning plans, content, catalogs, and learner-facing relationships in Docebo.'],
      ['UAT + retesting', 'I tested employee, partner, and customer experiences, documented migration problems, and retested fixes.'],
      ['After launch', 'I help train administrators, create learner and admin guidance, resolve issues, and build Power BI reporting.']
    ],
    learned: [
      ['Design content and LMS setup together', 'A strong course still fails if learners cannot find it, launch it, or get credit for it. I design with those platform rules in mind.'],
      ['Check the learner view', 'A plan can look right to an admin and still fail for a partner, customer, returning learner, or partial completer.'],
      ['Keep ownership traceable', 'I document where content lives, its source and version, who owns it, and when it needs review. That makes later fixes safer.']
    ]
  };

  const setupTabs = (selector, dataKey, handler) => {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach((button, index) => {
      const panel = button.closest('[role="tablist"]').parentElement.querySelector('[role="tabpanel"]');
      if (panel) {
        if (!button.id) button.id = `${dataKey}-${button.dataset[dataKey]}`;
        if (!panel.id) panel.id = `${dataKey}Panel`;
        button.setAttribute('aria-controls', panel.id);
        if (button.getAttribute('aria-selected') === 'true') panel.setAttribute('aria-labelledby', button.id);
      }
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

  const assetData = {
    home: {label:'Access + discovery',title:'The right learning, for the right audience.',intro:'A learner home connects audience access, assigned learning, progress, and support. Each connection needed checking after the move.',baseline:'Review the catalogs, learning plans, and navigation learners already relied on.',configuration:'Help configure audience visibility, content relationships, catalogs, and learner-facing assets.',check:'Check employee, partner, and customer views for missing content, incorrect visibility, and broken navigation.',alt:'Fictional learner home showing assigned learning and certification progress.'},
    course: {label:'Content + completion',title:'A migrated course has to work when it opens.',intro:'Content setup and learning-plan relationships meet inside the course experience. I checked migrated content and learner-facing behavior against the intended path.',baseline:'Review the existing course content, order, links, and learner guidance in Absorb.',configuration:'Configure migrated content, learning-plan sequencing, content relationships, and learner-facing assets in Docebo.',check:'Launch the content, check navigation and prerequisites, and validate completion behavior from the learner view.',alt:'Fictional LMS course player with lesson sequence, knowledge check, and tracking status.'},
    admin: {label:'Administration + follow-up',title:'Connect learner issues to operational follow-up.',intro:'I worked at the content-administration and learner-support layer within the broader migration team. Reporting helped keep exceptions and follow-up work visible.',baseline:'Review learning structures, certifications, and the support patterns around the existing environment.',configuration:'Help set up catalogs, learning plans, certifications, and related learner-facing relationships.',check:'Document issues, retest fixes, support learner questions, and contribute to immediate post-launch reporting and action planning.',alt:'Fictional LMS administration view showing catalogs, audience rules, and an exception queue.'}
  };
  const assetScreens = {
    home: `<div class="built-top"><b>Learning hub</b><span>Search learning　⌕</span><small>Employee ▾</small></div><div class="built-layout"><nav class="built-rail" aria-hidden="true"><b>⌂</b><span>▤</span><span>◫</span><span>◷</span></nav><div class="built-content"><p class="built-kicker">GOOD MORNING, ALEX</p><h4>Your learning starts here</h4><div class="built-summary"><span><b>03</b> assigned courses</span><span><b>01</b> certification due</span></div><div class="built-course"><span class="built-cover">▧</span><span><b>Product readiness</b><small>Required · Sales pathway</small><i class="built-meter"><em></em></i></span><strong>Continue →</strong></div><div class="built-home-grid"><span>✓ Transcript <b>Up to date</b></span><span>◉ Support <b>Get help</b></span></div></div></div>`,
    course: `<div class="built-top"><b>Learning hub / Product readiness</b><span>Exit course ✕</span></div><div class="built-layout"><nav class="built-rail" aria-hidden="true"><b>▤</b><span>①</span><span>②</span><span>✓</span></nav><div class="built-content"><p class="built-kicker">MODULE 02 / 04</p><h4>Identify the customer signal</h4><div class="built-player"><span class="built-play">▶</span><span>Scenario: discovery conversation</span></div><div class="built-lesson-row"><span>✓ Orientation</span><span class="current">▶ Scenario practice</span><span>○ Knowledge check</span></div><div class="built-tracking"><b>Tracking handshake</b><span>Launch ✓　Resume ✓　Completion pending</span></div></div></div>`,
    admin: `<div class="built-top"><b>Learning administration</b><span>Catalogs　Users　Reports</span><small>Admin ▾</small></div><div class="built-layout"><nav class="built-rail" aria-hidden="true"><b>▦</b><span>☷</span><span>⚙</span><span>◷</span></nav><div class="built-content"><p class="built-kicker">MIGRATION VALIDATION</p><h4>Audience + catalog rules</h4><div class="built-summary"><span><b>03</b> audience routes</span><span><b>02</b> items to review</span></div><div class="built-table"><div><b>Audience</b><b>Catalog</b><b>State</b></div><div><span>Employee</span><span>Core learning</span><em>Visible</em></div><div><span>Partner</span><span>Partner enablement</span><em>Visible</em></div><div class="built-exception"><span>Customer</span><span>Customer academy</span><em>Review</em></div></div><div class="built-tracking"><b>Exception queue</b><span>Customer route → check group mapping and retest</span></div></div></div>`
  };
  setupTabs('[data-lmsasset]', 'lmsasset', (key) => {
    const data = assetData[key];
    const screen = document.getElementById('lmsAssetScreen');
    screen.innerHTML = assetScreens[key];
    screen.setAttribute('aria-label', data.alt);
    screen.dataset.scene = key;
    ['label','title','intro','baseline','configuration','check'].forEach((field) => {
      document.getElementById('asset' + field[0].toUpperCase() + field.slice(1)).textContent = data[field];
    });
  });

  // Reconstructed examples illustrate the documented UAT scope, not historical incidents.
  const routeData = {
    employee: {
      label:'Access + assignment', title:'Can an employee find their assigned learning?',
      steps:['Sign in','Open catalog','Launch course','Record completion'], fail:1,
      expected:'The employee can open the assigned catalog, launch the course, and record completion.',
      observed:'Sign-in works, but the assigned catalog is not visible. Course launch and completion cannot be tested yet.',
      issue:'Employee catalog is missing from the learner view.',
      choices:['Replace the course thumbnail','Review audience membership and catalog visibility','Mark the course complete manually'], correct:1,
      guidance:['A thumbnail affects presentation. It does not establish catalog access.','Audience membership and visibility determine whether the learner can reach the catalog.','Manual completion would bypass the access issue and leave the learner without the course.'],
      fix:'Sample fix: correct the audience-to-catalog visibility configuration.',
      passed:'The intended catalog is visible; the employee launches the course and reaches a recorded completion.',
      start:'Start with the learner view. A visible assignment alone does not confirm access.'
    },
    partner: {
      label:'Sequence + prerequisites', title:'Does a partner reach the next required module?',
      steps:['Open partner plan','Complete foundation','Unlock next module','Record completion'], fail:2,
      expected:'Completing the foundation module unlocks the next required module in the partner plan.',
      observed:'The foundation module is complete, but the next required module stays locked. The route cannot continue.',
      issue:'Next partner module stays locked after the prerequisite is complete.',
      choices:['Review prerequisite and content relationships','Remove all required modules','Resend the welcome email'], correct:0,
      guidance:['The completed prerequisite must connect to the intended next module.','Removing requirements changes the intended learning path instead of repairing it.','A reminder cannot repair the relationship controlling the locked module.'],
      fix:'Sample fix: correct the prerequisite relationship to the completed foundation module.',
      passed:'The foundation completion unlocks the next module, and the partner can finish the intended route.',
      start:'Follow the sequence as a learner. Check what becomes available after each prerequisite.'
    },
    customer: {
      label:'Certification + renewal', title:'Can a returning customer enter a renewal path?',
      steps:['Sign in','Open certification','Enter renewal','Record renewal'], fail:2,
      expected:'An eligible returning learner can enter the renewal path while prior completion remains visible.',
      observed:'The earlier certification is visible, but the eligible learner cannot enter the renewal path.',
      issue:'Eligible returning customer cannot access the renewal path.',
      choices:['Delete the prior completion','Assign unrelated training','Review renewal eligibility and path configuration'], correct:2,
      guidance:['Deleting history would hide useful evidence and does not repair renewal eligibility.','Unrelated training does not validate the intended renewal experience.','Compare the learner state with the renewal eligibility and learning-path configuration.'],
      fix:'Sample fix: align the renewal eligibility and path assignment for the returning learner.',
      passed:'Prior completion remains visible; the customer enters the renewal path and records the renewed completion.',
      start:'Test returning learners separately. A first-time certification route does not prove renewal works.'
    }
  };
  let audience = 'employee';
  let testState = 'ready';
  const byId = (id) => document.getElementById(id);
  const renderRoute = () => {
    const data = routeData[audience];
    byId('routeLabel').textContent = data.label;
    byId('routeTitle').textContent = data.title;
    byId('uatExpected').textContent = data.expected;
    byId('uatStatus').textContent = {ready:'Ready to test',issue:'Issue found',fixed:'Ready to retest',passed:'Retest passed'}[testState];
    byId('uatStatus').dataset.state = testState;
    byId('uatRoute').innerHTML = data.steps.map((step, index) => {
      let state = 'pending', label = 'Not tested';
      if (testState === 'passed') {state='passed';label='Pass';}
      else if (testState !== 'ready') {
        if (index < data.fail) {state='passed';label='Pass';}
        else if (index === data.fail) {state=testState === 'fixed' ? 'pending' : 'issue';label=testState === 'fixed' ? 'Retest needed' : 'Issue';}
        else {state='blocked';label='Not reached';}
      }
      return `<li data-state="${state}"><span>${step}</span><strong>${label}</strong></li>`;
    }).join('');
    byId('uatObserved').textContent = testState === 'ready' ? 'Run the sample route to compare the learner experience with the expected behavior.' : testState === 'passed' ? data.passed : data.observed;
    byId('uatFixes').hidden = testState !== 'issue';
    const action = byId('uatRun');
    action.textContent = {ready:'Run learner test',issue:'Choose a check above',fixed:'Retest learner route',passed:'Run again'}[testState];
    action.disabled = testState === 'issue';
    const record = testState === 'ready' ? 'No test recorded for this audience.' : `${data.issue} Initial test: issue reproduced. ${testState === 'issue' ? 'Status: investigate the configuration.' : data.fix + (testState === 'fixed' ? ' Status: configuration updated; learner retest pending.' : ' Retest: route passed, including downstream completion. Status: sample issue closed.')}`;
    byId('uatLog').textContent = record;
  };
  const resetRoute = () => {
    testState = 'ready';
    byId('uatRecord').open = false;
    byId('uatFeedback').textContent = routeData[audience].start;
    byId('uatChoices').replaceChildren();
    renderRoute();
  };
  const showChoices = () => {
    const data = routeData[audience];
    byId('uatChoices').replaceChildren();
    data.choices.forEach((label,index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lms-fix-choice';
      button.textContent = label;
      button.addEventListener('click', () => {
        if (testState !== 'issue') return;
        if (index !== data.correct) {
          byId('uatFeedback').textContent = data.guidance[index] + ' Try another check.';
          return;
        }
        testState = 'fixed';
        renderRoute();
        byId('uatFeedback').textContent = data.guidance[index] + ' ' + data.fix + ' Retest before closing the issue.';
        byId('uatRun').focus();
      });
      byId('uatChoices').append(button);
    });
  };
  setupTabs('[data-route]', 'route', (key) => {audience=key;resetRoute();});
  byId('uatRun').addEventListener('click', () => {
    if (testState === 'passed') {resetRoute();return;}
    if (testState === 'ready') {
      testState = 'issue';
      showChoices();
      renderRoute();
      byId('uatFeedback').textContent = 'Issue reproduced. Choose the configuration check that addresses the blocked step.';
      byId('uatChoices').querySelector('button').focus();
    } else if (testState === 'fixed') {
      testState = 'passed';
      renderRoute();
      byId('uatFeedback').textContent = 'Retest passed. The corrected step and the rest of the route now work in this sample. The issue record is ready to close.';
    }
  });
  byId('uatReset').addEventListener('click', resetRoute);
  resetRoute();


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
    if (!data) return;
    document.getElementById('migrationPhase').textContent = data.phase;
    document.getElementById('migrationTitle').textContent = data.title;
    document.getElementById('migrationText').textContent = data.text;
    document.getElementById('migrationEvidence').textContent = data.evidence;
  };
  setupTabs('[data-migration]', 'migration', renderMigration);
  renderMigration('inventory');

  const renderSupportOps = (key) => {
    const data = supportOpsData[key];
    document.getElementById('supportOpsLabel').textContent = data.label;
    document.getElementById('supportOpsTitle').textContent = data.title;
    document.getElementById('supportOpsText').textContent = data.text;
    const demo = {
      inbox: `<div class="support-demo-top"><span>SUPPORT INBOX</span><strong>3 items · 1 pattern</strong></div><div class="support-demo-body"><div class="support-ticket selected"><b>Access</b><span>Partner cannot see required path</span><small>New · 09:42</small></div><div class="support-ticket"><b>Navigation</b><span>Where is my certificate?</span><small>Open · 10:18</small></div><div class="support-ticket"><b>Access</b><span>Customer catalog not visible</span><small>Open · 10:31</small></div></div><div class="support-demo-action"><span>Notice repeated access questions</span><strong>Check audience rule → route issue</strong></div>`,
      docs: `<div class="support-demo-top"><span>ADMIN ENABLEMENT</span><strong>Guidance library</strong></div><div class="support-demo-body"><div class="support-doc"><b>New administrator</b><p>Navigation video + train-the-trainer session</p><i></i><b>Ongoing support</b><p>Reporting guide, known fixes, content owner, and next review date</p></div></div><div class="support-demo-action"><span>Keep guidance current</span><strong>Owner → update → review</strong></div>`,
      reporting: `<div class="support-demo-top"><span>LEARNING REPORTING</span><strong>Example review flow</strong></div><div class="support-demo-body"><div class="support-report"><span>Source</span><span>Check</span><span>Use</span><b>LMS records</b><b>Completion</b><b>Power BI view</b><b>Snowflake data</b><b>Matching IDs</b><b>Compare</b><b>Support trends</b><b>Exceptions</b><b>Follow up</b></div></div><div class="support-demo-action"><span>Validate the data</span><strong>Source → dashboard → action</strong></div>`
    };
    document.getElementById('supportOpsDemo').innerHTML = demo[key];
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
