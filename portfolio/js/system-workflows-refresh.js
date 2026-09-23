(() => {
  const root = '../../assets/icons/pixel/';
  const workIcon = (name) => `${root}work-tools/${name}.webp`;
  const image = (name) => `<img src="${workIcon(name)}" alt="">`;
  const byId = (id) => document.getElementById(id);
  const put = (id, value) => { byId(id).textContent = value; };
  const animate = (node) => { node.classList.remove('is-changing'); void node.offsetWidth; node.classList.add('is-changing'); };
  const tabGroup = (selector, choose) => {
    const buttons = [...document.querySelectorAll(selector)];
    const select = (button, focus = false) => {
      buttons.forEach((item) => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
      choose(button);
      if (focus) button.focus();
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
          ['ArrowRight', 'ArrowDown'].includes(event.key) ? (index + 1) % buttons.length : (index + buttons.length - 1) % buttons.length;
        select(buttons[next], true);
      });
    });
    return { buttons, select };
  };
  const stageGroup = (container, labels, onSelect) => {
    container.innerHTML = labels.map((label, index) => `<button type="button" role="tab" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" class="${index === 0 ? 'active' : ''}" data-stage-index="${index}">${label}</button>`).join('');
    return tabGroup(`#${container.id} [data-stage-index]`, (button) => onSelect(Number(button.dataset.stageIndex)));
  };
  const player = (button, getButtons) => {
    let timer;
    const stop = () => { clearInterval(timer); timer = null; button.textContent = 'Play workflow'; };
    button.addEventListener('click', () => {
      if (timer) { stop(); return; }
      const buttons = getButtons(); let index = 0;
      buttons[index].click(); button.textContent = 'Pause workflow';
      timer = setInterval(() => {
        index += 1;
        if (index >= buttons.length) { stop(); button.textContent = 'Replay workflow'; return; }
        buttons[index].click();
      }, 3500);
    });
    return stop;
  };
  const shell = (brand, name, context, content, type = '') => `<div class="wf-app wf-${type}"><div class="wf-appbar">${brand ? image(brand) : '<span class="wf-appmark">◆</span>'}<strong>${name}</strong><span>${context}</span><b>⋯</b></div>${content}</div>`;
  const panel = (eyebrow, title, body = '') => `<div class="wf-panel"><small>${eyebrow}</small><strong>${title}</strong>${body ? `<p>${body}</p>` : ''}</div>`;
  const row = (title, detail, state = '') => `<div class="wf-row"><span><strong>${title}</strong><small>${detail}</small></span>${state ? `<em>${state}</em>` : ''}</div>`;
  const dots = (items) => `<div class="wf-steps">${items.map((item, i) => `<span class="${i === items.length - 1 ? 'current' : ''}">${String(i + 1).padStart(2, '0')} ${item}</span>`).join('')}</div>`;
  const bars = (values) => `<div class="wf-bars">${values.map((value, i) => `<span style="--w:${value}%;--d:${i * .13}s"></span>`).join('')}</div>`;

  const workplace = {
    microsoft: {
      label: 'Microsoft 365',
      stages: [
        ['Communicate', 'Teams', 'I keep the request, SME question, and next owner visible in the team conversation.'],
        ['Plan', 'Copilot + Planner', 'I turn meeting notes into a dated plan, then check every suggested task and owner.'],
        ['Build', 'PowerPoint', 'I design the slide around one learner decision and keep source wording in view.'],
        ['Document', 'SharePoint', 'I store the approved source, working version, and update owner in a shared library.'],
        ['Analyze', 'Excel', 'I inspect source rows and exceptions before presenting any completion summary.'],
        ['Measure', 'Power BI', 'I pair the headline metric with its denominator, trend, and follow-up queue.']
      ]
    },
    google: {
      label: 'Google Workspace',
      stages: [
        ['Communicate', 'Gmail', 'I capture the audience, learning need, source owner, and deadline from the request.'],
        ['Plan', 'Calendar', 'I schedule SME review and launch milestones before the build begins.'],
        ['Build', 'Slides', 'I build a visual sequence that makes the learner action easy to follow.'],
        ['Review', 'Docs', 'I resolve suggestions against the approved source and keep the decision in context.'],
        ['Launch', 'Sites', 'I preview the learning page and test access to every embedded resource before publishing.'],
        ['Documentation', 'Drive', 'I keep the brief, source assets, and approved release easy to find and update.'],
        ['Analyze', 'Sheets', 'I filter exceptions and assign follow-up rather than hiding them in an average.'],
        ['Measure', 'Forms', 'I ask a short performance question and use the responses to guide a revision.']
      ]
    }
  };
  const workplaceScenes = {
    microsoft: [
      () => shell('teams', 'Teams', 'Training launch / General', `<div class="wf-split wf-teams"><aside class="wf-nav"><b>Teams</b><span>Activity</span><span>Chat</span><span class="selected">Field enablement</span><span>Meetings</span></aside><div class="wf-main"><small>PROJECT CONVERSATION · TODAY</small><div class="wf-bubble">We need a short product update for the field team.</div><div class="wf-bubble outgoing">I will scope the learner action. Who owns the approved facts?</div><div class="wf-meeting">◉ &nbsp; SME alignment meeting <span>Join · 2:00 PM</span></div><div class="wf-chat-compose">Message the team <b>➤</b></div></div></div>`, 'teams'),
      () => shell(null, 'Microsoft 365 Copilot', 'Meeting recap → checked plan', `<div class="wf-split wf-copilot"><div class="wf-main"><small>MEETING NOTES · PRODUCT UPDATE</small>${row('Decision', 'Practice a discovery question before a recommendation', 'Confirmed')}${row('Open question', 'SME to verify product terminology', 'Needs owner')}<div class="wf-prompt">Summarize milestones and proposed owners <b>✦</b></div></div><aside class="wf-side"><small>PLANNER · DRAFT SCHEDULE</small>${dots(['Brief','SME review','Build','Launch'])}${row('Script sign-off', 'Oct 02 · SME', 'Review')}${row('Slide build', 'Oct 06 · Designer', 'Blocked')}<div class="wf-check">✓ Check dates and owners before sharing</div></aside></div>`, 'copilot'),
      () => shell('powerpoint', 'PowerPoint', 'Product scenario.pptx', `<div class="wf-ribbon">File &nbsp; Home &nbsp; Insert &nbsp; Design &nbsp; Transitions &nbsp; Review <span>Share</span></div><div class="wf-slide-layout"><aside class="wf-thumbs"><span>01<br>Context</span><span class="active">02<br>Choose</span><span>03<br>Feedback</span></aside><div class="wf-slide"><small>02 / CUSTOMER CONVERSATION</small><h3>Ask before recommending.</h3><div class="wf-slide-objects"><div class="wf-person">◉<br>Customer</div><div class="wf-question">What constraint shapes your decision?</div><div class="wf-arrow">→</div></div><div class="wf-slide-footer">Learner choice → feedback</div></div><aside class="wf-designpane"><small>DESIGN IDEAS</small><div></div><div></div><div></div></aside></div>`, 'powerpoint'),
      () => shell('sharepoint', 'SharePoint', 'Learning / Product training', `<div class="wf-ribbon">Home &nbsp; Documents &nbsp; Pages &nbsp; Site contents <span>+ New</span></div><div class="wf-library"><aside class="wf-nav"><b>Site navigation</b><span>Overview</span><span class="selected">Documents</span><span>Release notes</span></aside><div class="wf-main"><small>DOCUMENT LIBRARY · PRODUCT UPDATE</small>${row('Approved source.docx', 'SME owned · version 04', 'Approved')}${row('Scenario deck.pptx', 'Designer owned · version 07', 'Working')}${row('Launch package.zip', 'L&D owned · release 01', 'Current')}<div class="wf-file-path">Knowledge base / Product training / Current release</div></div></div>`, 'sharepoint'),
      () => shell('excel', 'Excel', 'Training status.xlsx', `<div class="wf-ribbon">Home &nbsp; Insert &nbsp; Data &nbsp; Review &nbsp; View <span>Filter: Needs action</span></div><div class="wf-sheet"><div class="wf-cell head">ID</div><div class="wf-cell head">Course</div><div class="wf-cell head">Status</div><div class="wf-cell head">Owner</div><div class="wf-cell">0142</div><div class="wf-cell">Product update</div><div class="wf-cell">Complete</div><div class="wf-cell">L&D</div><div class="wf-cell">0143</div><div class="wf-cell">Product update</div><div class="wf-cell alert">Access issue</div><div class="wf-cell">Admin</div><div class="wf-cell">0144</div><div class="wf-cell">Product update</div><div class="wf-cell alert">No record</div><div class="wf-cell">L&D</div><div class="wf-selection"></div></div><div class="wf-status">2 exceptions · source rows retained</div>`, 'excel'),
      () => shell(null, 'Power BI', 'Training operations / Overview', `<div class="wf-dashboard"><div class="wf-metric"><small>COMPLETION</small><strong>86%</strong><span>43 / 50 assigned learners</span></div><div class="wf-metric"><small>OPEN EXCEPTIONS</small><strong>7</strong><span>Access, missing record, overdue</span></div><div class="wf-chart"><small>WEEKLY TREND</small>${bars([28,42,56,67,86])}<div class="wf-axis">W1 &nbsp; W2 &nbsp; W3 &nbsp; W4 &nbsp; W5</div></div><div class="wf-queue"><small>FOLLOW-UP QUEUE</small>${row('Access issue', 'Admin · 3 learners', 'Open')}${row('Missing record', 'L&D · 4 learners', 'Check')}</div></div>`, 'powerbi')
    ],
    google: [
      () => shell('gmail', 'Gmail', 'Inbox / Training request', `<div class="wf-split wf-gmail"><aside class="wf-nav"><b>Compose</b><span class="selected">Inbox</span><span>Starred</span><span>Sent</span></aside><div class="wf-main"><small>FROM · FIELD ENABLEMENT</small><h3>Product training update</h3><p>Can we update the scenario before the field launch?</p>${panel('MY REPLY DRAFT', 'Clarify before building', 'Who is the audience, what decision must change, and who approves the source?')}<div class="wf-send">Send reply →</div></div></div>`, 'gmail'),
      () => shell('google-drive', 'Google Calendar', 'October / Training launch', `<div class="wf-calendar"><div class="wf-calendar-head"><b>MON</b><b>TUE</b><b>WED</b><b>THU</b><b>FRI</b></div><div class="wf-calendar-days"><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span></span><span class="event">SME source review</span><span></span><span class="event build">Slide build</span><span></span><span></span><span></span><span class="event launch">Learner access test</span><span></span><span></span></div></div>`, 'calendar'),
      () => shell('google-drive', 'Google Slides', 'Product practice / Slide 02', `<div class="wf-ribbon">File &nbsp; Edit &nbsp; View &nbsp; Insert &nbsp; Slide &nbsp; Format <span>Share</span></div><div class="wf-slide-layout wf-google-slides"><aside class="wf-thumbs"><span>01<br>Set up</span><span class="active">02<br>Decision</span><span>03<br>Feedback</span></aside><div class="wf-slide"><small>SCENARIO 02</small><h3>What would you ask next?</h3><div class="wf-options"><span>Recommend a feature</span><span>Ask about the constraint</span><span>Schedule a demo</span></div></div><aside class="wf-designpane"><small>THEME</small><div></div><div></div></aside></div>`, 'slides'),
      () => shell('google-docs', 'Google Docs', 'Script / Suggesting mode', `<div class="wf-split wf-docs"><div class="wf-main wf-paper"><small>SCENARIO SCRIPT · VERSION 03</small><h3>Customer discovery</h3><p>Ask the customer about the <del>solution</del> <ins>constraint</ins> before recommending a product.</p><div class="wf-lines"><i></i><i></i><i></i></div></div><aside class="wf-side">${panel('SME SUGGESTION', 'Use source approved wording', 'The need is still being defined at this point.')}<div class="wf-check">✓ Checked against approved brief</div></aside></div>`, 'docs'),
      () => shell(null, 'Google Sites', 'Field onboarding / Learning hub', `<div class="wf-classroom"><div class="wf-class-head"><small>SITE EDITOR · PRODUCT TRAINING</small><strong>Product conversation practice</strong></div><div class="wf-class-card"><b>PAGE CONTENT</b><span>Scenario introduction · embedded Slides practice · job aid</span><em>Insert from Drive → preview page</em></div><div class="wf-class-preview"><small>LEARNER PREVIEW</small><strong>Open page → Practice → Job aid</strong><div class="wf-access">✓ Site and embedded file permissions checked</div></div></div>`, 'classroom'),
      () => shell('google-drive', 'Google Drive', 'Shared drive / Training launch', `<div class="wf-library wf-drive"><aside class="wf-nav"><b>+ New</b><span>My Drive</span><span class="selected">Shared drives</span><span>Recent</span></aside><div class="wf-main"><small>TRAINING LAUNCH / SHARED DRIVE</small>${row('01 · Approved sources', 'SME owned', 'View only')}${row('02 · Working scripts', 'Designer owned', 'Edit')}${row('03 · Released assets', 'L&D owned', 'Current')}<div class="wf-file-path">Team owned files · named update owner</div></div></div>`, 'drive'),
      () => shell('google-sheets', 'Google Sheets', 'Learner tracker / Filter view', `<div class="wf-ribbon">File &nbsp; Edit &nbsp; View &nbsp; Insert &nbsp; Data <span>Filter view</span></div><div class="wf-sheet wf-google-sheet"><div class="wf-cell head">ID</div><div class="wf-cell head">Status</div><div class="wf-cell head">Issue</div><div class="wf-cell head">Owner</div><div class="wf-cell">0142</div><div class="wf-cell">Done</div><div class="wf-cell">—</div><div class="wf-cell">L&D</div><div class="wf-cell">0143</div><div class="wf-cell alert">Check</div><div class="wf-cell">Access</div><div class="wf-cell">Admin</div><div class="wf-cell">0144</div><div class="wf-cell alert">Open</div><div class="wf-cell">No response</div><div class="wf-cell">L&D</div><div class="wf-filter"></div></div><div class="wf-status">Filtered: action needed · 2 rows</div>`, 'sheets'),
      () => shell(null, 'Google Forms', 'Product practice pulse / Responses', `<div class="wf-forms"><div class="wf-form-question"><small>QUESTION 1 OF 2</small><h3>Which step was hardest to use on the job?</h3><div><i></i> Asking a discovery question</div><div><i></i> Interpreting the answer</div><div><i></i> Choosing the next action</div></div><div class="wf-form-results"><small>RESPONSES · 28</small><strong>Interpreting the answer</strong>${bars([31,62,20])}<p>Revision priority: add a worked example before the next cohort.</p></div></div>`, 'forms')
    ]
  };
  let workspacePlatform = 'microsoft', workspaceStage = 0, workspaceTabs;
  const workspaceDemo = byId('workspaceDemo');
  const showWorkspace = () => {
    const [stage, tool, caption] = workplace[workspacePlatform].stages[workspaceStage];
    workspaceDemo.dataset.platform = workspacePlatform; workspaceDemo.dataset.stage = stage.toLowerCase();
    put('workspaceWindowTitle', `${workplace[workspacePlatform].label} · ${tool}`);
    byId('workspaceCanvas').innerHTML = workplaceScenes[workspacePlatform][workspaceStage]();
    put('workspaceCaption', caption); animate(workspaceDemo);
  };
  const setWorkspacePlatform = () => {
    workspaceStage = 0;
    const labels = workplace[workspacePlatform].stages.map(([stage, tool]) => `${stage} <small>${tool}</small>`);
    byId('workspaceStageTabs').setAttribute('aria-label', `${workplace[workspacePlatform].label} workflow stages`);
    workspaceTabs = stageGroup(byId('workspaceStageTabs'), labels, (index) => { workspaceStage = index; showWorkspace(); });
    showWorkspace();
  };
  const stopWorkspace = player(byId('workspacePlay'), () => workspaceTabs.buttons);
  tabGroup('[data-workspace-platform]', (button) => { stopWorkspace(); workspacePlatform = button.dataset.workspacePlatform; setWorkspacePlatform(); });
  const hotspotAnswers = {
    source: 'My practice: keep the approved brief and current file in one shared location; link to it from chat.',
    access: 'My practice: name the next owner, editing rights, approver, and learner access path.',
    flow: 'My practice: bring learning into the work channel only after the source and access path are tested.'
  };
  document.querySelectorAll('[data-workspace-hotspot]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-workspace-hotspot]').forEach((item) => item.classList.toggle('active', item === button));
    put('workspaceHotspotAnswer', hotspotAnswers[button.dataset.workspaceHotspot]);
  }));
  setWorkspacePlatform();

  const managementPillars = [
    ['Plan & Scope', 'I turn an intake request into an owned brief, dated milestones, and a visible dependency.', 'Need → scope → schedule', 'Scope agreed'],
    ['Build & Organize', 'I map ADDIE tasks and assets so every production item has an owner and next step.', 'Script sign-off → voiceover', 'Production tracked'],
    ['Review & Approve', 'I keep feedback attached to the asset and wait for a clear reviewer decision.', 'Revision → source check', 'Approval visible'],
    ['Communicate & Align', 'I put blockers and status updates where the team can act on them.', 'Blocker → owner → update', 'Team aligned'],
    ['Track & Report', 'I show overdue work and launch risk alongside progress so leaders can intervene.', 'Portfolio → exception → action', 'Risk visible']
  ];
  const managementTools = {
    asana: ['Forms + Timeline', 'List + Board', 'Approvals + Proofing', 'Comments + Status', 'Portfolios + Dashboards'],
    atlassian: ['JSM + Discovery + Confluence', 'Jira + Confluence', 'Confluence + Jira', 'Jira + Confluence', 'Analytics + Dashboards']
  };
  const managementScenes = {
    asana: [
      () => shell('asana', 'Asana', 'Training request / Form + Timeline', `<div class="wf-split wf-asana-plan"><div class="wf-main">${panel('INTAKE FORM', 'New onboarding request', 'Audience: field team · Goal: better discovery questions')}${row('Source owner', 'Product SME', 'Assigned')}${row('Learning deadline', 'October 20', 'Confirmed')}<div class="wf-submit">Submit → Create project</div></div><aside class="wf-side"><small>TIMELINE + CALENDAR</small>${dots(['Analyze','Design','Develop','Launch'])}${row('Script sign-off', 'Oct 06', 'Milestone')}${row('Voiceover', 'Starts after sign-off', 'Dependent')}</aside></div>`, 'asana'),
      () => shell('asana', 'Asana', 'Course development / ADDIE list + Board', `<div class="wf-split"><aside class="wf-side wf-addie"><small>ADDIE SECTIONS</small><span>Analysis · audience</span><span>Design · storyboard</span><span class="active">Development · assets</span><span>Implementation · LMS</span><span>Evaluation · feedback</span></aside><div class="wf-main"><small>PRODUCTION BOARD · ASSET TYPE FIELD</small><div class="wf-kanban"><div><b>READY</b>${panel('PDF', 'Manager guide')}</div><div><b>IN PROGRESS</b>${panel('ELEARNING', 'Scenario module')}</div><div><b>BLOCKED</b>${panel('AUDIO', 'Voiceover waits for script')}</div></div></div></div>`, 'asana'),
      () => shell('asana', 'Asana', 'Approval + proofing / Scenario screen', `<div class="wf-split wf-proof"><div class="wf-main"><small>VISUAL PROOF · SCREEN 02</small><div class="wf-proof-asset"><h3>Ask before recommending</h3><p>What constraint shapes the customer decision?</p><span>1</span></div></div><aside class="wf-side">${panel('SME COMMENT · PIN 1', 'Check the product term', 'Use the current terminology guide.')}<div class="wf-approval"><b>APPROVAL TASK</b><span>Approve</span><span>Request changes</span></div><div class="wf-check">Rule: Ready for voiceover → assign media developer</div></aside></div>`, 'asana'),
      () => shell('asana', 'Asana', 'Project update / Comments + Status', `<div class="wf-split"><div class="wf-main"><small>TASK COMMENTS · SCENARIO MODULE</small><div class="wf-comment"><b>Designer</b> @SME Can you confirm the example by Thursday?</div><div class="wf-comment reply"><b>SME</b> I added the approved source in the task.</div><div class="wf-mention">Referenced: Product brief · v04</div></div><aside class="wf-side">${panel('PROJECT STATUS', 'At risk', 'Source approval shifted the media start date.')}<div class="wf-status-progress"><i></i></div><small>Next update: revised timeline to stakeholders</small></aside></div>`, 'asana'),
      () => shell('asana', 'Asana', 'Portfolio + Dashboard / L&D programs', `<div class="wf-dashboard wf-asana-dashboard"><div class="wf-metric"><small>ACTIVE INITIATIVES</small><strong>3</strong><span>Onboarding · Product · Compliance</span></div><div class="wf-metric"><small>OVERDUE MILESTONES</small><strong>2</strong><span>Both assigned for follow-up</span></div><div class="wf-chart"><small>ASSETS BY STAGE</small>${bars([75,48,22])}<div class="wf-axis">Build &nbsp;&nbsp; Review &nbsp;&nbsp; Launch</div></div><div class="wf-queue"><small>PORTFOLIO HEALTH</small>${row('Product training', 'SME review due', 'At risk')}${row('Onboarding', 'Pilot scheduled', 'On track')}</div></div>`, 'asana')
    ],
    atlassian: [
      () => shell('confluence', 'Atlassian', 'JSM intake → Product Discovery → Confluence', `<div class="wf-split wf-atl-plan"><div class="wf-main">${panel('JIRA SERVICE MANAGEMENT · PORTAL', 'Request a training program', 'Audience: field team · Problem: discovery conversations')}${row('Impact / effort', 'Product Discovery · Q4 priority', 'Prioritized')}</div><aside class="wf-side">${panel('CONFLUENCE · PROJECT POSTER', 'Why this course exists', 'Learner need · source owners · success measure')}${dots(['Request','Prioritize','Scope'])}</aside></div>`, 'atlassian'),
      () => shell('jira', 'Jira + Confluence', 'Content sprint / Connected page', `<div class="wf-split"><div class="wf-main"><small>JIRA SOFTWARE · CONTENT BOARD</small><div class="wf-kanban"><div><b>TO DO</b>${panel('LND-24', 'Write script')}</div><div><b>IN PROGRESS</b>${panel('LND-25', 'Build quiz')}</div><div><b>REVIEW</b>${panel('LND-26', 'SME check')}</div></div></div><aside class="wf-side">${panel('CONFLUENCE · STORYBOARD', 'Product scenario / Screen 02', 'Script, visual layout, and approved source.')}<div class="wf-smartlink">↗ LND-25 · Build quiz · In progress</div></aside></div>`, 'atlassian'),
      () => shell('confluence', 'Confluence + Jira', 'Inline comment / Review gate', `<div class="wf-split wf-atl-review"><div class="wf-main wf-paper"><small>CONFLUENCE PAGE · SCRIPT · V03</small><h3>Customer discovery</h3><p>Ask about the <mark>constraint</mark> before presenting a solution.</p><div class="wf-comment-pin">1</div><div class="wf-version">Page history · v02 → v03</div></div><aside class="wf-side">${panel('INLINE COMMENT · SME', 'Confirm technical meaning', 'The example must match the approved product guide.')}<div class="wf-gates"><span>Draft</span><span>SME Review</span><span>Ready for LMS</span></div></aside></div>`, 'atlassian'),
      () => shell('jira', 'Jira + Confluence', 'Flagged issue / Release announcement', `<div class="wf-split"><div class="wf-main">${panel('JIRA · LND-26', 'Voiceover blocked', 'Waiting for SME approval of the script.')}<div class="wf-flag">⚑ Flagged for the team · owner: SME</div>${row('Next action', 'Review source wording by Thursday', 'Open')}</div><aside class="wf-side">${panel('CONFLUENCE · ANNOUNCEMENT', 'Product training release notes', 'What changed, who is affected, where to find the new resource.')}<div class="wf-publish">Publish after release check →</div></aside></div>`, 'atlassian'),
      () => shell('jira', 'Atlassian Analytics', 'Jira dashboard + Confluence page analytics', `<div class="wf-dashboard wf-atl-dashboard"><div class="wf-metric"><small>OPEN REQUESTS</small><strong>8</strong><span>JSM intake queue</span></div><div class="wf-metric"><small>LMS ISSUES</small><strong>2</strong><span>Assigned for repair</span></div><div class="wf-chart"><small>CONTENT VELOCITY</small>${bars([35,47,57,70])}<div class="wf-axis">Sprint 1 &nbsp; 2 &nbsp; 3 &nbsp; 4</div></div><div class="wf-queue"><small>CONFLUENCE READINESS</small>${row('Trainer playbook', '18 of 22 viewed', 'Follow up')}${row('Launch guide', 'Current version', 'Ready')}</div></div>`, 'atlassian')
    ]
  };
  let managementPlatform = 'asana', managementStage = 0, managementRole = 'designer', managementTabs;
  const roles = { designer: 'My designer view prioritizes source files, blocked production tasks, and the next review decision.', sme: 'My SME view puts the current draft, exact accuracy question, and due date together.', manager: 'My manager view surfaces launch risk, pending approvals, and upcoming milestones.' };
  const showManagement = () => {
    const [label, description, dependency, state] = managementPillars[managementStage];
    const name = managementPlatform === 'asana' ? 'Asana' : 'Atlassian';
    const iconName = managementPlatform === 'asana' ? 'asana' : 'confluence';
    const demo = byId('managementDemo'); demo.dataset.platform = managementPlatform; demo.dataset.stage = label.toLowerCase().replace(/[^a-z]+/g, '-'); demo.dataset.role = managementRole;
    put('managementWindowTitle', `${name} · Product training launch`); byId('managementIcon').src = workIcon(iconName);
    put('managementStageLabel', `${String(managementStage + 1).padStart(2, '0')} · ${label.toUpperCase()}`);
    put('managementStageTitle', label); put('managementStageText', description); put('managementStageState', state);
    put('managementDependency', dependency); put('managementGate', state);
    put('managementRoleAnswer', roles[managementRole]);
    byId('managementCanvas').innerHTML = managementScenes[managementPlatform][managementStage](); animate(demo);
  };
  managementTabs = stageGroup(byId('managementStageTabs'), managementPillars.map(([label], index) => `${label}<small>${managementTools.asana[index]}</small>`), (index) => { managementStage = index; showManagement(); });
  const stopManagement = player(byId('managementPlay'), () => managementTabs.buttons);
  tabGroup('[data-management-platform]', (button) => {
    stopManagement(); managementPlatform = button.dataset.managementPlatform;
    managementTabs.buttons.forEach((item, index) => { item.querySelector('small').textContent = managementTools[managementPlatform][index]; });
    managementTabs.select(managementTabs.buttons[0]);
  });
  tabGroup('[data-management-role]', (button) => { managementRole = button.dataset.managementRole; showManagement(); });
  showManagement();

  const comments = {
    sme: ['Technical SME', 'The regulatory date needs to reflect the approved 2026 guidance.', 'Update source date'],
    brand: ['Brand reviewer', 'Please use the approved product name on this screen.', 'Check terminology'],
    ld: ['L&D reviewer', 'Explain why the discovery question is the best next step.', 'Improve feedback']
  };
  let reviewStage = 0, reviewComment = 'sme';
  const course = () => `<div class="wf-review-course"><small>INTRODUCTION / PRODUCT CONVERSATIONS</small><h3>Should we recommend a solution yet?</h3><p>Before recommending a product, identify the customer's goal and constraints. Choose the strongest next question.</p><label><i></i> Which outcome matters most to your team?</label><label><i></i> What is the current limitation?</label><label><i></i> Which feature would you like to buy?</label></div>`;
  const reviewBar = (title, badge) => `<div class="wf-review-bar"><span>‹</span><b>${title}</b><span class="wf-review-icon"><img src="${root}workflows/people-collaboration/feedback.webp" alt=""></span><em>${badge}</em></div>`;
  const reviewScene = () => {
    const [person, text, action] = comments[reviewComment];
    if (reviewStage === 0) return `<div class="wf-review-ui wf-review-publish">${reviewBar('Rise 360 / Product conversations', 'AUTHORING')}<div class="wf-review-editor"><aside><small>LESSON OUTLINE</small><span>Introduction</span><span class="active">Scenario practice</span><span>Takeaways</span></aside>${course()}<div class="wf-review-publish-menu"><b>Publish ▾</b><strong>Publish to Review 360</strong><div><span>◉ Create a new item</span><span>○ New version of existing item</span></div><em>Publish for feedback →</em></div></div></div>`;
    if (reviewStage === 1) return `<div class="wf-review-ui wf-review-feedback">${reviewBar('Introduction', 'PREVIEW')}<div class="wf-review-layout">${course()}<aside class="wf-review-sidebar"><small>All Comments ▾</small><div class="wf-review-compose">Add a comment</div><span>Introduction</span><div class="wf-review-card"><b>● &nbsp; ${person}</b><p>${text}</p><small>Screenshot · Screen 02</small><div>Add a reply</div></div><div class="wf-review-card muted"><b>● &nbsp; L&D reviewer</b><p>Can the feedback explain the better choice?</p></div></aside></div></div>`;
    if (reviewStage === 2) return `<div class="wf-review-ui wf-review-track">${reviewBar('Product conversations / Comments', 'REVIEW 360')}<div class="wf-review-filters"><b>Current Version ▾</b><b>Unresolved Comments ▾</b><span>3 open</span></div><div class="wf-review-track-list"><div class="wf-review-track-item"><small>SCREEN 02 · ${person.toUpperCase()}</small><strong>${text}</strong><span>Owner: instructional designer · ${action}</span><button type="button" aria-label="Illustrative resolve control">✓ Resolve after checking</button></div><div class="wf-review-track-item"><small>SCREEN 03 · L&D REVIEWER</small><strong>Explain the feedback after the learner chooses.</strong><span>Owner: instructional designer · Revise feedback</span><button type="button" aria-label="Illustrative resolve control">✓ Resolve after checking</button></div></div></div>`;
    return `<div class="wf-review-ui wf-review-history">${reviewBar('Product conversations / Version history', 'REVIEW 360')}<div class="wf-review-versions"><div><small>VERSION 1 · ORIGINAL</small><h3>Ask about the product.</h3><p>The first version used an outdated date and a broad prompt.</p></div><div class="current"><small>VERSION 2 · REVISED</small><h3>Ask about the customer's constraint.</h3><p>The scenario now uses approved 2026 guidance and specific feedback.</p></div></div><div class="wf-review-resolved"><span>✓ Resolved · ${person}</span><p>${text}</p><b>Instructional designer:</b> Updated the text and visual. Republished for final check.</div></div>`;
  };
  const reviewCaptions = [
    '',
    'I ask reviewers to comment on the exact lesson element that needs a change.',
    'I filter unresolved comments, assign the edit, and check the new build before resolving.',
    'I keep the revision and original feedback together so the decision remains traceable.'
  ];
  const showReview = () => {
    const demo = byId('reviewDemo'); demo.dataset.stage = String(reviewStage);
    byId('reviewScene').innerHTML = reviewScene();
    byId('reviewCommentPicker').hidden = reviewStage !== 1 && reviewStage !== 2;
    byId('reviewCaption').hidden = reviewStage === 0;
    put('reviewCaption', reviewCaptions[reviewStage]); animate(demo);
  };
  tabGroup('[data-review-stage]', (button) => { reviewStage = Number(button.dataset.reviewStage); showReview(); });
  tabGroup('[data-review-comment]', (button) => { reviewComment = button.dataset.reviewComment; showReview(); });
  showReview();
})();
