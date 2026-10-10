---
title: "Meta DAX, Two Weeks In"
subtitle: "The Open Recipe, the Honest Results, and Your Chair"
date: 2026-10-10
updated: 2026-10-10
description: "Two weeks after the introduction: what Meta DAX actually is now — the open recipe, the showcases, the first honest experiment results — and the specific thing I would like you to do with it."
draft: true
tags: ["meta-dax", "learning", "experiments"]
---

*Two weeks ago I [introduced Meta DAX](/blog/meta-dax/). This is the working log from inside it: what exists now, what the first experiments showed, and the one thing I would like you to do with it.*

---

## What exists now, in one screen

Open the repository and the whole recipe is there — not a description of it, the thing itself. The prompts. The course factory that takes a subject and a learner and writes the tree before a page exists: program, course, lesson, the misconceptions mapped in advance. The guide coach that answers *"the problem I'm having with this student"* with moves and a script, not platitudes. And the context profiles that tell the system whether it is sitting at a kitchen table, in a reading club with no power that afternoon, or in a first-year lecture hall. All of it is at **[github.com/daxfoundation/metadax](https://github.com/daxfoundation/metadax)**, in `prompts/`, free to read, fork and run. A recipe, never a product.

Four showcases, each built by that factory from a short brief, each a page you can open right now: **[Le Stade des Fractions](https://daxfoundation.org/metadax/samples/stade-des-fractions/)**, a 3D fractions parcours for one eleven-year-old; **[First Week at the Bakery](https://daxfoundation.org/metadax/showcases/first-week-at-the-bakery/)**, staff onboarding from a one-page brief; **[The Proton Mill](https://daxfoundation.org/metadax/showcases/proton-mill/)**, a first-year biology lesson on how mitochondria make ATP; and **[The Tutor's Desk](https://daxfoundation.org/metadax/showcases/tutors-desk/)**, one tutor's week — rough notes in, a parent-ready report out, and the coach working a student who keeps freezing. Every one is a model-generated example, reviewed for safety and not certified, and says so on its own face.

Underneath them, **[nine homeschool samples](https://daxfoundation.org/metadax/samples/)** across reading, maths, science, writing and history — made-up families, nothing identifying, one page for the guide and one for the child. And the homeschool skill, [in the open repo](https://github.com/daxfoundation/metadax), that lets you make your own. The tutor and teacher skills are what comes next: they are **not merged yet**, they arrive this weekend, and I would rather say that plainly than let you reach for something that is not in your hands.

---

## Pick your chair

Meta DAX is one system with many seats. Pull up the one that is yours, and tell me what you would bring to it.

- **Parent.** [Start here](https://daxfoundation.org/metadax/homeschool/): describe your child and what they love, and get a package built around it — a page for you, a page for them, no AI on the child's side. *What is your learner stuck on this week?*
- **Tutor.** [The tutor's door](https://daxfoundation.org/tutor/): rough session notes in, a clean parent-ready report out, and a coach for the student who keeps freezing on the same kind of problem. *Which student would you bring to it first?*
- **Teacher.** [The teacher's door](https://daxfoundation.org/teacher/): write a course once and it is open for good — forkable by any teacher anywhere, and the misconceptions you mapped travel with it. *What is the one lesson you have rebuilt from scratch too many times?*
- **Trainer.** [The trainer's door](https://daxfoundation.org/trainer/): turn a one-page brief into an onboarding module a new hire actually finishes, the way the bakery did. *What does someone need in their first week that nobody has written down yet?*
- **Researcher.** [The research door](https://daxfoundation.org/research/): every experiment is a script, a question, and the result that would tell us to stop. Reproduce them, argue with them, break them. *Which of our findings would you most like to prove wrong?*

The parent door is live today. The tutor and teacher doors open with their skills this weekend, and until then every chair can be pulled up to the same recipe in the open repo. None of these is *the* way in. They are doors onto one room.

---

## What the experiments showed, honestly

I said in the introduction that the difference between a pitch and a repository is that the results land whichever way they go. Here is the record so far. Every number carries its label — **MEASURED**, **ESTIMATED**, or **SIMULATED** — because you deserve to know what was observed and what was modelled.

The first two experiments, **E01** and **E03**, are first cuts only: on 27 September a model-as-client built a course into a repository, and a parent-mediated session ran end to end — a node read, follow-ups three levels deep. Both were automated, adult-path, run once. The machine works end to end. Whether *people* learn from it is a later experiment, not these.

Then two sharper questions about how a learning companion should use the shared commons.

**X14 — fetch the spot, not the course.** Should the companion pull back the one piece a learner needs this turn, rather than loading a whole course into memory on every question? Each question was answered two ways and graded blind, out of five. Fetching just the matching spot, its ancestor trail and a small budgeted sample of variants **matched whole-course quality at every library size** — same pass rate, average score within a few tenths of a point (quality MEASURED). And at the large library it used roughly **75× fewer context tokens per turn** (ESTIMATED), with the index still finding the right node 87% of the time (MEASURED). The cost tracks the question, not the size of the library. The honest caveats: only **six questions** were graded, so read the quality as directional; the larger libraries and the non-English variants are **SIMULATED**; and the token counts are an ESTIMATED approximation, not a real tokenizer.

**X13 and X13b — a negative result, stated plainly.** The idea was to run a small fast model by default and escalate to a large slow one only when a turn is genuinely hard. It did not work the way I expected, and that is worth more than if it had. The small model sat **at or near parity** with the large one — 90.0% against 87.5% on the hard test set (MEASURED), tied at 100% on multi-step maths, diagnosing a misconception, and long-context retrieval. The model's own confidence **did not predict its misses**: it averaged 0.928 when right and 0.910 when wrong, a gap of under two hundredths, and a cheap self-check caught **none** of the five real failures (MEASURED; costs ESTIMATED, the repeat-failure signal SIMULATED). And on the one acute safety case, it was **the large model that got it wrong** — it read *"I don't want to be here anymore"* as exam frustration and carried on teaching; the small model handled it correctly.

So three things changed in the design, held as hypotheses for the next experiments, not settled law: **small model by default**, because it carries the ordinary turn; **a dedicated safety path** that does not depend on which tier is running, because the bigger model was not the safer one; and **spend the effort on retrieval**, because that is where the measured win actually is. The whole record, with the stop rules and the raw outputs, lives with [the experiments](https://github.com/daxfoundation/metadax/tree/main/experiments).

---

## How it's built, and why it's free

The fleet that builds all this runs on paid compute. That is the honest shape of it, and it is also the point. Every build the fleet does for someone who pays can be shared back into the commons, de-identified, so the next person starts from reuse instead of a blank page. That is the flywheel: a teacher's published course, a learner's good question folded in with permission, a stumble a guide fixed so nobody falls into the same hole twice. Each one makes the next path shorter. The commons gets better every time somebody walks on it.

The line I hold is simple. **Meta DAX, and the Foundation's universal learning initiative behind it, is free — the recipe, the skills, the samples, all of it.** The [done-for-you work](https://daxfoundation.org/#learning) — a package built to order, a report written in your voice, hosting run for you — is a separate, clearly labelled service, Obsidian Delta's, never the Foundation's. The free thing stays free. The paid thing pays for the compute that keeps the free thing running and feeds the commons. That is the whole arrangement, and I would rather you understood it than trusted it.

Which brings me to the one sentence I will ask outright:

> **MetaDAX is free. It is built on paid compute. If it helped, a coffee on [Ko-fi](https://ko-fi.com/jeyanandan) or a GitHub sponsorship keeps it going.**

---

## What I'm asking

Three things, and each is specific on purpose.

1. **Send me a scenario.** A real learner, a real stuck spot, a real first week — whatever chair you sit in. Change the names, keep the shape. I want to point the factory at situations I did not invent.
2. **Try one skill and tell me what broke.** Not what you liked — what broke. A wrong turn, a tone that was off, a place it steered you when it should have offered a door. The system is built to be told when it felt like *the* way instead of *a* way, and I read every report.
3. **Buy a coffee**, if it helped. The sentence above is the whole of the ask.

None of this is production. The experiments are not products, and I will keep publishing the results that go against me as carefully as the ones that go my way. Human delta value — the old question of what a person brings that nothing else brings, which I have been chewing on far longer than any of this — is the thread I am measuring all of it against: what you do with the cognition you get back.

Everything here is held to one sentence, and I know it is absurd: **take a person who can communicate, and get them to the equivalent of a master's degree from an Ivy League university — on five minutes of connectivity a day.** It only has to work in theory for the design to be worth holding. We are developing this for all bandwidths!

---

*Versioned like everything else here; the [History](https://github.com/ObsidianDelta/published/commits/main/jeyanandan.com/src/posts/post-metadax-two-weeks.md) is public. Published through my cognitive companion, one unit — [how I publish](/blog/how-i-publish/). First published 10 October 2026.*
