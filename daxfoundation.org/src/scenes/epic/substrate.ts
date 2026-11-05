// The Meta DAX epic's one WebGL scene (/metadax/epic/, 2026-11-04).
//
// One canvas, fixed behind the page. The page turns scroll into a state (camera,
// how far the network has grown, the inversion, the role swap, how dim) and hands it
// over every frame through getState(); this module only draws. Five things live here:
//   1. the horizon: the version line from 0.0.0.1 (z = 0) to 1.0 (z = -L), on a log scale;
//   2. the dot at the very start: where we are;
//   3. the substrate: learners (learner colour) and guides (guide colour) as nodes,
//      with light flowing outward along the links (knowledge compounding);
//   4. the inversion: thirty attentions on one teacher turn into thirty on one learner,
//      the guide beside her, then helpers for the guide too (it runs both ways);
//   5. a far field of faint points: everyone not on the network yet.
// Never mounted under prefers-reduced-motion: the page shows its still pictures instead.
// No text is drawn here; labels are DOM elements the page owns, positioned via project().
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, Points,
  LineSegments, ShaderMaterial, AdditiveBlending, Color, Vector3, DynamicDrawUsage,
} from "three";

export interface EpicState {
  cam: [number, number, number];
  look: [number, number, number];
  reveal: number;   // network grown out to this radius (0..90)
  net: number;      // network opacity 0..1
  cluster: number;  // inversion cluster opacity 0..1
  inv: number;      // 0 = classroom, 1 = inverted
  both: number;     // 0..1 the guide's own helpers
  swap: number;     // 0..1 roles trade places across the network
  dim: number;      // whole-scene brightness 0..1
  labels: number;   // horizon labels 0..1 (read by the page)
}

export interface EpicColors { learner: string; guide: string; record: string; ink: string; ground: string }

export interface EpicHandle {
  project(p: [number, number, number]): { x: number; y: number; on: boolean };
  /** world positions of the cluster's learner and guide this frame */
  clusterAnchors(): { learner: [number, number, number]; guide: [number, number, number] };
  resize(): void;
  destroy(): void;
}

export const HORIZON = 4000;
export const RISE = 900;
/** f in 0..1 along the version line (0 = 0.0.0.1, 1/3 = 0.0.1, 2/3 = 0.1, 1 = 1.0): the
 *  line runs away from the start and climbs, so the far milestones stand apart */
export const horizonPoint = (f: number): [number, number, number] => [0, RISE * f * f, -HORIZON * f];
export const TICKS = [1 / 3, 2 / 3, 1];

const POINT_VS = /* glsl */ `
attribute float aSize; attribute vec3 aColor; attribute vec3 aColor2; attribute float aPhase; attribute float aDist; attribute float aA;
uniform float uTime; uniform float uReveal; uniform float uAlpha; uniform float uSwap; uniform float uScale; uniform float uTwinkle;
varying vec3 vColor; varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float rev = 1.0 - smoothstep(uReveal - 6.0, uReveal, aDist);
  float age = clamp((uReveal - aDist) / 45.0, 0.0, 1.0);
  float tw = 1.0 - uTwinkle * 0.35 * (0.5 + 0.5 * sin(uTime * 1.3 + aPhase * 6.2831));
  float sw = uSwap * (0.5 + 0.5 * sin(uTime * 0.45 + aPhase * 12.0));
  vColor = mix(aColor, aColor2, sw);
  vA = rev * uAlpha * aA * tw * (0.35 + 0.65 * age);
  gl_PointSize = min(200.0, aSize * uScale * (0.75 + 0.5 * age) / max(0.1, -mv.z));
}`;
const POINT_FS = /* glsl */ `
varying vec3 vColor; varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float glow = pow(1.0 - smoothstep(0.0, 0.5, d), 2.4);
  float core = 1.0 - smoothstep(0.08, 0.16, d);
  float a = (glow * 0.85 + core * 0.6) * vA;
  if (a < 0.003) discard;
  gl_FragColor = vec4(mix(vColor, vec3(1.0), core * 0.35), a);
}`;
const LINE_VS = /* glsl */ `
attribute float aAlong; attribute float aPhase; attribute float aDist; attribute vec3 aColor; attribute float aA;
uniform float uReveal;
varying float vAlong; varying float vPhase; varying float vRev; varying vec3 vColor; varying float vA;
void main() {
  vAlong = aAlong; vPhase = aPhase; vColor = aColor; vA = aA;
  vRev = 1.0 - smoothstep(uReveal - 8.0, uReveal, aDist);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const LINE_FS = /* glsl */ `
