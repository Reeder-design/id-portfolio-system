(function(){
  'use strict';
  const heroData={
    admin:{label:'Admin + Setup',title:'Build the structure behind the learning.',text:'Configure content, learning plans, access, certifications, ownership, and reporting so the system is ready for learners.'},
    delivery:{label:'Learning Delivery',title:'Make the intended path work in the platform.',text:'Publish and test courses, prerequisites, completion rules, assessments, and learning-plan relationships in the LMS.'},
    support:{label:'Support + UX',title:'Use learner friction to improve the system.',text:'Troubleshoot access and navigation, document repeatable responses, and use support patterns to find operational gaps.'}
  };
  const heroButtons=Array.from(document.querySelectorAll('[data-lms-lens]'));
  const heroStage=document.querySelector('.lms-motion-stage');
  function renderHero(key){
    const data=heroData[key]; if(!data){return;}
    heroButtons.forEach((button)=>{const selected=button.dataset.lmsLens===key;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    heroStage.dataset.activeLens=key;
    document.getElementById('lmsHeroLabel').textContent=data.label;
    document.getElementById('lmsHeroTitle').textContent=data.title;
    document.getElementById('lmsHeroText').textContent=data.text;
  }
  heroButtons.forEach((button)=>button.addEventListener('click',()=>renderHero(button.dataset.lmsLens)));

  const operationData={
    content:{label:'Content + Learning Plans',title:'Keep the catalog organized and the path intentional.',text:'I configure courses, catalogs, prerequisites, learning plans, ownership, assignments, and publishing patterns so learners see a clear route instead of a content dump.',output:'The right content appears in the right sequence for the right audience.',image:'../../assets/project-images/lms-topics/content-learning-plans.webp',alt:'Representative LMS view for organizing content and learning plans.',caption:'Content structure and learning-plan relationships'},
    access:{label:'Certifications + Access',title:'Connect audience rules to completion requirements.',text:'I manage enrollment logic, groups, certification paths, renewals, completion behavior, and exceptions across employee, partner, and customer audiences.',output:'Access, requirements, renewal dates, and credentials behave as intended.',image:'../../assets/project-images/lms-topics/certifications-access.webp',alt:'Representative LMS view for certifications and learner access.',caption:'Certification status, audience access, and renewal logic'},
    support:{label:'Learner Support',title:'Turn learner questions into operational evidence.',text:'I troubleshoot access and navigation issues, respond through the learner inbox, maintain reusable guidance, and track repeated friction that needs a system or content fix.',output:'The immediate issue is resolved and the recurring pattern is documented.',image:'../../assets/project-images/lms-topics/learner-support.webp',alt:'Representative learner support workspace with requests and guidance.',caption:'Support requests, response patterns, and learner guidance'},
    migration:{label:'Migration + UAT',title:'Validate what learners can actually see and do.',text:'I help map structures into a new LMS, test learner routes by audience, document failures, retest fixes, and keep evidence beside the expected behavior.',output:'Configuration passes the learner route, not only the admin check.',image:'../../assets/project-images/lms-topics/migration-uat.webp',alt:'Representative migration and user acceptance testing workspace.',caption:'Migration mapping, route validation, and retesting'},
    docs:{label:'Documentation + Process',title:'Make the operating model usable by the next person.',text:'I maintain admin guidance, support workflows, handoff documentation, change records, and repeatable steps for work that cannot live in one person’s memory.',output:'Ownership, decisions, exceptions, and next steps are easy to recover.',image:'../../assets/project-images/lms-topics/documentation-process.webp',alt:'Representative LMS documentation and process workspace.',caption:'Admin documentation, process steps, and ownership'},
    reporting:{label:'Reporting + Follow-Up',title:'Use platform data to find the next action.',text:'I review completion, certifications, exceptions, support trends, and launch results, then turn the findings into a clear follow-up list.',output:'The report explains what needs attention, not just what happened.',image:'../../assets/project-images/lms-topics/reporting-follow-up.webp',alt:'Representative LMS reporting and follow-up workspace.',caption:'Progress, exceptions, and follow-up actions'}
  };
  const operationButtons=Array.from(document.querySelectorAll('[data-lms-operation]'));
  function renderOperation(key){
    const data=operationData[key]; if(!data){return;}
    operationButtons.forEach((button)=>{const selected=button.dataset.lmsOperation===key;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    document.getElementById('lmsOperationLabel').textContent=data.label;
    document.getElementById('lmsOperationTitle').textContent=data.title;
    document.getElementById('lmsOperationText').textContent=data.text;
    document.getElementById('lmsOperationOutput').textContent=data.output;
    const image=document.getElementById('lmsOperationImage');image.src=data.image;image.alt=data.alt;
  }
  operationButtons.forEach((button)=>button.addEventListener('click',()=>renderOperation(button.dataset.lmsOperation)));

  const journeyData={
    find:{label:'Find',title:'Make the right learning easy to discover.',text:'Catalog structure, audience rules, search, naming, and permissions all shape whether the learner can find the intended experience.',system:'Visibility and search return the correct learning.',signal:'Fewer wrong-course launches and link requests.',image:'../../assets/project-images/lms-landing/lms-learner-home.webp',alt:'Representative learner home with assigned learning and search access.',caption:'Discovery starts from the learner’s actual home view.'},
    enroll:{label:'Enroll',title:'Put the learner in the correct path.',text:'Groups, assignments, prerequisites, certification rules, and exceptions have to work together without adding manual friction.',system:'Enrollment rules match audience and pathway logic.',signal:'Fewer access requests, duplicates, and prerequisite errors.',image:'../../assets/project-images/lms-landing/lms-user-management.webp',alt:'Representative LMS user management view with audience and enrollment controls.',caption:'Audience and enrollment rules determine who enters the path.'},
    launch:{label:'Launch',title:'Confirm that entry into the content works.',text:'Package compatibility, links, tracking, instructions, browser behavior, and the first learner action all matter at launch.',system:'The course opens, tracks, and behaves across supported contexts.',signal:'Fewer launch errors, quick exits, and device-specific issues.',image:'../../assets/project-images/lms-landing/lms-course-player.webp',alt:'Representative LMS course player with active learning content.',caption:'The launch check covers the course and its LMS context.'},
    complete:{label:'Complete',title:'Record meaningful completion reliably.',text:'Scores, credits, completion rules, certificates, and status updates should reflect the learning requirement instead of creating manual cleanup.',system:'Completion and credentials update in the expected places.',signal:'Consistent status, score, and certificate records.',image:'../../assets/project-images/lms-landing/lms-admin-dashboard.webp',alt:'Representative LMS administration dashboard showing completion status.',caption:'Completion evidence must be visible to learners and administrators.'},
    continue:{label:'Continue',title:'Support the work after completion.',text:'Transcripts, renewals, reinforcement, communities, reporting, and follow-up resources keep the learning connected to the work.',system:'The next requirement or resource is easy to locate.',signal:'Less repeat confusion and clearer follow-up behavior.',image:'../../assets/project-images/lms-landing/lms-community-transcript.webp',alt:'Representative LMS community and transcript view after completion.',caption:'The learner path continues into transcript, support, and renewal.'}
  };
  const journeyButtons=Array.from(document.querySelectorAll('[data-lms-journey]'));
  function renderJourney(key){
    const data=journeyData[key]; if(!data){return;}
    const activeIndex=journeyButtons.findIndex((button)=>button.dataset.lmsJourney===key);
    journeyButtons.forEach((button,index)=>{const selected=index===activeIndex;button.classList.toggle('active',selected);button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    document.getElementById('lmsJourneyProgress').style.width=`${activeIndex*25}%`;
    document.getElementById('lmsJourneyLabel').textContent=data.label;
    document.getElementById('lmsJourneyTitle').textContent=data.title;
    document.getElementById('lmsJourneyText').textContent=data.text;
    document.getElementById('lmsJourneySystem').textContent=data.system;
    document.getElementById('lmsJourneySignal').textContent=data.signal;
    const image=document.getElementById('lmsJourneyImage');image.src=data.image;image.alt=data.alt;
    document.getElementById('lmsJourneyCaption').textContent=data.caption;
  }
  journeyButtons.forEach((button)=>button.addEventListener('click',()=>renderJourney(button.dataset.lmsJourney)));
})();
