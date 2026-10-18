// The writing index for daxfoundation.org, in one place.
//
// /writing/ and each piece under it read this module, so they cannot disagree
// about what is published. The shape is views/jeyanandan/src/pages/_posts.js,
// cut down: no unlisted set, because nothing here is unlisted.
//
// The leading underscore keeps this file out of the router.
//
//   draft: true   the piece does not build at all. No page, no URL, nothing.
//
// PUBLISHED AND UPDATED. `date` is first publication and never changes.
// `updated` (optional, YYYY-MM-DD) is set by hand in the same commit as any
// change to a piece's text; it is shown only when later than `date`. Sorting
// stays on `date`. The History link on every piece is its commit list in the
// public record, github.com/ObsidianDelta/published (2026-10-01).
//
// 2026-10-01: the first piece, human-delta-value.md, at Jason's request ("one
// of the first blog posts on daxfoundation.org... more technical").
//
// 2026-10-18: series support added. Posts may carry series, part,
// series_total (int), and related (list of URLs). SERIES names each series;
// seriesOf(key) returns its published posts in part order.

const modules = import.meta.glob('../posts/*.md', { eager: true });

const newestFirst = (a, b) => new Date(b.date) - new Date(a.date);

/** Every piece that builds, newest first. A draft is not a piece. */
export const posts = Object.entries(modules)
  .map(([file, mod]) => {
    const slug = file.split('/').pop().replace(/\.md$/, '');
    const fm = mod.frontmatter || {};
    return {
      ...fm,
      slug,
      series: fm.series ?? null,
      part: fm.part ?? null,
      series_total: fm.series_total ?? null,
      related: fm.related ?? [],
    };
  })
  .filter((p) => !p.draft)
  .sort(newestFirst);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const historyUrl = (slug) =>
  `https://github.com/ObsidianDelta/published/commits/main/daxfoundation.org/src/posts/${slug}.md`;

export const SERIES = {
  'for-parents': {
    title: 'For parents and tutors',
    blurb: 'Five short pieces for a parent at the kitchen table, each pointing at a page that already exists.',
  },
  'results': {
    title: 'What has run',
    blurb: 'What has actually been run, with every number labelled.',
  },
  'accountability': {
    title: 'Accountability: the Constraint Protocol',
    blurb: 'A record, not a wall: what a declared constraint is and what one run of it showed.',
  },
};

/** Published posts of a named series, sorted by part ascending. */
export const seriesOf = (key) =>
  posts.filter((p) => p.series === key).sort((a, b) => (a.part || 0) - (b.part || 0));
