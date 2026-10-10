import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = join(process.cwd(), 'dist');
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2' };

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
const base = `http://127.0.0.1:${port}`;

const pages = [
  { name: 'tutors-desk', url: `${base}/metadax/showcases/tutors-desk/` },
  { name: 'samples',     url: `${base}/metadax/samples/` },
];
const sizes = [ { label: 'desktop', w: 1280, h: 900 }, { label: 'mobile', w: 390, h: 844 } ];

const browser = await chromium.launch();
let failures = 0;
for (const pg of pages) {
  for (const sz of sizes) {
    const ctx = await browser.newContext({ viewport: { width: sz.w, height: sz.h } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    const tag = `${pg.name} @ ${sz.label} (${sz.w}px)`;
    try {
      await page.goto(pg.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(400);
      await page.screenshot({ path: `/tmp/shots/${pg.name}-${sz.label}.png`, fullPage: true });
    } catch (e) {
      failures++; console.log(`FAIL ${tag} — navigation: ${e.message.split('\n')[0]}`);
      await ctx.close(); continue;
    }
    const results = [];

    // horizontal scroll
    const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    results.push(['no-horizontal-scroll', !hscroll]);

    if (pg.name === 'tutors-desk') {
      // step through all 3 panels, assert each renders its hallmark element
      const panelChecks = [
        ['.note', 'Next panel →'],
        ['.report', 'Next panel →'],
        ['.coach-out .moves li', 'Start over'],
      ];
      // click through using the step nav buttons (3 of them)
      const navCount = await page.locator('#stepnav button').count();
      results.push(['3-step-nav-buttons', navCount === 3]);
      let ok = true;
      for (let i = 0; i < 3; i++) {
        await page.locator('#stepnav button').nth(i).click();
        const sel = panelChecks[i][0];
        const n = await page.locator(sel).count();
        if (n < 1) { ok = false; results.push([`panel-${i+1}-renders (${sel})`, false]); }
        else results.push([`panel-${i+1}-renders`, true]);
      }
      // selector: 5 situation cards, each clickable -> response renders
      const sitCount = await page.locator('.sit-btn').count();
      results.push(['5-situation-cards', sitCount === 5]);
      for (let i = 0; i < sitCount; i++) {
        await page.locator('.sit-btn').nth(i).click();
        const resp = await page.locator('.sit-response .sr-in .sr-moves li').count();
        results.push([`situation-${i+1}-response`, resp >= 2]);
      }
      // try-it link to repo prompts
      const href = await page.locator('#try-link').getAttribute('href');
      results.push(['tryit-link-to-repo', !!href && href.includes('daxfoundation/metadax') && href.includes('prompts')]);
    } else {
      // samples page: the 4th "For tutors" card links to the showcase
      const card = await page.locator('.showcase-card a[href="/metadax/showcases/tutors-desk/"]').count();
      results.push(['tutors-desk-card-present', card === 1]);
      const cards = await page.locator('.showcase-cards .showcase-card').count();
      results.push(['four-showcase-cards', cards === 4]);
      const noteOk = await page.locator('.showcase-note').count();
      results.push(['honesty-note-present', noteOk === 1]);
    }

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
}
await browser.close();
server.close();
console.log(failures ? `\nTOTAL FAILURES: ${failures}` : '\nALL PASS');
process.exit(failures ? 1 : 0);
