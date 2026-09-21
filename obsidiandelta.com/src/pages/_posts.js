// The post index for obsidiandelta.com, in one place. Same contract as
// views/jeyanandan/src/pages/_posts.js, which this mirrors on purpose.
//
// Four routes want the same list: /blog/, /blog/<slug>/, /sitemap.xml and any
// page that later links to recent writing. They all read this module, so they
// cannot disagree about what is published.
//
// The leading underscore keeps this file out of the router: Astro skips
// `_`-prefixed files when it builds the route table.
//
// PUBLISHED, LISTED, UNLISTED, DRAFT -- four different things.
//   draft     `draft: true`. The post does not build at all in a production
//             build: no page, no URL, nothing. It builds ONLY when the build
//             is run with OD_SHOW_DRAFTS=1 (local review and a preview
//             deployment), and even then it is noindex, carries a visible
//             DRAFT banner and never enters the sitemap.
//   unlisted  `unlisted: true`, or its slug in UNLISTED_SLUGS below. The post
//             builds and its URL serves in full; no index here advertises it,
//             not /blog/ and not the sitemap. Unlisted also means noindex.
//   neither   published and listed, the normal case.
//
// The one addition over jeyanandan.com is OD_SHOW_DRAFTS, because this site is
// being reviewed as a sample before anything on it is published. Unset -- which
// is what the production deploy step does -- behaves exactly like jeyanandan.

const modules = import.meta.glob('../posts/*.md', { eager: true });

/** Build-time switch for review builds. Never set it on a production deploy. */
export const SHOW_DRAFTS = process.env.OD_SHOW_DRAFTS === '1';

/** Posts kept off every index by the site rather than by the post itself. */
export const UNLISTED_SLUGS = new Set([]);

/** The one rule for unlisted: either route in is enough. */
export const isUnlisted = (slug, frontmatter = {}) =>
  frontmatter.unlisted === true || UNLISTED_SLUGS.has(slug);

export const isDraft = (frontmatter = {}) => frontmatter.draft === true;

/** A page asks search engines to stay away if it is unlisted or a draft. */
export const isNoindex = (slug, frontmatter = {}) =>
  isUnlisted(slug, frontmatter) || isDraft(frontmatter);

const newestFirst = (a, b) => new Date(b.date) - new Date(a.date);

/** Every post that builds in this build, newest first, with its renderer. */
export const postEntries = Object.entries(modules)
  .map(([file, mod]) => {
    const slug = file.split('/').pop().replace(/\.md$/, '');
    const frontmatter = mod.frontmatter || {};
    return {
      slug,
      frontmatter,
      Content: mod.Content,
    };
  })
  .filter((e) => SHOW_DRAFTS || !isDraft(e.frontmatter))
  .sort((a, b) => newestFirst(a.frontmatter, b.frontmatter));

/** The same list as plain records, for indexes. */
export const posts = postEntries.map(({ slug, frontmatter }) => ({
  ...frontmatter,
  slug,
  draft: isDraft(frontmatter),
  unlisted: isUnlisted(slug, frontmatter),
}));

/** What /blog/ may show. In a review build that includes drafts, labelled. */
export const listedPosts = posts.filter((p) => !p.unlisted);

/** What the sitemap may advertise: listed, and never a draft. */
export const indexablePosts = listedPosts.filter((p) => !p.draft);

export const formatDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
