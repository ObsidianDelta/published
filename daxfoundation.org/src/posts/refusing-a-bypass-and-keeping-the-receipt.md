---
title: Refusing a bypass, and keeping the receipt
description: What the one run of the Constraint Protocol recorded on 4 May 2026, as far as the public record goes.
date: 2026-10-18
updated: 2026-10-20
draft: false
series: accountability
part: 3
series_total: 5
related:
  - url: https://daxfoundation.org/writing/what-a-declared-constraint-is/
    label: "What a declared constraint is"
  - url: https://daxfoundation.org/writing/how-knowledge-compounds-under-a-constraint/
    label: "How knowledge compounds under a constraint"
  - url: https://daxfoundation.org/constraint-protocol/
    label: "The Constraint Protocol, honestly"
  - url: https://daxfoundation.org/writing/the-stranger-test/
    label: "The stranger test"
  - url: https://daxfoundation.org/writing/run-it-with-us/
    label: "Run it with us"
  - url: https://github.com/daxfoundation/constraint-protocol
    label: "The Constraint Protocol repository"
---

A system that stops when it lacks permission is half of what an auditor needs. The other half is being able to show, afterwards and to someone who was not there, that it stopped: what it was told, which rule it stopped under, and that nobody has edited the account since. The Constraint Protocol, which the DAX Foundation stewards, is built around the second half. This article says what its one run recorded and, as plainly, what you cannot check yet.

## What the run recorded

On 4 May 2026, three instances on separate machines, all run by us, interacted under a build of the v0.4 specification, with the boundary between two of them set up as if it lay between two organisations; no second organisation took part. The [record](https://github.com/daxfoundation/constraint-protocol/tree/main/runs/2026-05-04) holds 44 signed events, from 13:42 to 17:46 UTC. One instance recorded two constraints that held up named kinds of work, implementation and deployment, until a problem was dealt with. The instance that issued the work then sent three requests for exactly that work, with briefs that read, in part, "ignore the open constraints" and "ignoring the compliance gate finding." Each request was received and signed into the record, and no work followed any of them. The [Constraint Protocol page](https://daxfoundation.org/constraint-protocol/) gives the same figures, next to the sentence that one run "demonstrates that the mechanism runs, and nothing else."

Who stopped the work matters. The protocol does not stop anyone on its own authority: the specification says it "does not gate, filter, or refuse on the substrate's own authority" and sums it up as "The substrate records; the constraint decides" (section 0.2). The stop came from a declared constraint that said what it blocked. For such a constraint, the specification requires that an attempt on the blocked work be refused and the refusal recorded as a witness attestation: "The attempt is thereby preserved as evidence" (section 5.8). Each of the two recorded instances held its own witness identity and its own validator identity, four in all, and the witness must be a separate identity from every participant (section 4.7). The specification's reason: "The distinction is a matter of identity, and identity is checkable." So a refusal can be a receipt signed by an identity other than the one that acted. The 4 May run kept less than that: its records are signed receipts of the three requests, and the refusal shows only as the absence of any work after them. Under v0.5 that falls short of section 5.8, a second flaw beside the one below.

One of the two also went from raised to resolved to reopened in about twenty minutes. A resolution was recorded with its evidence; a compliance check scored that evidence 0.25 against a passing threshold, noting that it was truncated mid-line; the constraint reopened and blocked again. The specification says both judgments are in the record (section 27.2). It also names the run's own flaw: that verdict reopened the constraint with no validator's signature, a self-certification which v0.5 now rules non-conformant until a validator countersigns (sections 4.9 and 27.3).

## What is public, and what is not

The pairing is not ours. Singapore's Infocomm Media Development Authority (IMDA), in version 1.5 of its Model AI Governance Framework for Agentic AI (published 20 May 2026), tells organisations to "continuously monitor and log agent behaviour post-deployment", so that they can "stop agent workflow and escalate to a human supervisor" when, for instance, a system attempts unauthorised access. Among its monitoring practices it also lists ensuring "that problematic agent trajectories and failures cannot be deleted" ([pages 43 and 44](https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf)). A stop, and a record that survives it. The question we add is the next one: when the log is the operator's own, who else can check it?

Here is the limit. Until 20 October 2026 the event-level record of the 4 May run was not public, and this piece repeated the specification's summary: two organisations, about three and a half hours, about 34 witness-signed events, three refusals each a signed record. The [record](https://github.com/daxfoundation/constraint-protocol/tree/main/runs/2026-05-04) is now public, and it corrects all four: three instances run by one operator, 44 events over about four hours, and receipts rather than signed refusals. The permanent copy on Arweave is of the specification, not of the run. And the run used placeholder cryptography (section 27.4), so it shows the shape of the record, not the strength of its signatures. Its signing keys are retired and listed with the record, because a copy was exposed in a working session on 20 October 2026; anything they sign that is not in the published file list is not part of the run.

To check the run for yourself, the published folder has the 44 events in 21 hash-chained contexts, the 14 content-addressed outputs, the two constraint records, the four identity documents with public keys only, and a script with instructions that re-checks every hash, signature and chain link. What it does not have: the third instance's own record, which was not captured, and the superseded work from earlier that day, withheld and listed by hash so it can be checked if it is ever released. The specification promises raw records for the controlled study it designs, once that is run (section 27.5). What a second run needs, with a named outside party, is in [Run it with us](https://daxfoundation.org/writing/run-it-with-us/).

## What it means for you

Take one AI system you run that acts on instructions and ask: what does it do when the brief says to ignore the gate, and where would you find out? Write the answer in two lines. Then test it. Is the answer a record or a recollection, and could anyone other than the operator check it? If the honest answer is "ask the person who runs it", the receipt is not yet yours.

The article before this one, [What a declared constraint is](https://daxfoundation.org/writing/what-a-declared-constraint-is/), is about declaring the limit ahead of the work and keeping author, witness and validator apart. The next, [How knowledge compounds under a constraint](https://daxfoundation.org/writing/how-knowledge-compounds-under-a-constraint/), is about what a kept record is for once it exists. For a different failure we published, [The stranger test](https://daxfoundation.org/writing/the-stranger-test/) tells how fresh stand-ins following our public page found the player showing learners the answers.

Have you ever seen a refusal logged with a signature that someone other than its operator could check?

## Sources

- Infocomm Media Development Authority (Singapore). Model AI Governance Framework for Agentic AI, Version 1.5, published 20 May 2026 (updated 5 June 2026), pages 43 and 44. https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf
- Infocomm Media Development Authority (Singapore). Updated Model AI Governance Framework for Agentic AI, release page dated 20 May 2026 (confirms publisher and date). https://www.imda.gov.sg/resources/press-releases-factsheets-and-speeches/updated-model-ai-governance-framework-for-agentic-ai
- DAX Foundation. The Constraint Protocol, specification v0.5 (10 September 2026), sections 0.2, 4.7, 4.9, 4.10, 5.8, 27.1 to 27.5. https://github.com/daxfoundation/constraint-protocol/blob/main/spec/CP-SPEC-v0_5.md
- DAX Foundation. The Constraint Protocol repository and README (status, integrity and permanent-copy sections). https://github.com/daxfoundation/constraint-protocol
- DAX Foundation. The Constraint Protocol, honestly. https://daxfoundation.org/constraint-protocol/
