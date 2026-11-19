"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Карточка гостя: регистрационная карта отеля «Пионер» на плотной бумаге.
 * Четыре листа с ярлычками, как в картотеке: сведения, благословение, наследия, предметы.
 * Тексты приходят из src/data/guests/<id>.json; пока файла нет, показывается черновик из старых данных.
 */
type Para = { text: string; ch: number[] };
export type Guest = {
  id: string;
  name: string;
  registry: { label: string; value: string; ch?: number }[];
  about: Para[];
  blessing: { name: string; patron?: string; text: Para[]; limits: Para[] };
  legacies: { name: string; room?: string; ch: number[]; text: string }[];
  items: { name: string; source?: string; ch: number[]; text: string }[];
  unknown?: string[];
  draft?: boolean;
  /** оборот: штампы номеров и отметки о смертях */
  back?: { rooms: { room: string; title?: string; result: string; role?: string; note?: string }[]; deaths: { room: string; cause: string }[] };
  /** пометки на полях о других гостях */
  links?: { to: string; text: string }[];
  /** что отель засчитал лично гостю */
  merits?: { title: string; room?: string; text: string }[];
};

const STAMP: Record<string, string> = { Побег: "#1f4a7a", Решение: "#8f1d22", Провал: "#3b362e" };
const tilt = (i: number) => ((i * 37) % 11) - 5;

const SHEETS = [
  { id: "about", label: "Сведения" },
  { id: "blessing", label: "Благословение" },
  { id: "legacies", label: "Наследия" },
  { id: "items", label: "Предметы" },
] as const;
type SheetId = (typeof SHEETS)[number]["id"];

const INK = "#2a2218";
const PAPER =
  "radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.35), transparent 55%), repeating-linear-gradient(0deg, rgba(90,70,40,0.035) 0 1px, transparent 1px 3px), linear-gradient(#ebe1c9, #e2d6ba)";

