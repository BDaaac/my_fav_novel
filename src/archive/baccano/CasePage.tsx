"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Car, Case } from "@/data/baccano/cases";
import type { CaseDossier } from "@/data/baccano/types";
import { Cabinet } from "./Cabinet";
import { NavLink } from "./NavLink";
import { Prints, Route } from "./Places";
import { Train } from "./Train";
import s from "./baccano.module.css";
import c from "./case.module.css";

export function CasePage({
  data,
  dossiers,
  train,
}: {
  data: Case;
  dossiers: CaseDossier[];
  train?: Car[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [car, setCar] = useState<string>(train?.[4]?.id ?? "");

  // открытая справка живёт в адресе (#id), чтобы ссылкой можно было поделиться
  useEffect(() => {
    const read = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      setOpenId(dossiers.some((d) => d.id === id) ? id : null);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [dossiers]);

  const open = useCallback((id: string) => {
    history.pushState(null, "", `#${id}`);
    setOpenId(id);
  }, []);
  const close = useCallback(() => {
    history.pushState(null, "", location.pathname + location.search);
    setOpenId(null);
  }, []);

  return (
    <main className={s.case} data-case={data.arc}>
      <nav className={s.caseNav}>
        <NavLink href="/books/baccano" back>
          Все дела
        </NavLink>
        <NavLink href="/">Зал музея</NavLink>
      </nav>

      <header className={s.hero}>
        <Image
          src={
            data.arc === "1930"
              ? "/art/baccano/ny1930-street.webp"
              : "/art/baccano/express-1931.webp"
          }
          alt=""
          fill
          priority
          sizes="100vw"
          className={s.heroScene}
        />
        <div className={s.heroText}>
          <p className={s.cap}>
            {data.no} · {data.volumes} · {data.date}
          </p>
          <h1 className={s.heroTitle}>{data.title}</h1>
          <p className={s.heroLead}>{data.lead}</p>
        </div>
      </header>

      <div className={c.board} data-case={data.arc}>
        {/* стол агентства остаётся под бумагами, пока страница прокручивается */}
        <div className={c.boardBg} aria-hidden>
          <span className={c.boardBgIn}>
            <Image
              src="/art/baccano/desk.webp"
              alt=""
              fill
              sizes="100vw"
              className={c.coverImg}
            />
          </span>
        </div>

        {train && (
          <section id="sostav" className={c.section} aria-labelledby="bc-train">
            <h2 id="bc-train" className={c.word}>
              Состав
            </h2>
            <Train train={train} car={car} setCar={setCar} />
          </section>
        )}

        <section id="mesta" className={c.section} aria-labelledby="bc-places">
          <h2 id="bc-places" className={c.word}>
            {train ? "Маршрут" : "Места"}
          </h2>
          {train ? (
            <Route places={data.places} date={data.date} />
          ) : (
            <Prints places={data.places} />
          )}
        </section>

        <section
          id="kartoteka"
          className={c.section}
          aria-labelledby="bc-files"
        >
          <h2 id="bc-files" className={c.word}>
            Картотека
          </h2>
          <Cabinet
            dossiers={dossiers}
            factions={data.factions}
            caseNo={data.no}
            openId={openId}
            open={open}
            close={close}
          />
        </section>

        <footer className={c.foot}>
          Справки составлены по тексту томов{" "}
          {data.volumes.replace("Тома ", "").replace("Том ", "")}. Портреты
          готовятся.
        </footer>
      </div>

    </main>
  );
}
