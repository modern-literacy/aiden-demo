# AIDEN — Phase F Engineering Handoff

**Date:** 2026-03-11
**Handoff from:** Automated build session (Phases D + E complete)
**Handoff to:** Engineer completing Phase F (Demo Update + Vercel Deployment)

---

## Executive Summary

AIDEN is a multi-repo AI governance workbench. The engine, agent runtime, safety policies, and Vercel serverless functions are all **built, tested, and pushed to GitHub**. What remains is:
1. **Rotate and scrub secrets before the visibility flip**
2. **Review old GitHub Actions workflow logs and artifacts before anything becomes public**
3. **Update the demo UI** (aiden-demo repo) with bounded public-safe defaults
4. **Deploy aiden-engine to production via Git push** (GitHub-connected Vercel project)
5. **Deploy aiden-demo to production via Git push** (GitHub-connected Vercel project)

This document has everything you need for the public launch pass.

---

## Public Launch Hygiene

The repo topology is already the right public story: 1 hub + 7 delivery repos, engine-owned contracts, pinned policy refs, and repo-level governance. The remaining work is launch hygiene, narrative clarity, and live-demo safety.

### GitHub governance story (public narrative)

Use this framing in org docs, README copy, and interviews:

> We’ve configured enterprise-grade GitHub governance and code-security controls across the org. Merge behavior is standardized, secret leakage is actively prevented, and dependency hygiene is automated. The repo split then mirrors real ownership boundaries, so governance and architecture line up instead of fighting each other.

Keep the explanation grounded in four concrete buckets:

1. **Governance and change control**
   - Mandatory PR flow
   - Standardized merge path
2. **Secret protection**
   - Secret scanning
   - Push protection
3. **Supply-chain hygiene**
   - Dependency graph
   - Dependabot alerts
   - Dependabot security updates
4. **Merge hygiene and history quality**
   - Squash-oriented merge behavior
   - Auto-delete head branches

Important wording nuance:

- Say **enterprise-grade GitHub controls** or **enterprise-style governance and security on GitHub**
- Do **not** say “GitHub Enterprise-only features” unless the plan tier is confirmed

Current verification note:

- Repo-level controls are confirmed via GitHub API across all eight repos.
- `CODEOWNERS` is **not** currently healthy: every repo has a validation error because the org currently has no teams, so the referenced team owners are not resolvable.
- Org-level rulesets are **not configured**: `/orgs/modern-literacy/rulesets` currently returns no rulesets.
- Org-level Actions policy **is configured**: Actions are enabled for all repos, limited to GitHub-owned plus verified-creator actions, default workflow token permissions are read-only, and workflows cannot approve pull-request reviews. SHA pinning is not currently required.
- Org-level custom properties **exist but are only partially applied**: the org schema is present, but only the `aiden` hub repo currently has values assigned.
- An org-level code security configuration exists, but it is **draft only in practice**: the “GitHub recommended” configuration is `unenforced` and attached to zero repositories.

### Before the visibility flip

1. **Rotate and scrub secrets**
   - Rotate any credential that may have touched a repo, workflow log, screenshot, or local script.
   - Review workflow logs and artifacts from GitHub Actions before opening the org. Public repositories expose historical workflow logs.
   - Keep runtime credentials only in Vercel environment variables and redeploy after changing them.
2. **Strip accidental private noise**
   - Remove absolute local paths such as `/Users/stas-studio/...` from docs, screenshots, templates, and log output.
3. **Add central trust files**
   - Create a `.github` repository with shared `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SUPPORT.md`, and issue / PR templates.
   - Enable private vulnerability reporting so security reports do not end up in public Issues.
4. **Curate the org front door**
   - Publish an organization profile README and pin the repos in tour order: `aiden`, `aiden-engine`, `aiden-demo`, one policy repo, `aiden-tools`, `aiden-api`.
   - Label `aiden-api` as intentionally scaffolded and `aiden-policies-controls` as transitional where appropriate.
