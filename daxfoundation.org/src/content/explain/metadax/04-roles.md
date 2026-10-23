---
id: 04-roles
order: 4
tense: researched
claim: roles
question:
  en: "What is Meta DAX, then?"
line:
  en: "Not thirty learners around one teacher. Thirty roles around one learner: the subject teacher, a psychologist, the parents, the whole community. Universal learning turns the classroom inside out."
paragraph:
  en: "In a classroom, thirty attentions point at one teacher. Invert it: thirty attentions point at one learner. The thirty are not people and not fixed. They are roles, the subject teacher, a psychologist, the parents, the community, a tutor who is a step ahead on this one thing, and they change with the moment: a different thirty for a fractions problem than for a first week at a bakery. Integrated over a life, that is thousands of entities that have, at some moment, been working out how to help this one person. It runs both ways: a guide gets thirty too. This is what human delta value measures, and why the teacher gets cognition back to spend on problems they could only dream about before."
evidence:
  - kind: link
    src: https://daxfoundation.org/writing/human-delta-value/
    caption:
      en: "Human delta value: the measure under all of it"
    source: daxfoundation.org
  - kind: link
    src: https://daxfoundation.org/definitions/
    caption:
      en: "Guide, learner, a step ahead: the definitions"
    source: daxfoundation.org
scene:
  module: orbit
  pin: 2
  states: [classroom, invert, context, reverse]
  params:
    roles: 30
    guides: 3
    counterStart: 1310
    labels:
      classroom: "Thirty attentions, one teacher"
      invert: "One learner, thirty attentions"
      roles: ["the subject teacher", "a parent", "a tutor", "a psychologist", "the community", "a classmate", "a coach", "a librarian"]
      contexts: ["fractions", "the sled problem", "a quiz", "a first week at the bakery"]
      counter: "entities so far, this year"
      reverse: "It runs both ways: a guide gets thirty too"
next: 05-guide
deeper:
  - /writing/human-delta-value/
version: 1
---
