// The Experiment Studio. Vanilla ES modules, no framework. DOM is built with od-forms' `el`/`svg`
// (packages/od-forms, vendored). One studio, four sister deliverables wired in:
//   - the 150-template library (state/gift/experiments, gift 4/4), run by its own runner/unlocks
//   - the shared string tables (state/gift/i18n, gift 3/4), 17 languages, RTL from _meta
//   - gift-og share cards + share-state v1 (cloudflare/workers/gift-og, gift 3/4)
//   - the love data API (state/gift/data/API.md, gift 2/4), OFF by default, consent-gated
// The only network code is core/api.js (opt-in) and core/load.js (same-origin JSON).

import { el, svg } from './vendor/od-forms-core.js';
import { LETTERS, LETTER_IDS, letterById, SOURCE_KINDS, kindById, itemsFor, QUESTIONS, catalogItem } from './core/catalog.js';
import { newExperiment, normalizeExperiment, run, stagesFor, familyOf, cleanText, looksPersonal, MAX_LETTERS, MAX_SOURCES, MAX_QUESTION, TIMBRES, TENSES } from './core/experiment.js';
import { linkCopy, hasTypedWords, codeFromHash, decodeRaw, encode, encodePayload, payloadId, experimentId, remixOf, makeMineFrom } from './core/share.js';
import { toCard, toTemplateCard, checkCard, depthsOf } from './core/card.js';
import { LANGS, makeTranslator, loadTables, pickLang, dirOf, needsReview } from './core/i18n.js';
import { loadJSON } from './core/load.js';
import { recordCompletion, currentStreak, isUnlocked, featureOn, nextUnlock, dayString, FEATURE_UNLOCKS } from './core/progress.js';
import { makeStore, upsert } from './core/store.js';
import { makeBundle, widgetOptions, stageActive, needsAnswer, cleanWidgets, runUpTo, summarize, playable, outputType, templatePayload, normalizeTemplatePayload, libraryProgress, completeTemplate } from './core/tpl.js';
import { API_CONFIG, makeClient, experimentBody, looksLikeApiToken } from './core/api.js';
import { sanitize as ogSanitize, encodeState as ogEncode, decodeState as ogDecode, soundLetter as ogLetter } from './lib/gift-og/state.js';
import { createPlayer } from './audio.js';
import { createField } from './field.js';

const store = makeStore(globalThis.localStorage);
const player = createPlayer();
// the living background: a heartbeat particle field that follows the sound (field.js)
const field = createField(document.getElementById('field'), { level: () => player.level() });
const api = makeClient({ storage: globalThis.localStorage });
const S = {
  lang: pickLang(store.lang(), navigator.languages || [navigator.language]),
  age: store.age(),
  lib: store.library(),
  progress: store.progress(),
  done: store.templatesDone(),
  view: 'home', // home | build | tpl | shared | gift | apishare
  exp: null, stage: 0, pendingKind: null, recorded: null,
  tpl: null, tStage: 0,
  shared: null, sharedId: null, sharedBad: false, ogState: null, apiToken: null,
  libTab: 'mine', tplFilter: 'all', depth: 0, pubText: false, nowPlaying: -1,
  toast: [], breath: false, over16: false, apiStatus: null, apiMe: null, apiData: null,
  openWords: [], openHue: null, revealN: 0,
};
let tables = { shared: {}, studio: {} };
let t = (k) => k;
// Editions for one person (?para=<name>): a separate module, loaded only for that link. It may
// overlay strings and add its own layer; without the parameter nothing here runs.
const EDITIONS = { sabs: './sabs/edition.js' };
let edition = null;
let bundle = null;
const app = document.getElementById('app');

// ---------- helpers ----------
const L = (id) => t('letter.' + id);
const qText = (q) => (q.startsWith('q.') ? t(q) : q);
const today = () => dayString(new Date());
const maxSources = () => (S.exp.size === 'big' && featureOn(S.progress, 'layer') ? MAX_SOURCES : 1);
const kindLabel = (k) => t('kind.' + k);
const sourceLabel = (s) => (s.family === 'personal' ? (s.text || (s.id ? t('item.' + s.id) : kindLabel(s.k))) : s.label);
const button = (label, on, cls = '', extra = {}) => el('button', { type: 'button', class: 'btn ' + cls, on: { click: on }, ...extra }, label);
const hueOf = (l) => (letterById(l) || letterById('love')).hue;
async function setLang(l) {
  tables = await loadTables(l, loadJSON);
  S.lang = l; t = makeTranslator(l, tables); store.setLang(l);
  if (edition) t = edition.wrapT(t, l);
  document.documentElement.lang = l; document.documentElement.dir = dirOf(l, tables);
  document.title = t('app.title');
  render();
}
function saveLib() { store.setLibrary(S.lib); }
function focusMain() { const h = app.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } window.scrollTo(0, 0); }
function say(msg) { const live = document.getElementById('live'); if (live) { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 30); } }

// ---------- one result shape for both kinds of experiment ----------
// item = { kind: 'free', exp } | { kind: 'tpl', payload }
const itemOf = (entry) => (entry.tpl ? { kind: 'tpl', payload: entry.tpl } : { kind: 'free', exp: entry.exp });
function resultOf(item) {
  if (item.kind === 'free') {
    const r = run(item.exp), src = item.exp.sources[0];
    const w = src && (src.k === 'movie' || src.k === 'song') ? catalogItem(src.k, src.id) : null;
    return {
      ...r, harmony: r.chords.join('–'), title: qText(item.exp.q), tense: item.exp.sound.tense, culture: null, gen: item.exp.gen, parent: item.exp.parent,
      sourceKind: src ? src.k : 'other', work: w, questionId: item.exp.q,
      sourceText: r.sources.map((s) => `${kindLabel(s.k)} — ${sourceLabel(s)}`).join(' + '),
      card: (id) => toCard(item.exp, r, id, t),
    };
  }
  const p = item.payload, tpl = bundle.byId.get(p.t);
  const { outputs } = runUpTo(tpl, p.w, bundle, p.u);
  const sum = summarize(tpl, outputs, p.w, bundle);
  const res = playable(sum.sequence, sum.letters);
  const filmStage = tpl.stages.find((s) => s.widget.type === 'catalog-picker' && s.widget.catalog === 'films' && p.w[s.id]);
  const film = filmStage ? bundle.ctx.films.themes.find((f) => f.id === p.w[filmStage.id]) : null;
  return {
    ...res, letters: sum.letters, chords: sum.chords, harmony: sum.harmony, credits: sum.credits, title: tpl.title, tense: sum.tense, culture: sum.culture,
    gen: p.gen, parent: p.parent, sourceKind: tpl.source.type, work: film ? { id: film.id, work: film.work, year: film.year, composer: film.composer } : null,
    questionId: tpl.id, sourceText: tpl.source.label, template: tpl,
    card: (id) => toTemplateCard(tpl, p, sum, res, id, t),
  };
}
/** the payload that goes into a link (#x=): typed words only if a 13+ person chose to include them. */
function linkPayloadCode(item) {
  if (item.kind === 'free') return encode(linkCopy(item.exp, { includeText: S.pubText && S.age === 'yes' }));
  return encodePayload(item.payload);
}
/** gift-og share-state v1 (state/gift/viral/SHARE-STATE.md): enumerated choices only. */
function ogStateFor(R) {
  const st = { v: 1, k: R.parent ? 'gift' : 'mine', l: R.letters[0], lang: S.lang, g: R.gen || 0 };
  if (R.tense && R.tense !== 'is') st.t = R.tense;
  if (R.culture) st.c = R.culture;
  return ogSanitize(st);
}
function linkFor(item, R) {
  const base = location.href.split('#')[0].split('?')[0];
  return `${base}?s=${ogEncode(ogStateFor(R))}&lang=${S.lang}#x=${linkPayloadCode(item)}`;
}
const ogImage = (letter, lang = S.lang) => `og/${LANGS.some((l) => l.code === lang) ? lang : 'en'}/${LETTER_IDS.includes(letter) || letter === 're_love' ? letter : 'love'}.webp`;
const entryId = (item) => (item.kind === 'free' ? experimentId(item.exp) : payloadId(item.payload));

// ---------- chrome ----------
function header() {
  return el('header', { class: 'top' },
    el('button', { type: 'button', class: 'mark', on: { click: goHome }, 'aria-label': t('nav.home') }, el('span', { class: 'mark-dot', 'aria-hidden': 'true' }), t('nav.home')),
    el('div', { class: 'top-r' },
      S.age ? el('label', { class: 'sr', for: 'lang' }, t('nav.lang')) : null,
      S.age ? el('select', { id: 'lang', class: 'lang', on: { change: (e) => setLang(e.target.value) } },
        LANGS.map((l) => el('option', { value: l.code, selected: l.code === S.lang, lang: l.code }, l.name))) : null,
      el('button', { type: 'button', class: 'link', on: { click: openKnows } }, t('nav.knows')),
      el('button', { type: 'button', class: 'breath-btn', on: { click: () => { player.stop(); S.breath = true; render(); } } }, t('nav.breath'))));
}
function footer() {
  return el('footer', { class: 'foot' },
    needsReview(S.lang, tables) ? el('p', { class: 'review' }, t('i18n.review')) : null,
    el('p', null, t('app.framing')),
    el('p', { class: 'mute' }, t('app.credits')));
}

