(() => {
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
    pull: '<div class="stage-pull-files"><span>01</span><span>02</span><span>03</span><span>04</span></div><div class="stage-route"><i></i></div><div class="stage-download"><b>4 exports</b><small>downloaded</small></div>',
    validate: '<div class="stage-validate-list"><span class="checked"></span><span class="checked"></span><span class="checked"></span><span class="checking"></span></div><div class="stage-scan"></div><div class="stage-badge"><b>Input gate</b><small>complete set required</small></div>',
    normalize: '<div class="stage-normalize-source"><img src="../../../../assets/icons/pixel/ai-evaluation/workflow-documents.webp" alt=""><small>mixed fields</small></div><div class="stage-normalize-machine"><img src="../../../../assets/icons/pixel/lms/mini-settings.webp" alt=""><i></i></div><div class="stage-normalize-table"><b>standard fields</b><span></span><span></span><span></span></div>',
    compare: '<div class="stage-compare-source source-activity"><img src="../../../../assets/icons/pixel/lms/mini-analytics.webp" alt=""><small>activity</small></div><div class="stage-compare-source source-certificate"><img src="../../../../assets/icons/pixel/lms/mini-certificate.webp" alt=""><small>certificate</small></div><div class="stage-compare-lens"><img src="../../../../assets/icons/pixel/ai-evaluation/demo-compare-ab.webp" alt=""></div><div class="stage-match"><b>Matched status</b><small>exceptions separated</small></div>',
    write: '<div class="stage-write-records"><span></span><span></span><span></span><span></span></div><div class="stage-write-split"><i></i></div><div class="stage-workbook"><div><img src="../../../../assets/icons/pixel/lms/mini-document-list.webp" alt=""><b>Complete</b></div><div><img src="../../../../assets/icons/pixel/lms/mini-document-list.webp" alt=""><b>Incomplete</b></div></div>'
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
