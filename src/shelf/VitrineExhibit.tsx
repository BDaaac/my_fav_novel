"use client";
import { useState, type PointerEvent } from "react";
import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import type { Book } from "./Shelf";

/**
 * Индивидуальная камерная атмосфера витрины для каждой новеллы
 * (деликатный акцент внутри единого стиля тёмного литературного музея).
 */
type ExhibitMood = {
  velvet: string;
  lampTint: string;
  lampWarmth: string;
  accentGlow: string;
  plaqueAccent: string;
  kind: "hotel" | "gu" | "horror" | "default";
};

function moodFor(book: Book): ExhibitMood {
  switch (book.slug) {
    case "escape-hotel":
      // Тёмный отель «Пионер»: глубокий ночной кобальт-бархат, тёплый свечной янтарь замочной скважины
      return {
        velvet: "radial-gradient(ellipse 92% 78% at 50% 42%, rgba(28, 36, 62, 0.68), rgba(9, 6, 8, 0.97) 86%)",
        lampTint: "rgba(255, 212, 138, 0.44)",
        lampWarmth: "rgba(232, 148, 62, 0.16)",
        accentGlow: "radial-gradient(ellipse 52% 38% at 50% 66%, rgba(224, 118, 42, 0.34), rgba(154, 52, 22, 0.12) 55%, transparent 80%)",
        plaqueAccent: "rgba(234, 192, 114, 0.62)",
        kind: "hotel",
      };
    case "reverend-gu":
      // Гора Цин Мао: холодный лунный свет, туманная дымка у основания и серебристо-нефритовый оттенок
      return {
        velvet: "radial-gradient(ellipse 92% 78% at 50% 40%, rgba(26, 38, 46, 0.72), rgba(7, 9, 12, 0.97) 86%)",
        lampTint: "rgba(222, 236, 248, 0.36)",
        lampWarmth: "rgba(154, 186, 206, 0.14)",
        accentGlow: "radial-gradient(ellipse 72% 44% at 50% 78%, rgba(164, 198, 216, 0.24), rgba(84, 116, 138, 0.08) 60%, transparent 82%)",
        plaqueAccent: "rgba(202, 214, 226, 0.56)",
        kind: "gu",
      };
    case "my-house-of-horrors":
      // Дом ужасов: резкий холодно-меловой пучок света, непроглядная тень и приглушённый багровый отблеск у порога
      return {
        velvet: "radial-gradient(ellipse 90% 76% at 50% 38%, rgba(30, 18, 18, 0.74), rgba(6, 4, 4, 0.98) 84%)",
        lampTint: "rgba(246, 238, 224, 0.38)",
        lampWarmth: "rgba(182, 46, 52, 0.13)",
        accentGlow: "radial-gradient(ellipse 56% 32% at 50% 82%, rgba(176, 32, 40, 0.34), rgba(92, 14, 18, 0.12) 58%, transparent 82%)",
        plaqueAccent: "rgba(218, 168, 132, 0.58)",
        kind: "horror",
      };
    default:
      return {
        velvet: "radial-gradient(ellipse 92% 76% at 50% 42%, rgba(46, 25, 17, 0.72), rgba(9, 5, 4, 0.96) 86%)",
        lampTint: "rgba(255, 228, 174, 0.38)",
        lampWarmth: "rgba(255, 210, 142, 0.13)",
        accentGlow: `radial-gradient(ellipse 70% 52% at 50% 60%, ${book.spine.bg}, transparent 78%)`,
        plaqueAccent: "rgba(222, 192, 130, 0.56)",
        kind: "default",
      };
  }
}

/**
 * Отдельная напольная музейная витрина-тумба из мореного ореха:
 * - физическая глубина ниши (скошенные внутренние откосы, свод, перспективная ореховая полка);
 * - локальная музейная лампа с трёхуровневым светом, падающим на верхний обрез, обложку, полку и верх таблички;
 * - объёмная книга (видимая толщина верхнего и бокового обрезов, контактная тень, живая тень на задней стенке,
 *   отражение на полированном орехе, консервационная подставка и еле заметный блик музейного стекла);
 * - индивидуальный жанровый акцент внутри ниши при сохранении единой музейной архитектуры.
 */