// ---------- the opening (language + age gate, as gestures) ----------
// Tap the word for love in your language = choose the language. Hold the beating heart = "I'm 13
// or older" (Enter/Space or a screen reader's activation also answers yes; nothing is pre-chosen).
// "I'd rather not say" stays one tap away. Then straight into the flagship experiment.
const FLAGSHIP = 'movies-chords-emotions-notes';
const langHue = (code) => Math.round((Math.max(0, S.openWords.findIndex((w) => w.code === code)) * 360) / Math.max(1, S.openWords.length) + 340) % 360;
let holdT = null, beatT = null;
function holdEnd(e) {
  clearTimeout(holdT); clearInterval(beatT); holdT = beatT = null;
  const b = e && e.currentTarget; if (b && b.classList) b.classList.remove('holding');
}
function holdStart(e) {
  if (S.age || holdT) return;
  e.currentTarget.classList.add('holding');
  player.heart(0.8); field.setBpm(92);
  beatT = setInterval(() => player.heart(0.95), 650);
  holdT = setTimeout(() => ageAnswer('yes'), 1100);
}
function ageAnswer(a) {
  if (S.age) return;
  holdEnd(); field.setBpm(66);
  S.age = a; store.setAge(a);
  const hue = S.openHue ?? hueOf('love');
  field.burst(undefined, undefined, hue, a === 'yes' ? 1.6 : 0.8);
  // love called and answered (D -> G, re-love), our own synth
  player.bell(74, 0.09); setTimeout(() => player.bell(67, 0.08), 420);
  setTimeout(() => {
    if (['shared', 'gift', 'apishare'].includes(S.view)) { render(); focusMain(); return; }
    startTemplate(FLAGSHIP);
  }, 650);
}
function pickWord(e, w) {
  S.openHue = langHue(w.code);
  field.setPalette([S.openHue, hueOf('love'), S.openHue]);
  field.burst(e.clientX, e.clientY, S.openHue, 0.9);
  player.bell(74, 0.07);
  setLang(w.code);
}
function viewOpening() {
  const heartBtn = el('button', {
    type: 'button', class: 'heart-btn', 'data-heart': '1', 'aria-label': t('age.yes'), 'aria-describedby': 'hold-hint',
    on: {
      pointerdown: holdStart, pointerup: holdEnd, pointerleave: holdEnd, pointercancel: holdEnd,
      contextmenu: (e) => e.preventDefault(),
      click: (e) => { if (e.detail === 0) ageAnswer('yes'); }, // keyboard / assistive tech
    },
  }, el('span', { class: 'heart-ring', 'aria-hidden': 'true' }), el('span', { class: 'heart-core', 'aria-hidden': 'true' }, '♥'));
  return el('section', { class: 'opening' },
    el('h1', { class: 'open-title' }, t('app.title')),
    el('p', { class: 'open-tap' }, t('open.tap')),
    el('ul', { class: 'words', role: 'radiogroup', 'aria-label': t('nav.lang') }, S.openWords.map((w, i) => el('li', null,
      el('button', { type: 'button', role: 'radio', 'aria-checked': String(w.code === S.lang), class: 'word' + (w.code === S.lang ? ' on' : ''), lang: w.code, dir: w.dir, 'data-lang': w.code, title: w.name, style: { '--i': i }, on: { click: (e) => pickWord(e, w) } }, w.love)))),
    el('div', { class: 'heart-wrap' }, heartBtn),
    el('p', { class: 'open-q' }, t('age.q')),
    el('p', { id: 'hold-hint', class: 'open-hint' }, t('open.hold')),
    el('div', { class: 'row center' }, button(t('age.skip'), () => ageAnswer('skip'), 'ghost skip-btn')));
}

// ---------- breath (the Disconnect) ----------
function viewBreath() {
  return el('section', { class: 'breath' },
    el('h1', null, t('breath.t')),
    el('p', null, t('breath.s')),
    button(t('breath.back'), () => { S.breath = false; render(); }, 'pri'));
}

// ---------- home: progress, the template picker, your library ----------
function lettersStrip() {
  const found = new Set(S.progress.letters);
  return el('div', { class: 'letters', role: 'list', 'aria-label': t('prog.letters', { n: found.size }) },
    LETTERS.map((l) => el('span', { role: 'listitem', class: 'ldot' + (found.has(l.id) ? ' on' : ''), style: { '--h': l.hue }, title: found.has(l.id) ? L(l.id) : '?' },
      el('span', { class: 'sr' }, found.has(l.id) ? L(l.id) : '?'))));
}
function progressBox() {
  const p = S.progress, streak = currentStreak(p, today());
  const lp = libraryProgress(S.done, bundle);
  return el('section', { class: 'progress', 'aria-label': t('prog.disc', { n: p.discoveries }) },
    lettersStrip(),
    el('p', { class: 'prog-line' },
      el('span', null, p.letters.length === 15 ? t('prog.alphabet') : t('prog.letters', { n: p.letters.length })),
      el('span', { class: 'sep' }, ' · '),
      el('span', null, t('tpl.done', { n: lp.completed.length, total: bundle.library.templates.length })),
      el('span', { class: 'sep' }, ' · '),
      el('span', null, streak ? t('prog.streak', { n: streak }) : t('prog.streak0'))),
    el('ol', { class: 'rings', 'aria-label': t('tpl.ring') }, lp.rings.map((r) => el('li', { class: r.open ? 'open' : '' }, r.name))),
    lp.next ? el('p', { class: 'mute small' }, t('tpl.nextring', { promise: lp.next.promise })) : null);
}
const ringOf = (tpl) => (tpl.unlockRule.ring || (tpl.unlockRule.always ? 'spark' : null));
function templateCard(tpl, open, done) {
  const ring = ringOf(tpl);
  const ringName = (bundle.progression.rings.find((r) => r.id === ring) || {}).name;
  return el('li', { class: 'tcard' + (tpl.flagship ? ' flag' : '') + (open ? '' : ' locked') + (done ? ' done' : ''), style: { '--h': hueOf(tpl.letters[0]) } },
    el('button', { type: 'button', class: 'tcard-b', disabled: !open, 'data-template': tpl.id, on: { click: () => startTemplate(tpl.id) } },
      tpl.flagship ? el('span', { class: 'kicker' }, t('tpl.flagship')) : null,
      el('strong', { class: 'tcard-t', lang: 'en' }, tpl.title),
      el('span', { class: 'tcard-q', lang: 'en' }, tpl.question),
      el('span', { class: 'tcard-m' },
        el('span', { class: 'mini-dots', 'aria-hidden': 'true' }, tpl.letters.map((l) => el('span', { class: 'ldot on', style: { '--h': hueOf(l) } }))),
        `${t('tpl.depth', { n: tpl.depth })} · ${t('tpl.minutes', { n: tpl.minutes })}${done ? ' · ✓' : ''}`),
      tpl.care && tpl.care.sensitive ? el('span', { class: 'mute small' }, t('tpl.care')) : null,
      open ? null : el('span', { class: 'lock small' }, t('tpl.locked', { ring: ringName || ring || '…' }))));
}
function templatePicker() {
  const lp = libraryProgress(S.done, bundle);
  const avail = new Set(lp.available), done = new Set(lp.completed);
  const f = S.tplFilter;
  const list = bundle.library.templates.filter((x) => f === 'all' || (f === 'quick' && x.depth === 1) || (f === 'deep' && x.depth >= 2) || (f === 'open' && avail.has(x.id)))
    .sort((a, b) => (b.flagship - a.flagship) || (avail.has(b.id) - avail.has(a.id)) || (a.depth - b.depth));
  return el('section', { class: 'picker-t', 'aria-labelledby': 'tpl-h' },
    el('h2', { id: 'tpl-h' }, t('tpl.title')),
    el('p', { class: 'mute' }, t('tpl.sub')),
    S.lang !== 'en' ? el('p', { class: 'mute small' }, t('tpl.english')) : null,
    el('div', { class: 'chips', role: 'radiogroup', 'aria-label': t('tpl.title') }, ['all', 'open', 'quick', 'deep'].map((k) =>
      el('button', { type: 'button', role: 'radio', 'aria-checked': String(f === k), class: 'chip' + (f === k ? ' on' : ''), on: { click: () => { S.tplFilter = k; render(); } } }, t('tpl.filter.' + k)))),
    el('p', { class: 'mute small' }, t('tpl.count', { n: list.length })),
    el('ul', { class: 'tgrid' },
      el('li', { class: 'tcard own' }, el('button', { type: 'button', class: 'tcard-b', on: { click: () => startNew() } },
        el('strong', { class: 'tcard-t' }, t('tpl.own')), el('span', { class: 'tcard-q' }, t('tpl.own.sub')))),
      list.map((x) => templateCard(x, avail.has(x.id), done.has(x.id)))));
}
function miniCard(entry, origin) {
  const item = itemOf(entry), R = resultOf(item);
  return el('li', { class: 'mini' },
    el('div', { class: 'mini-dots', 'aria-hidden': 'true' }, R.letters.map((l) => el('span', { class: 'ldot on', style: { '--h': hueOf(l) } }))),
    el('div', { class: 'mini-t' },
      el('strong', null, R.title),
      el('span', { class: 'mute small' }, R.letters.map(L).join(' · ') + ' — ' + R.harmony)),
    el('div', { class: 'row' },
      button(t('btn.play'), () => player.play(R), 'sm'),
      button(t('btn.open'), () => openEntry(entry, origin), 'sm'),
      origin === 'shared' ? button(t('btn.remix'), () => startRemixItem(item, entry.id), 'sm') : null,
      button(t('btn.delete'), () => { S.lib[origin] = S.lib[origin].filter((e) => e.id !== entry.id); saveLib(); render(); }, 'sm ghost')));
}
function viewHome() {
  const tabs = ['mine', 'shared'];
  const list = S.lib[S.libTab].filter((e) => !e.tpl || bundle.byId.has(e.tpl.t));
  return el('div', { class: 'home' },
    el('section', { class: 'hero' },
      el('h1', null, t('app.title')),
      el('p', { class: 'lead' }, t('app.sub'))),
    progressBox(),
    templatePicker(),
    el('section', { class: 'lib' },
      el('div', { class: 'tabs', role: 'tablist' }, tabs.map((k) => el('button', { type: 'button', role: 'tab', 'aria-selected': String(S.libTab === k), on: { click: () => { S.libTab = k; render(); } } }, t('home.' + k) + ` (${S.lib[k].length})`))),
      list.length ? el('ul', { class: 'minis', role: 'tabpanel' }, list.map((e) => miniCard(e, S.libTab))) : el('p', { class: 'mute', role: 'tabpanel' }, t('home.empty.' + S.libTab))));
}

