"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Dossier } from "@/data/passivki/types";
import { Tablet } from "./parts";
import { tell } from "./Slips";
import s from "./start.module.css";

/** Комната летописца. Диск выбирает том; на рейке висят брелки нескольких героев и качаются от движения курсора. */

const ON_RACK = 9;

export function Start({
  heroes,
  has,
  onEnter,
  onOpen,
}: {
  heroes: Dossier[];
  has: Set<string>;
  onEnter: () => void;
  onOpen: (id: string, from: DOMRect | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const rack = useRef<HTMLUListElement>(null);
  const dwell = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shown = heroes.slice(0, ON_RACK);

  // сцена 1920×1080 вписывается в окно целиком
  useEffect(() => {
    const fit = () => wrap.current?.style.setProperty("--k", String(Math.min(window.innerWidth / 1920, window.innerHeight / 1080)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Брелки — маятники на шнурах. Курсор, проходя рядом, отталкивает брелок и закручивает его на шнуре;
  // качание передаётся соседям по рейке волной и затихает само. Щелчок по брелку подбрасывает его.
  useEffect(() => {
    const ul = rack.current;
    if (!ul) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(ul.children) as HTMLElement[];
    const st = items.map((_, i) => ({ a: 0, v: 0, tw: 0, tv: 0, phase: i * 1.7, len: 1 + (i % 3) * 0.14 }));
    let px = -9999;
    let py = -9999;
    let vx = 0;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    let prev = performance.now();
    const move = (e: PointerEvent) => {
      const now = performance.now();
      if (lastT) vx = 0.55 * vx + 0.45 * ((e.clientX - lastX) / Math.max(1, (now - lastT) / 16));
      lastX = e.clientX;
      lastT = now;
      px = e.clientX;
      py = e.clientY;
    };
    const out = () => {
      px = py = -9999;
    };
    const flick = (e: PointerEvent) => {
      const i = items.findIndex((el) => el.contains(e.target as Node));
      if (i >= 0) {
        st[i].v += (Math.random() < 0.5 ? -1 : 1) * 130;
        st[i].tv += 260;
      }
    };
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      const box = ul.getBoundingClientRect();
      const near = py > box.top - 50 && py < box.bottom + 70;
      const angles = st.map((p) => p.a);
      items.forEach((el, i) => {
        const p = st[i];
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const reach = r.width * 1.7;
        const d = px - cx;
        let push = 0;
        let spin = 0;
        if (near && Math.abs(d) < reach) {
          const w = 1 - Math.abs(d) / reach;
          // брелок уходит от курсора, подхватывает его движение и закручивается на шнуре
          push = -Math.sign(d || 1) * w * 15 + vx * w * 2.4;
          spin = vx * w * 30;
        }
        // соседи тянут друг друга через рейку — качание расходится волной
        const pull = ((angles[i - 1] ?? p.a) + (angles[i + 1] ?? p.a) - 2 * p.a) * 5;
        const breeze = calm ? 0 : Math.sin(now / 1900 + p.phase) * 0.4;
        p.v += (-30 * p.len * p.a - 1.15 * p.v + push * 30 + pull + breeze) * dt;
        p.a = Math.max(-34, Math.min(34, p.a + p.v * dt));
        p.tv += (-24 * p.tw - 1.5 * p.tv + spin) * dt;
        p.tw = Math.max(-62, Math.min(62, p.tw + p.tv * dt));
        el.style.transform = `perspective(700px) rotate(${p.a.toFixed(2)}deg) rotateY(${p.tw.toFixed(2)}deg)`;
      });
      vx *= 0.88;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", out);
    ul.addEventListener("pointerdown", flick);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", out);
      ul.removeEventListener("pointerdown", flick);
    };
  }, []);

  return (
    <div className={s.wrap} ref={wrap}>
      <div className={s.stage}>
        <img className={s.bg} src="/art/passivki/start-bg.webp" alt="" />

        {/* выход в главное меню: красный ярлык у окна */}
        <Link href="/" className={s.menu} aria-label="В главное меню">
          <img src="/art/passivki/slip.webp" alt="" />
          <span>Главное меню</span>
        </Link>

        <header className={s.title}>
          <h1>Пассивки</h1>
          <p>Летопись Духовного Дворца Тяньсан</p>
        </header>

        {/* диск целиком — кнопка тома; пока том один */}
        <button type="button" className={s.disk} onClick={onEnter} aria-label="Том первый, главы 1–248. Открыть стол с табличками героев" />
        <button type="button" className={s.tag} onClick={onEnter} tabIndex={-1} aria-hidden="true">
          <img src="/art/passivki/slip.webp" alt="" />
          <span>
            <b>Том первый</b>
            <i>главы 1–248</i>
          </span>
        </button>

        <ul className={s.rack} ref={rack} aria-label="Герои первого тома">
          {shown.map((d, i) => (
            <li key={d.id} style={{ ["--i" as string]: i }}>
              <button
                type="button"
                className={s.charm}
                onPointerEnter={() => {
                  clearTimeout(dwell.current);
                  dwell.current = setTimeout(() => tell({ type: "hero", id: d.id }), 650);
                }}
                onPointerLeave={() => clearTimeout(dwell.current)}
                onClick={(e) => onOpen(d.id, e.currentTarget.getBoundingClientRect())} aria-label={`${d.name}, ${d.affiliation}. Открыть досье`}>
                <Tablet d={d} has={has.has(d.id)} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
