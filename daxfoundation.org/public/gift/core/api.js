// The love data API (state/gift/data/API.md, gift 2/4: cloudflare/workers/love-probe /api/gift/*).
// The ONLY module in the studio that can send anything off the device.
//
// OFF by default (API_CONFIG.enabled = false): the worker is built and tested but not deployed.
// Even when enabled, a personal call needs ALL of:
//   - the studio's age gate answered "13 or older" (our gate),
//   - "I'm 16 or older" ticked (the server's min_age, API.md §3: age_gate.over_min_age),
//   - an explicit "Yes, add it" to the consent copy (consent.public_dataset = true).
// Dataset reads (no personal data) still need enabled + a tap from the person.
// Free text (typed questions, names) is never sent: question.text and person names are omitted.
//
// Wire details (device payload, owner-only lineage counts, publication defaults) come from the
// backend's own contract, vendored from state/gift/data/client/gift-data-contract.mjs by
// scripts/gift/sync-vendor.mjs -> ../lib/gift-data/contract.mjs. Never hand-edit that copy.
import { deviceRequestBody, DEVICE_HEADER, DEVICE_KEY_RE, CONSENT_VERSION, MIN_AGE, NOT_PUBLISHED, isOwnerView } from '../lib/gift-data/contract.mjs';
export { isOwnerView, NOT_PUBLISHED };

export const API_CONFIG = Object.freeze({
  enabled: false,
  base: 'https://research.daxfoundation.org',
  consentVersion: CONSENT_VERSION,
  minAge: MIN_AGE,
});

export const DEVICE_KEY = 'gift_v1_device';
const DEVICE_RE = DEVICE_KEY_RE;

/** the gate for anything personal. Returns null when allowed, else a reason code. */
export function personalGate({ config = API_CONFIG, age13, over16, consent }) {
  if (!config.enabled) return 'closed';
  if (age13 !== true) return 'age_gate_required';
  if (over16 !== true) return 'age_gate_required';
  if (consent !== true) return 'consent_required';
  return null;
}

export class ApiError extends Error {
  constructor(status, code, message) { super(message || code); this.status = status; this.code = code; }
}

/** a client bound to a fetch implementation and this device's storage. */
export function makeClient({ config = API_CONFIG, fetchImpl = globalThis.fetch, storage = null } = {}) {
  const key = () => { try { const k = storage && storage.getItem(DEVICE_KEY); return k && DEVICE_RE.test(k) ? k : null; } catch { return null; } };
  const setKey = (k) => { try { if (storage) { if (k) storage.setItem(DEVICE_KEY, k); else storage.removeItem(DEVICE_KEY); } } catch { /* storage off */ } };

  async function call(method, path, { body, device = false } = {}) {
    if (!config.enabled) throw new ApiError(0, 'closed', 'research is not open');
    const headers = { 'Content-Type': 'application/json' };
    if (device === 'optional') { const k = key(); if (k) headers[DEVICE_HEADER] = k; }
    else if (device) { const k = key(); if (!k) throw new ApiError(401, 'device_required'); headers[DEVICE_HEADER] = k; }
    const r = await fetchImpl(config.base + '/api/gift' + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body), credentials: 'omit', referrerPolicy: 'no-referrer',
    });
    let data = null; try { data = await r.json(); } catch { data = null; }
    if (!r.ok) throw new ApiError(r.status, (data && data.error) || 'http_' + r.status, data && data.message);
    return data;
  }

  return {
    hasDevice: () => !!key(),
    /** §1: mint a key, ONLY after the age gate + consent. The server (rev 2+) also requires the
        age gate in the body: { age_gate: { over_min_age: true } }, built by the contract. */
    async ensureDevice(gate) {
      const why = personalGate({ config, ...gate });
      if (why) throw new ApiError(403, why);
      if (key()) return key();
      const d = await call('POST', '/device', { body: deviceRequestBody({ over16: gate.over16 }) });
      setKey(d.device_key);
      return d.device_key;
    },
    vocab: () => call('GET', '/vocab'),
    /** §3: submit. The body must come from experimentBody(); the gate is re-checked here. */
    async submit(body, gate) {
      const why = personalGate({ config, ...gate });
      if (why) throw new ApiError(403, why);
      await this.ensureDevice(gate);
      try { return await call('POST', '/experiments', { body, device: true }); }
      catch (e) { if (e.code === 'device_invalid') { setKey(null); await this.ensureDevice(gate); return call('POST', '/experiments', { body, device: true }); } throw e; }
    },
    me: () => call('GET', '/me', { device: true }),
    share: (id, channel = 'link', parentToken) => call('POST', `/experiments/${encodeURIComponent(id)}/share`, { body: parentToken ? { channel, parent_token: parentToken } : { channel }, device: true }),
    /** §5: opening a share link records an open; only call it after the person chose to open it. */
    openShare: (token) => call('GET', `/shares/${encodeURIComponent(token)}`, { device: 'optional' }),
    /** structure counts for anyone; shares/opens/make_mine ONLY for the owner's own device (rev 2+).
        A missing funnel field means "not yours", never zero: check isOwnerView(lineage). */
    lineage: (id) => call('GET', `/experiments/${encodeURIComponent(id)}/lineage`, { device: 'optional' }),
    withdraw: (id) => call('DELETE', `/experiments/${encodeURIComponent(id)}`, { device: true }),
    async forgetMe() { const r = await call('DELETE', '/me', { device: true }); setKey(null); return r; },
    /** rev 3: the open dataset is published weekly; before the first publication every route
        answers 404 not_published_yet (ApiError.code === NOT_PUBLISHED) -- show the "not enough voices yet" state. */
    dataset: (dim) => {
      if (!['emotions', 'cultures', 'languages', 'inspirations', 'lineage'].includes(dim)) throw new ApiError(400, 'bad_dimension');
      return call('GET', '/dataset/' + dim);
    },
  };
}

