---
title: "How knowledge compounds under a constraint"
description: "Technique reuse, a federated registry, and fetching the spot instead of the course: what compounds is the record of what was tried."
date: 2026-10-18
updated: 2026-10-20
draft: false
series: accountability
part: 4
series_total: 5
related:
  - url: https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/
    label: "Refusing a bypass, and keeping the receipt"
  - url: https://daxfoundation.org/writing/run-it-with-us/
    label: "Run it with us"
  - url: https://daxfoundation.org/writing/twelve-scenes-01-the-nurses-walkthrough/
    label: "Twelve scenes, 1: the nurse's walkthrough"
  - url: https://daxfoundation.org/writing/the-slower-model-was-not-the-safer-model/
    label: "The slower model was not the safer model"
  - url: https://daxfoundation.org/writing/session-two/
    label: "Session two"
  - url: https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md
    label: "The next experiments"
---

A system that reuses what it has learned is only as accountable as its answer to one question: where did this come from? Knowledge compounds when a move made in one place arrives somewhere else as a technique, with its provenance attached, and when the attempts that failed travel with it. That needs a record nobody can quietly edit, which is why Meta DAX is meant to run on the Constraint Protocol; its protocol fields are reserved and empty today. It also needs a rule we treat as a one-way door: a way, never the way. A technique is offered, never required, and dead ends are kept with the same care as arrivals.

## One move, two languages

Open X01, "One thread, two worlds", in the [next-experiments doc](https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md). It is a scene with made-up people; the study with people is planned, not run. Ayu, a tutor in Yogyakarta, is the guide; Bagus, a courier who flies kites, is the learner, stuck on Newton's third law. He argues that if the kite pulls the line exactly as hard as the line pulls the kite, the two cancel and nothing can move. Two of her moves fail: a boat pushing off a jetty, and the sentence "the forces act on different objects". The third works. She takes two delivery receipts, writes KITE on one and AIR on the other, and says every force goes on the receipt of the thing it acts on. He adds up the kite's receipt, finds a net force, and is through.

With Bagus's consent the move becomes a technique, recorded as Ayu's and held for review until she accepts it and names it "one body, one receipt". Her two failed moves are kept as dead ends under the same stuck signature. Eleven weeks later in Guatemala, Marisol hits the same wall in Spanish, and her tutor finds the technique and offers it "as one way among those on record, never required". X02, "Many hands, one course", extends this to a federated registry: when two teachers disagree about swarm prevention in a beekeeping course forked into four languages: "Both cores are kept, side by side, marked contested. No one is overruled."

The first of our [Twelve scenes](https://daxfoundation.org/writing/twelve-scenes-01-the-nurses-walkthrough/), also planned, not yet run with people, has the habit in one sentence. A charge nurse in Enugu overrides the planning step's proposal, and the override "is recorded as hers, kept together with the proposal it replaced", because an override applied silently "cannot be learned from".

## What the record shows

None of these has run with people. The results so far come from models in the chairs, and X14, run on 10 October 2026, was positive. Answering from the matching spot (the node, its ancestors and a few sampled variants) passed 5 of 6 questions at every library size, as loading the whole course did (MEASURED). At the largest library it used roughly 75 times fewer context tokens per turn, 1,579 against 118,236 (ESTIMATED). Per-turn cost tracked the question, not the library, as the [findings post](https://daxfoundation.org/writing/the-slower-model-was-not-the-safer-model/) puts it, so a growing record need not make each turn dearer. Limits, per the [findings](https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261010.md): six graded questions, SIMULATED medium and large libraries, and a test of fetching, not of whether what was fetched is a good technique.

X01 and X02 have run with a model in the people's chairs, so their numbers are SIMULATED. X01 (9, 18 and 19 October) is inconclusive on its kill line: on 19 October the control that reinvents the move was slightly faster, 1.67 attempts against 1.83, inside a run-to-run spread of 0.67. X02 passed on 18 October: conflicts per 100 commits fell from 80.8 to 13.6. Their kill lines were fixed in advance: if learners offered the technique pass no faster than those given the model's hints alone, "the record is noise"; if they flag the offer as steering, "it is a defect"; if near-duplicates outgrow links as learners grow, "the registry does not scale and the tree silts". X09, "Nothing quietly edited", would make the reserved provenance fields live, and says that if any chain cannot be rebuilt from the repository alone, the layer "must never be described as live". We hold ourselves to that: the [accuracy commitments](https://github.com/daxfoundation/metadax/blob/main/docs/ACCURACY.md) call `key_id`, `constraint_decl_ref` and `constraint_decl` "null placeholders".

The protocol's own [page](https://daxfoundation.org/constraint-protocol/) says "The larger purposes in the specification, such as compounding knowledge over time, are design intent, and none has been demonstrated", and that it "verifies structure, not truth": a signed technique shows who stood behind it, not that it is right. Hence the [README](https://github.com/daxfoundation/metadax#a-way-never-the-way): "There is never the way. There is always a way."

Failures need deliberate keeping, because the default runs the other way. Among 4,656 randomly sampled papers that declared a hypothesis test, across all disciplines, [Fanelli (2012)](https://link.springer.com/article/10.1007/s11192-011-0494-7) found the share reporting a positive result was 70.2% in 1990–1991 and 85.9% in 2007. That counts what reached print, not what was never written down, but his abstract states the worry: "A system that disfavours negative results not only distorts the scientific literature directly". A commons that keeps only what worked inherits that tilt. We publish ours with the same labels as our positives: the findings post gives more of its length to its two negatives than to its positive.

## This week

Keep one dead end, and write it where someone else can find it. Four lines are enough: what you tried; what it looked like when it stopped working, which X01 calls the stuck signature; what you think happened, marked as a guess; and where you stopped. Date it, put it where colleagues already look, and do not edit it later to be right; add a line beneath. If you govern AI for a living, a good first candidate is a control that did not catch what it was meant to catch. At a family's kitchen table the same move is a few lines at the end of a session, which [Session two](https://daxfoundation.org/writing/session-two/) describes.

this is the fourth of five pieces on the Constraint Protocol. [The third](https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/) covers what the one run on 4 May 2026 recorded, including three bypass requests that were never acted on, and [the fifth](https://daxfoundation.org/writing/run-it-with-us/) says what that run did not test and how to break the protocol on purpose.

What did you try last month that did not work, and where is it written?

## Sources

- Fanelli, D. (2012). Negative results are disappearing from most disciplines and countries. *Scientometrics*, 90(3), 891–904. https://link.springer.com/article/10.1007/s11192-011-0494-7 (DOI 10.1007/s11192-011-0494-7. Sample N = 4,656 papers that declared a hypothesis test, randomly sampled across disciplines; share reporting a positive result 70.2% in 1990–1991 and 85.9% in 2007; the quoted sentence is from the abstract. Verified against the author's full text at https://eloquentscience.com/wp-content/uploads/2012/02/Fanelli12-NegativeResults.pdf and the Edinburgh record at https://www.research.ed.ac.uk/en/publications/negative-results-are-disappearing-from-most-disciplines-and-count/.)
