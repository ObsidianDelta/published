// One-off: screenshot the Tamil chicken curry showcase (three stations, the
// toggle in both languages, the adult page, the recipe card) and rasterise the
// OG svg to png. Serves dist/ and drives it with Playwright/Chromium.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..',
  'state', 'metadax', 'cultural', 'tamil-chicken-curry', 'shots');
fs.mkdirSync(out, { recursive: true });
const MIME = { '.html':'text/html', '.js':'text/javascript', '.json':'application/json',
  '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(root, p);
  fs.readFile(fp, (e, data) => {
    if (e) { res.statusCode = 404; res.end('404'); return; }
    res.setHeader('content-type', MIME[path.extname(fp)] || 'application/octet-stream');
    res.end(data);
  });
});

const port = await new Promise(r => server.listen(0, () => r(server.address().port)));
const base = `http://127.0.0.1:${port}`;
const { chromium } = await import('playwright');
const browser = await chromium.launch();

async function shot(name, { w=390, h=800, fullPage=false, actions } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(`${base}/metadax/showcases/tamil-chicken-curry/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#panel .card', { timeout: 15000 });
  if (actions) await actions(page);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, name), fullPage });
  console.log('wrote', name, `(${w}x${h})`);
  // horizontal-scroll check at this width
  const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (over) console.log('  !! horizontal overflow at', w);
  await page.close();
}

await shot('station1-where-it-comes-from.png');
await shot('station2-how-to-make-it.png', { actions: p => p.click('nav.stations button[data-st="1"]') });
await shot('station3-what-it-means.png',   { actions: p => p.click('nav.stations button[data-st="2"]') });
await shot('toggle-english.png');
await shot('toggle-tamil.png', { actions: p => p.click('#lang-ta') });
await shot('adult-page.png', { h: 900, actions: async p => { await p.click('a[href="#adult"]'); await p.waitForTimeout(400); } });
await shot('recipe-card.png', { h: 1000, actions: async p => { await p.click('a[href="#card"]'); await p.waitForTimeout(400); } });
// desktop station shot (shows the 3D stage column)
await shot('desktop-station1.png', { w: 1100, h: 760 });

// rasterise OG svg -> png
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(`${base}/og/tamil-chicken-curry.svg`, { waitUntil: 'networkidle' });
  const buf = await page.screenshot();
  for (const dest of [
    path.join(root, 'og', 'tamil-chicken-curry.png'),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og', 'tamil-chicken-curry.png'),
  ]) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, buf); }
  console.log('wrote og png');
  await page.close();
} catch (e) { console.log('og png failed:', e.message); }

await browser.close();
server.close();
console.log('done');
