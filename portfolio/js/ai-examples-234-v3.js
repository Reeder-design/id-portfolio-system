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
      if (!visible || document.hidden) return;
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
    document.addEventListener('visibilitychange', start);
    reduceMotion.addEventListener?.('change', start);
  };

  const path = document.querySelector('[data-ai-v3-path]');
  if (path) {
    const choices = [...path.querySelectorAll('[data-ai-v3-choice]')];
    const routes = [...path.querySelectorAll('[data-ai-v3-route]')];
    const signal = path.querySelector('[data-ai-v3-path-signal]');
    const strength = path.querySelector('[data-ai-v3-path-strength]');
    let choice = 'advance';
    const render = (step) => {
      path.dataset.step = String(step);
      path.dataset.choice = choice;
      choices.forEach((option) => {
        const picked = step >= 1 && option.dataset.aiV3Choice === choice;
        option.classList.toggle('is-picked', picked);
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
    playWhileVisible(path, 3, 1550, render, () => {
      choice = choice === 'advance' ? 'support' : 'advance';
    });
  }

  const tutor = document.querySelector('[data-ai-v3-tutor]');
  if (tutor) {
    const render = (step) => { tutor.dataset.step = String(step); };
    playWhileVisible(tutor, 3, 2100, render);
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
    playWhileVisible(assessment, 3, 1650, render);
  }
})();
