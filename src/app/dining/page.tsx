"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import hotel from "@/data/hotel.json";
import { Fog } from "@/components/hotel/Fog";
import { StatusWindow } from "@/components/hotel/StatusWindow";

type Stage = "empty" | "blink" | "away" | "served";

/** Блюда — это передышки между комнатами. */
const DISHES: { name: string; title: string; chapters: [number, number]; text?: string }[] = [
  { name: "Pepsi Zero с лаймом", title: "Отдых, подвал отеля — «Живой бассейн»", chapters: [11, 14] },
  ...hotel.interludes.map((i, k) => ({
    name: ["Чашка какао", "Утренний кофе", "Праздничный торт"][k] ?? "Блюдо дня",
    title: i.title,
    chapters: i.chapters as [number, number],
    text: i.text,
  })),
  { name: "Допросный чай", title: "Антракт, приятное время допроса", chapters: [49, 49] },
  { name: "Шашлык у костра", title: "День в кемпинге, странный торговец", chapters: [51, 53] },
  { name: "Шампанское", title: "Время Вечеринок, Сувенирный магазин", chapters: [79, 87] },
  { name: "Яйцо всмятку", title: "Время Вечеринок — Вылупление, Исповедь", chapters: [100, 109] },
];

export default function Dining() {
  const [stage, setStage] = useState<Stage>("empty");
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (stage !== "away") return;
    if (count === 0) {
      setStage("served");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 280);
    return () => clearTimeout(t);
  }, [stage, count]);

  return (
    <main className="wallpaper min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-system text-xs text-paper/50 hover:text-brass">← лобби</Link>
        <h1 className="mt-6 font-display text-6xl text-brass">Столовая</h1>
        <p className="font-display text-xl italic text-paper/60">Завтрак 7:00 · Обед 12:00 · Ужин 19:00</p>

        {/* Стол */}
        <div className="relative mt-10 rounded-[50%/18%] border-4 border-[#3b2414] bg-[#2a170d] px-6 py-14 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)] md:px-14">
          <div className="absolute inset-4 rounded-[50%/18%] border border-paper/10 bg-[#ece4d4]/[0.04]" />
          <AnimatePresence mode="wait">
            {stage !== "served" ? (
              <motion.div key="empty" exit={{ opacity: 0 }} className="relative flex flex-col items-center gap-5 py-10 text-center">
                <p className="font-display text-2xl italic text-paper/40">Стол пуст.</p>
                <button
                  onClick={() => setStage("blink")}
                  className={`grid size-24 place-items-center rounded-full border-4 border-[#5a0d12] font-system text-xs uppercase text-paper transition ${
                    stage === "blink" ? "animate-pulse bg-[#c0333d] shadow-[0_0_40px_#c0333d]" : "bg-[#7a1a22] hover:bg-[#9a222c]"
                  }`}
                >
                  Время
                  <br />
                  обеда
                </button>
                {stage === "blink" && (
                  <StatusWindow className="max-w-md text-left">
                    Кнопка мигает красным, но ничего не происходит.
                    <br />
                    Дисплей: персонал отеля очень застенчив и работает, только когда на него не смотрят.
                    <button
                      onClick={() => {
                        setCount(10);
                        setStage("away");
                      }}
                      className="mt-3 block border border-system/60 px-3 py-1.5 text-system hover:bg-system hover:text-black"
                    >
                      [ Выйти на 10 секунд ]
                    </button>
                  </StatusWindow>
                )}
              </motion.div>
            ) : (
              <motion.ul
                key="served"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {DISHES.map((d) => (
                  <motion.li
                    key={d.title}
                    variants={{ hidden: { opacity: 0, y: 12, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } }}
                    className="rounded-full border border-paper/20 bg-[#f3ecdf]/[0.06] px-6 py-5 text-center"
                  >
                    <div className="font-display text-xl text-brass-soft">{d.name}</div>
                    <div className="mt-1 text-sm text-paper/80">
                      <Fog text={d.title} ch={d.chapters[0]} />
                    </div>
                    <div className="font-system text-[10px] text-paper/40">гл. {d.chapters[0]}–{d.chapters[1]}</div>
                    {d.text && (
                      <p className="mt-2 text-xs text-paper/60">
                        <Fog text={d.text} ch={d.chapters[1]} />
                      </p>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {stage === "served" && (
          <ul className="mt-10 space-y-2 text-paper/75">
            {hotel.dining.facts.map((f, i) => (
              <li key={i} className="border-l border-brass/30 pl-3"><Fog text={f.text} ch={f.ch} /></li>
            ))}
          </ul>
        )}
      </div>

      {/* «Вышли за дверь» */}
      <AnimatePresence>
        {stage === "away" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black"
          >
            <div className="text-center">
              <p className="font-display text-2xl italic text-paper/50">Вы стоите за дверью и не подглядываете…</p>
              <p className="mt-4 font-system text-6xl text-system">{count}</p>
              <p className="mt-2 font-system text-xs text-paper/30">за дверью звенит посуда</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
