import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scenesDir = join(__dirname, '../../scenes');

const EXEMPT = new Set(['video', 'chairs']);
export const STRICT = false;

export function validateScenes(entries: { data: { scene?: { module?: string } } }[]) {
  const missing: string[] = [];
  for (const entry of entries) {
    const module = entry.data?.scene?.module;
    if (!module || EXEMPT.has(module)) continue;
    const idx = join(scenesDir, module, 'index.ts');
    const fb = join(scenesDir, module, 'fallback.ts');
    if (!existsSync(idx) || !existsSync(fb)) {
      missing.push(module);
    }
  }
  if (missing.length > 0) {
    console.warn(`[explain] Missing scene modules (wave ahead): ${[...new Set(missing)].join(', ')}`);
  }
}

// ---- Edition checks: the same rules for every edition, ported from the approved
// sampler (state/daxfoundation/explain-sampler/attention.html). Same caps, same
// forbidden list. A forbidden string is ALWAYS an error (checkEdition reports it
// with `forbidden: true`); every other failure is a warning under STRICT.
const CAPS: Record<string, number> = {
  answer: 480,
  more: 1200,
  how: 1200,
  proof_intro: 460,
  under: 800,
};
const STEPS = ['more', 'how', 'proof', 'under'] as const;
const LABEL_KEYS = [
  'learner', 'guide', 'classroom', 'invert', 'both', 'change', 'decide',
  'record', 'packages', 'built', 'boundary', 'tapChild', 'dragGuide',
] as const;
const FORBIDDEN: RegExp[] = [
  /non-?profits?/i, /\bcharit(y|ies|able)\b/i, /\bincorporated\b/i, /registered foundation/i,
  /manual cognitive/i, /and his cognitive companion/i, /life'?s work/i,
  /chat ?gpt/i, /open ?ai/i, /anthropic/i, /\bclaude\b/i, /\bgemini\b/i, /copilot/i,
  /\bmicrosoft\b/i, /\bgoogle\b/i, /\bmeta ai\b/i, /\bllama\b/i, /mistral/i, /deepseek/i,
  /\bgrok\b/i, /\bgpt\b/i,
];

export interface EditionCheck {
  ok: boolean;
  why?: string;
  forbidden?: boolean;
}

/** Validate one edition. Mirrors the sampler's checkEdition() exactly. */
export function checkEdition(ed: unknown): EditionCheck {
  if (!ed || typeof ed !== 'object') return { ok: false, why: 'not an object' };
  const e = ed as Record<string, unknown>;
  const strs = ['voice', 'answer', 'more', 'how', 'proof_intro', 'under'];
  for (const k of strs) {
    if (typeof e[k] !== 'string' || !(e[k] as string).trim()) return { ok: false, why: 'missing ' + k };
  }
  for (const k in CAPS) {
    if ((e[k] as string).length > CAPS[k] * 1.25) return { ok: false, why: k + ' too long' };
  }
  const buttons = e.buttons as Record<string, unknown> | undefined;
  if (!buttons || typeof buttons !== 'object') return { ok: false, why: 'missing buttons' };
  for (const k of STEPS) {
    const b = buttons[k];
    if (typeof b !== 'string' || !b.trim() || b.length > 48) return { ok: false, why: 'button ' + k };
  }
  const L = e.labels as Record<string, unknown> | undefined;
  if (!L || typeof L !== 'object') return { ok: false, why: 'missing labels' };
  for (const k of LABEL_KEYS) {
    const v = L[k];
    if (typeof v !== 'string' || !v.trim() || v.length > 60) return { ok: false, why: 'label ' + k };
  }
  const roles = L.roles;
  if (!Array.isArray(roles) || roles.length < 4 || !roles.every((s) => typeof s === 'string' && s.length <= 40)) {
    return { ok: false, why: 'roles' };
  }
  const contexts = L.contexts;
  if (!Array.isArray(contexts) || contexts.length < 2 || !contexts.every((s) => typeof s === 'string' && s.length <= 40)) {
    return { ok: false, why: 'contexts' };
  }
  const all = JSON.stringify(e);
  for (const re of FORBIDDEN) {
    if (re.test(all)) return { ok: false, why: 'forbidden: ' + re.source, forbidden: true };
  }
  return { ok: true };
}

/**
 * Run checkEdition on every edition of every chapter at build time. A forbidden
 * string throws (hard gate, always). Any other failure warns when STRICT is off.
 */
export function validateEditions(
  entries: { id?: string; data?: { editions?: Record<string, unknown> } }[],
): void {
  for (const entry of entries) {
    const editions = entry.data?.editions;
    if (!editions) continue;
    for (const [lens, ed] of Object.entries(editions)) {
      const r = checkEdition(ed);
      if (r.ok) continue;
      const where = `${entry.id ?? '?'} · ${lens}`;
      if (r.forbidden) {
        throw new Error(`[explain] forbidden string in edition ${where}: ${r.why}`);
      }
      if (STRICT) {
        throw new Error(`[explain] edition ${where} failed checks: ${r.why}`);
      }
      console.warn(`[explain] edition ${where} incomplete: ${r.why}`);
    }
  }
}
