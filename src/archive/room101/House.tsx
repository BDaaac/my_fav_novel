"use client";
import { useEffect, useState } from "react";
import Noise from "@/components/Noise";
import { AnimatePresence, motion } from "motion/react";
import { RUN2, nameOf } from "./data";
import { Ch, useInfection } from "./infection";
import { Mad } from "./mad";
import { RunHeader } from "./Home";
import { cn } from "@/lib/utils";

const ESCAPED = new Set(["han-gain", "park-seungyeop", "cha-jinchul", "yu-sonyi"]);
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
      {/* комната ночью: свет только от телевизора */}
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

        <h4 className="mt-20 font-system text-xs uppercase tracking-[0.3em] text-[#8fb0ff]">Кто где проснулся · откройте дверь</h4>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {RUN2.team.map((id) => (
            <Door key={id} id={id} role={RUN2.roles?.find((r) => r.who === id)?.role ?? "в своём доме, с «семьёй»"} />
          ))}
        </div>

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

        <ol className="mt-20 space-y-6 border-l border-[#8fb0ff]/30 pl-6">
          {RUN2.acts.map((a) => (
            <li key={a.title} className="relative">
              <span className="absolute -left-[29px] top-3 h-2 w-2 rounded-full bg-[#8fb0ff] shadow-[0_0_10px_#8fb0ff]" />
              <div className="font-display text-2xl text-[#f0e8d6]">
                <Mad as="span" text={a.title} />
                <Ch n={a.ch[0] === a.ch[1] ? a.ch[0] : `${a.ch[0]}–${a.ch[1]}`} />
              </div>
              <Mad text={a.text} className="font-display text-[17px] leading-relaxed text-[#c9c2b2]" />
            </li>
          ))}
        </ol>
        <Mad className="mt-10 max-w-3xl font-display text-[19px] italic text-[#c9c2b2]" text={RUN2.outcome.text} />
      </div>
    </section>
  );
}

/** Телевизор в гостиной: улыбающийся ведущий над кровавым шоу. */
function LivingTv() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="rounded-[30px] bg-gradient-to-b from-[#3a332d] to-[#1a1613] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#0b1430] shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]">
          <Noise opacity={0.12} scanlines={0.5} flicker={0.4} />
          <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full">
            <rect width="400" height="300" fill="#1b2f6e" />
            <rect y="200" width="400" height="100" fill="#3a0a14" />
            {/* ведущий */}
            <g transform="translate(200 210)">
              <path d="M-60 90 Q-64 -10 0 -20 Q64 -10 60 90 Z" fill="#101626" />
              <ellipse cx="0" cy="-60" rx="34" ry="40" fill="#d9c0a0" />
              <path d="M-20 -48 Q0 -26 20 -48" stroke="#5a0a0e" strokeWidth="4" fill="#fff" />
              <circle cx="-12" cy="-68" r="3.5" fill="#111" />
              <circle cx="12" cy="-68" r="3.5" fill="#111" />
            </g>
            <rect x="0" y="252" width="400" height="48" fill="#c0333d" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <Ticker />
          </div>
          <div className="absolute left-3 top-3 bg-[#c0333d] px-2 font-system text-[11px] font-bold text-white">ABS</div>
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

function Door({ id, role }: { id: string; role: string }) {
  const [open, setOpen] = useState(false);
  const escaped = ESCAPED.has(id);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className={cn(
        "relative h-56 rounded-t-[40px] border-4 text-left transition",
        open ? "border-[#5a4a3a] bg-[#0b0d14] shadow-[inset_0_0_40px_rgba(143,176,255,0.25)]" : "border-[#2a1d14] bg-gradient-to-b from-[#5a3d26] to-[#3a2616] hover:brightness-110",
      )}
    >
      {!open ? (
        <div className="flex h-full flex-col justify-between p-3">
          <span className="font-system text-[11px] text-[#e9d9b8]">{nameOf(id).split(" (")[0]}</span>
          <span className="ml-auto h-3 w-3 rounded-full bg-[#c9a227]" />
          <span className="font-hand text-lg text-[#e9d9b8]/70">дом</span>
        </div>
      ) : (
        <div className="flex h-full flex-col justify-between p-3">
          <p className="font-display text-[14px] leading-snug">{role}</p>
          <span className={cn("font-system text-[10px] uppercase tracking-wider", escaped ? "text-[#7fd4a0]" : "text-[#ff8a8a]")}>
            {escaped ? "сбежал(а) с первой попытки" : `застрял(а): ${STUCK_WHY[id] ?? ""}`}
          </span>
        </div>
      )}
    </button>
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
