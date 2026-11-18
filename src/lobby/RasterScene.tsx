"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Chandeliers, Defs, EntranceView, Front, Guest, Mid, type RackKey } from "./LobbySvg";
import type { SceneState, Theme } from "./world";
import type { Variant } from "./themes";
import { VIEW_H, VIEW_W } from "./useGuest";

/**
 * Пиксель-арт и 1-бит: слои сцены рисуются в скрытые SVG, растрируются в картинки (только при смене состояния),
 * а каждый кадр собирается на маленьком canvas и проходит через палитру / дизеринг Байера.
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((m) => (m + 0.5) / 16);
const FRAMES = 8; // фазы шага в спрайт-листе
const CELL_W = 100;
const CELL_H = 230;
const FEET_Y = 215;

function toImage(svg: SVGSVGElement | null): Promise<HTMLImageElement | null> {
  if (!svg) return Promise.resolve(null);
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      res(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      res(null);
    };
    img.src = url;
  });
}

type Imgs = { mid?: HTMLImageElement; ch?: HTMLImageElement; front?: HTMLImageElement; guest?: HTMLImageElement };

export function RasterScene(props: {
  t: Theme;
  v: Variant;
  scene: SceneState;
  keys: RackKey[];
  x: number;
  facing: 1 | -1;
  dist: number;
  walking: boolean;
  cam: number;
}) {
  const { t, v, scene, keys, x, facing, dist, walking, cam } = props;
  const block = v === "onebit" ? 3 : 4;
  const W = VIEW_W / block;
  const H = VIEW_H / block;

  const midRef = useRef<SVGSVGElement>(null);
  const chRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);
  const guestRef = useRef<SVGSVGElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [imgs, setImgs] = useState<Imgs>({});

  // растрируем слои только когда они меняются
  useLayoutEffect(() => {
    let live = true;
    toImage(midRef.current).then((mid) => live && mid && setImgs((s) => ({ ...s, mid })));
    return () => void (live = false);
  }, [scene.doorOpen, scene.lightsOff, scene.snacks, scene.blink, t]);
  useLayoutEffect(() => {
    let live = true;
    toImage(chRef.current).then((ch) => live && ch && setImgs((s) => ({ ...s, ch })));
    return () => void (live = false);
  }, [scene.lightsOff, t]);
  useLayoutEffect(() => {
    let live = true;
    Promise.all([toImage(frontRef.current), toImage(guestRef.current)]).then(
      ([front, guest]) => live && setImgs((s) => ({ ...s, front: front ?? undefined, guest: guest ?? undefined })),
    );
    return () => void (live = false);
  }, [t]);

  // сборка кадра
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d", { willReadFrequently: true });
    if (!c || !ctx || !imgs.mid) return;
    const k = 1 / block;
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = t.wall;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(imgs.mid, -cam * k, 0, 2400 * k, 600 * k);

    if (imgs.guest) {
      const ph = ((dist / 24) % (Math.PI * 2)) / (Math.PI * 2);
      const f = walking ? 1 + Math.floor(ph * FRAMES) % FRAMES : 0;
      ctx.save();
      ctx.translate((x - cam) * k, 540 * k);
      ctx.scale(facing, 1);
      ctx.drawImage(imgs.guest, f * CELL_W, 0, CELL_W, CELL_H, (-CELL_W / 2) * k, -FEET_Y * k, CELL_W * k, CELL_H * k);
      ctx.restore();
    }
    if (imgs.ch) ctx.drawImage(imgs.ch, -cam * 1.12 * k, 0, 2700 * k, 600 * k);
    if (imgs.front) ctx.drawImage(imgs.front, -cam * 1.4 * k, 0, 3000 * k, 600 * k);

    if (scene.lightsOff) {
      const gx = (x - cam) * k;
      const gr = ctx.createRadialGradient(gx, 430 * k, 0, gx, 430 * k, 300 * k);
      gr.addColorStop(0, "rgba(0,0,0,0.1)");
      gr.addColorStop(0.45, "rgba(0,0,0,0.75)");
      gr.addColorStop(1, "rgba(0,0,0,0.96)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
      const sx = (250 - cam) * k;
      const sg = ctx.createRadialGradient(sx, 390 * k, 0, sx, 390 * k, 60 * k);
      sg.addColorStop(0, "rgba(255,224,138,0.6)");
      sg.addColorStop(1, "rgba(255,224,138,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);
    }
    const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.62);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    // палитра / дизеринг
    const im = ctx.getImageData(0, 0, W, H);
    const d = im.data;
    if (v === "onebit") {
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const px = p % W;
        const py = (p / W) | 0;
        const L = ((0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / 255) * 2.6 - 0.18;
        const on = L > BAYER[(py & 3) * 4 + (px & 3)];
        d[i] = on ? 233 : 17;
        d[i + 1] = on ? 225 : 17;
        d[i + 2] = on ? 208 : 17;
      }
    } else {
      const lv = 5; // 6 уровней на канал
      for (let i = 0, p = 0; i < d.length; i += 4, p++) {
        const px = p % W;
        const py = (p / W) | 0;
        const n = (BAYER[(py & 3) * 4 + (px & 3)] - 0.5) * 0.7;
        for (let c = 0; c < 3; c++) {
          const q = Math.round((d[i + c] / 255) * lv + n);
          d[i + c] = Math.max(0, Math.min(lv, q)) * (255 / lv);
        }
      }
    }
    ctx.putImageData(im, 0, 0);
  }, [imgs, x, cam, dist, walking, facing, scene.lightsOff, block, W, H, t, v]);

  const hidden = { position: "absolute", width: 0, height: 0, overflow: "hidden", left: -99999 } as const;
  return (
    <>
      <canvas ref={canvas} width={W} height={H} className="block h-full w-full" style={{ imageRendering: "pixelated" }} />
      <div style={hidden} aria-hidden>
        <svg ref={midRef} xmlns="http://www.w3.org/2000/svg" width={2400} height={600} viewBox="0 0 2400 600">
          <Defs t={t} v={v} seed={1} guestSx={0} />
          <rect width={2400} height={600} fill={t.wall} />
          <EntranceView t={t} v={v} cam={0} lightsOff={scene.lightsOff} />
          <Mid t={t} v={v} scene={scene} keys={keys} />
        </svg>
        <svg ref={chRef} xmlns="http://www.w3.org/2000/svg" width={2700} height={600} viewBox="0 0 2700 600">
          <Defs t={t} v={v} seed={1} guestSx={0} />
          <Chandeliers t={t} v={v} off={scene.lightsOff} />
        </svg>
        <svg ref={frontRef} xmlns="http://www.w3.org/2000/svg" width={3000} height={600} viewBox="0 0 3000 600">
          <Front t={t} />
        </svg>
        <svg ref={guestRef} xmlns="http://www.w3.org/2000/svg" width={CELL_W * (FRAMES + 1)} height={CELL_H} viewBox={`0 0 ${CELL_W * (FRAMES + 1)} ${CELL_H}`}>
          {Array.from({ length: FRAMES + 1 }, (_, i) => (
            <g key={i} transform={`translate(${i * CELL_W + CELL_W / 2 - 0} ${FEET_Y - 540})`}>
              <g transform={`translate(${-0} 0)`}>
                <Guest t={t} x={0} facing={1} dist={i === 0 ? 0 : ((i - 1 + 0.5) / FRAMES) * Math.PI * 2 * 24} walking={i > 0} />
              </g>
            </g>
          ))}
        </svg>
      </div>
    </>
  );
}
