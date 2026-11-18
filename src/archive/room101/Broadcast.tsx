"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ATTEMPTS, RULES, RUN3, deathsIn, nameOf, short } from "./data";
import { Ch } from "./infection";
import { cn } from "@/lib/utils";

/** Третий слой: телестудия ABS, которая на самом деле больница «Новый Мир». */
export function Broadcast() {
  const [broken, setBroken] = useState<Set<number>>(new Set());
  const hospital = broken.size / RULES.length; // 0..1 — насколько студия стала больницей
  return (
    <div
      className="relative overflow-hidden rounded-sm px-6 py-8 transition-colors duration-700 md:px-10"
      style={{
        background: `color-mix(in oklab, #121416 ${100 - hospital * 100}%, #d9d6c8)`,
        color: hospital > 0.5 ? "#1d2220" : "#d6dcd8",
      }}
    >
      {hospital > 0 && (
        <div
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{ opacity: hospital * 0.5, backgroundImage: "radial-gradient(circle at 20% 30%, #6b5a3a55, transparent 40%), radial-gradient(circle at 80% 70%, #4a3a2a44, transparent 35%)" }}
        />
      )}
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <Tv />
        <div>
          <p className="font-display text-lg leading-relaxed">
            Корея сходит с ума через эфир: люди смеются, даже когда их убивают. Телестудия ABS переплетена с исчезнувшей психиатрической больницей «Новый Мир», и нарушение любого правила техники безопасности переносит в её палаты.
            <Ch n={67} />
          </p>
          <p className="mt-3 font-display text-lg leading-relaxed">
            Цель: войти в больницу через крышу как «гости», дойти до палаты Ким Санмина в конце коридора 4-го этажа и уничтожить ком плоти.
            <Ch n={74} />
          </p>
        </div>
      </div>

      {/* инструкции */}
      <h4 className="relative mt-10 font-system text-xs uppercase tracking-[0.25em] opacity-70">Инструкция по технике безопасности · нарушить?</h4>
      <div className="relative mt-3 grid gap-5 md:grid-cols-2">
        {(["Подвал", "Верхние этажи"] as const).map((sheet) => (
          <div key={sheet} className="rotate-[-0.6deg] border border-black/20 bg-[#f2f0e6] p-4 text-[#1d2220] shadow-[0_8px_20px_rgba(0,0,0,0.35)] even:rotate-[0.8deg]">
            <div className="flex items-baseline justify-between border-b border-black/20 pb-2">
              <span className="font-system text-sm font-bold uppercase">Правила · {sheet}</span>
              <span className="font-system text-[10px] opacity-60">ламинировано</span>
            </div>
            <ul className="mt-2 space-y-2">
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
                            else n.add(i);
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
                          className="ml-6 overflow-hidden font-display text-[15px] italic leading-snug text-[#8c1c24]"
                        >
                          {r.broken}
                          <Ch n={r.ch} />
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
        <p className="relative mt-4 font-system text-xs opacity-70">
          Нарушено правил: {broken.size} из {RULES.length}. Студия всё больше похожа на больницу «Новый Мир».
        </p>
      )}

      <Attempts />
      <God />
      <Heart />
    </div>
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

function Attempts() {
  const [n, setN] = useState(5);
  const dead = new Set(deathsIn(n).map((d) => d.who));
  const team = RUN3.team;
  return (
    <div className="relative mt-12">
      <h4 className="font-system text-xs uppercase tracking-[0.25em] opacity-70">Пять попыток</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {ATTEMPTS.map((a) => (
          <button
            key={a.n}
            onClick={() => setN(a.n)}
            className={cn("border px-3 py-1 font-system text-sm", n === a.n ? "border-current bg-current/10" : "border-current/30 opacity-70 hover:opacity-100")}
          >
            Попытка {a.n}
          </button>
        ))}
      </div>
      <p className="mt-3 font-display text-[16px]">
        {ATTEMPTS[n - 1].note}
        <Ch n={ATTEMPTS[n - 1].ch.replace("гл. ", "")} />
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {team.map((id) => (
          <div key={id} className="relative flex w-20 flex-col items-center">
            <svg viewBox="0 0 40 60" className={cn("h-14 w-10", dead.has(id) && "opacity-40")}>
              <circle cx="20" cy="12" r="9" fill="currentColor" />
              <path d="M6 60 Q4 26 20 24 Q36 26 34 60 Z" fill="currentColor" />
            </svg>
            {dead.has(id) && (
              <svg viewBox="0 0 40 60" className="absolute top-0 h-14 w-10">
                <path d="M4 4 L36 56 M36 4 L4 56" stroke="#c0333d" strokeWidth="4" />
              </svg>
            )}
            <span className="mt-1 text-center font-system text-[10px]">{short(id)}</span>
          </div>
        ))}
      </div>
      <ul className="mt-3 space-y-1">
        {deathsIn(n).map((d, i) => (
          <li key={i} className="font-display text-[14px] opacity-80">
            ✝ {nameOf(d.who).split(" (")[0]}: {d.how.replace(/^Попытка \d:\s*/, "")}
            <Ch n={d.ch} />
          </li>
        ))}
        {!deathsIn(n).length && <li className="font-display text-[14px] opacity-60">Смертей в данных этой попытки не отмечено.</li>}
      </ul>
    </div>
  );
}

function God() {
  return (
    <div className="relative mt-12 border-l-4 border-[#8c1c24] pl-4">
      <h4 className="font-system text-xs uppercase tracking-[0.25em] opacity-70">Злой бог</h4>
      <div className="mt-1 font-display text-2xl">Главврач больницы «Новый Мир» («Учитель»)</div>
      <div className="font-system text-[11px] opacity-70">Заключённый 101-го номера · носитель проклятия — Ким Санмин · гл. 78</div>
      <ul className="mt-3 space-y-1.5">
        {RUN3.god.facts.map((f, i) => (
          <li key={i} className="font-display text-[15px] leading-snug">
            — {f.text}
            <Ch n={f.ch ?? ""} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Финал: ком плоти, похожий на сердце. Удары Джинчхоля → Осколок. */
function Heart() {
  const [hits, setHits] = useState(0);
  const done = hits >= 6;
  return (
    <div className="relative mt-12 flex flex-col items-center gap-4 rounded-sm bg-[#071312] px-6 py-10 text-[#bdf7ec]">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_30%_20%,#1fd1b955,transparent_30%),radial-gradient(circle_at_75%_70%,#1fb9d133,transparent_35%)]" />
      <div className="relative font-system text-xs uppercase tracking-[0.25em] opacity-70">Палата Ким Санмина · гл. 73, 76</div>
      <p className="relative max-w-xl text-center font-display text-[15px]">
        Инопланетная пещера: полупрозрачные кристаллы, свет без источника. В глубине пульсирует сердце из плоти.
      </p>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.button
            key="heart"
            onClick={() => setHits((h) => h + 1)}
            animate={{ scale: [1, 1.08, 1, 1.12, 1] }}
            transition={{ duration: Math.max(0.5, 1.2 - hits * 0.12), repeat: Infinity }}
            exit={{ scale: 0, opacity: 0, rotate: 20 }}
            className="relative h-40 w-40 rounded-[45%_45%_50%_50%] shadow-[0_0_60px_#8c1c24]"
            style={{ background: "radial-gradient(circle at 40% 35%, #d9566a, #8c1c24 55%, #3a0a12)", filter: `saturate(${1 - hits * 0.12})` }}
            aria-label="Ударить ком плоти"
          >
            {Array.from({ length: hits }, (_, i) => (
              <span key={i} className="absolute h-1 w-10 bg-[#1a0508]" style={{ left: `${20 + ((i * 23) % 50)}%`, top: `${25 + ((i * 31) % 50)}%`, rotate: `${i * 47}deg` }} />
            ))}
          </motion.button>
        ) : (
          <motion.div key="shard" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} className="flex flex-col items-center gap-3">
            <div className="h-20 w-12 rotate-12 bg-gradient-to-br from-white via-[#9ff5e8] to-[#5a7cff] shadow-[0_0_50px_#9ff5e8] [clip-path:polygon(50%_0,100%_35%,70%_100%,20%_90%,0_30%)]" />
            <div className="font-display text-2xl">Осколок Звезды Иномирья</div>
            <p className="max-w-xl text-center font-display text-[15px] opacity-90">
              Джинчхоль забил ком плоти и вырвал сияющий камень. Мир комнаты стёк вниз и рухнул. Источник уничтожен, все вернулись живыми.
              <Ch n={76} />
            </p>
            <button onClick={() => setHits(0)} className="font-system text-[11px] underline opacity-60">
              вернуть сердце
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {!done && <div className="relative font-system text-[11px] opacity-60">нажмите, чтобы ударить · {hits}/6</div>}
    </div>
  );
}
