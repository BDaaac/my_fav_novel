"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { Cultivator } from "@/data/gu/types";
import { VOLUMES } from "@/data/gu/types";
import { jadeOf, ROMAN, rankNo } from "./jade";

/**
 * Карточка героя: свиток на рисовой бумаге между двумя деревянными валиками.
 * Разворачивается сверху вниз; закладки — листы: сведения, апертура, черви Гу, деяния.
 * Над свитком — тома, в которых герой есть: каждый том — своя карточка.
 */
const SHEETS = [
  { id: "about", label: "Сведения" },
  { id: "aperture", label: "Апертура" },
  { id: "gu", label: "Черви Гу" },
  { id: "deeds", label: "Деяния" },
] as const;
type SheetId = (typeof SHEETS)[number]["id"];

const INK = "oklch(0.24 0.02 60)";
const CINNABAR = "oklch(0.5 0.17 28)";
const PAPER =
  "radial-gradient(ellipse at 15% 0%, oklch(1 0 0 / 0.35), transparent 55%), radial-gradient(ellipse at 90% 100%, oklch(0.8 0.04 75 / 0.35), transparent 60%), repeating-linear-gradient(90deg, oklch(0.6 0.03 80 / 0.04) 0 1px, transparent 1px 4px), linear-gradient(oklch(0.93 0.025 88), oklch(0.89 0.03 85))";

const FATE = { alive: "Жив", dead: "Погиб", unknown: "Неизвестно" } as const;

