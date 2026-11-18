"use client";
import { AlbumRun } from "./Home";
import { Hero } from "./Hero";
import { House } from "./House";
import { Broadcast, TvZoom } from "./Broadcast";
import { Ward } from "./Ward";
import { Legacy } from "./Legacy";
import { InfectionProvider } from "./infection";
import { ArtProvider } from "./artfiles";

/**
 * Архив комнаты 101 — не справочник, а сама комната.
 * Утро в доме Гаина → альбом (заход 1) → гостиная с телевизором (Re) → наезд в экран → эфир ABS / больница → палата → Наследие.
 */
export function Room101({ art }: { art: string[] }) {
  return (
    <ArtProvider files={art}>
      <InfectionProvider>
        <main className="overflow-x-clip">
          <Hero />
          <AlbumRun />
          <House />
          <TvZoom />
          <Broadcast />
          <Ward />
          <Legacy />
        </main>
      </InfectionProvider>
    </ArtProvider>
  );
}
