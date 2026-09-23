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
  const viewNotes = {
    docebo:[['A branch is not an audience rule by itself. Check group membership, catalog visibility, and inherited permissions together.','Use one test learner per partner route before publishing.','Reuse the shared course; vary access and plans rather than cloning content.'],['A learning plan can hide prerequisite or version problems until a learner enters it.','Test the full sequence after every course replacement.','Use the plan as the maintained route, not a collection of one-off enrollments.'],['Certificate settings and plan completion may not mean the same thing.','Reconcile the learner record with the certificate rule.','Use exception exports to find misrouted learners before a renewal cycle.']],
    absorb:[['Department and group membership can reflect different business structures.','Document which field controls each audience decision.','Keep reusable courses in a shared catalog where visibility rules permit.'],['Bulk enrollments can amplify a bad match.','Preview matching keys and isolate ambiguous accounts for review.','Use reviewed batches instead of repeated individual placement.'],['Branding can clarify an audience route but does not replace permissions.','Test navigation as employee, partner, and customer.','Improve labels and catalog organization before buying another portal.']],
    cornerstone:[['Recurring requirements need explicit due, renewal, and equivalency rules.','Test a newly assigned learner and one with prior credit.','Use existing assignment logic consistently across roles.'],['Role changes can create duplicate or missing requirements.','Compare HR role changes against assignment history.','Put exception states into an admin review queue.'],['A completion total can conceal overdue and exempt records.','Define statuses and reconcile transcript samples.','Design report filters around decisions, not vanity totals.']],
    sap:[['HR attributes may be authoritative but can arrive late or incomplete.','Check the source field and sync timing before routing learning.','Use role-based defaults with visible exceptions.'],['Required learning and elective discovery should stay distinct.','Test learner catalog labels and eligibility.','Improve search tags and collections before adding more content.'],['A development goal does not prove course completion.','Keep goal progress and learning evidence separate.','Connect existing learning records to manager conversations.']],
    workday:[['A hire or role event can trigger learning before profile fields settle.','Validate effective dates and assignment timing.','Use current people-data events to reduce manual onboarding lists.'],['A long list of assigned items obscures the next action.','Sequence mandatory learning and show due dates clearly.','Organize the existing learner view around milestones.'],['Completion needs to return to the right people workflow.','Compare the learner record with manager-visible status.','Build follow-up from existing report fields.']],
    canvas:[['Module requirements can accidentally lock the next week.','Walk the sequence as a student before release.','Use consistent weekly templates and naming.'],['Due dates alone do not explain success criteria.','Pair each assignment with a rubric and example.','Reuse rubric criteria for faster, clearer feedback.'],['A grade can hide a misconception across a cohort.','Review rubric patterns and late/missing work.','Use native gradebook filters to plan timely intervention.']],
    blackboard:[['A course shell can become a file dump.','Group resources by the learner’s weekly task.','Use a repeatable course pattern rather than extra tools.'],['Discussion volume is not the same as useful reasoning.','Prompt specific evidence and model a strong response.','Use instructor summaries to surface patterns.'],['Late feedback makes the next task harder.','Check grading visibility and release timing.','Use existing rubric and feedback tools consistently.']],
    sharepoint:[['Search quality depends on titles, tags, and permissions.','Test the phrases a user would actually type.','Improve metadata before adding another navigation layer.'],['A use-case library can become stale quickly.','Assign an owner and review date to each resource.','Create task-based entry points to existing content.'],['Page views do not prove the answer was useful.','Pair analytics with support questions and broken-link checks.','Archive stale pages and improve the most-used paths.']]
  };
  // Each target is positioned over a real control, row, or report region in its specific mockup.
  // Coordinates and dimensions are percentages of the displayed image, not the outer browser frame.
  const screenTargets = {
    docebo:[[['Sales audience',37,48,47,9,0],['Create group',69,15,27,10,1]], [['Sales certification',38,44,55,16,0],['Partner plan',38,61,55,16,2]], [['Partner credential',33,65,43,15,0],['View record',80,68,15,10,1]]],
    absorb:[[['Department field',70,37,23,9,0],['Partner learner',32,67,56,11,1]], [['Bulk enrollment',58,24,26,10,0],['Enroll users',63,85,28,10,1]], [['Login branding',38,23,20,10,0],['Primary color',33,59,46,14,1]]],
    cornerstone:[[['Overdue learners',74,22,23,22,0],['At-risk requirement',26,72,68,9,1]], [['Learner selector',31,38,63,11,0],['Due date',58,61,36,11,1]], [['Compliance report',35,42,36,42,0],['Scheduled report',23,83,70,12,1]]],
    sap:[[['Role + department',36,44,43,24,0],['Profile actions',78,23,18,10,1]], [['Required vs elective',4,40,24,45,0],['Learning result',35,47,58,15,1]], [['At-risk goal',34,57,61,18,0],['Development goal',34,75,61,18,1]]],
    workday:[[['Assignment rule',60,24,31,11,0],['Overdue learner',27,79,66,14,1]], [['Current learning',30,24,31,12,0],['Resume course',77,41,17,13,1]], [['Report filters',25,26,69,10,0],['Overdue metric',71,40,23,20,1]]],
    canvas:[[['Weekly sequence',27,28,67,12,0],['Discussion practice',31,62,62,12,1]], [['Due soon view',36,28,18,10,0],['Case study score',29,55,65,13,1]], [['Rubric result',55,45,20,44,0],['Student pattern',31,54,64,12,1]]],
    blackboard:[[['Course modules',32,57,63,12,0],['Final project',32,86,63,12,1]], [['Discussion prompt',30,38,65,12,0],['Source analysis',30,62,65,12,1]], [['Discussion grade',38,50,56,12,0],['Upcoming work',68,22,23,10,1]]],
    sharepoint:[[['Search guidance',22,27,55,10,0],['Product category',20,37,17,25,1]], [['Industry filter',23,24,21,11,0],['Manufacturing case',22,34,25,29,1]], [['Usage filter',81,12,15,13,0],['Top content',22,57,44,34,1]]]
  };
  const write = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
  document.querySelectorAll('[data-platform-category]').forEach(section => {
    const category = section.dataset.platformCategory;
    const buttons = [...section.querySelectorAll('[data-platform]')];
    const image = document.getElementById(`${category}-image`);
    const screen = section.querySelector('.platform-screen');
    const caption = section.querySelector('.screen-caption');
    const story = section.querySelector('.platform-story');
    story.querySelector('.platform-logic')?.remove();
    const viewNav = document.createElement('div');
    viewNav.className = 'platform-view-nav';
    viewNav.setAttribute('aria-label', 'Screens in this platform walkthrough');
    screen.querySelector('.platform-screen-bar').after(viewNav);
    const imageStage = document.createElement('div');
    imageStage.className = 'platform-image-stage';
    image.parentElement.insertBefore(imageStage,image);
    imageStage.append(image);
    const hotspotLayer = document.createElement('div');
    hotspotLayer.className = 'platform-hotspot-layer';
    imageStage.append(hotspotLayer);
    const hotspotNote = document.createElement('div');
    hotspotNote.className = 'platform-hotspot-note';
    hotspotNote.hidden = true;
    hotspotNote.innerHTML = '<button type="button" aria-label="Close admin note">×</button><span></span><p></p>';
    imageStage.append(hotspotNote);
    hotspotNote.querySelector('button').addEventListener('click',()=>{hotspotNote.hidden=true;hotspotLayer.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed','false'));});
    const nextView = document.createElement('button');
    nextView.type = 'button';
    nextView.className = 'platform-next-view';
    nextView.textContent = 'Continue →';
    imageStage.append(nextView);
    const viewLabel = screen.querySelector('.platform-screen-bar span');
    const screenCount = screen.querySelector('.platform-screen-bar span:last-child');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activePlatform = null;
    let activeView = -1;
    let transitionTimer;
    const alignTargets = () => {
      if (!image.naturalWidth || !imageStage.clientWidth || !imageStage.clientHeight) return;
      const scale = Math.min(imageStage.clientWidth / image.naturalWidth, imageStage.clientHeight / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      hotspotLayer.style.left = `${(imageStage.clientWidth - width) / 2}px`;
      hotspotLayer.style.top = `${(imageStage.clientHeight - height) / 2}px`;
      hotspotLayer.style.width = `${width}px`;
      hotspotLayer.style.height = `${height}px`;
    };
    image.addEventListener('load', alignTargets);
    if ('ResizeObserver' in window) new ResizeObserver(alignTargets).observe(imageStage);
    const renderViews = (platform, selected = 0, animate = true) => {
      if (activePlatform === platform && activeView === selected) return;
      clearTimeout(transitionTimer);
      const commit = () => {
      const views = platformDetails[platform].views;
      viewNav.replaceChildren(...views.map(([label], index) => {
        const control = document.createElement('button');
        control.type = 'button';
        control.textContent = label;
        control.className = index === selected ? 'active' : '';
        control.setAttribute('aria-pressed', String(index === selected));
        control.addEventListener('click', () => renderViews(platform, index, true));
        return control;
      }));
      const [label, file, explanation] = views[selected];
      if (image) { image.src = `${base}${file}`; image.alt = `Illustrative ${platform} ${label.toLowerCase()} interface`; }
      viewLabel.textContent = `${examples[platform].screen.split(' · ')[0]} · ${label.toLowerCase()}`;
      screenCount.textContent = `SCREEN ${selected + 1} / ${views.length}`;
      caption.textContent = explanation;
      hotspotNote.hidden=true;
      hotspotLayer.replaceChildren(...screenTargets[platform][selected].map(([targetLabel,x,y,width,height,noteIndex],index)=>{
        const button=document.createElement('button');
        button.type='button';
        button.className=`platform-hotspot platform-target-${index+1}`;
        button.style.cssText=`left:${x}%;top:${y}%;width:${width}%;height:${height}%`;
        button.innerHTML=`<span></span><b aria-hidden="true">+</b>`;
        button.querySelector('span').textContent=targetLabel;
        button.setAttribute('aria-label',`${targetLabel}: ${viewNotes[platform][selected][noteIndex]}`);
        button.setAttribute('aria-pressed','false');
        button.addEventListener('click',()=>{
          const wasOpen=button.getAttribute('aria-pressed')==='true';
          hotspotLayer.querySelectorAll('button').forEach(item=>item.setAttribute('aria-pressed','false'));
          button.setAttribute('aria-pressed',String(!wasOpen));
          hotspotNote.querySelector('span').textContent=targetLabel;
          hotspotNote.querySelector('p').textContent=viewNotes[platform][selected][noteIndex];
          hotspotNote.hidden=wasOpen;
        });
        return button;
      }));
      nextView.setAttribute('aria-label',`Continue to ${views[(selected+1)%views.length][0]} screen`);
      nextView.onclick=()=>renderViews(platform,(selected+1)%views.length,true);
      activePlatform=platform;
      activeView=selected;
      alignTargets();
      screen.classList.remove('platform-page-leaving');
      if (animate && !reducedMotion) {
        screen.classList.add('platform-page-entering');
        transitionTimer=setTimeout(()=>screen.classList.remove('platform-page-entering'),430);
      }
      };
      if (animate && !reducedMotion && activePlatform) {
        screen.classList.remove('platform-page-entering');
        screen.classList.add('platform-page-leaving');
        transitionTimer=setTimeout(commit,190);
      } else commit();
    };
    const activate = button => {
      const data = examples[button.dataset.platform];
      if (!data || data.category !== category) return;
      buttons.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
      ['kicker','title','screen-title','caption'].forEach(field => {
        const key = field === 'screen-title' ? 'screen' : field;
        write(`${category}-${field}`, data[key]);
      });
      write(`${category}-context`,`${data.decision} ${data.result}`);
      renderViews(button.dataset.platform,0,activePlatform!==null);
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
  const heroScreens=[
    ['Docebo','docebo/groups-branches.png','extended-enterprise/docebo-platform.png','Extended enterprise'],
    ['Absorb','absorb/enrollments.png','extended-enterprise/absorb-platform.png','Audience management'],
    ['Cornerstone','cornerstone/compliance-management.png','corporate-core/cornerstone-platform.png','Corporate learning'],
    ['Canvas','canvas/modules.png','academic-cohort/canvas-platform.png','Cohort learning'],
    ['SharePoint','sharepoint/knowledge-portal.png','knowledge-portal/sharepoint-platform.png','Knowledge portal']
  ];
  let heroIndex=0;
  const showHero=()=>{const [name,file,logo,caption]=heroScreens[heroIndex];write('platformHeroName',name);write('platformHeroCaption',caption);const image=document.getElementById('platformHeroImage'),brand=document.querySelector('#platformHeroLogo img');if(image){image.src=base+file;image.alt=`Illustrative ${name} screen`;}if(brand)brand.src=`../../../assets/icons/pixel/lms-admin/${logo}`;};
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){setInterval(()=>{heroIndex=(heroIndex+1)%heroScreens.length;showHero();},3500);}
  const navLinks=[...document.querySelectorAll('.lms-platform-principle a')];
  const observer=new IntersectionObserver((entries)=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;navLinks.forEach(link=>{const active=link.hash===`#${visible.target.id}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});},{rootMargin:'-22% 0px -60% 0px',threshold:[0,.1,.25]});
  document.querySelectorAll('[data-platform-category]').forEach(section=>observer.observe(section));
})();
