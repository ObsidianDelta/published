// Candombe heartbeat for the Uruguayan edition (?para=sabs). Original, synthesised on the device
// with Web Audio: no samples, no recordings, nothing loaded. Three drums of a cuerda, written for
// this page (patterns are our own simplification, not a transcription of any recording):
//   chico   the small high drum, the steady pulse between the beats
//   repique the middle drum: the madera (stick on the shell) in a 3-2 clave, and a fill every
//           other bar
//   piano   the low drum: a lub-dub on the downbeat, so the cuerda breathes with the heart
// One bar = 4 beats = 16 steps; one beat = one heartbeat (the studio field's bpm), with a light
// candombe lilt on the off sixteenths. It sits under the love sounds and ducks while they play.
// Never throws; does nothing until start() is called from a tap (browsers require it).

const CLAVE = [0, 3, 6, 10, 12]; // madera, 3-2
const PIANO = { 0: [1, 0.36], 1: [0.55, 0.22], 6: [0.7, 0.3], 8: [0.45, 0.09], 11: [0.65, 0.3], 14: [0.75, 0.32] }; // step: [gain, decay]
const FILL = { 12: 0.55, 13: 0.4, 14: 0.7, 15: 0.9 };

export function createCandombe({ ducked = () => false } = {}) {
  let ctx = null, master = null, noise = null, timer = 0, on = false;
  let bpm = 66, step = 0, bar = 0, nextT = 0;
  const LEVEL = 0.26, DUCK = 0.13;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0;
      const tone = ctx.createBiquadFilter(); tone.type = 'lowshelf'; tone.frequency.value = 180; tone.gain.value = 3;
      master.connect(tone); tone.connect(ctx.destination);
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch { ctx = null; }
    return ctx;
  }

  /** a skin: a sine that drops in pitch, plus a little noise for the hand or the stick */
  function skin(at, f0, f1, dec, g, nz = 0.25, nzf = 1800) {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + Math.min(0.08, dec));
    og.gain.setValueAtTime(0.0001, at); og.gain.exponentialRampToValueAtTime(g, at + 0.004); og.gain.exponentialRampToValueAtTime(0.0001, at + dec);
    o.connect(og); og.connect(master); o.start(at); o.stop(at + dec + 0.05);
    if (nz > 0) slap(at, nzf, 1.2, 0.035, g * nz);
  }
  /** a noise burst through a band-pass: the madera click, the slap of a hand */
  function slap(at, f, q, dec, g) {
    const s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), sg = ctx.createGain();
    s.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    sg.gain.setValueAtTime(0.0001, at); sg.gain.exponentialRampToValueAtTime(g, at + 0.002); sg.gain.exponentialRampToValueAtTime(0.0001, at + dec);
    s.connect(bp); bp.connect(sg); sg.connect(master); s.start(at, Math.random() * 0.4); s.stop(at + dec + 0.02);
  }

  function play(i, at) {
    const inBeat = i % 4;
    // chico: open stick on the "e", hand on the "and" of every beat
    if (inBeat === 1) skin(at, 560, 470, 0.07, 0.42, 0.5, 3200);
    if (inBeat === 2) skin(at, 520, 450, 0.05, 0.22, 0.3, 2800);
    // repique: madera on the clave; an open fill every second bar
    if (CLAVE.includes(i)) slap(at, 2400, 7, 0.03, i === 0 ? 0.34 : 0.26);
    if (bar % 2 === 1 && FILL[i]) skin(at, 340, 285, 0.13, 0.38 * FILL[i], 0.35, 2200);
    // piano: the low drum, lub-dub on the downbeat
    const p = PIANO[i];
    if (p) skin(at, 128, 74, p[1], 0.62 * p[0], p[1] < 0.15 ? 0.6 : 0.12, 900);
  }

  function tick() {
    if (!on || !ctx) return;
    const s16 = 60 / bpm / 4;
    const ahead = ctx.currentTime + 0.14;
    if (nextT < ctx.currentTime - 0.25) nextT = ctx.currentTime + 0.03; // after a pause, catch up quietly
    while (nextT < ahead) {
      const lilt = step % 2 === 1 ? s16 * 0.14 : 0;
      play(step, nextT + lilt);
      nextT += s16; step = (step + 1) % 16; if (step === 0) bar++;
    }
    const want = ducked() ? DUCK : LEVEL;
    if (Math.abs(master.gain.value - want) > 0.01) master.gain.setTargetAtTime(want, ctx.currentTime, 0.3);
  }

  function start() {
    try {
      if (!ensure()) return false;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      if (on) return true;
      on = true; step = 0; bar = 0; nextT = ctx.currentTime + 0.08;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 0.6);
      clearInterval(timer); timer = setInterval(tick, 25); tick();
      return true;
    } catch { on = false; return false; }
  }
  function stop() {
    on = false; clearInterval(timer); timer = 0;
    try { if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.12); } catch { /* closed */ }
  }
  document.addEventListener('visibilitychange', () => {
    try {
      if (!ctx) return;
      if (document.hidden) ctx.suspend().catch(() => {});
      else if (on) ctx.resume().catch(() => {});
    } catch { /* ignore */ }
  });

  return {
    start, stop,
    toggle() { return on ? (stop(), false) : start(); },
    /** one beat = one heartbeat */
    setBpm(v) { const n = Number(v); if (Number.isFinite(n)) bpm = Math.max(50, Math.min(140, n)); },
    get on() { return on; },
    get bpm() { return bpm; },
  };
}
