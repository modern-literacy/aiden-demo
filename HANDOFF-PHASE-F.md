# AIDEN — Phase F Handoff Note

**Date:** 2026-03-11
**Status:** Archival engineering note

## Purpose
This file remains in the repo as a historical handoff marker for the public-launch pass. It is **not** the source of truth for the current public architecture, demo contract, or API response shape.

## Authoritative sources
- Hub/front door: `../aiden/README.md`
- Architecture and diagram set: `../aiden/docs/architecture.md`
- FPF crosswalk: `../aiden/docs/fpf-crosswalk.md`
- Responsible AI controls: `../aiden/docs/responsible-ai-controls.md`
- Public demo contract: `../aiden/docs/public-demo-contract.md`
- Engine public contract: `../aiden-engine/README.md`
- Demo behavior and setup: `README.md`

## Current public story
- AIDEN is presented as a **governed decision system with bounded agentic assistance**.
- The public topology is **1 hub + 7 delivery repos** for AIDEN, inside the broader `modern-literacy` public org profile.
- The execution core remains authoritative in **deterministic** mode.
- **Shadow** mode compares bounded assistive output without changing authority.
- **Live Assist** is visible, bounded, and fallback-capable.
- The visible assistive roles are **Architect Assist** and **Reviewer Assist**.
- The hidden governance runtime role is **Safety Governor / Operational Gate**.

## Current demo contract highlights
- Sanitized sample data only
- No autonomous writes
- No open-web browsing
- Human review required
- Tool allowlist enforced
- Trace redaction enforced
- Step, tool-call, time, and cost/token budgets shown in the UI
- Deterministic fallback available
- Escalation status and conditions exposed
- Policy lock references and evidence references exposed

## Deployment and verification note
If additional launch work is required, use the hub docs and current repo READMEs as the reference set, then capture fresh browser, endpoint, and safety evidence against the live deployment surfaces. Do not reuse historical response examples from older handoff notes.

## Launch-hygiene reminders
- Rotate and scrub secrets before any visibility change.
- Review historical workflow logs and artifacts before exposing new public surfaces.
- Keep the org-level `.github` repository in place with `SECURITY.md` and the rest of the shared trust files.
