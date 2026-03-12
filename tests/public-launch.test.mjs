import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const handoff = fs.readFileSync(new URL('../HANDOFF-PHASE-F.md', import.meta.url), 'utf8');

test('overview makes the intentionally incomplete sample explicit', () => {
  assert.match(indexHtml, /intentionally incomplete sample proposal/i);
  assert.match(indexHtml, /synthetic precedent data/i);
  assert.match(indexHtml, /illustrative demo inputs/i);
});

test('public demo contract is visible to a cold visitor', () => {
  assert.match(indexHtml, /public demo contract/i);
  assert.match(indexHtml, /no autonomous writes/i);
  assert.match(indexHtml, /no open-web browsing/i);
  assert.match(indexHtml, /deterministic fallback/i);
  assert.match(readme, /human review required/i);
});

test('visible assistive roles and the hidden safety governor are explicit', () => {
  assert.match(indexHtml, /architect assist/i);
  assert.match(indexHtml, /reviewer assist/i);
  assert.match(indexHtml, /safety governor/i);
  assert.match(indexHtml, /operational gate/i);
  assert.match(readme, /architect assist/i);
  assert.match(readme, /reviewer assist/i);
});

test('public contract names the budget and escalation envelope', () => {
  assert.match(indexHtml, /step budget/i);
  assert.match(indexHtml, /tool-call budget/i);
  assert.match(indexHtml, /time budget/i);
  assert.match(indexHtml, /cost\/token budget/i);
  assert.match(indexHtml, /escalation condition/i);
  assert.match(readme, /step budget/i);
  assert.match(readme, /tool-call budget/i);
  assert.match(readme, /time budget/i);
});

test('remediation view stays deterministic and remediation-first (no waiver/exception branch in MVE)', () => {
  assert.match(appJs, /remediation-first/i);
  assert.match(indexHtml, /deterministic baseline/i);
  assert.match(indexHtml, /budget-limited live assist/i);

  // Keep extra branches out of the public MVE.
  assert.ok(!/exception intelligence/i.test(appJs));
  assert.ok(!/deltaScenarioToggle/i.test(indexHtml));
});

test('live evidence surface publishes policy refs and explicit fallback or escalation labels', () => {
  assert.match(appJs, /policy lock/i);
  assert.match(appJs, /tool call budget/i);
  assert.match(appJs, /fallback status/i);
  assert.match(appJs, /escalation status/i);
  assert.match(appJs, /evidence references/i);
});

test('handoff captures public launch hygiene before the visibility flip', () => {
  assert.match(handoff, /rotate and scrub secrets/i);
  assert.match(handoff, /workflow logs/i);
  assert.match(handoff, /\.github/i);
  assert.match(handoff, /SECURITY\.md/i);
});

test('copy regression: promises stay narrow and human review stays explicit', () => {
  const surfaces = [indexHtml, readme].join('\n\n');

  // Required contract language
  assert.match(surfaces, /human review required/i);
  assert.match(surfaces, /deterministic baseline/i);
  assert.match(surfaces, /internal/i);

  // Ban/flag promise creep
  const banned = [
    /autonomous approval/i,
    /auto-?approve/i,
    /full compliance automation/i,
    /compliance auto-approval/i,
    /enterprise onboarding platform/i,
    /replaces reviewers/i,
    /self-?healing governance/i,
    /complete architecture automation/i,
  ];
  for (const rx of banned) {
    assert.ok(!rx.test(surfaces), `banned claim present: ${rx}`);
  }
});
