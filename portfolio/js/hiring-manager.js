(() => {
  const root = new URL('../', window.location.href);
  const urls = {
    faq: new URL('data/hiring-faq.json', root),
    expanded: new URL('data/hiring-faq-expanded.json', root),
    specialist: new URL('data/hiring-faq-specialist.json', root),
    capabilities: new URL('data/hiring-capabilities.json', root),
    tools: new URL('data/hiring-tools.json', root),
    search: new URL('data/hiring-search.json', root),
    routingPolicy: new URL('data/hiring-routing-policy.json', root)
  };

  const pixelRoot = new URL('assets/icons/pixel/hiring-guide/', root);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SESSION_KEY = 'ask-haley-session-v1';

  const DEFAULT_ROUTING_POLICY = {
    stop_words: [
      'a','an','and','are','about','can','could','did','do','does','for','from','have','has','how','i','in','is','it','me','my','of','on','or','please','show','tell','the','to','what','where','which','who','why','with','would','you','your','thing','things','really','just','some','something','stuff','kind','sort','one'
    ],
    min_answer_score: 8,
    min_answer_margin: 3,
    min_search_score: 6,
    max_input_length: 480,
    max_repeated_character_run: 8,
    max_repeated_token_count: 4,
    typo_aliases: {
      automtion: 'automation', certfication: 'certification', certifcation: 'certification',
      evaluaton: 'evaluation', evalution: 'evaluation', experiance: 'experience',
      experince: 'experience', expreince: 'experience', faciliatation: 'facilitation',
      instrucional: 'instructional', interative: 'interactive', migraton: 'migration',
      mirgation: 'migration', multmedia: 'multimedia', performace: 'performance',
      perfromance: 'performance', suport: 'support'
    }
  };

  const GENERIC_MATCH_TOKENS = new Set([
    'answer','answers','career','experience','help','information','job','project','projects','question','questions','role','team','work'
  ]);

  const PROFESSIONAL_BOUNDARY_PATTERN = /\b(?:asshole|bitch|blowjob|dick|fuck|jailbreak|nudes?|onlyfans|porn(?:ography)?|sex(?:ual)?|shit|system prompt|tits|vagina|xxx)\b/i;

  const state = {
    questions: [],
    searchEntries: [],
    capabilities: [],
    tools: [],
    learningStatement: '',
    activeTopic: 'Featured',
    activeCapability: null,
    activeTool: null,
    activeScanView: 'capabilities',
    replying: false,
    chatStarted: false,
    expandedChips: {},
    lastEvidence: null,
    routingPolicy: DEFAULT_ROUTING_POLICY
  };

  const STARTER_IDS = [
    'why-hire-me',
    'end-to-end-project',
    'sales-enablement',
    'ai-evaluation',
    'lms-migration'
  ];

  const CAPABILITY_ICONS = {
    'learning-architecture': 'target.webp',
    'enterprise-tech': 'workflow-tree.webp',
    'accessible-ux': 'checklist-document.webp',
    'ai-automation': 'idea-bulb.webp',
    'performance-consulting': 'goal-mountain.webp',
    'delivery-leadership': 'team.webp'
  };

  const TOOL_ICONS = [
    'browser-conversation.webp',
    'document-star.webp',
    'checklist-clipboard.webp',
    'workflow-tree.webp',
    'analytics-growth.webp',
    'chat-bubbles.webp',
    'reference-search.webp',
    'idea-bulb.webp',
    'team.webp'
  ];


  const CAPABILITY_VISUALS = {
    'learning-architecture': { caption: 'Need → practice → evidence', nodes: [['target.webp','Need'],['checklist-document.webp','Practice'],['document-star.webp','Evidence']] },
    'enterprise-tech': { caption: 'Platform → workflow → learner', nodes: [['browser-conversation.webp','Platform'],['workflow-tree.webp','Workflow'],['person-woman.webp','Learner']] },
    'accessible-ux': { caption: 'Navigate → access → use', nodes: [['checklist-document.webp','Navigate'],['person-man.webp','Access'],['target.webp','Use']] },
    'ai-automation': { caption: 'Constrain → automate → QA', nodes: [['idea-bulb.webp','Constrain'],['workflow-tree.webp','Automate'],['checklist-clipboard.webp','QA']] },
    'performance-consulting': { caption: 'Diagnose → support → improve', nodes: [['goal-mountain.webp','Diagnose'],['reference-search.webp','Support'],['analytics-growth.webp','Improve']] },
    'delivery-leadership': { caption: 'Align → review → launch', nodes: [['team.webp','Align'],['checklist-clipboard.webp','Review'],['calendar.webp','Launch']] }
  };

  const TOOL_VISUALS = {
    authoring: { caption: 'Design → build → test', nodes: [['idea-bulb.webp','Design'],['browser-conversation.webp','Build'],['checklist-document.webp','Test']] },
    multimedia: { caption: 'Concept → media → polish', nodes: [['idea-bulb.webp','Concept'],['video-call.webp','Media'],['star.webp','Polish']] },
    lms: { caption: 'Configure → validate → support', nodes: [['workflow-tree.webp','Configure'],['checklist-clipboard.webp','Validate'],['person-woman.webp','Support']] },
    integrations: { caption: 'System → handoff → QA', nodes: [['browser-conversation.webp','System'],['workflow-tree.webp','Handoff'],['checklist-document.webp','QA']] },
    systems: { caption: 'Collect → automate → report', nodes: [['folder-cursor.webp','Collect'],['workflow-tree.webp','Automate'],['analytics-growth.webp','Report']] },
    web: { caption: 'Prototype → interact → refine', nodes: [['browser-conversation.webp','Prototype'],['chat-bubbles.webp','Interact'],['star.webp','Refine']] },
    'learning-data': { caption: 'Track → structure → analyze', nodes: [['checklist-document.webp','Track'],['workflow-tree.webp','Structure'],['analytics-growth.webp','Analyze']] },
    accessibility: { caption: 'Navigate → perceive → use', nodes: [['person-man.webp','Navigate'],['checklist-document.webp','Perceive'],['target.webp','Use']] },
    ai: { caption: 'Prompt → evaluate → verify', nodes: [['idea-bulb.webp','Prompt'],['checklist-clipboard.webp','Evaluate'],['reference-search.webp','Verify']] },
    collaboration: { caption: 'Align → review → deliver', nodes: [['team.webp','Align'],['chat-bubbles.webp','Review'],['calendar.webp','Deliver']] }
  };


  const EVIDENCE_PREVIEWS = {
    'projects/instructional-design/complete-learning-paths/enterprise-sales-certification/index.html': {
      image: 'assets/project-images/cellular-certification/cert-introduction.webp',
      type: 'Instructional Design'
    },
    'projects/instructional-design/complete-learning-paths/index.html': {
      image: 'assets/project-images/complete-learning-pathways/path-program-overview.webp',
      type: 'Instructional Design'
    },
    'projects/instructional-design/microlearning-performance-support/product-launch-microlearning/index.html': {
      image: 'assets/project-images/microlearning/micro-marketing-hero.webp',
      type: 'Microlearning'
    },
    'projects/instructional-design/index.html': {
      image: 'assets/project-images/main-pages/instructional-design.webp',
      type: 'Instructional Design'
    },
    'projects/instructional-design/live-training/virtual-sales-workshop-facilitation/index.html': {
      image: 'assets/project-images/live-training/virtual-training-facilitation.webp',
      type: 'Live Training'
    },
    'projects/instructional-design/microlearning-performance-support/index.html': {
      image: 'assets/project-images/microlearning-performance-support/micro-ps-hero.webp',
      type: 'Microlearning + Performance Support'
    },
    'projects/instructional-design/interactive-learning/index.html': {
      image: 'assets/project-images/interactive-learning/interactive-sales-overview.webp',
      type: 'Interactive Learning'
    },
    'projects/instructional-design/interactive-learning/meddpicc-practice/index.html': {
      image: 'assets/project-images/interactive-learning/meddpicc-sales-use-case.webp',
      type: 'Interactive Learning'
    },
    'projects/instructional-design/interactive-learning/pursuit-positioning/index.html': {
      image: 'assets/project-images/interactive-learning/pursuit-sales-scenario.webp',
      type: 'Interactive Learning'
    },
    'projects/lms-administration/index.html': {
      image: 'assets/project-images/main-pages/lms-administration.webp',
      type: 'LMS + Learning Operations'
    },
    'projects/lms-administration/learning-platform-operations-migration-readiness/index.html': {
      image: 'assets/project-images/lms-migration/learning-pathway.webp',
      type: 'LMS + Learning Operations'
    },
    'projects/workflows/data-reporting/certification-reporting-automation/index.html': {
      image: 'assets/project-images/reporting-automation/report-certification.webp',
      type: 'Systems + Workflow'
    },
    'projects/workflows/index.html': {
      image: 'assets/project-images/main-pages/system-integrations-workflows.webp',
      type: 'Systems + Workflow'
    },
    'projects/ai-training-and-evaluation/index.html': {
      image: 'assets/project-images/main-pages/ai-training-evaluation.webp',
      type: 'AI Training + Evaluation'
    },
    'projects/ai-training-and-evaluation/rubric-demo/index.html': {
      image: 'assets/project-images/ai-training-and-evaluation/nexusai-evaluate-response.webp',
      type: 'AI Training + Evaluation'
    },
    'projects/ai-training-and-evaluation/workflow-demo/index.html': {
      image: 'assets/project-images/ai-training-and-evaluation/nexusai-compare-responses.webp',
      type: 'AI Training + Evaluation'
    },
    'projects/instructional-design/live-training/index.html': {
      image: 'assets/project-images/instructional-design/id-live-training.webp',
      type: 'Live Training'
    },
    'projects/instructional-design/multimedia/index.html': {
      image: 'assets/project-images/multimedia/multimedia-after-effects-motion.webp',
      type: 'Multimedia'
    },
    'projects/instructional-design/microlearning-performance-support/vertical-positioning-microlearning/index.html': {
      image: 'assets/project-images/vertical-positioning/airports-connected.webp',
      type: 'Microlearning'
    }
  };

  const normalizeEvidencePath = (path) => String(path || '')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/^portfolio\//, '');

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const normalize = (value) => String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const routingPolicy = () => state.routingPolicy || DEFAULT_ROUTING_POLICY;

  const routingStopWords = () => new Set(routingPolicy().stop_words || DEFAULT_ROUTING_POLICY.stop_words);

  const canonicalToken = (token) => routingPolicy().typo_aliases?.[token] || token;

  const tokensFor = (value) => normalize(value)
    .split(' ')
    .map(canonicalToken)
    .filter((token) => token.length > 1 && !routingStopWords().has(token) && !GENERIC_MATCH_TOKENS.has(token));

  const allTokensFor = (value) => normalize(value)
    .split(' ')
    .map(canonicalToken)
    .filter(Boolean);

  const normalizeRoutingPolicy = (value) => {
    const candidate = value && typeof value === 'object' ? value : {};
    const number = (key) => Number.isFinite(Number(candidate[key])) ? Number(candidate[key]) : DEFAULT_ROUTING_POLICY[key];
    const stopWords = Array.isArray(candidate.stop_words)
      ? candidate.stop_words.map((item) => normalize(item)).filter(Boolean)
      : DEFAULT_ROUTING_POLICY.stop_words;
    const aliases = candidate.typo_aliases && typeof candidate.typo_aliases === 'object'
      ? Object.fromEntries(Object.entries(candidate.typo_aliases)
        .map(([from, to]) => [normalize(from), normalize(to)])
        .filter(([from, to]) => from && to))
      : DEFAULT_ROUTING_POLICY.typo_aliases;
    return {
      ...DEFAULT_ROUTING_POLICY,
      stop_words: stopWords,
      typo_aliases: aliases,
      min_answer_score: number('min_answer_score'),
      min_answer_margin: number('min_answer_margin'),
      min_search_score: number('min_search_score'),
      max_input_length: number('max_input_length'),
      max_repeated_character_run: number('max_repeated_character_run'),
      max_repeated_token_count: number('max_repeated_token_count')
    };
  };

  const phraseMatch = (query, field) => {
    const queryTokens = tokensFor(query);
    const fieldTokens = tokensFor(field);
    if (queryTokens.length < 2 || fieldTokens.length < 2) return false;
    const clean = queryTokens.join(' ');
    const candidate = fieldTokens.join(' ');
    return clean.includes(candidate) || candidate.includes(clean);
  };

  const fieldHasToken = (field, token) => normalize(field).split(' ').includes(token);

  const scoreQuestionMatch = (query, question) => {
    const clean = normalize(query);
    if (!clean) return { score: 0, matchedTokens: [], exactPhrase: false };
    const prompt = normalize(question.prompt);
    const label = normalize(question.short_label);
    const category = normalize(question.category);
    const keywordValues = Array.isArray(question.keywords) ? question.keywords : [];
    const variantValues = Array.isArray(question.variants) ? question.variants : [];
    const keywords = normalize(keywordValues.join(' '));
    const variants = normalize(variantValues.join(' '));
    const matchedTokens = new Set();
    let exactPhrase = false;
    let score = 0;

    const addPhrase = (field, points) => {
      if (phraseMatch(clean, field)) {
        score += points;
        exactPhrase = true;
      }
    };
    addPhrase(prompt, 16);
    addPhrase(label, 12);
    if (keywordValues.some((value) => phraseMatch(clean, value))) {
      score += 10;
      exactPhrase = true;
    }
    if (variantValues.some((value) => phraseMatch(clean, value))) {
      score += 10;
      exactPhrase = true;
    }

    tokensFor(query).forEach((token) => {
      let matched = false;
      if (fieldHasToken(label, token)) { score += 5; matched = true; }
      if (fieldHasToken(prompt, token)) { score += 4; matched = true; }
      if (fieldHasToken(keywords, token)) { score += 4; matched = true; }
      if (fieldHasToken(variants, token)) { score += 3; matched = true; }
      if (fieldHasToken(category, token)) { score += 2; matched = true; }
      if (matched) matchedTokens.add(token);
    });

    return { score, matchedTokens: [...matchedTokens], exactPhrase };
  };

  const scoreQuestion = (query, question) => {
    return scoreQuestionMatch(query, question).score;
  };

  const hasSupportedQuestionMatch = (match) => (
    match.score >= routingPolicy().min_answer_score
    && (match.exactPhrase || match.matchedTokens.length > 0)
  );

  const BROWSE_ROUTES = {
    projects: {
      message: 'Here is the portfolio map. These landing pages let you browse the work by discipline before opening a specific example.',
      evidence: [
        { title: 'Projects', path: 'projects/index.html', note: 'Portfolio overview across instructional design, AI evaluation, LMS work, and workflows.' },
        { title: 'Instructional Design', path: 'projects/instructional-design/index.html', note: 'Sales and partner enablement, learner practice, technical translation, and performance support.' },
        { title: 'AI Training and Evaluation', path: 'projects/ai-training-and-evaluation/index.html', note: 'Clear evaluation lenses, rubrics, calibration, and human quality judgment.' },
        { title: 'LMS Administration', path: 'projects/lms-administration/index.html', note: 'Learner journey, access, delivery, records, reporting, and platform operations.' },
        { title: 'Workflows', path: 'projects/workflows/index.html', note: 'Cross-functional delivery, system handoffs, reporting, automation, and human review.' }
      ]
    },
    performanceSupport: {
      message: 'Performance support is part of my instructional-design approach when people need a reliable answer during the work, not just more course time. These pages show the method and related examples.',
      evidence: [
        { title: 'Microlearning and Performance Support', path: 'projects/instructional-design/microlearning-performance-support/index.html', note: 'How I choose focused learning, point-of-need support, or a connected combination.' },
        { title: 'Performance Support', path: 'projects/instructional-design/microlearning-performance-support/performance-support/index.html', note: 'Access, scanability, trust, maintenance, and usable support resources.' },
        { title: 'Product Launch Microlearning', path: 'projects/instructional-design/microlearning-performance-support/product-launch-microlearning/index.html', note: 'Focused launch learning connected to practical next-step support.' }
      ]
    }
  };

  const browseIntentFor = (query) => {
    const allTokens = allTokensFor(query);
    const has = (value) => allTokens.includes(value);
    const asksForExperience = ['experience', 'examples', 'portfolio', 'project', 'projects', 'work'].some(has);
    if (has('performance') && has('support') && asksForExperience) return BROWSE_ROUTES.performanceSupport;
    if (!tokensFor(query).length && ['example', 'examples', 'portfolio', 'project', 'projects', 'work'].some(has)) {
      return BROWSE_ROUTES.projects;
    }
    return null;
  };

  const routeQuestion = (query) => {
    const browseRoute = browseIntentFor(query);
    if (browseRoute) return { type: 'browse', browseRoute, matches: [] };
    const ranked = state.questions
      .map((question) => ({ question, ...scoreQuestionMatch(query, question) }))
      .sort((a, b) => b.score - a.score);
    const matches = ranked.filter(hasSupportedQuestionMatch);
    if (!matches.length) return { type: 'unsupported', matches: [] };
    const top = matches[0];
    const next = matches[1];
    if (next && top.score - next.score < routingPolicy().min_answer_margin) {
      return { type: 'ambiguous', matches: matches.slice(0, 3) };
    }
    return { type: 'answer', matches: [top] };
  };

  const scoreSearchEntry = (query, entry) => {
    const clean = normalize(query);
    const title = normalize(entry.title);
    const keywords = normalize((entry.keywords || []).join(' '));
    let score = 0;
    if (!clean) return score;
    if (phraseMatch(clean, title)) score += 12;
    if (phraseMatch(clean, keywords)) score += 9;
    tokensFor(query).forEach((token) => {
      if (fieldHasToken(title, token)) score += 5;
      if (fieldHasToken(keywords, token)) score += 3;
    });
    return score;
  };

  const elements = {
    count: document.querySelector('[data-hm-question-count]'),
    libraryToggle: document.querySelector('[data-hm-library-toggle]'),
    library: document.querySelector('[data-hm-library]'),
    libraryClose: document.querySelector('[data-hm-library-close]'),
    librarySummary: document.querySelector('[data-hm-library-summary]'),
    topicList: document.querySelector('[data-hm-topic-list]'),
    promptPanel: document.querySelector('[data-hm-prompt-panel]'),
    starters: document.querySelector('[data-hm-starters]'),
    chatLog: document.querySelector('[data-hm-chat-log]'),
    form: document.querySelector('[data-hm-form]'),
    input: document.querySelector('[data-hm-input]'),
    clear: document.querySelector('[data-hm-clear]'),
    scanButtons: [...document.querySelectorAll('[data-hm-scan-view]')],
    scanPanels: [...document.querySelectorAll('[data-hm-scan-panel]')],
    capabilityTabs: document.querySelector('[data-hm-capability-tabs]'),
    capabilityDetail: document.querySelector('[data-hm-capability-detail]'),
    toolTabs: document.querySelector('[data-hm-tool-tabs]'),
    toolDetail: document.querySelector('[data-hm-tool-detail]'),
    evidenceDrawer: document.querySelector('[data-hm-evidence-drawer]'),
    evidenceOverlay: document.querySelector('[data-hm-evidence-overlay]'),
    evidenceClose: document.querySelector('[data-hm-evidence-close]'),
    evidenceTitle: document.querySelector('[data-hm-evidence-title]'),
    evidenceType: document.querySelector('[data-hm-evidence-type]'),
    evidenceSummary: document.querySelector('[data-hm-evidence-summary]'),
    evidenceNote: document.querySelector('[data-hm-evidence-note]'),
    evidenceVisual: document.querySelector('[data-hm-evidence-visual]'),
    evidenceOpen: document.querySelector('[data-hm-evidence-open]'),
    evidenceChat: document.querySelector('[data-hm-evidence-chat]')
  };

  if (!elements.chatLog || !elements.form || !elements.input || !elements.starters) return;

  const pixelUrl = (name) => new URL(name, pixelRoot).href;

  const safeSessionRead = () => {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  };

  const saveSession = () => {
    try {
      const payload = {
        chatStarted: state.chatStarted,
        chatHtml: elements.chatLog.innerHTML,
        chatScrollTop: elements.chatLog.scrollTop,
        activeCapability: state.activeCapability,
        activeTool: state.activeTool,
        activeScanView: state.activeScanView,
        expandedChips: state.expandedChips,
        lastEvidence: state.lastEvidence,
        updatedAt: Date.now()
      };
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch (error) {
      // sessionStorage is a progressive enhancement; the chat still works without it.
    }
  };

  const clearSession = () => {
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch (error) {}
  };

  const categoryFromPath = (path) => {
    const value = String(path || '').toLowerCase();
    if (value.includes('ai-training')) return 'AI Training + Evaluation';
    if (value.includes('lms-administration')) return 'LMS + Learning Operations';
    if (value.includes('workflows')) return 'Systems + Workflow';
    if (value.includes('live-training')) return 'Live Training';
    if (value.includes('microlearning')) return 'Microlearning';
    if (value.includes('instructional-design')) return 'Instructional Design';
    return 'Portfolio project';
  };

  const visualMarkup = (visual) => {
    if (!visual) return '';
    return `
      <div class="hm-scan-visual" aria-label="${escapeHtml(visual.caption)}">
        <span class="hm-scan-visual-caption">${escapeHtml(visual.caption)}</span>
        <div class="hm-scan-visual-route">
          ${visual.nodes.map(([icon,label]) => `
            <span class="hm-scan-node"><i><img src="${pixelUrl(icon)}" alt=""></i><small>${escapeHtml(label)}</small></span>
          `).join('')}
        </div>
      </div>`;
  };

  const chipGroupMarkup = (values, visibleCount, key) => {
    const list = Array.isArray(values) ? values : [];
    const expanded = Boolean(state.expandedChips[key]);
    const shown = expanded ? list : list.slice(0, visibleCount);
    const remaining = Math.max(0, list.length - visibleCount);
    return `
      <div class="hm-chip-group">
        ${shown.map((value) => `<span>${escapeHtml(value)}</span>`).join('')}
        ${remaining ? `<button type="button" class="hm-more-toggle" data-hm-expand-key="${escapeHtml(key)}">${expanded ? 'Show less' : `+${remaining} more`}</button>` : ''}
      </div>`;
  };

  const bindExpandButtons = (rootNode) => {
    rootNode.querySelectorAll('[data-hm-expand-key]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.dataset.hmExpandKey;
        state.expandedChips[key] = !state.expandedChips[key];
        saveSession();
        if (key.startsWith('cap:')) renderCapability(state.activeCapability);
        else renderTool(state.activeTool);
      });
    });
  };

  const closeEvidencePreview = ({ returnToChat = false } = {}) => {
    if (!elements.evidenceDrawer || !elements.evidenceOverlay) return;
    elements.evidenceDrawer.classList.remove('open');
    elements.evidenceDrawer.setAttribute('aria-hidden', 'true');
    elements.evidenceOverlay.hidden = true;
    document.body.classList.remove('hm-preview-open');
    if (returnToChat) {
      document.querySelector('#ask-haley')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => elements.input?.focus(), reducedMotion ? 0 : 280);
    }
  };

  const hydrateEvidencePreview = async (item) => {
    const target = new URL(item.path, root);
    const normalizedPath = normalizeEvidencePath(item.path);
    const curated = EVIDENCE_PREVIEWS[normalizedPath] || null;
    elements.evidenceTitle.textContent = item.title || 'Portfolio project';
    elements.evidenceType.textContent = curated?.type || categoryFromPath(item.path);
    elements.evidenceNote.textContent = item.note || 'This public project supports the answer you were reviewing.';
    elements.evidenceSummary.textContent = 'Loading the public project summary…';
    const fullUrl = new URL(target.href);
    fullUrl.searchParams.set('from', 'ask-haley');
    elements.evidenceOpen.href = fullUrl.href;
    elements.evidenceChat.textContent = state.chatStarted ? 'Back to chat' : 'Start chat';

    if (curated?.image) {
      const resolved = new URL(curated.image, root).href;
      elements.evidenceVisual.innerHTML = `<img src="${escapeHtml(resolved)}" alt="Preview of ${escapeHtml(item.title || 'portfolio project')}">`;
    } else {
      elements.evidenceVisual.innerHTML = `
        <div class="hm-evidence-preview-placeholder hm-evidence-preview-fallback">
          <span class="hm-icon-bubble"><img src="${pixelUrl(categoryFromPath(item.path).includes('AI') ? 'idea-bulb.webp' : categoryFromPath(item.path).includes('LMS') ? 'workflow-tree.webp' : categoryFromPath(item.path).includes('Workflow') ? 'analytics-growth.webp' : 'document-star.webp')}" alt=""></span>
          <strong>${escapeHtml(item.title || 'Portfolio project')}</strong>
          <span>${escapeHtml(categoryFromPath(item.path))}</span>
        </div>`;
    }

    try {
      const response = await fetch(target.href);
      if (!response.ok) throw new Error('Preview fetch failed');
      const markup = await response.text();
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      const description = doc.querySelector('meta[name="description"]')?.content || doc.querySelector('main p')?.textContent?.trim();
      elements.evidenceSummary.textContent = description || 'Open the full project for the complete public case study and interaction details.';
    } catch (error) {
      elements.evidenceSummary.textContent = 'Open the full project for the complete public case study and interaction details.';
    }
  };

  const openEvidencePreview = (item) => {
    if (!elements.evidenceDrawer || !elements.evidenceOverlay) return;
    state.lastEvidence = item;
    saveSession();
    elements.evidenceOverlay.hidden = false;
    elements.evidenceDrawer.classList.add('open');
    elements.evidenceDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('hm-preview-open');
    hydrateEvidencePreview(item);
    window.setTimeout(() => elements.evidenceClose?.focus(), 20);
  };

  const bindEvidenceCards = (rootNode) => {
    rootNode.querySelectorAll('[data-hm-evidence-card]').forEach((card) => {
      card.addEventListener('click', () => openEvidencePreview({
        title: card.dataset.evidenceTitle,
        path: card.dataset.evidencePath,
        note: card.dataset.evidenceNote
      }));
    });
  };

  const scrollChat = () => {
    requestAnimationFrame(() => {
      elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
    });
  };

  const setLibraryOpen = (open) => {
    const isOpen = Boolean(open);
    if (elements.library) elements.library.hidden = !isOpen;
    if (elements.libraryToggle) elements.libraryToggle.setAttribute('aria-expanded', String(isOpen));
  };

  const appendUser = (text) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-user';
    article.innerHTML = `
      <div class="hm-message-label">Hiring manager</div>
      <div class="hm-message-bubble">${escapeHtml(text)}</div>`;
    elements.chatLog.appendChild(article);
    state.chatStarted = true;
    scrollChat();
    saveSession();
  };

  const evidenceMarkup = (items = []) => {
    if (!items.length) return '';
    return `
      <div class="hm-evidence">
        <p class="hm-evidence-label">Portfolio evidence</p>
        <div class="hm-evidence-grid">
          ${items.map((item) => `
            <button type="button" class="hm-evidence-card" data-hm-evidence-card data-evidence-path="${escapeHtml(item.path)}" data-evidence-title="${escapeHtml(item.title)}" data-evidence-note="${escapeHtml(item.note || '')}">
              <img src="${pixelUrl('document-star.webp')}" alt="">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.note)}</span>
              <em>Preview evidence →</em>
            </button>`).join('')}
        </div>
      </div>`;
  };
  const followupMarkup = (question) => {
    let related = (question.followups || [])
      .map((id) => state.questions.find((item) => item.id === id))
      .filter(Boolean);

    if (!related.length) {
      related = state.questions
        .filter((item) => item.id !== question.id && item.category === question.category)
        .slice(0, 3);
    } else {
      related = related.slice(0, 3);
    }

    if (!related.length) return '';
    return `
      <div class="hm-followups">
        <span>Keep the interview going</span>
        <div>
          ${related.map((item) => `<button type="button" data-hm-question-id="${escapeHtml(item.id)}">${escapeHtml(item.short_label)}</button>`).join('')}
        </div>
      </div>`;
  };

  const typingMessage = () => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley hm-typing-message';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble"><span class="hm-typing" aria-label="Preparing answer"><i></i><i></i><i></i></span></div>`;
    elements.chatLog.appendChild(article);
    scrollChat();
    return article;
  };

  const bindQuestionButtons = (rootNode) => {
    rootNode.querySelectorAll('[data-hm-question-id]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.hmQuestionId));
    });
  };

  const answerNow = (question, typing) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    const tag = question.specialist ? 'Deep Dive' : question.category;
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">${escapeHtml(tag)}</span>
        <p>${escapeHtml(question.answer)}</p>
        ${evidenceMarkup(question.evidence)}
        ${followupMarkup(question)}
      </div>`;
    typing.replaceWith(article);
    bindQuestionButtons(article);
    bindEvidenceCards(article);
    state.replying = false;
    scrollChat();
    saveSession();
  };

  const ambiguousNow = (matches, typing) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">Choose a topic</span>
        <p>I found a few related interview topics. Choose the one closest to what you mean so I can keep the answer specific.</p>
        <div class="hm-followups"><div>${matches.map((item) => `<button type="button" data-hm-question-id="${escapeHtml(item.question.id)}">${escapeHtml(item.question.short_label)}</button>`).join('')}</div></div>
      </div>`;
    typing.replaceWith(article);
    bindQuestionButtons(article);
    state.replying = false;
    scrollChat();
    saveSession();
  };

  const browseNow = (browseRoute, typing) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">Browse the portfolio</span>
        <p>${escapeHtml(browseRoute.message)}</p>
        ${evidenceMarkup(browseRoute.evidence)}
      </div>`;
    typing.replaceWith(article);
    bindEvidenceCards(article);
    state.replying = false;
    scrollChat();
    saveSession();
  };

  const boundaryNow = (reason) => {
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    const message = reason === 'length'
      ? 'Please keep the question under 480 characters so I can match it to one focused interview topic.'
      : reason === 'spam'
        ? 'Please enter one clear, respectful hiring question so I can match it to the right evidence.'
        : 'This guide is for respectful, work-related hiring questions. Try asking about projects, decisions, tools, systems, or working style.';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble"><span class="hm-answer-tag">Professional questions only</span><p>${escapeHtml(message)}</p></div>`;
    elements.chatLog.appendChild(article);
    scrollChat();
    saveSession();
  };

  const inputBoundary = (query) => {
    const raw = String(query || '').normalize('NFKC').trim();
    if (raw.length > routingPolicy().max_input_length) return 'length';
    if (PROFESSIONAL_BOUNDARY_PATTERN.test(raw)) return 'professional';
    const repeatedLimit = routingPolicy().max_repeated_character_run;
    if (new RegExp(`(.)\\1{${repeatedLimit},}`, 'u').test(raw)) return 'spam';
    const tokens = normalize(raw).split(' ').filter(Boolean);
    const counts = new Map();
    tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
    if ([...counts.values()].some((count) => count > routingPolicy().max_repeated_token_count)) return 'spam';
    return null;
  };

  const fallbackNow = (query, typing) => {
    const matches = state.searchEntries
      .map((entry) => ({ entry, score: scoreSearchEntry(query, entry) }))
      .filter((item) => item.score >= routingPolicy().min_search_score)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.entry);

    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">Evidence check</span>
        <p>I do not have a supported interview answer for that exact question, so I would rather point you toward the closest published work than make something up.</p>
        ${matches.length ? `
          <div class="hm-evidence">
            <p class="hm-evidence-label">Closest portfolio matches</p>
            <div class="hm-evidence-grid">
              ${matches.map((entry) => `
                <button type="button" class="hm-evidence-card" data-hm-evidence-card data-evidence-path="${escapeHtml(entry.path)}" data-evidence-title="${escapeHtml(entry.title)}" data-evidence-note="${escapeHtml(entry.summary)}">
                  <img src="${pixelUrl('reference-search.webp')}" alt="">
                  <strong>${escapeHtml(entry.title)}</strong>
                  <span>${escapeHtml(entry.summary)}</span>
                  <em>Preview evidence →</em>
                </button>`).join('')}
            </div>
          </div>` : '<p>Try asking about instructional design, sales enablement, LMS work, AI evaluation, facilitation, reporting, collaboration, tools, or automation.</p>'}
      </div>`;
    typing.replaceWith(article);
    bindEvidenceCards(article);
    state.replying = false;
    scrollChat();
    saveSession();
  };
  const ask = (query, options = {}) => {
    const clean = String(query || '').trim();
    if (!clean || state.replying) return;
    setLibraryOpen(false);
    const boundary = inputBoundary(clean);
    if (boundary) {
      boundaryNow(boundary);
      return;
    }
    if (!options.skipUser) appendUser(clean);
    const route = routeQuestion(clean);

    state.replying = true;
    const typing = typingMessage();
    const delay = reducedMotion ? 0 : 300;
    window.setTimeout(() => {
      if (route.type === 'answer') answerNow(route.matches[0].question, typing);
      else if (route.type === 'ambiguous') ambiguousNow(route.matches, typing);
      else if (route.type === 'browse') browseNow(route.browseRoute, typing);
      else fallbackNow(clean, typing);
    }, delay);
  };

  const askById = (id) => {
    if (state.replying) return;
    const question = state.questions.find((item) => item.id === id);
    if (!question) return;
    appendUser(question.prompt);
    state.replying = true;
    setLibraryOpen(false);
    const typing = typingMessage();
    window.setTimeout(() => answerNow(question, typing), reducedMotion ? 0 : 260);
  };

  const resetChat = ({ clearStoredSession = true } = {}) => {
    state.replying = false;
    state.chatStarted = false;
    state.lastEvidence = null;
    elements.chatLog.innerHTML = '';
    const article = document.createElement('article');
    article.className = 'hm-message hm-message-haley';
    article.innerHTML = `
      <div class="hm-message-label">Haley</div>
      <div class="hm-message-bubble">
        <span class="hm-answer-tag">Start anywhere</span>
        <p>Ask me the question you would normally save for the interview. I can answer from the curated library and link you to the portfolio work behind the answer.</p>
      </div>`;
    elements.chatLog.appendChild(article);
    if (clearStoredSession) clearSession();
  };
  const topicGroups = () => {
    const groups = new Map();
    const featured = state.questions.filter((question) => question.featured && !question.specialist);
    if (featured.length) groups.set('Featured', featured);

    state.questions.filter((question) => !question.specialist).forEach((question) => {
      if (!groups.has(question.category)) groups.set(question.category, []);
      groups.get(question.category).push(question);
    });

    const deepDive = state.questions.filter((question) => question.specialist);
    if (deepDive.length) groups.set('Deep Dive', deepDive);
    return [...groups.entries()].map(([label, questions]) => ({ label, questions }));
  };

  const renderPromptPanel = () => {
    if (!elements.promptPanel) return;
    const groups = topicGroups();
    const group = groups.find((item) => item.label === state.activeTopic) || groups[0];
    if (!group) return;

    elements.promptPanel.innerHTML = `
      <div class="hm-prompt-heading">
        <p class="eyebrow">${escapeHtml(group.label)}</p>
        <h4>${group.label === 'Featured' ? 'Good questions to start with' : `${escapeHtml(group.label)} questions`}</h4>
      </div>
      <div class="hm-prompt-list">
        ${group.questions.map((question) => `
          <button type="button" class="hm-library-prompt" data-hm-library-question="${escapeHtml(question.id)}">${escapeHtml(question.prompt)}</button>
        `).join('')}
      </div>`;

    elements.promptPanel.querySelectorAll('[data-hm-library-question]').forEach((button) => {
      button.addEventListener('click', () => askById(button.dataset.hmLibraryQuestion));
    });
  };

  const renderLibrary = () => {
    const groups = topicGroups();
    if (!groups.length || !elements.topicList) return;
    if (!groups.some((item) => item.label === state.activeTopic)) state.activeTopic = groups[0].label;

    elements.topicList.innerHTML = groups.map((group) => `
      <button type="button" class="hm-topic-button ${group.label === state.activeTopic ? 'active' : ''}" data-hm-topic="${escapeHtml(group.label)}">
        <span>${escapeHtml(group.label)}</span><span>${group.questions.length}</span>
      </button>
    `).join('');

    elements.topicList.querySelectorAll('[data-hm-topic]').forEach((button) => {
      button.addEventListener('click', () => {
        state.activeTopic = button.dataset.hmTopic;
        renderLibrary();
      });
    });

    renderPromptPanel();
    if (elements.librarySummary) {
      const totalTopics = groups.length;
      elements.librarySummary.textContent = `${state.questions.length} curated prompts across ${totalTopics} topics`;
    }
  };

  const renderStarters = () => {
    const preferred = STARTER_IDS
      .map((id) => state.questions.find((item) => item.id === id))
      .filter(Boolean);

    const fill = state.questions
      .filter((item) => item.featured && !preferred.some((chosen) => chosen.id === item.id))
      .slice(0, Math.max(0, 5 - preferred.length));

    const starters = [...preferred, ...fill].slice(0, 5);
    elements.starters.innerHTML = starters.map((question) => `
      <button type="button" class="hm-starter" data-hm-question-id="${escapeHtml(question.id)}">${escapeHtml(question.short_label)}</button>
    `).join('');
    bindQuestionButtons(elements.starters);
  };

  const renderCapability = (id) => {
    const item = state.capabilities.find((capability) => capability.id === id) || state.capabilities[0];
    if (!item || !elements.capabilityDetail) return;
    state.activeCapability = item.id;
    const icon = CAPABILITY_ICONS[item.id] || 'target.webp';
    const visual = CAPABILITY_VISUALS[item.id] || CAPABILITY_VISUALS['learning-architecture'];
    elements.capabilityDetail.innerHTML = `
      <div class="hm-scan-detail-head">
        <span class="hm-icon-bubble hm-scan-detail-icon"><img src="${pixelUrl(icon)}" alt=""></span>
        <div>
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <h3>${escapeHtml(item.headline)}</h3>
        </div>
      </div>
      <div class="hm-scan-detail-body">
        <div class="hm-scan-copy">
          <span class="hm-scan-label">How this shows up in my work</span>
          <p>${escapeHtml(item.proof)}</p>
          ${chipGroupMarkup(item.skills, 5, `cap:${item.id}`)}
        </div>
        ${visualMarkup(visual)}
      </div>`;
    bindExpandButtons(elements.capabilityDetail);
    elements.capabilityTabs?.querySelectorAll('[data-hm-capability]').forEach((button) => {
      const active = button.dataset.hmCapability === item.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    saveSession();
  };

  const renderCapabilities = () => {
    if (!elements.capabilityTabs || !state.capabilities.length) return;
    elements.capabilityTabs.innerHTML = state.capabilities.map((item) => {
      const icon = CAPABILITY_ICONS[item.id] || 'target.webp';
      return `
        <button type="button" role="tab" aria-selected="false" class="hm-capability-tab" data-hm-capability="${escapeHtml(item.id)}">
          <span class="hm-tab-icon-bubble"><img src="${pixelUrl(icon)}" alt=""></span><span>${escapeHtml(item.label)}</span>
        </button>`;
    }).join('');
    elements.capabilityTabs.querySelectorAll('[data-hm-capability]').forEach((button) => {
      button.addEventListener('click', () => renderCapability(button.dataset.hmCapability));
    });
    renderCapability(state.activeCapability || state.capabilities[0].id);
  };
  const renderTool = (id) => {
    const item = state.tools.find((tool) => tool.id === id) || state.tools[0];
    if (!item || !elements.toolDetail) return;
    state.activeTool = item.id;
    const index = Math.max(0, state.tools.findIndex((tool) => tool.id === item.id));
    const icon = TOOL_ICONS[index % TOOL_ICONS.length];
    const visual = TOOL_VISUALS[item.id] || TOOL_VISUALS.authoring;
    elements.toolDetail.innerHTML = `
      <div class="hm-scan-detail-head">
        <span class="hm-icon-bubble hm-scan-detail-icon"><img src="${pixelUrl(icon)}" alt=""></span>
        <div>
          <p class="eyebrow">${escapeHtml(item.label)}</p>
          <h3>${escapeHtml(item.summary)}</h3>
        </div>
      </div>
      <div class="hm-scan-detail-body">
        <div class="hm-scan-copy">
          ${item.hands_on?.length ? `<span class="hm-scan-label">Hands-on</span>${chipGroupMarkup(item.hands_on, 6, `tool:${item.id}:hands`)}` : ''}
          ${item.capabilities?.length ? `<span class="hm-scan-label hm-scan-label-spaced">What I use it for</span>${chipGroupMarkup(item.capabilities, 5, `tool:${item.id}:caps`)}` : ''}
        </div>
        ${visualMarkup(visual)}
      </div>`;
    bindExpandButtons(elements.toolDetail);
    elements.toolTabs?.querySelectorAll('[data-hm-tool]').forEach((button) => {
      const active = button.dataset.hmTool === item.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    saveSession();
  };

  const renderTools = () => {
    if (!elements.toolTabs || !state.tools.length) return;
    elements.toolTabs.innerHTML = state.tools.map((item, index) => `
      <button type="button" role="tab" aria-selected="false" class="hm-tool-tab" data-hm-tool="${escapeHtml(item.id)}">
        <span class="hm-tab-icon-bubble"><img src="${pixelUrl(TOOL_ICONS[index % TOOL_ICONS.length])}" alt=""></span><span>${escapeHtml(item.label)}</span>
      </button>
    `).join('');
    elements.toolTabs.querySelectorAll('[data-hm-tool]').forEach((button) => {
      button.addEventListener('click', () => renderTool(button.dataset.hmTool));
    });
    renderTool(state.activeTool || state.tools[0].id);
  };
  const setScanView = (view) => {
    state.activeScanView = view;
    elements.scanButtons.forEach((button) => {
      const active = button.dataset.hmScanView === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    elements.scanPanels.forEach((panel) => {
      const active = panel.dataset.hmScanPanel === view;
      panel.hidden = !active;
      panel.classList.toggle('active', active);
    });
    saveSession();
  };

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = elements.input.value.trim();
    if (!value) return;
    elements.input.value = '';
    ask(value);
  });

  elements.clear?.addEventListener('click', () => resetChat({ clearStoredSession: true }));
  elements.evidenceClose?.addEventListener('click', () => closeEvidencePreview());
  elements.evidenceOverlay?.addEventListener('click', () => closeEvidencePreview());
  elements.evidenceChat?.addEventListener('click', () => closeEvidencePreview({ returnToChat: true }));
  elements.evidenceOpen?.addEventListener('click', () => saveSession());
  elements.libraryToggle?.addEventListener('click', () => {
    const open = elements.library?.hidden !== false;
    setLibraryOpen(open);
  });
  elements.libraryClose?.addEventListener('click', () => setLibraryOpen(false));
  elements.scanButtons.forEach((button) => {
    button.addEventListener('click', () => setScanView(button.dataset.hmScanView));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && elements.evidenceDrawer?.classList.contains('open')) closeEvidencePreview();
    else if (event.key === 'Escape' && elements.library?.hidden === false) setLibraryOpen(false);
  });

  let chatScrollTimer = null;
  elements.chatLog.addEventListener('scroll', () => {
    window.clearTimeout(chatScrollTimer);
    chatScrollTimer = window.setTimeout(saveSession, 120);
  });
  window.addEventListener('beforeunload', saveSession);

  const load = async () => {
    try {
      const fetchJson = (url) => fetch(url).then((response) => {
        if (!response.ok) throw new Error(`Could not load ${url.pathname}`);
        return response.json();
      });
      const [faq, expanded, specialist, capabilities, tools, search, policy] = await Promise.all(
        [
          fetchJson(urls.faq),
          fetchJson(urls.expanded),
          fetchJson(urls.specialist),
          fetchJson(urls.capabilities),
          fetchJson(urls.tools),
          fetchJson(urls.search),
          fetchJson(urls.routingPolicy).catch(() => DEFAULT_ROUTING_POLICY)
        ]
      );

      state.questions = [
        ...(faq.questions || []).map((item) => ({ ...item, specialist: false })),
        ...(expanded.questions || []).map((item) => ({ ...item, specialist: false })),
        ...(specialist.questions || []).map((item) => ({ ...item, specialist: true }))
      ];
      state.searchEntries = search.entries || [];
      state.capabilities = capabilities.pillars || [];
      state.tools = tools.groups || [];
      state.learningStatement = tools.learning_statement || '';
      state.routingPolicy = normalizeRoutingPolicy(policy);
      elements.input.maxLength = String(state.routingPolicy.max_input_length);

      if (elements.count) elements.count.textContent = state.questions.length;
      const saved = safeSessionRead();
      if (saved) {
        state.chatStarted = Boolean(saved.chatStarted);
        state.activeCapability = saved.activeCapability || null;
        state.activeTool = saved.activeTool || null;
        state.activeScanView = saved.activeScanView || 'capabilities';
        state.expandedChips = saved.expandedChips || {};
        state.lastEvidence = saved.lastEvidence || null;
      }
      renderLibrary();
      renderStarters();
      renderCapabilities();
      renderTools();
      setScanView(state.activeScanView || 'capabilities');
      if (saved?.chatStarted && saved.chatHtml) {
        elements.chatLog.innerHTML = saved.chatHtml;
        bindQuestionButtons(elements.chatLog);
        bindEvidenceCards(elements.chatLog);
        requestAnimationFrame(() => { elements.chatLog.scrollTop = Number(saved.chatScrollTop || 0); });
      } else {
        resetChat({ clearStoredSession: false });
      }
      const params = new URL(window.location.href).searchParams;
      if (params.get('resume') === '1') {
        window.setTimeout(() => document.querySelector('#ask-haley')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), reducedMotion ? 0 : 180);
      }
    } catch (error) {
      console.error(error);
      elements.chatLog.innerHTML = '<article class="hm-message hm-message-haley"><div class="hm-message-label">Guide unavailable</div><div class="hm-message-bubble"><p>The interview library could not load. Please use the project pages or résumé links instead.</p></div></article>';
    }
  };

  load();
})();
