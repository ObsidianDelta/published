// Site cohesion (2026-10-23, Jason: "make sure absolutely nothing is orphaned").
// Runs against the built site in dist/ (npm run build first, as the other built-
// page tests do). It fails the build when:
//   1. a built page has no link to it from any other page (an orphan);
//   2. a regular page is missing from src/data/site-map.json (it would have no
//      "Where this fits" line and no "Go deeper" link from its run);
//   3. a site-map entry points at a page that is not built (a dead entry);
//   4. an internal link points at a page or file that does not exist.
// Exempt: the 404 page, the entries in site-map.json "exempt", and a run's
// one-chapter share pages (/explain/<run>/<id>/), which are reached from shared
// links and carry their own link back into the run (checked here instead).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname, posix, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const dist = join(root, "dist");
const siteMap = JSON.parse(readFileSync(join(root, "src/data/site-map.json"), "utf8"));

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const files = existsSync(dist) ? walk(dist) : [];
const urlOf = (p) => {
  const rel = "/" + relative(dist, p).split("\\").join("/");
  return rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel;
};
const pages = new Map(files.filter((p) => p.endsWith(".html")).map((p) => [urlOf(p), readFileSync(p, "utf8")]));
const assets = new Set(files.map(urlOf));

function norm(href, from) {
  let h = href.split("#")[0].split("?")[0];
  if (h.startsWith("https://daxfoundation.org")) h = h.slice("https://daxfoundation.org".length) || "/";
  if (!h || /^[a-z]+:/i.test(h) || h.startsWith("//")) return null;
  if (!h.startsWith("/")) h = posix.normalize(posix.join(from.endsWith("/") ? from : posix.dirname(from) + "/", h));
  if (!extname(h) && !h.endsWith("/")) h += "/";
  return h;
}
// Files the deploy workflow adds to dist/ after the build (deploy-daxfoundation.yml:
// "Skill zip for the Claude app"); they are real on the live site.
const DEPLOY_BUILT = new Set(["/metadax/downloads/metadax-homeschool.zip"]);
const inbound = new Map();
const broken = [];
for (const [u, html] of pages) {
  if (u === "/404.html") continue; // its only link is a canonical tag to /404/
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const n = norm(m[1].replace(/&amp;/g, "&"), u);
    if (!n || n === u) continue;
    if (!inbound.has(n)) inbound.set(n, new Set());
    inbound.get(n).add(u);
    const exists = pages.has(n) || assets.has(n) || assets.has(n + "index.html") || assets.has(n.replace(/\/$/, ""));
    if (!exists && !DEPLOY_BUILT.has(n) && !n.startsWith("/cdn-cgi/")) broken.push(`${u} -> ${m[1]}`);
  }
}
const exempt = new Set(["/404.html", ...(siteMap.exempt || [])]);
const isShare = (u) => /^\/explain\/[a-z-]+\/[0-9]{2}-[a-z-]+\/$/.test(u);
const mapped = (u) =>
  siteMap.pages.some((e) => (e.path.endsWith("*") ? u.startsWith(e.path.slice(0, -1)) && u !== e.path.slice(0, -1) : e.path === u));

test("site cohesion: the build ran", () => {
  assert.ok(pages.size > 50, "dist/ has no pages; run npm run build first");
});

test("site cohesion: no page is orphaned (every page has a link from another page)", () => {
  const orphans = [...pages.keys()].filter((u) => !exempt.has(u) && !isShare(u) && !(inbound.get(u)?.size));
  assert.deepEqual(orphans, [], "orphaned pages:\n" + orphans.join("\n"));
});

test("site cohesion: every one-chapter share page links back into its run", () => {
  const missing = [...pages.keys()].filter(isShare).filter((u) => {
    const run = u.split("/")[2];
    return !pages.get(u).includes(`href="/explain/${run}/#`);
  });
  assert.deepEqual(missing, [], "share pages without a way back:\n" + missing.join("\n"));
});

test("site cohesion: every regular page is placed in src/data/site-map.json", () => {
  const unmapped = [...pages.keys()].filter((u) => !u.startsWith("/explain") && !exempt.has(u) && !mapped(u));
  assert.deepEqual(unmapped, [], "add these to src/data/site-map.json:\n" + unmapped.join("\n"));
});

test("site cohesion: every site-map entry is a built page", () => {
  const dead = siteMap.pages
    .filter((e) => !e.path.endsWith("*"))
    .map((e) => e.path)
    .filter((p) => !pages.has(p));
  const deadAlso = Object.values(siteMap.also || {}).flat().map((x) => x.path.split("#")[0]).filter((p) => !pages.has(p));
  assert.deepEqual([...dead, ...deadAlso], [], "site-map entries with no page:\n" + [...dead, ...deadAlso].join("\n"));
});

test("site cohesion: no internal link is broken", () => {
  const uniq = [...new Set(broken)];
  assert.deepEqual(uniq, [], "broken internal links:\n" + uniq.slice(0, 40).join("\n"));
});
