(() => {
  const tabs = Array.from(document.querySelectorAll('[data-lt-tab]'));
  const scenes = Array.from(document.querySelectorAll('[data-lt-scene]'));
  const comparison = document.querySelector('.lt-compare-motion');
  const comparisonTable = document.querySelector('.lt-comparison-table');
  const comparisonTracks = Array.from(document.querySelectorAll('[data-compare-mode]'));
  const comparisonToggle = document.querySelector('[data-compare-toggle]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const sceneCaptions = {
    room: ['Share one prompt', 'Pairs compare reasoning', 'Listen across tables', 'Reframe for the room'],
    online: ['Share the example', 'Poll for interpretation', 'Read chat explanations', 'Practice in breakouts'],
    hybrid: ['Share one accessible prompt', 'Connect room and remote', 'Hear both groups', 'Compare one shared view']
  };
  const sceneNames = { room: 'in-person', online: 'live online', hybrid: 'hybrid' };
  const sceneState = new Map(scenes.map((scene) => [scene, { step: 0, paused: false }]));

  function inView(element) {
    const bounds = element.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 0;
  }

  function renderScene(scene, step) {
    const state = sceneState.get(scene);
    const captions = sceneCaptions[scene.dataset.ltScene];
    state.step = step;
    scene.dataset.step = String(step);
    scene.querySelector('[data-scene-count]').textContent = `${String(step + 1).padStart(2, '0')} / 04`;
    scene.querySelector('[data-scene-caption]').textContent = captions[step];
  }

  function updateSceneToggle(scene) {
    const toggle = scene.querySelector('[data-scene-toggle]');
    const paused = sceneState.get(scene).paused;
    toggle.disabled = reducedMotion.matches;
    toggle.textContent = reducedMotion.matches ? 'Motion off' : paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', `${reducedMotion.matches ? 'Motion off for' : paused ? 'Play' : 'Pause'} ${sceneNames[scene.dataset.ltScene]} simulation`);
  }

  scenes.forEach((scene) => {
    scene.querySelector('[data-scene-toggle]').addEventListener('click', () => {
      const state = sceneState.get(scene);
      state.paused = !state.paused;
      updateSceneToggle(scene);
    });
  });

  function selectTab(nextTab, moveFocus = false) {
    tabs.forEach((tab) => {
      const selected = tab === nextTab;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panel.hidden = !selected;
    });
    const selectedScene = document.getElementById(nextTab.getAttribute('aria-controls')).querySelector('[data-lt-scene]');
    renderScene(selectedScene, reducedMotion.matches ? 2 : 0);
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

  const comparisonModes = ['room', 'online', 'hybrid'];
  let comparisonIndex = 0;
  let comparisonPaused = false;

  function renderComparison(index) {
    comparisonIndex = index;
    const mode = comparisonModes[index];
    comparison.dataset.activeMode = mode;
    comparisonTable.dataset.activeMode = mode;
    comparisonTracks.forEach((track) => {
      const selected = track.dataset.compareMode === mode;
      track.classList.toggle('is-active', selected);
      track.setAttribute('aria-pressed', String(selected));
    });
  }

  function updateComparisonToggle() {
    comparison.classList.toggle('is-paused', comparisonPaused || reducedMotion.matches);
    comparisonToggle.disabled = reducedMotion.matches;
    comparisonToggle.textContent = reducedMotion.matches ? 'Motion off' : comparisonPaused ? 'Play' : 'Pause';
    comparisonToggle.setAttribute('aria-label', reducedMotion.matches ? 'Comparison motion off' : comparisonPaused ? 'Play comparison animation' : 'Pause comparison animation');
  }

  comparisonTracks.forEach((track, index) => {
    track.addEventListener('click', () => {
      comparisonPaused = true;
      renderComparison(index);
      updateComparisonToggle();
    });
  });
  comparisonToggle.addEventListener('click', () => {
    comparisonPaused = !comparisonPaused;
    updateComparisonToggle();
  });

  function syncMotionPreference() {
    scenes.forEach((scene) => {
      if (reducedMotion.matches) renderScene(scene, 2);
      updateSceneToggle(scene);
    });
    if (reducedMotion.matches) renderComparison(0);
    updateComparisonToggle();
  }
  reducedMotion.addEventListener('change', syncMotionPreference);
  syncMotionPreference();

  window.setInterval(() => {
    if (reducedMotion.matches || document.hidden) return;
    const selectedTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    const activeScene = selectedTab && document.getElementById(selectedTab.getAttribute('aria-controls')).querySelector('[data-lt-scene]');
    if (activeScene && !sceneState.get(activeScene).paused && inView(activeScene)) {
      renderScene(activeScene, (sceneState.get(activeScene).step + 1) % 4);
    }
  }, 2800);

  window.setInterval(() => {
    if (!reducedMotion.matches && !document.hidden && !comparisonPaused && inView(comparison)) {
      renderComparison((comparisonIndex + 1) % comparisonModes.length);
    }
  }, 3800);
})();
