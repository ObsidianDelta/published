// Meta DAX storage scenes — two epic 3D cutaways for a French college kit on
// virtualized storage in Proxmox VE 9 (a file system inside a file inside a
// file system). This module is SELF-CONTAINED: it does not import scenes.js and
// must not import three.js — the host passes `THREE` into mount(). scenes.js
// imports { storageStack, thinPool } from here and registers them.
//
// Two scenes:
//   storage-stack — the nested "Russian dolls" of a VM/CT disk, outermost
//                   (physical) to innermost (a file). Explore (level 2) dives
//                   layer by layer; Configure (level 3) builds it command by
//                   command.
//   thin-pool     — a glass tank (the thin pool) that over-allocates: declared
//                   VM disks can total more than the pool, and freed guest
//                   space only returns to the pool with discard/fstrim.
//
// All visible text comes from the STR table keyed by lang ("fr" | "en"); default
// "en". French strings are final — accents, « », and non-breaking spaces before
// ":" are deliberate. The 3D look is identical for every theme (dark lab,
// scene.background #070b18); the theme only tints one accent colour.

// ── tiny helpers (copied so this module stays standalone) ────────────────────
function clampInt(v, lo, hi, dflt) {
  v = Math.round(Number(v));
  if (!Number.isFinite(v)) return dflt;
  return Math.max(lo, Math.min(hi, v));
}
function normLevel(level) {
  var n = Math.round(Number(level));
  return Number.isFinite(n) ? Math.max(1, Math.min(3, n)) : 1;
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function hex2(n) { n = Math.max(0, Math.min(255, Math.round(n))); return (n < 16 ? "0" : "") + n.toString(16); }
function toHex(rgbInt) { return "#" + hex2((rgbInt >> 16) & 255) + hex2((rgbInt >> 8) & 255) + hex2(rgbInt & 255); }
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

// Normalize + clamp a params object against a scene schema. Mirrors scenes.js
// normalizeParams but is kept here so svg()/alt()/mount() are robust when called
// directly; it also understands the "enum" type (keep value if listed else default).
function normStorage(def, params) {
  var schema = def.params || {}, out = {}, p = params || {};
  Object.keys(schema).forEach(function (k) {
    var s = schema[k], v = p[k];
    if (s.type === "int") out[k] = clampInt(v, s.min, s.max, s.default);
    else if (s.type === "bool") out[k] = typeof v === "boolean" ? v : !!s.default;
    else if (s.type === "enum") out[k] = (s.values && s.values.indexOf(v) >= 0) ? v : s.default;
    else if (s.type === "int-array") {
      var arr = Array.isArray(v) ? v : s.default.slice();
      arr = arr.slice(0, s.maxLen || 6).map(function (n) { return clampInt(n, s.min, s.max, s.min); });
      out[k] = arr.length ? arr : s.default.slice();
    } else out[k] = v != null ? v : s.default;
  });
  return out;
}

// Canvas-texture Sprite: crisp label in 3D world space, with a dark outline so
// white text stays legible over a glowing glass panel (copied from scenes.js).
function makeTextSprite(doc, THREE, text, worldH, inkHex, outlineHex) {
  var pxH = 80, len = Math.max(1, text.length);
  var pxW = Math.max(pxH, Math.ceil(len * pxH * 0.56));
  pxW = Math.pow(2, Math.ceil(Math.log2(pxW)));
  var cvs = doc.createElement("canvas");
  cvs.width = pxW; cvs.height = pxH;
  var ctx = cvs.getContext("2d");
  var fs = Math.round(pxH * 0.5);
  ctx.font = "bold " + fs + "px system-ui,sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (outlineHex) { ctx.lineWidth = Math.max(3, fs * 0.18); ctx.lineJoin = "round"; ctx.strokeStyle = outlineHex; ctx.strokeText(text, pxW / 2, pxH / 2); }
  ctx.fillStyle = inkHex;
  ctx.fillText(text, pxW / 2, pxH / 2);
  var tex = new THREE.CanvasTexture(cvs);
  var mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  var sp = new THREE.Sprite(mat);
  sp.scale.set(worldH * (pxW / pxH), worldH, 1);
  return sp;
}

// A soft additive glow sprite to sit just behind a glowing panel/edge.
function makeGlowSprite(doc, THREE, colorInt, worldSize) {
  var r = (colorInt >> 16) & 255, g = (colorInt >> 8) & 255, b = colorInt & 255;
  var cvs = doc.createElement("canvas"); cvs.width = cvs.height = 64;
  var c = cvs.getContext("2d");
  var grad = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0.38)");
  grad.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
  c.fillStyle = grad; c.fillRect(0, 0, 64, 64);
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cvs), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, depthTest: false }));
  sp.scale.set(worldSize, worldSize, 1);
  return sp;
}

// ── crisp HTML labels over the canvas ─────────────────────────────────────────
// Text drawn into WebGL blurs and is hard to read at phone sizes; these labels
// are real DOM, positioned each frame from projected 3D points (st.post).
function makeOverlay(el, canvas) {
  var doc = el.ownerDocument;
  try { if (doc.defaultView.getComputedStyle(el).position === "static") el.style.position = "relative"; } catch (e) { el.style.position = "relative"; }
  var ov = doc.createElement("div");
  ov.setAttribute("aria-hidden", "true");
  ov.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;overflow:hidden;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.2;";
  var NS = "http://www.w3.org/2000/svg";
  var svg = doc.createElementNS(NS, "svg");
  svg.setAttribute("style", "position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible");
  ov.appendChild(svg);
  if (canvas.nextSibling) el.insertBefore(ov, canvas.nextSibling); else el.appendChild(ov);
  return {
    sync: function () {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      ov.style.width = w + "px"; ov.style.height = h + "px";
      ov.style.left = canvas.offsetLeft + "px"; ov.style.top = canvas.offsetTop + "px";
      return { w: w, h: h };
    },
    div: function (css) { var d = doc.createElement("div"); d.style.cssText = "position:absolute;" + (css || ""); ov.appendChild(d); return d; },
    line: function () { var l = doc.createElementNS(NS, "polyline"); l.setAttribute("fill", "none"); svg.appendChild(l); return l; },
    dot: function () { var c = doc.createElementNS(NS, "circle"); c.setAttribute("r", "0"); svg.appendChild(c); return c; },
    dispose: function () { if (ov.parentNode) ov.parentNode.removeChild(ov); },
  };
}

// A soft radial pool of light in one colour (floor glows, liquid surface).
function radialTex(doc, THREE, colorInt) {
  var r = (colorInt >> 16) & 255, g = (colorInt >> 8) & 255, b = colorInt & 255;
  var cvs = doc.createElement("canvas"); cvs.width = cvs.height = 128;
  var c = cvs.getContext("2d");
  var grad = c.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0.55)");
  grad.addColorStop(0.55, "rgba(" + r + "," + g + "," + b + ",0.16)");
  grad.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
  c.fillStyle = grad; c.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cvs);
}

// Diagonal hatching: blocks freed in the guest but still held by the pool.
function stripeTex(doc, THREE) {
  var cvs = doc.createElement("canvas"); cvs.width = cvs.height = 32;
  var c = cvs.getContext("2d");
  c.strokeStyle = "rgba(255,255,255,0.95)"; c.lineWidth = 5;
  for (var k = -32; k <= 64; k += 12) { c.beginPath(); c.moveTo(k, 32); c.lineTo(k + 32, 0); c.stroke(); }
  var t = new THREE.CanvasTexture(cvs); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2);
  return t;
}

function circlePts(THREE, r, seg) {
  var pts = [];
  for (var i = 0; i < seg; i++) { var a = i / seg * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  return pts;
}

function makeCtrlDiv(el) { var d = el.ownerDocument.createElement("div"); d.className = "scene-controls"; el.appendChild(d); return d; }
function makeEqLine(ctrlDiv) {
  var d = ctrlDiv.ownerDocument.createElement("div");
  d.className = "scene-eq";
  d.setAttribute("aria-live", "polite");
  d.setAttribute("aria-atomic", "true");
  ctrlDiv.appendChild(d);
  return d;
}
function makeButton(doc, label) { var b = doc.createElement("button"); b.textContent = label; return b; }
function setEqLines(eq, line1, line2) { eq.innerHTML = esc(line1) + (line2 != null ? '<br>' + esc(line2) : ''); }

// Recursively dispose a three.js object's geometries, materials and textures.
function disposeObj(obj) {
  obj.traverse(function (o) {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
}

// The accent colour per theme (the ONLY thing a theme changes in these scenes).
// Copied from scenes.js THEMES so this module needs no import.
var ACCENT = {
  plain: 0x3b7dd8, unicorn: 0xff7ec8, hockey: 0xd8462f, dinosaur: 0xcf8a3a,
  space: 0x9d6bff, football: 0x5ad07a, running: 0xf0863a, sage: 0x6a9e5a,
};
function accentOf(theme) { return ACCENT[theme] != null ? ACCENT[theme] : ACCENT.plain; }

// Colour by layer family (identical in every theme).
//   phys   physical disk(s)                      copper/amber
//   teal   partition / PV / VG / pool / dataset  teal
//   violet host file system / storage entry      violet
//   cyan   image file / thin LV / zvol / subvol  cyan
//   guest  guest or container layers             green
//   file   the innermost file                    white-gold document tile
var FAM = { phys: 0xd9893b, teal: 0x2fc7b5, violet: 0x8b6cff, cyan: 0x38c8ff, guest: 0x59e08a, file: 0xfff4d0 };

// ── a dark-lab perspective stage ─────────────────────────────────────────────
// Like makeAlgebraStage in scenes.js: PerspectiveCamera framed to fit the
// content box with a margin; resize refits. background #070b18 for every theme.
function makeStage(THREE, el) {
  var w = el.clientWidth || 680, h = Math.round(w * (w < 470 ? 3 / 4 : 9 / 16));
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(w, h, false);
  renderer.domElement.style.aspectRatio = w < 470 ? "4 / 3" : "16 / 9";
  el.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b18);
  var cam = new THREE.PerspectiveCamera(40, w / h, 0.02, 100);
  scene.add(new THREE.HemisphereLight(0x8898ff, 0x0a0f22, 0.7));
  var key = new THREE.DirectionalLight(0xdfe8ff, 0.9);
  key.position.set(1.4, 2.4, 2.2);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0x3a4780, 0.35));
  var st = { renderer: renderer, scene: scene, cam: cam, w: w, h: h };
  st.resize = function () {
    var cvs = renderer.domElement;
    cvs.style.aspectRatio = cvs.clientWidth < 470 ? "4 / 3" : "16 / 9";
    var nw = cvs.clientWidth, nh = cvs.clientHeight;
    if (!nw || !nh || (nw === st.w && nh === st.h)) return;
    st.w = nw; st.h = nh;
    renderer.setSize(nw, nh, false);
    cam.aspect = nw / nh;
    cam.updateProjectionMatrix();
    renderer.render(scene, cam);
    if (st.post) st.post();
  };
  return st;
}

