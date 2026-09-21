// /sitemap.xml -- hand-rolled, same as jeyanandan.com, so package.json keeps
// exactly one dependency and `npm ci` against the committed lockfile stays
// valid.
//
// WHAT GOES IN IT. The home page, the blog index, and indexablePosts from
// src/pages/_posts.js: listed and never a draft, even in a review build.
//
// WHAT STAYS OUT, on purpose:
//   /mp/     the accounting area. It carries its own noindex meta and is not
//            advertised anywhere; a sitemap is advertising.
//   /demo/, /light, /samples/   legacy pages carried over verbatim from the
//            live bundle. They keep serving; they are simply not promoted.
// Nothing may go in STATIC_ROUTES that does not exist in dist/.

import { indexablePosts } from './_posts.js';

const SITE = 'https://www.obsidiandelta.com';

const STATIC_ROUTES = ['/', '/blog/'];

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
  const entries = [
    ...STATIC_ROUTES.map((path) => ({ loc: SITE + path, lastmod: null })),
    ...indexablePosts.map((p) => ({ loc: SITE + '/blog/' + p.slug + '/', lastmod: day(p.date) })),
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
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
