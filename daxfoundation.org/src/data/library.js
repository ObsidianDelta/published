// The one library registry for daxfoundation.org.
//
// Everything public that Meta DAX has built lives in this list once: the
// immersive showcases, the player kits and their editions, the six family
// pages (three steps in), the homeschool sample packages, and the run
// reports. Every page that lists the work reads from here, so a new showcase
// lands in one place and shows up everywhere -- the home row, the hub counts,
// the library index, the chair strips and the sitemap. Nothing gets buried
// because one page forgot to add it (PUBLISH-1018 D3; Jason, 18 Oct: "give
// people the guidance to pick a lane").
//
// kinds:
//   'showcase'  an immersive page you open and work through
//   'kit'       a player package with its own showcase page
//   'edition'   a kit remade for one particular learner
//   'family'    one of the six "three steps in" pages (from _showcase.js)
//   'sample'    one of the homeschool sample packages (/metadax/samples/)
//   'run'       an experiment run report
//
// chairs are drawn from: 'parent','tutor','teacher','trainer','researcher'.
// `date` is the first-publish date and never changes. Words: guide, learner,
// never "role"; a way, never the way; no AI vendor named; no prices.
//
// The family pages come from _showcase.js (imported, never duplicated) and the
// sample packages from metadax-samples.json (the same file /metadax/samples/
// renders), so those two sets cannot drift from what actually ships.

import { samples as familySamples } from '../pages/metadax/_showcase.js';
import sampleData from './metadax-samples.json';

const METADAX_REPO = 'https://github.com/daxfoundation/metadax';

// The hand-authored half: showcases, kits, one edition, and the run report.
const curated = [
  {
    id: 'stockage-imbrique',
    kind: 'kit',
    title: 'Systèmes de fichiers imbriqués',
    url: '/metadax/showcases/stockage-imbrique/',
    play: '/metadax/play/?sample=stockage-imbrique',
    lang: 'fr',
    subject: 'virtualized storage in Proxmox VE for a second-year networking course',
    chairs: ['teacher', 'trainer'],
    date: '2026-10-15',
    note: 'Virtualized storage in Proxmox VE, written in French for networking students: six 3D scenes, a configuration simulation and a bilingual lexicon.',
    home: true,
  },
  {
    id: 'words-into-algebra',
    kind: 'kit',
    title: 'Words into Algebra',
    url: '/metadax/showcases/words-into-algebra/',
    play: '/metadax/play/?sample=words-into-algebra',
    lang: 'en',
    subject: 'turning sentences into equations',
    chairs: ['tutor', 'parent', 'teacher'],
    date: '2026-10-14',
    note: "A tutor's kit for turning sentences into equations: five interactive 3D scenes, three routes for the time you have, and a pause before every example.",
    home: true,
  },
  {
    id: 'words-into-algebra-nova',
    kind: 'edition',
    title: "Words into Algebra: Nova's Edition",
    url: '/metadax/showcases/words-into-algebra/#editions',
    play: '/metadax/play/?sample=words-into-algebra-nova',
    lang: 'en',
    subject: 'the same five equations in a 15-year-old’s space world',
    chairs: ['tutor'],
    date: '2026-10-14',
    note: "The same five equations, remade in a 15-year-old's space world: what stayed, what changed.",
  },
  {
    id: 'tamil-chicken-curry',
    kind: 'showcase',
    title: 'One dish, its story',
    url: '/metadax/showcases/tamil-chicken-curry/',
    play: '/metadax/play/?sample=tamil-chicken-curry',
    lang: 'ta+en',
    subject: 'a Jaffna chicken curry, its story and its science',
    chairs: ['parent', 'tutor'],
    date: '2026-10-11',
    note: 'A Jaffna curry in a 3D kitchen, Tamil & English, read by someone from the community.',
    home: true,
  },
  {
    id: 'grade-6-science-year',
    kind: 'showcase',
    title: 'The Year on the Wall',
    url: '/metadax/showcases/grade-6-science-year/',
    lang: 'en',
    subject: 'a whole Grade 6 science year',
    chairs: ['teacher'],
    date: '2026-10-10',
    note: 'A whole Grade 6 science year from one brief: 36 weeks mapped, misconceptions named, one week built in full.',
    home: true,
  },
  {
    id: 'proton-mill',
    kind: 'showcase',
    title: 'The Proton Mill',
    url: '/metadax/showcases/proton-mill/',
    lang: 'en',
    subject: 'a 3D Biology 101 lesson',
    chairs: ['teacher', 'trainer'],
    date: '2026-10-10',
    note: 'A 3D Biology 101 lesson on how mitochondria make ATP, with instructor notes.',
    home: true,
  },
  {
    id: 'tutors-desk',
    kind: 'showcase',
    title: "The Tutor's Desk",
    url: '/metadax/showcases/tutors-desk/',
    lang: 'en',
    subject: "one tutor's week",
    chairs: ['tutor'],
    date: '2026-10-10',
    note: "One tutor's week: rough notes, a parent-ready report, and the guide coach on a real problem.",
    home: true,
  },
  {
    id: 'first-week-at-the-bakery',
    kind: 'showcase',
    title: 'First Week at the Bakery',
    url: '/metadax/showcases/first-week-at-the-bakery/',
    lang: 'en',
    subject: 'a staff onboarding module',
    chairs: ['trainer'],
    date: '2026-10-10',
    note: 'A staff onboarding module made from a one-page brief.',
    home: true,
  },
  {
    id: 'stade-des-fractions',
    kind: 'showcase',
    title: 'Le Stade des Fractions',
    url: '/metadax/samples/stade-des-fractions/',
    play: '/metadax/play/?sample=stade',
    lang: 'fr',
    subject: 'French fractions in a 3D stadium',
    chairs: ['parent', 'tutor'],
    date: '2026-10-09',
    note: 'French fractions in a 3D stadium.',
    home: true,
  },
  {
    id: 'newton-laws-test-run',
    kind: 'run',
    title: "Newton's Laws Test Run",
    url: 'https://claude.ai/artifact/Nv4j2tpPh9PidXvLiAaP31',
    external: true,
    lang: 'en',
    subject: "Newton's laws of motion",
    chairs: ['teacher', 'trainer', 'researcher'],
    date: '2026-09-28',
    note: 'The first thing the recipe built: a 21-page introductory course on Newton’s laws, a simulated learner’s session, the teacher’s twelve-stage workflow, and three interactive labs (Glide, Push, Push apart). Report, 28 September 2026; the learner was simulated.',
    repo: `${METADAX_REPO}/tree/main/experiments/E01/results`,
  },
];

