// The preview list (2026-11-05): validation, spam traps, CSV safety, and the two
// Pages Functions against a D1 stand-in built on node:sqlite.
// Run: node --test views/daxfoundation/tests/preview/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { validate, toCsv, allowedOrigin, RATE_PER_HOUR } from '../../lib-functions/preview.js';
import { onRequestPost } from '../../functions/api/preview-signup.js';
import { onRequest as admin } from '../../functions/admin/preview/[[path]].js';

function fakeD1() {
  const db = new DatabaseSync(':memory:');
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    run: async () => { const r = db.prepare(sql).run(...args); return { meta: { changes: Number(r.changes) } }; },
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
  });
  return { _db: db, prepare: (sql) => stmt(sql), batch: async (list) => { for (const s of list) await s.run(); } };
}

const good = { name: 'Test Person', email: 'Test@Example.invalid', role: 'teacher', country: 'Canada', message: 'hi', consent: 'yes' };

const post = (body, { type = 'application/json', origin = 'https://daxfoundation.org', ip = '203.0.113.9' } = {}) =>
  new Request('https://daxfoundation.org/api/preview-signup', {
    method: 'POST',
    headers: { 'Content-Type': type, Origin: origin, 'CF-Connecting-IP': ip },
    body: type === 'application/json' ? JSON.stringify(body) : new URLSearchParams(body).toString(),
  });

test('validate: a good entry passes and is normalised', () => {
  const v = validate(good);
  assert.equal(v.ok, true);
  assert.equal(v.entry.email, 'test@example.invalid');
  assert.equal(v.entry.lang, 'en');
});

test('validate: every required field is named when missing', () => {
  const v = validate({});
  assert.equal(v.ok, false);
  assert.deepEqual(v.errors, ['name', 'email', 'role', 'country', 'consent']);
  assert.deepEqual(validate({ ...good, role: 'admin' }).errors, ['role']);
  assert.deepEqual(validate({ ...good, consent: '' }).errors, ['consent']);
  assert.deepEqual(validate({ ...good, email: 'not an email' }).errors, ['email']);
});

test('validate: honeypot and too-fast fills are treated as spam', () => {
  assert.equal(validate({ ...good, website: 'http://spam' }).spam, true);
  assert.equal(validate({ ...good, t: String(Date.now() - 100) }).spam, true);
  assert.equal(validate({ ...good, t: String(Date.now() - 60000) }).spam, undefined);
});

test('origin: only the site itself', () => {
  assert.equal(allowedOrigin('https://daxfoundation.org'), true);
  assert.equal(allowedOrigin('https://abc.daxfoundation-org.pages.dev'), true);
  assert.equal(allowedOrigin('https://evil.example'), false);
  assert.equal(allowedOrigin('https://daxfoundation.org.evil.example'), false);
});

test('csv: quotes, newlines and formula cells are made safe', () => {
  const csv = toCsv([{ name: '=HYPERLINK("x")', message: 'a,b\n"c"', email: 'e@x.y' }]);
  assert.match(csv, /"'=HYPERLINK\(""x""\)"/);
  assert.match(csv, /"a,b\n""c"""/);
});

test('signup: stores one row, upserts on the same email, no email sent', async () => {
  const env = { PREVIEW_DB: fakeD1() };
  let r = await onRequestPost({ request: post(good), env });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
  r = await onRequestPost({ request: post({ ...good, name: 'Renamed', message: '' }), env });
  assert.equal(r.status, 200);
  const rows = env.PREVIEW_DB._db.prepare('SELECT * FROM preview_signups').all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Renamed');
  assert.equal(rows[0].message, 'hi');
  assert.equal('ip' in rows[0], false);
});

test('signup: spam answers ok and stores nothing; bad origin 403; bad body 400; no DB 503', async () => {
  const env = { PREVIEW_DB: fakeD1() };
  assert.equal((await onRequestPost({ request: post({ ...good, website: 'x' }), env })).status, 200);
  assert.equal((await onRequestPost({ request: post(good, { origin: 'https://evil.example' }), env })).status, 403);
  const bad = await onRequestPost({ request: post({ ...good, email: '' }), env });
  assert.equal(bad.status, 400);
  assert.deepEqual((await bad.json()).errors, ['email']);
  assert.equal((await onRequestPost({ request: post(good), env: {} })).status, 503);
});

test('signup: a plain form post gets an HTML page back', async () => {
  const env = { PREVIEW_DB: fakeD1() };
  const r = await onRequestPost({ request: post(good, { type: 'application/x-www-form-urlencoded' }), env });
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /text\/html/);
  assert.match(await r.text(), /on the preview list/);
});

test('signup: rate limit per IP per hour', async () => {
  const env = { PREVIEW_DB: fakeD1() };
  let last;
  for (let i = 0; i <= RATE_PER_HOUR; i++) {
    last = await onRequestPost({ request: post({ ...good, email: `t${i}@example.invalid` }), env });
  }
  assert.equal(last.status, 429);
  const other = await onRequestPost({ request: post({ ...good, email: 'z@example.invalid' }, { ip: '198.51.100.1' }), env });
  assert.equal(other.status, 200);
});

test('admin: closed without Access configuration or token', async () => {
  const env = { PREVIEW_DB: fakeD1() };
  const req = new Request('https://daxfoundation.org/admin/preview/');
  assert.equal((await admin({ request: req, env, params: {} })).status, 503);
  const env2 = { ...env, ACCESS_AUD: 'a'.repeat(64) };
  assert.equal((await admin({ request: req, env: env2, params: {} })).status, 403);
  const forged = new Request('https://daxfoundation.org/admin/preview/export.csv', { headers: { 'Cf-Access-Jwt-Assertion': 'x.y.z' } });
  assert.equal((await admin({ request: forged, env: env2, params: { path: ['export.csv'] } })).status, 403);
});
