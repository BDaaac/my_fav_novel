"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Ch, stageOf, useInfection } from "./infection";
import { Mad, MadTitle } from "./mad";
import { useArt } from "./artfiles";
import { cn } from "@/lib/utils";

/**
 * Дом Хан Гаина (гл. 6). Тёплая комната без подсказок; тронешь вещь — на секунду видно, как всё на самом деле.
 * Найди все странности — это и есть путь к побегу: заметить безумие.
 * at — точка на временной картинке гостиной, home — на hero-home.png из docs/art-prompts-101.md.
 */
type Oddity = { id: string; at: [number, number]; home: [number, number]; label: string; normal: string; truth: string };
const ODDITIES: Oddity[] = [
  { id: "photo", at: [12, 30], home: [51, 17], label: "Фото на стене", normal: "Семейное фото. Сегодня едем в дендрарий, потом утка и курорт.", truth: "Куда мы едем? Как я здесь оказался? Память утекает, как песок." },
  { id: "sister", at: [26, 42], home: [41, 42], label: "Хиган", normal: "Сестрёнка, второй класс старшей школы. «Оппа, я звала тебя пять раз!»", truth: "Жуёт личинок и не понимает, о чём ты. И почему она не в школе?" },
  { id: "dad", at: [17, 62], home: [86, 42], label: "Отец", normal: "Отец уже поел, сидит на диване и ворчит.", truth: "Он жуёт что-то шевелящееся. Личинки." },
  { id: "mom", at: [49, 47], home: [21, 36], label: "Мама", normal: "Мама кричит из кухни: все уже позавтракали, вставай!", truth: "Никто не ел. Ложки не подняты, рисоварку даже не открывали." },
  { id: "rice", at: [57, 78], home: [57, 62], label: "Миски", normal: "Мама всегда кладёт в рис что-то полезное.", truth: "В рисе извиваются живые личинки шелкопряда. «Суперфуд», — говорит сестра." },
];
const MAD_FALLBACK = "sepia(0.8) saturate(2.6) hue-rotate(-30deg) contrast(1.5) brightness(0.75)";

export function Hero() {
  const { level, add } = useInfection();
  const art = useArt();
  const s = stageOf(level);
  const home = art("hero-home");
  const base = home ?? art("living") ?? "";
  const mad = art("hero-home-mad");
  const [found, setFound] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [glimpse, setGlimpse] = useState(false);
  const [freed, setFreed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const reveal = (o: Oddity) => {
    const closing = open === o.id;
    setOpen(closing ? null : o.id);
    if (closing) return;
    // на полторы секунды комната показывает себя настоящую
    setGlimpse(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setGlimpse(false), 1500);
    if (found.has(o.id)) return;
    const n = new Set(found).add(o.id);
    setFound(n);
    add(5);
    if (n.size === ODDITIES.length)
      setTimeout(() => {
        setFreed(true);
        add(-35);
      }, 1800);
  };

  return (
    <section className="relative h-screen min-h-[680px] overflow-hidden bg-[#140d08] text-[#f3e9d6]">
      <motion.div className="absolute inset-0" animate={{ scale: glimpse ? 1.04 : 1 + level / 900 }} transition={{ duration: glimpse ? 0.25 : 2 }}>
        <Image src={base} alt="Утро в квартире: мама у рисоварки, сестра за столом, отец на диване" fill priority sizes="100vw" className="object-cover" />
        {/* правда: проступает с заражением и вспыхивает, когда трогаешь вещи */}
        <div className={cn("absolute inset-0 transition-opacity", glimpse ? "duration-150" : "duration-1000")} style={{ opacity: glimpse ? 0.92 : Math.max(0, (level - 25) / 110) }}>
          <Image src={mad ?? base} alt="" fill sizes="100vw" className="object-cover" style={mad ? undefined : { filter: MAD_FALLBACK }} />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_35%,rgba(20,10,5,0.75))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#140d08]/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#140d08] via-[#140d08]/85 to-transparent" />

      {ODDITIES.map((o) => (
        <Hotspot key={o.id} o={o} pos={home ? o.home : o.at} open={open === o.id} stage={s} onClick={() => reveal(o)} />
      ))}

      <div className="pointer-events-none absolute inset-x-6 bottom-10 md:inset-x-12">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#e6b980]">КОМНАТА ПРОКЛЯТИЙ · 1-Й ЭТАЖ · №101 · ПОПЫТКА 1</div>
        <MadTitle text="Странная семья" alt="Наш дом" className="mt-1 text-[#f6ead2]" size="clamp(2.6rem, 5.2vw, 5rem)" />
        <Mad as="div" text="{Комната,|Дом,} где тебя всегда ждут к ужину" className="font-hand text-3xl text-[#e6b980]" />
        <div className="mt-3 max-w-xl">
          <Mad
            className="font-display text-[19px] leading-relaxed text-[#efe2c8]"
            text="Каждый гость просыпается в своей семье. Хан Гаина будит мама, сестрёнка Хиган зовёт «оппой», отец ворчит с дивана. Всё было бы хорошо, только родные ведут себя всё {безумнее,|заботливее,} а отель понемногу выветривается из памяти."
          />
        </div>
      </div>

      <AnimatePresence>
        {freed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-1/2 top-1/2 z-30 w-[min(420px,90vw)] -translate-x-1/2 -translate-y-1/2 border border-[#7fd4ff]/60 bg-[#06141c]/95 p-4 font-system text-[13px] text-[#7fd4ff] shadow-[0_0_40px_-8px_#7fd4ff]"
          >
            <div>[Окно Статуса]</div>
            <p className="mt-2">Вы заметили безумие «семьи». Заражение снижено.</p>
            <p className="mt-1 opacity-70">
              Заметить, вспомнить товарищей и сбежать — так Сынёп спас всю группу.
              <Ch n={10} />
            </p>
            <button onClick={() => setFreed(false)} className="mt-3 border border-[#7fd4ff] px-3 py-1 hover:bg-[#7fd4ff]/15">
              Закрыть
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Hotspot({ o, pos, open, stage, onClick }: { o: Oddity; pos: [number, number]; open: boolean; stage: number; onClick: () => void }) {
  const left = pos[0] > 60;
  const up = pos[1] > 62;
  return (
    <div className={cn("absolute", open ? "z-20" : "z-10")} style={{ left: `${pos[0]}%`, top: `${pos[1]}%` }}>
      <button onClick={onClick} aria-label={o.label} className="block h-36 w-36 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full" />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, rotate: left ? 1.5 : -1.5 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn("absolute w-64 bg-[#fbf3e1] p-3 text-[#2a1d14] shadow-[0_12px_30px_rgba(0,0,0,0.55)]", left ? "right-0" : "left-0", up ? "bottom-0" : "top-0")}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-system text-[10px] uppercase tracking-widest text-[#8a6e52]">{o.label}</span>
              <span className="font-system text-[10px] text-[#8a6e52]">гл. 6</span>
            </div>
            <p className={cn("mt-1 font-display text-[15px] leading-snug", stage < 3 && "line-through decoration-[#c0333d]/70")}>{o.normal}</p>
            <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mt-1 font-hand text-[21px] leading-tight text-[#8c1c24]">
              {stage >= 3 ? "Всё нормально. Садись есть." : o.truth}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
