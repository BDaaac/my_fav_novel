"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Скрытый эпилог (гл. 78): пока товарищи шли к палате, Ари говорила с «Учителем».
 * Реплики — пересказ разговора, не цитаты. Находится только в самом конце страницы.
 */
const LINES: { who: "" | "Ари" | "Учитель"; text: string }[] = [
  { who: "", text: "Пока остальные шли к последней палате, Ари была в другом месте. Чужое тело перед ней раскололось надвое, и из него вышел высокий худой мужчина в очках. Лет сорока, может, пятидесяти. Не человек." },
  { who: "Ари", text: "Значит, это ты был Заключённым этой комнаты?" },
  { who: "Учитель", text: "Так нас называет ваше Управление? Что ж, не спорю. Это место и правда моя тюрьма." },
  { who: "Ари", text: "Ты дал силу Ким Санмину. Ты и есть «Учитель»." },
  { who: "Учитель", text: "Бедный ребёнок. Его травили без причины, потом заклеймили журналисты. Раз жизнь обошлась с ним так, у него должен был быть шанс отплатить." },
  { who: "Ари", text: "Тебе правда его жаль?" },
  { who: "Учитель", text: "Конечно, нет. Но разве не было забавно? Один камешек, и мир стал таким интересным." },
  { who: "Учитель", text: "Каждый номер этого отеля — чья-то тюрьма. Сумеете ли вы удержать всех, кого зовёте Заключёнными?" },
];

export function Epilogue() {
  const [n, setN] = useState(0); // 0 — закрыто
  const open = n > 0;
  const done = n >= LINES.length;
  return (
    <section className="relative bg-[#0b0a09] pb-32 text-[#e9e1d0]">
      <div className="mx-auto max-w-2xl px-6">
        {!open ? (
          <button onClick={() => setN(1)} className="group mx-auto flex flex-col items-center gap-3 pt-10 opacity-30 transition-opacity duration-700 hover:opacity-100">
            <motion.span className="h-16 w-px bg-[#c9a227]" animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity }} />
            <span className="font-system text-[11px] tracking-[0.3em] text-[#c9a227]">В ЭТО ВРЕМЯ · ГЛ. 78</span>
          </button>
        ) : (
          <div className="pt-10">
            <div className="text-center font-system text-[11px] tracking-[0.3em] text-[#c9a227]">В ЭТО ВРЕМЯ · ГЛ. 78</div>
            <div className="mt-8 space-y-5">
              <AnimatePresence initial={false}>
                {LINES.slice(0, n).map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className={cn(l.who === "Учитель" && "pl-8 md:pl-16")}>
                    {l.who && <div className={cn("font-system text-[10px] uppercase tracking-[0.3em]", l.who === "Учитель" ? "text-[#c0333d]" : "text-[#7fd4ff]")}>{l.who}</div>}
                    <p className={cn("mt-1 font-display leading-relaxed", l.who ? "text-[21px]" : "text-[18px] italic opacity-70", l.who === "Учитель" && "text-[#f0d8d0]")}>{l.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-10 text-center">
              {!done ? (
                <button onClick={() => setN((v) => v + 1)} className="border border-[#c9a227]/60 px-5 py-2 font-system text-[12px] tracking-widest text-[#c9a227] hover:bg-[#c9a227]/10">
                  дальше
                </button>
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="font-display text-[16px] italic opacity-50">
                  Номер 101 рушится. Этот разговор продолжается уже за его пределами.
                </motion.p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
