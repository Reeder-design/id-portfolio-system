(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }

  document.documentElement.classList.add('motion-ready');

  const revealTargets = document.querySelectorAll(
    '.section-heading, .refresh-section-intro, .refresh-link-card, .project-family-card, .home-feature-card, .experience-panel, .cta, .refresh-explorer, .visual-flourish, .scenario-card, .project-path-card, .process-step, .workflow-principle, .context-card, .progress-card, .feature-callout'
  );

  revealTargets.forEach((element) => element.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px'
  });

  revealTargets.forEach((element) => observer.observe(element));

  document.querySelectorAll('[data-parallax-soft]').forEach((element) => {
    const update = () => {
      const rect = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const offset = Math.max(-1, Math.min(1, (elementCenter - viewportCenter) / window.innerHeight));
      element.style.setProperty('--parallax-shift', `${offset * -10}px`);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  });
})();
