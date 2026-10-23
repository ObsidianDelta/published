// /explain/<collection>/index.json — the widget feed for a whole collection.
import type { APIRoute } from "astro";
import { getCollectionChapters, toJson } from "../../../lib/explain/chapters.js";

const COLLECTIONS = ["foundation", "metadax", "constraint-protocol", "nova-dax", "skippy-dax"];

export function getStaticPaths() {
  return COLLECTIONS.map((collection) => ({ params: { collection } }));
}

export const GET: APIRoute = async ({ params }) => {
  const collection = params.collection ?? "";
  const chapters = await getCollectionChapters(collection);
  const body = JSON.stringify(chapters.map((c) => toJson(c)));
  return new Response(body, {
    headers: { "content-type": "application/json" },
  });
};
