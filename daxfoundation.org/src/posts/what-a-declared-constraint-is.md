---
title: What a declared constraint is
description: Declaring in advance, keeping author, witness and validator apart, and where this sits among the records that already work.
date: 2026-10-18
draft: false
series: accountability
part: 2
series_total: 5
related:
  - url: https://daxfoundation.org/writing/a-record-not-a-wall/
    label: "A record, not a wall"
  - url: https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/
    label: "Refusing a bypass, and keeping the receipt"
  - url: https://daxfoundation.org/definitions/#constraint
    label: "Definitions: constraint"
  - url: https://daxfoundation.org/definitions/#dax-constraint
    label: "Definitions: the DAX constraint"
  - url: https://www.obsidiandelta.com/blog/what-is-already-solved/
    label: "What is already solved"
  - url: https://github.com/daxfoundation/constraint-protocol
    label: "The Constraint Protocol repository"
---

A constraint is worth something to an outsider only if it was declared before the work, by a party who can be held to it, and written into a record that party cannot quietly change. A declared constraint has three parts that must hold together: the declaration comes first and says what is forbidden; the record is signed and append-only; and the party that wrote an entry neither witnesses it nor passes judgment on itself. Almost none of this is new. Transparency logs and provenance standards already do most of it, and the [Constraint Protocol](https://daxfoundation.org/constraint-protocol/) (CP) reuses them instead of inventing a ledger. CP is a public working draft, v0.5, and has run in full once, on 4 May 2026. It is not running across anyone's traffic today.

## Three functions, kept apart

Open [Definitions](https://daxfoundation.org/definitions/#constraint) and read two entries. The first defines the word as an engineer would: "A typed restriction on allowable transitions in a system", and "A constraint MUST be defined relative to a process and a timescale; a claim using the word without a stated type and timescale is descriptive noise, not ontology." The second, [the DAX constraint](https://daxfoundation.org/definitions/#dax-constraint), is one worked declaration: "preservation and expansion of life, humanity, and consciousness." It is offered as an example "not the content of the protocol", because CP "does not require any particular constraint. It requires that a constraint be declared and that what it forbids be stated."

In the [specification](https://github.com/daxfoundation/constraint-protocol/blob/main/spec/CP-SPEC-v0_5.md), a declaration is a signed object holding the constraint "in the declarer's words", who declared it and when (§20.3). A sentence alone is not enough: "A ConstraintDecl with no Policy is a statement of values; a ConstraintDecl with a Policy is an evaluable frame."

Then who does what. Every event carries "two independently verifiable signatures by two distinct identities", the first of which "is authorship" and the second "is observation" (§4.10). The witness "MUST be a separate signing identity from every participant" (§4.7) and "never evaluates, interprets, scores, or judges" (§10.2). The validator "MUST be a separate signing identity" from the witness whose receipt it judges (§4.8), and §4.9 closes the obvious shortcut: if a party's own delegate could issue the verdict, "the party would certify its own adherence". The README puts it in one line: "The judging is kept separate from the witnessing."

The one run showed why. A verdict from an automated compliance check that one party ran flowed into the state of a constraint with no validator's signature. The spec calls that self-certification, and under v0.5 the run's own reopen path "is non-conformant until a validator countersigns" (§27.3). We would rather print that than a cleaner story.

## Where this sits among records that already work

Certificate Transparency came first. [RFC 6962](https://www.rfc-editor.org/rfc/rfc6962) (June 2013) provides "publicly auditable, append-only, untrusted logs of all issued certificates" and says what that buys: "The logs do not themselves prevent misissue, but they ensure that interested parties (particularly those named in certificates) can detect such misissuance." [RFC 9162](https://www.rfc-editor.org/rfc/rfc9162) (December 2021) obsoletes it and repeats the point. Both are Experimental, not Standards Track.

The IETF's SCITT working group, "Supply Chain Integrity, Transparency, and Trust", is active, and its [charter](https://datatracker.ietf.org/doc/charter-ietf-scitt/) promises "a set of interoperable building blocks that will allow implementers to build integrity and accountability into software supply chain systems". Its architecture is now [RFC 9943](https://www.rfc-editor.org/rfc/rfc9943) (June 2026, Standards Track), which says "SCITT is a generalization of CT": certificate authorities issue, logs record, auditors check. It states the limit as CP does: "Transparency does not prevent dishonest or compromised Issuers, but it holds them accountable." CP's ledger is a profile of SCITT, per [its own table of what it reuses](https://github.com/daxfoundation/constraint-protocol#composition-not-competition); the spec cites the draft, revision -22, since published as RFC 9943.

C2PA's Content Credentials bind provenance to media and draw the same line. In [version 2.4](https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html) (April 2026) a manifest is "the combination of one or more assertions (including content bindings), a single claim, and a claim signature". The specification quotes its own principle: C2PA specifications "SHOULD NOT provide value judgments about whether a given set of provenance data is 'good' or 'bad,' merely whether the assertions included within can be validated as associated with the underlying asset, correctly formed, and free from tampering." CP does not build on C2PA; we cite it because it separates structure from truth in the same place we do.

What CP adds is small: a witness that makes no claim about content, and a judgment kept apart from it, dated and re-issuable, so a later judge can "re-score the past later with better knowledge without erasing the old verdict". Its README is plain about limits: CP "prevents nothing" and "verifies structure, not truth", and the ledger-only service deployed since the run "is idle".

## What it means for you

This week, write one constraint you would declare for a system you run, in a sentence a stranger could check. Say what it forbids, the process and timescale it covers (Definitions asks for both), and how adherence would be measured; without that, the spec calls it "a statement of values". Then write two more names beside it: who would witness it, and who would judge it. If all three are you, you have a promise, not a record.

This is the second of five parts. [A record, not a wall](https://daxfoundation.org/writing/a-record-not-a-wall/) makes the case for accountability as a kept record, and [Refusing a bypass, and keeping the receipt](https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/) turns to what the one run recorded, as far as the public record goes. The terms above are on [the Definitions page](https://daxfoundation.org/definitions/); the open stack built on this ground is described in [What is already solved](https://www.obsidiandelta.com/blog/what-is-already-solved/); the specification and its decision log are in [the CP repository](https://github.com/daxfoundation/constraint-protocol). Meta DAX is meant to run on CP; its protocol fields are reserved and empty today ([research page](https://daxfoundation.org/metadax/research/)).

Who, other than you, could check it?
## Sources

- B. Laurie, A. Langley, E. Kasper, "Certificate Transparency", RFC 6962, June 2013, section 1 (Experimental; obsoleted by RFC 9162): https://www.rfc-editor.org/rfc/rfc6962
- B. Laurie, E. Messeri, R. Stradling, "Certificate Transparency Version 2.0", RFC 9162, December 2021, section 1 (Experimental; obsoletes RFC 6962): https://www.rfc-editor.org/rfc/rfc9162
- IETF, "Supply Chain Integrity, Transparency, and Trust (scitt)" working group, state Active, charter-ietf-scitt-01 (read 18 October 2026): https://datatracker.ietf.org/wg/scitt/about/ and https://datatracker.ietf.org/doc/charter-ietf-scitt/
- H. Birkholz, A. Delignat-Lavaud, C. Fournet, Y. Deshpande, S. Lasker, "An Architecture for Trustworthy and Transparent Digital Supply Chains", RFC 9943, June 2026, section 4 (Standards Track): https://www.rfc-editor.org/rfc/rfc9943
- C2PA, "Content Credentials: C2PA Technical Specification", version 2.4 (April 2026), sections 1.2 and 2.3.4: https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html
- DAX Foundation, "Definitions" (internal): https://daxfoundation.org/definitions/
- Constraint Protocol README and CP-SPEC v0.5, sections 4.7 to 4.10, 10.2, 20.3 and 27.3 (internal): https://github.com/daxfoundation/constraint-protocol
- Meta DAX, "The research", section "On the Constraint Protocol" (internal): https://daxfoundation.org/metadax/research/
