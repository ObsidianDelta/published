// unlock.mjs -- the game layer, pure. State is { completed: [templateId] }; everything
// else is derived, so there is nothing to corrupt or migrate.

export function evaluateRule(rule, state, library, progression, _depth = 0) {
  if (_depth > 20) throw new Error('rule nesting too deep (ring cycle?)');
  const done = new Set(state.completed || []);
  const byId = new Map(library.templates.map((t) => [t.id, t]));
  const doneT = [...done].map((id) => byId.get(id)).filter(Boolean);
  const k = Object.keys(rule);
  if (k.length !== 1) throw new Error(`rule must have exactly one key: ${JSON.stringify(rule)}`);
  const [op] = k;
  const v = rule[op];
  switch (op) {
    case 'always': return v === true;
    case 'completed': return done.has(v);
    case 'completedCount': return doneT.length >= v;
    case 'sourceCompleted': return doneT.some((t) => t.source.type === v);
    case 'sourceTypesCompleted': return new Set(doneT.map((t) => t.source.type)).size >= v;
    case 'depthCompleted': return doneT.filter((t) => t.depth >= v.min).length >= v.count;
    case 'ring': {
      const r = progression.rings.find((x) => x.id === v);
      if (!r) throw new Error(`unknown ring ${v}`);
      return evaluateRule(r.rule, state, library, progression, _depth + 1);
    }
    case 'all': return v.every((r) => evaluateRule(r, state, library, progression, _depth + 1));
    case 'any': return v.some((r) => evaluateRule(r, state, library, progression, _depth + 1));
    default: throw new Error(`unknown rule op: ${op}`);
  }
}

/** Ids of every rule reference, for validation. */
export function ruleRefs(rule, acc = { completed: [], sources: [], rings: [] }) {
  const [op] = Object.keys(rule);
  const v = rule[op];
  if (op === 'completed') acc.completed.push(v);
  if (op === 'sourceCompleted') acc.sources.push(v);
  if (op === 'ring') acc.rings.push(v);
  if (op === 'all' || op === 'any') v.forEach((r) => ruleRefs(r, acc));
  return acc;
}

/** Everything the visitor can see right now. */
export function progress(state, library, progression) {
  const done = new Set(state.completed || []);
  const rings = progression.rings.map((r) => ({ id: r.id, name: r.name, open: evaluateRule(r.rule, state, library, progression) }));
  const available = library.templates.filter((t) => evaluateRule(t.unlockRule, state, library, progression)).map((t) => t.id);
  const stages = progression.bonus_stages.filter((s) => evaluateRule(s.rule, state, library, progression)).map((s) => s.id);
  const nextRing = progression.rings.find((r) => !evaluateRule(r.rule, state, library, progression)) || null;
  return {
    completed: [...done],
    rings,
    available,
    fresh: available.filter((id) => !done.has(id)),
    unlockedStages: stages,
    next: nextRing ? { ring: nextRing.id, promise: nextRing.promise } : null,
  };
}

/**
 * Complete one experiment. Returns the new state and what just opened (for the
 * "you unlocked..." moment). Completing a locked experiment is refused.
 */
export function complete(state, templateId, library, progression) {
  const t = library.templates.find((x) => x.id === templateId);
  if (!t) throw new Error(`unknown template ${templateId}`);
  const before = progress(state, library, progression);
  if (!before.available.includes(templateId)) throw new Error(`${templateId} is still locked`);
  if ((state.completed || []).includes(templateId)) return { state, opened: { templates: [], stages: [], rings: [] } };
  const next = { ...state, completed: [...(state.completed || []), templateId] };
  const after = progress(next, library, progression);
  return {
    state: next,
    opened: {
      templates: after.available.filter((id) => !before.available.includes(id)),
      stages: after.unlockedStages.filter((id) => !before.unlockedStages.includes(id)),
      rings: after.rings.filter((r) => r.open && !before.rings.find((b) => b.id === r.id).open).map((r) => r.id),
    },
  };
}
