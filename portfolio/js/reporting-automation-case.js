(() => {
  const parentBreadcrumb = document.getElementById('reportingParentBreadcrumb');
  if (parentBreadcrumb && new URLSearchParams(window.location.search).get('from') === 'lms') {
    parentBreadcrumb.textContent = 'LMS Administration';
    parentBreadcrumb.href = '../../../lms-administration/index.html';
  }
  const stepData = {
    pull: {
      label: 'Browser automation',
      title: 'Generate and download the four saved LMS reports.',
      summary: 'Selenium opens the saved report views, generates each export, and downloads the Excel files in the expected sequence.',
      tool: 'Selenium',
      automated: 'Repeated browser navigation, report generation, and download steps.',
      validation: 'Confirm the expected report package exists before analysis begins.',
      output: 'Four Excel exports ready for data processing.',
      visual: '4 exports downloaded'
    },
    validate: {
      label: 'Input control',
      title: 'Check the report package before transforming any data.',
      summary: 'The workflow verifies expected files and naming patterns so a missing or failed export does not quietly flow into the analysis.',
      tool: 'Python',
      automated: 'File checks and expected-input validation.',
      validation: 'Stop on missing downloads or an incomplete report set.',
      output: 'A known-good input package.',
      visual: 'input package verified'
    },
    normalize: {
      label: 'Data preparation',
      title: 'Read and normalize the exported learner records.',
      summary: 'pandas loads the relevant report data and brings the exported fields into a consistent shape before comparison.',
      tool: 'pandas',
      automated: 'Reading exports, selecting relevant fields, and normalizing comparison values.',
      validation: 'Surface missing keys or records that cannot be normalized cleanly.',
      output: 'Comparable activity and certificate datasets.',
      visual: 'records normalized'
    },
    compare: {
      label: 'Completion logic',
      title: 'Compare course and certificate evidence by learner.',
      summary: 'A stable username key connects the report evidence so the workflow can classify records without manually comparing spreadsheets row by row.',
      tool: 'pandas',
      automated: 'Joining learner evidence and applying documented completion rules.',
      validation: 'Keep unmatched, duplicate, or unexpected states available for review.',
      output: 'Classified learner records with visible exceptions.',
      visual: 'evidence compared'
    },
    write: {
      label: 'Review output',
      title: 'Write the final review workbook.',
      summary: 'openpyxl creates a structured Excel workbook that separates Complete and Incomplete learners and includes learner type for review.',
      tool: 'openpyxl',
      automated: 'Workbook creation, worksheet structure, and organized output.',
      validation: 'Review exception records before the workbook is treated as final.',
      output: 'Complete and Incomplete worksheets with user type.',
      visual: 'review workbook created'
    }
  };

  const needData = {
    inputs: {
      label: 'Input control',
      title: 'Start with the same four reports every time.',
      summary: 'The workflow expects employee and partner activity and certificate exports in a known sequence before analysis begins.'
    },
    logic: {
      label: 'Comparison control',
      title: 'Make the status logic easy to inspect.',
      summary: 'A stable learner key and documented rules connect the report evidence without burying how Complete and Incomplete statuses were assigned.'
    },
    review: {
      label: 'Judgment control',
      title: 'Automate the repetition, not the final judgment.',
      summary: 'Missing, duplicate, unmatched, and unusual records stay visible so a reviewer can resolve them before the workbook is final.'
    }
  };

  const needVisuals = {
    inputs: '<p>4 required reports</p><div class="need-input-files"><span>01</span><span>02</span><span>03</span><span>04</span></div><div class="need-input-route"><i></i></div>',
    logic: '<p>inspect → apply rule</p><div class="need-logic-records"><span></span><span></span><span></span></div><div class="need-logic-lens"><img src="../../../../assets/icons/pixel/ai-evaluation/demo-search.webp" alt=""></div><div class="need-logic-rule"><b>✓</b><small>rule applied</small></div>',
    review: '<p>exception → decision</p><div class="need-review-queue"><span></span><span></span><span></span></div><div class="need-review-person"><img src="../../../../assets/icons/pixel/ai-evaluation/workflow-reviewer.webp" alt=""></div><div class="need-review-choice"><span>hold</span><span>approve</span></div>'
  };

  const exceptionData = {
    missing: {
      label: 'Input check',
      title: 'Stop before analysis if the report set is incomplete.',
      automation: 'The workflow checks for the expected exports instead of moving forward with a partial report package.',
      human: 'Confirm the missing report, rerun it if needed, and only continue when the input set is complete.',
      icon: '../../../../assets/icons/pixel/lms/mini-document.webp'
    },
    unmatched: {
      label: 'Join check',
      title: 'Keep an unmatched learner visible instead of dropping the record.',
      automation: 'The comparison logic surfaces learner keys that do not join across the expected report evidence.',
      human: 'Review the learner record and determine whether the source data, report scope, or completion evidence needs correction.',
      icon: '../../../../assets/icons/pixel/lms/mini-user.webp'
    },
    duplicate: {
      label: 'Record check',
      title: 'Flag duplicate candidates instead of guessing which row is correct.',
      automation: 'The workflow preserves duplicate or ambiguous records for review rather than silently choosing one.',
      human: 'Confirm which source record should be used before a final status is accepted.',
      icon: '../../../../assets/icons/pixel/lms/mini-sync.webp'
    },
    state: {
      label: 'Logic check',
      title: 'Surface a completion pattern that does not match the expected rule.',
      automation: 'Unexpected evidence combinations remain visible instead of being forced into a clean status.',
      human: 'Review the source records and decide whether the state reflects data timing, reporting behavior, or a true exception.',
      icon: '../../../../assets/icons/pixel/ai-evaluation/workflow-checklist.webp'
    }
  };

  const stageVisuals = {
    pull: `<div class="report-ui-head"><b>Absorb / saved reports</b><span>Export queue · 4 of 4</span></div><div class="report-ui-grid report-ui-queue"><div><small>REPORT</small><strong>Employee activity</strong><em>Downloaded ✓</em></div><div><small>REPORT</small><strong>Partner activity</strong><em>Downloaded ✓</em></div><div><small>REPORT</small><strong>Employee certificates</strong><em>Downloaded ✓</em></div><div><small>REPORT</small><strong>Partner certificates</strong><em>Downloaded ✓</em></div></div><div class="report-ui-progress"><i></i><span>Browser run → expected files present</span></div>`,
    validate: `<div class="report-ui-head"><b>Input gate / file audit</b><span>Stop on an incomplete set</span></div><div class="report-ui-grid report-ui-audit"><div><strong>01 · Activity / employee</strong><em>✓ Found</em></div><div><strong>02 · Activity / partner</strong><em>✓ Found</em></div><div><strong>03 · Certificates / employee</strong><em>✓ Found</em></div><div><strong>04 · Certificates / partner</strong><em>✓ Found</em></div></div><div class="report-ui-note">Check filename, format, and report count before parsing rows.</div>`,
    normalize: `<div class="report-ui-head"><b>pandas / field crosswalk</b><span>Consistent comparison keys</span></div><div class="report-ui-map"><div><small>SOURCE FIELDS</small><span>User Name</span><span>Completion Date</span><span>Certificate Status</span></div><div class="report-ui-arrows"><i>→</i><i>→</i><i>→</i></div><div><small>NORMALIZED FIELDS</small><span>username</span><span>completed_at</span><span>certificate_state</span></div></div><div class="report-ui-note">Missing keys are surfaced for review instead of silently dropped.</div>`,
    compare: `<div class="report-ui-head"><b>Evidence join / username</b><span>Activity + certificate</span></div><div class="report-ui-compare"><div><small>ACTIVITY</small><strong>alex.r · Course complete</strong><strong>sam.p · Course complete</strong></div><i>+</i><div><small>CERTIFICATE</small><strong>alex.r · Awarded</strong><strong>sam.p · Missing</strong></div></div><div class="report-ui-result"><span>alex.r → Complete</span><span>sam.p → Exception review</span></div>`,
    write: `<div class="report-ui-head"><b>openpyxl / review workbook</b><span>Human-readable output</span></div><div class="report-ui-book"><div class="report-ui-tabs"><span>Complete</span><span>Incomplete</span><span>Exceptions</span></div><div class="report-ui-sheet"><div><b>Username</b><b>Course</b><b>Status</b></div><div><span>alex.r</span><span>Sales cert</span><em>Complete</em></div><div><span>sam.p</span><span>Sales cert</span><em>Review</em></div></div></div><div class="report-ui-note">Review totals and exceptions before sharing the workbook.</div>`
  };

  const exceptionVisuals = {
    missing: '<p>expected set</p><div class="exception-file-set"><span>01</span><span>02</span><span class="is-missing">03</span><span>04</span></div><div class="exception-stop"><b>!</b><small>pause</small></div>',
    unmatched: '<p>identity match</p><div class="exception-person"><img src="../../../../assets/icons/pixel/lms/mini-user.webp" alt=""></div><div class="exception-id-lines"><span></span><span></span></div><div class="exception-no-match">×</div>',
    duplicate: '<p>duplicate candidates</p><div class="exception-duplicate-card duplicate-a"><span></span><span></span></div><div class="exception-duplicate-card duplicate-b"><span></span><span></span></div><div class="exception-duplicate-alert">2?</div>',
    state: '<p>rule check</p><div class="exception-state-list"><span></span><span></span><span class="is-unexpected"></span><span></span></div><div class="exception-state-review"><img src="../../../../assets/icons/pixel/ai-evaluation/workflow-reviewer.webp" alt=""></div>'
  };

  const evidenceData = {
    course: {
      src: '../../../../assets/project-images/reporting-automation/report-course-completion.webp',
      alt: 'Public-safe fictional course completion report with learner, department, course, status, completion date, and time-spent columns.',
      label: 'Course completion report',
      caption: 'A spreadsheet-style reporting view showing the kind of completion evidence the workflow consolidates for review.'
    },
    certification: {
      src: '../../../../assets/project-images/reporting-automation/report-certification.webp',
      alt: 'Public-safe fictional certification report with learner, certification, status, completion date, and expiration date columns.',
      label: 'Certification report',
      caption: 'A certification-focused export showing the second evidence source used when reviewing learner completion status.'
    },
    progress: {
      src: '../../../../assets/project-images/reporting-automation/report-learner-progress.webp',
      alt: 'Public-safe fictional learner progress export with enrolled, completed, in-progress, not-started, and completion percentage fields.',
      label: 'Learner progress export',
      caption: 'A consolidated progress view demonstrating how multiple learning states can be made easier to scan after data cleanup.'
    },
    courseAnalytics: {
      src: '../../../../assets/project-images/reporting-automation/analytics-course-completion.webp',
      alt: 'Public-safe fictional course completion analytics dashboard with learner rows, departments, course names, status, and completion dates.',
      label: 'Course completion analytics',
      caption: 'A dashboard-style completion view that turns learner status data into a faster scan for learning-operations review.'
    },
    analytics: {
      src: '../../../../assets/project-images/reporting-automation/analytics-certification-status.webp',
      alt: 'Public-safe fictional certification analytics dashboard with certified, in-progress, and not-started learner status summaries.',
      label: 'Certification analytics view',
      caption: 'An analytics layer built from the same type of learning data, showing how certification outputs can support faster interpretation.'
    },
    detail: {
      src: '../../../../assets/project-images/reporting-automation/analytics-detailed-export.webp',
      alt: 'Public-safe fictional detailed learner data export with course activity, completion percentage, and certificate status.',
      label: 'Detailed reporting export',
      caption: 'A row-level export view showing the type of granular evidence available when a summary status needs closer review.'
    }
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const animatePanel = (selector) => {
    const panel = document.querySelector(selector);
    if (!panel) return;
    panel.classList.remove('is-changing');
    void panel.offsetWidth;
    panel.classList.add('is-changing');
  };

  const setupTabs = (selector, dataAttribute, render) => {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach((button, index) => {
      const activate = () => {
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        render(button.dataset[dataAttribute]);
      };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else next = (index - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
      });
    });
    const initial = buttons.find((button) => button.classList.contains('active')) || buttons[0];
    if (initial) render(initial.dataset[dataAttribute]);
  };

  setupTabs('[data-report-step]', 'reportStep', (key) => {
    const d = stepData[key];
    animatePanel('.reporting-step-panel');
    setText('reportStepLabel', d.label);
    setText('reportStepTitle', d.title);
    setText('reportStepSummary', d.summary);
    setText('reportStepTool', d.tool);
    setText('reportStepAutomated', d.automated);
    setText('reportStepValidation', d.validation);
    setText('reportStepOutput', d.output);
    const visual = document.getElementById('reportStageVisual');
    if (visual) {
      visual.dataset.stageVisual = key;
      visual.innerHTML = stageVisuals[key];
    }
  });

  setupTabs('[data-report-need]', 'reportNeed', (key) => {
    const d = needData[key];
    animatePanel('.reporting-need-panel');
    setText('reportNeedLabel', d.label);
    setText('reportNeedTitle', d.title);
    setText('reportNeedSummary', d.summary);
    const visual = document.getElementById('reportNeedMotion');
    if (visual) {
      visual.dataset.needVisual = key;
      visual.innerHTML = needVisuals[key];
    }
  });

  setupTabs('[data-exception]', 'exception', (key) => {
    const d = exceptionData[key];
    animatePanel('.exception-panel');
    setText('exceptionLabel', d.label);
    setText('exceptionTitle', d.title);
    setText('exceptionAutomation', d.automation);
    setText('exceptionHuman', d.human);
    const visual = document.getElementById('exceptionMotion');
    if (visual) {
      visual.dataset.exceptionVisual = key;
      visual.innerHTML = exceptionVisuals[key];
    }
  });

  setupTabs('[data-report-evidence]', 'reportEvidence', (key) => {
    const d = evidenceData[key];
    animatePanel('.reporting-evidence-frame');
    const image = document.getElementById('reportEvidenceImage');
    if (image) {
      image.src = d.src;
      image.alt = d.alt;
    }
    setText('reportEvidenceLabel', d.label);
    setText('reportEvidenceCaption', d.caption);
  });

  const reportDemoPaths = {
    reports: {
      label:'REPORTING / LMS → WORKBOOK',
      steps:[
        {step:'Run',window:'TERMINAL / RUN',source:'SCHEDULED RUN',action:'Start the saved-report workflow.',status:'Browser opening',target:'Expected report set',rows:['Employee activity','Partner activity','Certificate evidence'],check:'Confirm the run scope and saved-report set.',caption:'The run starts with defined inputs and review rules.',image:'terminal-run-reports.png'},
        {step:'LMS',window:'BROWSER / LMS',source:'ABSORB LMS',action:'Open the saved report views.',status:'Session ready',target:'Report workspace',rows:['Activity reports','Certificate reports','Known filters'],check:'Use the approved report views and scope.',caption:'Browser automation repeats a known navigation route.',image:'scheduled-automated-repeatable.png'},
        {step:'Export',window:'BROWSER / REPORTS',source:'SAVED REPORTS',action:'Generate and download four exports.',status:'Downloads in progress',target:'Controlled exports',rows:['Employee activity.xlsx','Partner activity.xlsx','Certificates × 2'],check:'Stop if a required export is missing.',caption:'Four files leave the LMS in a consistent order.',image:'exporting-reports.png'},
        {step:'Files',window:'LOCAL / INPUTS',source:'CSV / XLSX',action:'Collect the report package.',status:'Four files received',target:'Input manifest',rows:['File count: 4','Expected columns','Run date checked'],check:'Reject a partial or unexpected package.',caption:'The file gate protects the analysis from incomplete inputs.',image:'csv-xlsx-files.png'},
        {step:'Normalize',window:'SCRIPT / DATA',source:'PYTHON + PANDAS',action:'Standardize fields and learner keys.',status:'Records comparable',target:'Normalized tables',rows:['Stable learner key','Consistent labels','Source retained'],check:'Flag a missing or unusable key.',caption:'Normalization makes separate reports comparable.',image:'analysis-script.png'},
        {step:'Compare',window:'SCRIPT / LOGIC',source:'COURSE + CERTIFICATE',action:'Join completion and certification evidence.',status:'Rules applied',target:'Status classification',rows:['Complete','Incomplete','Needs review'],check:'Investigate unmatched or duplicate evidence.',caption:'A documented comparison produces an inspectable status.',image:'excel-report-data.png'},
        {step:'Review',window:'QUALITY / QUEUE',source:'EXCEPTION REVIEW',action:'Hold records that need judgment.',status:'Human checkpoint',target:'Review queue',rows:['Missing match','Duplicate candidate','Unexpected state'],check:'A person resolves the case before final use.',caption:'The automated path does not turn uncertainty into a clean claim.',image:'platform-sync-automation.png'},
        {step:'Workbook',window:'EXCEL / OUTPUT',source:'OPENPYXL',action:'Write the review workbook.',status:'Output created',target:'Complete + Incomplete',rows:['Complete worksheet','Incomplete worksheet','User type included'],check:'Confirm worksheet structure and exceptions.',caption:'The result is organized for operational review.',image:'report-deliverables.png'},
        {step:'Dashboard',window:'REPORT / VIEW',source:'ANALYTICS',action:'Summarize the review picture.',status:'Summary available',target:'Reporting view',rows:['Completion status','Exceptions visible','Follow-up list'],check:'Trace a summary back to its rows.',caption:'A useful summary keeps detailed evidence available.',image:'analytics-dashboard.png'},
        {step:'Deliver',window:'DELIVERY / HANDOFF',source:'STAKEHOLDER PACKAGE',action:'Share the reviewed reporting output.',status:'Ready for stakeholder review',target:'Final package',rows:['Workbook','Summary view','Follow-up notes'],check:'Confirm approval and intended recipients.',caption:'The final handoff includes both the result and its review trail.',image:'stakeholder-email.png'}
      ]
    },
    accounts: {
      label:'ACCOUNT CONTEXT / SALESFORCE → LMS',
      steps:[
        {step:'Lookup',window:'BROWSER / SALESFORCE',source:'LEARNER INPUT',action:'Use the learner key to search account context.',status:'Candidate found',target:'Salesforce match',rows:['Fictional learner key','Account candidate','Source link retained'],check:'Do not accept a missing or ambiguous match.',caption:'This is a separate account-setup workflow.',image:'salesforce-login.png'},
        {step:'Verify',window:'SOURCE / ACCOUNT',source:'SALESFORCE FIELDS',action:'Check the account before mapping.',status:'Match reviewed',target:'Verified context',rows:['Account name','Region or type','Account ID'],check:'A person resolves uncertain account context.',caption:'Only verified source fields enter the mapping path.',image:'platform-sync-automation.png'},
        {step:'Map',window:'DATA / FIELD MAP',source:'DOCUMENTED RULES',action:'Translate fields into LMS-ready values.',status:'Placement record drafted',target:'LMS-ready record',rows:['Department name','Parent department','Department ID'],check:'Confirm hierarchy and the destination field.',caption:'Field mapping records how source and destination connect.',image:'excel-report-data.png'},
        {step:'Hold',window:'REVIEW / PLACEMENT',source:'HUMAN CHECKPOINT',action:'Prepare placement for final review.',status:'Not auto-placed',target:'Reviewable handoff',rows:['Verified match','Mapped fields','Placement decision'],check:'Final learner placement remains a reviewed action.',caption:'The automated path stops before consequential placement.',image:'report-deliverables.png'}
      ]
    }
  };
  const demoShell=document.getElementById('reportDemoShell');
  if(demoShell){
    const stageList=document.getElementById('reportDemoSteps');
    const play=document.getElementById('reportDemoPlay');
    let mode='reports',index=0,timer=null;
    const stop=()=>{if(timer)clearInterval(timer);timer=null;play.textContent='Play sequence';};
    const render=(next,focus=false)=>{
      const stages=reportDemoPaths[mode].steps;
      index=(next+stages.length)%stages.length;
      const stage=stages[index];
      demoShell.classList.remove('is-changing');void demoShell.offsetWidth;demoShell.classList.add('is-changing');
      demoShell.dataset.demoMode=mode;
      [...stageList.children].forEach((button,i)=>{const active=i===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();});
      setText('reportDemoPath',reportDemoPaths[mode].label);setText('reportDemoWindowLabel',stage.window);setText('reportDemoSource',stage.source);setText('reportDemoAction',stage.action);setText('reportDemoScreenStatus',stage.status);setText('reportDemoTarget',stage.target);setText('reportDemoRecordOne',stage.rows[0]);setText('reportDemoRecordTwo',stage.rows[1]);setText('reportDemoRecordThree',stage.rows[2]);setText('reportDemoCheckpoint',stage.check);setText('reportDemoCaption',stage.caption);
      const image=document.getElementById('reportDemoAsset');if(image)image.src='../../../../assets/icons/pixel/lms-admin/reporting-automation/'+stage.image;
    };
    const rebuild=()=>{
      stop();stageList.replaceChildren();
      reportDemoPaths[mode].steps.forEach((stage,i)=>{
        const button=document.createElement('button');button.type='button';button.setAttribute('role','tab');button.textContent=`${String(i+1).padStart(2,'0')} ${stage.step}`;
        button.addEventListener('click',()=>{stop();render(i);});
        button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();stop();const next=event.key==='Home'?0:event.key==='End'?reportDemoPaths[mode].steps.length-1:event.key==='ArrowRight'||event.key==='ArrowDown'?i+1:i-1;render(next,true);});
        stageList.append(button);
      });render(0);
    };
    const modeButtons=[...document.querySelectorAll('[data-report-demo-mode]')];
    const selectMode=(button,focus=false)=>{
      mode=button.dataset.reportDemoMode;
      modeButtons.forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-selected',String(active));other.tabIndex=active?0:-1;});
      rebuild();if(focus)button.focus();
    };
    modeButtons.forEach((button,i)=>{button.addEventListener('click',()=>selectMode(button));button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?modeButtons.length-1:event.key==='ArrowRight'?(i+1)%modeButtons.length:(i+modeButtons.length-1)%modeButtons.length;selectMode(modeButtons[next],true);});});
    play.addEventListener('click',()=>{if(timer){stop();return;}play.textContent='Pause sequence';render(0);timer=setInterval(()=>{if(index>=reportDemoPaths[mode].steps.length-1){stop();play.textContent='Replay sequence';return;}render(index+1);if(index===reportDemoPaths[mode].steps.length-1){stop();play.textContent='Replay sequence';}},2200);});
    rebuild();
  }

  const navLinks = [...document.querySelectorAll('.case-nav a')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, {rootMargin:'-28% 0px -58% 0px', threshold:[0.1,.35,.6]});
    sections.forEach((section) => observer.observe(section));
  }
})();
