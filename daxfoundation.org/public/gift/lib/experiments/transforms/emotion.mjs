// emotion.mjs -- emotion vectors over the 15 LOVE-VOCAB-v0 letters, and the
// chord/progression <-> emotion transforms. Pure, deterministic, no deps.
//
// IMPORTANT: every weight below is a documented HOUSE PRIOR, not a measurement. The
// research rounds (research.daxfoundation.org, LOVE-VOCAB-v0 "Test order") exist to
// replace them with what people actually hear. Grounding for each prior is in
// state/gift/experiments/README.md ("Music-theory grounding").

import { parseChord, parseKey, keyScale, mod12, detectKey, chordToRoman, romanToChord } from './theory.mjs';

export const LETTERS = [
  'love', 'tenderness', 'togetherness', 'trust', 'curiosity', 'adventure', 'creativity',
  'discovery', 'joy', 'hope', 'birth', 'awe', 'gratitude', 'longing', 'doubt',
];

// ---------- vector algebra ----------

export function zero() {
  return Object.fromEntries(LETTERS.map((l) => [l, 0]));
}

/** Accepts a partial object, an array of letter names (descending weight), or a "a b c" string. */
export function toVector(x) {
  const v = zero();
  if (x == null) return v;
  if (typeof x === 'string') x = x.split(/[\s,]+/).filter(Boolean);
  if (Array.isArray(x)) {
    const w = [1, 0.6, 0.4, 0.25, 0.15];
    x.forEach((l, i) => {
      if (!(l in v)) throw new Error(`unknown letter: ${l}`);
      v[l] += w[Math.min(i, w.length - 1)];
    });
    return v;
  }
  for (const [k, val] of Object.entries(x)) {
    if (!(k in v)) throw new Error(`unknown letter: ${k}`);
    if (typeof val !== 'number' || !Number.isFinite(val)) throw new Error(`bad weight for ${k}`);
    v[k] = Math.max(0, val);
  }
  return v;
}

export function add(a, b, scale = 1) {
  const v = zero();
  for (const l of LETTERS) v[l] = (a[l] || 0) + (b[l] || 0) * scale;
  return v;
}

export function norm(v) {
  return Math.sqrt(LETTERS.reduce((s, l) => s + (v[l] || 0) ** 2, 0));
}

/** L2-normalise and round to 4 dp, so outputs are stable and JSON-friendly. */
export function normalize(v) {
  const n = norm(v);
  const out = zero();
  if (n === 0) return out;
  for (const l of LETTERS) out[l] = Math.round(((v[l] || 0) / n) * 1e4) / 1e4;
  return out;
}

export function cosine(a, b) {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  return LETTERS.reduce((s, l) => s + (a[l] || 0) * (b[l] || 0), 0) / (na * nb);
}

/** Weighted blend of vectors: blend([[v1, 2], [v2, 1]]). */
export function blend(pairs) {
  let acc = zero();
  for (const [v, w = 1] of pairs) acc = add(acc, normalize(toVector(v)), w);
  return normalize(acc);
}

export function topLetters(v, n = 3) {
  return LETTERS.map((l) => [l, v[l] || 0])
    .filter(([, x]) => x > 0)
    .sort((a, b) => b[1] - a[1] || LETTERS.indexOf(a[0]) - LETTERS.indexOf(b[0]))
    .slice(0, n)
    .map(([l]) => l);
}

// ---------- chord -> emotion priors ----------

// (a) Quality colour. Major/minor valence: Hevner 1936; Parncutt 2014. Single-chord
// colours (maj7/m7 nostalgic-tender, sus "open/unresolved", dim/aug tense-strange):
// Lahdelma & Eerola 2016. Specific anchors follow LOVE-VOCAB-v0 (Gmaj7 = tenderness,
// G5 = trust, Fsus4 = doubt, Csus2 = gratitude, D7 = adventure).
export const QUALITY_PRIORS = {
  '': { joy: 0.6, hope: 0.4, trust: 0.3, togetherness: 0.3 },
  m: { longing: 0.6, tenderness: 0.3, awe: 0.2, doubt: 0.15 },
  '5': { trust: 0.7, love: 0.3, togetherness: 0.3 },
  '7': { adventure: 0.6, curiosity: 0.3, joy: 0.15 },
  maj7: { tenderness: 0.6, gratitude: 0.3, longing: 0.2, awe: 0.2 },
  m7: { tenderness: 0.4, longing: 0.4, curiosity: 0.2 },
  sus2: { gratitude: 0.5, curiosity: 0.3, hope: 0.3 },
  sus4: { doubt: 0.6, longing: 0.3, curiosity: 0.2 },
  '6': { joy: 0.4, gratitude: 0.3, tenderness: 0.3 },
  m6: { longing: 0.4, curiosity: 0.3, awe: 0.2 },
  add9: { gratitude: 0.5, joy: 0.3, awe: 0.2 },
  '9': { adventure: 0.4, joy: 0.3, curiosity: 0.3 },
  dim: { doubt: 0.6, curiosity: 0.3 },
  dim7: { doubt: 0.6, adventure: 0.2, curiosity: 0.2 },
  m7b5: { longing: 0.5, doubt: 0.4 },
  aug: { awe: 0.5, curiosity: 0.4, discovery: 0.3 },
};

