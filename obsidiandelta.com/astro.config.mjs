// @ts-check
import { defineConfig } from 'astro/config';

// obsidiandelta.com, as an Astro site. SAMPLE BUILD, branch od-astro-sample.
// Nothing here is deployed; www.obsidiandelta.com is still served by the
// Cloudflare Pages project "obsidiandelta-apex" from a hand-uploaded bundle.
//
// Same shape as views/jeyanandan/: static output, no adapter, no integrations,
// one dependency. A dependency this site does not have is one that cannot break
// a deploy.
//
// THE HOME PAGE IS NOT AN ASTRO PAGE. public/index.html is the live
// www.obsidiandelta.com front page, byte for byte, and Astro copies public/
// into dist/ untouched. There is deliberately no src/pages/index.astro: adding
// one would replace the live page. The same goes for everything else in
// public/ -- it is the live bundle, carried over verbatim, and
// LIVE-BUNDLE.sha256 (outside public/, so it never ships) pins every byte:
// `cd dist && sha256sum -c ../LIVE-BUNDLE.sha256` must pass on every build.
//
// /mp/ IS THE ACCOUNTING AREA. public/mp/** is served exactly as it is today.
// Do not edit, rename, reformat or "tidy" anything under public/mp/, and do not
// add a route under src/pages/mp/. A route there would shadow the static page.
//
// Everything that is new -- /blog/, /blog/<slug>/, /404.html, /sitemap.xml,
// /robots.txt, /version.json -- comes from src/ and the deploy stamp.
export default defineConfig({
  site: 'https://www.obsidiandelta.com',
  markdown: {
    // Same reasoning as jeyanandan.com: no highlighter stamping inline colours
    // onto <pre> blocks; the stylesheet owns code blocks.
    syntaxHighlight: false,
  },
  build: {
    format: 'directory',
    // Each generated page is self-contained: no render-blocking stylesheet
    // request. The static pages in public/ are untouched by this setting.
    inlineStylesheets: 'always',
  },
});
