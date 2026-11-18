"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Noise from "@/components/Noise";
import { AnimatePresence, motion } from "motion/react";
import { RUN2, nameOf } from "./data";
import { Ch, useInfection } from "./infection";
import { Mad } from "./mad";
import { RunHeader } from "./Home";
import { cn } from "@/lib/utils";

const ESCAPED = new Set(["han-gain", "park-seungyeop", "cha-jinchul", "yu-sonyi"]);
const FEMALE = new Set(["kim-ari", "yu-sonyi", "elena-ivanova", "lee-eunsol"]);
const STUCK_WHY: Record<string, string> = {
  "lee-eunsol": "дом слишком велик: не пробежать мимо слуг",
  "elena-ivanova": "дом слишком мал: одна комната с сестрой",
  "kim-mukseon": "не может отвернуться от погибших сына и внука",
  "kim-ari": "застряла в Отеле 1-го цикла, на дне бездны",
};
const HEADLINES = [
  "ABS: людоедство в прайм-тайм — рейтинги растут",
  "Бои на ножах: новый семейный досуг",
  "Ведущий улыбается. Вы тоже улыбайтесь",
  "Полиция напоминает: смеяться — это нормально",
  "Восемь месяцев назад шоу ABS ругали. Теперь их смотрят все",
];
const KNOCKS = ["Тук. Тук.", "Милый, ты куда?", "Мама сделала ужин…", "Сестра стоит за дверью с топориком", "Открой. Мы же семья.", "Почему ты не отвечаешь?"];

