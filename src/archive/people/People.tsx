"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import characters from "@/data/characters.json";
import items from "@/data/items.json";
import type { Character, Item } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * Гости отеля «Пионер»: пропуска на клипсах. Каждый качается сам, его можно схватить и качнуть;
 * клик открывает досье. Оформление своё, гостиничное; сведения — из глав 1–100.
 */
type Meta = { id: string; age: string; word: string; color: string; ink: string };
// порядок как на стойке регистрации; word — Благословение латиницей, как девиз на пропуске
const GUESTS: Meta[] = [
  { id: "han-gain", age: "20", word: "SAPIENTIA", color: "#2f4a6b", ink: "#9fc4ff" },
  { id: "cha-jinchul", age: "31", word: "FORTITUDO", color: "#6b2424", ink: "#ff9a8a" },
  { id: "yu-sonyi", age: "17", word: "EMPATHIA", color: "#3d5a3f", ink: "#a8e0a0" },
  { id: "elena-ivanova", age: "23", word: "IUSTITIA", color: "#6b5520", ink: "#ffd97a" },
  { id: "park-seungyeop", age: "14", word: "FORTUNA", color: "#4a3a66", ink: "#c9b0ff" },
  { id: "lee-eunsol", age: "32", word: "DIVITIAE", color: "#1f4f55", ink: "#8fe0e6" },
  { id: "kim-mukseon", age: "?", word: "COMMUNIO", color: "#4d4338", ink: "#e0cdb0" },
  { id: "kim-ari", age: "16?", word: "SUGGESTIO", color: "#571626", ink: "#ff8fa8" },
];
const ALL = characters as unknown as Character[];
const ITEMS = items as unknown as Item[];
const byId = (id: string) => ALL.find((c) => c.id === id)!;
const shortName = (c: Character) => c.name.split(" (")[0];

export function People({ art }: { art: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const has = (id: string) => (art.includes(`${id}.jpg`) ? `/art/people/${id}.jpg` : null);
  return (
    <main className="min-h-screen overflow-x-clip bg-[#0b0a09] pb-32 text-[#e9e1d0] [background-image:repeating-linear-gradient(90deg,transparent_0_118px,rgba(255,255,255,0.018)_118px_120px),radial-gradient(ellipse_at_50%_0%,#2a1410_0%,#0b0a09_60%)]">
      {/* стойка регистрации: лампа, латунная табличка, указатель этажа и ключи */}
      <header className="relative mx-auto max-w-6xl px-6 pt-14 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,214,140,0.22),transparent_65%)]" />
        <div className="relative mx-auto w-fit rounded-[3px] border border-[#3a2c12] bg-gradient-to-b from-[#d9b65a] via-[#b08a2e] to-[#7a5c16] px-10 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.45)]">
          {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map((c) => (
            <span key={c} className={`absolute ${c} h-1.5 w-1.5 rounded-full bg-[#4a3810] shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]`} />
          ))}
          <div className="font-system text-[11px] tracking-[0.45em] text-[#3a2c12]">ОТЕЛЬ «ПИОНЕР»</div>
          <h1 className="font-display text-5xl font-semibold tracking-[0.12em] text-[#2a1f0a] [text-shadow:0_1px_0_rgba(255,255,255,0.35)] md:text-6xl">ГОСТИ</h1>
          <div className="font-system text-[10px] tracking-[0.4em] text-[#3a2c12]">СТОЙКА РЕГИСТРАЦИИ</div>
        </div>

        <div className="relative mx-auto mt-8 flex w-fit flex-wrap items-end justify-center gap-x-12 gap-y-6">
          <FloorDial />
          <KeyRack onOpen={setOpen} />
        </div>
      </header>

      {[GUESTS.slice(0, 4), GUESTS.slice(4)].map((row, r) => (
        <section key={r} className="relative mx-auto mt-12 max-w-6xl px-6">
          {/* рейка, на которой висят пропуска */}
          <div className="h-3 rounded-full bg-gradient-to-b from-[#6a5a3a] to-[#2a2216] shadow-[0_6px_14px_rgba(0,0,0,0.6)]" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10">
            {row.map((m, i) => (
              <Badge key={m.id} m={m} c={byId(m.id)} src={has(m.id)} i={r * 4 + i} paused={!!open} onOpen={() => setOpen(m.id)} />
            ))}
          </div>
        </section>
      ))}

      <AnimatePresence>{open && <Dossier key={open} m={GUESTS.find((g) => g.id === open)!} c={byId(open)} src={has(open)} onClose={() => setOpen(null)} />}</AnimatePresence>
    </main>
  );
}

/** Указатель лифта: стрелка стоит на первом этаже, остальные пока закрыты. */
function FloorDial() {
  const [set, setSet] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSet(true), 400);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="text-center">
      <svg viewBox="0 0 120 70" className="h-[70px] w-[120px]" aria-hidden>
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="#c9a227" strokeWidth="2" />
        {[
          { n: "1", a: -60, on: true },
          { n: "2", a: 0, on: false },
          { n: "3", a: 60, on: false },
        ].map((f) => (
          <g key={f.n} transform={`rotate(${f.a} 60 62)`} opacity={f.on ? 1 : 0.3}>
            <line x1="60" y1="12" x2="60" y2="19" stroke="#c9a227" strokeWidth="2" />
            <text x="60" y="32" textAnchor="middle" fontSize="13" fill="#e9e1d0" fontFamily="serif" transform={`rotate(${-f.a} 60 28)`}>
              {f.n}
            </text>
          </g>
        ))}
        {/* стрелка съезжает с третьего этажа на первый */}
        <g style={{ transformBox: "view-box", transformOrigin: "60px 62px", transform: `rotate(${set ? -60 : 60}deg)`, transition: "transform 1.6s cubic-bezier(0.3, 1.3, 0.5, 1)" }}>
          <line x1="60" y1="62" x2="60" y2="20" stroke="#f3d98a" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="62" r="5" fill="#c9a227" />
      </svg>
      <div className="mt-1 font-system text-[10px] tracking-[0.35em] text-[#e9e1d0]/60">1-Й ЭТАЖ</div>
    </div>
  );
}

