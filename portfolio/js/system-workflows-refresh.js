(() => {
  const examples = {
    account: {
      label: 'System Integration',
      title: 'Salesforce → LMS account workflow',
      summary: 'Turn a learner list into verified account data and review-ready LMS placement records without hiding uncertain matches.',
      flow: [['Input', 'Learner list'], ['Lookup', 'Account'], ['Map', 'LMS fields'], ['Review', 'Placement']],
      automation: 'Repeated Salesforce lookups and field preparation move through the workflow.',
      output: 'An updated workbook preserves the account evidence and placement record.',
      human: 'Review ambiguous matches and confirm final LMS placement.',
      tools: ['Python', 'Selenium', 'Excel', 'Salesforce', 'LMS'],
      href: 'ai-automation/salesforce-lms-account-automation/index.html',
      image: '../../assets/project-images/workflows/workflow-salesforce-enablement.webp',
      alt: 'Public-safe Salesforce account-to-enablement workflow.'
    },
    reports: {
      label: 'Reporting Automation',
      title: 'Certification reporting package',
      summary: 'Generate the same four LMS exports in a controlled sequence and stop when the package is incomplete.',
      flow: [['Input', 'Saved reports'], ['Generate', 'Exports'], ['Validate', 'File set'], ['Handoff', 'Analysis']],
      automation: 'Saved report navigation, generation, and downloads run in a repeatable sequence.',
      output: 'A consistent four-report package is ready for the analysis workflow.',
      human: 'Confirm the report package is complete before using it for decisions.',
      tools: ['Python', 'Selenium', 'Absorb LMS', 'Excel'],
      href: 'data-reporting/certification-reporting-automation/index.html',
      image: '../../assets/project-images/workflows/workflow-automation-overview.webp',
      alt: 'Public-safe view of an automated LMS reporting package.'
    },
    analysis: {
      label: 'Data Analysis',
      title: 'Course + certificate completion analysis',
      summary: 'Compare activity and certificate evidence without hiding unmatched or duplicated learner records.',
      flow: [['Input', 'Four exports'], ['Normalize', 'Fields'], ['Compare', 'Username'], ['Review', 'Status']],
      automation: 'Exports are normalized, joined, and classified using documented rules.',
      output: 'Complete and Incomplete sheets include learner type and visible exceptions.',
      human: 'Review exception records before treating the workbook as final.',
      tools: ['Python', 'pandas', 'openpyxl', 'Excel'],
      href: 'data-reporting/certification-reporting-automation/index.html',
      image: '../../assets/project-images/workflows/workflow-analytics-completions.webp',
      alt: 'Public-safe completion analysis with review-ready learner statuses.'
    },
    operations: {
      label: 'Learning Operations',
      title: 'Content and migration workflow',
      summary: 'Map content, pathways, ownership, testing, and learner dependencies into a maintainable platform handoff.',
      flow: [['Inventory', 'Content'], ['Map', 'Target'], ['Test', 'Learner route'], ['Maintain', 'Handoff']],
      automation: 'Inventories, mapping fields, and test status are organized into one operational workflow.',
      output: 'A documented migration record keeps ownership, decisions, and follow-up visible.',
      human: 'Platform owners and stakeholders review routing and launch decisions.',
      tools: ['LMS', 'Excel', 'Documentation', 'UAT'],
      href: '../lms-administration/learning-platform-operations-migration-readiness/index.html',
      image: '../../assets/project-images/workflows/workflow-automation-results.webp',
      alt: 'Public-safe learning operations workflow showing organized migration results.'
    }
  };

  const tabs = [...document.querySelectorAll('[data-system-example]')];
  const panel = document.querySelector('.systems-example-panel');
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const render = (key) => {
    const data = examples[key];
    if (!data) return;

    panel?.classList.remove('is-changing');
    void panel?.offsetWidth;
    panel?.classList.add('is-changing');

    setText('systemsExampleLabel', data.label);
    setText('systemsExampleTitle', data.title);
    setText('systemsExampleSummary', data.summary);
    setText('systemsExampleAutomation', data.automation);
    setText('systemsExampleOutput', data.output);
    setText('systemsExampleHuman', data.human);

    const flow = document.getElementById('systemsExampleFlow');
    if (flow) {
      flow.replaceChildren(...data.flow.map(([stage, detail], index) => {
        const item = document.createElement('article');
        item.className = 'systems-flow-step';
        item.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><p><strong>${stage}</strong><small>${detail}</small></p>`;
        return item;
      }));
    }

    const tools = document.getElementById('systemsExampleTools');
    if (tools) {
      tools.replaceChildren(...data.tools.map((tool) => {
        const chip = document.createElement('span');
        chip.textContent = tool;
        return chip;
      }));
    }

    const link = document.getElementById('systemsExampleLink');
    if (link) link.href = data.href;

    const image = document.getElementById('systemsExampleImage');
    if (image) {
      image.src = data.image;
      image.alt = data.alt;
    }
  };

  tabs.forEach((tab, index) => {
    const activate = () => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      render(tab.dataset.systemExample);
    };

    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else next = (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  render('account');
})();
