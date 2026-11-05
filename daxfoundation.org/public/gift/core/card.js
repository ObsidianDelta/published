// Every share is a Re UI card: an od-experience/cards@2 card (packages/od-cards), validated with
// the same validator the sidecar uses, rendered at the five depths of the sim-to-cards contract
// (glance -> message -> why -> stages -> everything). Public rung, no `said` (nobody's words are
// quoted), every reasoning node cited (R3).

import { validateCard, SCHEMA } from '../vendor/od-cards.js';
import { letterById } from './catalog.js';

const clamp01 = (x) => Math.max(0, Math.min(1, x));

/** build the card. `t` is the translator for the viewer's language. */
export function toCard(exp, result, id, t) {
  const L = (ids) => ids.map((l) => t('letter.' + l)).join(' · ');
  const q = exp.q.startsWith('q.') ? t(exp.q) : exp.q;
  const sources = result.sources.map((s) => (s.family === 'personal' ? (s.text || (s.id ? t('item.' + s.id) : t('kind.' + s.k))) : s.label)).join(' + ');
  const chords = result.chords.join('–');
  const harmonic = result.sources.filter((s) => s.attribution);
  const top = result.fan[0] ? result.fan[0].share : 0.5;

  const canon = [
    ...harmonic.map((s) => s.attribution),
    `${t('stage.emotions')}: ${L(result.letters)}`,
  ];
  const tree = [
    ...harmonic.map((s) => ({ text: `${s.label}: ${s.chords.join('–')}`, cite: { label: s.cite.label, ref: s.cite.ref } })),
    ...result.letters.map((l) => ({ text: `${t('letter.' + l)}: ${letterById(l).home.join(' ')}`, cite: { label: 'LOVE-VOCAB-v0', ref: l } })),
  ];
  if (!harmonic.length) tree.unshift({ text: sources, cite: { label: 'your experiment', ref: 'source' } });

  const why = harmonic.length
    ? t('card.why', { attr: harmonic.map((s) => s.attribution).join('; ') })
    : t('card.why.personal', { sources });
  const stages = result.stages.filter((s) => s !== 'result').map((s) => t('stage.' + s)).join(' → ');
  const everything = [
    `${t('stage.chords')}: ${chords}`,
    `${t('stage.notes')}: ${result.notes.filter((n) => n.part !== 'hum').length} · ${result.seconds}s · ${result.sound.bpm} bpm · ${t('tb.' + result.sound.tb)} · ${t('tense.' + result.sound.tense)}`,
    exp.parent ? t('card.remix', { parent: exp.parent, gen: exp.gen }) : '',
    t('app.credits'),
  ].filter(Boolean).join('\n');

  const card = {
    schema: SCHEMA,
    uid: `gift/exp/${id}`,
    rev: 1,
    kind: 'cta',
    entity: 'daxfoundation.org:gift',
    scope: { tenant: 'daxfoundation.org', rung: 'public' },
    title: q,
    tags: ['gift', 'experiment', ...result.letters.map((l) => 'letter:' + l), ...result.sources.map((s) => 'source:' + s.k)],
    dims: {
      urgency: 0.1,
      temporal: clamp01(exp.gen / 10),
      emergence: clamp01(result.letters.length / 3),
      impact: clamp01(0.3 + 0.1 * result.sources.length),
      attention: clamp01(Math.max(0.1, result.letters.length / 3)),
      probability: clamp01(top),
    },
    why: { reason: why, canon, tree },
    versions: {
      default: {
        by: 'person',
        text: {
          answer: t('card.glance', { q, letters: L(result.letters) }),
          more: t('card.message', { sources, chords, letters: L(result.letters), tense: cap(t('tense.' + result.sound.tense)) }),
          how: t('card.how', { stages }),
          proof_intro: everything,
        },
      },
    },
  };
  if (exp.parent) card.annotates = `gift/exp/${exp.parent}`;
  return card;
}

const cap = (s) => (s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : s);

/** a template experiment's card (state/gift/experiments): the library's title and credits, the
    letters its transforms read, and the stages it ran. */
export function toTemplateCard(template, payload, sum, res, id, t) {
  const L = (ids) => ids.map((l) => t('letter.' + l)).join(' · ');
  const chords = sum.harmony || sum.chords.join('–');
  const canon = [...sum.credits.map((c) => c.text), `${t('stage.emotions')}: ${L(sum.letters)}`];
  const tree = [
    ...sum.credits.map((c, i) => ({ text: c.text, cite: { label: 'state/gift/catalog', ref: `${template.id}#credit-${i}` } })),
    ...sum.letters.map((l) => ({ text: t('letter.' + l), cite: { label: 'state/gift/experiments', ref: `${template.id}#${l}` } })),
  ];
  const stagesRun = template.stages.filter((s) => !s.bonus || payload.u.includes(s.bonus)).map((s) => s.prompt).join(' → ');
  const card = {
    schema: SCHEMA,
    uid: `gift/exp/${id}`,
    rev: 1,
    kind: 'cta',
    entity: 'daxfoundation.org:gift',
    scope: { tenant: 'daxfoundation.org', rung: 'public' },
    title: template.title,
    tags: ['gift', 'experiment', 'template:' + template.id, ...sum.letters.map((l) => 'letter:' + l), 'source:' + template.source.type],
    dims: {
      urgency: 0.1,
      temporal: clamp01(payload.gen / 10),
      emergence: clamp01(sum.letters.length / 3),
      impact: clamp01(template.depth / 5),
      attention: clamp01(Math.max(0.1, sum.letters.length / 3)),
      probability: clamp01(sum.emotion ? Math.max(...Object.values(sum.emotion)) : 0.5),
    },
    why: { reason: sum.credits.length ? t('card.why', { attr: sum.credits.map((c) => c.text).join('; ') }) : t('card.why.personal', { sources: template.title }), canon, tree },
    versions: {
      default: {
        by: 'person',
        text: {
          answer: t('card.glance', { q: template.title, letters: L(sum.letters) }),
          more: t('card.message', { sources: template.source.label, chords, letters: L(sum.letters), tense: cap(t('tense.' + sum.tense)) }),
          how: t('card.how', { stages: stagesRun }),
          proof_intro: [`${t('stage.chords')}: ${chords}`, `${res.seconds}s · ${res.sound.bpm} bpm`, payload.parent ? t('card.remix', { parent: payload.parent, gen: payload.gen }) : '', t('app.credits')].filter(Boolean).join('\n'),
        },
      },
    },
  };
  if (payload.parent) card.annotates = `gift/exp/${payload.parent}`;
  return card;
}

export function checkCard(card) {
  return validateCard(card, { mode: 'sidecar' });
}

/** the five depths, as the UI shows them (glance first; each fold opens the next). */
export function depthsOf(card) {
  const v = card.versions.default.text;
  return [v.answer, v.more, card.why.reason, v.how, v.proof_intro];
}
