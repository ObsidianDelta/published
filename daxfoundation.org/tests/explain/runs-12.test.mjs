// EXP-12: three short runs — the Constraint Protocol (four chapters), Nova DAX
// (three) and Skippy DAX (three), nine editions each. Reads the built per-chapter
// feeds (dist/explain/<collection>/<id>.json) and the three built collection pages,
// so it needs no YAML parser and no Astro runtime.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkEdition, FORBIDDEN } from '../../src/lib/explain/check-edition.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const dist = join(root, 'dist');
const scenesDir = join(root, 'src', 'scenes');
const read = (p) => readFileSync(p, 'utf8');

// The nine lenses, in the reading order (same as EXP-11).
const ORDER = ['kid', 'curious', 'parent', 'guide', 'manager', 'entrepreneur', 'builder', 'funder', 'researcher'];

// The ten chapters and their questions, exactly as the ask gives them.
const CHAPTERS = [
  ['constraint-protocol', '01-what', 'What is the Constraint Protocol?'],
  ['constraint-protocol', '02-who', 'Who is accountable?'],
  ['constraint-protocol', '03-record', 'What does the record hold?'],
  ['constraint-protocol', '04-identity', 'Who am I in it?'],
  ['nova-dax', '01-what', 'What is Nova DAX?'],
  ['nova-dax', '02-whose', 'Whose is it?'],
  ['nova-dax', '03-start', 'Where does it start?'],
  ['skippy-dax', '01-what', 'What is Skippy DAX?'],
  ['skippy-dax', '02-chatbot', 'Is it a chatbot?'],
  ['skippy-dax', '03-stand', 'Where does it stand?'],
];

const COLLECTIONS = ['constraint-protocol', 'nova-dax', 'skippy-dax'];

// Evidence and papers may only point at these three hosts.
function hostAllowed(url) {
  if (typeof url !== 'string') return false;
  let u;
  try { u = new URL(url); } catch { return false; }
  const host = u.hostname.replace(/^www\./, '');
  if (host === 'daxfoundation.org') return true;
  if (host === 'jeyanandan.com') return true;
  if (host === 'github.com') return u.pathname.startsWith('/daxfoundation');
  return false;
}

const feedOf = (collection, id) =>
  JSON.parse(read(join(dist, 'explain', collection, `${id}.json`)));

test('ten chapters exist, with the questions the ask gives', () => {
  assert.equal(CHAPTERS.length, 10, 'expected ten chapters');
  for (const [collection, id, question] of CHAPTERS) {
    const feed = feedOf(collection, id);
    assert.equal(feed.id, id, `${collection}/${id}: wrong id in feed`);
    assert.equal(feed.question.en, question, `${collection}/${id}: wrong question`);
  }
});

test('every chapter carries its canon and all nine editions', () => {
  for (const [collection, id] of CHAPTERS) {
    const feed = feedOf(collection, id);
    assert.ok(feed.editions, `${collection}/${id}: no editions in feed`);
    for (const lens of ORDER) {
      assert.ok(feed.editions[lens], `${collection}/${id}: missing the ${lens} edition`);
    }
  }
});

test('the canon is present and non-empty for every chapter', () => {
  // canon travels on the markdown frontmatter; the feed echoes it when present.
  for (const [collection, id] of CHAPTERS) {
    const md = read(join(root, 'src', 'content', 'explain', collection, `${id}.md`));
    assert.ok(/\ncanon:\n(\s+-\s+)/.test(md), `${collection}/${id}: no canon block`);
  }
});

test('every edition of every chapter passes checkEdition()', () => {
  for (const [collection, id] of CHAPTERS) {
    const { editions } = feedOf(collection, id);
    for (const lens of ORDER) {
      const r = checkEdition(editions[lens]);
      assert.equal(r.ok, true, `${collection}/${id} · ${lens} failed checkEdition: ${r.why}`);
    }
  }
});

test('the kid edition omits how/proof_intro/under; the researcher has papers', () => {
  for (const [collection, id] of CHAPTERS) {
    const { editions } = feedOf(collection, id);
    for (const k of ['how', 'proof_intro', 'under']) {
      assert.equal((editions.kid[k] || '').trim(), '', `${collection}/${id}: kid.${k} should be empty`);
    }
    const papers = editions.researcher.papers;
    assert.ok(Array.isArray(papers) && papers.length >= 1, `${collection}/${id}: researcher has no papers`);
  }
});

test('no forbidden string in any edition', () => {
  for (const [collection, id] of CHAPTERS) {
    const all = JSON.stringify(feedOf(collection, id).editions);
    for (const re of FORBIDDEN) {
      assert.equal(re.test(all), false, `${collection}/${id}: forbidden string ${re.source}`);
    }
  }
});

test('no evidence or paper href outside the three allowed hosts', () => {
  for (const [collection, id] of CHAPTERS) {
    const feed = feedOf(collection, id);
    for (const ev of feed.evidence || []) {
      if (ev.src !== undefined) {
        assert.ok(hostAllowed(ev.src), `${collection}/${id}: evidence src not allowed: ${ev.src}`);
      }
    }
    for (const lens of ORDER) {
      for (const p of feed.editions[lens].papers || []) {
        assert.ok(hostAllowed(p.href), `${collection}/${id} · ${lens}: paper href not allowed: ${p.href}`);
      }
    }
  }
});

test('the still scene is registered (index.ts + fallback.ts, glob registry)', () => {
  assert.ok(existsSync(join(scenesDir, 'still', 'index.ts')), 'still/index.ts missing');
  assert.ok(existsSync(join(scenesDir, 'still', 'fallback.ts')), 'still/fallback.ts missing');
  const reg = read(join(scenesDir, 'registry.ts'));
  assert.ok(reg.includes('import.meta.glob'), 'registry.ts lacks import.meta.glob');
  const idx = read(join(scenesDir, 'still', 'index.ts'));
  assert.ok(/name:\s*META\.name/.test(idx) || /name:\s*["']still["']/.test(idx), 'still meta.name not still');
});

test('the three collection pages build', () => {
  for (const collection of COLLECTIONS) {
    const page = join(dist, 'explain', collection, 'index.html');
    assert.ok(existsSync(page), `collection page missing (run npm run build first): ${page}`);
  }
});
