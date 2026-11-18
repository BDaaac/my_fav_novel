"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FAMILY_PHOTOS, nameOf } from "./data";
import { stageOf, useInfection } from "./infection";
import { Mad } from "./mad";
import { cn } from "@/lib/utils";

/**
 * Заход 1 как фотолаборатория: плёнка с шестью засвеченными кадрами — по одному на семью.
 * Лупа переворачивает негатив и проступает правда; зажатый кадр проявляется и падает на сушилку.
 * Людей в кадрах нет: память об отеле (и о том, кто на фото) утекает.
 */
type Photo = (typeof FAMILY_PHOTOS)[number];
const W = 280;
const H = 196;
const GAP = 36;
const PAD = 56;
const BAND = 46; // поле перфорации сверху и снизу
const DEVELOP_MS = 3500;

const GRAIN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>";
const GRAIN = `url("data:image/svg+xml,${GRAIN_SVG.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23")}")`;

/** Засвет: каждый кадр — своё пятно света, детерминированно по номеру. */
function leak(i: number, escaped?: boolean) {
  if (escaped) return "radial-gradient(ellipse at 72% 38%, #ffffff 0%, #fff6e2 30%, #ffe2b0 60%, #d9a774 100%)";
  const a = ((i * 37) % 60) + 18;
  const b = ((i * 53) % 50) + 20;
  const c = ((i * 29) % 50) + 35;
  const d = ((i * 71) % 40) + 40;
  return `radial-gradient(circle at ${a}% ${b}%, #fff4dc 0%, #ffd49c 16%, transparent 46%), radial-gradient(ellipse at ${c}% ${d}%, #ff9466 0%, transparent 55%), linear-gradient(${(i * 47) % 180}deg, #b07a45, #6a3e22 65%, #2a160c)`;
}

const caption = (p: Photo, stage: number) => (stage >= 2 ? (p.escaped ? "Сын опять не с нами" : "Мы всегда будем вместе ♥") : p.caption);
const stamp = (stage: number) => (stage >= 3 ? "♥ ♥ ♥" : "'?? ?? ??");

/** Кадр в трёх видах: негатив, позитив (проявленный), правда (под лупой). Заполняет родителя. */
function Frame(props: { p: Photo; i: number; mode: "neg" | "pos" | "truth"; stage: number; compact?: boolean }) {
  if (props.mode !== "neg") return <FrameBody {...props} />;
  // негатив: инверсия + оранжевая маска плёнки
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" style={{ filter: "invert(1) saturate(0.8) contrast(1.15)" }}>
        <FrameBody {...props} />
      </div>
      <div className="absolute inset-0 bg-[#d9782e] opacity-70 mix-blend-multiply" />
    </div>
  );
}

function FrameBody({ p, i, mode, stage, compact }: { p: Photo; i: number; mode: "neg" | "pos" | "truth"; stage: number; compact?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: leak(i, p.escaped),
          filter: mode === "truth" ? "sepia(0.7) saturate(0.6) contrast(1.4) brightness(0.55)" : undefined,
        }}
      />
      {p.escaped && (
        // окно, из которого прыгнул Сынёп: единственный «предмет» на плёнке
        <div className="absolute right-[14%] top-[14%] h-[58%] w-[34%] border-[3px] border-[#7a5434]/60">
          <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-[#7a5434]/60" />
          <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-[#7a5434]/60" />
        </div>
      )}
      <div className="absolute inset-0 opacity-60 mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      {mode !== "truth" ? (
        <>
          <div className={cn("absolute left-3 font-hand leading-tight text-[#2a1608]/80", compact ? "bottom-1.5 right-2 text-[13px]" : "bottom-3 right-16 text-[19px]")}>
            {caption(p, stage)}
          </div>
          {!compact && <div className="absolute bottom-3 right-3 font-system text-[12px] tracking-wider text-[#ff8a2a] [text-shadow:0_0_6px_#ff6a00]">{stamp(stage)}</div>}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-5">
          <p className={cn("-rotate-2 text-center font-hand text-[22px] leading-tight [text-shadow:0_0_10px_rgba(0,0,0,0.9)]", p.escaped ? "text-[#9fffc4]" : "text-[#ff4848]")}>
            {p.escaped ? "Кадр пуст. Он сбежал." : p.truth}
          </p>
        </div>
      )}
    </div>
  );
}

