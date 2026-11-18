"use client";
import { memo } from "react";
import type { SceneState, Theme } from "./world";
import type { Variant } from "./themes";
import { VIEW_H, VIEW_W } from "./useGuest";

export type KeyTone = "solved" | "alive" | "rest" | "plate" | "unknown";
export type RackKey = { id: string; tone: KeyTone };

const SERIF = "var(--font-cormorant), Georgia, serif";
const MONO = "var(--font-jetbrains), monospace";

// Высоты сцены (координаты мира)
const CORNICE = 30;
const WAIN = 390;
const BASE = 496;

// Проёмы в стене: парадный вход и арка коридора
const ENTRANCE = { l: 150, r: 350, top: 200, peak: 100 };
const CORRIDOR = { l: 2060, r: 2280, top: 230, peak: 140 };

function archPath(o: { l: number; r: number; top: number; peak: number }, bottom = BASE) {
  const rx = (o.r - o.l) / 2;
  const ry = o.top - o.peak;
  return `M${o.l} ${bottom} V${o.top} A${rx} ${ry} 0 0 1 ${o.r} ${o.top} V${bottom} Z`;
}

export function Defs({ t, v, seed, guestSx }: { t: Theme; v: Variant; seed: number; guestSx: number }) {
  return (
    <defs>
      {/* Обои: ар-деко ромбы / для чернил — штрих */}
      <pattern id={`${v}-wp`} width={60} height={120} patternUnits="userSpaceOnUse">
        <rect width={60} height={120} fill={t.wall} />
        <line x1={0} y1={0} x2={0} y2={120} stroke={t.wallLine} strokeWidth={t.hatch ? 1 : 2} />
        <path d="M30 22 L42 60 L30 98 L18 60 Z" fill="none" stroke={t.wallLine} strokeWidth={1.4} />
        <path d="M30 44 L36 60 L30 76 L24 60 Z" fill={t.wallLine} opacity={t.hatch ? 0.5 : 0.8} />
      </pattern>
      <pattern id={`${v}-hatch`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
        <line x1={0} y1={0} x2={0} y2={7} stroke={t.ink} strokeWidth={1.3} />
      </pattern>
      <pattern id={`${v}-xhatch`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
        <line x1={0} y1={0} x2={0} y2={7} stroke={t.ink} strokeWidth={1.3} />
      </pattern>
      <pattern id={`${v}-rug`} width={44} height={44} patternUnits="userSpaceOnUse">
        <rect width={44} height={44} fill={t.carpet} />
        <path d="M22 8 L34 22 L22 36 L10 22 Z" fill="none" stroke={t.carpetLine} strokeWidth={1.5} />
      </pattern>
      <radialGradient id={`${v}-glow`}>
        <stop offset="0" stopColor={t.light} stopOpacity={0.55} />
        <stop offset="0.4" stopColor={t.light} stopOpacity={0.18} />
        <stop offset="1" stopColor={t.light} stopOpacity={0} />
      </radialGradient>
      <linearGradient id={`${v}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.sky} stopOpacity={0.7} />
        <stop offset="1" stopColor={t.cloud} />
      </linearGradient>
      <linearGradient id={`${v}-deep`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={t.wallDark} />
        <stop offset="1" stopColor={t.ink} />
      </linearGradient>
      <radialGradient id={`${v}-vig`} cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={t.hatch ? 0.18 : 0.6} />
      </radialGradient>
      <radialGradient id={`${v}-dark`} gradientUnits="userSpaceOnUse" cx={guestSx} cy={430} r={300}>
        <stop offset="0" stopColor="#000" stopOpacity={0.1} />
        <stop offset="0.45" stopColor="#000" stopOpacity={0.75} />
        <stop offset="1" stopColor="#000" stopOpacity={0.96} />
      </radialGradient>
      <mask id={`${v}-holes`} maskUnits="userSpaceOnUse" x={0} y={0} width={2400} height={600}>
        <rect width={2400} height={600} fill="#fff" />
        <path d={archPath(ENTRANCE)} fill="#000" />
        <path d={archPath(CORRIDOR)} fill="#000" />
      </mask>
      <clipPath id={`${v}-door`}>
        <path d={archPath(ENTRANCE)} />
      </clipPath>

      {/* Чернила: дрожащая линия (seed меняется — линия «кипит») */}
      <filter id={`${v}-wobble`} filterUnits="userSpaceOnUse" x={-10} y={-10} width={VIEW_W + 20} height={VIEW_H + 20}>
        <feTurbulence type="fractalNoise" baseFrequency={0.03} numOctaves={2} seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={4.5} xChannelSelector="R" yChannelSelector="G" />
      </filter>

    </defs>
  );
}

/** Тень: в нуаре — затемнение, в чернилах — штриховка. */
function Shade({ t, v, x, y, w, h, o = 0.4, d }: { t: Theme; v: Variant; x?: number; y?: number; w?: number; h?: number; o?: number; d?: string }) {
  const fill = t.hatch ? `url(#${v}-hatch)` : "#000";
  const op = t.hatch ? Math.min(1, o + 0.35) : o;
  return d ? <path d={d} fill={fill} opacity={op} /> : <rect x={x} y={y} width={w} height={h} fill={fill} opacity={op} />;
}

/* ---------- Неподвижный слой стены и предметов (memo: перерисовывается только при смене состояния) ---------- */

export const Mid = memo(function Mid({ t, v, scene, keys }: { t: Theme; v: Variant; scene: SceneState; keys: RackKey[] }) {
  const ln = t.hatch ? { stroke: t.ink, strokeWidth: 2, strokeLinejoin: "round" as const } : {};
  const thin = t.hatch ? { stroke: t.ink, strokeWidth: 1.3 } : {};
  const toneFill: Record<KeyTone, string> = t.hatch
    ? { solved: "#f3ead6", alive: t.carpet, rest: "#9cc3d5", plate: "#b7a8e0", unknown: "#9a9080" }
    : { solved: "#d8cfb8", alive: "#8c1c24", rest: "#7fd4ff", plate: "#8f7cff", unknown: "#4a4440" };

  return (
    <g>
      {/* ===== Стена (с проёмами) ===== */}
      <g mask={`url(#${v}-holes)`}>
        <rect x={0} y={0} width={2400} height={BASE} fill={`url(#${v}-wp)`} />
        <rect x={0} y={0} width={2400} height={CORNICE} fill={t.wallDark} {...ln} />
        <rect x={0} y={CORNICE} width={2400} height={4} fill={t.brass} />
        {Array.from({ length: 120 }, (_, i) => (
          <rect key={i} x={i * 20 + 4} y={CORNICE + 4} width={12} height={9} fill={t.wallDark} {...thin} />
        ))}
        <Shade t={t} v={v} x={0} y={CORNICE + 13} w={2400} h={16} o={0.25} />
        {/* панели внизу стены */}
        <rect x={0} y={WAIN} width={2400} height={BASE - WAIN} fill={t.wood} {...ln} />
        <rect x={0} y={WAIN - 3} width={2400} height={5} fill={t.brass} />
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={i * 120 + 12} y={WAIN + 14} width={96} height={BASE - WAIN - 30} fill="none" stroke={t.woodDark} strokeWidth={t.hatch ? 1.5 : 3} />
        ))}
        {/* пилястры */}
        {[40, 1185, 1535, 1990, 2350].map((px) => (
          <g key={px}>
            <rect x={px - 14} y={CORNICE + 13} width={28} height={BASE - CORNICE - 13} fill={t.wallDark} {...ln} />
            <rect x={px - 20} y={CORNICE + 13} width={40} height={10} fill={t.brassDark} {...thin} />
            <line x1={px} y1={CORNICE + 30} x2={px} y2={BASE - 10} stroke={t.brassDark} strokeWidth={2} opacity={0.6} />
          </g>
        ))}
      </g>
      <rect x={0} y={BASE - 4} width={2400} height={8} fill={t.woodDark} {...ln} />

      {/* ===== Пол и ковровая дорожка ===== */}
      <rect x={0} y={BASE + 4} width={2400} height={600 - BASE} fill={t.floor} />
      {[520, 590].map((y) => (
        <line key={y} x1={0} y1={y} x2={2400} y2={y} stroke={t.wallLine} strokeWidth={1} opacity={0.35} />
      ))}
      {Array.from({ length: 31 }, (_, i) => (
        <line key={i} x1={i * 80} y1={BASE + 4} x2={i * 80 - 30} y2={600} stroke={t.wallLine} strokeWidth={1} opacity={0.25} />
      ))}
      <rect x={0} y={524} width={2400} height={44} fill={`url(#${v}-rug)`} />
      <line x1={0} y1={527} x2={2400} y2={527} stroke={t.brass} strokeWidth={1.5} opacity={0.7} />
      <line x1={0} y1={565} x2={2400} y2={565} stroke={t.brass} strokeWidth={1.5} opacity={0.7} />
      {t.hatch && <rect x={0} y={568} width={2400} height={32} fill={`url(#${v}-hatch)`} opacity={0.35} />}

      {/* ===== Парадный вход ===== */}
      <Entrance t={t} v={v} scene={scene} ln={ln} />

      {/* выключатель */}
      <g>
        <rect x={395} y={298} width={20} height={36} rx={2} fill={t.brass} {...ln} />
        <rect x={401} y={scene.lightsOff ? 318 : 304} width={8} height={12} fill={t.ink} />
      </g>

      {/* надпись «Путь к спасению 2» */}
      <g>
        <rect x={450} y={205} width={150} height={92} fill={t.wallDark} stroke={t.brass} strokeWidth={3} />
        <rect x={456} y={211} width={138} height={80} fill="none" stroke={t.brassDark} strokeWidth={1} />
        <text x={525} y={240} textAnchor="middle" fontFamily={SERIF} fontSize={17} fill={t.brass} fontStyle="italic">
          Путь к спасению
        </text>
        <text x={525} y={270} textAnchor="middle" fontFamily={SERIF} fontSize={26} fill={t.brass} fontWeight={700}>
          2
        </text>
        <text x={525} y={286} textAnchor="middle" fontFamily={SERIF} fontSize={9} fill={t.brassDark}>
          требуется особый Предмет
        </text>
      </g>

      {/* пальма в кадке */}
      <g>
        {[-60, -25, 10, 45, 75].map((a, i) => (
          <path
            key={i}
            d={`M660 450 Q${660 + a} ${380 - (i % 2) * 20} ${660 + a * 1.6} ${400 + (i % 3) * 12}`}
            fill="none"
            stroke={t.hatch ? t.ink : "#1d2a1a"}
            strokeWidth={t.hatch ? 2 : 7}
            strokeLinecap="round"
          />
        ))}
        <path d="M640 450 H680 L674 496 H646 Z" fill={t.brassDark} {...ln} />
      </g>

      {/* ===== Стойка регистрации ===== */}
      <Desk t={t} v={v} scene={scene} keys={keys} toneFill={toneFill} ln={ln} thin={thin} />

      {/* ===== Дисплеи с правилами ===== */}
      {[1255, 1345].map((dx, i) => (
        <g key={dx}>
          <rect x={dx - 4} y={186} width={88} height={108} fill={t.woodDark} {...ln} />
          <rect x={dx} y={190} width={80} height={100} fill={t.screen} />
          <g opacity={i === 1 && scene.blink ? 0.35 : 1}>
            <text x={dx + 40} y={206} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={t.screenText}>
              {i === 0 ? "ПРАВИЛА" : "ОТЕЛЬ"}
            </text>
            {[0, 1, 2, 3, 4].map((r) => (
              <rect key={r} x={dx + 8} y={216 + r * 13} width={(r * 17 + i * 23) % 40 + 28} height={4} fill={t.screenText} opacity={0.75} />
            ))}
          </g>
          {scene.blink && i === 0 && <rect x={dx + 8} y={281} width={10} height={4} fill={t.screenText} />}
          {!t.hatch && <rect x={dx - 20} y={170} width={120} height={140} fill={`url(#${v}-glow)`} opacity={0.18} />}
        </g>
      ))}

      {/* ===== Лифт ===== */}
      <Elevator t={t} v={v} ln={ln} thin={thin} />

      {/* ===== Арка в коридор 101–107 ===== */}
      <Corridor t={t} v={v} ln={ln} />
    </g>
  );
});

function Entrance({ t, v, scene, ln }: { t: Theme; v: Variant; scene: SceneState; ln: object }) {
  const { l, r, top, peak } = ENTRANCE;
  const mid = (l + r) / 2;
  return (
    <g>
      {/* рама арки */}
      <path d={archPath({ l: l - 14, r: r + 14, top, peak: peak - 14 })} fill="none" stroke={t.brass} strokeWidth={6} />
      <path d={archPath(ENTRANCE)} fill="none" stroke={t.hatch ? t.ink : t.brassDark} strokeWidth={t.hatch ? 3 : 10} />
      {/* створки */}
      {scene.doorOpen ? (
        <>
          <path d={`M${l} ${top - 10} L${l + 22} ${top + 6} L${l + 22} ${BASE - 8} L${l} ${BASE}`} fill={t.woodDark} {...ln} />
          <path d={`M${r} ${top - 10} L${r - 22} ${top + 6} L${r - 22} ${BASE - 8} L${r} ${BASE}`} fill={t.woodDark} {...ln} />
        </>
      ) : (
        <g clipPath={`url(#${v}-door)`}>
          {[l, mid].map((dx) => (
            <g key={dx}>
              <rect x={dx} y={peak} width={100} height={BASE - peak} fill={t.glass} opacity={t.hatch ? 0.25 : 0.35} />
              <rect x={dx + 2} y={peak} width={96} height={BASE - peak} fill="none" stroke={t.brass} strokeWidth={5} />
              <line x1={dx + 50} y1={peak} x2={dx + 50} y2={BASE} stroke={t.brass} strokeWidth={3} />
              <line x1={dx} y1={330} x2={dx + 100} y2={330} stroke={t.brass} strokeWidth={3} />
              <rect x={dx + (dx === l ? 82 : 8)} y={340} width={10} height={36} rx={3} fill={t.brass} />
            </g>
          ))}
        </g>
      )}
      {/* табличка отеля над входом */}
      <rect x={mid - 70} y={58} width={140} height={28} fill={t.wallDark} stroke={t.brass} strokeWidth={2} />
      <text x={mid} y={78} textAnchor="middle" fontFamily={SERIF} fontSize={18} letterSpacing={4} fill={t.brass} fontWeight={700}>
        ПИОНЕР
      </text>
      {/* свет из открытой двери на полу */}
      {scene.doorOpen && !scene.lightsOff && (
        <path d={`M${l} ${BASE} L${r} ${BASE} L${r + 90} 600 L${l - 90} 600 Z`} fill={t.cloud} opacity={t.hatch ? 0.5 : 0.18} />
      )}
    </g>
  );
}

/** То, что за стеклом входа: небо и облака далеко внизу; в темноте — Святилище. Сдвигается медленнее стены. */
export function EntranceView({ t, v, cam, lightsOff }: { t: Theme; v: Variant; cam: number; lightsOff: boolean }) {
  const { l, r, peak } = ENTRANCE;
  const off = cam * 0.7; // итоговый сдвиг на экране = 0.3 от камеры — кажется далеко
  return (
    <g clipPath={`url(#${v}-door)`}>
      {lightsOff ? (
        <>
          <rect x={l} y={peak} width={r - l} height={BASE - peak} fill="#020203" />
          <g transform={`translate(${off * 0.3} 0)`}>
            <path d="M226 420 V360 L250 340 L274 360 V420 Z" fill="none" stroke={t.light} strokeWidth={2} opacity={0.8} />
            <rect x={243} y={385} width={14} height={35} fill={t.light} opacity={0.9} />
          </g>
        </>
      ) : (
        <>
          <rect x={l} y={peak} width={r - l} height={BASE - peak} fill={`url(#${v}-sky)`} />
          {t.hatch && <rect x={l} y={peak} width={r - l} height={160} fill={`url(#${v}-hatch)`} opacity={0.12} />}
          <g transform={`translate(${off} 0)`}>
            {[-300, -150, 0, 150, 300, 450, 600, 750, 900, 1050, 1200].map((cx, i) => (
              <g key={cx} fill={t.cloud} stroke={t.hatch ? t.ink : "none"} strokeWidth={1.5}>
                <ellipse cx={cx} cy={440 + (i % 3) * 14} rx={70} ry={20} />
                <ellipse cx={cx + 40} cy={428 + (i % 2) * 10} rx={40} ry={18} />
                <ellipse cx={cx - 35} cy={432} rx={35} ry={14} />
              </g>
            ))}
          </g>
        </>
      )}
    </g>
  );
}

function Desk({
  t, v, scene, keys, toneFill, ln, thin,
}: { t: Theme; v: Variant; scene: SceneState; keys: RackKey[]; toneFill: Record<KeyTone, string>; ln: object; thin: object }) {
  return (
    <g>
      {/* табличка */}
      <rect x={835} y={128} width={150} height={26} fill={t.wallDark} stroke={t.brass} strokeWidth={2} />
      <text x={910} y={146} textAnchor="middle" fontFamily={SERIF} fontSize={14} letterSpacing={3} fill={t.brass}>
        РЕГИСТРАЦИЯ
      </text>
      {/* стенд ключей */}
      <rect x={768} y={168} width={284} height={130} fill={t.wood} {...ln} />
      <rect x={776} y={176} width={268} height={114} fill="none" stroke={t.brassDark} strokeWidth={2} />
      {keys.map((k, i) => {
        const kx = 800 + i * 37;
        const plate = k.tone === "plate";
        return (
          <g key={k.id}>
            <circle cx={kx} cy={196} r={3.5} fill={t.brass} />
            {!plate && (
              <>
                <line x1={kx} y1={196} x2={kx} y2={226} stroke={t.brass} strokeWidth={3} />
                <circle cx={kx} cy={204} r={5} fill="none" stroke={t.brass} strokeWidth={2.5} />
                <path d={`M${kx} 220 h6 M${kx} 225 h4`} stroke={t.brass} strokeWidth={2} />
              </>
            )}
            <rect
              x={kx - 11}
              y={228}
              width={22}
              height={34}
              rx={3}
              fill={toneFill[k.tone]}
              stroke={t.hatch ? t.ink : t.brassDark}
              strokeWidth={1.5}
              strokeDasharray={plate ? "3 2" : undefined}
            />
            <text x={kx} y={249} textAnchor="middle" fontFamily={MONO} fontSize={8} fontWeight={700} fill={k.tone === "alive" || k.tone === "unknown" ? "#f1e6cf" : "#14100d"}>
              {k.id}
            </text>
          </g>
        );
      })}
      {/* лампа и её свет */}
      {t.glow && !scene.lightsOff && <ellipse cx={790} cy={380} rx={150} ry={110} fill={`url(#${v}-glow)`} />}
      <path d="M770 352 L810 352 L800 336 L780 336 Z" fill={t.brass} {...ln} />
      <line x1={790} y1={352} x2={790} y2={398} stroke={t.brassDark} strokeWidth={3} />
      <ellipse cx={790} cy={398} rx={14} ry={4} fill={t.brassDark} />
      {/* стойка */}
      <rect x={710} y={398} width={400} height={12} fill={t.hatch ? "#f3ead6" : "#3a2b22"} {...ln} />
      <rect x={720} y={410} width={380} height={106} fill={t.wood} {...ln} />
      <Shade t={t} v={v} x={720} y={410} w={380} h={12} o={0.45} />
      <line x1={720} y1={428} x2={1100} y2={428} stroke={t.brass} strokeWidth={2} />
      <line x1={720} y1={504} x2={1100} y2={504} stroke={t.brass} strokeWidth={2} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (i / 8) * Math.PI;
        return <line key={i} x1={910} y1={504} x2={910 + Math.cos(a) * 66} y2={504 + Math.sin(a) * 66} stroke={t.brass} strokeWidth={1.5} opacity={0.8} />;
      })}
      <path d="M844 504 A66 66 0 0 1 976 504" fill="none" stroke={t.brass} strokeWidth={2} />
      <rect x={740} y={440} width={80} height={56} fill="none" stroke={t.woodDark} strokeWidth={3} />
      <rect x={1000} y={440} width={80} height={56} fill="none" stroke={t.woodDark} strokeWidth={3} />
      {/* гостевая книга */}
      <path d="M846 398 L874 391 L902 398 L874 401 Z" fill={t.hatch ? "#fffaf0" : "#d8cfb8"} {...ln} />
      <line x1={874} y1={391} x2={874} y2={401} stroke={t.ink} strokeWidth={1} />
      {/* колокольчик */}
      <path d="M988 398 A12 12 0 0 1 1012 398 Z" fill={t.brass} {...ln} />
      <rect x={998} y={382} width={4} height={5} fill={t.brass} />
      <rect x={984} y={397} width={32} height={3} fill={t.brassDark} />
      {/* закуски появляются, когда отвернёшься */}
      {scene.snacks && (
        <g>
          <ellipse cx={1062} cy={398} rx={26} ry={5} fill="#f1e6cf" {...ln} />
          <path d="M1046 396 l8 -9 l8 9 Z M1060 396 l8 -9 l8 9 Z" fill="#c98b4a" {...ln} />
          <rect x={1072} y={386} width={9} height={11} rx={2} fill="#f1e6cf" {...ln} />
        </g>
      )}
    </g>
  );
}

