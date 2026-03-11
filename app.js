/* ========================================
   AIDEN — Architecture Intake & Decision Engine
   Application Logic v2
   ======================================== */

/* ---- Tab Switching ---- */
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });

  var tabEl = document.getElementById('tab-' + tabId);
  if (tabEl) { tabEl.classList.add('active'); }

  var navBtn = document.querySelector('[data-tab="' + tabId + '"]');
  if (navBtn) { navBtn.classList.add('active'); }
}

/* ---- Author Copilot Chat Data ---- */
/* Demo scenario: AI Code Review Assistant — internal-tool tier
   R_eff worked example: 0.69 → CONDITIONAL (approve ≥ 0.75, block < 0.40) */

var chatSteps = [
  {
    category: 'overview',
    tagClass: 'tag-overview',
    tagLabel: 'Solution Overview',
    agentMessages: [
      'Welcome to the AIDEN Author Copilot. I\'ll guide you through building a proposal that meets enterprise policy requirements.\n\n<span class="category-tag tag-overview">Solution Overview</span>\n\nDescribe the AI solution you\'re proposing. What does it do, who uses it, and what tier do you expect?',
      'Be specific about: <strong>primary function</strong>, <strong>target users</strong> (internal vs. external), <strong>data it accesses</strong>, and <strong>deployment scope</strong>.'
    ],
    userResponse: 'We\'re proposing an <strong>AI Code Review Assistant</strong> that integrates with our internal GitHub Enterprise instance. It uses an LLM to provide automated code review suggestions on pull requests.\n\n<strong>Function:</strong> Static analysis + LLM-powered review comments on PRs. Suggests security improvements, style corrections, and identifies potential bugs.\n\n<strong>Users:</strong> ~300 internal software engineers. No external users.\n\n<strong>Data:</strong> Source code from internal repositories only. No PHI, no PII, no member data.\n\n<strong>Tier:</strong> <code>internal-tool</code> — this is developer tooling, not production-facing.',
    proposalContent: '<div class="field-label">Solution Name</div><div class="field-value">AI Code Review Assistant</div><div class="field-label">Type</div><div class="field-value">Internal developer tooling (GitHub Enterprise integration)</div><div class="field-label">Function</div><div class="field-value">LLM-powered code review: security suggestions, style corrections, bug detection on PRs</div><div class="field-label">Users</div><div class="field-value">~300 internal software engineers (no external access)</div><div class="field-label">Tier</div><div class="field-value">internal-tool (approve \u2265 0.75, block &lt; 0.40, 180-day evidence validity)</div>'
  },
  {
    category: 'data',
    tagClass: 'tag-data',
    tagLabel: 'Data & Privacy',
    agentMessages: [
      '<span class="category-tag tag-data">Data & Privacy</span>\n\nEven internal tools need a clear data posture. The evaluator checks data classification, retention, and model training boundaries.',
      'Address:\n1. <strong>Data classification</strong> — what data does the system read/write?\n2. <strong>Data flow</strong> — where does code go? Does it leave the network?\n3. <strong>Model training</strong> — is any data used to train or fine-tune models?\n4. <strong>Retention policy</strong> — how long are review results stored?'
    ],
    userResponse: '<strong>Classification:</strong> Internal source code (Confidential). Review comments (Internal). No PHI or PII processed at any stage.\n\n<strong>Data Flow:</strong> Code diffs extracted from GitHub Enterprise via API \u2192 sent to Azure OpenAI endpoint (enterprise tenant, data stays within org boundary) \u2192 review comments posted back to PR. No code leaves the enterprise Azure boundary.\n\n<strong>Model Training:</strong> Opt-out confirmed. Azure OpenAI enterprise agreement prohibits use of input/output for model training. Zero data retention on the model side.\n\n<strong>Retention:</strong> Review comments persisted in GitHub as PR comments. Audit logs retained 2 years in internal SIEM. No separate data store.',
    proposalContent: '<div class="field-label">Data Classification</div><div class="field-value">Internal source code (Confidential). Review comments (Internal). No PHI/PII.</div><div class="field-label">Data Flow</div><div class="field-value">GitHub Enterprise API \u2192 Azure OpenAI (enterprise tenant, in-boundary) \u2192 PR comments. No external egress.</div><div class="field-label">Model Training</div><div class="field-value">Opt-out confirmed. Enterprise agreement prohibits input/output use for training. Zero data retention.</div><div class="field-label">Retention</div><div class="field-value">PR comments in GitHub. Audit logs in SIEM (2-year retention). No separate data store.</div>'
  },
  {
    category: 'arch',
    tagClass: 'tag-arch',
    tagLabel: 'Architecture',
    agentMessages: [
      '<span class="category-tag tag-arch">Architecture</span>\n\nNow the technical design. The evaluator checks infrastructure patterns, failover, and integration points.',
      'Detail:\n1. <strong>Hosting</strong> — where does the service run?\n2. <strong>Integration</strong> — how does it connect to GitHub Enterprise?\n3. <strong>Model serving</strong> — which model, how served?\n4. <strong>Availability</strong> — what happens when the service is down?'
    ],
    userResponse: '<strong>Hosting:</strong> Kubernetes pod in internal AKS cluster (same cluster as other dev tools). Single-region deployment (internal-tool tier does not require multi-region).\n\n<strong>Integration:</strong> GitHub App installed on the org. Webhook-triggered on PR open/update events. Uses GitHub REST API for reading diffs, GraphQL API for posting review comments. Service account with scoped permissions (read code, write reviews).\n\n<strong>Model:</strong> GPT-4o via Azure OpenAI Service (enterprise tenant). Prompt includes code diff + repository context. Max 8K token context window per review.\n\n<strong>Availability:</strong> Non-critical. If the service is down, PRs proceed without AI review. GitHub webhook retry handles transient failures. No SLA target beyond best-effort for internal tooling.',
    proposalContent: '<div class="field-label">Hosting</div><div class="field-value">AKS pod (internal dev tools cluster). Single-region. Container image from internal registry.</div><div class="field-label">Integration</div><div class="field-value">GitHub App (webhook on PR events). REST API for diffs, GraphQL for comments. Scoped service account.</div><div class="field-label">Model</div><div class="field-value">GPT-4o via Azure OpenAI Service (enterprise tenant). 8K token context per review.</div><div class="field-label">Availability</div><div class="field-value">Non-critical. PRs proceed without AI review if service is down. Webhook retry for transient failures.</div>'
  },
  {
    category: 'security',
    tagClass: 'tag-security',
    tagLabel: 'Security',
    agentMessages: [
      '<span class="category-tag tag-security">Security</span>\n\nSecurity is where internal-tool proposals frequently lose points. The evaluator checks authentication, authorization, encryption, and vulnerability management.',
      'Address:\n1. <strong>Authentication</strong> — how does the service authenticate to GitHub and Azure OpenAI?\n2. <strong>Authorization</strong> — who can enable/disable the tool? RBAC model?\n3. <strong>Secrets management</strong> — how are API keys and tokens stored?\n4. <strong>Vulnerability management</strong> — container scanning, dependency audits?'
    ],
    userResponse: '<strong>Authentication:</strong> GitHub App uses private key + JWT for API auth. Azure OpenAI uses managed identity (no API key in code). Service-to-service via mTLS within the AKS cluster.\n\n<strong>Authorization:</strong> GitHub org admins control App installation. Repository admins can opt repos in/out. No end-user auth needed (tool runs as a service account). Access logs tied to GitHub audit log.\n\n<strong>Secrets:</strong> Private key in Azure Key Vault. Managed identity for Azure OpenAI (no stored credentials). Kubernetes secrets for non-sensitive config only.\n\n<strong>Vulnerability Management:</strong> Container images scanned by Trivy in CI/CD pipeline. Dependency audit via Dependabot. Quarterly review of Azure OpenAI enterprise configuration.',
    proposalContent: '<div class="field-label">Authentication</div><div class="field-value">GitHub App JWT (private key). Azure OpenAI via managed identity. mTLS within AKS.</div><div class="field-label">Authorization</div><div class="field-value">Org admins control installation. Repo admins opt in/out. Service account operation.</div><div class="field-label">Secrets Management</div><div class="field-value">Private key in Azure Key Vault. Managed identity for Azure OpenAI. No stored API keys.</div><div class="field-label">Vulnerability Management</div><div class="field-value">Trivy container scanning in CI/CD. Dependabot for dependencies. Quarterly config review.</div>'
  },
  {
    category: 'ops',
    tagClass: 'tag-ops',
    tagLabel: 'Operations',
    agentMessages: [
      '<span class="category-tag tag-ops">Operations</span>\n\nOperational readiness, even for internal tools. The evaluator checks monitoring, deployment strategy, and incident handling.',
      'Specify:\n1. <strong>Monitoring</strong> — what do you track?\n2. <strong>Deployment</strong> — CI/CD strategy?\n3. <strong>Incident handling</strong> — what happens when things break?\n4. <strong>Capacity</strong> — expected load and scaling?'
    ],
    userResponse: '<strong>Monitoring:</strong> Azure Monitor for pod health and API latency. Custom metrics: reviews/hour, avg response time, error rate. Alerts in Teams channel for error rate > 5%.\n\n<strong>Deployment:</strong> GitHub Actions CI/CD. Build \u2192 test \u2192 scan \u2192 deploy to AKS. Rolling updates with automatic rollback on health check failure.\n\n<strong>Incident Handling:</strong> Non-critical service. Team owns the on-call. If persistent failure, disable the GitHub App (one-click). No formal SLA or SRE escalation path.\n\n<strong>Capacity:</strong> ~200 PRs/day average. Single pod handles load. HPA configured to scale to 3 pods if latency exceeds 10s. Azure OpenAI rate limit: 60 RPM (sufficient).',
    proposalContent: '<div class="field-label">Monitoring</div><div class="field-value">Azure Monitor (pod health, API latency). Custom metrics: reviews/hour, response time, error rate. Teams alerts.</div><div class="field-label">Deployment</div><div class="field-value">GitHub Actions CI/CD. Rolling updates with auto-rollback on health check failure.</div><div class="field-label">Incident Handling</div><div class="field-value">Team-owned. Non-critical. One-click disable via GitHub App settings. No formal SLA.</div><div class="field-label">Capacity</div><div class="field-value">~200 PRs/day. Single pod baseline, HPA to 3 pods. Azure OpenAI: 60 RPM rate limit.</div>'
  },
  {
    category: 'gov',
    tagClass: 'tag-gov',
    tagLabel: 'Governance',
    agentMessages: [
      '<span class="category-tag tag-gov">Governance</span>\n\nFinal section. Governance often has the weakest coverage on internal tool proposals. The evaluator checks responsible AI practices, model lifecycle, and human oversight.',
      'Address:\n1. <strong>Responsible AI</strong> — how do you handle hallucinated or harmful suggestions?\n2. <strong>Human oversight</strong> — can engineers override/dismiss AI suggestions?\n3. <strong>Model lifecycle</strong> — what happens when the model is updated?\n4. <strong>Bias considerations</strong> — any fairness concerns?'
    ],
    userResponse: '<strong>Responsible AI:</strong> AI review comments are clearly labeled as AI-generated. Each comment includes a confidence indicator. Engineers are explicitly told suggestions are advisory, not authoritative.\n\n<strong>Human Oversight:</strong> Full control. Engineers can dismiss any AI comment. No auto-merge, no blocking — AI review is additive to the existing human review process. Engineering managers can disable per-repo.\n\n<strong>Model Lifecycle:</strong> Azure OpenAI handles model updates. When GPT-4o version changes, team validates against a golden test suite of 50 PRs before re-enabling. Rollback = pin to previous model version.\n\n<strong>Bias:</strong> Low risk for code review. Primary concern is language/naming bias in suggestions. Quarterly spot-check of 20 random reviews for tone and inclusivity. No demographic data processed.',
    proposalContent: '<div class="field-label">Responsible AI</div><div class="field-value">AI comments labeled as AI-generated. Confidence indicators. Advisory, not authoritative.</div><div class="field-label">Human Oversight</div><div class="field-value">Engineers dismiss any comment. No auto-merge or blocking. Managers can disable per-repo.</div><div class="field-label">Model Lifecycle</div><div class="field-value">Azure OpenAI managed updates. Golden test suite (50 PRs) validation before re-enable. Version pinning for rollback.</div><div class="field-label">Bias Monitoring</div><div class="field-value">Low risk. Quarterly spot-check (20 reviews) for tone/inclusivity. No demographic data.</div>'
  }
];

