"use client";
import { useState } from "react";
import Image from "next/image";
import { useArt } from "./artfiles";
import { AnimatePresence, motion } from "motion/react";
import { FAMILY_PHOTOS, RUN1, nameOf } from "./data";
import { Wallpaper } from "./art";
import { Ch, stageOf, useInfection } from "./infection";
import { Mad } from "./mad";
import { cn } from "@/lib/utils";

/** Ключ на гвозде: бирка с двумя сторонами — «Угроза» и «Итог». */
export function KeyTag() {
  const [side, setSide] = useState<"threat" | "result">("threat");
  const rows: [string, React.ReactNode][] =
    side === "threat"
      ? [
          ["Угроза", <>ментальное заражение: кто перейдёт черту, погибает внутри<Ch n={7} /></>],
          ["Выход", <>заметить безумие и сбежать — или уничтожить Источник Проклятий<Ch n={7} /></>],
          ["Под ним", <>Корея, сходящая с ума через эфир, и больница «Новый Мир»<Ch n="64–67" /></>],
          ["Бог", <>Главврач «Учитель»<Ch n={78} /></>],
        ]
      : [
          ["Заходы", "3 · гл. 5–11, 62–66, 67–76"],
          ["Решатель", "Ча Джинчхоль"],
          ["Наследие", "Осколок Звезды Иномирья"],
          ["Статус", <>решена · пусто<Ch n={76} /></>],
        ];
  return (
    <div className="relative mx-auto w-[270px] md:mx-0">
      <div className="mx-auto h-3 w-3 rounded-full bg-[#5a3a1e] shadow-inner md:mx-6" />
      <motion.div
        className="origin-top"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="mx-auto h-8 w-px bg-[#5a3a1e] md:mx-[29px]" />
        <div className="rounded-md border-2 border-[#7a5a22] bg-[#f6eedb] p-4 text-[#2b2018] shadow-[0_10px_20px_rgba(40,20,5,0.35)]">
          <div className="flex items-center justify-between">
            <span className="font-display text-3xl font-semibold">101</span>
            <div className="flex font-system text-[11px]">
              {(["threat", "result"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={cn("border border-[#7a5a22] px-2 py-0.5 first:border-r-0", side === s ? "bg-[#7a5a22] text-[#f6eedb]" : "hover:bg-[#7a5a22]/10")}>
                  {s === "threat" ? "Угроза" : "Итог"}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.dl key={side} initial={{ opacity: 0, rotateX: -60 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0 }} className="mt-3 space-y-1.5">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[72px_1fr] gap-2 text-[14px] leading-snug">
                  <dt className="font-system text-[10px] uppercase tracking-wider text-[#8a6a3a]">{k}</dt>
                  <dd className="font-display">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/** Заход 1: фото на столе; перевернёшь — кошмар. Дальше — страницы дневника. */
export function AlbumRun() {
  return (
    <section className="relative overflow-hidden bg-[var(--paper)] text-[var(--ink)] transition-colors duration-1000">
      <Wallpaper className="opacity-60" />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <RunHeader n={1} ch="5–11" title="Странная семья" note="Первый заход. Каждый в своей семье, по отдельности." />
        <Mad
          className="mt-6 max-w-3xl font-display text-[20px] leading-relaxed"
          text="Отель объявил охоту за сокровищами, и команда с тонфой и декоративным кинжалом вошла в 101-й. Шестеро проснулись в шести разных домах. Окно Статуса показывало, как растёт заражение, а «родные» мягко {сводили с ума.|заботились.}"
        />
        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3">
          {FAMILY_PHOTOS.map((p, i) => (
            <Polaroid key={p.who} p={p} tilt={[-4, 3, -2, 4, -3, 2][i]} />
          ))}
        </div>
        <Diary />
      </div>
    </section>
  );
}

export function RunHeader({ n, ch, title, note, dark }: { n: number; ch: string; title: string; note: string; dark?: boolean }) {
  return (
    <div>
      <div className={cn("font-system text-[12px] tracking-[0.3em]", dark ? "opacity-60" : "text-[var(--accent)]")}>
        ЗАХОД {n} · ГЛ. {ch}
      </div>
      <Mad as="div" text={title} className="mt-2 font-display text-5xl md:text-7xl" />
      <Mad as="div" text={note} className={cn("mt-2 font-hand text-2xl", dark ? "opacity-70" : "text-[var(--accent)]")} />
    </div>
  );
}

function Polaroid({ p, tilt }: { p: (typeof FAMILY_PHOTOS)[number]; tilt: number }) {
  const [flipped, setFlipped] = useState(false);
  const { level, add } = useInfection();
  const s = stageOf(level);
  const art = useArt();
  const front = art(`album-${p.who}`);
  const back = art(`album-${p.who}-truth`);
  return (
    <button
      onClick={() => {
        setFlipped((f) => !f);
        if (!flipped && !p.escaped) add(6);
      }}
      className="group relative block aspect-[4/5] w-full transition-transform hover:z-10 hover:scale-[1.03] [perspective:900px]"
      style={{ rotate: `${tilt}deg` }}
    >
      <span className="absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-[-4deg] bg-[#e8d9a8]/80 shadow-sm" />
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6 }} className="relative h-full w-full [transform-style:preserve-3d]">
        <div className="absolute inset-0 flex flex-col bg-[#fbf6ea] p-3 pb-2 shadow-[0_8px_22px_rgba(60,30,10,0.4)] [backface-visibility:hidden]">
          <div className="relative flex-1 overflow-hidden">
            {front ? (
              <>
                <Image src={front} alt={p.caption} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-[filter] duration-1000" style={{ filter: PHOTO_FILTER[s] }} />
                {/* правда просвечивает сквозь фото при высоком заражении */}
                {back && s >= 2 && <Image src={back} alt="" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-60" />}
              </>
            ) : (
              <PhotoScene count={p.family} stage={s} escaped={p.escaped} seed={tilt} />
            )}
          </div>
          <div className="pt-2 text-left font-hand text-xl leading-tight text-[#3b2a1e]">
            {s >= 2 ? (p.escaped ? "Сын опять не с нами" : "Мы всегда будем вместе ♥") : p.caption}
          </div>
          <div className="text-left font-system text-[10px] text-[#8a6e52]">{nameOf(p.who)}</div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-[#efe3c8] p-4 text-left shadow-[0_8px_22px_rgba(60,30,10,0.4)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back && (
            <>
              <Image src={back} alt="" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#efe3c8] via-[#efe3c8]/85 to-[#efe3c8]/10" />
            </>
          )}
          <div className={cn("relative", back && "mt-auto")}>
            <div className={cn("font-system text-[11px] uppercase tracking-widest", p.escaped ? "text-[#2f6b3a]" : "text-[#8c1c24]")}>{p.escaped ? "Побег" : "Провал"}</div>
            <p className="mt-2 font-hand text-[22px] leading-tight text-[#2a1d14]">{p.truth}</p>
          </div>
          <div className="relative font-system text-[10px] text-[#8a6e52]">{p.ch}</div>
        </div>
      </motion.div>
    </button>
  );
}

/** Фото выцветает и краснеет вместе с заражением. */
const PHOTO_FILTER = ["none", "saturate(1.15)", "sepia(0.3) saturate(1.4) hue-rotate(-10deg)", "sepia(0.5) saturate(1.8) hue-rotate(-20deg) contrast(1.2)", "sepia(0.7) saturate(2.4) hue-rotate(-28deg) contrast(1.4)"];

function PhotoScene({ count, stage, escaped, seed }: { count: number; stage: number; escaped?: boolean; seed: number }) {
  const xs = Array.from({ length: count + 1 }, (_, i) => 30 + (i * 140) / count);
  const id = `ph${seed}`;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f3dfb2" />
          <stop offset="1" stopColor="#8c6a42" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#${id})`} />
      {escaped && (
        <g>
          <rect x="138" y="18" width="48" height="66" fill="#dcecf3" stroke="#5a4030" strokeWidth="3" />
          <line x1="162" y1="18" x2="162" y2="84" stroke="#5a4030" strokeWidth="2" />
          <line x1="138" y1="51" x2="186" y2="51" stroke="#5a4030" strokeWidth="2" />
        </g>
      )}
      {xs.map((x, i) => {
        const guest = i === Math.floor(count / 2);
        if (escaped && guest) return null; // его на фото уже нет
        const h = guest ? 0.86 : 0.95 + ((i * 37) % 10) / 60;
        return (
          <g key={i} transform={`translate(${x} 200) scale(${h})`}>
            <path d="M-22 0 Q-24 -70 0 -78 Q24 -70 22 0 Z" fill={guest ? "#2a1d14" : "#4a3626"} />
            <ellipse cx="0" cy="-96" rx="15" ry="18" fill={guest ? "#2a1d14" : "#d9bc90"} />
            {!guest && stage >= 2 && <path d={stage >= 4 ? "M-12 -90 Q0 -74 12 -90 Q0 -82 -12 -90Z" : "M-8 -90 Q0 -83 8 -90"} fill={stage >= 4 ? "#5a0a0e" : "none"} stroke="#2a120a" strokeWidth="2" />}
            {!guest && stage >= 3 && (
              <>
                <circle cx="-5" cy="-100" r="2" fill="#120806" />
                <circle cx="5" cy="-100" r="2" fill="#120806" />
              </>
            )}
          </g>
        );
      })}
      <rect width="200" height="200" fill="#5a3a12" opacity="0.1" />
    </svg>
  );
}

/** Ход первого захода — страницы дневника. */
function Diary() {
  return (
    <div className="mt-24 grid gap-8 md:grid-cols-2">
      {RUN1.acts.map((a, i) => (
        <motion.div
          key={a.title}
          initial={{ opacity: 0, y: 30, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative bg-[#fbf6ea] p-6 shadow-[0_10px_25px_rgba(60,30,10,0.25)] [background-image:repeating-linear-gradient(transparent_0_31px,#d8c8a8_31px_32px)]"
        >
          <div className="absolute left-10 top-0 h-full w-px bg-[#e0a0a0]/60" />
          <div className="pl-8">
            <div className="flex items-baseline justify-between">
              <Mad as="div" text={a.title} className="font-hand text-3xl text-[var(--accent)]" />
              <span className="font-system text-[10px] text-[#8a6e52]">гл. {a.ch[0] === a.ch[1] ? a.ch[0] : `${a.ch[0]}–${a.ch[1]}`}</span>
            </div>
            <Mad text={a.text} className="mt-1 font-display text-[17px] leading-[32px] text-[#2a1d14]" />
          </div>
        </motion.div>
      ))}
      <div className="md:col-span-2">
        <Mad className="mx-auto max-w-3xl text-center font-display text-[20px] italic leading-relaxed" text={RUN1.outcome.text} />
      </div>
    </div>
  );
}
