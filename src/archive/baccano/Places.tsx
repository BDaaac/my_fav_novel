import Image from "next/image";
import type { Case } from "@/data/baccano/cases";
import c from "./case.module.css";

const TILT = [-1.6, 1.1, -0.6, 1.8, -1.2, 0.7, -1.9, 1.3];

/** 1930: фотоотпечатки мест, разложенные на столе; подпись — на поле отпечатка. */
export function Prints({ places }: { places: Case["places"] }) {
  return (
    <ul className={c.prints}>
      {places.map((p, i) => (
        <li
          key={p.id}
          className={c.print}
          style={{ ["--tilt" as string]: `${TILT[i % TILT.length]}deg` }}
        >
          <span className={c.printImg}>
            <Image
              src={`/art/baccano/places/${p.id}.webp`}
              alt=""
              fill
              sizes="(max-width: 760px) 88vw, 320px"
              className={c.coverImg}
            />
          </span>
          <b>{p.name}</b>
          <span>{p.note}</span>
        </li>
      ))}
    </ul>
  );
}

/** 1931: путевой лист экспресса — пункты маршрута в порядке хода, без выдуманного расписания. */
export function Route({
  places,
  date,
}: {
  places: Case["places"];
  date: string;
}) {
  return (
    <div className={c.route}>
      <Image
        src="/art/baccano/paper.webp"
        alt=""
        fill
        sizes="(max-width: 760px) 94vw, 980px"
        className={c.tex}
      />
      <div className={c.routeHead}>
        <span>Путевой лист</span>
        <b>«Флайинг Пуссифут»</b>
        <span>{date}</span>
      </div>
      <ol className={c.routeList}>
        {places.map((p, i) => (
          <li key={p.id}>
            <span className={c.routeMark}>
              {i === 0
                ? "Отправление"
                : i === places.length - 1
                  ? "Прибытие"
                  : "В пути"}
            </span>
            <b>{p.name}</b>
            <span>{p.note}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
