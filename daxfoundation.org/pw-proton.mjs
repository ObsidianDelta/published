// Playwright smoke test for The Proton Mill hosted showcase.
// Serves views/daxfoundation/public, loads the page at desktop (1280) and phone
// (390), steps through every scene + watch step, screenshots each to /tmp/shots,
// and asserts: WebGL canvas renders, 0 console/page errors, no horizontal scroll,
// 5 scene-nav buttons, honesty footer present.
//
// Run (fresh microvm): browsers at ~/.cache/ms-playwright, system libs staged in
// /tmp/sysroot — set LD_LIBRARY_PATH to the sysroot lib dirs before launching:
//   LD_LIBRARY_PATH=/tmp/sysroot/usr/lib/x86_64-linux-gnu:/tmp/sysroot/lib/x86_64-linux-gnu \
//     node pw-proton.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = join(process.cwd(), 'public');
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2' };

await mkdir('/tmp/shots', { recursive: true });
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    let fp = join(ROOT, p);
    try { if ((await stat(fp)).isDirectory()) fp = join(fp, 'index.html'); } catch {}
    const data = await readFile(fp);
    res.writeHead(200, { 'content-type': TYPES[extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) { res.writeHead(404); res.end('404'); }
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/metadax/showcases/proton-mill/`;

const sizes = [ { label: 'desktop', w: 1280, h: 900 }, { label: 'mobile', w: 390, h: 844 } ];
const browser = await chromium.launch();
let failures = 0;
const descLines = [];

for (const sz of sizes) {
  const ctx = await browser.newContext({ viewport: { width: sz.w, height: sz.h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  const tag = `proton-mill @ ${sz.label} (${sz.w}px)`;
  const results = [];
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(900); // let three.js boot + first frame
  } catch (e) { failures++; console.log(`FAIL ${tag} — nav: ${e.message.split('\n')[0]}`); await ctx.close(); continue; }

  // WebGL canvas present and engine booted
  const hasCanvas = await page.locator('#stage canvas').count();
  results.push(['webgl-canvas-present', hasCanvas === 1]);
  const engineOk = await page.evaluate(() => !!(window.Stage && window.Stage.ok));
  results.push(['engine-ok', engineOk]);

  // 5 scene-nav buttons
  const sceneBtns = await page.locator('#scenes button[data-scene]').count();
  results.push(['5-scene-nav-buttons', sceneBtns === 5]);

  // honesty footer (textContent, not innerText: the footer is rendered and
  // visible — confirmed via computed style + geometry — but headless innerText
  // can return empty; textContent reflects the real DOM text)
  const footerOk = await page.locator('.foot').textContent();
  results.push(['honesty-footer', (footerOk || '').includes('Model-generated example; reviewed for safety, not certified.')]);

  // step through every scene + every watch step, screenshot each
  for (let sc = 0; sc < sceneBtns; sc++) {
    await page.locator(`#scenes button[data-scene="${sc}"]`).click();
    await page.waitForTimeout(500);
    let step = 1;
    while (true) {
      const label = `s${sc+1}-step${step}-${sz.label}`;
      await page.screenshot({ path: `/tmp/shots/proton-${label}.png` });
      const sayTxt = (await page.locator('.say').textContent().catch(() => '') || '').replace(/\s+/g, ' ').trim();
      if (sz.label === 'desktop') descLines.push(`${label}: ${sayTxt}`);
      const next = page.locator('.btn.primary[data-step="1"]');
      const disabled = await next.getAttribute('disabled').catch(() => 'yes');
      if (disabled !== null) break; // Next is disabled => last step
      await next.click();
      await page.waitForTimeout(450);
      step++;
      if (step > 8) break; // safety
    }
    results.push([`scene-${sc+1}-stepped`, true]);
  }

  // no horizontal scroll (check after interaction)
  const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  results.push(['no-horizontal-scroll', !hscroll]);
  results.push(['no-console-page-errors', errs.length === 0]);

  const bad = results.filter(r => !r[1]);
  if (bad.length || errs.length) {
    failures++;
    console.log(`FAIL ${tag}`);
    bad.forEach(b => console.log('   x ' + b[0]));
    errs.forEach(e => console.log('   ! ' + e));
  } else {
    console.log(`PASS ${tag}  (${results.length} checks)`);
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log('\n--- step index (desktop) ---');
descLines.forEach(l => console.log(l));
console.log(failures ? `\nTOTAL FAILURES: ${failures}` : '\nALL PASS');
process.exit(failures ? 1 : 0);
