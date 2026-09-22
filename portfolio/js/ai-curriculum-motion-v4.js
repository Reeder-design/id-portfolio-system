(() => {
  const motion = document.querySelector('[data-ai-curriculum-motion]');
  if (!motion) return;

  const scenes = [...motion.querySelectorAll('[data-motion-scene]')];
  const steps = [...motion.querySelectorAll('[data-motion-step]')];
  const count = motion.querySelector('[data-motion-count]');
  const progress = motion.querySelector('.ai-curriculum-motion-progress i');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const durations = [2300, 2300, 2700, 3100, 3000, 2500, 12000];
  let stage = 0;
  let timer = null;
  let visible = !('IntersectionObserver' in window);

  const render = () => {
    motion.dataset.stage = String(stage);
    scenes.forEach((scene, index) => scene.classList.toggle('is-active', index === stage));
    steps.forEach((step, index) => {
      step.classList.toggle('is-active', index === stage);
      step.classList.toggle('is-complete', index < stage);
    });
    count.textContent = `${String(stage + 1).padStart(2, '0')} / 07`;
    progress.style.width = `${((stage + 1) / scenes.length) * 100}%`;
  };
  const stop = () => {
    window.clearTimeout(timer);
    timer = null;
  };
  const play = () => {
    stop();
    if (reducedMotion.matches) {
      stage = scenes.length - 1;
      render();
      return;
    }
    if (!visible || document.hidden) return;
    render();
    timer = window.setTimeout(() => {
      stage = (stage + 1) % scenes.length;
      play();
    }, durations[stage]);
  };

  render();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      play();
    }, { threshold: 0.15 });
    observer.observe(motion);
  } else play();
  document.addEventListener('visibilitychange', play);
  reducedMotion.addEventListener?.('change', play);
})();
