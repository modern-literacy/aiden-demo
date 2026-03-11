# aiden-demo

Stakeholder-facing interactive demo for the AIDEN (Architecture Intake & Decision Engine) system.

## Overview

This is a self-contained HTML/CSS/JS demo that showcases AIDEN's core capabilities:

- **Author Copilot** — Guided proposal authoring with real-time gap detection
- **Review Engine** — Four-outcome evaluator (pass/fail/abstain/degrade) with R_eff scoring
- **Delta Engine** — Computes the minimum path from CONDITIONAL to APPROVE
- **Architecture Overview** — System design, tier thresholds, and scoring methodology

The demo uses a seeded scenario (AI Code Review Assistant at internal-tool tier) to walk through the full proposal-to-gate-decision lifecycle.

## Running Locally

Open `index.html` in a browser. No build step or server required.

## Files

- **`index.html`** — Main page with sidebar navigation and all tab sections
- **`app.js`** — Application logic: tab switching, chat simulation, review animation, delta computation
- **`style.css`** — Dark-mode enterprise design system with responsive layout

## Ownership

Owned by the **Developer Relations** team. See `CODEOWNERS` for review assignments.
