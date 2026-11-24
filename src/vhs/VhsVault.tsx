"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Book } from "@/shelf/Shelf";
import { VhsDeck3D } from "./VhsDeck3D";
import { CrtGlass, CrtGlitchBurst, CrtLines } from "./CrtOverlays";
import { Reveal, VhsLoader } from "./VhsLoader";
import { VhsArchiveView } from "./VhsArchiveView";
import { vhsAudio } from "./audio";
import "./vhs.css";

type ViewMode = "reels" | "playback" | "archive";

function formatTimecode(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function VhsVault({ books }: { books: Book[] }) {
  const [view, setView] = useState<ViewMode>("reels");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bwMode, setBwMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [clockLabel, setClockLabel] = useState("--:--");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [slipcases, setSlipcases] = useState<Record<string, string>>({});

  // Boot preloader & 3-stage smooth entrance choreography:
  // Waits for REAL WebGL deck mount + all book slipcase textures + fonts before finishing 100%,
  // then: 1) HUD slides up -> 2) 3D VHS carousel glides up -> 3) Center TapeSubtitle reveals line-by-line.
  const [canvasReady, setCanvasReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [fallbackReady, setFallbackReady] = useState(false);
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);
  const [textIntroStarted, setTextIntroStarted] = useState(false);
  const [cardsIntroStarted, setCardsIntroStarted] = useState(false);
  const [subtitleIntroStarted, setSubtitleIntroStarted] = useState(false);
  const cardsTimerRef = useRef<number | null>(null);

  const activeBook = books[currentIndex] ?? books[0] ?? null;
  const totalChapters = useMemo(() => books.reduce((s, b) => s + (b.chapters || 0), 0), [books]);
  const totalChaptersLabel = useMemo(() => new Intl.NumberFormat("ru-RU").format(totalChapters), [totalChapters]);

  const loadedTexturesCount = useMemo(
    () => books.reduce((acc, b) => acc + (slipcases[b.slug] ? 1 : 0), 0),
    [books, slipcases],
  );
  const loadProgress = useMemo(() => {
    const totalSteps = 2 + Math.max(1, books.length);
    const doneSteps = (canvasReady ? 1 : 0) + (fontsReady ? 1 : 0) + loadedTexturesCount;
    return Math.min(1, doneSteps / totalSteps);
  }, [books.length, canvasReady, fontsReady, loadedTexturesCount]);

  const isReady = fallbackReady || (canvasReady && fontsReady && loadedTexturesCount >= books.length);

  // Track reduced-motion only for intense flash glitches; never skip the boot loader or smooth entrance
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mq?.matches) setReducedMotion(true);
  }, []);

  // Wait for custom CRT fonts (Handjet & JetBrains Mono) to be genuinely loaded
  useEffect(() => {
    let alive = true;
    const readyPromise = document.fonts?.ready;
    if (readyPromise) {
      readyPromise.then(() => {
        if (alive) setFontsReady(true);
      });
    } else {
      setFontsReady(true);
    }
    return () => {
      alive = false;
    };
  }, []);

  // Fallback safety so loader always completes even if an external resource stalls
  useEffect(() => {
    const t = window.setTimeout(() => setFallbackReady(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (cardsTimerRef.current !== null) window.clearTimeout(cardsTimerRef.current);
    };
  }, []);

  const handleDeckReady = useCallback(() => {
    setCanvasReady(true);
  }, []);

  const handleLoaderStartOut = useCallback(() => {
    setTextIntroStarted(true);
    if (cardsTimerRef.current !== null) window.clearTimeout(cardsTimerRef.current);
    cardsTimerRef.current = window.setTimeout(() => {
      setCardsIntroStarted(true);
    }, 180);
  }, []);

  const handleCardsEntered = useCallback(() => {
    setSubtitleIntroStarted(true);
  }, []);

  const handleLoaderDone = useCallback(() => {
    setIsLoaderFinished(true);
  }, []);

  // Ticking broadcast timecode & local OSD clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockLabel(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
    };
    updateClock();
    const id = window.setInterval(() => {
      setElapsedSec((s) => s + 1);
      updateClock();
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const triggerGlitch = useCallback(() => {
    vhsAudio.playGlitch();
    if (reducedMotion) return;
    setGlitching(true);
    window.setTimeout(() => setGlitching(false), 260);
  }, [reducedMotion]);

  const switchView = useCallback(
    (next: ViewMode) => {
      if (next === view) return;
      triggerGlitch();
      setView(next);
    },
    [triggerGlitch, view],
  );

  const openBook = useCallback(
    (book: Book) => {
      const idx = books.findIndex((b) => b.slug === book.slug);
      if (idx >= 0) setCurrentIndex(idx);
      triggerGlitch();
      setView("playback");
    },
    [books, triggerGlitch],
  );

  const handleSlipcaseReady = useCallback((slug: string, url: string) => {
    setSlipcases((prev) => (prev[slug] === url ? prev : { ...prev, [slug]: url }));
  }, []);

  const handleToggleBw = () => {
    vhsAudio.playSwitch();
    setBwMode((v) => !v);
  };

  const handleToggleAudio = () => {
    const nextMuted = vhsAudio.toggleMute();
    setMuted(nextMuted);
  };

  const stepBook = useCallback(
    (dir: -1 | 1) => {
      if (!books.length) return;
      setCurrentIndex((i) => (i + dir + books.length) % books.length);
      if (view === "playback") triggerGlitch();
      else vhsAudio.playSnap();
    },
    [books.length, triggerGlitch, view],
  );

  // Escape returns to 3D VHS reels; arrows step tapes in playback view too
  useEffect(() => {
    if (view === "reels") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        switchView("reels");
      } else if (view === "playback" && e.key === "ArrowLeft") {
        e.preventDefault();
        stepBook(-1);
      } else if (view === "playback" && e.key === "ArrowRight") {
        e.preventDefault();
        stepBook(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepBook, switchView, view]);

  return (
    <main className="vhs-shell">
      <div className="crt-chassis" data-bw={bwMode ? "true" : "false"}>
        {/* ==================== LAYER 0: ANALOG CRT BOOT / LOADING SCREEN ==================== */}
        {!isLoaderFinished && (
          <VhsLoader
            ready={isReady}
            progress={loadProgress}
            onStartOut={handleLoaderStartOut}
            onDone={handleLoaderDone}
          />
        )}

        {/* ==================== LAYER 1: 3D CYLINDRICAL VHS TAPE DECK ==================== */}
        <div
          className="absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: view === "reels" ? 1 : 0,
            pointerEvents: view === "reels" ? "auto" : "none",
          }}
        >
          <VhsDeck3D
            books={books}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            onOpenBook={openBook}
            onSlipcaseDataUrl={handleSlipcaseReady}
            intro={cardsIntroStarted}
            onReady={handleDeckReady}
            onCardsEntered={handleCardsEntered}
            paused={view !== "reels"}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* ==================== LAYER 2: NOVEL PLAYBACK / INSPECTION VIEW ==================== */}
        {view === "playback" && activeBook && (
          <section
            aria-label={`Воспроизведение: ${activeBook.title}`}
            className="absolute inset-0 z-20 flex flex-col overflow-y-auto px-5 pb-16 pt-16 sm:px-10 md:flex-row md:items-center md:gap-8 md:overflow-hidden md:px-14"
          >
            {/* Left half: worn slipcase + broadcast metadata + CTA into novel archive */}
            <div className="flex flex-1 flex-col items-start justify-center gap-5 md:flex-row md:items-center md:gap-8">
              <div
                className="relative mx-auto w-[160px] shrink-0 transition-transform duration-300 hover:rotate-0 sm:w-[196px] md:mx-0 md:w-[215px]"
                style={{ transform: "rotate(-1.8deg)" }}
              >
                <div className="relative aspect-[512/820] w-full overflow-hidden rounded-[3px] border border-white/15 bg-[#121318] shadow-[0_24px_55px_rgba(0,0,0,0.88)]">
                  {slipcases[activeBook.slug] || activeBook.sleeve || activeBook.vitrineCover || activeBook.cover ? (
                    <img
                      src={slipcases[activeBook.slug] || activeBook.sleeve || activeBook.vitrineCover || activeBook.cover || ""}
                      alt={activeBook.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
              </div>

              <div className="min-w-0 max-w-[460px] flex-1">
                <p className="osd-amber text-[11px] uppercase tracking-[0.2em]">
                  [TAPE.{String(currentIndex + 1).padStart(2, "0")} ·{" "}
                  {new Intl.NumberFormat("ru-RU").format(activeBook.chapters)} ГЛ.] · {activeBook.archive}
                </p>

                <h1 className="font-vhs-bit phosphor-glow mt-2 text-[clamp(34px,4.2vw,56px)] font-semibold uppercase leading-[1.0] tracking-[0.06em] text-[#ece9e1]">
                  {activeBook.title}
                </h1>

                <p className="mt-3.5 text-[13px] leading-[1.68] text-[#d5d0c4]">
                  {activeBook.blurb}
                </p>

                {/* Broadcast telemetry metrics */}
                <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-white/14 py-3.5 sm:grid-cols-3">
                  {activeBook.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-[9.5px] uppercase tracking-[0.18em] text-white/48">{fact.label}</dt>
                      <dd className="osd-text mt-1 text-[14px] font-bold text-[#f4efe2]">{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Primary Archive CTA + Tape Controls */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href={activeBook.href}
                    className="inline-flex items-center gap-2.5 border border-[#f0b354]/75 bg-[#f0b354]/14 px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#f8d08a] shadow-[0_0_24px_rgba(240,179,84,0.18)] transition-all hover:border-[#f8d08a] hover:bg-[#f0b354] hover:text-[#0b0c10] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#f0b354]"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Открыть картотеку</span>
                    <ArrowRight className="size-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => switchView("reels")}
                    className="osd-btn border border-white/15 px-3 py-2.5 text-[11px] hover:border-white/40"
                  >
                    [ ← Кассеты / ESC ]
                  </button>
                </div>

                {books.length > 1 && (
                  <div className="mt-4 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.18em] text-white/50">
                    <button type="button" onClick={() => stepBook(-1)} className="osd-btn !px-1">
                      <span className="inline-flex items-center gap-1">
                        <ChevronLeft className="size-3.5" /> Пред.
                      </span>
                    </button>
                    <span>
                      {String(currentIndex + 1).padStart(2, "0")} / {String(books.length).padStart(2, "0")}
                    </span>
                    <button type="button" onClick={() => stepBook(1)} className="osd-btn !px-1">
                      <span className="inline-flex items-center gap-1">
                        След. <ChevronRight className="size-3.5" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right half: Widescreen CRT Broadcast Scene Monitor */}
            <div className="mt-6 w-full shrink-0 md:mt-0 md:w-[40%] lg:w-[44%]">
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/15 bg-[#08090c] shadow-[0_24px_60px_rgba(0,0,0,0.9)] md:aspect-[4/3.6]">
                {(activeBook.readingScene || activeBook.scene || activeBook.vitrineCover || activeBook.cover) && (
                  <img
                    src={activeBook.readingScene || activeBook.scene || activeBook.vitrineCover || activeBook.cover || ""}
                    alt=""
                    className="h-full w-full object-cover brightness-[0.86] contrast-[1.08]"
                  />
                )}
                {/* Analog CRT playback overlays inside the monitor viewport */}
                <div aria-hidden className="vhs-grain pointer-events-none absolute inset-0 opacity-75" />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(4,5,8,0.68) 100%)",
                  }}
                />
                <div
                  aria-hidden
                  className="crt-tracking-line pointer-events-none absolute inset-x-0 h-10 bg-white/12 blur-[3px]"
                />
                <div className="osd-text absolute left-3.5 top-3 flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-[#f2eee4]/90">
                  <span className="inline-block size-2 rounded-full bg-[#e5483b] shadow-[0_0_8px_#e5483b]" />
                  <span>PLAY ▶ SP</span>
                </div>
                <div className="osd-text absolute right-3.5 top-3 text-[10.5px] tracking-[0.18em] text-white/75">
                  CH-{String(currentIndex + 1).padStart(2, "0")}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-3 pt-8 text-[10px] uppercase tracking-[0.18em] text-white/70">
                  <span>{String(currentIndex + 1).padStart(2, "0")} · КАДР АРХИВА</span>
                  <span className="truncate pl-3 text-right text-white/55">{activeBook.short || activeBook.title}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== LAYER 3: FLOATING PARALLAX CATALOG VAULT ==================== */}
        {view === "archive" && (
          <VhsArchiveView
            books={books}
            slipcases={slipcases}
            reducedMotion={reducedMotion}
            onBack={() => switchView("reels")}
            onSelectBook={openBook}
          />
        )}

        {/* ==================== TOP BROADCAST OSD HEADER ==================== */}
        <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-2 px-6 pt-5 sm:px-9 sm:pt-6">
          <div className="pointer-events-auto flex items-center gap-4 sm:gap-6">
            <Reveal on={textIntroStarted} i={0} inline>
              <button
                type="button"
                onClick={() => switchView("reels")}
                data-active={view === "reels" ? "true" : "false"}
                className="osd-btn osd-text inline-flex items-center gap-2 font-bold"
              >
                {view === "reels" && (
                  <span aria-hidden className="inline-block size-2 bg-[#f5f1e7]" />
                )}
                <span>{view === "reels" ? "КАССЕТЫ" : "← КАССЕТЫ"}</span>
              </button>
            </Reveal>

            <span className="hidden sm:inline-flex">
              <Reveal on={textIntroStarted} i={1} inline>
                <span className="osd-text text-[11.5px] tabular-nums tracking-[0.22em] text-white/58">
                  {formatTimecode(elapsedSec)}
                </span>
              </Reveal>
            </span>
          </div>

          <div className="hidden md:block">
            <Reveal on={textIntroStarted} i={2} inline>
              <div className="osd-text text-center text-[12px] font-bold uppercase tracking-[0.26em] text-[#f4efe2]">
                АРХИВ НОВЕЛЛ <span className="text-white/45">{"//"}</span> &apos;26
              </div>
            </Reveal>
          </div>

          <nav className="pointer-events-auto flex items-center gap-2 sm:gap-4">
            <Reveal on={textIntroStarted} i={3} inline>
              <button
                type="button"
                onClick={() => switchView(view === "archive" ? "reels" : "archive")}
                data-active={view === "archive" ? "true" : "false"}
                className="osd-btn osd-text inline-flex items-center gap-2"
              >
                {view === "archive" && (
                  <span aria-hidden className="inline-block size-2 bg-[#f5f1e7]" />
                )}
                <span className={view === "archive" ? "font-bold" : undefined}>КАТАЛОГ</span>
              </button>
            </Reveal>
          </nav>
        </header>

        {/* ==================== CENTER BOTTOM PIXEL SUBTITLE (REELS VIEW) ==================== */}
        {view === "reels" && activeBook && (
          <div className="pointer-events-none absolute inset-x-0 bottom-12 z-40 flex justify-center px-3 sm:bottom-12 sm:px-4">
            <div
              onClick={() => openBook(activeBook)}
              role="region"
              aria-live="polite"
              aria-atomic="true"
              aria-label={`Выбранная кассета: ${activeBook.title}`}
              className="group pointer-events-auto flex max-w-2xl cursor-pointer select-none flex-col items-center justify-center text-center transition-transform active:scale-[0.98]"
            >
              {/* Line 1: Pixelated VHS-OSD Display Title (Handjet uniform Cyrillic + RGB phosphor fringe) */}
              <Reveal on={subtitleIntroStarted} i={0}>
                <h2 className="font-vhs-bit phosphor-glow text-[clamp(28px,3.8vw,54px)] font-semibold uppercase leading-[1.0] tracking-[0.06em] text-[#ece9e1] transition-colors group-hover:text-white">
                  {activeBook.short || activeBook.title}
                </h2>
              </Reveal>

              {/* Line 2: Uppercase Mono Blurb */}
              <Reveal on={subtitleIntroStarted} i={1}>
                <p className="mt-1.5 line-clamp-2 max-w-xl text-[9.5px] uppercase leading-[1.55] tracking-[0.1em] text-[#ece9e1]/80 sm:line-clamp-none sm:text-[11.5px] sm:tracking-[0.11em]">
                  {activeBook.blurb}
                </p>
              </Reveal>

              {/* Line 3: Inline Bracketed Telemetry & Play Action (No border box) */}
              <Reveal on={subtitleIntroStarted} i={2}>
                <div className="mt-2.5 flex flex-nowrap items-center justify-center gap-x-1.5 whitespace-nowrap text-[9.5px] uppercase tracking-[0.11em] text-[#ece9e1]/72 sm:gap-x-3 sm:text-[11px] sm:tracking-[0.16em]">
                  {books.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stepBook(-1);
                      }}
                      className="cursor-pointer px-1 py-0.5 font-bold text-[#ece9e1]/55 transition-colors hover:text-[#f0b354] active:scale-90"
                      aria-label="Предыдущая кассета"
                    >
                      [ ◀ ПРЕД ]
                    </button>
                  )}

                  <span>TAPE.{String(currentIndex + 1).padStart(2, "0")}</span>
                  <span className="hidden text-[#ece9e1]/40 min-[430px]:inline">·</span>
                  <span className="hidden min-[430px]:inline">
                    {new Intl.NumberFormat("ru-RU").format(activeBook.chapters)} ГЛ.
                  </span>
                  <span className="text-[#ece9e1]/40">·</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#ece9e1] transition-colors group-hover:text-white">
                    <span>ОТКРЫТЬ</span>
                    <span className="text-[11px] leading-none transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </span>

                  {books.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stepBook(1);
                      }}
                      className="cursor-pointer px-1 py-0.5 font-bold text-[#ece9e1]/55 transition-colors hover:text-[#f0b354] active:scale-90"
                      aria-label="Следующая кассета"
                    >
                      [ СЛЕД ▶ ]
                    </button>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        )}

        {/* ==================== BOTTOM ANALOG DECK OSD FOOTER ==================== */}
        <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex items-center justify-between gap-2 px-6 pb-4 sm:px-9 sm:pb-5">
          <div className="pointer-events-auto flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-flex">
              <Reveal on={textIntroStarted} i={1} inline>
                <span className="osd-text text-[11px] tabular-nums tracking-[0.2em] text-white/60">
                  {clockLabel} LOC
                </span>
              </Reveal>
            </span>

            <Reveal on={textIntroStarted} i={2} inline>
              <button type="button" onClick={handleToggleBw} className="osd-btn osd-text whitespace-nowrap">
                ЦВЕТ: <span className="osd-amber">[{bwMode ? "B&W" : "CLR"}]</span>
              </button>
            </Reveal>

            <Reveal on={textIntroStarted} i={3} inline>
              <button type="button" onClick={handleToggleAudio} className="osd-btn osd-text whitespace-nowrap">
                ЗВУК: <span className="osd-amber">[{muted ? "OFF" : "ON"}]</span>
              </button>
            </Reveal>
          </div>

          <Reveal on={textIntroStarted} i={4} inline>
            <div className="osd-text whitespace-nowrap text-[10.5px] uppercase tracking-[0.2em] text-white/50">
              <span className="hidden sm:inline">ДЕКА: SP-MODE · </span>
              <span>
                {totalChaptersLabel} {plural(totalChapters, "ГЛАВА", "ГЛАВЫ", "ГЛАВ")}
              </span>
            </div>
          </Reveal>
        </footer>

        {/* ==================== PHYSICAL CRT GLASS, SCANLINES, ROLL & RF GLITCH ==================== */}
        <div aria-hidden="true" className="vhs-crt-roll" />
        <CrtLines />
        <CrtGlass />
        <CrtGlitchBurst active={glitching} />
      </div>
    </main>
  );
}
