// EXP-15 render bug tests: data/build level checks for bugs 2, 3, and 5.
// Bug 2: edges must not be drawn to nodes hidden at the current reading level.
// Bug 3: job-left scene must draw its resting picture at progress 0 on mount.
// Bug 5: graph/index.ts must not statically import three.js (dynamic import only).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", ".."); // views/daxfoundation
const scenesDir = resolve(root, "src/scenes");
const graphIndexPath = resolve(scenesDir, "graph/index.ts");
const jobScenePath = resolve(scenesDir, "job-left/scene.ts");

// --- Bug 2: edges to hidden nodes ---

test("graph/index.ts updateEdges parks edges to hidden nodes off-screen", () => {
  const src = readFileSync(graphIndexPath, "utf8");
  // The updateEdges function must check node visibility (p < 0.05) before drawing
  assert.ok(
    /\.p\s*<\s*0\.0[15]/.test(src),
    "updateEdges must check node.p threshold to skip hidden-node edges",
  );
  // Must park invisible edges at a far-off value to prevent stray lines
  assert.ok(
    src.includes("9999"),
    "updateEdges must park hidden edges off-screen (9999)",
  );
});

test("graph/fallback.ts liveEdges filters by nodeShown for both endpoints", () => {
  const src = readFileSync(resolve(scenesDir, "graph/fallback.ts"), "utf8");
  // edgeShown checks nodeShown for both from and to
  assert.ok(
    /nodeShown\(byId\.get\(e\.from\)/.test(src),
    "fallback edgeShown must check source node visibility",
  );
  assert.ok(
    /nodeShown\(byId\.get\(e\.to\)/.test(src),
    "fallback edgeShown must check target node visibility",
  );
});

// --- Bug 3: job-left resting picture at progress 0 ---

test("job-left/scene.ts done pillars are visible at progress 0", () => {
  assert.ok(existsSync(jobScenePath), "src/scenes/job-left/scene.ts must exist");
  const src = readFileSync(jobScenePath, "utf8");
  // render(0) must show done pillar groups — they must always have opacity "1"
  assert.ok(
    /done\[i\]\.g\.setAttribute\(["']opacity["'],\s*["']1["']\)/.test(src),
    "done pillar groups must always have opacity 1 (resting picture visible at progress 0)",
  );
});

test("job-left/scene.ts render function does not hide done pillars at t=0", () => {
  const src = readFileSync(jobScenePath, "utf8");
  // Must NOT set done pillar opacity from segment() — that made them invisible at t=0
  const renderFn = src.slice(src.indexOf("function render(t: number)"));
  assert.ok(
    !renderFn.slice(0, renderFn.indexOf("left.setAttribute")).includes("String(k)"),
    "done pillar opacity must not be segment-computed (would be 0 at t=0)",
  );
});

// --- Bug 5: no static import of three.js in graph/index.ts ---

test("graph/index.ts does not statically value-import three.js", () => {
  const src = readFileSync(graphIndexPath, "utf8");
  // Static value import: "import * as THREE from 'three'" without 'type' keyword
  const hasStaticTHREE = /^import\s+\*\s+as\s+THREE\s+from\s+["']three["']/m.test(src);
  assert.ok(
    !hasStaticTHREE,
    "graph/index.ts must not statically import * as THREE (prevents three.js loading on all pages)",
  );
  // Static value import of WebGPURenderer (not type-only) must not be present
  const hasStaticWebGPU =
    /^import\s+\{[^}]*WebGPURenderer[^}]*\}\s+from\s+["']three\/webgpu["']/m.test(src);
  assert.ok(
    !hasStaticWebGPU,
    "graph/index.ts must not statically value-import WebGPURenderer (use dynamic import)",
  );
});

test("graph/index.ts uses dynamic import for three.js inside mount()", () => {
  const src = readFileSync(graphIndexPath, "utf8");
  // Dynamic import must be present
  assert.ok(
    src.includes('import("three")') || src.includes("import('three')"),
    "graph/index.ts must dynamically import three.js inside mount()",
  );
  assert.ok(
    src.includes('import("three/webgpu")') || src.includes("import('three/webgpu')"),
    "graph/index.ts must dynamically import three/webgpu inside mount()",
  );
});
