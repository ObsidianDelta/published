// Every page links the Privacy and Security Policies (2026-11-05, Jason: "have that
// privacy policy and security policy ready before anything launches").
//
// Pages built from src/layouts/ already carry the links in their footer. The static
// pages copied from public/ (showcases, play, samples, the gift studio) do not, so after
// `astro build` this adds one small bilingual line before </body> on every HTML file in
// dist/ that does not link /privacy/ yet. Run after tools/cf-beacon.mjs. No dependencies.
// The deploy gate (deploy-daxfoundation.yml) fails the release if any page lacks the link.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const LINE =
  '<p class="od-policy-links" style="font:13px/1.5 -apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Arial,sans-serif;text-align:center;margin:24px 16px;opacity:.75">' +
  '<a href="/privacy/" style="color:inherit">Privacy · Confidentialité</a> · ' +
  '<a href="/security/" style="color:inherit">Security · Sécurité</a></p>';
const root = process.argv[2] || 'dist';

let added = 0;
let kept = 0;
async function walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) { await walk(p); continue; }
    if (!e.name.endsWith('.html')) continue;
    const html = await readFile(p, 'utf8');
    if (html.includes('href="/privacy/"')) { kept++; continue; }
    const i = html.lastIndexOf('</body>');
    const out = i < 0 ? html + '\n' + LINE + '\n' : html.slice(0, i) + LINE + '\n' + html.slice(i);
    await writeFile(p, out);
    added++;
  }
}
await walk(root);
console.log(`policy-links: added to ${added} page(s), ${kept} already linked`);
