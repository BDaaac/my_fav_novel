"use client";

import * as THREE from "three";
import type { Book } from "@/shelf/Shelf";

/**
 * Procedural cardboard handling patina, corner creases, and paper-fiber edge scuffs
 * matching authentic worn 1990s archival VHS rental slipcases.
 */
function drawCardboardWear(ctx: CanvasRenderingContext2D, width: number, height: number, seed = 2026) {
  let s = seed | 0;
  const rand = () => {
    s = (Math.imul(16807, s) & 0x7fffffff) || 1;
    return s / 0x7fffffff;
  };
  const wearCol = (alpha: number) => `rgba(236, 229, 212, ${alpha})`;

  // Warm handling patina
  ctx.fillStyle = "rgba(182, 152, 104, 0.07)";
  ctx.fillRect(0, 0, width, height);

  // Subtle cardboard edge depth vignette
  const rad = ctx.createRadialGradient(width / 2, height / 2, 0.28 * height, width / 2, height / 2, 0.74 * height);
  rad.addColorStop(0, "rgba(0, 0, 0, 0)");
  rad.addColorStop(1, "rgba(6, 5, 4, 0.42)");
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, width, height);

  // Subtle handling blotches
  for (let t = 0; t < 6; t++) {
    const cx = rand() * width;
    const cy = rand() * height;
    const r = 55 + 165 * rand();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(34, 24, 14, ${0.06 + 0.07 * rand()})`);
    g.addColorStop(1, "rgba(34, 24, 14, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Cardboard border white paper-core scuffs
  const scuffEdge = (len: number, at: (d: number, off: number) => [number, number], vertical: boolean) => {
    for (let d = 0; d < len; d += 2.2 + 5 * rand()) {
      if (rand() < 0.14) d += 52 * rand();
      const off = Math.pow(rand(), 2.15) * 22;
      const [x, y] = at(d, off);
      const rx = 1.4 + rand() * (off < 6 ? 6.5 : 3.2);
      const ry = 0.8 + 2.0 * rand();
      ctx.fillStyle = wearCol(off < 5 ? 0.52 + 0.36 * rand() : 0.18 + 0.28 * rand());
      ctx.beginPath();
      ctx.ellipse(x, y, vertical ? ry : rx, vertical ? rx : ry, (rand() - 0.5) * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  scuffEdge(width, (d, off) => [d, 3 + off], false);
  scuffEdge(width, (d, off) => [d, height - 3 - off], false);
  scuffEdge(height, (d, off) => [3 + off, d], true);
  scuffEdge(height, (d, off) => [width - 3 - off, d], true);

  // Vertical folding crease line near left spine edge
  const crease = ctx.createLinearGradient(12, 0, 26, 0);
  crease.addColorStop(0, "rgba(255,248,232,0.16)");
  crease.addColorStop(0.45, "rgba(0,0,0,0.34)");
  crease.addColorStop(1, "rgba(255,248,232,0)");
  ctx.fillStyle = crease;
  ctx.fillRect(12, 0, 14, height);
}

function hashStr(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) || 1337;
}

function drawVhsFrontLayout(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  book: Book,
  index: number,
  img: HTMLImageElement | null,
) {
  const num = String(index + 1).padStart(2, "0");

  // 0. Готовый рукав (book.sleeve): на нём уже есть название, окно с картинкой, значок VHS и потёртости —
  //    кладём его целиком и ничего не надпечатываем поверх.
  if (book.sleeve && img && img.naturalWidth > 0) {
    ctx.fillStyle = "#0b0b0c";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return;
  }

  // 1. Base sleeve color
  ctx.fillStyle = book.spine.bg || "#15171e";
  ctx.fillRect(0, 0, w, h);

  // 2. Real cover artwork filling the slipcase face
  if (img && img.naturalWidth > 0) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (w - dw) / 2;
    const dy = book.coverPos === "bottom" ? h - dh : (h - dh) * 0.22;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else {
    // Styled fallback typography plate when a book has no cover yet
    ctx.fillStyle = book.spine.ink;
    ctx.font = "700 44px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(book.short || book.title, w / 2, h * 0.46, w - 64);
  }

  // 3. Top & bottom atmospheric print bands so VHS rental graphics always read crisply
  const topGrad = ctx.createLinearGradient(0, 0, 0, 128);
  topGrad.addColorStop(0, "rgba(8, 9, 12, 0.88)");
  topGrad.addColorStop(0.55, "rgba(8, 9, 12, 0.46)");
  topGrad.addColorStop(1, "rgba(8, 9, 12, 0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, 128);

  const botGrad = ctx.createLinearGradient(0, h - 180, 0, h);
  botGrad.addColorStop(0, "rgba(8, 9, 12, 0)");
  botGrad.addColorStop(0.45, "rgba(8, 9, 12, 0.72)");
  botGrad.addColorStop(1, "rgba(6, 7, 10, 0.94)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, h - 180, w, 180);

  // 4. Accent color top/bottom rental sleeve rules
  ctx.fillStyle = book.spine.band;
  ctx.fillRect(24, 24, w - 48, 3);
  ctx.fillRect(24, h - 28, w - 48, 2);

  // 5. Top archival VHS broadcast strip
  ctx.font = "600 16px monospace";
  ctx.fillStyle = "rgba(242, 236, 222, 0.88)";
  ctx.textAlign = "left";
  ctx.fillText(`TAPE.${num} // SP-180`, 28, 52);
  ctx.textAlign = "right";
  ctx.fillStyle = book.spine.band;
  ctx.fillText("HI-FI STEREO", w - 28, 52);

  // 6. Bottom VHS label block: Russian short title + authentic VHS badge + chapters count
  ctx.textAlign = "left";
  ctx.fillStyle = "#f4efe2";
  ctx.font = "700 32px Georgia, serif";
  const labelTitle = (book.short || book.title).toUpperCase();
  ctx.fillText(labelTitle, 28, h - 84, w - 56);

  // VHS logo box bottom-left
  ctx.strokeStyle = "rgba(242, 236, 222, 0.82)";
  ctx.lineWidth = 2;
  ctx.strokeRect(28, h - 66, 68, 26);
  ctx.font = "700 17px monospace";
  ctx.fillStyle = "#f4efe2";
  ctx.fillText("VHS", 44, h - 47);

  // Serial & chapter count bottom-right
  ctx.textAlign = "right";
  ctx.font = "600 16px monospace";
  ctx.fillStyle = "rgba(232, 226, 210, 0.82)";
  ctx.fillText(`${book.chapters} ГЛ. · ARC-${num}`, w - 28, h - 47);

  // 7. Procedural cardboard wear & edge scuffs
  drawCardboardWear(ctx, w, h, hashStr(book.slug) + index * 97);
}

