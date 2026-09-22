(() => {
  const choose = (buttons, selected) => {
    buttons.forEach((button) => {
      const active = button === selected;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  const animate = (stage) => {
    if (!stage) return;
    stage.classList.remove('is-updating');
    void stage.offsetWidth;
    stage.classList.add('is-updating');
  };

  const hero = document.querySelector('.ai-experience-hero');
  if (hero) {
    const states = {
      new: {
        line: '“Where do you see the handoff slowing us down?”',
        practice: 'Find the customer signal',
        next: 'Guided discovery'
      },
      experienced: {
        line: '“What would that delay cost across three sites?”',
        practice: 'Quantify the impact',
        next: 'Complex customer case'
      }
    };
    const buttons = [...hero.querySelectorAll('[data-ai-hero-role]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      const state = states[button.dataset.aiHeroRole];
      if (!state) return;
      choose(buttons, button);
      hero.querySelector('[data-ai-hero-line]').textContent = state.line;
      hero.querySelector('[data-ai-hero-practice]').textContent = state.practice;
      hero.querySelector('[data-ai-hero-next]').textContent = state.next;
      animate(hero);
    }));
  }

  const roleplay = document.querySelector('.ai-roleplay-ui');
  if (roleplay) {
    const states = {
      probe: {
        reply: '“Our team keeps losing time at handoffs.”',
        signal: 'Customer opens up',
        feedback: '“The delay affects every site transfer.” Ask for frequency before proposing a fix.'
      },
      pitch: {
        reply: '“I am not ready to discuss a product yet.”',
        signal: 'Discovery closes',
        feedback: 'The learner moved to a solution before understanding the cost of the delay.'
      }
    };
    const buttons = [...roleplay.querySelectorAll('[data-ai-roleplay]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      const state = states[button.dataset.aiRoleplay];
      if (!state) return;
      choose(buttons, button);
      roleplay.querySelector('[data-ai-roleplay-reply]').textContent = state.reply;
      roleplay.querySelector('[data-ai-roleplay-signal]').textContent = state.signal;
      roleplay.querySelector('[data-ai-roleplay-feedback]').textContent = state.feedback;
      roleplay.dataset.outcome = button.dataset.aiRoleplay;
      animate(roleplay);
    }));
  }

  const adaptive = document.querySelector('.ai-adaptive-ui');
  if (adaptive) {
    const buttons = [...adaptive.querySelectorAll('[data-ai-adaptive]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      const route = button.dataset.aiAdaptive;
      choose(buttons, button);
      adaptive.querySelector('[data-ai-adaptive-result]').textContent = route === 'ready' ? 'Ready to advance' : 'Needs practice';
      adaptive.querySelectorAll('[data-ai-adaptive-route]').forEach((card) => card.classList.toggle('active', card.dataset.aiAdaptiveRoute === route));
      animate(adaptive);
    }));
  }

  const tutor = document.querySelector('.ai-tutor-ui');
  if (tutor) {
    const states = {
      jargon: {
        label: 'From the guide',
        answer: 'A handoff is where responsibility moves from one team to another.',
        next: 'Open the handoff example in this lesson →'
      },
      outside: {
        label: 'Outside this lesson',
        answer: 'The guide does not establish a product recommendation for this situation.',
        next: 'Check current product material or ask an SME →'
      }
    };
    const buttons = [...tutor.querySelectorAll('[data-ai-tutor]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      const state = states[button.dataset.aiTutor];
      if (!state) return;
      choose(buttons, button);
      tutor.querySelector('[data-ai-tutor-label]').textContent = state.label;
      tutor.querySelector('[data-ai-tutor-answer]').textContent = state.answer;
      tutor.querySelector('[data-ai-tutor-next]').textContent = state.next;
      tutor.dataset.answer = button.dataset.aiTutor;
      animate(tutor);
    }));
  }

  const assessButton = document.querySelector('[data-ai-assess]');
  if (assessButton) {
    const assessment = assessButton.closest('.ai-assessment-ui');
    assessButton.addEventListener('click', () => {
      const reviewed = assessButton.getAttribute('aria-pressed') !== 'true';
      assessButton.setAttribute('aria-pressed', String(reviewed));
      assessButton.textContent = reviewed ? 'Reset review' : 'Review response';
      assessment.classList.toggle('is-reviewed', reviewed);
      assessment.querySelector('[data-ai-assess-note]').textContent = reviewed
        ? 'The two approvals are concrete evidence. Next, explain what that delay changes for the customer.'
        : 'Compare the response with the two visible criteria.';
      animate(assessment);
    });
  }

  const video = document.querySelector('.ai-video-ui');
  if (video) {
    const captions = {
      en: '“Let’s review the customer signal.”',
      es: '“Revisemos la señal del cliente.”'
    };
    const buttons = [...video.querySelectorAll('[data-ai-language]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      choose(buttons, button);
      video.querySelector('[data-ai-caption]').textContent = captions[button.dataset.aiLanguage];
      animate(video);
    }));
  }

  const curriculum = document.querySelector('.ai-curriculum-lab');
  if (curriculum) {
    const profiles = {
      new: {
        question: 'What would you ask first?',
        action: 'Identify',
        feedback: 'Name the cue that matters.'
      },
      experienced: {
        question: 'What evidence would change your recommendation?',
        action: 'Evaluate',
        feedback: 'Support the judgment with evidence.'
      }
    };
    const contexts = {
      handoff: {
        situation: 'Our work waits when responsibility moves between sites.',
        practice: 'the handoff delay',
        next: 'handoff'
      },
      expansion: {
        situation: 'A new region wants the service, but its needs may differ.',
        practice: 'the expansion tradeoff',
        next: 'expansion'
      }
    };
    const levels = {
      guided: {
        cue: 'Start with one clue.',
        feedback: 'Use the highlighted clue.',
        next: 'Guided'
      },
      stretch: {
        cue: 'Consider customer impact and operational risk.',
        feedback: 'Defend your choice without prompts.',
        next: 'Advanced'
      }
    };
    let profile = 'new';
    let context = 'handoff';
    let level = 'guided';
    const render = (withMotion = true) => {
      const learner = profiles[profile];
      const caseContext = contexts[context];
      const challenge = levels[level];
      curriculum.querySelector('[data-ai-curriculum-cue]').textContent = `“${caseContext.situation} ${learner.question} ${challenge.cue}”`;
      curriculum.querySelector('[data-ai-curriculum-practice]').textContent = `${learner.action} ${caseContext.practice}`;
      curriculum.querySelector('[data-ai-curriculum-feedback]').textContent = `${learner.feedback} ${challenge.feedback}`;
      curriculum.querySelector('[data-ai-curriculum-next]').textContent = `${challenge.next} ${caseContext.next} ${level === 'guided' ? 'example' : 'case'}`;
      const logicInputs = curriculum.querySelectorAll('.ai-curriculum-logic span');
      logicInputs[0].textContent = profile === 'new' ? 'New seller' : 'Experienced seller';
      logicInputs[1].textContent = context === 'handoff' ? 'Handoff delay' : 'Expansion decision';
      logicInputs[2].textContent = level === 'guided' ? 'Guided' : 'Stretch';
      if (withMotion) {
        animate(curriculum.querySelector('[data-ai-curriculum-stage]'));
        animate(curriculum.querySelector('.ai-curriculum-output'));
      }
    };
    const profileButtons = [...curriculum.querySelectorAll('[data-ai-profile]')];
    const contextButtons = [...curriculum.querySelectorAll('[data-ai-context]')];
    const levelButtons = [...curriculum.querySelectorAll('[data-ai-level]')];
    profileButtons.forEach((button) => button.addEventListener('click', () => {
      profile = button.dataset.aiProfile;
      choose(profileButtons, button);
      render();
    }));
    contextButtons.forEach((button) => button.addEventListener('click', () => {
      context = button.dataset.aiContext;
      choose(contextButtons, button);
      render();
    }));
    levelButtons.forEach((button) => button.addEventListener('click', () => {
      level = button.dataset.aiLevel;
      choose(levelButtons, button);
      render();
    }));
    render(false);
  }
})();
