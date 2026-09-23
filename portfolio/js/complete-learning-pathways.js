(() => {
  "use strict";

  const asset = "../../../assets/";
  const icon = (name) => `${asset}icons/pixel/lms/${name}.webp`;

  function bindTabs(workspace, onSelect) {
    const tabs = [...workspace.querySelectorAll('[role="tab"]')];
    function select(tab) {
      tabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      onSelect(tab.dataset.cpTab, tab);
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else next = (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus();
        select(tabs[next]);
      });
    });
  }

  const scale = {
    quick: {
      kicker: "Point-of-need support",
      heading: "A precise need can use a precise tool.",
      description: "A job aid puts an approved response or process where someone needs it. The learner finds the answer, uses it, and returns to work without entering a course.",
      scene: `<div class="cp-mini-app cp-mini-aid"><div class="cp-mini-top"><span>JOB AID</span><span>POINT OF NEED</span></div><div class="cp-mini-search">⌕ <span>Find a response</span></div><div class="cp-mini-aid-card"><strong>Customer asks about handoff delays</strong><span>Start by clarifying where the handoff breaks.</span></div><button type="button" data-mini-action="quick">Open suggested response ↗</button><div class="cp-mini-reveal" hidden role="status">Ask → clarify → use approved answer</div></div>`
    },
    micro: {
      kicker: "One small learning goal",
      heading: "Microlearning delivers one useful idea.",
      description: "A short, self-contained learning moment focuses attention on one decision or behavior. The learner can move from a prompt to a key idea and apply it without navigating a larger course.",
      scene: `<div class="cp-mini-app cp-mini-micro"><div class="cp-mini-top"><span>MICROLEARNING</span><span id="miniMicroCount">01 / 02</span></div><div class="cp-mini-micro-card"><span class="cp-mini-micro-icon">?</span><div><small id="miniMicroLabel">QUICK PROMPT</small><strong id="miniMicroTitle">What is the first move?</strong><p id="miniMicroBody">A customer reports delays between teams.</p></div></div><div class="cp-mini-micro-dots"><i class="is-current"></i><i></i></div><button type="button" data-mini-action="micro">Reveal one useful idea →</button><div class="cp-mini-reveal" hidden role="status">Ask where the handoff breaks before proposing a solution.</div></div>`
    },
    interaction: {
      kicker: "One decision to practice",
      heading: "An interaction can rehearse a choice.",
      description: "A standalone scenario lets someone try a decision and see its consequence. It does not need modules or a formal completion record when the goal is focused practice.",
      scene: `<div class="cp-mini-app cp-mini-interaction"><div class="cp-mini-top"><span>DECISION PRACTICE</span><span>ONE SCENARIO</span></div><div class="cp-mini-scenario"><span>Customer cue</span><strong>“Our handoffs keep slowing us down.”</strong></div><div class="cp-mini-choice"><button type="button" data-mini-choice="ask">Ask where the delay occurs</button><button type="button" data-mini-choice="promise">Promise a fix immediately</button></div><div class="cp-mini-reveal" hidden role="status"></div></div>`
    },
    course: {
      kicker: "Focused learning experience",
      heading: "One course can develop one coherent capability.",
      description: "A course brings explanation, examples, practice, and a check around a defined objective. It may stand alone or later become one part of a larger path.",
      scene: `<div class="cp-mini-app cp-mini-course"><div class="cp-mini-top"><span>COURSE PLAYER</span><span>02 / 03</span></div><div class="cp-mini-lesson"><span class="cp-mini-play">▶</span><div><strong>One focused objective</strong><small>Explain → example → apply</small></div></div><div class="cp-mini-question">A customer raises a new concern. First move?</div><button type="button" data-mini-action="course">Choose: ask a clarifying question</button><div class="cp-mini-reveal" hidden role="status">✓ Practice checked; continue to the next lesson</div></div>`
    }
  };
  const scaleWorkspace = document.querySelector(".cp-scale-workspace");
  if (scaleWorkspace) bindTabs(scaleWorkspace, (key, tab) => {
    const data = scale[key];
    document.getElementById("scale-panel").setAttribute("aria-labelledby", tab.id);
    document.getElementById("scaleKicker").textContent = data.kicker;
    document.getElementById("scaleHeading").textContent = data.heading;
    document.getElementById("scaleDescription").textContent = data.description;
    const diagram = document.getElementById("scaleDemo");
    diagram.dataset.solution = key;
    diagram.dataset.progressStep = "2";
    diagram.classList.remove("is-explored");
    const solutionNames = { quick: "job aid", micro: "microlearning card", interaction: "decision practice", course: "course player" };
    diagram.setAttribute("aria-label", `Illustrative ${solutionNames[key]} learner view`);
    diagram.innerHTML = data.scene;
    if (key !== "interaction") {
      const action = diagram.querySelector("[data-mini-action]");
      const reveal = diagram.querySelector(".cp-mini-reveal");
      reveal.id = "miniReveal";
      action.setAttribute("aria-controls", reveal.id);
      action.setAttribute("aria-expanded", "false");
    }
    diagram.querySelectorAll("[data-mini-choice]").forEach((choice) => choice.setAttribute("aria-pressed", "false"));
    diagram.querySelector("[data-mini-action]")?.addEventListener("click", (event) => {
      const reveal = diagram.querySelector(".cp-mini-reveal");
      if (key === "micro") {
        const next = !diagram.classList.contains("is-explored");
        diagram.classList.toggle("is-explored", next);
        diagram.querySelector("#miniMicroCount").textContent = next ? "02 / 02" : "01 / 02";
        diagram.querySelector("#miniMicroLabel").textContent = next ? "KEY IDEA" : "QUICK PROMPT";
        diagram.querySelector("#miniMicroTitle").textContent = next ? "Clarify the gap first" : "What is the first move?";
        diagram.querySelector("#miniMicroBody").textContent = next ? "Ask where the handoff breaks before proposing a solution." : "A customer reports delays between teams.";
        event.currentTarget.textContent = next ? "Back to prompt ↶" : "Reveal one useful idea →";
        event.currentTarget.setAttribute("aria-expanded", String(next));
        reveal.hidden = !next;
        return;
      }
      reveal.hidden = false;
      event.currentTarget.setAttribute("aria-expanded", "true");
      diagram.classList.add("is-explored");
    });
    diagram.querySelectorAll("[data-mini-choice]").forEach((button) => button.addEventListener("click", () => {
      diagram.querySelectorAll("[data-mini-choice]").forEach((choice) => {
        choice.classList.toggle("is-chosen", choice === button);
        choice.setAttribute("aria-pressed", String(choice === button));
      });
      const reveal = diagram.querySelector(".cp-mini-reveal");
      reveal.hidden = false;
      reveal.textContent = button.dataset.miniChoice === "ask" ? "Good decision: clarify the need before positioning." : "Try the discovery question first; the solution fit is not known yet.";
    }));
  });
  if (scaleWorkspace) scaleWorkspace.querySelector('[data-cp-tab="quick"]').click();

  const learner = {
    route: {
      title: "Choose a route",
      caption: "A route that fits the learner",
      copy: "Role-based entry points connect shared content with what each audience needs to do next.",
      count: "01 / 04",
      progress: "25%",
      screen: `<div class="cp-learner-ui"><p class="cp-ui-kicker">ILLUSTRATIVE LEARNER VIEW</p><h4>Choose your learning route</h4><p class="cp-ui-intro">Start with the shared foundation, then follow the route for your role.</p><div class="cp-ui-card"><div class="cp-ui-card-top"><span class="cp-ui-symbol">↗</span><strong>Seller pathway</strong></div><span>Build product context and practice customer conversations.</span><button type="button" class="cp-ui-action" data-next-learner="module">Open seller route <span aria-hidden="true">→</span></button></div><div class="cp-ui-muted">Partner route available for channel learners</div></div>`
    },
    module: {
      title: "Open a module",
      caption: "Content and resources in context",
      copy: "The learner opens one module with a clear objective, supporting material, and a next action.",
      count: "02 / 04",
      progress: "50%",
      screen: `<div class="cp-learner-ui"><p class="cp-ui-kicker">MODULE 02 / PRACTICE</p><h4>Customer situations</h4><p class="cp-ui-intro">A customer mentions delays between teams. What would you do first?</p><div class="cp-ui-choice-list"><button type="button" data-practice-choice="explore">Ask where the handoff breaks</button><button type="button" data-practice-choice="promise">Promise a solution before discovery</button></div><div class="cp-ui-feedback" id="practiceFeedback" hidden role="status"></div><button type="button" class="cp-ui-action" data-next-learner="progress" hidden id="practiceContinue">Continue to progress <span aria-hidden="true">→</span></button></div>`
    },
    progress: {
      title: "Validate progress",
      caption: "Practice leads into validation",
      copy: "A clear record shows what is complete, while the final check confirms whether the learner can apply the material.",
      count: "03 / 04",
      progress: "75%",
      screen: `<div class="cp-learner-ui"><p class="cp-ui-kicker">PATHWAY PROGRESS</p><h4>Ready for the final check</h4><div class="cp-ui-progress-list"><span>✓ Foundation</span><span>✓ Customer situations</span><span class="is-current">○ Final assessment</span></div><button type="button" class="cp-ui-action" data-learner-action="open-assessment">Open final check <span aria-hidden="true">→</span></button><div class="cp-ui-assessment" id="demoAssessment" hidden><p>What should ground a seller's positioning?</p><div class="cp-ui-choice-list"><button type="button" data-assessment-choice="approved">Approved information and the customer's need</button><button type="button" data-assessment-choice="assumed">An unverified product claim</button></div><div class="cp-ui-feedback" id="assessmentFeedback" hidden role="status"></div><button type="button" class="cp-ui-action" data-next-learner="milestone" hidden id="assessmentContinue">View completion <span aria-hidden="true">→</span></button></div></div>`
    },
    milestone: {
      title: "Confirm completion",
      caption: "Completion with a purpose",
      copy: "The final state is visible to the learner and should resolve correctly in the LMS record and reporting.",
      count: "04 / 04",
      progress: "100%",
      screen: `<div class="cp-learner-ui cp-ui-completion"><p class="cp-ui-kicker">PATHWAY MILESTONE</p><div class="cp-ui-seal" aria-hidden="true">✓</div><h4>Certification complete</h4><p class="cp-ui-intro">The learner can see the milestone and what to do next.</p><button type="button" class="cp-ui-action" data-learner-action="record">View completion record <span aria-hidden="true">→</span></button><div class="cp-ui-record" id="demoRecord" hidden><strong>Completion recorded</strong><span>Certificate status: available</span></div></div>`
    }
  };
  const demo = document.querySelector(".cp-learner-demo");
  function renderLearner(key, tab) {
    const data = learner[key];
    const screen = document.getElementById("learnerScreen");
    screen.setAttribute("aria-labelledby", tab.id);
    screen.classList.remove("is-entering");
    void screen.offsetWidth;
    screen.classList.add("is-entering");
    document.getElementById("demoInterface").outerHTML = `<div id="demoInterface">${data.screen}</div>`;
    document.getElementById("demoWindowTitle").textContent = data.title;
    document.getElementById("demoCaptionTitle").textContent = data.caption;
    document.getElementById("demoCaption").textContent = data.copy;
    const foundations = {
      route: ["A route that fits the audience", "Role-based entry keeps the experience relevant. Learners see the shared core and a clear next step for their responsibilities, so the pathway feels coherent from the start."],
      module: ["Practice makes the route useful", "A pathway needs a chance to apply information to the learner's real decisions. Focused feedback lets someone adjust their reasoning before the formal check."],
      progress: ["Visible progress supports trust", "Clear status and a meaningful assessment gate help learners understand what remains. The check verifies applied judgment and gives the organization more than a screen-view count."],
      milestone: ["The outcome has to carry forward", "A visible milestone gives the learner a reason to finish and a next step. The LMS record makes completion usable for support, reporting, qualification, or access decisions."]
    };
    document.getElementById("anatomyFoundationTitle").textContent = foundations[key][0];
    document.getElementById("anatomyFoundationCopy").textContent = foundations[key][1];
    document.querySelectorAll(".cp-anatomy-foundation-rail i").forEach((item, index) => item.classList.toggle("is-current", index === ["route","module","progress","milestone"].indexOf(key)));
    document.getElementById("demoStepCount").textContent = data.count;
    document.getElementById("demoProgressFill").style.width = data.progress;
    screen.querySelectorAll("[data-next-learner]").forEach((button) => button.addEventListener("click", () => {
      const target = demo.querySelector(`[data-cp-tab="${button.dataset.nextLearner}"]`);
      if (target) {
        target.click();
        screen.querySelector(".cp-ui-choice-list button:not([hidden]), .cp-ui-action:not([hidden])")?.focus();
      }
    }));
    screen.querySelectorAll("[data-practice-choice]").forEach((button) => button.addEventListener("click", () => {
      const correct = button.dataset.practiceChoice === "explore";
      screen.querySelectorAll("[data-practice-choice]").forEach((choice) => choice.classList.toggle("is-chosen", choice === button));
      const feedback = screen.querySelector("#practiceFeedback");
      feedback.hidden = false;
      feedback.textContent = correct ? "Good decision. Clarify the handoff before positioning a solution." : "Check the need first. Do not promise a fit before discovery.";
      screen.querySelector("#practiceContinue").hidden = !correct;
    }));
    screen.querySelector('[data-learner-action="open-assessment"]')?.addEventListener("click", (event) => {
      screen.querySelector("#demoAssessment").hidden = false;
      event.currentTarget.hidden = true;
      screen.querySelector("[data-assessment-choice]")?.focus();
    });
    screen.querySelectorAll("[data-assessment-choice]").forEach((button) => button.addEventListener("click", () => {
      const correct = button.dataset.assessmentChoice === "approved";
      screen.querySelectorAll("[data-assessment-choice]").forEach((choice) => choice.classList.toggle("is-chosen", choice === button));
      const feedback = screen.querySelector("#assessmentFeedback");
      feedback.hidden = false;
      feedback.textContent = correct ? "Correct. Positioning should use approved information and the customer's stated need." : "An unverified claim cannot support a reliable recommendation.";
      screen.querySelector("#assessmentContinue").hidden = !correct;
    }));
    screen.querySelector('[data-learner-action="record"]')?.addEventListener("click", (event) => {
      screen.querySelector("#demoRecord").hidden = false;
      event.currentTarget.setAttribute("aria-expanded", "true");
    });
  }
  if (demo) {
    bindTabs(demo, renderLearner);
    renderLearner("route", demo.querySelector('[data-cp-tab="route"]'));
  }

  const weight = {
    records: {
      kicker: "Records + compliance",
      heading: "Completion must mean something trustworthy.",
      description: "Some pathways generate records an organization needs to retain, track, audit, or report. Assessment status, completion rules, certification, and LMS data must agree.",
      takeaway: "I design the assessment and delivery logic with that record in mind.",
      scene: `<div class="cp-record-visual"><span class="cp-record-row"><b>Enrollment</b><i class="is-done"></i></span><span class="cp-record-row"><b>Assessment</b><i class="is-done"></i></span><span class="cp-record-row"><b>Completion</b><i class="is-done"></i></span><span class="cp-record-stamp">VERIFIED RECORD</span></div>`
    },
    next: {
      kicker: "Next-step readiness",
      heading: "A milestone changes what a learner can do.",
      description: "Completion may qualify someone for new responsibilities, access, an opportunity, or the next step in a job process. In sales enablement, it can establish a common foundation for seller and partner conversations.",
      takeaway: "I make the required learning and the completion threshold clear before someone reaches the gate.",
      scene: `<div class="cp-unlock-visual"><div class="cp-unlock-path"><span class="cp-unlock-step">LEARNING</span><span class="cp-unlock-step">ASSESSMENT</span><span class="cp-unlock-step cp-unlock-gate"><img src="${icon("mini-shield")}" alt="">QUALIFIED</span></div><div class="cp-unlock-open"><img src="${icon("mini-certificate")}" alt=""><strong>Next responsibility</strong></div></div>`
    },
    governance: {
      kicker: "Governance + delivery",
      heading: "More moving parts require clear ownership.",
      description: "SME oversight, stakeholder review, source management, launch planning, LMS sequencing, prerequisites, audience assignments, integrations, and assessment rules all affect whether the path works as intended.",
      takeaway: "I track decisions and review boundaries so a product change reaches the right course, rule, and audience.",
      scene: `<div class="cp-governance-visual"><div class="cp-governance-source"><span>SME source</span><span>Business scope</span><span>Audience</span></div><div class="cp-governance-center"><img src="${icon("mini-hierarchy")}" alt=""><strong>Approved pathway</strong></div><div class="cp-governance-target"><span>LMS rules</span><span>Launch</span><span>Review history</span></div></div>`
    },
    visibility: {
      kicker: "Reporting + support",
      heading: "An incomplete record can block the next step.",
      description: "Reporting reveals when a learner has not finished a required assessment or when completion fails to record. I investigate the learning, delivery, and support signals before a missing milestone stalls what comes next.",
      takeaway: "I use reporting and learner support to locate the blocker, then confirm the completion record is accurate.",
      scene: `<div class="cp-visibility-visual"><div class="cp-visibility-dashboard"><span>PROGRAM VIEW</span><div class="cp-visibility-status"><strong>Learning 2 / 3 complete</strong><span>Assessment pending</span></div><div class="cp-visibility-progress"><i></i></div><div class="cp-visibility-blocked"><span class="cp-visibility-lock" aria-hidden="true"><img src="../../../assets/icons/pixel/lms-admin/general/security-lock.png" alt=""></span><strong>Next step locked</strong><small>Required learning incomplete</small></div></div><div class="cp-visibility-ticket"><img src="${icon("mini-headset")}" alt=""><span><strong>Support investigates</strong><small>Learning or record issue?</small></span></div></div>`
    }
  };
  const weightWorkspace = document.querySelector(".cp-weight-layout");
  if (weightWorkspace) bindTabs(weightWorkspace, (key, tab) => {
    const data = weight[key];
    document.getElementById("weight-panel").setAttribute("aria-labelledby", tab.id);
    document.getElementById("weightKicker").textContent = data.kicker;
    document.getElementById("weightHeading").textContent = data.heading;
    document.getElementById("weightDescription").textContent = data.description;
    document.getElementById("weightTakeaway").textContent = data.takeaway;
    document.getElementById("weightScene").innerHTML = data.scene;
  });

  const frame = (title, body) => `<div class="cp-pov-frame"><div class="cp-pov-bar"><span class="cp-browser-dots" aria-hidden="true"><i></i><i></i><i></i></span><strong>${title}</strong><small>ILLUSTRATIVE</small></div><div class="cp-pov-body">${body}</div></div>`;
  const life = {
    design: {
      kicker: "01 / Design · Learning designer view",
      heading: "Start with the job and work backward.",
      description: "I define the audience, decisions learners must make, approved sources, role routes, objectives, practice, assessment, and completion standard before the build becomes a collection of screens.",
      move: "Keep technical depth that is useful as a resource; make required learning follow the seller task.",
      output: "A pathway map with clear objectives, audience routes, review points, and validation gates.",
      scene: `<div class="cp-life-visual-inner cp-scene-design" aria-hidden="true"><div class="cp-design-source"><span>Audience</span><span>Seller task</span><span>Approved source</span></div><div class="cp-design-bridge"></div><div class="cp-design-map"><div class="cp-design-map-head">PATHWAY MAP</div><div><i></i><b>Understand</b></div><div><i></i><b>Practice</b></div><div><i></i><b>Validate</b></div><div><i></i><b>Complete</b></div></div></div>`
    },
    delivery: {
      kicker: "02 / Delivery · Learner view",
      heading: "Make the route work where learning happens.",
      description: "Publishing is only one step. I check course launch, the order of modules, learner communications, prerequisites, assessment behavior, and whether a learner can actually reach the intended completion state.",
      move: "Walk the path as a learner instead of assuming a successful upload means successful delivery.",
      output: "A visible route from enrollment to the milestone, tested in the LMS.",
      scene: frame("Learner pathway", `<div class="cp-pov-sidebar">HOME<br>MY LEARNING<br>RESOURCES</div><div class="cp-delivery-main"><div class="cp-delivery-top"><span>Sales certification</span><b>IN PROGRESS</b></div><div class="cp-delivery-row is-checked">✓ <span>Portfolio foundation</span></div><div class="cp-delivery-row is-current">▶ <span>Customer situations</span><b>READY</b></div><div class="cp-delivery-row">○ <span>Final assessment</span></div></div>`)
    },
    admin: {
      kicker: "03 / Administration · LMS administrator view",
      heading: "Configure the path behind the screens.",
      description: "I account for enrollment, audience assignment, sequencing, prerequisites, certification rules, completion logic, LMS integrations, and the data those settings need to produce.",
      move: "Check that the rules reflect the intended learner journey, not only a convenient LMS default.",
      output: "Audience routes and completion records that behave as designed.",
      scene: frame("Pathway rules", `<div class="cp-admin-grid"><div><small>AUDIENCE</small><strong>Internal sellers + partners</strong></div><div><small>ROUTE</small><strong>Shared core → regional path</strong></div><div><small>ASSESSMENT</small><strong>Required before certificate</strong></div><div class="cp-admin-toggle"><small>COMPLETION RECORD</small><strong>✓ Enabled</strong></div></div>`)
    },
    support: {
      kicker: "04 / Support · Learner and administrator view",
      heading: "Remove blockers that keep people from progressing.",
      description: "I have supported access and enrollment, navigation, assessment questions, completion records, certification status, and other LMS issues that affect the learner's next step.",
      move: "Trace the reported problem from learner screen to underlying rule or record before changing content.",
      output: "A resolved blocker and a documented pattern to prevent recurrence.",
      scene: frame("Learner support", `<div class="cp-support-ticket"><div class="cp-ticket-head"><span>EXAMPLE ISSUE</span><b class="cp-ticket-status">Open</b></div><p>Assessment complete; certificate not showing.</p><div class="cp-ticket-trace"><span>Assessment ✓</span><span>Completion rule ?</span><span>Record ✓</span></div></div>`)
    },
    reporting: {
      kicker: "05 / Reporting · Program view",
      heading: "Look beyond a course launch count.",
      description: "I use enrollment, progress, completions, assessment behavior, certification, learner feedback, and adoption signals to understand whether the path is working and where people stall.",
      move: "Separate a learner-performance signal from an access, assignment, or completion-logic issue.",
      output: "A clearer question for the next review and a visible record of program health.",
      scene: frame("Example pathway report", `<div class="cp-report-summary"><div><small>ENROLLED</small><strong>▰▰▰▰▰</strong></div><div><small>IN PROGRESS</small><strong>▰▰▰▱▱</strong></div><div><small>COMPLETE</small><strong>▰▰▱▱▱</strong></div></div><div class="cp-report-chart"><span>Module 1</span><i style="--bar:90%"></i><span>Practice</span><i style="--bar:68%"></i><span>Assessment</span><i style="--bar:47%"></i></div>`)
    },
    maintenance: {
      kicker: "06 / Maintenance · Source-owner view",
      heading: "Change the right piece without breaking the route.",
      description: "Product names, technical details, messaging, audience needs, and organizational ownership can change after launch. I keep source files, versions, review history, and reusable patterns organized so revisions stay controlled.",
      move: "Trace a source change through modules, resources, assessments, and LMS-facing labels.",
      output: "A targeted revision with approval history and no stale downstream copy.",
      scene: frame("Change impact", `<div class="cp-version-compare"><div><small>EXAMPLE SOURCE CHANGE</small><strong>Updated portfolio term</strong></div><span class="cp-version-arrow">→</span><div><small>AFFECTED ITEMS</small><strong>Module · Resource · Question</strong></div></div>`)
    },
    improvement: {
      kicker: "07 / Improvement · Program review view",
      heading: "Use evidence to make the next version better.",
      description: "Learner feedback, assessment patterns, support issues, reporting, and stakeholder review identify what deserves investigation. I translate signals into a testable change and verify the experience again.",
      move: "Name the issue and its likely cause before choosing a new asset or interaction.",
      output: "An improvement with a rationale, owner, and follow-up check.",
      scene: frame("Improvement review", `<div class="cp-improve-board"><div><small>SIGNAL</small><strong>Repeated learner question</strong></div><div><small>DIAGNOSIS</small><strong>Term lacks context</strong></div><div><small>REVISION</small><strong>Plain-language example</strong></div><div><small>VERIFY</small><strong>Retest + monitor</strong></div></div>`)
    }
  };
  const lifecycle = document.querySelector(".cp-lifecycle-workspace");
  if (lifecycle) bindTabs(lifecycle, (key, tab) => {
    const data = life[key];
    document.getElementById("life-panel").setAttribute("aria-labelledby", tab.id);
    document.getElementById("lifeKicker").textContent = data.kicker;
    document.getElementById("lifeHeading").textContent = data.heading;
    document.getElementById("lifeDescription").textContent = data.description;
    document.getElementById("lifeMove").textContent = data.move;
    document.getElementById("lifeOutput").textContent = data.output;
    const visual = document.getElementById("lifeVisual");
    const stageIndex = [...lifecycle.querySelectorAll(".cp-life-tab")].indexOf(tab);
    lifecycle.style.setProperty("--cp-stage-width", `${stageIndex * 14.33}%`);
    lifecycle.style.setProperty("--cp-progress-pct", `${stageIndex * 100 / 6}%`);
    visual.innerHTML = data.scene;
    visual.dataset.stage = key;
    visual.classList.remove("is-playing");
    void visual.offsetWidth;
    visual.classList.add("is-playing");
  });

  if (lifecycle) {
    lifecycle.querySelector('[data-cp-tab="design"]').click();
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const lifecycleObserver = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        lifecycle.querySelector('.cp-life-tab.is-active')?.click();
        lifecycleObserver.disconnect();
      }, { threshold: .25 });
      lifecycleObserver.observe(lifecycle);
    }
  }

  const featured = document.querySelector(".cp-featured-preview");
  if (featured && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    featured.classList.add("is-motion-ready");
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      featured.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(featured);
  }
})();
