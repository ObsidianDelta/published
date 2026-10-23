import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const evidenceItem = z.object({
  kind: z.enum(['video', 'sample', 'record', 'number', 'link']),
  src: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  caption: z.object({ en: z.string(), fr: z.string().optional() }),
  source: z.string(),
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
    line: z.object({ en: z.string(), fr: z.string().optional() }),
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
  }).strict(),
});

export const collections = { explain };
