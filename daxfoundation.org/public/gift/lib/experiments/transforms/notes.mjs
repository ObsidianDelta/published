// notes.mjs -- chords <-> note sets, emotion <-> note sets (scales/modes). Pure.
// Mode colours follow common pedagogy (e.g. Persichetti, Twentieth-Century Harmony,
// 1961: modes ordered from "brightest" Lydian to "darkest" Locrian by their raised/
// lowered degrees) and are HOUSE PRIORS to be replaced by survey data.

import { parseChord, parseKey, pcToName, keyPrefersFlats, mod12, noteToPc, identifyChord, MODES } from './theory.mjs';
import { toVector, normalize, cosine, topLetters, LETTERS } from './emotion.mjs';

/** Chord symbol -> { symbol, pcs, names, midi } with a close root-position voicing near `octave`. */
export function chordToNotes(symbol, { octave = 4, preferFlats = null } = {}) {
  const c = parseChord(symbol);
  const flats = preferFlats ?? /b/.test(symbol.replace(/^[A-G]/, '').slice(0, 1));
  const base = (octave + 1) * 12 + c.root;
  const ordered = [...new Set(c.pcs)];
  let last = base - 1;
  const midi = [];
  for (const p of ordered) {
    let m = (octave + 1) * 12 + p;
    while (m <= last) m += 12;
    midi.push(m);
    last = m;
  }
  if (c.bass !== c.root) {
    // slash bass sounds below the chord
    const idx = ordered.indexOf(c.bass);
    let b = midi[idx];
    midi.splice(idx, 1);
    while (b >= midi[0]) b -= 12;
    midi.unshift(b);
  }
  return { symbol: c.symbol, pcs: ordered, names: ordered.map((p) => pcToName(p, flats)), midi };
}

/** Inverse: note names or MIDI numbers -> chord symbol (lowest note taken as bass). */
export function notesToChord(notes, { preferFlats = false } = {}) {
  const midis = notes.map((n) => (typeof n === 'number' ? n : null));
  const pcs = notes.map((n) => (typeof n === 'number' ? mod12(n) : noteToPc(n)));
  let bassPc = null;
  if (midis.every((m) => m !== null)) bassPc = mod12(Math.min(...midis));
  else bassPc = pcs[0];
  const sym = identifyChord(pcs, { bassPc, preferFlats });
  // Drop a slash when the bass is the root (identifyChord already does), keep inversions.
  return sym;
}

// Mode emotion priors (brightness ordering + LOVE-VOCAB anchors). Pentatonics are the
// near-universal "singable" sets (Brăiloiu's anhemitonic pentatonic; found across
// East Asian, West African, Andean, Celtic and Scandinavian folk traditions).
export const MODE_PRIORS = {
  ionian: { joy: 0.6, trust: 0.5, hope: 0.4 },
  lydian: { awe: 0.6, curiosity: 0.4, discovery: 0.4, hope: 0.2 },
  mixolydian: { adventure: 0.6, togetherness: 0.4, joy: 0.3 },
  dorian: { hope: 0.4, longing: 0.4, curiosity: 0.3, creativity: 0.3 },
  aeolian: { longing: 0.6, tenderness: 0.4, awe: 0.2 },
  phrygian: { doubt: 0.5, longing: 0.4, adventure: 0.2 },
  harmonicMinor: { longing: 0.5, adventure: 0.4, doubt: 0.2, awe: 0.2 },
  majorPentatonic: { togetherness: 0.6, joy: 0.4, trust: 0.3, gratitude: 0.3 },
  minorPentatonic: { longing: 0.4, togetherness: 0.4, trust: 0.2, tenderness: 0.2 },
};

const MODE_ORDER = Object.keys(MODE_PRIORS);

