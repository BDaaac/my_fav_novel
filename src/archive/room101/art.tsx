"use client";
import { motion } from "motion/react";
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
