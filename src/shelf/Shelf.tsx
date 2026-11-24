"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MuseumBackdrop } from "./MuseumBackdrop";
import { VitrineStand } from "./VitrineExhibit";
import { ReadingSpread } from "./ReadingSpread";

/**
 * Главная: «Галерея новелл» — частный архив редких изданий.
 * Каждая новелла выставлена на отдельной напольной музейной витрине-тумбе из мореного ореха,
 * стоящей прямо на дубовом полу зала с просторным музейным интервалом между экспонатами.
 * Клик снимает том с подставки и раскрывает его в 3D на читальном столе.
 * Новую новеллу добавляют одной записью в src/data/shelf.json.
 * В одном зале стоит три экспоната; когда томов больше, посетитель переходит в следующий зал,
 * и витрины въезжают сбоку — как при проходе вдоль анфилады.
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
  /** готовый рукав VHS целиком (название, окно с картинкой, значок): кладётся на кассету как есть, без надпечаток */
  sleeve?: string | null;
  /** «кадр архива» в карточке кассеты, встроенный в страницу при сборке */
  readingScene?: string | null;
  /** какую часть обложки держать в кадре (CSS object-position), по умолчанию верх */
  coverPos?: string;
  /** картина книги, 16:9 — во фронтисписе */
  scene?: string | null;
  spine: { bg: string; band: string; ink: string };
  height?: number;
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
/** сколько экспонатов стоит в одном зале */
const PER_HALL = 3;
const HALL = ["первый", "второй", "третий", "четвёртый", "пятый", "шестой", "седьмой", "восьмой"];

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
  const [hall, setHall] = useState(0);
  const [dir, setDir] = useState(1);
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
  const halls = Math.max(1, Math.ceil(books.length / PER_HALL));
  const first = hall * PER_HALL;
  const inHall = books.slice(first, first + PER_HALL);
  const walk = (to: number) => {
    if (to < 0 || to >= halls || to === hall) return;
    setDir(to > hall ? 1 : -1);
    setHovered(null);
    setHall(to);
  };

  // раскрытый том листают подряд по всей экспозиции — зал за спиной меняется вместе с ним
  useEffect(() => {
    if (sel === null) return;
    const to = Math.floor(sel / PER_HALL);
    setHall((h) => {
      if (h !== to) setDir(to > h ? 1 : -1);
      return to;
    });
  }, [sel]);

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
            Зал {HALL[hall] ?? hall + 1} · архивы героев
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-system text-[9.5px] uppercase tracking-[0.28em] text-[#b49a70]">
            <span>
              {ROMAN[books.length - 1] ?? books.length} {plural(books.length, "том", "тома", "томов")} в галерее
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
      {/* Витрины стоят одним рядом вдоль стены зала, слева направо, и никогда не уходят во второй ряд.
          Пока ряд помещается, интервал между тумбами делится поровну (не больше музейных 96 px);
          когда томов больше, чем вмещает экран, зал прокручивается вбок — как проход вдоль стены. */}
      <section aria-label="Экспонаты" className="relative z-10 mx-auto mt-auto w-full max-w-[1760px] pb-2 pt-0 sm:pb-4">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={hall}
            custom={dir}
            tabIndex={-1}
            variants={{
              enter: (d: number) => (still ? { opacity: 0 } : { x: `${d * 46}%`, opacity: 0 }),
              stand: { x: 0, opacity: 1 },
              leave: (d: number) => (still ? { opacity: 0 } : { x: `${d * -46}%`, opacity: 0 }),
            }}
            initial="enter"
            animate="stand"
            exit="leave"
            transition={{ duration: still ? 0.15 : 0.62, ease: [0.3, 0.1, 0.2, 1] }}
            className="hall-row flex snap-x snap-proximity items-end overflow-x-auto overscroll-x-contain px-[max(24px,calc(50%-139px))] pb-10 pt-12 [justify-content:safe_center] sm:px-10"
            style={{ gap: `clamp(28px, calc((100% - ${inHall.length} * 300px) / ${Math.max(1, inHall.length - 1)}), 96px)` }}
          >
            {inHall.map((b, k) => {
              const i = first + k;
              return (
                <div key={b.slug} className="shrink-0 snap-center">
                  <VitrineStand
                    book={b}
                    n={ROMAN[i] ?? String(i + 1)}
                    active={sel === i}
                    dimmed={sel !== null && sel !== i}
                    peerDimmed={sel === null && hovered !== null && hovered !== i}
                    onHover={(on) => setHovered(on ? i : hovered === i ? null : hovered)}
                    onSelect={() => setSel(i)}
                    still={still}
                  />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Проход в соседний зал: латунные таблички-указатели у краёв стены */}
        {halls > 1 && (
          <nav aria-label="Залы экспозиции" className="pointer-events-none absolute inset-x-3 top-1/2 z-40 flex -translate-y-1/2 justify-between sm:inset-x-6">
            <HallSign side="prev" label={hall > 0 ? `Зал ${HALL[hall - 1] ?? hall}` : null} onClick={() => walk(hall - 1)} />
            <HallSign side="next" label={hall < halls - 1 ? `Зал ${HALL[hall + 1] ?? hall + 2}` : null} onClick={() => walk(hall + 1)} />
          </nav>
        )}
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

/** Указатель прохода в соседний зал: та же ореховая табличка с латунным кантом, что и вывеска зала. */
function HallSign({ side, label, onClick }: { side: "prev" | "next"; label: string | null; onClick: () => void }) {
  if (!label) return <span />;
  const next = side === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto group flex items-center gap-2 rounded-[3px] border border-[#c7a96b]/40 bg-[linear-gradient(180deg,#20150e_0%,#150e09_55%,#100a07_100%)] px-3 py-3 font-[family-name:var(--ff-press)] text-[13px] italic tracking-[0.02em] text-[#e4d2a8] shadow-[inset_0_1px_0_rgba(244,222,172,0.22),0_14px_30px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#eadfc6] sm:px-4 sm:text-[15px] ${next ? "flex-row hover:translate-x-1.5" : "flex-row-reverse hover:-translate-x-1.5"}`}
    >
      <span>{label}</span>
      <span aria-hidden className="font-display text-[22px] not-italic leading-none text-[#cfa969]">
        {next ? "›" : "‹"}
      </span>
    </button>
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
