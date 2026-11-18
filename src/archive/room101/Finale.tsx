"use client";
import { useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import { useInfection } from "./infection";

/**
 * Граница финала (гл. 76): мир комнаты стекает вниз и рушится, отель объявляет итог.
 * Дальше — уже не 101-й: заражение снято, «семья» молчит, страница становится спокойной.
 */
const LINES = [
  "Источник Проклятий уничтожен.",
  "Среди товарищей обнаружен Финальный Решатель.",
  "Все участники благополучно возвращаются.",
  "Получено Наследие: «Осколок Звезды Иномирья».",
];
// потёки рушащейся комнаты: положение, ширина, длина, задержка
const DRIPS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 4.7 + ((i * 37) % 9)) % 100, w: 1 + (i % 3), h: 18 + ((i * 53) % 55), d: (i % 7) * 0.12 }));

export function Finale({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const out = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const { calm } = useInfection();
  useEffect(() => {
    calm(out);
    return () => calm(false);
  }, [out, calm]);

  return (
    <div ref={ref}>
      <section className="relative overflow-hidden bg-[#0b0a09] pb-28">
        {/* комната стекает вниз */}
        <div className="relative h-[46vh] bg-gradient-to-b from-[#020606] to-[#0b0a09]">
          {DRIPS.map((d, i) => (
            <motion.span
              key={i}
              className="absolute top-0 rounded-b-full bg-gradient-to-b from-[#5a0c12] via-[#3a0a0e] to-transparent"
              style={{ left: `${d.x}%`, width: d.w * 3 }}
              initial={{ height: 0, opacity: 0.9 }}
              whileInView={{ height: `${d.h}%`, opacity: 0.25 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 2.4, delay: d.d, ease: [0.3, 0, 0.2, 1] }}
            />
          ))}
        </div>

        {/* отель объявляет итог */}
        <div className="relative mx-auto max-w-xl space-y-3 px-6 font-system text-[13px] text-[#7fd4ff]">
          {LINES.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ delay: 0.5 + i * 0.7 }}
              className="border border-[#7fd4ff]/40 bg-[#06141c]/80 px-4 py-2.5 shadow-[0_0_24px_-10px_#7fd4ff]"
            >
              [{t}]
            </motion.div>
          ))}
        </div>

        {/* черта: дальше — отель */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ delay: 1.2, duration: 1.5 }}
          className="relative mx-auto mt-24 flex max-w-4xl items-center gap-5 px-6"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9a227]/70" />
          <span className="font-display text-[15px] uppercase tracking-[0.4em] text-[#c9a227]">Номер 101 · решён</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9a227]/70" />
        </motion.div>
        <p className="mt-4 text-center font-display text-[17px] italic text-[#e9e1d0]/55">Заражение снято. Здесь вас уже никто не зовёт к ужину.</p>
      </section>
      {children}
    </div>
  );
}
