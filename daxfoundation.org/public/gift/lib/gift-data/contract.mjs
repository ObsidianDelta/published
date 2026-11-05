// gift-data-contract.mjs -- the client-side contract for the gift data API (gift 2/4).
//
// SOURCE OF TRUTH for anything a client needs to know to talk to
// cloudflare/workers/love-probe /api/gift/*. Owned by the backend lane
// (state/gift/data/**); the studio vendors it verbatim via
// views/daxfoundation/scripts/gift/sync-vendor.mjs -> public/gift/lib/gift-data/contract.mjs.
// Do not edit the vendored copy: change this file and re-run the sync.
//
// Pure ES module: no imports, no Node APIs, safe to load in a browser.
// Conformance: cloudflare/workers/love-probe/test/contract.mjs runs the real
// worker against every rule in this file. Human-readable version: state/gift/data/API.md.

export const CONTRACT_VERSION = 3;            // = API.md rev 3

export const CONSENT_VERSION = 'gift-consent-v1';
export const MIN_AGE = 16;
export const DEVICE_HEADER = 'X-Gift-Device';
export const DEVICE_KEY_RE = /^gk_[A-Za-z0-9_-]{43}$/;

// ---- POST /api/gift/device
// rev 2+: the server mints a key ONLY with this body. No age gate (or false, or any
// extra field such as a birth year) -> 403 age_gate_required / 400 unknown_field.
// Under-16 and "rather not say" visitors never get a key: they browse and open
// share links anonymously.
export function deviceRequestBody({ over16 } = {}) {
  if (over16 !== true) {
    const e = new Error('age_gate_required'); e.code = 'age_gate_required'; e.status = 403;
    throw e;
  }
  return { age_gate: { over_min_age: true } };
}

// ---- lineage counts (GET /experiments/:id/lineage, share-open view, /me)
// Everyone sees the structure. The funnel numbers are OWNER-ONLY: the server adds
// them only when the request carries the owner's device key (on someone else's
// experiment, "opens: 1" could reveal that one friend opened it).
// So: send the device header on /lineage when the person has a key, and treat a
// missing funnel field as "not yours" -- never as zero.
export const LINEAGE_PUBLIC_FIELDS = Object.freeze(['children', 'descendants', 'generations_below']);
export const LINEAGE_OWNER_FIELDS = Object.freeze(['shares', 'opens', 'make_mine']);
export const isOwnerView = (lineage) => !!lineage && LINEAGE_OWNER_FIELDS.every((f) => typeof lineage[f] === 'number');

// ---- routes (relative to <base>/api/gift)
export const ROUTES = Object.freeze({
  vocab:        { method: 'GET',    path: '/vocab' },
  device:       { method: 'POST',   path: '/device',                      body: 'deviceRequestBody()' },
  me:           { method: 'GET',    path: '/me',                          device: 'required' },
  forgetMe:     { method: 'DELETE', path: '/me',                          device: 'required' },
  submit:       { method: 'POST',   path: '/experiments',                 device: 'required' },
  experiment:   { method: 'GET',    path: '/experiments/:id' },
  lineage:      { method: 'GET',    path: '/experiments/:id/lineage',     device: 'if-present (owner gets funnel fields)' },
  share:        { method: 'POST',   path: '/experiments/:id/share',       device: 'required' },
  withdraw:     { method: 'DELETE', path: '/experiments/:id',             device: 'required' },
  openShare:    { method: 'GET',    path: '/shares/:token',               device: 'if-present' },
  dataset:      { method: 'GET',    path: '/dataset/:dimension' },
  datasetExport:{ method: 'GET',    path: '/dataset/export.json' },
  demoDataset:  { method: 'GET',    path: '/demo/dataset/:dimension' }
});
export const DATASET_DIMENSIONS = Object.freeze(['emotions', 'cultures', 'languages', 'inspirations', 'lineage']);

// ---- the public open dataset
// Launch defaults are CONSERVATIVE (the server's GIFT_* vars; Jason may loosen them).
// The live values come from GET /vocab -> publication; never hard-code them in UI copy.
//   k_min       a class / cell is shown only with >= k distinct people AND sources
//   rounded_to  every published count is a multiple of this
//   cadence     weekly: the dataset changes once a week (weekday_utc, 1 = Monday);
//               before the first publication every /dataset route answers 404 not_published_yet
export const PUBLICATION_DEFAULTS = Object.freeze({ k_min: 10, rounded_to: 5, cadence: 'weekly', weekday_utc: 1 });
export const NOT_PUBLISHED = 'not_published_yet';
// Demo (synthetic) data: same shapes, always live, and must always be labelled.
export const SYNTHETIC_NOTICE = 'SYNTHETIC DEMO DATA - NOT REAL PEOPLE';

// ---- what the server never accepts (the client must not even try)
// question.text is optional, is never part of the open dataset, and is only visible
// to people holding the experiment link. Whether to collect it at all is an open
// decision (Jason) -- the studio currently never sends it.
export const NEVER_SEND = Object.freeze(['name', 'email', 'phone', 'birth_year', 'age', 'author', 'location']);

// ---- error codes a client should handle (status -> code)
export const ERRORS = Object.freeze({
  age_gate_required: 403, consent_required: 403,
  device_required: 401, device_invalid: 401,
  unknown_field: 400, invalid_field: 400, invalid_emotion: 400, pii_rejected: 400,
  attribution_required: 400, empty_experiment: 400, invalid_json: 400,
  not_found: 404, parent_not_found: 404, not_published_yet: 404, no_export_yet: 404,
  parent_withdrawn: 409, withdrawn: 410, too_large: 413, rate_limited: 429
});
