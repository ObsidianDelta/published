// Meta DAX scene registry — a small library of parameterized, low-poly 3D
// components. Three separate inputs drive every scene (see "Layers" below):
//
//   params  — the MECHANICS (denominators + shaded; hour + minute + draggable).
//             Validated per scene, same as always.
//   theme   — the SKIN: one of plain | unicorn | hockey | dinosaur | space.
//             Changes palette + a procedural prop + optional flavour words.
//             NEVER changes the mechanics or the answer. No image downloads,
//             no licensed characters — props are drawn from geometry.
//   level   — an integer 1..3 that changes difficulty / affordances WITHIN the
//             mechanics. fraction-bars: 1 shaded bars w/ labels, 2 no labels,
//             3 compare two fractions. clock: 1 hour only, 2 half/quarter hours,
//             3 five-minute steps with drag.
//
// three.js is NOT imported here. The host (player, print, or demo page) loads
// the vendored three.module.min.js lazily and passes `THREE` into mount(), so a
// package with no `scene` block pulls in no 3D code at all. Keeping three out of
// this module also means it parses with `node --check` unchanged, and the SVG
// renderer below needs no WebGL — print and the no-WebGL fallback use it.
//
// A scene definition is:
//   {
//     title,                               // short human label
//     params,                              // schema — used by the checker and for defaults
//     levels,                              // [1,2,3] — the levels this scene supports
//     alt(params, theme, level) -> string, // alt-text, no WebGL needed
//     svg(params, theme, level) -> string, // static <svg> string, grayscale-safe, no WebGL
//     mount(THREE, el, params, opts) -> { dispose(), setReducedMotion(bool) }
//   }
// opts: { reducedMotion?, theme?, level? }. mount() owns one <canvas> inside `el`.

// ---- small shared helpers ---------------------------------------------------

function clampInt(v, lo, hi, dflt) {
  v = Math.round(Number(v));
  if (!Number.isFinite(v)) return dflt;
  return Math.max(lo, Math.min(hi, v));
}

// Fill defaults and clamp a params object against a scene's param schema.
export function normalizeParams(sceneId, params) {
  var def = SCENES[sceneId];
  if (!def) return null;
  var out = {};
  var schema = def.params || {};
  params = params || {};
  Object.keys(schema).forEach(function (k) {
    var s = schema[k];
    var v = params[k];
    if (s.type === "int") out[k] = clampInt(v, s.min, s.max, s.default);
    else if (s.type === "bool") out[k] = typeof v === "boolean" ? v : !!s.default;
    else if (s.type === "int-array") {
      var arr = Array.isArray(v) ? v : s.default.slice();
      arr = arr.slice(0, s.maxLen || 3).map(function (n) { return clampInt(n, s.min, s.max, s.min); });
      out[k] = arr.length ? arr : s.default.slice();
    } else out[k] = v != null ? v : s.default;
  });
  return out;
}

// ---- themes (the skin layer) ------------------------------------------------
// A theme is palette + a procedural prop id + a flavour word. It is pure data;
// it never touches mechanics. `plain` is the default and adds no prop.
export var THEMES = {
  plain:    { label: "Plain",    shadeOn: 0x3b7dd8, shadeOff: 0xdfe6f0, ink: 0x1b2a44, accent: 0x3b7dd8, face: 0xf5f7fb, prop: null,  word: "" },
  unicorn:  { label: "Unicorn",  shadeOn: 0xc45fd0, shadeOff: 0xf3e0f7, ink: 0x5a2a6b, accent: 0xff7ec8, face: 0xfdf1fb, prop: "star", word: "magic" },
  hockey:   { label: "Hockey",   shadeOn: 0x1f6fb2, shadeOff: 0xdbe6ef, ink: 0x11324d, accent: 0xd8462f, face: 0xeef4fb, prop: "puck", word: "rink" },
  dinosaur: { label: "Dinosaur", shadeOn: 0x4b8f3a, shadeOff: 0xe2ecd8, ink: 0x24401c, accent: 0xcf8a3a, face: 0xf1f7ea, prop: "leaf", word: "dino" },
  space:    { label: "Space",    shadeOn: 0x5a6bff, shadeOff: 0xe0e2f6, ink: 0x1a2150, accent: 0x9d6bff, face: 0xedeffb, prop: "star", word: "orbit" },
  // football: pitch greens with chalk lines; the unit object is a football.
  football: { label: "Football", shadeOn: 0x2f8f4e, shadeOff: 0xdcebd9, ink: 0x14301d, accent: 0xf6f8f2, face: 0xeaf3e6, prop: "ball", word: "pitch" },
  // running: track tartan (burnt orange) with pale lanes; the prop is a pennant.
  running:  { label: "Running",  shadeOn: 0xc0532a, shadeOff: 0xf0e1d6, ink: 0x3a1c10, accent: 0xf6f8f2, face: 0xf7ece3, prop: "flag", word: "track" },
};

