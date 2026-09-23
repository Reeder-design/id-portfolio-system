(() => {
  const pixelRoot = '../../../../assets/icons/pixel/workflows/';
  const asset = (path) => `<span class="launch-screen-asset" aria-hidden="true"><img src="${pixelRoot}${path}.webp" alt=""></span>`;
  const stages = {
    promise: {
      label: '01 · Product promise', title: 'Explain what the offer does.',
      text: 'I opened with a concise product explanation sellers could use before diving into feature detail.',
      facts: [['Seller need','Describe the offer in plain language.'],['Design decision','Start with the job it helps with.'],['Development','Use a scannable Rise-style opening.']],
      screen: `<span class="launch-screen-kicker">01 / MEET THE OFFER</span><div class="launch-screen-feature">${asset('learning-enablement/enablement')}<span>New product · seller introduction</span></div><h3>Meet DraftPath.</h3><p class="launch-screen-lead">A faster first draft for thoughtful customer follow-up.</p><div class="launch-screen-flow"><span>${asset('content-creation/content')}<b>Meeting notes</b></span><i>→</i><span>${asset('content-creation/authoring')}<b>Draft message</b></span><i>→</i><span>${asset('people-collaboration/feedback')}<b>Seller review</b></span></div><p>DraftPath helps shape a follow-up from notes and highlights what the seller still needs to verify. The seller edits and approves the final message.</p><div class="launch-screen-callout"><strong>The simple promise</strong><span>Spend less time starting from a blank page and more time making the message relevant.</span></div>`
    },
    value: {
      label: '02 · Customer value', title: 'Connect capability to a useful outcome.',
      text: 'I translated product detail into a seller-ready value story that begins with the customer workflow.',
      facts: [['Seller need','Say why this matters to the buyer.'],['Design decision','Pair capability with the actual work.'],['Development','Reveal detail only as it serves the message.']],
      screen: `<span class="launch-screen-kicker">02 / SEE THE VALUE</span><h3>Make the next step easier.</h3><p class="launch-screen-lead">The customer need is a timely, accurate follow-up after a conversation.</p><div class="launch-screen-value-grid"><article>${asset('planning-projects/tasks')}<span>Without support</span><strong>Notes wait.</strong><p>Someone reconstructs context and starts the message from scratch.</p></article><article>${asset('content-creation/authoring')}<span>With DraftPath</span><strong>A reviewed start.</strong><p>A first draft organizes the key points for seller review.</p></article></div><div class="launch-screen-callout"><strong>What to say</strong><span>“Your team can begin with a structured draft, then check the details and add the judgment only your seller can provide.”</span></div>`
    },
    fit: {
      label: '03 · Product fit', title: 'Show where the offer fits and where it does not.',
      text: 'The information stays bounded so sellers can position the product accurately without overstating its capabilities.',
      facts: [['Seller need','Recognize a plausible use case.'],['Design decision','Make the product boundary explicit.'],['Development','Put fit signals next to non-fit signals.']],
      screen: `<span class="launch-screen-kicker">03 / KNOW THE FIT</span><h3>Lead with the right use case.</h3><div class="launch-screen-fit"><article>${asset('learning-enablement/enablement')}<div><strong>Good fit</strong><p>Draft a customer follow-up from meeting notes for a seller to review.</p></div></article><article>${asset('support-resources/guidance')}<div><strong>Different tool</strong><p>Specialized data analysis or calendar automation needs purpose-built systems.</p></div></article></div><p>The offer supports a bounded writing workflow. It does not replace a seller's judgment, analytics tools, or scheduling systems.</p>`
    },
    handoff: {
      label: '04 · Work-ready handoff', title: 'Close with a clear next conversation.',
      text: 'The lesson ends with a usable positioning line and a route to the approved resource, rather than another recall question.',
      facts: [['Seller need','Carry the message into a conversation.'],['Design decision','End with a usable takeaway.'],['Development','Keep changing details in a maintained resource.']],
      screen: `<span class="launch-screen-kicker">04 / TAKE IT TO WORK</span><h3>A message you can use.</h3><div class="launch-screen-quote">${asset('people-collaboration/communication')}“DraftPath helps your team turn meeting notes into a first follow-up draft that a seller can review, personalize, and approve.”</div><div class="launch-screen-checklist"><strong>Before the next customer conversation</strong><span>✓ Confirm the current approved positioning.</span><span>✓ Ask how the team handles follow-up today.</span><span>✓ Keep seller review visible in the story.</span></div><p class="launch-screen-end">You have completed the product introduction.</p>`
    }
  };
  const keys = Object.keys(stages);
  const tabs = [...document.querySelectorAll('[data-launch-stage]')];
  const el = id => document.getElementById(id);
  const screen = el('launchLearningContent');
  if (!screen) return;
  let activeIndex = 0;
  const render = key => {
    const item = stages[key], index = keys.indexOf(key);
    if (!item || index < 0) return;
    activeIndex = index;
    screen.innerHTML = item.screen;
    screen.dataset.stage = key;
    el('launchDemoLabel').textContent = item.label;
    el('launchDemoTitle').textContent = item.title;
    el('launchDemoText').textContent = item.text;
    el('launchDemoPoints').innerHTML = item.facts.map((fact, i) => `<article>${asset(['content-creation/content','learning-enablement/enablement','content-creation/development'][i])}<div><strong>${fact[0]}</strong><span>${fact[1]}</span></div></article>`).join('');
    el('launchStageCount').textContent = `${index + 1} / ${keys.length}`;
    el('launchProgressFill').style.width = `${(index + 1) / keys.length * 100}%`;
    document.querySelectorAll('.launch-sim-dots span').forEach((dot, i) => dot.classList.toggle('active', i === index));
    tabs.forEach(tab => { const active = tab.dataset.launchStage === key; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    el('launchPrev').disabled = index === 0;
    el('launchNext').disabled = index === keys.length - 1;
    el('launchNext').textContent = index === keys.length - 1 ? 'Lesson complete' : 'Continue →';
    el('launchScreenScroll').scrollTop = 0;
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => render(tab.dataset.launchStage));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus(); render(tabs[next].dataset.launchStage);
    });
  });
  el('launchPrev').addEventListener('click', () => render(keys[activeIndex - 1]));
  el('launchNext').addEventListener('click', () => render(keys[activeIndex + 1]));
  render(keys[0]);
  const pipeline = document.querySelector('.launch-pipeline');
  const pipelineStages = {
    source: ['01 / Scope','Filter source to a seller-ready message.'],
    structure: ['02 / Build','Match each learning job to its format.'],
    review: ['03 / Review','Turn in-context feedback into tracked revisions.'],
    release: ['04 / Release','Hand off assets that can be updated separately.']
  };
  document.querySelectorAll('.launch-pipeline [data-micro-flow]').forEach(button => {
    button.addEventListener('click', () => {
      const stage = button.dataset.microFlow;
      pipeline.dataset.activeStage = stage;
      el('launchFlowLabel').textContent = pipelineStages[stage][0];
      el('launchFlowTitle').textContent = pipelineStages[stage][1];
    });
  });
})();
