"use client";

import type { KeyboardEvent } from "react";
import type { Car } from "@/data/baccano/cases";
import c from "./case.module.css";

/**
 * Схема состава «Флайинг Пуссифут» — линейный чертёж в профиль, как на железнодорожной
 * синьке. Порядок и типы вагонов — из данных TRAIN; ничего, кроме контура, не рисуется.
 */

const LEN: Record<Car["kind"], number> = {
  loco: 124,
  first: 100,
  dining: 108,
  second: 100,
  third: 100,
  cargo: 92,
  tech: 92,
  crew: 80,
};
const GAP = 10;
const H = 64;

export const carCode = (car: Car, list: Car[]) => {
  const same = list.filter((x) => x.kind === car.kind);
  const n = same.length > 1 ? `-${same.indexOf(car) + 1}` : "";
  const base = {
    loco: "Л",
    first: "I",
    dining: "Р",
    second: "II",
    third: "III",
    cargo: "Г",
    tech: "Т",
    crew: "П",
  }[car.kind];
  return base + n;
};

function Wheels({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 13} y={48} width={26} height={4} rx={1} />
      <circle cx={x - 7} cy={56} r={5} />
      <circle cx={x + 7} cy={56} r={5} />
    </g>
  );
}

/** Контур одной единицы в собственных координатах (0…len × 0…64). */
export function CarShape({ kind }: { kind: Car["kind"] }) {
  const L = LEN[kind];
  if (kind === "loco") {
    return (
      <g>
        {/* метельник, котёл, труба, сухопарник, будка машиниста */}
        <path d="M2 46 L14 34 L14 46 Z" />
        <rect x={14} y={18} width={74} height={26} rx={12} />
        <rect x={26} y={6} width={9} height={12} rx={1} />
        <rect x={50} y={10} width={14} height={8} rx={4} />
        <rect x={88} y={8} width={34} height={38} rx={2} className={c.body} />
        <rect x={96} y={14} width={10} height={11} rx={1} />
        <rect x={10} y={44} width={112} height={4} />
        <circle cx={36} cy={53} r={9} />
        <circle cx={58} cy={53} r={9} />
        <circle cx={80} cy={53} r={9} />
        <path d="M36 53 L80 53" />
        <circle cx={108} cy={56} r={5} />
      </g>
    );
  }
  const windows =
    kind === "cargo"
      ? 0
      : kind === "tech"
        ? 1
        : kind === "crew"
          ? 2
          : kind === "dining"
            ? 5
            : kind === "third"
              ? 7
              : 6;
  const ww = kind === "dining" ? 12 : 8;
  const span = L - 28;
  return (
    <g>
      {/* крыша фонарём, кузов, рама */}
      <path d={`M3 14 Q${L / 2} 2 ${L - 3} 14`} />
      <rect x={2} y={14} width={L - 4} height={32} rx={3} className={c.body} />
      <rect x={0} y={44} width={L} height={4} />
      {Array.from({ length: windows }, (_, i) => (
        <rect
          key={i}
          x={14 + (span - ww) * (windows > 1 ? i / (windows - 1) : 0.5)}
          y={20}
          width={ww}
          height={10}
          rx={1}
        />
      ))}
      {(kind === "cargo" || kind === "tech") && (
        <g>
          <rect x={L / 2 - 14} y={18} width={28} height={24} />
          <path
            d={`M${L / 2 - 14} 18 L${L / 2 + 14} 42 M${L / 2 + 14} 18 L${L / 2 - 14} 42`}
          />
        </g>
      )}
      {kind === "crew" && <circle cx={L - 8} cy={24} r={3} />}
      <Wheels x={18} />
      <Wheels x={L - 18} />
    </g>
  );
}

function onKey(e: KeyboardEvent, f: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    f();
  }
}

export function Train({
  train,
  car,
  setCar,
}: {
  train: Car[];
  car: string;
  setCar: (id: string) => void;
}) {
  const xs: number[] = [];
  let x = 8;
  for (const t of train) {
    xs.push(x);
    x += LEN[t.kind] + GAP;
  }
  const W = x - GAP + 8;
  const sel = train.find((t) => t.id === car) ?? train[0];
  const idx = train.indexOf(sel);

  return (
    <div className={c.train}>
      {/* компьютер: весь состав одной линией */}
      <svg
        className={c.trainWide}
        viewBox={`0 0 ${W} ${H + 34}`}
        role="listbox"
        aria-label="Вагоны «Флайинг Пуссифут», от локомотива к хвосту"
      >
        <path className={c.rail} d={`M0 ${H - 2} H${W}`} />
        {train.map((t, i) => (
          <g key={t.id}>
            {i > 0 && (
              <path className={c.coupler} d={`M${xs[i] - GAP} 46 H${xs[i]}`} />
            )}
            <g
              transform={`translate(${xs[i]} 0)`}
              className={c.carG}
              role="option"
              aria-selected={t.id === sel.id}
              aria-label={t.label}
              tabIndex={0}
              onClick={() => setCar(t.id)}
              onKeyDown={(e) => onKey(e, () => setCar(t.id))}
            >
              <rect
                className={c.hit}
                x={-4}
                y={0}
                width={LEN[t.kind] + 8}
                height={H + 30}
              />
              <CarShape kind={t.kind} />
              <text x={LEN[t.kind] / 2} y={H + 22} textAnchor="middle">
                {carCode(t, train)}
              </text>
            </g>
          </g>
        ))}
      </svg>

      {/* телефон: состав сверху вниз */}
      <ol
        className={c.trainTall}
        aria-label="Вагоны «Флайинг Пуссифут», от локомотива к хвосту"
      >
        {train.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              aria-pressed={t.id === sel.id}
              onClick={() => setCar(t.id)}
            >
              <svg viewBox={`-2 0 ${LEN.loco + 4} ${H}`} aria-hidden>
                <CarShape kind={t.kind} />
              </svg>
              <span>
                <b>{carCode(t, train)}</b> {t.label}
              </span>
            </button>
            {t.id === sel.id && <p className={c.carNoteTall}>{t.note}</p>}
          </li>
        ))}
      </ol>

      <div className={c.passport} aria-live="polite">
        <span className={c.passNo}>
          {String(idx + 1).padStart(2, "0")}
          <small>/{train.length}</small>
        </span>
        <span className={c.passBody}>
          <span className={c.passLabel}>{sel.label}</span>
          <span className={c.passText}>{sel.note}</span>
        </span>
      </div>
    </div>
  );
}