export function normalizeTheme(theme) { return THEMES[theme] ? theme : "plain"; }
export function normalizeLevel(level) {
  var n = Math.round(Number(level));
  return Number.isFinite(n) ? Math.max(1, Math.min(3, n)) : 1;
}
function themeOf(theme) { return THEMES[normalizeTheme(theme)]; }

// ---- colour helpers ---------------------------------------------------------
function hex2(n) { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? "0" : "") + n.toString(16); }
function toHex(rgbInt) { return "#" + hex2((rgbInt >> 16) & 255) + hex2((rgbInt >> 8) & 255) + hex2(rgbInt & 255); }
// Luminance-based grey for a colour, clamped into [lo,hi] so print stays legible
// in black and white. Derived from the theme palette, never a flat grey.
function grayHex(rgbInt, lo, hi) {
  var r = (rgbInt >> 16) & 255, g = (rgbInt >> 8) & 255, b = rgbInt & 255;
  var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  var v = Math.max(lo, Math.min(hi, lum));
  return "#" + hex2(v) + hex2(v) + hex2(v);
}
// A grayscale-safe pair derived from a theme: dark for "on", pale for "off".
function printTones(t) {
  // `mid` is a medium grey used by the track scene for a second segment so the
  // two fractions stay distinct in black and white (on is dark, mid is grey,
  // off is pale — three separable bands).
  return { on: grayHex(t.shadeOn, 0x33, 0x7a), off: grayHex(t.shadeOff, 0xd2, 0xf4), ink: grayHex(t.ink, 0x11, 0x44), mid: grayHex(t.accent, 0x86, 0xa6) };
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

// A small procedural prop glyph as an SVG <path>/<polygon>, drawn in `fill`.
function propSvg(prop, cx, cy, r, fill) {
  if (!prop) return "";
  if (prop === "star") {
    var pts = [], i;
    for (i = 0; i < 10; i++) {
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var rad = i % 2 ? r * 0.42 : r;
      pts.push((cx + Math.cos(ang) * rad).toFixed(1) + "," + (cy + Math.sin(ang) * rad).toFixed(1));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + fill + '"/>';
  }
  if (prop === "puck") return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 0.45).toFixed(1) + '" fill="' + fill + '"/>';
  if (prop === "leaf") return '<path d="M' + cx + ' ' + (cy - r) + ' C' + (cx + r) + ' ' + (cy - r) + ' ' + (cx + r) + ' ' + (cy + r) + ' ' + cx + ' ' + (cy + r) + ' C' + (cx - r) + ' ' + (cy + r) + ' ' + (cx - r) + ' ' + (cy - r) + ' ' + cx + ' ' + (cy - r) + ' Z" fill="' + fill + '"/>';
  if (prop === "ball") {
    // A football: a circle with two chalk seam marks so it reads in grayscale.
    var seam = '<path d="M' + (cx - r * 0.6) + ' ' + (cy - r * 0.4) + ' Q' + cx + ' ' + cy + ' ' + (cx + r * 0.6) + ' ' + (cy - r * 0.4) + '" fill="none" stroke="#fff" stroke-width="1.4"/>';
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"/>' + seam;
  }
  if (prop === "flag") {
    // A lane pennant: pole plus a triangular flag.
    return '<line x1="' + cx + '" y1="' + (cy - r) + '" x2="' + cx + '" y2="' + (cy + r) + '" stroke="' + fill + '" stroke-width="1.6"/>' +
      '<polygon points="' + cx + ',' + (cy - r) + ' ' + (cx + r) + ',' + (cy - r * 0.5) + ' ' + cx + ',' + cy + '" fill="' + fill + '"/>';
  }
  return "";
}

// A tiny low-poly prop Mesh for the 3D stage (null for the plain theme).
function makeProp(THREE, prop, accent) {
  if (!prop) return null;
  var mat = new THREE.MeshLambertMaterial({ color: accent });
  var m;
  if (prop === "puck") m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 16), mat);
  else if (prop === "leaf") m = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 8), mat);
  else if (prop === "ball") m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mat);
  else if (prop === "flag") m = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.16, 3), mat);
  else m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.11), mat); // star-ish facet for star/default
  return m;
}

