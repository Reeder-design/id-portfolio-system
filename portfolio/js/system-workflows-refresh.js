(() => {
  const icon = (file) => `../../assets/icons/pixel/work-tools/${file}.webp`;
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
      }, 2500);
    });
    return stop;
  };

  // One fictional launch, shown through two different workplace ecosystems.
  const workspace = {
    microsoft: {
      label: 'Microsoft 365', rail: [['teams','Teams'],['outlook','Outlook'],['sharepoint','SharePoint'],['excel','Excel']],
      steps: [
        {label:'PLAN',title:'Turn a request into a trackable plan.',text:'Capture the audience, learning need, source owner, and launch date before the conversation scatters.',from:'OUTLOOK',fromIcon:'outlook',fromText:'New training request',to:'TEAMS',toIcon:'teams',toText:'Project channel + owner',status:'Tracked',reason:'The next person can find the request and its decision.',owner:'L&D lead',source:'Approved intake',check:'Confirm scope',caption:'The request becomes visible work before production starts.'},
        {label:'BUILD',title:'Keep production files connected.',text:'A shared outline, slide system, and source folder give designers one current place to build from.',from:'WORD',fromIcon:'word',fromText:'Approved learning outline',to:'SHAREPOINT',toIcon:'sharepoint',toText:'Versioned asset library',status:'In production',reason:'Production can continue without guessing which file is current.',owner:'Designer',source:'Shared library',check:'Name the version',caption:'The production handoff carries the approved source into the build.'},
        {label:'REVIEW',title:'Make feedback a decision.',text:'A reviewer responds to a specific version; the owner records what changed and what still needs approval.',from:'TEAMS',fromIcon:'teams',fromText:'SME review thread',to:'SHAREPOINT',toIcon:'sharepoint',toText:'Approved revision',status:'Human check',reason:'A visible decision is more useful than an unresolved comment.',owner:'SME + designer',source:'Review record',check:'Resolve comments',caption:'Feedback moves through a human checkpoint before release.'},
        {label:'LAUNCH',title:'Surface learning where people work.',text:'The approved resource can be linked from a team channel or, where configured, discovered through a learning hub.',from:'SHAREPOINT',fromIcon:'sharepoint',fromText:'Approved resource',to:'TEAMS / VIVA',toIcon:'teams',toText:'Learning entry point',status:'Available',reason:'The link stays close to the employee’s daily workflow.',owner:'Learning admin',source:'Approved asset',check:'Test access',caption:'The release step connects the approved file to a tested learner entry point.'},
        {label:'MEASURE',title:'Turn status into follow-up.',text:'A reviewed tracker shows participation and questions that need a person, rather than only a total.',from:'EXCEL',fromIcon:'excel',fromText:'Learner status tracker',to:'REVIEW VIEW',toIcon:'excel',toText:'Exceptions + follow-up',status:'Ready to act',reason:'A status view is useful when its source rows can be checked.',owner:'L&D operations',source:'LMS records',check:'Review exceptions',caption:'The workflow ends with a traceable follow-up, not a decorative dashboard.'}
      ]
    },
    google: {
      label: 'Google Workspace', rail: [['gmail','Gmail'],['google-drive','Drive'],['google-docs','Docs'],['google-sheets','Sheets']],
      steps: [
        {label:'PLAN',title:'Move the request into a shared brief.',text:'The team records purpose, audience, source owner, and due date in a document everyone can find.',from:'GMAIL',fromIcon:'gmail',fromText:'Training request',to:'GOOGLE DOCS',toIcon:'google-docs',toText:'Shared launch brief',status:'Scoped',reason:'A shared brief keeps the original request from becoming the only source.',owner:'L&D lead',source:'Shared Drive',check:'Confirm access',caption:'The request moves from an inbox to a team-owned brief.'},
        {label:'BUILD',title:'Keep the asset with its sources.',text:'Working files and approved references live in a shared drive with clear names and permissions.',from:'GOOGLE DOCS',fromIcon:'google-docs',fromText:'Learning outline',to:'SHARED DRIVE',toIcon:'google-drive',toText:'Current build + sources',status:'In production',reason:'Team-owned storage protects continuity when a contributor changes.',owner:'Designer',source:'Shared Drive',check:'Version files',caption:'Production has one location for current files and source context.'},
        {label:'REVIEW',title:'Resolve comments in context.',text:'Reviewers comment on the current document and the owner records the approved decision.',from:'GOOGLE DOCS',fromIcon:'google-docs',fromText:'SME comments',to:'DECISION LOG',toIcon:'google-drive',toText:'Approved revision',status:'Human check',reason:'A comment is complete when the decision and edit are checked.',owner:'SME + designer',source:'Current version',check:'Close feedback',caption:'The review loop closes around a specific version.'},
        {label:'LAUNCH',title:'Publish a controlled resource link.',text:'The approved learning asset is released through the organization’s chosen channel after a permissions check.',from:'SHARED DRIVE',fromIcon:'google-drive',fromText:'Approved file',to:'LEARNING LINK',toIcon:'google-drive',toText:'Tested access path',status:'Available',reason:'People should reach the current resource without a permission dead end.',owner:'Learning admin',source:'Approved file',check:'Test permissions',caption:'The resource reaches learners through a verified link.'},
        {label:'MEASURE',title:'Make follow-up visible.',text:'A shared tracker separates completed items, open questions, and ownership for the next update.',from:'GOOGLE SHEETS',fromIcon:'google-sheets',fromText:'Status rows',to:'TEAM VIEW',toIcon:'google-sheets',toText:'Follow-up list',status:'Review-ready',reason:'The team can trace each status back to its row and owner.',owner:'L&D operations',source:'Verified rows',check:'Review outliers',caption:'The final view supports action and future maintenance.'}
      ]
    }
  };
  const workspaceDemo = byId('workspaceDemo');
  let workspacePlatform = 'microsoft', workspaceStage = 0;
  const workspaceRail = byId('workspaceRail');
  const showWorkspace = () => {
    const group = workspace[workspacePlatform], item = group.steps[workspaceStage];
    workspaceDemo.dataset.platform = workspacePlatform;
    animate(workspaceDemo);
    put('workspaceWindowTitle', `Training Operations · ${group.label}`);
    put('workspaceStepLabel', `${String(workspaceStage + 1).padStart(2,'0')} · ${item.label}`);
    put('workspaceStepTitle', item.title); put('workspaceStepText', item.text);
    put('workspaceSourceTool', item.from); picture('workspaceSourceIcon', icon(item.fromIcon)); put('workspaceSourceText', item.fromText);
    put('workspaceOutputTool', item.to); picture('workspaceOutputIcon', icon(item.toIcon)); put('workspaceOutputText', item.toText); put('workspaceOutputStatus', item.status);
    put('workspaceReason', item.reason); put('workspaceOwner', item.owner); put('workspaceSource', item.source); put('workspaceCheck', item.check); put('workspaceCaption', item.caption);
    workspaceRail.replaceChildren(...group.rail.map(([file,name]) => { const row=document.createElement('span'); const image=document.createElement('img'); image.src=icon(file); image.alt=''; row.append(image,document.createTextNode(name)); return row; }));
  };
  const workspaceStages = tabs('[data-workspace-stage]', (button) => { workspaceStage=Number(button.dataset.workspaceStage); showWorkspace(); });
  const stopWorkspace = player(byId('workspacePlay'), 4, (index) => workspaceStages.choose(workspaceStages.buttons[index]));
  workspaceStages.buttons.forEach((button) => { button.addEventListener('click', stopWorkspace); button.addEventListener('keydown', (event) => { if (event.key.startsWith('Arrow') || ['Home','End'].includes(event.key)) stopWorkspace(); }); });
  tabs('[data-workspace-platform]', (button) => { stopWorkspace(); workspacePlatform=button.dataset.workspacePlatform; workspaceStages.choose(workspaceStages.buttons[0]); });
  const hotspotAnswers = {
    source:'Keep the approved brief and current file in one shared location; chat points people to it rather than becoming the only record.',
    access:'Name who owns the next action, who may edit the source, and who can approve the release. Test the learner’s access path.',
    flow:'Teams or Slack can host reminders and cohort conversation. Viva Learning or an approved LMS entry point can surface learning when the organization has configured it.'
  };
  tabs('[data-workspace-hotspot]', (button) => put('workspaceHotspotAnswer',hotspotAnswers[button.dataset.workspaceHotspot]));
  showWorkspace();

  const managementStages = [
    {label:'INTAKE',title:'The brief becomes an assigned project.',text:'The request is scoped before production tasks receive owners and dates.',state:'Intake',dependency:'Script approval unlocks voiceover.',gate:'Gate visible',caption:'An intake record becomes work with a clear owner and first review gate.',card:'Training request',support:['Audience + need','Source owner','Launch date'],column:0},
    {label:'BUILD',title:'Production follows approved inputs.',text:'The script, voiceover, and screens move in sequence instead of starting from conflicting drafts.',state:'In progress',dependency:'Voiceover waits for the signed-off script.',gate:'Blocked until approval',caption:'A visible dependency prevents production from outrunning the approved source.',card:'Scenario build',support:['Script approved','Voiceover queued','Screens in build'],column:1},
    {label:'REVIEW',title:'Feedback becomes tracked change.',text:'A contextual comment gets an owner, a revision, and a decision before the task closes.',state:'Review',dependency:'SME accuracy check precedes final QA.',gate:'Human decision',caption:'The review card stays open until the edit is checked in the lesson.',card:'SME review',support:['Review 360 note','Designer revision','SME confirmation'],column:2},
    {label:'PUBLISH',title:'Launch with a maintenance owner.',text:'The final file, access check, and next update owner remain attached to the project.',state:'Release ready',dependency:'Final QA and access test precede LMS release.',gate:'Release check',caption:'The project ends with a tested handoff and a named update path.',card:'Release package',support:['Final QA','LMS handoff','Update owner'],column:2}
  ];
  const managementPlatforms = {
    asana:{label:'Asana',icon:'asana',columns:['READY','IN PROGRESS','REVIEW / RELEASE'],prefix:'TASK',className:'asana'},
    monday:{label:'Monday.com',icon:'monday-com',columns:['ITEM','OWNER','STATUS'],prefix:'ITEM',className:'monday'},
    jira:{label:'Jira',icon:'jira',columns:['TO DO','IN PROGRESS','READY FOR QA'],prefix:'LND',className:'jira'}
  };
  const roleAnswers = {
    designer:'My view: source files, blocked production tasks, and the next review decision.',
    sme:'SME view: the current lesson, the exact accuracy questions, and the approval deadline.',
    manager:'Program manager view: launch risk, pending approvals, owners, and upcoming milestones.'
  };
  const roleCards = {
    designer:['Clarify learning scope','Build scenario screens','Apply reviewed edit','Package source files'],
    sme:['Confirm source material','Validate script facts','Resolve accuracy note','Sign off final meaning'],
    manager:['Set launch milestone','Watch production gate','Review approval risk','Confirm release owner']
  };
  const managementDemo=byId('managementDemo');
  let managementPlatform='asana',managementStage=0,managementRole='designer';
  const managementBoard=byId('managementBoard');
  const showManagement=()=>{
    const platform=managementPlatforms[managementPlatform],stage=managementStages[managementStage];
    managementDemo.dataset.platform=managementPlatform;managementDemo.dataset.role=managementRole;
    animate(managementDemo);
    put('managementWindowTitle', `${platform.label} · Product training launch`);picture('managementIcon',icon(platform.icon));
    put('managementStageLabel',`${String(managementStage+1).padStart(2,'0')} · ${stage.label}`);put('managementStageTitle',stage.title);put('managementStageText',stage.text);put('managementStageState',stage.state);
    put('managementDependency',stage.dependency);put('managementGate',stage.gate);put('managementCaption',stage.caption);put('managementRoleAnswer',roleAnswers[managementRole]);
    managementBoard.replaceChildren();
    platform.columns.forEach((heading,index)=>{
      const column=document.createElement('div');column.className=`workflow-board-column${index===stage.column?' is-current':''}`;
      const label=document.createElement('small');label.textContent=heading;column.append(label);
      const card=document.createElement('div');card.className='workflow-board-card';
      const image=document.createElement('img');image.alt='';image.src=`../../assets/icons/pixel/workflows/asana/${index===0?'task-document.png':index===1?'task-board.png':'search-review.png'}`;
      const body=document.createElement('span');const code=document.createElement('b');code.textContent=`${platform.prefix}-${String(managementStage*3+index+1).padStart(2,'0')}`;
      const title=document.createElement('strong');title.textContent=index===stage.column?roleCards[managementRole][managementStage]:stage.support[index];
      const foot=document.createElement('em');foot.textContent=index===stage.column?stage.state:stage.support[index];body.append(code,title,foot);card.append(image,body);column.append(card);managementBoard.append(column);
    });
  };
  const managementStagesTabs=tabs('[data-management-stage]',(button)=>{managementStage=Number(button.dataset.managementStage);showManagement();});
  const stopManagement=player(byId('managementPlay'),3,(index)=>managementStagesTabs.choose(managementStagesTabs.buttons[index]));
  managementStagesTabs.buttons.forEach((button) => { button.addEventListener('click', stopManagement); button.addEventListener('keydown', (event) => { if (event.key.startsWith('Arrow') || ['Home','End'].includes(event.key)) stopManagement(); }); });
  tabs('[data-management-platform]',(button)=>{stopManagement();managementPlatform=button.dataset.managementPlatform;managementStagesTabs.choose(managementStagesTabs.buttons[0]);});
  tabs('[data-management-role]',(button)=>{managementRole=button.dataset.managementRole;showManagement();});
  showManagement();

  const reviewStages=[
    ['AUTHOR','Prepare a reviewable lesson and name what feedback is needed.','Source: approved product brief'],
    ['L&D QA','Check navigation, practice, accessibility, and missing states.','Decision: ready for SME or return to author'],
    ['SUBJECT EXPERT','Validate facts and examples in the lesson context.','Decision: correction, clarification, or approval'],
    ['STAKEHOLDER','Check approved terminology and launch fit.','Decision: align competing requests before edit'],
    ['L&D + AUTHOR','Confirm required changes in the revised version.','Decision: close only after checking the new build'],
    ['RELEASE OWNER','Publish the approved file and retain its source.','Decision: access test and update owner recorded']
  ];
  const comments={
    sme:{type:'TECHNICAL ACCURACY',text:'“The customer would not know the solution yet. The question should identify the constraint first.”',decision:'Required correction',action:'Revise the choice and feedback, then ask the SME to confirm the technical meaning.',task:'Asana task · Owner: instructional designer',icon:'task-document.png',status:'Needs change'},
    brand:{type:'APPROVED TERMINOLOGY',text:'“Use the approved product term on this screen and in the facilitator notes.”',decision:'Check source language',action:'Compare the comment with the current terminology guide before changing both assets.',task:'Asana task · Owner: content editor',icon:'search-review.png',status:'Source check'},
    ld:{type:'LEARNING + ACCESSIBILITY',text:'“Make the feedback explain why the discovery question is the better next step.”',decision:'Learning design revision',action:'Rewrite feedback for the learner decision, then check focus order and screen-reader language.',task:'Asana task · Owner: instructional designer',icon:'approval-branch.png',status:'QA required'}
  };
  const reviewDemo=byId('reviewDemo');
  let reviewStage=0,reviewComment='sme';
  const showReview=()=>{
    const stage=reviewStages[reviewStage],comment=comments[reviewComment];
    animate(reviewDemo);
    put('reviewStageOwner',stage[0]);put('reviewStagePurpose',stage[1]);put('reviewStageBoundary',stage[2]);
    put('reviewCommentType',comment.type);put('reviewCommentText',comment.text);put('reviewDecision',comment.decision);put('reviewAction',comment.action);put('reviewTask',comment.task);picture('reviewActionIcon',`../../assets/icons/pixel/workflows/asana/${comment.icon}`);
    const finished=reviewStage>=4;put('reviewStatus',finished?'Checked in v04':comment.status);put('reviewVersion',finished?'Revision v04 · checked':'Draft v03 → revised v04');
    put('reviewWindowVersion',finished?'VERSION 04':'VERSION 03');
    put('reviewLessonChoice',finished?'Ask which constraints are shaping the customer’s decision.':'Ask a discovery question before recommending a solution.');
    put('reviewCaption',finished?'The revised lesson is checked before the comment is resolved and the approved file is published.':'A contextual comment becomes an assigned change, then returns for confirmation before resolution.');
    reviewDemo.dataset.reviewState=finished?'checked':'open';
  };
  tabs('[data-review-stage]',(button)=>{reviewStage=Number(button.dataset.reviewStage);showReview();});
  tabs('[data-review-comment]',(button)=>{reviewComment=button.dataset.reviewComment;showReview();});
  showReview();
})();
