#!/usr/bin/env node
// EXP-13d: verify that a built chapter page whose data includes a horizon
// renders the "Where this goes" block in static HTML, without requiring JS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '../../dist');
const pageFile = resolve(distDir, 'explain/metadax/01-job/index.html');

let html;
test('built chapter page is readable', () => {
  html = readFileSync(pageFile, 'utf8');
  assert.ok(html.length > 0, 'built page is empty');
});

test('built chapter page contains "Where this goes" block in static HTML', () => {
  assert.ok(html.includes('Where this goes'),
    '"Where this goes" block missing from static HTML — horizon must render without JS');
});

test('built chapter page contains horizon text in static HTML', () => {
  assert.ok(
    html.includes('When the job left is done'),
    'horizon text missing from static HTML'
  );
});

test('"Where this goes" tag uses muted style class', () => {
  assert.ok(
    html.includes('horizon-tag') || html.includes('Where this goes'),
    'horizon-tag element missing'
  );
});
