// Sound: Web Audio through od-forms' shared makeSound (packages/od-forms/src/core.js, vendored).
// Everything is synthesised from note numbers on the device. No audio file is ever loaded.
// Nothing plays until the person taps (browsers require it, and so do we).

import { makeSound } from './vendor/od-forms-core.js';
import { midiToFreq, chordMidi } from './core/theory.js';

export function createPlayer() {
  const A = makeSound();
  let timers = [];
  let playing = false;
  // a tap off the master bus so the visuals can follow the real sound
  let an = null, buf = null;
  function ensure() {
    const c = A.ensure();
    if (c && (!an || an.context !== c)) {
      an = c.createAnalyser(); an.fftSize = 512; buf = new Float32Array(an.fftSize);
      // a silent sink keeps the analyser pulled in every browser
      try { const z = c.createGain(); z.gain.value = 0; A.master.connect(an); an.connect(z); z.connect(c.destination); } catch { an = null; }
    }
    return c;
  }
  /** current loudness, 0..~1 (RMS of the master bus) */
  function level() {
    if (!an || !playingOrRinging()) return 0;
    an.getFloatTimeDomainData(buf);
    let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    return Math.sqrt(s / buf.length);
  }
  let ringUntil = 0;
  const playingOrRinging = () => playing || performance.now() < ringUntil;

  const voice = (tb, f, o) => {
    const g = o.gain;
    if (tb === 'bell') A.bell(f, g, o.at);
    else if (tb === 'soft') A.tone(f, { type: 'sine', dur: o.dur * 1.2, attack: 0.09, gain: g, at: o.at, glide: o.glide });
    else if (tb === 'glass') { A.tone(f, { type: 'triangle', dur: o.dur, gain: g * 0.8, at: o.at, glide: o.glide }); A.tone(f * 2, { type: 'sine', dur: o.dur * 0.6, gain: g * 0.18, at: o.at }); }
    else A.tone(f, { type: 'square', dur: Math.min(0.35, o.dur * 0.5), attack: 0.005, gain: g * 0.32, at: o.at });
  };

  function clear() { timers.forEach(clearTimeout); timers = []; }

  function stop() {
    clear();
    playing = false;
    if (A.ctx) { try { A.ctx.close(); } catch { /* closed */ } A.ctx = null; A.master = null; an = null; }
  }

  /** play a run() result. onNote(i, note) fires as each note sounds; onEnd() at the end. */
  function play(result, { onNote, onEnd } = {}) {
    stop();
    if (!ensure()) { onEnd && onEnd(); return false; }
    playing = true;
    const { bpm, tb, tense } = result.sound;
    const beat = 60 / bpm;
    const last = result.notes.reduce((m, n) => Math.max(m, n.t), 0);
    result.notes.forEach((n, i) => {
      const at = n.t * beat + 0.05;
      const f = midiToFreq(n.m);
      const tail = n.t === last || n.part === 'answer';
      let glide;
      if (tail && tense === 'was') glide = f * 0.94;
      if (tail && tense === 'will') glide = f * 1.06;
      if (n.part === 'hum') A.tone(f, { type: 'sine', dur: n.d * beat, attack: 0.4, gain: 0.05, at });
      else voice(n.part === 'call' || n.part === 'answer' ? 'bell' : tb, f, { at, dur: n.d * beat, gain: (tense === 'was' ? 0.08 : 0.11) * n.v, glide });
      if (onNote) timers.push(setTimeout(() => playing && onNote(i, n), at * 1000));
    });
    timers.push(setTimeout(() => { playing = false; onEnd && onEnd(); }, (result.beats * beat + 1.2) * 1000));
    return true;
  }

  function chord(symbol) {
    if (!ensure()) return;
    A.chord(chordMidi(symbol, 60).map(midiToFreq), 0.12);
    ringUntil = performance.now() + 1500;
  }
  /** a single soft bell, for taps (the reveal, a choice) */
  function bell(midi, gain = 0.08) {
    if (!ensure()) return;
    A.bell(midiToFreq(midi), gain);
    ringUntil = performance.now() + 1500;
  }

  /** one lub-dub (the opening's held heart) */
  function heart(i = 0.7) {
    if (!ensure()) return;
    A.heart(i);
    ringUntil = performance.now() + 600;
  }
  /** play chord symbols one after another (a stage's harmony), on the studio's own synth */
  function chords(list, { beat = 0.62, onEnd } = {}) {
    stop();
    if (!ensure() || !list.length) { onEnd && onEnd(); return; }
    playing = true;
    list.forEach((c, i) => timers.push(setTimeout(() => { if (playing) A.chord(chordMidi(c, 60).map(midiToFreq), 0.12); }, i * beat * 1000)));
    timers.push(setTimeout(() => { playing = false; ringUntil = performance.now() + 1200; onEnd && onEnd(); }, list.length * beat * 1000));
  }
  return { play, stop, chord, chords, bell, heart, level, get playing() { return playing; } };
}
