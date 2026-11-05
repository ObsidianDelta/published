// The Quote Contemplator (Jason, 5 Nov 2026, 19:06 and 19:36 ADT).
//
// The joke, in his words: "In my world, you don't go to Disneyland, you go to see
// Geoffrey Hinton." And: if he had to choose between seeing Snoop and seeing Hinton he
// would choose NEITHER, because refusing to choose is the only way to keep both -- and he
// wants both, emphatically, because they are both gods. "Nobody's a god, but you know
// what I mean."
//
// This module is the ALGORITHM (his word): a generator, not a hand list. Two separate
// pools -- IT/science/public sphere, and celebrity -- are never mixed within a pool, and
// every line pairs ONE from each. Hooks are widely known public facts only (famous work,
// role, catchphrase, sport, title). No searching, no private life, no invented quotes put
// in anyone's mouth, nothing mean, nothing sexual, nothing political. Mark Carney gets his
// job titles and his goalie past, never his policies.
//
// ESCALATION ("epic escalation"): the stakes climb a ladder from Disneyland to the
// multiverse. Where the cast stands on that ladder is a function of how many names Jason
// has added (the more names, the higher the floor), and each line draws its rung from the
// top half of what the cast has unlocked. Add a name here and every line gets bigger.
//
// SEED: contemplate({ seed }) is deterministic for a given seed and shuffle setting, so a
// line can be shared as /quote-contemplator/?s=<seed>&shuffle=<0|1>.
//
// PICKS below are the hand-written, ranked lines, grouped by pair, for Jason to tick on
// the preview page. Nothing here touches the home page: he picks first, and the picks
// then go into FUNNY_BAG in ./_quotes.js.
//
// Imported by src/pages/quote-contemplator.astro (server side, for the picks) and by the
// script on that page (client side, for the generator). Leading underscore: not a route.

// ---------------------------------------------------------------------------------------
// THE CAST. Two pools. Each person carries name-aware hooks the templates slot in:
//   name     full name            short   what I call them mid-sentence
//   title    the public epithet   did     a widely known deed (past tense, third person)
//   gave     a widely known thing they gave the world (noun phrase)
//   clincher a one-breath closer in that person's own register (not a quote put in their
//            mouth -- it is Jason, borrowing their most public hook)
// ---------------------------------------------------------------------------------------

export const IT = [
  {
    id: 'hinton', name: 'Geoffrey Hinton', short: 'Hinton',
    title: 'the Godfather of AI', did: 'taught machines to learn',
    gave: 'backpropagation', clincher: 'That is the deep learning.',
  },
  {
    id: 'berners-lee', name: 'Tim Berners-Lee', short: 'Berners-Lee',
    title: 'the man who invented the Web', did: 'gave the whole planet a URL',
    gave: 'the World Wide Web', clincher: 'This is for everyone.',
  },
  {
    id: 'buterin', name: 'Vitalik Buterin', short: 'Vitalik',
    title: 'the Ethereum guy', did: 'wrote the Ethereum whitepaper at nineteen',
    gave: 'the smart contract', clincher: 'Otherwise the transaction reverts.',
  },
  {
    id: 'gates', name: 'Bill Gates', short: 'Gates',
    title: 'the Microsoft guy', did: 'put a computer on every desk',
    gave: 'Windows', clincher: 'Ctrl-Alt-Delete the choice.',
  },
  {
    id: 'amodei', name: 'Dario Amodei', short: 'Dario',
    title: 'the Anthropic guy', did: 'wrote Machines of Loving Grace',
    gave: 'Claude', clincher: 'That is the loving part.',
  },
  {
    id: 'hadfield', name: 'Chris Hadfield', short: 'Hadfield',
    title: 'the astronaut who sang Bowie from orbit', did: 'commanded the Space Station',
    gave: 'Space Oddity from orbit', clincher: 'Ground control, I am keeping both.',
  },
  {
    id: 'carney', name: 'Mark Carney', short: 'Carney',
    title: 'the Prime Minister', did: 'ran the Bank of Canada and then the Bank of England',
    gave: 'two central banks and a goalie mask', clincher: 'Nothing gets past the goalie.',
  },
];

