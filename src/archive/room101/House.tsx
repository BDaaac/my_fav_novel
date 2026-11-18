"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RUN2, nameOf } from "./data";
import { Ch, N, useInfection } from "./infection";
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
    <div className="relative overflow-hidden rounded-sm bg-[#1a1d24] px-6 py-8 text-[#d8d2c4] md:px-10">
      {/* мертвенно-синий свет экрана */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#3a6cff]/20 blur-3xl" />
      <Ticker />
      <p className="mt-6 max-w-2xl font-display text-lg leading-relaxed">
        Каждый у себя дома, среди заражённой «семьи». Похоже на Корею в пандемию, но здравый смысл перевёрнут: по ТВ показывают людоедство и бои на ножах, и все считают это <N a="безумием" b="развлечением" />.
        <Ch n={64} />
      </p>

      <h4 className="mt-8 font-system text-xs uppercase tracking-[0.25em] text-[#8fb0ff]">Кто где проснулся</h4>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {RUN2.team.map((id) => (
          <Door key={id} id={id} role={RUN2.roles?.find((r) => r.who === id)?.role ?? "в своём доме, с «семьёй»"} />
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <EscapeTimer />
        <div className="border border-[#8fb0ff]/25 bg-black/20 p-4">
          <h4 className="font-system text-xs uppercase tracking-[0.25em] text-[#8fb0ff]">Улики</h4>
          <ul className="mt-3 space-y-2 font-display text-[15px] leading-snug">
            {RUN2.god.facts.map((f, i) => (
              <li key={i}>
                — {f.text}
                <Ch n={f.ch ?? ""} />
              </li>
            ))}
            <li>
              — Первыми сошли с ума шоу ABS. Гаин едет туда на такси вместе с заражённой сестрой.
              <Ch n="64–65" />
            </li>
          </ul>
        </div>
      </div>

      <h4 className="mt-10 font-system text-xs uppercase tracking-[0.25em] text-[#8fb0ff]">Ход событий</h4>
      <ol className="mt-3 space-y-4 border-l border-[#8fb0ff]/30 pl-5">
        {RUN2.acts.map((a) => (
          <li key={a.title} className="relative">
            <span className="absolute -left-[25px] top-2 h-2 w-2 rounded-full bg-[#8fb0ff]" />
            <div className="font-display text-xl text-[#f0e8d6]">
              {a.title}
              <Ch n={a.ch[0] === a.ch[1] ? a.ch[0] : `${a.ch[0]}–${a.ch[1]}`} />
            </div>
            <p className="font-display text-[15px] leading-snug text-[#c9c2b2]">{a.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 border-t border-[#8fb0ff]/20 pt-4 font-display text-[15px] italic text-[#c9c2b2]">
        {RUN2.outcome.text}
        <Ch n={RUN2.outcome.ch ?? 66} />
      </p>
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
        "relative h-40 border text-left transition [perspective:600px]",
        open ? "border-[#8fb0ff]/50 bg-[#232838]" : "border-[#5a4a3a] bg-[#3a2c22] hover:bg-[#45352a]",
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