export function GuestCard({ g, src, color, ink, word, no, names, onOpen, onClose }: { g: Guest; src: string | null; color: string; ink: string; word: string; no: number; names: Record<string, string>; onOpen: (id: string) => void; onClose: () => void }) {
  const [sheet, setSheet] = useState<SheetId>("about");
  const [back, setBack] = useState(false);
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

  const count: Record<SheetId, number | null> = { about: null, blessing: null, legacies: g.legacies.length, items: g.items.length };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0b0908] p-4 [background-image:radial-gradient(ellipse_at_50%_20%,rgba(255,214,140,0.12),transparent_60%)] md:p-8" onClick={onClose}>
      <motion.div initial={{ y: 26, rotate: -2.2 }} animate={{ y: 0, rotate: -0.7 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()} className="relative my-auto w-[min(1060px,100%)]">
        {/* ярлычки листов торчат над картой, как разделители в картотеке */}
        <div className="relative z-0 ml-[clamp(150px,27%,300px)] flex gap-1 pl-3">
          {SHEETS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSheet(s.id);
                setBack(false);
              }}
              className={cn(
                "rounded-t-[6px] border border-b-0 px-4 pb-1.5 pt-2 font-system text-[11px] uppercase tracking-[0.16em] transition-[transform,background-color] duration-200",
                sheet === s.id && !back ? "translate-y-px border-[#b9a983] bg-[#ebe1c9] text-[#2a2218]" : "translate-y-[5px] border-[#8a7b5a] bg-[#cfc19d] text-[#2a2218]/70 hover:translate-y-[2px]",
              )}
            >
              {s.label}
              {count[s.id] !== null && <span className="ml-1.5 opacity-60">{count[s.id]}</span>}
            </button>
          ))}
        </div>

        {/* сама карта: две стороны, переворачивается вокруг вертикальной оси */}
        <div className="relative z-10 [perspective:2400px]">
        <motion.div initial={false} animate={{ rotateY: back ? 180 : 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative [transform-style:preserve-3d]">
        <div className={cn("relative grid min-h-[min(620px,82vh)] border border-[#b9a983] shadow-[0_30px_70px_rgba(0,0,0,0.75)] [backface-visibility:hidden] md:grid-cols-[clamp(150px,27%,300px)_1fr]", back && "pointer-events-none")} style={{ backgroundImage: PAPER, color: INK }}>
          {/* левая колонка: фото на скрепке и графы регистрации */}
          <aside className="relative border-b border-[#2a2218]/25 p-5 md:border-b-0 md:border-r">
            <div className="font-display text-[13px] font-semibold uppercase tracking-[0.32em]">Отель «Пионер»</div>
            <div className="font-system text-[9px] uppercase tracking-[0.28em] opacity-60">карточка гостя · № 1-{String(no).padStart(2, "0")}</div>

            <div className="relative mx-auto mt-5 w-[78%] rotate-[-1.5deg] bg-[#f6f0de] p-1.5 shadow-[0_6px_14px_rgba(40,30,10,0.35)]">
              {/* скрепка */}
              <span className="absolute -top-3 left-5 z-10 h-9 w-3.5 rounded-full border-2 border-[#7d8086]" />
              <div className="aspect-[3/4] bg-cover bg-center" role="img" aria-label={g.name} style={{ backgroundColor: color, backgroundImage: src ? `url(${src})` : undefined }} />
            </div>

            <div className="mt-4 font-display text-[30px] font-semibold leading-none">{g.name}</div>
            {g.blessing.name && <div className="mt-1.5 font-system text-[10px] uppercase tracking-[0.24em] opacity-60">Благословение · {g.blessing.name}</div>}

            {/* штампы */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rotate-[-5deg] border-2 px-2 py-0.5 font-system text-[10px] font-bold uppercase tracking-[0.2em]" style={{ borderColor: "#8f1d22", color: "#8f1d22" }}>
                1-й этаж
              </span>
              <span className="rotate-[3deg] border px-2 py-0.5 font-system text-[10px] uppercase tracking-[0.2em] opacity-70">{word}</span>
            </div>
            {g.merits?.map((m, i) => (
              <div key={m.title + i} className="relative mt-7 bg-[#f6f0de] px-3 pb-2.5 pt-3 shadow-[0_5px_12px_rgba(40,30,10,0.3)]" style={{ rotate: `${i % 2 ? -1.5 : 1.5}deg` }}>
                {/* золотая печать с лентами */}
                <span className="absolute -right-3 -top-5 flex h-12 w-12 items-center justify-center">
                  <span className="absolute left-2 top-7 h-8 w-3 rotate-[14deg] bg-[#8f1d22] [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" />
                  <span className="absolute right-2 top-7 h-8 w-3 rotate-[-14deg] bg-[#8f1d22] [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-dotted border-[#7a5a12] font-display text-[20px] font-semibold text-[#5a400a] shadow-[0_2px_5px_rgba(40,30,10,0.4)] [background:radial-gradient(circle_at_35%_30%,#f3dc8c,#c9a227_60%,#9a7614)]">{m.room || "★"}</span>
                </span>
                <div className="font-system text-[8px] uppercase tracking-[0.28em] opacity-60">отмечен отелем</div>
                <div className="mt-0.5 pr-8 font-display text-[19px] font-semibold leading-tight">{m.title}</div>
                <p className="mt-1 font-display text-[14px] leading-snug">{m.text}</p>
              </div>
            ))}
            {g.draft && <p className="mt-4 font-hand text-[19px] leading-tight text-[#8f1d22]">Черновик. Сведения переписываются по новелле.</p>}
          </aside>

          {/* правая часть: открытый лист */}
          <section key={sheet} className="relative px-6 pb-8 pt-6 md:px-9">
            <div className="flex justify-between border-b-2 border-[#2a2218] pb-2">
              <button onClick={() => setBack(true)} className="font-system text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100">
                ⟲ оборот
              </button>
              <button onClick={onClose} aria-label="Закрыть карточку" className="font-system text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100">
                убрать в картотеку ✕
              </button>
            </div>

            {sheet === "about" && (
              <div className={cn("mt-5", g.links?.length && "grid gap-x-8 gap-y-6 lg:grid-cols-[1fr_190px]")}>
               <div>
                {/* бланк: печатные графы, вписано от руки по линейкам */}
                {g.registry.length > 0 && (
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                    {g.registry.map((r) => (
                      <div key={r.label} className={cn(r.value.length > 24 && "sm:col-span-2")}>
                        <dt className="font-system text-[9px] uppercase tracking-[0.26em] opacity-55">{r.label}</dt>
                        <dd className="font-hand text-[25px] leading-[32px] text-[#1d2a4a] [background-image:repeating-linear-gradient(transparent_0_31px,rgba(42,34,24,0.4)_31px_32px)]">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {g.about.length > 0 && (
                  <>
                    <div className="mt-8 flex items-center gap-3 font-system text-[9px] uppercase tracking-[0.26em] opacity-55">
                      <span>Заметки портье</span>
                      <span className="h-px flex-1 bg-[#2a2218]/50" />
                    </div>
                    <div className="mt-3 max-w-[70ch] space-y-3">
                      {g.about.map((p, i) => (
                        <p key={i} className="font-display text-[18px] leading-[1.5]">
                          {p.text}
                        </p>
                      ))}
                    </div>
                  </>
                )}
                {!g.about.length && !g.registry.length && <Empty text="Сведений о госте пока нет." />}
               </div>
                {/* поля: от руки о других гостях, имя открывает их карточку */}
                {!!g.links?.length && (
                  <div className="space-y-5 border-[#8f1d22]/35 pt-1 lg:border-l lg:pl-4">
                    {g.links.map((l, i) => (
                      <div key={l.to + i} className="font-hand text-[21px] leading-[1.1] text-[#8f1d22]" style={{ rotate: `${i % 2 ? 1.2 : -1.6}deg` }}>
                        <button onClick={() => onOpen(l.to)} className="underline decoration-[#8f1d22]/50 underline-offset-4 hover:decoration-[#8f1d22]">
                          → {names[l.to] ?? l.to}
                        </button>
                        <div className="mt-0.5 text-[#2a2218]/85">{l.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sheet === "blessing" && (
              <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_210px]">
                <div className="max-w-[60ch] space-y-4">
                  {g.blessing.text.map((p, i) => (
                    <p key={i} className="font-display text-[18px] leading-[1.55]">
                      {p.text}
                    </p>
                  ))}
                  {!g.blessing.text.length && <Empty text="Как работает Благословение, в карточку ещё не внесено." />}
                  {g.blessing.limits.length > 0 && (
                    <div className="pt-2">
                      <div className="font-system text-[10px] uppercase tracking-[0.28em]" style={{ color: "#8f1d22" }}>
                        Ограничения
                      </div>
                      <ul className="mt-1.5 space-y-1.5">
                        {g.blessing.limits.map((p, i) => (
                          <li key={i} className="grid grid-cols-[18px_1fr] font-system text-[13px] leading-snug">
                            <span style={{ color: "#8f1d22" }}>{i + 1}.</span>
                            <span>
                              {p.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {/* печать Благословения */}
                <div className="mx-auto flex h-[190px] w-[190px] rotate-[-8deg] flex-col items-center justify-center rounded-full border-[3px] border-double text-center" style={{ borderColor: color, color }}>
                  <div className="font-system text-[9px] uppercase tracking-[0.3em]">благословение</div>
                  <div className="mt-1 px-3 font-display text-[30px] font-semibold leading-none">{g.blessing.name || "—"}</div>
                  <div className="mt-1 font-system text-[9px] uppercase tracking-[0.3em]">{word}</div>
                  {g.blessing.patron && <div className="mt-2 max-w-[150px] font-hand text-[17px] leading-none">{g.blessing.patron}</div>}
                </div>
              </div>
            )}

            {sheet === "legacies" && (
              <div className="mt-5 space-y-5">
                {g.legacies.map((l) => (
                  <article key={l.name} className="grid gap-x-5 gap-y-1 sm:grid-cols-[92px_1fr]">
                    {/* бирка камеры хранения */}
                    <div className="relative h-fit w-[92px] rotate-[-3deg] bg-[#d9c58d] px-2 pb-2 pt-4 text-center shadow-[0_4px_8px_rgba(40,30,10,0.3)] [clip-path:polygon(18%_0,82%_0,100%_16%,100%_100%,0_100%,0_16%)]">
                      <span className="absolute left-1/2 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-[#0b0908]" />
                      <div className="font-system text-[8px] uppercase tracking-[0.2em] opacity-70">номер</div>
                      <div className="font-display text-[26px] font-semibold leading-none">{l.room || "—"}</div>
                    </div>
                    <div>
                      <h3 className="font-display text-[25px] font-semibold leading-tight">{l.name}</h3>
                      <p className="mt-1 max-w-[60ch] font-display text-[17px] leading-[1.5]">
                        {l.text}
                      </p>
                    </div>
                  </article>
                ))}
                {!g.legacies.length && <Empty text="Наследий за гостем не числится." />}
              </div>
            )}

            {sheet === "items" && (
              <div className="mt-5">
                {g.items.length > 0 && (
                  <div className="grid grid-cols-[28px_1fr] border-b border-[#2a2218]/40 pb-1 font-system text-[9px] uppercase tracking-[0.24em] opacity-60">
                    <span>№</span>
                    <span>опись имущества гостя</span>
                  </div>
                )}
                <ol>
                  {g.items.map((it, i) => (
                    <li key={it.name + i} className="grid grid-cols-[28px_1fr] border-b border-dotted border-[#2a2218]/35 py-2.5">
                      <span className="pt-1 font-system text-[12px] opacity-55">{i + 1}</span>
                      <div>
                        <div className="flex flex-wrap items-baseline gap-x-3">
                          <h3 className="font-display text-[21px] font-semibold leading-tight">{it.name}</h3>
                          {it.source && <span className="font-system text-[10px] uppercase tracking-wider opacity-55">{it.source}</span>}
                        </div>
                        <p className="max-w-[62ch] font-display text-[16px] leading-[1.45]">
                          {it.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                {!g.items.length && <Empty text="В описи пусто." />}
              </div>
            )}

            {/* подпись портье внизу листа */}
            <div className="mt-8 flex items-end justify-end gap-4 font-system text-[9px] uppercase tracking-[0.24em] opacity-55">
              <span className="normal-case tracking-normal">
                <span className="font-hand text-[20px] opacity-90" style={{ color: ink === "#e0cdb0" ? INK : INK }}>
                  принял портье
                </span>
              </span>
            </div>
          </section>
        </div>

        {/* оборот: страница с отметками, как визы в паспорте */}
        <div className={cn("absolute inset-0 overflow-y-auto border border-[#b9a983] px-6 pb-8 pt-6 shadow-[0_30px_70px_rgba(0,0,0,0.75)] [backface-visibility:hidden] [transform:rotateY(180deg)] md:px-9", !back && "pointer-events-none")} style={{ backgroundImage: PAPER, color: INK }}>
          <div className="flex justify-between border-b-2 border-[#2a2218] pb-2">
            <button onClick={() => setBack(false)} className="font-system text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100">
              ⟲ лицевая сторона
            </button>
            <button onClick={onClose} aria-label="Закрыть карточку" className="font-system text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100">
              убрать в картотеку ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6">
            <div className="font-display text-[26px] font-semibold leading-none">{g.name}</div>
            <div className="font-system text-[9px] uppercase tracking-[0.28em] opacity-60">отметки отеля · № 1-{String(no).padStart(2, "0")}</div>
          </div>

          {!g.back?.rooms.length && !g.back?.deaths.length ? (
            <div className="mt-10">
              <Empty text="Отметок на обороте пока нет." />
            </div>
          ) : (
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_250px]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {g.back!.rooms.map((r, i) => (
                  <div key={r.room + i} className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-dashed border-[#2a2218]/30">
                    <span className="absolute left-2 top-1 font-system text-[9px] uppercase tracking-[0.2em] opacity-45">номер</span>
                    <span className="absolute bottom-0 right-2 font-display text-[54px] font-semibold leading-none opacity-[0.09]">{parseInt(r.room) || ""}</span>
                    <div className="relative text-center" style={{ rotate: `${tilt(i)}deg`, color: STAMP[r.result] ?? INK }}>
                      <div className="border-[3px] border-double px-2.5 py-1 opacity-85" style={{ borderColor: "currentColor" }}>
                        <div className="font-system text-[9px] font-bold uppercase tracking-[0.2em]">{r.room}</div>
                        <div className="font-system text-[15px] font-bold uppercase leading-none tracking-[0.18em]">{r.result}</div>
                        {r.title && <div className="mx-auto mt-0.5 max-w-[150px] font-display text-[12px] leading-tight">{r.title}</div>}
                      </div>
                      {(r.role || r.note) && <div className="mt-1 font-hand text-[18px] leading-none text-[#1d2a4a]">{[r.role, r.note].filter(Boolean).join(" · ")}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-3 font-system text-[9px] uppercase tracking-[0.26em] opacity-55">
                  <span>Смерти · {g.back!.deaths.length}</span>
                  <span className="h-px flex-1 bg-[#2a2218]/50" />
                </div>
                <ul className="mt-3 space-y-2.5">
                  {g.back!.deaths.map((d, i) => (
                    <li key={i} className="grid grid-cols-[22px_1fr] items-start gap-2">
                      <span className="relative mt-1 block h-5 w-4" style={{ rotate: `${tilt(i + 3)}deg` }}>
                        <span className="absolute left-1/2 top-0 h-5 w-[3px] -translate-x-1/2 bg-[#8f1d22]" />
                        <span className="absolute left-0 top-[5px] h-[3px] w-4 bg-[#8f1d22]" />
                      </span>
                      <span className="font-hand text-[21px] leading-[1.1] text-[#1d2a4a]">
                        <span className="font-system text-[11px] text-[#2a2218]/60">{d.room}</span> {d.cause}
                      </span>
                    </li>
                  ))}
                </ul>
                {!g.back!.deaths.length && <p className="mt-3 font-hand text-[21px] opacity-60">Ни одной.</p>}
              </div>
            </div>
          )}
        </div>
        </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="font-hand text-[24px] leading-tight opacity-60">{text}</p>;
}