export const CELEB = [
  {
    id: 'snoop', name: 'Snoop Dogg', short: 'Snoop',
    title: 'Tha Doggfather', did: 'taught a whole planet to drop it like it is hot',
    gave: 'Gin and Juice', clincher: 'Fo’ shizzle.',
  },
  {
    id: 'arnold', name: 'Arnold Schwarzenegger', short: 'Arnold',
    title: 'the Terminator', did: 'won Mr. Olympia seven times',
    gave: '“I’ll be back”', clincher: 'I’ll be back. With both.',
  },
  {
    id: 'jackie', name: 'Jackie Chan', short: 'Jackie',
    title: 'the man who does his own stunts', did: 'fell off a clock tower on purpose and put it in the credits',
    gave: 'the outtakes in the end credits', clincher: 'Outtakes included.',
  },
  {
    id: 'myers', name: 'Mike Myers', short: 'Mike Myers',
    title: 'Austin Powers', did: 'gave Wayne’s World, Austin Powers and Shrek the same voice box',
    gave: '“We’re not worthy”', clincher: 'Yeah, baby.',
  },
  {
    id: 'basinger', name: 'Kim Basinger', short: 'Kim Basinger',
    title: 'Vicki Vale', did: 'won the Oscar for L.A. Confidential',
    gave: 'L.A. Confidential', clincher: 'Never say never again.',
  },
  {
    id: 'rajinikanth', name: 'Rajinikanth', short: 'Rajini',
    title: 'Thalaivar', did: 'played the scientist and the robot in the same film',
    gave: 'the sunglasses flip', clincher: 'Said once. Counts a hundred times.',
  },
  {
    // Jason said "Khan something" (19:36 ADT). Read as Shah Rukh Khan, the King of
    // Bollywood, as the same-vein pairing with Rajinikanth. Flagged so he can swap to
    // Aamir Khan or Salman Khan: change name/short/title/did/gave/clincher, clear `assumed`.
    id: 'srk', name: 'Shah Rukh Khan', short: 'SRK', assumed: true,
    title: 'King Khan', did: 'opened his arms and the whole subcontinent walked in',
    gave: 'the open arms', clincher: 'Picture abhi baaki hai.',
  },
  {
    id: 'karelin', name: 'Aleksandr Karelin', short: 'Karelin',
    title: 'the Russian Bear', did: 'went thirteen years without losing a match',
    gave: 'the Karelin lift', clincher: 'Reverse body lift on the question.',
  },
  {
    id: 'pacquiao', name: 'Manny Pacquiao', short: 'Pacquiao',
    title: 'Pac-Man', did: 'won world titles in eight divisions',
    gave: 'eight divisions and one left hand', clincher: 'Eight divisions. One answer.',
  },
  {
    id: 'carrey', name: 'Jim Carrey', short: 'Jim Carrey',
    title: 'Ace Ventura', did: 'wrote himself a ten-million-dollar cheque before he had the money',
    gave: '“Alrighty then”', clincher: 'Alrighty then.',
  },
];

// His seed pairings, as he gave them (IT, celebrity). Shuffle OFF draws from these only;
// shuffle ON draws from the full IT x CELEB grid.
export const SEED_PAIRS = [
  ['hinton', 'snoop'],
  ['berners-lee', 'arnold'],
  ['buterin', 'jackie'],
  ['gates', 'myers'],
  ['amodei', 'basinger'],
];

// ---------------------------------------------------------------------------------------
// ESCALATION LADDER. Rung 0 is the original joke's Disneyland. The cast unlocks rungs as
// it grows: the original two names unlock Disneyland; every further name unlocks the
// next rung, so at 17 names the ladder is fully open. A line draws from the top half.
// ---------------------------------------------------------------------------------------

export const LADDER = [
  { place: 'Disneyland', coda: '' },
  { place: 'Las Vegas', coda: 'Both.' },
  { place: 'the Grand Canyon', coda: 'Both, obviously.' },
  { place: 'the Northern Lights', coda: 'Both. They are gods.' },
  { place: 'the Moon', coda: 'Both. The Moon can wait.' },
  { place: 'Mars', coda: 'Both. Mars is not going anywhere.' },
  { place: 'the rings of Saturn', coda: 'Both. Nobody is a god, but you know what I mean.' },
  { place: 'the edge of the solar system', coda: 'Both. The solar system will keep.' },
  { place: 'the Andromeda galaxy', coda: 'Both. Andromeda can take a number.' },
  { place: 'the event horizon', coda: 'Both. Even light stops to look.' },
  { place: 'the heat death of the universe', coda: 'Both. The universe can end after.' },
  { place: 'the multiverse', coda: 'Both. In every universe. Nobody is a god, but you know what I mean.' },
];