// ---------- free-form builder ----------
function startNew(o = {}, stage = 0) {
  player.stop();
  S.exp = newExperiment(o); S.stage = stage; S.view = 'build'; S.pendingKind = null; S.recorded = null; S.depth = 0; S.apiStatus = null; S.toast = [];
  clearHash(); render(); focusMain();
}
function startRemix(exp, parentId) {
  player.stop();
  S.exp = remixOf(exp, parentId); S.stage = 1; S.view = 'build'; S.pendingKind = null; S.recorded = null; S.depth = 0; S.apiStatus = null; S.toast = [];
  clearHash(); render(); focusMain();
}
function startRemixItem(item, parentId) {
  if (item.kind === 'free') return startRemix(item.exp, parentId);
  return startTemplate(item.payload.t, { w: item.payload.w, gen: Math.min(99, item.payload.gen + 1), parent: parentId });
}
function openEntry(entry, origin) {
  const item = itemOf(entry);
  if (origin === 'shared') { S.shared = item; S.sharedId = entry.id; S.view = 'shared'; S.depth = 0; render(); focusMain(); return; }
  player.stop(); S.depth = 0; S.apiStatus = null; S.toast = [];
  if (item.kind === 'tpl') { S.tpl = { ...item.payload }; S.view = 'tpl'; S.tStage = tplStages().length - 1; S.recorded = entry.id; render(); focusMain(); return; }
  S.exp = item.exp; S.view = 'build'; S.stage = stagesFor(S.exp).indexOf('result'); S.recorded = entry.id;
  render(); focusMain();
}
function goHome() { player.stop(); S.view = 'home'; S.breath = false; clearHash(); render(); focusMain(); }
function update(patch) { S.exp = normalizeExperiment({ ...S.exp, ...patch }, { allowEmptySources: true }); render(); }

function stageValid(name) {
  if (name === 'source') return S.exp.sources.length > 0;
  if (name === 'emotions') return S.exp.letters.length > 0 || run(S.exp).letters.length > 0;
  return true;
}
function rail(stages) {
  return el('ol', { class: 'rail', 'aria-label': t('stage.of', { i: S.stage + 1, n: stages.length }) },
    stages.map((s, i) => el('li', { class: i === S.stage ? 'now' : i < S.stage ? 'done' : '', 'aria-current': i === S.stage ? 'step' : null },
      i < S.stage ? el('button', { type: 'button', class: 'rail-b', on: { click: () => { S.stage = i; render(); focusMain(); } } }, t('stage.' + s)) : el('span', null, t('stage.' + s)))));
}
function navRow(stages) {
  const name = stages[S.stage];
  if (name === 'result') return null;
  const next = stages[S.stage + 1];
  const ok = stageValid(name);
  return el('div', { class: 'nav' },
    S.stage > 0 ? button(t('btn.back'), () => { player.stop(); S.stage--; render(); focusMain(); }) : button(t('btn.back'), goHome),
    el('span', { class: 'mute small' }, ok ? '' : t(name === 'source' ? 'source.need' : 'emotions.need')),
    button(next === 'result' ? t('btn.finish') : t('btn.next'), () => { if (!ok) return; player.stop(); S.stage++; render(); focusMain(); }, 'pri', { disabled: !ok }));
}

function stageQuestion() {
  const custom = !QUESTIONS.includes(S.exp.q);
  return el('div', { class: 'stage' },
    el('h2', null, t('question.lead')),
    el('div', { class: 'chips', role: 'radiogroup', 'aria-label': t('stage.question') }, QUESTIONS.map((q) =>
      el('button', { type: 'button', role: 'radio', 'aria-checked': String(S.exp.q === q), class: 'chip' + (S.exp.q === q ? ' on' : ''), on: { click: () => update({ q }) } }, t(q)))),
    el('label', { class: 'field' }, el('span', null, t('question.custom')),
      el('input', { type: 'text', maxlength: String(MAX_QUESTION), value: custom ? S.exp.q : '', dir: 'auto', on: { change: (e) => { const v = cleanText(e.target.value, MAX_QUESTION); if (v && !looksPersonal(v)) update({ q: v }); } } })),
    el('h3', null, t('question.size')),
    el('div', { class: 'sizes', role: 'radiogroup', 'aria-label': t('question.size') }, ['small', 'big'].map((sz) =>
      el('button', { type: 'button', role: 'radio', 'aria-checked': String(S.exp.size === sz), class: 'size' + (S.exp.size === sz ? ' on' : ''), on: { click: () => update({ size: sz }) } }, t('size.' + sz)))));
}

