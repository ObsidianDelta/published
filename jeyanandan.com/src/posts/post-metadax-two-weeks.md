---
title: "Meta DAX, Two Weeks In"
subtitle: "The Open Recipe, the Honest Results, and Your Chair"
date: 2026-10-11
updated: 2026-10-11
description: "Two weeks after the introduction: what Meta DAX actually is now — the one idea underneath it, the open recipe, the showcases, the first honest experiment results, the first dish — and where you come in."
draft: false
tags: ["meta-dax", "learning", "experiments"]
---

*Two weeks ago I [introduced Meta DAX](/blog/meta-dax/). This is the working log from inside it: what exists now, what the first experiments showed, and where you come in.*

---

## The one idea

Everything below comes down to one trick, and it is the part people do not expect. A lesson on fractions is the same lesson whether it is played in a football stadium, a kitchen, or the back of a jeepney. What changes is the skin: the recipe builds the page through whatever that particular learner already loves. Newton's laws for a kid who lives for hockey are Newton's laws with pucks; for a kid who lives for theme parks they are Newton's laws with a sled. **Same lesson, any skin, built for one person.** Once that works for a child at a kitchen table, it works for a new hire's first week and for a first-year university unit, because the recipe does not care what the subject is. Everything that follows is that one idea, run through different doors.

---

## What exists now, in one screen

