(function(){
  'use strict';

  const setupTabs=(selector,dataKey,render)=>{
    const buttons=[...document.querySelectorAll(selector)];
    const activate=(button)=>{buttons.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});render(button.dataset[dataKey]);};
    buttons.forEach((button,index)=>{
      button.tabIndex=button.getAttribute('aria-selected')==='true'?0:-1;
      button.addEventListener('click',()=>activate(button));
      button.addEventListener('keydown',(event)=>{
        if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
        event.preventDefault();
        let next=index;
        if(event.key==='Home')next=0; else if(event.key==='End')next=buttons.length-1;
        else if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%buttons.length;
        else next=(index-1+buttons.length)%buttons.length;
        buttons[next].focus();activate(buttons[next]);
      });
    });
  };
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};

  const roleData={
    admin:{label:'Administration',title:'Build the rules that control who sees what, when, and why.',text:'I work with user attributes, departments or groups, roles, catalogs, learning plans, certification rules, visibility, prerequisites, ownership, and exception handling so the learner route is intentional instead of manually patched.',practice:['Audience architecture','Learning-plan logic','Certification rules','Permissions + ownership'],evidence:'The configuration produces the expected learner population, assignment state, access rules, and administrative ownership.',map:['Profile','Group','Path']},
    delivery:{label:'Delivery',title:'Treat publishing as a lifecycle with dependencies, not an upload step.',text:'I validate package compatibility, course metadata, catalog placement, prerequisites, learning-plan relationships, completion behavior, version replacement, and learner-facing instructions before release. The goal is to preserve the intended learning path and historical data while content changes over time.',practice:['SCORM / xAPI behavior','Version control','Prerequisites','Publishing + QA'],evidence:'The right package launches in the right context, records the intended status, and can be updated without breaking the learner history.',map:['Package','QA','Publish']},
    support:{label:'Support',title:'Use learner friction as diagnostic evidence for the system.',text:'I troubleshoot access, navigation, completion, certification, and assignment issues; maintain reusable guidance and support responses; document recurring failures; and route patterns back into configuration, content, or process changes.',practice:['Issue triage','Learner guidance','Support documentation','Pattern analysis'],evidence:'The immediate issue is resolved, the root cause is documented, and repeated friction becomes an improvement signal instead of recurring manual work.',map:['Ticket','Root cause','Improve']}
  };
  setupTabs('[data-lms-role]','lmsRole',(key)=>{
    const d=roleData[key]; if(!d)return;
    set('lmsRoleLabel',d.label);set('lmsRoleTitle',d.title);set('lmsRoleText',d.text);set('lmsRoleEvidence',d.evidence);
    const practice=document.getElementById('lmsRolePractice');if(practice)practice.replaceChildren(...d.practice.map(v=>{const x=document.createElement('span');x.textContent=v;return x;}));
    const map=document.getElementById('lmsRoleMap');if(map)map.innerHTML=d.map.map((v,i)=>`<span>${v}</span>${i<d.map.length-1?'<i></i>':''}`).join('');
  });

  const operationData={
    access:{label:'User + Access Architecture',title:'Translate organizational data into reliable learner access.',text:'Profiles, department or group membership, role permissions, audience rules, enrollment logic, and exceptions determine which experience a learner actually receives. I test those relationships from both the administrator view and the learner view.',flow:['Profile','Audience rule','Enrollment'],output:'The same learner attributes consistently resolve to the intended permissions, audience, and learning path.',image:'../../assets/project-images/lms-landing/lms-user-management.webp',alt:'Representative LMS user management view.'},
    content:{label:'Content + Learning Lifecycle',title:'Control the learning object from package through retirement.',text:'I manage course setup, catalogs, learning plans, prerequisites, publishing state, ownership, assessments, and version changes. When content is replaced, I account for completion history, active enrollments, dependencies, and how the new version changes the learner route.',flow:['Package QA','Path logic','Version control'],output:'Content can be published, replaced, and maintained without creating broken prerequisites, duplicate experiences, or lost completion history.',image:'../../assets/project-images/lms-topics/content-learning-plans.webp',alt:'Representative LMS content and learning-plan administration view.'},
    reporting:{label:'Reporting + Data Integrity',title:'Validate the meaning of the data before using it for follow-up.',text:'Completion, certification, enrollment, score, audience, and exception data only becomes useful when the underlying rules are understood. I compare exports, validate identifiers and status logic, preserve unmatched records, and turn reporting into a reviewable action list.',flow:['Extract','Validate','Act'],output:'Reports preserve the logic and exceptions needed to explain who is complete, who is not, and what follow-up is actually required.',image:'../../assets/project-images/lms-topics/reporting-follow-up.webp',alt:'Representative LMS reporting and follow-up view.'},
    governance:{label:'Governance + Integrations',title:'Make ownership, data sources, and change rules explicit.',text:'Connected systems introduce source-of-truth questions, matching keys, permissions, synchronization timing, failure states, and maintenance ownership. I document those dependencies before using APIs, scripts, imports, exports, or workflow automation to extend the LMS.',flow:['Source','Contract','Monitor'],output:'Each handoff has a known owner, matching rule, validation point, and exception path instead of hidden operational debt.',image:'../../assets/project-images/lms-topics/documentation-process.webp',alt:'Representative LMS documentation and process view.'}
  };
  setupTabs('[data-lms-operation]','lmsOperation',(key)=>{
    const d=operationData[key];if(!d)return;
    set('lmsOperationLabel',d.label);set('lmsOperationTitle',d.title);set('lmsOperationText',d.text);set('lmsOperationOutput',d.output);
    const flow=document.getElementById('lmsOperationFlow');if(flow)flow.innerHTML=d.flow.map((v,i)=>`<span>${v}</span>${i<d.flow.length-1?'<i></i>':''}`).join('');
    const image=document.getElementById('lmsOperationImage');if(image){image.src=d.image;image.alt=d.alt;}
  });

  const journeyData={
    provision:{label:'Provision',title:'Confirm the learner record resolves to the correct identity and audience.',text:'I validate the profile fields, department or group placement, role, SSO or login path, and audience membership that downstream assignment rules depend on.',system:'Profile attributes and audience membership match the intended population.',signal:'Missing catalog access, wrong assignments, duplicate users, or support tickets around login and visibility.',image:'../../assets/project-images/lms-landing/lms-user-management.webp',alt:'Representative LMS user management view.',caption:'Route validation starts before the learner reaches the course.'},
    assign:{label:'Assign',title:'Validate the rules that place the learner into the intended requirement.',text:'I test group rules, direct assignments, learning plans, prerequisites, due dates, certification requirements, renewals, and exceptions to confirm the correct requirement appears for the correct population.',system:'Assignment logic, prerequisites, and certification state resolve exactly as configured.',signal:'Unexpected enrollments, locked content, missing requirements, duplicate assignments, or renewal errors.',image:'../../assets/project-images/lms-migration/learning-pathway.webp',alt:'Representative LMS learning pathway view.',caption:'Assignment logic connects audience rules to the learner path.'},
    launch:{label:'Launch',title:'Check the package and the LMS context as one launch experience.',text:'I validate package compatibility, browser behavior, permissions, instructions, launch settings, tracking configuration, and the first learner action rather than treating a successful upload as proof of delivery.',system:'The intended package launches from the intended context and initializes tracking correctly.',signal:'Launch errors, blank states, quick exits, device-specific failures, or a course that opens without recording activity.',image:'../../assets/project-images/lms-landing/lms-course-player.webp',alt:'Representative LMS course player.',caption:'A launch check covers both the learning object and the platform around it.'},
    record:{label:'Record',title:'Confirm the learner action becomes trustworthy completion data.',text:'I verify score, completion, pass/fail, credit, certificate, transcript, and reporting behavior so the platform record reflects what actually happened in the learning experience.',system:'Completion and credential status update in the expected records and reports.',signal:'Completed learning still showing incomplete, missing certificates, inconsistent scores, or mismatched report status.',image:'../../assets/project-images/lms-landing/lms-admin-dashboard.webp',alt:'Representative LMS administration dashboard.',caption:'Completion is only useful when the recorded state matches the learner event.'},
    continue:{label:'Continue',title:'Test what happens after the first completion.',text:'I account for transcripts, renewals, recertification, follow-up resources, communities, reinforcement, communications, and the next assigned requirement so the learner does not hit a dead end after completion.',system:'The next requirement, renewal state, or support resource is visible when expected.',signal:'Renewal confusion, missing follow-up, repeated support questions, or learners returning to outdated content.',image:'../../assets/project-images/lms-landing/lms-community-transcript.webp',alt:'Representative LMS community and transcript view.',caption:'The operational learner journey continues after completion.'}
  };
  const journeyButtons=[...document.querySelectorAll('[data-lms-journey]')];
  setupTabs('[data-lms-journey]','lmsJourney',(key)=>{
    const d=journeyData[key];if(!d)return;
    const index=journeyButtons.findIndex(b=>b.dataset.lmsJourney===key);
    const progress=document.getElementById('lmsJourneyProgress');if(progress)progress.style.width=`${Math.max(0,index)*25}%`;
    set('lmsJourneyLabel',d.label);set('lmsJourneyTitle',d.title);set('lmsJourneyText',d.text);set('lmsJourneySystem',d.system);set('lmsJourneySignal',d.signal);set('lmsJourneyCaption',d.caption);
    const image=document.getElementById('lmsJourneyImage');if(image){image.src=d.image;image.alt=d.alt;}
  });

  const integrationData={
    identity:{label:'Identity + Access',title:'Treat identity fields as operational dependencies, not profile decoration.',text:'User IDs, email, role, department, region, SSO attributes, and group membership can drive access and assignment logic. I identify which system owns each value, what key links the records, and what exception path exists when the data does not resolve cleanly.',source:'Identity / user record',validation:'The same user resolves to the expected role, group, and access state.'},
    business:{label:'CRM / HR Data',title:'Map business context only after the source and matching rule are clear.',text:'Account, role, region, employee, partner, or customer data can control segmentation, placement, communication, or reporting. I document the source system, matching key, field transformation, and no-match handling before automating the handoff.',source:'CRM / HR / account system',validation:'Mapped records preserve the correct account or organizational context and visibly surface ambiguous matches.'},
    content:{label:'Content + Tracking',title:'Define what the learning object must exchange with the LMS.',text:'SCORM, xAPI, cmi5 concepts, launch parameters, completion rules, score behavior, and learner events determine how the course communicates with the platform. I test the data I need the LMS to receive, not only whether the package opens.',source:'Learning package / tracking standard',validation:'Launch, state, score, completion, and resume behavior match the intended learning requirement.'},
    analytics:{label:'Analytics + Extensions',title:'Extend LMS data without losing the original meaning or exceptions.',text:'Exports, APIs, reporting scripts, dashboards, credential workflows, and automation can make LMS data more useful, but only if identifiers and status logic stay traceable. I preserve review points for missing, duplicated, or conflicting records.',source:'LMS reports / API / exports',validation:'Downstream analysis can be traced back to the LMS record and keeps exception states visible.'}
  };
  setupTabs('[data-lms-integration]','lmsIntegration',(key)=>{
    const d=integrationData[key];if(!d)return;
    set('lmsIntegrationLabel',d.label);set('lmsIntegrationTitle',d.title);set('lmsIntegrationText',d.text);set('lmsIntegrationSource',d.source);set('lmsIntegrationValidation',d.validation);
  });
})();