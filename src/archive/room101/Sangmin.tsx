"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Noise from "@/components/Noise";
import { useArt } from "./artfiles";
import { useInfection } from "./infection";
import { Mad } from "./mad";
import { Blackout, useStory } from "./story";
import { Chart, Shard } from "./Ward";
import { cn } from "@/lib/utils";

/**
 * Встреча с Ким Санмином в две попытки, как в книге.
 * Попытка 4 (гл. 73): темнота, ком находят по пульсу, Сонъи стреляет — на шум приходят медсёстры, все гибнут.
 * Попытка 5 (гл. 76): Сонъи отдаёт Джинчхолю защиту браслета; у входа ждёт гигант выше трёх метров.
 *   Свалить стража → забить ком → вырвать камень. Только после этого открывается финал.
 */
const HEART = { x: 50, y: 58 };
const HITS = 6;
type Phase = "dark" | "shot" | "dead" | "guard" | "heart" | "stone" | "won";

// бой со стражем — по ходу схватки Джинчхоля
const MOVES = [
  { threat: "Рука гиганта падает сверху.", act: "Три шага назад", at: [22, 70], mash: 1 },
  { threat: "Он закрывается коленом размером с туловище.", act: "Апперкот тонфой", at: [62, 34], mash: 1 },
  { threat: "Хватает обеими руками. Давит.", act: "Пересилить", at: [50, 52], mash: 8 },
  { threat: "Его стойка пошатнулась.", act: "Удар по ноге", at: [38, 78], mash: 1 },
] as const;
const WINDOW = { filter: 1500, bracelet: 2400, pill: 3100 }; // мс на реакцию: чем слабее защита, тем сильнее давит

