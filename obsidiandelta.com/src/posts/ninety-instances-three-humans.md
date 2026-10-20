---
title: Ninety instances, three humans
description: A worked example of a company with ninety machine instances and three people in it, the rule that keeps a department out of a caller's private memory, and an honest account of which parts are built.
date: 2026-10-20
draft: false
---

Most of what gets said about a company run largely by machines is about how many of them there are. The question that decides whether you could trust one is different: when a call comes in, what is each instance allowed to reach, and when does it spend a person's attention? This piece follows one inbound call through a worked example, a company of ninety instances and three humans, and says plainly which parts of that path exist today. The ninety is an illustration, and we have not run anything near it. What we checked, against the source of the routing layer on 20 October 2026, is the path and the rule.

## One call, six stops

The example began as a single wide drawing, read left to right. A call arrives by phone, on the web, by joining a meeting, or from another company's instance. It meets a concierge that holds no memory of its own and answers the public at the customer-facing scope. Once the caller is verified, the concierge hands over to the caller's own side: a person and their companion, working as one unit (what we mean by that is in [The Cognitive Companion](https://www.obsidiandelta.com/blog/cognitive-companion/)). That is where the caller's private memory lives.

From there the caller's side can ask any of five departments for help: support, IT, sales, marketing and finance, which hold seventy-six of the ninety instances between them. Departments escalate to executive instances, a CTO and a CMO, and an executive instance decides whether to spend one of the three humans. A dashed vertical line runs between the caller's side and every department. That line is the rule the rest of this piece is about. One amber path leads to a person, and it is the only route in the drawing that costs a human any attention.

## Why a department cannot read a caller's memory

The caller's private memory sits in personal scope. Five kinds of caller can reach an instance: its owner, a customer, a room of meeting participants, another instance, and the public. A short table in the routing code, the deny matrix, lists the pairs that are forbidden. Everyone except the owner is barred from personal scope. A customer is also barred from the owner's meeting scope, and the public is barred from role scope and the owner's meeting scope as well. The owner is barred from nothing.

Every department reaches the caller's side as another instance, so no department can resolve personal scope. At most it receives the customer-facing view that the caller's side has marked safe to share. The rule is enforced twice in code. A profile that declares a forbidden pair is rejected when it loads, and the bundled profiles are validated when the routing worker starts, so one would stop it from starting. The function that resolves scope checks the same table again on every turn, so a hand-built map cannot leak a forbidden pair either. Scope is resolved before any memory is loaded, and personal scope is never returned to anyone but the owner. This is enforced by checks in code, not by an instruction we ask a model to follow.

One qualification, so the claim stays inside the record. The memory this rule protects is not yet durable. A key for each caller's vault can be derived from the caller's verified identity, but the store behind it is held in memory and starts empty on each request, and the code refuses to attach a durable store until each caller can be told apart. Today the guarantee is about the rule. It is the rule that will hold once there is something lasting to guard.

The same instance can serve different callers at different scopes without a second copy. The CTO profile gives its owner role scope, meaning the working vault and organisational knowledge but never a personal vault. Another instance consulting the CTO works at role scope too. A customer, or the public, gets only the customer-facing scope.

## What is built, and what is not

Taking the six stops in order, as of 20 October 2026.

The concierge is a configuration task. The contract declares lanes for phone, web, meetings, dictated notes and other instances. The phone and web lanes are implemented. The meeting lane and the lane for other instances are placeholders that throw an error if called. No concierge profile exists yet, and writing one needs only configuration, since the phone and web lanes it would use are there.

The hand-off to the caller's own side is not built. Owner access today comes from a short allowlist held in configuration, not from identities issued per customer, and the durable per-caller store described above is not connected.

The next three stops are not built either: a companion consulting a department, departments consulting each other, and a department escalating to an executive instance. A diagram like this invites the assumption that these hops work, and they do not yet. All three travel over the lane for other instances, and that lane is a placeholder. What does exist is everything around it: the rule they would run under, and the CTO and CMO profiles, which name that lane. There is no CEO profile and there are no department profiles. By design the three are one call shape, since sales asking finance looks the same as a companion asking support, so there is one path to build rather than three.

Spending a human is not built. The existing lanes take calls in, and we found no code in the routing layer that reaches out to a person. A ladder from an in-app message to a push notification to a phone call is a design.

Two counts keep the example honest. Four profiles exist today: a CTO, a CMO and two for individual people. And the container class that runs instances is capped at ten in its configuration, so the ninety is a shape, not a load we have run.

## Why ninety instances can still be a company

The idea that a large organisation can run on three people rests on one design decision, written into the type that defines an instance. A comment in the source puts it this way: "A persona is 100% config. A brand-new instance (e.g. a CTO) requires ZERO code changes and ZERO container rebuild." In practice that is a profile file per instance. The profiles are bundled into the routing worker when it is built, so a new instance also means regenerating that bundle and redeploying the worker. It does not mean hand-written code or a rebuilt container.

A department is meant to be a folder of such profiles. What an instance may touch is decided at the moment of the call, from the kind of instance it is, who is asking and which lane they came in on, never baked into the instance itself. That is why adding instances adds no new rules.

The rule in this piece is what keeps a department on the far side of the unit a person forms with their companion. Which call into your business would you want traced first, and at what point should a machine be unable to go further without a person? [Message Jason on LinkedIn](https://www.linkedin.com/in/jasonjeyanandan) with your answer.
