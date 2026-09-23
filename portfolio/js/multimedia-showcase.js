(() => {
  const studio = {
    video: {
      label: 'VIDEO PRODUCTION', workspace: 'VIDEO EDITOR', title: 'Show a process unfolding.',
      purpose: 'Video helps when a learner needs to see timing, sequence, or a real action before trying it.',
      make: 'Edited footage, screen capture, narration, on-screen text, and captions.',
      path: 'Script → storyboard → edit → caption',
      qa: 'Pacing, readability, audio balance, captions, and export.',
      tool: 'Premiere Pro · learning platform'
    },
    motion: {
      label: 'MOTION GRAPHICS', workspace: 'MOTION COMPOSITION', title: 'Make change visible.',
      purpose: 'Motion clarifies a sequence, relationship, or transition that is hard to grasp in a still frame.',
      make: 'Animated visual explanations, layered compositions, and reusable motion elements.',
      path: 'Map the idea → animate keyframes → review timing',
      qa: 'Visual purpose, legibility, contrast, pacing, and accessibility.',
      tool: 'After Effects · motion library'
    },
    visuals: {
      label: 'IMAGES + GRAPHICS', workspace: 'VISUAL ARTBOARD', title: 'Focus the eye.',
      purpose: 'A well-composed image or graphic guides attention to the important part of an idea or interface.',
      make: 'Illustrations, diagrams, annotations, icons, and reusable visual assets.',
      path: 'Compose → annotate → optimize → save for reuse',
      qa: 'Hierarchy, brand consistency, contrast, alt text, and responsive clarity.',
      tool: 'Illustrator · asset library'
    },
    audio: {
      label: 'AUDIO PRODUCTION', workspace: 'AUDIO SESSION', title: 'Guide the ear.',
      purpose: 'Narration and sound can set pace and focus while giving the screen room to breathe.',
      make: 'Edited narration, balanced audio, and sound that supports the visual sequence.',
      path: 'Write → record → clean → mix',
      qa: 'Noise, clipping, pacing, levels, and caption alignment.',
      tool: 'Audition · accessible delivery'
    },
    ai: {
      label: 'AI-ASSISTED VISUALS', workspace: 'VISUAL IDEATION', title: 'Prototype, then verify.',
      purpose: 'Generated visuals help explore a learning-focused concept when custom imagery is needed.',
      make: 'Visual directions, selected concepts, and refined public-safe learning assets.',
      path: 'Brief → generate → compare → refine',
      qa: 'Accuracy, consistency, composition, access, and fit for the learner task.',
      tool: 'AI generation · Photoshop refinement'
    }
  };

  const workflow = {
    plan: {
      label: 'Pre-production',
      title: 'Plan the message before opening the production tool.',
      text: 'I define the purpose, script, storyboard, screen or shot plan, visual hierarchy, and where the finished asset belongs in the learner journey.',
      decision: 'Choose the medium only when it supports the learning objective or learner task.',
      output: 'Script, storyboard, production notes, and a clear role for the asset.',
      qa: 'Check scope, length, accessibility needs, and maintenance expectations before production begins.'
    },
    build: {
      label: 'Production',
      title: 'Build the asset around clarity, not production complexity.',
      text: 'I edit footage or screen capture, build motion and graphics, clean audio, create supporting visuals, and keep the production focused on what the learner needs to notice.',
      decision: 'Use the simplest production approach that communicates the idea well.',
      output: 'A working media asset with the core visual, audio, and instructional elements in place.',
      qa: 'Check pacing, visual hierarchy, audio quality, brand fit, and whether the message stays clear.'
    },
    refine: {
      label: 'Post-production',
      title: 'Refine the details that affect learner comprehension.',
      text: 'I tighten edits, adjust pacing, correct audio, refine transitions, add captions or text support, and remove anything that distracts from the learning message.',
      decision: 'Cut or simplify elements that compete with the core point.',
      output: 'A polished asset ready for accessibility and delivery checks.',
      qa: 'Review captions, readability, audio levels, timing, contrast, pronunciation, and export quality.'
    },
    integrate: {
      label: 'Learning integration',
      title: 'Place the media where it helps the learner do something next.',
      text: 'I integrate the finished asset into Rise, Storyline, or another delivery format and check how it works with the surrounding explanation, practice, navigation, and assessment.',
      decision: 'Media should support the learning flow, not interrupt it.',
      output: 'A finished learning experience with media connected to context, practice, or performance support.',
      qa: 'Test playback, responsive behavior, accessibility, loading, navigation, and the learner transition before and after the asset.'
    }
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  const restartAnimation = (element, className = 'is-switching') => {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  };

  const setupTabs = (selector, dataKey, render) => {
    const buttons = [...document.querySelectorAll(selector)];
    buttons.forEach((button, index) => {
      button.tabIndex = button.getAttribute('aria-selected') === 'true' ? 0 : -1;

      const activate = () => {
        buttons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        render(button.dataset[dataKey]);
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

  setupTabs('[data-media-studio]', 'mediaStudio', (key) => {
    const data = studio[key];
    const panel = document.getElementById('media-studio-panel');
    const workbench = panel?.querySelector('.media-studio-workbench');
    if (!data || !panel) return;

    panel.dataset.media = key;
    panel.setAttribute('aria-labelledby', 'media-tab-' + key);
    if (workbench) workbench.setAttribute('aria-label', 'Animated ' + data.label.toLowerCase() + ' environment and media preview');
    panel.querySelectorAll('[data-studio-scene]').forEach((scene) => {
      scene.hidden = scene.dataset.studioScene !== key;
    });
    setText('mediaStudioWorkspaceLabel', data.workspace);
    setText('mediaStudioLabel', data.label);
    setText('mediaStudioTitle', data.title);
    setText('mediaStudioPurpose', data.purpose);
    setText('mediaStudioMake', data.make);
    setText('mediaStudioPath', data.path);
    setText('mediaStudioQa', data.qa);
    setText('mediaStudioTool', data.tool);
  });

  setupTabs('[data-media-workflow]', 'mediaWorkflow', (key) => {
    const data = workflow[key];
    const motion = document.getElementById('mediaWorkflowMotion');
    if (!data) return;

    setText('mediaWorkflowLabel', data.label);
    setText('mediaWorkflowTitle', data.title);
    setText('mediaWorkflowText', data.text);
    setText('mediaWorkflowDecision', data.decision);
    setText('mediaWorkflowOutput', data.output);
    setText('mediaWorkflowQa', data.qa);

    if (motion) {
      motion.dataset.phase = key;
      motion.setAttribute('aria-label', 'Animated demonstration of ' + data.label.toLowerCase());
      restartAnimation(motion);
    }
  });

  const navLinks = [...document.querySelectorAll('.case-nav a')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    let navFrame = 0;
    const updateNav = () => {
      navFrame = 0;
      const marker = window.scrollY + Math.max(110, window.innerHeight * .3);
      const current = sections.reduce((active, section) => section.offsetTop <= marker ? section : active, sections[0]);
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + current.id));
    };
    const queueNavUpdate = () => {
      if (!navFrame) navFrame = window.requestAnimationFrame(updateNav);
    };
    window.addEventListener('scroll', queueNavUpdate, {passive:true});
    window.addEventListener('resize', queueNavUpdate);
    updateNav();
  }

})();
