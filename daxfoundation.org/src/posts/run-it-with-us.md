---
title: "Run it with us"
description: "What the first run did not test, what a second run needs, and how to break the protocol on purpose."
date: 2026-10-18
updated: 2026-10-20
draft: false
series: accountability
part: 5
series_total: 5
related:
  - url: https://daxfoundation.org/writing/how-knowledge-compounds-under-a-constraint/
    label: "How knowledge compounds under a constraint"
  - url: https://daxfoundation.org/writing/a-record-not-a-wall/
    label: "A record, not a wall"
  - url: https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/
    label: "Refusing a bypass, and keeping the receipt"
  - url: https://www.obsidiandelta.com/blog/run-an-initiative-on-the-desk/
    label: "Run an initiative on the desk"
  - url: https://github.com/daxfoundation/constraint-protocol
    label: "The Constraint Protocol repository"
  - url: https://jeyanandan.com/blog/post-metadax-two-weeks/
    label: "Meta DAX, Two Weeks In (Jason Jeyanandan)"
---

A claim about accountability is worth what has been tried against it. The Constraint Protocol has run once, and its README says what that shows: "That demonstrates the mechanism runs. It demonstrates nothing else." A second run is where the protocol could first fail in public. The DAX Foundation stewards the specification, and Obsidian Delta is its first adopter, which the README calls "a conflict of interest rather than a validation — skin in the game, not evidence." Neither of us can supply what a second run needs most: a party that is neither.

## What the first run did not test

