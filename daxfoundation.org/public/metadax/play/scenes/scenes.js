// Meta DAX scene registry — a small library of parameterized, low-poly 3D
// components. Mix-and-match = the same scene id with different params.
//
// three.js is NOT imported here. The host (player or demo page) loads the
// vendored three.module.min.js lazily and passes `THREE` into mount(), so a
// package with no `scene` block pulls in no 3D code at all. Keeping three out
// of this module also means it parses with `node --check` unchanged.
//
// A scene definition is:
//   {
//     title,                      // short human label
//     params,                     // { name: {type, ...bounds, default} } — used by the checker and for defaults
//     alt(params) -> string,      // alt-text generated from params (no WebGL needed)
//     mount(THREE, el, params, opts) -> { dispose(), setReducedMotion(bool) }
//   }
// opts: { reducedMotion?: bool }. mount() owns one <canvas> inside `el`.

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
  return { renderer: renderer, scene: scene, cam: cam, w: w, h: h, aspect: aspect };
}

// ---- scene: fraction-bars ---------------------------------------------------

var fractionBars = {
  title: "Fraction bars",
  params: {
    denominators: { type: "int-array", min: 1, max: 12, maxLen: 3, default: [2, 4] },
    shaded: { type: "int-array", min: 0, max: 12, maxLen: 3, default: [1, 1] },
  },
  alt: function (p) {
    var parts = p.denominators.map(function (d, i) {
      var s = p.shaded[i] != null ? p.shaded[i] : 0;
      return s + " of " + d + (d === 1 ? " part" : " parts") + " shaded";
    });
    return "Fraction bars, one above the other: " + parts.join("; ") + ".";
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("fraction-bars", params);
    var st = makeStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    var n = p.denominators.length;
    var barH = 0.34, gap = 0.12;
    var totalH = n * barH + (n - 1) * gap;
    p.denominators.forEach(function (den, row) {
      var shaded = p.shaded[row] != null ? p.shaded[row] : 0;
      var fullW = 1.7, segW = fullW / den;
      var y = totalH / 2 - barH / 2 - row * (barH + gap);
      for (var i = 0; i < den; i++) {
        var geo = new THREE.BoxGeometry(segW * 0.94, barH, 0.1);
        var col = i < shaded ? 0x3b7dd8 : 0xdfe6f0;
        var mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: col }));
        mesh.position.set(-fullW / 2 + segW * (i + 0.5), y, 0);
        group.add(mesh);
      }
    });
    var reduced = !!(opts && opts.reducedMotion), raf = 0;
    function render() { st.renderer.render(st.scene, st.cam); }
    function loop() {
      if (reduced) { render(); return; }
      group.rotation.y = Math.sin(performance.now() / 1400) * 0.12;
      render();
      raf = requestAnimationFrame(loop);
    }
    loop();
    return {
      setReducedMotion: function (b) { reduced = b; if (b && raf) { cancelAnimationFrame(raf); raf = 0; } else if (!b && !raf) loop(); },
      dispose: function () { if (raf) cancelAnimationFrame(raf); st.renderer.dispose(); if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement); },
    };
  },
};

// ---- scene: clock -----------------------------------------------------------

var clock = {
  title: "Analog clock",
  params: {
    hour: { type: "int", min: 0, max: 12, default: 3 },
    minute: { type: "int", min: 0, max: 59, default: 0 },
    draggable: { type: "bool", default: true },
  },
  alt: function (p) {
    var hh = ((p.hour % 12) || 12);
    var mm = (p.minute < 10 ? "0" : "") + p.minute;
    return "An analog clock showing " + hh + ":" + mm +
      (p.draggable ? ". The hands can be moved." : ".");
  },
  mount: function (THREE, el, params, opts) {
    var p = normalizeParams("clock", params);
    var st = makeStage(THREE, el);
    var group = new THREE.Group();
    st.scene.add(group);
    // face
    var face = new THREE.Mesh(new THREE.CircleGeometry(0.85, 48), new THREE.MeshLambertMaterial({ color: 0xf5f7fb }));
    group.add(face);
    var ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 0.92, 48), new THREE.MeshBasicMaterial({ color: 0x33415c }));
    group.add(ring);
    for (var t = 0; t < 12; t++) {
      var a = (t / 12) * Math.PI * 2;
      var tick = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.02), new THREE.MeshBasicMaterial({ color: 0x33415c }));
      tick.position.set(Math.sin(a) * 0.74, Math.cos(a) * 0.74, 0.02);
      tick.rotation.z = -a;
      group.add(tick);
    }
    function makeHand(len, wid, col) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(wid, len, 0.02), new THREE.MeshBasicMaterial({ color: col }));
      m.geometry.translate(0, len / 2, 0); // pivot at base
      m.position.z = 0.03;
      group.add(m);
      return m;
    }
    var hourHand = makeHand(0.42, 0.045, 0x1b2a44);
    var minHand = makeHand(0.66, 0.03, 0x3b7dd8);
    var state = { hour: p.hour % 12, minute: p.minute };
    function place() {
      var ma = (state.minute / 60) * Math.PI * 2;
      var ha = ((state.hour + state.minute / 60) / 12) * Math.PI * 2;
      minHand.rotation.z = -ma;
      hourHand.rotation.z = -ha;
      el.setAttribute("aria-label", clock.alt({ hour: state.hour, minute: state.minute, draggable: p.draggable }));
    }
    place();
    var reduced = !!(opts && opts.reducedMotion);
    function render() { st.renderer.render(st.scene, st.cam); }
    render();

    // pointer + keyboard control of the minute hand
    var cleanup = [];
    if (p.draggable) {
      el.tabIndex = 0;
      var dragging = false;
      function setFromClient(cx, cy) {
        var r = st.renderer.domElement.getBoundingClientRect();
        var x = (cx - r.left) / r.width * 2 - 1;
        var y = -((cy - r.top) / r.height * 2 - 1);
        var ang = Math.atan2(x, y); // 0 at top, clockwise
        if (ang < 0) ang += Math.PI * 2;
        state.minute = Math.round(ang / (Math.PI * 2) * 60) % 60;
        place(); render();
      }
      var onDown = function (e) { dragging = true; setFromClient(e.clientX, e.clientY); e.preventDefault(); };
      var onMove = function (e) { if (dragging) setFromClient(e.clientX, e.clientY); };
      var onUp = function () { dragging = false; };
      var onKey = function (e) {
        var step = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : (e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0);
        if (!step) return;
        state.minute = (state.minute + step + 60) % 60;
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
      dispose: function () { cleanup.forEach(function (fn) { fn(); }); st.renderer.dispose(); if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement); },
    };
  },
};

// ---- registry ---------------------------------------------------------------

export var SCENES = {
  "fraction-bars": fractionBars,
  "clock": clock,
};

export function getScene(id) { return SCENES[id] || null; }
export function sceneIds() { return Object.keys(SCENES); }
export function altFor(id, params) {
  var def = SCENES[id];
  return def ? def.alt(normalizeParams(id, params)) : "";
}
