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

/** A depth opened: tell the frame's scene, if it reacts to depth. */
export function setFrameDepth(frame: HTMLElement, depth: number): void {
  const h = handles.get(frame);
  if (h && typeof h.setDepth === "function") h.setDepth(depth);
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
}

// Scroll choreography: one rAF loop drives every mounted frame's setProgress(t).
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
      const sectionTop = rect.top; // viewportTop(0) - sectionTop == -rect.top
      const span = rect.height - vh;
      const t = span > 0 ? clamp01(-sectionTop / span) : 0;
      handle.setProgress(t);
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
