"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { motion } from "motion/react";
import type { Book } from "@/shelf/Shelf";
import { vhsAudio } from "./audio";

type CatalogFilter = "all" | "epic" | "compact";

interface DomeCoord {
  top: string;
  left?: string;
  right?: string;
  depth: number;
  rotY: number;
  rotX: number;
  rotate: number;
  centerX?: boolean;
}

// Full 10-slot 3D spherical concave dome coordinates (matching FerrelHD/VHS ArchiveView)
const DOME_COORDS_10: DomeCoord[] = [
  { top: "6%", left: "8%", depth: 1.4, rotY: 14, rotX: -10, rotate: -3 },
  { top: "10%", left: "28%", depth: 2.2, rotY: 8, rotX: -7, rotate: 2 },
  { top: "6%", left: "64%", depth: 0.9, rotY: -8, rotX: -7, rotate: -2 },
  { top: "11%", left: "84%", depth: 1.8, rotY: -14, rotX: -10, rotate: 3 },
  { top: "42%", left: "5%", depth: 2.6, rotY: 17, rotX: 0, rotate: -2 },
  { top: "40%", left: "85%", depth: 2.2, rotY: -17, rotX: 0, rotate: 2 },
  { top: "72%", left: "8%", depth: 1.6, rotY: 14, rotX: 9, rotate: 2 },
  { top: "78%", left: "28%", depth: 0.7, rotY: 8, rotX: 7, rotate: -2 },
  { top: "74%", left: "62%", depth: 2.4, rotY: -8, rotX: 7, rotate: 3 },
  { top: "76%", left: "82%", depth: 1.8, rotY: -14, rotX: 9, rotate: -2 },
];

// Balanced symmetrical 3-book constellation around the central HUD (desktop + mobile safe)
const DOME_COORDS_3: DomeCoord[] = [
  { top: "12%", left: "11%", depth: 1.6, rotY: 14, rotX: -9, rotate: -3 },
  { top: "12%", right: "11%", depth: 2.4, rotY: -14, rotX: -9, rotate: 3 },
  { top: "68%", left: "50%", depth: 2.0, rotY: 0, rotX: 9, rotate: -2, centerX: true },
];

function getCoordForIndex(idx: number, total: number): DomeCoord {
  if (total === 1) {
    return { top: "12%", left: "50%", depth: 1.5, rotY: 0, rotX: -8, rotate: -2, centerX: true };
  }
  if (total === 2) {
    return DOME_COORDS_3[idx] ?? DOME_COORDS_3[0];
  }
  if (total === 3) {
    return DOME_COORDS_3[idx] ?? DOME_COORDS_3[0];
  }
  return DOME_COORDS_10[idx % DOME_COORDS_10.length];
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

function useMousePositionRef(containerRef?: RefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = {
          x: x - (rect.left + rect.width / 2),
          y: y - (rect.top + rect.height / 2),
        };
      } else {
        positionRef.current = {
          x: x - window.innerWidth / 2,
          y: y - window.innerHeight / 2,
        };
      }
    };

    const onMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY);
    const onPointerMove = (ev: PointerEvent) => updatePosition(ev.clientX, ev.clientY);
    const onTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void;
  unregisterElement: (id: string) => void;
}

const FloatingContext = createContext<FloatingContextType | null>(null);

