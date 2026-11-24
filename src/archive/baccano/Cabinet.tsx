"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  useSyncExternalStore,
} from "react";
import type { Faction } from "@/data/baccano/cases";
import type { CaseDossier } from "@/data/baccano/types";
import { DossierSheet, dossierAssets, loadDossierAssets, watchDossierAssets, type AssetState, type Person } from "./DossierSheet";
import wood from "../../../public/art/baccano/drawer-wood.webp";
import k from "./cabinet.module.css";

/**
 * Картотека дела — один неподвижный шкаф. Ящик = группа; он выдвигается целой коробкой
 * (передняя панель, дно, стенки), внутри стоят карточки учёта с язычками. Выбранная
 * карточка поднимается из стопки, второй щелчок раскрывает из неё досье.
 *
 * Состояния: A — шкаф закрыт, B — ящик выдвинут, C — карточка поднята, D — досье (#id в адресе).
 * Возврат идёт в обратном порядке: Esc / «назад» сворачивает досье в ту же карточку.
 */

const SEC = 8; // карточек в разделе; в ящике больше — ставятся направляющие разделители
const T = { press: 110, drawer: 560, card: 300 };

type Phase = "A" | "B" | "C";
type Drawer = { label: string; ids: string[] };
type St = { phase: Phase; drawer: number | null; card: number | null; sec: number };
type Geo = { dw: number; dh: number; pull: number; lip: number; tabs: number; mobile: boolean };

const surname = (name: string) => name.split(" ").slice(-1)[0];
const two = (n: number) => String(n).padStart(2, "0");

/** Глубина каждого предмета внутри выдвинутой части ящика — из одной формулы. */
function arrange(n: number, sec: number, g: Geo) {
  const usable = g.pull - g.lip - 14;
  const cards: { z: number; col: number; off: boolean }[] = [];
  const guides: { z: number; open: boolean }[] = [];
  if (n <= SEC) {
    const step = Math.min(g.dw * 0.115, usable / Math.max(n, 1));
    for (let i = 0; i < n; i++)
      cards.push({ z: -g.lip - 10 - i * step, col: i % g.tabs, off: false });
    return { cards, guides };
  }
  const ns = Math.ceil(n / SEC);
  const act = Math.min(SEC, n - sec * SEC);
  const packed = 2.5;
  const gstep = 12;
  const lean = g.dh * 0.86 * Math.sin((26 * Math.PI) / 180) + 6; // место под наклонённый разделитель
  const stepA = Math.min(g.dw * 0.1, (usable - ns * gstep - lean - (n - act) * packed) / act);
  let z = -g.lip - 8;
  for (let s = 0; s < ns; s++) {
    if (s === sec) z -= lean;
    guides.push({ z, open: s === sec });
    z -= gstep;
    for (let i = s * SEC; i < Math.min(n, (s + 1) * SEC); i++) {
      const on = s === sec;
      cards.push({ z, col: (i % SEC) % g.tabs, off: !on });
      z -= on ? stepA : packed;
    }
  }
  return { cards, guides };
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, reduced() ? 0 : ms));