function Elevator({ t, v, ln, thin }: { t: Theme; v: Variant; ln: object; thin: object }) {
  return (
    <g>
      {/* стрелка этажей */}
      <path d="M1680 172 A40 40 0 0 1 1760 172 Z" fill={t.brassDark} {...ln} />
      <path d="M1686 172 A34 34 0 0 1 1754 172" fill="none" stroke={t.brass} strokeWidth={2} />
      {["Б", "1", "2", "3"].map((s, i) => {
        const a = Math.PI + ((i + 0.5) / 4) * Math.PI;
        return (
          <text key={s} x={1720 + Math.cos(a) * 26} y={170 + Math.sin(a) * 26} textAnchor="middle" fontFamily={MONO} fontSize={8} fill={t.light}>
            {s}
          </text>
        );
      })}
      <line x1={1720} y1={172} x2={1720 + Math.cos(Math.PI * 1.375) * 22} y2={172 + Math.sin(Math.PI * 1.375) * 22} stroke="#c0333d" strokeWidth={2.5} />
      {/* рама и двери */}
      <rect x={1630} y={186} width={180} height={BASE - 186} fill={t.brassDark} {...ln} />
      <rect x={1645} y={204} width={150} height={BASE - 204} fill={t.brass} {...ln} />
      <line x1={1720} y1={204} x2={1720} y2={BASE} stroke={t.ink} strokeWidth={2} />
      {[1645, 1720].map((dx) => (
        <g key={dx}>
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={dx + 37.5} y1={BASE - 6} x2={dx + i * 12.5} y2={260} stroke={t.brassDark} strokeWidth={1.4} />
          ))}
          <rect x={dx + 8} y={214} width={59} height={36} fill="none" stroke={t.brassDark} strokeWidth={2} />
        </g>
      ))}
      <Shade t={t} v={v} x={1645} y={204} w={150} h={10} o={0.4} />
      {/* панель вызова */}
      <rect x={1822} y={318} width={26} height={70} rx={3} fill={t.brassDark} {...ln} />
      <circle cx={1835} cy={336} r={5} fill={t.light} {...thin} />
      <circle cx={1835} cy={354} r={5} fill={t.brass} {...thin} />
      <circle cx={1835} cy={374} r={6} fill="#c0333d" {...thin} />
    </g>
  );
}

