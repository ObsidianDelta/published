---
title: "How a showcase is made"
description: "Brief, package, scenes, reader: the method behind the curry, the Stade and Words into Algebra, and what the honesty costs."
date: 2026-10-18
draft: false
series: results
part: 4
series_total: 5
related:
  - url: https://daxfoundation.org/writing/the-stranger-test/
    label: "The stranger test"
  - url: https://daxfoundation.org/writing/how-this-is-paid-for-and-what-we-will-measure/
    label: "How this is paid for, and what we will measure"
  - url: https://daxfoundation.org/writing/where-your-child-is-stuck-is-the-whole-brief/
    label: "Where your child is stuck is the whole brief"
  - url: https://www.obsidiandelta.com/blog/french-editions-a-business-in-a-gap/
    label: "French editions: a business in a gap"
  - url: https://daxfoundation.org/metadax/showcases/tamil-chicken-curry/
    label: "One dish, its story (the curry)"
  - url: https://daxfoundation.org/metadax/samples/stade-des-fractions/
    label: "Le Stade des Fractions"
  - url: https://daxfoundation.org/metadax/showcases/words-into-algebra/
    label: "Words into Algebra"
---

A showcase here starts as a brief, sometimes only eight lines. A model drafts a package from it, a checker anyone can run refuses a malformed one, the 3D comes from a shared library where it has the piece, and a person reads the result before it is called ready. Every showcase is labelled as model-generated. This is the chain, including the links that are still thin.

## Three pages, opened

