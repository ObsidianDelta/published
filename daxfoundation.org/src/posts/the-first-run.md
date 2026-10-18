---
title: "The first run: a first page in eight minutes, and what it got wrong"
description: "What the recipe built on 27 September, who played the learner, and the eight things we found."
date: 2026-10-18
draft: false
series: results
part: 1
series_total: 5
related:
  - url: https://daxfoundation.org/writing/fourteen-small-experiments/
    label: "Fourteen small experiments, and why small first"
  - url: https://daxfoundation.org/writing/read-your-page-first/
    label: "Read your page before your child reads theirs"
  - url: https://daxfoundation.org/writing/how-knowledge-compounds-under-a-constraint/
    label: "How knowledge compounds under a constraint"
  - url: https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31
    label: "Newton's Laws Test Run (report)"
  - url: https://github.com/daxfoundation/metadax/tree/main/experiments
    label: "The experiments folder"
---

On 27 September the recipe built a whole introductory course, and a made-up learner took it. Every person in that sentence was a model, so the useful output was not the course. It was the list of places where our own specification did not say what we meant. This is what a run like that can tell you before any real family is involved, and what it cannot. Each number below carries a label: counted (read off a file or a validator), timed (the wall clock of an automated run with no human in it) or SIMULATED (produced by a model playing the learner).

## What was built, and who played whom

Open [the run report](https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31). It opens on "Newton's laws, taught and taken end to end", a row of five counters, and a course map you can click through: three lessons, seven modules and 21 objectives (counted) for an adult who "wants to understand the three laws properly, with everyday examples and a little algebra, no calculus". Pick an objective, say "Calculate force, mass or acceleration with F = ma", and the page has five sections, from "Why this matters" and "One equation, three forms" to a common-mistake section and "Synthesis". Further down are three interactive labs, Glide, Push and Push apart, each a predict-run-explain loop. They were built after the run, as a proposal the recipe has no place for yet.

One large model sat in both chairs: the client that assembles each step and the engine that answers it, with the recipe's own tools checking every output. Two versions of it wrote the pages, one the outline and the first six objectives, the other the remaining fifteen. The learner was SIMULATED. The same model wrote the learner's messages and the tutor's replies, and the report says: "It is not evidence about how a real person learns." The guide's side is a reconstruction as well. The report lays out twelve stages (its heading says "Teacher's workflow"), from knowing the learner to reviewing what comes back, and marks the reasoning "a reconstruction", worked from a rubric that "is fictional".

## What the numbers say, and what they do not

The eight minutes belong to the earlier, smaller cut, [E01 run 1](https://raw.githubusercontent.com/daxfoundation/metadax/main/experiments/E01/results/2026-09-27-teacher-run-newtons-laws.md): an empty repository to a course of seven objectives, the first page saved at 479 seconds and the whole short course at 908 (timed). The 21-objective course was the second run: 22 operations in 57 minutes (timed), including a pause when the first model session stopped, with 12,810 words of core text and a passing validator after every one of the 21 pages (counted). The pages came out at two lengths: the first six averaged 942 words and the other fifteen 477 (counted), because the prompt caps a section at 220 words and sets no floor. [The run's own note](https://raw.githubusercontent.com/daxfoundation/metadax/main/experiments/E01/results/2026-09-27-newton-course-run.md) adds that part of the gap is topic.

The SIMULATED learner started in Module 2, asked six follow-up questions that went four levels deep, took an eight-turn quiz and ended with a saved record: competency 83 on the first law (all SIMULATED). The save step then sent the learner back to the foundations they had skipped. The report lists six things this teaches a guide and calls them "questions to watch in real sessions, not conclusions", because they come from one simulated learner. One example: the learner called inertia a force, exactly as the guide's list of likely mistakes predicted. The same model wrote both, so that shows the two agree, not that real adults slip there.

The more useful result is the list. [The learner run](https://raw.githubusercontent.com/daxfoundation/metadax/main/experiments/E03/results/2026-09-27-newton-learner-run.md) logged eight findings, F-L1 to F-L8, four fixed and four open (counted). Three were bugs the unit tests had missed. The tool that records a reused page wrote something its own schema rejected. The step that grades a practice answer was given the page and no rubric. A follow-up tagged a concept that does not exist, and nothing checked. The other five are mostly gaps in what the specification says: the quiz climbed to an Apply question on an objective that targets Understand; a rule about prerequisites silently dropped a consolidation step. The earlier run had logged eight defects of its own (counted), mostly in our written instructions: the walkthrough never said git needs an identity set.

None of this shows a person learning anything. The [E01 card](https://github.com/daxfoundation/metadax/blob/main/experiments/E01/README.md) calls the runs "not yet a human pilot", and the raw stacks and outputs are kept by the maintainers, not published; the write-ups are.

## What it means for you

If you are a guide, the part to read is not the pages but the order. Each of the twelve stages records what was decided and, under "Not taken", what was rejected and why. Opening with F = ma was rejected because "algebra before meaning invites exactly the memorisation the learner wants to avoid". This week, open the course map, read down the 21 objectives, and find the one you would have put somewhere else. That is a guide's judgement about a learner you know, and a made-up learner cannot supply it.

This opens the results series, five parts. The next, [Fourteen small experiments, and why small first](https://daxfoundation.org/writing/fourteen-small-experiments/), covers what E01 to E14 each test and which have run; this was the first two. The guide's side of a page, the same kind of preparing done for one child, is in [Read your page before your child reads theirs](https://daxfoundation.org/writing/read-your-page-first/). What becomes of a dead end such as the open F-L4 is the subject of [How knowledge compounds under a constraint](https://daxfoundation.org/writing/how-knowledge-compounds-under-a-constraint/): the record of what was tried. When F-L8 was fixed, the report noted that earlier events "are immutable and stay as written". Both experiments' cards and results are in [the experiments folder](https://github.com/daxfoundation/metadax/tree/main/experiments).

Reading the map, where would a real learner have stopped, and what would they have needed to hear first?

## Sources

- Newton's Laws Test Run, the illustrated report for experiments E01 and E03, run of 27 September 2026 (the report's UTC clock reads 28 September, 00:13 to 01:23): https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31
- E01 run 2, the 21-objective course: https://raw.githubusercontent.com/daxfoundation/metadax/main/experiments/E01/results/2026-09-27-newton-course-run.md
- E01 run 1, the seven-objective cut and its defect list: https://raw.githubusercontent.com/daxfoundation/metadax/main/experiments/E01/results/2026-09-27-teacher-run-newtons-laws.md
- E03 run 2, the learner run and findings F-L1 to F-L8: https://raw.githubusercontent.com/daxfoundation/metadax/main/experiments/E03/results/2026-09-27-newton-learner-run.md
- E01 card, status line ("done (first cut, 2026-09-27; automated runs … not yet a human pilot)"): https://github.com/daxfoundation/metadax/blob/main/experiments/E01/README.md
