// /sitemap.xml -- hand-rolled rather than @astrojs/sitemap on purpose.
//
// robots.txt has advertised this URL since the site went up, and until
// 2026-09-19 nothing served it: the request soft-404'd to the home page with a
// 200, which is worse than having no sitemap line at all. The obvious fix is
// the official integration, but package.json pins exactly one dependency and
// the deploy runs `npm ci` against a committed package-lock.json -- adding an
// integration means a lockfile that no longer matches, and `npm ci` fails hard
// on that. This endpoint needs nothing that is not already installed, and it
// reads the same post folder the blog index reads, with the same draft filter,
// so the two cannot drift apart.
//
// Astro emits an endpoint whose filename carries an extension at that exact
// path, so this builds to dist/sitemap.xml.
//
// STATIC_ROUTES is the hand-maintained half, and it is the half that rots: a
// route listed here that no longer builds is a 404 advertised to every search
// engine. /important/, /privacy/ and /auth-callback/ were taken off the site
// on 2026-09-20 and came out of this list in the same change. Nothing may go
// back in here that does not exist in dist/.

const SITE = 'https://jeyanandan.com';

const STATIC_ROUTES = ['/', '/blog/'];

const modules = import.meta.glob('../posts/*.md', { eager: true });

const day = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export async function GET() {
  const posts = Object.entries(modules)
    .map(([file, mod]) => ({
      slug: file.split('/').pop().replace(/\.md$/, ''),
      date: mod.frontmatter && mod.frontmatter.date,
      draft: mod.frontmatter && mod.frontmatter.draft,
    }))
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const entries = [
    ...STATIC_ROUTES.map((path) => ({ loc: SITE + path, lastmod: null })),
    ...posts.map((p) => ({ loc: SITE + '/blog/' + p.slug + '/', lastmod: day(p.date) })),
  ];

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map(
        (e) =>
          '  <url>\n' +
          '    <loc>' + escape(e.loc) + '</loc>\n' +
          (e.lastmod ? '    <lastmod>' + e.lastmod + '</lastmod>\n' : '') +
          '  </url>\n',
      )
      .join('') +
    '</urlset>\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
