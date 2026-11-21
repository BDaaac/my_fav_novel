import { TABS } from "@/data/horror/board/geometry";
import type { House } from "./types";

/** таблички «Дом N»: активная — светлая бумага, остальные — тёмные жестяные */
export function HouseSelector({ houses, active, onPick, inline }: { houses: House[]; active: number; onPick: (i: number) => void; inline?: boolean }) {
  return (
    <nav className={inline ? "hs-tabs-inline" : undefined} aria-label="Дома">
      {houses.slice(0, TABS.length).map((h, i) => {
        const on = i === active;
        // активная табличка всегда в размере крупной; ставим её по левому верхнему углу своего места
        const slot = TABS[i];
        const box = on ? { ...slot, w: TABS[0].w, h: TABS[0].h, x: slot.x - (i ? 12 : 0), y: slot.y - (i ? 12 : 0) } : slot;
        return (
          <button
            key={h.id}
            type="button"
            className={`hs-tab${on ? " on" : ""}`}
            aria-pressed={on}
            onClick={() => onPick(i)}
            style={inline ? undefined : { left: box.x, top: box.y, width: box.w, height: box.h, zIndex: on ? 6 : 5 }}
          >
            <img src={on ? "/art/horror/scene/tab-on.webp" : "/art/horror/scene/tab-off.webp"} alt="" draggable={false} />
            <span>{h.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