/**
 * Generates both a Three.js CanvasTexture (for the 3D VHS slipcase) and a data URL
 * (for the 2D Playback & Vault Matrix cards) using the novel's real cover artwork.
 */
export function createSlipcaseTexture(book: Book, index: number, onReady?: (dataUrl: string) => void): THREE.CanvasTexture {
  const w = 512;
  const h = 820;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  drawVhsFrontLayout(ctx, w, h, book, index, null);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const src = book.vitrineCover ?? book.cover;
  if (src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, w, h);
      drawVhsFrontLayout(ctx, w, h, book, index, img);
      tex.needsUpdate = true;
      onReady?.(canvas.toDataURL("image/webp", 0.86));
    };
    img.onerror = () => {
      onReady?.(canvas.toDataURL("image/webp", 0.86));
    };
    img.src = src;
  } else {
    onReady?.(canvas.toDataURL("image/webp", 0.86));
  }

  return tex;
}

/** Generates worn VHS cardboard spine texture tailored to the novel's palette. */
export function createSpineTexture(book: Book, index: number): THREE.CanvasTexture {
  const w = 128;
  const h = 820;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const num = String(index + 1).padStart(2, "0");

  ctx.fillStyle = book.spine.bg || "#171920";
  ctx.fillRect(0, 0, w, h);

  // Top & bottom color bands
  ctx.fillStyle = book.spine.band;
  ctx.fillRect(0, 56, w, 14);
  ctx.fillRect(0, h - 110, w, 8);

  // Catalog number on top
  ctx.fillStyle = book.spine.ink;
  ctx.font = "700 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText(num, w / 2, 42);

  // Vertical title down the spine
  ctx.save();
  ctx.translate(w / 2, h * 0.48);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = book.spine.ink;
  ctx.font = "700 28px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((book.short || book.title).toUpperCase(), 0, 0, h - 280);
  ctx.restore();

  // Bottom VHS badge
  ctx.strokeStyle = book.spine.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, h - 76, w - 48, 34);
  ctx.font = "700 18px monospace";
  ctx.fillStyle = book.spine.ink;
  ctx.fillText("VHS", w / 2, h - 52);

  drawCardboardWear(ctx, w, h, hashStr(book.slug + "-spine"));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

