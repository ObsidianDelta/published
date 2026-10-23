import { getCollection } from 'astro:content';
import { validateScenes, checkEdition, STRICT } from './validate.js';

type LangMap = { en: string; fr?: string };

function trimLang(obj: LangMap | undefined): { en: string; fr?: string } | undefined {
  if (!obj) return undefined;
  return obj.fr !== undefined ? { en: obj.en, fr: obj.fr } : { en: obj.en };
}

// The lens ids for now (EXP-8a). A missing lens falls back to curious in the UI;
// curious is always present (synthesised from the deprecated alias when needed).
export const LENSES = ['curious', 'teacher', 'parent', 'builder'] as const;
export type Lens = (typeof LENSES)[number];

export interface Edition {
  voice: string;
  answer: string;
  more: string;
  how: string;
  proof_intro: string;
  under: string;
  buttons: { more: string; how: string; proof: string; under: string };
  labels: Record<string, string | string[]>;
  signed: boolean;
}

// Buttons the alias uses when a chapter has no editions of its own.
const ALIAS_BUTTONS = {
  more: 'Tell me more',
  how: 'How does it work today?',
  proof: 'Show me the proof',
  under: "What's underneath all this?",
};

/**
 * The editions map for a chapter, keyed by lens id. If the chapter declares
 * `editions`, those are used verbatim. Otherwise editions.curious is synthesised
 * from the deprecated `line`/`paragraph` alias: line.en -> answer, paragraph.en ->
 * more, how/proof_intro/under empty, buttons defaulted, labels from the scene's
 * params.labels where present, signed false. Every edition is run through
 * checkEdition at build: a forbidden string throws; any other miss warns.
 */
export function buildEditions(data: Record<string, any>, id = '?'): Record<string, Edition> {
  let editions: Record<string, Edition>;
  if (data.editions && data.editions.curious) {
    editions = data.editions as Record<string, Edition>;
  } else {
    const sceneLabels = (data.scene?.params?.labels ?? {}) as Record<string, string | string[]>;
    editions = {
      curious: {
        voice: '',
        answer: data.line?.en ?? '',
        more: data.paragraph?.en ?? '',
        how: '',
        proof_intro: '',
        under: '',
        buttons: { ...ALIAS_BUTTONS },
        labels: { ...sceneLabels },
        signed: false,
      },
    };
  }
  for (const [lens, ed] of Object.entries(editions)) {
    const r = checkEdition(ed);
    if (r.ok) continue;
    const where = `${id} · ${lens}`;
    if (r.forbidden) throw new Error(`[explain] forbidden string in edition ${where}: ${r.why}`);
    if (STRICT) throw new Error(`[explain] edition ${where} failed checks: ${r.why}`);
    console.warn(`[explain] edition ${where} incomplete: ${r.why}`);
  }
  return editions;
}

export async function getCollectionChapters(collection: string) {
  const all = await getCollection('explain');
  const entries = all.filter(e => e.id.startsWith(collection + '/'));
  validateScenes(entries as { data: { scene?: { module?: string } } }[]);
  const sorted = [...entries].sort((a, b) => (a.data.order as number) - (b.data.order as number));
  return sorted.map((entry, i) => {
    const id = entry.data.id as string;
    const url =
      collection === 'foundation'
        ? '/explain/'
        : `/explain/${collection}/${id}/`;
    const editions = buildEditions(entry.data as Record<string, any>, entry.id);
    // The next chapter in reading order, for the "Next question:" line.
    const after = sorted[i + 1];
    const nextChapter = after
      ? {
          id: after.data.id as string,
          question: (after.data.question as LangMap).en,
          url: collection === 'foundation' ? '/explain/' : `/explain/${collection}/${after.data.id}/`,
        }
      : null;
    return { ...entry, collection, url, editions, nextChapter };
  });
}

export type Chapter = Awaited<ReturnType<typeof getCollectionChapters>>[number];

export function toJson(chapter: Chapter): Record<string, unknown> {
  const d = chapter.data;
  const result: Record<string, unknown> = {
    id: d.id,
    collection: chapter.collection,
    order: d.order,
    tense: d.tense,
    claim: d.claim,
    question: trimLang(d.question as LangMap),
    // All lenses' editions travel with the feed (EXP-8a item 9).
    editions: chapter.editions,
    lenses: Object.keys(chapter.editions),
    evidence: (d.evidence as {
      kind: string;
      src?: string;
      value?: string | number;
      caption: LangMap;
      source: string;
    }[]).map(ev => {
      const item: Record<string, unknown> = {
        kind: ev.kind,
        caption: trimLang(ev.caption),
        source: ev.source,
      };
      if (ev.src !== undefined) item.src = ev.src;
      if (ev.value !== undefined) item.value = ev.value;
      return item;
    }),
    scene: d.scene,
    version: d.version,
    url: chapter.url,
  };
  if (d.tenseNote !== undefined) result.tenseNote = d.tenseNote;
  // The deprecated alias fields stay in the feed when a chapter still uses them.
  if ((d as Record<string, unknown>).line !== undefined) result.line = trimLang((d as any).line as LangMap);
  if (d.paragraph !== undefined) result.paragraph = trimLang(d.paragraph as LangMap);
  if (d.next !== undefined) result.next = d.next;
  if (d.deeper !== undefined) result.deeper = d.deeper;
  const body = (chapter as { body?: string }).body;
  if (body && body.trim()) result.body = body;
  return result;
}
