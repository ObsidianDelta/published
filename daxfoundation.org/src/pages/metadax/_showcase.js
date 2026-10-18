// The six showcase samples: what Meta DAX hands a guide and a learner after a
// few iterations together. Read by /metadax/, /metadax/showcase/ and
// /metadax/homeschool/, so a sample is described in one place.
//
// The pages themselves are static files under public/metadax/showcase/<id>/,
// wrapped from state/metadax/showcase/scenarios/<id>/iter-3.html by the
// staging script that shipped them (state/staging/metadax-site-1005/wrap.mjs).
// Everyone in them is made up. Words: guide, learner, a step ahead, swinging
// leads. Never "role". No titles for people. No dates on the samples.

export const samples = [
  {
    id: '01-megan-liam',
    title: 'The Six-Out Inning',
    guide: 'Megan',
    learner: 'Liam',
    pair: 'Megan, a mom who homeschools, and Liam, 11',
    topic: 'adding fractions with different bottom numbers, through baseball',
    word: 'session',
    scene: 'An inning has six outs, so half an inning is three outs, a third is two, and a half plus a third is five outs: 5/6, not 2/5. Three sessions in, Liam leads the first ten minutes of the fourth, because he knew what 5.2 innings meant before his mom did.',
    forGuide: 'What you need, how it goes, what to say, what to skip, and the slips that are normal.',
    forLearner: 'Box Score Boss: a scoreboard game with the decimal trap built in. No AI in it.',
    home: true,
    swatch: ['#4a7a53', '#b87e2a', '#1878c0', '#d49000'],
  },
  {
    id: '02-priya-mateus',
    title: 'Make Your Case',
    guide: 'Priya',
    learner: 'Mateus',
    pair: 'Priya, an English teacher, and Mateus, 15, eight months in Canada',
    topic: 'a persuasive paragraph: claim, evidence, reasoning',
    word: 'lesson',
    scene: 'He argues brilliantly out loud and writes two lines. Lesson four is the "so what": the reasoning that links the evidence to the claim. Then he teaches Priya five Portuguese false friends, and she uses his list with her other newcomers.',
    forGuide: 'One focus per draft, what to say instead of red ink, a mini exit slip.',
    forLearner: 'Reasoning Rally and True friend or false friend?, on a futsal court.',
    swatch: ['#6b3a5b', '#efe6d8', '#1a8a8a', '#f07a1a'],
  },
  {
    id: '03-dinah-jordan',
    title: 'Within Reach',
    guide: 'Dinah Rexford',
    learner: 'Jordan',
    pair: 'Dinah, who teaches teachers, and Jordan, a first-year Grade 3 teacher',
    topic: 'checking for understanding in the moment; help that fades on purpose',
    word: 'conversation',
    scene: '"Does everyone get it?" Every hand nodded; half the class failed the exit task. Four conversations in, Jordan designs a hinge question with every wrong answer planned for, and teaches Dinah how his students’ families’ work, trap lines and firewood, becomes maths.',
    forGuide: 'Peer to peer, with the real terms: ZPD, contingent support, fading, hinge questions. An observation lens for her next visit.',
    forLearner: 'What would you do next? and Fade it, on a chalkboard.',
    swatch: ['#c9a66b', '#1f6f6f', '#4a5563', '#f2d27a'],
  },
  {
    id: '04-renee-marcus',
    title: 'Everyone in the Room',
    guide: 'Renée',
    learner: 'Marcus',
    pair: 'Renée, a people-and-culture lead, and Marcus, a new engineering manager',
    topic: 'meetings where everyone is heard, across three time zones',
    word: 'check-in',
    scene: '"Manila never speaks up in standup." The standup sat at nine in the morning in Toronto. Written input now counts as speaking, every meeting ends with decisions written down, and in the next retrospective Joy leads, with the format she ran at her last company. Marcus is the learner in that room and says so.',
    forGuide: 'How to coach without taking over, and one line on psychological safety.',
    forLearner: 'A meeting simulator and a playbook he co-writes with the team.',
    swatch: ['#3b3f8f', '#c9b8e8', '#2f3a48', '#ff7a66'],
  },
  {
    id: '05-dave-aisha',
    title: 'First On-Call',
    guide: 'Dave',
    learner: 'Aisha',
    pair: 'Dave, a site reliability engineer, and Aisha, on her first on-call rotation',
    topic: 'handling a live incident; the blameless review',
    word: 'on-call shift',
    scene: 'Her first page alone: checkout errors right after a deploy. She spent twenty-five minutes reading logs for the bug instead of rolling back, and Dave took the terminal. By shift three she rolled back in six minutes and found the bad commit in two, with a tool he had never used. Shift four, she shows him.',
    forGuide: 'How to coach without grabbing the keyboard; the review he wants from her; what he is learning.',
    forLearner: 'Pager Drill, Blame or system?, and a status-update builder.',
    swatch: ['#2b2f33', '#f0a63a', '#0f5e63', '#f5f7f8'],
  },
  {
    id: '06-theo-lucille',
    title: 'Real or Scam?',
    guide: 'Theo',
    learner: 'Lucille',
    pair: 'Theo, 19, and Lucille, 78, his grandmother',
    topic: 'spotting phone, text and email scams',
    word: 'visit',
    scene: 'A caller pretending to be Theo in trouble asked for money. She hung up, because he said "Grandma" and Theo calls her Mémère. Visit four: practice, a family code word, who to tell. Then Lucille teaches Theo how she read a stranger across the hardware-store counter for thirty-five years.',
    forGuide: 'Let her tap, what to set up together, how to praise without talking down.',
    forLearner: 'Vrai ou arnaque? / Real or scam?, in large print, French and English.',
    swatch: ['#3d5fa3', '#f2c230', '#8a7fa8', '#1f6f6f'],
  },
];

export const byId = Object.fromEntries(samples.map((s) => [s.id, s]));
export const home = samples.filter((s) => s.home);
