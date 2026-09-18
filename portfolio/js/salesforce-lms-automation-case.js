(() => {
  const stepData = {
    input:{label:'Workbook input',title:'Read the learner email from the source workbook.',summary:'The workflow starts with the learner list and uses the email address as the search value for the Salesforce lookup.',tool:'Excel + Python',automated:'Read each learner row and pass the email into the next lookup step.',data:'Email address from the source learner workbook.',human:'Confirm the source list is the intended batch before running the workflow.',target:'ready for search'},
    lookup:{label:'Browser automation',title:'Search Salesforce for the learner account.',summary:'Selenium uses the email value in Salesforce global search and opens the account result used for downstream mapping.',tool:'Selenium + Salesforce',automated:'Repeated search, result selection, and navigation to the account record.',data:'Learner email becomes a Salesforce account lookup.',human:'Review records where no result or more than one plausible account appears.',target:'account located'},
    capture:{label:'Account capture',title:'Capture the Salesforce account reference and account data.',summary:'The workflow records the Account URL and the account values needed for LMS department setup.',tool:'Salesforce + Excel',automated:'Copy the account reference back to the workbook and retain the mapped account fields.',data:'Account URL, Account Name, Region or Type, and Account ID.',human:'Confirm the selected account is the correct customer record.',target:'account data captured'},
    map:{label:'LMS mapping',title:'Translate Salesforce account fields into Absorb department fields.',summary:'Documented rules convert verified account data into the department name, parent department, and department ID structure used in Absorb.',tool:'Python + Absorb LMS',automated:'Apply consistent field mappings for downstream department setup.',data:'Account Name to Department Name, Region or Type to Parent Department, Account ID to Department ID.',human:'Confirm parent-department logic when the account structure is unusual.',target:'department mapped'},
    place:{label:'Learner placement',title:'Prepare the final user-move record for LMS placement.',summary:'The workflow organizes the learner and department data into a clean output that can be reviewed before the user is moved.',tool:'Excel + Absorb LMS',automated:'Build the placement record with learner and department fields.',data:'Email, username, department, and department ID.',human:'Review the final placement before applying the move in the LMS.',target:'placement ready'}
  };

  const mappingData = {
    name:{source:'Account Name',sourceExample:'Fictional account: Summit Health Systems',target:'Department Name',targetExample:'Creates the LMS department name from the verified account.'},
    parent:{source:'Region / Type',sourceExample:'Example value: West / Partner',target:'Parent Department',targetExample:'Routes the department into the correct LMS hierarchy.'},
    id:{source:'Account ID',sourceExample:'Example value: fictional Salesforce account identifier',target:'Department ID',targetExample:'Carries the stable account identifier into the department record.'},
    user:{source:'Learner + mapped department',sourceExample:'Email and username paired with the verified account mapping',target:'User Placement Record',targetExample:'Produces the review-ready learner move with department and department ID.'}
  };

  const evidenceData = {
    intro:{label:'Salesforce and LMS context',src:'../../../../assets/project-images/salesforce-lms-integration/salesforce-lms-introduction.webp',alt:'Fictionalized Salesforce and LMS integration introduction screen.',caption:'A conceptual introduction showing the business reason for connecting CRM account data with learning operations.'},
    flow:{label:'Connected workflow',src:'../../../../assets/project-images/salesforce-lms-integration/salesforce-lms-connected-workflow.webp',alt:'Fictionalized connected workflow screen showing Salesforce data moving through automation into an LMS.',caption:'A public-safe visual of the system handoff. In the actual project, Python and Selenium handled the browser and data-mapping work.'},
    trigger:{label:'Data event example',src:'../../../../assets/project-images/salesforce-lms-integration/salesforce-lms-trigger-demo.webp',alt:'Fictionalized screen showing a Salesforce event and resulting LMS action.',caption:'A conceptual trigger view used to explain how CRM data can drive a learning-operations action.'},
    account:{label:'Account to LMS example',src:'../../../../assets/project-images/salesforce-lms-integration/salesforce-lms-account-to-enablement.webp',alt:'Fictionalized account to enablement screen showing an account mapped to LMS enrollments.',caption:'A public-safe account-to-LMS example that mirrors the logic of moving verified account data into an LMS-ready structure.'}
  };

  const setText=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  const setupTabs=(selector,keyName,render)=>{
    const buttons=[...document.querySelectorAll(selector)];
    buttons.forEach((button,index)=>{
      const activate=()=>{buttons.forEach((item)=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});render(button.dataset[keyName]);};
      button.addEventListener('click',activate);
      button.addEventListener('keydown',(event)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();let next=index;if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%buttons.length;else next=(index-1+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();});
    });
  };

  setupTabs('[data-sflms-step]','sflmsStep',(key)=>{const d=stepData[key];setText('sflmsStepLabel',d.label);setText('sflmsStepTitle',d.title);setText('sflmsStepSummary',d.summary);setText('sflmsStepTool',d.tool);setText('sflmsStepAutomated',d.automated);setText('sflmsStepData',d.data);setText('sflmsStepHuman',d.human);setText('sflmsStageTarget',d.target);});
  setupTabs('[data-map-rule]','mapRule',(key)=>{const d=mappingData[key];setText('mapSource',d.source);setText('mapSourceExample',d.sourceExample);setText('mapTarget',d.target);setText('mapTargetExample',d.targetExample);});
  setupTabs('[data-sflms-evidence]','sflmsEvidence',(key)=>{const d=evidenceData[key];const image=document.getElementById('sflmsEvidenceImage');setText('sflmsEvidenceLabel',d.label);setText('sflmsEvidenceCaption',d.caption);if(image){image.src=d.src;image.alt=d.alt;}});

  const navLinks=[...document.querySelectorAll('.case-nav a')];
  const sections=navLinks.map((link)=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if('IntersectionObserver' in window){const observer=new IntersectionObserver((entries)=>{const visible=entries.filter((entry)=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;navLinks.forEach((link)=>link.classList.toggle('active',link.getAttribute('href')===`#${visible.target.id}`));},{rootMargin:'-28% 0px -58% 0px',threshold:[0.1,.35,.6]});sections.forEach((section)=>observer.observe(section));}
})();