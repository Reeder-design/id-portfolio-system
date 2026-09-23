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

  const workflowStages = {
    frame: {number:'01', name:'Frame', editor:'PLAN', preview:'STORYBOARD'},
    compose: {number:'02', name:'Compose', editor:'BUILD', preview:'WORKING PASS'},
    verify: {number:'03', name:'Verify', editor:'QUALITY PASS', preview:'REVIEW'},
    release: {number:'04', name:'Release', editor:'EXPORT + LMS', preview:'FINAL MASTER'}
  };

  // The shared editor shell stays in place while each medium supplies its own production work.
  const workflowFormats = {
    video: {
      name:'VIDEO', editor:'VIDEO EDITOR', brief:'Show a software task clearly enough for a learner to repeat it.', meta:'Screen capture · narration · captions',
      storyboard:['ACTION','RESULT','PRACTICE'], composition:['TASK STEP / LEARNING SCREEN','Follow the action','SCREEN CAPTURE','Watch the cursor and try the step.','TRY THE STEP'], export:'VIDEO MASTER + CAPTIONS', destination:'IMPORT COURSE → LMS',
      stages:{
        frame:{title:'Map the shots before recording.', text:'I script the exact action, identify the screen states to capture, and mark where narration or a callout will help. A short shot list keeps the recording focused on what the learner must repeat.', move:'Sequence the cursor action, result, and pause for practice.', output:'A script, shot list, and capture plan.', check:'Each planned shot shows one necessary learner action.', next:'Record the screen and narration against the approved shot list.', bins:['Script v3','Screen states','Caption terms'], inspector:[['Shot','Cursor step'],['Length','00:08'],['Access','Caption cue']], preview:'SHOT 02 / TASK STEP'},
        compose:{title:'Build the cut around the action.', text:'I trim captures to the useful steps, align narration with each visible change, and add callouts only where the cursor alone is unclear. Captions follow the spoken explanation and on-screen terms.', move:'Sync the screen, voice, and caption tracks.', output:'A rough cut with a readable task sequence.', check:'The learner can follow the action at normal speed without guessing.', next:'Review cursor visibility, audio balance, and caption timing.', bins:['Capture 01–03','VO take 02','Caption draft'], inspector:[['Cut','00:42'],['Voice','Aligned'],['Callout','Step 02']], preview:'ROUGH CUT / TASK STEP'},
        verify:{title:'Scrub for clarity and access.', text:'I review the cut at its actual playback size, check cursor visibility and pacing, listen for level changes, and compare captions with the spoken words. A crowded step gets a tighter crop or more time.', move:'Correct the unclear step and run a second playback check.', output:'A reviewed master with caption corrections.', check:'Task steps, narration, captions, and audio levels agree.', next:'Export the video master and caption file.', bins:['Review notes','Caption pass','Audio meter'], inspector:[['Cursor','Visible ✓'],['Levels','Balanced ✓'],['Captions','Synced ✓']], preview:'QA / TASK STEP'},
        release:{title:'Export the master, then test it in the course.', text:'I export the approved video and captions, place them at the right point in the course, and check playback, caption controls, and the learner’s next action. The course package then imports into the LMS and launches for a learner check.', move:'Package video, captions, and the practice step.', output:'A playable course with the video master and editable project saved.', check:'Playback, captions, navigation, and LMS launch work end to end.', next:'Hand off the source project and update path for later revisions.', bins:['Master video','Captions.vtt','Edit project'], inspector:[['Export','Video + VTT'],['Course','Playback ✓'],['LMS','Launch ✓']], preview:'FINAL VIDEO / COURSE'}
      }
    },
    motion: {
      name:'MOTION', editor:'MOTION COMPOSITION', brief:'Make a process change visible without crowding the screen.', meta:'Visual beats · keyframes · static fallback',
      storyboard:['START STATE','CHANGE','FINAL HOLD'], composition:['CHANGE / LEARNING SCREEN','See what changes','MOTION PREVIEW','Compare the start and final states.','COMPARE STATES'], export:'MOTION RENDER + STILL', destination:'IMPORT COURSE → LMS',
      stages:{
        frame:{title:'Plan the change before animating.', text:'I identify the state before and after the change, map the few visual beats between them, and decide which movement carries meaning. I also note what the explanation must preserve in a still version.', move:'Choose the object, path, hold, and final state.', output:'A beat board and motion path.', check:'Each movement explains a relationship or transition.', next:'Build the composition and set the first keyframes.', bins:['Beat board','Path sketch','Fallback note'], inspector:[['Start','State A'],['End','State B'],['Hold','1.2 sec']], preview:'BEAT 02 / CHANGE'},
        compose:{title:'Set keyframes where meaning changes.', text:'I animate the object along a deliberate path, adjust easing so the change reads clearly, and hold the result long enough to process. Labels enter with the right beat rather than competing with the motion.', move:'Tune position, easing, and label timing.', output:'A working motion composition and preview render.', check:'The viewer can name what changed after one pass.', next:'Review legibility, pace, and reduced-motion support.', bins:['Shape layers','Keyframes','Label timing'], inspector:[['Path','3 points'],['Ease','Soft out'],['Hold','1.2 sec']], preview:'COMPOSITION / BEAT 02'},
        verify:{title:'Check the motion at real viewing speed.', text:'I watch for abrupt movement, unreadable labels, and a final state that disappears too quickly. I then test a lower-motion or static explanation so the same information remains available.', move:'Extend the hold and refine any distracting motion.', output:'A reviewed motion master and accessible fallback.', check:'Timing, contrast, and the static meaning are intact.', next:'Render the approved animation and fallback still.', bins:['Timing pass','Contrast notes','Static version'], inspector:[['Motion','Clear ✓'],['Labels','Readable ✓'],['Fallback','Ready ✓']], preview:'QA / FINAL STATE'},
        release:{title:'Render for the learning environment.', text:'I export the motion file and its static alternative, confirm size and playback in the course, and check that the following learner action is visible. The course package imports into the LMS for a final launch test.', move:'Deliver the render, fallback, and source composition.', output:'A working course with motion and static support.', check:'Playback, fallback, navigation, and LMS launch work together.', next:'Retain the editable composition for updates.', bins:['Motion render','Static fallback','Source comp'], inspector:[['Export','Motion + still'],['Course','Playback ✓'],['LMS','Launch ✓']], preview:'FINAL MOTION / COURSE'}
      }
    },
    images: {
      name:'IMAGES', editor:'VISUAL ARTBOARD', brief:'Clarify a decision path in one annotated image.', meta:'Visual hierarchy · callouts · alt text',
      storyboard:['FOCAL CUE','ANNOTATION','ACTION'], composition:['VISUAL / LEARNING SCREEN','Find the key detail','ANNOTATED IMAGE','Follow the numbered callout.','APPLY THE CUE'], export:'RESPONSIVE IMAGES + ALT', destination:'IMPORT COURSE → LMS',
      stages:{
        frame:{title:'Decide what the eye must find first.', text:'I identify the target cue, establish the reading order, and choose the image bounds before drawing details. Thumbnail options help test whether the visual explanation works at the size learners will actually see.', move:'Set one focal point and a clear annotation order.', output:'A visual brief, thumbnail, and size target.', check:'The intended cue is visible without reading a paragraph.', next:'Build the artboard and annotation layers.', bins:['Source reference','Thumbnails','Size target'], inspector:[['Focus','Primary cue'],['Order','01 → 02'],['Size','Mobile first']], preview:'THUMBNAIL / DECISION'},
        compose:{title:'Build the visual in layers.', text:'I compose the scene, place callouts in reading order, and separate editable text from the image where possible. Crop and spacing keep the focal point clear when the graphic scales down.', move:'Align image, callouts, and text layers.', output:'A working artboard with editable annotations.', check:'The message survives the intended mobile crop.', next:'Check contrast, scale, and alt text.', bins:['Image layer','Callouts','Text styles'], inspector:[['Layers','3 active'],['Crop','Responsive'],['Callout','02 selected']], preview:'ARTBOARD / ANNOTATION'},
        verify:{title:'Inspect the smallest readable version.', text:'I review the graphic at phone size, check contrast and annotation order, and write alt text that carries the instructional point. If a label becomes cramped, I simplify the visual rather than shrinking the type.', move:'Revise crop, contrast, and description.', output:'An approved graphic with alt text.', check:'The cue remains clear visually and in the text alternative.', next:'Export responsive sizes and keep the source artboard.', bins:['Mobile crop','Contrast pass','Alt text'], inspector:[['Small size','Readable ✓'],['Contrast','Pass ✓'],['Alt text','Meaning ✓']], preview:'QA / PHONE SIZE'},
        release:{title:'Export sizes that stay useful.', text:'I export the approved image sizes, connect the alt text, and place the graphic beside the learner action it supports. I check it inside the course before the package is imported and launched in the LMS.', move:'Deliver responsive image files and description.', output:'A course graphic, source artboard, and update path.', check:'Image load, mobile crop, alt text, and LMS launch pass.', next:'Retain editable layers for the next revision.', bins:['Responsive files','Alt text','Source artboard'], inspector:[['Export','Web sizes'],['Course','Display ✓'],['LMS','Launch ✓']], preview:'FINAL IMAGE / COURSE'}
      }
    },
    audio: {
      name:'AUDIO', editor:'AUDIO SESSION', brief:'Guide a learner through a concise spoken explanation.', meta:'Script · recording · cleanup · transcript',
      storyboard:['OPENING','EMPHASIS','PAUSE'], composition:['NARRATION / LEARNING SCREEN','Listen for the cue','AUDIO PLAYER','Read along with the transcript.','CONTINUE'], export:'AUDIO MASTER + TRANSCRIPT', destination:'IMPORT COURSE → LMS',
      stages:{
        frame:{title:'Write for listening, then plan the take.', text:'I mark emphasis, pronunciation, and pauses in the script so the recording sounds natural. I decide what should be spoken and what should remain in the transcript or surrounding screen text.', move:'Set the spoken beats and pause points.', output:'A narration script and recording plan.', check:'A listener can follow the idea without seeing the screen.', next:'Record takes and build the audio session.', bins:['Narration script','Pronunciation','Pause marks'], inspector:[['Pace','Conversational'],['Pause','After cue'],['Access','Transcript']], preview:'SCRIPT / OPENING'},
        compose:{title:'Clean the take without flattening it.', text:'I select the strongest take, remove distracting noise and clicks, shape pauses, and balance the voice with any supporting sound. I preserve the natural rhythm that helps the learner process the message.', move:'Edit voice, cleanup, and transcript tracks.', output:'A balanced working audio session.', check:'The voice stays clear and comfortable throughout.', next:'Listen for clipping, noise, and transcript alignment.', bins:['VO take 03','Noise sample','Transcript draft'], inspector:[['Cleanup','Light'],['Level','Consistent'],['Pause','Retained']], preview:'WAVEFORM / EDIT PASS'},
        verify:{title:'Listen with the transcript beside it.', text:'I check for abrupt edits, clipped peaks, inconsistent level, and words the transcript missed. I replay the file on ordinary speakers so the review matches the learner’s likely listening setup.', move:'Correct peaks and align the final transcript.', output:'A reviewed audio master and transcript.', check:'Every spoken instruction is audible and represented in text.', next:'Export the master and add transcript access.', bins:['Peak review','Noise check','Transcript pass'], inspector:[['Peaks','Clean ✓'],['Voice','Clear ✓'],['Text','Matched ✓']], preview:'QA / WAVEFORM'},
        release:{title:'Deliver audio with equal text access.', text:'I export the approved audio and transcript, place both in the course, and check player behavior and download or reading access. Then I import the course package into the LMS and test the learner launch.', move:'Package audio, transcript, and editable session.', output:'An accessible course audio experience and source session.', check:'Player, transcript, mobile access, and LMS launch work.', next:'Archive the source session for future narration edits.', bins:['Audio master','Transcript','Session source'], inspector:[['Export','Audio + text'],['Course','Player ✓'],['LMS','Launch ✓']], preview:'FINAL AUDIO / COURSE'}
      }
    },
    ai: {
      name:'AI VISUALS', editor:'VISUAL IDEATION', brief:'Prototype a fictional training scene with clear fact boundaries.', meta:'Prompt constraints · variants · human review',
      storyboard:['APPROVED FACTS','VISUAL BRIEF','REVIEW CUES'], composition:['SCENARIO / LEARNING SCREEN','Inspect the scene','REVIEWED VISUAL','Use the approved detail to decide.','MAKE A CHOICE'], export:'APPROVED VISUAL + SOURCE', destination:'IMPORT COURSE → LMS',
      stages:{
        frame:{title:'Set the boundaries before generating.', text:'I write the visual brief around the learner task, approved details, and what the image must avoid. The prompt names the subject, composition, and accessibility needs without introducing private client material.', move:'Define facts, exclusions, and visual criteria.', output:'A bounded prompt brief and review checklist.', check:'Every required detail can be checked against an approved source.', next:'Generate a small set of comparable concepts.', bins:['Approved facts','Style direction','Exclusion list'], inspector:[['Source','Approved'],['Privacy','Protected'],['Criteria','Written']], preview:'PROMPT / CONSTRAINTS'},
        compose:{title:'Compare variants before refining.', text:'I generate a limited set of concepts, compare them against the same brief, and select one to refine. Composition, focal point, and consistency matter more than novelty; the chosen variant remains a draft until checked.', move:'Select a concept and revise the weak details.', output:'A refined candidate and recorded selection rationale.', check:'The candidate supports the intended learning cue.', next:'Review generated details against the source.', bins:['Prompt v2','Variants A–C','Edit notes'], inspector:[['Selected','Variant B'],['Focus','Learner cue'],['Status','Draft']], preview:'COMPARE / VARIANTS'},
        verify:{title:'Review every generated detail.', text:'I look for invented labels, impossible interface details, visual artifacts, and mismatch with the approved scenario. I correct or reject the image, then check contrast, crop, and alt text before approval.', move:'Flag unsupported details and recheck the revision.', output:'An approved, public-safe visual and alt text.', check:'No generated detail changes the learner’s understanding.', next:'Export the approved image and retain the prompt record.', bins:['Accuracy notes','Artifact review','Alt text'], inspector:[['Facts','Matched ✓'],['Artifacts','Cleared ✓'],['Access','Ready ✓']], preview:'QA / SELECTED IMAGE'},
        release:{title:'Publish only the reviewed version.', text:'I export the approved visual at the right size, attach its alt text, and keep the prompt and revision record with the source. I test the image in its course context before the course package launches in the LMS.', move:'Deliver the approved asset with its source record.', output:'A course-ready image with provenance and update path.', check:'Image display, alt text, approval, and LMS launch pass.', next:'Keep the approved source separate from discarded variants.', bins:['Approved visual','Alt text','Prompt record'], inspector:[['Approval','Recorded ✓'],['Course','Display ✓'],['LMS','Launch ✓']], preview:'APPROVED / COURSE'}
      }
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

  let selectedWorkflowFormat = 'video';
  let selectedWorkflowStage = 'frame';
  const renderWorkflow = () => {
    const format = workflowFormats[selectedWorkflowFormat];
    const stage = workflowStages[selectedWorkflowStage];
    const data = format.stages[selectedWorkflowStage];
    const motion = document.getElementById('mediaWorkflowMotion');
    const panel = document.getElementById('media-workflow-panel');
    const pauseButton = document.getElementById('workflowPause');
    if (!format || !stage || !data) return;

    setText('workflowBriefLabel', format.name + ' PRODUCTION BRIEF');
    setText('workflowBriefText', format.brief);
    setText('workflowBriefMeta', format.meta);
    setText('mediaWorkflowLabel', stage.number + ' / ' + format.name + ' · ' + stage.name.toUpperCase());
    setText('mediaWorkflowTitle', data.title);
    setText('mediaWorkflowText', data.text);
    setText('mediaWorkflowDecision', data.move);
    setText('mediaWorkflowOutput', data.output);
    setText('mediaWorkflowQa', data.check);
    setText('mediaWorkflowMedium', data.next);
    setText('workflowCanvasStage', format.name + ' / ' + stage.number + ' ' + stage.name.toUpperCase());
    setText('workflowEditorName', format.editor);
    setText('workflowEditorStatus', stage.editor);
    setText('workflowBinTitle', selectedWorkflowStage === 'release' ? 'DELIVERY FILES' : 'PROJECT BIN');
    ['One','Two','Three'].forEach((item, index) => {
      setText('workflowBin' + item, data.bins[index]);
      setText('workflowInspector' + item + 'Label', data.inspector[index][0]);
      setText('workflowInspector' + item + 'Value', data.inspector[index][1]);
      setText('workflowBoard' + item, format.storyboard[index]);
    });
    setText('workflowPreviewName', data.preview);
    setText('workflowPreviewStatus', stage.preview);
    setText('workflowInspectorTitle', selectedWorkflowStage === 'verify' ? 'QUALITY CHECK' : selectedWorkflowStage === 'release' ? 'DELIVERY CHECK' : 'WORK SETTINGS');
    setText('workflowCompositionTitle', format.composition[0]);
    setText('workflowCompositionHeading', format.composition[1]);
    setText('workflowCompositionMedia', format.composition[2]);
    setText('workflowCompositionNote', format.composition[3]);
    setText('workflowCompositionAction', format.composition[4]);
    setText('workflowExportLabel', format.export);
    setText('workflowExportTarget', format.destination);
    setText('workflowEditorHandoff', data.next);
    const formatCaption = selectedWorkflowFormat === 'ai' ? 'AI visuals' : format.name.charAt(0) + format.name.slice(1).toLowerCase();
    setText('workflowCanvasCaption', formatCaption + ': ' + data.move + ' Next: ' + data.next);
    if (panel) panel.setAttribute('aria-labelledby', 'workflow-tab-' + selectedWorkflowStage);

    if (motion) {
      motion.dataset.media = selectedWorkflowFormat;
      motion.dataset.phase = selectedWorkflowStage;
      motion.dataset.paused = 'false';
      const visualDescription = selectedWorkflowStage === 'frame' ? 'A three-beat storyboard is drawn.' : selectedWorkflowStage === 'compose' ? 'Media and learning-screen objects move into an aligned layout.' : selectedWorkflowStage === 'verify' ? 'A quality scan crosses the completed composition.' : 'The export and LMS launch window opens above the completed composition.';
      motion.setAttribute('aria-label', 'Illustrative ' + format.name.toLowerCase() + ' production editor, ' + stage.name.toLowerCase() + ' stage. ' + visualDescription + ' ' + data.next);
      restartAnimation(motion);
    }
    if (pauseButton) {
      pauseButton.setAttribute('aria-pressed', 'false');
      pauseButton.textContent = 'Pause motion';
    }
  };

  document.querySelectorAll('[data-workflow-format]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedWorkflowFormat = button.dataset.workflowFormat;
      document.querySelectorAll('[data-workflow-format]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      renderWorkflow();
    });
  });
  setupTabs('[data-media-workflow]', 'mediaWorkflow', (key) => {
    selectedWorkflowStage = key;
    renderWorkflow();
  });
  renderWorkflow();

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
