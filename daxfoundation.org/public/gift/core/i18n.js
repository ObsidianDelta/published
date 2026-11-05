// i18n: the studio loads its strings from state/gift/i18n (synced to ./i18n by
// scripts/gift/sync-vendor.mjs). Two layers, both JSON:
//   i18n/locales/<code>.json  the shared gift tables (gift 3/4): age gate, consent, share copy,
//                             letters, tenses, card text. 17 languages. Same key set in each.
//   i18n/studio/<code>.json   studio-only UI strings (stages, templates, notebook). Where a
//                             language has no studio table yet, studio strings fall back to English.
// Lookup per key: shared[lang] -> studio[lang] -> studio[en] -> shared[en] -> the key itself.
// Direction (RTL) comes from each shared table's _meta. Counts ({n}) use the shared table's CLDR
// plural forms and native digits (_meta.digits) through gift-og's own fmt.js (lib/gift-og/).
import { plural } from '../lib/gift-og/fmt.js';

/** the 17 languages of the shared tables, in gift-og's order (cloudflare/workers/gift-og/src/state.js). */
export const LANGS = Object.freeze([
  { code: 'en', name: 'English', dir: 'ltr' }, { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' }, { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' }, { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', dir: 'ltr' }, { code: 'zh', name: '简体中文', dir: 'ltr' },
  { code: 'ja', name: '日本語', dir: 'ltr' }, { code: 'ko', name: '한국어', dir: 'ltr' },
  { code: 'sw', name: 'Kiswahili', dir: 'ltr' }, { code: 'yo', name: 'Yorùbá', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', dir: 'ltr' }, { code: 'ru', name: 'Русский', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' }, { code: 'id', name: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
]);
export const LANG_CODES = Object.freeze(LANGS.map((l) => l.code));
export const DEFAULT_LANG = 'en';
/** languages that have a studio table: all 17 (state/gift/i18n/studio, gift 3/4). */
export const STUDIO_LANGS = LANG_CODES;

/** studio keys that the shared tables own (studio key -> path in locales/<code>.json). */
export const SHARED_KEYS = Object.freeze({
  'age.q': 'ui.age_q', 'age.yes': 'ui.age_yes', 'age.skip': 'ui.age_skip',
  'app.framing': 'ui.framing', 'app.credits': 'ui.sound_credit',
  'nav.breath': 'ui.take_breath', 'nav.knows': 'ui.data_panel', 'knows.title': 'ui.data_panel', 'nav.lang': 'ui.language',
  'breath.s': 'ui.breath_body', 'btn.copy': 'ui.copy_link', 'btn.copied': 'ui.copied', 'btn.image': 'ui.save_image',
  'btn.makemine': 'ui.make_mine', 'share.lead': 'ui.share_it', 'research.yes': 'ui.consent_yes', 'research.no': 'ui.consent_no',
  'share.title': 'share.og_title', 'shared.from': 'ui.received_banner', 'shared.chain': 'ui.received_chain',
  'share.hint': 'ui.share_hint', 'share.default': 'share.default', 'card.alt': 'card.alt', 'card.head_mine': 'card.head_mine',
  'tense.was': 'tense.was', 'tense.is': 'tense.is', 'tense.will': 'tense.will',
});

const own = (obj, k) => (obj && Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : undefined); // studio keys are flat ('nav.home')
const at = (obj, path) => path.split('.').reduce((o, k) => (o && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined), obj);

/** the shared-table path for a studio key, or null. Letters map to letters.<id>. */
export function sharedPath(key) {
  if (SHARED_KEYS[key]) return SHARED_KEYS[key];
  if (key.startsWith('letter.')) return 'letters.' + key.slice(7);
  return null;
}

/** pick a language: saved choice, then the browser's list, then English. */
export function pickLang(saved, browserLangs = []) {
  if (saved && LANG_CODES.includes(saved)) return saved;
  for (const l of browserLangs || []) {
    const base = String(l).toLowerCase().split('-')[0];
    if (LANG_CODES.includes(base)) return base;
  }
  return DEFAULT_LANG;
}

export const dirOf = (lang, tables) => (tables && tables.shared && tables.shared[lang] && tables.shared[lang]._meta && tables.shared[lang]._meta.dir) || (LANGS.find((l) => l.code === lang) || {}).dir || 'ltr';

/** tables = { shared: {en, [lang]}, studio: {en, [lang]} } */
export function makeTranslator(lang, tables) {
  const sh = tables.shared || {}, st = tables.studio || {};
  const chain = (key) => {
    const p = sharedPath(key);
    const cands = p
      ? [at(sh[lang], p), own(st[lang], key), own(st.en, key), at(sh.en, p)]
      : [own(st[lang], key), own(st.en, key)];
    return cands.find((v) => typeof v === 'string');
  };
  return function t(key, vars) {
    let s = chain(key);
    if (s === undefined) return key;
    // A shared string with plural forms ({n} counts): pick the CLDR form and native digits.
    const p = sharedPath(key);
    if (p && vars && vars.n !== undefined && Number.isFinite(Number(vars.n))) {
      const src = at(sh[lang], p) === s ? sh[lang] : at(sh.en, p) === s ? sh.en : null;
      const code = src === sh[lang] ? lang : 'en';
      if (src && src.plurals && src.plurals[p]) {
        s = plural({ meta: { lang: code, digits: (src._meta && src._meta.digits) || 'latn' }, plurals: src.plurals }, p, Number(vars.n), s);
      }
    }
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined ? m : String(vars[k])));
    return s;
  };
}

/** does this language's copy still need a native speaker's review? */
export function needsReview(lang, tables) {
  const m = tables.shared && tables.shared[lang] && tables.shared[lang]._meta;
  const s = tables.studio && tables.studio[lang] && tables.studio[lang]._meta;
  return !!((m && m.needs_native_review) || (s && s.needs_native_review) || (lang !== 'en' && !STUDIO_LANGS.includes(lang)));
}

/** load the four tables a language needs. loadJSON(relativePath) -> object (throws on failure). */
export async function loadTables(lang, loadJSON) {
  const get = (p) => loadJSON(p).catch(() => ({}));
  const codes = [...new Set(['en', lang])];
  const shared = {}, studio = {};
  await Promise.all(codes.flatMap((c) => [
    get(`i18n/locales/${c}.json`).then((j) => { shared[c] = j; }),
    STUDIO_LANGS.includes(c) ? get(`i18n/studio/${c}.json`).then((j) => { studio[c] = j; }) : null,
  ]));
  return { shared, studio };
}
