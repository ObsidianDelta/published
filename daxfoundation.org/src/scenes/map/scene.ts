// Shared implementation for the `map` scene (board 00). index.ts enables animation,
// fallback.ts disables it. All colours come from `tokens`; all text from `params.labels`.
import type { SceneHandle, SceneParams, SceneTokens } from "../contract";
import { clamp01, segment } from "../contract";

const NS = "http://www.w3.org/2000/svg";
const CX = 195;
const CY = 160;
const R = 150;
const RING_LEN = 2 * Math.PI * R; // ~942.48

type El = SVGElement;
function svg(tag: string, attrs: Record<string, string | number> = {}): El {
  const n = document.createElementNS(NS, tag) as El;
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  return n;
}
function label(x: number, y: number, text: string, fill: string, size: number, weight = 400, anchor = "middle"): El {
  const t = svg("text", { x, y, fill, "text-anchor": anchor, "font-size": size, "font-weight": weight });
  t.setAttribute("font-family", "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif");
  t.textContent = text;
  return t;
}
const str = (v: string | string[] | undefined, dflt = ""): string =>
  Array.isArray(v) ? v.join(", ") : (v ?? dflt);

export function createMapScene(
  el: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
  opts: { animated: boolean },
): SceneHandle {
  const L = params.labels;
  const reduced = params.reducedMotion || !opts.animated;

  const root = svg("svg", {
    viewBox: "0 0 390 440",
    width: "100%",
    height: "100%",
    preserveAspectRatio: "xMidYMid meet",
    role: "img",
  });
  root.setAttribute("aria-label", str(L.ring, "The DAX map"));
  (root as unknown as HTMLElement).style.display = "block";

  // Outer record ring.
  const ring = svg("circle", {
    cx: CX, cy: CY, r: R, fill: "none",
    stroke: tokens.record, "stroke-width": 2,
    "stroke-dasharray": RING_LEN, "stroke-dashoffset": RING_LEN,
    "stroke-linecap": "round",
  });

  // Two halves (left = Preservation / guide, right = Expansion / learner).
  const leftHalf = svg("g", { opacity: 0 });
  const rightHalf = svg("g", { opacity: 0 });
  (leftHalf as unknown as HTMLElement).style.transition = reduced ? "opacity 300ms ease" : "transform 180ms ease";
  (rightHalf as unknown as HTMLElement).style.transition = reduced ? "opacity 300ms ease" : "transform 180ms ease";

  const leftArc = svg("path", { d: `M ${CX} ${CY - R} A ${R} ${R} 0 0 0 ${CX} ${CY + R} Z`, fill: tokens.guideSoft });
  const rightArc = svg("path", { d: `M ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX} ${CY + R} Z`, fill: tokens.learnerSoft });

  leftHalf.appendChild(leftArc);
  leftHalf.appendChild(label(CX - 78, CY - 10, str(L.left, "Preservation"), tokens.ink, 15, 500));
  leftHalf.appendChild(label(CX - 78, CY + 12, str(L.leftName), tokens.ink, 12));
  leftHalf.appendChild(label(CX - 78, CY + 30, str(L.leftNote), tokens.inkMuted, 9));

  rightHalf.appendChild(rightArc);
  rightHalf.appendChild(label(CX + 78, CY - 10, str(L.right, "Expansion"), tokens.ink, 15, 500));
  rightHalf.appendChild(label(CX + 78, CY + 12, str(L.rightName), tokens.ink, 12));
  rightHalf.appendChild(label(CX + 78, CY + 30, str(L.rightNote), tokens.inkMuted, 9));

  // Thin ground-coloured divider down the diameter.
  const divider = svg("line", { x1: CX, y1: CY - R, x2: CX, y2: CY + R, stroke: tokens.ground, "stroke-width": 2 });

  // Caption (the DAX line) under the circle.
  const ringLabel = label(CX, CY + R + 26, str(L.ring), tokens.inkMuted, 11);

  // "To come": two dashed record circles with a record thread (the door).
  const ahead = svg("g", { opacity: 0 });
  const THREAD = `M ${CX + 60} ${CY + R - 6} C ${CX + 60} ${CY + R + 20}, ${CX} ${CY + R + 30}, ${CX - 70} ${CY + R + 58}`;
  const thread = svg("path", {
    d: THREAD, fill: "none", stroke: tokens.record, "stroke-width": 1.5,
    "stroke-dasharray": 260, "stroke-dashoffset": 260,
  });
  ahead.appendChild(label(CX, CY + R + 60, str(L.ahead, "To come"), tokens.inkFaint, 11, 500));
  const mkDashed = (x: number, text: string) => {
    const g = svg("g");
    g.appendChild(svg("circle", { cx: x, cy: CY + R + 100, r: 22, fill: "none", stroke: tokens.record, "stroke-width": 1.5, "stroke-dasharray": "4 4" }));
    g.appendChild(label(x, CY + R + 132, text, tokens.inkMuted, 10));
    return g;
  };
  ahead.appendChild(mkDashed(CX - 70, str(L.nova, "Nova DAX")));
  ahead.appendChild(mkDashed(CX + 70, str(L.skippy, "Skippy DAX")));
  ahead.insertBefore(thread, ahead.firstChild);

  root.appendChild(ring);
  root.appendChild(leftHalf);
  root.appendChild(rightHalf);
  root.appendChild(divider);
  root.appendChild(ringLabel);
  root.appendChild(ahead);
  el.appendChild(root);

  // Hover / focus lifts a half by 4px.
  const lift = (g: El, on: boolean) => {
    if (reduced) return;
    (g as unknown as HTMLElement).style.transform = on ? "translateY(-4px)" : "";
  };
  const wire = (g: El) => {
    g.setAttribute("tabindex", "0");
    g.addEventListener("pointerenter", () => lift(g, true));
    g.addEventListener("pointerleave", () => lift(g, false));
    g.addEventListener("focus", () => lift(g, true));
    g.addEventListener("blur", () => lift(g, false));
  };
  wire(leftHalf);
  wire(rightHalf);

  // Direct attribute updates from t (cheap, idempotent).
  function render(t: number) {
    const draw = segment(t, 0, 0.3);
    const fill = segment(t, 0.3, 0.6);
    const open = segment(t, 0.6, 1);
    ring.setAttribute("stroke-dashoffset", String(RING_LEN * (1 - draw)));
    leftHalf.setAttribute("opacity", String(fill));
    rightHalf.setAttribute("opacity", String(fill));
    ringLabel.setAttribute("opacity", String(fill));
    ahead.setAttribute("opacity", String(open));
    thread.setAttribute("stroke-dashoffset", String(260 * (1 - open)));
  }

  // Tween helper for setState; cancellable on hidden/destroy.
  let raf = 0;
  let paused = false;
  let current = 0;
  function cancelTween() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function tweenTo(target: number) {
    cancelTween();
    current = clamp01(current);
    if (reduced) {
      // Snap with a short opacity crossfade.
      (root as unknown as HTMLElement).style.transition = "opacity 300ms ease";
      (root as unknown as HTMLElement).style.opacity = "0.001";
      render(target);
      current = target;
      requestAnimationFrame(() => { (root as unknown as HTMLElement).style.opacity = "1"; });
      return;
    }
    const from = current;
    const start = performance.now();
    const dur = 600;
    const step = (now: number) => {
      if (paused) { raf = 0; return; }
      const k = Math.min(1, (now - start) / dur);
      current = from + (target - from) * k;
      render(current);
      if (k < 1) raf = requestAnimationFrame(step); else raf = 0;
    };
    raf = requestAnimationFrame(step);
  }

  render(0);

  return {
    setProgress(t: number) { cancelTween(); current = clamp01(t); render(current); },
    setState(name: string) {
      if (name === "hidden") { paused = true; cancelTween(); return; }
      if (name === "visible") { paused = false; return; }
      const map: Record<string, number> = { draw: 0.3, fill: 0.6, ahead: 1 };
      if (name in map) tweenTo(map[name]);
    },
    resize() { /* viewBox scales with the element; nothing to do. */ },
    destroy() { cancelTween(); root.remove(); },
  };
}