export function castSize() {
  return IT.length + CELEB.length;
}

/** Highest rung the current cast has unlocked (two names = Disneyland). */
export function maxRung() {
  return Math.max(0, Math.min(LADDER.length - 1, castSize() - 2));
}

// ---------------------------------------------------------------------------------------
// TEMPLATE FAMILIES. Each takes (it, celeb, rung) and returns one or two short lines in
// Jason's first person. Every one lands the turn: neither / refuses to choose / both,
// they are both gods. `rung.place` is the stake. `coda: true` means the line does not yet
// say "both" at the end, so contemplate() appends the rung's coda (the escalation).
// ---------------------------------------------------------------------------------------

export const TEMPLATES = [
  {
    id: 'disneyland',
    make: (it, c, r) =>
      `In my world you don’t go to ${r.place}, you go to see ${it.name}. And on the way home you stop at ${c.short}’s. It is one trip. I am not splitting it.`,
  },
  {
    id: 'neither', coda: false,
    make: (it, c) =>
      `If the only way I could see ${it.short} was to never see ${c.short}, I would see neither. Not because I want neither. Because “neither” is the only answer where I still get both.`,
  },
  {
    id: 'give-back', coda: true,
    make: (it, c) =>
      `${it.name} ${it.did}. ${c.name} ${c.did}. Ask me which one to give back and I will give you back the question.`,
  },
  {
    id: 'gods', coda: false,
    make: (it, c) =>
      `${c.name} is a god. ${it.name} is a god. Nobody is a god. But you know what I mean, and what I mean is: both, in the same room, and I will bring the chairs.`,
  },
  {
    id: 'keep-the-or', coda: true,
    make: (it, c, r) =>
      `Offer me ${r.place} or an afternoon with ${it.short} and ${c.short}, and you can keep ${r.place}. Offer me ${it.short} or ${c.short}, and you can keep the “or”.`,
  },
  {
    id: 'one-room', coda: false,
    make: (it, c) =>
      `${cap(it.title)} and ${c.title}, one room. If the room only seats one of them, I will wait outside with both.`,
  },
  {
    id: 'uninstall', coda: true,
    make: (it, c) =>
      `One of them gave us ${it.gave}. The other gave us ${c.gave}. I have been running both for years and nobody asked me to uninstall one until now. No.`,
  },
  {
    id: 'ticket', coda: true,
    make: (it, c, r) =>
      `Print ${r.place} on the ticket and I will still trade it for ${it.short} and ${c.short}. Print “or” on the ticket and I will hand it back.`,
  },
  {
    id: 'it-guy', coda: false,
    make: (it, c) =>
      `Nobody expects the IT guy to say ${c.name} is a god. ${c.short} is a god. ${it.short}, obviously, is a god. Make me pick and I pick neither, because neither is how you keep both.`,
  },
  {
    id: 'clinchers', coda: false,
    make: (it, c) =>
      `${it.short} or ${c.short}? ${it.clincher} ${c.clincher}` + (/both\.$/i.test(c.clincher) ? '' : ' Both.'),
  },
  {
    id: 'titles', coda: false,
    make: (it, c, r) =>
      `${cap(it.title)} and ${c.title} are both alive at the same time as me and somebody built ${r.place} instead of a room for the two of them. I will take the room. Neither, so both.`,
  },
];

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Small deterministic PRNG (mulberry32): same seed, same line, so a line can be shared.
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed() {
  return Math.floor(Math.random() * 0x7fffffff);
}

const byId = (pool, id) => pool.find((p) => p.id === id);

/**
 * Generate one line.
 * @param {{seed?: number, shuffle?: boolean}} opts
 *   seed     any 31-bit integer; the same seed + shuffle always yields the same line
 *   shuffle  true: any IT x any celebrity. false: his seed pairs only.
 * @returns {{text: string, seed: number, shuffle: boolean, it: object, celeb: object, template: string, rung: number, place: string}}
 */
