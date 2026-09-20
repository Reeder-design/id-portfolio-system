(() => {
  const motionScript = [...document.scripts].find((script) => /portfolio-motion\.js(?:\?|$)/.test(script.src));
  const portfolioRoot = motionScript ? new URL('../', motionScript.src) : new URL('/portfolio/', window.location.href);
  const iconSprite = new URL('assets/icons/portfolio-icons.svg', portfolioRoot).href;
  const supportStylesHref = new URL('css/hiring-support.css', portfolioRoot).href;
  const experienceStylesHref = new URL('css/experience-polish.css', portfolioRoot).href;
  const finalStretchStylesHref = new URL('css/final-stretch-system.css', portfolioRoot).href;

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

    if (!document.querySelector('link[data-final-stretch-styles]')) {
      const finalStretchStyles = document.createElement('link');
      finalStretchStyles.rel = 'stylesheet';
      finalStretchStyles.href = finalStretchStylesHref;
      finalStretchStyles.dataset.finalStretchStyles = 'true';
      document.head.appendChild(finalStretchStyles);
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
    if (haystack.includes('live training') || haystack.includes('facilitation')) return 'icon-live-instruction';
    if (haystack.includes('microlearning') || haystack.includes('performance support')) return 'icon-feedback';
    if (haystack.includes('contact')) return 'icon-feedback';
    return 'icon-learning-design';
  };

  const normalizePath = (value) => String(value || '')
    .replace(/^\/+/, '')
    .replace(/index\.html$/i, '')
    .replace(/\/+$/, '');

  const currentRelativePath = () => {
    const currentUrl = new URL(window.location.href);
    const rootPath = new URL('.', portfolioRoot).pathname;
    let relativePath = currentUrl.pathname;
    if (relativePath.startsWith(rootPath)) relativePath = relativePath.slice(rootPath.length);
    return normalizePath(decodeURIComponent(relativePath));
  };

  const initPageFamily = () => {
    const path = currentRelativePath();
    const primary = new Set(['', 'about', 'projects', 'contact', 'expertise']);
    const disciplines = new Set([
      'projects/instructional-design',
      'projects/ai-training-and-evaluation',
      'projects/lms-administration',
      'projects/workflows'
    ]);
    const categories = new Set([
      'projects/instructional-design/complete-learning-paths',
      'projects/instructional-design/interactive-learning',
      'projects/instructional-design/live-training',
      'projects/instructional-design/microlearning-performance-support',
      'projects/instructional-design/microlearning-performance-support/microlearning',
      'projects/instructional-design/microlearning-performance-support/performance-support',
      'projects/instructional-design/interactive-learning/ai-integrations-in-learning',
      'projects/instructional-design/multimedia',
      'projects/lms-administration/system-integrations'
    ]);
    const demos = new Set([
      'projects/instructional-design/interactive-learning/meddpicc-practice',
      'projects/instructional-design/interactive-learning/pursuit-positioning',
      'projects/ai-training-and-evaluation/ai-training-and-evaluation-demo',
      'projects/ai-training-and-evaluation/rubric-demo',
      'projects/ai-training-and-evaluation/workflow-demo'
    ]);

    let family = 'case';
    if (primary.has(path)) family = 'primary';
    else if (path === 'hiring-manager') family = 'hiring';
    else if (disciplines.has(path)) family = 'discipline';
    else if (categories.has(path)) family = 'category';
    else if (demos.has(path)) family = 'demo';
    else if (!path.startsWith('projects/')) family = 'primary';
    document.body.dataset.pageFamily = family;
  };

  const initHiringGuideNav = () => {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;
    let link = [...nav.querySelectorAll('a[href]')].find((item) => /hiring-manager/i.test(item.getAttribute('href') || ''));
    if (!link) {
      link = document.createElement('a');
      link.href = new URL('hiring-manager/', portfolioRoot).href;
      link.textContent = 'Hiring Guide';
      nav.appendChild(link);
    }
    link.classList.add('nav-hiring-guide');
    const path = currentRelativePath();
    link.classList.toggle('active', path === 'hiring-manager');
  };

  const initFooterLinks = () => {
    document.querySelectorAll('.site-footer .footer-links').forEach((links) => {
      links.innerHTML = `
        <a href="https://github.com/reeder-design" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/haley-reeder" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="${new URL('assets/documents/Haley-Reeder-Resume.pdf', portfolioRoot).href}" target="_blank" rel="noopener noreferrer">Résumé</a>
        <a href="${new URL('expertise/', portfolioRoot).href}">Expertise</a>`;
    });
  };

  const initProjectFamilyVisuals = () => {
    const visualMap = [
      {
        match: '/projects/instructional-design/',
        image: 'assets/project-images/main-pages/instructional-design.webp',
        alt: 'Instructional design portfolio illustration with learning design and development elements.'
      },
      {
        match: '/projects/ai-training-and-evaluation/',
        image: 'assets/project-images/main-pages/ai-training-evaluation.webp',
        alt: 'AI training and evaluation portfolio illustration with quality review elements.'
      },
      {
        match: '/projects/lms-administration/',
        image: 'assets/project-images/main-pages/lms-administration.webp',
        alt: 'LMS administration portfolio illustration with learning platform operations elements.'
      },
      {
        match: '/projects/workflows/',
        image: 'assets/project-images/main-pages/system-integrations-workflows.webp',
        alt: 'System integration and workflow portfolio illustration with connected process elements.'
      }
    ];

    document.querySelectorAll('.project-family-card').forEach((card) => {
      if (card.querySelector('.project-family-visual')) return;
      const link = card.querySelector('.project-family-link[href]');
      if (!link) return;
      const href = new URL(link.getAttribute('href'), window.location.href).pathname.toLowerCase();
      const visual = visualMap.find((item) => href.includes(item.match));
      if (!visual) return;

      const figure = document.createElement('figure');
      figure.className = 'project-family-visual';
      figure.innerHTML = `<img src="${new URL(visual.image, portfolioRoot).href}" alt="${escapeHtml(visual.alt)}" loading="lazy">`;
      const header = card.querySelector('.project-family-header');
      card.insertBefore(figure, header || card.firstChild);
    });
  };

  const initFeaturedCaseVisuals = () => {
    const visualMap = [
      {
        match: 'enterprise-sales-certification',
        image: 'assets/icons/pixel/portfolio-general/learning.webp',
        alt: 'Learning pathway pixel illustration.'
      },
      {
        match: 'learning-platform-operations-migration-readiness',
        image: 'assets/icons/pixel/lms/forward-arrows.webp',
        alt: 'Learning platform migration pixel illustration.'
      },
      {
        match: 'certification-reporting-automation',
        image: 'assets/icons/pixel/portfolio-general/growth.webp',
        alt: 'Reporting and growth pixel illustration.'
      }
    ];

    document.querySelectorAll('.featured-case-card').forEach((card) => {
      if (card.querySelector('.featured-case-visual')) return;
      const link = card.querySelector('a[href]');
      if (!link) return;
      const href = (link.getAttribute('href') || '').toLowerCase();
      const visual = visualMap.find((item) => href.includes(item.match));
      if (!visual) return;

      const figure = document.createElement('div');
      figure.className = 'featured-case-visual';
      figure.innerHTML = `<img src="${new URL(visual.image, portfolioRoot).href}" alt="${escapeHtml(visual.alt)}" loading="lazy">`;
      card.prepend(figure);
    });
  };

  const initHeroCleanup = () => {
    const hero = document.querySelector('main > section:first-of-type');
    const h1 = hero?.querySelector('h1');
    if (!hero || !h1) return;

    const ordered = [...hero.querySelectorAll('.eyebrow, h1')];
    const h1Index = ordered.indexOf(h1);
    const eyebrow = ordered.slice(0, h1Index).find((node) => node.classList.contains('eyebrow'));
    if (eyebrow) {
      let label = eyebrow.textContent.trim().replace(/^Projects\s*\/\s*/i, '').trim();
      const headingText = h1.textContent.trim();
      eyebrow.remove();
      if (label && normalize(label) !== normalize(headingText)) {
        const copy = h1.closest('.refresh-hero-copy, .hero-copy, .project-hero-content, .parent-page-hero-content') || h1.parentElement;
        let row = copy.querySelector('.hero-context-row');
        if (!row) {
          row = document.createElement('div');
          row.className = 'hero-context-row';
          copy.appendChild(row);
        }
        const chip = document.createElement('span');
        chip.className = 'hero-context-chip';
        chip.textContent = label;
        row.appendChild(chip);
      }
    }

    const currentUrl = new URL(window.location.href);
    const normalizedCurrent = normalizePath(currentUrl.pathname);
    const currentParts = normalizedCurrent.split('/').filter(Boolean);
    const parentPath = currentParts.slice(0, -1).join('/');

    hero.querySelectorAll('.button-row a[href], a.btn[href]').forEach((link) => {
      const raw = (link.getAttribute('href') || '').trim();
      if (!raw) return;
      let remove = raw.startsWith('#');
      if (!remove && !raw.startsWith('http') && !raw.startsWith('mailto:')) {
        const target = new URL(raw, currentUrl);
        const normalizedTarget = normalizePath(target.pathname);
        remove = normalizedTarget === parentPath;
      }
      if (remove) link.remove();
    });

    hero.querySelectorAll('.button-row').forEach((row) => {
      if (!row.querySelector('a,button')) row.remove();
    });
  };

  const initSectionRhythm = () => {
    const family = document.body.dataset.pageFamily;
    if (!family || family === 'demo' || family === 'hiring') return;

    const main = document.querySelector('main');
    if (!main) return;

    const hero = main.querySelector(':scope > section:first-of-type');
    const sections = [...main.children].filter((element) => {
      if (element.tagName !== 'SECTION' || element === hero || element.hidden) return false;
      if (element.classList.contains('snapshot-band')) return false;
      return true;
    });

    if (!sections.length) return;

    // Primary-page heroes are light, so their first content section turns dark.
    // Discipline/category/case heroes are dark, so their first content section turns light.
    let dark = family === 'primary';

    sections.forEach((section) => {
      section.classList.remove('fs-surface-light', 'fs-surface-dark');
      section.classList.add(dark ? 'fs-surface-dark' : 'fs-surface-light');
      dark = !dark;
    });

    // Always land on a light section before the light footer.
    const lastSection = sections[sections.length - 1];
    lastSection.classList.remove('fs-surface-dark');
    lastSection.classList.add('fs-surface-light');
  };

  const BREADCRUMB_ROUTES = [
    ['hiring-manager', 'Ask Haley'],
    ['about', 'About Me'],
    ['contact', 'Contact'],
    ['projects', 'Projects'],
    ['projects/instructional-design', 'Instructional Design'],
    ['projects/instructional-design/complete-learning-paths', 'Complete eLearning Pathways'],
    ['projects/instructional-design/interactive-learning', 'Interactive Learning'],
    ['projects/instructional-design/live-training', 'Live Training'],
    ['projects/instructional-design/microlearning-performance-support', 'Microlearning & Performance Support'],
    ['projects/instructional-design/microlearning-performance-support/microlearning', 'Microlearning'],
    ['projects/instructional-design/microlearning-performance-support/performance-support', 'Performance Support'],
    ['projects/instructional-design/interactive-learning/ai-integrations-in-learning', 'Learner-facing AI'],
    ['projects/instructional-design/multimedia', 'Multimedia'],
    ['projects/ai-training-and-evaluation', 'AI Training & Evaluation'],
    ['projects/lms-administration', 'LMS Administration'],
    ['projects/lms-administration/system-integrations', 'System Integrations'],
    ['projects/workflows', 'Workflows']
  ];

  const initCanonicalBreadcrumbs = () => {
    const currentUrl = new URL(window.location.href);
    const rootPath = new URL('.', portfolioRoot).pathname;
    let relativePath = currentUrl.pathname;
    if (relativePath.startsWith(rootPath)) relativePath = relativePath.slice(rootPath.length);
    relativePath = normalizePath(decodeURIComponent(relativePath));
    if (!relativePath) return;

    const h1 = document.querySelector('main h1, .page-hero h1, h1');
    const currentLabel = h1 ? h1.textContent.trim() : document.title.split('|')[0].trim();
    let ancestors = BREADCRUMB_ROUTES.filter(([route]) => relativePath === route || relativePath.startsWith(`${route}/`));
    if (relativePath === 'projects/workflows/ai-automation/salesforce-lms-account-automation') {
      ancestors = [['projects','Projects'],['projects/lms-administration','LMS Administration'],['projects/lms-administration/system-integrations','System Integrations']];
    }
    const breadcrumbParentSkips = new Set();
    if (relativePath === 'projects/instructional-design/microlearning-performance-support/microlearning' ||
        relativePath === 'projects/instructional-design/microlearning-performance-support/performance-support') {
      breadcrumbParentSkips.add('projects/instructional-design/microlearning-performance-support');
    }
    if (relativePath === 'projects/instructional-design/interactive-learning/ai-integrations-in-learning') {
      breadcrumbParentSkips.add('projects/instructional-design/interactive-learning');
    }
    ancestors = ancestors.filter(([route]) => !breadcrumbParentSkips.has(route));
    const exact = ancestors.find(([route]) => route === relativePath);

    const items = [{ label: 'Home', href: new URL('index.html', portfolioRoot).href }];
    ancestors.forEach(([route, label]) => {
      if (route === relativePath) items.push({ label, href: null });
      else items.push({ label, href: new URL(`${route}/`, portfolioRoot).href });
    });
    if (!exact && currentLabel) items.push({ label: currentLabel, href: null });

    let breadcrumbs = document.querySelector('.breadcrumbs');
    const heroCopy = h1?.closest('.refresh-hero-copy, .hero-copy, .project-hero-content, .parent-page-hero-content, .projects-intro') || h1?.parentElement;
    if (!breadcrumbs) {
      if (!heroCopy || !h1) return;
      breadcrumbs = document.createElement('nav');
      breadcrumbs.className = 'breadcrumbs';
      heroCopy.insertBefore(breadcrumbs, h1);
    } else if (heroCopy && h1 && breadcrumbs.parentElement !== heroCopy) {
      heroCopy.insertBefore(breadcrumbs, h1);
    }

    breadcrumbs.setAttribute('aria-label', 'Breadcrumb');
    breadcrumbs.innerHTML = items.map((item, index) => {
      const separator = index ? '<span class="breadcrumb-separator" aria-hidden="true">/</span>' : '';
      const crumb = item.href
        ? `<a href="${item.href}">${escapeHtml(item.label)}</a>`
        : `<span aria-current="page">${escapeHtml(item.label)}</span>`;
      return `${separator}${crumb}`;
    }).join('');
  };

  const initBreadcrumbTone = () => {
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (!breadcrumbs) return;
    const hero = breadcrumbs.closest('section, header, main') || breadcrumbs.parentElement;
    const heading = hero?.querySelector('h1') || document.querySelector('main h1');
    if (!heading) return;

    const match = window.getComputedStyle(heading).color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) return;
    const [r,g,b] = match.slice(1,4).map(Number);
    const luminance = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
    const lightText = luminance > 0.58;
    const primary = lightText ? 'rgba(248,252,249,.84)' : '#40554d';
    const current = lightText ? '#ffffff' : '#263d37';
    const separator = lightText ? 'rgba(248,252,249,.56)' : '#7a8781';

    breadcrumbs.dataset.breadcrumbTone = lightText ? 'light' : 'dark';
    breadcrumbs.querySelectorAll('a').forEach((node) => node.style.setProperty('color', primary, 'important'));
    breadcrumbs.querySelectorAll('[aria-current="page"]').forEach((node) => node.style.setProperty('color', current, 'important'));
    breadcrumbs.querySelectorAll('.breadcrumb-separator').forEach((node) => node.style.setProperty('color', separator, 'important'));
  };

  const cleanLinkLabel = (value) => String(value || '')
    .replace(/[→›»]+\s*$/g, '')
    .replace(/^open\s+/i, '')
    .trim();

  const pixelAssetForLink = (link) => {
    const haystack = `${link.textContent || ''} ${link.getAttribute('href') || ''}`.toLowerCase();
    if (haystack.includes('ai') || haystack.includes('evaluation')) return 'assets/icons/pixel/ai-training-evaluation/training-hero.webp';
    if (haystack.includes('lms') || haystack.includes('learning platform') || haystack.includes('migration')) return 'assets/icons/pixel/lms/goal-mountain.webp';
    if (haystack.includes('workflow') || haystack.includes('automation') || haystack.includes('system')) return 'assets/icons/pixel/hiring-guide/workflow-tree.webp';
    if (haystack.includes('meddpicc')) return 'assets/icons/pixel/meddpicc/qualified-opportunity.webp';
    if (haystack.includes('pursuit')) return 'assets/icons/pixel/pursuit-determination/pursue-confidence.webp';
    if (haystack.includes('microlearning') || haystack.includes('performance support')) return 'assets/icons/pixel/microlearning-performance-support/microlearning.webp';
    if (haystack.includes('live training') || haystack.includes('facilitation')) return 'assets/icons/pixel/portfolio-general/collaboration.webp';
    if (haystack.includes('multimedia') || haystack.includes('video')) return 'assets/icons/pixel/portfolio-general/ideas.webp';
    if (haystack.includes('certification') || haystack.includes('elearning') || haystack.includes('learning path')) return 'assets/icons/pixel/portfolio-general/learning.webp';
    return 'assets/icons/pixel/portfolio-general/portfolio.webp';
  };

  const initExploreFooters = () => {
    const eyebrowNodes = [...document.querySelectorAll('.eyebrow')]
      .filter((node) => /^(keep exploring|related work|other work)$/i.test((node.textContent || '').trim()));

    eyebrowNodes.forEach((eyebrow) => {
      const section = eyebrow.closest('section') || eyebrow.closest('.cta') || eyebrow.parentElement;
      if (!section || section.dataset.keepExploringStandardized === 'true') return;

      const sectionLabel = eyebrow.textContent.trim();
      const heading = section.querySelector('h2');
      const headingText = heading?.textContent.trim() || (sectionLabel === 'Related Work' ? 'Related work' : 'More work to explore');
      const introCandidates = [...section.querySelectorAll('p')]
        .filter((p) => !p.classList.contains('eyebrow'));
      const introText = introCandidates.find((p) => {
        const card = p.closest('article, a, .refresh-link-card, .explore-card, .live-explore-card, .micro-explore-card');
        return !card;
      })?.textContent.trim() || 'Continue through the portfolio.';

      const links = [...section.querySelectorAll('a[href]')];
      const seen = new Set();
      const cards = links.map((link) => {
        const rawHref = link.getAttribute('href');
        if (!rawHref || seen.has(rawHref)) return null;
        seen.add(rawHref);
        const card = link.closest('article, .refresh-link-card, .explore-card, .live-explore-card, .micro-explore-card') || link.parentElement;
        const titleNode = card?.querySelector('h3');
        const existingEyebrow = card?.querySelector('.eyebrow');
        const descriptionNode = [...(card?.querySelectorAll('p') || [])]
          .find((p) => !p.classList.contains('eyebrow'));
        const existingUse = card?.querySelector('svg use');
        const useHref = existingUse?.getAttribute('href') || existingUse?.getAttribute('xlink:href') || '';
        const existingIcon = useHref.includes('#') ? useHref.split('#').pop() : '';
        const title = titleNode?.textContent.trim() || cleanLinkLabel(link.textContent) || 'Explore more work';
        const category = existingEyebrow && !/^(keep exploring|related work|other work)$/i.test(existingEyebrow.textContent.trim())
          ? existingEyebrow.textContent.trim()
          : 'Explore';
        const description = descriptionNode?.textContent.trim() || `Continue to ${title}.`;
        const icon = existingIcon || iconForLink(link);
        const pixel = pixelAssetForLink(link);
        return { href: rawHref, title, category, description, icon, pixel };
      }).filter(Boolean);

      if (!cards.length) return;

      section.dataset.keepExploringStandardized = 'true';
      section.className = 'section section-soft';
      section.classList.add('portfolio-explore-section');

      const relativePath = currentRelativePath();
      const aiDemoPaths = new Set([
        'projects/ai-training-and-evaluation/ai-training-and-evaluation-demo',
        'projects/ai-training-and-evaluation/rubric-demo',
        'projects/ai-training-and-evaluation/workflow-demo'
      ]);
      if (aiDemoPaths.has(relativePath)) section.classList.add('ai-demo-explore');
      section.removeAttribute('aria-labelledby');
      section.innerHTML = `
        <div class="container">
          <div class="section-heading refresh-section-intro">
            <p class="eyebrow">${escapeHtml(sectionLabel)}</p>
            <h2>${escapeHtml(headingText)}</h2>
            <p>${escapeHtml(introText)}</p>
          </div>
          <div class="refresh-card-grid portfolio-explore-grid">
            ${cards.map((card) => `
              <a class="refresh-link-card portfolio-explore-card" href="${escapeHtml(card.href)}">
                <div class="refresh-link-card-header">
                  <span class="icon-badge has-pixel" aria-hidden="true"><svg class="portfolio-icon"><use href="${iconSprite}#${escapeHtml(card.icon)}"></use></svg></span>
                  <img class="portfolio-explore-pixel" src="${new URL(card.pixel, portfolioRoot).href}" alt="" aria-hidden="true" loading="lazy">
                  <span class="portfolio-explore-category">${escapeHtml(card.category)}</span>
                  <h3>${escapeHtml(card.title)}</h3>
                </div>
                <div class="refresh-link-card-body">
                  <p>${escapeHtml(card.description)}</p>
                  <span class="project-family-link">Explore related work →</span>
                </div>
              </a>`).join('')}
          </div>
        </div>`;
    });
  };

  const initPortfolioSafetyNotes = () => {
    const candidates = [...document.querySelectorAll('p')].filter((node) => {
      const text = (node.textContent || '').trim();
      return /public-safe case study/i.test(text)
        || /^scope note:/i.test(text)
        || /course identifiers, report names, learner data, account details, and internal file structures are intentionally omitted/i.test(text)
        || /internal file structures are intentionally omitted/i.test(text);
    });

    candidates.forEach((paragraph) => {
      if (paragraph.closest('.portfolio-safety-note')) return;
      const original = (paragraph.textContent || '').trim();
      const scopeNote = /^scope note:/i.test(original);
      const boundaryNote = /intentionally omitted/i.test(original);

      if (scopeNote) {
        const noteBody = original.replace(/^scope note:\s*/i, '').trim();
        paragraph.innerHTML = `<strong>Scope note.</strong> ${escapeHtml(noteBody)}`;
      } else {
        paragraph.innerHTML = boundaryNote
          ? '<strong>Portfolio boundary.</strong> Internal identifiers, learner data, file structures, report names, and proprietary implementation details are intentionally excluded.'
          : '<strong>Portfolio-safe reconstruction.</strong> The work and responsibilities are real. Customer details, solution language, learner data, and internal identifiers are sanitized or fictionalized where needed.';
      }

      const wrapper = document.createElement('div');
      wrapper.className = scopeNote ? 'portfolio-safety-note is-scope-note' : 'portfolio-safety-note';
      wrapper.innerHTML = scopeNote
        ? `<img class="portfolio-safety-pixel" src="${new URL('assets/icons/pixel/portfolio-general/case-studies.webp', portfolioRoot).href}" alt="" aria-hidden="true">`
        : `<span class="portfolio-safety-icon" aria-hidden="true"><svg class="portfolio-icon"><use href="${iconSprite}#icon-feedback"></use></svg></span>`;
      paragraph.parentNode.insertBefore(wrapper, paragraph);
      wrapper.appendChild(paragraph);
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

  initPageFamily();
  initHiringGuideNav();
  initFooterLinks();
  initCanonicalBreadcrumbs();
  initBreadcrumbTone();
  initProjectFamilyVisuals();
  initFeaturedCaseVisuals();
  initHeroCleanup();
  initExploreFooters();
  initPortfolioSafetyNotes();
  initSectionRhythm();
  initCertificationCaseCopy();
  initProjectDetailExplorer();

  const initAskHaleyReturnDock = () => {
    if (document.body.classList.contains('hiring-manager-page')) return;
    const current = new URL(window.location.href);
    if (current.searchParams.get('from') !== 'ask-haley') return;

    let saved = null;
    try {
      const raw = window.sessionStorage.getItem('ask-haley-session-v1');
      saved = raw ? JSON.parse(raw) : null;
    } catch (error) {}

    const started = Boolean(saved?.chatStarted);
    const target = new URL('hiring-manager/index.html', portfolioRoot);
    if (started) target.searchParams.set('resume', '1');
    target.hash = 'ask-haley';

    const dock = document.createElement('a');
    dock.className = 'ask-haley-return-dock';
    dock.href = target.href;
    dock.setAttribute('aria-label', started ? 'Back to Ask Haley chat' : 'Start Ask Haley chat');
    dock.innerHTML = `
      <span class="ask-haley-return-icon"><img src="${new URL('assets/icons/pixel/hiring-guide/person-man.webp', portfolioRoot).href}" alt=""></span>
      <span><strong>${started ? 'Back to chat' : 'Start chat'}</strong><small>Ask Haley</small></span>
      <i aria-hidden="true">→</i>`;

    if (!document.getElementById('ask-haley-return-style')) {
      const style = document.createElement('style');
      style.id = 'ask-haley-return-style';
      style.textContent = `
        .ask-haley-return-dock{position:fixed;left:18px;right:auto;bottom:18px;z-index:1200;display:grid;grid-template-columns:46px auto auto;gap:10px;align-items:center;min-width:196px;padding:10px 13px;border:2px solid rgba(121,201,158,.62);border-radius:18px;background:rgba(255,255,255,.98);box-shadow:0 18px 48px rgba(34,52,47,.24),0 0 0 6px rgba(121,201,158,.08);color:#34413d;text-decoration:none;backdrop-filter:blur(10px)}
        .ask-haley-return-dock:hover,.ask-haley-return-dock:focus-visible{transform:translateY(-3px);border-color:#79C99E;box-shadow:0 22px 54px rgba(34,52,47,.28),0 0 0 7px rgba(121,201,158,.12);outline:none}
        .ask-haley-return-icon{display:grid;place-items:center;width:42px;height:42px;padding:3px;border-radius:12px;background:#fff;border:1px solid rgba(80,132,132,.14)}
        .ask-haley-return-icon img{width:100%;height:100%;object-fit:contain;image-rendering:pixelated}
        .ask-haley-return-dock>span:nth-child(2){display:grid;gap:1px}
        .ask-haley-return-dock strong{font:800 .7rem/1.2 Montserrat,sans-serif}
        .ask-haley-return-dock small{color:#74817b;font:.62rem/1.2 'Open Sans',sans-serif}
        .ask-haley-return-dock i{color:#508484;font-style:normal;font-weight:800}
        @media(max-width:640px){.ask-haley-return-dock{left:12px;right:auto;bottom:12px;min-width:0}.ask-haley-return-dock small{display:none}}
      `;
      document.head.appendChild(style);
    }
    document.body.appendChild(dock);
  };

  initHiringAssistant();
  initAskHaleyReturnDock();
  initDemoHelp();

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }

  document.documentElement.classList.add('motion-ready');

  const revealTargets = document.querySelectorAll(
    '.section-heading, .refresh-section-intro, .refresh-link-card, .project-family-card, .home-feature-card, .experience-panel, .cta, .refresh-explorer, .visual-flourish, .scenario-card, .project-path-card, .process-step, .workflow-principle, .context-card, .progress-card, .feature-callout, .project-case-explorer, .portfolio-explore-card, .portfolio-safety-note, .snapshot-band'
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
