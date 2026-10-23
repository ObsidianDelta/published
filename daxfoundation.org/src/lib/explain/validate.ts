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
// sampler. The rule itself lives in check-edition.mjs (one source of truth, so
// the build and the node --test suite share it); a forbidden string is ALWAYS an
// error, every other failure is a warning under STRICT.
// @ts-ignore -- plain .mjs sibling, no .d.ts; the shape is simple and stable.
import { checkEdition, canonCheck } from './check-edition.mjs';

export interface EditionCheck {
  ok: boolean;
  why?: string;
  forbidden?: boolean;
}

export { checkEdition };

/**
 * Run checkEdition on every edition of every chapter at build time. A forbidden
 * string throws (hard gate, always). Any other failure warns when STRICT is off.
 */
export function validateEditions(
  entries: { id?: string; data?: { editions?: Record<string, unknown>; canon?: string[] } }[],
): void {
  for (const entry of entries) {
    const editions = entry.data?.editions;
    if (!editions) continue;
    const canon = entry.data?.canon;
    for (const [lens, ed] of Object.entries(editions)) {
      const r = checkEdition(ed);
      const where = `${entry.id ?? '?'} · ${lens}`;
      if (!r.ok) {
        if (r.forbidden) {
          throw new Error(`[explain] forbidden string in edition ${where}: ${r.why}`);
        }
        if (STRICT) {
          throw new Error(`[explain] edition ${where} failed checks: ${r.why}`);
        }
        console.warn(`[explain] edition ${where} incomplete: ${r.why}`);
      }
      // Soft canon check: warn (never throw) when an edition holds none of the
      // chapter's canon key nouns.
      if (canon && canon.length) {
        const c = canonCheck(ed, canon);
        if (!c.ok) {
          console.warn(`[explain] edition ${where} holds no canon key noun`);
        }
      }
    }
  }
}
