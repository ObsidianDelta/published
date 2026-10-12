// engine.js — the adaptive game engine for the MetaDAX play page.
//
// Pure logic only: level stepping, no-repeat item picking, shuffling, and the
// next-time note / record summaries built from the answers a learner gives.
// The page (index.html) drives the DOM and calls these; record.js reads the
// summaries; node --test (tests/) requires this file directly. No DOM, no
// network, no globals beyond the one export — so the same code is exercised in
// the browser and under node.
//
// Records live, per game block id, in localStorage under
//   metadax:<ref>:<session>
// as { "<block.id>": [answer, ...], "quiz:<block.id>": { level, ... } }.
(function (root) {
  "use strict";

  // Resolve a possibly-{en,fr} field to plain text, like the player's inline().
  function txt(v) {
    if (v == null) return "";
    if (typeof v === "object") return String(v.en != null ? v.en : (v.fr != null ? v.fr : ""));
    return String(v);
  }

  // Fisher–Yates. Returns a new array that is a permutation of the input — every
  // element present exactly once, order shuffled. rng defaults to Math.random;
  // tests pass a seeded rng so the result is deterministic.
  function shuffle(arr, rng) {
    rng = rng || Math.random;
    var a = (arr || []).slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // Adaptive level step. Mutates and returns state {level,streak,missStreak}.
  // Up a level after up_after correct in a row, down after down_after misses in
  // a row, clamped to [minLevel, maxLevel]. A streak resets when the level moves
  // and whenever the other kind of answer comes in.
  function stepLevel(state, correct, opts) {
    var upAfter = opts.upAfter, downAfter = opts.downAfter;
    var minL = opts.minLevel, maxL = opts.maxLevel;
    if (correct) {
      state.streak = (state.streak || 0) + 1;
      state.missStreak = 0;
      if (state.streak >= upAfter) {
        state.streak = 0;
        if (state.level < maxL) state.level += 1;
      }
    } else {
      state.missStreak = (state.missStreak || 0) + 1;
      state.streak = 0;
      if (state.missStreak >= downAfter) {
        state.missStreak = 0;
        if (state.level > minL) state.level -= 1;
      }
    }
    return state;
  }

  // Pick the next item index for a level without repeating until the level runs
  // out. Tracks used indices on state.usedByLevel[levelNum]; once every item has
  // been shown the cycle resets and all items are available again.
  function nextItemIndex(state, levelNum, itemCount, rng) {
    rng = rng || Math.random;
    if (itemCount <= 0) return -1;
    if (!state.usedByLevel) state.usedByLevel = {};
    var used = state.usedByLevel[levelNum] || [];
    var avail = [];
    for (var i = 0; i < itemCount; i++) if (used.indexOf(i) === -1) avail.push(i);
    if (avail.length === 0) {
      used = [];
      for (var k = 0; k < itemCount; k++) avail.push(k);
    }
    var pick = avail[Math.floor(rng() * avail.length)];
    used.push(pick);
    state.usedByLevel[levelNum] = used;
    return pick;
  }

  // The level numbers present on a quiz block, and min/max of them.
  function levelNumbers(block) {
    return (block.levels || []).map(function (l) { return l.level; });
  }
  function minLevel(block) {
    return levelNumbers(block).reduce(function (m, n) { return Math.min(m, n); }, Infinity);
  }
  function maxLevel(block) {
    return levelNumbers(block).reduce(function (m, n) { return Math.max(m, n); }, 1);
  }
  function levelCount(block) { return (block.levels || []).length; }
  function getLevel(block, n) {
    return (block.levels || []).filter(function (l) { return l.level === n; })[0] || null;
  }

  // Every game block in reading order, across both sides. side is attached so a
  // caller can tell where it came from.
  function gameBlocks(pkg) {
    var out = [];
    ["guide", "learner"].forEach(function (sideKey) {
      (((pkg || {})[sideKey]) || {}).sections && pkg[sideKey].sections.forEach(function (sec) {
        (sec.blocks || []).forEach(function (b) {
          if (b && /^(quiz|sort|sequence|build|spoken-sound)$/.test(b.type)) {
            out.push({ side: sideKey, block: b });
          }
        });
      });
    });
    return out;
  }

  // Mistakes for one game's answer list: {name,count}, most frequent first.
  // Names come from the block-level mistakes map (quiz and sequence share it).
  function mistakeCounts(block, records) {
    var counts = {}, order = [];
    (records || []).forEach(function (r) {
      if (!r || !r.mistake) return;
      if (!counts[r.mistake]) order.push(r.mistake);
      counts[r.mistake] = (counts[r.mistake] || 0) + 1;
    });
    order.sort(function (x, y) { return counts[y] - counts[x]; });
    return order.map(function (id) {
      var def = block.mistakes && block.mistakes[id];
      return { id: id, name: def ? txt(def.name) : id, count: counts[id] };
    });
  }

  // One summary per played game, for the record form and the next-time note.
  // session is the stored object (SESSION). A game with no answers is skipped.
  function summarizeGames(pkg, session) {
    session = session || {};
    var out = [];
    gameBlocks(pkg).forEach(function (g) {
      var b = g.block;
      if (!b.id) return;
      var records = session[b.id];
      if (!Array.isArray(records) || !records.length) return;
      var right = records.filter(function (r) { return r && r.correct; }).length;
      var entry = {
        id: b.id,
        title: txt(b.title) || b.id,
        type: b.type,
        answered: records.length,
        right: right,
        mistakes: mistakeCounts(b, records)
      };
      if (b.type === "quiz" && (b.levels || []).length) {
        var top = 0;
        records.forEach(function (r) { if (typeof r.level === "number" && r.level > top) top = r.level; });
        if (top) entry.level = top;
        entry.of = levelCount(b);
      }
      out.push(entry);
    });
    return out;
  }

  // Build the next-time note (metadax-next v1). Its shape is fixed by
  // templates/NEXT-TIME-NOTE.md — the skill's Step 6 reads it. The -- Games
  // block is prefilled from the records; ticks/asks/keep come from the form.
  //   form = { ticked:[strings], asks:[{label,value}], keep:true|false }
  function buildNextNote(pkg, session, form) {
    form = form || {};
    var lines = [];
    lines.push("MetaDAX next v1");
    lines.push("Ref: " + txt(pkg.ref));
    lines.push("Session: " + (pkg.session != null ? pkg.session : 1));

    var games = summarizeGames(pkg, session);
    if (games.length) {
      lines.push("-- Games");
      games.forEach(function (g) {
        var line = g.title + ": " + g.answered + " answered, " + g.right + " right";
        if (g.level) line += ", reached level " + g.level + " of " + g.of;
        lines.push(line);
        if (g.mistakes.length) {
          lines.push("Mistakes: " + g.mistakes.map(function (m) {
            return m.name + " x" + m.count;
          }).join("; "));
        }
      });
    }

    var ticked = (form.ticked || []).filter(function (s, i, a) { return s && a.indexOf(s) === i; });
    if (ticked.length) {
      lines.push("-- Ticked");
      ticked.forEach(function (s) { lines.push(txt(s)); });
    }

    var asks = (form.asks || []).filter(function (a) { return a && String(a.value || "").trim(); });
    if (asks.length) {
      lines.push("-- In your words");
      asks.forEach(function (a) { lines.push(txt(a.label) + ": " + String(a.value).trim()); });
    }

    lines.push("-- Permissions");
    lines.push("Keep this note: " + (form.keep === false ? "No" : "Yes"));

    return lines.join("\n");
  }

  // Shown when extraction or parsing fails on the paste input.
  var PASTE_MSG = "That doesn't look like a whole package. Copy the entire code block from the chat, from the first { to the last }, and paste it again.";

  // Strip ``` fence lines, then slice from the first '{' to the last '}'.
  // Returns the extracted string, or null if no brace pair is found.
  function extractPastedPackage(raw) {
    var s = (raw || "").split("\n").filter(function (l) { return !/^```/.test(l); }).join("\n");
    var start = s.indexOf("{");
    var end = s.lastIndexOf("}");
    if (start === -1 || end === -1 || end < start) return null;
    return s.slice(start, end + 1);
  }

  var E = {
    txt: txt,
    shuffle: shuffle,
    stepLevel: stepLevel,
    nextItemIndex: nextItemIndex,
    levelNumbers: levelNumbers,
    minLevel: minLevel,
    maxLevel: maxLevel,
    levelCount: levelCount,
    getLevel: getLevel,
    gameBlocks: gameBlocks,
    mistakeCounts: mistakeCounts,
    summarizeGames: summarizeGames,
    buildNextNote: buildNextNote,
    extractPastedPackage: extractPastedPackage,
    PASTE_MSG: PASTE_MSG
  };

  if (typeof module !== "undefined" && module.exports) module.exports = E;
  else root.MetaDAXEngine = E;
})(typeof window !== "undefined" ? window : this);
