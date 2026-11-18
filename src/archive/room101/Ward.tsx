"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Noise from "@/components/Noise";
import { RUN3, nameOf } from "./data";
import { useArt } from "./artfiles";
import { Ch, useInfection } from "./infection";
import { Mad } from "./mad";

/**
 * Палата в конце коридора (гл. 73, 76). Ничего не нарисовано: темнота, пульс и слабый свет курсора.
 * Сердце ищут по пульсу; шесть ударов Джинчхоля — и в темноте остаётся Осколок.
 */
const HEART = { x: 50, y: 56 }; // % сцены
const HITS = 6;

export function Ward() {
  const [hits, setHits] = useState(0);
  const [light, setLight] = useState<{ x: number; y: number } | null>(null);
  const [flash, setFlash] = useState(0);
  const { add } = useInfection();
  const art = useArt();
  const heartArt = art("ward-heart");
  const stage = useRef<HTMLDivElement>(null);
  const done = hits >= HITS;
  const beat = Math.max(0.5, 1.15 - hits * 0.1); // чем ближе к концу, тем чаще пульс
  const dark = light ? `radial-gradient(circle 190px at ${light.x}px ${light.y}px, transparent 0%, rgba(2,6,6,0.82) 60%, #020606 100%)` : "#020606";

  return (
    <section className="relative overflow-hidden bg-[#020606] text-[#cfeee8]">
      <div className="relative mx-auto max-w-6xl px-6 pt-24 text-center">
        <div className="font-system text-[12px] tracking-[0.3em] opacity-50">БОЛЬНИЦА «НОВЫЙ МИР» · 4-Й ЭТАЖ · КОНЕЦ КОРИДОРА · ГЛ. 73, 76</div>
        <Mad
          className="mx-auto mt-5 max-w-xl font-display text-[19px] leading-relaxed opacity-70"
          text="Дверь последней палаты открывается в пещеру. Света нет. Что-то огромное бьётся в глубине и зовёт «Учителя». Здесь Гаин и Елена захотели съесть Сонъи."
        />
      </div>

      <div
        ref={stage}
        className="relative mt-8 h-[92vh] min-h-[640px] cursor-none"
        onMouseMove={(e) => {
          const b = stage.current!.getBoundingClientRect();
          setLight({ x: e.clientX - b.left, y: e.clientY - b.top });
          if (!done && Math.random() < 0.03) add(1); // ментальное давление
        }}
        onMouseLeave={() => setLight(null)}
      >
        {/* то, что есть в темноте: отблески кристаллов и ком без очертаний */}
        <div className="absolute inset-0 [background:radial-gradient(circle_at_18%_78%,#1fd1b922,transparent_22%),radial-gradient(circle_at_84%_70%,#1fd1b91c,transparent_20%),radial-gradient(circle_at_70%_22%,#1fd1b914,transparent_16%)]" />
        <svg className="absolute h-0 w-0" aria-hidden>
          <filter id="flesh101">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="11">
              <animate attributeName="baseFrequency" dur="9s" values="0.018;0.026;0.018" repeatCount="indefinite" />
            </feTurbulence>
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
        <div className="pointer-events-none absolute inset-0" style={{ background: done ? "rgba(2,6,6,0.55)" : dark }} />
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
        {light && !done && (
          <div className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3d6] shadow-[0_0_30px_12px_rgba(255,240,200,0.35)]" style={{ left: light.x, top: light.y }} />
        )}

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

        <div className="absolute bottom-10 right-6 w-[280px] opacity-20 transition-opacity duration-700 hover:opacity-100 max-lg:hidden">
          <Chart />
        </div>
      </div>
    </section>
  );
}

/** Злой бог — как медицинская карта больницы. Лежит в темноте, читается, если поднести свет. */
function Chart() {
  return (
    <div className="rotate-[1deg] bg-[#e9ecdf] p-5 text-left text-[#1d2220] shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
      <div className="flex items-baseline justify-between border-b-2 border-[#1d2220] pb-1">
        <span className="font-system text-[11px] font-bold uppercase">История болезни</span>
        <span className="font-system text-[10px]">«Новый Мир»</span>
      </div>
      <dl className="mt-3 space-y-1 font-system text-[12px]">
        <div className="flex gap-2">
          <dt className="opacity-60">Пациент:</dt>
          <dd>{nameOf("kim-sangmin")}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="opacity-60">Лечащий:</dt>
          <dd>Главврач («Учитель»)</dd>
        </div>
      </dl>
      <ul className="mt-3 space-y-2 border-t border-dashed border-[#1d2220]/40 pt-3">
        {RUN3.god.facts.map((f, i) => (
          <li key={i} className="font-hand text-[18px] leading-tight">
            {f.text}
            <Ch n={f.ch ?? ""} />
          </li>
        ))}
      </ul>
    </div>
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
