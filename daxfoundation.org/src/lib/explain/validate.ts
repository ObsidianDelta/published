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