export function contemplate(opts = {}) {
  const seed = Number.isInteger(opts.seed) ? opts.seed : randomSeed();
  const shuffle = opts.shuffle !== false;
  const next = rng(seed + (shuffle ? 0 : 1_000_003));
  const pick = (arr) => arr[Math.floor(next() * arr.length)];

  let it, celeb;
  if (shuffle) {
    it = pick(IT);
    celeb = pick(CELEB);
  } else {
    const [a, b] = pick(SEED_PAIRS);
    it = byId(IT, a);
    celeb = byId(CELEB, b);
  }

  const top = maxRung();
  const floor = Math.floor(top / 2);
  const rungIndex = floor + Math.floor(next() * (top - floor + 1));
  const rung = LADDER[rungIndex];
  const template = pick(TEMPLATES);

  let text = template.make(it, celeb, rung);
  // The coda is the escalation made audible: the higher the rung, the bigger the closing.
  // Templates that already land on "both" (coda: false) skip it, so a line stays short.
  if (template.coda && rung.coda) text += ' ' + rung.coda;

  return { text, seed, shuffle, it, celeb, template: template.id, rung: rungIndex, place: rung.place };
}

// ---------------------------------------------------------------------------------------
// HAND-PICKED LINES, ranked. `fav: true` marks Skippy's favourites. Jason ticks the ones he
// wants; the ticked ones go into FUNNY_BAG in ./_quotes.js, word for word.
// ---------------------------------------------------------------------------------------