/** Доска с ключами: по ключу на гостя. Ключ открывает досье. */
function KeyRack({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="text-center">
      <div className="relative flex gap-2.5 border-t-[3px] border-[#6a5a3a] px-1 pt-0">
        {GUESTS.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onOpen(g.id)}
            aria-label={`Ключ: ${shortName(byId(g.id))}`}
            title={shortName(byId(g.id))}
            className="sway group relative block h-[62px] w-4 transition-[filter] hover:brightness-150"
            style={{ "--sway": `${3 + (i % 3)}deg`, "--sway-d": `${2 + (i % 4) * 0.3}s`, animationDelay: `${-i * 0.4}s` } as React.CSSProperties}
          >
            <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-[#8a7a5a]" />
            <span className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full border-[3px]" style={{ borderColor: g.ink }} />
            <span className="absolute left-1/2 top-[26px] h-7 w-[3px] -translate-x-1/2" style={{ background: g.ink }} />
            <span className="absolute left-1/2 top-[44px] h-[3px] w-2" style={{ background: g.ink }} />
            <span className="absolute left-1/2 top-[50px] h-[3px] w-1.5" style={{ background: g.ink }} />
          </button>
        ))}
      </div>
      <div className="mt-1 font-system text-[10px] tracking-[0.35em] text-[#e9e1d0]/60">{GUESTS.length} ГОСТЕЙ</div>
    </div>
  );
}

/** Пропуск на клипсе: маятник. Тянешь — раскачивается от скорости руки, отпускаешь — возвращается. */
function Badge({ m, c, src, i, paused, onOpen }: { m: Meta; c: Character; src: string | null; i: number; paused: boolean; onOpen: () => void }) {
  const x = useMotionValue(0);
  const v = useVelocity(x);
  const swing = useSpring(useTransform(v, [-1500, 1500], [28, -28]), { stiffness: 60, damping: 5, mass: 1.2 });
  const [dragged, setDragged] = useState(false);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[240px] origin-top cursor-grab touch-none select-none will-change-transform active:cursor-grabbing"
      style={{ x, rotate: swing }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.35}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => setDragged(true)}
      onDragEnd={() => setTimeout(() => setDragged(false), 250)}
      onHoverStart={() => !dragged && !paused && animate(swing, [swing.get(), 7, -5, 3, 0], { duration: 1.4 })}
      onTap={() => !dragged && onOpen()}
      role="button"
      tabIndex={0}
      aria-label={`Досье: ${shortName(c)}`}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="sway relative pt-10" style={{ "--sway": `${1.2 + (i % 3) * 0.5}deg`, "--sway-d": `${2.6 + (i % 4) * 0.45}s`, animationDelay: `${-i * 0.7}s`, animationPlayState: paused ? "paused" : "running" } as React.CSSProperties}>
      {/* ремешок и клипса */}
      <div className="absolute left-1/2 top-0 h-10 w-3 -translate-x-1/2 bg-gradient-to-b from-[#1b1712] to-[#3a3226]" />
      <div className="absolute left-1/2 top-8 h-4 w-9 -translate-x-1/2 rounded-sm bg-gradient-to-b from-[#9a8a6a] to-[#4a4030] shadow" />
      <div className="relative overflow-hidden rounded-md border border-black/60 shadow-[0_10px_18px_rgba(0,0,0,0.6)]" style={{ background: m.color }}>
        <div className="flex items-center justify-between bg-black/45 px-2.5 py-1">
          <span className="font-display text-[13px] font-semibold tracking-[0.25em] text-[#c9a227]">ПИОНЕР</span>
          <span className="font-system text-[9px] tracking-widest opacity-70">ГОСТЬ · 1 ЭТ.</span>
        </div>
        <div className="relative aspect-[3/4] bg-black/40">
          {src ? (
            <Image src={src} alt={shortName(c)} fill sizes="340px" unoptimized priority className="pointer-events-none object-cover" draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-7xl opacity-30">{shortName(c)[0]}</div>
          )}
          <div className="absolute inset-x-0 top-0 bg-black/60 py-0.5 text-center font-system text-[11px] tracking-[0.35em]" style={{ color: m.ink }}>
            {m.word}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          {/* блик ламината */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.10)_50%,transparent_60%)]" />
        </div>
        <div className="px-2.5 pb-2.5 pt-1.5">
          <div className="font-display text-[24px] font-semibold leading-none" style={{ color: m.ink }}>
            {shortName(c)}
          </div>
          <div className="mt-1 flex justify-between font-system text-[10px] opacity-75">
            <span>{c.stat ?? "—"}</span>
            <span>{m.age} лет</span>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

