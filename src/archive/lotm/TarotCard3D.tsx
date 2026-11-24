"use client";

import React from "react";
import type { LotmCharacter } from "@/data/lotm/types";

interface TarotCard3DProps {
  character: LotmCharacter;
  onSelect: (character: LotmCharacter) => void;
  index: number;
}

/**
 * Барочная карта Таро с физикой наклона и подъёма как в «Пассивках» (LongDesk):
 * при наведении карта мягко приподнимается над столом, отбрасывает глубокую тень
 * и плавно наклоняется вслед за курсором (без свечения и засвечивающего блика).
 * На нижней ленте строго ТОЛЬКО имя персонажа.
 */
export function TarotCard3D({ character, onSelect, index }: TarotCard3DProps) {
  const restTilt = (((index * 37) % 9) - 4) * 0.38;

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    el.style.setProperty("--px", `${(x * 4).toFixed(2)}px`);
    el.style.setProperty("--py", `${(y * 3).toFixed(2)}px`);
  };

  const handleLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--px", "0px");
    el.style.setProperty("--py", "0px");
  };

  return (
    <div
      className="lotm-card3d-slot"
      style={{
        ["--rest-tilt" as string]: `${restTilt.toFixed(2)}deg`,
        ["--stagger" as string]: `${index * 45}ms`,
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(character)}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onPointerCancel={handleLeave}
        data-group={character.group}
        className="lotm-card3d"
        aria-label={`Открыть досье: ${character.name}`}
      >
        <div className="lotm-card3d-art-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.cardImage}
            alt={character.name}
            className="lotm-card3d-art"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div
          className="lotm-card3d-ribbon-text"
          style={character.ribbonBottom ? { bottom: character.ribbonBottom } : undefined}
        >
          <span className="lotm-card3d-name">{character.name}</span>
        </div>
      </button>
    </div>
  );
}
