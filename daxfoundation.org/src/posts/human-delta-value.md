---
title: "Human delta value: the measure"
date: 2026-10-01
description: "The definition with its consequences: two halves, the unit claim as a hypothesis with a kill line, reclaimed cognition as the operational form, the failure modes, and what it asks of operators."
draft: false
---

*The first piece of writing on this site. The personal account of where it came from is on [jeyanandan.com](https://jeyanandan.com/blog/human-delta-value/). The definition itself is on the [definitions page](/definitions/#human-delta-value), which is normative; this piece is the reasoning around it.*

Human delta value is the measure under every experiment in [Meta DAX](https://github.com/daxfoundation/metadax), and it is meant to be the measure under every process, implementation, automation and optimisation a person takes part in, anywhere. This piece says why it has the shape it has, what counts as measuring it, how it fails, and what it asks of anyone who builds or runs a system that people work with.

## The definition

> What a human being brings: the part of an outcome that exists because that person was involved. It has two halves, and both count. The first is what only a human being can currently do; that boundary moves, and the definition moves with it. The second is what the person and their cognitive companion reach together that neither would reach alone; that half grows as the companion grows, provided the person brings their best, and it is the durable one.
>
> It is foundational, and it is how the DAX constraint reaches the individual: humanity is named in the constraint, and every human being is part of it. It MUST be kept in view and measured continuously, in every process, implementation, automation and optimisation a person takes part in, and never by time. When a system takes cognitive labour off a person, what matters is what the person then spends their attention on; they report it in their own words, and it is recorded as expressed. We call that reclaimed cognition. A system that cannot say what the human brought has stopped extending people and started replacing them. And the unit is only as strong as the human's best in the moment: however capable the companion becomes, a person who cannot bring their best gets less from it, not more.

Revised 1 October 2026; the earlier wordings are kept on the definitions page under [Changes](/definitions/#changes).

## Why two halves

The first half, what only a human being can currently do, is the one everybody reaches for, and on its own it is a trap. The boundary moves. Every capability that crosses it shrinks the half, and a definition anchored there alone retreats forever: the human is whatever is left over. That is the god-of-the-gaps shape, and we refuse it. The word *currently* is in the definition so that the half is honest about moving, and so that nobody can use it as a fence to keep a person inside.

The second half is the one that holds. A person and their [cognitive companion](/definitions/#cognitive-companion) are one unit, and what that unit reaches that neither would reach alone is the person's. It is theirs because the companion is part of them, not a second party; it has no interests of its own, and its direction is the person's. This half grows as the companion grows, which is the opposite of the first half, and that is why it is the durable one. It also answers the question the first half cannot: what is a person for, once the system can do most of what they used to do? For bringing their best to a unit that turns it into more.

## The unit claim is a hypothesis

The last sentence of the definition is a claim, and we hold it as a hypothesis with a kill line rather than as a comfort.

The claim: the unit is only as strong as the human's best in the moment. A companion amplifies what the person brings; it does not fill the gap when they bring less. So as companions improve, the value of a person's best rises, and so does the cost of their absence.

The kill line: in matched sessions on the same task, if people who bring less to the unit get as much from it as people who bring their best, the claim is false, and the definition loses its last sentence. That is a measurable statement, and Meta DAX is where we intend to measure it, in the open, with the result published either way.

## Reclaimed cognition, operationally

The definition says the measure is never time. This is the part most likely to be ignored, so here is the reasoning in full.

When a system takes cognitive labour off a person, the obvious number is the hours saved. It is also worthless, because it says nothing about what happened next, and what happened next is the only thing that distinguishes extending a person from replacing them. Two teachers can each have an hour given back. One spends it noticing that a learner has gone quiet and deciding what to do; the other spends it on nothing, because the system did not leave them anything to spend it on. The hours are identical. The human delta value is not.

So the measure is the person's own account. At the end of a session, or a day, or whatever unit the work has, the person says in their own words what was taken off them and what they then spent their attention on. It is recorded as expressed. It is never inferred from logs, never reconstructed by a model from what it saw the person do, and never reduced to minutes. This is the Constraint Protocol's rule for what a person says, its [sacred boundary of expression](https://github.com/daxfoundation/constraint-protocol), applied to the measure: the account belongs to the person who gave it, and the system does not get to improve on it.

What the account is about is what [intelligence](/definitions/#intelligence), in our narrow sense of navigating a constrained possibility space, is not. Noticing. Reading a room. Knowing that one person needs pushing and another needs leaving alone. Bringing out the best in someone. Deciding what to teach that nobody has taught. Those are where reclaimed cognition goes when it goes anywhere, and the point of taking the labour off a person is to make them possible.

In Meta DAX, concretely, this has to exist before any experiment with a person runs: a place in the session record for the person's account, written by the client as the person gave it, and a line in every result file that reports it. It is design, not production. The first runs had a model in both chairs, so there was nobody to ask.

## Inverting the ratio

The place human delta value is being built into first is teaching, because that is where the stakes are plainest.

Today the ratio is one teacher to thirty learners, or three hundred, and the teacher's attention is the scarcest thing in the building. Meta DAX inverts it. Behind each learner sits the whole record: every move a tutor ever made that worked, captured as a technique and offered as one way among many; every misconception mapped; every dead end anyone found first. A learner gets more teaching than any teacher could give. The teacher's plan arrives defaulted, the rubric comes from a catalogue that grows with every teacher who publishes one, and their judgement becomes micro-adjustment to what is already there.

That inversion is the deliberate act, and the second half of it is the one that matters here: the teacher gets their cognition back, on purpose, so that they can put it on the problems they could previously only dream about. The learner who was going to be lost. The subject nobody has taught yet. The move that works for one person and then, through the record, for everyone after them. Human delta value is not a number we take once at the end of an experiment. It is the thread through every one of them, and it is close to the point.

## How it fails

The measure fails in predictable ways, and each one is a signal rather than a nuisance.

**Relief that is replacement.** The system takes the labour and the person's account comes back empty: nothing was spent on anything, because nothing was left to spend it on. That is the clearest reading the measure can give, and it means the system has crossed from extending to replacing. It is the case the definition's penultimate sentence is for.

**The first half as a ceiling.** "What only a human can do" used as the limit of what the person is permitted to do, rather than as the current edge of what the system cannot. The word *currently* is there to stop this, and a system that enforces the first half as a boundary has misread the definition.

**Time.** Any report of human delta value in hours or minutes is not a report of human delta value.

**Inference.** A system that fills in the person's account from what it observed, or asks a model to summarise what the person must have been attending to, has broken the boundary of expression and the measurement is void.

**Comfort.** Reading the unit claim as reassurance, that the companion will carry whoever is attached to it. It will not. The claim is a demand, and the record will show what each person brought.

**Misattribution.** Crediting the second half to the companion. It belongs to the person; the companion is part of them, and a system that reports "the AI did it" has made a category error the [substrate](/definitions/#ai-as-substrate) definition already names.

## What it asks of operators

An [operator](/definitions/#operator), anyone who builds or runs a cognitive companion or a delegate for a principal, answers for how it is built and run. Human delta value adds one requirement to that: the system MUST be able to say what the human brought. Not approximately, and not from its own inference, but as the person expressed it. If it cannot, the operator has built something that has stopped extending people, whatever the marketing says, and the measure is what shows it.

Where the account lives matters too. A record that can be quietly edited is not a record. The Constraint Protocol is intended to be where this kind of account is kept, signed, witnessed and disputable, and whether knowledge and intelligence compound when nothing can be erased is itself one of the experiments. The protocol has run in full once; that is as far as the claim goes today.

## Everybody steps up

The DAX constraint is preservation and expansion of life, humanity, and consciousness. Humanity is named in it, and every human being is part of it. Human delta value is how that word reaches one person at a time. It keeps the person in view, continuously, in every process they are part of, and it keeps the question honest: is this system expanding what this person can do, or replacing them?

The answer the definition is reaching for is the first one, and it comes with a cost that we want stated plainly. The unit is only as strong as the human's best. The better the companion, the more that best is worth, and the more visibly it is missing when it is not there. Everybody needs to step up. The tools are being built so that they can.

---

*Versioned, in public: the [History](https://github.com/ObsidianDelta/published/commits/main/daxfoundation.org/src/posts/human-delta-value.md) of this piece. First published 1 October 2026.*
