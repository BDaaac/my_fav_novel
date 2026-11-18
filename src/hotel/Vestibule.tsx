"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Вестибюль как главное меню игры: слева пункты, справа сцена выбранного пункта.
 * Управление мышью или клавишами: ↑↓ — выбор, Enter — войти, ←→ — листать двери, Esc — назад.
 */
export type RoomDoor = { id: string; title: string; type: string; solved: boolean; runs: number };
type Kind = "curse" | "mission" | "rest" | "locked";
type Door = { n: string; href: string | null; kind: Kind; title: string; solved: boolean; runs: number };
type View = "menu" | "rooms" | "lift";

const GLOW: Record<Kind, string> = { curse: "#c0333d", mission: "#3a8fd6", rest: "#7fd4ff", locked: "#111" };
const KIND_LABEL: Record<Kind, string> = { curse: "Комната Проклятий", mission: "Комната Миссий", rest: "Комната Отдыха", locked: "Закрыто" };
const MENU = [
  { id: "rooms", label: "Номера", hint: "Семь дверей первого этажа. За каждой свой мир и свой конец света." },
  { id: "lift", label: "Лифт", hint: "Три этажа. Кнопки второго и третьего пока не нажимаются." },
  { id: "dining", label: "Столовая", hint: "Завтрак в 7:00, обед в 12:00, ужин в 19:00. Персонал очень застенчив." },
  { id: "guests", label: "Гости", hint: "Восемь пропусков на стойке регистрации. В каждом досье." },
] as const;
const FACES = ["han-gain", "kim-ari", "elena-ivanova", "cha-jinchul", "yu-sonyi"];

