# Scene: `chat-vs-record` (board 02)

**Chapter:** `metadax/02-chat.md` — "Isn't this just a chat with an AI?"

Left: a chat bubble that fades as you scroll — the chat closes and forgets.
Right: a vertical record thread whose nodes are added and grow one by one as
`t` rises. The "guided" node is guide-coloured; the last node is the learner
node with its halo. Built with D3 7.9 data joins over SVG.

## Labels used (`params.labels`)

| key | shown as |
| --- | --- |
| `chat` | the chat bubble's label |
| `chatNote` | a note under the bubble (e.g. "closes, forgets") |
| `chatRole` | the chat's role ("the hands and ears") |
| `nodes` | the five record nodes, joined with D3 (`["reached", …, "you, today"]`) |
| `recordRole` | the record's role, under the last node ("the body") |

The fourth entry of `nodes` whose text contains "guided" is drawn in guide
colour; the last entry is the learner node.

## States

- `chat` — the chat bubble at full opacity, no record nodes yet.
- `record` — the chat bubble faded, all record nodes present.

Each node is a `<g role="listitem">` with a `<title>` for assistive tech; the
thread group is `role="list"`. `destroy()` removes all nodes.

## How `t` maps

| `t` | what moves |
| --- | --- |
| 0.0–1.0 | chat bubble opacity 0.9 → 0.3 |
| each 0.15 step | one more record node appears and grows to full radius |

## Reduced motion

No tweened transitions; states snap with a ≤300ms crossfade.
`fallback.ts` is `scene.ts` with `animate: false`; D3 is used in both.
