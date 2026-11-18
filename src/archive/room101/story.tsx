"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";

/**
 * Общее состояние прохождения: чем прикрылись на 4-м этаже и побеждён ли Ким Санмин.
 * Номер 101 проходят за пять попыток: 1 — «Странная семья», 2 — Re, 3 — подвал студии,
 * 4 — поиск и больница, 5 — финал (гл. 5–11, 62–66, 67–68, 70–73, 74–76).
 */
export type Shield = "filter" | "bracelet" | "pill";
type Story = { shield: Shield | null; setShield: (s: Shield) => void; won: boolean; setWon: (w: boolean) => void };
const Ctx = createContext<Story>({ shield: null, setShield: () => {}, won: false, setWon: () => {} });
export const useStory = () => useContext(Ctx);

export function StoryProvider({ children }: { children: React.ReactNode }) {
  const [shield, setShield] = useState<Shield | null>(null);
  const [won, setWon] = useState(false);
  return <Ctx.Provider value={{ shield, setShield, won, setWon }}>{children}</Ctx.Provider>;
}

/** Смерть в попытке: темнота, окно статуса отеля и то, что удалось вынести в следующую попытку. */
export function Blackout({ open, lines, status, note, button, onClose }: { open: boolean; lines: string[]; status: string[]; note?: string; button: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;
  const at = (i: number) => ({ initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 + i * 0.9 } });
  const n = lines.length;
  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-[60] flex cursor-auto items-center justify-center bg-black p-6">
      <div className="w-[min(520px,94vw)] space-y-4 text-center">
        {lines.map((l, i) => (
          <motion.p key={l} {...at(i)} className="font-display text-[22px] leading-snug text-[#d8d2c4]">
            {l}
          </motion.p>
        ))}
        <motion.div {...at(n)} className="space-y-1 border border-[#7fd4ff]/50 bg-[#06141c] p-3 text-left font-system text-[12px] text-[#7fd4ff] shadow-[0_0_30px_-10px_#7fd4ff]">
          {status.map((s) => (
            <div key={s}>[{s}]</div>
          ))}
        </motion.div>
        {note && (
          <motion.div {...at(n + 1)} className="mx-auto w-fit max-w-full rotate-[-1deg] bg-[#f3e27a] px-4 py-3 text-left font-hand text-[21px] leading-tight text-[#2a2410]">
            {note}
          </motion.div>
        )}
        <motion.button {...at(n + 2)} onClick={onClose} className="border border-[#7fd4ff] px-5 py-2 font-system text-[13px] text-[#7fd4ff] hover:bg-[#7fd4ff]/15">
          {button}
        </motion.button>
      </div>
    </motion.div>,
    document.body,
  );
}
