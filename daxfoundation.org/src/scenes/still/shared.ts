// still: one quiet card. Shared module — index.ts drives it with a soft settle,
// fallback.ts forces the settled state. Pure SVG, all colours from tokens.
import type { SceneHandle, SceneParams, SceneTokens } from '../contract';
import { clamp01 } from '../contract';

export const META = {
  name: 'still',
  states: ['settle', 'visible', 'hidden'] as const,
  needsWebGL: false,
};

const SVGNS = 'http://www.w3.org/2000/svg';

// The six glyphs and the token each draws from (README): record Paper,
// companion Tide, identity/cost Ember, edge line, door Paper.
function glyphColour(glyph: string, tokens: SceneTokens): string {
  switch (glyph) {
    case 'record': return tokens.record;
    case 'companion': return tokens.guide;
    case 'edge': return tokens.line;
    case 'identity': return tokens.learner;
    case 'cost': return tokens.learner;
    case 'door': return tokens.record;
    default: return tokens.record;
  }
}

// Draw one glyph centred on (cx, cy) into `g`, in `colour`. Simple marks only;
// the card does the talking. Returns the created nodes (for opacity settling).
function drawGlyph(g: SVGGElement, glyph: string, cx: number, cy: number, colour: string): void {
  const stroke = (tag: string, attrs: Record<string, string>) => {
    const n = document.createElementNS(SVGNS, tag);
    n.setAttribute('stroke', colour);
    n.setAttribute('stroke-width', '2');
    n.setAttribute('stroke-linecap', 'round');
    n.setAttribute('fill', 'none');
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    g.append(n);
    return n;
  };
  switch (glyph) {
    case 'record': // three stacked lines — a record
      stroke('line', { x1: String(cx - 16), y1: String(cy - 8), x2: String(cx + 16), y2: String(cy - 8) });
      stroke('line', { x1: String(cx - 16), y1: String(cy), x2: String(cx + 16), y2: String(cy) });
      stroke('line', { x1: String(cx - 16), y1: String(cy + 8), x2: String(cx + 6), y2: String(cy + 8) });
      break;
    case 'companion': // a ring and a dot at its side — a companion
      stroke('circle', { cx: String(cx - 6), cy: String(cy), r: '11' });
      { const d = stroke('circle', { cx: String(cx + 13), cy: String(cy), r: '3.5' }); d.setAttribute('fill', colour); }
      break;
    case 'edge': // a directed edge — one entity to another
      stroke('circle', { cx: String(cx - 16), cy: String(cy), r: '4' });
      stroke('circle', { cx: String(cx + 16), cy: String(cy), r: '4' });
      stroke('line', { x1: String(cx - 11), y1: String(cy), x2: String(cx + 11), y2: String(cy) });
      stroke('polyline', { points: `${cx + 6},${cy - 4} ${cx + 11},${cy} ${cx + 6},${cy + 4}` });
      break;
    case 'identity': // a key — an identity only its holder has
      stroke('circle', { cx: String(cx - 10), cy: String(cy), r: '7' });
      stroke('line', { x1: String(cx - 3), y1: String(cy), x2: String(cx + 16), y2: String(cy) });
      stroke('line', { x1: String(cx + 10), y1: String(cy), x2: String(cx + 10), y2: String(cy + 6) });
      stroke('line', { x1: String(cx + 16), y1: String(cy), x2: String(cx + 16), y2: String(cy + 6) });
      break;
    case 'cost': // a spark — the cost that comes with a new power
      stroke('line', { x1: String(cx), y1: String(cy - 16), x2: String(cx), y2: String(cy + 16) });
      stroke('line', { x1: String(cx - 16), y1: String(cy), x2: String(cx + 16), y2: String(cy) });
      stroke('line', { x1: String(cx - 11), y1: String(cy - 11), x2: String(cx + 11), y2: String(cy + 11) });
      stroke('line', { x1: String(cx - 11), y1: String(cy + 11), x2: String(cx + 11), y2: String(cy - 11) });
      break;
    case 'door': // a doorway — the way in
    default:
      stroke('rect', { x: String(cx - 12), y: String(cy - 16), width: '24', height: '32', rx: '2' });
      { const h = stroke('circle', { cx: String(cx + 6), cy: String(cy + 2), r: '1.8' }); h.setAttribute('fill', colour); }
      break;
  }
}

export function mountStill(
  el: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
  opts: { animated: boolean },
): SceneHandle {
  const animate = opts.animated && !params.reducedMotion;
  const L = params.labels;
  const glyph = typeof params.params?.glyph === 'string' ? (params.params.glyph as string) : 'record';
  const colour = glyphColour(glyph, tokens);

  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.padding = '24px';
  el.style.boxSizing = 'border-box';

  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', '0 0 420 240');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.display = 'block';
  svg.style.maxWidth = '420px';
  svg.setAttribute('role', 'img');

  const a11y = document.createElementNS(SVGNS, 'title');
  svg.append(a11y);

  // The card.
  const card = document.createElementNS(SVGNS, 'rect');
  card.setAttribute('x', '10');
  card.setAttribute('y', '10');
  card.setAttribute('width', '400');
  card.setAttribute('height', '220');
  card.setAttribute('rx', '12');
  card.setAttribute('fill', tokens.surface);
  card.setAttribute('stroke', tokens.line);
  card.setAttribute('stroke-width', '1');
  svg.append(card);

  // The glyph, centred near the top.
  const gWrap = document.createElementNS(SVGNS, 'g');
  drawGlyph(gWrap, glyph, 210, 78, colour);
  svg.append(gWrap);

  // Title (mono) and caption (muted), both as SVG text, swapped by setLabels.
  const title = document.createElementNS(SVGNS, 'text');
  title.setAttribute('x', '210');
  title.setAttribute('y', '150');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('fill', tokens.ink);
  title.setAttribute('font-size', '18');
  title.setAttribute('font-family', 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace');

  const caption = document.createElementNS(SVGNS, 'text');
  caption.setAttribute('x', '210');
  caption.setAttribute('y', '182');
  caption.setAttribute('text-anchor', 'middle');
  caption.setAttribute('fill', tokens.inkMuted);
  caption.setAttribute('font-size', '14');

  svg.append(title, caption);
  el.append(svg);

  function setText() {
    const t = typeof L.title === 'string' ? L.title : '';
    const c = typeof L.caption === 'string' ? L.caption : '';
    title.textContent = t;
    caption.textContent = c;
    a11y.textContent = c ? `${t} — ${c}` : t;
  }
  setText();

  let destroyed = false;
  let paused = false;
  let lastT = 0;

  // Complete at t=0; t only settles. The card rises a few px and the glyph eases
  // from 85% to full. Reduced motion / fallback: the settled state, fixed.
  function render(t: number) {
    const tt = clamp01(t);
    if (!animate) {
      gWrap.setAttribute('opacity', '1');
      svg.style.transform = 'none';
      return;
    }
    gWrap.setAttribute('opacity', String(0.85 + 0.15 * tt));
    svg.style.transform = `translateY(${(1 - tt) * 4}px)`;
    svg.style.transition = 'transform 300ms ease';
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
    },
    setLabels(labels: Record<string, string | string[]>) {
      (params.labels as Record<string, string | string[]>) = labels;
      // L is a reference to params.labels; re-point and re-render text.
      Object.assign(L, labels);
      setText();
    },
    resize() { /* SVG is fluid */ },
    destroy() {
      destroyed = true;
      if (el.contains(svg)) el.removeChild(svg);
    },
  };
}
