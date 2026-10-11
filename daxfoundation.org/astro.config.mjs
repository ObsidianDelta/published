// @ts-check
import { defineConfig } from 'astro/config';

// Static output, deployed to Cloudflare Pages (project "daxfoundation-org").
// Same shape as views/jeyanandan: no adapter, no integrations, stylesheets
// inlined. The site is a few KB and has nothing in it that can break a deploy.
//
// 2026-10-11: /metadax/showcases/ had no index and returned a 404 (every
// showcase lives under it, so people trim the URL and land on nothing). The
// showcases are listed in the Showcases section of /metadax/samples/, so the
// bare folder redirects there. Astro writes a static meta-refresh page; no
// _redirects file.
export default defineConfig({
  site: 'https://daxfoundation.org',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  redirects: {
    '/metadax/showcases': '/metadax/samples/#h-showcases',
  },
});
