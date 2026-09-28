---
title: "Meta DAX"
subtitle: "An Introduction"
date: 2026-09-28
updated: 2026-09-28
description: "The first was the mechanism, the second was the threat, the third was the person. This one is the point: what Meta DAX means to me, what it has the nerve to attempt, and why it compounds."
draft: false
---

*The first was [the mechanism](/blog/snowflake-fuckari-in-action/). The second was [the threat](/blog/the-constraint/). The third was [the person](/blog/fuckarian/). This one is the point.*

---

## The kid it did not exist for

If you read [The Fuckarian](/blog/fuckarian/), you have met him.

He is standing in [a pomegranate field](/blog/fuckarian/#who-the-responsibility-is-owed-to) holding the broken control panel of a fallen billboard, looking at a circuit board for the first time, realising there is a hidden world under the visible one. Asked what he wants to be when he grows up, he says breakdancer. Then he thinks about it and says *inventor*.

A few years later he is at school in England, praying every night to be made smarter.

He did not need to be smarter. **The problem was never the content. It was [the channel, and the channel ran both ways](/blog/fuckarian/#the-channel-ran-both-ways).** What was sent did not land in him, and what he had did not come out in a shape anybody could receive. Fifteen years of that, with three exceptions. The best of them was Grade 12 physics: tables turned to face each other, a teacher who was genuinely excited, and the whole room deriving E = mc² by hand. **Curiosity instead of compliance.** That room was magic, and it is the only proof I have ever needed that the fault was never in the kid.

---

## What Meta DAX means to me

Let me draw one line, carefully, because everything I care about sits on one side of it.

**Education** is the institution: the schools, the curricula, the teachers, the exams, the extraordinary machine that takes a whole population and gives it a floor to stand on. I am for it. Fully, and without a footnote. It did an enormous amount of good, including for me. And at the scale it works at, it has no choice but to standardise: one pace, one sequence, one channel, one way of showing you have understood.

**Learning** is the thing underneath. It does not standardise. It happens at the pace of the person doing it, in the shape that person can take in, in whatever order their curiosity happens to run. Mine ran sideways. A great many people's do.

I am for learning with everything I have. And the thing I want most is the thing no school on earth has ever been able to afford: **to invert the ratio.** Not thirty students to one teacher. **Thirty teachers, coaches and mentors to every one learner** — one who knows how you think, one who knows what you already know, one who knows what you are about to get wrong, one who notices when you are lost and knows the way home. That is absurd to ask of any institution. It is not absurd to ask of a system.

That is what Meta DAX means to me. It is the [DAX Foundation's](https://daxfoundation.org/#learning) universal learning initiative, and it is [my purpose](/blog/fuckarian/#my-purpose). It is that Grade 12 room for everyone, on any subject, for as long as they want to keep learning. **It is the thing I needed at nine, and at eleven, and at nineteen, and did not have.**

---

## Now it is public

Here is the part I want to say loudly, because some days I forget how large it is.

**Universal learning.** Every human being. Any subject. Free, forever. That is the initiative, that is everything it entails, and as of today the work to get there is in the open, at **[github.com/daxfoundation/metadax](https://github.com/daxfoundation/metadax)**.

**This is what we had in 2024.** A working prototype — EdDAX, education DAX — and here I am, at the keyboard, building a cell-biology course with it and then asking it the questions that came after:

<iframe width="560" height="315" src="https://www.youtube.com/embed/kCtn0B7-OG0?si=RnbAevu5hjtlpIbj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

It takes a subject, breaks it into chapters, lessons and parts, writes each one against instructions aimed at a particular student, builds interactive tests from the material it has just produced, scores them against Bloom's taxonomy rather than recall, and lets the student keep asking past the end of the lesson. [Here it is again](https://youtu.be/pMVwtGqUSh4), in two and a half minutes, building a fractions course for an eleven-year-old and running every example through baseball, because baseball is what that particular kid cared about. **The fractions are the same for everybody. The baseball is not.**

**This is what we are running now to achieve it.** [Fourteen experiments](https://github.com/daxfoundation/metadax/tree/main/experiments) — the first fourteen of countless more to come — each with a question, a method, and the result that would tell us to stop. The first ones are done, and here is the record: **[Newton's laws, taught and taken](https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31)**.

What you are looking at in that report is this:

- **A course from one line, in minutes, not months.** *Newton's laws of motion: an introductory course for an adult learner who wants to understand the three laws properly, with everyday examples and a little algebra, no calculus.* Out came 3 lessons, 7 modules, 21 objectives, the concepts and what each depends on, the target level for each, and the mistakes people are likely to make, written down before a single page existed. **Anyone who knows a subject can do this** — a teacher, a coach, a parent, a nurse training the next nurse.
- **A course shaped to the learner.** The same first law of motion, and for a learner who bakes and cycles to work it arrives as a tray of loaves sliding off the back seat of a braking van. The physics is the same for everybody. The loaves are not. Nobody had to clone the course to get there.
- **A learner who talks back.** Six follow-up questions, four levels deep, from a coasting spacecraft to the Voyager probes to whether the first law is ever truly seen. Every answer knew the whole path above it. And when the learner typed *"hang on, I'm lost"*, the system took them back to where the branch began and told them, in one line, that **everything they had just done was the thing they were trying to learn.**
- **A quiz that teaches.** It caught *inertia is a force* in the learner's first written answer, named it, and walked the learner out of it with two hints, without ever handing over the answer.
- **A record that belongs to the learner.** A private repository, a pseudonym, and a profile that stores what helps and is forbidden from storing a label.

One thing, plainly, because I would rather you heard it from me: the learner in that run was simulated, and a model played the teacher too. So what is proven is that **the machine works, end to end, and checks itself.** Whether people learn from it is the next experiment, not this one. Every gap has a card in the repository with its name on it, and the results will land there whichever way they go. **That is the difference between a pitch and a repository.**

---

## It compounds

Here is the part that, even having built it, still makes me sit back.

Everything in Meta DAX is a file in a repository. And a repository can be opened.

**A teacher's course, once they choose to publish it, is open for good.** Not rented, not behind a login. Out. Any other teacher, anywhere, can take it, teach from it, fork it and make it better, and the original stays exactly where it was for anyone who preferred it. The interactive pieces that go with it — a lab where you push a puck across ice and watch it never stop — are meant to travel with it. **One teacher's afternoon becomes every teacher's starting point.**

**A learner's questions can become the course.** When a learner chooses to share what they asked, a good question, reviewed by the teacher, is folded into the course for every learner who comes after. The fifth question stops being a dead end in one person's evening and becomes a page in the book.

**And what one learner gets wrong can spare the next one.** A course that sees where people keep stumbling can be re-taught at exactly that spot, by exactly the teacher who wrote it. Nobody's record leaves their hands unless they choose to share it. But the lesson learned from a stumble can. **Nobody has to be the first to fall into the same hole twice.**

This is not a library. Libraries hold still. **This is learning infrastructure that compounds**: every course published, every question shared, every stumble a teacher fixes, makes the next person's path shorter. For free. For good. For everyone.

That is the wild part. Not that one person can learn anything. That **all of us are, for the first time, learning on the same open ground** — and the ground gets better every time somebody walks on it.

---

## It has the nerve to try

Every piece of this is held to one sentence, and I want to be upfront that the sentence is absurd:

> **Take a person who can communicate, and get them to the equivalent of a master's degree from a North American university — on five minutes of connectivity a day.**

That is not a roadmap, and I am not claiming it is achievable. It is a deliberately ridiculous benchmark, held on purpose, because holding it throws out every design that quietly assumes bandwidth, or money, or a teacher in the room. **If it works at the edge, it works everywhere.**

Most things are aimed at a market. **This is aimed at every human being on the planet**, including the ones no market has ever bothered to reach. It has the nerve to try, and I would rather be publicly, measurably short of that than comfortably on target for something smaller.

Obviously there is a great deal more to say — where it came from, what is inside the first run, and what has and has not been proven — and it is coming, in detail, [in a form you can argue with](/blog/fuckarian/#pegs-not-stairs). That is what is next.

---

## What I am fighting for

When I left university for the last time, I found my purpose. Everything that had happened to me came down to one thing: **the right information had never reached me at the right time.** So I decided that was what I was for. *The right information, to the right person, at the right time.* I did not have words for what had happened to me. I had that instead.

You can see why, the moment RSS appeared, I went straight for it. I spent my twenties building a platform to gather information and put it in front of the people who needed it. It was called Red October, and it was the first draft of this. It has taken the rest of my life to notice that the information that matters most is the kind that makes you able to go and get all the rest.

At the end of The Fuckarian I told you [what I am fighting for](/blog/fuckarian/#who-the-responsibility-is-owed-to). Love and creativity. The kid in the pomegranate field. The people who spent their patience on me. And every kid sitting in a classroom while nothing goes in.

This is what that fight looks like when it is built.

I was the kid it did not exist for. **I would like to be the last one.**

---

## Everything this post rests on

- [The repository](https://github.com/daxfoundation/metadax) · [the experiments](https://github.com/daxfoundation/metadax/tree/main/experiments) · [the run report](https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31)
- [The 2024 prototype, the long version](https://youtu.be/kCtn0B7-OG0) — fifteen minutes, building a cell-biology course and asking what came after. [The short version](https://youtu.be/pMVwtGqUSh4) — fractions for an eleven-year-old, through baseball.
- [Meta DAX at the Foundation](https://daxfoundation.org/#learning) · [Cognitive companion](https://daxfoundation.org/#cognitive-companion)
- [The Snowflake](/blog/snowflake-fuckari-in-action/) · [The Constraint](/blog/the-constraint/) · [The Fuckarian](/blog/fuckarian/)
- [LinkedIn](https://www.linkedin.com/in/jasonjeyanandan) — the working history behind all of it, Red October included.
