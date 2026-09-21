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
//   fuckarian -- 2026-09-20, Jason's call: published, still linked where it is
//   relevant, kept off the reading list. It is listed here rather than in the
//   post's frontmatter only because src/posts/ was being edited elsewhere at
//   the time; moving it into that file later changes nothing, because the two
//   routes are OR'd. What must not happen to that post is `draft: true`, or a
//   rename, or a move -- any of the three takes
//   https://jeyanandan.com/blog/fuckarian/ down, and deploy-jeyanandan.yml
//   gates on that page building and on its body text rendering into it.
//
//   the-constraint -- 2026-09-20, later the same day, Jason's call, and with it
//   fuckarian changes from "kept off the reading list" to hidden: "Hide the
//   Constraint blog post and also the Fuckarian blog post. Just hide them, so
//   those are just work in progress." Both stay built and both URLs keep
//   serving, so he can keep reviewing them. The same three things must not
//   happen to it as to fuckarian, for the same reason: deploy-jeyanandan.yml
//   gates on https://jeyanandan.com/blog/the-constraint/ building too.
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
