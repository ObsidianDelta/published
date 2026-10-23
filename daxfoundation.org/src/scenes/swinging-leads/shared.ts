// swinging-leads (board 05): two climbers on one route; whoever is a step
// ahead is the guide, and the lead swings. Inline SVG for the route and nodes,
// a real DOM <button> overlay to swing on demand. All colours from tokens.
import type { SceneHandle, SceneParams, SceneTokens } from '../contract';
import { clamp01, segment } from '../contract';

export const META = {
  name: 'swinging-leads',
  states: ['lead', 'swing', 'visible', 'hidden'] as const,
  needsWebGL: false,
};

const SVGNS = 'http://www.w3.org/2000/svg';

// The climbing route as a cubic bezier rising left -> right.
const P = [
  { x: 40, y: 230 },  // P0 bottom-left
  { x: 130, y: 215 }, // P1
  { x: 250, y: 95 },  // P2
  { x: 330, y: 55 },  // P3 top-right
];
function routePoint(u: number): { x: number; y: number } {
  const m = 1 - u;
  const a = m * m * m, b = 3 * m * m * u, c = 3 * m * u * u, d = u * u * u;
  return {
    x: a * P[0].x + b * P[1].x + c * P[2].x + d * P[3].x,
    y: a * P[0].y + b * P[1].y + c * P[2].y + d * P[3].y,
  };
}
const ROUTE_D = `M ${P[0].x} ${P[0].y} C ${P[1].x} ${P[1].y} ${P[2].x} ${P[2].y} ${P[3].x} ${P[3].y}`;
// Approximate arc length for the draw dash.
const ROUTE_LEN = 420;

const U_GUIDE = 0.55;   // the fixed node
const U_LEARN0 = 0.30;  // learner starts a step behind
const U_LEARN1 = 0.80;  // learner ends a step ahead (the ghost's slot)
const U_GHOST = 0.80;

function str(v: string | string[] | undefined, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}
function easeInOut(p: number): number {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}

