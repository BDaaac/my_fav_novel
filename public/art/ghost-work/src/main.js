import { V1 as V1A } from "./dossiers-v1.js";
import { V1B } from "./dossiers-v1b.js";
import { V2 } from "./dossiers-v2.js";
const V1 = [...V1A, ...V1B];
import { sfx, unlock, ambient } from "./audio.js";
import { HR, initHorror, startHorror, stopHorror, gauge, armRedaction, maskWord, manImg } from "./horror.js";
addEventListener("pointerdown", () => { unlock(); ambient(); }, { once: true });
import * as THREE from "three";
import { CRTTerminal } from "cool-retro-term-renderer";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase);

/* ---------------- data (example; canon checked) ---------------- */
const VOLS = [
  { n: "I", r: "гл. 1–208" },
  { n: "II", r: "гл. 209–371" },
];
// each tape carries its own volume state; a volume without data yet shows an empty list
const BYVOL = { I: V1, II: V2 };
let DATA = V1, PEOPLE = [], IMGS = [];
function loadVol(v) {
  DATA = BYVOL[v.n] || [];
  PEOPLE = DATA.map((d, i) => [String(i + 1).padStart(2, "0"), d.name, d.call, d.dept.toUpperCase()]);
  IMGS = DATA.map((d) => { const im = new Image(); im.src = d.img; im.onload = () => { if (view === "list") drawList(); }; return im; });
}
loadVol({ n: "I" });

/* ---------------- stage fit ---------------- */
const stage = document.getElementById("stage");
let baseK = 1;
function fit() {
  baseK = Math.max(innerWidth / 1440, innerHeight / 900);
  gsap.set(stage, { x: (innerWidth - 1440 * baseK) / 2, y: (innerHeight - 900 * baseK) / 2, scale: baseK, transformOrigin: "0 0" });
}
fit();
addEventListener("resize", () => { if (!zoomed) fit(); });

/* ---------------- CRT screen ---------------- */
const crtBox = document.getElementById("crt");
const crt = new CRTTerminal({
  container: crtBox,
  fontColor: "#ece8de",
  backgroundColor: "#070808",
  screenCurvature: 0.35,
  rgbShift: 0,
  bloom: 0.28,
  brightness: 0.0,
  ambientLight: 0.06,
  chromaColor: 0.85,
  flickering: 0.12,
  horizontalSync: 0.08,
  jitter: 0.07,
  staticNoise: 0.08,
  glowingLine: 0.2,
  burnIn: 0.12,
  rasterizationMode: 1,
  rasterizationIntensity: 0.55,
});
const tt = crt.getTerminalText();
// the physical bezel is ours: paint the library frame black so the glass meets the rubber gasket
const fu = crt.terminalFrame.uniforms || crt.terminalFrame.material.uniforms;
if (fu && fu.frameColor) fu.frameColor.value.set(0, 0, 0, 1);
// our own picture instead of terminal text
const W = 960, H = 720;
const cv = document.createElement("canvas");
cv.width = W; cv.height = H;
const g = cv.getContext("2d");
const tex = new THREE.CanvasTexture(cv);
tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
tt.staticMaterial.uniforms.textTexture.value = tex;
tt.dynamicMaterial.uniforms.textTexture.value = tex;
tt.cursorVisible = false;
tt.setCursorVisible?.(false);
// keep our texture if the library re-renders its own text
const origRender = tt.render?.bind(tt);
tt.render = () => {};
function commit() { tex.needsUpdate = true; }

const PH = "#ece8de", DIM = "#aaa59a", GR = "#a4d6a6";
const hero = new Image(); hero.src = "kim-soleum.png"; hero.onerror = () => { hero.src = "hero.png"; };
const FONT = '"IBM Plex Mono", monospace', PIX = '"Press Start 2P", monospace';