Open [the curry showcase](https://daxfoundation.org/metadax/showcases/tamil-chicken-curry/). Under its three stations it prints "The brief, verbatim — eight lines": the dish ("my mother's chicken curry, Jaffna style"), a ten-year-old who speaks Tamil at home but cannot read it, her mother as guide, the language, the length, and what to make. Line seven reads "Someone from the community reads it before it goes out." The reader is part of the brief. What came out, the page says, was "an outline, the lessons, the misconceptions, the game, the package, the checker, this page."

Add `?review=1` to the address and the seams show: on the first station, in English, 35 marks reading [READER], on Tamil words, claims about the diaspora and whole sections of copy. The page's source says "All Tamil is [READER] — drafted from the brief, not yet signed off" ([dish.js](https://daxfoundation.org/metadax/showcases/tamil-chicken-curry/dish.js)), and five lines of the recipe card read "Jason is asking her." The footer says "Read by Jason Jeyanandan", and [the commit that first put the page live](https://github.com/ObsidianDelta/published/commit/3d45cf556f269eb28dc171405e98d64f15dd3e1d) records "Reader of record: Jason." So one person, whose family's dish it is, has read it, and the Tamil is still marked unsigned.

[Le Stade des Fractions](https://daxfoundation.org/metadax/samples/stade-des-fractions/) is French: a stadium you turn with a finger, seven steps from what a fraction is to a Grand Match. Its guide page says "Une erreur est une information, pas un échec", and after two tries the answer and its explanation appear. It has its own 3D engine, which matters below.

[Words into Algebra](https://daxfoundation.org/metadax/showcases/words-into-algebra/) names its parts in "How the pieces fit": player, scene library, package, Edition, showcase. It began as an interview with one tutor, who named the hardest topic, turning a sentence into an equation. The kit's "say it back" pause, the page says, "was the tutor's own idea". Nova's Edition keeps the five equations, six named slips and the pause, and changes every sentence, the skin and the tutor's page. [Systèmes de fichiers imbriqués](https://daxfoundation.org/metadax/showcases/stockage-imbrique/) began the same way, with one networking teacher.

## The chain, and where a person sits

**Brief to package.** The recipe is one plain-text [prompt](https://github.com/daxfoundation/metadax/blob/main/skills/metadax-homeschool/prompt.md) of about five thousand words, and the same steps as a [skill](https://github.com/daxfoundation/metadax/blob/main/skills/metadax-homeschool/SKILL.md). It asks a dozen or so questions, then builds one file: a guide's page and a learner's page. The [checker](https://daxfoundation.org/metadax/play/package-check.js) is the code the player runs. It stops a package with no game on the learner's side, no block for what only a person can do, a vendor's name or text under 4.5:1 contrast, and warns when the right answer is the longest choice or always first. The skill says plainly that "the checker cannot see all of" its quality rules, so it tells the model to hold them. Whatever neither catches is left to the person who reads it.

**Package to scenes.** The library behind [the player](https://daxfoundation.org/metadax/play/) holds nine scenes and eight themes ([source](https://daxfoundation.org/metadax/play/scenes/scenes.js)). A theme, its code says, "NEVER changes the mechanics or the answer", which is why Nova's Edition keeps the same five equations in a different world. The library had three scenes at the end of [9 October](https://github.com/ObsidianDelta/published/commit/c2eed7736ad28e5ac3b400a7a731d09617d76758) and nine by [15 October](https://github.com/ObsidianDelta/published/commit/c15ce632f2156b2dce31b1f06a5055a5aa65fb7d). The Stade and the curry carry their own 3D: the library's track scene was written to echo the Stade "without importing its engine." The recipe is shared up to the package, the 3D only where the library has the piece.

**Reader.** The repository's rule for AI-assisted contributions is "A human must have read and tried it", including "a translation read by someone who speaks the language" ([CONTRIBUTING](https://github.com/daxfoundation/metadax/blob/main/CONTRIBUTING.md)). That is the standard we mean our pages to meet. The curry names its reader. The French module's page names its checker and the French interface its terms follow, and no French-speaking reader.

## What the honesty costs, and what it buys

The [samples page](https://daxfoundation.org/metadax/samples/) says of every showcase "Model-generated; reviewed for safety, not certified." We give up the weight of a credential and show open edges: five questions still put to the cook, a Tamil layer marked unsigned, a French page without a named reader. A reader's attention is the one step we cannot speed up.

In return the brief is on the page, so you can compare ask and result. A reader catches what a model cannot know: the curry card's family half comes from a call with Jason's mother and says "The one thing we do that no recipe says: no water", and the method drafted before the call did not, as [Thirty to One](https://jeyanandan.com/blog/thirty-to-one/) tells it. And what a stranger finds can be fixed in public, as [the stranger test](https://daxfoundation.org/writing/the-stranger-test/) shows.

## What it means for you

Write eight lines in the curry's order: what the thing is and whose; the learner's age, what they love, where they get lost; who guides; what to teach through it; the language; how long; who reads it; what to make. A parent needs five, as in [Where your child is stuck is the whole brief](https://daxfoundation.org/writing/where-your-child-is-stuck-is-the-whole-brief/). Run them through [the any-AI guide](https://daxfoundation.org/metadax/guide/any-ai/) with the AI you already have, or send them to us: the curry's page asks for three lines and offers to build the first ten scenarios people send, in the open. None has arrived yet.

Before this, [The stranger test](https://daxfoundation.org/writing/the-stranger-test/) covers what broke when stand-ins followed the public page. Next, [How this is paid for, and what we will measure](https://daxfoundation.org/writing/how-this-is-paid-for-and-what-we-will-measure/), covers compute, support and the measurement still to come. For a French edition of a teacher's own material, read [French editions, a business in a gap](https://www.obsidiandelta.com/blog/french-editions-a-business-in-a-gap/).

What would your eight lines say?

## Sources

- Our own public pages and records, all read on 18 October 2026; no external figures are used. The showcases: https://daxfoundation.org/metadax/showcases/tamil-chicken-curry/ (and its source, https://daxfoundation.org/metadax/showcases/tamil-chicken-curry/dish.js), https://daxfoundation.org/metadax/samples/stade-des-fractions/, https://daxfoundation.org/metadax/showcases/words-into-algebra/, https://daxfoundation.org/metadax/showcases/stockage-imbrique/ and https://daxfoundation.org/metadax/samples/.
- The recipe: https://github.com/daxfoundation/metadax/blob/main/skills/metadax-homeschool/prompt.md , https://github.com/daxfoundation/metadax/blob/main/skills/metadax-homeschool/SKILL.md , https://github.com/daxfoundation/metadax/blob/main/CONTRIBUTING.md , the checker https://daxfoundation.org/metadax/play/package-check.js and the scene library https://daxfoundation.org/metadax/play/scenes/scenes.js .
- Public commits: the curry's first live version, 11 October 2026, 15:55 UTC, https://github.com/ObsidianDelta/published/commit/3d45cf556f269eb28dc171405e98d64f15dd3e1d ; the running scene, 9 October 2026, 22:51 UTC, https://github.com/ObsidianDelta/published/commit/c2eed7736ad28e5ac3b400a7a731d09617d76758 ; the storage scenes, 15 October 2026, 16:54 UTC, https://github.com/ObsidianDelta/published/commit/c15ce632f2156b2dce31b1f06a5055a5aa65fb7d .
- Thirty to One, for the method drafted before the call: https://jeyanandan.com/blog/thirty-to-one/
