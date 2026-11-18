"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { FAMILY_PHOTOS, RUN1, nameOf } from "./data";
import { Ch, N, STAGE, useInfection } from "./infection";
import { cn } from "@/lib/utils";

/** Первый заход: семейный альбом. Каждое фото — «семья» одного из команды; перевернёшь — правда. */
export function Album() {
  return (
    <div className="relative overflow-hidden rounded-sm bg-[#efe3c8] px-6 py-8 text-[#3b2a1e] shadow-[inset_0_0_80px_rgba(120,80,40,0.35)] md:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,#5a3a20_0_1px,transparent_1px_28px)]" />
      <p className="font-hand text-3xl text-[#7a4a2a]">Наш семейный альбом</p>
      <p className="mt-2 max-w-2xl font-display text-lg leading-relaxed">
        Каждый просыпается в <N a="чужой" b="своей" /> семье. Родные ведут себя всё <N a="безумнее" b="заботливее" />, а гость понемногу принимает это за норму и забывает отель.
        <Ch n={RUN1.world.ch ?? 6} />
      </p>
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
        {FAMILY_PHOTOS.map((p, i) => (
          <Polaroid key={p.who} p={p} tilt={[-3, 2, -1.5, 3, -2.5, 1.5][i]} />
        ))}
      </div>
      <p className="mt-10 font-hand text-2xl text-[#7a4a2a]">
        Нажмите на фото, чтобы перевернуть. Чем дольше смотрите на «семью», тем <N a="страшнее" b="роднее" /> она кажется.
      </p>
    </div>
  );
}

function Polaroid({ p, tilt }: { p: (typeof FAMILY_PHOTOS)[number]; tilt: number }) {
  const [flipped, setFlipped] = useState(false);
  const { level, add } = useInfection();
  const warped = level >= STAGE.warp;
  return (
    <button
      onClick={() => {
        setFlipped((f) => !f);
        if (!flipped && !p.escaped) add(7);
      }}
      className="group relative block aspect-[4/5] w-full [perspective:900px]"
      style={{ rotate: `${tilt}deg` }}
    >
      <span className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-[-4deg] bg-[#e8d9a8]/80 shadow-sm" />
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* лицевая сторона */}
        <div className="absolute inset-0 flex flex-col bg-[#fbf6ea] p-3 pb-2 shadow-[0_6px_18px_rgba(60,30,10,0.35)] [backface-visibility:hidden]">
          <div className="relative flex-1 overflow-hidden bg-[#c9b48c]">
            <FamilySvg count={p.family} warped={warped} escaped={p.escaped} />
          </div>
          <div className="pt-2 text-left font-hand text-xl leading-tight text-[#3b2a1e]">
            {warped ? (p.escaped ? "Сын опять не с нами" : "Мы всегда будем вместе ♥") : p.caption}
          </div>
          <div className="text-left font-system text-[10px] text-[#8a6e52]">{nameOf(p.who)}</div>
        </div>
        {/* оборот */}
        <div className="absolute inset-0 flex flex-col justify-between bg-[#f4ecd8] p-4 text-left shadow-[0_6px_18px_rgba(60,30,10,0.35)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <div className={cn("font-system text-[11px] uppercase tracking-widest", p.escaped ? "text-[#2f6b3a]" : "text-[#8c1c24]")}>
              {p.escaped ? "Побег" : "Провал"}
            </div>
            <p className="mt-2 font-display text-[15px] leading-snug text-[#2a1d14]">{p.truth}</p>
          </div>
          <div className="font-system text-[10px] text-[#8a6e52]">{p.ch}</div>
        </div>
      </motion.div>
    </button>
  );
}

/** Силуэты семьи; на высоком заражении у всех появляются одинаковые широкие улыбки. */
function FamilySvg({ count, warped, escaped }: { count: number; warped: boolean; escaped?: boolean }) {
  const xs = Array.from({ length: count + 1 }, (_, i) => 20 + (i * 160) / count);
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="fam-light" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f3dfb2" />
          <stop offset="1" stopColor="#9c7c52" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#fam-light)" />
      {escaped && (
        <g>
          <rect x="140" y="20" width="44" height="60" fill="#d9ecf5" stroke="#5a4030" strokeWidth="3" />
          <line x1="162" y1="20" x2="162" y2="80" stroke="#5a4030" strokeWidth="2" />
        </g>
      )}
      {xs.map((x, i) => {
        const guest = i === Math.floor(count / 2);
        const h = guest ? 1 : 0.9 + ((i * 37) % 10) / 50;
        return (
          <g key={i} transform={`translate(${x} ${200}) scale(${h})`}>
            <path d="M-22 0 Q-24 -70 0 -78 Q24 -70 22 0 Z" fill={guest ? "#2a1d14" : "#4a3626"} />
            <circle cx="0" cy="-96" r="17" fill={guest ? "#2a1d14" : "#4a3626"} />
            {warped && !guest && (
              <path d="M-11 -92 Q0 -80 11 -92" fill="none" stroke="#f6e9d0" strokeWidth="2.5" strokeLinecap="round" />
            )}
            {warped && !guest && (
              <>
                <circle cx="-6" cy="-100" r="2" fill="#f6e9d0" />
                <circle cx="6" cy="-100" r="2" fill="#f6e9d0" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}
