// The edition checks, ported verbatim from the approved sampler
// (state/daxfoundation/explain-sampler/attention.html): same caps, same
// forbidden list. Kept as plain .mjs so the build (via validate.ts) and the
// node --test suite share ONE source of truth for the rule.
//
// A forbidden string is always an error (reported with `forbidden: true`); every
// other failure is a plain miss the caller may downgrade to a warning.

export const CAPS = { answer: 480, more: 1200, how: 1200, proof_intro: 460, under: 800 };
export const STEPS = ['more', 'how', 'proof', 'under'];
export const LABEL_KEYS = [
  'learner', 'guide', 'classroom', 'invert', 'both', 'change', 'decide',
  'record', 'packages', 'built', 'boundary', 'tapChild', 'dragGuide',
];
export const FORBIDDEN = [
  /non-?profits?/i, /\bcharit(y|ies|able)\b/i, /\bincorporated\b/i, /registered foundation/i,
  /manual cognitive/i, /and his cognitive companion/i, /life'?s work/i,
  /chat ?gpt/i, /open ?ai/i, /anthropic/i, /\bclaude\b/i, /\bgemini\b/i, /copilot/i,
  /\bmicrosoft\b/i, /\bgoogle\b/i, /\bmeta ai\b/i, /\bllama\b/i, /mistral/i, /deepseek/i,
  /\bgrok\b/i, /\bgpt\b/i,
];

export function checkEdition(ed) {
  if (!ed || typeof ed !== 'object') return { ok: false, why: 'not an object' };
  const strs = ['voice', 'answer', 'more', 'how', 'proof_intro', 'under'];
  for (const k of strs) {
    if (typeof ed[k] !== 'string' || !ed[k].trim()) return { ok: false, why: 'missing ' + k };
  }
  for (const k in CAPS) {
    if (ed[k].length > CAPS[k] * 1.25) return { ok: false, why: k + ' too long' };
  }
  if (!ed.buttons || typeof ed.buttons !== 'object') return { ok: false, why: 'missing buttons' };
  for (const k of STEPS) {
    const b = ed.buttons[k];
    if (typeof b !== 'string' || !b.trim() || b.length > 48) return { ok: false, why: 'button ' + k };
  }
  if (!ed.labels || typeof ed.labels !== 'object') return { ok: false, why: 'missing labels' };
  const L = ed.labels;
  for (const k of LABEL_KEYS) {
    if (typeof L[k] !== 'string' || !L[k].trim() || L[k].length > 60) return { ok: false, why: 'label ' + k };
  }
  if (!Array.isArray(L.roles) || L.roles.length < 4 || !L.roles.every((s) => typeof s === 'string' && s.length <= 40)) {
    return { ok: false, why: 'roles' };
  }
  if (!Array.isArray(L.contexts) || L.contexts.length < 2 || !L.contexts.every((s) => typeof s === 'string' && s.length <= 40)) {
    return { ok: false, why: 'contexts' };
  }
  const all = JSON.stringify(ed);
  for (const re of FORBIDDEN) {
    if (re.test(all)) return { ok: false, why: 'forbidden: ' + re.source, forbidden: true };
  }
  return { ok: true };
}
