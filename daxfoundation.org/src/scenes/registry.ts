// Scene registry for the DAX Foundation explainer (Explainer Kit v1).
// EXP-4b owns this file; it is generic and never edited when a new scene folder appears.
// It names no scene: every folder under src/scenes/ with an index.ts and a fallback.ts is
// picked up automatically by Vite's import.meta.glob. See contract.ts for the module shape.

/** Lazy importers for every scene's full module, keyed by "./<name>/index.ts". */
export const scenes = import.meta.glob("./*/index.ts");

/** Lazy importers for every scene's 2D fallback, keyed by "./<name>/fallback.ts". */
export const fallbacks = import.meta.glob("./*/fallback.ts");

/** A resolver pair for one scene: `load` imports the full module, `loadFallback` the 2D one. */
export interface Resolved {
  load: () => Promise<unknown>;
  loadFallback: () => Promise<unknown>;
}

const folderOf = (key: string): string =>
  key.replace(/^\.\//, "").replace(/\/(index|fallback)\.ts$/, "");

/** Map a folder name to its glob importer entry, for both maps. */
function byFolder(map: Record<string, () => Promise<unknown>>): Record<string, () => Promise<unknown>> {
  const out: Record<string, () => Promise<unknown>> = {};
  for (const key of Object.keys(map)) out[folderOf(key)] = map[key];
  return out;
}

const sceneByName = byFolder(scenes as Record<string, () => Promise<unknown>>);
const fallbackByName = byFolder(fallbacks as Record<string, () => Promise<unknown>>);

/**
 * Resolve a scene by its folder name (the chapter's `scene.module`).
 * Returns { load, loadFallback }; either importer rejects if that file is absent.
 */
export function resolve(name: string): Resolved {
  const miss = (what: string) => () =>
    Promise.reject(new Error(`scene "${name}": no ${what}`));
  return {
    load: sceneByName[name] ?? miss("index.ts"),
    loadFallback: fallbackByName[name] ?? miss("fallback.ts"),
  };
}

/** The folder names that have a full index.ts, sorted. */
export function list(): string[] {
  return Object.keys(sceneByName).sort();
}
