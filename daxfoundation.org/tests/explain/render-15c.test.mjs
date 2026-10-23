// EXP-15c render test: built index.html must contain <a href> for every run node in graph.json.
// "Run nodes" are nodes whose chapter resolves to a live route; the static HTML must expose
// these as real <a href> links so keyboard and touch users can reach them without JS.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", ".."); // views/daxfoundation
const distIndex = resolve(root, "dist/index.html");
const graphPath = resolve(root, "src/data/graph.json");

// Routes that are live today (must each produce a real <a href> in the built HTML).
const ROUTES = {
  metadax: "/explain/metadax/",
  "constraint-protocol": "/constraint-protocol/",
};

test("dist/index.html exists after build", () => {
  assert.ok(
    existsSync(distIndex),
    "dist/index.html must exist (run `npm run build` first)",
  );
});

test("dist/index.html contains <a href> for every run node in graph.json", () => {
  if (!existsSync(distIndex)) {
    // Covered by the test above; skip rather than double-fail.
    return;
  }
  const html = readFileSync(distIndex, "utf8");
  const graph = JSON.parse(readFileSync(graphPath, "utf8"));

  const runNodes = graph.nodes.filter(
    (n) => n.chapter && ROUTES[n.chapter],
  );
  assert.ok(
    runNodes.length > 0,
    "graph.json must have at least one run node with a live route",
  );

  for (const n of runNodes) {
    const href = ROUTES[n.chapter];
    assert.ok(
      html.includes(`href="${href}"`),
      `index.html is missing <a href="${href}"> for run node "${n.id}" (${n.label})`,
    );
  }
});

test("dist/index.html contains the graph scene mount point", () => {
  if (!existsSync(distIndex)) return;
  const html = readFileSync(distIndex, "utf8");
  assert.ok(
    html.includes('data-scene="graph"'),
    'index.html must include the graph scene mount point (data-scene="graph")',
  );
});
