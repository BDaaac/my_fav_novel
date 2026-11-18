"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RUN1 } from "./data";
import { FamilyChat } from "./FamilyChat";
import { Wallpaper } from "./art";
import { Ch } from "./infection";
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

/** Заход 1: семейные чаты шести домов, дальше — страницы дневника. */
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
        <FamilyChat />
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
