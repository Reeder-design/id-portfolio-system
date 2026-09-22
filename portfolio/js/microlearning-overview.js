(() => {
  const iconPath = '../../../../assets/icons/portfolio-icons.svg#';
  const formats = {
    pathway: {
      label: 'Broad capability',
      title: 'Build a connected capability over time.',
      text: 'A pathway can connect lessons, practice, assessment, and follow-up across several skills. It is the right response when one small learning move cannot meet the goal.',
      moment: 'Moment: across a longer learning journey',
      evidence: 'Evidence: performance across several skills',
      icon: 'icon-learning-design'
    },
    micro: {
      label: 'Focused learning',
      title: 'Help someone make the next useful move.',
      text: 'A compact experience teaches one product message, decision, or task and gives enough context or practice to use it.',
      moment: 'Moment: before the next task',
      evidence: 'Evidence: one action or takeaway',
      icon: 'icon-interaction'
    },
    support: {
      label: 'Point-of-need resource',
      title: 'Put a reliable answer in the workflow.',
      text: 'A guide, job aid, dashboard, or repository helps someone find or apply information while working. It may follow a lesson, but the resource itself serves the live task.',
      moment: 'Moment: during the task',
      evidence: 'Evidence: an answer used in the work',
      icon: 'icon-feedback'
    }
  };
  const tabs = [...document.querySelectorAll('[data-format]')];
  const panel = document.querySelector('.micro-format-panel');
  const fields = {
    label: document.getElementById('microFormatLabel'),
    title: document.getElementById('microFormatTitle'),
    text: document.getElementById('microFormatText'),
    moment: document.getElementById('microFormatMoment'),
    evidence: document.getElementById('microFormatEvidence'),
    icon: document.getElementById('microFormatIcon')
  };
  if (!tabs.length || !panel) return;

  const activate = (button) => {
    const data = formats[button.dataset.format];
    if (!data) return;
    tabs.forEach((tab) => {
      const active = tab === button;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    fields.label.textContent = data.label;
    fields.title.textContent = data.title;
    fields.text.textContent = data.text;
    fields.moment.textContent = data.moment;
    fields.evidence.textContent = data.evidence;
    fields.icon.setAttribute('href', iconPath + data.icon);
    panel.classList.remove('is-changing');
    void panel.offsetWidth;
    panel.classList.add('is-changing');
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(tabs[next]);
    });
  });
})();
