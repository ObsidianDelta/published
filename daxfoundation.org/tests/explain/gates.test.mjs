// Deploy gates for the explainer (Explainer Kit v1, spec sections 6 and 7).
// Run after a build: read every .html under dist/explain and fail on any forbidden
// string, then assert the key routes were emitted. node --test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distExplain = join(__dirname, "../../dist/explain");

// Case-insensitive; these must never ship (section 6 plus the model vendor names).
const FORBIDDEN = [
  "non-profit",
  "charity",
  "life's work",
  "manual cognitive",
  "and his cognitive companion",
  "chatgpt",
  "openai",
  "anthropic",
  "gemini",
];

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

test("dist/explain exists (build ran)", () => {
  assert.ok(existsSync(distExplain), "dist/explain must exist; run npm run build first");
});

test("no forbidden string in any dist/explain HTML", () => {
  const files = htmlFiles(distExplain);
  assert.ok(files.length > 0, "expected at least one HTML file under dist/explain");
  const hits = [];
  for (const f of files) {
    const text = readFileSync(f, "utf8").toLowerCase();
    for (const bad of FORBIDDEN) {
      if (text.includes(bad)) hits.push(`${bad} in ${f}`);
    }
  }
  assert.deepEqual(hits, [], `forbidden strings found:\n${hits.join("\n")}`);
});

test("key routes were emitted", () => {
  const required = [
    "index.html",
    "metadax/index.html",
    "metadax/04-roles/index.html",
    "metadax/index.json",
  ];
  for (const rel of required) {
    assert.ok(existsSync(join(distExplain, rel)), `missing dist/explain/${rel}`);
  }
});
