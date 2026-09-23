(() => {
  const iconRoot = '../../../../assets/icons/pixel/';
  const diagnoses = {
    knowledge: {
      cause: 'Knowledge', signal: 'Repeated question', check: 'New understanding or a reminder?',
      owner: 'Learning + source owner', route: 'Learning + support',
      response: 'Teach the principle; keep a verified reference for the live task.',
      icon: 'workflows/learning-enablement/knowledge.webp'
    },
    access: {
      cause: 'Access', signal: 'Cannot reach the answer', check: 'Entry point, label, or permission?',
      owner: 'Administrator / support', route: 'Guidance + escalation',
      response: 'Clarify the route; send account or permission changes to the owner.',
      icon: 'performance-support/find.webp'
    },
    process: {
      cause: 'Process', signal: 'Work stalls at a handoff', check: 'Does the documented step fit the work?',
      owner: 'Operational owner', route: 'Workflow change',
      response: 'Review the handoff and update the workflow with its guidance.',
      icon: 'workflows/planning-projects/tasks.webp'
    },
    source: {
      cause: 'Source', signal: 'Answers conflict', check: 'Which source is authoritative?',
      owner: 'SME / source owner', route: 'Maintained reference',
      response: 'Validate the answer and name who will keep the reference current.',
      icon: 'performance-support/reference.webp'
    },
    system: {
      cause: 'System', signal: 'Expected path fails', check: 'Setting, mapping, visibility, or data?',
      owner: 'System administrator', route: 'Configuration fix',
      response: 'Document the case; update guidance after the fix is verified.',
      icon: 'workflows/systems-administration/settings.webp'
    },
    exception: {
      cause: 'Exception', signal: 'Routine route stops', check: 'Judgment, correction, or investigation?',
      owner: 'SME / support owner', route: 'Human escalation',
      response: 'Capture context and send the case to the person who can act.',
      icon: 'workflows/support-resources/support.webp'
    }
  };

  const buttons = [...document.querySelectorAll('[data-ps-diagnosis]')];
  const viewfinder = document.querySelector('.ps-viewfinder');
  function activate(button) {
    const data = diagnoses[button.dataset.psDiagnosis];
    if (!data) return;
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('psCauseVisual').textContent = data.cause;
    document.getElementById('psFindingSignal').textContent = data.signal;
    document.getElementById('psDiagnosisCheck').textContent = data.check;
    document.getElementById('psFindingOwner').textContent = data.owner;
    document.getElementById('psRouteVisual').textContent = data.route;
    document.getElementById('psDiagnosisResponse').textContent = data.response;
    document.getElementById('psLensImage').src = iconRoot + data.icon;
    if (viewfinder && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      viewfinder.classList.remove('is-scanning');
      void viewfinder.offsetWidth;
      viewfinder.classList.add('is-scanning');
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => activate(button)));

  const stage = document.querySelector('.ps-hero-system');
  if (stage) {
    stage.dataset.stage = '0';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stageIndex = 0;
    let timer = null;
    let inView = false;
    let paused = false;
    function showStage(index) {
      stage.dataset.stage = String(index);
      stage.classList.remove('is-routing');
      void stage.offsetWidth;
      stage.classList.add('is-routing');
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }
    function start() {
      if (reduced || !inView || paused || document.hidden || timer) return;
      showStage(stageIndex);
      timer = window.setInterval(() => {
        stageIndex = (stageIndex + 1) % 4;
        showStage(stageIndex);
      }, 3200);
    }
    stage.addEventListener('mouseenter', () => { paused = true; stop(); });
    stage.addEventListener('mouseleave', () => { paused = false; start(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }, { threshold: .2 });
      observer.observe(stage);
    } else {
      inView = true;
      start();
    }
  }

  const rows = [...document.querySelectorAll('.ps-form-row')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .25 });
    rows.forEach(row => observer.observe(row));
  } else {
    rows.forEach(row => row.classList.add('is-visible'));
  }
})();
