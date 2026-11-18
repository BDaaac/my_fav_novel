"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { STAGE, stageOf, useInfection } from "./infection";

/** Обои дома: узор из цветов; с заражением в цветах открываются глаза, под ними появляются улыбки. */
export function Wallpaper({ className = "" }: { className?: string }) {
  const { level } = useInfection();
  const s = stageOf(level);
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden>
      <defs>
        <pattern id="wp101" width="96" height="120" patternUnits="userSpaceOnUse" patternTransform={s >= 3 ? `skewX(${(level - STAGE.glitch) / 6}) rotate(${(level - STAGE.glitch) / 10})` : undefined}>
          <line x1="48" y1="0" x2="48" y2="120" stroke="var(--accent)" strokeOpacity="0.12" strokeWidth="1" />
          <g transform="translate(48 60)" fill="none" stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="1.3">
            {[0, 90, 180, 270].map((a) => (
              <path key={a} d="M0 -6 C10 -22 22 -16 14 -4 C10 2 4 2 0 -6 Z" transform={`rotate(${a})`} />
            ))}
            {s >= 2 ? (
              <>
                <ellipse cx="0" cy="0" rx="7" ry="4" fill="#f4ead6" stroke="var(--accent)" strokeOpacity="0.6" />
                <circle cx={s >= 3 ? 1.5 : 0} cy="0" r="2.2" fill="#1a0b08" stroke="none" />
              </>
            ) : (
              <circle cx="0" cy="0" r="3" fill="var(--accent)" fillOpacity="0.25" />
            )}
            {s >= 3 && <path d="M-9 16 Q0 25 9 16" stroke="#8c1c24" strokeOpacity="0.6" strokeWidth="1.6" />}
          </g>
          <g transform="translate(0 0)" stroke="var(--accent)" strokeOpacity="0.18" fill="none">
            <path d="M0 0 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wp101)" />
      {s >= 4 &&
        [8, 23, 41, 57, 72, 88].map((x, i) => (
          <motion.rect key={x} x={`${x}%`} y="0" width={4 + (i % 3) * 3} initial={{ height: 0 }} animate={{ height: `${30 + ((i * 37) % 50)}%` }} transition={{ duration: 6 + i, ease: "easeOut" }} fill="#7a0c12" opacity="0.55" rx="3" />
        ))}
    </svg>
  );
}

/**
 * Семейный портрет (ИИ-арт). Заражение перекрашивает холст; лупа показывает, что под лаком.
 * Портрет чуть поворачивается за курсором — семья следит.
 */
