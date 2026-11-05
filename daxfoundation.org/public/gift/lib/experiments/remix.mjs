// remix.mjs -- REMIX: any template (+ a seed, or + another template) -> a new, valid template.
// Pure and deterministic: the same inputs always give the same template, byte for byte.
//
//   remix(parent, { op, seed, other, library, ctx })
//     op: 'theme'       swap the inspiration (question + options) for another template's
//         'culture'     seed a culture: pre-select it, or add a "culture lens" (one of its
//                       love words blended into the feeling before it becomes chords)
//         'palette'     move the harmony to another tonic and mode (the default key of love is D)
//         'rhythm'      change the playback pattern (block | arpeggio | heartbeat) and tempo
//         'interaction' solo -> pair (Person A and Person B both answer) or solo -> group
//                       (pass the device; everyone adds an answer)
//         'crossbreed'  two parents: both parents' inputs, blended, then parent A's ending
//     seed: any string; picks culture/theme/palette/rhythm/mode deterministically
//     library: the library (theme donors), ctx: { catalog, films }
//   applicableOps(template) -> the ops that can apply to it
// Every remix records lineage { parents, ancestors, transform: 'remix:<op>', seed, params,
// generation } so the dataset can trace it, and is re-finalised (a11y labels, samples,
// letters) so it passes the same gate as the library (tests/remix.test.mjs, property-tested).

import { finalizeTemplate, TEXT_WIDGETS, LOW_BANDWIDTH_MAX_BYTES } from './lib/template-tools.mjs';
import { TRANSFORMS } from './transforms/index.mjs';
import { BPM_MIN, BPM_MAX } from './a11y/spec.mjs';

export const REMIX_OPS = ['theme', 'culture', 'palette', 'rhythm', 'interaction', 'crossbreed'];

// ---------- deterministic randomness ----------

