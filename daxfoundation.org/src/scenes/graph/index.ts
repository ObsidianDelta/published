// graph (board 00) — the DAX Foundation as ONE signed graph, in 3D. The front door.
// EXP-10b (Jason, 23 Oct 2026): the opening page should be "some kind of graph, click
// visualization, epic three.js thing" — and legible to a seventy-year-old on a phone in
// two seconds. Both, or it fails. This is the 3D scene (three.js via three/webgpu,
// WebGPU with its own WebGL2 fallback); graph/fallback.ts (EXP-10's 2D canvas) is the
// no-WebGL, reduced-data and print path, mounted here when the GPU path cannot run.
//
// The picture encodes only true things. DAX is a soft luminous core at the centre, never
// split. Meta DAX (--learner), Nova DAX (--record), Skippy DAX (--guide) are three bodies
// around it in fixed, balanced positions — Meta DAX brighter and larger, it is the one
// being built now. Every edge is the Constraint Protocol: a thin luminous filament with
// particles travelling both ways (signed interactions). From level 4 a faint geodesic
// lattice (--scene-wire) encloses the whole graph as the substrate and becomes the
// Protocol node — never a slice, a half or an island. A sparse far field is everyone this
// is for. Topology arrives in params.params.graph; every word in params.labels; no text
// and no route is baked. setLevel(n) shows nodes/edges with level <= n and births new ones
// from their nearest visible neighbour. t (scroll) drives the camera from a wide
// establishing shot to a closer framing around the core.
import type * as THREE from "three";
import type { WebGPURenderer } from "three/webgpu";
import type { SceneHandle, SceneModule, SceneParams, SceneTokens } from "../contract";
import { clamp01 } from "../contract";