export function mountSwingingLeads(
  el: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
  opts: { animated: boolean },
): SceneHandle {
  const animate = opts.animated && !params.reducedMotion;
  const reduced = params.reducedMotion;
  const L = params.labels;

  el.style.position = 'relative';
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.padding = '16px';
  el.style.boxSizing = 'border-box';

  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('viewBox', '0 0 360 290');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.maxWidth = '460px';
  svg.style.display = 'block';
  svg.style.overflow = 'visible';
  svg.setAttribute('role', 'img');

  // route
  const routeBase = document.createElementNS(SVGNS, 'path');
  routeBase.setAttribute('d', ROUTE_D);
  routeBase.setAttribute('fill', 'none');
  routeBase.setAttribute('stroke', tokens.sceneWire);
  routeBase.setAttribute('stroke-width', '2');
  routeBase.setAttribute('stroke-dasharray', String(ROUTE_LEN));

  // dashed record rope between the two nodes
  const rope = document.createElementNS(SVGNS, 'line');
  rope.setAttribute('stroke', tokens.record);
  rope.setAttribute('stroke-width', '1.5');
  rope.setAttribute('stroke-dasharray', '4 4');

  // dimension line under the nodes + gap label
  const dim = document.createElementNS(SVGNS, 'line');
  dim.setAttribute('stroke', tokens.inkFaint);
  dim.setAttribute('stroke-width', '1');
  const dimL = document.createElementNS(SVGNS, 'line');
  const dimR = document.createElementNS(SVGNS, 'line');
  [dimL, dimR].forEach((t) => { t.setAttribute('stroke', tokens.inkFaint); t.setAttribute('stroke-width', '1'); });
  const gapLbl = document.createElementNS(SVGNS, 'text');
  gapLbl.textContent = str(L.gap);
  gapLbl.setAttribute('text-anchor', 'middle');
  gapLbl.setAttribute('font-size', '12');
  gapLbl.setAttribute('fill', tokens.inkMuted);

  // ghost of the next position
  const ghost = document.createElementNS(SVGNS, 'circle');
  const gp = routePoint(U_GHOST);
  ghost.setAttribute('cx', String(gp.x));
  ghost.setAttribute('cy', String(gp.y));
  ghost.setAttribute('r', '9');
  ghost.setAttribute('fill', 'none');
  ghost.setAttribute('stroke', tokens.inkFaint);
  ghost.setAttribute('stroke-width', '1.5');
  ghost.setAttribute('stroke-dasharray', '3 3');
  const nextLbl = document.createElementNS(SVGNS, 'text');
  nextLbl.textContent = str(L.next);
  nextLbl.setAttribute('x', String(gp.x + 14));
  nextLbl.setAttribute('y', String(gp.y - 8));
  nextLbl.setAttribute('font-size', '11');
  nextLbl.setAttribute('fill', tokens.inkFaint);

  // nodes: learner (ember) and guide (tide). Each a halo + core.
  function makeNode(core: string, halo: string) {
    const g = document.createElementNS(SVGNS, 'g');
    const h = document.createElementNS(SVGNS, 'circle');
    h.setAttribute('r', '16'); h.setAttribute('fill', halo);
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('r', '8'); c.setAttribute('fill', core);
    g.append(h, c);
    return g;
  }
  const learnerNode = makeNode(tokens.learner, tokens.learnerSoft);
  const guideNode = makeNode(tokens.guide, tokens.guideSoft);

  // role labels (text follows POSITION, not colour: whoever is ahead = guide)
  const labelAhead = document.createElementNS(SVGNS, 'text');
  const labelBehind = document.createElementNS(SVGNS, 'text');
  [labelAhead, labelBehind].forEach((t) => {
    t.setAttribute('font-size', '12');
    t.setAttribute('fill', tokens.inkMuted);
  });

  const caption = document.createElementNS(SVGNS, 'text');
  caption.textContent = str(L.caption);
  caption.setAttribute('x', '180');
  caption.setAttribute('y', '278');
  caption.setAttribute('text-anchor', 'middle');
  caption.setAttribute('font-size', '13');
  caption.setAttribute('fill', tokens.ink);

  svg.append(routeBase, dim, dimL, dimR, gapLbl, rope, ghost, nextLbl,
    guideNode, learnerNode, labelAhead, labelBehind, caption);

  // DOM overlay button
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = str(L.tap, 'Swing the lead');
  btn.style.marginTop = '12px';
  btn.style.minHeight = '44px';
  btn.style.padding = '10px 18px';
  btn.style.background = tokens.surface;
  btn.style.color = tokens.ink;
  btn.style.border = `1px solid ${tokens.line}`;
  btn.style.borderRadius = '8px';
  btn.style.font = 'inherit';
  btn.style.fontSize = '14px';
  btn.style.cursor = 'pointer';

  el.append(svg, btn);

  // --- state / driving ---
  let destroyed = false, paused = false, lastT = 0;
  let sw = 0;                 // 0: learner behind; 1: learner ahead
  let autoSwung = false;      // scroll has driven the swing once
  let raf = 0;
  let tween: { from: number; to: number; start: number; dur: number } | null = null;

  function layout(routeDraw: number) {
    routeBase.setAttribute('stroke-dashoffset', String(ROUTE_LEN * (1 - routeDraw)));

    const uL = U_LEARN0 + (U_LEARN1 - U_LEARN0) * sw;
    const pL = routePoint(uL);
    const pG = routePoint(U_GUIDE);

    const arrive = routeDraw; // nodes arrive as the route draws
    learnerNode.setAttribute('transform', `translate(${pL.x} ${pL.y})`);
    guideNode.setAttribute('transform', `translate(${pG.x} ${pG.y})`);
    learnerNode.style.opacity = String(arrive);
    guideNode.style.opacity = String(arrive);

    // rope between the two
    rope.setAttribute('x1', String(pL.x)); rope.setAttribute('y1', String(pL.y));
    rope.setAttribute('x2', String(pG.x)); rope.setAttribute('y2', String(pG.y));
    rope.style.opacity = String(arrive);

    // dimension line under both nodes
    const yDim = Math.max(pL.y, pG.y) + 34;
    const xa = Math.min(pL.x, pG.x), xb = Math.max(pL.x, pG.x);
    dim.setAttribute('x1', String(xa)); dim.setAttribute('y1', String(yDim));
    dim.setAttribute('x2', String(xb)); dim.setAttribute('y2', String(yDim));
    [[dimL, xa], [dimR, xb]].forEach(([ln, x]) => {
      const e = ln as SVGLineElement; const xv = x as number;
      e.setAttribute('x1', String(xv)); e.setAttribute('y1', String(yDim - 5));
      e.setAttribute('x2', String(xv)); e.setAttribute('y2', String(yDim + 5));
    });
    gapLbl.setAttribute('x', String((xa + xb) / 2));
    gapLbl.setAttribute('y', String(yDim + 18));
    dim.style.opacity = dimL.style.opacity = dimR.style.opacity = gapLbl.style.opacity = String(arrive);

    // who is ahead? higher on route = smaller y
    const learnerAhead = pL.y <= pG.y;
    const ahead = learnerAhead ? pL : pG;
    const behind = learnerAhead ? pG : pL;
    labelAhead.textContent = str(L.guideNow);
    labelBehind.textContent = str(L.learnerNow);
    labelAhead.setAttribute('x', String(ahead.x + 20));
    labelAhead.setAttribute('y', String(ahead.y - 6));
    labelBehind.setAttribute('x', String(behind.x + 20));
    labelBehind.setAttribute('y', String(behind.y + 24));
    labelAhead.style.opacity = labelBehind.style.opacity = String(arrive);

    // ghost fades as the learner lands in its slot
    ghost.style.opacity = String((1 - sw) * arrive);
    nextLbl.style.opacity = String((1 - sw) * arrive);

    // caption appears with the swing
    caption.style.opacity = String(sw);
  }

  function render(t: number) {
    const tt = clamp01(t);
    const routeDraw = animate ? segment(tt, 0, 0.5) : 1;
    if (!tween) {
      // scroll drives the swing in the 0.5..1 band unless a tap is animating
      if (animate) {
        const scrollSw = segment(tt, 0.5, 1);
        if (!userDriven) sw = scrollSw;
      } else {
        sw = 1; // fallback: resolved swing, caption shown, readable
      }
    }
    layout(reduced && !animate ? 1 : routeDraw);
  }

  let userDriven = false;

  function startTween(to: number) {
    const dur = reduced ? 300 : 700;
    if (destroyed) return;
    userDriven = true;
    tween = { from: sw, to, start: -1, dur };
    if (!raf && !paused) raf = requestAnimationFrame(frame);
  }
  function frame(ts: number) {
    raf = 0;
    if (!tween || paused || destroyed) return;
    if (tween.start < 0) tween.start = ts;
    const p = clamp01((ts - tween.start) / tween.dur);
    sw = tween.from + (tween.to - tween.from) * (reduced ? p : easeInOut(p));
    layout(animate ? segment(clamp01(lastT), 0, 0.5) : 1);
    if (p < 1) raf = requestAnimationFrame(frame);
    else tween = null;
  }

  function onTap() {
    startTween(sw >= 0.5 ? 0 : 1); // each tap swings the lead again
  }
  btn.addEventListener('click', onTap);

  render(0);

  return {
    setProgress(t: number) {
      lastT = t;
      if (paused || destroyed) return;
      // first scroll into the swing band plays the swing once
      if (animate && !autoSwung && !userDriven && clamp01(t) >= 0.5) {
        autoSwung = true;
      }
      render(t);
    },
    setState(name: string) {
      if (name === 'hidden') {
        paused = true;
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
      } else if (name === 'visible') {
        paused = false;
        if (tween) raf = requestAnimationFrame(frame);
        else render(lastT);
      }
    },
    resize() { /* SVG is fluid */ },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      btn.removeEventListener('click', onTap);
      el.replaceChildren();
    },
  };
}
