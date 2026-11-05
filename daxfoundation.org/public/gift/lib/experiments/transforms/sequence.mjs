// sequence.mjs -- progressions / note sets <-> playable sequences. Pure.
// A sequence is renderer-agnostic: { bpm, lengthBeats, events: [{ t, dur, midi, vel, role, chordIndex }] }
// with t and dur in BEATS (seconds = beats * 60 / bpm). The studio plays it in its own
// synth voice -- never a recording (THEME-CATALOG rule).
// Voice leading: each chord is voiced to minimise total semitone motion from the
// previous one (parsimonious voice leading; Tymoczko, A Geometry of Music, 2011).

import { parseChord, mod12, identifyChord, noteToPc } from './theory.mjs';
import { chordToNotes } from './notes.mjs';

const UPPER_LO = 55, UPPER_HI = 79; // G3..G5 for the chord voices
const BASS_LO = 36, BASS_HI = 52; // C2..E3

/** All close-position voicings of a pc set inside [lo, hi]. */
export function voicings(pcs, lo = UPPER_LO, hi = UPPER_HI) {
  const uniq = [...new Set(pcs.map(mod12))];
  const out = [];
  for (let inv = 0; inv < uniq.length; inv++) {
    const order = [...uniq.slice(inv), ...uniq.slice(0, inv)];
    for (let start = lo; start <= hi; start++) {
      if (mod12(start) !== order[0]) continue;
      const v = [start];
      for (const p of order.slice(1)) {
        let m = v[v.length - 1] + 1;
        while (mod12(m) !== p) m++;
        v.push(m);
      }
      if (v[v.length - 1] <= hi) out.push(v);
    }
  }
  return out;
}

/** Total motion between two voicings (sorted pairing; unmatched voices measured to nearest). */
export function motion(a, b) {
  const x = [...a].sort((p, q) => p - q), y = [...b].sort((p, q) => p - q);
  const [s, l] = x.length <= y.length ? [x, y] : [y, x];
  let cost = 0;
  const used = new Set();
  for (const n of s) {
    let bi = -1, bd = Infinity;
    l.forEach((m, i) => { if (!used.has(i) && Math.abs(m - n) < bd) { bd = Math.abs(m - n); bi = i; } });
    used.add(bi); cost += bd;
  }
  l.forEach((m, i) => { if (!used.has(i)) cost += Math.min(...s.map((n) => Math.abs(m - n))); });
  return cost;
}

/** Voice a whole progression with minimal motion. Returns [{ symbol, upper: [midi], bass }]. */
export function voiceLead(chords) {
  let prev = null;
  return chords.map((sym) => {
    const c = parseChord(sym);
    const upperPcs = c.pcs.filter((p, i) => !(c.bass !== c.root && p === c.bass && i === c.pcs.length - 1));
    const cands = voicings(upperPcs);
    let upper;
    if (!prev) {
      // first chord: the voicing whose centre is nearest middle C-ish (A3-E4 region)
      upper = cands.reduce((best, v) => {
        const d = Math.abs(v.reduce((s, x) => s + x, 0) / v.length - 64);
        return !best || d < best.d ? { v, d } : best;
      }, null).v;
    } else {
      upper = cands.reduce((best, v) => {
        const d = motion(prev, v);
        return !best || d < best.d || (d === best.d && v[0] < best.v[0]) ? { v, d } : best;
      }, null).v;
    }
    prev = upper;
    let bass = BASS_LO + mod12(c.bass - BASS_LO);
    if (bass > BASS_HI) bass -= 12;
    return { symbol: sym, upper, bass };
  });
}

/**
 * Progression -> playable sequence.
 * opts: bpm (72), beatsPerChord (4), pattern 'block' | 'arpeggio' | 'heartbeat', voiceLead (true).
 * 'heartbeat' = lub-dub bass pulse (strong on the beat, softer 1/3 beat later) under a held chord:
 * the house rhythm of the gift (Heartbeats, LOVE-VOCAB-v0).
 */
export function progressionToSequence(chords, { bpm = 72, beatsPerChord = 4, pattern = 'block', voiceLead: vl = true } = {}) {
  if (!Array.isArray(chords) || !chords.length) throw new Error('progressionToSequence needs chords');
  const voiced = vl ? voiceLead(chords) : chords.map((s) => {
    const n = chordToNotes(s, { octave: 4 });
    return { symbol: s, upper: n.midi, bass: BASS_LO + mod12(parseChord(s).bass - BASS_LO) };
  });
  const events = [];
  voiced.forEach((v, ci) => {
    const t0 = ci * beatsPerChord;
    if (pattern === 'arpeggio') {
      const cyc = [...v.upper, ...v.upper.slice(1, -1).reverse()];
      const steps = beatsPerChord * 2;
      for (let s = 0; s < steps; s++) events.push({ t: t0 + s / 2, dur: 0.5, midi: cyc[s % cyc.length], vel: s === 0 ? 0.8 : 0.6, role: 'arp', chordIndex: ci });
      events.push({ t: t0, dur: beatsPerChord, midi: v.bass, vel: 0.7, role: 'bass', chordIndex: ci });
    } else if (pattern === 'heartbeat') {
      for (const m of v.upper) events.push({ t: t0, dur: beatsPerChord, midi: m, vel: 0.5, role: 'chord', chordIndex: ci });
      for (let b = 0; b < beatsPerChord; b++) {
        events.push({ t: t0 + b, dur: 1 / 3, midi: v.bass, vel: 0.9, role: 'lub', chordIndex: ci });
        events.push({ t: t0 + b + 1 / 3, dur: 1 / 3, midi: v.bass, vel: 0.55, role: 'dub', chordIndex: ci });
      }
    } else {
      for (const m of v.upper) events.push({ t: t0, dur: beatsPerChord, midi: m, vel: 0.7, role: 'chord', chordIndex: ci });
      events.push({ t: t0, dur: beatsPerChord, midi: v.bass, vel: 0.8, role: 'bass', chordIndex: ci });
    }
  });
  events.sort((a, b) => a.t - b.t || a.midi - b.midi);
  for (const e of events) { e.t = round(e.t); e.dur = round(e.dur); }
  return { bpm, beatsPerChord, pattern, lengthBeats: chords.length * beatsPerChord, chords: [...chords], events };
}

