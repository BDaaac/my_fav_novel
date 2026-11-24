"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { MoveType, Player } from "@/data/king/types";
import { kingAudio } from "./audio";

type DossierTab = "profile" | "weapon" | "moves" | "feats" | "links";

const ACCOUNT_STATUS_LABEL: Record<Player["accounts"][number]["status"], string> = {
  main: "ОСНОВНОЙ",
  lost: "ОТДАН",
  borrowed: "ОДОЛЖЕН",
  temp: "ВРЕМЕННЫЙ",
};

const ACCOUNT_LED_COLOR: Record<Player["accounts"][number]["status"], "lime" | "crimson" | "cyan" | "amber"> = {
  main: "lime",
  lost: "crimson",
  borrowed: "cyan",
  temp: "amber",
};

const MOVE_TYPE_COLOR: Record<MoveType, string> = {
  атака: "crimson",
  контроль: "cyan",
  перемещение: "lime",
  защита: "violet",
  тактика: "amber",
};

const SKILL_KEYS = ["Q", "W", "E", "R", "A", "S", "D", "F", "Z", "X"] as const;

const LINK_SIDES = ["свои", "соперники", "партнёры", "враги"] as const;
type LinkSide = (typeof LINK_SIDES)[number];
type LinkFilter = "все" | LinkSide;

const LINK_SIDE_LABEL: Record<LinkFilter, string> = {
  все: "Все",
  свои: "Свои",
  соперники: "Соперники",
  партнёры: "Партнёры",
  враги: "Враги",
};

const LINK_SIDE_COLOR: Record<LinkSide, string> = {
  свои: "#d9ff00",
  соперники: "#ffba38",
  партнёры: "#38e8ff",
  враги: "#ff3352",
};

const FEAT_KINDS = ["победа", "рекорд", "первое убийство"] as const;
type FeatKind = Player["feats"][number]["kind"];
type FeatFilter = "все" | FeatKind;

const FEAT_KIND_LABEL: Record<FeatFilter, string> = {
  все: "Все",
  победа: "Победы",
  рекорд: "Рекорды",
  "первое убийство": "Первые убийства",
};

function formatChapters(ch: number[]): string {
  if (!ch.length) return "—";
  const first = Math.min(...ch);
  const last = Math.max(...ch);
  return first === last ? `гл. ${first}` : `гл. ${first}–${last}`;
}

function MoveIcon({ type }: { type: MoveType }) {
  switch (type) {
    case "атака":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M19 5L5 19" />
          <path d="M14 5h5v5" />
          <path d="M6 14l4 4" />
        </svg>
      );
    case "контроль":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "перемещение":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M4 17l7-7-3-3h10v10l-3-3-7 7" />
        </svg>
      );
    case "защита":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3z" />
        </svg>
      );
    case "тактика":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6z" />
        </svg>
      );
  }
}

function WeaponArtwork({ playerId, weaponName, kind }: { playerId: string; weaponName: string; kind: string }) {
  if (playerId === "ye-xiu") {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src="/art/king/umbrella-sprite.webp" alt={weaponName} className="k-weapon-sprite" />
    );
  }
  const low = `${weaponName} ${kind}`.toLowerCase();
  const isGun = low.includes("пушк") || low.includes("лаунч") || low.includes("револьвер");
  const isSpear = low.includes("копь") || low.includes("алебард");
  const isBroom = low.includes("метл");
  const isFist = low.includes("кастет") || low.includes("кулак");
  return (
    <div className="k-weapon-emblem" aria-hidden="true">
      {isGun ? (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <rect x="10" y="24" width="34" height="16" fill="rgba(56,232,255,0.1)" />
          <path d="M44 27h10v10H44M16 40l-4 10h8l3-10M24 24v-6h12v6" />
          <line x1="16" y1="32" x2="38" y2="32" stroke="#d9ff00" />
        </svg>
      ) : isSpear ? (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="12" y1="52" x2="46" y2="18" />
          <polygon points="52,12 48,25 39,16" fill="rgba(217,255,0,0.22)" stroke="#d9ff00" />
          <path d="M36 22l6 6M22 36l6 6" />
        </svg>
      ) : isBroom ? (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="12" y1="52" x2="40" y2="24" />
          <path d="M36 20l14-8-4 16-10-8z" fill="rgba(217,255,0,0.18)" stroke="#d9ff00" />
          <path d="M44 16l8-4M46 22l7-2" stroke="#d9ff00" />
        </svg>
      ) : isFist ? (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <rect x="18" y="22" width="28" height="22" fill="rgba(255,51,82,0.18)" stroke="#ff3352" />
          <path d="M24 22v-6h16v6M22 44v6h20v-6M25 30v6M32 30v6M39 30v6" stroke="#d9ff00" />
        </svg>
      ) : (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
          <line x1="14" y1="50" x2="50" y2="14" stroke="#d9ff00" />
          <path d="M18 38l8 8M12 44l8 8" />
        </svg>
      )}
    </div>
  );
}