function kindGrid() {
  return el('div', { class: 'kinds' }, SOURCE_KINDS.map((k) => {
    const open = isUnlocked(S.progress, k.id);
    return el('button', { type: 'button', class: 'kind' + (S.pendingKind === k.id ? ' on' : '') + (open ? '' : ' locked'), disabled: !open, 'aria-pressed': String(S.pendingKind === k.id),
      on: { click: () => { S.pendingKind = k.id; render(); const f = app.querySelector('.picker input, .picker button'); if (f) f.focus(); } } },
    el('span', { class: 'glyph', 'aria-hidden': 'true' }, k.glyph),
    el('span', null, kindLabel(k.id)),
    open ? null : el('span', { class: 'lock small' }, t('source.locked', { n: k.unlock })));
  }));
}
function addSource(src) {
  const sources = [...S.exp.sources, src].slice(-maxSources());
  S.pendingKind = null;
  update({ sources, letters: [] });
}
function picker() {
  const k = kindById(S.pendingKind);
  if (!k) return null;
  const rows = itemsFor(k.id);
  if (rows) {
    return el('div', { class: 'picker' }, el('p', { class: 'kicker' }, t('source.pickitem')),
      el('ul', { class: 'items' }, rows.map((r) => el('li', null, el('button', { type: 'button', class: 'item', on: { click: () => addSource({ k: k.id, id: r.id }) } },
        el('strong', null, r.title || r.tradition),
        el('span', { class: 'mute small' }, r.composer ? `${r.work !== r.title ? r.work + ' · ' : ''}${r.composer} · ${r.year}` : `${r.region} · ${r.language}`))))));
  }
  if (k.items) {
    return el('div', { class: 'picker' }, el('p', { class: 'kicker' }, t('source.pickitem')),
      el('div', { class: 'chips' }, Object.keys(k.items).map((id) => button(t('item.' + id), () => addSource({ k: k.id, id }), 'chip'))));
  }
  let warn = null;
  const input = el('input', { type: 'text', maxlength: '60', dir: 'auto', 'aria-describedby': 'src-hint', placeholder: kindLabel(k.id) });
  const go = () => {
    const v = cleanText(input.value);
    if (v && looksPersonal(v)) { warn.textContent = t('share.pub.blocked'); return; }
    addSource(v ? { k: k.id, text: v } : { k: k.id });
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  return el('div', { class: 'picker' },
    el('label', { class: 'field' }, el('span', null, t('source.text')), input),
    el('p', { id: 'src-hint', class: 'mute small' }, t('source.text.hint')),
    (warn = el('p', { class: 'warn small', role: 'alert' })),
    button(t('btn.next'), go, 'pri'));
}
function stageSource() {
  const r = run(S.exp);
  const canAdd = S.exp.sources.length < maxSources();
  return el('div', { class: 'stage' },
    el('h2', null, t('source.lead')),
    el('p', { class: 'mute' }, qText(S.exp.q)),
    r.sources.length ? el('ul', { class: 'chosen' }, r.sources.map((s, i) => el('li', null,
      el('span', { class: 'glyph', 'aria-hidden': 'true' }, s.glyph), el('span', null, `${kindLabel(s.k)} — ${sourceLabel(s)}`),
      button(t('source.remove'), () => update({ sources: S.exp.sources.filter((_, j) => j !== i), letters: [] }), 'sm ghost')))) : null,
    canAdd || !S.exp.sources.length ? kindGrid() : (S.exp.size === 'big' && !featureOn(S.progress, 'layer') ? el('p', { class: 'mute small' }, t('prog.next', { n: FEATURE_UNLOCKS.layer - S.progress.discoveries, what: t('unlock.layer') })) : null),
    picker(),
    notebook(t('stage.source'), (rr) => rr.sourceText));
}

function stageChords() {
  const r = run(S.exp);
  const harmonic = r.sources.filter((s) => s.attribution);
  return el('div', { class: 'stage' },
    el('h2', null, t('chords.lead')),
    el('div', { class: 'chordrow' }, r.chords.map((c) => el('button', { type: 'button', class: 'chord', on: { click: () => player.chord(c) } }, c.replace(/1$/, '')))),
    el('p', { class: 'mute small' }, t('chords.tap')),
    harmonic.length ? el('div', { class: 'attr' }, el('p', { class: 'kicker' }, t('chords.attr')),
      el('ul', null, harmonic.map((s) => el('li', null, s.attribution, el('span', { class: 'conf' }, ' · ' + t('chords.conf', { c: t('conf.' + s.confidence) })))))) : el('p', null, t('chords.fromletters')),
    el('p', { class: 'note' }, t('chords.note')),
    notebook(t('stage.chords'), (rr) => rr.harmony));
}

function stageEmotions() {
  const r = run(S.exp);
  const chosen = new Set(S.exp.letters.length ? S.exp.letters : []);
  const guess = new Set(r.suggested);
  const shareOf = Object.fromEntries(r.fan.map((f) => [f.id, f.share]));
  const toggle = (id) => {
    const cur = S.exp.letters.length ? S.exp.letters.slice() : [];
    const i = cur.indexOf(id);
    if (i >= 0) cur.splice(i, 1); else if (cur.length < MAX_LETTERS) cur.push(id); else { cur.shift(); cur.push(id); }
    update({ letters: cur });
  };
  return el('div', { class: 'stage' },
    el('h2', null, t('emotions.lead')),
    el('p', { class: 'mute' }, t('emotions.guess') + ' ' + t('emotions.pick', { n: MAX_LETTERS })),
    el('div', { class: 'fan', role: 'group', 'aria-label': t('stage.emotions') }, LETTERS.map((l) => {
      const on = chosen.has(l.id), g = !chosen.size && guess.has(l.id);
      return el('button', { type: 'button', class: 'tile' + (on ? ' on' : '') + (g ? ' guess' : ''), 'aria-pressed': String(on), style: { '--h': l.hue, '--w': Math.min(100, Math.round((shareOf[l.id] || 0) * 400)) + '%' }, on: { click: () => toggle(l.id) } },
        el('span', { class: 'tile-n' }, L(l.id)),
        el('span', { class: 'tile-bar', 'aria-hidden': 'true' }));
    })),
    notebook(t('stage.emotions'), (rr) => rr.letters.map(L).join(' · ')));
}

function roll(r, big) {
  const W = 640, H = big ? 220 : 150;
  const phrase = r.notes;
  const tMax = Math.max(1, r.beats);
  const ms = phrase.filter((n) => n.part !== 'hum').map((n) => n.m);
  const lo = Math.min(...ms) - 2, hi = Math.max(...ms) + 2;
  const y = (m) => H - 12 - ((Math.max(lo, Math.min(hi, m)) - lo) / Math.max(1, hi - lo)) * (H - 24);
  return svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'roll', role: 'img', 'aria-label': `${phrase.filter((n) => n.part !== 'hum').length} notes, ${r.seconds} s` },
    phrase.map((n, i) => {
      const x = 8 + (n.t / tMax) * (W - 16), w = Math.max(6, (n.d / tMax) * (W - 16) - 3);
      if (n.part === 'hum') return svg('rect', { x, y: H - 8, width: w, height: 4, rx: 2, class: 'hum' });
      const hue = n.letter ? letterById(n.letter).hue : 48;
      return svg('rect', { x, y: y(n.m) - 5, width: w, height: 10, rx: 5, class: 'n' + (n.part !== 'phrase' ? ' call' : '') + (S.nowPlaying === i ? ' lit' : ''), 'data-i': i, style: { '--h': hue } });
    }));
}
function playBtn(r) {
  return button(player.playing ? t('btn.stop') : t('btn.play') + ` · ${r.seconds}s`, () => {
    if (player.playing) { player.stop(); S.nowPlaying = -1; render(); return; }
    player.play(r, {
      onNote: (i) => { app.querySelectorAll('.roll .lit').forEach((n) => n.classList.remove('lit')); const n = app.querySelector(`.roll [data-i="${i}"]`); if (n) n.classList.add('lit'); },
      onEnd: () => { S.nowPlaying = -1; render(); },
    });
    render();
  }, 'pri play');
}
function stageNotes() {
  const r = run(S.exp);
  return el('div', { class: 'stage' },
    el('h2', null, t('notes.lead')),
    roll(r, true),
    el('div', { class: 'row' }, playBtn(r)),
    el('p', { class: 'note' }, t('notes.note')),
    r.sound.relove ? el('p', { class: 'mute small' }, t('notes.relove')) : null,
    notebook(t('stage.notes'), (rr) => `${rr.notes.filter((n) => n.part !== 'hum').length} · ${rr.seconds}s`));
}

function stageSound() {
  const r = run(S.exp), snd = S.exp.sound, more = featureOn(S.progress, 'tense');
  const set = (patch) => update({ sound: { ...snd, ...patch } });
  const radio = (label, opts, cur, key, lockedFrom) => el('fieldset', { class: 'fs' }, el('legend', null, label),
    el('div', { class: 'chips' }, opts.map((o, i) => {
      const locked = !more && i >= lockedFrom;
      return el('button', { type: 'button', role: 'radio', 'aria-checked': String(cur === o), disabled: locked, class: 'chip' + (cur === o ? ' on' : '') + (locked ? ' locked' : ''), on: { click: () => set({ [key]: o }) } }, t((key === 'tb' ? 'tb.' : 'tense.') + o));
    })));
  return el('div', { class: 'stage' },
    el('h2', null, t('sound.lead')),
    roll(r, false),
    el('div', { class: 'row' }, playBtn(r)),
    radio(t('sound.timbre'), TIMBRES, snd.tb, 'tb', 2),
    S.exp.size === 'big' ? radio(t('sound.tense'), TENSES, snd.tense, 'tense', 99) : null,
    S.exp.size === 'big' && !more ? el('p', { class: 'mute small' }, t('sound.locked', { n: FEATURE_UNLOCKS.tense })) : null,
    el('label', { class: 'field' }, el('span', null, `${t('sound.tempo')} · ${snd.bpm}`),
      el('input', { type: 'range', min: '48', max: '140', step: '1', value: String(snd.bpm), on: { change: (e) => set({ bpm: Number(e.target.value) }) } })),
    el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: snd.relove, on: { change: (e) => set({ relove: e.target.checked }) } }), t('sound.relove')),
    el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: snd.hum, on: { change: (e) => set({ hum: e.target.checked }) } }), t('sound.hum')),
    notebook(t('stage.sound'), (rr) => `${t('tb.' + rr.sound.tb)} · ${rr.sound.bpm} bpm · ${t('tense.' + rr.sound.tense)}`));
}


// the notebook: at every stage, this stage's data across your experiments and the ones shared with you
function notebook(stage, fmt) {
  const usable = (list) => list.filter((e) => !e.tpl || bundle.byId.has(e.tpl.t)).slice(0, 12);
  const rows = (list) => usable(list).map((e) => {
    const R = resultOf(itemOf(e));
    return el('tr', null, el('th', { scope: 'row' }, R.title), el('td', null, fmt(R)));
  });
  const table = (k) => el('div', { class: 'nb-part' }, el('p', { class: 'kicker' }, t('notebook.' + k) + ` (${S.lib[k].length})`),
    S.lib[k].length ? el('table', { class: 'nb' }, el('tbody', null, rows(S.lib[k]))) : el('p', { class: 'mute small' }, t('notebook.empty')));
  return el('details', { class: 'notebook' }, el('summary', null, `${t('notebook.title')} — ${stage}`), table('mine'), table('shared'));
}

