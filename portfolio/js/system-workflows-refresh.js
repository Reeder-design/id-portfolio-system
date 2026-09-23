(() => {
  const icon = (file) => `../../assets/icons/pixel/work-tools/${file}.webp`;
  const img = (file) => `<img src="${icon(file)}" alt="">`;
  const byId = (id) => document.getElementById(id);
  const put = (id, value) => { const node = byId(id); if (node) node.textContent = value; };
  const picture = (id, src) => { const node = byId(id); if (node) node.src = src; };
  const animate = (node) => { node.classList.remove('is-changing'); void node.offsetWidth; node.classList.add('is-changing'); };
  const tabs = (selector, selected) => {
    const buttons = [...document.querySelectorAll(selector)];
    const choose = (button, focus = false) => {
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      selected(button);
      if (focus) button.focus();
    };
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => choose(button));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
          event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % buttons.length : (index + buttons.length - 1) % buttons.length;
        choose(buttons[next], true);
      });
    });
    return { buttons, choose };
  };
  const player = (button, lastIndex, selectStep) => {
    let timer = null;
    const stop = () => { if (timer) clearInterval(timer); timer = null; button.textContent = 'Play workflow'; };
    button.addEventListener('click', () => {
      if (timer) { stop(); return; }
      let index = 0;
      selectStep(index);
      button.textContent = 'Pause workflow';
      timer = setInterval(() => {
        if (index >= lastIndex) { stop(); button.textContent = 'Replay workflow'; return; }
        selectStep(++index);
        if (index === lastIndex) { stop(); button.textContent = 'Replay workflow'; }
      }, 3200);
    });
    return stop;
  };

  // Each stage renders a distinct, fictional interface rather than repainting one generic flow.
  const workspaceStages = ['PLAN', 'BUILD', 'REVIEW', 'LAUNCH', 'MEASURE'];
  const workspaceCaptions = {
    microsoft: [
      'A Teams project channel makes the request, owner, and pinned brief visible.',
      'SharePoint keeps the source files together while the slide asset is assembled.',
      'A specific version and comment move through a human review decision.',
      'The approved learning card appears in a tested Teams learning entry point.',
      'Excel rows become a status view with exceptions still visible for follow-up.'
    ],
    google: [
      'A Gmail request becomes a shared Docs brief owned by the team.',
      'The Shared Drive file set and the working document stay connected.',
      'A suggested edit is checked against the source before it is accepted.',
      'A permission check happens before the approved learning link is shared.',
      'Sheets filters the source rows into a traceable action view.'
    ]
  };
  const msScenes = [
    () => `<div class="platform-scene scene-ms-plan"><div class="scene-brand">${img('teams')}<span>Teams <small>Training Launch / Project Management</small></span></div><div class="scene-ms-channel"><aside><b>CHANNELS</b><span class="selected"># Project Management</span><span># SME Review</span><span># Launch</span></aside><div class="scene-message-stream"><small>CONVERSATION</small><p class="scene-message">We need a short product-training update for the field team.</p><p class="scene-message">I can own the brief. Who approves the source?</p><div class="scene-route-line" aria-hidden="true"><i></i></div><div class="scene-pinned"><b>PINNED BRIEF</b><strong>Audience · source owner · launch date</strong><em>Owner: L&D lead</em></div></div></div></div>`,
    () => `<div class="platform-scene scene-ms-build"><div class="scene-brand">${img('sharepoint')}<span>SharePoint <small>Product Training / Working Files</small></span></div><div class="scene-build-grid"><div class="scene-file-list"><b>DOCUMENT LIBRARY</b><span>${img('word')}Approved brief.docx <em>Current</em></span><span>${img('powerpoint')}Scenario storyboard.pptx <em>In build</em></span><span>${img('onedrive')}Voiceover script.docx <em>Source</em></span></div><div class="scene-slide-editor"><div class="scene-slide-toolbar">LAYOUT · SCENARIO <span>v03</span></div><div class="scene-slide-title">Customer conversation</div><div class="scene-build-block block-one">Context</div><div class="scene-build-block block-two">Learner choice</div><div class="scene-build-block block-three">Feedback</div></div></div></div>`,
    () => `<div class="platform-scene scene-ms-review"><div class="scene-brand">${img('word')}<span>Word + SharePoint <small>Specific version / visible decision</small></span></div><div class="scene-review-grid"><div class="scene-document"><b>SCENARIO SCRIPT · v03</b><p>Ask the learner to identify the <mark>customer's constraint</mark> before making a recommendation.</p><div class="scene-document-lines"><i></i><i></i><i></i></div></div><div class="scene-review-thread"><small>SME COMMENT</small><strong>“Confirm the approved product term.”</strong><span class="scene-comment-resolve">Decision recorded · edit checked</span><em>Reviewer: source owner</em></div></div></div>`,
    () => `<div class="platform-scene scene-ms-launch"><div class="scene-brand">${img('teams')}<span>Teams <small>Field Enablement / Learning tab</small></span></div><div class="scene-teams-tabs"><span>Posts</span><span>Files</span><span class="active">Learning</span></div><div class="scene-learning-frame"><div class="scene-learning-card">${img('teams')}<span><small>VIVA LEARNING / APPROVED ENTRY</small><strong>Product conversation practice</strong><em>Open the tested learning link</em></span><b>Available</b></div><div class="scene-access-check">✓ Access tested &nbsp; ✓ Current asset &nbsp; ✓ Learner path</div></div></div>`,
    () => `<div class="platform-scene scene-ms-measure"><div class="scene-brand">${img('excel')}<span>Excel <small>Learning operations / review-ready workbook</small></span></div><div class="scene-measure-grid"><div class="scene-sheet"><div class="scene-sheet-head"><span>LEARNER</span><span>COURSE</span><span>STATUS</span></div><div><span>0142</span><span>Product update</span><b>Complete</b></div><div><span>0143</span><span>Product update</span><b>Review</b></div><div><span>0144</span><span>Product update</span><b>Incomplete</b></div></div><div class="scene-metric"><small>FOLLOW-UP VIEW</small><strong>2 records need action</strong><div class="scene-metric-bar"><i></i></div><p>Each status links back to its source row and exception check.</p></div></div></div>`
  ];
  const googleScenes = [
    () => `<div class="platform-scene scene-google-plan"><div class="scene-brand">${img('gmail')}<span>Gmail <small>Training request / fictional project</small></span></div><div class="scene-google-mail"><div class="scene-inbox"><b>INBOX</b><span class="active">● Product training request</span><span>○ SME availability</span><span>○ Launch notes</span></div><div class="scene-mail-open"><small>FROM: FIELD ENABLEMENT</small><strong>Can we update the training before launch?</strong><p>Audience, goal, source owner, and date need one shared brief.</p><div class="scene-doc-draft">${img('google-docs')}<span>New shared brief <em>Team-owned</em></span></div></div></div></div>`,
    () => `<div class="platform-scene scene-google-build"><div class="scene-brand">${img('google-drive')}<span>Shared Drive <small>Training Launch / Source Library</small></span></div><div class="scene-drive-build"><div class="scene-drive-files"><b>TEAM FILES</b><span>${img('google-docs')}Learning outline <em>Current</em></span><span>${img('google-drive')}Approved sources <em>Read only</em></span><span>${img('google-sheets')}Review tracker <em>Shared</em></span></div><div class="scene-doc-editor"><small>GOOGLE DOCS · WORKING DRAFT</small><strong>Scenario outline</strong><i class="scene-doc-line"></i><i class="scene-doc-line"></i><i class="scene-doc-line"></i><span class="scene-doc-cursor"></span></div></div></div>`,
    () => `<div class="platform-scene scene-google-review"><div class="scene-brand">${img('google-docs')}<span>Google Docs <small>Comment + suggestion review</small></span></div><div class="scene-suggestion-grid"><div class="scene-google-doc"><small>SCENARIO OUTLINE · v03</small><p>Ask a question that identifies the <del>solution</del> <ins>constraint</ins> first.</p><div class="scene-document-lines"><i></i><i></i></div></div><div class="scene-suggestion"><small>SUGGESTED EDIT</small><strong>Use the source-approved wording.</strong><span>✓ Accepted after source check</span></div></div></div>`,
    () => `<div class="platform-scene scene-google-launch"><div class="scene-brand">${img('google-drive')}<span>Google Drive <small>Approved file / sharing controls</small></span></div><div class="scene-share-dialog"><div class="scene-share-file">${img('google-drive')}<span><strong>Product practice · final</strong><small>Approved learning resource</small></span></div><div class="scene-share-row"><b>ACCESS</b><span>Field team · Viewer</span></div><div class="scene-share-row"><b>LINK</b><span>Restricted to approved group</span></div><div class="scene-share-confirm">Permissions checked → Link ready to share</div></div></div>`,
    () => `<div class="platform-scene scene-google-measure"><div class="scene-brand">${img('google-sheets')}<span>Google Sheets <small>Operational tracker / reviewed rows</small></span></div><div class="scene-sheets-grid"><div class="scene-sheets-table"><div><b>LEARNER</b><b>STATUS</b><b>OWNER</b></div><div><span>0142</span><span>Done</span><span>L&D</span></div><div class="flagged"><span>0143</span><span>Check</span><span>Admin</span></div><div><span>0144</span><span>Open</span><span>SME</span></div></div><div class="scene-filter-panel"><small>FILTER: NEEDS ACTION</small><div class="scene-filter-bar"><i></i></div><strong>2 follow-ups</strong><p>Open records keep an owner and source link.</p></div></div></div>`
  ];
  const workspaceDemo = byId('workspaceDemo');
  let workspacePlatform = 'microsoft', workspaceStage = 0;
  const showWorkspace = () => {
    workspaceDemo.dataset.platform = workspacePlatform;
    workspaceDemo.dataset.stage = workspaceStages[workspaceStage].toLowerCase();
    put('workspaceWindowTitle', `${workspacePlatform === 'microsoft' ? 'Microsoft 365' : 'Google Workspace'} · Training Operations`);
    byId('workspaceCanvas').innerHTML = (workspacePlatform === 'microsoft' ? msScenes : googleScenes)[workspaceStage]();
    put('workspaceCaption', workspaceCaptions[workspacePlatform][workspaceStage]);
    animate(workspaceDemo);
  };
  const workspaceTabs = tabs('[data-workspace-stage]', (button) => { workspaceStage = Number(button.dataset.workspaceStage); showWorkspace(); });
  const stopWorkspace = player(byId('workspacePlay'), 4, (index) => workspaceTabs.choose(workspaceTabs.buttons[index]));
  workspaceTabs.buttons.forEach((button) => { button.addEventListener('click', stopWorkspace); button.addEventListener('keydown', (event) => { if (event.key.startsWith('Arrow') || ['Home','End'].includes(event.key)) stopWorkspace(); }); });
  tabs('[data-workspace-platform]', (button) => { stopWorkspace(); workspacePlatform = button.dataset.workspacePlatform; workspaceTabs.choose(workspaceTabs.buttons[0]); });
  const hotspotAnswers = {
    source:'Keep the approved brief and current file in one shared location; chat points people to it rather than becoming the only record.',
    access:'Name who owns the next action, who may edit the source, and who can approve the release. Test the learner’s access path.',
    flow:'Teams or Slack can host reminders and cohort conversation. Viva Learning or an approved LMS entry point can surface learning when the organization has configured it.'
  };
  const hotspotButtons = [...document.querySelectorAll('[data-workspace-hotspot]')];
  hotspotButtons.forEach((button) => button.addEventListener('click', () => { hotspotButtons.forEach((item) => item.classList.toggle('active', item === button)); put('workspaceHotspotAnswer', hotspotAnswers[button.dataset.workspaceHotspot]); }));
  showWorkspace();

  const managementStages = [
    {label:'INTAKE',title:'The brief becomes an assigned project.',text:'The request is scoped before production tasks receive owners and dates.',state:'Intake',dependency:'Script approval unlocks voiceover.',gate:'Gate visible',caption:'An intake record becomes work with a clear owner and first review gate.'},
    {label:'BUILD',title:'Production follows approved inputs.',text:'The script, voiceover, and screens move in sequence instead of starting from conflicting drafts.',state:'In progress',dependency:'Voiceover waits for the signed-off script.',gate:'Blocked until approval',caption:'A visible dependency prevents production from outrunning the approved source.'},
    {label:'REVIEW',title:'Feedback becomes tracked change.',text:'A contextual comment gets an owner, a revision, and a decision before the task closes.',state:'Review',dependency:'SME accuracy check precedes final QA.',gate:'Human decision',caption:'The review card stays open until the edit is checked in the lesson.'},
    {label:'PUBLISH',title:'Launch with a maintenance owner.',text:'The final file, access check, and next update owner remain attached to the project.',state:'Release ready',dependency:'Final QA and access test precede LMS release.',gate:'Release check',caption:'The project ends with a tested handoff and a named update path.'}
  ];
  const managementPlatforms = {asana:{label:'Asana',icon:'asana'},monday:{label:'Monday.com',icon:'monday-com'},jira:{label:'Jira',icon:'jira'}};
  const roleAnswers = {designer:'My view: source files, blocked production tasks, and the next review decision.',sme:'SME view: the current lesson, the exact accuracy questions, and the approval deadline.',manager:'Program manager view: launch risk, pending approvals, owners, and upcoming milestones.'};
  const roleCards = {designer:['Clarify learning scope','Build scenario screens','Apply reviewed edit','Package source files'],sme:['Confirm source material','Validate script facts','Resolve accuracy note','Sign off final meaning'],manager:['Set launch milestone','Watch production gate','Review approval risk','Confirm handoff owner']};
  const focus = (role,stage) => `<span class="scene-role-focus">YOUR FOCUS · ${roleCards[role][stage]}</span>`;
  const asanaScenes = [
    (role) => `<div class="platform-scene scene-asana-intake"><div class="scene-asana-head">${img('asana')}<strong>Training Requests</strong><span>FORM → TASK</span></div><div class="scene-asana-form"><div><small>REQUEST FORM</small><label>Audience <b>Field team</b></label><label>Need <b>Product scenario update</b></label><label>Source owner <b>SME assigned</b></label><span class="scene-asana-submit">Submit request</span></div><i class="scene-asana-transfer">→</i><div class="scene-asana-created"><small>NEW TASK · TRAINING LAUNCH</small><strong>Scope product update</strong><p>Owner: instructional designer</p><em>Due date + review milestone added</em></div></div>${focus(role,0)}</div>`,
    (role) => `<div class="platform-scene scene-asana-build"><div class="scene-asana-head">${img('asana')}<strong>Course Development Board</strong><span>DEPENDENCIES</span></div><div class="scene-asana-kanban"><div><small>READY</small><article>Storyboard approved <b>✓</b></article></div><div><small>IN PROGRESS</small><article class="scene-moving-task">Build scenario screens <b>Designer</b></article></div><div><small>BLOCKED</small><article>Record voiceover <b>Waiting</b></article></div></div><div class="scene-dependency-line"><span>Script sign-off</span><i></i><span>Voiceover unlocks</span></div>${focus(role,1)}</div>`,
    (role) => `<div class="platform-scene scene-asana-review"><div class="scene-asana-head">${img('asana')}<strong>SME Review Task</strong><span>APPROVAL GATE</span></div><div class="scene-asana-review-grid"><div class="scene-review-source"><small>REVIEW 360 · SCREEN 02</small><strong>“Check the discovery question.”</strong><p>Comment linked to lesson context</p></div><div class="scene-review-action"><small>ASSIGNED CHANGE</small><strong>Revise choice + feedback</strong><span>Owner: instructional designer</span><em class="scene-approval-pulse">SME confirmation required</em></div></div>${focus(role,2)}</div>`,
    (role) => `<div class="platform-scene scene-asana-publish"><div class="scene-asana-head">${img('asana')}<strong>Launch Timeline</strong><span>MILESTONE VIEW</span></div><div class="scene-asana-timeline"><div><span>Final QA</span><i></i><b>Checked</b></div><div><span>LMS handoff</span><i></i><b>Ready</b></div><div><span>Update owner</span><i></i><b>Assigned</b></div></div>${focus(role,3)}</div>`
  ];
  const mondayScenes = [
    (role) => `<div class="platform-scene scene-monday-intake"><div class="scene-monday-head">${img('monday-com')}<strong>Training Launch Board</strong><span>NEW REQUEST</span></div><div class="scene-monday-table"><div class="head"><b>ITEM</b><b>OWNER</b><b>STATUS</b></div><div><span>Product training update</span><span>L&D lead</span><em class="new-row">New request</em></div><div><span>Audience + source brief</span><span>SME</span><em>Ready</em></div></div>${focus(role,0)}</div>`,
    (role) => `<div class="platform-scene scene-monday-build"><div class="scene-monday-head">${img('monday-com')}<strong>Production Group</strong><span>DEPENDENCY STATUS</span></div><div class="scene-monday-table"><div class="head"><b>ITEM</b><b>OWNER</b><b>STATUS</b></div><div><span>Approve script</span><span>SME</span><em>Review</em></div><div><span>Record voiceover</span><span>Media</span><em class="blocked">Waiting on script</em></div><div><span>Build screens</span><span>Designer</span><em class="working">Working</em></div></div>${focus(role,1)}</div>`,
    (role) => `<div class="platform-scene scene-monday-review"><div class="scene-monday-head">${img('monday-com')}<strong>Review Updates</strong><span>ITEM CONVERSATION</span></div><div class="scene-monday-update"><small>SME · UPDATE</small><p>“Please check the source wording on screen 02.”</p><div class="scene-monday-reply">Designer: revised version attached for confirmation.</div><b>Approval pending · source owner</b></div>${focus(role,2)}</div>`,
    (role) => `<div class="platform-scene scene-monday-publish"><div class="scene-monday-head">${img('monday-com')}<strong>Program Dashboard</strong><span>LAUNCH VIEW</span></div><div class="scene-monday-dashboard"><article><small>FINAL QA</small><strong>Complete</strong><i></i></article><article><small>LMS HANDOFF</small><strong>Ready</strong><i></i></article><article><small>UPDATE OWNER</small><strong>Assigned</strong><i></i></article></div>${focus(role,3)}</div>`
  ];
  const jiraScenes = [
    (role) => `<div class="platform-scene scene-jira-intake"><div class="scene-jira-head">${img('jira')}<strong>Create work item</strong><span>LND-24</span></div><div class="scene-jira-form"><label>SUMMARY <b>Update product scenario lesson</b></label><label>ASSIGNEE <b>Instructional designer</b></label><label>PRIORITY <b>Launch dependency</b></label><div class="scene-jira-created">Issue created → added to training board</div></div>${focus(role,0)}</div>`,
    (role) => `<div class="platform-scene scene-jira-build"><div class="scene-jira-head">${img('jira')}<strong>Training Delivery Board</strong><span>WORKFLOW</span></div><div class="scene-jira-board"><div><small>TO DO</small><article>LND-24<br><strong>Scenario build</strong></article></div><div><small>IN PROGRESS</small><article class="scene-jira-move">LND-25<br><strong>Script sign-off</strong></article></div><div><small>BLOCKED</small><article>LND-26<br><strong>Voiceover</strong></article></div></div><p class="scene-jira-link">LND-26 is blocked by LND-25</p>${focus(role,1)}</div>`,
    (role) => `<div class="platform-scene scene-jira-review"><div class="scene-jira-head">${img('jira')}<strong>LND-27 · SME review</strong><span>READY FOR QA</span></div><div class="scene-jira-issue"><div><small>DESCRIPTION</small><p>Confirm screen 02 wording and feedback against the approved source.</p><span>Assignee · SME reviewer</span></div><div><small>CHECKLIST</small><p>☑ Revision attached</p><p>☐ Technical meaning confirmed</p><p>☐ Final QA complete</p></div></div>${focus(role,2)}</div>`,
    (role) => `<div class="platform-scene scene-jira-publish"><div class="scene-jira-head">${img('jira')}<strong>Release: Product Update</strong><span>VERSION VIEW</span></div><div class="scene-jira-release"><div><small>ISSUES IN RELEASE</small><strong>LND-24 · Scenario</strong><strong>LND-27 · Review</strong></div><div class="scene-jira-release-check"><span>✓ Final QA</span><span>✓ LMS handoff</span><span>✓ Maintenance owner</span></div></div>${focus(role,3)}</div>`
  ];
  const managementScenes = {asana:asanaScenes,monday:mondayScenes,jira:jiraScenes};
  const managementDemo=byId('managementDemo');
  let managementPlatform='asana',managementStage=0,managementRole='designer';
  const showManagement=()=>{
    const platform=managementPlatforms[managementPlatform],stage=managementStages[managementStage];
    managementDemo.dataset.platform=managementPlatform;managementDemo.dataset.stage=stage.label.toLowerCase();managementDemo.dataset.role=managementRole;
    put('managementWindowTitle',`${platform.label} · Product training launch`);picture('managementIcon',icon(platform.icon));
    put('managementStageLabel',`${String(managementStage+1).padStart(2,'0')} · ${stage.label}`);put('managementStageTitle',stage.title);put('managementStageText',stage.text);put('managementStageState',stage.state);
    put('managementDependency',stage.dependency);put('managementGate',stage.gate);put('managementCaption',stage.caption);put('managementRoleAnswer',roleAnswers[managementRole]);
    byId('managementCanvas').innerHTML=managementScenes[managementPlatform][managementStage](managementRole);
    animate(managementDemo);
  };
  const managementTabs=tabs('[data-management-stage]',(button)=>{managementStage=Number(button.dataset.managementStage);showManagement();});
  const stopManagement=player(byId('managementPlay'),3,(index)=>managementTabs.choose(managementTabs.buttons[index]));
  managementTabs.buttons.forEach((button)=>{button.addEventListener('click',stopManagement);button.addEventListener('keydown',(event)=>{if(event.key.startsWith('Arrow')||['Home','End'].includes(event.key))stopManagement();});});
  tabs('[data-management-platform]',(button)=>{stopManagement();managementPlatform=button.dataset.managementPlatform;managementTabs.choose(managementTabs.buttons[0]);});
  tabs('[data-management-role]',(button)=>{managementRole=button.dataset.managementRole;showManagement();});
  showManagement();

  const reviewStages=[
    ['AUTHOR','Prepare a reviewable lesson and name what feedback is needed.','Source: approved product brief'],
    ['L&D QA','Check navigation, practice, accessibility, and missing states.','Decision: ready for SME or return to author'],
    ['SUBJECT EXPERT','Validate facts and examples in the lesson context.','Decision: correction, clarification, or approval'],
    ['STAKEHOLDER','Check approved terminology and launch fit.','Decision: align competing requests before edit'],
    ['L&D + AUTHOR','Confirm required changes in the revised version.','Decision: close only after checking the new build']
  ];
  const comments={
    sme:{name:'Technical SME',type:'TECHNICAL ACCURACY',text:'The customer would not know the solution yet. Identify the constraint first.',decision:'Required correction',action:'Revise the choice and feedback, then ask the SME to confirm the meaning.',owner:'Instructional designer',status:'Needs change'},
    brand:{name:'Brand reviewer',type:'APPROVED TERMINOLOGY',text:'Use the approved product term on this screen and in the facilitator notes.',decision:'Source check',action:'Compare the comment with the current terminology guide before editing both assets.',owner:'Content editor',status:'Check source'},
    ld:{name:'L&D reviewer',type:'LEARNING + ACCESS',text:'Explain why the discovery question is the better next step.',decision:'Learning design revision',action:'Rewrite the feedback and check focus order and screen-reader language.',owner:'Instructional designer',status:'QA needed'}
  };
  const reviewScene = (stage,commentKey) => {
    const c=comments[commentKey];
    if(stage===0)return `<div class="platform-scene scene-review-draft"><div class="scene-review-appbar"><strong>Review 360</strong><span>Customer Conversation · draft v03</span><b>Share for review</b></div><div class="scene-review-draft-grid"><div class="scene-course-preview"><small>LESSON SCREEN 02</small><h3>What should the learner ask next?</h3><p>A customer describes a challenge. The goal and constraints are still unclear.</p><div class="scene-course-choice">Ask a discovery question before recommending a solution.</div></div><div class="scene-review-brief"><small>AUTHOR CHECK</small><strong>Review brief attached</strong><p>SME: validate technical meaning.<br>L&D: check practice and access.<br>Brand: check approved terms.</p><span>Draft version: 03</span></div></div></div>`;
    if(stage===1)return `<div class="platform-scene scene-review-qa"><div class="scene-review-appbar"><strong>Review 360</strong><span>Internal QA · draft v03</span><b>Check before SME</b></div><div class="scene-review-qa-grid"><div class="scene-course-preview"><small>LESSON SCREEN 02</small><h3>Choose the next question</h3><p>Review the practice and feedback before requesting expert time.</p><div class="scene-course-choice">Ask a discovery question first.</div><i class="scene-qa-scan"></i></div><div class="scene-qa-list"><small>INTERNAL QA</small><span>✓ Navigation works</span><span>✓ Choice feedback is present</span><span>✓ Keyboard path checked</span><span class="pending">○ Source language needs SME</span></div></div></div>`;
    if(stage===2)return `<div class="platform-scene scene-review-comment"><div class="scene-review-appbar"><strong>Review 360</strong><span>SME comments · draft v03</span><b>3 on this screen</b></div><div class="scene-review-comment-grid"><div class="scene-course-preview"><small>LESSON SCREEN 02</small><h3>What should the learner ask next?</h3><p>A customer describes a challenge, but constraints are unclear.</p><div class="scene-course-choice">Ask a discovery question before recommending.</div><span class="scene-pin">${commentKey==='sme'?'1':commentKey==='brand'?'2':'3'}</span></div><div class="scene-review-comment-card"><small>${c.name.toUpperCase()} · ${c.type}</small><blockquote>“${c.text}”</blockquote><strong>${c.decision}</strong><p>${c.action}</p><em>Owner: ${c.owner} · ${c.status}</em></div></div></div>`;
    if(stage===3)return `<div class="platform-scene scene-review-triage"><div class="scene-review-appbar"><strong>Review 360</strong><span>Stakeholder reconciliation</span><b>Decision needed</b></div><div class="scene-triage-grid"><div class="scene-triage-input"><small>COMMENTS IN CONTEXT</small><p>SME: Identify the constraint.</p><p>Brand: Use approved terminology.</p><p>L&D: Explain the learner decision.</p></div><div class="scene-triage-decision"><small>TRIAGE RECORD</small><strong>${c.decision}</strong><p>${c.action}</p><span>Assigned to ${c.owner}</span></div></div></div>`;
    return `<div class="platform-scene scene-review-final"><div class="scene-review-appbar"><strong>Review 360</strong><span>Final QA · revision v04</span><b>Checked</b></div><div class="scene-version-compare"><div><small>BEFORE · v03</small><p>Ask a discovery question before recommending a solution.</p></div><span class="scene-version-arrow">→</span><div class="scene-final-version"><small>AFTER · v04</small><p>Ask which constraints are shaping the customer's decision.</p></div></div><div class="scene-final-checks"><span>✓ Technical meaning confirmed</span><span>✓ Terminology checked</span><span>✓ Feedback + access QA</span></div></div>`;
  };
  const reviewDemo=byId('reviewDemo');
  let reviewStage=0,reviewComment='sme';
  const showReview=()=>{
    const stage=reviewStages[reviewStage];reviewDemo.dataset.stage=String(reviewStage);
    put('reviewStageOwner',stage[0]);put('reviewStagePurpose',stage[1]);put('reviewStageBoundary',stage[2]);
    byId('reviewScene').innerHTML=reviewScene(reviewStage,reviewComment);
    byId('reviewCommentPicker').hidden=reviewStage!==2&&reviewStage!==3;
    put('reviewCaption',reviewStage===4?'The revised lesson is compared with the draft and checked before comments are closed.':reviewStage===3?'Different reviewer requests are reconciled into one owned decision.':reviewStage===2?'A comment tied to the lesson screen becomes a specific edit and confirmation task.':reviewStage===1?'Internal QA finds interaction and access issues before SME review.':'The draft and review brief make each reviewer’s job clear.');
    animate(reviewDemo);
  };
  tabs('[data-review-stage]',(button)=>{reviewStage=Number(button.dataset.reviewStage);showReview();});
  tabs('[data-review-comment]',(button)=>{reviewComment=button.dataset.reviewComment;showReview();});
  showReview();
})();
