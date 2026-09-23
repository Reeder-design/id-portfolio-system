(() => {
  'use strict';
  const base = '../../../assets/mockups/lms-admin/platforms/';
  const examples = {
    docebo: {
      category: 'extended', kicker: 'Docebo · direct experience', title: 'Route partners through groups, branches, and learning plans.',
      context: 'A growing partner program needs reliable access and certification without making every partner a one-off setup.',
      scenario: 'Partner role and region determine the required plan.', decision: 'Map audience groups, catalog visibility, plan relationships, and certificate rules.',
      result: 'Test a partner learner from sign-in through the completion record; surface incorrect or missing assignments.',
      image: 'docebo/groups-branches.png', screen: 'Docebo · audience structure', caption: 'A branch and group structure routes the right catalog and plan to each audience.',
      alt: 'Illustrative Docebo-style groups and branches screen'
    },
    absorb: {
      category: 'extended', kicker: 'Absorb · direct experience', title: 'Keep audience placement distinct from course ownership.',
      context: 'An extended-enterprise catalog needs separate audience access while shared content remains maintainable.',
      scenario: 'Employees, partners, and customers enter through different routes.', decision: 'Compare department hierarchy, groups, enrollments, and catalog visibility before copying a course.',
      result: 'Test each persona for expected access, duplicates, certificates, and support instructions.',
      image: 'absorb/enrollments.png', screen: 'Absorb · enrollments', caption: 'The same content can serve distinct audiences when enrollment and visibility rules are explicit.',
      alt: 'Illustrative Absorb-style enrollment administration screen'
    },
    cornerstone: {
      category: 'corporate', kicker: 'Cornerstone · platform-informed model', title: 'Make the certification lifecycle auditable.',
      context: 'An employee role carries recurring requirements with consequences beyond the course view.',
      scenario: 'A regulated team needs role-based training and renewal.', decision: 'Define assignment, due date, renewal, exception, and record owner.',
      result: 'Compare the employee transcript and overdue report with expected status, including exceptions.',
      image: 'cornerstone/compliance-management.png', screen: 'Cornerstone · compliance', caption: 'A recurring requirement needs traceable assignment, status, and renewal logic.',
      alt: 'Illustrative Cornerstone-style compliance management screen'
    },
    sap: {
      category: 'corporate', kicker: 'SAP SuccessFactors · platform-informed model', title: 'Let employee context inform the learning route.',
      context: 'Role, organization, and development goals may change what learning is relevant.',
      scenario: 'A manager changes roles and needs a new set of learning tasks.', decision: 'Map HR attributes to assignment rules; distinguish mandatory learning from development recommendations.',
      result: 'Check that the new role sees the intended catalog and that old requirements retain accurate history.',
      image: 'sap-successfactors/learning-catalog.png', screen: 'SAP SuccessFactors · catalog', caption: 'HR context can guide the catalog without overwriting historical learning records.',
      alt: 'Illustrative SAP SuccessFactors-style learning catalog screen'
    },
    workday: {
      category: 'corporate', kicker: 'Workday Learning · platform-informed model', title: 'Make a role transition visible from assignment to completion.',
      context: 'When learning sits near people data, changes in role or organization should be testable end to end.',
      scenario: 'A new employee must finish onboarding before a role milestone.', decision: 'Connect role-based assignments, prerequisite order, due dates, and completion evidence.',
      result: 'Test a new-hire persona, then verify the required learning and record appear in the intended context.',
      image: 'workday/learning-assignments.png', screen: 'Workday Learning · assignments', caption: 'Role-based assignments become useful only when the learner route and record agree.',
      alt: 'Illustrative Workday Learning-style assignments screen'
    },
    canvas: {
      category: 'academic', kicker: 'Canvas · platform-informed model', title: 'Turn a syllabus into a visible weekly path.',
      context: 'A cohort needs a shared sequence and timely feedback on applied work.',
      scenario: 'A four-week cohort works through concepts, discussion, and applied tasks.', decision: 'Organize modules, due dates, discussions, and rubric-linked assignments.',
      result: 'Check the learner sequence and instructor gradebook for missing work or stalled engagement.',
      image: 'canvas/modules.png', screen: 'Canvas · modules', caption: 'A module sequence gives learners a visible next step and instructors a review point.',
      alt: 'Illustrative Canvas-style course modules screen'
    },
    blackboard: {
      category: 'academic', kicker: 'Blackboard · platform-informed model', title: 'Use discussion and assessment signals to support a cohort.',
      context: 'A course can be complete in the catalog yet still leave learners uncertain between sessions.',
      scenario: 'A mixed-experience cohort practices applying a new concept.', decision: 'Sequence content, discussion prompts, assignment criteria, and feedback checkpoints.',
      result: 'Review submissions and discussion activity to identify where the instructor should intervene.',
      image: 'blackboard/discussions.png', screen: 'Blackboard · discussions', caption: 'Discussion and feedback expose reasoning that a completion percentage cannot.',
      alt: 'Illustrative Blackboard-style course discussion screen'
    },
    sharepoint: {
      category: 'portal', kicker: 'SharePoint Sites · platform-informed model', title: 'Make current guidance easy to find and maintain.',
      context: 'A partner facing an unusual customer question needs a verified resource, not another full course.',
      scenario: 'Partners look up a product exception during live work.', decision: 'Use tagged job aids, task-based navigation, owners, and review dates.',
      result: 'Test search terms and link paths; review stale or low-use resources with the owner.',
      image: 'sharepoint/knowledge-portal.png', screen: 'SharePoint · knowledge portal', caption: 'Search, topic organization, and an owner help people use the right resource.',
      alt: 'Illustrative SharePoint-style searchable knowledge portal'
    }
  };
  const platformDetails = {
    docebo: {
      priorities: 'External groups · learning plans · certification', ecosystem: 'Partner records and LMS reports; Salesforce matching or Snowflake / Power BI reporting are possible patterns when the data contract supports them.', outcome: 'Scalable partner enablement with fewer manual assignments.',
      views: [['Audience','docebo/groups-branches.png','Group and branch rules decide which partner can enter each route.'],['Plan','docebo/learning-plans.png','Learning-plan relationships turn a catalog into a sequenced pathway.'],['Record','docebo/certificates-badges.png','Certificate state should agree with the learner’s completed requirements.']]
    },
    absorb: {
      priorities: 'Departments · groups · enrollment · commerce', ecosystem: 'Account and user data, enrollment exports, and support review; e-commerce only when relevant to the program.', outcome: 'Distinct external experiences without duplicating every course.',
      views: [['Audience','absorb/users.png','Profile and group data establish who belongs in each audience.'],['Enroll','absorb/enrollments.png','Enrollment rules connect the right learner to the right course.'],['Experience','absorb/branding.png','Audience-facing branding and navigation can make the route legible.']]
    },
    cornerstone: {
      priorities: 'Compliance · renewal · audit record', ecosystem: 'HRIS attributes, compliance reporting, and audit evidence; e-signatures where applicable.', outcome: 'Requirements remain traceable through role changes and renewals.',
      views: [['Requirement','cornerstone/compliance-management.png','The requirement has an owner, due date, and renewal rule.'],['Assign','cornerstone/assignments-enrollments.png','Role-based assignment places the right employee into the requirement.'],['Report','cornerstone/reports-analytics.png','Reporting should expose overdue and exception states, not only totals.']]
    },
    sap: {
      priorities: 'Employee profile · organization · development', ecosystem: 'HR role and organizational data connected to learning and performance workflows.', outcome: 'More relevant employee learning without losing historical context.',
      views: [['Profile','sap-successfactors/employee-profile.png','The employee record informs eligibility and recommended learning.'],['Learning','sap-successfactors/learning-catalog.png','A learning catalog should distinguish required from developmental options.'],['Goals','sap-successfactors/goals.png','Development goals connect learning choices to wider talent work.']]
    },
    workday: {
      priorities: 'Onboarding · role assignment · completion', ecosystem: 'Employee lifecycle data and learning status in the broader people workflow.', outcome: 'New hires know what is required and managers can verify progress.',
      views: [['Assign','workday/learning-assignments.png','Role and start date shape assigned onboarding learning.'],['Learn','workday/my-learning.png','The learner needs a clear next step and due date.'],['Status','workday/learning-completion-status.png','The completion record closes the loop for the next milestone.']]
    },
    canvas: {
      priorities: 'Modules · rubrics · instructor feedback', ecosystem: 'Cohort calendars, gradebooks, and LTI tools when the course needs them.', outcome: 'Learners see the weekly route and instructors see who needs help.',
      views: [['Sequence','canvas/modules.png','Modules establish a structured progression.'],['Practice','canvas/assignments.png','Assignments ask learners to demonstrate the concept.'],['Evidence','canvas/gradebook.png','A gradebook and rubric help instructors respond before the cohort moves on.']]
    },
    blackboard: {
      priorities: 'Course shell · discussion · grading', ecosystem: 'Academic calendars, instructor roles, and external learning tools where appropriate.', outcome: 'More visible learner reasoning and more timely cohort support.',
      views: [['Course','blackboard/course-home-history.png','The course home frames the shared learning rhythm.'],['Discuss','blackboard/discussions.png','Discussion makes learner thinking visible between sessions.'],['Assess','blackboard/grades.png','Grades and feedback show where to intervene.']]
    },
    sharepoint: {
      priorities: 'Search · content ownership · freshness', ecosystem: 'Microsoft workspace and links into daily work; tracked LMS learning stays in an LMS.', outcome: 'Faster access to current answers with less unnecessary course creation.',
      views: [['Find','sharepoint/knowledge-portal.png','Search and topic navigation get people to an answer quickly.'],['Use','sharepoint/use-case-library.png','Use-case resources connect guidance to real work.'],['Maintain','sharepoint/site-analytics.png','Usage and review dates reveal what needs revision.']]
    }
  };
  const categoryScope = {
    extended: ['Sales + partner + customer enablement','Audience segmentation','Branded experiences','Commerce when relevant','Engagement + certification','Cross-population reporting'],
    corporate: ['Employees + managers','HRIS provisioning','Automated enrollment','Compliance + renewals','Audit / e-signatures when relevant','Talent + performance'],
    academic: ['Students + instructors','Cohort enrollment','Course shells + calendars','Discussion + rubrics','Gradebook feedback','LTI tools when useful'],
    portal: ['Employees + partners','Searchable job aids','Templates + FAQs','Use-case library','Community knowledge','Ownership + freshness']
  };
  const write = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
  document.querySelectorAll('[data-platform-category]').forEach(section => {
    const category = section.dataset.platformCategory;
    const scope = document.createElement('div');
    scope.className = 'platform-scope-chips';
    scope.setAttribute('aria-label', 'Audience and administrative priorities');
    scope.replaceChildren(...categoryScope[category].map(label => { const chip = document.createElement('span'); chip.textContent = label; return chip; }));
    section.querySelector('.category-intro').after(scope);
    const buttons = [...section.querySelectorAll('[data-platform]')];
    const image = document.getElementById(`${category}-image`);
    const screen = section.querySelector('.platform-screen');
    const caption = section.querySelector('.screen-caption');
    const story = section.querySelector('.platform-story');
    const viewNav = document.createElement('div');
    viewNav.className = 'platform-view-nav';
    viewNav.setAttribute('aria-label', 'Inspect platform decisions');
    caption.after(viewNav);
    const specifics = document.createElement('div');
    specifics.className = 'platform-specifics';
    specifics.innerHTML = '<p><span>Admin priorities</span><strong></strong></p><p><span>Connected systems</span><strong></strong></p><p><span>Learning + business outcome</span><strong></strong></p>';
    story.append(specifics);
    const viewLabel = screen.querySelector('.platform-screen-bar span');
    const renderViews = (platform, selected = 0) => {
      const views = platformDetails[platform].views;
      viewNav.replaceChildren(...views.map(([label], index) => {
        const control = document.createElement('button');
        control.type = 'button';
        control.textContent = label;
        control.className = index === selected ? 'active' : '';
        control.setAttribute('aria-pressed', String(index === selected));
        control.addEventListener('click', () => renderViews(platform, index));
        return control;
      }));
      const [label, file, explanation] = views[selected];
      if (image) { image.src = `${base}${file}`; image.alt = `Illustrative ${platform} ${label.toLowerCase()} interface`; }
      viewLabel.textContent = `${examples[platform].screen.split(' · ')[0]} · ${label.toLowerCase()}`;
      caption.textContent = explanation;
    };
    const activate = button => {
      const data = examples[button.dataset.platform];
      if (!data || data.category !== category) return;
      buttons.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
      ['kicker','title','context','scenario','decision','result','screen-title','caption'].forEach(field => {
        const key = field === 'screen-title' ? 'screen' : field;
        write(`${category}-${field}`, data[key]);
      });
      const details = platformDetails[button.dataset.platform];
      [...specifics.querySelectorAll('strong')].forEach((node, index) => { node.textContent = [details.priorities, details.ecosystem, details.outcome][index]; });
      renderViews(button.dataset.platform);
      section.classList.remove('platform-switched');
      void section.offsetWidth;
      section.classList.add('platform-switched');
    };
    buttons.forEach((button, index) => {
      button.tabIndex = button.getAttribute('aria-selected') === 'true' ? 0 : -1;
      button.addEventListener('click', () => activate(button));
      button.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowRight' ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
        buttons[next].focus(); activate(buttons[next]);
      });
    });
    activate(buttons[0]);
  });
})();
