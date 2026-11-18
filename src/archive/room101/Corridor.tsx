"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/**
 * Переход «студия → палата»: коридор 4-го этажа больницы (гл. 73).
 * Листаешь — идёшь вперёд: рамы коридора наезжают, дверь в конце растёт и глотает экран.
 */
const FRAMES = 9;
const WALK = 8.6; // сколько «рам» проходим за прокрутку

export function Corridor() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const intro = useTransform(scrollYProgress, [0, 0.12, 0.3], [0, 1, 0]);
  const near = useTransform(scrollYProgress, [0.45, 0.6, 0.8], [0, 1, 0]);
  const black = useTransform(scrollYProgress, [0.86, 1], [0, 1]);
  return (
    <div ref={ref} className="relative h-[260vh] bg-[#0c0f0e]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#070a09]">
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
        <motion.div style={{ opacity: intro }} className="pointer-events-none absolute inset-x-0 top-[14%] px-6 text-center">
          <div className="font-system text-[12px] tracking-[0.3em] text-[#9fb8b0]/70">БОЛЬНИЦА «НОВЫЙ МИР» · 4-Й ЭТАЖ · ГЛ. 73</div>
          <p className="mx-auto mt-3 max-w-lg font-display text-[20px] leading-relaxed text-[#cfe0da]">«Я ищу ученика Ким Санмина». Медсестра дёргает головой, разворачивается и идёт по коридору. Идите за ней.</p>
        </motion.div>
        <motion.div style={{ opacity: near }} className="pointer-events-none absolute inset-x-0 bottom-[12%] px-6 text-center">
          <p className="mx-auto max-w-lg font-display text-[20px] leading-relaxed text-[#cfe0da]">Чем ближе к концу коридора, тем сильнее давит на голову. Гаин и Елена смотрят на Сонъи и хотят её съесть.</p>
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
