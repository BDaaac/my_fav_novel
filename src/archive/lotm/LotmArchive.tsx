"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { LOTM_VOLUMES, type LotmCharacter, type LotmGroup, type LotmVolumeMeta } from "@/data/lotm/types";
import { VolumeSymbol } from "./LotmOrnaments";
import { TarotCard3D } from "./TarotCard3D";
import { ParchmentDossier } from "./ParchmentDossier";
import "./lotm.css";

interface LotmArchiveProps {
  characters: LotmCharacter[];
}

const SECTIONS: { key: LotmGroup; title: string; subtitle: string }[] = [
  {
    key: "tarot",
    title: "КЛУБ ТАРО · НАД СЕРЫМ ТУМАНОМ",
    subtitle: "Собрание Старших Арканов вне времени и взора богов",
  },
  {
    key: "nighthawks",
    title: "НОЧНЫЕ ЯСТРЕБЫ · «ЧЁРНЫЙ ТЕРН»",
    subtitle: "Стражи Церкви Богини Вечной Ночи в Тингене",
  },
  {
    key: "allies",
    title: "ТИНГЕН · СЕМЬЯ И СОЮЗНИКИ",
    subtitle: "Те, ради кого стоило хранить рассудок",
  },
  {
    key: "antagonists",
    title: "ТЕНИ И АНТАГОНИСТЫ",
    subtitle: "Кукловоды, секты и угроза у Врат Чаниса",
  },
];

