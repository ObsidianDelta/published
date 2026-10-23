// orbit (board 04) — the full Three.js scene. WebGPU with automatic WebGL 2 fallback.
// The inversion is attention, not headcount: a classroom of thirty attentions on one
// teacher turns inside out into thirty attentions on one learner — and, both ways, a
// guide who deploys thirty at one learner. One number drives all of it: setProgress(t).
//
// Colours come only from `tokens` (learner, guide, record, sceneWire, sceneFog, learnerSoft).
// No text is baked into the canvas: the counter and context label live in a DOM overlay.
import * as THREE from "three";
import { WebGPURenderer } from "three/webgpu";
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
  needsWebGL: true,
};

function strArr(v: string | string[] | undefined, fallback: string[]): string[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return [v];
  return fallback;
}
function str(v: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(v)) return v[0] ?? fallback;
  return typeof v === "string" ? v : fallback;
}

/** A soft radial halo sprite texture in a CSS colour (accepts #rrggbbaa). */
function haloTexture(color: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const g = canvas.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export async function mount(
  host: HTMLElement,
  params: SceneParams,
  tokens: SceneTokens,
): Promise<SceneHandle> {
  const count = typeof params.params.roles === "number" ? params.params.roles : ROLES;
  const guides = typeof params.params.guides === "number" ? params.params.guides : 3;
  // Node sizes come from tokens (--node-learner 28px, --node-guide 18px, --node-role 10px),
  // never literals. px → world scalar by a factor tuned so the defaults land where they were;
  // fit() scales them to the frame so a phone never shows oversized nodes.
  const cssRoot = getComputedStyle(document.documentElement);
  const px = (name: string, fallback: number): number => {
    const n = parseFloat(cssRoot.getPropertyValue(name));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  const PX_TO_WORLD = 0.008;
  const sizeLearner = px("--node-learner", 28) * PX_TO_WORLD;
  const sizeGuide = px("--node-guide", 18) * PX_TO_WORLD;
  const sizeRole = px("--node-role", 10) * PX_TO_WORLD;
  const counterStart =
    typeof params.params.counterStart === "number" ? params.params.counterStart : 0;
  const L = params.labels;
  const contexts = strArr(L.contexts, ["one thing"]);
  const roleNames = strArr(L.roles, ["a role"]);
  const captions: Record<OrbitState, string> = {
    classroom: str(L.classroom, ""),
    invert: str(L.invert, ""),
    context: "",
    reverse: str(L.reverse, ""),
  };
  const counterLabel = str(L.counter, "");
  const counters = counterSequence(counterStart, Math.max(0, contexts.length - 1), 0x04);

  host.style.position = host.style.position || "relative";

  // ---- renderer (WebGPU, auto WebGL 2) ----
  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.touchAction = "none";
  host.appendChild(canvas);

  const renderer = new WebGPURenderer({ canvas, antialias: true });
  renderer.setClearColor(new THREE.Color(tokens.sceneFog), 1);
  await renderer.init(); // async: WebGPU device or WebGL 2 fallback

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(tokens.sceneFog).getHex(), 6, 16);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const camHome = new THREE.Vector3(0, 1.5, 7);
  const camGuide = new THREE.Vector3(0, 0.2, 5.4); // eased-to in reverse (near the guide, front)
  camera.position.copy(camHome);
  camera.lookAt(0, 0, 0);

  // the orbit group (rotated by drag + continuous spin of the whole bowl)
  const group = new THREE.Group();
  scene.add(group);

  // ---- rings (thin sceneWire lines) ----
  const ringMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(tokens.sceneWire),
    transparent: true,
    opacity: 0,
  });
  const ringGeoms: THREE.BufferGeometry[] = [];
  // THREE.Line, not a closed line-loop primitive: WebGPURenderer does not support that
  // primitive (the 23 Oct preview logged ~288 warnings from it). The point list already
  // repeats the first vertex at the end (s <= seg), so a Line draws the same closed ring.
  const rings: THREE.Line[] = [];
  for (let r = 0; r < RINGS; r++) {
    const radius = r + 1;
    const seg = 96;
    const pts: number[] = [];
    for (let s = 0; s <= seg; s++) {
      const a = (s / seg) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, (r - (RINGS - 1) / 2) * 0.35, Math.sin(a) * radius);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const ring = new THREE.Line(geo, ringMat);
    ringGeoms.push(geo);
    rings.push(ring);
    group.add(ring);
  }

  // ---- learner (centre) + halo ----
  const sphereGeo = new THREE.SphereGeometry(1, 24, 16);
  const learnerMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(tokens.learner),
    transparent: true,
    opacity: 0,
  });
  const learner = new THREE.Mesh(sphereGeo, learnerMat);
  learner.scale.setScalar(sizeLearner);
  group.add(learner);

  const halo = haloTexture(tokens.learnerSoft || tokens.learner);
  const haloMat = new THREE.SpriteMaterial({
    map: halo,
    transparent: true,
    depthWrite: false,
    opacity: 0,
  });
  const haloSprite = new THREE.Sprite(haloMat);
  haloSprite.scale.setScalar(1.6);
  group.add(haloSprite);

  // ---- guide node ----
  const guideMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(tokens.guide) });
  const guide = new THREE.Mesh(sphereGeo, guideMat);
  guide.scale.setScalar(sizeGuide);
  const guideFront = new THREE.Vector3(0, -0.4, 2.6);
  guide.position.copy(guideFront);
  group.add(guide);

  // ---- the thirty role nodes (own material each, for per-node fade/recolour) ----
  const recordColor = new THREE.Color(tokens.record);
  const guideColor = new THREE.Color(tokens.guide);
  const roleMats: THREE.MeshBasicMaterial[] = [];
  const roleMeshes: THREE.Mesh[] = [];
  for (let i = 0; i < count; i++) {
    const m = new THREE.MeshBasicMaterial({
      color: recordColor.clone(),
      transparent: true,
      opacity: 1,
    });
    const mesh = new THREE.Mesh(sphereGeo, m);
    mesh.scale.setScalar(sizeRole);
    roleMats.push(m);
    roleMeshes.push(mesh);
    group.add(mesh);
  }

  // ---- attention lines (one LineSegments, 2 verts per node) ----
  const linePos = new Float32Array(count * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(tokens.sceneWire),
    transparent: true,
    opacity: 0.3,
  });
  const lineSegs = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lineSegs);

  // classroom grid position for node i (rows facing the guide at the front)
  const COLS = 6;
  function gridPos(i: number, out: THREE.Vector3): THREE.Vector3 {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const rows = Math.ceil(count / COLS);
    return out.set(
      (col - (COLS - 1) / 2) * 0.62,
      ((rows - 1) / 2 - row) * 0.5 + 0.1,
      (row - (rows - 1) / 2) * 0.18,
    );
  }

  // ---- DOM overlay (counter + context + tapped role label) ----
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:absolute;left:0;right:0;bottom:0;padding:12px 16px;pointer-events:none;" +
    "font:13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:.02em;";
  const captionEl = document.createElement("div");
  captionEl.style.cssText = `color:${tokens.record};opacity:.85;`;
  const counterEl = document.createElement("div");
  counterEl.style.cssText = `color:${tokens.learner};font-weight:600;margin-top:2px;min-height:1.2em;`;
  const roleEl = document.createElement("div");
  roleEl.style.cssText = `color:${tokens.guide};margin-top:2px;min-height:1.2em;`;
  overlay.append(captionEl, counterEl, roleEl);
  host.appendChild(overlay);

  // ---- interaction: damped drag to rotate; tap a node to show its role ----
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let velX = 0;
  let targetRotX = 0;
  let downX = 0;
  let downY = 0;
  let moved = false;

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
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

  function pickAt(clientX: number, clientY: number): void {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(roleMeshes, false);
    if (hits.length) showRole(roleMeshes.indexOf(hits[0].object as THREE.Mesh));
  }

  function onDown(e: PointerEvent): void {
    dragging = true;
    moved = false;
    lastX = downX = e.clientX;
    lastY = downY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  }
  function onMove(e: PointerEvent): void {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 4) moved = true;
    velX = dx * 0.005;
    group.rotation.y += velX;
    targetRotX = Math.max(-0.5, Math.min(0.5, targetRotX + dy * 0.003));
    lastX = e.clientX;
    lastY = e.clientY;
  }
  function onUp(e: PointerEvent): void {
    if (dragging && !moved) pickAt(e.clientX, e.clientY);
    dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // ---- resize ----
  function fit(): void {
    const w = host.clientWidth || 600;
    const h = host.clientHeight || 480;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, params.maxPixelRatio || 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Scale the nodes to the frame so a 390px phone never shows oversized discs (600px ref).
    const frameScale = Math.max(0.72, Math.min(1, w / 600));
    learner.scale.setScalar(sizeLearner * frameScale);
    haloSprite.scale.setScalar(1.6 * frameScale);
    guide.scale.setScalar(sizeGuide * frameScale);
    for (const mesh of roleMeshes) mesh.scale.setScalar(sizeRole * frameScale);
  }
  const ro = new ResizeObserver(() => fit());
  ro.observe(host);
  fit();

  // ---- the render for a given progress t ----
  const tmp = new THREE.Vector3();
  const tmpGrid = new THREE.Vector3();
  const tmpRing = new THREE.Vector3();
  let spin = 0;

  function applyState(t: number): void {
    const state = stateForProgress(t);
    const local = localProgress(t);
    const lift = state === "classroom" ? 0 : state === "invert" ? ease(local) : 1;

    const showLearner = state === "classroom" ? 0 : 1;
    learnerMat.opacity = showLearner;
    haloMat.opacity = showLearner * 0.9;
    ringMat.opacity = lift * 0.6;

    const spins = [spin * 0.6, -spin * 0.42, spin * 0.26];
    const pos = ringPositions(count, RINGS, 1, spins, 1);

    // context swap index (and the counter that rides it)
    const ctxIdx =
      state === "context" ? Math.min(contexts.length - 1, Math.floor(local * contexts.length)) : -1;

    const lp = linePos;
    for (let i = 0; i < count; i++) {
      gridPos(i, tmpGrid);
      const p = pos[i];
      tmpRing.set(p.x, p.y, p.z);
      // ease from the classroom grid into the ring as lift grows
      tmp.copy(tmpGrid).lerp(tmpRing, state === "classroom" ? 0 : lift);
      roleMeshes[i].position.copy(tmp);

      // colour + opacity
      const mat = roleMats[i];
      if (state === "context" && ctxIdx >= 0) {
        const out = (i + ctxIdx) % 2 === 0; // about half swap out per change
        mat.opacity = out ? 0.2 : 1;
        mat.color.copy(!out && i < guides ? guideColor : recordColor);
      } else {
        mat.opacity = 1;
        mat.color.copy(recordColor);
      }

      // attention line endpoints
      const o = i * 6;
      if (state === "classroom") {
        lp[o] = tmp.x; lp[o + 1] = tmp.y; lp[o + 2] = tmp.z;
        lp[o + 3] = guideFront.x; lp[o + 4] = guideFront.y; lp[o + 5] = guideFront.z;
      } else if (state === "reverse") {
        // guide -> learner: the guide deploys thirty at one learner
        lp[o] = guideFront.x; lp[o + 1] = guideFront.y; lp[o + 2] = guideFront.z;
        lp[o + 3] = 0; lp[o + 4] = 0; lp[o + 5] = 0;
      } else {
        lp[o] = tmp.x; lp[o + 1] = tmp.y; lp[o + 2] = tmp.z;
        lp[o + 3] = 0; lp[o + 4] = 0; lp[o + 5] = 0;
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineMat.opacity = state === "classroom" ? 0.3 : state === "reverse" ? 0.15 + 0.3 * ease(local) : 0.3 * lift;

    // camera eases toward the guide in reverse, home otherwise
    const want = state === "reverse" ? camGuide : camHome;
    camera.position.lerp(want, params.reducedMotion ? 1 : 0.06);
    camera.lookAt(0, 0, 0);

    // captions / counter (DOM, never on the canvas)
    if (state === "context" && ctxIdx >= 0) {
      captionEl.textContent = contexts[ctxIdx];
      const c = counters[Math.min(ctxIdx, counters.length - 1)];
      counterEl.textContent = counterLabel ? `${c} ${counterLabel}` : String(c);
    } else {
      captionEl.textContent = captions[state];
      counterEl.textContent = "";
    }
  }

  // ---- loop ----
  let running = false;
  let raf = 0;
  let lastT = 0;

  function frame(): void {
    if (!running) return;
    spin += 0.0016;
    // damped drag inertia + ease rotation.x toward its target
    if (!dragging) {
      group.rotation.y += velX;
      velX *= 0.94;
      if (Math.abs(velX) < 1e-4) velX = 0;
    }
    group.rotation.x += (targetRotX - group.rotation.x) * 0.1;
    applyState(lastT);
    renderer.renderAsync(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start(): void {
    if (running || params.reducedMotion) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop(): void {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // first paint
  applyState(0);
  renderer.renderAsync(scene, camera);
  start();

  return {
    setProgress(t: number): void {
      lastT = t;
      if (!running) {
        // reduced-motion or paused: render straight through (states crossfade via lerps above)
        applyState(t);
        renderer.renderAsync(scene, camera);
      }
    },
    setState(name: string): void {
      if (name === "hidden") stop();
      else if (name === "visible") start();
    },
    resize(): void {
      fit();
      if (!running) {
        applyState(lastT);
        renderer.renderAsync(scene, camera);
      }
    },
    destroy(): void {
      stop();
      if (roleTimer) clearTimeout(roleTimer);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      sphereGeo.dispose();
      ringGeoms.forEach((g) => g.dispose());
      lineGeo.dispose();
      ringMat.dispose();
      lineMat.dispose();
      learnerMat.dispose();
      guideMat.dispose();
      haloMat.dispose();
      halo.dispose();
      roleMats.forEach((m) => m.dispose());
      renderer.dispose();
      canvas.remove();
      overlay.remove();
    },
  };
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