Open the [Constraint Protocol page](https://daxfoundation.org/constraint-protocol/) and read "Where it stands, honestly". On 4 May 2026 three instances, all run by us, ran the protocol across a boundary set up as if it lay between two organisations, and produced 44 signed events between 13:42 and 17:46 UTC; three requests to do work a blocking constraint held up were received, signed into the record and not acted on. [The third piece, on refusing a bypass](https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/) goes through those figures. The [README](https://github.com/daxfoundation/constraint-protocol) then lists what the run was not: "It was not a controlled study, there was no comparison condition, and nobody hostile has tried to break it."

The specification's evidence section ([§27](https://github.com/daxfoundation/constraint-protocol/blob/main/spec/CP-SPEC-v0_5.md)) adds that no hypothesis was fixed in advance, and that this was "one run, between two instances, in one afternoon, with placeholder cryptography". Section 27.1 names it: Ed25519 signatures and BLAKE2b-256 hashes, declared as Phase 1, on a build of the earlier v0.4 specification, with a post-quantum upgrade path recorded in each identity document. Version 0.5 is stricter: "A classical-only artifact — one with no PQ proof — MUST NOT be accepted at any time under this version" (§4.6.2). Two gaps showed in the repository until 20 October 2026: the two organisations were described only as that, and there was no event-level record of 4 May. The [record](https://github.com/daxfoundation/constraint-protocol/tree/main/runs/2026-05-04) is now public, and it shows one operator, not two organisations. That is the first thing a second run has to change.

## What a second run needs, and what to attack

Four things. A named external party: someone outside both the Foundation and Obsidian Delta, named in the record, who declares a constraint and agrees to be checked against it. Any constraint will do; the README says "Declaring something quite different and running CP honestly is entirely coherent." Next, the signature suites v0.5 requires, ML-DSA-44 for routine signing and SLH-DSA-SHA2-128s for the anchor key. Both sit in a W3C First Public Working Draft of 16 June 2026 that says of itself: "This specification is experimental, do not use it in any production setting." The strongest cryptography on offer is itself unfinished, and "post-quantum" should not read as settled. Third, scenarios fixed before anyone runs them: §27.5 asks for "Scenarios, seeding protocol, and detector published before the run", with a coordinated bloc seeded into some, scored on detection and on false alarms against honest agreement. Fourth, records published after, "under Apache-2.0 so that anyone can re-run the detector or a different one." A v0.5 run must also pass §4.9, which the 4 May reopen path would fail: a delegate's verdict is evidence until a validator countersigns.

Three targets we would pick. Independence: §4.7 calls it "structural, not attested", and §4.8 lets one operator run both witness and validator as distinct identities; whether an identity check is enough, or the operators must differ, is a fair argument. Scope: the protocol "verifies structure, not truth", so a witnessed false statement is still false; is the structure worth its cost? The detector: nothing yet shows it finds a bloc. The specification wants "at least one adversarial review by a party attempting to manufacture consensus that the detector fails to catch — with the results, either way, in the record" (§27.7).

Appendix E logs each input with an ID and decides it as accept, defer or reject, with the reasoning recorded; "Silent absorption" is listed under "What will not happen". The IETF's credo is "rough consensus and running code", which [RFC 7282](https://www.rfc-editor.org/rfc/rfc7282.html) §1 quotes from a 1992 talk by Dave Clark; §6 adds: "It's the existence of the unaddressed open issue, not the number of people, which is determinative in judging consensus." CP is not an IETF document; we borrow only the test. We have running code once, and an objection should be answered or dismissed on the record, never ignored.

## What to do this week

Pick one of three, and say which. Run it: write down what you would declare and where you would run it, which is what the page asks for. Review it: follow the README's reading order (decision log §0 and §3.5, the Phase B table, then one section of a body "not meant to be read front to back") and file what you find in the Appendix E format, with a before-and-after test case. Try to break it: design the seeded bloc you think the detector would miss.

Send it to the repository's [issues](https://github.com/daxfoundation/constraint-protocol/issues), which are open and, on 18 October, empty. Or message Jason Jeyanandan, who set the Foundation up, on [LinkedIn](https://www.linkedin.com/in/jasonjeyanandan).

This closes the Accountability series. [How knowledge compounds under a constraint](https://daxfoundation.org/writing/how-knowledge-compounds-under-a-constraint/) argued that a record of what was tried lets the next party start from a floor; the README says none of that has been demonstrated, and a second run is where it would first be tested. [A record, not a wall](https://daxfoundation.org/writing/a-record-not-a-wall/) made the case for keeping the record before anything fails; this piece asks you to test it. If your constraint is about how a team handles requests, [Run an initiative on the desk](https://www.obsidiandelta.com/blog/run-an-initiative-on-the-desk/) describes the system Obsidian Delta runs its own work on, and says the desk does not run on the protocol today. Nor does Meta DAX yet: it is meant to, and its fields are reserved and empty. [Two Weeks In](https://jeyanandan.com/blog/post-metadax-two-weeks/) asks for "what broke", not what you liked; we ask the same here.

Which of the three, run it, review it or try to break it, and what would you need from us first?

## Sources

- Constraint Protocol, "The Constraint Protocol, honestly", DAX Foundation page (run date, duration, event count, refused bypasses, "Run it with us"): https://daxfoundation.org/constraint-protocol/
- daxfoundation/constraint-protocol, README (Status, "A first adopter who is not neutral", reading order, "Review and adversarial testing are invited, loudly"); repository file listing and issue count checked 18 October 2026: https://github.com/daxfoundation/constraint-protocol and https://github.com/daxfoundation/constraint-protocol/issues
- CP-SPEC v0.5 (10 September 2026): §4.6, §4.7, §4.8, §4.9, §27.1 to §27.7, Appendix E: https://github.com/daxfoundation/constraint-protocol/blob/main/spec/CP-SPEC-v0_5.md
- W3C, "Quantum-Resistant Cryptosuites v1.0", First Public Working Draft, 16 June 2026 (status sentence quoted; suites mldsa44-jcs-2024 and slhdsa128-jcs-2024 listed): https://www.w3.org/TR/vc-di-quantum-resistant-1.0/
- P. Resnick, RFC 7282, "On Consensus and Humming in the IETF", June 2014, Informational (§1 credo, attributed to Dave Clark's 1992 plenary presentation; §6 quotation): https://www.rfc-editor.org/rfc/rfc7282.html
- Jason Jeyanandan, "Meta DAX, Two Weeks In" (quoted line): https://jeyanandan.com/blog/post-metadax-two-weeks/
