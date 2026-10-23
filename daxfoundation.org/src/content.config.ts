import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const evidenceItem = z.object({
  kind: z.enum(['video', 'sample', 'record', 'number', 'link']),
  src: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  caption: z.object({ en: z.string(), fr: z.string().optional() }),
  source: z.string(),
});

// An edition's labels: exactly the sampler's label set (13 captions + two lists).
// Lenient here (partial, passthrough) so the deprecated line/paragraph alias can
// synthesise a curious edition from whatever the scene already declares; the real
// completeness check is checkEdition() in validate.ts, run at build time.
const editionLabels = z.object({
  learner: z.string(),
  guide: z.string(),
  classroom: z.string(),
  invert: z.string(),
  both: z.string(),
  change: z.string(),
  decide: z.string(),
  record: z.string(),
  packages: z.string(),
  built: z.string(),
  boundary: z.string(),
  tapChild: z.string(),
  dragGuide: z.string(),
  roles: z.array(z.string()),
  contexts: z.array(z.string()),
}).partial().passthrough();

// A paper: one row of the researcher lens's sixth step ("The papers").
const paper = z.object({ href: z.string(), text: z.string(), src: z.string() });

// One edition = one lens's view of the chapter. The sampler's shape, verbatim,
// plus EXP-11 additions: `papers` (the researcher's sixth step), `signed`/`by`
// (drafts are signed:false, by:"skippy"; the four sampler editions stay
// signed:true, by:"person"). `how`/`proof_intro`/`under` may be the empty string
// (the kid lens omits them; the step hides) -- the real gate is checkEdition().
const edition = z.object({
  voice: z.string(),
  answer: z.string(),
  more: z.string(),
  how: z.string(),
  proof_intro: z.string(),
  under: z.string(),
  buttons: z.object({
    more: z.string(),
    how: z.string(),
    proof: z.string(),
    under: z.string(),
    papers: z.string().optional(),
  }),
  labels: editionLabels,
  papers: z.array(paper).optional(),
  signed: z.boolean().default(false),
  by: z.enum(['person', 'skippy']).default('skippy'),
});

const explain = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/explain' }),
  schema: z.object({
    id: z.string(),
    order: z.number(),
    tense: z.enum(['solved', 'live', 'researched', 'ahead']),
    tenseNote: z.string().optional(),
    claim: z.enum(['problem', 'proof', 'record', 'guide', 'roles', 'five', 'foundation', 'exists']),
    question: z.object({ en: z.string(), fr: z.string().optional() }),
    // The facts every edition of this chapter must hold (the brain's decisions;
    // never reworded). The validator runs a soft key-noun check against them.
    canon: z.array(z.string()).optional(),
    // `editions` is the live content model (one per lens id). `line`/`paragraph`
    // are the deprecated alias: a chapter with no `editions` synthesises
    // editions.curious from them (see chapters.ts). One of the two MUST be present.
    editions: z.record(edition).optional(),
    line: z.object({ en: z.string(), fr: z.string().optional() }).optional(),
    paragraph: z.object({ en: z.string(), fr: z.string().optional() }).optional(),
    evidence: z.array(evidenceItem),
    scene: z.object({
      module: z.string(),
      params: z.record(z.any()).optional(),
      pin: z.number().default(1),
      states: z.array(z.string()).optional(),
    }),
    next: z.string().optional(),
    deeper: z.array(z.string()).optional(),
    version: z.number(),
  }).strict().refine(
    (d) => d.editions !== undefined || d.line !== undefined,
    { message: 'a chapter needs either `editions` or the deprecated `line`' },
  ),
});

export const collections = { explain };
