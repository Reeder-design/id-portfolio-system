(() => {
  const data = window.verticalCaseData || {};

  const setupTabs = (selector, attr, onActivate) => {
    const buttons = [...document.querySelectorAll(selector)];
    if (!buttons.length) return;
    buttons.forEach((button, index) => {
      const activate = () => {
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        onActivate(button.dataset[attr]);
      };
      button.addEventListener('click', activate);
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else next = (index - 1 + buttons.length) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
      });
    });
  };

  let industry = 'seaport';
  let stage = 'context';

  const renderLearning = () => {
    const item = data.industries?.[industry];
    const stageItem = item?.stages?.[stage];
    if (!item || !stageItem) return;
    const sample = stage === 'practice' ? data.samples?.practice : data.samples?.[industry];
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set('verticalIndustryLabel', item.label);
    set('verticalIndustryTitle', item.title);
    set('verticalIndustrySummary', item.summary);
    set('verticalStageTitle', stageItem.title);
    set('verticalStageText', stageItem.text);
    set('verticalStageProof', stageItem.proof);
    set('verticalStageNote', stageItem.note);
    const sampleImage = document.getElementById('verticalSampleImage');
    const sampleCaption = document.getElementById('verticalSampleCaption');
    if (sample && sampleImage) {
      sampleImage.src = sample.src;
      sampleImage.alt = sample.alt;
    }
    if (sample && sampleCaption) sampleCaption.textContent = sample.caption;
  };

  setupTabs('[data-vertical-industry]', 'verticalIndustry', (key) => {
    industry = key;
    renderLearning();
  });

  setupTabs('[data-vertical-stage]', 'verticalStage', (key) => {
    stage = key;
    renderLearning();
  });

  setupTabs('[data-vertical-outcome]', 'verticalOutcome', (key) => {
    const item = data.outcomes?.[key];
    if (!item) return;
    const label = document.getElementById('verticalOutcomeLabel');
    const title = document.getElementById('verticalOutcomeTitle');
    const text = document.getElementById('verticalOutcomeText');
    const proof = document.getElementById('verticalOutcomeProof');
    const icon = document.getElementById('verticalOutcomeIcon');
    if (label) label.textContent = item.label;
    if (title) title.textContent = item.title;
    if (text) text.textContent = item.text;
    if (proof) proof.textContent = item.proof;
    if (icon) icon.setAttribute('href', `../../../../assets/icons/portfolio-icons.svg#${item.icon}`);
  });

  renderLearning();
})();
