"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Noise from "@/components/Noise";
import { RUN3, nameOf } from "./data";
import { FleshHeart } from "./art";
import { Ch, useInfection } from "./infection";
import { Mad } from "./mad";

/** Палата Ким Санмина: пещера кристаллов, ком плоти и тот, кто держит нити. */
export function Ward() {
  const [hits, setHits] = useState(0);
  const [hover, setHover] = useState(false);
  const { add } = useInfection();
  const done = hits >= 6;
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#040a0a] text-[#cfeee8]">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_50%_60%,#0e2a27_0%,#040a0a_60%),radial-gradient(circle_at_15%_80%,#1fd1b922,transparent_30%)]" />
      <Noise opacity={0.07} />
      <div className="relative mx-auto max-w-6xl px-6 pt-24 text-center">
        <div className="font-system text-[12px] tracking-[0.3em] opacity-60">БОЛЬНИЦА «НОВЫЙ МИР» · 4-Й ЭТАЖ · КОНЕЦ КОРИДОРА · ГЛ. 73, 76</div>
        <Mad as="div" text="Палата Ким Санмина" className="mt-3 font-display text-5xl md:text-7xl" />
        <Mad
          className="mx-auto mt-4 max-w-2xl font-display text-[19px] leading-relaxed opacity-85"
          text="Инопланетная пещера: полупрозрачные кристаллы, свет без источника. В глубине пульсирует гигантское сердце из плоти, и в его голосе слышны мольбы к «Учителю». Ментальное давление здесь такое, что Гаин и Елена захотели съесть Сонъи."
        />
      </div>

      <div className="relative mx-auto mt-6 grid max-w-6xl items-center gap-6 px-6 pb-24 lg:grid-cols-[1fr_300px]">
        <div
          className="relative mx-auto aspect-[600/640] w-full max-w-[620px] cursor-crosshair"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onMouseMove={() => hover && Math.random() < 0.04 && add(1)}
        >
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.button
                key="heart"
                className="absolute inset-0"
                onClick={() => setHits((h) => h + 1)}
                whileTap={{ x: [0, -8, 8, -4, 0] }}
                exit={{ scaleY: 0.1, opacity: 0, y: 200, transition: { duration: 1.2 } }}
                aria-label="Ударить ком плоти"
              >
                <FleshHeart hits={hits} hover={hover} />
              </motion.button>
            ) : (
              <motion.div key="shard" className="absolute inset-0 flex flex-col items-center justify-center gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Shard />
                <Mad className="max-w-md text-center font-display text-[18px]" text="Джинчхоль забил ком плоти и вырвал из него сияющий камень. Мир комнаты стёк вниз и рухнул. Источник Проклятий уничтожен." />
                <button onClick={() => setHits(0)} className="font-system text-[11px] underline opacity-50">
                  вернуть сердце
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {!done && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 text-center font-system text-[11px] opacity-60">
              удары Джинчхоля · {hits}/6
            </div>
          )}
        </div>
        <Chart />
      </div>
    </section>
  );
}

/** Злой бог — как медицинская карта больницы. */
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
        <div className="flex gap-2">
          <dt className="opacity-60">Палата:</dt>
          <dd>4-й этаж, конец коридора</dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-dashed border-[#1d2220]/40 pt-3">
        <div className="font-system text-[10px] uppercase tracking-wider text-[#8c1c24]">Злой бог · Заключённый 101-го номера</div>
        <ul className="mt-2 space-y-2">
          {RUN3.god.facts.map((f, i) => (
            <li key={i} className="font-hand text-[19px] leading-tight">
              {f.text}
              <Ch n={f.ch ?? ""} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Shard({ size = 1 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -60 }}
      animate={{ scale: size, rotate: 0, y: [0, -8, 0] }}
      transition={{ scale: { type: "spring", stiffness: 80 }, y: { duration: 3, repeat: Infinity } }}
      className="relative h-40 w-24"
    >
      <div className="absolute -inset-10 rounded-full bg-[#9ff5e8]/30 blur-2xl" />
      <div className="absolute inset-0 rotate-12 bg-gradient-to-br from-white via-[#9ff5e8] to-[#5a7cff] [clip-path:polygon(50%_0,100%_32%,74%_100%,22%_92%,0_28%)]" />
      <div className="absolute inset-0 rotate-12 bg-gradient-to-tl from-transparent via-white/60 to-transparent [clip-path:polygon(50%_0,62%_40%,48%_92%,30%_35%)]" />
    </motion.div>
  );
}
