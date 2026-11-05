// Progress: discoveries, letters collected, streaks of discovery and unlocks. Pure; the UI keeps
// the state in localStorage (this device only). A discovery is something new to *you*: a letter
// you had not found, a kind of source you had not tried, or a harmony you had not heard.
// No timers, no nagging, no loss framing: a streak simply rests if you skip a day.

import { SOURCE_KINDS, LETTER_IDS } from './catalog.js';

export const FEATURE_UNLOCKS = Object.freeze({ tense: 2, layer: 5 });

export function emptyProgress() {
  return { v: 1, discoveries: 0, letters: [], kinds: [], harmonies: [], streak: 0, lastDay: null, best: 0, remixes: 0 };
}

export function normalizeProgress(p) {
  const e = emptyProgress();
  if (!p || typeof p !== 'object' || p.v !== 1) return e;
  const arr = (x, ok) => (Array.isArray(x) ? [...new Set(x.filter(ok))] : []);
  const isStr = (s) => typeof s === 'string' && s.length < 200;
  return {
    v: 1,
    discoveries: Number.isInteger(p.discoveries) && p.discoveries >= 0 ? p.discoveries : 0,
    letters: arr(p.letters, (l) => LETTER_IDS.includes(l)),
    kinds: arr(p.kinds, (k) => SOURCE_KINDS.some((s) => s.id === k)),
    harmonies: arr(p.harmonies, isStr).slice(-500),
    streak: Number.isInteger(p.streak) && p.streak >= 0 ? p.streak : 0,
    lastDay: typeof p.lastDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.lastDay) ? p.lastDay : null,
    best: Number.isInteger(p.best) && p.best >= 0 ? p.best : 0,
    remixes: Number.isInteger(p.remixes) && p.remixes >= 0 ? p.remixes : 0,
  };
}

export function dayString(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function addDays(day, n) {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

/** the streak to show today: it rests (shows 0) once a whole day has passed without a discovery. */
export function currentStreak(p, today) {
  if (!p.lastDay) return 0;
  if (p.lastDay === today || p.lastDay === addDays(today, -1)) return p.streak;
  return 0;
}

export function isUnlocked(p, kindId) {
  const k = SOURCE_KINDS.find((s) => s.id === kindId);
  return !!k && p.discoveries >= k.unlock;
}
export const featureOn = (p, f) => p.discoveries >= FEATURE_UNLOCKS[f];

/** everything that unlocks between two discovery counts (for the "unlocked" toast). */
export function unlocksBetween(before, after) {
  const out = [];
  for (const k of SOURCE_KINDS) if (k.unlock > before && k.unlock <= after) out.push({ type: 'kind', id: k.id });
  for (const [f, n] of Object.entries(FEATURE_UNLOCKS)) if (n > before && n <= after) out.push({ type: 'feature', id: f });
  return out;
}

/** the next thing to unlock, or null when everything is open. */
export function nextUnlock(p) {
  const pending = [
    ...SOURCE_KINDS.filter((k) => k.unlock > p.discoveries).map((k) => ({ type: 'kind', id: k.id, at: k.unlock })),
    ...Object.entries(FEATURE_UNLOCKS).filter(([, n]) => n > p.discoveries).map(([id, at]) => ({ type: 'feature', id, at })),
  ].sort((a, b) => a.at - b.at);
  return pending[0] || null;
}

/** record a finished experiment. Returns {progress, found[], unlocked[]} without mutating input. */
export function recordCompletion(prev, { letters, kinds, harmony, remix }, today) {
  const p = normalizeProgress(prev);
  const found = [];
  const newLetters = letters.filter((l) => LETTER_IDS.includes(l) && !p.letters.includes(l));
  const newKinds = kinds.filter((k) => !p.kinds.includes(k));
  const newHarmony = harmony && !p.harmonies.includes(harmony);
  newLetters.forEach((x) => found.push({ type: 'letter', x }));
  newKinds.forEach((x) => found.push({ type: 'kind', x }));
  if (newHarmony) found.push({ type: 'harmony', x: harmony });

  const next = { ...p, letters: [...p.letters, ...newLetters], kinds: [...p.kinds, ...newKinds], harmonies: newHarmony ? [...p.harmonies, harmony] : p.harmonies };
  if (remix) next.remixes = p.remixes + 1;
  let unlocked = [];
  if (found.length) {
    next.discoveries = p.discoveries + 1;
    unlocked = unlocksBetween(p.discoveries, next.discoveries);
    if (p.lastDay !== today) {
      next.streak = p.lastDay === addDays(today, -1) ? p.streak + 1 : 1;
      next.lastDay = today;
    }
    next.best = Math.max(p.best, next.streak);
  }
  return { progress: next, found, unlocked };
}
