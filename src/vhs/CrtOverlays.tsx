"use client";

import { useEffect, useRef } from "react";
import { VHS_METRICS } from "./VhsDeck3D";

/**
 * Parabolic curved horizontal scanlines matching the CRT glass curvature (K = 0.075).
 */
export function CrtLines() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const K = VHS_METRICS.CRT_K;
      const spacing = 3;
      const pad = 3 * Math.ceil((h * K) / 3);

      ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
      for (let y = -pad; y < h + pad; y += spacing) {
        ctx.beginPath();
        for (let x = 0; x <= w + 16; x += 16) {
          const nx = (x - cx) / cx;
          const cyPos = cy + (y - cy) / (1 + K * nx * nx);
          if (x === 0) ctx.moveTo(x, cyPos);
          else ctx.lineTo(x, cyPos);
        }
        for (let x = 16 * Math.ceil((w + 16) / 16); x >= 0; x -= 16) {
          const nx = (x - cx) / cx;
          const cyPos = cy + (y - cy) / (1 + K * nx * nx) + 1;
          ctx.lineTo(x, cyPos);
        }
        ctx.fill();
      }
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[52] h-full w-full"
    />
  );
}

/** Curved CRT tube specular reflection & corner mask. */
export function CrtGlass() {
  return <div aria-hidden="true" className="crt-glass-overlay" />;
}

/** Brief analog RF-channel static burst when switching tapes or views. */
export function CrtGlitchBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[60] overflow-hidden select-none">
      <div className="vhs-glitch-a absolute inset-0" />
      <div className="vhs-glitch-b absolute inset-0" />
      <div className="vhs-glitch-flash absolute inset-0" />
      <div className="absolute inset-x-0 top-[36%] h-7 -translate-y-1/2 bg-white/15 blur-[2px]" />
    </div>
  );
}