Open the repository and the whole recipe is there — not a description of it, the thing itself. The prompts. The course factory that takes a subject and a learner and writes the tree before a page exists: program, course, lesson, the misconceptions mapped in advance. The guide coach that answers *"the problem I'm having with this student"* with moves and a script, not platitudes. And the context profiles that tell the system whether it is sitting at a kitchen table, in a reading club with no power that afternoon, or in a first-year lecture hall. All of it is at **[github.com/daxfoundation/metadax](https://github.com/daxfoundation/metadax)**, in `prompts/`, free to read, fork and run. A recipe, never a product.

Five showcases, each built by that factory from a short brief, each a page you can open right now: **[Le Stade des Fractions](https://daxfoundation.org/metadax/samples/stade-des-fractions/)**, a 3D fractions parcours for one eleven-year-old; **[First Week at the Bakery](https://daxfoundation.org/metadax/showcases/first-week-at-the-bakery/)**, staff onboarding from a one-page brief; **[The Proton Mill](https://daxfoundation.org/metadax/showcases/proton-mill/)**, a first-year biology lesson on how mitochondria make ATP; **[The Tutor's Desk](https://daxfoundation.org/metadax/showcases/tutors-desk/)**, one tutor's week — rough notes in, a parent-ready report out, and the coach working the problem she keeps hitting; and **[The Year on the Wall](https://daxfoundation.org/metadax/showcases/grade-6-science-year/)**, a whole Grade 6 science year — 36 weeks mapped, misconceptions named, one week built in full. Every one is a model-generated example, reviewed for safety and not certified, and says so on its own face.

Underneath them, **[nine homeschool samples](https://daxfoundation.org/metadax/samples/)** across reading, maths, science, writing and history — made-up families, nothing identifying, one page for the guide and one for the child. And the homeschool skill, [in the open repo](https://github.com/daxfoundation/metadax), that lets you make your own: its prompt now works pasted into a plain chat with no tools at all — it hands you the package and [the player](https://daxfoundation.org/metadax/play/) checks it. The [tutor skill](https://github.com/daxfoundation/metadax/tree/main/skills/metadax-tutor) and [teacher skill](https://github.com/daxfoundation/metadax/tree/main/skills/metadax-teacher) are merged in the same repo — open to run today.

---

## Pick your chair

Meta DAX is one system with many seats. Pull up the one that is yours, and tell me what you would bring to it.

- **Parent.** [Start here](https://daxfoundation.org/metadax/homeschool/): describe your child and what they love, and get a package built around it — a page for you, a page for them, no AI on the child's side. *What is your learner stuck on this week?*
- **Tutor.** [The tutor's door](https://daxfoundation.org/metadax/tutor/): rough session notes in, a clean parent-ready report out, and a coach for the problem you keep hitting with one student. *Which student would you bring to it first?*
- **Teacher.** [The teacher's door](https://daxfoundation.org/metadax/teacher/): plan a term or a year from one brief, with the misconceptions named before any page exists, and share what you build so another teacher can fork it. *What is the one lesson you have rebuilt from scratch too many times?*
- **Trainer.** [The trainer's door](https://daxfoundation.org/metadax/trainer/): turn a one-page brief into an onboarding module a new hire actually finishes, the way the bakery did. *What does someone need in their first week that nobody has written down yet?*
- **Researcher.** [The research door](https://daxfoundation.org/metadax/research/): every experiment is a script, a question, and the result that would tell us to stop. Reproduce them, argue with them, break them. *Which of our findings would you most like to prove wrong?*

Every door is open. If you want to see before you try, each one has a walkthrough at `/metadax/<door>/walkthrough/` — a step-by-step preview of a session, with real screenshots of the pages it produces. None of these is *the* way in. They are doors onto one room.

---

## What the experiments showed, honestly

I said in the introduction that the difference between a pitch and a repository is that the results land whichever way they go. Here is the record so far. Every number carries its label — **MEASURED**, **ESTIMATED**, or **SIMULATED** — because you deserve to know what was observed and what was modelled.

The first two experiments, **E01** and **E03**, are first cuts only: on 27 September a model-as-client built a course into a repository, and a simulated learner session ran end to end — a node read, follow-ups three levels deep, a quiz, a save. Both were automated, with a model in both chairs, run once. The machine works end to end. Whether *people* learn from it is a later experiment, not these.

Then two sharper questions about how a learning companion should use the shared commons.

**X14 — fetch the spot, not the course.** Should the companion pull back the one piece a learner needs this turn, rather than loading a whole course into memory on every question? Each question was answered two ways and graded blind, out of five. Fetching just the matching spot, its ancestor trail and a small budgeted sample of variants **matched whole-course quality at every library size** — same pass rate, average score within a few tenths of a point (quality MEASURED). And at the large library it used roughly **75× fewer context tokens per turn** (ESTIMATED), with the index still finding the right node 87% of the time (MEASURED). The cost tracks the question, not the size of the library. The honest caveats: only **six questions** were graded, so read the quality as directional; the larger libraries and the non-English variants are **SIMULATED**; and the token counts are an ESTIMATED approximation, not a real tokenizer.

**X13 and X13b — a negative result, stated plainly.** The idea was to run a small fast model by default and escalate to a large slow one only when a turn is genuinely hard. It did not work the way I expected, and that is worth more than if it had. The small model sat **at or near parity** with the large one — 87.5% against the large model's 90.0% on the hard test set (MEASURED), tied at 100% on multi-step maths, diagnosing a misconception, and long-context retrieval. The model's own confidence **did not predict its misses**: it averaged 0.928 when right and 0.910 when wrong, a gap of under two hundredths, and a cheap self-check caught **none** of the five real failures (MEASURED; costs ESTIMATED, the repeat-failure signal SIMULATED). And on the one acute safety case, it was **the large model that got it wrong** — it read *"I don't want to be here anymore"* as exam frustration and carried on teaching; the small model handled it correctly.

So three things changed in the design, held as hypotheses for the next experiments, not settled law: **small model by default**, because it carries the ordinary turn; **a dedicated safety path** that does not depend on which tier is running, because the bigger model was not the safer one; and **spend the effort on retrieval**, because that is where the measured win actually is. The whole record, with the stop rules and the raw outputs, lives with [the experiments](https://github.com/daxfoundation/metadax/tree/main/experiments).

---

## How it's built, and why it's free

My cognitive companion builds all of this, and it runs on paid compute. That is the honest shape of it, and it is also the point. Every build done for someone who pays can be shared back into the commons, de-identified, so the next person starts from reuse instead of a blank page. That is the flywheel: a teacher's published course, a learner's good question folded in with permission, a stumble a guide fixed so nobody falls into the same hole twice. Each one makes the next path shorter. The commons gets better every time somebody walks on it.

The line I hold is simple. **Meta DAX, and the Foundation's universal learning initiative behind it, is free — the recipe, the skills, the samples, all of it.** The [done-for-you work](https://www.obsidiandelta.com/opportunities/) — a package built to order, a report written in your voice, a course built in a week, and the businesses the whole stack now opens up for someone who brings their own expertise — is a separate, clearly labelled service, Obsidian Delta's, never the Foundation's. The free thing stays free. The paid thing pays for the compute that keeps the free thing running and feeds the commons. That is the whole arrangement, and I would rather you understood it than trusted it.

Which brings me to the one sentence I will say outright:

> **Meta DAX is free. It is built on paid compute. If it helped, a coffee on [Ko-fi](https://ko-fi.com/jeyanandan) or a [GitHub sponsorship](https://github.com/sponsors/ObsidianDelta) keeps it going.**

---

## What's new today

The first of the food packages is live: **[Sri Lankan Tamil chicken curry, Jaffna style](https://daxfoundation.org/metadax/showcases/tamil-chicken-curry/)** — my mother's recipe, as she told it to me this morning, built by the recipe from a brief of eight lines into a 3D kitchen in three stations: where it comes from, how to make it, what it means. Tamil and English on one click. Every culture has a dish that only one person in the family makes properly, and inside that dish is a whole lesson: the measuring and the ratios, the heat and the time, the one step that matters, and the story of where it comes from. The brief is on the page, so you can see exactly what had to be said to get all of that. The same recipe will build the next one for whoever sends me theirs. On formaddie.com I wrote up why: [The recipe is the story](https://formaddie.com/blog/the-recipe-is-the-story/).

**Send me a scenario.** A dish — or any subject — a learner and a guide, in three lines, and I build it in the open, the way that one was built. The first ten. Reply wherever you found this, or [open an issue](https://github.com/daxfoundation/metadax/issues).

---

## Where you come in

Three things, and each is specific on purpose.

1. **Send me a scenario**, as above. A real learner, a real stuck spot, a real first week — whatever chair you sit in. Change the names, keep the shape. I want to point the factory at situations I did not invent.
2. **Try one skill and tell me what broke.** Not what you liked — what broke. A wrong turn, a tone that was off, a place it steered you when it should have offered a door. The system is built to be told when it felt like *the* way instead of *a* way, and I read every report.
3. **A coffee, or your name on a package**, if it helped. The sentence above is the whole of it.

None of this is production. The experiments are not products, and I will keep publishing the results that go against me as carefully as the ones that go my way. Human delta value — the old question of what a person brings that nothing else brings, which I have been chewing on far longer than any of this — is the thread I am measuring all of it against: what you do with the cognition you get back.

Everything here is held to one sentence, and I know it is absurd: **take a person who can communicate, and get them to the equivalent of a master's degree from an Ivy League university — on five minutes of connectivity a day.** It only has to work in theory for the design to be worth holding. We are developing this for all bandwidths!

---

*Versioned like everything else here; the [History](https://github.com/ObsidianDelta/published/commits/main/jeyanandan.com/src/posts/post-metadax-two-weeks.md) is public. Published through my cognitive companion, one unit — [how I publish](/blog/how-i-publish/).*
