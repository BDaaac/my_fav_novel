"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Ch, stageOf, useInfection } from "./infection";
import { Mad, MadTitle } from "./mad";
import { useArt } from "./artfiles";
import { KeyTag } from "./Home";
import { cn } from "@/lib/utils";

/**
 * Утро в доме Хан Гаина (гл. 6). Тёплая сцена завтрака; под курсором проступает правда.
 * Найди все странности — это и есть путь к побегу: заметить безумие.
 * Координаты точек — под композицию из docs/art-prompts-101.md (hero-home.png).
 */
type Oddity = { id: string; x: number; y: number; label: string; normal: string; truth: string };
const ODDITIES: Oddity[] = [
  { id: "mom", x: 17, y: 46, label: "Мама", normal: "Кричит: все уже позавтракали, вставай!", truth: "Никто не ел. Ложки не подняты, рисоварку даже не открывали." },
  { id: "rice", x: 44, y: 70, label: "Рис", normal: "Мама всегда кладёт в рис что-то полезное.", truth: "В рисе извиваются живые личинки шелкопряда. «Суперфуд», — говорит сестра." },
  { id: "sister", x: 53, y: 47, label: "Хиган", normal: "Сестрёнка, второй класс старшей школы. «Оппа, я звала тебя пять раз!»", truth: "Жуёт личинок и не понимает, о чём ты. И почему она не в школе?" },
  { id: "dad", x: 81, y: 50, label: "Отец", normal: "Уже поел, сидит на диване и ворчит.", truth: "Жуёт что-то шевелящееся. Тоже личинки." },
  { id: "photo", x: 50, y: 20, label: "Фото", normal: "Семейное фото. Сегодня едем в дендрарий, потом утка и курорт.", truth: "Куда мы едем? Как я здесь оказался? Память утекает, как песок." },
];
const MAD_FALLBACK = "sepia(0.8) saturate(2.6) hue-rotate(-30deg) contrast(1.5) brightness(0.75)";

