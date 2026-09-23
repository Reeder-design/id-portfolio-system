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
          kind: 'metrics', heading: 'Compliance Overview',
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
          kind: 'metrics', heading: 'Learning Administration',
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
          kind: 'metrics', heading: 'Assignment Profile Processing',
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
          kind: 'metrics', heading: 'Learning Operations',
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

  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cell = (value, tag) => '<' + tag + '>' + esc(value) + '</' + tag + '>';
  function renderContent(scene) {
    if (scene.kind === 'metrics') {
      return '<div class="pui-metrics">' + scene.values.map((v) => '<div class="pui-metric"><span>' + esc(v[0]) + '</span><strong>' + esc(v[1]) + '</strong><small>' + esc(v[2]) + '</small></div>').join('') + '</div><div class="pui-list"><h5>Attention and activity</h5>' + scene.list.map((row) => '<div class="pui-list-row"><span>' + esc(row[0]) + '</span><b>' + esc(row[1]) + '</b></div>').join('') + '</div>';
    }
    if (scene.kind === 'table' || scene.kind === 'matrix') {
      return '<div class="pui-table-wrap"><table class="pui-table"><thead><tr>' + scene.columns.map((c) => cell(c, 'th')).join('') + '</tr></thead><tbody>' + scene.rows.map((row) => '<tr>' + row.map((c) => cell(c, 'td')).join('') + '</tr>').join('') + '</tbody></table></div>' + (scene.note ? '<p class="pui-note">' + esc(scene.note) + '</p>' : '');
    }
    if (scene.kind === 'tree') {
      return '<div class="pui-tree">' + scene.nodes.map((node) => '<div class="pui-tree-node depth-' + node[0] + '"><i aria-hidden="true"></i><strong>' + esc(node[1]) + '</strong><small>' + esc(node[2]) + '</small></div>').join('') + '</div>';
    }
    if (scene.kind === 'designer') {
      return '<div class="pui-designer"><div class="pui-designer-config"><h5>Experience controls</h5>' + scene.fields.map((field) => '<div class="pui-field"><span>' + esc(field[0]) + '</span><strong>' + esc(field[1]) + '</strong></div>').join('') + '</div><div class="pui-learner-preview"><div class="pui-preview-header">Partner Academy <small>LEARNER VIEW</small></div><div class="pui-preview-welcome"><b>Welcome back</b><span>Your certification route is ready.</span></div><div class="pui-preview-nav">' + scene.blocks.map((block) => '<span>' + esc(block[1]) + '</span>').join('') + '</div><div class="pui-preview-course"><strong>Partner Sales Certification</strong><small>Continue learning →</small></div></div></div>';
    }
    if (scene.kind === 'editor') {
      return '<div class="pui-editor"><div class="pui-blocks"><h5>Course structure</h5>' + scene.blocks.map((block) => '<div class="pui-block"><b>' + esc(block[0]) + '</b><strong>' + esc(block[1]) + '</strong><small>' + esc(block[2]) + '</small></div>').join('') + '</div><div class="pui-fields"><h5>Configuration</h5>' + scene.fields.map((field) => '<div class="pui-field"><span>' + esc(field[0]) + '</span><strong>' + esc(field[1]) + '</strong></div>').join('') + '</div></div>';
    }
    if (scene.kind === 'rules') {
      return '<div class="pui-rules"><div class="pui-rules-list"><h5>Rule conditions</h5>' + scene.fields.map((field, i) => '<div class="pui-rule"><span>' + esc(field[0]) + '</span><strong>' + esc(field[1]) + '</strong>' + (i < scene.fields.length - 1 ? '<em>AND</em>' : '') + '</div>').join('') + '</div><div class="pui-rule-result"><span>Population preview</span><strong>' + esc(scene.note) + '</strong><i></i><small>Source attributes → assignment</small></div></div>';
    }
    if (scene.kind === 'timeline') {
      return '<div class="pui-timeline">' + scene.steps.map((step, i) => '<div class="pui-step"><b>' + String(i + 1).padStart(2, '0') + '</b><strong>' + esc(step[0]) + '</strong><span>' + esc(step[1]) + '</span></div>').join('') + '</div><p class="pui-note">' + esc(scene.note) + '</p>';
    }
    if (scene.kind === 'funnel') {
      return '<div class="pui-funnel">' + scene.values.map((v, i) => '<div class="pui-funnel-row" style="--bar:' + Math.max(30, 100 - i * 12) + '%"><span>' + esc(v[0]) + '</span><i></i><strong>' + esc(v[1]) + '</strong></div>').join('') + '</div>';
    }
    return '';
  }

  function makeWorkbench(root) {
    const ids = root.dataset.platforms.split(',');
    let platformId = ids[0];
    let sceneIndex = 0;
    let activated = false;
    function render() {
      const platform = demos[platformId];
      const scene = platform.scenes[sceneIndex];
      root.dataset.theme = platform.className;
      root.dataset.scene = String(sceneIndex);
      root.innerHTML =
        '<div class="platform-tabs" role="tablist" aria-label="Choose a platform">' +
          ids.map((id) => '<button type="button" role="tab" data-platform="' + id + '" tabindex="' + (id === platformId ? '0' : '-1') + '" aria-selected="' + (id === platformId) + '" class="platform-tab' + (id === platformId ? ' active' : '') + '">' + '<img src="' + esc(demos[id].icon) + '" alt="">' + esc(demos[id].name) + '</button>').join('') +
        '</div><div class="platform-scene-nav" role="tablist" aria-label="' + esc(platform.name) + ' administration stages">' +
          platform.scenes.map((item, i) => '<button type="button" role="tab" data-scene="' + i + '" tabindex="' + (i === sceneIndex ? '0' : '-1') + '" aria-selected="' + (i === sceneIndex) + '" class="' + (i === sceneIndex ? 'active' : '') + '"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + esc(item.tab) + '</span></button>').join('') +
        '</div><div class="platform-panel" role="tabpanel" aria-live="polite">' +
          '<div class="platform-screen"><div class="platform-screen-bar"><span class="pui-brand"><img src="' + esc(platform.icon) + '" alt=""><strong>' + esc(platform.name) + '</strong></span><span class="pui-sim-tag">Portfolio-safe simulation</span></div>' +
            '<div class="pui-app"><aside class="pui-sidebar" aria-hidden="true">' + platform.menu.map((label, i) => '<span class="' + (i === Math.min(sceneIndex, platform.menu.length - 1) ? 'current' : '') + '">' + esc(label) + '</span>').join('') + '</aside>' +
            '<div class="pui-work"><div class="pui-toolbar"><div><small>' + esc(platform.name) + ' / Administration</small><h4>' + esc(scene.heading) + '</h4></div><span class="pui-scene-count">' + (sceneIndex + 1) + ' / 4</span></div>' +
              '<div class="pui-body pui-' + scene.kind + '">' + renderContent(scene) + '</div>' +
              '<div class="pui-actionbar"><button type="button" data-activate aria-pressed="' + activated + '">' + esc(scene.action) + ' <span aria-hidden="true">→</span></button><span>Click to inspect this decision</span></div>' +
              (activated ? '<div class="pui-result" role="status"><span class="pui-result-check" aria-hidden="true">✓</span><strong>' + esc(scene.outcome) + '</strong><button type="button" data-dismiss aria-label="Close result">×</button></div>' : '') +
            '</div></div></div>' +
          '<div class="platform-story"><p class="eyebrow">' + esc(platform.label) + ' · ' + esc(scene.tab) + '</p><h3>' + esc(scene.title) + '</h3><p>' + esc(scene.summary) + '</p><div class="platform-insight"><span>My configuration decision</span><strong>' + esc(scene.decision) + '</strong></div><div class="platform-insight"><span>What I verify</span><strong>' + esc(scene.check) + '</strong></div><div class="platform-progress"><i style="width:' + ((sceneIndex + 1) * 25) + '%"></i></div><button type="button" data-next>' + (sceneIndex === 3 ? 'Replay this workflow' : 'Next: ' + esc(platform.scenes[sceneIndex + 1].tab)) + ' <span aria-hidden="true">→</span></button></div>' +
        '</div>';
    }
    root.addEventListener('click', (event) => {
      const platformButton = event.target.closest('[data-platform]');
      const sceneButton = event.target.closest('[data-scene]');
      if (platformButton) { platformId = platformButton.dataset.platform; sceneIndex = 0; activated = false; render(); return; }
      if (sceneButton) { sceneIndex = Number(sceneButton.dataset.scene); activated = false; render(); return; }
      if (event.target.closest('[data-next]')) { sceneIndex = (sceneIndex + 1) % 4; activated = false; render(); return; }
      if (event.target.closest('[data-activate]')) { activated = !activated; render(); return; }
      if (event.target.closest('[data-dismiss]')) { activated = false; render(); }
    });
    root.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      const tab = event.target.closest('[role="tab"]');
      if (!tab) return;
      const buttons = Array.from(tab.parentElement.querySelectorAll('[role="tab"]'));
      const current = buttons.indexOf(tab);
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 :
        (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      const selected = buttons[next];
      if (selected.dataset.platform) { platformId = selected.dataset.platform; sceneIndex = 0; }
      else sceneIndex = Number(selected.dataset.scene);
      activated = false;
      render();
      if (selected.dataset.platform) root.querySelector('[data-platform="' + platformId + '"]')?.focus();
      else root.querySelector('[data-scene="' + sceneIndex + '"]')?.focus();
    });
    render();
  }
  document.querySelectorAll('.platform-workbench[data-platforms]').forEach(makeWorkbench);
})();
