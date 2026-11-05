// 2026-11-04 (SEO launch pass): small helpers for per-page meta descriptions.

// Clip text to a search-snippet length (default 158 chars) at a word boundary.
export function clip(text, max = 158) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return (at > 80 ? cut.slice(0, at) : cut).replace(/[\s,;:—–-]+$/, '') + '…';
}

// One explainer chapter's own description: its question, then its first canon
// line (the sentence every lens of that chapter is written from), clipped. The
// question keeps it unique: the four horizon chapters share a first canon line.
// The run's name leads (the horizon chapters share their question too).
// Falls back to the run's line when the chapter has no canon.
export function chapterDescription(chapter, fallback, run = '') {
  const data = (chapter && chapter.data) || {};
  const canon = Array.isArray(data.canon) ? data.canon : [];
  if (!canon.length) return fallback;
  const q = data.question && data.question.en ? String(data.question.en).trim() + ' ' : '';
  return clip((run ? run + ': ' : '') + q + canon[0]);
}
