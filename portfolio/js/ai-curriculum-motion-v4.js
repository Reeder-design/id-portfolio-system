(() => {
  const motion = document.querySelector('[data-ai-curriculum-motion]');
  if (!motion) return;

  const scenes = [...motion.querySelectorAll('[data-motion-scene]')];
  const tabs = [...motion.querySelectorAll('[data-motion-step]')];
  const count = motion.querySelector('[data-motion-count]');
  const progress = motion.querySelector('.ai-curriculum-motion-progress i');
  const description = motion.querySelector('[data-motion-description]');
  if (!scenes.length || scenes.length !== tabs.length || !description) return;

  const designNotes = [
    'The learning goal stays shared, but the learner’s role determines the work they practice. A coordinator builds the campaign handoff; a lead reviews and approves it.',
    'A quick experience check sets the starting level of support. Someone new gets a worked prompt and source check; an experienced learner starts with a fuller task. Later performance can change this route.',
    'The chosen training topic determines which approved examples, tools, and outputs appear. Handoff practice uses a recap, brief, and owner follow-up; reporting uses data, insight, and an update.',
    'The learner’s response provides evidence of readiness. Checking facts and owners opens a harder simulation; sharing an unreviewed draft triggers a guided source-check and retry, even if the learner started on an experienced route.',
    'The assessment is shaped by the learner’s role, topic, and demonstrated readiness. This coordinator builds a verified handoff; a campaign lead would review and approve it. Both are checked against the same source, accuracy, and next-action criteria.',
    'The job aid follows the task and any gap shown in practice. This learner gets a reusable campaign prompt; another route might produce an approval checklist or a targeted refresher.',
    'Two roles, two topics, two starting levels, and two adaptive scopes create sixteen routes. The highlighted cell is this learner’s path. The task and support vary, while the core learning goal stays the same.'
  ];

  let stage = 0;
  const render = (nextStage) => {
    stage = nextStage;
    motion.dataset.stage = String(stage);
    scenes.forEach((scene, index) => {
      const active = index === stage;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', String(!active));
      scene.tabIndex = active ? 0 : -1;
    });
    tabs.forEach((tab, index) => {
      const active = index === stage;
      tab.classList.toggle('is-active', active);
      tab.classList.toggle('is-complete', index < stage);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    description.textContent = designNotes[stage];
    if (count) count.textContent = `${String(stage + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    if (progress) progress.style.width = `${((stage + 1) / scenes.length) * 100}%`;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => render(index));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      render(nextIndex);
      tabs[nextIndex].focus();
    });
  });

  render(0);
})();