function Corridor({ t, v, ln }: { t: Theme; v: Variant; ln: object }) {
  const { l, r, top, peak } = CORRIDOR;
  const cx = (l + r) / 2;
  return (
    <g>
      <path d={archPath(CORRIDOR)} fill={`url(#${v}-deep)`} />
      {/* глубина коридора */}
      <rect x={cx - 26} y={310} width={52} height={110} fill={t.ink} />
      <path d={`M${l} ${BASE} L${r} ${BASE} L${cx + 26} 420 L${cx - 26} 420 Z`} fill={t.carpet} opacity={0.85} />
      <path d={`M${l} ${top} L${cx - 26} 310 M${r} ${top} L${cx + 26} 310`} stroke={t.wallLine} strokeWidth={1.5} opacity={0.6} />
      {[0, 1, 2].map((i) => {
        const s = 1 - i * 0.28;
        const lx = l + 18 + i * 22;
        const rx = r - 18 - i * 22;
        const h = 150 * s;
        const by = BASE - 10 - i * 26;
        return (
          <g key={i} opacity={0.9 - i * 0.2}>
            <rect x={lx} y={by - h} width={14 * s} height={h} fill={t.wood} stroke={t.brassDark} strokeWidth={1} />
            <rect x={rx - 14 * s} y={by - h} width={14 * s} height={h} fill={t.wood} stroke={t.brassDark} strokeWidth={1} />
          </g>
        );
      })}
      <Shade t={t} v={v} d={archPath(CORRIDOR)} o={0.35} />
      <path d={archPath({ l: l - 12, r: r + 12, top, peak: peak - 12 })} fill="none" stroke={t.brass} strokeWidth={6} />
      {/* указатель */}
      <rect x={cx - 92} y={92} width={184} height={30} fill={t.wallDark} stroke={t.brass} strokeWidth={2} {...ln} />
      <text x={cx} y={113} textAnchor="middle" fontFamily={SERIF} fontSize={16} letterSpacing={2} fill={t.brass}>
        НОМЕРА 101–107 →
      </text>
    </g>
  );
}