5. **Do the browser smoke test for real**
   - Run deterministic, shadow, and live-assist end to end in production.
   - Verify fallback behavior and error banners.
   - Record a short proof-of-life GIF for the hub README.

### Highest-value next GitHub controls

After the public launch baseline is stable, the next layer should be:

1. **Org-level required workflows**
   - Centralize baseline CI and security checks.
   - Require them to pass before merge.
2. **Expand the existing custom-property schema**
   - Fill in metadata consistently across repos instead of leaving seven repositories unclassified.
   - Use those properties to target rulesets by repo class instead of applying the same policy everywhere.
3. **Dependency review as a required PR gate**
   - Especially for `aiden-engine`, `aiden-api`, and `aiden-tools`.
4. **Code scanning / CodeQL**
   - Turn on at least for `aiden-engine`, `aiden-api`, and `aiden-tools`.
   - Treat security findings as delivery blockers at agreed severities.
5. **Protected deployment environments**
   - Require human approval for production deploy jobs.
   - Keep environment secrets locked until approval.
6. **Tighten GitHub Actions hardening**
   - Keep the current org policy and add SHA pinning plus narrower reusable-workflow allowlists where needed.
7. **Private vulnerability reporting + `SECURITY.md`**
   - Keep security reports out of public issues.
8. **A shared `.github` repository**
   - Default `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue templates, and PR templates.
9. **Merge queue for busier repos**
   - Useful once `aiden-engine` starts carrying multiple concurrent PRs.
10. **Tag rulesets for releases**
    - Protect `v*` tags and release provenance.
11. **Teams and granular repository roles**
    - Prefer explicit team ownership and scoped roles over blanket admin.
12. **Org profile and pinned repos**
    - Force the tour order instead of relying on discovery by accident.

Priority order for the next wave: **required workflows**, **custom properties**, then **CodeQL plus dependency review**.

### Launch order

1. Secret rotation and log scrub
2. Browser smoke test + GIF
3. Demo labeling and responsible-AI contract
4. Community / security files
5. Org profile and pinned repos
6. Visibility flip


---

## GitHub Organization

**Org:** `modern-literacy` (private repos)
**Owner:** `venikman`

| Repo | Files | Purpose | Status |
|------|-------|---------|--------|
| `aiden` | 12 | Hub / front door, architecture docs | Done |
| `aiden-engine` | 87 | Core engine, agent runtime, Vercel functions | Done — needs Vercel deploy |
| `aiden-api` | 14 | .NET schema-first API scaffold | Done |
| `aiden-policies-hipaa` | 6 | Privacy / PHI policy (tagged v1.0.0) | Done |
| `aiden-policies-controls` | 11 | Runtime safety / agent controls | Done |
| `aiden-policies-arch` | 6 | Architecture discipline rules | Done |
| `aiden-tools` | 10 | Python eval / replay / reporting | Done |
| `aiden-demo` | 6 | Interactive showcase (index.html, app.js, style.css) | **NEEDS UPDATE** |

---

## What's Already Built

### Agent Runtime (aiden-engine, 87 files, 153 tests passing)

```
src/agent/
├── planner.ts          — Builds prompts per agent step
├── step-loop.ts        — Core agent loop: plan → act → observe (bounded)
├── tool-router.ts      — Dispatches tool calls, validates I/O, enforces allowlist
├── budget-guard.ts     — Tracks step/token/cost/time limits
├── safety-gate.ts      — Pre-flight input + post-flight output checks
├── trace-writer.ts     — Records every step into structured trace
├── redaction.ts        — Strips PHI/sensitive fields
└── types.ts            — Agent-specific type definitions

src/providers/
├── llm-provider.ts     — Provider interface (abstract)
└── openrouter-provider.ts — OpenRouter (OpenAI-compatible, raw fetch, no SDK)

src/tools/
├── policy-lookup.ts    — Retrieves policy rules for domain/topic
├── precedent-lookup.ts — Searches synthetic precedent history
├── delta-check.ts      — Computes R_eff impact of waiving findings
├── schema-validate.ts  — Validates proposal against schema
└── tool-registry.ts    — Central registry

