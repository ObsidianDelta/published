# Scene: `map` (board 00)

**Chapter:** `foundation/00-map.md` — "What is the DAX Foundation?"

One circle, two halves: the constraint (Preservation) on the left, Meta DAX
(Expansion) on the right, inside an outer record ring. Below, the two things
still to come (Nova DAX, Skippy DAX) as dashed record circles, with a record
thread drawn from the right half down to them — the door into Meta DAX.

## Labels used (`params.labels`)

| key | shown as |
| --- | --- |
| `ring` | title under the circle (the DAX line) |
| `left` / `leftName` / `leftNote` | the left half (Preservation) |
| `right` / `rightName` / `rightNote` | the right half (Expansion) |
| `ahead` | heading above the dashed circles |
| `nova` | first dashed record circle |
| `skippy` | second dashed record circle |

Nothing is baked: a scene shows only what the chapter hands it.

## States

- `draw` — only the outer ring is drawn.
- `fill` — ring drawn, both halves filled and labelled.
- `ahead` — everything, including the dashed circles and the record thread.

`visible` resumes animation, `hidden` pauses it, `destroy()` removes all nodes.

## How `t` maps

| `t` | what moves |
| --- | --- |
| 0.0–0.3 | the outer record ring draws (stroke-dashoffset to 0) |
| 0.3–0.6 | the two halves fill and their labels fade in |
| 0.6–1.0 | the dashed circles appear and the record thread (the door) draws down |

Hovering or focusing a half lifts it 4px (CSS transform on its group).

## Reduced motion

No tweened transitions; a state change snaps with a ≤300ms opacity crossfade.
`fallback.ts` is the same scene built from `scene.ts` with `animate: false`.
