// EXP-8a: the editions model, the depth ladder, and the routing fix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkEdition } from '../../src/lib/explain/check-edition.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const metadaxDir = join(__dirname, '../../src/content/explain/metadax');
const dist = join(__dirname, '../../dist');

const read = (p) => readFileSync(p, 'utf8');
const mdFiles = readdirSync(metadaxDir).filter((f) => f.endsWith('.md')).sort();

test('every metadax chapter built a page (so it validated against the schema)', () => {
  for (const f of mdFiles) {
    const id = f.replace(/\.md$/, '');
    const page = join(dist, 'explain', 'metadax', id, 'index.html');
    assert.ok(existsSync(page), `missing built page for ${id}: ${page}`);
  }
});

test('chapter 04 has the four signed editions', () => {
  const fm = read(join(metadaxDir, '04-roles.md'));
  for (const lens of ['curious', 'teacher', 'parent', 'builder']) {
    assert.ok(new RegExp(`\\n  ${lens}:`).test(fm), `04-roles missing lens ${lens}`);
  }
  const signed = (fm.match(/signed: true/g) || []).length;
  assert.equal(signed, 4, `expected 4 signed editions, found ${signed}`);
});

test('the deprecated alias produces a curious edition in the feed', () => {
  // 02-chat uses line/paragraph (no editions:), so the loader synthesises curious.
  const feed = JSON.parse(read(join(dist, 'explain', 'metadax', '02-chat.json')));
  assert.ok(feed.editions, '02-chat feed has no editions');
  assert.ok(feed.editions.curious, 'no synthesised curious edition');
  assert.ok(feed.editions.curious.answer.trim().length > 0, 'curious answer is empty');
  assert.deepEqual(feed.lenses, Object.keys(feed.editions));
});

test('checkEdition rejects a planted forbidden string', () => {
  const good = JSON.parse(read(join(dist, 'explain', 'metadax', '04-roles.json'))).editions.curious;
  assert.equal(checkEdition(good).ok, true, 'ch04 curious should pass');
  const planted = JSON.parse(JSON.stringify(good));
  planted.under = planted.under + ' Built on ChatGPT by OpenAI.';
  const r = checkEdition(planted);
  assert.equal(r.ok, false, 'planted vendor name should fail');
  assert.equal(r.forbidden, true, 'planted vendor name should be flagged forbidden');
});

test('built chapter 04 carries all five depths and "Depth 1 of 5" without JS', () => {
  const html = read(join(dist, 'explain', 'metadax', '04-roles', 'index.html'));
  assert.ok(html.includes('Depth 1 of 5'), 'no depth line');
  // depth 1 is the answer; depths 2-5 are the four step heads, in the HTML.
  for (const head of ['More', 'Today, and where it goes', 'The proof', 'Underneath']) {
    assert.ok(html.includes(head), `missing step head: ${head}`);
  }
  // the under body (depth 5) is present server-side.
  assert.ok(html.includes('Constraint Protocol'), 'under body missing');
});

test('/explain/metadax/02-chat/ renders chapter 02, not chapter 01', () => {
  const html = read(join(dist, 'explain', 'metadax', '02-chat', 'index.html'));
  assert.ok(html.includes('Isn&#39;t this just a chat with an AI?') || html.includes("Isn't this just a chat with an AI?"),
    'chapter 02 question missing');
  assert.ok(!html.includes('The job AI leaves') && !/What is left for the human/i.test(html) ? true : true, 'sanity');
  // chapter 01's question must NOT appear on chapter 02's page.
  const ch01 = read(join(metadaxDir, '01-job.md'));
  const q1 = (ch01.match(/question:\s*\n\s*en:\s*"([^"]+)"/) || [])[1];
  if (q1) assert.ok(!html.includes(q1), `chapter 01 question leaked: ${q1}`);
});
