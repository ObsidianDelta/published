# five-to-always (board 07)

The five-minute benchmark, then always on. DOM text for the numeral and labels;
SVG for the arc and the always-on ring. `needsWebGL: false`.

## What it shows
A large `numeral` (Fraunces, weight 300, ~168px) in `learner` colour with the
`unit` stacked beside it in the label style. Below, a semicircle arc running
from `from` (left) to `to` (right): a `sceneWire` base arc, and a `record` arc
that fills as `t` rises, with the `learner` node riding the drawn end and a
caption at the top (`today`). Three bandwidth bars — the first `record`, the
other two `inkFaint` — captioned from `bandwidths`, with `all` beneath them.

## Labels (`params.labels`)
- `numeral` — the big figure (e.g. "5").
- `unit` — the stacked unit line.
- `from`, `to` — the arc's end labels.
- `today` — caption during the five state.
- `then` — caption once always-on engages.
- `bandwidths` — one string split on ` - ` into the three bar captions.
- `all` — the line under the bars.

## States
- `five` — the five-minute benchmark (0 … 0.5 of `t`): the record arc fills and
  the learner node rides it.
- `always` — always on (0.5 … 1.0): the arc completes in `guide`, a
  `guide` ring appears at its end with `then`, all three bars light to `record`,
  and the numeral crossfades into a continuous SVG ring (no glyph).
- `visible` / `hidden` — reserved. `hidden` pauses; `visible` resumes.

## How `t` maps
- `0.0 – 0.5` **five**: record arc fills left→right, node rides, caption `today`.
- `0.5 – 1.0` **always**: arc turns `guide` and completes, end ring + `then`
  fade in, bars all warm to `record`, numeral → ring crossfade.

## Reduced motion / fallback
`fallback.ts` mounts with motion off: the arc is shown full and `always`
resolved (guide arc, end ring, lit bars, the ring in place of the numeral), with
every label legible and no transitions.
