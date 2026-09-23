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
    frame: {
      label: '01 / FRAME THE MOMENT', canvasStage: '01 / FRAME', previewStatus: 'WIRE FRAME',
      title: 'Define the decision the learner must make.',
      text: 'I identify the cue the learner needs to notice, the response they need to choose, and the approved source behind it. I set audience, placement, duration, and accessibility needs before choosing a format.',
      decision: 'What needs to be seen, heard, or practiced for the learner to choose well?',
      output: 'A media brief with source boundaries, content beats, and the intended learner action.',
      qa: 'A reviewer can trace each beat to the learning goal and approved content.',
      medium: 'A still may need a clear reading path; timed media needs pacing; generated visuals need an explicit accuracy boundary.',
      caption: 'The brief sets the learning target before any asset is polished.',
      canvasLabel: 'The learner action and approved source become three content beats: orient, notice the cue, and decide.'
    },
    compose: {
      label: '02 / COMPOSE THE MESSAGE', canvasStage: '02 / COMPOSE', previewStatus: 'FIRST PASS',
      title: 'Sequence attention around the cue.',
      text: 'I turn the brief into a clear progression: orient the learner, make the customer cue noticeable, then leave room for a decision. Visual focus, words, and support elements work together without competing for attention.',
      decision: 'What should the learner notice first, and where should they pause to decide?',
      output: 'A composition map and first pass with the content beats aligned to the preview.',
      qa: 'The cue remains clear when the asset is viewed or heard at its intended size and pace.',
      medium: 'Timed assets align narration, captions, and changes on screen. Still assets use reading order, hierarchy, and annotation.',
      caption: 'The same three beats now guide the preview and its supporting channels.',
      canvasLabel: 'The first pass aligns visual focus, words, and support elements while a playhead moves across the composition map.'
    },
    verify: {
      label: '03 / VERIFY AND REVISE', canvasStage: '03 / VERIFY', previewStatus: 'REVIEW PASS',
      title: 'Find what weakens understanding or access.',
      text: 'I compare the preview with the approved source and learner task. In this example, the customer cue needs stronger emphasis; I correct it and review the result again. I also check timing, readability, audio, accessibility, and any generated detail used.',
      decision: 'Which issue could change the learner’s interpretation or prevent access?',
      output: 'An annotated QA pass, targeted fixes, and a rechecked master asset.',
      qa: 'The corrected cue, content accuracy, and access support hold up in the final preview.',
      medium: 'Moving media needs caption and timing checks; stills need contrast and alt text; audio needs clean levels and a transcript; AI visuals need accuracy review.',
      caption: 'A visible issue becomes a specific correction and a second check.',
      canvasLabel: 'A quality flag identifies a weak customer cue, then a corrected cue is confirmed in the same preview.'
    },
    release: {
      label: '04 / RELEASE TO LEARNERS', canvasStage: '04 / RELEASE', previewStatus: 'IN COURSE',
      title: 'Import the course into the LMS and launch it.',
      text: 'I place the finished media inside the course, after context and before the learner’s decision. Then I package the experience, import it into the LMS, test the launch as a learner, and publish it. I keep editable sources ready for future updates.',
      decision: 'Does the launched course let learners reach the media and complete the practice?',
      output: 'A live course in the LMS, verified learner access, and organized source files.',
      qa: 'Test the imported course for mobile playback, captions or text alternatives, navigation, completion tracking, and the transition into practice.',
      medium: 'The same launch check applies to each media type; the exact media export and course package depend on the delivery format.',
      caption: 'The course package moves into the LMS, passes a launch check, and becomes available to learners.',
      canvasLabel: 'A course package containing context, media, and practice moves into a learning platform. The import progresses, the course launches, and learner access is confirmed.'
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
    const panel = document.getElementById('media-workflow-panel');
    const pauseButton = document.getElementById('workflowPause');
    if (!data) return;

    setText('mediaWorkflowLabel', data.label);
    setText('mediaWorkflowTitle', data.title);
    setText('mediaWorkflowText', data.text);
    setText('mediaWorkflowDecision', data.decision);
    setText('mediaWorkflowOutput', data.output);
    setText('mediaWorkflowQa', data.qa);
    setText('mediaWorkflowMedium', data.medium);
    setText('workflowCanvasStage', data.canvasStage);
    setText('workflowPreviewStatus', data.previewStatus);
    setText('workflowCanvasCaption', data.caption);
    if (panel) panel.setAttribute('aria-labelledby', 'workflow-tab-' + key);

    if (motion) {
      motion.dataset.phase = key;
      motion.dataset.paused = 'false';
      motion.setAttribute('aria-label', data.canvasLabel);
      restartAnimation(motion);
    }
    if (pauseButton) {
      pauseButton.setAttribute('aria-pressed', 'false');
      pauseButton.textContent = 'Pause motion';
    }
  });

  const workflowCanvas = document.getElementById('mediaWorkflowMotion');
  const workflowPause = document.getElementById('workflowPause');
  const workflowReplay = document.getElementById('workflowReplay');
  workflowPause?.addEventListener('click', () => {
    const paused = workflowCanvas.dataset.paused !== 'true';
    workflowCanvas.dataset.paused = String(paused);
    workflowPause.setAttribute('aria-pressed', String(paused));
    workflowPause.textContent = paused ? 'Resume motion' : 'Pause motion';
  });
  workflowReplay?.addEventListener('click', () => {
    workflowCanvas.dataset.paused = 'false';
    workflowPause.setAttribute('aria-pressed', 'false');
    workflowPause.textContent = 'Pause motion';
    restartAnimation(workflowCanvas);
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
