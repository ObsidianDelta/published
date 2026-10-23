# still

A single quiet card — the default scene for a chapter that needs no motion of its
own. An SVG card on `surface` with a `line` border, a glyph, a title and a
caption. `needsWebGL: false`.

## What it shows
A rounded card. Near the top, a simple glyph drawn in a token colour; below it a
title line (mono, `ink`) and a caption (`ink-muted`). The whole card is complete
and legible at `t = 0`; `t` drives only a soft settle (a gentle rise and the
glyph easing to full strength). Nothing is hidden at any `t`.

## Labels (`params.labels`)
- `title` — the card's title (mono).
- `caption` — the line under it (`ink-muted`).

## Params (`params.glyph`)
`glyph` is one of `record | companion | edge | identity | cost | door`, each a
small mark drawn from the tokens:
- `record` → `record` (Paper) — stacked lines, the accountability record.
- `companion` → `guide` (Tide) — a ring beside a dot, a companion at a person's side.
- `edge` → `line` — a directed edge, one entity to another.
- `identity` → `learner` (Ember) — a key, an identity only its holder has.
- `cost` → `learner` (Ember) — a spark, the cost that comes with a new power.
- `door` → `record` (Paper) — a doorway, the way in.

## States
- `settle` — the soft settle on `t`.
- `visible` / `hidden` — reserved. `hidden` pauses; `visible` resumes and
  re-renders the last `t`.

## How `t` maps
- `0.0 – 1.0` **settle**: the card rises a few pixels and the glyph eases from
  85% to full strength. Everything is already present at `t = 0`.

## setLabels
When the reader changes lens, the chapter's `title` and `caption` change; the
scene swaps the two text nodes in place.

## Reduced motion / fallback
`fallback.ts` mounts with motion off: the card is drawn at its settled state
regardless of `t`. `index.ts` also honours `prefers-reduced-motion` the same way.
