// This-device storage. Every key is prefixed gift_v1_ so "Start over" can erase exactly what the
// studio kept and nothing else. Every read is validated; storage may be missing or throw.

import { normalizeExperiment } from './experiment.js';
import { normalizeProgress, emptyProgress } from './progress.js';

export const PREFIX = 'gift_v1_';
export const MAX_LIB = 200;

const safe = (fn, dflt) => { try { return fn(); } catch { return dflt; } };

export function makeStore(storage) {
  const get = (k) => safe(() => storage && storage.getItem(PREFIX + k), null);
  const set = (k, v) => safe(() => { storage && storage.setItem(PREFIX + k, v); return true; }, false);
  const json = (k, d) => { const s = get(k); if (!s) return d; return safe(() => JSON.parse(s), d); };

  function libList(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    for (const e of raw.slice(0, MAX_LIB)) {
      if (!e || typeof e.id !== 'string' || !/^[0-9a-f]{12}$/.test(e.id)) continue;
      const at = typeof e.at === 'string' ? e.at.slice(0, 32) : '';
      const remote = typeof e.remote === 'string' && /^[A-Za-z0-9_-]{4,64}$/.test(e.remote) ? e.remote : undefined;
      if (e.tpl && typeof e.tpl === 'object' && e.tpl.v === 1 && typeof e.tpl.t === 'string') { out.push({ id: e.id, tpl: e.tpl, at, remote }); continue; } // re-validated against the library by the app
      const exp = normalizeExperiment(e.exp);
      if (exp) out.push({ id: e.id, exp, at, remote });
    }
    return out;
  }

  return {
    age() { const a = get('age'); return a === 'yes' || a === 'skip' ? a : null; },
    setAge(a) { return set('age', a); },
    lang() { return get('lang'); },
    setLang(l) { return set('lang', l); },
    library() { const l = json('lib', {}); return { mine: libList(l.mine), shared: libList(l.shared) }; },
    setLibrary(lib) { return set('lib', JSON.stringify({ mine: lib.mine.slice(0, MAX_LIB), shared: lib.shared.slice(0, MAX_LIB) })); },
    /** the experiment library's game state (state/gift/experiments/progression): completed template ids. */
    templatesDone() { const l = json('tpl_done', []); return Array.isArray(l) ? [...new Set(l.filter((x) => typeof x === 'string' && x.length < 80))].slice(0, 500) : []; },
    setTemplatesDone(list) { return set('tpl_done', JSON.stringify(list)); },
    progress() { return normalizeProgress(json('progress', emptyProgress())); },
    setProgress(p) { return set('progress', JSON.stringify(p)); },
    clearAll() {
      return safe(() => {
        const keys = [];
        for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k && k.startsWith(PREFIX)) keys.push(k); }
        keys.forEach((k) => storage.removeItem(k));
        return keys.length;
      }, 0);
    },
  };
}

/** put an entry first in a list, replacing any older copy with the same id. */
export function upsert(list, entry) {
  return [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, MAX_LIB);
}
