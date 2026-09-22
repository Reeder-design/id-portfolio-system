(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const select = (buttons, active) => {
    buttons.forEach((button) => {
      const selected = button === active;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };
  const restart = (element, className) => {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  };

  const roleplay = document.querySelector('[data-ai-v2-roleplay]');
  if (roleplay) {
    const outcomes = {
      probe: {
        learner: '“What does that delay change for your customers?”',
        reply: '“A handoff can take two approvals. Customers wait for an answer.”',
        signal: 'New detail surfaced',
        feedback: 'The question revealed the customer consequence. Explore frequency before recommending a fix.'
      },
      pitch: {
        learner: '“Our product can solve that for you.”',
        reply: '“Maybe. But you have not asked where the delay actually happens.”',
        signal: 'Discovery stalls',
        feedback: 'The offer arrived before the learner understood the handoff or its impact.'
      }
    };
    const buttons = [...roleplay.querySelectorAll('[data-ai-v2-roleplay-choice]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      const value = button.dataset.aiV2RoleplayChoice;
      const outcome = outcomes[value];
      select(buttons, button);
      roleplay.dataset.choice = value;
      roleplay.querySelector('[data-ai-v2-roleplay-learner]').textContent = outcome.learner;
      roleplay.querySelector('[data-ai-v2-roleplay-reply]').textContent = outcome.reply;
      roleplay.querySelector('[data-ai-v2-roleplay-signal]').textContent = outcome.signal;
      roleplay.querySelector('[data-ai-v2-roleplay-feedback]').textContent = outcome.feedback;
      if (!reducedMotion) restart(roleplay, 'is-staging');
    }));
    if (!reducedMotion) requestAnimationFrame(() => roleplay.classList.add('is-staging'));
  }

  const adaptive = document.querySelector('[data-ai-v2-adaptive]');
  if (adaptive) {
    const outcomes = {
      support: {
        signal: 'Missed the handoff clue',
        next: 'Worked handoff example',
        icon: '../../../../assets/icons/pixel/ai-integrations/adaptive-learning/adaptive-difficulty.webp'
      },
      advance: {
        signal: 'Found the approval delay',
        next: 'Complex customer case',
        icon: '../../../../assets/icons/pixel/ai-integrations/adaptive-learning/adaptive-content-paths.webp'
      }
    };
    const buttons = [...adaptive.querySelectorAll('[data-ai-v2-adaptive-answer]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      const route = button.dataset.aiV2AdaptiveAnswer;
      const outcome = outcomes[route];
      select(buttons, button);
      adaptive.dataset.route = route;
      adaptive.querySelector('[data-ai-v2-adaptive-signal]').textContent = outcome.signal;
      adaptive.querySelector('[data-ai-v2-adaptive-next]').textContent = outcome.next;
      adaptive.querySelector('[data-ai-v2-adaptive-icon]').src = outcome.icon;
    }));
  }

  const tutor = document.querySelector('[data-ai-v2-tutor]');
  if (tutor) {
    const responses = {
      guide: {
        source: '“A handoff is where responsibility moves from one team to another.”',
        sourceLabel: 'Match found · section 2.1',
        status: 'Answer from lesson',
        answer: 'A handoff is the point where another team takes responsibility. See the site transfer example below.',
        next: 'Next: site transfer example in this lesson'
      },
      outside: {
        source: 'The approved lesson does not include current contract terms.',
        sourceLabel: 'No approved match',
        status: 'Route to a current source',
        answer: 'I cannot recommend contract terms from this lesson. Check the current product guide or ask the product team.',
        next: 'Next: current product guide or product team'
      }
    };
    const buttons = [...tutor.querySelectorAll('[data-ai-v2-tutor-question]')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      const kind = button.dataset.aiV2TutorQuestion;
      const response = responses[kind];
      select(buttons, button);
      tutor.dataset.source = kind;
      tutor.querySelector('[data-ai-v2-tutor-source]').textContent = response.source;
      tutor.querySelector('[data-ai-v2-tutor-source-label]').textContent = response.sourceLabel;
      tutor.querySelector('[data-ai-v2-tutor-status]').textContent = response.status;
      tutor.querySelector('[data-ai-v2-tutor-answer]').textContent = response.answer;
      tutor.querySelector('[data-ai-v2-tutor-next]').textContent = response.next;
      if (!reducedMotion) restart(tutor, 'is-retrieving');
    }));
    if (!reducedMotion) requestAnimationFrame(() => tutor.classList.add('is-retrieving'));
  }

  const assessment = document.querySelector('[data-ai-v2-assessment]');
  if (assessment) {
    const submit = assessment.querySelector('[data-ai-v2-assessment-submit]');
    const answer = assessment.querySelector('[data-ai-v2-assessment-response]');
    const feedback = assessment.querySelector('[data-ai-v2-assessment-feedback]');
    const impact = assessment.querySelector('[data-ai-v2-criterion="impact"]');
    const impactMark = impact.querySelector('b');
    let timer = 0;
    let criterionTimer = 0;
    const review = (version) => {
      window.clearTimeout(timer);
      window.clearTimeout(criterionTimer);
      const revised = version === 'revised';
      assessment.dataset.answer = version;
      answer.textContent = revised
        ? '“Two approvals delay each site transfer, so customers wait longer for a resolution.”'
        : '“Two approvals delay each site transfer.”';
      submit.textContent = revised ? 'Submit first answer' : 'Submit stronger revision';
      feedback.textContent = reducedMotion
        ? (revised ? 'You used the case evidence and explained the customer consequence.' : 'You found the delay. Add what that delay means for the customer.')
        : 'Checking the response against both criteria…';
      impact.classList.toggle('is-met', revised && reducedMotion);
      impactMark.textContent = revised && reducedMotion ? '✓' : '○';
      if (!reducedMotion) restart(assessment, 'is-reviewing');
      if (!reducedMotion) {
        criterionTimer = window.setTimeout(() => {
          impact.classList.toggle('is-met', revised);
          impactMark.textContent = revised ? '✓' : '○';
        }, 850);
        timer = window.setTimeout(() => {
          feedback.textContent = revised
            ? 'You used the case evidence and explained the customer consequence.'
            : 'You found the delay. Add what that delay means for the customer.';
        }, 1550);
      }
    };
    submit.addEventListener('click', () => review(assessment.dataset.answer === 'first' ? 'revised' : 'first'));
    review('first');
  }

  const avatar = document.querySelector('[data-ai-v2-avatar]');
  if (avatar) {
    const roles = {
      guide: {
        brief: 'Warm course guide',
        name: 'Course guide ready',
        image: '../../../../assets/icons/pixel/lms-admin/extended-enterprise/customer-support-person.png',
        alt: 'Custom pixel portrait of the generated course guide.'
      },
      customer: {
        brief: 'Operations customer',
        name: 'Customer character ready',
        image: '../../../../assets/icons/pixel/lms-admin/extended-enterprise/sales-enablement-person.png',
        alt: 'Custom pixel portrait of the generated customer character.'
      },
      coach: {
        brief: 'Practice coach',
        name: 'Practice coach ready',
        image: '../../../../assets/icons/pixel/lms-admin/extended-enterprise/partner-support-person.png',
        alt: 'Custom pixel portrait of the generated practice coach.'
      }
    };
    const buttons = [...avatar.querySelectorAll('[data-ai-v2-avatar-role]')];
    const status = avatar.querySelector('[data-ai-v2-avatar-status]');
    const name = avatar.querySelector('[data-ai-v2-avatar-name]');
    const portrait = avatar.querySelector('[data-ai-v2-avatar-portrait]');
    let timer = 0;
    const generate = () => {
      window.clearTimeout(timer);
      const role = avatar.dataset.role;
      avatar.classList.remove('is-awaiting');
      status.textContent = reducedMotion ? 'Ready for learning' : 'Creating character';
      name.textContent = reducedMotion ? roles[role].name : 'Rendering avatar…';
      portrait.src = roles[role].image;
      portrait.alt = roles[role].alt;
      if (!reducedMotion) {
        restart(avatar, 'is-generating');
        timer = window.setTimeout(() => {
          status.textContent = 'Ready for learning';
          name.textContent = roles[role].name;
        }, 2100);
      } else {
        avatar.classList.add('is-generating');
      }
    };
    buttons.forEach((button) => button.addEventListener('click', () => {
      select(buttons, button);
      avatar.dataset.role = button.dataset.aiV2AvatarRole;
      avatar.querySelector('[data-ai-v2-avatar-brief]').textContent = roles[avatar.dataset.role].brief;
      portrait.src = roles[avatar.dataset.role].image;
      portrait.alt = roles[avatar.dataset.role].alt;
      avatar.classList.remove('is-generating');
      avatar.classList.add('is-awaiting');
      status.textContent = 'Role selected';
      name.textContent = 'Ready to generate';
    }));
    avatar.querySelector('[data-ai-v2-avatar-generate]').addEventListener('click', generate);
    generate();
  }
})();
