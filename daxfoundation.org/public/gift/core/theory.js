// Music theory for the studio: chord symbols -> pitch classes -> MIDI -> Hz.
// Pure; runs in Node (tests) and browsers. Harmony only: the studio never stores
// or plays the melody of any work.

const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// quality -> intervals in semitones above the root.
// "1" is a single note (love's call is the note D, not a chord: LOVE-VOCAB-v0).
export const QUALITIES = Object.freeze({
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
  '5': [0, 7],
  '1': [0],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  m6: [0, 3, 7, 9],
  '6': [0, 4, 7, 9],
});

const CHORD_RE = /^([A-G])([#b]?)(maj7|m7|m6|sus2|sus4|add9|dim|aug|m|7|6|5|1)?(?:\/([A-G])([#b]?))?$/;

export function pcOf(letter, acc) {
  const base = LETTER_PC[letter];
  if (base === undefined) return null;
  return (base + (acc === '#' ? 1 : acc === 'b' ? -1 : 0) + 12) % 12;
}

/** parseChord('G/B') -> {root:7, quality:'', bass:11, symbol:'G/B'} or null. */
export function parseChord(symbol) {
  if (typeof symbol !== 'string') return null;
  const m = CHORD_RE.exec(symbol.trim());
  if (!m) return null;
  const root = pcOf(m[1], m[2]);
  const quality = m[3] || '';
  const bass = m[4] ? pcOf(m[4], m[5]) : null;
  return { root, quality, bass, symbol: symbol.trim() };
}

export const isChord = (s) => parseChord(s) !== null;

/** pitch classes sounding in a chord (Set of 0..11). */
export function pitchClasses(symbol) {
  const c = parseChord(symbol);
  if (!c) return new Set();
  const out = new Set(QUALITIES[c.quality].map((i) => (c.root + i) % 12));
  if (c.bass !== null) out.add(c.bass);
  return out;
}

/** MIDI notes for a voicing: root placed in [48, 59] (C3..B3), bass an octave below. */
export function chordMidi(symbol, base = 48) {
  const c = parseChord(symbol);
  if (!c) return [];
  const root = base + c.root;
  const notes = QUALITIES[c.quality].map((i) => root + i);
  if (c.bass !== null) notes.unshift(base - 12 + c.bass);
  return notes;
}

export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const noteName = (m) => SHARP_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
export const pcName = (pc) => SHARP_NAMES[((pc % 12) + 12) % 12];

/** similarity of two chords in [0, 1.5]: pitch-class Jaccard, +0.5 when root and quality match. */
export function chordSimilarity(a, b) {
  const A = pitchClasses(a), B = pitchClasses(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const jac = inter / (A.size + B.size - inter);
  const pa = parseChord(a), pb = parseChord(b);
  const same = pa.root === pb.root && pa.quality === pb.quality ? 0.5 : 0;
  return jac + same;
}

// Scales for culture entries: a mode is a pitch-class pattern; the studio writes its own
// generic progression in that mode (never a progression taken from a work).
export const MODES = Object.freeze({
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  'phrygian-dominant': [0, 1, 4, 5, 7, 8, 10],
  'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
});

/** triad on scale degree `deg` (0-based) of `mode` rooted at pitch class `tonic`, as a chord symbol. */
export function diatonicTriad(tonic, mode, deg) {
  const s = MODES[mode];
  if (!s) return null;
  const at = (k) => s[(deg + k) % 7] + 12 * Math.floor((deg + k) / 7);
  const r = at(0), third = at(2) - r, fifth = at(4) - r;
  let q = '';
  if (third === 3 && fifth === 7) q = 'm';
  else if (third === 4 && fifth === 7) q = '';
  else if (third === 3 && fifth === 6) q = 'dim';
  else if (third === 4 && fifth === 8) q = 'aug';
  else q = '5';
  return pcName(tonic + s[deg]) + q;
}
