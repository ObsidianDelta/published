// runner.mjs -- executes one experiment template as a pure pipeline.
//   runExperiment(template, widgetValues, ctx, { unlockedStages })
// widgetValues: { [stageId]: value } (missing -> the stage's widget.default)
// ctx: { catalog, films } loaded by the studio from state/gift/catalog/*.json
// Arg references inside stage.transform.args:
//   "$widget"        this stage's widget value
//   "$options"       this stage's widget.options
//   "$stage.<id>"    output of an earlier stage
//   "$widgets.<id>"  the widget value of an earlier stage (e.g. the culture picked in s1)
//   "$ctx.<name>"    shared data (catalog, films)
// Anything else is a literal. Bonus stages (stage.bonus = an unlockable stage id) run
// only when unlocked; otherwise their output is the arg named by stage.passThrough.
// Accessibility: the result carries `alternatives` (the text alternative of every stage
// output -- what a screen reader hears, and the whole UI in text-only mode) and
// `announcements` (polite live-region messages, one per stage that actually ran, numbered
// over the steps that ran, so locked bonus stages never create gaps).

import { runTransform, TRANSFORMS } from './transforms/index.mjs';
import { describe, announcement } from './a11y/spec.mjs';

export function resolveArg(ref, { stage, widget, outputs, ctx, widgets = {} }) {
  if (typeof ref !== 'string' || !ref.startsWith('$')) return ref;
  if (ref === '$widget') return widget;
  if (ref === '$options') return stage.widget.options;
  if (ref.startsWith('$stage.')) {
    const id = ref.slice(7);
    if (!(id in outputs)) throw new Error(`stage ${stage.id}: ${ref} not yet computed`);
    return outputs[id];
  }
  if (ref.startsWith('$widgets.')) {
    const id = ref.slice(9);
    if (!(id in widgets)) throw new Error(`stage ${stage.id}: ${ref} not yet answered`);
    return widgets[id];
  }
  if (ref.startsWith('$ctx.')) {
    const v = ctx[ref.slice(5)];
    if (v === undefined) throw new Error(`stage ${stage.id}: missing context ${ref}`);
    return v;
  }
  throw new Error(`stage ${stage.id}: bad reference ${ref}`);
}

export function runExperiment(template, widgetValues = {}, ctx = {}, { unlockedStages = [] } = {}) {
  const outputs = {};
  const widgets = {};
  const trace = [];
  const alternatives = {};
  const announcements = [];
  const willRun = template.stages.filter((s) => !s.bonus || unlockedStages.includes(s.bonus)).length;
  for (const stage of template.stages) {
    const widget = stage.id in widgetValues ? widgetValues[stage.id] : stage.widget.default ?? null;
    const env = { stage, widget, outputs, ctx, widgets };
    const args = Object.fromEntries(Object.entries(stage.transform.args).map(([k, v]) => [k, resolveArg(v, env)]));
    widgets[stage.id] = widget;
    if (stage.bonus && !unlockedStages.includes(stage.bonus)) {
      outputs[stage.id] = args[stage.passThrough];
      trace.push({ stage: stage.id, skipped: true });
      continue;
    }
    outputs[stage.id] = runTransform(stage.transform.id, args);
    const type = TRANSFORMS[stage.transform.id].output;
    alternatives[stage.id] = describe(type, outputs[stage.id]);
    announcements.push({ stage: stage.id, ...announcement(stage, type, outputs[stage.id], announcements.length, willRun) });
    trace.push({ stage: stage.id, transform: stage.transform.id, visualization: stage.visualization.type });
  }
  const last = template.stages[template.stages.length - 1].id;
  return { result: outputs[last], outputs, widgets, trace, alternatives, announcements };
}