var currentChatStep = -1;
var chatAnimating = false;

function advanceChat() {
  if (chatAnimating) { return; }

  currentChatStep++;
  if (currentChatStep >= chatSteps.length) {
    switchTab('reviewer');
    currentChatStep = chatSteps.length - 1;
    return;
  }

  chatAnimating = true;
  var step = chatSteps[currentChatStep];
  var container = document.getElementById('chatMessages');
  var stepNum = currentChatStep + 1;

  document.getElementById('currentStep').textContent = stepNum;

  var nextBtn = document.getElementById('nextBtn');
  var nextBtnText = document.getElementById('nextBtnText');
  nextBtn.disabled = true;
  nextBtn.style.opacity = '0.5';

  var typingMsg = createMessage('agent', 'COPILOT', '<div class="typing-indicator"><span></span><span></span><span></span></div>');
  container.appendChild(typingMsg);
  scrollChat();

  setTimeout(function() {
    container.removeChild(typingMsg);
    var msg1 = createMessage('agent', 'COPILOT', step.agentMessages[0]);
    container.appendChild(msg1);
    scrollChat();

    setTimeout(function() {
      var msg2 = createMessage('agent', 'COPILOT', step.agentMessages[1]);
      container.appendChild(msg2);
      scrollChat();

      setTimeout(function() {
        var userMsg = createMessage('user', 'ENGINEER', step.userResponse);
        container.appendChild(userMsg);
        scrollChat();

        setTimeout(function() {
          fillProposalSection(step.category, step.proposalContent);
          updateProgress(stepNum);

          chatAnimating = false;
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';

          if (currentChatStep === chatSteps.length - 1) {
            nextBtnText.textContent = 'Submit for Review \u2192';
          } else {
            nextBtnText.textContent = 'Next Section \u2192';
          }
        }, 400);
      }, 800);
    }, 600);
  }, 1000);
}

