(() => {
  const arcData = {
    prepare:{title:'Prepare for the assigned module.',text:'Before delivery, I reviewed the facilitator and participant materials, identified the objective, marked transitions, and anticipated where the seller or partner audience might need a clearer example or more discussion.'},
    frame:{title:'Frame the objective before adding detail.',text:'I opened each section by making the purpose clear so the group understood what they should be able to recognize or do before we moved into the content.'},
    explain:{title:'Explain only enough to support the next decision.',text:'I kept explanations concise, connected the framework to seller language, and avoided using live time for background material the audience could absorb on its own.'},
    check:{title:'Use questions and polls as diagnostic signals.',text:'I asked before telling, compared interpretations, and used polling to decide whether the audience was ready to move on or needed another example.'},
    apply:{title:'Bring MEDDPICC into realistic seller situations.',text:'I invited relevant seller and partner examples and used them to distinguish stronger evidence, weaker evidence, and the reasoning behind the difference.'},
    reflect:{title:'Debrief and capture what the audience taught me.',text:'I closed the loop on the objective, captured recurring questions or friction, and carried those signals into future content, scenarios, checks, and facilitator guidance.'}
  };

  const moveData = {
    ask:{label:'Diagnose',title:'Ask before telling.',summary:'I used questions to hear the group’s current interpretation before adding more explanation.',do:'I used targeted prompts before giving the answer or definition.',why:'The response showed me whether the group needed clarification, a stronger example, or simply confirmation.',signal:'I listened for uncertainty, competing interpretations, or language that revealed a misconception.'},
    poll:{label:'Check',title:'Poll with a purpose.',summary:'I used polls when the result could change what I did next.',do:'I used quick confidence or interpretation checks at decision points.',why:'The distribution gave me a fast read on whether the concept was stable enough to advance.',signal:'Low confidence or a split response meant I needed more debrief time or a different explanation.'},
    examples:{label:'Apply',title:'Use seller examples.',summary:'I used relevant examples from experienced learners to make the framework concrete across internal and partner audiences.',do:'I invited useful customer or pursuit examples without exposing private account details.',why:'Peer examples connected the framework to real work and helped me reduce unnecessary background explanation.',signal:'Strong examples showed me where the group already had usable experience to build from.'},
    reframe:{label:'Adapt',title:'Reframe when the first explanation does not land.',summary:'I kept the learning objective fixed, but changed the explanation when the audience needed a different route.',do:'I changed the example, wording, sequence, or amount of detail while preserving the learning goal.',why:'The live session worked better when I responded to the audience instead of following the deck mechanically.',signal:'Repeated questions, silence, or confusion told me the current framing was not resolving the friction.'}
  };

  const signalData = {
    confidence:{suggests:'The concept or distinction was not stable yet.',response:'I slowed down, reframed the concept, and tested it again with a concrete seller example.'},
    repeated:{suggests:'The current explanation was not resolving the learner friction.',response:'I changed the explanation, analogy, or seller situation instead of repeating the same wording.'},
    examples:{suggests:'The group already had relevant experience I could build from.',response:'I used peer examples and compressed lower-value background so more time stayed available for application.'},
    time:{suggests:'The agenda now required a deliberate tradeoff.',response:'I protected application and debrief time and shortened lower-value narration instead of rushing the close.'}
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

  const navLinks=[...document.querySelectorAll('.case-nav a')];
  const navSections=navLinks.map((link)=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window){const observer=new IntersectionObserver((entries)=>{const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;navLinks.forEach((link)=>link.classList.toggle('active',link.getAttribute('href')===`#${visible.target.id}`));},{rootMargin:'-28% 0px -58% 0px',threshold:[0.1,.35,.6]});navSections.forEach((section)=>observer.observe(section));}
})();