// @obsidiandelta/od-cards — the card unit for the experience sidecar.
//
// cards@2 is an ADDITIVE bump of od-experience/cards@1: every cards@1 card stays
// valid (mode "cards1"). Sidecar mode adds the identity/scope spine and runs the
// communication-initiative validators R1/R2/R3/R8.
//
// Zero dependencies. No node: imports. Runs unchanged in Node 18+, browsers and
// Cloudflare Workers; contentHash uses WebCrypto (globalThis.crypto.subtle) only.

export const SCHEMA = 'od-experience/cards@2';
export const VERSION = '0.1.0';

// ---- vocabulary (p0-asks section 2) --------------------------------------

// The five sharing categories for people. The host filters events by these before
// sending; the sidecar drops anything not granted as defence in depth (S5).
export const CATEGORIES = Object.freeze(['opened', 'depth', 'feel', 'reactions', 'replies']);

// Every event maps to exactly one category.
export const EVENT_CATEGORY = Object.freeze({
  open: 'opened',
  depth: 'depth',
  play: 'depth',
  feel: 'feel',
  react: 'reactions',
  pick: 'replies',
  reply: 'replies',
  ask: 'replies',
});

// Rungs, lowest to highest. A rung is never raised without both parties.
export const RUNGS = Object.freeze(['private', 'tenant', 'shared', 'public']);

// kind adds decision, reply, understanding to cards@1 / v0's chapter, message, doc, cta.
// 'motion' (Gesture Studio, STUDIO.md §7) is an ADDITIVE kind: a recorded MotionClip stored as
// a card, carrying the clip JSON as a media item. No existing kind changes.
export const KINDS = new Set(['chapter', 'message', 'doc', 'cta', 'decision', 'reply', 'understanding', 'motion']);

// The mime a motion card's clip body is stored under (media.items[].mime). One canonical
// shape: the MotionClip v0 JSON. A motion card is REQUIRED to carry at least one such item.
export const MOTION_MIME = 'application/vnd.od.motion+json';

// The building-block dimensions the composer ranks on; each a number in [0, 1].
const DIMS = new Set(['urgency', 'temporal', 'emergence', 'impact', 'attention', 'probability']);

// cards@1 shapes, mirrored from packages/od-experience/src/site.js.
const UID = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/;
const LABEL = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const TEXT_FIELDS = Object.freeze(['answer', 'more', 'how', 'proof_intro', 'under', 'horizon']);

// ---- small helpers --------------------------------------------------------

function isObj(x) {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function clone(x) {
  return x === undefined ? undefined : JSON.parse(JSON.stringify(x));
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual(a[k], b[k])) return false;
    return true;
  }
  return false;
}

function saidText(card) {
  return typeof card.said === 'string' ? card.said : undefined;
}
function saidMediaRef(card) {
  return isObj(card.said) ? card.said.media : undefined;
}
function versionText(v) {
  if (typeof v.text === 'string') return v.text;
  if (isObj(v.text) && typeof v.text.answer === 'string') return v.text.answer;
  return undefined;
}
function isAudioOrVideo(mime) {
  return typeof mime === 'string' && /^(audio|video)\//.test(mime);
}

// ---- rungs ----------------------------------------------------------------

export function rungRaised(before, after) {
  const a = RUNGS.indexOf(before), b = RUNGS.indexOf(after);
  if (a < 0 || b < 0) return false;
  return b > a;
}

// ---- validation -----------------------------------------------------------

function checkMediaRef(ref, path, errors, rule) {
  if (!isObj(ref)) { errors.push({ rule, path, msg: 'mediaRef must be an object' }); return; }
  if (typeof ref.sha256 !== 'string' || !ref.sha256) errors.push({ rule, path: path + '/sha256', msg: 'mediaRef.sha256 is required' });
  if (typeof ref.mime !== 'string' || !ref.mime) errors.push({ rule, path: path + '/mime', msg: 'mediaRef.mime is required' });
  if (typeof ref.bytes !== 'number' || !Number.isFinite(ref.bytes) || ref.bytes < 0) errors.push({ rule, path: path + '/bytes', msg: 'mediaRef.bytes must be a non-negative number' });
  if (ref.stream_uid !== undefined && typeof ref.stream_uid !== 'string') errors.push({ rule, path: path + '/stream_uid', msg: 'mediaRef.stream_uid must be a string' });
}

