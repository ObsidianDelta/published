// EXP-10b: the opening graph made epic in 3D (three.js via three/webgpu), on the
// same data and the same contract; EXP-10's 2D graph is now the fallback. These
// checks assert the restructure holds and the GPU path is wired as specified:
//  - graph/index.ts imports from "three/webgpu" (the WebGPU renderer, auto WebGL2);
//  - graph/fallback.ts exists and exports mount (the no-WebGL / reduced-data / print path);
//  - no "LineLoop" anywhere under src/scenes (WebGPURenderer does not support it);
//  - the built home page still carries data-scene="graph";
//  - the scene emits a screen-reader-only node list (data-graph-sr) in the built bundle.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", ".."); // views/daxfoundation
const graphDir = resolve(root, "src/scenes/graph");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

test("graph/index.ts is the 3D scene: it imports from three/webgpu", () => {
  const src = readFileSync(resolve(graphDir, "index.ts"), "utf8");
  assert.match(
    src,
    /from\s+["']three\/webgpu["']/,
    "index.ts must import the WebGPU renderer from three/webgpu",
  );
  assert.match(src, /WebGPURenderer/, "index.ts must use WebGPURenderer");
});

test("graph/fallback.ts exists and exports a mount function", () => {
  const p = resolve(graphDir, "fallback.ts");
  assert.ok(existsSync(p), "src/scenes/graph/fallback.ts must exist");
  const src = readFileSync(p, "utf8");
  assert.match(
    src,
    /export\s+function\s+mount\b|export\s*\{[^}]*\bmount\b/,
    "fallback.ts must export mount",
  );
});

test("no LineLoop anywhere under src/scenes (unsupported by WebGPURenderer)", () => {
  const files = walk(resolve(root, "src/scenes")).filter((f) => /\.(ts|js|mjs)$/.test(f));
  const offenders = files.filter((f) => readFileSync(f, "utf8").includes("LineLoop"));
  assert.equal(offenders.length, 0, "LineLoop found in: " + offenders.join(", "));
});

test("index.ts falls back to the 2D graph and mounts it on the no-GPU path", () => {
  const src = readFileSync(resolve(graphDir, "index.ts"), "utf8");
  assert.match(src, /prefers-reduced-data/, "must honour prefers-reduced-data");
  assert.match(src, /hasWebGL2/, "must check for WebGL2");
  assert.match(src, /import\(["']\.\/fallback["']\)/, "must dynamically import ./fallback");
});

test("the built home page contains data-scene=\"graph\"", () => {
  const home = resolve(root, "dist/index.html");
  assert.ok(existsSync(home), "dist/index.html must exist (run `npm run build` first)");
  const html = readFileSync(home, "utf8");
  assert.ok(html.includes('data-scene="graph"'), "home page must mount the graph scene");
});

test("the screen-reader-only node list markup is emitted in the built bundle", () => {
  const astroDir = resolve(root, "dist/_astro");
  assert.ok(existsSync(astroDir), "dist/_astro must exist (run `npm run build` first)");
  const js = readdirSync(astroDir).filter((f) => f.endsWith(".js"));
  const hit = js.some((f) => readFileSync(join(astroDir, f), "utf8").includes("data-graph-sr"));
  assert.ok(hit, "the graph scene must emit its sr-only node list (data-graph-sr)");
});
