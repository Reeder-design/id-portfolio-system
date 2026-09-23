(() => {
  const formats = {
    pathway: {
      title: 'Learning pathway',
      text: 'A sequence of lessons, practice, and assessment develops several connected skills over time.',
      scope: 'A broader capability', action: 'Builds and demonstrates several skills', finish: 'Evidence across the pathway',
      contrast: 'How they connect', link: 'A microlearning can be one focused step inside that larger pathway.'
    },
    workshop: {
      title: 'Live workshop',
      text: 'A facilitator helps a group discuss, rehearse, and refine responses together in real time.',
      scope: 'Shared practice or alignment', action: 'Discusses and rehearses with peers', finish: 'Feedback and a group plan',
      contrast: 'How they connect', link: 'A microlearning can prepare learners for the workshop or reinforce one decision afterward.'
    },
    support: {
      title: 'Performance support',
      text: 'A job aid, guide, or tool provides the answer or steps while someone is doing the work.',
      scope: 'A live task or reference need', action: 'Finds and applies information', finish: 'The task moves forward',
      contrast: 'How they connect', link: 'A microlearning can teach the decision; a job aid can remain available when that decision comes up again.'
    }
  };
  const tabs = [...document.querySelectorAll('.micro-compare-tabs [data-format]')];
  const panel = document.querySelector('.micro-compare-panel');
  if (!tabs.length || !panel) return;
  const fields = Object.fromEntries(['Title','Text','Scope','Action','Finish','Contrast','Link'].map(name => [name.toLowerCase(), document.getElementById('microFormat' + name)]));
  function activate(tab) {
    const data = formats[tab.dataset.format];
    if (!data) return;
    tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
    Object.entries(data).forEach(([key, value]) => { fields[key].textContent = value; });
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = '';
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus(); activate(tabs[next]);
    });
  });
})();
