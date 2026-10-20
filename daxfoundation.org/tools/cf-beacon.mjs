// Cloudflare Web Analytics for daxfoundation.org (cookieless: no client-side
// state, no fingerprinting). Run after `astro build`: adds the beacon before
// </body> in every HTML file in dist/, so the static pages copied from public/
// (showcases, play, samples) are counted as well as the Astro routes. No
// dependencies, and nothing in astro.config.mjs changes. The token is public
// by design (it ships in every page); site and token are recorded in Skippy
// state/analytics/sites.json. 2026-10-20 (analytics phase 2).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const TOKEN = '2089120cf09c4bbcae458339adf4d528';
const TAG = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${TOKEN}"}'></script>`;
const root = process.argv[2] || 'dist';

let added = 0;
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { await walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    const html = await readFile(p, 'utf8');
    if (html.includes('static.cloudflareinsights.com/beacon.min.js')) continue;
    const i = html.lastIndexOf('</body>');
    if (i < 0) continue;
    await writeFile(p, html.slice(0, i) + TAG + '\n' + html.slice(i));
    added++;
  }
}
await walk(root);
console.log(`cf-beacon: added to ${added} HTML files in ${root}/`);
