(() => {
  const tabs = [...document.querySelectorAll('.expertise-tabs [role="tab"]')];
  const panels = [...document.querySelectorAll('.expertise-panel')];
  const select = (index, focus = false) => {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    panels.forEach((panel, i) => { panel.classList.toggle('is-active', i === index); panel.setAttribute('aria-hidden', String(i !== index)); panel.inert = i !== index; });
    if (focus) tabs[index].focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const target = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (target !== null) { event.preventDefault(); select(target, true); }
    });
  });
})();
