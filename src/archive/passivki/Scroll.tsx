"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { Dossier } from "@/data/passivki/types";
import { Portrait } from "./parts";
import s from "./scroll.module.css";

/**
 * Досье — свиток, развёрнутый на столе летописца: слева портрет и имя, дальше записи в три колонки.
 * Если записи не помещаются, свиток читается страницами: нажали на правый валик — свиток сворачивается
 * и разворачивается на продолжении; левый валик возвращает назад.
 */
export function Scroll({
  d,
  byId,
  has,
  from,
  onClose,
  onGo,
  onEnd,
}: {
  d: Dossier;
  byId: Map<string, Dossier>;
  has: Set<string>;
  from: DOMRect | null;
  onClose: () => void;
  onGo: (id: string) => void;
  /** свиток дочитан до последней страницы */
  onEnd?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pagesBox = useRef<HTMLDivElement>(null);
  const flow = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const busy = useRef(false);
  const closing = useRef(false);
  const shownId = useRef(d.id);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // раскладка: сколько колонок помещается на развороте и сколько разворотов нужно тексту
  useLayoutEffect(() => {
    const box = pagesBox.current;
    const f = flow.current;
    if (!box || !f) return;
    const fit = () => {
      // точная ширина, а не округлённая clientWidth: иначе на долю пикселя колонки не помещаются и остаётся одна
      const w = box.getBoundingClientRect().width;
      if (getComputedStyle(f).columnCount === "1" || w < 10) {
        // узкий экран: одна колонка, листается вниз, страниц нет
        box.style.removeProperty("--colw");
        setPages(1);
        return;
      }
      const gap = parseFloat(getComputedStyle(f).columnGap) || 0;
      const n = w >= 900 ? 3 : w >= 560 ? 2 : 1;
      const colw = Math.floor(((w - gap * (n - 1)) / n) * 10) / 10 - 0.5;
      box.style.setProperty("--colw", `${colw}px`);
      const cols = Math.max(1, Math.round((f.scrollWidth + gap) / (colw + gap)));
      setPages(Math.max(1, Math.ceil(cols / n)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [d.id]);
  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);
  useEffect(() => {
    if (pages > 1 && page === pages - 1) onEnd?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pages]);

  // разворачивание: один раз, когда свиток появляется на столе
  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const sheet = q("[data-sheet]")[0] as HTMLElement;
      const right = q("[data-roll=right]")[0] as HTMLElement;
      const w = sheet.getBoundingClientRect().width;
      const t = gsap.timeline({ defaults: { ease: "power3.inOut" } });
      tl.current = t;
      if (calm()) {
        t.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        return;
      }
      t.fromTo(q("[data-scene]"), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out" }, 0);
      t.fromTo(q("[data-frame]"), { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 0.15);
      // бумага выходит из-под правого валика
      t.fromTo(sheet, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.1 }, 0.4);
      t.fromTo(right, { x: -w }, { x: 0, duration: 1.1 }, 0.4);
      t.fromTo(q("[data-ink]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "power2.out" }, 0.85);
      t.fromTo(q("[data-ui]"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.3);
    }, el);
    return () => {
      tl.current = null;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // переход от досье к досье по медальону: бумага та же, записи сменяются
  useLayoutEffect(() => {
    if (shownId.current === d.id) return;
    shownId.current = d.id;
    setPage(0);
    if (calm()) return;
    const q = gsap.utils.selector(root.current!);
    const tw = gsap.fromTo(q("[data-ink]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.025, ease: "power2.out" });
    return () => {
      tw.kill();
    };
  }, [d.id]);

  const shut = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const t = tl.current;
    if (!t || t.duration() < 0.3) return onClose();
    t.timeScale(1.6).eventCallback("onReverseComplete", onClose).reverse();
  }, [onClose]);

  // страница: свиток сворачивается к левому валику и разворачивается уже на другом месте текста
  const turn = useCallback(
    (to: number) => {
      if (busy.current || to < 0 || to >= pages || to === page) return;
      const el = root.current!;
      const q = gsap.utils.selector(el);
      if (calm()) return setPage(to);
      const sheet = q("[data-sheet]")[0] as HTMLElement;
      const right = q("[data-roll=right]")[0] as HTMLElement;
      const w = sheet.getBoundingClientRect().width;
      busy.current = true;
      gsap
        .timeline({ defaults: { ease: "power3.inOut" }, onComplete: () => (busy.current = false) })
        .to(sheet, { clipPath: "inset(0 100% 0 0)", duration: 0.55 }, 0)
        .to(right, { x: -w, duration: 0.55 }, 0)
        .add(() => setPage(to))
        .to(sheet, { clipPath: "inset(0 0% 0 0)", duration: 0.8 }, ">0.08")
        .to(right, { x: 0, duration: 0.8 }, "<");
    },
    [page, pages],
  );

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") shut();
      if (e.key === "ArrowRight" || e.key === "PageDown") turn(page + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") turn(page - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [page, shut, turn]);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    root.current?.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true });
    return () => prev?.focus?.({ preventScroll: true });
  }, []);

  return (
    <div className={s.root} ref={root} role="dialog" aria-modal="true" aria-label={`Досье: ${d.name}`}>
      <img className={s.scene} data-scene src="/art/passivki/dossier-bg.webp" alt="" />
      <div className={s.frame} data-frame>
        <img className={s.rollL} data-roll="left" src="/art/passivki/scroll2-l.webp" alt="" />
        <div className={s.sheet} data-sheet>
          <div className={s.paper}>
            <aside className={s.face}>
              <Portrait d={d} has={has.has(d.id)} className={s.portrait} />
              <h2 data-ink>{d.name}</h2>
              <p className={s.aff} data-ink>
                {d.affiliation}
              </p>
            </aside>
            <div className={s.pages} ref={pagesBox}>
              <div className={s.flow} ref={flow} key={d.id} style={{ ["--page" as string]: page }}>
                <Sec title={d.whoTitle} ps={d.who} />
                <Sec title="Уровень и сила" ps={d.power}>
                  {d.skills && (
                    <ul className={s.skills} data-ink>
                      {d.skills.map((k) => (
                        <li key={k.name}>
                          <b>{k.name}</b>
                          <span>{k.level}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Sec>
                <Sec title="Характер" ps={d.character} />
                <section className={s.sec}>
                  <h3 data-ink>Связи</h3>
                  {d.links.map((l) => {
                    const to = l.id ? byId.get(l.id) : undefined;
                    return (
                      <div className={s.link} key={l.name} data-ink>
                        {to ? (
                          <button type="button" className={s.medal} onClick={() => onGo(to.id)} aria-label={`Открыть досье: ${to.name}`}>
                            <Portrait d={to} has={has.has(to.id)} />
                          </button>
                        ) : (
                          <span className={s.medal} data-none="">
                            <i aria-hidden="true">{l.name[0]}</i>
                          </span>
                        )}
                        <p>
                          <b>{l.name}.</b> {l.text}
                        </p>
                      </div>
                    );
                  })}
                </section>
                <Sec title="Природа" ps={d.nature} />
                <Sec title="Цель" ps={d.goal} />
                <Sec title="Репутация" ps={d.reputation} />
                <section className={s.sec}>
                  <h3 data-ink>Достижения в томе</h3>
                  {d.feats.length ? (
                    <ul className={s.feats}>
                      {d.feats.map((f) => (
                        <li key={f} data-ink>
                          {f}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p data-ink>Подвигов за эти месяцы летопись не числит.</p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
        <img className={s.rollR} data-roll="right" src="/art/passivki/scroll2-r.webp" alt="" />

        {pages > 1 && (
          <>
            <button type="button" className={s.prev} data-ui disabled={page === 0} onClick={() => turn(page - 1)} aria-label="Предыдущая страница свитка" />
            <button type="button" className={s.next} data-ui disabled={page >= pages - 1} onClick={() => turn(page + 1)} aria-label="Следующая страница свитка" />
          </>
        )}
        <button type="button" className={s.close} data-close data-ui onClick={shut}>
          Свернуть свиток
        </button>
      </div>
    </div>
  );
}

function Sec({ title, ps, children }: { title: string; ps: string[]; children?: React.ReactNode }) {
  return (
    <section className={s.sec}>
      <h3 data-ink>{title}</h3>
      {ps.map((p, i) => (
        <p key={i} data-ink>
          {p}
        </p>
      ))}
      {children}
    </section>
  );
}
