/* ========================================
   AIDEN — Architecture Intake & Decision Engine
   Application Logic — Phase F (Live Agent Demo)
   ======================================== */

/* ---- Configuration ---- */
// Set this to the Vercel deployment URL for aiden-engine.
// Leave empty string to force deterministic-only mode (no API calls).
var API_BASE_URL = 'https://aiden-engine.vercel.app';

/* ---- Sample Proposal (embedded from handoff) ---- */
var SAMPLE_PROPOSAL = {
  id: '2026-03-09_ai-code-review-assistant',
  name: 'AI Code Review Assistant',
  team: 'Platform Engineering',
  submitted_by: 'submitter.test',
  submitted_at: '2026-03-09T10:00:00Z',
  scope: {
    tier: 'internal-tool',
    phi: false,
    deployment_boundary: 'internal-aks',
    model_boundary: 'azure-openai-enterprise',
    user_cohort: 'internal-engineers-300',
    time_window: '180d',
    platform_version: '2026.03'
  },
  overview: {
    description: 'LLM-powered code review assistant for internal GitHub Enterprise PRs',
    function: 'Static analysis + LLM review comments on pull requests',
    users: '~300 internal software engineers',
    integration: 'GitHub Enterprise + Azure OpenAI'
  },
  data: {
    classification: 'Confidential (source code). Internal (review comments). No PHI/PII.',
    flow: 'GitHub Enterprise API → Azure OpenAI (enterprise tenant, in-boundary) → PR comments',
    model_training: 'Opt-out confirmed. Enterprise agreement prohibits training on input/output.',
    retention: 'PR comments in GitHub. Audit logs in SIEM (2-year retention).',
    data_classification_label: null
  },
  architecture: {
    hosting: 'AKS pod (internal dev tools cluster). Single-region.',
    integration: 'GitHub App (webhook on PR events). REST API for diffs, GraphQL for comments.',
    model: 'GPT-4o via Azure OpenAI Service (enterprise tenant). 8K token context.',
    availability: 'Non-critical. PRs proceed without AI review if service is down.',
    load_testing: null
  },
  security: {
    authentication: 'GitHub App JWT (private key). Azure OpenAI via managed identity. mTLS within AKS.',
    authorization: 'Org admins control installation. Repo admins opt in/out.',
    secrets_management: 'Private key in Azure Key Vault. Managed identity for Azure OpenAI.',
    vulnerability_management: 'Trivy container scanning in CI/CD. Dependabot for dependencies.',
    break_glass_procedure: null,
    binary_authorization: null,
    network_segmentation: null
  },
  operations: {
    monitoring: 'Azure Monitor (pod health, API latency). Custom metrics. Teams alerts.',
    deployment: 'GitHub Actions CI/CD. Rolling updates with auto-rollback.',
    incident_handling: 'Team-owned. Non-critical. One-click disable via GitHub App.',
    capacity: '~200 PRs/day. Single pod baseline, HPA to 3 pods.',
    runbook: null,
    sla: 'No formal SLA'
  },
  governance: {
    responsible_ai: 'AI comments labeled as AI-generated. Confidence indicators. Advisory only.',
    human_oversight: 'Engineers dismiss any comment. No auto-merge. Managers can disable per-repo.',
    model_lifecycle: 'Golden test suite (50 PRs) validation. Version pinning. Rollback procedure.',
    bias_monitoring: 'Quarterly spot-check (20 reviews) for tone/inclusivity.',
    harmful_suggestions_procedure: null
  }
};

/* ---- State ---- */
var architectMode = 'deterministic';
var reviewerMode = 'deterministic';
var lastArchitectResponse = null;
var lastReviewerResponse = null;

/* ---- Tab Switching ---- */
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  var tabEl = document.getElementById('tab-' + tabId);
  if (tabEl) { tabEl.classList.add('active'); }
  var navBtn = document.querySelector('[data-tab="' + tabId + '"]');
  if (navBtn) { navBtn.classList.add('active'); }
}

