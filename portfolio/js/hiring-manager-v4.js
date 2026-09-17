(() => {
  const viewButtons = [...document.querySelectorAll('[data-hm-expertise-view]')];
  const panels = [...document.querySelectorAll('[data-hm-expertise-panel]')];
  const helpers = [...document.querySelectorAll('.hm-helper')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showView = (view) => {
    viewButtons.forEach((button) => {
      const active = button.dataset.hmExpertiseView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });

    panels.forEach((panel) => {
      const active = panel.dataset.hmExpertisePanel === view;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
  };

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.hmExpertiseView));
  });

  helpers.forEach((helper) => {
    helper.addEventListener('toggle', () => {
      if (!helper.open) return;
      helpers.forEach((other) => {
        if (other !== helper) other.open = false;
      });
    });
  });

  document.addEventListener('click', (event) => {
    helpers.forEach((helper) => {
      if (helper.open && !helper.contains(event.target)) helper.open = false;
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    helpers.forEach((helper) => { helper.open = false; });
  });

  document.querySelectorAll('.hm-explore-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });

  showView('capabilities');
})();