function createMessage(role, sender, content) {
  var msg = document.createElement('div');
  msg.className = 'chat-msg';

  var avatar = document.createElement('div');
  avatar.className = 'chat-msg-avatar ' + (role === 'agent' ? 'agent' : 'user');
  avatar.textContent = role === 'agent' ? 'C' : 'E';

  var body = document.createElement('div');
  body.className = 'chat-msg-body';

  var senderEl = document.createElement('div');
  senderEl.className = 'chat-msg-sender';
  senderEl.textContent = sender;

  var text = document.createElement('div');
  text.className = 'chat-msg-text';
  text.innerHTML = content;

  body.appendChild(senderEl);
  body.appendChild(text);
  msg.appendChild(avatar);
  msg.appendChild(body);

  return msg;
}

function scrollChat() {
  var container = document.getElementById('chatMessages');
  setTimeout(function() {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

function fillProposalSection(category, content) {
  var sectionContent = document.getElementById('content-' + category);
  var sectionEl = document.getElementById('ps-' + category);
  var checkEl = document.getElementById('check-' + category);

  if (sectionContent) {
    sectionContent.innerHTML = content;
    sectionContent.style.animation = 'fadeIn 0.5s ease';
  }
  if (sectionEl) {
    sectionEl.classList.add('completed');
  }
  if (checkEl) {
    checkEl.classList.add('done');
    checkEl.innerHTML = '\u2713';
  }
}

function updateProgress(stepNum) {
  var pct = Math.round((stepNum / chatSteps.length) * 100);
  var progressEl = document.getElementById('proposalProgress');
  if (progressEl) {
    progressEl.textContent = pct + '% Complete';
  }
}

/* ---- Reviewer Agent ---- */
/* Four-outcome evaluator: pass / fail / abstain / degrade
   R_eff = max(0, R_raw - penalty - degradation)
   Worked example: R_eff = 0.69 → CONDITIONAL (internal-tool tier: approve ≥ 0.75) */

var reviewStarted = false;

function startReview() {
  if (reviewStarted) { return; }
  reviewStarted = true;

  var btn = document.getElementById('startReviewBtn');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Evaluating...</span>';

  var sections = document.querySelectorAll('.review-section');
  var delay = 0;

  sections.forEach(function(section, index) {
    delay += 900;
    setTimeout(function() {
      evaluateSection(section, index);
    }, delay);
  });

  setTimeout(function() {
    showOverallAssessment();
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Review Complete</span>';
    btn.style.opacity = '1';
  }, delay + 1200);
}

function evaluateSection(section, index) {
  section.classList.add('evaluated');

  var fill = section.querySelector('.review-score-fill');
  var numEl = section.querySelector('.review-score-num');
  var targetScore = parseInt(fill.getAttribute('data-target'));

  var color;
  if (targetScore >= 85) { color = 'var(--green)'; }
  else if (targetScore >= 75) { color = 'var(--teal-500)'; }
  else if (targetScore >= 70) { color = 'var(--amber)'; }
  else { color = 'var(--red)'; }

  fill.style.background = color;
  fill.style.width = targetScore + '%';

  animateNumber(numEl, 0, targetScore, 1000);

  var findings = section.querySelectorAll('.finding');
  findings.forEach(function(finding, fIndex) {
    setTimeout(function() {
      finding.classList.add('revealed');
    }, 300 + (fIndex * 200));
  });
}

function animateNumber(el, start, end, duration) {
  var startTime = null;
  function step(timestamp) {
    if (!startTime) { startTime = timestamp; }
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(start + (end - start) * eased);
    el.textContent = current + '%';

    if (current >= 85) { el.style.color = 'var(--green)'; }
    else if (current >= 75) { el.style.color = 'var(--teal-400)'; }
    else if (current >= 70) { el.style.color = 'var(--amber)'; }
    else { el.style.color = 'var(--red)'; }

    if (progress < 1) { requestAnimationFrame(step); }
  }
  requestAnimationFrame(step);
}

function showOverallAssessment() {
  var assessment = document.getElementById('overallAssessment');
  /* R_eff = 0.69 → round(0.69 * 100) = 69 → CONDITIONAL
     Scalarization: round(R_eff * 100) — exact match to declared transform */
  assessment.innerHTML = '<div class="assessment-result">' +
    '<div class="assessment-verdict">' +
      '<span class="verdict-badge verdict-conditional">\u26A0 CONDITIONAL</span>' +
      '<span style="font-size:12px;color:var(--text-muted);font-family:\'JetBrains Mono\',monospace;">R_eff = 0.69 &middot; round(0.69 &times; 100) = 69 &middot; Tier: internal-tool &middot; Threshold: \u2265 0.75</span>' +
    '</div>' +
    '<div class="assessment-summary">' +
      '<strong>Gate decision: CONDITIONAL.</strong> Overall R_eff = 0.69, which falls between block (&lt; 0.40) and approve (\u2265 0.75) thresholds for the internal-tool tier. Overall = min(section R_effs), so the weakest section sets the gate.<br><br>' +
      '<strong>Bottleneck: Security</strong> (R_eff = 0.69). Two high-severity fails (SEC-RBAC-002, SEC-VUL-002) plus one abstained check hold the score below approve. The Delta Engine computes the minimum path to APPROVE.' +
    '</div>' +
    '<div class="assessment-stats">' +
      '<div class="assessment-stat"><span class="stat-value" id="overall-score">\u2014</span><span class="stat-label">R_eff (overall)</span></div>' +
      '<div class="assessment-stat"><span class="stat-value" style="color:var(--green);">18</span><span class="stat-label">Pass</span></div>' +
      '<div class="assessment-stat"><span class="stat-value" style="color:var(--red);">3</span><span class="stat-label">Fail</span></div>' +
      '<div class="assessment-stat"><span class="stat-value" style="color:var(--blue);">2</span><span class="stat-label">Abstain</span></div>' +
      '<div class="assessment-stat"><span class="stat-value" style="color:var(--amber);">1</span><span class="stat-label">Degrade</span></div>' +
    '</div>' +
    '<div class="autonomy-ledger">' +
      '<div class="autonomy-ledger-title">Autonomy Ledger Entry</div>' +
      '<div class="autonomy-ledger-entry">' +
        '<div class="ledger-row"><span class="ledger-key">action</span><span class="ledger-val">gate_decision</span></div>' +
        '<div class="ledger-row"><span class="ledger-key">actor</span><span class="ledger-val">reviewer:pending</span></div>' +
        '<div class="ledger-row"><span class="ledger-key">actor_type</span><span class="ledger-val">human</span></div>' +
        '<div class="ledger-row"><span class="ledger-key">decision</span><span class="ledger-val verdict-text-conditional">CONDITIONAL</span></div>' +
        '<div class="ledger-row"><span class="ledger-key">budget</span><span class="ledger-val">0 / 0 (human-in-the-loop)</span></div>' +
        '<div class="ledger-row"><span class="ledger-key">sod_check</span><span class="ledger-val">pass</span></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  assessment.style.animation = 'fadeIn 0.6s ease';

  var overallEl = document.getElementById('overall-score');
  if (overallEl) {
    animateNumber(overallEl, 0, 69, 1500);
  }
}

/* ---- Delta Engine ---- */
var deltaStarted = false;

function startDelta() {
  if (deltaStarted) { return; }
  deltaStarted = true;

  var btn = document.getElementById('startDeltaBtn');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Computing...</span>';

  // Show algo note first
  var algoNote = document.querySelector('.delta-algo-note');
  if (algoNote) {
    setTimeout(function() { algoNote.classList.add('revealed'); }, 400);
  }

  // Reveal primary selected item
  var primaryItems = document.querySelectorAll('.delta-items:not(.delta-alt-items) .delta-item');
  var delay = 800;

  primaryItems.forEach(function(item) {
    delay += 800;
    setTimeout(function() {
      item.classList.add('revealed');
      setTimeout(function() {
        item.classList.add('applied');
      }, 400);
    }, delay);
  });

  // Reveal projection
  setTimeout(function() {
    var projection = document.getElementById('deltaProjection');
    projection.classList.add('revealed');
  }, delay + 800);

  // Reveal alternative paths section
  setTimeout(function() {
    var altLabel = document.querySelector('.alt-label');
    if (altLabel) { altLabel.classList.add('revealed'); }

    var altItems = document.querySelectorAll('.delta-alt-items .delta-item');
    altItems.forEach(function(item, idx) {
      setTimeout(function() {
        item.classList.add('revealed');
      }, idx * 600);
    });

    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Delta Computed</span>';
    btn.style.opacity = '1';
  }, delay + 1400);
}

/* ---- Initialize ---- */
document.addEventListener('DOMContentLoaded', function() {
  switchTab('hero');
});
