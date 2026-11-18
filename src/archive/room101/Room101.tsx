"use client";
import { AlbumRun } from "./Home";
import { Hero } from "./Hero";
import { House } from "./House";
import { Broadcast, TvZoom } from "./Broadcast";
import { Ward } from "./Ward";
import { Legacy } from "./Legacy";
import { InfectionProvider } from "./infection";
import { ArtProvider } from "./artfiles";
import { Care } from "./Care";
import { Corridor } from "./Corridor";

/**
 * Архив комнаты 101 — не справочник, а сама комната.
 * Утро в доме Гаина → альбом (заход 1) → гостиная с телевизором (Re) → наезд в экран → эфир ABS / больница → палата → Наследие.
 */
export function Room101({ art }: { art: string[] }) {
  return (
    <ArtProvider files={art}>
      <InfectionProvider>
        <Care />
        <main className="overflow-x-clip">
          <Hero />
          <Seam from="#140d08" to="var(--paper)" />
          <AlbumRun />
          <Seam from="var(--paper)" to="#14161d" tall />
          <House />
          <TvZoom />
          <Broadcast />
          <Corridor />
          <Ward />
          <Seam from="#020606" to="#0b0a09" />
          <Legacy />
        </main>
      </InfectionProvider>
    </ArtProvider>
  );
}

/** Мягкий шов между сценами: один цвет перетекает в другой, без резкой границы. */
function Seam({ from, to, tall }: { from: string; to: string; tall?: boolean }) {
  return <div aria-hidden className={tall ? "h-72" : "h-40"} style={{ background: `linear-gradient(${from}, ${to})` }} />;
}
