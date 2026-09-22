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

  const heroButtons = [...document.querySelectorAll('[data-hero-choice]')];
  const heroResult = document.getElementById('heroChoiceResult');
  heroButtons.forEach(button => button.addEventListener('click', () => {
    selectOne(heroButtons, button);
    const probe = button.dataset.heroChoice === 'probe';
    heroResult.classList.toggle('is-risk', !probe);
    heroResult.textContent = probe
      ? 'The customer describes the bottleneck. Now the learner has evidence for a useful next question.'
      : 'The pitch arrives before the need is clear. Try a question that uncovers the bottleneck.';
  }));

  const branchButtons = [...document.querySelectorAll('[data-branch]')];
  const branchMap = document.querySelector('.branch-map');
  const branchFeedback = document.getElementById('branchFeedback');
  branchButtons.forEach(button => button.addEventListener('click', () => {
    selectOne(branchButtons, button);
    const probe = button.dataset.branch === 'probe';
    branchMap.dataset.route = probe ? 'probe' : 'pitch';
    branchFeedback.textContent = probe
      ? 'Probing reveals why the handoff slows. A better decision becomes possible.'
      : 'Pitching early skips the underlying cause. The next choice has less evidence.';
  }));

  const quizButtons = [...document.querySelectorAll('[data-quiz-answer]')];
  const quizFeedback = document.getElementById('quizFeedback');
  quizButtons.forEach(button => button.addEventListener('click', () => {
    quizButtons.forEach(item => item.classList.remove('correct', 'incorrect'));
    const correct = button.dataset.quizAnswer === 'yes';
    button.classList.add(correct ? 'correct' : 'incorrect');
    quizFeedback.textContent = correct
      ? 'Correct. Lost time is a customer problem, not just product or meeting information.'
      : 'Not quite. Look for an impact the customer actually experiences.';
  }));

  const videoCues = [
    { caption: 'Customer describes a slow handoff.', art: 'interactive-video-hotspots.webp', hotspot: 'Inspect the cue +' },
    { caption: 'Pause before the next question.', art: 'question-timeline.webp', hotspot: 'Choose a question +' },
    { caption: 'The response reveals the impact.', art: 'click-to-reveal-image.webp', hotspot: 'See the takeaway +' }
  ];
  const videoButtons = [...document.querySelectorAll('[data-video-cue]')];
  let videoIndex = 0;
  const videoMoment = document.getElementById('videoMoment');
  const videoOptions = document.getElementById('videoMomentOptions');
  videoButtons.forEach(button => button.addEventListener('click', () => {
    selectOne(videoButtons, button);
    videoIndex = Number(button.dataset.videoCue);
    const cue = videoCues[videoIndex];
    const screen = document.querySelector('.video-screen');
    screen.dataset.videoFrame = String(videoIndex);
    document.getElementById('videoFrameArt').src = `../../../assets/icons/pixel/interactive-learning/${cue.art}`;
    document.getElementById('videoCaption').textContent = cue.caption;
    document.getElementById('videoHotspot').textContent = cue.hotspot;
    videoOptions.hidden = true;
    videoMoment.querySelector('p').textContent = 'Click the marker in the frame to inspect this learning moment.';
  }));
  document.getElementById('videoHotspot').addEventListener('click', () => {
    const messages = [
      'The learner notices lost time in handoffs, not just a feature request.',
      'Which question will clarify the cost of the delay?',
      'The learner connects the cue, question, and customer impact before moving on.'
    ];
    videoMoment.querySelector('p').textContent = messages[videoIndex];
    videoOptions.hidden = videoIndex !== 1;
  });
  const videoAnswers = [...document.querySelectorAll('[data-video-answer]')];
  videoAnswers.forEach(button => button.addEventListener('click', () => {
    selectOne(videoAnswers, button);
    videoMoment.querySelector('p').textContent = button.dataset.videoAnswer === 'probe'
      ? 'Good move. Asking where work stalls reveals the impact behind the delay.'
      : 'Try again. A pitch does not explain how the delay affects the customer.';
  }));

  let softwareIndex = 0;
  const softwareControls = [...document.querySelectorAll('[data-software-control]')];
  const softwareTask = document.getElementById('softwareStep');
  const softwareTitle = document.getElementById('softwareTitle');
  const softwareTarget = document.getElementById('softwareTarget');
  const softwareExpected = ['learners', 'status', 'reports'];
  softwareControls.forEach(button => button.addEventListener('click', () => {
    if (softwareIndex >= softwareExpected.length) return;
    if (button.dataset.softwareControl !== softwareExpected[softwareIndex]) {
      softwareTask.textContent = `Not yet. ${['Open Learners first.', 'Open Pathway status next.', 'Open Reports to confirm the record.'][softwareIndex]}`;
      return;
    }
    softwareIndex += 1;
    softwareControls.forEach(item => item.classList.toggle('active', item === button));
    if (softwareIndex === 1) {
      softwareTitle.textContent = 'Learner record';
      softwareTarget.hidden = false;
      softwareTask.textContent = 'Task 2 of 3: open Pathway status.';
    } else if (softwareIndex === 2) {
      softwareTitle.textContent = 'Pathway status: incomplete';
      softwareTarget.hidden = true;
      softwareTask.textContent = 'Task 3 of 3: open Reports.';
    } else {
      softwareTitle.textContent = 'Report preview: learning incomplete';
      softwareTask.textContent = 'Complete: the report makes the blocker visible.';
    }
  }));
  document.getElementById('softwareReset').addEventListener('click', () => {
    softwareIndex = 0;
    softwareControls.forEach(item => item.classList.remove('active'));
    softwareTitle.textContent = 'Dashboard';
    softwareTarget.hidden = true;
    softwareTask.textContent = 'Task 1 of 3: open Learners.';
  });

  const hotspotDetails = {
    signal: ['Signal', 'Start with the clue the learner should notice.'],
    decision: ['Decision', 'Reveal what evidence changes the choice.'],
    outcome: ['Outcome', 'Connect the action to what happens next.']
  };
  const hotspotButtons = [...document.querySelectorAll('[data-hotspot]')];
  hotspotButtons.forEach(button => button.addEventListener('click', () => {
    selectOne(hotspotButtons, button);
    const [title, detail] = hotspotDetails[button.dataset.hotspot];
    const reveal = document.getElementById('hotspotReveal');
    reveal.querySelector('strong').textContent = title;
    reveal.querySelector('span').textContent = detail;
  }));

  const gameRounds = [
    { prompt: 'Which clue describes customer impact?', answers: ['Lost time', 'Feature list'], correct: 0, why: 'Lost time is a consequence the customer experiences.' },
    { prompt: 'Which question clarifies the need?', answers: ['Where does work stall?', 'Which color do you prefer?'], correct: 0, why: 'The question investigates the bottleneck.' },
    { prompt: 'What makes feedback useful?', answers: ['Only a score', 'Explain the reasoning'], correct: 1, why: 'Reasoning helps the learner improve the next attempt.' }
  ];
  let gameScore = 0;
  const gameVisual = document.querySelector('.game-visual');
  const gameChoices = [...document.querySelectorAll('[data-game-choice]')];
  const gamePrompt = document.getElementById('gamePrompt');
  const gameFeedback = document.getElementById('gameFeedback');
  const renderGameRound = () => {
    gameVisual.dataset.score = String(gameScore);
    document.getElementById('gameCount').textContent = `${gameScore} / 3`;
    document.getElementById('gameBadge').textContent = gameScore === 3 ? 'Badge earned' : 'Badge locked';
    if (gameScore === 3) {
      gamePrompt.textContent = 'Challenge complete';
      gameChoices.forEach(button => { button.hidden = true; });
      document.getElementById('gameReset').hidden = false;
      return;
    }
    const round = gameRounds[gameScore];
    gamePrompt.textContent = round.prompt;
    gameChoices.forEach((button, index) => {
      button.hidden = false;
      button.textContent = round.answers[index];
    });
  };
  gameChoices.forEach(button => button.addEventListener('click', () => {
    const round = gameRounds[gameScore];
    if (Number(button.dataset.gameChoice) !== round.correct) {
      gameFeedback.textContent = 'Try again. Look for the action that supports the learning goal.';
      return;
    }
    gameScore += 1;
    gameFeedback.textContent = gameScore === 3 ? `${round.why} Badge earned.` : `${round.why} Next round unlocked.`;
    renderGameRound();
  }));
  document.getElementById('gameReset').addEventListener('click', event => {
    gameScore = 0;
    event.currentTarget.hidden = true;
    gameFeedback.textContent = 'Choose an answer to advance.';
    renderGameRound();
  });

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
