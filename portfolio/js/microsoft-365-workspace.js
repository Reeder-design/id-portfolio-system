(() => {
  const tabs = Array.from(document.querySelectorAll('[data-workspace-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-workspace-panel]'));
  if (!tabs.length || tabs.length !== panels.length) return;

  function activate(index, focus = false) {
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[tabIndex].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      activate(nextIndex, true);
    });
  });
})();

(() => {
 const tabs=[...document.querySelectorAll('[data-model-tab]')],panels=[...document.querySelectorAll('[data-model-panel]')];
 const select=i=>{tabs.forEach((t,n)=>{t.setAttribute('aria-selected',n===i);t.tabIndex=n===i?0:-1;});panels.forEach((p,n)=>{p.classList.toggle('is-active',n===i);p.setAttribute('aria-hidden',n!==i);p.inert=n!==i;});};
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{const n=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(n!==null){e.preventDefault();select(n);tabs[n].focus();}});});
})();
