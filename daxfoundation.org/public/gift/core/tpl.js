// Templates: the 150-experiment library (state/gift/experiments, gift 4/4) driven by its OWN runner,
// transforms and unlock rules (synced to ../lib/experiments). This module adds only what the
// studio needs around them: widget values validated as untrusted input (they travel in links),
// the picker's option lists, a summary for the card, and the sequence -> playable notes bridge.

import { runExperiment } from '../lib/experiments/runner.mjs';
import { TRANSFORMS } from '../lib/experiments/transforms/index.mjs';
import { progress, complete } from '../lib/experiments/progression/unlock.mjs';

export const LETTER_IDS = Object.freeze(['love', 'tenderness', 'togetherness', 'trust', 'curiosity', 'adventure', 'creativity', 'discovery', 'joy', 'hope', 'birth', 'awe', 'gratitude', 'longing', 'doubt']);
export const TENSE_IDS = Object.freeze(['was', 'is', 'will']);
const MAX_TAPS = 16;

/** the library bundle: { library, ctx: {catalog, films}, progression } */
export function makeBundle(library, cultures, films, progression) {
  return { library, ctx: { catalog: cultures, films }, progression, byId: new Map(library.templates.map((t) => [t.id, t])) };
}

const hasScale = (c) => (c.harmony || []).some((h) => ['scale', 'mode'].includes(h.kind) && h.intervals);
const hasProgression = (c) => (c.harmony || []).some((h) => ['progression', 'cadence'].includes(h.kind) && h.progression);

/** options a choice-like widget offers, given the answers so far: [{id, label, sub?, letters?}]. */
export function widgetOptions(stage, bundle, widgets = {}) {
  const w = stage.widget;
  if (w.type === 'tap-choice' || w.type === 'multi-choice') return w.options.map((o) => ({ id: o.id, label: o.label, letters: o.letters }));
  if (w.type === 'tense-picker') return TENSE_IDS.map((id) => ({ id, label: id }));
  if (w.type !== 'catalog-picker') return [];
  if (w.catalog === 'films') {
    return bundle.ctx.films.themes.map((f) => ({ id: f.id, label: f.work, sub: `${f.year} — ${f.composer} · ${f.confidence}` }));
  }
  const cultures = bundle.ctx.catalog.cultures;
  if (w.catalog === 'cultures') {
    const keep = w.filter === 'hasScale' ? hasScale : w.filter === 'hasProgression' ? hasProgression : () => true;
    return cultures.filter(keep).map((c) => ({ id: c.id, label: c.endonym || c.language, sub: `${c.language} · ${c.region}` }));
  }
  if (w.catalog === 'vocab') {
    // a vocab picker is fixed to one culture (widget.culture: culture-seeded templates, culture-lens
    // remixes) or follows an earlier culture picker (widget.dependsOn)
    const c = cultures.find((x) => x.id === (w.culture || widgets[w.dependsOn]));
    return c ? c.vocab.map((v) => ({ id: v.id, label: v.word, sub: v.gloss })) : [];
  }
  return [];
}

/** is this stage open to play (bonus stages need their unlock)? */
export const stageActive = (stage, unlocked) => !stage.bonus || unlocked.includes(stage.bonus);

/** does this stage need an answer before the experiment can continue? */
export function needsAnswer(stage, unlocked) {
  if (!stageActive(stage, unlocked)) return false;
  const w = stage.widget;
  if (w.type === 'none' || w.type === 'slider-set' || w.type === 'tense-picker') return false;
  return w.default === null || w.default === undefined;
}

/** Validate widget values (from a link or storage): unknown stages and bad values are dropped. */
export function cleanWidgets(template, raw, bundle) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const stage of template.stages) {
    if (!Object.prototype.hasOwnProperty.call(raw, stage.id)) continue;
    const v = raw[stage.id], w = stage.widget;
    const ids = () => widgetOptions(stage, bundle, out).map((o) => o.id);
    if (w.type === 'tap-choice' || w.type === 'catalog-picker' || w.type === 'tense-picker') {
      if (typeof v === 'string' && ids().includes(v)) out[stage.id] = v;
    } else if (w.type === 'multi-choice') {
      if (Array.isArray(v)) { const ok = [...new Set(v.filter((x) => typeof x === 'string' && ids().includes(x)))]; if (ok.length) out[stage.id] = ok; }
    } else if (w.type === 'slider-set') {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const s = {};
        for (const l of LETTER_IDS) if (Number.isFinite(v[l]) && v[l] > 0) s[l] = Math.round(Math.min(1, v[l]) * 100) / 100;
        out[stage.id] = s;
      }
    } else if (w.type === 'color-picker') {
      if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) out[stage.id] = v.toLowerCase();
    } else if (w.type === 'tap-tempo') {
      // only the spacing matters (the transform keeps just the tempo): store it relative, rounded
      if (Array.isArray(v) && v.length >= 2 && v.length <= MAX_TAPS && v.every((x) => Number.isFinite(x) && x >= 0)) {
        const rel = v.map((x) => Math.round(x - v[0]));
        if (rel.every((x, i) => i === 0 || (x > rel[i - 1] && x - rel[i - 1] < 4000))) out[stage.id] = rel;
      }
    }
  }
  return out;
}

export const cleanUnlocked = (raw, bundle) => (Array.isArray(raw) ? [...new Set(raw.filter((s) => bundle.progression.bonus_stages.some((b) => b.id === s)))] : []);

