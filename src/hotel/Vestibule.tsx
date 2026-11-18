"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Вестибюль первого этажа: отсюда расходятся в номера, столовую и к стойке с гостями.
 * Двери приоткрываются при наведении, и из щели видно, что это за комната.
 */
export type RoomDoor = { id: string; title: string; type: string; solved: boolean; runs: number };
type Kind = "curse" | "mission" | "rest" | "locked";
const GLOW: Record<Kind, string> = { curse: "#c0333d", mission: "#3a8fd6", rest: "#7fd4ff", locked: "#000000" };
const KIND_LABEL: Record<Kind, string> = { curse: "Комната Проклятий", mission: "Комната Миссий", rest: "Комната Отдыха", locked: "закрыто" };

export function Vestibule({ rooms }: { rooms: RoomDoor[] }) {
  const byId = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const doors = ["101", "102", "103", "104", "105", "106", "107"].map((n) => {
    const r = byId[n];
    if (n === "105") return { n, href: "/room/105", kind: "rest" as Kind, title: "Комната Отдыха", solved: false, runs: 0 };
    if (!r) return { n, href: null, kind: "locked" as Kind, title: "□□□", solved: false, runs: 0 };
    return { n, href: n === "101" ? "/archive/101" : `/room/${n}`, kind: (r.type === "mission" ? "mission" : "curse") as Kind, title: r.title, solved: r.solved, runs: r.runs };
  });

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0b0a09] text-[#e9e1d0]">
      {/* стена: обои, свет люстр, панели внизу */}
      <div className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(90deg,transparent_0_58px,rgba(201,162,39,0.045)_58px_60px),radial-gradient(ellipse_at_22%_0%,rgba(255,214,140,0.16),transparent_45%),radial-gradient(ellipse_at_78%_0%,rgba(255,214,140,0.16),transparent_45%),linear-gradient(#1c0d0f,#120a0a)]" />

      <header className="relative px-6 pt-12 text-center">
        <div className="relative mx-auto w-fit rounded-[3px] border border-[#3a2c12] bg-gradient-to-b from-[#d9b65a] via-[#b08a2e] to-[#7a5c16] px-12 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.45)]">
          {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map((c) => (
            <span key={c} className={`absolute ${c} h-1.5 w-1.5 rounded-full bg-[#4a3810] shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)]`} />
          ))}
          <div className="font-system text-[11px] tracking-[0.45em] text-[#3a2c12]">ОТЕЛЬ</div>
          <h1 className="font-display text-5xl font-semibold tracking-[0.14em] text-[#2a1f0a] [text-shadow:0_1px_0_rgba(255,255,255,0.35)] md:text-6xl">ПИОНЕР</h1>
          <div className="font-system text-[10px] tracking-[0.4em] text-[#3a2c12]">ВЕСТИБЮЛЬ · 1-Й ЭТАЖ</div>
        </div>
        {/* указатель, как на стенде в холле */}
        <div className="mx-auto mt-6 flex w-fit flex-wrap justify-center gap-x-8 gap-y-1 font-display text-[17px] text-[#e9e1d0]/70">
          <span>
            <span className="text-[#c9a227]">⇦</span> Столовая
          </span>
          <span>
            <span className="text-[#c9a227]">⇧</span> Номерной фонд
          </span>
          <span>
            Стойка регистрации <span className="text-[#c9a227]">⇨</span>
          </span>
        </div>
      </header>

      {/* коридор */}
      <section className="relative mx-auto mt-10 max-w-[1500px] px-4">
        <div className="relative flex flex-wrap items-end justify-center gap-x-3 gap-y-12 px-2 pb-0 2xl:gap-x-5">
          <Dining />
          {doors.map((d, i) => (
            <Door key={d.n} {...d} i={i} />
          ))}
          <Reception />
        </div>
        {/* плинтус и ковёр */}
        <div className="h-3 bg-gradient-to-b from-[#5a4326] to-[#2a1d10]" />
        <div className="h-28 [background:linear-gradient(#3a0f14,#1a0709),repeating-linear-gradient(90deg,transparent_0_78px,rgba(201,162,39,0.14)_78px_80px)] [background-blend-mode:overlay]">
          <div className="mx-auto h-full max-w-[86%] border-x-4 border-[#c9a227]/25 bg-[#4a1218]/50" />
        </div>
      </section>

      <footer className="relative px-6 pb-16 pt-8 text-center font-system text-[11px] tracking-widest text-[#e9e1d0]/40">
        ЛИФТ НА 2-Й И 3-Й ЭТАЖИ НЕ РАБОТАЕТ · ДЕМО ПО ГЛАВАМ 1–100
      </footer>
    </main>
  );
}

