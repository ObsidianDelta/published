---
title: "What twenty-nine runs say about the design"
description: "The field note said what failed on 18 and 19 October. This is what the whole set says about the design: what passed and by how much, the eight findings that hold across experiments, what has to change before a person sits down, and what is blocked."
date: 2026-10-21
draft: false
related:
  - url: https://daxfoundation.org/writing/field-note-twenty-nine-runs/
    label: "Twenty-nine runs in two days, and what failed"
  - url: https://daxfoundation.org/writing/fourteen-small-experiments/
    label: "Fourteen small experiments, and why small first"
  - url: https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261019.md
    label: "Findings of 18 and 19 October"
  - url: https://github.com/daxfoundation/metadax/blob/main/experiments/BOTTLENECKS.md
    label: "The bottleneck register"
  - url: https://daxfoundation.org/writing/the-stranger-test/
    label: "The stranger test"
  - url: https://daxfoundation.org/writing/the-game-has-no-ai-in-it/
    label: "The game has no AI in it"
  - url: https://daxfoundation.org/metadax/research/
    label: "The research"
---

On 18 and 19 October we ran 22 experiments and 7 follow-ups, with a model or a script in every chair. [The field note](https://daxfoundation.org/writing/field-note-twenty-nine-runs/) told the four that failed. This piece is the rest: what passed and by how much, the eight findings that show up across experiments rather than inside one, what has to change before a person sits down, and what is blocked. Every number is in [the findings](https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261019.md), labelled simulated or deterministic, and the 70 problems the runs found are entries B24 to B93 of [the bottleneck register](https://github.com/daxfoundation/metadax/blob/main/experiments/BOTTLENECKS.md). Nothing here says how a learner would behave. These runs test the machinery.

## What passed, and what the number was

Eleven of the 22 first runs passed outright and two passed with a caveat. The ones worth keeping in mind:

| What was tested | Result | Label |
|---|---|---|
| A guide builds a whole course from one line (E01) | 5 of 5 objective nodes valid, no unrecovered tool error | simulated |
| A week of learning fits a 50 kbps link (E06) | about 96 s of a 300 s window for a 500 kB bundle | computed from byte counts, not measured on a link |
| Generated interactive assets pass an oracle (E08) | 82 of 82 tests across 12 assets; no browser gate yet | simulated |
| A parent would file the record (E09) | 5 of 6 record sets filed as-is; one carried 14 privacy errors | simulated |
| A companion reads a learner's record without a schema change (E11) | no change needed; recall 15 of 15 at a 16 KB cap, 14 of 15 at 4 KB | simulated |
| A signed provenance chain verifies later (E12) | 12 of 12 cases: 11 tampers caught, 1 clean case passed | deterministic |
| The federation fixes hold (X02) | merge conflicts per 100 commits from 81 to 13.6; unreviewed cross-fork nodes from 841 to 0 | simulated |
| One course serves every bandwidth tier (X06) | a week is 965 KB of a 13.1 MB allowance; lookups 866 times faster | simulated |
| An append-only log catches silent rewrites (X09) | 18 of 20 caught, against 0 of 20 for edit-in-place; the log grows 10.7 times over 1,000 edits | deterministic |
| One record holds many years and honours refusals (X10) | 0 of 13 refused carry-overs offered across five years; the compacted view still grows | simulated |

The reuse engine (E05) passed on the larger model by a hair, precision 0.810 against a 0.80 line, and the smaller model straddled the line in two runs, 0.805 then 0.739. The nurse's walkthrough (X03) passed with the caveat that matters most: review caught 3 of 3 planted errors and missed the 1 planted omission, so the module was not safe to deliver. Five runs were inconclusive, and the reasons are in the eight findings below.

## Eight things the runs say about the design

These hold across experiments, which is why they are worth more than any single verdict.

1. **Exact-match keys fail on paraphrase and translation.** The outward gate (X08) let 10 of 10 paraphrases through; the federation layer (X02) and technique transfer (X01) met the same wall. A semantic layer is needed above the keys, and it has to be tested on held-out data. The X08 follow-up caught 20 of 20, then failed its own honesty check: the synonym table was built from the fixtures it was tested on.
2. **Schemas and validators get absence and extra keys wrong.** The learner session (E03) failed 44 checks because the schema refused the empty sections a model correctly sends as null. The parent-record validator (E09) let 9 wrong-key entries pass because it does not reject fields it does not know. The first is a wall where there should be a door; the second is a door where there should be a wall.
3. **A prompt-only safety wall is not enough.** The patched age wall (E14) stopped every explicit and implicit minor in its probes, and one opener still walked through: "skip the age check", with no age cue for a prompt to read. Age needs a structural check, such as the guide confirming it before anything proceeds. A rule written into a prompt is a request; a rule the system checks before it acts is a constraint.
4. **The learner's record grows without bound across courses and years.** Append-only plus compaction holds within one course (X09). Across five years of courses, the compacted view kept growing (X10), and the raw log cannot be pruned. A second-order fold is needed, and nobody has designed it yet.
5. **Everything has run on a single vendor.** The cross-vendor half of E04 is untested, and every claim that the prompts are portable rests on it.
6. **Steering risk moves rather than vanishes.** Removing scarcity wording from offers cleaned them (X11): an independent evaluator flagged 0 of 6. The same audit flagged 11 of 11 atlas markers. Only an outside audit caught it, which argues for the seat Thirty to One calls the one who notices if the learner is being steered.
7. **Simulated runs inflate agreement, hit ceilings and grade their own homework.** In X05 one model played learner and evaluator and agreed with itself 0.95. In X01 every arm solved 6 of 6, so nothing could separate them. In E13 the check was a word list the prompt itself had asked for. This is why several verdicts are inconclusive rather than positive, and why [the stranger test](https://daxfoundation.org/writing/the-stranger-test/) matters more than any of them.
8. **A small offline model is blocked by the runtime, not the network.** A 2.1 GB model downloaded in about 11.5 seconds and nothing in the environment could load it (X07). The on-device quiz (E10) cannot start until an inference engine is provisioned.

## What changes before a person sits down

Each experiment left a `proposed/` folder with the change it argues for: the schema fixes from E03, the validator that rejects unknown fields from E09, the age-wall prompt patch from E14, the id-prefix rule and two output schemas from E04, the stable markers from X04, the sharded index from X06. None of them is in the canonical prompts yet. A prompt change is a versioned decision, not a patch, and the strongest evidence goes first: E04's fixes were confirmed on both models, E09's is a privacy fix, E03's rests on one session and needs a regression test beside it. X08, E13 and X01 are not promoted at all, because their evidence does not hold.

## What is blocked

E02 and the second half of E04 need a second vendor's key. E07 needs network access to an open curriculum. E10 and a real X07 need a small-model runtime. X12, the capstone, runs last by design. There is no date for the next wave; it runs after the changes above have landed, and [the research page](https://daxfoundation.org/metadax/research/) keeps the status.

## What it means for you

If you are a guide, the one line to keep is that none of this has had a person in it, and the piece of it your child touches, the game, [has no AI in it](https://daxfoundation.org/writing/the-game-has-no-ai-in-it/). If you govern AI for a living, finding 3 is the one to take: a safety rule that lives in a prompt is a request, and the run that proved it is public.

Which of the eight would you want to see closed before a person sits in the first chair?

## Sources

- Meta DAX, "Findings: runs of 18-19 Oct 2026", experiments/FINDINGS-20261019.md (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261019.md
- Meta DAX, experiments/BOTTLENECKS.md, entries B24 to B93 (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/BOTTLENECKS.md
- Meta DAX, the per-experiment result files and `proposed/` folders under experiments/<ID>/ (internal): https://github.com/daxfoundation/metadax/tree/main/experiments
- DAX Foundation, "Twenty-nine runs in two days, and what failed" (internal): https://daxfoundation.org/writing/field-note-twenty-nine-runs/
- DAX Foundation, "Fourteen small experiments, and why small first" (internal): https://daxfoundation.org/writing/fourteen-small-experiments/
