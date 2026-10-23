// Client behaviour for the explainer (Explainer Kit v1, spec section 4 item 3).
// One idea: progress is a number. Scroll sets t in [0, 1]; we call setProgress(t).
// The page is complete and readable with every scene absent: if the registry or a
// module is missing, this renders nothing and leaves the bordered frame empty.
//
// Imported (and run) once by Chapter.astro. Astro bundles the identical <script> a
// single time, so the top-level setup here runs once however many chapters render.
import { readTokens, clamp01 } from "../../scenes/contract";
import type { SceneHandle, SceneModule } from "../../scenes/contract";

type Importer = () => Promise<unknown>;
interface Resolver {
  resolve(name: string): { load: Importer; loadFallback: Importer };
}

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LITE = new URLSearchParams(location.search).get("lite") === "1";

function hasWebGL2(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

// A module namespace exports both `default` (the SceneModule) and named members.
function asModule(ns: unknown): SceneModule | null {
  if (!ns || typeof ns !== "object") return null;
  const d = (ns as { default?: unknown }).default;
  const cand = (d && typeof d === "object" ? d : ns) as Partial<SceneModule>;
  return typeof cand.mount === "function" ? (cand as SceneModule) : null;
}

async function tryImport(fn: Importer): Promise<SceneModule | null> {
  try {
    return asModule(await fn());
  } catch {
    return null;
  }
}

async function pickModule(name: string, reg: Resolver): Promise<SceneModule | null> {
  const r = reg.resolve(name);
  // prefers-reduced-motion AND ?lite=1 forces the 2D fallback up front.
  if (REDUCED && LITE) {
    const fb = await tryImport(r.loadFallback);
    if (fb) return fb;
  }
  const full = await tryImport(r.load);
  if (full) {
    // needsWebGL true and no WebGL2 -> fall back.
    if (full.meta?.needsWebGL && !hasWebGL2()) {
      const fb = await tryImport(r.loadFallback);
      if (fb) return fb;
    }
    return full;
  }
  // No full module: the 2D fallback still counts.
  return await tryImport(r.loadFallback);
}

const handles = new Map<HTMLElement, SceneHandle>();
// The current edition's labels per frame, set by the chapter when the lens is
// applied (EXP-8a item 7). Used at mount, and pushed live via setLabels after.
const frameLabels = new Map<HTMLElement, Record<string, string | string[]>>();

/** The reader's lens changed: push the new labels to a frame (now or at mount). */
export function setFrameLabels(frame: HTMLElement, labels: Record<string, string | string[]>): void {
  frameLabels.set(frame, labels);
  const h = handles.get(frame);
  if (h && typeof h.setLabels === "function") h.setLabels(labels);
}

// The ladder depth each frame's chapter has opened (1 = the answer only).
const frameDepth = new Map<HTMLElement, number>();

/** A depth opened: tell the frame's scene, if it reacts to depth. */
export function setFrameDepth(frame: HTMLElement, depth: number): void {
  frameDepth.set(frame, depth);
  const h = handles.get(frame);
  if (h && typeof h.setDepth === "function") h.setDepth(depth);
  // 2026-10-23: opening a depth also moves the scene forward (see schedule()), so
  // "Tell me more" visibly does something even when the reader does not scroll.
  schedule();
}

/** A "Play it again" control fired: replay the frame's inversion, if the scene exports one. */
export function replayFrame(frame: HTMLElement): void {
  const h = handles.get(frame) as (SceneHandle & { replay?: () => void }) | undefined;
  if (h && typeof h.replay === "function") h.replay();
}

async function mountFrame(frame: HTMLElement): Promise<void> {
  if (handles.has(frame) || frame.dataset.mounting === "1") return;
  frame.dataset.mounting = "1";
  const name = frame.dataset.scene || "";
  let reg: Resolver | null = null;
  try {
    reg = (await import("../../scenes/registry")) as unknown as Resolver;
  } catch {
    reg = null;
  }
  if (!reg || typeof reg.resolve !== "function") {
    delete frame.dataset.mounting;
    return; // no registry -> page works without a scene
  }
  const mod = await pickModule(name, reg);
  if (!mod) {
    delete frame.dataset.mounting;
    return; // module absent -> render nothing
  }
  let params: Record<string, unknown> = {};
  try {
    params = JSON.parse(frame.dataset.sceneParams || "{}");
  } catch {
    params = {};
  }
  // 2026-10-23: the graph scene reads its topology from params.graph. The home page
  // (MapHome) passes it; a chapter that declares `scene: { module: graph }` (the map
  // chapter, foundation/00-map, shown at /explain/) did not, so the scene mounted
  // with no nodes and drew an empty box. Supply the signed graph and the run routes.
  if (name === "graph" && !params.graph) {
    try {
      const [g, r] = await Promise.all([
        import("../../data/graph.json"),
        import("../../data/run-routes.json"),
      ]);
      params = { ...params, graph: (g as any).default ?? g, routes: params.routes ?? ((r as any).default ?? r) };
    } catch { /* the page still reads without the scene */ }
  }
  // Prefer the current edition's labels (lens-aware); fall back to the chapter's
  // declared scene.params.labels when the chapter has not pushed any yet.
  const labels =
    frameLabels.get(frame) ||
    (params.labels as Record<string, string | string[]>) ||
    {};
  const tokens = readTokens();
  const handle = await mod.mount(frame, {
    labels,
    params,
    reducedMotion: REDUCED,
    locale: "en",
    maxPixelRatio: 2,
  }, tokens);
  handles.set(frame, handle);
  delete frame.dataset.mounting;
  schedule(); // give the scene its first t now, not on the first scroll event
}

// Scroll choreography: one rAF loop drives every mounted frame's setProgress(t).
//
// 2026-10-23: t was `span > 0 ? -top/span : 0`, so any chapter shorter than the
// viewport (every chapter on a desktop monitor) stayed at t = 0 forever: the scene
// never moved however the reader scrolled. Now:
//   - a chapter taller than the viewport keeps the pinned reading: t runs 0 -> 1
//     while its top travels from the viewport top to the point where its bottom
//     meets the viewport bottom;
//   - a chapter that fits on screen plays as it travels from entering the
//     viewport (top at 90% of the height) to sitting near the top (top at 10%);
//   - the ladder depth the reader opened is a floor: answer only = 0, each
//     "Tell me more" moves the scene a quarter further, so clicking visibly works.
let raf = 0;
function schedule(): void {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    const vh = window.innerHeight;
    for (const [frame, handle] of handles) {
      const section = frame.closest<HTMLElement>("[data-explain-chapter]");
      if (!section) continue;
      const rect = section.getBoundingClientRect();
      const span = rect.height - vh;
      // The graph's t is camera framing (wide -> close), not a story: its resting
      // picture is the whole graph at t = 0, so it keeps the pinned-only reading.
      if (frame.dataset.scene === "graph") {
        handle.setProgress(span > 0 ? clamp01(-rect.top / span) : 0);
        continue;
      }
      const scrollT = span > 0
        ? clamp01(-rect.top / span)
        : clamp01((vh * 0.9 - rect.top) / (vh * 0.8));
      const depth = frameDepth.get(frame) ?? 1;
      const depthT = clamp01((depth - 1) / 4);
      handle.setProgress(Math.max(scrollT, depthT));
    }
  });
}

