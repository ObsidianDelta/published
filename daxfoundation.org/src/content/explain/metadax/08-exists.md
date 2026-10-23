---
id: 08-exists
order: 8
tense: live
claim: exists
question:
  en: "What exists today?"
line:
  en: "Experiments, not a product. Samples and showcases are published as they are made. Pick your chair and go as deep as you like."
paragraph:
  en: "Nothing here is a product. The experiments exist to work out the architecture, and everything usable is published as it is made: sample packages for families who homeschool, showcases such as one dish and its story in 3D, the definitions, and the writing. Pick the chair you sit in, parent, tutor, teacher, trainer or researcher, and the door opens on what you would see and how to use it. Every chapter here has three depths: the line, the paragraph, the evidence. Go as deep as you like."
evidence:
  - kind: sample
    src: https://daxfoundation.org/metadax/samples/
    caption:
      en: "The samples and showcases, as of today"
    source: daxfoundation.org
  - kind: link
    src: https://daxfoundation.org/metadax/showcases/
    caption:
      en: "The showcases, in 3D"
    source: daxfoundation.org
  - kind: link
    src: https://github.com/daxfoundation/metadax
    caption:
      en: "The open repository"
    source: github.com/daxfoundation/metadax
scene:
  module: chairs
  pin: 0
  params:
    labels:
      pick: "Pick your chair"
      chairs: ["parent", "tutor", "teacher", "trainer", "researcher"]
      showcase: "a showcase, in 3D"
      deeper: "Go deeper"
    doors:
      parent: /metadax/homeschool/
      tutor: /metadax/tutor/
      teacher: /metadax/teacher/
      trainer: /metadax/trainer/
      researcher: /metadax/research/
      showcase: /metadax/showcases/
deeper:
  - /metadax/
  - /metadax/samples/
version: 1
---
