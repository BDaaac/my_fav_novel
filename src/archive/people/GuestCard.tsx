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
  links?: { to: string; bond?: string; text: string }[];
  /** что отель засчитал лично гостю */
  merits?: { title: string; room?: string; text: string }[];
};

const STAMP: Record<string, string> = { Побег: "#1f4a7a", Решение: "#8f1d22", Провал: "#3b362e" };
const tilt = (i: number) => ((i * 37) % 11) - 5;
/** Колонки ведомости на обороте: номер, комната, попытки, смерти. */
const ROW = "grid gap-x-5 gap-y-2 md:grid-cols-[92px_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1.2fr)]";

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

export function GuestCard({ g, src, color, ink, word, no, names, faces, onOpen, onClose }: { g: Guest; src: string | null; color: string; ink: string; word: string; no: number; names: Record<string, string>; faces: Record<string, string | null>; onOpen: (id: string) => void; onClose: () => void }) {
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

  // оборот: заходы и смерти собираются по номерам, в порядке первого захода
  const deaths = g.back?.deaths ?? [];
  const cells: { room: string; title?: string; roles: string[]; visits: { result: string; note?: string }[]; deaths: string[] }[] = [];
  const cell = (name: string) => {
    const room = name.replace(/\s*Re$/i, "");
    let c = cells.find((x) => x.room === room);
    if (!c) cells.push((c = { room, roles: [], visits: [], deaths: [] }));
    return c;
  };
  for (const r of g.back?.rooms ?? []) {
    const c = cell(r.room);
    c.title ??= r.title;
    if (r.role && !c.roles.includes(r.role)) c.roles.push(r.role);
    c.visits.push({ result: r.result, note: r.note });
  }
  for (const d of deaths) cell(d.room).deaths.push(d.cause);

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
            {g.merits?.map((m, i) => {
              const kind = /Решение/.test(m.title) ? "gold" : /Побег/.test(m.title) ? "silver" : "bronze";
              return (
                <div key={m.title + i} className="group relative mt-8 border border-[#b9a983] bg-[#f6f0de] p-[5px] shadow-[0_6px_14px_rgba(40,30,10,0.32)]" style={{ rotate: `${i % 2 ? -1.6 : 1.4}deg` }}>
                  {/* печать на лентах: снимок фольги, белый фон гасится умножением */}
                  <span className="absolute -right-5 -top-7 z-10 block w-[86px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/art/people/fx/seal-${kind}.png`} alt="" aria-hidden className="block w-full select-none drop-shadow-[0_3px_3px_rgba(40,30,10,0.35)]" />
                    <span className="absolute inset-x-0 top-0 flex aspect-square items-center justify-center font-display text-[24px] font-semibold leading-none" style={{ color: kind === "bronze" ? "#f3e2c4" : kind === "silver" ? "#262b33" : "#3a2a08", textShadow: kind === "bronze" ? "0 1px 1px rgba(0,0,0,0.6)" : "0 1px 0 rgba(255,255,255,0.5)" }}>{m.room || "★"}</span>
                  </span>
                  <div className="border border-double border-[#2a2218]/45 px-3 pb-3 pt-2.5">
                    <div className="font-system text-[8px] uppercase tracking-[0.3em] opacity-60">отель «Пионер» отмечает</div>
                    <div className="mt-1.5 pr-12 font-display text-[22px] font-semibold leading-[1.05]">{m.title}</div>
                    <div className="my-2 h-px w-10 bg-[#2a2218]/50" />
                    <p className="font-display text-[14.5px] leading-snug">{m.text}</p>
                  </div>
                </div>
              );
            })}
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
              <div className={cn("mt-5", g.links?.length && "grid gap-x-8 gap-y-6 lg:grid-cols-[1fr_215px]")}>
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
                  <div className="space-y-6 border-[#8f1d22]/35 pt-2 lg:border-l lg:pl-4">
                    {g.links.map((l, i) => (
                      <button key={l.to + i} onClick={() => onOpen(l.to)} className="group block w-full text-left" style={{ rotate: `${i % 2 ? 1.2 : -1.6}deg` }}>
                        <span className="flex items-end gap-2.5">
                          <span className="relative block h-[66px] w-[52px] shrink-0 bg-[#f6f0de] p-[3px] shadow-[0_3px_7px_rgba(40,30,10,0.35)] transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-[-5deg]" style={{ rotate: `${i % 2 ? -4 : 3}deg` }}>
                            <span className="absolute -top-2 left-1/2 z-10 h-3.5 w-8 -translate-x-1/2 rotate-[-7deg] bg-[#e6d59a]/80 shadow-[0_1px_1px_rgba(40,30,10,0.2)]" />
                            <span className="block h-full w-full bg-[#2a2218]/20 bg-cover bg-top" style={{ backgroundImage: faces[l.to] ? `url(${faces[l.to]})` : undefined }} />
                          </span>
                          <span className="pb-0.5">
                            {l.bond && <span className="block font-system text-[9px] uppercase tracking-[0.22em] text-[#2a2218]/60">{l.bond}</span>}
                            <span className="mt-1 block font-hand text-[23px] leading-none text-[#8f1d22] underline decoration-[#8f1d22]/45 underline-offset-4 group-hover:decoration-[#8f1d22]">{names[l.to] ?? l.to}</span>
                          </span>
                        </span>
                        <span className="mt-1.5 block font-hand text-[20px] leading-[1.1] text-[#2a2218]/85">{l.text}</span>
                      </button>
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
          <div className="relative mt-4 flex flex-wrap items-end justify-between gap-x-6">
            <div>
              <div className="font-display text-[30px] font-semibold leading-none">{g.name}</div>
              <div className="mt-1.5 font-system text-[9px] uppercase tracking-[0.28em] opacity-60">отметки отеля · № 1-{String(no).padStart(2, "0")}</div>
            </div>
            <div className="flex items-end gap-6 font-system text-[9px] uppercase tracking-[0.26em]">
              <div className="text-right">
                <div className="font-display text-[44px] font-semibold leading-[0.9] tracking-normal">{cells.filter((c) => c.visits.length).length}</div>
                <div className="mt-1 opacity-60">номеров</div>
              </div>
              <div className="text-right">
                <div className="font-display text-[44px] font-semibold leading-[0.9] tracking-normal">{cells.reduce((n, c) => n + c.visits.length, 0)}</div>
                <div className="mt-1 opacity-60">попыток</div>
              </div>
              <div className="text-right text-[#7a0c12]">
                <div className="font-display text-[44px] font-semibold leading-[0.9] tracking-normal">{deaths.length}</div>
                <div className="mt-1">смертей</div>
              </div>
            </div>
          </div>

          {!cells.length ? (
            <div className="mt-10">
              <Empty text="Отметок на обороте пока нет." />
            </div>
          ) : (
            <div className="relative mt-6">
              {/* ведомость: строка на номер, по порядку заходов */}
              <div className={cn(ROW, "border-b-2 border-[#2a2218] pb-1.5 font-system text-[9px] uppercase tracking-[0.26em] opacity-60 max-md:hidden")}>
                <span>номер</span>
                <span>комната · кем был</span>
                <span>попытки</span>
                <span>смерти</span>
              </div>
              {cells.map((c, ci) => (
                <div key={c.room} className={cn(ROW, "relative overflow-hidden border-b border-[#2a2218]/30 py-3.5")}>
                  {/* пятно под смертями: чем их больше в номере, тем оно крупнее */}
                  {c.deaths.length > 0 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.deaths.length > 1 ? "/art/people/fx/splat.jpg" : "/art/people/fx/stain.jpg"}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute right-0 top-1/2 select-none mix-blend-multiply"
                      style={{ width: 110 + c.deaths.length * 40, opacity: 0.4, transform: `translate(${34 + tilt(ci) * 3}%, -50%) rotate(${ci * 67}deg)` }}
                    />
                  )}
                  <div className="relative font-display font-semibold leading-none">
                    {parseInt(c.room) ? <span className="text-[38px]">{parseInt(c.room)}</span> : <span className="text-[19px]">{c.room}</span>}
                  </div>
                  <div className="relative">
                    {c.title && <div className="font-display text-[19px] font-semibold leading-tight">{c.title}</div>}
                    {c.roles.length > 0 && <div className="mt-0.5 font-hand text-[20px] leading-none text-[#1d2a4a]">{c.roles.join(", ")}</div>}
                  </div>
                  <ol className="relative space-y-1.5">
                    {c.visits.map((v, i) => (
                      <li key={i} className="grid grid-cols-[14px_84px_1fr] items-center gap-2">
                        <span className="font-system text-[10px] opacity-45">{i + 1}</span>
                        <span className="justify-self-start border-2 border-double px-1.5 py-0.5 font-system text-[10px] font-bold uppercase tracking-[0.14em] opacity-85" style={{ rotate: `${tilt(ci * 3 + i) / 2}deg`, color: STAMP[v.result] ?? INK, borderColor: "currentColor" }}>
                          {v.result}
                        </span>
                        {v.note && <span className="font-hand text-[18px] leading-[1.05] text-[#1d2a4a]">{v.note}</span>}
                      </li>
                    ))}
                  </ol>
                  <ul className="relative space-y-1">
                    {c.deaths.map((d, i) => (
                      <li key={i} className="grid grid-cols-[24px_1fr] items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/art/people/fx/drop.jpg" alt="" aria-hidden className="h-6 w-6 select-none mix-blend-multiply" style={{ rotate: `${(ci * 5 + i) * 83}deg` }} />
                        <span className="font-hand text-[20px] leading-[1.05] text-[#4f070b]">{d}</span>
                      </li>
                    ))}
                    {!c.deaths.length && <li className="font-system text-[11px] opacity-35">—</li>}
                  </ul>
                </div>
              ))}
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
