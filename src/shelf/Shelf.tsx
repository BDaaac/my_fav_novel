"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Главная: музей любимых новелл.
 * Каждая новелла — экспонат на стене зала: старинная книга на латунной подставке под лампой-подсветкой,
 * под ней латунная табличка с номером. Клик снимает книгу «со стены»: она раскрывается — слева фронтиспис
 * (картина книги), справа титульный лист с описанием и входом в картотеку. Второй клик или Esc — обратно.
 * Анимируются только transform и opacity. Новую новеллу добавляют одной записью в src/data/shelf.json.
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
  /** картина книги, 16:9 — во фронтисписе */
  scene?: string | null;
  spine: { bg: string; band: string; ink: string };
  height?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function Shelf({ books }: { books: Book[] }) {
  const [sel, setSel] = useState<number | null>(null);
  const [k, setK] = useState(1);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const still = mounted && !!reduce;

  useEffect(() => {
    setMounted(true);
    const fit = () => {
      const byW = window.innerWidth < 640 ? 0.68 : window.innerWidth < 1024 ? 0.85 : 1;
      const byH = Math.max(0.6, (window.innerHeight - 330) / 430);
      setK(Math.min(byW, byH));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  return (
    <main className="relative min-h-svh overflow-hidden text-[#eadfc6]" style={{ background: "#160d0b" }}>
      <Wall />

      <header className="relative z-10 flex flex-col items-center px-4 pt-10 text-center sm:pt-12">
        <p className="flex items-center gap-3 whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-[#c9a24a] sm:text-[12px] sm:tracking-[0.45em]">
          <span className="h-px w-8 bg-[#c9a24a]/60 sm:w-16" />
          Постоянная экспозиция
          <span className="h-px w-8 bg-[#c9a24a]/60 sm:w-16" />
        </p>
        <h1 className="mt-4 font-[family-name:var(--ff-press)] text-[clamp(32px,5.6vw,60px)] leading-none text-[#f0e3c3]">
          Музей любимых новелл
        </h1>
        <p className="mt-3 font-[family-name:var(--ff-press)] text-[15px] italic text-[#b9a77f] sm:text-[17px]">
          Зал первый · архивы героев
        </p>
      </header>

      <section aria-label="Экспонаты" className="relative z-10 mt-8 overflow-x-auto overflow-y-visible pb-6 [scrollbar-width:none] sm:mt-10 [&::-webkit-scrollbar]:hidden">
        {/* на телефоне экспонаты висят друг под другом, на широком экране — в ряд */}
        <div className="mx-auto flex flex-col items-center gap-14 px-6 sm:w-max sm:flex-row sm:items-start sm:gap-[clamp(40px,8vw,120px)]">
          {books.map((b, i) => (
            <Exhibit
              key={b.slug}
              book={b}
              n={ROMAN[i] ?? String(i + 1)}
              open={sel === i}
              dimmed={sel !== null && sel !== i}
              onToggle={() => setSel(sel === i ? null : i)}
              k={k}
              still={still}
            />
          ))}
        </div>
      </section>

      <Rope />
    </main>
  );
}

/** экспонат: лампа, книга на подставке, консоль и табличка */
function Exhibit({
  book,
  n,
  open,
  dimmed,
  onToggle,
  k,
  still,
}: {
  book: Book;
  n: string;
  open: boolean;
  dimmed: boolean;
  onToggle: () => void;
  k: number;
  still: boolean;
}) {
  const W = 236 * k;
  const H = 330 * k;
  const T = 26 * k; // толщина блока
  const t = { duration: still ? 0 : 0.9, ease: EASE };

  return (
    <motion.div
      className="relative flex flex-col items-center"
      style={{ width: Math.max(2 * W + 40, 320) }}
      initial={false}
      animate={{ opacity: dimmed ? 0.35 : 1 }}
      transition={{ duration: still ? 0 : 0.5 }}
    >
      <Lamp lit={open} w={W} still={still} />

      {/* книга */}
      <div className="relative" style={{ width: 2 * W, height: H + 24, perspective: 1800 }}>
        {/* pointer-events-none: сама книга не ловит клики, иначе её плоскость перекрывает
            титульный лист, который лежит чуть глубже в 3D; ссылка на листе включает их обратно */}
        <motion.div
          className="pointer-events-none absolute bottom-[14px] left-1/2"
          style={{ width: W, height: H, marginLeft: -W / 2, transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ x: open ? W / 2 : 0, y: open ? -6 : 0, rotateX: open ? 0 : 10, scale: open ? 1.04 : 1 }}
          transition={t}
          whileHover={open || still ? undefined : { y: -6, rotateX: 6 }}
        >
          {/* Закрытая книга имеет толщину: задняя крышка и листы уходят вглубь.
              Раскрытая лежит плашмя: всё в одной плоскости со створкой, иначе перспектива
              разводит их края по высоте. */}
          <motion.div
            className="absolute inset-0"
            style={{ background: book.spine.bg, borderRadius: "0 4px 4px 0" }}
            initial={false}
            animate={{ z: open ? -2 : -T }}
            transition={t}
          />
          {/* корешок раскрытой книги: одна кожаная полоса через шов, с выпуклым бликом */}
          <motion.div
            className="absolute inset-y-0"
            style={{
              left: -5,
              width: 10,
              background: `linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,240,215,0.10) 45%, rgba(0,0,0,0.35)), ${book.spine.bg}`,
            }}
            initial={false}
            animate={{ z: open ? 0.5 : -T, opacity: open ? 1 : 0 }}
            transition={{ ...t, opacity: { duration: still ? 0 : open ? 0.3 : 0.15, delay: open && !still ? 0.5 : 0 } }}
          />
          {/* блок листов: чуть меньше крышек, как у настоящей книги — по краям видна кожа переплёта */}
          <motion.div
            className="absolute bottom-[5px] left-0 right-[5px] top-[5px]"
            initial={false}
            animate={{ z: open ? -1 : -T / 2 }}
            transition={t}
            style={{
              background:
                "radial-gradient(ellipse at 70% 10%, rgba(255,255,255,0.35), transparent 60%), repeating-linear-gradient(0deg, rgba(110,85,45,0.035) 0 1px, transparent 1px 3px), linear-gradient(90deg,#e9dcbd,#efe4c8 18%,#ebdfc2)",
              borderRadius: "0 2px 2px 0",
              // обрез листов виден только у раскрытой книги; у закрытой сбоку одна кожа переплёта
              boxShadow: open ? "1px 0 0 #d9caa6, 2px 0 0 #c9b893, 3px 0 0 #d4c49f" : "none",
            }}
          >
            {/* тень у корешка: лист уходит в переплёт */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[14%] bg-[linear-gradient(90deg,rgba(60,40,20,0.38),rgba(60,40,20,0.12)_45%,transparent)]" />
            <TitlePage book={book} open={open} still={still} compact={k < 0.8} />
          </motion.div>
          {/* крышка: лицо — обложка, изнанка — фронтиспис */}
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
            initial={false}
            animate={{ rotateY: open ? -180 : 0 }}
            transition={t}
          >
            <Cover book={book} />
            <Frontispiece book={book} />
          </motion.div>
        </motion.div>

        {/* кнопка поверх книги: открыть / вернуть на место */}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={open}
          aria-label={open ? `${book.title}: закрыть` : `${book.title}: открыть`}
          className="absolute bottom-[14px] cursor-pointer focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#c9a24a]"
          style={open ? { left: 0, width: W, height: H } : { left: W / 2, width: W, height: H }}
        />

        <Cradle w={W} />
      </div>

      <Console w={W} />
      <Plaque n={n} book={book} />
    </motion.div>
  );
}

/** обложка: картина в край, корешок с бинтами слева */
function Cover({ book }: { book: Book }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-r-[4px] rounded-l-[2px] shadow-[0_24px_50px_rgba(0,0,0,0.6)]" style={{ backfaceVisibility: "hidden", background: book.spine.bg }}>
      {book.cover ? (
        <Image src={book.cover} alt="" fill sizes="260px" className="object-cover object-top" priority />
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-center font-[family-name:var(--ff-press)] text-2xl" style={{ color: book.spine.ink }}>
          {book.title}
        </div>
      )}
      {/* шарнир и бинты корешка */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[18px]" style={{ background: `linear-gradient(90deg, ${book.spine.bg}, rgba(0,0,0,0.55) 70%, rgba(255,236,200,0.12))` }} />
      {[0.12, 0.88].map((y) => (
        <div key={y} className="pointer-events-none absolute left-0 h-[5px] w-[18px]" style={{ top: `${y * 100}%`, background: book.spine.band, opacity: 0.8 }} />
      ))}
      {/* потёртость и блик лампы */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,226,170,0.08),transparent_55%),radial-gradient(ellipse_at_50%_120%,rgba(0,0,0,0.45),transparent_60%)]" />
    </div>
  );
}

/** изнанка крышки: форзац под мрамор и фронтиспис — картина книги под папиросной бумагой */
function Frontispiece({ book }: { book: Book }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-l-[4px]"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        // кожа крышки, загнутая внутрь
        background: `linear-gradient(135deg, rgba(255,230,190,0.08), transparent 40%), ${book.spine.bg}`,
      }}
    >
      {/* вклеенная иллюстрация: на ширину листа, по краям остаётся кромка кожи */}
      <div className="absolute bottom-[5px] left-[5px] right-0 top-[5px] overflow-hidden rounded-l-[2px]">
        {book.scene && <Image src={book.scene} alt="" fill sizes="260px" className="object-cover" />}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_40%,transparent_50%,rgba(0,0,0,0.45))]" />
        {/* тень у корешка справа: створка уходит в переплёт */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[16%] bg-[linear-gradient(270deg,rgba(0,0,0,0.6),rgba(0,0,0,0.18)_45%,transparent)]" />
      </div>
    </div>
  );
}

