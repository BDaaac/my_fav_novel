// Synthesized sound: no sample files. Idea (one tape state drives hum, hiss, motor and clicks)
// taken from iverene/the-cassette-player; the code here is our own.
let ac = null, master = null, hum = null, hiss = null;

export function unlock() {
  if (ac) { if (ac.state === "suspended") ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
}

function noiseBuf(sec = 1) {
  const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function burst({ f = 2000, q = 1, type = "bandpass", a = 0.002, peak = 0.5, d = 0.06, at = 0 } = {}) {
  const t = ac.currentTime + at, s = ac.createBufferSource(); s.buffer = noiseBuf(0.5);
  const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  const g = ac.createGain(); env(g, t, a, peak, d); s.connect(fl).connect(g).connect(master); s.start(t); s.stop(t + a + d + 0.05);
}
function tone({ f = 120, f2 = f, type = "sine", a = 0.005, peak = 0.3, d = 0.15, at = 0 } = {}) {
  const t = ac.currentTime + at, o = ac.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t + a + d);
  const g = ac.createGain(); env(g, t, a, peak, d); o.connect(g).connect(master); o.start(t); o.stop(t + a + d + 0.05);
}

const S = {
  pick() { burst({ f: 3200, q: 2, peak: 0.25, d: 0.03 }); burst({ f: 900, q: 1, peak: 0.15, d: 0.05, at: 0.02 }); },
  drop() { tone({ f: 140, f2: 60, peak: 0.35, d: 0.12 }); burst({ f: 1500, q: 1.5, peak: 0.25, d: 0.06 }); burst({ f: 1800, q: 2, peak: 0.12, d: 0.04, at: 0.09 }); },
  push() { burst({ f: 1200, q: 0.8, a: 0.05, peak: 0.12, d: 0.6 }); },
  thunk() { tone({ f: 95, f2: 45, peak: 0.6, d: 0.18 }); burst({ f: 600, q: 1, peak: 0.4, d: 0.08 }); burst({ f: 2600, q: 3, peak: 0.2, d: 0.03, at: 0.05 }); },
  motor() { // spin-up whirr, then reels settle
    const t = ac.currentTime, o = ac.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(40, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.6); o.frequency.exponentialRampToValueAtTime(110, t + 1.0);
    const fl = ac.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 700;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(fl).connect(g).connect(master); o.start(t); o.stop(t + 1.2);
    for (let k = 0; k < 3; k++) burst({ f: 2400, q: 4, peak: 0.08, d: 0.02, at: 0.2 + k * 0.17 });
  },
  power() { // CRT: relay clack, degauss «bwoom» with wobble, static crackle, rising flyback whine
    burst({ f: 2200, q: 2, peak: 0.35, d: 0.025 });
    degauss();
    for (let k = 0; k < 14; k++) burst({ f: 3000 + Math.random() * 5000, q: 6, peak: 0.05 + Math.random() * 0.1, d: 0.01, at: 0.15 + Math.random() * 1.1 });
    const t = ac.currentTime, o = ac.createOscillator(); o.frequency.setValueAtTime(9000, t); o.frequency.linearRampToValueAtTime(15200, t + 0.8);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    o.connect(g).connect(master); o.start(t); o.stop(t + 2.7);
    startHum();
  },
  tick() { tone({ f: 1800, f2: 1700, type: "square", peak: 0.04, d: 0.03 }); },
  glimpse() { // he is in the frame: tape drags, picture tears
    const t = ac.currentTime, o = ac.createOscillator(); o.type = "sawtooth";
    o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.35);
    const fl = ac.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 1400;
    const g = ac.createGain(); env(g, t, 0.005, 0.18, 0.4); o.connect(fl).connect(g).connect(master); o.start(t); o.stop(t + 0.5);
    burst({ f: 1800, q: 0.5, peak: 0.25, d: 0.18 }); wow(0.6);
  },
  breach() { // the whole screen is him: low cluster + noise swell
    const t = ac.currentTime;
    [55, 58.3, 82.4, 116.5].forEach((f, i) => { const o = ac.createOscillator(); o.type = i % 2 ? "sawtooth" : "triangle"; o.frequency.value = f;
      const fl = ac.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 600;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o.connect(fl).connect(g).connect(master); o.start(t); o.stop(t + 2.3); });
    burst({ f: 900, q: 0.3, a: 0.05, peak: 0.45, d: 0.8 }); wow(1.5);
  },
  redact() { for (let k = 0; k < 6; k++) burst({ f: 4200, q: 8, peak: 0.04, d: 0.008, at: 0.7 + k * 0.15 }); },
  eject() { S.thunk(); burst({ f: 900, q: 0.8, a: 0.03, peak: 0.15, d: 0.4, at: 0.15 }); stopHum(); },
};

