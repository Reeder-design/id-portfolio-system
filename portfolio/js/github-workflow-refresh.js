(() => {
  const explorer = document.querySelector('[data-repo-explorer]');
  if (!explorer) return;

  const tabs = [...explorer.querySelectorAll('[data-repo-tab]')];
  const panels = [...explorer.querySelectorAll('[data-repo-panel]')];
  const address = explorer.querySelector('[data-browser-address]');
  const names = {
    portfolio: 'id-portfolio-system',
    library: 'id-content-library',
    engine: 'learning-experience-engine'
  };

  function selectTab(tab, moveFocus = false) {
    const selected = tab.dataset.repoTab;
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.repoPanel === selected;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    address.textContent = `github.com/Reeder-design/${names[selected]}`;
    if (moveFocus) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[nextIndex], true);
    });
  });
})();
