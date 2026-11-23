/** Рисованные сцены дел (SVG). Детерминированные: одинаковы на сервере и в браузере. */

// целочисленный хеш: в отличие от Math.sin, даёт одинаковые числа в Node и в браузере
const rnd = (i: number) => {
  let x = Math.imul(Math.round(i * 1000) ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return Math.round(((x >>> 0) / 4294967296) * 1000) / 1000;
};

type Bld = { x: number; w: number; h: number; crown?: "step" | "spire" | "flat" };

const BLDS: Bld[] = [
  { x: 0, w: 70, h: 110 }, { x: 64, w: 52, h: 150, crown: "step" }, { x: 112, w: 80, h: 95 },
  { x: 186, w: 46, h: 175, crown: "spire" }, { x: 228, w: 90, h: 120 }, { x: 312, w: 58, h: 160, crown: "step" },
  { x: 366, w: 76, h: 105 }, { x: 560, w: 70, h: 140, crown: "step" }, { x: 626, w: 54, h: 190, crown: "spire" },
  { x: 676, w: 96, h: 115 }, { x: 768, w: 60, h: 150, crown: "step" }, { x: 824, w: 84, h: 100 },
  { x: 904, w: 50, h: 130 }, { x: 950, w: 70, h: 90 },
];

function windows(b: Bld, seed: number, lit: string) {
  const out: React.ReactNode[] = [];
  const cols = Math.max(2, Math.floor((b.w - 12) / 10));
  const rows = Math.floor((b.h - 18) / 12);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const v = rnd(seed * 97 + r * 13 + c);
      if (v > 0.62) out.push(<rect key={`${r}-${c}`} x={b.x + 7 + c * 10} y={300 - b.h + 12 + r * 12} width={4} height={6} fill={lit} opacity={0.35 + v * 0.6} />);
    }
  return out;
}

/** Манхэттен, ноябрь 1930: недостроенный Эмпайр Стейт в лесах, Манхэттенский мост справа. */
export function Skyline1930({ className, lit = "#f2c46d" }: { className?: string; lit?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="bc-sky30" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a10" />
          <stop offset="0.7" stopColor="#6b3f1c" />
          <stop offset="1" stopColor="#b77a35" />
        </linearGradient>
        <linearGradient id="bc-bld30" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d130c" />
          <stop offset="1" stopColor="#0e0906" />
        </linearGradient>
      </defs>
      <rect width="1200" height="300" fill="url(#bc-sky30)" />
      <circle cx="930" cy="96" r="70" fill="#ffd28a" opacity="0.14" />
      {/* Эмпайр Стейт: каркас ещё в лесах */}
      <g fill="#140d08">
        <rect x="452" y="70" width="80" height="230" />
        <rect x="466" y="40" width="52" height="40" />
        <rect x="478" y="18" width="28" height="30" />
      </g>
      <g stroke="#7a5230" strokeWidth="1" opacity="0.7">
        {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1="466" x2="518" y1={22 + i * 4.2} y2={22 + i * 4.2} />)}
        {Array.from({ length: 8 }, (_, i) => <line key={`v${i}`} x1={468 + i * 7} x2={468 + i * 7} y1="18" y2="80" />)}
      </g>
      <line x1="492" y1="18" x2="492" y2="2" stroke="#140d08" strokeWidth="3" />
      {BLDS.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={300 - b.h} width={b.w} height={b.h} fill="url(#bc-bld30)" />
          {b.crown === "step" && <rect x={b.x + b.w * 0.2} y={300 - b.h - 16} width={b.w * 0.6} height={16} fill="#120c07" />}
          {b.crown === "spire" && <polygon points={`${b.x + b.w * 0.25},${300 - b.h} ${b.x + b.w / 2},${300 - b.h - 40} ${b.x + b.w * 0.75},${300 - b.h}`} fill="#120c07" />}
          {windows(b, i + 1, lit)}
        </g>
      ))}
      {windows({ x: 452, w: 80, h: 230 }, 40, lit)}
      {/* Манхэттенский мост */}
      <g stroke="#120c07" fill="none">
        <path d="M1010 300 L1010 150 M1046 300 L1046 150 M1010 150 L1046 150 M1010 190 L1046 190" strokeWidth="7" />
        <path d="M1028 150 Q1110 250 1200 238" strokeWidth="3" />
        <path d="M1028 150 Q960 250 900 250" strokeWidth="3" />
        <path d="M900 262 L1200 262" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={1060 + i * 12} x2={1060 + i * 12} y1={158 + i * 7.5} y2="262" strokeWidth="1" opacity="0.6" />)}
      </g>
    </svg>
  );
}

/** Ночной экспресс: локомотив, освещённые окна вагонов, луна над равниной. */
export function NightTrain({ className, cars = 7 }: { className?: string; cars?: number }) {
  const carW = 150;
  return (
    <svg className={className} viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="bc-sky31" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060b16" />
          <stop offset="1" stopColor="#1b2c48" />
        </linearGradient>
        <radialGradient id="bc-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f3ead2" stopOpacity="0.9" />
          <stop offset="0.25" stopColor="#f3ead2" stopOpacity="0.25" />
          <stop offset="1" stopColor="#f3ead2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="300" fill="url(#bc-sky31)" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * 1200} cy={rnd(i + 50) * 150} r={rnd(i + 9) * 1.2 + 0.3} fill="#e8dcc0" opacity={0.25 + rnd(i + 3) * 0.5} />)}
      <circle cx="960" cy="70" r="110" fill="url(#bc-moon)" />
      <circle cx="960" cy="70" r="22" fill="#f1e7cc" />
      <path d="M0 230 Q200 190 420 215 T820 205 T1200 210 L1200 300 L0 300Z" fill="#0b1424" />
      <g transform="translate(40 0)">
        {/* локомотив */}
        <path d="M0 252 L0 212 Q0 200 14 200 L96 200 L96 178 L120 178 L120 200 L150 200 L150 252Z" fill="#05080f" />
        <rect x="18" y="170" width="18" height="30" fill="#05080f" />
        <circle cx="10" cy="226" r="5" fill="#f3cf86" />
        <path d="M-40 226 L5 220 L5 232Z" fill="#f3cf86" opacity="0.25" />
        {Array.from({ length: cars }, (_, i) => {
          const x = 160 + i * (carW + 8);
          return (
            <g key={i}>
              <rect x={x} y="206" width={carW} height="44" rx="5" fill="#0a1220" />
              <rect x={x} y="202" width={carW} height="6" rx="3" fill="#05080f" />
              {Array.from({ length: 6 }, (_, j) => (
                <rect key={j} x={x + 12 + j * 23} y="216" width="14" height="12" fill="#f3cf86" opacity={rnd(i * 7 + j) > 0.25 ? 0.85 : 0.15} />
              ))}
            </g>
          );
        })}
      </g>
      <rect x="0" y="256" width="1200" height="5" fill="#2c3e58" />
      {Array.from({ length: 60 }, (_, i) => <rect key={i} x={i * 20} y="261" width="10" height="4" fill="#1a2840" />)}
    </svg>
  );
}
