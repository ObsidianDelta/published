// Unit tests for the play-page engine (engine.js). Run from this directory:
//   node --test
// No browser: these exercise the pure logic the DOM code calls.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
// engine.js is a browser classic script (the page loads it via <script src>),
// so load it here through a module shim rather than require() — the package is
// ESM and the file is served to browsers, not imported as a node module.
const E = (function () {
  const src = fs.readFileSync(path.join(__dirname, "../../public/metadax/play/engine.js"), "utf8");
  const mod = { exports: {} };
  new Function("module", "exports", src)(mod, mod.exports);
  return mod.exports;
})();

const example = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/example-fractions.json"), "utf8"));
const allGames = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/all-games.json"), "utf8"));

// A deterministic rng: cycles through a fixed list in (0,1).
function seqRng(vals) {
  let i = 0;
  return function () { const v = vals[i % vals.length]; i++; return v; };
}

test("shuffle keeps every choice exactly once", () => {
  const choices = [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }];
  for (let t = 0; t < 200; t++) {
    const out = E.shuffle(choices);
    assert.strictEqual(out.length, choices.length);
    const texts = out.map((c) => c.text).sort();
    assert.deepStrictEqual(texts, ["a", "b", "c", "d"]);
  }
  // original array is not mutated
  assert.deepStrictEqual(choices.map((c) => c.text), ["a", "b", "c", "d"]);
});

test("shuffle with a seeded rng is a permutation and reorders", () => {
  const out = E.shuffle([0, 1, 2, 3, 4], seqRng([0.9, 0.1, 0.8, 0.2, 0.5]));
  assert.deepStrictEqual(out.slice().sort((a, b) => a - b), [0, 1, 2, 3, 4]);
});

test("stepLevel: up a level after up_after correct in a row", () => {
  const opts = { upAfter: 3, downAfter: 1, minLevel: 1, maxLevel: 3 };
  const s = { level: 1, streak: 0, missStreak: 0 };
  E.stepLevel(s, true, opts); assert.strictEqual(s.level, 1);
  E.stepLevel(s, true, opts); assert.strictEqual(s.level, 1);
  E.stepLevel(s, true, opts); assert.strictEqual(s.level, 2); // 3rd correct
  assert.strictEqual(s.streak, 0); // streak resets on level up
});

test("stepLevel: down a level after down_after misses, never below min", () => {
  const opts = { upAfter: 3, downAfter: 1, minLevel: 1, maxLevel: 3 };
  const s = { level: 2, streak: 0, missStreak: 0 };
  E.stepLevel(s, false, opts); assert.strictEqual(s.level, 1); // one miss, down_after=1
  E.stepLevel(s, false, opts); assert.strictEqual(s.level, 1); // clamped at min
});

test("stepLevel: a correct answer resets a miss streak and vice versa", () => {
  const opts = { upAfter: 3, downAfter: 2, minLevel: 1, maxLevel: 3 };
  const s = { level: 2, streak: 0, missStreak: 0 };
  E.stepLevel(s, false, opts); assert.strictEqual(s.missStreak, 1);
  E.stepLevel(s, true, opts); assert.strictEqual(s.missStreak, 0);
  assert.strictEqual(s.streak, 1);
  assert.strictEqual(s.level, 2); // neither threshold reached
});

test("stepLevel: never above max level", () => {
  const opts = { upAfter: 1, downAfter: 1, minLevel: 1, maxLevel: 2 };
  const s = { level: 2, streak: 0, missStreak: 0 };
  E.stepLevel(s, true, opts); assert.strictEqual(s.level, 2);
});

test("nextItemIndex: no repeats until a level runs out, then a fresh cycle", () => {
  const state = { usedByLevel: {} };
  const n = 4;
  const seen = [];
  for (let k = 0; k < n; k++) seen.push(E.nextItemIndex(state, 1, n));
  // one full cycle: every index exactly once
  assert.deepStrictEqual(seen.slice().sort(), [0, 1, 2, 3]);
  // next pick resets the cycle and is valid again
  const after = E.nextItemIndex(state, 1, n);
  assert.ok(after >= 0 && after < n);
  assert.strictEqual(state.usedByLevel[1].length, 1);
});

