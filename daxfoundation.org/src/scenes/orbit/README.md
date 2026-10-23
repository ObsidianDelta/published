# orbit (board 04 — Meta DAX, the inversion)

The scene for chapter `metadax/04-roles`. It makes one idea visible: **the inversion
is attention, not headcount.** In a classroom thirty attentions point at one teacher;
inverted, thirty point at one learner — and the thirty are not fixed people, they change
with the context and, over a life, number in the thousands. The power of it is the
guide's: while she teaches she can deploy thirty agents at one learner.

`index.ts` is the full Three.js scene (WebGPU with automatic WebGL 2 fallback).
`fallback.ts` is a 2D inline-SVG scene with the identical four states, no WebGL, under
20 KB. Both implement `SceneModule` from `../contract.ts` and are driven only by a
number: `setProgress(t)`, `t` in 0..1.

## What it shows — the four states and the `t` mapping

The chapter pins the scene; the page turns scroll into `t`. Each state owns a slice of `t`:

| `t` range   | state       | what you see |
|-------------|-------------|--------------|
| 0.00–0.15   | `classroom` | 30 small `record`-coloured nodes in rows face one `guide` node at the front; 30 faint `sceneWire` attention lines converge on the guide. Caption `labels.classroom`. |
| 0.15–0.45   | `invert`    | the lines reverse; the nodes ease (not linearly) off the rows into three orbits (radii 1:2:3) around one large `learner` node with a `learnerSoft` halo; every line now points inward at the learner. Caption `labels.invert`. |
| 0.45–0.75   | `context`   | `labels.contexts` cycle; on each change about half the orbiting nodes fade out and new ones fade in, three of them `guide`-coloured; a counter from `params.counterStart` rises by a seeded 20–60 per swap. Caption `labels.counter`; the counter + context label are DOM text in an overlay, never baked into the canvas. |
| 0.75–1.00   | `reverse`   | the camera eases to the guide node at the front; thirty attention lines leave the guide and arrive at the learner, the orbit settling around the learner again — *it runs both ways, the guide deploys thirty at one learner.* Caption `labels.reverse`. Then settle. |

State boundaries (0.15 / 0.45 / 0.75) and all ring maths live in `model.ts` so they are
unit-tested without a browser (`tests/explain/orbit.test.mjs`).

Continuous: each ring orbits at its own slow period. The loop stops on
`setState("hidden")` and whenever `reducedMotion` is true (states crossfade over 400 ms
instead); it resumes on `setState("visible")`.

Interaction: pointer/touch drag rotates the orbit (damped, no library, no OrbitControls);
a tap or click on a node shows its label (`labels.roles`, cycled) in the overlay for 2 s.

## Params (from the chapter frontmatter `scene.params`)

| key            | type       | use |
|----------------|------------|-----|
| `roles`        | number     | node count (30). |
| `guides`       | number     | how many of the swapped-in context nodes are `guide`-coloured (3). |
| `counterStart` | number     | first value of the integrated-entities counter (1310). |

Also from `SceneParams`: `reducedMotion`, `maxPixelRatio` (devicePixelRatio cap),
`locale`, and the shared `tokens` (colours; see below).

## Labels (`params.labels`)

| key         | type       | use |
|-------------|------------|-----|
| `classroom` | string     | caption for state `classroom`. |
| `invert`    | string     | caption for state `invert`. |
| `contexts`  | string[]   | cycled in state `context`; each change triggers a node swap + counter step. |
| `counter`   | string     | caption beside the rising counter. |
| `reverse`   | string     | caption for state `reverse`. |
| `roles`     | string[]   | cycled when a node is tapped. |

A scene bakes no text: every string arrives in `labels`.

## Colours (`tokens`)

Only these are used, always from the `tokens` argument, never hard-coded:
`learner`, `learnerSoft`, `guide`, `record`, `sceneWire`, and `sceneFog` (fog + clear
colour). devicePixelRatio is capped at `params.maxPixelRatio`.

## Driving it from another renderer later

`t` is just a number. A scroll page sets it from the section's bounding rect; a video
renderer steps it per frame; a deck per slide; the companion per sentence. The scene
never knows which — call `mount(el, params, tokens)`, then `setProgress(t)` for the
timeline, `setState("hidden"|"visible")` to pause/resume loops, `resize()` when the
element changes size, and `destroy()` to release everything. `mount` returns a
`Promise<SceneHandle>` (WebGPU init is async); show `fallback` until it resolves.

## Files

- `index.ts` — full Three.js scene; `meta.needsWebGL === true`.
- `fallback.ts` — inline-SVG scene, same four states; `meta.needsWebGL === false`.
- `model.ts` — pure maths: ring positions, the `t`→state mapping, the seeded counter.
- `../../tests/explain/orbit.test.mjs` — asserts 30 positions on 3 rings, the
  0.15/0.45/0.75 boundaries, and a monotone counter.
