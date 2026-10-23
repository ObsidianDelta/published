# Scene: `job-left` (board 01)

**Chapter:** `metadax/01-job.md` — "What is the job that is left?"

Four pillars. Three are the done jobs of a university (Make, Keep, Spread),
filled in record and ticked one after another. The fourth is dashed and in
learner colour, with the learner node and its halo inside: the job left,
getting knowledge into one particular person.

## Labels used (`params.labels`)

| key | shown as |
| --- | --- |
| `pillars` | the three filled pillars (`["Make", "Keep", "Spread"]`) |
| `left` | label under the fourth, dashed, learner pillar |
| `done` | caption shown while the three fill |
| `caption` | the closing caption line |

## States

- `done` — the three record pillars are filled and ticked.
- `left` — the fourth, dashed learner pillar with the learner node is drawn.
- `caption` — the caption and `done` line are shown.

`visible` resumes, `hidden` pauses, `destroy()` removes all nodes.

## How `t` maps

| `t` | what moves |
| --- | --- |
| 0.0–0.5 | `pillars` fill with record-soft and get a tick, staggered |
| 0.5–0.8 | the fourth pillar draws dashed in learner; learner node + halo appear |
| 0.8–1.0 | `caption` and `done` fade in |

## Reduced motion

No tweened transitions; states snap with a ≤300ms crossfade.
`fallback.ts` is `scene.ts` with `animate: false`.
