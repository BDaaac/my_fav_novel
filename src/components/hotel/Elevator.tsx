"use client";
import Link from "next/link";
import { FLOORS } from "@/data/floors";
import { useSpoiler } from "@/lib/spoiler";

/** Панель лифта: этаж, до которого гость не дочитал, — кнопка с «□». */
export function Elevator() {
  const { readCh } = useSpoiler();
  return (
    <div id="elevator" className="rounded-sm border border-brass/30 bg-hotel-ink/80 p-5">
      <h3 className="font-display text-2xl text-brass">Лифт</h3>
      <p className="text-xs text-paper/50">Лестниц в отеле нет. Только лифт.</p>
      <div className="mt-4 flex gap-3">
        {FLOORS.map((f) => {
          const known = readCh >= f.unlockCh || f.n === 1;
          const ready = f.doors.length > 0;
          const label = known ? String(f.n) : "□";
          const cls =
            "grid size-14 place-items-center rounded-full border font-display text-2xl transition";
          return ready ? (
            <Link
              key={f.n}
              href={`/floor/${f.n}`}
              className={`${cls} border-brass text-brass shadow-[0_0_18px_rgba(201,162,39,0.25)] hover:bg-brass hover:text-hotel-black`}
            >
              {label}
            </Link>
          ) : (
            <span
              key={f.n}
              title="Этаж ещё не открыт на сайте"
              className={`${cls} cursor-not-allowed border-paper/15 font-system text-base text-paper/30`}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
