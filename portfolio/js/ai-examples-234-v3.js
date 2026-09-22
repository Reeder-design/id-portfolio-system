(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const playWhileVisible = (element, lastStep, duration, render, nextCycle) => {
    let step = 0;
    let interval = null;
    let visible = !('IntersectionObserver' in window);

    const stop = () => {
      if (!interval) return;
      window.clearInterval(interval);
      interval = null;
    };
    const start = () => {
      stop();
      if (reduceMotion.matches) {
        step = lastStep;
        render(step);
        return;
      }
      if (!visible) return;
      interval = window.setInterval(() => {
        if (step === lastStep) {
          step = 0;
          if (nextCycle) nextCycle();
        } else {
          step += 1;
        }
        render(step);
      }, duration);
    };
    const jumpTo = (target) => {
      step = target;
      render(step);
      start();
    };

    render(step);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else stop();
      }, { threshold: 0.12 });
      observer.observe(element);
    } else {
      start();
    }
    reduceMotion.addEventListener?.('change', start);
    return { jumpTo };
  };

  const path = document.querySelector('[data-ai-v3-path]');
  if (path) {
    const choiceButtons = [...path.querySelectorAll('[data-ai-v3-choice]')];
    const routes = [...path.querySelectorAll('[data-ai-v3-route]')];
    const signal = path.querySelector('[data-ai-v3-path-signal]');
    const strength = path.querySelector('[data-ai-v3-path-strength]');
    let choice = 'advance';
    const render = (step) => {
      path.dataset.step = String(step);
      path.dataset.choice = choice;
      choiceButtons.forEach((button) => {
        const picked = step >= 1 && button.dataset.aiV3Choice === choice;
        button.classList.toggle('is-picked', picked);
        button.setAttribute('aria-pressed', String(picked));
      });
      signal.textContent = step === 0 ? 'Waiting for the learner choice'
        : step === 1 ? 'Comparing answer with the case'
        : choice === 'advance' ? 'Recognized the approval bottleneck' : 'Missed the approval bottleneck';
      strength.textContent = step < 2 ? 'Waiting' : choice === 'advance' ? 'Strong signal' : 'Needs support';
      routes.forEach((route) => {
        const selected = step === 3 && route.dataset.aiV3Route === choice;
        route.classList.toggle('is-open', selected);
        route.classList.toggle('is-closed', step === 3 && !selected);
      });
      const supportReason = path.querySelector('[data-ai-v3-reason="support"]');
      const advanceReason = path.querySelector('[data-ai-v3-reason="advance"]');
      supportReason.textContent = step !== 3 ? 'Opens when the clue is missed'
        : choice === 'support' ? 'Opened: revisit the missed clue' : 'Not opened: clue was recognized';
      advanceReason.textContent = step !== 3 ? 'Opens when the clue is recognized'
        : choice === 'advance' ? 'Opened: ready for a harder case' : 'Not opened: practice comes first';
    };
    const loop = playWhileVisible(path, 3, 1550, render, () => {
      choice = choice === 'advance' ? 'support' : 'advance';
    });
    choiceButtons.forEach((button) => button.addEventListener('click', () => {
      choice = button.dataset.aiV3Choice;
      loop.jumpTo(1);
    }));
  }

  const tutor = document.querySelector('[data-ai-v3-tutor]');
  if (tutor) {
    const render = (step) => { tutor.dataset.step = String(step); };
    const loop = playWhileVisible(tutor, 3, 2100, render);
    tutor.querySelector('[data-ai-v3-tutor-ask]')?.addEventListener('click', () => loop.jumpTo(2));
  }

  const assessment = document.querySelector('[data-ai-v3-assessment]');
  if (assessment) {
    const status = assessment.querySelector('[data-ai-v3-assessment-status]');
    const render = (step) => {
      assessment.dataset.step = String(step);
      status.textContent = [
        'Ready to submit',
        'Submitting response…',
        'Checking two criteria…',
        'Feedback ready'
      ][step];
    };
    const loop = playWhileVisible(assessment, 3, 1650, render);
    assessment.querySelector('[data-ai-v3-assessment-submit]')?.addEventListener('click', () => loop.jumpTo(1));
  }
})();
