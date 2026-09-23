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

  const operationData={
    access:{label:'User + Access Architecture',title:'Design access as the learner’s first experience.',text:'I translate profiles, group membership, permissions, audience rules, enrollment logic, and exception paths into an experience that puts the right learning in front of the right person. I test the same route from both the administrator and learner views.',flow:['Identity','Access rule','Learner route'],output:'The same learner attributes consistently resolve to the intended permissions, audience, and learning path.',image:'../../assets/project-images/lms-landing/lms-user-management.webp',alt:'Representative LMS user management view.'},
    content:{label:'Content + Learning Lifecycle',title:'Manage the lifecycle around learning, not just the upload.',text:'I manage course setup, catalogs, learning plans, prerequisites, publishing state, ownership, assessments, and version changes. When content changes, I account for active enrollments, dependencies, completion history, and how the new version affects the learner route.',flow:['Package QA','Route logic','Version control'],output:'Content can be released, replaced, and maintained without creating broken prerequisites, duplicate experiences, or lost completion history.',image:'../../assets/project-images/lms-topics/content-learning-plans.webp',alt:'Representative LMS content and learning-plan administration view.'},
    reporting:{label:'Reporting + Data Integrity',title:'Validate what a record means before a team acts on it.',text:'Completion, certification, enrollment, score, audience, and exception data only become useful when the rules behind them are clear. I compare exports, validate identifiers and status logic, preserve unmatched records, and turn reporting into a reviewable action list.',flow:['Extract','Reconcile','Act'],output:'Reports preserve the logic and exceptions needed to explain who is complete, who is not, and what follow-up is actually required.',image:'../../assets/project-images/lms-topics/reporting-follow-up.webp',alt:'Representative LMS reporting and follow-up view.'},
    governance:{label:'System Maintenance + Administration',title:'Give every rule, handoff, and exception an owner.',text:'I document permissions, system settings, matching keys, synchronization timing, troubleshooting paths, and support guidance. Connected systems add source-of-truth questions, so configuration and maintenance decisions need to stay reviewable.',flow:['Configure','Document','Monitor'],output:'A team can trace the owner, validation point, and exception path when a learner route or data handoff fails.',image:'../../assets/project-images/lms-topics/documentation-process.webp',alt:'Representative LMS documentation and process view.'}
  };
  setupTabs('[data-lms-operation]','lmsOperation',(key)=>{
    const d=operationData[key];if(!d)return;
    set('lmsOperationLabel',d.label);set('lmsOperationTitle',d.title);set('lmsOperationText',d.text);set('lmsOperationOutput',d.output);
    const flow=document.getElementById('lmsOperationFlow');if(flow)flow.innerHTML=d.flow.map((v,i)=>`<span>${v}</span>${i<d.flow.length-1?'<i></i>':''}`).join('');
    const image=document.getElementById('lmsOperationImage');if(image){image.src=d.image;image.alt=d.alt;}
  });

  const journeyData={
    identity:{label:'Identity',title:'Confirm the learner record resolves to the right person and operating context.',text:'I validate profile fields, matching keys, department or group placement, role, and SSO or login path before downstream rules depend on them.',system:'The learner record has the attributes and matching key the platform rules expect.',signal:'Duplicate users, missing attributes, mismatched records, or login friction that breaks later steps.',image:'../../assets/project-images/lms-landing/lms-user-management.webp',alt:'Representative LMS user management view.',caption:'Route validation starts with a reliable identity and matching rule.'},
    access:{label:'Access',title:'Confirm the learner can see and enter the intended environment.',text:'I test catalog visibility, permissions, role-based access, SSO state, audience membership, and the exception route for learners who should not follow the default path.',system:'The right learner can enter the platform and see the correct learning environment.',signal:'Missing catalog access, wrong visibility, permission errors, or support tickets around login and navigation.',image:'../../assets/project-images/lms-landing/lms-user-management.webp',alt:'Representative LMS user management view.',caption:'Access turns identity data into an available learning environment.'},
    assignment:{label:'Assignment',title:'Validate the rules that place the learner into the intended requirement.',text:'I test group rules, direct assignments, learning plans, prerequisites, due dates, certification requirements, renewals, and exceptions to confirm the correct requirement appears for the correct population.',system:'Assignment logic, prerequisites, and certification state resolve exactly as configured.',signal:'Unexpected enrollments, locked content, missing requirements, duplicate assignments, or renewal errors.',image:'../../assets/project-images/lms-migration/learning-pathway.webp',alt:'Representative LMS learning pathway view.',caption:'Assignment logic connects access rules to the learner path.'},
    launch:{label:'Launch',title:'Check the package and LMS context as one launch experience.',text:'I validate package compatibility, browser behavior, permissions, instructions, launch settings, tracking configuration, and the first learner action rather than treating a successful upload as proof of delivery.',system:'The intended package launches from the intended context and initializes tracking correctly.',signal:'Launch errors, blank states, quick exits, device-specific failures, or a course that opens without recording activity.',image:'../../assets/project-images/lms-landing/lms-course-player.webp',alt:'Representative LMS course player.',caption:'A launch check covers both the learning object and the platform around it.'},
    completion:{label:'Completion',title:'Confirm the learning event produces the intended status.',text:'I verify score, pass/fail, completion triggers, credit, resume behavior, and timing so the event the learner experiences is the event the platform receives.',system:'Learning activity, score, and completion behavior match the configured rules.',signal:'A course that is finished but still incomplete, a missed score, a broken resume state, or a completion trigger that fires too early.',image:'../../assets/project-images/lms-landing/lms-course-player.webp',alt:'Representative LMS course player.',caption:'Completion checks the event before it becomes a long-term record.'},
    record:{label:'Record',title:'Confirm the learner event becomes a trustworthy record.',text:'I verify transcript, certificate, credential, renewal, recertification, and history behavior so the platform record reflects what actually happened in the learning experience.',system:'Completion and credential status update in the expected learner records.',signal:'Missing certificates, inconsistent transcripts, renewal confusion, or learner history that no longer matches the completed experience.',image:'../../assets/project-images/lms-landing/lms-admin-dashboard.webp',alt:'Representative LMS administration dashboard.',caption:'A trusted record connects learner history, credentials, and the next step.'},
    report:{label:'Report',title:'Validate the data a team will use to make a decision.',text:'I trace the record into completion, certification, enrollment, score, audience, and exception reporting so downstream users can identify what is complete, what needs follow-up, and what needs investigation.',system:'Reports preserve the status logic, identifiers, and exceptions needed for a reliable decision.',signal:'Mismatched report status, missing learners, duplicated records, unclear exceptions, or follow-up based on data that cannot be explained.',image:'../../assets/project-images/lms-topics/reporting-follow-up.webp',alt:'Representative LMS reporting and follow-up view.',caption:'Reporting is the final check that turns platform records into informed action.'}
  };
  const journeyButtons=[...document.querySelectorAll('[data-lms-journey]')];
  setupTabs('[data-lms-journey]','lmsJourney',(key)=>{
    const d=journeyData[key];if(!d)return;
    const index=journeyButtons.findIndex(b=>b.dataset.lmsJourney===key);
    const progress=document.getElementById('lmsJourneyProgress');if(progress){const lastIndex=Math.max(1,journeyButtons.length-1);progress.style.width=`${Math.max(0,index)/lastIndex*100}%`;}
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
