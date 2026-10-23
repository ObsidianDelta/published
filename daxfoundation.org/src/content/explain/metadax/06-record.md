---
id: 06-record
order: 6
tense: live
claim: record
question:
  en: "What is in the record?"
line:
  en: "What you reached. What you tried and where it went nowhere, kept on purpose. What others reused. Yours, and public only if you choose."
paragraph:
  en: "A learning record keeps four kinds of thing. What you reached, with the path that got you there. What you tried and where it went nowhere, kept on purpose, because a dead end is knowledge too and a system that hid them would be leading you. Who guided you, and on what. What of yours others reused, and what of theirs you did. The record lives in your own repository. You decide whether it is public. Where it goes next is Nova DAX, a person's lifelong record, of which this is the first slice."
evidence:
  - kind: link
    src: https://github.com/daxfoundation/metadax
    caption:
      en: "How records are kept: append-only files in the learner's own repository"
    source: github.com/daxfoundation/metadax
  - kind: sample
    src: https://daxfoundation.org/metadax/samples/
    caption:
      en: "Sample packages, each with the prompts that made it"
    source: daxfoundation.org
scene:
  module: record
  pin: 1
  states: [rows, seed]
  params:
    labels:
      title: "Learning record"
      rows: ["Reached - fractions as ratios", "Tried - decimals first. Dead end, kept.", "Guided by - a parent, a step ahead on number lines", "Reused by 3 learners - the number-line page", "Reached - Newton's second law, with a sled"]
      rowKinds: ["reached", "tried", "guided", "reused", "reached"]
      yours: "Yours. Public only if you choose."
      seed: "the seed of Nova DAX"
next: 07-five
deeper:
  - /metadax/samples/
version: 1
---
