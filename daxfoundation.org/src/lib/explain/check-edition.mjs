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
  // voice/answer/more are always required; how/proof_intro/under MAY be the empty
  // string (the kid lens omits them, EXP-11) -- they must still be strings.
  const required = ['voice', 'answer', 'more'];
  for (const k of required) {
    if (typeof ed[k] !== 'string' || !ed[k].trim()) return { ok: false, why: 'missing ' + k };
  }
  const optional = ['how', 'proof_intro', 'under'];
  for (const k of optional) {
    if (typeof ed[k] !== 'string') return { ok: false, why: 'missing ' + k };
  }
  for (const k in CAPS) {
    if (typeof ed[k] === 'string' && ed[k].length > CAPS[k] * 1.25) return { ok: false, why: k + ' too long' };
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
  // `papers` (the researcher's sixth step) is optional; when present it is an
  // array of { href, text, src } strings.
  if (ed.papers !== undefined) {
    if (!Array.isArray(ed.papers) || ed.papers.length < 1) return { ok: false, why: 'papers' };
    for (const p of ed.papers) {
      if (!p || typeof p.href !== 'string' || typeof p.text !== 'string' || typeof p.src !== 'string') {
        return { ok: false, why: 'papers' };
      }
    }
  }
  const all = JSON.stringify(ed);
  for (const re of FORBIDDEN) {
    if (re.test(all)) return { ok: false, why: 'forbidden: ' + re.source, forbidden: true };
  }
  return { ok: true };
}

// The soft canon check. A chapter's `canon` is the facts every edition must hold.
// We derive key nouns from the canon (content words, length >= 5) and warn when an
// edition's prose contains NONE of them -- a smell that the edition drifted off the
// canon. Soft by design: it returns a list of key nouns missed, never throws.
const CANON_STOP = new Set([
  'about', 'after', 'again', 'against', 'almost', 'already', 'always', 'because',
  'been', 'being', 'between', 'could', 'every', 'everything', 'first', 'from',
  'have', 'having', 'into', 'its', 'itself', 'made', 'make', 'more', 'most',
  'must', 'never', 'other', 'over', 'particular', 'rest', 'said', 'says', 'since',
  'some', 'something', 'start', 'still', 'than', 'that', 'their', 'them', 'then',
  'there', 'these', 'they', 'thing', 'things', 'this', 'those', 'through', 'under',
  'until', 'what', 'when', 'where', 'which', 'while', 'whole', 'with', 'would',
  'your', 'yourself', 'done', 'does', 'each', 'once', 'only', 'much', 'such',
]);

export function canonKeyNouns(canon) {
  const words = new Set();
  for (const line of canon || []) {
    for (const raw of String(line).toLowerCase().split(/[^a-z']+/)) {
      const w = raw.replace(/'s$/, '');
      if (w.length >= 5 && !CANON_STOP.has(w)) words.add(w);
    }
  }
  return [...words];
}

export function editionProse(ed) {
  return [ed.answer, ed.more, ed.how, ed.proof_intro, ed.under]
    .filter((s) => typeof s === 'string')
    .join(' ')
    .toLowerCase();
}

// Returns { ok, hits } -- ok is false when the edition holds none of the canon's
// key nouns. Never throws; the caller logs a warning.
export function canonCheck(ed, canon) {
  const nouns = canonKeyNouns(canon);
  if (nouns.length === 0) return { ok: true, hits: [] };
  const prose = editionProse(ed);
  const hits = nouns.filter((n) => prose.includes(n));
  return { ok: hits.length > 0, hits };
}
