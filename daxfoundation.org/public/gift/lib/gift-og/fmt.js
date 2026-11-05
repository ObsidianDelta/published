// Counts in the reader's language: CLDR plural category + native digits.
// Locale files carry `plurals[key][category]` and `_meta.digits` (e.g. "arab"
// for Arabic-Indic ٠١٢٣, "beng" for Bengali ০১২৩, "latn" elsewhere).

const pr = new Map();
const nf = new Map();

export function formatNumber(n, lang, digits = 'latn') {
  const key = `${lang}-${digits}`;
  if (!nf.has(key)) nf.set(key, new Intl.NumberFormat(`${lang}-u-nu-${digits}`, { useGrouping: true }));
  return nf.get(key).format(n);
}

export function pluralCategory(n, lang) {
  if (!pr.has(lang)) pr.set(lang, new Intl.PluralRules(lang));
  return pr.get(lang).select(n);
}

/**
 * Pick the plural form of `key` for n and substitute {n}.
 * Falls back to the base string (the "other" form) when no plurals exist.
 * @param L     locale bundle (meta.lang, meta.digits, plurals, + strings)
 * @param key   e.g. "card.chain"
 * @param base  the base string (already looked up by the caller)
 */
export function plural(L, key, n, base) {
  const forms = L.plurals?.[key];
  const lang = L.meta.lang;
  const cat = pluralCategory(n, lang);
  const tpl = (forms && (forms[cat] ?? forms.other)) || base;
  return tpl.replace('{n}', formatNumber(n, lang, L.meta.digits || 'latn'));
}
