/* od-forms — the shared core, extracted from Content Range's cr-core.js as ES exports.
   No window globals. Everything here must import cleanly in Node (for toText / renderStatic and the
   generic tests), in browsers (for render) and in Cloudflare Workers. Anything that touches the DOM,
   Web Audio or speech is guarded behind a typeof check and is only reached from render(). */

const HAS_DOC = typeof document !== 'undefined';
const HAS_WIN = typeof window !== 'undefined';
const HAS_NAV = typeof navigator !== 'undefined';

// ---------- small helpers (pure) ----------
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** HTML-escape, usable in Node (for renderStatic) and the browser alike. */
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- DOM builders (browser only; called from render) ----------
function put(e, a) {
  if (!a) return e;
  for (const k in a) {
    const v = a[k];
    if (v == null || v === false) continue;
    if (k === 'class') e.setAttribute('class', v);
    else if (k === 'text') e.textContent = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; } }
    else if (k === 'on') { for (const ev in v) e.addEventListener(ev, v[ev]); }
    else if (k === 'data') { for (const d in v) e.dataset[d] = v[d]; }
    else e.setAttribute(k, v === true ? '' : v);
  }
  return e;
}
function kids(e, ks) { ks.flat(9).forEach((k) => { if (k == null || k === false) return; e.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k); }); return e; }
/** el('div', {class, text, on:{click}, style:{}, data:{}}, ...children) — DOM only. */
export const el = (tag, attrs, ...ks) => kids(put(document.createElement(tag), attrs), ks);
/** svg('circle', {cx, cy, r}) — SVG namespace, DOM only. */
export const svg = (tag, attrs, ...ks) => {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (attrs) for (const k in attrs) {
    const v = attrs[k]; if (v == null || v === false) continue;
    if (k === 'text') e.textContent = v; else if (k === 'on') { for (const ev in v) e.addEventListener(ev, v[ev]); } else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) e.style.setProperty(sk, v[sk]); else e.style[sk] = v[sk]; } } else e.setAttribute(k, v);
  }
  return kids(e, ks);
};

// ---------- the five depths every form maps onto ----------
export const DEPTHS = [
  { k: 0, name: 'Glance', sub: 'the answer' },
  { k: 1, name: 'The message', sub: 'in her words' },
  { k: 2, name: 'Why', sub: 'his reasons, cited' },
  { k: 3, name: 'Means & needs', sub: 'what it isn’t, what he needs' },
  { k: 4, name: 'Everything', sub: 'his raw words, the record' },
];
export const DWELL = [0, 3, 8, 16, 28]; // seconds of attention before a form unfolds to that depth (when not held)

// ---------- time: UTC everywhere ----------
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const p2 = (n) => String(n).padStart(2, '0');
export const utc = {
  time: (iso) => { const d = iso ? new Date(iso) : new Date(); return p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ' UTC'; },
  secs: (iso) => { const d = iso ? new Date(iso) : new Date(); return p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ':' + p2(d.getUTCSeconds()) + ' UTC'; },
  date: (iso) => { const d = new Date(iso); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; },
  full: (iso) => { const d = new Date(iso); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ', ' + p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ' UTC'; },
  now: () => new Date().toISOString(),
  mmss: (s) => { s = Math.max(0, Math.round(s)); return p2(Math.floor(s / 60)) + ':' + p2(s % 60); },
};

// ---------- the consent vocabulary (SIDECAR-DOORS v1, p0-asks §2) ----------
// category = open->opened; depth,play->depth; feel->feel; react->reactions; pick,reply,ask->replies
export const CATEGORIES = ['opened', 'depth', 'feel', 'reactions', 'replies'];
export const EVENT_CATEGORY = Object.freeze({
  open: 'opened', depth: 'depth', play: 'depth', feel: 'feel', react: 'reactions', pick: 'replies', reply: 'replies', ask: 'replies',
});
/** the category a track type falls into. */
export const categoryOf = (type) => EVENT_CATEGORY[type] || 'replies';
/** the default consent: opened and the two reply-side categories on, the rest off (as the lab seeds it). */
export const DEFAULT_CONSENT = Object.freeze({ opened: true, depth: false, feel: false, reactions: true, replies: true });
/** true only if `consent` lets an event of this type be shared. A withheld event must never reach the
    transport, not even as a count — callers that honour this drop it entirely. */
export const allowed = (consent, type) => !!(consent && consent[categoryOf(type)]);

/** track(transport, consent, type, data, form): the consent filter in one place. A withheld category
    leaves no event and no count: nothing is handed to the transport. Returns the event if shared, else null. */
export function track(transport, consent, type, data, form) {
  const ev = { at: utc.now(), type, category: categoryOf(type), form: form || null, data: data || {} };
  if (!allowed(consent, type)) return null;
  if (transport && typeof transport.track === 'function') { try { transport.track(ev); } catch (e) { /* transport's problem */ } }
  return ev;
}

