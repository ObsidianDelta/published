// sources.mjs -- inspiration inputs -> emotion vectors / harmony. Pure.
// Every input from a visitor (a choice, a colour, a tapped tempo, a word from their
// language) becomes an emotion vector over the 15 letters, or harmony from the catalog.

import { toVector, normalize, add, zero, blend, topLetters } from './emotion.mjs';
import { romanToChord, parseKey, mod12 } from './theory.mjs';
import { makeNoteSet } from './notes.mjs';

/** Tap-choice: the chosen option's letters. options: [{ id, label, letters }]. */
export function choiceToEmotion(choice, options) {
  const o = options.find((x) => x.id === choice);
  if (!o) throw new Error(`unknown option: ${choice}`);
  const e = normalize(toVector(o.letters));
  return e;
}

/** Multi-choice: equal blend of the chosen options. */
export function choicesToEmotion(choices, options) {
  if (!Array.isArray(choices) || !choices.length) throw new Error('choose at least one');
  return blend(choices.map((c) => [choiceToEmotion(c, options), 1]));
}

/** Emotion sliders (0..1 per letter, partial) -> vector. Optional base vector to nudge. */
export function slidersToEmotion(sliders, base = null) {
  const v = toVector(sliders);
  return base ? blend([[base, 1], [v, 1.5]]) : normalize(v);
}

// ---------- colour ----------

export function hexToHsl(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) throw new Error(`bad colour: ${hex}`);
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

// Hue anchors. Red-love is among the most consistent colour-emotion links across 30
// nations (Jonauskaite et al., Psychological Science, 2020); brightness -> pleasantness
// and saturation -> arousal (Valdez & Mehrabian, J. Exp. Psych: General, 1994).
const HUE_ANCHORS = [
  [0, { love: 0.6, adventure: 0.3 }],
  [30, { joy: 0.5, togetherness: 0.4 }],
  [55, { joy: 0.6, hope: 0.4 }],
  [120, { hope: 0.4, birth: 0.4, trust: 0.2 }],
  [180, { trust: 0.4, tenderness: 0.3, awe: 0.2 }],
  [220, { trust: 0.3, longing: 0.3, awe: 0.3 }],
  [275, { awe: 0.5, curiosity: 0.3, creativity: 0.3 }],
  [320, { tenderness: 0.6, love: 0.3 }],
  [360, { love: 0.6, adventure: 0.3 }],
];

export function colorToEmotion(hex) {
  const { h, s, l } = hexToHsl(hex);
  let i = 0;
  while (h > HUE_ANCHORS[i + 1][0]) i++;
  const [h0, a] = HUE_ANCHORS[i], [h1, b] = HUE_ANCHORS[i + 1];
  const t = (h - h0) / (h1 - h0);
  let v = add(zero(), toVector(a), 1 - t);
  v = add(v, toVector(b), t);
  v = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x * s])); // grey = little hue meaning
  v = add(v, { joy: 0.3, hope: 0.3 }, Math.max(0, l - 0.5) * 2); // light
  v = add(v, { longing: 0.3, awe: 0.2, doubt: 0.1 }, Math.max(0, 0.5 - l) * 2); // dark
  v = add(v, { adventure: 0.2, joy: 0.1 }, s); // vivid = aroused
  v = add(v, { tenderness: 0.25, gratitude: 0.15 }, 1 - s); // soft
  return normalize(v);
}

// ---------- tempo ----------

// Tempo is the strongest single cue for arousal in music (Juslin & Laukka, Psych. Bull.,
// 2003). Resting heart rate (~60-90 bpm) is the house "love" band (Heartbeats at 87/min).
const TEMPO_BANDS = [
  [50, { tenderness: 0.5, longing: 0.4, awe: 0.3 }],
  [75, { love: 0.5, trust: 0.4, tenderness: 0.3 }],
  [105, { joy: 0.5, togetherness: 0.4, hope: 0.2 }],
  [140, { adventure: 0.6, joy: 0.4, curiosity: 0.2 }],
];

