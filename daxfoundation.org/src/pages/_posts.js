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

const modules = import.meta.glob('../posts/*.md', { eager: true });

const newestFirst = (a, b) => new Date(b.date) - new Date(a.date);

/** Every piece that builds, newest first. A draft is not a piece. */
export const posts = Object.entries(modules)
  .map(([file, mod]) => {
    const slug = file.split('/').pop().replace(/\.md$/, '');
    return { ...(mod.frontmatter || {}), slug };
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
