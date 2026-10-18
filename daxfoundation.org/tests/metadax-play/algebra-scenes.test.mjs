#!/usr/bin/env node
// Tests for the four algebra scenes added in branch algebra-scenes.
// Run with: node --test "views/daxfoundation/tests/metadax-play/*.test.*"
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const playDir = resolve(here, "../../public/metadax/play");

// ── Load package-check (for scene-unit checker) ──────────────────────────────
const checkSrc = readFileSync(resolve(playDir, "package-check.js"), "utf8");
const ctx = { globalThis: {}, TextEncoder, TextDecoder, Buffer };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(checkSrc, ctx);
const { checkPackage } = ctx.MetaDAXCheck;

// ── Load scenes.js as ESM ─────────────────────────────────────────────────────
// scenes.js is an ESM module; we import it with a dynamic import so the test
// runner can find it without a separate loader.
const scenesUrl = new URL("../../public/metadax/play/scenes/scenes.js", import.meta.url);
const { normalizeParams, svgFor, altFor, SCENES, THEMES } = await import(scenesUrl.href);

// ── Helpers ───────────────────────────────────────────────────────────────────
const ALGEBRA_SCENES = ["balance", "function-machine", "bar-model", "algebra-tiles"];

function sceneExists(id) {
  return !!SCENES[id];
}

// ── 1. sage theme exists ──────────────────────────────────────────────────────
test("THEMES includes sage", () => {
  assert.ok(THEMES.sage, "sage theme missing from THEMES");
  assert.equal(typeof THEMES.sage.shadeOn, "number");
  assert.equal(typeof THEMES.sage.ink, "number");
  // No brown: hue of ink should not be in the orange-brown range.
  // A simple check: red channel not dominant over green channel by a large margin.
  const ink = THEMES.sage.ink;
  const r = (ink >> 16) & 255, g = (ink >> 8) & 255;
  assert.ok(g >= r - 20, "sage ink should not be brown (red channel too dominant vs green)");
});

// ── 2. normalizeParams clamps for each algebra scene ─────────────────────────
test("balance: normalizeParams clamps left_x above max", () => {
  const p = normalizeParams("balance", { left_x: 99, left_c: 4, right_x: 1, right_c: 11 });
  assert.equal(p.left_x, 5, "left_x should clamp to max 5");
});

test("balance: normalizeParams clamps right_c above max", () => {
  const p = normalizeParams("balance", { left_x: 2, left_c: 4, right_x: 1, right_c: 999 });
  assert.equal(p.right_c, 60, "right_c should clamp to max 60");
});

test("balance: normalizeParams clamps left_x below min", () => {
  const p = normalizeParams("balance", { left_x: -5 });
  assert.equal(p.left_x, 0, "left_x should clamp to min 0");
});

test("function-machine: normalizeParams clamps mul above max", () => {
  const p = normalizeParams("function-machine", { mul: 99, add: 5, input: 9 });
  assert.equal(p.mul, 12, "mul should clamp to max 12");
});

test("function-machine: normalizeParams clamps add below min", () => {
  const p = normalizeParams("function-machine", { add: -999 });
  assert.equal(p.add, -20, "add should clamp to min -20");
});

test("bar-model: normalizeParams clamps total above max", () => {
  const p = normalizeParams("bar-model", { total: 9999 });
  assert.equal(p.total, 500, "total should clamp to max 500");
});

test("bar-model: normalizeParams clamps extras array elements", () => {
  const p = normalizeParams("bar-model", { extras: [-99, 999], total: 41 });
  assert.equal(p.extras[0], -20, "extras[0] should clamp to min -20");
  assert.equal(p.extras[1], 60, "extras[1] should clamp to max 60");
});

test("algebra-tiles: normalizeParams clamps groups above max", () => {
  const p = normalizeParams("algebra-tiles", { groups: 99 });
  assert.equal(p.groups, 6, "groups should clamp to max 6");
});

