"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CaseDossier } from "@/data/baccano/types";
import { NavButton } from "./NavLink";
import { Rich } from "./rich";
import s from "./dossier.module.css";
import desk from "../../../public/art/baccano/desk.webp";
import stack from "../../../public/art/baccano/dossier/stack.webp";
import sheet from "../../../public/art/baccano/dossier/sheet.webp";
import card from "../../../public/art/baccano/dossier/card.webp";
import strip from "../../../public/art/baccano/dossier/strip.webp";
import tab1 from "../../../public/art/baccano/dossier/tab-1.webp";
import tab2 from "../../../public/art/baccano/dossier/tab-2.webp";
import slip from "../../../public/art/baccano/dossier/slip.webp";
import clip from "../../../public/art/baccano/dossier/clip.webp";
import fold from "../../../public/art/baccano/dossier/schema.webp";
import ring from "../../../public/art/baccano/dossier/ring.webp";
import tide from "../../../public/art/baccano/dossier/tide.webp";
import smudge from "../../../public/art/baccano/dossier/smudge.webp";

/**
 * Досье — дело на столе под лампой (утверждено). Справка лежит на архивной стопке,
 * учётная карточка прихвачена к её углу, материалы торчат язычками из-под правого края
 * и вынимаются по одному; схема связей — отдельный лист, сложенный вчетверо.
 * Все предметы — графические слои, весь текст — живой.
 */

export type Person = { name: string; drawerLabel: string };

/* Всё, из чего собрана сцена, должно быть в памяти до раскрытия: иначе первым кадром виден
   текст запасным шрифтом на голом столе, а бумага и гарнитуры приходят следом.
   Состояния: idle → loading → ready | error. Досье показывается только в ready;
   при error неполная сцена не открывается — шкаф предлагает повторить загрузку. */
export type AssetState = "idle" | "loading" | "ready" | "error";
const CRITICAL = [desk, stack, sheet, card, strip, tab1, tab2, slip, clip, fold, ring, tide, smudge];
const FACES: [string, string][] = [["--bc-title", "400"], ["--bc-typed", "400"], ["--bc-hand", "italic 500"]];
const held: HTMLImageElement[] = []; // держим ссылки, чтобы декодированные картинки не выгружались
// картинки лежат в памяти страницы (blob:), поэтому сцена не зависит от кэша и повторных запросов
const local = new Map<string, string>();
const srcOf = (x: { src: string }) => local.get(x.src) ?? x.src;
let assets: AssetState = "idle";
const watchers = new Set<() => void>();
const setAssets = (v: AssetState) => {
  assets = v;
  watchers.forEach((f) => f());
};
export const dossierAssets = () => assets;
export const watchDossierAssets = (f: () => void) => {
  watchers.add(f);
  return () => void watchers.delete(f);
};
/** Загрузка (и повтор после ошибки: уже полученное не запрашивается заново).
 *  scope — любой элемент внутри раздела «Шумихи»: с него читаются гарнитуры досье. */
export function loadDossierAssets(scope: HTMLElement) {
  if (assets === "loading" || assets === "ready") return;
  setAssets("loading");
  const images = CRITICAL.filter((x) => !local.has(x.src)).map((x) =>
    fetch(x.src)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        const im = new Image();
        im.src = u;
        return im.decode().then(() => {
          held.push(im);
          local.set(x.src, u);
          return true;
        });
      })
      .catch(() => false),
  );
  const cs = getComputedStyle(scope);
  const fonts = FACES.map(([v, spec]) =>
    document.fonts.load(`${spec} 16px ${cs.getPropertyValue(v)}`, "Справка Aa № 1").then((got) => got.length > 0, () => false),
  );
  Promise.all([...images, ...fonts]).then((ok) => setAssets(ok.every(Boolean) ? "ready" : "error"));
}

type Doc = "skills" | "said" | "chron";

