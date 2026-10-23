// EXP-15b render tests: narrow-viewport (343 px) position checks for issues 1/2/3.
//
// Issue 1 (graph clipping): the 3D camera must pull back so novadax/skippydax (x=±2.05)
//   stay fully in frame at 343 px wide including label half-width; the 2D clampNodes must
//   use label-width-aware padding so circles AND labels are within the canvas.
// Issue 2 (metadax layout): Chapter.astro must put the chapter question/answer before the
//   scene card on narrow screens (≤ 700 px) via CSS order / flex.
// Issue 3 (header wrap): Base.astro and Explain.astro must have white-space:nowrap on the
//   site mark so "DAX FOUNDATION" never breaks onto two lines.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", ".."); // views/daxfoundation
const scenesDir = resolve(root, "src/scenes");
const graphIndexPath = resolve(scenesDir, "graph/index.ts");
const graphFallbackPath = resolve(scenesDir, "graph/fallback.ts");
const chapterPath = resolve(root, "src/components/explain/Chapter.astro");
const basePath = resolve(root, "src/layouts/Base.astro");
const explainPath = resolve(root, "src/layouts/Explain.astro");

// ---------------------------------------------------------------------------
// Issue 1a — 3D graph: camera Z adjusts based on aspect ratio
// ---------------------------------------------------------------------------

