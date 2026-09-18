(() => {
  const iconPath = '../../../../assets/icons/portfolio-icons.svg';

  const stageData = {
    introduce: {
      label: '01 · Recognize the promise',
      title: 'What is it and why should a seller care?',
      text: 'At launch, sellers need an accurate, repeatable way to describe the offer without diving into implementation detail.',
      image: '../../../../assets/project-images/product-launch/product-launch-introduction.webp',
      alt: 'Sanitized replacement TaskMate AI product-launch introduction screen.',
      facts: [
        ['icon-feedback', 'Seller task', 'Explain the offer in plain language.'],
        ['icon-elearning', 'Enablement priority', 'Lead with business value.'],
        ['icon-learning-design', 'Design move', 'Keep orientation short and skimmable.']
      ]
    },
    explore: {
      label: '02 · Connect features to value',
      title: 'Move from capability lists to customer relevance.',
      text: 'The feature view keeps the scope intentionally small so sellers can connect a capability to an outcome they can discuss during discovery.',
      image: '../../../../assets/project-images/product-launch/product-launch-key-features.webp',
      alt: 'Sanitized replacement TaskMate AI feature-exploration screen.',
      facts: [
        ['icon-ai-evaluation', 'Seller task', 'Match a capability to a customer need.'],
        ['icon-feedback', 'Enablement priority', 'Talk outcomes, not feature dumps.'],
        ['icon-interaction', 'Design move', 'Use progressive disclosure for detail.']
      ]
    },
    apply: {
      label: '03 · Choose the next action',
      title: 'Practice product fit before the live conversation.',
      text: 'The learner distinguishes an appropriate use case from work that belongs in another tool, then receives feedback on the reasoning.',
      image: '../../../../assets/project-images/product-launch/product-launch-use-case-practice.webp',
      alt: 'Sanitized replacement TaskMate AI applied use-case practice screen.',
      facts: [
        ['icon-interaction', 'Seller task', 'Recognize a credible use case.'],
        ['icon-assessment', 'Enablement priority', 'Make a decision, not recall a fact.'],
        ['icon-feedback', 'Design move', 'Explain why each choice does or does not fit.']
      ]
    }
  };

  const stageKeys = ['introduce', 'explore', 'apply'];
  const tabs = [...document.querySelectorAll('[data-launch-stage]')];
  const image = document.getElementById('launchDemoImage');
  const label = document.getElementById('launchDemoLabel');
  const title = document.getElementById('launchDemoTitle');
  const text = document.getElementById('launchDemoText');
  const points = document.getElementById('launchDemoPoints');
  const screen = document.getElementById('launchScreenScroll');
  const count = document.getElementById('launchStageCount');
  const progress = document.getElementById('launchProgressFill');
  const prev = document.getElementById('launchPrev');
  const next = document.getElementById('launchNext');
  const dots = [...document.querySelectorAll('.launch-sim-dots span')];
  let activeIndex = 0;

  const renderFacts = (facts) => {
    if (!points) return;
    points.innerHTML = facts.map((fact) =>
      '<article><svg class="portfolio-icon" aria-hidden="true"><use href="' + iconPath + '#' + fact[0] + '"></use></svg><div><strong>' + fact[1] + '</strong><span>' + fact[2] + '</span></div></article>'
    ).join('');
  };

  const renderStage = (key) => {
    const item = stageData[key];
    const index = stageKeys.indexOf(key);
    if (!item || index < 0 || !image || !label || !title || !text) return;

    activeIndex = index;
    if (screen) screen.classList.add('is-switching');

    window.setTimeout(() => {
      image.src = item.image;
      image.alt = item.alt;
      label.textContent = item.label;
      title.textContent = item.title;
      text.textContent = item.text;
      renderFacts(item.facts);
      if (screen) {
        screen.scrollTop = 0;
        screen.classList.remove('is-switching');
      }
    }, 90);

    tabs.forEach((button) => {
      const active = button.dataset.launchStage === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });

    if (count) count.textContent = (index + 1) + ' / ' + stageKeys.length;
    if (progress) progress.style.width = (((index + 1) / stageKeys.length) * 100) + '%';
    dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
    if (prev) prev.disabled = index === 0;
    if (next) {
      next.disabled = index === stageKeys.length - 1;
      next.textContent = index === stageKeys.length - 1 ? 'Complete' : 'Next →';
    }
  };

  tabs.forEach((button, index) => {
    button.addEventListener('click', () => renderStage(button.dataset.launchStage));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let target = index;
      if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
      else target = (index - 1 + tabs.length) % tabs.length;
      tabs[target].focus();
      renderStage(tabs[target].dataset.launchStage);
    });
  });

  if (prev) prev.addEventListener('click', () => {
    if (activeIndex > 0) renderStage(stageKeys[activeIndex - 1]);
  });
  if (next) next.addEventListener('click', () => {
    if (activeIndex < stageKeys.length - 1) renderStage(stageKeys[activeIndex + 1]);
  });

  renderStage('introduce');

  const practiceOptions = [...document.querySelectorAll('[data-launch-answer]')];
  const feedback = document.getElementById('launchPracticeFeedback');

  practiceOptions.forEach((button) => {
    button.addEventListener('click', () => {
      practiceOptions.forEach((item) => item.classList.toggle('selected', item === button));
      const correct = button.dataset.launchAnswer === 'correct';
      if (!feedback) return;
      feedback.classList.add('show');
      feedback.innerHTML = correct
        ? '<strong>Strong choice.</strong> Drafting a follow-up from meeting notes is a clear fit for a general productivity assistant: the task is bounded, text-based, and benefits from speed without requiring a specialized analytics or scheduling system.'
        : '<strong>Coaching:</strong> this task is better handled by a purpose-built analytics or scheduling tool. Good launch enablement also teaches the boundary of the offer so sellers can recognize fit without over-positioning it.';
    });
  });

  const outcomeData = {
    seller: {
      icon: 'icon-feedback',
      label: 'Seller-ready',
      title: 'Prepare for the conversation, not a technical exam.',
      text: 'The learner could review what the offer solves, recognize fit signals, and rehearse a customer-facing next step without needing implementation-level depth.',
      proof: 'Rise overview + scenario-based Storyline practice'
    },
    maintain: {
      icon: 'icon-workflow',
      label: 'Maintainable',
      title: 'Keep fast-changing launch guidance modular.',
      text: 'Orientation and practice were separate deliverables, so changes to approved messaging, resources, or scenario details did not require rebuilding the whole learning experience.',
      proof: 'Separate update paths for overview and practice'
    },
    review: {
      icon: 'icon-feedback',
      label: 'Reviewable',
      title: 'Separate content feedback from change tracking.',
      text: 'Review 360 supported comments in context while Asana carried ownership and status, giving the review cycle a clearer path from observation to revision.',
      proof: 'SME + QA review with tracked follow-through'
    }
  };

  const outcomeTabs = [...document.querySelectorAll('[data-launch-outcome]')];
  const outcomeIcon = document.getElementById('launchOutcomeIcon');
  const outcomeLabel = document.getElementById('launchOutcomeLabel');
  const outcomeTitle = document.getElementById('launchOutcomeTitle');
  const outcomeText = document.getElementById('launchOutcomeText');
  const outcomeProof = document.getElementById('launchOutcomeProof');

  const renderOutcome = (key) => {
    const item = outcomeData[key];
    if (!item || !outcomeLabel || !outcomeTitle || !outcomeText || !outcomeProof) return;
    outcomeLabel.textContent = item.label;
    outcomeTitle.textContent = item.title;
    outcomeText.textContent = item.text;
    outcomeProof.textContent = item.proof;
    if (outcomeIcon) outcomeIcon.setAttribute('href', iconPath + '#' + item.icon);
    outcomeTabs.forEach((button) => {
      const active = button.dataset.launchOutcome === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  };

  outcomeTabs.forEach((button, index) => {
    button.addEventListener('click', () => renderOutcome(button.dataset.launchOutcome));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let target = index;
      if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = outcomeTabs.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % outcomeTabs.length;
      else target = (index - 1 + outcomeTabs.length) % outcomeTabs.length;
      outcomeTabs[target].focus();
      renderOutcome(outcomeTabs[target].dataset.launchOutcome);
    });
  });
})();
