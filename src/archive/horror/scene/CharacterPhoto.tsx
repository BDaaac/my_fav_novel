import Link from "next/link";
import { CARD_PAD, type Rect } from "@/data/horror/board/geometry";
import type { BoardCharacter } from "./types";

/**
 * Карточка на доске — один физический объект, повёрнутый целиком:
 *   рамка из фотобумаги с кнопкой (frameN) → окно снимка (overflow: hidden) → портрет внутри,
 *   снизу полоска с именем. Портрет лежит под краем бумаги, а не поверх макета.
 */
export function CharacterPhoto({ c, at, slip, slipImg, i }: { c?: BoardCharacter; at: Rect; slip: Rect; slipImg: number; i: number }) {
  const rot = at.rot ?? 0;
  const W = at.w + CARD_PAD.l + CARD_PAD.r;
  const H = at.h + CARD_PAD.t + CARD_PAD.b;
  const cx = at.x + at.w / 2;
  const cy = at.y + at.h / 2;

  // полоска с именем в осях карточки: центр поворачивается вместе с карточкой
  const a = (-rot * Math.PI) / 180;
  const dx = slip.x + slip.w / 2 - cx;
  const dy = slip.y + slip.h / 2 - cy;
  const sx = W / 2 + dx * Math.cos(a) - dy * Math.sin(a);
  const sy = H / 2 + dx * Math.sin(a) + dy * Math.cos(a);

  const delay = { animationDelay: `${i * 45}ms` };
  const card = (
    <span className="hs-cardbox" style={{ left: cx - W / 2, top: cy - H / 2, width: W, height: H, transform: `rotate(${rot}deg)` }}>
      <span className={`hs-window${c?.portrait ? "" : " empty"}`} style={{ left: CARD_PAD.l, top: CARD_PAD.t, width: at.w, height: at.h, ...delay }}>
        {c?.portrait && <img src={c.portrait} alt="" draggable={false} />}
      </span>
      <img className="hs-frame" src={`/art/horror/scene/frame${i}.webp`} alt="" draggable={false} />
      {c && (
        <span className="hs-slip" style={{ left: sx - slip.w / 2, top: sy - slip.h / 2, width: slip.w, height: slip.h, transform: `rotate(${(slip.rot ?? 0) - rot}deg)`, ...delay }}>
          <img src={`/art/horror/scene/slip${slipImg}.webp`} alt="" draggable={false} />
          <b style={c.name.length > 10 ? { fontSize: c.name.length > 16 ? 18 : 23 } : undefined}>{c.name}</b>
        </span>
      )}
    </span>
  );
  if (!c) return card;
  if (!c.dossier)
    return (
      <span className="hs-card" title="Досье ещё не заведено">
        {card}
      </span>
    );
  return (
    <Link href={`/books/my-house-of-horrors/${c.id}`} className="hs-card live" aria-label={`Досье: ${c.name}`}>
      {card}
    </Link>
  );
}