/** Дверь номера: латунная табличка, лампа над косяком; при наведении приоткрывается. */
function Door({ n, href, kind, title, solved, runs, i }: { n: string; href: string | null; kind: Kind; title: string; solved: boolean; runs: number; i: number }) {
  const [hover, setHover] = useState(false);
  const locked = kind === "locked";
  const body = (
    <div className="relative w-[104px] 2xl:w-[118px]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {/* лампа */}
      <div className="mx-auto h-2 w-8 rounded-t-full bg-[#6a5a3a]" />
      <div className={cn("mx-auto h-2.5 w-5 rounded-b-full transition-all duration-300", hover && !locked ? "bg-[#ffe6a8] shadow-[0_0_30px_12px_rgba(255,220,150,0.45)]" : "bg-[#5a4a2a]")} />
      {/* проём */}
      <div className="relative mt-2 h-[240px] border-[6px] border-b-0 border-[#3a2a16] bg-black [perspective:700px] 2xl:h-[264px]">
        {/* что за дверью */}
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: hover && !locked ? 1 : 0, background: `radial-gradient(ellipse at 20% 60%, ${GLOW[kind]}, #000 75%)` }} />
        <motion.div
          className="absolute inset-0 origin-right bg-gradient-to-b from-[#6b4526] to-[#3d2512] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]"
          animate={{ rotateY: hover && !locked ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        >
          {/* филёнки */}
          <div className="absolute inset-x-3 top-14 h-[34%] border border-[#2a170a]/70 bg-[#5a3a1e]/60" />
          <div className="absolute inset-x-3 bottom-4 h-[30%] border border-[#2a170a]/70 bg-[#5a3a1e]/60" />
          {/* табличка */}
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-sm bg-gradient-to-b from-[#f3d98a] to-[#8a6420] px-2.5 py-0.5 font-display text-[19px] font-semibold text-[#2a1f0a] shadow">{n}</div>
          <span className="absolute left-2.5 top-1/2 h-3 w-3 rounded-full bg-[#c9a227] shadow-[0_2px_3px_rgba(0,0,0,0.6)]" />
          {locked && <div className="absolute inset-x-0 top-[46%] -rotate-6 bg-[#1a1408]/85 py-1 text-center font-system text-[10px] tracking-[0.3em] text-[#c9a227]">ЗАКРЫТО</div>}
          {solved && <div className="absolute bottom-[38%] left-1/2 -translate-x-1/2 -rotate-12 border-2 border-[#c0333d]/80 px-1.5 font-system text-[10px] tracking-widest text-[#ff8a8a]">РЕШЕНА</div>}
        </motion.div>
      </div>
      {/* подпись */}
      <div className="absolute inset-x-[-5px] top-full mt-5 text-center">
        <div className={cn("font-display text-[13.5px] leading-tight transition-colors", hover && !locked ? "text-[#f3d98a]" : "text-[#e9e1d0]/75")}>{title.split(" / ")[0]}</div>
        <div className="mt-0.5 font-system text-[9px] uppercase tracking-widest opacity-45">
          {KIND_LABEL[kind]}
          {runs > 1 && ` · ${runs} захода`}
        </div>
      </div>
      <span className="sr-only">{i}</span>
    </div>
  );
  return href ? (
    <Link href={href} aria-label={`Номер ${n}: ${title}`} className="block">
      {body}
    </Link>
  ) : (
    <div aria-label={`Номер ${n} закрыт`} className="cursor-not-allowed">
      {body}
    </div>
  );
}

/** Двустворчатый вход в столовую. */
function Dining() {
  const [hover, setHover] = useState(false);
  return (
    <Link href="/dining" aria-label="Столовая" className="block" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative w-[170px] 2xl:w-[190px]">
        <div className="mx-auto w-fit rounded-t-md bg-gradient-to-b from-[#d9b65a] to-[#7a5c16] px-4 py-0.5 font-display text-[15px] font-semibold tracking-[0.2em] text-[#2a1f0a]">СТОЛОВАЯ</div>
        <div className="relative h-[258px] border-[6px] border-b-0 border-[#3a2a16] bg-black [perspective:800px] 2xl:h-[284px]">
          <div className="absolute inset-0 transition-opacity duration-500 [background:radial-gradient(ellipse_at_50%_70%,#ffd9a0,#5a3410_55%,#000_90%)]" style={{ opacity: hover ? 1 : 0.15 }} />
          {[0, 1].map((side) => (
            <motion.div
              key={side}
              className={cn("absolute inset-y-0 w-1/2 bg-gradient-to-b from-[#6b4526] to-[#3d2512] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]", side ? "right-0 origin-right" : "left-0 origin-left")}
              animate={{ rotateY: hover ? (side ? 32 : -32) : 0 }}
              transition={{ type: "spring", stiffness: 110, damping: 14 }}
            >
              {/* стекло в двери */}
              <div className="absolute inset-x-3 top-5 h-[40%] rounded-t-full border border-[#2a170a] bg-[#ffd9a0]/15" />
              <div className="absolute inset-x-3 bottom-4 h-[30%] border border-[#2a170a]/70 bg-[#5a3a1e]/60" />
              <span className={cn("absolute top-1/2 h-8 w-1.5 rounded-full bg-[#c9a227]", side ? "left-2" : "right-2")} />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-full mt-5 text-center">
          <div className={cn("font-display text-[15px] transition-colors", hover ? "text-[#f3d98a]" : "text-[#e9e1d0]/75")}>Персонал очень застенчив</div>
          <div className="mt-0.5 font-system text-[9px] uppercase tracking-widest opacity-45">7:00 · 12:00 · 19:00</div>
        </div>
      </div>
    </Link>
  );
}

/** Стойка регистрации с доской ключей: ведёт к гостям. */
function Reception() {
  const [hover, setHover] = useState(false);
  const KEYS = ["#9fc4ff", "#ff9a8a", "#a8e0a0", "#ffd97a", "#c9b0ff", "#8fe0e6", "#e0cdb0", "#ff8fa8"];
  return (
    <Link href="/archive/people" aria-label="Стойка регистрации: гости" className="block" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative w-[170px] 2xl:w-[190px]">
        {/* доска с ключами */}
        <div className={cn("mx-auto w-[150px] border-4 border-[#3a2a16] bg-[#1a120a] px-3 pb-3 pt-2 transition-shadow duration-300", hover && "shadow-[0_0_40px_-6px_rgba(255,220,150,0.5)]")}>
          <div className="text-center font-system text-[8px] tracking-[0.3em] text-[#c9a227]">ГОСТИ</div>
          <div className="mt-1 grid grid-cols-4 gap-x-2 gap-y-1.5">
            {KEYS.map((c, i) => (
              <motion.span key={c} className="relative mx-auto block h-7 w-2.5 origin-top" animate={hover ? { rotate: [0, i % 2 ? 14 : -14, i % 2 ? -8 : 8, 0] } : { rotate: 0 }} transition={{ duration: 1, delay: i * 0.04 }}>
                <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-2" style={{ borderColor: c }} />
                <span className="absolute left-1/2 top-2.5 h-4 w-0.5 -translate-x-1/2" style={{ background: c }} />
              </motion.span>
            ))}
          </div>
        </div>
        {/* стойка */}
        <div className="mt-6 h-3 rounded-t-sm bg-gradient-to-b from-[#d9b65a] to-[#7a5c16]" />
        <div className="relative h-[120px] bg-gradient-to-b from-[#5a3a1e] to-[#2a170a] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-3 border border-[#2a170a]/70 bg-[#4a2e16]/60" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-gradient-to-b from-[#f3d98a] to-[#8a6420] px-3 py-0.5 font-display text-[13px] font-semibold tracking-[0.2em] text-[#2a1f0a]">РЕГИСТРАЦИЯ</div>
        </div>
        <div className="absolute inset-x-0 top-full mt-5 text-center">
          <div className={cn("font-display text-[15px] transition-colors", hover ? "text-[#f3d98a]" : "text-[#e9e1d0]/75")}>Гости и досье</div>
          <div className="mt-0.5 font-system text-[9px] uppercase tracking-widest opacity-45">8 пропусков</div>
        </div>
      </div>
    </Link>
  );
}