export function Cabinet({
  dossiers,
  factions,
  caseNo,
  openId,
  open,
  close,
}: {
  dossiers: CaseDossier[];
  factions: Faction[];
  caseNo: string;
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}) {
  const byId = useMemo(() => new Map(dossiers.map((d, i) => [d.id, { d, no: i + 1 }])), [dossiers]);

  // ящики = утверждённые группы дела; кто не входит ни в одну — в отдельный ящик
  const drawers = useMemo<Drawer[]>(() => {
    const seen = new Set<string>();
    const out: Drawer[] = [];
    for (const f of factions) {
      const ids = f.ids.filter((id) => byId.has(id) && !seen.has(id));
      ids.forEach((id) => seen.add(id));
      if (ids.length) out.push({ label: f.label, ids });
    }
    const rest = dossiers.map((d) => d.id).filter((id) => !seen.has(id));
    if (rest.length) out.push({ label: "Прочие справки", ids: rest });
    return out;
  }, [factions, dossiers, byId]);
  const drawerOf = useCallback((id: string) => drawers.findIndex((d) => d.ids.includes(id)), [drawers]);

  const [st, setSt] = useState<St>({ phase: "A", drawer: null, card: null, sec: 0 });
  const stRef = useRef(st);
  stRef.current = st;
  const [press, setPress] = useState<number | null>(null);
  const [closing, setClosing] = useState<number | null>(null);
  const [ledger, setLedger] = useState(false);
  const [geo, setGeo] = useState<Geo>({ dw: 290, dh: 188, pull: 270, lip: 15, tabs: 3, mobile: false });
  const [below, setBelow] = useState(0);
  const busy = useRef(false);

  /* досье раскрывается только когда его бумага и гарнитуры уже в памяти;
     грузим по первому взаимодействию со шкафом (или сразу, если открыта прямая ссылка #id),
     чтобы не отнимать канал у первого экрана дела */
  const roomRef = useRef<HTMLDivElement>(null);
  const assets = useSyncExternalStore<AssetState>(watchDossierAssets, dossierAssets, () => "idle");
  const loadAssets = useCallback(() => {
    if (roomRef.current) loadDossierAssets(roomRef.current);
  }, []);
  useEffect(() => {
    if (openId) loadAssets();
  }, [openId, loadAssets]);
  const ready = assets === "ready";
  // пока досье не готово или не загрузилось, строка состояния под шкафом должна быть на экране
  const hintRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (openId && assets !== "ready") hintRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [openId, assets]);

  const sceneRef = useRef<HTMLDivElement>(null);
  const carcassRef = useRef<HTMLDivElement>(null);
  const bayEls = useRef<(HTMLDivElement | null)[]>([]);
  const cardEls = useRef(new Map<string, HTMLButtonElement>());
  const ledgerBtn = useRef<HTMLButtonElement>(null);
  const [live, setLive] = useState("");

  /* геометрия: из реальной ширины ящика; те же пропорции, что и в CSS */
  useEffect(() => {
    const measure = () => {
      const b = bayEls.current[0];
      if (!b) return;
      const dw = b.offsetWidth;
      const dh = b.offsetHeight;
      const mobile = window.innerWidth <= 760;
      const g: Geo = { dw, dh, pull: dw * 0.93, lip: Math.max(10, dw * 0.053), tabs: mobile ? 2 : 3, mobile };
      setGeo(g);
      // сколько места снизу займёт выдвинутый нижний ящик — чтобы он ничего не перекрывал
      const sc = sceneRef.current, cc = carcassRef.current;
      const last = bayEls.current[bayEls.current.length - 1];
      if (sc && cc && last) {
        const p = dw * (mobile ? 7 : 8);
        const eye = sc.getBoundingClientRect().top - dw * 3.3;
        const yb = last.getBoundingClientRect().bottom - eye;
        const grow = (yb * p) / (p - g.pull) - yb;
        setBelow(Math.max(0, Math.ceil(grow - (cc.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom) + 24)));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (sceneRef.current) ro.observe(sceneRef.current);
    return () => ro.disconnect();
  }, [drawers.length]);

  const cardEl = (gi: number | null, i: number | null) =>
    gi == null || i == null ? null : cardEls.current.get(drawers[gi]?.ids[i]) ?? null;
  const focusCard = useCallback(
    (gi: number, i: number) => requestAnimationFrame(() => cardEl(gi, i)?.focus({ preventScroll: true })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [drawers],
  );

  /* ---- переходы: каждый — одно действие с предметом ---- */
  const closeDrawer = useCallback(
    async (refocus = true) => {
      const gi = stRef.current.drawer;
      if (gi == null) return;
      setClosing(gi);
      setSt({ phase: "A", drawer: gi, card: null, sec: 0 });
      await wait(T.drawer);
      setClosing(null);
      setSt({ phase: "A", drawer: null, card: null, sec: 0 });
      if (refocus) bayEls.current[gi]?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    },
    [],
  );

  const openDrawer = useCallback(
    async (gi: number, card: number | null = null) => {
      if (busy.current) return;
      busy.current = true;
      const s = stRef.current;
      if (s.drawer != null && s.drawer !== gi && s.phase !== "A") {
        if (s.phase === "C") {
          setSt((x) => ({ ...x, phase: "B" }));
          await wait(T.card);
        }
        await closeDrawer(false);
      }
      setPress(gi); // ручка
      await wait(T.press);
      setPress(null);
      setSt({ phase: "B", drawer: gi, card: null, sec: 0 });
      setLive(`Выдвинут ящик «${drawers[gi].label}», карточек: ${drawers[gi].ids.length}`);
      await wait(T.drawer);
      if (card != null) {
        setSt({ phase: "C", drawer: gi, card, sec: Math.floor(card / SEC) });
        await wait(T.card);
      }
      focusCard(gi, card ?? 0);
      busy.current = false;
    },
    [closeDrawer, drawers, focusCard],
  );

  const raise = useCallback(
    (i: number) => {
      const gi = stRef.current.drawer;
      if (gi == null) return;
      setSt({ phase: "C", drawer: gi, card: i, sec: Math.floor(i / SEC) });
      setLive("Выбрана карточка: " + byId.get(drawers[gi].ids[i])!.d.name);
      focusCard(gi, i);
    },
    [byId, drawers, focusCard],
  );
  const lower = useCallback(() => {
    const s = stRef.current;
    if (s.phase !== "C" || s.drawer == null) return;
    setSt({ ...s, phase: "B" });
    focusCard(s.drawer, s.card ?? 0);
  }, [focusCard]);
  const move = useCallback(
    (d: number) => {
      const s = stRef.current;
      if (s.drawer == null || s.phase === "A") return;
      const n = drawers[s.drawer].ids.length;
      const i = Math.max(0, Math.min(n - 1, (s.card ?? (d > 0 ? -1 : 1)) + d));
      if (s.phase === "C") raise(i);
      else {
        setSt({ ...s, card: i, sec: Math.floor(i / SEC) });
        focusCard(s.drawer, i);
      }
    },
    [drawers, raise, focusCard],
  );

  /* досье в адресе (#id): ящик и карточка встают на место — и при ссылке, и при «назад/вперёд» */
  useEffect(() => {
    if (openId && dossierAssets() === "error") loadAssets();
  }, [openId, loadAssets]);
  useEffect(() => {
    if (!openId) return;
    const gi = drawerOf(openId);
    if (gi < 0) return;
    const i = drawers[gi].ids.indexOf(openId);
    setSt({ phase: "C", drawer: gi, card: i, sec: Math.floor(i / SEC) });
  }, [openId, drawerOf, drawers]);

  /* Esc шаг за шагом назад: C → B → A (досье и опись закрываются сами) */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || openId || ledger) return;
      const s = stRef.current;
      if (s.phase === "C") lower();
      else if (s.phase === "B") closeDrawer();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [openId, ledger, lower, closeDrawer]);

  const onFront = (gi: number) => {
    loadAssets();
    const s = stRef.current;
    if (s.drawer === gi && s.phase !== "A") {
      if (s.phase === "C") {
        setSt({ ...s, phase: "B" });
        wait(T.card).then(() => closeDrawer());
      } else closeDrawer();
    } else openDrawer(gi);
  };
  const onCard = (i: number, onTab: boolean) => {
    const s = stRef.current;
    if (s.phase === "C" && i === s.card) {
      if (onTab) lower(); // свой язычок — опустить
      else open(drawers[s.drawer!].ids[i]); // лицо карточки — раскрыть досье
    } else raise(i);
  };
  const onGuide = (sec: number) => {
    const s = stRef.current;
    if (s.drawer == null) return;
    setSt({ ...s, phase: "B", sec, card: sec * SEC });
    focusCard(s.drawer, sec * SEC);
  };
  const onCardKey = (e: React.KeyboardEvent) => {
    const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    if (d) {
      e.preventDefault();
      move(d);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const s = stRef.current;
      if (s.phase === "C" && s.drawer != null && s.card != null) open(drawers[s.drawer].ids[s.card]);
      else raise(s.card ?? 0);
    }
  };

  // колесо и свайп листают карточки только над выдвинутым ящиком
  const wheelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      const s = stRef.current;
      if ((s.phase === "B" || s.phase === "C") && (e.target as HTMLElement).closest("[data-open]")) {
        e.preventDefault();
        if (Math.abs(e.deltaY) > 2) move(Math.sign(e.deltaY));
      }
    };
    let tx: number | null = null;
    const ts = (e: TouchEvent) => (tx = e.touches[0].clientX);
    const te = (e: TouchEvent) => {
      if (tx == null) return;
      const d = e.changedTouches[0].clientX - tx;
      tx = null;
      if (Math.abs(d) > 40 && (e.target as HTMLElement).closest("[data-open]")) move(d < 0 ? 1 : -1);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchend", te, { passive: true });
    return () => {
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchend", te);
    };
  }, [move]);

  const cols = geo.mobile ? 2 : 4;
  const blanks = (cols - (drawers.length % cols)) % cols;
  const total = dossiers.length;
  const current = openId ? byId.get(openId)?.d ?? null : null;
  const phase = openId ? "D" : st.phase;

  /* переходы по связям: досье связанного лица открывается поверх, «Назад» возвращает к прежнему */
  const [trail, setTrail] = useState<string[]>([]);
  const [swap, setSwap] = useState(false); // досье открыто переходом из другого досье, а не из ящика
  const people = useMemo(() => {
    const m = new Map<string, Person>();
    drawers.forEach((dr) => dr.ids.forEach((id) => m.set(id, { name: byId.get(id)!.d.name, drawerLabel: dr.label })));
    return m;
  }, [drawers, byId]);
  const openLinked = useCallback(
    (id: string) => {
      if (openId) setTrail((t) => [...t, openId]);
      setSwap(true);
      open(id);
    },
    [open, openId],
  );
  const goBack = useCallback(() => {
    const prev = trail[trail.length - 1];
    if (!prev) return;
    setTrail(trail.slice(0, -1));
    setSwap(true);
    open(prev);
  }, [trail, open]);
  const closeAll = useCallback(() => {
    setTrail([]);
    setSwap(false);
    close();
  }, [close]);
  const prevId = trail[trail.length - 1];

  const hint = {
    A: "Выберите ящик группы",
    B: "Язычок карточки, стрелки или колесо — выбрать карточку · Esc — задвинуть ящик",
    C: "Щелчок по карточке или Enter — открыть досье · колесо, стрелки или свайп — соседняя · Esc — опустить",
    D: ready ? "Esc — вернуть карточку в ящик" : assets === "error" ? "Материалы дела не загрузились." : "Достаём дело…",
  }[phase];

  return (
    <div ref={roomRef} className={k.room} data-phase={phase} onPointerEnter={loadAssets} style={{ "--wood": `url(${wood.src})` } as CSSProperties}>
      <div className={k.scene} ref={sceneRef} style={{ paddingBottom: below } as CSSProperties}>
        <div className={k.carcass} ref={carcassRef}>
          <div className={k.plaque} aria-hidden>
            <Image src="/art/baccano/plaque.webp" alt="" fill sizes="320px" />
            <span>{caseNo}</span>
          </div>
          <div className={k.grid} ref={wheelRef}>
            {drawers.map((dr, gi) => {
              const isOpen = st.drawer === gi && st.phase !== "A";
              const lay = arrange(dr.ids.length, isOpen ? st.sec : 0, geo);
              // предметы от передней стенки к задней; в DOM — от задних к передним
              const items: React.ReactNode[] = [];
              dr.ids.forEach((id, i) => {
                if (dr.ids.length > SEC && i % SEC === 0) {
                  const s = i / SEC;
                  const last = Math.min(dr.ids.length, i + SEC) - 1;
                  const gd = lay.guides[s];
                  items.push(
                    <button
                      key={`g${s}`}
                      type="button"
                      tabIndex={-1}
                      className={k.guide}
                      data-open={gd.open || undefined}
                      style={{ "--z": `${gd.z}px`, "--col": s % geo.tabs } as CSSProperties}
                      aria-label={`Раздел ${s + 1}: карточки ${i + 1}–${last + 1}`}
                      onClick={() => onGuide(s)}
                    >
                      <span className={k.gt}>
                        {two(i + 1)}–{two(last + 1)}
                        <small>
                          {surname(byId.get(dr.ids[i])!.d.name)} — {surname(byId.get(dr.ids[last])!.d.name)}
                        </small>
                      </span>
                    </button>,
                  );
                }
                const { d, no } = byId.get(id)!;
                const c = lay.cards[i];
                const active = isOpen && st.card === i && st.phase === "C";
                items.push(
                  <button
                    key={id}
                    ref={(el) => {
                      if (el) cardEls.current.set(id, el);
                      else cardEls.current.delete(id);
                    }}
                    type="button"
                    role="option"
                    aria-selected={active}
                    tabIndex={isOpen && i === (st.card ?? 0) ? 0 : -1}
                    className={k.card}
                    data-active={active || undefined}
                    data-off={c.off || undefined}
                    style={{ "--z": `${c.z}px`, "--col": c.col } as CSSProperties}
                    aria-label={d.name}
                    onClick={(e) => onCard(i, !!(e.target as HTMLElement).closest(`.${k.tab}`))}
                    onKeyDown={onCardKey}
                  >
                    <Image src="/art/baccano/card.webp" alt="" fill sizes="300px" className={k.stock} />
                    <span className={k.tab}>{surname(d.name)}</span>
                    <span className={k.face} aria-hidden={!active}>
                      <span className={k.faceHead}>
                        <span>Карточка учёта</span>
                        <span>№ {two(no)}</span>
                      </span>
                      <span className={k.faceName}>{d.name}</span>
                      {d.aka.length > 0 && <span className={k.faceAka}>{d.aka.slice(0, 2).join(" · ")}</span>}
                    </span>
                  </button>,
                );
              });
              return (
                <div
                  key={dr.label}
                  ref={(el) => {
                    bayEls.current[gi] = el;
                  }}
                  className={k.bay}
                  data-open={isOpen || undefined}
                  data-press={press === gi || undefined}
                  data-closing={closing === gi || undefined}
                >
                  <i className={k.cast} />
                  <div className={k.box}>
                    <i className={`${k.pl} ${k.floor}`} />
                    <i className={`${k.pl} ${k.wl}`} />
                    <i className={`${k.pl} ${k.wr}`} />
                    <i className={`${k.pl} ${k.rim}`} />
                    <div
                      className={k.files}
                      role="listbox"
                      id={`bc-files-${gi}`}
                      aria-label={`${dr.label}: ${dr.ids.length} карт.`}
                      data-sectioned={dr.ids.length > SEC || undefined}
                    >
                      {items.reverse()}
                    </div>
                    <i className={`${k.pl} ${k.lip}`} />
                    <button
                      type="button"
                      className={k.front}
                      aria-expanded={isOpen}
                      aria-controls={`bc-files-${gi}`}
                      aria-label={`Ящик «${dr.label}», ${dr.ids.length} карт.`}
                      onClick={() => onFront(gi)}
                    >
                      <Image src="/art/baccano/drawer-front.webp" alt="" fill sizes="300px" className={k.frontImg} />
                      <span className={k.slip}>
                        <b>{dr.label}</b>
                        <small>{two(dr.ids.length)} карт.</small>
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
            {Array.from({ length: blanks }, (_, i) => (
              <div key={`blank${i}`} className={`${k.bay} ${k.blank}`} aria-hidden>
                <div className={k.box}>
                  <span className={k.front}>
                    <Image src="/art/baccano/drawer-front.webp" alt="" fill sizes="300px" className={k.frontImg} />
                    <span className={k.slip} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className={k.hint} ref={hintRef}>
        {hint}
        {phase === "D" && assets === "error" && (
          <>
            {" "}
            <button type="button" className={k.all} onClick={loadAssets}>
              повторить
            </button>
            {" · "}
            <button type="button" className={k.plain} onClick={closeAll}>
              отмена
            </button>
          </>
        )}
        {phase === "A" && (
          <>
            {" · "}
            {/* опись дела: просто строка подсказки, без отдельного предмета на шкафу */}
            <button ref={ledgerBtn} type="button" className={k.all} aria-haspopup="dialog" onClick={() => setLedger(true)}>
              все {total} списком
            </button>
          </>
        )}
      </p>
      <p className={k.sr} aria-live="polite">
        {live}
      </p>

      {/* опись: общий список по ящикам; имя открывает нужный ящик и поднимает карточку */}
      {ledger && (
        <Ledger
          caseNo={caseNo}
          drawers={drawers}
          byId={byId}
          onClose={() => {
            setLedger(false);
            ledgerBtn.current?.focus({ preventScroll: true });
          }}
          onPick={(gi, i) => {
            setLedger(false);
            const s = stRef.current;
            if (s.drawer === gi && s.phase !== "A") {
              setSt({ phase: "C", drawer: gi, card: i, sec: Math.floor(i / SEC) });
              focusCard(gi, i);
            } else openDrawer(gi, i);
          }}
        />
      )}

      {current && ready && (
        <DossierSheet
          key={current.id}
          d={current}
          caseNo={caseNo}
          group={drawers[drawerOf(current.id)]?.label ?? ""}
          drawerNo={drawerOf(current.id) + 1}
          cardNo={(drawers[drawerOf(current.id)]?.ids.indexOf(current.id) ?? 0) + 1}
          people={people}
          onClose={closeAll}
          onOpen={openLinked}
          back={prevId && people.has(prevId) ? { name: people.get(prevId)!.name, go: goBack } : undefined}
          // из ящика вылетает только карточка, открытая в шкафу; переход по связи — смена бумаг на том же столе.
          // Возвращается карточка всегда в свой ящик.
          enter={swap ? "swap" : "drawer"}
          anchor={() => cardEls.current.get(current.id) ?? null}
        />
      )}
    </div>
  );
}

function Ledger({
  caseNo,
  drawers,
  byId,
  onClose,
  onPick,
}: {
  caseNo: string;
  drawers: Drawer[];
  byId: Map<string, { d: CaseDossier; no: number }>;
  onClose: () => void;
  onPick: (gi: number, i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button[data-id]")?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <div className={k.ledgerLayer} onClick={onClose}>
      <div
        ref={ref}
        className={k.ledgerSheet}
        role="dialog"
        aria-modal="true"
        aria-label={`Опись дела, ${caseNo}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Опись дела · {caseNo}</h3>
        <div className={k.ledgerCols}>
          {drawers.map((dr, gi) => (
            <section key={dr.label}>
              <h4>
                Ящик {gi + 1} · {dr.label}
              </h4>
              {dr.ids.map((id, i) => (
                <button key={id} type="button" data-id={id} onClick={() => onPick(gi, i)}>
                  <span>{two(byId.get(id)!.no)}</span>
                  {byId.get(id)!.d.name}
                </button>
              ))}
            </section>
          ))}
        </div>
        <button type="button" className={k.ledgerClose} onClick={onClose}>
          Положить на место ✕
        </button>
      </div>
    </div>
  );
}
