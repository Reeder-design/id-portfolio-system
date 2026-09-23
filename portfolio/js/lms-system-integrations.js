(() => {
'use strict';
const cases={
  business:{
    evidence:'DIRECT MATCHING WORK · SALESFORCE → ABSORB',title:'Verify the account before placing the learner.',
    summary:'In my Salesforce-to-Absorb review workflow, an email could locate a person while the related account determined the correct partner audience. Ambiguous account matches stayed in a review queue.',
    lesson:'A matching email is only the starting point. I check account and region together before recommending an LMS placement.',
    visual:'<div class="ix-flowboard ix-auto-business"><div class="ix-flow-step"><small>01 / CRM CONTEXT</small><div class="ix-crm-card"><b>ML</b><strong>Morgan Lee</strong><span>Partner account · West</span></div><div class="ix-attribute"><span>Email</span><b>matched</b></div><div class="ix-attribute"><span>Account + region</span><b>verified</b></div></div><div class="ix-flow-step"><small>02 / MATCH REVIEW</small><div class="ix-crosswalk"><span>CRM EMAIL</span><i></i><span>LMS USER ID</span></div><div class="ix-crosswalk"><span>ACCOUNT</span><i></i><span>AUDIENCE</span></div><div class="ix-crosswalk"><span>REGION</span><i></i><span>CATALOG</span></div><div class="ix-review-queue">Ambiguous → review queue</div></div><div class="ix-flow-step"><small>03 / ABSORB ROUTE</small><div class="ix-result-card"><strong>Partner Academy</strong><span>Certification visible</span><div><i></i><i></i><i></i></div></div><div class="ix-check-badge">Placement recommendation ✓</div></div><div class="ix-flow-signal"></div></div>'
  },
  identity:{
    evidence:'PLATFORM-INFORMED PATTERN · IDENTITY → LEARNER VIEW',title:'Test more than a successful sign-in.',
    summary:'A login can pass while the resolved group or catalog is wrong. I use a test learner for each audience and verify the route that appears after provisioning.',
    lesson:'The stable ID, group membership, and visible catalog should be checked together after an account or role change.',
    visual:'<div class="ix-flowboard ix-auto-identity"><div class="ix-flow-step"><small>01 / IDENTITY EVENT</small><div class="ix-id-token"><b>UID 2048</b><span>SSO ✓</span></div><div class="ix-attribute"><span>Account</span><b>Partner</b></div><div class="ix-attribute"><span>Region</span><b>West</b></div></div><div class="ix-flow-step"><small>02 / ACCESS RESOLVER</small><div class="ix-rule-branch"><span>Stable ID</span><i></i><b>Partner group</b></div><div class="ix-rule-branch"><span>Partner group</span><i></i><b>West catalog</b></div><div class="ix-rule-branch"><span>Customer-only</span><i></i><b>Hidden</b></div></div><div class="ix-flow-step"><small>03 / LEARNER PREVIEW</small><div class="ix-mini-screen"><b>PARTNER ACADEMY</b><span>Sales certification</span><span>Product resources</span><em>Customer catalog hidden</em></div><div class="ix-check-badge">Audience view verified ✓</div></div><div class="ix-flow-signal"></div></div>'
  },
  content:{
    evidence:'DIRECT COURSE QA · PACKAGE → LMS RECORD',title:'Confirm launch, resume, score, and completion.',
    summary:'A course package can open successfully while its progress or score fails to reach the LMS. I test the complete learner journey and compare the resulting transcript.',
    lesson:'I check the configured completion condition against the event the package actually sends, including a resumed session.',
    visual:'<div class="ix-flowboard ix-auto-content"><div class="ix-flow-step"><small>01 / COURSE PACKAGE</small><div class="ix-package-cube"><b>SCORM</b><span>Product readiness · v2.1</span></div><div class="ix-attribute"><span>Completion rule</span><b>Pass ≥ 80%</b></div></div><div class="ix-flow-step"><small>02 / LEARNER TEST</small><div class="ix-test-player"><strong>Course player</strong><div class="ix-player-track"><i></i></div><span>Launch → Resume → Score</span></div><div class="ix-event-pills"><span>LAUNCH</span><span>RESUME</span><span>86%</span></div></div><div class="ix-flow-step"><small>03 / LMS TRANSCRIPT</small><div class="ix-transcript-sheet"><b>Product readiness</b><span>Score 86%</span><strong>Complete ✓</strong></div><div class="ix-check-badge">Status rule confirmed ✓</div></div><div class="ix-flow-signal"></div></div>'
  },
  reporting:{
    evidence:'DIRECT WORK · FOUR EXPORTS → REVIEW WORKBOOK',title:'Reconcile the record before sending follow-up.',
    summary:'In certification reporting, I combined enrollment, completion, certificate, and audience exports into Complete and Incomplete review sheets. The join and exception rules stayed visible.',
    lesson:'A clean sheet is not proof of a correct result. I compare counts with source reports and preserve missing identifiers for review.',
    visual:'<div class="ix-flowboard ix-auto-reporting"><div class="ix-flow-step"><small>01 / LMS EXPORTS</small><div class="ix-file-stack"><span>Enrollment</span><span>Completion</span><span>Certificate</span><span>Audience</span></div></div><div class="ix-flow-step"><small>02 / RECONCILE</small><div class="ix-join-core"><b>LEARNER + COURSE ID</b><i></i><span>Status + date rules</span></div><div class="ix-review-queue">Unmatched records → review</div></div><div class="ix-flow-step"><small>03 / REPORT PACKET</small><div class="ix-report-sheets"><span>Complete</span><span>Incomplete</span><span>Exceptions</span></div><div class="ix-snapshot"><b>PERFORMANCE SNAPSHOT</b><i></i><i></i><i></i><i></i></div></div><div class="ix-flow-signal"></div></div>'
  }
};
const buttons=[...document.querySelectorAll('[data-integration]')];
const screen=document.getElementById('integrationScreen');
if(!screen||!buttons.length)return;
function render(key){
  const d=cases[key];if(!d)return;
  [['integrationEvidence',d.evidence],['integrationTitle',d.title],['integrationSummary',d.summary],['integrationLesson',d.lesson]].forEach(([id,value])=>document.getElementById(id).textContent=value);
  buttons.forEach(button=>{const on=button.dataset.integration===key;button.classList.toggle('active',on);button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;});
  screen.dataset.case=key;
  screen.innerHTML='<div class="integration-screen-top"><span>● ● ●</span><strong>DATA HANDOFF / '+key.toUpperCase()+'</strong><small>AUTOMATIC FLOW</small></div>'+d.visual;
}
buttons.forEach((button,index)=>{button.addEventListener('click',()=>render(button.dataset.integration));button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next].focus();render(buttons[next].dataset.integration);});});
render('business');
})();
