"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ARTIFACT_ART_SRC,
  SEAL_SRC,
  type LinkKind,
  type LotmCharacter,
  type LotmLink,
} from "@/data/lotm/types";
import { LOTM_V1_PATHWAY_BRIEFS } from "@/data/lotm/pathway-notes";

interface ParchmentDossierProps {
  character: LotmCharacter;
  allCharacters: LotmCharacter[];
  onClose: () => void;
}

const LINK_META: Record<LinkKind, { label: string; color: string; dash?: string }> = {
  tarot: { label: "Клуб Таро", color: "#b3832b" },
  ally: { label: "Союзник / Служба", color: "#445a73" },
  family: { label: "Семья", color: "#7a5837" },
  bond: { label: "Близкая нить", color: "#5f4c6e" },
  enemy: { label: "Вражда / Угроза", color: "#9c2626", dash: "6 4" },
};

const STAMP_CLASS: Record<string, string> = {
  "0": "lotm-d-stamp--crimson",
  "1": "lotm-d-stamp--crimson",
  "2": "lotm-d-stamp--crimson",
  "3": "lotm-d-stamp--amber",
  mystic: "lotm-d-stamp--gold",
  gear: "lotm-d-stamp--sepia",
};

/**
 * Пергаментный фолиант-досье на 3 разворота:
 * - Лист I: Архивный портрет в стиле досье (НЕ карта из галереи), анкета, облик и характер,
 *   Путь / Последовательность / способности и выразительная «Печать Судьбы» (Жив / Погиб / Воскрес).
 * - Лист II: Развитая интерактивная Паутина Связей с перекрёстными нитями + заметка архивариуса.
 * - Лист III: Отдельный двухстраничный зал Артефактов и мистических предметов (вмещает любое число).
 *
 * Навигация:
 * - Клик по левой или правой стороне раскрытой книги плавно перелистывает страницу (и клавиши ← / →).
 * - Клик за пределы книги (или Escape) закрывает досье.
 * - Без верхней панели, без нижней панели кнопок, без «Первого появления» / технических путей и без реплик.
 */