// R1: message|reply needs a non-empty said string OR said.media (audio/video, no text);
// any verbatim version must equal said exactly; said_machine true must not carry approval.
function ruleR1(card, errors) {
  const kind = card.kind;
  if (kind === 'message' || kind === 'reply') {
    const st = saidText(card);
    const sm = saidMediaRef(card);
    const hasText = typeof st === 'string' && st.length > 0;
    const hasMedia = isObj(sm) && isAudioOrVideo(sm.mime);
    if (!hasText && !hasMedia) {
      errors.push({ rule: 'R1', path: '/said', msg: `kind "${kind}" needs a non-empty said string or said.media (audio or video with no text)` });
    }
  }
  const st = saidText(card);
  const vs = isObj(card.versions) ? card.versions : {};
  for (const [k, v] of Object.entries(vs)) {
    if (isObj(v) && v.verbatim === true) {
      const vt = versionText(v);
      if (typeof st !== 'string' || vt !== st) {
        errors.push({ rule: 'R1', path: `/versions/${k}`, msg: 'a verbatim version must equal said exactly' });
      }
    }
  }
  if (card.said_machine === true && isObj(card.provenance) && card.provenance.approval !== undefined) {
    errors.push({ rule: 'R1', path: '/provenance/approval', msg: 'a card with said_machine true must not carry an approval' });
  }
}

// R2: every version by "skippy" carries holds (indices into why.canon) covering
// EVERY canon index; in range; no duplicates.
function ruleR2(card, errors) {
  const vs = isObj(card.versions) ? card.versions : {};
  const canon = Array.isArray(card.why?.canon) ? card.why.canon : [];
  for (const [k, v] of Object.entries(vs)) {
    if (!isObj(v) || v.by !== 'skippy') continue;
    const h = v.holds;
    if (!Array.isArray(h)) {
      errors.push({ rule: 'R2', path: `/versions/${k}/holds`, msg: 'a version by "skippy" must carry holds (indices into why.canon)' });
      continue;
    }
    const seen = new Set();
    let bad = false;
    for (const idx of h) {
      if (!Number.isInteger(idx) || idx < 0 || idx >= canon.length) {
        errors.push({ rule: 'R2', path: `/versions/${k}/holds`, msg: `holds index ${JSON.stringify(idx)} is out of range [0, ${canon.length})` });
        bad = true; break;
      }
      if (seen.has(idx)) {
        errors.push({ rule: 'R2', path: `/versions/${k}/holds`, msg: `duplicate holds index ${idx}` });
        bad = true; break;
      }
      seen.add(idx);
    }
    if (bad) continue;
    for (let i = 0; i < canon.length; i++) {
      if (!seen.has(i)) { errors.push({ rule: 'R2', path: `/versions/${k}/holds`, msg: `holds must cover every canon index; missing ${i}` }); break; }
    }
  }
}

// R3: every node of why.tree, recursively, has cite {label, ref} (non-empty strings) or skippy: true.
function checkNode(n, path, errors) {
  if (!isObj(n)) { errors.push({ rule: 'R3', path, msg: 'a why.tree node must be an object' }); return; }
  const skippy = n.skippy === true;
  const c = n.cite;
  const citeOk = isObj(c) && typeof c.label === 'string' && c.label.length > 0 && typeof c.ref === 'string' && c.ref.length > 0;
  if (!skippy && !citeOk) {
    errors.push({ rule: 'R3', path, msg: 'every reasoning node needs cite {label, ref} (non-empty strings) or skippy: true' });
  }
  const kids = Array.isArray(n.children) ? n.children : (Array.isArray(n.nodes) ? n.nodes : []);
  kids.forEach((k, i) => checkNode(k, `${path}/children/${i}`, errors));
}
function ruleR3(card, errors) {
  const tree = card.why?.tree;
  if (tree === undefined) return;
  const nodes = Array.isArray(tree) ? tree : [tree];
  nodes.forEach((n, i) => checkNode(n, `/why/tree/${i}`, errors));
}

// R8: a synthetic version carries a non-empty synthetic_label and original (a ref to said or a sha256).
function ruleR8(card, errors) {
  const vs = isObj(card.versions) ? card.versions : {};
  for (const [k, v] of Object.entries(vs)) {
    if (!isObj(v) || v.synthetic !== true) continue;
    if (typeof v.synthetic_label !== 'string' || !v.synthetic_label) errors.push({ rule: 'R8', path: `/versions/${k}/synthetic_label`, msg: 'a synthetic version needs a non-empty synthetic_label' });
    if (typeof v.original !== 'string' || !v.original) errors.push({ rule: 'R8', path: `/versions/${k}/original`, msg: 'a synthetic version needs original (a ref to said or a sha256)' });
  }
}