/* ---- Mode Toggle ---- */
function setMode(mode, agent) {
  if (!API_BASE_URL && mode !== 'deterministic') {
    showError(agent, 'API_BASE_URL is not configured. Set it in app.js to enable live modes.');
    return;
  }

  var toggleId = agent === 'architect' ? 'architectModeToggle' : 'reviewerModeToggle';
  document.querySelectorAll('#' + toggleId + ' .mode-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelector('#' + toggleId + ' [data-mode="' + mode + '"]').classList.add('active');

  if (agent === 'architect') {
    architectMode = mode;
    hideError('architect');
    toggleView('architect', mode);
    if (mode === 'live-assist') { runArchitectLive(); }
    else if (mode === 'shadow') { runArchitectShadow(); }
  } else {
    reviewerMode = mode;
    hideError('reviewer');
    toggleView('reviewer', mode);
    if (mode === 'live-assist') { runReviewerLive(); }
    else if (mode === 'shadow') { runReviewerShadow(); }
  }
}

function toggleView(agent, mode) {
  var prefix = agent === 'architect' ? 'architect' : 'reviewer';
  var det = document.getElementById(prefix + 'DeterministicView');
  var live = document.getElementById(prefix + 'LiveView');
  var shadow = document.getElementById(prefix + 'ShadowView');
  var safety = document.getElementById(prefix + 'SafetyPanel');
  var trace = document.getElementById(prefix + 'TracePanel');

  det.classList.toggle('hidden', mode !== 'deterministic');
  live.classList.toggle('hidden', mode !== 'live-assist');
  shadow.classList.toggle('hidden', mode !== 'shadow');
  safety.classList.toggle('hidden', mode === 'deterministic');
  trace.classList.toggle('hidden', mode === 'deterministic');
}

/* ---- Panel Toggle (expand/collapse) ---- */
function togglePanel(panelId) {
  var panel = document.getElementById(panelId);
  panel.classList.toggle('expanded');
}

/* ---- Error Handling ---- */
function showError(agent, msg) {
  var el = document.getElementById(agent + 'Error');
  var msgEl = document.getElementById(agent + 'ErrorMsg');
  msgEl.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(agent) {
  document.getElementById(agent + 'Error').classList.add('hidden');
}

/* ---- API Client ---- */
function callApi(endpoint, mode) {
  return fetch(API_BASE_URL + '/api/' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposal: SAMPLE_PROPOSAL, mode: mode })
  }).then(function(res) {
    if (!res.ok) {
      return res.json().then(function(body) {
        throw new Error(body.error || 'HTTP ' + res.status);
      });
    }
    return res.json();
  });
}

/* ---- Architect Agent — Live Assist ---- */
function runArchitectLive() {
  var loading = document.getElementById('architectLoading');
  var result = document.getElementById('architectLiveResult');
  loading.classList.remove('hidden');
  result.innerHTML = '';

  callApi('architect', 'live-assist').then(function(data) {
    loading.classList.add('hidden');
    lastArchitectResponse = data;
    result.innerHTML = renderArchitectResult(data.result);
    renderSafetyPanel('architect', data);
    renderTracePanel('architect', data);
  }).catch(function(err) {
    loading.classList.add('hidden');
    showError('architect', err.message);
  });
}

/* ---- Architect Agent — Shadow ---- */
function runArchitectShadow() {
  var detPanel = document.getElementById('architectShadowDeterministic');
  var livePanel = document.getElementById('architectShadowLive');
  var loadingEl = document.getElementById('architectShadowLoading');

  detPanel.innerHTML = '<div class="shadow-placeholder">Deterministic result will appear when API responds (runs server-side too)</div>';
  livePanel.innerHTML = '';
  loadingEl.classList.remove('hidden');

  callApi('architect', 'shadow').then(function(data) {
    loadingEl.classList.add('hidden');
    lastArchitectResponse = data;
    if (data.deterministic_result) {
      detPanel.innerHTML = renderDeterministicSummary(data.deterministic_result);
    }
    livePanel.innerHTML = renderArchitectResult(data.result);
    renderSafetyPanel('architect', data);
    renderTracePanel('architect', data);
  }).catch(function(err) {
    loadingEl.classList.add('hidden');
    showError('architect', err.message);
  });
}

/* ---- Reviewer Agent — Live Assist ---- */
function runReviewerLive() {
  var loading = document.getElementById('reviewerLoading');
  var result = document.getElementById('reviewerLiveResult');
  loading.classList.remove('hidden');
  result.innerHTML = '';

  callApi('reviewer', 'live-assist').then(function(data) {
    loading.classList.add('hidden');
    lastReviewerResponse = data;
    result.innerHTML = renderReviewerResult(data.result);
    renderSafetyPanel('reviewer', data);
    renderTracePanel('reviewer', data);
  }).catch(function(err) {
    loading.classList.add('hidden');
    showError('reviewer', err.message);
  });
}

/* ---- Reviewer Agent — Shadow ---- */
function runReviewerShadow() {
  var detPanel = document.getElementById('reviewerShadowDeterministic');
  var livePanel = document.getElementById('reviewerShadowLive');
  var loadingEl = document.getElementById('reviewerShadowLoading');

  detPanel.innerHTML = '<div class="shadow-placeholder">Deterministic result will appear when API responds</div>';
  livePanel.innerHTML = '';
  loadingEl.classList.remove('hidden');

  callApi('reviewer', 'shadow').then(function(data) {
    loadingEl.classList.add('hidden');
    lastReviewerResponse = data;
    if (data.deterministic_result) {
      detPanel.innerHTML = renderDeterministicSummary(data.deterministic_result);
    }
    livePanel.innerHTML = renderReviewerResult(data.result);
    renderSafetyPanel('reviewer', data);
    renderTracePanel('reviewer', data);
  }).catch(function(err) {
    loadingEl.classList.add('hidden');
    showError('reviewer', err.message);
  });
}

