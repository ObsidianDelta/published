// attention (board 04) — the approved sampler picture, behind the kit contract.
// A classroom of thirty attentions on one teacher turns inside out into thirty helpers
// on one learner; the guide moves beside her and keeps sending them. Deeper answers add
// layers: the churn and the guide's own ring (depth 2), the record and the five-minute
// packages (depth 3), the 2024 marker (depth 4), the accountability boundary (depth 5).
//
// Ported from state/daxfoundation/explain-sampler/attention.html (the AttentionScene fn).
// One number drives the inversion: setProgress(t). The scene auto-plays nothing — the layout
// drives t — but exports replay() so a "Play it again" control may run the inversion once.
// Colours come only from `tokens`; every label and caption comes from `params.labels`; the
// scene bakes no text. The caption is DOM text under the canvas, not canvas text, as in the
// sampler. 2D canvas, no WebGL: the fallback is for reduced-motion + ?lite only.
import type { SceneHandle, SceneModule, SceneParams, SceneTokens } from "../contract";
import { clamp01, segment } from "../contract";

export const meta = {
  name: "attention",
  states: ["classroom", "inverted"] as const,
  needsWebGL: false,
};

type Labels = Record<string, string | string[]>;

const easeIO = (x: number): number => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const easeOut = (x: number): number => 1 - Math.pow(1 - x, 3);
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

function str(v: string | string[] | undefined, fallback: string): string {
  if (Array.isArray(v)) return v[0] ?? fallback;
  return typeof v === "string" && v.trim() ? v : fallback;
}
function strArr(v: string | string[] | undefined, fallback: string[]): string[] {
  if (Array.isArray(v) && v.length) return v;
  if (typeof v === "string" && v.trim()) return [v];
  return fallback;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
/** CSS hex (#rgb or #rrggbb[aa]) to an rgba() string at the given alpha. */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}
const upper = (s: string): string => String(s).toUpperCase().split("").join(" ");

interface Role {
  i: number;
  name: number;
  blink: number;
  phase: number;
}
interface Pt {
  x: number;
  y: number;
}