export function Ward() {
  const { add } = useInfection();
  const { shield, won, setWon } = useStory();
  const art = useArt();
  const heartArt = art("ward-heart");
  const [phase, setPhase] = useState<Phase>(won ? "won" : "dark");
  const [hits, setHits] = useState(0);
  const [flash, setFlash] = useState(0);
  const [move, setMove] = useState(0);
  const [mash, setMash] = useState(0);
  const [glow, setGlow] = useState(3); // защита браслета Сонъи
  const [hurt, setHurt] = useState(0);
  const [fell, setFell] = useState(false);
  const [rip, setRip] = useState(0);
  const [ripping, setRipping] = useState(false);
  const [retry, setRetry] = useState(false);

  const stage = useRef<HTMLDivElement>(null);
  const hole = useRef<HTMLDivElement>(null);
  const solid = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  const isDark = phase === "dark" || phase === "shot";
  const lit = phase === "guard" || phase === "heart" || phase === "stone";
  const beat = Math.max(0.5, 1.15 - hits * 0.1);
  const ms = WINDOW[shield ?? "filter"];

  // свет курсора (только в темноте попытки 4) — transform-ом, без состояния React
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

  // выстрелы → крик → медсёстры → темнота
  useEffect(() => {
    if (phase !== "shot") return;
    const id = setTimeout(() => setPhase("dead"), 4200);
    return () => clearTimeout(id);
  }, [phase]);

  // вырвать камень: держать, пока пальцы ломает
  useEffect(() => {
    if (!ripping || phase !== "stone") return;
    const id = setInterval(() => {
      setRip((r) => {
        const v = Math.min(1, r + 0.02);
        if (v >= 1) {
          setRipping(false);
          setPhase("won");
          setWon(true);
        }
        return v;
      });
      if (Math.random() < 0.15) add(1);
    }, 50);
    return () => clearInterval(id);
  }, [ripping, phase, add, setWon]);
  useEffect(() => {
    if (ripping || phase !== "stone" || rip === 0 || rip >= 1) return;
    const id = setInterval(() => setRip((r) => Math.max(0, r - 0.03)), 50);
    return () => clearInterval(id);
  }, [ripping, phase, rip]);

  const startGuard = () => {
    setMove(0);
    setMash(0);
    setGlow(3);
    setFell(false);
    setRetry(false);
    setPhase("guard");
  };
  const miss = () => {
    setHurt((h) => h + 1);
    setMash(0);
    add(4);
    if (glow <= 1) {
      setGlow(0);
      setRetry(true);
    } else setGlow((g) => g - 1);
  };
  const strike = () => {
    const m = MOVES[move];
    if (mash + 1 < m.mash) return setMash((v) => v + 1);
    setMash(0);
    setFlash((f) => f + 1);
    if (move + 1 < MOVES.length) return setMove((v) => v + 1);
    setFell(true);
    setTimeout(() => setPhase("heart"), 2600);
  };

  return (
    <section className="relative overflow-hidden bg-[#020606] text-[#cfeee8]">
      <div
        ref={stage}
        className={cn("relative h-screen min-h-[700px]", isDark && "cursor-none")}
        onMouseMove={(e) => {
          if (!isDark) return;
          pos.current = { x: e.clientX, y: e.clientY };
          if (!raf.current) raf.current = requestAnimationFrame(paint);
          if (Math.random() < 0.015) add(1);
        }}
        onMouseLeave={lightsOut}
      >
        <motion.div className="absolute inset-0" animate={ripping ? { skewX: [0, 1.5, -1.5, 0], scale: [1, 1.02, 1] } : { skewX: 0, scale: 1, x: hurt === 0 ? 0 : hurt % 2 ? [0, -14, 12, -6, 0] : [0, 14, -12, 6, 0] }} transition={ripping ? { duration: 0.35, repeat: Infinity } : { duration: 0.4 }}>
          {/* отблески кристаллов */}
          <div className={cn("absolute inset-0 transition-opacity duration-[2000ms] [background:radial-gradient(circle_at_18%_78%,#1fd1b933,transparent_24%),radial-gradient(circle_at_84%_70%,#1fd1b92b,transparent_22%),radial-gradient(circle_at_70%_22%,#1fd1b922,transparent_18%),radial-gradient(circle_at_30%_18%,#1fd1b91c,transparent_16%)]", lit ? "opacity-100" : "opacity-60")} />
          {/* белое сияние защиты Сонъи */}
          {lit && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 + glow * 0.06 }} className="absolute inset-0 [background:radial-gradient(ellipse_at_50%_100%,#ffffff,transparent_65%)]" />}

          <svg className="absolute h-0 w-0" aria-hidden>
            <filter id="flesh101">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="11" />
              <feDisplacementMap in="SourceGraphic" scale="70" />
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </svg>

          {/* ком плоти */}
          <AnimatePresence>
            {phase !== "won" && (
              <motion.div
                key="heart"
                className="absolute h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}
                animate={{ opacity: phase === "guard" ? 0.45 : 1 }}
                exit={{ scaleY: 0.05, opacity: 0, y: 260, transition: { duration: 1.4 } }}
              >
                <motion.div className="h-full w-full" animate={{ scale: phase === "shot" ? [1, 1.25, 0.95, 1.2, 1] : [1, 1.09, 1, 1.05, 1] }} transition={{ duration: phase === "shot" ? 0.4 : beat, repeat: Infinity, times: [0, 0.12, 0.3, 0.42, 1] }}>
                  <div className="h-full w-full rounded-[46%] [background:radial-gradient(circle_at_42%_38%,#a3232b,#5a0c12_45%,#1c0406_75%)] [filter:url(#flesh101)]" />
                  <div className="absolute inset-[18%] rounded-full bg-[#9ff5e8] mix-blend-screen blur-2xl transition-opacity duration-500" style={{ opacity: phase === "stone" ? 0.7 + rip * 0.3 : hits / (HITS * 1.4) }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* страж: не фигура, а тень выше трёх метров */}
          <AnimatePresence>
            {phase === "guard" && (
              <motion.div
                key="guard"
                className="absolute bottom-0 left-1/2 h-[92%] w-[46%] origin-bottom -translate-x-1/2"
                initial={{ opacity: 0, scaleY: 0.6 }}
                animate={fell ? { rotate: 82, y: 120, opacity: 0.5 } : { opacity: 1, scaleY: 1, scale: [1, 1.03, 1] }}
                exit={{ opacity: 0 }}
                transition={fell ? { duration: 0.9, ease: "easeIn" } : { scale: { duration: 2.4, repeat: Infinity }, opacity: { duration: 1.2 } }}
              >
                <motion.div key={move} initial={{ scale: 1 }} animate={{ scale: fell ? 1 : [1, 1.14, 1] }} transition={{ duration: 0.5 }} className="h-full w-full origin-bottom">
                  <div className="h-full w-full bg-black blur-[22px] [clip-path:polygon(38%_0,62%_0,70%_12%,96%_22%,100%_58%,86%_60%,80%_34%,74%_100%,54%_100%,50%_62%,46%_100%,26%_100%,20%_34%,14%_60%,0_58%,4%_22%,30%_12%)]" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {heartArt && flash > 0 && phase !== "won" && (
            <motion.div key={flash} className="pointer-events-none absolute inset-0" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Image src={heartArt} alt="" fill sizes="100vw" className="object-contain" />
            </motion.div>
          )}
        </motion.div>

        {/* темнота попытки 4 */}
        {isDark && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div ref={solid} className="absolute inset-0 bg-[#020606]" />
            <div ref={hole} className="absolute left-0 top-0 h-[300vmax] w-[300vmax] opacity-0 will-change-transform [background:radial-gradient(circle_at_center,transparent_0,rgba(2,6,6,0.82)_114px,#020606_190px)]" />
          </div>
        )}
        {phase === "won" && <div className="pointer-events-none absolute inset-0 bg-[#020606]/55" />}
        <Noise opacity={0.08} />

        {/* пульс и мольбы */}
        {phase !== "won" && (
          <>
            {isDark &&
              [0, 0.18].map((d) => (
                <motion.span
                  key={d}
                  className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c0333d]"
                  style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}
                  animate={{ scale: [0.4, 4.5], opacity: [0.35, 0] }}
                  transition={{ duration: beat, repeat: Infinity, delay: d, ease: "easeOut" }}
                />
              ))}
            <motion.div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_220px_60px_rgba(140,12,20,0.55)]" animate={{ opacity: [0.15, 1, 0.3, 0.7, 0.15] }} transition={{ duration: beat, repeat: Infinity, times: [0, 0.12, 0.3, 0.42, 1] }} />
            {["left-4", "right-4"].map((side, i) => (
              <div key={side} className={`pointer-events-none absolute inset-y-0 ${side} w-8 overflow-hidden opacity-30`}>
                <motion.div className="whitespace-nowrap font-hand text-2xl text-[#e7b0a0] [writing-mode:vertical-rl]" animate={{ y: ["0%", "-50%"] }} transition={{ duration: 26 + i * 8, repeat: Infinity, ease: "linear" }}>
                  {"Учитель… Учитель… Учитель… ".repeat(12)}
                </motion.div>
              </div>
            ))}
          </>
        )}

        {/* попытка 4: выстрел */}
        {phase === "dark" && (
          <button
            aria-label="Выстрелить туда, где бьётся пульс"
            className="absolute h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 cursor-none rounded-full"
            style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}
            onClick={() => {
              lightsOut();
              setFlash((f) => f + 1);
              add(6);
              setPhase("shot");
            }}
          />
        )}
        {phase === "shot" && (
          <div className="pointer-events-none absolute inset-0">
            <motion.div className="absolute inset-0 bg-[#fff3d6]" initial={{ opacity: 0 }} animate={{ opacity: [0.7, 0, 0.6, 0, 0.5, 0] }} transition={{ duration: 0.9 }} />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="absolute inset-x-0 top-[22%] text-center font-system text-3xl tracking-[0.3em] text-[#fff3d6]">
              ТАН! ТАН! ТАН!
            </motion.p>
            <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }} className="absolute inset-x-6 top-[34%] text-center font-hand text-4xl text-[#ff6a6a] md:text-5xl">
              Учитель! Где вы? Меня опять мучают!
            </motion.p>
            {[
              { from: { x: "-40vw", y: 0 }, cls: "left-1/2 top-[70%]" },
              { from: { x: "40vw", y: 0 }, cls: "left-1/2 top-[78%]" },
              { from: { x: 0, y: "30vh" }, cls: "left-1/2 top-[86%]" },
            ].map((n, i) => (
              <motion.p key={i} initial={{ ...n.from, opacity: 0 }} animate={{ x: "-50%", y: 0, opacity: 1 }} transition={{ delay: 2 + i * 0.35, duration: 1.2 }} className={`absolute ${n.cls} whitespace-nowrap font-system text-xl tracking-widest text-[#cfe0da]`}>
                — Кири-ри-рик!
              </motion.p>
            ))}
          </div>
        )}

        {/* попытка 5: страж */}
        {phase === "guard" && !fell && !retry && (
          <Move key={`${move}-${hurt}`} m={MOVES[move]} mash={mash} ms={MOVES[move].mash > 1 ? ms * 2.2 : ms} onHit={strike} onMiss={miss} />
        )}
        {phase === "guard" && fell && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pointer-events-none absolute inset-x-6 top-[40%] text-center font-display text-2xl text-[#eef2ff]">
            Гигант падает. Тонфа не выдержала и сломалась. Дальше кулаками.
          </motion.p>
        )}

        {/* ком: бить */}
        {phase === "heart" && (
          <motion.button
            aria-label="Бить ком плоти"
            className="absolute h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setFlash((f) => f + 1);
              setHurt((h) => h + 1);
              if (hits + 1 >= HITS) setPhase("stone");
              setHits((h) => h + 1);
            }}
          />
        )}
        {/* камень: держать */}
        {phase === "stone" && (
          <div className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${HEART.x}%`, top: `${HEART.y}%` }}>
            <button
              onPointerDown={() => setRipping(true)}
              onPointerUp={() => setRipping(false)}
              onPointerLeave={() => setRipping(false)}
              className="relative h-28 w-28 select-none rounded-full border-2 border-[#9ff5e8] bg-[#9ff5e8]/15 font-system text-[12px] text-[#eafffb] shadow-[0_0_50px_10px_rgba(159,245,232,0.45)]"
            >
              <span className="absolute inset-0 rounded-full bg-[#9ff5e8]/50" style={{ clipPath: `inset(${100 - rip * 100}% 0 0 0)` }} />
              <span className="relative">держать</span>
            </button>
          </div>
        )}

        {/* свет в руке */}
        {isDark && <div ref={dot} className="pointer-events-none absolute left-0 top-0 h-3 w-3 rounded-full bg-[#fff3d6] opacity-0 shadow-[0_0_30px_12px_rgba(255,240,200,0.35)] will-change-transform" />}
        {flash > 0 && phase !== "won" && phase !== "shot" && <motion.div key={`f${flash}`} className="pointer-events-none absolute inset-0 bg-[#9ff5e8]" initial={{ opacity: 0.3 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />}

        {/* подписи сцены */}
        <div className="pointer-events-none absolute inset-x-0 top-10 px-6 text-center">
          <div className="font-system text-[12px] tracking-[0.3em] opacity-50">
            ПОСЛЕДНЯЯ ПАЛАТА · {isDark || phase === "dead" ? "ПОПЫТКА 4 · ГЛ. 73" : "ПОПЫТКА 5 · ГЛ. 76"}
          </div>
          <Mad
            key={phase}
            className="mx-auto mt-3 max-w-xl font-display text-[18px] leading-relaxed opacity-70"
            text={
              {
                dark: "За дверью пещера. Света нет. Что-то огромное бьётся в глубине и зовёт «Учителя». У Сонъи пистолет.",
                shot: "",
                dead: "",
                guard: "Сонъи из последних сил отдаёт Джинчхолю защиту браслета. Старейшина остаётся держать медсестёр. В палате ждёт то, чего раньше не было.",
                heart: "Ком ноет: кто обидел, кто виноват. Джинчхоль не слушает.",
                stone: "В остатках плоти сияет камень. Пальцы рядом с ним ломает и выворачивает. Не отпускать.",
                won: "",
              }[phase]
            }
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-system text-[11px] tracking-widest opacity-55">
          {phase === "dark" && "ищите по пульсу · стреляйте"}
          {phase === "guard" && !fell && (
            <span className="inline-flex items-center gap-2">
              защита браслета
              {[0, 1, 2].map((i) => (
                <span key={i} className={cn("h-2 w-2 rounded-full border border-white", i < glow && "bg-white shadow-[0_0_8px_#fff]")} />
              ))}
            </span>
          )}
          {phase === "heart" && `бейте · ${hits}/${HITS}`}
          {phase === "stone" && "зажмите и держите, пока камень не выйдет"}
        </div>

        {/* победа */}
        <AnimatePresence>
          {phase === "won" && (
            <motion.div key="shard" className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.2 }}>
              <Shard />
              <Mad className="max-w-md text-center font-display text-[18px]" text="Джинчхоль вырвал камень, и плоть осыпалась, как разваливающийся замок. Палата, больница, телестудия стекают вниз одна за другой." />
              <motion.div className="font-system text-[11px] tracking-widest opacity-60" animate={{ y: [0, 6, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
                ЛИСТАЙТЕ ВНИЗ
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === "dark" || phase === "won") && (
          <div className="absolute bottom-10 right-6">
            <Chart />
          </div>
        )}
      </div>

      <Blackout
        open={phase === "dead"}
        lines={["Медсёстры пришли на шум.", "…Сознание меркнет."]}
        status={["Пользователь: Хан Гаин (Мудрость) · Уровень 1, коридор", "Начинается пятая попытка участника!"]}
        note="Больницей управляет не Санмин: для неё он пациент, а мы устроили беспорядок. С пятой попытки всё становится хуже."
        button="Пятая попытка"
        onClose={startGuard}
      />
      <Blackout
        open={retry}
        lines={["Защита Сонъи погасла.", "Давление этой палаты ломает разум за секунды."]}
        status={["Бой у двери палаты"]}
        button="Собраться и ударить снова"
        onClose={startGuard}
      />
    </section>
  );
}

/** Один выпад стража: успеть ответить, пока не вышло время. */
function Move({ m, mash, ms, onHit, onMiss }: { m: (typeof MOVES)[number]; mash: number; ms: number; onHit: () => void; onMiss: () => void }) {
  const missed = useRef(false);
  return (
    <>
      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-none absolute inset-x-6 top-[30%] text-center font-display text-2xl text-[#eef2ff] [text-shadow:0_2px_12px_#000]">
        {m.threat}
      </motion.p>
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.at[0]}%`, top: `${m.at[1]}%` }}>
        <motion.button initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileTap={{ scale: 0.92 }} onClick={onHit} className="relative overflow-hidden border-2 border-white bg-black/70 px-6 py-3 font-system text-[15px] text-white shadow-[0_0_30px_rgba(255,255,255,0.35)]">
          <motion.span
            className="absolute inset-y-0 left-0 bg-white/25"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: ms / 1000, ease: "linear" }}
            onAnimationComplete={() => {
              if (missed.current) return;
              missed.current = true;
              onMiss();
            }}
          />
          <span className="relative">
            {m.act}
            {m.mash > 1 && ` · ${mash}/${m.mash}`}
          </span>
        </motion.button>
      </div>
    </>
  );
}
