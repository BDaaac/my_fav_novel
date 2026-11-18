"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Noise from "@/components/Noise";
import { nameOf } from "./data";
import { useArt } from "./artfiles";
import { useInfection } from "./infection";
import { Mad } from "./mad";

/**
 * Палата в конце коридора (гл. 73, 76). Ничего не нарисовано: темнота, пульс и слабый свет курсора.
 * Сердце ищут по пульсу; шесть ударов Джинчхоля — и в темноте остаётся Осколок.
 */
const HEART = { x: 50, y: 56 }; // % сцены
const HITS = 6;

export function Ward() {
  const [hits, setHits] = useState(0);
  const hole = useRef<HTMLDivElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [flash, setFlash] = useState(0);
  const { add } = useInfection();
  const art = useArt();
  const heartArt = art("ward-heart");
  const stage = useRef<HTMLDivElement>(null);
  const done = hits >= HITS;
  const beat = Math.max(0.5, 1.15 - hits * 0.1); // чем ближе к концу, тем чаще пульс
  // свет двигается transform-ом, без состояния React
  const paint = () => {
    raf.current = 0;
    const el = stage.current;
    if (!el || !hole.current || !solid.current || !dot.current) return;
    const b = el.getBoundingClientRect();
    const x = pos.current.x - b.left;
    const y = pos.current.y - b.top;
    hole.current.style.opacity = "1";
    solid.current.style.opacity = "0";
    hole.current.style.transform = `translate3d(calc(${x}px - 150vmax), calc(${y}px - 150vmax), 0)`;
    dot.current.style.opacity = "1";
    dot.current.style.transform = `translate3d(${x - 6}px, ${y - 6}px, 0)`;
  };
  const lightsOut = () => {
    if (hole.current) hole.current.style.opacity = "0";
    if (solid.current) solid.current.style.opacity = "1";
    if (dot.current) dot.current.style.opacity = "0";
  };

  return (
    <section className="relative overflow-hidden bg-[#020606] text-[#cfeee8]">
      <div
        ref={stage}
        className="relative h-screen min-h-[680px] cursor-none"
        onMouseMove={(e) => {
          pos.current = { x: e.clientX, y: e.clientY };
          if (!raf.current) raf.current = requestAnimationFrame(paint);
          if (!done && Math.random() < 0.015) add(1); // ментальное давление
        }}
        onMouseLeave={lightsOut}
      >
        {/* то, что есть в темноте: отблески кристаллов и ком без очертаний */}
        <div className="absolute inset-0 [background:radial-gradient(circle_at_18%_78%,#1fd1b922,transparent_22%),radial-gradient(circle_at_84%_70%,#1fd1b91c,transparent_20%),radial-gradient(circle_at_70%_22%,#1fd1b914,transparent_16%)]" />
        <svg className="absolute h-0 w-0" aria-hidden>
          <filter id="flesh101">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="70" />
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </svg>
        <AnimatePresence>
          {!done && (
            <motion.div
              key="heart"
              className="absolute h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}
              exit={{ scaleY: 0.05, opacity: 0, y: 260, transition: { duration: 1.4 } }}
            >
              <motion.div className="h-full w-full" animate={{ scale: [1, 1.09, 1, 1.05, 1] }} transition={{ duration: beat, repeat: Infinity, times: [0, 0.12, 0.3, 0.42, 1] }}>
                <div className="h-full w-full rounded-[46%] [background:radial-gradient(circle_at_42%_38%,#a3232b,#5a0c12_45%,#1c0406_75%)] [filter:url(#flesh101)]" />
                {/* трещины: изнутри светит Осколок */}
                <div className="absolute inset-[18%] rounded-full bg-[#9ff5e8] mix-blend-screen blur-2xl transition-opacity duration-500" style={{ opacity: hits / (HITS * 1.4) }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {heartArt && flash > 0 && (
          <motion.div key={flash} className="pointer-events-none absolute inset-0" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Image src={heartArt} alt="" fill sizes="100vw" className="object-contain" />
          </motion.div>
        )}

        {/* темнота со слабым светом курсора */}
        {done ? (
          <div className="pointer-events-none absolute inset-0 bg-[#020606]/55" />
        ) : (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div ref={solid} className="absolute inset-0 bg-[#020606]" />
            <div
              ref={hole}
              className="absolute left-0 top-0 h-[300vmax] w-[300vmax] opacity-0 will-change-transform [background:radial-gradient(circle_at_center,transparent_0,rgba(2,6,6,0.82)_114px,#020606_190px)]"
            />
          </div>
        )}
        <Noise opacity={0.08} />

        {/* пульс слышен и в темноте: по нему ищут сердце */}
        {!done && (
          <>
            {[0, 0.18].map((d) => (
              <motion.span
                key={d}
                className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c0333d]"
                style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}
                animate={{ scale: [0.4, 4.5], opacity: [0.35, 0] }}
                transition={{ duration: beat, repeat: Infinity, delay: d, ease: "easeOut" }}
              />
            ))}
            <motion.div
              className="pointer-events-none absolute inset-0 shadow-[inset_0_0_220px_60px_rgba(140,12,20,0.55)]"
              animate={{ opacity: [0.15, 1, 0.3, 0.7, 0.15] }}
              transition={{ duration: beat, repeat: Infinity, times: [0, 0.12, 0.3, 0.42, 1] }}
            />
            {/* мольбы ползут по краям */}
            {[
              { side: "left-4", dur: 26 },
              { side: "right-4", dur: 34 },
            ].map((w) => (
              <div key={w.side} className={`pointer-events-none absolute inset-y-0 ${w.side} w-8 overflow-hidden opacity-30`}>
                <motion.div className="whitespace-nowrap font-hand text-2xl text-[#e7b0a0] [writing-mode:vertical-rl]" animate={{ y: ["0%", "-50%"] }} transition={{ duration: w.dur, repeat: Infinity, ease: "linear" }}>
                  {"Учитель… Учитель… Учитель… ".repeat(12)}
                </motion.div>
              </div>
            ))}
            <motion.button
              aria-label="Ударить туда, где бьётся пульс"
              className="absolute h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 cursor-none rounded-full"
              style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setHits((h) => h + 1);
                setFlash((f) => f + 1);
                add(2);
              }}
            />
            {flash > 0 && <motion.div key={`f${flash}`} className="pointer-events-none absolute inset-0 bg-[#9ff5e8]" initial={{ opacity: 0.35 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />}
          </>
        )}

        {/* свет в руке */}
        {!done && <div ref={dot} className="pointer-events-none absolute left-0 top-0 h-3 w-3 rounded-full bg-[#fff3d6] opacity-0 shadow-[0_0_30px_12px_rgba(255,240,200,0.35)] will-change-transform" />}

        <div className="pointer-events-none absolute inset-x-0 top-10 px-6 text-center">
          <div className="font-system text-[12px] tracking-[0.3em] opacity-45">ПОСЛЕДНЯЯ ПАЛАТА · ГЛ. 73, 76</div>
          {!done && (
            <Mad className="mx-auto mt-3 max-w-xl font-display text-[18px] leading-relaxed opacity-60" text="За дверью пещера. Света нет. Что-то огромное бьётся в глубине и зовёт «Учителя»." />
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-system text-[11px] tracking-widest opacity-50">
          {done ? "" : hits === 0 ? "ищите по пульсу · бейте" : `удары Джинчхоля · ${hits}/${HITS}`}
        </div>

        <AnimatePresence>
          {done && (
            <motion.div key="shard" className="absolute inset-0 flex cursor-auto flex-col items-center justify-center gap-5 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1.2 }}>
              <Shard />
              <Mad className="max-w-md text-center font-display text-[18px]" text="Джинчхоль забил ком плоти и вырвал из него сияющий камень. Мир комнаты стёк вниз и рухнул. Источник Проклятий уничтожен." />
              <button onClick={() => setHits(0)} className="font-system text-[11px] underline opacity-50">
                вернуться в темноту
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-10 right-6">
          <Chart />
        </div>
      </div>
    </section>
  );
}

/** История заражения Ким Санмина: записи больницы, пересказ глав 68–78. */
const RECORD: { title: string; ch: string; text: string }[] = [
  { title: "Поступление", ch: "71", text: "Ученик старшей школы Синдон. Долгая травля, зачинщиков восемь. Школа не защитила. Семья подала в суд и проиграла: суд решил, что травлю он выдумал. Направлен к нам по решению суда." },
  { title: "Лечение", ch: "71", text: "Пациента ведёт главврач лично. Выслушал и поверил. Больница заявила открыто: до расстройства мальчика довели обидчики. Газеты подхватили." },
  { title: "Подарок Учителя", ch: "77–78", text: "Пациент зовёт главврача Учителем. Тот дал ему камешек, Осколок. Камень искажает всё рядом: разум, плоть, саму палату. Жалости у Учителя не было. Ему было забавно." },
  { title: "Исчезновение", ch: "71", text: "Больница пропала целиком, вместе со зданием. Через три дня наступил конец света." },
  { title: "Одноклассники", ch: "68", text: "Восемь учеников заперты в подвале. Они помнят только, что Санмин вдруг стал монстром. Медсестра приходит к ним каждый день." },
  { title: "Текущее состояние", ch: "73, 76", text: "Тела больше нет. В палате в конце четвёртого этажа бьётся ком плоти, сама палата стала чужим миром. Когда ему больно, он зовёт Учителя. Больницей он не управляет: для медсестёр он пациент. Управляет главврач." },
];

/** Злой бог — как история болезни. В темноте лежит папка; открой и листай записи. */
function Chart() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const facts = RECORD;
  const pages = facts.length + 1;
  const go = (d: number) => setPage((p) => Math.max(0, Math.min(pages - 1, p + d)));

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        onClick={() => {
          setPage(0);
          setOpen(true);
        }}
        className="group relative block w-[210px] rotate-[2deg] cursor-pointer bg-[#b9a87c] p-3 text-left text-[#1d2220] opacity-40 shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition duration-500 hover:rotate-0 hover:opacity-100"
      >
        <span className="absolute -top-3 left-4 h-3 w-20 rounded-t-md bg-[#b9a87c]" />
        <span className="block font-system text-[10px] font-bold uppercase tracking-widest">История болезни</span>
        <span className="mt-1 block font-hand text-[22px] leading-none">{nameOf("kim-sangmin")}</span>
        <span className="mt-2 block font-system text-[10px] opacity-70">«Новый Мир» · {facts.length} записей · открыть</span>
      </button>

      {open &&
        createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex cursor-auto items-center justify-center bg-black/85 p-4" onClick={() => setOpen(false)}>
            <motion.div
              initial={{ y: 40, rotate: -3 }}
              animate={{ y: 0, rotate: -0.6 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[min(620px,88vh)] w-[min(480px,94vw)] flex-col bg-[#e9ecdf] p-7 text-[#1d2220] shadow-[0_30px_80px_rgba(0,0,0,0.8)] [background-image:repeating-linear-gradient(transparent_0_33px,#c9cfbd_33px_34px)]"
            >
              <span className="absolute -top-3 left-10 h-9 w-4 rounded-full border-2 border-[#8b8f86] bg-transparent" />
              <div className="flex items-baseline justify-between border-b-2 border-[#1d2220] bg-[#e9ecdf] pb-1">
                <span className="font-system text-[12px] font-bold uppercase tracking-wider">История болезни</span>
                <span className="font-system text-[11px]">Психиатрическая больница «Новый Мир»</span>
              </div>
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={page} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="absolute inset-0 pt-5">
                    {page === 0 ? (
                      <dl className="space-y-[10px] font-system text-[14px] leading-[24px]">
                        {[
                          ["Пациент", nameOf("kim-sangmin")],
                          ["Школа", "старшая школа Синдон"],
                          ["Лечащий врач", "главврач, лично"],
                          ["Палата", "4-й этаж, конец коридора"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex gap-3">
                            <dt className="w-32 shrink-0 opacity-60">{k}:</dt>
                            <dd className="font-hand text-[24px] leading-[24px]">{v}</dd>
                          </div>
                        ))}
                        <div className="pt-8 font-system text-[11px] uppercase tracking-widest text-[#8c1c24]">история заражения · листайте →</div>
                      </dl>
                    ) : (
                      <div>
                        <div className="font-system text-[11px] uppercase tracking-widest text-[#8c1c24]">
                          Запись {page} · {facts[page - 1].title} · гл. {facts[page - 1].ch}
                        </div>
                        <p className="mt-[10px] font-hand text-[27px] leading-[34px]">{facts[page - 1].text}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute bottom-4 right-2 rotate-[-12deg] border-2 border-[#8c1c24]/60 px-2 py-0.5 font-system text-[11px] uppercase tracking-widest text-[#8c1c24]/60">Новый Мир</div>
              </div>
              <div className="flex items-center justify-between bg-[#e9ecdf] pt-2 font-system text-[12px]">
                <button onClick={() => go(-1)} disabled={page === 0} className="px-2 py-1 disabled:opacity-25">
                  ← назад
                </button>
                <span className="opacity-60">
                  лист {page + 1} из {pages}
                </span>
                {page < pages - 1 ? (
                  <button onClick={() => go(1)} className="px-2 py-1">
                    дальше →
                  </button>
                ) : (
                  <button onClick={() => setOpen(false)} className="px-2 py-1 text-[#8c1c24]">
                    закрыть папку
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}

export function Shard({ size = 1 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -60 }}
      animate={{ scale: size, rotate: 0, y: [0, -8, 0] }}
      transition={{ scale: { type: "spring", stiffness: 80 }, y: { duration: 3, repeat: Infinity } }}
      whileHover={{ scale: size * 1.08, filter: "brightness(1.3)" }}
      className="relative h-44 w-44"
    >
      <div className="absolute inset-4 rounded-full bg-[#9ff5e8]/25 blur-2xl" />
      <Image src="/art/101/shard.png" alt="Осколок Звезды Иномирья" fill sizes="176px" className="object-contain [mask-image:radial-gradient(circle_closest-side,black_55%,transparent_98%)]" />
    </motion.div>
  );
}
