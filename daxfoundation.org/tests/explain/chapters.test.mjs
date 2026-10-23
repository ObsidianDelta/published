import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, '../../src/content/explain');

const REQUIRED_KEYS = ['tense:', 'claim:', 'line:', 'version:'];
const FORBIDDEN = [
  'non-profit',
  'charity',
  "life's work",
  'manual cognitive',
  'and his cognitive companion',
  'ChatGPT',
  'OpenAI',
  'Anthropic',
  'Claude',
  'Gemini',
];

function findMdFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findMdFiles(full));
    } else if (entry.endsWith('.md')) {
      results.push(full);
    }
  }
  return results.sort();
}

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : '';
}

const mdFiles = findMdFiles(contentDir);

test('found at least one chapter file', () => {
  assert.ok(mdFiles.length > 0, 'no .md files found under src/content/explain');
});

test('each chapter file has required frontmatter keys', () => {
  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf8');
    const fm = extractFrontmatter(content);
    assert.ok(fm.length > 0, `${file}: no frontmatter found`);
    for (const key of REQUIRED_KEYS) {
      assert.ok(fm.includes(key), `${file}: missing "${key}" in frontmatter`);
    }
  }
});

test('no chapter file contains forbidden strings', () => {
  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf8');
    for (const forbidden of FORBIDDEN) {
      assert.ok(
        !content.includes(forbidden),
        `${file}: contains forbidden string "${forbidden}"`,
      );
    }
  }
});
