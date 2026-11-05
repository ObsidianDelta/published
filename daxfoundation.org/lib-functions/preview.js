/**
 * The preview list (daxfoundation.org/preview/), 2026-11-05.
 *
 * One small module used by two Pages Functions:
 *   functions/api/preview-signup.js      POST, public: validate + store one entry
 *   functions/admin/preview/[[path]].js  GET/POST, private (Cloudflare Access + JWT check): list, CSV, delete
 *
 * Storage: the D1 database bound to the Pages project as PREVIEW_DB (the DAX
 * research database, dax-research), tables preview_signups + preview_rate, made
 * lazily here. Nothing is ever emailed to the people who sign: sending mail needs
 * Jason's word. No IP is stored with an entry; the rate limit keeps only a salted
 * hash of the IP per hour, pruned after two hours.
 *
 * Pure helpers (validate, csv, origin check) are exported for tests/preview/.
 */

export const ROLES = ['learner', 'parent', 'teacher', 'school', 'other'];
export const CONSENT_VERSION = 'preview-v1';
export const LIMITS = { name: 100, email: 254, country: 60, message: 1000, body: 8192 };
export const RATE_PER_HOUR = 5;
export const MIN_FILL_MS = 2500;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

const clean = (v, max) =>
  String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const cleanMessage = (v, max) =>
  String(v == null ? '' : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);

/**
 * Validate one submission. Returns { ok:true, entry } or { ok:false, errors:[field...] },
 * or { ok:true, spam:true } when a bot tripped the honeypot or the timing check
 * (the caller answers exactly as for a real entry and stores nothing).
 */
export function validate(body, now = Date.now()) {
  const b = body && typeof body === 'object' ? body : {};
  if (clean(b.website, 200)) return { ok: true, spam: true };
  const t = Number(b.t);
  if (Number.isFinite(t) && t > 0 && now - t < MIN_FILL_MS) return { ok: true, spam: true };

  const entry = {
    name: clean(b.name, LIMITS.name),
    email: clean(b.email, LIMITS.email).toLowerCase(),
    role: clean(b.role, 20).toLowerCase(),
    country: clean(b.country, LIMITS.country),
    message: cleanMessage(b.message, LIMITS.message),
    lang: clean(b.lang, 5).toLowerCase() === 'fr' ? 'fr' : 'en',
  };
  const consent = ['yes', 'on', 'true', '1'].includes(String(b.consent || '').toLowerCase());
  const errors = [];
  if (!entry.name) errors.push('name');
  if (!EMAIL_RE.test(entry.email)) errors.push('email');
  if (!ROLES.includes(entry.role)) errors.push('role');
  if (entry.country.length < 2) errors.push('country');
  if (!consent) errors.push('consent');
  if (errors.length) return { ok: false, errors };
  return { ok: true, entry };
}

export function allowedOrigin(origin, env = {}) {
  if (!origin) return true; // same-origin form posts from some browsers send none
  let host;
  try { host = new URL(origin).hostname.toLowerCase(); } catch { return false; }
  const extra = String(env.PREVIEW_ORIGINS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (extra.includes(host)) return true;
  return host === 'daxfoundation.org' || host === 'www.daxfoundation.org' ||
    host === 'daxfoundation-org.pages.dev' || host.endsWith('.daxfoundation-org.pages.dev');
}

export async function ensureSchema(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS preview_signups (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      country TEXT NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      lang TEXT NOT NULL DEFAULT 'en',
      consent_version TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS preview_rate (
      bucket TEXT PRIMARY KEY,
      hour TEXT NOT NULL,
      n INTEGER NOT NULL DEFAULT 0
    )`),
  ]);
}

async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** true when this IP is under the hourly limit (and counts this attempt). */
export async function underRateLimit(db, ip, env = {}, now = new Date()) {
  const hour = now.toISOString().slice(0, 13);
  const salt = String(env.RATE_SALT || 'dax-preview-list');
  const bucket = (await sha256hex(`${salt}|${ip || 'none'}|${hour}`)).slice(0, 32);
  const prev = new Date(now.getTime() - 2 * 3600 * 1000).toISOString().slice(0, 13);
  await db.prepare('DELETE FROM preview_rate WHERE hour < ?').bind(prev).run();
  const row = await db
    .prepare('INSERT INTO preview_rate (bucket, hour, n) VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET n = n + 1 RETURNING n')
    .bind(bucket, hour)
    .first();
  return !row || row.n <= RATE_PER_HOUR;
}

/** Insert, or refresh the entry for an email already on the list (never says which). */
export async function store(db, entry, now = new Date()) {
  const ts = now.toISOString();
  const id = crypto.randomUUID();
  await db
    .prepare(`INSERT INTO preview_signups (id, created_at, updated_at, name, email, role, country, message, lang, consent_version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET updated_at = excluded.updated_at, name = excluded.name, role = excluded.role,
        country = excluded.country, message = CASE WHEN excluded.message <> '' THEN excluded.message ELSE preview_signups.message END,
        lang = excluded.lang, consent_version = excluded.consent_version`)
    .bind(id, ts, ts, entry.name, entry.email, entry.role, entry.country, entry.message, entry.lang, CONSENT_VERSION)
    .run();
}

const CSV_COLS = ['created_at', 'updated_at', 'name', 'email', 'role', 'country', 'message', 'lang', 'consent_version', 'id'];

/** RFC 4180 CSV; cells that a spreadsheet would run as a formula are prefixed with '. */
export function toCsv(rows) {
  const cell = (v) => {
    let s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [CSV_COLS.join(','), ...rows.map((r) => CSV_COLS.map((c) => cell(r[c])).join(','))].join('\r\n') + '\r\n';
}

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Read a JSON or urlencoded/multipart body, capped. */
export async function readBody(request) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > LIMITS.body) return { tooBig: true };
  const type = (request.headers.get('content-type') || '').toLowerCase();
  const text = await request.text();
  if (text.length > LIMITS.body) return { tooBig: true };
  if (type.includes('application/json')) {
    try { return { body: JSON.parse(text || '{}'), form: false }; } catch { return { body: {}, form: false }; }
  }
  return { body: Object.fromEntries(new URLSearchParams(text)), form: true };
}