test("algebra-tiles: normalizeParams fills defaults", () => {
  const p = normalizeParams("algebra-tiles", {});
  assert.equal(p.groups, 4);
  assert.equal(p.xs, 1);
  assert.equal(p.units, 3);
  assert.equal(p.total, 56);
});

// ── 3. alt() is non-empty and mentions the numbers ───────────────────────────
for (const id of ALGEBRA_SCENES) {
  for (const level of [1, 2, 3]) {
    test(`${id}: alt(level ${level}) is non-empty`, () => {
      const a = altFor(id, {}, "sage", level);
      assert.ok(typeof a === "string" && a.length > 0, "alt must return a non-empty string");
    });
  }
}

test("balance: alt mentions left and right numbers", () => {
  const a = altFor("balance", { left_x: 2, left_c: 4, right_x: 1, right_c: 11 }, "plain", 1);
  assert.ok(/2/.test(a), "alt should mention 2");
  assert.ok(/4/.test(a), "alt should mention 4");
  assert.ok(/11/.test(a), "alt should mention 11");
});

test("function-machine: alt mentions mul and output", () => {
  const a = altFor("function-machine", { mul: 3, add: 7, input: 5 }, "plain", 1);
  assert.ok(/3/.test(a), "alt should mention multiplier 3");
  assert.ok(/22/.test(a) || /output/.test(a.toLowerCase()), "alt should mention output 22 or label it");
});

test("bar-model: alt mentions total", () => {
  const a = altFor("bar-model", { extras: [0, 3], total: 72 }, "plain", 1);
  assert.ok(/72/.test(a), "alt should mention total 72");
});

test("algebra-tiles: alt mentions groups and total", () => {
  const a = altFor("algebra-tiles", { groups: 4, xs: 1, units: 3, total: 56 }, "plain", 1);
  assert.ok(/4/.test(a), "alt should mention 4 groups");
  assert.ok(/56/.test(a), "alt should mention total 56");
});

// ── 4. svgFor() returns a string starting with <svg ──────────────────────────
for (const id of ALGEBRA_SCENES) {
  for (const level of [1, 2, 3]) {
    test(`${id}: svgFor(level ${level}, sage) returns <svg`, () => {
      const svg = svgFor(id, {}, "sage", level);
      assert.ok(typeof svg === "string", "svgFor must return a string");
      assert.ok(svg.trimStart().startsWith("<svg"), "svgFor must start with <svg");
    });
  }
}

// ── 4b. svgFor(scene, params, "space", level) returns an <svg for ALL scenes ──
for (const id of Object.keys(SCENES)) {
  for (const level of [1, 2, 3]) {
    test(`${id}: svgFor(level ${level}, space) returns <svg`, () => {
      const svg = svgFor(id, {}, "space", level);
      assert.ok(typeof svg === "string", "svgFor must return a string");
      assert.ok(svg.trimStart().startsWith("<svg"), "svgFor must start with <svg");
    });
  }
}

// ── 5. package-check accepts valid scene blocks, rejects bad param values ─────
function minPkg(sceneBlock) {
  return {
    format: "metadax-package",
    v: 1,
    guide: {
      sections: [
        { id: "upnext",  blocks: [{ type: "lead", title: "L", body: "b", prompt: "p" }] },
        { id: "learned", blocks: [] },
        { id: "steps",   blocks: [] },
        { id: "tricky",  blocks: [{ type: "human", title: "H", items: ["x"] }] },
        { id: "tellus",  blocks: [
          { type: "faq", q: "Q", a: "A", more: [{ q: "Q2", a: "A2", more: [{ q: "Q3", a: "A3" }] }] }
        ]},
        { id: "scenes-extra", blocks: [sceneBlock] },
      ],
    },
    learner: {
      sections: [{
        id: "main", blocks: [
          { type: "lead", title: "L", body: "b", prompt: "p" },
          { type: "quiz", id: "q1", title: "T", start: 1, up_after: 3, down_after: 1,
            mistakes: { m1: { name: "N", guide: "G" } },
            levels: [{ level: 1, label: "L1", items: [
              { q: "q", choices: [
                { text: "right", correct: true, msg: "y" },
                { text: "wrong", mistake: "m1", msg: "n" },
              ]},
            ]}],
          },
          { type: "faq", q: "Q", a: "A", more: [{ q: "Q2", a: "A2", more: [{ q: "Q3", a: "A3" }] }] },
        ],
      }],
    },
  };
}