// Rmotion: a motion card (Gesture Studio, STUDIO.md §7) carries its MotionClip JSON as a media
// item (mime MOTION_MIME) and never carries `said` (a clip has no spoken words a sidecar would
// treat as the owner's verbatim; the clip's own `spoken` lives inside the stored JSON).
function ruleMotion(card, errors) {
  if (card.kind !== 'motion') return;
  if (card.said !== undefined) {
    errors.push({ rule: 'Rmotion', path: '/said', msg: 'a motion card must not carry said' });
  }
  const items = isObj(card.media) && Array.isArray(card.media.items) ? card.media.items : [];
  if (!items.some((it) => isObj(it) && it.mime === MOTION_MIME)) {
    errors.push({ rule: 'Rmotion', path: '/media/items', msg: `a motion card needs a media.items entry with mime "${MOTION_MIME}"` });
  }
}

// cards@1 structural checks (what normalizeCards would otherwise throw on).
function checkCards1(card, errors) {
  if (typeof card.uid !== 'string' || !UID.test(card.uid)) errors.push({ rule: 'schema', path: '/uid', msg: 'card.uid must match ^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$' });
  if (typeof card.title !== 'string' || !card.title) errors.push({ rule: 'schema', path: '/title', msg: 'card.title is required' });
  if (!isObj(card.versions) || !isObj(card.versions.default)) {
    errors.push({ rule: 'schema', path: '/versions/default', msg: 'card.versions.default is required (the fallback version)' });
  } else {
    for (const [k, v] of Object.entries(card.versions)) {
      if (!isObj(v)) { errors.push({ rule: 'schema', path: `/versions/${k}`, msg: 'version must be an object' }); continue; }
      if (!isObj(v.text) || !TEXT_FIELDS.some((f) => typeof v.text[f] === 'string' && v.text[f] !== '')) {
        errors.push({ rule: 'schema', path: `/versions/${k}/text`, msg: 'version.text needs at least one non-empty field' });
      }
    }
  }
}

