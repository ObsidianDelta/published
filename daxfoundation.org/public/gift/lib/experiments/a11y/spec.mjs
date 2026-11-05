// a11y/spec.mjs -- the accessibility contract every template, the runner, the remixer
// and the studio share. Pure data + pure functions; no DOM.
//
//  * WIDGET_A11Y: the ARIA pattern, keyboard model and non-timing alternative of each widget.
//  * VIZ_A11Y: each visualization's role, its text alternative, its animation and the
//    prefers-reduced-motion fallback (static or crossfade), and its maximum flash rate.
//  * describe(type, value): the text alternative of any stage output (what a screen reader
//    hears; also the whole UI in text-only mode).
//  * stageA11y / templateA11y: the label + hint baked into every template (validated).
// See state/gift/experiments/A11Y.md.

import { parseChord, pcToName } from '../transforms/theory.mjs';
import { LETTERS, topLetters } from '../transforms/emotion.mjs';

// WCAG 2.3.1: no more than three flashes in any one second.
export const MAX_FLASH_HZ = 3;
// Tempo bounds the studio may ever play (remix clamps to these). The heartbeat visual
// pulses once per beat ("lub" only), so 160 bpm = 2.67 Hz < 3 Hz.
export const BPM_MIN = 40;
export const BPM_MAX = 160;

export const WIDGET_A11Y = {
  none: { pattern: 'none', keyboard: null, hint: null },
  'tap-choice': { pattern: 'radiogroup', element: 'fieldset > legend + input[type=radio]', keyboard: 'Tab into the group, arrow keys to move, Space to choose.', hint: 'Choose one.' },
  'multi-choice': { pattern: 'checkbox-group', element: 'fieldset > legend + input[type=checkbox]', keyboard: 'Tab between options, Space to tick.', hint: 'Choose one or more.' },
  'slider-set': { pattern: 'slider', element: 'input[type=range] with label and aria-valuetext', keyboard: 'Arrow keys change a slider; each runs from none to a lot.', hint: 'Move any slider; leave the rest.' },
  'color-picker': { pattern: 'radiogroup + native colour input', element: 'named colour radios, plus input[type=color] for any colour', keyboard: 'Arrow keys through the named colours, or Tab to the colour field.', hint: 'Choose a named colour, or any colour you like.', alternative: 'named-colours' },
  'tap-tempo': { pattern: 'button + radiogroup alternative', element: 'button (tap), then a pace radiogroup for anyone who cannot or would rather not tap in time', keyboard: 'Press Space or Enter on the button in rhythm, or choose a pace.', hint: 'Tap in rhythm, or choose a pace instead.', alternative: 'pace' },
  'tense-picker': { pattern: 'radiogroup', element: 'fieldset > legend + 3 radios', keyboard: 'Arrow keys to move, Space to choose.', hint: 'Choose was, is, or will be.' },
  'catalog-picker': { pattern: 'select', element: 'label + select (native listbox)', keyboard: 'Arrow keys or type to search, Enter to choose.', hint: 'Choose from the list.' },
};

// Non-timing alternative for tap-tempo: a pace maps to the taps it stands for.
export const PACES = [
  { id: 'very-slow', label: 'very slow, like breathing in sleep', bpm: 50 },
  { id: 'calm', label: 'calm, like a resting heart', bpm: 66 },
  { id: 'walking', label: 'walking pace', bpm: 90 },
  { id: 'dancing', label: 'dancing', bpm: 120 },
  { id: 'racing', label: 'racing, like a heart that just ran', bpm: 150 },
];
export function paceToTaps(paceId) {
  const p = PACES.find((x) => x.id === paceId);
  if (!p) throw new Error(`unknown pace ${paceId}`);
  const ms = 60000 / p.bpm;
  return [0, 1, 2, 3, 4].map((i) => Math.round(i * ms));
}

// Named colours for the colour-picker alternative (names are spoken; hex is the value).
export const NAMED_COLOURS = [
  { id: 'red', label: 'red', hex: '#dc2626' }, { id: 'rose', label: 'rose pink', hex: '#f472b6' },
  { id: 'orange', label: 'orange', hex: '#ea580c' }, { id: 'gold', label: 'gold', hex: '#eab308' },
  { id: 'green', label: 'leaf green', hex: '#16a34a' }, { id: 'teal', label: 'teal', hex: '#0d9488' },
  { id: 'blue', label: 'deep blue', hex: '#1d4ed8' }, { id: 'violet', label: 'violet', hex: '#7c3aed' },
  { id: 'brown', label: 'earth brown', hex: '#92400e' }, { id: 'grey', label: 'soft grey', hex: '#9ca3af' },
];

