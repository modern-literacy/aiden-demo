# aiden-demo

Stakeholder-facing interactive demo for the AIDEN (Architecture Intake & Decision Engine) system.

**Live demo:** https://aiden-demo.vercel.app

## Overview

This is a self-contained HTML/CSS/JS demo that showcases AIDEN's core capabilities:

- **Architect Agent** — Guided proposal authoring with real-time gap detection
- **Review Agent** — Four-outcome evaluator (pass/fail/abstain/degrade) with R_eff scoring
- **Delta Engine** — Computes the minimum path from CONDITIONAL to APPROVE
- **Architecture Overview** — System design, tier thresholds, and scoring methodology

The demo uses a seeded scenario (AI Code Review Assistant at internal-tool tier) to walk through the full proposal-to-gate-decision lifecycle.

## Agent Modes

Both the Architect and Reviewer tabs support three operating modes:

- **Deterministic** — Client-side only, no API calls. Pre-scripted walkthrough of the seeded scenario.
- **Live Assist** — Calls the real aiden-engine API. The agent evaluates the embedded proposal via LLM (MiniMax M2.5 on OpenRouter) and returns structured results, safety metadata, and an execution trace.
- **Shadow** — Runs both deterministic and live-assist side-by-side for comparison.

## API Configuration

The `API_BASE_URL` variable in `app.js` controls the backend:

- Current: `https://aiden-engine.vercel.app`
- Set to empty string `''` to force deterministic-only mode (no API calls).

The backend repo is [modern-literacy/aiden-engine](https://github.com/modern-literacy/aiden-engine).

## Phase F handoff

See `HANDOFF-PHASE-F.md` for the engineering handoff (demo UI updates + Vercel deployment checklist).

## Running Locally

Open `index.html` in a browser. No build step or server required.

## Files

- **`index.html`** — Main page with sidebar navigation, mode toggles, and all tab sections
- **`app.js`** — Application logic: mode switching, API client, live/shadow rendering, safety panel, trace viewer, deterministic animations
- **`style.css`** — Dark-mode enterprise design system with responsive layout

## Ownership

Owned by the **Developer Relations** team. See `CODEOWNERS` for review assignments.
