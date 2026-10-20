---
title: "Fourteen small experiments, and why small first"
description: "What E01 to E14 each test, which have run, and the bottlenecks found before anyone was hurt by them."
date: 2026-10-18
updated: 2026-10-20
draft: false
series: results
part: 2
series_total: 5
related:
  - url: https://daxfoundation.org/writing/the-first-run/
    label: "The first run: a first page in eight minutes, and what it got wrong"
  - url: https://daxfoundation.org/writing/the-stranger-test/
    label: "The stranger test"
  - url: https://daxfoundation.org/writing/field-note-twenty-nine-runs/
    label: "Twenty-nine runs in two days, and what failed"
  - url: https://daxfoundation.org/metadax/research/
    label: "The research"
  - url: https://daxfoundation.org/writing/twelve-scenes-01-the-nurses-walkthrough/
    label: "Twelve scenes, 1: the nurse's walkthrough"
  - url: https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261019.md
    label: "Findings of 18 and 19 October"
  - url: https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md
    label: "The next experiments"
  - url: https://www.obsidiandelta.com/blog/what-is-already-solved/
    label: "What is already solved"
---

Meta DAX makes a large promise: every human being, any subject, free, forever. A promise that size is earned by small tests, each written down the day it finishes, whichever way it went. The fourteen small experiments, E01 to E14, were designed first for that reason. Each asks one question and has a stop rule written before the run: the line at which the idea is killed. [The research page](https://daxfoundation.org/metadax/research/) puts the logic in a sentence: "The small ones are how we earn the big ones: nothing in the third tier can run honestly until the first two have."

## The fourteen, as the record has them

The statuses follow the cards in the [experiments folder](https://github.com/daxfoundation/metadax/tree/main/experiments) and [the findings of 19 October](https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261019.md). No run has had a person. Unless marked deterministic, a model played the people, and the files label it SIMULATED.

| Experiment | Status |
|---|---|
| **E01** A guide creates a course in a repository from one line | ran 27 Sep, 18 Oct: PASS, simulated |
| **E02** The same from a chat that cannot write files | not started: needs a second vendor's key |
| **E03** A learner session: read, three follow-ups, quiz, save | ran 27 Sep, 18 Oct: FAIL; 19 Oct, one arm PASS |
| **E04** Do the prompts pass on two vendors' models? | ran 9 Oct, 18 Oct: FAIL; two vendors untested |
| **E05** Does the follow-up engine reuse correctly? | ran 9 Oct, 18 Oct: narrow PASS; 19 Oct: INCONCLUSIVE |
| **E06** Does the weekly bundle loop close at 50 kbps? | ran 18 Oct: PASS, computed, not measured |
| **E07** A unit grounded on an open curriculum, citations real | not started: needs network access to it |
| **E08** Generated interactive assets, tested against an oracle | ran 18 Oct: PASS, core only, simulated |
| **E09** Records a homeschooling parent would file | ran 18 Oct: PASS, simulated |
| **E10** A small on-device model running the quiz | not started: needs a small-model runtime |
| **E11** A learner record ingested by a companion (isolated copy) | ran 18 Oct: PASS, simulated |
| **E12** Provenance and signed commits, verified later as a chain | ran 18 Oct: PASS, deterministic |
| **E13** A teaching-method variant, generated and put through the prompt checks | ran 18 Oct: PASS on a substituted variant; 19 Oct: INCONCLUSIVE |
| **E14** Does the age wall bite in practice? (observe only) | ran 18 Oct: FAIL; 19 Oct: still FAIL |

E01 and E03 first ran on 27 September, with a model as the guide and a simulated adult as the learner; [the first run](https://daxfoundation.org/writing/the-first-run/) is not a pilot with a person. On 18 October E03 failed with 44 validation errors; on 19 October one session with fixes had no errors: a hint, not a result.

E04 gates the rest, and E05 depends on it. Their 27 September files read "NOT RUN": the build environment's model client was not logged in. Both ran on 9 October, on one vendor's model, scored by a deterministic checker. [E04's record](https://github.com/daxfoundation/metadax/blob/main/experiments/E04/results/2026-10-09-run.md): 12 of 19 cases passed, then 11 of 15 after a checker fix and a prompt edit. [E05's record](https://github.com/daxfoundation/metadax/blob/main/experiments/E05/results/2026-10-09-run.md): 9 of 12 passed, the other three passed on a second run, with no precision or recall. On 18 October E04 failed, no operation reaching 90 percent schema-valid, mostly because the runner printed its reasoning first. E05 narrowly passed in simulation, precision 0.810 against a 0.80 line; the smaller model scored 0.805, then 0.739. An earlier version of this piece counted E04 and E05 as not run, because their records were not yet public.

## The twelve scenes, X13 and X14, and a register

X01 to X12 are the twelve scenes, written as studies with people. [The full set](https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md), first published on 1 October, opens "These are planned experiments. None has run." [Twelve scenes, 1](https://daxfoundation.org/writing/twelve-scenes-01-the-nurses-walkthrough/) tells the first. Eleven have since run, with a model or script in the people's chairs. X02, X06, X09 and X10 passed. X03 passed with a caveat: review caught 3 of 3 planted errors and missed the 1 planted omission. X08 failed, then was inconclusive, as were X01, X04, X05, X07 and X11. X12, the capstone, has not run.

X13 and X14 are not E13 and E14. They ran on 10 October with a model in both chairs, and [the findings](https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261010.md) label every number measured, estimated or simulated. X14 held answer quality as the library grew, with about 75 times fewer context tokens per turn at the largest, simulated library (estimated). X13 was a negative, [with a post of its own](https://daxfoundation.org/writing/the-slower-model-was-not-the-safer-model/).

Every run feeds the [bottleneck register](https://github.com/daxfoundation/metadax/blob/main/experiments/BOTTLENECKS.md), which opens: "Every experiment run, pass or fail, can surface a bottleneck." It now holds 93 entries, 89 open. B13, the whole course as the context for every turn, still reads "open" though X14 was designed against it. B77: once X11 gave its offers neutral wording, an independent evaluator flagged none of six offers but all eleven atlas markers. The files cited for B04 to B93 are public; those for B01 to B03 are not yet.

## What it means for you

Pick the experiment closest to your work and read its stop rule. If you homeschool, E09 asks whether the records a provincial template requires could fall out of lessons already done. If your connection is thin, read E06 and E10. If you teach, E07 asks whether a unit can be grounded on an open curriculum with no invented citation. If the line sits in the wrong place, say so.

This is part two of five on what has run. [The first run](https://daxfoundation.org/writing/the-first-run/) comes before it; [The stranger test](https://daxfoundation.org/writing/the-stranger-test/) comes next. The failures of 18 and 19 October, the age wall first, are in [Twenty-nine runs in two days, and what failed](https://daxfoundation.org/writing/field-note-twenty-nine-runs/). Obsidian Delta's [What is already solved](https://www.obsidiandelta.com/blog/what-is-already-solved/) reads the same stack from a business's side.

Which of the fourteen would you run first, and why?

## Sources

- Meta DAX, "The research" (internal): https://daxfoundation.org/metadax/research/
- Meta DAX repository, experiments folder, cards E01 to E14 and X01 to X14, with X-PLAN.md (internal): https://github.com/daxfoundation/metadax/tree/main/experiments
- Meta DAX, "Findings: runs of 18-19 Oct 2026", experiments/FINDINGS-20261019.md (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261019.md
- Meta DAX, experiments/BOTTLENECKS.md, entries B01 to B93 (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/BOTTLENECKS.md
- Meta DAX, experiments/E04/results/2026-10-09-run.md and experiments/E05/results/2026-10-09-run.md, with raw replies in each folder's 2026-10-09-raw (internal): https://github.com/daxfoundation/metadax/tree/main/experiments/E04/results
- Meta DAX, experiments/E04/results/2026-10-18-cert3.md and experiments/E05/results/2026-10-18-reuse-decisions.md and 2026-10-19-reuse-decisions-run2.md (internal): https://github.com/daxfoundation/metadax/tree/main/experiments
- Meta DAX, experiments/E03/results/2026-10-18-probability-learner-run.md and 2026-10-19-probability-learner-run-run2.md (internal): https://github.com/daxfoundation/metadax/tree/main/experiments/E03/results
- Meta DAX, experiments/X11/results/2026-10-18-negative-space.md, offers and atlas markers (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/X11/results/2026-10-18-negative-space.md
- Meta DAX, "Findings, 10 October 2026" (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261010.md
- Meta DAX, docs/NEXT-EXPERIMENTS.md, "Where we want to get to: twelve experiments, written as scenes" (internal): https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md
- Meta DAX, experiments/E04/results/2026-09-27-first-run.md and experiments/E05/results/2026-09-27-first-run.md, outcome "NOT RUN" (internal): https://github.com/daxfoundation/metadax/tree/main/experiments/E04/results
