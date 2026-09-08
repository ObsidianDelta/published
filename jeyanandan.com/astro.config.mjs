// @ts-check
import { defineConfig } from 'astro/config';

// Static output, deployed to Cloudflare Pages (project "jeyanandan").
// No adapter and no integrations on purpose: this site is a page, a blog and
// one recorder, and every dependency it does not have is one that cannot break
// a deploy at two in the morning.
export default defineConfig({
  site: 'https://jeyanandan.com',
  build: {
    format: 'directory',
    // Every page ends up self-contained: no render-blocking stylesheet request
    // and nothing to go missing behind a cache. The whole site is a few KB.
    inlineStylesheets: 'always',
  },
});
