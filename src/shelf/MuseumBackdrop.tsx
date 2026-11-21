"use client";
import Image from "next/image";

/**
 * Архитектурное окружение зала тёмного литературного музея:
 * стена из мореного ореха с резным карнизом и паркетом, тонкая фактура штукатурки/дерева,
 * декоративные горизонтальные молдинги, мягкие боковые тени пилястр и тёплый отблеск
 * витрин на дубовом полу.
 */

const MOTES = [
  { x: "14%", y: "24%", size: 2, dur: 11, delay: 0, dx: 12, dy: -32 },
  { x: "27%", y: "38%", size: 1.5, dur: 14, delay: -3, dx: -10, dy: -28 },
  { x: "38%", y: "20%", size: 2, dur: 12, delay: -6, dx: 14, dy: -36 },
  { x: "49%", y: "44%", size: 1.5, dur: 15, delay: -2, dx: -8, dy: -24 },
  { x: "61%", y: "24%", size: 2, dur: 13, delay: -8, dx: 11, dy: -34 },
  { x: "73%", y: "36%", size: 1.5, dur: 16, delay: -5, dx: -12, dy: -30 },
  { x: "84%", y: "22%", size: 2, dur: 12, delay: -9, dx: 9, dy: -26 },
  { x: "22%", y: "58%", size: 1.5, dur: 15, delay: -7, dx: 10, dy: -30 },
  { x: "55%", y: "60%", size: 2, dur: 13, delay: -4, dx: -9, dy: -28 },
  { x: "78%", y: "56%", size: 1.5, dur: 14, delay: -11, dx: 11, dy: -26 },
];

export function MuseumBackdrop({ hallBg, still }: { hallBg?: string | null; still: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden bg-[#090504]">
      {/* Резервная фактура тёмного ореха, если внешнее изображение отсутствует */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#170e0a",
          backgroundImage:
            "radial-gradient(ellipse 80% 55% at 50% 42%, rgba(92, 56, 32, 0.28), transparent 72%)",
        }}
      />

      {/* Фотографический зал: резной потолочный карниз, сплошная ореховая стена и дубовый пол */}
      {hallBg && (
        <div className="absolute inset-0 opacity-[0.88]">
          <Image src={hallBg} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        </div>
      )}

      {/* Деликатная вертикальная фактура ореховых досок и тканого настенного полотна */}
      <div
        className="absolute inset-0 opacity-[0.26]"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.24) 0 1px, rgba(235, 206, 152, 0.025) 1px 2px, transparent 2px 96px)",
            "repeating-linear-gradient(0deg, rgba(255, 236, 200, 0.014) 0 1px, transparent 1px 4px)",
          ].join(", "),
        }}
      />

      {/* Декоративные настенные молдинги и архитектурные фризовые линии, встроенные в стену */}
      <div className="absolute inset-x-0 top-[29.5%] hidden md:block">
        <div className="h-px bg-[linear-gradient(90deg,transparent_4%,rgba(222,190,130,0.16)_20%,rgba(238,210,156,0.22)_50%,rgba(222,190,130,0.16)_80%,transparent_96%)]" />
        <div className="h-[5px] bg-[linear-gradient(180deg,rgba(46,29,18,0.42),rgba(10,6,4,0.58))]" />
        <div className="h-px bg-[linear-gradient(90deg,transparent_6%,rgba(218,186,126,0.09)_24%,rgba(218,186,126,0.12)_50%,rgba(218,186,126,0.09)_76%,transparent_94%)]" />
      </div>

      {/* Боковые архитектурные тени пилястр зала (создают глубину пространства) */}
      <div
        className="absolute inset-y-0 left-0 w-[14vw] max-w-[200px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(5, 3, 2, 0.88) 0%, rgba(12, 7, 5, 0.42) 52%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[14vw] max-w-[200px]"
        style={{
          background:
            "linear-gradient(270deg, rgba(5, 3, 2, 0.88) 0%, rgba(12, 7, 5, 0.42) 52%, transparent 100%)",
        }}
      />

      {/* Мягкая галерейная светотень: верхняя закарнизная подсветка, фокус в центре, тёплый отблеск на паркете */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 64% 30% at 50% 6%, rgba(255, 224, 166, 0.12), transparent 68%)",
            "radial-gradient(ellipse 76% 42% at 50% 94%, rgba(212, 162, 92, 0.09), transparent 72%)",
            "radial-gradient(ellipse 92% 84% at 50% 48%, transparent 36%, rgba(5, 3, 2, 0.82) 100%)",
          ].join(", "),
        }}
      />

      {/* Едва заметные золотистые пылинки в тёплом свете ламп */}
      {!still && (
        <div className="absolute inset-0 overflow-hidden">
          {MOTES.map((m, idx) => (
            <span
              key={idx}
              className="museum-mote absolute rounded-full bg-[#f5dfa9]"
              style={
                {
                  left: m.x,
                  top: m.y,
                  width: m.size,
                  height: m.size,
                  boxShadow: "0 0 6px rgba(245, 223, 169, 0.5)",
                  animationDuration: `${m.dur}s`,
                  animationDelay: `${m.delay}s`,
                  "--mote-dx": `${m.dx}px`,
                  "--mote-dy": `${m.dy}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
