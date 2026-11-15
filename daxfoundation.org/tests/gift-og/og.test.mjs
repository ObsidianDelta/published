// Q11 gift-og card -- the /gift/ Pages Function (views/daxfoundation/functions/gift/index.js).
// Covers: bot UA + valid s -> per-letter image; bot + invalid s -> love.webp
// fallback; human UA -> passthrough; no s -> passthrough; title/description and
// all other words left byte-identical when the image tags are rewritten.
// Run: node --test views/daxfoundation/tests/gift-og/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encodeState } from '../../public/gift/lib/gift-og/state.js';
import { isPreviewBot, cardImage, shouldRewrite, cardEdits } from '../../functions/gift/index.js';

const ORIGIN = 'https://daxfoundation.org';
const BOT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const HUMAN = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';

const giftUrl = (qs) => new URL(`${ORIGIN}/gift/${qs}`);

// A node-side stand-in for the worker's HTMLRewriter setAttribute('content', ...)
// over <meta property|name="X" content="...">. Proves the real edits touch only
// their target tags and nothing else on the page.
function applyEdits(html, edits) {
  let out = html;
  for (const e of edits) {
    const m = e.sel.match(/^meta\[(property|name)="(.+)"\]$/);
    assert.ok(m, `parsable selector: ${e.sel}`);
    const [, attr, val] = m;
    const re = new RegExp(`(<meta ${attr}="${val}" content=")[^"]*(">)`);
    assert.match(out, re, `edit target present in index.html: ${e.sel}`);
    out = out.replace(re, `$1${e.content}$2`);
  }
  return out;
}

test('isPreviewBot: known crawlers in, humans out', () => {
  assert.equal(isPreviewBot(BOT), true);
  assert.equal(isPreviewBot('Twitterbot/1.0'), true);
  assert.equal(isPreviewBot('WhatsApp/2.23'), true);
  assert.equal(isPreviewBot('LinkedInBot/1.0'), true);
  assert.equal(isPreviewBot(HUMAN), false);
  assert.equal(isPreviewBot(''), false);
  assert.equal(isPreviewBot(undefined), false);
});

test('bot UA + valid s -> per-letter card image (?lang overrides)', () => {
  const s = encodeState({ k: 'mine', l: 'joy' });
  const url = giftUrl(`?s=${s}&lang=fr`);
  assert.equal(shouldRewrite(url, BOT), true);
  assert.equal(cardImage(url), `${ORIGIN}/gift/og/fr/joy.webp`);
});

test('bot UA + valid s -> language taken from state when no ?lang', () => {
  const s = encodeState({ k: 'mine', l: 'hope', lang: 'es' });
  const url = giftUrl(`?s=${s}`);
  assert.equal(shouldRewrite(url, BOT), true);
  assert.equal(cardImage(url), `${ORIGIN}/gift/og/es/hope.webp`);
});

test('bot UA + invalid s -> og/en/love.webp fallback', () => {
  const url = giftUrl('?s=@@not-valid-base64@@&lang=zz');
  assert.equal(shouldRewrite(url, BOT), true); // s present + bot -> we rewrite
  assert.equal(cardImage(url), `${ORIGIN}/gift/og/en/love.webp`);
});

test('bot UA + feeling-only state -> mapped letter', () => {
  const s = encodeState({ k: 'mine', f: 'joyful' }); // joyful -> joy
  const url = giftUrl(`?s=${s}`);
  assert.equal(cardImage(url), `${ORIGIN}/gift/og/en/joy.webp`);
});

test('human UA -> passthrough even with valid s', () => {
  const s = encodeState({ k: 'mine', l: 'joy' });
  assert.equal(shouldRewrite(giftUrl(`?s=${s}`), HUMAN), false);
});

test('no s -> passthrough even for a bot', () => {
  assert.equal(shouldRewrite(giftUrl(''), BOT), false);
  assert.equal(shouldRewrite(giftUrl('?lang=fr'), BOT), false);
});

test('rewrite changes only the image meta tags; words untouched', () => {
  const html = readFileSync(new URL('../../public/gift/index.html', import.meta.url), 'utf8');
  const image = `${ORIGIN}/gift/og/fr/joy.webp`;
  const out = applyEdits(html, cardEdits(image));

  // Image tags rewritten to the per-letter card, as image/webp, 1200x630.
  assert.match(out, /<meta property="og:image" content="https:\/\/daxfoundation\.org\/gift\/og\/fr\/joy\.webp">/);
  assert.match(out, /<meta name="twitter:image" content="https:\/\/daxfoundation\.org\/gift\/og\/fr\/joy\.webp">/);
  assert.match(out, /<meta property="og:image:type" content="image\/webp">/);
  assert.match(out, /<meta property="og:image:width" content="1200">/);
  assert.match(out, /<meta property="og:image:height" content="630">/);
  // The static page still advertised the jpeg; the rewrite must have removed it.
  assert.doesNotMatch(out, /content="image\/jpeg"/);
  assert.doesNotMatch(out, /gift\/og\/preview\.jpg/);

  // Words are byte-identical: titles, descriptions and alt text untouched.
  for (const line of [
    '<meta property="og:title" content="What does love sound like?">',
    '<meta property="og:description" content="A research project of the DAX Foundation. Discover what love sounds like, make your own, and share it.">',
    '<meta name="twitter:title" content="What does love sound like?">',
    '<meta name="description" content="A research project of the DAX Foundation. Design a small experiment, hear what love sounds like, and share it.">',
  ]) {
    assert.ok(html.includes(line), `original has: ${line}`);
    assert.ok(out.includes(line), `rewrite keeps: ${line}`);
  }

  // Every byte outside the five rewritten <meta> tags is identical.
  const strip = (s) => s.replace(/<meta (?:property|name)="(?:og:image|og:image:type|og:image:width|og:image:height|twitter:image)" content="[^"]*">/g, '');
  assert.equal(strip(out), strip(html));
});
