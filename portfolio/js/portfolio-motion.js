(() => {
  const motionScript = [...document.scripts].find((script) => /portfolio-motion\.js(?:\?|$)/.test(script.src));
  const portfolioRoot = motionScript ? new URL('../', motionScript.src) : new URL('/portfolio/', window.location.href);
  const iconSprite = new URL('assets/icons/portfolio-icons.svg', portfolioRoot).href;
  const supportStylesHref = new URL('css/hiring-support.css', portfolioRoot).href;
  const experienceStylesHref = new URL('css/experience-polish.css', portfolioRoot).href;

  const loadSharedStyles = () => {
    if (!document.querySelector('link[data-hiring-support-styles]')) {
      const supportStyles = document.createElement('link');
      supportStyles.rel = 'stylesheet';
      supportStyles.href = supportStylesHref;
      supportStyles.dataset.hiringSupportStyles = 'true';
      document.head.appendChild(supportStyles);
    }

    if (!document.querySelector('link[data-experience-polish-styles]')) {
      const experienceStyles = document.createElement('link');
      experienceStyles.rel = 'stylesheet';
      experienceStyles.href = experienceStylesHref;
      experienceStyles.dataset.experiencePolishStyles = 'true';
      document.head.appendChild(experienceStyles);
    }
  };

  loadSharedStyles();

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

  const iconForLink = (link) => {
    const haystack = `${link.textContent || ''} ${link.getAttribute('href') || ''}`.toLowerCase();
    if (haystack.includes('ai') || haystack.includes('evaluation')) return 'icon-ai-evaluation';
    if (haystack.includes('lms') || haystack.includes('learning platform')) return 'icon-lms';
    if (haystack.includes('workflow') || haystack.includes('automation') || haystack.includes('systems')) return 'icon-workflow';
    if (haystack.includes('multimedia') || haystack.includes('video')) return 'icon-multimedia';
    if (haystack.includes('interactive') || haystack.includes('meddpicc') || haystack.includes('pursuit')) return 'icon-interaction';
    if (haystack.includes('elearning') || haystack.includes('learning path') || haystack.includes('certification')) return 'icon-elearning';
    if (haystack.includes('contact')) return 'icon-feedback';
    return 'icon-learning-design';
  };

  const initExploreFooters = () => {
    document.querySelectorAll('.cta').forEach((cta) => {
      const eyebrow = cta.querySelector('.eyebrow');
      if (!eyebrow || !/keep exploring/i.test(eyebrow.textContent || '')) return;
      if (cta.classList.contains('portfolio-explore-footer')) return;

      cta.classList.add('portfolio-explore-footer');
      const heading = cta.querySelector('h2');
      if (heading && /explore more of my work/i.test(heading.textContent || '')) {
        heading.textContent = 'Explore more work';
      }

      cta.querySelectorAll('.button-row a').forEach((link) => {
        if (link.classList.contains('portfolio-explore-link')) return;
        const label = link.textContent.trim();
        const icon = iconForLink(link);
        link.classList.add('portfolio-explore-link');
        link.innerHTML = `
          <span class="portfolio-explore-icon" aria-hidden="true">
            <svg class="portfolio-icon"><use href="${iconSprite}#${icon}"></use></svg>
          </span>
          <span class="portfolio-explore-link-text">${escapeHtml(label)}</span>`;
      });
    });
  };

  const initCompactProjectNote = () => {
    document.querySelectorAll('.project-template-note .feature-callout').forEach((note) => {
      if (note.classList.contains('portfolio-citation-note')) return;
      note.classList.add('portfolio-citation-note');
      note.innerHTML = `
        <svg class="portfolio-icon" aria-hidden="true"><use href="${iconSprite}#icon-feedback"></use></svg>
        <p><strong>Public-safe case study.</strong> Sanitized, fictionalized, or generalized details protect proprietary information.</p>`;
    });
  };

  const initCertificationCaseCopy = () => {
    if (!window.location.pathname.toLowerCase().includes('/enterprise-sales-certification/')) return;

    const heroSummary = document.querySelector('.project-hero-content .body-large');
    if (heroSummary) {
      heroSummary.textContent = 'I turned sales, product, and technical source material into a multi-course sales certification, then built the learning, assessment, review, LMS testing, and reporting support around it.';
    }

    const snapshotItems = Array.from(document.querySelectorAll('.project-snapshot-item'));
    if (snapshotItems[0]) {
      const role = snapshotItems[0].querySelector('strong');
      if (role) role.textContent = 'Designed and developed the curriculum, interactions, and assessments; coordinated QA and SME review; supported LMS testing, migration validation, maintenance, and reporting.';
    }
    if (snapshotItems[1]) {
      const audience = snapshotItems[1].querySelector('strong');
      if (audience) audience.textContent = 'Internal sellers and channel partners, from new to experienced.';
    }

    const need = document.querySelector('#need > p');
    if (need) need.textContent = 'Turn broad, changing source material into focused sales learning that helped sellers recognize fit, explain value, and choose the next step without teaching installation.';

    const audienceCard = document.querySelector('#need .project-story-card:first-child p');
    if (audienceCard) audienceCard.textContent = 'Internal sellers and channel partners, from new to experienced.';

    const objectives = document.querySelector('#need .project-story-card:nth-child(2) ul');
    if (objectives) {
      objectives.innerHTML = [
        'Recognize opportunities that fit the portfolio.',
        'Distinguish related solution categories using customer needs and constraints.',
        'Ask useful discovery questions and connect capabilities to value.',
        'Recommend next steps and know when specialist support is needed.'
      ].map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    }

    const approach = document.querySelector('#decisions .project-story-card:first-child p');
    if (approach) approach.textContent = 'I wrote seller-focused objectives, grouped approved source material into courses, separated core and regional requirements, and moved deeper technical detail into optional or technical learning.';

    const build = document.querySelector('#build > p');
    if (build) build.textContent = 'I built modular Rise and Storyline lessons, comparisons, scenarios, knowledge checks, multimedia, and assessment content; coordinated QA and SME review; then tested the learner experience in the LMS.';

    const buildRole = document.querySelector('#build .project-story-card:nth-child(2) p');
    if (buildRole) buildRole.textContent = 'Designed and developed the learning; coordinated review; supported LMS testing, migration validation, maintenance, and reporting improvements.';

    const outcomes = document.querySelector('#outcome .project-outcome-list');
    if (outcomes) {
      outcomes.innerHTML = [
        'Released a multi-course sales certification with practice, assessment, review documentation, and LMS support.',
        'Separated broadly applicable and regional requirements into distinct learner routes.',
        'Added a supplemental regional assessment and spreadsheet workflow when LMS reporting did not fully match the design.'
      ].map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    }
  };

  const EXPLORER_GROUPS = [
    { id: 'architecture', label: 'Architecture', sections: ['learning-architecture', 'mixed-experience-design'] },
    { id: 'learning-assessment', label: 'Learning + Assessment', sections: ['objective-alignment', 'assessment-strategy'] },
    { id: 'qa-lms', label: 'QA + LMS', sections: ['qa-governance', 'lms-migration'] },
    { id: 'operations', label: 'Operations', sections: ['reporting-workflow', 'maintenance-lifecycle'] },
    { id: 'evidence-reflection', label: 'Evidence + Reflection', sections: ['evidence-boundaries', 'reflection'] }
  ];

  const initProjectDetailExplorer = () => {
    const detailSections = Array.from(document.querySelectorAll('.project-detail-section'));
    if (detailSections.length < 2 || document.querySelector('.project-case-explorer')) return;

    const detailMap = new Map(detailSections.map((section) => [section.id, section]));
    const groups = EXPLORER_GROUPS
      .map((group) => ({ ...group, sections: group.sections.filter((id) => detailMap.has(id)) }))
      .filter((group) => group.sections.length);
    if (!groups.length) return;

    const firstDetail = detailSections[0];
    const parent = firstDetail.parentElement;
    if (!parent) return;

    const explorer = document.createElement('section');
    explorer.id = 'case-explorer';
    explorer.className = 'project-case-explorer';
    explorer.innerHTML = `
      <div class="project-case-explorer-header">
        <p class="eyebrow">Case Explorer</p>
        <h2>Explore the decisions behind the work.</h2>
        <p>Choose the evidence most relevant to you.</p>
      </div>
      <div class="project-case-explorer-tabs" role="tablist" aria-label="Case study evidence"></div>
      <div class="project-case-explorer-panels"></div>`;

    parent.insertBefore(explorer, firstDetail);
    const tabs = explorer.querySelector('.project-case-explorer-tabs');
    const panels = explorer.querySelector('.project-case-explorer-panels');

    groups.forEach((group, index) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.id = `case-tab-${group.id}`;
      tab.className = 'project-case-explorer-tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', `case-panel-${group.id}`);
      tab.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      tab.tabIndex = index === 0 ? 0 : -1;
      tab.textContent = group.label;
      tabs.appendChild(tab);

      const panel = document.createElement('div');
      panel.id = `case-panel-${group.id}`;
      panel.className = 'project-case-explorer-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.hidden = index !== 0;
      panels.appendChild(panel);

      group.sections.forEach((sectionId) => {
        const section = detailMap.get(sectionId);
        section.classList.add('project-explorer-detail');
        panel.appendChild(section);
      });
    });

    const tabButtons = Array.from(tabs.querySelectorAll('[role="tab"]'));
    const panelEls = Array.from(panels.querySelectorAll('[role="tabpanel"]'));
    const selectTab = (nextIndex, focus = false) => {
      tabButtons.forEach((tab, index) => {
        const selected = index === nextIndex;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panelEls[index].hidden = !selected;
      });
      if (focus) tabButtons[nextIndex].focus();
    };

    tabButtons.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabButtons.length - 1;
        else if (event.key === 'ArrowRight') next = (index + 1) % tabButtons.length;
        else next = (index - 1 + tabButtons.length) % tabButtons.length;
        selectTab(next, true);
      });
    });

    const requestedHash = window.location.hash.replace('#', '');
    if (requestedHash) {
      const groupIndex = groups.findIndex((group) => group.sections.includes(requestedHash));
      if (groupIndex >= 0) selectTab(groupIndex);
    }

    const storyNav = document.querySelector('.project-story-nav');
    if (storyNav) {
      storyNav.querySelectorAll('a').forEach((link) => {
        const target = (link.getAttribute('href') || '').replace('#', '');
        if (groups.some((group) => group.sections.includes(target))) link.remove();
      });
      if (!storyNav.querySelector('a[href="#case-explorer"]')) {
        const outcomeLink = storyNav.querySelector('a[href="#outcome"]');
        const explorerLink = document.createElement('a');
        explorerLink.href = '#case-explorer';
        explorerLink.textContent = 'Case Explorer';
        storyNav.insertBefore(explorerLink, outcomeLink || null);
      }
    }
  };

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
    }
  ];

  const initDemoHelp = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/index\.html$/, '/').replace(/\/+$/, '/');
    const help = demoHelpMap.find((item) => path.endsWith(item.match.toLowerCase()));

    if (!help) {
      document.querySelectorAll('.demo-help-launcher, .demo-help-panel').forEach((element) => element.remove());
      return;
    }

    document.body.dataset.demoPage = 'true';

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

  initExploreFooters();
  initCompactProjectNote();
  initCertificationCaseCopy();
  initProjectDetailExplorer();
  initHiringAssistant();
  initDemoHelp();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }

  document.documentElement.classList.add('motion-ready');

  const revealTargets = document.querySelectorAll(
    '.section-heading, .refresh-section-intro, .refresh-link-card, .project-family-card, .home-feature-card, .experience-panel, .cta, .refresh-explorer, .visual-flourish, .scenario-card, .project-path-card, .process-step, .workflow-principle, .context-card, .progress-card, .feature-callout, .project-case-explorer'
  );
  revealTargets.forEach((element) => element.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
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
