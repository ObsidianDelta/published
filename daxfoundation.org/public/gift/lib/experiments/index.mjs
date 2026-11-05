// index.mjs -- the PUBLIC, browser-safe API of the experiment library (gift 4/4).
// The studio (views/gift, PR #168) imports only from here (vendored by
// views/daxfoundation/scripts/gift/sync-vendor.mjs, which copies vendor-manifest.json).
// Nothing in this import graph uses Node built-ins (tests/exports.test.mjs proves it in Chromium).
//
//   import * as X from './lib/experiments/index.mjs';
//   const flag = X.flagship(library);                         // movies -> chords -> emotions -> notes
//   const run = X.runExperiment(flag, answers, ctx, { unlockedStages });
//   run.result (sequence) / run.alternatives (text) / run.announcements (live region)
//   const next = X.oneTapRemix(flag, { library, ctx, tap: 1 });          // one-tap remix
//   X.checkTemplate(next, ctx, { schema })                    // [] = valid (fetch the schema once)
//   X.motionFor('heartbeat-pulse', { reducedMotion }), X.createFlashLimiter(), X.chordChangeAnnouncements(seq)

import { remix, applicableOps, REMIX_OPS, headEnd, hash32 } from './remix.mjs';

export { runExperiment } from './runner.mjs';
export { remix, applicableOps, REMIX_OPS } from './remix.mjs';
export { checkTemplate, ALL_BONUS } from './gate.mjs';
export { TRANSFORMS, runTransform } from './transforms/index.mjs';
export { LETTERS } from './transforms/emotion.mjs';
export { progress, complete, evaluateRule } from './progression/unlock.mjs';
export {
  describe, announcement, stageA11y, stagesA11y, templateA11y, WIDGET_A11Y, VIZ_A11Y, PACES, paceToTaps,
  NAMED_COLOURS, colourName, chordSpoken, noteSpoken, flashRateHz, MAX_FLASH_HZ, BPM_MIN, BPM_MAX,
} from './a11y/spec.mjs';
export { motionFor, createFlashLimiter, chordChangeAnnouncements } from './a11y/hooks.mjs';

export const FLAGSHIP_ID = 'movies-chords-emotions-notes';
export const SCHEMA_PATH = 'schema/experiment-template.schema.json';

/** The flagship template (movies -> chords -> emotions -> notes). */
export function flagship(library) {
  const t = library.templates.find((x) => x.id === FLAGSHIP_ID);
  if (!t) throw new Error('flagship missing from library');
  return t;
}

/**
 * One-tap remix: tap n of a template gives the same remix every time (deterministic),
 * cycling through the ops that apply. Crossbreeds pair with the flagship (or, when remixing
 * the flagship itself, a seeded partner), so every tap stays anchored to the flagship flow.
 * Returns the new template (lineage records op, seed and parents).
 */
export function oneTapRemix(template, { library, ctx, tap = 0, partner = null } = {}) {
  const ops = applicableOps(template);
  const op = ops[hash32(`${template.id}:tap:${tap}`) % ops.length];
  let other = null;
  if (op === 'crossbreed') {
    const flag = library.templates.find((x) => x.id === FLAGSHIP_ID);
    if (partner) other = partner;
    else if (flag && flag.id !== template.id) other = flag;
    else {
      const pool = library.templates.filter((x) => x.id !== template.id && !x.care.sensitive && headEnd(x));
      other = pool[hash32(`${template.id}:partner:${tap}`) % pool.length];
    }
  }
  return remix(template, { op, seed: `tap-${tap}`, other, library, ctx });
}

export { REMIX_OPS as OPS };