function clear(c = "#0a0b0b") { g.fillStyle = c; g.fillRect(0, 0, W, H); }
let DRY = false;
function txt(s, x, y, size = 26, color = PH, font = FONT, align = "left") {
  if (DRY) return;
  g.font = `${size}px ${font}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = "alphabetic"; g.fillText(s, x, y);
}
function button(label, x, y, w) { g.strokeStyle = GR; g.lineWidth = 4; g.strokeRect(x, y, w, 56); txt(label, x + w / 2, y + 38, 26, GR, FONT, "center"); }
function drawNoise() {
  const id = g.createImageData(W / 4, H / 4);
  for (let i = 0; i < id.data.length; i += 4) { const v = (Math.random() * 230) | 0; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  const tmp = document.createElement("canvas"); tmp.width = W / 4; tmp.height = H / 4; tmp.getContext("2d").putImageData(id, 0, 0);
  g.imageSmoothingEnabled = false; g.drawImage(tmp, 0, 0, W, H); g.imageSmoothingEnabled = true; commit();
}
function drawBlue(tc, vol, trackY) {
  clear("#2a3d8f");
  txt("▶ PLAY", 70, 110, 40, "#eef1fb", PIX);
  txt("SP", W - 70, 110, 40, "#eef1fb", PIX, "right");
  txt(tc, 70, H - 80, 30, "#eef1fb", PIX);
  txt(`DAY DREAM · ТОМ ${vol.n}`, W - 70, H - 80, 26, "#cfd6f3", FONT, "right");
  if (trackY != null) { const gr = g.createLinearGradient(0, trackY - 30, 0, trackY + 30); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(.5, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, trackY - 30, W, 60); }
  commit();
}
const BARS = ["#d8d8c0", "#d6cc6e", "#6fc4bb", "#78bb69", "#b66aa9", "#bb5a50", "#5a66b8"];
function drawBars(vol) {
  clear("#111");
  const bw = W / 7;
  BARS.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * bw, 0, bw + 1, H * 0.62); });
  BARS.slice().reverse().forEach((c, i) => { g.fillStyle = i % 2 ? "#141414" : c; g.fillRect(i * bw, H * 0.62, bw + 1, H * 0.1); });
  g.fillStyle = "#0b120f"; g.fillRect(0, H * 0.72, W, H * 0.28);
  txt(`ТОМ ${vol.n}`, 70, H - 80, 64, PH, PIX);
  txt(vol.r, W - 70, H - 110, 30, PH, FONT, "right");
  txt("DAY DREAM INC. · ОТДЕЛ КАДРОВ", W - 70, H - 70, 22, DIM, FONT, "right");
  commit();
}
let sel = 0, view = "off", curVol = VOLS[0];
let top = 0;
function drawList() {
  clear();
  txt(`ТОМ ${curVol.n} · ЛИЧНЫЕ ДЕЛА`, 70, 90, 24, DIM);
  if (!PEOPLE.length) { txt("ЗАПИСИ ЭТОГО ТОМА ЕЩЁ НЕ ВНЕСЕНЫ", W / 2, 330, 26, DIM, FONT, "center"); button("Достать кассету", 320, H - 130, 340); commit(); return; }
  // 6-row window that follows the selection
  const ROWS = 6;
  if (sel < top) top = sel; if (sel >= top + ROWS) top = sel - ROWS + 1;
  if (HR.online) txt("ОНЛАЙН: 2", W - 70, 90, 24, PH, FONT, "right");
  else txt(`${String(top + 1).padStart(2, "0")}–${String(Math.min(top + ROWS, PEOPLE.length)).padStart(2, "0")} ИЗ ${PEOPLE.length}`, W - 70, 90, 24, DIM, FONT, "right");
  meter(W / 2 + 40, 88);
  if (flashFull()) return;
  ghost();
  if (top > 0) txt("▲", W / 2, 106, 16, DIM, FONT, "center");
  if (top + ROWS < PEOPLE.length) txt("▼", W / 2, 572, 16, DIM, FONT, "center");
  PEOPLE.slice(top, top + ROWS).forEach((p, k) => {
    const i = top + k, y = 112 + k * 74, on = i === sel;
    if (on) { g.fillStyle = "rgba(236,232,222,.10)"; g.fillRect(60, y, W - 120, 70); g.strokeStyle = PH; g.lineWidth = 3; g.strokeRect(60, y, W - 120, 70); }
    const fg = PH;
    txt(p[0], 84, y + 54, 26, fg);
    const im = HR.flash && HR.flash.where === "row" && HR.flash.row === k ? HR.flash.img : IMGS[i]; if (im.complete && im.naturalWidth) g.drawImage(im, 150, y + 6, 64, 64); else { g.strokeStyle = fg; g.lineWidth = 2; g.strokeRect(150, y + 6, 64, 64); }
    txt(p[1], 240, y + 54, 32, fg);
    if (p[2] !== "—") txt(p[2], W - 90, y + 40, 22, fg, FONT, "right");
    txt(p[3], W - 90, y + 68, 18, DIM, FONT, "right");
  });
  button("Досье", 70, H - 130, 220); button("Достать кассету", 320, H - 130, 340); txt("▲▼ выбор", W - 70, H - 92, 20, DIM, FONT, "right");
  commit();
}
function wrap(s, x, y, maxW, size = 24, lh = 34, color = PH) {
  g.font = `${size}px ${FONT}`; const words = DRY ? s.split(" ") : s.split(" ").map(maskWord); let line = "";
  for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { txt(line, x, y, size, color); y += lh; line = w; } else line = t; }
  if (line) { txt(line, x, y, size, color); y += lh; } return y;
}
// canon gauge look ■■■□□□□□□□ (гл. 332), drawn as squares so it does not depend on the font
function meter(cx, y) {
  const c = HR.contam >= 7 ? PH : DIM, sq = 11, gap = 4, bw = 10 * (sq + gap) - gap;
  g.font = `15px ${FONT}`; const lw = g.measureText("ЗАГРЯЗНЕНИЕ").width + 12, x0 = cx - (lw + bw) / 2;
  txt("ЗАГРЯЗНЕНИЕ", x0, y, 15, c);
  for (let k = 0; k < 10; k++) { const x = x0 + lw + k * (sq + gap); g.strokeStyle = c; g.lineWidth = 1.5;
    if (k < HR.contam) { g.fillStyle = c; g.fillRect(x, y - sq, sq, sq); } else g.strokeRect(x + .75, y - sq + .75, sq - 1.5, sq - 1.5); }
}
// faint figure standing behind the list once contamination is high
function ghost() {
  if (HR.contam < 5 || !HR.flash) return; const im = manImg(); if (!im.naturalWidth) return;
  g.save(); g.globalAlpha = 0.07 + HR.contam * 0.006; g.drawImage(im, W - 430, 120, 380, 380); g.restore();
}
// full-screen frame of him, then the «cut»
function flashFull() {
  const f = HR.flash; if (!f || (f.where !== "full" && f.where !== "cut")) return false;
  if (f.where === "full") { clear("#000"); if (f.img.naturalWidth) g.drawImage(f.img, (W - H) / 2, 0, H, H); }
  else { clear(); txt("См. отчёт об утилизации № C16548.", W / 2, H / 2, 24, DIM, FONT, "center"); }
  commit(); return true;
}
function redactSection() {
  const D = DATA[sel]; if (!D) return;
  const list = [D.who, D.job, D.life, D.gear, D.ties][sec];
  const text = typeof list === "string" ? list : list.map((r) => r[1]).join(" ");
  armRedaction(text.split(" ").length);
}
/* dossier, vol I state (end of ch. 208). Sources stay in data, not on screen. */
const KIM = {
  name: "Ким Соль Ым", call: "Косуля", status: "жив",
  head: [["позывной", "Косуля"], ["отдел", "Day Dream · полевые исследования, отряд D"], ["должность", "исследователь «Тьмы»"], ["статус", "жив, снова на контракте с компанией"]],
  who: "Бывший офисный работник. По дороге на работу зашёл во временный магазин «Записей исследований Тьмы» и оказался внутри этого мира историй о привидениях. Знает его вики лучше местных.",
  job: [["чем занимается", "заходит в «Тьмы» — зоны историй о привидениях, выполняет задания компании и выводит людей живыми"], ["руководитель", "Пак Мин Сон, отряд D"], ["под прикрытием", "агент «Виноград» в Бюро, команда Хёнму 1"], ["к концу тома", "подписал новый контракт и получил «очень важную должность»"]],
  life: [["возраст", "неизвестен; на вид двадцать с небольшим"], ["живёт", "в общежитии компании"], ["внешность", "растрёпанные волосы, очки"], ["характер", "боится ужасов, осторожен и вежлив, про себя ироничен; сначала читает правила, потом действует"]],
  gear: [["знания", "вики «Записей исследований Тьмы»"], ["Браун", "говорящий плюшевый «Хороший друг»"], ["Серебряный змей", "предмет, купленный со скидкой"], ["татуировка", "хранилище предметов на руке"]],
  ties: [["Пак Мин Сон", "руководитель отряда D"], ["Ын Ха Дже", "Сокол, коллега по отряду D"]],
};
let page = 0, dv = "A", sec = 0;
function photo(x, y, s) {
  const im = HR.flash && HR.flash.where === "photo" ? HR.flash.img : IMGS[sel]; if (im.complete && im.naturalWidth) g.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight, x, y, s, s);
  else { g.strokeStyle = DIM; g.lineWidth = 2; g.strokeRect(x, y, s, s); }
}
function rows(list, x, y, w, size = 22, labW = 0) {
  for (const [k, v] of list) {
    if (labW) { txt(k, x, y, size - 4, DIM); y = wrap(v, x + labW, y, w - labW, size, size + 8) + 10; }
    else { txt(k, x, y, size - 2, DIM); y = wrap(v, x, y + size + 8, w, size, size + 8) + 14; }
  }
  return y;
}
function head(title) {
  txt(`ТОМ ${curVol.n} · ДОСЬЕ ${PEOPLE[sel][0]}`, 70, 84, 22, DIM);
  txt(title, W - 70, 84, 22, DIM, FONT, "right");
}
function foot(next) { button("К списку", 70, H - 112, 220); if (next) button(next, 320, H - 112, 260); }
function tabs(names, on, y = 124) {
  let x = 70;
  names.forEach((n, i) => { g.font = `22px ${FONT}`; const w = g.measureText(n).width + 44;
    if (i === on) { g.fillStyle = "rgba(236,232,222,.14)"; g.fillRect(x, y - 30, w, 44); g.strokeStyle = PH; g.lineWidth = 2; g.strokeRect(x, y - 30, w, 44); }
    txt(n, x + 22, y, 22, i === on ? PH : DIM); x += w + 14; });
}
function drawDossier() {
  clear(); HR.wi = 0;
  if (flashFull()) return;
  const D = DATA[sel]; dv = "C";
  if (!D) { head(""); photo(70, 120, 240); txt(PEOPLE[sel][1].toUpperCase(), 350, 170, 30, PH, PIX); wrap("Досье в работе.", 350, 230, W - 420, 24, 34, DIM); foot(); commit(); return; }
  if (dv === "A") { // A · анкета: 2 страницы
    head(page === 0 ? "АНКЕТА 1/2" : "АНКЕТА 2/2");
    if (page === 0) {
      photo(70, 116, 230); txt(D.name.toUpperCase(), 330, 156, 30, PH, PIX);
      const y = rows(D.head, 330, 204, W - 400, 22, 170);
      wrap(D.who, 70, Math.max(y + 16, 390), W - 140, 23, 33);
    } else {
      txt("ЛИЧНОЕ", 70, 140, 20, PH, PIX); let y = rows(D.life, 70, 180, 400, 21);
      txt("ЧЕМ ВЛАДЕЕТ", 510, 140, 20, PH, PIX); rows(D.gear, 510, 180, 380, 21);
    }
    foot(page === 0 ? "Дальше ▶" : "◀ Назад");
  } else if (dv === "B") { // B · вкладки Работа / Личное
    head(D.name.toUpperCase());
    tabs(["Работа", "Личное"], page);
    photo(70, 170, 190);
    const x = 290, w = W - 360;
    if (page === 0) { let y = wrap(D.who, x, 194, w, 21, 30) + 16; rows(D.job.slice(0, 3), x, y, w, 21, 0); }
    else { let y = rows(D.life, x, 194, w, 21, 0); }
    foot();
  } else { // C · разделы слева, содержимое справа
    head(D.name.toUpperCase());
    const fit = (list) => { for (const z of [22, 21, 20, 19]) { DRY = true; const y = rows(list, 380, 150, W - 450, z); DRY = false; if (y < H - 50) return z; } return 18; };
    const S = [[D.she ? "Кто она" : "Кто он", () => wrap(D.who, 380, 150, W - 450, 23, 34)], ["Работа", () => rows(D.job, 380, 150, W - 450, fit(D.job))], ["Личное", () => rows(D.life, 380, 150, W - 450, fit(D.life))],
               ["Способности", () => rows(D.gear, 380, 150, W - 450, fit(D.gear))], ["Связи", () => rows(D.ties, 380, 150, W - 450, fit(D.ties))]];
    photo(70, 116, 150);
    S.forEach(([n], i) => { const y = 316 + i * 54;
      if (i === sec) { g.fillStyle = "rgba(236,232,222,.14)"; g.fillRect(70, y - 32, 260, 46); g.strokeStyle = PH; g.lineWidth = 2; g.strokeRect(70, y - 32, 260, 46); }
      txt(n, 90, y, 23, i === sec ? PH : DIM); });
    S[sec][1]();
    foot(); meter(W - 230, H - 74);
  }
  commit();
}
window.__pick = (i, s = 0) => { sel = i; sec = s; view = "dossier"; drawDossier(); };
initHorror({ redraw: () => { if (view === "list") drawList(); else if (view === "dossier") drawDossier(); }, getView: () => view,
  sync: (v) => { tt.setHorizontalSync(v); tt.setStaticNoise(0.06 + v * 0.4); gsap.delayedCall(0.25, () => { tt.setHorizontalSync(0.04); tt.setStaticNoise(0.06); }); } });
window.__hr = HR;
clear("#000"); commit();

/* ---------------- tapes ---------------- */
const tapesEl = document.getElementById("tapes");
const SLOT = { x: 686, y: 624, w: 250, h: 22 }; // in rig coords
// tapes are static markup in index.html so they show before this bundle loads
const tapes = [...tapesEl.children];
const home = (i) => ({ x: 790 + (i % 2) * 8, y: 562 - i * 40, rotation: [-1, 1.2, -0.6][i] });
let lifted = null, busy = false, inserted = null;
// stack slot = position among tapes still on the deck, so the pile settles when one is taken
const slotOf = (el) => tapes.filter((t) => t !== inserted && t !== lifted).indexOf(el);
function restack() { tapes.forEach((t) => { if (t !== inserted && t !== lifted) { const h = home(slotOf(t)); gsap.to(t, { x: h.x, y: h.y, duration: 0.35, delay: 0.05, ease: "power2.in" }); } }); }
function layHome(el, i, animate) {
  const h = home(slotOf(el) < 0 ? i : slotOf(el));
  const vars = { x: h.x, y: h.y, rotation: h.rotation, rotationX: 0, scale: 1 };
  el.classList.remove("held");
  animate ? gsap.to(el, { ...vars, duration: 0.7, ease: "back.out(1.6)" }) : gsap.set(el, vars);
}
tapes.forEach((t, i) => layHome(t, i, false));

const shadow = document.getElementById("liftshadow");

tapes.forEach((el, i) => {
  let lastX = 0;
  Draggable.create(el, {
    type: "x,y",
    inertia: true,
    zIndexBoost: true,
    minimumMovement: 4,
    onPress() {
      if (busy || inserted) return this.endDrag();
      el.classList.add("held"); lifted = el; restack();
      gsap.to(el, { scale: 1.06, rotationX: 0, duration: 0.2, ease: "power2.out" });
      sfx("pick");
    },
    onDrag() {
      // tilt follows hand velocity: feels like a held object with weight
      const vx = InertiaPlugin.getVelocity(el, "x");
      gsap.to(el, { rotation: gsap.utils.clamp(-14, 14, vx / 90), duration: 0.35, ease: "power2.out", overwrite: "auto" });
      const near = nearSlot(el);
      document.getElementById("vcr").classList.toggle("ready", near);
    },
    onRelease() {
      if (busy || inserted) return;
      if (nearSlot(el)) { this.tween && this.tween.kill(); insert(el, i); }
    },
    onThrowComplete() { if (!busy && !inserted) { lifted = null; layHome(el, i, true); restack(); sfx("drop"); } },
    onClick() { if (!busy && !inserted) autoCarry(el, i); },
  });
});
function nearSlot(el) {
  const x = gsap.getProperty(el, "x"), y = gsap.getProperty(el, "y");
  return Math.abs(x + 118 - (SLOT.x + SLOT.w / 2)) < 140 && Math.abs(y + 20 - SLOT.y) < 110;
}
// click = the hand carries it for you along an arc
function autoCarry(el, i) {
  busy = true; el.classList.add("held"); lifted = el; restack();
  const tl = gsap.timeline({ onComplete: () => { busy = false; insert(el, i); } });
  tl.to(el, { scale: 1.06, y: "-=40", rotation: -8, duration: 0.35, ease: "power2.out" })
    .to(el, { x: SLOT.x + SLOT.w / 2 - 118, duration: 0.8, ease: "power2.inOut" }, 0.25)
    .to(el, { y: SLOT.y - 150, duration: 0.4, ease: "power2.out" }, 0.25)
    .to(el, { y: SLOT.y - 20, rotation: 2, duration: 0.4, ease: "power2.in" }, 0.65)
    .to(el, { rotation: 0, duration: 0.2 }, 1.0);
}

/* ---------------- insertion: align → resist → deck grabs ---------------- */
CustomEase.create("deckPull", "M0,0 C0.25,0.02 0.35,0.12 0.42,0.18 0.5,0.24 0.55,0.25 0.6,0.3 0.72,0.42 0.8,0.98 1,1");
function insert(el, i) {
  busy = true; inserted = el; lifted = null; curVol = VOLS[i]; loadVol(curVol);
  document.getElementById("vcr").classList.remove("ready");
  const cx = SLOT.x + SLOT.w / 2 - 118;
  const tl = gsap.timeline({ onComplete: () => { busy = false; } });
  tl.to(el, { x: cx, y: SLOT.y - 34, rotation: 0, scale: 1, duration: 0.35, ease: "power3.out" })
    // tape tips over to slide in flat (we see its top, label up)
    .add(() => el.classList.add("entering"))
    .to(el, { rotationX: 62, transformOrigin: "50% 100%", duration: 0.3, ease: "power2.inOut" })
    .to("#flap", { rotationX: -75, duration: 0.18, ease: "power2.out" }, "-=0.08")
    .add(() => sfx("push"))
    // hand pushes in, meets resistance, then the deck mechanism pulls
    .to(el, { y: SLOT.y - 6, clipPath: "inset(0 0 22% 0)", duration: 0.8, ease: "deckPull" })
    .to(el, { y: SLOT.y + 30, clipPath: "inset(0 0 100% 0)", duration: 0.35, ease: "expo.in" })
    .add(() => sfx("thunk"))
    .to("#flap", { rotationX: 0, duration: 0.12, ease: "power1.in" })
    .to("#vcr", { y: "+=3", duration: 0.05, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<")
    .add(() => { el.style.visibility = "hidden"; setDisp("LOAD"); sfx("motor"); })
    .add(() => setDisp("▶ PLAY"), "+=0.9")
    .add(() => powerOn(), "+=0.1");
}
function setDisp(s) { const d = document.getElementById("disp"); d.textContent = s; d.classList.add("on"); }

/* ---------------- TV on: line → tube warms → VHS blue → bars → DB ---------------- */
function powerOn() {
  document.getElementById("led").classList.add("on"); gsap.to("#glow", { opacity: 1, duration: 1.2, delay: 0.3 });
  sfx("power");
  const s = { b: 0, n: 0.9, hs: 0.6 };
  const apply = () => { tt.setBrightness(s.b); tt.setStaticNoise(s.n); tt.setHorizontalSync(s.hs); };
  const tl = gsap.timeline();
  tl.set("#flash", { opacity: 1, scaleX: 0.02, scaleY: 1 })
    .to("#flash", { scaleX: 1, duration: 0.16, ease: "power2.out" })
    .add(() => { view = "noise"; noiseLoop(); })
    .to("#flash", { scaleY: 90, opacity: 0, duration: 0.28, ease: "power3.in" })
    .to(s, { b: 0.45, duration: 0.6, ease: "power2.out", onUpdate: apply }, "<")
    .add(() => { view = "blue"; }, "+=0.5")
    .to(s, { n: 0.06, hs: 0.04, duration: 0.6, onUpdate: apply }, "<")
    .add(() => blueRoll(), "<")
    .add(() => { view = "bars"; drawBars(curVol); gsap.fromTo(s, { hs: 0.5 }, { hs: 0.04, duration: 0.5, onUpdate: apply }); }, "+=1.6")
    .add(() => zoomIn(), "+=1.2")
    .add(() => { view = "list"; sel = 0; top = 0; drawList(); startHorror(); gsap.fromTo(s, { hs: 0.4 }, { hs: 0.04, duration: 0.35, onUpdate: apply }); }, "+=0.6");
}
function noiseLoop() { if (view !== "noise") return; drawNoise(); requestAnimationFrame(noiseLoop); }
function blueRoll() {
  const st = { y: -60, t: 0 };
  gsap.to(st, { y: H + 60, duration: 0.8, repeat: 1, ease: "none", onUpdate: () => { if (view === "blue") drawBlue(`0:00:0${Math.floor(st.t)}`, curVol, st.y); } });
  gsap.to(st, { t: 3, duration: 1.6, ease: "none" });
}

/* ---------------- camera ---------------- */
let zoomed = false;
function zoomIn() {
  zoomed = true; gsap.to("#hint", { autoAlpha: 0, duration: 0.3 });
  const R = { x: 255, y: 209, s: 0.7 }; // #rig transform
  const b = { x: R.x + 46 * R.s, y: R.y + 285 * R.s, w: 548 * R.s, h: 350 * R.s }; // TV body edge-to-edge, glass fully in view, no room behind
  const k = Math.max(innerWidth / b.w, innerHeight / (430 * R.s));
  gsap.to(stage, { scale: k, x: innerWidth / 2 - (b.x + b.w / 2) * k, y: innerHeight / 2 - (b.y + b.h / 2) * k, duration: 1.3, ease: "power3.inOut" });
}
function zoomOut() { zoomed = false; gsap.to("#hint", { autoAlpha: 1, duration: 0.4, delay: 0.8 }); gsap.to(stage, { scale: baseK, x: (innerWidth - 1440 * baseK) / 2, y: (innerHeight - 900 * baseK) / 2, duration: 1.1, ease: "power3.inOut" }); }

addEventListener("wheel", (e) => {
  if (view !== "list" || !PEOPLE.length) return;
  sel = Math.max(0, Math.min(PEOPLE.length - 1, sel + Math.sign(e.deltaY))); drawList(); sfx("tick");
}, { passive: true });
addEventListener("keydown", (e) => {
  if (view === "list") {
    if (!PEOPLE.length) { if (e.key === "Escape") eject(); return; }
    if (e.key === "ArrowDown") { sel = (sel + 1) % PEOPLE.length; drawList(); sfx("tick"); }
    if (e.key === "ArrowUp") { sel = (sel + PEOPLE.length - 1) % PEOPLE.length; drawList(); sfx("tick"); }
    if (e.key === "Enter") { view = "dossier"; page = 0; sec = 0; redactSection(); drawDossier(); sfx("tick"); }
    if (e.key === "Escape") eject();
  } else if (view === "dossier") {
    if (e.key === "Escape") { view = "list"; drawList(); }
    if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && false) {}
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { sec = (sec + (e.key === "ArrowDown" ? 1 : 4)) % 5; redactSection(); drawDossier(); sfx("tick"); }
  }
});
function eject() {
  if (!inserted) return;
  view = "off"; sfx("eject"); stopHorror();
  const el = inserted, i = +el.dataset.i;
  gsap.timeline()
    .add(() => { clear("#000"); commit(); tt.setBrightness(0); document.getElementById("led").classList.remove("on"); gsap.to("#glow", { opacity: 0, duration: 0.4 }); const d = document.getElementById("disp"); d.textContent = "EJECT"; })
    .add(() => zoomOut())
    .add(() => { el.style.visibility = "visible"; el.classList.remove("entering"); gsap.set(el, { clipPath: "inset(0 0 0% 0)", rotationX: 0, y: SLOT.y - 40 }); }, "+=1.1")
    .to("#flap", { rotationX: -75, duration: 0.12 }, "<")
    .to("#flap", { rotationX: 0, duration: 0.15 }, "+=0.25")
    .add(() => { inserted = null; layHome(el, i, true); restack(); const d = document.getElementById("disp"); d.textContent = "--:--"; d.classList.remove("on"); });
}

/* ---------------- sound hooks (CC0 files to be picked with the user) ---------------- */
// sound: synthesized in audio.js (unlocked on first pointer press)

/* debug / capture */
window.__demo = (i = 0) => autoCarry(tapes[i], i);
window.__crt = crt;