export function Darkroom() {
  const { level, add } = useInfection();
  const s = stageOf(level);
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [printed, setPrinted] = useState<string[]>([]);
  const [holding, setHolding] = useState<string | null>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const total = PAD * 2 + FAMILY_PHOTOS.length * W + (FAMILY_PHOTOS.length - 1) * GAP;
  const height = H + BAND * 2;
  const R = 95 + level * 0.6;
  const mask = lens ? `radial-gradient(circle ${R}px at ${lens.x}px ${lens.y}px, black 55%, transparent 100%)` : "none";
  const melt = s >= 4 ? 16 : s >= 3 ? 5 : 0;

  // проявка: пока кадр зажат — проявляется; рядом с семьёй растёт заражение
  useEffect(() => {
    if (!holding) return;
    const p = FAMILY_PHOTOS.find((f) => f.who === holding)!;
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      if (!p.escaped && tick % 8 === 0) add(0.8);
      setProgress((pr) => {
        const v = Math.min(1, (pr[holding] ?? 0) + 50 / DEVELOP_MS);
        if (v >= 1) {
          setHolding(null);
          setPrinted((list) => (list.includes(holding) ? list : [...list, holding]));
        }
        return { ...pr, [holding]: v };
      });
    }, 50);
    return () => clearInterval(id);
  }, [holding, add]);

  const onDown = (e: React.PointerEvent, who?: string) => {
    drag.current = { x: e.clientX, left: scroller.current!.scrollLeft, moved: false };
    if (who && !printed.includes(who)) setHolding(who);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };
  const onMove = (e: React.PointerEvent) => {
    const b = content.current!.getBoundingClientRect();
    setLens({ x: e.clientX - b.left, y: e.clientY - b.top });
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) {
      d.moved = true;
      setHolding(null);
      scroller.current!.scrollLeft = d.left - dx;
    }
  };
  const onUp = () => {
    drag.current = null;
    setHolding(null);
  };

  return (
    <div className="relative mt-14 overflow-hidden bg-[#160707] py-10 text-[#f1d9c9] shadow-[0_30px_60px_rgba(20,5,5,0.5)]">
      {/* красная лампа проявки */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#ff2a1a]/25 blur-[90px]"
        animate={{ opacity: s >= 3 ? [0.9, 0.2, 1, 0.1, 0.8] : [0.85, 1, 0.9] }}
        transition={{ duration: s >= 3 ? 1.6 : 5, repeat: Infinity }}
      />
      <div className="relative flex flex-wrap items-baseline justify-between gap-3 px-6 md:px-10">
        <div className="font-system text-[12px] tracking-[0.3em] text-[#ff7a6a]">ФОТОЛАБОРАТОРИЯ · ПЛЁНКА 101</div>
        <div className="font-system text-[11px] tracking-wider text-[#f1d9c9]/70">тяните плёнку · лупа показывает правду · зажмите кадр, чтобы проявить</div>
      </div>

      <svg className="absolute h-0 w-0" aria-hidden>
        <filter id="melt101">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.07" numOctaves="2" seed="3">
            <animate attributeName="baseFrequency" dur="7s" values="0.008 0.07;0.011 0.1;0.008 0.07" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale={melt} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* плёнка */}
      <div
        ref={scroller}
        className="relative mt-6 cursor-grab touch-pan-y select-none overflow-x-auto [scrollbar-color:#5a2a20_transparent] [scrollbar-width:thin] active:cursor-grabbing"
        onPointerMove={onMove}
        onPointerLeave={() => setLens(null)}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div ref={content} className="relative" style={{ width: total, height, filter: melt ? "url(#melt101)" : undefined }} onPointerDown={(e) => onDown(e)}>
          {/* основа плёнки и перфорация на световом столе */}
          <div className="absolute inset-0 bg-[#2a170d]" />
          {[10, height - 24].map((top) => (
            <div
              key={top}
              className="absolute inset-x-0 h-[14px]"
              style={{ top, backgroundImage: "linear-gradient(90deg, #f6e4c4 0 15px, transparent 15px)", backgroundSize: "30px 14px", backgroundRepeat: "repeat-x", backgroundPositionX: 8 }}
            />
          ))}
          {FAMILY_PHOTOS.map((p, i) => {
            const x = PAD + i * (W + GAP);
            return (
              <div key={p.who} className="absolute font-system text-[10px] tracking-widest text-[#ff9a52]/70" style={{ left: x, top: 28 }}>
                {i + 1}A ▸ <span className="ml-3 opacity-70">101 · ПАНХРОМ</span>
              </div>
            );
          })}

          {/* негативы + проявка */}
          {FAMILY_PHOTOS.map((p, i) => {
            const x = PAD + i * (W + GAP);
            const pr = progress[p.who] ?? 0;
            const done = printed.includes(p.who);
            return (
              <motion.div
                key={p.who}
                className={cn("absolute", !done && "cursor-pointer")}
                style={{ left: x, top: BAND, width: W, height: H }}
                animate={holding === p.who ? { scale: [1, 1.012, 1], rotate: [0, -0.3, 0.3, 0] } : { scale: 1 }}
                transition={holding === p.who ? { duration: 0.9, repeat: Infinity } : undefined}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onDown(e, p.who);
                }}
              >
                <Frame p={p} i={i} mode="neg" stage={s} />
                <div className="absolute inset-0" style={{ opacity: pr }}>
                  <Frame p={p} i={i} mode="pos" stage={s} />
                </div>
                {pr > 0 && !done && (
                  <div className="absolute inset-x-0 -bottom-[18px] h-[3px] bg-[#ff2a1a]/20">
                    <div className="h-full bg-[#ff4a2a]" style={{ width: `${pr * 100}%` }} />
                  </div>
                )}
                {done && <div className="absolute right-2 top-2 bg-[#160707]/80 px-1.5 font-system text-[10px] text-[#ff9a52]">проявлен</div>}
              </motion.div>
            );
          })}

          {/* под лупой: правда */}
          {lens && (
            <div className="pointer-events-none absolute inset-0" style={{ maskImage: mask, WebkitMaskImage: mask }}>
              {FAMILY_PHOTOS.map((p, i) => (
                <div key={p.who} className="absolute" style={{ left: PAD + i * (W + GAP), top: BAND, width: W, height: H }}>
                  <Frame p={p} i={i} mode="truth" stage={s} />
                </div>
              ))}
            </div>
          )}
          {lens && (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-[#f6e4c4]/40 shadow-[0_0_0_1px_#000,0_0_40px_rgba(255,60,40,0.35)]"
              style={{ left: lens.x - R * 0.8, top: lens.y - R * 0.8, width: R * 1.6, height: R * 1.6 }}
            />
          )}
        </div>
      </div>

      <DryingLine printed={printed} stage={s} />
    </div>
  );
}