export function LotmArchive({ characters }: LotmArchiveProps) {
  const [view, setView] = useState<"volumes" | "characters">("volumes");
  const [selectedVolNum, setSelectedVolNum] = useState<number>(1);
  const [activeCharacter, setActiveCharacter] = useState<LotmCharacter | null>(null);

  const selectedVol: LotmVolumeMeta = useMemo(
    () => LOTM_VOLUMES.find((v) => v.num === selectedVolNum) ?? LOTM_VOLUMES[0],
    [selectedVolNum]
  );

  const grouped = useMemo(() => {
    const map: Record<LotmGroup, LotmCharacter[]> = {
      tarot: [],
      nighthawks: [],
      allies: [],
      antagonists: [],
    };
    for (const c of characters) map[c.group].push(c);
    return map;
  }, [characters]);

  const openVolume = (vol: LotmVolumeMeta) => {
    if (!vol.ready) return;
    setView("characters");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="lotm-root">
      {/* Постоянный атмосферный фон сайта: Тинген, багровая луна, Серый Туман, астролябия */}
      <div className="lotm-backdrop" aria-hidden="true">
        <div
          className="lotm-backdrop-art"
          style={{ backgroundImage: 'url("/art/lotm/bg-tingen.webp")' }}
        />
        <div className="lotm-backdrop-vignette" />
        <div className="lotm-fog-layer lotm-fog-layer--a" />
        <div className="lotm-fog-layer lotm-fog-layer--b" />
        <svg className="lotm-astrolabe-bg" viewBox="0 0 900 900" fill="none">
          <circle cx="450" cy="450" r="390" stroke="#e4c384" strokeOpacity="0.14" strokeWidth="1" />
          <circle cx="450" cy="450" r="335" stroke="#e4c384" strokeOpacity="0.1" strokeWidth="0.9" strokeDasharray="4 10" />
          <circle cx="450" cy="450" r="240" stroke="#e4c384" strokeOpacity="0.09" strokeWidth="0.8" />
          <line x1="60" y1="450" x2="840" y2="450" stroke="#e4c384" strokeOpacity="0.08" />
          <line x1="450" y1="60" x2="450" y2="840" stroke="#e4c384" strokeOpacity="0.08" />
          <line x1="175" y1="175" x2="725" y2="725" stroke="#e4c384" strokeOpacity="0.06" />
          <line x1="725" y1="175" x2="175" y2="725" stroke="#e4c384" strokeOpacity="0.06" />
        </svg>
      </div>

      {view === "volumes" ? (
        /* ==================== ЭКРАН 1: МЕНЮ ВЫБОРА ТОМА (БЕЗ КАРТОЧЕК ПЕРСОНАЖЕЙ) ==================== */
        <main className="lotm-menu-screen">
          <header className="lotm-menu-header">
            <Link href="/" className="lotm-back-link">
              ← БИБЛИОТЕКА
            </Link>
            <div className="lotm-brand-center">
              <h1 className="lotm-main-title">ПОВЕЛИТЕЛЬ ТАЙН</h1>
              <div className="lotm-subtitle-row">
                <span className="lotm-hairline" aria-hidden="true" />
                <p className="lotm-main-subtitle">АРХИВ ТОМОВ · ВЫБЕРИТЕ ТОМ</p>
                <span className="lotm-hairline" aria-hidden="true" />
              </div>
            </div>
            <div className="lotm-header-spacer" aria-hidden="true" />
          </header>

          <section className="lotm-volume-hero">
            {/* Фолиант выбранного тома */}
            <div className="lotm-grimoire-stage">
              <div className="lotm-grimoire-glow" aria-hidden="true" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/art/lotm/vol1-grimoire.webp"
                alt={`Том ${selectedVol.roman} · ${selectedVol.title}`}
                className={`lotm-grimoire-img ${selectedVol.ready ? "" : "lotm-grimoire-img--sealed"}`}
              />
              {!selectedVol.ready && (
                <div className="lotm-sealed-overlay">
                  <span className="lotm-sealed-num">{selectedVol.roman}</span>
                  <span className="lotm-sealed-caption">Запечатан · В работе</span>
                </div>
              )}
            </div>

            {/* Описание и кнопка входа в выбранный том */}
            <div className="lotm-volume-copy" key={selectedVol.num}>
              <div className="lotm-copy-ornament" aria-hidden="true">
                <span />
                <i>✦</i>
                <span />
              </div>
              <h2 className="lotm-volume-title">
                ТОМ {selectedVol.roman} · {selectedVol.title.toUpperCase()}
              </h2>
              <p className="lotm-volume-meta">
                {selectedVol.chapters} · {selectedVol.setting}
              </p>
              <p className="lotm-volume-blurb">{selectedVol.blurb}</p>

              {selectedVol.stats ? (
                <div className="lotm-stat-pills">
                  <span className="lotm-stat-pill">Персонажи · {selectedVol.stats.characters}</span>
                  <span className="lotm-stat-pill">Клуб Таро · {selectedVol.stats.tarot}</span>
                  <span className="lotm-stat-pill">Артефакты · {selectedVol.stats.artifacts}</span>
                </div>
              ) : (
                <div className="lotm-stat-pills">
                  <span className="lotm-stat-pill lotm-stat-pill--muted">
                    Хроника готовится к открытию
                  </span>
                </div>
              )}

              <div className="lotm-cta-row">
                {selectedVol.ready ? (
                  <button
                    type="button"
                    className="lotm-open-btn"
                    onClick={() => openVolume(selectedVol)}
                  >
                    <span>ОТКРЫТЬ ТОМ {selectedVol.roman}</span>
                    <span className="lotm-open-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ) : (
                  <button type="button" className="lotm-open-btn lotm-open-btn--locked" disabled>
                    <span>ТОМ {selectedVol.roman} ЕЩЁ ЗАПЕЧАТАН</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Нижняя полоса выбора всех 8 томов */}
          <nav className="lotm-volumes-dock" aria-label="Выбор тома новеллы">
            {LOTM_VOLUMES.map((vol) => {
              const isSelected = vol.num === selectedVol.num;
              return (
                <button
                  key={vol.num}
                  type="button"
                  onClick={() => setSelectedVolNum(vol.num)}
                  onDoubleClick={() => openVolume(vol)}
                  data-active={isSelected ? "true" : "false"}
                  data-ready={vol.ready ? "true" : "false"}
                  className="lotm-vol-tile"
                >
                  {vol.ready && <span className="lotm-vol-star" aria-hidden="true">✦</span>}
                  <VolumeSymbol symbol={vol.symbol} className="lotm-vol-icon" />
                  <span className="lotm-vol-name">
                    {vol.roman} · {vol.title}
                  </span>
                  <span className="lotm-vol-range">{vol.rangeShort}</span>
                </button>
              );
            })}
          </nav>
        </main>
      ) : (
        /* ==================== ЭКРАН 2: КАРТОТЕКА ПЕРСОНАЖЕЙ (БЕЗ ПОИСКА И ФИЛЬТРОВ) ==================== */
        <main className="lotm-gallery-screen">
          <header className="lotm-gallery-header">
            <button
              type="button"
              onClick={() => {
                setActiveCharacter(null);
                setView("volumes");
              }}
              className="lotm-back-link"
            >
              ← ВЫБОР ТОМА
            </button>

            <div className="lotm-brand-center">
              <h1 className="lotm-gallery-title">
                ТОМ {selectedVol.roman} · {selectedVol.title.toUpperCase()}
              </h1>
              <div className="lotm-subtitle-row">
                <span className="lotm-hairline" aria-hidden="true" />
                <p className="lotm-main-subtitle">КАРТОТЕКА ПЕРСОНАЖЕЙ</p>
                <span className="lotm-hairline" aria-hidden="true" />
              </div>
            </div>

            <div className="lotm-header-spacer" aria-hidden="true" />
          </header>

          <div className="lotm-sections-stack">
            {SECTIONS.map((sec) => {
              const list = grouped[sec.key];
              if (!list || list.length === 0) return null;
              return (
                <section key={sec.key} className="lotm-roster-section">
                  <div className="lotm-roster-divider">
                    <span className="lotm-divider-line" aria-hidden="true" />
                    <div className="lotm-divider-copy">
                      <h2>{sec.title}</h2>
                      <p>{sec.subtitle}</p>
                    </div>
                    <span className="lotm-divider-line" aria-hidden="true" />
                  </div>

                  <div className="lotm-cards-grid">
                    {list.map((char, idx) => (
                      <TarotCard3D
                        key={char.id}
                        character={char}
                        index={idx}
                        onSelect={(c) => setActiveCharacter(c)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      )}

      {/* ==================== ОВЕРЛЕЙ: ПЕРГАМЕНТНОЕ ДОСЬЕ (3 РАЗВОРОТА) ==================== */}
      {activeCharacter && (
        <ParchmentDossier
          character={activeCharacter}
          allCharacters={characters}
          onClose={() => setActiveCharacter(null)}
        />
      )}
    </div>
  );
}
