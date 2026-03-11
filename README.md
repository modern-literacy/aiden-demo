# aiden-demo

Stakeholder-facing interactive demo for the AIDEN (Architecture Intake & Decision Engine) system.

**Live demo:** https://aiden-demo.vercel.app

## Overview

This is a self-contained HTML/CSS/JS demo that showcases AIDEN's core capabilities:

- **Architect Agent** — Guided proposal authoring with real-time gap detection
- **Review Agent** — Four-outcome evaluator (pass/fail/abstain/degrade) with R_eff scoring
- **Delta Engine** — Computes the minimum path from CONDITIONAL to APPROVE
- **Architecture Overview** — System design, tier thresholds, and scoring methodology
The demo uses an intentionally incomplete sample proposal (AI Code Review Assistant at internal-tool tier) to walk through the full proposal-to-gate-decision lifecycle. Findings on the page are flaws in the sample submission, not flaws in AIDEN. Synthetic precedent data and illustrative demo telemetry are used throughout the public experience.

## Public Demo Contract

- **Provider / model disclosed** — OpenRouter with MiniMax M2.5
- **Sanitized sample data** — No production or customer proposal data
- **No autonomous writes** — The demo does not take write actions on external systems
- **No open-web browsing** — Agent tools are allowlisted and bounded
- **Human review required** — Outputs are advisory and reviewer-facing
- **Trace redaction enabled** — Sensitive fields are redacted before display
- **Deterministic fallback** — When live assist is unavailable, quota-limited, or disabled, the UI falls back cleanly to deterministic mode
The demo uses a seeded scenario (AI Code Review Assistant at internal-tool tier) to walk through the full proposal-to-gate-decision lifecycle.

## Agent Modes

Both the Architect and Reviewer tabs support three operating modes:

- **Deterministic** — Client-side only, no API calls. This is the public-safe default.
- **Live Assist** — Calls the real aiden-engine API. This path is budget-limited live assist with deterministic fallback if the API is unavailable or quota-limited.
- **Shadow** — Runs both deterministic and live-assist side-by-side for comparison. This is the other default public evaluation mode.

## Delta Scenarios

The Delta tab now keeps two narratives visible:

- **Remediation-First** — Public default. The best path closes missing controls before considering exceptions.
- **Exception Intelligence** — Preserves the waiver-heavy scenario as a secondary illustration of scoped exception reasoning.

## API Configuration

The `API_BASE_URL` variable in `app.js` controls the backend:

- Current: `https://aiden-engine.vercel.app`
- Set to empty string `''` to force deterministic-only mode (no API calls).

The backend repo is [modern-literacy/aiden-engine](https://github.com/modern-literacy/aiden-engine).

## Phase F handoff

See `HANDOFF-PHASE-F.md` for the engineering handoff (demo UI updates + Vercel deployment checklist).

## Launch asset

Before a public launch, run a browser smoke test in production across deterministic, shadow, and live-assist modes, then capture a short proof-of-life GIF for the hub README.

## Running Locally

Open `index.html` in a browser. No build step or server required.

## Files

- **`index.html`** — Main page with sidebar navigation, mode toggles, and all tab sections
- **`app.js`** — Application logic: mode switching, API client, live/shadow rendering, safety panel, trace viewer, deterministic animations
- **`style.css`** — Dark-mode enterprise design system with responsive layout

## Ownership

Owned by the **Developer Relations** team. See `CODEOWNERS` for review assignments.
