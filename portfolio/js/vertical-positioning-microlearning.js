(() => {
  const iconRoot = '../../../../assets/icons/portfolio-icons.svg#';
  const pixelRoot = '../../../../assets/icons/pixel/workflows/';
  const asset = (name) => `<span class="case-asset-bubble" aria-hidden="true"><img src="${pixelRoot}${name}.webp" alt=""></span>`;
  const documentRoot = '../../../../assets/documents/';
  const paths = {
    seaport: {
      name: 'Seaport', icon: 'icon-ship', image: 'smarter-seaports.webp',
      alt: 'Sanitized seaport learner screen', caption: 'Sanitized learner screen · seaport positioning',
      intro: 'Seaport positioning starts with distributed terminal and field operations. The seller needs to understand where equipment status and team handoffs become hard to see before discussing a solution.',
      pains: [
        { label: 'Equipment status reaches field teams after a handoff.', differentiator: 'Stress a shared view of the handoff and faster access to the status the field team needs.',
          customer: '“Our field team hears about a move after the equipment is already in another terminal.”',
          choices: [
            { label: 'Ask where the update is delayed, then use the validated handoff frequency to discuss time at issue.', response: '“The delay happens most often at shift change. We can estimate how frequently that occurs.”', feedback: 'Strong move. You connect the customer cue to an assumption they can validate before making an ROI claim.', correct: true },
            { label: 'Promise that every terminal delay will disappear.', response: '“That sounds too broad. We have several causes of delay.”', feedback: 'The promise exceeds the evidence. Return to the specific handoff and ask the client to validate the scale.', correct: false },
            { label: 'Skip the workflow and begin a feature tour.', response: '“I need help with this handoff first.”', feedback: 'The customer has named a clear operating pain. Start there, then choose the relevant differentiator.', correct: false }
          ] },
        { label: 'Teams cannot see the same handoff status across terminals.', differentiator: 'Stress a consistent operating picture across teams, tied to the customer’s existing update process.',
          customer: '“Each terminal has its own update. We spend time reconciling which status is current.”',
          choices: [
            { label: 'Map one cross-terminal update, then test the frequency and time spent reconciling it.', response: '“That is useful. The reconciliation happens several times each week.”', feedback: 'Strong move. The example stays tied to the customer’s process and gives the ROI discussion a testable input.', correct: true },
            { label: 'Say the product will replace every terminal system.', response: '“We are not planning a full replacement.”', feedback: 'That jumps to an unsupported implementation claim. Frame the differentiator around shared visibility.', correct: false },
            { label: 'Treat the terminals as if their processes were identical.', response: '“Their handoffs are different. That is part of the problem.”', feedback: 'The vertical context matters. Ask how the handoffs differ before positioning the benefit.', correct: false }
          ] }
      ],
      takeaway: 'seaport-positioning-takeaway.pdf'
    },
    airport: {
      name: 'Airport', icon: 'icon-plane', image: 'airports-connected.webp',
      alt: 'Sanitized airport learner screen', caption: 'Sanitized learner screen · airport positioning',
      intro: 'Airport positioning begins with time-sensitive coordination among gate, ramp, and service teams. A change in one area can affect several others, so sellers need to locate the handoff before naming a differentiator.',
      pains: [
        { label: 'Gate changes reach ramp and service teams at different times.', differentiator: 'Stress a shared view of a change and the teams it affects, rather than a generic speed claim.',
          customer: '“A gate change reached one team late, and our response became a scramble.”',
          choices: [
            { label: 'Trace one gate-change notification and ask how often the late handoff occurs.', response: '“The gap is usually between gate and ramp. We can check how often it happens.”', feedback: 'Strong move. The customer identifies a measurable coordination gap before you discuss the possible impact.', correct: true },
            { label: 'Promise to remove every airport delay.', response: '“There are many reasons for a delay. That is not credible.”', feedback: 'That overstates the outcome. Keep the claim bounded to the notification path the customer described.', correct: false },
            { label: 'Start with a full technical architecture review.', response: '“I want to know how this helps operations first.”', feedback: 'The operational cue should shape the first response. Technical detail can follow when needed.', correct: false }
          ] },
        { label: 'Service teams lose time confirming which update is current.', differentiator: 'Stress clear status and ownership at the point of handoff, grounded in the airport’s own workflow.',
          customer: '“Our service teams make extra calls just to confirm the latest update.”',
          choices: [
            { label: 'Ask where confirmation calls happen and estimate their frequency with the client.', response: '“Usually after a schedule change. We could count those calls over a week.”', feedback: 'Strong move. The client can validate the baseline before you translate the friction into a time estimate.', correct: true },
            { label: 'Assume every call takes 30 minutes and quote savings immediately.', response: '“That number does not match our experience.”', feedback: 'Do not invent an ROI input. Ask the client for a credible frequency and duration.', correct: false },
            { label: 'Give the same terminal-operations example used for seaports.', response: '“That is not how our gate and service teams work.”', feedback: 'The learning path changes for a reason. Use the airport workflow and its own differentiators.', correct: false }
          ] }
      ],
      takeaway: 'airport-positioning-takeaway.pdf'
    }
  };

  const el = (id) => document.getElementById(id);
  const fields = {
    industryName: el('verticalIndustryName'), progressText: el('verticalProgressText'), progressFill: el('verticalProgressFill'),
    stageIcon: el('verticalStageIcon'), eyebrow: el('verticalStageEyebrow'), title: el('verticalStageTitle'),
    copy: el('verticalStageCopy'), figure: el('verticalStageFigure'), stageVisual: el('verticalStageVisual'), caption: el('verticalStageCaption'),
    conversation: el('verticalConversation'), customerLine: el('verticalCustomerLine'), responseWrap: el('verticalResponseWrap'), response: el('verticalScenarioResponse'),
    choiceArea: el('verticalChoiceArea'), prompt: el('verticalChoicePrompt'), choices: el('verticalChoices'), feedback: el('verticalFeedback'),
    roi: el('verticalRoi'), roiHandoffs: el('verticalRoiHandoffs'), roiHandoffsValue: el('verticalRoiHandoffsValue'), roiMinutes: el('verticalRoiMinutes'), roiMinutesValue: el('verticalRoiMinutesValue'), roiResult: el('verticalRoiResult'),
    finish: el('verticalFinish'), finishTitle: el('verticalFinishTitle'), finishText: el('verticalFinishText'), pathSummary: el('verticalPathSummary'), takeawayLink: el('verticalTakeawayLink'),
    action: el('verticalDesignAction'), decision: el('verticalDesignDecision'), development: el('verticalDevelopmentMove'), tool: el('verticalDesignTool'),
    hint: el('verticalStepHint'), back: el('verticalBack'), next: el('verticalContinue'), restart: el('verticalRestart')
  };
  if (!fields.next) return;
  const industryButtons = [...document.querySelectorAll('[data-industry]')];
  const pathItems = [...document.querySelectorAll('.vertical-path-map li')];
  const heroVisual = document.querySelector('.vertical-hero-visual');
  const learnerPanel = document.querySelector('.vertical-learner-panel');
  const designerPanel = document.querySelector('.vertical-designer-panel');
  const labels = ['Positioning', 'Pain points', 'ROI', 'Scenario', 'Takeaway'];
  let industry = 'seaport';
  let stage = 0;
  let painIndex = null;
  let scenarioIndex = null;

  function setDesign(action, decision, development, tool) {
    fields.action.textContent = action;
    fields.decision.textContent = decision;
    fields.development.textContent = development;
    fields.tool.textContent = tool;
  }

  function makeChoices(question, choices, selected, select) {
    fields.choiceArea.hidden = false;
    fields.prompt.textContent = question;
    fields.choices.replaceChildren();
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vertical-choice';
      button.classList.toggle('selected', selected === index);
      button.classList.toggle('correct', stage === 3 && selected === index && choice.correct === true);
      button.classList.toggle('incorrect', stage === 3 && selected === index && choice.correct === false);
      button.setAttribute('aria-pressed', String(selected === index));
      const letter = document.createElement('span');
      letter.textContent = String.fromCharCode(65 + index);
      const icon = document.createElement('span');
      icon.className = 'case-asset-bubble vertical-choice-asset';
      icon.setAttribute('aria-hidden', 'true');
      const image = document.createElement('img');
      image.src = pixelRoot + (stage === 1 ? ['support-resources/information','people-collaboration/communication'][index % 2] : ['people-collaboration/communication','support-resources/guidance','planning-projects/tasks'][index % 3]) + '.webp';
      image.alt = '';
      icon.append(image);
      const label = document.createElement('span');
      label.textContent = choice.label;
      button.append(letter, icon, label);
      button.addEventListener('click', () => { select(index); fields.choices.children[index]?.focus(); });
      fields.choices.append(button);
    });
    fields.next.disabled = selected === null;
    fields.hint.textContent = selected === null ? 'Choose an option to reveal the next part of this path.' : 'Review the response, then continue or try another option.';
  }

  function updateRoi() {
    const handoffs = Number(fields.roiHandoffs.value);
    const minutes = Number(fields.roiMinutes.value);
    const hours = (handoffs * minutes * 4 / 60).toFixed(1);
    fields.roiHandoffsValue.value = handoffs;
    fields.roiMinutesValue.value = minutes;
    fields.roiResult.textContent = hours + ' hours';
  }

  function renderStageVisual(data, pain) {
    if (!fields.stageVisual) return;
    fields.stageVisual.hidden = stage === 0;
    fields.stageVisual.dataset.stage = String(stage);
    fields.stageVisual.dataset.industry = industry;
    if (stage === 1) fields.stageVisual.innerHTML = `<div class="vertical-visual-scene vertical-cue-scene"><span class="vertical-visual-place">${asset('strategy-impact/global')} ${data.name.toUpperCase()} · CUSTOMER CUE</span><div class="vertical-cue-route"><span>${asset('people-collaboration/user-learner')}<b>Customer situation</b><small>${data.name === 'Seaport' ? 'Terminal handoff' : 'Gate change'}</small></span><i>→</i><span>${asset('support-resources/information')}<b>Listen for friction</b><small>${painIndex === null ? 'Choose a cue below' : pain.label}</small></span><i>→</i><span>${asset('analytics-insights/insights')}<b>Connect value</b><small>Use a relevant differentiator</small></span></div></div>`;
    if (stage === 2) fields.stageVisual.innerHTML = `<div class="vertical-visual-scene vertical-roi-scene"><span class="vertical-visual-place">${asset('analytics-insights/analytics')} CLIENT ROI CONVERSATION</span><div class="vertical-roi-dashboard"><div class="vertical-roi-bars"><i></i><i></i><i></i><i></i><i></i></div><div><strong>Start with the client’s baseline</strong><span>${asset('planning-projects/tasks')} Frequency</span><span>${asset('analytics-insights/data')} Delay per handoff</span><span>${asset('people-collaboration/communication')} Validate together</span></div></div><small>Use the sliders below to model a question, not to claim savings.</small></div>`;
    if (stage === 3) fields.stageVisual.innerHTML = `<div class="vertical-visual-scene vertical-scenario-scene"><span class="vertical-visual-place">${asset('strategy-impact/global')} ${data.name.toUpperCase()} · CUSTOMER SETTING</span><div class="vertical-scenario-setting"><div class="vertical-setting-silhouette" aria-hidden="true"><i></i><i></i><i></i></div><div class="vertical-scenario-person">${asset('people-collaboration/user-learner')}<span><strong>Customer</strong><small>${data.name === 'Seaport' ? 'Terminal operations' : 'Airport operations'}</small></span></div><div class="vertical-scenario-prompt">A real cue shapes the response. Choose below to see the customer reply and coaching.</div></div></div>`;
    if (stage === 4) fields.stageVisual.innerHTML = `<div class="vertical-visual-scene vertical-takeaway-scene"><span class="vertical-visual-place">${asset('support-resources/resources')} ${data.name.toUpperCase()} · TALKING GUIDE</span><div class="vertical-onepager"><header>${asset('support-resources/resources')}<strong>${data.name} positioning · one page</strong><small>Takeaway</small></header><div><span>${asset('support-resources/information')} Customer cues</span><span>${asset('analytics-insights/insights')} Value frame</span><span>${asset('people-collaboration/communication')} ROI prompts</span></div></div><small>Download the public-safe guide below.</small></div>`;
  }

  function render() {
    const data = paths[industry];
    const pain = data.pains[painIndex ?? 0];
    fields.industryName.textContent = data.name;
    if (heroVisual) heroVisual.dataset.activeIndustry = industry;
    industryButtons.forEach((button) => {
      const active = button.dataset.industry === industry;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    fields.progressText.textContent = `Step ${stage + 1} of 5 · ${labels[stage]}`;
    fields.progressFill.style.width = `${(stage + 1) * 20}%`;
    pathItems.forEach((item, index) => {
      item.classList.toggle('active', index === stage);
      item.classList.toggle('complete', index < stage);
    });
    fields.eyebrow.textContent = `0${stage + 1} · ${labels[stage]}`;
    fields.figure.hidden = stage !== 0;
    renderStageVisual(data, pain);
    fields.choiceArea.hidden = true;
    fields.roi.hidden = stage !== 2;
    fields.conversation.hidden = stage !== 3;
    fields.responseWrap.hidden = true;
    fields.feedback.hidden = true;
    fields.finish.hidden = stage !== 4;
    fields.back.disabled = stage === 0;
    fields.next.disabled = false;
    fields.next.textContent = stage === 4 ? 'Try another path ↺' : 'Continue →';
    [learnerPanel, designerPanel].forEach((panel) => {
      if (!panel) return;
      panel.classList.remove('is-entering');
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    });

    if (stage === 0) {
      fields.stageIcon.setAttribute('href', iconRoot + data.icon);
      fields.title.textContent = 'Start with the vertical, not a generic pitch.';
      fields.copy.textContent = data.intro;
      document.getElementById('verticalSettingIcon').setAttribute('href', iconRoot + data.icon);
      document.getElementById('verticalSettingLabel').textContent = data.name.toUpperCase() + ' CONTEXT';
      document.getElementById('verticalSettingTitle').textContent = data.name === 'Seaport' ? 'Coordinate a distributed operation' : 'Coordinate a time-sensitive service network';
      document.getElementById('verticalSettingText').textContent = data.name === 'Seaport' ? 'Field teams and terminals need a clear shared picture of handoffs.' : 'Gate, ramp, and service teams need timely updates at every handoff.';
      document.getElementById('verticalSettingCueOne').textContent = data.name === 'Seaport' ? 'Field teams' : 'Gate + ramp';
      document.getElementById('verticalSettingCueTwo').textContent = data.name === 'Seaport' ? 'Current status' : 'Service update';
      fields.caption.textContent = data.caption;
      fields.hint.textContent = 'Review the positioning, then continue.';
      setDesign('I gave sellers a short industry introduction before asking them to make a customer-facing choice.', 'Use one Rise architecture, with separate seaport and airport context so examples do not blur together.', 'Build the vertical sections and keep approved positioning language easy to revise.', 'Rise 360 · vertical introduction');
    } else if (stage === 1) {
      fields.stageIcon.setAttribute('href', iconRoot + 'icon-interaction');
      fields.title.textContent = 'Connect a customer pain point to a useful differentiator.';
      fields.copy.textContent = `Choose the ${data.name.toLowerCase()} friction you want to investigate. Each cue changes the later customer scenario.`;
      makeChoices('Which customer cue will you follow?', data.pains, painIndex, (index) => { painIndex = index; scenarioIndex = null; render(); });
      if (painIndex !== null) {
        fields.feedback.hidden = false;
        fields.feedback.dataset.result = 'strong';
        fields.feedback.textContent = `Differentiator to stress: ${pain.differentiator}`;
      }
      setDesign('I selected common customer pains sellers could listen for, then paired each with a relevant value point.', 'Require the learner to choose a cue before the scenario; that choice determines the practice context.', 'Review vertical terms and differentiators with specialists and keep the feedback concise.', 'Rise 360 · pain point to value');
    } else if (stage === 2) {
      fields.stageIcon.setAttribute('href', iconRoot + 'icon-analytics');
      fields.title.textContent = 'Use the ROI calculator as a client conversation.';
      fields.copy.textContent = `For the ${data.name.toLowerCase()} pain point you selected, adjust these illustrative inputs. The useful move is to ask the client which assumptions are credible before translating time into value.`;
      updateRoi();
      fields.hint.textContent = 'Adjust the assumptions, then continue to scenario practice.';
      setDesign('I showed sellers how to use the positioning ROI calculator with clients, not just where to find it.', 'Make the inputs visible so a seller can ask for a customer-validated baseline before discussing impact.', 'This portfolio interaction uses an illustrative time estimate; the original calculator and formula are not reproduced.', 'ROI conversation · illustrative practice');
    } else if (stage === 3) {
      fields.stageIcon.setAttribute('href', iconRoot + 'icon-feedback');
      fields.title.textContent = 'Practice the next move in an AI scenario branch.';
      fields.copy.textContent = 'Read the customer cue and choose a response. The reply and coaching depend on your choice.';
      fields.customerLine.textContent = pain.customer;
      makeChoices('What do you say next?', pain.choices, scenarioIndex, (index) => { scenarioIndex = index; render(); });
      if (scenarioIndex !== null) {
        const choice = pain.choices[scenarioIndex];
        fields.response.textContent = choice.response;
        fields.responseWrap.hidden = false;
        fields.feedback.hidden = false;
        fields.feedback.dataset.result = choice.correct ? 'strong' : 'coach';
        fields.feedback.textContent = choice.feedback;
      }
      setDesign('I designed a short, learner-facing AI practice after positioning and the ROI conversation so the learner could apply both.', 'Branch on the vertical and selected pain point, then show the consequence of the learner’s response.', 'The original included AI practice; this public-safe version scripts each reply and coaching message without a live model.', 'Learner-facing AI practice · scripted preview');
    } else {
      fields.stageIcon.setAttribute('href', iconRoot + 'icon-workflow');
      fields.title.textContent = 'Take the conversation guide with you.';
      fields.copy.textContent = 'The short lesson ends with a one-page aid for the selected vertical: cues to hear, questions to ask, a bounded value frame, and a prompt for the ROI conversation.';
      fields.finishTitle.textContent = `You completed the ${data.name.toLowerCase()} path.`;
      fields.finishText.textContent = scenarioIndex !== null && pain.choices[scenarioIndex].correct ? 'Your scenario response stayed grounded in the customer cue.' : 'Your scenario branch showed how to return to a customer-grounded response.';
      fields.pathSummary.textContent = `Your path: ${data.name} → ${pain.label} → ROI assumptions → scenario practice.`;
      fields.takeawayLink.href = documentRoot + data.takeaway;
      fields.takeawayLink.textContent = `Download ${data.name.toLowerCase()} one-pager ↓`;
      fields.hint.textContent = 'Download the one-pager or choose the other vertical.';
      setDesign('I ended the learning with a resource sellers could use in an actual vertical conversation.', 'Keep detailed talking points in a takeaway so the core path stays concise.', 'Review the one-pager as a separate resource when messaging or customer examples change.', 'Rise 360 · resource handoff');
    }
  }

  function reset() { stage = 0; painIndex = null; scenarioIndex = null; render(); }
  industryButtons.forEach((button) => button.addEventListener('click', () => { industry = button.dataset.industry; reset(); }));
  fields.back.addEventListener('click', () => { if (stage > 0) { stage -= 1; render(); } });
  fields.next.addEventListener('click', () => { if (stage === 4) reset(); else { stage += 1; render(); } });
  fields.restart.addEventListener('click', reset);
  fields.roiHandoffs.addEventListener('input', updateRoi);
  fields.roiMinutes.addEventListener('input', updateRoi);
  const needData = {
    seaport: {
      label: 'SEAPORT CONTEXT', title: 'Where does a handoff lose visibility?',
      text: 'Field teams and terminals need a shared view of changing equipment status.',
      response: 'A concise seaport path that starts with the operating context, then asks sellers to connect a pain point to value.',
      nodes: ['Terminal teams','Handoff status','Positioning cue']
    },
    airport: {
      label: 'AIRPORT CONTEXT', title: 'Who needs the change first?',
      text: 'Gate, ramp, and service teams need timely updates when a plan changes.',
      response: 'An airport path that uses its own customer cues, ROI assumptions, and scenario branches inside the same learning spine.',
      nodes: ['Gate change','Ramp + service','Positioning cue']
    }
  };
  function renderNeed(key) {
    const item = needData[key];
    if (!item) return;
    const panel = document.querySelector('.vertical-need-panel');
    if (!panel) return;
    panel.dataset.context = key;
    [['verticalNeedLabel',item.label],['verticalNeedTitle',item.title],['verticalNeedText',item.text],['verticalNeedResponse',item.response],['verticalNeedNodeOne',item.nodes[0]],['verticalNeedNodeTwo',item.nodes[1]],['verticalNeedNodeThree',item.nodes[2]]].forEach(([id,value]) => { document.getElementById(id).textContent = value; });
    document.querySelectorAll('[data-need-context]').forEach(button => {
      const active = button.dataset.needContext === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  document.querySelectorAll('[data-need-context]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.needContext;
    document.querySelector(`[data-industry="${key}"]`)?.click();
    renderNeed(key);
  }));
  industryButtons.forEach(button => button.addEventListener('click', () => renderNeed(button.dataset.industry)));
  const workflowLabels = {
    scope: ['01 / Scope','Keep only the context a seller needs.'],
    architect: ['02 / Architect','Keep the learner rhythm consistent.'],
    build: ['03 / Build','Develop two distinct branches.'],
    review: ['04 / Validate','Check accuracy and hand off resources.']
  };
  document.querySelectorAll('.vertical-build-stages [data-micro-flow]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.microFlow;
    document.querySelector('.vertical-build-shell').dataset.activeStage = key;
    document.getElementById('verticalFlowLabel').textContent = workflowLabels[key][0];
    document.getElementById('verticalFlowTitle').textContent = workflowLabels[key][1];
  }));
  renderNeed(industry);
  render();
})();
