(() => {
  const data = window.microCaseData || {};

  const setupTabs = (selector, dataAttr, render) => {
    const buttons = [...document.querySelectorAll(selector)];
    if (!buttons.length) return;
    buttons.forEach((button, index) => {
      const activate = () => {
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        render(button.dataset[dataAttr]);
      };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else next = (index - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
      });
    });
  };

  if (data.hero) {
    setupTabs('[data-micro-hero]', 'microHero', (key) => {
      const item = data.hero[key];
      const note = document.getElementById('microHeroNote');
      if (item && note) note.innerHTML = `<strong>${item.label}:</strong> ${item.text}`;
    });
  }

  if (data.choice) {
    setupTabs('[data-micro-choice]', 'microChoice', (key) => {
      const item = data.choice[key];
      if (!item) return;
      document.getElementById('choiceLabel').textContent = item.label;
      document.getElementById('choiceTitle').textContent = item.title;
      document.getElementById('choiceSummary').textContent = item.summary;
      const cards = document.getElementById('choiceCards');
      cards.innerHTML = item.cards.map(([label, text]) => `<article class="micro-panel-card"><span>${label}</span><p>${text}</p></article>`).join('');
    });
  }

  if (data.flow) {
    setupTabs('[data-micro-flow]', 'microFlow', (key) => {
      const item = data.flow[key];
      if (!item) return;
      document.getElementById('flowDecision').textContent = item.decision;
      document.getElementById('flowOutput').textContent = item.output;
    });
  }

  const navLinks = [...document.querySelectorAll('.case-nav a')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, {rootMargin:'-28% 0px -58% 0px', threshold:[0.1,0.35,0.6]});
    sections.forEach((section) => observer.observe(section));
  }
})();
