// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Promote a lone image in a markdown paragraph to <figure> + <figcaption>,
 * carrying the image's alt text down into the caption.
 *
 * The long posts run on diagrams -- the snowflake piece alone has 28 of them --
 * and markdown gives an image nowhere to put a caption, so every description
 * was living in an alt attribute that nobody sees. This walks the tree by hand
 * rather than pulling in unist-util-visit, for the same reason the site has no
 * integrations: a dependency it does not have is a dependency that cannot break
 * a deploy at two in the morning.
 *
 * The alt moves to the caption and the image is left alt="", so a screen reader
 * reads the description once rather than twice. Anything that is not a
 * paragraph holding exactly one image is passed through untouched.
 *
 * @returns {(tree: any) => void}
 */
function rehypeFigures() {
  return (tree) => {
    /** @param {any} node */
    const promote = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      node.children = node.children.map((/** @type {any} */ child) => {
        promote(child);
        if (child.type !== 'element' || child.tagName !== 'p') return child;
        if (!Array.isArray(child.children)) return child;
        const kept = child.children.filter(
          (/** @type {any} */ k) => !(k.type === 'text' && k.value.trim() === '')
        );
        if (kept.length !== 1) return child;
        const img = kept[0];
        if (img.type !== 'element' || img.tagName !== 'img') return child;
        const props = img.properties || {};
        const alt = typeof props.alt === 'string' ? props.alt : '';
        const caption = [];
        if (alt) {
          img.properties = { ...props, alt: '' };
          caption.push({
            type: 'element',
            tagName: 'figcaption',
            properties: {},
            children: [{ type: 'text', value: alt }],
          });
        }
        return {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [img, ...caption],
        };
      });
    };
    promote(tree);
  };
}

// Static output, deployed to Cloudflare Pages (project "jeyanandan").
// No adapter and no integrations on purpose: this site is a page, a blog and
// one recorder, and every dependency it does not have is one that cannot break
// a deploy at two in the morning.
export default defineConfig({
  site: 'https://jeyanandan.com',
  markdown: {
    // Every fenced block on this site is an ASCII flow diagram tagged `text`,
    // so there is nothing for a highlighter to highlight. What Shiki's default
    // theme did do was stamp each <pre> with an inline
    // `background-color:#24292e;color:#e1e4e8` -- a dark slab dropped into a
    // cream page -- which the blog's own `.prose code` rule then repainted
    // cream on the inner <code>. Pale text on a pale bar: unreadable, worst of
    // all on a phone. Turning the highlighter off hands the blocks back to the
    // stylesheet, which is where this site's typography belongs.
    syntaxHighlight: false,
    rehypePlugins: [rehypeFigures],
  },
  build: {
    format: 'directory',
    // Every page ends up self-contained: no render-blocking stylesheet request
    // and nothing to go missing behind a cache. The whole site is a few KB.
    inlineStylesheets: 'always',
  },
});
