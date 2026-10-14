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
  // sage: earth-tone green (never brown). Soft muted palette; prop is a leaf shape.
  sage:     { label: "Sage",     shadeOn: 0x4c6a41, shadeOff: 0xd8e8d0, ink: 0x1e2a1b, accent: 0x6a9e5a, face: 0xf3f5ee, prop: "leaf", word: "sage" },
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

// Perspective stage for wide algebra scenes: PerspectiveCamera tilted ~22° down
// and slightly to the right; hemisphere + shadow-casting directional light.
function makeAlgebraStage(THREE, el) {
  var w = el.clientWidth || 480, h = Math.round(w * 10 / 16);
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(w, h, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(46, w / h, 0.1, 20);
  cam.position.set(0.34, 1.3, 2.68);
  cam.lookAt(0, -0.05, 0);
  scene.add(new THREE.HemisphereLight(0xeef4ff, 0x223322, 0.55));
  var sun = new THREE.DirectionalLight(0xffffff, 0.88);
  sun.position.set(1.5, 3, 2);
  sun.castShadow = true;
  sun.shadow.mapSize.width = sun.shadow.mapSize.height = 512;
  sun.shadow.camera.near = 0.1; sun.shadow.camera.far = 12;
  sun.shadow.camera.left = -2.2; sun.shadow.camera.right = 2.2;
  sun.shadow.camera.top = 2; sun.shadow.camera.bottom = -2;
  scene.add(sun);
  var st = { renderer: renderer, scene: scene, cam: cam, w: w, h: h };
  st.resize = function () {
    var cvs = renderer.domElement;
    var nw = cvs.clientWidth, nh = cvs.clientHeight;
    if (!nw || !nh || (nw === st.w && nh === st.h)) return;
    st.w = nw; st.h = nh;
    renderer.setSize(nw, nh, false);
    cam.aspect = nw / nh;
    cam.updateProjectionMatrix();
    renderer.render(scene, cam);
  };
  return st;
}

// Canvas-texture Sprite: crisp text label positioned in 3D world space.
// worldH is the world-space height; 0.14 ≈ 22 screen-px at 680 px canvas width.
function makeTextSprite(THREE, text, worldH, inkHex, bgHex) {
  var pxH = 80, len = Math.max(1, text.length);
  var pxW = Math.max(pxH, Math.ceil(len * pxH * 0.65));
  pxW = Math.pow(2, Math.ceil(Math.log2(pxW)));
  var cvs = document.createElement("canvas");
  cvs.width = pxW; cvs.height = pxH;
  var ctx = cvs.getContext("2d");
  if (bgHex) { ctx.fillStyle = bgHex; ctx.fillRect(0, 0, pxW, pxH); }
  var fs = Math.round(pxH * 0.55);
  ctx.font = "bold " + fs + "px system-ui,sans-serif";
  ctx.fillStyle = inkHex;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, pxW / 2, pxH / 2);
  var tex = new THREE.CanvasTexture(cvs);
  var mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  var sp = new THREE.Sprite(mat);
  sp.scale.set(worldH * (pxW / pxH), worldH, 1);
  return sp;
}

// Add a div.scene-controls after the canvas inside el (for buttons in normal flow).
function makeCtrlDiv(el) {
  var d = el.ownerDocument.createElement("div");
  d.className = "scene-controls";
  el.appendChild(d);
  return d;
}

