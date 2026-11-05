// POST /api/preview-signup -- the "join the preview list" form on /preview/ (2026-11-05).
// Same origin as the page, so no CORS. JSON in -> JSON out; a plain form post
// (no JavaScript) gets a small bilingual page back. Stores one row in D1
// (binding PREVIEW_DB); never sends email. See lib-functions/preview.js.
import { validate, allowedOrigin, ensureSchema, underRateLimit, store, readBody, esc } from '../../lib-functions/preview.js';

const SEC = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...SEC, 'Content-Type': 'application/json; charset=utf-8' } });

function page(status, ok, errors = []) {
  const en = ok
    ? "You're on the preview list. Thank you. We will write only about the preview."
    : status === 429 ? 'Too many tries from here. Please wait a little and try again.'
    : status === 503 ? 'The list is not open yet. Please try again soon.'
    : 'Something is missing: ' + errors.join(', ') + '. Please go back and check the form.';
  const fr = ok
    ? 'Vous êtes sur la liste d’aperçu. Merci. Nous vous écrirons seulement au sujet de l’aperçu.'
    : status === 429 ? 'Trop d’essais d’ici. Attendez un peu, puis réessayez.'
    : status === 503 ? 'La liste n’est pas encore ouverte. Réessayez bientôt.'
    : 'Il manque quelque chose : ' + errors.join(', ') + '. Revenez en arrière et vérifiez le formulaire.';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Preview list · DAX Foundation</title><style>:root{color-scheme:dark}body{margin:0;background:#0a0a0a;color:#e8e8e8;font:1.0625rem/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}main{max-width:36rem;margin:0 auto;padding:3rem 1rem}p{margin:0 0 1rem}.fr{color:#8c8c8c}a{color:inherit}</style></head><body><main><p><strong>${esc(en)}</strong></p><p class="fr" lang="fr">${esc(fr)}</p><p><a href="/preview/">&larr; Back to the preview · Retour à l’aperçu</a></p></main></body></html>`;
  return new Response(html, { status, headers: { ...SEC, 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (!allowedOrigin(origin, env)) return json({ ok: false, error: 'origin_not_allowed' }, 403);

  const parsed = await readBody(request);
  if (parsed.tooBig) return json({ ok: false, error: 'too_large' }, 413);
  const answer = (status, data) => (parsed.form ? page(status, !!data.ok, data.errors || []) : json(data, status));

  const v = validate(parsed.body);
  if (!v.ok) return answer(400, { ok: false, error: 'invalid', errors: v.errors });
  if (v.spam) return answer(200, { ok: true });

  const db = env.PREVIEW_DB;
  if (!db) return answer(503, { ok: false, error: 'unavailable' });
  try {
    await ensureSchema(db);
    const ip = request.headers.get('CF-Connecting-IP') || '';
    if (!(await underRateLimit(db, ip, env))) return answer(429, { ok: false, error: 'rate_limited' });
    await store(db, v.entry);
  } catch (e) {
    console.log('preview-signup store failed', String(e && e.message || e).slice(0, 200));
    return answer(503, { ok: false, error: 'unavailable' });
  }
  return answer(200, { ok: true });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { ...SEC, Allow: 'POST, OPTIONS' } });
}
