// /blog/feed.xml -- hand-rolled RSS 2.0, no new dependency.
//
// Mirrors the structure of sitemap.xml.js: one module, one GET, built by Astro
// to dist/blog/feed.xml at the path the <link> in Base.astro advertises.
//
// WHAT GOES IN IT. listedPosts from src/pages/_posts.js, newest first. Unlisted
// posts are off the home page, /blog/, and the sitemap; they are off the feed
// too. The same function that drives those lists drives this one.

import { listedPosts } from '../_posts.js';

const SITE = 'https://jeyanandan.com';
const CHANNEL_TITLE = 'Jason Jeyanandan';
const CHANNEL_LINK = SITE + '/blog/';

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const rfc822 = (value) => new Date(value).toUTCString();

export async function GET() {
  const items = listedPosts
    .map((p) => {
      const link = SITE + '/blog/' + p.slug + '/';
      const title = p.subtitle ? p.title + ': ' + p.subtitle : p.title;
      return (
        '    <item>\n' +
        '      <title>' + escape(title) + '</title>\n' +
        '      <link>' + escape(link) + '</link>\n' +
        '      <guid>' + escape(link) + '</guid>\n' +
        '      <pubDate>' + rfc822(p.date) + '</pubDate>\n' +
        (p.description ? '      <description>' + escape(p.description) + '</description>\n' : '') +
        '    </item>\n'
      );
    })
    .join('');

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0">\n' +
    '  <channel>\n' +
    '    <title>' + escape(CHANNEL_TITLE) + '</title>\n' +
    '    <link>' + escape(CHANNEL_LINK) + '</link>\n' +
    '    <description>' + escape(CHANNEL_TITLE) + '</description>\n' +
    items +
    '  </channel>\n' +
    '</rss>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
