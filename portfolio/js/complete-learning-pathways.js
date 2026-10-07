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

  const film = document.getElementById("solutionFilm");
  if (film) {
    const filmScenes = [
      {kind:"POINT OF NEED", title:"Job aid", description:"One answer at the moment of need.", difference:"It does not sequence courses or award a completion milestone.", visual:`<div class="cp-film-device cp-film-aid"><div class="cp-film-device-top"><img src="${icon('mini-document')}" alt=""><span>Quick reference</span></div><div class="cp-film-search">⌕ &nbsp; Find the approved answer</div><div class="cp-film-aid-result"><i></i><span>Clarify the handoff</span><b>↗</b></div></div>`},
      {kind:"ONE LEARNING GOAL", title:"Microlearning", description:"One short lesson targets a specific need.", difference:"It can be part of a pathway, but does not provide the full course sequence or final gate by itself.", visual:`<div class="cp-film-device cp-film-micro"><div class="cp-film-device-top"><img src="${icon('mini-book')}" alt=""><span>Micro lesson</span></div><div class="cp-film-micro-question">What is the first move?</div><div class="cp-film-micro-answer"><img src="${icon('mini-chat')}" alt=""><span>Ask where the delay occurs</span></div></div>`},
      {kind:"ONE DECISION", title:"Single interaction", description:"A learner makes one choice and sees feedback.", difference:"It provides practice, while a pathway connects practice to courses, assessment, and a recorded outcome.", visual:`<div class="cp-film-device cp-film-decision"><div class="cp-film-device-top"><img src="${icon('mini-user')}" alt=""><span>Decision practice</span></div><div class="cp-film-decision-path"><span>Customer signal</span><i>→</i><span>Choose response</span><i>→</i><span>Feedback</span></div><div class="cp-film-choice-highlight"><img src="${icon('mini-verified')}" alt=""> Ask a discovery question</div></div>`},
      {kind:"ONE COURSE", title:"Focused course", description:"One course develops a defined capability.", difference:"A pathway connects multiple courses and activities to a shared completion requirement.", visual:`<div class="cp-film-device cp-film-course"><div class="cp-film-device-top"><img src="${icon('mini-book')}" alt=""><span>Course player</span></div><div class="cp-film-course-steps"><span><img src="${icon('mini-document')}" alt="">Explain</span><i>→</i><span><img src="${icon('mini-chat')}" alt="">Practice</span><i>→</i><span><img src="${icon('mini-document-list')}" alt="">Check</span></div></div>`}
    ];
    let filmIndex = 0;
    let filmTimer = 0;
    let filmPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionToggle = document.getElementById("solutionMotionToggle");
    const updateMotionToggle = () => {
      motionToggle.textContent = filmPaused ? "Play motion" : "Pause motion";
      motionToggle.setAttribute("aria-pressed", String(filmPaused));
    };
    const renderFilm = (index) => {
      filmIndex = index;
      const scene = filmScenes[index];
      document.getElementById("solutionCount").textContent = `${String(index + 1).padStart(2,"0")} / 04`;
      document.getElementById("solutionKind").textContent = scene.kind;
      document.getElementById("solutionTitle").textContent = scene.title;
      document.getElementById("solutionDescription").textContent = scene.description;
      document.getElementById("solutionDifference").textContent = scene.difference;
      document.getElementById("solutionStage").innerHTML = scene.visual;
      film.querySelectorAll(".cp-film-timeline i").forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      film.dataset.scene = String(index);
    };
    renderFilm(0);
    const startFilm = () => {
      if (filmTimer || filmPaused) return;
      renderFilm(filmIndex);
      filmTimer = window.setInterval(() => renderFilm((filmIndex + 1) % filmScenes.length), 4200);
    };
    const stopFilm = () => { window.clearInterval(filmTimer); filmTimer = 0; };
    updateMotionToggle();
    motionToggle.addEventListener("click", () => {
      filmPaused = !filmPaused;
      updateMotionToggle();
      if (filmPaused) stopFilm();
      else startFilm();
    });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => entries[0].isIntersecting ? startFilm() : stopFilm(), {threshold:.2});
      observer.observe(film);
    } else startFilm();
  }

  const learner = {
    route: {title:"Choose a route", caption:"Different roles, different learning", copy:"The seller and partner routes use different tasks, resources, and checks.", foundation:"Start with the role", why:"I decide what each audience needs to do, then build its content and validation around that work.", screen:`<div class="cp-learner-ui cp-guided-ui"><p class="cp-ui-kicker">START / CHOOSE YOUR ROLE</p><h4>Which route fits your work?</h4><div class="cp-route-choices"><button type="button" data-route="seller"><img src="${icon('mini-user')}" alt=""><strong>Seller</strong><span>Diagnose a customer need</span></button><button type="button" data-route="partner"><img src="${icon('mini-audience')}" alt=""><strong>Partner</strong><span>Prepare approved resources</span></button></div><div class="cp-ui-motion-line" aria-hidden="true"><i></i></div></div>`},
    module: {title:"Set the priority", caption:"Practice before the check", copy:"A small decision makes the learner apply the concept before assessment.", foundation:"Practice turns information into judgment", why:"Learners make a decision with feedback while the stakes are low. This gives them a reason to use the information instead of only reading it.", screen:`<div class="cp-learner-ui cp-guided-ui"><p class="cp-ui-kicker">PRACTICE / CUSTOMER SIGNAL</p><h4>Remote teams keep losing service.</h4><div class="cp-priority-scene"><img src="${icon('mini-analytics')}" alt=""><div class="cp-priority-waves" aria-hidden="true"><i></i><i></i><i></i></div><img src="${icon('mini-user')}" alt=""></div><label class="cp-range-label" for="priorityRange">What matters most?</label><div class="cp-range-ends"><span>Fast setup</span><span>Reliable reach</span></div><input id="priorityRange" type="range" min="0" max="100" value="50" aria-label="Slide toward reliable reach for remote teams"><div class="cp-range-meter" aria-hidden="true"><i id="priorityMeter"></i></div><p class="cp-guided-feedback" id="priorityFeedback" role="status">Move the slider toward the stronger priority.</p></div>`},
    progress: {title:"Match the evidence", caption:"Validation of applied reasoning", copy:"The learner connects a signal to the outcome it supports.", foundation:"Evidence makes the check meaningful", why:"Matching the customer signal to a defensible outcome checks whether the learner can use the idea in context. The result is more informative than completion alone.", screen:`<div class="cp-learner-ui cp-guided-ui"><p class="cp-ui-kicker">CHECK / MATCH THE SIGNAL</p><h4>Match each signal to an outcome.</h4><div class="cp-match-board"><div class="cp-match-sources"><button type="button" draggable="true" data-match-source="coverage"><img src="${icon('mini-analytics')}" alt=""><span>Dropouts</span></button><button type="button" draggable="true" data-match-source="security"><img src="${icon('mini-shield')}" alt=""><span>Sensitive data</span></button></div><div class="cp-match-connectors" aria-hidden="true"><i></i><i></i></div><div class="cp-match-targets"><button type="button" data-match-target="security"><img src="${icon('mini-database')}" alt=""><span>Protected access</span></button><button type="button" data-match-target="coverage"><img src="${icon('mini-verified')}" alt=""><span>Reliable reach</span></button></div></div><p class="cp-guided-feedback" id="matchFeedback" role="status">Drag an icon to an outcome, or select both.</p></div>`},
    milestone: {title:"Milestone earned", caption:"Completion with a purpose", copy:"The milestone is visible and the completion record is ready for the next step.", foundation:"Completion carries forward", why:"The learner sees why the route mattered. A trustworthy record makes that milestone usable for support, reporting, qualification, or access decisions.", screen:`<div class="cp-learner-ui cp-guided-ui cp-guided-complete"><p class="cp-ui-kicker">PATHWAY COMPLETE</p><div class="cp-complete-burst" aria-hidden="true"><i></i><i></i><i></i><img src="${icon('mini-certificate')}" alt=""></div><h4>Ready for the next step</h4><div class="cp-complete-record"><img src="${icon('mini-database')}" alt=""><span>Completion recorded</span><b>✓</b></div><button type="button" class="cp-ui-action" data-reset-learner>Reset ↺</button></div>`}
  };
  const partnerLearner = {
    module: {title:"Choose partner resources", caption:"Build from approved materials", copy:"Partners select the current product brief and channel conversation guide before sharing a customer-facing message.", foundation:"Give partners their own content", why:"This route starts with approved channel materials. The seller route starts with diagnosing a customer need.", screen:`<div class="cp-learner-ui cp-guided-ui"><p class="cp-ui-kicker">PARTNER / RESOURCE SET</p><h4>Which materials belong in your kit?</h4><div class="cp-partner-resources"><button type="button" data-partner-resource="brief"><img src="${icon('mini-document')}" alt=""><strong>Current product brief</strong></button><button type="button" data-partner-resource="guide"><img src="${icon('mini-chat')}" alt=""><strong>Channel conversation guide</strong></button><button type="button" data-partner-resource="old"><img src="${icon('mini-book')}" alt=""><strong>Old slide deck</strong></button></div><p class="cp-guided-feedback" id="partnerResourceFeedback" role="status">Choose the two current resources.</p></div>`},
    progress: {title:"Review the partner handoff", caption:"Check before sharing", copy:"Partners check the approved message and version before handing material to a customer.", foundation:"Assess the partner decision", why:"The partner check is about using current, approved material. It differs from the seller's evidence-matching task.", screen:`<div class="cp-learner-ui cp-guided-ui"><p class="cp-ui-kicker">PARTNER / HANDOFF CHECK</p><h4>A customer asks for a summary. What comes first?</h4><div class="cp-partner-handoff"><button type="button" data-partner-answer="correct"><img src="${icon('mini-verified')}" alt=""><span>Confirm the current approved message and version</span></button><button type="button" data-partner-answer="old"><img src="${icon('mini-document')}" alt=""><span>Send the deck saved from the last launch</span></button></div><p class="cp-guided-feedback" id="partnerHandoffFeedback" role="status">Choose how you would prepare the handoff.</p></div>`},
    milestone: {title:"Partner route complete", caption:"Partner enablement recorded", copy:"The partner completed a resource and handoff check suited to the channel role.", foundation:"Record the right completion", why:"The partner route confirms approved resources and a sound handoff. The seller route confirms customer diagnosis and evidence use.", screen:`<div class="cp-learner-ui cp-guided-ui cp-guided-complete"><p class="cp-ui-kicker">PARTNER ROUTE COMPLETE</p><div class="cp-complete-burst" aria-hidden="true"><i></i><i></i><i></i><img src="${icon('mini-certificate')}" alt=""></div><h4>Ready for a customer handoff</h4><div class="cp-complete-record"><img src="${icon('mini-database')}" alt=""><span>Partner completion recorded</span><b>✓</b></div><button type="button" class="cp-ui-action" data-reset-learner>Choose another route ↺</button></div>`}
  };
  const demo = document.querySelector(".cp-learner-demo");
  let learnerTimer = 0;
  let selectedMatch = "";
  let selectedRoute = "seller";
  const renderLearner = (key) => {
    if (!demo) return;
    window.clearTimeout(learnerTimer);
    selectedMatch = "";
    const data = key === "route" ? learner.route : selectedRoute === "partner" ? partnerLearner[key] : learner[key];
    const screen = document.getElementById("learnerScreen");
    screen.setAttribute("aria-label", data.title);
    screen.classList.remove("is-entering");
    void screen.offsetWidth;
    screen.classList.add("is-entering");
    screen.innerHTML = `<div id="demoInterface">${data.screen}</div>`;
    document.getElementById("demoWindowTitle").textContent = data.title;
    document.getElementById("demoCaptionTitle").textContent = data.caption;
    document.getElementById("demoCaption").textContent = data.copy;
    document.getElementById("demoChangeRoute").hidden = key === "route";
    document.getElementById("anatomyFoundationTitle").textContent = data.foundation;
    document.getElementById("anatomyFoundationCopy").textContent = data.why;
    const index = ["route","module","progress","milestone"].indexOf(key);
    document.getElementById("demoStepCount").textContent = `${String(index+1).padStart(2,"0")} / 04`;
    document.getElementById("demoProgressFill").style.width = `${(index+1)*25}%`;
    demo.querySelectorAll("[data-learner-step]").forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
      step.classList.toggle("is-complete", stepIndex < index);
      if (stepIndex === index) step.setAttribute("aria-current", "step"); else step.removeAttribute("aria-current");
    });
    const stepLabels = key === "route" ? ["Choose route", "Role task", "Role check", "Milestone"] : selectedRoute === "partner" ? ["Choose route", "Choose resources", "Review handoff", "Partner milestone"] : ["Choose route", "Set priority", "Match evidence", "Seller milestone"];
    demo.querySelectorAll(".cp-demo-step-label").forEach((label, labelIndex) => { label.textContent = stepLabels[labelIndex + 1]; });
    document.querySelectorAll(".cp-anatomy-foundation-rail i").forEach((item, itemIndex) => item.classList.toggle("is-current", itemIndex === index));
    if (key === "route") {
      screen.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => {
        selectedRoute = button.dataset.route;
        button.classList.add("is-selected");
        learnerTimer = window.setTimeout(() => renderLearner("module"), 450);
      }));
    }
    if (key === "module" && selectedRoute === "partner") {
      const chosen = new Set();
      const feedback = screen.querySelector("#partnerResourceFeedback");
      screen.querySelectorAll("[data-partner-resource]").forEach((button) => button.addEventListener("click", () => {
        const resource = button.dataset.partnerResource;
        if (resource === "old") {
          feedback.classList.add("is-wrong");
          feedback.textContent = "That deck may be out of date. Use the current resources.";
          return;
        }
        chosen.add(resource);
        button.classList.add("is-selected");
        feedback.classList.remove("is-wrong");
        feedback.textContent = chosen.size === 2 ? "Resource kit ready. Moving to the handoff check…" : "Choose one more current resource.";
        if (chosen.size === 2) learnerTimer = window.setTimeout(() => renderLearner("progress"), 850);
      }));
    }
    if (key === "module" && selectedRoute === "seller") {
      const range = screen.querySelector("#priorityRange");
      const feedback = screen.querySelector("#priorityFeedback");
      range.addEventListener("input", () => {
        const value = Number(range.value);
        screen.querySelector("#priorityMeter").style.width = `${value}%`;
        feedback.classList.toggle("is-wrong", value < 70);
        feedback.textContent = value >= 70 ? "Reliable reach fits this need. Moving to the check…" : "Remote teams need dependable coverage. Keep sliding.";
        window.clearTimeout(learnerTimer);
        if (value >= 70) learnerTimer = window.setTimeout(() => renderLearner("progress"), 850);
      });
    }
    if (key === "progress" && selectedRoute === "partner") {
      const feedback = screen.querySelector("#partnerHandoffFeedback");
      screen.querySelectorAll("[data-partner-answer]").forEach((button) => button.addEventListener("click", () => {
        const correct = button.dataset.partnerAnswer === "correct";
        feedback.classList.toggle("is-wrong", !correct);
        feedback.textContent = correct ? "Current message confirmed. Partner route complete…" : "Check the current approved message before sharing.";
        button.classList.toggle("is-selected", correct);
        if (correct) learnerTimer = window.setTimeout(() => renderLearner("milestone"), 900);
      }));
    }
    if (key === "progress" && selectedRoute === "seller") {
      const feedback = screen.querySelector("#matchFeedback");
      const match = (source, target) => {
        if (!source || !target || source.disabled || target.disabled) return;
        const correct = source.dataset.matchSource === target.dataset.matchTarget;
        source.classList.toggle("is-wrong", !correct);
        target.classList.toggle("is-wrong", !correct);
        if (!correct) {
          feedback.textContent = "That match does not fit. Try another outcome.";
          feedback.classList.add("is-wrong");
          window.setTimeout(() => {source.classList.remove("is-wrong");target.classList.remove("is-wrong");}, 850);
          return;
        }
        feedback.classList.remove("is-wrong");
        feedback.textContent = "Matched. Find the next connection.";
        source.classList.add("is-matched"); target.classList.add("is-matched");
        source.disabled = true; target.disabled = true; selectedMatch = "";
        if ([...screen.querySelectorAll("[data-match-source]")].every((item) => item.disabled)) {
          feedback.textContent = "Both connections confirmed. Milestone unlocked…";
          learnerTimer = window.setTimeout(() => renderLearner("milestone"), 900);
        }
      };
      screen.querySelectorAll("[data-match-source]").forEach((source) => {
        source.addEventListener("click", () => {
          selectedMatch = source.dataset.matchSource;
          screen.querySelectorAll("[data-match-source]").forEach((item) => item.classList.toggle("is-selected", item === source));
          feedback.textContent = "Now choose the matching outcome.";
          feedback.classList.remove("is-wrong");
        });
        source.addEventListener("dragstart", (event) => event.dataTransfer.setData("text/plain", source.dataset.matchSource));
      });
      screen.querySelectorAll("[data-match-target]").forEach((target) => {
        target.addEventListener("click", () => match(screen.querySelector(`[data-match-source="${selectedMatch}"]`), target));
        target.addEventListener("dragover", (event) => event.preventDefault());
        target.addEventListener("drop", (event) => {event.preventDefault();match(screen.querySelector(`[data-match-source="${event.dataTransfer.getData("text/plain")}"]`), target);});
      });
    }
    if (key === "milestone") screen.querySelector("[data-reset-learner]").addEventListener("click", () => renderLearner("route"));
  };
  document.getElementById("demoChangeRoute")?.addEventListener("click", () => renderLearner("route"));
  renderLearner("route");

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
