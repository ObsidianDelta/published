---
title: "The phones never stopped"
subtitle: "Delta Suite 1.0, and a decade of keeping a dispatch line up"
description: "The first product shipped on 1 September 2015: an enterprise telephony platform for taxi dispatch. Its architecture let call takers and dispatchers work from anywhere, years before a pandemic made that ordinary. This is what that meant, and one fact about the cost of keeping a line up."
date: 2026-11-09
draft: false
---

A taxi dispatch line is a piece of infrastructure that is not allowed to fail. When someone calls for a car, there is usually a person at the other end of a cold street, and there is a driver who gets paid only when the call connects. The phone does not get to ring out. That is the constraint the whole thing is built around, and it does not relax on weekends, holidays, or at three in the morning.

On 1 September 2015, Obsidian Delta shipped its first product. [Delta Suite 1.0](https://www.obsidiandelta.com/#work) was an enterprise telephony platform integrated directly with Mobile Knowledge dispatch software, serving the taxi industry across North America. A driver requested a call-out and the suite handled the rest: thousands of simultaneous calls across distributed data centres, a fault-tolerant architecture, monitored around the clock. Those figures are the platform's own product record, published on the company's timeline; they are not independently audited numbers, and the note at the end says so plainly.

It did not ship as one thing. **Delta Bot** dispatched more than 30% of call volume without a person touching it. **Delta Cloud** ran the call centre out of the cloud; **Delta Local** was the on-premises build for operators who wanted the system in their own building; **Delta Rescue** was the backup line that took over when a call centre's own equipment went down. Different operators needed different shapes of the same thing, so the suite came in those shapes.

## The part worth explaining

The piece that is easy to walk past is the one that mattered most, and it is about where the people sat.

The public record of the platform states it in four words: call takers and dispatchers [worked from anywhere](https://www.obsidiandelta.com/#work). Here is what that meant underneath, in Jason's own account of how it was built.

A softphone is a telephone that is only software. The dispatcher's phone was not a handset wired to a switchboard in a particular room; it was an application running on whatever computer the dispatcher was sitting at. That application registered itself to the platform over SIP — the session protocol that carries internet telephony — announcing "this dispatcher is reachable, here, now." The registration roamed. The same dispatcher identity could attach from a call centre one day and a kitchen table the next, from one city or another, and the platform routed that dispatcher's calls to wherever they had most recently registered. To the person calling for a taxi, nothing changed; the line behaved identically. To the operator, the call centre was simply wherever the staff happened to be.

Put plainly: the building stopped being the call centre. The people were.

This shipped on 1 September 2015. The event that made remote call centres ordinary — the 2020 pandemic that sent office workers home — was almost five years off. When it arrived, the scramble that most contact centres went through to put their staff on calls from home was, for operators on this platform, a thing that had already been true and unremarkable for years. The architecture did not have to be changed to meet the moment. The moment arrived at an architecture that had assumed it from the start.

That is the claim worth being precise about, so here is the precise version: the capability to work from anywhere is on the company's public product record; the technical account of how it was achieved — softphones with roaming SIP registration — is Jason's own account of his own system, not a published engineering spec.

## Who was on the other end

Most of the operators that ran on Delta Suite are not named here, because naming a client is their call and not ours. There was a fleet in one Ontario city, operators in others; the suite's whole point was that it did not much care where any of them were.

One operator is named, with permission: Blue and White, the Mississauga operator, roughly 300 vehicles. That one is on the record because Jason put it on the record. The rest stay as shapes — a fleet here, a dispatch floor there — which is the honest way to describe a decade of work you cannot individually cite.

## One fact, stated once

New Year's Eve is the single heaviest night in taxi dispatch. It is the one night of the year when demand, drunkenness, weather, and the whole fleet's availability collide at the same hour, and the line that is not allowed to fail is pushed hardest.

Jason has not had a New Year's Eve off in almost a decade.

That is his own account, and it needs no citation, because it is his own life. It is stated here without comment because it does not need any. A platform that keeps a dispatch line up through the worst night of the year keeps a person up through it too, and that is simply the arrangement.

## The operational decade

That is what the decade was. A line that could not go down, kept up by an architecture built so that the people keeping it up did not have to be in any particular place to do it — a design that happened to anticipate, by years, the way the rest of the world would eventually be forced to work. The specificity is the whole of the point. There is no need to call any of it industry-leading; the figures and the dates say what there is to say, and where they cannot be independently checked, the note below says that too.

The first product shipped on 1 September 2015. The phones have not stopped since.

---

### What is not here

Some things belong in this piece and could not be stated with evidence, so they are left out of the body and named here instead.

- **Call volumes, uptime, and data-centre topology.** "Thousands of simultaneous calls," "distributed data centres," "fault-tolerant," "24/7 monitoring," and the "30%+ of call volume" figure for Delta Bot are drawn from the platform's own published product record. No independent operational logs, uptime reports, or third-party measurements were available to cite, so these are stated as product claims and not as audited facts.
- **The engineering of Delta Suite 1.0.** The softphone-and-roaming-SIP description is Jason's own account of how the system was built. There is no public technical specification to link to.
- **The operators served.** Only one client is named, with permission. Any fuller customer list would have to be theirs to disclose, not ours, so it is not here.
- **The New Year's Eve fact.** Carried on Jason's own account, as his own life. It is the one claim in this piece that is deliberately uncited, because the only possible source for it is the person who lived it.
