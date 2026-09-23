(() => {
  'use strict';
  const root = document.querySelector('[data-gh-workflow]');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[data-gh-stage]')];
  tabs.forEach(button => { button.id = `gh-stage-${button.dataset.ghStage}`; });
  const content = {
    scope: {
      label:'01 / Scope',title:'Define the visitor-facing change.',text:'I write down the page, intended behavior, affected files, and review criteria before editing.',gate:'The request has a clear outcome and a way to check it.',alt:'Illustrative issue with acceptance checks and affected pages.',window:'ISSUE / 024',status:'Ready to build',scene:`<div class="gh-ui-heading"><strong>Improve the learner route</strong><span class="gh-ui-pill">Open issue</span></div><span class="gh-ui-label">REQUEST</span><div class="gh-ui-card"><strong>Make the pathway easier to follow</strong><p>Audience: hiring managers and learning leaders. Update the first screen and the route to the case study.</p></div><div class="gh-ui-checks"><span>One visible primary action</span><span>Current assets and page theme retained</span><span>Mobile and reduced-motion states checked</span></div><div class="gh-ui-footer"><span>Labels: learning UX · content</span><b>Owner assigned</b></div>`
    },
    build: {
      label:'02 / Build',title:'Make the change in an isolated branch.',text:'I edit the page and related styles or scripts together, then inspect the changed files before requesting review.',gate:'The branch contains the intended change and no unrelated edits.',alt:'Illustrative code branch with changed files and a preview status.',window:'BRANCH / feature/learner-route',status:'Draft changes',scene:`<div class="gh-ui-heading"><strong>Feature branch</strong><span class="gh-ui-pill">3 files changed</span></div><div class="gh-branch-line"><span>main</span><i></i><span>feature/learner-route</span></div><span class="gh-ui-label">CHANGED FILES</span><div class="gh-file-list"><div><span>portfolio/pathway/index.html</span><b>+18 −9</b></div><div><span>portfolio/css/pathway.css</span><b>+43 −12</b></div><div><span>portfolio/js/pathway.js</span><b>+16 −4</b></div></div><div class="gh-ui-footer"><span>Local preview ready</span><b>Diff reviewed ✓</b></div>`
    },
    review: {
      label:'03 / Review',title:'Check the exact version being proposed.',text:'A pull request brings the change, visual review, automated checks, and any overlapping work into one decision point.',gate:'The current branch merges cleanly, the checks pass, and the page is visually reviewed.',alt:'Illustrative pull request showing visual review, link checks, and validation results.',window:'PULL REQUEST / 124',status:'Checks passing',scene:`<div class="gh-ui-heading"><strong>Learning route refresh</strong><span class="gh-ui-pill">Ready for review</span></div><div class="gh-compare"><span>Base<br><b>main</b></span><span>Compare<br><b>feature/learner-route</b></span></div><span class="gh-ui-label" style="margin-top:13px">QUALITY GATES</span><div class="gh-check-row"><span>✓ Content + links</span><b>Passed</b></div><div class="gh-check-row"><span>✓ Responsive preview</span><b>Passed</b></div><div class="gh-check-row"><span>✓ Visual UAT</span><b>Reviewed</b></div><div class="gh-check-row"><span>✓ Current main + overlap</span><b>Clear</b></div><div class="gh-ui-footer"><span>Validated commit: exact PR head</span><b>Review complete</b></div>`
    },
    publish: {
      label:'04 / Publish',title:'Release the reviewed change.',text:'Once approved, the merged version becomes the source for the public site. I confirm the deployed page and its navigation.',gate:'The live page matches the approved version and its links work.',alt:'Illustrative deployment sequence from approved pull request to live public page.',window:'DEPLOYMENT / PAGES',status:'Live',scene:`<div class="gh-ui-heading"><strong>Public release</strong><span class="gh-ui-pill">Published</span></div><div class="gh-publish-track"><span>Approved PR</span><i></i><span>Main</span><i></i><span>GitHub Pages</span></div><div class="gh-live-card"><strong>id-portfolio-system</strong><small>Live site · latest reviewed version</small></div><div class="gh-ui-checks"><span>Homepage and project route open</span><span>Interactive stage responds</span><span>Assets load at mobile width</span></div><div class="gh-ui-footer"><span>Release record retained</span><b>Live check ✓</b></div>`
    },
    maintain: {
      label:'05 / Maintain',title:'Turn findings into the next scoped update.',text:'Broken links, changed content, feedback, and reusable patterns become new tracked work instead of ad hoc edits.',gate:'The issue has an owner, a reproducible check, and a path back through review.',alt:'Illustrative maintenance dashboard with site checks and a new issue queued.',window:'MAINTENANCE / SITE',status:'Monitoring',scene:`<div class="gh-ui-heading"><strong>Release health</strong><span class="gh-ui-pill">Monitoring</span></div><div class="gh-monitor"><span><b>98%</b> link health</span><span><b>0</b> failed checks</span><span><b>2</b> ideas queued</span></div><span class="gh-ui-label">NEW FINDING</span><div class="gh-issue-row">Improve keyboard focus on one learning demo → issue created</div><div class="gh-ui-checks"><span>Record exact page and behavior</span><span>Keep reusable pattern in content library</span><span>Scope the next branch from current main</span></div><div class="gh-ui-footer"><span>Release history available</span><b>Next cycle ready</b></div>`
    }
  };
  const panel = root.querySelector('#gh-stage-panel');
  const render = key => {
    const item = content[key];
    if (!item) return;
    root.querySelector('#ghStageLabel').textContent = item.label;
    root.querySelector('#ghStageTitle').textContent = item.title;
    root.querySelector('#ghStageText').textContent = item.text;
    root.querySelector('#ghStageGate').textContent = item.gate;
    const screen = root.querySelector('#ghStageScreen');
    screen.setAttribute('aria-label', item.alt);
    screen.innerHTML = `<div class="gh-ui-bar"><span>● ● ●</span><strong>${item.window}</strong><small>${item.status}</small></div><div class="gh-ui-body">${item.scene}</div>`;
    tabs.forEach(button => {
      const active = button.dataset.ghStage === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panel.dataset.stage = key;
    panel.setAttribute('aria-labelledby', `gh-stage-${key}`);
  };
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => render(button.dataset.ghStage));
    button.addEventListener('keydown', event => {
      if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : event.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
      render(tabs[next].dataset.ghStage);
    });
  });
  render('scope');
})();