export function GuCard({ h, vol, src, vols, names, faces, onVol, onOpen, onClose }: { h: Cultivator; vol: number; src: string | null; vols: number[]; names: Record<string, string>; faces: Record<string, string | null>; onVol: (n: number) => void; onOpen: (id: string) => void; onClose: () => void }) {
  const [sheet, setSheet] = useState<SheetId>("about");
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      const i = SHEETS.findIndex((s) => s.id === sheet);
      if (e.key === "ArrowRight") setSheet(SHEETS[Math.min(SHEETS.length - 1, i + 1)].id);
      if (e.key === "ArrowLeft") setSheet(SHEETS[Math.max(0, i - 1)].id);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, sheet]);
  const jade = jadeOf(h.clan);
  const r = rankNo(h.rank);
  const count: Record<SheetId, number | null> = { about: null, aperture: null, gu: h.gu.length, deeds: h.moments.length || null };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[oklch(0.12_0.012_205/0.96)] p-4 md:p-8" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="relative my-auto w-[min(1060px,100%)]">
        {/* тома героя */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {VOLUMES.map(({ n }) => {
              const has = vols.includes(n);
              return (
                <button
                  key={n}
                  disabled={!has}
                  onClick={() => onVol(n)}
                  className={cn("rounded-[2px] px-2.5 py-1 font-book text-[11px] uppercase tracking-[0.2em] transition-colors", n === vol ? "bg-[oklch(0.72_0.1_80)] text-[oklch(0.18_0.02_60)]" : has ? "text-[oklch(0.85_0.04_85)] hover:bg-[oklch(0.72_0.1_80/0.2)]" : "text-[oklch(0.85_0.04_85/0.25)]")}
                >
                  Том {ROMAN[n]}
                </button>
              );
            })}
          </div>
          <button onClick={onClose} aria-label="Закрыть карточку" className="font-book text-[11px] uppercase tracking-[0.25em] text-[oklch(0.85_0.04_85/0.6)] hover:text-[oklch(0.9_0.04_85)]">
            свернуть свиток ✕
          </button>
        </div>

        {/* верхний валик */}
        <Roller />
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-[10px] grid min-h-[min(600px,78vh)] shadow-[0_30px_70px_oklch(0.05_0.01_200/0.8)] md:grid-cols-[clamp(170px,28%,290px)_1fr]"
          style={{ backgroundImage: PAPER, color: INK }}
        >
          {/* левая колонка: окно с портретом, имя, ранг печатью */}
          <aside className="relative border-b border-[oklch(0.24_0.02_60/0.2)] p-6 md:border-b-0 md:border-r">
            <div className="text-[10px] uppercase tracking-[0.35em] opacity-60">{h.clan}</div>
            <div className="relative mx-auto mt-5 aspect-[4/5] w-[80%] overflow-hidden" style={{ borderRadius: "50% 50% 46% 46% / 40% 40% 36% 36%", boxShadow: `inset 0 0 0 3px ${jade.line}, 0 6px 16px oklch(0.3 0.03 60 / 0.35)`, background: `radial-gradient(ellipse at 50% 30%, ${jade.hi}, ${jade.base} 60%, ${jade.deep})` }}>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={h.name} className="h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-brush text-[84px] leading-none" style={{ color: jade.ink, textShadow: `0 1px 0 ${jade.hi}` }}>
                  {jade.glyph}
                </span>
              )}
            </div>
            <h2 className="mt-5 font-kurale text-[34px] leading-none">{h.name}</h2>
            {h.standing && <div className="mt-2 font-book text-[14px] italic leading-snug opacity-75">{h.standing}</div>}

            <div className="mt-6 flex items-center gap-4">
              {/* печать ранга */}
              <div className="flex h-[74px] w-[74px] shrink-0 rotate-[-6deg] flex-col items-center justify-center rounded-[4px] border-[3px] text-center" style={{ borderColor: CINNABAR, color: CINNABAR }}>
                <div className="text-[8px] uppercase tracking-[0.25em]">ранг</div>
                <div className="font-kurale text-[34px] leading-none">{r ? ROMAN[r] : "—"}</div>
              </div>
              <div className="text-[13px] leading-snug">{h.rank || "Ранг в томе не назван."}</div>
            </div>
            {h.draft && <p className="mt-6 font-book text-[13px] italic leading-snug" style={{ color: CINNABAR }}>Черновик. Сведения сверяются с полным текстом тома.</p>}
          </aside>

          <section className="relative px-6 pb-8 pt-5 md:px-9">
            {/* закладки */}
            <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b-2 pb-2" style={{ borderColor: INK }}>
              {SHEETS.map((s) => (
                <button key={s.id} onClick={() => setSheet(s.id)} className={cn("relative font-book text-[12px] uppercase tracking-[0.2em] transition-opacity", sheet === s.id ? "opacity-100" : "opacity-50 hover:opacity-80")}>
                  {s.label}
                  {count[s.id] !== null && <span className="ml-1.5 opacity-60">{count[s.id]}</span>}
                  {sheet === s.id && <motion.span layoutId="gu-tab" className="absolute -bottom-[10px] left-0 right-0 h-[3px]" style={{ background: CINNABAR }} />}
                </button>
              ))}
            </nav>

            <motion.div key={sheet} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              {sheet === "about" && (
                <div className={cn("mt-6", h.links.length > 0 && "grid gap-x-9 gap-y-8 lg:grid-cols-[1fr_220px]")}>
                  <div>
                    {h.registry.length > 0 && (
                      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                        {h.registry.map((x) => (
                          <div key={x.label} className={cn(x.value.length > 28 && "sm:col-span-2")}>
                            <dt className="text-[9px] uppercase tracking-[0.3em] opacity-55">{x.label}</dt>
                            <dd className="mt-0.5 font-book text-[16px] leading-snug">{x.value}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <div className="mt-7 max-w-[66ch] space-y-3.5">
                      {h.about.map((p, i) => (
                        <p key={i} className={cn("font-book text-[17px] leading-[1.6]", i === 0 && "first-letter:float-left first-letter:mr-1first-letter:font-kurale first-letter:text-[52px] first-letter:leading-[0.85] first-letter:text-[oklch(0.5_0.17_28)]")}>
                          {p.text}
                        </p>
                      ))}
                      {!h.about.length && <Empty text="Сведений пока нет." />}
                    </div>
                  </div>
                  {h.links.length > 0 && (
                    <div className="space-y-5 lg:border-l lg:pl-5" style={{ borderColor: "oklch(0.5 0.17 28 / 0.35)" }}>
                      <div className="text-[9px] uppercase tracking-[0.3em] opacity-55">Связи</div>
                      {h.links.map((l, i) => (
                        <button key={l.to + i} onClick={() => onOpen(l.to)} className="group grid w-full grid-cols-[44px_1fr] items-start gap-3 text-left">
                          <span className="relative block h-[54px] w-[44px] overflow-hidden" style={{ borderRadius: "50% 50% 44% 44% / 40% 40% 34% 34%", background: `radial-gradient(ellipse at 50% 30%, ${jadeOf("").hi}, oklch(0.5 0.03 80))` }}>
                            {faces[l.to] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={faces[l.to]!} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center font-kurale text-[22px] text-[oklch(0.95_0.02_85)]">{(names[l.to] ?? l.to)[0]}</span>
                            )}
                          </span>
                          <span>
                            <span className="block text-[9px] uppercase tracking-[0.22em] opacity-60">{l.bond}</span>
                            <span className="block font-kurale text-[19px] leading-tight underline decoration-1 underline-offset-4 transition-colors group-hover:decoration-2" style={{ color: CINNABAR, textDecorationColor: "oklch(0.5 0.17 28 / 0.4)" }}>
                              {names[l.to] ?? l.to}
                            </span>
                            <span className="mt-1 block font-book text-[14px] leading-snug opacity-85">{l.text}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {sheet === "aperture" && (
                <div className="mt-7 grid gap-10 lg:grid-cols-[230px_1fr]">
                  {/* апертура: кольцо с уровнем эссенции */}
                  <div className="text-center">
                    <div className="relative mx-auto h-[190px] w-[190px]">
                      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="oklch(0.24 0.02 60 / 0.15)" strokeWidth="5" />
                        <circle cx="50" cy="50" r="44" fill="none" stroke={jade.base} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(lastPct(h.talent) / 100) * 276.5} 276.5`} />
                        <circle cx="50" cy="50" r="36" fill={`url(#ap-${h.id})`} />
                        <defs>
                          <radialGradient id={`ap-${h.id}`}>
                            <stop offset="0" stopColor={jade.hi} />
                            <stop offset="1" stopColor={jade.deep} />
                          </radialGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-[9px] uppercase tracking-[0.3em]" style={{ color: jade.ink }}>талант</div>
                        <div className="font-kurale text-[36px] leading-none" style={{ color: jade.ink }}>{grade(h.talent)}</div>
                      </div>
                    </div>
                    {h.talent && <div className="mt-2 font-book text-[14px] leading-snug">{h.talent}</div>}
                    <div className="mt-3 text-[9px] uppercase tracking-[0.3em] opacity-55">первобытная эссенция</div>
                    <div className="mt-1 font-book text-[15px]">{h.essence || "не названа"}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.3em] opacity-55">Путь культивации в томе</div>
                    {h.path.length ? (
                      <ol className="relative mt-4 space-y-5 pl-7">
                        <span className="absolute bottom-2 left-[7px] top-2 w-px" style={{ background: "oklch(0.24 0.02 60 / 0.3)" }} />
                        {h.path.map((p, i) => (
                          <li key={i} className="relative">
                            <span className="absolute -left-7 top-1.5 h-[15px] w-[15px] rotate-45 border-2" style={{ borderColor: CINNABAR, background: i === h.path.length - 1 ? CINNABAR : "transparent" }} />
                            <div className="font-kurale text-[21px] leading-tight">{p.stage}</div>
                            <p className="mt-0.5 max-w-[60ch] font-book text-[15.5px] leading-[1.5] opacity-85">{p.text}</p>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div className="mt-4">
                        <Empty text="Путь культивации не описан." />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sheet === "gu" && (
                <div className="mt-6">
                  {h.gu.length > 0 ? (
                    <ol className="grid gap-x-8 sm:grid-cols-2">
                      {h.gu.map((g, i) => (
                        <li key={g.name + i} className="grid grid-cols-[46px_1fr] gap-3 border-b border-dotted py-4" style={{ borderColor: "oklch(0.24 0.02 60 / 0.3)" }}>
                          {/* бронзовая бирка ранга червя */}
                          <span className="flex h-[46px] w-[46px] flex-col items-center justify-center rounded-full text-center" style={{ background: "radial-gradient(circle at 35% 30%, oklch(0.8 0.1 80), oklch(0.55 0.09 65))", boxShadow: "inset 0 0 0 2px oklch(0.45 0.07 60), 0 2px 5px oklch(0.3 0.03 60 / 0.4)" }}>
                            <span className="text-[7px] uppercase tracking-[0.15em] text-[oklch(0.25_0.04_60)]">ранг</span>
                            <span className="font-kurale text-[17px] leading-none text-[oklch(0.22_0.04_60)]">{rankNo(g.rank ?? "") ? ROMAN[rankNo(g.rank ?? "")] : "—"}</span>
                          </span>
                          <div>
                            <h3 className="font-kurale text-[21px] leading-tight">{g.name}</h3>
                            <p className="mt-1 font-book text-[15px] leading-[1.5]">{g.text}</p>
                            {g.fate && (
                              <p className="mt-1.5 font-book text-[13.5px] italic leading-snug" style={{ color: CINNABAR }}>
                                {g.fate}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <Empty text="Червей Гу за героем в этом томе не числится." />
                  )}
                </div>
              )}

              {sheet === "deeds" && (
                <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_250px]">
                  <ol className="space-y-5">
                    {h.moments.map((m, i) => (
                      <li key={m.title + i} className="grid grid-cols-[36px_1fr] gap-3">
                        <span className="font-kurale text-[30px] leading-none" style={{ color: CINNABAR }}>
                          {i + 1}
                        </span>
                        <div>
                          <h3 className="font-kurale text-[22px] leading-tight">{m.title}</h3>
                          <p className="mt-1 max-w-[62ch] font-book text-[15.5px] leading-[1.55]">{m.text}</p>
                        </div>
                      </li>
                    ))}
                    {!h.moments.length && <Empty text="Деяния не внесены." />}
                  </ol>
                  <div className="space-y-7">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.3em] opacity-55">К концу тома</div>
                      <div className="mt-2 inline-block rotate-[-4deg] border-[3px] border-double px-3 py-1 font-kurale text-[24px] leading-none" style={{ borderColor: h.fate.status === "dead" ? INK : CINNABAR, color: h.fate.status === "dead" ? INK : CINNABAR }}>
                        {FATE[h.fate.status]}
                      </div>
                      <p className="mt-3 font-book text-[15px] leading-[1.5]">{h.fate.text}</p>
                    </div>
                    {h.quotes.map((q, i) => (
                      <blockquote key={i} className="relative pl-6 font-book text-[16px] italic leading-[1.5]">
                        <span className="absolute -top-2 left-0 font-kurale text-[40px] not-italic leading-none" style={{ color: CINNABAR }}>
                          «
                        </span>
                        {q.text}
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </section>
        </motion.div>
        {/* нижний валик */}
        <Roller />
      </div>
    </div>
  );
}

/** Валик свитка: тёмное дерево с бронзовыми наконечниками. */
function Roller() {
  return (
    <div className="relative h-[18px] rounded-full shadow-[0_6px_12px_oklch(0.05_0.01_200/0.7)]" style={{ background: "linear-gradient(oklch(0.42 0.05 45), oklch(0.26 0.04 40) 55%, oklch(0.18 0.03 40))" }}>
      <span className="absolute -left-1 top-1/2 h-[24px] w-[14px] -translate-y-1/2 rounded-[4px]" style={{ background: "linear-gradient(oklch(0.82 0.1 82), oklch(0.55 0.09 65))" }} />
      <span className="absolute -right-1 top-1/2 h-[24px] w-[14px] -translate-y-1/2 rounded-[4px]" style={{ background: "linear-gradient(oklch(0.82 0.1 82), oklch(0.55 0.09 65))" }} />
    </div>
  );
}

/** Доля апертуры, занятая первобытным морем: последнее число с % в строке таланта (к концу тома). */
function lastPct(s?: string) {
  const all = [...(s ?? "").matchAll(/(\d{1,3})\s*%/g)];
  return all.length ? Math.min(100, +all[all.length - 1][1]) : 0;
}
/** Буква класса таланта к концу тома: последняя «класс X». */
function grade(s?: string) {
  const all = [...(s ?? "").matchAll(/класс[а-я]*\s+([A-DА-Г])\b/gi)];
  return all.length ? all[all.length - 1][1].toUpperCase() : "—";
}

function Empty({ text }: { text: string }) {
  return <p className="font-book text-[17px] italic opacity-55">{text}</p>;
}
