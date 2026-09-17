(() => {
  const routeData = {
    core: {
      summary: 'Required learning stays focused on the seller decisions shared across the main audience.',
      rule: 'If content is broadly required for discovery, positioning, comparison, or handoff, it belongs in the core path.',
      lanes: [
        ['Required seller path', 'Shared seller journey', [
          ['Context', 'Orientation'], ['Context', 'Market Context'], ['Compare', 'Solution Categories'], ['Apply', 'Use Cases'], ['Practice', 'Positioning Practice'], ['Prepare', 'Ordering Readiness'], ['Validate', 'Core Assessment', 'assessment']
        ]]
      ]
    },
    regional: {
      summary: 'Market-specific requirements extend the core experience without making every seller complete regional material.',
      rule: 'Regional content only appears when the learner route requires it; the core experience remains reusable.',
      lanes: [
        ['Core requirement', 'Shared first', [
          ['Required', 'Core Path'], ['Validate', 'Core Assessment', 'assessment']
        ]],
        ['Regional extension', 'Route-specific', [
          ['Context', 'Regional Context'], ['Validate', 'Regional Assessment', 'assessment'], ['Confirm', 'Completion Check']
        ]]
      ]
    },
    optional: {
      summary: 'Deeper technical background remains available without expanding the required sales certification.',
      rule: 'Technical depth moves out of the required path unless it directly supports a seller decision, risk discussion, order, or specialist handoff.',
      lanes: [
        ['Required seller path', 'Protected scope', [
          ['Decide', 'Discovery + Positioning'], ['Handoff', 'Specialist Escalation']
        ]],
        ['Optional foundations', 'Available as needed', [
          ['Optional', 'Technical Foundations', 'optional'], ['Optional', 'Role-Specific Deep Dives', 'optional']
        ]]
      ]
    }
  };

  const objectiveData = {
    fit: ['Recognize opportunity fit', 'Qualification decisions', 'Use-Case + Fit module', 'Qualification scenario', 'Select the best-fit path', 'Return to use-case guidance', 'A seller must recognize whether the situation belongs in the solution space before positioning anything.'],
    compare: ['Distinguish related solution categories', 'Compare needs + constraints', 'Solution Comparison module', 'Side-by-side comparison', 'Match need to solution type', 'Return to comparison guidance', 'The practice mirrors the real judgment: weigh customer needs and constraints instead of recalling isolated features.'],
    discovery: ['Ask useful discovery questions', 'Gather decision-relevant evidence', 'Discovery + Positioning module', 'Guided customer conversation', 'Choose the question or response that improves the decision', 'Return to discovery guidance', 'The evidence checks whether the learner can move a customer conversation forward, not whether they remember terminology.'],
    handoff: ['Recommend the next step', 'Continue, recommend, or escalate', 'Positioning + Handoff module', 'Next-step scenario', 'Choose recommendation, more discovery, or specialist support', 'Return to positioning + handoff guidance', 'The assessment preserves the role boundary by rewarding the right handoff when specialist depth is needed.']
  };

  const assessmentRows = [
    ['Opportunity fit', 'Scenario decision', 'Customer situation + constraints', 'Best-fit choice with plausible distractors', 'Use-case guidance'],
    ['Solution comparison', 'Comparison judgment', 'Two viable solution paths', 'Need/constraint match, not feature recall', 'Comparison module'],
    ['Discovery', 'Conversation choice', 'Incomplete customer evidence', 'Question or response that improves qualification', 'Discovery guidance'],
    ['Next step', 'Handoff decision', 'Qualified need with role boundary', 'Recommend, continue discovery, or escalate', 'Positioning + handoff guidance']
  ];

  const panel = document.querySelector('[data-workspace-panel]');
  const tabs = [...document.querySelectorAll('[data-view]')];
  const fadeSwap = (render) => {
    panel.classList.add('is-fading');
    window.setTimeout(() => {
      render();
      panel.classList.remove('is-fading');
    }, 110);
  };

  const laneHtml = (lane) => {
    const [title, subtitle, steps] = lane;
    return `<div class="pathway-lane"><div class="lane-label"><strong>${title}</strong><span>${subtitle}</span></div><div class="lane-steps">${steps.map(([kind, label, className='']) => `<div class="lane-step ${className}"><small>${kind}</small><strong>${label}</strong></div>`).join('')}</div></div>`;
  };

  const renderRoute = (key) => {
    const data = routeData[key];
    document.querySelector('[data-route-summary]').textContent = data.summary;
    document.querySelector('[data-route-rule]').textContent = data.rule;
    document.querySelector('[data-pathway-lanes]').innerHTML = data.lanes.map(laneHtml).join('');
    document.querySelectorAll('[data-route]').forEach((button) => button.classList.toggle('active', button.dataset.route === key));
  };

  const renderObjective = (key) => {
    const values = objectiveData[key];
    const labels = ['Learning objective','Seller task','Course / module','Practice','Assessment evidence','Remediation'];
    document.querySelector('[data-alignment-grid]').innerHTML = labels.map((label, index) => `<article class="alignment-card"><span>${label}</span><strong>${values[index]}</strong></article>`).join('');
    document.querySelector('[data-alignment-rationale]').textContent = values[6];
    document.querySelectorAll('[data-objective]').forEach((button) => button.classList.toggle('active', button.dataset.objective === key));
  };

  const renderPathwayView = () => {
    panel.innerHTML = `<div class="panel-intro"><div><p class="eyebrow">Pathway Architecture</p><h2>Route learners by what they actually need.</h2><p>Inspect the public-safe reconstruction of the core, regional, and optional learning routes.</p></div><span class="evidence-label">Architecture evidence</span></div><div class="route-picker"><button class="route-btn active" data-route="core">Core seller path</button><button class="route-btn" data-route="regional">Regional extension</button><button class="route-btn" data-route="optional">Optional foundations</button></div><div class="route-context"><article class="route-summary"><strong>Design intent</strong><p data-route-summary></p></article><article class="route-rule"><strong>Routing rule</strong><p data-route-rule></p></article></div><div class="pathway-lanes" data-pathway-lanes></div>`;
    panel.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => renderRoute(button.dataset.route)));
    renderRoute('core');
  };

  const renderObjectiveView = () => {
    panel.innerHTML = `<div class="panel-intro"><div><p class="eyebrow">Objective Map</p><h2>Trace each seller decision through the learning system.</h2><p>Select an objective to see the alignment from task to instruction, practice, evidence, and remediation.</p></div><span class="evidence-label">Backward-design evidence</span></div><div class="objective-picker"><button class="objective-btn active" data-objective="fit">Opportunity fit</button><button class="objective-btn" data-objective="compare">Solution comparison</button><button class="objective-btn" data-objective="discovery">Discovery</button><button class="objective-btn" data-objective="handoff">Next step + handoff</button></div><div class="alignment-grid" data-alignment-grid></div><div class="alignment-rationale" data-alignment-rationale></div>`;
    panel.querySelectorAll('[data-objective]').forEach((button) => button.addEventListener('click', () => renderObjective(button.dataset.objective)));
    renderObjective('fit');
  };

  const renderAssessmentView = () => {
    panel.innerHTML = `<div class="panel-intro"><div><p class="eyebrow">Assessment Blueprint</p><h2>Assess judgment, not isolated recall.</h2><p>This reconstruction shows the planning logic behind scenario-based assessment. Exact production item counts and internal source mappings are intentionally omitted.</p></div><span class="evidence-label">Assessment evidence</span></div><div class="blueprint-table-wrap"><table class="blueprint-table"><thead><tr><th>Objective family</th><th>Item pattern</th><th>Context</th><th>Evidence rule</th><th>Remediation</th></tr></thead><tbody>${assessmentRows.map((row) => `<tr>${row.map((cell, index) => `<td>${index===0?`<strong>${cell}</strong>`:cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="blueprint-principles"><article class="principle-card"><span>Principle 01</span><strong>Use plausible choices.</strong><p>Distractors represent realistic seller errors so the assessment reveals judgment rather than test-taking tricks.</p></article><article class="principle-card"><span>Principle 02</span><strong>Map misses to support.</strong><p>Every assessed decision has a clear remediation destination instead of a generic “review the course” message.</p></article><article class="principle-card"><span>Principle 03</span><strong>Protect the role boundary.</strong><p>Technical depth is assessed only when it changes a seller decision, customer conversation, risk, order, or handoff.</p></article></div>`;
  };

  const renderView = (view) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    fadeSwap(() => {
      if (view === 'pathway') renderPathwayView();
      else if (view === 'objectives') renderObjectiveView();
      else renderAssessmentView();
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => renderView(tab.dataset.view));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else next = (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  renderPathwayView();
})();