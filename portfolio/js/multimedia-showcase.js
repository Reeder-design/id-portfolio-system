(() => {
  const samples = {
    premiere: {
      file: 'multimedia-premiere-editing.webp',
      label: 'Video editing and sequencing',
      tool: 'Premiere Pro',
      alt: 'Public-safe reconstructed video editing workspace with timeline, footage, graphics, narration, and music tracks.',
      text: 'I use timeline-based editing to combine footage, narration, graphics, on-screen text, and music while controlling pacing and visual hierarchy.',
      role: 'Sequence, edit, caption, polish',
      qa: 'Timing, readability, audio balance, export'
    },
    motion: {
      file: 'multimedia-after-effects-motion.webp',
      label: 'Motion graphics and visual explanation',
      tool: 'After Effects',
      alt: 'Public-safe reconstructed motion graphics workspace with a learning visual, layered composition, timeline, and effects panel.',
      text: 'I use motion when movement helps explain sequence, hierarchy, change, or emphasis, rather than adding animation for decoration.',
      role: 'Storyboard, animate, refine',
      qa: 'Legibility, timing, contrast, visual purpose'
    },
    ai: {
      file: 'multimedia-ai-visuals.webp',
      label: 'AI-assisted visual ideation',
      tool: 'AI image generation',
      alt: 'Public-safe reconstructed AI image generation interface showing learning-focused visual concepts and refinement controls.',
      text: 'I use AI-assisted visual generation to explore concepts and create public-safe custom imagery, then refine the output for consistency, composition, and learning fit.',
      role: 'Prompt, iterate, select, refine',
      qa: 'Consistency, composition, accuracy, tone'
    },
    audio: {
      file: 'multimedia-audio-production.webp',
      label: 'Narration cleanup and audio finishing',
      tool: 'Adobe Audition',
      alt: 'Public-safe reconstructed audio production workspace showing waveform editing, effects, properties, and level meters.',
      text: 'I clean narration, tighten pacing, balance levels, reduce distracting noise, and prepare audio that works cleanly with captions and visual timing.',
      role: 'Edit, clean, level, export',
      qa: 'Noise, clipping, pacing, caption alignment'
    },
    library: {
      file: 'multimedia-asset-library.webp',
      label: 'Reusable visual design system',
      tool: 'Illustrator + asset library',
      alt: 'Public-safe reconstructed visual asset library with brand elements, icons, illustrations, templates, fonts, and color palette.',
      text: 'I organize reusable icons, illustrations, templates, and brand elements so production stays consistent and future updates do not require rebuilding every visual from scratch.',
      role: 'Design, organize, standardize',
      qa: 'Consistency, reuse, accessibility, maintainability'
    },
    storyboard: {
      file: 'multimedia-storyboard-plan.webp',
      label: 'Storyboard and video planning',
      tool: 'Storyboard workflow',
      alt: 'Public-safe reconstructed storyboard with scenes, visual frames, descriptions, narration, and production notes.',
      text: 'I plan scenes, narration, visuals, motion notes, and transitions before production so the finished media supports the learning sequence and stays maintainable.',
      role: 'Script, storyboard, align',
      qa: 'Scope, flow, narration, production readiness'
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

  setupTabs('[data-media-sample]', 'mediaSample', (key) => {
    const data = samples[key];
    const image = document.getElementById('mediaEvidenceImage');
    image.src = '../../../assets/project-images/multimedia/' + data.file;
    image.alt = data.alt;
    setText('mediaEvidenceLabel', data.label);
    setText('mediaEvidenceTool', data.tool);
    setText('mediaEvidenceText', data.text);
    setText('mediaEvidenceRole', data.role);
    setText('mediaEvidenceQa', data.qa);
  });

  setupTabs('[data-media-workflow]', 'mediaWorkflow', (key) => {
    const data = workflow[key];
    setText('mediaWorkflowLabel', data.label);
    setText('mediaWorkflowTitle', data.title);
    setText('mediaWorkflowText', data.text);
    setText('mediaWorkflowDecision', data.decision);
    setText('mediaWorkflowOutput', data.output);
    setText('mediaWorkflowQa', data.qa);
  });

  const navLinks = [...document.querySelectorAll('.case-nav a')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === '#' + visible.target.id));
    }, {rootMargin:'-28% 0px -58% 0px', threshold:[0.1,.35,.6]});
    sections.forEach((section) => observer.observe(section));
  }
})();
