"use client";

import React, { useCallback, useRef } from "react";

export type CardGroup = "happy" | "pro" | "guild";

export interface HoloPixelCardProps {
  name: string;
  subtitle: string;
  group: CardGroup;
  art?: string | null;
  locked?: boolean;
  index: number;
  onSelect?: () => void;
  onHoverChange?: (hovering: boolean, group: CardGroup) => void;
}

/**
 * Коллекционная пиксельная ID-карта игрока «Славы» (5:7)
 * с точной голографической физикой и 3D-наклоном по канону simeydotme/pokemon-cards-css.
 * Никаких сим-чипов и чёрных плашек поверх лица: портрет от края до края + мягкий нижний градиент.
 */
export function HoloPixelCard({
  name,
  subtitle,
  group,
  art,
  locked = false,
  index,
  onSelect,
  onHoverChange,
}: HoloPixelCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);

  const handleMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch") return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    const cx = px - 50;
    const cy = py - 50;
    const hyp = Math.min(1, Math.hypot(cx, cy) / 50);

    // Точный Simey 3D-наклон + смещение фольги и блика
    const ry = (cx / 50) * 15;
    const rx = -(cy / 50) * 13;
    const bgx = 50 + (px - 50) * 0.45;
    const bgy = 50 + (py - 50) * 0.45;

    el.style.setProperty("--mx", `${px.toFixed(1)}%`);
    el.style.setProperty("--my", `${py.toFixed(1)}%`);
    el.style.setProperty("--bgx", `${bgx.toFixed(1)}%`);
    el.style.setProperty("--bgy", `${bgy.toFixed(1)}%`);
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--hyp", hyp.toFixed(3));
    el.style.setProperty("--o", "1");
  }, []);

  const handleEnter = useCallback(() => {
    onHoverChange?.(true, group);
  }, [group, onHoverChange]);

  const handleLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
      el.style.setProperty("--bgx", "50%");
      el.style.setProperty("--bgy", "50%");
      el.style.setProperty("--hyp", "0");
      el.style.setProperty("--o", "0");
    }
    onHoverChange?.(false, group);
  }, [group, onHoverChange]);

  const idxLabel = String(index + 1).padStart(2, "0");

  return (
    <div className="k-holo-slot" style={{ ["--stagger" as string]: `${index * 55}ms` }}>
      <button
        ref={cardRef}
        type="button"
        disabled={locked}
        onClick={locked ? undefined : onSelect}
        onPointerMove={handleMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        data-group={group}
        data-locked={locked ? "true" : "false"}
        className="k-holo-card"
        aria-label={locked ? `${name} — досье в разработке` : `Открыть досье: ${name}`}
      >
        <div className="k-holo-frame">
          {art ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={art}
              alt={name}
              className="k-holo-art"
              loading={index < 8 ? "eager" : "lazy"}
              decoding={index < 8 ? "sync" : "async"}
              fetchPriority={index < 4 ? "high" : undefined}
            />
          ) : (
            <div className="k-holo-placeholder" aria-hidden="true">
              <div className="k-holo-placeholder-grid" />
              <span className="k-holo-placeholder-id">ID · {idxLabel}</span>
              <span className="k-holo-placeholder-lock">
                {locked ? "ДОСЬЕ В РАЗРАБОТКЕ" : "ДОСЬЕ ГОТОВО · ПОРТРЕТ СКОРО"}
              </span>
            </div>
          )}

          {/* Точный многослойный голографический шейдер Simey */}
          <div className="k-holo-shine" aria-hidden="true" />
          <div className="k-holo-glare" aria-hidden="true" />

          {/* Мини-метка индекса в верхнем углу (не касается лица!) */}
          <span className="k-holo-idx" aria-hidden="true">{idxLabel}</span>
          {locked && art && (
            <span className="k-holo-soon-tag">СКОРО</span>
          )}

          {/* Мягкий нижний градиент и чёткая подпись (лицо 100% открыто) */}
          <div className="k-holo-footer">
            <span className="k-holo-name">{name}</span>
            <span className="k-holo-sub">{subtitle}</span>
          </div>
        </div>
      </button>
    </div>
  );
}
