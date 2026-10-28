// Deploy gate: every link on every built page must go somewhere real.
// Added 2026-10-27 after 18 "Want to try it?" links shipped with no href: Chapter.astro read x.href
// while site-map.json stores `path`, and nothing checked the built HTML for it (site-cohesion.test.mjs
// only sees anchors that already have an href, and runs only in explain-preview.yml).
// Fails (exit 1) on: an <a> with no href, an empty href, or an internal href whose page is not in dist/.
// Usage: node tools/check-links.mjs [distDir] [--allow-missing /path ...]   (run from views/daxfoundation after `npm run build`)
//   --allow-missing: an internal file the workflow adds after the build (the preview has no skill zip). Production passes none.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const args = process.argv.slice(2);
const allowMissing = new Set();
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--allow-missing') allowMissing.add(args[++i]);
  else positional.push(args[i]);
}
const dist = positional[0] || 'dist';
const pages = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith('.html')) pages.push(p);
  }
})(dist);

const exists = (path) => {
  const clean = decodeURIComponent(path.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return existsSync(join(dist, 'index.html'));
  const p = join(dist, clean);
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html'))) || existsSync(p + '.html');
};

const problems = [];
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const page = '/' + relative(dist, file).replace(/index\.html$/, '');
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const attrs = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
    const h = attrs.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/);
    if (!h) { problems.push(`${page}: link with no href: "${text}"`); continue; }
    const href = (h[2] ?? h[3] ?? h[4] ?? '').trim();
    if (href === '') { problems.push(`${page}: link with an empty href: "${text}"`); continue; }
    if (href.startsWith('/') && !href.startsWith('//') && !allowMissing.has(href.split('#')[0].split('?')[0]) && !exists(href)) problems.push(`${page}: link to a page that is not built: ${href} ("${text}")`);
  }
}

if (problems.length) {
  console.error(`check-links: ${problems.length} broken link(s) in ${pages.length} pages`);
  for (const p of problems.slice(0, 50)) console.error('  ' + p);
  process.exit(1);
}
console.log(`check-links: ok, ${pages.length} pages, every link has a real destination`);