src/agents/
├── architect-agent.ts  — System prompt, tool allowlist, profile
└── reviewer-agent.ts   — System prompt, tool allowlist, profile
```

### Vercel Serverless Functions (already in aiden-engine repo)

```
api/
├── architect.ts   — POST /api/architect
├── reviewer.ts    — POST /api/reviewer
├── health.ts      — GET /api/health
├── _shared.ts     — Rate limiter, policy loader, deterministic pipeline
└── tsconfig.json
vercel.json        — Routing, CORS headers, function config
```

### Safety Policies (32 rules across 3 repos)

All pushed and tagged. Policy repos contain YAML rules for:
- Agent runtime budgets, tool allowlists, escalation triggers
- PHI redaction, prompt injection guards, data minimization
- Architecture traceability, fallback behavior, schema versioning

---

## What Remains (Phase F)

### Task 1: Update aiden-demo UI

The current demo is a **static deterministic-only** showcase (index.html + app.js + style.css, ~97KB total). It needs to become a **bounded live agent demo** that calls the Vercel-hosted endpoints without becoming easy to misread.

#### Required UI Changes

**A. Mode Toggle (top of each agent view)**
- Three-way toggle: `Deterministic` | `Shadow` | `Live Assist`
- Default to `Deterministic` (no API key needed for this mode — deterministic runs server-side too, but the static version can continue to work client-side as fallback)
- Treat `Deterministic` and `Shadow` as the public-safe defaults
- Treat `Live Assist` as budget-limited live assist
- When `Live Assist` or `Shadow` is selected, the UI calls the Vercel API
- If live assist is unavailable or quota-limited, fall back cleanly to deterministic mode

**B. Two-Agent Sequential Flow**
The demo should show a clear two-step pipeline:
1. **Architect Agent** — analyzes the proposal, finds gaps, suggests improvements
2. **Reviewer Agent** — evaluates against policies, produces R_eff and gate decision

The existing tabs (Author Copilot → Review Engine → Delta Engine) map to this. The key change is that in `live-assist` mode, the copilot and reviewer tabs call real API endpoints instead of playing scripted animations.

**C. Side-by-Side Comparison Layout (Shadow Mode)**
When mode = `shadow`:
- Left panel: deterministic output (current behavior)
- Right panel: live agent output (from API)
- This is the strongest visual for showing the agent adds value

**D. Safety Panel**
Show at the bottom or as a collapsible side panel:
- Provider / model disclosure
- Human review required
- No autonomous writes
- No open-web browsing
- Model used (e.g., `minimax/minimax-m2.5`)
- Tools allowed (list from agent profile)
- Redaction applied (yes/no)
- Steps used / max allowed
- Tokens used / budget
- Cost (estimated)
- Wall clock time
- Escalation triggered or not
- Safety gate status (ok / flagged)
- Trace ID

**E. Trace Viewer**
Expandable panel showing the agent's step-by-step trace:
- Each step: LLM request → response → tool calls → tool results
- Tool calls highlighted with input/output
- Redacted fields shown as `[REDACTED-*]`
- Timestamps and durations

**F. Keep Existing Deterministic Demo Working**
The current scripted flow (Author Copilot chat → Review Engine → Delta Engine) should still work when mode = `deterministic`. This is the fallback when no API is available.

**G. Make the demo impossible to misread**
- Add a banner near the scenario explaining that this is an intentionally incomplete sample proposal
- Surface synthetic precedent data high on the page
- Use public-safe wording such as `illustrative demo telemetry only`

**H. Do not lead with waivers**
- Keep the exception-intelligence scenario
- Add a remediation-first default scenario in the Delta tab so the first impression is disciplined control closure rather than waiver-seeking

#### API Contract (what the demo calls)

**Base URL:** Set via a config constant at the top of app.js. Will be the Vercel deployment URL for aiden-engine (e.g., `https://aiden-engine.vercel.app`).

