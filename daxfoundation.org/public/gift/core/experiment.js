// The experiment: a question, where inspiration comes from, and the stages that turn it into a
// sound. Pure functions only (tested in Node). The UI renders what run() returns.

import { LETTERS, LETTER_IDS, letterById, CONTOURS, RELOVE, kindById, catalogItem, attributionOf, QUESTIONS } from './catalog.js';
import { parseChord, chordMidi, chordSimilarity } from './theory.js';

export const TIMBRES = Object.freeze(['bell', 'soft', 'glass', 'pulse']);
export const TENSES = Object.freeze(['was', 'is', 'will']);
export const SIZES = Object.freeze(['small', 'big']);
export const MAX_SOURCES = 3;
export const MAX_LETTERS = 3;
export const MAX_CHORDS = 8;
export const MAX_TEXT = 60;
export const MAX_QUESTION = 120;

/** clean free text: no control characters, single spaces, bounded length. */
export function cleanText(s, max = MAX_TEXT) {
  if (typeof s !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** true when text looks like contact details or a link: these never go into a share link. */
export function looksPersonal(s) {
  if (typeof s !== 'string') return false;
  return /[\w.+-]+@[\w-]+\.[\w.]+/.test(s) // email
    || /(https?:\/\/|www\.)/i.test(s) // link
    || /(\d[\s().-]*){7,}/.test(s) // phone-like run of digits
    || /@[A-Za-z0-9_]{2,}/.test(s); // social handle
}

export function newExperiment(o = {}) {
  return normalizeExperiment({
    v: 1,
    q: o.q || QUESTIONS[0],
    size: o.size || 'small',
    sources: o.sources || [],
    letters: o.letters || [],
    sound: o.sound || {},
    gen: o.gen || 0,
    parent: o.parent,
  }, { allowEmptySources: true });
}

/** Validate + normalize untrusted input (a shared link, or old local data) into an experiment.
    Returns null when it cannot be made safe. Unknown kinds/ids/letters are dropped, never trusted. */
export function normalizeExperiment(raw, opts = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (raw.v !== 1) return null;
  const q = QUESTIONS.includes(raw.q) ? raw.q : cleanText(raw.q, MAX_QUESTION);
  if (!q) return null;
  const size = SIZES.includes(raw.size) ? raw.size : 'small';
  const sources = [];
  for (const s of Array.isArray(raw.sources) ? raw.sources.slice(0, 12) : []) {
    if (sources.length >= MAX_SOURCES) break;
    if (!s || typeof s !== 'object') continue;
    const kind = kindById(s.k);
    if (!kind) continue;
    if (kind.family === 'work' || kind.family === 'culture') {
      if (!catalogItem(kind.id, s.id)) continue;
      sources.push({ k: kind.id, id: s.id });
    } else if (kind.items && typeof s.id === 'string' && Object.prototype.hasOwnProperty.call(kind.items, s.id)) {
      sources.push({ k: kind.id, id: s.id });
    } else {
      const text = cleanText(s.text);
      sources.push(text && !looksPersonal(text) ? { k: kind.id, text } : { k: kind.id });
    }
  }
  if (!sources.length && !opts.allowEmptySources) return null;
  if (size === 'small' && sources.length > 1) sources.length = 1;
  const letters = [...new Set((Array.isArray(raw.letters) ? raw.letters : []).filter((l) => LETTER_IDS.includes(l)))].slice(0, MAX_LETTERS);
  const snd = raw.sound && typeof raw.sound === 'object' ? raw.sound : {};
  const bpm = Number.isFinite(snd.bpm) ? Math.round(Math.min(140, Math.max(48, snd.bpm))) : 72;
  const sound = {
    tb: TIMBRES.includes(snd.tb) ? snd.tb : 'bell',
    bpm,
    tense: TENSES.includes(snd.tense) ? snd.tense : 'is',
    relove: snd.relove !== false,
    hum: snd.hum !== false,
  };
  const gen = Number.isInteger(raw.gen) ? Math.min(99, Math.max(0, raw.gen)) : 0;
  const out = { v: 1, q, size, sources, letters, sound, gen };
  if (typeof raw.parent === 'string' && /^[0-9a-f]{12}$/.test(raw.parent)) out.parent = raw.parent;
  return out;
}

export const familyOf = (exp) => {
  const k = exp && exp.sources[0] && kindById(exp.sources[0].k);
  return k ? k.family : 'personal';
};

/** The stage order is polymorphic: it follows where the inspiration comes from, and the size. */
export function stagesFor(exp) {
  const fam = familyOf(exp);
  if (exp.size === 'small') return ['question', 'source', 'emotions', 'sound', 'result'];
  if (fam === 'personal') return ['question', 'source', 'emotions', 'chords', 'notes', 'sound', 'result'];
  return ['question', 'source', 'chords', 'emotions', 'notes', 'sound', 'result'];
}

/** what one source contributes: label, attribution, chords (work/culture), suggested letters (presets). */
export function resolveSource(s) {
  const kind = kindById(s.k);
  if (!kind) return null;
  const base = { k: kind.id, family: kind.family, glyph: kind.glyph };
  if (kind.family === 'work') {
    const w = catalogItem(kind.id, s.id);
    return { ...base, id: w.id, label: w.title, attribution: attributionOf(w), confidence: w.confidence, chords: w.progression.slice(), hints: (w.letters || []).slice(), key: w.key, cite: { label: w.source, ref: w.id } };
  }
  if (kind.family === 'culture') {
    const c = catalogItem(kind.id, s.id);
    return { ...base, id: c.id, label: `${c.tradition} · ${c.region}`, attribution: `${c.tradition} (${c.language}) — a generic progression the studio wrote in a ${c.mode} mode`, confidence: c.confidence, chords: c.progression.slice(), key: c.mode, cite: { label: 'culture-catalog seed', ref: c.id } };
  }
  const suggest = kind.items && s.id ? kind.items[s.id].slice() : [];
  return { ...base, id: s.id || null, text: s.text || '', label: s.text || s.id || '', chords: [], suggest, cite: { label: 'your experiment', ref: 'source:' + kind.id } };
}

/** score every letter against a progression: mean over chords of the best match to a home chord,
    plus a bonus for letters the catalogue itself tags the work with (THEME-CATALOG `letters`). */
export const HINT_BONUS = 1;
export function scoreLetters(chords, hints = []) {
  const valid = chords.filter((c) => parseChord(c));
  const out = LETTERS.map((l) => {
    if (!valid.length) return { id: l.id, score: 0 };
    let sum = 0;
    for (const c of valid) sum += Math.max(...l.home.map((h) => chordSimilarity(c, h)));
    return { id: l.id, score: sum / valid.length + (hints.includes(l.id) ? HINT_BONUS : 0) };
  });
  const total = out.reduce((a, b) => a + b.score, 0) || 1;
  return out.map((o) => ({ id: o.id, score: o.score, share: o.score / total }))
    .sort((a, b) => b.score - a.score || LETTER_IDS.indexOf(a.id) - LETTER_IDS.indexOf(b.id));
}

/** the phrase: the studio's own arpeggio over the harmony, shaped by each letter's contour.
    It is generated from chord tones, never taken from a work's melody. */
export function composeNotes(chords, letters, sound) {
  const notes = [];
  let t = 0;
  const L = letters.length ? letters : ['love'];
  chords.forEach((sym, i) => {
    const tones = [...new Set(chordMidi(sym, 60).filter((m) => m >= 55))].sort((a, b) => a - b);
    if (!tones.length) return;
    const letter = letterById(L[i % L.length]);
    const contour = CONTOURS[letter.contour];
    if (sound.hum) {
      const low = chordMidi(sym, 36);
      notes.push({ m: low[0], t, d: 4, v: 0.35, part: 'hum' });
    }
    contour.forEach((idx, j) => {
      const m = tones[idx % tones.length] + 12 * Math.min(1, Math.floor(idx / tones.length));
      notes.push({ m, t: t + j, d: j === 3 ? 1.6 : 1, v: j === 0 ? 0.9 : 0.7, part: 'phrase', letter: letter.id });
    });
    t += 4;
  });
  if (sound.relove) {
    notes.push({ m: RELOVE.call, t, d: 1.5, v: 0.95, part: 'call' });
    notes.push({ m: RELOVE.answer, t: t + 1.5, d: 2.5, v: 0.85, part: 'answer' });
    t += 4;
  }
  return { notes, beats: t };
}

/** Run the whole experiment. Returns the data every stage shows. */
export function run(exp) {
  const sources = exp.sources.map(resolveSource).filter(Boolean);
  const harmonic = sources.filter((s) => s.chords.length);
  const suggestFromItems = [...new Set(sources.flatMap((s) => s.suggest || []))];

  // chords first for work/culture; letters first for personal
  let chords = harmonic.flatMap((s) => s.chords).slice(0, MAX_CHORDS);
  const hints = [...new Set(sources.flatMap((s) => s.hints || []))];
  const fan = scoreLetters(chords.length ? chords : ['D1'], hints);
  const suggested = chords.length ? fan.slice(0, MAX_LETTERS).map((f) => f.id) : (suggestFromItems.length ? suggestFromItems.slice(0, MAX_LETTERS) : ['love']);
  const letters = exp.letters.length ? exp.letters.slice() : suggested.slice(0, exp.size === 'small' ? 1 : 2);
  if (!chords.length) chords = letters.flatMap((id) => letterById(id).home.slice(0, 2)).slice(0, MAX_CHORDS);
  const composed = composeNotes(chords, letters, exp.sound);
  const seconds = Math.round((composed.beats * 60 / exp.sound.bpm) * 10) / 10;
  return {
    stages: stagesFor(exp),
    sources,
    chords,
    attribution: harmonic.map((s) => s.attribution),
    fan: chords.length && harmonic.length ? fan : LETTERS.map((l) => ({ id: l.id, score: suggested.includes(l.id) ? 1 : 0, share: suggested.includes(l.id) ? 1 / suggested.length : 0 })),
    suggested,
    letters,
    notes: composed.notes,
    beats: composed.beats,
    seconds,
    sound: { ...exp.sound },
    signature: letters.join(' · ') + ' — ' + chords.join('–'),
  };
}
