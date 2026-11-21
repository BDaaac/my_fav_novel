"use client";
import { useLayoutEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Marck_Script } from "next/font/google";
import { ARROWS, NARROW_SLOTS, NARROW_VIEW, SCENE } from "@/data/horror/board/geometry";
import { AtmosphereEffects } from "./AtmosphereEffects";
import { BoardNavigation } from "./BoardNavigation";
import { CharacterBoard } from "./CharacterBoard";
import { DeskForeground } from "./DeskForeground";
import { HouseSelector } from "./HouseSelector";
import { TitleBanner } from "./TitleBanner";
import type { House } from "./types";
import "./scene.css";

const hand = Marck_Script({ subsets: ["latin", "cyrillic"], weight: "400", variable: "--hs-hand" });

const NARROW = 760;
/** сколько кадра можно срезать, не задев таблички, стрелки и заголовок */
const SAFE_CROP_X = 150;
const SAFE_CROP_Y = 60;

export function HorrorScene({ houses }: { houses: House[] }) {
  const [vp, setVp] = useState({ w: 1536, h: 1024 });
  const [house, setHouse] = useState(0);
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  // до замера окна сцена скрыта: иначе она сначала рисуется под 1536×1024 и потом «наезжает»
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const set = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    set();
    setReady(true);
    // ссылка вида ?p=2 открывает нужный разворот доски
    const q = Number(new URLSearchParams(window.location.search).get("p"));
    if (q > 1) setPage(q - 1);
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);

  const narrow = vp.w < NARROW;
  const perPage = narrow ? 4 : 8;
  const slots = narrow ? NARROW_SLOTS : [0, 1, 2, 3, 4, 5, 6, 7];
  const list = useMemo(() => houses[house]?.characters ?? [], [houses, house]);
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const p = Math.min(page, pages - 1);
  const items = useMemo(() => list.slice(p * perPage, p * perPage + perPage), [list, p, perPage]);

  // один масштаб на всю сцену; на узком экране кадр обрезается по верхнему ряду доски
  // на десктопе кадр заполняет окно целиком; лишнее срезается справа (бумаги на стене), таблички слева всегда видны
  const cover = Math.max(vp.w / SCENE.w, vp.h / SCENE.h);
  const fits = SCENE.w * cover - vp.w <= SAFE_CROP_X * cover && SCENE.h * cover - vp.h <= SAFE_CROP_Y * cover;
  const s = narrow ? vp.w / NARROW_VIEW.w : fits ? cover : Math.min(vp.w / SCENE.w, vp.h / SCENE.h);
  const view = narrow
    ? NARROW_VIEW
    : fits
      ? { x: Math.min(10, Math.max(0, SCENE.w - vp.w / s)), y: Math.max(0, (SCENE.h - vp.h / s) / 2), w: vp.w / s, h: vp.h / s }
      : { x: 0, y: 0, w: SCENE.w, h: SCENE.h };

  const go = (d: number) => {
    setDir(d);
    setPage(Math.min(pages - 1, Math.max(0, p + d)));
  };
  const pick = (i: number) => {
    setDir(i > house ? 1 : -1);
    setHouse(i);
    setPage(0);
  };

  return (
    <main className={`hs ${hand.variable}${narrow ? " narrow" : ""}${ready ? " ready" : ""}`}>
      <div className="hs-fill" aria-hidden />
      <Link href="/" className="hs-home">
        ← К полке
      </Link>
      <div className="hs-view" style={{ width: view.w * s, height: view.h * s }}>
        <div className="hs-stage" style={{ width: SCENE.w, height: SCENE.h, transform: `scale(${s}) translate(${-view.x}px, ${-view.y}px)` }}>
          <AtmosphereEffects />
          <TitleBanner />
          {!narrow && <HouseSelector houses={houses} active={house} onPick={pick} />}
          <CharacterBoard items={items} slots={slots} dir={dir} pageKey={`${house}-${p}-${perPage}`} />
          <BoardNavigation prev={ARROWS.prev} next={ARROWS.next} canPrev={p > 0} canNext={p < pages - 1} onPrev={() => go(-1)} onNext={() => go(1)} />
          <DeskForeground />
        </div>
      </div>
      {narrow && (
        <div className="hs-under">
          <BoardNavigation inline prev={ARROWS.prev} next={ARROWS.next} canPrev={p > 0} canNext={p < pages - 1} onPrev={() => go(-1)} onNext={() => go(1)} />
          <HouseSelector houses={houses} active={house} onPick={pick} inline />
        </div>
      )}
      {list.length === 0 && <p className="hs-empty">В этом доме пока никто не записан.</p>}
    </main>
  );
}
