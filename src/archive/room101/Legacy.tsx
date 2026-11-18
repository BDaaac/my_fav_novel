"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { LEGACY_101, nameOf } from "./data";
import { Ch } from "./infection";
import { Mad } from "./mad";
import { Shard } from "./Ward";
import { cn } from "@/lib/utils";

/** Время Выбора (гл. 77): претендентов на Наследие несколько, а оно одно. */
const CANDIDATES: { id: string; out?: string }[] = [
  { id: "cha-jinchul" },
  { id: "elena-ivanova" },
  { id: "kim-mukseon" },
  { id: "han-gain", out: "умер в больнице от ран" },
  { id: "kim-ari", out: "не внесла вклад в финальный бой" },
  { id: "lee-eunsol", out: "не дожила до конца" },
  { id: "park-seungyeop", out: "не дожил до конца" },
  { id: "yu-sonyi", out: "не дожила до конца" },
];

export function Legacy() {
  return (
    <section className="relative overflow-hidden bg-[#0b0a09] text-[#e9e1d0]">
      <div className="pointer-events-none absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-[#9ff5e8]/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-6 py-28 text-center">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#7fd4ff]">[ВРЕМЯ ВЫБОРА · ГЛ. 77]</div>
        <div className="mx-auto mt-10 flex justify-center">
          <Shard size={1.1} />
        </div>
        <h2 className="mt-8 font-display text-5xl text-[#efe6d2] md:text-6xl">{LEGACY_101.name}</h2>
        <div className="mt-1 font-system text-[12px] text-[#a89a80]">Наследие 101-го номера · гл. {LEGACY_101.ch}</div>
        <Mad className="mx-auto mt-6 max-w-2xl font-display text-[20px] leading-relaxed text-[#ddd3bf]" text={LEGACY_101.effect} />
        <p className="mx-auto mt-6 max-w-2xl font-display text-[17px] leading-relaxed text-[#a89a80]">
          Из комнаты нельзя вынести ничего, кроме Наследия. Право на него даёт два условия: выжить до самого конца и внести вклад в финальное сражение.
          <Ch n={77} />
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CANDIDATES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "border px-3 py-4",
                c.id === "cha-jinchul" ? "border-[#9ff5e8] bg-[#9ff5e8]/10 shadow-[0_0_30px_-8px_#9ff5e8]" : c.out ? "border-[#3a332d] opacity-45" : "border-[#c9a227]/40",
              )}
            >
              <div className={cn("font-display text-lg", c.out && "line-through")}>{nameOf(c.id).split(" (")[0]}</div>
              <div className="mt-1 font-system text-[10px] text-[#a89a80]">{c.id === "cha-jinchul" ? "получил по общему согласию" : c.out ?? "претендент"}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ scale: 2.4, opacity: 0, rotate: -20 }}
          whileInView={{ scale: 1, opacity: 1, rotate: -6 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto mt-20 inline-block border-4 border-[#c0333d] px-6 py-2 font-system text-2xl uppercase tracking-[0.35em] text-[#c0333d]"
        >
          Решена · пусто
        </motion.div>
        <div className="mt-12">
          <Link href="/styles/noir" className="font-system text-[12px] text-[#7fd4ff] underline-offset-4 hover:underline">
            ← выйти в коридор
          </Link>
        </div>
      </div>
    </section>
  );
}
