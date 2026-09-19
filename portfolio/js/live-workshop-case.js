(() => {
  const controlData = {
    arc: {
      label: 'Session Arc',
      aria: 'Session Arc options',
      motion: ['Prepare','Frame','Engage','Debrief'],
      order: ['prepare','frame','explain','check','apply','reflect'],
      items: {
        prepare: {
          label: 'Prepare',
          title: 'Prepare for the assigned module.',
          summary: 'Before delivery, I reviewed the facilitator and participant materials, identified the objective, marked transitions, and anticipated where the seller or partner audience might need a clearer example or more discussion.',
          action: 'Reviewed the objective, materials, transitions, and likely friction points before delivery.',
          signal: 'Places where the content might create uncertainty, competing interpretations, or weak application.',
          design: 'Preparation helped me flag areas where examples, prompts, or facilitator notes might need stronger support.'
        },
        frame: {
          label: 'Frame',
          title: 'Frame the objective before adding detail.',
          summary: 'I opened each section by making the purpose clear so the group understood what they should be able to recognize or do before we moved into the content.',
          action: 'Connected the topic to the seller task and made the expected outcome explicit.',
          signal: 'Whether learners could describe why the section mattered before we added more detail.',
          design: 'Weak framing showed where future intros or facilitator notes needed a clearer job-to-be-done.'
        },
        explain: {
          label: 'Explain',
          title: 'Explain only enough to support the next decision.',
          summary: 'I kept explanations concise, connected the framework to seller language, and avoided using live time for background material the audience could absorb on its own.',
          action: 'Used concise explanations, seller language, and practical distinctions instead of narrating the deck.',
          signal: 'Questions or examples that showed whether the explanation was becoming usable.',
          design: 'Recurring explanation needs pointed to content that should be simplified or supported with better examples.'
        },
        check: {
          label: 'Ask + Poll',
          title: 'Use questions and polls as diagnostic signals.',
          summary: 'I asked before telling, compared interpretations, and used polling to decide whether the audience was ready to move on or needed another example.',
          action: 'Asked targeted questions and used quick polls at decision points.',
          signal: 'Split answers, low confidence, hesitation, or language that revealed a misconception.',
          design: 'Poll patterns helped identify where future checks, distractors, or feedback needed stronger distinctions.'
        },
        apply: {
          label: 'Apply',
          title: 'Bring MEDDPICC into realistic seller situations.',
          summary: 'I invited relevant seller and partner examples and used them to distinguish stronger evidence, weaker evidence, and the reasoning behind the difference.',
          action: 'Used public-safe seller examples and guided the group through evidence quality and judgment.',
          signal: 'Whether learners could transfer the framework into realistic customer or pursuit situations.',
          design: 'Strong examples became useful patterns for future scenarios and facilitator guidance.'
        },
        reflect: {
          label: 'Debrief',
          title: 'Debrief and capture what the audience taught me.',
          summary: 'I closed the loop on the objective, captured recurring questions or friction, and carried those signals into future content, scenarios, checks, and facilitator guidance.',
          action: 'Summarized the key distinction, revisited the objective, and captured recurring friction.',
          signal: 'What learners still questioned, where time was lost, and which examples created clarity.',
          design: 'The debrief turned live-session friction into concrete updates for future learning and facilitation.'
        }
      }
    },
    moves: {
      label: 'Facilitation Moves',
      aria: 'Facilitation Move options',
      motion: ['Ask','Poll','Examples','Reframe'],
      order: ['ask','poll','examples','reframe'],
      items: {
        ask: {
          label: 'Ask before telling',
          title: 'Ask before telling.',
          summary: 'I used questions to hear the group’s current interpretation before adding more explanation.',
          action: 'Used targeted prompts before giving the answer or definition.',
          signal: 'Uncertainty, competing interpretations, or language that revealed a misconception.',
          design: 'The questions showed which explanations or examples needed more clarity in future materials.'
        },
        poll: {
          label: 'Poll with purpose',
          title: 'Poll with a purpose.',
          summary: 'I used polls when the result could change what I did next.',
          action: 'Used quick confidence or interpretation checks at decision points.',
          signal: 'Low confidence or a split response that meant the concept was not stable enough to advance.',
          design: 'Poll distributions helped identify where future formative checks and feedback needed stronger separation.'
        },
        examples: {
          label: 'Use seller examples',
          title: 'Use seller examples.',
          summary: 'I used relevant examples from experienced learners to make the framework concrete across internal and partner audiences.',
          action: 'Invited useful customer or pursuit examples without exposing private account details.',
          signal: 'Examples that showed where the group already had usable experience to build from.',
          design: 'Strong peer examples became reusable patterns for scenarios, facilitator notes, and self-paced learning.'
        },
        reframe: {
          label: 'Reframe when needed',
          title: 'Reframe when the first explanation does not land.',
          summary: 'I kept the learning objective fixed, but changed the explanation when the audience needed a different route.',
          action: 'Changed the example, wording, sequence, or amount of detail while preserving the learning goal.',
          signal: 'Repeated questions, silence, confusion, or low confidence after the first explanation.',
          design: 'Repeated reframing needs identified places where the source explanation itself should be improved.'
        }
      }
    }
  };

  const signalData = {
    confidence: {
      headline: 'Mixed confidence',
      suggests: 'The concept or distinction was not stable yet.',
      response: 'I slowed down, reframed the concept, and tested it again with a concrete seller example.',
      design: 'A low-confidence response showed where future explanations, examples, or formative checks needed to make the distinction clearer.'
    },
    repeated: {
      headline: 'Question repeats',
      suggests: 'The current explanation was not resolving the learner friction.',
      response: 'I changed the explanation, analogy, or seller situation instead of repeating the same wording.',
      design: 'Repeated questions identified content that needed a different explanation, stronger example, or clearer facilitator guidance.'
    },
    examples: {
      headline: 'Strong examples',
      suggests: 'The group already had relevant experience I could build from.',
      response: 'I used peer examples and compressed lower-value background so more time stayed available for application.',
      design: 'Useful learner examples became candidates for future scenarios, explanations, or facilitator prompts.'
    },
    time: {
      headline: 'Time pressure',
      suggests: 'The agenda now required a deliberate tradeoff.',
      response: 'I protected application and debrief time and shortened lower-value narration instead of rushing the close.',
      design: 'Timing pressure showed which sections needed tighter narration so future sessions could protect practice and debrief.'
    }
  };

  const byId = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = byId(id);
    if (el) el.textContent = value;
  };

  const restartAnimation = (el) => {
    if (!el) return;
    el.classList.remove('is-switching');
    void el.offsetWidth;
    el.classList.add('is-switching');
  };

  const setupKeyboardTabs = (buttons, activate) => {
    buttons.forEach((button, index) => {
      button.tabIndex = button.getAttribute('aria-selected') === 'true' ? 0 : -1;
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else next = (index - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
        activate(buttons[next]);
      });
    });
  };

  let activeView = 'arc';
  let activeKey = 'prepare';
  const viewButtons = [...document.querySelectorAll('[data-control-view]')];
  const controlOptions = byId('controlOptions');
  const controlMotion = byId('controlMotion');

  const renderControlState = (key) => {
    const view = controlData[activeView];
    const item = view.items[key];
    if (!item) return;
    activeKey = key;

    [...controlOptions.querySelectorAll('.control-option')].forEach((button) => {
      const selected = button.dataset.controlKey === key;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });

    setText('controlLabel', item.label);
    setText('controlTitle', item.title);
    setText('controlSummary', item.summary);
    setText('controlAction', item.action);
    setText('controlSignal', item.signal);
    setText('controlDesign', item.design);

    if (controlMotion) {
      controlMotion.dataset.view = activeView;
      [...controlMotion.querySelectorAll('.control-motion-node')].forEach((node, index) => {
        node.textContent = view.motion[index] || '';
        node.classList.toggle('active', index === Math.min(view.motion.length - 1, Math.floor(view.order.indexOf(key) * view.motion.length / view.order.length)));
      });
      restartAnimation(controlMotion);
    }
  };

  const wireControlOptions = () => {
    const buttons = [...controlOptions.querySelectorAll('.control-option')];
    const activate = (button) => renderControlState(button.dataset.controlKey);
    buttons.forEach((button) => button.addEventListener('click', () => activate(button)));
    setupKeyboardTabs(buttons, activate);
  };

  const renderControlView = (viewKey) => {
    activeView = viewKey;
    const view = controlData[viewKey];
    if (!view) return;

    viewButtons.forEach((button) => {
      const selected = button.dataset.controlView === viewKey;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });

    controlOptions.setAttribute('aria-label', view.aria);
    controlOptions.replaceChildren(...view.order.map((key, index) => {
      const button = document.createElement('button');
      button.className = 'control-option' + (index === 0 ? ' active' : '');
      button.type = 'button';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      button.tabIndex = index === 0 ? 0 : -1;
      button.dataset.controlKey = key;
      button.textContent = view.items[key].label;
      return button;
    }));
    wireControlOptions();
    renderControlState(view.order[0]);
  };

  const activateView = (button) => renderControlView(button.dataset.controlView);
  viewButtons.forEach((button) => button.addEventListener('click', () => activateView(button)));
  setupKeyboardTabs(viewButtons, activateView);
  wireControlOptions();

  const signalButtons = [...document.querySelectorAll('[data-signal]')];
  const activateSignal = (button) => {
    const data = signalData[button.dataset.signal];
    if (!data) return;

    signalButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    setText('signalHeadline', data.headline);
    setText('signalSuggests', data.suggests);
    setText('signalResponse', data.response);
    setText('signalDesign', data.design);
  };
  signalButtons.forEach((button) => button.addEventListener('click', () => activateSignal(button)));
  setupKeyboardTabs(signalButtons, activateSignal);

  const navLinks = [...document.querySelectorAll('.case-nav a')];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + visible.target.id);
      });
    }, {rootMargin:'-28% 0px -58% 0px', threshold:[0.1,.35,.6]});
    navSections.forEach((section) => observer.observe(section));
  }
})();