const round = (x) => Math.round(x * 1e4) / 1e4;

/** Note set -> melodic sequence: ascend then descend the set over a drone tonic. */
export function noteSetToSequence(noteSet, { bpm = 72, octave = 4, stepBeats = 0.5 } = {}) {
  const pcs = noteSet.pcs;
  const tonic = noteSet.tonicPc ?? pcs[0];
  const base = (octave + 1) * 12 + tonic;
  const asc = noteSet.intervals ? noteSet.intervals.map((i) => base + i) : pcs.map((p) => base + mod12(p - tonic));
  asc.push(base + 12);
  const line = [...asc, ...asc.slice(0, -1).reverse()];
  const events = line.map((m, i) => ({ t: round(i * stepBeats), dur: stepBeats, midi: m, vel: i === 0 || i === asc.length - 1 ? 0.8 : 0.6, role: 'melody', chordIndex: null }));
  const lengthBeats = round(line.length * stepBeats);
  events.unshift({ t: 0, dur: lengthBeats, midi: base - 24, vel: 0.4, role: 'drone', chordIndex: null });
  return { bpm, beatsPerChord: null, pattern: 'scale', lengthBeats, chords: [], events };
}

/** Inverse of progressionToSequence: window events by beatsPerChord, name each window (lowest note = bass). */
export function sequenceToProgression(seq, { beatsPerChord = seq.beatsPerChord || 4 } = {}) {
  const n = Math.ceil(seq.lengthBeats / beatsPerChord);
  const out = [];
  for (let w = 0; w < n; w++) {
    const lo = w * beatsPerChord, hi = lo + beatsPerChord;
    const evs = seq.events.filter((e) => e.t >= lo - 1e-9 && e.t < hi - 1e-9);
    if (!evs.length) continue;
    const bass = Math.min(...evs.map((e) => e.midi));
    out.push(identifyChord(evs.map((e) => e.midi), { bassPc: mod12(bass) }));
  }
  return out;
}

/** Sequence -> pitch-class set (ordered by first appearance). */
export function sequenceToNoteSet(seq) {
  const pcs = [];
  for (const e of [...seq.events].sort((a, b) => a.t - b.t || a.midi - b.midi)) {
    const p = mod12(e.midi);
    if (!pcs.includes(p)) pcs.push(p);
  }
  return pcs;
}

/**
 * Tense modifier (LOVE-VOCAB-v0): was = farther, more echo, falling tail; is = close, dry;
 * will = brighter, rising tail. Returns a new sequence; input untouched.
 */
export function applyTense(seq, tense = 'is') {
  if (!['was', 'is', 'will'].includes(tense)) throw new Error(`bad tense: ${tense}`);
  const events = seq.events.map((e) => ({ ...e }));
  if (tense === 'is') return { ...seq, tense, events };
  const top = events.reduce((a, e) => (e.midi > a.midi ? e : a), events[0]);
  const end = seq.lengthBeats;
  if (tense === 'was') {
    for (const e of events) e.vel = round(e.vel * 0.7);
    const echoes = events.filter((e) => e.role !== 'bass' && e.role !== 'drone').map((e) => ({ ...e, t: round(e.t + 0.75), vel: round(e.vel * 0.4), role: 'echo' }))
      .filter((e) => e.t < end);
    events.push(...echoes);
    events.push({ t: end, dur: 1, midi: top.midi - 2, vel: 0.35, role: 'tail', chordIndex: null });
    events.push({ t: end + 1, dur: 2, midi: top.midi - 4, vel: 0.25, role: 'tail', chordIndex: null });
  } else {
    for (const e of events) if (e.role !== 'bass' && e.role !== 'drone') e.vel = round(Math.min(1, e.vel * 1.1));
    events.push({ t: end, dur: 1, midi: top.midi + 2, vel: 0.6, role: 'tail', chordIndex: null });
    events.push({ t: end + 1, dur: 2, midi: top.midi + 5, vel: 0.7, role: 'tail', chordIndex: null });
  }
  events.sort((a, b) => a.t - b.t || a.midi - b.midi);
  return { ...seq, tense, lengthBeats: end + 3, events };
}

/**
 * Frame a sequence with the pinned word re-love (LOVE-VOCAB-v0): the love call D6 (MIDI 86),
 * answered by G5 (MIDI 79), then the piece. Jason's Heartbeats caption 16/18.
 */
export function addReLove(seq) {
  const shift = 2;
  const events = [
    { t: 0, dur: 2, midi: 86, vel: 0.9, role: 'love-call', chordIndex: null },
    { t: 1, dur: 2, midi: 79, vel: 0.8, role: 'love-answer', chordIndex: null },
    ...seq.events.map((e) => ({ ...e, t: round(e.t + shift) })),
  ];
  return { ...seq, reLove: true, lengthBeats: seq.lengthBeats + shift, events };
}

/** Transpose every event (and chord names) by n semitones. */
export function transposeSequence(seq, n) {
  return { ...seq, events: seq.events.map((e) => ({ ...e, midi: e.midi + n })) };
}

export { noteToPc };
