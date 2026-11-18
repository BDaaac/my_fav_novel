"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Заражение «семьёй» (гл. 7): растёт, пока читаешь и трогаешь семейное; интерфейс начинает считать безумие нормой.
 * Лечится только побегом: прыжок из окна (как Сынёп, гл. 10) или 10 минут вдали от семьи (гл. 66).
 */
type Ctx = { level: number; add: (n: number) => void; escape: (how: string) => void; falling: boolean };
const InfCtx = createContext<Ctx>({ level: 0, add: () => {}, escape: () => {}, falling: false });
export const useInfection = () => useContext(InfCtx);

export const STAGE = { rewrite: 30, warp: 55, critical: 80 };

export function InfectionProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState(0);
  const [falling, setFalling] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const paused = useRef(false);

  const add = useCallback((n: number) => setLevel((l) => Math.max(0, Math.min(100, l + n))), []);
  const escape = useCallback((how: string) => {
    setFalling(true);
    paused.current = true;
    setTimeout(() => {
      setLevel(0);
      setFalling(false);
      setNote(how);
      paused.current = false;
      window.scrollTo({ top: 0 });
    }, 1400);
  }, []);

  // время рядом с семьёй заражает
  useEffect(() => {
    const id = setInterval(() => !paused.current && !document.hidden && add(0.5), 1000);
    return () => clearInterval(id);
  }, [add]);
  // Esc — «обычный вид»
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setLevel(0);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // четвёртая стена: вкладка
  useEffect(() => {
    document.title = level >= STAGE.critical ? "Мама: ужин готов ♥" : level >= STAGE.warp ? "Наша дружная семья" : "Архив · Комната 101";
  }, [level]);
  useEffect(() => {
    if (!note) return;
    const id = setTimeout(() => setNote(null), 5000);
    return () => clearTimeout(id);
  }, [note]);

  return (
    <InfCtx.Provider value={{ level, add, escape, falling }}>
      <div
        className="relative transition-[filter] duration-1000"
        style={{
          filter: level >= STAGE.warp ? `sepia(${(level - STAGE.warp) / 70}) saturate(${1 + (level - STAGE.warp) / 40}) hue-rotate(-${(level - STAGE.warp) / 3}deg)` : undefined,
        }}
      >
        <motion.div animate={falling ? { y: "110vh", rotate: 4 } : { y: 0, rotate: 0 }} transition={{ duration: falling ? 1.3 : 0, ease: "easeIn" }}>
          {children}
        </motion.div>
      </div>
      <Meter level={level} />
      <AnimatePresence>
        {level >= STAGE.critical && !falling && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 right-5 z-50 w-80 border border-[#7fd4ff]/60 bg-[#06141c]/95 p-4 font-system text-[13px] text-[#7fd4ff] shadow-[0_0_30px_-6px_#7fd4ff]"
          >
            <div className="mb-2">[Совет Мудреца]</div>
            <p>Уровень заражения критический. Немедленно отойдите от «семьи».</p>
            <p className="mt-2 text-[11px] opacity-70">Сынёп заметил их безумие и выпрыгнул в окно (гл. 10).</p>
            <button
              onClick={() => escape("Побег засчитан. Вся группа вернулась в коридор; снаружи прошло около двух часов (гл. 11).")}
              className="mt-3 w-full border border-[#7fd4ff] px-3 py-1.5 hover:bg-[#7fd4ff]/15"
            >
              Выпрыгнуть в окно
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-[#7fd4ff]/60 bg-[#06141c]/95 px-4 py-2 font-system text-sm text-[#7fd4ff]"
          >
            {note}
          </motion.div>
        )}
      </AnimatePresence>
    </InfCtx.Provider>
  );
}

function Meter({ level }: { level: number }) {
  const label = level >= STAGE.critical ? "КРИТИЧЕСКОЕ" : level >= STAGE.warp ? "высокое" : level >= STAGE.rewrite ? "растёт" : "низкое";
  const fake = level >= STAGE.critical;
  return (
    <div className="fixed bottom-5 right-5 z-40 w-80 border border-[#7fd4ff]/50 bg-[#06141c]/90 px-3 py-2 font-system text-[12px] text-[#7fd4ff]">
      <div className="flex justify-between">
        <span>[Заражение: {label}]</span>
        <span>{Math.round(level)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full bg-[#7fd4ff]/15">
        <div className={cn("h-full transition-all", level >= STAGE.warp ? "bg-[#c0333d]" : "bg-[#7fd4ff]")} style={{ width: `${level}%` }} />
      </div>
      {fake && <div className="mt-1 font-hand text-lg leading-none text-[#c0333d]">всё хорошо, милый ♥</div>}
      <div className="mt-1 text-[10px] opacity-50">Esc — обычный вид</div>
    </div>
  );
}

/** Слово, которое заражение переписывает «в норму»: ~~Опасно~~ Уютно. */
export function N({ a, b }: { a: string; b: string }) {
  const { level } = useInfection();
  if (level < STAGE.rewrite) return <>{a}</>;
  return (
    <span className="whitespace-nowrap">
      <s className="decoration-[#8c1c24] decoration-2 opacity-60">{a}</s>{" "}
      <span className="font-hand text-[1.25em] leading-none text-[#8c1c24]">{b}</span>
    </span>
  );
}

/** Ссылка на главу, как сноска в вики. */
export function Ch({ n, className }: { n: number | string; className?: string }) {
  return <sup className={cn("ml-0.5 font-system text-[10px] font-normal tracking-tight opacity-60", className)}>[гл. {n}]</sup>;
}