export function mount(host: HTMLElement, params: SceneParams, tokens: SceneTokens): SceneHandle {
  const reduced = params.reducedMotion;
  // A per-role phase must not use Math.random() (unavailable in some renderers; deterministic
  // here keeps the flow stable across resumes). A fixed irrational step gives a scattered look.
  const phaseOf = (i: number): number => (i * 0.6180339887) % 1;

  host.style.position = host.style.position || "relative";

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.touchAction = "pan-y";
  host.appendChild(canvas);

  // The caption is DOM text (an accessible live region), never painted on the canvas.
  const caption = document.createElement("div");
  caption.setAttribute("aria-live", "polite");
  caption.style.cssText =
    "position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:13px;line-height:1.35;" +
    `color:${tokens.inkMuted};pointer-events:none;padding-inline:12px;`;
  const capMain = document.createElement("b");
  capMain.style.cssText = `display:block;color:${tokens.ink};font-weight:500;font-size:14px;`;
  const capSub = document.createElement("span");
  caption.append(capMain, capSub);
  host.appendChild(caption);

  // "Play it again" is an optional control: rendered only when a label is given, so the scene
  // bakes no text. The handle also exports replay() for the layout to drive its own control.
  const C = {
    ground: tokens.ground,
    ink: tokens.ink,
    muted: tokens.inkMuted,
    faint: tokens.inkFaint,
    line: tokens.line,
    wire: tokens.sceneWire || tokens.line,
    learner: tokens.learner,
    guide: tokens.guide,
    record: tokens.record,
  };
  const cs = getComputedStyle(document.documentElement);
  const sans = cs.getPropertyValue("--font-sans").trim() || "sans-serif";

  const ctx = canvas.getContext("2d")!;

  let L: Labels = params.labels || {};
  let again: HTMLButtonElement | null = null;
  const replayLabel = str(L.replay, "");
  if (replayLabel) {
    again = document.createElement("button");
    again.type = "button";
    again.textContent = replayLabel;
    again.style.cssText =
      "position:absolute;top:10px;right:10px;appearance:none;background:" + C.ground +
      ";border:1px solid " + C.line + ";border-radius:999px;color:" + C.muted +
      ";font:inherit;font-size:12px;letter-spacing:.1em;text-transform:uppercase;min-height:32px;" +
      "padding:2px 12px;cursor:pointer;opacity:0;transition:opacity .4s;pointer-events:none;";
    again.addEventListener("click", () => replay());
    host.appendChild(again);
  }

  // ---- scene state ----
  let tScroll = 0;
  let tFloor = 0;
  let auto: { start: number; dur: number } | null = null;
  let depth = 1;
  const depthAt: Record<number, number> = {};
  let chosen = 15;
  let tapped = false;
  let dragged = false;
  let drag: { id: number; dx: number; dy: number } | null = null;
  let guideOffset: Pt | null = null;
  const roles: Role[] = [];
  for (let i = 0; i < 30; i++) roles.push({ i, name: i, blink: -1e9, phase: phaseOf(i) });
  let sparks: { i: number; start: number }[] = [];
  let ripples: { x: number; y: number; start: number; color: string }[] = [];
  let labelsShown: { i: number; start: number }[] = [];
  let lastChurn = 0;
  let ctxIdx = 0;
  let ctxAt = 0;
  let visible = true;
  let lastPhase = "";
  let crossed = false;
  let pendingTap: { p: Pt; t: number; time: number; id: number } | null = null;

  // ---- geometry (measured on resize) ----
  let W = 1, H = 1, dpr = 1, cx = 0, cy = 0, R = 0, rl = 4;
  let room: Pt[] = [];
  let guideRoom: Pt = { x: 0, y: 0 };
  let center: Pt = { x: 0, y: 0 };
  let guideHome: Pt = { x: 0, y: 0 };

  function measure(): void {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    dpr = Math.min(params.maxPixelRatio || 2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const w = W, h = H - 52;
    cx = w / 2;
    cy = h / 2 + 6;
    const gw = Math.min(w * 0.74, 440), gh = Math.min(h * 0.52, 250);
    room = [];
    for (let r2 = 0; r2 < 5; r2++)
      for (let c = 0; c < 6; c++)
        room.push({ x: cx - gw / 2 + ((c + 0.5) * gw) / 6, y: cy - gh / 2 + 34 + ((r2 + 0.5) * gh) / 5 });
    guideRoom = { x: cx, y: cy - gh / 2 - 14 };
    R = Math.min(w, h) * 0.355;
    center = { x: cx, y: cy + 10 };
    guideHome = { x: cx + R * 0.46, y: cy + 10 - R * 0.42 };
    rl = Math.max(3.5, Math.min(6, w / 72));
  }

  function rolePos(i: number): { x: number; y: number; a: number } {
    const a = -Math.PI / 2 + (i / 30) * Math.PI * 2;
    return { x: center.x + Math.cos(a) * R, y: center.y + Math.sin(a) * R, a };
  }
  function guidePos(g: number): Pt {
    const home = guideOffset
      ? { x: guideHome.x + guideOffset.x, y: guideHome.y + guideOffset.y }
      : guideHome;
    return { x: lerp(guideRoom.x, home.x, g), y: lerp(guideRoom.y, home.y, g) };
  }

  function effT(now: number): number {
    let t = Math.max(tScroll, tFloor);
    if (auto) {
      const k = clamp01((now - auto.start) / auto.dur);
      t = Math.max(t, easeIO(k));
      if (k >= 1) {
        auto = null;
        tFloor = 1;
      }
    }
    return t;
  }

  function updateCaption(force: boolean): void {
    const t = effT(now());
    const d = depth;
    let main: string, sub = "";
    if (t < 0.3) {
      main = str(L.classroom, "");
      sub = tapped ? "" : str(L.tapChild, "");
    } else if (t < 0.95) {
      main = str(L.invert, "");
    } else {
      main = str(L.invert, "");
      sub = dragged || d >= 2 ? "" : str(L.dragGuide, "");
    }
    if (t >= 0.95 && d >= 2)
      sub = d >= 5 ? str(L.boundary, "") : d >= 4 ? str(L.built, "") : d >= 3 ? str(L.decide, "") : str(L.both, "");
    const key = main + "|" + sub;
    if (!force && key === lastPhase) return;
    lastPhase = key;
    capMain.textContent = main;
    capSub.textContent = sub;
    if (again) {
      const show = t >= 0.95;
      again.style.opacity = show ? "1" : "0";
      again.style.pointerEvents = show ? "auto" : "none";
    }
  }

  // ---- interaction: tap a learner before the inversion, drag the guide after, tap a helper ----
  function pt(e: PointerEvent): Pt {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function showLabel(i: number, at: number): void {
    labelsShown = labelsShown.filter((l) => l.i !== i);
    labelsShown.push({ i, start: at });
  }
  function tap(p: Pt, t: number): void {
    const at = now();
    if (t < 0.35) {
      let best = -1, bd = 1e9;
      room.forEach((q, i) => {
        const dd = Math.hypot(p.x - q.x, p.y - q.y);
        if (dd < 18 && dd < bd) {
          bd = dd;
          best = i;
        }
      });
      if (best >= 0) {
        chosen = best;
        tapped = true;
        ripples.push({ x: room[best].x, y: room[best].y, start: at, color: C.learner });
        updateCaption(true);
      }
      return;
    }
    if (Math.hypot(p.x - center.x, p.y - center.y) < 26) {
      ripples.push({ x: center.x, y: center.y, start: at, color: C.learner });
      return;
    }
    let best = -1, bd = 1e9;
    roles.forEach((r) => {
      const q = rolePos(r.i);
      const dd = Math.hypot(p.x - q.x, p.y - q.y);
      if (dd < 16 && dd < bd) {
        bd = dd;
        best = r.i;
      }
    });
    if (best >= 0) {
      roles[best].blink = at;
      showLabel(best, at);
      sparks.push({ i: best, start: at });
    }
  }
  function onDown(e: PointerEvent): void {
    const p = pt(e), at = now(), t = effT(at);
    if (t > 0.6) {
      const gp = guidePos(1);
      if (Math.hypot(p.x - gp.x, p.y - gp.y) < 22) {
        drag = { id: e.pointerId, dx: gp.x - p.x, dy: gp.y - p.y };
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        e.preventDefault();
        return;
      }
    }
    pendingTap = { p, t, time: at, id: e.pointerId };
  }
  function onMove(e: PointerEvent): void {
    if (!drag || e.pointerId !== drag.id) return;
    const p = pt(e);
    const x = Math.max(16, Math.min(W - 16, p.x + drag.dx));
    const y = Math.max(16, Math.min(H - 60, p.y + drag.dy));
    guideOffset = { x: x - guideHome.x, y: y - guideHome.y };
    if (!dragged) {
      dragged = true;
      updateCaption(true);
    }
  }
  function onUp(e: PointerEvent): void {
    if (drag && e.pointerId === drag.id) {
      drag = null;
      return;
    }
    const pend = pendingTap;
    pendingTap = null;
    if (!pend || e.type === "pointercancel") return;
    const p = pt(e);
    if (Math.hypot(p.x - pend.p.x, p.y - pend.p.y) > 12 || now() - pend.time > 600) return;
    tap(p, pend.t);
  }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  function churn(at: number): void {
    const names = strArr(L.roles, ["a role"]).length;
    for (let k = 0; k < 2; k++) {
      // deterministic pick: ride the clock, not Math.random()
      const idx = Math.floor((at / 211 + k * 13)) % 30;
      const r = roles[(idx + 30) % 30];
      r.blink = at;
      r.name = (r.name + 1 + (Math.floor(at / 97) % Math.max(1, names - 1))) % names;
      sparks.push({ i: r.i, start: at });
      if (k === 0) showLabel(r.i, at);
    }
  }

  function draw(at: number, t: number): void {
    const contexts = strArr(L.contexts, ["one thing"]);
    const roleNames = strArr(L.roles, ["a role"]);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";
    ctx.font = "12px " + sans;
    ctx.textBaseline = "middle";
    const a = easeIO(segment(t, 0.04, 0.5));
    const b = segment(t, 0.28, 0.82);
    const g = easeIO(segment(t, 0.36, 0.72));
    const d = depth;
    const age = (k: number): number => (at - (depthAt[k] || at)) / 1000;
    const fin = (k: number, dur: number): number => (reduced ? 1 : easeOut(clamp01(age(k) / (dur || 0.8))));
    const gp = guidePos(g);
    const chosenPos = room[chosen] || center;
    const learnerPos = { x: lerp(chosenPos.x, center.x, a), y: lerp(chosenPos.y, center.y, a) };
    const learnerR = lerp(rl, 13, a);

    // depth 5: the accountability boundary
    if (d >= 5) {
      const f = fin(5, 1);
      ctx.save();
      ctx.globalAlpha = 0.9 * f;
      ctx.strokeStyle = C.faint;
      ctx.setLineDash([3, 6]);
      ctx.lineWidth = 1;
      roundRect(ctx, 8, 8, W - 16, H - 16 - 44, 12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.muted;
      ctx.font = "11px " + sans;
      ctx.textAlign = "left";
      ctx.fillText(upper(str(L.boundary, "")), 20, 24);
      ctx.restore();
    }

    // classroom: thirty attentions on one teacher (the resting picture at t=0)
    if (a < 1) {
      ctx.save();
      ctx.globalAlpha = 0.32 * (1 - a);
      ctx.strokeStyle = C.record;
      ctx.lineWidth = 1;
      ctx.beginPath();
      room.forEach((q, i) => {
        if (i === chosen) return;
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(guideRoom.x, guideRoom.y);
      });
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 1 - a;
      ctx.fillStyle = C.record;
      room.forEach((q, i) => {
        if (i === chosen) return;
        const k = 1 + a * 0.6;
        const x = center.x + (q.x - center.x) * k, y = center.y + (q.y - center.y) * k;
        ctx.beginPath();
        ctx.arc(x, y, rl, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // helpers: thirty attentions on one learner
    const roleAlpha: number[] = [];
    roles.forEach((r) => {
      const lead = (((r.i * 7) % 30) / 30);
      const k = easeOut(segment(b, lead * 0.55, lead * 0.55 + 0.45));
      let al = k;
      const since = at - r.blink;
      if (since >= 0 && since < 420) al *= since < 240 ? 0.15 : 0.15 + ((since - 240) / 180) * 0.85;
      roleAlpha[r.i] = al;
    });
    if (b > 0) {
      ctx.save();
      roles.forEach((r) => {
        const al = roleAlpha[r.i];
        if (al <= 0) return;
        const q = rolePos(r.i);
        const lead = (((r.i * 7) % 30) / 30);
        const k = easeOut(segment(b, lead * 0.55, lead * 0.55 + 0.45));
        const x = lerp(center.x, q.x, 0.25 + 0.75 * k), y = lerp(center.y, q.y, 0.25 + 0.75 * k);
        ctx.globalAlpha = 0.22 * al;
        ctx.strokeStyle = C.record;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(learnerPos.x, learnerPos.y);
        ctx.stroke();
        if (!reduced && t > 0.6) {
          const f = ((at / 2600) + r.phase) % 1;
          const px = lerp(x, learnerPos.x, f), py = lerp(y, learnerPos.y, f);
          ctx.globalAlpha = 0.9 * al * Math.sin(f * Math.PI);
          ctx.fillStyle = C.record;
          ctx.beginPath();
          ctx.arc(px, py, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = al;
        ctx.fillStyle = C.record;
        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // sparks: the guide sends a helper
    if (!reduced) {
      sparks = sparks.filter((s) => at - s.start < 520);
      ctx.save();
      sparks.forEach((s) => {
        const f = easeOut((at - s.start) / 520);
        const q = rolePos(s.i);
        ctx.globalAlpha = 0.9 * (1 - f * 0.4);
        ctx.fillStyle = C.guide;
        ctx.beginPath();
        ctx.arc(lerp(gp.x, q.x, f), lerp(gp.y, q.y, f), 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // the guide's own thirty (depth 2)
    if (d >= 2 && t > 0.9) {
      const f = fin(2, 1.2);
      ctx.save();
      for (let i = 0; i < 10; i++) {
        const an = (i / 10) * Math.PI * 2 + at / 9000, rr = 26;
        const x = gp.x + Math.cos(an) * rr, y = gp.y + Math.sin(an) * rr;
        ctx.globalAlpha = 0.3 * f;
        ctx.strokeStyle = C.guide;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(gp.x, gp.y);
        ctx.stroke();
        ctx.globalAlpha = 0.75 * f;
        ctx.fillStyle = C.guide;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    // the guide's line to the learner: the human part
    if (t > 0.55) {
      const f = segment(t, 0.55, 0.8);
      const pulse = d >= 3 && !reduced ? 0.5 + 0.5 * Math.sin(at / 700) : 0;
      ctx.save();
      ctx.globalAlpha = (0.45 + 0.4 * pulse) * f;
      ctx.strokeStyle = C.guide;
      ctx.lineWidth = 1.5 + pulse;
      ctx.beginPath();
      ctx.moveTo(gp.x, gp.y);
      ctx.lineTo(learnerPos.x, learnerPos.y);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.fillStyle = C.guide;
    ctx.beginPath();
    ctx.arc(gp.x, gp.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(gp.x, gp.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // the one learner
    ctx.save();
    const glow = ctx.createRadialGradient(learnerPos.x, learnerPos.y, learnerR, learnerPos.x, learnerPos.y, learnerR * 3.2);
    glow.addColorStop(0, hexA(C.learner, 0.35 * a));
    glow.addColorStop(1, hexA(C.learner, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(learnerPos.x, learnerPos.y, learnerR * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.learner;
    ctx.beginPath();
    ctx.arc(learnerPos.x, learnerPos.y, learnerR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // depth 3: the record under her, and five-minute packages
    if (d >= 3) {
      const f = fin(3, 1);
      const ticks = reduced ? 12 : Math.min(12, Math.floor(age(3) / 0.7));
      const y0 = center.y + 34, x0 = center.x - 48;
      ctx.save();
      ctx.globalAlpha = f;
      ctx.strokeStyle = C.wire;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + 96, y0);
      ctx.stroke();
      ctx.strokeStyle = C.record;
      ctx.lineWidth = 2;
      for (let i = 0; i < ticks; i++) {
        ctx.beginPath();
        ctx.moveTo(x0 + 4 + i * 8, y0 - 5);
        ctx.lineTo(x0 + 4 + i * 8, y0 + 5);
        ctx.stroke();
      }
      ctx.fillStyle = C.muted;
      ctx.font = "11px " + sans;
      ctx.textAlign = "center";
      ctx.fillText(str(L.record, ""), center.x, y0 + 16);
      const px = 18, py = 60;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = f * (0.5 + i * 0.2);
        ctx.strokeStyle = C.record;
        ctx.lineWidth = 1;
        roundRect(ctx, px, py + i * 12, 40, 18, 4);
        ctx.stroke();
      }
      ctx.globalAlpha = f;
      ctx.fillStyle = C.muted;
      ctx.font = "10px " + sans;
      ctx.textAlign = "left";
      ctx.fillText(str(L.packages, ""), px, py - 10);
      if (!reduced) {
        const cyc = ((at - (depthAt[3] || at)) % 4200) / 4200;
        if (cyc < 0.45) {
          const k = easeIO(cyc / 0.45);
          ctx.globalAlpha = f * (1 - k * 0.6);
          ctx.strokeStyle = C.learner;
          roundRect(ctx, lerp(px, learnerPos.x - 20, k), lerp(py, learnerPos.y - 9, k), 40, 18, 4);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    // depth 4: built once, 2024
    if (d >= 4) {
      const f = fin(4, 0.8);
      ctx.save();
      ctx.globalAlpha = f;
      ctx.fillStyle = C.muted;
      ctx.font = "11px " + sans;
      ctx.textAlign = "left";
      ctx.fillText("▶ " + str(L.built, ""), 20, H - 62);
      ctx.restore();
    }
    // depth 2: the context tag, a different thirty each moment
    if (d >= 2 && t > 0.9) {
      const f = fin(2, 1);
      const k = reduced ? 1 : clamp01((at - ctxAt) / 600);
      ctx.save();
      ctx.globalAlpha = f * k;
      ctx.fillStyle = C.muted;
      ctx.font = "12px " + sans;
      ctx.textAlign = "center";
      ctx.fillText(contexts[ctxIdx % contexts.length], W / 2, d >= 5 ? 46 : 24);
      ctx.restore();
    }

    // helper labels
    labelsShown = labelsShown.filter((l) => at - l.start < 2200);
    ctx.save();
    ctx.font = "12px " + sans;
    labelsShown.forEach((l) => {
      const f = at - l.start, al = f < 200 ? f / 200 : f > 1800 ? (2200 - f) / 400 : 1;
      const q = rolePos(l.i), r = roles[l.i];
      const name = roleNames[r.name % roleNames.length];
      const w = ctx.measureText(name).width;
      let x = q.x + Math.cos(q.a) * 14, y = q.y + Math.sin(q.a) * 14;
      let align: CanvasTextAlign = Math.cos(q.a) > 0.3 ? "left" : Math.cos(q.a) < -0.3 ? "right" : "center";
      if ((align === "right" && x - w < 8) || (align === "left" && x + w > W - 8) ||
          (align === "center" && (x - w / 2 < 8 || x + w / 2 > W - 8))) {
        align = "center";
        y = q.y + (Math.sin(q.a) >= 0 ? 16 : -16);
        x = Math.max(8 + w / 2, Math.min(W - 8 - w / 2, q.x));
      }
      ctx.globalAlpha = al * (roleAlpha[l.i] ?? 1);
      ctx.fillStyle = C.ink;
      ctx.textAlign = align;
      ctx.fillText(name, x, y);
    });
    ctx.restore();

    // ripples from a tap
    ripples = ripples.filter((r) => at - r.start < 700);
    ctx.save();
    ripples.forEach((r) => {
      const f = (at - r.start) / 700;
      ctx.globalAlpha = 1 - f;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 6 + f * 26, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  // ---- loop ----
  let raf = 0;
  const now = (): number => (typeof performance !== "undefined" ? performance.now() : 0);
  function frame(): void {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const at = now();
    const t = effT(at);
    if (t >= 0.5 && !crossed) crossed = true;
    if (t < 0.4) crossed = false;
    if (!reduced && depth >= 2 && t >= 0.95 && at - lastChurn > 1700) {
      lastChurn = at;
      churn(at);
    }
    if (depth >= 2 && at - ctxAt > 4200) {
      ctxAt = at;
      const contexts = strArr(L.contexts, ["one thing"]);
      ctxIdx = (ctxIdx + 1) % contexts.length;
    }
    updateCaption(false);
    draw(at, t);
  }
  function paintStatic(): void {
    const at = now();
    updateCaption(true);
    draw(at, effT(at));
  }
  function start(): void {
    if (raf) return;
    raf = requestAnimationFrame(frame);
  }
  function stop(): void {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function replay(): void {
    tFloor = 0;
    auto = { start: now() + 500, dur: reduced ? 1 : 3200 };
    crossed = false;
    if (!raf) {
      // paused: still step the inversion to completion on the next frames
      start();
    }
  }

  measure();
  const ro = new ResizeObserver(() => {
    measure();
    paintStatic();
  });
  ro.observe(host);

  // first paint: the resting classroom at t=0, never a blank frame
  updateCaption(true);
  paintStatic();
  if (!reduced) start();

  const handle: SceneHandle & { replay(): void } = {
    setProgress(t: number): void {
      tScroll = clamp01(t);
      if (!raf) paintStatic();
    },
    setState(name: string): void {
      if (name === "hidden") {
        visible = false;
        stop();
      } else if (name === "visible") {
        visible = true;
        if (!reduced) start();
        else paintStatic();
      }
    },
    resize(): void {
      measure();
      paintStatic();
    },
    destroy(): void {
      stop();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.remove();
      caption.remove();
      if (again) again.remove();
    },
    setLabels(labels: Labels): void {
      L = labels || {};
      updateCaption(true);
      if (!raf) paintStatic();
    },
    setDepth(d: number): void {
      if (d !== depth) {
        for (let k = depth + 1; k <= d; k++) depthAt[k] = now();
        depth = d;
        updateCaption(true);
        if (!raf) paintStatic();
      }
    },
    replay,
  };
  return handle;
}

const sceneModule: SceneModule = { meta, mount };
export default sceneModule;
