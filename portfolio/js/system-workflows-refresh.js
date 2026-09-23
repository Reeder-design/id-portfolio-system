(() => {
  const asset = (group, file) => `../../assets/icons/pixel/${group}/${file}`;
  const ms = [
    {step:'Request', source:'OUTLOOK / TEAMS', input:'A learner access question arrives.', meta:'Owner: support team', target:'REQUEST QUEUE', action:'Confirm the issue and next owner.', icon:asset('work-tools','outlook.webp'), status:'New request', caption:'Communication becomes a visible request, not an untracked message.'},
    {step:'Document', source:'ISSUE PATTERN', input:'The current access path is checked.', meta:'Reference: approved guidance', target:'SHARED DOCUMENT', action:'Update a reusable answer and source note.', icon:asset('work-tools','word.webp'), status:'Draft for review', caption:'A shared document carries the durable answer and its source.'},
    {step:'Review', source:'SHARED FILE', input:'A reviewer checks the guidance.', meta:'Owner: source or support lead', target:'REVIEW RECORD', action:'Record a correction or approval.', icon:asset('work-tools','sharepoint.webp'), status:'Decision visible', caption:'A version and decision trail reduce conflicting answers.'},
    {step:'Handoff', source:'APPROVED GUIDANCE', input:'The updated response is ready.', meta:'Location: shared workspace', target:'DELIVERABLE', action:'Send the response and retain the reference.', icon:asset('work-tools','outlook.webp'), status:'Ready to reuse', caption:'The handoff connects the message, final file, and follow-up.'}
  ];
  const asana = {
    review:[
      {step:'Comment', source:'Review 360 comment needs a change.', meta:'Source: in-course review', column:'NEW / SOURCE', owner:'Review note', action:'Capture the requested change.', status:'Unassigned', icon:asset('workflows/asana','task-document.png'), caption:'A reviewer comment becomes a task rather than a loose note.'},
      {step:'Assign', source:'The change has an owner and scope.', meta:'Source: reviewed comment', column:'ASSIGNED', owner:'Owner: designer', action:'Translate feedback into a specific edit.', status:'In progress', icon:asset('workflows/asana','task-board.png'), caption:'Task ownership makes the next action visible.'},
      {step:'Check', source:'The revised lesson is ready to inspect.', meta:'Source: updated build', column:'REVIEW', owner:'Reviewer: SME', action:'Confirm the change in context.', status:'Awaiting review', icon:asset('workflows/asana','search-review.png'), caption:'The task stays open until the change is checked in the learning experience.'},
      {step:'Close', source:'The comment and edit agree.', meta:'Source: review record', column:'COMPLETE', owner:'Decision: accepted', action:'Close the change and preserve its trail.', status:'Resolved', icon:asset('workflows/asana','approved-checklist.png'), caption:'Completion means the review loop is closed, not only that a card moved.'}
    ],
    intake:[
      {step:'Form', source:'A new request captures audience and need.', meta:'Illustrative platform pattern', column:'NEW REQUEST', owner:'Intake form', action:'Create a structured task.', status:'Submitted', icon:asset('workflows/asana','task-document.png'), caption:'Structured intake gives the next owner usable context.'},
      {step:'Rule', source:'The request type is evaluated.', meta:'Illustrative platform pattern', column:'ROUTING RULE', owner:'Rule: request type', action:'Route to the correct work queue.', status:'Routed', icon:asset('workflows/asana','automation-rule.png'), caption:'A rule moves repeatable work while unusual cases remain visible.'},
      {step:'Owner', source:'The task reaches its responsible team.', meta:'Illustrative platform pattern', column:'ASSIGNED', owner:'Owner: learning team', action:'Track the work and dependency.', status:'Working', icon:asset('workflows/asana','linked-work.png'), caption:'Assignment and dependencies keep the handoff clear.'},
      {step:'Approve', source:'The output needs an expert decision.', meta:'Illustrative platform pattern', column:'APPROVAL', owner:'Reviewer: source owner', action:'Approve, request changes, or hold.', status:'Human checkpoint', icon:asset('workflows/asana','approval-branch.png'), caption:'Automation pauses where source accuracy requires judgment.'},
      {step:'Visible', source:'A decision updates the work record.', meta:'Illustrative platform pattern', column:'DASHBOARD', owner:'Team: shared view', action:'Show status, owner, and next action.', status:'Visible', icon:asset('workflows/asana','analytics-dashboard.png'), caption:'A dashboard is useful when the underlying task and decision are trustworthy.'}
    ]
  };
  const tools = {
    support:{label:'Support + knowledge', title:'Turn recurring issues into guidance people can reuse.', text:'An LMS support question becomes a checked response template, a reference note, or an escalation path instead of being redrafted each time.', practice:'Keep send-ready messages distinct from internal reference notes.', boundary:'Confirm the current access path before reusing a template.', link:'../lms-administration/index.html', linkText:'Explore LMS Administration →', heading:'SUPPORT DESK · FICTIONAL', steps:[
      {step:'Issue', app:'OUTLOOK', action:'Access request arrives', status:'Needs triage', icon:asset('work-tools','outlook.webp'), caption:'Identify the issue type before selecting guidance.'},
      {step:'Check', app:'LMS + SOURCE GUIDE', action:'Confirm the current access path', status:'Guidance verified', icon:asset('work-tools','docebo.webp'), caption:'A template should follow current platform behavior, not memory.'},
      {step:'Respond', app:'RESPONSE TEMPLATE', action:'Send the tailored answer', status:'Learner informed', icon:asset('workflows/support-resources','documentation.webp'), caption:'The reusable message keeps the response consistent.'},
      {step:'Improve', app:'KNOWLEDGE RECORD', action:'Update the issue guidance', status:'Pattern retained', icon:asset('workflows/support-resources','guidance.webp'), caption:'Repeated cases become a better process and reference.'}
    ]},
    handoff:{label:'System handoff', title:'Verify the source record before mapping it to learning access.', text:'A learner email starts a Salesforce account lookup. Verified fields become an LMS-ready department or placement record, while uncertain matches wait for review.', practice:'Document field mappings and matching keys before automating the transfer.', boundary:'No-match and ambiguous records stop before final placement.', link:'ai-automation/salesforce-lms-account-automation/index.html', linkText:'Explore the Salesforce-to-LMS case →', heading:'ACCOUNT MAPPING · FICTIONAL', steps:[
      {step:'Lookup', app:'SALESFORCE', action:'Search by learner key', status:'Account candidate', icon:asset('work-tools','salesforce.webp'), caption:'Browser automation repeats the lookup.'},
      {step:'Verify', app:'SOURCE RECORD', action:'Check account context', status:'Match confirmed', icon:asset('workflows/asana','search-review.png'), caption:'An ambiguous match is held for a person.'},
      {step:'Map', app:'LMS FIELD MAP', action:'Translate account fields', status:'LMS-ready record', icon:asset('workflows/systems-administration','integrations.webp'), caption:'Documented rules connect source and destination fields.'},
      {step:'Review', app:'ABSORB LMS', action:'Prepare placement for review', status:'Human checkpoint', icon:asset('work-tools','absorb.webp'), caption:'The automated path stops before uncertain placement.'}
    ]},
    reporting:{label:'Data + reporting', title:'Turn repeated exports into a reviewable status picture.', text:'Saved LMS reports become comparable spreadsheet data and a workbook that exposes completion status and exceptions.', practice:'Validate expected exports and a stable learner key before comparison.', boundary:'Review unusual or unmatched records before distributing results.', link:'data-reporting/certification-reporting-automation/index.html', linkText:'Explore Reporting Automation →', heading:'REPORT WORKSPACE · FICTIONAL', steps:[
      {step:'Export', app:'LMS REPORTS', action:'Download four saved reports', status:'Input package', icon:asset('lms-admin/reporting-automation','exporting-reports.png'), caption:'The same required reports begin each run.'},
      {step:'Analyze', app:'PYTHON', action:'Normalize and compare records', status:'Evidence joined', icon:asset('work-tools','python.webp'), caption:'Stable keys connect activity and certificate evidence.'},
      {step:'Review', app:'EXCEPTION QUEUE', action:'Hold unusual records', status:'Human QA', icon:asset('workflows/asana','approval-branch.png'), caption:'Missing or ambiguous data stays visible.'},
      {step:'Deliver', app:'EXCEL', action:'Write review-ready workbook', status:'Complete / Incomplete', icon:asset('work-tools','excel.webp'), caption:'The final file is organized for stakeholder review.'}
    ]},
    agents:{label:'Reusable knowledge', title:'Give an assistant a defined job and trusted source set.', text:'I structure agent instructions and prompt libraries around a repeatable retrieval, drafting, or synthesis task. Sources, boundaries, and review criteria remain part of the workflow.', practice:'Keep instructions, reference material, and version context reusable.', boundary:'Review output for accuracy, privacy, and fit before anyone uses it.', link:'../ai-training-and-evaluation/index.html', linkText:'Explore AI Training + Evaluation →', heading:'KNOWLEDGE SYSTEM · FICTIONAL', steps:[
      {step:'Define', app:'TASK BRIEF', action:'Name the repeatable job', status:'Scope set', icon:asset('workflows/content-creation','templates.webp'), caption:'A clear job prevents an assistant from guessing its role.'},
      {step:'Ground', app:'SOURCE LIBRARY', action:'Connect approved references', status:'Sources attached', icon:asset('work-tools','documentation.webp'), caption:'The source set and context can be updated without rebuilding the task.'},
      {step:'Run', app:'AGENT INSTRUCTIONS', action:'Draft from trusted material', status:'Draft produced', icon:asset('ai-evaluation','workflow-automation.webp'), caption:'Reusable instructions handle routine synthesis and formatting.'},
      {step:'Review', app:'HUMAN REVIEW', action:'Check claims and boundaries', status:'Approved or revised', icon:asset('ai-evaluation','workflow-reviewer.webp'), caption:'A person checks accuracy, privacy, context, and usefulness.'}
    ]}
  };

  const setText=(id,value)=>{const node=document.getElementById(id);if(node)node.textContent=value;};
  const setImage=(id,src)=>{const node=document.getElementById(id);if(node)node.src=src;};
  const setupSequence=(root,getSteps,paint)=>{
    if(!root)return null;
    const list=root.querySelector('.workflow-sim-steps');
    const play=root.querySelector('.workflow-sim-play');
    let index=0,timer=null;
    const stop=()=>{if(timer)clearInterval(timer);timer=null;if(play)play.textContent='Play sequence';};
    const render=(next,focus=false)=>{
      const steps=getSteps();
      index=(next+steps.length)%steps.length;
      root.classList.remove('is-changing');void root.offsetWidth;root.classList.add('is-changing');
      [...list.children].forEach((button,i)=>{const active=i===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();});
      paint(steps[index],index);
    };
    const rebuild=()=>{
      stop();index=0;list.replaceChildren();
      getSteps().forEach((entry,i)=>{
        const button=document.createElement('button');button.type='button';button.setAttribute('role','tab');button.textContent=`${String(i+1).padStart(2,'0')} ${entry.step}`;
        button.addEventListener('click',()=>{stop();render(i);});
        button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();stop();const next=event.key==='Home'?0:event.key==='End'?getSteps().length-1:event.key==='ArrowRight'||event.key==='ArrowDown'?i+1:i-1;render(next,true);});
        list.append(button);
      });render(0);
    };
    play?.addEventListener('click',()=>{if(timer){stop();return;}play.textContent='Pause sequence';render(0);timer=setInterval(()=>{if(index>=getSteps().length-1){stop();play.textContent='Replay sequence';return;}render(index+1);if(index===getSteps().length-1){stop();play.textContent='Replay sequence';}},2600);});
    rebuild();return {rebuild,stop};
  };

  setupSequence(document.querySelector('[data-sim="microsoft"]'),()=>ms,entry=>{
    setText('msSourceLabel',entry.source);setText('msSourceText',entry.input);setText('msSourceMeta',entry.meta);setText('msTargetLabel',entry.target);setText('msTargetText',entry.action);setText('msStatus',entry.status);setText('msCaption',entry.caption);setImage('msAsset',entry.icon);
  });
  let asanaMode='review';
  const asanaSequence=setupSequence(document.querySelector('[data-sim="asana"]'),()=>asana[asanaMode],entry=>{
    setText('asanaModeLabel',asanaMode==='review'?'REVIEW COORDINATION':'INTAKE + RULES · ILLUSTRATIVE');setText('asanaTask',entry.source);setText('asanaTaskMeta',entry.meta);setText('asanaColumn',entry.column);setText('asanaOwner',entry.owner);setText('asanaAction',entry.action);setText('asanaStatus',entry.status);setText('asanaCaption',entry.caption);setImage('asanaAsset',entry.icon);
  });
  const asanaButtons=[...document.querySelectorAll('[data-asana-mode]')];
  const selectAsana=(button,focus=false)=>{asanaMode=button.dataset.asanaMode;asanaButtons.forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-selected',String(active));other.tabIndex=active?0:-1;});asanaSequence?.rebuild();if(focus)button.focus();};
  asanaButtons.forEach((button,i)=>{button.addEventListener('click',()=>selectAsana(button));button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?asanaButtons.length-1:event.key==='ArrowRight'?(i+1)%asanaButtons.length:(i+asanaButtons.length-1)%asanaButtons.length;selectAsana(asanaButtons[next],true);});});
  let toolMode='support';
  const toolSurfaceViews={
    support:[['Access question','Needs triage'],['Current access path','Guide verified'],['Tailored answer','Response sent'],['Recurring issue','Template updated']],
    handoff:[['Account candidate','Unmapped'],['Verified account','Review if unclear'],['Account fields','LMS fields'],['Verified context','Placement review']],
    reporting:[['Four files','Raw rows','Pending'],['Learner 0142','Joined','Calculated'],['Learner 0142','Conflict','Hold'],['Workbook','Complete','QA ready']],
    agents:[['Support synthesis','Source needed','Criteria set'],['Defined job','Approved guide','Source check'],['Draft summary','Linked excerpts','Review pending'],['Reviewed output','Sources cited','Claims checked']]
  };
  const toolSequence=setupSequence(document.querySelector('[data-sim="tools"]'),()=>tools[toolMode].steps,(entry,index)=>{
    setText('toolSimApp',entry.app);setText('toolSimAction',entry.action);setText('toolSimStatus',entry.status);setText('toolSimCaption',entry.caption);setImage('toolSimAsset',entry.icon);
    document.querySelectorAll(`.workflow-tool-surface-${toolMode} i`).forEach((node,i)=>{node.textContent=toolSurfaceViews[toolMode][index][i];});
  });
  const toolButtons=[...document.querySelectorAll('button[data-tool-mode]')];
  const selectTool=(button,focus=false)=>{
    toolMode=button.dataset.toolMode;const group=tools[toolMode];
    toolButtons.forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-selected',String(active));other.tabIndex=active?0:-1;});
    document.querySelector('[data-sim="tools"]')?.setAttribute('data-tool-mode',toolMode);
    setText('toolModeLabel',group.label);setText('toolModeTitle',group.title);setText('toolModeText',group.text);setText('toolModePractice',group.practice);setText('toolModeBoundary',group.boundary);setText('toolSimHeading',group.heading);
    const link=document.getElementById('toolModeLink');if(link){link.href=group.link;link.textContent=group.linkText;}
    toolSequence?.rebuild();if(focus)button.focus();
  };
  toolButtons.forEach((button,i)=>{button.addEventListener('click',()=>selectTool(button));button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?toolButtons.length-1:event.key==='ArrowRight'||event.key==='ArrowDown'?(i+1)%toolButtons.length:(i+toolButtons.length-1)%toolButtons.length;selectTool(toolButtons[next],true);});});
})();
