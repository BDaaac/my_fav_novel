"use client";
import Link from "next/link";
import { Arrival, House } from "./Manor";
import { Fates, Note } from "./Inquiry";
import { Cards } from "./Cards";
import { Finale, Hill } from "./Finale";
import { RoomProvider } from "./state";

/**
 * Архив номера 102 «Особняк Ужасов», первый заход (гл. 14–25).
 * Приезд → дом в разрезе по дням → книга судеб → записка и колокол → карточная партия → склон → финал.
 * Финал открывается, когда найден колокол и партия сведена вничью: это два вывода, без которых в книге не было бы побега.
 */
export function Room102({ art }: { art: string[] }) {
  return (
    <RoomProvider files={art}>
      <main className="overflow-x-clip">
        <Arrival />
        <House />
        <Fates />
        <Note />
        <Cards />
        <Hill />
        <Finale />
        <footer className="bg-[#070909] pb-16 text-center">
          <Link href="/" className="font-system text-[12px] tracking-widest text-[#9fb8b0] underline-offset-4 hover:underline">
            ← в вестибюль
          </Link>
        </footer>
      </main>
    </RoomProvider>
  );
}
