import fs from "node:fs";
import path from "node:path";
import { People } from "@/archive/people/People";
import type { Guest } from "@/archive/people/GuestCard";

export const metadata = { title: "Картотека · Гости отеля «Пионер»" };
export const dynamic = "force-dynamic"; // карточки подхватываются из файлов без пересборки

export default function ArchivePeople() {
  let art: string[] = [];
  try {
    art = fs.readdirSync(path.join(process.cwd(), "public/art/people"));
  } catch {}
  // тексты карточек: по файлу на гостя; битый или недописанный файл пропускаем
  const guests: Record<string, Guest> = {};
  const dir = path.join(process.cwd(), "src/data/guests");
  try {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const g = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Guest;
        if (g?.id && Array.isArray(g.about) && g.blessing) guests[g.id] = { ...g, registry: g.registry ?? [], legacies: g.legacies ?? [], items: g.items ?? [], blessing: { ...g.blessing, text: g.blessing.text ?? [], limits: g.blessing.limits ?? [] } };
      } catch {}
    }
  } catch {}
  // оборот, пометки на полях и вклад лежат отдельными файлами и подмешиваются к карточке
  const extra = (sub: string, apply: (g: Guest, d: Record<string, unknown>) => void) => {
    try {
      for (const f of fs.readdirSync(path.join(dir, sub))) {
        if (!f.endsWith(".json")) continue;
        try {
          const d = JSON.parse(fs.readFileSync(path.join(dir, sub, f), "utf8"));
          if (guests[d?.id]) apply(guests[d.id], d);
        } catch {}
      }
    } catch {}
  };
  const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
  extra("back", (g, d) => (g.back = { rooms: arr(d.rooms), deaths: arr(d.deaths) }));
  extra("extra", (g, d) => {
    g.links = arr<NonNullable<Guest["links"]>[number]>(d.links).filter((l) => l.to !== g.id);
    g.merits = arr(d.merits);
  });
  extra("feats", (g, d) => {
    const best = d.best as NonNullable<Guest["feats"]>["best"];
    g.feats = { best: best?.title && best.text ? best : undefined, more: arr(d.more) };
  });
  return <People art={art} guests={guests} />;
}
