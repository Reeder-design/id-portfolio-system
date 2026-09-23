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
    document.getElementById('quizScore').textContent = correct ? 'EVIDENCE FOUND ✓' : 'TRY ANOTHER DETAIL';
    quizFeedback.textContent = correct
      ? 'Correct. Lost time is a customer problem, not just product or meeting information.'
      : 'Not quite. Look for an impact the customer actually experiences.';
  }));

  const videoCues = [
    { caption: 'Customer describes a slow handoff.', step: 'MOMENT 01 / OBSERVE', title: 'What is the customer describing?', detail: 'Select the detail that signals a real problem.' },
    { caption: 'Playback paused at a decision.', step: 'MOMENT 02 / DECIDE', title: 'Which detail matters most?', detail: 'Select a clue before the video continues.' },
    { caption: 'Feedback connects the clue to the task.', step: 'MOMENT 03 / REFLECT', title: 'What would you investigate?', detail: 'Use the feedback to plan the next question.' }
  ];
  const videoButtons = [...document.querySelectorAll('[data-video-cue]')];
  let videoIndex = 0;
  const videoMoment = document.getElementById('videoMoment');
  const videoScreen = document.querySelector('.video-screen');
  videoButtons.forEach(button => button.addEventListener('click', () => {
    selectOne(videoButtons, button);
    videoIndex = Number(button.dataset.videoCue);
    const cue = videoCues[videoIndex];
    videoScreen.dataset.videoFrame = String(videoIndex);
    videoScreen.classList.remove('has-answer');
    document.querySelectorAll('[data-video-answer]').forEach(item => item.classList.remove('correct', 'incorrect'));
    document.getElementById('videoSceneStep').textContent = cue.step;
    document.getElementById('videoSceneTitle').textContent = cue.title;
    document.getElementById('videoSceneDetail').textContent = cue.detail;
    document.getElementById('videoCaption').textContent = cue.caption;
    videoMoment.querySelector('p').textContent = 'The video pauses so the learner can select evidence in the scene.';
  }));
  const videoAnswers = [...document.querySelectorAll('[data-video-answer]')];
  videoAnswers.forEach(button => button.addEventListener('click', () => {
    selectOne(videoAnswers, button);
    videoScreen.classList.add('has-answer');
    videoAnswers.forEach(item => item.classList.remove('correct', 'incorrect'));
    button.classList.add(button.dataset.videoAnswer === 'probe' ? 'correct' : 'incorrect');
    videoMoment.querySelector('p').textContent = button.dataset.videoAnswer === 'probe'
      ? 'Correct. Time lost in handoffs is the customer impact visible in this moment.'
      : 'Try again. A feature request does not explain the time the customer loses.';
  }));

  let softwareIndex = 0;
  const softwareControls = [...document.querySelectorAll('[data-software-control]')];
  const softwareTask = document.getElementById('softwareStep');
  const softwareTitle = document.getElementById('softwareTitle');
  const softwareTarget = document.getElementById('softwareTarget');
  const softwareExpected = ['catalog', 'configure', 'submit'];
  const softwareSubmit = document.querySelector('[data-software-control="submit"]');
  const softwareWindow = document.querySelector('.software-window');
  softwareControls.forEach(button => button.addEventListener('click', () => {
    if (softwareIndex >= softwareExpected.length) return;
    if (button.dataset.softwareControl !== softwareExpected[softwareIndex]) {
      softwareTask.textContent = `Not yet. ${['Open Catalog first.', 'Configure the package next.', 'Submit the reviewed order.'][softwareIndex]}`;
      return;
    }
    softwareIndex += 1;
    softwareWindow.dataset.step = String(softwareIndex);
    softwareControls.forEach(item => item.classList.toggle('active', item === button));
    if (softwareIndex === 1) {
      softwareTitle.textContent = 'Choose a product';
      softwareTarget.hidden = false;
      softwareTask.textContent = 'Step 2 of 3: configure the package.';
    } else if (softwareIndex === 2) {
      softwareTitle.textContent = 'Review the configured order';
      softwareTarget.hidden = true;
      softwareSubmit.hidden = false;
      softwareTask.textContent = 'Step 3 of 3: submit the order.';
    } else {
      softwareTitle.textContent = 'Order submitted ✓';
      softwareSubmit.hidden = true;
      softwareTask.textContent = 'Complete: Northstar Supply order #1048 was submitted.';
    }
  }));
  document.getElementById('softwareReset').addEventListener('click', () => {
    softwareIndex = 0;
    softwareWindow.dataset.step = '0';
    softwareControls.forEach(item => item.classList.remove('active'));
    softwareTitle.textContent = 'Create customer order';
    softwareTarget.hidden = true;
    softwareSubmit.hidden = true;
    softwareTask.textContent = 'Step 1 of 3: open Catalog.';
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

  const safetyLabels = { box: 'Loose packaging', spill: 'Floor spill', helmet: 'Missing hard hat' };
  const safetyActions = { box: 'recycled the packaging', spill: 'sent the spill to cleanup', helmet: 'returned the hard hat to the PPE rack' };
  const clearedHazards = new Set();
  let selectedHazard = null;
  const gameVisual = document.querySelector('.game-visual');
  const hazardButtons = [...document.querySelectorAll('[data-hazard]')];
  const zoneButtons = [...document.querySelectorAll('[data-zone]')];
  const gameFeedback = document.getElementById('gameFeedback');
  const renderSafety = () => {
    const score = clearedHazards.size;
    gameVisual.dataset.score = String(score);
    document.getElementById('gameStars').textContent = Array.from({ length: 3 }, (_, index) => index < score ? '★' : '☆').join(' ');
    document.getElementById('gameCount').textContent = score === 3 ? 'All hazards cleared' : `${3 - score} hazard${3 - score === 1 ? '' : 's'} left`;
    hazardButtons.forEach(button => {
      button.hidden = clearedHazards.has(button.dataset.hazard);
      button.classList.toggle('selected', selectedHazard === button.dataset.hazard);
      button.setAttribute('aria-pressed', String(selectedHazard === button.dataset.hazard));
    });
  };
  const placeHazard = (hazard, zone) => {
    if (!hazard || clearedHazards.has(hazard)) return;
    if (hazard !== zone) {
      gameFeedback.textContent = `${safetyLabels[hazard]} needs a different station. Try another location.`;
      return;
    }
    clearedHazards.add(hazard);
    selectedHazard = null;
    gameFeedback.textContent = clearedHazards.size === 3
      ? 'All three hazards cleared. Three stars earned!'
      : `Great work: you ${safetyActions[hazard]}. Keep looking for hazards.`;
    renderSafety();
  };
  hazardButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedHazard = button.dataset.hazard;
      gameFeedback.textContent = `${safetyLabels[selectedHazard]} selected. Choose its destination.`;
      renderSafety();
    });
    button.addEventListener('dragstart', event => {
      selectedHazard = button.dataset.hazard;
      event.dataTransfer.setData('text/plain', selectedHazard);
      event.dataTransfer.effectAllowed = 'move';
      renderSafety();
    });
  });
  zoneButtons.forEach(button => {
    button.addEventListener('click', () => placeHazard(selectedHazard, button.dataset.zone));
    button.addEventListener('dragover', event => {
      event.preventDefault();
      button.classList.add('drag-over');
    });
    button.addEventListener('dragleave', () => button.classList.remove('drag-over'));
    button.addEventListener('drop', event => {
      event.preventDefault();
      button.classList.remove('drag-over');
      placeHazard(event.dataTransfer.getData('text/plain'), button.dataset.zone);
    });
  });
  document.getElementById('gameReset').addEventListener('click', () => {
    clearedHazards.clear();
    selectedHazard = null;
    gameFeedback.textContent = 'Drag a hazard to the right station, or select it and then select a station.';
    renderSafety();
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
