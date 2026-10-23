// orbit — 2D fallback (no WebGL). Inline SVG + a DOM overlay for the counter and context
// text. Same four states and the same contract as index.ts, driven by one number.
// Must stay under 20 KB bundled.
import type { SceneHandle, SceneModule, SceneParams, SceneTokens } from "../contract";
import {
  ROLES,
  RINGS,
  ringPositions,
  stateForProgress,
  localProgress,
  ease,
  counterSequence,
  type OrbitState,
} from "./model";

export const meta = {
  name: "orbit",
  states: ["classroom", "invert", "context", "reverse"] as const,
  needsWebGL: false,
};

const SVG = "http://www.w3.org/2000/svg";
function el<K extends keyof SVGElementTagNameMap>(name: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG, name);
}

function strArr(v: string | string[] | undefined, fallback: string[]): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return [v];
  return fallback;
}
function str(v: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(v)) return v[0] ?? fallback;
  return typeof v === "string" ? v : fallback;
}

export function mount(host: HTMLElement, params: SceneParams, tokens: SceneTokens): SceneHandle {
  const count = typeof params.params.roles === "number" ? params.params.roles : ROLES;
  const guides = typeof params.params.guides === "number" ? params.params.guides : 3;
  const counterStart =
    typeof params.params.counterStart === "number" ? params.params.counterStart : 0;
  const L = params.labels;
  const contexts = strArr(L.contexts, ["one thing"]);
  const roleNames = strArr(L.roles, ["a role"]);
  const captions: Record<OrbitState, string> = {
    classroom: str(L.classroom, "one teacher, thirty attentions"),
    invert: str(L.invert, "one learner, thirty attentions"),
    context: str(L.contexts, "the context changes"),
    reverse: str(L.reverse, "it runs both ways"),
  };
  const counterLabel = str(L.counter, "");
  // One extra step per context change beyond the first; monotone, seeded.
  const counters = counterSequence(counterStart, contexts.length - 1, 0x04);

  host.style.position = host.style.position || "relative";
  const W = 600;
  const H = 480;
  const cx = W / 2;
  const cy = H / 2;

  const svg = el("svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("role", "img");
  svg.style.display = "block";
  svg.style.background = tokens.sceneFog;
  host.appendChild(svg);

  // rings
  const ringG = el("g");
  svg.appendChild(ringG);
  const pitch = 52;
  for (let r = 0; r < RINGS; r++) {
    const ring = el("circle");
    ring.setAttribute("cx", String(cx));
    ring.setAttribute("cy", String(cy));
    ring.setAttribute("r", String(pitch * (r + 1)));
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", tokens.sceneWire);
    ring.setAttribute("stroke-width", "1");
    ringG.appendChild(ring);
  }

  // attention lines (one per node)
  const lineG = el("g");
  svg.appendChild(lineG);
  const lines: SVGLineElement[] = [];
  for (let i = 0; i < count; i++) {
    const ln = el("line");
    ln.setAttribute("stroke", tokens.sceneWire);
    ln.setAttribute("stroke-width", "1");
    ln.setAttribute("opacity", "0.3");
    lineG.appendChild(ln);
    lines.push(ln);
  }

  // learner halo + node
  const halo = el("circle");
  halo.setAttribute("cx", String(cx));
  halo.setAttribute("cy", String(cy));
  halo.setAttribute("r", "34");
  halo.setAttribute("fill", tokens.learnerSoft || tokens.learner);
  halo.setAttribute("opacity", "0");
  svg.appendChild(halo);
  const learner = el("circle");
  learner.setAttribute("cx", String(cx));
  learner.setAttribute("cy", String(cy));
  learner.setAttribute("r", "14");
  learner.setAttribute("fill", tokens.learner);
  learner.setAttribute("opacity", "0");
  svg.appendChild(learner);

  // guide node (front in classroom; target in reverse)
  const guideFrontY = cy + pitch * 3 + 40;
  const guide = el("circle");
  guide.setAttribute("r", "9");
  guide.setAttribute("fill", tokens.guide);
  svg.appendChild(guide);

  // the thirty role nodes
  const nodeG = el("g");
  svg.appendChild(nodeG);
  const nodes: SVGCircleElement[] = [];
  for (let i = 0; i < count; i++) {
    const c = el("circle");
    c.setAttribute("r", "5");
    c.setAttribute("fill", tokens.record);
    c.setAttribute("tabindex", "0");
    c.style.cursor = "pointer";
    c.addEventListener("click", () => showRole(i));
    c.addEventListener("keydown", (ev) => {
      if ((ev as KeyboardEvent).key === "Enter") showRole(i);
    });
    nodeG.appendChild(c);
    nodes.push(c);
  }

  // DOM overlay for caption + counter (never baked into the SVG)
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:absolute;left:0;right:0;bottom:0;padding:12px 16px;pointer-events:none;" +
    "font:13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;" +
    "letter-spacing:.02em;";
  const captionEl = document.createElement("div");
  captionEl.style.cssText = `color:${tokens.record};opacity:.85;`;
  const counterEl = document.createElement("div");
  counterEl.style.cssText = `color:${tokens.learner};font-weight:600;margin-top:2px;`;
  const roleEl = document.createElement("div");
  roleEl.style.cssText = `color:${tokens.guide};margin-top:2px;min-height:1.2em;`;
  overlay.appendChild(captionEl);
  overlay.appendChild(counterEl);
  overlay.appendChild(roleEl);
  host.appendChild(overlay);

  let roleTimer: ReturnType<typeof setTimeout> | undefined;
  let roleCycle = 0;
  function showRole(i: number): void {
    const name = roleNames[(roleCycle++ + i) % roleNames.length];
    roleEl.textContent = name;
    if (roleTimer) clearTimeout(roleTimer);
    roleTimer = setTimeout(() => {
      roleEl.textContent = "";
    }, 2000);
  }

  // continuous slow rotation (per ring), unless reduced motion / hidden
  let spin = 0;
  let raf = 0;
  let running = false;
  let lastT = 0;

  function render(t: number): void {
    const state = stateForProgress(t);
    const local = ease(localProgress(t));
    // lift grows across classroom->invert; stays up afterwards
    const lift = state === "classroom" ? 0 : state === "invert" ? local : 1;
    const spins = [spin * 0.6, -spin * 0.4, spin * 0.25];
    const pos = ringPositions(count, RINGS, 1, spins, 1);

    const learnerVisible = state !== "classroom" ? 1 : 1 - 0; // learner present from invert on
    const showLearner = state === "classroom" ? 0 : 1;
    halo.setAttribute("opacity", String(showLearner * 0.9));
    learner.setAttribute("opacity", String(showLearner));
    void learnerVisible;

    // guide position: front in classroom/invert/context; eased toward centre-front in reverse
    const gx = cx;
    const gy = state === "reverse" ? cy - pitch * 3 - 30 + local * 10 : guideFrontY;
    guide.setAttribute("cx", String(gx));
    guide.setAttribute("cy", String(gy));

    for (let i = 0; i < count; i++) {
      const node = nodes[i];
      let x: number;
      let y: number;
      if (state === "classroom") {
        // rows of six facing the guide at the front
        const cols = 6;
        const col = i % cols;
        const row = Math.floor(i / cols);
        x = cx + (col - (cols - 1) / 2) * 34;
        y = cy - pitch * 1.5 + row * 30;
      } else {
        const p = pos[i];
        // ease from row layout into the ring as lift grows (invert); rings are 2D here
        const rx = cx + p.x * pitch;
        const ry = cy + p.z * pitch;
        if (state === "invert") {
          const cols = 6;
          const col = i % cols;
          const row = Math.floor(i / cols);
          const sx = cx + (col - (cols - 1) / 2) * 34;
          const sy = cy - pitch * 1.5 + row * 30;
          x = sx + (rx - sx) * lift;
          y = sy + (ry - sy) * lift;
        } else {
          x = rx;
          y = ry;
        }
      }
      node.setAttribute("cx", String(x));
      node.setAttribute("cy", String(y));

      // context swap: fade ~half out/in per context; three become guide-coloured
      let fill = tokens.record;
      let opacity = 1;
      if (state === "context") {
        const idx = Math.min(contexts.length - 1, Math.floor(local * contexts.length));
        const swappedOut = (i + idx) % 2 === 0; // about half
        opacity = swappedOut ? 0.25 : 1;
        if (!swappedOut && i < guides) fill = tokens.guide;
      } else if (state === "reverse") {
        opacity = 1;
      }
      node.setAttribute("fill", fill);
      node.setAttribute("opacity", String(opacity));

      // attention lines
      const ln = lines[i];
      if (state === "classroom") {
        // node -> guide (converging on the teacher)
        ln.setAttribute("x1", String(x));
        ln.setAttribute("y1", String(y));
        ln.setAttribute("x2", String(gx));
        ln.setAttribute("y2", String(gy));
        ln.setAttribute("opacity", "0.3");
      } else if (state === "reverse") {
        // guide -> learner (the guide deploys thirty at one learner)
        ln.setAttribute("x1", String(gx));
        ln.setAttribute("y1", String(gy));
        ln.setAttribute("x2", String(cx));
        ln.setAttribute("y2", String(cy));
        ln.setAttribute("opacity", String(0.15 + 0.3 * local));
      } else {
        // node -> learner (every attention points inward)
        ln.setAttribute("x1", String(x));
        ln.setAttribute("y1", String(y));
        ln.setAttribute("x2", String(cx));
        ln.setAttribute("y2", String(cy));
        ln.setAttribute("opacity", String(0.3 * lift));
      }
    }

    // captions
    if (state === "context") {
      const idx = Math.min(contexts.length - 1, Math.floor(local * contexts.length));
      captionEl.textContent = contexts[idx];
      const c = counters[Math.min(idx, counters.length - 1)];
      counterEl.textContent = counterLabel ? `${c} ${counterLabel}` : String(c);
    } else {
      captionEl.textContent = captions[state];
      counterEl.textContent = "";
    }
    svg.setAttribute("aria-label", captionEl.textContent || "orbit");
  }

  function loop(): void {
    if (!running) return;
    spin += 0.004;
    render(lastT);
    raf = requestAnimationFrame(loop);
  }
  function start(): void {
    if (params.reducedMotion || running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop(): void {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  render(0);
  start();

  return {
    setProgress(t: number): void {
      lastT = t;
      if (!running) render(t);
    },
    setState(name: string): void {
      if (name === "hidden") stop();
      else if (name === "visible") start();
    },
    resize(): void {
      /* SVG scales via viewBox; nothing to recompute */
    },
    destroy(): void {
      stop();
      if (roleTimer) clearTimeout(roleTimer);
      svg.remove();
      overlay.remove();
    },
  };
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
