/* ============================================================================
   Cultural Showcase Kit — the engine.  "One dish, its story", in 3D.

   This file is dish-agnostic. It builds the page chrome, the three.js scene
   frame (lighting rig, camera tweening, HTML label projection), the language
   toggle, the panel renderer with its generic lesson widgets (origin match,
   the order game, the heat slider, the vocabulary list), the recipe card, the
   About block, the 2D fallback, and the review-marker mode.

   A dish is a plain content object (see dish.js and SHOWCASE-KIT.md). Nothing
   in here knows about chicken, chillies, chattis or Tamil — it knows "a dish
   has three stations, each teaches one movement, each may build 3D props".

   Boot:  a dish module calls  CulturalShowcase.mount(DISH)  once the DOM and
   three.js are ready.  three.js (r128) is optional — without WebGL the scene
   is hidden and every lesson still runs from the panel.
   ============================================================================ */
(function (global) {
  "use strict";

  /* ---- session state: language + review mode ------------------------------ */
  var REVIEW = (function () {
    try {
      var q = global.location.search || "", h = global.location.hash || "";
      return /[?&]review=1\b/.test(q) || /(^|#)review\b/.test(h);
    } catch (e) { return false; }
  })();

  var DISH = null, COMM = "ta";           // COMM = the community-language key, set from the dish
  var LANG = "en";
  function loadLang() {
    try { LANG = sessionStorage.getItem("cs-lang") || "en"; } catch (e) { LANG = "en"; }
    if (LANG !== COMM) LANG = "en";
  }
  function saveLang() { try { sessionStorage.setItem("cs-lang", LANG); } catch (e) {} }

  /* pick a language form from a {en, <comm>, tr, scr} object (or a bare string) */
  function t(o) {
    if (o == null) return "";
    if (typeof o === "string") return o;
    if (LANG === COMM && o[COMM]) return o[COMM];
    return o.en != null ? o.en : (o[COMM] || "");
  }
  function hasComm(o) { return o && typeof o === "object" && !!o[COMM]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function reader() { return '<span class="reader">[READER]</span>'; }   /* CSS hides it unless .review */

  /* ---- DOM build: the page chrome, from the dish content ------------------ */
  var el = {};
  function h(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "class") n.className = attrs[k]; else if (k === "html") n.innerHTML = attrs[k]; else n.setAttribute(k, attrs[k]); }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function linkRow(items) {
    return items.filter(Boolean).map(function (x) { return '<a href="' + esc(x[1]) + '">' + esc(x[0]) + "</a>"; });
  }

  function buildChrome(root) {
    var ui = DISH.ui, L = DISH.links || {};
    root.className = "wrap";
    root.innerHTML = "";

    /* header */
    var head = h("header", { class: "top" });
    head.appendChild(h("div", { class: "kicker" }, esc(t(ui.kicker))));
    head.appendChild(h("h1", { "data-i": "title" }, esc(t(ui.title))));
    head.appendChild(h("p", { class: "sub", "data-i": "sub" }, esc(t(ui.sub))));
    var fl = h("p", { class: "facelines" });
    fl.innerHTML = "<b data-i='face1'>" + esc(t(ui.face1)) + "</b> <span data-i='face2'>" + esc(t(ui.face2)) +
      "</span><br><span data-i='face3'>" + esc(t(ui.face3)) + "</span>";
    head.appendChild(fl);

    var bar = h("div", { class: "toolbar" });
    var tog = h("span", { class: "toggle", id: "langtoggle", role: "group", "aria-label": "Language" });
    el.langEn = h("button", { id: "lang-en", "aria-pressed": "true" }, esc(ui.langEnLabel || "English"));
    el.langComm = h("button", { id: "lang-comm", class: DISH.lang.commClass || "", "aria-pressed": "false" }, esc(ui.langCommLabel || DISH.lang.commLabel || "—"));
    tog.appendChild(el.langEn); tog.appendChild(el.langComm); bar.appendChild(tog);
    if (L.player) bar.appendChild(h("a", { class: "btn primary", href: L.player, "data-i": "openpkg" }, esc(t(ui.openpkg))));
    bar.appendChild(h("a", { class: "btn", href: "#adult", "data-i": "openadult" }, esc(t(ui.openadult))));
    bar.appendChild(h("a", { class: "btn", href: "#card", "data-i": "opencard" }, esc(t(ui.opencard))));
    bar.appendChild(h("a", { class: "btn", href: "#about", "data-i": "openabout" }, esc(t(ui.openabout))));
    head.appendChild(bar);
    root.appendChild(head);

    /* station nav */
    el.nav = h("nav", { class: "stations", "aria-label": "Stations" });
    DISH.stations.forEach(function (st, i) {
      var b = h("button", { "data-st": i });
      if (i === 0) b.setAttribute("aria-current", "true");
      b.innerHTML = '<span class="n">' + (i + 1) + '</span><span data-i="st' + i + '">' + esc(t(st.nav)) + "</span>";
      b.onclick = function () { gotoStation(i); };
      el.nav.appendChild(b);
    });
    root.appendChild(el.nav);

    /* stage + panel */
    var layout = h("div", { class: "layout" });
    el.stage = h("div", { class: "stage", id: "stage" });
    el.canvas = h("canvas", { id: "cv", "aria-label": "3D scene" });
    el.labels = h("div", { class: "labels", id: "labels", "aria-hidden": "true" });
    el.nogl = h("div", { class: "nogl hide", id: "nogl" }, '<div style="max-width:32ch" data-i="nogl">' + esc(t(ui.nogl)) + "</div>");
    el.cap = h("div", { class: "stage-cap", id: "cap" }, esc(t(DISH.stations[0].cap)));
    el.progress = h("div", { class: "stage-progress hide", id: "stage-progress" });
    el.stage.appendChild(el.canvas); el.stage.appendChild(el.labels); el.stage.appendChild(el.nogl); el.stage.appendChild(el.cap); el.stage.appendChild(el.progress);
    el.panel = h("div", { class: "panel", id: "panel" });
    layout.appendChild(el.stage); layout.appendChild(el.panel);
    root.appendChild(layout);

    /* "What this shows" — the behind-the-scenes section, directly under the stations.
       Filled and wired by paintShows() (also re-run on language toggle). */
    if (ui.shows) root.appendChild(h("div", { class: "card", id: "shows" }));

    /* adult page */
    if (ui.adult) {
      var a = ui.adult, ad = h("div", { class: "card", id: "adult" });
      ad.innerHTML = '<div class="kicker" style="color:var(--accent)">' + esc(t(a.kicker)) + "</div>" +
        '<h2 data-i="a_h">' + esc(t(a.h)) + "</h2><p>" + esc(t(a.intro)) + "</p>" +
        "<h3>" + esc(t(a.c1)) + " " + reader() + "</h3><ul>" +
        a.facts.map(function (f) { return "<li><b>" + esc(t(f.lead)) + "</b> " + esc(t(f.body)) + "</li>"; }).join("") +
        "</ul><h3>" + esc(t(a.c2)) + "</h3><p>" + esc(t(a.seq)) + "</p>";
      root.appendChild(ad);
    }

    /* recipe card */
    var rc = h("div", { class: "card", id: "card" }), r = ui.recipe || {};
    rc.innerHTML = '<div class="kicker" style="color:var(--accent)">' + esc(t(r.kicker)) + "</div>" +
      '<h2 data-i="r_h">' + esc(t(r.h)) + "</h2><p>" + esc(t(r.intro)) + "</p>" +
      '<pre class="recipe" id="recipe"></pre>' +
      (r.slot ? '<p style="font-size:.82rem;color:var(--muted)">' + t(r.slot) + "</p>" : "");
    root.appendChild(rc);

    /* about */
    if (ui.about) { var ab = h("div", { class: "card", id: "about" }); ab.innerHTML = renderAbout(ui.about); root.appendChild(ab); }

    /* footer */
    if (ui.footer) { var f = ui.footer, ft = h("p", { class: "foot" }); ft.innerHTML = renderFooter(f); root.appendChild(ft); }
  }

  function renderAbout(a) {
    var s = '<div class="kicker" style="color:var(--accent)">About</div><h2 data-i="ab_h">' + esc(t(a.h)) + "</h2>";
    (a.paras || []).forEach(function (p) { s += "<p>" + t(p) + "</p>"; });
    if (a.help) {
      s += "<h3 data-i='ab_help'>" + esc(t(a.help.h)) + "</h3><ul>";
      (a.help.items || []).forEach(function (it) { s += "<li>" + t(it) + "</li>"; });
      s += "</ul>";
    }
    return s;
  }
  function renderFooter(f) {
    var s = "<b data-i='f1'>" + esc(t(f.way)) + "</b> <span data-i='f2'>" + esc(t(f.safety)) + "</span><br>";
    s += "<span data-i='f3'>" + esc(t(f.reader)) + "</span> <span data-i='f4'>" + esc(t(f.sponsor)) + "</span> " + (f.open ? t(f.open) : "") + "<br>";
    s += "<em data-i='f5'>" + esc(t(f.byline)) + "</em>";
    return s;
  }

  /* ---- "What this shows" — a generic, dish-fed behind-the-scenes section ---------
     The dish supplies ui.shows = { kicker?, h, intro?, concepts[], brief?, scenario? }.
     Each concept is { h, body, links:[ {label, href} | {label, station:n} ] }; a
     station link jumps the stage to that station, an href link is a plain anchor/URL.
     The brief is { h, lines[], copy, copied?, after? } with a copy-to-clipboard button;
     the scenario is { h, body, extra? }. Headings carry [READER] in review mode; the
     bodies stay as written (English prose is not re-authored into the community language). */
  function showsLink(l) {
    if (l.station != null) return '<button type="button" class="shows-jump" data-st="' + esc(l.station) + '">' + esc(t(l.label)) + " →</button>";
    return '<a class="shows-ptr" href="' + esc(l.href) + '">' + esc(t(l.label)) + " →</a>";
  }
  function renderShows(sh) {
    var mk = REVIEW ? " " + reader() : "";
    var s = '<div class="kicker" style="color:var(--accent)">' + esc(t(sh.kicker || { en: "Behind the scenes" })) + (REVIEW ? " · [READER]" : "") + "</div>";
    s += "<h2>" + esc(t(sh.h)) + mk + "</h2>";
    if (sh.intro) s += "<p>" + t(sh.intro) + "</p>";
    s += '<ol class="shows">';
    (sh.concepts || []).forEach(function (c) {
      s += "<li><b>" + esc(t(c.h)) + mk + "</b> " + t(c.body);
      if (c.links && c.links.length) s += '<div class="shows-ptrs">' + c.links.map(showsLink).join("") + "</div>";
      s += "</li>";
    });
    s += "</ol>";
    if (sh.brief) {
      var b = sh.brief;
      s += '<div class="brief" id="brief"><div class="brief-h">' + esc(t(b.h)) + mk + "</div>";
      s += "<blockquote>" + (b.lines || []).map(esc).join("<br>") + "</blockquote>";
      s += '<button type="button" class="btn shows-copy" id="brief-copy">' + esc(t(b.copy || { en: "Copy" })) + "</button>";
      if (b.after) s += '<p class="brief-after">' + esc(t(b.after)) + "</p>";
      s += "</div>";
    }
    if (sh.scenario) {
      var sc = sh.scenario;
      s += '<div class="scenario" id="scenario"><h3>' + esc(t(sc.h)) + mk + "</h3><p>" + t(sc.body) + "</p>";
      if (sc.extra) s += '<p class="scenario-extra">' + t(sc.extra) + "</p>";
      s += "</div>";
    }
    return s;
  }
  /* fill the #shows card and wire its station-jumps and the copy-the-brief button */
  function paintShows() {
    var card = document.getElementById("shows"), sh = DISH.ui.shows;
    if (!card || !sh) return;
    card.innerHTML = renderShows(sh);
    [].forEach.call(card.querySelectorAll(".shows-jump"), function (btn) {
      btn.onclick = function () {
        gotoStation(+btn.getAttribute("data-st"));
        var stage = document.getElementById("stage");
        if (stage && stage.scrollIntoView) stage.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      };
    });
    var cp = document.getElementById("brief-copy"), b = sh.brief;
    if (cp && b && b.lines) {
      cp.onclick = function () {
        var txt = b.lines.join("\n");
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt);
          else { var ta = h("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
          var was = t(b.copy || { en: "Copy" });
          cp.textContent = t(b.copied || { en: "Copied" });
          setTimeout(function () { cp.textContent = was; }, 1800);
        } catch (e) {}
      };
    }
  }

  /* ---- language toggle ---------------------------------------------------- */
  function applyLang() {
    document.documentElement.lang = LANG === COMM ? COMM : "en";
    el.langEn.setAttribute("aria-pressed", LANG === "en");
    el.langComm.setAttribute("aria-pressed", LANG === COMM);
    /* re-render the whole chrome in the new language is overkill; retarget data-i nodes */
    var ui = DISH.ui;
    setI("title", ui.title); setI("sub", ui.sub); setI("face1", ui.face1); setI("face2", ui.face2); setI("face3", ui.face3);
    setI("openpkg", ui.openpkg); setI("openadult", ui.openadult); setI("opencard", ui.opencard); setI("openabout", ui.openabout);
    setI("nogl", ui.nogl);
    DISH.stations.forEach(function (st, i) { setI("st" + i, st.nav); });
    if (ui.adult) { setI("a_h", ui.adult.h); }
    if (ui.recipe) setI("r_h", ui.recipe.h);
    if (ui.about) { setI("ab_h", ui.about.h); if (ui.about.help) setI("ab_help", ui.about.help.h); }
    if (ui.footer) { var f = ui.footer; setI("f1", f.way); setI("f2", f.safety); setI("f3", f.reader); setI("f4", f.sponsor); setI("f5", f.byline); }
    renderRecipe();
    if (DISH.ui.shows) paintShows();
    renderPanel(CUR);
    paintLabels();
    layoutLabels();
  }
  function setI(key, o) {
    var n = el.panel ? document.querySelector("[data-i='" + key + "']") : null;
    n = document.querySelector("[data-i='" + key + "']");
    if (!n || o == null) return;
    n.textContent = t(o);
    var cc = DISH.lang.commClass;
    if (cc) n.classList.toggle(cc, LANG === COMM && hasComm(o));
  }

  /* ========================================================================
     PANEL — the lessons live here, so the 2D fallback carries them all.
     A station's panel is a list of widget descriptors the dish supplies.
     ======================================================================== */
  var CUR = 0;
  function renderPanel(st) {
    CUR = st;
    [].forEach.call(el.nav.querySelectorAll("button"), function (b, i) { b.setAttribute("aria-current", i === st); });
    var station = DISH.stations[st];
    var box = h("div", { class: "card" });
    box.innerHTML = '<div class="reader">' + esc(t(station.movement || { en: "Movement" })) + " · [READER]</div>";
    (station.panel || []).forEach(function (w) { renderWidget(box, w, st); });
    el.panel.innerHTML = "";
    el.panel.appendChild(box);
    (station.panel || []).forEach(function (w) { if (w.wire) w.wire(widgetCtx(st)); });
    el.cap.textContent = t(station.cap);
    showStation(st);
  }

  function renderWidget(box, w, st) {
    if (w.type === "heading") { box.appendChild(h("h2", null, esc(t(w.text)) + (w.reader ? " " + reader() : ""))); return; }
    if (w.type === "sub") { box.appendChild(h("h3", null, esc(t(w.text)))); return; }
    if (w.type === "prose") {
      var p = h("p", { class: w.why ? "why" : "" });
      p.innerHTML = t(w.text) + (w.reader ? " " + reader() : "");
      box.appendChild(p); return;
    }
    if (w.type === "note") {
      var pn = h("p", { style: "font-size:.9rem;color:var(--muted)" });
      pn.innerHTML = t(w.text) + (w.reader ? " " + reader() : "") + (w.streak ? ' <span class="streak">' + esc(t(w.streakLabel || { en: "Streak:" })) + ' <span id="streak">0</span></span>' : "");
      box.appendChild(pn); return;
    }
    if (w.type === "origin") {
      box.appendChild(h("div", { class: "ingr", id: "ingr" }));
      box.appendChild(h("div", { class: "ans", id: "a-origin" })); return;
    }
    if (w.type === "order") {
      box.appendChild(h("div", { class: "slot", id: "slot", "aria-label": "your order" }));
      box.appendChild(h("div", { class: "seqrow", id: "seq" }));
      box.appendChild(h("div", { class: "ans", id: "a-seq" })); return;
    }
    if (w.type === "heat") {
      var hd = h("div", { class: "heat" });
      hd.innerHTML = '<input id="heat" type="range" min="0" max="100" value="' + (w.start || 30) + '" aria-label="heat"><span class="pot" id="potword"></span>';
      box.appendChild(hd); box.appendChild(h("div", { class: "ans", id: "a-heat" })); return;
    }
    if (w.type === "vocab") { box.appendChild(h("ul", { class: "vocab", id: "vocab-" + st })); return; }
  }

  function widgetCtx(st) { return { st: st, LANG: LANG, COMM: COMM, t: t, review: REVIEW, api: sceneApi[st] || null }; }

  /* generic lesson widgets, configured by dish data in station.panel entries. */
  function wireOrigin(cfg) {
    var box = document.getElementById("ingr"), ans = document.getElementById("a-origin");
    if (!box) return;
    var sel = null;
    cfg.items.forEach(function (it) {
      var c = h("button", { class: "chip" }, esc(t(it.name)));
      c.onclick = function () {
        sel = it;
        [].forEach.call(box.querySelectorAll(".chip"), function (x) { x.classList.remove("sel"); });
        c.classList.add("sel"); ans.className = "ans"; ans.textContent = t(cfg.prompt);
        if (it.lift && sceneApi[CUR] && sceneApi[CUR].lift) sceneApi[CUR].lift(it.key);
      };
      box.appendChild(c);
    });
    var dests = h("div", { class: "ingr" }); dests.style.marginTop = "8px";
    cfg.dests.forEach(function (p) {
      var d = h("button", { class: "chip" }, "→ " + esc(t(p.label)));
      d.style.borderColor = "var(--accent)";
      d.onclick = function () {
        if (!sel) { ans.className = "ans no"; ans.textContent = t(cfg.pickFirst); return; }
        if (sel.dest === p.key) {
          ans.className = "ans ok";
          ans.textContent = t(cfg.right).replace("{name}", t(sel.name)).replace("{place}", t(p.label)) + " " + t(p.key === cfg.familyKey ? cfg.familyNote : cfg.landNote);
          if (sceneApi[CUR] && sceneApi[CUR].flyTo) sceneApi[CUR].flyTo(sel.key, p.key);
        } else {
          ans.className = "ans no";
          ans.textContent = t(cfg.wrong).replace("{name}", t(sel.name)).replace("{place}", t(cfg.destLabel(sel.dest)));
        }
      };
      dests.appendChild(d);
    });
    box.after(dests);
  }

  function wireOrder(cfg) {
    var slot = document.getElementById("slot"), seq = document.getElementById("seq"), ans = document.getElementById("a-seq");
    if (!seq) return;
    var api = sceneApi[CUR] || null;
    var next = 1, streak = 0;
    /* deterministic shuffle (no Math.random dependency for reproducibility across loads) */
    var order = cfg.steps.map(function (s, i) { return { s: s, i: i }; }).sort(function (a, b) { return ((a.s.n * 7) % 5) - ((b.s.n * 7) % 5); });
    var streakEl = document.getElementById("streak");
    function redraw() {
      seq.innerHTML = "";
      order.forEach(function (o) {
        if (o.done) return;
        var b = h("button", null, esc(t(o.s.label)));
        b.onclick = function () {
          if (o.s.n === next) {
            o.done = true;
            var sp = h("span", null, esc(t(o.s.label))); slot.appendChild(sp);
            next++; streak++; if (streakEl) streakEl.textContent = streak;
            ans.className = "ans ok";
            ans.textContent = next > cfg.steps.length ? t(cfg.doneMsg) : t(cfg.okMsg || { en: "Yes." });
            if (api && api.drop) api.drop(o.s.id, o.s.effect);
            redraw();
          } else {
            streak = 0; if (streakEl) streakEl.textContent = streak;
            ans.className = "ans no";
            ans.textContent = o.s.n < next ? t(cfg.alreadyMsg) :
              t(cfg.notYetMsg).replace("{step}", t(cfg.steps[next - 1].label));
            if (api && api.smoke) api.smoke();
          }
        };
        seq.appendChild(b);
      });
    }
    redraw();
  }

  function wireHeat(cfg) {
    var heat = document.getElementById("heat"), word = document.getElementById("potword"), ha = document.getElementById("a-heat");
    if (!heat) return;
    var api = sceneApi[CUR] || null;
    function hw() {
      var v = +heat.value;
      if (v < (cfg.splitAt || 60)) { word.textContent = t(cfg.holdWord); word.style.color = "var(--good)"; ha.className = "ans"; ha.textContent = t(cfg.holdMsg); }
      else { word.textContent = t(cfg.splitWord); word.style.color = "var(--bad)"; ha.className = "ans no"; ha.textContent = t(cfg.splitMsg); }
      if (api && api.setHeat) api.setHeat(v / 100);
    }
    heat.oninput = hw; hw();
  }

  function wireVocab(cfg, st) {
    var ul = document.getElementById("vocab-" + st); if (!ul) return;
    ul.innerHTML = "";
    (cfg.ref === "all" ? DISH.vocab : DISH.vocab.filter(function (v) { return (cfg.ref || []).indexOf(v.en) > -1; })).forEach(function (v) {
      var li = h("li");
      var flipped = false;
      function draw() {
        if (LANG === COMM || flipped) {
          li.innerHTML = '<span class="scr ta">' + esc(v.scr) + "</span> " + (REVIEW ? reader() : "") +
            '<span class="flip">' + esc(t(DISH.ui.flip || { en: "flip" })) + "</span>" +
            '<br><span class="tr">' + esc(v.tr) + " · " + esc(v.en) + "</span>";
        } else {
          li.innerHTML = '<span class="en">' + esc(v.en) + '</span> — <span class="scr ta">' + esc(v.scr) + "</span> " + (REVIEW ? reader() : "") +
            '<span class="flip">' + esc(t(DISH.ui.flip || { en: "flip" })) + "</span>" +
            '<br><span class="tr">' + esc(v.tr) + "</span>";
        }
      }
      draw();
      li.onclick = function () { flipped = !flipped; draw(); };
      ul.appendChild(li);
    });
  }

  /* dispatch wiring for the known widget types, invoked from each panel entry's wire() */
  function autoWire(st) {
    (DISH.stations[st].panel || []).forEach(function (w) {
      if (w.type === "origin" && w.cfg) wireOrigin(w.cfg);
      if (w.type === "order" && w.cfg) wireOrder(w.cfg);
      if (w.type === "heat" && w.cfg) wireHeat(w.cfg);
      if (w.type === "vocab") wireVocab(w, st);
    });
  }

  /* ---- recipe card -------------------------------------------------------- */
  function renderRecipe() {
    var node = document.getElementById("recipe"); if (!node) return;
    node.textContent = typeof DISH.recipe === "function" ? DISH.recipe({ LANG: LANG, REVIEW: REVIEW }) : (DISH.recipe || "");
  }

  /* ========================================================================
     3D — the scene frame.  Lighting rig, camera tweening, label projection.
     Stations build their props through the dish's prop builders; this engine
     owns the renderer, the camera, the lights, and the overlay.
     ======================================================================== */
  var T = global.THREE, GL = false, renderer, scene, camera, raf = 0;
  var stations3D = [], sceneApi = [], firePoint = null, keyLight = null, keyTarget = null, fireT = 0;
  var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = global.matchMedia && matchMedia("(pointer: coarse)").matches;
  var orbit = { target: null, r: 26, theta: 0.7, phi: 1.0, user: false, auto: !reduce };
  var tween = null, allLabels = [], leaderSvg = null;

  function ease(k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }

  /* kit passed to prop builders — shared helpers so dishes don't re-import three idioms */
  var KIT = {
    get THREE() { return T; },
    mat: function (c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.82, metalness: 0.04 }, o || {})); },
    clay: function (c) { return new T.MeshStandardMaterial({ color: c || 0x7b4a2a, roughness: 0.95, metalness: 0.0 }); },
    canvasTex: function (w, hh, draw) {
      var cv = document.createElement("canvas"); cv.width = w; cv.height = hh;
      draw(cv.getContext("2d"), w, hh);
      var tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
      return tex;
    },
    reduce: reduce,
    coarse: coarse,
    /* load a CC0 GLB and hand back its scene (cloned). The call is non-blocking:
       builders drop a hand-built fallback in place first, then swap when the model
       arrives. cb(null) on any failure, so the fallback simply stays. */
    loadModel: function (url, opts, cb) { return enqueueModel(url, opts || {}, cb || function () {}); },
    /* a cheap inverted-hull outline so chunky low-poly props read on a phone */
    outline: function (obj, o) { return applyOutline(obj, o || {}); }
  };

  /* ---- model loading, environment, outline --------------------------------
     Models load lazily, after the first paint, so the scene draws its hand-built
     fallbacks immediately and swaps in the real props as they arrive. A quiet
     line in the stage tracks progress; the camera re-fits once they are all in. */
  var MODEL = { loader: null, cache: {}, queue: [], total: 0, done: 0, started: false };
  var firstPainted = false, envRequested = false;

  function enqueueModel(url, opts, cb) {
    MODEL.total++;
    MODEL.queue.push({ url: url, opts: opts, cb: cb });
    if (MODEL.started) flushModelQueue();   /* a late request (rare) still runs */
  }
  function modelDone() {
    MODEL.done++;
    if (MODEL.done >= MODEL.total) { if (el.progress) el.progress.classList.add("hide"); refitCurrent(); }
    else if (el.progress) el.progress.textContent = loadingLabel();
  }
  function loadingLabel() {
    var L = (DISH.ui && DISH.ui.loading) || { en: "loading the scene…" };
    return t(L) + "  " + MODEL.done + "/" + MODEL.total;
  }
  function flushModelQueue() {
    MODEL.started = true;
    var q = MODEL.queue; MODEL.queue = [];
    if (!q.length) return;
    if (!T.GLTFLoader) { q.forEach(function (it) { try { it.cb(null); } catch (e) {} modelDone(); }); return; }
    if (!MODEL.loader) MODEL.loader = new T.GLTFLoader();
    if (el.progress) { el.progress.textContent = loadingLabel(); el.progress.classList.remove("hide"); }
    q.forEach(function (it) {
      var cached = MODEL.cache[it.url];
      if (cached) { try { it.cb(cached.clone(true)); } catch (e) {} modelDone(); return; }
      MODEL.loader.load(it.url, function (gltf) {
        var root = gltf.scene || (gltf.scenes && gltf.scenes[0]);
        if (!root) { try { it.cb(null); } catch (e) {} modelDone(); return; }
        MODEL.cache[it.url] = root;
        try { it.cb(root.clone(true)); } catch (e) {}
        modelDone();
      }, undefined, function () { try { it.cb(null); } catch (e) {} modelDone(); });
    });
  }

  /* inverted-hull outline: a back-face shell, slightly inflated, unlit. Cheap,
     works everywhere, and gives the low-poly props a clean read on small screens. */
  function applyOutline(root, o) {
    if (!root || !root.traverse) return root;
    var color = o.color != null ? o.color : 0x2a1a10, k = o.thickness != null ? o.thickness : 0.06;
    var mat = new T.MeshBasicMaterial({ color: color, side: T.BackSide });
    var meshes = [];
    root.traverse(function (n) { if (n.isMesh && n.geometry && !n._outline) meshes.push(n); });
    meshes.forEach(function (m) {
      var shell = new T.Mesh(m.geometry, mat);
      shell._outline = true; shell._noFit = true;
      shell.position.copy(m.position); shell.quaternion.copy(m.quaternion);
      shell.scale.copy(m.scale).multiplyScalar(1 + k);
      shell.renderOrder = (m.renderOrder || 0) - 1;
      if (m.parent) m.parent.add(shell); else root.add(shell);
    });
    return root;
  }

  function refitCurrent() {
    if (!GL || orbit.user || tween) return;     /* never yank a camera the user owns or that's mid-move */
    var fit = computeFit(stations3D[CUR] && stations3D[CUR].group);
    if (!fit) return;
    var v = DISH.stations[CUR].view || {};
    orbit.r = fitDistance(fit.radius);
    orbit.target.copy(fit.center); if (v.ty != null) orbit.target.y += v.ty;
    fitShadow(fit.center, fit.radius);
  }

  function loadEnvironment(url) {
    if (envRequested || !url || !T.RGBELoader || !T.PMREMGenerator) return;
    envRequested = true;
    try {
      var pmrem = new T.PMREMGenerator(renderer); pmrem.compileEquirectangularShader();
      new T.RGBELoader().load(url, function (tex) {
        tex.mapping = T.EquirectangularReflectionMapping;
        var env = pmrem.fromEquirectangular(tex).texture;
        scene.environment = env;                 /* reflections + ambient; background stays transparent */
        tex.dispose(); pmrem.dispose();
      }, undefined, function () { try { pmrem.dispose(); } catch (e) {} });
    } catch (e) {}
  }

  function makeRenderer() {
    try {
      renderer = new T.WebGLRenderer({ canvas: el.canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
      if (!renderer.getContext()) return false;
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !coarse;           /* soft shadows off on phones for frame rate */
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = T.sRGBEncoding;
    /* ACES filmic tone mapping + sRGB out: the stylised look wants gentle highlight
       roll-off rather than clipped whites, and a touch more exposure to carry it. */
    if (T.ACESFilmicToneMapping !== undefined) { renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15; }
    if (T.PMREMGenerator) renderer.physicallyCorrectLights = false;
    return true;
  }

  function buildLights() {
    /* hemisphere fills the shadows warmly; kept moderate because the HDRI
       environment (when it loads) carries most of the ambient and reflections. */
    var hemi = new T.HemisphereLight(0xfff0dd, 0x2a1c10, 0.55); scene.add(hemi);
    var key = new T.DirectionalLight(0xfff4e2, 1.0); key.position.set(12, 20, 10);
    key.castShadow = !coarse;
    if (key.shadow) {
      key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
      var c = key.shadow.camera; c.near = 1; c.far = 80; c.left = -30; c.right = 30; c.top = 30; c.bottom = -30;
      key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
    }
    keyTarget = new T.Object3D(); scene.add(keyTarget); key.target = keyTarget;
    keyLight = key; scene.add(key);
    var fill = new T.DirectionalLight(0xbcd4ff, 0.22); fill.position.set(-14, 8, -10); scene.add(fill);
    /* a warm fire point light, lit only at the kitchen station */
    firePoint = new T.PointLight(0xff7a2a, 0.0, 40, 2); firePoint.position.set(0, 2.2, 0); firePoint.castShadow = false; scene.add(firePoint);
  }

  function init3D() {
    if (!T || !makeRenderer()) return false;
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(50, 1, 0.1, 400);
    orbit.target = new T.Vector3(0, 2, 0);
    buildLights();
    DISH.stations.forEach(function (st, i) {
      var g = new T.Group(); g.visible = false; scene.add(g);
      var out = st.build ? st.build(g, KIT) : { labels: [], picks: [], api: null };
      out = out || {};
      var rec = { group: g, labels: out.labels || [], picks: out.picks || [] };
      if (out.anim) rec._anim = out.anim;
      stations3D.push(rec);
      sceneApi[i] = out.api || null;
    });
    buildOverlayLabels();
    bindControls();
    resize(); global.addEventListener("resize", resize);
    var ro = new T.Raycaster(), ndc = new T.Vector2();
    el._ray = ro; el._ndc = ndc;
    loop();
    return true;
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (tween) {
      tween.t += 1 / 60;
      var k = Math.min(1, tween.t / tween.dur), e = ease(k);
      orbit.r = tween.from.r + (tween.to.r - tween.from.r) * e;
      orbit.theta = tween.from.theta + (tween.to.theta - tween.from.theta) * e;
      orbit.phi = tween.from.phi + (tween.to.phi - tween.from.phi) * e;
      orbit.target.lerpVectors(tween.from.target, tween.to.target, e);
      if (k >= 1) tween = null;
    }
    if (orbit.auto && !orbit.user && !tween) orbit.theta += 0.0016;
    /* the fire as a flickering warm point light, at a station flagged fire:true */
    if (DISH.stations[CUR] && DISH.stations[CUR].fire) {
      fireT += 1 / 60;
      firePoint.intensity = 2.2 * (0.82 + 0.18 * Math.sin(fireT * 11) * Math.cos(fireT * 6.3));
    }
    /* per-station animation hooks */
    var cur = stations3D[CUR];
    if (cur && cur._anim) cur._anim();
    applyOrbit();
    renderer.render(scene, camera);
    layoutLabels();
    /* first frame is on screen — now pull in the HDRI and the GLB props */
    if (!firstPainted) { firstPainted = true; loadEnvironment(DISH.env && DISH.env.hdri); flushModelQueue(); }
  }

  function applyOrbit() {
    var o = orbit, sp = Math.sin(o.phi);
    camera.position.set(o.target.x + o.r * sp * Math.cos(o.theta), o.target.y + o.r * Math.cos(o.phi), o.target.z + o.r * sp * Math.sin(o.theta));
    camera.lookAt(o.target);
  }

  function resize() {
    if (!GL) return;
    var w = el.stage.clientWidth, hh = el.stage.clientHeight;
    renderer.setSize(w, hh, false); camera.aspect = w / hh; camera.updateProjectionMatrix();
    /* re-fit the current station to the new aspect so nothing falls out of frame on rotate/resize */
    if (!tween && stations3D[CUR]) {
      var fit = computeFit(stations3D[CUR].group);
      if (fit) {
        orbit.r = fitDistance(fit.radius); orbit.target.copy(fit.center);
        var v = DISH.stations[CUR].view || {}; if (v.ty != null) orbit.target.y += v.ty;
        fitShadow(fit.center, fit.radius);
      }
    }
  }

  /* HTML label overlay — one <div> per anchor, positioned from the projected 3D point. */
  function buildOverlayLabels() {
    el.labels.innerHTML = ""; allLabels = [];
    var NS = "http://www.w3.org/2000/svg";
    leaderSvg = document.createElementNS(NS, "svg");
    leaderSvg.setAttribute("class", "leaders");
    el.labels.appendChild(leaderSvg);          /* leaders paint first, under the label pills */
    stations3D.forEach(function (s3, si) {
      s3.labels.forEach(function (a) {
        var ln = document.createElementNS(NS, "line"); ln.setAttribute("class", "leader");
        leaderSvg.appendChild(ln);
        var d = h("div", { class: "cs-label" + (a.cls ? " " + a.cls : "") + (a.tap ? " tap" : "") });
        if (a.tap) d.onclick = function () { a.tap(); };
        el.labels.appendChild(d);
        allLabels.push({ node: d, leader: ln, anchor: a, st: si });
      });
    });
    paintLabels();
  }
  function hideLeader(L) { if (L.leader) L.leader.setAttribute("class", "leader off"); }
  function paintLabels() {
    allLabels.forEach(function (L) {
      var a = L.anchor, txt = a.text;
      if (a.vocab) {
        var v = a.vocab;
        L.node.innerHTML = '<span class="scr">' + esc(v.scr) + "</span>" + (REVIEW ? " " + reader() : "") +
          '<span class="tr">' + esc(v.tr) + " · " + esc(v.en) + "</span>";
      } else {
        L.node.innerHTML = esc(t(txt)) + (a.reader && REVIEW ? " " + reader() : "");
      }
    });
  }
  var _v = T ? new T.Vector3() : null, _v2 = T ? new T.Vector3() : null;
  var _box = T ? new T.Box3() : null, _tmpBox = T ? new T.Box3() : null, _center = T ? new T.Vector3() : null, _size = T ? new T.Vector3() : null;

  /* Fit the camera to a station's props: a tight bounding box (skipping subtrees
     flagged `_noFit` — far markers, hidden rings), then the distance that frames
     its bounding sphere for the current aspect, plus a margin.  Works for both the
     desktop 3:2 stage and the phone portrait stage because it reads camera.aspect. */
  function expandBox(box, o) {
    if (o._noFit) return;
    if (o.isMesh && o.geometry) {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      if (o.geometry.boundingBox) { _tmpBox.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); box.union(_tmpBox); }
    }
    for (var i = 0; i < o.children.length; i++) expandBox(box, o.children[i]);
  }
  function computeFit(group) {
    if (!group) return null;
    group.updateWorldMatrix(true, true);
    _box.makeEmpty(); expandBox(_box, group);
    if (_box.isEmpty()) return null;
    _box.getCenter(_center); _box.getSize(_size);
    return { center: _center.clone(), radius: 0.5 * _size.length() };
  }
  function fitDistance(radius) {
    var vFov = camera.fov * Math.PI / 180;
    var hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    return (radius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.2;   /* margin 1.2 */
  }
  function fitShadow(center, radius) {
    if (!keyLight || !keyLight.shadow) return;
    keyLight.position.set(center.x + radius * 0.7, center.y + radius * 1.6, center.z + radius * 0.9);
    if (keyTarget) { keyTarget.position.copy(center); keyTarget.updateMatrixWorld(); }
    var c = keyLight.shadow.camera, R = radius * 1.3;
    c.left = -R; c.right = R; c.top = R; c.bottom = -R; c.near = 0.5; c.far = radius * 6 + 20;
    c.updateProjectionMatrix();
  }

  function effectivelyVisible(obj) {
    if (!obj || !obj.traverse) return true;         /* plain {position} anchors are always on */
    var o = obj;
    while (o) { if (o.visible === false) return false; o = o.parent; }
    return true;
  }
  /* Project every visible label, place it at its preferred slot off its anchor,
     then resolve overlaps so no label covers another or its own prop:
       1. project each anchor to screen; hide those behind the camera / off a prop.
       2. seat each label one gap away in its declared slot (above/left/right/below).
       3. push-apart iterations — vertical first — nudge any overlapping pair apart.
       4. clamp inside the stage; where a label moved off its anchor, draw a leader.
       5. write left/top once (measured widths read before writes, one reflow/frame). */
  function layoutLabels() {
    if (!GL) return;
    var rect = el.stage.getBoundingClientRect(), w = rect.width, hh = rect.height;
    var active = [], GAP = 20;
    allLabels.forEach(function (L) {
      var a = L.anchor, vis = L.st === CUR;
      if (!vis || a.hidden || !effectivelyVisible(a.obj)) { L.node.classList.add("hidden"); hideLeader(L); return; }
      var wp = a.obj.getWorldPosition ? a.obj.getWorldPosition(_v2) : _v2.copy(a.obj.position);
      _v.copy(wp);
      if (a.offset) { _v.x += a.offset[0]; _v.y += a.offset[1]; _v.z += a.offset[2]; }
      _v.project(camera);
      if (_v.z > 1) { L.node.classList.add("hidden"); hideLeader(L); return; }
      L.node.classList.remove("hidden");
      var ax = (_v.x * 0.5 + 0.5) * w, ay = (-_v.y * 0.5 + 0.5) * hh;
      var bw = L.node.offsetWidth || 70, bh = L.node.offsetHeight || 22;
      var slot = a.slot || "above", cx = ax, cy = ay;
      if (slot === "above") cy = ay - GAP - bh / 2;
      else if (slot === "below") cy = ay + GAP + bh / 2;
      else if (slot === "left") cx = ax - GAP - bw / 2;
      else if (slot === "right") cx = ax + GAP + bw / 2;
      L._ax = ax; L._ay = ay; L._cx = cx; L._cy = cy; L._bw = bw; L._bh = bh;
      active.push(L);
    });
    /* push-apart — vertical first (stack overlapping pills into a readable column) */
    for (var it = 0; it < 6; it++) {
      for (var i = 0; i < active.length; i++) {
        for (var j = i + 1; j < active.length; j++) {
          var A = active[i], B = active[j];
          var ox = (A._bw + B._bw) / 2 + 6 - Math.abs(B._cx - A._cx);
          var oy = (A._bh + B._bh) / 2 + 4 - Math.abs(B._cy - A._cy);
          if (ox > 0 && oy > 0) {
            var dir = A._cy <= B._cy ? -1 : 1, push = oy / 2 + 0.5;
            A._cy += dir * push; B._cy -= dir * push;
          }
        }
      }
    }
    active.forEach(function (L) {
      L._cx = Math.max(L._bw / 2 + 2, Math.min(w - L._bw / 2 - 2, L._cx));
      L._cy = Math.max(L._bh / 2 + 2, Math.min(hh - L._bh / 2 - 2, L._cy));
      L.node.style.left = L._cx + "px";
      L.node.style.top = L._cy + "px";
      if (Math.hypot(L._cx - L._ax, L._cy - L._ay) > L._bh / 2 + 8) {
        L.leader.setAttribute("x1", L._ax); L.leader.setAttribute("y1", L._ay);
        L.leader.setAttribute("x2", L._cx); L.leader.setAttribute("y2", L._cy);
        L.leader.setAttribute("class", "leader");
      } else hideLeader(L);
    });
  }

  function showStation(st) {
    if (!GL) return;
    stations3D.forEach(function (s, i) { s.group.visible = i === st; });
    var station = DISH.stations[st], v = station.view || {};
    firePoint.intensity = station.fire ? 2.2 : 0.0;
    /* three-quarter-above pose from the station's view; distance and look-at fitted to its props */
    var phi = v.phi != null ? v.phi : 1.0, theta = v.theta != null ? v.theta : 0.7;
    var fit = computeFit(stations3D[st].group), center, r;
    if (fit) {
      center = fit.center; if (v.ty != null) center.y += v.ty;
      r = fitDistance(fit.radius); fitShadow(fit.center, fit.radius);
    } else {
      var tg = v.target || [0, 2, 0];
      center = new T.Vector3(tg[0], tg[1], tg[2]); r = v.r || 26;
    }
    var from = { r: orbit.r, theta: orbit.theta, phi: orbit.phi, target: orbit.target.clone() };
    var toTheta = theta;
    while (toTheta - from.theta > Math.PI) toTheta -= Math.PI * 2;
    while (toTheta - from.theta < -Math.PI) toTheta += Math.PI * 2;
    var to = { r: r, theta: toTheta, phi: phi, target: center };
    orbit.user = false;
    if (reduce) { orbit.r = to.r; orbit.theta = to.theta; orbit.phi = to.phi; orbit.target.copy(to.target); tween = null; }
    else tween = { t: 0, dur: 1.2, from: from, to: to };
  }

  function bindControls() {
    var cv = el.canvas, pts = new Map(), last = null, pd = 0, downAt = null, moved = 0;
    cv.addEventListener("pointerdown", function (e) {
      try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); last = { x: e.clientX, y: e.clientY };
      downAt = { x: e.clientX, y: e.clientY }; moved = 0;
    });
    cv.addEventListener("pointermove", function (e) {
      if (!pts.has(e.pointerId)) return;
      var prev = pts.get(e.pointerId), dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved += Math.abs(dx) + Math.abs(dy);
      if (pts.size === 2) {
        var arr = [...pts.values()]; var d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
        if (pd) orbit.r = Math.max(8, Math.min(70, orbit.r * pd / d)); pd = d; orbit.user = true;
      } else if (last && (!coarse || moved > 8)) {
        /* on coarse pointers, orbit only after a clear drag — a tap is a pick, not a spin */
        orbit.theta -= dx * 0.006; orbit.phi = Math.max(0.3, Math.min(1.45, orbit.phi - dy * 0.005));
        last = { x: e.clientX, y: e.clientY }; orbit.user = true;
      } else if (last) { last = { x: e.clientX, y: e.clientY }; }
    });
    function up(e) {
      if (pts.size === 1 && moved < 8 && downAt) pick(e);
      pts.delete(e.pointerId); pd = 0; if (pts.size === 0) last = null;
    }
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", function (e) { pts.delete(e.pointerId); pd = 0; });
    cv.addEventListener("wheel", function (e) { e.preventDefault(); orbit.r = Math.max(8, Math.min(70, orbit.r * (1 + Math.sign(e.deltaY) * 0.08))); orbit.user = true; }, { passive: false });
  }
  function pick(e) {
    var s3 = stations3D[CUR]; if (!s3 || !s3.picks.length) return;
    var rect = renderer.domElement.getBoundingClientRect();
    el._ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    el._ray.setFromCamera(el._ndc, camera);
    var objs = s3.picks.map(function (p) { return p.obj; });
    var hit = el._ray.intersectObjects(objs, true)[0];
    if (!hit) return;
    var o = hit.object;
    while (o && !o._pick && o.parent) o = o.parent;
    if (o && o._pick) o._pick();
  }

  /* register an animation hook for the current station's group (called by builders via api) */
  function registerAnim(st, fn) { if (stations3D[st]) stations3D[st]._anim = fn; }

  /* ---- navigation --------------------------------------------------------- */
  function gotoStation(st) { renderPanel(st); }

  /* ---- boot --------------------------------------------------------------- */
  function mount(dish) {
    DISH = dish;
    COMM = (dish.lang && dish.lang.comm) || "ta";
    loadLang();
    /* the accent comes from the dish module: it sets --accent (the single accent),
       --accent2 (the reader/review markers) and --turmeric (streak + small
       highlights) on :root; the shared CSS carries clean paper/ink/rule defaults.
       See SHOWCASE-KIT.md §5. */
    if (dish.palette) { var rs = document.documentElement.style; for (var pk in dish.palette) { if (Object.prototype.hasOwnProperty.call(dish.palette, pk)) rs.setProperty("--" + pk, dish.palette[pk]); } }
    var root = document.getElementById("showcase-root") || document.body;
    if (REVIEW) document.documentElement.classList.add("review");
    buildChrome(root);

    el.langEn.onclick = function () { LANG = "en"; saveLang(); applyLang(); };
    el.langComm.onclick = function () { LANG = COMM; saveLang(); applyLang(); };

    /* make the known widgets wire themselves after each panel render */
    var _rp = renderPanel;
    renderPanel = function (st) { _rp(st); autoWire(st); };

    applyLang();          /* renders chrome text, recipe, and panel 0 */

    /* lazy-load the 3D after first paint so the lesson shows instantly */
    (global.requestIdleCallback || function (f) { setTimeout(f, 60); })(function () {
      GL = init3D();
      if (!GL) { el.canvas.classList.add("hide"); el.nogl.classList.remove("hide"); }
      else { showStation(CUR); renderPanel(CUR); }   /* re-wire now that the scene APIs exist */
    });
  }

  global.CulturalShowcase = { mount: mount, registerAnim: registerAnim, get review() { return REVIEW; } };
})(window);
