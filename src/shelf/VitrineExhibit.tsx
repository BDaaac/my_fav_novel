"use client";
import { useState, type PointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Book } from "./Shelf";

/**
 * Отдельная напольная музейная витрина-тумба из мореного ореха:
 * стоит прямо на паркетном полу зала с воздухом между соседними экспонатами.
 * Сверху — козырёк со встроенным 2700K светильником и застеклённая витрина с книгой
 * на латунной подставке; снизу — массивный постамент-колонна с привинченной
 * табличкой из чернёной бронзы и ступенчатым цоколем на полу.
 */
export function VitrineStand({
  book,
  n,
  active,
  dimmed,
  onSelect,
  still,
}: {
  book: Book;
  n: string;
  active: boolean;
  dimmed: boolean;
  onSelect: () => void;
  still: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [failedCover, setFailedCover] = useState<string | null>(null);
  const cover = book.vitrineCover ?? book.cover;
  const lit = hovered || active;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sheenOn = useMotionValue(0);

  const sx = useSpring(px, { stiffness: 155, damping: 22, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 155, damping: 22, mass: 0.7 });
  const glow = useSpring(sheenOn, { stiffness: 125, damping: 24 });

  const rotateY = useTransform(sx, [0, 1], [-7.5, 7.5]);
  const rotateX = useTransform(sy, [0, 1], [6, -4]);
  const gx = useTransform(sx, (v) => v * 100);
  const gy = useTransform(sy, (v) => v * 100);
  const band = useTransform([sx, sy], ([a, b]: number[]) => -35 + (a * 0.65 + b * 0.35) * 165);
  const glareOpacity = useTransform(glow, (v) => v * 0.34);
  const sweepOpacity = useTransform(glow, (v) => v * 0.24);

  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 240, 206, 0.52), rgba(255, 224, 165, 0.12) 28%, transparent 62%)`;
  const sweep = useMotionTemplate`linear-gradient(115deg, transparent ${band}%, rgba(255, 244, 214, 0) calc(${band}% + 8%), rgba(255, 244, 214, 0.42) calc(${band}% + 15%), rgba(255, 244, 214, 0) calc(${band}% + 22%), transparent 100%)`;

  const handleMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (still) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    sheenOn.set(1);
  };

  const handleLeave = () => {
    setHovered(false);
    px.set(0.5);
    py.set(0.5);
    sheenOn.set(0);
  };

  const chaptersFormatted = new Intl.NumberFormat("ru-RU").format(book.chapters);

  return (
    <motion.article
      className="group relative flex w-[278px] shrink-0 flex-col items-center sm:w-[292px] lg:w-[300px]"
      initial={false}
      animate={{ opacity: dimmed ? 0.34 : 1 }}
      transition={{ duration: still ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Тень постамента на паркетном полу зала */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-4 -inset-x-5 h-[28px] rounded-full bg-black/88 blur-[16px]"
      />

      <button
        type="button"
        onClick={onSelect}
        onPointerMove={handleMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        onFocus={() => setHovered(true)}
        onBlur={handleLeave}
        aria-label={`${book.title} — открыть издание`}
        className="relative flex w-full cursor-pointer flex-col text-left focus-visible:outline-none"
      >
        {/* Выступающий верхний карниз-козырёк витрины */}
        <div
          aria-hidden
          className="relative -mx-2 h-[14px] rounded-t-[3px] transition-shadow duration-500"
          style={{
            background: "linear-gradient(180deg, #472e1e 0%, #2b1a10 55%, #160d08 100%)",
            boxShadow: lit
              ? "inset 0 1px 0 rgba(246, 224, 174, 0.42), inset 0 -1px 0 rgba(0, 0, 0, 0.9), 0 10px 22px rgba(0, 0, 0, 0.8)"
              : "inset 0 1px 0 rgba(236, 210, 152, 0.28), inset 0 -1px 0 rgba(0, 0, 0, 0.9), 0 8px 18px rgba(0, 0, 0, 0.75)",
          }}
        >
          <span className="absolute inset-x-3 bottom-[3px] h-px bg-[linear-gradient(90deg,transparent,rgba(218,188,126,0.42)_20%,rgba(242,216,162,0.52)_50%,rgba(218,188,126,0.42)_80%,transparent)]" />
        </div>

        {/* Верхняя часть: корпус витрины с тонкими ореховыми стойками и тёмной камерой */}
        <div
          className="relative flex items-stretch overflow-hidden transition-shadow duration-500"
          style={{
            boxShadow: lit
              ? "0 24px 52px rgba(0, 0, 0, 0.86), 0 0 38px rgba(212, 172, 98, 0.11)"
              : "0 20px 44px rgba(0, 0, 0, 0.82)",
          }}
        >
          {/* Левая стойка витрины */}
          <SideStile />

          {/* Внутренняя углублённая бархатная камера */}
          <div
            className="relative flex flex-1 flex-col items-center overflow-hidden px-5 pb-0 pt-7"
            style={{
              backgroundColor: "#110a07",
              backgroundImage: [
                "repeating-linear-gradient(0deg, rgba(255,235,205,0.014) 0 1px, transparent 1px 3px)",
                "radial-gradient(ellipse 92% 76% at 50% 42%, rgba(46, 25, 17, 0.72), rgba(9, 5, 4, 0.96) 86%)",
              ].join(", "),
              boxShadow:
                "inset 0 22px 42px rgba(0, 0, 0, 0.9), inset 10px 0 20px rgba(0, 0, 0, 0.45), inset -10px 0 20px rgba(0, 0, 0, 0.45)",
            }}
          >
            {/* Деликатный цветовой рефлекс переплёта на тёмном бархате */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: lit ? 0.34 : 0.12,
                background: `radial-gradient(ellipse 76% 58% at 50% 56%, ${book.spine.bg}, transparent 76%)`,
              }}
            />

            {/* Встроенный верхний латунный светильник */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center">
              <div className="h-[5px] w-[108px] rounded-b-[2px] bg-[linear-gradient(180deg,#523b1c,#9a7a42_55%,#d4b677)] shadow-[0_3px_10px_rgba(0,0,0,0.85)]" />
              <div
                className="-mt-px h-[2px] w-[82px] rounded-full transition-all duration-500"
                style={{
                  background: lit
                    ? "linear-gradient(90deg, transparent, #fff4d1 24%, #fffcf2 50%, #fff4d1 76%, transparent)"
                    : "linear-gradient(90deg, transparent, rgba(255,229,170,0.78) 30%, #fff1cc 50%, rgba(255,229,170,0.78) 70%, transparent)",
                  boxShadow: lit ? "0 3px 22px 4px rgba(255, 222, 152, 0.72)" : "0 2px 14px 2px rgba(255, 214, 142, 0.42)",
                }}
              />
              <div
                className="absolute top-[4px] h-[360px] w-[276px] transition-opacity duration-500"
                style={{
                  opacity: lit ? 1 : 0.74,
                  background: [
                    "radial-gradient(ellipse 58% 44% at 50% 0%, rgba(255, 229, 176, 0.34) 0%, rgba(255, 214, 146, 0.11) 54%, transparent 84%)",
                    "radial-gradient(ellipse 50% 82% at 50% 14%, rgba(255, 220, 158, 0.16) 0%, rgba(255, 206, 134, 0.04) 64%, transparent 100%)",
                  ].join(", "),
                }}
              />
            </div>

            {/* Римский номер тома */}
            <div
              className={`relative z-10 mb-3 flex items-center gap-2.5 text-[9px] uppercase tracking-[0.44em] transition-colors duration-500 ${
                lit ? "text-[#e7cd92]/90" : "text-[#c7a96b]/55"
              }`}
            >
              <span className="h-px w-4 bg-current opacity-40" />
              <span>{n}</span>
              <span className="h-px w-4 bg-current opacity-40" />
            </div>

            {/* Книга на консервационной подставке */}
            <div className="relative z-10 flex w-full flex-col items-center pb-3" style={{ perspective: 1200 }}>
              <div
                aria-hidden
                className="pointer-events-none absolute top-[18px] h-[268px] w-[194px] rounded-[6px] blur-[20px] transition-all duration-500 sm:h-[282px] sm:w-[202px]"
                style={{
                  background: "rgba(0, 0, 0, 0.88)",
                  transform: lit ? "translateY(10px) scale(0.99)" : "translateY(14px) scale(0.95)",
                  opacity: lit ? 0.94 : 0.82,
                }}
              />

              <motion.div
                className="relative h-[274px] w-[194px] sm:h-[288px] sm:w-[206px]"
                style={{
                  rotateX: still ? 0 : rotateX,
                  rotateY: still ? 0 : rotateY,
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  y: lit && !still ? -6 : 0,
                  scale: lit && !still ? 1.022 : 1,
                }}
                transition={{ duration: still ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-[7px] inset-x-[6px] h-[14px] rounded-full bg-black/92 blur-[8px]"
                />

                <div
                  className="relative h-full w-full overflow-hidden rounded-l-[2px] rounded-r-[4px]"
                  style={{
                    background: book.spine.bg,
                    boxShadow: lit
                      ? "0 24px 44px rgba(0, 0, 0, 0.84), 0 4px 10px rgba(0, 0, 0, 0.64), inset 0 1px 0 rgba(255, 242, 208, 0.38)"
                      : "0 18px 36px rgba(0, 0, 0, 0.78), 0 3px 8px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255, 232, 190, 0.24)",
                  }}
                >
                  {cover && cover !== failedCover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 206px, 194px"
                      className="object-cover"
                      style={{ objectPosition: book.coverPos ?? "top" }}
                      decoding={book.vitrineCover ? "sync" : "async"}
                      onError={() => setFailedCover(cover)}
                      priority={!book.vitrineCover}
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center p-6 text-center font-display text-2xl font-semibold"
                      style={{ color: book.spine.ink }}
                    >
                      {book.title}
                    </div>
                  )}

                  {/* Скульптурный корешок с французским рубчиком */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-[18px]"
                    style={{
                      background: `linear-gradient(90deg, ${book.spine.bg} 0%, rgba(255,240,210,0.14) 22%, rgba(0,0,0,0.44) 64%, rgba(0,0,0,0.7) 78%, rgba(255,238,200,0.24) 88%, transparent 100%)`,
                    }}
                  />
                  {[0.13, 0.87].map((y) => (
                    <div
                      key={y}
                      aria-hidden
                      className="pointer-events-none absolute left-0 h-[5px] w-[15px]"
                      style={{
                        top: `${y * 100}%`,
                        background: `linear-gradient(180deg, rgba(255,245,220,0.42), ${book.spine.band} 42%, rgba(0,0,0,0.54) 100%)`,
                        boxShadow: "0 2px 3px rgba(0,0,0,0.55)",
                      }}
                    />
                  ))}

                  {/* Свет лампы на верхнем обрезе и нижняя тень */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: [
                        "linear-gradient(180deg, rgba(255, 234, 186, 0.16) 0%, transparent 16%, transparent 82%, rgba(0, 0, 0, 0.36) 100%)",
                        "linear-gradient(270deg, rgba(0, 0, 0, 0.24) 0%, transparent 4%)",
                      ].join(", "),
                    }}
                  />

                  {/* Сатиновый блик переплёта под курсором */}
                  {!still && (
                    <>
                      <motion.div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                        style={{ opacity: sweepOpacity, backgroundImage: sweep }}
                      />
                      <motion.div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 mix-blend-overlay"
                        style={{ opacity: glareOpacity, backgroundImage: glare }}
                      />
                    </>
                  )}
                </div>
              </motion.div>

              {/* Консервационная латунная подставка на ореховой полке тумбы */}
              <div aria-hidden className="relative z-20 -mt-[3px] flex flex-col items-center">
                <div
                  className="h-[4px] w-[176px] rounded-t-[2px] sm:w-[186px]"
                  style={{
                    background: "linear-gradient(90deg, #5d4623, #d9bc82 28%, #f4e2b8 50%, #c8a664 72%, #523d1e)",
                    boxShadow: "0 -1px 5px rgba(255, 234, 182, 0.24), 0 3px 8px rgba(0, 0, 0, 0.78)",
                  }}
                />
                <div
                  className="h-[6px] w-[202px] rounded-t-[1px] sm:w-[212px]"
                  style={{
                    background: "linear-gradient(180deg, #876736 0%, #3d2b14 75%, #20150a 100%)",
                    boxShadow: "0 5px 12px rgba(0, 0, 0, 0.85)",
                  }}
                />
              </div>
            </div>

            {/* Верхняя плоскость полки внутри витрины */}
            <div
              aria-hidden
              className="pointer-events-none -mx-5 h-[11px] w-[calc(100%+2.5rem)]"
              style={{
                background: "linear-gradient(180deg, #1b110b 0%, #2e1d13 65%, #3a2518 100%)",
                boxShadow: "inset 0 6px 12px rgba(0, 0, 0, 0.72)",
              }}
            />

            {/* Невесомый антибликовый отблеск музейного стекла */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: lit ? 0.08 : 0.035,
                background: "linear-gradient(122deg, transparent 18%, rgba(255, 245, 224, 0.8) 28%, transparent 38%, transparent 100%)",
              }}
            />
          </div>

          {/* Правая стойка витрины */}
          <SideStile />
        </div>

        {/* Выступающая столешница ореховой тумбы с латунной инкрустацией */}
        <div
          aria-hidden
          className="relative z-20 -mx-2 h-[18px] rounded-[2px]"
          style={{
            background: "linear-gradient(180deg, #4b3120 0%, #2f1d13 44%, #180f09 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(246, 224, 174, 0.36), inset 0 -1px 0 rgba(0, 0, 0, 0.9), 0 12px 22px rgba(0, 0, 0, 0.84)",
          }}
        >
          <span className="absolute inset-x-3 top-[7px] h-px bg-[linear-gradient(90deg,transparent,rgba(218,188,126,0.38)_16%,rgba(242,216,162,0.52)_50%,rgba(218,188,126,0.38)_84%,transparent)]" />
        </div>

        {/* Нижний массивный ореховый постамент-тумба, стоящий на полу зала */}
        <div
          className="relative flex items-stretch"
          style={{
            boxShadow: "0 20px 44px rgba(0, 0, 0, 0.88)",
          }}
        >
          <SideStile lower />
          <div
            className="relative flex-1 px-4 pb-5 pt-4"
            style={{
              background: "linear-gradient(180deg, #170e09 0%, #22150e 36%, #150d08 100%)",
              boxShadow: "inset 0 12px 22px rgba(0, 0, 0, 0.75)",
            }}
          >
            {/* Литая музейная табличка из чернёной бронзы, привинченная к дереву тумбы */}
            <div
              className="relative flex h-[112px] w-full flex-col justify-center rounded-[2px] border px-4 py-2.5 text-center transition-all duration-500"
              style={{
                borderColor: lit ? "rgba(222, 192, 130, 0.56)" : "rgba(196, 166, 106, 0.28)",
                backgroundColor: "#110c09",
                backgroundImage: [
                  "repeating-linear-gradient(0deg, rgba(255,236,196,0.016) 0 1px, transparent 1px 3px)",
                  "linear-gradient(180deg, #1b140f 0%, #110c09 60%, #0c0907 100%)",
                ].join(", "),
                boxShadow: lit
                  ? "inset 0 1px 0 rgba(244, 222, 172, 0.16), 0 10px 22px rgba(0, 0, 0, 0.72)"
                  : "inset 0 1px 0 rgba(244, 222, 172, 0.08), 0 8px 18px rgba(0, 0, 0, 0.65)",
              }}
            >
              <BrassScrew pos="left-2 top-2" />
              <BrassScrew pos="right-2 top-2" />
              <BrassScrew pos="bottom-2 left-2" />
              <BrassScrew pos="bottom-2 right-2" />

              <p className="font-system text-[9px] uppercase tracking-[0.34em] text-[#c4a568]/82">
                Экспонат № {n}
              </p>
              <h2
                className={`mt-1.5 font-display text-[20px] font-semibold leading-[1.14] tracking-[0.01em] transition-colors duration-300 ${
                  lit ? "text-[#fff8e6]" : "text-[#f3e8d2]"
                }`}
              >
                {book.title}
              </h2>
              <p className="mt-1.5 font-[family-name:var(--ff-press)] text-[12px] italic text-[#ab9675]">
                {chaptersFormatted} глав{book.facts[0] ? ` · ${book.facts[0].value} ${book.facts[0].label}` : ""}
              </p>
            </div>
          </div>
          <SideStile lower />
        </div>

        {/* Ступенчатый цоколь тумбы, опирающийся прямо на дубовый пол */}
        <div
          aria-hidden
          className="relative -mx-2 h-[14px] rounded-b-[2px]"
          style={{
            background: "linear-gradient(180deg, #352216 0%, #1d120b 48%, #0e0805 100%)",
            boxShadow: "inset 0 1px 0 rgba(226, 198, 140, 0.24), 0 12px 24px rgba(0, 0, 0, 0.94)",
          }}
        />
      </button>
    </motion.article>
  );
}

/** Боковая ореховая стойка витрины и тумбы. */
function SideStile({ lower = false }: { lower?: boolean }) {
  return (
    <div
      aria-hidden
      className="relative w-[13px] shrink-0"
      style={{
        background: lower
          ? "linear-gradient(90deg, #130b07 0%, #2a1b11 36%, #20140c 68%, #100906 100%)"
          : "linear-gradient(90deg, #160d08 0%, #342115 36%, #281910 68%, #120b07 100%)",
        boxShadow: "inset 1px 0 0 rgba(232, 206, 150, 0.14), inset -1px 0 0 rgba(0, 0, 0, 0.84)",
      }}
    />
  );
}

/** Миниатюрный латунный винт со шлицем. */
function BrassScrew({ pos }: { pos: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${pos} flex size-[5px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#ebd195,#806433)] shadow-[0_1px_2px_rgba(0,0,0,0.85)]`}
    >
      <span className="h-px w-[3px] rotate-[35deg] bg-[#2c1f0d]/70" />
    </span>
  );
}
