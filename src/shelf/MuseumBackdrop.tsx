"use client";
import Image from "next/image";

/**
 * Архитектурный фон зала музея редких книг:
 * сплошная стена из тёмного мореного ореха с резным потолочным карнизом сверху
 * и паркетным дубовым полом снизу — без лишних рамок и CSS-полос, чтобы встроенный
 * музейный шкаф-витрина с книгами стоял в одном пространстве с залом.
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
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden bg-[#0a0604]">
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
        <div className="absolute inset-0 opacity-[0.86]">
          <Image src={hallBg} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        </div>
      )}

      {/* Мягкая галерейная светотень: подсвечивает центр зала и аккуратно уводит края в полумрак */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 68% 48% at 50% 24%, rgba(255, 224, 168, 0.08), transparent 68%)",
            "radial-gradient(ellipse 92% 84% at 50% 48%, transparent 38%, rgba(6, 3, 2, 0.78) 100%)",
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