// The six family pages, from _showcase.js. The chair and language are the two
// facts the registry adds; everything else is read from the sample itself.
const familyMeta = {
  '01-megan-liam': { chairs: ['parent'], lang: 'en' },
  '02-priya-mateus': { chairs: ['teacher'], lang: 'en' },
  '03-dinah-jordan': { chairs: ['teacher'], lang: 'en' },
  '04-renee-marcus': { chairs: ['trainer'], lang: 'en' },
  '05-dave-aisha': { chairs: ['trainer'], lang: 'en' },
  '06-theo-lucille': { chairs: ['parent'], lang: 'fr+en' },
};

const family = familySamples.map((s) => ({
  id: s.id,
  kind: 'family',
  title: s.title,
  url: `/metadax/showcase/${s.id}/`,
  lang: familyMeta[s.id]?.lang || 'en',
  subject: s.topic,
  guide: s.guide,
  learner: s.learner,
  chairs: familyMeta[s.id]?.chairs || [],
  date: '2026-10-05',
  note: s.topic[0].toUpperCase() + s.topic.slice(1) + '.',
}));

// The homeschool sample packages, from the same JSON /metadax/samples/ renders
// inline. The Stade package is represented as the stade-des-fractions showcase
// above (its own page), so it is not repeated here.
const samples = sampleData.samples
  .filter((s) => s.id !== 'math-fractions-stade-3d')
  .map((s) => ({
    id: s.id,
    kind: 'sample',
    title: (s.title || s.id).replace(/\s+—\s+a Meta DAX homeschool sample$/, ''),
    url: `/metadax/samples/#${s.id}`,
    lang: 'en',
    subject: s.subject,
    chairs: ['parent'],
    date: '2026-10-09',
    note: s.stuck || '',
    repo: `${METADAX_REPO}/blob/main/${s.path}`,
  }));

export const library = [...curated, ...family, ...samples];

const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

/** Everything of one kind, newest first. */
export const byKind = (kind) =>
  library.filter((e) => e.kind === kind).sort(byDateDesc);

/** Everything built for one chair, newest first. */
export const byChair = (chair) =>
  library.filter((e) => Array.isArray(e.chairs) && e.chairs.includes(chair)).sort(byDateDesc);

/** The newest n entries across every kind. */
export const newest = (n) => [...library].sort(byDateDesc).slice(0, n);

/** The entries that belong on the home "See it" row, newest first. */
export const home = () => library.filter((e) => e.home).sort(byDateDesc);
