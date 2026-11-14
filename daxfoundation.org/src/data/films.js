// The films registry — one array, newest first. Single source of truth for the
// home page films band and the /films/ page.
//
// These films are a collective digest of everyone who shares the constraint. They
// are made in the open, as they happen — the Foundation's way of publishing
// ("resonant publishing"). The studio that makes them is called, exactly,
// "I Found My Second Sasquatch".
//
// To add an answer: drop its .mp4 in public/films/ and prepend an entry here. The
// home band shows the hero film and the newest answer; /films/ lists them all.
//
// Copy rules that bind every line here (the public optics rules): no technology
// names (no model, machine or infrastructure names); the word "AI" never appears
// in film copy; "hey Skippy" is the wake phrase for the answers series (Jason's
// own title for Answer 01), not a reference to any initiative; packages and
// previews are in no way indicative of a final product.

export const films = [
  {
    slug: "39-4-from-the-dark",
    kind: "film",
    hero: true,
    title: "39.4 — from the dark",
    src: "/films/39.4-from-the-dark.mp4",
    poster: "/films/poster.svg",
    date: "2026-11-14",
    // Felt, not stated as a slogan: dark, then a light comes in.
    blurb: "Dark, then a light comes in.",
  },
  {
    slug: "hey-skippy-01-family-hub",
    kind: "answer",
    n: "01",
    title: "hey Skippy — what’s the family hub?",
    src: "/films/hey-skippy-01-family-hub.mp4",
    poster: "/films/poster.svg",
    date: "2026-11-13",
    blurb: "Answer 01: a plain question, a plain answer.",
  },
];

// The credit line, verbatim, as one string so it reads the same everywhere.
export const CREDIT = "I Found My Second Sasquatch · resonant publishing · 39.4";

// The hero film for the home band (the one marked hero, else the newest).
export const heroFilm = () => films.find((f) => f.hero) || films[0];

// The newest answer (kind "answer"), for the home band.
export const newestAnswer = () => byNewest().find((f) => f.kind === "answer");

// Everything, newest first (by date, then original order as a tiebreak).
export const byNewest = () =>
  [...films].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
