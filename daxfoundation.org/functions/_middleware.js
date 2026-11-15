// Veil (2026-11-15, ask CLOUD-1794784085474-D6VU). Jason: "Take daxfoundation.org
// down ... put back up the gift, and tell everything not to index."
//
// This root middleware runs for EVERY request to the daxfoundation-org Pages
// project (see public/_routes.json `include: ["/*"]`). It:
//   - keeps /gift/ and everything the gift needs working exactly as before
//     (the gift is a self-contained SPA under /gift/**; its only out-of-tree
//     dependency is /favicon.svg, and crawlers need /robots.txt);
//   - redirects every other path with 302 -> /gift/;
//   - stamps X-Robots-Tag: noindex, nofollow on every response (redirects AND
//     the gift's own pages/assets), so nothing on the host is indexable.
//
// Why a Pages Function and not _redirects: a `/*` splat in _redirects cannot
// carve out the /gift/** subtree (rules are first-match with no pass-through
// action), and redirect-vs-static-asset precedence on Pages is version-
// dependent. A Function is the one layer that deterministically runs before
// static-asset serving AND can both redirect and pass-through. Cloudflare also
// documents that `_redirects` rules are NOT applied to requests served by a
// Pages Function, so the Function is unambiguously the higher-precedence layer.
//
// og tags are untouched: link previews still unfurl. noindex only tells search
// engines not to index; it does not stop social unfurl crawlers from reading
// the page's Open Graph tags. The per-share OG card Function (functions/gift/
// index.js) still runs for /gift/ via context.next().

const NOINDEX = 'noindex, nofollow';

/**
 * True for paths that must keep being served (not redirected):
 *   - the gift SPA and all of its assets under /gift/** (plus the bare /gift);
 *   - /favicon.svg, the only root asset the gift page references;
 *   - /robots.txt, which crawlers must be able to read as "Disallow: /".
 * Everything else is redirected to /gift/.
 */
export function isAllowed(pathname) {
  return (
    pathname === '/gift' ||
    pathname.startsWith('/gift/') ||
    pathname === '/favicon.svg' ||
    pathname === '/robots.txt'
  );
}

export async function onRequest(context) {
  const { request } = context;
  const { pathname } = new URL(request.url);

  if (!isAllowed(pathname)) {
    // 302 (temporary) so the veil can be lifted without a cached permanent redirect.
    return new Response(null, {
      status: 302,
      headers: { Location: '/gift/', 'X-Robots-Tag': NOINDEX },
    });
  }

  // Serve the gift (static asset or the gift OG Function), then stamp noindex.
  const res = await context.next();
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', NOINDEX);
  return out;
}
