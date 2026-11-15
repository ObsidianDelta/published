// /gift/ -- per-share Open Graph card for link-preview crawlers (Q11).
//
// A share link daxfoundation.org/gift/?s=<state>&lang=<l> carries ONLY
// enumerated choices (state/gift/viral/SHARE-STATE.md): no free text, no name,
// no message can ever reach here. When a known link-preview bot fetches /gift/,
// we serve the same static page but point og:image / twitter:image at the
// per-letter card og/<lang>/<letter>.webp so the unfurl shows the sound the
// sharer chose. Humans (any other User-Agent) get the untouched static SPA.
//
// Bright lines: IMAGE ONLY -- no copy, words or numbers change (gate G3 safe).
// The #x= fragment never reaches the server and is never read. Nothing about
// the visitor (s, IP, User-Agent) is logged or stored. Letter + language come
// from the existing allowlist decoder; unknown/invalid -> og/en/love.webp.
import {
  decodeState,
  soundLetter,
  resolveLang,
  LANGS,
  LETTERS,
} from '../../public/gift/lib/gift-og/state.js';

// Known link-preview / social-unfurl bots. Any UA that does not match is treated
// as a human and passes straight through to the static page. Substring match,
// case-insensitive -- these tokens are stable parts of each crawler's UA.
const PREVIEW_BOT = /facebookexternalhit|facebookcatalog|facebot|twitterbot|linkedinbot|slackbot|slack-imgproxy|whatsapp|telegrambot|discordbot|pinterest(?:bot)?|redditbot|applebot|skypeuripreview|vkshare|embedly|iframely|quora link preview|nuzzel|outbrain|flipboard|tumblr|mastodon|threads|bluesky|googlebot|google-inspectiontool|bingbot|yandex|baiduspider|w3c_validator/i;

// Every per-letter card is a 1200x630 WebP -- the same frame as the static
// preview.jpg it replaces.
const CARD = { type: 'image/webp', width: '1200', height: '630' };

/** True for a known link-preview crawler UA. */
export function isPreviewBot(ua) {
  return typeof ua === 'string' && PREVIEW_BOT.test(ua);
}

/**
 * Absolute URL of the per-letter card for a /gift/ share URL. Always resolves
 * to an existing file: the decoder is allowlist-only, and anything it cannot
 * place falls back to og/en/love.webp.
 */
export function cardImage(url) {
  const st = decodeState(url.searchParams.get('s'));
  let lang = resolveLang(url.searchParams.get('lang'), st);
  let letter = soundLetter(st);
  if (!LANGS.includes(lang) || !LETTERS.includes(letter)) {
    lang = 'en';
    letter = 'love';
  }
  return `${url.origin}/gift/og/${lang}/${letter}.webp`;
}

/**
 * The meta tags to rewrite (CSS selector -> new content). Everything else on
 * the page is left byte-identical to the static /gift/index.html.
 */
export function cardEdits(image) {
  return [
    { sel: 'meta[property="og:image"]', content: image },
    { sel: 'meta[property="og:image:type"]', content: CARD.type },
    { sel: 'meta[property="og:image:width"]', content: CARD.width },
    { sel: 'meta[property="og:image:height"]', content: CARD.height },
    { sel: 'meta[name="twitter:image"]', content: image },
  ];
}

/**
 * Rewrite only when a known preview bot asks for a page that carries share
 * state. No ?s= (a bare /gift/ link) or a human visitor -> serve the static SPA.
 */
export function shouldRewrite(url, ua) {
  return Boolean(url.searchParams.get('s')) && isPreviewBot(ua);
}

class SetContent {
  constructor(content) {
    this.content = content;
  }

  element(el) {
    el.setAttribute('content', this.content);
  }
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const ua = request.headers.get('User-Agent') || '';

  // Human, or a link with no share state: the static page, untouched.
  if (!shouldRewrite(url, ua)) return context.next();

  // Fetch the static /gift/index.html, then rewrite only the image meta tags.
  const res = await context.next();
  if (!(res.headers.get('Content-Type') || '').includes('text/html')) return res;

  const image = cardImage(url);
  let rewriter = new HTMLRewriter();
  for (const edit of cardEdits(image)) rewriter = rewriter.on(edit.sel, new SetContent(edit.content));
  return rewriter.transform(res);
}
