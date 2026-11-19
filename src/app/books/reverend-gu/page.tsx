import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Scroll } from "@/archive/gu/Scroll";
import type { Cultivator } from "@/data/gu/types";
import { VOLUMES } from "@/data/gu/types";

export const metadata = { title: "Свиток героев · Преподобный Гу" };
export const dynamic = "force-dynamic"; // карточки подхватываются из файлов без пересборки

const arr = <T,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const ls = (dir: string) => {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
};

/** Недописанные поля становятся пустыми, чтобы карточка не падала. */
function tidy(h: Cultivator): Cultivator {
  return {
    ...h,
    order: h.order ?? 99,
    role: h.role ?? "minor",
    clan: h.clan ?? "",
    standing: h.standing ?? "",
    rank: h.rank ?? "",
    registry: arr(h.registry),
    about: arr(h.about),
    path: arr(h.path),
    gu: arr(h.gu),
    links: arr<Cultivator["links"][number]>(h.links).filter((l) => l.to !== h.id),
    moments: arr(h.moments),
    fate: h.fate ?? { status: "unknown", text: "", ch: [] },
    quotes: arr(h.quotes),
  };
}

/** Герои одного тома: по файлу на героя; битый файл пропускаем. */
function readVolume(dir: string): Record<string, Cultivator> {
  const out: Record<string, Cultivator> = {};
  for (const f of ls(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      const h = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Cultivator;
      if (h?.id && h.name) out[h.id] = tidy(h);
    } catch {}
  }
  return out;
}

export default function GuArchive() {
  const data = path.join(process.cwd(), "src/data/gu");
  const pics = path.join(process.cwd(), "public/art/gu");
  const vols = Object.fromEntries(VOLUMES.map(({ n }) => [n, readVolume(path.join(data, `v${n}`))]));
  const art = Object.fromEntries(VOLUMES.map(({ n }) => [n, ls(path.join(pics, `v${n}`))]));
  return (
    <>
      <Link href="/" className="fixed left-5 top-5 z-40 font-book text-[11px] uppercase tracking-[0.3em] text-[oklch(0.9_0.02_95/0.55)] transition-colors hover:text-[oklch(0.9_0.02_95)]">
        ← В зал музея
      </Link>
      <Scroll vols={vols} art={art} />
    </>
  );
}