// sidecar structural checks: the identity/scope spine and the optional cards@2 fields.
function checkSidecar(card, errors) {
  if (typeof card.uid !== 'string' || !UID.test(card.uid)) errors.push({ rule: 'schema', path: '/uid', msg: 'card.uid must match ^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$' });
  if (!Number.isInteger(card.rev) || card.rev < 1) errors.push({ rule: 'schema', path: '/rev', msg: 'card.rev must be an integer >= 1' });
  if (!KINDS.has(card.kind)) errors.push({ rule: 'schema', path: '/kind', msg: 'card.kind must be one of ' + [...KINDS].join(', ') });
  if (typeof card.entity !== 'string' || !LABEL.test(card.entity)) errors.push({ rule: 'schema', path: '/entity', msg: 'card.entity must be a label' });

  const s = card.scope;
  if (!isObj(s)) {
    errors.push({ rule: 'schema', path: '/scope', msg: 'card.scope is required' });
  } else {
    if (typeof s.tenant !== 'string' || !LABEL.test(s.tenant)) errors.push({ rule: 'schema', path: '/scope/tenant', msg: 'scope.tenant must be a label' });
    if (!RUNGS.includes(s.rung)) errors.push({ rule: 'schema', path: '/scope/rung', msg: 'scope.rung must be one of ' + RUNGS.join(', ') });
    if (s.rung === 'private' && (typeof s.owner !== 'string' || !LABEL.test(s.owner))) errors.push({ rule: 'schema', path: '/scope/owner', msg: 'a private card needs scope.owner (a label)' });
    else if (s.owner !== undefined && (typeof s.owner !== 'string' || !LABEL.test(s.owner))) errors.push({ rule: 'schema', path: '/scope/owner', msg: 'scope.owner must be a label' });
    if (s.rung === 'shared' && (!Array.isArray(s.labels) || s.labels.length === 0 || !s.labels.every((l) => typeof l === 'string' && LABEL.test(l)))) {
      errors.push({ rule: 'schema', path: '/scope/labels', msg: 'a shared card needs scope.labels (a non-empty array of labels)' });
    }
  }

  if (card.annotates !== undefined && (typeof card.annotates !== 'string' || !UID.test(card.annotates))) errors.push({ rule: 'schema', path: '/annotates', msg: 'annotates must be a card uid' });
  if (card.dims !== undefined) {
    if (!isObj(card.dims)) errors.push({ rule: 'schema', path: '/dims', msg: 'dims must be an object' });
    else for (const [k, val] of Object.entries(card.dims)) {
      if (!DIMS.has(k)) errors.push({ rule: 'schema', path: `/dims/${k}`, msg: 'unknown dim "' + k + '"' });
      else if (typeof val !== 'number' || !Number.isFinite(val) || val < 0 || val > 1) errors.push({ rule: 'schema', path: `/dims/${k}`, msg: 'each dim must be a number in [0, 1]' });
    }
  }
  if (card.media !== undefined) {
    if (!isObj(card.media)) errors.push({ rule: 'schema', path: '/media', msg: 'media must be an object' });
    else {
      if (card.media.forms !== undefined && (!Array.isArray(card.media.forms) || !card.media.forms.every((f) => typeof f === 'string'))) errors.push({ rule: 'schema', path: '/media/forms', msg: 'media.forms must be an array of form ids' });
      if (card.media.items !== undefined) {
        if (!Array.isArray(card.media.items)) errors.push({ rule: 'schema', path: '/media/items', msg: 'media.items must be an array' });
        else card.media.items.forEach((it, i) => checkMediaRef(it, `/media/items/${i}`, errors, 'schema'));
      }
    }
  }
  const sm = saidMediaRef(card);
  if (sm !== undefined) checkMediaRef(sm, '/said/media', errors, 'schema');
  if (card.said_machine !== undefined && typeof card.said_machine !== 'boolean') errors.push({ rule: 'schema', path: '/said_machine', msg: 'said_machine must be a boolean' });
  if (card.said_segments_ref !== undefined && typeof card.said_segments_ref !== 'string') errors.push({ rule: 'schema', path: '/said_segments_ref', msg: 'said_segments_ref must be a string' });
  if (card.transcript !== undefined && typeof card.transcript !== 'string') errors.push({ rule: 'schema', path: '/transcript', msg: 'transcript must be a string (a machine transcript, never in said)' });
  if (card.attributed_to !== undefined && (typeof card.attributed_to !== 'string' || !LABEL.test(card.attributed_to))) errors.push({ rule: 'schema', path: '/attributed_to', msg: 'attributed_to must be a label' });
  if (card.via !== undefined && typeof card.via !== 'string') errors.push({ rule: 'schema', path: '/via', msg: 'via must be a string' });

  if (card.versions !== undefined) {
    if (!isObj(card.versions)) errors.push({ rule: 'schema', path: '/versions', msg: 'versions must be an object' });
    else for (const [k, v] of Object.entries(card.versions)) {
      if (!isObj(v)) { errors.push({ rule: 'schema', path: `/versions/${k}`, msg: 'version must be an object' }); continue; }
      if (v.stale !== undefined && typeof v.stale !== 'boolean') errors.push({ rule: 'schema', path: `/versions/${k}/stale`, msg: 'version.stale must be a boolean' });
    }
  }
}

// validateCard(card, {mode}) -> {ok, errors:[{rule, path, msg}]}.
// mode "cards1" (back-compat) or "sidecar" (default; adds the spine + R1/R2/R3/R8).
export function validateCard(card, opts = {}) {
  const mode = opts.mode || 'sidecar';
  if (!isObj(card)) return { ok: false, errors: [{ rule: 'schema', path: '', msg: 'card must be an object' }] };
  const errors = [];
  if (mode === 'cards1') {
    checkCards1(card, errors);
  } else if (mode === 'sidecar') {
    checkSidecar(card, errors);
    ruleR1(card, errors);
    ruleR2(card, errors);
    ruleR3(card, errors);
    ruleR8(card, errors);
    ruleMotion(card, errors);
  } else {
    return { ok: false, errors: [{ rule: 'schema', path: '', msg: `unknown mode "${mode}"` }] };
  }
  return { ok: errors.length === 0, errors };
}

// ---- RFC 6902 JSON Patch ---------------------------------------------------