const url = (x: { src: string }) => `url("${srcOf(x)}")`;
const cap = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t);
const plural = (n: number, a: string, b: string, c: string) => {
  const m = n % 10, h = n % 100;
  return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c;
};
const sentences = (t: string) => t.split(/(?<=[.!?…])\s+(?=[А-ЯЁA-Z«])/).filter(Boolean);
const OUT = "Вне картотеки";

// у каждого язычка свой лист: ширина, вылет, наклон, зазор, износ
const TABS = [
  { img: tab1, w: 318, h: 86, x: 14, pl: 84, mt: 0, r: "-2.1deg", flip: "none", wear: "brightness(1.02)" },
  { img: tab2, w: 352, h: 94, x: -4, pl: 106, mt: 8, r: "1.5deg", flip: "scaleY(-1)", wear: "brightness(.95) sepia(.12)" },
  { img: tab2, w: 330, h: 90, x: 22, pl: 84, mt: 2, r: "-.5deg", flip: "none", wear: "brightness(1.04) saturate(.85)" },
  { img: tab1, w: 344, h: 96, x: 4, pl: 104, mt: 14, r: "2.6deg", flip: "scaleY(-1)", wear: "brightness(.92) sepia(.18)" },
];

// карандашная обводка имени: один проход с перехлёстом, наклон зависит от позиции
function Ring({ k }: { k: number }) {
  const d = (((k * 37) % 7) - 3) * 0.01;
  return (
    <svg className={s.ring} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
      <path d={`M12,${40 * (0.62 + d)} C4,4.8 90,${40 * (-0.04 + d)} 97,16.8 C102,36.8 16,41.6 5,24 C1,13.6 22,4 40,${40 * (0.06 - d)}`} />
    </svg>
  );
}

