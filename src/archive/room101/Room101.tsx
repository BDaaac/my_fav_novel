"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Album } from "./Album";
import { House } from "./House";
import { Broadcast } from "./Broadcast";
import { ITEMS_101, RUN1, RUN2, RUN3, nameOf } from "./data";
import { Ch, InfectionProvider, N, STAGE, useInfection } from "./infection";
import { cn } from "@/lib/utils";

const TOC = [
  { id: "overview", label: "Обзор" },
  { id: "run1", label: "Заход 1 · Странная семья" },
  { id: "run2", label: "Заход 2 · Странная семья Re" },
  { id: "run3", label: "Заход 3 · Медиа, меняющие реальность" },
  { id: "items", label: "Вынесенные предметы" },
  { id: "outcome", label: "Итог" },
];

export function Room101() {
  return (
    <InfectionProvider>
      <Page />
    </InfectionProvider>
  );
}

function Page() {
  const { level } = useInfection();
  const active = useActiveSection();
  return (
    <div className="min-h-screen bg-[#0d0b0a] text-[#e9e1d0]">
      {/* шапка архива */}
      <header className="border-b border-[#c9a227]/20 bg-[#0a0807]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 font-system text-[12px]">
          <span className="text-[#a89a80]">
            <Link href="/styles" className="hover:text-[#e7c76a]">
              Отель «Пионер»
            </Link>{" "}
            › Архив › 1-й этаж › <span className="text-[#e7c76a]">{level >= STAGE.critical ? "Д░м" : "101"}</span>
          </span>
          <span className="text-[#7fd4ff]">[Архив отеля · запись 101]</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[220px_1fr]">
        {/* содержание */}
        <nav className="hidden lg:block">
          <div className="sticky top-6 border border-[#c9a227]/25 bg-[#120f0d] p-4">
            <div className="font-system text-[11px] uppercase tracking-[0.2em] text-[#a89a80]">Содержание</div>
            <ol className="mt-3 space-y-2 text-[14px]">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className={cn("block leading-snug transition hover:text-[#e7c76a]", active === t.id ? "text-[#e7c76a]" : "text-[#cfc4b0]")}>
                    <span className="mr-1 font-system text-[11px] opacity-60">{i + 1}</span> {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <main className="min-w-0 space-y-16 pb-40">
          <section id="overview" className="scroll-mt-6">
            <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
              <div>
                <div className="font-system text-[12px] text-[#c0333d]">Комната Проклятий · 1-й этаж</div>
                <h1 className="mt-1 font-display text-5xl leading-tight text-[#efe6d2] md:text-6xl">
                  {level >= STAGE.critical ? "Наша дружная семья ♥" : "Номер 101"}
                </h1>
                <p className="mt-1 font-display text-2xl italic text-[#c9b48c]">
                  «Странная семья» → «Медиа, меняющие реальность»
                </p>
                <p className="mt-6 max-w-3xl font-display text-[19px] leading-relaxed text-[#ddd3bf]">
                  Первая комната, в которую вошла команда. Снаружи это обычная семейная жизнь, а на деле ментальное заражение: чем дольше общаешься с «семьёй», тем сильнее <N a="пропитываешься её безумием" b="любишь её" />.
                  <Ch n={7} /> Первый заход команда пережила только благодаря побегу Сынёпа. Вернувшись спустя 50 глав, она поняла: «семья» была лишь внешним слоем. Проклятие шло через телевизор, из исчезнувшей больницы «Новый Мир».
                  <Ch n="66–67" />
                </p>
                <div className="mt-6 flex flex-wrap gap-2 font-system text-[12px]">
                  {[RUN1, RUN2, RUN3].map((r, i) => (
                    <a key={r.id} href={`#run${i + 1}`} className="border border-[#c9a227]/30 px-2.5 py-1 text-[#e7c76a] hover:bg-[#c9a227]/10">
                      Заход {i + 1} · гл. {r.chapters[0]}–{r.chapters[1]} · {r.outcome.solved ? "решена" : "побег"}
                    </a>
                  ))}
                </div>
                <p className="mt-6 max-w-3xl font-system text-[12px] leading-relaxed text-[#8f846f]">
                  Страница заражена. Пока вы читаете, растёт шкала внизу справа, и интерфейс начинает считать безумие нормой. Лечит только побег. Esc возвращает обычный вид.
                </p>
              </div>
              <Infobox />
            </div>
          </section>

          <Section id="run1" n={1} title="Странная семья" ch="5–11" tone="text-[#e3c79a]">
            <Album />
            <Acts acts={RUN1.acts} />
            <p className="mt-4 font-display text-[16px] italic text-[#cfc4b0]">
              {RUN1.outcome.text}
              <Ch n={RUN1.outcome.ch ?? 10} />
            </p>
          </Section>

          <Section id="run2" n={2} title="Странная семья Re" ch="62–66" tone="text-[#9fb6ff]">
            <House />
          </Section>

          <Section id="run3" n={3} title="Медиа, меняющие реальность" ch="67–76" tone="text-[#9ff5c8]">
            <Broadcast />
          </Section>

          <Section id="items" n={4} title="Вынесенные предметы" ch="64–76" tone="text-[#e7c76a]">
            <div className="grid gap-3 md:grid-cols-2">
              {ITEMS_101.map((it) => (
                <div key={it.id} className="border border-[#c9a227]/20 bg-[#141110] p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-xl text-[#efe6d2]">{it.name}</span>
                    <span className="shrink-0 font-system text-[10px] text-[#8f846f]">гл. {it.ch}</span>
                  </div>
                  <div className="font-system text-[11px] text-[#a89a80]">{it.owner ? nameOf(it.owner).split(" (")[0] : "без владельца"}</div>
                  <p className="mt-2 font-display text-[15px] leading-snug text-[#cfc4b0]">{it.effect}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="outcome" n={5} title="Итог" ch="76" tone="text-[#e7c76a]">
            <p className="max-w-3xl font-display text-[19px] leading-relaxed text-[#ddd3bf]">
              {RUN3.outcome.text}
              <Ch n={RUN3.outcome.ch ?? 76} />
            </p>
            <div className="mt-6 inline-block -rotate-3 border-4 border-[#c0333d] px-5 py-2 font-system text-xl uppercase tracking-[0.3em] text-[#c0333d]">
              Решена · пусто
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Section({ id, n, title, ch, tone, children }: { id: string; n: number; title: string; ch: string; tone: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-5 flex items-baseline gap-3 border-b border-[#c9a227]/20 pb-2">
        <span className="font-system text-sm text-[#8f846f]">{n}</span>
        <h2 className={cn("font-display text-4xl", tone)}>{title}</h2>
        <span className="ml-auto font-system text-[11px] text-[#8f846f]">гл. {ch}</span>
      </div>
      {children}
    </section>
  );
}

function Acts({ acts }: { acts: { title: string; text: string; ch: number[] }[] }) {
  return (
    <ol className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">
      {acts.map((a, i) => (
        <li key={a.title}>
          <div className="font-display text-xl text-[#efe6d2]">
            <span className="mr-2 font-system text-xs text-[#8f846f]">{i + 1}</span>
            {a.title}
            <Ch n={a.ch[0] === a.ch[1] ? a.ch[0] : `${a.ch[0]}–${a.ch[1]}`} />
          </div>
          <p className="font-display text-[15px] leading-snug text-[#cfc4b0]">{a.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Карточка-врезка как в вики, с тумблером «Угроза / Итог». */
function Infobox() {
  const [mode, setMode] = useState<"threat" | "result">("threat");
  const rows: [string, React.ReactNode][] =
    mode === "threat"
      ? [
          ["Тип", "Комната Проклятий"],
          ["Мир", "Обычная семья → Корея, заражённая эфиром"],
          ["Угроза", <>Ментальное заражение; затем конец света через эфир, через 3 дня после исчезновения больницы<Ch n="7, 71" /></>],
          ["Злой бог", <>Главврач «Учитель»<Ch n={78} /></>],
          ["Носитель", "Ким Санмин, ком плоти"],
          ["Условие", <>Сбежать (10 минут вдали от семьи) или уничтожить Источник<Ch n="7, 66" /></>],
        ]
      : [
          ["Заходы", "3 (гл. 5–11, 62–66, 67–76)"],
          ["Попыток", "5"],
          ["Финальный Решатель", "Ча Джинчхоль"],
          ["Добыча", "Осколок Звезды Иномирья"],
          ["Потери", "Все погибшие воскресли: выжил Решатель"],
          ["Статус", <>Решена · пусто<Ch n={76} /></>],
        ];
  return (
    <aside className="h-fit border border-[#c9a227]/35 bg-[#141110]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1b1512]">
        <TvFamily />
      </div>
      <div className="grid grid-cols-2 border-y border-[#c9a227]/25 font-system text-[12px]">
        {(["threat", "result"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("py-2 transition", mode === m ? "bg-[#c9a227]/15 text-[#e7c76a]" : "text-[#8f846f] hover:text-[#cfc4b0]")}>
            {m === "threat" ? "Угроза" : "Итог"}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.dl key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-[#c9a227]/10 text-[14px]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[110px_1fr] gap-2 px-3 py-2">
              <dt className="font-system text-[11px] text-[#8f846f]">{k}</dt>
              <dd className="font-display leading-snug text-[#ddd3bf]">{v}</dd>
            </div>
          ))}
        </motion.dl>
      </AnimatePresence>
    </aside>
  );
}

/** Картинка врезки: семья на диване перед телевизором; на заражении у всех одинаковые улыбки, а экран краснеет. */
function TvFamily() {
  const { level } = useInfection();
  const warped = level >= STAGE.warp;
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full">
      <defs>
        <radialGradient id="tvglow" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor={warped ? "#ff5a5a" : "#7fa8ff"} stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="#16110e" />
      <rect width="320" height="240" fill="url(#tvglow)" />
      <rect x="120" y="40" width="80" height="60" rx="6" fill="#2b241f" />
      <rect x="128" y="47" width="64" height="46" rx="4" fill={warped ? "#c0333d" : "#7fa8ff"} opacity="0.9" />
      <text x="160" y="76" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#fff">
        {warped ? "☺ ☺ ☺" : "ABS"}
      </text>
      <rect x="40" y="170" width="240" height="40" rx="10" fill="#3a2c22" />
      {[80, 130, 190, 240].map((x, i) => (
        <g key={x} transform={`translate(${x} 178)`}>
          <circle cx="0" cy="-34" r={i === 2 ? 11 : 13} fill="#0b0807" />
          <path d="M-16 0 Q-16 -22 0 -22 Q16 -22 16 0 Z" fill="#0b0807" />
          {warped && <path d="M-6 -33 Q0 -27 6 -33" stroke="#f6e9d0" strokeWidth="2" fill="none" />}
        </g>
      ))}
    </svg>
  );
}

function useActiveSection() {
  const [active, setActive] = useState("overview");
  useEffect(() => {
    const els = TOC.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return active;
}
