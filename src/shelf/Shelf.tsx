"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { MuseumBackdrop } from "./MuseumBackdrop";
import { VitrineStand } from "./VitrineExhibit";
import { ReadingSpread } from "./ReadingSpread";

/**
 * Главная: «Галерея новелл» — частный архив редких изданий.
 * Каждая новелла выставлена на отдельной напольной музейной витрине-тумбе из мореного ореха,
 * стоящей прямо на дубовом полу зала с просторным музейным интервалом между экспонатами.
 * Клик снимает том с подставки и раскрывает его в 3D на читальном столе.
 * Новую новеллу добавляют одной записью в src/data/shelf.json.
 */
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
  vitrineCover?: string | null;
  /** какую часть обложки держать в кадре (CSS object-position), по умолчанию верх */
  coverPos?: string;
  /** картина книги, 16:9 — во фронтисписе */
  scene?: string | null;
  spine: { bg: string; band: string; ink: string };
  height?: number;
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function Shelf({ books, hallBg = "/art/museum/hall-bg.jpg" }: { books: Book[]; hallBg?: string | null }) {
  const [sel, setSel] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const still = mounted && !!reduce;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Блокируем прокрутку зала, пока открыт читальный стол
  useEffect(() => {
    if (sel === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sel]);

  const totalChapters = useMemo(() => books.reduce((sum, b) => sum + (b.chapters || 0), 0), [books]);
  const totalChaptersLabel = useMemo(() => new Intl.NumberFormat("ru-RU").format(totalChapters), [totalChapters]);
  const activeBook = sel !== null ? books[sel] : null;

  return (
    <main className="relative flex min-h-svh flex-col justify-between overflow-x-clip text-[#eadfc6]" style={{ background: "#0a0604" }}>
      <MuseumBackdrop hallBg={hallBg} still={still} />

      {/* Заголовочная табличка зала — лаконичная, привинчена прямо к ореховой стене */}
      <header className="relative z-10 mx-auto mt-10 w-full max-w-[560px] px-5 text-center sm:mt-14">
        <div
          className="relative overflow-hidden rounded-[3px] border border-[#c7a96b]/34 px-8 py-5 sm:px-12 sm:py-5"
          style={{
            backgroundColor: "#140d09",
            backgroundImage: [
              "radial-gradient(ellipse 80% 65% at 50% 0%, rgba(255, 224, 164, 0.12), transparent 68%)",
              "linear-gradient(180deg, #20150e 0%, #150e09 55%, #100a07 100%)",
            ].join(", "),
            boxShadow:
              "inset 0 1px 0 rgba(244, 222, 172, 0.22), 0 22px 48px rgba(0, 0, 0, 0.82), 0 4px 12px rgba(0, 0, 0, 0.72)",
          }}
        >
          {/* Единственная тонкая внутренняя гравированная линия */}
          <span aria-hidden className="pointer-events-none absolute inset-[7px] rounded-[1px] border border-[#c7a96b]/18" />

          {/* Четыре латунных винта крепления к стене */}
          <HeaderScrew pos="left-3 top-3" />
          <HeaderScrew pos="right-3 top-3" />
          <HeaderScrew pos="bottom-3 left-3" />
          <HeaderScrew pos="bottom-3 right-3" />

          <p className="font-system text-[9px] uppercase tracking-[0.38em] text-[#cfa969]/85 sm:text-[10px] sm:tracking-[0.44em]">
            Постоянная экспозиция
          </p>

          <h1
            className="mt-2 bg-[linear-gradient(180deg,#fdf7e7_0%,#eddab3_56%,#c1a26a_100%)] bg-clip-text font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.02] tracking-[0.02em] text-transparent"
            style={{ filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.75))" }}
          >
            Галерея новелл
          </h1>

          <p className="mt-1.5 font-[family-name:var(--ff-press)] text-[14px] italic tracking-[0.02em] text-[#c7b28c] sm:text-[16px]">
            Зал первый · архивы героев
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-system text-[9.5px] uppercase tracking-[0.28em] text-[#b49a70]">
            <span>
              {ROMAN[books.length - 1] ?? books.length} {plural(books.length, "том", "тома", "томов")} в зале
            </span>
            <span aria-hidden className="text-[#c7a96b]/55">
              ◆
            </span>
            <span className="tabular-nums">
              {totalChaptersLabel} {plural(totalChapters, "глава", "главы", "глав")} в архиве
            </span>
          </div>
        </div>
      </header>

      {/* Ряд отдельных напольных музейных витрин-тумб с просторным интервалом между ними */}
      <section aria-label="Экспонаты" className="relative z-10 mx-auto mt-auto w-full max-w-[1440px] px-6 pb-8 pt-6 sm:px-10 sm:pb-12 sm:pt-8">
        <div className="flex flex-wrap items-end justify-center gap-x-12 gap-y-12 lg:gap-x-16 xl:gap-x-24">
          {books.map((b, i) => (
            <VitrineStand
              key={b.slug}
              book={b}
              n={ROMAN[i] ?? String(i + 1)}
              active={sel === i}
              dimmed={sel !== null && sel !== i}
              peerDimmed={sel === null && hovered !== null && hovered !== i}
              onHover={(on) => setHovered(on ? i : hovered === i ? null : hovered)}
              onSelect={() => setSel(i)}
              still={still}
            />
          ))}
        </div>
      </section>

      {/* Раскрытый том на читальном столе */}
      <AnimatePresence>
        {activeBook && sel !== null && (
          <ReadingSpread
            key={activeBook.slug}
            book={activeBook}
            n={ROMAN[sel] ?? String(sel + 1)}
            total={books.length}
            index={sel}
            onClose={() => setSel(null)}
            onPrev={() => setSel((sel - 1 + books.length) % books.length)}
            onNext={() => setSel((sel + 1) % books.length)}
            still={still}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/** Латунный винт со шлицем для заголовочной таблички зала. */
function HeaderScrew({ pos }: { pos: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${pos} flex size-[5.5px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#f0d79a,#7e6231)] shadow-[0_1px_2px_rgba(0,0,0,0.9)]`}
    >
      <span className="h-px w-[3px] rotate-[35deg] bg-[#2a1d0b]/75" />
    </span>
  );
}
