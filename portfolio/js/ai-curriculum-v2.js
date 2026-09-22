(() => {
  const lab = document.querySelector('.ai-curriculum-workbench');
  if (!lab) return;

  const iconRoot = '../../../../assets/icons/pixel/';
  const layers = [
    { short: 'Audience', kicker: '01 / Learner profile', title: 'Who are you learning this for?', icon: 'ai-integrations/mindsmith/choose-a-role.webp' },
    { short: 'Prior knowledge', kicker: '02 / Background knowledge', title: 'What do you already know?', icon: 'ai-integrations/adaptive-learning/adaptive-difficulty.webp' },
    { short: 'Work context', kicker: '03 / Relevant content', title: 'Choose the work you need to practice.', icon: 'ai-integrations/adaptive-learning/adaptive-content-paths.webp' },
    { short: 'Response', kicker: '04 / Demonstrated knowledge', title: 'Respond to the customer cue.', icon: 'ai-integrations/mindsmith/ai-roleplay-conversation.webp' },
    { short: 'Assessment', kicker: '05 / Custom assessment', title: 'Apply the skill in your own case.', icon: 'ai-integrations/use-cases/light/automated-assessment-instant-feedback.webp' },
    { short: 'Takeaway', kicker: '06 / After training', title: 'Take a useful resource into the work.', icon: 'ai-integrations/adaptive-learning/personalized-learning-loop.webp' }
  ];
  const state = {
    step: 0,
    role: 'partner',
    knowledge: 'new',
    context: 'handoff',
    response: null,
    assessment: null,
    submitted: false,
    resource: null
  };
  const roleName = () => state.role === 'partner' ? 'Sales partner' : 'Customer success';
  const knowledgeName = () => state.knowledge === 'new' ? 'New to topic' : 'Experienced';
  const contextName = () => state.context === 'handoff' ? 'Handoff delay' : 'Coverage expansion';
  const mastered = () => state.response === 'probe';
  const assessmentCorrect = () => state.assessment === 'evidence';

  const el = (selector) => lab.querySelector(selector);
  const setText = (selector, value) => { el(selector).textContent = value; };
  const animate = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    [el('.ai-curriculum-lesson'), el('.ai-curriculum-design-view')].forEach((node) => {
      node.classList.remove('is-transitioning');
      void node.offsetWidth;
      node.classList.add('is-transitioning');
    });
  };
  const setChoices = (choices, selected, extraClass = '') => {
    const container = el('[data-curriculum-choices]');
    container.replaceChildren();
    container.hidden = choices.length === 0;
    choices.forEach(([key, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.curriculumChoice = key;
      button.textContent = label;
      const active = selected === key;
      button.setAttribute('aria-pressed', String(active));
      if (active) button.classList.add('is-selected');
      if (active && extraClass) button.classList.add(extraClass);
      container.append(button);
    });
  };
  const setResponse = (message, tone = '') => {
    const node = el('[data-curriculum-response]');
    node.textContent = message;
    node.classList.toggle('is-coaching', tone === 'coaching');
    node.classList.toggle('is-strong', tone === 'strong');
  };
  const setLogic = (input, rule, output, designChoice, experience) => {
    setText('[data-curriculum-logic-input]', input);
    setText('[data-curriculum-logic-rule]', rule);
    setText('[data-curriculum-logic-output]', output);
    setText('[data-curriculum-design-choice]', designChoice);
    setText('[data-curriculum-experience]', experience);
  };

  const render = (withMotion = true) => {
    const { step } = state;
    const layer = layers[step];
    lab.querySelectorAll('[data-curriculum-rail]').forEach((item, index) => {
      item.classList.toggle('is-current', index === step);
      item.classList.toggle('is-complete', index < step);
      if (index === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    setText('[data-curriculum-count]', `${step + 1} / 6`);
    el('[data-curriculum-progress]').style.width = `${((step + 1) / 6) * 100}%`;
    el('[data-curriculum-icon]').src = iconRoot + layer.icon;
    setText('[data-curriculum-kicker]', layer.kicker);
    setText('[data-curriculum-title]', layer.title);
    el('[data-curriculum-choices]').setAttribute('aria-label', step === 5 ? 'Open a takeaway resource' : `Choose for ${layer.short.toLowerCase()}`);
    setText('[data-curriculum-design-layer]', `Layer 0${step + 1} / ${layer.short}`);
    setText('[data-curriculum-record-role]', roleName());
    setText('[data-curriculum-record-knowledge]', step > 0 ? knowledgeName() : 'Knowledge: not set');
    setText('[data-curriculum-record-context]', step > 1 ? contextName() : 'Context: not set');
    setText('[data-curriculum-record-performance]', step > 3 && state.response ? (mastered() ? 'Response: strong' : 'Response: needs support') : 'Response: pending');
    setText('[data-curriculum-record-assessment]', state.submitted ? (assessmentCorrect() ? 'Assessment: ready' : 'Assessment: retry') : 'Assessment: pending');
    setText('[data-curriculum-path-summary]', `${roleName()} path`);
    const criteria = el('[data-curriculum-criteria]');
    criteria.hidden = step !== 4;
    criteria.classList.toggle('is-reviewed', step === 4 && state.submitted);
    criteria.dataset.passed = String(assessmentCorrect());
    const next = el('[data-curriculum-next]');
    next.disabled = false;

    if (step === 0) {
      setText('[data-curriculum-prompt]', 'Choose the point of view you will use in a customer handoff conversation.');
      setChoices([['partner', 'Sales partner'], ['success', 'Customer success']], state.role);
      setResponse(`Your scenario will use the goals and language of ${state.role === 'partner' ? 'a sales partner' : 'a customer success teammate'}.`);
      setLogic(roleName(), 'Set role lens', state.role === 'partner' ? 'Seller task' : 'Support task',
        'Audience sets the task, vocabulary, and point of view. The same goal could serve internal employees, external partners, customers, or a particular team.',
        `The case begins with the customer decision a ${roleName().toLowerCase()} needs to make.`);
      next.innerHTML = 'Continue <span aria-hidden="true">→</span>';
    } else if (step === 1) {
      setText('[data-curriculum-prompt]', 'Tell the course how much of this topic you already know.');
      setChoices([['new', 'New to topic'], ['experienced', 'Experienced']], state.knowledge);
      setResponse(state.knowledge === 'new' ? 'A worked cue will appear before you handle the customer case.' : 'You can begin with a more complex customer decision.');
      setLogic(knowledgeName(), 'Set starting support', state.knowledge === 'new' ? 'Worked cue' : 'Complex case',
        'Prior knowledge can start at none, beginner, intermediate, experienced, or advanced. The entry point changes explanation and practice, then remains open to revision as the learner responds.',
        state.knowledge === 'new' ? 'The learner sees a concrete example before being asked to decide.' : 'The learner skips basic explanation and starts with a realistic tradeoff.');
      next.innerHTML = 'Continue <span aria-hidden="true">→</span>';
    } else if (step === 2) {
      setText('[data-curriculum-prompt]', 'Choose the customer situation closest to the work you need to do.');
      setChoices([['handoff', 'Handoff delay'], ['expansion', 'Coverage expansion']], state.context);
      setResponse(state.context === 'handoff' ? 'The next conversation will focus on a slow site handoff.' : 'The next conversation will focus on a new region with different needs.');
      setLogic(contextName(), 'Select case data', state.context === 'handoff' ? 'Handoff case' : 'Expansion case',
        'Relevant content can be chosen by customer issue, target vertical, product, learner role, or responsibility. This example changes the customer situation.',
        `The practice question now uses a ${contextName().toLowerCase()} instead of a generic scenario.`);
      next.innerHTML = 'Continue <span aria-hidden="true">→</span>';
    } else if (step === 3) {
      const customerCue = state.context === 'handoff'
        ? '“Every site transfer waits on two approvals.”'
        : '“A new region needs service, but its requirements differ.”';
      setText('[data-curriculum-prompt]', `As a ${roleName().toLowerCase()}, the customer says ${customerCue} What would you ask next?${state.knowledge === 'new' ? ' Hint: start with the concrete clue.' : ''}`);
      setChoices(state.context === 'handoff'
        ? [['probe', 'Where does the handoff stall?'], ['pitch', 'We can fix every delay.']]
        : [['probe', 'Which regional needs differ?'], ['pitch', 'Use the same rollout plan.']], state.response,
        state.response ? (mastered() ? 'is-correct' : 'is-coaching') : '');
      if (!state.response) setResponse('Choose a response. The next practice will react to what your answer shows.');
      else if (mastered()) setResponse('Strong signal: the next case becomes more demanding, even from a beginner starting path.', 'strong');
      else setResponse('Learning gap: the next case adds a worked cue, even from an experienced starting path.', 'coaching');
      setLogic(state.response ? (mastered() ? 'Evidence-based question' : 'Unsupported promise') : 'Open response',
        'Judge reasoning', state.response ? (mastered() ? 'Raise challenge' : 'Add support') : 'Await signal',
        'Demonstrated knowledge can override the starting level. This response raises the challenge or adds a cue. In a longer course, repeated difficulty could add deeper scaffolding, as a human teacher would.',
        state.response ? (mastered() ? 'The learner moves into a harder application case.' : 'The learner gets a focused cue and another attempt.') : 'The learner chooses a real next move, then sees the effect on the path.');
      next.disabled = !state.response;
      next.innerHTML = 'Continue to assessment <span aria-hidden="true">→</span>';
    } else if (step === 4) {
      const handoff = state.context === 'handoff';
      const stretch = mastered();
      const assessmentCase = handoff
        ? stretch
          ? 'Two approvals slow every site transfer, but the customer cannot drop controls. What plan balances speed and oversight?'
          : 'Two approvals slow every site transfer. Cue: locate where the work waits before suggesting a fix. What do you check first?'
        : stretch
          ? 'A new region wants a fast rollout, but its requirements differ from the current market. What must you weigh before recommending a plan?'
          : 'The new region has different requirements. Cue: identify the difference before reusing a plan. What do you ask first?';
      const assessmentChoices = handoff
        ? stretch
          ? [['evidence', 'Map approval points, quantify the delay, and validate a safe next step'], ['assume', 'Promise to remove the approvals immediately']]
          : [['evidence', 'Ask where the two approvals stall'], ['assume', 'Ask whether they want a new product']]
        : stretch
          ? [['evidence', 'Compare regional needs and rollout risks before recommending a plan'], ['assume', 'Reuse the current plan to move faster']]
          : [['evidence', 'Ask which regional requirement changes the decision'], ['assume', 'Assume the current requirements still apply']];
      setText('[data-curriculum-prompt]', `${stretch ? 'Stretch case' : 'Guided case'} for ${roleName().toLowerCase()}: ${assessmentCase}`);
      setChoices(assessmentChoices, state.assessment,
        state.submitted && state.assessment ? (assessmentCorrect() ? 'is-correct' : 'is-coaching') : '');
      if (state.submitted) setResponse(assessmentCorrect()
        ? 'Your answer uses the customer cue and names a next action. The takeaway will support this exact task.'
        : 'That answer skips discovery. The takeaway will include a focused prompt card and a second practice case.', assessmentCorrect() ? 'strong' : 'coaching');
      else setResponse('Choose an action, then check it against the task rubric: evidence, judgment, and next step.');
      setLogic(`${roleName()} + ${contextName()}`, 'Apply task rubric', state.submitted ? (assessmentCorrect() ? 'Ready to apply' : 'Targeted retry') : 'Await answer',
        'The culminating assessment uses role and work context. Prior knowledge shaped the first cue; observed performance now determines a guided question or a harder tradeoff. The same approach can assess a simulation, explanation, or deliverable.',
        `${stretch ? 'This learner must balance speed and risk in a harder case.' : 'This learner sees the relevant clue and checks one decision.'} Feedback checks evidence, judgment, and the proposed next step.`);
      next.disabled = !state.assessment;
      next.innerHTML = state.submitted ? 'View takeaways <span aria-hidden="true">→</span>' : 'Check response <span aria-hidden="true">✓</span>';
    } else {
      setText('[data-curriculum-prompt]', `Here is a ${mastered() ? 'next-step' : 'guided'} work aid for a ${roleName().toLowerCase()} handling a ${contextName().toLowerCase()} conversation.`);
      setChoices([['prompt', 'Open discovery prompt card'], ['checklist', 'Open follow-up checklist']], state.resource);
      if (state.resource === 'prompt') setResponse(state.context === 'handoff'
        ? 'Ask: Where does the handoff wait? How often? Who owns the next decision?'
        : 'Ask: Which regional requirement changes the decision? What must be validated first?', 'strong');
      else if (state.resource === 'checklist') setResponse('Before the next customer conversation: confirm the cue, check the evidence, agree on the next owner, and capture follow-up.', 'strong');
      else setResponse(assessmentCorrect() ? `A concise ${contextName().toLowerCase()} reference helps this ${roleName().toLowerCase()} apply the skill in the next customer conversation.` : `A focused ${contextName().toLowerCase()} reference and follow-up case address the gap this ${roleName().toLowerCase()} revealed.`);
      setLogic(state.submitted ? (assessmentCorrect() ? 'Applied skill' : 'Learning gap') : 'Practice record',
        'Select work aid', state.context === 'handoff' ? 'Handoff reference' : 'Expansion reference',
        'After training, the system can prepare a job aid, reference, practice prompt, checklist, or a resource for a current deliverable. The assessment evidence shapes which one helps most.',
        'The learner leaves with a resource for the exact conversation they expect to handle at work.');
      next.innerHTML = 'Restart pathway <span aria-hidden="true">↺</span>';
    }
    if (withMotion) animate();
  };

  el('[data-curriculum-choices]').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-curriculum-choice]');
    if (!button) return;
    const choice = button.dataset.curriculumChoice;
    if (state.step === 0) state.role = choice;
    else if (state.step === 1) state.knowledge = choice;
    else if (state.step === 2) state.context = choice;
    else if (state.step === 3) state.response = choice;
    else if (state.step === 4) { state.assessment = choice; state.submitted = false; }
    else state.resource = choice;
    render();
  });
  el('[data-curriculum-next]').addEventListener('click', () => {
    if (state.step === 3 && !state.response) return;
    if (state.step === 4) {
      if (!state.assessment) return;
      if (!state.submitted) { state.submitted = true; render(); return; }
    }
    if (state.step === 5) {
      Object.assign(state, { step: 0, role: 'partner', knowledge: 'new', context: 'handoff', response: null, assessment: null, submitted: false, resource: null });
    } else state.step += 1;
    render();
  });
  render(false);
})();