// ---------- template experiments (state/gift/experiments) ----------
function startTemplate(id, o = {}) {
  const tpl = bundle.byId.get(id);
  if (!tpl) return;
  player.stop();
  const u = libraryProgress(S.done, bundle).unlockedStages;
  S.tpl = templatePayload(id, cleanWidgets(tpl, o.w || {}, bundle), u, o.gen || 0, o.parent);
  S.view = 'tpl'; S.tStage = 0; S.recorded = null; S.depth = 0; S.apiStatus = null; S.toast = [];
  clearHash(); render(); focusMain();
}
const curTemplate = () => bundle.byId.get(S.tpl.t);
/** the stages this run shows: active stages, then the result. */
const tplStages = () => [...curTemplate().stages.filter((s) => stageActive(s, S.tpl.u)), { id: '__result' }];
function setWidget(stageId, value) {
  const tpl = curTemplate();
  const w = { ...S.tpl.w, [stageId]: value };
  // answers after a changed stage may depend on it (vocab depends on the culture): keep only valid ones
  S.tpl = { ...S.tpl, w: cleanWidgets(tpl, w, bundle) };
  render();
}

// every stage sounds: its output, voiced on the studio's synth, while the field follows the level
const topLetters = (v, n = 3) => LETTER_IDS.map((l) => [l, v[l] || 0]).filter(([, x]) => x > 0).sort((a, b) => b[1] - a[1]).slice(0, n).map(([l]) => l);
function sonify(stage, out, letters) {
  if (!stage || out === undefined || out === null) return;
  const ty = outputType(stage);
  if (ty === 'progression') player.chords(out.chords);
  else if (ty === 'emotion') player.chords(topLetters(out, 2).flatMap((l) => letterById(l).home.slice(0, 2)));
  else if (ty === 'noteSet') player.play({ notes: out.pcs.map((pc, i) => ({ m: 62 + ((pc - 2 + 12) % 12), t: i * 0.5, d: 0.9, v: 0.7, part: 'phrase', letter: letters[0] })), beats: out.pcs.length * 0.5 + 1, seconds: 3, sound: { bpm: 96, tb: 'bell', tense: 'is' } });
  else if (ty === 'sequence') player.play(playable(out, letters));
}
function huesOf(letters) { return letters.flatMap((l, i) => Array(3 - Math.min(2, i)).fill(hueOf(l))); }
/** the current template run's colours: its latest feeling, else the film's catalogued letters */
function tplLetters() {
  const tpl = curTemplate(), { outputs } = runUpTo(tpl, S.tpl.w, bundle, S.tpl.u);
  let emo = null;
  for (const s2 of tpl.stages) if (outputs[s2.id] && outputType(s2) === 'emotion') emo = outputs[s2.id];
  if (emo) return topLetters(emo);
  const fs = tpl.stages.find((s2) => s2.widget.catalog === 'films' && S.tpl.w[s2.id]);
  const film = fs && bundle.ctx.films.themes.find((f) => f.id === S.tpl.w[fs.id]);
  return film ? film.letters : [];
}
function tapFeedback(e, stage) {
  const { outputs } = runUpTo(curTemplate(), S.tpl.w, bundle, S.tpl.u);
  const letters = tplLetters();
  if (e && e.clientX) field.burst(e.clientX, e.clientY, hueOf(letters[0] || 'love'), 0.8);
  sonify(stage, outputs[stage.id], letters);
}
/** the share-card reveal: the field gathers into the ring of 12 notes, bursts, the sound plays */
function revealNow() {
  const item = currentItem(); if (!item) return;
  const R = resultOf(item);
  S.revealN++;
  field.setShape('ring');
  field.setPalette(huesOf(R.letters));
  setTimeout(() => field.burst(undefined, undefined, hueOf(R.letters[0]), 1.5), 380);
  if (R.sound && R.sound.bpm) field.setBpm(R.sound.bpm);
  player.play(R);
  render();
}
const currentItem = () => (S.view === 'tpl' && S.tpl ? { kind: 'tpl', payload: S.tpl } : S.view === 'build' && S.exp ? { kind: 'free', exp: S.exp } : S.view === 'shared' ? S.shared : null);

// one-tap remix: a new version at once (one answer turned to the next choice), revealed and playing
function variation(p) {
  const tpl = bundle.byId.get(p.t), w = { ...p.w };
  const turn = (st, ids) => { const i = ids.indexOf(w[st.id]); w[st.id] = ids[(i + 1) % ids.length]; };
  const open = (st) => stageActive(st, p.u);
  const choice = tpl.stages.find((st) => open(st) && st.widget.type === 'tap-choice');
  const tense = tpl.stages.find((st) => open(st) && st.widget.type === 'tense-picker');
  const pick = tpl.stages.find((st) => open(st) && st.widget.type === 'catalog-picker' && st.widget.catalog !== 'vocab');
  if (choice) turn(choice, choice.widget.options.map((o) => o.id));
  else if (tense) turn(tense, ['was', 'is', 'will']);
  else if (pick) turn(pick, widgetOptions(pick, bundle, w).map((o) => o.id));
  return cleanWidgets(tpl, w, bundle);
}
function remixNow(item, parentId) {
  player.stop();
  S.depth = 0; S.toast = []; S.apiStatus = null; S.recorded = null;
  if (item.kind === 'tpl') {
    const p = item.payload;
    S.tpl = templatePayload(p.t, variation(p), p.u, Math.min(99, (p.gen || 0) + 1), parentId);
    S.view = 'tpl'; S.tStage = tplStages().length - 1;
  } else {
    const e = remixOf(item.exp, parentId), order = ['was', 'is', 'will'];
    S.exp = normalizeExperiment({ ...e, sound: { ...e.sound, tense: order[(order.indexOf(e.sound.tense) + 1) % 3] } });
    S.view = 'build'; S.stage = stagesFor(S.exp).indexOf('result');
  }
  clearHash();
  revealNow(); focusMain();
}