let cachedCassetteMaterials: THREE.Material[] | null = null;

/**
 * Procedural molded matte-black plastic VHS cassette body (singleton across all tapes).
 * Renders authentic dual tape windows, toothed white VHS reels, wound magnetic ribbon,
 * molded housing ribs, adhesive spine sticker, and hinged top dust flap.
 */
export function getSharedCassetteMaterials(): THREE.Material[] {
  if (cachedCassetteMaterials) return cachedCassetteMaterials;

  // Front face of the VHS cassette (shown peeking out of the top of the slipcase!)
  const fw = 512;
  const fh = 820;
  const fc = document.createElement("canvas");
  fc.width = fw;
  fc.height = fh;
  const g = fc.getContext("2d")!;

  // Matte-black ABS plastic shell
  g.fillStyle = "#181a1f";
  g.fillRect(0, 0, fw, fh);

  // Fine molded plastic grain
  for (let i = 0; i < 6500; i++) {
    const x = (i * 97) % fw;
    const y = (i * 53) % fh;
    g.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.09)";
    g.fillRect(x, y, 2, 2);
  }

  // Top dust-flap seam & molded ridges (the part visible when peeking out of the sleeve!)
  g.fillStyle = "#101216";
  g.fillRect(0, 0, fw, 36);
  g.fillStyle = "rgba(255,255,255,0.09)";
  g.fillRect(0, 36, fw, 2);

  // Horizontal grip ribs along the upper shoulders
  for (let r = 0; r < 6; r++) {
    const ry = 52 + r * 12;
    g.fillStyle = "#0e1014";
    g.fillRect(18, ry, 76, 5);
    g.fillRect(fw - 94, ry, 76, 5);
    g.fillStyle = "rgba(255,255,255,0.06)";
    g.fillRect(18, ry + 5, 76, 1.5);
    g.fillRect(fw - 94, ry + 5, 76, 1.5);
  }

  // Dual recessed tape-reel window bay (prominently positioned near top so BOTH reels show cleanly during peek!)
  const bayX = 112;
  const bayY = 54;
  const bayW = fw - 224;
  const bayH = 126;

  // Recessed smoked-acrylic window frame
  g.fillStyle = "#090a0d";
  g.fillRect(bayX - 6, bayY - 6, bayW + 12, bayH + 12);
  g.strokeStyle = "rgba(255,255,255,0.14)";
  g.lineWidth = 2;
  g.strokeRect(bayX - 6, bayY - 6, bayW + 12, bayH + 12);

  // Dark magnetic tape ribbon wound around spools inside the window
  g.fillStyle = "#141112";
  g.fillRect(bayX, bayY, bayW, bayH);

  const drawReel = (cx: number, cy: number, tapeR: number) => {
    // Magnetic tape pack
    g.fillStyle = "#1d1817";
    g.beginPath();
    g.arc(cx, cy, tapeR, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.06)";
    g.lineWidth = 1;
    for (let rr = 34; rr < tapeR; rr += 5) {
      g.beginPath();
      g.arc(cx, cy, rr, 0, Math.PI * 2);
      g.stroke();
    }

    // White molded plastic VHS spool hub
    g.fillStyle = "#dedad0";
    g.beginPath();
    g.arc(cx, cy, 31, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#13151a";
    g.beginPath();
    g.arc(cx, cy, 20, 0, Math.PI * 2);
    g.fill();

    // 6 inner drive gear teeth
    g.fillStyle = "#e6e2d8";
    for (let t = 0; t < 6; t++) {
      const a = (t / 6) * Math.PI * 2;
      g.save();
      g.translate(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16);
      g.rotate(a);
      g.fillRect(-4, -3, 8, 6);
      g.restore();
    }
  };

  g.save();
  g.beginPath();
  g.rect(bayX, bayY, bayW, bayH);
  g.clip();
  drawReel(bayX + 74, bayY + bayH / 2, 58);
  drawReel(bayX + bayW - 74, bayY + bayH / 2, 49);
  // Subtle diagonal glass reflection across the tape window
  const winRefl = g.createLinearGradient(bayX, bayY, bayX + bayW, bayY + bayH);
  winRefl.addColorStop(0, "rgba(255,255,255,0.12)");
  winRefl.addColorStop(0.45, "rgba(255,255,255,0.03)");
  winRefl.addColorStop(0.5, "rgba(255,255,255,0)");
  g.fillStyle = winRefl;
  g.fillRect(bayX, bayY, bayW, bayH);
  g.restore();

  // Center separator bridge + tiny calibration ticks
  g.fillStyle = "#181a1f";
  g.fillRect(fw / 2 - 14, bayY - 2, 28, bayH + 4);
  g.fillStyle = "rgba(235, 229, 215, 0.35)";
  g.fillRect(fw / 2 - 4, bayY + 18, 8, 2);
  g.fillRect(fw / 2 - 4, bayY + bayH / 2, 8, 2);
  g.fillRect(fw / 2 - 4, bayY + bayH - 20, 8, 2);

  // White printed archival sticker label below the windows
  g.fillStyle = "#e5decb";
  g.fillRect(66, 214, fw - 132, 160);
  g.fillStyle = "#b5422e";
  g.fillRect(66, 214, fw - 132, 22);
  g.fillStyle = "#26201c";
  for (let line = 0; line < 4; line++) {
    g.fillRect(88, 266 + line * 24, fw - 176, 1.5);
  }
  g.font = "700 16px monospace";
  g.fillStyle = "#f7f3e8";
  g.fillText("ARCHIVE MASTER // E-180", 84, 230);

  // Corner Phillips screw heads
  for (const [sx, sy] of [[28, 178], [fw - 28, 178], [28, fh - 32], [fw - 28, fh - 32]]) {
    g.fillStyle = "#0a0b0e";
    g.beginPath();
    g.arc(sx, sy, 8, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.22)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(sx - 4, sy); g.lineTo(sx + 4, sy);
    g.moveTo(sx, sy - 4); g.lineTo(sx, sy + 4);
    g.stroke();
  }

  const frontTex = new THREE.CanvasTexture(fc);
  frontTex.colorSpace = THREE.SRGBColorSpace;
  frontTex.anisotropy = 4;

  // Top dust-flap texture
  const tc = document.createElement("canvas");
  tc.width = 512;
  tc.height = 96;
  const tg = tc.getContext("2d")!;
  tg.fillStyle = "#191b20";
  tg.fillRect(0, 0, 512, 96);
  tg.fillStyle = "#101216";
  tg.fillRect(0, 44, 512, 4);
  tg.fillStyle = "rgba(255,255,255,0.08)";
  tg.fillRect(24, 18, 464, 12);
  tg.fillStyle = "#ded8c8";
  tg.fillRect(140, 58, 232, 24);
  const topTex = new THREE.CanvasTexture(tc);
  topTex.colorSpace = THREE.SRGBColorSpace;

  const plasticSide = new THREE.MeshStandardMaterial({ color: 0x13151a, roughness: 0.76, metalness: 0.12 });
  const plasticTop = new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.68, metalness: 0.14 });
  const plasticFront = new THREE.MeshPhysicalMaterial({
    map: frontTex,
    roughness: 0.58,
    metalness: 0.14,
    clearcoat: 0.28,
    clearcoatRoughness: 0.32,
  });

  cachedCassetteMaterials = [
    plasticSide,  // +x
    plasticSide,  // -x
    plasticTop,   // +y
    plasticSide,  // -y
    plasticFront, // +z
    plasticFront, // -z
  ];
  return cachedCassetteMaterials;
}