const observers: IntersectionObserver[] = [];
let scrolling = false;

function onResize(): void {
  schedule();
  for (const h of handles.values()) h.resize();
}

function setupSection(frame: HTMLElement): void {
  const section = frame.closest<HTMLElement>("[data-explain-chapter]");
  if (!section) return;
  // Lazily mount when within one viewport; hide when it leaves by two.
  const near = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) mountFrame(frame);
    },
    { rootMargin: "100% 0px 100% 0px" }
  );
  near.observe(section);
  const far = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const h = handles.get(frame);
        if (!h) continue;
        h.setState(e.isIntersecting ? "visible" : "hidden");
      }
    },
    { rootMargin: "200% 0px 200% 0px" }
  );
  far.observe(section);
  observers.push(near, far);
}

function init(): void {
  if (REDUCED) document.documentElement.classList.add("reduced-motion");
  const frames = document.querySelectorAll<HTMLElement>("[data-scene]");
  frames.forEach(setupSection);
  if (frames.length && !scrolling) {
    scrolling = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    schedule();
  }
}

function teardown(): void {
  for (const h of handles.values()) {
    try {
      h.destroy();
    } catch {
      /* ignore */
    }
  }
  handles.clear();
  for (const o of observers) o.disconnect();
  observers.length = 0;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

// Release every resource on View Transitions navigation; re-init after each swap.
// astro:page-load fires on the initial load too, but this module is reached by a
// dynamic import from Chapter.astro, so on the first page it usually evaluates
// AFTER that event has already fired (seen on the 23 Oct preview: every frame
// empty). So: boot now when the document is already parsed, keep the listener
// for every later navigation, and never boot twice for one page.
let booted = false;
function boot(): void {
  if (booted) return;
  booted = true;
  init();
}
document.addEventListener("astro:before-swap", () => {
  teardown();
  booted = false;
});
document.addEventListener("astro:page-load", boot);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
