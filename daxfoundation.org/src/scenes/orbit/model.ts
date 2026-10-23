// orbit — pure maths. No DOM, no Three.js, no tokens. Imported by index.ts, fallback.ts
// and tests/explain/orbit.test.mjs (bundled with esbuild inside the test).
//
// Three ideas live here so they can be unit-tested without a browser:
//   1. where the thirty nodes sit — 30 positions spread evenly over 3 concentric rings;
//   2. which state a progress value t in 0..1 belongs to (boundaries 0.15 / 0.45 / 0.75);
//   3. the integrated-entities counter — a monotone sequence that steps by a seeded 20..60.

export const ROLES = 30;
export const RINGS = 3;

/** The three states' names in order, plus the slice of t each one owns. */
export const STATES = ["classroom", "invert", "context", "reverse"] as const;
export type OrbitState = (typeof STATES)[number];

/** Boundaries between the four states, in t. classroom<0.15<invert<0.45<context<0.75<reverse. */
export const STATE_BOUNDS = [0.15, 0.45, 0.75] as const;

/** Relative radii of the three rings (1:2:3), scaled by a pitch at the call site. */
export const RING_RATIOS = [1, 2, 3] as const;

/** Which ring node `i` belongs to: 0..ROLES-1 spread as evenly as possible over RINGS rings. */
export function ringOf(i: number, count = ROLES, rings = RINGS): number {
  const per = Math.floor(count / rings);
  const remainder = count - per * rings;
  // First `remainder` rings get one extra node. With 30/3 every ring gets exactly 10.
  let idx = i;
  for (let r = 0; r < rings; r++) {
    const size = per + (r < remainder ? 1 : 0);
    if (idx < size) return r;
    idx -= size;
  }
  return rings - 1;
}

/** How many nodes sit on ring `r`. */
export function ringCount(r: number, count = ROLES, rings = RINGS): number {
  const per = Math.floor(count / rings);
  const remainder = count - per * rings;
  return per + (r < remainder ? 1 : 0);
}

/** The index of node `i` within its own ring (0-based), used to space it by angle. */
export function indexInRing(i: number, count = ROLES, rings = RINGS): number {
  const r = ringOf(i, count, rings);
  let before = 0;
  for (let k = 0; k < r; k++) before += ringCount(k, count, rings);
  return i - before;
}

export interface NodePos {
  /** ring index 0..RINGS-1 */
  ring: number;
  /** radius in scene units (pitch * ratio) */
  radius: number;
  /** angle in radians around the learner at the centre */
  angle: number;
  x: number;
  y: number;
  z: number;
}

/**
 * Positions of all `count` nodes orbiting the learner at the origin.
 * `pitch` is the distance between rings (the design token space-12 at the call site).
 * `spins` rotates each ring independently (continuous orbit); pass [0,0,0] for a still frame.
 * `lift` in 0..1 eases the ring up into a shallow bowl (the invert lift-off); 0 keeps it flat.
 */
export function ringPositions(
  count = ROLES,
  rings = RINGS,
  pitch = 1,
  spins: readonly number[] = [0, 0, 0],
  lift = 1,
): NodePos[] {
  const out: NodePos[] = [];
  for (let i = 0; i < count; i++) {
    const r = ringOf(i, count, rings);
    const n = ringCount(r, count, rings);
    const within = indexInRing(i, count, rings);
    const radius = pitch * RING_RATIOS[r];
    // Even angular spacing; offset alternate rings by half a step so they don't line up.
    const base = (within / n) * Math.PI * 2;
    const angle = base + (spins[r] ?? 0) + (r % 2 === 1 ? Math.PI / n : 0);
    // Outer rings ride a touch higher so the bowl reads as depth, not a flat disc.
    const y = lift * (r - (rings - 1) / 2) * pitch * 0.35;
    out.push({
      ring: r,
      radius,
      angle,
      x: Math.cos(angle) * radius,
      y,
      z: Math.sin(angle) * radius,
    });
  }
  return out;
}

/** Which state the progress value `t` falls in. */
export function stateForProgress(t: number): OrbitState {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  if (c < STATE_BOUNDS[0]) return "classroom";
  if (c < STATE_BOUNDS[1]) return "invert";
  if (c < STATE_BOUNDS[2]) return "context";
  return "reverse";
}

/** Local 0..1 progress inside the current state's slice of t (for eased transitions). */
export function localProgress(t: number): number {
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  const edges = [0, ...STATE_BOUNDS, 1];
  for (let s = 0; s < edges.length - 1; s++) {
    const a = edges[s];
    const b = edges[s + 1];
    if (c < b || s === edges.length - 2) {
      return b <= a ? 1 : (c - a) / (b - a);
    }
  }
  return 1;
}

/** Smoothstep ease, for lifts and crossfades. */
export function ease(x: number): number {
  const c = x < 0 ? 0 : x > 1 ? 1 : x;
  return c * c * (3 - 2 * c);
}

/** Deterministic RNG (mulberry32) so the counter steps are seeded and reproducible. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The integrated-entities counter: starts at `start` and rises by a seeded 20..60 on each of
 * `swaps` context changes. Strictly monotone increasing. Returns `swaps + 1` values
 * (the start, then one after each swap).
 */
export function counterSequence(start: number, swaps: number, seed = 0x04): number[] {
  const rng = makeRng(seed);
  const out = [Math.round(start)];
  for (let s = 0; s < swaps; s++) {
    const step = 20 + Math.floor(rng() * 41); // 20..60 inclusive
    out.push(out[out.length - 1] + step);
  }
  return out;
}