export function Hero() {
  const { level, add } = useInfection();
  const art = useArt();
  const s = stageOf(level);
  const base = art("hero-home") ?? art("living") ?? "";
  const mad = art("hero-home-mad");
  const ref = useRef<HTMLDivElement>(null);
  const lensEl = useRef<HTMLDivElement>(null);
  const innerEl = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [freed, setFreed] = useState(false);
  const r = 110 + level * 1.6;
  const rRef = useRef(r);
  rRef.current = r;
  // лупа двигается только transform-ом, раз в кадр и мимо React: ничего не перерисовывается
  const paint = () => {
    raf.current = 0;
    const el = ref.current;
    const l = lensEl.current;
    const inner = innerEl.current;
    if (!el || !l || !inner) return;
    const b = el.getBoundingClientRect();
    const x = pos.current.x - b.left - rRef.current;
    const y = pos.current.y - b.top - rRef.current;
    l.style.opacity = "1";
    l.style.transform = `translate3d(${x}px,${y}px,0)`;
    inner.style.width = `${b.width}px`;
    inner.style.height = `${b.height}px`;
    inner.style.transform = `translate3d(${-x}px,${-y}px,0)`;
  };
  const madImg = (
    <Image src={mad ?? base} alt="" fill sizes="100vw" className="object-cover" style={mad ? undefined : { filter: MAD_FALLBACK }} />
  );

  const reveal = (o: Oddity) => {
    setOpen((v) => (v === o.id ? null : o.id));
    if (found.has(o.id)) return;
    const n = new Set(found).add(o.id);
    setFound(n);
    add(5);
    if (n.size === ODDITIES.length)
      setTimeout(() => {
        setFreed(true);
        add(-35);
      }, 900);
  };

  return (
    <section className="relative h-screen min-h-[680px] overflow-hidden bg-[#140d08] text-[#f3e9d6]">
      <div
        ref={ref}
        className="absolute inset-0 cursor-none"
        onMouseMove={(e) => {
          pos.current = { x: e.clientX, y: e.clientY };
          if (!raf.current) raf.current = requestAnimationFrame(paint);
          if (Math.random() < 0.008) add(1);
        }}
        onMouseLeave={() => {
          if (lensEl.current) lensEl.current.style.opacity = "0";
        }}
      >
        {/* норма */}
        <motion.div className="absolute inset-0" animate={{ scale: 1 + level / 900 }} transition={{ duration: 2 }}>
          <Image src={base} alt="Утро в квартире: мама у рисоварки, сестра за столом, отец на диване" fill priority sizes="100vw" className="object-cover" />
        </motion.div>
        {/* правда: целиком проступает с заражением, а под курсором — всегда */}
        <div className="pointer-events-none absolute inset-0 transition-opacity duration-1000" style={{ opacity: Math.max(0, (level - 25) / 110) }}>
          {madImg}
        </div>
        <div
          ref={lensEl}
          className="pointer-events-none absolute left-0 top-0 overflow-hidden rounded-full opacity-0 transition-opacity duration-200 will-change-transform [mask-image:radial-gradient(circle_closest-side,black_55%,transparent_100%)]"
          style={{ width: r * 2, height: r * 2 }}
        >
          <div ref={innerEl} className="absolute left-0 top-0 will-change-transform">
            {madImg}
          </div>
        </div>
      </div>

      {/* виньетка и затемнение под текст */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_35%,rgba(20,10,5,0.75))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#140d08]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#140d08] via-[#140d08]/80 to-transparent" />

      {ODDITIES.map((o) => (
        <Hotspot key={o.id} o={o} found={found.has(o.id)} open={open === o.id} stage={s} onClick={() => reveal(o)} />
      ))}

      <div className="pointer-events-none absolute left-6 top-8 md:left-12">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#e6b980]">КОМНАТА ПРОКЛЯТИЙ · 1-Й ЭТАЖ · №101</div>
        <MadTitle text="Странная семья" alt="Наш дом" className="mt-1 text-[#f6ead2]" size="clamp(3rem, 7vw, 6.5rem)" />
        <Mad as="div" text="{Комната,|Дом,} где тебя всегда ждут к ужину" className="font-hand text-3xl text-[#e6b980]" />
      </div>

      <div className="absolute inset-x-6 bottom-8 grid items-end gap-8 md:inset-x-12 md:grid-cols-[1fr_auto]">
        <div className="max-w-xl">
          <Mad
            className="font-display text-[19px] leading-relaxed text-[#efe2c8]"
            text="Каждый гость просыпается в своей семье. Хан Гаина будит мама, сестрёнка Хиган зовёт «оппой», отец ворчит с дивана. Всё было бы хорошо, только родные ведут себя всё {безумнее,|заботливее,} а отель понемногу выветривается из памяти."
          />
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-system text-[11px] tracking-wider">
            <span className="text-[#e6b980]">ВОДИТЕ КУРСОРОМ — ПОД НИМ ПРАВДА · ЖМИТЕ НА ТОЧКИ</span>
            <span className="flex items-center gap-1.5 text-[#f6ead2]">
              странности
              {ODDITIES.map((o) => (
                <span key={o.id} className={cn("h-2 w-2 rounded-full border border-[#e6b980]", found.has(o.id) && "border-[#c0333d] bg-[#c0333d]")} />
              ))}
            </span>
          </div>
        </div>
        <KeyTag />
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

function Hotspot({ o, found, open, stage, onClick }: { o: Oddity; found: boolean; open: boolean; stage: number; onClick: () => void }) {
  const left = o.x > 60;
  return (
    <div className="absolute z-10" style={{ left: `${o.x}%`, top: `${o.y}%` }}>
      <button onClick={onClick} aria-label={o.label} className="relative block h-5 w-5 -translate-x-1/2 -translate-y-1/2">
        <span className={cn("absolute inset-0 animate-ping rounded-full", found ? "bg-[#c0333d]/40" : "bg-[#f6ead2]/50")} />
        <span className={cn("relative block h-5 w-5 rounded-full border-2 shadow-[0_0_12px_rgba(0,0,0,0.6)]", found ? "border-[#ffb4b4] bg-[#c0333d]" : "border-[#140d08]/60 bg-[#f6ead2]")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, rotate: left ? 1.5 : -1.5 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn("absolute top-4 w-64 bg-[#fbf3e1] p-3 text-[#2a1d14] shadow-[0_12px_30px_rgba(0,0,0,0.55)]", left ? "right-2" : "left-2")}
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
