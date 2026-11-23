import fs from "node:fs";
import path from "node:path";
import type { Case } from "@/data/baccano/cases";
import { forArc, type CaseDossier, type Dossier } from "@/data/baccano/types";

const dir = () => path.join(process.cwd(), "src/data/baccano/dossiers");

function all(): Dossier[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir()).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const out: Dossier[] = [];
  for (const f of files) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(dir(), f), "utf8")) as Dossier;
      if (d?.id && d.name) out.push(d);
    } catch {}
  }
  return out;
}

/** Досье дела в порядке групп (как в утверждённом составе), каждое — в состоянии на конец дела. */
export function loadCase(c: Case): CaseDossier[] {
  const byId = new Map(all().filter((d) => d.arcs.includes(c.arc)).map((d) => [d.id, d]));
  const ordered = c.factions.flatMap((f) => f.ids).filter((id) => byId.has(id));
  const rest = [...byId.keys()].filter((id) => !ordered.includes(id)).sort();
  return [...ordered, ...rest].map((id) => forArc(byId.get(id)!, c.arc));
}

export function countFor(c: Case) {
  return all().filter((d) => d.arcs.includes(c.arc)).length;
}