export function ParchmentDossier({ character, allCharacters, onClose }: ParchmentDossierProps) {
  const [spread, setSpread] = useState<0 | 1 | 2>(0);
  const [turnDir, setTurnDir] = useState<"next" | "prev">("next");
  const [selectedLinkIdx, setSelectedLinkIdx] = useState(0);

  const charById = useMemo(() => {
    const map = new Map<string, LotmCharacter>();
    for (const c of allCharacters) map.set(c.id, c);
    return map;
  }, [allCharacters]);

  const flipTo = (next: number) => {
    const clamped = Math.max(0, Math.min(2, next)) as 0 | 1 | 2;
    if (clamped === spread) return;
    setTurnDir(clamped > spread ? "next" : "prev");
    setSpread(clamped);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") flipTo(spread + 1);
      if (e.key === "ArrowLeft") flipTo(spread - 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread, onClose]);

  const activeLink: LotmLink | undefined = character.links[selectedLinkIdx] ?? character.links[0];
  const activeLinkedChar = activeLink ? charById.get(activeLink.to) : undefined;

  const constellationNodes = useMemo(() => {
    const total = character.links.length;
    const cx = 215;
    const cy = 205;
    return character.links.map((link, i) => {
      const angle = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
      const radius = total > 6 && i % 2 === 1 ? 150 : 134;
      return {
        link,
        idx: i,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        targetChar: charById.get(link.to),
      };
    });
  }, [character.links, charById]);

  const crossEdges = useMemo(() => {
    if (!activeLinkedChar) return [];
    const selectedNode = constellationNodes[selectedLinkIdx];
    if (!selectedNode) return [];
    const linkedIds = new Set(activeLinkedChar.links.map((l) => l.to));
    return constellationNodes
      .filter((n) => n.idx !== selectedLinkIdx && linkedIds.has(n.link.to))
      .map((other) => {
        const subLink = activeLinkedChar.links.find((l) => l.to === other.link.to);
        return {
          key: `${selectedNode.link.to}-${other.link.to}`,
          x1: selectedNode.x,
          y1: selectedNode.y,
          x2: other.x,
          y2: other.y,
          color: subLink ? LINK_META[subLink.kind].color : "#8c6d3e",
        };
      });
  }, [activeLinkedChar, constellationNodes, selectedLinkIdx]);

  const sequenceLine = useMemo(() => {
    if (character.sequenceSteps && character.sequenceSteps.length > 0) {
      return character.sequenceSteps.map((s) => `${s.num} · ${s.name}`).join("  →  ");
    }
    return character.sequence;
  }, [character]);

  const pathwayBrief = LOTM_V1_PATHWAY_BRIEFS[character.id];

  // Особый статус «Воскрес» для Клейна в Томе I
  const fateMode: "alive" | "dead" | "resurrected" =
    character.id === "klein-moretti"
      ? "resurrected"
      : character.status === "dead"
        ? "dead"
        : "alive";

  // Разбивка артефактов на левую и правую страницы Разворота III
  const leftArtifacts = useMemo(() => {
    if (character.artifacts.length <= 2) return character.artifacts;
    const mid = Math.ceil(character.artifacts.length / 2);
    return character.artifacts.slice(0, mid);
  }, [character.artifacts]);

  const rightArtifacts = useMemo(() => {
    if (character.artifacts.length <= 2) return [];
    const mid = Math.ceil(character.artifacts.length / 2);
    return character.artifacts.slice(mid);
  }, [character.artifacts]);

  return (
    <div
      className="lotm-dossier-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Досье: ${character.name}`}
      onClick={onClose}
    >
      <div
        className="lotm-book-shell"
        onClick={(e) => e.stopPropagation()}
        data-group={character.group}
      >
        <div className="lotm-book-frame">
          <div className="lotm-book-gutter" aria-hidden="true" />

          {/* Невидимые тактильные зоны перелистывания по левому и правому краю книги */}
          {spread > 0 && (
            <button
              type="button"
              className="lotm-edge-flip lotm-edge-flip--prev"
              onClick={() => flipTo(spread - 1)}
              aria-label="Предыдущий разворот"
            >
              <span className="lotm-edge-arrow" aria-hidden="true">
                ‹
              </span>
            </button>
          )}
          {spread < 2 && (
            <button
              type="button"
              className="lotm-edge-flip lotm-edge-flip--next"
              onClick={() => flipTo(spread + 1)}
              aria-label="Следующий разворот"
            >
              <span className="lotm-edge-arrow" aria-hidden="true">
                ›
              </span>
            </button>
          )}

          <div
            key={`${character.id}-${spread}`}
            className={`lotm-book-spread lotm-book-spread--${turnDir}`}
          >
            {spread === 0 && (
              <>
                {/* ==================== ЛИСТ I · ЛЕВАЯ СТРАНИЦА: Архивный портрет + Анкета ==================== */}
                <section className="lotm-page lotm-page--left">
                  {/* Вклеенная архивная гравюра-портрет в духе пергамента (НЕ барочная карта!) */}
                  <div className="lotm-archival-plate-wrap">
                    <div className="lotm-archival-plate">
                      <span className="lotm-corner-pin lotm-corner-pin--tl" aria-hidden="true" />
                      <span className="lotm-corner-pin lotm-corner-pin--tr" aria-hidden="true" />
                      <span className="lotm-corner-pin lotm-corner-pin--bl" aria-hidden="true" />
                      <span className="lotm-corner-pin lotm-corner-pin--br" aria-hidden="true" />
                      <div className="lotm-archival-photo-window">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={character.portrait}
                          alt={character.name}
                          className="lotm-archival-photo"
                        />
                        <div className="lotm-archival-patina" aria-hidden="true" />
                      </div>

                      {/* Лента принадлежности / Клуба Таро + сургучная печать */}
                      <div className="lotm-plate-seal-row">
                        <div className="lotm-v5-banner" data-group={character.group}>
                          {character.tarot ? (
                            <>
                              <span className="lotm-v5-banner-main">
                                КЛУБ ТАРО · {character.tarot.roman} · {character.tarot.arcana.toUpperCase()}
                              </span>
                              <span className="lotm-v5-banner-sub">Над Серым Туманом</span>
                            </>
                          ) : (
                            <>
                              <span className="lotm-v5-banner-main">
                                {character.group === "nighthawks"
                                  ? "НОЧНЫЕ ЯСТРЕБЫ"
                                  : character.group === "antagonists"
                                    ? "ТАЙНАЯ УГРОЗА"
                                    : "АРХИВ ЛОЭНА"}
                              </span>
                              <span className="lotm-v5-banner-sub">{character.affiliation}</span>
                            </>
                          )}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={SEAL_SRC[character.group]}
                          alt=""
                          aria-hidden="true"
                          className="lotm-v5-wax-seal"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Анкета героя */}
                  <div className="lotm-v5-identity">
                    <h2 className="lotm-v5-name">
                      {character.name}
                      {character.aliases[0] && character.id === "klein-moretti" && (
                        <span className="lotm-v5-alias"> ({character.aliases[0]})</span>
                      )}
                    </h2>
                    {character.aliases.length > 0 && character.id !== "klein-moretti" && (
                      <p className="lotm-v5-aliases-sub">{character.aliases.slice(0, 3).join(" · ")}</p>
                    )}

                    <dl className="lotm-v5-meta">
                      <div>
                        <dt>Принадлежность:</dt>
                        <dd>{character.affiliation}</dd>
                      </div>
                      <div>
                        <dt>Город / Возраст:</dt>
                        <dd>
                          {character.city} · {character.age}
                        </dd>
                      </div>
                      <div>
                        <dt>Путь:</dt>
                        <dd>{character.pathway}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                {/* ==================== ЛИСТ I · ПРАВАЯ СТРАНИЦА: Облик, Путь, События и ПЕЧАТЬ СУДЬБЫ ==================== */}
                <section className="lotm-page lotm-page--right">
                  <div className="lotm-v5-rule-head lotm-v5-rule-head--top">
                    <span className="lotm-v5-rule-line" />
                    <h3>ОБЛИК И ХАРАКТЕР</h3>
                    <span className="lotm-v5-rule-line" />
                  </div>
                  <div className="lotm-v5-two-col">
                    <div>
                      <h4>Внешность</h4>
                      <p>{character.appearance}</p>
                    </div>
                    <div>
                      <h4>Характер</h4>
                      <p>{character.personality}</p>
                    </div>
                  </div>

                  <div className="lotm-v5-rule-head">
                    <span className="lotm-v5-rule-line" />
                    <h3>ПУТЬ И СПОСОБНОСТИ</h3>
                    <span className="lotm-v5-rule-line" />
                  </div>

                  <div className="lotm-v5-seq-bar">
                    <span>{sequenceLine}</span>
                  </div>

                  {pathwayBrief ? (
                    <div className="lotm-pathway-detailed">
                      <p className="lotm-pathway-note">{pathwayBrief.note}</p>
                      <ul className="lotm-ability-list">
                        {pathwayBrief.abilities.map((ab) => (
                          <li key={ab.name}>
                            <span className="lotm-v5-bullet" aria-hidden="true">
                              ✦
                            </span>
                            <span>
                              <strong>{ab.name}</strong> — {ab.detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="lotm-v5-abilities">
                      {character.abilities.map((ab) => (
                        <span key={ab} className="lotm-v5-ability-tag">
                          ✦ {ab}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* КРЕАТИВНЫЙ СТАТУС — ПЕЧАТЬ СУДЬБЫ И НИТЬ ЖИЗНИ */}
                  <div className={`lotm-fate-seal lotm-fate-seal--${fateMode}`}>
                    <div className="lotm-fate-sigil" aria-hidden="true">
                      {fateMode === "dead" ? (
                        /* Разорванная нить судьбы и крест Вечной Ночи */
                        <svg viewBox="0 0 56 56" fill="none">
                          <circle cx="28" cy="28" r="24" stroke="#7d1f1f" strokeWidth="1.5" strokeDasharray="4 3" />
                          <path d="M10 34 C18 30, 21 26, 24 27 M32 29 C36 30, 41 25, 46 22" stroke="#7d1f1f" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M25 22 L31 34 M31 22 L25 34" stroke="#561111" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      ) : fateMode === "resurrected" ? (
                        /* Звезда Шута поверх перечёркнутой тени смерти */
                        <svg viewBox="0 0 56 56" fill="none">
                          <circle cx="28" cy="28" r="24" stroke="#9e6d24" strokeWidth="1.5" />
                          <circle cx="28" cy="28" r="19" stroke="#962424" strokeOpacity="0.45" strokeDasharray="2 3" />
                          <path d="M28 11 L31.2 24.8 L45 28 L31.2 31.2 L28 45 L24.8 31.2 L11 28 L24.8 24.8 Z" fill="#9e2a24" />
                          <circle cx="28" cy="28" r="3" fill="#f7e3ad" />
                        </svg>
                      ) : (
                        /* Цельная золотая нить духа с пульсирующей искрой */
                        <svg viewBox="0 0 56 56" fill="none">
                          <circle cx="28" cy="28" r="24" stroke="#7c5d2a" strokeWidth="1.4" />
                          <path d="M10 28 C17 20, 22 36, 28 28 C34 20, 39 36, 46 28" stroke="#8a6523" strokeWidth="1.7" strokeLinecap="round" />
                          <circle cx="28" cy="28" r="4" fill="#b48129" className="lotm-fate-pulse" />
                        </svg>
                      )}
                    </div>

                    <div className="lotm-fate-copy">
                      <div className="lotm-fate-badges">
                        <span className="lotm-fate-eyebrow">Свидетельство нити жизни</span>
                        {fateMode === "resurrected" ? (
                          <span className="lotm-fate-stamp-pair">
                            <del className="lotm-fate-crossed">ПОГИБ</del>
                            <strong className="lotm-fate-verdict">✦ ВОСКРЕС</strong>
                          </span>
                        ) : fateMode === "dead" ? (
                          <strong className="lotm-fate-verdict">✝ ПОГИБ</strong>
                        ) : (
                          <strong className="lotm-fate-verdict">✦ ЖИВ</strong>
                        )}
                      </div>
                      <p className="lotm-fate-note">{character.statusText}</p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {spread === 1 && (
              <>
                {/* ==================== ЛИСТ II · ЛЕВАЯ СТРАНИЦА: ПАУТИНА СВЯЗЕЙ ==================== */}
                <section className="lotm-page lotm-page--left">
                  <div className="lotm-v5-rule-head lotm-v5-rule-head--top">
                    <span className="lotm-v5-rule-line" />
                    <h3>ПАУТИНА СВЯЗЕЙ И ТАЙНЫЕ НИТИ</h3>
                    <span className="lotm-v5-rule-line" />
                  </div>

                  <div className="lotm-constellation-stage">
                    <svg
                      viewBox="0 0 430 410"
                      className="lotm-constellation-svg"
                      role="img"
                      aria-label={`Созвездие связей персонажа ${character.name}`}
                    >
                      <circle cx="215" cy="205" r="158" stroke="#6f5534" strokeOpacity="0.22" strokeWidth="0.9" fill="none" />
                      <circle cx="215" cy="205" r="134" stroke="#6f5534" strokeOpacity="0.32" strokeDasharray="3 5" fill="none" />
                      <circle cx="215" cy="205" r="84" stroke="#6f5534" strokeOpacity="0.2" fill="none" />
                      <line x1="48" y1="205" x2="382" y2="205" stroke="#6f5534" strokeOpacity="0.16" />
                      <line x1="215" y1="38" x2="215" y2="372" stroke="#6f5534" strokeOpacity="0.16" />
                      <line x1="96" y1="86" x2="334" y2="324" stroke="#6f5534" strokeOpacity="0.1" />
                      <line x1="334" y1="86" x2="96" y2="324" stroke="#6f5534" strokeOpacity="0.1" />

                      {crossEdges.map((edge) => (
                        <line
                          key={edge.key}
                          x1={edge.x1}
                          y1={edge.y1}
                          x2={edge.x2}
                          y2={edge.y2}
                          stroke={edge.color}
                          strokeWidth="1.25"
                          strokeOpacity="0.52"
                          strokeDasharray="3 4"
                        />
                      ))}

                      {constellationNodes.map((n) => {
                        const meta = LINK_META[n.link.kind];
                        const isSelected = n.idx === selectedLinkIdx;
                        return (
                          <g key={n.link.to}>
                            <line
                              x1="215"
                              y1="205"
                              x2={n.x}
                              y2={n.y}
                              stroke={meta.color}
                              strokeWidth={isSelected ? 2.6 : 1.25}
                              strokeOpacity={isSelected ? 0.96 : 0.42}
                              strokeDasharray={meta.dash}
                              className="lotm-thread-line"
                            />
                            {isSelected && (
                              <circle r="3.6" fill={meta.color}>
                                <animateMotion
                                  dur="2.2s"
                                  repeatCount="indefinite"
                                  path={`M215,205 L${n.x.toFixed(1)},${n.y.toFixed(1)}`}
                                />
                              </circle>
                            )}
                          </g>
                        );
                      })}
                    </svg>

                    <div className="lotm-node lotm-node--center" style={{ left: "50%", top: "50%" }}>
                      <div className="lotm-node-ring lotm-node-ring--center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={character.portrait} alt={character.name} />
                      </div>
                      <span className="lotm-node-cap lotm-node-cap--center">{character.name}</span>
                    </div>

                    {constellationNodes.map((n) => {
                      const meta = LINK_META[n.link.kind];
                      const isSelected = n.idx === selectedLinkIdx;
                      return (
                        <button
                          key={n.link.to}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLinkIdx(n.idx);
                          }}
                          onMouseEnter={() => setSelectedLinkIdx(n.idx)}
                          className={`lotm-node lotm-node--orbit ${isSelected ? "lotm-node--active" : ""}`}
                          style={{
                            left: `${(n.x / 430) * 100}%`,
                            top: `${(n.y / 410) * 100}%`,
                            ["--thread-color" as string]: meta.color,
                          }}
                        >
                          <div className="lotm-node-ring">
                            {n.targetChar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={n.targetChar.portrait} alt={n.link.name} />
                            ) : (
                              <span className="lotm-node-initial">{n.link.name.slice(0, 1)}</span>
                            )}
                          </div>
                          <span className="lotm-node-cap">{n.link.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="lotm-thread-legend">
                    {(["tarot", "ally", "family", "bond", "enemy"] as LinkKind[]).map((k) => (
                      <span key={k} className="lotm-legend-item">
                        <i style={{ background: LINK_META[k].color }} />
                        {LINK_META[k].label}
                      </span>
                    ))}
                  </div>
                </section>

                {/* ==================== ЛИСТ II · ПРАВАЯ СТРАНИЦА: ЗАМЕТКА О СВЯЗИ ==================== */}
                <section className="lotm-page lotm-page--right">
                  <div className="lotm-v5-rule-head lotm-v5-rule-head--top">
                    <span className="lotm-v5-rule-line" />
                    <h3>ЗАМЕТКА АРХИВАРИУСА О СВЯЗИ</h3>
                    <span className="lotm-v5-rule-line" />
                  </div>

                  {activeLink ? (
                    <div className="lotm-ink-bond-slip">
                      <div className="lotm-bond-header">
                        {activeLinkedChar && (
                          <div className="lotm-bond-mini-portrait">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={activeLinkedChar.portrait} alt={activeLink.name} />
                          </div>
                        )}
                        <div>
                          <span
                            className="lotm-d-stamp"
                            style={{
                              color: LINK_META[activeLink.kind].color,
                              borderColor: LINK_META[activeLink.kind].color,
                            }}
                          >
                            {LINK_META[activeLink.kind].label}
                          </span>
                          <h4>{activeLink.name}</h4>
                          <p className="lotm-bond-role">{activeLink.relation}</p>
                        </div>
                      </div>
                      <p className="lotm-bond-note">{activeLink.note}</p>
                      {crossEdges.length > 0 && (
                        <div className="lotm-bond-foot">
                          <span>Перекрёстных нитей на схеме: {crossEdges.length}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="lotm-bond-empty">Подтверждённых связей не зафиксировано.</p>
                  )}

                  <div className="lotm-v5-rule-head lotm-v5-rule-head--sm">
                    <span className="lotm-v5-rule-line" />
                    <h3>ВСЕ ЗАФИКСИРОВАННЫЕ НИТИ ({character.links.length})</h3>
                    <span className="lotm-v5-rule-line" />
                  </div>
                  <div className="lotm-ink-bond-grid">
                    {character.links.map((lk, i) => (
                      <button
                        key={lk.to}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLinkIdx(i);
                        }}
                        className={`lotm-ink-bond-btn ${i === selectedLinkIdx ? "lotm-ink-bond-btn--active" : ""}`}
                        style={{ ["--pill-accent" as string]: LINK_META[lk.kind].color }}
                      >
                        <i className="lotm-ink-bond-dot" />
                        <span>
                          <strong>{lk.name}</strong>
                          <em>{lk.relation}</em>
                        </span>
                      </button>
                    ))}
                  </div>

                  {character.contradiction && (
                    <aside className="lotm-contradiction-slip">
                      <span className="lotm-contradiction-tag">
                        Пометка архивариуса · Расхождение версий
                      </span>
                      <p>{character.contradiction}</p>
                    </aside>
                  )}
                </section>
              </>
            )}

            {spread === 2 && (
              <>
                {/* ==================== ЛИСТ III · ДВУХСТРАНИЧНЫЙ ЗАЛ АРТЕФАКТОВ ==================== */}
                <section className="lotm-page lotm-page--left">
                  <div className="lotm-v5-rule-head lotm-v5-rule-head--top">
                    <span className="lotm-v5-rule-line" />
                    <h3>АРТЕФАКТЫ И МИСТИЧЕСКИЕ ПРЕДМЕТЫ</h3>
                    <span className="lotm-v5-rule-line" />
                  </div>

                  {leftArtifacts.length > 0 ? (
                    <div className="lotm-vault-stack">
                      {leftArtifacts.map((art) => (
                        <article key={art.name} className="lotm-vault-card">
                          <div className="lotm-vault-art-box">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ARTIFACT_ART_SRC[art.art]}
                              alt={art.name}
                              className="lotm-vault-art-img"
                            />
                          </div>
                          <div className="lotm-vault-body">
                            <div className="lotm-vault-head">
                              <h4>{art.name}</h4>
                              <span
                                className={`lotm-d-stamp ${STAMP_CLASS[art.grade] ?? "lotm-d-stamp--sepia"}`}
                              >
                                {art.code ? `${art.code} · ` : ""}
                                {art.gradeLabel}
                              </span>
                            </div>
                            <p className="lotm-vault-effect">{art.effect}</p>
                            {art.drawback && (
                              <p className="lotm-vault-drawback">
                                <strong>Побочный эффект:</strong> {art.drawback}
                              </p>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="lotm-v5-art-empty">
                      <span className="lotm-d-stamp lotm-d-stamp--sepia">Обычный человек</span>
                      <p>
                        Запечатанных артефактов и мистических предметов за этим лицом не числится.
                      </p>
                    </div>
                  )}
                </section>

                <section className="lotm-page lotm-page--right">
                  <div className="lotm-v5-rule-head lotm-v5-rule-head--top">
                    <span className="lotm-v5-rule-line" />
                    <h3>
                      {rightArtifacts.length > 0 ? "СНАРЯЖЕНИЕ И РЕЛИКВИИ" : "АРХИВНАЯ ОПИСЬ ПРЕДМЕТОВ"}
                    </h3>
                    <span className="lotm-v5-rule-line" />
                  </div>

                  {rightArtifacts.length > 0 ? (
                    <div className="lotm-vault-stack">
                      {rightArtifacts.map((art) => (
                        <article key={art.name} className="lotm-vault-card">
                          <div className="lotm-vault-art-box">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ARTIFACT_ART_SRC[art.art]}
                              alt={art.name}
                              className="lotm-vault-art-img"
                            />
                          </div>
                          <div className="lotm-vault-body">
                            <div className="lotm-vault-head">
                              <h4>{art.name}</h4>
                              <span
                                className={`lotm-d-stamp ${STAMP_CLASS[art.grade] ?? "lotm-d-stamp--sepia"}`}
                              >
                                {art.code ? `${art.code} · ` : ""}
                                {art.gradeLabel}
                              </span>
                            </div>
                            <p className="lotm-vault-effect">{art.effect}</p>
                            {art.drawback && (
                              <p className="lotm-vault-drawback">
                                <strong>Побочный эффект:</strong> {art.drawback}
                              </p>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="lotm-vault-note-empty">
                      <p>
                        Других мистических предметов и запечатанных артефактов в текущем реестре не
                        зафиксировано.
                      </p>
                      <span className="lotm-vault-seal-caption">
                        Всего учтено предметов: {character.artifacts.length}
                      </span>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Тихий чернильный номер разворота в самом низу переплёта */}
          <div className="lotm-book-folio-num" aria-hidden="true">
            {spread === 0 ? "I · III" : spread === 1 ? "II · III" : "III · III"}
          </div>
        </div>
      </div>
    </div>
  );
}
