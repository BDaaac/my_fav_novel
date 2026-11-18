"use client";
import { AlbumRun, Hero } from "./Home";
import { House } from "./House";
import { Broadcast, TvZoom } from "./Broadcast";
import { Ward } from "./Ward";
import { Legacy } from "./Legacy";
import { InfectionProvider } from "./infection";

/**
 * Архив комнаты 101 — не справочник, а сама комната.
 * Прихожая → альбом (заход 1) → гостиная с телевизором (Re) → наезд в экран → эфир ABS / больница → палата → Наследие.
 */
export function Room101() {
  return (
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
  );
}
