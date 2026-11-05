// Meta DAX, version 0.0.0.1 (/metadax/epic/), the experiment list (2026-11-04).
//
// Source of truth, in order: the run records under state/metadax/ (EXPERIMENTS-STATUS-
// 20261009, experiments-runs/X13, X13b, X14 RESULTS), the public findings of 18-19
// October as summarised in /writing/fourteen-small-experiments/, the E07 access report
// of 4 November, and the studio run record of 4 November, all as collected in
// out/story/STORY.md section (c). Only real runs carry a verdict. "simulated" = models
// played the people; "deterministic" = a script, no model. "not run" = no result exists,
// whatever any plan says. No experiment has yet had a real human guide or learner.
//
// verdict: pass | caveat | fail | mixed | inconclusive | notrun
// mode:    sim | det | model | none

export const core = [
  { id: 'E01', verdict: 'pass', mode: 'sim',
    en: 'Can a guide build a course, end to end?', fr: 'Un guide peut-il bâtir un cours de bout en bout ?',
    rEn: 'PASS: 5 of 5 nodes validate. No pilot with a person yet.', rFr: 'RÉUSSI : 5 nœuds sur 5 valides. Pas encore d’essai avec une personne.' },
  { id: 'E02', verdict: 'notrun', mode: 'none',
    en: 'The same, on a second AI app?', fr: 'La même chose, avec une deuxième IA ?',
    rEn: 'Not run. Needs a second AI account.', rFr: 'Pas encore lancée. Il faut un deuxième compte d’IA.' },
  { id: 'E03', verdict: 'mixed', mode: 'sim',
    en: 'Does a whole learner session validate?', fr: 'Une séance complète d’apprenant est-elle valide ?',
    rEn: 'FAIL first (44 errors), then PASS for the fixed arm. One session each: a hint, not a result.', rFr: 'ÉCHEC d’abord (44 erreurs), puis RÉUSSI pour la version corrigée. Une séance chacune : un indice, pas un résultat.' },
  { id: 'E04', verdict: 'fail', mode: 'model',
    en: 'Do the prompts pass their own checks?', fr: 'Les consignes passent-elles leurs propres vérifications ?',
    rEn: 'FAIL against the 90% line. The two-AI half has not run.', rFr: 'ÉCHEC sous la barre des 90 %. La moitié à deux IA n’a pas tourné.' },
  { id: 'E05', verdict: 'pass', mode: 'sim',
    en: 'Does the follow-up step reuse what is already there?', fr: 'L’étape de suivi réutilise-t-elle ce qui existe déjà ?',
    rEn: 'Narrow PASS: precision 0.810 against a 0.80 line.', rFr: 'RÉUSSI de justesse : précision 0,810 pour une barre à 0,80.' },
  { id: 'E06', verdict: 'pass', mode: 'det',
    en: 'Does a week’s round trip fit a 50 kbps link?', fr: 'L’aller-retour d’une semaine passe-t-il sur 50 kb/s ?',
    rEn: 'PASS, computed. Not yet measured on a real link.', rFr: 'RÉUSSI, calculé. Pas encore mesuré sur un vrai lien.' },
  { id: 'E07', verdict: 'notrun', mode: 'none',
    en: 'Can a unit be grounded on an open national curriculum (Oak National Academy, UK)?', fr: 'Peut-on ancrer une unité sur un programme national ouvert (Oak National Academy, R.-U.) ?',
    rEn: 'Not run. Waiting on a free account or key. The one missing experiment.', rFr: 'Pas encore lancée. En attente d’un compte ou d’une clé gratuite. L’expérience qui manque.' },
  { id: 'E08', verdict: 'pass', mode: 'sim',
    en: 'Do generated interactive pieces pass an oracle?', fr: 'Les pièces interactives générées passent-elles l’oracle ?',
    rEn: 'PASS on the core, 82 of 82. No browser check yet.', rFr: 'RÉUSSI sur le noyau, 82 sur 82. Pas encore de test en navigateur.' },
  { id: 'E09', verdict: 'caveat', mode: 'sim',
    en: 'Would a parent file the learning record?', fr: 'Un parent déposerait-il le dossier d’apprentissage ?',
    rEn: 'PASS with a caveat: 5 of 6.', rFr: 'RÉUSSI avec réserve : 5 sur 6.' },
  { id: 'E10', verdict: 'notrun', mode: 'none',
    en: 'Can a small model on a phone run the quiz?', fr: 'Un petit modèle sur un téléphone peut-il faire passer le quiz ?',
    rEn: 'Not run. Needs a small-model runtime.', rFr: 'Pas encore lancée. Il faut un moteur pour petit modèle.' },
  { id: 'E11', verdict: 'pass', mode: 'sim',
    en: 'Can a companion read a learner’s record unchanged?', fr: 'Un compagnon peut-il lire le dossier d’un apprenant sans le changer ?',
    rEn: 'PASS: 14 of 15 recalled.', rFr: 'RÉUSSI : 14 sur 15 retrouvés.' },
  { id: 'E12', verdict: 'pass', mode: 'det',
    en: 'Can a signed chain of where things came from be checked later?', fr: 'Peut-on vérifier plus tard une chaîne signée de provenance ?',
    rEn: 'PASS: 12 of 12. 11 tampers caught.', rFr: 'RÉUSSI : 12 sur 12. 11 falsifications détectées.' },
  { id: 'E13', verdict: 'inconclusive', mode: 'sim',
    en: 'Can a teaching-method variant be made and checked?', fr: 'Peut-on créer et vérifier une variante de méthode d’enseignement ?',
    rEn: 'INCONCLUSIVE: the expert review has not run.', rFr: 'NON CONCLUANT : la revue par un expert n’a pas eu lieu.' },
  { id: 'E14', verdict: 'fail', mode: 'sim',
    en: 'Does the age wall hold?', fr: 'Le contrôle d’âge tient-il ?',
    rEn: 'FAIL, twice. One opener still gets through. Adults only, for now.', rFr: 'ÉCHEC, deux fois. Une entrée passe encore. Adultes seulement, pour l’instant.' },
];

