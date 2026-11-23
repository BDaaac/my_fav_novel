import Image from "next/image";
import Link from "next/link";
import { NavLink } from "./NavLink";
import type { Case } from "@/data/baccano/cases";
import s from "./baccano.module.css";

const ART = {
  "1930": {
    folder: "/art/baccano/folder-1930.webp",
    h: 1008,
    photo: "/art/baccano/ny1930-street.webp",
    pos: "88% 50%",
  },
  "1931": {
    folder: "/art/baccano/folder-1931.webp",
    h: 1001,
    photo: "/art/baccano/express-bridge-1931.webp",
    pos: "70% 50%",
  },
} as const;

/**
 * Стол агентства: две картонные папки дел. Папка — один объект (картон, наклейка,
 * вклеенная вырезка, снимок под скрепкой, штамп), который целиком поворачивается и
 * приподнимается; нажатие открывает дело отдельной страницей.
 */
export function CaseSelect({ cases }: { cases: (Case & { count: number })[] }) {
  return (
    <main className={s.desk}>
      <div className={s.deskBg} aria-hidden>
        <Image
          src="/art/baccano/desk.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className={s.cover}
        />
      </div>

      <div className={s.deskNav}>
        <NavLink href="/" back>
          Зал музея
        </NavLink>
      </div>

      <header className={s.deskHead}>
        <p className={s.cap}>Информационное агентство · Манхэттен</p>
        <h1 className={s.deskTitle}>
          Шумиха<i>!</i>
        </h1>
        <p className={s.deskSub}>
          Выберите дело. Каждое открывается отдельной страницей.
        </p>
      </header>

      <div className={s.folders}>
        {cases.map((c, i) => {
          const art = ART[c.arc];
          return (
            <Link
              key={c.slug}
              href={`/books/baccano/${c.slug}`}
              className={`${s.folder} ${c.arc === "1930" ? s.f1930 : s.f1931}`}
              style={{ ["--tilt" as string]: i ? "1.8deg" : "-2.4deg" }}
            >
              <span className={s.folderObj}>
                <Image
                  src={art.folder}
                  alt=""
                  width={760}
                  height={art.h}
                  sizes="(max-width: 760px) 86vw, 380px"
                  className={s.folderBase}
                />
                <span className={s.label}>
                  <span className={s.labelNo}>{c.no}</span>
                  <span className={s.labelTitle}>{c.title}</span>
                  <span className={s.labelDate}>{c.date}</span>
                </span>
                <span className={s.snapShadow} aria-hidden />
                <span className={s.snap}>
                  <span className={s.snapImg}>
                    <Image
                      src={art.photo}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 64vw, 280px"
                      className={s.cover}
                      style={{ objectPosition: art.pos }}
                    />
                  </span>
                </span>
                <Image
                  src="/art/baccano/paperclip.webp"
                  alt=""
                  width={180}
                  height={174}
                  className={s.clip}
                />
                <span className={s.slip}>
                  <span>
                    <i>{c.lead}</i>
                  </span>
                </span>
                <span className={s.note}>
                  {c.count} досье
                  <span className={s.noteOpen}>открыть дело →</span>
                </span>
                <span className={s.folderStamp}>{c.volumes}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