// Standard renderer + scene + ortho camera sized to `el`. Low-poly, flat light.
function makeStage(THREE, el) {
  var w = el.clientWidth || 320, h = el.clientHeight || 320;
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(w, h, false);
  el.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  var aspect = w / h;
  var cam = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
  cam.position.z = 3;
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  var key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(1, 2, 3);
  scene.add(key);
  var st = { renderer: renderer, scene: scene, cam: cam, w: w, h: h, aspect: aspect };
  // Resize to el's current size; safe to call when el was hidden at mount time.
  st.resize = function() {
    var nw = el.clientWidth, nh = el.clientHeight;
    if (!nw || !nh || (nw === st.w && nh === st.h)) return;
    st.w = nw; st.h = nh; st.aspect = nw / nh;
    renderer.setSize(nw, nh, false);
    cam.left = -st.aspect; cam.right = st.aspect;
    cam.updateProjectionMatrix();
    renderer.render(scene, cam);
  };
  return st;
}

// Overlay a small HTML label into the stage element (used for fraction labels at
// level 1). No font files; uses the host page font. Returned nodes are removed
// on dispose.
function addLabel(el, text, xFrac, yFrac, color) {
  var d = el.ownerDocument.createElement("div");
  d.textContent = text;
  d.setAttribute("aria-hidden", "true");
  d.style.cssText = "position:absolute;transform:translate(-50%,-50%);font:600 12px system-ui,sans-serif;pointer-events:none;color:" + color + ";left:" + (xFrac * 100).toFixed(1) + "%;top:" + (yFrac * 100).toFixed(1) + "%;";
  el.appendChild(d);
  return d;
}

// ---- scene: fraction-bars ---------------------------------------------------

var fractionBars = {
  title: "Fraction bars",
  levels: [1, 2, 3],
  params: {
    denominators: { type: "int-array", min: 1, max: 12, maxLen: 3, default: [2, 4] },
    shaded: { type: "int-array", min: 0, max: 12, maxLen: 3, default: [1, 1] },
  },
  // How many bars this level shows: level 3 compares exactly two fractions.
  _rows: function (p, level) {
    var n = p.denominators.length;
    return level >= 3 ? Math.min(2, n) : n;
  },
  alt: function (p, theme, level) {
    level = normalizeLevel(level);
    var rows = fractionBars._rows(p, level);
    var parts = [];
    for (var i = 0; i < rows; i++) {
      var s = p.shaded[i] != null ? p.shaded[i] : 0;
      var d = p.denominators[i];
      parts.push(s + " of " + d + (d === 1 ? " part" : " parts") + " shaded");
    }
    var lead = level >= 3 ? "Two fraction bars to compare" : "Fraction bars, one above the other";
    var tail = level === 1 ? " Each bar is labelled with its fraction." : "";
    return lead + ": " + parts.join("; ") + "." + tail;
  },
  svg: function (p, theme, level) {
    p = normalizeParams("fraction-bars", p);
    level = normalizeLevel(level);
    var t = themeOf(theme), tone = printTones(t);
    var rows = fractionBars._rows(p, level);
    var W = 240, H = 240, pad = 20, barH = 34, gap = 24;
    var top = (H - (rows * barH + (rows - 1) * gap)) / 2;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(fractionBars.alt(p, theme, level)) + '">';
    out += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    for (var r = 0; r < rows; r++) {
      var den = p.denominators[r], shaded = p.shaded[r] != null ? p.shaded[r] : 0;
      var y = top + r * (barH + gap), fullW = W - pad * 2, segW = fullW / den;
      for (var i = 0; i < den; i++) {
        var x = pad + i * segW;
        out += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + (segW - 2).toFixed(1) + '" height="' + barH +
          '" fill="' + (i < shaded ? tone.on : tone.off) + '" stroke="' + tone.ink + '" stroke-width="1.5"/>';
      }
      if (level === 1) out += '<text x="' + (W - pad) + '" y="' + (y + barH + 15) + '" text-anchor="end" font-family="Georgia,serif" font-size="14" fill="' + tone.ink + '">' + shaded + '/' + den + '</text>';
    }
    out += propSvg(t.prop, W - 22, 20, 12, tone.ink);
    out += '</svg>';
    return out;
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("fraction-bars", params);
    var level = normalizeLevel(opts && opts.level);
    var t = themeOf(opts && opts.theme);
    el.style.position = el.style.position || "relative";
    var st = makeStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    var labels = [];
    var rows = fractionBars._rows(p, level);
    var barH = 0.34, gap = 0.12;
    var totalH = rows * barH + (rows - 1) * gap;
    for (var row = 0; row < rows; row++) {
      var den = p.denominators[row];
      var shaded = p.shaded[row] != null ? p.shaded[row] : 0;
      var fullW = 1.7, segW = fullW / den;
      var y = totalH / 2 - barH / 2 - row * (barH + gap);
      for (var i = 0; i < den; i++) {
        var geo = new THREE.BoxGeometry(segW * 0.94, barH, 0.1);
        var col = i < shaded ? t.shadeOn : t.shadeOff;
        var mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: col }));
        mesh.position.set(-fullW / 2 + segW * (i + 0.5), y, 0);
        group.add(mesh);
      }
      if (level === 1) {
        // label each bar with its fraction (level-1 affordance)
        var xFrac = 0.5, yFrac = 0.5 - (y) / 2.2; // map world y (~[-0.5,0.5]) to the stage
        labels.push(addLabel(el, shaded + "/" + den, 0.92, yFrac, toHex(t.ink)));
      }
    }
    var prop = makeProp(THREE, t.prop, t.accent);
    if (prop) { prop.position.set(st.aspect - 0.18, 0.78, 0.2); group.add(prop); }

    var reduced = !!(opts && opts.reducedMotion), raf = 0;
    function render() { st.renderer.render(st.scene, st.cam); }
    function loop() {
      if (reduced) { render(); return; }
      group.rotation.y = Math.sin(performance.now() / 1400) * 0.12;
      if (prop) prop.rotation.z += 0.02;
      render();
      raf = requestAnimationFrame(loop);
    }
    el.setAttribute("aria-label", fractionBars.alt(p, opts && opts.theme, level));
    loop();
    return {
      setReducedMotion: function (b) { reduced = b; if (b && raf) { cancelAnimationFrame(raf); raf = 0; } else if (!b && !raf) loop(); },
      resize: st.resize,
      dispose: function () {
        if (raf) cancelAnimationFrame(raf);
        labels.forEach(function (d) { if (d.parentNode) d.parentNode.removeChild(d); });
        st.renderer.dispose();
        if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
      },
    };
  },
};

