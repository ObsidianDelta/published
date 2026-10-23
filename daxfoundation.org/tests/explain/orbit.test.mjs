// Tests for the orbit scene's pure maths (src/scenes/orbit/model.ts).
// No deps: node --test. model.ts is TypeScript, so bundle it to a temp .mjs with esbuild
// inside the test, then import it.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const modelSrc = join(here, "..", "..", "src", "scenes", "orbit", "model.ts");

const tmp = mkdtempSync(join(tmpdir(), "orbit-model-"));
const outFile = join(tmp, "model.mjs");
execFileSync(
  "npx",
  ["-y", "esbuild", modelSrc, "--bundle", "--format=esm", `--outfile=${outFile}`],
  { stdio: "ignore" },
);
const model = await import(pathToFileURL(outFile).href);

process.on("exit", () => {
  try {
    rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
});

test("30 node positions spread over 3 rings, 10 per ring", () => {
  const pos = model.ringPositions(30, 3, 1);
  assert.equal(pos.length, 30, "thirty positions");
  const byRing = [0, 0, 0];
  for (const p of pos) {
    assert.ok(p.ring >= 0 && p.ring < 3, "ring in range");
    byRing[p.ring]++;
  }
  assert.deepEqual(byRing, [10, 10, 10], "ten nodes on each of the three rings");
});

test("ring radii follow the 1:2:3 ratio", () => {
  const pitch = 2.5;
  const pos = model.ringPositions(30, 3, pitch);
  const radii = [0, 1, 2].map((r) => pos.find((p) => p.ring === r).radius);
  assert.deepEqual(radii, [pitch * 1, pitch * 2, pitch * 3]);
});

test("every node sits on its ring's circle (x,z match radius)", () => {
  const pos = model.ringPositions(30, 3, 3);
  for (const p of pos) {
    const r = Math.hypot(p.x, p.z);
    assert.ok(Math.abs(r - p.radius) < 1e-9, "x,z lie on the ring radius");
  }
});

test("state boundaries sit at 0.15 / 0.45 / 0.75", () => {
  assert.deepEqual([...model.STATE_BOUNDS], [0.15, 0.45, 0.75]);
  assert.equal(model.stateForProgress(0.0), "classroom");
  assert.equal(model.stateForProgress(0.149), "classroom");
  assert.equal(model.stateForProgress(0.15), "invert");
  assert.equal(model.stateForProgress(0.44), "invert");
  assert.equal(model.stateForProgress(0.45), "context");
  assert.equal(model.stateForProgress(0.74), "context");
  assert.equal(model.stateForProgress(0.75), "reverse");
  assert.equal(model.stateForProgress(1.0), "reverse");
});

test("the counter is strictly monotone and steps by 20..60", () => {
  const seq = model.counterSequence(1310, 8, 0x04);
  assert.equal(seq.length, 9, "start plus one per swap");
  assert.equal(seq[0], 1310, "starts at counterStart");
  for (let i = 1; i < seq.length; i++) {
    const step = seq[i] - seq[i - 1];
    assert.ok(step > 0, `step ${i} is positive (monotone)`);
    assert.ok(step >= 20 && step <= 60, `step ${i} (${step}) within 20..60`);
  }
});

test("the counter is deterministic for a fixed seed", () => {
  const a = model.counterSequence(1310, 8, 0x04);
  const b = model.counterSequence(1310, 8, 0x04);
  assert.deepEqual(a, b);
});
