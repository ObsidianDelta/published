// index.mjs -- the transform REGISTRY the studio and the library refer to by id.
// Every entry: { args: { name: type }, optional: [names], output: type, doc, fn(args) }.
// Types are the contract that tests/library.test.mjs checks across every template stage.
//
// Types: emotion | progression | noteSet | sequence | choiceId | choiceIds | options |
//        sliders | hex | bpm | taps | pitch | key | tense | cultureId | wordId |
//        conventionId | filmId | catalog | films | number | string | bool

import * as E from './emotion.mjs';
import * as N from './notes.mjs';
import * as S from './sequence.mjs';
import * as X from './sources.mjs';
import { parseKey, detectKey, chordToRoman, romanToChord } from './theory.mjs';

const progOut = (key, chords, extra = {}) => ({
  key: { tonic: parseKey(key).tonic, mode: parseKey(key).mode },
  chords: [...chords],
  romans: chords.map((c) => chordToRoman(c, key)),
  ...extra,
});

export const TRANSFORMS = {
  // ---- inputs -> emotion ----
  choiceToEmotion: {
    args: { choice: 'choiceId', options: 'options' }, output: 'emotion',
    doc: 'Chosen option -> its tagged letters.',
    fn: ({ choice, options }) => X.choiceToEmotion(choice, options),
  },
  choicesToEmotion: {
    args: { choices: 'choiceIds', options: 'options' }, output: 'emotion',
    doc: 'Several options -> equal blend.',
    fn: ({ choices, options }) => X.choicesToEmotion(choices, options),
  },
  slidersToEmotion: {
    args: { sliders: 'sliders', base: 'emotion' }, optional: ['base'], output: 'emotion',
    doc: 'Visitor-set letter sliders, optionally nudging a base vector.',
    fn: ({ sliders, base = null }) => X.slidersToEmotion(sliders, base),
  },
  colorToEmotion: {
    args: { hex: 'hex' }, output: 'emotion',
    doc: 'Colour -> emotion (hue anchors, lightness = pleasantness, saturation = arousal).',
    fn: ({ hex }) => X.colorToEmotion(hex),
  },
  tempoToEmotion: {
    args: { bpm: 'bpm' }, output: 'emotion',
    doc: 'Tempo -> emotion (arousal bands; heart-rate band = love).',
    fn: ({ bpm }) => X.tempoToEmotion(bpm),
  },
  tapsToEmotion: {
    args: { taps: 'taps' }, output: 'emotion',
    doc: 'Tapped heartbeat (ms timestamps) -> bpm -> emotion.',
    fn: ({ taps }) => X.tempoToEmotion(X.tapsToBpm(taps)),
  },
  vocabToEmotion: {
    args: { catalog: 'catalog', culture: 'cultureId', word: 'wordId' }, optional: ['word'], output: 'emotion',
    doc: 'A love word from the culture catalog -> its letters.',
    fn: ({ catalog, culture, word = null }) => X.vocabToEmotion(catalog, culture, word),
  },
  blendEmotions: {
    args: { a: 'emotion', b: 'emotion', weight: 'number' }, optional: ['weight'], output: 'emotion',
    doc: 'Blend two vectors; weight is b relative to a (default 1).',
    fn: ({ a, b, weight = 1 }) => E.blend([[a, 1], [b, weight]]),
  },
  progressionToEmotion: {
    args: { progression: 'progression' }, output: 'emotion',
    doc: 'Chords -> emotion (quality + function + gestures).',
    fn: ({ progression }) => E.progressionEmotion(progression.chords, progression.key).emotion,
  },
  noteSetToEmotion: {
    args: { noteSet: 'noteSet' }, output: 'emotion',
    doc: 'Note set -> nearest mode -> emotion.',
    fn: ({ noteSet }) => N.noteSetToEmotion(noteSet).emotion,
  },

  // ---- emotion / sources -> harmony ----
  emotionToProgression: {
    args: { emotion: 'emotion', key: 'key', length: 'number', noteSet: 'noteSet' }, optional: ['key', 'length', 'noteSet'], output: 'progression',
    doc: 'Emotion -> best-matching chords (beam search over diatonic + borrowed chords). Default key D (Love = D).',
    fn: ({ emotion, key = null, length = 4, noteSet = null }) => {
      const minorish = (ns) => ns.intervals.includes(3) && !ns.intervals.includes(4);
      const k = key ?? (noteSet ? { tonic: noteSet.tonic, mode: minorish(noteSet) ? 'minor' : 'major' } : 'D');
      const r = E.emotionToProgression(emotion, { key: k, length, noteSet: noteSet ? noteSet.pcs : null });
      return progOut(r.key, r.chords, { similarity: r.similarity });
    },
  },
  emotionToNoteSet: {
    args: { emotion: 'emotion', tonic: 'pitch' }, optional: ['tonic'], output: 'noteSet',
    doc: 'Emotion -> nearest mode on a tonic (default D).',
    fn: ({ emotion, tonic = 'D' }) => N.emotionToNoteSet(emotion, { tonic }),
  },
  filmToProgression: {
    args: { films: 'films', film: 'filmId' }, output: 'progression',
    doc: 'Film love theme -> its catalogued, credited chord movement (no melody).',
    fn: ({ films, film }) => {
      const p = X.filmToProgression(films, film);
      return progOut(p.key, p.chords, { credit: p.credit, confidence: p.confidence, source: p.source });
    },
  },
  cultureProgression: {
    args: { catalog: 'catalog', culture: 'cultureId', convention: 'conventionId', tonic: 'pitch' }, optional: ['convention', 'tonic'], output: 'progression',
    doc: 'Culture harmonic convention -> chords in D (credited).',
    fn: ({ catalog, culture, convention = null, tonic = 'D' }) => {
      const p = X.cultureProgression(catalog, culture, { conventionId: convention, tonic });
      if (!p) throw new Error(`${culture} has no catalogued progression`);
      return progOut(p.key, p.chords, { credit: p.credit, confidence: p.confidence, source: p.source });
    },
  },
  cultureNoteSet: {
    args: { catalog: 'catalog', culture: 'cultureId', convention: 'conventionId', tonic: 'pitch' }, optional: ['convention', 'tonic'], output: 'noteSet',
    doc: 'Culture scale/mode -> note set in D (credited; tuning approximations flagged).',
    fn: ({ catalog, culture, convention = null, tonic = 'D' }) => {
      const ns = X.cultureNoteSet(catalog, culture, { conventionId: convention, tonic });
      if (!ns) throw new Error(`${culture} has no catalogued scale`);
      return ns;
    },
  },
  progressionToNoteSet: {
    args: { progression: 'progression' }, output: 'noteSet',
    doc: 'Union of chord tones.',
    fn: ({ progression }) => N.progressionToNoteSet(progression.chords, progression.key),
  },
  transposeProgression: {
    args: { progression: 'progression', tonic: 'pitch' }, optional: ['tonic'], output: 'progression',
    doc: 'Re-key a progression (via roman numerals) to a new tonic, default D.',
    fn: ({ progression, tonic = 'D' }) => {
      const from = progression.key ? parseKey(progression.key) : detectKey(progression.chords);
      const to = parseKey({ tonic, mode: from.mode });
      const romans = progression.chords.map((c) => chordToRoman(c, from));
      return progOut(to, romans.map((r) => romanToChord(r, to)), { credit: progression.credit ?? null, confidence: progression.confidence ?? null });
    },
  },

  // ---- harmony -> sound ----
  progressionToSequence: {
    args: { progression: 'progression', bpm: 'bpm', pattern: 'string', beatsPerChord: 'number' }, optional: ['bpm', 'pattern', 'beatsPerChord'], output: 'sequence',
    doc: 'Chords -> voice-led playable events (block | arpeggio | heartbeat).',
    fn: ({ progression, bpm = 72, pattern = 'block', beatsPerChord = 4 }) => S.progressionToSequence(progression.chords, { bpm, pattern, beatsPerChord }),
  },
  noteSetToSequence: {
    args: { noteSet: 'noteSet', bpm: 'bpm' }, optional: ['bpm'], output: 'sequence',
    doc: 'Note set -> rising/falling line over a drone.',
    fn: ({ noteSet, bpm = 72 }) => S.noteSetToSequence(noteSet, { bpm }),
  },
  applyTense: {
    args: { sequence: 'sequence', tense: 'tense' }, output: 'sequence',
    doc: 'was (echo, falling) | is (dry) | will (bright, rising).',
    fn: ({ sequence, tense }) => S.applyTense(sequence, tense),
  },
  addReLove: {
    args: { sequence: 'sequence' }, output: 'sequence',
    doc: 'Frame with the pinned word re-love: D call, G answer.',
    fn: ({ sequence }) => S.addReLove(sequence),
  },
};

/** Look up and run one transform with type-light argument checks. */
export function runTransform(id, args) {
  const t = TRANSFORMS[id];
  if (!t) throw new Error(`unknown transform: ${id}`);
  for (const a of Object.keys(t.args)) {
    if (!(t.optional || []).includes(a) && args[a] === undefined) throw new Error(`${id}: missing arg ${a}`);
  }
  return t.fn(args);
}

export { E as emotion, N as notes, S as sequence, X as sources };