// A live-region paragraph inside ctrlDiv showing the current equation.
function makeEqLine(ctrlDiv) {
  var d = ctrlDiv.ownerDocument.createElement("div");
  d.className = "scene-eq";
  d.setAttribute("aria-live", "polite");
  d.setAttribute("aria-atomic", "true");
  ctrlDiv.appendChild(d);
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

// ---- scene: balance ---------------------------------------------------------
// A two-pan balance. x-boxes (left_x, right_x) and unit weights (left_c,
// right_c) on each pan. The beam is always level — only equality-preserving
// moves are offered as buttons.

var balance = {
  title: "Balance",
  wide: true,
  levels: [1, 2, 3],
  params: {
    left_x:  { type: "int", min: 0, max: 5,  default: 2 },
    left_c:  { type: "int", min: 0, max: 40, default: 4 },
    right_x: { type: "int", min: 0, max: 5,  default: 1 },
    right_c: { type: "int", min: 0, max: 60, default: 11 },
  },
  alt: function (p, theme, level) {
    level = normalizeLevel(level);
    var xw = level >= 3 ? "unknown" : "x";
    function expr(nx, nc) {
      var parts = [];
      if (nx) parts.push(nx + " " + xw);
      if (nc) parts.push(String(nc));
      return parts.join(" + ") || "0";
    }
    var base = "Balance: left pan " + expr(p.left_x, p.left_c) + ", right pan " + expr(p.right_x, p.right_c) + ". Beam level.";
    var hint = level >= 2 ? " Use the buttons to isolate x." : "";
    return base + hint;
  },
  svg: function (p, theme, level) {
    p = normalizeParams("balance", p);
    level = normalizeLevel(level);
    var t = themeOf(theme), tone = printTones(t);
    var W = 480, H = 220;
    var beamY = 82, panY = 158, cx = 240;
    var lx = 90, rx = 390;
    var showQ = level >= 3;

    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(balance.alt(p, theme, level)) + '">';
    out += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    // Fulcrum
    out += '<polygon points="' + cx + ',' + (beamY + 5) + ' ' + (cx - 18) + ',' + (beamY + 52) + ' ' + (cx + 18) + ',' + (beamY + 52) + '" fill="' + tone.ink + '"/>';
    out += '<rect x="' + (cx - 26) + '" y="' + (beamY + 50) + '" width="52" height="7" rx="2" fill="' + tone.ink + '"/>';
    // Beam
    out += '<rect x="56" y="' + (beamY - 4) + '" width="368" height="9" rx="4" fill="' + tone.on + '"/>';
    // Chains
    out += '<line x1="' + lx + '" y1="' + (beamY + 5) + '" x2="' + lx + '" y2="' + (panY - 4) + '" stroke="' + tone.ink + '" stroke-width="2"/>';
    out += '<line x1="' + rx + '" y1="' + (beamY + 5) + '" x2="' + rx + '" y2="' + (panY - 4) + '" stroke="' + tone.ink + '" stroke-width="2"/>';
    // Pans
    out += '<rect x="' + (lx - 48) + '" y="' + panY + '" width="96" height="7" rx="3" fill="' + tone.on + '"/>';
    out += '<rect x="' + (rx - 48) + '" y="' + panY + '" width="96" height="7" rx="3" fill="' + tone.on + '"/>';

    function drawPanItems(panCX, numX, numC) {
      var s = "", bW = 24, bH = 32, uS = 18, g = 5;
      var xtw = numX * (bW + g) - (numX ? g : 0);
      var showU = Math.min(numC, 4), utw = showU * (uS + g) - (showU ? g : 0);
      var totalW = xtw + (numX && numC ? g + 6 : 0) + utw;
      var sx = panCX - totalW / 2, iy = panY - bH - 6;
      for (var i = 0; i < numX; i++) {
        var bx = Math.round(sx + i * (bW + g));
        s += '<rect x="' + bx + '" y="' + iy + '" width="' + bW + '" height="' + bH + '" fill="' + tone.on + '" stroke="' + tone.ink + '" stroke-width="1.5" rx="3"/>';
        s += '<text x="' + (bx + bW / 2 | 0) + '" y="' + (iy + 21) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="' + tone.ink + '">' + (showQ ? "?" : "x") + '</text>';
      }
      var ux = sx + xtw + (numX && numC ? g + 6 : 0);
      for (var j = 0; j < showU; j++) {
        var uxx = Math.round(ux + j * (uS + g));
        s += '<rect x="' + uxx + '" y="' + (iy + 7) + '" width="' + uS + '" height="' + uS + '" fill="' + tone.off + '" stroke="' + tone.ink + '" stroke-width="1.2" rx="2"/>';
      }
      if (numC > 4) s += '<text x="' + (ux + showU * (uS + g) + 3) + '" y="' + (iy + 20) + '" font-family="system-ui,sans-serif" font-size="15" fill="' + tone.ink + '">+' + (numC - 4) + '</text>';
      return s;
    }

    out += drawPanItems(lx, p.left_x, p.left_c);
    out += drawPanItems(rx, p.right_x, p.right_c);

    // Equation
    function expr(nx, nc) { var parts=[]; if(nx) parts.push(nx+(showQ?"?":"x")); if(nc) parts.push(String(nc)); return parts.join("+")||"0"; }
    out += '<text x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="' + tone.ink + '">' + expr(p.left_x, p.left_c) + ' = ' + expr(p.right_x, p.right_c) + '</text>';
    out += propSvg(t.prop, W - 24, 22, 14, tone.ink);
    out += '</svg>';
    return out;
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("balance", params);
    var level = normalizeLevel(opts && opts.level);
    var t = themeOf(opts && opts.theme);
    var st = makeAlgebraStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);

    var state = { lx: p.left_x, lc: p.left_c, rx: p.right_x, rc: p.right_c };
    var solved = false;
    var reduced = !!(opts && opts.reducedMotion);

    // Beam (thick box with real depth for perspective shadow)
    var beam = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.06, 0.1),
      new THREE.MeshLambertMaterial({ color: t.shadeOn }));
    beam.castShadow = true;
    group.add(beam);
    // Fulcrum cone + base bar
    var fCone = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.075, 0.29, 8),
      new THREE.MeshLambertMaterial({ color: t.ink }));
    fCone.position.set(0, -0.175, 0); fCone.castShadow = true;
    group.add(fCone);
    var baseBar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.042, 0.16),
      new THREE.MeshLambertMaterial({ color: t.ink }));
    baseBar.position.set(0, -0.32, 0); baseBar.receiveShadow = true;
    group.add(baseBar);
    // Chains + pans
    var cMat = new THREE.MeshBasicMaterial({ color: t.ink });
    var panY3 = -0.39;
    [-0.62, 0.62].forEach(function (px) {
      var ch = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.37, 4), cMat);
      ch.position.set(px, -0.2, 0.04);
      group.add(ch);
      var pan = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.032, 0.28),
        new THREE.MeshLambertMaterial({ color: t.shadeOn }));
      pan.position.set(px, panY3, 0);
      pan.castShadow = pan.receiveShadow = true;
      group.add(pan);
    });

    // Dynamic pan items + sprites
    var dynGroup = new THREE.Group();
    st.scene.add(dynGroup);

    function clearDyn() {
      while (dynGroup.children.length) {
        var m = dynGroup.children[0];
        if (m.geometry) m.geometry.dispose();
        if (m.material) { if (m.material.map) m.material.map.dispose(); m.material.dispose(); }
        dynGroup.remove(m);
      }
    }

    function buildDyn() {
      clearDyn();
      var inkHex = toHex(t.ink), showQ = level >= 3 && !solved;
      var bW = 0.07, bH = 0.11, bD = 0.06, uS = 0.062, gap = 0.02;

      function addSide(panX, numX, numC) {
        var xtw = numX * (bW + gap) - (numX ? gap : 0);
        var showU = Math.min(numC, 4);
        var utw = showU * (uS + gap) - (showU ? gap : 0);
        var totalW = xtw + (numX && numC ? gap * 2 : 0) + utw;
        var sx = panX - totalW / 2;
        var iy = panY3 + bH / 2 + 0.025;

        for (var i = 0; i < numX; i++) {
          var mx = sx + i * (bW + gap) + bW / 2;
          var box = new THREE.Mesh(new THREE.BoxGeometry(bW * 0.88, bH, bD),
            new THREE.MeshLambertMaterial({ color: t.shadeOn }));
          box.position.set(mx, iy, 0.04); box.castShadow = true;
          dynGroup.add(box);
          var sp = makeTextSprite(THREE, showQ ? "?" : "x", 0.12, inkHex, null);
          sp.position.set(mx, iy + bH / 2 + 0.07, 0.08);
          dynGroup.add(sp);
        }
        var ux = sx + xtw + (numX && numC ? gap * 2 : 0);
        for (var j = 0; j < showU; j++) {
          var umx = ux + j * (uS + gap) + uS / 2;
          var um = new THREE.Mesh(new THREE.BoxGeometry(uS * 0.88, uS, uS),
            new THREE.MeshLambertMaterial({ color: t.shadeOff }));
          um.position.set(umx, panY3 + uS / 2 + 0.025, -0.02);
          um.castShadow = true;
          dynGroup.add(um);
        }
        if (numC > 4) {
          var sp2 = makeTextSprite(THREE, "+" + (numC - 4), 0.11, inkHex, null);
          sp2.position.set(ux + showU * (uS + gap) + 0.06, iy, 0.08);
          dynGroup.add(sp2);
        }
      }

      addSide(-0.62, state.lx, state.lc);
      addSide(0.62, state.rx, state.rc);
    }

    buildDyn();

    var raf = 0;
    function render() { st.renderer.render(st.scene, st.cam); }
    render();

    // Equation helper
    function eqStr() {
      function ex(nx, nc) { var p=[]; if(nx) p.push(nx+"x"); if(nc) p.push(String(nc)); return p.join("+")||"0"; }
      return ex(state.lx, state.lc) + " = " + ex(state.rx, state.rc);
    }

    // Controls below (levels 2 & 3)
    var btns = [];
    if (level >= 2) {
      var ctrlDiv = makeCtrlDiv(el);
      var eqLine = makeEqLine(ctrlDiv);
      eqLine.textContent = eqStr();

      var btnX = el.ownerDocument.createElement("button");
      btnX.textContent = "Take one x off both sides";
      btnX.setAttribute("aria-label", "Take one x from both sides of the balance");
      ctrlDiv.insertBefore(btnX, eqLine);
      btns.push(btnX);

      var btnC = el.ownerDocument.createElement("button");
      btnC.textContent = "Take 1 off both sides";
      btnC.setAttribute("aria-label", "Take one unit weight from both sides of the balance");
      ctrlDiv.insertBefore(btnC, eqLine);
      btns.push(btnC);

      function refreshBtns() {
        var canX = Math.min(state.lx, state.rx) >= 1;
        var canC = Math.min(state.lc, state.rc) >= 1;
        btnX.disabled = !canX;
        btnC.disabled = !canC;
        eqLine.textContent = eqStr();
      }
      refreshBtns();

      function doUpdate() {
        var loneLeft  = state.lx === 1 && state.lc === 0 && state.rx === 0;
        var loneRight = state.rx === 1 && state.rc === 0 && state.lx === 0;
        if (loneLeft || loneRight) solved = true;
        buildDyn(); refreshBtns();
        if (reduced) { render(); return; }
        // Blocks lift off both sides together then settle over 0.5 s
        var t0 = null;
        function pop(now) {
          if (!t0) t0 = now;
          var prog = Math.min(1, (now - t0) / 500);
          var lift = 0.08 * Math.sin(prog * Math.PI);
          dynGroup.position.y = lift;
          render();
          if (prog < 1) raf = requestAnimationFrame(pop);
          else { dynGroup.position.y = 0; render(); raf = 0; }
        }
        raf = requestAnimationFrame(pop);
      }

      btnX.addEventListener("click", function () {
        if (Math.min(state.lx, state.rx) < 1) return;
        state.lx -= 1; state.rx -= 1;
        doUpdate();
      });
      btnC.addEventListener("click", function () {
        if (Math.min(state.lc, state.rc) < 1) return;
        state.lc -= 1; state.rc -= 1;
        doUpdate();
      });
    }

    el.setAttribute("aria-label", balance.alt(p, opts && opts.theme, level));
    return {
      setReducedMotion: function (b) { reduced = b; render(); },
      resize: st.resize,
      dispose: function () {
        if (raf) cancelAnimationFrame(raf);
        clearDyn();
        btns.forEach(function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
        var ctrl = el.querySelector(".scene-controls");
        if (ctrl && ctrl.parentNode) ctrl.parentNode.removeChild(ctrl);
        st.renderer.dispose();
        if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
      },
    };
  },
};