export function VitrineStand({
  book,
  n,
  active,
  dimmed,
  peerDimmed,
  onHover,
  onSelect,
  still,
}: {
  book: Book;
  n: string;
  active: boolean;
  dimmed: boolean;
  peerDimmed: boolean;
  onHover: (hovered: boolean) => void;
  onSelect: () => void;
  still: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [failedCover, setFailedCover] = useState<string | null>(null);
  const cover = book.vitrineCover ?? book.cover;
  const lit = hovered || active;
  const mood = moodFor(book);

  // Живой отклик на движение курсора: наклон книги, скользящий блик стекла и смещение тени
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sheenOn = useMotionValue(0);

  const sx = useSpring(px, { stiffness: 150, damping: 22, mass: 0.72 });
  const sy = useSpring(py, { stiffness: 150, damping: 22, mass: 0.72 });
  const glow = useSpring(sheenOn, { stiffness: 120, damping: 24 });

  const rotateY = useTransform(sx, [0, 1], [-6.5, 6.5]);
  const rotateX = useTransform(sy, [0, 1], [5, -3.5]);
  const shadowShiftX = useTransform(sx, [0, 1], [8, -8]);
  const shadowShiftY = useTransform(sy, [0, 1], [16, 10]);
  const gx = useTransform(sx, (v) => v * 100);
  const gy = useTransform(sy, (v) => v * 100);
  const band = useTransform([sx, sy], ([a, b]: number[]) => -35 + (a * 0.65 + b * 0.35) * 165);
  const glassShift = useTransform(sx, [0, 1], [14, 30]);
  const glareOpacity = useTransform(glow, (v) => v * 0.32);
  const sweepOpacity = useTransform(glow, (v) => v * 0.24);

  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 242, 210, 0.48), rgba(255, 224, 165, 0.11) 28%, transparent 62%)`;
  const sweep = useMotionTemplate`linear-gradient(115deg, transparent ${band}%, rgba(255, 244, 214, 0) calc(${band}% + 8%), rgba(255, 244, 214, 0.40) calc(${band}% + 15%), rgba(255, 244, 214, 0) calc(${band}% + 22%), transparent 100%)`;
  const glassBeam = useMotionTemplate`linear-gradient(120deg, transparent ${glassShift}%, rgba(255, 246, 228, 0.72) calc(${glassShift}% + 7%), transparent calc(${glassShift}% + 16%), transparent 100%)`;

  const handleMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (still) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
    py.set(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
    sheenOn.set(1);
  };

  const handleEnter = () => {
    setHovered(true);
    onHover(true);
  };

  const handleLeave = () => {
    setHovered(false);
    onHover(false);
    px.set(0.5);
    py.set(0.5);
    sheenOn.set(0);
  };

  const chaptersFormatted = new Intl.NumberFormat("ru-RU").format(book.chapters);

  return (
    <motion.article
      className="group relative flex w-[278px] shrink-0 flex-col items-center sm:w-[292px] lg:w-[300px]"
      initial={false}
      animate={{
        opacity: dimmed ? 0.28 : peerDimmed ? 0.84 : 1,
        scale: dimmed && !still ? 0.985 : 1,
      }}
      transition={{ duration: still ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Мягкий локальный отсвет на ореховой стене за витриной (усиливается при наведении) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-6 bottom-28 rounded-full blur-[38px] transition-opacity duration-700"
        style={{
          opacity: lit ? 0.62 : 0.18,
          background: `radial-gradient(ellipse 68% 54% at 50% 24%, ${mood.lampTint}, transparent 74%)`,
        }}
      />

      {/* Тень постамента на паркетном полу зала */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-4 -inset-x-6 h-[30px] rounded-full bg-black/90 blur-[18px]"
      />

      <button
        type="button"
        onClick={onSelect}
        onPointerMove={handleMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        aria-label={`${book.title} — открыть издание`}
        className="relative flex w-full cursor-pointer flex-col text-left focus-visible:outline-none"
      >
        {/* Выступающий верхний карниз-козырёк витрины */}
        <div
          aria-hidden
          className="relative -mx-2 h-[14px] rounded-t-[3px] transition-shadow duration-500"
          style={{
            background: "linear-gradient(180deg, #49301f 0%, #2c1b11 55%, #160d08 100%)",
            boxShadow: lit
              ? "inset 0 1px 0 rgba(248, 226, 178, 0.48), inset 0 -1px 0 rgba(0, 0, 0, 0.92), 0 10px 24px rgba(0, 0, 0, 0.82)"
              : "inset 0 1px 0 rgba(236, 210, 152, 0.28), inset 0 -1px 0 rgba(0, 0, 0, 0.9), 0 8px 18px rgba(0, 0, 0, 0.76)",
          }}
        >
          <span className="absolute inset-x-3 bottom-[3px] h-px bg-[linear-gradient(90deg,transparent,rgba(218,188,126,0.42)_20%,rgba(242,216,162,0.56)_50%,rgba(218,188,126,0.42)_80%,transparent)]" />
        </div>

        {/* Верхняя часть: корпус витрины с глубокой нишей и стеклом */}
        <div
          className="relative flex items-stretch overflow-hidden transition-shadow duration-500"
          style={{
            boxShadow: lit
              ? "0 26px 56px rgba(0, 0, 0, 0.88), 0 0 42px rgba(214, 174, 98, 0.13)"
              : "0 20px 46px rgba(0, 0, 0, 0.84)",
          }}
        >
          <SideStile />

          {/* Внутренняя глубокая ниша витрины */}
          <div
            className="relative flex flex-1 flex-col items-center overflow-hidden px-5 pb-0 pt-7"
            style={{
              backgroundColor: "#0e0806",
              backgroundImage: [
                "repeating-linear-gradient(0deg, rgba(255,235,205,0.015) 0 1px, transparent 1px 3px)",
                mood.velvet,
              ].join(", "),
              boxShadow:
                "inset 0 26px 46px rgba(0, 0, 0, 0.94), inset 14px 0 22px rgba(0, 0, 0, 0.72), inset -14px 0 22px rgba(0, 0, 0, 0.72)",
            }}
          >
            {/* Перспективные скошенные внутренние откосы ниши (создают реальную глубину камеры) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-[16px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(42, 26, 16, 0.65) 0%, rgba(16, 10, 7, 0.85) 55%, transparent 100%)",
                borderRight: "1px solid rgba(255, 228, 178, 0.04)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-[16px]"
              style={{
                background:
                  "linear-gradient(270deg, rgba(42, 26, 16, 0.65) 0%, rgba(16, 10, 7, 0.85) 55%, transparent 100%)",
                borderLeft: "1px solid rgba(255, 228, 178, 0.04)",
              }}
            />

            {/* Индивидуальная сдержанная атмосфера произведения на задней стенке ниши */}
            <ExhibitAtmosphere mood={mood} lit={lit} still={still} />

            {/* Скульптурная музейная лампа-светильник под сводом витрины */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center">
              {/* Верхний тёмный свод ниши */}
              <div className="h-[10px] w-full bg-[linear-gradient(180deg,rgba(8,5,3,0.96),rgba(18,11,7,0.5)_70%,transparent)]" />
              {/* Корпус латунной музейной лампы с торцевыми заглушками */}
              <div className="-mt-[8px] flex items-center">
                <span className="h-[9px] w-[7px] rounded-bl-[3px] bg-[linear-gradient(180deg,#4a3418,#8f703a_55%,#2c1f0e)] shadow-[0_3px_6px_rgba(0,0,0,0.85)]" />
                <div
                  className="relative h-[8px] w-[112px] rounded-b-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                  style={{
                    background: "linear-gradient(180deg, #3c2913 0%, #8a6b36 42%, #d8ba7c 78%, #6d5228 100%)",
                  }}
                />
                <span className="h-[9px] w-[7px] rounded-br-[3px] bg-[linear-gradient(180deg,#4a3418,#8f703a_55%,#2c1f0e)] shadow-[0_3px_6px_rgba(0,0,0,0.85)]" />
              </div>
              {/* Светящаяся оптическая линза лампы */}
              <div
                className="-mt-[1px] h-[2.5px] w-[92px] rounded-full transition-all duration-500"
                style={{
                  background: lit
                    ? "linear-gradient(90deg, transparent, #fff6db 18%, #ffffff 50%, #fff6db 82%, transparent)"
                    : "linear-gradient(90deg, transparent, rgba(255,232,178,0.8) 26%, #fff4d4 50%, rgba(255,232,178,0.8) 74%, transparent)",
                  boxShadow: lit
                    ? `0 3px 26px 5px ${mood.lampTint}, 0 1px 10px 2px rgba(255, 245, 215, 0.72)`
                    : `0 2px 14px 2px ${mood.lampTint}`,
                }}
              />
              {/* Мягкий локальный конус света лампы (в 2 слоя: ядро + рассеянный поток) */}
              <div
                className="absolute top-[7px] h-[380px] w-[284px] transition-opacity duration-500"
                style={{
                  opacity: lit ? 1 : 0.68,
                  background: [
                    `radial-gradient(ellipse 54% 40% at 50% 0%, ${mood.lampTint} 0%, ${mood.lampWarmth} 52%, transparent 82%)`,
                    `radial-gradient(ellipse 64% 88% at 50% 10%, ${mood.lampWarmth} 0%, transparent 72%)`,
                  ].join(", "),
                }}
              />
            </div>

            {/* Римский номер тома в глубине свода */}
            <div
              className={`relative z-10 mb-3.5 flex items-center gap-2.5 text-[9px] uppercase tracking-[0.44em] transition-colors duration-500 ${
                lit ? "text-[#ead299]/92" : "text-[#c7a96b]/55"
              }`}
            >
              <span className="h-px w-4 bg-current opacity-40" />
              <span>{n}</span>
              <span className="h-px w-4 bg-current opacity-40" />
            </div>

            {/* Объёмная книга на консервационной подставке */}
            <div className="relative z-10 flex w-full flex-col items-center pb-3" style={{ perspective: 1200 }}>
              {/* Живая отбрасываемая тень книги на заднюю стенку ниши (смещается от наклона) */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute top-[14px] h-[274px] w-[198px] rounded-[6px] blur-[22px] sm:h-[288px] sm:w-[208px]"
                style={{
                  x: still ? 0 : shadowShiftX,
                  y: still ? 14 : shadowShiftY,
                  background: "rgba(0, 0, 0, 0.92)",
                }}
                animate={{
                  scale: lit && !still ? 1.01 : 0.96,
                  opacity: lit ? 0.95 : 0.84,
                }}
                transition={{ duration: still ? 0 : 0.45 }}
              />

              <motion.div
                className="relative h-[274px] w-[194px] sm:h-[288px] sm:w-[206px]"
                style={{
                  rotateX: still ? 0 : rotateX,
                  rotateY: still ? 0 : rotateY,
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  y: lit && !still ? -5 : 0,
                  scale: lit && !still ? 1.028 : 1,
                }}
                transition={{ duration: still ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Верхний книжный обрез (ловит прямой свет лампы сверху, снимает «плоскость» обложки) */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-[3px] left-[2px] right-[3px] h-[4px] rounded-t-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(30,20,14,0.9) 0%, #cfc09f 12%, #efe4c8 52%, #cbb890 88%, rgba(40,28,18,0.85) 100%)",
                    boxShadow: lit
                      ? "0 -1px 8px rgba(255, 236, 188, 0.45)"
                      : "0 -1px 4px rgba(255, 230, 175, 0.2)",
                  }}
                />

                {/* Правый обрез блока листов (тонкая физическая толщина тома) */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-[3px] bottom-[3px] top-[2px] w-[4px] rounded-r-[2px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #dfd1b0 0%, #b7a47e 45%, #847252 85%, #4d402c 100%)",
                    boxShadow: "1px 0 3px rgba(0,0,0,0.7)",
                  }}
                />

                {/* Чёткая контактная тень прямо под нижним обрезом книги */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-[4px] inset-x-[2px] h-[9px] rounded-full bg-black/95 blur-[4px]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-[10px] inset-x-[-4px] h-[16px] rounded-full bg-black/82 blur-[10px]"
                />

                {/* Обложка книги: чистая иллюстрация без рамок поверх арта */}
                <div
                  className="relative h-full w-full overflow-hidden rounded-l-[2px] rounded-r-[4px]"
                  style={{
                    background: book.spine.bg,
                    boxShadow: lit
                      ? "0 26px 46px rgba(0, 0, 0, 0.86), 0 4px 10px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 244, 214, 0.44)"
                      : "0 18px 36px rgba(0, 0, 0, 0.8), 0 3px 8px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255, 234, 192, 0.26)",
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
                      background: `linear-gradient(90deg, ${book.spine.bg} 0%, rgba(255,240,210,0.16) 22%, rgba(0,0,0,0.46) 64%, rgba(0,0,0,0.72) 78%, rgba(255,238,200,0.26) 88%, transparent 100%)`,
                    }}
                  />
                  {[0.13, 0.87].map((y) => (
                    <div
                      key={y}
                      aria-hidden
                      className="pointer-events-none absolute left-0 h-[5px] w-[15px]"
                      style={{
                        top: `${y * 100}%`,
                        background: `linear-gradient(180deg, rgba(255,245,220,0.44), ${book.spine.band} 42%, rgba(0,0,0,0.56) 100%)`,
                        boxShadow: "0 2px 3px rgba(0,0,0,0.58)",
                      }}
                    />
                  ))}

                  {/* Локальный свет лампы на верхней части обложки и естественное затенение внизу */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                    style={{
                      opacity: lit ? 1 : 0.78,
                      background: [
                        `radial-gradient(ellipse 92% 48% at 50% 0%, ${mood.lampTint}, transparent 72%)`,
                        "linear-gradient(180deg, rgba(255, 238, 198, 0.14) 0%, transparent 24%, transparent 78%, rgba(0, 0, 0, 0.42) 100%)",
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

              {/* Аккуратная консервационная музейная подставка с фетровыми упорами и опорой на полку */}
              <div aria-hidden className="relative z-20 -mt-[2px] flex flex-col items-center">
                {/* Передний латунный бортик-упор, удерживающий нижний обрез */}
                <div
                  className="relative h-[4.5px] w-[178px] rounded-t-[2px] sm:w-[190px]"
                  style={{
                    background: "linear-gradient(90deg, #523d1e, #d7b97e 26%, #f6e4bc 50%, #c8a664 74%, #4b371b)",
                    boxShadow: lit
                      ? "0 -1px 8px rgba(255, 236, 186, 0.34), 0 3px 8px rgba(0, 0, 0, 0.85)"
                      : "0 -1px 4px rgba(255, 234, 182, 0.2), 0 3px 8px rgba(0, 0, 0, 0.8)",
                  }}
                />
                {/* Нижняя ступенька и две латунные ножки подставки */}
                <div
                  className="h-[6px] w-[204px] rounded-[1px] sm:w-[216px]"
                  style={{
                    background: "linear-gradient(180deg, #7e5f30 0%, #3a2913 72%, #1d1309 100%)",
                    boxShadow: "0 6px 14px rgba(0, 0, 0, 0.9)",
                  }}
                />
                <div className="flex w-[156px] justify-between sm:w-[168px]">
                  <span className="h-[3px] w-[18px] rounded-b-[1px] bg-[linear-gradient(180deg,#523c1c,#1d1309)] shadow-[0_3px_6px_rgba(0,0,0,0.9)]" />
                  <span className="h-[3px] w-[18px] rounded-b-[1px] bg-[linear-gradient(180deg,#523c1c,#1d1309)] shadow-[0_3px_6px_rgba(0,0,0,0.9)]" />
                </div>
              </div>
            </div>

            {/* Полированная ореховая полка внутри ниши с мягким световым пятном и слабым отражением */}
            <div
              aria-hidden
              className="pointer-events-none relative -mx-5 h-[14px] w-[calc(100%+2.5rem)] overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #160d08 0%, #2a1a10 58%, #3c2618 100%)",
                boxShadow: "inset 0 6px 12px rgba(0, 0, 0, 0.78)",
              }}
            >
              {/* Локальное пятно отражённого света лампы на дереве полки */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity: lit ? 0.85 : 0.45,
                  background: `radial-gradient(ellipse 68% 90% at 50% 60%, ${mood.lampTint}, transparent 75%)`,
                }}
              />
            </div>

            {/* Слабое отражение антибликового музейного стекла и тонкий блик стеклянной кромки */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-30 w-px bg-[linear-gradient(180deg,rgba(255,244,220,0.22),rgba(255,244,220,0.05)_48%,transparent)]"
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-700"
              style={{
                opacity: lit ? 0.085 : 0.038,
                backgroundImage: still
                  ? "linear-gradient(122deg, transparent 18%, rgba(255, 245, 224, 0.75) 26%, transparent 35%, transparent 100%)"
                  : glassBeam,
              }}
            />
          </div>

          <SideStile />
        </div>

        {/* Выступающая столешница ореховой тумбы с латунной инкрустацией и тонким намёком на действие */}
        <div
          aria-hidden
          className="relative z-20 -mx-2 h-[18px] rounded-[2px]"
          style={{
            background: "linear-gradient(180deg, #4d3221 0%, #2f1d13 44%, #180f09 100%)",
            boxShadow: lit
              ? "inset 0 1px 0 rgba(252, 232, 184, 0.48), inset 0 -1px 0 rgba(0, 0, 0, 0.92), 0 14px 26px rgba(0, 0, 0, 0.88)"
              : "inset 0 1px 0 rgba(246, 224, 174, 0.34), inset 0 -1px 0 rgba(0, 0, 0, 0.9), 0 12px 22px rgba(0, 0, 0, 0.84)",
          }}
        >
          <span
            className="absolute inset-x-3 top-[7px] h-px transition-opacity duration-500"
            style={{
              opacity: lit ? 1 : 0.65,
              background:
                "linear-gradient(90deg, transparent, rgba(218,188,126,0.42) 16%, rgba(248,224,170,0.68) 50%, rgba(218,188,126,0.42) 84%, transparent)",
            }}
          />
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
              boxShadow: "inset 0 12px 22px rgba(0, 0, 0, 0.78)",
            }}
          >
            {/* Литая музейная табличка из чернёной бронзы, мягко подсвечивающаяся при наведении */}
            <div
              className="relative flex h-[122px] w-full flex-col justify-center overflow-hidden rounded-[2px] border px-4 pb-5 pt-2.5 text-center transition-all duration-500"
              style={{
                borderColor: lit ? mood.plaqueAccent : "rgba(196, 166, 106, 0.28)",
                backgroundColor: "#110c09",
                backgroundImage: [
                  "repeating-linear-gradient(0deg, rgba(255,236,196,0.016) 0 1px, transparent 1px 3px)",
                  "linear-gradient(180deg, #1b140f 0%, #110c09 60%, #0c0907 100%)",
                ].join(", "),
                boxShadow: lit
                  ? "inset 0 1px 0 rgba(252, 232, 184, 0.28), 0 12px 26px rgba(0, 0, 0, 0.76), 0 0 22px rgba(212, 176, 108, 0.12)"
                  : "inset 0 1px 0 rgba(244, 222, 172, 0.08), 0 8px 18px rgba(0, 0, 0, 0.65)",
              }}
            >
              {/* Мягкий верхний рефлекс света витрины на латунной табличке */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity: lit ? 0.9 : 0.15,
                  background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${mood.lampWarmth}, transparent 74%)`,
                }}
              />

              <BrassScrew pos="left-2 top-2" />
              <BrassScrew pos="right-2 top-2" />
              <BrassScrew pos="bottom-2 left-2" />
              <BrassScrew pos="bottom-2 right-2" />

              <p
                className={`relative font-system text-[9px] uppercase tracking-[0.34em] transition-colors duration-300 ${
                  lit ? "text-[#dfc07f]" : "text-[#c4a568]/82"
                }`}
              >
                Экспонат № {n}
              </p>
              <h2
                className={`relative mt-1.5 font-display text-[20px] font-semibold leading-[1.14] tracking-[0.01em] transition-colors duration-300 ${
                  lit ? "text-[#fffaf0]" : "text-[#f3e8d2]"
                }`}
              >
                {book.title}
              </h2>
              <p
                className={`relative mt-1.5 font-[family-name:var(--ff-press)] text-[12px] italic transition-colors duration-300 ${
                  lit ? "text-[#cdb995]" : "text-[#ab9675]"
                }`}
              >
                {chaptersFormatted} глав{book.facts[0] ? ` · ${book.facts[0].value} ${book.facts[0].label}` : ""}
              </p>

              {/* Еле заметная гравированная подсказка по нижнему краю таблички — без кнопок и рамок */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-[6px] text-center font-system text-[7.5px] uppercase tracking-[0.36em] text-[#dfc286] transition-all duration-500"
                style={{
                  opacity: lit ? 0.78 : 0,
                  transform: lit ? "translateY(0)" : "translateY(3px)",
                }}
              >
                раскрыть том
              </span>
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

/**
 * Сдержанный жанровый атмосферный акцент внутри ниши каждой новеллы.
 * Работает только в глубине витрины за книгой, не нарушая общую музейную эстетику.
 */
function ExhibitAtmosphere({ mood, lit, still }: { mood: ExhibitMood; lit: boolean; still: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Глубинное атмосферное свечение/отблеск в нише */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          mood.kind === "hotel" && !still ? "vitrine-ember" : ""
        }`}
        style={{
          opacity: lit ? 0.95 : 0.45,
          background: mood.accentGlow,
        }}
      />

      {/* «Побег из отеля с привидениями»: тонкий арочный контур гостиничной двери в глубине бархата */}
      {mood.kind === "hotel" && (
        <svg
          viewBox="0 0 220 320"
          className="absolute inset-x-0 top-6 mx-auto h-[84%] w-[86%] text-[#d9a452] transition-opacity duration-700"
          style={{ opacity: lit ? 0.2 : 0.08 }}
          fill="none"
        >
          <path d="M26 300V108C26 52 64 18 110 18C156 18 194 52 194 108V300" stroke="currentColor" strokeWidth="1" />
          <path d="M36 300V110C36 60 69 29 110 29C151 29 184 60 184 110V300" stroke="currentColor" strokeWidth="0.6" strokeOpacity="0.65" />
        </svg>
      )}

      {/* «Преподобный Гу»: медленный горный туман у подножия книги и тонкий контур свитка */}
      {mood.kind === "gu" && (
        <>
          <div
            className={`absolute -inset-x-[15%] bottom-[12px] h-[44%] blur-[16px] transition-opacity duration-700 ${
              still ? "" : "vitrine-mist"
            }`}
            style={{
              opacity: lit ? 0.44 : 0.22,
              background:
                "radial-gradient(ellipse 48% 58% at 32% 80%, rgba(188, 214, 228, 0.34), transparent 72%), radial-gradient(ellipse 50% 52% at 72% 85%, rgba(164, 198, 214, 0.28), transparent 72%)",
            }}
          />
          <svg
            viewBox="0 0 220 320"
            className="absolute inset-x-0 top-6 mx-auto h-[84%] w-[86%] text-[#b8ccd8] transition-opacity duration-700"
            style={{ opacity: lit ? 0.16 : 0.07 }}
            fill="none"
          >
            <rect x="24" y="20" width="172" height="278" stroke="currentColor" strokeWidth="0.7" />
            <path d="M24 38H42V20M196 38H178V20M24 280H42V298M196 280H178V298" stroke="currentColor" strokeWidth="1" />
          </svg>
        </>
      )}

      {/* «Мой дом ужасов»: тёмный силуэт приоткрытого порога и еле заметная багровая полоска внизу */}
      {mood.kind === "horror" && (
        <>
          <div
            className="absolute inset-x-[14%] bottom-[14px] top-[24px] border-x border-t border-[#8e2228]/25 transition-opacity duration-700"
            style={{
              opacity: lit ? 0.55 : 0.22,
              boxShadow: "inset 0 24px 36px rgba(0, 0, 0, 0.85)",
            }}
          />
          <div
            className="absolute inset-x-[22%] bottom-[14px] h-[2px] blur-[2px] transition-opacity duration-700"
            style={{
              opacity: lit ? 0.72 : 0.24,
              background: "linear-gradient(90deg, transparent, rgba(196, 36, 44, 0.85) 50%, transparent)",
            }}
          />
        </>
      )}
    </div>
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
