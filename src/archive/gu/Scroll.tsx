"use client";
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import type { Cultivator } from "@/data/gu/types";
import { VOLUMES } from "@/data/gu/types";
import { GuCard } from "./GuCard";
import { Holo } from "../Holo";
import { jadeOf, NUM_HAN, ROMAN, rankNo } from "./jade";

/**
 * Свиток героев «Преподобного Гу». Каждый герой — нефритовый жетон на красном шнуре:
 * висит на бамбуковой жерди, качается сам, его можно схватить и качнуть; клик открывает карточку.
 * Над свитком — пять бамбуковых планок томов: у каждого тома свой состав героев.
 */
type Vol = number;
const ROWS = [
  { role: "main", label: "Главные" },
  { role: "major", label: "Важные" },
  { role: "minor", label: "Второстепенные" },
] as const;

export function Scroll({ vols, art }: { vols: Record<Vol, Record<string, Cultivator>>; art: Record<Vol, string[]> }) {
  const ready = VOLUMES.map((v) => v.n).filter((n) => Object.keys(vols[n] ?? {}).length > 0);
  const [vol, setVol] = useState<Vol>(ready[0] ?? 1);
  const [open, setOpen] = useState<string | null>(null);
  const heroes = Object.values(vols[vol] ?? {}).sort((a, b) => a.order - b.order);
  // портрет тома; если его нет — ближайший из прошлых томов
  const face = (id: string) => {
    for (let n = vol; n >= 1; n--) if (art[n]?.includes(`${id}.jpg`)) return `/art/gu/v${n}/${id}.jpg`;
    return null;
  };
  const names = Object.fromEntries(heroes.map((h) => [h.id, h.name]));
  const faces = Object.fromEntries(heroes.map((h) => [h.id, face(h.id)]));
  const V = VOLUMES.find((v) => v.n === vol)!;

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-[oklch(0.13_0.012_205)] pb-32 font-book text-[oklch(0.9_0.02_95)]">
      <Backdrop />

      <header className="relative mx-auto max-w-6xl px-6 pt-14 text-center">
        <Plaque />
        <div className="mx-auto mt-10 flex w-fit flex-wrap items-end justify-center gap-x-14 gap-y-8">
          <Slips vol={vol} ready={ready} onVol={(n) => (setOpen(null), setVol(n))} />
          <div className="max-w-[300px] text-left">
            <div className="text-[10px] uppercase tracking-[0.4em] text-[oklch(0.78_0.09_80)]">Том {ROMAN[vol]}</div>
            <div className="mt-1 font-kurale text-[26px] leading-[1.1]">{V.title}</div>
            <div className="mt-2 text-[12px] tracking-[0.12em] opacity-55">
              {heroes.length} {heroes.length % 10 === 1 && heroes.length % 100 !== 11 ? "герой" : [2, 3, 4].includes(heroes.length % 10) && ![12, 13, 14].includes(heroes.length % 100) ? "героя" : "героев"} в свитке
            </div>
          </div>
        </div>
      </header>

      {!heroes.length && <p className="mx-auto mt-20 max-w-md text-center font-kurale text-[22px] opacity-60">Свиток этого тома ещё пишется.</p>}

      {ROWS.map(({ role, label }) => {
        const row = heroes.filter((h) => h.role === role);
        if (!row.length) return null;
        // длинный ряд делится на жерди по шесть жетонов
        const poles = Array.from({ length: Math.ceil(row.length / 6) }, (_, i) => row.slice(i * 6, i * 6 + 6));
        return (
          <section key={role} className="relative mx-auto mt-16 max-w-6xl px-6">
            <div className="mb-1 flex items-center gap-4 text-[10px] uppercase tracking-[0.45em] text-[oklch(0.78_0.09_80)]">
              <span>{label}</span>
              <span className="h-px flex-1 bg-[oklch(0.78_0.09_80/0.25)]" />
            </div>
            {poles.map((pole, p) => (
              <div key={p} className={p ? "mt-14" : ""}>
                <Bamboo />
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-10 lg:gap-x-6">
                  {pole.map((h, i) => (
                    <Token key={h.id + vol} h={h} src={face(h.id)} i={p * 6 + i} paused={!!open} onOpen={() => setOpen(h.id)} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      {open && vols[vol]?.[open] && (
        <GuCard
          key={open + vol}
          h={vols[vol][open]}
          src={face(open)}
          names={names}
          faces={faces}
          onOpen={(id) => vols[vol]?.[id] && setOpen(id)}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  );
}

/**
 * Ночь на горе Цин Мао: картина стоит на месте, пока свиток прокручивается.
 * Середина притемнена, чтобы жетоны читались; по низу ползёт туман.
 */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-cover bg-[center_35%]" style={{ backgroundImage: "url(/art/gu/bg.jpg)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 75% at 50% 55%, oklch(0.12 0.012 205 / 0.72), oklch(0.12 0.012 205 / 0.25) 70%, transparent), linear-gradient(oklch(0.12 0.012 205 / 0.15), oklch(0.12 0.012 205 / 0.45))" }} />
      <div className="gu-mist absolute inset-x-[-20%] bottom-0 h-[45%]" />
    </div>
  );
}

/** Лакированная доска с названием, как над воротами горной деревни. */
function Plaque() {
  return (
    <div className="relative mx-auto w-fit">
      {/* шнуры, на которых висит доска */}
      <span className="absolute -top-14 left-[22%] h-14 w-px bg-[oklch(0.55_0.16_28)]" />
      <span className="absolute -top-14 right-[22%] h-14 w-px bg-[oklch(0.55_0.16_28)]" />
      <div
        className="relative rounded-[4px] px-7 pb-4 pt-3.5 md:px-12 shadow-[0_18px_40px_oklch(0.08_0.01_200/0.8)]"
        style={{
          background: "linear-gradient(oklch(0.2 0.02 40), oklch(0.13 0.015 40))",
          boxShadow: "inset 0 0 0 2px oklch(0.72 0.1 80 / 0.85), inset 0 0 0 6px oklch(0.15 0.015 40), inset 0 0 0 7px oklch(0.72 0.1 80 / 0.35), 0 18px 40px oklch(0.08 0.01 200 / 0.8)",
        }}
      >
        <div className="text-[10px] uppercase tracking-[0.55em] text-[oklch(0.78_0.09_80/0.7)]">Свиток героев</div>
        <h1 className="mt-1 font-kurale text-[36px] leading-none text-[oklch(0.84_0.1_82)] [text-shadow:0_1px_0_oklch(0.1_0.01_40)] md:text-[56px]">Преподобный Гу</h1>
        <div className="mt-2 text-[10px] uppercase tracking-[0.45em] text-[oklch(0.78_0.09_80/0.7)]">мастера Гу по томам</div>
        {/* киноварная печать в углу */}
        <span className="absolute -bottom-4 -right-2 flex h-12 w-12 md:-right-5 rotate-[8deg] items-center justify-center rounded-[3px] bg-[oklch(0.52_0.17_28)] font-brush text-[22px] leading-none text-[oklch(0.95_0.02_80)] shadow-[0_3px_8px_oklch(0.1_0.01_30/0.5)]">
          蛊
        </span>
      </div>
    </div>
  );
}

/** Бамбуковые планки томов: пустой том ещё не открыт. */
function Slips({ vol, ready, onVol }: { vol: Vol; ready: Vol[]; onVol: (n: Vol) => void }) {
  return (
    <div role="group" aria-label="Том" className="flex items-start gap-2">
      {VOLUMES.map(({ n }) => {
        const on = ready.includes(n);
        const cur = n === vol;
        return (
          <button
            key={n}
            disabled={!on}
            onClick={() => onVol(n)}
            aria-pressed={cur}
            aria-label={`Том ${ROMAN[n]}`}
            className="group relative flex h-[118px] w-[34px] flex-col items-center justify-between rounded-[3px] pb-2 pt-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] enabled:hover:-translate-y-1 disabled:cursor-not-allowed"
            style={{
              transform: cur ? "translateY(10px)" : undefined,
              opacity: on ? 1 : 0.3,
              background: cur
                ? "linear-gradient(90deg, oklch(0.62 0.08 110), oklch(0.74 0.09 105) 45%, oklch(0.58 0.08 110))"
                : "linear-gradient(90deg, oklch(0.42 0.05 110), oklch(0.52 0.06 105) 45%, oklch(0.4 0.05 110))",
              boxShadow: "inset 0 -2px 0 oklch(0.3 0.04 110), 0 6px 12px oklch(0.08 0.01 200 / 0.6)",
            }}
          >
            {/* узел бамбука */}
            <span className="absolute inset-x-0 top-[62%] h-[2px] bg-[oklch(0.3_0.04_110/0.6)]" />
            <span className={`font-brush text-[24px] leading-none ${cur ? "text-[oklch(0.25_0.04_40)]" : "text-[oklch(0.22_0.03_110)]"}`}>{NUM_HAN[n]}</span>
            <span className="text-[9px] tracking-[0.1em] text-[oklch(0.2_0.03_110)]">{ROMAN[n]}</span>
            {cur && <span className="absolute -bottom-3 h-2 w-2 rounded-full bg-[oklch(0.55_0.17_28)]" />}
          </button>
        );
      })}
    </div>
  );
}

/** Бамбуковая жердь, на которой висят жетоны. */
function Bamboo() {
  return (
    <div
      className="relative h-3.5 rounded-full shadow-[0_6px_14px_oklch(0.08_0.01_200/0.7)]"
      style={{
        background:
          "repeating-linear-gradient(90deg, transparent 0 170px, oklch(0.32 0.05 110) 170px 173px), linear-gradient(oklch(0.62 0.08 115), oklch(0.42 0.06 115) 60%, oklch(0.32 0.05 115))",
      }}
    />
  );
}

/** Нефритовый жетон на шнуре: маятник. Тянешь — раскачивается от скорости руки, отпускаешь — возвращается. */
function Token({ h, src, i, paused, onOpen }: { h: Cultivator; src: string | null; i: number; paused: boolean; onOpen: () => void }) {
  const x = useMotionValue(0);
  const v = useVelocity(x);
  const swing = useSpring(useTransform(v, [-1500, 1500], [28, -28]), { stiffness: 60, damping: 5, mass: 1.2 });
  const kick = useMotionValue(0);
  const rotate = useTransform([swing, kick], ([a, b]: number[]) => a + b);
  const [dragged, setDragged] = useState(false);
  useEffect(() => {
    if (!paused) return;
    kick.stop();
    kick.set(0);
  }, [paused, kick]);
  const jade = jadeOf(h.clan);
  const r = rankNo(h.rank);

  return (
    <motion.div
      className="relative shrink-0 grow-0 origin-top cursor-grab touch-none select-none will-change-transform active:cursor-grabbing"
      // один размер для всех жетонов: на телефоне два в ряд, иначе 160px
      style={{ x, rotate, width: "min(160px, calc(50% - 10px))", flexBasis: "min(160px, calc(50% - 10px))" }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.35}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setDragged(true)}
      onDragEnd={() => setTimeout(() => setDragged(false), 250)}
      onHoverStart={() => !dragged && !paused && animate(kick, [0, 7, -5, 3, 0], { duration: 1.4, ease: "easeOut" })}
      onTap={() => !dragged && onOpen()}
      role="button"
      tabIndex={0}
      aria-label={`Карточка: ${h.name}`}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="sway relative pt-9" style={{ "--sway": `${1.2 + (i % 3) * 0.5}deg`, "--sway-d": `${2.6 + (i % 4) * 0.45}s`, animationDelay: `${-i * 0.7}s`, animationPlayState: paused ? "paused" : "running" } as React.CSSProperties}>
        {/* красный шнур и узел */}
        <span className="absolute left-1/2 top-0 h-[46px] w-[2px] -translate-x-1/2 bg-[oklch(0.5_0.17_28)]" />
        <svg aria-hidden viewBox="0 0 24 18" className="absolute left-1/2 top-6 z-10 h-[18px] w-6 -translate-x-1/2">
          <path d="M12 2 C4 2 4 10 12 9 C20 10 20 2 12 2Z M12 9 C6 9 6 16 12 16 C18 16 18 9 12 9Z" fill="oklch(0.52 0.17 28)" stroke="oklch(0.38 0.13 28)" strokeWidth="1" />
        </svg>

        {/* сам жетон: арка сверху, вырезанная рамка, отверстие под шнур */}
        <Holo
          foil="pearl"
          className="relative overflow-hidden px-3 pb-3 pt-5 text-center"
          style={{
            borderRadius: "48% 48% 12px 12px / 20% 20% 12px 12px",
            background: `radial-gradient(ellipse 70% 40% at 35% 18%, ${jade.hi}, transparent 70%), radial-gradient(ellipse 60% 50% at 70% 80%, ${jade.lo}, transparent 70%), linear-gradient(160deg, ${jade.base}, ${jade.deep})`,
            boxShadow: `inset 0 0 0 1px ${jade.hi}, inset 0 0 0 5px transparent, inset 0 0 0 6px ${jade.line}, inset 0 -10px 24px ${jade.deep}, 0 14px 22px oklch(0.06 0.01 200 / 0.75)`,
          }}
        >
          {/* отверстие */}
          <span className="absolute left-1/2 top-2 h-3 w-3 -translate-x-1/2 rounded-full bg-[oklch(0.14_0.012_205)] shadow-[inset_0_1px_2px_black]" />
          {/* окно: портрет или иероглиф клана в тумане */}
          <div className="relative mx-auto mt-1.5 aspect-[4/5] w-[84%] overflow-hidden" style={{ borderRadius: "50% 50% 46% 46% / 40% 40% 36% 36%", boxShadow: `inset 0 0 0 2px ${jade.line}, inset 0 4px 12px oklch(0.1 0.01 200 / 0.6)`, background: `radial-gradient(ellipse at 50% 30%, ${jade.hi}, ${jade.deep})` }}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={h.name} draggable={false} className="pointer-events-none h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-brush text-[50px] leading-none" style={{ color: jade.ink, textShadow: `0 1px 0 ${jade.hi}, 0 -1px 0 ${jade.deep}` }}>
                {jade.glyph}
              </span>
            )}
          </div>
          {/* имя всегда в двухстрочной ячейке, клан в одну строку — жетоны одной высоты */}
          <div className="mt-2 flex h-[42px] items-center justify-center font-kurale leading-[1.05]" style={{ color: jade.ink, textShadow: `0 1px 0 ${jade.hi}`, fontSize: h.name.length > 17 ? 15.5 : 19 }}>
            <span className="line-clamp-2">{h.name}</span>
          </div>
          <div className="mt-0.5 truncate text-[10px] leading-tight tracking-[0.06em]" title={h.clan} style={{ color: jade.ink, opacity: 0.75 }}>
            {h.clan}
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="h-px w-4" style={{ background: jade.line }} />
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: jade.ink }}>
              {r ? `ранг ${ROMAN[r]}` : "ранг —"}
            </span>
            <span className="h-px w-4" style={{ background: jade.line }} />
          </div>
          {/* блик полировки */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_38%,oklch(1_0_0/0.13)_48%,transparent_58%)]" />
        </Holo>

        {/* кисть под жетоном */}
        <svg aria-hidden viewBox="0 0 20 46" className="mx-auto -mt-0.5 block h-[46px] w-5">
          <rect x="9" y="0" width="2" height="8" fill="oklch(0.5 0.17 28)" />
          <rect x="6" y="7" width="8" height="5" rx="1.5" fill="oklch(0.72 0.1 80)" />
          <path d="M6 12 L4 44 L16 44 L14 12Z" fill="oklch(0.5 0.17 28)" />
          <path d="M7 12 L6 44 M10 12 L10 44 M13 12 L14 44" stroke="oklch(0.4 0.14 28)" strokeWidth="0.8" />
        </svg>
      </div>
    </motion.div>
  );
}
