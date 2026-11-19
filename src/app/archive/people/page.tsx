import fs from "node:fs";
import path from "node:path";
import { People } from "@/archive/people/People";
import type { Guest } from "@/archive/people/GuestCard";

export const metadata = { title: "Архив · Гости отеля" };
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
  return <People art={art} guests={guests} />;
}
