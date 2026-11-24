"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PARTS, type Player } from "@/data/king/types";
import { kingAudio } from "./audio";
import { HoloPixelCard, type CardGroup } from "./HoloPixelCard";
import { MonitorDossier } from "./MonitorDossier";
import "./king-monitor.css";

type ScreenMode = "launcher" | "roster" | "dossier";
type ReaderTone = "idle" | "lime" | "crimson" | "cyan" | "amber";

const PART_DESCRIPTIONS: Record<number, { lead: string; ready: boolean }> = {
  1: {
    lead: "Е Сю покидает «Великолепную Эру», остаётся в ночном кафе «Счастье» и начинает путь с нуля.",
    ready: true,
  },
  2: { lead: "Сбор собственной команды и первые шаги нового состава на десятом сервере.", ready: false },
  3: { lead: "Год скрытой подготовки, тренировок и сборки серебряного арсенала.", ready: false },
  4: { lead: "Соревновательная лига: битва за путёвку в Профессиональный Альянс.", ready: false },
  5: { lead: "Межсезонье, трансферы и финальная обкатка тактик перед сезоном.", ready: false },
  6: { lead: "Возвращение в десятый сезон Профессиональной лиги «Славы».", ready: false },
  7: { lead: "Плей-офф, решающие серии и финал за чемпионский кубок.", ready: false },
};

interface RosterSlot {
  id: string;
  name: string;
  subtitle: string;
  group: CardGroup;
  player?: Player;
  art?: string | null;
}

const UPCOMING_HAPPY: Omit<RosterSlot, "player">[] = [
  { id: "tang-rou", name: "Танг Ро", subtitle: "Мягкая Мгла · Боевой маг", group: "happy" },
  { id: "chen-guo", name: "Чень Го", subtitle: "Туманная Мгла · Хозяйка «Счастья»", group: "happy" },
  { id: "su-mucheng", name: "Су Мученг", subtitle: "Танцующий Дождь · Лаунчер", group: "happy" },
  { id: "steamed-bun", name: "Булочка", subtitle: "Вторжение Парной Булочки · Хулиган", group: "happy" },
  { id: "qiao-yifan", name: "Цяо Ифан", subtitle: "Один Дюйм Пепла · Призрачный мечник", group: "happy" },
  { id: "hidden-light", name: "Скрытый Свет", subtitle: "Призыватель · Автор «Идиотских Гайдов»", group: "happy" },
];

const UPCOMING_PRO: Omit<RosterSlot, "player">[] = [
  { id: "huang-shaotian", name: "Хуан Шаотян", subtitle: "Проблемный Дождь · Святой Мечник", group: "pro" },
  { id: "song-xiang", name: "Сун Сян", subtitle: "Один Осенний Лист · «Великолепная Эра»", group: "pro" },
  { id: "wang-jiexi", name: "Ван Екси", subtitle: "Зерно Подорожника · «Маленькая Трава»", group: "pro" },
  { id: "han-wenqing", name: "Хань Вэньцин", subtitle: "Пустынная Пыль · «Тирания»", group: "pro" },
  { id: "yu-wenzhou", name: "Юй Вэньчжоу", subtitle: "Своксаар · «Синий Дождь»", group: "pro" },
  { id: "gao-yingjie", name: "Гао Инцзе", subtitle: "Ведьма · «Маленькая Трава»", group: "pro" },
  { id: "zhang-xinjie", name: "Чжан Синьцзе", subtitle: "Непоколебимый Камень · «Тирания»", group: "pro" },
  { id: "zhou-zekai", name: "Чжоу Зекай", subtitle: "Облачный Пик · «Самсара»", group: "pro" },
  { id: "chu-yunxiu", name: "Чу Юньсю", subtitle: "Ветреный Город · «Туманный Дождь»", group: "pro" },
  { id: "li-xuan", name: "Ли Сюань", subtitle: "Рыдающий Призрак · «Пустота»", group: "pro" },
  { id: "tan-hao", name: "Тан Хао", subtitle: "Хулиган · «Сотня Цветов»", group: "pro" },
  { id: "lin-jinguan", name: "Линь Цзиньгуань", subtitle: "Танг Саньда · «Воющий Ветер»", group: "pro" },
  { id: "du-ming", name: "Ду Мин", subtitle: "Лунный Мороз · «Самсара»", group: "pro" },
];