/** Сушилка: проявленные отпечатки на прищепках; переверни — на обороте правда. */
function DryingLine({ printed, stage }: { printed: string[]; stage: number }) {
  return (
    <div className="relative mt-10 px-6 md:px-10">
      <svg className="pointer-events-none absolute inset-x-0 top-3 h-6 w-full" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden>
        <path d="M0 2 Q50 9 100 2" stroke="#c9a27a" strokeOpacity="0.5" strokeWidth="0.3" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="relative grid grid-cols-2 gap-5 pt-4 sm:grid-cols-3 lg:grid-cols-6">
        {FAMILY_PHOTOS.map((p, i) => (
          <div key={p.who} className="relative">
            <AnimatePresence>
              {printed.includes(p.who) ? (
                <Print p={p} i={i} stage={stage} />
              ) : (
                <motion.div exit={{ opacity: 0 }} className="flex aspect-[10/9] items-center justify-center border border-dashed border-[#f1d9c9]/20 font-system text-[10px] tracking-widest text-[#f1d9c9]/35">
                  {i + 1}A · не проявлен
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {printed.length === FAMILY_PHOTOS.length && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
            <Mad
              className="font-display text-[20px] italic text-[#f1d9c9]"
              text="Шесть домов, шесть {семей.|счастливых семей.} Сбежал один — и это вытащило всех."
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Print({ p, i, stage }: { p: Photo; i: number; stage: number }) {
  const [flip, setFlip] = useState(false);
  const tilt = [-3, 2, -1.5, 3, -2, 1.5][i];
  return (
    <motion.button
      initial={{ opacity: 0, y: -90, rotate: -14 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      transition={{ type: "spring", stiffness: 90, damping: 11 }}
      onClick={() => setFlip((f) => !f)}
      className="relative block w-full origin-top [perspective:800px]"
    >
      <span className="absolute -top-3 left-1/2 z-10 h-5 w-2.5 -translate-x-1/2 rounded-sm bg-[#a8784a] shadow" />
      <motion.div animate={{ rotateY: flip ? 180 : 0 }} transition={{ duration: 0.55 }} className="relative aspect-[10/9] w-full [transform-style:preserve-3d]">
        <div className="absolute inset-0 bg-[#f7efe0] p-1.5 pb-6 shadow-[0_10px_20px_rgba(0,0,0,0.5)] [backface-visibility:hidden]">
          <div className="relative h-full w-full">
            <Frame p={p} i={i} mode="pos" stage={stage} compact />
          </div>
          <div className="absolute inset-x-2 bottom-1 truncate text-left font-system text-[9px] text-[#6a4e36]">{nameOf(p.who)}</div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-between bg-[#efe3c8] p-2.5 text-left shadow-[0_10px_20px_rgba(0,0,0,0.5)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <div className={cn("font-system text-[9px] uppercase tracking-widest", p.escaped ? "text-[#2f6b3a]" : "text-[#8c1c24]")}>{p.escaped ? "Побег" : "Провал"}</div>
            <p className="mt-1 font-hand text-[15px] leading-tight text-[#2a1d14]">{p.truth}</p>
          </div>
          <div className="font-system text-[9px] text-[#8a6e52]">{p.ch}</div>
        </div>
      </motion.div>
    </motion.button>
  );
}
