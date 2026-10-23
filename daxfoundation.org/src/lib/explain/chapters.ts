import { getCollection } from 'astro:content';
import { validateScenes } from './validate.js';

type LangMap = { en: string; fr?: string };

function trimLang(obj: LangMap | undefined): { en: string; fr?: string } | undefined {
  if (!obj) return undefined;
  return obj.fr !== undefined ? { en: obj.en, fr: obj.fr } : { en: obj.en };
}

export async function getCollectionChapters(collection: string) {
  const all = await getCollection('explain');
  const entries = all.filter(e => e.id.startsWith(collection + '/'));
  validateScenes(entries as { data: { scene?: { module?: string } } }[]);
  const sorted = [...entries].sort((a, b) => (a.data.order as number) - (b.data.order as number));
  return sorted.map(entry => {
    const id = entry.data.id as string;
    const url =
      collection === 'foundation'
        ? '/explain/'
        : `/explain/${collection}/${id}/`;
    return { ...entry, collection, url };
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
    line: trimLang(d.line as LangMap),
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
  if (d.paragraph !== undefined) result.paragraph = trimLang(d.paragraph as LangMap);
  if (d.next !== undefined) result.next = d.next;
  if (d.deeper !== undefined) result.deeper = d.deeper;
  const body = (chapter as { body?: string }).body;
  if (body && body.trim()) result.body = body;
  return result;
}