/** Note set builder. noteSet = { tonic, tonicPc, mode, intervals, pcs, names, source }. */
export function makeNoteSet(tonic, intervals, { mode = 'custom', source = null } = {}) {
  const tonicPc = typeof tonic === 'number' ? mod12(tonic) : noteToPc(tonic);
  const minorish = intervals.includes(3) && !intervals.includes(4);
  const flats = keyPrefersFlats(tonicPc, minorish ? 'minor' : 'major') || intervals.includes(1);
  const pcs = intervals.map((i) => mod12(tonicPc + i));
  const tonicName = pcToName(tonicPc, flats);
  return {
    tonic: tonicName, tonicPc, mode, intervals: [...intervals], pcs,
    names: spell(tonicName, pcs, flats), source,
  };
}

const LETTERS7 = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/**
 * Spell a scale. Heptatonic sets get one letter per degree (so Hijaz on D is
 * D Eb F# G A Bb C, with its augmented second, not D Eb Gb ...); others use the key's
 * sharp/flat preference.
 */
function spell(tonicName, pcs, flats) {
  if (pcs.length !== 7) return pcs.map((p) => pcToName(p, flats));
  const start = LETTERS7.indexOf(tonicName[0]);
  const names = pcs.map((p, i) => {
    const L = LETTERS7[(start + i) % 7];
    let d = mod12(p - NATURAL[L]);
    if (d > 6) d -= 12;
    return Math.abs(d) <= 2 ? L + (d > 0 ? '#'.repeat(d) : 'b'.repeat(-d)) : null;
  });
  return names.every(Boolean) ? names : pcs.map((p) => pcToName(p, flats));
}

/** Emotion -> best mode on a tonic (default D, Love = D). */
export function emotionToNoteSet(target, { tonic = 'D', modes = MODE_ORDER } = {}) {
  const tv = toVector(target);
  let best = null;
  for (const m of modes) {
    const s = cosine(tv, toVector(MODE_PRIORS[m]));
    if (!best || s > best.s + 1e-12) best = { m, s };
  }
  const ns = makeNoteSet(tonic, MODES[best.m], { mode: best.m });
  return { ...ns, similarity: Math.round(best.s * 1e4) / 1e4 };
}

/** Which named mode (on which tonic) does a pitch-class set match best? Jaccard on pcs. */
export function identifyNoteSet(pcsIn, { tonicPc = null } = {}) {
  const set = new Set(pcsIn.map(mod12));
  let best = null;
  const tonics = tonicPc === null ? [...Array(12).keys()] : [mod12(tonicPc)];
  for (const t of tonics) {
    for (const m of MODE_ORDER) {
      const tones = new Set(MODES[m].map((i) => mod12(t + i)));
      let inter = 0;
      for (const p of set) if (tones.has(p)) inter++;
      const jac = inter / (set.size + tones.size - inter);
      const bonus = set.has(t) ? 0.001 : 0;
      const score = jac + bonus;
      if (!best || score > best.score + 1e-12) best = { t, m, score, jac };
    }
  }
  return { tonicPc: best.t, mode: best.m, match: Math.round(best.jac * 1e4) / 1e4 };
}

/** Note set -> emotion: the matched mode's prior, scaled toward neutral by match quality. */
export function noteSetToEmotion(noteSet) {
  const pcs = Array.isArray(noteSet) ? noteSet : noteSet.pcs;
  const tonicPc = Array.isArray(noteSet) ? null : noteSet.tonicPc ?? null;
  const id = identifyNoteSet(pcs, { tonicPc });
  let v = toVector(MODE_PRIORS[id.mode]);
  if (id.tonicPc === 2) v = { ...v, love: (v.love || 0) + 0.3 };
  const e = normalize(v);
  return { mode: id.mode, tonicPc: id.tonicPc, match: id.match, emotion: e, top: topLetters(e) };
}

/** Union of chord tones of a progression. */
export function progressionToNoteSet(chords, key = null) {
  const pcs = [];
  for (const c of chords) for (const p of parseChord(c).pcs) if (!pcs.includes(p)) pcs.push(p);
  const k = key ? parseKey(key) : null;
  const tonicPc = k ? k.tonicPc : parseChord(chords[0]).root;
  const sorted = pcs.map((p) => mod12(p - tonicPc)).sort((a, b) => a - b);
  return makeNoteSet(tonicPc, sorted, { mode: 'from-progression' });
}

export { LETTERS };