/** титульный лист: проступает, когда крышка открыта */
function TitlePage({ book, open, still, compact }: { book: Book; open: boolean; still: boolean; compact: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center px-[9%] py-[8%] text-center text-[#3b2a18]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: still ? 0 : 0.45, duration: still ? 0 : 0.5 } }}
          exit={{ opacity: 0, transition: { duration: still ? 0 : 0.15 } }}
        >
          <span className="text-[9px] uppercase tracking-[0.35em] text-[#8a6a36]">Новелла</span>
          <h2 className="mt-2 font-[family-name:var(--ff-press)] text-[clamp(15px,1.7vw,20px)] font-bold leading-[1.15]">{book.title}</h2>
          <span className="my-2 flex items-center gap-2 text-[#8a6a36]">
            <span className="h-px w-6 bg-current" />
            <span className="size-[5px] rotate-45 border border-current" />
            <span className="h-px w-6 bg-current" />
          </span>
          <p className={`font-[family-name:var(--ff-press)] text-[clamp(10px,1vw,12px)] italic leading-[1.5] text-[#4d3a22] ${compact ? "line-clamp-5" : ""}`}>{book.blurb}</p>
          {/* на телефоне страница мала: факты остаются на табличке под книгой */}
          <dl className={`${compact ? "hidden" : ""} mb-3 mt-auto w-full space-y-[3px] text-[clamp(9px,0.9vw,11px)]`}>
            {book.facts.map((f) => (
              <div key={f.label} className="flex items-baseline gap-1">
                <dt className="text-[#6b5432]">{f.label}</dt>
                <span aria-hidden className="mb-[3px] flex-1 border-b border-dotted border-[#8a6a36]/50" />
                <dd className="font-[family-name:var(--ff-press)] font-bold">{f.value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={book.href}
            className="pointer-events-auto relative z-10 mt-auto border border-[#8a6a36] px-3 py-1.5 font-[family-name:var(--ff-press)] text-[clamp(10px,1vw,12px)] text-[#3b2a18] transition-colors hover:bg-[#8a6a36] hover:text-[#f3ead2]"
          >
            Войти в картотеку
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** лампа-подсветка над экспонатом: латунный козырёк на кронштейне и конус света */
function Lamp({ lit, w, still }: { lit: boolean; w: number; still: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none relative flex flex-col items-center" style={{ height: 70 }}>
      <svg width="160" height="46" viewBox="0 0 160 46" fill="none">
        <path d="M80 0v18" stroke="#8a6a36" strokeWidth="3" />
        <circle cx="80" cy="4" r="5" fill="#b08a40" />
        <path d="M24 26h112l-8 14H32z" fill="url(#hood)" />
        <rect x="22" y="22" width="116" height="5" rx="2" fill="#c9a24a" />
        <defs>
          <linearGradient id="hood" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8a6a36" />
            <stop offset="1" stopColor="#3e2c14" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className="absolute left-1/2 top-[40px] -translate-x-1/2 blur-[14px]"
        style={{ width: w * 2, height: 470 }}
        initial={false}
        animate={{ opacity: lit ? 1 : 0.7 }}
        transition={{ duration: still ? 0 : 0.6 }}
      >
        {/* размытие на родителе, обрезка на ребёнке — так у конуса мягкие края */}
        <div
          className="h-full w-full"
          style={{
            clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(180deg, rgba(255,222,165,0.6), rgba(255,214,150,0.22) 55%, transparent)",
          }}
        />
      </motion.div>
    </div>
  );
}

/** латунная подставка: полоса с бортиком, на которую опирается книга */
function Cradle({ w }: { w: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: w * 1.25 }}>
      <div className="mx-auto h-[6px] w-[86%] rounded-t-[2px] bg-[linear-gradient(180deg,#f0d48e,#a8843c)]" />
      <div className="h-[10px] rounded-[2px] bg-[linear-gradient(180deg,#c9a24a,#6e5226)] shadow-[0_6px_14px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

/** деревянная консоль на стене под подставкой */
function Console({ w }: { w: number }) {
  return (
    <div aria-hidden className="relative" style={{ width: w * 1.5 }}>
      <div className="h-[16px] rounded-[2px] bg-[linear-gradient(180deg,#6b4428,#3a2414)] shadow-[0_10px_24px_rgba(0,0,0,0.55)]" />
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="mx-auto block h-[34px] w-[46%]">
        <path d="M0 0h100C92 8 80 12 66 14 58 16 54 26 50 40 46 26 42 16 34 14 20 12 8 8 0 0z" fill="#2c1b0f" />
        <path d="M14 3c14 6 26 7 36 7s22-1 36-7" stroke="#c9a24a" strokeOpacity=".35" fill="none" />
      </svg>
    </div>
  );
}

/** латунная табличка экспоната */
function Plaque({ n, book }: { n: string; book: Book }) {
  return (
    <div className="mt-6 min-w-[240px] max-w-[320px] rounded-[3px] bg-[linear-gradient(160deg,#e6c77a,#b08a40_45%,#d9b866_70%,#8a6a2e)] p-[3px] shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
      <div className="rounded-[2px] border border-[#5a4218]/40 px-5 py-3 text-center text-[#2e200c]">
        <p className="text-[10px] uppercase tracking-[0.4em]">Экспонат № {n}</p>
        <p className="mt-1 font-[family-name:var(--ff-press)] text-[16px] font-bold leading-tight">{book.title}</p>
        <p className="mt-1 font-[family-name:var(--ff-press)] text-[12px] italic">
          {book.chapters} глав{book.facts[0] ? ` · ${book.facts[0].value} ${book.facts[0].label}` : ""}
        </p>
      </div>
    </div>
  );
}

/** стена зала: тёмно-винные шпалеры с узором, золотой молдинг, деревянная панель внизу */
function Wall() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#2a1215",
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(201,162,74,0.07) 0 6px, transparent 7px), radial-gradient(circle at 0 0, rgba(201,162,74,0.05) 0 3px, transparent 4px), radial-gradient(circle at 100% 100%, rgba(201,162,74,0.05) 0 3px, transparent 4px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 64px)",
          backgroundSize: "64px 64px, 64px 64px, 64px 64px, auto",
        }}
      />
      {/* верхний карниз и общий полумрак */}
      <div className="absolute inset-x-0 top-0 h-[10px] bg-[linear-gradient(180deg,#4a2e1a,#24150b)]" />
      <div className="absolute inset-x-0 top-[10px] h-px bg-[#c9a24a]/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_45%,transparent,rgba(8,4,3,0.75))]" />
      {/* панель снизу */}
      <div className="absolute inset-x-0 bottom-0 h-[90px]">
        <div className="h-px bg-[#c9a24a]/45" />
        <div className="h-[5px] bg-[linear-gradient(180deg,#6b4428,#3a2414)]" />
        <div className="h-full bg-[linear-gradient(180deg,#24150c,#120a06)]" />
      </div>
    </div>
  );
}

/** музейное ограждение: латунные столбики и бархатный канат */
function Rope() {
  return (
    <div aria-hidden className="pointer-events-none relative z-10 -mt-2 h-[90px]">
      <svg viewBox="0 0 1000 90" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M60 22C260 70 340 70 500 22S740 70 940 22" stroke="#6e1420" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M60 20C260 68 340 68 500 20S740 68 940 20" stroke="#b0303c" strokeOpacity=".35" strokeWidth="2" fill="none" />
      </svg>
      {["6%", "50%", "94%"].map((x) => (
        <div key={x} className="absolute top-[8px] -translate-x-1/2" style={{ left: x }}>
          <div className="mx-auto size-[14px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#f3d98f,#9a7834)]" />
          <div className="mx-auto h-[66px] w-[6px] bg-[linear-gradient(90deg,#6e5226,#e6c77a,#6e5226)]" />
        </div>
      ))}
    </div>
  );
}
