(() => {
  const diagnoses = {
    knowledge: {
      title: 'Knowledge and skill',
      summary: 'When a task depends on a concept or judgment, I look for the step a person cannot yet explain or perform independently.',
      signal: 'Repeated questions or inconsistent decisions across similar tasks.',
      check: 'Can the person apply the rule to a new example, or do they only need a reminder?',
      improve: 'Build practice for new judgment and a quick reference for stable steps.',
      route: 'Practice + job aid',
      response: 'Teach the decision, then put a concise cue beside the real task.'
    },
    access: {
      title: 'Access to guidance',
      summary: 'An accurate answer has little value if the worker cannot reach it while the task is underway.',
      signal: 'People search in the wrong place, hit permissions, or abandon the link.',
      check: 'Follow the worker’s actual entry point, device, search words, and access level.',
      improve: 'Clarify labels and links; route permission changes to the system owner.',
      route: 'Findability + access fix',
      response: 'Place the trusted answer where the work begins and verify that the audience can open it.'
    },
    process: {
      title: 'Workflow and handoff',
      summary: 'A stalled task can reflect an unclear sequence, role boundary, or approval point rather than missing knowledge.',
      signal: 'Work waits between owners or the documented step does not match practice.',
      check: 'Walk through a real case and mark where the handoff or rule breaks down.',
      improve: 'Agree on the next owner and repair the workflow before updating its guide.',
      route: 'Workflow + guide update',
      response: 'Make the handoff explicit and support the revised process with a short task aid.'
    },
    source: {
      title: 'Source of truth',
      summary: 'Conflicting or aging instructions make people hesitate even when a reference exists.',
      signal: 'Two documents give different answers or users cannot tell which is current.',
      check: 'Trace the answer to an authoritative source and identify its update owner.',
      improve: 'Retire duplicates, surface the current answer, and establish a review path.',
      route: 'Maintained reference',
      response: 'Publish one answer with a clear source, owner, and update cue.'
    },
    system: {
      title: 'System and data conditions',
      summary: 'A tool can block performance through settings, visibility, data flow, or a broken interaction.',
      signal: 'The expected screen, field, or record does not behave as the guide describes.',
      check: 'Reproduce the path and inspect permissions, mappings, settings, and data.',
      improve: 'Fix the underlying condition with its owner; then correct the guidance.',
      route: 'System fix + support',
      response: 'Verify the technical change before teaching a workaround or revising the job aid.'
    },
    feedback: {
      title: 'Feedback and reinforcement',
      summary: 'People improve when they can see whether an action worked and how to adjust the next attempt.',
      signal: 'The same error recurs after instruction or no clear confirmation follows the task.',
      check: 'What cue appears at the decision point, and is it specific enough to guide a correction?',
      improve: 'Add in-work feedback, a worked example, or timely coaching where judgment matters.',
      route: 'In-work cues + coaching',
      response: 'Make success visible and give the worker a useful next move, then check whether errors decline.'
    }
  };

  const buttons = [...document.querySelectorAll('[data-ps-diagnosis]')];
  const scenes = [...document.querySelectorAll('[data-ps-scene]')];
  function activate(button) {
    const data = diagnoses[button.dataset.psDiagnosis];
    if (!data) return;
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('psFindingTitle').textContent = data.title;
    document.getElementById('psFindingSummary').textContent = data.summary;
    document.getElementById('psFindingSignal').textContent = data.signal;
    document.getElementById('psDiagnosisCheck').textContent = data.check;
    document.getElementById('psFindingImprovement').textContent = data.improve;
    document.getElementById('psRouteVisual').textContent = data.route;
    document.getElementById('psDiagnosisResponse').textContent = data.response;
    scenes.forEach(scene => {
      const selected = scene.dataset.psScene === button.dataset.psDiagnosis;
      scene.classList.remove('is-active');
      if (selected) {
        void scene.offsetWidth;
        scene.classList.add('is-active');
      }
    });
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

  const typeNav = document.querySelector('.ps-type-nav');
  const typeLinks = [...document.querySelectorAll('.ps-type-nav a[href^="#"]')];
  const typeIndicator = document.querySelector('.ps-type-indicator');
  const typeRows = typeLinks.map(link => document.getElementById(link.hash.slice(1)));
  if (typeNav && typeIndicator && typeRows.every(Boolean)) {
    let activeIndex = -1;
    let queued = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function setActive(index) {
      const link = typeLinks[index];
      if (!link) return;
      typeLinks.forEach((item, itemIndex) => {
        item.classList.toggle('is-active', itemIndex === index);
        if (itemIndex === index) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
      typeIndicator.style.width = `${link.offsetWidth}px`;
      typeIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
      if (index !== activeIndex) {
        activeIndex = index;
        const targetLeft = link.offsetLeft + link.offsetWidth / 2 - typeNav.clientWidth / 2;
        typeNav.scrollTo({ left: Math.max(0, targetLeft), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      }
    }
    function updateTypeNav() {
      queued = false;
      const readingLine = typeNav.getBoundingClientRect().height + window.innerHeight * .34;
      let index = 0;
      typeRows.forEach((row, rowIndex) => {
        if (row.getBoundingClientRect().top <= readingLine) index = rowIndex;
      });
      setActive(index);
    }
    function queueTypeNav() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(updateTypeNav);
    }
    typeLinks.forEach((link, index) => link.addEventListener('click', () => setActive(index)));
    window.addEventListener('scroll', queueTypeNav, { passive: true });
    window.addEventListener('resize', queueTypeNav);
    window.addEventListener('hashchange', queueTypeNav);
    window.addEventListener('load', queueTypeNav);
    queueTypeNav();
  }
})();
