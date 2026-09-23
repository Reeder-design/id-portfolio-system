(() => {
  const imageRoot = '../../../../assets/icons/pixel/performance-support/';
  const methods = {
    find: {
      label: 'Access', title: 'Place the answer where the work begins.',
      text: 'A useful answer can still fail when the link is hard to find or the person lacks permission. I check the likely entry point before creating another resource.',
      when: 'Where will someone look while doing this task?',
      formats: 'Labels, navigation, permissions, device context, and workflow location.',
      image: 'find.webp'
    },
    decide: {
      label: 'Scan', title: 'Organize for the decision in front of the person.',
      text: 'When someone is in the middle of a task, I make triggers, decisions, actions, and next steps visible before background explanation.',
      when: 'What must they recognize or do first?',
      formats: 'Issue categories, short labels, decision prompts, and clear next actions.',
      image: 'decide.webp'
    },
    monitor: {
      label: 'Trust', title: 'Show why this is the current answer.',
      text: 'A reusable response needs a dependable source. I make the source owner, currency, and route for uncertain cases clear.',
      when: 'Who validates this guidance, and where does uncertainty go?',
      formats: 'Source links, owner, version cues, and escalation route.',
      image: 'monitor.webp'
    },
    extend: {
      label: 'Maintain', title: 'Plan for the next change and the old version.',
      text: 'I define who updates the resource, what events trigger review, and how to replace or retire guidance that no longer applies.',
      when: 'What change should trigger an update?',
      formats: 'Owner, review trigger, version expectation, replacement, and retirement.',
      image: 'extend.webp'
    }
  };
  const methodButtons = [...document.querySelectorAll('[data-ps-method]')];
  const methodPanel = document.getElementById('psMethodPanel');
  function activateMethod(button) {
    const data = methods[button.dataset.psMethod];
    if (!data) return;
    methodButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    methodPanel.setAttribute('aria-labelledby', button.id);
    document.getElementById('psMethodLabel').textContent = data.label;
    document.getElementById('psMethodTitle').textContent = data.title;
    document.getElementById('psMethodText').textContent = data.text;
    document.getElementById('psMethodWhen').textContent = data.when;
    document.getElementById('psMethodFormats').textContent = data.formats;
    document.getElementById('psMethodImage').src = imageRoot + data.image;
  }
  methodButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateMethod(button));
    button.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? methodButtons.length - 1 : (index + direction + methodButtons.length) % methodButtons.length;
      methodButtons[next].focus();
      activateMethod(methodButtons[next]);
    });
  });

  const diagnoses = {
    knowledge: {
      cause: 'Knowledge', route: 'Learning + support',
      check: 'Does the person need a new mental model or practice, or only a reliable reminder?',
      response: 'Teach the principle and keep a maintained reference for repeated use; validate it with the source owner.'
    },
    access: {
      cause: 'Access', route: 'Guidance + escalation',
      check: 'Is the answer available, but hidden by permissions, labels, navigation, or an entry point?',
      response: 'Clarify the route to access; send permission changes or account problems to the administrator or support owner.'
    },
    process: {
      cause: 'Process', route: 'Workflow change',
      check: 'Does the documented step match how the work actually moves between people?',
      response: 'Review the handoff with operational owners; adjust the workflow and its point-of-need guidance together.'
    },
    source: {
      cause: 'Source / owner', route: 'Performance support',
      check: 'Are different references giving different answers, or is no one responsible for the current answer?',
      response: 'Find the authoritative source with the right SME or operational owner, then build guidance with a named maintainer.'
    },
    system: {
      cause: 'System', route: 'Configuration fix',
      check: 'Is a setting, mapping, visibility rule, or data state causing the issue?',
      response: 'Document the case for the system or administration owner; update support guidance after the fix is validated.'
    },
    exception: {
      cause: 'Exception', route: 'Human escalation',
      check: 'Does this case require judgment, investigation, data correction, or action beyond the routine path?',
      response: 'Give a clear escalation route and the context the next owner needs. Do not imply the resource can resolve it alone.'
    }
  };
  const diagnosisButtons = [...document.querySelectorAll('[data-ps-diagnosis]')];
  diagnosisButtons.forEach(button => button.addEventListener('click', () => {
    const data = diagnoses[button.dataset.psDiagnosis];
    if (!data) return;
    diagnosisButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('psCauseVisual').textContent = data.cause;
    document.getElementById('psRouteVisual').textContent = data.route;
    document.getElementById('psDiagnosisCheck').textContent = data.check;
    document.getElementById('psDiagnosisResponse').textContent = data.response;
  }));
})();