function emotionBars(v) {
  const top = LETTER_IDS.map((l) => [l, v[l] || 0]).filter(([, x]) => x > 0).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = top.length ? top[0][1] : 1;
  return el('ul', { class: 'ebars' }, top.map(([l, x]) => el('li', { style: { '--h': hueOf(l), '--w': Math.round((x / max) * 100) + '%' } },
    el('span', { class: 'ebar-n' }, L(l)), el('span', { class: 'ebar', 'aria-hidden': 'true' }))));
}
function viz(stage, out) {
  if (out === undefined || out === null) return null;
  const ty = outputType(stage);
  const caption = stage.visualization.caption ? el('p', { class: 'mute small', lang: 'en' }, stage.visualization.caption) : null;
  if (ty === 'emotion') return el('div', { class: 'viz' }, emotionBars(out), caption);
  if (ty === 'progression') {
    return el('div', { class: 'viz' },
      el('div', { class: 'chordrow' }, out.chords.map((c) => el('button', { type: 'button', class: 'chord', on: { click: () => player.chord(c) } }, c))),
      out.credit ? el('p', { class: 'attr small' }, out.credit, out.confidence ? el('span', { class: 'conf' }, ' · ' + t('chords.conf', { c: t('conf.' + out.confidence) })) : null) : null,
      el('p', { class: 'note' }, t('chords.note')), caption);
  }
  if (ty === 'noteSet') {
    return el('div', { class: 'viz' }, el('div', { class: 'chips' }, out.names.map((n) => el('span', { class: 'chip on' }, n))),
      el('p', { class: 'mute small' }, `${out.tonic} ${out.mode}`), out.source && out.source.credit ? el('p', { class: 'attr small' }, out.source.credit) : null, caption);
  }
  if (ty === 'sequence') {
    const R = playable(out, resultOf({ kind: 'tpl', payload: S.tpl }).letters);
    return el('div', { class: 'viz' }, roll(R, true), el('div', { class: 'row' }, playBtn(R)), caption);
  }
  return null;
}
function widgetView(stage) {
  const w = stage.widget, val = S.tpl.w[stage.id];
  const opts = widgetOptions(stage, bundle, S.tpl.w);
  if (w.type === 'none') return null;
  if (w.type === 'tap-choice' || w.type === 'tense-picker' || (w.type === 'catalog-picker' && opts.length <= 16)) {
    return el('div', { class: 'chips opts', role: 'radiogroup', 'aria-label': stage.prompt }, opts.map((o) =>
      el('button', { type: 'button', role: 'radio', 'aria-checked': String(val === o.id), class: 'chip opt' + (val === o.id ? ' on' : ''), 'data-opt': o.id, lang: w.type === 'tense-picker' ? null : 'en', on: { click: (e) => { setWidget(stage.id, o.id); tapFeedback(e, stage); } } },
        w.type === 'tense-picker' ? t('tense.' + o.id) : o.label, o.sub ? el('span', { class: 'opt-sub' }, o.sub) : null)));
  }
  if (w.type === 'catalog-picker') {
    return el('label', { class: 'field' }, el('span', null, stage.prompt),
      el('select', { class: 'lang', 'data-catalog': w.catalog, on: { change: (e) => { setWidget(stage.id, e.target.value || undefined); tapFeedback(null, stage); } } },
        el('option', { value: '' }, '—'), opts.map((o) => el('option', { value: o.id, selected: val === o.id }, o.sub ? `${o.label} · ${o.sub}` : o.label))));
  }
  if (w.type === 'multi-choice') {
    const cur = new Set(Array.isArray(val) ? val : []);
    return el('div', { class: 'chips opts', role: 'group', 'aria-label': stage.prompt }, opts.map((o) =>
      el('button', { type: 'button', 'aria-pressed': String(cur.has(o.id)), class: 'chip opt' + (cur.has(o.id) ? ' on' : ''), lang: 'en', on: { click: () => { cur.has(o.id) ? cur.delete(o.id) : cur.add(o.id); setWidget(stage.id, [...cur]); } } }, o.label)));
  }
  if (w.type === 'slider-set') {
    const cur = val || {};
    return el('div', { class: 'sliders' }, el('p', { class: 'mute small' }, t('tpl.sliders.hint')), LETTER_IDS.map((l) =>
      el('label', { class: 'slider', style: { '--h': hueOf(l) } }, el('span', null, L(l)),
        el('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(cur[l] || 0), on: { change: (e) => setWidget(stage.id, { ...cur, [l]: Number(e.target.value) }) } }))));
  }
  if (w.type === 'color-picker') {
    const sw = ['#e0457b', '#f2a33a', '#f4d35e', '#5fb37f', '#3f88c5', '#7b5ea7', '#f6f1e7', '#2b2d42'];
    return el('div', { class: 'row' }, el('label', { class: 'sr', for: 'col-' + stage.id }, t('tpl.colour')),
      el('input', { id: 'col-' + stage.id, type: 'color', value: val || '#e0457b', on: { change: (e) => setWidget(stage.id, e.target.value) } }),
      sw.map((c) => el('button', { type: 'button', class: 'swatch' + (val === c ? ' on' : ''), 'aria-label': c, style: { background: c }, on: { click: () => setWidget(stage.id, c) } })));
  }
  if (w.type === 'tap-tempo') {
    const taps = Array.isArray(val) ? val : [];
    return el('div', { class: 'row' },
      button(t('tpl.taps'), () => { const now = Math.round(performance.now()); const base = S.tapBase && taps.length ? S.tapBase : (S.tapBase = now); setWidget(stage.id, [...taps, now - base].slice(-16)); }, 'pri big tap'),
      el('span', { class: 'mute small', role: 'status' }, t('tpl.tapsn', { n: taps.length })),
      taps.length ? button(t('tpl.reset'), () => { S.tapBase = null; setWidget(stage.id, undefined); }, 'sm ghost') : null);
  }
  return null;
}
function viewTemplate() {
  const tpl = curTemplate(), stages = tplStages();
  if (S.tStage >= stages.length) S.tStage = stages.length - 1;
  const st = stages[S.tStage];
  const { outputs, error } = runUpTo(tpl, S.tpl.w, bundle, S.tpl.u);
  const head = el('div', { class: 'tpl-head' }, el('p', { class: 'kicker' }, tpl.flagship ? t('tpl.flagship') : tpl.source.label),
    el('p', { class: 'mute', lang: 'en' }, tpl.question));
  const railEl = el('ol', { class: 'rail', 'aria-label': t('stage.of', { i: S.tStage + 1, n: stages.length }) }, stages.map((s, i) => el('li', { class: i === S.tStage ? 'now' : i < S.tStage ? 'done' : '', 'aria-current': i === S.tStage ? 'step' : null },
    i < S.tStage ? el('button', { type: 'button', class: 'rail-b', on: { click: () => { S.tStage = i; render(); } } }, String(i + 1)) : el('span', null, s.id === '__result' ? '♪' : String(i + 1)))));
  if (st.id === '__result') return el('div', { class: 'build tpl', 'data-template': tpl.id, 'data-stage': 'result' }, railEl, tplResult());
  const missing = needsAnswer(st, S.tpl.u) && !(st.id in S.tpl.w);
  const isLast = S.tStage === stages.length - 2;
  return el('div', { class: 'build tpl', 'data-template': tpl.id, 'data-stage': st.id },
    head, railEl,
    el('div', { class: 'stage' },
      st.bonus ? el('p', { class: 'kicker' }, `${t('tpl.bonus')} · ${(bundle.progression.bonus_stages.find((b) => b.id === st.bonus) || {}).name || st.bonus}`) : null,
      el('h2', { lang: 'en' }, st.prompt),
      st.why ? el('details', { class: 'why' }, el('summary', null, t('tpl.why')), el('p', { class: 'small', lang: 'en' }, st.why)) : null,
      widgetView(st),
      viz(st, outputs[st.id]),
      error && !missing ? el('p', { class: 'warn small' }, error) : null,
      notebook(t('stage.' + ({ emotion: 'emotions', progression: 'chords', noteSet: 'notes', sequence: 'sound' }[outputType(st)] || 'source')), (R) => `${R.letters.map(L).join(' · ')} — ${R.harmony}`)),
    el('div', { class: 'nav' },
      button(t('btn.back'), () => { player.stop(); if (S.tStage > 0) { S.tStage--; render(); focusMain(); } else goHome(); }),
      el('span', { class: 'mute small' }, missing ? t('tpl.choose') : ''),
      button(isLast ? t('btn.finish') : t('btn.next'), () => {
        if (missing) return; player.stop(); S.tStage++;
        const nx = tplStages()[S.tStage];
        if (nx.id === '__result') { revealNow(); focusMain(); return; }
        render(); focusMain();
        if (nx.widget.type === 'none') { const { outputs: o2 } = runUpTo(curTemplate(), S.tpl.w, bundle, S.tpl.u); sonify(nx, o2[nx.id], tplLetters()); }
      }, 'pri', { disabled: missing })));
}

// ---------- result (both kinds) ----------
async function recordResult(item) {
  const id = await entryId(item);
  if (S.recorded === id) return id;
  S.recorded = id;
  const entry = item.kind === 'free' ? { id, exp: item.exp, at: new Date().toISOString() } : { id, tpl: item.payload, at: new Date().toISOString() };
  S.lib.mine = upsert(S.lib.mine, entry);
  saveLib();
  const R = resultOf(item);
  const kinds = item.kind === 'free' ? item.exp.sources.map((s) => s.k) : (kindById(R.sourceKind) ? [R.sourceKind] : []);
  const out = recordCompletion(S.progress, { letters: R.letters, kinds, harmony: R.chords.join('-'), remix: !!R.parent }, today());
  S.progress = out.progress; store.setProgress(S.progress);
  let opened = { templates: [], stages: [], rings: [] };
  if (item.kind === 'tpl') { const c = completeTemplate(S.done, item.payload.t, bundle); S.done = c.state.completed; store.setTemplatesDone(S.done); opened = c.opened; }
  const ringName = (id2) => (bundle.progression.rings.find((r) => r.id === id2) || {}).name || id2;
  const stageName = (id2) => (bundle.progression.bonus_stages.find((b) => b.id === id2) || {}).name || id2;
  S.toast = [
    ...out.found.map((f) => f.type === 'letter' ? t('found.letter', { x: L(f.x) }) : f.type === 'kind' ? t('found.kind', { x: kindLabel(f.x) }) : t('found.harmony')),
    ...out.unlocked.map((u) => t('found.unlock', { x: u.type === 'kind' ? kindLabel(u.id) : t('unlock.' + u.id) })),
    ...opened.rings.map((r) => t('tpl.opened', { x: ringName(r) })),
    ...opened.stages.map((s) => t('tpl.opened', { x: stageName(s) })),
    ...(opened.templates.length ? [t('tpl.opened', { x: t('tpl.count', { n: opened.templates.length }) })] : []),
  ];
  if (S.toast.length) say(t('result.found') + ': ' + S.toast.join(', '));
  render();
  return id;
}
function cardView(item, id, mine = true) {
  const R = resultOf(item);
  const card = R.card(id || '000000000000');
  const ok = checkCard(card).ok;
  const depths = depthsOf(card);
  return el('article', { class: 'card reveal', 'data-valid': String(ok), 'data-gen': String(R.gen || 0), 'data-uid': card.uid, style: { '--h': hueOf(R.letters[0]) } },
    el('p', { class: 'kicker' }, R.parent ? t('shared.gen', { n: R.gen }) : mine ? t('reveal.k') : t('shared.k')),
    el('h2', { class: 'glance' }, R.letters.map(L).join(' · ')),
    el('p', { class: 'mute' }, R.title),
    el('figure', { class: 'ogcard' }, el('img', { src: ogImage(R.letters[0]), width: '1200', height: '630', alt: t('card.alt', { feeling: L(R.letters[0]) }), 'data-og': R.letters[0], decoding: 'async' })),
    roll(R, false),
    el('div', { class: 'row' }, playBtn(R)),
    el('ol', { class: 'depths' }, depths.slice(1, S.depth + 1).map((d, i) => el('li', { class: 'fk-in' }, el('p', { class: 'kicker' }, t('depth.' + (i + 1))), el('p', { class: 'pre' }, d)))),
    el('div', { class: 'row' },
      S.depth < 4 ? button(`${t('result.unfold')} · ${t('depth.' + (S.depth + 1))}`, () => { S.depth++; render(); }, 'ghost') : null,
      S.depth > 0 ? button(t('result.fold'), () => { S.depth = 0; render(); }, 'ghost') : null));
}
async function copyText(s) {
  try { await navigator.clipboard.writeText(s); return true; } catch { /* fall back */ }
  const ta = el('textarea', { style: { position: 'fixed', opacity: '0' } }); ta.value = s; document.body.appendChild(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; } ta.remove(); return ok;
}
function shareBox(item) {
  const R = resultOf(item);
  const hasText = item.kind === 'free' && hasTypedWords(item.exp);
  const link = () => linkFor(item, R);
  const status = el('span', { class: 'mute small', role: 'status' });
  const text = () => t('share.default', { feeling: L(R.letters[0]), url: link() });
  const saveImage = async () => {
    // the gift-og card for this letter, re-encoded as PNG on the device for the widest support
    const img = new Image(); img.src = ogImage(R.letters[0]); await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0);
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'love-sounds-like.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: t('share.title'), text: text() }); return; } catch { /* fall through */ } }
      const a = el('a', { href: URL.createObjectURL(blob), download: 'love-sounds-like.png' }); document.body.appendChild(a); a.click(); a.remove();
    }, 'image/png');
  };
  return el('section', { class: 'share', 'data-share-link': link() },
    el('h3', null, t('share.lead')),
    el('p', { class: 'mute small' }, t('share.hint')),
    hasText && S.age === 'yes' ? el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: S.pubText, on: { change: (e) => { S.pubText = e.target.checked; render(); } } }), t('share.pub')) : null,
    hasText && !(S.pubText && S.age === 'yes') ? el('p', { class: 'mute small' }, t('share.private', { kind: [!QUESTIONS.includes(item.exp.q) ? t(QUESTIONS[0]) : null, ...item.exp.sources.filter((s) => s.text).map((s) => kindLabel(s.k))].filter(Boolean).join(', ') })) : null,
    el('div', { class: 'row' },
      button(t('btn.copy'), async () => { status.textContent = (await copyText(link())) ? t('btn.copied') : link(); }, 'pri'),
      navigator.share ? button(t('btn.share'), async () => { try { await navigator.share({ title: t('share.title'), text: text() }); } catch { /* cancelled */ } }) : null,
      button(t('btn.image'), saveImage),
      status));
}

