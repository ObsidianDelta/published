# attention (board 04 — Meta DAX, the approved sampler picture)

The scene for chapter `metadax/04-roles`, ported straight from the approved sampler
(`state/daxfoundation/explain-sampler/attention.html`, the `AttentionScene` function). It
makes one idea visible: **the inversion is attention, not headcount.** A classroom of
thirty attentions on one teacher turns inside out into thirty helpers on one learner, the
guide beside her, still the one sending them. The deeper the reader goes down the ladder,
the more layers the picture grows.

`index.ts` is the full scene: a single 2D `<canvas>` (no WebGL, no library) plus a DOM
caption. `fallback.ts` is a static inline-SVG of the inverted end state with the captions,
under 20 KB, for `prefers-reduced-motion` + `?lite=1`. Both implement `SceneModule` from
`../contract.ts` and are driven only by numbers: `setProgress(t)` and `setDepth(n)`.

## What it shows — `t` and depth

The chapter pins the scene; the page turns scroll into `t` in 0..1. There is **no
auto-play inside the scene**: the layout drives `t`. At `t = 0` the picture rests as the
full classroom — never a blank frame.

| `t` range   | what you see |
|-------------|--------------|
| 0.00–0.30   | the resting classroom: thirty `record` dots in rows send faint attention lines to one `guide` dot at the front. Caption `labels.classroom`; hint `labels.tapChild` until a learner is tapped. |
| 0.04–0.50   | the room becomes one: the rows dissolve and the tapped dot eases to the centre as the one `learner`, growing a `learnerSoft` halo. |
| 0.28–0.82   | the thirty helpers arrive on a ring around the learner, staggered; each sends an attention line inward, `record`-coloured, with motes flowing in once `t > 0.6`. |
| 0.36–0.72   | the `guide` eases from the front to beside the learner and keeps a line to her — the human part. Caption `labels.invert`; hint `labels.dragGuide` until the guide is dragged. |

Depth layers (added by `setDepth(n)`, `n` 1..5, each fading in on arrival):

| depth | layer | label |
|-------|-------|-------|
| 2 | the churn (a different thirty each moment), the context tag cycling, and the guide's own ring — *it runs both ways* | `labels.change` / `labels.contexts` / `labels.both` |
| 3 | the record under the learner (ticks) and the five-minute packages arriving; the guide's line pulses — *the human decides* | `labels.record` / `labels.packages` / `labels.decide` |
| 4 | the 2024 marker (▶ built once) | `labels.built` |
| 5 | the accountability boundary (a dashed frame) — *every action recorded* | `labels.boundary` |

The caption below the canvas is **DOM text** (an `aria-live` region), never painted on the
canvas, exactly as in the sampler.

## Interaction

- Tap a learner (a small dot) before the inversion: it becomes the one at the centre.
- Drag the guide after the inversion (`t > 0.6`): the helpers stay on the learner.
- Tap a helper: its name (`labels.roles`, cycled) shows beside it for ~2 s.

`reducedMotion`: no continuous loop, no churn, no motes; layers appear fully formed and the
picture is painted once per `setProgress`/`setDepth`.

## States, loop, replay

`setState('hidden')` cancels the animation frame and all timers; `setState('visible')`
resumes. `replay()` (exported on the handle) plays the inversion once from `t = 0` — the
sampler's "Play it again". The scene renders its own control only when `labels.replay` is
provided; otherwise the layout may render one and call `replay()`. `destroy()` releases the
canvas, the caption, the ResizeObserver and every pointer listener.

## Params and labels

No numeric `params` are required. Every word is a label (keys below); a scene bakes no
text. Arrays: `roles` (helper names, cycled), `contexts` (the moments that cycle). Strings:
`classroom`, `invert`, `both`, `change`, `decide`, `record`, `packages`, `built`,
`boundary`, `tapChild`, `dragGuide`, and the optional `replay` (the again-control label).

## Colours

Only from `tokens`: `ground`, `ink`, `inkMuted`, `inkFaint`, `line`, `sceneWire`,
`learner`, `learnerSoft`, `guide`, `record`. No literal colours anywhere.
