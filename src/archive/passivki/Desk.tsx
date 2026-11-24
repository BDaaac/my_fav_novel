"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import type { Dossier } from "@/data/passivki/types";
import { Start } from "./Start";
import { LongDesk } from "./LongDesk";
import { Scroll } from "./Scroll";
import { Slips, tell } from "./Slips";
import s from "./desk.module.css";

/**
 * «Пассивки». Три состояния одной страницы:
 *  — комната летописца: диск выбирает том, на рейке качаются брелки героев;
 *  — стол сверху: поясные таблички всех героев тома, по три в ряд;
 *  — свиток-досье, развёрнутый на столе.
 * Адрес: без хэша — комната, #tom-1 — стол, #<герой> — досье поверх стола.
 */
const VOLUME = "tom-1";
type View = "start" | "desk";

export function Desk({ dossiers, portraits = [] }: { dossiers: Dossier[]; portraits?: string[] }) {
  const [view, setView] = useState<View>("start");
  const [open, setOpen] = useState<{ id: string; from: DOMRect | null } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const shown = useRef<View>("start");
  // для ярлыков системы: сколько раз открывали досье героя и дочитан ли текущий свиток
  const visits = useRef(new Map<string, number>());
  const readEnd = useRef(false);
  const byId = useMemo(() => new Map(dossiers.map((d) => [d.id, d])), [dossiers]);
  const has = useMemo(() => new Set(portraits), [portraits]);

  // адрес → состояние
  useEffect(() => {
    const sync = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (byId.has(h)) {
        setView("desk");
        setOpen((o) => (o?.id === h ? o : { id: h, from: null }));
      } else {
        setView(h === VOLUME ? "desk" : "start");
        setOpen(null);
      }
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [byId]);

  const go = useCallback((hash: string) => history.pushState(null, "", hash ? `#${hash}` : location.pathname + location.search), []);
  const enter = useCallback(() => {
    go(VOLUME);
    setView("desk");
  }, [go]);
  const leave = useCallback(() => {
    go("");
    setOpen(null);
    setView("start");
  }, [go]);
  const show = useCallback(
    (id: string, from: DOMRect | null) => {
      if (!byId.has(id)) return;
      go(id);
      setView("desk");
      setOpen({ id, from });
      visits.current.set(id, (visits.current.get(id) ?? 0) + 1);
      readEnd.current = false;
    },
    [byId, go],
  );
  const close = useCallback(() => {
    go(VOLUME);
    setOpen((o) => {
      const d = o ? byId.get(o.id) : undefined;
      if (d) tell({ type: "closed", id: d.id, dead: d.fate === "dead", times: visits.current.get(d.id) ?? 1, end: readEnd.current });
      return null;
    });
  }, [go, byId]);

  // переход комната ⇄ стол: взгляд наклоняется к столешнице, комната уходит вверх и расплывается,
  // стол подступает снизу; обратно — тем же путём
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || shown.current === view) return;
    const to = view;
    shown.current = view;
    const room = el.querySelector<HTMLElement>("[data-room]");
    const desk = el.querySelector<HTMLElement>("[data-desk]");
    if (!room || !desk) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      if (to === "desk") {
        t.fromTo(room, { autoAlpha: 1, scale: 1, yPercent: 0, rotateX: 0, filter: "blur(0px)" }, { autoAlpha: 0, scale: 1.9, yPercent: -34, rotateX: 26, filter: "blur(10px)", duration: 1.15 }, 0);
        t.fromTo(desk, { autoAlpha: 0, scale: 0.86, yPercent: 16 }, { autoAlpha: 1, scale: 1, yPercent: 0, duration: 1.05, ease: "power3.out", clearProps: "transform" }, 0.3);
        t.fromTo("[data-card]", { autoAlpha: 0, y: -46, rotate: () => gsap.utils.random(-7, 7) }, { autoAlpha: 1, y: 0, rotate: 0, duration: 0.7, stagger: 0.035, ease: "back.out(1.6)", clearProps: "transform,opacity,visibility" }, 0.55);
      } else {
        t.fromTo(desk, { autoAlpha: 1, scale: 1, yPercent: 0 }, { autoAlpha: 0, scale: 0.86, yPercent: 16, duration: 0.7 }, 0);
        t.fromTo(room, { autoAlpha: 0, scale: 1.9, yPercent: -34, rotateX: 26, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, yPercent: 0, rotateX: 0, filter: "blur(0px)", duration: 1.05, ease: "power3.out", clearProps: "transform,filter" }, 0.15);
      }
    }, el);
    return () => ctx.revert();
  }, [view]);

  return (
    <div className={s.root} ref={root} data-view={view}>
      <div className={s.room} data-room aria-hidden={view !== "start"} inert={view !== "start"}>
        <Start heroes={dossiers} has={has} onEnter={enter} onOpen={show} />
      </div>
      <div className={s.desk} data-desk aria-hidden={view !== "desk"} inert={view !== "desk" || !!open}>
        <LongDesk heroes={dossiers} has={has} onOpen={show} onBack={leave} />
      </div>
      {open && byId.has(open.id) && (
        <Scroll d={byId.get(open.id)!} byId={byId} has={has} from={open.from} onClose={close} onGo={(id) => show(id, null)} onEnd={() => (readEnd.current = true)} />
      )}
      <Slips quiet={!!open} />
    </div>
  );
}