export function FamilyPortrait({ onLook }: { onLook?: () => void }) {
  const { level, add } = useInfection();
  const s = stageOf(level);
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 60, damping: 14 });
  const ry = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 60, damping: 14 });
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const filter = [
    "none",
    "saturate(1.15) contrast(1.05)",
    "sepia(0.35) saturate(1.3) hue-rotate(-12deg) contrast(1.1)",
    "sepia(0.55) saturate(1.8) hue-rotate(-22deg) contrast(1.25) brightness(0.92)",
    "sepia(0.7) saturate(2.4) hue-rotate(-28deg) contrast(1.45) brightness(0.85)",
  ][s];
  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, rotate: s >= 3 ? (level - STAGE.glitch) / 5 : 0 }}
      className="relative h-full w-full cursor-none drop-shadow-[0_25px_35px_rgba(40,20,5,0.55)]"
      onMouseEnter={onLook}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        mx.set(x);
        my.set(y);
        setLens({ x, y });
        if (Math.random() < 0.02) add(1);
      }}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
        setLens(null);
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[50%/50%]">
        <motion.div
          className="absolute inset-0"
          animate={s >= 4 ? { filter: [filter, "invert(1) hue-rotate(180deg) saturate(3)", filter] } : { filter }}
          transition={s >= 4 ? { duration: 0.25, repeat: Infinity, repeatDelay: 2.6 } : { duration: 1.2 }}
        >
          <Image src="/art/101/portrait.png" alt="Семейный портрет в золотой раме" fill sizes="340px" className="object-cover" priority />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-[#7a0c12] mix-blend-multiply transition-opacity duration-1000" style={{ opacity: Math.max(0, (level - 30) / 140) }} />
        {s >= 3 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply" aria-hidden>
            <filter id="pt-crack">
              <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="2" seed="7" />
              <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.02  0 0 0 0 0.03  0 0 0 -2.6 1.5" />
            </filter>
            <rect width="100%" height="100%" filter="url(#pt-crack)" opacity={(level - STAGE.glitch) / 40} />
          </svg>
        )}
      </div>
      {/* лупа: под лаком семья смотрит прямо на тебя */}
      {lens && (
        <div
          className="pointer-events-none absolute z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#c9a227] shadow-[0_0_0_2px_#3a2608,0_10px_30px_rgba(0,0,0,0.6)]"
          style={{
            left: `${lens.x * 100}%`,
            top: `${lens.y * 100}%`,
            backgroundImage: "url(/art/101/portrait.png)",
            backgroundSize: "320% 320%",
            backgroundPosition: `${lens.x * 100}% ${lens.y * 100}%`,
            filter: s >= 2 ? "grayscale(1) contrast(1.8) brightness(0.8) sepia(1) hue-rotate(-40deg) saturate(4)" : "contrast(1.1)",
          }}
        />
      )}
      {s >= 4 &&
        [22, 38, 61, 77].map((x, i) => (
          <motion.span
            key={x}
            className="absolute top-[92%] w-1.5 rounded-b-full bg-[#6a0a10]"
            style={{ left: `${x}%` }}
            initial={{ height: 0 }}
            animate={{ height: 30 + i * 18 }}
            transition={{ duration: 4 + i, ease: "easeOut" }}
          />
        ))}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-sm bg-gradient-to-b from-[#f3d98a] to-[#8a6420] px-4 py-0.5 font-display text-[12px] text-[#3a2608] shadow">
        {s >= 4 ? "НАВСЕГДА ВМЕСТЕ" : "Семья · 101"}
      </div>
    </motion.div>
  );
}

/**
 * Ком плоти — Ким Санмин, носитель проклятия. Над ним в темноте — Главврач «Учитель», держащий нити.
 * hits: 0..6 — удары Джинчхоля; трещины светятся бирюзой Осколка изнутри.
 */
