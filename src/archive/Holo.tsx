"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";

/**
 * Карточка в духе коллекционных «флеш»-карт, без радуги: наклоняется в 3D за курсором или пальцем.
 * Слои поверх содержимого:
 *  - стеклянная полоса блика, проходящая по карточке;
 *  - пятно света под курсором;
 *  - металлическая фаска по краю, ярче с той стороны, куда падает свет;
 *  - четырёхлучевые звёзды-вспышки, вспыхивают, когда свет проходит над ними.
 * foil — глянцевый ламинат (пропуска), pearl — тихий блеск полированного нефрита.
 */
const SPARKS = [
  { x: 0.18, y: 0.14, s: 13 },
  { x: 0.84, y: 0.36, s: 10 },
  { x: 0.3, y: 0.78, s: 11 },
];

export function Holo({ children, className, style, foil = "foil", tilt = 16 }: { children: ReactNode; className?: string; style?: CSSProperties; foil?: "foil" | "pearl"; tilt?: number }) {
  const still = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const on = useMotionValue(0);
  const spring = { stiffness: 170, damping: 19, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const glow = useSpring(on, { stiffness: 120, damping: 22 });
  const pearl = foil === "pearl";

  const rotateY = useTransform(sx, [0, 1], [-tilt, tilt]);
  const rotateX = useTransform(sy, [0, 1], [tilt * 0.85, -tilt * 0.85]);
  const gx = useTransform(sx, (v) => v * 100);
  const gy = useTransform(sy, (v) => v * 100);
  // косая полоса блика пробегает карточку от края до края
  const band = useTransform([sx, sy], ([a, b]: number[]) => -40 + (a * 0.65 + b * 0.35) * 180);
  // фаска: свет приходит со стороны курсора
  const edgeAngle = useTransform([sx, sy], ([a, b]: number[]) => (Math.atan2(b - 0.5, a - 0.5) * 180) / Math.PI + 90);

  const glareOpacity = useTransform(glow, (v) => v * 0.85);
  const bandOpacity = useTransform(glow, (v) => v * (pearl ? 0.35 : 0.5));
  const edgeOpacity = useTransform(glow, (v) => 0.25 + v * 0.75);

  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.6), rgba(255,255,255,0.14) 22%, transparent 55%)`;
  const sweep = useMotionTemplate`linear-gradient(115deg, transparent ${band}%, rgba(255,255,255,0.0) calc(${band}% + 8%), rgba(255,255,255,0.55) calc(${band}% + 14%), rgba(255,255,255,0.0) calc(${band}% + 20%), transparent 100%)`;
  const bevel = useMotionTemplate`conic-gradient(from ${edgeAngle}deg, rgba(255,250,230,0.95), rgba(255,255,255,0.08) 22%, rgba(0,0,0,0.0) 50%, rgba(255,255,255,0.08) 78%, rgba(255,250,230,0.95))`;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (still) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    on.set(1);
  };
  const leave = () => {
    px.set(0.5);
    py.set(0.5);
    on.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ ...style, rotateX: still ? 0 : rotateX, rotateY: still ? 0 : rotateY, transformPerspective: 700, transformStyle: "preserve-3d" }}
      onPointerMove={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
    >
      {children}
      {/* стеклянная полоса блика */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light" style={{ opacity: bandOpacity, backgroundImage: sweep, borderRadius: "inherit" }} />
      {/* пятно света под курсором */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay" style={{ opacity: glareOpacity, backgroundImage: glare, borderRadius: "inherit" }} />
      {/* металлическая фаска: кольцо в 1.5px, освещённое со стороны курсора */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          opacity: edgeOpacity,
          backgroundImage: bevel,
          borderRadius: "inherit",
          padding: 1.5,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        }}
      />
      {!still && SPARKS.map((p, i) => <Spark key={i} p={p} sx={sx} sy={sy} glow={glow} />)}
    </motion.div>
  );
}

/** Четырёхлучевая звезда: вспыхивает, когда пятно света проходит рядом. */
function Spark({ p, sx, sy, glow }: { p: { x: number; y: number; s: number }; sx: MotionValue<number>; sy: MotionValue<number>; glow: MotionValue<number> }) {
  const near = useTransform([sx, sy, glow], ([a, b, g]: number[]) => {
    const d = Math.hypot(a - p.x, b - p.y);
    return g * Math.max(0, 1 - d / 0.28) ** 2;
  });
  const scale = useTransform(near, [0, 1], [0.3, 1.25]);
  const rotate = useTransform(near, [0, 1], [0, 45]);
  return (
    <motion.svg
      aria-hidden
      viewBox="-10 -10 20 20"
      className="pointer-events-none absolute z-30 mix-blend-screen"
      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: p.s * 2, height: p.s * 2, x: "-50%", y: "-50%", opacity: near, scale, rotate }}
    >
      <path d="M0 -10 C0.8 -1.2 1.2 -0.8 10 0 C1.2 0.8 0.8 1.2 0 10 C-0.8 1.2 -1.2 0.8 -10 0 C-1.2 -0.8 -0.8 -1.2 0 -10Z" fill="#fffbe8" />
      <circle r="1.6" fill="#fff" />
    </motion.svg>
  );
}
