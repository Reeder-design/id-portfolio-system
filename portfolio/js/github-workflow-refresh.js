(() => {
  const page = document.querySelector('.gh-page');
  if (!page) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  page.querySelectorAll('[data-scroll-to]').forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById(button.dataset.scrollTo)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  const explorer = page.querySelector('[data-live-explorer]');
  if (explorer) {
    const tabs = [...explorer.querySelectorAll('[data-live-tab]')];
    const panels = [...explorer.querySelectorAll('[data-live-panel]')];
    const selectTab = (tab, focus = false) => {
      const selected = tab.dataset.liveTab;
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => { panel.hidden = panel.dataset.livePanel !== selected; });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', (event) => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        selectTab(tabs[next], true);
      });
    });

    page.querySelectorAll('[data-open-demo]').forEach((button) => {
      button.addEventListener('click', () => {
        const tab = tabs.find((item) => item.dataset.liveTab === button.dataset.openDemo);
        if (!tab) return;
        selectTab(tab);
        explorer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        tab.focus({ preventScroll: true });
      });
    });

    explorer.querySelectorAll('[data-sample-demo]').forEach((button) => {
      const result = button.closest('[data-live-panel]')?.querySelector('[data-demo-result]');
      if (!result) return;
      const originalLabel = button.textContent;
      button.addEventListener('click', () => {
        result.hidden = !result.hidden;
        button.textContent = result.hidden ? originalLabel : 'Hide sample ↑';
      });
    });

    const workbenchDemo = explorer.querySelector('[data-workbench-demo]');
    if (workbenchDemo) {
      const choices = [...workbenchDemo.querySelectorAll('[data-workbench-choice]')];
      const feedback = workbenchDemo.querySelector('[data-workbench-feedback]');
      const messages = {
        sanitize: 'Good call. Make a public-safe copy, then review it before anything is shared.',
        publish: 'Pause here. The example needs a public-safe edit and human review first.'
      };
      choices.forEach((choice) => {
        choice.addEventListener('click', () => {
          choices.forEach((item) => item.setAttribute('aria-pressed', String(item === choice)));
          if (feedback) feedback.textContent = messages[choice.dataset.workbenchChoice] || '';
        });
      });
    }

    panels.forEach((panel) => {
      const launch = panel.querySelector('[data-launch-live]');
      const frame = panel.querySelector('[data-live-frame]');
      const cover = panel.querySelector('[data-live-cover]');
      if (!launch || !frame || !cover) return;
      launch.addEventListener('click', () => {
        if (!frame.hidden) {
          frame.hidden = true;
          cover.hidden = false;
          launch.textContent = 'Launch live page in frame ↗';
          return;
        }
        if (frame.dataset.loaded === 'true') {
          cover.hidden = true;
          frame.hidden = false;
          launch.textContent = 'Back to preview ←';
          return;
        }
        launch.textContent = 'Loading live page…';
        launch.disabled = true;
        frame.addEventListener('load', () => {
          frame.dataset.loaded = 'true';
          cover.hidden = true;
          frame.hidden = false;
          launch.textContent = 'Back to preview ←';
          launch.disabled = false;
        }, { once: true });
        frame.src = frame.dataset.src;
        window.setTimeout(() => {
          if (!launch.disabled) return;
          launch.textContent = 'Try live page again ↻';
          launch.disabled = false;
        }, 8000);
      });
    });
  }

  const nav = page.querySelector('[data-page-nav]');
  const marker = page.querySelector('[data-nav-marker]');
  const spacer = page.querySelector('[data-nav-spacer]');
  const progress = page.querySelector('[data-nav-progress]');
  if (nav && marker && spacer && progress) {
    const links = [...nav.querySelectorAll('[data-section-link]')];
    const sections = links.map((link) => document.getElementById(link.dataset.sectionLink));
    const update = () => {
      const height = nav.offsetHeight;
      page.style.setProperty('--gh-nav-height', `${height}px`);
      const pinned = marker.getBoundingClientRect().top <= 0;
      nav.classList.toggle('is-pinned', pinned);
      spacer.style.height = pinned ? `${height}px` : '0px';

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress.style.width = `${Math.min(100, Math.max(0, window.scrollY / maxScroll * 100))}%`;
      let active = -1;
      sections.forEach((section, index) => {
        if (section && section.getBoundingClientRect().top <= height + 105) active = index;
      });
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
