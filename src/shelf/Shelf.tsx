"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/** Книга на полке. Новую новеллу добавляют одной записью в src/data/shelf.json. */
export type Book = {
  slug: string;
  title: string;
  short?: string;
  blurb: string;
  chapters: number;
  archive: string;
  facts: { label: string; value: string }[];
  href: string;
  cover: string | null;
  spine: { bg: string; band: string; ink: string };
  height?: number;
};

const PER_SHELF = 12;
const BOOK = "var(--ff-book), serif";
const LABEL = "var(--ff-label), sans-serif";
// мягкое торможение без отскока
const EASE = [0.22, 1, 0.36, 1] as const;

const plural = (n: number, one: string, few: string, many: string) =>
  n % 10 === 1 && n % 100 !== 11 ? one : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? few : many;
// толщина корешка растёт с числом глав, но в разумных пределах
const thickness = (b: Book) => Math.round(Math.min(84, Math.max(44, b.chapters / 16)));

export function Shelf({ books }: { books: Book[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const still = useReducedMotion() ?? false;
  const book = books.find((b) => b.slug === open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const rows = Array.from({ length: Math.max(1, Math.ceil(books.length / PER_SHELF)) }, (_, i) => books.slice(i * PER_SHELF, (i + 1) * PER_SHELF));

  return (
    <main
      className="min-h-screen overflow-x-clip pb-28 text-[oklch(0.9_0.012_80)]"
      style={{
        background:
          "radial-gradient(ellipse 70% 55% at 50% -8%, oklch(0.34 0.03 70 / 0.55), transparent 70%), oklch(0.185 0.006 60)",
      }}
    >
      <header className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-8 pt-14">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.38em] text-[oklch(0.68_0.02_75)]" style={{ fontFamily: LABEL }}>
            Библиотека
          </p>
          <h1 className="mt-3 text-5xl leading-[1.05] md:text-6xl" style={{ fontFamily: BOOK }}>
            Книжная полка
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-[oklch(0.75_0.015_75)]" style={{ fontFamily: LABEL }}>
            Архивы героев любимых новелл. Вытащите книгу с полки, чтобы открыть её картотеку.
          </p>
        </div>
        <p className="text-[13px] text-[oklch(0.6_0.015_75)]" style={{ fontFamily: LABEL }}>
          {books.length} {plural(books.length, "книга", "книги", "книг")} на полке
        </p>
      </header>

      {rows.map((row, r) => (
        <section key={r} className="mx-auto mt-12 max-w-6xl px-8" aria-label={rows.length > 1 ? `Полка ${r + 1}` : "Полка"}>
          {/* задняя стенка ниши: книги стоят в глубине, свет падает сверху */}
          <div
            className="relative flex min-h-[420px] items-end gap-[3px] rounded-t-[2px] px-6 pt-10"
            style={{
              background: "linear-gradient(180deg, oklch(0.13 0.006 60) 0%, oklch(0.16 0.007 60) 100%)",
              boxShadow: "inset 0 24px 40px -12px oklch(0.05 0 0 / 0.8), inset 0 -2px 0 oklch(0.1 0 0)",
            }}
          >
            {row.map((b) =>
              open === b.slug ? (
                // книгу вытащили: на полке остаётся щель
                <div key={b.slug} style={{ width: thickness(b), height: b.height ?? 360 }} aria-hidden />
              ) : (
                <Spine key={b.slug} b={b} still={still} onOpen={() => setOpen(b.slug)} />
              ),
            )}
            <Bookend />
          </div>
          <Plank />
        </section>
      ))}

      <AnimatePresence>{book && <Opened key={book.slug} b={book} still={still} onClose={() => setOpen(null)} />}</AnimatePresence>
    </main>
  );
}

function Spine({ b, still, onOpen }: { b: Book; still: boolean; onOpen: () => void }) {
  const w = thickness(b);
  const h = b.height ?? 360;
  const { bg, band, ink } = b.spine;
  return (
    <motion.button
      type="button"
      layoutId={`book-${b.slug}`}
      onClick={onOpen}
      aria-label={`${b.title}: открыть`}
      whileHover={still ? undefined : { y: -14 }}
      whileFocus={still ? undefined : { y: -14 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="group relative shrink-0 cursor-pointer rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.85_0.06_80)] focus-visible:ring-offset-4 focus-visible:ring-offset-[oklch(0.15_0.006_60)]"
      style={{
        width: w,
        height: h,
        // скруглённый корешок: тень по краям, блик чуть левее середины
        background: `linear-gradient(90deg, color-mix(in oklch, ${bg} 55%, black) 0%, ${bg} 14%, color-mix(in oklch, ${bg} 82%, white) 42%, ${bg} 70%, color-mix(in oklch, ${bg} 60%, black) 100%)`,
        boxShadow: "6px 0 14px -6px oklch(0.05 0 0 / 0.8), 0 2px 0 oklch(0.05 0 0 / 0.6)",
      }}
    >
      {[22, 30].map((t) => (
        <span key={`t${t}`} className="absolute inset-x-0 h-px" style={{ top: t, background: band, opacity: 0.85 }} />
      ))}
      {[22, 30].map((t) => (
        <span key={`b${t}`} className="absolute inset-x-0 h-px" style={{ bottom: t, background: band, opacity: 0.85 }} />
      ))}
      {/* заголовок на корешке читается снизу вверх, как на русских книгах */}
      <span
        className="absolute inset-x-0 top-12 bottom-12 flex items-center justify-center overflow-hidden text-[15px] leading-none tracking-[0.06em]"
        style={{ color: ink, fontFamily: BOOK, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {b.short ?? b.title}
      </span>
      <span
        className="absolute inset-x-0 bottom-[38px] text-center text-[9px] tracking-[0.12em]"
        style={{ color: band, fontFamily: LABEL }}
        aria-hidden
      >
        {b.chapters}
      </span>
    </motion.button>
  );
}

function Opened({ b, still, onClose }: { b: Book; still: boolean; onClose: () => void }) {
  const { bg, band, ink } = b.spine;
  const fade = still ? { duration: 0 } : { duration: 0.45, ease: EASE };
  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto overscroll-contain px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`title-${b.slug}`}
    >
      <button type="button" aria-label="Вернуть книгу на полку" onClick={onClose} className="fixed inset-0 cursor-default bg-[oklch(0.08_0.004_60/0.86)]" />

      {/* my-auto центрирует, пока помещается, и даёт прокрутку, когда окно ниже книги */}
      <div className="relative my-auto grid w-full max-w-4xl items-center gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
        <motion.div
          layoutId={`book-${b.slug}`}
          transition={still ? { duration: 0 } : { duration: 0.6, ease: EASE }}
          className="relative mx-auto aspect-[2/3] w-full max-w-[min(320px,60vw)] overflow-hidden rounded-[4px]"
          style={{ background: bg, boxShadow: "0 30px 70px -20px oklch(0.02 0 0 / 0.9), inset 4px 0 0 color-mix(in oklch, " + bg + " 60%, black)" }}
        >
          {b.cover && (
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...fade, delay: still ? 0 : 0.25 }}>
              <Image src={b.cover} alt="" fill sizes="340px" className="object-cover" priority />
            </motion.div>
          )}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[oklch(0.08_0.01_20/0.85)] to-transparent" />
          <motion.p
            className="absolute inset-x-6 top-7 text-[26px] leading-[1.1]"
            style={{ color: ink, fontFamily: BOOK }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fade, delay: still ? 0 : 0.3 }}
          >
            {b.title}
          </motion.p>
          <span className="absolute inset-x-6 top-[22px] h-px" style={{ background: band, opacity: 0.6 }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: still ? 0 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ ...fade, delay: still ? 0 : 0.2 }}
          className="relative"
        >
          <p className="text-[11px] uppercase tracking-[0.38em] text-[oklch(0.68_0.02_75)]" style={{ fontFamily: LABEL }}>
            Книга
          </p>
          <h2 id={`title-${b.slug}`} className="mt-3 text-4xl leading-[1.1]" style={{ fontFamily: BOOK }}>
            {b.title}
          </h2>
          <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-[oklch(0.78_0.015_75)]" style={{ fontFamily: LABEL }}>
            {b.blurb}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4" style={{ fontFamily: LABEL }}>
            {b.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[11px] uppercase tracking-[0.2em] text-[oklch(0.6_0.015_75)]">{f.label}</dt>
                <dd className="mt-1 text-2xl" style={{ fontFamily: BOOK }}>
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-6" style={{ fontFamily: LABEL }}>
            <Link
              href={b.href}
              className="inline-flex items-center gap-3 rounded-[3px] px-6 py-3 text-[14px] tracking-[0.04em] transition-[filter] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[oklch(0.85_0.06_80)]"
              style={{ background: bg, color: ink, boxShadow: `inset 0 0 0 1px ${band}` }}
            >
              {b.archive}
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-[13px] text-[oklch(0.65_0.015_75)] underline-offset-4 transition-colors hover:text-[oklch(0.9_0.012_80)] hover:underline focus-visible:text-[oklch(0.9_0.012_80)] focus-visible:underline focus-visible:outline-none"
            >
              Вернуть на полку
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Металлический упор, чтобы книги не падали. */
function Bookend() {
  return (
    <div className="relative ml-1 h-[150px] w-[12px] shrink-0" aria-hidden>
      <div
        className="absolute inset-0 rounded-t-[2px]"
        style={{ background: "linear-gradient(90deg, oklch(0.32 0.004 60), oklch(0.5 0.006 60) 45%, oklch(0.28 0.004 60))" }}
      />
      <div className="absolute bottom-0 left-0 h-[6px] w-[46px] rounded-r-[2px]" style={{ background: "oklch(0.36 0.005 60)" }} />
    </div>
  );
}

/** Дубовая доска полки с передней кромкой и тенью под ней. */
function Plank() {
  return (
    <div className="relative" aria-hidden>
      <div className="h-[10px]" style={{ background: "linear-gradient(180deg, oklch(0.52 0.06 62), oklch(0.44 0.055 58))" }} />
      <div
        className="h-[16px]"
        style={{
          background: "linear-gradient(180deg, oklch(0.4 0.05 56), oklch(0.3 0.04 52))",
          boxShadow: "0 18px 26px -8px oklch(0.05 0 0 / 0.75), inset 0 1px 0 oklch(0.6 0.06 65 / 0.5)",
        }}
      />
    </div>
  );
}
