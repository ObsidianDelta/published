// @ts-check
import { defineConfig } from 'astro/config';

// Static output, deployed to Cloudflare Pages (project "daxfoundation-org").
// Same shape as views/jeyanandan: no adapter, no integrations, stylesheets
// inlined. The site is a few KB and has nothing in it that can break a deploy.
//
// 2026-10-11: /metadax/showcases/ had no index and returned a 404, so the bare
// folder redirected to /metadax/samples/#h-showcases via a static meta-refresh.
// 2026-10-18 (PUBLISH-1018 D3): it is now a real page -- the library index at
// src/pages/metadax/showcases/index.astro, reading the registry -- so the
// redirect is gone (a route and a redirect at the same path cannot coexist).
export default defineConfig({
  site: 'https://daxfoundation.org',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
});
