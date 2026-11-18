"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { nameOf } from "./data";

/** История заражения Ким Санмина: записи больницы, пересказ глав 68–78. */
const RECORD: { title: string; ch: string; text: string }[] = [
  { title: "Поступление", ch: "71", text: "Ученик старшей школы Синдон. Долгая травля, зачинщиков восемь. Школа не защитила. Семья подала в суд и проиграла: суд решил, что травлю он выдумал. Направлен к нам по решению суда." },
  { title: "Лечение", ch: "71", text: "Пациента ведёт главврач лично. Выслушал и поверил. Больница заявила открыто: до расстройства мальчика довели обидчики. Газеты подхватили." },
  { title: "Подарок Учителя", ch: "77–78", text: "Пациент зовёт главврача Учителем. Тот дал ему камешек, Осколок. Камень искажает всё рядом: разум, плоть, саму палату. Жалости у Учителя не было. Ему было забавно." },
  { title: "Исчезновение", ch: "71", text: "Больница пропала целиком, вместе со зданием. Через три дня наступил конец света." },
  { title: "Одноклассники", ch: "68", text: "Восемь учеников заперты в подвале. Они помнят только, что Санмин вдруг стал монстром. Медсестра приходит к ним каждый день." },
  { title: "Текущее состояние", ch: "73, 76", text: "Тела больше нет. В палате в конце четвёртого этажа бьётся ком плоти, сама палата стала чужим миром. Когда ему больно, он зовёт Учителя. Больницей он не управляет: для медсестёр он пациент. Управляет главврач." },
];

/** Злой бог — как история болезни. В темноте лежит папка; открой и листай записи. */
export function Chart() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const facts = RECORD;
  const pages = facts.length + 1;
  const go = (d: number) => setPage((p) => Math.max(0, Math.min(pages - 1, p + d)));

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        onClick={() => {
          setPage(0);
          setOpen(true);
        }}
        className="group relative block w-[210px] rotate-[2deg] cursor-pointer bg-[#b9a87c] p-3 text-left text-[#1d2220] opacity-40 shadow-[0_20px_40px_rgba(0,0,0,0.7)] transition duration-500 hover:rotate-0 hover:opacity-100"
      >
        <span className="absolute -top-3 left-4 h-3 w-20 rounded-t-md bg-[#b9a87c]" />
        <span className="block font-system text-[10px] font-bold uppercase tracking-widest">История болезни</span>
        <span className="mt-1 block font-hand text-[22px] leading-none">{nameOf("kim-sangmin")}</span>
        <span className="mt-2 block font-system text-[10px] opacity-70">«Новый Мир» · {facts.length} записей · открыть</span>
      </button>

      {open &&
        createPortal(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex cursor-auto items-center justify-center bg-black/85 p-4" onClick={() => setOpen(false)}>
            <motion.div
              initial={{ y: 40, rotate: -3 }}
              animate={{ y: 0, rotate: -0.6 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[min(620px,88vh)] w-[min(480px,94vw)] flex-col bg-[#e9ecdf] p-7 text-[#1d2220] shadow-[0_30px_80px_rgba(0,0,0,0.8)] [background-image:repeating-linear-gradient(transparent_0_33px,#c9cfbd_33px_34px)]"
            >
              <span className="absolute -top-3 left-10 h-9 w-4 rounded-full border-2 border-[#8b8f86] bg-transparent" />
              <div className="flex items-baseline justify-between border-b-2 border-[#1d2220] bg-[#e9ecdf] pb-1">
                <span className="font-system text-[12px] font-bold uppercase tracking-wider">История болезни</span>
                <span className="font-system text-[11px]">Психиатрическая больница «Новый Мир»</span>
              </div>
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={page} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="absolute inset-0 pt-5">
                    {page === 0 ? (
                      <dl className="space-y-[10px] font-system text-[14px] leading-[24px]">
                        {[
                          ["Пациент", nameOf("kim-sangmin")],
                          ["Школа", "старшая школа Синдон"],
                          ["Лечащий врач", "главврач, лично"],
                          ["Палата", "4-й этаж, конец коридора"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex gap-3">
                            <dt className="w-32 shrink-0 opacity-60">{k}:</dt>
                            <dd className="font-hand text-[24px] leading-[24px]">{v}</dd>
                          </div>
                        ))}
                        <div className="pt-8 font-system text-[11px] uppercase tracking-widest text-[#8c1c24]">история заражения · листайте →</div>
                      </dl>
                    ) : (
                      <div>
                        <div className="font-system text-[11px] uppercase tracking-widest text-[#8c1c24]">
                          Запись {page} · {facts[page - 1].title} · гл. {facts[page - 1].ch}
                        </div>
                        <p className="mt-[10px] font-hand text-[27px] leading-[34px]">{facts[page - 1].text}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute bottom-4 right-2 rotate-[-12deg] border-2 border-[#8c1c24]/60 px-2 py-0.5 font-system text-[11px] uppercase tracking-widest text-[#8c1c24]/60">Новый Мир</div>
              </div>
              <div className="flex items-center justify-between bg-[#e9ecdf] pt-2 font-system text-[12px]">
                <button onClick={() => go(-1)} disabled={page === 0} className="px-2 py-1 disabled:opacity-25">
                  ← назад
                </button>
                <span className="opacity-60">
                  лист {page + 1} из {pages}
                </span>
                {page < pages - 1 ? (
                  <button onClick={() => go(1)} className="px-2 py-1">
                    дальше →
                  </button>
                ) : (
                  <button onClick={() => setOpen(false)} className="px-2 py-1 text-[#8c1c24]">
                    закрыть папку
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>,
          document.body,
        )}
    </>
  );
}

export function Shard({ size = 1 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -60 }}
      animate={{ scale: size, rotate: 0, y: [0, -8, 0] }}
      transition={{ scale: { type: "spring", stiffness: 80 }, y: { duration: 3, repeat: Infinity } }}
      whileHover={{ scale: size * 1.08, filter: "brightness(1.3)" }}
      className="relative h-44 w-44"
    >
      <div className="absolute inset-4 rounded-full bg-[#9ff5e8]/25 blur-2xl" />
      <Image src="/art/101/shard.jpg" alt="Осколок Звезды Иномирья" fill sizes="176px" className="object-contain [mask-image:radial-gradient(circle_closest-side,black_55%,transparent_98%)]" />
    </motion.div>
  );
}
