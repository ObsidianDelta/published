// Shared implementation for the `job-left` scene (board 01). index.ts animates,
// fallback.ts does not. All colours from `tokens`; all text from `params.labels`.
import type { SceneHandle, SceneParams, SceneTokens } from "../contract";
import { clamp01, segment } from "../contract";

const NS = "http://www.w3.org/2000/svg";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

type El = SVGElement;
function svg(tag: string, attrs: Record<string, string | number> = {}): El {
  const n = document.createElementNS(NS, tag) as El;
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  return n;
}
function label(x: number, y: number, text: string, fill: string, size: number, weight = 400): El {
  const t = svg("text", { x, y, fill, "text-anchor": "middle", "font-size": size, "font-weight": weight, "font-family": FONT });
  t.textContent = text;
  return t;
}
const asArr = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : v == null ? [] : [v];
const str = (v: string | string[] | undefined, d = ""): string =>
  Array.isArray(v) ? v.join(", ") : (v ?? d);

const PW = 60; // pillar width
const X = [48, 126, 204, 282]; // pillar left edges
const TOP = 80;
const BOT = 300;
const PH = BOT - TOP;

export function createJobLeftScene(
  el: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
  opts: { animated: boolean },
): SceneHandle {
  const L = params.labels;
  const reduced = params.reducedMotion || !opts.animated;
  const names = asArr(L.pillars);

  const root = svg("svg", {
    viewBox: "0 0 390 440", width: "100%", height: "100%",
    preserveAspectRatio: "xMidYMid meet", role: "img",
  });
  root.setAttribute("aria-label", str(L.caption, "The jobs of a university"));
  (root as unknown as HTMLElement).style.display = "block";

  // Three done pillars (record), each with a tick.
  const done: { g: El; tick: El }[] = [];
  for (let i = 0; i < 3; i++) {
    const g = svg("g", { opacity: 0 });
    g.appendChild(svg("rect", {
      x: X[i], y: TOP, width: PW, height: PH, rx: 6,
      fill: tokens.recordSoft, stroke: tokens.record, "stroke-width": 1.5,
    }));
    const cx = X[i] + PW / 2;
    const tick = svg("path", {
      d: `M ${cx - 14} ${TOP + 28} L ${cx - 4} ${TOP + 38} L ${cx + 15} ${TOP + 16}`,
      fill: "none", stroke: tokens.record, "stroke-width": 2.5,
      "stroke-linecap": "round", "stroke-linejoin": "round",
      "stroke-dasharray": 60, "stroke-dashoffset": 60,
    });
    g.appendChild(tick);
    g.appendChild(label(cx, BOT + 20, names[i] ?? "", tokens.ink, 13, 500));
    root.appendChild(g);
    done.push({ g, tick });
  }

  // Fourth pillar: dashed, learner, with the learner node + halo.
  const left = svg("g", { opacity: 0 });
  const lcx = X[3] + PW / 2;
  left.appendChild(svg("rect", {
    x: X[3], y: TOP, width: PW, height: PH, rx: 6,
    fill: "none", stroke: tokens.learner, "stroke-width": 1.5, "stroke-dasharray": "5 5",
  }));
  left.appendChild(svg("circle", { cx: lcx, cy: TOP + PH / 2, r: 24, fill: tokens.learnerSoft }));
  left.appendChild(svg("circle", { cx: lcx, cy: TOP + PH / 2, r: 14, fill: tokens.learner }));
  left.appendChild(label(lcx, BOT + 20, str(L.left, "Into one person"), tokens.learner, 13, 500));
  root.appendChild(left);

  // Captions.
  const caption = svg("g", { opacity: 0 });
  caption.appendChild(label(195, 350, str(L.done), tokens.inkMuted, 12));
  caption.appendChild(label(195, 372, str(L.caption), tokens.inkFaint, 11, 500));
  root.appendChild(caption);

  el.appendChild(root);

  function render(t: number) {
    // Done pillars are visible from the start; tick marks animate in as t increases.
    for (let i = 0; i < 3; i++) {
      done[i].g.setAttribute("opacity", "1");
      const a = (i / 3) * 0.5;
      const b = ((i + 1) / 3) * 0.5;
      const k = segment(t, a, b);
      done[i].tick.setAttribute("stroke-dashoffset", String(60 * (1 - k)));
    }
    left.setAttribute("opacity", String(segment(t, 0.5, 0.8)));
    caption.setAttribute("opacity", String(segment(t, 0.8, 1)));
  }

  let raf = 0, paused = false, current = 0;
  const cancel = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  function tweenTo(target: number) {
    cancel();
    if (reduced) {
      (root as unknown as HTMLElement).style.transition = "opacity 300ms ease";
      (root as unknown as HTMLElement).style.opacity = "0.001";
      render(target); current = target;
      requestAnimationFrame(() => { (root as unknown as HTMLElement).style.opacity = "1"; });
      return;
    }
    const from = current, start = performance.now(), dur = 600;
    const step = (now: number) => {
      if (paused) { raf = 0; return; }
      const k = Math.min(1, (now - start) / dur);
      current = from + (target - from) * k;
      render(current);
      raf = k < 1 ? requestAnimationFrame(step) : 0;
    };
    raf = requestAnimationFrame(step);
  }

  render(0);

  return {
    setProgress(t: number) { cancel(); current = clamp01(t); render(current); },
    setState(name: string) {
      if (name === "hidden") { paused = true; cancel(); return; }
      if (name === "visible") { paused = false; return; }
      const map: Record<string, number> = { done: 0.5, left: 0.8, caption: 1 };
      if (name in map) tweenTo(map[name]);
    },
    resize() { /* viewBox scales. */ },
    destroy() { cancel(); root.remove(); },
  };
}