test("nextItemIndex: two cycles cover every item twice", () => {
  const state = { usedByLevel: {} };
  const n = 3;
  const counts = {};
  for (let k = 0; k < 2 * n; k++) {
    const i = E.nextItemIndex(state, 2, n);
    counts[i] = (counts[i] || 0) + 1;
  }
  assert.deepStrictEqual(counts, { 0: 2, 1: 2, 2: 2 });
});

test("min/max/level helpers read the quiz block", () => {
  const quiz = allGames.learner.sections[1].blocks[0];
  assert.strictEqual(E.minLevel(quiz), 1);
  assert.strictEqual(E.maxLevel(quiz), 2);
  assert.strictEqual(E.levelCount(quiz), 2);
});

test("mistakeCounts: most frequent first, named from the mistakes map", () => {
  const quiz = allGames.learner.sections[1].blocks[0];
  const records = [
    { mistake: "off-by-one" },
    { correct: true },
    { mistake: "added-wrong" },
    { mistake: "off-by-one" }
  ];
  const mc = E.mistakeCounts(quiz, records);
  assert.strictEqual(mc[0].name, "off by one");
  assert.strictEqual(mc[0].count, 2);
  assert.strictEqual(mc[1].name, "added the wrong pair");
  assert.strictEqual(mc[1].count, 1);
});

test("summarizeGames: answered/right/level/of and slips per game", () => {
  const session = {
    "q-count": [
      { correct: true, level: 1 },
      { correct: false, level: 1, mistake: "off-by-one" },
      { correct: true, level: 2 }
    ],
    "s-shape": [ { correct: true }, { correct: false } ]
  };
  const games = E.summarizeGames(allGames, session);
  const quiz = games.find((g) => g.id === "q-count");
  assert.strictEqual(quiz.answered, 3);
  assert.strictEqual(quiz.right, 2);
  assert.strictEqual(quiz.level, 2);
  assert.strictEqual(quiz.of, 2);
  assert.strictEqual(quiz.mistakes[0].name, "off by one");
  const sort = games.find((g) => g.id === "s-shape");
  assert.strictEqual(sort.answered, 2);
  assert.strictEqual(sort.right, 1);
  assert.strictEqual(sort.level, undefined); // non-quiz has no level
});

test("buildNextNote matches the NEXT-TIME-NOTE.md shape", () => {
  const session = {
    "frac-build-s1": [
      { correct: true, level: 1 }, { correct: true, level: 1 }, { correct: true, level: 1 },
      { correct: true, level: 2 }, { correct: true, level: 2 }, { correct: true, level: 2 },
      { correct: true, level: 2 },
      { correct: false, level: 2, mistake: "tops-and-bottoms" },
      { correct: false, level: 2, mistake: "tops-and-bottoms" },
      { correct: false, level: 2, mistake: "tops-and-bottoms" },
      { correct: false, level: 1, mistake: "kept-bottom" }
    ]
  };
  const note = E.buildNextNote(example, session, {
    ticked: ["The equal-parts connection landed", "Pip tried the quiz"],
    asks: [
      { label: "Hardest moment", value: "the first question with different bottom numbers" },
      { label: "Where Pip led", value: "" }
    ],
    keep: true
  });
  const lines = note.split("\n");
  assert.strictEqual(lines[0], "MetaDAX next v1");
  assert.strictEqual(lines[1], "Ref: HS-DEMO");
  assert.strictEqual(lines[2], "Session: 1");
  assert.ok(note.includes("-- Games"));
  assert.ok(note.includes("Fraction Builder: 11 answered, 7 right, reached level 2 of 3"));
  assert.ok(note.includes("Mistakes: added the tops and the bottoms separately x3; kept one of the bottom numbers unchanged x1"));
  assert.ok(note.includes("-- Ticked"));
  assert.ok(note.includes("The equal-parts connection landed"));
  assert.ok(note.includes("-- In your words"));
  assert.ok(note.includes("Hardest moment: the first question with different bottom numbers"));
  assert.ok(!note.includes("Where Pip led")); // empty asks are dropped
  assert.ok(note.includes("-- Permissions"));
  assert.ok(note.includes("Keep this note: Yes"));
});

