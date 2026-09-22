(() => {
  const studio = document.querySelector('[data-ai-v3-avatar]');
  if (!studio) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = [2600, 2900, 3200];
  let stage = 0;
  let timer = null;
  let inView = false;

  function stop() {
    window.clearTimeout(timer);
    timer = null;
  }

  function advance() {
    if (!inView || document.hidden || reducedMotion.matches) return;
    studio.dataset.stage = String(stage + 1);
    timer = window.setTimeout(() => {
      stage = (stage + 1) % 3;
      advance();
    }, duration[stage]);
  }

  function sync() {
    stop();
    if (reducedMotion.matches) {
      studio.dataset.stage = '3';
      return;
    }
    if (inView && !document.hidden) advance();
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.16 });
    observer.observe(studio);
  } else {
    inView = true;
    sync();
  }

  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener?.('change', sync);
})();
