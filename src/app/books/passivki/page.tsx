import fs from "node:fs";
import path from "node:path";
import { preload } from "react-dom";
import { Desk } from "@/archive/passivki/Desk";
import { loadDossiers } from "@/archive/passivki/load";

/** Портреты появляются по мере утверждения: у кого файла ещё нет, в окне таблички стоит буква. */
function portraits(): string[] {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public/art/passivki/portraits"))
      .filter((f) => f.endsWith(".webp"))
      .map((f) => f.slice(0, -5));
  } catch {
    return [];
  }
}

export default function Page() {
  const dirs = loadDossiers();
  const has = new Set(portraits());
  preload("/art/passivki/start-bg.webp", { as: "image", fetchPriority: "high" });
  preload("/art/passivki/slip.webp", { as: "image" });
  preload("/art/passivki/tablet-wood.webp", { as: "image" });
  preload("/art/passivki/tablet-iron.webp", { as: "image" });
  for (const d of dirs.slice(0, 9)) {
    if (has.has(d.id)) preload(`/art/passivki/portraits/${d.id}.webp`, { as: "image" });
  }
  return <Desk dossiers={dirs} portraits={[...has]} />;
}
