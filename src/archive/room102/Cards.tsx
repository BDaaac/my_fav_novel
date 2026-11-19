"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStage } from "@/stage/Stage";
import { useRoom } from "./state";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

/**
 * Ночная партия с «другой Ари» (гл. 21). Правила из книги:
 * Гаин бьёт атакующими картами по её защите и жизненной силе; она каждым ходом уничтожает карту Жертвы.
 * Она побеждает, уничтожив 6 из 8 карт Жертвы. Гаин побеждает, сведя её силу к нулю, — и это почти невозможно.
 * Ничья: самому разрушить три карты Жертвы или больше, тогда шести ей уже не набрать.
 * В книге Гаин проиграл пять партий подряд и свёл шестую.
 * Сцена идёт поверх арта со столом: карты лежат на столешнице рубашкой вверх, раздача и переворот — на GSAP.
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
  const table = useRef<HTMLDivElement>(null);
  const [sac, setSac] = useState<Card[]>(fresh);
  const [life, setLife] = useState(LIFE);
  const [busy, setBusy] = useState(false);
  const [losses, setLosses] = useState(0);
  const [end, setEnd] = useState<null | "lose" | "draw" | "win">(null);
  const [round, setRound] = useState(0); // новая раздача

  const ariCount = sac.filter((c) => c === "ari").length;
  const meCount = sac.filter((c) => c === "me").length;

  // раздача: карты летят из колоды у свечи на свои места
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".sac-card", { x: -520, y: -60, rotate: -40, autoAlpha: 0, duration: 0.6, ease: "power3.out", stagger: 0.07 });
        gsap.from(".ari-line", { autoAlpha: 0, y: 10, duration: 0.6, delay: 0.5, ease: "power2.out" });
      });
      return () => mm.revert();
    },
    { scope: table, dependencies: [round] },
  );

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
    }, 750);
    return () => clearTimeout(id);
  }, [busy, end]);

  // исход
  useEffect(() => {
    if (end || busy) return;
    if (life <= 0) setEnd("win");
    else if (ariCount >= 6) {
      setEnd("lose");
      setLosses((l) => l + 1);
      useStage.getState().flash();
    } else if (!sac.includes("up")) {
      setEnd("draw");
      setDraw(true);
    }
  }, [sac, life, ariCount, busy, end, setDraw]);

  const attack = () => {
    if (busy || end) return;
    setLife((l) => l - 2); // остальное съедают её защитные карты
    gsap.fromTo(".ari-face", { x: -6, filter: "brightness(2.2) saturate(2)" }, { x: 0, filter: "brightness(0.8) saturate(1)", duration: 0.45, ease: "power2.out" });
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
    setRound((r) => r + 1);
  };

  return (
    <section ref={table} className="relative flex min-h-[calc(100vh-7rem)] flex-col px-6 pt-20">
      <header className="mx-auto w-full max-w-6xl">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#c9b27a]">НОЧЬ ТРЕТЬЕГО ДНЯ · ГЛ. 21</div>
        <h2 className="mt-1 font-display text-5xl">Партия</h2>
      </header>

      {/* она сидит напротив, там, где на арте пустой стул */}
      <div className="mx-auto mt-4 flex w-full max-w-3xl flex-col items-center text-center">
        <div className="ari-face relative h-32 w-24 overflow-hidden border border-black shadow-[0_0_50px_rgba(192,51,61,0.35)] [filter:brightness(0.8)]">
          <Image src="/art/people/kim-ari.jpg" alt="Другая Ари" fill sizes="96px" unoptimized className="object-cover contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <div className="mt-2 flex items-center gap-3 font-system text-[11px] text-[#e6dcc6]">
          <span className="opacity-60">сила</span>
          <div className="h-1.5 w-40 bg-white/15">
            <div className="h-full origin-left bg-[#c0333d] transition-transform duration-300" style={{ transform: `scaleX(${Math.max(0, life) / LIFE})` }} />
          </div>
          <span>{Math.max(0, life)}</span>
          <span className={cn("ml-2", ariCount >= 5 && "text-[#ff8a8a]")}>жертв у неё: {ariCount}/6</span>
        </div>
        <p key={`${losses}${end}`} className="ari-line mt-3 min-h-[60px] max-w-xl font-hand text-[27px] leading-tight text-[#f3cfcf] [text-shadow:0_2px_14px_#000]">
          {end === "draw" ? "Вот. Теперь ты понял, что я хотела сказать." : end === "lose" ? "Шесть. Партия моя." : TALK[Math.min(losses, TALK.length - 1)]}
        </p>
      </div>

      {/* стол: восемь карт Жертвы веером, в перспективе столешницы */}
      <div className="mx-auto mt-auto w-full max-w-5xl pb-6 [perspective:1100px]">
        <div key={round} className="flex justify-center gap-3 [transform:rotateX(34deg)] [transform-style:preserve-3d]">
          {sac.map((c, i) => {
            const off = i - 3.5;
            return (
              <div key={i} className="sac-card [transform-style:preserve-3d]">
              <button
                onClick={() => breakCard(i)}
                disabled={c !== "up" || busy || !!end}
                aria-label={c === "up" ? `Разрушить карту Жертвы ${i + 1}` : `Карта ${i + 1} выбыла`}
                className={cn("group relative block aspect-[5/7] w-[min(11vw,118px)] transition-transform duration-500 ease-out [transform-style:preserve-3d]", c === "up" && !busy && !end && "cursor-pointer hover:-translate-y-4")}
                style={{ transform: `rotate(${off * 3.2}deg) translateY(${off * off * 2.4 + (c === "ari" ? -46 : c === "me" ? 34 : 0)}px)` }}
              >
                <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: c === "up" ? "rotateY(0deg)" : "rotateY(180deg)" }}>
                  {/* рубашка */}
                  <div className="absolute inset-0 rounded-[5px] border-2 border-[#c9b27a] bg-[#3a1216] shadow-[0_14px_22px_rgba(0,0,0,0.75)] [backface-visibility:hidden] [background-image:repeating-linear-gradient(45deg,rgba(201,178,122,0.22)_0_2px,transparent_2px_11px),repeating-linear-gradient(-45deg,rgba(201,178,122,0.22)_0_2px,transparent_2px_11px)]">
                    <div className="absolute inset-[7px] rounded-[2px] border border-[#c9b27a]/70" />
                    <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[#c9b27a] bg-[#3a1216]" />
                  </div>
                  {/* лицо: видно, только когда карта выбыла */}
                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col items-center justify-center rounded-[5px] border-2 shadow-[0_14px_22px_rgba(0,0,0,0.75)] [backface-visibility:hidden] [transform:rotateY(180deg)]",
                      c === "ari" ? "border-[#c0333d] bg-[#1c0709] text-[#c0333d]" : "border-[#c9b27a] bg-[#efe6cf] text-[#2a2218]",
                    )}
                  >
                    <span className="font-display text-4xl leading-none">{c === "ari" ? "✕" : "☩"}</span>
                    <span className="mt-1 font-system text-[8px] uppercase tracking-wider">{c === "ari" ? "её рукой" : "вами"}</span>
                  </div>
                </div>
              </button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button onClick={attack} disabled={busy || !!end} className="border border-[#c0333d] bg-black/55 px-6 py-2 font-display text-xl text-[#ffb0b0] transition hover:bg-[#c0333d]/25 disabled:opacity-30">
            Атаковать её
          </button>
          <span className="font-system text-[11px] text-[#e6dcc6]/70">или возьмите со стола карту Жертвы и разрушьте её сами</span>
          <span className="font-system text-[11px] text-[#e6dcc6]">
            разрушено вами: {meCount} · проиграно партий: {losses}
          </span>
        </div>

        {end && (
          <div className={cn("mx-auto mt-5 max-w-2xl border bg-black/75 p-4 text-center", end === "draw" ? "border-[#c9b27a]/70" : "border-[#c0333d]/60")}>
            {end === "draw" ? (
              <p className="font-display text-[18px] leading-relaxed text-[#efe6cf]">
                Ничья. Шести жертв ей уже не набрать. Гаин проиграл пять партий подряд, прежде чем это увидел: одолеть её нельзя, но можно отнять у ритуала жертвы. Отель потом назовёт эту стратегию верной: убить жертву вместо дьявола.
              </p>
            ) : (
              <>
                <p className="font-display text-[18px] text-[#efe6cf]">{end === "win" ? "Её сила на нуле. В книге так не вышло ни разу." : "Она уничтожила шесть карт из восьми. По этим правилам её не перебить."}</p>
                <button onClick={again} className="mt-3 border border-white/40 px-5 py-1.5 font-display text-lg hover:bg-white/10">
                  Ещё партию
                </button>
              </>
            )}
          </div>
        )}
        {draw && !end && <p className="mt-3 text-center font-system text-[11px] text-[#c9b27a]">Ничья уже была сыграна.</p>}
      </div>
    </section>
  );
}
