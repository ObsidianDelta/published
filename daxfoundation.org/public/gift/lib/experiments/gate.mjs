// gate.mjs -- THE gate (browser-safe: no Node built-ins; the caller passes the schema). One function every template must pass: the 150 in
// library.json and every remix. Returns a list of problems (empty = valid).
//   checkTemplate(template, ctx, { schema, run = true })   schema = schema/experiment-template.schema.json
// In Node, validate-template.mjs wraps this and loads the schema for you.
// Checks: JSON Schema; stage-graph types against the transform registry; visualization
// fits output; ends playable; bonus stages type-preserving; a11y fields equal their
// derivation; variant rules (text-only, low-bandwidth); interaction actors; flash rate;
// tempo bounds; safety text (no lyrics/recording/contact asks, no real people's names);
// and an actual run with its sample, bonus stages locked and unlocked.

import { validate } from './schema/validate.mjs';
import { TRANSFORMS } from './transforms/index.mjs';
import { runExperiment } from './runner.mjs';
import { stagesA11y, templateA11y, VIZ_A11Y, flashRateHz, MAX_FLASH_HZ, BPM_MIN, BPM_MAX } from './a11y/spec.mjs';
import { TEXT_WIDGETS, LOW_BANDWIDTH_MAX_BYTES } from './lib/template-tools.mjs';

export const ALL_BONUS = ['make-it-yours', 'tense', 're-love'];

const WIDGET_TYPE = {
  'tap-choice': 'choiceId', 'multi-choice': 'choiceIds', 'slider-set': 'sliders', 'color-picker': 'hex',
  'tap-tempo': 'taps', 'tense-picker': 'tense', none: 'null',
};
const CATALOG_TYPE = { films: 'filmId', cultures: 'cultureId', vocab: 'wordId' };
export const VIZ_FOR = {
  emotion: ['emotion-radar', 'compare-bars', 'color-field', 'word-card'],
  progression: ['chord-strip', 'film-credit', 'culture-card'],
  noteSet: ['note-wheel', 'culture-card'],
  sequence: ['piano-roll', 'heartbeat-pulse', 'share-card'],
};
const LITERAL = { number: 'number', bpm: 'number', string: 'string', pitch: 'string', key: 'string', tense: 'string', cultureId: 'string', wordId: 'string', conventionId: 'string' };
export const widgetType = (st) => (st.widget.type === 'catalog-picker' ? CATALOG_TYPE[st.widget.catalog] : WIDGET_TYPE[st.widget.type]);

const BAD_ASKS = [/lyric/, /\brecord(ing)?\b/, /upload/, /microphone/, /\bcamera\b/, /e-?mail/, /\bphone\b/, /\baddress\b/, /full name/, /surname/];

function realNames(ctx) {
  const names = new Set();
  for (const f of ctx.films.themes) for (const n of f.composer.split(/\s*(?:&|,|\band\b)\s*/)) if (n.trim().includes(' ')) names.add(n.trim().toLowerCase());
  return [...names];
}

/** Infer each stage's output type (used by the remixer too). */
export function stageTypes(t) {
  const out = {};
  for (const st of t.stages) { const tr = TRANSFORMS[st.transform.id]; if (tr) out[st.id] = tr.output; }
  return out;
}