// (b) Function: root distance from the tonic in semitones. Tonic = home (trust);
// subdominant = hope/lift; dominant = forward tension (adventure); submediant =
// the relative-minor ache (longing/tenderness; LOVE-VOCAB birth = Am in C).
// Expectation-based tension per Huron 2006; Lerdahl, Tonal Pitch Space, 2001.
export const FUNCTION_PRIORS = {
  0: { trust: 0.5, love: 0.2 },
  1: { longing: 0.4, awe: 0.3 },
  2: { curiosity: 0.3, tenderness: 0.2 },
  3: { discovery: 0.3, awe: 0.2 },
  4: { awe: 0.3, longing: 0.2 },
  5: { hope: 0.5, gratitude: 0.15 },
  6: { doubt: 0.4, curiosity: 0.3 },
  7: { adventure: 0.4, hope: 0.2 },
  8: { awe: 0.4, discovery: 0.3 },
  9: { longing: 0.4, tenderness: 0.3, birth: 0.2 },
  10: { adventure: 0.3, togetherness: 0.3, discovery: 0.2 },
  11: { doubt: 0.3, curiosity: 0.2 },
};

// (c) House convention (Jason, LOVE-VOCAB-v0): Love = D. Not music theory -- a signature.
export const LOVE_PC = 2;
export const RELOVE_ANSWER_PC = 7; // G answers D

/** Is every tone of the chord inside the key's own scale? */
export function isDiatonic(chord, key) {
  const scale = new Set(keyScale(key));
  return chord.pcs.every((p) => scale.has(p));
}

/** Emotion vector of a single chord heard in a key. */
export function chordEmotion(symbol, key) {
  const c = typeof symbol === 'string' ? parseChord(symbol) : symbol;
  const k = parseKey(key);
  let v = toVector(QUALITY_PRIORS[c.quality]);
  const fn = FUNCTION_PRIORS[mod12(c.root - k.tonicPc)];
  v = add(v, fn, 0.8);
  // Borrowed / chromatic chord = discovery (LOVE-VOCAB: "the borrowed, unexpected chord").
  if (!isDiatonic(c, k)) v = add(v, { discovery: 0.5, curiosity: 0.15 });
  if (c.root === LOVE_PC) v = add(v, { love: 0.35 });
  return normalize(v);
}

// ---------- movement (cadences & gestures) ----------

/**
 * Two-chord gestures that carry meaning beyond the chords themselves.
 * Returns [{ at, name, letters }]: authentic V->I (arrival, trust), plagal IV->I
 * ("amen", gratitude), deceptive V->vi (expectation denied: longing, birth),
 * sus resolution (doubt released: trust), sus held (doubt stays: LOVE-VOCAB),
 * the re-love call D -> G, and descending stepwise bass (lament: longing).
 */
export function gestures(chords, key) {
  const k = parseKey(key);
  const cs = chords.map((c) => (typeof c === 'string' ? parseChord(c) : c));
  const out = [];
  const rel = (c) => mod12(c.root - k.tonicPc);
  const isMinorQ = (c) => ['m', 'm7', 'm6', 'dim', 'dim7', 'm7b5'].includes(c.quality);
  for (let i = 1; i < cs.length; i++) {
    const a = cs[i - 1], b = cs[i];
    if (rel(a) === 7 && rel(b) === 0) out.push({ at: i, name: 'authentic-cadence', letters: { trust: 0.6, joy: 0.2 } });
    if (rel(a) === 5 && rel(b) === 0) out.push({ at: i, name: 'plagal-cadence', letters: { gratitude: 0.6, trust: 0.2 } });
    if (rel(a) === 7 && rel(b) === 9 && isMinorQ(b)) out.push({ at: i, name: 'deceptive-cadence', letters: { longing: 0.5, birth: 0.3 } });
    if (a.quality.startsWith('sus') && a.root === b.root && !b.quality.startsWith('sus')) out.push({ at: i, name: 'sus-resolution', letters: { trust: 0.5, hope: 0.2 } });
    if (a.quality === 'sus4' && b.symbol === a.symbol) out.push({ at: i, name: 'sus-held', letters: { doubt: 0.5 } });
    if (a.root === LOVE_PC && b.root === RELOVE_ANSWER_PC) out.push({ at: i, name: 're-love', letters: { love: 0.6, togetherness: 0.3, trust: 0.2 } });
    if (i >= 2) {
      const z = cs[i - 2];
      const d1 = mod12(z.bass - a.bass), d2 = mod12(a.bass - b.bass);
      if ([1, 2].includes(d1) && [1, 2].includes(d2)) out.push({ at: i, name: 'descending-bass', letters: { longing: 0.4, tenderness: 0.2 } });
    }
  }
  if (cs.length >= 4) {
    const r = cs.slice(0, 4).map(rel).join(',');
    if (r === '0,10,8,7' && isMinorQ(cs[0])) out.push({ at: 3, name: 'andalusian-cadence', letters: { longing: 0.5, adventure: 0.3 } });
  }
  return out;
}