export function Vestibule({ rooms }: { rooms: RoomDoor[] }) {
  const router = useRouter();
  const [view, setView] = useState<View>("menu");
  const [sel, setSel] = useState(0);
  const [door, setDoor] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [denied, setDenied] = useState(0);

  const byId = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const doors: Door[] = ["101", "102", "103", "104", "105", "106", "107"].map((n) => {
    const r = byId[n];
    if (n === "105") return { n, href: "/room/105", kind: "rest", title: "Комната Отдыха", solved: false, runs: 0 };
    if (!r) return { n, href: null, kind: "locked", title: "□□□", solved: false, runs: 0 };
    return { n, href: n === "101" ? "/archive/101" : `/room/${n}`, kind: r.type === "mission" ? "mission" : "curse", title: r.title.split(" / ")[0], solved: r.solved, runs: r.runs };
  });

  const go = useCallback(
    (href: string | null) => {
      if (!href) return setDenied((d) => d + 1);
      setLeaving(true);
      setTimeout(() => router.push(href), 450);
    },
    [router],
  );
  const pick = useCallback(
    (i: number) => {
      const id = MENU[i].id;
      if (id === "rooms") setView("rooms");
      else if (id === "lift") setView("lift");
      else go(id === "dining" ? "/dining" : "/archive/people");
    },
    [go],
  );

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (leaving) return;
      if (view === "menu") {
        if (e.key === "ArrowDown") setSel((s) => (s + 1) % MENU.length);
        else if (e.key === "ArrowUp") setSel((s) => (s + MENU.length - 1) % MENU.length);
        else if (e.key === "Enter") pick(sel);
        else return;
      } else if (e.key === "Escape" || e.key === "Backspace") setView("menu");
      else if (view === "rooms") {
        if (e.key === "ArrowRight") setDoor((d) => Math.min(doors.length - 1, d + 1));
        else if (e.key === "ArrowLeft") setDoor((d) => Math.max(0, d - 1));
        else if (e.key === "Enter") go(doors[door].href);
        else return;
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [view, sel, door, doors, leaving, pick, go]);

  const current = MENU[sel].id;
  return (
    <main className="relative h-screen min-h-[640px] overflow-hidden bg-[#0b0a09] text-[#e9e1d0]">
      {/* зал: обои, свет двух люстр, виньетка */}
      <div className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(90deg,transparent_0_58px,rgba(201,162,39,0.045)_58px_60px),radial-gradient(ellipse_at_70%_0%,rgba(255,214,140,0.2),transparent_50%),linear-gradient(#1c0d0f,#0d0707)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] [background:linear-gradient(#3a0f14,#12060a)] [box-shadow:inset_0_6px_0_#4a3620]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_30%,rgba(0,0,0,0.75))]" />

      {/* окно статуса отеля */}
      <div className="absolute right-6 top-6 z-10 border border-[#7fd4ff]/50 bg-[#06141c]/85 px-3 py-2 font-system text-[12px] text-[#7fd4ff] shadow-[0_0_24px_-8px_#7fd4ff]">
        [Пользователь: гость · Уровень 1, вестибюль]
        <AnimatePresence>
          {denied > 0 && (
            <motion.div key={denied} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 2.6 }} className="mt-1 text-[#ff8a8a]">
              [Доступ закрыт: □□□]
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative grid h-full grid-cols-1 md:grid-cols-[minmax(330px,36%)_1fr]">
        {/* левая колонка: название и меню */}
        <div className="relative z-10 flex flex-col justify-center px-8 md:px-14">
          <div className="font-system text-[11px] tracking-[0.5em] text-[#c9a227]">ОТЕЛЬ</div>
          <h1 className="bg-gradient-to-b from-[#f3d98a] to-[#8a6420] bg-clip-text pr-2 font-display text-[clamp(3rem,5.6vw,5.4rem)] font-semibold leading-none tracking-[0.06em] text-transparent">ПИОНЕР</h1>
          <div className="mt-1 font-display text-[18px] italic opacity-55">Побег из отеля с привидениями</div>

          <nav className="mt-10">
            {MENU.map((m, i) => {
              const on = view === "menu" ? sel === i : MENU[sel].id === m.id;
              return (
                <button
                  key={m.id}
                  onMouseEnter={() => view === "menu" && setSel(i)}
                  onClick={() => {
                    setSel(i);
                    pick(i);
                  }}
                  className={cn("group relative flex w-full items-baseline gap-4 py-2 text-left transition-all duration-200", on ? "pl-6 text-[#f3d98a]" : "pl-0 text-[#e9e1d0]/55 hover:text-[#e9e1d0]", view !== "menu" && !on && "opacity-30")}
                >
                  {on && <motion.span layoutId="cursor" className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 bg-[#f3d98a] shadow-[0_0_10px_#f3d98a]" />}
                  <span className="font-system text-[11px] opacity-60">0{i + 1}</span>
                  <span className="font-display text-4xl tracking-[0.06em] md:text-5xl">{m.label}</span>
                </button>
              );
            })}
          </nav>
          <p className="mt-6 h-12 max-w-sm font-display text-[17px] leading-snug opacity-65">{MENU[sel].hint}</p>

          <div className="mt-6 font-system text-[10px] tracking-widest opacity-40">
            {view === "menu" ? "↑ ↓ ВЫБОР · ENTER ВОЙТИ" : view === "rooms" ? "← → ДВЕРЬ · ENTER ВОЙТИ · ESC НАЗАД" : "ESC НАЗАД"}
          </div>
        </div>

        {/* правая часть: сцена выбранного пункта */}
        <div className="relative hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div key={view === "menu" ? current : view} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center justify-center">
              {view === "rooms" ? (
                <RoomsStage doors={doors} door={door} setDoor={setDoor} go={go} back={() => setView("menu")} />
              ) : view === "lift" ? (
                <LiftStage onFloor1={() => setView("rooms")} deny={() => setDenied((d) => d + 1)} back={() => setView("menu")} open />
              ) : current === "rooms" ? (
                <div className="flex items-end gap-5 opacity-90" onClick={() => pick(0)}>
                  {doors.slice(0, 4).map((d, i) => (
                    <DoorLeaf key={d.n} d={d} h={260 - i * 26} ajar={i === 0} />
                  ))}
                </div>
              ) : current === "lift" ? (
                <LiftStage onFloor1={() => pick(1)} deny={() => {}} back={() => {}} />
              ) : current === "dining" ? (
                <DiningStage />
              ) : (
                <GuestsStage />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* уход со сцены */}
      <motion.div className="pointer-events-none absolute inset-0 z-20 bg-black" animate={{ opacity: leaving ? 1 : 0 }} transition={{ duration: 0.4 }} />
    </main>
  );
}

/** Створка двери номера. */
function DoorLeaf({ d, h, ajar, big }: { d: Door; h: number; ajar?: boolean; big?: boolean }) {
  const locked = d.kind === "locked";
  return (
    <div className="relative" style={{ width: h * 0.46 }}>
      <div className={cn("mx-auto h-2.5 w-6 rounded-b-full transition-all duration-300", ajar && !locked ? "bg-[#ffe6a8] shadow-[0_0_34px_14px_rgba(255,220,150,0.45)]" : "bg-[#5a4a2a]")} />
      <div className="relative mt-2 border-[6px] border-b-0 border-[#3a2a16] bg-black [perspective:800px]" style={{ height: h }}>
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: ajar && !locked ? 1 : 0, background: `radial-gradient(ellipse at 20% 60%, ${GLOW[d.kind]}, #000 78%)` }} />
        <motion.div className="absolute inset-0 origin-right bg-gradient-to-b from-[#6b4526] to-[#3d2512] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]" animate={{ rotateY: ajar && !locked ? (big ? 34 : 22) : 0 }} transition={{ type: "spring", stiffness: 110, damping: 14 }}>
          <div className="absolute inset-x-[12%] top-[22%] h-[32%] border border-[#2a170a]/70 bg-[#5a3a1e]/60" />
          <div className="absolute inset-x-[12%] bottom-[6%] h-[30%] border border-[#2a170a]/70 bg-[#5a3a1e]/60" />
          <div className="absolute left-1/2 top-[5%] -translate-x-1/2 rounded-sm bg-gradient-to-b from-[#f3d98a] to-[#8a6420] px-2.5 py-0.5 font-display font-semibold text-[#2a1f0a] shadow" style={{ fontSize: h * 0.075 }}>
            {d.n}
          </div>
          <span className="absolute left-[9%] top-1/2 h-3 w-3 rounded-full bg-[#c9a227] shadow-[0_2px_3px_rgba(0,0,0,0.6)]" />
          {locked && <div className="absolute inset-x-0 top-[46%] -rotate-6 bg-[#1a1408]/85 py-1 text-center font-system text-[10px] tracking-[0.3em] text-[#c9a227]">ЗАКРЫТО</div>}
          {d.solved && <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 -rotate-12 border-2 border-[#c0333d]/80 px-1.5 font-system text-[10px] tracking-widest text-[#ff8a8a]">РЕШЕНА</div>}
        </motion.div>
      </div>
    </div>
  );
}

/** Выбор двери: текущая крупно по центру, соседние уходят в стороны. */
function RoomsStage({ doors, door, setDoor, go, back }: { doors: Door[]; door: number; setDoor: (n: number) => void; go: (href: string | null) => void; back: () => void }) {
  const d = doors[door];
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="relative flex h-[440px] w-full items-end justify-center">
        {doors.map((x, i) => {
          const off = i - door;
          if (Math.abs(off) > 2) return null;
          return (
            <motion.button
              key={x.n}
              onClick={() => (off === 0 ? go(x.href) : setDoor(i))}
              aria-label={`Номер ${x.n}: ${x.title}`}
              className="absolute bottom-0"
              animate={{ x: off * 230, scale: off === 0 ? 1 : 0.62 - Math.abs(off) * 0.08, opacity: off === 0 ? 1 : 0.5 - (Math.abs(off) - 1) * 0.25, zIndex: 5 - Math.abs(off) }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              style={{ transformOrigin: "bottom center" }}
            >
              <DoorLeaf d={x} h={380} ajar={off === 0} big />
            </motion.button>
          );
        })}
      </div>
      <div className="h-2 w-[80%] bg-gradient-to-r from-transparent via-[#4a3620] to-transparent" />
      <AnimatePresence mode="wait">
        <motion.div key={d.n} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mt-5 text-center">
          <div className="font-system text-[11px] uppercase tracking-[0.3em]" style={{ color: d.kind === "locked" ? "#8a7a5a" : GLOW[d.kind] }}>
            № {d.n} · {KIND_LABEL[d.kind]}
            {d.runs > 1 && ` · заходов: ${d.runs}`}
          </div>
          <div className="mt-1 font-display text-4xl">{d.title}</div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 flex items-center gap-3 font-system text-[12px]">
        <button onClick={() => setDoor(Math.max(0, door - 1))} disabled={door === 0} className="border border-white/20 px-3 py-1.5 hover:bg-white/10 disabled:opacity-25">
          ←
        </button>
        <button onClick={() => go(d.href)} className={cn("border px-6 py-1.5 tracking-widest", d.href ? "border-[#f3d98a] text-[#f3d98a] hover:bg-[#f3d98a]/15" : "border-white/20 opacity-50")}>
          {d.href ? "ВОЙТИ" : "ЗАПЕРТО"}
        </button>
        <button onClick={() => setDoor(Math.min(doors.length - 1, door + 1))} disabled={door === doors.length - 1} className="border border-white/20 px-3 py-1.5 hover:bg-white/10 disabled:opacity-25">
          →
        </button>
        <button onClick={back} className="ml-4 opacity-50 hover:opacity-100">
          назад
        </button>
      </div>
    </div>
  );
}

/** Лифт: указатель этажа, створки и панель с кнопками. Работает только первый этаж. */
function LiftStage({ onFloor1, deny, back, open }: { onFloor1: () => void; deny: () => void; back: () => void; open?: boolean }) {
  const [shake, setShake] = useState(0);
  return (
    <div className="flex items-end gap-8">
      <div className="relative w-[300px]">
        {/* указатель этажа */}
        <svg viewBox="0 0 120 66" className="mx-auto h-[66px] w-[120px]" aria-hidden>
          <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#c9a227" strokeWidth="2" />
          {["1", "2", "3"].map((n, i) => (
            <text key={n} x={[24, 60, 96][i]} y={[44, 26, 44][i]} textAnchor="middle" fontSize="13" fill="#e9e1d0" opacity={i ? 0.3 : 1} fontFamily="serif">
              {n}
            </text>
          ))}
          <g style={{ transformBox: "view-box", transformOrigin: "60px 60px", transform: "rotate(-58deg)" }}>
            <line x1="60" y1="60" x2="60" y2="18" stroke="#f3d98a" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <circle cx="60" cy="60" r="5" fill="#c9a227" />
        </svg>
        {/* шахта и створки */}
        <div className="relative mt-2 h-[380px] overflow-hidden border-[8px] border-b-0 border-[#6a5a3a] bg-[#0a0705] shadow-[0_0_0_2px_#2a2216]">
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_50%_30%,#ffe6a8_0%,#6a4a1a_45%,#0a0705_85%)]" style={{ opacity: open ? 0.9 : 0.25 }} />
          {[0, 1].map((side) => (
            <motion.div
              key={side}
              className={cn("absolute inset-y-0 w-1/2 bg-gradient-to-b from-[#8a7a5a] via-[#5a4c34] to-[#2e2618] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.6)]", side ? "right-0" : "left-0")}
              animate={{ x: open ? (side ? "86%" : "-86%") : 0 }}
              transition={{ duration: 0.9, ease: [0.6, 0, 0.2, 1] }}
            >
              <div className="absolute inset-3 border border-black/40 [background:repeating-linear-gradient(45deg,transparent_0_10px,rgba(0,0,0,0.12)_10px_11px)]" />
            </motion.div>
          ))}
        </div>
      </div>
      {/* панель кнопок */}
      <motion.div key={shake} animate={shake ? { x: [0, -6, 6, -3, 0] } : {}} transition={{ duration: 0.35 }} className="mb-6 rounded-md border border-[#3a2c12] bg-gradient-to-b from-[#d9b65a] via-[#b08a2e] to-[#7a5c16] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.6)]">
        <div className="text-center font-system text-[9px] tracking-[0.35em] text-[#3a2c12]">ЭТАЖ</div>
        <div className="mt-2 flex flex-col gap-3">
          {[3, 2, 1].map((f) => (
            <button
              key={f}
              onClick={() => {
                if (f === 1) return onFloor1();
                setShake((s) => s + 1);
                deny();
              }}
              aria-label={f === 1 ? "Первый этаж: номера" : `Этаж ${f} закрыт`}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border-2 font-display text-2xl shadow-[inset_0_-3px_6px_rgba(0,0,0,0.45)] transition",
                f === 1 ? "border-[#fff3c4] bg-[#2a1f0a] text-[#ffe6a8] shadow-[0_0_18px_#ffe6a8,inset_0_-3px_6px_rgba(0,0,0,0.45)] hover:brightness-125" : "border-[#4a3810] bg-[#2a1f0a] text-[#8a7a5a]",
              )}
            >
              {f === 1 ? "1" : "□"}
            </button>
          ))}
        </div>
        {open && (
          <button onClick={back} className="mt-3 w-full font-system text-[10px] tracking-widest text-[#3a2c12] underline">
            выйти
          </button>
        )}
      </motion.div>
    </div>
  );
}

function DiningStage() {
  return (
    <div className="relative w-[360px]">
      <div className="mx-auto w-fit rounded-t-md bg-gradient-to-b from-[#d9b65a] to-[#7a5c16] px-6 py-1 font-display text-xl font-semibold tracking-[0.25em] text-[#2a1f0a]">СТОЛОВАЯ</div>
      <div className="relative h-[400px] border-[8px] border-b-0 border-[#3a2a16] bg-black [perspective:900px]">
        <div className="absolute inset-0 [background:radial-gradient(ellipse_at_50%_75%,#ffd9a0,#5a3410_55%,#000_92%)]" />
        {/* накрытый стол, пока никто не смотрит */}
        <div className="absolute bottom-10 left-1/2 h-3 w-40 -translate-x-1/2 rounded-full bg-[#fff3d6]/80 blur-[1px]" />
        {[0, 1].map((side) => (
          <motion.div key={side} className={cn("absolute inset-y-0 w-1/2 bg-gradient-to-b from-[#6b4526] to-[#3d2512] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.5)]", side ? "right-0 origin-right" : "left-0 origin-left")} initial={{ rotateY: 0 }} animate={{ rotateY: side ? 38 : -38 }} transition={{ type: "spring", stiffness: 70, damping: 13, delay: 0.15 }}>
            <div className="absolute inset-x-4 top-6 h-[42%] rounded-t-full border border-[#2a170a] bg-[#ffd9a0]/15" />
            <div className="absolute inset-x-4 bottom-5 h-[30%] border border-[#2a170a]/70 bg-[#5a3a1e]/60" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GuestsStage() {
  return (
    <div className="relative h-[460px] w-[560px]">
      <div className="absolute inset-x-6 top-6 h-3 rounded-full bg-gradient-to-b from-[#6a5a3a] to-[#2a2216] shadow-[0_6px_14px_rgba(0,0,0,0.6)]" />
      {FACES.map((id, i) => (
        <motion.div
          key={id}
          className="absolute top-8 w-[150px] origin-top"
          style={{ left: 20 + i * 96, zIndex: i === 2 ? 5 : 3 - Math.abs(i - 2) }}
          initial={{ rotate: (i - 2) * 9, y: -30, opacity: 0 }}
          animate={{ rotate: [(i - 2) * 4 - 2, (i - 2) * 4 + 2], y: Math.abs(i - 2) * 14, opacity: 1 }}
          transition={{ rotate: { duration: 2.4 + i * 0.3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }, y: { duration: 0.5, delay: i * 0.06 }, opacity: { duration: 0.4, delay: i * 0.06 } }}
        >
          <div className="mx-auto h-8 w-2.5 bg-gradient-to-b from-[#1b1712] to-[#3a3226]" />
          <div className="overflow-hidden rounded-md border border-black/60 bg-[#1a1512] shadow-[0_18px_30px_rgba(0,0,0,0.65)]">
            <div className="bg-black/50 px-2 py-0.5 font-display text-[11px] font-semibold tracking-[0.25em] text-[#c9a227]">ПИОНЕР</div>
            <div className="relative aspect-[3/4]">
              <Image src={`/art/people/${id}.jpg`} alt="" fill sizes="150px" unoptimized className="object-cover" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
