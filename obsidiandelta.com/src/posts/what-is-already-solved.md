---
title: What is already solved
description: The free stack, piece by piece, and the businesses it leaves open to the person who brings the expertise.
date: 2026-10-18
draft: false
series: opportunities
part: 1
series_total: 5
related:
  - url: https://daxfoundation.org/writing/fourteen-small-experiments/
    label: "Fourteen small experiments, and why small first"
  - url: https://daxfoundation.org/writing/what-a-declared-constraint-is/
    label: "What a declared constraint is"
  - url: https://daxfoundation.org/metadax/showcases/
    label: "The library"
  - url: https://www.obsidiandelta.com/opportunities/
    label: "Obsidian Delta: opportunities"
  - url: https://www.obsidiandelta.com/blog/a-tutoring-practice-with-a-kit-for-every-hard-topic/
    label: "A tutoring practice with a kit for every hard topic"
---

Every business built on teaching does the same work before it reaches a single learner: sequencing a course, writing the practice, building something a person can open, checking that it holds together. If what you have is expertise in a subject, a community or a trade, that work stands between what you know and something people can use. At Obsidian Delta we treat the open Meta DAX infrastructure as an incubator's floor. The recipe, the factory, the player, the scene library, the checker and the publishing system already exist, and they are free. What is scarce is the thing you carry.

## The floor, piece by piece

Start with [the library](https://daxfoundation.org/metadax/showcases/), because it is what everything else produced. It holds a Grade 6 science year made from one brief, a staff onboarding module made from a one-page brief, French fractions in a 3D stadium, and a Jaffna curry in a 3D kitchen in Tamil and English. Each card opens, several also play in the browser, and the library filters by who it is for and by language. Behind those cards sit the pieces.

The recipe is a folder of prompts and three skills in the open [metadax repository](https://github.com/daxfoundation/metadax). You run them in the AI you already have, and they let you skip designing a prompt suite. The factory is two of those prompts: one turns a brief for a whole program into a tree of courses, lessons, modules and objectives, and the other works through that tree in order, within a budget, gated by review, able to resume after a crash. It lets you skip the sequencing and the bookkeeping.

The [player](https://daxfoundation.org/metadax/play/) runs a package in the browser: paste it in, press Play, and nothing is saved or sent anywhere. A print page puts the same package on paper, with a guide's key on the last page. The scene library is the library in practice: Words into Algebra has five interactive 3D scenes and Systèmes de fichiers imbriqués has six. Together they let you skip building and hosting a learner's side. The checker is the validation the player runs, as a small Node tool with no dependencies, and it lets you skip reading a package line by line for faults.

The publishing system is a practice more than a product. [The public record](https://github.com/ObsidianDelta/published) keeps every post and page as a git history anyone can read, and Meta DAX dates every result. It lets you skip inventing a way to show your work's history. The desk is different. It is the customer-management and content system Obsidian Delta runs its own work on, where partners can run an initiative of their own, and it lives with us rather than in the open repository. [Part five](https://www.obsidiandelta.com/blog/run-an-initiative-on-the-desk/) takes it up.

## What the record shows

Free has a precise meaning here. The repository's [LICENSES.md](https://github.com/daxfoundation/metadax/blob/main/LICENSES.md) puts prompts, schemas and eval fixtures under CC0 1.0, puts tools, templates, skills and adapters under Apache-2.0, and leaves the licence of generated course content to its author, with CC BY 4.0 as the default. Of CC0, [Creative Commons says](https://creativecommons.org/publicdomain/zero/1.0/): "You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission." The [Apache-2.0 text](https://www.apache.org/licenses/LICENSE-2.0) grants a "perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license".

Does it work? The [fourteen small experiments](https://daxfoundation.org/writing/fourteen-small-experiments/) were designed first, and two have run in first cut, both automated: a model played the guide, and in the learner run a simulated adult played the learner. Those runs produced an introductory Newton's laws course of three lessons, seven modules and twenty-one objectives, every page validated, and the [research page](https://daxfoundation.org/metadax/research/) is plain that "None of it is a pilot with a person." On 10 October two more ran. Fetching only the matching piece of a library, not a whole course, held the pass rate at every library size and used roughly 75 times fewer context tokens per turn at the largest, on six graded questions, with the larger libraries simulated and token counts estimated. The other result was a negative: across 32 cases a small model passed every case the large one did, so escalating bought nothing. Both are in the [findings](https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261010.md). The tutor and teacher skills still say "draft, untested" in their own files.

The ground under all of it is the Constraint Protocol, a public working draft (v0.5) that has been run in full once, on 4 May 2026. Meta DAX is meant to run on it; its protocol fields are reserved and empty today. [What a declared constraint is](https://daxfoundation.org/writing/what-a-declared-constraint-is/) sets out what that means.

## What it means for you

Pick one piece and open it this week: the library to see the output, the repository to read the prompts, the player to watch a package run. Then write down the one thing you know that it does not: the misconception every learner in your subject arrives with, the step in your trade nobody writes down, the word your community uses for a dish. The stack takes the preparing off you, which we call reclaimed cognition, so your attention goes to what only you can do. That line is where a business starts, and [our opportunities page](https://www.obsidiandelta.com/opportunities/) lists three doors in from there: packages built for you, French editions of your material, and building with us.

This is the first of five parts on building on open infrastructure. Next, [A tutoring practice with a kit for every hard topic](https://www.obsidiandelta.com/blog/a-tutoring-practice-with-a-kit-for-every-hard-topic/) takes one piece, the kit, and shows what a tutor sells when the preparing is done. The experiments behind the stack are written up in [fourteen small experiments](https://daxfoundation.org/writing/fourteen-small-experiments/), the ground it stands on in [what a declared constraint is](https://daxfoundation.org/writing/what-a-declared-constraint-is/), and [the library](https://daxfoundation.org/metadax/showcases/) holds what they produced.

What do you know that no recipe does? [Message Jason on LinkedIn](https://www.linkedin.com/in/jasonjeyanandan) with your answer.

## Sources

- Creative Commons, "CC0 1.0 Universal Deed": https://creativecommons.org/publicdomain/zero/1.0/
- The Apache Software Foundation, "Apache License, Version 2.0, January 2004", section 2 (Grant of Copyright License): https://www.apache.org/licenses/LICENSE-2.0
- Meta DAX repository, LICENSES.md (internal): https://github.com/daxfoundation/metadax/blob/main/LICENSES.md
- Meta DAX, "The research" (internal): https://daxfoundation.org/metadax/research/
- Meta DAX, "Findings, 10 October 2026" (internal): https://github.com/daxfoundation/metadax/blob/main/experiments/FINDINGS-20261010.md
