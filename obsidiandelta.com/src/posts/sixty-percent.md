---
title: "Sixty Percent"
subtitle: "What Delta Suite 2.0 took to build, feature by feature — and where those features actually came from"
description: "In February 2022 we shipped voice automation for taxi dispatch that sat in front of any backend and cut the need for live call takers by up to 60%. This is what that number cost, and an honest note on which of its conveniences were ever new."
date: 2026-11-09
draft: false
---

In February 2022 we shipped Delta Suite 2.0: voice automation for the taxi industry that sat in front of any dispatch backend and reduced the need for live call takers by up to 60%.

One line, one number. The rest of this is what that number cost.

## How it fit

Delta Suite 2.0 did not replace the dispatch software an operator already ran. It sat in front of it. The automation spoke to callers, resolved what they wanted, and handed a finished booking to whatever computer-aided dispatch platform was already on site — no rip-and-replace, no migration off the system the operator had trained its people on.

The unified communications layer ran on 3CX. That is the unglamorous half of the result and the half that mattered to the people doing the work: with call-taking and dispatch on 3CX, the call takers and dispatchers who remained could work from anywhere, not from a room full of handsets.

## The features, and what each one took

The product page lists the call-flow capabilities in a sentence each. Every one of those sentences is a piece of engineering, so here is what was actually underneath them.

**Accurate address translation.** A caller says where they are out loud — partial, accented, colloquial, corrected mid-sentence, with the name of a plaza instead of a street number. Turning that into a single dispatchable, geocoded point against a live street network, over a phone line, in real time, is the hard part of the whole system. Everything else depends on getting this right first.

**Price quotes mid-call.** Quoting a fare before the car moves means resolving both the pickup and the destination to routable points, computing distance and time against the operator's own tariff, and speaking a number back to the caller while they are still on the line — and then standing behind it.

**Booking against historical addresses, fixed locations, and popular destinations.** The system recognises a returning caller by their number, recalls where they have gone before, and resolves named places — the airport, the hospital, the casino — to the operator's canonical records. That is what lets "take me to the airport" become a booking without anyone spelling out a street address.

**Anonymous passenger-to-driver communication.** Connecting a rider and a driver by phone while showing neither one the other's real number means brokering the call through the platform, holding that mapping for the life of the trip, and tearing it down afterward. The passenger can reach their driver; the driver can reach their passenger; neither keeps the other's personal line.

**Live ride status.** Telling a caller where the car is and when it will arrive means consuming the dispatch backend's vehicle-location feed and turning it into something a voice line or a message can deliver on demand, at the moment the person asks.

**Update or cancel mid-ride.** Changing or cancelling after the booking is placed means reaching back into the dispatch backend's live state and mutating an in-progress job safely — without stranding a driver who is already rolling or double-booking a car that is now free.

Do all of that well enough and an operator needs up to 60% fewer people answering phones. That is the boast, and it needs nothing added to it.

## On the research

The call-flow work behind this was, in the language of the original product page, *forged in coordination with Microsoft Research.* That is the whole of what will be said about it here: a bounded description of the work, and nothing more. It is not a claim of partnership, sponsorship, certification, or endorsement by Microsoft, and it should not be read as one.

## What in it was ever new

It is worth saying plainly which parts of a modern ride experience the taxi industry already had, because the popular account is that it had none of them until ride-hailing arrived.

Computer-aided dispatch with GPS automatic vehicle location is not a ride-hailing invention. A deployed system across three Singapore taxi fleets — detecting the nearest car on a booking, escalating to the next-nearest when no one accepted — is documented in [peer-reviewed literature from 2003](https://dl.acm.org/doi/fullHtml/10.1145/769800.769806), and [DDS Wireless](https://ddswireless.com/about-us/) was building automated taxi dispatch from the late 1980s. Cashless, tap-to-pay fares are not new either: Visa and Creative Mobile Technologies had [contactless payment running in New York yellow cabs by 2007](https://www.securetechalliance.org/beep-beep-visa-and-creative-mobile-technologies-partner-to-bring-faster-payments-to-thousands-of-new-york-taxis/). And hailing a cab from a smartphone, with the car's distance shown after you booked, shipped as [Taxi Magic on the App Store in December 2008](https://techcrunch.com/2008/12/16/taxi-magic-hail-a-cab-from-your-iphone-at-the-push-of-a-button) — before Uber's 2010 beta.

Masked passenger-to-driver calling, saved and historical addresses, live tracking, and cancelling from inside the booking were marketed elsewhere as the conveniences that made app-hailing better than a taxi. Delta Suite 2.0 shipped them into taxi dispatch — into whatever backend an existing operator already ran. We will let the dates above carry the point and leave it at that.

## Who ran it

The one operator we will name is Blue and White, in Mississauga — roughly three hundred vehicles. Obsidian Delta ran dispatch automation in that business, not as a slide but as something that answered real phones. Other operators are better described than named, and they are not named here.

## What is not here

The 60% figure, and the feature list it summarizes, come from the product's own record. No independent operational data — call volumes, uptime, before-and-after staffing — is published here, and none should be inferred from the number. An earlier product video stated a higher figure; the number used here is the one the product page carries.

The four conveniences in the section above — masked calling, saved addresses, live status, in-app cancellation — shipped in Delta Suite 2.0 in February 2022, which is *after* ride-hailing had already marketed versions of them. Nothing here claims Obsidian Delta did those four first. What predates ride-hailing is the dispatch substrate underneath them — the GPS vehicle location, the computer-aided dispatch, the nearest-car assignment, the smartphone hail, the tap-to-pay fare — and those claims carry their citations above. The honest statement is the narrow one: an independent shop put the full set into taxi dispatch, in front of any backend, and an operator could then offer it.

Nothing in this post is a statement by, or on behalf of, any company named in it other than Obsidian Delta.
