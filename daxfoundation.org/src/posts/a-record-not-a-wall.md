---
title: A record, not a wall
description: How aviation and nuclear power built their safety practice around kept records, and where AI's record is still missing.
date: 2026-10-18
updated: 2026-10-20
draft: false
series: accountability
part: 1
series_total: 5
related:
  - url: https://daxfoundation.org/writing/what-a-declared-constraint-is/
    label: "What a declared constraint is"
  - url: https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/
    label: "Refusing a bypass, and keeping the receipt"
  - url: https://daxfoundation.org/writing/how-this-is-paid-for-and-what-we-will-measure/
    label: "How this is paid for, and what we will measure"
  - url: https://daxfoundation.org/constraint-protocol/
    label: "The Constraint Protocol, honestly"
  - url: https://jeyanandan.com/blog/the-constraint/
    label: "The Constraint (Jason Jeyanandan)"
---

Nobody who governs AI for a living can be promised that nothing will fail. What can be asked for is a record, started before the event and readable after it, of what a system was bound by, what it did and who answered for it, so the next failure can be prevented instead of explained away. A wall stops something. A record lets you find out. We check the case at its sources, then ask where AI's record stands.

## What kept records did

The [Constraint Protocol page](https://daxfoundation.org/constraint-protocol/) is where we say this about our own work. Its section "What it does not do" begins: "It prevents nothing. Nothing in it stops a bad act as it happens. It is a recording substrate, not a guard rail." [The Constraint](https://jeyanandan.com/blog/the-constraint/), by Jason Jeyanandan, who set the Foundation up, tells the history behind the idea; we do not retell it, we check it.

Annex 13 to the Convention on International Civil Aviation, [thirteenth edition](https://www.bazl.admin.ch/dam/en/sd-web/F31sDf6UEpy9/icao_annex_13_aircraftaccidentandincidentinvestigation.pdf) (July 2024), says at 3.1: "The sole objective of the investigation of an accident or incident shall be the prevention of accidents and incidents. It is not the purpose of this activity to apportion blame or liability." Incidents are in scope, defined as an occurrence "which affects or could affect the safety of operation", so the near miss counts. Nuclear power made the habit an institution. The Institute of Nuclear Power Operations was [formally established in December 1979](https://www.inpo.info/history), in response to the recommendations of the commission that investigated Three Mile Island. The World Association of Nuclear Operators was [created on 15 May 1989](https://www.wano.info/about-us/our-history); it says Chernobyl "made it clear that an event at one plant impacted every plant and that nuclear safety was everyone's business." A record alone makes nothing safe; our page says its own offers "the capacity for retrospective accountability, not the exercise of it."

## Where AI's record stands, and what the protocol adds

Two public collections hold AI incidents, and they count different things. The [AI Incident Database](https://incidentdatabase.ai/) is "dedicated to indexing the collective history of harms or near harms realized in the real world by the deployment of artificial intelligence systems"; it takes submitted reports, and its newest entry on 18 October 2026 is Incident 1761. The [OECD AI Incidents and Hazards Monitor](https://oecd.ai/en/incidents) detects events in news coverage and has large language models classify them; its search page showed "About 18454 incidents & hazards" the same day, hazards included. Both work after the fact, from reports, and the OECD's [methodology note](https://oecd.ai/en/incidents-methodology) allows that its entries "only represent a subset of all AI incidents and hazards worldwide." The [International AI Safety Report 2026](https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026), advised by a panel nominated by over 30 countries and international organisations, states the consequence: "Lack of incident reporting and monitoring makes it difficult to assess how well current practices reduce risks or how consistently they are implemented."

Two instruments ask the operator for a record. [Article 73 of the EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) requires providers of high-risk AI systems to report any serious incident to the market surveillance authorities of the Member State where it occurred, in any event "not later than 15 days after the provider or, where applicable, the deployer, becomes aware of the serious incident", with two days for a widespread infringement or serious and irreversible disruption of critical infrastructure, ten where a person has died. Article 73 does not make the report public, and Article 78 binds authorities to confidentiality. The [Digital Omnibus on AI](https://eur-lex.europa.eu/eli/reg/2026/1744/oj) (Regulation (EU) 2026/1744, published 24 July 2026) leaves Article 73's text as it was but moves the high-risk requirements of Chapter III, Sections 1 to 3, to 2 December 2027 (Annex III systems) and 2 August 2028 (Annex I); which date governs a provider's reporting is a question for counsel. The [NIST AI Risk Management Framework 1.0](https://doi.org/10.6028/NIST.AI.100-1), voluntary and under revision, asks in MANAGE 4.3 that "Incidents and errors are communicated to relevant AI actors, including affected communities. Processes for tracking, responding to, and recovering from incidents and errors are followed and documented."

Read together, they show that the problem is not that nobody collects AI incidents. The record is held by someone else (the press, volunteers, a regulator under confidentiality) or is a process an operator documents for itself. None requires a record declared in advance, that nobody can quietly edit, and that a stranger can check.

The protocol adds three things and claims nothing beyond them. Each party declares in advance what it will not do. An attempt to get round a blocking constraint is refused and recorded even though no harm followed; a refusal that held is rarely news, and the monitor above is built from news. And anyone can dispute any record. A public working draft (v0.5, 10 September 2026), it has run in full once, on 4 May 2026, across three instances all run by us: 44 signed events in about four hours, and three requests to do blocked work that were received, signed into the record and not acted on. The [event-level record](https://github.com/daxfoundation/constraint-protocol/tree/main/runs/2026-05-04) is public, with a script that re-checks every signature, so that is now a record you can check, not only a claim you can read. One run, the page says, "demonstrates that the mechanism runs, and nothing else."

## What it means for you

Pick one AI system you run and write three lines: where its incident record lives, who other than you can read it, and whether the instructions it declined appear in it. If the answer is a chat transcript or a person's memory, you have found the gap this series is about.

This article opens the series. Next, [What a declared constraint is](https://daxfoundation.org/writing/what-a-declared-constraint-is/) explains declaring a limit before the work and keeping author, witness and validator apart. [Refusing a bypass, and keeping the receipt](https://daxfoundation.org/writing/refusing-a-bypass-and-keeping-the-receipt/) takes the 4 May run as far as the public record allows; [How this is paid for, and what we will measure](https://daxfoundation.org/writing/how-this-is-paid-for-and-what-we-will-measure/) covers the measurement that has not happened yet.

When your system refuses an instruction today, where is the receipt?

## Sources

- International Civil Aviation Organization. Annex 13 to the Convention on International Civil Aviation, Aircraft Accident and Incident Investigation, Thirteenth Edition, July 2024 (applicable 28 November 2024), paragraph 3.1 and the definition of "Incident". Copy hosted by the Swiss Federal Office of Civil Aviation. https://www.bazl.admin.ch/dam/en/sd-web/F31sDf6UEpy9/icao_annex_13_aircraftaccidentandincidentinvestigation.pdf
- Institute of Nuclear Power Operations. Our history. https://www.inpo.info/history
- World Association of Nuclear Operators. Our history. https://www.wano.info/about-us/our-history
- Responsible AI Collaborative. AI Incident Database, home page, read 18 October 2026 (Incident 1761 the newest; the database's sitemap lists incident numbers 1 to 1761). https://incidentdatabase.ai/
- OECD. AI Incidents and Hazards Monitor (AIM), search page, read 18 October 2026 (date range "All Time"), and AIM methodology. https://oecd.ai/en/incidents and https://oecd.ai/en/incidents-methodology
- Bengio, Y. and others. International AI Safety Report 2026, February 2026, section 3.2 "Risk management practices", key information; panel description on the contributors page. https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026 and https://arxiv.org/abs/2602.21012
- European Union. Regulation (EU) 2024/1689 (Artificial Intelligence Act), Articles 3(49), 73 and 78. https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- European Union. Regulation (EU) 2026/1744 (Digital Omnibus on AI), Official Journal of 24 July 2026, amended Article 113 and new Article 75(1a). https://eur-lex.europa.eu/eli/reg/2026/1744/oj
- National Institute of Standards and Technology. Artificial Intelligence Risk Management Framework (AI RMF 1.0), NIST AI 100-1, January 2023, MANAGE 4.3; and NIST, AI Risk Management Framework page (voluntary use; revision under way). https://doi.org/10.6028/NIST.AI.100-1 and https://www.nist.gov/itl/ai-risk-management-framework
- DAX Foundation. The Constraint Protocol, honestly. https://daxfoundation.org/constraint-protocol/
- Jeyanandan, J. The Constraint. https://jeyanandan.com/blog/the-constraint/
