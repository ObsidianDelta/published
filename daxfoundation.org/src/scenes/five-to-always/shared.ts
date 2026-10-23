// five-to-always (board 07): the five-minute benchmark, then always on.
// DOM text for the numeral/labels; SVG for the arc and the always-on ring.
// Shared module: index.ts animates, fallback.ts forces the still variant.
import type { SceneHandle, SceneParams, SceneTokens } from '../contract';
import { clamp01, segment } from '../contract';

export const META = {
  name: 'five-to-always',
  states: ['five', 'always', 'visible', 'hidden'] as const,
  needsWebGL: false,
};

const SVGNS = 'http://www.w3.org/2000/svg';

// Semicircle arc geometry in the SVG viewBox (0 0 360 180).
const CX = 180, CY = 170, R = 150;
const ARC_LEN = Math.PI * R;

function arcPoint(p: number): { x: number; y: number } {
  // p 0 -> left (180deg), p 1 -> right (0deg), sweeping over the top.
  const a = Math.PI * (1 - p);
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
}

function str(v: string | string[] | undefined, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

export function mountFiveToAlways(
  el: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
  opts: { animated: boolean },
): SceneHandle {
  const animate = opts.animated && !params.reducedMotion;
  const L = params.labels;

  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.gap = '20px';
  el.style.padding = '24px';
  el.style.boxSizing = 'border-box';
  el.style.textAlign = 'center';

  // --- Numeral + unit (DOM text) ---
  const numWrap = document.createElement('div');
  numWrap.style.position = 'relative';
  numWrap.style.display = 'flex';
  numWrap.style.alignItems = 'center';
  numWrap.style.justifyContent = 'center';
  numWrap.style.gap = '12px';
  numWrap.style.minHeight = '168px';

  const numeral = document.createElement('div');
  numeral.textContent = str(L.numeral, '5');
  numeral.style.fontFamily = '"Fraunces", "Iowan Old Style", "Palatino Linotype", Georgia, serif';
  numeral.style.fontWeight = '300';
  numeral.style.fontSize = '168px';
  numeral.style.lineHeight = '0.9';
  numeral.style.color = tokens.learner;
  numeral.style.transition = animate ? 'opacity 400ms ease' : 'none';

  const unit = document.createElement('div');
  unit.textContent = str(L.unit);
  unit.style.maxWidth = '140px';
  unit.style.textAlign = 'left';
  unit.style.fontSize = '13px';
  unit.style.fontWeight = '500';
  unit.style.letterSpacing = '0.14em';
  unit.style.textTransform = 'uppercase';
  unit.style.lineHeight = '1.4';
  unit.style.color = tokens.inkMuted;

  // The always-on ring that the numeral crossfades into (SVG, no glyph).
  const ringSvg = document.createElementNS(SVGNS, 'svg');
  ringSvg.setAttribute('width', '168');
  ringSvg.setAttribute('height', '168');
  ringSvg.setAttribute('viewBox', '0 0 168 168');
  ringSvg.style.position = 'absolute';
  ringSvg.style.left = '50%';
  ringSvg.style.top = '50%';
  ringSvg.style.transform = 'translate(-50%, -50%)';
  ringSvg.style.transition = animate ? 'opacity 400ms ease' : 'none';
  ringSvg.setAttribute('aria-hidden', 'true');
  const ring = document.createElementNS(SVGNS, 'circle');
  ring.setAttribute('cx', '84');
  ring.setAttribute('cy', '84');
  ring.setAttribute('r', '66');
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', tokens.guide);
  ring.setAttribute('stroke-width', '6');
  ringSvg.append(ring);

  numWrap.append(ringSvg, numeral, unit);

  // --- Arc (SVG) ---
  const arcSvg = document.createElementNS(SVGNS, 'svg');
  arcSvg.setAttribute('width', '100%');
  arcSvg.setAttribute('viewBox', '0 0 360 190');
  arcSvg.style.maxWidth = '420px';
  arcSvg.style.display = 'block';
  arcSvg.style.overflow = 'visible';

  const start = arcPoint(0), end = arcPoint(1);
  const dPath = `M ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y}`;

  const arcBase = document.createElementNS(SVGNS, 'path');
  arcBase.setAttribute('d', dPath);
  arcBase.setAttribute('fill', 'none');
  arcBase.setAttribute('stroke', tokens.sceneWire);
  arcBase.setAttribute('stroke-width', '2');

  const arcFill = document.createElementNS(SVGNS, 'path');
  arcFill.setAttribute('d', dPath);
  arcFill.setAttribute('fill', 'none');
  arcFill.setAttribute('stroke', tokens.record);
  arcFill.setAttribute('stroke-width', '3');
  arcFill.setAttribute('stroke-linecap', 'round');
  arcFill.setAttribute('stroke-dasharray', String(ARC_LEN));
  arcFill.style.transition = animate ? 'stroke 400ms ease' : 'none';

  const rider = document.createElementNS(SVGNS, 'circle'); // learner node on the arc
  rider.setAttribute('r', '7');
  rider.setAttribute('fill', tokens.learner);
  rider.setAttribute('stroke', tokens.learnerSoft);
  rider.setAttribute('stroke-width', '10');

  const endRing = document.createElementNS(SVGNS, 'circle'); // guide ring at the end (always)
  endRing.setAttribute('cx', String(end.x));
  endRing.setAttribute('cy', String(end.y));
  endRing.setAttribute('r', '11');
  endRing.setAttribute('fill', 'none');
  endRing.setAttribute('stroke', tokens.guide);
  endRing.setAttribute('stroke-width', '3');
  endRing.style.transition = animate ? 'opacity 400ms ease' : 'none';

  // from / to labels at the arc ends
  const fromLbl = document.createElementNS(SVGNS, 'text');
  fromLbl.textContent = str(L.from);
  fromLbl.setAttribute('x', String(start.x));
  fromLbl.setAttribute('y', String(start.y + 18));
  fromLbl.setAttribute('text-anchor', 'start');
  fromLbl.setAttribute('font-size', '12');
  fromLbl.setAttribute('fill', tokens.inkMuted);

  const toLbl = document.createElementNS(SVGNS, 'text');
  toLbl.textContent = str(L.to);
  toLbl.setAttribute('x', String(end.x));
  toLbl.setAttribute('y', String(end.y + 18));
  toLbl.setAttribute('text-anchor', 'end');
  toLbl.setAttribute('font-size', '12');
  toLbl.setAttribute('fill', tokens.inkMuted);

  const caption = document.createElementNS(SVGNS, 'text'); // today / then at the arc top
  caption.setAttribute('x', String(CX));
  caption.setAttribute('y', '28');
  caption.setAttribute('text-anchor', 'middle');
  caption.setAttribute('font-size', '13');
  caption.setAttribute('fill', tokens.ink);

  arcSvg.append(arcBase, arcFill, endRing, rider, fromLbl, toLbl, caption);

  // --- Bandwidth bars ---
  const barsWrap = document.createElement('div');
  barsWrap.style.display = 'flex';
  barsWrap.style.flexDirection = 'column';
  barsWrap.style.alignItems = 'center';
  barsWrap.style.gap = '8px';

  const barRow = document.createElement('div');
  barRow.style.display = 'flex';
  barRow.style.gap = '8px';
  barRow.style.alignItems = 'flex-end';
  barRow.style.height = '40px';

  // Split the single bandwidths string ("5 min - 1 h - always on") into three.
  const bwLabels = str(L.bandwidths).split(' - ');
  const heights = [18, 28, 40];
  const bars: HTMLElement[] = [];
  for (let i = 0; i < 3; i++) {
    const col = document.createElement('div');
    col.style.display = 'flex';
    col.style.flexDirection = 'column';
    col.style.alignItems = 'center';
    col.style.gap = '4px';

    const bar = document.createElement('div');
    bar.style.width = '18px';
    bar.style.height = `${heights[i]}px`;
    bar.style.borderRadius = '2px';
    bar.style.background = i === 0 ? tokens.record : tokens.inkFaint;
    bar.style.transition = animate ? 'background-color 400ms ease' : 'none';

    const cap = document.createElement('div');
    cap.textContent = bwLabels[i] || '';
    cap.style.fontSize = '11px';
    cap.style.color = tokens.inkMuted;
    cap.style.whiteSpace = 'nowrap';

    col.append(bar, cap);
    barRow.append(col);
    bars.push(bar);
  }

  const allLbl = document.createElement('div');
  allLbl.textContent = str(L.all);
  allLbl.style.fontSize = '12px';
  allLbl.style.color = tokens.inkMuted;
  barsWrap.append(barRow, allLbl);

  el.append(numWrap, arcSvg, barsWrap);

  // --- driving ---
  let destroyed = false, paused = false, lastT = 0;

  function render(t: number) {
    const tt = clamp01(t);
    // state five: arc fills over 0..0.5; always: 0.5..1.0 completes + switches.
    const five = animate ? segment(tt, 0, 0.5) : 1;
    const always = animate ? segment(tt, 0.5, 1) : 1;

    const fillP = Math.max(five, always);
    arcFill.setAttribute('stroke-dashoffset', String(ARC_LEN * (1 - fillP)));

    const rp = arcPoint(fillP);
    rider.setAttribute('cx', String(rp.x));
    rider.setAttribute('cy', String(rp.y));
    rider.style.opacity = String(always > 0.95 ? 0 : 1);

    const isAlways = always > 0.5;
    arcFill.setAttribute('stroke', isAlways ? tokens.guide : tokens.record);
    endRing.style.opacity = String(always);
    caption.textContent = isAlways ? str(L.then) : str(L.today);

    // bars all light to record once always engages
    bars.forEach((b, i) => {
      b.style.background = isAlways ? tokens.record : (i === 0 ? tokens.record : tokens.inkFaint);
    });

    // numeral crossfades to the continuous ring
    numeral.style.opacity = String(1 - always);
    ringSvg.style.opacity = String(always);
  }

  render(0);

  return {
    setProgress(t: number) { lastT = t; if (!paused && !destroyed) render(t); },
    setState(name: string) {
      if (name === 'hidden') paused = true;
      else if (name === 'visible') { paused = false; render(lastT); }
    },
    resize() { /* SVG is fluid */ },
    destroy() {
      destroyed = true;
      el.replaceChildren();
    },
  };
}
