(() => {
  const motionScript = [...document.scripts].find((script) => /portfolio-motion\.js(?:\?|$)/.test(script.src));
  const portfolioRoot = motionScript ? new URL('../', motionScript.src) : new URL('/portfolio/', window.location.href);
  const iconSprite = new URL('assets/icons/portfolio-icons.svg', portfolioRoot).href;
  const supportStylesHref = new URL('css/hiring-support.css', portfolioRoot).href;

  if (!document.querySelector('link[data-hiring-support-styles]')) {
    const supportStyles = document.createElement('link');
    supportStyles.rel = 'stylesheet';
    supportStyles.href = supportStylesHref;
    supportStyles.dataset.hiringSupportStyles = 'true';
    document.head.appendChild(supportStyles);
  }

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const normalize = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const STOP_WORDS = new Set([
    'a','an','and','are','about','can','do','does','for','have','has','how','i','in','is','me','my','of','on','or','show','tell','the','to','what','where','with','you','your'
  ]);

  let hiringIndex = [];
  let hiringIndexPromise = null;

  const loadHiringIndex = () => {
    if (!hiringIndexPromise) {
      hiringIndexPromise = fetch(new URL('data/hiring-search.json', portfolioRoot))
        .then((response) => {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.json();
        })
        .then((data) => {
          hiringIndex = Array.isArray(data.entries) ? data.entries : [];
          return hiringIndex;
        })
        .catch(() => {
          hiringIndex = [];
          return hiringIndex;
        });
    }
    return hiringIndexPromise;
  };

  const rankHiringResults = (query) => {
    const cleanQuery = normalize(query);
    if (!cleanQuery) return hiringIndex.slice(0, 6);

    const tokens = cleanQuery.split(' ').filter((token) => token.length > 1 && !STOP_WORDS.has(token));
    if (!tokens.length) return hiringIndex.slice(0, 6);

    return hiringIndex
      .map((entry) => {
        const title = normalize(entry.title);
        const summary = normalize(entry.summary);
        const keywords = normalize((entry.keywords || []).join(' '));
        const combined = `${title} ${summary} ${keywords}`;
        let score = combined.includes(cleanQuery) ? 14 : 0;

        tokens.forEach((token) => {
          if (title.includes(token)) score += 7;
          if (keywords.includes(token)) score += 5;
          if (summary.includes(token)) score += 2;
        });

        return { entry, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, 6)
      .map(({ entry }) => entry);
  };

  const renderHiringResults = (container, query) => {
    const results = rankHiringResults(query);
    if (!results.length) {
      container.innerHTML = `
        <div class="portfolio-assistant-empty">
          <strong>No direct match yet.</strong>
          <span>Try a broader phrase like “LMS,” “AI evaluation,” “automation,” “sales enablement,” or “eLearning.”</span>
        </div>`;
      return;
    }

    container.innerHTML = results.map((entry) => {
      const url = new URL(entry.path, portfolioRoot).href;
      const external = entry.path.toLowerCase().endsWith('.pdf') ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `
        <a class="portfolio-assistant-result" href="${url}"${external}>
          <span class="portfolio-assistant-result-title">${escapeHtml(entry.title)}</span>
          <span class="portfolio-assistant-result-summary">${escapeHtml(entry.summary)}</span>
          <span class="portfolio-assistant-result-link">View relevant work →</span>
        </a>`;
    }).join('');
  };

  const initHiringAssistant = () => {
    if (document.querySelector('.portfolio-assistant-launcher')) return;

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'portfolio-assistant-launcher';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'portfolioHiringAssistant');
    launcher.innerHTML = `
      <svg class="portfolio-icon" aria-hidden="true"><use href="${iconSprite}#icon-feedback"></use></svg>
      <span>What do you want to know about me?</span>`;

    const panel = document.createElement('section');
    panel.id = 'portfolioHiringAssistant';
    panel.className = 'portfolio-assistant-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Portfolio hiring guide');
    panel.innerHTML = `
      <div class="portfolio-assistant-header">
        <div>
          <p class="eyebrow">Portfolio Guide</p>
          <h2>What do you want to know about me?</h2>
          <p>Search my published work and jump directly to the most relevant examples.</p>
        </div>
        <button class="portfolio-assistant-close" type="button" aria-label="Close portfolio guide">×</button>
      </div>
      <label class="portfolio-assistant-search-wrap">
        <span class="sr-only">Search portfolio experience</span>
        <input class="portfolio-assistant-search" type="search" placeholder="Try: LMS migration, AI evaluation, sales enablement..." autocomplete="off">
      </label>
      <div class="portfolio-assistant-prompts" aria-label="Common recruiter questions">
        <button type="button" data-query="sales enablement">Sales enablement</button>
        <button type="button" data-query="LMS administration migration">LMS + migration</button>
        <button type="button" data-query="AI evaluation rubric">AI evaluation</button>
        <button type="button" data-query="Python automation reporting">Automation</button>
        <button type="button" data-query="eLearning Articulate Storyline Rise">eLearning</button>
      </div>
      <div class="portfolio-assistant-results" aria-live="polite"></div>`;

    document.body.append(panel, launcher);

    const input = panel.querySelector('.portfolio-assistant-search');
    const results = panel.querySelector('.portfolio-assistant-results');
    const close = panel.querySelector('.portfolio-assistant-close');

    const openPanel = async () => {
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      await loadHiringIndex();
      renderHiringResults(results, input.value);
      requestAnimationFrame(() => input.focus());
    };

    const closePanel = () => {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    };

    launcher.addEventListener('click', () => {
      if (panel.hidden) openPanel(); else closePanel();
    });
    close.addEventListener('click', closePanel);
    input.addEventListener('input', () => renderHiringResults(results, input.value));
    panel.querySelectorAll('[data-query]').forEach((button) => {
      button.addEventListener('click', async () => {
        input.value = button.dataset.query;
        await loadHiringIndex();
        renderHiringResults(results, input.value);
        input.focus();
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) closePanel();
    });
  };

  const demoHelpMap = [
    {
      match: '/interactive-learning/meddpicc-practice/',
      title: 'MEDDPICC demo help',
      intro: 'Use the framework overview first, then classify each discovery note by the MEDDPICC category it supports most directly.',
      steps: ['Review the category map.', 'Read the fictional account evidence.', 'Match each note to one MEDDPICC category.', 'Use feedback to compare your reasoning.'],
      signal: 'This demonstrates scenario design, evidence classification, sales methodology practice, and feedback logic.'
    },
    {
      match: '/interactive-learning/pursuit-positioning/',
      title: 'Pursuit demo help',
      intro: 'Move through the evidence one decision at a time. Your scores update the pursuit matrix as you go.',
      steps: ['Scan the opportunity signals.', 'Score the active criterion.', 'Watch the matrix position change.', 'Compare your final position with the benchmark.'],
      signal: 'This demonstrates progressive disclosure, judgment practice, live scoring, and visual feedback.'
    },
    {
      match: '/ai-training-and-evaluation/ai-training-and-evaluation-demo/',
      title: 'AI evaluation demo help',
      intro: 'Keep the model output visible while you compare it with the task and approved source.',
      steps: ['Check the assignment.', 'Review the approved source.', 'Mark concrete failure signals.', 'Choose severity and compare with calibration.'],
      signal: 'This demonstrates model-output evaluation, evidence grounding, error detection, and reviewer calibration.'
    },
    {
      match: '/ai-training-and-evaluation/rubric-demo/',
      title: 'Rubric demo help',
      intro: 'Score one criterion at a time while keeping the model output in view.',
      steps: ['Select a scoring lens.', 'Compare the output to that criterion.', 'Choose a score based on observable evidence.', 'Finish the pass and review calibration.'],
      signal: 'This demonstrates rubric design, defensible scoring, calibration, and AI quality assurance.'
    },
    {
      match: '/ai-training-and-evaluation/workflow-demo/',
      title: 'Workflow demo help',
      intro: 'Follow the review packet through four stages: Frame, Verify, Diagnose, and Calibrate.',
      steps: ['Frame the task.', 'Verify source-grounded claims.', 'Diagnose material issues.', 'Calibrate severity and feedback.'],
      signal: 'This demonstrates repeatable QA workflow design and evidence-based human review.'
    },
    {
      match: '/instructional-design/complete-learning-paths/',
      title: 'Pathway demo help',
      intro: 'Use the scale selector and lifecycle controls to see how the workflow changes with solution size.',
      steps: ['Choose the solution scale.', 'Move through the lifecycle stages.', 'Compare planning, build, and handoff needs.', 'Look for the closed-loop maintenance pattern.'],
      signal: 'This demonstrates curriculum architecture, scalable eLearning workflow design, QA, and long-term maintainability.'
    }
  ];

  const initDemoHelp = () => {
    const path = window.location.pathname.toLowerCase();
    const help = demoHelpMap.find((item) => path.includes(item.match.toLowerCase()));
    if (!help) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'demo-help-launcher';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'portfolioDemoHelp');
    button.innerHTML = `
      <svg class="portfolio-icon" aria-hidden="true"><use href="${iconSprite}#icon-learning-design"></use></svg>
      <span>Demo help</span>`;

    const panel = document.createElement('aside');
    panel.id = 'portfolioDemoHelp';
    panel.className = 'demo-help-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="demo-help-header">
        <div>
          <p class="eyebrow">How this works</p>
          <h3>${escapeHtml(help.title)}</h3>
        </div>
        <button class="demo-help-close" type="button" aria-label="Close demo help">×</button>
      </div>
      <p>${escapeHtml(help.intro)}</p>
      <ol>${help.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      <div class="demo-help-signal"><strong>What this demonstrates</strong><span>${escapeHtml(help.signal)}</span></div>`;

    document.body.append(panel, button);

    const close = panel.querySelector('.demo-help-close');
    const setOpen = (open) => {
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open) close.focus(); else button.focus();
    };

    button.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });
  };

  initHiringAssistant();
  initDemoHelp();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }

  document.documentElement.classList.add('motion-ready');

  const revealTargets = document.querySelectorAll(
    '.section-heading, .refresh-section-intro, .refresh-link-card, .project-family-card, .home-feature-card, .experience-panel, .cta, .refresh-explorer, .visual-flourish, .scenario-card, .project-path-card, .process-step, .workflow-principle, .context-card, .progress-card, .feature-callout'
  );

  revealTargets.forEach((element) => element.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -7% 0px'
  });

  revealTargets.forEach((element) => observer.observe(element));

  document.querySelectorAll('[data-parallax-soft]').forEach((element) => {
    const update = () => {
      const rect = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const offset = Math.max(-1, Math.min(1, (elementCenter - viewportCenter) / window.innerHeight));
      element.style.setProperty('--parallax-shift', `${offset * -10}px`);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  });
})();
