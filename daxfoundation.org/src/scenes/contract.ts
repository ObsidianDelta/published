// The scene contract for the DAX Foundation explainer (Explainer Kit v1).
// Landed by FABLES on 2026-10-23 from state/daxfoundation/EXPLAINER-KIT-SPEC.md section 5.
// Read-only for every EXP ask: scenes implement it, the layout calls it, renderers reuse it.
//
// One idea: progress is a number. On the page, scroll sets t in [0, 1]. A video renderer steps t
// per frame, a deck per slide, the companion per sentence. A scene never knows which.

/** Colours a scene may use. Every value is a CSS colour string taken from tokens.css at mount. */
export interface SceneTokens {
  ground: string;
  surface: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  line: string;
  learner: string;
  learnerSoft: string;
  guide: string;
  guideSoft: string;
  record: string;
  recordSoft: string;
  sceneFog: string;
  sceneWire: string;
}

/** What the chapter hands the scene. A scene bakes no text: every label arrives here. */
export interface SceneParams {
  /** Labels and captions, keyed by the scene's README; plain strings in the page's language. */
  labels: Record<string, string | string[]>;
  /** Chapter-specific numbers and switches, as declared in the chapter's frontmatter `scene.params`. */
  params: Record<string, unknown>;
  /** True when the visitor prefers reduced motion: no loops, states crossfade. */
  reducedMotion: boolean;
  /** BCP 47 tag of the page, e.g. "en" or "fr". */
  locale: string;
  /** Device pixel ratio cap the layout wants (phones: 2). */
  maxPixelRatio: number;
}

/** The handle the layout drives. */
export interface SceneHandle {
  /** t in [0, 1]. Called on every scroll frame; MUST be cheap and idempotent. */
  setProgress(t: number): void;
  /**
   * Named states the scene declares in its README, plus the reserved 'visible' and 'hidden':
   * 'hidden' MUST stop every loop and timer; 'visible' resumes them.
   */
  setState(name: string): void;
  /** The element's size changed. */
  resize(): void;
  /** Release every resource: renderer, contexts, observers, animation frames, listeners. */
  destroy(): void;
  /**
   * Optional (EXP-8a): the reader changed lens, so the chapter's labels changed.
   * A scene that bakes captions from labels re-reads them here. Appended to the
   * contract; existing scenes that omit it are unaffected (the layout feature-tests).
   */
  setLabels?(labels: Record<string, string | string[]>): void;
  /**
   * Optional (EXP-8a): the reader opened depth n of the ladder (1..5). A scene
   * that adds a layer per depth reacts here. Appended; optional for every scene.
   */
  setDepth?(depth: number): void;
}

/** A scene module: `src/scenes/<name>/index.ts` and `src/scenes/<name>/fallback.ts` both export this. */
export interface SceneModule {
  /** Human name and the states it understands, for the README check. */
  readonly meta: { name: string; states: readonly string[]; needsWebGL: boolean };
  /**
   * Mount into `el` (an empty block element the layout owns). MUST NOT touch the DOM outside `el`.
   * May return a promise (WebGPU init); the layout shows the fallback until it resolves.
   */
  mount(el: HTMLElement, params: SceneParams, tokens: SceneTokens): SceneHandle | Promise<SceneHandle>;
}

/** Clamp and guard a progress value. Scenes SHOULD run every incoming t through this. */
export function clamp01(t: number): number {
  if (Number.isNaN(t)) return 0;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Map t from a sub-range [a, b] of the chapter's scroll to a local 0..1 (clamped). */
export function segment(t: number, a: number, b: number): number {
  if (b <= a) return t >= b ? 1 : 0;
  return clamp01((t - a) / (b - a));
}

/** Read the token colours off the document, once per mount. */
export function readTokens(root: Element = document.documentElement): SceneTokens {
  const cs = getComputedStyle(root);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    ground: v('--ground'),
    surface: v('--surface'),
    ink: v('--ink'),
    inkMuted: v('--ink-muted'),
    inkFaint: v('--ink-faint'),
    line: v('--line'),
    learner: v('--learner'),
    learnerSoft: v('--learner-soft'),
    guide: v('--guide'),
    guideSoft: v('--guide-soft'),
    record: v('--record'),
    recordSoft: v('--record-soft'),
    sceneFog: v('--scene-fog'),
    sceneWire: v('--scene-wire'),
  };
}
