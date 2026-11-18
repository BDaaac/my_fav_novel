"use client";
import { useRef, useState } from "react";
import Noise from "@/components/Noise";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { RULES, RUN3 } from "./data";
import { Mad } from "./mad";
import { useInfection } from "./infection";
import { cn } from "@/lib/utils";

/** Переход: экран телевизора наезжает и заполняет всё — мы внутри эфира ABS. */
export function TvZoom() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 0.85], [0.45, 4.2]);
  const frame = useTransform(scrollYProgress, [0.35, 0.6], [1, 0]);
  const text = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);
  return (
    <div ref={ref} className="relative h-[230vh] bg-[#14161d]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div style={{ scale }} className="relative aspect-[4/3] w-[70vw] max-w-[900px]">
          <motion.div style={{ opacity: frame }} className="absolute -inset-[4%] rounded-[40px] bg-gradient-to-b from-[#3a332d] to-[#1a1613]" />
          <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-[#0c0f0e]">
            <Noise opacity={0.35} scanlines={0.6} flicker={0.6} />
            <motion.div style={{ opacity: frame }} className="absolute inset-0 flex items-center justify-center">
              <span className="bg-[#c0333d] px-3 py-1 font-system text-[2vw] font-bold text-white">ABS · LIVE</span>
            </motion.div>
          </div>
        </motion.div>
        <motion.div style={{ opacity: text }} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[#d6dcd8]">
          <div className="font-system text-[12px] tracking-[0.3em] opacity-70">ЗАХОД 3 · ГЛ. 67–76</div>
          <div className="mt-3 font-glitch text-5xl md:text-8xl">Медиа, меняющие реальность</div>
          <div className="mt-4 max-w-xl font-display text-xl opacity-80">«Странная семья» была только внешним слоем. Название комнаты в Окне Статуса сменилось.</div>
        </motion.div>
      </div>
    </div>
  );
}

/** Третий слой: телестудия ABS, которая на самом деле больница «Новый Мир». */
export function Broadcast() {
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const { add } = useInfection();
  const hospital = broken.size / RULES.length; // 0..1 — насколько студия стала больницей
  return (
    <section
      className="relative overflow-hidden transition-colors duration-700"
      style={{
        background: `color-mix(in oklab, #0c0f0e ${100 - hospital * 100}%, #d9d6c8)`,
        color: hospital > 0.5 ? "#1d2220" : "#d6dcd8",
      }}
    >
      <Noise opacity={0.06 + hospital * 0.1} dust={hospital} scratches={hospital * 0.6} />
      {hospital > 0 && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{ opacity: hospital * 0.6, backgroundImage: "radial-gradient(circle at 15% 25%, #6b5a3a66, transparent 35%), radial-gradient(circle at 85% 65%, #4a3a2a55, transparent 30%), radial-gradient(circle at 50% 90%, #5a1a1a44, transparent 30%)" }}
        />
      )}
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Tv />
          <div className="space-y-4">
            <Mad
              className="font-display text-[20px] leading-relaxed"
              text="Корея сходит с ума через эфир: люди смеются, даже когда их убивают, полиция не приезжает. Телестудия ABS переплетена с исчезнувшей психиатрической больницей «Новый Мир»."
            />
            <Mad
              className="font-display text-[20px] leading-relaxed"
              text="Цель: войти в больницу через крышу как «гости», дойти до палаты Ким Санмина в конце коридора 4-го этажа и уничтожить ком плоти."
            />
          </div>
        </div>

        <h4 className="mt-20 font-system text-xs uppercase tracking-[0.3em] opacity-70">Инструкция по технике безопасности · отметьте, чтобы нарушить</h4>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {(["Подвал", "Верхние этажи"] as const).map((sheet) => (
            <div key={sheet} className="rotate-[-0.8deg] border border-black/20 bg-[#f2f0e6] p-5 text-[#1d2220] shadow-[0_10px_24px_rgba(0,0,0,0.4)] even:rotate-[0.9deg]">
              <div className="flex items-baseline justify-between border-b-2 border-black/70 pb-2">
                <span className="font-system text-sm font-bold uppercase tracking-wider">Правила · {sheet}</span>
                <span className="font-system text-[10px] opacity-60">ABS · ламинировано</span>
              </div>
              <ul className="mt-3 space-y-3">
                {RULES.map((r, i) =>
                  r.sheet !== sheet ? null : (
                    <li key={i}>
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[#8c1c24]"
                          checked={broken.has(i)}
                          onChange={() =>
                            setBroken((s) => {
                              const n = new Set(s);
                              if (n.has(i)) n.delete(i);
                              else {
                                n.add(i);
                                add(4);
                              }
                              return n;
                            })
                          }
                        />
                        <span className={cn("font-system text-[13px]", broken.has(i) && "line-through opacity-50")}>{r.rule}</span>
                      </label>
                      <AnimatePresence>
                        {broken.has(i) && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-6 overflow-hidden font-hand text-[21px] leading-tight text-[#8c1c24]"
                          >
                            {r.broken} <span className="font-system text-[10px] opacity-60">гл. {r.ch}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
        {hospital > 0 && (
          <Mad className="mt-6 font-system text-sm opacity-80" text={`Нарушено правил: ${broken.size} из ${RULES.length}. Студия всё больше похожа на больницу «Новый Мир».`} />
        )}
      </div>
    </section>
  );
}

function Tv() {
  const [ch, setCh] = useState(0);
  const [noise, setNoise] = useState(false);
  const acts = RUN3.acts;
  const go = (n: number) => {
    setNoise(true);
    setTimeout(() => {
      setCh((n + acts.length) % acts.length);
      setNoise(false);
    }, 220);
  };
  const a = acts[ch];
  return (
    <div className="rounded-[28px] bg-gradient-to-b from-[#3b3530] to-[#1e1a17] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
      <div className="flex gap-4">
        <div className="relative aspect-[4/3] flex-1 overflow-hidden rounded-[22px] bg-[#0a1a14] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
          <div className="pointer-events-none absolute inset-0 z-10 [background:repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0_2px,transparent_2px_4px)]" />
          <div className="pointer-events-none absolute inset-0 z-10 rounded-[22px] shadow-[inset_0_0_60px_rgba(120,255,200,0.15)]" />
          <AnimatePresence mode="wait">
            {noise ? (
              <motion.div key="noise" className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/></svg>')]" />
            ) : (
              <motion.div
                key={ch}
                initial={{ opacity: 0, scaleY: 0.02 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex flex-col p-5 text-[#9ff5c8]"
              >
                <div className="flex justify-between font-system text-[11px]">
                  <span className="bg-[#c0333d] px-1.5 text-white">ABS</span>
                  <span>CH {String(ch + 1).padStart(2, "0")}</span>
                </div>
                <div className="mt-3 font-system text-lg leading-tight [text-shadow:0_0_8px_#4fffb0]">{a.title}</div>
                <p className="mt-2 overflow-auto font-system text-[12px] leading-relaxed opacity-90">{a.text}</p>
                <div className="mt-auto pt-2 font-system text-[10px] opacity-60">гл. {a.ch[0] === a.ch[1] ? a.ch[0] : `${a.ch[0]}–${a.ch[1]}`}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex w-14 flex-col items-center gap-3 pt-2">
          <button onClick={() => go(ch + 1)} className="h-12 w-12 rounded-full bg-[#5a4f45] shadow-[inset_0_-3px_6px_rgba(0,0,0,0.5)] transition active:rotate-45" aria-label="Следующий канал">
            <span className="block h-5 w-1 translate-x-[22px] bg-[#cfc4b2]" />
          </button>
          <div className="grid grid-cols-1 gap-1">
            {acts.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={cn("h-5 w-8 rounded-sm font-system text-[10px]", i === ch ? "bg-[#9ff5c8] text-black" : "bg-[#2a2420] text-[#cfc4b2]")}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center font-system text-[10px] text-[#cfc4b2]/60">Переключайте каналы: каждый канал — эпизод захода</p>
    </div>
  );
}

