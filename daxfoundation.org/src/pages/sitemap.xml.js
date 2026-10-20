// /sitemap.xml -- hand-rolled, same shape as views/jeyanandan/src/pages/
// sitemap.xml.js (no @astrojs/sitemap: package.json pins its dependencies and
// `npm ci` fails on a lockfile that no longer matches). Astro emits an endpoint
// whose filename carries an extension at that exact path, so this builds to
// dist/sitemap.xml.
//
// 2026-10-18 (PUBLISH-1018 D3): this replaces the hand-maintained
// public/sitemap.xml, which had rotted to 14 of 46 pages. It now derives from
// three sources that cannot drift from the site:
//   1. every built Astro route (import.meta.glob of *.astro), minus 404,
//      underscore-prefixed partials and dynamic ([..]) routes;
//   2. every published post from _posts.js, under /writing/<slug>/;
//   3. every on-domain URL in the library registry (src/data/library.js) --
//      the showcases, kits, editions, the six family pages and the player --
//      with fragments and query strings stripped and the set de-duplicated.
// External URLs (the Newton artifact, GitHub) and the skill zip are left out:
// a sitemap advertises this site's own pages.

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { posts } from './_posts.js';
import { library } from '../data/library.js';
import samplesData from '../data/metadax-samples.json';

const SITE = 'https://daxfoundation.org';

const day = (value) => {
  if (!value) return null;
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

// 1. Every built Astro route.
const routeModules = import.meta.glob('./**/*.astro', { eager: true });
const routePaths = Object.keys(routeModules)
  .map((f) => f.replace(/^\.\//, '').replace(/\.astro$/, ''))
  .filter((f) => !f.startsWith('404'))
  .filter((f) => !f.split('/').some((seg) => seg.startsWith('_')))
  .filter((f) => !f.includes('['))
  .map((f) => (f === 'index' ? '/' : '/' + f.replace(/\/index$/, '') + '/'));

// 2. The published posts, under /writing/<slug>/.
const postEntries = posts.map((p) => ({
  path: '/writing/' + p.slug + '/',
  lastmod: day(p.updated) || day(p.date),
}));

// 3. On-domain registry URLs plus the player page, fragments/queries stripped.
const registryPaths = library
  .filter((e) => !e.external)
  .flatMap((e) => [e.url, e.play])
  .filter(Boolean)
  .map((u) => u.split('#')[0].split('?')[0])
  .filter((u) => u.startsWith('/'));

// 4. One page per sample at /metadax/samples/<id>/ (the [id].astro route is a
// dynamic route, so it is skipped by (1) above). Skip any id that instead has a
// static folder in public/metadax/samples/ -- that page is advertised through
// the registry, not from here.
let staticSampleIds = new Set();
try {
  const dir = fileURLToPath(new URL('../../public/metadax/samples', import.meta.url));
  staticSampleIds = new Set(
    readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name),
  );
} catch {
  // no static samples folder; nothing to skip
}
const samplePaths = (samplesData.samples || [])
  .filter((s) => !staticSampleIds.has(s.id))
  .map((s) => '/metadax/samples/' + s.id + '/');

export async function GET() {
  const lastmodByPath = new Map(postEntries.map((p) => [p.path, p.lastmod]));
  const paths = new Set([
    ...routePaths,
    ...postEntries.map((p) => p.path),
    ...registryPaths,
    ...samplePaths,
  ]);

  const entries = Array.from(paths)
    .sort()
    .map((path) => ({ loc: SITE + path, lastmod: lastmodByPath.get(path) || null }));

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
