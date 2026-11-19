"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { motion } from "motion/react";

/**
 * Номер 102 «Особняк Ужасов», первый заход (гл. 14–25).
 * Общее состояние страницы: звонил ли колокол, сколько судеб установлено, сведена ли партия вничью, чем кончилось.
 * Колокол — главный инструмент комнаты: его звон будит настоящие личности «слуг» и переписывает подписи на странице.
 */
type S = {
  art: (base: string) => string | null;
  bell: boolean; // колокол найден и звонил
  ring: () => void;
  tolls: number; // сколько раз ударили (для анимаций)
  fates: number; // установлено судеб (0–6)
  setFates: (n: number) => void;
  draw: boolean; // партия сведена вничью: понято, что надо лишать жертв
  setDraw: (v: boolean) => void;
  escaped: boolean;
  setEscaped: (v: boolean) => void;
};
const Ctx = createContext<S | null>(null);
export const useRoom = () => useContext(Ctx)!;

export function RoomProvider({ files, children }: { files: string[]; children: React.ReactNode }) {
  const [tolls, setTolls] = useState(0);
  const [fates, setFates] = useState(0);
  const [draw, setDraw] = useState(false);
  const [escaped, setEscaped] = useState(false);
  const art = useCallback(
    (base: string) => {
      for (const ext of [".jpg", ".png", ".webp"]) if (files.includes(base + ext)) return `/art/102/${base}${ext}`;
      return null;
    },
    [files],
  );
  const ring = useCallback(() => setTolls((t) => t + 1), []);
  return (
    <Ctx.Provider value={{ art, bell: tolls > 0, ring, tolls, fates, setFates, draw, setDraw, escaped, setEscaped }}>
      {children}
      <Hud />
      {/* удар колокола: кольцо звука по всему экрану */}
      {tolls > 0 && (
        <motion.div key={tolls} className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.6 }}>
          <motion.span className="h-40 w-40 rounded-full border-2 border-[#d9c27a]" initial={{ scale: 0.2 }} animate={{ scale: 14 }} transition={{ duration: 1.6, ease: "easeOut" }} />
        </motion.div>
      )}
    </Ctx.Provider>
  );
}

/** Подпись, которую переписывает колокол: роль → тот, кто под ней на самом деле. */
export function Mask({ role, truth, className }: { role: string; truth: string; className?: string }) {
  const { bell, tolls } = useRoom();
  return (
    <motion.span key={`${bell}${tolls}`} initial={bell ? { opacity: 0.2, filter: "blur(3px)" } : false} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.9 }} className={className}>
      {bell ? truth : role}
    </motion.span>
  );
}

/** Окно отеля: в этой комнате оно почти ничего не говорит. Плюс колокол в руке, когда он найден. */
function Hud() {
  const { bell, ring, fates, draw, escaped } = useRoom();
  return (
    <div className="fixed right-5 top-5 z-30 w-[290px] font-system text-[12px] text-[#7fd4ff]">
      <div className="border border-[#7fd4ff]/50 bg-[#06141c]/90 px-3 py-2 shadow-[0_0_24px_-8px_#7fd4ff]">
        <div>[Номер 102 · {escaped ? "побег совершён" : "Особняк Ужасов"}]</div>
        <div className="mt-1 opacity-70">Цель: {escaped ? "выполнена" : "не указана"}</div>
        <div className="mt-1.5 flex justify-between opacity-90">
          <span>судьбы: {fates}/6</span>
          <span>{draw ? "партия: ничья" : "партия: —"}</span>
        </div>
      </div>
      {bell && !escaped && (
        <button onClick={ring} className="mt-2 flex w-full items-center justify-between border border-[#d9c27a]/60 bg-[#14110a]/90 px-3 py-1.5 text-[#e9d9a0] transition hover:bg-[#d9c27a]/15">
          <span>Колокол Собора</span>
          <span className="opacity-70">ударить</span>
        </button>
      )}
    </div>
  );
}
