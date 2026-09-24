// The post index for jeyanandan.com, in one place.
//
// Three routes want the same list: the home page, /blog/ and /sitemap.xml.
// Each of them used to run its own import.meta.glob with its own copy of the
// draft filter, which is exactly how a post ends up listed in one of them and
// missing from another. They all read this module now.
//
// The leading underscore is what keeps this file out of the router. Everything
// else in src/pages/ is a route; this is not one, and Astro skips `_`-prefixed
// files when it builds the route table.
//
// PUBLISHED, LISTED, DRAFT -- three different things.
//   draft     the post does not build at all. No page, no URL, nothing.
//   unlisted  the post builds and its URL serves in full, and no index here
//             advertises it: not the home page, not /blog/, not the sitemap.
//   neither   published and listed, which is the normal case.
//
// A post can ask to be unlisted with `unlisted: true` in its own frontmatter.
// UNLISTED_SLUGS below is the second way in, for when the decision belongs to
// the site rather than to the post. Either is enough; both are honoured.
//
// THE SET ABOVE IS THE TRUTH. These notes are history, and history goes stale
// faster than code does. If a comment here and UNLISTED_SLUGS disagree, the
// comment is the thing that is wrong.
//
//   fuckarian -- unlisted on 2026-09-20, Jason's call, and still unlisted:
//   "Hide the Constraint blog post and also the Fuckarian blog post. Just hide
//   them, so those are just work in progress." It builds, its URL serves in
//   full, no index here advertises it, and it carries noindex. Since
//   2026-09-21 nothing links to it either -- the last public link, from
//   the-constraint, came out. It is named here rather than in the post's own
//   frontmatter only because src/posts/ was being edited elsewhere at the
//   time; moving it into that file later changes nothing, because the two
//   routes are OR'd.
//
//   the-constraint -- unlisted alongside fuckarian on 2026-09-20, then
//   published on 2026-09-23, Jason's call, and taken back out of this set. It
//   is an ordinary listed post now: home page, /blog/, sitemap, no noindex.
//   Nothing about it is special any more, and it is mentioned here only
//   because the pair of them was hidden together and someone reading an older
//   revision of this file will expect to find it in the set.
//
//   WHAT MUST NOT HAPPEN TO EITHER, listed or not: `draft: true`, a rename, or
//   a move. Any of the three takes the URL down, and deploy-jeyanandan.yml
//   gates on both https://jeyanandan.com/blog/fuckarian/ and
//   https://jeyanandan.com/blog/the-constraint/ building, and on their body
//   text rendering into those pages. Unlisting a post is safe. Unbuilding one
//   fails the deploy, which is the point.
//
// UNLISTED ALSO MEANS NOINDEX. Keeping a post off this site's own indexes does
// not keep it out of a search engine that reaches it some other way, so
// src/pages/blog/[slug].astro asks isUnlisted() below and, for an unlisted
// post, has Base.astro emit <meta name="robots" content="noindex, nofollow">.
// The indexes and the robots tag read the same function, so a post cannot be
// off the lists and still invite indexing, or the other way round.

const modules = import.meta.glob('../posts/*.md', { eager: true });

export const UNLISTED_SLUGS = new Set(['fuckarian']);

/** The one rule for unlisted: either route in is enough. */
export const isUnlisted = (slug, frontmatter = {}) =>
  frontmatter.unlisted === true || UNLISTED_SLUGS.has(slug);

const newestFirst = (a, b) => new Date(b.date) - new Date(a.date);

/** Every post that builds, newest first. A draft is not a post. */
export const posts = Object.entries(modules)
  .map(([file, mod]) => {
    const slug = file.split('/').pop().replace(/\.md$/, '');
    const frontmatter = mod.frontmatter || {};
    return {
      ...frontmatter,
      slug,
      unlisted: isUnlisted(slug, frontmatter),
    };
  })
  .filter((p) => !p.draft)
  .sort(newestFirst);

/** The posts an index is allowed to advertise. */
export const listedPosts = posts.filter((p) => !p.unlisted);

/** Title and deck rejoined, for the places that show a post on one line. */
export const fullTitle = (p) => (p.subtitle ? `${p.title} — ${p.subtitle}` : p.title);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
