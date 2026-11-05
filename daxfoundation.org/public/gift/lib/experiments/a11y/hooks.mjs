// a11y/hooks.mjs -- runtime accessibility hooks for the studio (browser-safe, no DOM).
// The studio's sound-reactive visuals and player call these so that screen-reader,
// reduced-motion and flash rules hold no matter what the audio does.

import { VIZ_A11Y, MAX_FLASH_HZ, chordSpoken, describe } from './spec.mjs';

/**
 * What a visualization may do right now.
 *   motionFor('heartbeat-pulse', { reducedMotion: true })
 *   -> { kind: 'none', fallback: 'static', durationMs: 0, reactive: false, maxFlashHz: 3 }
 * reactive: may the visual follow the live audio (level/onsets)? Never under reduced motion.
 */
export function motionFor(vizType, { reducedMotion = false } = {}) {
  const a = VIZ_A11Y[vizType];
  if (!a) throw new Error(`unknown visualization ${vizType}`);
  if (reducedMotion) {
    return a.reducedMotion === 'crossfade'
      ? { kind: 'crossfade', fallback: 'crossfade', durationMs: 200, property: 'opacity', reactive: false, maxFlashHz: MAX_FLASH_HZ }
      : { kind: 'none', fallback: 'static', durationMs: 0, property: null, reactive: false, maxFlashHz: MAX_FLASH_HZ };
  }
  return { kind: a.animation.kind, fallback: a.reducedMotion, durationMs: typeof a.animation.ms === 'number' ? a.animation.ms : null, property: null, reactive: ['pulse', 'playhead', 'draw'].includes(a.animation.kind), maxFlashHz: MAX_FLASH_HZ };
}

/**
 * Flash limiter for sound-reactive visuals (WCAG 2.3.1): at most `maxHz` flashes in any
 * one second, whatever the audio's onsets do. Call allow(nowMs) at each would-be flash;
 * draw it only when it returns true.
 */
export function createFlashLimiter({ maxHz = MAX_FLASH_HZ } = {}) {
  if (!(maxHz > 0 && maxHz <= MAX_FLASH_HZ)) throw new Error(`maxHz must be in (0, ${MAX_FLASH_HZ}]`);
  const gap = 1000 / maxHz + 1;
  let last = -Infinity;
  return {
    allow(nowMs) { if (nowMs - last >= gap) { last = nowMs; return true; } return false; },
    reset() { last = -Infinity; },
    minGapMs: gap,
  };
}

/**
 * Live-region messages for playback: one per chord change (never per note, so the region
 * never floods), plus start and end. Times in seconds from the start of the sequence.
 */
export function chordChangeAnnouncements(seq) {
  const spb = 60 / seq.bpm;
  const out = [{ atSeconds: 0, politeness: 'polite', text: `Playing. ${describe('sequence', seq)}` }];
  const offset = seq.reLove ? 2 : 0;
  if (seq.reLove) out.push({ atSeconds: 0, politeness: 'polite', text: 'The love call D, then its answer G.' });
  if (seq.chords && seq.chords.length && seq.beatsPerChord) {
    seq.chords.forEach((c, i) => out.push({ atSeconds: Math.round((offset + i * seq.beatsPerChord) * spb * 1000) / 1000, politeness: 'polite', text: `Chord ${i + 1} of ${seq.chords.length}: ${chordSpoken(c)}.` }));
  }
  out.push({ atSeconds: Math.round(seq.lengthBeats * spb * 1000) / 1000, politeness: 'polite', text: 'Finished.' });
  return out;
}
