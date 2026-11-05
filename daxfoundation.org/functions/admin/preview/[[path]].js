// /admin/preview/* -- the preview list's private admin (2026-11-05), for Jason only.
//
// Two locks, either one enough to keep it shut:
//   1. a Cloudflare Access application on daxfoundation.org/admin/preview (Google
//      sign-in, Jason's two addresses; made by .github/workflows/setup-preview-list.yml);
//   2. this function verifies the Access JWT itself (lib-functions/access.js, the
//      approve.daxfoundation.org verifier): missing ACCESS_AUD / team / emails => 503.
//
//   GET  /admin/preview/             the list, newest first, with a count
//   GET  /admin/preview/export.csv   every entry as CSV (download)
//   GET  /admin/preview/export.json  every entry as JSON
//   POST /admin/preview/delete       form field id=<entry id>: removes one entry (a removal request)
import { verifyAccess } from '../../../lib-functions/access.js';
import { ensureSchema, toCsv, esc } from '../../../lib-functions/preview.js';

const DEFAULTS = {
  ACCESS_TEAM_DOMAIN: 'obsidiandelta.cloudflareaccess.com',
  ALLOWED_EMAILS: 'jason.jeyanandan@gmail.com,jason@obsidiandelta.com',
};

const SEC = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
};

const text = (body, status, type = 'text/plain; charset=utf-8', extra = {}) =>
  new Response(body, { status, headers: { ...SEC, 'Content-Type': type, ...extra } });

export async function onRequest({ request, env, params }) {
  const cfg = { ...DEFAULTS, ...Object.fromEntries(Object.entries(env).filter(([k]) => k in DEFAULTS || k === 'ACCESS_AUD')) };
  const auth = await verifyAccess(request, cfg);
  if (!auth.ok) return text(auth.reason === 'not_configured' ? 'Not configured.' : 'Forbidden.', auth.reason === 'not_configured' ? 503 : 403);

  const db = env.PREVIEW_DB;
  if (!db) return text('Storage not bound.', 503);
  await ensureSchema(db);

  const seg = Array.isArray(params.path) ? params.path.join('/') : String(params.path || '');
  const method = request.method;

  if (method === 'POST' && seg === 'delete') {
    const origin = request.headers.get('Origin');
    if (origin && new URL(origin).host !== new URL(request.url).host) return text('Bad origin.', 403);
    const form = new URLSearchParams(await request.text());
    const id = String(form.get('id') || '');
    if (!/^[0-9a-f-]{36}$/.test(id)) return text('Bad id.', 400);
    const r = await db.prepare('DELETE FROM preview_signups WHERE id = ?').bind(id).run();
    console.log('preview admin delete', auth.email, id, r.meta && r.meta.changes);
    return new Response(null, { status: 303, headers: { ...SEC, Location: '/admin/preview/?deleted=' + ((r.meta && r.meta.changes) || 0) } });
  }
  if (method !== 'GET') return text('Method not allowed.', 405);

  const { results = [] } = await db.prepare('SELECT * FROM preview_signups ORDER BY created_at DESC').all();
  if (seg === 'export.csv') {
    return text(toCsv(results), 200, 'text/csv; charset=utf-8', { 'Content-Disposition': 'attachment; filename="dax-preview-list.csv"' });
  }
  if (seg === 'export.json') {
    return text(JSON.stringify({ count: results.length, entries: results }, null, 2), 200, 'application/json; charset=utf-8');
  }
  if (seg !== '') return text('Not found.', 404);

  const byRole = {};
  for (const r of results) byRole[r.role] = (byRole[r.role] || 0) + 1;
  const deleted = new URL(request.url).searchParams.get('deleted');
  const rows = results.map((r) => `<tr><td>${esc(r.created_at.slice(0, 16).replace('T', ' '))}</td><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${esc(r.role)}</td><td>${esc(r.country)}</td><td>${esc(r.lang)}</td><td class="m">${esc(r.message)}</td><td><form method="post" action="/admin/preview/delete"><input type="hidden" name="id" value="${esc(r.id)}"><button>Remove</button></form></td></tr>`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Preview list (private)</title>
<style>:root{color-scheme:dark}body{margin:0;background:#0a0a0a;color:#e8e8e8;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}main{padding:1.5rem 1rem;max-width:80rem;margin:0 auto}a{color:#b9a7ff}table{border-collapse:collapse;width:100%;font-size:14px}th,td{border-bottom:1px solid #222;padding:.4rem .5rem;text-align:left;vertical-align:top}.m{max-width:24rem;white-space:pre-wrap}.wrap{overflow-x:auto}button{background:#1e1e1e;color:#e8e8e8;border:1px solid #333;border-radius:4px;padding:.2rem .5rem;cursor:pointer}.note{color:#8c8c8c}</style></head>
<body><main><h1>Preview list <span class="note">(private)</span></h1>
<p>${results.length} ${results.length === 1 ? 'entry' : 'entries'}${Object.keys(byRole).length ? ' · ' + Object.entries(byRole).map(([k, n]) => esc(k) + ' ' + n).join(' · ') : ''}. Signed in as ${esc(auth.email)}.</p>
${deleted !== null ? `<p class="note">Removed: ${esc(deleted)}.</p>` : ''}
<p><a href="/admin/preview/export.csv">Download CSV</a> · <a href="/admin/preview/export.json">JSON</a></p>
<p class="note">Nobody on this list has been emailed. Sending anything to them is Jason's call. A removal request: find the address and press Remove.</p>
<div class="wrap"><table><thead><tr><th>Joined (UTC)</th><th>Name</th><th>Email</th><th>Role</th><th>Country</th><th>Lang</th><th>Message</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="note">No entries yet.</td></tr>'}</tbody></table></div>
</main></body></html>`;
  return text(html, 200, 'text/html; charset=utf-8');
}