/* ---- Result Renderers ---- */
function renderArchitectResult(result) {
  if (!result) return '<div class="empty-state">No result returned</div>';
  var html = '<div class="live-result-card">';
  html += '<div class="result-section"><div class="result-label">Summary</div><div class="result-text">' + esc(result.summary || '') + '</div></div>';

  if (result.completeness_score !== undefined) {
    var scoreColor = result.completeness_score >= 80 ? 'var(--green)' : result.completeness_score >= 60 ? 'var(--amber)' : 'var(--red)';
    html += '<div class="result-section"><div class="result-label">Completeness Score</div><div class="result-score" style="color:' + scoreColor + ';">' + result.completeness_score + '%</div></div>';
  }

  if (result.gaps_found && result.gaps_found.length) {
    html += '<div class="result-section"><div class="result-label">Gaps Found (' + result.gaps_found.length + ')</div>';
    result.gaps_found.forEach(function(g) {
      var sevClass = g.severity === 'critical' ? 'sev-critical' : g.severity === 'high' ? 'sev-high' : 'sev-medium';
      html += '<div class="gap-card ' + sevClass + '"><span class="gap-field">' + esc(g.field || '') + '</span><span class="gap-sev">' + esc(g.severity || '') + '</span><div class="gap-issue">' + esc(g.issue || '') + '</div>';
      if (g.policy_ref) html += '<div class="gap-ref">' + esc(g.policy_ref) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (result.recommendations && result.recommendations.length) {
    html += '<div class="result-section"><div class="result-label">Recommendations</div>';
    result.recommendations.forEach(function(r) {
      html += '<div class="rec-card"><div class="rec-action">' + esc(r.action || '') + '</div><div class="rec-rationale">' + esc(r.rationale || '') + '</div>';
      if (r.policy_ref) html += '<div class="rec-ref">' + esc(r.policy_ref) + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (result.clarifying_questions && result.clarifying_questions.length) {
    html += '<div class="result-section"><div class="result-label">Clarifying Questions</div><ul class="questions-list">';
    result.clarifying_questions.forEach(function(q) {
      html += '<li>' + esc(q) + '</li>';
    });
    html += '</ul></div>';
  }

  if (result.confidence) {
    html += '<div class="result-section"><div class="result-label">Confidence</div><div class="result-text">' + esc(result.confidence) + (result.uncertainty_notes ? ' — ' + esc(result.uncertainty_notes) : '') + '</div></div>';
  }

  html += '</div>';
  return html;
}

function renderReviewerResult(result) {
  if (!result) return '<div class="empty-state">No result returned</div>';
  var html = '<div class="live-result-card">';
  html += '<div class="result-section"><div class="result-label">Summary</div><div class="result-text">' + esc(result.summary || '') + '</div></div>';

  if (result.overall_recommendation) {
    var recClass = result.overall_recommendation === 'APPROVE' ? 'verdict-approve' : result.overall_recommendation === 'BLOCK' ? 'verdict-block' : 'verdict-conditional';
    html += '<div class="result-section"><div class="result-label">Gate Decision</div><span class="verdict-badge ' + recClass + '">' + esc(result.overall_recommendation) + '</span>';
    if (result.r_eff_estimate !== undefined) {
      html += ' <span class="result-reff">R_eff = ' + result.r_eff_estimate + '</span>';
    }
    html += '</div>';
  }

  if (result.findings && result.findings.length) {
    html += '<div class="result-section"><div class="result-label">Findings (' + result.findings.length + ')</div>';
    result.findings.forEach(function(f) {
      var statusClass = f.status === 'pass' ? 'strength' : f.status === 'fail' ? 'gap' : f.status === 'abstain' ? 'abstain-finding' : 'degrade-finding';
      var icon = f.status === 'pass' ? '&#10004;' : f.status === 'fail' ? '&#10006;' : f.status === 'abstain' ? '?' : '&#8595;';
      html += '<div class="finding ' + statusClass + ' revealed"><span class="finding-icon">' + icon + '</span><span><strong>' + esc(f.status) + '</strong>';
      if (f.rule_id) html += ' &mdash; ' + esc(f.rule_id);
      if (f.severity) html += ' <span class="finding-sev">(' + esc(f.severity) + ')</span>';
      html += ': ' + esc(f.evidence || '') + '</span></div>';
    });
    html += '</div>';
  }

  if (result.key_risks && result.key_risks.length) {
    html += '<div class="result-section"><div class="result-label">Key Risks</div><ul class="questions-list">';
    result.key_risks.forEach(function(r) { html += '<li>' + esc(r) + '</li>'; });
    html += '</ul></div>';
  }

  if (result.remediation_path && result.remediation_path.length) {
    html += '<div class="result-section"><div class="result-label">Remediation Path</div>';
    result.remediation_path.forEach(function(r) {
      html += '<div class="rec-card"><div class="rec-action">' + esc(r.action || '') + '</div><div class="rec-rationale">Impact: ' + esc(r.impact || '') + ' · Effort: ' + esc(r.effort || '') + '</div></div>';
    });
    html += '</div>';
  }

  if (result.confidence) {
    html += '<div class="result-section"><div class="result-label">Confidence</div><div class="result-text">' + esc(result.confidence) + (result.uncertainty_notes ? ' — ' + esc(result.uncertainty_notes) : '') + '</div></div>';
  }

  html += '</div>';
  return html;
}

function renderDeterministicSummary(det) {
  if (!det) return '<div class="empty-state">No deterministic result</div>';
  var html = '<div class="live-result-card">';
  if (det.gateDecision) {
    var gd = det.gateDecision;
    var recClass = gd.decision === 'APPROVE' ? 'verdict-approve' : gd.decision === 'BLOCK' ? 'verdict-block' : 'verdict-conditional';
    html += '<div class="result-section"><span class="verdict-badge ' + recClass + '">' + esc(gd.decision || '') + '</span>';
    if (det.overallProfile && det.overallProfile.r_eff !== undefined) {
      html += ' <span class="result-reff">R_eff = ' + det.overallProfile.r_eff.toFixed(2) + '</span>';
    }
    html += '</div>';
  }
  if (det.sectionProfiles && det.sectionProfiles.length) {
    html += '<div class="result-section"><div class="result-label">Section Scores</div>';
    det.sectionProfiles.forEach(function(sp) {
      var pct = Math.round((sp.r_eff || 0) * 100);
      var color = pct >= 85 ? 'var(--green)' : pct >= 75 ? 'var(--teal-400)' : pct >= 70 ? 'var(--amber)' : 'var(--red)';
      html += '<div class="det-section-row"><span>' + esc(sp.domain || sp.section || '') + '</span><span style="color:' + color + ';font-weight:700;font-family:\'JetBrains Mono\',monospace;">' + pct + '%</span></div>';
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

/* ---- Safety Panel ---- */
function renderSafetyPanel(agent, data) {
  var body = document.getElementById(agent + 'SafetyBody');
  if (!data) { body.innerHTML = ''; return; }

  var bs = data.budget_summary || {};
  var trace = data.trace || {};
  var sc = trace.safety_checks || {};
  var toolsAllowed = agent === 'architect'
    ? ['schema-validate', 'policy-lookup']
    : ['policy-lookup', 'precedent-lookup', 'delta-check', 'schema-validate'];

  var statusColor = data.safety_status === 'ok' ? 'var(--green)' : 'var(--red)';
  var html = '<div class="safety-grid">';
  html += safetyItem('Mode', data.mode || '—');
  html += safetyItem('Model', trace.model || 'minimax/minimax-m2.5');
  html += safetyItem('Safety Status', '<span style="color:' + statusColor + ';">' + esc(data.safety_status || '—') + '</span>');
  html += safetyItem('Steps', (bs.steps_used || 0) + ' / ' + (bs.steps_limit || '—'));
  html += safetyItem('Tokens', (bs.tokens_used || 0) + ' / ' + (bs.tokens_limit || '—'));
  html += safetyItem('Cost', '$' + (bs.cost_usd || 0).toFixed(4) + ' / $' + (bs.cost_limit_usd || 0).toFixed(2));
  html += safetyItem('Wall Clock', (bs.wall_clock_ms || 0) + 'ms / ' + (bs.wall_clock_limit_ms || 0) + 'ms');
  html += safetyItem('Tools Allowed', toolsAllowed.map(function(t) { return '<code>' + t + '</code>'; }).join(' '));
  html += safetyItem('Input Safety', sc.input_check ? (sc.input_check.passed ? '✓ passed' : '✗ ' + esc(sc.input_check.reason || 'failed')) : '—');
  html += safetyItem('Output Safety', sc.output_check ? (sc.output_check.passed ? '✓ passed' : '✗ ' + esc(sc.output_check.reason || 'failed')) : '—');
  html += safetyItem('Redaction', 'enabled');
  html += safetyItem('Escalation', data.safety_status === 'flagged' ? '<span style="color:var(--red);">triggered</span>' : 'none');
  html += safetyItem('Trace ID', '<code>' + esc(data.trace_id || '—') + '</code>');
  if (trace.deterministic_fallback_used) {
    html += safetyItem('Fallback', '<span style="color:var(--amber);">deterministic fallback used</span>');
  }
  html += '</div>';
  body.innerHTML = html;
}

function safetyItem(label, value) {
  return '<div class="safety-item"><span class="safety-label">' + label + '</span><span class="safety-value">' + value + '</span></div>';
}

/* ---- Trace Viewer ---- */
function renderTracePanel(agent, data) {
  var body = document.getElementById(agent + 'TraceBody');
  if (!data || !data.trace) { body.innerHTML = '<div class="empty-state">No trace data</div>'; return; }

  var trace = data.trace;
  var html = '<div class="trace-meta">';
  html += '<span>Agent: <strong>' + esc(trace.agent_profile || '') + '</strong></span>';
  html += '<span>Started: ' + esc(trace.started_at || '') + '</span>';
  html += '<span>Completed: ' + esc(trace.completed_at || '') + '</span>';
  html += '</div>';

  if (trace.steps && trace.steps.length) {
    html += '<div class="trace-timeline">';
    trace.steps.forEach(function(step) {
      var typeClass = 'trace-type-' + (step.type || 'unknown').replace(/_/g, '-');
      html += '<div class="trace-step ' + typeClass + '">';
      html += '<div class="trace-step-header">';
      html += '<span class="trace-step-num">Step ' + (step.step_number || '?') + '</span>';
      html += '<span class="trace-step-type">' + esc(step.type || '') + '</span>';
      if (step.tokens) {
        html += '<span class="trace-tokens">' + (step.tokens.total_tokens || 0) + ' tokens</span>';
      }
      html += '<span class="trace-ts">' + formatTime(step.timestamp) + '</span>';
      html += '</div>';
      if (step.content) {
        var content = typeof step.content === 'string' ? step.content : JSON.stringify(step.content, null, 2);
        if (content.length > 500) content = content.substring(0, 500) + '…';
        html += '<pre class="trace-content">' + esc(content) + '</pre>';
      }
      html += '</div>';
    });
    html += '</div>';
  }

  if (trace.tool_calls && trace.tool_calls.length) {
    html += '<div class="trace-section-label">Tool Calls (' + trace.tool_calls.length + ')</div>';
    trace.tool_calls.forEach(function(tc) {
      html += '<div class="trace-tool-call">';
      html += '<div class="trace-tool-header">';
      html += '<code class="trace-tool-name">' + esc(tc.tool_name || '') + '</code>';
      html += '<span class="trace-tool-dur">' + (tc.duration_ms || 0) + 'ms</span>';
      html += tc.success ? '<span class="trace-tool-ok">✓</span>' : '<span class="trace-tool-err">✗ ' + esc(tc.error || 'failed') + '</span>';
      html += '</div>';
      if (tc.input) {
        var inp = typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input, null, 2);
        if (inp.length > 300) inp = inp.substring(0, 300) + '…';
        html += '<div class="trace-tool-io"><span class="trace-io-label">Input:</span><pre>' + esc(inp) + '</pre></div>';
      }
      if (tc.output) {
        var out = typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output, null, 2);
        if (out.length > 300) out = out.substring(0, 300) + '…';
        html += '<div class="trace-tool-io"><span class="trace-io-label">Output:</span><pre>' + esc(out) + '</pre></div>';
      }
      html += '</div>';
    });
  }

  body.innerHTML = html;
}

function formatTime(ts) {
  if (!ts) return '';
  try {
    var d = new Date(ts);
    return d.toLocaleTimeString();
  } catch (_) { return ts; }
}

/* ---- Helpers ---- */
function esc(s) {
  if (!s) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(s)));
  return div.innerHTML;
}

/* ================================================================
   DETERMINISTIC MODE — original Author Copilot chat + review logic
   ================================================================ */

/* ---- Author Copilot Chat Data ---- */
var chatSteps = [
  {
    category: 'overview', tagClass: 'tag-overview', tagLabel: 'Solution Overview',
    agentMessages: [
      'Welcome to the AIDEN Architect Agent. I\'ll guide you through building a proposal that meets enterprise policy requirements.\n\n<span class="category-tag tag-overview">Solution Overview</span>\n\nDescribe the AI solution you\'re proposing. What does it do, who uses it, and what tier do you expect?',
      'Be specific about: <strong>primary function</strong>, <strong>target users</strong> (internal vs. external), <strong>data it accesses</strong>, and <strong>deployment scope</strong>.'
    ],
    userResponse: 'We\'re proposing an <strong>AI Code Review Assistant</strong> that integrates with our internal GitHub Enterprise instance. It uses an LLM to provide automated code review suggestions on pull requests.\n\n<strong>Function:</strong> Static analysis + LLM-powered review comments on PRs.\n<strong>Users:</strong> ~300 internal software engineers. No external users.\n<strong>Data:</strong> Source code from internal repositories only. No PHI, no PII.\n<strong>Tier:</strong> <code>internal-tool</code>',
    proposalContent: '<div class="field-label">Solution Name</div><div class="field-value">AI Code Review Assistant</div><div class="field-label">Type</div><div class="field-value">Internal developer tooling (GitHub Enterprise integration)</div><div class="field-label">Function</div><div class="field-value">LLM-powered code review: security suggestions, style corrections, bug detection on PRs</div><div class="field-label">Users</div><div class="field-value">~300 internal software engineers (no external access)</div><div class="field-label">Tier</div><div class="field-value">internal-tool (approve \u2265 0.75, block &lt; 0.40, 180-day evidence validity)</div>'
  },
  {
    category: 'data', tagClass: 'tag-data', tagLabel: 'Data & Privacy',
    agentMessages: [
      '<span class="category-tag tag-data">Data & Privacy</span>\n\nEven internal tools need a clear data posture. The evaluator checks data classification, retention, and model training boundaries.',
      'Address:\n1. <strong>Data classification</strong>\n2. <strong>Data flow</strong>\n3. <strong>Model training</strong>\n4. <strong>Retention policy</strong>'
    ],
    userResponse: '<strong>Classification:</strong> Internal source code (Confidential). No PHI or PII.\n\n<strong>Data Flow:</strong> GitHub Enterprise API \u2192 Azure OpenAI (enterprise tenant) \u2192 PR comments. No external egress.\n\n<strong>Model Training:</strong> Opt-out confirmed. Zero data retention on model side.\n\n<strong>Retention:</strong> PR comments in GitHub. Audit logs 2 years in SIEM.',
    proposalContent: '<div class="field-label">Data Classification</div><div class="field-value">Internal source code (Confidential). No PHI/PII.</div><div class="field-label">Data Flow</div><div class="field-value">GitHub Enterprise API \u2192 Azure OpenAI (enterprise tenant, in-boundary) \u2192 PR comments.</div><div class="field-label">Model Training</div><div class="field-value">Opt-out confirmed. Enterprise agreement prohibits input/output use for training.</div><div class="field-label">Retention</div><div class="field-value">PR comments in GitHub. Audit logs in SIEM (2-year retention).</div>'
  },
  {
    category: 'arch', tagClass: 'tag-arch', tagLabel: 'Architecture',
    agentMessages: [
      '<span class="category-tag tag-arch">Architecture</span>\n\nNow the technical design. The evaluator checks infrastructure patterns, failover, and integration points.',
      'Detail:\n1. <strong>Hosting</strong>\n2. <strong>Integration</strong>\n3. <strong>Model serving</strong>\n4. <strong>Availability</strong>'
    ],
    userResponse: '<strong>Hosting:</strong> AKS pod (internal dev tools cluster). Single-region.\n\n<strong>Integration:</strong> GitHub App. Webhook-triggered on PR events.\n\n<strong>Model:</strong> GPT-4o via Azure OpenAI Service. 8K token context.\n\n<strong>Availability:</strong> Non-critical. PRs proceed without AI review if down.',
    proposalContent: '<div class="field-label">Hosting</div><div class="field-value">AKS pod (internal dev tools cluster). Single-region.</div><div class="field-label">Integration</div><div class="field-value">GitHub App (webhook on PR events). REST API for diffs, GraphQL for comments.</div><div class="field-label">Model</div><div class="field-value">GPT-4o via Azure OpenAI Service (enterprise tenant). 8K token context.</div><div class="field-label">Availability</div><div class="field-value">Non-critical. PRs proceed without AI review if service is down.</div>'
  },
  {
    category: 'security', tagClass: 'tag-security', tagLabel: 'Security',
    agentMessages: [
      '<span class="category-tag tag-security">Security</span>\n\nSecurity is where internal-tool proposals frequently lose points.',
      'Address:\n1. <strong>Authentication</strong>\n2. <strong>Authorization</strong>\n3. <strong>Secrets management</strong>\n4. <strong>Vulnerability management</strong>'
    ],
    userResponse: '<strong>Authentication:</strong> GitHub App JWT + managed identity for Azure OpenAI. mTLS within AKS.\n\n<strong>Authorization:</strong> Org admins control App installation. Repo admins opt in/out.\n\n<strong>Secrets:</strong> Private key in Azure Key Vault. Managed identity.\n\n<strong>Vulnerability Management:</strong> Trivy scanning in CI/CD. Dependabot.',
    proposalContent: '<div class="field-label">Authentication</div><div class="field-value">GitHub App JWT. Azure OpenAI via managed identity. mTLS within AKS.</div><div class="field-label">Authorization</div><div class="field-value">Org admins control installation. Repo admins opt in/out.</div><div class="field-label">Secrets Management</div><div class="field-value">Private key in Azure Key Vault. Managed identity for Azure OpenAI.</div><div class="field-label">Vulnerability Management</div><div class="field-value">Trivy container scanning in CI/CD. Dependabot for dependencies.</div>'
  },
  {
    category: 'ops', tagClass: 'tag-ops', tagLabel: 'Operations',
    agentMessages: [
      '<span class="category-tag tag-ops">Operations</span>\n\nOperational readiness, even for internal tools.',
      'Specify:\n1. <strong>Monitoring</strong>\n2. <strong>Deployment</strong>\n3. <strong>Incident handling</strong>\n4. <strong>Capacity</strong>'
    ],
    userResponse: '<strong>Monitoring:</strong> Azure Monitor + custom metrics. Teams alerts.\n\n<strong>Deployment:</strong> GitHub Actions CI/CD. Rolling updates with auto-rollback.\n\n<strong>Incident:</strong> Team-owned. One-click disable. No formal SLA.\n\n<strong>Capacity:</strong> ~200 PRs/day. HPA to 3 pods.',
    proposalContent: '<div class="field-label">Monitoring</div><div class="field-value">Azure Monitor + custom metrics. Teams alerts.</div><div class="field-label">Deployment</div><div class="field-value">GitHub Actions CI/CD. Rolling updates with auto-rollback.</div><div class="field-label">Incident Handling</div><div class="field-value">Team-owned. Non-critical. One-click disable. No formal SLA.</div><div class="field-label">Capacity</div><div class="field-value">~200 PRs/day. Single pod baseline, HPA to 3 pods.</div>'
  },
  {
    category: 'gov', tagClass: 'tag-gov', tagLabel: 'Governance',
    agentMessages: [
      '<span class="category-tag tag-gov">Governance</span>\n\nFinal section. Governance often has the weakest coverage on internal tool proposals.',
      'Address:\n1. <strong>Responsible AI</strong>\n2. <strong>Human oversight</strong>\n3. <strong>Model lifecycle</strong>\n4. <strong>Bias considerations</strong>'
    ],
    userResponse: '<strong>Responsible AI:</strong> AI comments labeled as AI-generated. Confidence indicators. Advisory only.\n\n<strong>Human Oversight:</strong> Engineers dismiss any comment. No auto-merge. Managers disable per-repo.\n\n<strong>Model Lifecycle:</strong> Golden test suite (50 PRs). Version pinning. Rollback.\n\n<strong>Bias:</strong> Quarterly spot-check (20 reviews) for tone/inclusivity.',
    proposalContent: '<div class="field-label">Responsible AI</div><div class="field-value">AI comments labeled. Confidence indicators. Advisory only.</div><div class="field-label">Human Oversight</div><div class="field-value">Engineers dismiss any comment. No auto-merge. Managers disable per-repo.</div><div class="field-label">Model Lifecycle</div><div class="field-value">Golden test suite (50 PRs). Version pinning. Rollback procedure.</div><div class="field-label">Bias Monitoring</div><div class="field-value">Quarterly spot-check (20 reviews) for tone/inclusivity.</div>'
  }
];

var currentChatStep = -1;
var chatAnimating = false;

function advanceChat() {
  if (chatAnimating) return;
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

  var typingMsg = createMessage('agent', 'ARCHITECT', '<div class="typing-indicator"><span></span><span></span><span></span></div>');
  container.appendChild(typingMsg);
  scrollChat();

  setTimeout(function() {
    container.removeChild(typingMsg);
    container.appendChild(createMessage('agent', 'ARCHITECT', step.agentMessages[0]));
    scrollChat();
    setTimeout(function() {
      container.appendChild(createMessage('agent', 'ARCHITECT', step.agentMessages[1]));
      scrollChat();
      setTimeout(function() {
        container.appendChild(createMessage('user', 'ENGINEER', step.userResponse));
        scrollChat();
        setTimeout(function() {
          fillProposalSection(step.category, step.proposalContent);
          updateProgress(stepNum);
          chatAnimating = false;
          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
          nextBtnText.textContent = currentChatStep === chatSteps.length - 1 ? 'Submit for Review \u2192' : 'Next Section \u2192';
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
  avatar.textContent = role === 'agent' ? 'A' : 'E';
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
  setTimeout(function() { container.scrollTop = container.scrollHeight; }, 50);
}

function fillProposalSection(category, content) {
  var sectionContent = document.getElementById('content-' + category);
  var sectionEl = document.getElementById('ps-' + category);
  var checkEl = document.getElementById('check-' + category);
  if (sectionContent) { sectionContent.innerHTML = content; sectionContent.style.animation = 'fadeIn 0.5s ease'; }
  if (sectionEl) { sectionEl.classList.add('completed'); }
  if (checkEl) { checkEl.classList.add('done'); checkEl.innerHTML = '\u2713'; }
}

function updateProgress(stepNum) {
  var pct = Math.round((stepNum / chatSteps.length) * 100);
  var el = document.getElementById('proposalProgress');
  if (el) el.textContent = pct + '% Complete';
}

/* ---- Reviewer Agent (Deterministic) ---- */
var reviewStarted = false;

function startReview() {
  if (reviewStarted) return;
  reviewStarted = true;
  var btn = document.getElementById('startReviewBtn');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Evaluating...</span>';
  var sections = document.querySelectorAll('.review-section');
  var delay = 0;
  sections.forEach(function(section) {
    delay += 900;
    setTimeout(function() { evaluateSection(section); }, delay);
  });
  setTimeout(function() {
    showOverallAssessment();
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Review Complete</span>';
    btn.style.opacity = '1';
  }, delay + 1200);
}

function evaluateSection(section) {
  section.classList.add('evaluated');
  var fill = section.querySelector('.review-score-fill');
  var numEl = section.querySelector('.review-score-num');
  var target = parseInt(fill.getAttribute('data-target'));
  var color = target >= 85 ? 'var(--green)' : target >= 75 ? 'var(--teal-500)' : target >= 70 ? 'var(--amber)' : 'var(--red)';
  fill.style.background = color;
  fill.style.width = target + '%';
  animateNumber(numEl, 0, target, 1000);
  section.querySelectorAll('.finding').forEach(function(f, i) {
    setTimeout(function() { f.classList.add('revealed'); }, 300 + i * 200);
  });
}

function animateNumber(el, start, end, duration) {
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var p = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    var cur = Math.round(start + (end - start) * eased);
    el.textContent = cur + '%';
    el.style.color = cur >= 85 ? 'var(--green)' : cur >= 75 ? 'var(--teal-400)' : cur >= 70 ? 'var(--amber)' : 'var(--red)';
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function showOverallAssessment() {
  var el = document.getElementById('overallAssessment');
  el.innerHTML = '<div class="assessment-result">' +
    '<div class="assessment-verdict"><span class="verdict-badge verdict-conditional">\u26A0 CONDITIONAL</span>' +
    '<span style="font-size:12px;color:var(--text-muted);font-family:\'JetBrains Mono\',monospace;">R_eff = 0.69 · round(0.69 × 100) = 69 · Tier: internal-tool · Threshold: ≥ 0.75</span></div>' +
    '<div class="assessment-summary"><strong>Gate decision: CONDITIONAL.</strong> Overall R_eff = 0.69. Bottleneck: Security (0.69). Two high-severity fails plus one abstain hold the score below approve.</div>' +
    '<div class="assessment-stats">' +
    '<div class="assessment-stat"><span class="stat-value" id="overall-score">\u2014</span><span class="stat-label">R_eff (overall)</span></div>' +
    '<div class="assessment-stat"><span class="stat-value" style="color:var(--green);">18</span><span class="stat-label">Pass</span></div>' +
    '<div class="assessment-stat"><span class="stat-value" style="color:var(--red);">3</span><span class="stat-label">Fail</span></div>' +
    '<div class="assessment-stat"><span class="stat-value" style="color:var(--blue);">2</span><span class="stat-label">Abstain</span></div>' +
    '<div class="assessment-stat"><span class="stat-value" style="color:var(--amber);">1</span><span class="stat-label">Degrade</span></div>' +
    '</div></div>';
  el.style.animation = 'fadeIn 0.6s ease';
  var scoreEl = document.getElementById('overall-score');
  if (scoreEl) animateNumber(scoreEl, 0, 69, 1500);
}

/* ---- Delta Engine ---- */
var deltaStarted = false;

function startDelta() {
  if (deltaStarted) return;
  deltaStarted = true;
  var btn = document.getElementById('startDeltaBtn');
  btn.disabled = true;
  btn.style.opacity = '0.5';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>Computing...</span>';

  var algoNote = document.querySelector('.delta-algo-note');
  if (algoNote) setTimeout(function() { algoNote.classList.add('revealed'); }, 400);

  var primaryItems = document.querySelectorAll('.delta-items:not(.delta-alt-items) .delta-item');
  var delay = 800;
  primaryItems.forEach(function(item) {
    delay += 800;
    setTimeout(function() {
      item.classList.add('revealed');
      setTimeout(function() { item.classList.add('applied'); }, 400);
    }, delay);
  });

  setTimeout(function() {
    document.getElementById('deltaProjection').classList.add('revealed');
  }, delay + 800);

  setTimeout(function() {
    var altLabel = document.querySelector('.alt-label');
    if (altLabel) altLabel.classList.add('revealed');
    document.querySelectorAll('.delta-alt-items .delta-item').forEach(function(item, idx) {
      setTimeout(function() { item.classList.add('revealed'); }, idx * 600);
    });
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Delta Computed</span>';
    btn.style.opacity = '1';
  }, delay + 1400);
}

/* ---- API Health Check on Load ---- */
function checkApiHealth() {
  var statusEl = document.getElementById('apiStatus');
  if (!API_BASE_URL) {
    statusEl.innerHTML = '<span class="api-offline">API not configured</span>';
    return;
  }
  statusEl.innerHTML = '<span class="api-checking">Checking API...</span>';
  fetch(API_BASE_URL + '/api/health').then(function(res) {
    return res.json();
  }).then(function(data) {
    if (data.status === 'ok') {
      statusEl.innerHTML = '<span class="api-online">API online · v' + esc(data.version || '?') + '</span>';
    } else {
      statusEl.innerHTML = '<span class="api-offline">API error</span>';
    }
  }).catch(function() {
    statusEl.innerHTML = '<span class="api-offline">API offline</span>';
  });
}

/* ---- Initialize ---- */
document.addEventListener('DOMContentLoaded', function() {
  switchTab('hero');
  checkApiHealth();
});
