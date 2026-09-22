(() => {
  const roleplay = document.querySelector('[data-ai-v2-roleplay]');
  if (!roleplay) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  const timings = [1550, 1700, 1900, 3800];
  let step = 0;
  let choice = 'probe';
  let timer = null;
  let inView = !('IntersectionObserver' in window);

  const render = () => {
    const outcome = outcomes[choice];
    roleplay.dataset.step = String(step);
    roleplay.dataset.choice = choice;
    roleplay.querySelector('[data-ai-v2-roleplay-learner]').textContent = outcome.learner;
    roleplay.querySelector('[data-ai-v2-roleplay-reply]').textContent = outcome.reply;
    roleplay.querySelector('[data-ai-v2-roleplay-signal]').textContent = outcome.signal;
    roleplay.querySelector('[data-ai-v2-roleplay-feedback]').textContent = outcome.feedback;
  };

  const advance = () => {
    if (!inView || document.hidden || reducedMotion.matches) return;
    render();
    timer = window.setTimeout(() => {
      step += 1;
      if (step > 3) {
        step = 0;
        choice = choice === 'probe' ? 'pitch' : 'probe';
      }
      advance();
    }, timings[step]);
  };

  const sync = () => {
    window.clearTimeout(timer);
    timer = null;
    if (reducedMotion.matches) {
      step = 3;
      choice = 'probe';
      render();
      return;
    }
    if (inView && !document.hidden) advance();
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.15 }).observe(roleplay);
  } else {
    sync();
  }
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener?.('change', sync);
})();