uniform float uTime; uniform float uAlpha; uniform float uFlow; uniform float uBase; uniform float uFade; uniform vec3 uHot;
varying float vAlong; varying float vPhase; varying float vRev; varying vec3 vColor; varying float vA;
void main() {
  float head = fract(uTime * uFlow + vPhase) * 1.3 - 0.15;
  float d = vAlong - head;
  float pulse = exp(-d * d * 160.0);
  float a = (uBase + 0.95 * pulse) * vRev * uAlpha * vA * mix(1.0, 0.18, vAlong * uFade);
  if (a < 0.003) discard;
  gl_FragColor = vec4(mix(vColor, uHot, pulse), a);
}`;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgb = (c: Color) => [c.r, c.g, c.b] as const;

function pointMaterial(scale: number) {
  return new ShaderMaterial({
    vertexShader: POINT_VS, fragmentShader: POINT_FS, transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uReveal: { value: 1e6 }, uAlpha: { value: 1 }, uSwap: { value: 0 }, uScale: { value: scale }, uTwinkle: { value: 1 } },
  });
}
function lineMaterial(hot: Color, flow: number, base: number, fade = 0) {
  return new ShaderMaterial({
    vertexShader: LINE_VS, fragmentShader: LINE_FS, transparent: true, depthWrite: false, blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uReveal: { value: 1e6 }, uAlpha: { value: 1 }, uFlow: { value: flow }, uBase: { value: base }, uFade: { value: fade }, uHot: { value: hot } },
  });
}

function pointsGeometry(n: number) {
  const g = new BufferGeometry();
  const mk = (k: string, size: number) => g.setAttribute(k, new BufferAttribute(new Float32Array(n * size), size));
  mk("position", 3); mk("aColor", 3); mk("aColor2", 3); mk("aSize", 1); mk("aPhase", 1); mk("aDist", 1); mk("aA", 1);
  return g;
}
function linesGeometry(segments: number) {
  const g = new BufferGeometry();
  const n = segments * 2;
  const mk = (k: string, size: number) => g.setAttribute(k, new BufferAttribute(new Float32Array(n * size), size));
  mk("position", 3); mk("aColor", 3); mk("aAlong", 1); mk("aPhase", 1); mk("aDist", 1); mk("aA", 1);
  return g;
}
const arr = (g: BufferGeometry, k: string) => (g.getAttribute(k) as BufferAttribute).array as Float32Array;

export function mountEpic(
  canvas: HTMLCanvasElement,
  colors: EpicColors,
  getState: () => EpicState,
  onFrame: (h: EpicHandle) => void,
): EpicHandle | null {
  let renderer: WebGLRenderer;
  const narrow = Math.min(innerWidth, innerHeight) < 700;
  const dprCap = narrow ? 1.75 : 2;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: (devicePixelRatio || 1) < 1.5, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  let dpr = Math.min(devicePixelRatio || 1, dprCap);
  renderer.setPixelRatio(dpr);
  const cGround = new Color(colors.ground);
  renderer.setClearColor(cGround, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 9000);
  const L = new Color(colors.learner), G = new Color(colors.guide), R = new Color(colors.record), I = new Color(colors.ink);
  const hot = new Color("#ffe2a8");
  const rand = rng(20261104);

  // ---- far field: everyone not on the network yet ----
  const FAR = narrow ? 900 : 1600;
  const farG = pointsGeometry(FAR);
  {
    const p = arr(farG, "position"), c = arr(farG, "aColor"), c2 = arr(farG, "aColor2"), s = arr(farG, "aSize"), ph = arr(farG, "aPhase"), a = arr(farG, "aA");
    for (let i = 0; i < FAR; i++) {
      const u = rand() * 2 - 1, th = rand() * Math.PI * 2, r = 900 + rand() * 1600;
      const sq = Math.sqrt(1 - u * u);
      p[i * 3] = r * sq * Math.cos(th); p[i * 3 + 1] = Math.abs(r * u) * 0.6 + 20; p[i * 3 + 2] = r * sq * Math.sin(th) - 1200;
      c.set(rgb(R), i * 3); c2.set(rgb(R), i * 3);
      s[i] = 2.5 + rand() * 4; ph[i] = rand(); a[i] = 0.18 + rand() * 0.3;
    }
  }
  const farMat = pointMaterial(1);
  scene.add(new Points(farG, farMat));

  // ---- the substrate: learners and guides ----
  const N = narrow ? 650 : 1150;
  const netG = pointsGeometry(N);
  const pos: number[][] = [];
  {
    const p = arr(netG, "position"), c = arr(netG, "aColor"), c2 = arr(netG, "aColor2"), s = arr(netG, "aSize"), ph = arr(netG, "aPhase"), d = arr(netG, "aDist"), a = arr(netG, "aA");
    for (let i = 0; i < N; i++) {
      // a loose disc around the start, denser near it, with a few long arms
      const r = 7 + Math.pow(rand(), 0.75) * 80;
      const arm = Math.floor(rand() * 5);
      const th = arm * (Math.PI * 2 / 5) + r * 0.035 + (rand() - 0.5) * 1.1;
      const x = r * Math.cos(th), z = r * Math.sin(th) * 0.9, y = (rand() - 0.5) * (2 + r * 0.06);
      pos.push([x, y, z]);
      p.set([x, y, z], i * 3);
      const guide = rand() < 0.24;
      c.set(rgb(guide ? G : L), i * 3); c2.set(rgb(guide ? L : G), i * 3);
      s[i] = guide ? 1.9 : 1.4 + rand() * 0.6;
      ph[i] = rand(); d[i] = Math.hypot(x, z); a[i] = 1;
    }
  }
  // links: each node to its two nearest neighbours, oriented away from the start
  const edges: [number, number][] = [];
  {
    const seen = new Set<number>();
    for (let i = 0; i < N; i++) {
      let b1 = -1, b2 = -1, d1 = 1e9, d2 = 1e9;
      const [xi, , zi] = pos[i];
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const dx = pos[j][0] - xi, dz = pos[j][2] - zi, dd = dx * dx + dz * dz;
        if (dd < d1) { d2 = d1; b2 = b1; d1 = dd; b1 = j; } else if (dd < d2) { d2 = dd; b2 = j; }
      }
      for (const j of [b1, b2]) {
        if (j < 0) continue;
        const key = Math.min(i, j) * 100000 + Math.max(i, j);
        if (seen.has(key)) continue;
        seen.add(key);
        const di = Math.hypot(pos[i][0], pos[i][2]), dj = Math.hypot(pos[j][0], pos[j][2]);
        edges.push(di <= dj ? [i, j] : [j, i]);
      }
    }
  }
  const edgeG = linesGeometry(edges.length);
  {
    const p = arr(edgeG, "position"), c = arr(edgeG, "aColor"), al = arr(edgeG, "aAlong"), ph = arr(edgeG, "aPhase"), d = arr(edgeG, "aDist"), a = arr(edgeG, "aA");
    edges.forEach(([i, j], k) => {
      p.set(pos[i], k * 6); p.set(pos[j], k * 6 + 3);
      c.set(rgb(R), k * 6); c.set(rgb(R), k * 6 + 3);
      al[k * 2] = 0; al[k * 2 + 1] = 1;
      // phase by distance from the start: light leaves the centre and travels out
      const dist = Math.hypot(pos[i][0], pos[i][2]);
      ph[k * 2] = ph[k * 2 + 1] = -dist * 0.012 + rand() * 0.08;
      d[k * 2] = d[k * 2 + 1] = Math.max(dist, Math.hypot(pos[j][0], pos[j][2]));
      a[k * 2] = a[k * 2 + 1] = 0.6 + rand() * 0.4;
    });
  }
  const netMat = pointMaterial(1);
  const edgeMat = lineMaterial(hot, 0.22, 0.1);
  scene.add(new LineSegments(edgeG, edgeMat));
  scene.add(new Points(netG, netMat));

  // ---- the horizon: 0.0.0.1 -> 1.0 ----
  const HS = 120;
  const horG = linesGeometry(HS);
  {
    const p = arr(horG, "position"), c = arr(horG, "aColor"), al = arr(horG, "aAlong"), a = arr(horG, "aA");
    for (let k = 0; k < HS; k++) {
      // denser near the start, where the camera is
      const f0 = Math.pow(k / HS, 1.6), f1 = Math.pow((k + 1) / HS, 1.6);
      p.set(horizonPoint(f0), k * 6); p.set(horizonPoint(f1), k * 6 + 3);
      c.set([...rgb(R), ...rgb(R)], k * 6);
      al[k * 2] = f0; al[k * 2 + 1] = f1; a[k * 2] = a[k * 2 + 1] = 1;
    }
  }
  const horMat = lineMaterial(new Color(colors.learner), 0.05, 0.55, 1);
  scene.add(new LineSegments(horG, horMat));
  const ticks = TICKS;
  const tickG = pointsGeometry(ticks.length);
  {
    const p = arr(tickG, "position"), c = arr(tickG, "aColor"), c2 = arr(tickG, "aColor2"), s = arr(tickG, "aSize"), a = arr(tickG, "aA");
    ticks.forEach((v, i) => {
      p.set(horizonPoint(v), i * 3);
      const col = i === ticks.length - 1 ? I : R;
      c.set(rgb(col), i * 3); c2.set(rgb(col), i * 3);
      s[i] = i === ticks.length - 1 ? 70 : 34; a[i] = 0.9;
    });
  }
  const tickMat = pointMaterial(1);
  tickMat.uniforms.uTwinkle.value = 0;
  scene.add(new Points(tickG, tickMat));

  // ---- the dot at the very start: where we are ----
  const nowG = pointsGeometry(2);
  {
    const p = arr(nowG, "position"), c = arr(nowG, "aColor"), c2 = arr(nowG, "aColor2"), s = arr(nowG, "aSize"), a = arr(nowG, "aA");
    p.set([0, 0, 0, 0, 0, 0], 0);
    c.set([...rgb(L), ...rgb(L)], 0); c2.set([...rgb(L), ...rgb(L)], 0);
    s[0] = 1.1; s[1] = 3.2; a[0] = 1; a[1] = 0.35;
  }
  const nowMat = pointMaterial(1);
  nowMat.uniforms.uTwinkle.value = 0;
  scene.add(new Points(nowG, nowMat));

  // ---- the inversion cluster ----
  // 0 learner, 1 guide, 2..31 the thirty, 32..39 the guide's own helpers
  const H = 30, GH = 8, CN = 2 + H + GH;
  const cluG = pointsGeometry(CN);
  (cluG.getAttribute("position") as BufferAttribute).setUsage(DynamicDrawUsage);
  (cluG.getAttribute("aColor") as BufferAttribute).setUsage(DynamicDrawUsage);
  (cluG.getAttribute("aA") as BufferAttribute).setUsage(DynamicDrawUsage);
  {
    const s = arr(cluG, "aSize"), ph = arr(cluG, "aPhase"), a = arr(cluG, "aA");
    for (let i = 0; i < CN; i++) { s[i] = i === 0 ? 0.55 : i === 1 ? 0.5 : i < 2 + H ? 0.3 : 0.22; ph[i] = rand(); a[i] = 1; }
  }
  const cluMat = pointMaterial(1);
  cluMat.uniforms.uTwinkle.value = 0.4;
  const CL = 30 + 1 + 1 + GH;
  const cluLG = linesGeometry(CL);
  for (const k of ["position", "aA", "aColor"]) (cluLG.getAttribute(k) as BufferAttribute).setUsage(DynamicDrawUsage);
  {
    const al = arr(cluLG, "aAlong"), ph = arr(cluLG, "aPhase");
    for (let k = 0; k < CL; k++) { al[k * 2] = 0; al[k * 2 + 1] = 1; ph[k * 2] = ph[k * 2 + 1] = rand(); }
  }
  const cluLMat = lineMaterial(hot, 0.55, 0.16);
  scene.add(new LineSegments(cluLG, cluLMat));
  scene.add(new Points(cluG, cluMat));

  const seat = (i: number): [number, number, number] => {
    // 6 columns x 5 rows; seat 0 is the front middle (the learner)
    const order = i;
    const col = order % 6, row = Math.floor(order / 6);
    return [(col - 2.5) * 0.95, 0, 0.7 + row * 0.85];
  };
  const TEACHER: [number, number, number] = [0, 0, -1.9];
  const LEARNER_AT: [number, number, number] = [0, 0, 0];
  const GUIDE_AT: [number, number, number] = [1.45, 0.05, 1.05];
  const learnerSeat = seat(2); // front row, near the middle
  const lerp3 = (a: number[], b: number[], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const ease = (t: number) => t * t * (3 - 2 * t);
  const clamp = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const anchors = { learner: [0, 0, 0] as [number, number, number], guide: [0, 0, 0] as [number, number, number] };

  function updateCluster(st: EpicState, time: number) {
    const p = arr(cluG, "position"), c = arr(cluG, "aColor"), a = arr(cluG, "aA");
    const lp = arr(cluLG, "position"), la = arr(cluLG, "aA"), lc = arr(cluLG, "aColor");
    const inv = st.inv;
    const learner = lerp3(learnerSeat, LEARNER_AT, ease(clamp(inv * 1.6)));
    const guide = lerp3(TEACHER, GUIDE_AT, ease(clamp((inv - 0.25) * 1.6)));
    anchors.learner = learner; anchors.guide = guide;
    p.set(learner, 0); p.set(guide, 3);
    c.set(rgb(L), 0); c.set(rgb(G), 3);
    a[0] = 1; a[1] = 1;
    // where every attention points: the teacher, then the learner
    const target = lerp3(TEACHER, learner, ease(clamp((inv - 0.1) * 1.5)));
    let k = 0;
    const seg = (from: number[], to: number[], col: Color, alpha: number) => {
      lp.set(from, k * 6); lp.set(to, k * 6 + 3);
      lc.set(rgb(col), k * 6); lc.set(rgb(col), k * 6 + 3);
      la[k * 2] = la[k * 2 + 1] = alpha; k++;
    };
    // the learner's own line to the teacher, while the classroom stands
    seg(learner, TEACHER, R, 1 - clamp(inv * 2.5));
    for (let i = 0; i < H; i++) {
      // helper i sat at a seat (seat 2 belongs to the learner, so the last helper is new)
      const si = i < 2 ? i : i + 1;
      const from = si < 30 ? seat(si) : learnerSeat;
      const stagger = ease(clamp((inv - 0.12 - (i / H) * 0.3) * 2.2));
      const th = (i / H) * Math.PI * 2 + time * 0.06 * stagger;
      const rr = 2.55 + 0.35 * Math.sin(i * 1.7);
      const ring: [number, number, number] = [learner[0] + rr * Math.cos(th), learner[1] + 0.85 * Math.sin(i * 2.3 + time * 0.2 * stagger), learner[2] + rr * Math.sin(th) * 0.8];
      const hp = lerp3(from, ring, stagger);
      p.set(hp, (2 + i) * 3);
      // a learner in the room, then a helper (record colour)
      const col = L.clone().lerp(R, stagger);
      c.set(rgb(col), (2 + i) * 3);
      a[2 + i] = si < 30 ? 0.8 + 0.2 * stagger : stagger;
      seg(hp, target, R, (si < 30 ? 1 : stagger) * (0.55 + 0.45 * stagger));
    }
    // the guide keeps a line to her
    seg(guide, learner, G, clamp((inv - 0.55) * 3));
    // it runs both ways: helpers for the guide too
    for (let i = 0; i < GH; i++) {
      const th = (i / GH) * Math.PI * 2 - time * 0.08;
      const gp: [number, number, number] = [guide[0] + 1.05 * Math.cos(th), guide[1] + 0.4 * Math.sin(i * 1.9), guide[2] + 0.9 * Math.sin(th)];
      const b = ease(clamp((st.both - i / GH * 0.4) * 1.8));
      const at = lerp3(guide, gp, b);
      p.set(at, (2 + H + i) * 3);
      c.set(rgb(R), (2 + H + i) * 3);
      a[2 + H + i] = b;
      seg(at, guide, G, b);
    }
    for (const g of [cluG, cluLG]) for (const kk of ["position", "aColor", "aA"]) (g.getAttribute(kk) as BufferAttribute).needsUpdate = true;
  }

  // ---- size, loop, adaptive quality ----
  let w = 1, h = 1;
  function resize() {
    w = canvas.clientWidth || innerWidth; h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 64 : camera.aspect < 1.2 ? 56 : 48;
    camera.updateProjectionMatrix();
    // world size -> pixels: aSize is in world units for the near materials
    const px = (h * dpr * 0.5) / Math.tan((camera.fov * Math.PI) / 360);
    netMat.uniforms.uScale.value = px * 0.42;
    cluMat.uniforms.uScale.value = px * 0.42;
    nowMat.uniforms.uScale.value = px * 0.42;
    farMat.uniforms.uScale.value = px * 0.9;
    tickMat.uniforms.uScale.value = px * 0.42;
  }
  resize();

  const look = new Vector3();
  let raf = 0, last = performance.now(), t0 = last, slow = 0, frames = 0;
  let running = true;
  const handle: EpicHandle = {
    project(pt) {
      const v = new Vector3(pt[0], pt[1], pt[2]).project(camera);
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, on: v.z < 1 && v.z > -1 };
    },
    clusterAnchors: () => anchors,
    resize,
    destroy() {
      running = false; cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      scene.traverse((o) => {
        const m = o as unknown as { geometry?: BufferGeometry; material?: ShaderMaterial };
        m.geometry?.dispose(); m.material?.dispose();
      });
      renderer.dispose();
    },
  };

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = now - last; last = now;
    // adaptive: if frames run long for ~2 s, drop the pixel ratio once
    frames++;
    if (dt > 24) slow++;
    if (frames === 120) {
      if (slow > 50 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); resize(); }
      frames = 0; slow = 0;
    }
    const time = (now - t0) / 1000;
    const st = getState();
    // a slow breath in the camera, so nothing is ever quite still
    const sway = 0.006 * Math.min(60, Math.hypot(st.cam[0], st.cam[1], st.cam[2]));
    camera.position.set(st.cam[0] + Math.sin(time * 0.21) * sway, st.cam[1] + Math.sin(time * 0.17) * sway * 0.5, st.cam[2]);
    look.set(st.look[0], st.look[1], st.look[2]);
    camera.lookAt(look);

    const dim = st.dim;
    for (const m of [netMat, edgeMat]) { m.uniforms.uTime.value = time; m.uniforms.uReveal.value = st.reveal; m.uniforms.uAlpha.value = st.net * dim; }
    netMat.uniforms.uSwap.value = st.swap;
    farMat.uniforms.uTime.value = time; farMat.uniforms.uAlpha.value = 0.9 * dim;
    horMat.uniforms.uTime.value = time; horMat.uniforms.uAlpha.value = (0.35 + 0.65 * st.labels) * dim;
    tickMat.uniforms.uAlpha.value = st.labels * dim;
    nowMat.uniforms.uTime.value = time;
    nowMat.uniforms.uAlpha.value = dim * (1 - 0.85 * st.cluster);
    {
      const s = arr(nowG, "aSize");
      s[1] = 3.2 + 0.9 * Math.sin(time * 2.1);
      (nowG.getAttribute("aSize") as BufferAttribute).needsUpdate = true;
    }
    const cl = st.cluster * dim;
    cluMat.uniforms.uAlpha.value = cl; cluLMat.uniforms.uAlpha.value = cl;
    cluMat.uniforms.uTime.value = time; cluLMat.uniforms.uTime.value = time;
    if (cl > 0.002) updateCluster(st, time);

    renderer.render(scene, camera);
    onFrame(handle);
  }
  function onVis() {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }
  document.addEventListener("visibilitychange", onVis);
  raf = requestAnimationFrame(frame);
  return handle;
}
