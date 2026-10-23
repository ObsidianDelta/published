# record (board 06)

A learning-record card — the seed of Nova DAX. Pure DOM (no SVG canvas for the
card itself; a thin SVG thread hangs below). `needsWebGL: false`.

## What it shows
A card on `surface` with a `line` border and a 10px radius. A header with the
record `title` in the mono family and a small numeric counter of entries so
far. Five rows, each a coloured dot plus a 14px head line and an optional 12px
`inkMuted` note (rows are split on the first ` - `). A footer with `yours` on
the left and `seed` on the right. Below the card, a thin `record` thread draws
downward toward the next chapter.

## Labels (`params.labels`)
- `title` — header text (mono).
- `rows` — array of five row strings (`"Head - note"`).
- `rowKinds` — array of five kinds, one per row, each one of
  `reached` (learner), `tried` (ink-faint), `guided` (guide), `reused` (record).
- `yours` — footer, left.
- `seed` — footer, right (the seed of Nova DAX).

## States
- `rows` — rows revealing (the 0 … 0.8 stretch of `t`).
- `seed` — the footer/thread stretch (0.8 … 1.0).
- `visible` / `hidden` — reserved. `hidden` pauses; `visible` resumes and
  re-renders the last `t`.

## How `t` maps
- `0.0 – 0.8` **rows**: the five rows appear one at a time (0.16 of `t` each)
  with a short rise; the counter climbs as each lands.
- `0.8 – 1.0` **seed**: the footer fades in, the card border warms from `line`
  to `record`, and the thread below draws out to full length.

## Reduced motion / fallback
`fallback.ts` mounts with motion off: all rows, the footer and the thread are
shown fully regardless of `t`. Everything is readable without any animation.
