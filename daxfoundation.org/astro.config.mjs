// @ts-check
import { defineConfig } from 'astro/config';

// Static output, deployed to Cloudflare Pages (project "daxfoundation-org").
// Same shape as views/jeyanandan: no adapter, no integrations, stylesheets
// inlined. The site is a few KB and has nothing in it that can break a deploy.
export default defineConfig({
  site: 'https://daxfoundation.org',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
});