/** A spoken colour name for any hex (nearest named colour, then lightness). */
export function colourName(hex) {
  const n = parseInt(String(hex).replace('#', ''), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  let best = null;
  for (const c of NAMED_COLOURS) {
    const m = parseInt(c.hex.slice(1), 16);
    const d = [(m >> 16) & 255, (m >> 8) & 255, m & 255].reduce((s, v, i) => s + (v - rgb[i]) ** 2, 0);
    if (!best || d < best.d) best = { c, d };
  }
  const l = (Math.max(...rgb) + Math.min(...rgb)) / 510;
  return `${l > 0.8 ? 'light ' : l < 0.2 ? 'dark ' : ''}${best.c.label}`;
}

// animation: what the full-motion studio may do; reducedMotion: what it must do instead.
// kind 'none' | 'fade' (opacity only) | 'draw' | 'slide' | 'rotate' | 'pulse' | 'playhead'.
export const VIZ_A11Y = {
  'emotion-radar': { role: 'img', textOf: 'emotion', animation: { kind: 'draw', ms: 600, iterations: 1 }, reducedMotion: 'static', colourIndependent: 'Each axis is labelled with its letter and value; values also listed as text.' },
  'compare-bars': { role: 'img', textOf: 'emotion', animation: { kind: 'draw', ms: 500, iterations: 1 }, reducedMotion: 'static', colourIndependent: 'Bars carry text labels and numbers; series differ by pattern and label, not only colour.' },
  'color-field': { role: 'img', textOf: 'emotion', animation: { kind: 'fade', ms: 800, iterations: 1 }, reducedMotion: 'crossfade', colourIndependent: 'The colour is named in words, with its feelings listed as text.' },
  'word-card': { role: 'group', textOf: 'emotion', animation: { kind: 'fade', ms: 300, iterations: 1 }, reducedMotion: 'crossfade', colourIndependent: 'Text only.' },
  'chord-strip': { role: 'list', textOf: 'progression', animation: { kind: 'slide', ms: 400, iterations: 1 }, reducedMotion: 'crossfade', colourIndependent: 'Chords are named in words and roman numerals; the current chord is marked with aria-current, not colour.' },
  'film-credit': { role: 'group', textOf: 'progression', animation: { kind: 'fade', ms: 300, iterations: 1 }, reducedMotion: 'crossfade', colourIndependent: 'Text only; confidence written as a word.' },
  'culture-card': { role: 'group', textOf: 'progression|noteSet', animation: { kind: 'fade', ms: 300, iterations: 1 }, reducedMotion: 'crossfade', colourIndependent: 'Text only; tuning approximations written out.' },
  'note-wheel': { role: 'img', textOf: 'noteSet', animation: { kind: 'rotate', ms: 900, iterations: 1 }, reducedMotion: 'static', colourIndependent: 'Notes are named on the wheel and listed in text.' },
  'piano-roll': { role: 'img', textOf: 'sequence', animation: { kind: 'playhead', ms: null, iterations: 'while playing' }, reducedMotion: 'static', colourIndependent: 'Notes are listed by chord in text; the live region names each chord as it plays.' },
  'heartbeat-pulse': { role: 'img', textOf: 'sequence', animation: { kind: 'pulse', ms: 'one per beat', iterations: 'while playing', flashesPerBeat: 1 }, reducedMotion: 'static', colourIndependent: 'The beat is written as beats per minute; the pulse is a size change, not a colour change.' },
  'share-card': { role: 'group', textOf: 'sequence', animation: { kind: 'none', ms: 0, iterations: 0 }, reducedMotion: 'static', colourIndependent: 'Text summary of the whole result.' },
};

/** Flashes per second a visualization could produce for this output. */
export function flashRateHz(vizType, output) {
  const a = VIZ_A11Y[vizType].animation;
  if (a.kind !== 'pulse') return 0;
  const bpm = output && output.bpm ? output.bpm : 72;
  return (bpm / 60) * (a.flashesPerBeat || 1);
}

// ---------- spoken text ----------

const ACC_WORD = (name) => name.replace(/#/g, ' sharp').replace(/(?<=[A-G])b/g, ' flat');
const Q_WORD = {
  '': 'major', m: 'minor', 5: 'open fifth', 7: 'seven', maj7: 'major seven', m7: 'minor seven', sus2: 'suspended two',
  sus4: 'suspended four', 6: 'six', m6: 'minor six', add9: 'add nine', 9: 'nine', dim: 'diminished', dim7: 'diminished seven',
  m7b5: 'half-diminished', aug: 'augmented',
};
export function chordSpoken(sym) {
  const c = parseChord(sym);
  const m = /^([A-G][#b]?)/.exec(sym);
  let s = `${ACC_WORD(m[1])} ${Q_WORD[c.quality]}`;
  const slash = /\/([A-G][#b]?)$/.exec(sym);
  if (slash) s += ` over ${ACC_WORD(slash[1])}`;
  return s;
}
export const noteSpoken = (name) => ACC_WORD(name);

function pct(v, l, sum) { return Math.round((100 * v[l]) / sum); }

/** The text alternative of a stage output, by output type. */
export function describe(type, v) {
  if (v == null) return '';
  if (type === 'emotion') {
    const top = topLetters(v, 3);
    if (!top.length) return 'No feeling yet.';
    const sum = LETTERS.reduce((s, l) => s + (v[l] || 0), 0);
    const [a, ...rest] = top;
    return `Mostly ${a}${rest.length ? `, then ${rest.join(' and ')}` : ''}. (${top.map((l) => `${l} ${pct(v, l, sum)} percent`).join(', ')}.)`;
  }
  if (type === 'progression') {
    const key = v.key ? `${noteSpoken(v.key.tonic)} ${v.key.mode}` : 'its own key';
    const list = v.chords.map((c, i) => `${chordSpoken(c)}${v.romans && v.romans[i] ? ` (${v.romans[i]})` : ''}`).join(', ');
    const credit = v.credit ? ` Credit: ${v.credit}.` : '';
    const conf = v.confidence ? ` Confidence: ${v.confidence}.` : '';
    return `${v.chords.length} chords in ${key}: ${list}.${credit}${conf}`;
  }
  if (type === 'noteSet') {
    const tn = v.source && v.source.tuning_note ? ` ${v.source.tuning_note}` : '';
    const cr = v.source && v.source.credit ? ` Credit: ${v.source.credit}.` : '';
    return `${v.names.length} notes starting on ${noteSpoken(v.tonic)} (${String(v.mode).replace(/([A-Z])/g, ' $1').toLowerCase()}): ${v.names.map(noteSpoken).join(', ')}.${cr}${tn}`;
  }
  if (type === 'sequence') {
    const parts = [`${v.lengthBeats} beats at ${v.bpm} beats per minute`];
    if (v.pattern) parts.push(`${v.pattern === 'scale' ? 'a rising and falling line' : `${v.pattern} pattern`}`);
    if (v.chords && v.chords.length) parts.push(`chords: ${v.chords.map(chordSpoken).join(', ')}`);
    if (v.tense && v.tense !== 'is') parts.push(v.tense === 'was' ? 'heard as a memory, echoing and falling' : 'heard as a hope, rising');
    if (v.reLove) parts.push('framed by the love call D and its answer G');
    return `${parts.join('; ')}.`;
  }
  return String(v);
}

/** Label + hint a template stage carries (validated: must equal this derivation).
 * Step numbers are NOT baked in: locked bonus stages change the count, so the runner
 * numbers the steps that actually run (see announcement()). */
export function stageA11y(stage) {
  const w = WIDGET_A11Y[stage.widget.type];
  const who = stage.actor === 'A' ? 'Person A: ' : stage.actor === 'B' ? 'Person B: ' : stage.actor === 'group' ? 'Everyone: ' : '';
  return {
    label: `${who}${stage.prompt}`,
    hint: w.hint ? `${w.hint} ${w.keyboard}` : 'Nothing to choose here; the result is read out when it is ready.',
  };
}

/** a11y for all stages of a template: like stageA11y, but a label that repeats an earlier
 * one gets "(part 2)", "(part 3)"... so every step region has a unique accessible name. */
export function stagesA11y(stages) {
  const seen = {};
  return stages.map((st) => {
    const a = stageA11y(st);
    seen[a.label] = (seen[a.label] || 0) + 1;
    return seen[a.label] > 1 ? { ...a, label: `${a.label} (part ${seen[a.label]})` } : a;
  });
}

export function templateA11y(t) {
  return {
    summary: `${t.title}. ${t.question} About ${t.minutes} minute${t.minutes === 1 ? '' : 's'}, ${t.stages.filter((s) => !s.bonus).length} steps.${t.care.sensitive ? ' Optional; you can skip at any time.' : ''}`,
    keyboard: true,
    screenReader: true,
    reducedMotion: 'supported',
    textOnly: t.variant === 'text-only',
  };
}

/** Live-region announcement after a stage completes. */
export function announcement(stage, outputType, output, index, total) {
  return { politeness: 'polite', text: `Step ${index + 1} of ${total} done. ${describe(outputType, output)}` };
}

export { pcToName };