interface MonitorDossierProps {
  player: Player;
  art: string | null;
  partLabel: string;
  onBack: () => void;
  onPulseReader: (tone: "lime" | "crimson" | "cyan" | "amber") => void;
  onSelectPlayerId?: (id: string) => void;
  availableIds: Set<string>;
}

export function MonitorDossier({
  player,
  art,
  partLabel,
  onBack,
  onPulseReader,
  onSelectPlayerId,
  availableIds,
}: MonitorDossierProps) {
  const [tab, setTab] = useState<DossierTab>("profile");
  const [accIdx, setAccIdx] = useState(0);
  const [formIdx, setFormIdx] = useState(0);
  const [moveIdx, setMoveIdx] = useState(0);
  const [castPulse, setCastPulse] = useState(0);
  const [featFilter, setFeatFilter] = useState<FeatFilter>("все");
  const [featIdx, setFeatIdx] = useState(0);
  const [replayPulse, setReplayPulse] = useState(0);
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("все");
  const [selectedLinkTo, setSelectedLinkTo] = useState<string>(player.links[0]?.to ?? "");

  const activeAccount = player.accounts[accIdx] ?? player.accounts[0];
  const activeMove = player.moves[moveIdx] ?? player.moves[0];

  const indexedFeats = useMemo(
    () => player.feats.map((feat, origIdx) => ({ feat, origIdx })),
    [player.feats],
  );

  const visibleFeats = useMemo(
    () => (featFilter === "все" ? indexedFeats : indexedFeats.filter((item) => item.feat.kind === featFilter)),
    [featFilter, indexedFeats],
  );

  const activeFeatEntry = useMemo(
    () => visibleFeats.find((item) => item.origIdx === featIdx) ?? visibleFeats[0] ?? null,
    [featIdx, visibleFeats],
  );
  const activeFeat = activeFeatEntry?.feat ?? null;

  const featSpan = useMemo(() => {
    const allCh = player.feats.flatMap((f) => f.ch);
    if (!allCh.length) return { min: 1, max: 344 };
    return { min: Math.min(...allCh), max: Math.max(...allCh) };
  }, [player.feats]);

  // Хронологические маркеры матчей на шкале глав с гарантированным зазором (без наложения точек)
  const timelineMarks = useMemo(() => {
    const span = Math.max(1, featSpan.max - featSpan.min);
    const raw = indexedFeats.map(({ feat, origIdx }) => {
      const chStart = feat.ch.length ? Math.min(...feat.ch) : featSpan.min;
      const pct = 5 + ((chStart - featSpan.min) / span) * 90;
      return { feat, origIdx, chStart, pct };
    });
    const minGap = raw.length > 1 ? Math.min(7.4, 88 / (raw.length - 1)) : 0;
    for (let i = 1; i < raw.length; i++) {
      if (raw[i].pct - raw[i - 1].pct < minGap) {
        raw[i].pct = Math.min(95, raw[i - 1].pct + minGap);
      }
    }
    for (let i = raw.length - 2; i >= 0; i--) {
      if (raw[i + 1].pct - raw[i].pct < minGap) {
        raw[i].pct = Math.max(5, raw[i + 1].pct - minGap);
      }
    }
    return raw;
  }, [featSpan.max, featSpan.min, indexedFeats]);

  const groupedLinks = useMemo(() => {
    const map: Record<LinkSide, Player["links"]> = {
      свои: [],
      соперники: [],
      партнёры: [],
      враги: [],
    };
    for (const l of player.links) {
      map[l.side].push(l);
    }
    return map;
  }, [player.links]);

  const visibleLinks = useMemo(() => {
    return linkFilter === "все" ? player.links : groupedLinks[linkFilter];
  }, [groupedLinks, linkFilter, player.links]);

  const activeLink = useMemo(() => {
    return visibleLinks.find((l) => l.to === selectedLinkTo) ?? visibleLinks[0] ?? null;
  }, [selectedLinkTo, visibleLinks]);

  // Координаты узлов на радар-графе связей (SVG 520×340, центр 260×170) — без перекрытий по секторам
  const graphNodes = useMemo(() => {
    const cx = 260;
    const cy = 170;

    if (linkFilter !== "все") {
      const list = visibleLinks;
      const n = list.length;
      return list.map((lnk, i) => {
        const angleDeg = -90 + (360 / Math.max(1, n)) * i;
        const rad = (angleDeg * Math.PI) / 180;
        const rx = n > 5 ? 184 : 158;
        const ry = n > 5 ? 118 : 108;
        return {
          lnk,
          x: cx + Math.cos(rad) * rx,
          y: cy + Math.sin(rad) * ry,
          sin: Math.sin(rad),
          color: LINK_SIDE_COLOR[lnk.side],
        };
      });
    }

    const activeSides = LINK_SIDES.filter((s) => groupedLinks[s].length > 0);
    const gapUnits = activeSides.length > 1 ? 0.8 : 0;
    const totalUnits = player.links.length + activeSides.length * gapUnits;
    const out: { lnk: Player["links"][number]; x: number; y: number; sin: number; color: string }[] = [];

    let cursor = 0;
    let globalIdx = 0;
    for (const side of activeSides) {
      const list = groupedLinks[side];
      list.forEach((lnk) => {
        const angleDeg = -148 + (cursor / Math.max(1, totalUnits)) * 360;
        const rad = (angleDeg * Math.PI) / 180;
        const isInner = globalIdx % 2 === 1;
        const rx = isInner ? 154 : 200;
        const ry = isInner ? 98 : 128;
        out.push({
          lnk,
          x: cx + Math.cos(rad) * rx,
          y: cy + Math.sin(rad) * ry,
          sin: Math.sin(rad),
          color: LINK_SIDE_COLOR[side],
        });
        cursor += 1;
        globalIdx += 1;
      });
      cursor += gapUnits;
    }
    return out;
  }, [groupedLinks, linkFilter, player.links.length, visibleLinks]);

  // Горячие клавиши: 1–5 (вкладки), Q/W/E/R/A/S/D/F (активация приёмов на вкладке «Приёмы»)
  useEffect(() => {
    const order: DossierTab[] = ["profile", "weapon", "moves", "feats", "links"];
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const numIdx = Number(e.key) - 1;
      if (numIdx >= 0 && numIdx < order.length) {
        setTab(order[numIdx]);
        kingAudio.playClick();
        return;
      }
      if (tab === "moves") {
        const keyUpper = e.key.toUpperCase();
        const skillIdx = SKILL_KEYS.indexOf(keyUpper as (typeof SKILL_KEYS)[number]);
        if (skillIdx >= 0 && skillIdx < player.moves.length) {
          setMoveIdx(skillIdx);
          setCastPulse((c) => c + 1);
          kingAudio.playCardRead();
        }
      } else if (tab === "feats" && (e.key === "ArrowLeft" || e.key === "ArrowRight") && visibleFeats.length > 0) {
        const curPos = visibleFeats.findIndex((it) => it.origIdx === (activeFeatEntry?.origIdx ?? -1));
        const delta = e.key === "ArrowRight" ? 1 : -1;
        const nextItem = visibleFeats[(curPos + delta + visibleFeats.length) % visibleFeats.length];
        if (nextItem) {
          setFeatIdx(nextItem.origIdx);
          setReplayPulse((p) => p + 1);
          kingAudio.playHover();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeFeatEntry?.origIdx, player.moves.length, tab, visibleFeats]);

  const selectAccount = (idx: number) => {
    setAccIdx(idx);
    const acc = player.accounts[idx];
    if (acc) {
      kingAudio.playCardRead();
      onPulseReader(ACCOUNT_LED_COLOR[acc.status]);
    }
  };

  const switchTab = (next: DossierTab) => {
    setTab(next);
    kingAudio.playClick();
  };

  const activateMove = (idx: number) => {
    setMoveIdx(idx);
    setCastPulse((c) => c + 1);
    const mv = player.moves[idx];
    kingAudio.playCardRead();
    if (mv) {
      const toneMap: Record<MoveType, "lime" | "crimson" | "cyan" | "amber"> = {
        атака: "crimson",
        контроль: "cyan",
        перемещение: "lime",
        защита: "cyan",
        тактика: "amber",
      };
      onPulseReader(toneMap[mv.type]);
    }
  };

  return (
    <div className="k-dossier">
      {/* Верхняя полоса игрового окна */}
      <header className="k-screen-bar">
        <button
          type="button"
          className="k-bar-btn"
          onClick={() => {
            kingAudio.playClick();
            onBack();
          }}
        >
          ← СОСТАВ
        </button>
        <div className="k-bar-title">
          ДОСЬЕ ИГРОКА · <span>{player.name}</span>
          {player.alias ? <em> ({player.alias})</em> : null}
        </div>
        <div className="k-bar-meta">{partLabel}</div>
      </header>

      {/* Основная 2-колоночная сетка окна персонажа MMORPG */}
      <div className="k-dossier-body">
        {/* Левая колонка: портрет + переключатель физических аккаунт-карт */}
        <aside className="k-dossier-left">
          <div className="k-dossier-portrait-box" data-status={activeAccount?.status ?? "main"}>
            {art ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={art} alt={player.name} className="k-dossier-portrait" />
            ) : (
              <div className="k-dossier-portrait-empty">
                <div className="k-dossier-portrait-grid" aria-hidden="true" />
                <div className="k-dossier-portrait-badge">GLORY · ID</div>
                <div className="k-dossier-portrait-monogram">{player.name}</div>
                <div className="k-dossier-portrait-note">ПОРТРЕТ СКОРО</div>
              </div>
            )}
            <div className="k-dossier-portrait-grad" aria-hidden="true" />
            {activeAccount && (
              <div className="k-dossier-portrait-cap">
                <span className="k-dossier-acc-name">{activeAccount.name}</span>
                <span className="k-dossier-acc-cls">{activeAccount.cls}</span>
              </div>
            )}
          </div>

          <div className="k-accounts-panel">
            <div className="k-panel-kicker">АККАУНТЫ «СЛАВЫ» ({player.accounts.length})</div>
            <div className="k-accounts-list">
              {player.accounts.map((acc, i) => (
                <button
                  key={acc.name}
                  type="button"
                  className={`k-account-row${i === accIdx ? " is-active" : ""}`}
                  data-status={acc.status}
                  onClick={() => selectAccount(i)}
                >
                  <span className="k-account-row-main">
                    <span className="k-account-dot" aria-hidden="true" />
                    <span className="k-account-title">{acc.name}</span>
                  </span>
                  <span className="k-account-status">{ACCOUNT_STATUS_LABEL[acc.status]}</span>
                </button>
              ))}
            </div>
            {activeAccount && <p className="k-account-note">{activeAccount.note}</p>}
          </div>
        </aside>

        {/* Правая колонка: 5 игровых вкладок + содержимое (без лишней цитаты снизу) */}
        <section className="k-dossier-right">
          <nav className="k-tabs" role="tablist" aria-label="Разделы досье">
            {(
              [
                ["profile", "ПРОФИЛЬ", "1"],
                ["weapon", player.weapon ? "ОРУЖИЕ И СТИЛЬ" : "СТИЛЬ ИГРЫ", "2"],
                ["moves", `ПРИЁМЫ (${player.moves.length})`, "3"],
                ["feats", `МАТЧИ (${player.feats.length})`, "4"],
                ["links", `СВЯЗИ (${player.links.length})`, "5"],
              ] as const
            ).map(([id, label, keyHint]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`k-tab${tab === id ? " is-active" : ""}`}
                onClick={() => switchTab(id)}
              >
                <span className="k-tab-key">{keyHint}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="k-tab-stage">
            {tab === "profile" && (
              <div className="k-tab-content k-fade-in">
                <div className="k-stat-grid">
                  {player.registry.map((row) => (
                    <div key={row.label} className="k-stat-cell">
                      <span className="k-stat-label">{row.label}</span>
                      <span className="k-stat-val">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="k-prose-block">
                  <div className="k-panel-kicker">БИОГРАФИЯ · {player.tagline.toUpperCase()}</div>
                  {player.about.map((p, idx) => (
                    <p key={idx} className="k-prose-p">{p.text}</p>
                  ))}
                </div>

                {player.weapon && (
                  <div className="k-weapon-mini">
                    <div className="k-weapon-mini-icon">
                      <WeaponArtwork playerId={player.id} weaponName={player.weapon.name} kind={player.weapon.kind} />
                    </div>
                    <div className="k-weapon-mini-info">
                      <div className="k-panel-kicker">ЭКИПИРОВАНО · {player.weapon.kind.toUpperCase()}</div>
                      <div className="k-weapon-mini-title">{player.weapon.name}</div>
                      <div className="k-weapon-forms-mini">
                        {player.weapon.forms.map((f) => (
                          <span key={f} className="k-form-chip">{f}</span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="k-inline-btn"
                      onClick={() => switchTab("weapon")}
                    >
                      ПОДРОБНЕЕ →
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "weapon" && (
              <div className="k-tab-content k-fade-in">
                {player.weapon && (
                  <div className="k-weapon-card">
                    <div className="k-weapon-art-col">
                      <WeaponArtwork playerId={player.id} weaponName={player.weapon.name} kind={player.weapon.kind} />
                      <span className="k-weapon-form-active">
                        ФОРМА: {player.weapon.forms[formIdx]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="k-weapon-copy">
                      <div className="k-panel-kicker">{player.weapon.kind.toUpperCase()}</div>
                      <h3 className="k-weapon-title">{player.weapon.name}</h3>
                      <p className="k-prose-p">{player.weapon.text}</p>
                      <div className="k-weapon-forms">
                        {player.weapon.forms.map((f, i) => (
                          <button
                            key={f}
                            type="button"
                            className={`k-form-btn${i === formIdx ? " is-active" : ""}`}
                            onClick={() => {
                              setFormIdx(i);
                              kingAudio.playClick();
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                      {player.weapon.memory && (
                        <blockquote className="k-memory-box">
                          <span className="k-panel-kicker">ПАМЯТЬ ОРУЖИЯ</span>
                          <p>{player.weapon.memory.text}</p>
                        </blockquote>
                      )}
                    </div>
                  </div>
                )}

                <div className="k-stat-grid">
                  {player.style.traits.map((tr) => (
                    <div key={tr.label} className="k-stat-cell">
                      <span className="k-stat-label">{tr.label}</span>
                      <span className="k-stat-val">{tr.value}</span>
                    </div>
                  ))}
                </div>

                <div className="k-sw-grid">
                  <div className="k-sw-col" data-tone="strong">
                    <div className="k-panel-kicker">+ СИЛЬНЫЕ СТОРОНЫ</div>
                    <ul>
                      {player.style.strong.map((s, i) => (
                        <li key={i}>{s.text}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="k-sw-col" data-tone="weak">
                    <div className="k-panel-kicker">− ОГРАНИЧЕНИЯ И РИСКИ</div>
                    <ul>
                      {player.style.weak.map((w, i) => (
                        <li key={i}>{w.text}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ВКЛАДКА 3 · ИГРОВАЯ ПАНЕЛЬ НАВЫКОВ (MMORPG HOTBAR Q-W-E-R-A-S-D-F + ИНСПЕКТОР) */}
            {tab === "moves" && activeMove && (
              <div className="k-tab-content k-fade-in">
                <div className="k-skillbar-wrap">
                  <div className="k-skillbar-header">
                    <span className="k-panel-kicker" style={{ marginBottom: 0 }}>
                      ПАНЕЛЬ НАВЫКОВ «СЛАВЫ»
                    </span>
                    <span className="k-skillbar-hint">Кликни слот или жми Q W E R A S D F</span>
                  </div>

                  <div className="k-skillbar-slots" role="listbox" aria-label="Панель приёмов">
                    {player.moves.map((m, i) => {
                      const active = i === moveIdx;
                      const keyLabel = SKILL_KEYS[i] ?? String(i + 1);
                      return (
                        <button
                          key={m.name}
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`k-skill-slot${active ? " is-active" : ""}`}
                          data-tone={MOVE_TYPE_COLOR[m.type]}
                          onClick={() => activateMove(i)}
                        >
                          <span className="k-skill-hotkey">{keyLabel}</span>
                          <span className="k-skill-icon">
                            <MoveIcon type={m.type} />
                          </span>
                          <span className="k-skill-short">{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Крупный игровой инспектор выбранного навыка */}
                <article
                  key={`${activeMove.name}-${castPulse}`}
                  className="k-skill-inspector"
                  data-tone={MOVE_TYPE_COLOR[activeMove.type]}
                >
                  <div className="k-skill-emblem">
                    <MoveIcon type={activeMove.type} />
                    <span className="k-skill-emblem-key">{SKILL_KEYS[moveIdx] ?? moveIdx + 1}</span>
                  </div>
                  <div className="k-skill-info">
                    <div className="k-skill-info-top">
                      <span className="k-skill-type-badge">{activeMove.type.toUpperCase()}</span>
                      <span className="k-skill-slot-id">СЛОТ #{String(moveIdx + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="k-skill-title">{activeMove.name}</h3>
                    <p className="k-prose-p">{activeMove.text}</p>
                  </div>
                </article>

                {/* Компактная тактическая сводка категорий */}
                <div className="k-skill-legend">
                  {(["атака", "контроль", "перемещение", "тактика", "защита"] as MoveType[]).map((tp) => {
                    const count = player.moves.filter((m) => m.type === tp).length;
                    if (!count) return null;
                    return (
                      <span key={tp} className="k-legend-pill" data-tone={MOVE_TYPE_COLOR[tp]}>
                        <i aria-hidden="true" />
                        <span>{tp}</span>
                        <strong>{count}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ВКЛАДКА 4 · КОНСОЛЬ РЕПЛЕЕВ И МАТЧЕЙ «СЛАВЫ» */}
            {tab === "feats" && (
              <div className="k-tab-content k-fade-in">
                <div className="k-feats-toolbar">
                  <div className="k-link-pills">
                    {(["все", ...FEAT_KINDS] as FeatFilter[]).map((kind) => {
                      const cnt =
                        kind === "все"
                          ? player.feats.length
                          : player.feats.filter((f) => f.kind === kind).length;
                      if (kind !== "все" && cnt === 0) return null;
                      return (
                        <button
                          key={kind}
                          type="button"
                          className={`k-feat-filter${featFilter === kind ? " is-active" : ""}`}
                          data-kind={kind}
                          onClick={() => {
                            setFeatFilter(kind);
                            const nextList =
                              kind === "все"
                                ? indexedFeats
                                : indexedFeats.filter((it) => it.feat.kind === kind);
                            if (nextList[0]) {
                              setFeatIdx(nextList[0].origIdx);
                              setReplayPulse((p) => p + 1);
                            }
                            kingAudio.playClick();
                          }}
                        >
                          {FEAT_KIND_LABEL[kind]} ({cnt})
                        </button>
                      );
                    })}
                  </div>
                  <div className="k-feats-span">
                    ГЛАВЫ {featSpan.min}–{featSpan.max} · АРХИВ РЕПЛЕЕВ
                  </div>
                </div>

                <div className="k-feats-layout">
                  <div className="k-feats-list" role="listbox" aria-label="Список матчей и рекордов">
                    {visibleFeats.map(({ feat: f, origIdx }) => {
                      const isSel = activeFeatEntry?.origIdx === origIdx;
                      return (
                        <button
                          key={`${f.title}-${origIdx}`}
                          type="button"
                          role="option"
                          aria-selected={isSel}
                          className={`k-feat-item${isSel ? " is-active" : ""}`}
                          data-kind={f.kind}
                          onClick={() => {
                            setFeatIdx(origIdx);
                            setReplayPulse((p) => p + 1);
                            kingAudio.playClick();
                            onPulseReader(
                              f.kind === "рекорд" ? "cyan" : f.kind === "первое убийство" ? "amber" : "lime",
                            );
                          }}
                        >
                          <span className="k-feat-item-score">{f.score?.value ?? "★"}</span>
                          <span className="k-feat-item-copy">
                            <strong>{f.title}</strong>
                            <small>
                              vs {f.vs} · {formatChapters(f.ch)}
                            </small>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {activeFeat && activeFeatEntry && (
                    <div className="k-replay-console">
                      <article
                        key={`${activeFeat.title}-${replayPulse}`}
                        className="k-replay-card"
                        data-kind={activeFeat.kind}
                      >
                        {/* Верхняя полоса трансляции */}
                        <div className="k-replay-topbar">
                          <span className="k-replay-rec">
                            <i aria-hidden="true" />
                            <span>{activeFeat.kind.toUpperCase()}</span>
                          </span>
                          <span className="k-feat-where">{activeFeat.where}</span>
                          <span className="k-replay-ch">{formatChapters(activeFeat.ch).toUpperCase()}</span>
                        </div>

                        {/* Киберспортивная плашка противостояния VS */}
                        <div className="k-replay-versus">
                          <div className="k-versus-side k-versus-side--self">
                            <span className="k-versus-role">ИГРОК</span>
                            <strong>{player.name.toUpperCase()}</strong>
                            <small>{activeAccount?.name ?? player.team}</small>
                          </div>

                          <div className="k-versus-badge" aria-hidden="true">
                            <span>VS</span>
                          </div>

                          <div className="k-versus-side k-versus-side--opp">
                            <span className="k-versus-role">СОПЕРНИК / ЦЕЛЬ</span>
                            <strong>{activeFeat.vs}</strong>
                            <small>РЕПЛЕЙ #{String(activeFeatEntry.origIdx + 1).padStart(2, "0")}</small>
                          </div>
                        </div>

                        {/* Крупное табло + хроника боя */}
                        <div className="k-replay-main">
                          {activeFeat.score && (
                            <div className="k-feat-scoreboard">
                              <span className="k-feat-big-num">{activeFeat.score.value}</span>
                              <span className="k-feat-big-lbl">{activeFeat.score.label}</span>
                            </div>
                          )}

                          <h3 className="k-feat-detail-title">{activeFeat.title}</h3>
                          <p className="k-prose-p">{activeFeat.text}</p>
                        </div>
                      </article>

                      {/* Нижняя интерактивная шкала хронологии реплеев по главам */}
                      <div className="k-replay-timeline">
                        <div className="k-timeline-head">
                          <span className="k-panel-kicker" style={{ marginBottom: 0 }}>
                            ХРОНОЛОГИЯ БОЁВ · ТОМ I
                          </span>
                          <span className="k-timeline-counter">
                            РЕПЛЕЙ {String(activeFeatEntry.origIdx + 1).padStart(2, "0")} /{" "}
                            {String(player.feats.length).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="k-timeline-track" role="group" aria-label="Шкала реплеев по главам">
                          <div className="k-timeline-rail" aria-hidden="true" />
                          {timelineMarks.map((mark) => {
                            const isSel = mark.origIdx === activeFeatEntry.origIdx;
                            const isDim = featFilter !== "все" && mark.feat.kind !== featFilter;
                            return (
                              <button
                                key={`mark-${mark.origIdx}`}
                                type="button"
                                className={`k-timeline-dot${isSel ? " is-active" : ""}${isDim ? " is-dim" : ""}`}
                                data-kind={mark.feat.kind}
                                style={{ left: `${mark.pct}%` }}
                                title={`#${mark.origIdx + 1} · ${mark.feat.title} (гл. ${mark.chStart})`}
                                onClick={() => {
                                  if (featFilter !== "все" && mark.feat.kind !== featFilter) {
                                    setFeatFilter("все");
                                  }
                                  setFeatIdx(mark.origIdx);
                                  setReplayPulse((p) => p + 1);
                                  kingAudio.playHover();
                                }}
                              >
                                <span className="k-timeline-dot-num">
                                  {String(mark.origIdx + 1).padStart(2, "0")}
                                </span>
                                <span className="k-timeline-dot-ch">г.{mark.chStart}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="k-timeline-controls">
                          <button
                            type="button"
                            className="k-replay-nav-btn"
                            onClick={() => {
                              const pos = visibleFeats.findIndex((it) => it.origIdx === activeFeatEntry.origIdx);
                              const prev = visibleFeats[(pos - 1 + visibleFeats.length) % visibleFeats.length];
                              if (prev) {
                                setFeatIdx(prev.origIdx);
                                setReplayPulse((p) => p + 1);
                                kingAudio.playClick();
                              }
                            }}
                          >
                            ◀ ПРЕД. МАТЧ
                          </button>

                          <div className="k-timeline-legend">
                            <span className="k-tl-key" data-kind="победа"><i />Победа</span>
                            <span className="k-tl-key" data-kind="рекорд"><i />Рекорд</span>
                            <span className="k-tl-key" data-kind="первое убийство"><i />1-е убийство</span>
                          </div>

                          <button
                            type="button"
                            className="k-replay-nav-btn"
                            onClick={() => {
                              const pos = visibleFeats.findIndex((it) => it.origIdx === activeFeatEntry.origIdx);
                              const next = visibleFeats[(pos + 1) % visibleFeats.length];
                              if (next) {
                                setFeatIdx(next.origIdx);
                                setReplayPulse((p) => p + 1);
                                kingAudio.playClick();
                              }
                            }}
                          >
                            СЛЕД. МАТЧ ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ВКЛАДКА 5 · ИНТЕРАКТИВНЫЙ РАДАР-ГРАФ СВЯЗЕЙ */}
            {tab === "links" && (
              <div className="k-tab-content k-fade-in">
                <div className="k-link-pills">
                  {(["все", ...LINK_SIDES] as LinkFilter[]).map((side) => {
                    const cnt = side === "все" ? player.links.length : groupedLinks[side].length;
                    return (
                      <button
                        key={side}
                        type="button"
                        className={`k-link-pill${linkFilter === side ? " is-active" : ""}`}
                        data-side={side}
                        onClick={() => {
                          setLinkFilter(side);
                          const nextList = side === "все" ? player.links : groupedLinks[side];
                          if (nextList[0]) setSelectedLinkTo(nextList[0].to);
                          kingAudio.playClick();
                        }}
                      >
                        {LINK_SIDE_LABEL[side]} ({cnt})
                      </button>
                    );
                  })}
                </div>

                <div className="k-radar-layout">
                  {/* Левая часть: интерактивный векторный радар-граф */}
                  <div className="k-radar-stage">
                    <svg viewBox="0 0 520 340" className="k-radar-svg" role="img" aria-label="Карта связей игрока">
                      {/* Концентрические кольца радара */}
                      <circle cx="260" cy="170" r="56" className="k-radar-ring" />
                      <circle cx="260" cy="170" r="108" className="k-radar-ring" />
                      <circle cx="260" cy="170" r="158" className="k-radar-ring k-radar-ring--dash" />
                      <line x1="260" y1="16" x2="260" y2="324" className="k-radar-axis" />
                      <line x1="36" y1="170" x2="484" y2="170" className="k-radar-axis" />

                      {/* Соединительные нити */}
                      {graphNodes.map(({ lnk, x, y, color }) => {
                        const isSel = activeLink?.to === lnk.to;
                        return (
                          <line
                            key={`line-${lnk.to}`}
                            x1="260"
                            y1="170"
                            x2={x}
                            y2={y}
                            stroke={color}
                            strokeOpacity={isSel ? 0.95 : 0.28}
                            strokeWidth={isSel ? 2.4 : 1.1}
                            strokeDasharray={lnk.side === "враги" ? "4 3" : undefined}
                          />
                        );
                      })}

                      {/* Центральный узел — сам игрок */}
                      <circle cx="260" cy="170" r="30" className="k-radar-center-glow" />
                      <circle cx="260" cy="170" r="24" className="k-radar-center" />
                      <text x="260" y="174" textAnchor="middle" className="k-radar-center-txt">
                        {player.name.toUpperCase()}
                      </text>

                      {/* Кликабельные узлы контактов */}
                      {graphNodes.map(({ lnk, x, y, sin, color }) => {
                        const isSel = activeLink?.to === lnk.to;
                        const labelY = sin > 0.22 ? y + 18 : y - 12;
                        return (
                          <g
                            key={lnk.to}
                            className={`k-radar-node${isSel ? " is-active" : ""}`}
                            onClick={() => {
                              setSelectedLinkTo(lnk.to);
                              kingAudio.playHover();
                            }}
                          >
                            {isSel && (
                              <circle cx={x} cy={y} r="13" fill="none" stroke={color} strokeWidth="1.5" opacity="0.65" />
                            )}
                            <circle
                              cx={x}
                              cy={y}
                              r={isSel ? 7 : 5}
                              fill={isSel ? color : "#0b1320"}
                              stroke={color}
                              strokeWidth="2"
                            />
                            <text
                              x={x}
                              y={labelY}
                              textAnchor="middle"
                              className="k-radar-node-txt"
                              fill={isSel ? "#ffffff" : "#b8cce0"}
                            >
                              {lnk.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Правая часть: инспектор выбранной связи + быстрый список */}
                  <div className="k-radar-side">
                    {activeLink && (
                      <article className="k-radar-detail" data-side={activeLink.side}>
                        <div className="k-radar-detail-top">
                          <span className="k-radar-side-tag">{activeLink.side.toUpperCase()}</span>
                          <span className="k-radar-bond">{activeLink.bond}</span>
                        </div>
                        <h3 className="k-radar-name">{activeLink.name}</h3>
                        <p className="k-prose-p">{activeLink.text}</p>
                        {availableIds.has(activeLink.to) && onSelectPlayerId && (
                          <button
                            type="button"
                            className="k-inline-btn"
                            onClick={() => onSelectPlayerId(activeLink.to)}
                          >
                            ОТКРЫТЬ ДОСЬЕ →
                          </button>
                        )}
                      </article>
                    )}

                    <div className="k-radar-roster">
                      {visibleLinks.map((lnk) => (
                        <button
                          key={lnk.to}
                          type="button"
                          className={`k-radar-chip${activeLink?.to === lnk.to ? " is-active" : ""}`}
                          data-side={lnk.side}
                          onClick={() => {
                            setSelectedLinkTo(lnk.to);
                            kingAudio.playHover();
                          }}
                        >
                          <i aria-hidden="true" />
                          <span>{lnk.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
