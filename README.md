# aiden-demo

Public demo for **AIDEN**, an internal engineering pre‑review gate.

**Live demo:** https://aiden-demo.vercel.app

## What this demo is
One use case only: an internal **AI code review assistant** for engineering workflow / CI‑CD.

AIDEN helps internal engineering teams turn rough AI proposals into review‑ready packets by finding missing evidence early, generating the few architecture views reviewers need, and issuing a deterministic pre‑review recommendation before a human decision.

## Public contract (3 promises)
1. It shows what is missing before human review.
2. It gives reviewers only the evidence that matters.
3. It never replaces the human gate.

## How the demo is presented
One product with:
- **Authoring help** (Architect Assist)
- **Reviewer prep** (Reviewer Assist)
- **Deterministic baseline** (authoritative recommendation)

Runtime guardrails (budgets, redaction, tool allowlist, fallback, escalation) stay visible as evidence, not as a separate product identity.

## Public demo safety contract
- Sanitized sample data only
- No autonomous writes
- No open-web browsing
- Human review required
- Deterministic fallback available
- Tool allowlist enforced
- Trace redaction enforced
- Step / tool-call / time / cost-token budgets are visible
- Escalation condition is visible

### Budget envelope
- **Architect Assist** — step budget: 8, tool-call budget: 4, time budget: 60 seconds, cost/token budget: 4,000 tokens and $0.10
- **Reviewer Assist** — step budget: 10, tool-call budget: 5, time budget: 90 seconds, cost/token budget: 6,000 tokens and $0.15

### Escalation condition
The runtime escalates when safety checks fail, budgets are exhausted, confidence stays low, policies conflict, or deterministic fallback is engaged after a live-assist attempt.

## Modes
- **Deterministic** — authoritative baseline and source of truth
- **Live Assist** — visible bounded assistive path with typed tools, redaction, fallback, and escalation

## Runtime evidence shown in the UI
The demo visibly exposes:

- mode selected
- policy pack refs used
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
`config.js` controls the backend at runtime.

- Generate it from env: `AIDEN_ENGINE_BASE_URL=https://your-engine-host node scripts/render-runtime-config.mjs`
- Set `AIDEN_ENGINE_BASE_URL` to empty string to force deterministic-only mode
- `app.js` reads `window.AIDEN_CONFIG.engineBaseUrl`; it no longer carries a literal backend host

The backend repo is [modern-literacy/aiden-engine](https://github.com/modern-literacy/aiden-engine).

## Running locally
Open `index.html` in a browser. No build step or server is required.

## Files
- `index.html` — main UI, contract block, assistive role surfaces, architecture tab
- `config.js` — runtime engine URL config loaded before the app
- `app.js` — mode switching, API client, evidence rendering, safety and trace panels
- `scripts/render-runtime-config.mjs` — writes `config.js` from `AIDEN_ENGINE_BASE_URL`
- `style.css` — static design system and responsive layout
- `tests/public-launch.test.mjs` — text-based public contract regression checks

## Ownership
Owned by the **Developer Relations** team. See `CODEOWNERS` for review assignments.
