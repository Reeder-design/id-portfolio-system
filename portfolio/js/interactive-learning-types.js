(() => {
  const selectOne = (buttons, selected) => {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
  };

  const typeTabs = [...document.querySelectorAll('.type-tabs [role="tab"]')];
  const selectTypeTab = (selected, focus = false) => {
    typeTabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
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
    branchMap.dataset.route = phase === 2 ? 'probe' : phase === 3 ? 'pitch' : 'none';
    branchFeedback.textContent = [
      'A customer explains that orders are delayed between teams.',
      'The learner considers two responses.',
      'Asking where work stalls reveals the bottleneck.',
      'Pitching early leaves the root cause hidden.'
    ][phase];
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
  }, 4, 1800, 2);

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
  }, 3, 2300, 1);

  const phishingEmails = [
    { sender: 'IT Helpdesk · external address', subject: 'Urgent: reset your password', cue: 'Unfamiliar sender · rushed deadline', feedback: 'An AI-crafted urgent reset request uses an unfamiliar sender. Report it.' },
    { sender: 'Executive office · outside domain', subject: 'Buy gift cards before 2 PM', cue: 'Unexpected payment request · urgency', feedback: 'A fake executive asks for gift cards. Report the impersonation.' },
    { sender: 'Vendor billing · lookalike domain', subject: 'Invoice overdue: open attachment', cue: 'Unexpected attachment · spoofed domain', feedback: 'A lookalike vendor domain and attachment are warning signs. Report it.' }
  ];
  const phishingVisual = document.querySelector('.phishing-visual');
  loop(phase => {
    const cleared = Math.min(phase, 3);
    const email = phishingEmails[Math.min(phase, 2)];
    phishingVisual.dataset.score = String(cleared);
    document.getElementById('gameStars').textContent = Array.from({ length: 3 }, (_, index) => index < cleared ? '★' : '☆').join(' ');
    document.getElementById('gameCount').textContent = cleared === 3 ? 'All 3 reported' : `${3 - cleared} threat${3 - cleared === 1 ? '' : 's'} to spot`;
    document.getElementById('phishingSender').textContent = email.sender;
    document.getElementById('phishingSubject').textContent = email.subject;
    document.getElementById('phishingCue').textContent = email.cue;
    document.getElementById('gameFeedback').textContent = phase === 3
      ? 'Three suspicious emails reported. The simulation restarts for another practice round.'
      : email.feedback;
  }, 4, 2850, 1);

  const aiButtons = [...document.querySelectorAll('[data-ai-learner]')];
  aiButtons.forEach(button => button.addEventListener('click', () => {
    selectOne(aiButtons, button);
    aiButtons.forEach(item => item.classList.toggle('active', item === button));
    const newer = button.dataset.aiLearner === 'new';
    document.getElementById('aiRouteMiddle').textContent = newer ? 'Guided example' : 'Complex case';
    document.getElementById('aiRouteEnd').textContent = newer ? 'Practice with cues' : 'Open response';
    document.getElementById('aiLearnerPrompt').textContent = newer
      ? '“I know the customer is interested. What should I ask next?”'
      : '“The sponsor supports us, but I am unsure who signs off. How should I test the deal?”';
    document.getElementById('aiCoachReply').textContent = newer
      ? '“Ask who can approve the investment, then listen for evidence of the buying process.”'
      : '“Map the approval path. Which stakeholder can confirm the economic buyer and timing?”';
    document.getElementById('aiPathFeedback').textContent = newer
      ? 'The tutor provides a concrete question and guided example for the next attempt.'
      : 'The tutor challenges the learner to test the approval path in a more complex case.';
  }));
})();
