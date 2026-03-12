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
  assert.match(indexHtml, /illustrative demo telemetry only/i);
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

test('delta engine keeps exception intelligence but defaults to remediation-first framing', () => {
  assert.match(appJs, /remediation-first/i);
  assert.match(appJs, /exception intelligence/i);
  assert.match(indexHtml, /budget-limited live assist/i);
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
