import fs from "node:fs";
import path from "node:path";
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
  return <Desk dossiers={loadDossiers()} portraits={portraits()} />;
}
