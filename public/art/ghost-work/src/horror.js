// Horror layer for the Day Dream CRT only. Every label on screen is canon:
//  - «человек на экране»: man in a cap with black eyes; edited out of PBS shows again and again,
//    at episode 166 he starts smiling with all his teeth (гл. 219–220);
//  - Day Dream redacts its documents with ■ (passim), gauges are drawn as ■■■□□□ (гл. 332);
//  - «См. ■■Запись № C16548.» / «См. отчёт об утилизации № C16548.» (гл. 222).
// «ОНЛАЙН: 2» is an approved mechanic, not a canon quote.
import { sfx, setContam } from "./audio.js";

const man = { calm: new Image(), teeth: new Image() };
man.calm.src = "man-calm.png"; man.teeth.src = "man-teeth.png";

export const HR = {
  contam: 0,          // 0..10
  watch: 0,           // seconds watched since last step
  flash: null,        // { where: "row"|"photo"|"bars"|"full", row, until, img }
  online: 0,          // timestamp until which «ОНЛАЙН: 2» shows
  red: null,          // redaction: { words:Set, start, dur }
  wi: 0,              // word counter while drawing
  on: false,
};
let redraw = () => {}, getView = () => "off", sync = () => {};
export function initHorror(o) { redraw = o.redraw; getView = o.getView; sync = o.sync; }

const ready = (im) => im.complete && im.naturalWidth;
export const manImg = () => (HR.contam >= 6 ? man.teeth : man.calm);

/* ---------- gauge ---------- */
export function gauge() { const n = HR.contam; return "■".repeat(n) + "□".repeat(10 - n); }
function bump(k = 1) {
  HR.contam = Math.min(10, HR.contam + k); setContam(HR.contam);
}

/* ---------- loop: time watched raises contamination, sightings get likelier ---------- */
let last = 0, raf = 0;
function tick(t) {
  raf = requestAnimationFrame(tick);
  if (!HR.on) return;
  const dt = last ? Math.min(0.1, (t - last) / 1000) : 0; last = t;
  const v = getView();
  if (v !== "list" && v !== "dossier") return;
  HR.watch += dt;
  if (HR.watch > 22) { HR.watch = 0; bump(); redraw(); }
  if (HR.flash && t > HR.flash.until) { HR.flash = null; redraw(); }
  if (HR.online && t > HR.online) { HR.online = 0; redraw(); }
  if (HR.red) { redraw(); if (t > HR.red.start + HR.red.dur + 50) HR.red = null; }
  // per-second chance of a sighting
  const p = (0.006 + HR.contam * 0.005) * dt;
  if (!HR.flash && HR.contam >= 1 && Math.random() < p) sighting(t, v);
}
export function startHorror() { HR.on = true; last = 0; if (!raf) raf = requestAnimationFrame(tick); }
export function stopHorror() { HR.on = false; HR.contam = 0; HR.watch = 0; HR.flash = null; HR.online = 0; HR.red = null; setContam(0); sticker(false); }

function sighting(t, v) {
  if (!ready(man.calm)) return;
  if (HR.contam >= 10) return breach(t);
  const img = manImg();
  HR.flash = v === "list" ? { where: "row", row: Math.floor(Math.random() * 6), until: t + 140 + Math.random() * 120, img }
                          : { where: "photo", until: t + 120 + Math.random() * 100, img };
  HR.online = t + 1800;
  bump(); sfx("glimpse"); sync(0.35); sticker(true); redraw();
}
// he fills the screen, then the editors cut him out again (гл. 220: «Они просто продолжали его удалять»)
function breach(t) {
  HR.flash = { where: "full", until: t + 420, img: man.teeth };
  sfx("breach"); sync(0.9); sticker(true); redraw();
  setTimeout(() => { HR.contam = 3; setContam(3); HR.flash = { where: "cut", until: performance.now() + 1600 }; redraw(); }, 450);
}

/* ---------- sticker on the TV body ---------- */
let stTimer = 0;
function sticker(alt) {
  const el = document.getElementById("tvsticker"); if (!el) return;
  el.querySelector("i").textContent = alt ? "См. ■■Запись № C16548." : "см. отчёт об утилизации № C16548";
  clearTimeout(stTimer); if (alt) stTimer = setTimeout(() => sticker(false), 9000);
}

/* ---------- redaction: a few words come up as ■ and burn through ---------- */
export function armRedaction(textLen) {
  if (HR.contam < 2 || Math.random() > 0.55) { HR.red = null; return; }
  const words = new Set(); const n = 1 + (HR.contam >= 6 ? 1 : 0);
  while (words.size < n && textLen > 4) words.add(2 + Math.floor(Math.random() * (textLen - 3)));
  HR.red = { words, start: performance.now() + 700, dur: 900 }; sfx("redact");
}
export function maskWord(w) {
  const i = HR.wi++;
  if (!HR.red || !HR.red.words.has(i) || w.length < 4) return w;
  const k = Math.max(0, Math.min(1, (performance.now() - HR.red.start) / HR.red.dur));
  const shown = Math.floor(k * w.length);
  return w.slice(0, shown) + "■".repeat(w.length - shown);
}
