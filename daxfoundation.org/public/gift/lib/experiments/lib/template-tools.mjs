// lib/template-tools.mjs -- shared by the library builder and the remixer: samples,
// derived fields (letters, summary, a11y). Pure given its inputs.

import { stagesA11y, templateA11y } from '../a11y/spec.mjs';

export const AGE_BANDS = ['13-17', '18-29', '30-49', '50-64', '65+'];
export const AGES = { all: AGE_BANDS, teen: ['13-17', '18-29'], young: ['18-29', '30-49'], mid: ['30-49', '50-64'], elder: ['50-64', '65+'] };
// Widgets usable with no pointer precision, no timing and no colour vision (text-only variant).
export const TEXT_WIDGETS = ['none', 'tap-choice', 'multi-choice', 'tense-picker', 'catalog-picker', 'slider-set'];
// Low-bandwidth: the template alone is enough (no catalog download), and it is small.
export const LOW_BANDWIDTH_MAX_BYTES = 9000;

/** Widget values that exercise the whole pipeline. */
export function sampleFor(stages, ctx) {
  const s = {};
  let culture = null;
  for (const st of stages) {
    const w = st.widget;
    if (w.type === 'tap-choice') s[st.id] = w.options[0].id;
    else if (w.type === 'multi-choice') s[st.id] = w.options.slice(0, 2).map((x) => x.id);
    else if (w.type === 'color-picker') s[st.id] = '#e11d48';
    else if (w.type === 'tap-tempo') s[st.id] = [0, 820, 1640, 2460, 3280];
    else if (w.type === 'tense-picker') s[st.id] = 'was';
    else if (w.type === 'slider-set') s[st.id] = { tenderness: 0.5 };
    else if (w.type === 'catalog-picker' && w.catalog === 'films') s[st.id] = w.default || (st.id.endsWith('2') ? 'ghost-unchained' : 'titanic-heart');
    else if (w.type === 'catalog-picker' && w.catalog === 'cultures') {
      const ok = ctx.catalog.cultures.filter((c) =>
        w.filter === 'hasScale' ? c.harmony.some((h) => ['scale', 'mode'].includes(h.kind) && h.intervals)
          : w.filter === 'hasProgression' ? c.harmony.some((h) => ['progression', 'cadence'].includes(h.kind) && h.progression)
            : c.vocab.length > 0);
      const pick = (w.default && ok.find((c) => c.id === w.default)) || ok[(st.id.endsWith('2') || st.id === 'second') ? Math.min(1, ok.length - 1) : 0];
      s[st.id] = pick.id;
      culture = pick;
    } else if (w.type === 'catalog-picker' && w.catalog === 'vocab') {
      const c = w.culture ? ctx.catalog.cultures.find((x) => x.id === w.culture) : culture;
      s[st.id] = w.default || c.vocab[c.vocab.length - 1].id;
    }
  }
  return s;
}

export function deriveLetters(t) {
  const tally = {};
  for (const st of t.stages) for (const o of st.widget.options || []) o.letters.forEach((l, i) => { tally[l] = (tally[l] || 0) + (3 - Math.min(i, 2)); });
  const out = Object.entries(tally).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 3).map(([l]) => l);
  if (out.length) return out;
  return t.source.type.startsWith('culture') || t.source.type === 'love-words' ? ['discovery', 'love'] : ['love'];
}

export function summarize(t) {
  return `${t.source.label}: ${t.stages.filter((s) => !s.bonus).map((s) => s.transform.id).join(' -> ')}.`;
}

/** Fill every derived field. Returns a new object; keeps sample values that still apply. */
export function finalizeTemplate(t, ctx, { letters = null, summary = null } = {}) {
  const labels = stagesA11y(t.stages);
  const stages = t.stages.map((s, i) => ({ ...s, a11y: labels[i] }));
  const out = { ...t, stages };
  out.letters = letters || (t.letters && t.letters.length ? t.letters : deriveLetters(out));
  out.summary = summary || t.summary || summarize(out);
  out.a11y = templateA11y(out);
  const fresh = sampleFor(stages, ctx);
  const keep = Object.fromEntries(Object.entries(t.sample || {}).filter(([k]) => stages.some((s) => s.id === k)));
  out.sample = { ...fresh, ...keep };
  return out;
}
