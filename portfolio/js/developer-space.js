(() => {
  const $ = s => document.querySelector(s);
  const tabs = [...document.querySelectorAll('[data-dev-system]')];
  const panels = [...document.querySelectorAll('[data-dev-panel]')];
  function select(tab) {
    tabs.forEach(t => { const on=t===tab; t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1; });
    panels.forEach(p => {const on=p.dataset.devPanel===tab.dataset.devSystem;p.classList.toggle('is-active',on);p.setAttribute('aria-hidden',!on);p.inert=!on;});
  }
  function wireTabs(items, action) { items.forEach((tab,i)=>{tab.addEventListener('click',()=>action(tab));tab.addEventListener('keydown',e=>{let n=e.key==='ArrowRight'?(i+1)%items.length:e.key==='ArrowLeft'?(i+items.length-1)%items.length:e.key==='Home'?0:e.key==='End'?items.length-1:null;if(n!==null){e.preventDefault();items[n].focus();action(items[n]);}});}); }
  wireTabs(tabs, select);
  const formats={interaction:['Practice a decision','A focused task, a learner response, and feedback that explains the consequence.','Prompt','Choice','Feedback'],template:['Start with a structure','Reusable structure keeps the author focused on the content and the learner task.','Structure','Content','Adapt'],aid:['Support the next step','A concise reference helps someone complete a task at the point of need.','Find','Check','Act']};
  $('#dev-format').addEventListener('change',e=>{const v=formats[e.target.value];['title','copy','a','b','c'].forEach((k,i)=>$('#dev-format-'+k).textContent=v[i]);});
  const heading=$('#dev-block-title'), state=$('#dev-editor-state');
  heading.addEventListener('input',()=>{$('#dev-preview-heading').textContent=heading.value||'Untitled block';state.textContent='Heading updated';});
  document.querySelectorAll('[data-dev-theme]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-dev-theme]').forEach(t=>{t.classList.toggle('active',t===b);t.setAttribute('aria-pressed',t===b);});$('[data-dev-theme-preview]').dataset.devThemePreview=b.dataset.devTheme;state.textContent='Visual treatment updated';}));
  const resources={course:['Build understanding','Use a course when someone needs a connected explanation, practice, and a way to check understanding.','Match the format to the learning need.'],aid:['Support a task','Use a job aid when someone knows the task but needs a concise reference while doing it.','Keep the next action easy to find.'],practice:['Develop judgment','Use practice when someone needs to make a decision, see its consequence, and try again.','Feedback explains why the choice matters.']};
  const rt=[...document.querySelectorAll('[data-resource]')];
  const selectResource=b=>{rt.forEach(t=>{t.setAttribute('aria-selected',t===b);t.tabIndex=t===b?0:-1;});const r=resources[b.dataset.resource];['title','copy','feedback'].forEach((k,i)=>$('#dev-resource-'+k).textContent=r[i]);$('#dev-resource-panel').setAttribute('aria-labelledby',b.id);};wireTabs(rt,selectResource);
  $('#dev-reset').addEventListener('click',()=>{heading.value='Choose the right resource';heading.dispatchEvent(new Event('input'));$('[data-dev-theme="mint"]').click();selectResource(rt[0]);state.textContent='Ready to edit';});
})();
