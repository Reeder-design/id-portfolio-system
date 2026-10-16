(() => {
  const $ = s => document.querySelector(s);
  const tabs = [...document.querySelectorAll('[data-dev-system]')];
  const panels = [...document.querySelectorAll('[data-dev-panel]')];
  function select(tab) {
    walkthroughs.forEach(stop => stop());
    tabs.forEach(t => { const on=t===tab; t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1; });
    panels.forEach(p => {const on=p.dataset.devPanel===tab.dataset.devSystem;p.classList.toggle('is-active',on);p.setAttribute('aria-hidden',!on);p.inert=!on;});
  }
  function wireTabs(items, action) { items.forEach((tab,i)=>{tab.addEventListener('click',()=>action(tab));tab.addEventListener('keydown',e=>{let n=e.key==='ArrowRight'?(i+1)%items.length:e.key==='ArrowLeft'?(i+items.length-1)%items.length:e.key==='Home'?0:e.key==='End'?items.length-1:null;if(n!==null){e.preventDefault();items[n].focus();action(items[n]);}});}); }
  wireTabs(tabs, select);
  const featureTabs=[...document.querySelectorAll('[data-cbc-feature]')];
  wireTabs(featureTabs,button=>{
    featureTabs.forEach(tab=>{const active=tab===button;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
    document.querySelectorAll('[data-cbc-panel]').forEach(panel=>{const active=panel.dataset.cbcPanel===button.dataset.cbcFeature;panel.classList.toggle('is-active',active);panel.setAttribute('aria-hidden',String(!active));panel.inert=!active;});
  });
  const walkthroughs = [];
  panels.forEach(panel => {
    const steps = [...panel.querySelectorAll('[data-studio-step]')];
    const play = panel.querySelector('[data-studio-play]');
    let timer;
    const stop = () => { clearInterval(timer); timer = null; play.textContent = 'Play walkthrough'; play.setAttribute('aria-pressed', 'false'); };
    const show = index => {
      panel.dataset.stage = String(index);
      steps.forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
      panel.querySelectorAll('[data-studio-caption]').forEach((caption, n) => { caption.hidden = n !== index; });
      panel.querySelector('[data-studio-counter]').textContent = `0${index + 1} / 03`;
    };
    steps.forEach((button, index) => button.addEventListener('click', () => { stop(); show(index); }));
    play.addEventListener('click', () => {
      if (timer) { stop(); return; }
      show(0);
      play.textContent = 'Pause walkthrough'; play.setAttribute('aria-pressed', 'true');
      timer = setInterval(() => {
        const next = Number(panel.dataset.stage) + 1;
        if (next > 2) { stop(); return; }
        show(next);
      }, 4500);
    });
    walkthroughs.push(stop);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) walkthroughs.forEach(stop => stop()); });
  const heading=$('#dev-block-title'), state=$('#dev-editor-state');
  if (!heading) return;
  heading.addEventListener('input',()=>{$('#dev-preview-heading').textContent=heading.value||'Untitled block';state.textContent='Heading updated';});
  document.querySelectorAll('[data-dev-theme]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-dev-theme]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',t===b);});$('[data-dev-theme-preview]').dataset.devThemePreview=b.dataset.devTheme;state.textContent='Visual treatment updated';}));
  const resources={course:['Build understanding','Use a course when someone needs a connected explanation, practice, and a way to check understanding.','Match the format to the learning need.'],aid:['Support a task','Use a job aid when someone knows the task but needs a concise reference while doing it.','Keep the next action easy to find.'],practice:['Develop judgment','Use practice when someone needs to make a decision, see its consequence, and try again.','Feedback explains why the choice matters.']};
  const originalResources=JSON.parse(JSON.stringify(resources));
  const rt=[...document.querySelectorAll('[data-resource]')];
  const selectResource=b=>{rt.forEach(t=>{t.setAttribute('aria-selected',t===b);t.tabIndex=t===b?0:-1;});const r=resources[b.dataset.resource];['title','copy','feedback'].forEach((k,i)=>$('#dev-resource-'+k).textContent=r[i]);$('#dev-resource-panel').setAttribute('aria-labelledby',b.id);};wireTabs(rt,selectResource);
  const editTab=$('#dev-edit-tab'), copy=$('#dev-panel-copy'), feedback=$('#dev-feedback-copy');
  const loadFields=()=>{copy.value=resources[editTab.value][1];feedback.value=resources[editTab.value][2];selectResource(rt.find(tab=>tab.dataset.resource===editTab.value));};
  editTab.addEventListener('change',loadFields);
  const updateContent=()=>{resources[editTab.value][1]=copy.value;resources[editTab.value][2]=feedback.value;selectResource(rt.find(tab=>tab.dataset.resource===editTab.value));state.textContent='Content and learner preview updated';};
  copy.addEventListener('input',updateContent);feedback.addEventListener('input',updateContent);
  const showFeedback=$('#dev-show-feedback');
  showFeedback.addEventListener('change',()=>{$('.dev-learner-feedback').classList.toggle('is-layer-hidden',!showFeedback.checked);state.textContent=showFeedback.checked?'Feedback layer visible':'Feedback layer hidden';});
  const viewportButtons=[...document.querySelectorAll('[data-dev-viewport]')];
  const setViewport=button=>{viewportButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('.dev-editor-canvas').dataset.viewport=button.dataset.devViewport;state.textContent=button.dataset.devViewport==='phone'?'Phone preview selected':'Desktop preview selected';};
  viewportButtons.forEach(button=>button.addEventListener('click',()=>setViewport(button)));
  $('#dev-reset').addEventListener('click',()=>{
    Object.keys(resources).forEach(key=>resources[key]=[...originalResources[key]]);
    heading.value='Choose the right resource';heading.dispatchEvent(new Event('input'));
    $('[data-dev-theme="mint"]').click();editTab.value='course';loadFields();
    showFeedback.checked=true;$('.dev-learner-feedback').classList.remove('is-layer-hidden');
    setViewport(viewportButtons[0]);state.textContent='Ready to edit';
  });
})();
