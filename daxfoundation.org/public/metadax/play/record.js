// record.js — "Save this session to my record" for the play page.
// At session end the guide fills in what was attempted and reached and their
// own words; this emits one `metadax-record` v1 JSON entry and downloads it.
// No accounts, no upload: the file is the whole thing. Drop it into the
// record/ folder of a metadax-learner-record repo (or any repo you keep).
//
// The entry format and the privacy pass mirror
// daxfoundation/metadax-learner-record (schema/record.schema.json,
// tools/validate-record.mjs). Private by default; publishing is a later,
// explicit step the learner/guide takes by turning on GitHub Pages there.
(function () {
  var SUBJECTS = { Math:1, Reading:1, Writing:1, Spelling:1, Science:1, French:1, Language:1, History:1, Other:1 };
  // Behaviour, never a diagnosis: a named condition must never reach a record.
  var DIAGNOSIS = ["dyslexia","dyslexic","dyscalculia","dysgraphia","adhd","autism","autistic","asperger","spld","learning disability","learning disabilities"];
  var diagRe = new RegExp("\\b(" + DIAGNOSIS.join("|") + ")\\b", "i");
  var emailRe = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  var handleRe = /(^|\s)@[A-Za-z0-9_]{2,}/;
  var linkRe = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|uk|ca|edu|gov)\b/i;

  function el(t, cls, txt) { var e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  // Pull the games a learner actually played out of the package blocks, so the
  // guide fills counts against real game names instead of typing them.
  function gamesOf(pkg) {
    var names = [], seen = {};
    function walk(blocks) {
      (blocks || []).forEach(function (b) {
        if (!b) return;
        if ((b.type === "quiz" || b.type === "sort" || b.type === "sequence" || b.type === "build") && b.title) {
          var n = String(b.title).replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
          if (!seen[n]) { seen[n] = 1; names.push(n); }
        }
      });
    }
    ["guide", "learner"].forEach(function (k) { ((pkg[k] || {}).sections || []).forEach(function (s) { walk(s.blocks); }); });
    return names;
  }

  function entryId(pkg) {
    var ref = String(pkg.ref || pkg.title || "session").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return ref + "-s" + (pkg.session || 1);
  }

  // The privacy pass, run in the browser before anything can be downloaded.
  function privacyCheck(rec) {
    var errs = [];
    var scan = {};
    if (rec.learner_words) scan["learner's words"] = rec.learner_words;
    if (rec.guide_note) scan["the guide's note"] = rec.guide_note;
    (rec.mistakes || []).forEach(function (m, i) { if (m && m.name) scan["mistake " + (i + 1)] = m.name; });
    if (rec.package && rec.package.title) scan["the title"] = rec.package.title;
    Object.keys(scan).forEach(function (field) {
      var v = String(scan[field]);
      var d = v.match(diagRe);
      if (d) errs.push(field + ' names a condition (“' + d[1] + '”) — this record holds behaviour, never a diagnosis.');
      if (emailRe.test(v)) errs.push(field + " looks like it contains an email address — take it out.");
      if (handleRe.test(v)) errs.push(field + " looks like it contains an @handle — take it out.");
      if (linkRe.test(v)) errs.push(field + " contains a link — links go only in the links row below, not in the writing.");
    });
    return errs;
  }

  function offer(pkg) {
    if (!pkg || pkg.format !== "metadax-package") return;
    var host = document.getElementById("record");
    if (!host) return;
    host.innerHTML = "";
    var FR = pkg.lang === "fr";
    function T(en, fr) { return FR ? fr : en; }

    var sec = el("div", "sec");
    sec.appendChild(el("div", "label", T("Save this session to your record", "Enregistrer cette séance dans votre dossier")));
    sec.appendChild(el("p", "muted", T(
      "Optional, and private. Nothing is sent anywhere — this makes one JSON file you keep. " +
      "Use a nickname, never a real name. Drop the file into the record/ folder of your learning-record repo.",
      "Facultatif et privé. Rien n’est envoyé : vous obtenez un fichier JSON que vous gardez. " +
      "Utilisez un pseudonyme, jamais un vrai nom. Déposez le fichier dans le dossier record/ de votre dépôt de suivi.")));

    var games = gamesOf(pkg);
    if (!games.length) games = [T("(the game)", "(le jeu)")];

    // Prefill from the same game records the learner built while playing: the
    // live session (exposed by the play page) summarised through the engine.
    // The guide can still edit every field; this only saves them re-counting.
    var byTitle = {}, slipLines = [];
    try {
      var eng = window.MetaDAXEngine, play = window.MetaDAXPlay;
      if (eng && eng.summarizeGames && play && play.session) {
        eng.summarizeGames(pkg, play.session()).forEach(function (s) {
          byTitle[s.title] = s;
          (s.mistakes || []).forEach(function (m) { slipLines.push(m.name + " x" + m.count); });
        });
      }
    } catch (e) { /* no records, or storage blocked — fields stay empty */ }

    // per-game rows: answered / right / level / of, prefilled where we have it
    var gameRows = [];
    games.forEach(function (g) {
      var pre = byTitle[g] || {};
      var row = el("div", "lvl");
      row.appendChild(el("strong", null, g));
      var grid = el("div"); grid.style.cssText = "display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.4rem;";
      function num(ph, val) { var i = el("input"); i.type = "number"; i.min = "0"; i.placeholder = ph; if (val != null) i.value = val; i.style.cssText = "width:7.5rem;padding:.3rem;font:inherit;"; grid.appendChild(i); return i; }
      var r = {
        game: g,
        answered: num(T("answered", "réponses"), pre.answered),
        right: num(T("right", "justes"), pre.right),
        level: num(T("level reached", "niveau atteint"), pre.level),
        of: num(T("of how many", "sur combien"), pre.of)
      };
      row.appendChild(grid); gameRows.push(r); sec.appendChild(row);
    });

    function field(label, ph, big) {
      var w = el("div", "blk");
      w.appendChild(el("div", "q", label));
      var t = big ? el("textarea") : el("input");
      if (!big) { t.type = "text"; t.style.cssText = "width:100%;padding:.4rem;font:inherit;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg);"; }
      t.placeholder = ph; w.appendChild(t); sec.appendChild(w); return t;
    }
    var fDate = field(T("Date of the session (YYYY-MM-DD)", "Date de la séance (AAAA-MM-JJ)"), "2026-10-09");
    var fMistakes = field(T("Where it got tricky — behaviour, never a diagnosis (one per line, “what happened ×count”)", "Où ça a coincé — des comportements, jamais un diagnostic (une ligne par cas, « ce qui s’est passé ×nombre »)"), T("said the sounds but they stayed apart x2", "a cherché le fichier qcow2 sur LVM-thin x2"), true);
    if (slipLines.length) fMistakes.value = slipLines.join("\n");
    var fLearner = field(T("In the learner's words (nickname only)", "Dans les mots de l’apprenant (pseudonyme seulement)"), T("What they said, where they led…", "Ce qu’il a dit, là où il a mené…"), true);
    var fGuide = field(T("The guide's note", "La note du guide"), T("The hardest moment, what did not work, what only you could do, what you'd like next time…", "Le moment le plus difficile, ce qui n’a pas marché, ce que vous seul pouviez faire, ce que vous voudriez la prochaine fois…"), true);

    var msg = el("div"); sec.appendChild(msg);
    var btn = el("button", null, T("Download my record entry", "Télécharger l’entrée de mon dossier"));
    btn.style.marginTop = ".6rem";
    sec.appendChild(btn);

    btn.addEventListener("click", function () {
      msg.innerHTML = "";
      var rec = {
        format: "metadax-record", v: 1,
        entry_id: entryId(pkg),
        package: { ref: String(pkg.ref || pkg.title || "session"), session: pkg.session || 1 }
      };
      if (pkg.title) rec.package.title = String(pkg.title).slice(0, 120);
      if (pkg.subject && SUBJECTS[pkg.subject]) rec.package.subject = pkg.subject;
      if (pkg.age_band) rec.package.age_band = pkg.age_band;
      rec.date = (fDate.value || "").trim();

      rec.attempted = []; rec.reached = [];
      gameRows.forEach(function (r) {
        var a = { game: r.game };
        if (r.answered.value !== "") a.answered = +r.answered.value;
        if (r.right.value !== "") a.right = +r.right.value;
        rec.attempted.push(a);
        if (r.level.value !== "" || r.of.value !== "") {
          var re = { game: r.game };
          if (r.level.value !== "") re.level = +r.level.value;
          if (r.of.value !== "") re.of = +r.of.value;
          rec.reached.push(re);
        }
      });

      var mis = (fMistakes.value || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      if (mis.length) rec.mistakes = mis.map(function (line) {
        var m = line.match(/\s*[x×]\s*(\d+)\s*$/i);
        if (m) return { name: line.slice(0, m.index).trim().slice(0, 200), count: +m[1] };
        return { name: line.slice(0, 200) };
      });
      if (fLearner.value.trim()) rec.learner_words = fLearner.value.trim().slice(0, 1000);
      if (fGuide.value.trim()) rec.guide_note = fGuide.value.trim().slice(0, 2000);
      rec.generated_by = "play page";

      // --- validate the shape, then the privacy pass ---
      var errs = [];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rec.date)) errs.push(T("Enter the session date as YYYY-MM-DD.", "Saisissez la date de la séance au format AAAA-MM-JJ."));
      rec.reached.forEach(function (r) { if (r.of !== undefined && r.level !== undefined && r.level > r.of) errs.push("Reached level " + r.level + " is higher than the total " + r.of + " for “" + r.game + "”."); });
      errs = errs.concat(privacyCheck(rec));

      if (errs.length) {
        var e = el("div", "err");
        e.appendChild(el("strong", null, T("Not saved — fix these first:", "Rien n’est enregistré — corrigez d’abord ceci :")));
        var ul = el("ul"); errs.forEach(function (x) { ul.appendChild(el("li", null, x)); }); e.appendChild(ul);
        msg.appendChild(e); return;
      }

      var blob = new Blob([JSON.stringify(rec, null, 2) + "\n"], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = rec.entry_id + ".json"; document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      var ok = el("div", "warn");
      ok.appendChild(el("strong", null, T("Saved ", "Enregistré : ") + rec.entry_id + ".json. "));
      ok.appendChild(document.createTextNode(T("It never left your device. To publish it later, drop it into your learning-record repo and turn on GitHub Pages — that is the one explicit step.", "Il n’a jamais quitté votre appareil. Pour le publier plus tard, déposez-le dans votre dépôt de suivi et activez GitHub Pages : c’est la seule étape volontaire.")));
      msg.appendChild(ok);
    });

    host.appendChild(sec);
  }

  window.MetaDAXRecord = { offer: offer };
})();
