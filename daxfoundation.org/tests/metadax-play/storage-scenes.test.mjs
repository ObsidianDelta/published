#!/usr/bin/env node
// Tests for the two storage scenes (storage-stack, thin-pool) added in branch
// storage-scenes. Run with: node --test views/daxfoundation/tests/metadax-play/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const playDir = resolve(here, "../../public/metadax/play");

// ── Load package-check (for the scene-unit checker) ──────────────────────────
const checkSrc = readFileSync(resolve(playDir, "package-check.js"), "utf8");
const ctx = { globalThis: {}, TextEncoder, TextDecoder, Buffer };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(checkSrc, ctx);
const { checkPackage } = ctx.MetaDAXCheck;

// ── Load scenes.js as ESM (it re-exports the storage scenes) ─────────────────
const scenesUrl = new URL("../../public/metadax/play/scenes/scenes.js", import.meta.url);
const { normalizeParams, svgFor, altFor, SCENES } = await import(scenesUrl.href);

const BACKENDS = ["dir", "lvmthin", "zfs", "zfs-ct"];
const LANGS = ["fr", "en"];

// ── 1. both scenes are registered ────────────────────────────────────────────
test("SCENES has storage-stack and thin-pool", () => {
  assert.ok(SCENES["storage-stack"], "storage-stack missing from SCENES");
  assert.ok(SCENES["thin-pool"], "thin-pool missing from SCENES");
});

// ── 2. svgFor returns "<svg" for every backend × level × lang (storage-stack) ─
for (const backend of BACKENDS) {
  for (const level of [1, 2, 3]) {
    for (const lang of LANGS) {
      test(`storage-stack: svgFor(${backend}, L${level}, ${lang}) returns <svg`, () => {
        const svg = svgFor("storage-stack", { backend, lang, vmid: 101, disk_gb: 64 }, "plain", level);
        assert.ok(typeof svg === "string", "must return a string");
        assert.ok(svg.trimStart().startsWith("<svg"), "must start with <svg");
      });
    }
  }
}

// ── 2b. thin-pool svgFor for every level × lang, incl. an over-allocated set ──
for (const level of [1, 2, 3]) {
  for (const lang of LANGS) {
    test(`thin-pool: svgFor(L${level}, ${lang}) returns <svg`, () => {
      const svg = svgFor("thin-pool", { lang, capacity_gb: 50, disks: [32, 32, 32, 32], written: [3, 10, 20, 8] }, "space", level);
      assert.ok(typeof svg === "string", "must return a string");
      assert.ok(svg.trimStart().startsWith("<svg"), "must start with <svg");
    });
  }
}

// ── 3. normalizeParams: defaults + enum fallback ──────────────────────────────
test("storage-stack: normalizeParams fills defaults", () => {
  const p = normalizeParams("storage-stack", {});
  assert.equal(p.backend, "dir");
  assert.equal(p.vmid, 100);
  assert.equal(p.disk_gb, 32);
  assert.equal(p.lang, "en");
});

test("storage-stack: enum backend keeps a valid value", () => {
  assert.equal(normalizeParams("storage-stack", { backend: "zfs" }).backend, "zfs");
});

test("storage-stack: enum backend falls back to default on bad value", () => {
  assert.equal(normalizeParams("storage-stack", { backend: "foo" }).backend, "dir");
});

test("storage-stack: enum lang falls back to default on bad value", () => {
  assert.equal(normalizeParams("storage-stack", { lang: "de" }).lang, "en");
});

test("storage-stack: int params clamp", () => {
  const p = normalizeParams("storage-stack", { vmid: 9999, disk_gb: -5 });
  assert.equal(p.vmid, 999);
  assert.equal(p.disk_gb, 1);
});

test("thin-pool: normalizeParams fills defaults and clamps arrays", () => {
  const p = normalizeParams("thin-pool", {});
  assert.deepEqual(p.disks, [32, 32, 32, 32]);
  assert.deepEqual(p.written, [3, 10, 20, 8]);
  assert.equal(p.discard, false);
  assert.equal(p.lang, "en");
});

test("thin-pool: enum lang fallback", () => {
  assert.equal(normalizeParams("thin-pool", { lang: "de" }).lang, "en");
});

// ── 4. alt() is a non-empty string in the chosen lang ─────────────────────────
test("storage-stack: alt is non-empty and mentions the volume", () => {
  const fr = altFor("storage-stack", { backend: "dir", lang: "fr", vmid: 123 }, "plain", 1);
  assert.ok(fr.length > 0 && /vmstore:123/.test(fr), "fr alt should mention the substituted volume line");
  const en = altFor("storage-stack", { backend: "zfs", lang: "en" }, "plain", 1);
  assert.ok(/stack/.test(en), "en alt should read in English");
});

test("thin-pool: alt mentions the numbers", () => {
  const a = altFor("thin-pool", { capacity_gb: 100, disks: [32, 32], written: [10, 20], lang: "en" }, "plain", 1);
  assert.ok(/100/.test(a) && /64/.test(a) && /30/.test(a), "alt should mention pool, declared and written totals");
});

// ── 5. checker accepts valid blocks, rejects backend "foo" and lang "de" ──────
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

test("checker: accepts a valid storage-stack block", () => {
  const pkg = minPkg({ type: "scene", scene: "storage-stack", params: { backend: "lvmthin", vmid: 101, disk_gb: 64, lang: "fr" }, theme: "plain", level: 2 });
  const { errors } = checkPackage(pkg, {});
  const bad = errors.filter((e) => /storage-stack|scene|backend|lang/.test(e.path));
  assert.equal(bad.length, 0, "no errors for a valid storage-stack block: " + JSON.stringify(bad));
});

test("checker: accepts a valid thin-pool block", () => {
  const pkg = minPkg({ type: "scene", scene: "thin-pool", params: { capacity_gb: 100, disks: [32, 32, 32], written: [3, 10, 20], discard: true, lang: "en" }, theme: "sage", level: 3 });
  const { errors } = checkPackage(pkg, {});
  const bad = errors.filter((e) => /thin-pool|scene/.test(e.path));
  assert.equal(bad.length, 0, "no errors for a valid thin-pool block: " + JSON.stringify(bad));
});

test("checker: rejects backend \"foo\"", () => {
  const pkg = minPkg({ type: "scene", scene: "storage-stack", params: { backend: "foo" }, theme: "plain", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const bad = errors.filter((e) => /backend/.test(e.path));
  assert.ok(bad.length > 0, "should error on backend foo (not one of the enum values)");
});

test("checker: rejects lang \"de\"", () => {
  const pkg = minPkg({ type: "scene", scene: "storage-stack", params: { lang: "de" }, theme: "plain", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const bad = errors.filter((e) => /lang/.test(e.path));
  assert.ok(bad.length > 0, "should error on lang de (not one of the enum values)");
});

test("checker: rejects thin-pool capacity out of range", () => {
  const pkg = minPkg({ type: "scene", scene: "thin-pool", params: { capacity_gb: 5 }, theme: "plain", level: 1 });
  const { errors } = checkPackage(pkg, {});
  const bad = errors.filter((e) => /capacity_gb/.test(e.path));
  assert.ok(bad.length > 0, "should error on capacity_gb=5 (below min 10)");
});
