import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { preload } from "react-dom";
import { People } from "@/archive/people/People";
import type { Guest } from "@/archive/people/GuestCard";

export const metadata = { title: "Картотека · Гости отеля «Пионер»" };

const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const ls = (dir: string) => {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
};

/** Приводит карточку к полному виду: недописанные поля становятся пустыми. */
function tidy(g: Guest): Guest {
  return {
    ...g,
    registry: g.registry ?? [],
    legacies: g.legacies ?? [],
    items: g.items ?? [],
    blessing: { ...g.blessing, text: g.blessing.text ?? [], limits: g.blessing.limits ?? [] },
    back: g.back ? { rooms: arr(g.back.rooms), deaths: arr(g.back.deaths) } : undefined,
    links: g.links ? arr<NonNullable<Guest["links"]>[number]>(g.links).filter((l) => l.to !== g.id) : undefined,
    merits: g.merits ? arr(g.merits) : undefined,
    feats: g.feats ? { best: g.feats.best?.title && g.feats.best.text ? g.feats.best : undefined, more: arr(g.feats.more) } : undefined,
  };
}

/** Карточки одного этажа: по файлу на гостя; битый или недописанный файл пропускаем. */
function readFloor(dir: string): Record<string, Guest> {
  const guests: Record<string, Guest> = {};
  for (const f of ls(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const g = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Guest;
      if (g?.id && Array.isArray(g.about) && g.blessing) guests[g.id] = tidy(g);
    } catch {}
  }
  return guests;
}

export default function Catalogue() {
  const data = path.join(process.cwd(), "src/data/guests");
  const pics = path.join(process.cwd(), "public/art/people");

  // первый этаж: основная карточка плюс оборот, пометки на полях и подвиги отдельными файлами
  const first = readFloor(data);
  const extra = (sub: string, apply: (g: Guest, d: Record<string, unknown>) => void) => {
    for (const f of ls(path.join(data, sub))) {
      if (!f.endsWith(".json")) continue;
      try {
        const d = JSON.parse(fs.readFileSync(path.join(data, sub, f), "utf8"));
        if (first[d?.id]) apply(first[d.id], d);
      } catch {}
    }
  };
  extra("back", (g, d) => (g.back = { rooms: arr(d.rooms), deaths: arr(d.deaths) }));
  extra("extra", (g, d) => {
    g.links = arr<NonNullable<Guest["links"]>[number]>(d.links).filter((l) => l.to !== g.id);
    g.merits = arr(d.merits);
  });
  extra("feats", (g, d) => {
    const best = d.best as NonNullable<Guest["feats"]>["best"];
    g.feats = { best: best?.title && best.text ? best : undefined, more: arr(d.more) };
  });

  // второй и третий этажи: карточка этажа целиком в одном файле src/data/guests/f2|f3/<id>.json
  const floors = { 1: first, 2: readFloor(path.join(data, "f2")), 3: readFloor(path.join(data, "f3")) };
  const art = { 1: ls(pics), 2: ls(path.join(pics, "f2")), 3: ls(path.join(pics, "f3")) };
  for (const file of art[1].filter((f) => /\.(jpg|jpeg|webp)$/i.test(f)).slice(0, 4)) {
    preload(`/art/people/${file}`, { as: "image", fetchPriority: "high" });
  }
  return (
    <>
      <Link
        href="/"
        prefetch={false}
        className="fixed left-5 top-5 z-40 font-system text-[11px] tracking-[0.3em] text-[#e9e1d0]/55 transition-colors hover:text-[#e9e1d0] focus-visible:text-[#e9e1d0] focus-visible:outline-none"
      >
        ← К ПОЛКЕ
      </Link>
      <People art={art} floors={floors} />
    </>
  );
}
