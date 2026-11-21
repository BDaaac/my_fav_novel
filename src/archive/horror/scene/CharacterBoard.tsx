import { PHOTO_SLOTS, SLIPS } from "@/data/horror/board/geometry";
import { CharacterPhoto } from "./CharacterPhoto";
import type { BoardCharacter } from "./types";

/** доска: до 8 снимков; пустые окна закрываются чистой фотобумагой */
export function CharacterBoard({ items, slots, dir, pageKey }: { items: BoardCharacter[]; slots: number[]; dir: number; pageKey: string }) {
  return (
    <div className="hs-board" key={pageKey}>
      {PHOTO_SLOTS.map((at, s) => {
        const k = slots.indexOf(s);
        const c = k >= 0 ? items[k] : undefined;
        return <CharacterPhoto key={s} c={c} at={at} slip={SLIPS[s].at} slipImg={SLIPS[s].img} i={s} />;
      })}
    </div>
  );
}
