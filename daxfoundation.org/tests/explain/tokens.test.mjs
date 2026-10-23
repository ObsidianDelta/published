import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const tokensPath = join(root, 'src/styles/tokens.json');
const cssPath = join(root, 'src/styles/tokens.css');

const tokens = JSON.parse(readFileSync(tokensPath, 'utf8'));
const css = readFileSync(cssPath, 'utf8');
const cssLines = css.split('\n');

test('line 1 is the exact header comment', () => {
  assert.strictEqual(
    cssLines[0],
    '/* DAX Foundation tokens, generated from src/styles/tokens.json; do not edit by hand */'
  );
});

test('all color token names are present in CSS', () => {
  for (const token of tokens.color.tokens) {
    assert.ok(css.includes(`--${token.name}:`), `Missing color token: --${token.name}`);
  }
});

test('live-site mappings --bg --fg --muted --faint are present', () => {
  assert.ok(css.includes('--bg: var(--ground)'), 'Missing --bg: var(--ground)');
  assert.ok(css.includes('--fg: var(--ink)'), 'Missing --fg: var(--ink)');
  assert.ok(css.includes('--muted: var(--ink-muted)'), 'Missing --muted: var(--ink-muted)');
  assert.ok(css.includes('--faint: var(--ink-faint)'), 'Missing --faint: var(--ink-faint)');
});