/* ---------- Люстры (ближе к зрителю, параллакс 1.12) ---------- */
export const Chandeliers = memo(function Chandeliers({ t, v, off }: { t: Theme; v: Variant; off: boolean }) {
  return (
    <g>
      {[260, 760, 1260, 1760, 2260].map((cx) => (
        <g key={cx}>
          {t.glow && !off && <ellipse cx={cx} cy={90} rx={170} ry={120} fill={`url(#${v}-glow)`} opacity={0.8} />}
          <line x1={cx} y1={0} x2={cx} y2={62} stroke={t.brassDark} strokeWidth={2} />
          <path d={`M${cx - 44} 84 Q${cx} 112 ${cx + 44} 84`} fill="none" stroke={t.brass} strokeWidth={3} />
          <ellipse cx={cx} cy={82} rx={46} ry={7} fill="none" stroke={t.brass} strokeWidth={3} />
          <path d={`M${cx - 10} 62 L${cx + 10} 62 L${cx + 4} 104 L${cx - 4} 104 Z`} fill={t.brass} stroke={t.hatch ? t.ink : "none"} strokeWidth={1.5} />
          {[-40, -20, 0, 20, 40].map((dx) => (
            <g key={dx}>
              <line x1={cx + dx} y1={84} x2={cx + dx} y2={100 + Math.abs(dx) / 6} stroke={t.brass} strokeWidth={1} opacity={0.7} />
              <rect x={cx + dx - 2} y={66} width={4} height={14} fill={off ? t.wallDark : "#f1e6cf"} />
              <circle cx={cx + dx} cy={63} r={off ? 2 : 3.5} fill={off ? t.brassDark : t.light} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
});

/* ---------- Передний план (колонны, параллакс 1.4) ---------- */
export const Front = memo(function Front({ t }: { t: Theme }) {
  const fill = t.hatch ? t.ink : "#040303";
  return (
    <g>
      {[1000, 1900, 2750].map((px) => (
        <g key={px}>
          <rect x={px - 38} y={-10} width={76} height={620} fill={fill} />
          <rect x={px - 48} y={-10} width={96} height={34} fill={fill} />
          <rect x={px - 48} y={566} width={96} height={44} fill={fill} />
          {!t.hatch && <line x1={px + 36} y1={24} x2={px + 36} y2={566} stroke={t.brass} strokeWidth={1.5} opacity={0.35} />}
        </g>
      ))}
      {/* пальма-силуэт у края */}
      <g fill={fill}>
        <path d="M2380 600 L2390 540 L2430 540 L2440 600 Z" />
        {[-70, -35, 0, 35, 70].map((a, i) => (
          <path key={i} d={`M2410 540 Q${2410 + a} ${470 - (i % 2) * 25} ${2410 + a * 1.7} ${495 + (i % 3) * 10}`} fill="none" stroke={fill} strokeWidth={9} strokeLinecap="round" />
        ))}
      </g>
    </g>
  );
});

/* ---------- Гость-силуэт ---------- */
export function Guest({ t, x, facing, dist, walking }: { t: Theme; x: number; facing: 1 | -1; dist: number; walking: boolean }) {
  const ph = dist / 24;
  const sw = walking ? Math.sin(ph) * 26 : 0;
  const bob = walking ? -Math.abs(Math.sin(ph)) * 3 : 0;
  const fill = t.hatch ? t.ink : "#030202";
  const rim = t.hatch ? {} : { stroke: t.brass, strokeOpacity: 0.45, strokeWidth: 1.2 };
  return (
    <g transform={`translate(${x} 540)`}>
      <ellipse cx={0} cy={2} rx={28} ry={5} fill="#000" opacity={t.hatch ? 0.25 : 0.5} />
      <g transform={`scale(${facing} 1) translate(0 ${bob})`}>
        <rect x={-5.5} y={-80} width={11} height={78} rx={4} fill={fill} transform={`rotate(${sw} 0 -80)`} {...rim} />
        <rect x={-5.5} y={-80} width={11} height={78} rx={4} fill={fill} transform={`rotate(${-sw} 0 -80)`} {...rim} />
        <rect x={-4.5} y={-140} width={9} height={60} rx={4} fill={fill} transform={`rotate(${-sw * 0.6} 0 -138)`} />
        <path d="M-15 -144 L15 -144 L23 -72 L-23 -72 Z" fill={fill} {...rim} />
        <path d="M-6 -144 L0 -128 L6 -144" fill="none" stroke={t.hatch ? "#f3ead6" : t.brassDark} strokeWidth={1.4} />
        <rect x={-4.5} y={-140} width={9} height={58} rx={4} fill={fill} transform={`rotate(${sw * 0.6} 0 -138)`} {...rim} />
        <circle cx={1} cy={-157} r={13} fill={fill} {...rim} />
        <ellipse cx={2} cy={-166} rx={21} ry={3.5} fill={fill} {...rim} />
        <rect x={-10} y={-185} width={22} height={20} rx={5} fill={fill} {...rim} />
      </g>
    </g>
  );
}

export function LobbySvg(props: {
  t: Theme;
  v: Variant;
  scene: SceneState;
  keys: RackKey[];
  x: number;
  facing: 1 | -1;
  dist: number;
  walking: boolean;
  cam: number;
  seed: number;
}) {
  const { t, v, scene, keys, x, facing, dist, walking, cam, seed } = props;
  const filter = v === "ink" ? `url(#${v}-wobble)` : undefined;
  const guestSx = x - cam;
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-full w-full select-none" aria-label="Вестибюль отеля «Пионер»">
      <Defs t={t} v={v} seed={seed} guestSx={guestSx} />
      <g filter={filter}>
        <rect width={VIEW_W} height={VIEW_H} fill={t.wall} />
        <g transform={`translate(${-cam} 0)`}>
          <EntranceView t={t} v={v} cam={cam} lightsOff={scene.lightsOff} />
          <Mid t={t} v={v} scene={scene} keys={keys} />
          <Guest t={t} x={x} facing={facing} dist={dist} walking={walking} />
        </g>
        <g transform={`translate(${-cam * 1.12} 0)`}>
          <Chandeliers t={t} v={v} off={scene.lightsOff} />
        </g>
        <g transform={`translate(${-cam * 1.4} 0)`}>
          <Front t={t} />
        </g>
        {scene.lightsOff && (
          <>
            <rect width={VIEW_W} height={VIEW_H} fill={`url(#${v}-dark)`} />
            {/* свечение Святилища за стеклом пробивается сквозь тьму */}
            <ellipse cx={250 - cam} cy={390} rx={60} ry={50} fill={`url(#${v}-glow)`} />
          </>
        )}
        <rect width={VIEW_W} height={VIEW_H} fill={`url(#${v}-vig)`} pointerEvents="none" />
      </g>
    </svg>
  );
}
