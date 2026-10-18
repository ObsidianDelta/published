// /writing/feed.xml -- hand-rolled RSS 2.0, same pattern as sitemap.xml.js
// (no new dependency). Posts newest first, same order as the index.

import { posts } from '../_posts.js';

const SITE = 'https://daxfoundation.org';

const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const toRfc822 = (value) => new Date(value).toUTCString().replace(/GMT$/, '+0000');

export async function GET() {
  const items = posts
    .map(
      (p) =>
        '    <item>\n' +
        '      <title>' + escape(p.title) + '</title>\n' +
        '      <link>' + escape(SITE + '/writing/' + p.slug + '/') + '</link>\n' +
        '      <guid>' + escape(SITE + '/writing/' + p.slug + '/') + '</guid>\n' +
        '      <pubDate>' + toRfc822(p.date) + '</pubDate>\n' +
        '      <description>' + escape(p.description || p.title) + '</description>\n' +
        '    </item>\n',
    )
    .join('');

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0">\n' +
    '  <channel>\n' +
    '    <title>The DAX Foundation: Writing</title>\n' +
    '    <link>' + SITE + '/writing/</link>\n' +
    '    <description>' +
    escape(
      "Pieces written in the Foundation’s voice, around its definitions: the reasoning, the measures, the consequences. Versioned, in public.",
    ) +
    '</description>\n' +
    items +
    '  </channel>\n' +
    '</rss>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