// ---- scene: function-machine ------------------------------------------------
// A three-box machine: input → ×mul → +add → output.
// Level 1: input shown. Level 2: input hidden ("?"). Level 3: interactive undo.

var functionMachine = {
  title: "Function machine",
  wide: true,
  levels: [1, 2, 3],
  params: {
    mul:        { type: "int",  min: 1,   max: 12,  default: 2 },
    add:        { type: "int",  min: -20, max: 20,  default: 5 },
    input:      { type: "int",  min: 0,   max: 60,  default: 9 },
    hide_input: { type: "bool",                     default: true },
  },
  _output: function (p) { return p.input * p.mul + p.add; },
  alt: function (p, theme, level) {
    level = normalizeLevel(level);
    var out = functionMachine._output(p);
    var addStr = (p.add >= 0 ? "add " : "subtract ") + Math.abs(p.add);
    var base = "Function machine: multiply by " + p.mul + ", then " + addStr + ". Output: " + out + ".";
    if (level === 1) return base + " Input: " + p.input + ".";
    if (level === 2) return base + " Input hidden.";
    return base + " Use undo buttons to find the input.";
  },
  svg: function (p, theme, level) {
    p = normalizeParams("function-machine", p);
    level = normalizeLevel(level);
    var t = themeOf(theme), tone = printTones(t);
    var W = 480, H = 180, out = functionMachine._output(p);
    var showIn = level === 1;
    var addStr = (p.add >= 0 ? "+" : "") + p.add;
    var bH = 64, bY = (H - bH) / 2;
    var inX = 14, inW = 88, bodyX = 136, bodyW = 128, outX = 376, outW = 90;
    var midY = bY + bH / 2;

    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(functionMachine.alt(p, theme, level)) + '">';
    s += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    // Input box
    s += '<rect x="' + inX + '" y="' + bY + '" width="' + inW + '" height="' + bH + '" rx="8" fill="' + tone.off + '" stroke="' + tone.ink + '" stroke-width="1.8"/>';
    s += '<text x="' + (inX + inW / 2 | 0) + '" y="' + (midY + 7) + '" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="bold" fill="' + tone.ink + '">' + (showIn ? p.input : "?") + '</text>';
    s += '<text x="' + (inX + inW / 2 | 0) + '" y="' + (bY - 7) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="' + tone.ink + '">in</text>';
    // Arrow 1
    var a1x = inX + inW + 2, a1end = bodyX - 2;
    s += '<line x1="' + a1x + '" y1="' + midY + '" x2="' + (a1end - 12) + '" y2="' + midY + '" stroke="' + tone.ink + '" stroke-width="2.5"/>';
    s += '<polygon points="' + (a1end-12) + ',' + (midY-6) + ' ' + a1end + ',' + midY + ' ' + (a1end-12) + ',' + (midY+6) + '" fill="' + tone.ink + '"/>';
    // Machine body
    s += '<rect x="' + bodyX + '" y="' + (bY - 12) + '" width="' + bodyW + '" height="' + (bH + 24) + '" rx="12" fill="' + tone.on + '" stroke="' + tone.ink + '" stroke-width="1.8"/>';
    s += '<text x="' + (bodyX + bodyW / 2 | 0) + '" y="' + (midY - 6) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="#fff">×' + p.mul + '</text>';
    s += '<text x="' + (bodyX + bodyW / 2 | 0) + '" y="' + (midY + 16) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="#fff">' + addStr + '</text>';
    // Arrow 2
    var a2x = bodyX + bodyW + 2, a2end = outX - 2;
    s += '<line x1="' + a2x + '" y1="' + midY + '" x2="' + (a2end - 12) + '" y2="' + midY + '" stroke="' + tone.ink + '" stroke-width="2.5"/>';
    s += '<polygon points="' + (a2end-12) + ',' + (midY-6) + ' ' + a2end + ',' + midY + ' ' + (a2end-12) + ',' + (midY+6) + '" fill="' + tone.ink + '"/>';
    // Output box
    s += '<rect x="' + outX + '" y="' + bY + '" width="' + outW + '" height="' + bH + '" rx="8" fill="' + tone.off + '" stroke="' + tone.ink + '" stroke-width="1.8"/>';
    s += '<text x="' + (outX + outW / 2 | 0) + '" y="' + (midY + 7) + '" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="bold" fill="' + tone.ink + '">' + out + '</text>';
    s += '<text x="' + (outX + outW / 2 | 0) + '" y="' + (bY - 7) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="' + tone.ink + '">out</text>';
    s += propSvg(t.prop, W - 20, 18, 13, tone.ink);
    s += '</svg>';
    return s;
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("function-machine", params);
    var level = normalizeLevel(opts && opts.level);
    var t = themeOf(opts && opts.theme);
    var st = makeAlgebraStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    var reduced = !!(opts && opts.reducedMotion);
    var raf = 0;
    var out = functionMachine._output(p);

    var matIn   = new THREE.MeshLambertMaterial({ color: t.shadeOff });
    var matBody = new THREE.MeshLambertMaterial({ color: t.shadeOn });
    var matOut  = new THREE.MeshLambertMaterial({ color: t.shadeOff });

    // Input box — thick for perspective depth
    var inBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.16), matIn);
    inBox.position.set(-0.76, 0, 0); inBox.castShadow = true;
    group.add(inBox);
    // Machine body (rounded-ish using BoxGeometry with extra depth)
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.4, 0.2), matBody);
    body.position.set(0, 0, 0); body.castShadow = true;
    group.add(body);
    // Output box
    var outBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.16), matOut);
    outBox.position.set(0.76, 0, 0); outBox.castShadow = true;
    group.add(outBox);
    // Arrow shafts
    var arrMat = new THREE.MeshBasicMaterial({ color: t.ink });
    [-0.46, 0.46].forEach(function (ax) {
      var arr = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.028, 0.04), arrMat);
      arr.position.set(ax, 0, 0.1); group.add(arr);
    });

    // Sprites for labels
    var inkHex = toHex(t.ink), faceHex = toHex(t.face);
    var addStrFM = (p.add >= 0 ? "+" : "") + p.add;
    // Static machine op labels (on body face)
    var spMul = makeTextSprite(THREE, "×" + p.mul, 0.13, faceHex, null);
    spMul.position.set(0, 0.06, 0.12); group.add(spMul);
    var spAdd = makeTextSprite(THREE, addStrFM, 0.13, faceHex, null);
    spAdd.position.set(0, -0.09, 0.12); group.add(spAdd);
    // "out" label
    var spOutLabel = makeTextSprite(THREE, "out", 0.09, inkHex, null);
    spOutLabel.position.set(0.76, 0.2, 0.1); group.add(spOutLabel);
    // "in" label
    var spInLabel = makeTextSprite(THREE, "in", 0.09, inkHex, null);
    spInLabel.position.set(-0.76, 0.2, 0.1); group.add(spInLabel);

    // step: 0=initial, 1=undid add, 2=undid mul (input shown)
    var step = 0;
    var dynSprites = [];

    function clearDynSprites() {
      dynSprites.forEach(function (sp) { group.remove(sp); if (sp.material && sp.material.map) sp.material.map.dispose(); if (sp.material) sp.material.dispose(); });
      dynSprites = [];
    }
    function buildDynLabels() {
      clearDynSprites();
      var showIn = level === 1 || step >= 2;
      var spIn = makeTextSprite(THREE, showIn ? String(p.input) : "?", 0.16, inkHex, null);
      spIn.position.set(-0.76, 0, 0.12); group.add(spIn); dynSprites.push(spIn);
      var spOut = makeTextSprite(THREE, String(out), 0.16, inkHex, null);
      spOut.position.set(0.76, 0, 0.12); group.add(spOut); dynSprites.push(spOut);
      if (step >= 1 && step < 2) {
        var inter = out - p.add;
        var spMid = makeTextSprite(THREE, String(inter), 0.13, inkHex, null);
        spMid.position.set(-0.5, -0.28, 0.12); group.add(spMid); dynSprites.push(spMid);
      }
    }
    buildDynLabels();

    function render() { st.renderer.render(st.scene, st.cam); }
    render();

    // Token animation: token sphere runs from inBox to outBox over 0.5 s
    var token = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8),
      new THREE.MeshLambertMaterial({ color: t.accent }));
    token.visible = false; group.add(token);

    function runToken(after) {
      if (reduced) { after(); return; }
      token.visible = true; token.position.set(-0.76, 0, 0.15);
      var t0 = null;
      function fr(now) {
        if (!t0) t0 = now;
        var prog = Math.min(1, (now - t0) / 500);
        token.position.x = -0.76 + prog * 1.52;
        token.position.y = 0.08 * Math.sin(prog * Math.PI);
        render();
        if (prog < 1) raf = requestAnimationFrame(fr);
        else { token.visible = false; after(); render(); raf = 0; }
      }
      raf = requestAnimationFrame(fr);
    }

    // Equation helper
    function eqStr() {
      if (step === 0) return "? × " + p.mul + (p.add >= 0 ? " + " : " − ") + Math.abs(p.add) + " = " + out;
      if (step === 1) return "? × " + p.mul + " = " + (out - p.add);
      return "x = " + p.input;
    }

    var btns = [];
    if (level >= 3) {
      var ctrlDiv = makeCtrlDiv(el);
      var eqLine = makeEqLine(ctrlDiv);
      eqLine.textContent = eqStr();

      var btn1 = el.ownerDocument.createElement("button");
      btn1.textContent = "Undo " + addStrFM;
      btn1.setAttribute("aria-label", "Undo the addition step");
      ctrlDiv.insertBefore(btn1, eqLine);
      btns.push(btn1);

      var btn2 = el.ownerDocument.createElement("button");
      btn2.textContent = "Undo ×" + p.mul;
      btn2.setAttribute("aria-label", "Undo the multiply step");
      btn2.disabled = true;
      ctrlDiv.insertBefore(btn2, eqLine);
      btns.push(btn2);

      btn1.addEventListener("click", function () {
        if (step !== 0) return;
        runToken(function () {
          step = 1; btn1.disabled = true; btn2.disabled = false;
          buildDynLabels(); eqLine.textContent = eqStr(); render();
        });
      });
      btn2.addEventListener("click", function () {
        if (step !== 1) return;
        runToken(function () {
          step = 2; btn2.disabled = true;
          buildDynLabels(); eqLine.textContent = eqStr(); render();
        });
      });
    }

    el.setAttribute("aria-label", functionMachine.alt(p, opts && opts.theme, level));
    return {
      setReducedMotion: function (b) { reduced = b; render(); },
      resize: st.resize,
      dispose: function () {
        if (raf) cancelAnimationFrame(raf);
        clearDynSprites();
        btns.forEach(function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
        var ctrl = el.querySelector(".scene-controls");
        if (ctrl && ctrl.parentNode) ctrl.parentNode.removeChild(ctrl);
        st.renderer.dispose();
        if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
      },
    };
  },
};