export const extension = [
  { id: 'X01', verdict: 'inconclusive', mode: 'sim', en: 'Does a technique carry across subject and language?', fr: 'Une technique passe-t-elle d’une matière et d’une langue à l’autre ?', rEn: 'INCONCLUSIVE.', rFr: 'NON CONCLUANT.' },
  { id: 'X02', verdict: 'pass', mode: 'sim', en: 'Do the federation fixes hold?', fr: 'Les correctifs de fédération tiennent-ils ?', rEn: 'PASS: conflicts down 83%.', rFr: 'RÉUSSI : conflits en baisse de 83 %.' },
  { id: 'X03', verdict: 'caveat', mode: 'sim', en: 'Can a guide’s own changes be kept?', fr: 'Peut-on garder les changements propres au guide ?', rEn: 'PASS with a caveat: review missed a planted omission.', rFr: 'RÉUSSI avec réserve : la revue a manqué un oubli planté.' },
  { id: 'X04', verdict: 'inconclusive', mode: 'sim', en: 'Does one stall leave only one hole?', fr: 'Un blocage ne laisse-t-il qu’un seul trou ?', rEn: 'INCONCLUSIVE.', rFr: 'NON CONCLUANT.' },
  { id: 'X05', verdict: 'inconclusive', mode: 'sim', en: 'Does a blind rubric match what learners flag?', fr: 'Une grille à l’aveugle rejoint-elle ce que signalent les apprenants ?', rEn: 'INCONCLUSIVE.', rFr: 'NON CONCLUANT.' },
  { id: 'X06', verdict: 'pass', mode: 'sim', en: 'Can one course serve every bandwidth?', fr: 'Un seul cours peut-il servir tous les débits ?', rEn: 'PASS: a week is 7% of the allowance.', rFr: 'RÉUSSI : une semaine, c’est 7 % du forfait.' },
  { id: 'X07', verdict: 'inconclusive', mode: 'none', en: 'Can a small offline model run the quiz?', fr: 'Un petit modèle hors ligne peut-il faire passer le quiz ?', rEn: 'INCONCLUSIVE: harness only, no real model ran.', rFr: 'NON CONCLUANT : banc d’essai seulement, aucun vrai modèle.' },
  { id: 'X08', verdict: 'fail', mode: 'sim', en: 'Does an outward gate stop private content leaking?', fr: 'Une barrière de sortie empêche-t-elle les fuites ?', rEn: 'FAIL (0 of 10 caught), then INCONCLUSIVE.', rFr: 'ÉCHEC (0 sur 10), puis NON CONCLUANT.' },
  { id: 'X09', verdict: 'pass', mode: 'det', en: 'Does an append-only log beat editing in place?', fr: 'Un journal en ajout seul bat-il la modification sur place ?', rEn: 'PASS: 18 of 20 silent rewrites caught, against 0.', rFr: 'RÉUSSI : 18 réécritures silencieuses sur 20 détectées, contre 0.' },
  { id: 'X10', verdict: 'pass', mode: 'sim', en: 'Can one record hold many years, and honour a no?', fr: 'Un dossier peut-il tenir des années et respecter un refus ?', rEn: 'PASS.', rFr: 'RÉUSSI.' },
  { id: 'X11', verdict: 'inconclusive', mode: 'sim', en: 'Can what is missing be measured without steering?', fr: 'Peut-on mesurer ce qui manque sans orienter ?', rEn: 'INCONCLUSIVE, one firm negative.', rFr: 'NON CONCLUANT, un net résultat négatif.' },
  { id: 'X12', verdict: 'notrun', mode: 'none', en: 'The capstone: every scene, together.', fr: 'La clé de voûte : toutes les scènes ensemble.', rEn: 'Not run.', rFr: 'Pas encore lancée.' },
  { id: 'X13', verdict: 'fail', mode: 'sim', en: 'A small fast model first, a large one only when needed?', fr: 'Un petit modèle rapide d’abord, un grand seulement au besoin ?', rEn: 'Proved nothing, then an honest FAIL on a harder rebuild (X13b).', rFr: 'N’a rien prouvé, puis un ÉCHEC honnête sur une version plus dure (X13b).' },
  { id: 'X14', verdict: 'pass', mode: 'sim', en: 'Fetch the spot, not the whole course?', fr: 'Aller chercher le passage, pas tout le cours ?', rEn: 'PASS: same quality, tokens per turn flat as the library grows.', rFr: 'RÉUSSI : même qualité, coût par tour stable quand la bibliothèque grandit.' },
];

