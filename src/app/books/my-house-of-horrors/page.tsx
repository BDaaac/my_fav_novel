import fs from "node:fs";
import path from "node:path";
import { preload } from "react-dom";
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
  const houses = load();
  // Предзагружаем фон доски, таблички и первые 8 портретов, чтобы на первом кадре не было пустых окон
  preload("/art/horror/scene/scene.webp", { as: "image", fetchPriority: "high" });
  preload("/art/horror/scene/tab-on.webp", { as: "image" });
  preload("/art/horror/scene/tab-off.webp", { as: "image" });
  for (const c of (houses[0]?.characters ?? []).slice(0, 8)) {
    if (c.portrait) preload(c.portrait, { as: "image", fetchPriority: "high" });
  }
  return <HorrorScene houses={houses} />;
}
