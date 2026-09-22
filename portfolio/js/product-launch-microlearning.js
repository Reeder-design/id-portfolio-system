(() => {
  const asset = '../../../../assets/project-images/product-launch/';
  const icon = '../../../../assets/icons/portfolio-icons.svg#';
  const steps = [
    {
      name: 'Orient', eyebrow: '01 · Orient', icon: 'icon-elearning',
      title: 'What does TaskMate AI help a seller do?',
      copy: 'TaskMate AI helps turn meeting notes into a clear first draft of a customer follow-up. The seller reviews and adapts the draft before sending it.',
      image: 'product-launch-introduction.webp', alt: 'Sanitized TaskMate AI introduction screen', caption: 'Sanitized learner screen · product promise',
      action: 'I narrowed approved source material to the customer problem, value, and fit signals a seller needed before the next conversation.',
      decision: 'Lead with a plain-language promise instead of a feature inventory.',
      development: 'Use a scannable Rise overview for orientation, with deeper launch detail outside the module.',
      tool: 'Rise 360 · focused overview'
    },
    {
      name: 'Connect value', eyebrow: '02 · Connect value', icon: 'icon-feedback',
      title: 'Connect the capability to customer value.',
      copy: 'A seller needs more than a list of features. Match the first-draft capability to the outcome a customer would care about.',
      image: 'product-launch-key-features.webp', alt: 'Sanitized TaskMate AI feature and value screen', caption: 'Sanitized learner screen · features to value',
      question: 'A team spends too much time drafting follow-ups after meetings. Which value message fits?',
      choices: [
        { label: 'Start from a reviewed draft sooner, while the seller keeps control of the final message.', correct: true, feedback: 'Strong connection. It names the customer friction, the useful outcome, and the seller’s review responsibility.' },
        { label: 'Replace the team’s specialized analytics platform.', correct: false, feedback: 'That promises a different job. The focused launch message is about drafting follow-up text, not analytics.' },
        { label: 'Automatically run every customer conversation.', correct: false, feedback: 'That overstates the offer. A trustworthy launch module also teaches what the product does not do.' }
      ],
      action: 'I converted product detail into a short, sales-ready value story.',
      decision: 'Connect a capability to the customer problem before asking sellers to recall features.',
      development: 'Use progressive disclosure in the Rise overview so details appear only when they serve the message.',
      tool: 'Rise 360 · value framing'
    },
    {
      name: 'Recognize fit', eyebrow: '03 · Recognize fit', icon: 'icon-assessment',
      title: 'Spot a credible use case.',
      copy: 'Before recommending a product, the seller needs to recognize the task it is suited to support.',
      image: 'product-launch-use-case-practice.webp', alt: 'Sanitized TaskMate AI use-case practice screen', caption: 'Sanitized learner screen · fit practice',
      question: 'Which request is the clearest fit for TaskMate AI?',
      choices: [
        { label: 'Draft a professional follow-up email from meeting notes.', correct: true, feedback: 'Yes. It is a bounded writing task with a clear human review step.' },
        { label: 'Run a complex statistical analysis on a specialized dataset.', correct: false, feedback: 'A specialized analytics workflow is a better fit. The scenario helps sellers learn the boundary as well as the opportunity.' },
        { label: 'Schedule a meeting across several calendars.', correct: false, feedback: 'A calendar tool fits that task better. The useful cue here is a text draft that a person will review.' }
      ],
      action: 'I moved the learner from product orientation into a customer-fit judgment.',
      decision: 'Use a plausible wrong fit so feedback teaches the boundary, not just the correct answer.',
      development: 'Build the choice and coaching in Storyline as a separate practice asset.',
      tool: 'Storyline 360 · scenario practice'
    },
    {
      name: 'Respond', eyebrow: '04 · Respond', icon: 'icon-interaction',
      title: 'Choose the next seller response.',
      copy: 'A customer asks, “Can TaskMate make every decision for my team?” Choose a response that positions the offer accurately and moves the conversation forward.',
      image: 'product-launch-use-case-practice.webp', alt: 'Sanitized TaskMate AI applied practice screen', caption: 'Sanitized learner screen · customer response',
      question: 'What should the seller say next?',
      choices: [
        { label: '“It can draft routine follow-ups from notes. Your team reviews the result; we could test it on one workflow.”', correct: true, feedback: 'Strong response. It names a credible use, keeps human review visible, and proposes a bounded next step.' },
        { label: '“Yes, it can replace your team’s judgment across the whole process.”', correct: false, feedback: 'This overclaims the product. The better response stays within the supported use and keeps people accountable.' },
        { label: '“I cannot answer until you read every technical document.”', correct: false, feedback: 'The seller can still give a clear, accurate first answer, then point to deeper resources for technical questions.' }
      ],
      action: 'I designed the Storyline practice around the live conversation rather than a product fact quiz.',
      decision: 'Ask for a customer-facing next move and explain why the other responses do not fit.',
      development: 'Revise scenario wording and feedback with SME and QA comments before release.',
      tool: 'Storyline 360 · explanatory feedback'
    },
    {
      name: 'Take away', eyebrow: '05 · Take away', icon: 'icon-feedback',
      title: 'Keep the message short and the resources close.',
      copy: 'A useful launch microlearning ends with an action the seller can carry into the next conversation, while details that change stay in maintained resources.',
      image: null,
      action: 'I kept the overview and scenario modular so each could be updated when launch guidance changed.',
      decision: 'Finish with a usable message and a clear handoff instead of expanding the module into a product encyclopedia.',
      development: 'Use Review 360 for in-course feedback and Asana to track ownership, revisions, and completion messaging.',
      tool: 'Review 360 + Asana · QA and maintenance'
    }
  ];

  const el = (id) => document.getElementById(id);
  const fields = {
    progressText: el('launchProgressText'), progressFill: el('launchProgressFill'),
    stageIcon: el('launchStageIcon'), eyebrow: el('launchStageEyebrow'),
    title: el('launchStageTitle'), copy: el('launchStageCopy'),
    figure: el('launchStageFigure'), image: el('launchStageImage'),
    caption: el('launchStageCaption'), choiceArea: el('launchChoiceArea'),
    question: el('launchChoicePrompt'), options: el('launchChoiceOptions'),
    feedback: el('launchFeedback'), finish: el('launchFinish'),
    action: el('launchDesignAction'), decision: el('launchDesignDecision'),
    development: el('launchDevelopmentMove'), tool: el('launchDesignTool'),
    hint: el('launchStepHint'), back: el('launchBack'),
    next: el('launchContinue'), restart: el('launchRestart')
  };
  if (!fields.next) return;
  const progressItems = [...document.querySelectorAll('.launch-step-list li')];
  const learnerPanel = document.querySelector('.launch-learner-panel');
  const designerPanel = document.querySelector('.launch-designer-panel');
  const answers = new Map();
  let current = 0;

  function showFeedback(choice, button) {
    fields.feedback.textContent = choice.feedback;
    fields.feedback.dataset.result = choice.correct ? 'strong' : 'coach';
    fields.feedback.hidden = false;
    [...fields.options.children].forEach((option) => {
      const selected = option === button;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-pressed', String(selected));
    });
    fields.next.disabled = false;
    fields.hint.textContent = choice.correct ? 'Strong choice. Continue when ready.' : 'Read the coaching, then continue or choose again.';
  }

  function render() {
    const step = steps[current];
    [learnerPanel, designerPanel].forEach((panel) => {
      if (!panel) return;
      panel.classList.remove('is-entering');
      void panel.offsetWidth;
      panel.classList.add('is-entering');
    });
    fields.progressText.textContent = 'Step ' + (current + 1) + ' of ' + steps.length + ' · ' + step.name;
    fields.progressFill.style.width = ((current + 1) / steps.length * 100) + '%';
    progressItems.forEach((item, index) => {
      item.classList.toggle('active', index === current);
      item.classList.toggle('complete', index < current);
    });
    fields.stageIcon.setAttribute('href', icon + step.icon);
    fields.eyebrow.textContent = step.eyebrow;
    fields.title.textContent = step.title;
    fields.copy.textContent = step.copy;
    fields.action.textContent = step.action;
    fields.decision.textContent = step.decision;
    fields.development.textContent = step.development;
    fields.tool.textContent = step.tool;
    fields.back.disabled = current === 0;
    fields.next.textContent = current === steps.length - 1 ? 'Restart demo ↺' : current === steps.length - 2 ? 'Finish microlearning →' : 'Continue →';
    fields.figure.hidden = !step.image;
    fields.finish.hidden = current !== steps.length - 1;
    if (step.image) {
      fields.image.src = asset + step.image;
      fields.image.alt = step.alt;
      fields.caption.textContent = step.caption;
    }
    fields.choiceArea.hidden = !step.choices;
    fields.options.replaceChildren();
    fields.feedback.hidden = true;
    fields.feedback.textContent = '';
    if (step.choices) {
      fields.question.textContent = step.question;
      step.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'launch-choice';
        button.setAttribute('aria-pressed', 'false');
        const letter = document.createElement('span');
        letter.textContent = String.fromCharCode(65 + index);
        const label = document.createElement('span');
        label.textContent = choice.label;
        button.append(letter, label);
        button.addEventListener('click', () => {
          answers.set(current, index);
          showFeedback(choice, button);
        });
        fields.options.append(button);
      });
      const answer = answers.get(current);
      if (answer !== undefined) {
        showFeedback(step.choices[answer], fields.options.children[answer]);
      } else {
        fields.next.disabled = true;
        fields.hint.textContent = 'Choose a response to see coaching.';
      }
    } else {
      fields.next.disabled = false;
      fields.hint.textContent = current === steps.length - 1 ? 'You have completed the microlearning. Restart to try another path.' : 'Read the short introduction, then continue.';
    }
  }

  fields.back.addEventListener('click', () => {
    if (current > 0) { current -= 1; render(); }
  });
  fields.next.addEventListener('click', () => {
    if (current === steps.length - 1) {
      answers.clear();
      current = 0;
    } else {
      current += 1;
    }
    render();
  });
  fields.restart.addEventListener('click', () => {
    answers.clear();
    current = 0;
    render();
  });
  render();
})();