export const newest = [
  { id: 'S1', verdict: 'caveat', mode: 'sim', en: 'Studio run 1 (4 Nov): subject and learner in, a checked course out?', fr: 'Atelier, essai 1 (4 nov.) : une matière et un apprenant, un cours vérifié ?', rEn: 'PASS on 12 of 12 steps. Run exactly as our public prompt reads, one step fails: a real bug, now on the list. The guide’s review caught a mistake the checker missed.', rFr: 'RÉUSSI sur 12 étapes sur 12. Lancée mot pour mot selon notre consigne publique, une étape échoue : un vrai bogue, noté. La revue du guide a attrapé une erreur que le vérificateur avait laissée passer.' },
];

export const all = [...core, ...extension, ...newest];

export const VERDICT = {
  pass: { en: 'Pass', fr: 'Réussi' },
  caveat: { en: 'Pass, with a caveat', fr: 'Réussi, avec réserve' },
  mixed: { en: 'Fail, then pass', fr: 'Échec, puis réussi' },
  fail: { en: 'Fail', fr: 'Échec' },
  inconclusive: { en: 'Inconclusive', fr: 'Non concluant' },
  notrun: { en: 'Not yet run', fr: 'Pas encore lancée' },
};

export const MODE = {
  sim: { en: 'simulated', fr: 'simulée' },
  det: { en: 'deterministic', fr: 'déterministe' },
  model: { en: 'model runs', fr: 'essais de modèle' },
  none: { en: '', fr: '' },
};

// The tally the page states. Counted from `core` above, not typed by hand.
export const tally = {
  designed: core.length,
  run: core.filter((e) => e.verdict !== 'notrun').length,
  notRun: core.filter((e) => e.verdict === 'notrun').length,
  withPeople: 0,
};

// A small seeded generator for the build-time pictures (the reduced-motion stills),
// so every build draws the same network.
export function seeded(seed = 7) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
