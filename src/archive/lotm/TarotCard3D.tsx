"use client";

import React, { useCallback, useState } from "react";
import type { LotmCharacter } from "@/data/lotm/types";

interface TarotCard3DProps {
  character: LotmCharacter;
  onSelect: (character: LotmCharacter) => void;
  index: number;
}

/**
 * Коллекционная аниме-карта Таро (2:3, обсидиановая основа, тонкая золотая рамка)
 * с физикой наклона и подъёма как в «Пассивках» (LongDesk):
 * при наведении карта мягко приподнимается, отбрасывает глубокую тень
 * и плавно наклоняется вслед за курсором (без свечения и засвечивающего блика).
 */
export function TarotCard3D({ character, onSelect, index }: TarotCard3DProps) {
  const restTilt = (((index * 37) % 9) - 4) * 0.34;
  const eager = index < 8;
  const [loaded, setLoaded] = useState(eager);
  const onLoad = useCallback(() => setLoaded(true), []);
  const setImgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  const warmDossier = useCallback(() => {
    for (const src of ["/art/lotm/parchment-spread.webp", character.portrait]) {
      const im = new Image();
      im.decoding = "async";
      im.src = src;
    }
  }, [character.portrait]);

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
    el.style.setProperty("--px", `${(x * 3.5).toFixed(2)}px`);
    el.style.setProperty("--py", `${(y * 2.5).toFixed(2)}px`);
  };

  const handleLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--px", "0px");
    el.style.setProperty("--py", "0px");
  };

  const tarot = character.tarot;

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
        onPointerEnter={warmDossier}
        onFocus={warmDossier}
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
            ref={setImgRef}
            src={character.cardImage}
            alt={character.name}
            className={`lotm-card3d-art${loaded ? " is-loaded" : ""}`}
            loading={eager ? "eager" : "lazy"}
            fetchPriority={index < 4 ? "high" : undefined}
            decoding={eager ? "sync" : "async"}
            onLoad={onLoad}
          />
          <div className="lotm-card3d-footer-veil" aria-hidden="true" />
        </div>

        <div className="lotm-card3d-caption">
          {tarot ? (
            <>
              <span className="lotm-card3d-roman">
                <i aria-hidden="true">✦</i> {tarot.roman} <i aria-hidden="true">✦</i>
              </span>
              <span className="lotm-card3d-arcana">{tarot.arcana}</span>
              <span className="lotm-card3d-subname">{character.name}</span>
            </>
          ) : (
            <>
              <span className="lotm-card3d-star" aria-hidden="true">✦</span>
              <span className="lotm-card3d-name">{character.name}</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}
