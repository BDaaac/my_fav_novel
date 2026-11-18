"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { stageOf, useInfection } from "./infection";

/**
 * «Дом, который о тебе заботится»: страница сама обращается к читателю.
 * Записки от «мамы» появляются, когда ты молчишь, отходишь или возвращаешься;
 * при высоком заражении уходить вниз по странице становится тяжело.
 */
const NOTES: string[][] = [
  ["Вставай, все уже позавтракали!", "Ты сегодня какой-то рассеянный.", "Не сиди долго, глаза испортишь."],
  ["Милый, ты опять не поел.", "Куда ты всё смотришь? Мы же здесь.", "Сестра спрашивает, когда ты выйдешь."],
  ["Зачем тебе это читать? Иди к нам.", "Ты ведь никуда не собираешься?", "Мама всё видит."],
  ["Мы стоим за дверью.", "Не листай дальше.", "Тебе здесь лучше. Ты сам знаешь."],
  ["Останься.", "Мы всегда будем вместе ♥", "Ужин готов. Ужин готов. Ужин готов."],
];
const IDLE = ["Ты где? Ужин стынет.", "Почему ты молчишь?", "Ты заснул? Мама разбудит."];
const BACK = ["Ты вернулся ♥", "Где ты был? Мы волновались.", "Больше так не уходи."];

type Note = { id: number; text: string; x: number; rot: number };

export function Care() {
  const { level, falling } = useInfection();
  const stage = stageOf(level);
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const [notes, setNotes] = useState<Note[]>([]);
  const [mounted, setMounted] = useState(false);
  const seq = useRef(0);
  const last = useRef(0);

  const push = useRef((text: string) => {
    const id = ++seq.current;
    last.current = Date.now();
    setNotes((n) => [...n.slice(-1), { id, text, x: 4 + ((id * 37) % 30), rot: ((id * 53) % 9) - 4 }]);
    setTimeout(() => setNotes((n) => n.filter((v) => v.id !== id)), 7000);
  }).current;

  useEffect(() => setMounted(true), []);

  // записки по расписанию: чем выше заражение, тем чаще
  useEffect(() => {
    const id = setInterval(() => {
      const st = stageRef.current;
      const gap = [38000, 26000, 18000, 12000, 7000][st];
      if (document.hidden || Date.now() - last.current < gap) return;
      const pool = NOTES[st];
      push(pool[seq.current % pool.length]);
    }, 2000);
    last.current = Date.now() - 26000; // первая записка — секунд через двенадцать
    return () => clearInterval(id);
  }, [push]);

  // молчишь — зовут; ушёл на другую вкладку — заметили
  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;
    let n = 0;
    const arm = () => {
      clearTimeout(idle);
      idle = setTimeout(() => push(IDLE[n++ % IDLE.length]), 20000);
    };
    let away = 0;
    const vis = () => {
      if (document.hidden) away = Date.now();
      else if (away && Date.now() - away > 3000) {
        push(BACK[n++ % BACK.length]);
        const t = document.title;
        document.title = "Ты вернулся ♥";
        setTimeout(() => (document.title = t), 4000);
      }
    };
    arm();
    window.addEventListener("mousemove", arm);
    window.addEventListener("scroll", arm, { passive: true });
    window.addEventListener("keydown", arm);
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearTimeout(idle);
      window.removeEventListener("mousemove", arm);
      window.removeEventListener("scroll", arm);
      window.removeEventListener("keydown", arm);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [push]);

  // не отпускают: вниз листается всё тяжелее
  useEffect(() => {
    const wheel = (e: WheelEvent) => {
      const st = stageRef.current;
      if (st < 3 || e.deltaY <= 0 || e.ctrlKey) return;
      e.preventDefault();
      window.scrollBy(0, e.deltaY * (st >= 4 ? 0.28 : 0.55));
    };
    window.addEventListener("wheel", wheel, { passive: false });
    return () => window.removeEventListener("wheel", wheel);
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-30">
      {/* тёплая виньетка сжимается вместе с заражением */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: Math.max(0, (level - 35) / 90), boxShadow: "inset 0 0 180px 60px rgba(90,10,14,0.75)" }}
      />
      <AnimatePresence>
        {!falling &&
          notes.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 30, rotate: n.rot * 2 }}
              animate={{ opacity: 1, y: 0, rotate: n.rot }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="absolute bottom-10 w-60 bg-[#f6e58a] p-4 pt-6 text-[#2a2410] shadow-[0_14px_30px_rgba(0,0,0,0.45)]"
              style={{ left: `${n.x}%` }}
            >
              <span className="absolute left-1/2 top-[-7px] h-4 w-4 -translate-x-1/2 rounded-full bg-[#b3121b] shadow-[inset_0_-2px_3px_rgba(0,0,0,0.4)]" />
              <div className="font-hand text-[26px] leading-[1.05]">{n.text}</div>
              <div className="mt-2 text-right font-hand text-lg opacity-70">{stage >= 3 ? "— мы" : "— мама"}</div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