// ---- scene: clock -----------------------------------------------------------

var clock = {
  title: "Analog clock",
  levels: [1, 2, 3],
  params: {
    hour: { type: "int", min: 0, max: 12, default: 3 },
    minute: { type: "int", min: 0, max: 59, default: 0 },
    draggable: { type: "bool", default: true },
  },
  // Minute-snap per level; level 1 shows the hour only and is not draggable.
  _snap: function (level) { return level >= 3 ? 5 : level === 2 ? 15 : 0; },
  _draggable: function (p, level) { return !!p.draggable && level >= 2; },
  alt: function (p, theme, level) {
    level = normalizeLevel(level);
    var mm = level === 1 ? 0 : p.minute;
    var hh = ((p.hour % 12) || 12);
    var m2 = (mm < 10 ? "0" : "") + mm;
    var drag = clock._draggable(p, level) ? " The hands can be moved." : "";
    return "An analog clock showing " + hh + ":" + m2 + "." + drag;
  },
  svg: function (p, theme, level) {
    p = normalizeParams("clock", p);
    level = normalizeLevel(level);
    var t = themeOf(theme), tone = printTones(t);
    var mm = level === 1 ? 0 : p.minute;
    var hh = p.hour % 12;
    var cx = 120, cy = 120, R = 92;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="' + esc(clock.alt(p, theme, level)) + '">';
    out += '<rect width="240" height="240" fill="#fff"/>';
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + tone.off + '" stroke="' + tone.ink + '" stroke-width="3"/>';
    for (var k = 0; k < 12; k++) {
      var a = k / 12 * Math.PI * 2;
      var x1 = cx + Math.sin(a) * (R - 10), y1 = cy - Math.cos(a) * (R - 10);
      var x2 = cx + Math.sin(a) * (R - 2), y2 = cy - Math.cos(a) * (R - 2);
      out += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + tone.ink + '" stroke-width="2"/>';
    }
    var ma = mm / 60 * Math.PI * 2, ha = (hh + mm / 60) / 12 * Math.PI * 2;
    out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.sin(ha) * R * 0.5).toFixed(1) + '" y2="' + (cy - Math.cos(ha) * R * 0.5).toFixed(1) + '" stroke="' + tone.ink + '" stroke-width="6" stroke-linecap="round"/>';
    if (level > 1)
      out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.sin(ma) * R * 0.78).toFixed(1) + '" y2="' + (cy - Math.cos(ma) * R * 0.78).toFixed(1) + '" stroke="' + tone.on + '" stroke-width="4" stroke-linecap="round"/>';
    out += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + tone.ink + '"/>';
    out += propSvg(t.prop, 24, 24, 12, tone.ink);
    out += '</svg>';
    return out;
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("clock", params);
    var level = normalizeLevel(opts && opts.level);
    var t = themeOf(opts && opts.theme);
    var snap = clock._snap(level), draggable = clock._draggable(p, level);
    var st = makeStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    var face = new THREE.Mesh(new THREE.CircleGeometry(0.85, 48), new THREE.MeshLambertMaterial({ color: t.face }));
    group.add(face);
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 0.92, 48), new THREE.MeshBasicMaterial({ color: t.ink }));
    group.add(ring);
    for (var tk = 0; tk < 12; tk++) {
      var a = (tk / 12) * Math.PI * 2;
      var tick = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.02), new THREE.MeshBasicMaterial({ color: t.ink }));
      tick.position.set(Math.sin(a) * 0.74, Math.cos(a) * 0.74, 0.02);
      tick.rotation.z = -a;
      group.add(tick);
    }
    function makeHand(len, wid, col) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(wid, len, 0.02), new THREE.MeshBasicMaterial({ color: col }));
      m.geometry.translate(0, len / 2, 0);
      m.position.z = 0.03;
      group.add(m);
      return m;
    }
    var hourHand = makeHand(0.42, 0.045, t.ink);
    var minHand = makeHand(0.66, 0.03, t.accent);
    if (level === 1) minHand.visible = false; // hour only
    var prop = makeProp(THREE, t.prop, t.accent);
    if (prop) { prop.position.set(-st.aspect + 0.16, 0.8, 0.2); group.add(prop); }

    var state = { hour: p.hour % 12, minute: level === 1 ? 0 : p.minute };
    function place() {
      var ma = (state.minute / 60) * Math.PI * 2;
      var ha = ((state.hour + state.minute / 60) / 12) * Math.PI * 2;
      minHand.rotation.z = -ma;
      hourHand.rotation.z = -ha;
      el.setAttribute("aria-label", clock.alt({ hour: state.hour, minute: state.minute, draggable: draggable }, opts && opts.theme, level));
    }
    place();
    var reduced = !!(opts && opts.reducedMotion);
    function render() { st.renderer.render(st.scene, st.cam); }
    render();

    var cleanup = [];
    if (draggable) {
      el.tabIndex = 0;
      var dragging = false;
      function snapMin(m) { m = (m + 60) % 60; return snap ? Math.round(m / snap) * snap % 60 : m; }
      function setFromClient(cx, cy) {
        var r = st.renderer.domElement.getBoundingClientRect();
        var x = (cx - r.left) / r.width * 2 - 1;
        var y = -((cy - r.top) / r.height * 2 - 1);
        var ang = Math.atan2(x, y);
        if (ang < 0) ang += Math.PI * 2;
        state.minute = snapMin(Math.round(ang / (Math.PI * 2) * 60));
        place(); render();
      }
      var onDown = function (e) { dragging = true; setFromClient(e.clientX, e.clientY); e.preventDefault(); };
      var onMove = function (e) { if (dragging) setFromClient(e.clientX, e.clientY); };
      var onUp = function () { dragging = false; };
      var onKey = function (e) {
        var dir = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : (e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0);
        if (!dir) return;
        state.minute = snapMin(state.minute + dir * (snap || 1));
        place(); render(); e.preventDefault();
      };
      st.renderer.domElement.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      el.addEventListener("keydown", onKey);
      cleanup.push(function () {
        st.renderer.domElement.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        el.removeEventListener("keydown", onKey);
      });
    }
    return {
      setReducedMotion: function (b) { reduced = b; render(); },
      getState: function () { return { hour: state.hour, minute: state.minute }; },
      resize: st.resize,
      dispose: function () { cleanup.forEach(function (fn) { fn(); }); st.renderer.dispose(); if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement); },
    };
  },
};