// ---------- the haptic vocabulary (felt where the device can, heard and seen where it can't) ----------
export const HAP = {
  nudge:   { p: [6],                          i: 0.2,  say: 'a feather tap' },
  tick:    { p: [9],                          i: 0.35, say: 'crossing something' },
  detent:  { p: [14],                         i: 0.5,  say: 'snapping into place' },
  press:   { p: [18],                         i: 0.6,  say: 'a press' },
  open:    { p: [10, 40, 22],                 i: 0.6,  say: 'something opens' },
  deepen:  { p: [8, 55, 14, 55, 24],          i: 0.75, say: 'going deeper' },
  surface: { p: [24, 55, 14, 55, 8],          i: 0.55, say: 'coming up' },
  heart:   { p: [26, 170, 16],                i: 0.8,  say: 'a heartbeat' },
  arrive:  { p: [10, 40, 10, 40, 40],         i: 0.8,  say: 'the door opens' },
  confirm: { p: [18, 60, 18],                 i: 0.65, say: 'done' },
  sent:    { p: [12, 30, 12, 30, 12, 90, 30], i: 0.8,  say: 'sent' },
  rumble:  { p: [4, 16, 4, 16, 4, 16, 4],     i: 0.3,  say: 'a texture' },
};

// ---------- sound (Web Audio, lazily created on the first tap; a no-op off-browser) ----------
/** makeSound() → a sound object A with ensure/ok/tone/bell/chord/swish/kick/heart/click/note/pitch/voice.
    Off-browser (Node, Workers) every method is a safe no-op. */
export function makeSound(opts) {
  opts = opts || {};
  const A = { ctx: null, master: null, noise: null, enabled: opts.sound !== false };
  const PENT = [0, 2, 4, 7, 9];
  A.ensure = function () {
    if (!HAS_WIN) return null;
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return A.ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try {
      const c = new AC(), comp = c.createDynamicsCompressor(), m = c.createGain(), dl = c.createDelay(1), fb = c.createGain(), wet = c.createGain();
      m.gain.value = 0.5; dl.delayTime.value = 0.23; fb.gain.value = 0.28; wet.gain.value = 0.18;
      m.connect(comp); m.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(comp); comp.connect(c.destination);
      const nb = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      A.ctx = c; A.master = m; A.noise = nb;
    } catch (e) { return null; }
    return A.ctx;
  };
  A.ok = () => A.enabled && !!A.ctx && A.ctx.state !== 'closed';
  A.note = (k) => { k = Math.max(0, Math.round(k)); return 174.61 * Math.pow(2, (PENT[k % 5] + 12 * Math.floor(k / 5)) / 12); };
  A.pitch = (b) => A.note(clamp(b, 0, 1) * 14);
  A.tone = function (freq, o) {
    if (!A.ok()) return; o = o || {};
    const c = A.ctx, t = c.currentTime + (o.at || 0), dur = o.dur || 0.6, g = c.createGain(), os = c.createOscillator();
    os.type = o.type || 'sine'; os.frequency.setValueAtTime(freq, t); if (o.glide) os.frequency.exponentialRampToValueAtTime(o.glide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.gain || 0.12, t + (o.attack || 0.012)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    os.connect(g); g.connect(o.dest || A.master); os.start(t); os.stop(t + dur + 0.05);
  };
  A.bell = (f, g, at) => { A.tone(f, { gain: g || 0.1, dur: 1.4, at }); A.tone(f * 2.76, { gain: (g || 0.1) * 0.25, dur: 0.7, at }); A.tone(f * 5.4, { gain: (g || 0.1) * 0.08, dur: 0.35, at }); };
  A.chord = (fs, g) => fs.forEach((f, i) => A.tone(f, { gain: (g || 0.08) / Math.sqrt(fs.length), dur: 1.2, at: i * 0.045, attack: 0.03 }));
  A.swish = function (gain, at, up) {
    if (!A.ok()) return; const c = A.ctx, t = c.currentTime + (at || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = A.noise; f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(up === false ? 3200 : 400, t); f.frequency.exponentialRampToValueAtTime(up === false ? 400 : 3200, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain || 0.07, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); s.connect(f); f.connect(g); g.connect(A.master); s.start(t); s.stop(t + 0.5);
  };
  A.kick = function (f, gain, decay, at) {
    if (!A.ok()) return; const c = A.ctx, t = c.currentTime + (at || 0);
    const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f * 0.55, t + decay);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + 0.005); g.gain.exponentialRampToValueAtTime(0.001, t + decay); o.connect(g); g.connect(A.master); o.start(t); o.stop(t + decay + 0.1);
    const n = c.createBufferSource(), lp = c.createBiquadFilter(), g3 = c.createGain(); n.buffer = A.noise; lp.type = 'lowpass'; lp.frequency.value = 240; g3.gain.setValueAtTime(gain * 0.5, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.012); n.connect(lp); lp.connect(g3); g3.connect(A.master); n.start(t); n.stop(t + 0.06);
  };
  A.heart = (i, at) => { const I = clamp(i == null ? 0.7 : i, 0.2, 1) * 1.5; A.kick(58, 0.6 * I, 0.26, at || 0); A.kick(64, 0.38 * I, 0.22, (at || 0) + 0.2); };
  A.click = (g, at) => { if (!A.ok()) return; const c = A.ctx, t = c.currentTime + (at || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), gg = c.createGain(); s.buffer = A.noise; f.type = 'highpass'; f.frequency.value = 2400; gg.gain.setValueAtTime(g || 0.05, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.018); s.connect(f); f.connect(gg); gg.connect(A.master); s.start(t); s.stop(t + 0.03); };
  A.voice = function () {
    const v = { o: null, g: null };
    v.set = function (freq, gain) { if (!A.ok()) { v.stop(); return; } const c = A.ctx, t = c.currentTime; if (!v.o) { v.o = c.createOscillator(); v.o.type = 'triangle'; v.g = c.createGain(); v.g.gain.value = 0.0001; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; v.o.connect(f); f.connect(v.g); v.g.connect(A.master); v.o.start(); } v.o.frequency.setTargetAtTime(freq, t, 0.05); v.g.gain.setTargetAtTime(Math.max(0.0001, gain), t, 0.08); };
    v.stop = function () { if (v.o) { const o = v.o, g = v.g; g.gain.setTargetAtTime(0.0001, A.ctx.currentTime, 0.06); setTimeout(() => { try { o.stop(); } catch (e) { /* stopped */ } }, 400); v.o = null; v.g = null; } };
    return v;
  };
  return A;
}

