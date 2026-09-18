(() => {
  const stageData = {
    introduce: {
      label: 'Introduce',
      title: 'Start with the product promise.',
      text: 'Give sellers a fast mental model of what the new offer is and why it matters before adding feature detail.',
      image: '../../../../assets/project-images/product-launch/product-launch-introduction.webp',
      alt: 'Fictional TaskMate AI product-launch introduction screen.',
      points: ['Orient the learner quickly', 'Lead with value instead of feature density', 'Keep the first interaction low-friction']
    },
    explore: {
      label: 'Explore',
      title: 'Let learners inspect the capabilities.',
      text: 'Chunk a small set of launch features so learners can connect each capability to an everyday work outcome without reading a long product dump.',
      image: '../../../../assets/project-images/product-launch/product-launch-key-features.webp',
      alt: 'Fictional TaskMate AI feature-exploration screen.',
      points: ['Progressive disclosure', 'Short benefit-led explanations', 'Scannable feature categories']
    },
    apply: {
      label: 'Apply',
      title: 'End with a use-case decision.',
      text: 'Ask the learner to distinguish a strong product fit from tasks better handled by another tool, then explain the reasoning.',
      image: '../../../../assets/project-images/product-launch/product-launch-use-case-practice.webp',
      alt: 'Fictional TaskMate AI applied use-case practice screen.',
      points: ['Decision instead of recall', 'Immediate explanatory feedback', 'Reinforce appropriate product fit']
    }
  };

  const tabs = [...document.querySelectorAll('[data-launch-stage]')];
  const image = document.getElementById('launchDemoImage');
  const label = document.getElementById('launchDemoLabel');
  const title = document.getElementById('launchDemoTitle');
  const text = document.getElementById('launchDemoText');
  const points = document.getElementById('launchDemoPoints');

  const renderStage = (key) => {
    const item = stageData[key];
    if (!item || !image || !label || !title || !text || !points) return;
    image.src = item.image;
    image.alt = item.alt;
    label.textContent = item.label;
    title.textContent = item.title;
    text.textContent = item.text;
    points.innerHTML = item.points.map((point) => '<span>' + point + '</span>').join('');
  };

  tabs.forEach((button, index) => {
    const activate = () => {
      tabs.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      renderStage(button.dataset.launchStage);
    };

    button.addEventListener('click', activate);
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else next = (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  const practiceOptions = [...document.querySelectorAll('[data-launch-answer]')];
  const feedback = document.getElementById('launchPracticeFeedback');

  practiceOptions.forEach((button) => {
    button.addEventListener('click', () => {
      practiceOptions.forEach((item) => item.classList.toggle('selected', item === button));
      const correct = button.dataset.launchAnswer === 'correct';
      if (!feedback) return;
      feedback.classList.add('show');
      feedback.innerHTML = correct
        ? '<strong>Strong choice.</strong> Drafting a follow-up from meeting notes is a clear fit for a general productivity assistant: the task is bounded, text-based, and benefits from speed without requiring a specialized analytics or scheduling system.'
        : '<strong>Not the strongest fit.</strong> This task is better handled by a purpose-built analytics or scheduling tool. The launch message should help learners recognize both where the product fits and where another tool is more appropriate.';
    });
  });
})();
