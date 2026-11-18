"use client";
import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useInfection } from "./infection";
import { useStory, type Shield } from "./story";
import { cn } from "@/lib/utils";

/**
 * Переход «студия → палата»: коридор 4-го этажа больницы (гл. 73–74).
 * Листаешь — идёшь вперёд: рамы коридора наезжают, дверь в конце растёт и глотает экран.
 * На этом этаже давит на разум: фильтр Гаина не держит, спасают браслет Сонъи и Красное лекарство.
 */
const FRAMES = 9;
const WALK = 8.6; // сколько «рам» проходим за прокрутку

const SHIELDS: { id: Shield; name: string; note: string }[] = [
  { id: "filter", name: "Фильтр Гаина", note: "держал до сих пор. Здесь не выдержит" },
  { id: "bracelet", name: "Браслет Сонъи", note: "защита духа, пока у неё есть силы" },
  { id: "pill", name: "Красное лекарство", note: "принять и очнуться. Оно одно" },
];
// насколько «плывёт» коридор и сколько заражения набегает по дороге
const PRESSURE: Record<Shield, { blur: number; skew: number; hue: number; inf: number }> = {
  filter: { blur: 3.5, skew: 3, hue: 40, inf: 3 },
  bracelet: { blur: 1, skew: 0.8, hue: 10, inf: 1 },
  pill: { blur: 0, skew: 0, hue: 0, inf: 0 },
};

