// walkthrough-shots.mjs — render the "what you'll see" screens for the five
// walkthrough chairs at daxfoundation deploy time, writing PNGs into dist/ so
// the walkthrough figures can show a real screenshot. The pages keep their
// link cards as the caption and fall back to them when a shot is missing, so
// this renderer is best effort: it never has to succeed for the deploy to be
// correct.
//
// It cannot run in the fleet container (no browser). It runs on the GitHub
// Actions runner, after `npm run build`, where chromium is installed. Locally
// the manifest parsing, the route->file mapping and the content types are all
// covered by tools/walkthrough-shots.test.mjs (`node --test`); only the
// chromium pass needs a browser.
//
// Depends on `playwright` only (installed with --no-save on the runner); the
// static file server is node:http + node:fs, no extra deps.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(HERE, '..', 'dist');
const MANIFEST = path.resolve(HERE, '..', 'walkthrough-shots.json');

// --- content types -------------------------------------------------------
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

export function contentType(filePath) {
  return TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

// Map a request URL path to a file under `root`. A directory-style path
// (trailing slash, or "/") serves its index.html; anything with an extension
// is served as-is. Path traversal outside root is refused (returns null).
export function routeToFile(urlPath, root) {
  let p = decodeURIComponent((urlPath || '/').split('?')[0].split('#')[0]);
  if (p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';
  const abs = path.normalize(path.join(root, p));
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (abs !== root && !abs.startsWith(rootWithSep)) return null;
  return abs;
}

// --- static server --------------------------------------------------------
export function createServer(root) {
  return http.createServer((req, res) => {
    const file = routeToFile(req.url, root);
    if (!file) {
      res.writeHead(403);
      res.end('forbidden');
      return;
    }
    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'content-type': contentType(file) });
      res.end(buf);
    });
  });
}

// --- manifest validation --------------------------------------------------
// Returns an array of error strings; empty means the manifest is well formed.
export function validateManifest(data) {
  const errors = [];
  if (!Array.isArray(data)) return ['manifest is not an array'];
  data.forEach((e, i) => {
    const at = `entry ${i}`;
    if (!e || typeof e !== 'object') { errors.push(`${at}: not an object`); return; }
    if (typeof e.file !== 'string' || !e.file) errors.push(`${at}: missing "file"`);
    else if (!e.file.endsWith('.png')) errors.push(`${at}: "file" must end in .png`);
    else if (path.isAbsolute(e.file) || e.file.includes('..')) errors.push(`${at}: "file" must be a relative path inside dist`);
    if (typeof e.path !== 'string' || !e.path.startsWith('/')) errors.push(`${at}: "path" must be a route starting with /`);
    if (!Number.isFinite(e.width) || e.width <= 0) errors.push(`${at}: "width" must be a positive number`);
    if (!Number.isFinite(e.height) || e.height <= 0) errors.push(`${at}: "height" must be a positive number`);
    if (e.scrollY != null && !Number.isFinite(e.scrollY)) errors.push(`${at}: "scrollY" must be a number`);
    if (e.fullPage != null && typeof e.fullPage !== 'boolean') errors.push(`${at}: "fullPage" must be a boolean`);
    if (e.waitFor != null && typeof e.waitFor !== 'string') errors.push(`${at}: "waitFor" must be a string`);
  });
  return errors;
}

export function loadManifest(file = MANIFEST) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = validateManifest(data);
  if (errors.length) throw new Error('invalid manifest:\n  ' + errors.join('\n  '));
  return data;
}

// --- the chromium pass ----------------------------------------------------
async function render() {
  const { chromium } = await import('playwright');
  const shots = loadManifest();
  const server = createServer(DIST);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch();
  let ok = 0;
  let failed = 0;

  for (const shot of shots) {
    const out = path.resolve(DIST, shot.file);
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 2,
    });
    try {
      await page.goto(base + shot.path, { waitUntil: 'networkidle', timeout: 30000 });
      if (shot.waitFor) await page.waitForSelector(shot.waitFor, { state: 'visible', timeout: 15000 });
      const y = shot.scrollY || 0;
      if (y) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await page.waitForTimeout(250);
      }
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await page.screenshot({ path: out, fullPage: !!shot.fullPage });
      ok++;
      console.log(`shot ok: ${shot.file}  <-  ${shot.path}`);
    } catch (err) {
      failed++;
      console.log(`shot FAILED: ${shot.file}  <-  ${shot.path}  :: ${err && err.message ? err.message : err}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));

  console.log(`walkthrough-shots: ${ok} ok, ${failed} failed, of ${shots.length}`);
  // Exit non-zero only if every shot failed; a partial render still helps.
  if (shots.length > 0 && ok === 0) process.exit(1);
}

// Only launch chromium when run directly; importing for tests must not.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  render().catch((err) => {
    console.error('walkthrough-shots: fatal', err);
    process.exit(1);
  });
}
