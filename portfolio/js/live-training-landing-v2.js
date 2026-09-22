(() => {
  const tabs = Array.from(document.querySelectorAll('[data-lt-tab]'));
  if (!tabs.length) return;

  function selectTab(nextTab, moveFocus = false) {
    tabs.forEach((tab) => {
      const selected = tab === nextTab;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
    });
    if (moveFocus) nextTab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      const { key } = event;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const nextIndex = key === 'Home' ? 0 :
        key === 'End' ? tabs.length - 1 :
          key === 'ArrowRight' ? (index + 1) % tabs.length :
            (index - 1 + tabs.length) % tabs.length;
      selectTab(tabs[nextIndex], true);
    });
  });
})();