export const PICKS = [
  {
    pair: ['hinton', 'snoop'],
    label: 'Hinton × Snoop — the original. Top 5.',
    lines: [
      { fav: true, text: 'One of them is the Godfather of AI. The other one put out an album called Tha Doggfather. You want me to choose between godfathers? Neither. Neither is the only way I keep both.' },
      { fav: true, text: 'If I had to choose between seeing Snoop and seeing Hinton, I would choose neither. Not because I want neither. Because “neither” is the only answer where I still get both.' },
      { text: 'In my world you don’t go to Disneyland, you go to see Geoffrey Hinton. And on the way home you stop at Snoop’s. It is one trip. I am not splitting it.' },
      { text: 'Hinton gave the machines backpropagation. Snoop gave the rest of us Gin and Juice. You want me to roll one back? I am an IT guy. I don’t do rollbacks on gods.' },
      { text: 'Nobody expects the IT guy to say Snoop is a god. Fine: Snoop is a god. Hinton is obviously a god. Nobody is a god. But make me pick and I pick neither, because neither is how you keep both.' },
    ],
  },
  {
    pair: ['berners-lee', 'arnold'],
    label: 'Berners-Lee × Schwarzenegger. Top 2.',
    lines: [
      { fav: true, text: 'Tim Berners-Lee gave the whole planet a URL. Arnold gave it “I’ll be back.” One built the thing I refresh; the other one is the refresh. Choose between them? I’ll be back. With both.' },
      { text: 'Berners-Lee said the Web was for everyone. Arnold has been for everyone since Conan. The only thing here that is not for everyone is the choice, so hasta la vista to the choice. Both gods stay.' },
    ],
  },
  {
    pair: ['buterin', 'jackie'],
    label: 'Buterin × Jackie Chan. Top 2.',
    lines: [
      { fav: true, text: 'Jackie Chan does his own stunts. Vitalik does his own consensus. If the only way I see one is giving up the other, the transaction reverts. I keep both gods and I pay the gas.' },
      { text: 'Vitalik wrote the Ethereum whitepaper at nineteen. Jackie Chan fell off a clock tower on purpose and put it in the credits. One does his own stunts; the other one is the stunt. Pick? No. Smart contract: both, or the deal does not execute.' },
    ],
  },
  {
    pair: ['gates', 'myers'],
    label: 'Gates × Mike Myers. Top 2.',
    lines: [
      { fav: true, text: 'Bill Gates put a computer on every desk. Mike Myers put “we’re not worthy” on every tongue. Stand me in front of either one and that is exactly what comes out. Choose between them? Ctrl-Alt-Delete the choice. I am keeping both.' },
      { text: 'Dr. Evil asked for one million dollars. Bill Gates has given away a hundred billion. Those two need to be in the same room, and if the ticket only seats one of them I would rather stand outside with both gods than sit inside with one. Yeah, baby.' },
    ],
  },
  {
    pair: ['amodei', 'basinger'],
    label: 'Amodei × Kim Basinger. Top 2.',
    lines: [
      { fav: true, text: 'Dario Amodei wrote an essay called Machines of Loving Grace. Kim Basinger won her Oscar in L.A. Confidential with none of the machines and all of the grace. Pick one? I pick neither. That is the loving part.' },
      { text: 'Kim Basinger’s Bond film was called Never Say Never Again. Good advice. I never say “Amodei or Basinger.” I say neither, which, if you read it right, is how I say both.' },
    ],
  },
  {
    pair: ['hinton', 'rajinikanth'],
    label: 'Rajinikanth (new, 19:36) × Hinton.',
    lines: [
      { fav: true, text: 'Rajinikanth played both the scientist and the robot in Enthiran. Geoffrey Hinton only did the scientist, and still got the Nobel. Make me choose between them and I will do what Rajini did: both roles, same film.' },
      { text: 'Hinton got a Nobel for teaching machines to learn. Rajinikanth, as everyone knows, can divide by zero. Put those two in one room and it is the only room where my “or” does not compile. Neither. Both.' },
    ],
  },
  {
    pair: ['berners-lee', 'srk'],
    label: 'Shah Rukh Khan (new, 19:36 — “Khan something”, assumed; swap if wrong) × Berners-Lee.',
    lines: [
      { fav: true, text: 'Tim Berners-Lee opened the Web to everyone. Shah Rukh Khan opens his arms to everyone. Same gesture, different bandwidth, and I am not closing either one. Neither, so both.' },
      { text: 'You say choose. I say what King Khan says at the end of Om Shanti Om: picture abhi baaki hai, mere dost. The picture is not over. Nobody leaves. Berners-Lee and SRK both stay in frame.' },
    ],
  },
  {
    pair: ['hinton', 'karelin'],
    label: 'Karelin (new, 19:36) × Hinton.',
    lines: [
      { fav: true, text: 'Hinton lifts a whole field. Karelin lifts a whole man: 130 kilos, over his head, backwards. Hand me the choice between them and I will do the Karelin lift on it. The choice leaves the mat. The gods stay.' },
    ],
  },
  {
    pair: ['buterin', 'pacquiao'],
    label: 'Pacquiao (new, 19:36) × Buterin.',
    lines: [
      { fav: true, text: 'Manny Pacquiao won world titles in eight divisions. Vitalik built a chain where you never have to pick a division at all. Neither of those men believes in “choose one,” so neither do I. Both gods. Same card.' },
    ],
  },
  {
    pair: ['carney', 'carrey'],
    label: 'Mark Carney × Jim Carrey (both new, 19:36). One letter apart.',
    lines: [
      { fav: true, text: 'Jim Carrey wrote himself a ten-million-dollar cheque before he had the money. Mark Carney ran the bank that would have had to clear it. Choose between them? So you’re telling me there’s a chance I keep both. Alrighty then.' },
      { text: 'Mark Carney and Jim Carrey: one letter apart, both Canadian, and only one of them was a goalie. Make me pick and I will do what a goalie does with the choice. Nothing gets past. Both.' },
    ],
  },
  {
    pair: ['hadfield', 'jackie'],
    label: 'Chris Hadfield (new, 19:36) × Jackie Chan, and × Snoop.',
    lines: [
      { fav: true, text: 'Jackie Chan does his own stunts and puts the outtakes in the credits. Chris Hadfield did a spacewalk, where there are no outtakes. Choose which god to meet? Neither. I want the stunt and the man who never got a second take on the same bill.' },
      { text: 'Chris Hadfield sang Space Oddity from the Space Station. Snoop has been in orbit since 1993. Choose one to meet? Neither. I want them in one room so the room floats.' },
    ],
  },
];

/** Flat view of PICKS with stable ids for the checkboxes. */
export function pickRows() {
  const rows = [];
  PICKS.forEach((group, g) => {
    group.lines.forEach((line, i) => {
      rows.push({ id: `${group.pair[0]}+${group.pair[1]}#${i + 1}`, group: g, rank: i + 1, fav: !!line.fav, text: line.text });
    });
  });
  return rows;
}