export function tempoToEmotion(bpm) {
  if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) throw new Error(`bad bpm: ${bpm}`);
  let v = zero();
  for (const [centre, letters] of TEMPO_BANDS) {
    const w = Math.exp(-(((bpm - centre) / 22) ** 2));
    v = add(v, toVector(letters), w);
  }
  return normalize(v);
}

/** Tap times (ms) -> bpm: median inter-onset interval, robust to one stray tap. */
export function tapsToBpm(taps) {
  if (!Array.isArray(taps) || taps.length < 2) throw new Error('need at least two taps');
  const iois = taps.slice(1).map((t, i) => t - taps[i]).filter((d) => d > 0).sort((a, b) => a - b);
  const mid = iois.length >> 1;
  const med = iois.length % 2 ? iois[mid] : (iois[mid - 1] + iois[mid]) / 2;
  return Math.round(60000 / med);
}

// ---------- catalog lookups (data in state/gift/catalog) ----------

export function findCulture(catalog, cultureId) {
  const c = catalog.cultures.find((x) => x.id === cultureId);
  if (!c) throw new Error(`unknown culture: ${cultureId}`);
  return c;
}

/** A love word from a culture -> emotion (its tagged letters). */
export function vocabToEmotion(catalog, cultureId, wordId = null) {
  const c = findCulture(catalog, cultureId);
  const w = wordId ? c.vocab.find((x) => x.id === wordId) : c.vocab[0];
  if (!w) throw new Error(`unknown word ${wordId} in ${cultureId}`);
  return normalize(toVector(w.letters));
}

/** First harmony convention of `kinds` in a culture (or by id). */
function pickConvention(c, conventionId, kinds) {
  const list = c.harmony.filter((h) => kinds.includes(h.kind));
  if (conventionId) {
    const h = c.harmony.find((x) => x.id === conventionId);
    if (!h) throw new Error(`unknown convention ${conventionId} in ${c.id}`);
    return h;
  }
  return list[0] || null;
}

/** Culture scale/mode -> note set on a tonic (default D). Null when the culture has none. */
export function cultureNoteSet(catalog, cultureId, { conventionId = null, tonic = 'D' } = {}) {
  const c = findCulture(catalog, cultureId);
  const h = pickConvention(c, conventionId, ['scale', 'mode']);
  if (!h || !h.intervals) return null;
  return makeNoteSet(tonic, h.intervals, { mode: h.id, source: { culture: c.id, convention: h.id, credit: h.credit, confidence: h.confidence, tuning_note: h.tuning_note ?? null } });
}

/** Culture progression/cadence -> concrete chords in a key (default D major / minor per convention). */
export function cultureProgression(catalog, cultureId, { conventionId = null, tonic = 'D' } = {}) {
  const c = findCulture(catalog, cultureId);
  const h = pickConvention(c, conventionId, ['progression', 'cadence']);
  if (!h || !h.progression) return null;
  const mode = h.mode === 'minor' ? 'minor' : 'major';
  const key = parseKey({ tonic, mode });
  return {
    key: { tonic: key.tonic, mode }, romans: [...h.progression], chords: h.progression.map((r) => romanToChord(r, key)),
    credit: h.credit, confidence: h.confidence, source: { culture: c.id, convention: h.id },
  };
}

/** Film theme (THEME-CATALOG row) -> its catalogued progression, credited. */
export function filmToProgression(films, filmId) {
  const f = films.themes.find((x) => x.id === filmId);
  if (!f) throw new Error(`unknown film theme: ${filmId}`);
  return {
    key: { ...f.key }, chords: [...f.progression], romans: null,
    credit: `${f.title} -- ${f.work} (${f.year}), ${f.composer}; chord movement only`,
    confidence: f.confidence, source: { film: f.id },
  };
}

/** Collapse a progression object or array to its chord list. */
export const chordsOf = (p) => (Array.isArray(p) ? p : p.chords);

/** Transpose a pitch class list helper used by visualisations. */
export const transposePcs = (pcs, n) => pcs.map((p) => mod12(p + n));

export { topLetters };
