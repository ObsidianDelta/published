// EXP-4b scene checks (node --test, no extra deps): every scene's index.ts and
// fallback.ts must bundle under 60 KB and contain "setProgress"; registry.ts must
// use import.meta.glob. esbuild is invoked via `npx -y esbuild`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", ".."); // views/daxfoundation
const scenesDir = join(root, "src", "scenes");
const SCENES = ["map", "job-left", "chat-vs-record"];
const MAX = 60 * 1024;

function bundle(entry, out) {
  execFileSync(
    "npx",
    ["-y", "esbuild", entry, "--bundle", "--format=esm", `--outfile=${out}`],
    { cwd: root, stdio: "pipe" },
  );
}

for (const scene of SCENES) {
  for (const file of ["index.ts", "fallback.ts"]) {
    test(`${scene}/${file} bundles < 60KB and exposes setProgress`, () => {
      const dir = mkdtempSync(join(tmpdir(), "scene-4b-"));
      const out = join(dir, `${scene}-${file}.js`);
      bundle(join(scenesDir, scene, file), out);
      const size = statSync(out).size;
      assert.ok(size < MAX, `${scene}/${file} bundle is ${size} bytes (>= ${MAX})`);
      const code = readFileSync(out, "utf8");
      assert.ok(code.includes("setProgress"), `${scene}/${file} bundle lacks "setProgress"`);
    });
  }
}

test("registry.ts uses import.meta.glob", () => {
  const code = readFileSync(join(scenesDir, "registry.ts"), "utf8");
  assert.ok(code.includes("import.meta.glob"), "registry.ts lacks import.meta.glob");
});