function Floating({
  children,
  className = "",
  sensitivity = -1.1,
  easingFactor = 0.06,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  sensitivity?: number;
  easingFactor?: number;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement;
        depth: number;
        currentPosition: { x: number; y: number };
      }
    >(),
  );
  const mousePositionRef = useMousePositionRef(containerRef);

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      const existing = elementsMap.current.get(id);
      elementsMap.current.set(id, {
        element,
        depth,
        currentPosition: existing ? existing.currentPosition : { x: 0, y: 0 },
      });
    },
    [],
  );

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id);
  }, []);

  useEffect(() => {
    if (disabled) return;
    let rafId = 0;

    const step = () => {
      if (containerRef.current) {
        elementsMap.current.forEach((data) => {
          const strength = (data.depth * sensitivity) / 20;
          const newTargetX = mousePositionRef.current.x * strength;
          const newTargetY = mousePositionRef.current.y * strength;

          const dx = newTargetX - data.currentPosition.x;
          const dy = newTargetY - data.currentPosition.y;

          if (Math.abs(dx) > 0.04 || Math.abs(dy) > 0.04) {
            data.currentPosition.x += dx * easingFactor;
            data.currentPosition.y += dy * easingFactor;
            data.element.style.transform = `translate3d(${data.currentPosition.x.toFixed(2)}px, ${data.currentPosition.y.toFixed(2)}px, 0)`;
          }
        });
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [disabled, easingFactor, mousePositionRef, sensitivity]);

  const contextValue = useMemo(
    () => ({ registerElement, unregisterElement }),
    [registerElement, unregisterElement],
  );

  return (
    <FloatingContext.Provider value={contextValue}>
      <div ref={containerRef} className={`absolute inset-0 h-full w-full ${className}`}>
        {children}
      </div>
    </FloatingContext.Provider>
  );
}

function FloatingElement({
  children,
  className = "",
  depth = 1,
  centerX = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
  centerX?: boolean;
  style?: CSSProperties;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(Math.random().toString(36).slice(2, 9));
  const ctx = useContext(FloatingContext);

  useEffect(() => {
    if (!elementRef.current || !ctx) return;
    const id = idRef.current;
    ctx.registerElement(id, elementRef.current, depth);
    return () => ctx.unregisterElement(id);
  }, [ctx, depth]);

  return (
    <div
      ref={elementRef}
      style={style}
      className={`absolute will-change-transform ${className}`}
    >
      {centerX ? <div className="-translate-x-1/2">{children}</div> : children}
    </div>
  );
}

export function VhsArchiveView({
  books,
  slipcases,
  reducedMotion = false,
  onBack,
  onSelectBook,
}: {
  books: Book[];
  slipcases: Record<string, string>;
  reducedMotion?: boolean;
  onBack: () => void;
  onSelectBook: (book: Book) => void;
}) {
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const epicCount = useMemo(() => books.filter((b) => b.chapters >= 1000).length, [books]);
  const compactCount = useMemo(() => books.filter((b) => b.chapters < 1000).length, [books]);

  const filters = useMemo(() => {
    const items: { id: CatalogFilter; label: string }[] = [
      { id: "all", label: "ВСЕ КАССЕТЫ" },
    ];
    if (epicCount > 0 && compactCount > 0) {
      items.push({ id: "epic", label: `1000+ ГЛАВ (${epicCount})` });
      items.push({ id: "compact", label: `ДО 1000 ГЛАВ (${compactCount})` });
    }
    return items;
  }, [epicCount, compactCount]);

  const matchesFilter = useCallback(
    (book: Book) => {
      if (filter === "epic") return book.chapters >= 1000;
      if (filter === "compact") return book.chapters < 1000;
      return true;
    },
    [filter],
  );

  const activeCount = useMemo(() => books.filter(matchesFilter).length, [books, matchesFilter]);
  const hoveredBook = hoveredIndex !== null ? books[hoveredIndex] : null;

  return (
    <section
      aria-label="Каталог всех кассет"
      className="absolute inset-0 z-20 overflow-hidden select-none text-[#ece9e1]"
    >
      {/* 1. CENTRAL COMMAND HUD (Always centered with phosphor glow) */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center"
      >
        <div className="flex w-full max-w-xl flex-col items-center gap-2.5">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#ece9e1]/60 sm:text-[11px]">
            <span className="osd-amber font-bold">[АРХИВ · МАТРИЦА КАССЕТ]</span>
            <span>·</span>
            <span className="text-[#ece9e1]/80">
              ВСЕГО {books.length} {plural(books.length, "КАССЕТА", "КАССЕТЫ", "КАССЕТ")}
            </span>
          </div>

          <h1 className="font-vhs-bit phosphor-glow text-[clamp(40px,5.6vw,74px)] font-semibold uppercase leading-none tracking-[0.06em] text-[#ece9e1]">
            КАТАЛОГ
          </h1>

          {/* Locked height prevents layout shift when hovering floating sleeves */}
          <div className="flex h-6 max-w-full items-center justify-center px-2 text-[10.5px] uppercase tracking-[0.14em] text-[#ece9e1]/85 sm:text-[12px]">
            {hoveredBook && hoveredIndex !== null ? (
              <span className="osd-amber max-w-full truncate font-bold">
                ГОТОВО К ЗАПУСКУ: [TAPE.{String(hoveredIndex + 1).padStart(2, "0")} · {hoveredBook.title}]
              </span>
            ) : (
              <span>ВЫБЕРИТЕ КАССЕТУ ДЛЯ ЗАПУСКА ВОСПРОИЗВЕДЕНИЯ</span>
            )}
          </div>

          {/* Interactive Filter Toggles */}
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 pt-1 sm:gap-3.5">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  vhsAudio.playClick(1.0);
                  setFilter(item.id);
                }}
                className={`cursor-pointer px-1.5 py-1 text-[10px] uppercase tracking-[0.14em] transition-all sm:text-[11px] ${
                  filter === item.id
                    ? "osd-amber border-b border-[#f0b354] font-bold"
                    : "text-[#ece9e1]/50 hover:text-white"
                }`}
              >
                [{item.label}]
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-0.5 text-[9px] uppercase tracking-[0.16em] text-[#ece9e1]/42 sm:text-[10px]">
            <span>
              ПОКАЗАНО {activeCount} ИЗ {books.length}{" "}
              {plural(books.length, "КАССЕТЫ", "КАССЕТ", "КАССЕТ")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              vhsAudio.playClick(0.9);
              onBack();
            }}
            className="pointer-events-auto mt-2 cursor-pointer py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/72 transition-colors hover:text-[#f0b354] sm:text-[12px]"
          >
            [ ← ВЕРНУТЬСЯ К КАССЕТАМ / ESC ]
          </button>
        </div>
      </motion.div>

      {/* 2. 3D FLOATING PARALLAX VOID (Spherical Concave Dome) */}
      <Floating
        sensitivity={-1.25}
        easingFactor={0.075}
        className="overflow-hidden [perspective:1200px] [transform-style:preserve-3d]"
      >
        {books.map((book, idx) => {
          const coord = getCoordForIndex(idx, books.length);
          const isMatch = matchesFilter(book);
          const src = slipcases[book.slug] || book.sleeve || book.vitrineCover || book.cover || "";
          const code = `TAPE.${String(idx + 1).padStart(2, "0")}`;

          return (
            <FloatingElement
              key={book.slug}
              depth={coord.depth}
              centerX={coord.centerX}
              className={`transition-opacity duration-500 [transform-style:preserve-3d] ${
                isMatch ? "opacity-100" : "pointer-events-none opacity-20"
              }`}
              style={{
                top: coord.top,
                left: coord.left,
                right: coord.right,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  vhsAudio.playClick(1.2);
                  onSelectBook(book);
                }}
                onMouseEnter={() => {
                  if (hoveredIndex !== idx) {
                    vhsAudio.playClick(1.4);
                    setHoveredIndex(idx);
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(idx)}
                onBlur={() => setHoveredIndex(null)}
                style={{
                  transform: `perspective(1000px) rotateY(${coord.rotY}deg) rotateX(${coord.rotX}deg) rotateZ(${coord.rotate}deg)`,
                  transformStyle: "preserve-3d",
                }}
                aria-label={`${book.title} — открыть кассету`}
                className="group relative block cursor-pointer select-none text-left will-change-transform focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f0b354] active:scale-95"
              >
                {/* Physical VHS Mini Sleeve Poster */}
                <div className="relative aspect-[130/196] w-[86px] overflow-hidden rounded-[2px] border border-[#ece9e1]/30 bg-[#141210] shadow-[0_15px_35px_rgba(0,0,0,0.85)] transition-[border-color,box-shadow] duration-300 group-hover:border-[#ece9e1]/90 group-hover:shadow-[0_18px_45px_rgba(0,0,0,0.95)] sm:w-[112px] md:w-[132px] lg:w-[148px]">
                  {src ? (
                    <img
                      src={src}
                      alt={book.title}
                      className="pointer-events-none h-full w-full object-cover brightness-95 contrast-105 transition-[filter] duration-300 group-hover:brightness-105 group-hover:contrast-115"
                    />
                  ) : null}

                  {/* Base subtle ambient sheen */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />

                  {/* Analog physical plastic gloss reflection on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ mixBlendMode: "overlay" }}
                  />

                  {/* Bottom VHS sleeve code & PLAY tag on hover (preserves printed VHS artwork when idle) */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/55 to-transparent px-2 pb-1.5 pt-5 text-[8.5px] tracking-wider opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="font-bold text-white/90">{code}</span>
                    <span className="osd-amber font-bold">PLAY ↗</span>
                  </div>
                </div>
              </button>
            </FloatingElement>
          );
        })}
      </Floating>

      {/* 3. SUBTLE CRT TOP/BOTTOM VIGNETTE OVERLAY */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
    </section>
  );
}
