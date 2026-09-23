(() => {
  'use strict';

  // Every screen is HTML and CSS. No product screenshot is used in these simulations.
  const iconRoot = '../../../assets/icons/pixel/lms-admin/';
  const demos = {
    absorb: {
      name: 'Absorb', label: 'Direct experience', className: 'absorb',
      icon: iconRoot + 'extended-enterprise/absorb-platform.png',
      menu: ['Dashboard', 'Users', 'Courses', 'Reports', 'Setup'],
      scenes: [
        {
          tab: 'Command center', title: 'Find the course that needs attention.',
          summary: 'I start with an operational dashboard, then narrow the issue before changing a course.',
          kind: 'metrics', heading: 'Admin Dashboard',
          values: [['Active learners', '8,214', 'steady'], ['Enrollments this month', '1,386', '+12%'], ['Courses requiring attention', '03', 'review'], ['Completion rate', '87%', 'current']],
          list: [['Cybersecurity Essentials', 'Package update pending'], ['Product Launch Readiness', 'Enrollment exception'], ['Workplace Safety', 'Owner review due']],
          action: 'Filter attention queue', outcome: 'Attention queue filtered to three courses with named issues.',
          decision: 'Separate operational exceptions from healthy courses.', check: 'Open the affected course before updating content or enrollment rules.'
        },
        {
          tab: 'Course operations', title: 'Use contextual actions on the right course.',
          summary: 'The course register is where content, enrollments, and status become actionable.',
          kind: 'table', heading: 'Courses Report', columns: ['Course', 'Type', 'Enrollments', 'Status'],
          rows: [['Cybersecurity Essentials', 'Online', '2,340', 'Update due'], ['New Manager Foundations', 'Blended', '384', 'Active'], ['Product Launch Readiness', 'Online', '812', 'Active'], ['Workplace Safety', 'Online', '1,140', 'Active']],
          action: 'Select Cybersecurity Essentials', outcome: 'Actions opened: Edit · Duplicate · Enroll User · Course Enrollments · View Activity Report.',
          decision: 'Choose the course record before changing its learning objects.', check: 'Confirm enrollment impact and owner before publishing a replacement.'
        },
        {
          tab: 'Course assembly', title: 'Replace a lesson without losing the course route.',
          summary: 'I treat a package update as a versioned content operation with a learner impact check.',
          kind: 'editor', heading: 'Cybersecurity Essentials / Syllabus',
          blocks: [['01', 'Welcome', 'HTML'], ['02', 'Cybersecurity Basics', 'SCORM 1.2'], ['03', 'Knowledge Check', 'Assessment'], ['04', 'Incident Scenario', 'Scenario'], ['05', 'Course Survey', 'Survey']],
          fields: [['Update mode', 'Replace existing lesson'], ['Source package', 'cybersecurity-v2.zip'], ['Completion rule', 'Assessment passed']],
          action: 'Preview replacement', outcome: 'New SCORM package staged for lesson 02; completion rule remains attached.',
          decision: 'Replace the learning object inside the existing syllabus.', check: 'Test launch, bookmarking, and completion on a test enrollment.'
        },
        {
          tab: 'Activity ledger', title: 'Read the record after deployment.',
          summary: 'A course change is complete when enrollment and learner evidence still reconcile.',
          kind: 'table', heading: 'Course Activity Report', columns: ['Learner', 'Department', 'Progress', 'Score'],
          rows: [['Jamie Chen', 'Operations', 'Complete', '92%'], ['Morgan Lee', 'Sales', '60%', '—'], ['Taylor Reid', 'Support', 'Not started', '—'], ['Alex Rivera', 'Partners', 'Complete', '88%']],
          action: 'Inspect Morgan Lee', outcome: 'Enrollment detail opened: message learner, view transcript, or reset progress after review.',
          decision: 'Use the course activity ledger to locate the actual support case.', check: 'Compare course status, score, and transcript before changing a record.'
        }
      ]
    },
    docebo: {
      name: 'Docebo', label: 'Direct experience', className: 'docebo',
      icon: iconRoot + 'extended-enterprise/docebo-platform.png',
      menu: ['Configuration', 'Extended enterprise', 'Pages & menus', 'Power users', 'Reports'],
      scenes: [
        {
          tab: 'Architecture', title: 'Give each audience a governed environment.',
          summary: 'Domains, branches, and catalog rules form one architecture for employees, partners, and customers.',
          kind: 'tree', heading: 'Extended Enterprise',
          nodes: [[0, 'Northstar Learning', 'root'], [1, 'Corporate Learning', 'learn.northstar.example'], [1, 'Partner Academy', 'partners.northstar.example'], [2, 'Distributor Network', 'branch'], [2, 'Solution Partners', 'branch'], [1, 'Customer Academy', 'academy.northstar.example']],
          action: 'Configure Partner Academy', outcome: 'Partner domain selected with branch and catalog settings ready for review.',
          decision: 'Separate audience experience from shared course ownership.', check: 'Test one learner from each branch against catalog visibility.'
        },
        {
          tab: 'Experience', title: 'Design the partner navigation and brand together.',
          summary: 'A relevant menu is as important as a recognizable brand in an external academy.',
          kind: 'designer', heading: 'Partner Academy / Experience designer',
          fields: [['Primary color', 'Deep teal'], ['Header', 'Partner Academy'], ['Audience', 'Branch = Partners']],
          blocks: [['01', 'Home', 'Page'], ['02', 'Certifications', 'Menu'], ['03', 'Sales Enablement', 'Menu'], ['04', 'Product Training', 'Menu'], ['05', 'Support', 'Menu']],
          action: 'Preview learner site', outcome: 'Partner preview shows Certifications, Sales Enablement, Product Training, and Support.',
          decision: 'Build a menu for the partner task rather than copying the employee home page.', check: 'Preview as a partner account before publishing.'
        },
        {
          tab: 'Delegated admin', title: 'Scope permissions and resources together.',
          summary: 'A partner manager should administer only the learners and content they own.',
          kind: 'matrix', heading: 'Power User / Partner Training Manager',
          columns: ['Resource', 'View', 'Create', 'Edit', 'Delete'],
          rows: [['Courses', '✓', '—', '✓', '—'], ['Enrollments', '✓', '✓', '✓', '—'], ['Reports', '✓', '—', '—', '—'], ['Users', '✓', '—', '✓', '—']],
          note: 'Scope: Solution Partners — West · Partner Sales Certification',
          action: 'Test effective access', outcome: 'Permission + resource scope allows West partner enrollments while other branches remain hidden.',
          decision: 'Grant the smallest useful permission set and assign matching resources.', check: 'Test the Power User account inside and outside its branch.'
        },
        {
          tab: 'Tenant health', title: 'Monitor the partner academy as its own operation.',
          summary: 'The shared platform needs audience-specific reporting and exception ownership.',
          kind: 'metrics', heading: 'Partner Academy / Operations',
          values: [['Active partner learners', '2,418', 'current'], ['Certification completion', '81%', '+6%'], ['Overdue assignments', '126', 'review'], ['Active power users', '14', 'scoped']],
          list: [['Distributor Network', '1,106 learners'], ['Solution Partners — West', '714 learners'], ['Solution Partners — East', '598 learners']],
          action: 'Inspect West branch', outcome: 'West branch view opened with completion, overdue, and Power User scope.',
          decision: 'Filter by domain and branch before interpreting a metric.', check: 'Reconcile branch totals with the learner and certification reports.'
        }
      ]
    },
    cornerstone: {
      name: 'Cornerstone', label: 'Platform-informed model', className: 'cornerstone',
      icon: iconRoot + 'corporate-core/cornerstone-platform.png',
      menu: ['Galaxy Home', 'Learning', 'Compliance', 'Assignments', 'Reports'],
      scenes: [
        {
          tab: 'Risk overview', title: 'See renewal risk before it becomes an audit issue.',
          summary: 'I would make due-soon and overdue populations visible alongside overall compliance.',
          kind: 'risk', heading: 'Compliance Overview',
          values: [['Compliant', '94.2%', 'current'], ['Expiring in 30 days', '128', 'attention'], ['Overdue assignments', '47', 'review'], ['New-hire gaps', '09', 'review']],
          list: [['Programs in progress', '18 active'], ['Assignment activity', 'Today'], ['Recent reports', 'Audit export ready']],
          action: 'Open expiring certifications', outcome: 'Filtered to 128 employees whose certification expires within 30 days.',
          decision: 'Prioritize populations by risk and deadline.', check: 'Check the underlying learner records before intervention.'
        },
        {
          tab: 'Program builder', title: 'Build renewal logic around the learning.',
          summary: 'The certification is an ongoing requirement, not just a bundle of courses.',
          kind: 'editor', heading: 'Data Privacy Certification',
          blocks: [['01', 'Data Privacy Foundations', 'Required'], ['02', 'Secure Data Handling', 'Required'], ['03', 'Final Assessment', 'Pass 80%']],
          fields: [['Initial completion', '30 days'], ['Recertification', 'Every 365 days'], ['Reminder', '30 days before expiry'], ['Grace period', '14 days']],
          action: 'Review lifecycle', outcome: 'Certification structure links completion, renewal, reminder, and grace rules.',
          decision: 'Define renewal and exception logic before mass assignment.', check: 'Test first-time, renewed, and expired learner records.'
        },
        {
          tab: 'Dynamic assignment', title: 'Target a changing workforce population.',
          summary: 'I would preview eligibility before applying a dynamic learning assignment.',
          kind: 'rules', heading: 'Create Learning Assignment',
          fields: [['Type', 'Dynamic'], ['Training', 'Data Privacy Certification'], ['Division', 'Customer Operations'], ['Employment', 'Active'], ['Location', 'Exclude contractor site'], ['Future matches', 'Included']],
          note: 'Eligible population · 2,418 learners',
          action: 'Preview population', outcome: '2,418 current learners match; future qualifying users will join the assignment.',
          decision: 'Use explicit inclusion and exclusion criteria.', check: 'Sample a matched employee and an excluded contractor.'
        },
        {
          tab: 'Intervention', title: 'Move from status to a specific action.',
          summary: 'I would filter the at-risk group, then choose the least disruptive intervention.',
          kind: 'table', heading: 'Compliance Intervention', columns: ['Population', 'Current', 'Due soon', 'Overdue'],
          rows: [['North America', '1,802', '91', '34'], ['Europe', '1,107', '24', '08'], ['Asia Pacific', '944', '13', '05']],
          action: 'Review overdue group', outcome: 'North America overdue population selected: send reminder, reassign, or export audit report.',
          decision: 'Separate overdue learners from exempt or recently assigned employees.', check: 'Preserve an audit trail for the selected intervention.'
        }
      ]
    },
    sap: {
      name: 'SAP SuccessFactors Learning', label: 'Platform-informed model', className: 'sap',
      icon: iconRoot + 'corporate-core/sap-successfactors-platform.png',
      menu: ['Learning Admin', 'Users', 'Items', 'Curricula', 'Assignment Profiles'],
      scenes: [
        {
          tab: 'Admin intake', title: 'Locate the structure behind the assignment.',
          summary: 'I would start at the learning object type, then trace the assignment source.',
          kind: 'sap-intake', heading: 'Learning Administration',
          values: [['Users', '14,284', 'active'], ['Items', '681', 'catalog'], ['Curricula', '84', 'managed'], ['Assignment profiles', '46', '4 pending']],
          list: [['Profile sync', '4 require processing'], ['Curriculum review', 'Field Operations Readiness'], ['Recent job', 'Assignment profile executed']],
          action: 'Open curricula', outcome: 'Curriculum register opened; Field Operations Readiness is ready to inspect.',
          decision: 'Distinguish an item from a curriculum and an assignment profile.', check: 'Inspect the source object before editing a population rule.'
        },
        {
          tab: 'Curriculum', title: 'Give retraining a durable structure.',
          summary: 'The curriculum groups required items and their different renewal intervals.',
          kind: 'table', heading: 'Field Operations Readiness', columns: ['Item', 'Type', 'Requirement', 'Retraining'],
          rows: [['Safety Foundations', 'Online', 'Required', '365 days'], ['Equipment Readiness', 'Online', 'Required', '365 days'], ['Incident Response', 'ILT', 'Required', '730 days'], ['Advanced Troubleshooting', 'Online', 'Optional', '—']],
          action: 'Inspect retraining', outcome: 'Required items retain separate 365-day and 730-day retraining rules.',
          decision: 'Keep qualification requirements inside the curriculum structure.', check: 'Verify item and curriculum renewal behavior for a returning learner.'
        },
        {
          tab: 'Profile rules', title: 'Let HR attributes form the learner population.',
          summary: 'I would make each condition visible before running bulk assignment changes.',
          kind: 'rules', heading: 'Assignment Profile / Field Technician — North America',
          fields: [['Job code', 'FIELD_TECH'], ['Region', 'North America'], ['Employee status', 'Active'], ['Assigned curriculum', 'Field Operations Readiness'], ['Annual safety', 'Required']],
          note: 'Preview · 1,846 matching learners',
          action: 'Preview population', outcome: '1,846 active North American field technicians match the profile.',
          decision: 'Use authoritative worker attributes with clear AND conditions.', check: 'Inspect mismatches and HR sync timing before execution.'
        },
        {
          tab: 'Processing audit', title: 'Explain why a learner received training.',
          summary: 'Processing totals and an assignment source make bulk automation supportable.',
          kind: 'sap-audit', heading: 'Assignment Profile Processing',
          values: [['Matched users', '1,846', 'valid'], ['New assignments', '128', 'added'], ['Removed', '17', 'review'], ['Unchanged', '1,701', 'retained']],
          list: [['Job state', 'Processing → Valid'], ['Sample learner', 'Taylor Kim'], ['Assignment source', 'AP_FIELD_TECH_NA']],
          action: 'Trace Taylor Kim', outcome: 'Field Operations Readiness assigned by AP_FIELD_TECH_NA; source attributes shown.',
          decision: 'Reconcile added, removed, and unchanged counts.', check: 'Trace one learner to the profile that produced the assignment.'
        }
      ]
    },
    workday: {
      name: 'Workday Learning', label: 'Platform-informed model', className: 'workday',
      icon: iconRoot + 'corporate-core/workday-learning-platform.png',
      menu: ['Home', 'My Tasks', 'Campaigns', 'Learning', 'Analytics'],
      scenes: [
        {
          tab: 'Task home', title: 'Start a campaign from the work queue.',
          summary: 'Learning campaigns sit alongside worker populations, tasks, and approvals.',
          kind: 'workday-tasks', heading: 'Learning Operations',
          values: [['Required learning', '89%', 'complete'], ['Campaigns', '07', 'active'], ['Active workers', '14,284', 'current'], ['Approvals', '03', 'awaiting']],
          list: [['Create Learning Campaign', 'Task'], ['Review security audience', 'Approval'], ['Manager Security Awareness', 'Draft']],
          action: 'Create campaign', outcome: 'Manager Security Awareness campaign opened in Draft.',
          decision: 'Use a campaign when the audience and follow-up need orchestration.', check: 'Confirm campaign ownership and security before selecting workers.'
        },
        {
          tab: 'Audience', title: 'Build a campaign population from HCM data.',
          summary: 'The target group should be previewable and reproducible.',
          kind: 'rules', heading: 'Manager Security Awareness / Audience',
          fields: [['Audience source', 'Custom report'], ['Report', 'People Managers — Active'], ['Organization', 'All regions'], ['Worker status', 'Active']],
          note: 'Preview · 3,218 recipients',
          action: 'Preview recipients', outcome: '3,218 active people managers match the saved audience report.',
          decision: 'Select an explainable worker source rather than a manual list.', check: 'Sample new and recently transferred managers.'
        },
        {
          tab: 'Orchestration', title: 'Sequence assignment, reminders, and approval.',
          summary: 'The business process makes the campaign state explicit before delivery.',
          kind: 'timeline', heading: 'Campaign Orchestration',
          steps: [['Assign course', 'Oct 1 · required'], ['Reminder', '7 days after if incomplete'], ['Final reminder', '3 days before due'], ['Approval', 'Awaiting review']],
          note: 'Draft → Awaiting Approval → Approved → Scheduled',
          action: 'Submit for approval', outcome: 'Campaign moved from Draft to Awaiting Approval; delivery remains unscheduled.',
          decision: 'Use conditional reminders instead of broadcasting to completers.', check: 'Review audience, dates, and security approval before schedule.'
        },
        {
          tab: 'Analytics', title: 'Measure delivery and learning separately.',
          summary: 'Opening a message is not the same as finishing the required learning.',
          kind: 'funnel', heading: 'Manager Security Awareness / Analytics',
          values: [['Delivered', '3,218'], ['Opened', '2,901'], ['Started learning', '2,477'], ['Completed', '2,138'], ['Past due', '164']],
          action: 'Inspect past due', outcome: '164 past-due workers isolated for manager follow-up.',
          decision: 'Read communications and learning outcomes as different signals.', check: 'Reconcile campaign completion with learning records.'
        }
      ]
    },
    blackboard: {
      name: 'Blackboard Learn', label: 'Platform-informed model', className: 'blackboard',
      icon: iconRoot + 'academic-cohort/blackboard-platform.png',
      menu: ['Administrator Panel', 'Organizations', 'Courses', 'Content Collection', 'System Reports'],
      scenes: [
        {
          tab: 'Institution tree', title: 'Scope administration to the institution.',
          summary: 'The hierarchy distributes oversight across colleges and departments.',
          kind: 'tree', heading: 'Institutional Hierarchy',
          nodes: [[0, 'Northstar University', 'institution'], [1, 'College of Business', 'college'], [1, 'College of Engineering', 'college'], [2, 'Computer Science', 'department'], [2, 'Mechanical Engineering', 'department'], [1, 'College of Arts', 'college']],
          action: 'Select Engineering', outcome: 'Engineering scope opened: courses, users, administrators, tools, and integrations.',
          decision: 'Assign scope at the college or department that owns the work.', check: 'Verify inherited administrator access.'
        },
        {
          tab: 'Term provisioning', title: 'Treat course creation as a monitored batch.',
          summary: 'A semester import needs exception handling, not just a success toast.',
          kind: 'table', heading: 'Course Management / Fall 2026', columns: ['Batch', 'Courses', 'Successful', 'Exceptions'],
          rows: [['Engineering', '128', '126', '02'], ['Business', '104', '102', '02'], ['Arts', '94', '91', '03'], ['Total', '326', '319', '07']],
          action: 'Inspect batch exceptions', outcome: 'Seven course records require review before Fall 2026 provisioning closes.',
          decision: 'Batch create from a reviewed term and course source.', check: 'Resolve failed course records and sample successful shells.'
        },
        {
          tab: 'Shared content', title: 'Maintain institutional resources centrally.',
          summary: 'Course teams should reference the current policy rather than duplicating old copies.',
          kind: 'tree', heading: 'Content Collection',
          nodes: [[0, 'Institution', 'shared'], [1, 'Policies', '12 resources'], [2, 'Academic Integrity Statement', 'v3.1'], [1, 'Accessibility Resources', '8 resources'], [1, 'Department Templates', '24 resources']],
          action: 'Trace policy usage', outcome: 'Academic Integrity Statement is referenced by 42 active courses.',
          decision: 'Govern a shared resource in one institution-level location.', check: 'Confirm affected courses after a policy revision.'
        },
        {
          tab: 'Term close', title: 'Archive courses without losing the record.',
          summary: 'End-of-term maintenance includes storage, activity, and job logs.',
          kind: 'table', heading: 'System Reporting / Disk Usage', columns: ['Course', 'Term', 'Storage', 'State'],
          rows: [['ENG101-01', 'Spring 2026', '1.8 GB', 'Archive ready'], ['BUS220-03', 'Spring 2026', '940 MB', 'Complete'], ['ART105-02', 'Fall 2025', '2.1 GB', 'Review'], ['CS210-01', 'Spring 2026', '1.2 GB', 'Archive ready']],
          action: 'Review archive jobs', outcome: 'Course copy and archive jobs completed; one content validation warning remains.',
          decision: 'Use a documented archive threshold and retain recovery access.', check: 'Read task logs before removing or marking a course complete.'
        }
      ]
    },
    canvas: {
      name: 'Canvas', label: 'Platform-informed model', className: 'canvas',
      icon: iconRoot + 'academic-cohort/canvas-platform.png',
      menu: ['Admin', 'Accounts', 'People', 'Permissions', 'Blueprints'],
      scenes: [
        {
          tab: 'Account scope', title: 'Make the account tree explain admin scope.',
          summary: 'Subaccounts can delegate local operations while preserving institution-level control.',
          kind: 'tree', heading: 'Accounts',
          nodes: [[0, 'Northstar University', 'root'], [1, 'College of Business', 'subaccount'], [1, 'College of Engineering', 'subaccount'], [2, 'Computer Science', 'department'], [1, 'Continuing Education', 'subaccount']],
          action: 'Select Engineering', outcome: 'Engineering account selected; local courses and admin scope are visible.',
          decision: 'Place courses and admins at the appropriate account level.', check: 'Test a department admin against adjacent subaccounts.'
        },
        {
          tab: 'Permissions', title: 'Separate root access from design support.',
          summary: 'Institution, college, department, and design roles should not have identical powers.',
          kind: 'matrix', heading: 'Account Roles',
          columns: ['Role', 'Courses', 'Users', 'SIS data', 'Blueprints'],
          rows: [['Root Administrator', '✓', '✓', '✓', '✓'], ['College Administrator', '✓', '✓', '—', '✓'], ['Department Administrator', '✓', '—', '—', '—'], ['ID Administrator', '✓', '—', '—', '✓'], ['Support Administrator', 'View', 'View', '—', '—']],
          action: 'Inspect ID role', outcome: 'ID Administrator can manage course design and Blueprint content without SIS access.',
          decision: 'Grant a scoped role for the actual design task.', check: 'Review inherited permissions before a role change.'
        },
        {
          tab: 'Blueprint', title: 'Lock the template attributes that must stay shared.',
          summary: 'Course teams retain local due dates while central content and points stay governed.',
          kind: 'editor', heading: 'ENG-COURSE-TEMPLATE / Blueprint',
          blocks: [['Pages', 'Content locked', 'Due dates local'], ['Assignments', 'Content + points locked', 'Due dates local'], ['Quizzes', 'Content + points locked', 'Availability local']],
          fields: [['Blueprint status', 'Enabled'], ['Associated courses', '18'], ['Pending changes', '04']],
          action: 'Preview sync impact', outcome: 'Four Blueprint changes affect 18 associated courses; local due dates remain editable.',
          decision: 'Lock only attributes that need institutional consistency.', check: 'Preview downstream changes before synchronizing.'
        },
        {
          tab: 'Sync monitor', title: 'Watch deployment into associated courses.',
          summary: 'A complete sync includes a visible warning path for one conflicting course.',
          kind: 'table', heading: 'Blueprint Sync History', columns: ['Course', 'Changes', 'State', 'Owner'],
          rows: [['ENG101-01', '04', 'Complete', 'Engineering'], ['ENG101-02', '04', 'Complete', 'Engineering'], ['ENG101-03', '03', 'Conflict', 'ID team'], ['ENG101-04', '04', 'Complete', 'Engineering']],
          note: '17 successful · 1 warning',
          action: 'Inspect conflict', outcome: 'ENG101-03 has a local edit that needs review before the final sync.',
          decision: 'Treat a sync warning as a change decision, not a silent failure.', check: 'Confirm the associated course after resolving its conflict.'
        }
      ]
    },
    sharepoint: {
      name: 'SharePoint Sites', label: 'Platform-informed model', className: 'sharepoint',
      icon: iconRoot + 'knowledge-portal/sharepoint-platform.png',
      menu: ['Active sites', 'Hub sites', 'Libraries', 'Permissions', 'Pages'],
      scenes: [
        {
          tab: 'Site architecture', title: 'Organize knowledge around work.',
          summary: 'A learning hub connects owned sites without forcing every resource into an LMS course.',
          kind: 'tree', heading: 'SharePoint Admin Center / Active Sites',
          nodes: [[0, 'Learning Hub', 'hub candidate'], [1, 'Sales Enablement', 'communication'], [1, 'Manager Resources', 'team site'], [1, 'Partner Resources', 'communication']],
          action: 'Preview hub association', outcome: 'Three resource sites connect to Learning Hub with distinct owners.',
          decision: 'Group related resources under a navigable hub.', check: 'Confirm site owner and association permissions.'
        },
        {
          tab: 'Resource library', title: 'Use metadata and versions to prevent stale guidance.',
          summary: 'The document library makes audience, owner, review date, and approval visible.',
          kind: 'table', heading: 'Learning Resources', columns: ['Resource', 'Audience', 'Owner', 'State'],
          rows: [['Sales Playbook', 'Sales', 'Enablement', 'Published'], ['Manager Toolkit', 'Managers', 'HR', 'Published'], ['Product Guide', 'Partners', 'Product', 'Review due']],
          note: 'Product Guide · v2.3 Draft · v2.2 Approved · v2.1 Approved',
          action: 'Open version history', outcome: 'Product Guide version history opened; v2.2 remains the approved reader version.',
          decision: 'Keep draft and approved versions distinguishable.', check: 'Confirm that published links resolve to the approved resource.'
        },
        {
          tab: 'Access', title: 'Keep site and guest access intentionally scoped.',
          summary: 'Site permissions and external sharing settings jointly determine access.',
          kind: 'matrix', heading: 'Site Settings / Permissions',
          columns: ['Group', 'Read', 'Edit', 'Manage', 'Share'],
          rows: [['Owners', '✓', '✓', '✓', '✓'], ['Members', '✓', '✓', '—', '—'], ['Visitors', '✓', '—', '—', '—'], ['External guests', '✓', '—', '—', '—']],
          note: 'Site sharing: New and existing guests · Anonymous links disabled',
          action: 'Test guest access', outcome: 'Guest can read approved Partner Resources; draft and owner controls remain hidden.',
          decision: 'Use the most restrictive setting appropriate to the resource.', check: 'Test a real guest account and a visitor account.'
        },
        {
          tab: 'Publish', title: 'Move a page through approval into a traceable release.',
          summary: 'A maintained knowledge page has a review state and version history.',
          kind: 'timeline', heading: 'Manager Resource Center / Page editor',
          steps: [['Draft', 'Hero + quick links'], ['Pending approval', 'Owner reviews'], ['Approved', 'Content checked'], ['Published', 'Version 8.0']],
          note: 'Version 7.0 remains in history',
          action: 'Submit for approval', outcome: 'Version 8.0 is pending approval; version 7.0 remains available to readers.',
          decision: 'Publish through a named owner and approval state.', check: 'Verify the page version and links after release.'
        }
      ]
    }
  };

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const focusTargets={
    absorb:['Courses requiring attention','Cybersecurity Essentials','Cybersecurity Basics','Morgan Lee'],
    docebo:['Partner Academy','Certifications','Enrollments','Solution Partners — West'],
    cornerstone:['Expiring in 30 days','Final Assessment','Division','North America'],
    sap:['Curricula','Safety Foundations','Job code','Taylor Kim'],
    workday:['Create Learning Campaign','Report','Approval','Past due'],
    blackboard:['College of Engineering','Engineering','Academic Integrity Statement','ART105-02'],
    canvas:['College of Engineering','ID Administrator','Pending changes','ENG101-03'],
    sharepoint:['Learning Hub','Product Guide','External guests','Pending approval']
  };
  const workflowGuides={
    absorb:['Select the attention tile to locate the affected course.','Open Cybersecurity Essentials from the course register.','Inspect the lesson being replaced before staging the package.','Open Morgan Lee, then review enrollment and transcript details.'],
    docebo:['Open Partner Academy in the enterprise tree.','Preview the Certifications menu in the partner site.','Review the Enrollments permission and its branch scope.','Open the West branch to read its own operating signals.'],
    cornerstone:['Open the expiring population from the compliance overview.','Inspect the final assessment in the certification lifecycle.','Review the division condition before previewing the assignment.','Open North America to plan the overdue intervention.'],
    sap:['Open Curricula from Learning Administration.','Inspect the required Safety Foundations item.','Review the job code condition in the assignment profile.','Trace Taylor Kim back to the processing job.'],
    workday:['Open the campaign work queue.','Inspect the saved audience report feeding the campaign.','Review the approval step before scheduling delivery.','Open the past-due segment for follow-up.'],
    blackboard:['Select the College of Engineering hierarchy node.','Open the Engineering term import batch.','Trace the shared Academic Integrity Statement.','Inspect the course that needs archive review.'],
    canvas:['Select the College of Engineering subaccount.','Review the ID Administrator role.','Inspect pending Blueprint changes before sync.','Open the course with a sync conflict.'],
    sharepoint:['Open Learning Hub in the active sites list.','Inspect Product Guide version history.','Review the external guest permission scope.','Open the pending approval step for the page.']
  };
  const menuForScene={
    absorb:['Dashboard','Courses','Courses','Reports'],
    docebo:['Extended enterprise','Pages & menus','Power users','Reports'],
    cornerstone:['Compliance','Compliance','Assignments','Reports'],
    sap:['Learning Admin','Curricula','Assignment Profiles','Assignment Profiles'],
    workday:['My Tasks','Campaigns','Campaigns','Analytics'],
    blackboard:['Administrator Panel','Courses','Content Collection','System Reports'],
    canvas:['Accounts','Permissions','Blueprints','Blueprints'],
    sharepoint:['Active sites','Libraries','Permissions','Pages']
  };
  const dragCases={
    'docebo:2':{source:'Reports · view',target:'Solution Partners — West',result:'Effective access: partner manager can see West reports; other branches stay outside the resource scope.'},
    'workday:1':{source:'People Managers — Active',target:'Campaign audience',result:'Saved HCM report connected to the campaign; 3,218 active managers appear in the preview.'},
    'canvas:2':{source:'04 pending changes',target:'18 associated courses',result:'Sync preview shows four changes across 18 courses; local due dates remain editable.'}
  };
  let activePrompt='';
  function item(label,kind,index,selected){
    if(!activePrompt||!label.includes(activePrompt))return '<strong class="pui-static">'+esc(label)+'</strong>';
    return '<button type="button" class="pui-inspect is-target" data-inspect="'+esc(label)+'" aria-label="Inspect '+esc(label)+'" aria-expanded="false"><span>'+esc(label)+'</span><i aria-hidden="true">↗</i></button>';
  }
  function renderContent(scene,selected){
    if(scene.kind==='risk')return '<div class="pui-risk-head"><div><small>COMPLIANCE PULSE</small><strong>'+esc(scene.values[0][1])+'</strong><span>Current certification coverage</span></div><div class="pui-risk-ring" aria-hidden="true"><i></i></div></div><div class="pui-risk-queue"><h5>Renewal and exception queue</h5>'+scene.values.slice(1).map((v,i)=>'<div class="pui-risk-row"><span class="pui-risk-count">'+esc(v[1])+'</span>'+item(v[0],scene.kind,i,selected)+'<small>'+esc(v[2])+'</small></div>').join('')+'</div><div class="pui-risk-footer">'+scene.list.map(v=>'<span><b>'+esc(v[0])+'</b>'+esc(v[1])+'</span>').join('')+'</div>';
    if(scene.kind==='sap-intake')return '<div class="pui-sap-objects"><h5>Learning object registry</h5><div>'+scene.values.map((v,i)=>'<div class="pui-sap-object"><b>'+String(i+1).padStart(2,'0')+'</b>'+item(v[0],scene.kind,i,selected)+'<strong>'+esc(v[1])+'</strong><small>'+esc(v[2])+'</small></div>').join('')+'</div></div><div class="pui-sap-job"><strong>PROCESSING ACTIVITY</strong>'+scene.list.map(v=>'<span>'+item(v[0],scene.kind,0,selected)+'<b>'+esc(v[1])+'</b></span>').join('')+'</div>';
    if(scene.kind==='sap-audit')return '<div class="pui-sap-run"><div><small>ASSIGNMENT PROFILE JOB</small><strong>AP_FIELD_TECH_NA</strong><span>Processing → Valid</span></div><div class="pui-sap-run-bar"><i></i></div></div><div class="pui-sap-ledger">'+scene.values.map((v,i)=>'<div><small>'+esc(v[0])+'</small>'+item(v[1]+' '+v[0],scene.kind,i,selected)+'<span>'+esc(v[2])+'</span></div>').join('')+'</div><div class="pui-sap-trace"><b>TRACE ONE LEARNER</b>'+item('Taylor Kim',scene.kind,0,selected)+'<span>Assignment source: AP_FIELD_TECH_NA</span></div>';
    if(scene.kind==='workday-tasks')return '<div class="pui-workday-head"><div><small>LEARNING OPERATIONS</small><strong>Today’s work</strong><span>Campaigns, worker audiences, and approvals in one queue</span></div><b>03</b></div><div class="pui-workday-queue"><h5>My Tasks</h5>'+scene.list.map((v,i)=>'<div class="pui-workday-task"><b>'+String(i+1).padStart(2,'0')+'</b>'+item(v[0],scene.kind,i,selected)+'<small>'+esc(v[1])+'</small></div>').join('')+'</div><div class="pui-workday-stats">'+scene.values.slice(0,3).map((v,i)=>'<div><small>'+esc(v[0])+'</small><strong>'+esc(v[1])+'</strong><span>'+esc(v[2])+'</span></div>').join('')+'</div>';
    if(scene.kind==='metrics')return '<div class="pui-metrics">'+scene.values.map((v,i)=>'<div class="pui-metric"><small>'+esc(v[0])+'</small>'+item(v[1]+' '+v[0],scene.kind,i,selected)+'<span>'+esc(v[2])+'</span></div>').join('')+'</div><div class="pui-list"><h5>Attention and activity</h5>'+scene.list.map((v,i)=>'<div class="pui-list-row">'+item(v[0],scene.kind,i,selected)+'<b>'+esc(v[1])+'</b></div>').join('')+'</div>';
    if(scene.kind==='table'||scene.kind==='matrix')return '<div class="pui-table-wrap"><table class="pui-table"><thead><tr>'+scene.columns.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+scene.rows.map((row,i)=>'<tr class="'+(selected===row[0]?'is-selected':'')+'">'+row.map((v,j)=>'<td>'+(j===0?item(v,scene.kind,i,selected):esc(v))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'+(scene.note?'<p class="pui-note">'+esc(scene.note)+'</p>':'')+(scene.heading==='Course Activity Report'?'<div class="pui-learner-profile" data-profile-panel hidden><div><b>ML</b><span><strong>Morgan Lee</strong><small>Sales · Cybersecurity Essentials</small></span></div><p>Current progress: 60% · score not recorded</p><div class="pui-profile-actions"><button type="button" data-profile="enrollment">Enrollment</button><button type="button" data-profile="transcript">Transcript</button></div></div>':'');
    if(scene.kind==='tree')return '<div class="pui-tree">'+scene.nodes.map((node,i)=>'<div class="pui-tree-node depth-'+node[0]+'">'+item(node[1],scene.kind,i,selected)+'<small>'+esc(node[2])+'</small></div>').join('')+'</div>';
    if(scene.kind==='editor')return '<div class="pui-editor"><div class="pui-blocks"><h5>Course structure</h5>'+scene.blocks.map((b,i)=>'<div class="pui-block"><b>'+esc(b[0])+'</b>'+item(b[1],scene.kind,i,selected)+'<small>'+esc(b[2])+'</small></div>').join('')+'</div><div class="pui-fields"><h5>Configuration</h5>'+scene.fields.map((f,i)=>'<div class="pui-field">'+item(f[0],scene.kind,i,selected)+'<strong>'+esc(f[1])+'</strong></div>').join('')+'</div></div>';
    if(scene.kind==='designer')return '<div class="pui-designer"><div class="pui-designer-config"><h5>Experience controls</h5>'+scene.fields.map((f,i)=>'<div class="pui-field">'+item(f[0],scene.kind,i,selected)+'<strong>'+esc(f[1])+'</strong></div>').join('')+'</div><div class="pui-learner-preview"><div class="pui-preview-header">Partner Academy <small>LEARNER VIEW</small></div><div class="pui-preview-welcome"><b>Welcome back</b><span>Your certification route is ready.</span></div><div class="pui-preview-nav">'+scene.blocks.map((b,i)=>item(b[1],scene.kind,i,selected)).join('')+'</div><div class="pui-preview-course"><strong>Partner Sales Certification</strong><small>Continue learning →</small></div></div></div>';
    if(scene.kind==='rules')return '<div class="pui-rules"><div class="pui-rules-list"><h5>Rule conditions</h5>'+scene.fields.map((f,i)=>'<div class="pui-rule">'+item(f[0],scene.kind,i,selected)+'<strong>'+esc(f[1])+'</strong>'+(i<scene.fields.length-1?'<em>AND</em>':'')+'</div>').join('')+'</div><div class="pui-rule-result"><span>Population preview</span><strong>'+esc(scene.note)+'</strong><i></i><small>Source attributes → assignment</small></div></div>';
    if(scene.kind==='timeline')return '<div class="pui-timeline">'+scene.steps.map((step,i)=>'<div class="pui-step"><b>'+String(i+1).padStart(2,'0')+'</b>'+item(step[0],scene.kind,i,selected)+'<span>'+esc(step[1])+'</span></div>').join('')+'</div>'+(scene.note?'<p class="pui-note">'+esc(scene.note)+'</p>':'');
    if(scene.kind==='funnel')return '<div class="pui-funnel">'+scene.values.map((v,i)=>'<div class="pui-funnel-row" style="--bar:'+Math.max(30,100-i*12)+'%">'+item(v[0],scene.kind,i,selected)+'<i></i><strong>'+esc(v[1])+'</strong></div>').join('')+'</div>';
    return '';
  }
  function inspectionDetail(scene,label,preferred){
    if(label.includes(preferred))return scene.outcome;
    const row=(scene.rows||[]).find(v=>v[0]===label);
    if(row)return row.slice(1).map((v,i)=>((scene.columns||[])[i+1]||'Status')+': '+v).join(' · ')+'. '+scene.check;
    const field=(scene.fields||[]).find(v=>v[0]===label);
    if(field)return field[0]+': '+field[1]+'. '+scene.check;
    const block=(scene.blocks||[]).find(v=>v[1]===label);
    if(block)return block[1]+' · '+block[2]+'. '+scene.check;
    const metric=(scene.values||[]).find(v=>label===v[0]||label===v[1]+' '+v[0]);
    if(metric)return metric[0]+': '+metric[1]+(metric[2]?' · '+metric[2]:'')+'. '+scene.check;
    const entry=(scene.list||[]).find(v=>v[0]===label);
    if(entry)return entry[0]+': '+entry[1]+'. '+scene.check;
    const node=(scene.nodes||[]).find(v=>v[1]===label);
    if(node)return node[1]+' · '+node[2]+'. '+scene.check;
    const step=(scene.steps||[]).find(v=>v[0]===label);
    if(step)return step[0]+': '+step[1]+'. '+scene.check;
    return scene.check;
  }
  function makeWorkbench(root){
    const ids=root.dataset.platforms.split(',');
    let platformId=ids[0],sceneIndex=0,selected='',detailOverride='',dragPicked=false;
    const getScene=()=>demos[platformId].scenes[sceneIndex];
    function promptTarget(){
      const preferred=focusTargets[platformId][sceneIndex];
      return preferred;
    }
    function render(){
      const platform=demos[platformId],scene=getScene(),preferred=promptTarget(),drag=dragCases[platformId+':'+sceneIndex];
      const activeMenu=menuForScene[platformId][sceneIndex];
      activePrompt=preferred;
      root.dataset.theme=platform.className;
      root.innerHTML='<div class="platform-tabs" role="tablist" aria-label="Choose a platform">'+ids.map(id=>'<button type="button" role="tab" data-platform="'+id+'" aria-selected="'+(id===platformId)+'" class="platform-tab'+(id===platformId?' active':'')+'"><img src="'+esc(demos[id].icon)+'" alt="">'+esc(demos[id].name)+'</button>').join('')+'</div>'+
        '<div class="platform-scene-nav" role="tablist" aria-label="'+esc(platform.name)+' walkthrough screens">'+platform.scenes.map((s,i)=>'<button type="button" role="tab" data-scene="'+i+'" aria-selected="'+(i===sceneIndex)+'" class="'+(i===sceneIndex?'active':'')+'"><b>'+String(i+1).padStart(2,'0')+'</b><span>'+esc(s.tab)+'</span></button>').join('')+'</div>'+
        '<div class="platform-panel" role="tabpanel" aria-live="polite"><div class="platform-screen"><div class="platform-screen-bar"><span class="pui-brand"><img src="'+esc(platform.icon)+'" alt=""><strong>'+esc(platform.name)+'</strong></span><span class="pui-sim-tag">Portfolio-safe simulation</span></div><div class="pui-app"><aside class="pui-sidebar" aria-hidden="true">'+platform.menu.map(v=>'<span class="'+(v===activeMenu?'current':'')+'">'+esc(v)+'</span>').join('')+'</aside>'+
        '<div class="pui-work"><div class="pui-toolbar"><div><small>'+esc(platform.name)+' / '+esc(activeMenu)+'</small><h4>'+esc(scene.heading)+'</h4></div><span class="pui-scene-count">'+(sceneIndex+1)+' / 4</span></div>'+
        '<div class="pui-guide"><strong>ADMIN TASK</strong><span>'+esc(workflowGuides[platformId][sceneIndex])+'</span></div>'+
        '<div class="pui-body pui-body-'+scene.kind+'">'+renderContent(scene,selected)+(drag?'<div class="pui-drag-lane"><span>TRY A CONFIGURATION MATCH</span><button type="button" data-drag-source draggable="true" class="'+(dragPicked?'picked':'')+'">'+esc(drag.source)+'</button><i>→</i><button type="button" data-drag-target>'+esc(drag.target)+'</button><small>Drag or select both</small></div>':'')+'</div>'+
        '<div class="pui-screen-footer"><span>'+(selected?'Record inspected · ready for next screen':'Select a highlighted record or control')+'</span><button type="button" data-next-screen>'+(sceneIndex===3?'Replay workflow':'Next: '+esc(platform.scenes[sceneIndex+1].tab))+' →</button></div></div></div></div>'+
        '<aside class="platform-story"><p class="eyebrow">'+esc(platform.label)+' · '+esc(scene.tab)+'</p><h3>'+esc(scene.title)+'</h3><p>'+esc(scene.summary)+'</p><div class="platform-insight"><span>Configuration decision</span><strong>'+esc(scene.decision)+'</strong></div><div class="platform-insight"><span>Before release</span><strong>'+esc(scene.check)+'</strong></div><div class="platform-progress"><i style="width:'+((sceneIndex+1)*25)+'%"></i></div></aside></div>';
    }
    function closeDetail(){
      selected='';detailOverride='';
      root.querySelector('.pui-detail')?.remove();
      root.querySelectorAll('[data-inspect]').forEach(button=>{button.classList.remove('is-selected');button.setAttribute('aria-expanded','false');});
      root.querySelector('.pui-table tr.is-selected')?.classList.remove('is-selected');
      const footer=root.querySelector('.pui-screen-footer>span');if(footer)footer.textContent='Select a highlighted record or control';
    }
    function show(text,detail='',anchor){
      closeDetail();selected=text;detailOverride=detail;
      const scene=getScene(),preferred=promptTarget(),work=root.querySelector('.pui-work');
      if(!work)return;
      const hotspot=anchor||root.querySelector('[data-inspect]')||root.querySelector('[data-drag-target]');
      if(hotspot?.dataset?.inspect){hotspot.classList.add('is-selected');hotspot.setAttribute('aria-expanded','true');hotspot.closest('tr')?.classList.add('is-selected');}
      const profile=root.querySelector('[data-profile-panel]');if(profile&&text==='Morgan Lee')profile.hidden=false;
      work.insertAdjacentHTML('beforeend','<div class="pui-detail" role="status"><button type="button" data-close-detail aria-label="Close detail">×</button><small>INSPECTING / '+esc(text)+'</small><strong>'+esc(detail||inspectionDetail(scene,text,preferred))+'</strong></div>');
      const popup=root.querySelector('.pui-detail'),footer=root.querySelector('.pui-screen-footer>span');
      if(footer)footer.textContent='Record inspected · ready for next screen';
      if(!popup||!hotspot?.getBoundingClientRect||!work.getBoundingClientRect)return;
      const a=hotspot.getBoundingClientRect(),w=work.getBoundingClientRect(),pw=popup.offsetWidth||290,ph=popup.offsetHeight||110;
      const spaceRight=w.right-a.right,spaceLeft=a.left-w.left;
      let left=spaceRight>=pw+14?a.right-w.left+10:spaceLeft>=pw+14?a.left-w.left-pw-10:a.left-w.left;
      let top=a.top-w.top;
      if(spaceRight<pw+14&&spaceLeft<pw+14)top=a.bottom-w.top+10;
      const footTop=root.querySelector('.pui-screen-footer')?.getBoundingClientRect?.().top||w.bottom;
      if(top+ph>footTop-w.top-8)top=a.top-w.top-ph-10;
      popup.style.left=Math.max(8,Math.min(left,w.width-pw-8))+'px';
      popup.style.top=Math.max(8,Math.min(top,footTop-w.top-ph-8))+'px';
    }
    root.addEventListener('click',event=>{
      const platform=event.target.closest('[data-platform]'),stage=event.target.closest('[data-scene]'),inspect=event.target.closest('[data-inspect]');
      if(platform){platformId=platform.dataset.platform;sceneIndex=0;selected='';detailOverride='';dragPicked=false;render();return;}
      if(stage){sceneIndex=Number(stage.dataset.scene);selected='';detailOverride='';dragPicked=false;render();return;}
      if(inspect){show(inspect.dataset.inspect,'',inspect);return;}
      const profile=event.target.closest('[data-profile]');
      if(profile){const details={enrollment:'Enrollment remains active at 60%; the package change did not create a second enrollment.',transcript:'No score or completion event is recorded yet. Compare the learner launch with the LMS transcript before editing progress.'};show('Morgan Lee',details[profile.dataset.profile],profile);return;}
      if(event.target.closest('[data-next-screen]')){sceneIndex=(sceneIndex+1)%4;selected='';detailOverride='';dragPicked=false;render();return;}
      if(event.target.closest('[data-close-detail]')){closeDetail();return;}
      if(event.target.closest('[data-drag-source]')){dragPicked=true;root.querySelector('[data-drag-source]').classList.add('picked');return;}
      if(event.target.closest('[data-drag-target]')){if(dragPicked){const d=dragCases[platformId+':'+sceneIndex];show(d.target,d.result,event.target.closest('[data-drag-target]'));dragPicked=false;}else root.querySelector('[data-drag-source]').focus();return;}
    });
    root.addEventListener('dragstart',event=>{if(event.target.closest('[data-drag-source]')){dragPicked=true;event.dataTransfer.setData('text/plain','configuration');}});
    root.addEventListener('dragover',event=>{if(event.target.closest('[data-drag-target]'))event.preventDefault();});
    root.addEventListener('drop',event=>{if(event.target.closest('[data-drag-target]')){event.preventDefault();const d=dragCases[platformId+':'+sceneIndex];if(d)show(d.target,d.result,event.target.closest('[data-drag-target]'));dragPicked=false;}});
    root.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;const tab=event.target.closest('[role="tab"]');if(!tab)return;const all=[...tab.parentElement.querySelectorAll('[role="tab"]')],i=all.indexOf(tab);if(i<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?all.length-1:(i+(event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1)+all.length)%all.length;all[next].click();if(all[next].dataset.platform)root.querySelector('[data-platform="'+all[next].dataset.platform+'"]')?.focus();else root.querySelector('[data-scene="'+next+'"]')?.focus();});
    render();
  }
  document.querySelectorAll('.platform-workbench[data-platforms]').forEach(makeWorkbench);
})();
