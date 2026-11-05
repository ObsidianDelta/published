// Share-state lives in the URL fragment (#x=...). The fragment is never sent to any server, so a
// shared link carries the experiment to the friend's browser without the experiment ever leaving
// either device through us. Decoding treats the link as untrusted input.

import { normalizeExperiment, newExperiment } from './experiment.js';
import { QUESTIONS } from './catalog.js';
import { canonicalize } from '../vendor/od-cards.js';

export const MAX_CODE = 2048;

function b64urlFromBytes(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function bytesFromB64url(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** the share payload: the experiment, minus anything that only matters on this device. */
export function sharePayload(exp) {
  const p = { v: 1, q: exp.q, size: exp.size, sources: exp.sources, letters: exp.letters, sound: exp.sound, gen: exp.gen };
  if (exp.parent) p.parent = exp.parent;
  return p;
}

export function encode(exp) {
  return b64urlFromBytes(new TextEncoder().encode(JSON.stringify(sharePayload(exp))));
}

/** decodeRaw(code) -> the parsed (still untrusted) payload object, or null. Never throws.
    A template payload has `t` (validated by core/tpl.js); a free-form one is validated by decode(). */
export function decodeRaw(code) {
  if (typeof code !== 'string' || !code || code.length > MAX_CODE || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const raw = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesFromB64url(code)));
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** encode any payload object (free-form experiment payloads should go through encode()). */
export function encodePayload(p) {
  return b64urlFromBytes(new TextEncoder().encode(JSON.stringify(p)));
}

/** a stable 12-hex id for any payload. */
export async function payloadId(p) {
  const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalize(p)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}

/** decode(code) -> experiment or null. Never throws. */
export function decode(code) {
  if (typeof code !== 'string' || !code || code.length > MAX_CODE || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const raw = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesFromB64url(code)));
    return normalizeExperiment(raw);
  } catch {
    return null;
  }
}

/** read the code from a location hash like "#x=abc" (other fragment params are ignored). */
export function codeFromHash(hash) {
  if (typeof hash !== 'string') return null;
  const m = /(?:^#|&)x=([A-Za-z0-9_-]+)/.exec(hash);
  return m ? m[1] : null;
}

export function linkFor(exp, base) {
  const u = String(base).split('#')[0];
  return `${u}#x=${encode(exp)}`;
}

/** a stable 12-hex id: sha-256 over the RFC 8785 canonical JSON of the share payload. */
export async function experimentId(exp) {
  const data = new TextEncoder().encode(canonicalize(sharePayload(exp)));
  const buf = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12);
}

/** the copy that goes into a link: words the person typed are dropped unless they chose to
    include them (only offered to people who answered the age question with 13 or older). */
export function linkCopy(exp, { includeText = false } = {}) {
  if (includeText) return exp;
  return { ...exp, q: hasOwnQuestion(exp) ? QUESTIONS[0] : exp.q, sources: exp.sources.map((s) => (s.text ? { k: s.k } : s)) };
}
export const hasOwnQuestion = (exp) => !QUESTIONS.includes(exp.q);
/** does this experiment hold words the person typed? */
export const hasTypedWords = (exp) => hasOwnQuestion(exp) || exp.sources.some((s) => s.text);

/** remix: same experiment, one generation further, pointing back at the original. */
export function remixOf(exp, parentId) {
  return normalizeExperiment({ ...sharePayload(exp), parent: parentId, gen: Math.min(99, (exp.gen || 0) + 1) });
}

/** make mine: the same question, a fresh experiment. */
export function makeMineFrom(exp) {
  return newExperiment({ q: exp.q, size: exp.size });
}
