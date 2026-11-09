---
title: "From the Suite to the Substrate"
subtitle: "How a company that built telephones for taxi fleets ended up building cognitive infrastructure — and why it is giving the work away"
description: "Obsidian Delta started by selling enterprise telephony to taxi fleets in 2015. It is now the cognition provider behind a personal AI agent, an open learning platform, and an accountability protocol. This is the honest shape of how one became the other, and the decision to hand it all over."
date: 2026-11-09
draft: false
---

Here is a decision, in the plainest words we can give it:

> As the managing director of Obsidian Delta, I am in the process of donating all of our intellectual property to the DAX Foundation, and making all the work done under it open source and public. The research should be shared. Research done over decades — and intensively over the last five years — **here in Bathurst, New Brunswick**.

That is the whole of it. The rest of this piece is how a company got to a place where that sentence makes sense — a company that, for most of its life, built telephones for taxis.

## It started with telephones

Delta Suite 1.0 shipped on 1 September 2015. It was enterprise telephony for the taxi industry: integrated directly with Mobile Knowledge dispatch software, serving fleets across North America. A driver requested a call-out and the suite handled the rest — thousands of simultaneous calls, distributed data centers, a fault-tolerant architecture someone had to keep running at three in the morning.

It was a product family, not one program. **Delta Bot** dispatched more than 30% of call volume on its own. **Delta Cloud** ran the enterprise cloud call center; **Delta Local** was the on-premises version; **Delta Rescue** was the backup for when any of it failed. One fleet we can name is Blue and White, in Mississauga — around 300 vehicles. The [full timeline is on the home page](/#work).

None of this looks like cognitive infrastructure. That is the point. It was telephony, sold to an industry that runs on thin margins and does not forgive downtime. The discipline came from there.

## Then it learned to talk

Delta Suite 2.0 shipped on 4 February 2022. It was a voice-automation suite that reduced the need for live call takers by up to 60%, integrated with any dispatch backend, with the unified communications layer running on 3CX. It was, as the [site still says](/#work), **forged in coordination with Microsoft Research** — the piece of the story where the work first touched conversation-learning technology rather than plain call routing.

That is the last taxi product. And it shipped *after* the turn had already begun.

## Then it stopped being about taxis

On 31 August 2021 — months before Delta Suite 2.0 went out the door — we started building something that had nothing to do with fleets. It was a personal AI agent, and we described it that day as *"a guardian angel to protect you against malicious AI."* We [published a video the same day](https://www.youtube.com/watch?v=Q1gCzxg5WMc) setting out what it would make possible and what it would cost.

The date matters. GPT-3 was in limited beta. ChatGPT did not exist and would not for more than a year. The idea that the thing you most needed protecting from was *other people's AI* was not a common concern in August 2021. It was years early. The agent was called DAX.

It was not built as a product to sell. It was built as equipment — the tool one person needed to do the next piece of work, then rebuilt because the next piece needed more. That is a quieter origin than a launch, and a more honest one.

## The graveyard

What followed DAX was not a clean line to a finished thing. It was a long run of attempts, most of them abandoned.

There was a platform built in C# that we iterated on for more than two years before setting it aside. There were cloud and tooling experiments through 2025 — retrieval setups, workflow automation, framework spikes — that went a few commits deep and stopped. There was mobile-audio work: getting a microphone to behave inside a web view, because the dispatch product ran on phones and that was a real requirement, not a toy. There were static exports, staging environments, user-service stubs that were never built out. Earlier still, the conversation-learning work of 2019 that fed Delta Suite 2.0.

We are not hiding any of that. A long list of dead ends is not an embarrassment; it is the evidence that there was a practice — that someone kept building, kept throwing away what did not hold, and kept the few things that did. The back catalogue, including the parts that failed, is being opened as part of this. The [publication record is already public](https://github.com/ObsidianDelta/published), kept as an append-only history anyone can read.

## What it turned into

Out of that run, a few things survived and became the actual work. None of them are about taxis.

**Meta DAX** is open infrastructure for learning — a set of recipes that help any guide build a course for any learner, on their own AI subscription. It has been [donated to the DAX Foundation](https://daxfoundation.org/metadax/) and the [code is public](https://github.com/daxfoundation/metadax). The stated aim is universal learning; the honest version is that today it is version zero — small experiments, many of them simulated. It is a way, never the way.

**Delta Signal** is a sound engine: it writes sound in code, hides a short message inside it, and reads it back. It has [also been donated to the Foundation](/#opening-up), with its revenue meant to support the Foundation's work. It is offline for now.

**The Constraint Protocol** is the accountability layer — a formal way for two parties to declare what they are bound by, sign what they do, and keep an append-only record with the judge and the witness held apart. It is published as a [public working draft](https://daxfoundation.org/constraint-protocol/), with the [specification open](https://github.com/daxfoundation/constraint-protocol) for anyone to read. We will not overstate what it has done: the Constraint Protocol has run in full once, on 4 May 2026, across three instances on separate machines, all of them Jason's. No second organisation took part.

**Re UI** is the interface layer that sits over this work — the part a person actually touches. It is the newest and the least finished.

## What Obsidian Delta is now

Obsidian Delta is a company. It builds things, it pays for the early compute, and it hands over what it builds. In the terms we use everywhere else, it is the **cognition provider** — the engine underneath, not the thing you point at. The cognition is provided by Obsidian Delta. That is as specific as we are going to be about it, on purpose.

The place the work goes when it should belong to everyone is the DAX Foundation. On 4 November 2026 the Foundation filed its articles. The certificate is on its way.

So the sentence at the top is not a flourish. It is a description of something already partly done: Meta DAX and Delta Signal have been donated. The rest is in progress — the honest word, because most of it has not yet been transferred, and we are not going to say "given away" about anything still sitting on our side of the line.

A company that built telephones for taxi fleets ended up building cognitive infrastructure the same way it built everything else: one piece at a time, keeping what held, in a small city a long way from where any of this is supposed to happen.

## What is not here

We would rather you notice the gaps than have us paper over them.

- **The Foundation's paperwork is in transit.** It filed articles on 4 November 2026 and the certificate is on its way. Until it lands, we are not reaching for the words people usually attach to a thing like this, because it is not yet those words.
- **Most of the intellectual property has not been transferred.** Meta DAX and Delta Signal are donated. Everything else is in the process of being donated. "In the process" is doing real work in that sentence.
- **The Constraint Protocol has run in full exactly once.** Three instances, three machines, all Jason's. No outside party has yet taken part, and we will say so until one does.
- **We do not name who builds the cognition underneath.** The public line is that it is provided by Obsidian Delta, and that is the whole line.
- **The old products are receipts, not claims.** Delta Suite 1.0 and 2.0 are real and dated; the figures on them are the ones that were published at the time, and we have not re-measured them for this piece.
- **Nothing here depends on believing us.** The published history, the protocol spec, the learning platform, and the Foundation's own site are all open. If a claim in this post is not backed by one of those, treat it as a claim and nothing more.
