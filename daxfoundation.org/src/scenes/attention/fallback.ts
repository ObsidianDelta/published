// attention (board 04), 2D fallback: a static SVG of the inverted picture — thirty helpers
// on one learner, the guide beside her — with the captions as DOM text. No canvas, no loop,
// no WebGL. Shown for prefers-reduced-motion + ?lite=1. Every colour comes from `tokens`;
// every word from `params.labels`; the scene bakes no text. setProgress is a no-op (the
// picture is already the resting, inverted end state); setLabels re-renders the captions.
import type { SceneHandle, SceneModule, SceneParams, SceneTokens } from "../contract";

export const meta = {
  name: "attention",
  states: ["classroom", "inverted"] as const,
  needsWebGL: false,
};

type Labels = Record<string, string | string[]>;
const str = (v: string | string[] | undefined, f: string): string =>
  Array.isArray(v) ? v[0] ?? f : typeof v === "string" && v.trim() ? v : f;

const SVG = "http://www.w3.org/2000/svg";

export function mount(host: HTMLElement, params: SceneParams, tokens: SceneTokens): SceneHandle {
  host.style.position = host.style.position || "relative";
  let L: Labels = params.labels || {};

  // A 600×420 picture scaled to fit the frame with no clipping.
  const w = 600, h = 420, cx = w / 2, cy = h / 2 - 6, R = 150;
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("aria-hidden", "true");
  svg.style.display = "block";

  const el = (name: string, attrs: Record<string, string>): SVGElement => {
    const n = document.createElementNS(SVG, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  // the guide, beside the learner
  const gx = cx + R * 0.46, gy = cy - R * 0.42;

  // thirty helper lines pointing inward, then the helper dots
  for (let i = 0; i < 30; i++) {
    const a = -Math.PI / 2 + (i / 30) * Math.PI * 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    svg.appendChild(el("line", { x1: String(x), y1: String(y), x2: String(cx), y2: String(cy),
      stroke: tokens.record, "stroke-width": "1", opacity: "0.22" }));
  }
  // the guide's line to the learner — the human part
  svg.appendChild(el("line", { x1: String(gx), y1: String(gy), x2: String(cx), y2: String(cy),
    stroke: tokens.guide, "stroke-width": "1.5", opacity: "0.6" }));
  for (let i = 0; i < 30; i++) {
    const a = -Math.PI / 2 + (i / 30) * Math.PI * 2;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    svg.appendChild(el("circle", { cx: String(x), cy: String(y), r: "3.4", fill: tokens.record }));
  }
  // the guide and its halo
  svg.appendChild(el("circle", { cx: String(gx), cy: String(gy), r: "15", fill: tokens.guide, opacity: "0.25" }));
  svg.appendChild(el("circle", { cx: String(gx), cy: String(gy), r: "8", fill: tokens.guide }));
  // the one learner, with a soft halo
  svg.appendChild(el("circle", { cx: String(cx), cy: String(cy), r: "40", fill: tokens.learnerSoft || tokens.learner, opacity: "0.35" }));
  svg.appendChild(el("circle", { cx: String(cx), cy: String(cy), r: "13", fill: tokens.learner }));
  host.appendChild(svg);

  // captions as DOM text (never baked into the SVG)
  const caption = document.createElement("div");
  caption.setAttribute("aria-live", "polite");
  caption.style.cssText =
    "position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:13px;line-height:1.35;" +
    `color:${tokens.inkMuted};pointer-events:none;padding-inline:12px;`;
  const capMain = document.createElement("b");
  capMain.style.cssText = `display:block;color:${tokens.ink};font-weight:500;font-size:14px;`;
  const capSub = document.createElement("span");
  caption.append(capMain, capSub);
  host.appendChild(caption);

  function render(): void {
    capMain.textContent = str(L.invert, "");
    capSub.textContent = str(L.both, "");
  }
  render();

  const handle: SceneHandle = {
    setProgress(): void {
      /* static: the picture is already the inverted end state */
    },
    setState(): void {
      /* no loop to start or stop */
    },
    resize(): void {
      /* the SVG scales itself via preserveAspectRatio */
    },
    destroy(): void {
      svg.remove();
      caption.remove();
    },
    setLabels(labels: Labels): void {
      L = labels || {};
      render();
    },
    setDepth(): void {
      /* the fallback shows the one inverted picture; depth adds nothing static */
    },
  };
  return handle;
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
