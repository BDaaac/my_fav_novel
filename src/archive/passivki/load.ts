import fs from "node:fs";
import path from "node:path";
import type { Dossier } from "@/data/passivki/types";
import index from "@/data/passivki/index.json";

const dir = () => path.join(process.cwd(), "src/data/passivki/dossiers");

/** Все досье тома в порядке рейки (index.json), прочитанные на сервере при сборке. */
export function loadDossiers(): Dossier[] {
  const out: Dossier[] = [];
  for (const h of index as { id: string }[]) {
    try {
      out.push(JSON.parse(fs.readFileSync(path.join(dir(), `${h.id}.json`), "utf8")) as Dossier);
    } catch {}
  }
  return out;
}
