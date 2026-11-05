// theory.mjs -- pitch, chord and roman-numeral primitives. Pure, no I/O, no deps.
// Grounding: 12-tone equal temperament pitch classes (0 = C); chord qualities as
// interval sets from the root (standard lead-sheet conventions, e.g. Levine, The Jazz
// Theory Book, 1995); roman numerals measured against the MAJOR scale of the tonic
// (so the Andalusian cadence in A minor is i - bVII - bVI - V), which keeps the
// grammar unambiguous for catalog contributors.

export const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// Keys conventionally spelled with flats (major tonic pcs): F Bb Eb Ab Db Gb.
const FLAT_KEYS = new Set([5, 10, 3, 8, 1, 6]);

export const mod12 = (n) => ((n % 12) + 12) % 12;

/** "C#" | "Db" | "D" -> pitch class 0..11. Throws on garbage. */
export function noteToPc(name) {
  const m = /^([A-Ga-g])([#b]*)$/.exec(String(name).trim());
  if (!m) throw new Error(`bad note name: ${name}`);
  let pc = LETTER_PC[m[1].toUpperCase()];
  for (const a of m[2]) pc += a === '#' ? 1 : -1;
  return mod12(pc);
}

/** pitch class -> name, spelled with flats when preferFlats. */
export function pcToName(pc, preferFlats = false) {
  return (preferFlats ? FLAT_NAMES : SHARP_NAMES)[mod12(pc)];
}

/** Whether a key on this tonic is conventionally spelled with flats. Minor keys use their relative major. */
export function keyPrefersFlats(tonicPc, mode = 'major') {
  const relMajor = mode === 'minor' ? mod12(tonicPc + 3) : mod12(tonicPc);
  return FLAT_KEYS.has(relMajor);
}

/** Scientific pitch "D6" -> MIDI 86 (C4 = 60). */
export function noteToMidi(name) {
  const m = /^([A-Ga-g][#b]*)(-?\d+)$/.exec(String(name).trim());
  if (!m) throw new Error(`bad pitch: ${name}`);
  const letterPc = LETTER_PC[m[1][0].toUpperCase()];
  let semis = 0;
  for (const a of m[1].slice(1)) semis += a === '#' ? 1 : -1;
  return (Number(m[2]) + 1) * 12 + letterPc + semis;
}

export function midiToNote(midi, preferFlats = false) {
  return `${pcToName(midi, preferFlats)}${Math.floor(midi / 12) - 1}`;
}

/** MIDI -> frequency in Hz, A4 = 440 (12-TET). */
export const midiToHz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Chord qualities: suffix -> intervals from root. Order matters for identifyChord tie-breaks
// (simpler, more common qualities first).
export const QUALITIES = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '5': [0, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  add9: [0, 2, 4, 7],
  '9': [0, 2, 4, 7, 10],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
  aug: [0, 4, 8],
};
const QUALITY_ALIASES = {
  M: '', maj: '', min: 'm', '-': 'm', '°': 'dim', o: 'dim', '°7': 'dim7', o7: 'dim7',
  ø: 'm7b5', ø7: 'm7b5', '+': 'aug', M7: 'maj7', Δ: 'maj7', Δ7: 'maj7', min7: 'm7', '-7': 'm7',
  dom7: '7', sus: 'sus4', '7sus4': 'sus4', m9: 'm7', maj9: 'maj7', add2: 'add9',
};

/**
 * Parse a chord symbol. "Bm7", "Gmaj7", "Fsus4", "G/B", "Bbsus2", "C5".
 * Returns { symbol, root, quality, bass, pcs } with pcs sorted from the root upward
 * (root first) and the bass pc (slash bass, else root).
 */
export function parseChord(symbol) {
  const m = /^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/.exec(String(symbol).trim());
  if (!m) throw new Error(`bad chord symbol: ${symbol}`);
  let q = m[2];
  if (q in QUALITY_ALIASES) q = QUALITY_ALIASES[q];
  if (!(q in QUALITIES)) throw new Error(`unknown chord quality "${m[2]}" in ${symbol}`);
  const root = noteToPc(m[1]);
  const pcs = QUALITIES[q].map((i) => mod12(root + i));
  const bass = m[3] ? noteToPc(m[3]) : root;
  if (!pcs.includes(bass)) pcs.push(bass); // e.g. C/Bb adds the bass tone
  return { symbol: String(symbol).trim(), root, quality: q, bass, pcs };
}

export function chordSymbol(rootPc, quality, { bassPc = null, preferFlats = false } = {}) {
  const base = pcToName(rootPc, preferFlats) + quality;
  return bassPc === null || bassPc === rootPc ? base : `${base}/${pcToName(bassPc, preferFlats)}`;
}

const pcSetKey = (pcs) => [...new Set(pcs.map(mod12))].sort((a, b) => a - b).join(',');

/**
 * Inverse of parseChord: name a pitch-class set. Exact template match first, then the
 * best partial match (matches minus extras). When several roots fit the same set
 * (C6 = Am7, Csus2 = Gsus4, symmetric dim7/aug), the bass decides; then quality order.
 */
export function identifyChord(pcsIn, { bassPc = null, preferFlats = false } = {}) {
  const set = new Set(pcsIn.map(mod12));
  if (set.size === 0) return null;
  const target = pcSetKey([...set]);
  let best = null;
  const qualities = Object.keys(QUALITIES);
  for (let r = 0; r < 12; r++) {
    for (let qi = 0; qi < qualities.length; qi++) {
      const q = qualities[qi];
      const tones = QUALITIES[q].map((i) => mod12(r + i));
      const tset = new Set(tones);
      let match = 0;
      for (const p of set) if (tset.has(p)) match++;
      const missing = tset.size - match;
      const extra = set.size - match;
      const exact = pcSetKey(tones) === target;
      // Score: exact wins; else reward matched tones, punish extras/missing.
      let score = exact ? 1000 : match * 10 - extra * 12 - missing * 8;
      if (!set.has(r)) score -= 50; // root must sound
      if (bassPc !== null && mod12(bassPc) === r) score += 5;
      score -= qi * 0.01; // prefer simpler qualities on ties
      if (!best || score > best.score) best = { r, q, score };
    }
  }
  const bass = bassPc === null ? null : mod12(bassPc);
  return chordSymbol(best.r, best.q, { bassPc: bass, preferFlats });
}

// ---------- keys & roman numerals ----------

export const MAJOR_DEGREES = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
export const ROMAN_RE = /^(b|#)?(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(7|maj7|6|9|add9|sus2|sus4|5|dim|dim7|m7b5|aug)?$/;

/** "bVII" -> { offset: 10, quality: '' }. Enforces the case rules in the README grammar. */
export function parseRoman(numeral) {
  const m = ROMAN_RE.exec(String(numeral));
  if (!m) throw new Error(`bad roman numeral: ${numeral}`);
  const [, acc, num, suf = ''] = m;
  const upper = num === num.toUpperCase();
  if (['dim', 'dim7', 'm7b5'].includes(suf) && upper) throw new Error(`${numeral}: diminished needs lowercase`);
  if (suf === 'aug' && !upper) throw new Error(`${numeral}: aug needs uppercase`);
  let offset = MAJOR_DEGREES[num.toUpperCase()] + (acc === 'b' ? -1 : acc === '#' ? 1 : 0);
  let quality;
  if (['dim', 'dim7', 'm7b5', 'aug', 'sus2', 'sus4', '5', 'maj7', '9', 'add9'].includes(suf)) quality = suf;
  else if (suf === '7') quality = upper ? '7' : 'm7';
  else if (suf === '6') quality = upper ? '6' : 'm6';
  else quality = upper ? '' : 'm';
  return { offset: mod12(offset), quality };
}

/** Normalise a key: "D", "Dm", "D minor", {tonic,mode} -> { tonic: 'D', tonicPc: 2, mode }. */
export function parseKey(key) {
  if (key && typeof key === 'object') {
    const tonicPc = typeof key.tonicPc === 'number' ? mod12(key.tonicPc) : noteToPc(key.tonic);
    const mode = key.mode || 'major';
    return { tonic: key.tonic || pcToName(tonicPc, keyPrefersFlats(tonicPc, mode)), tonicPc, mode };
  }
  const m = /^([A-G][#b]?)\s*(m|min|minor|maj|major)?$/.exec(String(key).trim());
  if (!m) throw new Error(`bad key: ${key}`);
  const mode = m[2] && m[2].startsWith('m') && m[2] !== 'maj' && m[2] !== 'major' ? 'minor' : 'major';
  return { tonic: m[1], tonicPc: noteToPc(m[1]), mode };
}

export function romanToChord(numeral, key) {
  const k = parseKey(key);
  const { offset, quality } = parseRoman(numeral);
  return chordSymbol(mod12(k.tonicPc + offset), quality, { preferFlats: keyPrefersFlats(k.tonicPc, k.mode) });
}

const ROMAN_BY_OFFSET = {
  0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV', 6: '#IV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII',
};

/** Inverse of romanToChord (slash bass dropped). */
export function chordToRoman(symbol, key) {
  const k = parseKey(key);
  const c = parseChord(symbol);
  const base = ROMAN_BY_OFFSET[mod12(c.root - k.tonicPc)];
  const acc = base.startsWith('b') || base.startsWith('#') ? base[0] : '';
  const num = acc ? base.slice(1) : base;
  const lowerQ = { m: '', m7: '7', m6: '6', dim: 'dim', dim7: 'dim7', m7b5: 'm7b5' };
  if (c.quality in lowerQ) return acc + num.toLowerCase() + lowerQ[c.quality];
  return acc + num + c.quality;
}

// ---------- scales / modes ----------

export const MODES = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
};

/** Diatonic pitch classes of a key (major = Ionian, minor = Aeolian). */
export function keyScale(key) {
  const k = parseKey(key);
  return (k.mode === 'minor' ? MODES.aeolian : MODES.ionian).map((i) => mod12(k.tonicPc + i));
}

// ---------- key finding (Krumhansl & Kessler 1982 probe-tone profiles) ----------

export const KK_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
export const KK_MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function pearson(a, b) {
  const n = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

/**
 * Krumhansl-Schmuckler key finding over a pitch-class weight histogram (length 12).
 * Returns { tonic, tonicPc, mode, r } for the best of the 24 keys.
 */
export function detectKeyFromHistogram(hist) {
  let best = null;
  for (let t = 0; t < 12; t++) {
    const rot = hist.map((_, i) => hist[mod12(i + t)]);
    for (const [mode, prof] of [['major', KK_MAJOR], ['minor', KK_MINOR]]) {
      const r = pearson(rot, prof);
      if (!best || r > best.r + 1e-9) best = { tonicPc: t, mode, r };
    }
  }
  return { ...best, tonic: pcToName(best.tonicPc, keyPrefersFlats(best.tonicPc, best.mode)) };
}

/**
 * Key of a chord progression: KS over chord tones (roots double-weighted), plus a
 * small bonus for a key whose tonic chord opens (0.10) or closes (0.06) the progression
 * -- the usual way listeners anchor home (Huron, Sweet Anticipation, 2006, ch. 9) --
 * plus chord-scale fit (0.15 x share of chords fully inside the scale; the raised
 * leading tone is allowed in minor, as in harmonic-minor V).
 */
export function detectKey(chords) {
  const parsed = chords.map((c) => (typeof c === 'string' ? parseChord(c) : c));
  const hist = new Array(12).fill(0);
  for (const c of parsed) {
    for (const p of c.pcs) hist[p] += 1;
    hist[c.root] += 1;
  }
  const scores = [];
  for (let t = 0; t < 12; t++) {
    const rot = hist.map((_, i) => hist[mod12(i + t)]);
    for (const [mode, prof] of [['major', KK_MAJOR], ['minor', KK_MINOR]]) {
      let r = pearson(rot, prof);
      const tonicChord = (c) => c.root === t && (mode === 'major' ? !c.pcs.includes(mod12(t + 3)) : c.pcs.includes(mod12(t + 3)));
      if (tonicChord(parsed[0])) r += 0.1;
      if (tonicChord(parsed[parsed.length - 1])) r += 0.06;
      // chord-scale fit: share of chords whose tones all lie in the key's scale
      const scale = new Set((mode === 'major' ? MODES.ionian : MODES.aeolian).map((i) => mod12(t + i)));
      const fit = parsed.filter((c) => c.pcs.every((p) => scale.has(p) || (mode === 'minor' && p === mod12(t + 11)))).length / parsed.length;
      r += 0.15 * fit;
      scores.push({ tonicPc: t, mode, r });
    }
  }
  scores.sort((a, b) => b.r - a.r || a.tonicPc - b.tonicPc);
  const best = scores[0];
  return { ...best, tonic: pcToName(best.tonicPc, keyPrefersFlats(best.tonicPc, best.mode)) };
}
