"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useRoom } from "./state";
import { cn } from "@/lib/utils";

/**
 * Ночная партия с «другой Ари» (гл. 21). Правила из книги:
 * Гаин бьёт атакующими картами по её защите и жизненной силе; она каждым ходом уничтожает карту Жертвы.
 * Она побеждает, уничтожив 6 из 8 карт Жертвы. Гаин побеждает, сведя её силу к нулю, — и это почти невозможно.
 * Ничья: самому разрушить три карты Жертвы или больше, тогда шести ей уже не набрать.
 * В книге Гаин проиграл пять партий подряд и свёл шестую.
 */
type Card = "up" | "ari" | "me";
const LIFE = 20;
const fresh = (): Card[] => Array(8).fill("up");

const TALK = [
  "Сыграем? Правила простые. И, честно говоря, они в мою пользу.",
  "Ещё раз.",
  "С чего ты взял, что если проиграешь, то умрёшь? Можно выжить, даже сыграв вничью.",
  "Не думай о лодке. Думай о картах. Чтобы победить, надо свести мою силу к нулю. Для ничьей есть способ попроще.",
  "Ты всё ещё бьёшь меня. Посмотри, что лежит на столе.",
];

export function Cards() {
  const { draw, setDraw } = useRoom();
  const [sac, setSac] = useState<Card[]>(fresh);
  const [life, setLife] = useState(LIFE);
  const [busy, setBusy] = useState(false);
  const [losses, setLosses] = useState(0);
  const [end, setEnd] = useState<null | "lose" | "draw" | "win">(null);
  const [hit, setHit] = useState(0);

  const ariCount = sac.filter((c) => c === "ari").length;
  const meCount = sac.filter((c) => c === "me").length;

  // ход Ари: уничтожает одну из оставшихся карт Жертвы
  useEffect(() => {
    if (!busy || end) return;
    const id = setTimeout(() => {
      setSac((s) => {
        const up = s.map((c, i) => (c === "up" ? i : -1)).filter((i) => i >= 0);
        if (!up.length) return s;
        const k = up[(s.filter((c) => c !== "up").length * 3) % up.length];
        return s.map((c, i) => (i === k ? "ari" : c));
      });
      setBusy(false);
    }, 700);
    return () => clearTimeout(id);
  }, [busy, end]);

  // исход
  useEffect(() => {
    if (end || busy) return;
    if (life <= 0) setEnd("win");
    else if (ariCount >= 6) {
      setEnd("lose");
      setLosses((l) => l + 1);
    } else if (!sac.includes("up")) {
      setEnd("draw");
      setDraw(true);
    }
  }, [sac, life, ariCount, busy, end, setDraw]);

  const attack = () => {
    if (busy || end) return;
    setLife((l) => l - 2); // остальное съедают её защитные карты
    setHit((h) => h + 1);
    setBusy(true);
  };
  const breakCard = (i: number) => {
    if (busy || end || sac[i] !== "up") return;
    setSac((s) => s.map((c, k) => (k === i ? "me" : c)));
    setBusy(true);
  };
  const again = () => {
    setSac(fresh());
    setLife(LIFE);
    setEnd(null);
    setBusy(false);
  };

  return (
    <section className="relative overflow-hidden text-[#e6dcc6]">
      <div className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#c9b27a]">НОЧЬ ТРЕТЬЕГО ДНЯ · ГЛ. 21</div>
        <h2 className="mt-2 font-display text-5xl md:text-6xl">Партия</h2>
        <p className="mt-4 max-w-2xl font-display text-[19px] leading-relaxed opacity-85">За окном буря и жуткий лунный свет. К Гаину приходит Ари, но говорит она чужим, жёстким голосом. У неё колода.</p>

        {/* она */}
        <div className="mt-10 flex items-center gap-5">
          <div className="relative h-28 w-[84px] shrink-0 overflow-hidden border border-black">
            <Image src="/art/people/kim-ari.jpg" alt="Другая Ари" fill sizes="84px" unoptimized className="object-cover brightness-75 contrast-125" />
            <motion.span key={hit} className="absolute inset-0 bg-[#c0333d]" initial={{ opacity: hit ? 0.6 : 0 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-2xl">«Другая Ари»</div>
            <div className="mt-1 flex items-center gap-2 font-system text-[11px]">
              <span className="opacity-60">жизненная сила</span>
              <div className="h-2 w-48 bg-white/10">
                <div className="h-full bg-[#c0333d] transition-all duration-300" style={{ width: `${(Math.max(0, life) / LIFE) * 100}%` }} />
              </div>
              <span>{Math.max(0, life)}</span>
              <span className="ml-3 opacity-60">уничтожила жертв</span>
              <span className={cn(ariCount >= 5 && "text-[#ff8a8a]")}>{ariCount}/6</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={`${losses}${end}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="mt-2 font-hand text-[24px] leading-tight text-[#f0c9c9]">
                {end === "draw" ? "Вот. Теперь ты понял, что я хотела сказать." : end === "lose" ? "Шесть. Партия моя." : TALK[Math.min(losses, TALK.length - 1)]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* стол: восемь карт Жертвы */}
        <div className="mt-8 rounded-sm border border-[#3a2a16] bg-[#1a120b] p-5 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]">
          <div className="font-system text-[10px] uppercase tracking-widest opacity-55">карты Жертвы · их восемь</div>
          <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {sac.map((c, i) => (
              <motion.button
                key={i}
                onClick={() => breakCard(i)}
                disabled={c !== "up" || busy || !!end}
                whileHover={c === "up" && !busy && !end ? { y: -6 } : undefined}
                animate={c === "ari" ? { rotate: [0, -6, 4, 0], opacity: 0.45 } : c === "me" ? { rotate: 8, opacity: 0.7 } : { rotate: 0, opacity: 1 }}
                aria-label={c === "up" ? `Разрушить карту Жертвы ${i + 1}` : `Карта ${i + 1} выбыла`}
                className={cn(
                  "relative aspect-[5/7] border-2 font-display text-3xl",
                  c === "up" ? "cursor-pointer border-[#c9b27a] bg-gradient-to-b from-[#efe6cf] to-[#c9b98f] text-[#2a2218]" : c === "ari" ? "border-[#c0333d] bg-[#2a0d10] text-[#c0333d]" : "border-[#c9b27a]/60 bg-[#2a2416] text-[#c9b27a]",
                )}
              >
                {c === "up" ? "☩" : c === "ari" ? "✕" : "⌁"}
                <span className="absolute inset-x-0 bottom-1 font-system text-[8px] uppercase tracking-wider">{c === "up" ? "жертва" : c === "ari" ? "её рукой" : "вами"}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={attack} disabled={busy || !!end} className="border border-[#c0333d] px-5 py-2 font-display text-lg text-[#ffb0b0] transition hover:bg-[#c0333d]/20 disabled:opacity-30">
              Атаковать её
            </button>
            <span className="font-system text-[11px] opacity-55">или нажмите на карту Жертвы, чтобы разрушить её самому</span>
            <span className="ml-auto font-system text-[11px] opacity-70">
              разрушено вами: {meCount} · проиграно партий: {losses}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {end && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("mt-6 border p-5", end === "draw" ? "border-[#c9b27a]/60 bg-[#1c1812]" : "border-[#c0333d]/50 bg-[#1a0c0d]")}>
              {end === "draw" ? (
                <>
                  <div className="font-system text-[11px] uppercase tracking-[0.3em] text-[#c9b27a]">Ничья</div>
                  <p className="mt-2 font-display text-[19px] leading-relaxed">
                    Шести жертв ей уже не набрать. Гаин проиграл пять партий подряд, прежде чем это увидел: одолеть её нельзя, но можно отнять у ритуала жертвы. Отель потом назовёт эту стратегию верной: убить жертву вместо дьявола.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-[19px] leading-relaxed">{end === "win" ? "Её сила на нуле. В книге так не вышло ни разу." : "Она уничтожила шесть карт из восьми. По этим правилам её не перебить."}</p>
                  <button onClick={again} className="mt-3 border border-white/30 px-5 py-1.5 font-display text-lg hover:bg-white/10">
                    Ещё партию
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {draw && !end && <p className="mt-4 font-system text-[11px] text-[#c9b27a]">Ничья уже была сыграна.</p>}
      </div>
    </section>
  );
}