/** the next stage index that still needs an answer, or -1 when the experiment can finish. */
export function firstMissing(template, widgets, unlocked) {
  return template.stages.findIndex((s) => needsAnswer(s, unlocked) && !(s.id in widgets));
}

/** run as far as the answers allow. Returns { outputs, done, error }. Never throws. */
export function runUpTo(template, widgets, bundle, unlocked) {
  const miss = firstMissing(template, widgets, unlocked);
  const stages = miss === -1 ? template.stages : template.stages.slice(0, miss);
  if (!stages.length) return { outputs: {}, done: false };
  try {
    const r = runExperiment({ ...template, stages }, widgets, bundle.ctx, { unlockedStages: unlocked });
    return { outputs: r.outputs, done: miss === -1 };
  } catch (e) {
    return { outputs: {}, done: false, error: String(e && e.message || e) };
  }
}

export const outputType = (stage) => (TRANSFORMS[stage.transform.id] || {}).output;

/** what a finished run means: letters, chords, credits, the sequence, culture. */
export function summarize(template, outputs, widgets, bundle) {
  let emotion = null, progression = null, noteSet = null, sequence = null;
  const credits = [];
  for (const s of template.stages) {
    const o = outputs[s.id];
    if (!o) continue;
    const ty = outputType(s);
    if (ty === 'emotion') emotion = o;
    if (ty === 'progression') { progression = o; if (o.credit) credits.push({ text: o.credit, confidence: o.confidence || null }); }
    if (ty === 'noteSet') { noteSet = o; if (o.source && o.source.credit) credits.push({ text: o.source.credit, confidence: o.source.confidence || null }); }
    if (ty === 'sequence') sequence = o;
  }
  const letters = emotion ? LETTER_IDS.map((l) => [l, emotion[l] || 0]).filter(([, x]) => x > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([l]) => l) : [];
  const cultureStage = template.stages.find((s) => s.widget.type === 'catalog-picker' && s.widget.catalog === 'cultures' && widgets[s.id]);
  const tenseStage = template.stages.find((s) => s.widget.type === 'tense-picker' && widgets[s.id]);
  const relove = !!(sequence && sequence.events.some((e) => e.role === 'love-call'));
  const chords = progression ? progression.chords.slice() : (sequence && sequence.chords) || [];
  return {
    letters: letters.length ? letters : template.letters.slice(0, 1),
    // what to print for the harmony: the chords, or (scale recipes) the named scale
    harmony: chords.length ? chords.join('–') : noteSet ? `${noteSet.tonic} ${noteSet.mode} · ${noteSet.names.join(' ')}` : '',
    emotion, noteSet,
    chords,
    credits,
    sequence,
    culture: cultureStage ? widgets[cultureStage.id] : null,
    tense: tenseStage ? widgets[tenseStage.id] : 'is',
    relove,
  };
}

const ROLE = { chord: 'phrase', bass: 'hum', drone: 'hum', lub: 'hum', dub: 'hum', arp: 'phrase', melody: 'phrase', echo: 'phrase', tail: 'phrase', 'love-call': 'call', 'love-answer': 'answer' };
/** a library sequence -> the studio player's result shape { notes, beats, seconds, sound }. */
export function playable(seq, letters) {
  if (!seq || !Array.isArray(seq.events)) return { notes: [], beats: 0, seconds: 0, sound: { bpm: 72, tb: 'soft', tense: 'is' } };
  const notes = seq.events
    .filter((e) => Number.isFinite(e.midi) && Number.isFinite(e.t) && Number.isFinite(e.dur))
    .map((e) => ({ m: e.midi, t: e.t, d: e.dur, v: Math.max(0.1, Math.min(1, e.vel || 0.7)), part: ROLE[e.role] || 'phrase', letter: letters[(e.chordIndex || 0) % Math.max(1, letters.length)] }));
  const beats = Math.max(seq.lengthBeats || 0, ...notes.map((n) => n.t + n.d));
  const bpm = Math.min(160, Math.max(40, seq.bpm || 72));
  return { notes, beats, seconds: Math.round((beats * 60 / bpm) * 10) / 10, sound: { bpm, tb: 'soft', tense: 'is' } };
}

/** the share payload for a template experiment (enumerated values only). */
export function templatePayload(templateId, widgets, unlocked, gen = 0, parent) {
  const p = { v: 1, t: templateId, w: widgets, u: unlocked, gen };
  if (parent) p.parent = parent;
  return p;
}

/** validate an untrusted template payload. Returns a clean payload or null. */
export function normalizeTemplatePayload(raw, bundle) {
  if (!raw || typeof raw !== 'object' || raw.v !== 1 || typeof raw.t !== 'string') return null;
  const template = bundle.byId.get(raw.t);
  if (!template) return null;
  const u = cleanUnlocked(raw.u, bundle);
  const p = templatePayload(template.id, cleanWidgets(template, raw.w, bundle), u, Number.isInteger(raw.gen) ? Math.min(99, Math.max(0, raw.gen)) : 0);
  if (typeof raw.parent === 'string' && /^[0-9a-f]{12}$/.test(raw.parent)) p.parent = raw.parent;
  return p;
}

// ---- the game layer: the library's own unlock rules ----
export const libraryProgress = (completed, bundle) => progress({ completed }, bundle.library, bundle.progression);
export function completeTemplate(completed, id, bundle) {
  try { return complete({ completed }, id, bundle.library, bundle.progression); } catch { return { state: { completed }, opened: { templates: [], stages: [], rings: [] } }; }
}
