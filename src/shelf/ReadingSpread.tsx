"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Book } from "./Shelf";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Архивный читальный стол: выбранная книга снимается с витрины и торжественно раскрывается
 * в 3D — слева вклеенный фронтиспис в кожаной оправе с золотым тиснением,
 * по центру корешок с тканым капталом и шёлковым ляссе, справа титульный лист
 * на хлопковой архивной бумаге с фактами и входом в картотеку.
 */
export function ReadingSpread({
  book,
  n,
  total,
  index,
  onClose,
  onPrev,
  onNext,
  still,
}: {
  book: Book;
  n: string;
  total: number;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  still: boolean;
}) {
  const [opened, setOpened] = useState(still);

  useEffect(() => {
    if (still) {
      setOpened(true);
      return;
    }
    setOpened(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpened(true));
    });
    return () => cancelAnimationFrame(id);
  }, [book.slug, still]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (total > 1 && e.key === "ArrowLeft") onPrev();
      if (total > 1 && e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, total]);

  const frontArt = book.scene ?? book.cover;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Издание: ${book.title}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: still ? 0 : 0.32 }}
    >
      {/* Бархатное затемнение зала, тёплый свет лампы и очертания кожаного бювара читального стола */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#070403]/90 backdrop-blur-[10px]"
        style={{
          backgroundImage: "radial-gradient(ellipse 64% 58% at 50% 44%, rgba(255, 214, 146, 0.13), rgba(7, 4, 3, 0.95) 72%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[min(78vh,680px)] w-[min(92vw,1080px)] -translate-x-1/2 -translate-y-1/2 rounded-[8px] border border-[#c7a96b]/12 md:block"
          style={{
            boxShadow: "inset 0 0 0 6px rgba(10, 6, 5, 0.5), inset 0 0 0 7px rgba(199, 169, 107, 0.08)",
          }}
        />
      </div>

      {/* Верхняя панель стола осмотра */}
      <div className="relative z-10 mb-4 flex w-full max-w-[860px] items-center justify-between gap-4 text-[#d5be90]">
        <div className="flex items-center gap-3 font-system text-[10px] uppercase tracking-[0.34em] text-[#bfa26b]/85">
          <span>Читальный стол</span>
          <span className="h-px w-6 bg-[#bfa26b]/35" />
          <span>
            Том {n} из {total}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex cursor-pointer items-center gap-2 rounded-[2px] border border-[#c7a96b]/32 bg-[#140e0b]/90 px-3 py-1.5 font-system text-[10px] uppercase tracking-[0.26em] text-[#e6d5b2] transition-colors hover:border-[#dfc389]/65 hover:bg-[#1e1510] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#dfc389]"
        >
          <span>Вернуть в витрину</span>
          <X className="size-3.5 text-[#c7a96b]" />
        </button>
      </div>

      {/* Сцена раскрытой книги */}
      <div className="relative z-10 flex w-full max-w-[960px] items-center justify-center gap-3 sm:gap-5">
        {total > 1 && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="Предыдущий том"
            className="hidden size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#c7a96b]/28 bg-[#140e0b]/85 text-[#d7be89] shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all hover:border-[#e4c88c]/65 hover:bg-[#1e1610] hover:text-[#fff2d2] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e4c88c] md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        {/* 3D разворот для планшетов и десктопа */}
        <div
          className="relative hidden w-full max-w-[820px] md:block"
          style={{ aspectRatio: "820 / 540", perspective: 2400 }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-5 inset-x-[4%] h-[38px] rounded-full bg-black/88 blur-[24px]"
          />

          <motion.div
            className="relative h-full w-1/2"
            style={{ transformStyle: "preserve-3d", marginLeft: "25%" }}
            initial={false}
            animate={{ x: opened ? "50%" : "0%" }}
            transition={{ duration: still ? 0 : 0.85, ease: EASE }}
          >
            {/* Задняя кожаная крышка переплёта */}
            <div
              className="absolute inset-0 rounded-r-[7px] rounded-l-[2px]"
              style={{
                background: `linear-gradient(145deg, rgba(255,235,200,0.10), transparent 45%), ${book.spine.bg}`,
                boxShadow: "0 28px 64px rgba(0,0,0,0.82), inset 0 0 0 1px rgba(226,198,140,0.24)",
                transform: "translateZ(-4px)",
              }}
            />

            {/* Правая страница — хлопковая бумага + золочёный обрез листов */}
            <div
              className="absolute bottom-[8px] left-0 right-[8px] top-[8px] overflow-hidden rounded-r-[3px]"
              style={{
                background: [
                  "radial-gradient(ellipse 75% 45% at 72% 8%, rgba(255, 252, 240, 0.56), transparent 62%)",
                  "repeating-linear-gradient(0deg, rgba(112, 84, 42, 0.03) 0 1px, transparent 1px 4px)",
                  "linear-gradient(90deg, #dfd0af 0%, #f1e6ce 12%, #f5ecd8 52%, #eadcc0 100%)",
                ].join(", "),
                boxShadow:
                  "2px 0 0 #d5c49e, 4px 0 0 #c1ad82, 6px 0 0 #d6c5a0, 8px 0 0 #9f8654, inset 0 0 0 1px rgba(138, 106, 54, 0.2)",
                transform: "translateZ(-1px)",
              }}
            >
              {/* Еле заметный водяной знак экслибриса на хлопковой бумаге */}
              <svg
                aria-hidden
                viewBox="0 0 120 120"
                className="pointer-events-none absolute left-1/2 top-1/2 size-[210px] -translate-x-1/2 -translate-y-1/2 text-[#7c5d2c] opacity-[0.045]"
                fill="none"
              >
                <path d="M60 8L112 60L60 112L8 60L60 8Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M60 20L100 60L60 100L20 60L60 20Z" stroke="currentColor" strokeWidth="0.9" />
                <circle cx="60" cy="60" r="16" stroke="currentColor" strokeWidth="1" />
              </svg>

              {/* Тень перегиба у корешка */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-[13%]"
                style={{ background: "linear-gradient(90deg, rgba(42, 26, 12, 0.36), rgba(42, 26, 12, 0.11) 42%, transparent)" }}
              />
              {/* Двойная типографская рамка полосы набора */}
              <div aria-hidden className="pointer-events-none absolute inset-[13px] border border-[#8a6a36]/24" />
              <div aria-hidden className="pointer-events-none absolute inset-[17px] border border-[#8a6a36]/10" />

              <TitleSheet book={book} n={n} opened={opened} still={still} />
            </div>

            {/* Кожаный корешок по центру шва + тканый каптал + шёлковое ляссе */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-[7px] w-[14px]"
              style={{
                background: `linear-gradient(90deg, rgba(0,0,0,0.58), rgba(255,240,210,0.14) 48%, rgba(0,0,0,0.52)), ${book.spine.bg}`,
                transform: "translateZ(1px)",
              }}
              initial={false}
              animate={{ opacity: opened ? 1 : 0 }}
              transition={{ duration: still ? 0 : 0.35, delay: opened && !still ? 0.38 : 0 }}
            >
              {/* Верхний и нижний тканый каптал */}
              <div
                className="absolute inset-x-[2px] top-[3px] h-[5px] rounded-t-[2px]"
                style={{
                  background: `repeating-linear-gradient(90deg, ${book.spine.band} 0 2px, #2a1810 2px 4px)`,
                }}
              />
              <div
                className="absolute inset-x-[2px] bottom-[3px] h-[5px] rounded-b-[2px]"
                style={{
                  background: `repeating-linear-gradient(90deg, ${book.spine.band} 0 2px, #2a1810 2px 4px)`,
                }}
              />
              {/* Шёлковая закладка-ляссе */}
              <div
                className="absolute left-1/2 top-[96%] h-[46px] w-[14px] -translate-x-1/2 shadow-[0_8px_14px_rgba(0,0,0,0.7)]"
                style={{
                  background: `linear-gradient(90deg, rgba(0,0,0,0.28), ${book.spine.band} 45%, rgba(0,0,0,0.34))`,
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
                }}
              />
            </motion.div>

            {/* Передняя крышка: снаружи обложка, внутри фронтиспис */}
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
              initial={false}
              animate={{ rotateY: opened ? -180 : 0 }}
              transition={{ duration: still ? 0 : 0.85, ease: EASE }}
            >
              <div
                className="absolute inset-0 overflow-hidden rounded-r-[7px] rounded-l-[2px]"
                style={{
                  backfaceVisibility: "hidden",
                  background: book.spine.bg,
                  boxShadow: "0 24px 50px rgba(0,0,0,0.7)",
                }}
              >
                {book.cover && (
                  <Image
                    src={book.cover}
                    alt=""
                    fill
                    sizes="420px"
                    className="object-cover"
                    style={{ objectPosition: book.coverPos ?? "top" }}
                  />
                )}
              </div>

              {/* Изнанка крышки: мраморный форзац + вклеенный фронтиспис */}
              <div
                className="absolute inset-0 overflow-hidden rounded-l-[7px] rounded-r-[2px]"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: `linear-gradient(135deg, rgba(255,235,200,0.11), transparent 45%), ${book.spine.bg}`,
                  boxShadow: "inset 0 0 0 1px rgba(226,198,140,0.24), 0 28px 64px rgba(0,0,0,0.82)",
                }}
              >
                <div
                  className="absolute bottom-[8px] left-[8px] right-0 top-[8px] flex flex-col justify-between overflow-hidden rounded-l-[3px] p-5"
                  style={{
                    background: "linear-gradient(180deg, #1b1410 0%, #130e0b 100%)",
                    boxShadow: "-2px 0 0 #8a744d, -4px 0 0 #261b12, inset 0 0 0 1px rgba(206, 174, 114, 0.24)",
                  }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-[10px] border border-[#c7a96b]/22" />

                  <div className="relative z-10 flex items-center justify-between text-[9px] uppercase tracking-[0.34em] text-[#bfa26b]/75">
                    <span>Фронтиспис</span>
                    <span>Табл. {n}</span>
                  </div>

                  {/* Вклеенная иллюстрация в паспарту */}
                  <div className="relative z-10 my-3 flex-1 overflow-hidden border border-[#c7a96b]/32 bg-[#0d0907] p-[5px] shadow-[0_14px_30px_rgba(0,0,0,0.68)]">
                    <div className="relative h-full w-full overflow-hidden">
                      {frontArt ? (
                        <Image src={frontArt} alt="" fill sizes="400px" className="object-cover" />
                      ) : (
                        <div className="h-full w-full" style={{ background: book.spine.bg }} />
                      )}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(8, 5, 4, 0.5) 100%)",
                        }}
                      />
                    </div>
                  </div>

                  <p className="relative z-10 text-center font-[family-name:var(--ff-press)] text-[11px] italic text-[#c4ad86]">
                    {book.archive}
                  </p>

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[14%]"
                    style={{ background: "linear-gradient(270deg, rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.16) 46%, transparent)" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Мобильный формат раскрытого тома */}
        <div
          className="w-full max-w-[440px] overflow-hidden rounded-[6px] border border-[#c7a96b]/32 shadow-[0_24px_60px_rgba(0,0,0,0.85)] md:hidden"
          style={{ background: "#140e0b" }}
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0e0907]">
            {frontArt && <Image src={frontArt} alt="" fill sizes="440px" className="object-cover" />}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(14,9,7,0.92)_100%)]" />
            <span className="absolute bottom-2.5 left-4 font-system text-[9px] uppercase tracking-[0.3em] text-[#d6ba82]">
              Экспонат № {n} · {book.archive}
            </span>
          </div>
          <div
            className="relative px-6 py-6"
            style={{
              background: "linear-gradient(180deg, #f3e9d2 0%, #e7d9ba 100%)",
            }}
          >
            <TitleSheet book={book} n={n} opened still={still} mobile />
          </div>
        </div>

        {total > 1 && (
          <button
            type="button"
            onClick={onNext}
            aria-label="Следующий том"
            className="hidden size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#c7a96b]/28 bg-[#140e0b]/85 text-[#d7be89] shadow-[0_8px_20px_rgba(0,0,0,0.6)] transition-all hover:border-[#e4c88c]/65 hover:bg-[#1e1610] hover:text-[#fff2d2] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#e4c88c] md:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {/* Мобильная навигация между томами */}
      {total > 1 && (
        <div className="relative z-10 mt-4 flex items-center gap-4 md:hidden">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#c7a96b]/30 bg-[#140e0b]/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[#dfca9e]"
          >
            <ChevronLeft className="size-3.5" /> Пред.
          </button>
          <span className="font-system text-[10px] tracking-[0.26em] text-[#a99168]">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-[2px] border border-[#c7a96b]/30 bg-[#140e0b]/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[#dfca9e]"
          >
            След. <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/** Правая страница: титульный лист на хлопковой бумаге. */
function TitleSheet({
  book,
  n,
  opened,
  still,
  mobile = false,
}: {
  book: Book;
  n: string;
  opened: boolean;
  still: boolean;
  mobile?: boolean;
}) {
  return (
    <motion.div
      className={
        mobile
          ? "flex flex-col items-center text-center text-[#2c1e10]"
          : "relative z-10 flex h-full flex-col items-center px-[11%] py-[9%] text-center text-[#2c1e10]"
      }
      initial={mobile || still ? false : { opacity: 0 }}
      animate={{ opacity: opened ? 1 : 0 }}
      transition={{ delay: opened && !still && !mobile ? 0.35 : 0, duration: still ? 0 : 0.45 }}
    >
      <span className="font-system text-[9px] uppercase tracking-[0.36em] text-[#846431]">
        Фонд редких изданий · № {n}
      </span>

      <h2 className="mt-3 font-display text-[clamp(24px,2.6vw,32px)] font-bold leading-[1.08] text-[#23160a]">
        {book.title}
      </h2>

      {/* Типографский флерон */}
      <div aria-hidden className="my-3.5 flex items-center gap-2.5 text-[#8a6a36]">
        <span className="h-px w-9 bg-current opacity-50" />
        <svg viewBox="0 0 18 10" className="h-[10px] w-[18px]" fill="none">
          <path d="M9 1L13 5L9 9L5 5L9 1Z" stroke="currentColor" strokeWidth="1" />
          <circle cx="9" cy="5" r="1.4" fill="currentColor" />
          <path d="M1 5H4M14 5H17" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        </svg>
        <span className="h-px w-9 bg-current opacity-50" />
      </div>

      <p className="font-[family-name:var(--ff-press)] text-[13.5px] italic leading-[1.62] text-[#45321d]">
        {book.blurb}
      </p>

      {/* Архивные сведения с отточием */}
      <dl className="mt-6 w-full space-y-2 border-y border-[#8a6a36]/24 py-3.5 text-[12px] tabular-nums">
        {book.facts.map((f) => (
          <div key={f.label} className="flex items-baseline gap-2">
            <dt className="text-[#694f2b]">{f.label}</dt>
            <span aria-hidden className="mb-[3px] flex-1 border-b border-dotted border-[#8a6a36]/45" />
            <dd className="font-[family-name:var(--ff-press)] font-bold text-[#25180b]">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* Кнопка входа в картотеку — тиснёная золотом кожаная застёжка */}
      <Link
        href={book.href}
        className="group/cta relative mt-auto inline-flex items-center gap-2.5 border border-[#7c5d2c] bg-[#21150b] px-5 py-2.5 font-[family-name:var(--ff-press)] text-[13px] tracking-[0.06em] text-[#f3e6c8] shadow-[0_8px_18px_rgba(38,24,10,0.30),inset_0_0_0_2px_#21150b,inset_0_0_0_3px_rgba(206,174,114,0.3)] transition-all duration-300 hover:border-[#9e7a3e] hover:bg-[#7d5e2d] hover:text-[#fff9ea] hover:shadow-[0_10px_22px_rgba(38,24,10,0.34),inset_0_0_0_2px_#7d5e2d,inset_0_0_0_3px_rgba(255,244,210,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7d5e2d] max-md:mt-6"
      >
        <span>Войти в картотеку</span>
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
      </Link>
    </motion.div>
  );
}
