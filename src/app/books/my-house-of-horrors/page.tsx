import fs from "node:fs";
import path from "node:path";
import { HorrorScene } from "@/archive/horror/scene/HorrorScene";
import type { BoardCharacter, House } from "@/archive/horror/scene/types";

export const metadata = { title: "Мой дом ужасов" };

type BoardFile = { houses: { id: string; label: string; side: string }[]; characters: { id: string; name: string }[] };

/** Разделы доски — стороны из досье (живые, призраки, враги, пациенты); снимок — портрет из досье. */
function load(): House[] {
  const root = path.join(process.cwd(), "src/data/horror");
  let board: BoardFile = { houses: [], characters: [] };
  try {
    board = JSON.parse(fs.readFileSync(path.join(root, "board/board.json"), "utf8"));
  } catch {}
  const dossiers = new Map<string, { side?: string; portrait?: string }>();
  try {
    for (const f of fs.readdirSync(path.join(root, "dossier")).filter((f) => f.endsWith(".json"))) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(root, "dossier", f), "utf8"));
        dossiers.set(f.slice(0, -5), { side: d?.side, portrait: d?.art?.portrait });
      } catch {}
    }
  } catch {}
  return (board.houses ?? []).map((h) => ({
    id: h.id,
    label: h.label,
    characters: (board.characters ?? [])
      .filter((c) => dossiers.get(c.id)?.side === h.side)
      .map((c): BoardCharacter => ({ ...c, portrait: dossiers.get(c.id)?.portrait, dossier: true })),
  }));
}

export default function Page() {
  return <HorrorScene houses={load()} />;
}
