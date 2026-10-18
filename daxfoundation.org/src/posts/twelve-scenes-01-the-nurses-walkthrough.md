---
title: "Twelve scenes, 1: The nurse's walkthrough"
description: "A charge nurse in Enugu has forty minutes, and the first thing the walkthrough does is ask what she brings."
date: 2026-10-18
draft: false
---

*A charge nurse in Enugu has forty minutes, and the first thing the walkthrough does is ask what she brings.*

*Twelve scenes is a weekly series: one scene a week, from the twelve experiments we have planned for Meta DAX. Every one is planned, not run. Each is told through one person, because the scale is easier to see in one life; the people are fictional, first names only, and the places, languages and subjects are real.*

## Forty minutes in Enugu

Ngozi has been a charge nurse for fourteen years. She wants a short course for the newly qualified nurses who rotate through her ward, on fluid balance charts and drip-rate calculation, in English with the ward's Igbo.

The walkthrough does not begin by asking what she wants. It asks what she brings. She tells it what no textbook says: new nurses fill the chart in correctly and do not look at it. The error is not arithmetic. It is not reading the trend at six in the morning.

Meta DAX supplies the defaults. She picks an outcomes rubric from a catalogue; this one was published last year by a nurse educator in Manila. The lesson plan arrives defaulted against it: twelve stages, the map drawn, the targets set, the schemas checked. What is left to Ngozi is micro-adjustment and the things only she can do. Setting the destination and planning the misconceptions are hers, in her own words. Designing the pages she does with her cognitive companion, which she directs and answers for: it drafts scenario pages from the ward's routines, with no patient in them, and she corrects them as she would correct a learner.

The planning step proposes opening with the formula. She overrides it: open with a chart at 06:00 and ask "what do you do now?" The override is recorded as hers, kept together with the proposal it replaced. Three nurses take the course. The report on them comes back pseudonymous: they stumbled where she said, at reading, not calculating. One stumble was not where she said: units. She adds a page.

On the fourth evening she notices something no report shows. Chidinma, on night rotation, has gone quiet, on the ward and, Ngozi suspects, in the course. She phones her before the shift and finds out why. Asked at the end what the system took off her and what she spent it on, Ngozi reports the plan, the map, the targets and the checking, and says she spent it on Chidinma. The system did not infer that. She told it.

## Where the guide and the learner sit

On reading the trend on a fluid balance chart, Ngozi is the guide: she has fourteen years on the ward, and the three newly qualified nurses are learners. But whoever is a step ahead, right now, on this, is the guide, and that moves with the stage. On what this ward's new nurses get wrong, Ngozi is ahead of the system. On laying twelve stages against a rubric, the system is ahead of her, which is why the plan arrives defaulted. The educator in Manila is a guide at a distance, through a rubric. The experiment asks whether those seats can be declared stage by stage, and kept.

## What the experiment would test

The card asks whether a profile can declare, for each stage, who is in charge (the guide, the guide with her companion, or the system), and whether the guide can override the system mid-stage with the override recorded, not silently applied. If ownership is explicit and overrides are logged, human authority and machine help can sit together. If not, the system either overrules the guide or cannot help at all.

Its status on the card is designed: planned, not run. The first version can be tested now, labelled simulated: a deterministic script sequences stages with declared owners, a model plays the guide and the learner, and the script injects an override at a stage the system owns. Three measures:

- Each stage is driven by its declared owner.
- Every override produces a record (who, when, what was overridden, why) and the system yields.
- The system never quietly takes a stage the guide owns.

The kill line: if the system cannot reliably yield a stage the guide owns, or overrides are not recorded, we stop until authority can be enforced. The card sets no number for passing. It names only what would end the work.

Only real people can show the rest, including whether a guide feels in control. The fuller version asks Ngozi, in her own report, where her attention went; whether each override survives, meaning no learner shows the stumble the default was meant to prevent; and which predicted misconceptions appeared and which did not. Its kill line is separate: if her overrides are no better for learners than the defaults, and her report says her attention went nowhere new, the walkthrough gave nothing back.

## What would make it fail

The session envelope may be unable to express per-stage ownership, because it assumes the system is always in charge; the card lists the per-stage profile and the override record as missing today. The system may not yield. The overrides may be no better than the defaults. The stage plan may skip a stage she needed, which would mean it assumed a generic guide again.

Two designs are already ruled out. A single global on/off flag is too coarse, since real sessions mix owners stage by stage. And an override applied silently cannot be learned from, and the guide cannot trust the record.

## Why it matters at scale

A parent in Bristol, a swimming coach in Durban and a trainer at a bus company in Lima open the same walkthrough that month. The stages are the same. Which stages are theirs is not. Templates for each kind of guide differ only in which stages default to the person, so the stage logic carries across, not Ngozi's content. The catalogue gains the rubric she publishes, and her predicted stumbles become misconceptions in every fork. Overrides are data: where guides overrule the system is a map of where the system is weakest, and it feeds our bottleneck register directly.

## Try to break it

This is written precisely enough to be argued with. If you see a stage it would hand to the wrong owner, an override it would lose, or a learner it would leave quiet, send the case to Jason on [LinkedIn](https://www.linkedin.com/in/jasonjeyanandan) or open it as an issue on [GitHub](https://github.com/daxfoundation/metadax/issues). All twelve experiments are here: https://github.com/daxfoundation/metadax/blob/main/docs/NEXT-EXPERIMENTS.md
