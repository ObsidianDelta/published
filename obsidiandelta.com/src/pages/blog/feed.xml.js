// Hand-rolled RSS 2.0 feed. No new dependency.
// Channel: "Obsidian Delta: Blog", link: https://www.obsidiandelta.com/blog/
// Items: all indexablePosts (listed, non-draft) newest first.

import { indexablePosts } from '../_posts.js';

const SITE = 'https://www.obsidiandelta.com';

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const rfc822 = (value) => new Date(value).toUTCString();

export async function GET() {
  const items = indexablePosts
    .map((p) => {
      const url = `${SITE}/blog/${p.slug}/`;
      return (
        '    <item>\n' +
        `      <title>${esc(p.title)}</title>\n` +
        `      <link>${esc(url)}</link>\n` +
        `      <guid>${esc(url)}</guid>\n` +
        `      <pubDate>${esc(rfc822(p.date))}</pubDate>\n` +
        `      <description>${esc(p.description || p.title)}</description>\n` +
        '    </item>'
      );
    })
    .join('\n');

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0">\n' +
    '  <channel>\n' +
    '    <title>Obsidian Delta: Blog</title>\n' +
    `    <link>${SITE}/blog/</link>\n` +
    '    <description>Writing from Obsidian Delta on cognition, cognitive companions, and where the work stands.</description>\n' +
    (items ? items + '\n' : '') +
    '  </channel>\n' +
    '</rss>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
