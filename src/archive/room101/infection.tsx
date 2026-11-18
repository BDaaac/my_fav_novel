"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Заражение «семьёй» (гл. 7): растёт, пока ты в комнате и трогаешь семейное.
 * Комната постепенно переписывает себя: цвет, шрифты, слова — безумие становится нормой.
 * Лечится только побегом: прыжок из окна (Сынёп, гл. 10) или 10 минут вдали от семьи (гл. 66).
 */
type Ctx = { level: number; add: (n: number) => void; escape: (how: string) => void; falling: boolean; safe: boolean; calm: (on: boolean) => void };
const InfCtx = createContext<Ctx>({ level: 0, add: () => {}, escape: () => {}, falling: false, safe: false, calm: () => {} });
export const useInfection = () => useContext(InfCtx);

/** Пороги: переписывание слов → тёплая гниль → распад шрифта → критическое. */
export const STAGE = { rewrite: 20, warp: 40, glitch: 60, critical: 82 };
export const stageOf = (l: number) => (l >= STAGE.critical ? 4 : l >= STAGE.glitch ? 3 : l >= STAGE.warp ? 2 : l >= STAGE.rewrite ? 1 : 0);

const mix = (a: string, b: string, t: number) => `color-mix(in oklab, ${a} ${Math.round((1 - t) * 100)}%, ${b})`;

export function InfectionProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevel] = useState(0);
  const [falling, setFalling] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const paused = useRef(false);
  const [safe, setSafe] = useState(false);
  const safeRef = useRef(false);

  const add = useCallback((n: number) => {
    if (!safeRef.current) setLevel((l) => Math.max(0, Math.min(100, l + n)));
  }, []);
  /** Вне комнаты (финал): заражение снято и не растёт. */
  const calm = useCallback((on: boolean) => {
    safeRef.current = on;
    setSafe(on);
    if (on) setLevel(0);
  }, []);
  const escape = useCallback((how: string) => {
    setFalling(true);
    paused.current = true;
    setTimeout(() => {
      setLevel(0);
      setFalling(false);
      setNote(how);
      paused.current = false;
      window.scrollTo({ top: 0 });
    }, 1500);
  }, []);

  useEffect(() => {
    const id = setInterval(() => !paused.current && !document.hidden && add(0.6), 1000);
    return () => clearInterval(id);
  }, [add]);
  // для проверки в dev: window.__inf(+30)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") (window as unknown as { __inf: (n: number) => void }).__inf = add;
  }, [add]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setLevel(0);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  useEffect(() => {
    document.title = level >= STAGE.critical ? "Мама: ужин готов ♥" : level >= STAGE.glitch ? "Наш дом" : level >= STAGE.warp ? "Наша дружная семья" : "Архив · Комната 101";
  }, [level]);
  useEffect(() => {
    if (!note) return;
    const id = setTimeout(() => setNote(null), 5500);
    return () => clearTimeout(id);
  }, [note]);

  // Палитра комнаты плывёт вместе с заражением: уютный беж → ржавчина → кровь.
  const t = level / 100;
  const vars = {
    "--paper": mix("#efe4cc", "#d9b48f", Math.min(1, t * 1.6)),
    "--ink": mix("#2b2018", "#5a0e12", Math.max(0, (t - 0.3) * 1.4)),
    "--accent": mix("#7a4a2a", "#b3121b", Math.min(1, t * 1.3)),
    "--mad": String(t),
  } as React.CSSProperties;

  return (
    <InfCtx.Provider value={{ level, add, escape, falling, safe, calm }}>
      <div style={vars} className={cn("relative", level >= STAGE.critical && "cursor-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22><text y=%2220%22 font-size=%2220%22>♥</text></svg>'),_auto]")}>
        <motion.div animate={falling ? { y: "115vh", rotate: 5 } : { y: 0, rotate: 0 }} transition={{ duration: falling ? 1.4 : 0, ease: [0.5, 0, 1, 0.6] }}>
          {children}
        </motion.div>
      </div>
      <Status level={level} safe={safe} onJump={() => escape("Побег засчитан. Вся группа вернулась в коридор; снаружи прошло около двух часов (гл. 11).")} falling={falling} />
      <AnimatePresence>
        {note && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed left-1/2 top-5 z-50 -translate-x-1/2 border border-[#7fd4ff]/60 bg-[#06141c]/95 px-4 py-2 font-system text-sm text-[#7fd4ff]"
          >
            {note}
          </motion.div>
        )}
      </AnimatePresence>
    </InfCtx.Provider>
  );
}

/** Окно статуса отеля — единственное, что «семья» переписать не может (только пытается). */
function Status({ level, onJump, falling, safe }: { level: number; onJump: () => void; falling: boolean; safe: boolean }) {
  const s = stageOf(level);
  const label = ["низкое", "растёт", "высокое", "опасное", "КРИТИЧЕСКОЕ"][s];
  return (
    <div className="fixed right-5 top-5 z-40 w-[300px] font-system text-[12px] text-[#7fd4ff]">
      <div className="border border-[#7fd4ff]/50 bg-[#06141c]/90 px-3 py-2 shadow-[0_0_24px_-8px_#7fd4ff] backdrop-blur">
        <div className="flex justify-between">
          <span>{safe ? "[Вне номера · заражение снято]" : `[Заражение: ${label}]`}</span>
          <span>{Math.round(level)}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full bg-[#7fd4ff]/15">
          <div className={cn("h-full transition-all duration-500", s >= 2 ? "bg-[#c0333d]" : "bg-[#7fd4ff]")} style={{ width: `${level}%` }} />
        </div>
        {s >= 3 && <div className="mt-1 font-hand text-lg leading-none text-[#e05a5a]">{s >= 4 ? "всё хорошо, милый ♥" : "не слушай его, родной"}</div>}
      </div>
      <AnimatePresence>
        {s >= 4 && !falling && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 border border-[#7fd4ff]/60 bg-[#06141c]/95 p-3 shadow-[0_0_30px_-6px_#7fd4ff]">
            <div>[Совет Мудреца]</div>
            <p className="mt-1">Немедленно отойдите от «семьи».</p>
            <button onClick={onJump} className="mt-2 w-full border border-[#7fd4ff] px-3 py-1.5 hover:bg-[#7fd4ff]/15">
              Выпрыгнуть в окно
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {!safe && <div className="mt-1 text-right text-[10px] text-[#7fd4ff]/50">Esc — очнуться</div>}
    </div>
  );
}

/** Сноска на главу. */
export function Ch({ n, className }: { n: number | string; className?: string }) {
  return <sup className={cn("ml-0.5 font-system text-[10px] font-normal not-italic tracking-tight opacity-55", className)}>гл.&nbsp;{n}</sup>;
}
