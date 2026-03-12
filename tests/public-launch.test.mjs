import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const readme = fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const handoffPath = new URL('../HANDOFF-PHASE-F.md', import.meta.url);
const handoffExists = fs.existsSync(handoffPath);

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

test('visible assistive roles stay collapsed to architect and reviewer assist', () => {
  assert.match(indexHtml, /architect assist/i);
  assert.match(indexHtml, /reviewer assist/i);
  assert.match(readme, /architect assist/i);
  assert.match(readme, /reviewer assist/i);
  assert.ok(!/safety governor/i.test(indexHtml));
  assert.ok(!/operational gate/i.test(indexHtml));
  assert.ok(!/safety governor/i.test(readme));
  assert.ok(!/operational gate/i.test(readme));
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

test('live evidence surface publishes policy pack refs and explicit fallback or escalation labels', () => {
  assert.match(appJs, /policy pack/i);
  assert.match(appJs, /policy_pack/i);
  assert.ok(!/policy_lock/i.test(appJs));
  assert.match(appJs, /tool call budget/i);
  assert.match(appJs, /fallback status/i);
  assert.match(appJs, /escalation status/i);
  assert.match(appJs, /evidence references/i);
});

test('public repo does not ship the archival handoff note', () => {
  assert.equal(handoffExists, false);
});

test('public mode surface exposes only deterministic and live assist', () => {
  const surfaces = [indexHtml, readme, appJs].join('\n\n');
  assert.match(surfaces, /deterministic/i);
  assert.match(surfaces, /live assist/i);
  assert.ok(!/shadow/i.test(surfaces));
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