// ---- scene: track -----------------------------------------------------------
// A fraction of a lap on a 400 m oval. A runner moves to a/b of the lap and the
// lap is cut into b equal parts. The oval is our own simplified stadium (two
// straights + two semicircle ends); it echoes the stade-des-fractions reference
// without importing its engine.

// Position on an oval lap. t is the fraction of the lap from the start line
// (left end of the lower straight), travelling along the loop. cx/cy is the
// centre, S the straight length, R the end radius. `up` flips the vertical axis
// so the SVG path (y grows downward) and the 3D stage (y grows upward) share one
// routine. Returns { x, y }.
function lapPos(t, cx, cy, S, R, up) {
  var Lc = Math.PI * R, L = 2 * S + 2 * Lc;
  var s = (((t % 1) + 1) % 1) * L;
  if (t >= 1 && s < 1e-9) s = L; // t === 1 exactly: end of the lap, not the start
  var sy = up ? -1 : 1, x, y, a;
  if (s <= S) { x = cx - S / 2 + s; y = cy + R * sy; }                 // lower straight
  else if (s <= S + Lc) { a = (s - S) / R; x = cx + S / 2 + Math.sin(a) * R; y = cy + Math.cos(a) * R * sy; } // right bend
  else if (s <= 2 * S + Lc) { x = cx + S / 2 - (s - S - Lc); y = cy - R * sy; } // upper straight
  else { a = (s - 2 * S - Lc) / R; x = cx - S / 2 - Math.sin(a) * R; y = cy - Math.cos(a) * R * sy; } // left bend
  return { x: x, y: y };
}
// An SVG path `d` for the lap arc from t0 to t1 on the given oval.
function lapPathD(t0, t1, cx, cy, S, R) {
  var n = Math.max(2, Math.ceil(Math.abs(t1 - t0) * 120)), d = "", i, t, p;
  for (i = 0; i <= n; i++) {
    t = t0 + (t1 - t0) * (i / n);
    p = lapPos(t, cx, cy, S, R, false);
    d += (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1);
  }
  return d;
}