export const meta = {
  name: "graph",
  states: ["settle"] as const,
  needsWebGL: true,
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

function str(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return typeof v === "string" ? v : "";
}
const ease = (x: number): number => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function hasWebGL2(): boolean {
  try { return !!document.createElement("canvas").getContext("webgl2"); }
  catch { return false; }
}

// Fixed, balanced positions (world units). Level 1 is NOT a force layout: DAX at the
// centre, three bodies around it, concepts placed between the initiatives they connect.
const POS: Record<string, [number, number, number]> = {
  dax: [0, 0, 0],
  metadax: [0, 2.35, 0.1],
  novadax: [-2.05, -1.3, 0.25],
  skippydax: [2.05, -1.3, -0.25],
  record: [-1.25, 0.55, 0.6],
  companion: [1.25, 0.55, 0.6],
  citizen: [0, -1.05, 0.95],
  learner: [0, -2.1, 0.5],
  guide: [-1.75, -1.95, -0.2],
  hdv: [-2.95, -1.35, -0.5],
  compounding: [-2.15, 1.55, -0.4],
};
// The Protocol lattice is the substrate; its node sits on the shell toward the camera.
const CP_SHELL: [number, number, number] = [0, 0.1, 3.6];
const LATTICE_R = 3.55;

// Definition-page anchors for concept nodes that have no run yet.
const CONCEPT_HREFS: Record<string, string> = {
  companion: "/definitions/#cognitive-companion",
  hdv: "/definitions/#human-delta-value",
};

interface NodeView {
  n: GNode;
  home: THREE.Vector3;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  base: number;        // base world radius
  bright: number;      // target opacity when fully shown
  prio: number;        // label priority (lower = keep first)
  p: number;           // growth 0..1
  born: THREE.Vector3; // birth source position
  btn: HTMLAnchorElement;
  labelText: HTMLSpanElement;
}

export async function mount(
  host: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
): Promise<SceneHandle> {
  const reduced = !!params.reducedMotion;
  const reducedData =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-data: reduce)").matches;

  // ---- fallback rule: no GPU path -> mount the 2D graph (identical labels and links).
  if (reducedData || !hasWebGL2()) return mountFallback(host, params, tokens);

  // Dynamic imports: three.js only loads when the 3D graph is actually shown.
  const THREE = await import("three");
  const { WebGPURenderer } = await import("three/webgpu");

  function haloTexture(color: string) {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, color);
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  function dotTexture() {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.8)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const P = (params.params || {}) as Record<string, unknown>;
  const graph = (P.graph || { nodes: [], edges: [] }) as Graph;
  const routes = (P.routes || {}) as Record<string, string>;
  let L: Labels = params.labels || {};
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  const nodeLabel = (n: GNode): string => str(L["node_" + n.id]) || n.label;
  const nodeLine = (n: GNode): string => str(L["line_" + n.id]) || n.line;
  const nodeHref = (n: GNode): string => {
    if (n.chapter && routes[n.chapter]) return routes[n.chapter];
    return CONCEPT_HREFS[n.id] || "";
  };

  const colorOf = (n: GNode): string => {
    if (n.id === "dax") return tokens.record;
    if (n.id === "metadax") return tokens.learner;
    if (n.id === "novadax") return tokens.record;
    if (n.id === "skippydax") return tokens.guide;
    if (n.kind === "protocol") return tokens.sceneWire || tokens.inkMuted;
    return tokens.inkMuted; // concepts: neutral, they never compete with the bodies
  };
  const cpColor = tokens.guide; // every filament is the Protocol: one substrate colour

  host.style.position = host.style.position || "relative";

  // ---- renderer (WebGPU, auto WebGL 2) ----
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  // touch-action: pan-y — horizontal drag orbits, vertical scrolls the page (never trapped).
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;";
  host.appendChild(canvas);

  let renderer: WebGPURenderer;
  try {
    renderer = new WebGPURenderer({ canvas, antialias: true });
    renderer.setClearColor(new THREE.Color(tokens.sceneFog), 1);
    await renderer.init(); // async: WebGPU device or WebGL 2 fallback
  } catch {
    canvas.remove();
    return mountFallback(host, params, tokens);
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(tokens.sceneFog).getHex(), 7, 18);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const camWide = new THREE.Vector3(0, 2.4, 8.7);
  const camClose = new THREE.Vector3(0, 0.5, 5.4);
  const lookWide = new THREE.Vector3(0, 0.2, 0);
  const lookClose = new THREE.Vector3(0, 0, 0);
  const camPos = camWide.clone();
  const camLook = lookWide.clone();
  camera.position.copy(camPos);
  camera.lookAt(camLook);

  // the graph group (orbit + ambient drift rotate this; the camera stays outside it)
  const group = new THREE.Group();
  scene.add(group);

  // ---- the geodesic lattice (the Protocol substrate; shown from level 4) ----
  const icosa = new THREE.IcosahedronGeometry(LATTICE_R, 1);
  const latticeGeo = new THREE.WireframeGeometry(icosa);
  icosa.dispose();
  const latticeMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(tokens.sceneWire),
    transparent: true,
    opacity: 0,
  });
  const lattice = new THREE.LineSegments(latticeGeo, latticeMat);
  group.add(lattice);

  // ---- the scale field: a sparse, very faint far shell (everyone this is for) ----
  const FIELD = 140;
  const fieldPos = new Float32Array(FIELD * 3);
  for (let i = 0; i < FIELD; i++) {
    // deterministic spherical scatter (no Math.random: stable across resumes/renderers)
    const y = 1 - (i / (FIELD - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * 2.399963229728653; // golden angle
    const rad = 7.5 + ((i * 53) % 40) / 10;
    fieldPos[i * 3] = Math.cos(phi) * r * rad;
    fieldPos[i * 3 + 1] = y * rad * 0.7;
    fieldPos[i * 3 + 2] = Math.sin(phi) * r * rad;
  }
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute("position", new THREE.BufferAttribute(fieldPos, 3));
  const fieldMat = new THREE.PointsMaterial({
    color: new THREE.Color(tokens.sceneWire),
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const field = new THREE.Points(fieldGeo, fieldMat);
  group.add(field);

  // a handful of field points quietly link to the citizen node (level 3+)
  const SCALE_LINKS = 6;
  const scaleLinkPos = new Float32Array(SCALE_LINKS * 2 * 3);
  const scaleLinkGeo = new THREE.BufferGeometry();
  scaleLinkGeo.setAttribute("position", new THREE.BufferAttribute(scaleLinkPos, 3));
  const scaleLinkMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(tokens.sceneWire),
    transparent: true,
    opacity: 0,
  });
  const scaleLinks = new THREE.LineSegments(scaleLinkGeo, scaleLinkMat);
  group.add(scaleLinks);

  // ---- node views (one mesh each; ~12 nodes, well within the draw-call budget) ----
  const sphereGeo = new THREE.SphereGeometry(1, 20, 14);
  const views: NodeView[] = [];
  const viewById = new Map<string, NodeView>();
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:absolute;inset:0;pointer-events:none;";
  const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim()
    || "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

  for (const n of graph.nodes) {
    const home = new THREE.Vector3(...(POS[n.id] || (n.id === "cp" ? CP_SHELL : [0, 0, 0])));
    const base =
      n.id === "dax" ? 0.44
        : n.id === "metadax" ? 0.34
          : n.kind === "initiative" ? 0.24
            : n.kind === "protocol" ? 0.16
              : 0.14;
    const bright =
      n.id === "metadax" ? 1
        : n.kind === "initiative" ? 0.74 // Nova/Skippy slightly dimmer: to come
          : n.kind === "protocol" ? 0.9
            : n.kind === "concept" ? 0.85
              : 1;
    const prio = n.id === "dax" ? 0 : n.kind === "initiative" ? 1 : n.kind === "protocol" ? 2 : 3;
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorOf(n)),
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(sphereGeo, mat);
    mesh.position.copy(home);
    mesh.scale.setScalar(0.0001);
    group.add(mesh);

    // the label IS the hit target and the accessible name: a real <a href> link so
    // keyboard users can Tab to nodes and screen readers announce the destination.
    const btn = document.createElement("a");
    const href = nodeHref(n);
    if (href) btn.href = href;
    btn.style.cssText =
      "position:absolute;transform:translate(-50%,-50%);display:none;align-items:center;" +
      "justify-content:center;min-width:44px;min-height:44px;padding:0;border:0;background:none;" +
      // touch-action:manipulation: allows single-tap to register as click (no 300ms delay,
      // no pan gesture swallow); the canvas itself still has touch-action:pan-y for orbit.
      "pointer-events:auto;touch-action:manipulation;cursor:pointer;color:" + tokens.ink + ";font-family:" + sans + ";text-decoration:none;";
    const labelText = document.createElement("span");
    labelText.style.cssText =
      "display:inline-block;font-size:13px;line-height:1.2;font-weight:500;letter-spacing:.01em;" +
      "text-shadow:0 1px 3px " + tokens.ground + ",0 0 6px " + tokens.ground + ";white-space:nowrap;";
    btn.appendChild(labelText);
    overlay.appendChild(btn);

    const view: NodeView = { n, home, mesh, mat, base, bright, prio, p: 0, born: home.clone(), btn, labelText };
    btn.addEventListener("click", (e) => {
      // Second tap of an already-selected node with a link: let the anchor navigate.
      if (selected === n.id && nodeHref(n)) return;
      e.preventDefault();
      onNodeActivate(view);
    });
    views.push(view);
    viewById.set(n.id, view);
  }
  host.appendChild(overlay);

  // ---- the core halo (DAX is a soft luminous core, never split) ----
  const daxView = viewById.get("dax");
  const haloTex = haloTexture(tokens.recordSoft || tokens.record);
  const haloMat = new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.setScalar(2.6);
  if (daxView) halo.position.copy(daxView.home);
  group.add(halo);

  // ---- the filaments (interaction edges) + the cp "runs under" edges (faint) ----
  const interEdges = graph.edges.filter((e) => e.from !== "cp");
  const cpEdges = graph.edges.filter((e) => e.from === "cp");

  const filPos = new Float32Array(interEdges.length * 2 * 3);
  const filGeo = new THREE.BufferGeometry();
  filGeo.setAttribute("position", new THREE.BufferAttribute(filPos, 3));
  const filMat = new THREE.LineBasicMaterial({ color: new THREE.Color(cpColor), transparent: true, opacity: 0 });
  const filaments = new THREE.LineSegments(filGeo, filMat);
  group.add(filaments);

  const cpPos = new Float32Array(cpEdges.length * 2 * 3);
  const cpGeo = new THREE.BufferGeometry();
  cpGeo.setAttribute("position", new THREE.BufferAttribute(cpPos, 3));
  const cpMat = new THREE.LineBasicMaterial({ color: new THREE.Color(tokens.sceneWire), transparent: true, opacity: 0 });
  const cpLines = new THREE.LineSegments(cpGeo, cpMat);
  group.add(cpLines);

  // ---- motes: two per interaction edge (one each direction), one Points draw call ----
  const MOTES = interEdges.length * 2;
  const motePos = new Float32Array(MOTES * 3);
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  const moteMat = new THREE.PointsMaterial({
    color: new THREE.Color(cpColor), map: dotTexture(), size: 0.12, sizeAttenuation: true,
    transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  group.add(motes);

  // ---- caption (lower third, --ground behind it) ----
  const caption = document.createElement("div");
  caption.setAttribute("aria-live", "polite");
  caption.style.cssText =
    "position:absolute;left:0;right:0;bottom:0;padding:14px 16px calc(14px + env(safe-area-inset-bottom));" +
    "text-align:center;pointer-events:none;font-family:" + sans + ";" +
    "background:linear-gradient(to top," + tokens.ground + " 55%,transparent);" +
    (reduced ? "transition:opacity .2s ease;" : "");
  const capMain = document.createElement("b");
  capMain.style.cssText = "display:block;color:" + tokens.ink + ";font-weight:500;font-size:15px;line-height:1.35;";
  const capSub = document.createElement("span");
  capSub.style.cssText = "display:block;color:" + tokens.inkMuted + ";font-size:13px;margin-top:2px;";
  const capOpen = document.createElement("a");
  capOpen.style.cssText =
    "display:none;margin-top:8px;pointer-events:auto;touch-action:pan-y;min-height:44px;line-height:44px;padding:0 18px;" +
    "border:1px solid " + cpColor + ";border-radius:999px;color:" + tokens.ink + ";text-decoration:none;font-size:14px;";
  capOpen.textContent = "Open";
  const capWrap = document.createElement("span");
  capWrap.style.cssText = "display:inline-block;";
  capWrap.appendChild(capOpen);
  caption.append(capMain, capSub, capWrap);
  host.appendChild(caption);

  // ---- a screen-reader-only list that mirrors the picture ----
  const srList = document.createElement("ul");
  srList.setAttribute("data-graph-sr", "");
  srList.setAttribute("aria-label", "The graph, as a list");
  srList.style.cssText =
    "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
  host.appendChild(srList);

  // ---- state ----
  let level = 1;
  let t = 0;
  let visible = true;
  let selected: string | null = null;
  let focusId: string | null = null; // the node the camera is flown to
  const cpVisible = (lv: number): boolean => lv >= 4;
  const nodeShown = (n: GNode, lv: number): boolean =>
    n.id === "cp" ? cpVisible(lv) : n.level <= lv;
  const edgeShown = (e: GEdge, lv: number): boolean =>
    e.level <= lv && nodeShown(byId.get(e.from)!, lv) && nodeShown(byId.get(e.to)!, lv);

  function visibleNodeViews(): NodeView[] {
    return views.filter((v) => v.p > 0.02 || nodeShown(v.n, level));
  }

  // ---- geometry / resize ----
  // Base camera Z values at wide/close framing (sufficient at desktop aspect ≥ 1).
  const CAM_WIDE_Z0 = 8.7;
  const CAM_CLOSE_Z0 = 5.4;
  function fit(): void {
    const w = host.clientWidth || 600;
    const h = host.clientHeight || 480;
    const aspect = w / h;
    // On narrow viewports (portrait phone) the horizontal FOV shrinks, pushing
    // the extreme level-1 nodes (novadax/skippydax at x=±2.05) toward the
    // canvas edge. Pull the camera back so the node sphere + label half-width
    // (≈56 px) stay inside the frame. At aspect ≥ 1 the base Z is sufficient.
    const extentWorld = 2.05 + 0.24; // node x + sphere radius
    const f = 1 / Math.tan(Math.PI / 8); // 1/tan(22.5°) ≈ 2.414
    const labelNdc = Math.min(0.25, 56 / Math.max(w, 56)); // label half-width in NDC
    const targetNdc = Math.max(0.1, 1 - labelNdc - 0.04);
    const zMin = (extentWorld * f) / (aspect * targetNdc);
    camWide.z = Math.max(CAM_WIDE_Z0, zMin);
    camClose.z = Math.max(CAM_CLOSE_Z0, zMin * (CAM_CLOSE_Z0 / CAM_WIDE_Z0));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, params.maxPixelRatio || 2));
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { fit(); renderOnce(); });
  ro.observe(host);
  fit();

  // ---- levels: birth from nearest visible neighbour; fold back ----
  function nearestVisibleNeighbour(id: string): THREE.Vector3 {
    for (const e of graph.edges) {
      if (e.from === id && (viewById.get(e.to)?.p ?? 0) > 0.3) return viewById.get(e.to)!.mesh.position.clone();
      if (e.to === id && (viewById.get(e.from)?.p ?? 0) > 0.3) return viewById.get(e.from)!.mesh.position.clone();
    }
    const dax = viewById.get("dax");
    return dax ? dax.home.clone() : new THREE.Vector3();
  }
  function applyLevel(lv: number, animate: boolean): void {
    for (const v of views) {
      const want = nodeShown(v.n, lv);
      if (want && v.p <= 0.02) v.born.copy(animate && !reduced ? nearestVisibleNeighbour(v.n.id) : v.home);
      if (!animate || reduced) v.p = want ? 1 : 0;
    }
    updateSr();
  }

  // ---- captions ----
  function setBaseCaption(): void {
    capOpen.style.display = "none";
    capSub.textContent = "";
    // levels 1-2: the Protocol is the filaments + one legend line (never a half).
    if (level < 4) { capMain.textContent = str(L.legend); capMain.style.color = tokens.inkMuted; }
    else { capMain.textContent = str(L.tapHint) || ""; capMain.style.color = tokens.inkMuted; }
    capMain.style.fontWeight = "400";
  }
  function showNodeCaption(v: NodeView): void {
    capMain.textContent = nodeLine(v.n);
    capMain.style.color = tokens.ink;
    capMain.style.fontWeight = "500";
    capSub.textContent = nodeLabel(v.n);
    const url = v.n.chapter ? routes[v.n.chapter] : "";
    // no "Open" for the run the reader is already in
    const here = typeof location !== "undefined" && url && location.pathname.startsWith(url);
    if (url && !here) { capOpen.href = url; capOpen.style.display = "inline-block"; }
    else { capOpen.style.display = "none"; }
    if (reduced) { caption.style.opacity = "0"; requestAnimationFrame(() => { caption.style.opacity = "1"; }); }
  }
  function showEdgeCaption(e: GEdge): void {
    capMain.textContent = str(L.edgeWhat)
      || "What makes an edge: who acted, on what, under whose authority, recorded and signed.";
    capMain.style.color = tokens.ink;
    capMain.style.fontWeight = "500";
    capSub.textContent = e.type ? "— " + e.type : "";
    capOpen.style.display = "none";
  }

  // ---- select / focus (tap a node → fly to it; tap empty → fly back) ----
  function flyTo(id: string | null): void {
    focusId = id;
    if (reduced) { camPos.copy(desiredPos(tmpV)); camLook.copy(desiredLook(tmpV2)); return; }
    flyActive = true; flyS = 0;
    flyStartPos.copy(camPos); flyStartLook.copy(camLook);
  }
  function onNodeActivate(v: NodeView): void {
    if (dragged) return;
    if (selected === v.n.id) {
      // same destination as the label link (runs, or a definitions anchor)
      const url = nodeHref(v.n);
      if (url) { window.location.href = url; return; }
    }
    selected = v.n.id;
    showNodeCaption(v);
    flyTo(v.n.id);
    updateSr();
  }
  function onEmpty(): void {
    if (!selected) return;
    selected = null;
    setBaseCaption();
    flyTo(null);
    updateSr();
  }

  // ---- camera framing ----
  function camHomePos(out: THREE.Vector3): THREE.Vector3 { return out.lerpVectors(camWide, camClose, ease(clamp01(t))); }
  function camHomeLook(out: THREE.Vector3): THREE.Vector3 { return out.lerpVectors(lookWide, lookClose, ease(clamp01(t))); }
  const _wp = new THREE.Vector3();
  function desiredPos(out: THREE.Vector3): THREE.Vector3 {
    if (focusId) {
      const v = viewById.get(focusId)!;
      v.mesh.getWorldPosition(_wp);
      // sit in front of the node, in world space, close enough to read it.
      // 2026-10-23: 2.5 sat so close that a big neighbour (the DAX core) filled the
      // frame; 3.6 keeps the node centred with its neighbours readable around it.
      return out.copy(_wp).add(new THREE.Vector3(0, 0.3 + v.base, 3.6 + v.base * 3));
    }
    return camHomePos(out);
  }
  function desiredLook(out: THREE.Vector3): THREE.Vector3 {
    if (focusId) { viewById.get(focusId)!.mesh.getWorldPosition(_wp); return out.copy(_wp); }
    return camHomeLook(out);
  }

  // ---- interaction: horizontal drag orbits; tap empty/edge; keyboard ----
  let down = false, dragged = false, downX = 0, downY = 0, lastX = 0;
  let vel = 0;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function onDown(e: PointerEvent): void {
    down = true; dragged = false; downX = lastX = e.clientX; downY = e.clientY;
    try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }
  function onMove(e: PointerEvent): void {
    if (!down) return;
    const dx = e.clientX - lastX;
    if (Math.abs(e.clientX - downX) > 5 && Math.abs(e.clientX - downX) > Math.abs(e.clientY - downY)) {
      dragged = true;
      vel = dx * 0.006;
      group.rotation.y += vel;
      focusId = null; // orbiting releases a node focus so the view follows the drag
    }
    lastX = e.clientX;
  }
  function onUp(e: PointerEvent): void {
    try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    if (down && !dragged) {
      // 2026-10-23: a tap on a circle selects that node (and a second tap opens its
      // run). Before, only the text label under each circle was a hit target; a tap
      // on the circle fell through to the edge picker and showed a nearby line's
      // caption, so tapping a node never opened anything.
      const node = pickNode(e.clientX, e.clientY);
      if (node) { onNodeActivate(node); }
      else {
        const edge = pickEdge(e.clientX, e.clientY);
        if (edge) { selected = null; showEdgeCaption(edge); flyTo(null); }
        else onEmpty();
      }
    }
    down = false;
    setTimeout(() => { dragged = false; }, 0); // let a suppressed button-click settle first
  }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // A node under the pointer: the sphere itself (raycast), or failing that the
  // nearest visible node centre within a finger's reach (26px), so small nodes are
  // still easy to hit on a phone.
  const _pick = new THREE.Vector3();
  function pickNode(clientX: number, clientY: number): NodeView | null {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const live = views.filter((v) => v.p > 0.5);
    const hit = raycaster.intersectObjects(live.map((v) => v.mesh), false)[0];
    if (hit) return live.find((v) => v.mesh === hit.object) || null;
    let best: NodeView | null = null, bestD = 26;
    for (const v of live) {
      v.mesh.getWorldPosition(_pick).project(camera);
      if (_pick.z > 1) continue; // behind the camera
      const sx = rect.left + ((_pick.x + 1) / 2) * rect.width;
      const sy = rect.top + ((1 - _pick.y) / 2) * rect.height;
      const d = Math.hypot(sx - clientX, sy - clientY);
      if (d < bestD) { bestD = d; best = v; }
    }
    return best;
  }

  function pickEdge(clientX: number, clientY: number): GEdge | null {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    raycaster.params.Line = { threshold: 0.12 };
    const hit = raycaster.intersectObject(filaments, false)[0];
    if (!hit) return null;
    const seg = Math.floor((hit.index ?? 0) / 2);
    return interEdges[seg] || null;
  }

  // keyboard: Escape flies back (Tab/Enter are handled by the node buttons themselves).
  function onKey(e: KeyboardEvent): void {
    if (e.key === "Escape" && selected) { e.preventDefault(); onEmpty(); (document.activeElement as HTMLElement)?.blur?.(); }
  }
  host.addEventListener("keydown", onKey);

  // ---- the screen-reader list mirrors the visible picture ----
  function updateSr(): void {
    const vis = views.filter((v) => nodeShown(v.n, level));
    const lines = vis.map((v) => `<li>${esc(nodeLabel(v.n))} — ${esc(nodeLine(v.n))}</li>`);
    const edgeCount = graph.edges.filter((e) => edgeShown(e, level)).length;
    lines.push(`<li>${edgeCount} lines, each a Constraint Protocol interaction: recorded, accountable, signed.</li>`);
    srList.innerHTML = lines.join("");
  }

  // ---- label projection + collision (core > initiatives > protocol > concepts) ----
  const _proj = new THREE.Vector3();
  function layoutLabels(): void {
    const rect = host.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const ordered = [...visibleNodeViews()].sort((a, b) => a.prio - b.prio);
    for (const v of ordered) {
      v.mesh.getWorldPosition(_proj);
      _proj.project(camera);
      const behind = _proj.z > 1;
      const x = (_proj.x * 0.5 + 0.5) * w;
      const y = (-_proj.y * 0.5 + 0.5) * h;
      const shown = v.p > 0.4 && !behind && x > -20 && x < w + 20 && y > -20 && y < h + 20;
      if (!shown) { v.btn.style.display = "none"; continue; }
      // text + selected ring + "to come" for an initiative with no live run
      const noRun = v.n.kind === "initiative" && v.n.chapter && !routes[v.n.chapter || ""];
      v.labelText.textContent = nodeLabel(v.n);
      v.btn.setAttribute("aria-label", nodeLabel(v.n) + (noRun ? " (to come)" : "") + ": " + nodeLine(v.n));
      v.labelText.style.opacity = String(Math.min(1, v.p) * (noRun ? 0.72 : 1));
      v.labelText.style.fontWeight = v.n.id === selected ? "700" : "500";
      // estimate the label box for collision; offset below the node by its radius.
      const approxW = Math.max(44, (nodeLabel(v.n).length * 7.2));
      const bx = x, by = y + 22;
      let hide = false;
      for (const r of placed) {
        if (Math.abs(bx - r.x) < (approxW + r.w) / 2 && Math.abs(by - r.y) < 17) { hide = true; break; }
      }
      if (hide) { v.btn.style.display = "none"; continue; }
      placed.push({ x: bx, y: by, w: approxW, h: 16 });
      const clampedX = Math.max(approxW / 2 + 4, Math.min(w - approxW / 2 - 4, x));
      v.btn.style.left = clampedX + "px";
      v.btn.style.top = Math.max(22, Math.min(h - 22, y + 22)) + "px";
      v.btn.style.display = "flex";
    }
  }

  // ---- the loop ----
  let raf = 0;
  let last = now();
  let drift = 0;
  let motePhase = 0;
  let flyActive = false, flyS = 0;
  const flyStartPos = new THREE.Vector3();
  const flyStartLook = new THREE.Vector3();
  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const _a = new THREE.Vector3();
  const _b = new THREE.Vector3();

  function updateEdges(): void {
    // filaments: park edges to hidden nodes off-screen to prevent stray lines.
    for (let i = 0; i < interEdges.length; i++) {
      const e = interEdges[i];
      const s = viewById.get(e.from)!, d = viewById.get(e.to)!;
      const o = i * 6;
      if (s.p < 0.05 || d.p < 0.05) {
        filPos[o] = filPos[o + 1] = filPos[o + 2] = filPos[o + 3] = filPos[o + 4] = filPos[o + 5] = 9999;
      } else {
        filPos[o] = s.mesh.position.x; filPos[o + 1] = s.mesh.position.y; filPos[o + 2] = s.mesh.position.z;
        filPos[o + 3] = d.mesh.position.x; filPos[o + 4] = d.mesh.position.y; filPos[o + 5] = d.mesh.position.z;
      }
    }
    filGeo.attributes.position.needsUpdate = true;
    // cp "runs under" edges: park when target node is hidden.
    for (let i = 0; i < cpEdges.length; i++) {
      const e = cpEdges[i];
      const d = viewById.get(e.to)!;
      const o = i * 6;
      if (d.p < 0.05) {
        cpPos[o] = cpPos[o + 1] = cpPos[o + 2] = cpPos[o + 3] = cpPos[o + 4] = cpPos[o + 5] = 9999;
      } else {
        cpPos[o] = CP_SHELL[0]; cpPos[o + 1] = CP_SHELL[1]; cpPos[o + 2] = CP_SHELL[2];
        cpPos[o + 3] = d.mesh.position.x; cpPos[o + 4] = d.mesh.position.y; cpPos[o + 5] = d.mesh.position.z;
      }
    }
    cpGeo.attributes.position.needsUpdate = true;
    // scale links: the first SCALE_LINKS field points reach to citizen
    const cit = viewById.get("citizen");
    for (let i = 0; i < SCALE_LINKS; i++) {
      const o = i * 6;
      scaleLinkPos[o] = fieldPos[i * 3]; scaleLinkPos[o + 1] = fieldPos[i * 3 + 1]; scaleLinkPos[o + 2] = fieldPos[i * 3 + 2];
      if (cit) { scaleLinkPos[o + 3] = cit.mesh.position.x; scaleLinkPos[o + 4] = cit.mesh.position.y; scaleLinkPos[o + 5] = cit.mesh.position.z; }
    }
    scaleLinkGeo.attributes.position.needsUpdate = true;
  }

  function updateMotes(dt: number): void {
    if (!reduced) motePhase += dt * 0.18;
    for (let i = 0; i < interEdges.length; i++) {
      const e = interEdges[i];
      const s = viewById.get(e.from)!, d = viewById.get(e.to)!;
      _a.copy(s.mesh.position); _b.copy(d.mesh.position);
      const vis = Math.min(s.p, d.p);
      // two motes, opposite directions (signed interactions both ways)
      const f1 = reduced ? 0.33 : (motePhase + i * 0.37) % 1;
      const f2 = reduced ? 0.66 : 1 - ((motePhase + i * 0.61) % 1);
      const m1 = i * 2, m2 = i * 2 + 1;
      motePos[m1 * 3] = _a.x + (_b.x - _a.x) * f1; motePos[m1 * 3 + 1] = _a.y + (_b.y - _a.y) * f1; motePos[m1 * 3 + 2] = _a.z + (_b.z - _a.z) * f1;
      motePos[m2 * 3] = _a.x + (_b.x - _a.x) * f2; motePos[m2 * 3 + 1] = _a.y + (_b.y - _a.y) * f2; motePos[m2 * 3 + 2] = _a.z + (_b.z - _a.z) * f2;
      if (vis < 0.4) { motePos[m1 * 3 + 1] = 9999; motePos[m2 * 3 + 1] = 9999; } // park hidden motes
    }
    moteGeo.attributes.position.needsUpdate = true;
  }

  function step(dt: number): void {
    // growth toward target (births ~0.75s)
    const rate = reduced ? 1 : dt / 0.75;
    for (const v of views) {
      const target = nodeShown(v.n, level) ? 1 : 0;
      if (v.p < target) v.p = Math.min(target, v.p + rate);
      else if (v.p > target) v.p = Math.max(target, v.p - rate);
      const e = ease(clamp01(v.p));
      v.mesh.position.lerpVectors(v.born, v.home, e);
      v.mesh.scale.setScalar(Math.max(0.0001, e * v.base));
      v.mat.opacity = e * v.bright;
    }
    const daxv = viewById.get("dax");
    if (daxv) { halo.position.copy(daxv.mesh.position); haloMat.opacity = ease(clamp01(daxv.p)) * 0.9; }

    // substrate visibility
    const latOn = cpVisible(level) ? ease(clamp01(viewById.get("cp")?.p ?? 0)) : 0;
    latticeMat.opacity = latOn * 0.5;
    cpMat.opacity = latOn * 0.28;
    scaleLinkMat.opacity = (level >= 3 ? 1 : 0) * 0.16;

    // filament opacity rides the reveal
    filMat.opacity = 0.55;
    moteMat.opacity = reduced ? 0.6 : 0.9;

    updateEdges();
    updateMotes(dt);

    // ambient drift (not while reduced, hidden or focused)
    if (!reduced && !focusId && !down) { drift += dt * 0.02; group.rotation.y += dt * 0.012; }
    // inertia after an orbit flick
    if (!down && Math.abs(vel) > 1e-5) { group.rotation.y += vel; vel *= 0.92; } else if (!down) vel = 0;
    lattice.rotation.y = -group.rotation.y * 0.15; // the shell barely counter-rotates

    // camera
    const dp = desiredPos(tmpV), dl = desiredLook(tmpV2);
    if (flyActive && !reduced) {
      flyS = Math.min(1, flyS + dt / 0.7); // 700 ms flight
      const k = ease(flyS);
      camPos.lerpVectors(flyStartPos, dp, k);
      camLook.lerpVectors(flyStartLook, dl, k);
      if (flyS >= 1) flyActive = false;
    } else {
      camPos.copy(dp); camLook.copy(dl);
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    layoutLabels();
  }

  function renderOnce(): void {
    step(0);
    renderer.renderAsync(scene, camera);
  }
  function frame(): void {
    if (!visible) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    const n = now();
    const dt = Math.min(0.05, (n - last) / 1000);
    last = n;
    step(dt);
    renderer.renderAsync(scene, camera);
  }
  function start(): void { if (!raf && visible) { last = now(); raf = requestAnimationFrame(frame); } }
  function stop(): void { if (raf) cancelAnimationFrame(raf); raf = 0; }

  // pause when off-screen and when the document is hidden
  const io = new IntersectionObserver((es) => {
    for (const en of es) {
      if (en.isIntersecting) { visible = true; if (!document.hidden) start(); }
      else { visible = false; stop(); }
    }
  }, { rootMargin: "100% 0px 100% 0px" });
  io.observe(host);
  const onVis = (): void => { if (document.hidden) stop(); else if (visible) start(); };
  document.addEventListener("visibilitychange", onVis);

  // ---- first paint ----
  // 2026-10-23: a chapter can open the graph at a reading level and on one node
  // (params.level 1-5, params.focus = a node id), so a run's chapters show the
  // live graph flown to their own part of it instead of a placeholder card.
  const startLevel = Number(P.level);
  if (startLevel >= 1 && startLevel <= 5) level = Math.round(startLevel);
  applyLevel(level, false);
  setBaseCaption();
  const startFocus = typeof P.focus === "string" ? viewById.get(P.focus) : undefined;
  if (startFocus && nodeShown(startFocus.n, level)) {
    selected = startFocus.n.id;
    showNodeCaption(startFocus);
    flyTo(startFocus.n.id);
  }
  updateSr();
  renderOnce();
  if (!reduced) start(); else renderOnce();

  // ---- the handle (the kit contract + setLevel) ----
  const handle: SceneHandle & { setLevel(n: number): void } = {
    setProgress(n: number): void { t = clamp01(n); if (!raf) renderOnce(); },
    setState(name: string): void {
      if (name === "hidden") { visible = false; stop(); }
      else if (name === "visible") { visible = true; if (!document.hidden) start(); renderOnce(); }
    },
    resize(): void { fit(); renderOnce(); },
    setLabels(labels: Labels): void {
      L = labels || {};
      if (selected) { const v = viewById.get(selected); if (v) showNodeCaption(v); } else setBaseCaption();
      updateSr();
      if (!raf) renderOnce();
    },
    setDepth(_d: number): void { /* the map reads by level, not ladder depth */ },
    setLevel(n: number): void {
      const lv = Math.max(1, Math.min(5, Math.round(n)));
      if (lv === level) return;
      level = lv; selected = null; focusId = null;
      applyLevel(lv, true);
      setBaseCaption();
      if (!raf) renderOnce();
    },
    destroy(): void {
      stop();
      io.disconnect(); ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      sphereGeo.dispose();
      latticeGeo.dispose(); fieldGeo.dispose(); scaleLinkGeo.dispose();
      filGeo.dispose(); cpGeo.dispose(); moteGeo.dispose();
      latticeMat.dispose(); fieldMat.dispose(); scaleLinkMat.dispose();
      filMat.dispose(); cpMat.dispose(); moteMat.dispose(); haloMat.dispose();
      (moteMat.map as THREE.Texture | null)?.dispose();
      haloTex.dispose();
      for (const v of views) v.mat.dispose();
      renderer.dispose();
      canvas.remove(); overlay.remove(); caption.remove(); srList.remove();
    },
  };
  return handle;
}

// ---- helpers ----
function now(): number { return typeof performance !== "undefined" ? performance.now() : 0; }
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function mountFallback(host: HTMLElement, params: SceneParams, tokens: SceneTokens): Promise<SceneHandle> {
  const ns = (await import("./fallback")) as { default?: SceneModule; mount?: SceneModule["mount"] };
  const mod = (ns.default && typeof ns.default === "object" ? ns.default : ns) as Partial<SceneModule>;
  return mod.mount!(host, params, tokens) as SceneHandle;
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