function parsePtr(p) {
  if (p === '') return [];
  if (typeof p !== 'string' || p[0] !== '/') throw new Error('invalid JSON Pointer: ' + JSON.stringify(p));
  return p.split('/').slice(1).map((t) => t.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function getValue(doc, tokens) {
  let cur = doc;
  for (const t of tokens) {
    if (Array.isArray(cur)) cur = cur[t === '-' ? cur.length : Number(t)];
    else if (isObj(cur)) cur = cur[t];
    else return undefined;
  }
  return cur;
}

function locate(doc, tokens) {
  let cur = doc;
  for (let i = 0; i < tokens.length - 1; i++) {
    const t = tokens[i];
    if (Array.isArray(cur)) cur = cur[Number(t)];
    else if (isObj(cur)) cur = cur[t];
    else throw new Error('path not found: /' + tokens.join('/'));
    if (cur === undefined) throw new Error('path not found: /' + tokens.join('/'));
  }
  return { parent: cur, key: tokens[tokens.length - 1] };
}

function opAdd(doc, tokens, value) {
  if (tokens.length === 0) return value;
  const { parent, key } = locate(doc, tokens);
  if (Array.isArray(parent)) {
    const i = key === '-' ? parent.length : Number(key);
    if (!Number.isInteger(i) || i < 0 || i > parent.length) throw new Error('bad array index for add: ' + key);
    parent.splice(i, 0, value);
  } else if (isObj(parent)) {
    parent[key] = value;
  } else throw new Error('cannot add to a non-container');
  return doc;
}

function opRemove(doc, tokens) {
  if (tokens.length === 0) throw new Error('cannot remove the whole document');
  const { parent, key } = locate(doc, tokens);
  if (Array.isArray(parent)) {
    const i = Number(key);
    if (!Number.isInteger(i) || i < 0 || i >= parent.length) throw new Error('bad array index for remove: ' + key);
    parent.splice(i, 1);
  } else if (isObj(parent)) {
    if (!Object.prototype.hasOwnProperty.call(parent, key)) throw new Error('key missing for remove: ' + key);
    delete parent[key];
  } else throw new Error('cannot remove from a non-container');
  return doc;
}

function opReplace(doc, tokens, value) {
  if (tokens.length === 0) return value;
  const { parent, key } = locate(doc, tokens);
  if (Array.isArray(parent)) {
    const i = Number(key);
    if (!Number.isInteger(i) || i < 0 || i >= parent.length) throw new Error('bad array index for replace: ' + key);
    parent[i] = value;
  } else if (isObj(parent)) {
    if (!Object.prototype.hasOwnProperty.call(parent, key)) throw new Error('key missing for replace: ' + key);
    parent[key] = value;
  } else throw new Error('cannot replace in a non-container');
  return doc;
}

// applyPatch(card, ops) -> a new card. RFC 6902; never mutates its input.
export function applyPatch(card, ops) {
  if (!Array.isArray(ops)) throw new Error('ops must be an array');
  let doc = clone(card);
  for (const op of ops) {
    if (!isObj(op) || typeof op.op !== 'string' || typeof op.path !== 'string') throw new Error('each op needs a string op and path');
    const tokens = parsePtr(op.path);
    switch (op.op) {
      case 'add': doc = opAdd(doc, tokens, clone(op.value)); break;
      case 'remove': doc = opRemove(doc, tokens); break;
      case 'replace': doc = opReplace(doc, tokens, clone(op.value)); break;
      case 'move': {
        if (typeof op.from !== 'string') throw new Error('move needs a from');
        const from = parsePtr(op.from);
        const v = clone(getValue(doc, from));
        doc = opRemove(doc, from);
        doc = opAdd(doc, tokens, v);
        break;
      }
      case 'copy': {
        if (typeof op.from !== 'string') throw new Error('copy needs a from');
        const from = parsePtr(op.from);
        doc = opAdd(doc, tokens, clone(getValue(doc, from)));
        break;
      }
      case 'test': {
        if (!deepEqual(getValue(doc, tokens), op.value)) throw new Error('test failed at ' + op.path);
        break;
      }
      default: throw new Error('unknown op: ' + op.op);
    }
  }
  return doc;
}

// validatePatch(card, ops, {mode}) -> applies, then validates.
// Refuses any op touching /said (R1) or /provenance/approval.
const PATCH_FORBIDDEN = [['/said', 'R1'], ['/provenance/approval', 'approval']];
export function validatePatch(card, ops, opts = {}) {
  const refusals = [];
  for (const op of (Array.isArray(ops) ? ops : [])) {
    const paths = [op && op.path, op && op.from].filter((p) => typeof p === 'string');
    for (const p of paths) {
      for (const [prefix, rule] of PATCH_FORBIDDEN) {
        if (p === prefix || p.startsWith(prefix + '/')) refusals.push({ rule, path: p, msg: `a patch may not touch ${prefix}` });
      }
    }
  }
  if (refusals.length) return { ok: false, errors: refusals };
  let patched;
  try { patched = applyPatch(card, ops); }
  catch (e) { return { ok: false, errors: [{ rule: 'schema', path: '', msg: 'patch could not be applied: ' + e.message }] }; }
  const res = validateCard(patched, opts);
  return { ok: res.ok, errors: res.errors, card: res.ok ? patched : undefined };
}

// ---- RFC 8785 (JCS) canonical JSON + content hash --------------------------

// JSON.stringify of a finite number is exactly the ECMAScript Number->String used
// by JCS; of a string it is JCS's minimal escaping (short forms, lowercase \uXXXX,
// non-ASCII kept literal, no \/). The only thing JCS adds is sorting object keys by
// UTF-16 code unit, which default Array.sort() on strings already does.
function jcs(value) {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'boolean') return value ? 'true' : 'false';
  if (t === 'number') {
    if (!Number.isFinite(value)) throw new Error('JCS: numbers must be finite');
    return JSON.stringify(value);
  }
  if (t === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((v) => jcs(v === undefined ? null : v)).join(',') + ']';
  if (t === 'object') {
    const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + jcs(value[k])).join(',') + '}';
  }
  throw new Error('JCS: cannot serialise a value of type ' + t);
}

// canonicalize(value) -> the RFC 8785 canonical JSON string (exported for reuse).
export function canonicalize(value) {
  return jcs(value);
}

function toHex(buf) {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
  return s;
}

// contentHash(card) -> Promise<hex sha256> over JCS of the card WITHOUT rev and
// WITHOUT provenance.approval (so a signed approval is over the stable content).
export async function contentHash(card) {
  if (!isObj(card)) throw new Error('contentHash: card must be an object');
  const c = clone(card);
  delete c.rev;
  if (isObj(c.provenance)) delete c.provenance.approval;
  const bytes = new TextEncoder().encode(jcs(c));
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) throw new Error('contentHash needs WebCrypto (globalThis.crypto.subtle)');
  return toHex(await subtle.digest('SHA-256', bytes));
}