test("buildNextNote: keep:false says No, empty session has no Games block", () => {
  const note = E.buildNextNote(allGames, {}, { keep: false });
  assert.ok(!note.includes("-- Games"));
  assert.ok(note.includes("Keep this note: No"));
  assert.ok(note.startsWith("MetaDAX next v1\nRef: HS-ALLG\nSession: 2"));
});

test("extractPastedPackage: strips fences and extracts JSON", () => {
  const raw = "```json\n{\"foo\":\"bar\"}\n```";
  const out = E.extractPastedPackage(raw);
  assert.strictEqual(out, '{"foo":"bar"}');
  assert.deepStrictEqual(JSON.parse(out), { foo: "bar" });
});

test("extractPastedPackage: ignores chat text before and after", () => {
  const raw = "Here is your package:\n\n{\"foo\":\"bar\"}\n\nLet me know.";
  const out = E.extractPastedPackage(raw);
  assert.strictEqual(out, '{"foo":"bar"}');
  assert.deepStrictEqual(JSON.parse(out), { foo: "bar" });
});

test("extractPastedPackage: truncated JSON returns null and PASTE_MSG is the expected sentence", () => {
  const raw = "```json\n{\"foo\":\"bar\"";  // no closing }
  assert.strictEqual(E.extractPastedPackage(raw), null);
  assert.strictEqual(E.PASTE_MSG, "That doesn't look like a whole package. Copy the entire code block from the chat, from the first { to the last }, and paste it again.");
});

// P1d: fenced-block-first extraction
const MINI_PKG = JSON.stringify({ format: "metadax-package", lang: "en", ref: "TEST" });

test("extractPastedPackage: prose with { before a fenced package block uses the fenced block", () => {
  // Simulates AI reply: "copy the whole code block, from the first { to the last }."
  // followed by the actual ```json block. The prose { must not win.
  const raw = "Great session! copy the whole code block, from the first { to the last }.\n\n```json\n" + MINI_PKG + "\n```\n\nLet me know if you need anything else.";
  const out = E.extractPastedPackage(raw);
  assert.strictEqual(out, MINI_PKG);
  assert.deepStrictEqual(JSON.parse(out).format, "metadax-package");
});

test("extractPastedPackage: prose with a bare { and no fences loads", () => {
  // No fences: falls through to bare-brace search. First { where next char is " wins.
  const raw = "Here you go:\n\n" + MINI_PKG + "\n\nEnjoy!";
  const out = E.extractPastedPackage(raw);
  assert.deepStrictEqual(JSON.parse(out).format, "metadax-package");
});

test("extractPastedPackage: truncated fenced block returns null", () => {
  // Fenced block with valid opening but no closing } — cannot parse.
  const raw = "```json\n{\"format\":\"metadax-package\"\n```";
  assert.strictEqual(E.extractPastedPackage(raw), null);
});

test("pickLang: pkg.lang 'fr' -> 'fr'", () => {
  assert.strictEqual(E.pickLang("fr", "en"), "fr");
});

test("pickLang: pkg.lang 'fr-CA' -> 'fr' (first two letters)", () => {
  assert.strictEqual(E.pickLang("fr-CA", "en"), "fr");
});

test("pickLang: pkg.lang 'en' -> 'en'", () => {
  assert.strictEqual(E.pickLang("en", "fr"), "en");
});

test("pickLang: pkg.lang 'xx' (unsupported) -> navigator fallback -> 'en'", () => {
  assert.strictEqual(E.pickLang("xx", "en-US"), "en");
});

test("pickLang: no package (null) -> navigator language 'fr-CA' -> 'fr'", () => {
  assert.strictEqual(E.pickLang(null, "fr-CA"), "fr");
});

test("pickLang: no package, unknown navigator language -> 'en'", () => {
  assert.strictEqual(E.pickLang(null, "xx"), "en");
});

test("pickLang: no package, no navigator language -> 'en'", () => {
  assert.strictEqual(E.pickLang(null, null), "en");
});