const TABS = ["Сведения", "Предметы", "Хроника"] as const;

/** Досье: слева портрет и пропуск, справа — Благословение, предметы и хроника по главам. */
function Dossier({ m, c, src, onClose }: { m: Meta; c: Character; src: string | null; onClose: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Сведения");
  const own = ITEMS.filter((it) => it.owner === c.id);
  const facts = [...c.facts].sort((a, b) => (a.ch ?? 0) - (b.ch ?? 0));
  const key = facts.slice(0, 5);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 md:p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative grid h-[min(680px,94vh)] w-[min(1040px,100%)] overflow-hidden rounded-md border border-black bg-[#12100e] shadow-[0_30px_90px_rgba(0,0,0,0.9)] md:grid-cols-[340px_1fr]"
      >
        {/* портрет */}
        <div className="relative hidden md:block" style={{ background: m.color }}>
          {src && <Image src={src} alt={shortName(c)} fill sizes="340px" unoptimized priority className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12100e] via-transparent to-black/30" />
          <div className="absolute inset-x-0 top-0 bg-black/60 py-1.5 text-center font-system text-[13px] tracking-[0.45em]" style={{ color: m.ink }}>
            {m.word}
          </div>
          <div className="absolute inset-x-5 bottom-5">
            <div className="font-display text-[40px] font-semibold leading-none" style={{ color: m.ink }}>
              {shortName(c)}
            </div>
            <div className="mt-2 font-system text-[11px] tracking-widest opacity-80">ГОСТЬ · {m.age} ЛЕТ · С ГЛ. {c.firstCh ?? facts[0]?.ch ?? "?"}</div>
          </div>
        </div>

        {/* сведения */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 pb-4 pt-5">
            <div>
              <div className="font-system text-[10px] uppercase tracking-[0.3em] text-[#c9a227]">Благословение</div>
              <div className="font-display text-4xl font-semibold" style={{ color: m.ink }}>
                {c.stat ?? "нет"}
              </div>
              {c.role && <p className="mt-1 max-w-md font-display text-[16px] leading-snug opacity-75">{c.role}</p>}
              <div className="mt-1 font-display text-xl md:hidden">{shortName(c)}</div>
            </div>
            <button onClick={onClose} aria-label="Закрыть досье" className="border border-white/25 px-3 py-1 font-system text-[12px] hover:bg-white/10">
              ✕
            </button>
          </div>
          <div className="flex gap-1 px-6 pt-3">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1.5 font-system text-[12px] tracking-wider transition", tab === t ? "text-black" : "border border-white/15 opacity-70 hover:opacity-100")} style={tab === t ? { background: m.ink } : undefined}>
                {t}
                {t === "Предметы" && ` · ${own.length}`}
                {t === "Хроника" && ` · ${facts.length}`}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 [scrollbar-color:#3a3226_transparent] [scrollbar-width:thin]">
            {tab === "Сведения" && (
              <ul className="space-y-3">
                {key.map((f, i) => (
                  <li key={i} className="border-l-2 pl-3 font-display text-[18px] leading-snug" style={{ borderColor: m.ink }}>
                    {f.text}
                    <sup className="ml-1 font-system text-[10px] opacity-50">гл. {f.ch}</sup>
                  </li>
                ))}
                {facts.length > key.length && (
                  <li>
                    <button onClick={() => setTab("Хроника")} className="font-system text-[12px] underline opacity-60 hover:opacity-100">
                      ещё {facts.length - key.length} записей в хронике
                    </button>
                  </li>
                )}
              </ul>
            )}
            {tab === "Предметы" &&
              (own.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {own.map((it) => (
                    <div key={it.id} className="border border-white/12 bg-white/[0.03] p-3">
                      <div className="font-display text-[19px] font-semibold leading-tight" style={{ color: m.ink }}>
                        {it.name}
                      </div>
                      <div className="mt-0.5 font-system text-[10px] tracking-wider opacity-55">
                        {/^\d/.test(it.room) ? `номер ${it.room}` : it.room} · гл. {it.ch}
                      </div>
                      <p className="mt-1.5 font-display text-[15px] leading-snug opacity-85">{it.effect}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-display text-[17px] opacity-60">За первые сто глав за этим гостем предметов не записано.</p>
              ))}
            {tab === "Хроника" && (
              <ol className="space-y-2.5">
                {facts.map((f, i) => (
                  <li key={i} className="grid grid-cols-[58px_1fr] gap-3">
                    <span className="pt-0.5 font-system text-[11px] opacity-55">гл. {f.ch}</span>
                    <span className="font-display text-[16px] leading-snug">{f.text}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