// A small animation driver shared by both scenes. One rAF loop: it runs tweens
// at full rate and a gentle idle pulse capped at ~30 fps, and STOPS when the
// canvas leaves the DOM. Under reduced motion it never loops — add() jumps
// straight to the end state and we render once.
function makeAnim(st, reduced) {
  var raf = 0, tweens = [], idleFns = [], last = 0;
  function render() { st.renderer.render(st.scene, st.cam); if (st.post) st.post(); }
  function frame(now) {
    if (!st.renderer.domElement.isConnected) { raf = 0; return; }
    var active = tweens.length > 0;
    if (active || now - last >= 33) {        // 30 fps idle cap; full rate for tweens
      last = now;
      for (var i = tweens.length - 1; i >= 0; i--) {
        var tw = tweens[i];
        if (!tw.t0) tw.t0 = now;
        var p = Math.min(1, (now - tw.t0) / tw.dur);
        tw.fn(tw.ease ? easeInOut(p) : p);
        if (p >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
      }
      for (var j = 0; j < idleFns.length; j++) idleFns[j](now);
      render();
    }
    raf = requestAnimationFrame(frame);
  }
  return {
    start: function () { if (reduced || raf) return; last = 0; raf = requestAnimationFrame(frame); },
    add: function (tw) {
      if (reduced) { tw.fn(1); if (tw.done) tw.done(); render(); return; }
      tweens.push(tw); this.start();
    },
    idle: function (fn) { idleFns.push(fn); },
    render: render,
    setReduced: function (b) { reduced = b; if (b) { this.stop(); render(); } else this.start(); },
    stop: function () { if (raf) cancelAnimationFrame(raf); raf = 0; },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYER DATA. Each backend is an ordered list of layers, OUTERMOST (physical) to
// INNERMOST (a file). Per layer: w = world ("hote" | "invite" | "conteneur"),
// fam = colour family (see FAM), fr/en = [title, detail]. {vmid} and {gb} are
// substituted from params. Details are near language-neutral (paths); only a few
// tokens translate (Gio↔GiB, "monté sur"↔"mounted on", "stockage"↔"storage",
// "périphérique en mode bloc"↔"block device", "dans le CT"↔"in CT").
// Other people will add backends later: copy a block and keep this shape.
// ─────────────────────────────────────────────────────────────────────────────
var DATA = {
  dir: {
    layers: [
      { w: "hote",   fam: "phys",   fr: ["Disque physique", "/dev/sdb · SSD"],                                   en: ["Physical disk", "/dev/sdb · SSD"] },
      { w: "hote",   fam: "teal",   fr: ["Partition", "/dev/sdb1 (table GPT)"],                                  en: ["Partition", "/dev/sdb1 (GPT table)"] },
      { w: "hote",   fam: "violet", fr: ["Système de fichiers de l’hôte", "ext4 monté sur /mnt/vmstore"],        en: ["Host file system", "ext4 mounted on /mnt/vmstore"] },
      { w: "hote",   fam: "violet", fr: ["Stockage Proxmox « vmstore » (type dir)", "/mnt/vmstore/images/{vmid}/"], en: ['Proxmox storage "vmstore" (dir type)', "/mnt/vmstore/images/{vmid}/"] },
      { w: "hote",   fam: "cyan",   fr: ["Fichier image disque (qcow2)", "vm-{vmid}-disk-0.qcow2"],              en: ["Disk image file (qcow2)", "vm-{vmid}-disk-0.qcow2"] },
      { w: "invite", fam: "guest",  fr: ["Disque virtuel vu par l’invité", "/dev/sdb · {gb} Gio"],               en: ["Virtual disk as the guest sees it", "/dev/sdb · {gb} GiB"] },
      { w: "invite", fam: "guest",  fr: ["Partition de l’invité", "/dev/sdb1"],                                  en: ["Guest partition", "/dev/sdb1"] },
      { w: "invite", fam: "guest",  fr: ["Système de fichiers de l’invité", "ext4 monté sur /donnees"],          en: ["Guest file system", "ext4 mounted on /donnees"] },
      { w: "invite", fam: "file",   fr: ["Fichier de l’invité", "/donnees/notes.txt"],                           en: ["Guest file", "/donnees/notes.txt"] },
    ],
    vol: "vmstore:{vmid}/vm-{vmid}-disk-0.qcow2 → /mnt/vmstore/images/{vmid}/vm-{vmid}-disk-0.qcow2",
    // Level-3 build steps. world sets the prompt prefix; add = layer indices (0-based)
    // revealed by this step; badge tags a layer with a storage name (no new layer).
    steps: [
      { w: "hote",   cmd: "sgdisk -N 1 /dev/sdb", add: [1] },
      { w: "hote",   cmd: "mkfs.ext4 /dev/sdb1 && mount /dev/sdb1 /mnt/vmstore", add: [2] },
      { w: "hote",   cmd: "pvesm add dir vmstore --path /mnt/vmstore --content images", add: [3] },
      { w: "hote",   cmd: "qm set {vmid} --scsi1 vmstore:{gb},format=qcow2", add: [4, 5] },
      { w: "invite", cmd: "sudo fdisk /dev/sdb   (n, p, Entrée…, w)", add: [6] },
      { w: "invite", cmd: "sudo mkfs.ext4 /dev/sdb1 && sudo mount /dev/sdb1 /donnees", add: [7] },
      { w: "invite", cmd: 'echo "bonjour" > /donnees/notes.txt', add: [8] },
    ],
  },

  lvmthin: {
    layers: [
      { w: "hote",   fam: "phys",   fr: ["Disque physique", "/dev/sdb · SSD"],   en: ["Physical disk", "/dev/sdb · SSD"] },
      { w: "hote",   fam: "teal",   fr: ["Partition", "/dev/sdb1"],              en: ["Partition", "/dev/sdb1"] },
      { w: "hote",   fam: "teal",   fr: ["Volume physique LVM", "PV /dev/sdb1"], en: ["LVM physical volume", "PV /dev/sdb1"] },
      { w: "hote",   fam: "teal",   fr: ["Groupe de volumes", "vmdata"],         en: ["Volume group", "vmdata"] },
      { w: "hote",   fam: "teal",   fr: ["Pool avec allocation granulaire", "vmdata/data (100 Gio) · stockage « vmthin »"], en: ["Thin pool", 'vmdata/data (100 GiB) · storage "vmthin"'] },
      { w: "hote",   fam: "cyan",   fr: ["Volume logique à allocation granulaire", "vmdata/vm-{vmid}-disk-0 · périphérique en mode bloc (raw)"], en: ["Thin logical volume", "vmdata/vm-{vmid}-disk-0 · block device (raw)"] },
      { w: "invite", fam: "guest",  fr: ["Disque virtuel vu par l’invité", "/dev/sdb · {gb} Gio"], en: ["Virtual disk as the guest sees it", "/dev/sdb · {gb} GiB"] },
      { w: "invite", fam: "guest",  fr: ["Partition de l’invité", "/dev/sdb1"],  en: ["Guest partition", "/dev/sdb1"] },
      { w: "invite", fam: "guest",  fr: ["Système de fichiers de l’invité", "ext4 monté sur /donnees"], en: ["Guest file system", "ext4 mounted on /donnees"] },
      { w: "invite", fam: "file",   fr: ["Fichier de l’invité", "/donnees/notes.txt"], en: ["Guest file", "/donnees/notes.txt"] },
    ],
    vol: "vmthin:vm-{vmid}-disk-0 → /dev/vmdata/vm-{vmid}-disk-0",
    steps: [
      { w: "hote",   cmd: "sgdisk -N 1 /dev/sdb", add: [1] },
      { w: "hote",   cmd: "pvcreate /dev/sdb1", add: [2] },
      { w: "hote",   cmd: "vgcreate vmdata /dev/sdb1", add: [3] },
      { w: "hote",   cmd: "lvcreate -L 100G -n data vmdata && lvconvert --type thin-pool vmdata/data", add: [4] },
      { w: "hote",   cmd: "pvesm add lvmthin vmthin --vgname vmdata --thinpool data --content images,rootdir", add: [], badge: { layer: 4, text: "vmthin" } },
      { w: "hote",   cmd: "qm set {vmid} --scsi1 vmthin:{gb}", add: [5, 6] },
      { w: "invite", cmd: "sudo fdisk /dev/sdb   (n, p, Entrée…, w)", add: [7] },
      { w: "invite", cmd: "sudo mkfs.ext4 /dev/sdb1 && sudo mount /dev/sdb1 /donnees", add: [8] },
      { w: "invite", cmd: 'echo "bonjour" > /donnees/notes.txt', add: [9] },
    ],
  },

  zfs: {
    layers: [
      { w: "hote",   fam: "phys",  fr: ["Disques physiques (miroir)", "/dev/sdb + /dev/sdc"], en: ["Physical disks (mirror)", "/dev/sdb + /dev/sdc"] },
      { w: "hote",   fam: "teal",  fr: ["Pool ZFS", "tank (mirror)"],                          en: ["ZFS pool", "tank (mirror)"] },
      { w: "hote",   fam: "teal",  fr: ["Dataset ZFS", "tank/vmdata · stockage « vmzfs »"], en: ["ZFS dataset", 'tank/vmdata · storage "vmzfs"'] },
      { w: "hote",   fam: "cyan",  fr: ["Volume ZFS (zvol)", "tank/vmdata/vm-{vmid}-disk-0 · périphérique en mode bloc (raw)"], en: ["ZFS volume (zvol)", "tank/vmdata/vm-{vmid}-disk-0 · block device (raw)"] },
      { w: "invite", fam: "guest", fr: ["Disque virtuel vu par l’invité", "/dev/sdb · {gb} Gio"], en: ["Virtual disk as the guest sees it", "/dev/sdb · {gb} GiB"] },
      { w: "invite", fam: "guest", fr: ["Partition de l’invité", "/dev/sdb1"],                 en: ["Guest partition", "/dev/sdb1"] },
      { w: "invite", fam: "guest", fr: ["Système de fichiers de l’invité", "ext4 monté sur /donnees"], en: ["Guest file system", "ext4 mounted on /donnees"] },
      { w: "invite", fam: "file",  fr: ["Fichier de l’invité", "/donnees/notes.txt"],          en: ["Guest file", "/donnees/notes.txt"] },
    ],
    vol: "vmzfs:vm-{vmid}-disk-0 → /dev/zvol/tank/vmdata/vm-{vmid}-disk-0",
    steps: [
      { w: "hote",   cmd: "zpool create -o ashift=12 tank mirror /dev/sdb /dev/sdc", add: [1] },
      { w: "hote",   cmd: "zfs create tank/vmdata", add: [2] },
      { w: "hote",   cmd: "pvesm add zfspool vmzfs --pool tank/vmdata --content images,rootdir --sparse 1", add: [], badge: { layer: 2, text: "vmzfs" } },
      { w: "hote",   cmd: "qm set {vmid} --scsi1 vmzfs:{gb}", add: [3, 4] },
      { w: "invite", cmd: "sudo fdisk /dev/sdb   (n, p, Entrée…, w)", add: [5] },
      { w: "invite", cmd: "sudo mkfs.ext4 /dev/sdb1 && sudo mount /dev/sdb1 /donnees", add: [6] },
      { w: "invite", cmd: 'echo "bonjour" > /donnees/notes.txt', add: [7] },
    ],
  },

  // A container has NO virtual disk: the ZFS subvolume IS a file system the host
  // mounts as the container's root; the kernel is shared with the host.
  "zfs-ct": {
    layers: [
      { w: "hote",       fam: "phys",  fr: ["Disques physiques (miroir)", "/dev/sdb + /dev/sdc"], en: ["Physical disks (mirror)", "/dev/sdb + /dev/sdc"] },
      { w: "hote",       fam: "teal",  fr: ["Pool ZFS", "tank (mirror)"],                          en: ["ZFS pool", "tank (mirror)"] },
      { w: "hote",       fam: "teal",  fr: ["Dataset ZFS", "tank/vmdata · stockage « vmzfs »"], en: ["ZFS dataset", 'tank/vmdata · storage "vmzfs"'] },
      { w: "hote",       fam: "cyan",  fr: ["Sous-volume ZFS (un système de fichiers)", "tank/vmdata/subvol-{vmid}-disk-0"], en: ["ZFS subvolume (a file system)", "tank/vmdata/subvol-{vmid}-disk-0"] },
      { w: "conteneur",  fam: "guest", fr: ["Racine du conteneur", "/ dans le CT {vmid} · même noyau que l’hôte"], en: ["Container root", "/ in CT {vmid} · same kernel as the host"] },
      { w: "conteneur",  fam: "file",  fr: ["Fichier du conteneur", "/root/notes.txt"],            en: ["Container file", "/root/notes.txt"] },
    ],
    vol: "vmzfs:subvol-{vmid}-disk-0 → /tank/vmdata/subvol-{vmid}-disk-0",
    steps: [
      { w: "hote",      cmd: "zpool create -o ashift=12 tank mirror /dev/sdb /dev/sdc", add: [1] },
      { w: "hote",      cmd: "zfs create tank/vmdata", add: [2] },
      { w: "hote",      cmd: "pvesm add zfspool vmzfs --pool tank/vmdata --content images,rootdir --sparse 1", add: [], badge: { layer: 2, text: "vmzfs" } },
      { w: "hote",      cmd: "pct create {vmid} local:vztmpl/<modèle>.tar.zst --rootfs vmzfs:8", add: [3, 4] },
      { w: "conteneur", cmd: 'echo "bonjour" > /root/notes.txt', add: [5] },
    ],
  },
};

// Shell prompt prefix for a level-3 step, by world.
var PROMPT = { hote: "hôte # ", invite: "invité $ ", conteneur: "CT # " };

// ── UI string table (all visible text) ───────────────────────────────────────
var STR = {
  fr: {
    dive: "Plonger ↓", rise: "Remonter ↑", guestView: "Vue de l’invité", hostView: "Vue de l’hôte",
    guestOnly: "L’invité ne voit que ceci",
    boundaryGuest: "Frontière hôte | invité", boundaryCt: "Frontière hôte | conteneur",
    runStep: function (k) { return "Exécuter l’étape " + k; }, restart: "Recommencer",
    ready: "Prêt : rien n’est encore créé. Exécutez l’étape 1.",
    ctView: "Vue du conteneur", ctOnly: "Le conteneur ne voit que ceci",
    svgStack: "Pile de stockage", svgPool: "Pool à allocation granulaire",
    ioErr: "erreurs d’E/S",
    poolName: function (c) { return "Pool · " + c + " Gio"; },
    poolUse: function (a, p) { return a + " Gio alloués (" + p + " %)"; },
    erased: function (id, d) { return "VM " + id + " : " + d + " Gio effacés dans l’invité, toujours alloués dans le pool."; },
    write: function (id) { return "Écrire 10 Gio (VM " + id + ")"; }, reset: "Réinitialiser",
    erase: "Effacer 10 Gio dans la VM 101", fstrim: "fstrim dans la VM 101",
    over: function (o) { return "Surallocation : " + o + " Gio"; },
    poolFull: "Pool plein : les VM qui écrivent reçoivent des erreurs d’E/S.",
    vmFull: function (id) { return "Disque de la VM " + id + " plein (côté invité)"; },
    noTrim: "Rien n’est rendu au pool : l’option discard est désactivée sur ce disque.",
    trimmed: function (n) { return n + " Gio rendus au pool par discard."; },
    eqPool: function (d, w, c, p) { return "Promis : " + d + " Gio · Alloué : " + w + " Gio · Pool : " + c + " Gio (" + p + " %)"; },
    vmLabel: function (id, w, d) { return "VM " + id + " · " + w + "/" + d + " Gio"; },
    unit: "Gio",
    stackAlt: function (bk, n, first, last, vol) { return "Pile de stockage " + bk + " : " + n + " couches imbriquées, de « " + first + " » (hôte) à « " + last + " » (invité). Volume : " + vol + "."; },
    poolAlt: function (c, k, d, w, p) { return "Pool à allocation granulaire de " + c + " Gio : " + k + " disques de VM déclarent " + d + " Gio au total, dont " + w + " Gio écrits (" + p + " % du pool)."; },
  },
  en: {
    dive: "Dive in ↓", rise: "Back up ↑", guestView: "Guest view", hostView: "Host view",
    guestOnly: "This is all the guest sees",
    boundaryGuest: "Host | guest boundary", boundaryCt: "Host | container boundary",
    runStep: function (k) { return "Run step " + k; }, restart: "Restart",
    ready: "Ready: nothing is created yet. Run step 1.",
    ctView: "Container view", ctOnly: "This is all the container sees",
    svgStack: "Storage stack", svgPool: "Thin pool",
    ioErr: "I/O errors",
    poolName: function (c) { return "Pool · " + c + " GiB"; },
    poolUse: function (a, p) { return a + " GiB allocated (" + p + " %)"; },
    erased: function (id, d) { return "VM " + id + ": " + d + " GiB deleted in the guest, still allocated in the pool."; },
    write: function (id) { return "Write 10 GiB (VM " + id + ")"; }, reset: "Reset",
    erase: "Delete 10 GiB in VM 101", fstrim: "fstrim in VM 101",
    over: function (o) { return "Over-allocation: " + o + " GiB"; },
    poolFull: "Pool full: VMs that write get I/O errors.",
    vmFull: function (id) { return "VM " + id + " disk full (guest side)"; },
    noTrim: "Nothing is returned to the pool: discard is disabled on this disk.",
    trimmed: function (n) { return n + " GiB returned to the pool by discard."; },
    eqPool: function (d, w, c, p) { return "Promised: " + d + " GiB · Allocated: " + w + " GiB · Pool: " + c + " GiB (" + p + " %)"; },
    vmLabel: function (id, w, d) { return "VM " + id + " · " + w + "/" + d + " GiB"; },
    unit: "GiB",
    stackAlt: function (bk, n, first, last, vol) { return bk + " storage stack: " + n + " nested layers, from \"" + first + "\" (host) to \"" + last + "\" (guest). Volume: " + vol + "."; },
    poolAlt: function (c, k, d, w, p) { return c + " GiB thin pool: " + k + " VM disks declare " + d + " GiB in total, of which " + w + " GiB written (" + p + " % of the pool)."; },
  },
};
function strOf(lang) { return STR[lang] || STR.en; }

// Substitute {vmid} and {gb} in a template.
function sub(s, p) { return String(s).replace(/\{vmid\}/g, p.vmid).replace(/\{gb\}/g, p.disk_gb); }

// Build the resolved layer list for a backend + lang, with substitutions applied.
function layerList(p) {
  var d = DATA[p.backend];
  return d.layers.map(function (L) {
    var pair = L[p.lang] || L.en;
    return { title: sub(pair[0], p), detail: sub(pair[1], p), world: L.w, fam: L.fam };
  });
}
function firstGuestIndex(layers) {
  for (var i = 0; i < layers.length; i++) if (layers[i].world !== "hote") return i;
  return layers.length;
}
function boundaryLabel(layers, L) {
  var bi = firstGuestIndex(layers);
  return (bi < layers.length && layers[bi].world === "conteneur") ? L.boundaryCt : L.boundaryGuest;
}

// =============================================================================
// SCENE 1: storage-stack
// =============================================================================
var storageStack = {
  title: "Storage stack",
  wide: true,
  levels: [1, 2, 3],
  params: {
    backend: { type: "enum", values: ["dir", "lvmthin", "zfs", "zfs-ct"], default: "dir" },
    vmid:    { type: "int", min: 100, max: 999, default: 100 },
    disk_gb: { type: "int", min: 1, max: 2048, default: 32 },
    lang:    { type: "enum", values: ["fr", "en"], default: "en" },
  },

  alt: function (params) {
    var p = normStorage(storageStack, params), L = strOf(p.lang);
    var layers = layerList(p);
    return L.stackAlt(p.backend, layers.length, layers[0].title, layers[layers.length - 1].title, sub(DATA[p.backend].vol, p));
  },

  // A light, print-safe static cutaway: nested labelled bands, outermost at the
  // top, with a dashed host|guest membrane. Grayscale-safe (luminance-distinct
  // family strokes plus text). White background so the space wrapper can swap it.
  svg: function (params, theme, level) {
    var p = normStorage(storageStack, params);
    var L = strOf(p.lang), layers = layerList(p);
    var W = 480, rowH = 40, padTop = 46, n = layers.length;
    var boundary = firstGuestIndex(layers);
    var H = padTop + n * rowH + (boundary < n ? 22 : 0) + 16;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(storageStack.alt(p)) + '">';
    out += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    out += '<text x="20" y="26" font-family="system-ui,sans-serif" font-size="16" font-weight="bold" fill="#111">' + esc(L.svgStack + " · " + p.backend) + '</text>';
    var y = padTop, shift = 0;
    for (var i = 0; i < n; i++) {
      if (i === boundary) {
        var my = y + 2;
        out += '<line x1="18" y1="' + my + '" x2="' + (W - 18) + '" y2="' + my + '" stroke="#444" stroke-width="2" stroke-dasharray="7 4"/>';
        out += '<text x="' + (W / 2) + '" y="' + (my + 15) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="bold" fill="#333">' + esc(boundaryLabel(layers, L)) + '</text>';
        y += 22; shift += 1;
      }
      var ind = 22 + Math.min(i, 7) * 5, top = y + 2;
      var col = toHex(FAM[layers[i].fam]);
      out += '<rect x="' + ind + '" y="' + top + '" width="' + (W - ind * 2) + '" height="' + (rowH - 8) + '" rx="5" fill="#f4f7fb" stroke="' + col + '" stroke-width="2.4"/>';
      out += '<rect x="' + ind + '" y="' + top + '" width="7" height="' + (rowH - 8) + '" rx="3" fill="' + col + '"/>';
      out += '<text x="' + (ind + 15) + '" y="' + (top + 14) + '" font-family="system-ui,sans-serif" font-size="12.5" font-weight="bold" fill="#111">' + esc((i + 1) + ". " + layers[i].title) + '</text>';
      out += '<text x="' + (ind + 15) + '" y="' + (top + 27) + '" font-family="system-ui,sans-serif" font-size="10.5" fill="#444">' + esc(layers[i].detail) + '</text>';
      y += rowH;
    }
    out += '</svg>';
    return out;
  },

  mount: function (THREE, el, params, opts) {
    var doc = el.ownerDocument;
    var p = normStorage(storageStack, params);
    var level = normLevel(opts && opts.level);
    var L = strOf(p.lang);
    var reduced = !!(opts && opts.reducedMotion);
    var layers = layerList(p), n = layers.length;
    var boundary = firstGuestIndex(layers);
    var volLine = sub(DATA[p.backend].vol, p);

    var st = makeStage(THREE, el);
    var anim = makeAnim(st, reduced);
    var ov = makeOverlay(el, st.renderer.domElement);

    // ── geometry: real Russian dolls ─────────────────────────────────────────
    // Every layer is a glass box INSIDE the previous one (same floor, a little
    // further back), seen through its open front: back wall, floor and sides
    // are drawn from the inside (BackSide), the front is left open. The last
    // layer is the file itself: a small upright document tile.
    var W0 = 2.4, H0 = 1.45, D0 = 1.5, FLOOR = -H0 / 2;
    var nb = n - 1;                                  // index of the file tile
    var kk = nb > 1 ? 0.72 / (nb - 1) : 0.5;
    var root = new THREE.Group(); st.scene.add(root);
    var meshes = [];

    var grid = new THREE.GridHelper(9, 36, 0x1d2b4d, 0x111a31);
    grid.position.y = FLOOR - 0.004; st.scene.add(grid);

    for (var i = 0; i < n; i++) {
      var fam = layers[i].fam, col = FAM[fam], isFile = i === nb;
      var f, w, h, d, pos;
      if (!isFile) {
        f = 1 - i * kk; w = W0 * f; h = H0 * f; d = D0 * f;
        pos = new THREE.Vector3(0, FLOOR + h / 2 + i * 0.01, -(D0 - d) * 0.22);
      } else {
        var pf = 1 - (nb - 1) * kk;
        f = pf * 0.6; w = W0 * pf * 0.36; h = H0 * pf * 0.5; d = 0.035;
        pos = new THREE.Vector3(0, FLOOR + h / 2 + nb * 0.01 + 0.01, -(D0 - D0 * pf) * 0.22);
      }
      var g = new THREE.Group(); g.position.copy(pos); root.add(g);
      var geo = new THREE.BoxGeometry(w, h, d);
      var face, edges, glow = null, floorGlow = null;
      if (!isFile) {
        face = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.05, side: THREE.BackSide, depthWrite: false }));
        g.add(face);
        floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.97, d * 0.97), new THREE.MeshBasicMaterial({ map: radialTex(doc, THREE, col), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
        floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = -h / 2 + 0.003; g.add(floorGlow);
      } else {
        face = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, emissive: 0xffe2a0, emissiveIntensity: 0.55, roughness: 0.5, transparent: true, opacity: 0.95 }));
        g.add(face);
        glow = makeGlowSprite(doc, THREE, 0xffe6a8, w * 2.6); glow.material.opacity = 0.8; g.add(glow);
        // three text lines on the page
        for (var ln = 0; ln < 3; ln++) {
          var bar = new THREE.Mesh(new THREE.PlaneGeometry(w * (ln === 2 ? 0.45 : 0.7), h * 0.07), new THREE.MeshBasicMaterial({ color: 0x8a6a2a, transparent: true, opacity: 0.55 }));
          bar.position.set(-w * (ln === 2 ? 0.125 : 0), h * (0.22 - ln * 0.18), d / 2 + 0.002); g.add(bar);
        }
      }
      edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: isFile ? 0xffffff : col, transparent: true, opacity: 0.92 }));
      g.add(edges);
      // the label anchor: front-top-right corner (file: its top-right corner)
      var anchor = new THREE.Vector3(pos.x + w / 2, pos.y + h / 2, pos.z + d / 2);
      meshes.push({ group: g, face: face, edges: edges, glow: glow, floorGlow: floorGlow, pos: pos, w: w, h: h, d: d, f: f, fam: fam, isFile: isFile, anchor: anchor, op: 1, badge: null });
    }

    // dir: the storage directory holds more than our image (an ISO, a backup).
    if (p.backend === "dir" && meshes[3] && meshes[4]) {
      var m3 = meshes[3];
      [-1, 1].forEach(function (side, si) {
        var tw = m3.w * 0.16, th = m3.h * 0.2;
        var tile = new THREE.Mesh(new THREE.BoxGeometry(tw, th, 0.03), new THREE.MeshBasicMaterial({ color: 0x8fa3cc, transparent: true, opacity: 0.28, depthWrite: false }));
        tile.position.set(side * m3.w * 0.4, -m3.h / 2 + th / 2 + 0.02, -m3.d * 0.25);
        m3.group.add(tile);
        var te = new THREE.LineSegments(new THREE.EdgesGeometry(tile.geometry), new THREE.LineBasicMaterial({ color: 0xaab8dc, transparent: true, opacity: 0.6 }));
        te.position.copy(tile.position); m3.group.add(te);
        meshes[3]["sib" + si] = { tile: tile, te: te, name: si === 0 ? "template/iso/" : "dump/", pos: tile.position.clone().add(m3.pos).add(new THREE.Vector3(0, th / 2 + 0.02, 0)) };
      });
    }

    // host | guest (or container) membrane: a pulsing force-field shell around
    // the first guest/container layer.
    var membrane = null;
    if (boundary > 0 && boundary < n) {
      var bm = meshes[boundary];
      var mgeo = new THREE.BoxGeometry(bm.w * 1.04, bm.h * 1.04, bm.d * 1.04);
      membrane = new THREE.Group(); membrane.position.copy(bm.pos);
      var mface = new THREE.Mesh(mgeo, new THREE.MeshBasicMaterial({ color: 0x48d4b4, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      var medge = new THREE.LineSegments(new THREE.EdgesGeometry(mgeo), new THREE.LineDashedMaterial({ color: 0x8fffe0, dashSize: 0.05, gapSize: 0.035, transparent: true, opacity: 0.9 }));
      medge.computeLineDistances();
      membrane.add(mface); membrane.add(medge); st.scene.add(membrane);
      membrane.userData = { face: mface, edge: medge };
    }

    // floating dust in the lab light
    var dustN = 160, dpos = new Float32Array(dustN * 3), seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var di = 0; di < dustN; di++) { dpos[di * 3] = (rnd() - 0.5) * 5; dpos[di * 3 + 1] = FLOOR + rnd() * 2.6; dpos[di * 3 + 2] = (rnd() - 0.5) * 4; }
    var dgeo = new THREE.BufferGeometry(); dgeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    var dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0x9fdcff, size: 0.014, transparent: true, opacity: 0.45, depthWrite: false }));
    st.scene.add(dust);
    st.scene.fog = new THREE.Fog(0x070b18, 4, 11);

    // ── overlay labels (crisp HTML over the canvas) ──────────────────────────
    var wide = true;
    var lbls = [], sep = null, caption = null;
    for (var li = 0; li < n; li++) {
      var Lr = layers[li], fc = toHex(FAM[Lr.fam] === FAM.file ? 0xffe6a8 : FAM[Lr.fam]);
      var box = ov.div("display:flex;gap:7px;align-items:flex-start;transition:opacity .35s,background .35s;border-radius:6px;padding:2px 6px 2px 2px;");
      var chip = doc.createElement("span");
      chip.textContent = String(li + 1);
      chip.style.cssText = "flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700;color:#070b18;background:" + fc + ";";
      var txt = doc.createElement("span"); txt.style.cssText = "display:flex;flex-direction:column;min-width:0;";
      var t1 = doc.createElement("span"); t1.textContent = Lr.title; t1.style.cssText = "font-weight:650;color:#eef3ff;line-height:1.15;";
      var t2 = doc.createElement("span"); t2.textContent = Lr.detail; t2.style.cssText = "font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#9fb0cf;line-height:1.2;overflow-wrap:anywhere;";
      txt.appendChild(t1); txt.appendChild(t2); box.appendChild(chip); box.appendChild(txt);
      var line = ov.line(); line.setAttribute("stroke", fc); line.setAttribute("stroke-width", "1"); line.setAttribute("stroke-opacity", "0.75");
      var dot = ov.dot(); dot.setAttribute("fill", fc);
      lbls.push({ box: box, chip: chip, t1: t1, t2: t2, line: line, dot: dot, color: fc, op: 1, hidden: false, focus: false });
    }
    if (boundary > 0 && boundary < n) {
      sep = ov.div("border-top:1px dashed #6fe9c9;color:#8fffe0;font-weight:600;letter-spacing:.02em;padding-top:2px;");
      sep.textContent = boundaryLabel(layers, L);
    }
    var sibLbls = [];
    if (meshes[3] && meshes[3].sib0) {
      [meshes[3].sib0, meshes[3].sib1].forEach(function (s) {
        var d2 = ov.div("font-family:ui-monospace,Menlo,Consolas,monospace;color:#aab8dc;transform:translate(-50%,-100%);white-space:nowrap;");
        d2.textContent = s.name; sibLbls.push({ el: d2, s: s });
      });
    }

    function layoutOverlay() {
      var sz = ov.sync(), W = sz.w, H = sz.h;
      if (!W || !H) return;
      wide = true; var compact = W < 470;
      var sc0 = compact ? 0.78 : Math.max(0.8, Math.min(1.12, W / 680));
      var colX = W * (compact ? 0.55 : 0.6), colW = W * (compact ? 0.44 : 0.39);
      var top = H * 0.045, avail = H * 0.92;
      var showSep = sep && !sep.hiddenFlag;
      function setFonts(sc) {
        for (var i = 0; i < n; i++) {
          var lb = lbls[i];
          lb.chip.style.width = lb.chip.style.height = Math.round(17 * sc) + "px";
          lb.chip.style.fontSize = Math.round(10.5 * sc) + "px";
          lb.t1.style.fontSize = (12.2 * sc).toFixed(1) + "px"; lb.t2.style.fontSize = (10.3 * sc).toFixed(1) + "px";
        }
        if (sep) sep.style.fontSize = (10.5 * sc).toFixed(1) + "px";
      }
      var vis = [];
      for (var i = 0; i < n; i++) {
        var lb = lbls[i], hide = lb.hidden;
        lb.box.style.display = hide ? "none" : "flex";
        if (hide) { lb.line.setAttribute("points", ""); lb.dot.setAttribute("r", "0"); }
        else vis.push(i);
      }
      {
        for (var v = 0; v < vis.length; v++) {
          var L0 = lbls[vis[v]]; L0.box.style.width = colW + "px"; L0.t1.style.display = "block"; L0.t2.style.display = compact ? "none" : "block";
        }
        var sc = sc0, heights = [], total = 0, gap = 0;
        for (var pass = 0; pass < 3; pass++) {
          setFonts(sc);
          heights = vis.map(function (k) { return lbls[k].box.offsetHeight; });
          gap = 7 * sc;
          total = heights.reduce(function (x, y) { return x + y; }, 0) + gap * Math.max(0, vis.length - 1) + (showSep ? 18 * sc : 0);
          if (total <= avail || sc <= 0.62) break;
          sc = Math.max(0.62, sc * Math.max(0.8, avail / total));
        }
        var y = top + Math.max(0, (avail - total) / 2);
        for (var v2 = 0; v2 < vis.length; v2++) {
          var k = vis[v2], lb2 = lbls[k], m = meshes[k];
          if (showSep && k === boundary) {
            sep.style.display = "block"; sep.style.left = colX + "px"; sep.style.width = (colW - 8) + "px"; sep.style.top = (y - 2) + "px";
            y += 18 * sc;
          }
          var a = m.anchor.clone().project(st.cam);
          var ax = (a.x + 1) / 2 * W, ay = (1 - a.y) / 2 * H;
          lb2.box.style.left = colX + "px"; lb2.box.style.top = y + "px"; lb2.box.style.opacity = lb2.op;
          lb2.box.style.background = lb2.focus ? "rgba(255,255,255,0.07)" : "transparent";
          lb2.box.style.boxShadow = lb2.focus ? "inset 2px 0 0 " + lb2.color : "none";
          var ly = y + 10 * sc;
          if (a.z < 1) {
            lb2.line.setAttribute("points", (colX - 2) + "," + ly + " " + (colX - 16 * sc) + "," + ly + " " + ax + "," + ay);
            lb2.line.setAttribute("stroke-opacity", String(0.7 * lb2.op));
            lb2.dot.setAttribute("cx", ax); lb2.dot.setAttribute("cy", ay); lb2.dot.setAttribute("r", String(2.6 * sc)); lb2.dot.setAttribute("fill-opacity", String(lb2.op));
          } else { lb2.line.setAttribute("points", ""); lb2.dot.setAttribute("r", "0"); }
          y += heights[v2] + gap;
        }
        if (sep && !showSep) sep.style.display = "none";
      }
      for (var s2 = 0; s2 < sibLbls.length; s2++) {
        var sl = sibLbls[s2], q2 = sl.s.pos.clone().project(st.cam);
        var show = W >= 470 && !lbls[3].hidden && lbls[3].op > 0.5 && q2.z < 1;
        sl.el.style.display = show ? "block" : "none";
        sl.el.style.left = ((q2.x + 1) / 2 * W) + "px"; sl.el.style.top = ((1 - q2.y) / 2 * H) + "px";
        sl.el.style.fontSize = (9.5 * sc0).toFixed(1) + "px"; sl.el.style.opacity = String(Math.min(1, lbls[3].op));
      }
      if (caption) caption.style.fontSize = (12 * sc0).toFixed(1) + "px";
    }
    st.post = layoutOverlay;

    // ── camera: an eye that dives into the dolls ─────────────────────────────
    var dirV = new THREE.Vector3(0.62, 0.46, 1).normalize();
    var cam = { tx: 0, ty: 0, tz: 0, dist: 5 };
    function shiftFor(wd) { return wide ? wd * 0.5 : 0; }
    function frameOf(idx) {
      var m = meshes[idx], wd = m.isFile ? meshes[Math.max(0, idx - 1)].w * 0.75 : m.w;
      var hd = m.isFile ? meshes[Math.max(0, idx - 1)].h * 0.75 : m.h;
      var fit = Math.max(wd * (wide ? 1.0 : 0.62), hd * 1.25);
      return { tx: m.pos.x + shiftFor(wd), ty: m.pos.y + (m.isFile ? 0.05 : 0), tz: m.pos.z, dist: 1.25 + fit * 1.55 };
    }
    function applyCam() {
      var t = new THREE.Vector3(cam.tx, cam.ty, cam.tz);
      st.cam.position.copy(t).add(dirV.clone().multiplyScalar(cam.dist));
      st.cam.lookAt(t);
      st.scene.fog.near = cam.dist * 0.95; st.scene.fog.far = cam.dist * 2.8;
    }
    function goTo(fr, ms) {
      var s = { tx: cam.tx, ty: cam.ty, tz: cam.tz, dist: cam.dist };
      anim.add({ dur: ms || 750, ease: true, fn: function (pr) {
        cam.tx = lerp(s.tx, fr.tx, pr); cam.ty = lerp(s.ty, fr.ty, pr); cam.tz = lerp(s.tz, fr.tz, pr); cam.dist = lerp(s.dist, fr.dist, pr); applyCam();
      } });
    }
    function setCam(fr) { cam.tx = fr.tx; cam.ty = fr.ty; cam.tz = fr.tz; cam.dist = fr.dist; applyCam(); }
    setCam(frameOf(0));

    // ── looks ────────────────────────────────────────────────────────────────
    function look(idx, op, focus) {
      var m = meshes[idx];
      m.op = op;
      if (m.isFile) { m.face.material.opacity = 0.95 * op; if (m.glow) m.glow.material.opacity = 0.8 * op; m.edges.material.opacity = op; }
      else {
        m.face.material.opacity = (focus ? 0.11 : 0.05) * Math.min(1, op * 1.5);
        m.edges.material.opacity = focus ? 1 : 0.9 * op;
        if (m.floorGlow) m.floorGlow.material.opacity = (focus ? 0.85 : 0.45) * op;
      }
      lbls[idx].op = Math.max(op, 0); lbls[idx].focus = !!focus;
    }
    function showAll() { for (var i = 0; i < n; i++) { meshes[i].group.visible = true; lbls[i].hidden = false; look(i, 1, false); } }

    // idle: dust drift, membrane pulse, focused glow breathing
    if (!reduced) anim.idle(function (now) {
      dust.rotation.y = now * 0.00002;
      dust.position.y = Math.sin(now / 3000) * 0.03;
      if (membrane) {
        var o = 0.06 + 0.06 * (0.5 + 0.5 * Math.sin(now / 520));
        membrane.userData.face.material.opacity = membrane.visible ? o : 0;
        membrane.userData.edge.material.opacity = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(now / 520));
      }
      var fileM = meshes[nb]; if (fileM.glow && fileM.op > 0.5) fileM.glow.material.opacity = 0.65 + 0.2 * Math.sin(now / 700);
    });

    var ctrlDiv = null, eqLine = null, btns = [];

    // ── level 1: the whole stack, labelled ───────────────────────────────────
    if (level === 1) { showAll(); anim.start(); anim.render(); }

    // ── level 2: explorer ────────────────────────────────────────────────────
    if (level === 2) {
      showAll();
      var focus = 0, guest = false;
      ctrlDiv = makeCtrlDiv(el);
      var isCt = boundary < n && layers[boundary].world === "conteneur";
      var gvLabel = isCt ? L.ctView : L.guestView, gOnly = isCt ? L.ctOnly : L.guestOnly;
      var btnDive = makeButton(doc, L.dive), btnRise = makeButton(doc, L.rise), btnGuest = makeButton(doc, gvLabel);
      ctrlDiv.appendChild(btnDive); ctrlDiv.appendChild(btnRise); ctrlDiv.appendChild(btnGuest);
      eqLine = makeEqLine(ctrlDiv);
      btns = [btnDive, btnRise, btnGuest];
      caption = ov.div("left:12px;top:10px;padding:4px 10px;border-radius:999px;background:rgba(89,224,138,.16);border:1px solid rgba(143,255,224,.55);color:#d6ffe6;font-weight:600;display:none;");
      caption.textContent = gOnly;

      function refreshEq() { var m = layers[focus]; setEqLines(eqLine, (focus + 1) + "/" + n + " · " + m.title + " · " + m.detail, volLine); }
      function refreshBtns() { btnDive.disabled = focus >= n - 1; btnRise.disabled = focus <= 0; }
      function applyFocus() {
        for (var i = 0; i < n; i++) {
          meshes[i].group.visible = true; lbls[i].hidden = false;
          if (i < focus) look(i, 0.18, false); else look(i, 1, i === focus);
        }
        if (membrane) membrane.visible = true;
        if (sep) sep.hiddenFlag = false;
      }
      function enterGuest() {
        guest = true; btnGuest.textContent = L.hostView; caption.style.display = "block";
        for (var i = 0; i < n; i++) {
          if (layers[i].world === "hote") { look(i, 0.0, false); meshes[i].group.visible = false; lbls[i].hidden = true; }
          else { meshes[i].group.visible = true; lbls[i].hidden = false; look(i, 1, i === boundary); }
        }
        grid.visible = false; if (sep) sep.hiddenFlag = true; if (membrane) membrane.visible = false;
        goTo(frameOf(boundary));
        setEqLines(eqLine, gOnly + " · " + layers[boundary].title + " · " + layers[boundary].detail, null);
      }
      function exitGuest() {
        guest = false; btnGuest.textContent = gvLabel; caption.style.display = "none"; grid.visible = true;
        applyFocus(); goTo(frameOf(focus)); refreshEq();
      }
      btnDive.addEventListener("click", function () {
        if (focus >= n - 1) return; focus++;
        if (guest) { exitGuest(); } else { applyFocus(); goTo(frameOf(focus)); refreshEq(); }
        refreshBtns();
      });
      btnRise.addEventListener("click", function () {
        if (focus <= 0) return; focus--;
        if (guest) { exitGuest(); } else { applyFocus(); goTo(frameOf(focus)); refreshEq(); }
        refreshBtns();
      });
      btnGuest.addEventListener("click", function () { if (guest) exitGuest(); else enterGuest(); });
      applyFocus(); refreshEq(); refreshBtns();
      anim.start(); anim.render();
    }

    // ── level 3: configure, command by command ───────────────────────────────
    if (level === 3) {
      var steps = DATA[p.backend].steps, k = 0;
      function hideFrom(start) {
        for (var i = start; i < n; i++) { meshes[i].group.visible = false; meshes[i].group.scale.setScalar(0.01); lbls[i].hidden = true; }
      }
      showAll(); hideFrom(1);
      if (membrane) membrane.visible = false;
      if (sep) sep.hiddenFlag = true;
      ctrlDiv = makeCtrlDiv(el);
      var btnRun = makeButton(doc, L.runStep(1)), btnReset = makeButton(doc, L.restart);
      btnReset.style.display = "none";
      ctrlDiv.appendChild(btnRun); ctrlDiv.appendChild(btnReset);
      eqLine = makeEqLine(ctrlDiv);
      btns = [btnRun, btnReset];
      setEqLines(eqLine, L.ready, null);
      var busy = false;

      function growLayer(idx, onDone) {
        var m = meshes[idx];
        m.group.visible = true; lbls[idx].hidden = false;
        anim.add({ dur: 650, ease: true, fn: function (pr) {
          m.group.scale.setScalar(0.01 + 0.99 * pr);
          look(idx, pr, true);
          m.edges.material.opacity = 0.35 + 0.65 * Math.sin(pr * Math.PI * 0.5) + 0.3 * Math.sin(pr * Math.PI);
        }, done: function () { m.group.scale.setScalar(1); look(idx, 1, false); if (onDone) onDone(); } });
      }
      function runStep() {
        if (k >= steps.length || busy) return;
        busy = true;
        var s = steps[k];
        setEqLines(eqLine, PROMPT[s.w] + sub(s.cmd, p), null);
        if (s.badge) {
          var lb = lbls[s.badge.layer];
          if (!lb.badgeEl) {
            lb.badgeEl = doc.createElement("span");
            lb.badgeEl.textContent = "« " + s.badge.text + " »";
            lb.badgeEl.style.cssText = "display:inline-block;margin-left:6px;padding:0 6px;border-radius:999px;background:#38c8ff;color:#06101f;font-weight:700;font-family:system-ui,sans-serif;font-size:0.85em;";
            lb.t1.appendChild(lb.badgeEl);
          }
          look(s.badge.layer, 1, true);
        }
        var reveal = s.add.slice();
        var last = reveal.length ? reveal[reveal.length - 1] : (s.badge ? s.badge.layer : 0);
        if (membrane && reveal.indexOf(boundary) >= 0) { membrane.visible = true; if (sep) sep.hiddenFlag = false; }
        var tgt = frameOf(last), home = frameOf(0);
        goTo({ tx: lerp(home.tx, tgt.tx, 0.55), ty: lerp(home.ty, tgt.ty, 0.55), tz: lerp(home.tz, tgt.tz, 0.55), dist: lerp(home.dist, tgt.dist, 0.55) }, 900);
        (function growNext(j) {
          if (j >= reveal.length) { finish(); return; }
          growLayer(reveal[j], function () { growNext(j + 1); });
        })(0);
        function finish() {
          k++; busy = false;
          if (k >= steps.length) {
            btnRun.style.display = "none"; btnReset.style.display = "";
            setEqLines(eqLine, PROMPT[s.w] + sub(s.cmd, p), volLine);
            goTo(frameOf(0), 1100);
          } else btnRun.textContent = L.runStep(k + 1);
        }
      }
      function reset() {
        k = 0; busy = false;
        hideFrom(1);
        lbls.forEach(function (lb) { if (lb.badgeEl) { lb.badgeEl.parentNode.removeChild(lb.badgeEl); lb.badgeEl = null; } });
        if (membrane) membrane.visible = false; if (sep) sep.hiddenFlag = true;
        btnRun.style.display = ""; btnReset.style.display = "none"; btnRun.textContent = L.runStep(1);
        setEqLines(eqLine, L.ready, null);
        goTo(frameOf(0));
      }
      btnRun.addEventListener("click", runStep);
      btnReset.addEventListener("click", reset);
      anim.start(); anim.render();
    }

    el.setAttribute("aria-label", storageStack.alt(p));
    var baseResize = st.resize;
    return {
      setReducedMotion: function (b) { reduced = b; anim.setReduced(b); },
      resize: function () { baseResize(); applyCam(); anim.render(); },
      dispose: function () {
        anim.stop();
        btns.forEach(function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
        if (ctrlDiv && ctrlDiv.parentNode) ctrlDiv.parentNode.removeChild(ctrlDiv);
        ov.dispose();
        disposeObj(st.scene);
        st.renderer.dispose();
        if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
      },
    };
  },
};