**POST /api/architect**
```json
{
  "proposal": { /* full proposal object — use the sample below */ },
  "mode": "deterministic" | "shadow" | "live-assist"
}
```

Response:
```json
{
  "mode": "live-assist",
  "result": {
    "summary": "...",
    "completeness_score": 72,
    "gaps_found": [{ "field": "...", "issue": "...", "severity": "...", "policy_ref": "..." }],
    "clarifying_questions": ["..."],
    "recommendations": [{ "action": "...", "rationale": "...", "policy_ref": "..." }],
    "confidence": "medium",
    "uncertainty_notes": "..."
  },
  "trace": { /* full AgentTrace object — see types below */ },
  "deterministic_result": null,
  "budget_summary": { "steps_used": 4, "steps_limit": 8, "tokens_used": 2100, "tokens_limit": 4000, ... },
  "safety_status": "ok",
  "timestamp": "2026-03-11T...",
  "trace_id": "uuid"
}
```

For `shadow` mode, `deterministic_result` is populated alongside `result` (the agent result).

**POST /api/reviewer**
Same request shape. Response `result` follows the ReviewerOutput schema:
```json
{
  "summary": "...",
  "findings": [{ "rule_id": "SEC-VUL-002", "status": "fail", "evidence": "...", "severity": "high" }],
  "overall_recommendation": "CONDITIONAL",
  "r_eff_estimate": 0.69,
  "key_risks": ["..."],
  "remediation_path": [{ "action": "...", "impact": "...", "effort": "..." }],
  "confidence": "medium",
  "uncertainty_notes": "..."
}
```

**GET /api/health**
```json
{ "status": "ok" }
```

#### Sample Proposal (embed in app.js)

Use this as the demo proposal sent to both endpoints:

```yaml
id: "2026-03-09_ai-code-review-assistant"
name: "AI Code Review Assistant"
team: "Platform Engineering"
submitted_by: "submitter.test"
submitted_at: "2026-03-09T10:00:00Z"

scope:
  tier: internal-tool
  phi: false
  deployment_boundary: internal-aks
  model_boundary: azure-openai-enterprise
  user_cohort: internal-engineers-300
  time_window: 180d
  platform_version: "2026.03"

overview:
  description: "LLM-powered code review assistant for internal GitHub Enterprise PRs"
  function: "Static analysis + LLM review comments on pull requests"
  users: "~300 internal software engineers"
  integration: "GitHub Enterprise + Azure OpenAI"

data:
  classification: "Confidential (source code). Internal (review comments). No PHI/PII."
  flow: "GitHub Enterprise API → Azure OpenAI (enterprise tenant, in-boundary) → PR comments"
  model_training: "Opt-out confirmed. Enterprise agreement prohibits training on input/output."
  retention: "PR comments in GitHub. Audit logs in SIEM (2-year retention)."
  data_classification_label: null

architecture:
  hosting: "AKS pod (internal dev tools cluster). Single-region."
  integration: "GitHub App (webhook on PR events). REST API for diffs, GraphQL for comments."
  model: "GPT-4o via Azure OpenAI Service (enterprise tenant). 8K token context."
  availability: "Non-critical. PRs proceed without AI review if service is down."
  load_testing: null

security:
  authentication: "GitHub App JWT (private key). Azure OpenAI via managed identity. mTLS within AKS."
  authorization: "Org admins control installation. Repo admins opt in/out."
  secrets_management: "Private key in Azure Key Vault. Managed identity for Azure OpenAI."
  vulnerability_management: "Trivy container scanning in CI/CD. Dependabot for dependencies."
  break_glass_procedure: null
  binary_authorization: null
  network_segmentation: null

operations:
  monitoring: "Azure Monitor (pod health, API latency). Custom metrics. Teams alerts."
  deployment: "GitHub Actions CI/CD. Rolling updates with auto-rollback."
  incident_handling: "Team-owned. Non-critical. One-click disable via GitHub App."
  capacity: "~200 PRs/day. Single pod baseline, HPA to 3 pods."
  runbook: null
  sla: "No formal SLA"

governance:
  responsible_ai: "AI comments labeled as AI-generated. Confidence indicators. Advisory only."
  human_oversight: "Engineers dismiss any comment. No auto-merge. Managers can disable per-repo."
  model_lifecycle: "Golden test suite (50 PRs) validation. Version pinning. Rollback procedure."
  bias_monitoring: "Quarterly spot-check (20 reviews) for tone/inclusivity."
  harmful_suggestions_procedure: null
```

