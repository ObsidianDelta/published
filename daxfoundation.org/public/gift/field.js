// The field: a Canvas2D particle field behind the whole studio. It breathes to a heartbeat
// (lub-dub, ~66 bpm), starts colourless, and blooms into the hues of the letters a person
// chooses. While sound plays it follows the real audio level (an AnalyserNode on the studio's
// own synth), so every stage's visuals are sound-reactive.
//
// Phone-first: glow sprites are pre-rendered once per hue and drawn with additive blending;
// particle count scales with screen area and device memory; DPR capped at 1.5; the loop stops
// when the tab is hidden; prefers-reduced-motion draws one still frame per change.
// Shapes: 'heart' (the opening), 'drift' (ambient), 'ring' (the share-card reveal: the
// gift-og ring of the 12 notes).

const TAU = Math.PI * 2;
const NEUTRAL = -1; // hue -1 = warm white

export function createField(canvas, opts = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mem = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 4;
  let W = 0, H = 0, dpr = 1, running = false, raf = 0, last = 0, t0 = 0;
  let shape = 'heart', bpm = 66, energy = 0, levelFn = opts.level || (() => 0), bloom = 0;
  let palette = [NEUTRAL];
  let anchor = null; // {x, y, r}: centre the heart/ring on an element (the opening's heart)
  const sprites = new Map();
  let P = [];

  function sprite(hue) {
    if (sprites.has(hue)) return sprites.get(hue);
    const s = 48, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d'), grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    const col = hue === NEUTRAL ? '255, 236, 214' : hslToRgb(hue, 0.85, 0.66).join(', ');
    grd.addColorStop(0, `rgba(255,255,255,0.95)`); grd.addColorStop(0.18, `rgba(${col},0.85)`);
    grd.addColorStop(0.5, `rgba(${col},0.22)`); grd.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, s, s); sprites.set(hue, c); return c;
  }

  // heart curve (classic parametric), normalised to ~[-1,1]
  const heartAt = (a) => [16 * Math.sin(a) ** 3 / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 17];
  const CX = () => (anchor ? anchor.x : W / 2), CY = () => (anchor ? anchor.y : H * 0.42);
  function target(p, i, n) {
    const R = anchor ? anchor.r : Math.min(W, H) * (shape === 'ring' ? 0.3 : 0.26);
    if (shape === 'heart') {
      const [x, y] = heartAt((i / n) * TAU);
      const k = 0.55 + 0.45 * p.layer; // nested hearts
      return [CX() + x * R * k, CY() + y * R * k + R * 0.08];
    }
    if (shape === 'ring') {
      const k = i % 13; // 12 note points + the ring itself
      const a = (k === 12 ? (i / n) * TAU : (k / 12) * TAU) - Math.PI / 2;
      const r = k === 12 ? R : R * (0.96 + 0.08 * p.layer);
      return [CX() + Math.cos(a) * r, CY() + Math.sin(a) * r];
    }
    return [p.hx, p.hy]; // drift: each particle's own home
  }

  function seed() {
    const n = Math.round(Math.min(mem <= 2 ? 220 : 520, Math.max(140, (W * H) / 1500)));
    P = Array.from({ length: n }, (_, i) => {
      const hx = Math.random() * W, hy = Math.random() * H;
      return { x: hx, y: hy, vx: 0, vy: 0, hx, hy, layer: Math.random(), size: 0.5 + Math.random() * 1.1, ph: Math.random() * TAU, hue: palette[i % palette.length] };
    });
  }

  function resize() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!P.length || Math.abs(P.length - (W * H) / 1500) > 120) seed();
  }

  // lub-dub: two bumps per beat
  function beat(t) {
    const ph = ((t * bpm) / 60) % 1;
    const bump = (c, w) => Math.exp(-((ph - c) ** 2) / w);
    return bump(0.05, 0.0018) + 0.6 * bump(0.24, 0.0022);
  }

  function frame(now) {
    if (!running) return;
    const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    const b = beat(t), lvl = Math.min(1, levelFn() * 3);
    energy += ((Math.max(b * 0.6, lvl) - energy) * Math.min(1, dt * 10));
    bloom += ((palette[0] === NEUTRAL ? 0 : 1) - bloom) * Math.min(1, dt * 1.5);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    // a soft core glow that swells with each beat
    const core = ctx.createRadialGradient(CX(), CY(), 0, CX(), CY(), Math.max(W, H) * 0.6);
    const ch = palette[0] === NEUTRAL ? null : palette[0];
    core.addColorStop(0, ch === null ? `rgba(255,214,190,${0.10 + energy * 0.10})` : `hsla(${ch},80%,55%,${0.12 + energy * 0.14})`);
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const n = P.length, scale = 1 + energy * 0.09;
    for (let i = 0; i < n; i++) {
      const p = P[i];
      let [tx, ty] = target(p, i, n);
      tx = CX() + (tx - CX()) * scale; ty = CY() + (ty - CY()) * scale;
      const wob = shape === 'drift' ? 18 : 4;
      tx += Math.sin(t * 0.6 + p.ph) * wob; ty += Math.cos(t * 0.5 + p.ph * 1.3) * wob;
      p.vx += (tx - p.x) * dt * 2.2; p.vy += (ty - p.y) * dt * 2.2;
      p.vx *= 0.9; p.vy *= 0.9;
      p.x += p.vx * dt * 6; p.y += p.vy * dt * 6;
      // ambient drift sits quietly behind reading; the heart and the ring are the show
      const amb = shape === 'drift' ? 0.42 : 1;
      const r = (6 + p.size * 10) * (0.8 + energy * 0.7) * (shape === 'drift' ? 0.72 : 1);
      const img = sprite(bloom > 0.02 ? p.hue : NEUTRAL);
      ctx.globalAlpha = Math.min(1, (0.35 + p.layer * 0.4 + energy * 0.3) * amb);
      ctx.drawImage(img, p.x - r, p.y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    if (reduced) { running = false; return; }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (running) return; running = true; t0 = t0 || performance.now(); last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  const kick = () => { if (reduced) { running = true; frame(performance.now()); } };

  window.addEventListener('resize', () => { resize(); kick(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize(); start();

  return {
    /** colour the field: hues in [0,360); [] returns to colourless */
    setPalette(hues) {
      palette = hues && hues.length ? hues.slice(0, 6) : [NEUTRAL];
      P.forEach((p, i) => { p.hue = palette[i % palette.length]; });
      kick();
    },
    setShape(s) { if (s !== shape) { shape = s; if (s === 'drift') P.forEach((p) => { p.hx = Math.random() * W; p.hy = Math.random() * H; }); kick(); } },
    /** centre the heart/ring on a point with a radius (viewport px), or null for the default */
    setAnchor(a) { anchor = a && Number.isFinite(a.x) && Number.isFinite(a.y) && a.r > 0 ? { x: a.x, y: a.y, r: a.r } : null; kick(); },
    setBpm(v) { bpm = Math.max(40, Math.min(140, v || 66)); },
    setLevel(fn) { levelFn = fn || (() => 0); },
    /** a burst of light at (x, y) in a hue: taps, choices, the reveal */
    burst(x, y, hue, k = 1) {
      const cx = x ?? CX(), cy = y ?? CY();
      for (const p of P) {
        const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) + 20;
        const f = (900 * k) / d;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        if (hue !== undefined && Math.random() < 0.35) p.hue = hue;
      }
      energy = Math.min(1, energy + 0.5 * k);
      kick();
    },
    get shape() { return shape; },
    get count() { return P.length; },
    stop, start,
  };
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}
