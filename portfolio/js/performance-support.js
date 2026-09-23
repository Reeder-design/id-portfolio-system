(() => {
  const diagnoses = {
    knowledge: {
      signal: 'Repeated question', check: 'New understanding or a reminder?',
      owner: 'Learning + source owner', route: 'Learning + support',
      response: 'Teach the principle; keep a verified reference for the live task.'
    },
    access: {
      signal: 'Cannot reach the answer', check: 'Entry point, label, or permission?',
      owner: 'Administrator / support', route: 'Guidance + escalation',
      response: 'Clarify the route; send account or permission changes to the owner.'
    },
    process: {
      signal: 'Work stalls at a handoff', check: 'Does the documented step fit the work?',
      owner: 'Operational owner', route: 'Workflow change',
      response: 'Review the handoff and update the workflow with its guidance.'
    },
    source: {
      signal: 'Answers conflict', check: 'Which source is authoritative?',
      owner: 'SME / source owner', route: 'Maintained reference',
      response: 'Validate the answer and name who will keep the reference current.'
    },
    system: {
      signal: 'Expected path fails', check: 'Setting, mapping, visibility, or data?',
      owner: 'System administrator', route: 'Configuration fix',
      response: 'Document the case; update guidance after the fix is verified.'
    },
    exception: {
      signal: 'Routine route stops', check: 'Judgment, correction, or investigation?',
      owner: 'SME / support owner', route: 'Human escalation',
      response: 'Capture context and send the case to the person who can act.'
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
    document.getElementById('psFindingSignal').textContent = data.signal;
    document.getElementById('psDiagnosisCheck').textContent = data.check;
    document.getElementById('psFindingOwner').textContent = data.owner;
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
