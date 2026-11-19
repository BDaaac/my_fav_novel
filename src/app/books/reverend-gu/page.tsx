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
      {/* возврат в музей: маленькая лакированная табличка с киноварной печатью 归 — «вернуться» */}
      <Link
        href="/"
        aria-label="Вернуться в зал музея"
        className="group fixed left-4 top-4 z-40 flex items-center gap-2.5 rounded-[3px] py-1.5 pl-1.5 pr-3.5 opacity-80 transition-[opacity,transform] duration-300 ease-out hover:-translate-y-0.5 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none md:left-6 md:top-6"
        style={{
          background: "linear-gradient(oklch(0.2 0.02 40 / 0.92), oklch(0.13 0.015 40 / 0.92))",
          boxShadow: "inset 0 0 0 1px oklch(0.72 0.1 80 / 0.6), 0 8px 18px oklch(0.06 0.01 200 / 0.6)",
        }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-[oklch(0.5_0.17_28)] font-brush text-[17px] leading-none text-[oklch(0.95_0.02_80)] transition-transform duration-300 group-hover:rotate-[-6deg]">归</span>
        <span className="leading-none">
          <span className="block font-kurale text-[15px] text-[oklch(0.84_0.1_82)]">Зал музея</span>
          <span className="mt-0.5 block font-book text-[8.5px] uppercase tracking-[0.3em] text-[oklch(0.78_0.09_80/0.6)]">вернуться</span>
        </span>
      </Link>
      <Scroll vols={vols} art={art} />
    </>
  );
}