Convert this to a JS object in app.js. The fields with `null` are intentional — they represent gaps the agent should find.

#### Design Guidelines

- **Keep the existing dark theme** (navy/slate background, teal accent, gold secondary)
- **Keep the existing sidebar navigation** — add or adjust nav items as needed
- **Use existing CSS variables** — `--teal-400`, `--gold-500`, `--green`, `--red`, `--amber`, `--blue`, etc.
- **Fonts:** Inter (body) + JetBrains Mono (code/data)
- **Keep it a single-page app** — no build tools, no framework, pure HTML/CSS/JS
- **CORS:** The Vercel functions already return `Access-Control-Allow-Origin: *`
- **Loading states:** Show a spinner/skeleton while waiting for API responses (live-assist can take 10-30s)
- **Error handling:** If the API call fails, show an error message and offer to fall back to deterministic mode

#### Recommended Nav Structure

```
Overview          — existing hero tab (keep as-is)
Architect Agent   — was "Author Copilot" — now calls /api/architect in live modes
Reviewer Agent    — was "Review Engine" — now calls /api/reviewer in live modes
Delta Engine      — keep existing deterministic behavior
Architecture      — keep existing architecture tab
```

### Task 2: Deploy aiden-engine to production via Git push

**Prerequisites:**
- Vercel account linked to the `modern-literacy` GitHub org
- OpenRouter API key (user creates at https://openrouter.ai/keys)

**One-time setup:**

1. Go to https://vercel.com/new
2. Import `modern-literacy/aiden-engine`
3. Framework preset: "Other"
4. Build command: `npm run build` (already set in vercel.json)
5. Output directory: `dist` (already set in vercel.json)
6. Add environment variable:
   - Key: `OPENROUTER_API_KEY`
   - Value: (the API key)
7. Confirm that the production environment is wired to the repo’s production branch

**Normal production deploy flow:**

1. Push tested changes to the production branch on GitHub
2. Let Vercel build and deploy from the Git push
3. Do **not** deploy locally from a laptop/CLI for production
4. After deployment, keep strict public budgets:
   - Keep `deterministic` and `shadow` as the default public experience
   - Keep `live-assist` rate-limited and budget-limited
   - Fall back to deterministic on quota exhaustion or provider failure

The `vercel.json` is already configured with:
- CORS headers for all `/api/*` routes
- Function runtime: `@vercel/node@3`
- Max duration: 60 seconds
- Rewrites for clean API paths

**After the production push deploy, test:**
```bash
# Health check
curl https://<your-deployment>.vercel.app/api/health

# Deterministic (no API key needed)
curl -X POST https://<your-deployment>.vercel.app/api/reviewer \
  -H "Content-Type: application/json" \
  -d '{"proposal": {"scope": {"tier": "internal-tool"}}, "mode": "deterministic"}'

# Live assist (needs OPENROUTER_API_KEY)
curl -X POST https://<your-deployment>.vercel.app/api/architect \
  -H "Content-Type: application/json" \
  -d '{"proposal": { ... full proposal ... }, "mode": "live-assist"}'
```

### Task 3: Deploy aiden-demo to production via Git push

After updating the demo code:

1. If needed, import `modern-literacy/aiden-demo` into Vercel once as a static site
2. Point `API_BASE_URL` in `app.js` at the production `aiden-engine` deployment
3. Push tested changes to `modern-literacy/aiden-demo` on the production branch
4. Let Vercel deploy from the Git push
5. Do **not** deploy production locally from a laptop/CLI

### Task 4: Update aiden-demo README

Update `README.md` in the aiden-demo repo to document:
- How the demo works
- The three modes
- How to configure the API URL
- Link to live demo

---

## Key Architecture Decisions (Do Not Change)

These are deliberate design decisions. Do not deviate:

1. **No real company names, no real human names** — use "a large healthcare payer" or "enterprise"
2. **FPF is internal only** — the hiring manager doesn't need to see FPF jargon
3. **Evaluator has 4 outcomes** — pass/fail/abstain/degrade (not "tri-state")
4. **Guard ≠ Gate** — guards produce evidence, gates make decisions
5. **Policy versions pinned per review run** — no implicit "latest"
6. **Demo use case:** AI Code Review Assistant (internal engineering enablement)
7. **Scalarization:** `round(R_eff × 100)`, no hidden adjustments
8. **Model:** `minimax/minimax-m2.5` via OpenRouter
9. **No openai npm package** — raw fetch against OpenRouter API
10. **Three runtimes:** .NET (API), TypeScript (engine), Python (tools)
11. **Pure static demo** — no build tools, no React/Vue/etc.

---

## Agent Budget Profiles (reference)

### Architect Agent
- Max steps: 8
- Max tool calls: 4
- Max tokens: 4,000
- Max cost: $0.10
- Max wall clock: 60s
- Allowed tools: `schema-validate`, `policy-lookup`

### Reviewer Agent
- Max steps: 10
- Max tool calls: 5
- Max tokens: 6,000
- Max cost: $0.15
- Max wall clock: 90s
- Allowed tools: `policy-lookup`, `precedent-lookup`, `delta-check`, `schema-validate`

---

## Trace Object Shape (for the trace viewer)

```typescript
interface AgentTrace {
  trace_id: string;
  agent_profile: string;        // "Architect Agent" or "Reviewer Agent"
  model: string;                // "minimax/minimax-m2.5"
  policy_versions: Record<string, string>;
  steps: TraceEvent[];          // Each step of the agent loop
  tool_calls: ToolCallRecord[]; // Each tool call with input/output/duration
  final_result?: unknown;       // The structured output
  budget_summary: {
    steps_used: number;
    steps_limit: number;
    tool_calls_used: number;
    tool_calls_limit: number;
    tokens_used: number;
    tokens_limit: number;
    cost_usd: number;
    cost_limit_usd: number;
    wall_clock_ms: number;
    wall_clock_limit_ms: number;
  };
  safety_checks: {
    input_check: { passed: boolean; reason?: string };
    output_check: { passed: boolean; reason?: string };
  };
  mode: 'deterministic' | 'shadow' | 'live-assist';
  deterministic_fallback_used?: boolean;
  started_at: string;
  completed_at: string;
}

interface TraceEvent {
  step_number: number;
  type: 'llm_request' | 'llm_response' | 'tool_call' | 'tool_result' | 'safety_check' | 'budget_exhausted' | 'final_result' | 'error';
  content: unknown;
  tokens?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  timestamp: string;
}

interface ToolCallRecord {
  tool_name: string;
  input: unknown;
  output: unknown;
  duration_ms: number;
  success: boolean;
  error?: string;
  timestamp: string;
}
```

---

## Safety Panel Data Mapping

The safety panel should display data from the API response:

| Field | Source |
|-------|--------|
| Mode | `response.mode` |
| Model | `response.trace.model` |
| Safety Status | `response.safety_status` ("ok" or "flagged") |
| Steps Used | `response.budget_summary.steps_used` / `steps_limit` |
| Tokens Used | `response.budget_summary.tokens_used` / `tokens_limit` |
| Cost | `response.budget_summary.cost_usd` / `cost_limit_usd` |
| Wall Clock | `response.budget_summary.wall_clock_ms` / `wall_clock_limit_ms` |
| Tools Allowed | From agent profile (hardcode or get from trace) |
| Input Safety | `response.trace.safety_checks.input_check.passed` |
| Output Safety | `response.trace.safety_checks.output_check.passed` |
| Redaction | "enabled" (hardcoded — always on) |
| Escalation | Check if `safety_status === "flagged"` |
| Trace ID | `response.trace_id` |
| Deterministic Fallback | `response.trace.deterministic_fallback_used` |

---

## CSS Variables Reference (from existing style.css)

```css
--teal-400: #5eead4;    /* Primary accent */
--teal-700: #0A6E75;    /* Button background */
--gold-500: #D4A843;    /* Secondary accent */
--green: #22c55e;       /* Pass / success */
--red: #ef4444;         /* Fail / error */
--amber: #f59e0b;       /* Warning / conditional */
--blue: #3b82f6;        /* Abstain / info */
--purple: #a855f7;      /* Special */
--bg-app: #0c1118;      /* App background */
--bg-card: #162032;     /* Card background */
--bg-elevated: #1a2740; /* Elevated surface */
--text-primary: #e2e8f0;
--text-secondary: #94a3b8;
--text-muted: #64748b;
```

---

## Files to Change

### aiden-demo repo (modern-literacy/aiden-demo)

| File | Action | Description |
|------|--------|-------------|
| `index.html` | **Rewrite** | Add mode toggle, restructure tabs, add safety panel section, add trace viewer section |
| `app.js` | **Rewrite** | Add API client, mode switching, live agent result rendering, safety panel, trace viewer, keep deterministic fallback |
| `style.css` | **Extend** | Add styles for mode toggle, safety panel, trace viewer, loading states, side-by-side layout |
| `README.md` | **Update** | Document the live agent demo, modes, setup |

### No changes needed in other repos

aiden-engine is complete. All policy repos are complete. Push tested changes to the production branches and let Git-connected hosting deploy them.

---

## Checklist

- [ ] Update `index.html` with mode toggle, safety panel, trace viewer sections
- [ ] Update `app.js` with API client, live agent rendering, embedded sample proposal
- [ ] Update `style.css` with new component styles
- [ ] Test deterministic mode still works without API (client-side fallback)
- [ ] Push updated demo to `modern-literacy/aiden-demo`
- [ ] Deploy `aiden-engine` to Vercel
- [ ] Set `OPENROUTER_API_KEY` env var in Vercel
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/architect` with deterministic mode
- [ ] Test `/api/reviewer` with deterministic mode
- [ ] Test `/api/architect` with live-assist mode
- [ ] Test `/api/reviewer` with live-assist mode
- [ ] Deploy `aiden-demo` to static hosting
- [ ] Update `API_BASE_URL` in app.js to point at engine deployment
- [ ] Update `aiden-demo/README.md`
- [ ] Verify end-to-end: demo → API → agent → response → UI

---

## Rate Limiting

The API has built-in rate limiting:
- 20 requests per minute per IP for `deterministic`
- 10 requests per minute per IP for `shadow`
- 5 requests per minute per IP for `live-assist`
- Best-effort (in-memory, resets on cold start)
- Returns 429 with message when exceeded
- Request body max: 50KB

---

## Troubleshooting

**"OPENROUTER_API_KEY environment variable is not set"**
→ Add the env var in Vercel project settings

**Deterministic mode returns error about unknown tier**
→ The proposal must include `scope.tier` matching one of: `internal-tool`, `production`, `critical-infrastructure`

**Live-assist returns 500**
→ Check Vercel function logs. Most likely the OpenRouter API key is invalid or the model is unavailable.

**CORS errors from demo**
→ The vercel.json already has `Access-Control-Allow-Origin: *`. If deploying behind a custom domain, verify headers.

**Agent returns fallback instead of live result**
→ The agent fell back to deterministic mode because of safety gate failure or budget exhaustion. Check `deterministic_fallback_used` in the trace.