// ---------- spoken voice: synthetic, ALWAYS labelled (rule R8); callers show the label ----------
/** speak(text, {rate, onWord(charIndex), onEnd}) → {stop(), synthetic:true, real}. Off-browser: a no-op. */
export function speak(text, o) {
  o = o || {}; let done = false; const fin = () => { if (!done) { done = true; o.onEnd && o.onEnd(); } };
  if (!HAS_WIN) { fin(); return { stop() {}, synthetic: true, real: false }; }
  const ss = window.speechSynthesis;
  if (ss && typeof SpeechSynthesisUtterance !== 'undefined' && (ss.getVoices() || []).length) {
    try {
      ss.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = o.rate || 1; u.pitch = 1;
      const vs = ss.getVoices(); const pick = vs.find((v) => /en[-_](GB|US|CA|AU)/i.test(v.lang) && /natural|premium|enhanced|daniel|samantha|google/i.test(v.name)) || vs.find((v) => /^en/i.test(v.lang));
      if (pick) u.voice = pick;
      u.onboundary = (e) => { if (o.onWord && e.name !== 'sentence') o.onWord(e.charIndex); };
      u.onend = fin; u.onerror = fin; ss.speak(u);
      return { stop() { try { ss.cancel(); } catch (e) { /* none */ } fin(); }, synthetic: true, real: true };
    } catch (e) { /* fall through */ }
  }
  const ws = text.split(/(\s+)/); let ci = 0, k = 0; const rate = o.rate || 1;
  const step = () => { if (done) return; if (k >= ws.length) return fin(); const w = ws[k]; if (w.trim()) o.onWord && o.onWord(ci); ci += w.length; k++; tm = setTimeout(step, w.trim() ? (160 + w.length * 45) / rate : 0); };
  let tm = setTimeout(step, 200);
  return { stop() { clearTimeout(tm); fin(); }, synthetic: true, real: false };
}

// ---------- the form registry ----------
const FORMS = [];
/** registerForm(def) — add a form to the registry. A form is the object the contract describes
    (id, name, needs, hosts, haptics, render, renderStatic, toText). */
export function registerForm(def) { FORMS.push(def); return def; }
/** every registered form, in registration order. */
export const forms = () => FORMS.slice();
/** a form by id. */
export const formById = (id) => FORMS.find((f) => f.id === id) || null;

// ---------- the view-model helper ----------
/** modelNodes(model) → every reasoning node, flattened, each tagged with its group; plus a node(id) finder.
    Forms read their reasoning tree through this so the shape is read in one place. */
export function modelNodes(model) {
  const groups = (model && model.tree && model.tree.groups) || [];
  const nodes = groups.flatMap((g) => (g.nodes || []).map((n) => Object.assign({ group: g.k, groupName: g.name }, n)));
  return { nodes, node: (id) => nodes.find((n) => n.id === id) || null };
}

/** device hints, resolved once off a caps bag (hosts pass caps; Node/Workers get all false). */
export function deviceHints(caps) {
  caps = caps || {};
  const ua = (HAS_NAV && navigator.userAgent) || '';
  return {
    coarse: caps.coarse != null ? !!caps.coarse : (HAS_WIN && typeof window.matchMedia === 'function' ? (() => { try { return window.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } })() : false),
    reduced: caps.reduced != null ? !!caps.reduced : (HAS_WIN && typeof window.matchMedia === 'function' ? (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })() : false),
    isIPhone: /iPhone|iPod/.test(ua),
    isIPad: /iPad/.test(ua) || (/Macintosh/.test(ua) && HAS_NAV && (navigator.maxTouchPoints || 0) > 1),
    ua,
  };
}
