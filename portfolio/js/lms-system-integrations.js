(() => {
'use strict';
const cases={
  business:{
    evidence:'DIRECT MATCHING WORK · SALESFORCE → ABSORB',title:'Verify the account before placing the learner.',
    summary:'In my Salesforce-to-Absorb review workflow, an email could locate a person while the related account determined the correct partner audience. Ambiguous account matches stayed in a review queue.',
    lesson:'A matching email is only the starting point. I check account and region together before recommending an LMS placement.',
    instruction:'Select the CRM record to inspect the placement rule.',
    result:'Morgan Lee · Partner / West → Partner certification route. Missing or conflicting account data remains in review.',
    visual:'<div class="ix-stage ix-business"><div class="ix-source"><span>SALESFORCE / ACCOUNT</span><button type="button" data-inspect><b>ML</b><strong>Morgan Lee</strong><small>Partner · West</small><em>Inspect record ↗</em></button></div><div class="ix-conduit"><i></i><span>email + account + region</span></div><div class="ix-target"><span>ABSORB / AUDIENCE</span><strong>Partner path</strong><small>Certification + resources</small><b>Pending verification</b></div></div>'
  },
  identity:{
    evidence:'PLATFORM-INFORMED PATTERN · IDENTITY → LEARNER VIEW',title:'Test more than a successful sign-in.',
    summary:'A login can pass while the resolved group or catalog is wrong. I use a test learner for each audience and verify the route that appears after provisioning.',
    lesson:'The stable ID, group membership, and visible catalog should be checked together after an account or role change.',
    instruction:'Select the test learner to reveal their access.',
    result:'Test learner · Partner / West → sign-in passed, partner group resolved, West catalog visible. Customer-only content remains hidden.',
    visual:'<div class="ix-stage ix-identity"><div class="ix-id-card"><span>IDENTITY PROVIDER</span><strong>UID 2048</strong><small>SSO passed</small></div><div class="ix-conduit"><i></i><span>stable ID + group</span></div><button type="button" class="ix-user-card" data-inspect><span>LEARNER TEST</span><strong>Partner · West</strong><small>Inspect visible learning ↗</small></button><div class="ix-access-circles"><i></i><i></i><i></i></div></div>'
  },
  content:{
    evidence:'DIRECT COURSE QA · PACKAGE → LMS RECORD',title:'Confirm launch, resume, score, and completion.',
    summary:'A course package can open successfully while its progress or score fails to reach the LMS. I test the complete learner journey and compare the resulting transcript.',
    lesson:'I check the configured completion condition against the event the package actually sends, including a resumed session.',
    instruction:'Launch the sample course and inspect the recorded events.',
    result:'Launch → resume → score 86% → complete. The transcript status changes only after the required completion event is received.',
    visual:'<div class="ix-stage ix-content"><div class="ix-course"><span>COURSE PLAYER / v2.1</span><strong>Product readiness</strong><div class="ix-progress"><i></i></div><button type="button" data-inspect>▶ Launch test</button></div><div class="ix-event-stream"><span>EVENT STREAM</span><i>launch</i><i>resume</i><i>score</i><i>complete</i></div><div class="ix-transcript"><span>LMS TRANSCRIPT</span><strong>Awaiting event</strong></div></div>'
  },
  reporting:{
    evidence:'DIRECT WORK · FOUR EXPORTS → REVIEW WORKBOOK',title:'Reconcile the record before sending follow-up.',
    summary:'In certification reporting, I combined enrollment, completion, certificate, and audience exports into Complete and Incomplete review sheets. The join and exception rules stayed visible.',
    lesson:'A clean sheet is not proof of a correct result. I compare counts with source reports and preserve missing identifiers for review.',
    instruction:'Select the export set to inspect the reconciliation.',
    result:'Four files joined by learner and course ID → Complete / Incomplete views. Unmatched identifiers are held in an exception list.',
    visual:'<div class="ix-stage ix-reporting"><button type="button" class="ix-export-stack" data-inspect><span>ENROLLMENT</span><span>COMPLETION</span><span>CERTIFICATE</span><span>AUDIENCE</span><b>Inspect exports ↗</b></button><div class="ix-reconcile"><span>ID + COURSE</span><i></i><strong>RECONCILE</strong></div><div class="ix-workbook"><span>REVIEW WORKBOOK</span><strong>Complete</strong><strong>Incomplete</strong><small>Exceptions retained</small></div></div>'
  }
};
const buttons=[...document.querySelectorAll('[data-integration]')];
const screen=document.getElementById('integrationScreen');
if(!screen||!buttons.length)return;
function render(key,open=false){
  const d=cases[key];if(!d)return;
  [['integrationEvidence',d.evidence],['integrationTitle',d.title],['integrationSummary',d.summary],['integrationLesson',d.lesson]].forEach(([id,value])=>document.getElementById(id).textContent=value);
  buttons.forEach(button=>{const on=button.dataset.integration===key;button.classList.toggle('active',on);button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;});
  screen.dataset.case=key;
  screen.innerHTML='<div class="integration-screen-top"><span>● ● ●</span><strong>DATA HANDOFF / '+key.toUpperCase()+'</strong><small>ILLUSTRATIVE</small></div><div class="integration-prompt">'+d.instruction+'</div>'+d.visual+'<div class="ix-inspector" '+(open?'':'hidden')+' role="status"><span>ADMIN CHECK</span><p>'+d.result+'</p><button type="button" data-close aria-label="Close admin check">×</button></div>';
  if(open){screen.classList.add('inspected');}else screen.classList.remove('inspected');
}
screen.addEventListener('click',event=>{if(event.target.closest('[data-inspect]'))render(screen.dataset.case,true);if(event.target.closest('[data-close]'))render(screen.dataset.case,false);});
buttons.forEach((button,index)=>{button.addEventListener('click',()=>render(button.dataset.integration));button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[next].focus();render(buttons[next].dataset.integration);});});
render('business');
})();
