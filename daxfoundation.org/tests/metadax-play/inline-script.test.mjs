#!/usr/bin/env node
// Tests that every inline <script> in the metadax play HTML files compiles.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const playDir = resolve(here, "../../public/metadax/play");

function extractInlineScripts(html) {
  const bodies = [];
  const re = /<script(?:\s[^>]*)?>([^]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    // skip scripts with a src attribute
    if (/\bsrc\s*=/i.test(tag.slice(0, tag.indexOf(">") + 1))) continue;
    const body = m[1];
    if (body.trim()) bodies.push(body);
  }
  return bodies;
}

for (const filename of ["index.html", "print.html"]) {
  const html = readFileSync(resolve(playDir, filename), "utf8");
  const scripts = extractInlineScripts(html);

  test(`${filename}: has at least one inline script`, () => {
    assert.ok(scripts.length > 0, `no inline scripts found in ${filename}`);
  });

  for (let i = 0; i < scripts.length; i++) {
    test(`${filename}: inline script #${i + 1} compiles`, () => {
      assert.doesNotThrow(
        () => new vm.Script(scripts[i]),
        `script #${i + 1} in ${filename} failed to compile`
      );
    });
  }
}