export function Corridor() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { add } = useInfection();
  const { shield, setShield } = useStory();
  const p = PRESSURE[shield ?? "filter"];
  const intro = useTransform(scrollYProgress, [0, 0.04, 0.26, 0.34], [0, 1, 1, 0]);
  const introOff = useTransform(scrollYProgress, (v) => (v > 0.34 ? "none" : "auto"));
  const near = useTransform(scrollYProgress, [0.45, 0.6, 0.8], [0, 1, 0]);
  const black = useTransform(scrollYProgress, [0.86, 1], [0, 1]);
  // давление растёт к концу коридора
  const filter = useTransform(scrollYProgress, (v) => (p.blur || p.hue ? `blur(${(p.blur * v).toFixed(2)}px) hue-rotate(${Math.round(-p.hue * v)}deg) saturate(${1 + v * (p.hue / 30)})` : "none"));
  const step = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.floor(v * 14);
    if (s > step.current && p.inf) add(p.inf);
    step.current = s;
  });

  return (
    <div ref={ref} className="relative h-[280vh] bg-[#0c0f0e]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#070a09]">
        <motion.div className="absolute inset-0" style={{ filter }} animate={p.skew ? { skewX: [-p.skew, p.skew, -p.skew], scale: [1, 1 + p.skew / 100, 1] } : { skewX: 0, scale: 1 }} transition={{ duration: 3.2, repeat: p.skew ? Infinity : 0, ease: "easeInOut" }}>
          {/* стены сходятся в точку */}
          <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
            {[
              [0, 0],
              [100, 0],
              [0, 100],
              [100, 100],
            ].map(([x, y]) => (
              <line key={`${x}${y}`} x1={x} y1={y} x2="50" y2="50" stroke="#2f3f3a" strokeWidth="0.15" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          {Array.from({ length: FRAMES }, (_, i) => (
            <Frame key={i} i={i} p={scrollYProgress} />
          ))}
          <Door p={scrollYProgress} />
        </motion.div>

        <motion.div style={{ opacity: intro, pointerEvents: introOff }} className="absolute inset-x-0 top-[10%] px-6 text-center">
          <div className="font-system text-[12px] tracking-[0.3em] text-[#9fb8b0]/70">БОЛЬНИЦА «НОВЫЙ МИР» · 4-Й ЭТАЖ · ГЛ. 73–74</div>
          <p className="mx-auto mt-3 max-w-lg font-display text-[20px] leading-relaxed text-[#cfe0da]">«Я ищу ученика Ким Санмина». Медсестра дёргает головой, разворачивается и идёт по коридору. На этом этаже давит на разум. Чем прикроетесь?</p>
          <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-3">
            {SHIELDS.map((s) => (
              <button
                key={s.id}
                onClick={() => setShield(s.id)}
                className={cn("w-[200px] border px-3 py-2 text-left transition", shield === s.id ? "border-[#9ff5e8] bg-[#9ff5e8]/15 shadow-[0_0_24px_-6px_#9ff5e8]" : "border-[#5d7b72] bg-black/50 hover:bg-[#5d7b72]/20")}
              >
                <div className="font-system text-[13px] text-[#eafffb]">{s.name}</div>
                <div className="mt-0.5 font-display text-[14px] leading-snug text-[#cfe0da]/75">{s.note}</div>
              </button>
            ))}
          </div>
          {!shield && <div className="mt-3 font-system text-[10px] tracking-widest text-[#9fb8b0]/60">не выберете — пойдёте с одним фильтром</div>}
        </motion.div>
        <motion.div style={{ opacity: near }} className="pointer-events-none absolute inset-x-0 bottom-[12%] px-6 text-center">
          <p className="mx-auto max-w-lg font-display text-[20px] leading-relaxed text-[#cfe0da]">
            {shield === "pill" ? "Голова ясная. Остальные рядом смотрят на Сонъи так, будто хотят её съесть." : shield === "bracelet" ? "Браслет держит. Но Гаин и Елена всё равно смотрят на Сонъи и хотят её съесть." : "Фильтр трещит. Вы смотрите на Сонъи и понимаете, что хотите её съесть."}
          </p>
        </motion.div>
        <motion.div style={{ opacity: black }} className="pointer-events-none absolute inset-0 bg-[#020606]" />
      </div>
    </div>
  );
}

/** Одна «рама» коридора: чем ближе, тем крупнее; пройденные исчезают. */
function Frame({ i, p }: { i: number; p: MotionValue<number> }) {
  const depth = (v: number) => i + 1 - v * WALK;
  const scale = useTransform(p, (v) => {
    const d = depth(v);
    return d > 0.12 ? 1 / d : 0;
  });
  const opacity = useTransform(p, (v) => {
    const d = depth(v);
    if (d <= 0.12) return 0;
    return Math.max(0, Math.min(1, d * 3)) * Math.max(0.12, 1 - d / 9);
  });
  const lamp = i % 2 === 0;
  return (
    <motion.div style={{ scale, opacity }} className="absolute inset-0 border-2 border-[#5d7b72] bg-[#101a17]/35 shadow-[inset_0_0_140px_rgba(0,0,0,0.75)] will-change-transform">
      {/* плинтус и кафель до половины стены */}
      <div className="absolute inset-x-0 bottom-0 h-[42%] border-t border-[#5d7b72]/70 bg-[#16241f]/40" />
      {lamp && (
        <motion.div
          className="absolute left-1/2 top-[3%] h-[1.2%] w-[22%] -translate-x-1/2 bg-[#d8f5ea] shadow-[0_0_40px_10px_rgba(190,255,230,0.35)]"
          animate={i === 4 ? { opacity: [1, 0.2, 1, 1, 0.1, 1] } : undefined}
          transition={{ duration: 2.3, repeat: Infinity }}
        />
      )}
      {/* двери палат по стенам */}
      <div className="absolute bottom-0 left-[4%] h-[52%] w-[5%] border-2 border-b-0 border-[#5d7b72]/80 bg-[#070a09]" />
      <div className="absolute bottom-0 right-[4%] h-[52%] w-[5%] border-2 border-b-0 border-[#5d7b72]/80 bg-[#070a09]" />
    </motion.div>
  );
}

/** Последняя палата: дверь, за которой темно. */
function Door({ p }: { p: MotionValue<number> }) {
  const D = FRAMES + 0.4;
  const scale = useTransform(p, (v) => 1 / Math.max(0.16, D - v * WALK));
  return (
    <motion.div style={{ scale }} className="absolute inset-0 flex items-center justify-center will-change-transform">
      <div className="relative h-[72%] w-[34%] border-2 border-[#56706a] bg-[#020606] shadow-[0_0_60px_10px_rgba(140,12,20,0.35)]">
        <motion.div className="absolute inset-0 bg-[#8c0c14]" animate={{ opacity: [0, 0.35, 0.05, 0.25, 0] }} transition={{ duration: 1.15, repeat: Infinity, times: [0, 0.12, 0.3, 0.42, 1] }} />
        <div className="absolute left-1/2 top-[6%] -translate-x-1/2 whitespace-nowrap border border-[#56706a] bg-[#0c1211] px-[6%] py-[1%] font-system text-[min(2.2vw,22px)] text-[#cfe0da]">Ким Санмин</div>
      </div>
    </motion.div>
  );
}
