(() => {
  const hero = document.querySelector('.ai-experience-hero');
  if (!hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = [
    {
      role: 'new',
      line: '“Where do you see the handoff slowing us down?”',
      practice: 'Find the customer signal',
      next: 'Guided discovery'
    },
    {
      role: 'experienced',
      line: '“What would that delay cost across three sites?”',
      practice: 'Quantify the impact',
      next: 'Complex customer case'
    }
  ];
  const roles = [...hero.querySelectorAll('[data-ai-hero-role]')];
  let index = 0;
  let timer = null;
  let inView = !('IntersectionObserver' in window);

  const render = () => {
    const state = states[index];
    hero.querySelector('[data-ai-hero-line]').textContent = state.line;
    hero.querySelector('[data-ai-hero-practice]').textContent = state.practice;
    hero.querySelector('[data-ai-hero-next]').textContent = state.next;
    roles.forEach((role) => role.classList.toggle('active', role.dataset.aiHeroRole === state.role));
    hero.classList.remove('is-updating');
    if (!reducedMotion.matches) {
      void hero.offsetWidth;
      hero.classList.add('is-updating');
    }
  };

  const sync = () => {
    window.clearInterval(timer);
    timer = null;
    if (reducedMotion.matches) index = 0;
    render();
    if (!reducedMotion.matches && inView && !document.hidden) {
      timer = window.setInterval(() => {
        index = (index + 1) % states.length;
        render();
      }, 4600);
    }
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.15 }).observe(hero);
  } else {
    sync();
  }
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener?.('change', sync);
})();
