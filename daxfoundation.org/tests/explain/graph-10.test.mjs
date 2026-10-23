// EXP-10: the Foundation as one signed graph.
// Checks the graph data is internally sound, the built home page still carries
// every string the deploy gate greps for (verbatim) plus the graph scene mount,
// and that the graph scene is registered (its folder has index.ts + fallback.ts,
// which is what src/scenes/registry.ts globs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", ".."); // views/daxfoundation
const repoRoot = resolve(root, "..", "..");

const graph = JSON.parse(
  readFileSync(resolve(root, "src/data/graph.json"), "utf8"),
);

test("graph.json parses and is a signed, versioned graph", () => {
  assert.equal(typeof graph.version, "number");
  assert.equal(graph.signed_by, "person");
  assert.ok(Array.isArray(graph.nodes) && graph.nodes.length > 0);
  assert.ok(Array.isArray(graph.edges) && graph.edges.length > 0);
});

test("every node has an id, kind, level 1..5 and one line", () => {
  const kinds = new Set(["purpose", "initiative", "protocol", "concept"]);
  const seen = new Set();
  for (const n of graph.nodes) {
    assert.ok(n.id, `node missing id: ${JSON.stringify(n)}`);
    assert.ok(!seen.has(n.id), `duplicate node id ${n.id}`);
    seen.add(n.id);
    assert.ok(kinds.has(n.kind), `node ${n.id} bad kind ${n.kind}`);
    assert.ok(
      Number.isInteger(n.level) && n.level >= 1 && n.level <= 5,
      `node ${n.id} level out of 1..5: ${n.level}`,
    );
    assert.equal(typeof n.line, "string");
    assert.ok(n.line.length > 0, `node ${n.id} has no line`);
  }
});

test("every edge references existing nodes, has cp:true, and a level 1..5", () => {
  const ids = new Set(graph.nodes.map((n) => n.id));
  for (const e of graph.edges) {
    assert.ok(ids.has(e.from), `edge from unknown node ${e.from}`);
    assert.ok(ids.has(e.to), `edge to unknown node ${e.to}`);
    assert.equal(e.cp, true, `edge ${e.from}->${e.to} is not a Protocol edge`);
    assert.ok(typeof e.type === "string" && e.type.length > 0);
    assert.ok(
      Number.isInteger(e.level) && e.level >= 1 && e.level <= 5,
      `edge ${e.from}->${e.to} level out of 1..5: ${e.level}`,
    );
  }
});

test("every chapter reference is null or a known run / collection", () => {
  // A chapter is a collection id to open. Concept nodes point at a real explain
  // collection or null; initiative/protocol nodes name the run they open (the
  // Foundation's runs, present or planned), each a valid slug.
  const collections = readdirSync(resolve(root, "src/content/explain"), {
    withFileTypes: true,
  })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  assert.ok(collections.includes("foundation"));
  assert.ok(collections.includes("metadax"));

  const runNodes = new Set(["initiative", "protocol"]);
  for (const n of graph.nodes) {
    if (n.chapter === null) continue;
    assert.equal(typeof n.chapter, "string");
    assert.ok(/^[a-z0-9-]+$/.test(n.chapter), `node ${n.id} chapter not a slug`);
    if (!runNodes.has(n.kind)) {
      // Concept chapters must resolve to a collection that exists.
      assert.ok(
        collections.includes(n.chapter),
        `concept node ${n.id} chapter ${n.chapter} has no collection`,
      );
    }
  }
});

test("the graph scene is registered (folder has index.ts and fallback.ts)", () => {
  // registry.ts uses import.meta.glob('./*/index.ts'); a folder with both files
  // is listed by it. Assert the files the glob would pick up exist.
  assert.ok(existsSync(resolve(root, "src/scenes/graph/index.ts")));
  assert.ok(existsSync(resolve(root, "src/scenes/graph/fallback.ts")));
  const reg = readFileSync(resolve(root, "src/scenes/registry.ts"), "utf8");
  assert.match(reg, /import\.meta\.glob\("\.\/\*\/index\.ts"\)/);
});

test("the built home page carries every deploy-gated string and mounts the graph scene", () => {
  const dist = resolve(root, "dist/index.html");
  if (!existsSync(dist)) {
    // The build has not run in this checkout; skip rather than fail so the data
    // checks above still run standalone. CI runs `npm run build` first.
    console.log("dist/index.html absent; run `npm run build` first — skipping build assertions");
    return;
  }
  const html = readFileSync(dist, "utf8");

  // Parse the required home-page strings straight out of the deploy workflow:
  // the `grep -qF "..." "$F"` and `grep -qF '...' "$F"` lines that gate $F=dist/index.html.
  const wf = readFileSync(
    resolve(repoRoot, ".github/workflows/deploy-daxfoundation.yml"),
    "utf8",
  );
  const required = [];
  const re = /grep -qF (?:"((?:[^"\\]|\\.)*)"|'([^']*)') "\$F"/g;
  let m;
  while ((m = re.exec(wf)) !== null) {
    const s = (m[1] ?? m[2]).replace(/\\"/g, '"');
    required.push(s);
  }
  assert.ok(required.length >= 5, "parsed too few required strings from the workflow");
  for (const s of required) {
    assert.ok(html.includes(s), `built home page is missing required string: ${s}`);
  }

  // The map chapter is at the top of the home page and mounts the graph scene.
  assert.ok(html.includes('data-scene="graph"'), 'home page is missing data-scene="graph"');
});