/**
 * Progression -> emotion. Mean of chord emotions (each chord counted once, the first and
 * last weighted 1.25 because openings and endings are where listeners anchor), plus
 * gestures at 0.6. Key is detected if not given.
 * Returns { key, emotion, chords: [{symbol, roman, emotion}], gestures, top }.
 */
export function progressionEmotion(chords, key = null) {
  if (!chords.length) throw new Error('empty progression');
  const k = key ? parseKey(key) : detectKey(chords);
  let acc = zero();
  const per = chords.map((sym, i) => {
    const e = chordEmotion(sym, k);
    const w = i === 0 || i === chords.length - 1 ? 1.25 : 1;
    acc = add(acc, e, w);
    return { symbol: sym, roman: chordToRoman(sym, k), emotion: e };
  });
  const gs = gestures(chords, k);
  for (const g of gs) acc = add(acc, normalize(toVector(g.letters)), 0.6);
  const emotion = normalize(acc);
  return { key: { tonic: k.tonic, mode: k.mode }, emotion, chords: per, gestures: gs.map((g) => g.name), top: topLetters(emotion) };
}

// ---------- emotion -> progression (beam search) ----------

const CANDIDATE_ROMANS_MAJOR = [
  'I', 'ii', 'iii', 'IV', 'V', 'vi', 'I5', 'Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7',
  'Isus2', 'Isus4', 'IVsus2', 'Vsus4', 'Iadd9', 'IV6', 'iv', 'bVII', 'bVI', 'bIII', 'II7', 'viim7b5', 'Iaug', 'bII',
];
const CANDIDATE_ROMANS_MINOR = [
  'i', 'iidim', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'V', 'V7', 'i5', 'i7', 'iv7', 'bIIImaj7', 'bVImaj7',
  'isus2', 'isus4', 'Vsus4', 'IV', 'bII', 'iim7b5', 'I', 'bVII7',
];

/** Candidate chords in a key (optionally only those whose tones lie inside a note set). */
export function candidateChords(key, noteSetPcs = null) {
  const k = parseKey(key);
  const romans = k.mode === 'minor' ? CANDIDATE_ROMANS_MINOR : CANDIDATE_ROMANS_MAJOR;
  let out = romans.map((r) => ({ roman: r, symbol: romanToChord(r, k) }));
  if (noteSetPcs) {
    const allowed = new Set(noteSetPcs.map(mod12));
    out = out.filter((c) => parseChord(c.symbol).pcs.every((p) => allowed.has(p)));
  }
  return out;
}

/**
 * Find a progression of `length` chords whose emotion is closest (cosine) to `target`.
 * Deterministic beam search (width 10). Constraints keep it musical: opens on the tonic
 * chord family unless the target leads with longing/doubt, no chord repeated back-to-back
 * (except a held sus4 when doubt leads), ends on tonic family or V for openness.
 * Options: { key = 'D' (Love = D), length = 4, noteSet = null (pcs constraint) }.
 * Returns { key, chords, romans, emotion, similarity }.
 */
export function emotionToProgression(target, { key = 'D', length = 4, noteSet = null } = {}) {
  const tv = normalize(toVector(target));
  const k = parseKey(key);
  let cands = candidateChords(k, noteSet);
  if (cands.length === 0) cands = candidateChords(k);
  const tonicFamily = (c) => mod12(parseChord(c.symbol).root - k.tonicPc) === 0;
  const lead = topLetters(tv, 1)[0];
  const openAnywhere = lead === 'longing' || lead === 'doubt';
  let beam = [{ seq: [], score: 0 }];
  for (let step = 0; step < length; step++) {
    const next = [];
    for (const b of beam) {
      for (const c of cands) {
        if (step === 0 && !openAnywhere && !tonicFamily(c)) continue;
        const prev = b.seq[b.seq.length - 1];
        if (prev && prev.symbol === c.symbol && !(lead === 'doubt' && parseChord(c.symbol).quality === 'sus4')) continue;
        const seq = [...b.seq, c];
        const pe = progressionEmotion(seq.map((x) => x.symbol), k).emotion;
        let score = cosine(pe, tv);
        if (step === length - 1) {
          const rel = mod12(parseChord(c.symbol).root - k.tonicPc);
          if (rel !== 0 && rel !== 7 && !openAnywhere) score -= 0.02;
        }
        next.push({ seq, score });
      }
    }
    next.sort((a, b) => b.score - a.score || a.seq.map((x) => x.symbol).join().localeCompare(b.seq.map((x) => x.symbol).join()));
    beam = next.slice(0, 10);
  }
  const best = beam[0];
  const chords = best.seq.map((x) => x.symbol);
  const pe = progressionEmotion(chords, k);
  return {
    key: { tonic: k.tonic, mode: k.mode },
    chords,
    romans: best.seq.map((x) => x.roman),
    emotion: pe.emotion,
    similarity: Math.round(cosine(pe.emotion, tv) * 1e4) / 1e4,
  };
}