// ---- building the §3 body from a studio experiment (mirrors the server's rules) ----
const WORK_TYPES = { movie: 'film', song: 'song', 'song-of-youth': 'song', film: 'film' };
const PERSONAL_TYPES = { memory: 'memory', place: 'place', city: 'place', home: 'place', journey: 'place', nature: 'nature', season: 'nature', weather: 'nature', sky: 'nature', garden: 'nature', animal: 'nature', 'time-of-day': 'nature', timeofday: 'nature' };
const PERSON_TYPES = new Set(['person', 'friend', 'friendship', 'family', 'ancestors', 'remembrance', 'new-life', 'self', 'community']);
const NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'unspecified';

/** inspiration {type, refs} from a source kind + an optional catalogued work. */
export function inspirationFor(kind, work) {
  if (WORK_TYPES[kind] && work) {
    const ref = { title: work.work || work.title, creator: work.composer, catalog: 'theme-catalog' };
    if (Number.isInteger(work.year)) ref.year = work.year;
    if (work.id) ref.work_id = work.id;
    return { type: WORK_TYPES[kind], refs: [ref] };
  }
  if (PERSON_TYPES.has(kind)) return { type: 'person', refs: [{ role: 'other' }] };
  if (kind === 'culture' || kind === 'culture-harmony' || kind === 'love-words' || kind === 'festival' || kind === 'prayer-ritual' || kind === 'lullaby' || kind === 'dance') return { type: 'tradition', refs: work ? [{ title: work.title || work.tradition || work.id, creator: 'tradition', work_id: work.id, catalog: 'culture-catalog' }] : [{ title: kind, creator: 'tradition', catalog: 'culture-catalog' }] };
  return { type: PERSONAL_TYPES[kind] || 'other', refs: [] };
}

/** Build the POST /experiments body. Only schema keys; never free text. */
export function experimentBody({ questionId, kind, work, chords, letters, notes, lang, culture, parentId, shareToken }) {
  const pc = (m) => NOTE[((m % 12) + 12) % 12];
  const phrase = notes.filter((n) => n.part !== 'hum').slice(0, 256);
  const emotion_map = {};
  letters.forEach((l, i) => {
    const n = phrase.find((x) => x.letter === l) || phrase[i] || phrase[0];
    emotion_map[l] = { note: n ? pc(n.m) : 'D', strength: Math.max(1, 5 - i) };
    if (chords[i]) emotion_map[l].chord = chords[i].replace(/1$/, '');
  });
  const body = {
    question: { id: slug(questionId) },
    inspiration: inspirationFor(kind, work),
    stages: {
      chords: chords.slice(0, 64).map((c) => ({ symbol: c.replace(/1$/, '') })),
      emotion_map,
      notes: phrase.map((n) => ({ midi: n.m, t_ms: Math.round(n.t * 1000 * 60 / 72), dur_ms: Math.max(1, Math.round(n.d * 1000 * 60 / 72)), velocity: Math.round(n.v * 127), ...(n.letter ? { emotion: n.letter } : {}) })),
    },
    lang,
    culture: culture ? slug(culture) : 'unspecified',
    consent: { version: API_CONFIG.consentVersion, public_dataset: true },
    age_gate: { over_min_age: true },
  };
  if (parentId) body.parent_id = parentId;
  if (shareToken) body.share_token = shareToken;
  return body;
}

/** API share tokens arrive as ?s=<token> (API.md §5); gift-og share-state also uses ?s= (base64 JSON,
    always starting "ey"). Tell them apart without decoding anything off-device. */
export const looksLikeApiToken = (s) => typeof s === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(s) && !s.startsWith('ey');