export function House() {
  return (
    <section className="relative overflow-hidden bg-[#14161d] text-[#d8d2c4]">
      {/* гостиная ночью (ИИ-арт): свет только от телевизора */}
      <Image src="/art/101/living.jpg" alt="" fill sizes="100vw" className="pointer-events-none object-cover opacity-35" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#14161d]/40 via-[#14161d]/80 to-[#14161d]" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-40 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[#3a6cff]/25 blur-[120px]"
        animate={{ opacity: [0.7, 1, 0.55, 0.9, 0.7] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <RunHeader n={2} ch="62–66" title="Странная семья Re" note="Возвращение спустя полсотни глав. Теперь семья смотрит телевизор." dark />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <LivingTv />
          <Mad
            className="font-display text-[20px] leading-relaxed"
            text="Каждый у себя дома, среди заражённой «семьи». Похоже на Корею в пандемию, но здравый смысл перевёрнут: по ТВ показывают людоедство и бои на ножах, и все считают это {безумием|развлечением}. Проклятие идёт не от семьи, а через эфир."
          />
        </div>

        <h4 className="mt-20 font-system text-xs uppercase tracking-[0.3em] text-[#8fb0ff]">Все восемь проснулись у себя дома · кто сумел уйти от семьи? · нажмите на окно</h4>
        <Windows />

        <div className="mt-16 grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <EscapeTimer />
          <div className="space-y-3">
            {[...RUN2.god.facts.map((f) => ({ t: f.text, ch: String(f.ch ?? "") })), { t: "Первыми сошли с ума шоу ABS. Гаин едет туда на такси вместе с заражённой сестрой.", ch: "64–65" }].map((f, i) => (
              <div key={i} className="rotate-[-0.6deg] bg-[#f3e27a] p-3 text-[#2a2410] shadow-[0_6px_14px_rgba(0,0,0,0.4)] even:rotate-[0.8deg]">
                <Mad as="div" text={f.t} className="font-hand text-[21px] leading-tight" />
                <div className="text-right font-system text-[10px] opacity-60">гл. {f.ch}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border border-[#8fb0ff]/25 bg-black/35">
          <div className="flex items-center justify-between border-b border-[#8fb0ff]/25 px-4 py-2 font-system text-[11px] uppercase tracking-[0.25em] text-[#8fb0ff]">
            <span>Программа передач · ABS</span>
            <motion.span className="text-[#ff8a8a]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
              ● в эфире
            </motion.span>
          </div>
          {RUN2.acts.map((a) => (
            <div key={a.title} className="grid gap-x-6 gap-y-1 border-b border-[#8fb0ff]/10 px-4 py-4 last:border-0 md:grid-cols-[120px_1fr]">
              <div className="font-system text-[13px] text-[#9ff5c8] [text-shadow:0_0_8px_#4fffb055]">гл. {a.ch[0] === a.ch[1] ? a.ch[0] : `${a.ch[0]}–${a.ch[1]}`}</div>
              <div>
                <Mad as="div" text={a.title} className="font-display text-2xl text-[#f0e8d6]" />
                <Mad text={a.text} className="mt-1 font-display text-[17px] leading-relaxed text-[#c9c2b2]" />
              </div>
            </div>
          ))}
        </div>
        <Mad className="mt-10 max-w-3xl font-display text-[19px] italic text-[#c9c2b2]" text={RUN2.outcome.text} />
      </div>
    </section>
  );
}

/** Телевизор в гостиной. Переключай каналы — на каждом тот же ведущий, только ближе. */
function LivingTv() {
  const [ch, setCh] = useState(0);
  const [snow, setSnow] = useState(false);
  const { add } = useInfection();
  const flip = () => {
    setSnow(true);
    add(3);
    setTimeout(() => {
      setCh((c) => c + 1);
      setSnow(false);
    }, 260);
  };
  const zoom = 1 + Math.min(ch, 6) * 0.12;
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="rounded-[30px] bg-gradient-to-b from-[#3a332d] to-[#1a1613] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#0b1430] shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]">
          <motion.div
            className="absolute inset-0"
            animate={{ scale: zoom, filter: `saturate(${1 + ch * 0.15}) hue-rotate(${-ch * 6}deg) contrast(${1 + ch * 0.05})` }}
            transition={{ type: "spring", stiffness: 40 }}
            style={{ transformOrigin: "52% 38%" }}
          >
            <Image src="/art/101/host.jpg" alt="Ведущий ABS улыбается слишком широко" fill sizes="560px" className="object-cover" />
          </motion.div>
          <Noise opacity={0.12} scanlines={0.5} flicker={0.4} />
          {snow && <div className="absolute inset-0 z-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22/></filter><rect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22/></svg>')]" />}
          <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden">
            <Ticker />
          </div>
          <div className="absolute left-3 top-3 z-10 bg-[#c0333d] px-2 font-system text-[11px] font-bold text-white">ABS</div>
          <div className="absolute right-3 top-3 z-10 font-system text-[12px] text-[#9ff5c8] [text-shadow:0_0_6px_#4fffb0]">CH {String(ch + 1).padStart(2, "0")}</div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-system text-[10px] text-[#cfc4b2]/60">
            {ch === 0 ? "Переключите канал" : ch < 4 ? "Везде ABS. Везде он." : "Других каналов нет. Улыбайтесь."}
          </span>
          <button onClick={flip} aria-label="Переключить канал" className="h-11 w-11 rounded-full bg-[#5a4f45] shadow-[inset_0_-3px_6px_rgba(0,0,0,0.5)] transition" style={{ transform: `rotate(${ch * 45}deg)` }}>
            <span className="mx-auto block h-5 w-1 bg-[#cfc4b2]" />
          </button>
        </div>
      </div>
      <div className="mx-auto h-4 w-40 rounded-b-xl bg-[#1a1613]" />
    </div>
  );
}

function Ticker() {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden border-y border-[#8fb0ff]/30 bg-black/40 py-1.5">
      <span className="z-10 shrink-0 bg-[#c0333d] px-2 font-system text-[11px] font-bold text-white">ABS · LIVE</span>
      <motion.div
        className="flex shrink-0 gap-12 whitespace-nowrap font-system text-[12px] text-[#b9c8ff]"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[...HEADLINES, ...HEADLINES].map((h, i) => (
          <span key={i}>● {h}</span>
        ))}
      </motion.div>
    </div>
  );
}

/** Ночной дом: восемь окон, за шторами мерцает телевизор. Загляни — кто там и выбрался ли. */
function Windows() {
  return (
    <div className="relative mt-4 overflow-hidden border border-black/50 bg-[#0c0e14] p-6 shadow-[inset_0_0_90px_rgba(0,0,0,0.85)] [background-image:repeating-linear-gradient(0deg,transparent_0_22px,rgba(255,255,255,0.028)_22px_23px),repeating-linear-gradient(90deg,transparent_0_58px,rgba(255,255,255,0.02)_58px_59px)] md:p-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-x-10">
        {RUN2.team.map((id, i) => (
          <HomeWindow key={id} id={id} i={i} role={RUN2.roles?.find((r) => r.who === id)?.role ?? "в своём доме, с «семьёй»"} />
        ))}
      </div>
    </div>
  );
}

function HomeWindow({ id, role, i }: { id: string; role: string; i: number }) {
  const [open, setOpen] = useState(false);
  const { add } = useInfection();
  const escaped = ESCAPED.has(id);
  const gone = open && escaped; // ушёл — свет погас
  const left = FEMALE.has(id) ? "вышла" : "вышел";
  return (
    <div>
      <button
        onClick={() => {
          if (!open && !escaped) add(3);
          setOpen((o) => !o);
        }}
        aria-label={`Окно: ${nameOf(id)}`}
        className="group relative block aspect-[4/5] w-full overflow-hidden border-[7px] border-[#1f222b] bg-[#04060a] shadow-[0_0_0_1px_#000,0_10px_30px_rgba(0,0,0,0.6)]"
      >
        {/* свет телевизора */}
        <motion.div
          className="absolute inset-0 transition-[filter] duration-1000 [background:radial-gradient(ellipse_at_50%_95%,#9fc0ff_0%,#3a6cff_30%,#12204a_65%,transparent_100%)]"
          style={{ filter: open && !escaped ? "hue-rotate(125deg) saturate(1.4)" : "none" }}
          animate={{ opacity: gone ? 0 : [0.55, 0.9, 0.4, 0.8, 0.6, 0.95, 0.55] }}
          transition={gone ? { duration: 1.2 } : { duration: 2.2 + (i % 4) * 0.7, repeat: Infinity, delay: i * 0.3 }}
        />
        {/* шторы */}
        {[0, 1].map((side) => (
          <div
            key={side}
            className={cn(
              "absolute inset-y-0 w-[48%] transition-transform duration-700 ease-out [background:repeating-linear-gradient(90deg,#2a2233_0_9px,#1c1724_9px_18px)] group-hover:brightness-125",
              side ? "right-0" : "left-0",
              open && (side ? "translate-x-[78%]" : "-translate-x-[78%]"),
            )}
            style={{ opacity: 0.8 }}
          />
        ))}
        {/* переплёт */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-[5px] -translate-x-1/2 bg-[#1f222b]" />
        <div className="pointer-events-none absolute inset-x-0 top-[38%] h-[5px] bg-[#1f222b]" />
      </button>
      <div className="mx-auto h-2 w-[108%] -translate-x-[3.7%] bg-[#1a1c24]" />
      <div className="mt-2 flex items-center justify-between font-system text-[11px] text-[#c9d2ee]/80">
        <span>{nameOf(id).split(" (")[0]}</span>
        {open && <span className={cn("h-1.5 w-1.5 rounded-full", escaped ? "bg-[#7fd4a0]" : "bg-[#ff6a6a]")} />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="mt-1.5 font-display text-[14px] leading-snug text-[#d8d2c4]">{role}</p>
            <p className={cn("mt-1 font-system text-[10px] uppercase tracking-wider", escaped ? "text-[#7fd4a0]" : "text-[#ff9a9a]")}>
              {escaped ? `${left} из дома. свет погас` : `не ${left}: ${STUCK_WHY[id] ?? ""}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Правило Re: отойти от семьи на 10 минут — это Побег (гл. 66). 1 секунда = 1 минута. */
function EscapeTimer() {
  const [t, setT] = useState<number | null>(null);
  const [result, setResult] = useState<"ok" | "fail" | null>(null);
  const { add } = useInfection();

  useEffect(() => {
    if (t === null) return;
    if (t >= 10) {
      setT(null);
      setResult("ok");
      add(-60);
      return;
    }
    const id = setTimeout(() => setT((v) => (v ?? 0) + 1), 1000);
    return () => clearTimeout(id);
  }, [t, add]);

  return (
    <div className="border border-[#8fb0ff]/25 bg-black/20 p-4">
      <h4 className="font-system text-xs uppercase tracking-[0.25em] text-[#8fb0ff]">Правило побега</h4>
      <p className="mt-2 font-display text-[15px]">
        Отойти от «семьи» на 10 минут — Побег засчитан. Гаин так и сделал: «схожу в магазин за питьём».
        <Ch n="62, 66" />
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div className="font-system text-4xl tabular-nums text-[#f0e8d6]">{String(t ?? 0).padStart(2, "0")}:00</div>
        {t === null ? (
          <button
            onClick={() => {
              setResult(null);
              setT(0);
            }}
            className="border border-[#8fb0ff] px-3 py-1.5 font-system text-xs text-[#b9c8ff] hover:bg-[#8fb0ff]/15"
          >
            Схожу в магазин за питьём
          </button>
        ) : (
          <button
            onClick={() => {
              setT(null);
              setResult("fail");
              add(10);
            }}
            className="border border-[#c0333d] px-3 py-1.5 font-system text-xs text-[#ff8a8a] hover:bg-[#c0333d]/20"
          >
            Обернуться на зов
          </button>
        )}
      </div>
      <div className="mt-3 h-8">
        <AnimatePresence mode="wait">
          {t !== null && t > 0 && (
            <motion.p key={t} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: [0, -3, 3, 0] }} exit={{ opacity: 0 }} className="font-hand text-2xl text-[#e7b0a0]">
              {KNOCKS[(t - 1) % KNOCKS.length]}
            </motion.p>
          )}
          {result === "ok" && (
            <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-system text-sm text-[#7fd4ff]">
              [Побег засчитан. Заражение снижено.]
            </motion.p>
          )}
          {result === "fail" && (
            <motion.p key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-hand text-2xl text-[#e7b0a0]">
              Вот и умница. Садись ужинать.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