export function FleshHeart({ hits, hover }: { hits: number; hover: boolean }) {
  const disp = 10 + hits * 3 + (hover ? 10 : 0);
  const beat = Math.max(0.45, 1.1 - hits * 0.1);
  return (
    <svg viewBox="0 0 600 640" className="h-full w-full overflow-visible">
      <defs>
        <filter id="flesh" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="n">
            <animate attributeName="baseFrequency" dur="9s" values="0.016;0.024;0.016" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale={disp} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        <filter id="mottle" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="3" result="t" />
          <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.01  0 0 0 0 0.04  0 0 0 -2.2 1.35" result="spots" />
          <feComposite in="spots" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="smoke" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="11" result="n">
            <animate attributeName="seed" dur="6s" values="11;12;13;14;15;16;11" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="90" xChannelSelector="R" yChannelSelector="B" />
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <radialGradient id="meat" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#f08a8a" />
          <stop offset="0.25" stopColor="#c23a45" />
          <stop offset="0.65" stopColor="#6e0f1c" />
          <stop offset="1" stopColor="#25040a" />
        </radialGradient>
        <radialGradient id="aura" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3a0612" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#14030a" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="crystal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9fff4" stopOpacity="0.85" />
          <stop offset="1" stopColor="#1fb9a3" stopOpacity="0.15" />
        </linearGradient>
        <path id="whisper" d="M300 380 m-215 0 a215 215 0 1 1 430 0 a215 215 0 1 1 -430 0" />
      </defs>

      {/* Главврач над комом: белый халат во тьме, пальцы держат нити */}
      <motion.g animate={{ opacity: hover ? 0.95 : 0.55, y: hover ? 6 : 0 }} transition={{ duration: 1.4 }}>
        <path d="M300 -40 C250 -40 236 10 240 60 L196 230 Q300 262 404 230 L360 60 C364 10 350 -40 300 -40 Z" fill="#cfd6cf" opacity="0.16" />
        <path d="M262 70 L300 150 L338 70" fill="none" stroke="#cfd6cf" strokeOpacity="0.25" strokeWidth="2" />
        <ellipse cx="300" cy="-2" rx="26" ry="32" fill="#070405" />
        <g opacity="0.9">
          <circle cx="290" cy="0" r="7" fill="none" stroke="#bfeee5" strokeWidth="1.5" />
          <circle cx="310" cy="0" r="7" fill="none" stroke="#bfeee5" strokeWidth="1.5" />
          <motion.circle cx="290" cy="0" r="2" fill="#e9fffa" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />
        </g>
        {/* руки-кукловода */}
        <path d="M222 150 C190 200 196 240 214 262" stroke="#cfd6cf" strokeOpacity="0.2" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M378 150 C410 200 404 240 386 262" stroke="#cfd6cf" strokeOpacity="0.2" strokeWidth="14" fill="none" strokeLinecap="round" />
        {[[208, 266, 236, 336], [220, 270, 268, 306], [380, 270, 332, 306], [392, 266, 364, 336], [214, 268, 214, 380], [386, 268, 388, 380]].map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#eef6f2"
            strokeOpacity={hover ? 0.6 : 0.3}
            strokeWidth="0.9"
            animate={{ x2: [x2 - 5, x2 + 5, x2 - 5] }}
            transition={{ duration: 2.6 + i * 0.35, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.g>

      {/* аура */}
      <motion.circle cx="300" cy="400" r="270" fill="url(#aura)" animate={{ r: [260, 285, 260] }} transition={{ duration: beat * 2, repeat: Infinity }} />
      <g filter="url(#smoke)" opacity={hover ? 0.9 : 0.6}>
        <circle cx="300" cy="410" r="190" fill="none" stroke="#5a0a1e" strokeWidth="40" />
        <circle cx="300" cy="410" r="240" fill="none" stroke="#1d0612" strokeWidth="50" />
      </g>

      {/* шёпот мольбы к «Учителю» */}
      <motion.g style={{ transformOrigin: "300px 380px" }} animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}>
        <text fontSize="13" fontFamily="var(--font-caveat), cursive" fill="#e9b3b8" opacity={hover ? 0.75 : 0.35} letterSpacing="3">
          <textPath href="#whisper">Учитель… Учитель… посмотрите на меня… Учитель… Учитель… не оставляйте меня… Учитель… Учитель…</textPath>
        </text>
      </motion.g>

      {/* кристаллы пещеры: грани светлая/тёмная, свечение у основания */}
      {[
        [80, 600, 26, 150, -8],
        [128, 604, 34, 200, 6],
        [40, 560, 18, 100, -14],
        [470, 604, 32, 180, -6],
        [520, 600, 22, 120, 10],
        [566, 560, 16, 90, 16],
        [176, 610, 14, 70, 18],
        [430, 612, 14, 76, -18],
      ].map(([x, y, w, h, tilt], i) => (
        <motion.g key={i} transform={`rotate(${tilt} ${x} ${y})`} animate={{ opacity: [0.65, 1, 0.65] }} transition={{ duration: 3 + (i % 4), repeat: Infinity }}>
          <ellipse cx={x} cy={y} rx={w * 1.6} ry={10} fill="#5ff0d8" opacity="0.18" />
          <path d={`M${x - w} ${y} L${x - w * 0.6} ${y - h * 0.8} L${x} ${y - h} L${x} ${y} Z`} fill="#d6fff7" fillOpacity="0.55" />
          <path d={`M${x} ${y} L${x} ${y - h} L${x + w * 0.7} ${y - h * 0.75} L${x + w} ${y} Z`} fill="#1fb9a3" fillOpacity="0.35" />
          <path d={`M${x - w} ${y} L${x - w * 0.6} ${y - h * 0.8} L${x} ${y - h} L${x + w * 0.7} ${y - h * 0.75} L${x + w} ${y}`} fill="none" stroke="#c9fff4" strokeOpacity="0.7" strokeWidth="1" />
        </motion.g>
      ))}

      {/* сосуды, уходящие в стены */}
      <g filter="url(#flesh)" stroke="#5a0b16" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M230 420 C150 430 110 500 40 520" />
        <path d="M370 430 C450 450 500 520 580 520" />
        <path d="M300 520 C300 570 280 600 270 640" />
      </g>

      {/* само сердце */}
      <motion.g
        style={{ transformOrigin: "300px 400px" }}
        animate={{ scale: [1, 1.07, 0.99, 1.1, 1] }}
        transition={{ duration: beat, repeat: Infinity, times: [0, 0.15, 0.3, 0.45, 1] }}
      >
        <g filter="url(#flesh)">
          {/* аорта и трубки */}
          <path d="M262 300 C250 250 270 220 300 214 C330 220 336 252 320 300 Z" fill="#7a1420" />
          <path d="M330 310 C352 262 392 250 410 266 C420 280 396 300 356 330 Z" fill="#6a0f1b" />
          <path d="M248 316 C220 280 196 270 182 286 C176 300 200 316 236 338 Z" fill="#6a0f1b" />
          {/* тело */}
          <path d="M300 300 C220 280 170 340 180 410 C190 480 250 520 300 560 C350 520 420 480 425 405 C430 335 372 290 300 300 Z" fill="url(#meat)" />
          <path d="M300 300 C220 280 170 340 180 410 C190 480 250 520 300 560 C350 520 420 480 425 405 C430 335 372 290 300 300 Z" fill="#000" filter="url(#mottle)" opacity="0.9" />
          <circle cx="232" cy="380" r="40" fill="#a32a37" opacity="0.6" />
          <circle cx="330" cy="350" r="26" fill="#b8323f" opacity="0.5" />
          <circle cx="270" cy="490" r="30" fill="#5a0a16" opacity="0.55" />
          <circle cx="368" cy="420" r="34" fill="#8a1d2b" opacity="0.6" />
          {/* вены */}
          <g stroke="#3b0610" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8">
            <path d="M300 310 C290 360 310 400 296 470 C290 500 300 530 300 550" />
            <path d="M296 380 C260 390 240 420 228 460" />
            <path d="M302 420 C340 430 360 460 372 490" />
            <path d="M260 330 C250 350 236 356 212 360" />
          </g>
          <g stroke="#ffd0d4" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round">
            <path d="M232 336 C220 352 214 372 216 392" />
            <path d="M318 318 C330 322 342 330 350 340" />
          </g>
        </g>
        {/* трещины от ударов: изнутри светит Осколок */}
        {Array.from({ length: hits }, (_, i) => {
          const a = (i * 67) % 360;
          const cx = 300 + Math.cos((a * Math.PI) / 180) * 40;
          const cy = 420 + Math.sin((a * Math.PI) / 180) * 50;
          return (
            <g key={i}>
              <path d={`M${cx} ${cy} l${18 - i * 4} ${-22 + i * 6} l${-10 + i * 3} ${-16} l${14} ${-10}`} stroke="#9ff5e8" strokeWidth="3" fill="none" />
              <path d={`M${cx} ${cy} l${18 - i * 4} ${-22 + i * 6} l${-10 + i * 3} ${-16} l${14} ${-10}`} stroke="#9ff5e8" strokeWidth="10" fill="none" opacity="0.3" filter="url(#soft)" />
            </g>
          );
        })}
      </motion.g>
    </svg>
  );
}
