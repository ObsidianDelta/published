// graph fallback (board 00) — a static inline SVG of the LEVEL-2 picture: DAX at
// the centre, the three initiatives it builds, every line the Constraint Protocol
// (one legend sentence). No d3, no loop, no WebGL; same contract. For
// prefers-reduced-motion + ?lite=1. Under 20 KB. Bakes no text: node labels and the
// legend come from params.labels / params.params.graph, exactly as the full scene.
import type { SceneHandle, SceneModule, SceneParams, SceneTokens } from "../contract";

export const meta = { name: "graph", states: ["settle"] as const, needsWebGL: false };

type Labels = Record<string, string | string[]>;
interface GNode { id: string; label: string; kind: string; line: string }
interface Graph { nodes: GNode[]; edges: { from: string; to: string }[] }

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : typeof v === "string" ? v : "";
}
const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function mount(host: HTMLElement, params: SceneParams, tokens: SceneTokens): SceneHandle {
  const L: Labels = params.labels || {};
  const P = (params.params || {}) as Record<string, unknown>;
  const graph = (P.graph || { nodes: [], edges: [] }) as Graph;
  const by = new Map(graph.nodes.map((n) => [n.id, n]));
  const labelOf = (id: string): string => str(L["node_" + id]) || by.get(id)?.label || id;

  // level 2 = DAX + the three initiatives; one centre, three on a ring.
  const inits = ["metadax", "novadax", "skippydax"].filter((id) => by.has(id));
  const cx = 200, cy = 150, R = 96;
  const pos: Record<string, { x: number; y: number }> = { dax: { x: cx, y: cy } };
  inits.forEach((id, i) => {
    const ang = -Math.PI / 2 + (i / inits.length) * Math.PI * 2;
    pos[id] = { x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R };
  });

  const line = tokens.guide; // every edge is the Protocol
  const edges = inits
    .map((id) =>
      `<line x1="${cx}" y1="${cy}" x2="${pos[id].x.toFixed(1)}" y2="${pos[id].y.toFixed(1)}" stroke="${line}" stroke-width="1.2" opacity="0.5"/>`,
    )
    .join("");
  const circle = (id: string, r: number, fill: string): string =>
    `<circle cx="${pos[id].x.toFixed(1)}" cy="${pos[id].y.toFixed(1)}" r="${r}" fill="${fill}"/>` +
    `<text x="${pos[id].x.toFixed(1)}" y="${(pos[id].y + r + 13).toFixed(1)}" text-anchor="middle" font-size="12" fill="${tokens.ink}" font-family="sans-serif">${esc(labelOf(id))}</text>`;

  const nodes =
    circle("dax", 16, tokens.learner) + inits.map((id) => circle(id, 12, tokens.record)).join("");
  const legend = esc(str(L.legend));

  host.innerHTML =
    `<svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" role="img" ` +
    `aria-label="The DAX Foundation as a graph: DAX builds Meta DAX, Nova DAX and Skippy DAX; every line is the Constraint Protocol.">` +
    `<g>${edges}${nodes}</g>` +
    `<text x="200" y="300" text-anchor="middle" font-size="12" fill="${tokens.inkMuted}" font-family="sans-serif">${legend}</text>` +
    `</svg>`;

  return {
    setProgress(): void { /* static */ },
    setState(): void { /* static */ },
    resize(): void { /* SVG scales with the box */ },
    destroy(): void { host.innerHTML = ""; },
  };
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