// open research, through the love data API (off by default; 13+ here, 16+ for the API, explicit yes)
function apiBox(item) {
  if (S.age !== 'yes') return el('p', { class: 'mute small' }, t('research.age'));
  const R = resultOf(item);
  const body = experimentBody({ questionId: R.questionId, kind: R.sourceKind, work: R.work, chords: R.chords, letters: R.letters, notes: R.notes, lang: S.lang, culture: R.culture, parentId: null, shareToken: null });
  const yes = async () => {
    if (!S.over16) { S.apiStatus = 'need16'; render(); return; }
    if (!API_CONFIG.enabled) { S.apiStatus = 'closed'; render(); return; }
    try { const r = await api.submit(body, { age13: S.age === 'yes', over16: S.over16, consent: true }); const e = S.lib.mine.find((x) => x.id === S.recorded); if (e) { e.remote = r.id; saveLib(); } S.apiStatus = 'added'; }
    catch { S.apiStatus = 'failed'; }
    render();
  };
  const msg = { closed: t('research.closed'), added: t('api.added'), failed: t('research.failed'), need16: t('api.need16') }[S.apiStatus];
  return el('details', { class: 'research' },
    el('summary', null, t('api.title')),
    el('p', null, t('api.copy')),
    el('label', { class: 'check' }, el('input', { type: 'checkbox', checked: S.over16, on: { change: (e) => { S.over16 = e.target.checked; render(); } } }), t('api.age16')),
    el('p', { class: 'kicker' }, t('research.what')),
    el('pre', { class: 'payload' }, JSON.stringify(body, null, 2)),
    msg ? el('p', { role: 'status' }, msg) : el('div', { class: 'row consent' },
      button(t('research.yes'), yes, '', { disabled: !S.over16 }),
      button(t('research.no'), () => { const d = app.querySelector('details.research'); if (d) d.open = false; })),
    API_CONFIG.enabled ? el('div', { class: 'row' }, button(t('api.dataset'), async () => {
      try { const d = await api.dataset('emotions'); S.apiData = d.groups && d.groups.length ? d.groups : 'hidden'; } catch { S.apiData = 'hidden'; } render();
    }, 'ghost')) : null,
    S.apiData === 'hidden' ? el('p', { class: 'mute small' }, t('api.hidden')) : null);
}
function echo(R, startOther) {
  const i = LETTER_IDS.indexOf(R.letters[0]);
  const other = LETTER_IDS[(i + 7) % LETTER_IDS.length];
  return el('section', { class: 'echo', style: { '--h': hueOf(other) } },
    el('p', { class: 'kicker' }, t('result.echo')),
    el('p', null, t('result.echo.t', { a: L(R.letters[0]), b: L(other) })),
    button(t('btn.again'), () => startOther(other), 'ghost'));
}
function resultView(item, again) {
  if (!S.recorded) { recordResult(item); }
  const R = resultOf(item);
  return el('div', { class: 'stage result' },
    cardView(item, S.recorded),
    el('div', { class: 'remix-one' },
      button(el('span', null, '✦ ', t('remix.one')), () => S.recorded && remixNow(item, S.recorded), 'pri big remix-btn', { 'data-remix': '1' }),
      el('span', { class: 'mute small' }, t('remix.sub'))),
    S.toast.length ? el('div', { class: 'toast', role: 'status' }, el('p', { class: 'kicker' }, t('result.found')),
      el('ul', { class: 'toast-chips' }, S.toast.slice(0, 6).map((x) => el('li', null, x)), S.toast.length > 6 ? el('li', null, '+' + (S.toast.length - 6)) : null)) : null,
    el('p', { class: 'mute small' }, t('result.saved')),
    shareBox(item),
    echo(R, (other) => startNew({ q: 'q.mynotes', size: 'small', letters: [other] }, 1)),
    el('div', { class: 'row' },
      button(t('btn.again'), again, 'pri'),
      button(t('remix.steps'), () => S.recorded && startRemixItem(item, S.recorded), 'ghost'),
      button(t('nav.home'), goHome, 'ghost')),
    apiBox(item));
}
const stageResult = () => resultView({ kind: 'free', exp: S.exp }, () => startNew({ q: S.exp.q, size: S.exp.size }));
const tplResult = () => resultView({ kind: 'tpl', payload: S.tpl }, () => startTemplate(S.tpl.t));

function viewBuild() {
  const stages = stagesFor(S.exp);
  if (S.stage >= stages.length) S.stage = stages.length - 1;
  const name = stages[S.stage];
  const body = { question: stageQuestion, source: stageSource, chords: stageChords, emotions: stageEmotions, notes: stageNotes, sound: stageSound, result: stageResult }[name]();
  return el('div', { class: 'build', 'data-family': familyOf(S.exp), 'data-stage': name },
    rail(stages), body, navRow(stages));
}

