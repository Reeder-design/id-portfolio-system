(() => {
  const lab = document.querySelector('.ai-curriculum-workbench');
  if (!lab) return;

  const root = '../../../../assets/icons/pixel/';
  const layers = [
    ['Audience', '01 / Audience', 'What is your role on the launch team?', 'lms/mini-audience.webp'],
    ['Prior knowledge', '02 / Prior knowledge', 'Where should your Copilot practice begin?', 'workflows/learning-enablement/knowledge.webp'],
    ['Training topic', '03 / Training topic', 'Which marketing workflow should you practice?', 'workflows/planning-projects/projects.webp'],
    ['Adapt Scope', '04 / Demonstrated knowledge', 'Review a Copilot draft before it goes out.', 'ai-integrations/adaptive-learning/adaptive-difficulty.webp'],
    ['Assessment', '05 / Custom assessment', 'Choose a simulation built for your work.', 'ai-integrations/use-cases/light/automated-assessment-instant-feedback.webp'],
    ['Takeaway', '06 / Next steps', 'Take a job aid into the next campaign.', 'microlearning-performance-support/actionable-takeaways.webp']
  ];
  const initial = () => ({ step: 0, role: 'coordinator', knowledge: 'new', topic: 'handoff', diagnostic: null, simulation: null, resource: null });
  const state = initial();
  const role = () => state.role === 'coordinator' ? 'Marketing coordinator' : 'Campaign lead';
  const knowledge = () => state.knowledge === 'new' ? 'New to Copilot' : 'Experienced with Copilot';
  const topic = () => state.topic === 'handoff' ? 'Campaign handoff' : 'Launch reporting';
  const stretch = () => state.diagnostic === 'verify';
  const scope = () => state.diagnostic ? (stretch() ? 'Ready for advanced training' : 'Demonstrated need for reduced pace and added reviews') : 'Not observed';
  const icon = file => `<span class="ai-curriculum-mini-icon"><img src="${root}${file}" alt=""></span>`;
  const el = selector => lab.querySelector(selector);
  const text = (selector, value) => { el(selector).textContent = value; };
  const stage = value => { el('[data-curriculum-stage]').innerHTML = value; };
  const response = (value, tone = '') => {
    const box = el('[data-curriculum-response]');
    box.textContent = value;
    box.classList.toggle('is-strong', tone === 'strong');
    box.classList.toggle('is-coaching', tone === 'coaching');
  };
  const logic = (input, rule, output, design, experience) => {
    text('[data-curriculum-logic-input]', input);
    text('[data-curriculum-logic-rule]', rule);
    text('[data-curriculum-logic-output]', output);
    text('[data-curriculum-design-choice]', design);
    text('[data-curriculum-experience]', experience);
  };
  const choices = (options, selected) => {
    const list = el('[data-curriculum-choices]');
    list.replaceChildren();
    options.forEach(([key, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.curriculumChoice = key;
      button.textContent = label;
      button.classList.toggle('is-selected', key === selected);
      button.setAttribute('aria-pressed', String(key === selected));
      list.append(button);
    });
  };
  const stageHeader = (eyebrow, title) => `<div class="ai-curriculum-preview-head"><span>${eyebrow}</span><strong>${title}</strong></div>`;
  const app = (name, file, description) => `<div class="ai-curriculum-app-card">${icon(file)}<strong>${name}</strong><span>${description}</span></div>`;
  const workflow = () => {
    const cards = state.topic === 'handoff'
      ? [app('Teams', 'work-tools/teams.webp', 'Meeting recap'), app('Word', 'work-tools/word.webp', 'Campaign brief'), app('Outlook', 'workflows/people-collaboration/communication.webp', 'Owner follow-up')]
      : [app('Excel', 'work-tools/excel.webp', 'Channel data'), app('Word', 'work-tools/word.webp', 'Insight note'), app('PowerPoint', 'work-tools/powerpoint.webp', 'Team update')];
    return `<div class="ai-curriculum-app-flow">${cards.join('<span class="ai-curriculum-app-arrow" aria-hidden="true">→</span>')}</div>`;
  };
  const simulation = () => {
    const base = state.topic === 'handoff'
      ? (state.role === 'lead' ? 'Launch handoff approval' : 'Launch handoff build')
      : (state.role === 'lead' ? 'Performance decision brief' : 'Channel results snapshot');
    const task = state.topic === 'handoff'
      ? (state.role === 'lead'
        ? 'Review a Copilot-assisted campaign brief against approved launch notes, decide what needs revision, and assign owners before approval.'
        : 'Use a Teams meeting recap to draft a Word campaign handoff, then verify owners and dates before preparing an Outlook follow-up.')
      : (state.role === 'lead'
        ? 'Use a fictional campaign workbook to identify an outlier, test its explanation, and brief stakeholders on the next decision.'
        : 'Use a fictional campaign workbook to summarize channel trends, check the figures, and prepare a short team update.');
    return { recommended: `${stretch() ? 'Stretch' : 'Guided'} · ${base}`, alternate: `${stretch() ? 'Guided' : 'Stretch'} · ${base}`, task };
  };
  const simulationName = () => state.simulation ? simulation()[state.simulation] : 'Not selected';
  const simulationIsStretch = () => state.simulation === 'alternate' ? !stretch() : stretch();
  const resourceName = () => state.resource === 'prompt' ? 'Campaign prompt template' : state.resource === 'checklist' ? 'Review checklist' : 'Not selected';

  const render = (animate = true) => {
    const step = state.step;
    const layer = layers[step];
    lab.querySelectorAll('[data-curriculum-rail]').forEach((item, index) => {
      item.classList.toggle('is-current', index === step);
      item.classList.toggle('is-complete', index < step);
      if (index === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    text('[data-curriculum-count]', `${step + 1} / 6`);
    el('[data-curriculum-progress]').style.width = `${(step + 1) / 6 * 100}%`;
    el('[data-curriculum-icon]').src = root + layer[3];
    text('[data-curriculum-kicker]', layer[1]);
    text('[data-curriculum-title]', layer[2]);
    text('[data-curriculum-design-layer]', `Layer 0${step + 1} / ${layer[0]}`);
    el('[data-curriculum-choices]').setAttribute('aria-label', `Choose for ${layer[0].toLowerCase()}`);
    text('[data-curriculum-record-role]', role());
    text('[data-curriculum-record-knowledge]', step > 0 ? knowledge() : 'Not set');
    text('[data-curriculum-record-context]', step > 1 ? topic() : 'Not set');
    text('[data-curriculum-record-performance]', step > 2 ? scope() : 'Not observed');
    text('[data-curriculum-record-assessment]', step > 3 ? simulationName() : 'Not suggested');
    text('[data-curriculum-record-takeaway]', step > 4 ? resourceName() : 'Not selected');
    text('[data-curriculum-path-summary]', `${role()} · ${step > 1 ? topic() : 'Copilot for Marketing'}`);
    el('[data-curriculum-back]').hidden = step === 0;
    el('[data-curriculum-criteria]').hidden = step !== 4;
    const next = el('[data-curriculum-next]');
    next.disabled = false;
    next.innerHTML = 'Continue <span aria-hidden="true">→</span>';

    if (step === 0) {
      text('[data-curriculum-prompt]', 'You are on the fictional Luma Beauty marketing team. Which role should this training support?');
      choices([['coordinator', 'Marketing coordinator'], ['lead', 'Campaign lead']], state.role);
      stage(`${stageHeader('LUMA BEAUTY · FALL COLOR LAUNCH', 'My learning workspace')}<div class="ai-curriculum-role-preview">${icon('lms/mini-audience.webp')}<div><small>Selected audience</small><strong>${role()}</strong><p>${state.role === 'coordinator' ? 'Turn meeting decisions into a usable handoff and follow-up.' : 'Review campaign evidence, approve direction, and resolve ownership.'}</p></div></div>`);
      response(`The same campaign goal now opens from the ${role().toLowerCase()}'s responsibilities.`);
      logic(role(), 'Route by responsibility', state.role === 'coordinator' ? 'Build the handoff' : 'Review and decide',
        'Audience changes the work product, vocabulary, and decision rights—not just a name in a greeting. The same goal could also serve store teams, agency partners, or customers.',
        `The learner sees a ${state.role === 'coordinator' ? 'build-and-handoff' : 'review-and-approval'} task inside a recognizable campaign.`);
    } else if (step === 1) {
      text('[data-curriculum-prompt]', 'Choose your starting point. The course can change pace again after it sees your work.');
      choices([['new', 'New to Copilot'], ['experienced', 'Experienced with Copilot']], state.knowledge);
      stage(`${stageHeader('PERSONALIZED ENTRY', 'Choose a starting route')}<div class="ai-curriculum-start-routes"><div class="${state.knowledge === 'new' ? 'is-active' : ''}">${icon('workflows/learning-enablement/knowledge.webp')}<strong>Guided start</strong><span>Prompt anatomy · source review · one task</span></div><div class="${state.knowledge === 'experienced' ? 'is-active' : ''}">${icon('ai-integrations/adaptive-learning/adaptive-difficulty.webp')}<strong>Challenge start</strong><span>Multi-app case · competing priorities</span></div></div>`);
      response(state.knowledge === 'new' ? 'You will first see a worked prompt and a source-check example.' : 'You can begin with a richer workflow and fewer introductory cues.');
      logic(knowledge(), 'Set entry support', state.knowledge === 'new' ? 'Worked example' : 'Complex case',
        'Prior knowledge can range from none to advanced. An initial self-report sets the starting support; later performance can override it.',
        state.knowledge === 'new' ? 'The course begins with a guided example before the campaign task.' : 'The course begins with a more open-ended campaign task.');
    } else if (step === 2) {
      text('[data-curriculum-prompt]', 'Select the marketing workflow that is most useful to your current job.');
      choices([['handoff', 'Campaign handoff'], ['reporting', 'Launch reporting']], state.topic);
      stage(`${stageHeader('YOUR TRAINING TOPIC', topic())}${workflow()}<p class="ai-curriculum-preview-note">${state.topic === 'handoff' ? 'Convert meeting decisions into a brief and a clear owner follow-up.' : 'Interpret a campaign workbook before sharing a stakeholder update.'}</p>`);
      response(state.topic === 'handoff' ? 'Your examples now follow a meeting-to-brief-to-follow-up workflow.' : 'Your examples now follow a data-to-insight-to-update workflow.');
      logic(topic(), 'Select relevant work', state.topic === 'handoff' ? 'Campaign handoff' : 'Performance review',
        'A training topic can follow a product, target vertical, customer issue, scenario, or job responsibility. This example selects an actual workflow, not just a label.',
        `The learner sees ${state.topic === 'handoff' ? 'a Teams recap, Word brief, and Outlook follow-up' : 'an Excel workbook, Word insight note, and PowerPoint update'} in the practice space.`);
    } else if (step === 3) {
      text('[data-curriculum-prompt]', state.topic === 'handoff'
        ? 'Copilot drafted a campaign handoff from meeting notes. What should you do before sharing it?'
        : 'Copilot summarized a launch workbook. What should you do before using those insights?');
      choices([['verify', state.topic === 'handoff' ? 'Check source facts, owners, and dates' : 'Check source figures and assumptions'], ['send', 'Use the draft as-is']], state.diagnostic);
      const strong = stretch();
      const support = state.diagnostic === 'send';
      stage(`${stageHeader('DIAGNOSTIC MOMENT', 'Draft → decision → next practice')}<div class="ai-curriculum-diagnostic"><div class="ai-curriculum-draft">${icon(state.topic === 'handoff' ? 'work-tools/word.webp' : 'work-tools/excel.webp')}<div><small>Copilot-assisted draft</small><strong>${state.topic === 'handoff' ? 'Fall Color launch brief' : 'Launch channel insight'}</strong><span>${state.topic === 'handoff' ? 'Owners, dates, and product details need review.' : 'Figures, time periods, and assumptions need review.'}</span></div></div><div class="ai-curriculum-route-pair"><div class="${strong ? 'is-active' : support ? 'is-dim' : ''}"><b>Strong evidence</b><strong>Stretch case</strong><small>Validate tradeoffs across sources</small></div><div class="${support ? 'is-active' : strong ? 'is-dim' : ''}"><b>Review gap</b><strong>Guided practice</strong><small>Slow down · add source checks</small></div></div></div>`);
      response(!state.diagnostic ? 'Choose a response to reveal the next level of support.' : strong ? 'Strong source judgment: the course raises the challenge, even from a beginner starting path.' : 'The course slows down, adds a review cue, and offers another attempt—even from an experienced starting path.', strong ? 'strong' : support ? 'coaching' : '');
      logic(state.diagnostic ? (strong ? 'Verified draft' : 'Unreviewed draft') : 'Await choice', 'Judge source use', state.diagnostic ? (strong ? 'Raise challenge' : 'Add reviews') : 'Await signal',
        'Demonstrated knowledge can override the starting level. A sound review choice raises complexity; a missed check adds a slower pace, worked evidence review, and another try. Repeated performance can keep tuning scope.',
        state.diagnostic ? (strong ? 'The learner enters a more demanding simulation.' : 'The learner gets a source-check cue before a guided simulation.') : 'The learner sees that their decision—not only their self-selected level—changes the next activity.');
      next.disabled = !state.diagnostic;
    } else if (step === 4) {
      const sim = simulation();
      text('[data-curriculum-prompt]', 'These assessment simulations use your role, topic, and demonstrated need. Select one to preview.');
      choices([['recommended', `Recommended: ${sim.recommended}`], ['alternate', `Alternate practice: ${sim.alternate}`]], state.simulation);
      stage(`${stageHeader('SIMULATION RECOMMENDATION', state.simulation ? simulationName() : 'Choose a simulation above')}<div class="ai-curriculum-simulation">${icon(state.topic === 'handoff' ? 'work-tools/teams.webp' : 'work-tools/excel.webp')}<div><small>${role()} · ${topic()} · ${state.simulation ? (simulationIsStretch() ? 'stretch scope' : 'guided scope') : 'choose a scope'}</small><p>${sim.task}</p><p class="ai-curriculum-sim-support">${!state.simulation ? 'Select a simulation to see how much guidance accompanies the task.' : simulationIsStretch() ? 'Stretch: reconcile conflicting details and explain the trade-off without a worked prompt.' : 'Guided: use a sample prompt and a source-check checklist before sharing.'}</p></div></div><div class="ai-curriculum-sim-rubric"><span>Success checks</span><b>Ground in approved sources</b><b>Verify the output</b><b>Choose a next action</b></div>`);
      response(state.simulation ? `Selected: ${simulationName()}. This is a practice simulation, not a live Copilot task.` : 'Select a recommended or alternate simulation to see the tailored assessment plan.');
      logic(`${role()} + ${topic()}`, 'Compose simulation', state.simulation ? simulationName() : 'Two suggestions',
        'The assessment combines audience requirements, topic, and observed skill. Other courses could suggest a customer scenario, coding task, document review, or role-specific deliverable instead of one uniform quiz.',
        `This learner practices ${state.topic === 'handoff' ? 'a campaign handoff' : 'a performance update'} as a ${role().toLowerCase()}, with ${state.simulation && simulationIsStretch() ? 'more ambiguity and fewer cues' : 'a guided review and clearer checkpoints'}.`);
      next.disabled = !state.simulation;
      next.innerHTML = 'Choose a takeaway <span aria-hidden="true">→</span>';
    } else {
      text('[data-curriculum-prompt]', 'Choose a reference to use in your next real campaign workflow.');
      choices([['prompt', 'Campaign prompt template'], ['checklist', 'Review checklist']], state.resource);
      stage(`${stageHeader('TAKE INTO THE WORK', state.resource ? resourceName() : 'A useful next step')}<div class="ai-curriculum-takeaway">${icon(state.resource === 'checklist' ? 'hiring-guide/checklist-clipboard.webp' : 'work-tools/word.webp')}<div><small>${topic()} · ${role()}</small><strong>${state.resource === 'checklist' ? 'Before sharing a Copilot-assisted result' : state.resource === 'prompt' ? 'Reusable prompt starter' : 'Choose a resource above'}</strong><p>${state.resource === 'checklist' ? 'Check the source, dates, claims, brand language, and next owner.' : state.resource === 'prompt' ? `Using approved ${state.topic === 'handoff' ? 'launch notes' : 'campaign data'}, draft a ${state.topic === 'handoff' ? 'handoff brief' : 'channel insight note'} for a ${role().toLowerCase()}. Flag anything that needs human verification.` : 'The resource is shaped by the work and skill evidence used in your practice.'}</p></div></div>`);
      response(state.resource ? `Selected: ${resourceName()}. Use it with approved materials and review the result before sharing.` : 'A job aid, prompt template, checklist, or current-work reference can bridge the course and the next task.');
      logic(state.simulation ? simulationName() : 'Practice record', 'Select job aid', state.resource ? resourceName() : 'Two resources',
        'The final resource can use the learner’s role, topic, and assessed need. Other options include a refresher practice, approved source link, or deliverable template.',
        'The learner leaves with a practical reference for the next campaign task, not only a completion badge.');
      next.innerHTML = 'Restart pathway <span aria-hidden="true">↺</span>';
    }
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const node of [el('.ai-curriculum-lesson'), el('.ai-curriculum-design-view')]) {
        node.classList.remove('is-transitioning');
        void node.offsetWidth;
        node.classList.add('is-transitioning');
      }
    }
  };

  el('[data-curriculum-choices]').addEventListener('click', event => {
    const button = event.target.closest('button[data-curriculum-choice]');
    if (!button) return;
    const value = button.dataset.curriculumChoice;
    if (state.step === 0) { state.role = value; state.simulation = null; state.resource = null; }
    else if (state.step === 1) { state.knowledge = value; state.diagnostic = null; state.simulation = null; state.resource = null; }
    else if (state.step === 2) { state.topic = value; state.diagnostic = null; state.simulation = null; state.resource = null; }
    else if (state.step === 3) { state.diagnostic = value; state.simulation = null; state.resource = null; }
    else if (state.step === 4) { state.simulation = value; state.resource = null; }
    else state.resource = value;
    render();
  });
  el('[data-curriculum-back]').addEventListener('click', () => {
    if (state.step > 0) { state.step -= 1; render(); }
  });
  el('[data-curriculum-next]').addEventListener('click', () => {
    if (state.step === 3 && !state.diagnostic) return;
    if (state.step === 4 && !state.simulation) return;
    if (state.step === 5) Object.assign(state, initial());
    else state.step += 1;
    render();
  });
  render(false);
})();
