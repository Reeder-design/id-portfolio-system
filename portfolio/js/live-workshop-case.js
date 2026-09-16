(() => {
  const arcData = {
    prepare:{title:'Prepare for the assigned module.',text:'Review the facilitator and participant materials, identify the objective, mark transitions, and anticipate where experienced sellers may need more discussion or a clearer example.'},
    frame:{title:'Frame the objective before adding detail.',text:'Open with what the learner should be able to recognize or do so the discussion has a clear purpose instead of feeling like a walk through slides.'},
    explain:{title:'Explain only enough to support the next decision.',text:'Keep the concept concise, connect it to seller language, and avoid turning live time into background narration that learners could read on their own.'},
    check:{title:'Use questions and polls as diagnostic signals.',text:'Ask before telling, compare interpretations, and use quick polling to see whether the group is ready to move on or needs another example.'},
    apply:{title:'Bring the framework into realistic seller situations.',text:'Invite relevant seller examples and use them to distinguish stronger evidence, weaker evidence, and the reasoning behind the difference.'},
    reflect:{title:'Debrief and capture what the room taught me.',text:'Close the loop on the objective, capture recurring questions or friction, and carry those signals into future content, scenarios, checks, or facilitator guidance.'}
  };

  const moveData = {
    ask:{label:'Diagnose',title:'Ask before telling.',summary:'Questions reveal the learner’s current interpretation before I add more explanation.',do:'Use targeted prompts before giving the answer or definition.',why:'The response shows whether the group needs clarification, a stronger example, or simply confirmation.',signal:'Listen for uncertainty, competing interpretations, or language that reveals a misconception.'},
    poll:{label:'Check',title:'Poll with a purpose.',summary:'A poll is useful when the result changes what I do next.',do:'Use quick confidence or interpretation checks at decision points.',why:'The distribution gives me a fast read on whether the concept is stable enough to advance.',signal:'Low confidence or a split response means the debrief needs more time or a different explanation.'},
    examples:{label:'Apply',title:'Use seller examples.',summary:'Experienced learners bring useful context that can make an abstract framework concrete.',do:'Invite relevant customer or pursuit examples without exposing private account details.',why:'Peer examples connect the concept to actual work and can reduce unnecessary background explanation.',signal:'Strong examples show where the group already has usable experience to build from.'},
    reframe:{label:'Adapt',title:'Reframe when the first explanation does not land.',summary:'The objective stays fixed; the explanation does not have to.',do:'Change the example, wording, sequence, or amount of detail while preserving the learning goal.',why:'Live facilitation should respond to the room rather than follow the deck mechanically.',signal:'Repeated questions, silence, or confusion indicate the current framing is not resolving the friction.'}
  };

  const signalData = {
    confidence:{suggests:'The concept or distinction is not stable yet.',response:'Slow down, reframe the concept, and test it again with a concrete seller example.'},
    repeated:{suggests:'The current explanation is not resolving the learner friction.',response:'Use a different explanation, analogy, or seller situation instead of repeating the same wording.'},
    examples:{suggests:'The group already has relevant experience to build from.',response:'Use peer examples and compress lower-value background so more time stays available for application.'},
    time:{suggests:'The agenda now requires a deliberate tradeoff.',response:'Protect application and debrief time; shorten lower-value narration rather than rushing the close.'}
  };

  const evidenceData = {
    supported:[
      ['Live delivery','Facilitated assigned modules in a multi-session virtual sales workshop for experienced sellers.'],
      ['Responsive facilitation','Used discussion, polling, seller examples, and real-time pacing or explanation adjustments.'],
      ['Design feedback','Captured recurring learner questions and friction as input for future content and facilitator support.']
    ],
    boundaries:[
      ['Performance metrics','No learner-score improvement or sales-performance lift is claimed without approved evidence.'],
      ['Business impact','No revenue impact is attributed to the workshop without supported measurement.'],
      ['Satisfaction','No workshop satisfaction score or testimonial is invented or generalized from private feedback.']
    ]
  };

  const setupTabs = (selector, dataKey, render) => {
    const buttons=[...document.querySelectorAll(selector)];
    buttons.forEach((button,index)=>{
      const activate=()=>{
        buttons.forEach((item)=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});
        render(button.dataset[dataKey]);
      };
      button.addEventListener('click',activate);
      button.addEventListener('keydown',(event)=>{
        if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next=index;
        if(event.key==='Home') next=0;
        else if(event.key==='End') next=buttons.length-1;
        else if(event.key==='ArrowRight'||event.key==='ArrowDown') next=(index+1)%buttons.length;
        else next=(index-1+buttons.length)%buttons.length;
        buttons[next].focus();buttons[next].click();
      });
    });
  };

  setupTabs('[data-arc]','arc',(key)=>{const d=arcData[key];document.getElementById('arcTitle').textContent=d.title;document.getElementById('arcText').textContent=d.text;});
  setupTabs('[data-move]','move',(key)=>{const d=moveData[key];document.getElementById('moveLabel').textContent=d.label;document.getElementById('moveTitle').textContent=d.title;document.getElementById('moveSummary').textContent=d.summary;document.getElementById('moveDo').textContent=d.do;document.getElementById('moveWhy').textContent=d.why;document.getElementById('moveSignal').textContent=d.signal;});
  setupTabs('[data-signal]','signal',(key)=>{const d=signalData[key];document.getElementById('signalSuggests').textContent=d.suggests;document.getElementById('signalResponse').textContent=d.response;});
  setupTabs('[data-evidence]','evidence',(key)=>{document.getElementById('evidencePanel').innerHTML=evidenceData[key].map(([title,body])=>`<article class="evidence-card"><strong>${title}</strong><p>${body}</p></article>`).join('');});

  const navLinks=[...document.querySelectorAll('.case-nav a')];
  const navSections=navLinks.map((link)=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window){const observer=new IntersectionObserver((entries)=>{const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;navLinks.forEach((link)=>link.classList.toggle('active',link.getAttribute('href')===`#${visible.target.id}`));},{rootMargin:'-28% 0px -58% 0px',threshold:[0.1,.35,.6]});navSections.forEach((section)=>observer.observe(section));}
})();
