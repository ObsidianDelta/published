// @ts-check
import { defineConfig } from 'astro/config';

// obsidiandelta.com, as an Astro site. PRODUCTION since the 2026-09-21 cut-over:
// .github/workflows/deploy-obsidiandelta.yml builds this directory and deploys
// dist/ to the Cloudflare Pages project "obsidiandelta-apex", which serves
// www.obsidiandelta.com. The hand-uploaded bundle it replaced is public/.
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
// Everything that is new -- /blog/, /blog/<slug>/, /opportunities/, /404.html,
// /sitemap.xml, /robots.txt, /version.json -- comes from src/ and the deploy
// stamp.
//
// MOVED PAGES redirect through `redirects` below, which the static build turns
// into plain HTML pages with a meta refresh and a canonical link. Never a
// _redirects, _headers, _routes.json or _worker.js: the deploy gate fails on
// any of them, because nothing may change how Pages routes /mp/.
export default defineConfig({
  site: 'https://www.obsidiandelta.com',
  redirects: {
    // 2026-10-11: /learning/ became /opportunities/ (the emergent frame). The
    // pinned home page still links /learning/; these keep every old link alive.
    '/learning': '/opportunities/',
    '/learning/sample-report': '/opportunities/sample-report/',
  },
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
