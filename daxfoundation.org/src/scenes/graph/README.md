# graph (board 00 — the DAX Foundation as one graph)

The scene for `foundation/00-map`. Jason, 23 Oct 2026: the old "two halves" map is
wrong. The Constraint Protocol is **not** a slice or a half; it is **what the edges
are made of**. Every interaction between any two entities runs under it — that is
what makes the whole thing one graph. **Reading level is how much of the graph you
see.**

`index.ts` is the full scene: a 2D `<canvas>` with `d3-force` (already a dependency)
plus a DOM caption. `fallback.ts` is a static inline SVG of the **level-2** picture
(DAX + the three initiatives, every line the Protocol) for `prefers-reduced-motion`
+ `?lite=1`, under 20 KB. Both implement `SceneModule` from `../contract.ts`.

## Data in, text in — nothing baked

- **Topology** arrives in `params.params.graph` (the parsed `src/data/graph.json`):
  `nodes` `{ id, label, kind, level, chapter, line }` and `edges`
  `{ from, to, type, level, cp }`. Every edge is a Protocol edge (`cp: true`).
- **Routes** arrive in `params.params.routes` (`{ <chapter>: <url> }`) so the scene
  bakes no route; a node opens only when its chapter resolves to a url.
- **Every word** arrives in `params.labels` (lens-specific): `legend` (the substrate
  sentence shown at levels 1–2), `edgeWhat` (shown when an edge is tapped), `tapHint`,
  and optional per-node overrides `node_<id>` / `line_<id>` (fall back to the graph's
  signed defaults). The scene bakes no text.

## Levels and `t`

`setLevel(n)` (1..5) is the driver, called by the home page with the current lens's
`level` from `lenses.json`:

| level | picture |
|-------|---------|
| 1–2 | four circles — DAX and the three initiatives it builds — and one legend sentence; `cp` is the lines only. |
| 3 | adds learner, guide, record, companion, citizen and their relations. |
| 4 | the Constraint Protocol becomes its own node that opens; human delta value and compounding appear; every "runs under" edge is explicit. |
| 5 | the whole graph. |

Raising the level animates new nodes in from their nearest visible neighbour; lowering
it folds them back. `t` (`setProgress`) drives only a gentle settle and the edge motes,
never a story: at `t = 0` the current level's picture is already complete and still.

## Interaction

- Tap a node → its line as the caption; tap it **again** → open its run (if it has one).
- Tap an edge → `labels.edgeWhat` ("who acted, on what, under whose authority…").
- Drag a node → nudge it; the force keeps the rest.

`reducedMotion`: no force animation — the layout is ticked to rest and painted once;
levels change by redraw, not animation.

## Colours (only from `tokens`)

purpose = `learner`, initiative = `record`, protocol / every edge = `guide`,
concept = `sceneWire`. No literal colours.