// ---- scene: bar-model -------------------------------------------------------
// One bar row per extra value: an x block + an extra block (when extra != 0).
// A total bracket spans all rows. Level 3: interactive steps to solve for x.

var barModel = {
  title: "Bar model",
  wide: true,
  levels: [1, 2, 3],
  params: {
    extras: { type: "int-array", min: -20, max: 60, maxLen: 4, default: [0, 3] },
    total:  { type: "int", min: 0, max: 500, default: 41 },
  },
  _sumExtras: function (p) {
    var s = 0;
    for (var i = 0; i < p.extras.length; i++) s += p.extras[i];
    return s;
  },
  alt: function (p, theme, level) {
    level = normalizeLevel(level);
    var n = p.extras.length, sum = barModel._sumExtras(p);
    var xLabel = level >= 2 ? "unknown" : "x";
    var rows = p.extras.map(function (e) { return "x" + (e > 0 ? "+" + e : e < 0 ? e : ""); }).join(", ");
    var base = "Bar model with " + n + " row" + (n !== 1 ? "s" : "") + ": " + rows + ". Total: " + p.total + ".";
    if (level >= 3) return base + " Use buttons to solve for x.";
    return base;
  },
  svg: function (p, theme, level) {
    p = normalizeParams("bar-model", p);
    level = normalizeLevel(level);
    var t = themeOf(theme), tone = printTones(t);
    var n = p.extras.length;
    var W = 480, rowH = 34, gap = 12, pad = 22;
    var totalH = pad * 2 + n * rowH + (n - 1) * gap + 32;
    var H = Math.max(160, Math.min(totalH, 260));
    var barW = 340, xW = 140, bracketX = barW + pad + 10;
    var topY = (H - (n * rowH + (n - 1) * gap)) / 2;
    var showQ = level >= 2;

    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(barModel.alt(p, theme, level)) + '">';
    s += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';

    for (var i = 0; i < n; i++) {
      var ry = topY + i * (rowH + gap);
      var e = p.extras[i];
      var eW = e !== 0 ? Math.max(38, Math.min(barW - xW - 4, Math.round(Math.abs(e) * 2.4 + 22))) : 0;
      var xBarW = barW - eW;
      s += '<rect x="' + pad + '" y="' + ry + '" width="' + xBarW + '" height="' + rowH + '" fill="' + tone.on + '" stroke="' + tone.ink + '" stroke-width="1.5" rx="4"/>';
      s += '<text x="' + (pad + xBarW / 2 | 0) + '" y="' + (ry + rowH / 2 + 6) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#fff">' + (showQ ? "?" : "x") + '</text>';
      if (e !== 0) {
        var ex = pad + xBarW + 3;
        s += '<rect x="' + ex + '" y="' + ry + '" width="' + (eW - 3) + '" height="' + rowH + '" fill="' + tone.off + '" stroke="' + tone.ink + '" stroke-width="1.5" rx="4"/>';
        s += '<text x="' + (ex + (eW - 3) / 2 | 0) + '" y="' + (ry + rowH / 2 + 6) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="16" fill="' + tone.ink + '">' + (e > 0 ? "+" : "") + e + '</text>';
      }
    }
    // Total bracket
    var by1 = topY - 5, by2 = topY + n * rowH + (n - 1) * gap + 5;
    s += '<line x1="' + bracketX + '" y1="' + by1 + '" x2="' + (bracketX + 9) + '" y2="' + by1 + '" stroke="' + tone.ink + '" stroke-width="2"/>';
    s += '<line x1="' + bracketX + '" y1="' + by1 + '" x2="' + bracketX + '" y2="' + by2 + '" stroke="' + tone.ink + '" stroke-width="2"/>';
    s += '<line x1="' + bracketX + '" y1="' + by2 + '" x2="' + (bracketX + 9) + '" y2="' + by2 + '" stroke="' + tone.ink + '" stroke-width="2"/>';
    s += '<text x="' + (bracketX + 16) + '" y="' + ((by1 + by2) / 2 + 7 | 0) + '" font-family="Georgia,serif" font-size="20" font-weight="bold" fill="' + tone.ink + '">' + p.total + '</text>';
    s += propSvg(t.prop, W - 22, 22, 14, tone.ink);
    s += '</svg>';
    return s;
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("bar-model", params);
    var level = normalizeLevel(opts && opts.level);
    var t = themeOf(opts && opts.theme);
    var st = makeAlgebraStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    var reduced = !!(opts && opts.reducedMotion);
    var raf = 0;
    var n = p.extras.length;
    var sum = barModel._sumExtras(p);
    var step = 0; // 0=initial, 1=extras removed, 2=shared

    var matX   = new THREE.MeshLambertMaterial({ color: t.shadeOn });
    var matE   = new THREE.MeshLambertMaterial({ color: t.shadeOff });
    var matInk = new THREE.MeshBasicMaterial({ color: t.ink });
    var inkHex = toHex(t.ink), faceHex = toHex(t.face);

    var rowH = 0.18, rowGap = 0.07, barLen = 1.24;
    var totalBH = n * rowH + (n - 1) * rowGap;
    var topY = totalBH / 2 - rowH / 2;
    var xFrac = 0.62;

    var meshes = [], sprites = [];

    function clearScene() {
      meshes.forEach(function (m) { if (m.geometry) m.geometry.dispose(); group.remove(m); });
      meshes = [];
      sprites.forEach(function (sp) { if (sp.material && sp.material.map) sp.material.map.dispose(); if (sp.material) sp.material.dispose(); group.remove(sp); });
      sprites = [];
    }

    function buildScene() {
      clearScene();
      var showQ = level >= 2 && step < 2;
      for (var i = 0; i < n; i++) {
        var e = p.extras[i];
        var ry = topY - i * (rowH + rowGap);
        var eShow = e !== 0 && step === 0;
        var xLen = eShow ? barLen * xFrac : barLen;
        var eLen = eShow ? barLen * (1 - xFrac) - 0.02 : 0;
        var xM = new THREE.Mesh(new THREE.BoxGeometry(xLen * 0.97, rowH * 0.9, 0.12), matX.clone());
        xM.position.set(-barLen / 2 + xLen / 2, ry, 0); xM.castShadow = true;
        group.add(xM); meshes.push(xM);
        var spX = makeTextSprite(THREE, showQ ? "?" : "x", 0.13, faceHex, null);
        spX.position.set(-barLen / 2 + xLen / 2, ry, 0.1); group.add(spX); sprites.push(spX);
        if (eShow) {
          var ex = -barLen / 2 + xLen + eLen / 2 + 0.02;
          var eM = new THREE.Mesh(new THREE.BoxGeometry(eLen * 0.97, rowH * 0.9, 0.12), matE.clone());
          eM.position.set(ex, ry, 0); eM.castShadow = true;
          group.add(eM); meshes.push(eM);
          var spE = makeTextSprite(THREE, (e > 0 ? "+" : "") + e, 0.12, inkHex, null);
          spE.position.set(ex, ry, 0.1); group.add(spE); sprites.push(spE);
        }
      }
      var brkX = barLen / 2 + 0.05;
      var yTop = topY + rowH / 2 + 0.05, yBot = topY - (n - 1) * (rowH + rowGap) - rowH / 2 - 0.05;
      var brkGeo = new THREE.BufferGeometry();
      brkGeo.setAttribute("position", new THREE.Float32BufferAttribute([
        brkX, yTop, 0.02, brkX + 0.06, yTop, 0.02,
        brkX, yTop, 0.02, brkX, yBot, 0.02,
        brkX, yBot, 0.02, brkX + 0.06, yBot, 0.02,
      ], 3));
      var brkLine = new THREE.LineSegments(brkGeo, matInk.clone());
      group.add(brkLine); meshes.push(brkLine);
      var spTot = makeTextSprite(THREE, String(p.total), 0.14, inkHex, null);
      spTot.position.set(brkX + 0.16, (yTop + yBot) / 2, 0.02); group.add(spTot); sprites.push(spTot);
    }

    buildScene();
    function render() { st.renderer.render(st.scene, st.cam); }
    render();

    function eqStr() {
      if (step === 0) return n + "x" + (sum > 0 ? "+" + sum : sum < 0 ? sum : "") + " = " + p.total;
      if (step === 1) return n + "x = " + (p.total - sum);
      return "x = " + (p.total - sum) / n;
    }

    var btns = [];
    if (level >= 3) {
      var ctrlDiv = makeCtrlDiv(el);
      var eqLine = makeEqLine(ctrlDiv);
      eqLine.textContent = eqStr();

      var btn1 = el.ownerDocument.createElement("button");
      btn1.textContent = "Take away the extras";
      btn1.setAttribute("aria-label", "Remove extra blocks from all bars");
      ctrlDiv.insertBefore(btn1, eqLine); btns.push(btn1);

      var btn2 = el.ownerDocument.createElement("button");
      btn2.textContent = "Share it out";
      btn2.setAttribute("aria-label", "Divide the remaining total equally between the x blocks");
      btn2.disabled = true;
      ctrlDiv.insertBefore(btn2, eqLine); btns.push(btn2);

      function doAnim(after) {
        if (reduced) { after(); return; }
        var t0 = null;
        function fr(now) {
          if (!t0) t0 = now;
          var prog = Math.min(1, (now - t0) / 500);
          group.position.x = 0.06 * Math.sin(prog * Math.PI * 2) * (1 - prog);
          render();
          if (prog < 1) raf = requestAnimationFrame(fr);
          else { group.position.x = 0; after(); raf = 0; }
        }
        raf = requestAnimationFrame(fr);
      }

      btn1.addEventListener("click", function () {
        if (step !== 0) return;
        doAnim(function () {
          step = 1; btn1.disabled = true; btn2.disabled = false;
          buildScene(); eqLine.textContent = eqStr(); render();
        });
      });
      btn2.addEventListener("click", function () {
        if (step !== 1) return;
        doAnim(function () {
          step = 2; btn2.disabled = true;
          buildScene(); eqLine.textContent = eqStr(); render();
        });
      });
    }

    el.setAttribute("aria-label", barModel.alt(p, opts && opts.theme, level));
    return {
      setReducedMotion: function (b) { reduced = b; render(); },
      resize: st.resize,
      dispose: function () {
        if (raf) cancelAnimationFrame(raf);
        clearScene();
        btns.forEach(function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
        var ctrl = el.querySelector(".scene-controls");
        if (ctrl && ctrl.parentNode) ctrl.parentNode.removeChild(ctrl);
        st.renderer.dispose();
        if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
      },
    };
  },
};

// ---- scene: algebra-tiles ---------------------------------------------------
// Groups of (xs x-tiles + units unit-tiles). Label: groups(xs·x + units) = total.
// Level 1: grouped. Level 2: rearranged (all x together, all units together).
// Level 3: interactive open/remove-units/share buttons.

var algebraTiles = {
  title: "Algebra tiles",
  wide: true,
  levels: [1, 2, 3],
  params: {
    groups: { type: "int", min: 1, max: 6,   default: 4 },
    xs:     { type: "int", min: 1, max: 3,   default: 1 },
    units:  { type: "int", min: 0, max: 12,  default: 3 },
    total:  { type: "int", min: 0, max: 200, default: 56 },
  },
  alt: function (p, theme, level) {
    level = normalizeLevel(level);
    var expr = p.groups + "(" + p.xs + "x" + (p.units ? " + " + p.units : "") + ") = " + p.total;
    var base = "Algebra tiles: " + expr + ". " + p.groups + " groups, each with " + p.xs + " x-tile" + (p.xs > 1 ? "s" : "") + (p.units ? " and " + p.units + " unit tile" + (p.units > 1 ? "s" : "") : "") + ".";
    if (level === 2) return base + " Rearranged: " + (p.groups * p.xs) + " x-tiles and " + (p.groups * p.units) + " unit tiles.";
    if (level >= 3) return base + " Use buttons to open brackets and solve.";
    return base;
  },
  svg: function (p, theme, level) {
    p = normalizeParams("algebra-tiles", p);
    level = normalizeLevel(level);
    var t = themeOf(theme), tone = printTones(t);
    var W = 480, H = 200;
    var tileW = 34, tileH = 46, uS = 28, gap = 6, gGap = 16;

    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(algebraTiles.alt(p, theme, level)) + '">';
    s += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';

    var totalXt = p.groups * p.xs, totalU = p.groups * p.units;
    // Clamp tiles to fit width
    var maxTiles = Math.floor((W - 24) / (tileW + gap));
    var drawXt = Math.min(totalXt, maxTiles), drawU = Math.min(totalU, Math.max(0, maxTiles - drawXt));

    if (level === 1) {
      var groupW = p.xs * (tileW + gap) + (p.units ? p.units * (uS + gap) : 0) + gGap;
      var drawG = Math.min(p.groups, Math.floor((W - 12) / groupW) || 1);
      var allW = drawG * groupW - gGap;
      var sx = (W - allW) / 2, ty = (H - tileH - 28) / 2;
      for (var g = 0; g < drawG; g++) {
        var gx = sx + g * groupW;
        for (var xi = 0; xi < p.xs; xi++) {
          var bx = gx + xi * (tileW + gap);
          s += '<rect x="' + bx.toFixed(1) + '" y="' + ty + '" width="' + tileW + '" height="' + tileH + '" fill="' + tone.on + '" stroke="' + tone.ink + '" stroke-width="1.5" rx="4"/>';
          s += '<text x="' + (bx + tileW / 2 | 0) + '" y="' + (ty + tileH / 2 + 7) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="#fff">x</text>';
        }
        var ux0 = gx + p.xs * (tileW + gap);
        for (var ui = 0; ui < p.units; ui++) {
          var ux = ux0 + ui * (uS + gap), uy = ty + (tileH - uS) / 2;
          s += '<rect x="' + ux.toFixed(1) + '" y="' + uy.toFixed(1) + '" width="' + uS + '" height="' + uS + '" fill="' + tone.off + '" stroke="' + tone.ink + '" stroke-width="1.5" rx="4"/>';
        }
      }
    } else {
      var xtW = drawXt * (tileW + gap) - (drawXt ? gap : 0);
      var utW = drawU > 0 ? gGap + drawU * (uS + gap) - gap : 0;
      var totW = xtW + utW;
      var sx2 = (W - totW) / 2, ty2 = (H - tileH - 28) / 2;
      for (var xi2 = 0; xi2 < drawXt; xi2++) {
        var bx2 = sx2 + xi2 * (tileW + gap);
        s += '<rect x="' + bx2.toFixed(1) + '" y="' + ty2 + '" width="' + tileW + '" height="' + tileH + '" fill="' + tone.on + '" stroke="' + tone.ink + '" stroke-width="1.5" rx="4"/>';
        s += '<text x="' + (bx2 + tileW / 2 | 0) + '" y="' + (ty2 + tileH / 2 + 7) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="#fff">x</text>';
      }
      var ux2 = sx2 + xtW + gGap;
      for (var ui2 = 0; ui2 < drawU; ui2++) {
        var uux = ux2 + ui2 * (uS + gap), uuy = ty2 + (tileH - uS) / 2;
        s += '<rect x="' + uux.toFixed(1) + '" y="' + uuy.toFixed(1) + '" width="' + uS + '" height="' + uS + '" fill="' + tone.off + '" stroke="' + tone.ink + '" stroke-width="1.5" rx="4"/>';
      }
    }

    var addStr = p.units ? " + " + p.units : "";
    var eq = p.groups + "(" + p.xs + "x" + addStr + ") = " + p.total;
    s += '<text x="' + (W / 2 | 0) + '" y="' + (H - 8) + '" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="' + tone.ink + '">' + eq + '</text>';
    s += propSvg(t.prop, W - 22, 20, 14, tone.ink);
    s += '</svg>';
    return s;
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("algebra-tiles", params);
    var level = normalizeLevel(opts && opts.level);
    var t = themeOf(opts && opts.theme);
    var st = makeAlgebraStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    var reduced = !!(opts && opts.reducedMotion);
    var raf = 0;
    // step: 0=grouped, 1=opened brackets (rearranged), 2=units removed, 3=shared
    var step = level === 1 ? 0 : 1;
    var totalX = p.groups * p.xs, totalU = p.groups * p.units;

    var matX = new THREE.MeshLambertMaterial({ color: t.shadeOn });
    var matU = new THREE.MeshLambertMaterial({ color: t.shadeOff });
    var inkHex = toHex(t.ink), faceHex = toHex(t.face);
    var tileMeshes = [], sprites = [];

    function clearAll() {
      tileMeshes.forEach(function (m) { if (m.geometry) m.geometry.dispose(); group.remove(m); });
      tileMeshes = [];
      sprites.forEach(function (sp) { if (sp.material && sp.material.map) sp.material.map.dispose(); if (sp.material) sp.material.dispose(); group.remove(sp); });
      sprites = [];
    }

    function buildScene() {
      clearAll();
      // Base tile dims; scaled down when a single group is too wide for one row.
      var tW = 0.10, tH = 0.17, tD = 0.09;
      var uW = 0.08, uH = 0.12, uD = 0.07;
      var gp = 0.022, gGp = 0.055, rPitch = 0.24, maxW = 1.20;

      var gW = p.xs * (tW + gp) - gp + (p.units ? gGp + p.units * (uW + gp) - gp : 0);
      if (gW > maxW) {
        var sc = maxW / gW;
        tW *= sc; tH *= sc; tD *= sc; uW *= sc; uH *= sc; uD *= sc;
        gp *= sc; gGp *= sc; rPitch = Math.max(rPitch * sc, 0.17);
        gW = maxW;
      }
      var nPerRow = Math.max(1, Math.floor((maxW + gGp) / (gW + gGp)));

      // Place count tiles in wrapped rows starting at startY; returns row count used.
      function placeRows(count, sz, h, d, mat, labelFn, labelColor, startY) {
        var per = Math.max(1, Math.floor((maxW + gp) / (sz + gp)));
        for (var i = 0; i < count; i++) {
          var row = Math.floor(i / per), col = i % per;
          var nInRow = Math.min(per, count - row * per);
          var rW = nInRow * sz + (nInRow - 1) * gp;
          var tx = -rW / 2 + col * (sz + gp) + sz / 2;
          var ty = startY - row * rPitch;
          var m = new THREE.Mesh(new THREE.BoxGeometry(sz * 0.92, h, d), mat.clone());
          m.position.set(tx, ty, 0); m.castShadow = true;
          group.add(m); tileMeshes.push(m);
          if (labelFn) {
            var sp = makeTextSprite(THREE, labelFn(i), 0.11, labelColor, null);
            sp.position.set(tx, ty, d / 2 + 0.04); group.add(sp); sprites.push(sp);
          }
        }
        return Math.ceil(count / per);
      }

      if (step === 0) {
        var nRows = Math.ceil(p.groups / nPerRow);
        var startY = (nRows - 1) * rPitch / 2;
        for (var g = 0; g < p.groups; g++) {
          var gr = Math.floor(g / nPerRow), gc = g % nPerRow;
          var nInR = Math.min(nPerRow, p.groups - gr * nPerRow);
          var rowW = nInR * (gW + gGp) - gGp;
          var gx = -rowW / 2 + gc * (gW + gGp);
          var gy = startY - gr * rPitch;
          for (var xi = 0; xi < p.xs; xi++) {
            var mx = gx + xi * (tW + gp) + tW / 2;
            var xm = new THREE.Mesh(new THREE.BoxGeometry(tW * 0.92, tH, tD), matX.clone());
            xm.position.set(mx, gy, 0); xm.castShadow = true;
            group.add(xm); tileMeshes.push(xm);
            var spx = makeTextSprite(THREE, "x", 0.11, faceHex, null);
            spx.position.set(mx, gy, tD / 2 + 0.04); group.add(spx); sprites.push(spx);
          }
          if (p.units) {
            var ux0 = gx + p.xs * (tW + gp) + gGp - gp;
            for (var ui = 0; ui < p.units; ui++) {
              var umx = ux0 + ui * (uW + gp) + uW / 2;
              var um = new THREE.Mesh(new THREE.BoxGeometry(uW * 0.92, uH, uD), matU.clone());
              um.position.set(umx, gy, 0); um.castShadow = true;
              group.add(um); tileMeshes.push(um);
            }
          }
        }
      } else {
        var showUnits = step < 2;
        var xLabel = (step >= 3) ? function () { return String((p.total - totalU) / totalX); } : function () { return "x"; };
        var xRows = placeRows(totalX, tW, tH, tD, matX, xLabel, faceHex, 0.10);
        if (showUnits && totalU > 0) {
          var cap = Math.min(totalU, 24);
          var uStartY = 0.10 - xRows * rPitch;
          placeRows(cap, uW, uH, uD, matU, null, null, uStartY);
          if (totalU > cap) {
            var per2 = Math.max(1, Math.floor((maxW + gp) / (uW + gp)));
            var lastRow = Math.floor((cap - 1) / per2);
            var spOvf = makeTextSprite(THREE, "+" + (totalU - cap), 0.11, inkHex, null);
            spOvf.position.set(0, uStartY - (lastRow + 1) * rPitch, 0.04);
            group.add(spOvf); sprites.push(spOvf);
          }
        }
      }
    }

    buildScene();
    function render() { st.renderer.render(st.scene, st.cam); }
    render();

    function eqStr() {
      var addStr = p.units ? " + " + p.units : "";
      if (step === 0) return p.groups + "(" + p.xs + "x" + addStr + ") = " + p.total;
      if (step === 1) return totalX + "x" + (totalU ? " + " + totalU : "") + " = " + p.total;
      if (step === 2) return totalX + "x = " + (p.total - totalU);
      return "x = " + (p.total - totalU) / totalX;
    }

    var btns = [];
    if (level >= 3) {
      var ctrlDiv = makeCtrlDiv(el);
      var eqLine = makeEqLine(ctrlDiv);
      eqLine.textContent = eqStr();

      var btn1 = el.ownerDocument.createElement("button");
      btn1.textContent = "Open the brackets";
      btn1.setAttribute("aria-label", "Expand the brackets and rearrange tiles");
      ctrlDiv.insertBefore(btn1, eqLine); btns.push(btn1);

      var btn2 = el.ownerDocument.createElement("button");
      btn2.textContent = "Take away the units";
      btn2.setAttribute("aria-label", "Remove unit tiles from both sides");
      btn2.disabled = true;
      ctrlDiv.insertBefore(btn2, eqLine); btns.push(btn2);

      var btn3 = el.ownerDocument.createElement("button");
      btn3.textContent = "Share";
      btn3.setAttribute("aria-label", "Divide both sides by the number of x-tiles");
      btn3.disabled = true;
      ctrlDiv.insertBefore(btn3, eqLine); btns.push(btn3);

      function doAnim(after) {
        if (reduced) { after(); return; }
        var t0 = null;
        function fr(now) {
          if (!t0) t0 = now;
          var prog = Math.min(1, (now - t0) / 500);
          // Tiles lift and regroup
          group.position.y = 0.06 * Math.sin(prog * Math.PI);
          render();
          if (prog < 1) raf = requestAnimationFrame(fr);
          else { group.position.y = 0; after(); raf = 0; }
        }
        raf = requestAnimationFrame(fr);
      }

      btn1.addEventListener("click", function () {
        if (step !== 0 && step !== 1) return;
        doAnim(function () {
          step = 1; btn1.disabled = true; btn2.disabled = false;
          buildScene(); eqLine.textContent = eqStr(); render();
        });
      });
      btn2.addEventListener("click", function () {
        if (step !== 1) return;
        doAnim(function () {
          step = 2; btn2.disabled = true; btn3.disabled = false;
          buildScene(); eqLine.textContent = eqStr(); render();
        });
      });
      btn3.addEventListener("click", function () {
        if (step !== 2) return;
        doAnim(function () {
          step = 3; btn3.disabled = true;
          buildScene(); eqLine.textContent = eqStr(); render();
        });
      });
    }

    el.setAttribute("aria-label", algebraTiles.alt(p, opts && opts.theme, level));
    return {
      setReducedMotion: function (b) { reduced = b; render(); },
      resize: st.resize,
      dispose: function () {
        if (raf) cancelAnimationFrame(raf);
        clearAll();
        btns.forEach(function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
        var ctrl = el.querySelector(".scene-controls");
        if (ctrl && ctrl.parentNode) ctrl.parentNode.removeChild(ctrl);
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
  "balance": balance,
  "function-machine": functionMachine,
  "bar-model": barModel,
  "algebra-tiles": algebraTiles,
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
