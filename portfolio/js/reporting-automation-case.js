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

  const exceptionData = {
    missing: {
      label: 'Input check',
      title: 'Stop before analysis if the report set is incomplete.',
      automation: 'The workflow checks for the expected exports instead of moving forward with a partial report package.',
      human: 'Confirm the missing report, rerun it if needed, and only continue when the input set is complete.'
    },
    unmatched: {
      label: 'Join check',
      title: 'Keep an unmatched learner visible instead of dropping the record.',
      automation: 'The comparison logic surfaces learner keys that do not join across the expected report evidence.',
      human: 'Review the learner record and determine whether the source data, report scope, or completion evidence needs correction.'
    },
    duplicate: {
      label: 'Record check',
      title: 'Flag duplicate candidates instead of guessing which row is correct.',
      automation: 'The workflow preserves duplicate or ambiguous records for review rather than silently choosing one.',
      human: 'Confirm which source record should be used before a final status is accepted.'
    },
    state: {
      label: 'Logic check',
      title: 'Surface a completion pattern that does not match the expected rule.',
      automation: 'Unexpected evidence combinations remain visible instead of being forced into a clean status.',
      human: 'Review the source records and decide whether the state reflects data timing, reporting behavior, or a true exception.'
    }
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

  const workbookData = {
    complete: {
      summary: 'Matched activity + certificate evidence',
      rows: [
        ['user-0142','Employee','Matched','Matched','Complete'],
        ['user-0287','Partner','Matched','Matched','Complete'],
        ['user-0314','Employee','Matched','Matched','Complete']
      ]
    },
    incomplete: {
      summary: 'Records that still need review or missing evidence',
      rows: [
        ['user-0419','Partner','Matched','Not found','Incomplete'],
        ['user-0526','Employee','Not found','Matched','Incomplete'],
        ['user-0638','Partner','Review','Matched','Incomplete']
      ]
    }
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
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
  };

  setupTabs('[data-report-step]', 'reportStep', (key) => {
    const d = stepData[key];
    setText('reportStepLabel', d.label);
    setText('reportStepTitle', d.title);
    setText('reportStepSummary', d.summary);
    setText('reportStepTool', d.tool);
    setText('reportStepAutomated', d.automated);
    setText('reportStepValidation', d.validation);
    setText('reportStepOutput', d.output);
    setText('reportStageVisualLabel', d.visual);
  });

  setupTabs('[data-exception]', 'exception', (key) => {
    const d = exceptionData[key];
    setText('exceptionLabel', d.label);
    setText('exceptionTitle', d.title);
    setText('exceptionAutomation', d.automation);
    setText('exceptionHuman', d.human);
  });

  setupTabs('[data-report-evidence]', 'reportEvidence', (key) => {
    const d = evidenceData[key];
    const image = document.getElementById('reportEvidenceImage');
    if (image) {
      image.src = d.src;
      image.alt = d.alt;
    }
    setText('reportEvidenceLabel', d.label);
    setText('reportEvidenceCaption', d.caption);
  });

  setupTabs('[data-workbook-sheet]', 'workbookSheet', (key) => {
    const data = workbookData[key];
    const body = document.getElementById('workbookRows');
    if (!body) return;
    body.innerHTML = data.rows.map(([learner,type,activity,certificate,status]) => {
      const cls = status.toLowerCase();
      return `<tr><td>${learner}</td><td>${type}</td><td>${activity}</td><td>${certificate}</td><td><span class="status-pill ${cls}">${status}</span></td></tr>`;
    }).join('');
    setText('workbookSummary', data.summary);
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
