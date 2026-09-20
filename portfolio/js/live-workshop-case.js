(() => {
 const base='../../../../assets/icons/pixel/';
 const controls={
  frame:{label:'Frame',title:'Connect the objective to the seller task.',summary:'I opened the module by making the expected behavior and relevance clear before adding framework detail.',action:'Framed the objective in seller language, connected it to a realistic customer conversation, and set expectations for participation.',signal:'Learners could explain why the concept mattered and what they would need to do with it.',motion:[['portfolio-general/learning.webp','Objective'],['hiring-guide/team.webp','Audience'],['hiring-guide/chat-bubbles.webp','Frame']]},
  check:{label:'Check Understanding',title:'Use formative checks to see whether the concept is ready for application.',summary:'I used targeted questions, polls, and learner examples as formative assessment rather than waiting until the end of the module to discover confusion.',action:'Asked before telling, used quick confidence or interpretation checks, and listened for the reasoning behind the response.',signal:'Split answers, hesitation, repeated questions, or weak examples showed where the concept needed reinforcement.',motion:[['hiring-guide/chat-bubbles.webp','Prompt'],['hiring-guide/analytics-growth.webp','Response'],['hiring-guide/reference-search.webp','Check']]},
  adjust:{label:'Adapt Delivery',title:'Adjust the facilitation while keeping the learning objective fixed.',summary:'When the room needed a different route, I changed the example, pacing, sequence, or amount of explanation instead of simply repeating the same content.',action:'Reframed the concept, pulled in another seller example, changed pacing, or reduced lower-value narration.',signal:'A second check showed whether the adjustment improved understanding enough to continue.',motion:[['hiring-guide/idea-bulb.webp','Reframe'],['hiring-guide/chat-bubbles.webp','Example'],['hiring-guide/analytics-growth.webp','Recheck']]},
  apply:{label:'Apply + Debrief',title:'Use the concept, then debrief the reasoning.',summary:'I protected application and debrief time so learners finished by using the framework in context and explaining the reasoning behind the decision.',action:'Worked through a realistic seller situation, compared responses, debriefed the evidence, and captured recurring friction for future content updates.',signal:'Learners could transfer the framework into a realistic decision and explain why one response was stronger than another.',motion:[['microlearning-performance-support/real-world-application.webp','Apply'],['hiring-guide/chat-bubbles.webp','Debrief'],['hiring-guide/workflow-tree.webp','Improve']]}
 };
 const signals={
  confidence:{
    suggests:'The distinction was not stable yet.',
    response:'I slowed down, changed the example, and checked the distinction again before moving on.',
    motion:[['hiring-guide/analytics-growth.webp','Poll'],['hiring-guide/reference-search.webp','Interpret'],['hiring-guide/idea-bulb.webp','Reframe']],
    toldMotion:[['hiring-guide/analytics-growth.webp','Split'],['hiring-guide/reference-search.webp','Compare'],['hiring-guide/workflow-tree.webp','Gap']],
    adaptMotion:[['hiring-guide/idea-bulb.webp','Reframe'],['hiring-guide/chat-bubbles.webp','Example'],['hiring-guide/analytics-growth.webp','Recheck']]
  },
  repeated:{
    suggests:'The current framing was not resolving the learner friction.',
    response:'I changed the explanation or analogy rather than repeating the same wording.',
    motion:[['hiring-guide/chat-bubbles.webp','Question'],['hiring-guide/reference-search.webp','Pattern'],['hiring-guide/idea-bulb.webp','New route']],
    toldMotion:[['hiring-guide/chat-bubbles.webp','Repeat'],['hiring-guide/reference-search.webp','Pattern'],['hiring-guide/workflow-tree.webp','Friction']],
    adaptMotion:[['hiring-guide/idea-bulb.webp','New frame'],['hiring-guide/chat-bubbles.webp','Analogy'],['hiring-guide/analytics-growth.webp','Check']]
  },
  examples:{
    suggests:'The room already had useful experience to build from.',
    response:'I used the strongest learner example and reduced lower-value narration so more time stayed available for application.',
    motion:[['hiring-guide/team.webp','Experience'],['hiring-guide/chat-bubbles.webp','Example'],['microlearning-performance-support/real-world-application.webp','Apply']],
    toldMotion:[['hiring-guide/team.webp','Experience'],['hiring-guide/chat-bubbles.webp','Relevant'],['hiring-guide/idea-bulb.webp','Leverage']],
    adaptMotion:[['hiring-guide/team.webp','Invite'],['hiring-guide/chat-bubbles.webp','Connect'],['microlearning-performance-support/real-world-application.webp','Apply']]
  },
  time:{
    suggests:'The agenda needed a deliberate tradeoff.',
    response:'I shortened lower-value narration and protected practice and debrief time.',
    motion:[['hiring-guide/calendar.webp','Time'],['hiring-guide/workflow-tree.webp','Prioritize'],['microlearning-performance-support/real-world-application.webp','Practice']],
    toldMotion:[['hiring-guide/calendar.webp','Clock'],['hiring-guide/reference-search.webp','Tradeoff'],['hiring-guide/workflow-tree.webp','Priority']],
    adaptMotion:[['hiring-guide/workflow-tree.webp','Trim'],['microlearning-performance-support/real-world-application.webp','Practice'],['hiring-guide/chat-bubbles.webp','Debrief']]
  }
 };
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
 const motion=(prefix,data)=>data.forEach(([file,label],i)=>{const s=['A','B','C'][i],img=document.getElementById(prefix+'Icon'+s),t=document.getElementById(prefix+'Label'+s);if(img)img.src=base+file;if(t)t.textContent=label;});
 const keyboard=(buttons,activate)=>buttons.forEach((b,i)=>b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();let n=i;if(e.key==='Home')n=0;else if(e.key==='End')n=buttons.length-1;else if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%buttons.length;else n=(i-1+buttons.length)%buttons.length;buttons[n].focus();activate(buttons[n]);}));
 const cb=[...document.querySelectorAll('[data-control-key]')],activateControl=b=>{const d=controls[b.dataset.controlKey];cb.forEach(x=>{const a=x===b;x.classList.toggle('active',a);x.setAttribute('aria-selected',String(a));x.tabIndex=a?0:-1;});set('controlLabel',d.label);set('controlTitle',d.title);set('controlSummary',d.summary);set('controlAction',d.action);set('controlSignal',d.signal);motion('controlMotion',d.motion);};cb.forEach(b=>b.addEventListener('click',()=>activateControl(b)));keyboard(cb,activateControl);
 const sb=[...document.querySelectorAll('[data-signal]')],activateSignal=b=>{const d=signals[b.dataset.signal];sb.forEach(x=>{const a=x===b;x.classList.toggle('active',a);x.setAttribute('aria-selected',String(a));x.tabIndex=a?0:-1;});set('signalSuggests',d.suggests);set('signalResponse',d.response);motion('signal',d.motion);motion('signalTold',d.toldMotion);motion('signalAdapt',d.adaptMotion);};sb.forEach(b=>b.addEventListener('click',()=>activateSignal(b)));keyboard(sb,activateSignal);
})();