export function DossierSheet({
  d,
  caseNo,
  group,
  drawerNo,
  cardNo,
  people,
  onClose,
  onOpen,
  back,
  anchor,
  enter = "drawer",
}: {
  d: CaseDossier;
  caseNo: string;
  /** группа = подпись ящика */
  group: string;
  drawerNo: number;
  cardNo: number;
  /** все лица дела: для схемы связей и переходов к их досье */
  people: Map<string, Person>;
  onClose: () => void;
  /** открыть досье связанного лица */
  onOpen: (id: string) => void;
  /** вернуться к досье, с которого перешли */
  back?: { name: string; go: () => void };
  /** карточка в ящике, из которой досье раскрывается и в которую сворачивается обратно */
  anchor?: () => HTMLElement | null;
  /** drawer — карточка прилетает из ящика; swap — на том же столе меняются бумаги (переход по связи) */
  enter?: "drawer" | "swap";
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLElement>(null);
  const closing = useRef(false);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [schema, setSchema] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState({ w: 1440, h: 900, wide: true });

  /* ---------- данные справки ---------- */
  const idOf = useMemo(() => {
    const ix = new Map<string, string>();
    people.forEach((p, id) => ix.set(p.name, id));
    people.forEach((p, id) => {
      const first = p.name.split(" ")[0];
      if (!ix.has(first)) ix.set(first, id);
    });
    return (n: string) => ix.get(n) ?? ix.get(n.split(" ")[0]);
  }, [people]);

  const said = useMemo(
    () =>
      d.said.map((x) => {
        const m = x.match(/^\*\*(.+?)\*\*\s*(.*)$/);
        if (!m) return { who: "", text: x };
        // «**Эдвард Ной**, давний недруг…» — имя входит в фразу, её не режем
        return { who: m[1], text: /^[,(]/.test(m[2]) ? x : cap(m[2]) };
      }),
    [d.said],
  );
  // показания по листам: не больше ~640 знаков на лист, кегль не уменьшаем
  const pages = useMemo(() => {
    const out: { who: string; text: string }[][] = [[]];
    let n = 0;
    for (const x of said) {
      const L = x.text.length + 60;
      if (n + L > 640 && out[out.length - 1].length) {
        out.push([]);
        n = 0;
      }
      out[out.length - 1].push(x);
      n += L;
    }
    return out;
  }, [said]);
  const nodes = useMemo(
    () =>
      d.links.flatMap((l) => {
        const m = l.match(/^\*\*(.+?)\*\*\s*—?\s*(.*)$/);
        const names = m ? m[1].split(/,\s*/) : [];
        const rel = m ? m[2] : l;
        return names.map((n) => {
          const id = idOf(n);
          const p = id && id !== d.id ? people.get(id) : undefined;
          return { n, id: p ? id! : null, g: p ? p.drawerLabel : OUT, rel };
        });
      }),
    [d.links, d.id, idOf, people],
  );
  const groups = new Set(nodes.map((x) => x.g)).size;
  const last = d.branches[d.branches.length - 1];
  const steps = d.branches.reduce((a, b) => a + sentences(b.text).length, 0);
  const neg = d.abilities.match(/[^.]*не установлен[^.]*\./);
  const skills = (neg ? d.abilities.replace(neg[0], "") : d.abilities).trim();

  const tabs: { k: Doc | "schema"; t: string; c: string }[] = [];
  if (skills) tabs.push({ k: "skills", t: "Приёмы", c: "отмечено по тексту" });
  if (said.length) tabs.push({ k: "said", t: "Показания", c: `${said.length} ${plural(said.length, "показание", "показания", "показаний")}` });
  if (steps) tabs.push({ k: "chron", t: "Ход дела", c: `${steps} ${plural(steps, "запись", "записи", "записей")}${last?.end ? " · итог" : ""}` });
  if (nodes.length)
    tabs.push({
      k: "schema",
      t: "Схема связей",
      c: `${nodes.length} ${plural(nodes.length, "лицо", "лица", "лиц")} · ${groups} ${plural(groups, "группа", "группы", "групп")}`,
    });

  /* ---------- из ящика и обратно ---------- */
  const source = useCallback(() => {
    const a = anchor?.();
    if (!a || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    const r = a.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight ? r : null;
  }, [anchor]);
  const toward = (el: HTMLElement, r: DOMRect) => {
    const to = el.getBoundingClientRect();
    return `translate(${r.left - to.left}px, ${r.top - to.top}px) scale(${r.width / to.width}, ${r.height / to.height})`;
  };

  // карточка вылетает из ящика и ложится на угол справки
  useLayoutEffect(() => {
    const measure = () => setSize({ w: window.innerWidth, h: window.innerHeight, wide: window.innerWidth >= 1200 });
    measure();
    const el = cardRef.current, r = enter === "swap" ? null : source();
    const from = anchor?.() ?? null;
    // карточка одна: пока она лежит на справке, в ящике её нет
    if (from) from.style.visibility = "hidden";
    if (el && r) {
      el.style.transformOrigin = "0 0";
      el.style.transform = toward(el, r);
      el.getBoundingClientRect();
      el.style.transition = "transform 460ms cubic-bezier(0.25, 0.8, 0.3, 1)";
      el.style.transform = "";
    }
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (from) from.style.visibility = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setDoc(null);
    setSchema(false);
    const el = cardRef.current, r = source();
    layerRef.current?.classList.add(s.leaving);
    if (!el || !r) return void setTimeout(onClose, 260);
    el.style.transition = "transform 420ms cubic-bezier(0.25, 0.8, 0.3, 1)";
    el.style.transform = toward(el, r);
    setTimeout(onClose, 420);
  }, [onClose, source]);

  /* ---------- вынуть и вложить обратно ---------- */
  const lastTab = useRef<HTMLElement | null>(null);
  const take = (k: Doc | "schema", from: HTMLElement) => {
    lastTab.current = from;
    if (k === "schema") {
      setDoc(null);
      setSchema(true);
      return;
    }
    setPage(0);
    setDoc((cur) => (cur === k ? null : k));
  };
  const putBack = useCallback(() => {
    setDoc(null);
    setSchema(false);
    lastTab.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (doc) docRef.current?.querySelector<HTMLElement>("[data-put]")?.focus({ preventScroll: true });
  }, [doc, schema]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    layerRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (doc === "said" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        setPage((p) => Math.max(0, Math.min(pages.length - 1, p + (e.key === "ArrowRight" ? 1 : -1))));
        return;
      }
      if (e.key !== "Escape") return;
      if (schema || doc) putBack();
      else if (back) back.go();
      else requestClose();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [doc, schema, back, pages.length, putBack, requestClose]);

  const assets = {
    "--desk": url(desk), "--stack": url(stack), "--sheet": url(sheet), "--card": url(card), "--strip": url(strip),
    "--slip": url(slip), "--fold": url(fold), "--ring": url(ring), "--tide": url(tide), "--smudge": url(smudge),
  } as CSSProperties;
  const tag = s.tag;
  const kick = (
    <span className={s.lbl}>
      {caseNo} · {d.name}
    </span>
  );
  const put = (
    <button type="button" className={s.put} data-put onClick={putBack}>
      Вложить обратно ✕
    </button>
  );
  const who = (n: string) => {
    const id = idOf(n);
    return id && id !== d.id && people.has(id) ? (
      <button type="button" className={s.goto} onClick={() => onOpen(id)}>
        {n}
      </button>
    ) : (
      n
    );
  };

  /* ---------- схема: имена по эллипсу вокруг карточки (широкий экран) или ветвью (узкий) ---------- */
  const W = size.w - 80, H = size.h - 58, cx = W / 2, cy = H / 2 + 30;
  const placed = nodes.map((o, i) => {
    const a = ((-90 + (360 * i) / nodes.length + 14) * Math.PI) / 180;
    const x = cx + W * 0.35 * Math.cos(a), y = cy + H * 0.31 * Math.sin(a);
    return { ...o, x, y, line: `M${cx + (x - cx) * 0.26},${cy + (y - cy) * 0.26} L${cx + (x - cx) * 0.8},${cy + (y - cy) * 0.8}` };
  });

  return (
    <div
      ref={layerRef}
      className={`${s.layer} ${enter === "swap" ? s.swap : ""}`}
      style={assets}
      role="dialog"
      aria-modal="true"
      aria-label={`Досье: ${d.name}`}
      tabIndex={-1}
    >
      <div className={s.desk} aria-hidden />

      {/* 1200–1380 px: вся сцена чуть уменьшается целиком, чтобы язычки не уходили за край */}
      <div className={s.scene} style={size.wide && size.w < 1380 ? { zoom: size.w / 1380 } : undefined}>
        <div className={s.case}>
          <div className={s.stack} aria-hidden />

          <div className={s.tabs} role="group" aria-label="Материалы дела">
            {tabs.map((t, i) => {
              const v = TABS[i % TABS.length];
              return (
                <button
                  key={t.k}
                  type="button"
                  className={`${s.tab} ${doc === t.k || (schema && t.k === "schema") ? s.out : ""}`}
                  aria-expanded={doc === t.k || (schema && t.k === "schema")}
                  onClick={(e) => take(t.k, e.currentTarget)}
                  style={
                    {
                      "--img": url(v.img), "--w": `${v.w}px`, "--h": `${v.h}px`, "--x": `${v.x}px`, "--pl": `${v.pl}px`,
                      "--mt": `${v.mt}px`, "--r": v.r, "--flip": v.flip, "--wear": v.wear,
                    } as CSSProperties
                  }
                >
                  <span className={s.pp} aria-hidden />
                  <b>{t.t}</b>
                  <i>{t.c}</i>
                </button>
              );
            })}
          </div>

          <article className={s.sheet}>
            <span className={s.stain} style={{ backgroundImage: url(ring), width: 200, height: 200, right: -14, bottom: 120, opacity: 0.55, rotate: "24deg" }} aria-hidden />
            <span className={s.stain} style={{ backgroundImage: url(smudge), width: 70, height: 70, left: 10, bottom: 6, opacity: 0.45, rotate: "-30deg" }} aria-hidden />
            <span className={s.stain} style={{ backgroundImage: url(tide), width: 230, height: 150, right: 6, top: -30, opacity: 0.45, rotate: "172deg" }} aria-hidden />
            <div className={s.in}>
              <div className={s.head}>
                <div className={s.cardSpace} />
                <div className={s.title}>
                  <span className={s.lbl}>{caseNo} · материалы на лицо</span>
                  <h2>Справка</h2>
                  {last && <p className={s.src}>Составлена по тексту: {last.title}</p>}
                </div>
              </div>
              {last?.end && (
                <div className={s.paste}>
                  <span className={s.lbl}>Итог на конец тома</span>
                  <p className={s.typed}>
                    <Rich text={cap(last.end)} tagClass={tag} />
                  </p>
                </div>
              )}
              <div className={`${s.body} ${d.notes.length ? "" : s.noMarg}`}>
                <span className={s.lbl}>Личность</span>
                <p className={s.typed}>
                  <Rich text={d.who} tagClass={tag} />
                </p>
                <span className={s.lbl}>Повадки</span>
                <p className={s.typed}>
                  <Rich text={d.manner} tagClass={tag} />
                </p>
                {d.notes.length > 0 && (
                  <div className={s.marg}>
                    {d.notes.map((n) => (
                      <p key={n} className={s.note}>
                        <span className={s.lbl}>Расхождение</span>
                        <Rich text={n} tagClass={tag} />
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>

          <div ref={cardRef} className={s.card}>
            <span className={s.stain} style={{ backgroundImage: url(smudge), width: 56, height: 56, right: 20, bottom: 14, opacity: 0.4, rotate: "70deg" }} aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.clip} src={srcOf(clip)} alt="" />
            <span className={s.cardHd}>
              <span>Карточка учёта</span>
              <span>
                Ящик {drawerNo} · № {String(cardNo).padStart(2, "0")}
              </span>
            </span>
            <h3>{d.name}</h3>
            <dl>
              {d.aka.length > 0 && (
                <>
                  <dt>Прозвища</dt>
                  <dd>{d.aka.join(" · ")}</dd>
                </>
              )}
              <dt>Группа</dt>
              <dd>{group && !d.group.includes(group) ? `${group} · ${d.group}` : d.group}</dd>
              {(d.immortal === "true" || d.immortal === "partial") && (
                <>
                  <dt>Бессмертие</dt>
                  <dd className={s.red}>{d.immortal === "true" ? "подтверждено" : "частичное"}</dd>
                </>
              )}
            </dl>
          </div>

          {d.quotes.length > 0 && (
            <aside className={s.quote} aria-label="Собственные слова">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.clip} src={srcOf(clip)} alt="" />
              <span className={s.lbl}>Собственные слова · выписка</span>
              {d.quotes.map((q) => (
                <q key={q}>{q}</q>
              ))}
            </aside>
          )}
        </div>
      </div>

      <div className={s.foot}>
        <NavButton back onClick={requestClose} label="Вернуть карточку в ящик">
          В ящик
        </NavButton>
      </div>

      {/* вынутый документ */}
      <div className={`${s.veil} ${doc || schema ? s.on : ""}`} onClick={putBack} aria-hidden />
      <section ref={docRef} className={`${s.doc} ${doc ? s.show : ""}`} aria-hidden={!doc}>
        {doc === "said" && (
          <>
            {put}
            {kick}
            <h3>Показания</h3>
            <ol className={s.pg} key={page}>
              {pages[page].map((x) => (
                <li key={x.text}>
                  <span className={s.who}>{who(x.who)}</span>
                  <p className={s.typed}>
                    <Rich text={x.text} tagClass={tag} />
                  </p>
                </li>
              ))}
            </ol>
            {pages.length > 1 && (
              <div className={s.leaf}>
                <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  ← Предыдущий
                </button>
                <span aria-live="polite">
                  лист {page + 1} из {pages.length}
                </span>
                <button type="button" disabled={page === pages.length - 1} onClick={() => setPage(page + 1)}>
                  Следующий →
                </button>
              </div>
            )}
          </>
        )}
        {doc === "chron" && (
          <>
            {put}
            {kick}
            <h3>Ход дела</h3>
            {d.branches.map((b) => (
              <div key={b.title}>
                <p className={`${s.typed} ${s.sub}`}>{b.title}</p>
                <ol className={s.route}>
                  {sentences(b.text).map((x, i) => (
                    <li key={i}>
                      <span>{i + 1}.</span>
                      <p className={s.typed}>
                        <Rich text={x} tagClass={tag} />
                      </p>
                    </li>
                  ))}
                  {b.end && (
                    <li className={s.end}>
                      <span>итог</span>
                      <p className={s.typed}>
                        <Rich text={cap(b.end)} tagClass={tag} />
                      </p>
                    </li>
                  )}
                </ol>
              </div>
            ))}
          </>
        )}
        {doc === "skills" && (
          <>
            {put}
            {kick}
            <h3>Отмеченные приёмы</h3>
            <p className={`${s.typed} ${s.sub}`}>Отмечено по тексту дела.</p>
            <p className={s.typed} style={{ marginTop: 16 }}>
              <Rich text={cap(skills)} tagClass={tag} />
            </p>
            {neg && (
              <p className={s.note} style={{ marginTop: 18 }}>
                <span className={s.lbl}>На полях</span>
                {neg[0].trim()}
              </p>
            )}
          </>
        )}
      </section>

      {/* схема связей: лист, сложенный вчетверо */}
      <section className={`${s.schema} ${schema ? s.show : ""} ${size.wide ? "" : s.list}`} aria-hidden={!schema} aria-label="Схема связей">
        {schema && (
          <>
            <button type="button" className={s.fold} data-put onClick={putBack}>
              Сложить схему ✕
            </button>
            <p className={s.sct}>
              <b>Связи</b>
              <span>
                {nodes.length} {plural(nodes.length, "лицо", "лица", "лиц")} · {groups} {plural(groups, "группа", "группы", "групп")} по ящикам картотеки
              </span>
            </p>
            {size.wide && (
              <svg className={s.lines} viewBox={`0 0 ${W} ${H}`} aria-hidden>
                {placed.map((o, i) => (
                  <path key={i} d={o.line} className={o.id ? undefined : s.dash} />
                ))}
              </svg>
            )}
            <div className={s.hub} style={size.wide ? { left: cx, top: cy } : undefined}>
              <span>
                Ящик {drawerNo} · {group}
              </span>
              <b>{d.name}</b>
            </div>
            <div className={s.nodes}>
              {placed.map((o, i) => (
                <div key={o.n + i} className={`${s.node} ${o.id ? "" : s.outer}`} style={size.wide ? { left: o.x, top: o.y } : undefined}>
                  <span className={s.g}>{o.g}</span>
                  {o.id ? (
                    <button type="button" className={s.n} onClick={() => onOpen(o.id!)} aria-label={`${o.n} — открыть досье`}>
                      {o.n}
                      <Ring k={i + 1} />
                    </button>
                  ) : (
                    <span className={s.n}>{o.n}</span>
                  )}
                  <span className={s.r}>
                    <Rich text={o.rel} tagClass={tag} />
                  </span>
                </div>
              ))}
            </div>
            <div className={s.key}>
              <span>
                <svg viewBox="0 0 46 8" aria-hidden>
                  <path d="M2 4H44" />
                </svg>
                обведено — есть карточка
              </span>
              <span>
                <svg viewBox="0 0 46 8" aria-hidden>
                  <path d="M2 4H44" className={s.dash} />
                </svg>
                вне картотеки
              </span>
            </div>
          </>
        )}
      </section>

      <div className={s.light} aria-hidden />
      <div className={s.warm} aria-hidden />

      <div className={s.bar}>
        {back && (
          <NavButton back onClick={back.go} label={`Назад к досье: ${back.name}`}>
            {back.name}
          </NavButton>
        )}
        <NavButton back={!back} onClick={requestClose} label="Вернуть карточку в ящик">
          В ящик
        </NavButton>
      </div>
    </div>
  );
}