const UPCOMING_GUILD: Omit<RosterSlot, "player">[] = [
  { id: "blue-river", name: "Лазурный Поток", subtitle: "Глава гильдии «Синий Ручей»", group: "guild" },
  { id: "jiang-you", name: "Цзян Ю", subtitle: "Любимец Толпы · «Амбиции Тирана»", group: "guild" },
  { id: "chen-yehui", name: "Чен Ехуй", subtitle: "Глава «Великолепной Династии»", group: "guild" },
  { id: "cold-night", name: "Холодная Ночь", subtitle: "Офицер «Амбиций Тирана»", group: "guild" },
  { id: "liang-yichun", name: "Лян Ичунь", subtitle: "Офицер «Синего Ручья»", group: "guild" },
];

const KEYCAP_LABELS = ["ESC", "1", "2", "3", "4", "5", "Q", "W", "E", "R", "A", "S", "D", "F", "SPACE"];

export function MonitorArchive({
  players,
  artMap,
}: {
  players: Player[];
  artMap: Record<string, string>;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenMode>("launcher");
  const [selectedPart, setSelectedPart] = useState(1);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [bootPhase, setBootPhase] = useState<0 | 1 | 2 | 3>(1); // 1=CRT on, 2=GLORY logo, 3=loading client, 0=ready
  const [bootProgress, setBootProgress] = useState(0);
  const [bootStatus, setBootStatus] = useState("ИНИЦИАЛИЗАЦИЯ МОНИТОРА C-47...");
  const [poweringOff, setPoweringOff] = useState(false);
  const [crtOn, setCrtOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [osdVisible, setOsdVisible] = useState(false);
  const [readerTone, setReaderTone] = useState<ReaderTone>("idle");
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const osdTimerRef = useRef<number | null>(null);
  const readerTimerRef = useRef<number | null>(null);
  const keyTimerRef = useRef<number | null>(null);

  const pulseReader = useCallback((tone: "lime" | "crimson" | "cyan" | "amber") => {
    setReaderTone(tone);
    if (readerTimerRef.current) window.clearTimeout(readerTimerRef.current);
    readerTimerRef.current = window.setTimeout(() => setReaderTone("idle"), 1100);
  }, []);

  const booting = bootPhase !== 0;

  const finishBoot = useCallback(() => {
    setBootPhase(0);
    setBootProgress(100);
  }, []);

  // Атмосферная 3-ступенчатая загрузка игры «СЛАВА / GLORY» при появлении на странице (~2.5с, пропуск кликом/Space)
  useEffect(() => {
    const t1 = window.setTimeout(() => {
      setBootPhase(2);
      setBootProgress(28);
      setBootStatus("ПОДКЛЮЧЕНИЕ К 10-МУ СЕРВЕРУ «СЛАВЫ»...");
    }, 360);
    const t2 = window.setTimeout(() => {
      setBootPhase(3);
      setBootProgress(64);
      setBootStatus("СЧИТЫВАНИЕ КАРТЫ АККАУНТА · МРАЧНЫЙ ЛОРД...");
      pulseReader("lime");
    }, 1220);
    const t3 = window.setTimeout(() => {
      setBootProgress(94);
      setBootStatus("ЗАГРУЗКА ХРОНИК ТОМА I · «ИЗГНАНИЕ»...");
    }, 1950);
    const t4 = window.setTimeout(() => {
      finishBoot();
    }, 2550);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [finishBoot, pulseReader]);

  // Прогрев ассетов экрана состава и досье при наведении на кнопку входа
  const warmClientAssets = useCallback(() => {
    const urls = [
      "/art/king/bg-p1-lobby.webp",
      "/art/king/p1/ye-xiu.webp",
      "/art/king/p1/tang-rou.webp",
      "/art/king/umbrella-sprite.webp",
    ];
    for (const src of urls) {
      const im = new window.Image();
      im.decoding = "async";
      im.src = src;
    }
  }, []);

  // Горячие клавиши + живая подсветка нижних кейкапов на столе
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key === " " ? "SPACE" : e.key.toUpperCase();
      setPressedKey(k);
      if (keyTimerRef.current) window.clearTimeout(keyTimerRef.current);
      keyTimerRef.current = window.setTimeout(() => setPressedKey(null), 220);

      if (booting) {
        if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          finishBoot();
        }
        return;
      }

      if (e.key === "Escape") {
        if (screen === "dossier") {
          kingAudio.playClick();
          setScreen("roster");
          setActivePlayerId(null);
        } else if (screen === "roster") {
          kingAudio.playClick();
          setScreen("launcher");
        }
      } else if (e.key === "Enter" && screen === "launcher" && PART_DESCRIPTIONS[selectedPart]?.ready) {
        kingAudio.playCardRead();
        pulseReader("lime");
        setScreen("roster");
      } else if ((e.key === "ArrowDown" || e.key === "ArrowRight") && screen === "launcher") {
        setSelectedPart((p) => (p >= PARTS.length ? 1 : p + 1));
        kingAudio.playHover();
      } else if ((e.key === "ArrowUp" || e.key === "ArrowLeft") && screen === "launcher") {
        setSelectedPart((p) => (p <= 1 ? PARTS.length : p - 1));
        kingAudio.playHover();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [booting, finishBoot, pulseReader, screen, selectedPart]);

  // Выключение физического монитора кнопкой PWR -> схлопывание CRT -> возврат на полку VHS
  const handlePowerOff = useCallback(() => {
    if (poweringOff) return;
    kingAudio.playPowerOff();
    setPoweringOff(true);
    window.setTimeout(() => {
      router.push("/");
    }, 560);
  }, [poweringOff, router]);

  const toggleSfx = useCallback(() => {
    setSfxOn((prev) => {
      const next = !prev;
      kingAudio.enabled = next;
      if (next) kingAudio.playClick();
      return next;
    });
  }, []);

  const toggleCrt = useCallback(() => {
    setCrtOn((prev) => !prev);
    kingAudio.playClick();
  }, []);

  const triggerOsd = useCallback(() => {
    kingAudio.playOsd();
    setOsdVisible(true);
    if (osdTimerRef.current) window.clearTimeout(osdTimerRef.current);
    osdTimerRef.current = window.setTimeout(() => setOsdVisible(false), 3200);
  }, []);

  const availableIds = useMemo(() => new Set(players.map((p) => p.id)), [players]);
  const activePlayer = useMemo(
    () => players.find((p) => p.id === activePlayerId) ?? null,
    [activePlayerId, players],
  );

  const happyRoster: RosterSlot[] = useMemo(() => {
    const readyHappy: RosterSlot[] = players
      .filter((p) => p.group === "happy")
      .map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: `${p.accounts[0]?.name ?? p.team} · ${p.role}`,
        group: "happy",
        player: p,
        art: artMap[p.id] ?? null,
      }));
    const existing = new Set(readyHappy.map((r) => r.id));
    const waiting = UPCOMING_HAPPY.filter((u) => !existing.has(u.id)).map((u) => ({
      ...u,
      art: artMap[u.id] ?? null,
    }));
    return [...readyHappy, ...waiting];
  }, [artMap, players]);

  const proRoster: RosterSlot[] = useMemo(() => {
    const readyPro: RosterSlot[] = players
      .filter((p) => p.group === "pro")
      .map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: `${p.accounts[0]?.name ?? p.team} · ${p.role}`,
        group: "pro",
        player: p,
        art: artMap[p.id] ?? null,
      }));
    const existing = new Set(readyPro.map((r) => r.id));
    const waiting = UPCOMING_PRO.filter((u) => !existing.has(u.id)).map((u) => ({
      ...u,
      art: artMap[u.id] ?? null,
    }));
    return [...readyPro, ...waiting];
  }, [artMap, players]);

  const guildRoster: RosterSlot[] = useMemo(() => {
    const readyGuild: RosterSlot[] = players
      .filter((p) => p.group === "guild")
      .map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: `${p.accounts[0]?.name ?? p.team} · ${p.role}`,
        group: "guild",
        player: p,
        art: artMap[p.id] ?? null,
      }));
    const existing = new Set(readyGuild.map((r) => r.id));
    const waiting = UPCOMING_GUILD.filter((u) => !existing.has(u.id)).map((u) => ({
      ...u,
      art: artMap[u.id] ?? null,
    }));
    return [...readyGuild, ...waiting];
  }, [artMap, players]);

  const currentPart = PARTS[selectedPart - 1] ?? PARTS[0];
  const currentPartMeta = PART_DESCRIPTIONS[selectedPart] ?? PART_DESCRIPTIONS[1];

  const openPlayer = useCallback(
    (id: string) => {
      kingAudio.playCardRead();
      pulseReader("lime");
      setActivePlayerId(id);
      setScreen("dossier");
    },
    [pulseReader],
  );

  const handleCardHover = useCallback(
    (hovering: boolean, group: CardGroup) => {
      if (!hovering) return;
      kingAudio.playHover();
      pulseReader(group === "pro" ? "crimson" : group === "guild" ? "cyan" : "lime");
    },
    [pulseReader],
  );

  return (
    <main className="k-stage" data-screen={screen} data-power-off={poweringOff ? "true" : "false"}>
      {/* Внешний физический корпус монитора C-47 */}
      <div className="k-monitor-rig">
        <div className="k-bezel">
          {/* Верхний светоотражающий скос корпуса */}
          <div className="k-bezel-lip" aria-hidden="true" />

          {/* Рабочий стеклянный экран монитора */}
          <div className={`k-screen${crtOn ? " has-crt" : ""}${poweringOff ? " is-shutting-down" : ""}`}>
            {/* Режим 0: 3-ступенчатая заставка запуска игры «СЛАВА / GLORY» */}
            {booting && (
              <div
                role="button"
                tabIndex={0}
                className="k-boot-overlay"
                data-phase={bootPhase}
                onClick={finishBoot}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    finishBoot();
                  }
                }}
                aria-label="Пропустить загрузку игры Слава"
              >
                <div className="k-boot-grid" aria-hidden="true" />
                <div className="k-boot-crt-wake" aria-hidden="true" />

                <div className="k-boot-topbar" aria-hidden="true">
                  <span>XINGXIN INTERNET CAFE · C-47</span>
                  <span>GLORY CLIENT v10.0 · 10-Й СЕРВЕР</span>
                </div>

                <div className="k-boot-center">
                  <div className="k-boot-emblem" aria-hidden="true">
                    <svg viewBox="0 0 96 96" fill="none">
                      <polygon
                        points="48,6 84,26 84,70 48,90 12,70 12,26"
                        stroke="#38e8ff"
                        strokeWidth="2.5"
                        fill="rgba(10, 22, 38, 0.85)"
                      />
                      <polygon
                        points="48,14 76,30 76,66 48,82 20,66 20,30"
                        stroke="rgba(217, 255, 0, 0.45)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      {/* Пиксельный меч и корона «Славы» */}
                      <path
                        d="M48 20L53 31H43L48 20Z"
                        fill="#d9ff00"
                      />
                      <rect x="45.5" y="31" width="5" height="33" fill="#eef6ff" />
                      <rect x="36" y="54" width="24" height="4" fill="#d9ff00" />
                      <rect x="46" y="64" width="4" height="9" fill="#38e8ff" />
                      <path
                        d="M31 37L38 44L31 51M65 37L58 44L65 51"
                        stroke="#38e8ff"
                        strokeWidth="2.2"
                        strokeLinecap="square"
                      />
                    </svg>
                  </div>

                  <div className="k-boot-kicker">ДЕСЯТЫЙ СЕРВЕР · ЗАПУСК КЛИЕНТА</div>
                  <div className="k-boot-title">СЛАВА</div>
                  <div className="k-boot-en">G L O R Y</div>

                  <div className="k-boot-progress-wrap">
                    <div className="k-boot-progress-meta">
                      <span className="k-boot-status">{bootStatus}</span>
                      <span className="k-boot-pct">{bootProgress}%</span>
                    </div>
                    <div className="k-boot-progress-track">
                      <div className="k-boot-progress-fill" style={{ width: `${bootProgress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="k-boot-skip">
                  [ КЛИК ИЛИ SPACE — ПРОПУСТИТЬ ]
                </div>
              </div>
            )}

            {/* Экран 1 · Лаунчер и выбор тома */}
            {screen === "launcher" && (
              <section className="k-launcher">
                <div className="k-launcher-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/art/king/bg-p1-cafe.webp"
                    alt="Ночное интернет-кафе «Счастье» в метель"
                    className="k-launcher-bg-img"
                    decoding="sync"
                    fetchPriority="high"
                  />
                  <div className="k-launcher-vignette" aria-hidden="true" />
                  <div className="k-pixel-snow" aria-hidden="true" />
                </div>

                {/* Верхняя строка клиента внутри монитора (выход на полку — физической кнопкой PWR снизу!) */}
                <header className="k-screen-bar k-screen-bar--overlay">
                  <div className="k-bar-status">
                    <span className="k-live-dot" aria-hidden="true" />
                    <span>МЕСТО C-47 · «СЧАСТЬЕ»</span>
                  </div>
                  <div className="k-bar-title">GLORY CLIENT · <span>АВАТАР КОРОЛЯ</span></div>
                  <div className="k-bar-meta">10-Й СЕРВЕР</div>
                </header>

                <div className="k-launcher-grid">
                  {/* Левая колонка: текущий том */}
                  <div className="k-launcher-hero">
                    <div className="k-launcher-kicker">СЛАВА / GLORY</div>
                    <div className="k-part-badge">ТОМ {String(currentPart.n).padStart(2, "0")}</div>
                    <h1 className="k-launcher-title">{currentPart.title.toUpperCase()}</h1>
                    <p className="k-launcher-lead">{currentPartMeta.lead}</p>

                    <div className="k-launcher-actions">
                      {currentPartMeta.ready ? (
                        <button
                          type="button"
                          className="k-enter-btn"
                          onPointerEnter={warmClientAssets}
                          onFocus={warmClientAssets}
                          onClick={() => {
                            kingAudio.playCardRead();
                            pulseReader("lime");
                            setScreen("roster");
                          }}
                        >
                          <span aria-hidden="true">►</span>
                          <span>ВОЙТИ В ТОМ</span>
                        </button>
                      ) : (
                        <button type="button" className="k-enter-btn is-locked" disabled>
                          <span>ТОМ В РАЗРАБОТКЕ</span>
                        </button>
                      )}
                      <span className="k-launcher-hint">
                        Выход на полку: кнопка <strong>⏻ PWR</strong> на корпусе снизу
                      </span>
                    </div>
                  </div>

                  {/* Правая колонка: 7 хроник-томов в стиле серверов MMORPG */}
                  <aside className="k-chronicle-dock" aria-label="Выбор тома">
                    <div className="k-chronicle-head">ХРОНИКИ · 7 ЧАСТЕЙ</div>
                    <div className="k-chronicle-list">
                      {PARTS.map((pt) => {
                        const meta = PART_DESCRIPTIONS[pt.n];
                        const active = pt.n === selectedPart;
                        return (
                          <button
                            key={pt.n}
                            type="button"
                            className={`k-chronicle-row${active ? " is-active" : ""}${meta.ready ? "" : " is-soon"}`}
                            onPointerEnter={() => {
                              if (meta.ready) warmClientAssets();
                            }}
                            onClick={() => {
                              setSelectedPart(pt.n);
                              kingAudio.playHover();
                              pulseReader(meta.ready ? "lime" : "amber");
                            }}
                          >
                            <span className="k-chronicle-num">{String(pt.n).padStart(2, "0")}</span>
                            <span className="k-chronicle-name">{pt.title.toUpperCase()}</span>
                            <span className="k-chronicle-tag">
                              {meta.ready ? "• ОНЛАЙН" : "СКОРО"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                </div>
              </section>
            )}

            {/* Экран 2 · База игроков / Пиксельные ID-карты (Simey Holo) */}
            {screen === "roster" && (
              <section className="k-roster">
                <div className="k-roster-bg" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/art/king/bg-p1-lobby.webp" alt="" className="k-roster-bg-img" />
                  <div className="k-roster-bg-veil" />
                </div>

                <header className="k-screen-bar">
                  <button
                    type="button"
                    className="k-bar-btn"
                    onClick={() => {
                      kingAudio.playClick();
                      setScreen("launcher");
                    }}
                  >
                    ← ВЫБОР ТОМА
                  </button>
                  <div className="k-bar-title">
                    ТОМ {String(currentPart.n).padStart(2, "0")} · <span>{currentPart.title.toUpperCase()}</span> — БАЗА ИГРОКОВ
                  </div>
                  <div className="k-bar-meta">
                    ГОТОВО: {players.length}
                  </div>
                </header>

                <div className="k-roster-scroll">
                  <div className="k-roster-section">
                    <div className="k-section-divider" data-group="happy">
                      <span className="k-section-slash" aria-hidden="true">/</span>
                      <h2>СЧАСТЬЕ</h2>
                      <span className="k-section-sub">Ночное интернет-кафе и команда с нуля</span>
                      <span className="k-section-rule" aria-hidden="true" />
                    </div>
                    <div className="k-cards-grid">
                      {happyRoster.map((slot, i) => (
                        <HoloPixelCard
                          key={slot.id}
                          index={i}
                          name={slot.name}
                          subtitle={slot.subtitle}
                          group={slot.group}
                          art={slot.art}
                          locked={!slot.player}
                          onSelect={slot.player ? () => openPlayer(slot.id) : undefined}
                          onHoverChange={handleCardHover}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="k-roster-section">
                    <div className="k-section-divider" data-group="pro">
                      <span className="k-section-slash" aria-hidden="true">/</span>
                      <h2>ПРО-ЛИГА</h2>
                      <span className="k-section-sub">Звёзды и соперники Профессионального Альянса</span>
                      <span className="k-section-rule" aria-hidden="true" />
                    </div>
                    <div className="k-cards-grid">
                      {proRoster.map((slot, i) => (
                        <HoloPixelCard
                          key={slot.id}
                          index={happyRoster.length + i}
                          name={slot.name}
                          subtitle={slot.subtitle}
                          group={slot.group}
                          art={slot.art}
                          locked={!slot.player}
                          onSelect={slot.player ? () => openPlayer(slot.id) : undefined}
                          onHoverChange={handleCardHover}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="k-roster-section">
                    <div className="k-section-divider" data-group="guild">
                      <span className="k-section-slash" aria-hidden="true">/</span>
                      <h2>ГИЛЬДИИ</h2>
                      <span className="k-section-sub">Главы и офицеры гильдий десятого сервера</span>
                      <span className="k-section-rule" aria-hidden="true" />
                    </div>
                    <div className="k-cards-grid">
                      {guildRoster.map((slot, i) => (
                        <HoloPixelCard
                          key={slot.id}
                          index={happyRoster.length + proRoster.length + i}
                          name={slot.name}
                          subtitle={slot.subtitle}
                          group={slot.group}
                          art={slot.art}
                          locked={!slot.player}
                          onSelect={slot.player ? () => openPlayer(slot.id) : undefined}
                          onHoverChange={handleCardHover}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Экран 3 · Игровое окно досье персонажа */}
            {screen === "dossier" && activePlayer && (
              <MonitorDossier
                player={activePlayer}
                art={artMap[activePlayer.id] ?? null}
                partLabel={`ТОМ ${String(currentPart.n).padStart(2, "0")} · ${currentPart.title.toUpperCase()}`}
                onBack={() => {
                  setScreen("roster");
                  setActivePlayerId(null);
                }}
                onPulseReader={pulseReader}
                onSelectPlayerId={openPlayer}
                availableIds={availableIds}
              />
            )}

            {/* Сервисное зелёное OSD-меню монитора (пасхалка по кнопке OSD) */}
            {osdVisible && (
              <div className="k-osd-popup" role="status">
                <div className="k-osd-title">OSD · XINGXIN SYNCMASTER C-47</div>
                <div className="k-osd-row"><span>РЕЖИМ:</span><span>1024×768 · 75Hz · HI-BIT</span></div>
                <div className="k-osd-row"><span>CRT-ФИЛЬТР:</span><span>{crtOn ? "ВКЛ" : "ВЫКЛ"}</span></div>
                <div className="k-osd-row"><span>ЗВУК SFX:</span><span>{sfxOn ? "ВКЛ" : "ВЫКЛ"}</span></div>
                <div className="k-osd-row"><span>СМЕНА:</span><span>23:00 — 07:00</span></div>
              </div>
            )}

            {/* Эффект CRT-стекла и сканлайнов */}
            {crtOn && <div className="k-crt-scanlines" aria-hidden="true" />}
            <div className="k-glass-sheen" aria-hidden="true" />

            {/* Анимация выключения кинескопа в белую полосу и точку */}
            {poweringOff && <div className="k-shutdown-flash" aria-hidden="true" />}
          </div>

          {/* Нижняя аппаратная панель монитора: наклейка C-47, логотип и 4 физические кнопки */}
          <div className="k-bezel-chin">
            <div className="k-chin-left">
              <span className="k-sticker-c47" title="Рабочее место C-47 · Интернет-кафе «Счастье»">
                C-47
              </span>
              <span className="k-chin-hint">
                ESC — назад · 1–5 — вкладки
              </span>
            </div>

            <div className="k-chin-brand" aria-hidden="true">GLORY · SYNC</div>

            <div className="k-hw-controls">
              <button
                type="button"
                className={`k-hw-btn${osdVisible ? " is-lit" : ""}`}
                onClick={triggerOsd}
                title="Сервисное меню монитора (OSD)"
              >
                OSD
              </button>
              <button
                type="button"
                className={`k-hw-btn${crtOn ? " is-lit" : ""}`}
                onClick={toggleCrt}
                title="Переключить эффект CRT-сканлайнов"
              >
                CRT
              </button>
              <button
                type="button"
                className={`k-hw-btn${sfxOn ? " is-lit" : ""}`}
                onClick={toggleSfx}
                title="Включить или выключить звуки монитора"
              >
                SFX
              </button>

              <button
                type="button"
                className={`k-pwr-btn${poweringOff ? " is-off" : ""}`}
                onClick={handlePowerOff}
                title="Выключить монитор и вернуться на полку VHS"
                aria-label="Выключить монитор и вернуться на полку"
              >
                <span className="k-pwr-led" aria-hidden="true" />
                <span className="k-pwr-symbol" aria-hidden="true">⏻</span>
                <span className="k-pwr-text">PWR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Узкая полоса стола под монитором: край механики и USB-картридер «Славы» */}
        <div className="k-desk-sliver" aria-hidden="true">
          <div className="k-desk-keyboard">
            {KEYCAP_LABELS.map((k) => (
              <span key={k} className={`k-keycap${pressedKey === k ? " is-pressed" : ""}${k === "SPACE" ? " is-space" : ""}`} />
            ))}
          </div>

          <div className="k-card-reader" data-tone={readerTone}>
            <span className="k-reader-slot" />
            <span className="k-reader-led" />
            <span className="k-reader-lbl">GLORY READER</span>
          </div>
        </div>
      </div>
    </main>
  );
}
