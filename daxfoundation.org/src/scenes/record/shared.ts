// record (board 06): the learning-record card, the seed of Nova DAX.
// Shared module: index.ts drives it with motion, fallback.ts forces the
// no-animation variant. Pure DOM (no SVG canvas), all colours from tokens.
import type { SceneHandle, SceneParams, SceneTokens } from '../contract';
import { clamp01, segment } from '../contract';

export const META = {
  name: 'record',
  states: ['rows', 'seed', 'visible', 'hidden'] as const,
  needsWebGL: false,
};

const ROW_T = 0.16; // each row owns 0.16 of t; five rows fill 0..0.8
const SEED_FROM = 0.8;

function dotColour(kind: string, tokens: SceneTokens): string {
  switch (kind) {
    case 'reached': return tokens.learner;
    case 'tried': return tokens.inkFaint;
    case 'guided': return tokens.guide;
    case 'reused': return tokens.record;
    default: return tokens.inkMuted;
  }
}

function asArray(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : v == null ? [] : [v];
}

export function mountRecord(
  el: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
  opts: { animated: boolean },
): SceneHandle {
  const animate = opts.animated && !params.reducedMotion;
  const L = params.labels;
  const rows = asArray(L.rows);
  const kinds = asArray(L.rowKinds);

  // Scene element: centre the card, give room for the thread below.
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.padding = '24px';
  el.style.boxSizing = 'border-box';

  const wrap = document.createElement('div');
  wrap.style.position = 'relative';
  wrap.style.width = '100%';
  wrap.style.maxWidth = '420px';

  const card = document.createElement('div');
  card.style.background = tokens.surface;
  card.style.border = `1px solid ${tokens.line}`;
  card.style.borderRadius = '10px';
  card.style.padding = '16px';
  card.style.boxSizing = 'border-box';
  card.style.transition = animate ? 'border-color 400ms ease' : 'none';

  // Header: title in mono, with a small count of entries so far.
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'baseline';
  header.style.marginBottom = '12px';

  const title = document.createElement('div');
  title.textContent = typeof L.title === 'string' ? L.title : 'Learning record';
  title.style.fontFamily = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
  title.style.fontSize = '14px';
  title.style.color = tokens.ink;
  title.setAttribute('role', 'heading');
  title.setAttribute('aria-level', '3');

  const week = document.createElement('div'); // a small week counter (numeric only)
  week.style.fontFamily = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
  week.style.fontSize = '12px';
  week.style.color = tokens.inkFaint;
  week.setAttribute('aria-hidden', 'true');

  header.append(title, week);

  const list = document.createElement('div');
  list.setAttribute('role', 'list');
  list.setAttribute('aria-label', title.textContent || 'rows');

  const rowEls: { el: HTMLElement }[] = [];
  rows.forEach((text, i) => {
    const row = document.createElement('div');
    row.setAttribute('role', 'listitem');
    row.style.display = 'flex';
    row.style.alignItems = 'flex-start';
    row.style.gap = '8px';
    row.style.padding = '8px 0';
    if (i > 0) row.style.borderTop = `1px solid ${tokens.line}`;
    row.style.transition = animate ? 'opacity 260ms ease, transform 260ms ease' : 'none';

    const dot = document.createElement('span');
    dot.style.flex = '0 0 auto';
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.marginTop = '5px';
    dot.style.borderRadius = '50%';
    dot.style.background = dotColour(kinds[i] || '', tokens);
    dot.setAttribute('aria-hidden', 'true');

    // Split "Main - note" into a 14px head and a 12px muted note.
    const dash = text.indexOf(' - ');
    const head = dash >= 0 ? text.slice(0, dash) : text;
    const note = dash >= 0 ? text.slice(dash + 3) : '';

    const textWrap = document.createElement('div');
    const headEl = document.createElement('div');
    headEl.textContent = head;
    headEl.style.fontSize = '14px';
    headEl.style.lineHeight = '1.35';
    headEl.style.color = tokens.ink;
    textWrap.append(headEl);
    if (note) {
      const noteEl = document.createElement('div');
      noteEl.textContent = note;
      noteEl.style.fontSize = '12px';
      noteEl.style.lineHeight = '1.35';
      noteEl.style.color = tokens.inkMuted;
      textWrap.append(noteEl);
    }

    row.append(dot, textWrap);
    list.append(row);
    rowEls.push({ el: row });
  });

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.gap = '12px';
  footer.style.marginTop = '12px';
  footer.style.paddingTop = '12px';
  footer.style.borderTop = `1px solid ${tokens.line}`;
  footer.style.fontSize = '12px';
  footer.style.transition = animate ? 'opacity 300ms ease' : 'none';

  const yours = document.createElement('span');
  yours.textContent = typeof L.yours === 'string' ? L.yours : '';
  yours.style.color = tokens.inkMuted;
  const seed = document.createElement('span');
  seed.textContent = typeof L.seed === 'string' ? L.seed : '';
  seed.style.color = tokens.record;
  seed.style.textAlign = 'right';
  footer.append(yours, seed);

  card.append(header, list, footer);

  // The record thread: a thin line that extends below the card toward the
  // next chapter (the seed of Nova DAX). SVG so it can draw as t rises.
  const thread = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  thread.setAttribute('width', '100%');
  thread.setAttribute('height', '48');
  thread.setAttribute('viewBox', '0 0 420 48');
  thread.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  thread.style.display = 'block';
  thread.style.overflow = 'visible';
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '210');
  line.setAttribute('y1', '0');
  line.setAttribute('x2', '210');
  line.setAttribute('y2', '48');
  line.setAttribute('stroke', tokens.record);
  line.setAttribute('stroke-width', '1.5');
  line.setAttribute('stroke-dasharray', '48');
  thread.append(line);

  wrap.append(card, thread);
  el.append(wrap);

  // --- driving ---
  let destroyed = false;
  let paused = false;
  let lastT = 0;

  function render(t: number) {
    const tt = clamp01(t);
    let revealed = 0;
    rowEls.forEach((r, i) => {
      const p = animate ? segment(tt, i * ROW_T, i * ROW_T + ROW_T) : 1;
      if (p > 0.001) revealed++;
      r.el.style.opacity = String(p);
      r.el.style.transform = animate ? `translateY(${(1 - p) * 8}px)` : 'none';
    });
    week.textContent = String(animate ? revealed : rowEls.length);

    const seedP = animate ? segment(tt, SEED_FROM, 1) : 1;
    footer.style.opacity = String(seedP);
    card.style.borderColor = seedP > 0.5 ? tokens.record : tokens.line;
    line.setAttribute('stroke-dashoffset', String(48 * (1 - seedP)));
  }

  render(0);

  return {
    setProgress(t: number) {
      lastT = t;
      if (!paused && !destroyed) render(t);
    },
    setState(name: string) {
      if (name === 'hidden') paused = true;
      else if (name === 'visible') { paused = false; render(lastT); }
      // 'rows' / 'seed' are positions on the same t axis; nothing extra to do.
    },
    resize() { /* card is fluid; nothing to recompute */ },
    destroy() {
      destroyed = true;
      if (el.contains(wrap)) el.removeChild(wrap);
    },
  };
}