// ---------- links: #x= (the experiment), ?s= (gift-og share-state, or an API share token) ----------
function clearHash() { const q = edition ? edition.query : ''; if (location.hash || location.search !== q) history.replaceState(null, '', location.pathname + q); }
function viewShared() {
  if (S.sharedBad) {
    return el('section', { class: 'stage' }, el('h1', null, t('shared.bad')), button(t('home.start'), () => { S.sharedBad = false; goHome(); }, 'pri'));
  }
  const item = S.shared, R = resultOf(item);
  return el('div', { class: 'stage shared' },
    el('p', { class: 'kicker' }, t('shared.k')),
    el('h1', { lang: item.kind === 'tpl' ? 'en' : null }, R.title),
    el('p', { class: 'mute' }, t('shared.from')),
    R.gen ? el('p', { class: 'mute small' }, t('shared.chain', { n: R.gen })) : null,
    cardView(item, S.sharedId, false),
    el('div', { class: 'row' },
      button(t('btn.makemine'), () => (item.kind === 'free' ? startNew({ q: makeMineFrom(item.exp).q, size: item.exp.size }, 1) : startTemplate(item.payload.t)), 'pri big'),
      button(el('span', null, '✦ ', t('remix.one')), () => remixNow(item, S.sharedId), 'big remix-btn', { 'data-remix': '1' })),
    button(t('nav.home'), goHome, 'ghost'));
}
/** a bare gift-og link (?s= share-state, no experiment): show the card, invite "make yours". */
function viewGift() {
  const l = ogLetter(S.ogState);
  return el('div', { class: 'stage shared' },
    el('p', { class: 'kicker' }, t('gift.k')),
    el('h1', null, L(l === 're_love' ? 'love' : l)),
    el('figure', { class: 'ogcard' }, el('img', { src: ogImage(l), width: '1200', height: '630', alt: t('card.alt', { feeling: L(l === 're_love' ? 'love' : l) }) })),
    S.ogState.g ? el('p', { class: 'mute small' }, t('shared.chain', { n: S.ogState.g })) : null,
    el('div', { class: 'row' }, button(t('gift.make'), goHome, 'pri big')));
}
/** an API share token (?s=<token>): opening it contacts the research server, so ask first. */
function viewApiShare() {
  if (!API_CONFIG.enabled) return el('div', { class: 'stage shared' }, el('p', null, t('api.share.closed')), button(t('gift.make'), goHome, 'pri big'));
  return el('div', { class: 'stage shared' }, el('p', null, t('api.share.open')),
    el('div', { class: 'row consent' },
      button(t('research.yes'), async () => {
        try { const r = await api.openShare(S.apiToken); S.apiData = r; } catch { S.apiData = 'failed'; } render();
      }), button(t('research.no'), goHome)),
    S.apiData && S.apiData !== 'failed' && S.apiData.experiment ? el('p', null, Object.keys(S.apiData.experiment.stages ? S.apiData.experiment.stages.emotion_map || {} : {}).map(L).join(' · ')) : null);
}
async function openFromLink() {
  const code = codeFromHash(location.hash);
  if (code) {
    const raw = decodeRaw(code);
    let item = null;
    if (raw && typeof raw.t === 'string') { const p = normalizeTemplatePayload(raw, bundle); if (p) item = { kind: 'tpl', payload: p }; }
    else if (raw) { const exp = normalizeExperiment(raw); if (exp) item = { kind: 'free', exp }; }
    if (!item) { S.sharedBad = true; S.view = 'shared'; return true; }
    const id = await entryId(item);
    S.shared = item; S.sharedId = id; S.view = 'shared'; S.depth = 0; S.sharedBad = false;
    if (!S.lib.mine.some((e) => e.id === id)) { S.lib.shared = upsert(S.lib.shared, { id, ...(item.kind === 'tpl' ? { tpl: item.payload } : { exp: item.exp }), at: new Date().toISOString() }); saveLib(); }
    return true;
  }
  const s = new URLSearchParams(location.search).get('s');
  if (!s) return false;
  if (s.startsWith('ey')) { const st = ogDecode(s); if (st.l || st.f) { S.ogState = st; S.view = 'gift'; return true; } return false; }
  if (looksLikeApiToken(s)) { S.apiToken = s; S.view = 'apishare'; return true; }
  return false;
}

// ---------- what this page knows (always reachable) ----------
function openKnows() {
  const d = document.getElementById('knows');
  d.replaceChildren(
    el('h2', { id: 'knows-h' }, t('knows.title')),
    el('h3', null, t('knows.local')), el('p', null, t('knows.local.items')),
    el('h3', null, t('knows.sent')), el('p', null, api.hasDevice() ? t('api.mine') : t('knows.sent.none')),
    el('p', { class: 'mute' }, t('knows.links')),
    el('h3', null, t('knows.research')), el('p', null, t('knows.research.t')),
    api.hasDevice() && API_CONFIG.enabled ? button(t('api.forget'), async () => { try { await api.forgetMe(); } catch { /* shown below */ } d.close(); render(); }, 'danger') : null,
    el('div', { class: 'row' },
      button(t('knows.clear'), () => {
        player.stop(); store.clearAll();
        Object.assign(S, { age: null, lib: { mine: [], shared: [] }, progress: store.progress(), done: [], view: 'home', exp: null, tpl: null, recorded: null, toast: [] });
        d.close(); clearHash(); say(t('knows.cleared')); render();
      }, 'danger'),
      button(t('btn.close'), () => d.close(), 'pri')));
  if (d.showModal) d.showModal(); else d.setAttribute('open', '');
}

// ---------- render ----------
function render() {
  let main;
  if (!bundle) main = el('p', { class: 'mute' }, '…');
  else if (S.breath) main = viewBreath();
  else if (!S.age) main = viewOpening();
  else if (S.view === 'build' && S.exp) main = viewBuild();
  else if (S.view === 'tpl' && S.tpl) main = viewTemplate();
  else if (S.view === 'shared') main = viewShared();
  else if (S.view === 'gift' && S.ogState) main = viewGift();
  else if (S.view === 'apishare') main = viewApiShare();
  else main = viewHome();
  // the stage fades in when it changes, not on every tap inside it
  const key = [S.breath, S.age, S.view, S.stage, S.tStage, S.exp && S.exp.size, S.revealN].join('|');
  if (key === S.lastKey) main.querySelectorAll('.stage').forEach((n) => n.classList.add('still'));
  if ((main.classList.contains('stage') || main.classList.contains('opening')) && key === S.lastKey) main.classList.add('still');
  S.lastKey = key;
  app.replaceChildren(header(), el('main', { id: 'main' }, main), footer());
  document.body.classList.toggle('is-opening', !!bundle && !S.age && !S.breath);
  syncField();
}
/** at a reveal, the ring of the 12 notes circles the share card (and follows it on scroll) */
function anchorRing() {
  const img = app.querySelector('.ogcard img');
  if (!img) return field.setAnchor(null);
  const r = img.getBoundingClientRect();
  field.setAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.min(r.width * 0.62, window.innerWidth * 0.48) });
}
let scrollRaf = 0;
window.addEventListener('scroll', () => { if (field.shape === 'ring' && !scrollRaf) scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; anchorRing(); }); }, { passive: true });
/** the field mirrors where the person is: a heart at the opening, the ring at a reveal, drift else */
function syncField() {
  if (!bundle) return;
  if (!S.age) {
    field.setShape('heart'); if (S.openHue === null) field.setPalette([]);
    // the particle heart frames the heart you hold
    const anchorHeart = () => { const hb = app.querySelector('[data-heart]'); if (hb) { const r = hb.getBoundingClientRect(); field.setAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2 - r.height * 0.06, r: r.width * 0.85 }); } };
    anchorHeart(); clearTimeout(S.anchorT); S.anchorT = setTimeout(anchorHeart, 1500); // again once its entrance settles
    return;
  }
  field.setAnchor(null);
  const item = currentItem();
  const atResult = (S.view === 'tpl' && S.tpl && tplStages()[S.tStage].id === '__result') || (S.view === 'build' && S.exp && stagesFor(S.exp)[S.stage] === 'result') || S.view === 'shared';
  if (item && !(S.view === 'shared' && S.sharedBad)) {
    const letters = S.view === 'tpl' && !atResult ? tplLetters() : resultOf(item).letters;
    field.setShape(atResult ? 'ring' : 'drift');
    field.setPalette(huesOf(letters));
    if (atResult) anchorRing(); else field.setAnchor(null);
  } else {
    field.setShape('drift');
    field.setPalette(huesOf(S.progress.letters.slice(-3)));
  }
}

window.addEventListener('resize', () => { if (!S.age) syncField(); });
window.addEventListener('hashchange', async () => { if (await openFromLink()) { render(); focusMain(); } });
// colours come only from od-forms' --f-* tokens: dusk (dark) or paper (light), following the device
const darkMq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
// the studio is always dusk: the field is light on dark (additive glow disappears on paper)
const applySkin = () => { document.documentElement.dataset.skin = 'dusk'; };
applySkin(); if (darkMq && darkMq.addEventListener) darkMq.addEventListener('change', applySkin);

// boot: strings + the library, all same-origin
(async () => {
  const para = new URLSearchParams(location.search).get('para');
  if (para && Object.prototype.hasOwnProperty.call(EDITIONS, para)) {
    try { edition = await import(EDITIONS[para]); S.lang = edition.lang(S.lang); edition.mount({ field, player, app }); }
    catch { edition = null; }
  }
  render();
  const [, library, cultures, films, progression, opening] = await Promise.all([
    setLang(S.lang),
    loadJSON('lib/experiments/library.json'), loadJSON('lib/catalog/cultures.json'),
    loadJSON('lib/catalog/film-themes.json'), loadJSON('lib/experiments/progression/progression.json'),
    loadJSON('i18n/opening.json').catch(() => ({ words: [] })),
  ]);
  S.openWords = opening.words || [];
  bundle = makeBundle(library, cultures, films, progression);
  S.lib = { mine: S.lib.mine, shared: S.lib.shared };
  await openFromLink();
  render();
  document.documentElement.dataset.ready = 'true';
})();