var track = {
  title: "Track lap",
  levels: [1, 2, 3],
  params: {
    // Two fractions a/b. Level 1 & 2 compare them (one runner each); level 3
    // adds them on one lane and may run past the finish into a second lap.
    numerators: { type: "int-array", min: 0, max: 24, maxLen: 2, default: [1, 3] },
    denominators: { type: "int-array", min: 1, max: 24, maxLen: 2, default: [4, 4] },
  },
  _mode: function (level) { return level >= 3 ? "add" : "compare"; },
  _fracs: function (p) {
    var na = p.numerators[0] != null ? p.numerators[0] : 0;
    var da = p.denominators[0] != null ? p.denominators[0] : 1;
    var nb = p.numerators[1] != null ? p.numerators[1] : na;
    var db = p.denominators[1] != null ? p.denominators[1] : da;
    return { na: na, da: da || 1, nb: nb, db: db || 1 };
  },
  alt: function (p, theme, level) {
    p = normalizeParams("track", p);
    level = normalizeLevel(level);
    var f = track._fracs(p), word = themeOf(theme).word || "track";
    var lead = "A 400 metre oval " + (word === "track" ? "running track" : "running track (" + word + ")") + ". ";
    if (track._mode(level) === "add") {
      var sum = f.na / f.da + f.nb / f.db;
      var laps = sum > 1 ? " That is more than one full lap." : "";
      return lead + "The runner covers " + f.na + "/" + f.da + " of the lap, then " + f.nb + "/" + f.db +
        " more, finishing at " + (+sum.toFixed(3)) + " of a lap." + laps +
        " The lap is cut into equal parts.";
    }
    var fa = f.na / f.da, fb = f.nb / f.db;
    var who = Math.abs(fa - fb) < 1e-9 ? "Both runners reach the same point." :
      (fa > fb ? "The first runner is further." : "The second runner is further.");
    return lead + "Two runners: the first reaches " + f.na + "/" + f.da + " of the lap, the second reaches " +
      f.nb + "/" + f.db + ". Each lane is cut into equal parts. " + who;
  },
  svg: function (p, theme, level) {
    p = normalizeParams("track", p);
    level = normalizeLevel(level);
    var t = themeOf(theme), tone = printTones(t);
    var f = track._fracs(p);
    var W = 240, H = 240, cx = 120, cy = 120, S = 96, laneW = 12;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(track.alt(p, theme, level)) + '">';
    out += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    // A full oval for a lane: pale track body, radial start/part ticks on top.
    function laneBody(R) {
      return '<path d="' + lapPathD(0, 1, cx, cy, S, R) + 'Z" fill="none" stroke="' + tone.off +
        '" stroke-width="' + laneW + '" stroke-linejoin="round"/>';
    }
    function ticks(R, b) {
      var s = "", k, pin, pout, half = laneW / 2 + 4;
      for (k = 0; k < b; k++) {
        pin = lapPos(k / b, cx, cy, S, R - half, false);
        pout = lapPos(k / b, cx, cy, S, R + half, false);
        s += '<line x1="' + pin.x.toFixed(1) + '" y1="' + pin.y.toFixed(1) + '" x2="' + pout.x.toFixed(1) +
          '" y2="' + pout.y.toFixed(1) + '" stroke="' + tone.ink + '" stroke-width="1.6"/>';
      }
      return s;
    }
    function seg(t0, t1, R, color) {
      return '<path d="' + lapPathD(t0, t1, cx, cy, S, R) + '" fill="none" stroke="' + color +
        '" stroke-width="' + laneW + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    function runner(t0, R, color) {
      var p0 = lapPos(t0, cx, cy, S, R, false);
      return '<circle cx="' + p0.x.toFixed(1) + '" cy="' + p0.y.toFixed(1) + '" r="6.5" fill="' + color +
        '" stroke="#fff" stroke-width="1.6"/>';
    }

    if (track._mode(level) === "add") {
      var R0 = 46, R1 = 61;                       // lap 1 (inner), lap 2 (outer)
      var fa = f.na / f.da, total = fa + f.nb / f.db;
      out += laneBody(R0);
      if (total > 1) out += laneBody(R1);
      // Split the run at its breakpoints: the fa boundary (colour) and each lap
      // boundary (which ring). On [0,fa] use the dark tone, after it the grey.
      var bpMax = Math.min(total, 2);
      var bps = [0, fa, 1, total, 2].filter(function (v) { return v >= 0 && v <= bpMax; });
      bps = bps.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
      for (var bi = 0; bi < bps.length - 1; bi++) {
        var a0 = bps[bi], b0 = bps[bi + 1];
        if (b0 - a0 < 1e-6) continue;
        var midv = (a0 + b0) / 2, lapIdx = Math.floor(midv - 1e-9);
        var ring = lapIdx === 0 ? R0 : R1, col = midv <= fa ? tone.on : tone.mid;
        out += seg(a0 - lapIdx, b0 - lapIdx, ring, col);
      }
      out += ticks(R0, f.da);
      var endV = Math.min(total, 2), endLap = endV > 1 ? 1 : 0;
      out += runner(endV - endLap, endLap === 0 ? R0 : R1, tone.ink);
      if (total > 1) out += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="' + tone.ink + '">more than 1 lap</text>';
    } else {
      var RA = 44, RB = 59;                        // inner lane, outer lane
      var faC = f.na / f.da, fbC = f.nb / f.db;
      out += laneBody(RA) + laneBody(RB);
      out += seg(0, Math.min(faC, 1), RA, tone.on);
      out += seg(0, Math.min(fbC, 1), RB, tone.mid);
      out += ticks(RA, f.da) + ticks(RB, f.db);
      out += runner(Math.min(faC, 1), RA, tone.ink) + runner(Math.min(fbC, 1), RB, tone.on);
    }
    out += propSvg(t.prop, W - 22, 22, 12, tone.ink);
    out += '</svg>';
    return out;
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("track", params);
    var level = normalizeLevel(opts && opts.level);
    var t = themeOf(opts && opts.theme);
    var f = track._fracs(p);
    el.style.position = el.style.position || "relative";
    var st = makeStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    var S = 0.72, laneW = 0.11;
    // A flat two-row ribbon following the lap from t0 to t1 on the given oval.
    function ribbon(t0, t1, R, color, y) {
      var n = Math.max(2, Math.ceil(Math.abs(t1 - t0) * 160)), pos = [], idx = [], i;
      for (i = 0; i <= n; i++) {
        var tt = t0 + (t1 - t0) * (i / n);
        var a = lapPos(tt, 0, 0, S, R, true), b = lapPos(tt + 0.0007, 0, 0, S, R, true);
        var tx = b.x - a.x, ty = b.y - a.y, len = Math.hypot(tx, ty) || 1;
        var nx = -ty / len * laneW / 2, ny = tx / len * laneW / 2;
        pos.push(a.x + nx, a.y + ny, y, a.x - nx, a.y - ny, y);
        if (i < n) { var k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      }
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      var m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide }));
      group.add(m);
      return m;
    }
    function ticksMesh(R, b) {
      var k, half = laneW / 2 + 0.03;
      for (k = 0; k < b; k++) {
        var pin = lapPos(k / b, 0, 0, S, R - half, true), pout = lapPos(k / b, 0, 0, S, R + half, true);
        var g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute([pin.x, pin.y, 0.02, pout.x, pout.y, 0.02], 3));
        group.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: t.ink })));
      }
    }
    function makeRunner(color) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshLambertMaterial({ color: color }));
      m.position.z = 0.05;
      group.add(m);
      return m;
    }

    var mode = track._mode(level);
    var runners = []; // { mesh, R, end, lapOffset } where position = lapPos(end*prog ...)
    var fa = f.na / f.da;
    if (mode === "add") {
      var R0 = 0.46, R1 = 0.62, total = fa + f.nb / f.db;
      ribbon(0, 1, R0, t.shadeOff, 0.0);
      if (total > 1) ribbon(0, 1, R1, t.shadeOff, 0.0);
      var bpMax = Math.min(total, 2);
      var bps = [0, fa, 1, total, 2].filter(function (v) { return v >= 0 && v <= bpMax; });
      bps = bps.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
      for (var bi = 0; bi < bps.length - 1; bi++) {
        var a0 = bps[bi], b0 = bps[bi + 1];
        if (b0 - a0 < 1e-6) continue;
        var midv = (a0 + b0) / 2, lapIdx = Math.floor(midv - 1e-9);
        ribbon(a0 - lapIdx, b0 - lapIdx, lapIdx === 0 ? R0 : R1, midv <= fa ? t.shadeOn : t.ink, 0.02);
      }
      ticksMesh(R0, f.da);
      runners.push({ mesh: makeRunner(t.ink), R0: R0, R1: R1, total: total });
    } else {
      var RA = 0.44, RB = 0.6;
      var fbC = f.nb / f.db;
      ribbon(0, 1, RA, t.shadeOff, 0.0);
      ribbon(0, 1, RB, t.shadeOff, 0.0);
      ribbon(0, Math.min(fa, 1), RA, t.shadeOn, 0.02);
      ribbon(0, Math.min(fbC, 1), RB, t.ink, 0.02);
      ticksMesh(RA, f.da);
      ticksMesh(RB, f.db);
      runners.push({ mesh: makeRunner(t.ink), simple: Math.min(fa, 1), R: RA });
      runners.push({ mesh: makeRunner(t.shadeOn), simple: Math.min(fbC, 1), R: RB });
    }
    function placeRunner(rn, prog) {
      if (rn.simple != null) {
        var pp = lapPos(rn.simple * prog, 0, 0, S, rn.R, true);
        rn.mesh.position.x = pp.x; rn.mesh.position.y = pp.y;
      } else {
        var v = Math.min(rn.total, 2) * prog, lap = v > 1 ? 1 : 0;
        var pp2 = lapPos(v - lap, 0, 0, S, lap === 0 ? rn.R0 : rn.R1, true);
        rn.mesh.position.x = pp2.x; rn.mesh.position.y = pp2.y;
      }
    }
    var prop = makeProp(THREE, t.prop, t.accent);
    if (prop) { prop.position.set(st.aspect - 0.18, 0.78, 0.2); group.add(prop); }

    var reduced = !!(opts && opts.reducedMotion), raf = 0, start = 0;
    function render() { st.renderer.render(st.scene, st.cam); }
    function frame(now) {
      if (!start) start = now;
      var prog = Math.min(1, (now - start) / 1600);
      prog = 1 - Math.pow(1 - prog, 3); // easeOut
      runners.forEach(function (rn) { placeRunner(rn, prog); });
      render();
      if (prog < 1) raf = requestAnimationFrame(frame); else raf = 0;
    }
    el.setAttribute("aria-label", track.alt(p, opts && opts.theme, level));
    if (reduced) { runners.forEach(function (rn) { placeRunner(rn, 1); }); render(); }
    else raf = requestAnimationFrame(frame);
    return {
      setReducedMotion: function (b) {
        reduced = b;
        if (b) { if (raf) { cancelAnimationFrame(raf); raf = 0; } runners.forEach(function (rn) { placeRunner(rn, 1); }); render(); }
        else if (!raf) { start = 0; raf = requestAnimationFrame(frame); }
      },
      resize: st.resize,
      dispose: function () {
        if (raf) cancelAnimationFrame(raf);
        st.renderer.dispose();
        if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
      },
    };
  },
};

// ---- registry ---------------------------------------------------------------

export var SCENES = {
  "fraction-bars": fractionBars,
  "clock": clock,
  "track": track,
};

export function getScene(id) { return SCENES[id] || null; }
export function sceneIds() { return Object.keys(SCENES); }
export function altFor(id, params, theme, level) {
  var def = SCENES[id];
  return def ? def.alt(normalizeParams(id, params), normalizeTheme(theme), normalizeLevel(level)) : "";
}
export function svgFor(id, params, theme, level) {
  var def = SCENES[id];
  return def && def.svg ? def.svg(normalizeParams(id, params), normalizeTheme(theme), normalizeLevel(level)) : "";
}