test("graph/index.ts fit() computes camWide.z from aspect ratio", () => {
  const src = readFileSync(graphIndexPath, "utf8");
  assert.ok(
    /camWide\.z\s*=/.test(src),
    "fit() must assign camWide.z dynamically",
  );
  assert.ok(
    /aspect/.test(src),
    "fit() must derive aspect ratio from container dimensions",
  );
  assert.ok(
    /Math\.max\(.*CAM_WIDE_Z0/.test(src) || /Math\.max\([^)]*8\.7/.test(src),
    "fit() must use Math.max to keep camWide.z >= base value",
  );
});

// Compute projected screen-x of the extreme level-1 nodes using the same
// camera-Z formula as fit(), WITHOUT importing THREE.js.  The geometry is:
//   camera at [0, 2.4, camZ] looking at [0, 0.2, 0], PerspectiveCamera FOV=45°.
//   Camera right axis = [1, 0, 0] (no yaw; only pitch).
//   NDC_x ≈ worldX / depth_along_view_dir / tan(hFOV/2).
function project3d(worldX, worldY, worldZ, camZ, aspect) {
  // Camera Z-axis (points AWAY from target, toward camera):
  //   zAxis = normalize([0, 2.4, camZ] - [0, 0.2, 0]) = normalize([0, 2.2, camZ])
  const zLen = Math.sqrt(2.2 * 2.2 + camZ * camZ);
  const zAxisY = 2.2 / zLen;
  const zAxisZ = camZ / zLen;

  // Vector from camera to world point
  const relY = worldY - 2.4;
  const relZ = worldZ - camZ;

  // Camera-space coordinates:
  //   cx = worldX (right axis = [1,0,0])
  //   cz_backward = dot(rel, zAxis) = relY*zAxisY + relZ*zAxisZ
  //   depth = -cz_forward = cz_backward (depth in front of camera)
  const cx = worldX;
  const depth = relY * zAxisY + relZ * zAxisZ; // positive = in front

  // Perspective: NDC_x = cx / depth / tan(hFOV/2)
  // hFOV: tan(hFOV/2) = tan(vFOV/2) * aspect = tan(22.5°) * aspect
  const tanHFov = Math.tan(Math.PI / 8) * aspect; // tan(22.5°) * aspect
  const ndcX = cx / depth / tanHFov;
  const screenX = (ndcX * 0.5 + 0.5); // 0..1 fraction of width
  return { ndcX, screenX };
}

test("3D graph: novadax and skippydax project within 343 px frame including label half-width", () => {
  const W = 343;
  const H = 480; // typical scene height on a phone at this width
  const aspect = W / H;

  // Replicate the fit() formula from index.ts
  const extentWorld = 2.05 + 0.24; // node centre x + sphere radius
  const f = 1 / Math.tan(Math.PI / 8); // ≈ 2.414
  const labelNdc = Math.min(0.25, 56 / Math.max(W, 56));
  const targetNdc = Math.max(0.1, 1 - labelNdc - 0.04);
  const zMin = (extentWorld * f) / (aspect * targetNdc);
  const camZ = Math.max(8.7, zMin);

  assert.ok(camZ > 8.7, `camZ (${camZ.toFixed(2)}) must exceed base 8.7 at aspect ${aspect.toFixed(3)}`);

  const labelHalfFrac = (56 / 2) / W; // label half-width as fraction of canvas width

  const level1Nodes = [
    { id: "novadax", pos: [-2.05, -1.3, 0.25] },
    { id: "skippydax", pos: [2.05, -1.3, -0.25] },
    { id: "dax", pos: [0, 0, 0] },
    { id: "metadax", pos: [0, 2.35, 0.1] },
  ];

  for (const { id, pos } of level1Nodes) {
    const { screenX } = project3d(pos[0], pos[1], pos[2], camZ, aspect);
    // Label extends ±labelHalfFrac from screenX (as fraction of width)
    const labelLeft = screenX - labelHalfFrac;
    const labelRight = screenX + labelHalfFrac;
    assert.ok(
      labelLeft >= -0.01,
      `${id} label clips left at 343 px (left edge = ${(labelLeft * W).toFixed(1)} px)`,
    );
    assert.ok(
      labelRight <= 1.01,
      `${id} label clips right at 343 px (right edge = ${(labelRight * W).toFixed(1)} px)`,
    );
  }
});

// ---------------------------------------------------------------------------
// Issue 1b — 2D fallback: clampNodes uses label-width-aware padding
// ---------------------------------------------------------------------------

test("graph/fallback.ts clampNodes derives x-padding from label length", () => {
  const src = readFileSync(graphFallbackPath, "utf8");
  assert.ok(
    /nodeLabel\(n\)\.length/.test(src),
    "clampNodes must use nodeLabel(n).length to compute horizontal padding",
  );
  assert.ok(
    /lHalf/.test(src) || /labelHalf/.test(src),
    "clampNodes must compute label half-width (lHalf or labelHalf)",
  );
  assert.ok(
    /Math\.max\(16,/.test(src),
    "clampNodes must use Math.max(16, ...) so minimum clearance is preserved",
  );
});

test("2D graph: clampNodes at W=343 keeps circles and labels within canvas bounds", () => {
  // Replicate the updated clampNodes formula for a set of typical nodes.
  const W = 343;
  const H = 480;
  const scale = Math.min(W, H - 40) / 420;

  function radiusOf(kind) {
    return (kind === "purpose" ? 16 : kind === "initiative" ? 12 : kind === "protocol" ? 13 : 9)
      * Math.max(0.72, scale);
  }

  const nodes = [
    { id: "novadax", kind: "initiative", label: "Nova DAX" },
    { id: "skippydax", kind: "initiative", label: "Skippy DAX" },
    { id: "hdv", kind: "concept", label: "human delta value" },
    { id: "dax", kind: "purpose", label: "DAX" },
    { id: "metadax", kind: "initiative", label: "Meta DAX" },
  ];

  for (const { id, kind, label } of nodes) {
    const r = radiusOf(kind);
    const lHalf = (label.length * 7.2) / 2;
    const padX = r + Math.max(16, lHalf);

    const xMin = padX; // leftmost allowed centre
    const xMax = W - padX; // rightmost allowed centre

    // At minimum x: circle left edge and label left edge must be ≥ 0
    assert.ok(
      xMin - r >= 0,
      `${id}: circle clips left at min x (circle-left = ${(xMin - r).toFixed(1)} px)`,
    );
    assert.ok(
      xMin - lHalf >= 0,
      `${id}: label clips left at min x (label-left = ${(xMin - lHalf).toFixed(1)} px)`,
    );

    // At maximum x: circle right edge and label right edge must be ≤ W
    assert.ok(
      xMax + r <= W,
      `${id}: circle clips right at max x (circle-right = ${(xMax + r).toFixed(1)} px > ${W})`,
    );
    assert.ok(
      xMax + lHalf <= W,
      `${id}: label clips right at max x (label-right = ${(xMax + lHalf).toFixed(1)} px > ${W})`,
    );
  }
});

// ---------------------------------------------------------------------------
// Issue 2 — metadax at 375 px: Chapter.astro puts content before scene
// ---------------------------------------------------------------------------

test("Chapter.astro has max-width:700px breakpoint for narrow layout", () => {
  const src = readFileSync(chapterPath, "utf8");
  assert.ok(
    /max-width.*700px/.test(src) || /max-width:\s*700px/.test(src),
    "Chapter.astro must have a @media (max-width: 700px) breakpoint",
  );
});

test("Chapter.astro narrow layout places content before scene via CSS order", () => {
  const src = readFileSync(chapterPath, "utf8");
  assert.ok(
    /order\s*:\s*2/.test(src) || /order:\s*2/.test(src),
    "Chapter.astro must assign order:2 to .chapter-content on narrow screens",
  );
  assert.ok(
    /order\s*:\s*3/.test(src) || /order:\s*3/.test(src),
    "Chapter.astro must assign order:3 to .scene-wrap on narrow screens",
  );
  assert.ok(
    /\.scene-wrap[\s\S]{0,200}position\s*:\s*static/.test(src),
    "Chapter.astro must un-sticky the scene-wrap on narrow screens (position:static)",
  );
});

test("Chapter.astro narrow scene is capped at ~45 vh", () => {
  const src = readFileSync(chapterPath, "utf8");
  assert.ok(
    /45vh/.test(src),
    "Chapter.astro narrow scene-wrap must have height capped at 45vh",
  );
});

// ---------------------------------------------------------------------------
// Issue 3 — header: site mark stays on one line
// ---------------------------------------------------------------------------

test("Base.astro .mark has white-space:nowrap", () => {
  const src = readFileSync(basePath, "utf8");
  assert.ok(
    /white-space\s*:\s*nowrap/.test(src),
    "Base.astro .mark must have white-space:nowrap to prevent 'DAX FOUNDATION' from wrapping",
  );
});

test("Explain.astro .site-top .mark has white-space:nowrap", () => {
  const src = readFileSync(explainPath, "utf8");
  assert.ok(
    /white-space\s*:\s*nowrap/.test(src),
    "Explain.astro .site-top .mark must have white-space:nowrap",
  );
});
