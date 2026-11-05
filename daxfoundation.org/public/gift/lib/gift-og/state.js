// Share-state v1: decode, validate (allowlist only), canonicalise.
//
// The share URL carries ONLY enumerated choices. There is no free-text field,
// so nothing a person typed (name, message, place) can ever reach this worker,
// its cache keys, or a rendered image. Unknown keys are dropped; invalid values
// are dropped. Contract: state/gift/viral/SHARE-STATE.md.

export const LANGS = [
  'en', 'fr', 'es', 'pt', 'ar', 'hi', 'bn', 'zh', 'ja', 'ko',
  'sw', 'yo', 'ta', 'ru', 'de', 'id', 'tr',
];

export const FEELINGS = ['warm', 'quiet', 'longing', 'joyful', 'tender', 'lost'];

// The 15 letters of LOVE-VOCAB-v0 plus the pinned word re-love (D -> G).
export const LETTERS = [
  'love', 'tenderness', 'togetherness', 'trust', 'curiosity', 'adventure',
  'creativity', 'discovery', 'joy', 'hope', 'birth', 'awe', 'gratitude',
  'longing', 'doubt', 're_love',
];

export const TENSES = ['was', 'is', 'will'];
export const WHENS = ['today', 'week', 'ago', 'unsure'];
export const TOWARDS = ['person', 'place', 'idea', 'feeling'];

// mine   = "this is what my love sounds like"
// gift   = "I made this sound for you"
// answer = reply to someone's sound (carries p = their letter)
// circle = a group's combined chord (carries n = number of voices)
export const KINDS = ['mine', 'gift', 'answer', 'circle'];

// Stage-1 feeling tiles map onto letters for sound + visual. Provisional,
// mirrors state/gift/viral/SHARE-STATE.md; change both together.
export const FEELING_TO_LETTER = {
  warm: 'love',
  quiet: 'trust',
  longing: 'longing',
  joyful: 'joy',
  tender: 'tenderness',
  lost: 'doubt',
};

const CULTURE_RE = /^[a-z0-9]{1,12}(?:-[a-z0-9]{1,12}){0,5}$/;
const MAX_RAW = 512;

function b64urlDecode(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const bin = atob(b64 + pad);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function b64urlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const pick = (v, list) => (typeof v === 'string' && list.includes(v) ? v : undefined);
const int = (v, lo, hi) => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && /^\d{1,3}$/.test(v) ? Number(v) : NaN;
  return Number.isInteger(n) && n >= lo && n <= hi ? n : undefined;
};

/** Validate an already-parsed object. Returns a clean state (never throws). */
export function sanitize(obj) {
  const o = obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
  const st = {
    v: 1,
    k: pick(o.k, KINDS) || 'mine',
    f: pick(o.f, FEELINGS),
    l: pick(o.l, LETTERS),
    t: pick(o.t, TENSES),
    w: pick(o.w, WHENS),
    o: pick(o.o, TOWARDS),
    c: typeof o.c === 'string' && o.c.length <= 64 && CULTURE_RE.test(o.c) ? o.c : undefined,
    lang: pick(o.lang, LANGS),
    g: int(o.g, 0, 99),
    p: pick(o.p, LETTERS),
    n: int(o.n, 2, 999),
  };
  if (st.k !== 'answer') delete st.p;
  if (st.k !== 'circle') delete st.n;
  for (const key of Object.keys(st)) if (st[key] === undefined) delete st[key];
  return st;
}

/** Decode the `s` query param. Bad input yields the empty default state. */
export function decodeState(raw) {
  if (typeof raw !== 'string' || !raw || raw.length > MAX_RAW || !/^[A-Za-z0-9_-]+$/.test(raw)) {
    return sanitize({});
  }
  try {
    return sanitize(JSON.parse(b64urlDecode(raw)));
  } catch {
    return sanitize({});
  }
}

const ORDER = ['v', 'k', 'f', 'l', 't', 'w', 'o', 'c', 'lang', 'g', 'p', 'n'];

/** Stable encoding: same choices -> same string -> same cache key. */
export function encodeState(st) {
  const clean = sanitize(st);
  const ordered = {};
  for (const k of ORDER) if (clean[k] !== undefined) ordered[k] = clean[k];
  return b64urlEncode(JSON.stringify(ordered));
}

/** The letter whose sound/visual represents this state. */
export function soundLetter(st) {
  return st.l || (st.f ? FEELING_TO_LETTER[st.f] : 'love');
}

/** Language for rendering: explicit ?lang= wins, then state.lang, then en. */
export function resolveLang(queryLang, st) {
  return pick(queryLang, LANGS) || st.lang || 'en';
}
