"use client";

import type { Dossier } from "@/data/passivki/types";
import { Card } from "./parts";
import { tell } from "./Slips";
import s from "./longdesk.module.css";

/**
 * Стол сверху — по утверждённому концепту: вверху окно и лампа, слева диск и ветка сливы, справа тушечница
 * и свиток, посередине поясные таблички по три в ряд. Первый экран — картинка концепта без табличек;
 * ниже стол продолжается на всю длину списка, и по краям лежат уже другие вещи.
 */

// вещи по краям продолжения стола: какая, с какой стороны, у какого ряда табличек, поворот и ширина в долях поля.
// Первые два ряда лежат на картинке концепта, там свои вещи.
type Prop = { src: string; side: "l" | "r"; row: number; rot?: number; w: number; dx?: number };
const PROPS: Prop[] = [
  { src: "prop-books", side: "l", row: 2.75, rot: -9, w: 0.74 },
  { src: "prop-tea", side: "r", row: 2.7, rot: 4, w: 0.86 },
  { src: "prop-seal", side: "l", row: 3.75, rot: 0, w: 0.56 },
  { src: "prop-fan", side: "r", row: 3.7, rot: -18, w: 0.94 },
  { src: "prop-slips", side: "l", row: 4.35, rot: 12, w: 0.86 },
  { src: "prop-censer", side: "r", row: 4.3, rot: 0, w: 0.52 },
  { src: "prop-sword", side: "l", row: 5.5, rot: -78, w: 1.5, dx: -0.12 },
  { src: "prop-books", side: "r", row: 5.4, rot: 11, w: 0.72 },
  { src: "prop-tea", side: "l", row: 6.45, rot: -8, w: 0.8 },
  { src: "prop-scroll", side: "r", row: 6.4, rot: 14, w: 0.7 },
  { src: "prop-blossom", side: "l", row: 7.4, rot: 150, w: 0.9 },
  { src: "prop-seal", side: "r", row: 7.5, rot: 0, w: 0.56 },
  { src: "prop-inkstone", side: "l", row: 8.3, rot: -170, w: 0.78 },
  { src: "prop-lantern", side: "r", row: 8.2, rot: 5, w: 0.72 },
];

export function LongDesk({
  heroes,
  has,
  onOpen,
  onBack,
}: {
  heroes: Dossier[];
  has: Set<string>;
  onOpen: (id: string, from: DOMRect | null) => void;
  onBack: () => void;
}) {
  // табличка наклоняется к курсору, как если бы её приподняли за край (без свечения)
  const tilt = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 11).toFixed(2)}deg`);
  };
  // задержали взгляд на табличке — её хозяин это заметил
  let dwell: ReturnType<typeof setTimeout> | undefined;
  const notice = (id: string) => {
    clearTimeout(dwell);
    dwell = setTimeout(() => tell({ type: "hero", id }), 650);
  };
  const flat = (e: React.PointerEvent<HTMLButtonElement>) => {
    clearTimeout(dwell);
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const rows = Math.ceil(heroes.length / 3);

  return (
    <div className={s.scroller}>
      <div className={s.desk}>
        <img className={s.plate} src="/art/passivki/desk-top.webp" alt="" />
        {/* диск слева на столе — путь обратно к выбору тома */}
        <button type="button" className={s.back} onClick={onBack} aria-label="К выбору тома" />

        <div className={s.field}>
          <div className={s.sideL} aria-hidden="true">
            {PROPS.filter((p) => p.side === "l" && p.row < rows).map((p, i) => (
              <img key={i} src={`/art/passivki/${p.src}.webp`} alt="" loading="lazy" style={propStyle(p)} />
            ))}
          </div>

          <ul className={s.grid}>
            {heroes.map((d, i) => (
              <li key={d.id} style={{ ["--tilt" as string]: `${(((i * 37) % 9) - 4) * 0.45}deg` }}>
                <button
                  type="button"
                  className={s.card}
                  data-card
                  onPointerEnter={() => notice(d.id)}
                  onPointerMove={tilt}
                  onPointerLeave={flat}
                  onClick={(e) => onOpen(d.id, e.currentTarget.getBoundingClientRect())}
                  aria-label={`${d.name}, ${d.affiliation}. Открыть досье`}
                >
                  <Card d={d} has={has.has(d.id)} />
                </button>
              </li>
            ))}
          </ul>

          <div className={s.sideR} aria-hidden="true">
            {PROPS.filter((p) => p.side === "r" && p.row < rows).map((p, i) => (
              <img key={i} src={`/art/passivki/${p.src}.webp`} alt="" loading="lazy" style={propStyle(p)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function propStyle(p: Prop): React.CSSProperties {
  return {
    top: `calc(var(--rowh) * ${p.row})`,
    width: `${p.w * 100}%`,
    left: `${(0.5 - p.w / 2 + (p.dx ?? 0)) * 100}%`,
    transform: `rotate(${p.rot ?? 0}deg)`,
  };
}