export function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
function rng(seedStr) {
  let a = hash32(seedStr) || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

// ---------- graph helpers ----------

const clone = (x) => JSON.parse(JSON.stringify(x));
const INPUT_WIDGETS = ['tap-choice', 'multi-choice', 'color-picker', 'tap-tempo'];

/** Rewrite references to stage `from` as `to` in every stage at or after index `start`. */
function rewire(stages, start, from, to) {
  for (let i = start; i < stages.length; i++) {
    for (const [k, v] of Object.entries(stages[i].transform.args)) {
      if (v === `$stage.${from}`) stages[i].transform.args[k] = `$stage.${to}`;
    }
  }
}

/**
 * Where the "head" (inputs -> one feeling) ends: the emotion stage feeding the first stage
 * that turns a feeling into harmony/sound (skipping the make-it-yours slider).
 * Returns { x, index } or null.
 */
export function headEnd(t) {
  for (const st of t.stages) {
    const tr = TRANSFORMS[st.transform.id];
    if (tr.output === 'emotion') continue;
    const emoArg = Object.entries(tr.args).find(([, type]) => type === 'emotion');
    if (!emoArg) continue;
    const ref = st.transform.args[emoArg[0]];
    if (typeof ref !== 'string' || !ref.startsWith('$stage.')) return null;
    let x = ref.slice(7);
    const src = t.stages.find((s) => s.id === x);
    if (src && src.bonus === 'make-it-yours') x = src.transform.args.base.slice(7);
    return { x, index: t.stages.findIndex((s) => s.id === x) };
  }
  return null;
}

const firstInput = (t, upTo) => t.stages.slice(0, upTo + 1).find((s) => INPUT_WIDGETS.includes(s.widget.type) && TRANSFORMS[s.transform.id].output === 'emotion');
const uniqueId = (stages, base) => { let id = base, n = 2; while (stages.some((s) => s.id === id)) id = `${base}-${n++}`; return id; };

const HARMONY_TONIC_STAGES = ['emotionToNoteSet', 'transposeProgression', 'cultureNoteSet', 'cultureProgression'];

export function applicableOps(t) {
  const ops = ['rhythm'];
  const he = headEnd(t);
  if (t.stages.some((s) => ['tap-choice', 'multi-choice'].includes(s.widget.type))) ops.push('theme');
  if (he || t.stages.some((s) => s.widget.type === 'catalog-picker' && s.widget.catalog === 'cultures')) ops.push('culture');
  if (t.stages.some((s) => s.transform.id === 'emotionToProgression' || HARMONY_TONIC_STAGES.includes(s.transform.id))) ops.push('palette');
  if (he && t.interaction.mode === 'solo' && firstInput(t, he.index)) ops.push('interaction');
  if (he) ops.push('crossbreed');
  return REMIX_OPS.filter((o) => ops.includes(o));
}

// ---------- ops ----------

function opTheme(t, r, { library }) {
  const s0 = t.stages.find((s) => ['tap-choice', 'multi-choice'].includes(s.widget.type));
  const donors = library.templates.filter((d) => d.id !== t.id && !d.care.sensitive && d.stages.some((s) => s.widget.type === 'tap-choice'));
  const donor = pick(r, donors);
  const ds = donor.stages.find((s) => s.widget.type === 'tap-choice');
  s0.prompt = ds.prompt;
  s0.widget.options = clone(ds.widget.options);
  s0.widget.default = null;
  t.source = clone(donor.source);
  t.question = donor.question;
  t.title = `${donor.title}, remixed`.slice(0, 60);
  return { params: { themeFrom: donor.id, stage: s0.id }, extraAncestors: [donor.id], resetSample: [s0.id] };
}

function opCulture(t, r, { ctx }) {
  const picker = t.stages.find((s) => s.widget.type === 'catalog-picker' && s.widget.catalog === 'cultures');
  if (picker) {
    const ok = ctx.catalog.cultures.filter((c) =>
      picker.widget.filter === 'hasScale' ? c.harmony.some((h) => ['scale', 'mode'].includes(h.kind) && h.intervals)
        : picker.widget.filter === 'hasProgression' ? c.harmony.some((h) => ['progression', 'cadence'].includes(h.kind) && h.progression) : c.vocab.length);
    const c = pick(r, ok);
    picker.widget.default = c.id;
    const reset = [picker.id, ...t.stages.filter((s) => s.widget.dependsOn === picker.id).map((s) => s.id)];
    return { params: { culture: c.id, mode: 'preselect', stage: picker.id }, resetSample: reset };
  }
  const c = pick(r, ctx.catalog.cultures);
  const { x, index } = headEnd(t);
  const lensId = uniqueId(t.stages, 'lens');
  const blendId = uniqueId(t.stages, 'lens-blend');
  const lens = {
    id: lensId, prompt: `A word for love in ${c.language}: pick the one that fits.`,
    widget: { type: 'catalog-picker', catalog: 'vocab', culture: c.id, default: c.vocab[0].id },
    transform: { id: 'vocabToEmotion', args: { catalog: '$ctx.catalog', culture: c.id, word: '$widget' } },
    visualization: { type: 'word-card', caption: 'The word in its own script, its nuance, sources and confidence.' },
  };
  const blendSt = {
    id: blendId, prompt: `Your feeling, heard through ${c.language}.`, widget: { type: 'none', default: null },
    transform: { id: 'blendEmotions', args: { a: `$stage.${x}`, b: `$stage.${lensId}`, weight: 0.5 } },
    visualization: { type: 'compare-bars' },
  };
  t.stages.splice(index + 1, 0, lens, blendSt);
  rewire(t.stages, index + 3, x, blendId);
  t.title = `${t.title} (${c.language})`.slice(0, 60);
  return { params: { culture: c.id, mode: 'lens', after: x } };
}

const TONICS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
function opPalette(t, r) {
  const tonic = pick(r, TONICS);
  const mode = pick(r, ['major', 'minor']);
  const key = mode === 'minor' ? `${tonic}m` : tonic;
  for (const st of t.stages) {
    const a = st.transform.args;
    if (st.transform.id === 'emotionToProgression' && !a.noteSet) a.key = key;
    if (HARMONY_TONIC_STAGES.includes(st.transform.id)) a.tonic = tonic;
    st.prompt = st.prompt.replace(/\b(on|in|to) D\b/g, `$1 ${tonic}`).replace(/D -- the note for love/g, `${tonic}`);
  }
  t.title = `${t.title} in ${tonic} ${mode}`.slice(0, 60);
  return { params: { tonic, mode } };
}

function opRhythm(t, r) {
  const pattern = pick(r, ['block', 'arpeggio', 'heartbeat']);
  const steps = []; for (let b = 48; b <= 132; b += 6) steps.push(b);
  const bpm = Math.min(BPM_MAX, Math.max(BPM_MIN, pick(r, steps)));
  for (const st of t.stages) {
    if (st.transform.id === 'progressionToSequence') {
      st.transform.args.pattern = pattern; st.transform.args.bpm = bpm;
      if (st.visualization.type !== 'share-card') st.visualization = { type: pattern === 'heartbeat' ? 'heartbeat-pulse' : 'piano-roll' };
    }
    if (st.transform.id === 'noteSetToSequence') st.transform.args.bpm = bpm;
  }
  t.title = `${t.title}, ${pattern} at ${bpm}`.slice(0, 60);
  return { params: { pattern, bpm } };
}

function opInteraction(t, r) {
  const { x, index } = headEnd(t);
  const f = firstInput(t, index);
  const canGroup = ['tap-choice', 'multi-choice'].includes(f.widget.type);
  const target = canGroup ? pick(r, ['pair', 'group']) : 'pair';
  if (target === 'group') {
    f.actor = 'group';
    f.widget = { type: 'multi-choice', default: null, options: f.widget.options, min: 1 };
    f.transform = { id: 'choicesToEmotion', args: { choices: '$widget', options: '$options' } };
    f.prompt = `Pass the device: everyone adds an answer. ${f.prompt}`;
    t.interaction = { mode: 'group', participants: { min: 3, max: 12 } };
    t.title = `${t.title}, together`.slice(0, 60);
    return { params: { to: 'group', stage: f.id }, resetSample: [f.id] };
  }
  const bId = uniqueId(t.stages, `${f.id}-b`);
  const blendId = uniqueId(t.stages, 'pair-blend');
  for (const s of t.stages.slice(0, index + 1)) if (INPUT_WIDGETS.includes(s.widget.type) || s.widget.type === 'catalog-picker') s.actor = 'A';
  const fb = { ...clone(f), id: bId, actor: 'B' };
  const blendSt = {
    id: blendId, prompt: 'Both of your answers, together.', widget: { type: 'none', default: null },
    transform: { id: 'blendEmotions', args: { a: `$stage.${x}`, b: `$stage.${bId}`, weight: 1 } },
    visualization: { type: 'compare-bars' },
  };
  t.stages.splice(index + 1, 0, fb, blendSt);
  rewire(t.stages, index + 3, x, blendId);
  t.interaction = { mode: 'pair', participants: { min: 2, max: 2 } };
  t.title = `${t.title}, for two`.slice(0, 60);
  return { params: { to: 'pair', stage: f.id, copy: bId }, copySample: { [bId]: f.id } };
}

function opCrossbreed(a, b) {
  const ha = headEnd(a), hb = headEnd(b);
  if (!ha || !hb) throw new Error('crossbreed needs two parents that each turn inputs into a feeling');
  // a prefix that collides with none of A's stage ids (A may itself be a crossbreed)
  const headIds = b.stages.slice(0, hb.index + 1).map((s) => s.id);
  let prefix = 'b-';
  for (let n = 2; headIds.some((id) => a.stages.some((s) => s.id === `${prefix}${id}`)); n++) prefix = `b${n}-`;
  const ren = (id) => `${prefix}${id}`;
  const bHead = clone(b.stages.slice(0, hb.index + 1)).map((s) => {
    const args = Object.fromEntries(Object.entries(s.transform.args).map(([k, v]) => [k,
      typeof v === 'string' && v.startsWith('$stage.') ? `$stage.${ren(v.slice(7))}` : typeof v === 'string' && v.startsWith('$widgets.') ? `$widgets.${ren(v.slice(9))}` : v]));
    const out = { ...s, id: ren(s.id), transform: { ...s.transform, args } };
    if (out.widget.dependsOn) out.widget = { ...out.widget, dependsOn: ren(out.widget.dependsOn) };
    if (a.interaction.mode === 'solo' || out.actor === 'group') delete out.actor;
    else if (a.interaction.mode === 'pair' && out.actor) out.actor = out.actor; // keep A/B
    return out;
  });
  const stages = clone(a.stages);
  const crossId = uniqueId([...stages, ...bHead], 'cross');
  const crossSt = {
    id: crossId, prompt: `${a.source.label} and ${b.source.label}, together.`, widget: { type: 'none', default: null },
    transform: { id: 'blendEmotions', args: { a: `$stage.${ha.x}`, b: `$stage.${ren(hb.x)}`, weight: 1 } },
    visualization: { type: 'compare-bars' },
  };
  stages.splice(ha.index + 1, 0, ...bHead, crossSt);
  rewire(stages, ha.index + 2 + bHead.length, ha.x, crossId);
  const agesB = new Set(b.audience.ages);
  const ages = a.audience.ages.filter((x) => agesB.has(x));
  const care = a.care.sensitive || b.care.sensitive
    ? { sensitive: true, optional: true, note: [a.care.note, b.care.note].filter(Boolean).join(' ') || 'Optional.' }
    : { ...a.care, note: [a.care.note, b.care.note].filter(Boolean).join(' ') || null };
  const ruleA = JSON.stringify(a.unlockRule), ruleB = JSON.stringify(b.unlockRule);
  return {
    template: {
      ...a, stages,
      title: `${a.title} + ${b.title}`.slice(0, 60),
      depth: Math.min(5, Math.max(a.depth, b.depth) + 1),
      minutes: a.minutes + Math.ceil(b.minutes / 2),
      audience: { ages: ages.length ? ages : [...a.audience.ages] },
      care,
      unlockRule: ruleA === ruleB ? a.unlockRule : { all: [a.unlockRule, b.unlockRule] },
    },
    params: { with: b.id, at: ha.x },
    copySample: Object.fromEntries(Object.keys(b.sample || {}).filter((k) => bHead.some((s) => s.id === ren(k))).map((k) => [ren(k), ['other', k]])),
  };
}

// ---------- the remix ----------

export function remix(parent, { op, seed = '0', other = null, library = null, ctx } = {}) {
  if (!REMIX_OPS.includes(op)) throw new Error(`unknown remix op ${op}`);
  if (!applicableOps(parent).includes(op)) throw new Error(`${op} does not apply to ${parent.id}`);
  if (op === 'crossbreed' && !other) throw new Error('crossbreed needs another template');
  if (op === 'theme' && !library) throw new Error('theme needs the library (donors)');
  const r = rng(`${parent.id}|${op}|${seed}|${other ? other.id : ''}`);
  let t = clone(parent);
  let res;
  if (op === 'crossbreed') { res = opCrossbreed(t, clone(other)); t = res.template; }
  else res = { theme: opTheme, culture: opCulture, palette: opPalette, rhythm: opRhythm, interaction: opInteraction }[op](t, r, { library, ctx });

  // sample: keep what still applies, copy where stages were copied, drop what changed
  const sample = { ...(parent.sample || {}) };
  for (const k of res.resetSample || []) delete sample[k];
  for (const [k, from] of Object.entries(res.copySample || {})) {
    if (Array.isArray(from)) { if (other.sample && from[1] in other.sample) sample[k] = other.sample[from[1]]; } else if (from in sample) sample[k] = sample[from];
  }
  t.sample = sample;

  // variant must still hold, else it becomes standard
  if (t.variant === 'text-only' && t.stages.some((s) => !TEXT_WIDGETS.includes(s.widget.type))) t.variant = 'standard';
  if (t.variant === 'low-bandwidth' && (JSON.stringify(t).includes('$ctx.') || new TextEncoder().encode(JSON.stringify(t)).length > LOW_BANDWIDTH_MAX_BYTES - 1500)) t.variant = 'standard';

  const parents = other ? [parent.id, other.id] : [parent.id];
  const prevAnc = [...((parent.lineage && parent.lineage.ancestors) || []), ...((other && other.lineage && other.lineage.ancestors) || [])];
  const ancestors = [...new Set([...prevAnc, ...parents, ...(res.extraAncestors || [])])];
  const generation = 1 + Math.max(parent.lineage ? parent.lineage.generation : 0, other && other.lineage ? other.lineage.generation : 0);
  const params = res.params;
  const id = `remix-${hash32(JSON.stringify([parents, op, seed, params])).toString(16).padStart(8, '0')}-g${generation}`;

  t = {
    ...t, id, version: 1, flagship: false, letters: [], summary: null,
    lineage: { parents, ancestors, transform: `remix:${op}`, seed: String(seed), params, generation },
    unlocks: { templates: [], stages: [] },
  };
  return finalizeTemplate(t, ctx);
}
