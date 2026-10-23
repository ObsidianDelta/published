// graph fallback (board 00) — the DAX Foundation as one signed graph, in 2D.
// EXP-10b: index.ts is now the 3D (three.js / WebGPU) scene; this is its fallback —
// the no-WebGL, reduced-data and print path. It is EXP-10's canvas + d3-force
// implementation, kept whole and working, behind the SAME contract and the SAME data,
// with identical labels and links. The loader mounts this when WebGPURenderer init
// rejects, the device reports no WebGL2, or prefers-reduced-data is set.
//
// Jason, 23 Oct 2026: the Constraint Protocol is not a slice; it is what the edges are
// made of. Every interaction runs under it. Reading level = how much of the graph you
// see. setLevel(n) (1..5) reveals/folds nodes; t drives a gentle settle, never a story.
// Topology arrives in params.params.graph (src/data/graph.json); every word arrives in
// params.labels (lens-specific); the scene bakes no text and no route.
import type { SceneHandle, SceneModule, SceneParams, SceneTokens } from "../contract";
import { clamp01 } from "../contract";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceX,
  forceY,
  forceCollide,
  type Simulation,
} from "d3-force";

export const meta = {
  name: "graph",
  states: ["settle"] as const,
  needsWebGL: false,
};

type Labels = Record<string, string | string[]>;

interface GNode {
  id: string;
  label: string;
  kind: "purpose" | "initiative" | "protocol" | "concept";
  level: number;
  chapter: string | null;
  line: string;
}
interface GEdge { from: string; to: string; type: string; level: number; cp?: boolean }
interface Graph { nodes: GNode[]; edges: GEdge[] }

interface SimNode extends GNode {
  x: number; y: number; vx?: number; vy?: number; fx?: number | null; fy?: number | null;
  shown: number; // 0..1 reveal
}
interface SimLink { source: SimNode | string; target: SimNode | string; type: string; level: number }

function str(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return typeof v === "string" ? v : "";
}

