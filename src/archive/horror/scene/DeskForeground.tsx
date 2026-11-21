import { SCENE } from "@/data/horror/board/geometry";

/** стол с книгами, кружкой, диктофоном и бумагами — отдельный слой поверх доски, чтобы снимки уходили за край стола */
export function DeskForeground() {
  const top = 842;
  return (
    <div
      className="hs-desk"
      aria-hidden
      style={{ top, width: SCENE.w, height: SCENE.h - top, backgroundPosition: `0 -${top}px`, backgroundSize: `${SCENE.w}px ${SCENE.h}px` }}
    />
  );
}
