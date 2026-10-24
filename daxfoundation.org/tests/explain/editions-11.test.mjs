// EXP-11: nine lenses as data, nine editions per Meta DAX chapter, the kid lens's
// three empty steps, the researcher lens's papers, and the chooser built from the
// data file. Reads the built per-chapter feed (dist/explain/metadax/<id>.json) and
// one built page for the chooser, so it needs no YAML parser and no Astro runtime.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkEdition, FORBIDDEN } from '../../src/lib/explain/check-edition.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const lensesPath = join(__dirname, '../../src/data/lenses.json');
const metadaxDir = join(__dirname, '../../src/content/explain/metadax');
const dist = join(__dirname, '../../dist');
const read = (p) => readFileSync(p, 'utf8');

// The reading scale, least background first (PART A).
const ORDER = ['kid', 'curious', 'parent', 'guide', 'manager', 'entrepreneur', 'builder', 'funder', 'researcher'];

const lenses = JSON.parse(read(lensesPath));
const mdFiles = readdirSync(metadaxDir).filter((f) => f.endsWith('.md')).sort();
const feedOf = (id) => JSON.parse(read(join(dist, 'explain', 'metadax', `${id}.json`)));

test('lenses.json: nine lenses, the reading order, unique ids, levels 1..5', () => {
  // 2026-10-24: a tenth, Tamil "Give it to me straight" (lens ta), sits after the nine
  assert.equal(lenses.length, 10, 'expected nine lenses plus Tamil');
  assert.deepEqual(lenses.map((l) => l.id), ORDER, 'lenses are not in the reading order');
  const ids = new Set(lenses.map((l) => l.id));
  assert.equal(ids.size, 10, 'lens ids are not unique');
  const levels = lenses.map((l) => l.level);
  for (const lv of levels) {
    assert.ok(Number.isInteger(lv) && lv >= 1 && lv <= 5, `level out of 1..5: ${lv}`);
  }
  assert.equal(Math.min(...levels), 1, 'no level 1 (the kid)');
  assert.equal(Math.max(...levels), 5, 'no level 5 (the researcher)');
  // Each lens carries the fields the chooser and the map read.
  for (const l of lenses) {
    for (const k of ['id', 'label', 'voice', 'level', 'depths', 'brief']) {
      assert.ok(l[k] !== undefined, `lens ${l.id} missing ${k}`);
    }
    assert.ok(Array.isArray(l.depths) && l.depths.length >= 2, `lens ${l.id} depths`);
  }
});

test('every Meta DAX chapter carries all nine editions', () => {
  for (const f of mdFiles) {
    const id = f.replace(/\.md$/, '');
    const feed = feedOf(id);
    assert.ok(feed.editions, `${id}: no editions in feed`);
    for (const lens of ORDER) {
      assert.ok(feed.editions[lens], `${id}: missing the ${lens} edition`);
    }
  }
});

test('every edition of every chapter passes checkEdition()', () => {
  for (const f of mdFiles) {
    const id = f.replace(/\.md$/, '');
    const { editions } = feedOf(id);
    for (const lens of ORDER) {
      const r = checkEdition(editions[lens]);
      assert.equal(r.ok, true, `${id} · ${lens} failed checkEdition: ${r.why}`);
    }
  }
});

test('the kid edition of every chapter has empty how/proof_intro/under', () => {
  for (const f of mdFiles) {
    const id = f.replace(/\.md$/, '');
    const kid = feedOf(id).editions.kid;
    for (const k of ['how', 'proof_intro', 'under']) {
      assert.equal((kid[k] || '').trim(), '', `${id}: kid.${k} should be empty`);
    }
  }
});

test('the researcher edition of every chapter has papers', () => {
  for (const f of mdFiles) {
    const id = f.replace(/\.md$/, '');
    const papers = feedOf(id).editions.researcher.papers;
    assert.ok(Array.isArray(papers) && papers.length >= 1, `${id}: researcher has no papers`);
    for (const p of papers) {
      assert.ok(p && p.href && p.text && p.src, `${id}: a paper is missing href/text/src`);
    }
  }
});

test('no forbidden string anywhere under src/content/explain', () => {
  const roots = readdirSync(join(__dirname, '../../src/content/explain'), { withFileTypes: true });
  const files = [];
  for (const d of roots) {
    const sub = join(__dirname, '../../src/content/explain', d.name);
    if (d.isDirectory()) {
      for (const f of readdirSync(sub)) if (f.endsWith('.md')) files.push(join(sub, f));
    } else if (d.name.endsWith('.md')) {
      files.push(sub);
    }
  }
  for (const file of files) {
    const text = read(file);
    for (const re of FORBIDDEN) {
      assert.equal(re.test(text), false, `${file}: forbidden string ${re.source}`);
    }
  }
});

test('the built chooser lists the nine chips, in the data-file order', () => {
  // The chooser is in the Explain layout; every chapter page carries it.
  const anyId = mdFiles[0].replace(/\.md$/, '');
  const html = read(join(dist, 'explain', 'metadax', anyId, 'index.html'));
  const chips = html.slice(html.indexOf('id="lens-chips"'));
  const got = [...chips.matchAll(/data-lens="([^"]+)"/g)].map((m) => m[1]);
  // Take the first nine (the chooser block), compare to the reading order.
  assert.deepEqual(got.slice(0, 9), ORDER, 'chooser chips are not the nine lenses in order');
});
