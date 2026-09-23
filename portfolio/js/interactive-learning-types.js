(() => {
  let startPhishingDemo = () => {};
  let startAiDemo = () => {};
  let syncPointers = () => {};
  const typeTabs = [...document.querySelectorAll('.type-tabs [role="tab"]')];
  const selectTypeTab = (selected, focus = false) => {
    typeTabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
    if (selected.id === 'tab-gamified-challenges') startPhishingDemo();
    if (selected.id === 'tab-learner-facing-ai') startAiDemo();
    window.requestAnimationFrame(syncPointers);
    if (focus) selected.focus();
  };
  typeTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTypeTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = typeTabs.length - 1;
      else if (event.key === 'ArrowRight') next = (index + 1) % typeTabs.length;
      else next = (index - 1 + typeTabs.length) % typeTabs.length;
      selectTypeTab(typeTabs[next], true);
    });
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Measure each actual target so the demonstration cursor stays attached as
  // the tab, viewport, text wrapping, or browser zoom changes.
  const placePointer = (scene, pointer, target) => {
    if (!scene || !pointer || !target || !scene.getClientRects().length) return;
    const sceneBox = scene.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    pointer.style.left = `${targetBox.left - sceneBox.left + targetBox.width * .58 - 3}px`;
    pointer.style.top = `${targetBox.top - sceneBox.top + targetBox.height * .52 - 2}px`;
  };
  syncPointers = () => {
    const branch = document.querySelector('.branch-map');
    const branchPhase = Number(branch.dataset.phase || 0);
    placePointer(branch, branch.querySelector('.scenario-demo-pointer'),
      branchPhase === 0 ? branch.querySelector('.meeting-dialogue') :
      branch.querySelectorAll('.branch-paths [data-branch]')[branchPhase === 3 ? 1 : 0]);

    const quiz = document.querySelector('.quiz-paper');
    const quizPhase = Number(document.querySelector('.quiz-visual').dataset.phase || 0);
    placePointer(quiz, quiz.querySelector('.quiz-demo-pointer'),
      quizPhase === 0 ? quiz.querySelector('p') :
      quiz.querySelectorAll('[data-quiz-answer]')[quizPhase === 1 ? 0 : 1]);

    const video = document.querySelector('.video-screen');
    const videoPhase = Number(video.dataset.phase || 0);
    placePointer(video, video.querySelector('.video-demo-pointer'),
      videoPhase === 0 ? video.querySelector('.video-question strong') :
      video.querySelectorAll('[data-video-answer]')[videoPhase === 1 ? 0 : 1]);

    const software = document.querySelector('.software-window');
    const softwareTargets = [software.querySelector('[data-software-control="catalog"]'),
      software.querySelector('.software-target'), software.querySelector('.software-submit'),
      software.querySelector('#orderStatus')];
    placePointer(software, software.querySelector('.software-demo-pointer'),
      softwareTargets[Number(software.dataset.step || 0)]);

    const hotspot = document.querySelector('.hotspot-visual');
    const canvas = hotspot.querySelector('.hotspot-canvas');
    placePointer(canvas, canvas.querySelector('.hotspot-demo-pointer'),
      canvas.querySelectorAll('[data-hotspot]')[Number(hotspot.dataset.phase || 0)]);

    const personas = document.querySelector('.ai-personas');
    const activePersona = personas.querySelector('[data-ai-learner].active');
    placePointer(personas, personas.querySelector('.ai-demo-pointer'), activePersona);

    const phishing = document.querySelector('.phishing-visual');
    const stage = phishing.querySelector(`.phishing-stage-${phishing.dataset.round}`);
    if (stage && stage.getClientRects().length) {
      const source = stage.querySelector('.phishing-request:not(.safe),.phishing-mail-content,.phishing-text-bubble');
      const destination = stage.querySelector('.phishing-target');
      const card = stage.querySelector('.phishing-drag-card');
      const pointer = stage.querySelector('.phishing-demo-pointer');
      const stageBox = stage.getBoundingClientRect();
      const sourceBox = source.getBoundingClientRect();
      const destinationBox = destination.getBoundingClientRect();
      const sourceX = sourceBox.left - stageBox.left + sourceBox.width * .52;
      const sourceY = sourceBox.top - stageBox.top + sourceBox.height * .5;
      const destinationX = destinationBox.left - stageBox.left + destinationBox.width * .5;
      const destinationY = destinationBox.top - stageBox.top + destinationBox.height * .5;
      card.style.left = `${sourceX - card.offsetWidth * .5}px`;
      card.style.top = `${sourceY - card.offsetHeight * .5}px`;
      card.style.setProperty('--drag-x', `${destinationX - sourceX}px`);
      card.style.setProperty('--drag-y', `${destinationY - sourceY}px`);
      pointer.style.left = `${sourceX - 3}px`;
      pointer.style.top = `${sourceY - 2}px`;
      pointer.style.setProperty('--pointer-x', `${destinationX - sourceX}px`);
      pointer.style.setProperty('--pointer-y', `${destinationY - sourceY}px`);
    }
  };
  window.addEventListener('resize', () => window.requestAnimationFrame(syncPointers));
  document.fonts?.ready.then(() => window.requestAnimationFrame(syncPointers));
  const loop = (render, count, duration, staticPhase = 0) => {
    let phase = reducedMotion ? staticPhase : 0;
    render(phase);
    if (!reducedMotion) window.setInterval(() => {
      phase = (phase + 1) % count;
      render(phase);
    }, duration);
  };

  const branchMap = document.querySelector('.branch-map');
  const branchFeedback = document.getElementById('branchFeedback');
  loop(phase => {
    branchMap.dataset.phase = String(phase);
    branchMap.dataset.route = phase === 2 ? 'probe' : phase === 3 ? 'pitch' : 'none';
    branchFeedback.textContent = [
      'A customer explains that orders are delayed between teams.',
      'The learner considers two responses.',
      'Asking where work stalls reveals the bottleneck.',
      'Pitching early leaves the root cause hidden.'
    ][phase];
    window.requestAnimationFrame(syncPointers);
  }, 4, 1900, 2);

  const quizAnswers = [...document.querySelectorAll('[data-quiz-answer]')];
  const quizFeedback = document.getElementById('quizFeedback');
  loop(phase => {
    document.querySelector('.quiz-visual').dataset.phase = String(phase);
    quizAnswers.forEach(answer => answer.classList.remove('correct', 'incorrect'));
    if (phase === 1) quizAnswers[0].classList.add('incorrect');
    if (phase >= 2) quizAnswers[1].classList.add('correct');
    document.getElementById('quizScore').textContent = ['QUESTION 01 / 03', 'TRY ANOTHER DETAIL', 'EVIDENCE FOUND ✓', 'FEEDBACK APPLIED'][phase];
    quizFeedback.textContent = [
      'Which detail shows a problem the customer experiences?',
      'A product feature is not evidence of customer impact.',
      'Correct: time lost in handoffs is a business pain.',
      'Specific feedback explains why the evidence fits.'
    ][phase];
    window.requestAnimationFrame(syncPointers);
  }, 4, 1800, 2);

  const videoScreen = document.querySelector('.video-screen');
  const videoAnswers = [...videoScreen.querySelectorAll('[data-video-answer]')];
  loop(phase => {
    videoScreen.dataset.phase = String(phase);
    videoAnswers.forEach(answer => answer.classList.remove('incorrect', 'correct'));
    if (phase === 1) videoAnswers[0].classList.add('incorrect');
    if (phase >= 2) videoAnswers[1].classList.add('correct');
    document.getElementById('videoSceneStep').textContent =
      ['MOMENT 01 / OBSERVE', 'MOMENT 02 / CHECK', 'MOMENT 03 / FEEDBACK', 'MOMENT 04 / CONTINUE'][phase];
    document.getElementById('videoCaption').textContent = [
      'Customer describes a slow handoff.', 'A feature request misses the clue.',
      'Lost time is the customer signal.', 'The video continues with context.'
    ][phase];
    window.requestAnimationFrame(syncPointers);
  }, 4, 1750, 2);

  const softwareWindow = document.querySelector('.software-window');
  const softwareTitle = document.getElementById('softwareTitle');
  const softwareTask = document.getElementById('softwareStep');
  loop(phase => {
    softwareWindow.dataset.step = String(phase);
    softwareTitle.textContent = [
      'Create customer order',
      'Choose a product',
      'Review the configured order',
      'Order submitted ✓'
    ][phase];
    softwareTask.textContent = [
      'Step 1 of 3: open Catalog.',
      'Step 2 of 3: configure the package.',
      'Step 3 of 3: submit the order.',
      'Complete: Northstar Supply order #1048 was submitted.'
    ][phase];
    document.getElementById('orderStatus').textContent = phase === 3
      ? 'Order #1048 · Submitted'
      : 'Order #1048 · Draft';
    window.requestAnimationFrame(syncPointers);
  }, 4, 1900, 2);

  const hotspotDetails = [
    ['Signal', 'Start with the clue the learner should notice.'],
    ['Decision', 'Reveal what evidence changes the choice.'],
    ['Outcome', 'Connect the action to what happens next.']
  ];
  const hotspotReveal = document.getElementById('hotspotReveal');
  loop(phase => {
    document.querySelector('.hotspot-visual').dataset.phase = String(phase);
    hotspotReveal.querySelector('strong').textContent = hotspotDetails[phase][0];
    hotspotReveal.querySelector('span').textContent = hotspotDetails[phase][1];
    window.requestAnimationFrame(syncPointers);
  }, 3, 2300, 1);

  const phishingVisual = document.querySelector('.phishing-visual');
  const gameStars = document.getElementById('gameStars');
  const gameCount = document.getElementById('gameCount');
  const gameFeedback = document.getElementById('gameFeedback');
  const rounds = [
    { name: 'social', feedback: 'Round 1: the new profile has no mutual connections and links to a reward. Report the bot.' },
    { name: 'email', feedback: 'Round 2: the email uses a lookalike helpdesk domain and a rushed password request. Report it.' },
    { name: 'text', feedback: 'Round 3: the delivery text comes from an unknown number and links to an unfamiliar site. Block and report.' }
  ];
  let phishingStarted = false;
  const showRound = index => {
    if (index === rounds.length) {
      phishingVisual.dataset.round = 'complete';
      phishingVisual.dataset.score = '3';
      gameStars.textContent = '★ ★ ★';
      gameCount.textContent = 'Mission complete';
      gameFeedback.textContent = 'All three threats were reported. The finished trophy screen stays open.';
      return;
    }
    phishingVisual.dataset.round = rounds[index].name;
    phishingVisual.dataset.score = String(index);
    gameStars.textContent = Array.from({ length: 3 }, (_, star) => star < index ? '★' : '☆').join(' ');
    gameCount.textContent = `${3 - index} threat${3 - index === 1 ? '' : 's'} to spot`;
    gameFeedback.textContent = rounds[index].feedback;
    window.requestAnimationFrame(syncPointers);
  };
  startPhishingDemo = () => {
    if (phishingStarted) return;
    phishingStarted = true;
    showRound(0);
    const roundDuration = reducedMotion ? 2500 : 6000;
    rounds.forEach((_, index) => {
      window.setTimeout(() => showRound(index + 1), roundDuration * (index + 1));
    });
  };

  const aiVisual = document.querySelector('.ai-path-visual');
  const aiProfiles = [...document.querySelectorAll('[data-ai-learner]')];
  const aiResponses = [
    {
      profile: 'new',
      prompt: '“I know the customer is interested. What should I ask next?”',
      reply: '“Ask who can approve the investment, then listen for evidence of the buying process.”',
      feedback: 'The tutor gives a concrete question and guided example for a new learner.'
    },
    {
      profile: 'experienced',
      prompt: '“The sponsor supports us, but I am unsure who signs off. How should I test the deal?”',
      reply: '“Map the approval path. Which stakeholder can confirm the economic buyer and timing?”',
      feedback: 'The tutor challenges an experienced learner to test the approval path.'
    }
  ];
  let aiStarted = false;
  const showAiProfile = index => {
    const response = aiResponses[index];
    aiVisual.dataset.profile = response.profile;
    aiProfiles.forEach(profile => profile.classList.toggle('active', profile.dataset.aiLearner === response.profile));
    document.getElementById('aiLearnerPrompt').textContent = response.prompt;
    document.getElementById('aiCoachReply').textContent = response.reply;
    document.getElementById('aiPathFeedback').textContent = response.feedback;
    aiVisual.classList.remove('ai-refresh');
    void aiVisual.offsetWidth;
    aiVisual.classList.add('ai-refresh');
    window.requestAnimationFrame(syncPointers);
  };
  startAiDemo = () => {
    if (aiStarted) return;
    aiStarted = true;
    let index = 0;
    showAiProfile(index);
    if (!reducedMotion) window.setInterval(() => {
      index = (index + 1) % aiResponses.length;
      showAiProfile(index);
    }, 5500);
  };

})();
