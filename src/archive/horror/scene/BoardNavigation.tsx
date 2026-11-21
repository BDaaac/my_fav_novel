import type { Rect } from "@/data/horror/board/geometry";

/** жестяные указатели по бокам доски; на краю списка гаснут */
export function BoardNavigation({ prev, next, canPrev, canNext, onPrev, onNext, inline }: { inline?: boolean; prev: Rect; next: Rect; canPrev: boolean; canNext: boolean; onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button type="button" className="hs-arrow" style={inline ? undefined : { left: prev.x, top: prev.y, width: prev.w, height: prev.h }} disabled={!canPrev} onClick={onPrev} aria-label="Предыдущие снимки">
        <img src="/art/horror/scene/arrow-l.webp" alt="" draggable={false} />
      </button>
      <button type="button" className="hs-arrow next" style={inline ? undefined : { left: next.x, top: next.y, width: next.w, height: next.h }} disabled={!canNext} onClick={onNext} aria-label="Следующие снимки">
        <img src="/art/horror/scene/arrow-r.webp" alt="" draggable={false} />
      </button>
    </>
  );
}
