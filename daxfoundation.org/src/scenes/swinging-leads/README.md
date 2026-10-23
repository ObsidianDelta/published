# swinging-leads (board 05)

Two climbers on one route: whoever is a step ahead is the guide, and the lead
swings. Inline SVG for the route and climbers; a real DOM `<button>` overlay to
swing on demand. `needsWebGL: false`.

## What it shows
A climbing route (a cubic curve in `sceneWire`) rising left → right. A learner
node (`learner` colour with a `learnerSoft` halo) a step behind, and a guide
node (`guide` colour, `guideSoft` halo) a step ahead, joined by a dashed
`record` rope. A dimension line beneath them labelled `gap`. Role labels beside
the nodes — crucially the text follows **position, not colour**: whoever is
ahead reads `guideNow`, whoever is behind reads `learnerNow`. A dashed ghost
marks the next pitch, labelled `next`. When the lead swings, `caption` appears.

## Labels (`params.labels`)
- `learnerNow` — the climber currently behind (the learner, now).
- `guideNow` — the climber currently ahead (the guide, now).
- `gap` — the dimension line under the pair ("a step ahead").
- `next` — the dashed ghost of the next pitch.
- `caption` — appears once the lead has swung ("Everyone is a learner").
- `tap` — the swing button's label.

## States
- `lead` — the route drawing and both climbers arriving (0 … 0.5 of `t`).
- `swing` — the learner passing the guide; labels swap, rope re-attaches,
  caption shows (0.5 … 1.0 of `t`).
- `visible` / `hidden` — reserved. `hidden` pauses (and cancels any running
  swing rAF); `visible` resumes.

## How `t` maps
- `0.0 – 0.5` **lead**: the route draws out and the two nodes, rope, dimension
  line and ghost fade into place.
- `0.5 – 1.0` **swing**: the learner climbs from behind to ahead, passing the
  guide at the midpoint; the ahead/behind role labels swap, the rope re-attaches
  to the new positions, the ghost fades, and the caption fades in.

## Interaction
A native `<button type="button">` labelled `tap` sits below the SVG, keyboard
reachable. Each click swings the lead again (toggling who is ahead) via an
eased ~700ms tween along the route. Once the user taps, the button owns the
swing (scroll no longer overrides it).

## Reduced motion / fallback
With reduced motion (or `fallback.ts`), motion is off: the route is drawn, both
climbers placed with the lead already swung and the caption shown. The swing
button still works but as a 300ms crossfade rather than a slide.