test("checker: accepts valid balance scene block", () => {
  const pkg = minPkg({ type: "scene", scene: "balance", params: { left_x: 2, left_c: 4, right_x: 1, right_c: 11 }, theme: "sage", level: 2 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /balance|scene/.test(e.path); });
  assert.equal(sceneErrors.length, 0, "no scene errors for valid balance block: " + JSON.stringify(sceneErrors));
});

test("checker: accepts valid function-machine scene block", () => {
  const pkg = minPkg({ type: "scene", scene: "function-machine", params: { mul: 2, add: 5, input: 9, hide_input: true }, theme: "sage", level: 3 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /function-machine|scene/.test(e.path); });
  assert.equal(sceneErrors.length, 0, "no scene errors for valid function-machine block");
});

test("checker: accepts valid bar-model scene block", () => {
  const pkg = minPkg({ type: "scene", scene: "bar-model", params: { extras: [0, 3], total: 41 }, theme: "sage", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /bar-model|scene/.test(e.path); });
  assert.equal(sceneErrors.length, 0, "no scene errors for valid bar-model block");
});

test("checker: accepts valid algebra-tiles scene block", () => {
  const pkg = minPkg({ type: "scene", scene: "algebra-tiles", params: { groups: 4, xs: 1, units: 3, total: 56 }, theme: "sage", level: 2 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /algebra-tiles|scene/.test(e.path); });
  assert.equal(sceneErrors.length, 0, "no scene errors for valid algebra-tiles block");
});

test("checker: rejects balance left_x out of range", () => {
  const pkg = minPkg({ type: "scene", scene: "balance", params: { left_x: 99 }, theme: "sage", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /left_x/.test(e.path); });
  assert.ok(sceneErrors.length > 0, "should error on left_x=99 (out of range 0..5)");
});

test("checker: rejects function-machine mul out of range", () => {
  const pkg = minPkg({ type: "scene", scene: "function-machine", params: { mul: 99 }, theme: "plain", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /mul/.test(e.path); });
  assert.ok(sceneErrors.length > 0, "should error on mul=99 (out of range 1..12)");
});

test("checker: rejects bar-model total out of range", () => {
  const pkg = minPkg({ type: "scene", scene: "bar-model", params: { total: 9999 }, theme: "football", level: 2 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /total/.test(e.path); });
  assert.ok(sceneErrors.length > 0, "should error on total=9999 (out of range 0..500)");
});

test("checker: rejects algebra-tiles groups out of range", () => {
  const pkg = minPkg({ type: "scene", scene: "algebra-tiles", params: { groups: 99 }, theme: "plain", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /groups/.test(e.path); });
  assert.ok(sceneErrors.length > 0, "should error on groups=99 (out of range 1..6)");
});

test("checker: rejects unknown scene id", () => {
  const pkg = minPkg({ type: "scene", scene: "not-a-scene", params: {}, theme: "plain", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const sceneErrors = errors.filter(function (e) { return /unknown scene/.test(e.msg); });
  assert.ok(sceneErrors.length > 0, "should error on unknown scene id");
});

test("checker: rejects unknown theme on balance block", () => {
  const pkg = minPkg({ type: "scene", scene: "balance", params: {}, theme: "not-a-theme", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const themeErrors = errors.filter(function (e) { return /theme/.test(e.msg.toLowerCase()) || /theme/.test(e.path); });
  assert.ok(themeErrors.length > 0, "should error on unknown theme");
});