function degauss() {
  const t = ac.currentTime, o = ac.createOscillator(); o.frequency.value = 58;
  const am = ac.createOscillator(); am.frequency.setValueAtTime(11, t); am.frequency.linearRampToValueAtTime(5, t + 1.2);
  const amg = ac.createGain(); amg.gain.value = 0.25; am.connect(amg);
  const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  amg.connect(g.gain); o.connect(g).connect(master); o.start(t); am.start(t); o.stop(t + 1.4); am.stop(t + 1.4);
}
// tape speed wobble: the hum bends for a moment
function wow(d) {
  if (!hum) return; const t = ac.currentTime;
  [hum.o, hum.o2].forEach((o, i) => { const f = (i ? 120 : 60) + level * 0.15 * (i + 1);
    o.frequency.cancelScheduledValues(t); o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 0.82, t + d * 0.3); o.frequency.linearRampToValueAtTime(f, t + d); });
}
// room tone of the night office: HVAC rumble + fluorescent buzz; always on once sound is unlocked
let amb = null;
export function ambient() {
  try { unlock(); if (amb) return; const t = ac.currentTime;
    const s = ac.createBufferSource(); s.buffer = noiseBuf(3); s.loop = true;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320;
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 3);
    s.connect(lp).connect(g).connect(master); s.start();
    const b = ac.createOscillator(); b.type = "square"; b.frequency.value = 120;
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 240; bp.Q.value = 6;
    const bg = ac.createGain(); bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.006, t + 3);
    b.connect(bp).connect(bg).connect(master); b.start();
    amb = { s, b }; crackle();
  } catch (e) {}
}
// sparse static pops from the tube while it is on; more of them as contamination grows
function crackle() {
  setTimeout(crackle, 1500 + Math.random() * (4500 - level * 300));
  if (!hum) return;
  const n = 1 + Math.floor(Math.random() * (2 + level / 3));
  for (let k = 0; k < n; k++) burst({ f: 2500 + Math.random() * 6000, q: 5, peak: 0.02 + Math.random() * 0.04 + level * 0.004, d: 0.008, at: k * 0.04 });
}
let level = 0, whine = null;
export function setContam(n) {
  level = n; if (!ac || !hum) return; const t = ac.currentTime;
  hum.o.frequency.setTargetAtTime(60 + n * 0.15, t, 0.5); hum.o2.frequency.setTargetAtTime(120 + n * 0.3, t, 0.5); // beating grows
  hum.hg.gain.setTargetAtTime(0.025 + n * 0.004, t, 0.5); hiss.sg.gain.setTargetAtTime(0.018 + n * 0.003, t, 0.5);
}
function startHum() { // mains hum + tape hiss while the tape plays
  if (hum) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(); o.frequency.value = 60; const o2 = ac.createOscillator(); o2.frequency.value = 120;
  const hg = ac.createGain(); hg.gain.setValueAtTime(0.0001, t); hg.gain.exponentialRampToValueAtTime(0.025, t + 1.5);
  o.connect(hg); o2.connect(hg); hg.connect(master); o.start(); o2.start();
  const s = ac.createBufferSource(); s.buffer = noiseBuf(2); s.loop = true;
  const fl = ac.createBiquadFilter(); fl.type = "highpass"; fl.frequency.value = 5000;
  const sg = ac.createGain(); sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.018, t + 1.5);
  s.connect(fl).connect(sg).connect(master); s.start();
  const w = ac.createOscillator(); w.frequency.value = 15734; const wg = ac.createGain(); wg.gain.value = 0.0025; w.connect(wg).connect(master); w.start();
  hum = { o, o2, hg, w }; hiss = { s, sg };
}
function stopHum() {
  if (!hum) return; const t = ac.currentTime;
  hum.hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); hiss.sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  const h = hum, z = hiss; setTimeout(() => { h.o.stop(); h.o2.stop(); h.w.stop(); z.s.stop(); }, 600); hum = hiss = null;
}

export function sfx(name) { try { unlock(); S[name] && S[name](); } catch (e) { /* audio is optional */ } }
