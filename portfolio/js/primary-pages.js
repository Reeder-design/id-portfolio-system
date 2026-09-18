(() => {
  const script = document.currentScript;
  const href = script ? new URL('../css/primary-pages.css', script.src).href : '/portfolio/css/primary-pages.css';
  if (document.querySelector('link[data-primary-pages-styles]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.primaryPagesStyles = 'true';
  document.head.appendChild(link);
})();
