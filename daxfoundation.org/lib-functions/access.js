/**
 * 2026-11-05: copied verbatim from cloudflare/workers/approvals/src/access.js (the
 * approve.daxfoundation.org pattern) for the preview list's private admin pages
 * (functions/admin/preview/). Keep the two in step.
 *
 * Cloudflare Access JWT check, done by the Worker itself so the page is never open even if the
 * Access application is deleted, mis-scoped or bypassed (workers.dev, a stray route, a Bypass policy).
 *
 * Extends the verifier in cloudflare/workers/obs-dashboard/src/index.js (same JWKS cache, same
 * RSASSA-PKCS1-v1_5 Web Crypto path) and tightens it:
 *   - header Cf-Access-Jwt-Assertion only (Access always sets it on the hop to the origin);
 *   - alg must be RS256 and kid must match a published key (no keys[0] fallback);
 *   - iss must be https://<ACCESS_TEAM_DOMAIN>, aud must contain ACCESS_AUD;
 *   - exp/nbf/iat checked with 60 s leeway;
 *   - the token must carry an email in ALLOWED_EMAILS (service tokens carry none, so they fail);
 *   - missing ACCESS_TEAM_DOMAIN / ACCESS_AUD / ALLOWED_EMAILS => everything is refused (fail closed).
 * Returns { ok:true, email } or { ok:false, reason }. The reason is for tests and logs; the HTTP
 * answer to the browser never says which check failed.
 */

const LEEWAY_S = 60;
const JWKS_TTL_MS = 5 * 60 * 1000;
const JWKS_TIMEOUT_MS = 5000;

const jwksCache = new Map(); // team domain -> { at, keys }

export function _resetJwksCache() { jwksCache.clear(); }

function b64urlBytes(str) {
  const base64 = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64urlJson(str) {
  return JSON.parse(new TextDecoder().decode(b64urlBytes(str)));
}

export function accessConfig(env) {
  const team = String(env.ACCESS_TEAM_DOMAIN || '').trim().toLowerCase();
  const aud = String(env.ACCESS_AUD || '').trim();
  const emails = String(env.ALLOWED_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const ok = /^[a-z0-9-]+\.cloudflareaccess\.com$/.test(team) && /^[A-Za-z0-9]{16,128}$/.test(aud) && emails.length > 0;
  return { ok, team, aud, emails };
}

async function fetchJwks(team, force) {
  const hit = jwksCache.get(team);
  if (!force && hit && Date.now() - hit.at < JWKS_TTL_MS) return hit.keys;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), JWKS_TIMEOUT_MS);
  try {
    const r = await fetch(`https://${team}/cdn-cgi/access/certs`, { signal: ctl.signal });
    if (!r.ok) throw new Error(`jwks ${r.status}`);
    const body = await r.json();
    const keys = Array.isArray(body && body.keys) ? body.keys : [];
    jwksCache.set(team, { at: Date.now(), keys });
    return keys;
  } finally {
    clearTimeout(timer);
  }
}

async function findKey(team, kid) {
  let keys = await fetchJwks(team, false);
  let jwk = keys.find((k) => k && k.kid === kid);
  if (!jwk) {
    keys = await fetchJwks(team, true); // key rotation: refetch once
    jwk = keys.find((k) => k && k.kid === kid);
  }
  return jwk || null;
}

export async function verifyAccess(request, env) {
  const cfg = accessConfig(env);
  if (!cfg.ok) return { ok: false, reason: 'not_configured' };

  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return { ok: false, reason: 'no_token' };
  const parts = jwt.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'malformed' };

  let header;
  let payload;
  try {
    header = b64urlJson(parts[0]);
    payload = b64urlJson(parts[1]);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (!header || header.alg !== 'RS256' || typeof header.kid !== 'string' || !header.kid) return { ok: false, reason: 'bad_alg_or_kid' };
  if (!payload || typeof payload !== 'object') return { ok: false, reason: 'malformed' };

  if (payload.iss !== `https://${cfg.team}`) return { ok: false, reason: 'bad_iss' };
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(cfg.aud)) return { ok: false, reason: 'bad_aud' };

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp + LEEWAY_S < now) return { ok: false, reason: 'expired' };
  if (typeof payload.nbf === 'number' && payload.nbf - LEEWAY_S > now) return { ok: false, reason: 'not_yet_valid' };
  if (typeof payload.iat === 'number' && payload.iat - LEEWAY_S > now) return { ok: false, reason: 'not_yet_valid' };

  let jwk;
  try {
    jwk = await findKey(cfg.team, header.kid);
  } catch {
    return { ok: false, reason: 'jwks_unavailable' };
  }
  if (!jwk) return { ok: false, reason: 'unknown_kid' };

  let valid = false;
  try {
    const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
  } catch {
    valid = false;
  }
  if (!valid) return { ok: false, reason: 'bad_signature' };

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email || !cfg.emails.includes(email)) return { ok: false, reason: 'email_not_allowed' };

  return { ok: true, email };
}