// =============================================================================
// SCENE 2: thin-pool  (thin provisioning / over-allocation)
// =============================================================================
var thinPool = {
  title: "Thin pool",
  wide: true,
  levels: [1, 2, 3],
  params: {
    capacity_gb: { type: "int", min: 10, max: 10000, default: 100 },
    disks:       { type: "int-array", min: 1, max: 4096, maxLen: 6, default: [32, 32, 32, 32] },
    written:     { type: "int-array", min: 0, max: 4096, maxLen: 6, default: [3, 10, 20, 8] },
    discard:     { type: "bool", default: false },
    lang:        { type: "enum", values: ["fr", "en"], default: "en" },
  },

  // VM ids are 101, 102, … in order. written[i] is clamped to disks[i].
  _model: function (p) {
    var disks = p.disks, written = p.written || [];
    var ids = [], decl = [], wr = [];
    for (var i = 0; i < disks.length; i++) {
      ids.push(101 + i);
      decl.push(disks[i]);
      wr.push(Math.min(written[i] != null ? written[i] : 0, disks[i]));
    }
    return { ids: ids, decl: decl, wr: wr };
  },

  alt: function (params) {
    var p = normStorage(thinPool, params), L = strOf(p.lang), m = thinPool._model(p);
    var declared = m.decl.reduce(function (a, b) { return a + b; }, 0);
    var written = m.wr.reduce(function (a, b) { return a + b; }, 0);
    var pct = Math.round(written / p.capacity_gb * 100);
    return L.poolAlt(p.capacity_gb, m.ids.length, declared, written, pct);
  },

  // Static print-safe cutaway: the tank with its liquid level, a dashed red
  // over-allocation line when declared > capacity, and one bar per VM disk.
  svg: function (params) {
    var p = normStorage(thinPool, params), L = strOf(p.lang), m = thinPool._model(p);
    var declared = m.decl.reduce(function (a, b) { return a + b; }, 0);
    var written = m.wr.reduce(function (a, b) { return a + b; }, 0);
    var cap = p.capacity_gb, pct = Math.round(written / cap * 100);
    var W = 480, H = 340, tankX = 30, tankTop = 110, tankW = 150, tankH = 190;
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(thinPool.alt(p)) + '">';
    out += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    out += '<text x="20" y="26" font-family="system-ui,sans-serif" font-size="16" font-weight="bold" fill="#111">' + esc(L.svgPool) + '</text>';
    // over-allocation outline above the rim
    if (declared > cap) {
      var oh = Math.min(tankH * 0.6, (declared - cap) / cap * tankH);
      out += '<rect x="' + tankX + '" y="' + (tankTop - oh) + '" width="' + tankW + '" height="' + oh + '" fill="none" stroke="#d23b3b" stroke-width="2" stroke-dasharray="6 4"/>';
      out += '<text x="' + (tankX + tankW / 2) + '" y="' + (tankTop - oh - 6) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="bold" fill="#c22">' + esc(L.over(declared - cap)) + '</text>';
    }
    // tank + liquid
    var full = written >= cap;
    var lh = Math.min(tankH, written / cap * tankH);
    out += '<rect x="' + tankX + '" y="' + (tankTop + tankH - lh) + '" width="' + tankW + '" height="' + lh + '" fill="' + (full ? '#e9b7b7' : '#bfeee7') + '"/>';
    out += '<rect x="' + tankX + '" y="' + tankTop + '" width="' + tankW + '" height="' + tankH + '" fill="none" stroke="' + (full ? '#c22' : '#2f8f84') + '" stroke-width="2.6" rx="4"/>';
    out += '<text x="' + (tankX + tankW / 2) + '" y="' + (tankTop + tankH + 16) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="#333">' + esc("Pool " + cap + " " + L.unit + " (" + pct + " %)") + '</text>';
    // VM disks as bars
    var bx = tankX + tankW + 40, bw = 44, gap = 16;
    var maxDecl = Math.max.apply(null, m.decl.concat([1]));
    for (var i = 0; i < m.ids.length; i++) {
      var x = bx + i * (bw + gap);
      if (x + bw > W - 10) break;
      var bh = Math.max(14, m.decl[i] / maxDecl * tankH);
      var fh = m.wr[i] / m.decl[i] * bh;
      var by = tankTop + tankH - bh;
      out += '<rect x="' + x + '" y="' + (by + bh - fh) + '" width="' + bw + '" height="' + fh + '" fill="#bfe2ff"/>';
      out += '<rect x="' + x + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="none" stroke="#2f6fb0" stroke-width="2" rx="3"/>';
      out += '<text x="' + (x + bw / 2) + '" y="' + (by + bh + 14) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#333">' + esc("VM " + m.ids[i]) + '</text>';
      out += '<text x="' + (x + bw / 2) + '" y="' + (by + bh + 25) + '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9.5" fill="#333">' + esc(m.wr[i] + "/" + m.decl[i]) + '</text>';
    }
    out += '</svg>';
    return out;
  },

  mount: function (THREE, el, params, opts) {
    var doc = el.ownerDocument;
    var p = normStorage(thinPool, params);
    var level = normLevel(opts && opts.level);
    var L = strOf(p.lang);
    var reduced = !!(opts && opts.reducedMotion);
    var m = thinPool._model(p), cap = p.capacity_gb, VN = m.ids.length;

    // State. alloc[i] = blocks the pool holds for VM i; used[i] = what the guest
    // still sees (<= alloc). alloc - used = freed in the guest, still allocated.
    var used = m.wr.slice(), alloc = m.wr.slice();
    function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
    function allocTotal() { return sum(alloc); }
    function usedTotal() { return sum(used); }
    var declaredTotal = sum(m.decl);
    var poolFull = allocTotal() >= cap;

    var st = makeStage(THREE, el);
    var anim = makeAnim(st, reduced);
    var ov = makeOverlay(el, st.renderer.domElement);
    st.scene.fog = new THREE.Fog(0x070b18, 6, 14);
    var VMCOL = [0x38c8ff, 0x8b6cff, 0x59e08a, 0xd9893b, 0xff7ec8, 0x2fc7b5];
    var RED = 0xff5a6a;

    // ── world layout: the pool tank on the left, the VM disks on a shelf ─────
    var tankW = 1.5, tankH = 1.6, tankD = 0.95, FLOOR = -0.8;
    var u = tankH / cap;                              // world height per GiB
    var tankX = -0.95;
    var grid = new THREE.GridHelper(10, 40, 0x1d2b4d, 0x111a31); grid.position.y = FLOOR - 0.004; st.scene.add(grid);

    var tank = new THREE.Group(); tank.position.set(tankX, FLOOR + tankH / 2, 0); st.scene.add(tank);
    var tgeo = new THREE.BoxGeometry(tankW, tankH, tankD);
    var tankFace = new THREE.Mesh(tgeo, new THREE.MeshBasicMaterial({ color: FAM.teal, transparent: true, opacity: 0.06, side: THREE.BackSide, depthWrite: false }));
    var tankEdges = new THREE.LineSegments(new THREE.EdgesGeometry(tgeo), new THREE.LineBasicMaterial({ color: FAM.teal, transparent: true, opacity: 0.95 }));
    tank.add(tankFace); tank.add(tankEdges);
    // capacity ticks every 25 %
    for (var tk = 1; tk < 4; tk++) {
      var tick = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-tankW / 2, -tankH / 2 + tankH * tk / 4, tankD / 2), new THREE.Vector3(-tankW / 2 + 0.12, -tankH / 2 + tankH * tk / 4, tankD / 2)]), new THREE.LineBasicMaterial({ color: 0x5f7fb0, transparent: true, opacity: 0.7 }));
      tank.add(tick);
    }
    var liquid = new THREE.Group(); tank.add(liquid);
    var surfaceGlow = new THREE.Mesh(new THREE.PlaneGeometry(tankW * 0.97, tankD * 0.97), new THREE.MeshBasicMaterial({ map: radialTex(doc, THREE, 0xbff6ff), transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    surfaceGlow.rotation.x = -Math.PI / 2; tank.add(surfaceGlow);

    // over-allocation: a dashed red ghost box rising above the rim
    var over = null;
    if (declaredTotal > cap) {
      var oh = (declaredTotal - cap) * u;
      var ogeo = new THREE.BoxGeometry(tankW, oh, tankD);
      over = new THREE.LineSegments(new THREE.EdgesGeometry(ogeo), new THREE.LineDashedMaterial({ color: RED, dashSize: 0.06, gapSize: 0.045, transparent: true, opacity: 0.95 }));
      over.computeLineDistances();
      over.position.set(tankX, FLOOR + tankH + oh / 2, 0); st.scene.add(over);
      var oface = new THREE.Mesh(ogeo, new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false }));
      oface.position.copy(over.position); st.scene.add(oface);
    }

    // the VM disks: glass cylinders, same GiB scale as the tank
    var shelfX0 = 0.2, spacing = Math.min(0.5, 2.1 / Math.max(1, VN)), cylR = Math.min(0.19, spacing * 0.38);
    var vms = [];
    for (var i = 0; i < VN; i++) {
      var cx = shelfX0 + i * spacing + spacing / 2, declH = Math.max(0.06, m.decl[i] * u);
      var cg = new THREE.Group(); cg.position.set(cx, FLOOR, 0.1); st.scene.add(cg);
      var sgeo = new THREE.CylinderGeometry(cylR, cylR, declH, 28, 1, true);
      var shell = new THREE.Mesh(sgeo, new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }));
      shell.position.y = declH / 2; cg.add(shell);
      [0, declH].forEach(function (yy) {
        var ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePts(THREE, cylR, 40)), new THREE.LineBasicMaterial({ color: VMCOL[i % VMCOL.length], transparent: true, opacity: 0.9 }));
        ring.position.y = yy; cg.add(ring);
      });
      var fill = new THREE.Group(); cg.add(fill);
      vms.push({ grp: cg, fill: fill, declH: declH, cx: cx, col: VMCOL[i % VMCOL.length], ring: null });
    }

    // ── viz update (rebuild liquid bands + cylinder fills) ───────────────────
    function clear(g) { while (g.children.length) { var c = g.children[0]; g.remove(c); disposeObj(c); } }
    var hatch = stripeTex(doc, THREE);
    function band(parent, wdt, dpt, h, y, col, ghost, isCyl) {
      if (h <= 0.0005) return;
      var geo = isCyl ? new THREE.CylinderGeometry(wdt, wdt, h, 28) : new THREE.BoxGeometry(wdt, h, dpt);
      var mat = ghost
        ? new THREE.MeshBasicMaterial({ color: col, map: hatch, transparent: true, opacity: 0.55, depthWrite: false })
        : new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.4, transparent: true, opacity: 0.62, depthWrite: false });
      var mesh = new THREE.Mesh(geo, mat); mesh.position.y = y + h / 2; parent.add(mesh);
      var e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: ghost ? 0.4 : 0.7 }));
      e.position.copy(mesh.position); parent.add(e);
    }
    function updateViz() {
      poolFull = allocTotal() >= cap;
      clear(liquid);
      var y = -tankH / 2;
      for (var i = 0; i < VN; i++) {
        var hu = Math.min(used[i] * u, tankH / 2 - y), hg = Math.min((alloc[i] - used[i]) * u, tankH / 2 - y - hu);
        band(liquid, tankW * 0.965, tankD * 0.965, hu, y, poolFull ? RED : vms[i].col, false, false); y += Math.max(0, hu);
        band(liquid, tankW * 0.965, tankD * 0.965, hg, y, vms[i].col, true, false); y += Math.max(0, hg);
      }
      surfaceGlow.position.y = y + 0.004;
      surfaceGlow.material.color.setHex(poolFull ? RED : 0xffffff);
      tankEdges.material.color.setHex(poolFull ? RED : FAM.teal);
      for (var j = 0; j < VN; j++) {
        var v = vms[j]; clear(v.fill);
        band(v.fill, cylR * 0.9, 0, used[j] * u, 0, v.col, false, true);
        band(v.fill, cylR * 0.9, 0, (alloc[j] - used[j]) * u, used[j] * u, v.col, true, true);
      }
      anim.render();
    }

    // ── overlay labels ────────────────────────────────────────────────────────
    var tankLbl = ov.div("transform:translate(-50%,0);text-align:center;white-space:nowrap;");
    var overLbl = over ? ov.div("transform:translate(-50%,-100%);padding:2px 9px;border-radius:999px;background:rgba(255,90,106,.16);border:1px solid #ff8a96;color:#ffd5da;font-weight:700;white-space:nowrap;") : null;
    if (overLbl) overLbl.textContent = L.over(declaredTotal - cap);
    var vmLbls = vms.map(function (v, i) {
      var d = ov.div("transform:translate(-50%,0);text-align:center;white-space:nowrap;");
      var a = doc.createElement("div"); a.style.cssText = "font-weight:700;color:" + toHex(v.col) + ";"; a.textContent = "VM " + m.ids[i];
      var b = doc.createElement("div"); b.style.cssText = "font-family:ui-monospace,Menlo,Consolas,monospace;color:#c9d6f0;";
      d.appendChild(a); d.appendChild(b);
      var bad = ov.div("transform:translate(-50%,-100%);display:none;padding:0 5px;border-radius:999px;background:#ff5a6a;color:#1a0306;font-weight:800;white-space:nowrap;");
      bad.textContent = L.ioErr;
      return { el: d, val: b, bad: bad, name: a, id: m.ids[i] };
    });
    function layoutOverlay() {
      var sz = ov.sync(), W = sz.w, H = sz.h; if (!W || !H) return;
      var sc = Math.max(0.72, Math.min(1.15, W / 680));
      function P(x, y, z) { var q = new THREE.Vector3(x, y, z).project(st.cam); return { x: (q.x + 1) / 2 * W, y: (1 - q.y) / 2 * H }; }
      var tb = P(tankX, FLOOR, tankD / 2);
      tankLbl.style.left = tb.x + "px"; tankLbl.style.top = (tb.y + 6 * sc) + "px";
      tankLbl.style.fontSize = (11.5 * sc).toFixed(1) + "px";
      tankLbl.innerHTML = '<div style="font-weight:700;color:' + (poolFull ? "#ff8a96" : "#7fe7da") + '">' + esc(L.poolName(cap)) + '</div><div style="font-family:ui-monospace,Menlo,Consolas,monospace;color:#c9d6f0">' + esc(L.poolUse(allocTotal(), Math.round(allocTotal() / cap * 100))) + '</div>';
      if (overLbl) { var ot = P(tankX, FLOOR + tankH + (declaredTotal - cap) * u, 0); overLbl.style.left = ot.x + "px"; overLbl.style.top = (ot.y - 6 * sc) + "px"; overLbl.style.fontSize = (11 * sc).toFixed(1) + "px"; }
      var rowY = 0;
      for (var i0 = 0; i0 < VN; i0++) rowY = Math.max(rowY, P(vms[i0].cx, FLOOR, 0.1 + cylR).y);
      for (var i = 0; i < VN; i++) {
        var v = vms[i], q = P(v.cx, FLOOR, 0.1 + cylR), qt = P(v.cx, FLOOR + v.declH, 0.1), lb = vmLbls[i];
        lb.el.style.left = q.x + "px"; lb.el.style.top = (rowY + 6 * sc) + "px"; lb.el.style.fontSize = (W < 470 ? 9 : 10.5 * sc).toFixed(1) + "px";
        lb.val.textContent = used[i] + "/" + m.decl[i] + " " + L.unit; lb.val.style.display = W < 470 ? "none" : "block"; lb.name.textContent = W < 470 ? String(lb.id) : "VM " + lb.id;
        lb.bad.style.display = poolFull && W >= 470 ? "block" : "none";
        lb.bad.style.left = qt.x + "px"; lb.bad.style.top = (qt.y - 6 * sc) + "px"; lb.bad.style.fontSize = (8.6 * sc).toFixed(1) + "px";
      }
    }
    st.post = layoutOverlay;

    // ── camera ────────────────────────────────────────────────────────────────
    var target = new THREE.Vector3(-0.1, FLOOR + 0.95, 0);
    var dist = 4.4;
    function placeCam() {
      var narrow = (st.renderer.domElement.clientWidth || el.clientWidth || 680) < 470;
      var dd = narrow ? dist * 1.25 : dist;
      st.cam.position.copy(target).add(new THREE.Vector3(0.28, 0.42, 1).normalize().multiplyScalar(dd));
      st.cam.lookAt(target);
    }
    placeCam();

    if (!reduced) anim.idle(function (now) {
      surfaceGlow.material.opacity = 0.55 + 0.2 * Math.sin(now / 600);
      if (poolFull) { tankEdges.material.opacity = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now / 180)); }
      else tankEdges.material.opacity = 0.95;
    });

    // a stream of glowing drops from the VM disk into the pool on each write
    function stream(i) {
      if (reduced) return;
      var v = vms[i];
      var from = new THREE.Vector3(v.cx, FLOOR + used[i] * u + 0.05, 0.1);
      var to = new THREE.Vector3(tankX + tankW * 0.25, FLOOR + allocTotal() * u, 0);
      var mid = from.clone().lerp(to, 0.5); mid.y = Math.max(from.y, to.y) + 0.55;
      for (var q = 0; q < 9; q++) {
        (function (delay) {
          var dot = makeGlowSprite(doc, THREE, v.col, 0.12); st.scene.add(dot);
          anim.add({ dur: 900, ease: false, fn: function (pr) {
            var t = Math.max(0, Math.min(1, (pr - delay) / (1 - delay)));
            var a = from.clone().lerp(mid, t), b = mid.clone().lerp(to, t);
            dot.position.copy(a.lerp(b, t));
            dot.material.opacity = t > 0 && t < 1 ? 1 : 0;
          }, done: function () { st.scene.remove(dot); disposeObj(dot); } });
        })(q * 0.06);
      }
    }

    // ── mechanics ─────────────────────────────────────────────────────────────
    var ctrlDiv = null, eqLine = null, btns = [];
    function pct() { return Math.round(allocTotal() / cap * 100); }
    function defaultEq() { return poolFull ? L.poolFull : L.eqPool(declaredTotal, allocTotal(), cap, pct()); }
    function setEq(msg) { if (eqLine) setEqLines(eqLine, msg != null ? msg : defaultEq(), null); }
    function write(i, amt) {
      var guestRoom = m.decl[i] - used[i];
      if (guestRoom <= 0) { setEq(L.vmFull(m.ids[i])); return; }
      amt = Math.min(amt, guestRoom);
      var fromGhost = Math.min(amt, alloc[i] - used[i]);
      used[i] += fromGhost; amt -= fromGhost;
      var newAlloc = Math.min(amt, Math.max(0, cap - allocTotal()));
      used[i] += newAlloc; alloc[i] += newAlloc; amt -= newAlloc;
      stream(i); updateViz();
      setEq(amt > 0 || allocTotal() >= cap ? L.poolFull : null);
    }
    function erase(i, amt) { var d = Math.min(amt, used[i]); used[i] -= d; updateViz(); setEq(d > 0 ? L.erased(m.ids[i], d) : null); }
    function fstrim(i) {
      var ghost = alloc[i] - used[i];
      if (!p.discard) { setEq(L.noTrim); return; }
      alloc[i] = used[i]; updateViz(); setEq(L.trimmed(ghost));
    }
    function reset() { used = m.wr.slice(); alloc = m.wr.slice(); updateViz(); setEq(null); }

    if (level >= 2) {
      ctrlDiv = makeCtrlDiv(el);
      for (var bi = 0; bi < VN; bi++) (function (idx) {
        var b = makeButton(doc, L.write(m.ids[idx])); b.addEventListener("click", function () { write(idx, 10); });
        ctrlDiv.appendChild(b); btns.push(b);
      })(bi);
      if (level === 3) {
        var bErase = makeButton(doc, L.erase); bErase.addEventListener("click", function () { erase(0, 10); });
        var bTrim = makeButton(doc, L.fstrim); bTrim.addEventListener("click", function () { fstrim(0); });
        ctrlDiv.appendChild(bErase); ctrlDiv.appendChild(bTrim); btns.push(bErase, bTrim);
      }
      var bReset = makeButton(doc, L.reset); bReset.addEventListener("click", reset);
      ctrlDiv.appendChild(bReset); btns.push(bReset);
      eqLine = makeEqLine(ctrlDiv);
    }
    updateViz(); setEq(null);
    anim.start(); anim.render();
    el.setAttribute("aria-label", thinPool.alt(p));
    var baseResize = st.resize;
    return {
      setReducedMotion: function (b) { reduced = b; anim.setReduced(b); },
      resize: function () { baseResize(); placeCam(); anim.render(); },
      dispose: function () {
        anim.stop();
        btns.forEach(function (b) { if (b.parentNode) b.parentNode.removeChild(b); });
        if (ctrlDiv && ctrlDiv.parentNode) ctrlDiv.parentNode.removeChild(ctrlDiv);
        ov.dispose();
        disposeObj(st.scene);
        st.renderer.dispose();
        if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
      },
    };
  },
};

export { storageStack, thinPool };
