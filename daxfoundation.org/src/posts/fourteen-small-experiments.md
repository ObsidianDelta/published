---
title: "Fourteen small experiments, and why small first"
description: "What E01 to E14 each test, which have run, and the bottlenecks found before anyone was hurt by them."
date: 2026-10-18
draft: false
series: results
part: 2
series_total: 5
related:
  - url: https://daxfoundation.org/writing/the-first-run/
    label: "The first run: a first page in eight minutes, and what it got wrong"
  - url: https://daxfoundation.org/writing/the-stranger-test/
    label: "The stranger test"
  - url: https://daxfoundation.org/metadax/research/
    label: "The research"
  - url: https://daxfoundation.org/writing/twelve-scenes-01-the-nurses-walkthrough/
    label: "Twelve scenes, 1: the nurse's walkthrough"
  - url: https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md
    label: "The next experiments"
  - url: https://www.obsidiandelta.com/blog/what-is-already-solved/
    label: "What is already solved"
---

Meta DAX makes a large promise: every human being, any subject, free, forever. A promise that size is earned by small tests, each written down the day it finishes, whichever way it went. The fourteen small experiments, E01 to E14, were designed first for that reason. Each asks one question and has a stop rule written before the run: the line at which the idea is killed. [The research page](https://daxfoundation.org/metadax/research/) puts the logic in a sentence: "The small ones are how we earn the big ones: nothing in the third tier can run honestly until the first two have."

## The fourteen, as the record has them

The [experiments folder](https://github.com/daxfoundation/metadax/tree/main/experiments) holds one card per experiment, each with the same ten headings from Question to Results; Results reads "none yet" until a run produces one. The statuses below follow the research page.

| Experiment | Status |
|---|---|
| **E01** A guide creates a course in a repository from one line | done, first cut, 27 Sep |
| **E02** The same from a chat that cannot write files | not started |
| **E03** A learner session: read, three follow-ups, quiz, save | done, first cut, 27 Sep |
| **E04** Do the prompts pass on two vendors' models? | built, not run |
| **E05** Does the follow-up engine reuse correctly? | built, not run |
| **E06** Does the weekly bundle loop close at 50 kbps? | not started |
| **E07** A unit grounded on an open curriculum, citations real | not started |
| **E08** Generated interactive assets, tested against an oracle | not started |
| **E09** Records a homeschooling parent would file | not started |
| **E10** A small on-device model running the quiz | not started |
| **E11** A learner record ingested by a companion (isolated copy) | not started |
| **E12** Provenance and signed commits, verified later as a chain | not started |
| **E13** A teaching-method variant, generated and put through the prompt checks | not started |
| **E14** Does the age wall bite in practice? (observe only) | not started |

E01 and E03 are automated: a model played the guide and a simulated adult played the learner, so [the first run](https://daxfoundation.org/writing/the-first-run/) is not a pilot with a person. E04 gates the rest, and E05 depends on it. Their harnesses and cases are built, and each dated results file reads "NOT RUN": the build environment's model client was not logged in.

One disagreement in our own record should be named. The bottleneck register attributes five findings (B04 to B08) to E04 and E05 runs on 9 October, and X-PLAN.md says E04 and E05 "ran 2026-10-09". The run records those entries cite are not in the public repository, and the cards still say not started. The [accuracy commitments](https://github.com/daxfoundation/metadax/blob/main/docs/ACCURACY.md) say "No result is presented that was not produced by a recorded run." Until the records are published we count E04 and E05 as built, not run, and the cards and register are unreconciled.

## Twelve scenes, two more runs, and a register

A second series shares the letter X. X01 to X12 are the twelve scenes, and [the full planned set](https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md) opens with "These are planned experiments. None has run." [Twelve scenes, 1](https://daxfoundation.org/writing/twelve-scenes-01-the-nurses-walkthrough/) tells the first. Four of the twelve (X01, X02, X04, X11) have a first model-played pass dated 9 October, labelled SIMULATED in its own file; we do not count those as runs. The other eight have none.

X13 and X14 are not E13 and E14. They ran on 10 October, with a model in both chairs, and [the findings](https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261010.md) label every number measured, estimated or simulated. X14 asked whether fetching only the matching piece of a course holds answer quality as the library grows. It held, directionally: 5 of 6 graded questions passed in every cell, and at the largest, simulated library the context was about 75 times smaller per turn (estimated). X13 and its harder follow-up X13b asked whether a small model could answer by default, with a large one called in when needed. That was a negative: across 32 cases the small model passed every case the large one did. On the one acute safety case the large model read "I don't want to be here anymore" as exam frustration and the small one did not; [that result has a post of its own](https://daxfoundation.org/writing/the-slower-model-was-not-the-safer-model/).

Every run feeds the [bottleneck register](https://github.com/daxfoundation/metadax/blob/main/experiments/BOTTLENECKS.md), which opens: "Every experiment run, pass or fail, can surface a bottleneck." It holds 23 entries, 20 open. B13, found in a simulated pass: the whole course is the context for every turn, so cost grows with the course. X14 was designed against it, and B13 still reads "open". B16: every offer carries a scarcity opener, "few have followed" or "no one has opened yet", built into the template; the simulated pass flagged all twelve offers before any real learner met one. The evidence files cited for B01 to B08 are not public yet; those for B09 to B23 are.

## What it means for you

Pick the experiment closest to your work and read its card. If you homeschool, E09 asks whether the records a provincial template requires could fall out of lessons already done. If your connection is thin, read E06 and E10. If you teach, E07 asks whether a unit can be grounded on an open curriculum with no invented citation. Then read the stop rule, and if the line sits in the wrong place, say so.

This is part two of five on what has run. [The first run](https://daxfoundation.org/writing/the-first-run/) comes before it, on E01 and E03 in detail; [The stranger test](https://daxfoundation.org/writing/the-stranger-test/) comes next, on what happened when stand-ins with no context followed the public page. The scenes behind X01 to X12 appear weekly, and Obsidian Delta's [What is already solved](https://www.obsidiandelta.com/blog/what-is-already-solved/) reads the same stack from a business's side.

Which of the fourteen would you run first, and why?

## Sources

- Meta DAX, "The research" (internal): https://daxfoundation.org/metadax/research/
- Meta DAX repository, experiments folder, cards E01 to E14 and X01 to X14, with X-PLAN.md (internal): https://github.com/daxfoundation/metadax/tree/main/experiments
- Meta DAX, experiments/BOTTLENECKS.md, entries B01 to B23 (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/BOTTLENECKS.md
- Meta DAX, experiments/X04/results/2026-10-09-sim.md, SIMULATED, for B13 and B16 (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/X04/results/2026-10-09-sim.md
- Meta DAX, "Findings, 10 October 2026" (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261010.md
- Meta DAX, docs/NEXT-EXPERIMENTS.md, "Where we want to get to: twelve experiments, written as scenes" (internal): https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md
- Meta DAX, docs/ACCURACY.md, commitment 3 (internal): https://github.com/daxfoundation/metadax/blob/main/docs/ACCURACY.md
- Meta DAX, experiments/E04/results/2026-09-27-first-run.md and experiments/E05/results/2026-09-27-first-run.md, outcome "NOT RUN" (internal): https://github.com/daxfoundation/metadax/tree/main/experiments/E04/results