// ---- projection back to cards@1 -------------------------------------------

function cards1Version(v, card) {
  const out = {};
  for (const k of ['voice', 'lang', 'title', 'links', 'signed', 'by']) if (v[k] !== undefined) out[k] = v[k];
  if (isObj(v.text)) {
    const text = {};
    for (const f of TEXT_FIELDS) if (typeof v.text[f] === 'string' && v.text[f] !== '') text[f] = v.text[f];
    if (Object.keys(text).length) out.text = text;
  } else if (typeof v.text === 'string' && v.text !== '') {
    out.text = { answer: v.text };
  }
  if (!out.text) {
    const fallback = versionText(v) || saidText(card) || card.title || card.uid;
    out.text = { answer: String(fallback) };
  }
  return out;
}

// toCards1(card) -> a cards@1 card packages/od-experience normalizeCards accepts
// (versions.default is always present and carries a non-empty text field).
export function toCards1(card) {
  if (!isObj(card)) throw new Error('toCards1: card must be an object');
  const c = clone(card);
  const title = (typeof c.title === 'string' && c.title) ? c.title : (saidText(c) || c.why?.reason || c.uid);
  const out = { uid: c.uid, id: c.id || c.uid, title: String(title), versions: {} };
  for (const k of ['collection', 'order', 'url', 'tags', 'next', 'tense', 'claim']) if (c[k] !== undefined) out[k] = c[k];
  const vsrc = isObj(c.versions) ? c.versions : {};
  for (const [k, v] of Object.entries(vsrc)) if (isObj(v)) out.versions[k] = cards1Version(v, c);
  if (!out.versions.default) {
    const answer = saidText(c) || out.title;
    out.versions.default = { text: { answer: String(answer) }, by: c.entity };
    if (out.versions.default.by === undefined) delete out.versions.default.by;
  }
  return out;
}
