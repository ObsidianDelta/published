// /explain/<collection>/<id>.json — the widget feed for one chapter.
import type { APIRoute } from "astro";
import { getCollectionChapters, toJson } from "../../../lib/explain/chapters.js";

const COLLECTIONS = ["foundation", "metadax", "constraint-protocol", "nova-dax", "skippy-dax"];

export async function getStaticPaths() {
  const paths: { params: { collection: string; id: string } }[] = [];
  for (const collection of COLLECTIONS) {
    const chapters = await getCollectionChapters(collection);
    for (const c of chapters) {
      paths.push({ params: { collection, id: c.data.id } });
    }
  }
  return paths;
}

export const GET: APIRoute = async ({ params }) => {
  const collection = params.collection ?? "";
  const chapters = await getCollectionChapters(collection);
  const chapter = chapters.find((c) => c.data.id === params.id);
  if (!chapter) {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify(toJson(chapter)), {
    headers: { "content-type": "application/json" },
  });
};
