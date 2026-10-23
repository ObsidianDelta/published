// EXP-13a: horizon field added to the edition schema (optional, max 360 chars).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkEdition, CAPS } from '../../src/lib/explain/check-edition.mjs';

// Minimal edition that satisfies every checkEdition gate before the horizon check.
const minEdition = (horizon) => ({
  voice: 'v',
  answer: 'a',
  more: 'm',
  how: '',
  proof_intro: '',
  under: '',
  buttons: { more: 'More', how: 'How', proof: 'Proof', under: 'Under' },
  labels: {
    learner: 'learner', guide: 'guide', classroom: 'classroom',
    invert: 'invert', both: 'both', change: 'change', decide: 'decide',
    record: 'record', packages: 'packages', built: 'built',
    boundary: 'boundary', tapChild: 'tap', dragGuide: 'drag',
    roles: ['r1', 'r2', 'r3', 'r4'],
    contexts: ['c1', 'c2'],
  },
  horizon,
});

test('CAPS.horizon is 360', () => {
  assert.equal(CAPS.horizon, 360);
});

test('valid horizon (≤360 chars) passes edition check', () => {
  const h = 'Anyone who can communicate can learn anything, for life, from the best guides there are, in her own context and language, on any bandwidth.'.slice(0, 360);
  assert.ok(h.length <= 360);
  const r = checkEdition(minEdition(h));
  assert.ok(r.ok, `expected ok but got: ${r.why}`);
});

test('over-cap horizon (>360 chars) fails edition check with horizon-too-long', () => {
  const h = 'A'.repeat(361);
  assert.equal(h.length, 361);
  const r = checkEdition(minEdition(h));
  assert.ok(!r.ok, 'expected failure for over-cap horizon');
  assert.ok(typeof r.why === 'string' && /horizon/i.test(r.why), `expected why to mention horizon, got: ${r.why}`);
});
