# aiden-demo

Stakeholder-facing public demo for AIDEN.

**Live demo:** https://aiden-demo.vercel.app

## What this demo is
The public demo presents AIDEN as a **governed decision system with bounded agentic assistance**.

- **Architect Assist** — proposal shaping, gap detection, clarification prompts
- **Reviewer Assist** — policy interpretation support, evidence-linked explanations, remediation drafting
- **Hidden runtime role: Safety Governor / Operational Gate** — tool allowlist enforcement, redaction, budgets, fallback, escalation, unsafe-output blocking
- **Deterministic gate** — authoritative baseline for policy evaluation, scoring, and gate outcomes

## Public Demo Contract
The public demo makes these promises:

- Sanitized sample data only
- No autonomous writes
- No open-web browsing
- Human review required
- Deterministic fallback available
- Tool allowlist enforced
- Trace redaction enforced
- Step budget enforced
- Tool-call budget enforced
- Time budget enforced
- Cost/token budget enforced
- Escalation condition is visible

### Budget envelope
- **Architect Assist** — step budget: 8, tool-call budget: 4, time budget: 60 seconds, cost/token budget: 4,000 tokens and $0.10
- **Reviewer Assist** — step budget: 10, tool-call budget: 5, time budget: 90 seconds, cost/token budget: 6,000 tokens and $0.15

### Escalation condition
The runtime escalates when safety checks fail, budgets are exhausted, confidence stays low, policies conflict, or deterministic fallback is engaged after a live-assist attempt.

## Modes
- **Deterministic** — authoritative baseline and source of truth
- **Shadow** — bounded assistive comparison beside the deterministic baseline
- **Live Assist** — visible bounded assistive path with typed tools, redaction, fallback, and escalation

## Runtime evidence shown in the UI
The demo visibly exposes:

- mode selected
- policy lock refs used
- tools called
- step count and tool-call count
- trace id
- fallback status
- escalation status
- safety and budget panel
- evidence references
- remediation suggestions
- confidence and uncertainty markers

## API configuration
The `API_BASE_URL` variable in `app.js` controls the backend.

- Current: `https://aiden-engine.vercel.app`
- Set to empty string `''` to force deterministic-only mode

The backend repo is [modern-literacy/aiden-engine](https://github.com/modern-literacy/aiden-engine).

## Running locally
Open `index.html` in a browser. No build step or server is required.

## Files
- `index.html` — main UI, contract block, assistive role surfaces, architecture tab
- `app.js` — mode switching, API client, evidence rendering, safety and trace panels
- `style.css` — static design system and responsive layout
- `tests/public-launch.test.mjs` — text-based public contract regression checks

## Ownership
Owned by the **Developer Relations** team. See `CODEOWNERS` for review assignments.