export function mount(host: HTMLElement, params: SceneParams, tokens: SceneTokens): SceneHandle {
  const reduced = !!params.reducedMotion;
  const P = (params.params || {}) as Record<string, unknown>;
  const graph = (P.graph || { nodes: [], edges: [] }) as Graph;
  const routes = (P.routes || {}) as Record<string, string>;
  let L: Labels = params.labels || {};

  host.style.position = host.style.position || "relative";
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;";
  host.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  // The caption is DOM text (an accessible live region), never painted on the canvas.
  const caption = document.createElement("div");
  caption.setAttribute("aria-live", "polite");
  caption.style.cssText =
    "position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:13px;line-height:1.4;" +
    `color:${tokens.inkMuted};pointer-events:none;padding-inline:14px;`;
  const capMain = document.createElement("b");
  capMain.style.cssText = `display:block;color:${tokens.ink};font-weight:500;font-size:14px;`;
  const capSub = document.createElement("span");
  caption.append(capMain, capSub);
  host.appendChild(caption);

  const cs = getComputedStyle(document.documentElement);
  const sans = cs.getPropertyValue("--font-sans").trim() || "sans-serif";

  const colorOf = (n: GNode): string =>
    n.kind === "purpose" ? tokens.learner
      : n.kind === "initiative" ? tokens.record
        : n.kind === "protocol" ? tokens.guide
          : tokens.sceneWire || tokens.inkMuted;
  const cpColor = tokens.guide; // every line is the Protocol: one colour for the substrate

  // ---- model ----
  const all: SimNode[] = graph.nodes.map((n) => ({ ...n, x: 0, y: 0, shown: 0 }));
  const byId = new Map(all.map((n) => [n.id, n]));
  let level = 1;
  let t = 0;
  let visible = true;

  // cp is substrate (lines + legend) below level 4; a node from level 4.
  const nodeShown = (n: SimNode, lv: number): boolean =>
    n.level <= lv && (n.id !== "cp" || lv >= 4);
  const edgeShown = (e: GEdge, lv: number): boolean =>
    e.level <= lv && nodeShown(byId.get(e.from)!, lv) && nodeShown(byId.get(e.to)!, lv);

  function liveNodes(): SimNode[] { return all.filter((n) => n.shown > 0.01 || nodeShown(n, level)); }
  function liveEdges(): GEdge[] { return graph.edges.filter((e) => edgeShown(e, level)); }

  // ---- geometry ----
  let W = 1, H = 1, dpr = 1, cx = 0, cy = 0, scale = 1;
  function clampNodes(): void {
    for (const n of all) {
      if (!nodeShown(n, level) && n.shown < 0.01) continue;
      const r = radiusOf(n) + 16; // node radius + label clearance
      if (n.x < r) n.x = r;
      if (n.x > W - r) n.x = W - r;
      const rt = radiusOf(n) + 4;
      if (n.y < rt) n.y = rt;
      if (n.y > H - 40 - rt - 18) n.y = H - 40 - rt - 18;
    }
  }
  function measure(): void {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    dpr = Math.min(params.maxPixelRatio || 2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    cx = W / 2; cy = (H - 40) / 2;
    scale = Math.min(W, H - 40) / 420; // phone-first: legible at 390px
  }
  const radiusOf = (n: GNode): number =>
    (n.kind === "purpose" ? 16 : n.kind === "initiative" ? 12 : n.kind === "protocol" ? 13 : 9) * Math.max(0.72, scale);

  // ---- force simulation ----
  let sim: Simulation<SimNode, undefined>;
  let links: SimLink[] = [];
  function rebuild(animate: boolean): void {
    // seed newly-appearing nodes at their nearest already-placed neighbour.
    for (const n of all) {
      const want = nodeShown(n, level);
      if (want && n.shown === 0) {
        const edge = graph.edges.find(
          (e) => (e.from === n.id && byId.get(e.to)!.shown > 0) || (e.to === n.id && byId.get(e.from)!.shown > 0),
        );
        const nb = edge ? byId.get(edge.from === n.id ? edge.to : edge.from)! : null;
        n.x = nb ? nb.x + (n.id.charCodeAt(0) % 7) - 3 : cx;
        n.y = nb ? nb.y + (n.id.charCodeAt(1) % 7) - 3 : cy;
      }
    }
    const nodes = liveNodes();
    links = liveEdges().map((e) => ({ source: e.from, target: e.to, type: e.type, level: e.level }));
    // DAX sits at the centre so the picture is stable and centred.
    const dax = byId.get("dax");
    if (dax) { dax.fx = cx; dax.fy = cy; }
    sim = forceSimulation(nodes)
      .force("link", forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(76 * scale).strength(0.35))
      .force("charge", forceManyBody().strength(-240 * scale))
      .force("x", forceX(cx).strength(0.06))
      .force("y", forceY(cy).strength(0.06))
      .force("collide", forceCollide<SimNode>().radius((d) => radiusOf(d) + 10 * scale))
      .stop();
    if (reduced || !animate) {
      for (let i = 0; i < 300; i++) sim.tick();
      clampNodes();
      for (const n of nodes) n.shown = 1;
      draw();
    } else {
      sim.alpha(0.9).restart();
    }
  }

  // ---- draw ----
  function screen(n: SimNode): { x: number; y: number } { return { x: n.x, y: n.y }; }
  function nodeLabel(n: GNode): string { return str(L["node_" + n.id]) || n.label; }
  function nodeLine(n: GNode): string { return str(L["line_" + n.id]) || n.line; }

  function draw(): void {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.textBaseline = "middle";
    const reveal = 0.9 + 0.1 * clamp01(t);

    // edges: every line is the Constraint Protocol (the substrate colour).
    for (const lk of links) {
      const s = lk.source as SimNode, d = lk.target as SimNode;
      const a = Math.min(s.shown, d.shown) * reveal;
      if (a <= 0.01) continue;
      ctx.globalAlpha = 0.5 * a;
      ctx.strokeStyle = cpColor;
      ctx.lineWidth = 1 * Math.max(0.8, scale);
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      // a mote travelling the edge = the signed action on it (not in reduced motion).
      if (!reduced && t > 0.5) {
        const f = ((now() / 2600) + (s.x + d.y) * 0.001) % 1;
        ctx.globalAlpha = 0.8 * a * Math.sin(f * Math.PI);
        ctx.fillStyle = cpColor;
        ctx.beginPath(); ctx.arc(s.x + (d.x - s.x) * f, s.y + (d.y - s.y) * f, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // nodes
    for (const n of liveNodes()) {
      const a = n.shown * reveal;
      if (a <= 0.01) continue;
      const r = radiusOf(n);
      if (n.kind === "purpose") {
        const g = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 2.8);
        g.addColorStop(0, hexA(colorOf(n), 0.3 * a)); g.addColorStop(1, hexA(colorOf(n), 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, r * 2.8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = colorOf(n);
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
      if (n.id === selected) {
        ctx.globalAlpha = a; ctx.strokeStyle = tokens.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = tokens.ink;
      ctx.font = (n.kind === "concept" ? "11px " : "12px ") + sans;
      ctx.textAlign = "center";
      ctx.fillText(nodeLabel(n), n.x, n.y + r + 11);
    }
    ctx.globalAlpha = 1;
  }

  // ---- caption ----
  function setCaption(main: string, sub: string): void { capMain.textContent = main; capSub.textContent = sub; }
  function baseCaption(): void {
    // level 1-2: the Protocol is the lines + one legend sentence (never a half).
    const legend = str(L.legend);
    setCaption(level < 4 ? legend : "", selected ? "" : str(L.tapHint));
  }

  // ---- interaction ----
  let selected: string | null = null;
  let lastTapId: string | null = null;
  let drag: { id: string; dx: number; dy: number; moved: boolean } | null = null;
  function at(e: PointerEvent): { x: number; y: number } {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function hitNode(p: { x: number; y: number }): SimNode | null {
    let best: SimNode | null = null, bd = 1e9;
    for (const n of liveNodes()) {
      if (n.shown < 0.5) continue;
      const d = Math.hypot(p.x - n.x, p.y - n.y);
      if (d < radiusOf(n) + 8 && d < bd) { bd = d; best = n; }
    }
    return best;
  }
  function hitEdge(p: { x: number; y: number }): SimLink | null {
    let best: SimLink | null = null, bd = 7;
    for (const lk of links) {
      const s = lk.source as SimNode, d = lk.target as SimNode;
      const dist = segDist(p.x, p.y, s.x, s.y, d.x, d.y);
      if (dist < bd) { bd = dist; best = lk; }
    }
    return best;
  }
  function onDown(e: PointerEvent): void {
    const p = at(e);
    const n = hitNode(p);
    if (n) {
      drag = { id: n.id, dx: n.x - p.x, dy: n.y - p.y, moved: false };
      try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
  }
  function onMove(e: PointerEvent): void {
    if (!drag) return;
    const p = at(e), n = byId.get(drag.id)!;
    n.fx = Math.max(12, Math.min(W - 12, p.x + drag.dx));
    n.fy = Math.max(12, Math.min(H - 48, p.y + drag.dy));
    drag.moved = true;
    if (!reduced) sim.alpha(0.3).restart(); else { for (let i = 0; i < 60; i++) sim.tick(); draw(); }
  }
  function onUp(e: PointerEvent): void {
    const p = at(e);
    if (drag && !drag.moved) {
      // a tap, not a drag: select the node; a second tap opens its run.
      const n = byId.get(drag.id)!;
      if (n.id !== "dax") { n.fx = null; n.fy = null; }
      if (selected === n.id && lastTapId === n.id) {
        const url = n.chapter ? routes[n.chapter] : "";
        if (url) { window.location.href = url; drag = null; return; }
      }
      selected = n.id; lastTapId = n.id;
      setCaption(nodeLabel(n), routes[n.chapter || ""] ? "  ·  tap again to open" : "");
      capMain.textContent = nodeLine(n);
      draw();
      drag = null;
      return;
    }
    if (drag) { const n = byId.get(drag.id)!; if (n.id !== "dax") { /* leave pinned where dropped */ } drag = null; return; }
    // tap on empty / an edge
    const edge = hitEdge(p);
    if (edge) {
      selected = null;
      setCaption(str(L.edgeWhat), "");
      capSub.textContent = "— " + (edge.type || "");
      draw();
    }
  }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ---- loop ----
  let raf = 0;
  const now = (): number => (typeof performance !== "undefined" ? performance.now() : 0);
  function frame(): void {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    if (!reduced && sim) {
      sim.tick();
      clampNodes();
      for (const n of liveNodes()) if (n.shown < 1 && nodeShown(n, level)) n.shown = Math.min(1, n.shown + 0.06);
      for (const n of all) if (!nodeShown(n, level) && n.shown > 0) n.shown = Math.max(0, n.shown - 0.08);
    }
    draw();
  }
  function start(): void { if (!raf && !reduced) raf = requestAnimationFrame(frame); }
  function stop(): void { if (raf) cancelAnimationFrame(raf); raf = 0; }

  measure();
  rebuild(false);
  for (const n of all) n.shown = nodeShown(n, level) ? 1 : 0;
  baseCaption();
  draw();
  if (!reduced) start();

  const ro = new ResizeObserver(() => { measure(); if (reduced) { rebuild(false); } draw(); });
  ro.observe(host);

  const handle: SceneHandle & { setLevel(n: number): void } = {
    setProgress(n: number): void { t = clamp01(n); if (!raf) draw(); },
    setState(name: string): void {
      if (name === "hidden") { visible = false; stop(); }
      else if (name === "visible") { visible = true; start(); if (reduced) draw(); }
    },
    resize(): void { measure(); draw(); },
    destroy(): void {
      stop(); ro.disconnect(); if (sim) sim.stop();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.remove(); caption.remove();
    },
    setLabels(labels: Labels): void { L = labels || {}; if (!selected) baseCaption(); draw(); },
    setDepth(_d: number): void { /* the map uses levels, not ladder depth */ },
    setLevel(n: number): void {
      const lv = Math.max(1, Math.min(5, Math.round(n)));
      if (lv === level) return;
      level = lv; selected = null; lastTapId = null;
      rebuild(true); baseCaption();
      if (reduced || !raf) draw();
    },
  };
  return handle;
}

// ---- helpers ----
function hexA(hex: string, a: number): string {
  const h = (hex || "#888").replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const len = dx * dx + dy * dy || 1;
  let tt = ((px - ax) * dx + (py - ay) * dy) / len;
  tt = tt < 0 ? 0 : tt > 1 ? 1 : tt;
  return Math.hypot(px - (ax + dx * tt), py - (ay + dy * tt));
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
