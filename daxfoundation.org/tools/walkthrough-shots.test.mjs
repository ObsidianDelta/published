// node --test — covers everything in walkthrough-shots.mjs that does NOT need
// a browser: the route->file mapping, content types, and manifest validation
// (including the real walkthrough-shots.json). The chromium pass is only
// reachable on the deploy runner and is not exercised here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routeToFile, contentType, validateManifest, loadManifest } from './walkthrough-shots.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = '/srv/dist';

test('routeToFile maps directory-style routes to index.html', () => {
  assert.equal(routeToFile('/', ROOT), path.join(ROOT, 'index.html'));
  assert.equal(routeToFile('/metadax/play/', ROOT), path.join(ROOT, 'metadax/play/index.html'));
  // extensionless, no trailing slash -> treated as a directory
  assert.equal(routeToFile('/metadax/play', ROOT), path.join(ROOT, 'metadax/play/index.html'));
  // a real file (print page, assets) is served as-is
  assert.equal(routeToFile('/metadax/play/print.html', ROOT), path.join(ROOT, 'metadax/play/print.html'));
  assert.equal(routeToFile('/assets/app.css', ROOT), path.join(ROOT, 'assets/app.css'));
  // query and hash are stripped before mapping
  assert.equal(routeToFile('/metadax/play/?v=abc#x', ROOT), path.join(ROOT, 'metadax/play/index.html'));
});

test('routeToFile refuses path traversal outside root', () => {
  assert.equal(routeToFile('/../etc/passwd', ROOT), null);
  assert.equal(routeToFile('/../../secret', ROOT), null);
});

test('contentType covers the types the static server must serve', () => {
  assert.equal(contentType('a/b.html'), 'text/html; charset=utf-8');
  assert.equal(contentType('a/b.css'), 'text/css; charset=utf-8');
  assert.equal(contentType('a/b.js'), 'text/javascript; charset=utf-8');
  assert.equal(contentType('a/b.svg'), 'image/svg+xml');
  assert.equal(contentType('a/b.png'), 'image/png');
  assert.equal(contentType('a/b.json'), 'application/json; charset=utf-8');
  assert.equal(contentType('a/b.woff2'), 'font/woff2');
  // unknown extension falls back to a byte stream, never throws
  assert.equal(contentType('a/b.xyz'), 'application/octet-stream');
});

test('validateManifest accepts a well-formed entry and reports bad ones', () => {
  const good = [{
    file: 'metadax/walkthroughs/homeschool/01.png',
    path: '/metadax/samples/stade-des-fractions/',
    width: 390, height: 844, scrollY: 0, fullPage: false, waitFor: 'main',
  }];
  assert.deepEqual(validateManifest(good), []);

  assert.deepEqual(validateManifest({}), ['manifest is not an array']);

  const bad = [
    { file: 'x.png', path: 'no-leading-slash', width: 390, height: 844 },
    { file: 'x.jpg', path: '/ok/', width: 390, height: 844 },
    { file: '../escape.png', path: '/ok/', width: 390, height: 844 },
    { file: 'x.png', path: '/ok/', width: 0, height: -1 },
  ];
  const errs = validateManifest(bad);
  assert.ok(errs.some((e) => e.includes('entry 0') && e.includes('path')));
  assert.ok(errs.some((e) => e.includes('entry 1') && e.includes('.png')));
  assert.ok(errs.some((e) => e.includes('entry 2') && e.includes('relative path')));
  assert.ok(errs.some((e) => e.includes('entry 3') && e.includes('width')));
  assert.ok(errs.some((e) => e.includes('entry 3') && e.includes('height')));
});

test('the shipped walkthrough-shots.json is valid and internally consistent', () => {
  const manifest = loadManifest(path.resolve(HERE, '..', 'walkthrough-shots.json'));
  assert.ok(Array.isArray(manifest) && manifest.length >= 8, 'at least the 8 shots sent to Jason');
  const files = new Set();
  for (const s of manifest) {
    assert.equal(s.width, 390);
    assert.equal(s.height, 844);
    assert.match(s.file, /^metadax\/walkthroughs\/[a-z]+\/\d\d\.png$/);
    assert.ok(!files.has(s.file), `duplicate output file ${s.file}`);
    files.add(s.file);
  }
});
