// EXP-8b scene checks (node --test, no extra deps):
//  - the attention scene exports meta + mount (index.ts and fallback.ts);
//  - the registry picks it up (import.meta.glob + both files present on disk);
//  - the built page for chapter 04 ships data-scene="attention";
//  - the orbit scene compiles with no line-loop primitive (WebGPU does not support it).
// The orbit bundle is built with `three` external: THREE's own library defines a LineLoop
// class, so a whole-dist grep would always match — the meaningful target is the scene code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", ".."); // views/daxfoundation
const scenesDir = join(root, "src", "scenes");
const attnDir = join(scenesDir, "attention");

test("attention/index.ts exports meta (name attention) and mount", () => {
  const code = readFileSync(join(attnDir, "index.ts"), "utf8");
  assert.ok(/export\s+const\s+meta\b/.test(code), "index.ts lacks `export const meta`");
  assert.ok(/name:\s*["']attention["']/.test(code), "index.ts meta.name is not \"attention\"");
  assert.ok(/export\s+function\s+mount\b/.test(code), "index.ts lacks `export function mount`");
  // the caption is DOM text, not canvas text
  assert.ok(code.includes("aria-live"), "index.ts caption is not a DOM live region");
});

test("attention/fallback.ts exports meta + mount and is a static SVG", () => {
  const code = readFileSync(join(attnDir, "fallback.ts"), "utf8");
  assert.ok(/export\s+const\s+meta\b/.test(code), "fallback.ts lacks `export const meta`");
  assert.ok(/export\s+function\s+mount\b/.test(code), "fallback.ts lacks `export function mount`");
  assert.ok(code.includes("preserveAspectRatio"), "fallback SVG lacks preserveAspectRatio");
});

test("attention has a README, like the other scenes", () => {
  assert.ok(existsSync(join(attnDir, "README.md")), "attention/README.md is missing");
});

test("registry picks up attention (import.meta.glob + both files present)", () => {
  const reg = readFileSync(join(scenesDir, "registry.ts"), "utf8");
  assert.ok(reg.includes("import.meta.glob"), "registry.ts lacks import.meta.glob");
  assert.ok(existsSync(join(attnDir, "index.ts")), "attention/index.ts missing");
  assert.ok(existsSync(join(attnDir, "fallback.ts")), "attention/fallback.ts missing");
});

test("built chapter 04 ships data-scene=\"attention\"", () => {
  const page = join(root, "dist", "explain", "metadax", "04-roles", "index.html");
  assert.ok(existsSync(page), `built page missing (run npm run build first): ${page}`);
  const html = readFileSync(page, "utf8");
  assert.ok(html.includes('data-scene="attention"'), "chapter 04 page lacks data-scene=\"attention\"");
});

test("orbit scene code contains no line-loop primitive", () => {
  const dir = mkdtempSync(join(tmpdir(), "scenes-8b-"));
  const out = join(dir, "orbit.js");
  execFileSync(
    "npx",
    ["-y", "esbuild", join(scenesDir, "orbit", "index.ts"), "--bundle", "--format=esm",
      "--external:three", `--outfile=${out}`],
    { cwd: root, stdio: "pipe" },
  );
  const code = readFileSync(out, "utf8");
  assert.ok(!code.includes("LineLoop"), "orbit bundle still references LineLoop");
});