export function checkTemplate(t, ctx, { schema, run = true } = {}) {
  if (!schema || !schema.$defs) throw new Error('checkTemplate needs { schema } (schema/experiment-template.schema.json)');
  const errs = [];
  const e = (m) => errs.push(`${t && t.id}: ${m}`);
  for (const m of validate(schema, t)) e(m);
  if (errs.length) return errs; // structure first

  // ---- graph ----
  const out = {}, wtypes = {};
  const ids = t.stages.map((s) => s.id);
  const wantA11y = stagesA11y(t.stages);
  if (new Set(wantA11y.map((a) => a.label)).size !== wantA11y.length) e('step labels must be unique');
  if (new Set(ids).size !== ids.length) e('duplicate stage ids');
  for (const st of t.stages) {
    const tr = TRANSFORMS[st.transform.id];
    if (!tr) { e(`${st.id}: unknown transform ${st.transform.id}`); continue; }
    for (const req of Object.keys(tr.args)) if (!(tr.optional || []).includes(req) && !(req in st.transform.args)) e(`${st.id}: missing arg ${req}`);
    for (const [name, ref] of Object.entries(st.transform.args)) {
      if (!(name in tr.args)) { e(`${st.id}: ${st.transform.id} has no arg ${name}`); continue; }
      const want = tr.args[name];
      if (typeof ref === 'string' && ref.startsWith('$')) {
        let got;
        if (ref === '$widget') got = widgetType(st);
        else if (ref === '$options') got = st.widget.options && st.widget.options.length >= 2 ? 'options' : 'missing-options';
        else if (ref.startsWith('$stage.')) got = out[ref.slice(7)];
        else if (ref.startsWith('$widgets.')) got = wtypes[ref.slice(9)];
        else if (ref === '$ctx.catalog') got = 'catalog';
        else if (ref === '$ctx.films') got = 'films';
        if (got !== want) e(`${st.id}.${name}: ${ref} is ${got || 'not earlier/unknown'}, needs ${want}`);
      } else if (!(want in LITERAL)) e(`${st.id}.${name}: literal for non-literal type ${want}`);
      else if (typeof ref !== LITERAL[want]) e(`${st.id}.${name}: literal must be ${LITERAL[want]}`);
    }
    if (st.bonus) {
      const pt = st.transform.args[st.passThrough];
      if (typeof pt !== 'string' || !pt.startsWith('$stage.') || out[pt.slice(7)] !== tr.output) e(`${st.id}: bonus stage must pass through its own output type`);
    }
    if (!VIZ_FOR[tr.output].includes(st.visualization.type)) e(`${st.id}: ${st.visualization.type} cannot show ${tr.output}`);
    if (st.widget.type === 'catalog-picker' && st.widget.catalog === 'cultures' && st.widget.default && !ctx.catalog.cultures.some((c) => c.id === st.widget.default)) e(`${st.id}: unknown culture default`);
    if (st.widget.culture && !ctx.catalog.cultures.some((c) => c.id === st.widget.culture)) e(`${st.id}: unknown culture ${st.widget.culture}`);
    const bpm = st.transform.args.bpm;
    if (typeof bpm === 'number' && (bpm < BPM_MIN || bpm > BPM_MAX)) e(`${st.id}: bpm ${bpm} outside ${BPM_MIN}-${BPM_MAX}`);
    // a11y fields are derived, never hand-edited
    const want = wantA11y[t.stages.indexOf(st)];
    if (!st.a11y || st.a11y.label !== want.label || st.a11y.hint !== want.hint) e(`${st.id}: a11y label/hint out of date`);
    out[st.id] = tr.output;
    wtypes[st.id] = widgetType(st);
  }
  if (out[ids[ids.length - 1]] !== 'sequence') e('must end in a playable sequence');
  if (JSON.stringify(t.a11y) !== JSON.stringify(templateA11y(t))) e('template a11y out of date');

  // ---- variants & interaction ----
  if (t.variant === 'text-only') for (const st of t.stages) if (!TEXT_WIDGETS.includes(st.widget.type)) e(`text-only uses ${st.widget.type}`);
  if (t.variant === 'low-bandwidth') {
    if (JSON.stringify(t).includes('$ctx.')) e('low-bandwidth must not need a catalog download');
    const bytes = new TextEncoder().encode(JSON.stringify(t)).length;
    if (bytes > LOW_BANDWIDTH_MAX_BYTES) e(`low-bandwidth template is ${bytes} bytes`);
  }
  const actors = new Set(t.stages.map((s) => s.actor).filter(Boolean));
  const mode = t.interaction.mode;
  if (mode === 'solo' && actors.size) e('solo template has actors');
  if (mode === 'pair' && !(actors.has('A') && actors.has('B'))) e('pair template needs stages for A and B');
  if (mode === 'group' && !actors.has('group')) e('group template needs a group stage');
  const { min, max } = t.interaction.participants;
  if (min > max || (mode === 'solo' && max !== 1) || (mode === 'pair' && (min !== 2 || max !== 2)) || (mode === 'group' && min < 3)) e('participants do not fit mode');
  if (t.care.sensitive && !t.care.optional) e('sensitive must be optional');

  // ---- safety text ----
  const asked = [t.title, t.question, ...t.stages.flatMap((s) => [s.prompt, ...(s.widget.options || []).map((o) => o.label)])].join(' \n ').toLowerCase();
  for (const re of BAD_ASKS) if (re.test(asked)) e(`asks for something it must not: ${re}`);
  for (const n of realNames(ctx)) if (asked.includes(n)) e(`names a real person: ${n}`);
  for (const st of t.stages) if (['free-text', 'audio', 'file'].includes(st.widget.type)) e(`forbidden widget ${st.widget.type}`);

  if (errs.length || !run) return errs;

  // ---- it actually runs ----
  for (const unlockedStages of [[], ALL_BONUS]) {
    let r;
    try { r = runExperiment(t, t.sample, ctx, { unlockedStages }); } catch (x) { e(`run (${unlockedStages.length ? 'unlocked' : 'locked'}): ${x.message}`); continue; }
    const ev = r.result && r.result.events;
    if (!ev || !ev.length) e('run produced no events');
    else if (!ev.every((x) => Number.isFinite(x.t) && Number.isInteger(x.midi) && x.midi >= 21 && x.midi <= 108 && x.vel > 0 && x.vel <= 1)) e('run produced out-of-range events');
    if (unlockedStages.length && t.stages.some((s) => s.bonus === 're-love') && !r.result.reLove) e('re-love frame missing when unlocked');
    for (const st of t.stages) {
      const hz = flashRateHz(st.visualization.type, r.outputs[st.id]);
      if (hz > MAX_FLASH_HZ) e(`${st.id}: ${st.visualization.type} would flash ${hz.toFixed(2)}/s`);
    }
    if (!r.announcements.length || r.announcements.some((a) => !a.text || a.text.length < 10)) e('missing live-region announcements');
  }
  for (const v of Object.keys(VIZ_A11Y)) if (!VIZ_A11Y[v].reducedMotion) e(`viz ${v} has no reduced-motion fallback`);
  return errs;
}
